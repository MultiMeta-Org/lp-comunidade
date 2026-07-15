import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"

/** Janela de liberação após a compra (dias). Padrão 7 (janela de reembolso). */
export function waitingPeriodDays(): number {
  const raw = Number(process.env.ACCESS_WAITING_PERIOD_DAYS)
  return Number.isFinite(raw) && raw >= 0 ? raw : 7
}

export type AccessState =
  | { authorized: true; reason: "released" }
  | { authorized: false; reason: "not_found" }
  | { authorized: false; reason: "revoked" }
  | { authorized: false; reason: "waiting"; availableAt: string }

/**
 * Fonte única da regra de acesso da Comunidade.
 * Um e-mail tem acesso liberado quando:
 *   • existe em comunidade.authorized_emails,
 *   • status = 'active' (não reembolsado),
 *   • já passaram os 7 dias desde authorized_at (order_date do Hotmart).
 *
 * Usado por: rota send-otp (portão do login) e painel admin (exibição de status).
 */
export async function getAccessState(email: string): Promise<AccessState> {
  const normalizedEmail = email.toLowerCase().trim()
  const db = createComunidadeServiceClient()

  const { data, error } = await db
    .from("authorized_emails")
    .select("status, authorized_at")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (error) {
    console.error("[access] erro ao consultar authorized_emails:", error.message)
    // Fail closed: sem certeza, não libera.
    return { authorized: false, reason: "not_found" }
  }

  if (!data) return { authorized: false, reason: "not_found" }
  if (data.status === "revoked") return { authorized: false, reason: "revoked" }

  const available = new Date(data.authorized_at)
  available.setDate(available.getDate() + waitingPeriodDays())

  if (new Date() < available) {
    return { authorized: false, reason: "waiting", availableAt: available.toISOString() }
  }

  return { authorized: true, reason: "released" }
}
