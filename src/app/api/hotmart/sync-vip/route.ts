import { NextRequest, NextResponse } from "next/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { listarVendas, listarProdutos, pareceComunidadeVip } from "@/lib/hotmart-api"

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
 * Roda uma vez por dia (cron às 03:00 UTC = meia-noite em São Paulo; o
 * vercel.json não aceita comentário, então a tradução do horário mora aqui) e
 * também sob demanda — foi assim que o histórico anterior ao postback entrou.
 * É conferência, não caminho de acesso: quem compra é liberada em segundos
 * pelo postback. É idempotente: transação já registrada não vira linha
 * nova. O postback continua valendo para o acesso sair na hora; isto é a rede
 * de segurança que pega o que ele perder.
 *
 * Também cuida de dois buracos que o postback sozinho não cobre:
 *   • quem comprou SÓ a Comunidade, sem o Método, não tem linha em
 *     authorized_emails — sem ela não consegue nem entrar no portal, e a
 *     derivação (que só faz update) não a alcançaria. Aqui a linha é criada.
 *   • produto novo na Hotmart com cara de Comunidade VIP e não cadastrado em
 *     vip_products venderia invisível. Fica anotado na rodada, para alguém ver.
 *
 * Toda execução deixa registro em comunidade.vip_sync_runs: é o que permite
 * saber que o sync está vivo, em vez de confiar num silêncio que pode ser falha.
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
  let criadas = 0
  let desconhecidos: Array<{ id: string; nome: string }> = []

  /** Guarda o resultado da rodada — inclusive quando ela falha. */
  const registraRodada = async (dados: {
    ok: boolean
    acessos?: number
    erro?: string
  }) => {
    const { error } = await db.from("vip_sync_runs").insert({
      ok: dados.ok,
      vendas_lidas: lidas,
      acessos_alterados: dados.acessos ?? 0,
      alunas_criadas: criadas,
      produtos_desconhecidos: desconhecidos,
      erro: dados.erro ?? null,
    })
    if (error) console.error("[sync-vip] diário:", error.message)
  }

  const registros: Array<{
    email: string
    hotmart_product_id: string
    transaction_id: string
    event_type: string
    occurred_at: string
    origem: string
  }> = []

  try {
    // Produto novo com cara de VIP que ninguém cadastrou: anota para alguém ver.
    const catalogo = await listarProdutos()
    desconhecidos = catalogo
      .filter((p) => pareceComunidadeVip(p.nome) && !ids.includes(p.id))
      .map((p) => ({ id: p.id, nome: p.nome }))
    if (desconhecidos.length > 0) {
      console.warn("[sync-vip] produto VIP não cadastrado:", JSON.stringify(desconhecidos))
    }

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
    await registraRodada({ ok: false, erro: msg })
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  if (registros.length > 0) {
    // Idempotente: a mesma transação com o mesmo estado não duplica.
    const { error } = await db
      .from("vip_purchases")
      .upsert(registros, { onConflict: "transaction_id,event_type", ignoreDuplicates: true })
    if (error) {
      console.error("[sync-vip] gravação:", error.message)
      await registraRodada({ ok: false, erro: error.message })
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  }

  // Compradora da Comunidade que não é aluna do Método ainda não tem linha —
  // e a derivação só faz update. Sem isto, ela pagaria e não entraria.
  const compradoras = registros.filter((r) => r.event_type === "PURCHASE_APPROVED")
  if (compradoras.length > 0) {
    const emails = [...new Set(compradoras.map((r) => r.email))]
    const { data: existentes } = await db
      .from("authorized_emails")
      .select("email")
      .in("email", emails)

    const conhecidos = new Set((existentes ?? []).map((e) => e.email.toLowerCase()))
    const novas = compradoras.filter((r) => !conhecidos.has(r.email))

    for (const nova of novas) {
      const { error } = await db.from("authorized_emails").upsert(
        {
          email: nova.email,
          status: "active",
          source: "hotmart_vip",
          authorized_at: nova.occurred_at,
          has_comunidade_vip: true,
        },
        { onConflict: "email", ignoreDuplicates: true }
      )
      if (error) {
        console.error("[sync-vip] criar aluna:", error.message)
      } else {
        criadas++
        console.log(`[sync-vip] aluna criada pela compra da VIP: ${nova.email}`)
      }
    }
  }

  const { data: alteradas, error: erroRefresh } = await db.rpc("refresh_vip_entitlement", {})
  if (erroRefresh) {
    console.error("[sync-vip] derivação:", erroRefresh.message)
    await registraRodada({ ok: false, erro: erroRefresh.message })
    return NextResponse.json({ error: "Database error" }, { status: 500 })
  }

  await registraRodada({ ok: true, acessos: alteradas ?? 0 })

  console.log(
    `[sync-vip] ${ids.length} produto(s) · ${lidas} venda(s) · ${alteradas} acesso(s) alterado(s) · ${criadas} aluna(s) criada(s)`
  )
  return NextResponse.json({
    ok: true,
    produtos: ids,
    vendasLidas: lidas,
    acessosAlterados: alteradas,
    alunasCriadas: criadas,
    produtosDesconhecidos: desconhecidos,
  })
}
