import type { Dia } from "../tipos"

/**
 * DIA 3 — Onde estão as suas primeiras oportunidades?
 *
 * O dia que monta o Radar. Três decisões do documento que o código precisa
 * respeitar, porque todas as três são fáceis de quebrar sem perceber:
 *
 *   1. A META DE 100 aparece HOJE pela primeira vez. Nos Dias 1 e 2 a empresa
 *      entra no Radar sem denominador, de propósito: mostrar "1/100" na
 *      primeira conquista transformaria uma vitória em dívida.
 *
 *   2. A EMPRESA DO DIA 1 JÁ ESTÁ LÁ. A meta é chegar a 10 no total, não
 *      cadastrar 10 novas — por isso o passo de Radar conta o Radar inteiro
 *      (`meta: 10`), e não quantas ela adicionou hoje.
 *
 *   3. A MISSÃO COBRA O QUE ESTÁ SOB O CONTROLE DELA. Ela precisa ENVIAR três
 *      pedidos de indicação, não RECEBER três respostas — enviar é dela,
 *      responder não é. É por isso que o último passo é uma confirmação e não
 *      um formulário de "quem indicou o quê".
 *
 * As respostas da primeira missão são do PERFIL da aluna, não do Radar:
 * formação, setores e os negócios que ela conhece como cliente ficam em
 * desafio_progresso, e vão servir depois para entender quais segmentos têm
 * mais aderência na base.
 */
export const dia03: Dia = {
  dia: 3,
  kicker: "Dia 3",
  titulo: "Hoje a gente monta o seu radar de empresas.",
  lede: "A meta de hoje é chegar a dez. Parece muita coisa, mas você vai ver como elas aparecem rapidinho.",
  tempo: "30 minutinhos",
  objetivo:
    "Mostrar que ela não começa do zero: formação, experiência, rede e consumo são portas de entrada. Apresentar a meta de 100 empresas, chegar às 10 primeiras e enviar 3 pedidos de indicação — sem abordar ninguém comercialmente.",

  guarde: [
    {
      titulo: "Suas 4 fontes de oportunidades",
      texto: "Formação, experiência, rede e consumo ou rotina.",
    },
    {
      titulo: "Não é uma escolha definitiva",
      texto:
        "Você não está escolhendo o único segmento em que poderá trabalhar. Estamos procurando boas portas de entrada para começar.",
    },
    {
      titulo: "Familiaridade não é diagnóstico",
      texto:
        "Ter familiaridade com um mercado é uma vantagem. Não significa que você já conhece a operação comercial daquela empresa.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-3",
      label: "Dia 3 — Onde estão suas primeiras oportunidades?",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra as suas quatro fontes de oportunidade: sua formação, sua experiência, sua rede e o que você já consome.",
      cta: "Já assisti",
    },

    // ── Missão 1: a história dela ──
    {
      tipo: "formulario",
      chave: "minhas-portas",
      ask: "Olhe para o que você já tem.",
      support:
        "Você não está começando do zero. Isso vai te ajudar daqui a pouco a escolher empresas que combinam com você.",
      campos: [
        {
          tipo: "texto",
          chave: "formacao_area",
          rotulo: "Qual é sua formação ou uma área que você conhece bem?",
          placeholder: "Fisioterapia",
        },
        {
          tipo: "texto",
          chave: "setores",
          rotulo: "Em quais setores você já trabalhou ou tem experiência?",
          placeholder: "Clínica, academia, escola infantil",
        },
        {
          tipo: "texto",
          chave: "negocios_que_conheco",
          rotulo:
            "Que tipos de negócios você conhece bem como cliente, pela sua rotina ou pela sua rede?",
          placeholder: "Salão, petshop, estúdio de pilates, restaurante do bairro",
        },
      ],
      nota: "Essas respostas são suas, não vão para o Radar. Elas me ajudam a entender por onde você tem mais facilidade para começar.",
      cta: "Salvar e continuar",
    },

    // ── Missão 2: as 10 empresas ──
    {
      tipo: "radar",
      chave: "dez-empresas",
      meta: 10,
      ask: "Agora vamos completar dez empresas.",
      support:
        "Procure no Instagram pelo tipo de negócio, no Google Maps pela sua cidade, ou lembre de quem você já conhece. A empresa do Dia 1 já está aqui te esperando.",
      nota: "Hoje você não vai oferecer nada para essas empresas. Hoje é só construir a lista.",
    },

    // ── Missão 3: as 3 indicações ──
    {
      tipo: "copiar",
      chave: "tres-indicacoes",
      ask: "Peça indicação para três pessoas.",
      support:
        "Você não está pedindo para alguém encontrar uma empresa “que precisa de vendas”. Você só quer ampliar seu Radar. Copie uma das mensagens abaixo e mande no WhatsApp.",
      mensagens: [
        {
          titulo: "Para alguém mais próximo",
          texto:
            "Oi, [nome]! Tudo bem? Estou começando uma nova atuação profissional na área comercial como SDR e Closer e estou fazendo um mapeamento de empresas e profissionais para conhecer melhor esse mercado. Você conhece alguém que tenha empresa ou um negócio e que acha que faria sentido eu conhecer? Pode ser de qualquer área. Se lembrar de alguém, me manda o nome ou o Instagram? ❤️",
        },
        {
          titulo: "Uma versão mais profissional",
          texto:
            "Oi, [nome]! Tudo bem? Estou iniciando uma nova atuação profissional na área comercial como SDR e Closer e estou mapeando empresas e profissionais para ampliar meu conhecimento desse mercado. Você conhece algum empresário ou profissional que tenha um negócio e que acha que faria sentido eu conhecer? Se lembrar de alguém, pode me enviar o nome ou Instagram?",
        },
      ],
      // O documento é explícito em NÃO perguntar para quem ela enviou, o
      // telefone, a relação, quando enviou nem o que responderam. Queremos
      // execução, não burocracia.
      confirmacao: "Mandei para três pessoas.",
      nota: "Você pode adaptar a mensagem para o seu jeito. O importante é manter o objetivo: pedir nomes, não pedir que a pessoa diagnostique uma necessidade comercial. E se a indicação chegar amanhã ou nos próximos dias, sem problema — é só adicionar a empresa no Radar com origem “Indicação”. Seu Radar fica disponível durante toda a jornada.",
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 3 concluído",
    titulo: "Seu radar começou a existir.",
    lede: "São empresas que você não tinha há uma hora. É daqui que vão sair as suas primeiras conversas.",
    badge: "Dia 3 de 21 concluído",
    // Lê o Radar de verdade: ela pode ter cadastrado 14, e dizer "10"
    // diminuiria o que ela fez.
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Descobriu as suas quatro fontes de oportunidade",
      "Viu que não está começando do zero",
      "Conheceu a meta das 100 empresas",
      "Chegou às suas primeiras 10 empresas",
      "Pediu três indicações",
    ],
    amanha:
      "Amanhã você vai aprender a enxergar uma empresa por dentro — o que dá para saber olhando, e o que só dá para saber perguntando.",
  },
}
