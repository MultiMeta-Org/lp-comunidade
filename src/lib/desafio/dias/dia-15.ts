import type { Dia } from "../tipos"

/**
 * DIA 15 — Agora isso precisa caber na sua vida.
 *
 * O dia do marco: as 50 empresas abordadas, que é a meta mínima do Desafio. E
 * o documento é firme em uma coisa — celebrar o marco E dizer na mesma tela que
 * 50 é PISO, não teto.
 *
 * A frase que vale mais que o marco: «talvez 50 empresas parecessem muita coisa
 * no começo; agora você sabe como encontrar a 51ª». O ativo não são as 50 — é
 * ela saber gerar a próxima.
 *
 * E uma distinção que protege a aluna: CAPACIDADE ≠ MEDO. Se a vida dela
 * permite três abordagens por dia, faça três. Mas não escolher um número menor
 * só porque está com medo de abordar.
 *
 * O interesse "rotina do lar + trabalho" entra como interesse, não como
 * checkout: o documento prefere saber quais alunas têm essa dor a vender para
 * todas indiscriminadamente.
 */
export const dia15: Dia = {
  dia: 15,
  kicker: "Dia 15",
  titulo: "Hoje isso vira uma rotina que cabe na sua vida.",
  lede: "Sua missão não é criar a agenda perfeita. É definir os blocos reais — os que existem de verdade nos seus dias.",
  tempo: "35 minutinhos",
  objetivo:
    "Transformar a execução em rotina sustentável, com blocos reais e meta mínima diária. Alcançar as 50 empresas abordadas (meta mínima do Desafio) e levar o Radar a 70/100.",

  guarde: [
    {
      titulo: "Trabalhar em casa continua sendo trabalhar",
      texto: "Liberdade não é ausência de rotina. Liberdade precisa de organização.",
    },
    {
      titulo: "Capacidade não é medo",
      texto:
        "Se a sua realidade hoje permite três abordagens, faça três. Mas não escolha um número menor só porque está com medo de abordar. São coisas diferentes.",
    },
    {
      titulo: "Cinco por dia são cem por mês",
      texto:
        "Cinco empresas novas por dia, em vinte dias úteis, são cem empresas novas. Oportunidade não precisa acabar nunca.",
    },
    {
      titulo: "Exemplo de rotina de 1 hora",
      texto: "15 min no Radar · 20 min de abordagens · 25 min de follow-up e conversas.",
    },
    {
      titulo: "Exemplo de rotina de 2 horas",
      texto:
        "20 min no Radar · 30 min de abordagens · 30 min de follow-up e conversas · 40 min de reunião, proposta ou preparação.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-15",
      label: "Dia 15 — Agora isso precisa caber na sua vida",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra como montar uma rotina comercial que sobrevive à vida real — a sua, com as coisas que já existem nela.",
      cta: "Já assisti",
    },

    {
      tipo: "formulario",
      chave: "minha-rotina",
      ask: "Qual é a sua rotina profissional de verdade?",
      support:
        "Me diz o que cabe, não o que você gostaria que cabesse. É com o real que a gente trabalha.",
      campos: [
        {
          tipo: "checks",
          chave: "dias",
          rotulo: "Eu consigo trabalhar:",
          opcoes: [
            "Segunda",
            "Terça",
            "Quarta",
            "Quinta",
            "Sexta",
            "Sábado",
            "Domingo",
          ],
        },
        {
          tipo: "radio",
          chave: "periodo_rotina",
          rotulo: "Meu principal período é:",
          opcoes: ["Manhã", "Tarde", "Noite", "Varia"],
          inline: true,
        },
        {
          tipo: "texto",
          chave: "horas_reais",
          rotulo: "Quantas horas reais por dia?",
          placeholder: "1h30",
        },
        {
          tipo: "texto",
          chave: "bloco_de",
          rotulo: "Meu bloco de trabalho começa às",
          placeholder: "20h",
        },
        {
          tipo: "texto",
          chave: "bloco_ate",
          rotulo: "E vai até",
          placeholder: "21h30",
        },
      ],
    },

    {
      tipo: "formulario",
      chave: "minha-meta",
      ask: "E qual é a sua meta mínima por dia de execução?",
      support:
        "Enquanto você está construindo sua carteira. Pode ajustar para a sua realidade — e pode mudar depois.",
      campos: [
        {
          tipo: "texto",
          chave: "meta_empresas_dia",
          rotulo: "Novas empresas por dia",
          placeholder: "5",
        },
        {
          tipo: "texto",
          chave: "meta_abordagens_dia",
          rotulo: "Novas abordagens por dia",
          placeholder: "5",
        },
      ],
      nota: "Follow-ups vencidos e conversas abertas não entram na meta: esses são todos, todo dia. Não é meta, é o trabalho.",
    },

    {
      tipo: "radar",
      chave: "setenta-empresas",
      meta: 70,
      origemSugerida: "busca",
      ask: "Mais dez empresas no radar.",
      support: "Para chegar a setenta. Hoje são dez, não vinte — você também está montando rotina.",
    },

    {
      tipo: "empresa",
      chave: "as-cinquenta",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E agora as cinco que te levam a cinquenta.",
      support:
        "Cinquenta empresas abordadas é a meta mínima do Desafio. Mínima — você ainda tem dias de operação pela frente.",
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
      chave: "zerar-operacao-dia-15",
      ask: "Zere sua operação do dia.",
      support: "Já virou rotina, né?",
      itens: [
        "Fiz os follow-ups vencidos.",
        "Respondi as conversas abertas.",
        "Toda oportunidade minha tem próxima ação ou foi encerrada.",
      ],
    },

    // Interesse, não checkout. Saber quem tem a dor vale mais que vender para
    // todas indiscriminadamente.
    {
      tipo: "interesse",
      chave: "rotina-do-lar",
      interesse: "rotina-lar-trabalho",
      opcional: true,
      ask: "Sua maior dificuldade é fazer o trabalho caber na rotina da casa?",
      support:
        "Se essa é a parte mais difícil para você, me conta. Não é frescura e não é falta de organização — é uma dificuldade real de quem trabalha de casa com uma casa funcionando em volta.",
      pergunta: "O que mais pesa hoje?",
      opcoes: [
        "Não consigo um horário sem interrupção",
        "A casa e os filhos ocupam o dia todo",
        "Tenho o tempo, mas não consigo me concentrar",
        "Trabalho fora e sobra pouca energia",
      ],
      nota: "Quem levanta a mão aqui recebe material sobre isso quando a gente preparar. Nada automático, nada de venda agora.",
      cta: "Quero saber mais",
    },
  ],

  fim: {
    kicker: "Marco alcançado",
    titulo: "Você falou com cinquenta empresas.",
    lede: "Talvez cinquenta parecessem muita coisa no começo. Agora você sabe como encontrar a quinquagésima primeira — e é isso que muda tudo. O seu principal ativo não são essas cinquenta: é você saber gerar as próximas.",
    badge: "Meta mínima do Desafio conquistada",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Definiu seus blocos reais de trabalho",
      "Definiu sua meta mínima por dia",
      "Levou o radar a setenta empresas",
      "Alcançou cinquenta empresas abordadas",
      "Zerou a operação do dia",
    ],
    amanha:
      "Você não terminou — agora você já sabe continuar. E amanhã a gente resolve como organizar tudo isso sem depender da sua memória, do WhatsApp e de uma planilha perdida.",
  },
}
