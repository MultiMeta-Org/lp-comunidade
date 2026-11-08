/**
 * As aulas extras e os modelos da Biblioteca, fora do Caderno de Campo.
 *
 * Os arquivos moram no bucket PRIVADO `videos` (desafio/biblioteca/), em
 * H.264 720p com capa .jpg ao lado — o mesmo corte dos vídeos dos dias: a URL
 * sai assinada do servidor, para quem passou pelo guard. Já moraram no Drive,
 * mas o Drive pedia acesso a quem não tinha conta compartilhada.
 *
 * Ficam liberados de uma vez, como o Caderno: são para aprofundar, não a missão
 * do dia. Dois jeitos de um material pertencer a um dia:
 *   • `dia`       — a Nati amarrou o material àquele dia ("Dia 13: vídeo do
 *                   fechamento high ticket"). Aparece no dia como "do dia".
 *   • `aprofunda` — escolha nossa pelo assunto: aparece no dia como "para
 *                   aprofundar". A BIA não usa esse campo.
 *
 * Sem `arquivo` = o material ainda não chegou: a Biblioteca mostra "em breve"
 * e o dia não mostra nada. Falta o modelo de apresentação do Dia 14, que a
 * Nati ainda vai achar, e o vídeo do Dia 13 (fechamento high ticket), que é a
 * gravação de uma reunião de venda real com clientes identificáveis — está
 * baixado, mas só entra com o ok da Nati sobre o consentimento delas.
 *
 * A BIA conhece as aulas pelas transcrições em
 * multimeta-bia/conteudo/desafio/biblioteca-<chave>.md, que apontam para
 * /desafio/biblioteca/<chave>: mudou a chave, mude lá também.
 */
export type Trilha = "sdr" | "closer" | "crm"

export type MaterialDaBiblioteca = {
  /** Vai na URL: /desafio/biblioteca/<chave>. */
  chave: string
  titulo: string
  /** Uma frase: o que ela aprende. */
  resumo: string
  trilha: Trilha
  tipo: "video" | "modelo"
  /** `storage://bucket/caminho`. Ausente = ainda não chegou. */
  arquivo?: string
  /** Capa do vídeo, também `storage://`. */
  capa?: string
  duracao?: string
  dia?: number
  aprofunda?: readonly number[]
}

export const TRILHAS: Record<Trilha, { titulo: string; descricao: string }> = {
  sdr: { titulo: "SDR", descricao: "Prospecção: quem abre a conversa e marca a reunião" },
  closer: { titulo: "Closer", descricao: "Fechamento: quem conduz a reunião e fecha o contrato" },
  crm: { titulo: "CRM", descricao: "Organização: onde cada oportunidade fica registrada" },
}

const pasta = (nome: string) => `storage://videos/desafio/biblioteca/${nome}`

