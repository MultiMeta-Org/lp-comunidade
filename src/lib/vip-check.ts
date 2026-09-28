import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { vendasDoEmail } from "@/lib/hotmart-api"

/**
 * Pergunta à Hotmart, na hora, se ESTA aluna comprou a Comunidade VIP — e
 * libera se comprou.
 *
 * Por que existe: o postback é instantâneo mas depende de estar configurado e
 * de a Hotmart conseguir entregar; o sync varre tudo, mas de tempos em tempos.
 * Nenhum dos dois serve para a aluna que acabou de pagar e está olhando a tela.
 * Esta é a consulta pontual — um e-mail, dois produtos — que fecha a espera.
 *
 * Nunca lança: acesso é conferido de outras três formas, e derrubar o login de
 * alguém porque a Hotmart demorou seria trocar um problema pequeno por um
 * grande. Devolve se a aluna tem a Comunidade depois da consulta.
 */
export async function verificarCompraVip(email: string): Promise<boolean> {
  const db = createComunidadeServiceClient()

  try {
    const { data: produtos } = await db
      .from("vip_products")
      .select("hotmart_product_id")
      .not("hotmart_product_id", "is", null)

    const ids = (produtos ?? [])
      .map((p) => p.hotmart_product_id)
      .filter((id): id is string => Boolean(id))
    if (ids.length === 0) return false

    const vendas = await vendasDoEmail(email, ids)
    if (vendas.length === 0) return false

    const { error } = await db.from("vip_purchases").upsert(
      vendas.map((v) => ({
        email: v.email,
        hotmart_product_id: v.productId,
        transaction_id: v.transaction,
        event_type: v.valida ? "PURCHASE_APPROVED" : "PURCHASE_REFUNDED",
        // Reembolso vale pelo momento em que soubemos — ver sync-vip.
        occurred_at: v.valida ? v.orderDate.toISOString() : new Date().toISOString(),
        origem: "hotmart_api",
      })),
      { onConflict: "transaction_id,event_type", ignoreDuplicates: true }
    )
    if (error) {
      console.error("[vip-check] gravação:", error.message)
      return false
    }

    // Compradora que não é aluna do Método ainda não tem linha — sem ela não
    // entra no portal, e a derivação só faz update.
    const aprovada = vendas.find((v) => v.valida)
    if (aprovada) {
      await db.from("authorized_emails").upsert(
        {
          email,
          status: "active",
          source: "hotmart_vip",
          authorized_at: aprovada.orderDate.toISOString(),
          has_comunidade_vip: true,
        },
        { onConflict: "email", ignoreDuplicates: true }
      )
    }

    await db.rpc("refresh_vip_entitlement", { p_email: email })

    const { data: linha } = await db
      .from("authorized_emails")
      .select("has_comunidade_vip")
      .eq("email", email)
      .maybeSingle()

    return linha?.has_comunidade_vip === true
  } catch (e) {
    console.error("[vip-check]", e instanceof Error ? e.message : String(e))
    return false
  }
}
