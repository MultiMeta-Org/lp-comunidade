"use server"

import { revalidatePath, revalidateTag } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"
import { LESSONS_CACHE_TAG } from "@/lib/lessons-server"
import { weekdayFromIso } from "@/lib/lessons"

/**
 * Invalida o cache das aulas (home + /dia) e revalida as rotas do admin.
 * `{ expire: 0 }` = expiração imediata: a próxima visita já lê do banco, então
 * a edição da admin aparece na hora (sem stale-while-revalidate).
 */
function revalidateLessons() {
  revalidateTag(LESSONS_CACHE_TAG, { expire: 0 })
  revalidatePath("/admin")
  revalidatePath("/")
}

export type ActionResult = { ok: boolean; error?: string }

export type LessonInput = {
  id: string
  dia: number
  isoDate: string
  weekday: string
  topic: string
  category: string
  description: string
  pdfUrl: string
  audioUrl: string
  videoUrl: string
  published: boolean
}

/** Tipo de mídia enviável → bucket privado correspondente. */
const UPLOAD_BUCKETS = { pdf: "pdfs", audio: "audios", video: "videos" } as const
export type UploadKind = keyof typeof UPLOAD_BUCKETS

/** Coluna de `lessons` que guarda a referência de cada tipo de mídia. */
const MEDIA_COLUMNS = {
  pdf: "pdf_url",
  audio: "audio_url",
  video: "video_url",
} as const

/** Prefixo sentinela usado em pdf_url/audio_url para arquivos no Storage. */
const STORAGE_PREFIX = "storage://"

/**
 * Cria ou atualiza uma aula (CMS da Paola).
 * `id` textual no formato "dia-N"; `sort_order` acompanha o número do dia.
 * pdfUrl/audioUrl são URLs (Storage ou externas). Upload direto de arquivo
 * é uma extensão futura (ver TODO no admin).
 */
export async function upsertLesson(input: LessonInput): Promise<ActionResult> {
  await requireAdmin()

  if (!input.topic.trim()) return { ok: false, error: "Tópico obrigatório." }
  if (!input.isoDate) return { ok: false, error: "Data obrigatória." }

  const dia = input.dia
  // id e dia da semana são derivados — o admin não digita mais (issues #5/#6/#7).
  const id = input.id.trim() || `dia-${dia}`
  const category = input.category.trim() || "Geral"

  const db = createComunidadeServiceClient()
  const { error } = await db.from("lessons").upsert(
    {
      id,
      dia,
      iso_date: input.isoDate,
      weekday: weekdayFromIso(input.isoDate),
      topic: input.topic.trim(),
      category,
      description: input.description.trim(),
      pdf_url: input.pdfUrl.trim() || null,
      audio_url: input.audioUrl.trim() || null,
      video_url: input.videoUrl.trim() || null,
      published: input.published,
      sort_order: dia,
    },
    { onConflict: "id" }
  )

  if (error) return { ok: false, error: error.message }
  revalidateLessons()
  return { ok: true }
}

/** Caminho novo (único) dentro do bucket: `<aula>/<uuid>.<ext>`. */
function uploadPath(lessonId: string, filename: string): string {
  const ext = (filename.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "")
  const safeId = (lessonId || "aula").replace(/[^a-z0-9-]/gi, "")
  return `${safeId}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`
}

/** `storage://bucket/path` → `{ bucket, path }` (null para URL externa/inválida). */
function parseStorageRef(ref: string): { bucket: string; path: string } | null {
  if (!ref?.startsWith(STORAGE_PREFIX)) return null
  const rest = ref.slice(STORAGE_PREFIX.length)
  const slash = rest.indexOf("/")
  if (slash === -1) return null
  return { bucket: rest.slice(0, slash), path: rest.slice(slash + 1) }
}

export type UploadUrlResult =
  | { ok: true; bucket: string; path: string; token: string; ref: string }
  | { ok: false; error: string }

/**
 * Gera uma signed upload URL para o navegador enviar o arquivo DIRETO ao
 * bucket privado (sem passar pelo servidor Next — evita o limite de body das
 * Server Actions e escala para áudios grandes). O client faz
 * `storage.from(bucket).uploadToSignedUrl(path, token, file)` e depois grava
 * `ref` (= `storage://bucket/path`) no campo pdf_url/audio_url da aula.
 *
 * Vídeo NÃO usa este caminho: arquivo grande sobe por TUS (resumable), que não
 * aceita signed URL — ver `createLessonUploadTicket` e `src/lib/video-upload.ts`.
 */
export async function createLessonUploadUrl(
  kind: UploadKind,
  lessonId: string,
  filename: string
): Promise<UploadUrlResult> {
  await requireAdmin()

  const bucket = UPLOAD_BUCKETS[kind]
  if (!bucket) return { ok: false, error: "Tipo de arquivo inválido." }

  const path = uploadPath(lessonId, filename)

  const db = createComunidadeServiceClient()
  const { data, error } = await db.storage.from(bucket).createSignedUploadUrl(path)
  if (error || !data) {
    return { ok: false, error: error?.message || "Falha ao preparar o upload." }
  }
  return {
    ok: true,
    bucket,
    path: data.path,
    token: data.token,
    ref: `${STORAGE_PREFIX}${bucket}/${data.path}`,
  }
}

