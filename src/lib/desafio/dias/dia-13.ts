import type { Dia } from "../tipos"

/**
 * DIA 13 — "Preciso pensar": como conduzir objeções e negociação.
 *
 * A estrutura que o dia ensina, e que fica escrita no portal:
 *   ACOLHA → PERGUNTE → ENTENDA → RESPONDA → DEFINA O PRÓXIMO PASSO
 *
 * O erro que o dia existe para corrigir é responder rápido demais: ouvir
 * "está caro" e já oferecer desconto, ou ouvir "preciso pensar" e já dizer
 * "claro, me avisa". Nos dois casos ela perdeu a chance de ENTENDER.
 *
 * Três proteções que o documento exige e que estão nos textos:
 *   • NUNCA INVENTE EXPERIÊNCIA nem use resultado da MultiMeta como se fosse
 *     dela. As respostas de "você tem experiência?" e "tem cases?" são
 *     honestas de propósito.
 *   • NÃO PROMETA RESULTADO que ela não controla.
 *   • NÃO NEGOCIE CONTRA SI MESMA: não oferecer desconto para uma objeção que
 *     nem aconteceu.
 *
 * E aqui o Radar volta a ser abastecido. O documento identifica isso como
 * correção de rota: o Radar parou em 30 no Dia 6, a meta é 100, e consumir
 * cinco por dia sem repor levaria a aluna ao Dia 21 com o Radar esgotado.
 * Por isso hoje tem +10 empresas e três pedidos de indicação de novo.
 */
