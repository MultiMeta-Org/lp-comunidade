import "server-only"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { listarTelefones, telefoneDoEmail } from "@/lib/hotmart-api"

/**
 * Preenche `authorized_emails.phone` com o que a Hotmart sabe.
 *
 * Por que existe: o postback só traz telefone desde que o portal passou a ler
 * `checkout_phone`, e a base que comprou antes disso ficou sem número nenhum —
 * uma coluna de WhatsApp vazia no admin e a automação do reembolso sem para
 * onde ligar.
 *
 * São duas passadas, e a segunda existe porque a primeira não basta:
 *   1. varredura por PRODUTO, para os ids cadastrados no portal. Uma chamada
 *      por produto traz a lista inteira de compradoras — barato.
 *   2. consulta por E-MAIL de quem continuou sem número. Pega quem comprou
 *      outra coisa da conta, ou um produto que ninguém cadastrou, que a
 *      varredura nunca enxergaria.
 *
 * Escreve só onde está vazio: o número que a aluna confirmou (postback ou
 * digitado por ela) vale mais que o cadastro antigo da Hotmart, e sobrescrever
 * desfaria uma correção.
 *
 * Mora aqui, e não dentro da rota do sync, porque dois caminhos chamam: o cron
 * noturno e o botão do admin.
 */
export async function preencherTelefones(): Promise<{
  gravados: number
  /** Quantas ficaram sem número nesta rodada (a Hotmart não tinha). */
  semNumero: number
  /** `true` quando o teto da rodada foi atingido e sobrou fila. */
  temMais: boolean
}> {
  const db = createComunidadeServiceClient()
  let gravados = 0

  // ── 1. Por produto ──
  // VIP e Desafio: quem só comprou o Desafio também precisa de WhatsApp no
  // admin, e esse id não está em vip_products.
  const [{ data: produtosVip }, { data: produtosDesafio }] = await Promise.all([
    db.from("vip_products").select("hotmart_product_id").not("hotmart_product_id", "is", null),
    db.from("desafio_products").select("hotmart_product_id"),
  ])

  const ids = [
    ...new Set(
      [...(produtosVip ?? []), ...(produtosDesafio ?? [])]
        .map((p) => p.hotmart_product_id)
        .filter((id): id is string => Boolean(id))
    ),
  ]

  const telefonePor = new Map<string, string>()
  for (const id of ids) {
    for (const t of await listarTelefones(id)) {
      if (!telefonePor.has(t.email)) telefonePor.set(t.email, t.telefone)
    }
  }

  const encontrados = [...telefonePor.keys()]
  // Em lotes: um `in(...)` com a base inteira estoura o tamanho da URL.
  for (let i = 0; i < encontrados.length; i += 200) {
    const { data: semTelefone, error } = await db
      .from("authorized_emails")
      .select("email")
      .in("email", encontrados.slice(i, i + 200))
      .is("phone", null)
    if (error) throw new Error(error.message)

    for (const linha of semTelefone ?? []) {
      const telefone = telefonePor.get(linha.email.toLowerCase())
      if (!telefone) continue
      await gravar(db, linha.email, telefone)
      gravados++
    }
  }

  // ── 2. Por e-mail, para quem sobrou ──
  // Fora da fila só o seed manual do time (`source='manual'`): aquele e-mail
  // não tem venda na Hotmart para consultar, e perguntar por ele toda rodada
  // seria gastar requisição para sempre ouvir "não tenho". Todo o resto entra,
  // inclusive `marketplace_sync`, que é a origem da maior parte da base.
  const { data: pendentesRaw, error: erroPendentes } = await db
    .from("authorized_emails")
    .select("email")
    .is("phone", null)
    .or("source.is.null,source.neq.manual")
    .limit(LIMITE_POR_EMAIL)
  if (erroPendentes) throw new Error(erroPendentes.message)

  const pendentes = (pendentesRaw ?? []).map((l) => l.email)
  let semNumero = 0

  // Em lotes pequenos e em paralelo: uma por vez levaria minutos com algumas
  // centenas de alunas, e quem chama tem teto de tempo (maxDuration).
  for (let i = 0; i < pendentes.length; i += 5) {
    const achados = await Promise.all(
      pendentes.slice(i, i + 5).map(async (email) => ({
        email,
        telefone: await telefoneDoEmail(email),
      }))
    )
    for (const { email, telefone } of achados) {
      if (!telefone) {
        semNumero++
        continue
      }
      await gravar(db, email, telefone)
      gravados++
    }
  }

  return { gravados, semNumero, temMais: pendentes.length === LIMITE_POR_EMAIL }
}

/**
 * Quantas alunas sem telefone são consultadas por e-mail numa rodada.
 *
 * É uma requisição à Hotmart por aluna, e quem chama tem teto de 300s. 300 em
 * lotes de 5 cabem com folga; o que sobrar entra na rodada seguinte, e a fila
 * drena sozinha porque quem é atendida sai dela.
 */
const LIMITE_POR_EMAIL = 300

/** O `is("phone", null)` repetido no update evita pisar em quem ganhou número no meio da rodada. */
async function gravar(
  db: ReturnType<typeof createComunidadeServiceClient>,
  email: string,
  telefone: string
): Promise<void> {
  const { error } = await db
    .from("authorized_emails")
    .update({ phone: telefone })
    .eq("email", email)
    .is("phone", null)
  if (error) throw new Error(error.message)
}
