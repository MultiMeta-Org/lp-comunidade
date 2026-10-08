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
 * O Desafio 21 Dias funciona EXATAMENTE igual, com as tabelas irmãs
 * (comunidade.desafio_products / desafio_purchases) e a coluna has_desafio.
 * Os dois produtos extras são tratados pelo mesmo caminho de código, parametrizado
 * por `EXTRAS` abaixo: a diferença entre eles é dado, não lógica.
 *
 * Configurar no Hotmart o header `x-hotmart-hottok` = HOTMART_HOTTOK.
 */

/**
 * Evento de teste do painel da Hotmart (o botão "enviar evento de teste").
 *
 * Eles vêm com comprador e produto fictícios e passam pelo hottok igual a um
 * evento real — já criaram uma aluna fantasma na base uma vez. Como o portal
 * cria acesso a partir do webhook, teste precisa morrer na porta.
 */
function ehEventoDeTeste(email: string, productId: string | null): boolean {
  if (/@example\.com$/i.test(email)) return true
  if (/^teste?@hotmart\.com(\.br)?$/i.test(email)) return true
  // Ids que a Hotmart usa nos disparos de teste.
  return productId !== null && ["0", "123456", "99999"].includes(productId)
}

/**
 * Os produtos que o portal libera ALÉM do acesso em si.
 *
 * Numa tabela, e não em dois ramos de `if`, porque a VIP e o Desafio têm a
 * mesma regra: compra liga a coluna, reembolso desliga a coluna e NÃO revoga o
 * acesso ao portal — esse vem da compra do Método, que segue de pé. Duplicar o
 * ramo faria a terceira oferta nascer com um bug de copiar-e-colar.
 */
const EXTRAS = [
  {
    nome: "Laboratório de Vendas",
    /** Tabela com os ids da Hotmart que valem como este produto. */
    produtos: "vip_products",
    /** Onde o portal registra o postback que ELE recebeu. */
    compras: "vip_purchases",
    /** A coluna derivada em authorized_emails. */
    coluna: "has_comunidade_vip",
  },
  {
    nome: "Desafio 21 Dias",
    produtos: "desafio_products",
    compras: "desafio_purchases",
    coluna: "has_desafio",
  },
] as const

type Extra = (typeof EXTRAS)[number]

/**
 * `{ [coluna]: valor }` com o tipo certo.
 *
 * Uma chave computada a partir de um union de literais vira `string` para o
 * TypeScript, e aí o update deixa de ser tipado contra as colunas reais da
 * tabela — justamente a checagem que a gente quer aqui. O `Record` devolve
 * isso: um objeto que só pode ter as colunas dos produtos extras.
 */
function ligaExtra(alvo: Extra, valor: boolean): Partial<Record<Extra["coluna"], boolean>> {
  return { [alvo.coluna]: valor }
}

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

  if (ehEventoDeTeste(buyerEmail, productId)) {
    console.log(`[hotmart] evento de teste ignorado: ${body.event} · ${buyerEmail}`)
    return NextResponse.json({ received: true, ignored: true, reason: "test event" })
  }

  const db = createComunidadeServiceClient()

  /**
   * Qual produto extra esta compra é — ou null, se for o Método (ou qualquer
   * outro produto que só dê o acesso).
   *
   * A lista de ids mora no banco (vip_products / desafio_products): id de
   * produto é dado, não código, e a Nati cadastra uma oferta nova sem deploy.
   */
  let extra: Extra | null = null
  if (productId) {
    for (const candidato of EXTRAS) {
      const { data } = await db
        .from(candidato.produtos)
        .select("hotmart_product_id")
        .eq("hotmart_product_id", productId)
        .maybeSingle()
      if (data) {
        extra = candidato
        break
      }
    }
  }

  /**
   * Guarda o evento para a derivação enxergar o que o PORTAL recebeu.
   *
   * O mesmo postback também chega no webhook do CRM, e a derivação é regra
   * total: sem sinal positivo, desliga. Sem este registro, a compra que o
   * portal concedeu seria desfeita pelo cron cinco minutos depois.
   */
  const registraCompra = async (alvo: Extra) => {
    const { error } = await db.from(alvo.compras).insert({
      email: buyerEmail,
      hotmart_product_id: productId,
      transaction_id: transactionId,
      event_type: body.event ?? "DESCONHECIDO",
      occurred_at: purchaseTimestamp,
    })
    // Postback repetido cai no índice único por (e-mail, transação, evento):
    // não é erro, é o mesmo fato chegando duas vezes.
    if (error && error.code !== "23505") {
      console.error(`[hotmart] registro da compra (${alvo.nome}) falhou:`, error.message)
    }
  }

  // O id do produto sai no log de todo evento: é assim que se descobre o
  // número de uma oferta nova para cadastrar na tabela dela.
  console.log(
    `[hotmart] ${body.event} · produto ${productId ?? "?"}${extra ? ` (${extra.nome})` : ""} · ${buyerEmail}`
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
          // Compra de um produto extra liga a coluna dele. Compra de outro
          // produto não mexe em nada: quem já tem o grupo não o perde
          // comprando mais.
          ...(extra ? ligaExtra(extra, true) : {}),
        }

        // Aluna que já tinha o Método e agora comprou o extra: só liga a
        // coluna. Sobrescrever transação e produto apagaria o registro da
        // compra do Método, que é o que ancora o acesso dela.
        if (extra && existing) {
          await registraCompra(extra)
          const { error } = await db
            .from("authorized_emails")
            .update({
              status: "active",
              revoked_at: null,
              ...ligaExtra(extra, true),
              // Linha revogada que volta por um extra recomeça a contagem dos
              // 7 dias — senão Marketplace e Notion abririam de cara.
              ...(existing.status === "revoked"
                ? { authorized_at: purchaseTimestamp }
                : {}),
              ...(buyerName ? { buyer_name: buyerName } : {}),
              ...(buyerPhone ? { phone: buyerPhone } : {}),
            })
            .eq("email", buyerEmail)
          if (error) {
            console.error(`[hotmart] update ${extra.nome} error:`, error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
          console.log(`[hotmart] ${extra.nome} liberado: ${buyerEmail}`)
          return NextResponse.json({
            received: true,
            status: "extra_granted",
            produto: extra.nome,
            email: buyerEmail,
          })
        }

        if (extra) await registraCompra(extra)

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
        // Reembolso de um produto extra: perde o extra, mantém o portal — o
        // acesso dela vem da compra do Método, que segue de pé.
        if (extra) {
          await registraCompra(extra)
          const { error } = await db
            .from("authorized_emails")
            .update(ligaExtra(extra, false))
            .eq("email", buyerEmail)
          if (error) {
            console.error(`[hotmart] revoke ${extra.nome} error:`, error.message)
            return NextResponse.json({ error: "Database error" }, { status: 500 })
          }
          console.log(`[hotmart] ${extra.nome} revogado: ${buyerEmail}`)
          return NextResponse.json({
            received: true,
            status: "extra_revoked",
            produto: extra.nome,
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
