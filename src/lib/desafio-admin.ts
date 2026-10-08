import "server-only"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { TOTAL_DIAS, getDia } from "@/lib/desafio"

/**
 * As leituras do painel do Desafio (/admin/desafio).
 *
 * Tudo sai das views de `comunidade.desafio_*`, e é de propósito: as contas
 * moram no banco, perto do dado, em vez de serem refeitas em TypeScript a cada
 * visita. É também o único lugar que conhece as chaves do formulário — se uma
 * pergunta da matrícula mudar, muda a view, não esta camada.
 *
 * Nada é cacheado: a Nati abre isso para decidir o que fazer HOJE, e um painel
 * com números de uma hora atrás responderia a pergunta errada.
 */

export type VisaoGeral = {
  comAcesso: number
  comecaramMatricula: number
  matriculaConcluida: number
  idadeMedia: number | null
  maes: number
  filhosMedia: number | null
  ufs: number
}

export type LinhaDoFunil = {
  dia: number
  titulo: string
  abriram: number
  concluiram: number
  /** Quantas abriram e não concluíram — é a fila do suporte. */
  travadas: number
}

export type Ranking = { rotulo: string; alunas: number; pct: number | null }

export type Distribuicao = { campo: string; itens: Ranking[] }

export type Transformacao = {
  indicador: string
  entrada: number | null
  saida: number | null
  evolucao: number | null
  respondentes: number
}

export type Aluna = {
  email: string
  nome: string | null
  uf: string | null
  matriculaConcluida: boolean
  diasConcluidos: number
  ultimoDiaAberto: number | null
  atualizadoEm: string | null
  noRadar: number
  abordadas: number
  emConversa: number
  reunioes: number
  propostas: number
  fechados: number
}

export type Interesse = { nome: string; total: number; detalhe: Ranking[] }

export type PainelDoDesafio = {
  visaoGeral: VisaoGeral
  funil: LinhaDoFunil[]
  motivos: Ranking[]
  dores: Ranking[]
  distribuicoes: Distribuicao[]
  transformacao: Transformacao[]
  interesses: Interesse[]
  /** Soma do funil comercial de todas as alunas. */
  comercial: {
    noRadar: number
    abordadas: number
    emConversa: number
    reunioes: number
    propostas: number
    fechados: number
  }
}

/** Rótulos dos interesses. O banco guarda o slug; a tela mostra o nome. */
const NOME_DO_INTERESSE: Record<string, string> = {
  "closer-presencial": "Closer de eventos presenciais",
  "rotina-lar-trabalho": "Rotina do lar + trabalho",
  "crm-quiz": "CRM + Quiz",
  "socias-de-projeto": "Sócias de Projeto",
}

