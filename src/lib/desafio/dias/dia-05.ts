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
        "Nele eu te conto com quem você vai conversar numa reunião — o próprio empresário ou o setor responsável pela contratação —, como responder “o que você faz?” e como olhar para a remuneração. Os próximos passos trazem tudo isso por escrito.",
      cta: "Já assisti",
    },

    // O vídeo fala de comissão sem fazer a conta, e a aluna sai comparando
    // percentuais. A conta escrita aqui ensina a olhar o ganho do mês inteiro.
    // Exemplos ilustrativos — a nota diz isso, como no objetivo de renda do Dia 0.
    {
      tipo: "leitura",
      chave: "ganho-total",
      ask: "Antes da comissão, olhe o ganho total.",
      support:
        "Quando falarem de remuneração, não julgue pelo percentual sozinho. A mesma comissão pode ser pouco ou muito, dependendo do valor do produto.",
      corpo: [
        "**3% de um produto de R$ 297** = R$ 8,91 por venda.\n**3% de um produto de R$ 50.000** = R$ 1.500 por venda.",
        "**Cenário 1:** fixo de R$ 500 + 3% de um produto de R$ 50.000. Com duas vendas no mês: R$ 500 + R$ 3.000 = **R$ 3.500**.",
        "**Cenário 2:** fixo de R$ 2.000 + 3% de um produto de R$ 297. Com trinta vendas no mês: R$ 2.000 + R$ 267,30 = **R$ 2.267,30**.",
        "O fixo menor pagou mais. A conta que importa é sempre a do mês inteiro: **fixo + (comissão × valor do produto × quantas vendas)**.",
      ],
      destaque: "Pense no ganho total do mês, não no percentual.",
      nota: "São exemplos para você aprender a fazer a conta, não promessa de ganho.",
      cta: "Entendi",
    },

    {
      tipo: "confirma",
      chave: "whatsapp",
      ask: "Deixe seu WhatsApp profissional.",
      support:
        "A proposta é deixar o WhatsApp com uma apresentação mais profissional, pensando na imagem que queremos transmitir nos contatos comerciais. Faça os ajustes abaixo e, quando terminar cada um, marque para concluir.\n\n• **Foto de perfil:** escolher uma foto nítida, com boa iluminação e aparência profissional. Não precisa ser uma foto de estúdio, mas deve ser bem apresentada e transmitir credibilidade.\n• **Nome do perfil:** utilizar o nome pelo qual você deseja ser reconhecida profissionalmente.\n• **Descrição:** se possível, incluir a profissão ou área de atuação, como **Especialista Comercial** ou **Setor Comercial**, para que as pessoas identifiquem rapidamente com o que você trabalha. Evite “SDR” e “Closer” aqui: a maioria dos empresários não conhece esses termos.\n\nA ideia é fazer pequenos ajustes que transmitam mais profissionalismo e confiança, sem perder a naturalidade.",
      itens: [
        "Minha foto está adequada.",
        "Meu nome está identificável.",
        "Minha descrição profissional está pronta.",
      ],
      nota: "Sugestão de descrição: Especialista Comercial | Vendas e atendimento",
      cta: "Pronto, tudo marcado",
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
            "Estou iniciando minha atuação profissional na área comercial, ajudando empresas a atender, acompanhar e converter os interessados que chegam até elas em vendas.",
        },
        {
          titulo: "Opção B — mais direta",
          texto:
            "Eu trabalho na área comercial. Ajudo empresas desde a busca de novos clientes até o acompanhamento e o fechamento das vendas, dependendo de como cada empresa funciona.",
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
            "Eu trabalho na área comercial, ajudando empresas a…",
        },
      ],
    },

    {
      tipo: "confirma",
      chave: "treinei",
      ask: "Agora fale em voz alta. Três vezes.",
      support:
        "Parece bobo, eu sei. Mas na primeira vez essa frase vai soar estranha até para você. Na terceira já começa a ficar diferente — e daqui a alguns dias você vai falar isso numa conversa real.",
      mostrar: { chave: "apresentacao", rotulo: "A sua apresentação" },
      itens: ["Falei minha apresentação três vezes em voz alta."],
    },

    // ── Central de scripts: fica no dia, para ela voltar quando precisar ──
    {
      tipo: "copiar",
      chave: "central-de-scripts",
      ask: "Guarde esses três para quando a conversa vier.",
      support:
        "Você não precisa decorar. Eles ficam guardados na **Central de Scripts** — o botão de mensagem no topo de todas as páginas do Desafio —, junto com todos os outros scripts da jornada.",
      mensagens: [
        {
          titulo: "“O que você faz?”",
          texto:
            "Eu trabalho na área comercial. Ajudo empresas desde a busca de novos clientes até o acompanhamento e o fechamento das vendas. E vocês, como funciona a parte comercial por aí hoje?",
        },
        {
          titulo: "“Como você poderia me ajudar?”",
          texto:
            "Primeiro eu precisaria entender um pouco melhor como funciona o comercial de vocês hoje, como chegam as oportunidades e como esses contatos são conduzidos. A partir disso consigo entender melhor onde eu poderia contribuir. Hoje, como os novos clientes costumam chegar até vocês?",
        },
        {
          titulo: "Quando alguém quiser indicar você",
          texto:
            "Claro, pode passar meu contato sim! Estou iniciando minha atuação na área comercial, ajudando empresas a atender, acompanhar e fechar as vendas com os interessados que chegam. Vou gostar de conhecer melhor o negócio. Você me conta um pouquinho do que essa empresa faz?",
        },
      ],
      confirmacao: "Li os três e sei que ficam na Central de Scripts.",
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
