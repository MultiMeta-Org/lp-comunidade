import "server-only"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"

/**
 * Presença nas aulas (comunidade.lesson_progress).
 *
 * Nada aqui é cacheado entre requests: é dado por aluna, e uma marca de
 * conclusão que aparece com uma hora de atraso seria pior que não existir.
 *
 * Por que service client e não a sessão + RLS: a tabela não tem policy para
 * `authenticated` de propósito — a lista de quem assistiu o quê é da admin,
 * não da turma. Quem chama estas funções já passou pelo guard da página, e o
 * e-mail vem da sessão, nunca do cliente.
 */

const norm = (email: string) => email.toLowerCase().trim()

/**
 * Registra que a aluna ABRIU a aula. Idempotente: a primeira visita cria a
 * linha e as seguintes não mexem em nada — `first_viewed_at` é a primeira vez,
 * não a última.
 *
 * Nunca lança: é telemetria. Derrubar a página da aluna porque a contagem
 * falhou seria trocar um dado perdido por uma aula perdida.
 */
export async function markLessonViewed(email: string, lessonId: string): Promise<void> {
  const db = createComunidadeServiceClient()
  const { error } = await db
    .from("lesson_progress")
    .upsert(
      { lesson_id: lessonId, email: norm(email) },
      { onConflict: "lesson_id,email", ignoreDuplicates: true }
    )
  if (error) console.error("[progress] markLessonViewed:", error.message)
}

/**
 * Marca ou desmarca a conclusão. Desmarcar zera `completed_at` mas mantém a
 * linha: "abriu e não concluiu" é informação, e apagar a linha a perderia.
 *
 * O upsert só carrega as colunas do payload, então o `first_viewed_at` de quem
 * já tinha linha sobrevive.
 */
export async function setLessonCompleted(
  email: string,
  lessonId: string,
  done: boolean
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db.from("lesson_progress").upsert(
    {
      lesson_id: lessonId,
      email: norm(email),
      completed_at: done ? new Date().toISOString() : null,
    },
    { onConflict: "lesson_id,email" }
  )
  return error?.message ?? null
}

/** Ids das aulas que ESTA aluna já concluiu — para os selos da biblioteca. */
export async function getCompletedLessonIds(email: string): Promise<Set<string>> {
  const db = createComunidadeServiceClient()
  const { data, error } = await db
    .from("lesson_progress")
    .select("lesson_id")
    .eq("email", norm(email))
    .not("completed_at", "is", null)

  if (error) {
    console.error("[progress] getCompletedLessonIds:", error.message)
    return new Set()
  }
  return new Set((data ?? []).map((r) => r.lesson_id))
}

// ─────────────────────────────────────────────────────────────
// Leituras do /admin
// ─────────────────────────────────────────────────────────────

export type LessonStats = {
  /** Tamanho da turma: toda aluna ativa (aula aberta) ou só as do Laboratório. */
  elegiveis: number
  abriram: number
  concluiram: number
}

/**
 * Números de um conjunto de aulas, em UMA consulta — a lista do admin pede os
 * ids da página que está na tela, não da base inteira.
 */
export async function getLessonStats(
  lessonIds: string[]
): Promise<Map<string, LessonStats>> {
  const out = new Map<string, LessonStats>()
  if (lessonIds.length === 0) return out

  const db = createComunidadeServiceClient()
  const { data, error } = await db
    .from("lesson_progress_stats")
    .select("lesson_id, elegiveis, abriram, concluiram")
    .in("lesson_id", lessonIds)

  if (error) {
    console.error("[progress] getLessonStats:", error.message)
    return out
  }
  for (const row of data ?? []) {
    out.set(row.lesson_id, {
      elegiveis: row.elegiveis,
      abriram: row.abriram,
      concluiram: row.concluiram,
    })
  }
  return out
}

export type AlunaProgresso = {
  email: string
  buyerName: string | null
  firstViewedAt: string
  completedAt: string | null
}

/**
 * Quem abriu esta aula, concluídas primeiro.
 *
 * Sai de uma função no banco, e não de um select em `lesson_progress`, porque a
 * lista precisa usar a MESMA definição de turma dos números (ver
 * lesson_progress_stats): senão a admin leria "Concluíram (19)" em cima de uma
 * lista de 21 nomes — os dois extras sendo gente reembolsada depois de assistir.
 */
export async function getLessonPresentes(lessonId: string): Promise<AlunaProgresso[]> {
  const db = createComunidadeServiceClient()
  const { data, error } = await db.rpc("lesson_presentes", { p_lesson_id: lessonId })

  if (error) {
    console.error("[progress] getLessonPresentes:", error.message)
    return []
  }

  return (data ?? []).map((r) => ({
    email: r.email,
    buyerName: r.buyer_name,
    firstViewedAt: r.first_viewed_at,
    completedAt: r.completed_at,
  }))
}

/** Alunas da turma que nunca abriram esta aula (anti-join no banco). */
export async function getLessonAusentes(
  lessonId: string
): Promise<{ email: string; buyerName: string | null }[]> {
  const db = createComunidadeServiceClient()
  const { data, error } = await db.rpc("lesson_ausentes", { p_lesson_id: lessonId })

  if (error) {
    console.error("[progress] getLessonAusentes:", error.message)
    return []
  }
  return (data ?? []).map((r) => ({ email: r.email, buyerName: r.buyer_name }))
}
