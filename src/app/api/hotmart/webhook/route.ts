import { NextRequest, NextResponse } from "next/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"

export const runtime = "nodejs"

/**
 * POST /api/hotmart/webhook
 * Webhook (Postback) do Hotmart — mantém comunidade.authorized_emails em dia.
 *
 * PURCHASE_APPROVED / PURCHASE_COMPLETE → autoriza (source 'hotmart').
 *   authorized_at ancora no `order_date` (data real da compra), então o gate de
 *   7 dias conta a partir da compra, não da chegada do webhook. Eventos repetidos
 *   (replay / approved→complete) NÃO resetam authorized_at de uma linha já ativa.
 *
 * PURCHASE_REFUNDED / PURCHASE_CHARGEBACK → status='revoked' (perde o acesso).
 *
 * A Comunidade VIP é produto à parte na Hotmart: compra dela liga
 * `has_comunidade_vip`, reembolso dela SÓ desliga a flag — o acesso ao portal
 * é do Método e não cai junto. Quais ids são a VIP está em
 * comunidade.vip_products, a mesma tabela que a derivação do banco consulta
 * (comunidade.refresh_vip_entitlement) — uma fonte só para os dois caminhos.
 *
 * O MESMO postback da VIP também chega no webhook do CRM. Por isso todo evento
 * dela é registrado em comunidade.vip_purchases: a derivação lê as duas origens
 * e usa a mais recente, então o portal concede sozinho e o cron não desfaz.
 * Sem esse registro, o desacoplamento seria só aparente.
 *
 * Configurar no Hotmart o header `x-hotmart-hottok` = HOTMART_HOTTOK.
 */

interface HotmartPayload {
  id?: string
  event?: string
  data?: {
    product?: { id?: number }
    purchase?: { transaction?: string; order_date?: number }
    buyer?: {
      email?: string
      name?: string
      first_name?: string
      last_name?: string
      phone?: string
    }
  }
}

