import type { Dia } from "../tipos"

/**
 * DIA 2 — Como é o trabalho de uma SDR + Closer na prática.
 *
 * Ontem ela conheceu a profissão; hoje entende o trabalho. O dia inteiro
 * empurra na direção de uma ideia só, e ela está na missão: a palavra
 * PODERIAM, em destaque. A aluna ainda não está diagnosticando a empresa —
 * está levantando hipóteses e, principalmente, descobrindo o que ela ainda
 * PRECISA PERGUNTAR. "Não conclua aquilo que você ainda precisa perguntar."
 *
 * A missão não pede o nome da empresa de novo: ela volta para a que foi
 * cadastrada ontem. Perguntar duas vezes o que o sistema já sabe ensina que o
 * registro não serve para nada.
 *
 * O interesse no Closer Presencial NÃO se repete aqui, de propósito — está no
 * vídeo como reforço de que existem modelos diferentes de atuação, mas quem
 * levantou a mão ontem já está registrada.
 */
export const dia02: Dia = {
  dia: 2,
  kicker: "Dia 2",
  titulo: "Hoje você entende como esse trabalho acontece de verdade.",
  lede: "Como é um dia de SDR, como é um dia de Closer, e o que é — e o que não é — sua responsabilidade.",
  tempo: "20 minutinhos",
  objetivo:
    "Mostrar a rotina real das duas funções, plantar o princípio do registro (o trabalho comercial não pode existir só na cabeça dela) e separar o que está sob a responsabilidade dela do que não está.",

  guarde: [
    {
      titulo: "SDR",
      texto:
        "Trabalha principalmente na construção e no desenvolvimento das oportunidades antes da venda.",
    },
    {
      titulo: "Closer",
      texto: "Conduz oportunidades mais maduras pelo processo de decisão e fechamento.",
    },
    {
      titulo: "SDR + Closer",
      texto:
        "Em determinadas operações, uma mesma profissional pode atuar nas duas etapas.",
    },
    {
      titulo: "Registro",
      texto:
        "O comercial precisa de informação. Conversas, próximos passos e oportunidades precisam ser acompanhados e registrados.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-2",
      label: "Dia 2 — Como é o trabalho de uma SDR + Closer na prática",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Como é um dia de SDR, como é um dia de Closer, e o que acontece antes, durante e depois de uma reunião.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "lembre-se",
      ask: "Lembre-se",
      corpo: [
        "**Você não controla tudo. Mas precisa cuidar muito bem daquilo que está sob sua responsabilidade.**",
        "**Não conclua aquilo que você ainda precisa perguntar.**",
        "**Profissional boa não tenta adivinhar a operação.** Ela sabe o que precisa entender e perguntar para executar bem.",
      ],
      // A empresa também tem responsabilidade: contexto, informação, acessos,
      // limites e direcionamento. Sem isso, não é a profissional que falha.
      nota: "A empresa também tem o seu lado: ela precisa te dar contexto, informação, acessos e direcionamento para você conseguir executar bem.",
      cta: "Entendi",
    },

    {
      tipo: "empresa",
      chave: "missao-dia-2",
      ask: "Volte para a empresa que você escolheu ontem.",
      support:
        "Você não precisa digitar nada de novo. Hoje é só olhar para ela com o que você aprendeu.",
      campos: [
        {
          tipo: "checks",
          chave: "como_clientes_chegam",
          rotulo: "Como os clientes PARECEM chegar até essa empresa?",
          ajuda: "Pode marcar mais de um. Parecem — você ainda não sabe, está observando.",
          opcoes: [
            "Instagram",
            "WhatsApp",
            "Site",
            "Anúncios",
            "Indicação",
            "Loja ou local físico",
            "Não consigo saber",
            "Outro",
          ],
        },
        {
          tipo: "checks",
          chave: "atividades_possiveis",
          rotulo:
            "Pensando no que você aprendeu hoje, quais atividades comerciais PODERIAM existir nessa empresa?",
          ajuda: "Pode marcar mais de uma. Poderiam — é hipótese, não diagnóstico.",
          opcoes: [
            "Buscar novas oportunidades",
            "Responder interessados",
            "Qualificar contatos",
            "Fazer follow-up",
            "Agendar reuniões ou avaliações",
            "Conduzir reunião comercial",
            "Negociar e fechar",
            "Registrar e acompanhar oportunidades",
            "Ainda não tenho informação suficiente",
          ],
        },
        {
          tipo: "area",
          chave: "o_que_perguntaria",
          rotulo:
            "O que você ainda precisaria perguntar ao empresário antes de saber como realmente poderia ajudar?",
          ajuda:
            "Não tente adivinhar. Pense nas informações que ainda faltam para você compreender a operação.",
        },
      ],
      cta: "Salvar missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 2 concluído",
    titulo: "Agora você sabe o que é o trabalho.",
    lede: "E, mais importante: sabe a diferença entre achar e saber. Essa pergunta que você escreveu — o que ainda falta perguntar ao empresário — é exatamente o que separa quem adivinha de quem entende.",
    badge: "Dia 2 de 21 concluído",
    feito: [
      "Entendeu como é a rotina de uma SDR",
      "Entendeu como é a rotina de uma Closer",
      "Viu por que registrar faz parte do trabalho",
      "Separou o que é e o que não é sua responsabilidade",
      "Levantou hipóteses sobre a sua primeira empresa",
    ],
    amanha:
      "Amanhã a gente descobre onde estão as suas primeiras oportunidades. Elas estão bem mais perto do que você imagina.",
  },
}
