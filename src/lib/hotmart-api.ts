/**
 * Cliente da API da Hotmart (OAuth2 client credentials).
 *
 * Por que existe: o postback só conta o que acontece DEPOIS de ligado, e o
 * CRM só sabe o que a closer digitou. A API é a fonte — a mesma verdade do
 * painel — e serve tanto para trazer o histórico quanto para conferir, de
 * tempos em tempos, que ninguém ficou de fora por um postback perdido.
 *
 * Credenciais: painel da Hotmart → Ferramentas → Credenciais.
 */

const TOKEN_URL = "https://api-sec-vlc.hotmart.com/security/oauth/token"
const API_BASE = "https://developers.hotmart.com/payments/api/v1"

/** Status da Hotmart que valem como compra válida. */
const STATUS_POSITIVOS = ["APPROVED", "COMPLETE"] as const
/** Status que derrubam a compra. */
const STATUS_NEGATIVOS = ["REFUNDED", "CHARGEBACK"] as const

export type VendaHotmart = {
  email: string
  transaction: string
  productId: string
  /** Momento da compra (o `order_date` da Hotmart). */
  orderDate: Date
  status: string
  /** APPROVED/COMPLETE → true; REFUNDED/CHARGEBACK → false. */
  valida: boolean
}

type TokenCache = { token: string; expiraEm: number }
let cache: TokenCache | null = null

/**
 * Access token, reaproveitado enquanto vale (a Hotmart dá 24h). Uma margem de
 * 5 min evita usar um token que expira no meio da paginação.
 */
async function getToken(): Promise<string> {
  const clientId = process.env.HOTMART_CLIENT_ID
  const clientSecret = process.env.HOTMART_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error("HOTMART_CLIENT_ID/HOTMART_CLIENT_SECRET não configurados")
  }

  if (cache && cache.expiraEm > Date.now() + 5 * 60_000) return cache.token

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
  const url = new URL(TOKEN_URL)
  url.searchParams.set("grant_type", "client_credentials")
  url.searchParams.set("client_id", clientId)
  url.searchParams.set("client_secret", clientSecret)

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  if (!res.ok) {
    throw new Error(`Hotmart recusou as credenciais (${res.status}): ${await res.text()}`)
  }

  const json = (await res.json()) as { access_token: string; expires_in: number }
  cache = {
    token: json.access_token,
    expiraEm: Date.now() + (json.expires_in ?? 86400) * 1000,
  }
  return cache.token
}

type SalesResponse = {
  items?: Array<{
    product?: { id?: number }
    buyer?: { email?: string }
    purchase?: { transaction?: string; order_date?: number; status?: string }
  }>
  page_info?: { next_page_token?: string }
}

/**
 * Todas as vendas de um produto, paginadas até o fim.
 *
 * O filtro de status é explícito porque o padrão da Hotmart devolve só
 * APPROVED/COMPLETE — e o reembolso é justamente o que precisamos enxergar
 * para tirar o acesso de quem desistiu.
 */
export async function listarVendas(productId: string): Promise<VendaHotmart[]> {
  const token = await getToken()
  const vendas: VendaHotmart[] = []
  let pageToken: string | undefined

  do {
    const url = new URL(`${API_BASE}/sales/history`)
    url.searchParams.set("product_id", productId)
    url.searchParams.set("max_results", "500")
    for (const s of [...STATUS_POSITIVOS, ...STATUS_NEGATIVOS]) {
      url.searchParams.append("transaction_status", s)
    }
    if (pageToken) url.searchParams.set("page_token", pageToken)

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    if (!res.ok) {
      throw new Error(`sales/history falhou (${res.status}): ${await res.text()}`)
    }

    const json = (await res.json()) as SalesResponse
    for (const item of json.items ?? []) {
      const email = item.buyer?.email?.toLowerCase().trim()
      const transaction = item.purchase?.transaction
      const status = item.purchase?.status
      if (!email || !transaction || !status) continue

      vendas.push({
        email,
        transaction,
        productId: String(item.product?.id ?? productId),
        orderDate: new Date(item.purchase?.order_date ?? Date.now()),
        status,
        valida: (STATUS_POSITIVOS as readonly string[]).includes(status),
      })
    }

    pageToken = json.page_info?.next_page_token
  } while (pageToken)

  return vendas
}
