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
 * Acesso é imediato a partir da compra (dia 1); só se perde no reembolso.
 * Um e-mail tem acesso quando existe em comunidade.authorized_emails com
 * status = 'active' (não reembolsado/chargeback).
 *
 * A espera de 7 dias NÃO gateia o acesso geral — vale só para Marketplace/
 * Notion (ver getFeatureUnlock).
 *
 * Usado por: rota send-otp (portão do login) e painel admin (exibição de status).
 */
export async function getAccessState(email: string): Promise<AccessState> {
  const normalizedEmail = email.toLowerCase().trim()
  const db = createComunidadeServiceClient()

  const { data, error } = await db
    .from("authorized_emails")
    .select("status")
    .eq("email", normalizedEmail)
    .maybeSingle()

  if (error) {
    console.error("[access] erro ao consultar authorized_emails:", error.message)
    // Fail closed: sem certeza, não libera.
    return { authorized: false, reason: "not_found" }
  }

  if (!data) return { authorized: false, reason: "not_found" }
  if (data.status === "revoked") return { authorized: false, reason: "revoked" }

  return { authorized: true, reason: "released" }
}

export type FeatureUnlock = {
  unlocked: boolean
  daysRemaining: number
  unlockAt: string | null
}

/**
 * Desbloqueio das features "no 8º dia" (Marketplace, Notion): liberam
 * `waitingPeriodDays()` (7) dias após a compra — mesma âncora do acesso
 * (authorized_at). Contagem regressiva real, por usuário, lida do DB.
 */
export async function getFeatureUnlock(email: string): Promise<FeatureUnlock> {
  const db = createComunidadeServiceClient()
  const { data } = await db
    .from("authorized_emails")
    .select("authorized_at, status")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle()

  if (!data || data.status !== "active") {
    return { unlocked: false, daysRemaining: 0, unlockAt: null }
  }

  const unlockAt = new Date(data.authorized_at)
  unlockAt.setDate(unlockAt.getDate() + waitingPeriodDays())

  const msLeft = unlockAt.getTime() - Date.now()
  const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

  return { unlocked: msLeft <= 0, daysRemaining, unlockAt: unlockAt.toISOString() }
}
