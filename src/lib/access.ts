import { cache } from "react"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"

/**
 * Linha do e-mail em comunidade.authorized_emails, lida UMA vez por request
 * (React cache). getAccessState e getFeatureUnlock compartilham esta leitura —
 * antes o /hub batia na mesma tabela duas vezes por navegação.
 */
const fetchAuthorizedRow = cache(async (email: string) => {
  const db = createComunidadeServiceClient()
  return db
    .from("authorized_emails")
    .select("status, authorized_at, buyer_name, has_comunidade_vip")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle()
})

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
 * A espera de 7 dias NÃO gateia o acesso geral — vale só para o Notion
 * (ver getFeatureUnlock).
 *
 * Usado por: rota send-otp (portão do login) e painel admin (exibição de status).
 */
export async function getAccessState(email: string): Promise<AccessState> {
  const { data, error } = await fetchAuthorizedRow(email)

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
 * Desbloqueio do Notion "no 8º dia": libera `waitingPeriodDays()` (7) dias
 * após a compra — mesma âncora do acesso (authorized_at). Contagem regressiva
 * real, por usuário, lida do DB.
 *
 * O Marketplace SAIU desta trava: toda aluna autorizada já é autorizada lá
 * (marketplace.authorized_emails espelha a mesma base), então o cadeado só
 * escondia uma porta que estava aberta. O card leva direto à home do
 * marketplace.
 */
export async function getFeatureUnlock(email: string): Promise<FeatureUnlock> {
  const { data } = await fetchAuthorizedRow(email)

  if (!data || data.status !== "active") {
    return { unlocked: false, daysRemaining: 0, unlockAt: null }
  }

  const unlockAt = new Date(data.authorized_at)
  unlockAt.setDate(unlockAt.getDate() + waitingPeriodDays())

  const msLeft = unlockAt.getTime() - Date.now()
  const daysRemaining = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)))

  return { unlocked: msLeft <= 0, daysRemaining, unlockAt: unlockAt.toISOString() }
}

/**
 * Aluna tem o Laboratório de Vendas (a assinatura que já se chamou Comunidade
 * VIP) — o grupo no WhatsApp e o material de aulas.
 *
 * Manda no grupo e no acervo (/aulas, /dia/[id]), com UMA exceção: o vídeo das
 * aulas marcadas como `open_to_all` (o Plantão Tira Dúvidas) vale para toda
 * aluna autorizada. O restante do portal é do Método.
 *
 * A coluna continua `has_comunidade_vip` — o rótulo mudou, o banco não (ver
 * src/lib/produto.ts). É derivada das compras por
 * comunidade.refresh_vip_entitlement, com as cortesias de comunidade.vip_grants
 * como sinal positivo que sobrevive ao sync.
 *
 * Sai da MESMA leitura memoizada do acesso — sem query extra.
 */
export async function hasLab(email: string): Promise<boolean> {
  const { data } = await fetchAuthorizedRow(email)
  return data?.status === "active" && data.has_comunidade_vip === true
}

/**
 * Reconcilia a posse do Laboratório de Vendas para ESTE e-mail, com o que já está no
 * banco (comunidade.refresh_vip_entitlement) — consulta local e barata.
 *
 * NÃO pergunta à Hotmart. Perguntar no login custaria uma chamada de rede em
 * toda entrada, para um caso raro: o postback já libera em segundos, e quem
 * comprou com a aba aberta tem o botão "já assinei" na home. Cobrar latência
 * de todas as alunas para cobrir minutos de exceção é mau negócio.
 */
export async function refreshVipEntitlement(email: string): Promise<void> {
  const db = createComunidadeServiceClient()
  const { error } = await db.rpc("refresh_vip_entitlement", { p_email: email })
  if (error) {
    console.error("[access] refresh_vip_entitlement falhou:", error.message)
  }
}

/**
 * Primeiro nome da aluna (de authorized_emails.buyer_name), para a saudação
 * do Hub. Sai da MESMA leitura memoizada do acesso — sem query extra.
 * Retorna null quando a Hotmart não mandou nome.
 */
export async function getMemberFirstName(email: string): Promise<string | null> {
  const { data } = await fetchAuthorizedRow(email)
  const first = data?.buyer_name?.trim().split(/\s+/)[0]
  if (!first) return null
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase()
}
