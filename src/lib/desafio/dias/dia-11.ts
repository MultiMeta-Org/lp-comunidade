import type { Dia } from "../tipos"

/**
 * DIA 11 — Sua primeira reunião comercial.
 *
 * O roteiro de reunião fica NO PORTAL, aberto durante a call — não num PDF
 * perdido na Biblioteca. É requisito explícito do documento, e a razão é
 * prática: ela não precisa decorar nada, precisa poder ler enquanto conversa.
 *
 * A frase que organiza o dia inteiro: «as perguntas são um mapa, não um
 * interrogatório». Pergunta boa com escuta boa vale mais que vinte perguntas
 * decoradas — por isso o roteiro vem dividido por etapa, e não como uma lista
 * de trinta itens para ela varrer de cima a baixo.
 *
 * Duas travas que protegem a aluna e que o documento pede nominalmente:
 *   • NÃO ACEITE FAZER TUDO. SDR + Closer é comercial, não "faz tudo da
 *     empresa". Aceitar qualquer escopo por ansiedade de fechar o primeiro
 *     contrato é o erro mais caro que ela pode cometer aqui.
 *   • NUNCA TERMINE SEM PRÓXIMO PASSO. "Qualquer coisa me chama" não é
 *     próximo passo — por isso a ficha pós-reunião exige um.
 *
 * E se ela não tem reunião, não inventa uma. Faz uma prática curta com uma
 * empresa com quem já conversou.
 */
