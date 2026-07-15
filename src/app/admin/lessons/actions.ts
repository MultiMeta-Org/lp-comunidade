"use server"

import { revalidatePath } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"
import type { CategoryKey } from "@/lib/lessons"

export type ActionResult = { ok: boolean; error?: string }

export type LessonInput = {
  id: string
  dia: number
  isoDate: string
  weekday: string
  topic: string
  category: CategoryKey
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

  const id = input.id.trim()
  if (!id) return { ok: false, error: "ID obrigatório (ex.: dia-13)." }
  if (!input.topic.trim()) return { ok: false, error: "Tópico obrigatório." }
  if (!input.isoDate) return { ok: false, error: "Data obrigatória." }

  const db = createComunidadeServiceClient()
  const { error } = await db.from("lessons").upsert(
    {
      id,
      dia: input.dia,
      iso_date: input.isoDate,
      weekday: input.weekday.trim(),
      topic: input.topic.trim(),
      category: input.category,
      description: input.description.trim(),
      pdf_url: input.pdfUrl.trim() || null,
      audio_url: input.audioUrl.trim() || null,
      published: input.published,
      sort_order: input.dia,
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
