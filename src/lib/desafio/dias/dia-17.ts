import type { Dia } from "../tipos"

/**
 * DIA 17 — O mercado está te dando respostas.
 *
 * A virada pedagógica do Desafio, e o documento diz isso explicitamente: «no
 * início eu estava dizendo para você o que fazer; agora eu quero começar a
 * ensinar você a olhar para a própria operação e tomar decisões». A razão é
 * que no Dia 22 ela não pode pensar "e agora, a Nati não está me dizendo o que
 * fazer hoje".
 *
 * A regra do teste de hoje, que precisa estar na tela: «o ajuste que você
 * escolheu não precisa funcionar. Nós não estamos procurando uma frase mágica
 * — estamos ensinando você a observar, testar e melhorar.»
 *
 * E uma trava contra o impulso de volume: ter 90 empresas no Radar não
 * significa mandar 90 mensagens hoje. A gente está construindo uma carteira.
 */
export const dia17: Dia = {
  dia: 17,
  kicker: "Dia 17",
  titulo: "Hoje você aprende com a sua própria operação.",
  lede: "Você não precisa adivinhar tudo. Conforme trabalha, o próprio mercado começa a te dar informação — e hoje a gente lê o que ele já te disse.",
  tempo: "35 minutinhos",
  objetivo:
    "Ensinar a ler a própria operação e escolher UM ajuste para testar. Radar a 90/100 e +5 abordagens (60 no acumulado).",

  guarde: [
    {
      titulo: "O mercado responde",
      texto:
        "Você não precisa adivinhar tudo. Conforme trabalha, a própria operação começa a te dar informação.",
    },
    {
      titulo: "Mude uma coisa por vez",
      texto:
        "Se você mudar cinco coisas de uma vez e melhorar, não vai saber qual delas funcionou.",
    },
    {
      titulo: "O seu teste não precisa funcionar",
      texto:
        "A gente não está procurando uma frase mágica. Está ensinando você a observar, testar e melhorar — que é comportamento de profissional.",
    },
    {
      titulo: "Não queime sua lista",
      texto:
        "Ter noventa empresas no Radar não significa mandar noventa mensagens hoje. A gente está construindo uma carteira, não fazendo um disparo.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-17",
      label: "Dia 17 — O mercado está te dando respostas",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra como transformar o que já aconteceu com você em decisão sobre o que fazer a seguir.",
      cta: "Já assisti",
    },

    {
      tipo: "formulario",
      chave: "minha-leitura",
      ask: "Minha leitura da operação.",
      support:
        "Quatro perguntas. Responda com o que você viu acontecer, não com o que você imagina.",
      campos: [
        {
          tipo: "texto",
          chave: "tipo_empresa_abriu",
          rotulo: "Qual tipo de empresa mais abriu conversa com você?",
          placeholder: "Clínicas pequenas, com uma secretária só",
        },
        {
          tipo: "checks",
          chave: "melhores_origens",
          rotulo: "De onde vieram as suas melhores oportunidades?",
          opcoes: [
            "Formação e experiência",
            "Minha rede",
            "Indicação",
            "Consumo e rotina",
            "Pesquisa",
            "Ainda não consigo perceber",
          ],
        },
      ],
    },

    {
      tipo: "diagnostico",
      chave: "onde-travo-dia-17",
      ask: "E onde você mais está travando agora?",
      support:
        "Pode ser diferente do que era no Dia 14 — e se for, é porque você avançou.",
      opcoes: [
        {
          rotulo: "Conseguir resposta",
          dia: 9,
          porque:
            "Abordagem e follow-up andam juntos. O Dia 9 tem a central inteira de retomada.",
        },
        {
          rotulo: "Desenvolver a conversa",
          dia: 8,
          porque:
            "O Dia 8 tem o banco de perguntas e os scripts de confirmar o que você entendeu.",
        },
        {
          rotulo: "Chegar à reunião",
          dia: 10,
          porque:
            "O Dia 10 tem o checklist de quando convidar e os scripts de marcar horário.",
        },
        {
          rotulo: "Chegar à proposta",
          dia: 11,
          porque:
            "O Dia 11 tem o roteiro de reunião, inclusive como pedir permissão para enviar proposta.",
        },
        {
          rotulo: "Fechar",
          dia: 13,
          porque:
            "O Dia 13 tem as objeções. “Gostei, mas...” não é o fim da venda.",
        },
        {
          rotulo: "Ainda não sei",
          dia: 14,
          porque:
            "O Dia 14 tem o seu funil. Olhe os números antes de decidir — eles costumam apontar o gargalo sozinhos.",
        },
      ],
    },

    {
      tipo: "formulario",
      chave: "meu-teste",
      ask: "Agora escolha UMA coisa para testar.",
      support:
        "Uma só. Pode ser a primeira frase da abordagem, o horário em que você manda, o tipo de empresa que você escolhe, a pergunta que você faz primeiro.",
      campos: [
        {
          tipo: "area",
          chave: "teste",
          rotulo: "Nas próximas abordagens, eu vou testar:",
          placeholder:
            "Mandar de manhã em vez de à noite, e começar perguntando sobre o canal em vez de me apresentar primeiro",
        },
      ],
      nota: "Mude uma coisa por vez. E se não funcionar, você aprendeu uma coisa sobre o seu mercado — que é mais do que você sabia ontem.",
    },

    {
      tipo: "radar",
      chave: "noventa-empresas",
      meta: 90,
      origemSugerida: "busca",
      ask: "Mais dez empresas. Faltam dez para as cem.",
      support:
        "Lembra quando eu falei em cem empresas? Você não precisou conhecer cem empresários pessoalmente. Você aprendeu a construir uma lista.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-17",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E mais cinco abordagens, já testando o seu ajuste.",
      support: "Com estas você chega a sessenta empresas abordadas.",
      campos: [
        {
          tipo: "radio",
          chave: "porta",
          rotulo: "Por qual porta você entrou?",
          opcoes: ["Fui indicada", "Já conheço a empresa", "Prospecção fria"],
        },
        {
          tipo: "radio",
          chave: "testei",
          rotulo: "Usou o seu ajuste nessa abordagem?",
          opcoes: ["Sim, testei", "Não deu para testar nessa"],
        },
      ],
    },

    {
      tipo: "confirma",
      chave: "zerar-operacao-dia-17",
      ask: "Zere sua operação de hoje.",
      support: "Follow-ups, conversas, reuniões, propostas, próximas ações.",
      itens: [
        "Fiz os follow-ups do dia.",
        "Respondi as conversas abertas.",
        "Acompanhei as reuniões e propostas que existem.",
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 17 concluído",
    titulo: "Você não está mais apenas executando.",
    lede: "Está começando a aprender com a sua própria operação. No começo eu te dizia o que fazer. Agora você olha para o seu radar, para as suas conversas e para os seus números e decide — e é isso que vai te sustentar depois do Dia 21.",
    badge: "Dia 17 de 21 concluído",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Leu o que a sua própria operação já te mostrou",
      "Identificou onde você está travando agora",
      "Escolheu um ajuste para testar",
      "Levou o radar a noventa empresas",
      "Enviou mais cinco abordagens testando o ajuste",
    ],
    amanha: "Faltam dez. Amanhã nós chegamos às cem.",
  },
}
