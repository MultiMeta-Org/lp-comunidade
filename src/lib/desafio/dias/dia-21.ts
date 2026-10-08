import type { Dia } from "../tipos"

/**
 * DIA 21 — Agora você sabe o que fazer.
 *
 * A formatura, e o documento é firme em que ela NÃO seja uma aula de parabéns:
 * «eu quero que você saia daqui sabendo exatamente o que fazer na
 * segunda-feira seguinte — sem depender do Desafio, sem esperar outra aula,
 * sem voltar para o zero».
 *
 * TRÊS COISAS QUE O CÓDIGO NÃO PODE PERDER:
 *
 * 1. AS TRÊS NOTAS DE 0 A 10 VOLTAM, idênticas às do Dia Zero. É o antes e
 *    depois do dashboard de transformação, e as chaves (`saida_conversa`,
 *    `saida_contrato`, `saida_fechamento`) são lidas pela view
 *    comunidade.desafio_transformacao. Mexer no texto delas aqui sem mexer no
 *    Dia Zero quebra a comparação.
 *
 * 2. SE OS CONTRATOS FOREM ZERO, A TELA NÃO MENTE. O documento é explícito:
 *    não esconder, não fazer a aluna se sentir formada numa fantasia. "Sua
 *    operação ainda está em construção; use seus números para identificar o
 *    próximo gargalo." Ela sai sabendo exatamente o que precisa acontecer.
 *
 * 3. O CERTIFICADO NÃO É CERTIFICAÇÃO PROFISSIONAL. Nunca "Closer
 *    certificada" — o produto não é uma certificação formal. É conclusão de
 *    uma formação prática introdutória, e está escrito assim.
 *
 * O caminho Sócias de Projeto entra no fim, como interesse, e com a ressalva
 * que o documento exige: ela NÃO precisa disso para continuar a carreira.
 */