export async function getPainelDoDesafio(): Promise<PainelDoDesafio> {
  const db = createComunidadeServiceClient()

  const [geral, funil, motivos, dores, dist, transf, interesses, alunas] =
    await Promise.all([
      db.from("desafio_visao_geral").select("*").maybeSingle(),
      db.from("desafio_funil").select("dia, abriram, concluiram").order("dia"),
      db.from("desafio_motivos").select("motivo, alunas, pct"),
      db.from("desafio_dores").select("dor, alunas, pct"),
      db.from("desafio_distribuicao").select("campo, valor, alunas, pct"),
      db.from("desafio_transformacao").select("*"),
      db.from("desafio_interesses").select("interesse, resposta"),
      db.from("desafio_alunas").select("no_radar, abordadas, em_conversa, reunioes, propostas, fechados"),
    ])

  for (const r of [geral, funil, motivos, dores, dist, transf, interesses, alunas]) {
    if (r.error) console.error("[desafio-admin] painel:", r.error.message)
  }

  const g = geral.data
  const visaoGeral: VisaoGeral = {
    comAcesso: g?.com_acesso ?? 0,
    comecaramMatricula: g?.comecaram_matricula ?? 0,
    matriculaConcluida: g?.matricula_concluida ?? 0,
    idadeMedia: g?.idade_media ?? null,
    maes: g?.maes ?? 0,
    filhosMedia: g?.filhos_media ?? null,
    ufs: g?.ufs ?? 0,
  }

  // O título de cada dia vem do CONTEÚDO, não do banco: o banco só conhece o
  // número do dia, e uma tabela de 22 linhas numeradas não diz nada a quem lê.
  const linhasDoFunil: LinhaDoFunil[] = (funil.data ?? []).map((l) => ({
    dia: l.dia,
    titulo: l.dia === 0 ? "Matrícula" : (getDia(l.dia)?.titulo ?? "Em breve"),
    abriram: l.abriram,
    concluiram: l.concluiram,
    travadas: Math.max(0, l.abriram - l.concluiram),
  }))

  // Agrupa as distribuições por campo, preservando a ordem que a view trouxe
  // (campo, depois alunas desc).
  const porCampo = new Map<string, Ranking[]>()
  for (const d of dist.data ?? []) {
    const atual = porCampo.get(d.campo) ?? []
    atual.push({ rotulo: d.valor, alunas: d.alunas, pct: d.pct })
    porCampo.set(d.campo, atual)
  }

  // Os interesses vêm como linhas cruas (uma por aluna) porque a resposta é
  // texto livre vindo das opções do dia — agrupar aqui é mais barato que uma
  // view por interesse.
  const porInteresse = new Map<string, Map<string, number>>()
  for (const i of interesses.data ?? []) {
    const respostas = porInteresse.get(i.interesse) ?? new Map<string, number>()
    const chave = i.resposta ?? "Não respondeu"
    respostas.set(chave, (respostas.get(chave) ?? 0) + 1)
    porInteresse.set(i.interesse, respostas)
  }

  const comercial = (alunas.data ?? []).reduce(
    (acc, a) => ({
      noRadar: acc.noRadar + a.no_radar,
      abordadas: acc.abordadas + a.abordadas,
      emConversa: acc.emConversa + a.em_conversa,
      reunioes: acc.reunioes + a.reunioes,
      propostas: acc.propostas + a.propostas,
      fechados: acc.fechados + a.fechados,
    }),
    { noRadar: 0, abordadas: 0, emConversa: 0, reunioes: 0, propostas: 0, fechados: 0 }
  )

  return {
    visaoGeral,
    funil: linhasDoFunil,
    motivos: (motivos.data ?? []).map((m) => ({
      rotulo: m.motivo,
      alunas: m.alunas,
      pct: m.pct,
    })),
    dores: (dores.data ?? []).map((d) => ({
      rotulo: d.dor,
      alunas: d.alunas,
      pct: d.pct,
    })),
    distribuicoes: [...porCampo].map(([campo, itens]) => ({ campo, itens })),
    transformacao: (transf.data ?? []).map((t) => ({
      indicador: t.indicador,
      entrada: t.entrada,
      saida: t.saida,
      evolucao: t.evolucao,
      respondentes: t.respondentes,
    })),
    interesses: [...porInteresse].map(([slug, respostas]) => {
      const detalhe = [...respostas]
        .map(([rotulo, alunas]) => ({ rotulo, alunas, pct: null }))
        .sort((a, b) => b.alunas - a.alunas)
      return {
        nome: NOME_DO_INTERESSE[slug] ?? slug,
        total: detalhe.reduce((s, d) => s + d.alunas, 0),
        detalhe,
      }
    }),
    comercial,
  }
}

export type OrdemDasAlunas = "paradas" | "avancadas" | "recentes"

/**
 * A lista de alunas.
 *
 * `paradas` é a ordem padrão de propósito: quem abriu um dia e não concluiu é
 * quem o suporte precisa alcançar hoje. Ordenar por "mais avançada" faria o
 * painel abrir mostrando quem menos precisa de ajuda.
 */
export async function getAlunas(
  ordem: OrdemDasAlunas = "paradas",
  limite = 50
): Promise<Aluna[]> {
  const db = createComunidadeServiceClient()
  let q = db
    .from("desafio_alunas")
    .select(
      "email, buyer_name, apelido, uf, matricula_concluida, dias_concluidos, ultimo_dia_aberto, atualizado_em, no_radar, abordadas, em_conversa, reunioes, propostas, fechados"
    )
    .limit(limite)

  if (ordem === "avancadas") {
    q = q.order("dias_concluidos", { ascending: false, nullsFirst: false })
  } else if (ordem === "recentes") {
    q = q.order("atualizado_em", { ascending: false, nullsFirst: false })
  } else {
    // Parou de andar: mexeu há mais tempo primeiro, entre quem ainda não
    // terminou. Quem concluiu os 21 dias sai do fim da fila.
    q = q
      .lt("dias_concluidos", TOTAL_DIAS + 1)
      .order("atualizado_em", { ascending: true, nullsFirst: false })
  }

  const { data, error } = await q
  if (error) {
    console.error("[desafio-admin] getAlunas:", error.message)
    return []
  }

  return (data ?? []).map((a) => ({
    email: a.email,
    nome: a.apelido || a.buyer_name,
    uf: a.uf,
    matriculaConcluida: a.matricula_concluida,
    diasConcluidos: a.dias_concluidos,
    ultimoDiaAberto: a.ultimo_dia_aberto,
    atualizadoEm: a.atualizado_em,
    noRadar: a.no_radar,
    abordadas: a.abordadas,
    emConversa: a.em_conversa,
    reunioes: a.reunioes,
    propostas: a.propostas,
    fechados: a.fechados,
  }))
}
