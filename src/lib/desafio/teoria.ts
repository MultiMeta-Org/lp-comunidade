import type { Aviso, Respostas } from "./tipos"
import {
  CALCULADORA_ACESSO_URL,
  CALCULADORA_HOTMART_URL,
  MULTIQUIZ_ALUNA_URL,
  MULTIQUIZ_URL,
  PODCAST_URL,
  TESTE_PERFIL_URL,
} from "@/lib/links"

/**
 * A parte teórica do Desafio: as aulas do Método que vêm depois da matrícula e
 * antes do Dia 1.
 *
 * O Desafio tem dois momentos (é o áudio de boas-vindas da Nati): primeiro ela
 * entende como o mercado funciona e qual é o lugar dela nele; depois vai para
 * a prática, um dia por vez. As fases seguem as do Método EVP, com uma troca
 * de nome: a "Fase 2.1" do Método (SDR, Closer e CS) aqui é a Fase 3. A fase
 * da rotina comercial não entra — ela é o trabalho de quem já fechou, e mora
 * no "Fechei meu contrato".
 *
 * A teoria NÃO trava o Dia 1, pela mesma regra da missão incompleta: a home
 * aponta para ela até acabar, e quem pula segue avisada do que falta. Travar
 * horas de aula na frente da primeira missão fazia a aluna parar em vez de
 * seguir.
 *
 * O progresso fica nas respostas do Dia Zero, uma chave por aula
 * (`teoria:<chave>`). Uma chave por aula, e não uma lista, porque a gravação
 * MESCLA as chaves: dois cliques rápidos em aulas diferentes não se apagam.
 * E o Dia Zero porque é a linha que ela já tem desde a matrícula — sem tabela
 * nova no schema do CRM.
 *
 * Os vídeos moram no bucket privado `videos` (desafio/teoria/), em H.264 720p
 * com capa .jpg ao lado, como os da Biblioteca. Os originais estão no Drive
 * da Nati.
 */

export type FaseDaTeoria = 1 | 2 | 3

export const FASES_DA_TEORIA: Record<FaseDaTeoria, { titulo: string; descricao: string }> = {
  1: {
    titulo: "Reconhecimento e posicionamento",
    descricao: "O despertar da sua nova identidade profissional: dinheiro, chamado, o seu papel e a sua virada.",
  },
  2: {
    titulo: "O novo mercado de vendas",
    descricao: "Como o mercado funciona, o funil, as estratégias, as objeções e como você é remunerada.",
  },
  3: {
    titulo: "SDR, Closer e CS",
    descricao: "Os três papéis do processo comercial, do primeiro contato ao encantamento do cliente.",
  },
}

/** Um produto em destaque dentro da aula (a calculadora, o MultiQuiz). */
export type Destaque = {
  kicker: string
  titulo: string
  texto: string
  preco?: string
  links: readonly { rotulo: string; href: string }[]
}

export type ItemDaTeoria = {
  /** Vai na URL (/desafio/teoria/<chave>) e na chave do progresso. Não mudar depois de no ar. */
  chave: string
  fase: FaseDaTeoria
  titulo: string
  /**
   *   • video     — toca no portal (`arquivo` no bucket);
   *   • documento — o PDF da fase, para baixar (`arquivo` no bucket);
   *   • externo   — fora do portal (o podcast, o teste de perfil): `href`.
   */
  tipo: "video" | "documento" | "externo"
  /** `storage://bucket/caminho`. Ausente = ainda não chegou: aparece "em breve" e não conta. */
  arquivo?: string
  capa?: string
  href?: string
  duracao?: string
  resumo?: string
  avisos?: readonly Aviso[]
  destaques?: readonly Destaque[]
  /** Levantar a mão para um produto que ainda não existe. Vai para desafio_interesses. */
  interesse?: { chave: string; titulo: string; texto: string; botao: string }
  /** Arquivo para fazer junto com a aula (a cartinha da Virada). */
  anexo?: { rotulo: string; arquivo: string }
  /** Depois do teste, ela marca o perfil que deu. Fica em `perfil_comercial` no Dia Zero. */
  perfil?: true
}

const video = (chave: string) => ({
  arquivo: `storage://videos/desafio/teoria/${chave}.mp4`,
  capa: `storage://videos/desafio/teoria/${chave}.jpg`,
})
/**
 * Aula que já estava na Biblioteca (o mesmo arquivo do Drive, mesma duração):
 * toca o que já está no bucket em vez de uma segunda cópia.
 */
const daBiblioteca = (nome: string) => ({
  arquivo: `storage://videos/desafio/biblioteca/${nome}.mp4`,
  capa: `storage://videos/desafio/biblioteca/${nome}.jpg`,
})
const documento = (nome: string) => ({
  arquivo: `storage://pdfs/desafio/teoria/${nome}.pdf`,
  capa: `storage://pdfs/desafio/teoria/${nome}.jpg`,
})

