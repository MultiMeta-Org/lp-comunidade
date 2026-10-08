import type { Dia } from "../tipos"

/**
 * DIA 19 — Agora você precisa saber se apresentar como profissional.
 *
 * O dia que dá nome ao produto. A frase do fechamento é a tese inteira da
 * Empreendedora Anônima:
 *   «Talvez milhares de pessoas nunca saibam quem você é. Mas as empresas
 *   certas precisam saber o valor que você entrega.»
 *
 * E a trava que protege o dia de si mesmo: «PERFIL NÃO PAGA BOLETO. OPERAÇÃO
 * COMERCIAL GERA OPORTUNIDADE.» Por isso o posicionamento é curto — uma frase,
 * uma explicação de trinta segundos, e foto, nome e bio. Nada de arrumar o
 * Instagram inteiro, criar posts ou inventar identidade visual. Esta aula não
 * pode virar desculpa para passar quatro horas escolhendo foto.
 *
 * O Radar entra em META DE MANUTENÇÃO: cinco por dia, não dez. Ela bateu as
 * cem ontem; hoje já está construindo as próximas.
 */
export const dia19: Dia = {
  dia: 19,
  kicker: "Dia 19",
  titulo: "Hoje você vira profissional também por fora.",
  lede: "Você não precisa ser conhecida por milhares. Precisa ser confiável para quem trabalha com você.",
  tempo: "35 minutinhos",
  objetivo:
    "Definir a apresentação curta, a completa e revisar foto, nome e bio — em minutos, não em horas. Radar em manutenção (105+) e +10 abordagens (80 no acumulado).",

  guarde: [
    {
      titulo: "Perfil não paga boleto",
      texto:
        "Operação comercial gera oportunidade. Não use esta aula como desculpa para passar quatro horas escolhendo foto.",
    },
    {
      titulo: "A Empreendedora Anônima",
      texto:
        "Talvez milhares de pessoas nunca saibam quem você é. Mas as empresas certas precisam saber o valor que você entrega. Uma mulher que não precisa viver de aparecer para construir renda: ela aprende uma competência, entra em operações, constrói resultado, constrói reputação e cresce.",
    },
    {
      titulo: "Radar em manutenção",
      texto:
        "Você chegou a cem ontem. Agora são cinco por dia — e o contador não tem mais teto.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-19",
      label: "Dia 19 — Saber se apresentar como profissional",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra como você se apresenta para o mercado sem precisar de audiência, seguidores nem feed bonito.",
      cta: "Já assisti",
    },

    {
      tipo: "copiar",
      chave: "modelos-apresentacao-curta",
      ask: "Quatro versões da sua apresentação curta.",
      support:
        "Uma frase. Copie a que mais parece com o que você faz — ou com o que você quer fazer mais.",
      mensagens: [
        {
          titulo: "Opção 1 — mais ampla",
          texto:
            "Eu atuo na área comercial ajudando empresas a gerar e conduzir novas oportunidades de venda.",
        },
        {
          titulo: "Opção 2 — prospecção e vendas",
          texto:
            "Eu trabalho com prospecção e vendas, ajudando empresas a encontrar novas oportunidades e conduzi-las comercialmente.",
        },
        {
          titulo: "Opção 3 — foco em pré-venda",
          texto:
            "Eu atuo na área comercial, principalmente na prospecção e desenvolvimento de novas oportunidades para empresas.",
        },
        {
          titulo: "Opção 4 — foco em fechamento",
          texto:
            "Eu atuo na área comercial, conduzindo oportunidades e processos de venda até o fechamento.",
        },
      ],
      confirmacao: "Copiei a minha.",
    },

    {
      tipo: "formulario",
      chave: "minhas-apresentacoes",
      ask: "Agora escreva as suas duas versões.",
      support:
        "A curta é para quando alguém pergunta de passagem. A completa é a de trinta segundos, para quando a pessoa realmente quer entender.",
      campos: [
        {
          tipo: "area",
          chave: "apresentacao_curta",
          rotulo: "Minha apresentação curta (uma frase)",
          placeholder:
            "Eu atuo na área comercial ajudando empresas a gerar e conduzir novas oportunidades de venda.",
        },
        {
          tipo: "area",
          chave: "apresentacao_completa",
          rotulo: "Minha apresentação completa (uns trinta segundos)",
          placeholder:
            "Eu atuo na área comercial. Dependendo da necessidade da empresa, posso trabalhar na prospecção de novas oportunidades, no desenvolvimento dessas conversas e também na condução comercial até o fechamento. Tenho buscado conhecer empresas e entender onde consigo contribuir melhor dentro da operação.",
        },
        {
          tipo: "area",
          chave: "apresentacao_com_experiencia",
          rotulo: "Se você tem experiência anterior que conecta, a versão com ela",
          ajuda:
            "Opcional, e só para quem tem contexto real. Modelo: “Eu sou [formação] e hoje também atuo na área comercial. Tenho olhado principalmente para [mercado] porque consigo unir meu conhecimento desse setor com minha atuação comercial.”",
          obrigatorio: false,
        },
      ],
    },

    {
      tipo: "confirma",
      chave: "perfil-profissional",
      ask: "Revise foto, nome e bio. Só isso.",
      support:
        "Sugestões de bio: “Comercial | Prospecção e Vendas”, “SDR & Closer | Comercial”, “Desenvolvimento Comercial | Prospecção e Vendas”. Não precisa mexer no feed, criar posts nem inventar identidade visual.",
      itens: [
        "Meu rosto aparece claramente na foto, com boa iluminação.",
        "Meu nome está claro.",
        "Minha bio diz o que eu faço.",
      ],
    },

    {
      tipo: "copiar",
      chave: "scripts-dia-19",
      ask: "Três scripts para guardar.",
      support:
        "O primeiro é para a pergunta que mais incomoda quem está começando. Os outros dois são para quando você já tiver cliente.",
      mensagens: [
        {
          titulo: "Se perguntarem “você já tem clientes?”",
          texto:
            "Estou construindo minha carteira e conversando com empresas para entender onde existe uma boa conexão entre a necessidade da operação e o trabalho que eu consigo desenvolver.",
        },
        {
          titulo: "Pedir depoimento (quando já existir trabalho real)",
          texto:
            "[Nome], fico feliz com o que conseguimos construir até aqui. Se você se sentir confortável, poderia me dar um breve feedback sobre como tem sido meu trabalho com vocês? Isso me ajuda a construir minha trajetória profissional.",
        },
        {
          titulo: "Pedir indicação a um cliente",
          texto:
            "[Nome], estou ampliando minha carteira e gostaria de trabalhar com outras empresas em que eu também consiga contribuir. Se você conhecer algum empresário que faça sentido eu conhecer, uma apresentação sua seria muito bem-vinda.",
        },
      ],
      confirmacao: "Guardei os três.",
    },

    {
      tipo: "radar",
      chave: "radar-manutencao",
      meta: 105,
      origemSugerida: "busca",
      ask: "Cinco empresas novas. Manutenção.",
      support:
        "Você chegou a cem ontem. Hoje você já está construindo as próximas — e é assim daqui para frente.",
    },

    {
      tipo: "empresa",
      chave: "dez-abordagens-dia-19",
      quantidade: 10,
      defineStatus: "abordagem-enviada",
      ask: "E dez abordagens. A operação é o que paga.",
      support:
        "Com estas você chega a oitenta empresas abordadas. Agora termina sua missão e volta para o mercado — porque ainda não acabamos.",
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
      tipo: "confirma",
      chave: "zerar-operacao-dia-19",
      ask: "Execute sua operação.",
      support: "Follow-ups, conversas, reuniões, propostas, próximas ações.",
      itens: [
        "Fiz os follow-ups do dia.",
        "Respondi as conversas abertas.",
        "Acompanhei reuniões e propostas em aberto.",
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 19 concluído",
    titulo: "Você não precisa sair desse Desafio famosa.",
    lede: "Não precisa ter audiência nem mil seguidores novos. Eu quero que você saia profissional. Essa é a Empreendedora Anônima: uma mulher que não precisa viver de aparecer para construir renda.",
    badge: "Dia 19 de 21 concluído",
    feito: [
      "Escreveu a sua apresentação curta",
      "Escreveu a sua apresentação completa",
      "Revisou foto, nome e bio",
      "Manteve o radar crescendo",
      "Enviou dez abordagens",
    ],
    amanha:
      "Amanhã eu quero te mostrar até onde essa habilidade pode te levar — porque ela vale muito mais do que um primeiro contrato.",
  },
}
