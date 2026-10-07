"use server"

import { revalidatePath } from "next/cache"
import { requireLessonsViewer } from "@/lib/guard"
import { getLesson } from "@/lib/lessons-server"
import { setLessonCompleted } from "@/lib/progress-server"

export type ActionResult = { ok: boolean; error?: string }

/**
 * Marca/desmarca a aula como concluída para a aluna da sessão.
 *
 * O e-mail NUNCA vem do cliente — sai do guard, igual às páginas. E a aula é
 * relida com o alcance de quem está pedindo: sem isso, uma aluna sem o
 * Laboratório poderia marcar como concluída (e, de tabela, provar que teve
 * acesso a) uma aula que não pode abrir, bastando um POST com o id.
 */
export async function toggleLessonCompleted(
  lessonId: string,
  done: boolean
): Promise<ActionResult> {
  const { email, scope } = await requireLessonsViewer()

  const lesson = await getLesson(lessonId, scope)
  if (!lesson) return { ok: false, error: "Aula não encontrada." }

  const error = await setLessonCompleted(email, lessonId, done)
  if (error) return { ok: false, error }

  revalidatePath("/aulas")
  revalidatePath(`/dia/${lessonId}`)
  return { ok: true }
}
