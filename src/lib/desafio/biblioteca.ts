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
 * e o dia não mostra nada. Um modelo pode morar fora do bucket (o do Dia 14 é
 * um design no Canva): aí `arquivo` é o https e o /arquivo só redireciona.
 *
 * A BIA conhece as aulas pelas transcrições em
 * multimeta-bia/conteudo/desafio/biblioteca-<chave>.md, que apontam para
 * /desafio/biblioteca/<chave>: mudou a chave, mude lá também.
 */
export type Trilha = "sdr" | "closer" | "crm" | "rotina"

export type MaterialDaBiblioteca = {
  /** Vai na URL: /desafio/biblioteca/<chave>. */
  chave: string
  titulo: string
  /** Uma frase: o que ela aprende. */
  resumo: string
  trilha: Trilha
  tipo: "video" | "modelo"
  /** `storage://bucket/caminho`, ou https para modelo de fora (Canva). Ausente = ainda não chegou. */
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
  // O "fui contratada, e agora?" que a Nati pediu na Biblioteca.
  rotina: { titulo: "Rotina", descricao: "Depois do contrato: o dia a dia do trabalho comercial" },
}

const pasta = (nome: string) => `storage://videos/desafio/biblioteca/${nome}`

/**
 * A reunião ao vivo da Monique (fechamento de R$ 6.500). A Nati pediu que ela
 * venha ANTES do roteiro de reunião do Dia 11 e na página "Vou fazer uma
 * reunião": ver que é leve prepara mais que qualquer script. 66 min, por isso
 * mais comprimido que as outras aulas (o bucket aceita até 500 MB).
 */
export const MONIQUE_FECHAMENTO_URL = pasta("fechamento-high-ticket.mp4")

/** As demonstrações do CRM e do MultiQuiz, que também passam no Dia 16, antes
 *  do bloco de interesse. */
export const CRM_POR_DENTRO_URL = pasta("crm-por-dentro.mp4")
export const MULTIQUIZ_URL = pasta("multiquiz.mp4")

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
    // Já foi o material do Dia 10; a Nati trocou pelo vídeo do CRM, que é o
    // assunto do dia. Segue como aprofundamento do follow-up — e, a pedido
    // dela, também no alto do Dia 12, ao lado do vídeo do Closer.
    aprofunda: [9, 12],
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
  {
    chave: "qualificando-sdr",
    titulo: "Qualificando como SDR",
    resumo: "Do direct para o WhatsApp, a escada de produtos e o formulário que diz se o lead está pronto para a reunião.",
    trilha: "sdr",
    tipo: "video",
    arquivo: pasta("qualificando-sdr.mp4"),
    capa: pasta("qualificando-sdr.jpg"),
    duracao: "15 min",
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
    titulo: "Reunião ao vivo: fechamento de R$ 6.500",
    resumo: "A Monique conduzindo uma reunião real, do começo ao fechamento de uma mentoria high ticket. Essa durou mais de uma hora porque a cliente deu abertura para conversar — normalmente uma reunião leva de 20 a 30 minutos, e está tudo bem.",
    trilha: "closer",
    tipo: "video",
    arquivo: MONIQUE_FECHAMENTO_URL,
    capa: pasta("fechamento-high-ticket.jpg"),
    duracao: "1h06",
    // No Dia 11 ela já é um passo (antes do roteiro): no alto do dia, repetia.
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
    chave: "remuneracao",
    titulo: "Remuneração: fixo, comissão ou os dois",
    resumo: "Os três modelos de remuneração com exemplos de valores, por que só comissão pode render mais quando a empresa tem volume, contrato PJ e como funciona a comissão em produto recorrente.",
    trilha: "closer",
    tipo: "video",
    arquivo: pasta("remuneracao.mp4"),
    capa: pasta("remuneracao.jpg"),
    duracao: "10 min",
    // O Dia 12 a abre pelo botão do passo dos modelos de remuneração — onde a
    // Nati pediu. Sem `dia`, para não aparecer de novo no alto do mesmo dia.
  },
  {
    chave: "modelo-apresentacao",
    titulo: "Modelo de apresentação",
    resumo: "O modelo no Canva para apresentar a sua atuação com cara de profissional: duplique e troque pelos seus dados.",
    trilha: "closer",
    tipo: "modelo",
    arquivo: "https://canva.link/zocsf5wtp3r6qe0",
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
    // Pedido da Nati: o vídeo do CRM é o do Dia 10, no alto do dia.
    dia: 10,
    aprofunda: [11],
  },
  {
    chave: "crm-por-dentro",
    titulo: "O CRM por dentro",
    resumo: "Um lead do cadastro ao fechamento: etapas da jornada, observações, follow-up agendado que vira tarefa, a agenda do time e os relatórios.",
    trilha: "crm",
    tipo: "video",
    arquivo: CRM_POR_DENTRO_URL,
    capa: pasta("crm-por-dentro.jpg"),
    duracao: "3 min",
  },
  {
    chave: "multiquiz",
    titulo: "O MultiQuiz na prática",
    resumo: "Um e-book de presente no Instagram que capta o contato, mostra quem está quente e diz se o público ideal está chegando.",
    trilha: "crm",
    tipo: "video",
    arquivo: MULTIQUIZ_URL,
    capa: pasta("multiquiz.jpg"),
    duracao: "1 min",
  },

  // ── Rotina ──
  {
    chave: "rotina-comercial-evp",
    titulo: "Rotina comercial, do jeito do Método EVP",
    resumo: "O dia de quem trabalha no comercial: o que olhar de manhã, quando prospectar, fazer follow-up e marcar reunião, alimentar o CRM e mandar o relatório para a empresária.",
    trilha: "rotina",
    tipo: "video",
    arquivo: pasta("evp-rotina.mp4"),
    capa: pasta("evp-rotina.jpg"),
    duracao: "25 min",
    // Pedido da Nati: o vídeo da Fase 3 do Método EVP no alto do Dia 19.
    dia: 19,
  },
  {
    chave: "nossa-rotina-comercial",
    titulo: "Nossa rotina comercial: a Nati e o Fábio",
    resumo: "Como a Nati e o Fábio, closer dela, trabalham de verdade: as perguntas do começo, falar como a empresa fala, gravar e transcrever reuniões, metas da semana e o relatório de sexta. É um exemplo — cada empresa tem o seu jeito.",
    trilha: "rotina",
    tipo: "video",
    arquivo: pasta("rotina-comercial.mp4"),
    capa: pasta("rotina-comercial.jpg"),
    duracao: "29 min",
    // Mora no "Fechei meu contrato", que é para onde ela vai depois do sim.
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