export type UploadTicketResult =
  | { ok: true; bucket: string; path: string }
  | { ok: false; error: string }

/**
 * Reserva bucket + caminho para um upload resumável (TUS). Diferente da signed
 * upload URL, não há token aqui: o envio é autorizado pelo access token do
 * próprio admin, e a RLS do bucket restringe a escrita à allowlist de admins.
 * Esta action existe para (a) revalidar que quem pede é admin e (b) manter a
 * convenção de nomes dos caminhos num lugar só.
 */
export async function createLessonUploadTicket(
  kind: UploadKind,
  lessonId: string,
  filename: string
): Promise<UploadTicketResult> {
  await requireAdmin()

  const bucket = UPLOAD_BUCKETS[kind]
  if (!bucket) return { ok: false, error: "Tipo de arquivo inválido." }

  return { ok: true, bucket, path: uploadPath(lessonId, filename) }
}

export type AttachResult =
  | { ok: true; attached: boolean }
  | { ok: false; attached: false; error: string }

/**
 * Grava a referência de um upload concluído na aula.
 *
 * Existe porque o upload de vídeo é longo e independente do formulário: ele
 * continua mesmo com o modal fechado, então ao terminar não há draft para
 * receber o valor. Quando a aula já existe, escrevemos direto no banco
 * (`attached: true`) e apagamos o arquivo antigo. Quando a aula ainda não foi
 * salva, devolvemos `attached: false` — o painel de uploads avisa que falta
 * salvar, e o formulário adota a referência ao ser reaberto.
 */
export async function attachLessonMedia(
  lessonId: string,
  kind: UploadKind,
  ref: string
): Promise<AttachResult> {
  await requireAdmin()

  const parsed = parseStorageRef(ref)
  if (!parsed || parsed.bucket !== UPLOAD_BUCKETS[kind]) {
    return { ok: false, attached: false, error: "Referência de arquivo inválida." }
  }
  const column = MEDIA_COLUMNS[kind]

  const db = createComunidadeServiceClient()
  const { data: existing, error: readError } = await db
    .from("lessons")
    .select("pdf_url, audio_url, video_url")
    .eq("id", lessonId)
    .maybeSingle()
  if (readError) return { ok: false, attached: false, error: readError.message }
  if (!existing) return { ok: true, attached: false }

  const { error } = await db
    .from("lessons")
    .update({ [column]: ref } as Record<typeof column, string>)
    .eq("id", lessonId)
  if (error) return { ok: false, attached: false, error: error.message }

  // Substituiu um arquivo nosso? Apaga o antigo — vídeo pesa, não pode virar órfão.
  const previous = existing[column]
  if (previous && previous !== ref) await removeLessonUpload(previous)

  revalidateLessons()
  return { ok: true, attached: true }
}

/**
 * Remove um arquivo do Storage a partir do seu `ref` (`storage://bucket/path`).
 * Chamado quando o admin troca/remove um upload, para não deixar órfãos.
 * URLs externas (não-storage) são ignoradas silenciosamente.
 */
export async function removeLessonUpload(ref: string): Promise<ActionResult> {
  await requireAdmin()

  const parsed = parseStorageRef(ref)
  if (!parsed) return { ok: true }

  const db = createComunidadeServiceClient()
  const { error } = await db.storage.from(parsed.bucket).remove([parsed.path])
  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function togglePublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db.from("lessons").update({ published }).eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidateLessons()
  return { ok: true }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db.from("lessons").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }

  // Recompacta os números das aulas (dia) para não deixar buraco: 1, 2, 3, …
  // O id textual é uma chave estável (não muda), então URLs não quebram.
  const renumberError = await renumberLessons(db)
  if (renumberError) return { ok: false, error: renumberError }

  revalidateLessons()
  return { ok: true }
}

/**
 * Reatribui `dia`/`sort_order` sequencialmente (1..N) na ordem atual das aulas,
 * fechando qualquer buraco deixado por uma exclusão. Atualiza só as que mudaram.
 * Processa em ordem crescente: como estamos compactando para baixo, o novo número
 * de cada linha é sempre menor que o número (ainda intacto) das seguintes — sem
 * colisão, mesmo que exista índice único em dia.
 */
async function renumberLessons(
  db: ReturnType<typeof createComunidadeServiceClient>
): Promise<string | null> {
  const { data, error } = await db
    .from("lessons")
    .select("id, dia")
    .order("dia", { ascending: true })
  if (error) return error.message

  const rows = data ?? []
  for (let i = 0; i < rows.length; i++) {
    const newDia = i + 1
    if (rows[i].dia === newDia) continue
    const { error: upErr } = await db
      .from("lessons")
      .update({ dia: newDia, sort_order: newDia })
      .eq("id", rows[i].id)
    if (upErr) return upErr.message
  }
  return null
}
