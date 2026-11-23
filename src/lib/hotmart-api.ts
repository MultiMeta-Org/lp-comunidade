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

/**
 * Quanto do passado o sync enxerga, em dias.
 *
 * NÃO É OPCIONAL. Sem `start_date`, o /sales/history da Hotmart devolve
 * calado só os últimos ~30 dias — não erra, não avisa, só omite. Foi assim que
 * o sync passou meses lendo 15 vendas quando existiam 41, e 23 alunas que
 * pagaram a Comunidade VIP ficaram sem ela. Um sync que mente por omissão é
 * pior que um sync que falha.
 *
 * O teto é da Hotmart: `now - 730d` responde 200, `now - 760d` responde 400.
 * Por isso 720 — margem para o limite não ser exatamente o que medimos, e para
 * fuso não empurrar a conta por cima da borda. E por isso é janela ROLANTE e
 * não data fixa: uma constante tipo "2025-01-01" funciona hoje e começa a
 * derrubar o sync inteiro com 400 quando envelhecer dois anos.
 *
 * Perder o que é mais velho que a janela não perde acesso: `vip_purchases` é
 * cumulativa e idempotente, então venda já registrada continua valendo.
 */
function janelaDias(): number {
  const raw = Number(process.env.HOTMART_JANELA_DIAS)
  return Number.isFinite(raw) && raw > 0 && raw <= 730 ? raw : 720
}

/** Início da janela, em epoch ms — o que a Hotmart espera em `start_date`. */
function inicioDaJanela(): number {
  return Date.now() - janelaDias() * 24 * 60 * 60 * 1000
}

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

export type ProdutoHotmart = { id: string; nome: string; status: string }

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
    // Ver janelaDias(): sem isto a Hotmart devolve só os últimos ~30 dias.
    url.searchParams.set("start_date", String(inicioDaJanela()))
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

export type TelefoneDaCompradora = { email: string; telefone: string }

type SalesUsersResponse = {
  items?: Array<{
    buyer?: { email?: string; phone?: string; cellphone?: string }
    users?: Array<{
      role?: string
      user?: {
        email?: string
        phone?: string
        cellphone?: string
        checkout_phone?: string
      }
    }>
  }>
  page_info?: { next_page_token?: string }
}

/** O primeiro campo de telefone preenchido, em texto. */
function primeiroTelefone(
  u: { phone?: string; cellphone?: string; checkout_phone?: string } | undefined
): string | null {
  for (const v of [u?.cellphone, u?.phone, u?.checkout_phone]) {
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return null
}

/**
 * O telefone de quem comprou um produto, pela API.
 *
 * Existe porque o postback só traz telefone desde que o portal passou a gravar
 * `checkout_phone` — a base que comprou antes disso ficou sem número nenhum, e
 * `authorized_emails.phone` vazio é uma coluna de WhatsApp que não serve para
 * nada no admin nem na automação do reembolso.
 *
 * O endpoint é `sales/users`, não `sales/history`: o histórico devolve só
 * e-mail do comprador, enquanto `users` devolve os participantes da venda — e
 * o telefone mora no participante de `role: "BUYER"`. A leitura é defensiva de
 * propósito (`cellphone`, `phone`, `checkout_phone`, e o `buyer` solto do
 * item): a Hotmart varia o campo entre produtos, e um telefone perdido por
 * palpite de nome de campo é silencioso.
 */
export async function listarTelefones(
  productId: string
): Promise<TelefoneDaCompradora[]> {
  const telefones: TelefoneDaCompradora[] = []
  let pageToken: string | undefined

  do {
    const pagina = await paginaDeUsuarios({
      product_id: productId,
      max_results: "500",
      ...(pageToken ? { page_token: pageToken } : {}),
    })
    telefones.push(...pagina.telefones)
    if (pagina.telefones.length === 0 && pagina.camposSemTelefone) {
      console.warn(
        `[hotmart] sales/users do produto ${productId} não trouxe telefone · campos do comprador: ${pagina.camposSemTelefone}`
      )
    }
    pageToken = pagina.proximaPagina
  } while (pageToken)

  return telefones
}

/**
 * O telefone de UMA compradora, por e-mail — sem passar por produto.
 *
 * É a consulta que fecha o buraco que a varredura por produto deixa: ela só
 * enxerga os produtos cadastrados no portal, e quem comprou outra coisa da
 * conta (ou um produto que ninguém cadastrou) nunca apareceria. Perguntar pelo
 * e-mail de quem está sem número vai direto ao caso que importa.
 *
 * `null` quando a Hotmart não tem o telefone dela — o que acontece de verdade:
 * checkout antigo que não pedia celular.
 */
export async function telefoneDoEmail(email: string): Promise<string | null> {
  const pagina = await paginaDeUsuarios({
    buyer_email: email,
    max_results: "50",
  })
  // Qualquer venda dela serve: é o telefone da pessoa, não da compra. A mais
  // recente primeiro seria melhor, mas a Hotmart não ordena isto — e um
  // telefone antigo vale mais que nenhum.
  return pagina.telefones[0]?.telefone ?? null
}

/**
 * Uma página de `sales/users`, já traduzida em pares e-mail → telefone.
 *
 * `start_date` entra sempre: sem ele a Hotmart devolve calada só o último mês
 * (ver janelaDias()). `camposSemTelefone` é diagnóstico — quando a resposta vem
 * sem telefone nenhum, diz quais chaves vieram, em vez de deixar o resultado
 * vazio sem explicação.
 */
async function paginaDeUsuarios(params: Record<string, string>): Promise<{
  telefones: TelefoneDaCompradora[]
  proximaPagina?: string
  camposSemTelefone: string | null
}> {
  const token = await getToken()
  const url = new URL(`${API_BASE}/sales/users`)
  url.searchParams.set("start_date", String(inicioDaJanela()))
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
  if (!res.ok) {
    throw new Error(`sales/users falhou (${res.status}): ${await res.text()}`)
  }

  const json = (await res.json()) as SalesUsersResponse
  const telefones: TelefoneDaCompradora[] = []
  let camposSemTelefone: string | null = null

  for (const item of json.items ?? []) {
    const comprador = (item.users ?? []).find((u) => u.role === "BUYER")
    const emailDaVenda = (comprador?.user?.email ?? item.buyer?.email)
      ?.toLowerCase()
      .trim()
    const telefone = primeiroTelefone(comprador?.user) ?? primeiroTelefone(item.buyer)

    if (!emailDaVenda) continue
    if (!telefone) {
      camposSemTelefone ??= JSON.stringify(
        Object.keys(comprador?.user ?? item.buyer ?? {}).sort()
      )
      continue
    }
    telefones.push({ email: emailDaVenda, telefone })
  }

  return {
    telefones,
    proximaPagina: json.page_info?.next_page_token,
    camposSemTelefone,
  }
}

/**
 * Catálogo de produtos da conta. Serve para desconfiar de produto novo: uma
 * oferta "Laboratório de Vendas 2027" criada amanhã e não cadastrada em
 * vip_products venderia sem ninguém ver.
 */
export async function listarProdutos(): Promise<ProdutoHotmart[]> {
  const token = await getToken()
  const url = new URL("https://developers.hotmart.com/products/api/v1/products")
  url.searchParams.set("max_results", "100")

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  })
  if (!res.ok) throw new Error(`products falhou (${res.status}): ${await res.text()}`)

  const json = (await res.json()) as {
    items?: Array<{ id?: number; name?: string; status?: string }>
  }
  return (json.items ?? []).map((p) => ({
    id: String(p.id ?? ""),
    nome: p.name ?? "",
    status: p.status ?? "",
  }))
}