export const dia21: Dia = {
  dia: 21,
  kicker: "Dia 21",
  titulo: "Hoje você termina o que começou.",
  lede: "E hoje não é uma aula de parabéns. É o dia em que você sai sabendo exatamente o que fazer na segunda-feira que vem.",
  tempo: "40 minutinhos",
  objetivo:
    "Fechar as 100 empresas abordadas, colher as três notas de saída (o antes/depois da matrícula), montar o plano de 30 dias e assumir o compromisso de continuar sem o Desafio.",

  guarde: [
    {
      titulo: "A sua operação depois do Dia 21",
      texto:
        "Todos os dias em que você trabalhar: 1. veja o que está vencido · 2. execute o que é para hoje · 3. faça follow-up · 4. movimente conversas · 5. gere novas oportunidades conforme sua capacidade · 6. atualize a próxima ação.",
    },
    {
      titulo: "Se você ainda não fechou",
      texto:
        "Amanhã você não começa outro curso. Amanhã você continua sua operação. Não recomece do zero — corrija o ponto em que ela está travando.",
    },
    {
      titulo: "Se você já fechou",
      texto:
        "Sua responsabilidade mudou: não é mais “como consigo cliente?”, é “como entrego bem?”. Você não precisa sair correndo para conseguir o segundo se ainda nem sabe atender bem o primeiro.",
    },
    {
      titulo: "Mas não abandone sua própria carteira",
      texto:
        "Se você está cheia, pode reduzir o volume. Só saiba que está reduzindo porque sua capacidade está preenchida — não porque voltou a depender da sorte para conseguir o próximo.",
    },
    {
      titulo: "Capacidade é diferente de medo",
      texto:
        "Se sua rotina comporta dez, faça dez. Se comporta três, faça três. Mas não use “minha realidade” como nome bonito para medo.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-21",
      label: "Dia 21 — Agora você sabe o que fazer",
      ask: "Assista ao último vídeo.",
      support:
        "Antes de falar do que vem depois, eu quero que você volte mentalmente para o Dia 1 — e veja de onde você saiu.",
      cta: "Já assisti",
    },

    {
      tipo: "funil",
      chave: "meu-funil-final",
      ask: "Olha o que você fez.",
      support:
        "Você começou olhando uma empresa. Depois encontrou dez. Construiu seu radar, fez sua primeira abordagem, aprendeu follow-up, começou conversas, conheceu reunião, proposta, objeção, organização, rotina. E chegou aqui.",
      nota: "Isso é muito diferente de saber que uma profissão existe. Você começou a praticá-la.",
      cta: "Entendi",
    },

    {
      tipo: "empresa",
      chave: "ultimas-dez",
      quantidade: 10,
      defineStatus: "abordagem-enviada",
      ask: "Faltam dez para fechar cem.",
      support:
        "Não porque cem seja um número mágico. Porque eu quero que você tenha experimentado volume: mercado real, silêncio real, resposta real, objeção real, conversa real. Isso não se aprende assistindo. Se precisar de empresas novas, adicione — o radar não tem mais teto.",
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

    // ── As MESMAS três perguntas do Dia Zero ──
    // As chaves saida_* são lidas pela view desafio_transformacao. Não trocar
    // sem trocar as baseline_* do Dia Zero junto.
    {
      tipo: "formulario",
      chave: "saida",
      ask: "Agora as mesmas três perguntas do primeiro dia.",
      support:
        "Você respondeu essas três na sua matrícula, há vinte e um dias. Responda de novo, com a mesma sinceridade — e depois eu te mostro o que mudou.",
      campos: [
        {
          tipo: "escala",
          chave: "saida_conversa",
          rotulo:
            "Hoje, de 0 a 10, quanto você se sente preparada para conversar profissionalmente com um empresário?",
        },
        {
          tipo: "escala",
          chave: "saida_contrato",
          rotulo:
            "Hoje, de 0 a 10, quanto você se sente preparada para buscar seu primeiro contrato?",
        },
        {
          tipo: "escala",
          chave: "saida_fechamento",
          rotulo:
            "Hoje, de 0 a 10, quanto você se sente preparada para conduzir uma oportunidade comercial até o fechamento?",
        },
      ],
    },

    {
      tipo: "diagnostico",
      chave: "meu-gargalo-final",
      ask: "E onde a sua operação está travando agora?",
      support:
        "Essa é a pergunta mais útil de hoje. Ela é o que você vai corrigir a partir de amanhã — em vez de recomeçar do zero.",
      opcoes: [
        {
          rotulo: "Não estou conseguindo respostas",
          dia: 9,
          porque:
            "Revise abordagem, volume e follow-up. O Dia 9 tem a central de retomada completa.",
        },
        {
          rotulo: "Tenho conversas, mas elas não avançam",
          dia: 8,
          porque: "Revise a condução. O Dia 8 tem o banco de perguntas.",
        },
        {
          rotulo: "Tenho conversas, mas não chego a reuniões",
          dia: 10,
          porque: "Revise o convite e a transição. O Dia 10 tem os scripts.",
        },
        {
          rotulo: "Tenho reuniões, mas não chego a propostas",
          dia: 11,
          porque:
            "Revise o diagnóstico. O Dia 11 tem o roteiro inteiro, inclusive como pedir permissão para enviar proposta.",
        },
        {
          rotulo: "Tenho propostas, mas não fecho",
          dia: 13,
          porque:
            "Revise objeções, acompanhamento e oferta. Os Dias 12 e 13 tratam dos dois lados disso.",
        },
        {
          rotulo: "Já fechei — agora preciso entregar bem",
          dia: 21,
          porque:
            "Sua prioridade mudou. Clique em “Fechei meu primeiro contrato” na sua jornada: lá está contrato, onboarding, acessos, rotina, processo, indicadores e comunicação com o empresário.",
        },
      ],
    },

    {
      tipo: "formulario",
      chave: "plano-30-dias",
      ask: "Meus próximos 30 dias.",
      support:
        "A partir de amanhã eu não vou aparecer dizendo “hoje coloque dez empresas”. Agora é você — e por isso você precisa de uma rotina que continue sem o Desafio.",
      campos: [
        {
          tipo: "radio",
          chave: "objetivo_30_dias",
          rotulo: "Meu objetivo principal é:",
          opcoes: [
            "Fechar meu primeiro contrato",
            "Consolidar meu primeiro cliente",
            "Conquistar mais um cliente",
            "Melhorar minha performance comercial",
          ],
        },
        {
          tipo: "texto",
          chave: "dias_por_semana",
          rotulo: "Quantos dias por semana vou trabalhar?",
          placeholder: "4",
        },
        {
          tipo: "texto",
          chave: "empresas_por_dia",
          rotulo: "Quantas novas empresas por dia?",
          placeholder: "5",
        },
        {
          tipo: "texto",
          chave: "abordagens_por_dia",
          rotulo: "Quantas abordagens por dia?",
          placeholder: "5",
        },
        {
          tipo: "texto",
          chave: "bloco_principal",
          rotulo: "Meu bloco principal de trabalho",
          placeholder: "20h às 21h30",
        },
        {
          tipo: "area",
          chave: "principal_melhoria",
          rotulo: "Minha principal melhoria nos próximos 30 dias",
          placeholder: "Fazer follow-up no dia que combinei, sem deixar passar",
        },
      ],
      nota: "Cinco por dia, em vinte dias úteis, são cem empresas e cem abordagens. Você sabe que é possível porque acabou de construir exatamente isso. E se a sua rotina comporta dez, faça dez — só não use “minha realidade” como nome bonito para medo.",
    },

    {
      tipo: "confirma",
      chave: "compromisso-30-dias",
      ask: "Meu compromisso",
      support:
        "Nos próximos 30 dias eu me comprometo a continuar executando minha operação comercial de acordo com o plano que defini acima.",
      itens: ["Eu assumo esse compromisso."],
    },

    {
      tipo: "interesse",
      chave: "socias-de-projeto",
      interesse: "socias-de-projeto",
      opcional: true,
      ask: "E existe um caminho que você talvez nem conhecesse.",
      support:
        "Durante esses 21 dias você conheceu uma profissão. Mas existe um universo comercial muito maior — e tem mulher que, em algum momento, percebe que não quer somente executar uma função comercial: quer construir uma operação. Atender uma empresa, depois duas, enxergar problemas comerciais, aprender a estruturar, trazer pessoas, atender projetos. Dentro da MultiMeta esse caminho se chama Sócias de Projeto.",
      pergunta: "Isso despertou alguma coisa em você?",
      opcoes: [
        "Sim, quero conhecer o caminho",
        "Talvez mais pra frente",
        "Agora quero focar na atuação que comecei",
      ],
      // A ressalva é exigência do documento: não matar o produto que ela
      // acabou de concluir.
      nota: "E presta atenção: você NÃO precisa disso para continuar sua carreira. Você pode construir uma excelente atuação como SDR ou Closer. Isso é para quem olhou para tudo e percebeu que tem ambição de construir algo maior em termos de operação e negócio. Se despertou, conheça — depois você decide se esse é o momento.",
      cta: "Quero conhecer as Sócias de Projeto",
    },
  ],

  fim: {
    kicker: "Desafio concluído",
    titulo: "Você não apenas estudou uma carreira. Você entrou em campo.",
    lede: "Cem empresas encontradas, cem abordadas, vinte e um dias de execução. Você falou com mercado real, recebeu silêncio real, resposta real, objeção real. Isso não se aprende assistindo — e agora ninguém pode tirar de você.",
    badge: "Desafio 21 Dias — Empreendedora Anônima",
    placar: { de: "radar", label: "empresas no seu radar" },
    feito: [
      "Fechou cem empresas abordadas",
      "Respondeu as três perguntas do primeiro dia e viu o que mudou",
      "Identificou o seu próximo gargalo",
      "Montou o seu plano de 30 dias",
      "Assumiu o compromisso de continuar",
    ],
    amanha:
      "Amanhã você não começa outro curso. Amanhã você continua a sua operação: veja o que está vencido, execute o que é para hoje, faça follow-up, movimente conversas, gere novas oportunidades conforme sua capacidade, atualize a próxima ação. Agora é você.",
  },
}