/** Os perfis do teste. A pergunta é de escolha única: é o setor que mais conecta HOJE. */
export const PERFIS_COMERCIAIS = ["SDR", "Closer", "CS"] as const

export const ITENS_DA_TEORIA: readonly ItemDaTeoria[] = [
  // ── Fase 1 ──
  {
    chave: "f1-dinheiro-venda-chamado",
    fase: 1,
    titulo: "A verdade sobre dinheiro, venda e chamado",
    tipo: "video",
    ...video("f1-dinheiro-venda-chamado"),
    duracao: "6 min",
  },
  {
    chave: "f1-empresa-redentiva",
    fase: 1,
    titulo: "O que é uma empresa redentiva",
    tipo: "video",
    ...video("f1-empresa-redentiva"),
    duracao: "9 min",
    avisos: [
      {
        icone: "livro",
        titulo: "Bônus: o Marketplace, no Dia 8",
        texto:
          "No Dia 8 do Desafio você ganha de bônus o acesso ao Marketplace da MultiMeta. Para chegar lá preparada, siga o Desafio um dia por vez: é ele que te prepara para aproveitar o Marketplace de verdade.",
      },
    ],
  },
  {
    chave: "f1-seu-papel",
    fase: 1,
    titulo: "Seu papel",
    tipo: "video",
    ...video("f1-seu-papel"),
    duracao: "5 min",
  },
  {
    chave: "f1-papel-empresario",
    fase: 1,
    titulo: "Papel do empresário",
    tipo: "video",
    ...video("f1-papel-empresario"),
    duracao: "3 min",
  },
  {
    chave: "f1-mercado-diferente",
    fase: 1,
    titulo: "O mercado existe, mas aqui é diferente",
    tipo: "video",
    ...video("f1-mercado-diferente"),
    duracao: "4 min",
  },
  {
    chave: "f1-sabedoria-financeira",
    fase: 1,
    titulo: "Sabedoria financeira",
    tipo: "video",
    ...video("f1-sabedoria-financeira"),
    duracao: "4 min",
    destaques: [
      {
        kicker: "Só aqui, para alunas",
        titulo: "Calculadora de ganhos",
        texto:
          "Quanto você precisa ganhar por mês? A calculadora junta as suas contas, as dívidas que você quer quitar e o quanto quer guardar para os seus projetos e sonhos — e te dá o número.",
        preco: "R$ 13,00 aqui · R$ 47,00 fora do Desafio",
        links: [
          { rotulo: "Comprar por R$ 13,00", href: CALCULADORA_HOTMART_URL },
          { rotulo: "Já comprei: abrir a calculadora", href: CALCULADORA_ACESSO_URL },
        ],
      },
    ],
    interesse: {
      chave: "app-financeiro",
      titulo: "Vem aí: o aplicativo financeiro da MultiMeta",
      texto: "Ainda não tem data, mas está próximo. Quer ser avisada quando ele lançar?",
      botao: "Tenho interesse",
    },
    avisos: [
      {
        icone: "whatsapp",
        titulo: "E o planner físico?",
        texto:
          "Está sem estoque no momento. Quando voltar, ele entra aqui no portal — e a gente avisa no grupo do WhatsApp, junto com o lançamento do aplicativo.",
      },
    ],
  },
  {
    chave: "f1-fundacao",
    fase: 1,
    titulo: "A fundação",
    tipo: "video",
    ...video("f1-fundacao"),
    duracao: "8 min",
  },
  {
    chave: "f1-virada",
    fase: 1,
    titulo: "A virada",
    tipo: "video",
    ...video("f1-virada"),
    duracao: "3 min",
    resumo:
      "Depois da aula, baixe a sua cartinha: a Carta Compromisso para a sua família. Leia com calma, preencha com o seu nome e a data, e guarde onde você vai ver.",
    anexo: { rotulo: "Baixar a Carta Compromisso", arquivo: "storage://pdfs/desafio/teoria/f1-cartinha.pdf" },
  },
  {
    chave: "teste-perfil",
    fase: 1,
    titulo: "Teste: qual é o seu perfil comercial?",
    tipo: "externo",
    href: TESTE_PERFIL_URL ?? undefined,
    resumo:
      "Responda o teste e, no fim, marque aqui o perfil que deu para você: SDR, Closer ou CS.",
    perfil: true,
    avisos: [
      {
        titulo: "O resultado não te limita",
        texto:
          "Ele não quer dizer que você só pode se candidatar às vagas daquele perfil. Teste todas as vagas! O resultado mostra o setor que mais conecta HOJE com a sua personalidade — só isso.",
      },
    ],
  },
  {
    chave: "f1-nossa-missao",
    fase: 1,
    titulo: "Nossa missão",
    tipo: "video",
    ...video("f1-nossa-missao"),
    duracao: "5 min",
  },
  {
    chave: "devocional",
    fase: 1,
    titulo: "Devocional diária",
    tipo: "externo",
    href: PODCAST_URL,
    resumo:
      "Todos os dias tem devocional no PodProsperar, no Spotify. Ouça a de hoje — e faça disso um hábito ao longo do Desafio.",
  },
  {
    chave: "documento-fase-1",
    fase: 1,
    titulo: "Documento da Fase 1",
    tipo: "documento",
    ...documento("f1-documento"),
    resumo: "O despertar da sua nova identidade profissional. O material da Fase 1 para baixar e consultar quando quiser.",
  },

  // ── Fase 2 ──
  {
    chave: "f2-tamanho-mercado",
    fase: 2,
    titulo: "O tamanho do mercado brasileiro",
    tipo: "video",
    ...video("f2-tamanho-mercado"),
    duracao: "13 min",
  },
  {
    chave: "f2-mercado-de-vendas",
    fase: 2,
    titulo: "O que é o mercado de vendas hoje",
    tipo: "video",
    ...video("f2-mercado-de-vendas"),
    duracao: "9 min",
  },
  {
    chave: "f2-visao-empresario",
    fase: 2,
    titulo: "A visão do empresário",
    tipo: "video",
    ...video("f2-visao-empresario"),
    duracao: "8 min",
  },
  {
    chave: "f2-segmentacao",
    fase: 2,
    titulo: "A segmentação escolhida",
    tipo: "video",
    ...video("f2-segmentacao"),
    duracao: "3 min",
  },
  {
    chave: "f2-pilares-venda",
    fase: 2,
    titulo: "Os pilares da venda",
    tipo: "video",
    ...video("f2-pilares-venda"),
    duracao: "15 min",
  },
  {
    chave: "f2-funil",
    fase: 2,
    titulo: "O funil de vendas",
    tipo: "video",
    ...video("f2-funil"),
    duracao: "8 min",
  },
  {
    chave: "f2-negocio-cliente",
    fase: 2,
    titulo: "O negócio do cliente",
    tipo: "video",
    ...video("f2-negocio-cliente"),
    duracao: "7 min",
    avisos: [
      {
        titulo: "O foco do Desafio",
        texto:
          "Nesta aula eu falo do Marketplace. Ele é um bônus que chega no Dia 8, mas o foco do Desafio Empreendedora Anônima é você captar os SEUS clientes nesses 21 dias. Não fique só no Marketplace: o objetivo é você nunca depender só da gente para trabalhar e crescer financeiramente.",
      },
    ],
  },
  {
    chave: "f2-gatilhos",
    fase: 2,
    titulo: "Gatilhos mentais x estratégias de venda",
    tipo: "video",
    ...video("f2-gatilhos"),
    duracao: "5 min",
  },
  {
    chave: "f2-estrategias",
    fase: 2,
    titulo: "Estratégias que funcionam",
    tipo: "video",
    ...video("f2-estrategias"),
    duracao: "7 min",
    destaques: [
      {
        kicker: "Ferramenta de trabalho",
        titulo: "MultiQuiz",
        texto:
          "A plataforma de quiz que eu mostro na aula é ferramenta de trabalho: para você, para o negócio que você atender, para a empresa do seu marido ou da sua família. Ela capta leads qualificados. Não é obrigação — é para quem quer se profissionalizar e crescer.",
        preco: "R$ 89,90 por mês para alunas",
        links: [
          {
            rotulo: MULTIQUIZ_ALUNA_URL ? "Assinar com o preço de aluna" : "Conhecer o MultiQuiz",
            href: MULTIQUIZ_ALUNA_URL ?? MULTIQUIZ_URL,
          },
        ],
      },
    ],
  },
  {
    chave: "f2-objecoes",
    fase: 2,
    titulo: "Objeções e follow-up",
    tipo: "video",
    ...daBiblioteca("objecoes-e-follow-up"),
    duracao: "5 min",
    avisos: [
      {
        titulo: "Os scripts já estão te esperando",
        texto:
          "Na parte prática você tem a Central de Scripts, com as respostas para as objeções e as mensagens de follow-up. Não precisa decorar nada agora.",
        link: { rotulo: "Ver a Central de Scripts", href: "/desafio/scripts" },
      },
    ],
  },
  {
    chave: "f2-escada-produtos",
    fase: 2,
    titulo: "Escada de produtos",
    tipo: "video",
    ...video("f2-escada-produtos"),
    duracao: "5 min",
  },
  {
    chave: "f2-remuneracao",
    fase: 2,
    titulo: "Remuneração",
    tipo: "video",
    ...daBiblioteca("remuneracao"),
    duracao: "10 min",
  },
  {
    chave: "documento-fase-2",
    fase: 2,
    titulo: "Documento da Fase 2",
    tipo: "documento",
    ...documento("fase-2"),
    resumo: "O Novo Mercado de Vendas: fundamentos e estratégia. O material da Fase 2 para baixar.",
  },

  // ── Fase 3 (a Fase 2.1 do Método) ──
  {
    // A aula "O papel do SDR" da Biblioteca (o arquivo do Drive era "SDR 2").
    chave: "f3-sdr",
    fase: 3,
    titulo: "SDR",
    tipo: "video",
    ...daBiblioteca("sdr-2"),
    duracao: "5 min",
  },
  {
    chave: "f3-social-seller",
    fase: 3,
    titulo: "Social Seller",
    tipo: "video",
  },
  {
    chave: "f3-metricas-sdr",
    fase: 3,
    titulo: "As métricas do SDR",
    tipo: "video",
    ...daBiblioteca("metricas-sdr"),
    duracao: "5 min",
  },
  {
    chave: "f3-mentalidade-sdr",
    fase: 3,
    titulo: "Mentalidade do SDR",
    tipo: "video",
    ...daBiblioteca("mentalidade-sdr"),
    duracao: "3 min",
    avisos: [
      {
        titulo: "O WhatsApp da empresa, dentro do CRM",
        texto:
          "No CRM da MultiMeta você instala a extensão do WhatsApp Web e atende pelo WhatsApp do empresário — sem chip, sem usar o seu número. Facilita o seu dia a dia, e o empresário não fica \"cego\": ele acompanha as conversas e o trabalho do comercial.",
      },
    ],
  },
  {
    chave: "f3-follow-up-sdr",
    fase: 3,
    titulo: "Follow-up do SDR",
    tipo: "video",
    ...daBiblioteca("follow-up-sdr"),
    duracao: "4 min",
  },
  {
    chave: "f3-closer",
    fase: 3,
    titulo: "O Closer",
    tipo: "video",
    ...daBiblioteca("closer"),
    duracao: "2 min",
  },
  {
    chave: "f3-papel-closer",
    fase: 3,
    titulo: "O papel do Closer",
    tipo: "video",
    ...daBiblioteca("papel-closer"),
    duracao: "3 min",
  },
  {
    chave: "f3-cs",
    fase: 3,
    titulo: "O CS",
    tipo: "video",
    ...video("f3-cs"),
    duracao: "5 min",
  },
  {
    chave: "documento-fase-3",
    fase: 3,
    titulo: "Documento da Fase 3",
    tipo: "documento",
    ...documento("fase-3"),
    resumo: "Domine o processo comercial: do lead ao encantamento. O manual de SDR, Closer e CS para baixar.",
  },
]

