import "server-only"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import type { Respostas } from "@/lib/desafio"

/**
 * A jornada da aluna no Desafio 21 Dias (comunidade.desafio_*).
 *
 * Nada aqui é cacheado entre requests: é dado de uma aluna só, e uma missão
 * que aparece como pendente depois de concluída seria pior que não ter
 * contador nenhum.
 *
 * Service client e não a sessão + RLS, pelo mesmo motivo do progresso das
 * aulas: as tabelas não têm policy para `authenticated` de propósito. Quem
 * chama já passou pelo guard, e o e-mail vem SEMPRE da sessão — nunca do
 * cliente. É o que impede um POST de gravar missão no nome de outra.
 */

const norm = (email: string) => email.toLowerCase().trim()

// ─────────────────────────────────────────────────────────────
// Progresso
// ─────────────────────────────────────────────────────────────

export type ProgressoDoDia = {
  dia: number
  /** Em que passo ela parou. O modal reabre aqui. */
  passo: number
  respostas: Respostas
  concluido: boolean
  concluidoEm: string | null
}

export type Jornada = {
  /** Por número do dia. */
  dias: Map<number, ProgressoDoDia>
  concluidos: Set<number>
  /** Quantas empresas ela tem no Radar hoje (as não arquivadas). */
  empresasNoRadar: number
}

/**
 * Tudo que a página do Desafio precisa saber sobre esta aluna, em duas
 * consultas. Progresso e Radar vêm juntos porque a jornada mostra os dois na
 * mesma tela: o anel dos dias e o contador de empresas.
 */
export async function getJornada(email: string): Promise<Jornada> {
  const db = createComunidadeServiceClient()
  const e = norm(email)

  const [progresso, radar] = await Promise.all([
    db
      .from("desafio_progresso")
      .select("dia, passo, respostas, completed_at")
      .eq("email", e),
    db
      .from("desafio_radar")
      .select("id", { count: "exact", head: true })
      .eq("email", e)
      .is("arquivada_em", null),
  ])

  if (progresso.error) {
    console.error("[desafio] getJornada progresso:", progresso.error.message)
  }
  if (radar.error) {
    console.error("[desafio] getJornada radar:", radar.error.message)
  }

  const dias = new Map<number, ProgressoDoDia>()
  const concluidos = new Set<number>()

  for (const row of progresso.data ?? []) {
    dias.set(row.dia, {
      dia: row.dia,
      passo: row.passo,
      respostas: (row.respostas ?? {}) as Respostas,
      concluido: row.completed_at !== null,
      concluidoEm: row.completed_at,
    })
    if (row.completed_at !== null) concluidos.add(row.dia)
  }

  return { dias, concluidos, empresasNoRadar: radar.count ?? 0 }
}

/**
 * Guarda o avanço da missão: as respostas até aqui e o passo em que ela está.
 *
 * As respostas são MESCLADAS com o que já existe, não substituídas. Um passo
 * grava só as chaves dele, e a aluna atravessa o dia em pedaços — sobrescrever
 * o objeto inteiro apagaria o formulário anterior a cada clique. A mesclagem
 * acontece no banco (`respostas || excluded.respostas`) para não depender de
 * uma leitura antes da escrita, que perderia a corrida com dois cliques
 * rápidos.
 *
 * `passo` nunca retrocede: ela pode voltar para reler um passo sem que isso
 * desfaça o progresso dela.
 */
export async function salvarPasso(
  email: string,
  dia: number,
  passo: number,
  respostas: Respostas
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db.rpc("desafio_salvar_passo", {
    p_email: norm(email),
    p_dia: dia,
    p_passo: passo,
    p_respostas: respostas,
  })
  if (error) {
    console.error("[desafio] salvarPasso:", error.message)
    return error.message
  }
  return null
}

/**
 * Conclui o dia. Grava as últimas respostas e estampa `completed_at`.
 *
 * Idempotente e sem reescrever a data: concluir de novo (ela editou uma
 * resposta de um dia passado) atualiza as respostas e mantém o
 * `completed_at` original — a data em que ela concluiu é fato, e uma revisão
 * três dias depois não a desfaz.
 */
