import type { Dia } from "../tipos"

/**
 * DIA 4 — Aprenda a enxergar uma empresa.
 *
 * O Raio-X Comercial Express: três empresas do Radar, as mesmas seis perguntas
 * em cada uma, e UMA marcada como "quero aprofundar" — ela volta
 * automaticamente no Dia 6, entre as cinco escolhidas.
 *
 * ⚠️ AS SEIS PERGUNTAS DO RAIO-X FORAM DERIVADAS, NÃO TRANSCRITAS.
 * O documento define o Dia 4 (a ferramenta, o fluxo, os três Raio-X, a
 * marcação de aprofundamento, a regra de conclusão) mas diz "responde as 6
 * perguntas" sem listar quais — não há lista no texto, nem roteiro de vídeo
 * para este dia. As seis abaixo foram montadas a partir do que o próprio
 * documento exige delas:
 *   • servir ao princípio do dia, FATO ≠ HIPÓTESE: metade pergunta o que ela
 *     VÊ, metade transforma o que ela não sabe em PERGUNTA;
 *   • não procurar defeitos — nenhuma pergunta é "o que está errado";
 *   • caber em minutos, porque o documento alerta contra "um Raio-X enorme e
 *     burocrático cedo demais";
 *   • alimentar o Dia 6, que volta a esta empresa pedindo o que ela vende, o
 *     canal comercial e por que foi escolhida.
 * Trocar por outras seis é mexer só neste arquivo.
 */
export const dia04: Dia = {
  dia: 4,
  kicker: "Dia 4",
  titulo: "Hoje você aprende a enxergar uma empresa por dentro.",
  lede: "Três empresas do seu Radar, um olhar de poucos minutos em cada. Você não vai falar com ninguém hoje.",
  tempo: "25 minutinhos",
  objetivo:
    "Ensinar a observar uma operação comercial sem diagnosticar: registrar o que é fato e transformar o que falta em pergunta. Fazer três Raio-X e escolher uma empresa para aprofundar (que volta no Dia 6).",

  guarde: [
    {
      titulo: "Fato ≠ hipótese",
      texto: "Registre o que você sabe. Transforme o que não sabe em pergunta.",
    },
    {
      titulo: "Você não está procurando defeitos",
      texto: "Está aprendendo a entender a operação de uma empresa.",
    },
    {
      titulo: "Não faça Raio-X de todas",
      texto:
        "Primeiro o Radar. Depois o aprofundamento, quando fizer sentido. Você vai chegar a 100 empresas — investigar meia hora cada uma antes de saber se vai existir conversa transformaria isso num trabalho impossível.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-4",
      label: "Dia 4 — Aprenda a enxergar uma empresa",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra o que dá para saber olhando uma empresa de fora — e, principalmente, o que só dá para saber perguntando.",
      cta: "Já assisti",
    },

    {
      tipo: "empresa",
      chave: "raio-x",
      quantidade: 3,
      ask: "Faça o Raio-X de três empresas.",
      support:
        "São poucos minutos em cada. Responda o que você consegue ver — e, no que não conseguir, escreva a pergunta que você faria.",
      campos: [
        {
          tipo: "texto",
          chave: "o_que_vende",
          rotulo: "O que essa empresa vende?",
          placeholder: "Aulas de pilates por plano mensal",
        },
        {
          tipo: "checks",
          chave: "canais_visiveis",
          rotulo: "Por quais canais dá para falar com ela?",
          ajuda: "Pode marcar mais de um. Só o que você realmente viu.",
          opcoes: [
            "WhatsApp",
            "Instagram ou Direct",
            "Site ou formulário",
            "Telefone",
            "Presencial",
            "Não encontrei nenhum",
          ],
        },
        {
          tipo: "radio",
          chave: "responde_rapido",
          rotulo: "Dá para perceber se alguém responde quem chega?",
          opcoes: [
            "Sim, parece que respondem",
            "Parece que demoram ou não respondem",
            "Não consigo saber olhando de fora",
          ],
        },
        {
          tipo: "checks",
          chave: "etapas_que_vejo",
          rotulo: "Quais etapas do caminho comercial você consegue VER acontecendo?",
          ajuda: "Ver, não supor. Se não deu para ver, não marque.",
          opcoes: [
            "Entrada de interessados",
            "Atendimento e conversa",
            "Follow-up",
            "Agendamento",
            "Reunião ou avaliação",
            "Fechamento",
            "Pós-venda",
            "Não consigo ver nenhuma",
          ],
        },
        {
          tipo: "area",
          chave: "perguntas_que_faria",
          rotulo:
            "O que você NÃO conseguiu saber olhando de fora — e precisaria perguntar?",
          ajuda: "Essa é a pergunta mais importante do Raio-X. Escreva do seu jeito.",
        },
        {
          tipo: "texto",
          chave: "por_que_essa",
          rotulo: "Por que essa empresa chamou a sua atenção?",
          obrigatorio: false,
        },
      ],
    },

    {
      tipo: "empresa",
      chave: "quero-aprofundar",
      ask: "Qual delas você quer conhecer melhor primeiro?",
      support:
        "Escolha uma. Essa empresa volta no Dia 6, já te esperando entre as suas cinco.",
      campos: [
        {
          tipo: "texto",
          chave: "aprofundar_motivo",
          rotulo: "Por que essa?",
          placeholder: "É a que eu conheço melhor como cliente",
          obrigatorio: false,
        },
      ],
      cta: "Quero aprofundar esta empresa",
    },
  ],

  fim: {
    kicker: "Dia 4 concluído",
    titulo: "Três Raio-X prontos.",
    lede: "Você não precisa saber tudo sobre uma empresa antes de conversar com ela. Precisa aprender a observar e saber o que perguntar — e hoje você fez as duas coisas.",
    badge: "Dia 4 de 21 concluído",
    placar: { de: "numero", n: 3, label: "Raio-X concluídos" },
    feito: [
      "Aprendeu a separar o que é fato do que é hipótese",
      "Fez o Raio-X de três empresas do seu Radar",
      "Escreveu as perguntas que ainda faltam para cada uma",
      "Escolheu uma empresa para aprofundar",
    ],
    amanha:
      "Amanhã a gente te prepara para se apresentar como profissional. Não é sobre parecer experiente — é sobre saber responder quando alguém perguntar o que você faz.",
  },
}