export async function POST(req: NextRequest) {
  // 1. Valida o hottok.
  const hottok = req.headers.get("x-hotmart-hottok")
  const expected = process.env.HOTMART_HOTTOK
  if (!expected || !hottok || hottok !== expected) {
    console.error("[hotmart] hottok inválido ou ausente")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: HotmartPayload
  try {
    body = (await req.json()) as HotmartPayload
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const buyerEmail = body.data?.buyer?.email?.toLowerCase().trim()
  if (!buyerEmail) {
    return NextResponse.json({ received: true, ignored: true, reason: "No buyer email" })
  }

  const buyerName =
    body.data?.buyer?.name ||
    `${body.data?.buyer?.first_name || ""} ${body.data?.buyer?.last_name || ""}`.trim() ||
    null
  const buyerPhone = body.data?.buyer?.phone || null
  const transactionId = body.data?.purchase?.transaction || null
  const productId = body.data?.product?.id?.toString() || null

  // order_date (ms desde epoch) = data real da compra; ancora o gate de 7 dias.
  const orderDateMs = body.data?.purchase?.order_date
  const purchaseTimestamp =
    typeof orderDateMs === "number" && orderDateMs > 0
      ? new Date(orderDateMs).toISOString()
      : new Date().toISOString()

  const db = createComunidadeServiceClient()

  /** Guarda o evento da VIP para a derivação enxergar o que o portal recebeu. */
  const registraEventoVip = async () => {
    const { error } = await db.from("vip_purchases").insert({
      email: buyerEmail,
      hotmart_product_id: productId,
      transaction_id: transactionId,
      event_type: body.event ?? "DESCONHECIDO",
      occurred_at: purchaseTimestamp,
    })
    if (error) console.error("[hotmart] registro da compra VIP falhou:", error.message)
  }

  // A compra é da assinatura VIP? Decide o que o evento mexe. A lista mora em
  // comunidade.vip_products: id de produto é dado, não código, e a Nati
  // cadastra uma oferta nova sem deploy.
  let isVipProduct = false
  if (productId) {
    const { data: vip } = await db
      .from("vip_products")
      .select("hotmart_product_id")
      .eq("hotmart_product_id", productId)
      .maybeSingle()
    isVipProduct = Boolean(vip)
  }

  // O id do produto sai no log de todo evento: é assim que se descobre o
  // número de uma oferta nova para cadastrar em comunidade.vip_products.
  console.log(
    `[hotmart] ${body.event} · produto ${productId ?? "?"}${isVipProduct ? " (VIP)" : ""} · ${buyerEmail}`
  )

  try {
    switch (body.event) {
      case "PURCHASE_APPROVED":
      case "PURCHASE_COMPLETE": {
        const { data: existing, error: fetchError } = await db
          .from("authorized_emails")
          .select("id, status")
          .eq("email", buyerEmail)
          .maybeSingle()

        if (fetchError) {
          console.error("[hotmart] fetch error:", fetchError.message)
          return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        // Só (re)define authorized_at na 1ª autorização ou reativação após revogar.
        // Evento repetido numa linha já ativa: atualiza metadados, mantém a contagem.
        const shouldSetAuthorizedAt = !existing || existing.status === "revoked"

        const baseFields = {
          email: buyerEmail,
          status: "active" as const,
          source: "hotmart",
          hotmart_transaction_id: transactionId,
          hotmart_product_id: productId,
          buyer_name: buyerName,
          phone: buyerPhone,
          revoked_at: null,
          // Compra da VIP liga a assinatura. Compra de outro produto não
          // mexe na flag: quem já tem o grupo não o perde comprando mais.
          ...(isVipProduct ? { has_comunidade_vip: true } : {}),
        }

        // Aluna que já tinha o Método e agora assinou a VIP: só liga a flag.
        // Sobrescrever transação e produto apagaria o registro da compra do
        // Método, que é o que ancora o acesso dela.
        if (isVipProduct && existing) {
          await registraEventoVip()
          const { error } = await db
            .from("authorized_emails")
            .update({
              status: "active",
              revoked_at: null,
              has_comunidade_vip: true,
              // Linha revogada que volta pela VIP recomeça a contagem dos 7
              // dias — senão Marketplace e Notion abririam de cara.
              ...(existing.status === "revoked"
                ? { authorized_at: purchaseTimestamp }
                : {}),
              ...(buyerName ? { buyer_name: buyerName } : {}),
              ...(buyerPhone ? { phone: buyerPhone } : {}),
            })
            .eq("email", buyerEmail)
          if (error) {
            console.error("[hotmart] update VIP error:", error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
          console.log(`[hotmart] Comunidade VIP liberada: ${buyerEmail}`)
          return NextResponse.json({
            received: true,
            status: "vip_granted",
            email: buyerEmail,
          })
        }

        if (isVipProduct) await registraEventoVip()

        if (shouldSetAuthorizedAt) {
          const { error } = await db
            .from("authorized_emails")
            .upsert(
              { ...baseFields, authorized_at: purchaseTimestamp },
              { onConflict: "email" }
            )
          if (error) {
            console.error("[hotmart] upsert error:", error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
        } else {
          const { error } = await db
            .from("authorized_emails")
            .update(baseFields)
            .eq("email", buyerEmail)
          if (error) {
            console.error("[hotmart] update error:", error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
        }

        // Extensão futura: agendar e-mail "seu acesso liberou" para
        // order_date + 7 dias (marketplace usa uma fila + cron). Fora de escopo agora.

        console.log(
          `[hotmart] ${shouldSetAuthorizedAt ? "autorizado" : "atualizado"}: ${buyerEmail}`
        )
        return NextResponse.json({ received: true, status: "authorized", email: buyerEmail })
      }

      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK": {
        // Reembolso da assinatura VIP: perde o grupo e o material, mantém o
        // portal — o acesso dela vem da compra do Método, que segue de pé.
        if (isVipProduct) {
          await registraEventoVip()
          const { error } = await db
            .from("authorized_emails")
            .update({ has_comunidade_vip: false })
            .eq("email", buyerEmail)
          if (error) {
            console.error("[hotmart] revoke VIP error:", error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
          console.log(`[hotmart] Comunidade VIP revogada: ${buyerEmail}`)
          return NextResponse.json({
            received: true,
            status: "vip_revoked",
            email: buyerEmail,
          })
        }

        const { error } = await db
          .from("authorized_emails")
          .update({ status: "revoked", revoked_at: new Date().toISOString() })
          .eq("email", buyerEmail)
        if (error) {
          console.error("[hotmart] revoke error:", error.message)
          return NextResponse.json({ error: "Database error" }, { status: 500 })
        }
        console.log(`[hotmart] revogado: ${buyerEmail}`)
        return NextResponse.json({ received: true, status: "revoked", email: buyerEmail })
      }

      default:
        console.log(`[hotmart] evento ignorado: ${body.event}`)
        return NextResponse.json({ received: true, ignored: true })
    }
  } catch (error) {
    console.error("[hotmart] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