export const MATERIAIS_DA_BIBLIOTECA: readonly MaterialDaBiblioteca[] = [
  // ── SDR ──
  {
    chave: "sdr-2",
    titulo: "O papel do SDR",
    resumo: "De onde vêm os leads (inbound e outbound) e como qualificar com perguntas que geram conexão.",
    trilha: "sdr",
    tipo: "video",
    arquivo: pasta("sdr-2.mp4"),
    capa: pasta("sdr-2.jpg"),
    duracao: "5 min",
    // O "vídeo SDR" que a Nati pôs no Dia 10 é esta mesma gravação, com seis
    // segundos a mais; o "SDR 2.0" é a edição. Um card só, em vez de dois iguais.
    dia: 10,
    aprofunda: [9],
  },
  {
    chave: "mentalidade-sdr",
    titulo: "Mentalidade do SDR",
    resumo: "Prospecção todo dia e como montar o WhatsApp e o Instagram da empresa para atender.",
    trilha: "sdr",
    tipo: "video",
    arquivo: pasta("mentalidade-sdr.mp4"),
    capa: pasta("mentalidade-sdr.jpg"),
    duracao: "3 min",
    aprofunda: [19],
  },
  {
    chave: "follow-up-sdr",
    titulo: "Follow-up do SDR",
    resumo: "Uma cadência de cinco a sete contatos, em canais diferentes, sem perder o lead.",
    trilha: "sdr",
    tipo: "video",
    arquivo: pasta("follow-up-sdr.mp4"),
    capa: pasta("follow-up-sdr.jpg"),
    duracao: "4 min",
    aprofunda: [10],
  },
  {
    chave: "metricas-sdr",
    titulo: "As métricas do SDR",
    resumo: "Os números do dia e o relatório que você manda à empresária no fim de cada dia.",
    trilha: "sdr",
    tipo: "video",
    arquivo: pasta("metricas-sdr.mp4"),
    capa: pasta("metricas-sdr.jpg"),
    duracao: "5 min",
    aprofunda: [18],
  },

  // ── Closer ──
  {
    chave: "closer",
    titulo: "O Closer",
    resumo: "Como se posicionar numa call high ticket: ambiente, imagem e escuta ativa.",
    trilha: "closer",
    tipo: "video",
    arquivo: pasta("closer.mp4"),
    capa: pasta("closer.jpg"),
    duracao: "2 min",
    aprofunda: [12],
  },
  {
    chave: "fechamento-high-ticket",
    titulo: "Fechamento high ticket",
    resumo: "A aula de fechamento que acompanha o Dia 13.",
    trilha: "closer",
    tipo: "video",
    dia: 13,
  },
  {
    chave: "objecoes-e-follow-up",
    titulo: "Objeções e follow-up",
    resumo: "“Sem dinheiro”, “vou falar com meu marido”: por que é prioridade, não falta, e por que retomar depois de 24 horas.",
    trilha: "closer",
    tipo: "video",
    arquivo: pasta("objecoes-e-follow-up.mp4"),
    capa: pasta("objecoes-e-follow-up.jpg"),
    duracao: "5 min",
    dia: 15,
  },
  {
    chave: "papel-closer",
    titulo: "O papel do closer",
    resumo: "Fechar na própria reunião, responder ao “vou pensar” e combinar o horário do retorno.",
    trilha: "closer",
    tipo: "video",
    arquivo: pasta("papel-closer.mp4"),
    capa: pasta("papel-closer.jpg"),
    duracao: "3 min",
    aprofunda: [17],
  },
  {
    chave: "closer-volume-qualidade",
    titulo: "Closer: volume ou qualidade?",
    resumo: "SDR e Closer lado a lado, quantas reuniões por dia e como chegar a faturar mais.",
    trilha: "closer",
    tipo: "video",
    arquivo: pasta("closer-volume-qualidade.mp4"),
    capa: pasta("closer-volume-qualidade.jpg"),
    duracao: "6 min",
    aprofunda: [21],
  },
  {
    chave: "modelo-apresentacao",
    titulo: "Modelo de apresentação",
    resumo: "O modelo para apresentar a sua atuação, do Dia 14.",
    trilha: "closer",
    tipo: "modelo",
    dia: 14,
  },
  {
    chave: "contrato-closer",
    titulo: "Modelo de contrato de closer",
    resumo: "Objeto, comissão, sigilo, exclusividade, prazo e LGPD: o contrato de prestação de serviços para preencher com a empresa.",
    trilha: "closer",
    tipo: "modelo",
    // Modelo com "xxx" no lugar dos dados. O título nos metadados do PDF
    // original trazia o nome de quem assinou; o publicado tem título neutro.
    arquivo: "storage://pdfs/desafio/contrato-closer.pdf",
    capa: "storage://pdfs/desafio/contrato-closer.jpg",
    duracao: "5 páginas",
    dia: 16,
  },

  // ── CRM ──
  {
    chave: "crm",
    titulo: "Por que o CRM",
    resumo: "Organizar os leads, ter previsão de caixa e uma rotina diária que alimenta o CRM.",
    trilha: "crm",
    tipo: "video",
    arquivo: pasta("crm.mp4"),
    capa: pasta("crm.jpg"),
    duracao: "8 min",
    aprofunda: [11],
  },
]

export function getMaterial(chave: string): MaterialDaBiblioteca | undefined {
  return MATERIAIS_DA_BIBLIOTECA.find((m) => m.chave === chave)
}

/** O que o dia mostra: primeiro os da Nati, depois os de aprofundar. Só os que já chegaram. */
export function materiaisDoDia(n: number): MaterialDaBiblioteca[] {
  const disponiveis = MATERIAIS_DA_BIBLIOTECA.filter((m) => m.arquivo)
  return [
    ...disponiveis.filter((m) => m.dia === n),
    ...disponiveis.filter((m) => m.dia !== n && m.aprofunda?.includes(n)),
  ]
}

/** Página do material: vídeo abre o player; modelo baixa o arquivo. */
export function linkDoMaterial(m: Pick<MaterialDaBiblioteca, "chave" | "tipo">): string {
  return m.tipo === "video" ? `/desafio/biblioteca/${m.chave}` : `/desafio/biblioteca/${m.chave}/arquivo`
}
