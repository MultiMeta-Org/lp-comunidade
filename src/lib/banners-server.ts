import "server-only"
import { unstable_cache } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"

/** Tag de cache dos banners — as actions do admin a invalidam ao salvar. */
export const BANNERS_CACHE_TAG = "banners"

/** Prefixo sentinela dos arquivos enviados pelo admin: `storage://<bucket>/<path>`. */
const STORAGE_PREFIX = "storage://"

export type Banner = {
  id: string
  imageUrl: string
  /** Arte vertical do celular. Null = usa a de desktop com recorte central. */
  imageMobileUrl: string | null
  href: string
  cta: string
  alt: string
}

/**
 * `storage://banners/<path>` → URL pública do bucket. Diferente de PDF/áudio/
 * vídeo, aqui não há URL assinada: o bucket é público de propósito (banner é
 * peça de divulgação), e assim a imagem é servida pelo CDN e fica no cache do
 * navegador em vez de expirar junto com a assinatura.
 *
 * Qualquer outro valor é tratado como URL externa e passa inalterado.
 */
export function resolveBannerImage(
  db: ReturnType<typeof createComunidadeServiceClient>,
  value: string | null
): string | null {
  if (!value) return null
  if (!value.startsWith(STORAGE_PREFIX)) return value

  const rest = value.slice(STORAGE_PREFIX.length)
  const slash = rest.indexOf("/")
  if (slash === -1) return null

  const { data } = db.storage.from(rest.slice(0, slash)).getPublicUrl(rest.slice(slash + 1))
  return data.publicUrl
}

type BannerLinha = Banner & { startsAt: string | null; endsAt: string | null }

/**
 * Banners LIGADOS (active), com as imagens já resolvidas. A vigência não entra
 * aqui de propósito: o resultado é cacheado entre requests, e um `now()` lido
 * dentro do cache congelaria junto — um banner marcado para acabar no domingo
 * sobreviveria até a próxima revalidação. A janela é conferida na saída.
 */
const readBannersAtivos = unstable_cache(
  async (): Promise<BannerLinha[]> => {
    const db = createComunidadeServiceClient()
    const { data, error } = await db
      .from("banners")
      .select("*")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })

    if (error) {
      console.error("[banners] erro ao carregar:", error.message)
      return []
    }

    return (data ?? []).map((b) => ({
      id: b.id,
      imageUrl: resolveBannerImage(db, b.image_url) ?? "",
      imageMobileUrl: resolveBannerImage(db, b.image_mobile_url),
      href: b.href,
      cta: b.cta,
      alt: b.alt,
      startsAt: b.starts_at,
      endsAt: b.ends_at,
    }))
  },
  ["banners-ativos"],
  { tags: [BANNERS_CACHE_TAG], revalidate: 3600 }
)

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/** Banner está no ar agora? Janela aberta dos dois lados quando nula. */
export function bannerNoAr(
  b: { startsAt: string | null; endsAt: string | null },
  now = new Date()
): boolean {
  if (b.startsAt && new Date(b.startsAt) > now) return false
  if (b.endsAt && new Date(b.endsAt) <= now) return false
  return true
}

/**
 * Os banners que a home deve mostrar agora, na ordem da admin.
 *
 * Lista vazia é esperada e não é problema: o carrossel continua com os slides
 * fixos de src/lib/home.ts, que existem justamente para o mês em que ninguém
 * lembrou de cadastrar nada.
 */
export async function getBanners(now = new Date()): Promise<Banner[]> {
  if (!supabaseConfigured()) return []
  const linhas = await readBannersAtivos()
  return linhas
    .filter((b) => b.imageUrl && bannerNoAr(b, now))
    .map((b) => ({
      id: b.id,
      imageUrl: b.imageUrl,
      imageMobileUrl: b.imageMobileUrl,
      href: b.href,
      cta: b.cta,
      alt: b.alt,
    }))
}
