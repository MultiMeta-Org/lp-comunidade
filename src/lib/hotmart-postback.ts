import { NextRequest, NextResponse } from "next/server"

/**
 * A porta comum dos postbacks da Hotmart: hottok, corpo, comprador e o filtro
 * dos eventos de teste. Mora aqui porque o portal tem mais de um endereço de
 * webhook (o geral, em /api/hotmart/webhook, e o do Mapa, em /testemapadir), e
 * a porta precisa ser a mesma nos dois — uma validação esquecida num deles é
 * uma aluna fantasma na base.
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

export type Postback = {
  event: string | undefined
  buyerEmail: string
  buyerName: string | null
  buyerPhone: string | null
  transactionId: string | null
  productId: string | null
  /** order_date da compra (ISO) — ancora o gate de 7 dias. */
  purchaseTimestamp: string
}

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
 * Lê e valida o postback. Devolve o evento pronto para tratar ou a resposta
 * que a rota deve mandar de volta (401, 400, ou "recebido e ignorado").
 *
 * Configurar no Hotmart o header `x-hotmart-hottok` = HOTMART_HOTTOK.
 */
export async function lerPostback(
  req: NextRequest,
  origem: string
): Promise<{ postback: Postback } | { resposta: NextResponse }> {
  const hottok = req.headers.get("x-hotmart-hottok")
  const expected = process.env.HOTMART_HOTTOK
  if (!expected || !hottok || hottok !== expected) {
    console.error(`[${origem}] hottok inválido ou ausente`)
    return { resposta: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }

  let body: HotmartPayload
  try {
    body = (await req.json()) as HotmartPayload
  } catch {
    return { resposta: NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }
  }

  const buyerEmail = body.data?.buyer?.email?.toLowerCase().trim()
  if (!buyerEmail) {
    return {
      resposta: NextResponse.json({ received: true, ignored: true, reason: "No buyer email" }),
    }
  }

  const productId = body.data?.product?.id?.toString() || null

  if (ehEventoDeTeste(buyerEmail, productId)) {
    console.log(`[${origem}] evento de teste ignorado: ${body.event} · ${buyerEmail}`)
    return {
      resposta: NextResponse.json({ received: true, ignored: true, reason: "test event" }),
    }
  }

  // order_date (ms desde epoch) = data real da compra; ancora o gate de 7 dias.
  const orderDateMs = body.data?.purchase?.order_date
  const purchaseTimestamp =
    typeof orderDateMs === "number" && orderDateMs > 0
      ? new Date(orderDateMs).toISOString()
      : new Date().toISOString()

  return {
    postback: {
      event: body.event,
      buyerEmail,
      buyerName:
        body.data?.buyer?.name ||
        `${body.data?.buyer?.first_name || ""} ${body.data?.buyer?.last_name || ""}`.trim() ||
        null,
      buyerPhone: body.data?.buyer?.phone || null,
      transactionId: body.data?.purchase?.transaction || null,
      productId,
      purchaseTimestamp,
    },
  }
}
