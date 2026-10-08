import type { Dia } from "../tipos"

/**
 * DIA 7 — Sua primeira abordagem profissional.
 *
 * O marco do Desafio: hoje ela deixa de ser uma mulher estudando para
 * trabalhar com comercial e passa a ter dez conversas iniciadas no mercado.
 *
 * TODOS OS SCRIPTS FALADOS NO VÍDEO ESTÃO AQUI PARA COPIAR, inclusive os de
 * resposta — e isso não é conveniência, é o que faz o dia ser concluído. Ela
 * pode receber resposta cinco minutos depois de enviar, e "ainda não cheguei
 * nessa aula" não é algo que ela possa responder a um empresário. Por isso as
 * respostas rápidas vêm ANTES das dez abordagens, não depois.
 *
 * As dez empresas movem para `abordagem-enviada` no Radar (defineStatus) — a
 * segunda semente do CRM: daqui a alguns dias ela não vai lembrar quem
 * respondeu, quem pediu para chamar sexta e quem ficou de falar com o sócio.
 *
 * Ausência de resposta NÃO é rejeição, e o status reflete isso: a empresa fica
 * em "abordagem enviada" até o follow-up do Dia 9, em vez de virar
 * "sem interesse".
 */
export const dia07: Dia = {
  dia: 7,
  kicker: "Dia 7",
  titulo: "Hoje você começa dez conversas de verdade.",
  lede: "Simples de entender e talvez desconfortável de executar. Mas eu não vou te mandar lá sozinha: você vai ter a mensagem, o motivo dela funcionar e o que responder em cada caso.",
  tempo: "45 minutinhos",
  objetivo:
    "Ensinar a iniciar uma conversa comercial sem chegar vendendo, diagnosticando ou mandando textão. Enviar 10 abordagens reais e registrar cada uma no Radar.",

  guarde: [
    {
      titulo: "As três portas",
      texto:
        "Indicação ou conexão (a melhor), empresa que você já conhece, e prospecção fria. A porta muda a mensagem.",
    },
    {
      titulo: "Você está pedindo permissão, não apontando problema",
      texto:
        "Não diga que encontrou uma falha. Peça para começar uma conversa e faça boas perguntas.",
    },
    {
      titulo: "Não dá para “queimar” empresa",
      texto:
        "Você vai estudar antes, e seu Radar vai chegar a 100. A gente não trata pessoas como números — mas também não transforma cada empresa numa oportunidade tão preciosa que você trava e nunca fala.",
    },
    {
      titulo: "Ausência de resposta não é rejeição",
      texto:
        "Não mande três interrogações amanhã e não apague a empresa do Radar. A gente vai fazer follow-up, e eu vou te ensinar exatamente como e quando.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-7",
      label: "Dia 7 — Sua primeira abordagem profissional",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra as três portas de entrada, a mensagem de cada uma e o que fazer com cada tipo de resposta.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "as-tres-portas",
      ask: "Suas trinta empresas não vieram do mesmo lugar.",
      support: "E é isso que decide como você começa a conversa.",
      corpo: [
        "**Porta 1 — indicação ou conexão.** Alguém indicou a empresa ou abriu a porta. É a melhor.",
        "**Porta 2 — você já conhece a empresa.** Você é cliente, conhece o profissional, acompanha há um tempo.",
        "**Porta 3 — prospecção fria.** Não existe relacionamento nenhum ainda.",
      ],
      nota: "Em nenhuma das três você apresenta proposta, manda PDF, manda currículo, conta a história da sua vida nem pergunta “vocês precisam de Closer?”.",
      cta: "Entendi",
    },

    {
      tipo: "copiar",
      chave: "scripts-indicacao",
      ask: "Porta 1 — quando alguém te indicou.",
      support:
        "Duas versões, porque muda se a pessoa que indicou já avisou ou não. Troque nome, empresa e contexto — não copie sem ler.",
      mensagens: [
        {
          titulo: "Quando quem indicou já avisou",
          texto:
            "Oi, [nome]! Tudo bem? Meu nome é [seu nome]. A [nome da indicação] comentou com você sobre mim e me passou seu contato. Estou iniciando minha atuação profissional na área comercial como SDR e Closer e gostaria de conhecer um pouco melhor como vocês trabalham essa parte na [empresa]. Posso te fazer uma pergunta rápida?",
        },
        {
          titulo: "Quando você tem o nome, mas não houve apresentação",
          texto:
            "Oi, [nome]! Tudo bem? Meu nome é [seu nome]. A [nome] me indicou conhecer o trabalho de vocês na [empresa]. Estou atuando na área comercial como SDR e Closer e achei que faria sentido conhecer um pouco melhor como vocês trabalham essa parte por aí. Posso te fazer uma pergunta rápida?",
        },
      ],
      confirmacao: "Li e sei como adaptar.",
    },

    {
      tipo: "copiar",
      chave: "scripts-conheco",
      ask: "Porta 2 — quando você já conhece a empresa.",
      support:
        "Use contexto VERDADEIRO. Não escreva “acompanho vocês há muito tempo” para uma empresa que você descobriu ontem.",
      mensagens: [
        {
          texto:
            "Oi, [nome]! Tudo bem? Eu já conheço o trabalho de vocês há [contexto verdadeiro] e estou atuando profissionalmente na área comercial como SDR e Closer. Esses dias comecei a olhar a empresa também com esse olhar comercial e fiquei curiosa para entender um pouco melhor como vocês trabalham essa parte hoje. Posso te fazer uma pergunta?",
        },
      ],
      confirmacao: "Li e sei como adaptar.",
    },

    {
      tipo: "copiar",
      chave: "scripts-fria",
      ask: "Porta 3 — prospecção fria.",
      support:
        "Essa é a que pede mais cuidado. Curta, honesta, sem textão. E se você não souber o nome do dono, não invente: tem uma versão para isso.",
      mensagens: [
        {
          titulo: "Quando você sabe com quem falar",
          texto:
            "Oi, [nome]! Tudo bem? Meu nome é [seu nome]. Conheci a [empresa] através de [onde encontrou] e estou atuando profissionalmente na área comercial como SDR e Closer. Estava conhecendo um pouco melhor o trabalho de vocês e queria te fazer uma pergunta rápida sobre a parte comercial. Posso?",
        },
        {
          titulo: "Quando é o WhatsApp geral e você não sabe o nome",
          texto:
            "Oi! Tudo bem? Meu nome é [seu nome]. Estou conhecendo melhor o trabalho da [empresa] e queria conversar com a pessoa responsável pela parte comercial ou pelo negócio. Com quem eu poderia falar?",
        },
      ],
      nota: "Falar com a recepção ou com o atendimento não é fracasso. Isso já é prospecção.",
      confirmacao: "Li e sei como adaptar.",
    },

    // Vem ANTES das abordagens de propósito: a resposta pode chegar em cinco
    // minutos, e ela precisa já ter lido o que dizer.
    {
      tipo: "copiar",
      chave: "respostas-rapidas",
      ask: "Antes de enviar: leia o que responder.",
      support:
        "A resposta pode chegar cinco minutos depois. Essas cinco cobrem quase tudo que você vai ouvir hoje.",
      mensagens: [
        {
          titulo: "Se perguntarem “sobre o quê?”",
          texto:
            "Eu atuo como SDR e Closer e estou conhecendo melhor algumas empresas do segmento para entender como trabalham hoje a geração, o acompanhamento e a conversão das oportunidades comerciais. Queria entender brevemente como funciona por aí e ver se existe algum ponto em que minha atuação poderia fazer sentido.",
        },
        {
          titulo: "Se perguntarem “você está vendendo alguma coisa?”",
          texto:
            "Eu estou buscando empresas com as quais minha atuação comercial possa fazer sentido, sim. Mas antes de oferecer qualquer trabalho, prefiro entender como vocês funcionam hoje para saber se existe realmente alguma oportunidade de contribuir.",
        },
        {
          titulo: "Se responderem “pode perguntar”",
          texto:
            "Hoje, como vocês trabalham a parte comercial por aí? Vocês já têm alguém responsável por acompanhar os contatos e oportunidades que chegam ou isso ainda fica mais concentrado em você e na equipe?",
        },
        {
          titulo: "Se disserem “não tenho interesse”",
          texto:
            "Sem problema, [nome]. Obrigada por me responder. Se em algum momento fizer sentido conversar sobre a parte comercial, fico à disposição.",
        },
      ],
      nota: "Em “não tenho interesse”, não pergunte por quê e não entre em debate. Objeção você vai aprender no Dia 13. E não transforme a conversa num questionário de quinze perguntas — o objetivo agora é conversar.",
      confirmacao: "Li as respostas rápidas.",
    },

    {
      tipo: "empresa",
      chave: "dez-abordagens",
      quantidade: 10,
      defineStatus: "abordagem-enviada",
      ask: "Agora envie dez abordagens.",
      support:
        "Comece pelas cinco que você escolheu ontem e pegue outras cinco do Radar. A primeira mensagem talvez leve dez minutos porque você vai revisar vinte vezes. Na décima, você já vai entender muito mais.",
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
          rotulo: "Você adaptou o script e enviou?",
          opcoes: ["Sim, enviei"],
          inline: true,
        },
      ],
      nota: "Cada empresa que você salvar aqui entra no Radar como “Abordagem enviada”, com a data de hoje. A partir de hoje, toda oportunidade precisa ter registro.",
    },

    // O portal reage à vida real dela em vez de obrigar todo mundo a andar na
    // mesma velocidade.
    {
      tipo: "formulario",
      chave: "aconteceu-algo",
      ask: "Alguma empresa já respondeu?",
      support:
        "Pode ser que nenhuma tenha respondido ainda, e isso é absolutamente normal no primeiro dia. Mas se a vida real andou mais rápido que o Desafio, me conta.",
      campos: [
        {
          tipo: "radio",
          chave: "resultado",
          rotulo: "Como está até agora?",
          opcoes: [
            "Não ainda",
            "Sim, respondeu",
            "Começamos uma conversa",
            "Consegui uma reunião",
            "Surgiu uma oportunidade de proposta",
            "Fechei um contrato",
          ],
        },
      ],
      nota: "Se você conseguiu uma reunião, não espere o Dia 11: a Biblioteca tem como conduzir sua primeira conversa. E se fechou contrato, clique em “Fechei meu primeiro contrato” agora, não importa em que dia você esteja.",
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 7 concluído",
    titulo: "Hoje você deixou de esperar uma oportunidade aparecer.",
    lede: "Talvez ninguém responda hoje. Talvez uma responda. Talvez cinco. Talvez apareça uma reunião. Nós não controlamos isso. O que você controla é estudar, executar, registrar, acompanhar e continuar — e você fez tudo isso.",
    badge: "Dia 7 de 21 concluído",
    placar: { de: "numero", n: 10, label: "conversas iniciadas" },
    feito: [
      "Entendeu as três portas de entrada",
      "Aprendeu a abordar sem chegar vendendo",
      "Guardou o que responder em cada caso",
      "Enviou dez abordagens reais",
      "Registrou todas elas no Radar",
    ],
    amanha:
      "Amanhã eu vou te ensinar a conduzir as respostas que começarem a chegar — e transformar uma abordagem em uma conversa comercial de verdade.",
  },
}
