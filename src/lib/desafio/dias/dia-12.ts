import type { Dia } from "../tipos"

/**
 * DIA 12 — Monte sua primeira oferta.
 *
 * A frase que organiza o dia: «PREÇO VEM DEPOIS DO ESCOPO.» Por isso a ordem
 * dos passos é necessidade → escopo → o que não inclui → remuneração, e nunca
 * ao contrário.
 *
 * O documento é firme em duas proteções, e as duas estão nos textos abaixo:
 *   • CUIDADO COM O "SÓ COMISSÃO". Não é automaticamente ruim, mas variável
 *     sem entender a operação pode transformar a aluna em alguém trabalhando
 *     de graça em cima de uma operação que nem funciona.
 *   • NÃO MANDE PROPOSTA E DESAPAREÇA. Combinar o retorno ANTES de enviar é o
 *     que cria o follow-up.
 *
 * E o Caminho B é tão legítimo quanto o A: quem ainda não tem oportunidade NÃO
 * monta proposta fictícia. Aprende onde encontrar o modelo e volta a prospectar.
 * O documento é explícito — "não vai criar proposta fictícia durante duas
 * horas; a prioridade continua sendo prospecção".
 */
export const dia12: Dia = {
  dia: 12,
  kicker: "Dia 12",
  titulo: "Hoje você transforma uma oportunidade em uma oferta.",
  lede: "Até aqui você aprendeu a gerar oportunidade. Agora a gente organiza o que você faz, o que não faz, e quanto isso vale.",
  tempo: "45 minutinhos",
  objetivo:
    "Ensinar a definir escopo antes de preço, os três modelos de remuneração, os cuidados com o 'só comissão' e o modelo de proposta. Mais 5 abordagens (35 no acumulado), sem obrigar proposta fictícia.",

  guarde: [
    {
      titulo: "Preço vem depois do escopo",
      texto:
        "Você não consegue dizer quanto vale um trabalho que ainda não está definido.",
    },
    {
      titulo: "SDR + Closer é comercial",
      texto:
        "Não é tráfego, não é conteúdo, não é social media, não é suporte, não é SAC, não é pós-venda, não é secretariado. Se alguma dessas entrar, precisa estar claramente combinado.",
    },
    {
      titulo: "Cuidado com o “só comissão”",
      texto:
        "Não é automaticamente ruim. Mas antes de aceitar: a empresa gera oportunidades? O produto vende? Existe processo? Qual o ticket e o volume? Como a venda é atribuída? Quando a comissão é paga? Cancelamento afeta? Variável sem entender a operação pode te transformar em alguém trabalhando de graça.",
    },
    {
      titulo: "Sua proposta não precisa ganhar prêmio de design",
      texto:
        "Ela precisa responder: qual cenário entendemos, o que você propõe, o que você fará, como funcionará, qual o investimento e qual o próximo passo. Dez a quinze minutos, não quatro horas no Canva.",
    },
    {
      titulo: "Não mande proposta e desapareça",
      texto:
        "Combine o retorno ANTES de enviar. “Segue proposta” e rezar para a pessoa responder não é follow-up.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-12",
      label: "Dia 12 — Monte sua primeira oferta",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele mostra como sair da necessidade que você descobriu na reunião para um escopo claro — e só então falar de valor.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "modelos-de-escopo",
      ask: "Dois exemplos de escopo, para você ver a forma.",
      support:
        "Não copie: use como molde. Marque só o que você realmente vai assumir.",
      corpo: [
        "**Atuação SDR** — objetivo: organizar e desenvolver as oportunidades comerciais que chegam à empresa. Responsabilidades: realizar primeiro contato, qualificar oportunidades, acompanhar interessados, executar follow-ups, agendar oportunidades qualificadas para a próxima etapa, registrar o andamento comercial.",
        "**Atuação Closer** — objetivo: conduzir as oportunidades qualificadas até a decisão comercial. Responsabilidades: conduzir reuniões, entender a necessidade, apresentar a solução, trabalhar objeções, negociar, fechar, registrar o andamento.",
        "**Não inclui** (nos dois casos) — tráfego, criação de conteúdo, social media, atendimento administrativo, suporte ao cliente.",
      ],
      destaque: "O que não está escrito vira sua responsabilidade por omissão.",
      cta: "Entendi",
    },

    {
      tipo: "leitura",
      chave: "modelos-remuneracao",
      ask: "Os três modelos de remuneração.",
      support:
        "Não existe um formato obrigatório. O que existe é um formato coerente com a carga, o volume, a complexidade, o ticket e a responsabilidade.",
      corpo: [
        "**Fixo** — um valor mensal pelo trabalho.",
        "**Fixo + variável** — um valor base mais comissão ou remuneração por resultado definido.",
        "**Variável** — remuneração vinculada ao resultado.",
      ],
      nota: "Não digite “quanto devo cobrar?” numa IA e aceite o número que aparecer. A Biblioteca tem a aula de remuneração com exemplos.",
      cta: "Entendi",
    },

    // Caminho A e Caminho B no mesmo passo: `livre` deixa quem não tem
    // oportunidade atravessar sem inventar uma.
    {
      tipo: "empresa",
      chave: "minha-oferta",
      quantidade: "livre",
      defineStatus: "proposta",
      proximaAcao: {
        rotulo: "Quando vocês voltam a falar?",
        placeholder: "Retomar quinta para ela me dizer o que achou",
      },
      ask: "Tem alguma oportunidade para montar proposta?",
      support:
        "Se sim, abra a empresa e monte aqui. Se não, pode seguir — você aprendeu hoje para estar pronta, não para criar trabalho artificial.",
      campos: [
        {
          tipo: "area",
          chave: "necessidade",
          rotulo: "Qual é a principal necessidade que você identificou?",
        },
        {
          tipo: "radio",
          chave: "atuacao",
          rotulo: "Qual será a sua atuação?",
          opcoes: ["SDR", "Closer", "SDR + Closer"],
          inline: true,
        },
        {
          tipo: "area",
          chave: "responsabilidades",
          rotulo: "Pelo que você será responsável, na prática?",
          ajuda: "Uma por linha. Só o que você realmente vai assumir.",
        },
        {
          tipo: "area",
          chave: "nao_inclui",
          rotulo: "E o que NÃO está incluído?",
          ajuda:
            "Esse campo protege você. O que não está escrito aqui vira sua responsabilidade por omissão.",
        },
        {
          tipo: "area",
          chave: "rotina",
          rotulo: "Como será a rotina?",
          placeholder: "Duas horas por dia, de manhã, com reunião semanal de alinhamento",
        },
        {
          tipo: "radio",
          chave: "modelo_remuneracao",
          rotulo: "Como será sua remuneração?",
          opcoes: ["Fixo", "Fixo + variável", "Variável"],
          inline: true,
        },
        {
          tipo: "texto",
          chave: "valor_fixo",
          rotulo: "Valor fixo (R$)",
          obrigatorio: false,
        },
        {
          tipo: "texto",
          chave: "variavel",
          rotulo: "Como funciona o variável?",
          obrigatorio: false,
        },
        {
          tipo: "texto",
          chave: "inicio",
          rotulo: "Previsão de início",
          obrigatorio: false,
        },
      ],
      nota: "Se o modelo for só variável, volte na pergunta do “só comissão” lá em cima antes de enviar. Não é proibido — é para ser entendido.",
    },

    {
      tipo: "copiar",
      chave: "modelo-proposta",
      ask: "O modelo da proposta.",
      support:
        "Copie, troque o que está entre colchetes, mande. Oito blocos, nada de vinte e sete páginas.",
      mensagens: [
        {
          titulo: "Proposta de atuação comercial",
          texto: `PROPOSTA DE ATUAÇÃO COMERCIAL

Empresa: [empresa]
Profissional: [seu nome]

1. CONTEXTO
A partir da nossa conversa, identificamos que hoje [descrever de forma objetiva o cenário que o empresário validou].

2. OBJETIVO DA ATUAÇÃO
Minha atuação terá como objetivo [objetivo].

3. ESCOPO — ficarei responsável por:
- [responsabilidade]
- [responsabilidade]
- [responsabilidade]

4. NÃO INCLUI
- [item]
- [item]

5. ROTINA E FORMATO
[explicar de forma simples como a atuação vai acontecer]

6. INVESTIMENTO
Fixo: R$ [valor]
Variável: [quando aplicável]

7. INÍCIO
Previsão: [data]

8. PRÓXIMO PASSO
Com a aprovação da proposta, seguimos para contrato, alinhamento inicial e início da operação.`,
        },
      ],
      confirmacao: "Guardei o modelo e sei onde encontrar.",
    },

    {
      tipo: "copiar",
      chave: "scripts-proposta",
      ask: "E os scripts de enviar e sustentar a proposta.",
      support:
        "O primeiro é o mais importante do dia: ele cria o follow-up antes de a proposta existir.",
      mensagens: [
        {
          titulo: "Combinar o envio ANTES de enviar",
          texto:
            "Vou organizar a proposta com base no que conversamos e te envio até [dia]. Depois podemos falar [dia] para eu tirar suas dúvidas e você me dizer o que achou. Pode ser?",
        },
        {
          titulo: "Enviar a proposta",
          texto:
            "Oi, [nome]! Conforme combinamos, organizei a proposta com base no que conversamos. Estou te enviando por aqui. Dá uma olhada com calma e, como alinhamos, [dia] retomamos para conversar sobre qualquer dúvida e próximos passos.",
        },
        {
          titulo: "Se disserem “está caro”",
          texto:
            "Entendo. Quando você diz que ficou alto, é pelo valor em si ou porque ainda não ficou claro para você o retorno e o escopo dessa atuação?",
        },
        {
          titulo: "Se pedirem desconto",
          texto:
            "Podemos olhar o formato. Antes de mexer no valor, prefiro entender o que precisaria mudar para fazer sentido para vocês.",
        },
        {
          titulo: "Se disserem “preciso pensar”",
          texto:
            "Claro. Tem algum ponto específico que você sente que precisa avaliar melhor? Te pergunto porque talvez exista alguma informação que eu possa esclarecer antes.",
        },
      ],
      nota: "Não dê desconto na hora. Se o investimento cai muito, a responsabilidade provavelmente precisa cair também — e isso é conversa de escopo, não de desconto.",
      confirmacao: "Li os scripts da proposta.",
    },

    {
      tipo: "empresa",
      chave: "mais-cinco-dia-12",
      quantidade: 5,
      defineStatus: "abordagem-enviada",
      ask: "E a operação continua: mais cinco abordagens.",
      support:
        "Vale para os dois caminhos. Com estas, você chega a trinta e cinco empresas abordadas.",
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
      cta: "Concluir minha missão de hoje",
    },
  ],

  fim: {
    kicker: "Dia 12 concluído",
    titulo: "Agora você sabe o que oferecer.",
    lede: "E, mais importante, sabe o que NÃO oferecer. Esse campo do “não inclui” é o que vai proteger você no primeiro contrato.",
    badge: "Dia 12 de 21 concluído",
    feito: [
      "Entendeu que preço vem depois do escopo",
      "Viu os modelos de escopo de SDR e de Closer",
      "Conheceu os três modelos de remuneração e os riscos do só comissão",
      "Guardou o modelo de proposta e os scripts de envio",
      "Enviou mais cinco abordagens",
    ],
    amanha:
      "Amanhã: o empresário diz “gostei, mas...”. Está caro. Preciso pensar. Preciso falar com meu sócio. Isso não significa que a venda acabou — significa que começou uma conversa sobre decisão.",
  },
}
