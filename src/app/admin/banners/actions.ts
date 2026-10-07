"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"
import { BANNERS_CACHE_TAG } from "@/lib/banners-server"

export type ActionResult = { ok: boolean; error?: string }

const BUCKET = "banners"
const STORAGE_PREFIX = "storage://"

/**
 * O carrossel vive na home e é cacheado pela tag. `{ expire: 0 }` = a próxima
 * visita já lê do banco, então o banner novo aparece na hora.
 */
function revalidateBanners() {
  revalidateTag(BANNERS_CACHE_TAG, { expire: 0 })
  revalidatePath("/admin/banners")
  revalidatePath("/admin")
  revalidatePath("/")
}

export type BannerInput = {
  /** null = criar. */
  id: string | null
  label: string
  imageUrl: string
  imageMobileUrl: string
  href: string
  cta: string
  alt: string
  active: boolean
  /** "AAAA-MM-DD" ou "" — vazio significa "sem limite desse lado". */
  startsOn: string
  endsOn: string
}

/**
 * "AAAA-MM-DD" → instante no fuso de São Paulo.
 *
 * Offset fixo -03:00 porque o Brasil não tem mais horário de verão; se voltar, é
 * aqui que muda. `fim` leva para o último segundo do dia: quem escreve "fica até
 * 31/10" quer o banner no ar durante o dia 31, não até a meia-noite que o abre.
 */
function instante(data: string, borda: "inicio" | "fim"): string | null {
  if (!data) return null
  const hora = borda === "inicio" ? "00:00:00" : "23:59:59"
  const d = new Date(`${data}T${hora}-03:00`)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

/** URL aceita: externa (http) ou arquivo no nosso Storage. */
function urlValida(v: string): boolean {
  return /^https?:\/\//i.test(v) || v.startsWith(STORAGE_PREFIX)
}

export async function upsertBanner(input: BannerInput): Promise<ActionResult> {
  await requireAdmin()

  const imageUrl = input.imageUrl.trim()
  const imageMobileUrl = input.imageMobileUrl.trim()
  const href = input.href.trim()

  if (!urlValida(imageUrl)) {
    return { ok: false, error: "Envie a imagem do banner (ou cole uma URL)." }
  }
  if (imageMobileUrl && !urlValida(imageMobileUrl)) {
    return { ok: false, error: "A imagem de celular não parece uma URL válida." }
  }
  if (!href) return { ok: false, error: "O banner precisa de um link de destino." }
  if (!/^(https?:\/\/|\/)/i.test(href)) {
    return { ok: false, error: "O link deve começar com https:// ou com / (rota do portal)." }
  }
  if (input.startsOn && input.endsOn && input.endsOn < input.startsOn) {
    return { ok: false, error: "A data final é anterior à inicial." }
  }

  const db = createComunidadeServiceClient()

  // Imagem substituída não pode virar órfã no bucket — guarda as antigas antes.
  const antigas: (string | null)[] = []
  if (input.id) {
    const { data: atual } = await db
      .from("banners")
      .select("image_url, image_mobile_url")
      .eq("id", input.id)
      .maybeSingle()
    if (atual) {
      if (atual.image_url !== imageUrl) antigas.push(atual.image_url)
      if (atual.image_mobile_url !== (imageMobileUrl || null)) {
        antigas.push(atual.image_mobile_url)
      }
    }
  }

  // Banner novo entra no fim da fila (a ordem se ajusta com as setas da lista).
  let sortOrder = 0
  if (!input.id) {
    const { data: ultimo } = await db
      .from("banners")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle()
    sortOrder = (ultimo?.sort_order ?? -1) + 1
  }

  const linha = {
    label: input.label.trim(),
    image_url: imageUrl,
    image_mobile_url: imageMobileUrl || null,
    href,
    cta: input.cta.trim() || "Saiba mais",
    alt: input.alt.trim(),
    active: input.active,
    starts_at: instante(input.startsOn, "inicio"),
    ends_at: instante(input.endsOn, "fim"),
  }

  const { error } = input.id
    ? await db.from("banners").update(linha).eq("id", input.id)
    : await db.from("banners").insert({ ...linha, sort_order: sortOrder })

  if (error) return { ok: false, error: error.message }

  for (const ref of antigas) if (ref) await removeBannerUpload(ref)

  revalidateBanners()
  return { ok: true }
}

export async function toggleBannerActive(
  id: string,
  active: boolean
): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db.from("banners").update({ active }).eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidateBanners()
  return { ok: true }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()

  const { data: atual } = await db
    .from("banners")
    .select("image_url, image_mobile_url")
    .eq("id", id)
    .maybeSingle()

  const { error } = await db.from("banners").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  if (atual) {
    await removeBannerUpload(atual.image_url)
    if (atual.image_mobile_url) await removeBannerUpload(atual.image_mobile_url)
  }

  revalidateBanners()
  return { ok: true }
}

/**
 * Sobe ou desce o banner uma posição.
 *
 * Em vez de trocar dois `sort_order`, reescreve a fila inteira como 0..N na
 * ordem nova. É uma gravação a mais e evita a classe de bug em que empates e
 * buracos antigos fazem a seta "não funcionar" — com um punhado de banners, o
 * custo é irrelevante.
 */
export async function moveBanner(id: string, dir: "up" | "down"): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()

  const { data, error } = await db
    .from("banners")
    .select("id, sort_order")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error) return { ok: false, error: error.message }

  const fila = (data ?? []).map((b) => b.id)
  const i = fila.indexOf(id)
  const j = dir === "up" ? i - 1 : i + 1
  if (i === -1 || j < 0 || j >= fila.length) return { ok: true }

  ;[fila[i], fila[j]] = [fila[j], fila[i]]

  for (let k = 0; k < fila.length; k++) {
    const { error: upErr } = await db
      .from("banners")
      .update({ sort_order: k })
      .eq("id", fila[k])
    if (upErr) return { ok: false, error: upErr.message }
  }

  revalidateBanners()
  return { ok: true }
}

export type UploadUrlResult =
  | { ok: true; bucket: string; path: string; token: string; ref: string }
  | { ok: false; error: string }

/**
 * Signed upload URL para a imagem ir do navegador DIRETO ao bucket, sem passar
 * pelo servidor Next (mesmo caminho dos PDFs — ver aulas/actions.ts).
 */
export async function createBannerUploadUrl(filename: string): Promise<UploadUrlResult> {
  await requireAdmin()

  const ext = (filename.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const path = `${crypto.randomUUID()}${ext ? `.${ext}` : ""}`

  const db = createComunidadeServiceClient()
  const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path)
  if (error || !data) {
    return { ok: false, error: error?.message || "Falha ao preparar o upload." }
  }
  return {
    ok: true,
    bucket: BUCKET,
    path: data.path,
    token: data.token,
    ref: `${STORAGE_PREFIX}${BUCKET}/${data.path}`,
  }
}

/** Apaga do Storage a imagem de um `ref` nosso. URL externa é ignorada. */
async function removeBannerUpload(ref: string): Promise<void> {
  if (!ref?.startsWith(STORAGE_PREFIX)) return
  const rest = ref.slice(STORAGE_PREFIX.length)
  const slash = rest.indexOf("/")
  if (slash === -1) return

  const db = createComunidadeServiceClient()
  const { error } = await db.storage
    .from(rest.slice(0, slash))
    .remove([rest.slice(slash + 1)])
  if (error) console.error("[banners] falha ao apagar imagem:", error.message)
}
