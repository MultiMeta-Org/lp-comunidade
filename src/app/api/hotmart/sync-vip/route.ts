import { NextRequest, NextResponse } from "next/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { listarVendas } from "@/lib/hotmart-api"

export const runtime = "nodejs"
export const maxDuration = 300

/**
 * GET /api/hotmart/sync-vip
 * Traz da Hotmart quem comprou a Comunidade VIP e põe em dia quem tem acesso.
 *
 * Fonte é a Hotmart, não o CRM nem a anotação de ninguém: para cada produto
 * cadastrado em comunidade.vip_products, lê o histórico de vendas pela API e
 * grava cada transação em comunidade.vip_purchases (origem 'hotmart_api'). No
 * fim chama a derivação, que decide a posse.
 *
 * Roda por cron e também sob demanda (para o histórico, quando o postback
 * ainda não existia). É idempotente: transação já registrada não vira linha
 * nova. O postback continua valendo para o acesso sair na hora; isto é a rede
 * de segurança que pega o que ele perder.
 *
 * Proteção: CRON_SECRET no header Authorization (o cron da Vercel manda
 * sozinho). Sem o segredo configurado, só o cron da própria Vercel entra.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get("authorization")
  const daVercel = req.headers.get("x-vercel-cron") !== null
  if (!daVercel && (!secret || auth !== `Bearer ${secret}`)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const db = createComunidadeServiceClient()

  const { data: produtos, error: erroProdutos } = await db
    .from("vip_products")
    .select("hotmart_product_id")
    .not("hotmart_product_id", "is", null)

  if (erroProdutos) {
    console.error("[sync-vip] vip_products:", erroProdutos.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  const ids = (produtos ?? [])
    .map((p) => p.hotmart_product_id)
    .filter((id): id is string => Boolean(id))

  if (ids.length === 0) {
    return NextResponse.json({ ok: true, aviso: "Nenhum produto da VIP cadastrado" })
  }

  let lidas = 0
  const registros: Array<{
    email: string
    hotmart_product_id: string
    transaction_id: string
    event_type: string
    occurred_at: string
    origem: string
  }> = []

  try {
    for (const id of ids) {
      const vendas = await listarVendas(id)
      lidas += vendas.length
      for (const v of vendas) {
        registros.push({
          email: v.email,
          hotmart_product_id: v.productId,
          transaction_id: v.transaction,
          event_type: v.valida ? "PURCHASE_APPROVED" : "PURCHASE_REFUNDED",
          // Compra vale pela data dela; reembolso vale por AGORA — senão
          // empataria com a aprovação da mesma transação, e a derivação, que
          // usa o evento mais recente, não saberia qual veio depois.
          occurred_at: v.valida ? v.orderDate.toISOString() : new Date().toISOString(),
          origem: "hotmart_api",
        })
      }
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error("[sync-vip]", msg)
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  if (registros.length > 0) {
    // Idempotente: a mesma transação com o mesmo estado não duplica.
    const { error } = await db
      .from("vip_purchases")
      .upsert(registros, { onConflict: "transaction_id,event_type", ignoreDuplicates: true })
    if (error) {
      console.error("[sync-vip] gravação:", error.message)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  }

  const { data: alteradas, error: erroRefresh } = await db.rpc("refresh_vip_entitlement", {})
  if (erroRefresh) {
    console.error("[sync-vip] derivação:", erroRefresh.message)
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  console.log(
    `[sync-vip] ${ids.length} produto(s) · ${lidas} venda(s) lida(s) · ${alteradas} acesso(s) alterado(s)`
  )
  return NextResponse.json({
    ok: true,
    produtos: ids,
    vendasLidas: lidas,
    acessosAlterados: alteradas,
  })
}
