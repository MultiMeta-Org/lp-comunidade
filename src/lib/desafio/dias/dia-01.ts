import type { Dia } from "../tipos"

/**
 * DIA 1 — Entenda a profissão que você acabou de começar.
 *
 * Primeiro dia de conteúdo. Ensina o PROCESSO comercial antes das funções, de
 * propósito: SDR e Closer são papéis dentro de uma operação, e quem aprende os
 * cargos antes do caminho decora nomes sem entender onde eles atuam.
 *
 * A missão não aborda ninguém. Ela escolhe uma empresa que já conhece e olha
 * para ela com olhos de profissional — é o Dia 1 inteiro em uma frase. Dessas
 * seis perguntas, só três viram cadastro no Radar (nome, o que vende, canal);
 * as outras são respostas da aula, e o documento é explícito em não despejar
 * tudo no Radar, que é ferramenta operacional.
 *
 * O interesse no Closer Presencial entra aqui e NÃO é requisito para concluir
 * o dia — nem se repete no Dia 2. Quem levantou a mão já está registrada; quem
 * não levantou não precisa de CTA de novo no dia seguinte.
 */
export const dia01: Dia = {
  dia: 1,
  kicker: "Dia 1",
  titulo: "Hoje você vai olhar uma empresa de um jeito novo.",
  lede: "Escolha uma empresa que você já conhece. Você não vai falar com ninguém hoje. Hoje é só olhar.",
  tempo: "20 minutinhos",
  objetivo:
    "Entender o caminho comercial completo (do interessado ao pós-venda), onde SDR e Closer atuam dentro dele, e fazer a aluna olhar pela primeira vez uma empresa real com olhos profissionais.",

  guarde: [
    {
      titulo: "Fato ≠ hipótese ≠ diagnóstico",
      texto: "Observe primeiro. Pergunte antes de concluir.",
    },
    {
      titulo: "Venda não é manipulação",
      texto: "Venda é entender, servir e conduzir uma decisão com clareza.",
    },
    {
      titulo: "Você não precisa chegar pronta",
      texto:
        "Venda é um conjunto de habilidades. E habilidades são desenvolvidas com prática.",
    },
  ],

  passos: [
    {
      tipo: "video",
      chave: "video-dia-1",
      label: "Dia 1 — Entenda a profissão que você acabou de começar",
      ask: "Assista ao vídeo de hoje.",
      support:
        "Ele explica o que acontece antes, durante e depois de uma venda. Depois eu te mostro sua missão.",
      cta: "Já assisti",
    },

    {
      tipo: "leitura",
      chave: "caminho-comercial",
      ask: "O caminho comercial",
      support: "É esse o processo por dentro de qualquer empresa que vende.",
      corpo: [
        "**Interessado / lead** — alguém demonstrou interesse.",
        "**Pré-venda** — encontrar, conversar, qualificar, acompanhar.",
        "**Oportunidade** — agora existe uma chance real de negócio.",
        "**Venda** — entender, conduzir, apresentar, negociar, fechar.",
        "**Cliente** — a pessoa comprou.",
        "**Pós-venda** — onboarding, experiência, relacionamento.",
      ],
      destaque: "Venda não começa no fechamento.",
      cta: "Entendi",
    },

    {
      tipo: "leitura",
      chave: "sdr-closer",
      ask: "Onde entram SDR e Closer?",
      support: "As duas trabalham dentro desse mesmo caminho, em pontos diferentes dele.",
      corpo: [
        "**SDR** — atua principalmente na construção e no desenvolvimento das oportunidades. Encontra, inicia, conversa, pergunta, qualifica, acompanha, organiza, agenda.",
        "**Closer** — atua principalmente na condução da oportunidade até uma decisão. Entende, pergunta, escuta, conduz, apresenta, trabalha objeções, negocia, fecha.",
      ],
      nota: "Dependendo da empresa, uma mesma profissional pode exercer as duas funções.",
      cta: "Entendi",
    },

    // ── Missão: a primeira empresa ──
    {
      tipo: "empresa",
      chave: "primeira-empresa",
      ask: "Escolha uma empresa que você já conhece.",
      support:
        "Pode ser a padaria da esquina, a clínica onde você se trata ou a lojinha que você segue. Hoje você não vai abordá-la nem oferecer nada. O objetivo é começar a enxergá-la como uma profissional comercial.",
      cadastro: {
        origem: "consumo",
        rotuloNome: "Qual empresa você escolheu?",
        rotuloSegmento: "O que essa empresa vende?",
        rotuloCanal: "Como uma pessoa interessada entra em contato?",
        canais: [
          "WhatsApp",
          "Instagram ou Direct",
          "Site ou formulário",
          "Telefone",
          "Presencial",
          "Outro",
        ],
      },
      campos: [
        {
          tipo: "radio",
          chave: "foi_cliente",
          rotulo: "Você já comprou ou teve alguma experiência como cliente dessa empresa?",
          opcoes: ["Sim", "Não"],
          inline: true,
        },
        {
          tipo: "texto",
          chave: "experiencia_cliente",
          rotulo: "Como foi sua experiência?",
          mostrarSe: { chave: "foi_cliente", valor: "Sim" },
        },
        {
          tipo: "checks",
          chave: "atividades_percebidas",
          rotulo:
            "Olhando para o processo que aprendeu hoje, quais atividades comerciais você consegue perceber nessa empresa?",
          ajuda: "Pode marcar mais de uma.",
          opcoes: [
            "Entrada de interessados",
            "Atendimento e conversa",
            "Follow-up",
            "Agendamento",
            "Reunião ou avaliação",
            "Fechamento",
            "Pós-venda",
            "Ainda não consigo identificar",
          ],
        },
        {
          tipo: "texto",
          chave: "chamou_atencao",
          rotulo: "O que mais chamou sua atenção nessa carreira até agora?",
          obrigatorio: false,
        },
      ],
      cta: "Salvar minha primeira empresa",
    },

    // ── Interesse (não trava o dia) ──
    {
      tipo: "interesse",
      chave: "closer-presencial",
      interesse: "closer-presencial",
      opcional: true,
      ask: "Closer de eventos presenciais",
      support:
        "Você ouviu na aula que existe também a possibilidade de atuar como Closer em eventos presenciais. Duas vezes por ano abrimos um projeto presencial específico para alunas que querem se preparar para esse tipo de atuação. O treinamento acontece em Brasília, mas você pode entrar na lista de interessadas independentemente da cidade onde mora.",
      // A pergunta vem DEPOIS do clique, de propósito: assim sabemos não só
      // quantas acharam interessante, mas quantas considerariam viajar.
      pergunta:
        "Você teria disponibilidade para viajar para Brasília para participar de uma edição presencial?",
      opcoes: ["Sim", "Talvez, dependendo da data", "Neste momento, não"],
      nota: "Quando uma nova edição for aberta, as alunas da lista recebem as informações sobre datas, funcionamento e participação.",
      cta: "Quero entrar na lista",
    },
  ],

  fim: {
    kicker: "Dia 1 concluído",
    titulo: "Pronto. Sua primeira empresa está no radar.",
    lede: "Até ontem você olhava para as empresas como cliente. Hoje você começou a olhar como profissional. Era só isso que eu queria de você hoje.",
    badge: "Dia 1 de 21 concluído",
    // Sem "1/100" aqui: a meta do Radar só é apresentada no Dia 3, e mostrar o
    // denominador antes disso transforma uma conquista em dívida.
    feito: [
      "Entendeu o caminho básico de uma venda",
      "Conheceu o papel da SDR",
      "Conheceu o papel da Closer",
      "Entendeu que venda não começa no fechamento",
      "Começou a enxergar uma empresa comercialmente",
      "Colocou sua primeira empresa no Radar",
    ],
    amanha:
      "Amanhã você vai entender como esse trabalho acontece na prática e qual é o seu papel quando entra em uma empresa.",
  },
}
