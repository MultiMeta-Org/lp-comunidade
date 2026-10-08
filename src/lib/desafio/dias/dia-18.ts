import type { Dia } from "../tipos"

/**
 * DIA 18 — 100 empresas: você não depende mais de sorte.
 *
 * O marco das cem. E a frase que é o dia inteiro:
 *   «Você não ganhou uma lista de 100 empresas. Você aprendeu a CONSTRUIR uma
 *   lista de 100 empresas.»
 *
 * O principal resultado não é a lista — é ela saber de onde as empresas
 * vieram, saber procurar, saber pedir indicação, saber reconhecer uma empresa
 * e saber iniciar conversa. Daí o passo das quatro fontes vivas: pesquisa,
 * rede, indicação e REATIVAÇÃO (as que já disseram "não agora").
 *
 * Passado este dia, o contador do Radar deixa de ter teto.
 */
export const dia18: Dia = {
  dia: 18,
  kicker: "Dia 18",
  titulo: "Hoje você chega às cem.",
  lede: "E o mais importante não é a lista. É que você sabe de onde ela veio — e sabe construir as próximas cem.",
  tempo: "45 minutinhos",
  objetivo:
    "Fechar as 100 empresas no Radar, +10 abordagens (70 no acumulado), 3 novas indicações, e estabelecer as quatro fontes que mantêm o Radar vivo depois do Desafio.",

  guarde: [
    {
      titulo: "O que você realmente conquistou",
      texto:
        "Você não ganhou uma lista de cem empresas. Você aprendeu a construir uma lista de cem empresas. E isso significa que sua carreira não depende de alguém aparecer e te oferecer uma oportunidade.",
    },
    {
      titulo: "As quatro fontes que mantêm o radar vivo",
      texto:
        "Pesquisa (encontrar empresas novas) · Rede (pessoas que você já conhece) · Indicação (quem sua rede e os empresários podem apresentar) · Reativação (empresas com quem você já conversou e que podem fazer sentido de novo).",
    },
    {
      titulo: "Reativação é fonte, não resto",
      texto:
        "Um “não agora” é um “talvez depois” com data. Registre a retomada só quando houver sentido real em retomar.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-18",
      label: "Dia 18 — 100 empresas no radar",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele fecha a construção da sua carteira e mostra como ela se mantém viva daqui para frente.",
      cta: "Já assisti",
    },

    {
      tipo: "radar",
      chave: "cem-empresas",
      meta: 100,
      origemSugerida: "busca",
      ask: "As últimas dez. Vamos fechar as cem.",
      support:
        "Pesquisa, rede, indicação, reativação. Você já sabe fazer isso — faz quinze dias que você faz.",
    },

    {
      tipo: "copiar",
      chave: "scripts-dia-18",
      ask: "Os scripts que mantêm o radar crescendo.",
      support:
        "Indicação, apresentação, e os dois de reativação — que são os que ninguém usa e que fazem a diferença lá na frente.",
      mensagens: [
        {
          titulo: "Pedido de indicação",
          texto:
            "Oi, [nome]! Estou ampliando minha rede de empresas e profissionais que conheço. Tem algum empresário que você acha que faria sentido eu conhecer também?",
        },
        {
          titulo: "Pedido de apresentação",
          texto:
            "Se você se sentir confortável em nos apresentar, facilita bastante.",
        },
        {
          titulo: "Combinar uma retomada futura",
          texto:
            "Sem problema, [nome]. Faz sentido eu retomar esse assunto com você daqui a [período] para saber como as coisas estão por aí?",
        },
        {
          titulo: "A retomada, quando chegar a data",
          texto:
            "Oi, [nome]! Nós conversamos há um tempo sobre [contexto] e naquela ocasião não era o momento de avançar. Como combinamos, estou passando para saber como essa parte está hoje por aí e se o cenário mudou.",
        },
        {
          titulo: "Primeira mensagem para quem te indicaram",
          texto:
            "Oi, [nome]! Prazer. A [pessoa] comentou um pouquinho sobre você e seu negócio. Estou atuando na área comercial e tenho conhecido algumas empresas para entender melhor suas operações. Dei uma olhada em [empresa] e achei interessante conhecer vocês melhor.",
        },
      ],
      confirmacao: "Mandei três pedidos novos de indicação.",
    },

    {
      tipo: "empresa",
      chave: "dez-abordagens-dia-18",
      quantidade: 10,
      defineStatus: "abordagem-enviada",
      ask: "E dez abordagens hoje.",
      support:
        "Dez, não cinco — você já tem repertório para isso. Com estas você chega a setenta empresas abordadas.",
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
      chave: "reativacao",
      quantidade: "livre",
      proximaAcao: {
        rotulo: "Quando faz sentido retomar?",
        placeholder: "Em janeiro, quando ele disse que reorganiza o time",
      },
      ask: "Tem algum “não agora” que vale retomar mais pra frente?",
      support:
        "Registre a data só quando houver sentido real em retomar. Um “não” definitivo não precisa de agenda — e marcar retomada para todo mundo só enche a sua fila de coisa morta.",
      campos: [
        {
          tipo: "texto",
          chave: "motivo_reativacao",
          rotulo: "Por que vale voltar nessa?",
          placeholder: "Ele disse que em janeiro vai reestruturar o comercial",
        },
      ],
    },

    {
      tipo: "confirma",
      chave: "zerar-operacao-dia-18",
      ask: "E zere a operação do dia.",
      support: "Follow-ups, conversas, reuniões, propostas, objeções, próximas ações.",
      itens: [
        "Fiz os follow-ups do dia.",
        "Respondi as conversas abertas.",
        "Acompanhei reuniões, propostas e objeções em aberto.",
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Meta conquistada",
    titulo: "Cem empresas no seu radar.",
    lede: "Você entrou nesse Desafio talvez sem saber onde encontraria sua primeira oportunidade. Agora você sabe construir as próximas cem. Você não ganhou uma lista — você aprendeu a fazer uma.",
    badge: "100 empresas encontradas",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Fechou as cem empresas no radar",
      "Enviou dez abordagens num dia só",
      "Pediu três novas indicações",
      "Guardou os scripts de reativação",
      "Zerou a operação do dia",
    ],
    amanha:
      "A partir de agora o contador não tem mais teto. Amanhã a gente cuida de como você se apresenta como profissional para o mercado — não só numa conversa, mas de forma que te encontrem.",
  },
}