export const dia11: Dia = {
  dia: 11,
  kicker: "Dia 11",
  titulo: "Hoje você senta com um empresário.",
  lede: "E a primeira coisa que eu quero tirar da sua cabeça: você não precisa entrar nessa reunião para provar que sabe tudo. Seu trabalho hoje é entender.",
  tempo: "45 minutinhos",
  objetivo:
    "Entregar um roteiro de reunião em cinco etapas que ela possa abrir durante a call, com todos os scripts copiáveis, e a ficha pós-reunião que atualiza o Radar. Mais 5 abordagens (30 no acumulado).",

  guarde: [
    {
      titulo: "O mapa da reunião",
      texto:
        "1. Abertura · 2. Cenário atual · 3. Processo comercial · 4. Necessidade e oportunidade · 5. Próximo passo.",
    },
    {
      titulo: "As perguntas são um mapa, não um interrogatório",
      texto: "Pergunta boa com escuta boa vale mais que vinte perguntas decoradas.",
    },
    {
      titulo: "A reunião não é uma apresentação sobre você",
      texto:
        "Fale o suficiente sobre você para contextualizar. Depois faça a conversa ser sobre a empresa.",
    },
    {
      titulo: "Não aceite fazer tudo",
      texto:
        "SDR + Closer é comercial. Não é “faz tudo da empresa”. Não aceite qualquer escopo só porque você quer fechar seu primeiro contrato.",
    },
    {
      titulo: "Nunca termine uma reunião sem próximo passo",
      texto:
        "Uma reunião não termina com “qualquer coisa me chama”. Precisa ter ação, prazo e follow-up.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-11",
      label: "Dia 11 — Sua primeira reunião comercial",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele percorre a reunião inteira: como abrir, o que perguntar, como devolver o que você entendeu e como combinar o próximo passo.",
      cta: "Já assisti",
    },

    {
      tipo: "copiar",
      chave: "roteiro-abertura",
      ask: "Etapa 1 — a abertura.",
      support:
        "Não precisa fazer discurso. Essa abertura já estabelece a lógica da reunião: primeiro entender, depois propor.",
      mensagens: [
        {
          titulo: "Abertura",
          texto:
            "Obrigada por separar esse tempo para conversar comigo, [nome]. Como te falei, eu atuo na área comercial como SDR e Closer. Antes de te explicar onde eu poderia contribuir, queria entender um pouco melhor como vocês trabalham hoje, porque não quero te propor alguma coisa sem conhecer minimamente a operação. Pode ser?",
        },
        {
          titulo: "Se a reunião veio de uma situação específica",
          texto:
            "Na nossa conversa você comentou sobre [situação]. Queria entender um pouco melhor como isso funciona hoje para conseguir enxergar se existe realmente algum espaço em que minha atuação faça sentido.",
        },
      ],
      confirmacao: "Li a abertura.",
    },

    {
      tipo: "copiar",
      chave: "roteiro-negocio",
      ask: "Etapa 2 — entenda o negócio e como os clientes chegam.",
      support:
        "Comece amplo. Você talvez já saiba pelo Instagram, mas ouvir o empresário descrevendo é outra coisa.",
      mensagens: [
        {
          texto:
            "Me conta um pouco sobre a empresa hoje. O que vocês vendem e quem normalmente compra de vocês?",
        },
        {
          texto:
            "Hoje, qual produto ou serviço é mais importante comercialmente para vocês?",
        },
        {
          texto: "Hoje, de onde normalmente vêm as oportunidades ou novos clientes?",
        },
        {
          texto:
            "Vocês trabalham mais com indicação, Instagram, tráfego, prospecção, Google, ou existem outros canais?",
        },
      ],
      confirmacao: "Li as perguntas do negócio.",
    },

    {
      tipo: "copiar",
      chave: "roteiro-comercial",
      ask: "Etapa 3 — entenda o processo comercial.",
      support:
        "Essas são as perguntas que fazem o empresário contar a operação dele. Escute mais do que pergunte.",
      mensagens: [
        {
          titulo: "O que acontece quando alguém chega",
          texto:
            "Quando uma pessoa demonstra interesse, o que acontece a partir dali?",
        },
        {
          titulo: "Quem faz o quê",
          texto: "Quem fica responsável por esse contato hoje?",
        },
        {
          texto:
            "Essa pessoa acompanha o contato até a decisão ou existem pessoas diferentes em cada etapa?",
        },
        {
          titulo: "E quem não compra na hora",
          texto:
            "E quando a pessoa demonstra interesse, mas não compra ou agenda naquele momento, o que vocês fazem hoje?",
        },
        { texto: "Entendi. E isso acontece com frequência?" },
        {
          titulo: "Prospecção",
          texto:
            "Hoje vocês também buscam novas oportunidades ativamente ou trabalham mais com as pessoas que chegam até vocês?",
        },
        {
          titulo: "Fechamento",
          texto: "E hoje quem conduz a parte de venda ou fechamento?",
        },
        { texto: "Essa parte ocupa muito do seu tempo hoje?" },
        {
          titulo: "Números, sem virar auditoria",
          texto: "Vocês têm uma média de quantas oportunidades chegam por mês?",
        },
        {
          texto:
            "Vocês acompanham quantas dessas oportunidades acabam virando clientes?",
        },
      ],
      nota: "Se a resposta for “nada” ou “não sei”, não faça cara de “achei o problema!”. Isso já é informação — você só continua.",
      confirmacao: "Li as perguntas do comercial.",
    },

    {
      tipo: "copiar",
      chave: "roteiro-necessidade",
      ask: "Etapa 4 — a necessidade, na boca dele.",
      support:
        "Estas duas são as perguntas mais importantes da reunião. Em vez de você dizer “seu problema é follow-up”, ele te conta qual é.",
      mensagens: [
        {
          texto:
            "Hoje, olhando para sua parte comercial, o que mais te incomoda ou o que você sente que poderia funcionar melhor?",
        },
        {
          texto:
            "Se essa parte estivesse funcionando melhor, o que você gostaria que mudasse na prática?",
        },
        {
          titulo: "Devolva o que você entendeu",
          texto:
            "Então, pelo que eu entendi, [resumo do que ele contou]. É isso? Deixei passar alguma coisa?",
        },
      ],
      confirmacao: "Li as perguntas da necessidade.",
    },

    {
      tipo: "copiar",
      chave: "roteiro-conexao",
      ask: "Etapa 5 — conecte sua atuação e combine o próximo passo.",
      support:
        "Só agora. E se não existir oportunidade, dizer isso constrói mais reputação do que forçar uma proposta.",
      mensagens: [
        {
          titulo: "Se a necessidade for de SDR",
          texto:
            "Pelo que você me explicou, eu vejo uma possibilidade de contribuir principalmente nessa parte de [X], assumindo ou ajudando no desenvolvimento e acompanhamento dessas oportunidades.",
        },
        {
          titulo: "Se for de Closer",
          texto:
            "Pelo que você me explicou, vejo uma possibilidade de contribuir principalmente na etapa de [X], conduzindo essas oportunidades que já chegam até a conversa comercial e o fechamento.",
        },
        {
          titulo: "Se forem as duas",
          texto:
            "Pelo cenário que você me apresentou, pode fazer sentido uma atuação mais completa, desde [X] até [Y]. Mas eu prefiro organizar exatamente o escopo antes de te propor um formato.",
        },
        {
          titulo: "Se NÃO existir oportunidade",
          texto:
            "Pelo que você me contou, hoje eu não vejo um ponto em que faria sentido eu te propor uma atuação só para tentar fechar alguma coisa. Mas foi muito bom conhecer a operação e, se esse cenário mudar, podemos conversar novamente.",
        },
        {
          titulo: "Pedir permissão para enviar proposta",
          texto:
            "Eu consigo enxergar uma possibilidade de atuação aqui. Quero organizar o escopo e te apresentar um formato coerente com o que conversamos. Posso te enviar uma proposta?",
        },
        {
          titulo: "Se perguntarem o preço na reunião",
          texto:
            "Quero definir primeiro exatamente o que ficaria sob minha responsabilidade para não te passar um valor desconectado do trabalho. Posso organizar isso e te retornar com uma proposta?",
        },
        {
          titulo: "Combinar o próximo passo",
          texto:
            "Então ficou combinado que eu organizo a proposta e te envio até amanhã. Depois podemos falar novamente na quinta-feira para você me dizer o que achou. Pode ser?",
        },
      ],
      confirmacao: "Li os scripts de conexão e fechamento.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-11",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "Sua operação continua: mais cinco abordagens.",
      support: "Com estas, você chega a trinta empresas abordadas.",
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
      chave: "ficha-pos-reuniao",
      quantidade: "livre",
      defineStatus: "reuniao-realizada",
      proximaAcao: {
        rotulo: "Qual foi o próximo passo combinado?",
        placeholder: "Enviar a proposta até amanhã e retomar quinta",
      },
      ask: "Fez alguma reunião? Registre agora, enquanto está fresco.",
      support:
        "Se você não tem reunião, não invente uma — pode seguir. Se fez, preencha aqui: é isso que vai para o seu Radar.",
      campos: [
        {
          tipo: "area",
          chave: "situacao_identificada",
          rotulo: "Qual foi a principal situação identificada?",
        },
        {
          tipo: "radio",
          chave: "onde_eu_entro",
          rotulo: "Onde a sua atuação poderia entrar?",
          opcoes: [
            "SDR",
            "Closer",
            "SDR + Closer",
            "Ainda não está claro",
            "Não existe oportunidade agora",
          ],
        },
        {
          tipo: "radio",
          chave: "proximo_passo_tipo",
          rotulo: "Qual foi o próximo passo?",
          opcoes: [
            "Enviar proposta",
            "Segunda conversa",
            "O empresário vai avaliar",
            "Vai falar com sócio ou equipe",
            "Follow-up futuro",
            "Sem oportunidade",
          ],
        },
        {
          tipo: "area",
          chave: "observacoes",
          rotulo: "Observações",
          obrigatorio: false,
        },
      ],
      nota: "Ficou algum escopo estranho em cima da mesa — responder Instagram, fazer tráfego, atender cliente? Anote aqui. Isso é conversa de escopo, e a gente resolve antes de proposta.",
    },

    // Quem não tem reunião faz a prática curta. Sem simulação teatral.
    {
      tipo: "empresa",
      chave: "pratica-reuniao",
      ask: "Agora uma prática rápida.",
      support:
        "Escolha uma empresa com quem você já conversou e responda duas coisas. Isso é o começo de qualquer preparação de reunião.",
      campos: [
        {
          tipo: "area",
          chave: "o_que_eu_ja_sei",
          rotulo: "O que eu já sei sobre o comercial dessa empresa?",
        },
        {
          tipo: "area",
          chave: "o_que_entenderia_em_reuniao",
          rotulo: "O que eu ainda precisaria entender em uma reunião?",
        },
      ],
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 11 concluído",
    titulo: "Percebe onde você chegou?",
    lede: "Você começou essa jornada sem saber exatamente como uma SDR e uma Closer trabalham. Agora já sabe encontrar empresas, abordar, conversar, acompanhar e sentar com um empresário para entender a operação dele.",
    badge: "Dia 11 de 21 concluído",
    feito: [
      "Recebeu o roteiro completo de reunião, para abrir durante a call",
      "Aprendeu a abrir sem fazer discurso sobre você",
      "Guardou as perguntas de cada etapa",
      "Aprendeu a devolver o que entendeu antes de propor",
      "Enviou mais cinco abordagens",
    ],
    amanha:
      "Amanhã a gente resolve a pergunta inevitável: encontrei uma oportunidade — o que exatamente eu ofereço e quanto eu cobro?",
  },
}
