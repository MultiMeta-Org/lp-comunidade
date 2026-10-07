import "server-only"
import { unstable_cache } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import type { Database } from "@/lib/supabase/database.types"
import { type Lesson, displayDate, toDirectMediaUrl, SEED_LESSONS } from "@/lib/lessons"

/** Tag de cache das aulas — as server actions do admin a invalidam ao publicar/editar. */
export const LESSONS_CACHE_TAG = "lessons"

type LessonRow = Database["comunidade"]["Tables"]["lessons"]["Row"]

/** Prefixo sentinela dos arquivos enviados pelo admin: `storage://<bucket>/<path>`. */
const STORAGE_PREFIX = "storage://"
/** Validade das signed URLs. Longa o bastante para sobreviver à janela de cache (1h). */
const SIGNED_URL_TTL = 60 * 60 * 24 * 7 // 7 dias

/**
 * Como tratar uma URL EXTERNA (arquivo no Storage sempre vira signed URL):
 *   • "download" → link direto de download (PDF).
 *   • "stream"   → link direto para tocar em <audio> (Drive vira uc?export=…).
 *   • "raw"      → inalterada. É o caso do vídeo: o player precisa do link
 *     original para montar o embed do Drive/YouTube (ver toVideoEmbedUrl).
 */
type MediaMode = "download" | "stream" | "raw"

/**
 * Resolve o valor guardado em pdf_url/audio_url/video_url para uma URL utilizável:
 *   • `storage://bucket/path` → signed URL do bucket privado (service client).
 *     `download` força o nome do arquivo ao baixar (relevante para PDF).
 *   • qualquer outra coisa → URL externa, tratada conforme `mode`.
 */
async function resolveMedia(
  db: ReturnType<typeof createComunidadeServiceClient>,
  value: string | null,
  mode: MediaMode
): Promise<string> {
  if (!value) return "#"
  if (!value.startsWith(STORAGE_PREFIX)) {
    return mode === "raw" ? value : toDirectMediaUrl(value)
  }

  const rest = value.slice(STORAGE_PREFIX.length)
  const slash = rest.indexOf("/")
  if (slash === -1) return "#"
  const bucket = rest.slice(0, slash)
  const path = rest.slice(slash + 1)

  const { data, error } = await db.storage
    .from(bucket)
    .createSignedUrl(path, SIGNED_URL_TTL, mode === "download" ? { download: true } : undefined)
  if (error || !data) {
    console.error("[lessons] falha ao assinar URL:", error?.message)
    return "#"
  }
  return data.signedUrl
}

/**
 * Alcance de quem está lendo:
 *   • "lab"    → assina o Laboratório de Vendas (ou é admin): acervo inteiro,
 *                com vídeo, áudio e PDF.
 *   • "aberto" → aluna do Método sem a assinatura: SÓ as aulas marcadas como
 *                `open_to_all` (o Plantão Tira Dúvidas) e SÓ o vídeo delas.
 *
 * O corte do PDF/áudio acontece aqui, não na página: a URL assinada seria
 * montada e enviada no HTML antes de qualquer `if` de interface.
 */
export type LessonsScope = "lab" | "aberto"

async function mapRow(
  db: ReturnType<typeof createComunidadeServiceClient>,
  row: LessonRow,
  scope: LessonsScope
): Promise<Lesson> {
  const aberto = scope === "aberto"
  const [pdfUrl, audioUrl, videoUrl] = await Promise.all([
    aberto ? "#" : resolveMedia(db, row.pdf_url, "download"),
    aberto ? "#" : resolveMedia(db, row.audio_url, "stream"),
    resolveMedia(db, row.video_url, "raw"),
  ])
  return {
    id: row.id,
    dia: row.dia,
    isoDate: row.iso_date,
    date: displayDate(row.iso_date),
    weekday: row.weekday,
    topic: row.topic,
    category: row.category,
    description: row.description,
    pdfUrl,
    audioUrl,
    videoUrl,
    openToAll: row.open_to_all,
  }
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Leitura das aulas publicadas, cacheada ENTRE requests (unstable_cache).
 *
 * Por que service client em vez da sessão + RLS: o conteúdo das aulas é idêntico
 * para todo aluno autorizado, então não precisa ser por-usuário. As páginas já
 * gateiam o acesso com requireReleasedAccess() ANTES de chamar isto, então o RLS
 * era redundante — e, crucial, o service client não lê cookies, o que permite
 * cachear o resultado entre requests (unstable_cache não pode tocar cookies).
 *
 * Antes: uma query em comunidade.lessons a cada navegação (home + cada /dia/[id]).
 * Agora: uma leitura de memória; só bate no banco quando a tag é revalidada.
 */
const readPublishedLessons = unstable_cache(
  async (scope: LessonsScope): Promise<Lesson[]> => {
    const db = createComunidadeServiceClient()
    let query = db.from("lessons").select("*").eq("published", true)
    if (scope === "aberto") query = query.eq("open_to_all", true)

    const { data, error } = await query.order("sort_order", { ascending: false })

    if (error) {
      console.error("[lessons] erro ao carregar:", error.message)
      return []
    }
    return Promise.all((data ?? []).map((row) => mapRow(db, row, scope)))
  },
  // `scope` entra na chave sozinho (unstable_cache usa os argumentos), então as
  // duas listas são entradas separadas e a mesma tag invalida as duas.
  ["published-lessons"],
  { tags: [LESSONS_CACHE_TAG], revalidate: 3600 }
)

/** SEED filtrado pelo alcance — fallback de quando não há Supabase. */
function seedFor(scope: LessonsScope): Lesson[] {
  if (scope === "lab") return SEED_LESSONS
  return SEED_LESSONS.filter((l) => l.openToAll).map((l) => ({
    ...l,
    pdfUrl: "#",
    audioUrl: "#",
  }))
}

/**
 * Aulas visíveis para este alcance, mais recentes primeiro.
 * Sem Supabase configurado (esqueleto/dev), cai para SEED_LESSONS.
 */
export async function getLessons(scope: LessonsScope = "lab"): Promise<Lesson[]> {
  if (!supabaseConfigured()) return seedFor(scope)
  return readPublishedLessons(scope)
}

/** Uma aula por id — servida da lista cacheada (sem query extra). */
export async function getLesson(
  id: string,
  scope: LessonsScope = "lab"
): Promise<Lesson | null> {
  const lessons = await getLessons(scope)
  return lessons.find((l) => l.id === id) ?? null
}

/** Aula do topo (mais recente) dentro do alcance. */
export async function getToday(scope: LessonsScope = "lab"): Promise<Lesson | null> {
  const lessons = await getLessons(scope)
  return lessons[0] ?? null
}

/**
 * Aula + vizinhas para a navegação da página de detalhe.
 * A lista vem da mais recente para a mais antiga, então o índice anterior
 * é o dia seguinte (mais novo) e o próximo é o dia anterior (mais antigo).
 */
export async function getLessonWithNeighbors(
  id: string,
  scope: LessonsScope = "lab"
): Promise<{
  lesson: Lesson | null
  older: Lesson | null
  newer: Lesson | null
}> {
  const lessons = await getLessons(scope)
  const i = lessons.findIndex((l) => l.id === id)
  if (i === -1) return { lesson: null, older: null, newer: null }
  return {
    lesson: lessons[i],
    newer: i > 0 ? lessons[i - 1] : null,
    older: i < lessons.length - 1 ? lessons[i + 1] : null,
  }
}
