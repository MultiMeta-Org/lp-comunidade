import type { Dia } from "../tipos"

/**
 * DIA 6 — Construa sua lista de oportunidades.
 *
 * Dia operacional, e o vídeo admite isso: carreira comercial também se
 * constrói fazendo o trabalho que gera oportunidade. Uma empresa no Dia 1,
 * dez no Dia 3, trinta hoje.
 *
 * A empresa marcada como "quero aprofundar" no Dia 4 já entra entre as cinco
 * — por isso o passo pede 5, e não 4 "além daquela": a aluna escolhe de novo
 * a mesma empresa sem precisar lembrar que ela conta. O Radar NÃO ganha
 * colunas novas aqui, de propósito: as três perguntas sobre cada uma das cinco
 * são preparação para a conversa de amanhã, não cadastro.
 */
export const dia06: Dia = {
  dia: 6,
  kicker: "Dia 6",
  titulo: "Hoje a gente leva seu radar a trinta empresas.",
  lede: "E no fim você escolhe cinco para começar. Amanhã elas viram as suas primeiras conversas.",
  tempo: "40 minutinhos",
  objetivo:
    "Levar o Radar de 10 a 30 empresas, ensinar onde encontrá-las e escolher as 5 primeiras — com o mínimo de preparação para a abordagem do Dia 7.",

  guarde: [
    {
      titulo: "Onde encontrar empresas",
      texto:
        "Sua formação e experiência, sua rede e indicações, Instagram, Google e Mapas, negócios da sua região, empresas digitais.",
    },
    {
      titulo: "Volume não é spam",
      texto:
        "Ter muitas empresas no Radar não significa abordar todas de qualquer jeito. Significa não depender de uma só.",
    },
    {
      titulo: "Não faça Raio-X de todas",
      texto: "Primeiro construa seu Radar. O aprofundamento vem quando fizer sentido.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-6",
      label: "Dia 6 — Construa sua lista de oportunidades",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra onde procurar empresas e por que uma profissional comercial não pode depender de uma só.",
      cta: "Já assisti",
    },

    {
      tipo: "radar",
      chave: "trinta-empresas",
      meta: 30,
      ask: "Vamos chegar a trinta empresas.",
      support:
        "Procure no Instagram pelo tipo de negócio, no Google Maps pela sua cidade, nos negócios que você já frequenta. E se alguma indicação do Dia 3 chegou, ela entra aqui com origem “Indicação”.",
      nota: "Se alguém respondeu à sua indicação e apareceu uma oportunidade quente, converse. A vida real não espera o calendário do Desafio — e se virar contrato, clique em “Fechei meu primeiro contrato”, não importa em que dia você esteja.",
    },

    {
      tipo: "empresa",
      chave: "cinco-primeiras",
      quantidade: 5,
      ask: "Escolha cinco empresas para começar.",
      support:
        "Aquela que você marcou para aprofundar no Dia 4 pode ser uma delas. Para cada uma, olhe só o suficiente para amanhã você não chegar completamente no escuro.",
      campos: [
        {
          tipo: "texto",
          chave: "vende_o_que",
          rotulo: "O que ela vende?",
          placeholder: "Aulas de pilates por plano mensal",
        },
        {
          tipo: "checks",
          chave: "canal_comercial",
          rotulo: "Qual canal comercial você consegue identificar?",
          opcoes: [
            "WhatsApp",
            "Instagram",
            "Site",
            "Telefone",
            "Outro",
            "Não identifiquei",
          ],
        },
        {
          tipo: "texto",
          chave: "por_que_escolhi",
          rotulo: "Por que você escolheu essa empresa?",
          placeholder: "Conheço o trabalho delas e sou cliente",
        },
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 6 concluído",
    titulo: "Trinta empresas e cinco escolhidas.",
    lede: "Você começou com uma. Foi para dez. Agora tem trinta — e já sabe por quais vai começar.",
    badge: "Dia 6 de 21 concluído",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Aprendeu onde encontrar empresas",
      "Levou seu Radar a trinta",
      "Escolheu as cinco primeiras",
      "Preparou o mínimo sobre cada uma delas",
    ],
    // Reduz a ansiedade do Dia 7 de propósito: ela não vai ser mandada "se
    // virar". Isso é o que faz o Dia 7 ser concluído.
    amanha:
      "Amanhã você inicia suas primeiras conversas profissionais com empresas. E eu não vou te mandar lá sozinha: você vai receber a mensagem, entender por que ela funciona, saber como adaptar e o que fazer com cada tipo de resposta.",
  },
}