/** Já dá para abrir: o vídeo ou o PDF subiu, o link existe. */
export function itemDisponivel(item: ItemDaTeoria): boolean {
  return item.tipo === "externo" ? Boolean(item.href) : Boolean(item.arquivo)
}

export function getItemDaTeoria(chave: string): ItemDaTeoria | undefined {
  return ITENS_DA_TEORIA.find((i) => i.chave === chave)
}

/** Os que contam: os que já chegaram. Um "em breve" não pode segurar o 100%. */
export const ITENS_CONTADOS = ITENS_DA_TEORIA.filter(itemDisponivel)

export const chaveDoProgresso = (chave: string) => `teoria:${chave}`

export type ProgressoDaTeoria = {
  feitos: ReadonlySet<string>
  total: number
  concluida: boolean
  /** O primeiro que falta, na ordem da trilha. */
  proximo: ItemDaTeoria | null
}

/** Lê o progresso das respostas do Dia Zero. */
export function progressoDaTeoria(respostasDoDiaZero: Respostas | undefined): ProgressoDaTeoria {
  const feitos = new Set(
    ITENS_CONTADOS.filter((i) => respostasDoDiaZero?.[chaveDoProgresso(i.chave)] === true).map(
      (i) => i.chave
    )
  )
  const proximo = ITENS_CONTADOS.find((i) => !feitos.has(i.chave)) ?? null
  return { feitos, total: ITENS_CONTADOS.length, concluida: proximo === null, proximo }
}

/** O próximo disponível depois deste, na ordem da trilha (para o "próxima aula"). */
export function itemSeguinte(chave: string): ItemDaTeoria | null {
  const i = ITENS_CONTADOS.findIndex((x) => x.chave === chave)
  return i === -1 ? null : (ITENS_CONTADOS[i + 1] ?? null)
}

export function itemAnterior(chave: string): ItemDaTeoria | null {
  const i = ITENS_CONTADOS.findIndex((x) => x.chave === chave)
  return i <= 0 ? null : ITENS_CONTADOS[i - 1]
}