/**
 * Produto cujo nome cheira à assinatura — usado só para alertar.
 *
 * Os dois nomes entram: a oferta antiga ("Comunidade VIP") continua vendendo na
 * Hotmart, e a nova ("Laboratório de Vendas") pode ser criada a qualquer
 * momento. Reconhecer só o nome atual deixaria passar justamente a oferta nova,
 * que é o caso que este alerta existe para pegar.
 */
export function pareceComunidadeVip(nome: string): boolean {
  return /comunidade\s*vip|laborat[óo]rio\s*de\s*vendas/i.test(nome)
}

/**
 * Vendas de UMA compradora, para os produtos da Comunidade VIP.
 *
 * É a consulta barata que responde "essa pessoa pagou?" na hora — usada no
 * login e no botão "já assinei". Uma chamada, filtrada por e-mail, em vez de
 * varrer o histórico inteiro.
 */
export async function vendasDoEmail(
  email: string,
  productIds: string[]
): Promise<VendaHotmart[]> {
  const token = await getToken()
  const vendas: VendaHotmart[] = []

  for (const productId of productIds) {
    const url = new URL(`${API_BASE}/sales/history`)
    url.searchParams.set("product_id", productId)
    url.searchParams.set("buyer_email", email)
    url.searchParams.set("max_results", "50")
    // Mesma armadilha do listarVendas: sem start_date, quem comprou há mais de
    // um mês some. Era por isto que o botão "já assinei" não achava a compra.
    url.searchParams.set("start_date", String(inicioDaJanela()))
    for (const s of [...STATUS_POSITIVOS, ...STATUS_NEGATIVOS]) {
      url.searchParams.append("transaction_status", s)
    }

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    })
    if (!res.ok) throw new Error(`sales/history por e-mail (${res.status})`)

    const json = (await res.json()) as SalesResponse
    for (const item of json.items ?? []) {
      const transaction = item.purchase?.transaction
      const status = item.purchase?.status
      if (!transaction || !status) continue
      vendas.push({
        email: item.buyer?.email?.toLowerCase().trim() ?? email,
        transaction,
        productId: String(item.product?.id ?? productId),
        orderDate: new Date(item.purchase?.order_date ?? Date.now()),
        status,
        valida: (STATUS_POSITIVOS as readonly string[]).includes(status),
      })
    }
  }

  return vendas
}
