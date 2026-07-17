"use server"

import { revalidatePath } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"
import { weekdayFromIso } from "@/lib/lessons"

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
  published: boolean
}

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
      published: input.published,
      sort_order: dia,
    },
    { onConflict: "id" }
  )

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin")
  revalidatePath("/")
  return { ok: true }
}

export async function togglePublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db.from("lessons").update({ published }).eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin")
  revalidatePath("/")
  return { ok: true }
}

export async function deleteLesson(id: string): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db.from("lessons").delete().eq("id", id)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin")
  revalidatePath("/")
  return { ok: true }
}