export async function concluirDia(
  email: string,
  dia: number,
  respostas: Respostas
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db.rpc("desafio_concluir_dia", {
    p_email: norm(email),
    p_dia: dia,
    p_respostas: respostas,
  })
  if (error) {
    console.error("[desafio] concluirDia:", error.message)
    return error.message
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// Radar
// ─────────────────────────────────────────────────────────────

export type Empresa = {
  id: string
  nome: string
  segmento: string | null
  contato: string | null
  origem: string | null
  diaOrigem: number | null
  /** Estágio comercial. "no-radar" até ela mandar a primeira abordagem. */
  status: string
  proximaAcao: string | null
  proximaAcaoEm: string | null
  notas: Record<string, unknown>
}

/** As empresas do Radar desta aluna, as primeiras primeiro. */
export async function getRadar(email: string): Promise<Empresa[]> {
  const db = createComunidadeServiceClient()
  const { data, error } = await db
    .from("desafio_radar")
    .select(
      "id, nome, segmento, contato, origem, dia_origem, status, proxima_acao, proxima_acao_em, notas"
    )
    .eq("email", norm(email))
    .is("arquivada_em", null)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[desafio] getRadar:", error.message)
    return []
  }
  return (data ?? []).map(paraEmpresa)
}

/** Linha do banco → o que a tela usa. */
function paraEmpresa(r: {
  id: string
  nome: string
  segmento: string | null
  contato: string | null
  origem: string | null
  dia_origem: number | null
  status: string
  proxima_acao: string | null
  proxima_acao_em: string | null
  notas: unknown
}): Empresa {
  return {
    id: r.id,
    nome: r.nome,
    segmento: r.segmento,
    contato: r.contato,
    origem: r.origem,
    diaOrigem: r.dia_origem,
    status: r.status,
    proximaAcao: r.proxima_acao,
    proximaAcaoEm: r.proxima_acao_em,
    notas: (r.notas ?? {}) as Record<string, unknown>,
  }
}

export type AddEmpresa = {
  nome: string
  segmento?: string | null
  contato?: string | null
  origem?: string | null
  diaOrigem?: number | null
}

export type RadarResult =
  | { ok: true; empresa: Empresa }
  | { ok: false; error: string; duplicada?: boolean }

/**
 * Cadastra uma empresa no Radar.
 *
 * A mesma empresa não entra duas vezes (índice único por aluna + nome
 * normalizado no banco). Isso é tratado como aviso, não como erro: a aluna vai
 * somar até 100 empresas ao longo de 21 dias e repetir sem lembrar é o caso
 * comum, não o excepcional — "essa já está no seu Radar" é a resposta certa.
 */
export async function addEmpresa(
  email: string,
  empresa: AddEmpresa
): Promise<RadarResult> {
  const nome = empresa.nome.trim()
  if (!nome) return { ok: false, error: "Escreva o nome da empresa." }

  const db = createComunidadeServiceClient()
  const { data, error } = await db
    .from("desafio_radar")
    .insert({
      email: norm(email),
      nome,
      segmento: empresa.segmento?.trim() || null,
      contato: empresa.contato?.trim() || null,
      origem: empresa.origem ?? null,
      dia_origem: empresa.diaOrigem ?? null,
    })
    .select(
      "id, nome, segmento, contato, origem, dia_origem, status, proxima_acao, proxima_acao_em, notas"
    )
    .single()

  if (error) {
    // 23505 = unique_violation.
    if (error.code === "23505") {
      return { ok: false, duplicada: true, error: "Essa empresa já está no seu Radar." }
    }
    console.error("[desafio] addEmpresa:", error.message)
    return { ok: false, error: "Não consegui salvar agora. Tenta de novo?" }
  }

  return { ok: true, empresa: paraEmpresa(data) }
}

/**
 * Move o estágio comercial da empresa e registra a última ação.
 *
 * `proximaAcao` é o que sustenta o follow-up do Dia 9: "chamar sexta", "falar
 * com o sócio". Fica em texto livre de propósito — o que ela combinou não cabe
 * numa lista de opções.
 *
 * O e-mail entra no WHERE junto do id, como em toda escrita no Radar.
 */
export async function moverStatus(
  email: string,
  id: string,
  /** Ausente = só registra a ação, sem mexer no estágio. */
  status: string | undefined,
  acao?: { ultima?: string; proxima?: string | null; proximaEm?: string | null }
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db
    .from("desafio_radar")
    .update({
      ...(status ? { status } : {}),
      ...(acao?.ultima
        ? { ultima_acao: acao.ultima, ultima_acao_em: new Date().toISOString() }
        : {}),
      ...(acao?.proxima !== undefined ? { proxima_acao: acao.proxima } : {}),
      ...(acao?.proximaEm !== undefined ? { proxima_acao_em: acao.proximaEm } : {}),
    })
    .eq("email", norm(email))
    .eq("id", id)

  if (error) {
    console.error("[desafio] moverStatus:", error.message)
    return error.message
  }
  return null
}

/**
 * Tira a empresa do Radar. Soft delete: ela sai da conta e da lista, mas as
 * missões que a citam não ficam órfãs.
 */
export async function arquivarEmpresa(
  email: string,
  id: string
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db
    .from("desafio_radar")
    .update({ arquivada_em: new Date().toISOString() })
    // O e-mail entra no WHERE junto do id: sem isso, um id adivinhado
    // arquivaria empresa de outra aluna.
    .eq("email", norm(email))
    .eq("id", id)

  if (error) {
    console.error("[desafio] arquivarEmpresa:", error.message)
    return error.message
  }
  return null
}

/**
 * Guarda as respostas de uma missão ligadas a uma empresa, em
 * `desafio_radar.notas`.
 *
 * Por que não em colunas do Radar: "acho que essa empresa poderia fazer
 * follow-up" é exercício da aluna, não fato sobre a empresa. O Radar principal
 * fica simples e operacional; quando ela tiver informação real, aí sim ele
 * recebe campo próprio.
 *
 * As notas são agrupadas por dia (`notas->'dia-2'`), porque a mesma empresa
 * volta em dias diferentes e as respostas de um dia não devem sobrescrever as
 * de outro.
 */
export async function salvarNotasDaEmpresa(
  email: string,
  id: string,
  dia: number,
  notas: Respostas
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db.rpc("desafio_salvar_notas", {
    p_email: norm(email),
    p_id: id,
    p_dia: dia,
    p_notas: notas,
  })
  if (error) {
    console.error("[desafio] salvarNotasDaEmpresa:", error.message)
    return error.message
  }
  return null
}

// ─────────────────────────────────────────────────────────────
// Interesses
// ─────────────────────────────────────────────────────────────

/**
 * Registra que a aluna levantou a mão para algo (hoje: o Closer Presencial).
 *
 * Cidade e UF NÃO entram aqui: já vieram da matrícula, e o documento é
 * explícito em não perguntar de novo. O cruzamento é feito no banco, pela view
 * desafio_closer_presencial.
 */
export async function registrarInteresse(
  email: string,
  interesse: string,
  resposta: string | null
): Promise<string | null> {
  const db = createComunidadeServiceClient()
  const { error } = await db
    .from("desafio_interesses")
    .upsert(
      { email: norm(email), interesse, resposta },
      { onConflict: "email,interesse" }
    )

  if (error) {
    console.error("[desafio] registrarInteresse:", error.message)
    return error.message
  }
  return null
}

/** Interesses que esta aluna já declarou → resposta dada (ou null). */
export async function getInteresses(
  email: string
): Promise<Map<string, string | null>> {
  const db = createComunidadeServiceClient()
  const { data, error } = await db
    .from("desafio_interesses")
    .select("interesse, resposta")
    .eq("email", norm(email))

  if (error) {
    console.error("[desafio] getInteresses:", error.message)
    return new Map()
  }
  return new Map((data ?? []).map((r) => [r.interesse, r.resposta]))
}

// ─────────────────────────────────────────────────────────────
// A operação da aluna
// ─────────────────────────────────────────────────────────────

export type Placar = {
  /** Empresas encontradas. */
  noRadar: number
  /** Empresas com quem ela efetivamente iniciou contato. NÃO é o mesmo. */
  abordadas: number
  emConversa: number
  reunioes: number
  propostas: number
  fechados: number
}

export type Operacao = {
  placar: Placar
  /** Empresas cuja próxima ação vence hoje ou já venceu. */
  followUpsDeHoje: Empresa[]
  /** Conversas abertas (respondeu ou conversando). */
  conversasAbertas: Empresa[]
  reunioesMarcadas: Empresa[]
  /** Já aconteceram e esperam proposta ou retomada. */
  reunioesRealizadas: Empresa[]
}

/**
 * O painel "Sua operação hoje", que o Dia 9 pede.
 *
 * A razão de existir, nas palavras do documento: a aluna NÃO deve entrar no
 * Radar procurando à mão quem precisa de follow-up. O portal passa a se
 * comportar como central de trabalho em vez de curso.
 *
 * A sugestão automática de follow-up por "2 dias sem atualização" ficou de
 * fora de propósito — o próprio documento diz para não atrasar o produto por
 * causa dela. Aqui o vencimento vem da data que a ALUNA marcou, que é
 * informação melhor que um palpite do sistema.
 *
 * Sai de UMA leitura do Radar, não de cinco consultas: a página já precisa da
 * lista inteira, e contar em memória é mais barato que voltar ao banco.
 */
export async function getOperacao(email: string): Promise<Operacao> {
  const radar = await getRadar(email)

  // Comparação por string ISO (AAAA-MM-DD) para não escorregar em fuso: a
  // coluna é `date`, não timestamp, e converter para Date trocaria o dia da
  // aluna pelo dia de UTC.
  const hoje = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  })

  const placar: Placar = {
    noRadar: radar.length,
    abordadas: radar.filter((e) => e.status !== "no-radar").length,
    emConversa: radar.filter(
      (e) => e.status === "respondeu" || e.status === "conversando"
    ).length,
    reunioes: radar.filter(
      (e) => e.status === "reuniao" || e.status === "reuniao-realizada"
    ).length,
    propostas: radar.filter((e) => e.status === "proposta").length,
    fechados: radar.filter((e) => e.status === "fechado").length,
  }

  return {
    placar,
    followUpsDeHoje: radar.filter(
      (e) =>
        e.proximaAcaoEm !== null &&
        e.proximaAcaoEm <= hoje &&
        e.status !== "fechado" &&
        e.status !== "sem-interesse"
    ),
    conversasAbertas: radar.filter(
      (e) => e.status === "respondeu" || e.status === "conversando"
    ),
    reunioesMarcadas: radar.filter((e) => e.status === "reuniao"),
    reunioesRealizadas: radar.filter((e) => e.status === "reuniao-realizada"),
  }
}
