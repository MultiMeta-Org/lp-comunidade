import type { Dia } from "../tipos"

/**
 * DIA 10 — Da conversa para a reunião.
 *
 * Duas frases que sustentam o dia e que também são regra de produto:
 *   «WhatsApp abre a conversa. A reunião aprofunda a oportunidade.»
 *   «Sua oportunidade real tem prioridade sobre o calendário das aulas.»
 *
 * A segunda é por que o passo da reunião é `livre`: o documento é explícito em
 * NÃO obrigar reunião artificial. Se nenhuma conversa amadureceu, ela segue a
 * operação normalmente — e isso não é dia malfeito.
 *
 * A ficha de preparação da reunião está aqui, vinculada à empresa, e não numa
 * ferramenta separada: ela é as perguntas do passo `empresa`, guardadas nas
 * notas daquela empresa, onde a aluna vai procurar antes da reunião.
 */
export const dia10: Dia = {
  dia: 10,
  kicker: "Dia 10",
  titulo: "Hoje você leva uma conversa para a mesa.",
  lede: "Mais cinco abordagens, os follow-ups do dia zerados, e — se alguma conversa amadureceu — o convite para uma reunião.",
  tempo: "40 minutinhos",
  objetivo:
    "Ensinar quando e como convidar para reunião, marcar horário, confirmar e lidar com não comparecimento. Mais 5 abordagens (25 no acumulado) sem obrigar reunião artificial.",

  guarde: [
    {
      titulo: "WhatsApp abre a conversa",
      texto: "A reunião aprofunda a oportunidade. São etapas diferentes.",
    },
    {
      titulo: "Sua oportunidade real tem prioridade sobre o calendário das aulas",
      texto:
        "Se a reunião vier hoje, vá. Se vier antes de você aprender a conduzir, a Biblioteca te espera.",
    },
    {
      titulo: "Quando vale levar para reunião",
      texto:
        "Existe uma dificuldade que vale aprofundar; existe uma etapa comercial sem responsável ou sobrecarregada; a empresa quer desenvolver uma frente comercial; o empresário demonstrou interesse pela sua atuação; ou a conversa ficou complexa demais para o WhatsApp. Não precisa ter todos — precisa existir motivo.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-10",
      label: "Dia 10 — Da conversa para a reunião",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra quando convidar, como marcar, como confirmar — e o que fazer quando a pessoa não aparece.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "quando-convidar",
      ask: "Quando vale convidar para uma reunião?",
      support:
        "Não precisa marcar todos. Precisa existir um motivo para aprofundar.",
      corpo: [
        "Existe uma **necessidade ou dificuldade** que vale aprofundar.",
        "Existe uma **etapa comercial sem responsável** ou sobrecarregada.",
        "A empresa **quer desenvolver** uma frente comercial.",
        "O empresário **demonstrou interesse** pela sua atuação.",
        "A conversa ficou **complexa demais para o WhatsApp**.",
      ],
      cta: "Entendi",
    },

    {
      tipo: "copiar",
      chave: "scripts-convite",
      ask: "Os scripts do convite.",
      support:
        "Do convite ao “quanto você cobra?”. Nenhum deles entrega preço antes de entender a operação.",
      mensagens: [
        {
          titulo: "Convite para reunião",
          texto:
            "Pelo que você me contou, acho que pode existir um espaço em que minha atuação faça sentido. Se você quiser, podemos marcar uma conversa rápida para eu entender melhor como funciona essa parte hoje e te explicar como eu poderia contribuir.",
        },
        {
          titulo: "Quando você identificou uma situação específica",
          texto:
            "Pelo que você me contou, essa parte de [situação] parece ser um ponto que vale entender melhor. Acho que faria sentido conversarmos alguns minutos para eu conhecer o processo de vocês e te mostrar como eu poderia atuar nessa etapa. Faz sentido para você?",
        },
        {
          titulo: "Se perguntarem “como você trabalha?”",
          texto:
            "Posso te explicar, sim. Como o formato depende bastante de como a operação de vocês funciona hoje, acho melhor eu entender primeiro algumas coisas e aí te mostrar onde minha atuação poderia entrar. Se quiser, podemos fazer uma conversa rápida.",
        },
        {
          titulo: "Se perguntarem “quanto você cobra?”",
          texto:
            "O formato e o valor dependem um pouco do que vocês precisam e de qual parte da operação eu assumiria. Prefiro entender melhor o cenário antes de te passar algo que talvez nem faça sentido para vocês. Podemos conversar alguns minutos?",
        },
      ],
      confirmacao: "Li os scripts do convite.",
    },

    {
      tipo: "copiar",
      chave: "scripts-agenda",
      ask: "E os de marcar, confirmar e remarcar.",
      support:
        "Marcar horário é onde muita reunião se perde. Ofereça duas opções, confirme no dia anterior e no dia.",
      mensagens: [
        {
          titulo: "Marcar horário",
          texto:
            "Ótimo. Eu consigo [dia e horário] ou [dia e horário]. Algum desses horários funciona para você?",
        },
        {
          titulo: "Nenhum horário funcionou",
          texto: "Sem problema. Qual período costuma ser melhor para você?",
        },
        {
          titulo: "Confirmação no dia anterior",
          texto:
            "Oi, [nome]! Tudo certo para nossa conversa amanhã às [horário]? Estou deixando o link por aqui: [link]. Até amanhã!",
        },
        {
          titulo: "Confirmação no mesmo dia",
          texto:
            "Oi, [nome]! Passando para confirmar nossa conversa hoje às [horário]. Segue o link: [link]. Até já!",
        },
        {
          titulo: "Chegou o horário",
          texto:
            "Oi, [nome]! Estou entrando para nossa conversa das [horário]. Segue novamente o link: [link].",
        },
        {
          titulo: "Não compareceu",
          texto:
            "Oi, [nome]! Estou no link da nossa conversa. Imagino que possa ter surgido algum imprevisto. Me avisa se consegue entrar ou se prefere que a gente remarque.",
        },
      ],
      confirmacao: "Li os scripts de agenda.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-10",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "Enquanto isso, sua operação continua: mais cinco abordagens.",
      support: "Com estas, você chega a vinte e cinco empresas abordadas.",
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
      chave: "follow-ups-dia-10",
      quantidade: "livre",
      proximaAcao: {
        rotulo: "Qual é o próximo passo?",
        placeholder: "Retomar segunda se não responder",
      },
      ask: "Zere seus follow-ups do dia.",
      support:
        "Todos executados ou reagendados. E toda conversa aberta precisa sair daqui com próximo passo.",
      campos: [
        {
          tipo: "radio",
          chave: "o_que_fiz",
          rotulo: "O que você fez com essa empresa hoje?",
          opcoes: [
            "Mandei o follow-up",
            "Respondi a conversa",
            "Reagendei para outro dia",
            "Encerrei essa oportunidade",
          ],
        },
      ],
    },

    // `livre` porque o documento é explícito: não obrigar reunião artificial.
    {
      tipo: "empresa",
      chave: "reuniao",
      quantidade: "livre",
      defineStatus: "reuniao",
      proximaAcao: {
        rotulo: "Qual é o próximo passo com essa empresa?",
        placeholder: "Confirmar no dia anterior e mandar o link",
      },
      ask: "Existe alguma oportunidade que já faz sentido levar para reunião?",
      support:
        "Se sim, convide com o script e preencha a ficha abaixo — é ela que você vai abrir cinco minutos antes da conversa. Se não, pode seguir: reunião forçada não ajuda ninguém.",
      campos: [
        { tipo: "texto", chave: "data_reuniao", rotulo: "Que dia?", placeholder: "12/10" },
        { tipo: "texto", chave: "hora_reuniao", rotulo: "Que horário?", placeholder: "15h" },
        {
          tipo: "texto",
          chave: "ficha_vende",
          rotulo: "O que ela vende?",
        },
        {
          tipo: "texto",
          chave: "ficha_como_chegam",
          rotulo: "Como as oportunidades chegam até ela?",
        },
        {
          tipo: "area",
          chave: "ficha_descobri",
          rotulo: "O que você já descobriu sobre o comercial dela?",
        },
        {
          tipo: "texto",
          chave: "ficha_motivo",
          rotulo: "Qual situação levou a essa reunião?",
        },
        {
          tipo: "area",
          chave: "ficha_falta",
          rotulo: "O que você ainda precisa entender?",
        },
      ],
      nota: "Conseguiu a reunião antes de aprender a conduzir? Vá à Biblioteca: tem a aula, o roteiro, as perguntas e como terminar a reunião. Sua oportunidade real tem prioridade sobre o calendário das aulas.",
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 10 concluído",
    titulo: "Sua operação está rodando.",
    lede: "Abordagem, follow-up, conversa e — quando faz sentido — reunião. Isso é o trabalho. Não é teoria mais, é a sua rotina comercial funcionando.",
    badge: "Dia 10 de 21 concluído",
    feito: [
      "Aprendeu quando uma conversa está madura para reunião",
      "Guardou os scripts de convite, agenda e confirmação",
      "Enviou mais cinco abordagens",
      "Zerou seus follow-ups do dia",
      "Deixou todas as conversas com próximo passo",
    ],
    amanha:
      "Amanhã a gente entra na reunião: o que perguntar, como conduzir e como terminar sem deixar a oportunidade no ar.",
  },
}
