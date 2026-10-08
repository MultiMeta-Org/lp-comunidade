import type { Dia } from "../tipos"

/**
 * DIA 8 — Transforme uma resposta em conversa.
 *
 * Mandar a mensagem foi só o começo. Hoje ela aprende a conduzir o que
 * começou a chegar, com três coisas na cabeça: como chegam as oportunidades, o
 * que acontece com elas, e quem cuida disso hoje.
 *
 * O PASSO DAS CONVERSAS É `quantidade: "livre"`. Quantas responderam não está
 * sob o controle dela, e travar o dia em "trabalhe três respostas" puniria a
 * aluna por um silêncio que não é culpa dela. O que ela controla — mandar mais
 * cinco abordagens — esse sim é cobrado.
 *
 * Toda conversa trabalhada sai daqui com PRÓXIMO PASSO gravado no Radar. É o
 * checklist que o documento pede ("todas as conversas de hoje possuem um
 * próximo passo") e é o que o Dia 9 vai usar para o follow-up.
 */
export const dia08: Dia = {
  dia: 8,
  kicker: "Dia 8",
  titulo: "Hoje você conduz as respostas que chegaram.",
  lede: "Mais cinco abordagens e, para cada empresa que respondeu, uma conversa de verdade — com próximo passo definido.",
  tempo: "40 minutinhos",
  objetivo:
    "Transformar resposta em conversa comercial: fazer boas perguntas, confirmar o que entendeu, mostrar onde a atuação dela faz sentido e, quando couber, convidar para uma reunião. Mais 5 abordagens (15 no acumulado).",

  guarde: [
    {
      titulo: "As três coisas que você quer entender",
      texto:
        "Como chegam as oportunidades, o que acontece com elas, e quem cuida disso hoje.",
    },
    {
      titulo: "Conversa não é questionário",
      texto:
        "Não transforme em quinze perguntas seguidas. Pergunte, escute, confirme o que entendeu, e só então pergunte de novo.",
    },
    {
      titulo: "Não sabe responder? Não invente.",
      texto:
        "“Prefiro confirmar essa informação antes de te responder para não te passar algo errado” é resposta de profissional.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-8",
      label: "Dia 8 — Transforme uma resposta em conversa",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra as perguntas que abrem a conversa, como confirmar o que você entendeu e como convidar para uma reunião sem forçar.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "tres-coisas",
      ask: "São três coisas que você quer entender. Só três.",
      support: "Com elas você já consegue saber onde a sua atuação faria sentido.",
      corpo: [
        "**1. Como chegam as oportunidades?** De onde vêm as pessoas interessadas.",
        "**2. O que acontece com elas?** Quem responde, quem acompanha, o que se perde no caminho.",
        "**3. Quem cuida disso hoje?** O empresário, uma secretária, um time, ou ninguém.",
      ],
      cta: "Entendi",
    },

    {
      tipo: "copiar",
      chave: "banco-de-perguntas",
      ask: "As perguntas, prontas para copiar.",
      support:
        "As três primeiras abrem qualquer conversa. As três últimas são para quando você já souber quem cuida do comercial lá.",
      mensagens: [
        {
          titulo: "Como chegam?",
          texto:
            "Hoje, como normalmente chegam novos clientes ou pessoas interessadas em vocês?",
        },
        {
          titulo: "O que acontece?",
          texto:
            "E quando uma pessoa demonstra interesse, como vocês conduzem esse contato hoje?",
        },
        {
          titulo: "Quem cuida?",
          texto:
            "Hoje vocês já têm alguém responsável por essa parte comercial ou ela acaba ficando dividida entre você e a equipe?",
        },
        {
          titulo: "Se o empresário responde tudo sozinho",
          texto:
            "E você consegue acompanhar esses contatos com tranquilidade ou sente que alguns acabam ficando sem retorno quando a rotina aperta?",
        },
        {
          titulo: "Se tem secretária ou atendimento",
          texto:
            "Ela fica mais focada no atendimento e agendamento ou também acompanha quem demonstrou interesse e não avançou?",
        },
        {
          titulo: "Se já tem um time comercial",
          texto:
            "Como está estruturado hoje? Vocês têm pessoas diferentes para prospecção e fechamento ou o time acaba atuando no processo todo?",
        },
      ],
      confirmacao: "Li o banco de perguntas.",
    },

    {
      tipo: "copiar",
      chave: "scripts-avancar",
      ask: "E estes são para fazer a conversa avançar.",
      support:
        "Confirmar o que você entendeu é o que separa quem escuta de quem só espera a vez de falar.",
      mensagens: [
        {
          titulo: "Confirmar o que entendeu",
          texto:
            "Então, pelo que entendi, [resumo do que a pessoa contou]. É isso?",
        },
        {
          titulo: "Mostrar a conexão com a sua atuação",
          texto:
            "Entendi. Essa é justamente uma parte em que minha atuação pode fazer sentido, porque trabalho no desenvolvimento e acompanhamento dessas oportunidades dentro do processo comercial.",
        },
        {
          titulo: "Convidar para uma reunião",
          texto:
            "Pelo que você me contou, acho que pode existir um espaço em que eu consiga contribuir. Se fizer sentido para você, podemos marcar uma conversa rápida para eu entender melhor a operação e te explicar como eu trabalharia.",
        },
        {
          titulo: "Se perguntarem o preço agora",
          texto:
            "O formato depende um pouco do que vocês precisam e de qual parte da operação eu assumiria. Antes de te passar uma proposta, prefiro entender melhor o cenário para te indicar um formato coerente. Podemos conversar alguns minutos?",
        },
        {
          titulo: "Se você não souber responder",
          texto:
            "Boa pergunta. Prefiro confirmar essa informação antes de te responder para não te passar algo errado. Posso verificar e te retornar?",
        },
      ],
      confirmacao: "Li os scripts para avançar.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "Agora mais cinco abordagens.",
      support:
        "Isso é o que está na sua mão. Com as dez de ontem, você chega a quinze empresas abordadas.",
      campos: [
        {
          tipo: "radio",
          chave: "porta",
          rotulo: "Por qual porta você entrou?",
          opcoes: ["Fui indicada", "Já conheço a empresa", "Prospecção fria"],
        },
        {
          tipo: "radio",
          chave: "enviei",
          rotulo: "Enviou?",
          opcoes: ["Sim, enviei"],
          inline: true,
        },
      ],
    },

    {
      tipo: "empresa",
      chave: "conversas",
      quantidade: "livre",
      proximaAcao: {
        rotulo: "Qual é o próximo passo dessa conversa?",
        placeholder: "Perguntar como ela acompanha quem não respondeu",
      },
      ask: "Alguma empresa respondeu? Vamos trabalhar essas conversas.",
      support:
        "Para cada uma que respondeu: o que você já entendeu, em que ponto está a conversa, e o que você vai fazer em seguida.",
      campos: [
        {
          tipo: "radio",
          chave: "estagio",
          rotulo: "Como está essa conversa?",
          opcoes: [
            "Respondeu, mas ainda não conversamos",
            "Estamos conversando",
            "Já falamos de reunião",
            "Disse que não tem interesse",
          ],
        },
        {
          tipo: "area",
          chave: "o_que_entendi",
          rotulo: "O que você já entendeu sobre o comercial dessa empresa?",
          ajuda: "Só o que ela te contou. O que você ainda não sabe não entra aqui.",
        },
        {
          tipo: "area",
          chave: "o_que_falta_saber",
          rotulo: "E o que você ainda precisa perguntar?",
          obrigatorio: false,
        },
      ],
      nota: "Conseguiu uma reunião? Não espere o Dia 11 — a Biblioteca tem como conduzir sua primeira conversa. Fechou? Clique em “Fechei meu primeiro contrato”.",
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 8 concluído",
    titulo: "Suas conversas agora têm para onde ir.",
    lede: "Toda conversa que você trabalhou hoje saiu daqui com um próximo passo escrito no Radar. É isso que impede uma oportunidade de morrer de esquecimento.",
    badge: "Dia 8 de 21 concluído",
    feito: [
      "Aprendeu as três coisas que você quer entender de uma empresa",
      "Guardou o banco de perguntas e os scripts para avançar",
      "Enviou mais cinco abordagens",
      "Trabalhou as conversas que chegaram",
      "Deixou um próximo passo em cada uma",
    ],
    amanha:
      "Amanhã a gente fala de follow-up — que é onde está a maior parte do dinheiro que as pessoas deixam na mesa.",
  },
}
