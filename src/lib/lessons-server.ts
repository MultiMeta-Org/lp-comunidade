import "server-only"
import { createSupabaseServer } from "@/lib/supabase/server"
import type { Database } from "@/lib/supabase/database.types"
import { type Lesson, displayDate, SEED_LESSONS } from "@/lib/lessons"

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
    pdfUrl: row.pdf_url ?? "#",
    audioUrl: row.audio_url ?? "#",
  }
}

function supabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

/**
 * Aulas publicadas, mais recentes primeiro.
 * Lê de comunidade.lessons via sessão (RLS: só usuário com acesso liberado).
 * Sem Supabase configurado (esqueleto/dev), cai para SEED_LESSONS.
 */
export async function getLessons(): Promise<Lesson[]> {
  if (!supabaseConfigured()) return SEED_LESSONS

  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .schema("comunidade")
    .from("lessons")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: false })

  if (error) {
    console.error("[lessons] erro ao carregar:", error.message)
    return []
  }
  return (data ?? []).map(mapRow)
}

/** Uma aula por id (respeita RLS). */
export async function getLesson(id: string): Promise<Lesson | null> {
  if (!supabaseConfigured()) return SEED_LESSONS.find((l) => l.id === id) ?? null

  const supabase = await createSupabaseServer()
  const { data, error } = await supabase
    .schema("comunidade")
    .from("lessons")
    .select("*")
    .eq("id", id)
    .eq("published", true)
    .maybeSingle()

  if (error) {
    console.error("[lessons] erro ao carregar aula:", error.message)
    return null
  }
  return data ? mapRow(data) : null
}

/** Aula do topo (mais recente). */
export async function getToday(): Promise<Lesson | null> {
  const lessons = await getLessons()
  return lessons[0] ?? null
}
