import { NextRequest, NextResponse } from "next/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { lerPostback } from "@/lib/hotmart-postback"
import { MAPA_NAME } from "@/lib/produto"

export const runtime = "nodejs"

/**
 * POST /testemapadir
 * Postback da Hotmart do Mapa de Direção Profissional — o endereço que está
 * cadastrado no produto, por isso fora de /api (e fora do proxy, ver
 * src/proxy.ts: sem isso a Hotmart levaria um redirect para o /login).
 *
 * O Mapa é o primeiro produto que dá o portal SEM o Método. Quem compra só ele
 * entra, vê o Mapa como dela e todo o resto travado, à venda. A diferença mora
 * em duas colunas de authorized_emails:
 *   • has_mapa   — liga na compra, desliga no reembolso. Só esta rota escreve.
 *   • has_metodo — false para quem chegou aqui sem o Método. Quem já era aluna
 *     comprando o Mapa não perde nada.
 *
 * A rota já diz qual é o produto, então o id dele não precisa estar cadastrado
 * antes: o primeiro postback o grava em comunidade.mapa_products, que é onde o
 * webhook geral e o trigger do sync consultam para NÃO tratá-lo como Método.
 *
 * Comprou outro produto depois? Nada a fazer aqui: o Laboratório e o Desafio
 * só ligam a coluna deles, e o Método liga has_metodo — no webhook geral ou,
 * vindo pelo sync do marketplace, no trigger da migration
 * 20261019120000_comunidade_mapa_direcao (repo do CRM).
 */
export async function POST(req: NextRequest) {
  const lido = await lerPostback(req, "mapa")
  if ("resposta" in lido) return lido.resposta
  const {
    event,
    buyerEmail,
    buyerName,
    buyerPhone,
    transactionId,
    productId,
    purchaseTimestamp,
  } = lido.postback

  const db = createComunidadeServiceClient()
  console.log(`[mapa] ${event} · produto ${productId ?? "?"} · ${buyerEmail}`)

  if (productId) {
    const { error } = await db
      .from("mapa_products")
      .upsert(
        { hotmart_product_id: productId, label: MAPA_NAME },
        { onConflict: "hotmart_product_id", ignoreDuplicates: true }
      )
    if (error) console.error("[mapa] cadastro do produto falhou:", error.message)
  }

  const { error: compraError } = await db.from("mapa_purchases").insert({
    email: buyerEmail,
    hotmart_product_id: productId,
    transaction_id: transactionId,
    event_type: event ?? "DESCONHECIDO",
    occurred_at: purchaseTimestamp,
  })
  // Postback repetido cai no índice único por (e-mail, transação, evento).
  if (compraError && compraError.code !== "23505") {
    console.error("[mapa] registro da compra falhou:", compraError.message)
  }

  const contato = {
    ...(buyerName ? { buyer_name: buyerName } : {}),
    ...(buyerPhone ? { phone: buyerPhone } : {}),
  }

  try {
    switch (event) {
      case "PURCHASE_APPROVED":
      case "PURCHASE_COMPLETE": {
        const { data: existing, error: fetchError } = await db
          .from("authorized_emails")
          .select("status, hotmart_transaction_id")
          .eq("email", buyerEmail)
          .maybeSingle()
        if (fetchError) {
          console.error("[mapa] fetch error:", fetchError.message)
          return NextResponse.json({ error: "Database error" }, { status: 500 })
        }

        // Chegou sem conta no portal: entra só com o Mapa.
        if (!existing) {
          const { error } = await db.from("authorized_emails").insert({
            email: buyerEmail,
            status: "active",
            source: "hotmart",
            authorized_at: purchaseTimestamp,
            hotmart_transaction_id: transactionId,
            hotmart_product_id: productId,
            buyer_name: buyerName,
            phone: buyerPhone,
            has_metodo: false,
            has_mapa: true,
          })
          // 23505: o sync ou o webhook geral criaram a linha neste meio-tempo.
          // O Hotmart reenvia o postback que falhar, e no reenvio ela cai no
          // caso de baixo, que sabe reconhecer a linha nascida desta compra.
          if (error) {
            console.error("[mapa] insert error:", error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
          console.log(`[mapa] autorizado só com o Mapa: ${buyerEmail}`)
          return NextResponse.json({ received: true, status: "authorized", email: buyerEmail })
        }

        // Linha revogada (reembolso do Método) que volta pelo Mapa: volta só
        // com ele, e a contagem dos 7 dias recomeça desta compra.
        if (existing.status === "revoked") {
          const { error } = await db
            .from("authorized_emails")
            .update({
              status: "active",
              revoked_at: null,
              authorized_at: purchaseTimestamp,
              hotmart_transaction_id: transactionId,
              hotmart_product_id: productId,
              has_metodo: false,
              has_mapa: true,
              ...contato,
            })
            .eq("email", buyerEmail)
          if (error) {
            console.error("[mapa] reativação error:", error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
          console.log(`[mapa] reativado só com o Mapa: ${buyerEmail}`)
          return NextResponse.json({ received: true, status: "authorized", email: buyerEmail })
        }

        // Já ativa. Quase sempre é aluna do Método comprando o Mapa — só liga a
        // coluna. A exceção é a linha que nasceu DESTA compra, criada pelo sync
        // do marketplace ou pelo webhook geral antes de o id do Mapa estar em
        // mapa_products: ela entrou como Método sem ter comprado o Método.
        const nasceuDestaCompra =
          transactionId !== null && existing.hotmart_transaction_id === transactionId
        const { error } = await db
          .from("authorized_emails")
          .update({
            has_mapa: true,
            ...(nasceuDestaCompra ? { has_metodo: false } : {}),
            ...contato,
          })
          .eq("email", buyerEmail)
        if (error) {
          console.error("[mapa] update error:", error.message)
          return NextResponse.json({ error: "Database error" }, { status: 500 })
        }
        console.log(`[mapa] Mapa liberado: ${buyerEmail}`)
        return NextResponse.json({ received: true, status: "extra_granted", email: buyerEmail })
      }

      case "PURCHASE_REFUNDED":
      case "PURCHASE_CHARGEBACK": {
        const { data: existing } = await db
          .from("authorized_emails")
          .select("has_metodo, has_comunidade_vip, has_desafio")
          .eq("email", buyerEmail)
          .maybeSingle()
        if (!existing) {
          return NextResponse.json({ received: true, ignored: true, reason: "not found" })
        }

        // Sem o Mapa, o que segura a entrada é o Método ou um extra comprado.
        // Sem nenhum, ela sai do portal.
        const ficaSemEntrada =
          !existing.has_metodo && !existing.has_comunidade_vip && !existing.has_desafio
        const { error } = await db
          .from("authorized_emails")
          .update({
            has_mapa: false,
            ...(ficaSemEntrada
              ? { status: "revoked" as const, revoked_at: new Date().toISOString() }
              : {}),
          })
          .eq("email", buyerEmail)
        if (error) {
          console.error("[mapa] revoke error:", error.message)
          return NextResponse.json({ error: "Database error" }, { status: 500 })
        }
        console.log(`[mapa] Mapa revogado${ficaSemEntrada ? " e portal fechado" : ""}: ${buyerEmail}`)
        return NextResponse.json({
          received: true,
          status: ficaSemEntrada ? "revoked" : "extra_revoked",
          email: buyerEmail,
        })
      }

      default:
        console.log(`[mapa] evento ignorado: ${event}`)
        return NextResponse.json({ received: true, ignored: true })
    }
  } catch (error) {
    console.error("[mapa] error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
