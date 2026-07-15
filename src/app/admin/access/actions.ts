"use server"

import { revalidatePath } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"

export type ActionResult = { ok: boolean; error?: string }

/**
 * Adiciona (ou reativa) um e-mail autorizado manualmente.
 * `authorized_at` = agora - 7 dias faz o acesso já nascer liberado (útil para
 * cadastros manuais em que a compra já passou da janela de reembolso).
 * Marque `waitFullPeriod` para respeitar os 7 dias a partir de agora.
 */
export async function addAuthorizedEmail(
  email: string,
  opts?: { buyerName?: string; waitFullPeriod?: boolean }
): Promise<ActionResult> {
  await requireAdmin()

  const normalized = email.toLowerCase().trim()
  if (!normalized || !normalized.includes("@")) {
    return { ok: false, error: "E-mail inválido." }
  }

  const db = createComunidadeServiceClient()
  const authorizedAt = opts?.waitFullPeriod
    ? new Date().toISOString()
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await db.from("authorized_emails").upsert(
    {
      email: normalized,
      status: "active",
      source: "manual",
      authorized_at: authorizedAt,
      revoked_at: null,
      buyer_name: opts?.buyerName ?? null,
    },
    { onConflict: "email" }
  )

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin")
  return { ok: true }
}

export async function revokeAccess(email: string): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db
    .from("authorized_emails")
    .update({ status: "revoked", revoked_at: new Date().toISOString() })
    .eq("email", email.toLowerCase().trim())

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin")
  return { ok: true }
}

export async function reactivateAccess(email: string): Promise<ActionResult> {
  await requireAdmin()
  const db = createComunidadeServiceClient()
  const { error } = await db
    .from("authorized_emails")
    .update({ status: "active", revoked_at: null })
    .eq("email", email.toLowerCase().trim())

  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin")
  return { ok: true }
}
