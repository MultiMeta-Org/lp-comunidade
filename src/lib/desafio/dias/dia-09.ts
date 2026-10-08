import type { Dia } from "../tipos"

/**
 * DIA 9 — O dinheiro também está no follow-up.
 *
 * O dia em que o portal começa a se comportar como central de trabalho e não
 * como curso: a aluna não deve entrar no Radar procurando à mão quem precisa
 * de follow-up — isso aparece pronto para ela (ver "Sua operação hoje", na
 * página do Desafio).
 *
 * DUAS FRASES SUSTENTAM O DIA:
 *   «Silêncio é silêncio. Não transforme silêncio automaticamente em rejeição.»
 *   «Se existe próxima ação, existe data.»
 *
 * A segunda é a razão de o passo de follow-up pedir data: próxima ação sem
 * data é intenção, e intenção não volta na tela sozinha.
 *
 * E uma distinção que o documento pede explicitamente que o sistema deixe
 * clara, porque confundir as duas desanima sem motivo:
 *   RADAR = empresas encontradas.  ABORDADAS = empresas com quem ela
 *   efetivamente iniciou contato.
 */
export const dia09: Dia = {
  dia: 9,
  kicker: "Dia 9",
  titulo: "Hoje você vai buscar o dinheiro que fica na mesa.",
  lede: "A maior parte das oportunidades não se perde no “não”. Se perde no silêncio que ninguém retomou.",
  tempo: "40 minutinhos",
  objetivo:
    "Ensinar follow-up como comportamento, não como insistência: retomar sem constranger, com data marcada. Mais 5 abordagens (20 no acumulado) e todas as oportunidades com próximo passo ou encerradas.",

  guarde: [
    {
      titulo: "Silêncio é silêncio",
      texto: "Não transforme silêncio automaticamente em rejeição.",
    },
    {
      titulo: "Se existe próxima ação, existe data",
      texto:
        "Próxima ação sem data é intenção. E intenção não volta na sua tela sozinha.",
    },
    {
      titulo: "Radar não é o mesmo que abordadas",
      texto:
        "Radar são as empresas que você encontrou. Abordadas são aquelas com quem você efetivamente iniciou contato. Os dois números crescem em ritmos diferentes, e está tudo bem.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-9",
      label: "Dia 9 — O dinheiro também está no follow-up",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra quando retomar, como retomar sem parecer que você está cobrando, e quando parar.",
      cta: "Já assisti",
    },

    {
      tipo: "copiar",
      chave: "central-follow-up",
      ask: "A central de follow-up.",
      support:
        "Dez situações, dez mensagens. Volte aqui sempre que precisar retomar alguma conversa — hoje e nos próximos dias.",
      mensagens: [
        {
          titulo: "Não respondeu à primeira abordagem",
          texto:
            "Oi, [nome]! Retomando minha mensagem por aqui porque sei que na correria ela pode ter passado. Queria conhecer um pouco melhor como vocês trabalham a parte comercial na [empresa]. Posso te fazer uma pergunta rápida?",
        },
        {
          titulo: "Segundo e último follow-up",
          texto:
            "Oi, [nome]! Vou fazer uma última tentativa por aqui para não ficar te chamando sem necessidade. Tenho interesse em conhecer melhor a operação comercial da [empresa] e entender se minha atuação como SDR + Closer poderia fazer sentido em algum momento. Se não for uma prioridade agora, sem problema.",
        },
        {
          titulo: "A conversa parou",
          texto:
            "Oi, [nome]! Retomando nossa conversa porque fiquei com aquela dúvida sobre [contexto]. Quando tiver um tempinho, me conta.",
        },
        {
          titulo: "Você identificou uma possível dor e a conversa parou",
          texto:
            "Oi, [nome]! Fiquei pensando no que você comentou sobre [situação]. Queria entender um pouco melhor essa parte para ver se existe alguma forma em que eu possa contribuir. Quando conseguir, me chama por aqui.",
        },
        {
          titulo: "Pediu para chamar depois",
          texto: "Claro! Posso te chamar na [dia ou data]?",
        },
        {
          titulo: "No dia combinado",
          texto:
            "Oi, [nome]! Como combinamos, estou retomando nossa conversa hoje. Conseguiu um tempinho para falarmos sobre a parte comercial?",
        },
        {
          titulo: "Depois de uma reunião",
          texto:
            "Oi, [nome]! Retomando nossa conversa sobre [contexto]. Você conseguiu avaliar o que conversamos? Se tiver alguma dúvida ou quiser ajustar algum ponto, podemos falar por aqui.",
        },
        {
          titulo: "Ficou de falar com o sócio ou com a equipe",
          texto:
            "Oi, [nome]! Como combinamos, estou retomando nosso contato. Você conseguiu conversar com [sócio ou equipe] sobre o que alinhamos?",
        },
        {
          titulo: "Proposta enviada",
          texto:
            "Oi, [nome]! Queria saber se conseguiu analisar a proposta que te enviei. Se surgiu alguma dúvida ou algum ponto que queira conversar antes de decidir, estou à disposição.",
        },
        {
          titulo: "Recebeu um não",
          texto:
            "Sem problema, [nome]. Obrigada por me responder. Se em algum momento fizer sentido conversar sobre essa parte, fico à disposição.",
        },
      ],
      confirmacao: "Li a central de follow-up.",
    },

    {
      tipo: "empresa",
      chave: "follow-ups",
      quantidade: "livre",
      proximaAcao: {
        rotulo: "E qual é o próximo passo agora?",
        placeholder: "Chamar na sexta se não responder",
      },
      ask: "Agora os follow-ups.",
      support:
        "Comece pelas empresas que estão esperando há mais tempo. Para cada uma, copie a mensagem da situação dela, envie, e registre quando você vai voltar.",
      campos: [
        {
          tipo: "radio",
          chave: "situacao",
          rotulo: "Qual é a situação dessa empresa?",
          opcoes: [
            "Não respondeu à primeira abordagem",
            "Foi o segundo e último follow-up",
            "A conversa parou no meio",
            "Pediu para chamar depois",
            "Ficou de falar com sócio ou equipe",
            "Disse que não tem interesse",
          ],
        },
        {
          tipo: "radio",
          chave: "enviei_followup",
          rotulo: "Enviou o follow-up?",
          opcoes: ["Sim, enviei", "Encerrei essa oportunidade"],
        },
      ],
      nota: "Encerrar não é fracasso. Depois do segundo follow-up sem resposta, encerrar com elegância libera sua energia para as outras noventa e oito empresas.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-9",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E mais cinco abordagens novas.",
      support:
        "Follow-up cuida do que já existe. Abordagem nova é o que garante que sempre vai existir algo para cuidar. Com estas, você chega a vinte empresas abordadas.",
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
      chave: "tudo-com-proximo-passo",
      ask: "Antes de fechar o dia.",
      support:
        "Essa é a pergunta que separa uma profissional comercial de alguém que manda mensagens. Nenhuma oportunidade sua deve estar no limbo.",
      itens: [
        "Todas as minhas oportunidades têm próximo passo ou foram encerradas.",
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 9 concluído",
    titulo: "Nenhuma oportunidade sua está no limbo.",
    lede: "Você retomou o que estava parado, encerrou o que não ia andar e abriu cinco frentes novas. É assim que uma operação comercial funciona de verdade.",
    badge: "Dia 9 de 21 concluído",
    feito: [
      "Entendeu follow-up como comportamento, não como insistência",
      "Guardou as dez mensagens da central de follow-up",
      "Retomou as conversas paradas",
      "Enviou mais cinco abordagens",
      "Deixou todas as oportunidades com próximo passo ou encerradas",
    ],
    amanha:
      "Amanhã a gente aprende a sair de uma conversa e levar uma oportunidade para uma reunião comercial.",
  },
}
