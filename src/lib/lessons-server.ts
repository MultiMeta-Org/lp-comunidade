import "server-only"
import { unstable_cache } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import type { Database } from "@/lib/supabase/database.types"
import { type Lesson, displayDate, toDirectMediaUrl, SEED_LESSONS } from "@/lib/lessons"

/** Tag de cache das aulas — as server actions do admin a invalidam ao publicar/editar. */
export const LESSONS_CACHE_TAG = "lessons"

type LessonRow = Database["comunidade"]["Tables"]["lessons"]["Row"]

function mapRow(row: LessonRow): Lesson {
  return {
    id: row.id,
    dia: row.dia,
    isoDate: row.iso_date,
    date: displayDate(row.iso_date),
    weekday: row.weekday,
    topic: row.topic,
    category: row.category,
    description: row.description,
    pdfUrl: toDirectMediaUrl(row.pdf_url ?? "#"),
    audioUrl: toDirectMediaUrl(row.audio_url ?? "#"),
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
  async (): Promise<Lesson[]> => {
    const db = createComunidadeServiceClient()
    const { data, error } = await db
      .from("lessons")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: false })

    if (error) {
      console.error("[lessons] erro ao carregar:", error.message)
      return []
    }
    return (data ?? []).map(mapRow)
  },
  ["published-lessons"],
  { tags: [LESSONS_CACHE_TAG], revalidate: 3600 }
)

/**
 * Aulas publicadas, mais recentes primeiro.
 * Sem Supabase configurado (esqueleto/dev), cai para SEED_LESSONS.
 */
export async function getLessons(): Promise<Lesson[]> {
  if (!supabaseConfigured()) return SEED_LESSONS
  return readPublishedLessons()
}

/** Uma aula por id — servida da lista cacheada (sem query extra). */
export async function getLesson(id: string): Promise<Lesson | null> {
  if (!supabaseConfigured()) return SEED_LESSONS.find((l) => l.id === id) ?? null
  const lessons = await getLessons()
  return lessons.find((l) => l.id === id) ?? null
}

/** Aula do topo (mais recente). */
export async function getToday(): Promise<Lesson | null> {
  const lessons = await getLessons()
  return lessons[0] ?? null
}

/**
 * Aula + vizinhas para a navegação da página de detalhe.
 * A lista vem da mais recente para a mais antiga, então o índice anterior
 * é o dia seguinte (mais novo) e o próximo é o dia anterior (mais antigo).
 */
export async function getLessonWithNeighbors(id: string): Promise<{
  lesson: Lesson | null
  older: Lesson | null
  newer: Lesson | null
}> {
  const lessons = await getLessons()
  const i = lessons.findIndex((l) => l.id === id)
  if (i === -1) return { lesson: null, older: null, newer: null }
  return {
    lesson: lessons[i],
    newer: i > 0 ? lessons[i - 1] : null,
    older: i < lessons.length - 1 ? lessons[i + 1] : null,
  }
}
