import type { Dia } from "../tipos"

/**
 * DIA 20 — Essa habilidade pode te levar muito mais longe.
 *
 * «O Desafio termina. Sua construção profissional não.»
 *
 * O dia recolhe a direção que CADA aluna quer seguir — prioridade principal
 * mais interesses — e isso é dado de produto, não enfeite: é o que permite à
 * MultiMeta parar de anunciar friamente para a base inteira e falar com quem
 * levantou a mão.
 *
 * O bloco do Closer presencial reaparece aqui, e desta vez com mais contexto
 * que no Dia 1 — mas continua SEM checkout. O documento é explícito em não
 * mandar para pagamento: é lista de interesse, com disponibilidade de viagem
 * e o tipo de atuação. E a ressalva de resultado é obrigatória: as
 * remunerações variam e não são garantidas.
 */
export const dia20: Dia = {
  dia: 20,
  kicker: "Dia 20",
  titulo: "Hoje você escolhe para onde isso vai te levar.",
  lede: "Não para sempre. Para os próximos meses. E não é o Desafio que decide isso — é você.",
  tempo: "30 minutinhos",
  objetivo:
    "Mostrar os caminhos de crescimento de uma profissional comercial, colher a prioridade e os interesses de cada aluna, e +10 abordagens (90 no acumulado).",

  guarde: [
    {
      titulo: "Como uma profissional comercial cresce",
      texto:
        "Competência (ficar melhor no que faz) · Operações (acessar empresas e estruturas diferentes) · Responsabilidade (assumir mais partes do processo) · Ambientes (atuar no remoto e, se fizer sentido, no presencial).",
    },
    {
      titulo: "O Desafio termina. Sua construção profissional não.",
      texto:
        "Em vinte dias você aprendeu uma competência que o mercado paga. Isso não expira amanhã.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-20",
      label: "Dia 20 — Essa habilidade pode te levar muito mais longe",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra os caminhos reais de crescimento de quem trabalha com comercial — e quanto essa habilidade vale além do primeiro contrato.",
      cta: "Já assisti",
    },

    {
      tipo: "formulario",
      chave: "minha-prioridade",
      ask: "Qual é a sua prioridade para os próximos meses?",
      support: "Uma só como principal. Dá para querer tudo — mas não tudo ao mesmo tempo.",
      campos: [
        {
          tipo: "radio",
          chave: "prioridade",
          rotulo: "Minha prioridade principal é:",
          opcoes: [
            "Conquistar meu primeiro cliente",
            "Ganhar experiência e melhorar minha performance",
            "Construir uma carteira maior",
            "Conhecer operações comerciais maiores",
          ],
        },
        {
          tipo: "checks",
          chave: "interesses",
          rotulo: "Também tenho interesse em:",
          opcoes: [
            "Closer de eventos presenciais",
            "Aprender mais sobre gestão e operação comercial",
            "No momento quero focar somente na atuação que já comecei",
          ],
        },
      ],
    },

    {
      tipo: "interesse",
      chave: "closer-evento-dia-20",
      interesse: "closer-presencial",
      opcional: true,
      ask: "Você se imagina fechando vendas em eventos presenciais?",
      support:
        "Duas vezes por ano a MultiMeta realiza um treinamento presencial para mulheres que querem aprender a dinâmica específica de vendas e fechamento em eventos. Você aprende preparação, abordagem presencial, condução, objeções, fechamento, operação, comissão e trabalho em equipe.",
      // A ressalva de resultado é exigência do documento e não sai daqui.
      pergunta:
        "Você teria disponibilidade para viajar para participar presencialmente?",
      opcoes: ["Sim", "Talvez, dependendo da data e do local", "Não"],
      nota: "Dependendo do evento, ticket, comissão, volume e performance, esse tipo de operação pode gerar remunerações bastante relevantes em períodos concentrados. Os resultados variam e não são garantidos. Entrar na lista não é compra nem compromisso — quando tivermos informações sobre a próxima edição, a equipe pode entrar em contato.",
      cta: "Quero entrar na lista de interesse",
    },

    {
      tipo: "empresa",
      chave: "dez-abordagens-dia-20",
      quantidade: 10,
      defineStatus: "abordagem-enviada",
      ask: "E dez abordagens.",
      support:
        "Com estas você chega a noventa empresas abordadas. Faltam dois dias e a operação não para.",
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
      chave: "zerar-operacao-dia-20",
      ask: "Execute sua operação.",
      support:
        "Follow-ups, conversas, reuniões, propostas, próximas ações. Algumas alunas fecham justamente nos últimos dias — se for você, clique em “Fechei meu primeiro contrato”, não importa o dia.",
      itens: [
        "Fiz os follow-ups do dia.",
        "Respondi as conversas abertas.",
        "Acompanhei reuniões e propostas em aberto.",
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 20 concluído",
    titulo: "O Desafio termina. Sua construção não.",
    lede: "Amanhã não vai ser uma aula de parabéns. Eu quero que você saia daqui sabendo exatamente o que fazer na segunda-feira seguinte — sem depender do Desafio, sem esperar outra aula, sem voltar para o zero.",
    badge: "Dia 20 de 21 concluído",
    feito: [
      "Viu os caminhos de crescimento de uma profissional comercial",
      "Escolheu a sua prioridade para os próximos meses",
      "Enviou dez abordagens",
      "Executou a operação do dia",
    ],
    amanha:
      "Amanhã a gente transforma tudo o que você construiu em um plano para os próximos trinta dias.",
  },
}
