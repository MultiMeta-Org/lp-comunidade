import type { Dia } from "../tipos"

/**
 * DIA 5 — Prepare-se para se apresentar como profissional.
 *
 * O dia mais curto e o mais psicológico. A missão inteira resolve em poucos
 * minutos de propósito: WhatsApp arrumado, uma frase escrita, e a frase dita
 * em voz alta três vezes.
 *
 * O "falar em voz alta" parece bobo e é o ponto do dia: na primeira vez a
 * frase soa estranha até para ela, e na terceira já não. O documento é
 * explícito em NÃO pedir currículo de dez páginas, dezenas de posts nem
 * identidade visual — tudo isso vira desculpa para não começar. O material
 * extra (modelo no Canva, orientação de foto) fica na Biblioteca, fora do
 * caminho obrigatório.
 *
 * Os scripts falados no vídeo estão aqui para copiar — regra do Dia 3, que
 * vale para o Desafio inteiro: script falado = script disponível para copiar.
 */
export const dia05: Dia = {
  dia: 5,
  kicker: "Dia 5",
  titulo: "Hoje você vai saber o que responder quando perguntarem o que você faz.",
  lede: "Três coisinhas rápidas. Nenhuma delas exige que você pareça experiente — só que você comece a agir como a profissional que está construindo.",
  tempo: "15 minutinhos",
  objetivo:
    "Deixar o WhatsApp apresentável, escrever a própria apresentação profissional e treiná-la em voz alta. Sem currículo, sem identidade visual, sem nada que vire desculpa para não começar.",

  guarde: [
    {
      titulo: "Experiência você constrói",
      texto: "Profissionalismo você pratica desde o começo.",
    },
    {
      titulo: "Você não precisa parecer uma profissional de dez anos",
      texto: "Precisa começar a agir como a profissional que está construindo.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-5",
      label: "Dia 5 — Prepare-se para se apresentar como profissional",
      videoUrl: "storage://videos/desafio/dia-05.mp4",
      formato: "vertical",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra como responder “o que você faz?” e “como você poderia me ajudar?” sem gaguejar e sem prometer o que você não controla.",
      cta: "Já assisti",
    },

    {
      tipo: "confirma",
      chave: "whatsapp",
      ask: "Deixe seu WhatsApp profissional.",
      support:
        "A proposta é deixar o WhatsApp com uma apresentação mais profissional, pensando na imagem que queremos transmitir nos contatos comerciais.\n\n• **Foto de perfil:** escolher uma foto nítida, com boa iluminação e aparência profissional. Não precisa ser uma foto de estúdio, mas deve ser bem apresentada e transmitir credibilidade.\n• **Nome do perfil:** utilizar o nome pelo qual você deseja ser reconhecida profissionalmente.\n• **Descrição:** se possível, incluir a profissão ou área de atuação, como SDR e Closer Comercial, para que as pessoas identifiquem rapidamente com o que você trabalha.\n\nA ideia é fazer pequenos ajustes que transmitam mais profissionalismo e confiança, sem perder a naturalidade.",
      itens: [
        "Minha foto está adequada.",
        "Meu nome está identificável.",
        "Minha descrição profissional está pronta.",
      ],
      nota: "Sugestão de descrição: Profissional Comercial | SDR + Closer",
    },

    {
      tipo: "copiar",
      chave: "minha-apresentacao-base",
      ask: "Escolha uma base para a sua apresentação.",
      support:
        "Aqui temos duas versões para a mesma mensagem. Veja com qual você se identifica mais para ajustar do seu jeito no próximo passo!",
      mensagens: [
        {
          titulo: "Opção A — estou começando",
          texto:
            "Estou iniciando minha atuação profissional na área comercial como SDR e Closer, trabalhando com prospecção, desenvolvimento de oportunidades, follow-up e vendas.",
        },
        {
          titulo: "Opção B — mais direta",
          texto:
            "Eu trabalho na área comercial como SDR e Closer. Atuo desde a busca e desenvolvimento de oportunidades até follow-up e fechamento, dependendo da operação da empresa.",
        },
      ],
      confirmacao: "Copiei a que combina mais comigo.",
    },

    {
      tipo: "formulario",
      chave: "minha-apresentacao",
      ask: "Agora escreva a sua.",
      support:
        "Agora, ajuste do seu jeito: essa será a frase que você vai falar quando alguém perguntar o que você faz.",
      campos: [
        {
          tipo: "area",
          chave: "apresentacao",
          rotulo: "Minha apresentação",
          placeholder:
            "Eu trabalho na área comercial como SDR e Closer…",
        },
      ],
    },

    {
      tipo: "confirma",
      chave: "treinei",
      ask: "Agora fale em voz alta. Três vezes.",
      support:
        "Parece bobo, eu sei. Mas na primeira vez essa frase vai soar estranha até para você. Na terceira já começa a ficar diferente — e daqui a alguns dias você vai falar isso numa conversa real.",
      itens: ["Falei minha apresentação três vezes em voz alta."],
      cta: "Concluir minha missão de hoje",
    },

    // ── Central de scripts: fica no dia, para ela voltar quando precisar ──
    {
      tipo: "copiar",
      chave: "central-de-scripts",
      ask: "Guarde esses três para quando a conversa vier.",
      support:
        "Você não precisa decorar. Quando alguém perguntar, volte aqui e copie.",
      mensagens: [
        {
          titulo: "“O que você faz?”",
          texto:
            "Eu trabalho na área comercial como SDR e Closer. Atuo desde a busca e desenvolvimento de oportunidades até follow-up e fechamento, dependendo da operação da empresa.",
        },
        {
          titulo: "“Como você poderia me ajudar?”",
          texto:
            "Primeiro eu precisaria entender um pouco melhor como funciona o comercial de vocês hoje, como chegam as oportunidades e como esses contatos são conduzidos. A partir disso consigo entender melhor onde eu poderia contribuir.",
        },
        {
          titulo: "Quando alguém quiser indicar você",
          texto:
            "Claro, pode passar meu contato sim. Estou iniciando minha atuação profissional na área comercial como SDR e Closer, trabalhando com prospecção, desenvolvimento de oportunidades, follow-up e vendas. Vou gostar de conhecer melhor o negócio e entender como funciona o comercial por lá.",
        },
      ],
      confirmacao: "Li os três e sei onde encontrar.",
      cta: "Concluir o Dia 5",
    },
  ],

  fim: {
    kicker: "Dia 5 concluído",
    titulo: "Agora você tem a sua frase.",
    lede: "Não precisava de mais nada hoje. Você já sabe o que responder — e já disse em voz alta, que é a parte que a maioria pula.",
    badge: "Dia 5 de 21 concluído",
    feito: [
      "Deixou o WhatsApp profissional",
      "Escreveu a sua apresentação",
      "Falou em voz alta três vezes",
      "Guardou os scripts para quando a conversa vier",
    ],
    amanha:
      "Amanhã nós voltamos para o mercado. Você já tem suas primeiras empresas — vamos chegar a trinta e escolher cinco para começar.",
  },
}