export const dia13: Dia = {
  dia: 13,
  kicker: "Dia 13",
  titulo: "Hoje você aprende a não fugir das decisões.",
  lede: "“Gostei, mas...” não é o fim da venda. É o começo de uma conversa sobre decisão — e você vai saber conduzi-la.",
  tempo: "45 minutinhos",
  objetivo:
    "Ensinar a conduzir objeções sem brigar e sem fugir, com a estrutura acolha-pergunte-entenda-responda-defina. E voltar a abastecer o topo do funil: +10 empresas no Radar (40/100), 3 indicações e +5 abordagens (40 no acumulado).",

  guarde: [
    {
      titulo: "A estrutura",
      texto: "Acolha → pergunte → entenda → responda → defina o próximo passo.",
    },
    {
      titulo: "Objeção não é briga",
      texto:
        "Seu trabalho não é provar que ele está errado. Se você não entende a objeção, corre o risco de responder uma coisa que ele nem perguntou.",
    },
    {
      titulo: "Não negocie contra você mesma",
      texto:
        "Você passou o valor, ele ficou cinco segundos em silêncio. Você não precisa preencher esse silêncio dizendo “mas consigo fazer por menos”. Deixa o homem respirar. Não ofereça desconto para uma objeção que nem aconteceu.",
    },
    {
      titulo: "Negociação não é só preço",
      texto:
        "Dá para negociar escopo, carga, período, variável, fixo, início, volume e responsabilidades. Antes de cortar preço, descubra o que precisa mudar para o acordo fazer sentido.",
    },
    {
      titulo: "Nunca invente experiência",
      texto:
        "Se você está começando, está começando. E resultado da MultiMeta não é resultado seu. Transparência fecha mais contrato do que história inventada.",
    },
    {
      titulo: "Enquanto não existe contrato, continue construindo oportunidades",
      texto:
        "O erro perigoso é parar de prospectar porque uma proposta avançou. Proposta não é contrato.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-13",
      label: "Dia 13 — “Preciso pensar”: objeções e negociação",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra o que está por trás de cada objeção e como perguntar antes de responder.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "o-que-ha-atras",
      ask: "Quando alguém diz “está caro”, pode ser oito coisas diferentes.",
      support:
        "E a resposta certa depende de qual delas é. É por isso que você pergunta antes de responder.",
      corpo: [
        "Realmente **não tem orçamento**.",
        "**Não percebeu valor** no que você propôs.",
        "**Não entendeu o escopo**.",
        "Está **comparando** com outra solução.",
        "**Não confia ainda** — em você ou na ideia.",
        "Está **insegura ou inseguro**.",
        "**Não é prioridade** agora.",
        "Está **apenas negociando**.",
      ],
      destaque: "Acolha → pergunte → entenda → responda → defina o próximo passo.",
      cta: "Entendi",
    },

    {
      tipo: "copiar",
      chave: "objecoes-preco",
      ask: "As objeções de preço e de tempo.",
      support:
        "Nenhuma delas defende o valor. Todas perguntam primeiro.",
      mensagens: [
        {
          titulo: "“Está caro”",
          texto:
            "Entendo. Quando você diz que ficou alto, é mais pelo valor em si ou porque ainda não ficou claro para você o retorno ou o escopo dessa atuação?",
        },
        {
          titulo: "“Não tenho esse orçamento”",
          texto:
            "Entendi. Qual formato ou faixa faria sentido para vocês hoje? Te pergunto para entender se existe alguma possibilidade de ajustar o escopo sem comprometer o trabalho.",
        },
        {
          titulo: "“Outra pessoa cobra menos”",
          texto:
            "Entendo. É importante comparar não apenas o valor, mas também o que cada formato inclui e qual responsabilidade cada profissional vai assumir. Se quiser, podemos revisar meu escopo para você comparar de forma mais clara.",
        },
        {
          titulo: "“Preciso pensar”",
          texto:
            "Claro. Tem algum ponto específico que você sente que precisa avaliar melhor? Te pergunto porque talvez exista alguma informação que eu possa esclarecer antes.",
        },
        {
          titulo: "“Preciso falar com meu sócio”",
          texto:
            "Claro. Tem algum ponto da proposta que você acha importante eu te explicar melhor para você conseguir levar essa conversa para ele?",
        },
        {
          titulo: "“Agora não é o momento”",
          texto:
            "Entendo. É mais uma questão de prioridade agora, orçamento, ou existe alguma outra coisa que faz você sentir que este não é o momento?",
        },
        {
          titulo: "Para combinar a retomada",
          texto: "Sem problema. Faz sentido eu retomar esse assunto com você em [período]?",
        },
      ],
      nota: "Reparou que em “não tenho esse orçamento” eu falei em AJUSTAR O ESCOPO, e não no mesmo trabalho pela metade do preço? Se o investimento cai muito, a responsabilidade precisa cair também.",
      confirmacao: "Li as objeções de preço.",
    },

    {
      tipo: "copiar",
      chave: "objecoes-voce",
      ask: "E as objeções que são sobre você.",
      support:
        "Essas são as que mais assustam quem está começando. E a resposta é a verdade — não existe versão melhor.",
      mensagens: [
        {
          titulo: "“Você tem experiência?”",
          texto:
            "Estou iniciando minha atuação profissional nessa função, então não vou te dizer que tenho anos de experiência que não tenho. O que eu posso te mostrar é como pretendo conduzir o trabalho, quais responsabilidades vou assumir e como vamos acompanhar o processo.",
        },
        {
          titulo: "“Você tem resultados ou cases?”",
          texto:
            "Ainda estou construindo meus primeiros cases nessa atuação específica. Por isso prefiro ser transparente. Posso te mostrar o processo que vou executar, o que ficará sob minha responsabilidade e como vamos acompanhar o trabalho.",
        },
        {
          titulo: "“Me garante resultado?”",
          texto:
            "Eu consigo me comprometer com o processo e com as responsabilidades que combinarmos. Resultado comercial depende também de fatores como oferta, preço, demanda, geração de oportunidades e operação da empresa, então eu não seria responsável em te prometer um número que não depende exclusivamente de mim.",
        },
        {
          titulo: "“Já tenho uma pessoa no comercial”",
          texto:
            "Que bom. Como essa pessoa atua hoje? Ela cuida do processo todo ou de uma etapa específica?",
        },
        {
          titulo: "“Já tentei contratar e não deu certo”",
          texto:
            "Entendo. O que aconteceu nessa experiência anterior que fez você sentir que não funcionou?",
        },
        {
          titulo: "E depois, na mesma conversa",
          texto:
            "E o que você precisaria enxergar numa nova experiência para se sentir mais seguro em tentar novamente?",
        },
        {
          titulo: "“Pode fazer um teste de graça?”",
          texto:
            "Podemos pensar em um período ou projeto-piloto com escopo e condições bem definidos, mas prefiro que a gente estabeleça claramente o que será feito, por quanto tempo e qual será o formato antes de começar.",
        },
        {
          titulo: "Se o não vier",
          texto:
            "Obrigada pela transparência, [nome]. Foi muito bom conhecer melhor a empresa. Se esse cenário mudar no futuro, fico à disposição.",
        },
      ],
      nota: "Se você tem experiência anterior em vendas, atendimento, saúde, educação ou qualquer área, contextualize — isso conta. O que não dá é inventar.",
      confirmacao: "Li as objeções sobre mim.",
    },

    {
      tipo: "leitura",
      chave: "devo-aceitar",
      ask: "Como saber se você deve aceitar?",
      support: "Quatro perguntas. Se alguma for “não”, não diga sim no impulso.",
      corpo: [
        "**1.** O escopo está claro?",
        "**2.** Eu consigo executar o que estou prometendo?",
        "**3.** A remuneração faz sentido para a responsabilidade?",
        "**4.** As condições estão claras?",
      ],
      destaque: "“Quero só organizar esse ponto antes de confirmar” é uma frase de profissional.",
      cta: "Entendi",
    },

    // ── Frente 1: volta a abastecer o topo do funil ──
    {
      tipo: "radar",
      chave: "quarenta-empresas",
      meta: 40,
      origemSugerida: "busca",
      ask: "Agora a gente volta a abastecer o seu radar.",
      support:
        "Mais dez empresas, para chegar a quarenta. Sem Raio-X — só nome, o que ela faz e o contato.",
      nota: "Existe um erro perigoso quando uma oportunidade começa a avançar: você para de prospectar porque “tem uma proposta”. Enquanto não existe contrato, continue construindo oportunidades.",
    },

    {
      tipo: "copiar",
      chave: "indicacoes-rodada-2",
      ask: "E vamos pedir indicação de novo.",
      support:
        "Já passou tempo desde o Dia 3, e as pessoas lembram de coisas diferentes em momentos diferentes. Mande para mais três pessoas.",
      mensagens: [
        {
          texto:
            "Oi, [nome]! Lembra que te falei que estou atuando na área comercial? Estou ampliando meu mapeamento de empresas e queria te pedir uma ajuda: você lembra de mais algum empresário ou profissional que tenha negócio e que eu poderia conhecer? Se vier alguém à cabeça, me manda o nome ou Instagram.",
        },
      ],
      confirmacao: "Mandei para mais três pessoas.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-13",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E mais cinco abordagens.",
      support: "Com estas, você chega a quarenta empresas abordadas.",
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

    // ── Frente 2: as objeções reais, se existirem ──
    {
      tipo: "empresa",
      chave: "objecoes-de-hoje",
      quantidade: "livre",
      proximaAcao: {
        rotulo: "Qual é o próximo passo dessa negociação?",
        placeholder: "Retomar terça depois de ele falar com o sócio",
      },
      ask: "Alguma proposta ou conversa avançada trouxe objeção?",
      support:
        "Se não tem nenhuma objeção hoje, você não precisa inventar uma. Pode seguir.",
      campos: [
        {
          tipo: "radio",
          chave: "objecao",
          rotulo: "Qual objeção apareceu?",
          opcoes: [
            "Está caro",
            "Não tenho esse orçamento",
            "Preciso pensar",
            "Preciso falar com o sócio",
            "Agora não é o momento",
            "Já tenho alguém no comercial",
            "Já tentei antes e não deu certo",
            "Perguntou da minha experiência",
            "Pediu teste de graça",
            "Disse não",
          ],
        },
        {
          tipo: "area",
          chave: "o_que_descobri",
          rotulo: "O que você descobriu quando perguntou antes de responder?",
          ajuda: "A objeção que ele disse e o motivo real quase nunca são a mesma coisa.",
        },
      ],
      nota: "Fez reunião, fez proposta, fez follow-up e ele disse não? Você não falhou no Desafio. Registre “sem oportunidade agora” e continue — é exatamente por isso que a gente construiu volume.",
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 13 concluído",
    titulo: "Uma profissional comercial não tem resposta decorada para tudo.",
    lede: "Ela sabe ouvir, perguntar, entender — e só então responder. Foi isso que você treinou hoje. E seu radar voltou a crescer, que é o que garante que sempre haverá uma próxima conversa.",
    badge: "Dia 13 de 21 concluído",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Aprendeu a estrutura acolha, pergunte, entenda, responda, defina",
      "Guardou as respostas das objeções de preço e das objeções sobre você",
      "Aprendeu as quatro perguntas de antes de aceitar",
      "Abasteceu o radar com mais dez empresas",
      "Pediu indicação para mais três pessoas",
      "Enviou mais cinco abordagens",
    ],
    amanha:
      "Amanhã a gente olha os seus números. Não para te cobrar — para você descobrir qual é o seu próximo passo.",
  },
}
