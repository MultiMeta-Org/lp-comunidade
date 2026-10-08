"use server"

import { revalidatePath } from "next/cache"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"

export type ActionResult = { ok: boolean; error?: string }

/** As duas rotas do admin que mostram acesso — ambas precisam reler. */
function revalidateAcessos() {
  revalidatePath("/admin/acessos")
  revalidatePath("/admin")
}

/**
 * Adiciona (ou reativa) um e-mail autorizado manualmente.
 * `authorized_at` = agora - 7 dias faz o acesso já nascer liberado (útil para
 * cadastros manuais em que a compra já passou da janela de reembolso).
 * Marque `waitFullPeriod` para respeitar os 7 dias a partir de agora.
 *
 * `comLab` dá também a assinatura, pelo caminho de cortesia (ver setLabAccess).
 */
export async function addAuthorizedEmail(
  email: string,
  opts?: { buyerName?: string; waitFullPeriod?: boolean; comLab?: boolean }
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

  if (opts?.comLab) {
    const res = await setLabAccess(normalized, true, "liberado junto com o acesso")
    if (!res.ok) return { ok: false, error: res.error }
  }

  revalidateAcessos()
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
  revalidateAcessos()
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
  revalidateAcessos()
  return { ok: true }
}

export type LabResult =
  | { ok: true; has: boolean }
  | { ok: false; has?: undefined; error: string }

/**
 * Dá ou tira o Laboratório de Vendas à mão.
 *
 * `has_comunidade_vip` é DERIVADA (comunidade.refresh_vip_entitlement): o sync
 * a recalcula a partir das compras. Escrever direto na coluna "funcionaria" até
 * o próximo sync desfazer — por isso a cortesia vive em comunidade.vip_grants,
 * que é um sinal positivo que a derivação respeita.
 *
 * Tirar remove a cortesia e manda recalcular. Se a aluna tem compra registrada
 * na Hotmart ou direito adquirido (comprou o Método antes de 23/07/2026), ela
 * CONTINUA com o Laboratório — e é por isso que esta action devolve o estado
 * depois do recálculo em vez de um "ok" seco: a tela precisa poder dizer que o
 * clique não bastou, e por quê.
 */
export async function setLabAccess(
  email: string,
  has: boolean,
  motivo = "cortesia dada no admin"
): Promise<LabResult> {
  await requireAdmin()

  const normalized = email.toLowerCase().trim()
  const db = createComunidadeServiceClient()

  if (has) {
    const { error } = await db
      .from("vip_grants")
      .upsert({ email: normalized, motivo }, { onConflict: "email" })
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await db.from("vip_grants").delete().eq("email", normalized)
    if (error) return { ok: false, error: error.message }
  }

  const { error: rpcError } = await db.rpc("refresh_vip_entitlement", {
    p_email: normalized,
  })
  if (rpcError) return { ok: false, error: rpcError.message }

  const { data } = await db
    .from("authorized_emails")
    .select("has_comunidade_vip")
    .eq("email", normalized)
    .maybeSingle()

  revalidateAcessos()
  return { ok: true, has: data?.has_comunidade_vip === true }
}

/**
 * Dá ou tira o Desafio 21 Dias à mão.
 *
 * Mesma mecânica do Laboratório (ver setLabAccess) e pelo mesmo motivo:
 * `has_desafio` é derivada, e escrever direto na coluna "funcionaria" até o
 * próximo sync desfazer. A cortesia vive em comunidade.desafio_grants, que é
 * o sinal positivo que a derivação respeita.
 *
 * Diferença em relação ao Laboratório: aqui NÃO existe direito adquirido. O
 * Desafio nasceu como produto próprio, então tirar a cortesia de quem não
 * comprou tira o produto de verdade — e o retorno pós-recálculo serve para a
 * tela poder dizer quando o clique não bastou (ela tem compra registrada).
 */
export async function setDesafioAccess(
  email: string,
  has: boolean,
  motivo = "cortesia dada no admin"
): Promise<LabResult> {
  await requireAdmin()

  const normalized = email.toLowerCase().trim()
  const db = createComunidadeServiceClient()

  if (has) {
    const { error } = await db
      .from("desafio_grants")
      .upsert({ email: normalized, motivo }, { onConflict: "email" })
    if (error) return { ok: false, error: error.message }
  } else {
    const { error } = await db.from("desafio_grants").delete().eq("email", normalized)
    if (error) return { ok: false, error: error.message }
  }

  const { error: rpcError } = await db.rpc("refresh_desafio_entitlement", {
    p_email: normalized,
  })
  if (rpcError) return { ok: false, error: rpcError.message }

  const { data } = await db
    .from("authorized_emails")
    .select("has_desafio")
    .eq("email", normalized)
    .maybeSingle()

  revalidateAcessos()
  return { ok: true, has: data?.has_desafio === true }
}
