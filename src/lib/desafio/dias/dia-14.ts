import type { Dia } from "../tipos"

/**
 * DIA 14 — Seus números mostram o próximo passo.
 *
 * Menos estudo, mais operação. A frase que organiza o dia: «profissional
 * comercial não vive de sensação — ela olha para o que está acontecendo e
 * decide onde agir».
 *
 * O funil é mostrado em NÚMEROS ABSOLUTOS, nunca em porcentagem. O documento é
 * explícito, e a razão é boa: taxa de conversão sem benchmark confiável só
 * produz ansiedade numa aluna que está no Dia 14 da carreira dela.
 *
 * O diagnóstico "onde estou travando?" aponta o dia que trata daquilo, e como
 * esses dias já estão concluídos ela pode reabrir na hora. É o que faz o
 * Desafio parecer personalizado sem nenhum sistema de recomendação atrás.
 *
 * Hoje o 50 aparece pela primeira vez como marco — e o documento avisa: 50 é
 * PISO, não teto.
 */
export const dia14: Dia = {
  dia: 14,
  kicker: "Dia 14",
  titulo: "Hoje você olha para o trabalho que já está fazendo.",
  lede: "Não para se cobrar. Para descobrir onde a sua operação mais precisa de você agora.",
  tempo: "35 minutinhos",
  objetivo:
    "Ensinar a ler o próprio funil e identificar o gargalo. Radar a 60/100, +3 indicações, +5 abordagens (45 no acumulado) e operação zerada.",

  guarde: [
    {
      titulo: "Profissional comercial não vive de sensação",
      texto: "Ela olha para o que está acontecendo e decide onde agir.",
    },
    {
      titulo: "A pergunta certa",
      texto: "Qual é o meu próximo gargalo, e qual ação depende de mim hoje?",
    },
    {
      titulo: "Cinquenta é piso, não teto",
      texto:
        "A meta mínima do Desafio é 50 empresas abordadas. Mínima. Não existe nenhum motivo para parar ali.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-14",
      label: "Dia 14 — Seus números mostram o próximo passo",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Hoje eu não quero te dar mais conteúdo. Quero te ensinar a olhar para o que você já construiu.",
      cta: "Já assisti",
    },

    {
      tipo: "funil",
      chave: "meu-funil",
      ask: "Meu funil até agora.",
      support:
        "Você não precisa calcular nada. Isso saiu do que você mesma registrou nos últimos dias.",
      cta: "Entendi",
    },

    {
      tipo: "diagnostico",
      chave: "onde-travo",
      ask: "Onde a sua operação mais precisa melhorar?",
      support:
        "Escolha a que mais parece com você hoje. Não tem resposta errada — tem a sua.",
      opcoes: [
        {
          rotulo: "Estou abordando pouco",
          dia: 7,
          porque:
            "Volume é o que você controla. O Dia 7 tem as três portas de entrada e os scripts de abordagem.",
        },
        {
          rotulo: "Poucas empresas respondem",
          dia: 9,
          porque:
            "Silêncio não é rejeição. O Dia 9 tem a central de follow-up inteira — é lá que está a maior parte do dinheiro que fica na mesa.",
        },
        {
          rotulo: "Respondem, mas a conversa não avança",
          dia: 8,
          porque:
            "O Dia 8 tem o banco de perguntas e os scripts de confirmar o que você entendeu, que é o que faz a conversa andar.",
        },
        {
          rotulo: "Converso, mas não chego à reunião",
          dia: 10,
          porque:
            "O Dia 10 tem o checklist de quando a conversa está madura e os scripts de convite e de marcar horário.",
        },
        {
          rotulo: "Faço reunião, mas não chego à proposta",
          dia: 11,
          porque:
            "O Dia 11 tem o roteiro completo da reunião, inclusive como devolver o que você entendeu e pedir permissão para enviar proposta.",
        },
        {
          rotulo: "Tenho proposta, mas ainda não fechei",
          dia: 13,
          porque:
            "O Dia 13 tem as objeções: está caro, preciso pensar, preciso falar com o sócio. Nenhuma delas é o fim da venda.",
        },
        {
          rotulo: "Não sei montar a oferta",
          dia: 12,
          porque:
            "O Dia 12 tem os modelos de escopo, os três modelos de remuneração e o modelo de proposta.",
        },
        {
          rotulo: "Minha operação está avançando bem",
          dia: 13,
          porque:
            "Então a sua tarefa é não parar de abastecer o topo. O Dia 13 tem a parte de voltar a construir oportunidades enquanto as propostas andam.",
        },
      ],
    },

    {
      tipo: "radar",
      chave: "sessenta-empresas",
      meta: 60,
      origemSugerida: "busca",
      ask: "Agora mais vinte empresas no radar.",
      support:
        "Para chegar a sessenta. Você começou com uma — faz duas semanas.",
    },

    {
      tipo: "copiar",
      chave: "indicacoes-rodada-3",
      ask: "E mais três pedidos de indicação.",
      support:
        "Duas versões novas: uma para empresário com quem você já conversou, e uma para depois de um “não” amigável. Quem disse não para você é uma das melhores fontes de indicação que existe.",
      mensagens: [
        {
          titulo: "Pedir indicação a um empresário",
          texto:
            "Obrigada pela conversa, [nome]. Aproveitando, estou ampliando minha rede de empresas e profissionais que posso conhecer. Você lembra de algum empresário que acha que faria sentido eu conhecer também?",
        },
        {
          titulo: "Depois de um “não” amigável",
          texto:
            "Sem problema, [nome]. Obrigada pela transparência. Antes de encerrar, posso te pedir uma ajuda? Estou ampliando minha rede e conhecendo outras empresas. Você lembra de algum empresário ou profissional que acha que faria sentido eu conhecer?",
        },
      ],
      confirmacao: "Mandei para mais três pessoas.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-14",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E mais cinco abordagens.",
      support:
        "Com estas você chega a quarenta e cinco. Faltam apenas cinco para a meta mínima do Desafio.",
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
      chave: "zerar-operacao",
      ask: "Agora zere sua operação.",
      support:
        "Follow-ups vencidos, conversas pendentes, reuniões, propostas. Nada em aberto sem próxima ação.",
      itens: [
        "Fiz todos os follow-ups vencidos.",
        "Respondi todas as conversas pendentes.",
        "Toda oportunidade minha tem próxima ação ou foi encerrada.",
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 14 concluído",
    titulo: "Agora você sabe onde agir.",
    lede: "Você começou com uma empresa. Agora existem sessenta no seu radar e você já iniciou conversa com quarenta e cinco. Isso não é sensação — é o que os seus próprios registros mostram.",
    badge: "Dia 14 de 21 concluído",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Leu o seu próprio funil",
      "Identificou onde a sua operação está travando",
      "Levou o radar a sessenta empresas",
      "Pediu mais três indicações",
      "Enviou mais cinco abordagens",
      "Zerou a operação do dia",
    ],
    amanha:
      "Amanhã a gente alcança um marco: as primeiras cinquenta empresas abordadas. E resolve uma coisa que ninguém fala — como isso cabe na sua vida de verdade.",
  },
}
