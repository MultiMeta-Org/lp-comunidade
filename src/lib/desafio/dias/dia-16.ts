import type { Dia } from "../tipos"

/**
 * DIA 16 — Não perca oportunidades por falta de organização.
 *
 * A frase que abre o dia: «existem vendas que você perde por objeção; existem
 * vendas que você perde por desorganização». E a que fecha: «organização não
 * substitui venda — organização faz com que as oportunidades que você gerou
 * não sejam desperdiçadas».
 *
 * O bloco de CRM + Quiz vem DEPOIS do conteúdo e da missão, nunca no topo, e
 * sem preço. O documento é claro: aqui o objetivo é identificar interesse, não
 * vender — a oferta nasce da dor real que o próprio dia acabou de expor.
 * O preço vive na página de destino, que é entrega da equipe.
 */
export const dia16: Dia = {
  dia: 16,
  kicker: "Dia 16",
  titulo: "Hoje você organiza para saber o que fazer.",
  lede: "Não para ficar bonito. Para conseguir olhar sua operação e saber quem precisa de você hoje.",
  tempo: "40 minutinhos",
  objetivo:
    "Revisar todas as oportunidades ativas (status, última ação, próxima ação e data), zerar o que está atrasado, Radar a 80/100 e +5 abordagens (55 no acumulado).",

  guarde: [
    {
      titulo: "Dois jeitos de perder uma venda",
      texto:
        "Existem vendas que você perde por objeção. E existem vendas que você perde por desorganização. A segunda dói mais, porque era evitável.",
    },
    {
      titulo: "Organização comercial existe para gerar ação",
      texto: "Não organize para ficar bonito. Organize para saber o que fazer.",
    },
    {
      titulo: "Quanto maior sua carteira, menos você pode depender da sua memória",
      texto:
        "Organização não substitui venda. Organização faz com que as oportunidades que você gerou não sejam desperdiçadas.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-16",
      label: "Dia 16 — Não perca oportunidades por falta de organização",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra como revisar a sua carteira inteira e sair sabendo exatamente quem precisa de você hoje.",
      cta: "Já assisti",
    },

    {
      tipo: "funil",
      chave: "meu-funil-dia-16",
      ask: "Seu funil comercial agora.",
      support: "Duas semanas atrás isso era uma empresa só.",
      cta: "Entendi",
    },

    {
      tipo: "copiar",
      chave: "scripts-retomada",
      ask: "Dois scripts para retomar o que esfriou.",
      support:
        "Você vai encontrar follow-up atrasado e conversa que simplesmente parou. Não precisa se desculpar demais — só retomar.",
      mensagens: [
        {
          titulo: "Follow-up atrasado",
          texto:
            "Oi, [nome]! Estou retomando nossa conversa sobre [assunto]. Acabei não voltando na data que tínhamos falado, mas queria saber como ficou essa questão por aí e se ainda faz sentido retomarmos.",
        },
        {
          titulo: "Conversa antiga, sem data combinada",
          texto:
            "Oi, [nome]! Estava revisando algumas conversas e lembrei do que falamos sobre [contexto]. Queria saber como essa parte está hoje por aí e se ainda faz sentido conversarmos sobre isso.",
        },
      ],
      confirmacao: "Li os dois scripts de retomada.",
    },

    {
      tipo: "empresa",
      chave: "revisar-carteira",
      quantidade: "livre",
      proximaAcao: {
        rotulo: "Qual é a próxima ação dessa empresa?",
        placeholder: "Retomar quinta para saber da proposta",
      },
      ask: "Agora revise suas oportunidades ativas, uma por uma.",
      support:
        "Para cada empresa com quem você já falou: o estágio está certo? A próxima ação está definida? Tem data, quando precisa?",
      campos: [
        {
          tipo: "radio",
          chave: "revisao",
          rotulo: "O que essa empresa precisa?",
          opcoes: [
            "Está em dia, só confirmei",
            "Tinha follow-up atrasado e eu fiz agora",
            "Tinha um retorno prometido e eu fiz agora",
            "Estava sem próxima ação e agora tem",
            "Encerrei essa oportunidade",
          ],
        },
      ],
      nota: "Encontrou follow-up atrasado? Faça agora, não amanhã. Encontrou retorno prometido que você não deu? Faça agora também. Os scripts estão no passo anterior.",
    },

    {
      tipo: "radar",
      chave: "oitenta-empresas",
      meta: 80,
      origemSugerida: "busca",
      ask: "Mais dez empresas no radar.",
      support:
        "Para chegar a oitenta. Porque organização sem geração de oportunidade também não constrói carreira.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-16",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E mais cinco abordagens.",
      support: "Com estas você chega a cinquenta e cinco empresas abordadas.",
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
      chave: "zerar-operacao-dia-16",
      ask: "Zere sua operação de hoje.",
      support:
        "Quero que você termine esse dia conseguindo responder: quem precisa de mim hoje? Qual é minha próxima ação? Qual reunião está chegando? Qual proposta precisa de retorno?",
      itens: [
        "Todas as minhas oportunidades ativas têm status correto.",
        "Todas têm próxima ação, com data quando precisa.",
        "Nada ficou atrasado.",
      ],
    },

    // Depois do conteúdo e da missão, nunca no topo. E sem preço: aqui o
    // objetivo é identificar interesse.
    {
      tipo: "interesse",
      chave: "crm-quiz",
      interesse: "crm-quiz",
      opcional: true,
      ask: "Quer profissionalizar sua operação?",
      support:
        "Você acabou de organizar sua carteira à mão, e viu o trabalho que dá. A MultiMeta tem duas ferramentas para exatamente essas duas etapas: o Quiz organiza a ENTRADA e a coleta de informação (formulários comerciais, cadastro, qualificação, triagem); o CRM organiza o ANDAMENTO (empresas, etapas, follow-ups, próximas ações, reuniões, propostas, clientes). Como aluna da Empreendedora Anônima você tem uma condição bem diferente da contratação convencional.",
      pergunta: "O que mais te interessa agora?",
      opcoes: [
        "As duas, quero organizar tudo",
        "Mais o CRM, para acompanhar as oportunidades",
        "Mais o Quiz, para organizar a entrada",
        "Só quero entender melhor antes",
      ],
      nota: "Quiz → CRM → conversa → reunião → proposta → venda. Quem levanta a mão aqui recebe os detalhes e a condição — sem compromisso nenhum.",
      cta: "Quero conhecer o CRM + Quiz",
    },
  ],

  fim: {
    kicker: "Dia 16 concluído",
    titulo: "Agora você sabe quem precisa de você hoje.",
    lede: "Não é mais “tenho um monte de gente para falar”. É uma operação que você consegue olhar e entender. Essa é a diferença entre carregar oportunidades na cabeça e tocar uma carteira.",
    badge: "Dia 16 de 21 concluído",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Revisou todas as suas oportunidades ativas",
      "Zerou o que estava atrasado",
      "Levou o radar a oitenta empresas",
      "Enviou mais cinco abordagens",
      "Deixou toda oportunidade com próxima ação",
    ],
    amanha: "Amanhã a gente continua construindo.",
  },
}
