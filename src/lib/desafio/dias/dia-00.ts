import type { Dia } from "../tipos"

/**
 * DIA ZERO — Bem-vinda, Empreendedora Anônima.
 *
 * A matrícula. O documento é explícito sobre o que ela faz: personalizar a
 * experiência da aluna E gerar inteligência para a MultiMeta. Daí a forma das
 * perguntas — estruturadas onde o painel precisa contar ("quantas são mães?",
 * "qual a maior dor?") e abertas só onde a história importa mais que o número.
 * Resposta aberta que ninguém consegue analisar depois é dado perdido com
 * trabalho da aluna embutido.
 *
 * O que NÃO se pergunta aqui, também por decisão do documento: perfil
 * profissional, SDR ou Closer, nicho, quanto pretende cobrar. Ela ainda não
 * sabe o suficiente para responder, e perguntar cedo ensina a chutar.
 *
 * As três notas de 0 a 10 do último formulário voltam idênticas no Dia 21 —
 * é o antes/depois do dashboard de transformação. Mexer no texto delas aqui
 * sem mexer lá quebra a comparação.
 */
export const dia00: Dia = {
  dia: 0,
  kicker: "Comece por aqui",
  titulo: "Que bom que você chegou.",
  lede: "Hoje você não precisa saber de nada ainda. É só assistir os vídeos e preencher sua matrícula. Eu vou com você no resto.",
  tempo: "20 minutinhos",
  objetivo:
    "Acolher, explicar a jornada dos 21 dias e a Missão Primeiro Sim, apresentar o portal e colher a matrícula — inclusive o ponto de partida (baseline) que vai ser comparado no Dia 21.",

  passos: [
    {
      tipo: "video",
      chave: "video-boas-vindas",
      label: "Bem-vinda à Empreendedora Anônima",
      ask: "Assista ao vídeo de boas-vindas.",
      support:
        "Assista antes de preencher sua matrícula. Aqui você vai entender como funcionam os próximos 21 dias e como usar sua formação.",
      nota: "Não precisa anotar nada agora. Depois do vídeo eu te digo exatamente o que fazer.",
      cta: "Já assisti",
    },
    {
      tipo: "video",
      chave: "video-tour",
      label: "Conheça seu Portal — tour rápido",
      ask: "Agora um tour rápido pelo portal.",
      support:
        "Dois minutinhos para você saber onde fica cada coisa: os 21 dias, a Biblioteca, o Radar, a B.IA, o seu progresso e o botão de quando você fechar seu primeiro contrato.",
      nota: "Todos os dias: assista → execute → registre → avance.",
      cta: "Já assisti",
    },

    // ── 1. Sobre você ──
    {
      tipo: "formulario",
      chave: "sobre-voce",
      ask: "Vamos começar por você.",
      support: "São seis etapas no total. Uma coisa de cada vez, para você não se perder.",
      campos: [
        { tipo: "texto", chave: "nome_completo", rotulo: "Nome completo" },
        {
          tipo: "texto",
          chave: "apelido",
          rotulo: "Como você gosta de ser chamada?",
          placeholder: "Nati",
          ajuda: "É assim que eu vou falar com você todos os dias aqui dentro.",
        },
        { tipo: "numero", chave: "idade", rotulo: "Idade" },
        { tipo: "texto", chave: "cidade", rotulo: "Cidade" },
        { tipo: "texto", chave: "uf", rotulo: "Estado (UF)", placeholder: "SP" },
        {
          tipo: "radio",
          chave: "estado_civil",
          rotulo: "Estado civil",
          opcoes: [
            "Solteira",
            "Casada ou união estável",
            "Divorciada ou separada",
            "Viúva",
            "Prefiro não informar",
          ],
        },
        {
          tipo: "radio",
          chave: "tem_filhos",
          rotulo: "Tem filhos?",
          opcoes: ["Sim", "Não"],
          inline: true,
        },
        {
          tipo: "numero",
          chave: "quantos_filhos",
          rotulo: "Quantos filhos?",
          mostrarSe: { chave: "tem_filhos", valor: "Sim" },
        },
        {
          tipo: "texto",
          chave: "idade_filhos",
          rotulo: "Idade dos filhos",
          placeholder: "7 e 12",
          mostrarSe: { chave: "tem_filhos", valor: "Sim" },
        },
      ],
    },

    // ── 2. Sua vida profissional ──
    {
      tipo: "formulario",
      chave: "vida-profissional",
      ask: "Agora, sua vida profissional.",
      support: "Nada aqui é pré-requisito. É só para eu te conhecer melhor.",
      campos: [
        {
          tipo: "texto",
          chave: "formacao",
          rotulo: "Qual é sua formação?",
          placeholder: "Fisioterapia",
          obrigatorio: false,
        },
        {
          tipo: "radio",
          chave: "momento_profissional",
          rotulo: "Qual descreve melhor seu momento profissional hoje?",
          opcoes: [
            "Trabalho presencialmente",
            "Trabalho de casa ou remotamente",
            "Tenho meu próprio negócio",
            "Faço trabalhos informais ou freelas",
            "Estou fora do mercado de trabalho",
            "Cuido integralmente da casa e dos filhos",
            "Outro",
          ],
        },
        {
          tipo: "texto",
          chave: "areas",
          rotulo: "Em quais áreas você já trabalhou?",
          placeholder: "Clínica, academia, escola infantil",
          obrigatorio: false,
        },
        // Vendas e atendimento separados de propósito: são experiências
        // diferentes, e a diferença vai ser útil no suporte e no conteúdo.
        {
          tipo: "radio",
          chave: "experiencia_vendas",
          rotulo: "Você já trabalhou com vendas?",
          opcoes: [
            "Nunca",
            "Já tive algum contato",
            "Já trabalhei diretamente com vendas",
            "Trabalho atualmente com vendas",
          ],
        },
        {
          tipo: "radio",
          chave: "experiencia_atendimento",
          rotulo: "Você já trabalhou com atendimento ao cliente?",
          opcoes: [
            "Nunca",
            "Já tive algum contato",
            "Já trabalhei diretamente com atendimento",
            "Trabalho atualmente com atendimento",
          ],
        },
      ],
    },

    // ── 3. Seu momento ──
    {
      tipo: "formulario",
      chave: "seu-momento",
      ask: "O que te trouxe até aqui?",
      support: "Não tem resposta certa. Tem a sua.",
      campos: [
        {
          tipo: "checks",
          chave: "motivos",
          rotulo: "Qual é o principal motivo que fez você entrar na Empreendedora Anônima?",
          ajuda: "Escolha até 2.",
          max: 2,
          opcoes: [
            "Quero voltar ao mercado de trabalho",
            "Quero trabalhar de casa",
            "Quero ter minha própria renda",
            "Quero aumentar minha renda atual",
            "Quero ter mais flexibilidade para cuidar da minha família",
            "Quero mudar de carreira",
            "Quero aprender uma profissão digital",
            "Quero construir algo meu profissionalmente",
            "Outro",
          ],
        },
        {
          tipo: "radio",
          chave: "maior_dificuldade",
          rotulo: "Qual é hoje sua MAIOR dificuldade para construir uma nova carreira?",
          ajuda: "Escolha uma.",
          opcoes: [
            "Não sei por onde começar",
            "Falta de experiência",
            "Medo ou insegurança",
            "Não sei vender",
            "Tenho dificuldade para falar com pessoas e empresários",
            "Falta de tempo ou rotina",
            "Não sei onde encontrar oportunidades",
            "Tenho medo de não conseguir clientes",
            "Falta de apoio",
            "Outra",
          ],
        },
        {
          tipo: "area",
          chave: "relato",
          rotulo: "Se quiser, conte um pouco mais sobre seu momento e por que decidiu entrar.",
          ajuda: "Opcional. Eu leio.",
          obrigatorio: false,
        },
      ],
    },

    // ── 4. Objetivo financeiro ──
    {
      tipo: "formulario",
      chave: "objetivo-financeiro",
      ask: "Qual é o seu objetivo com isso?",
      support: "Saber onde você quer chegar me ajuda a te acompanhar melhor.",
      campos: [
        {
          tipo: "radio",
          chave: "objetivo_renda",
          rotulo:
            "Quanto você gostaria que essa nova atuação pudesse acrescentar à sua renda mensal?",
          opcoes: [
            "Até R$ 1.000",
            "R$ 1.001 a R$ 2.000",
            "R$ 2.001 a R$ 3.000",
            "R$ 3.001 a R$ 5.000",
            "R$ 5.001 a R$ 10.000",
            "Mais de R$ 10.000",
            "Ainda não sei",
          ],
        },
      ],
      nota: "Essa pergunta existe apenas para conhecermos seus objetivos e não representa promessa ou garantia de renda.",
    },

    // ── 5. Disponibilidade ──
    {
      tipo: "formulario",
      chave: "disponibilidade",
      ask: "Quanto tempo você consegue reservar?",
      support:
        "Me diz o que cabe na sua vida de verdade, não o que você gostaria que cabesse. É com o real que a gente trabalha.",
      campos: [
        {
          tipo: "radio",
          chave: "tempo_disponivel",
          rotulo: "Quanto tempo você consegue reservar nos dias de execução?",
          opcoes: [
            "Até 30 minutos",
            "30 a 60 minutos",
            "1h a 1h30",
            "1h30 a 2h",
            "Mais de 2h",
            "Varia bastante",
          ],
        },
        {
          tipo: "radio",
          chave: "periodo",
          rotulo: "Qual período tende a funcionar melhor?",
          opcoes: ["Manhã", "Tarde", "Noite", "Varia"],
          inline: true,
        },
      ],
    },

    // ── 6. Baseline ──
    {
      tipo: "formulario",
      chave: "baseline",
      ask: "Onde você está hoje?",
      support:
        "Responda com sinceridade, inclusive se a resposta for zero. Essas mesmas três perguntas voltam no Dia 21, e é aí que você vai ver o tamanho do que mudou.",
      campos: [
        {
          tipo: "escala",
          chave: "baseline_conversa",
          rotulo:
            "Hoje, de 0 a 10, quanto você se sente preparada para conversar profissionalmente com um empresário?",
        },
        {
          tipo: "escala",
          chave: "baseline_contrato",
          rotulo:
            "Hoje, de 0 a 10, quanto você se sente preparada para buscar seu primeiro contrato?",
        },
        {
          tipo: "escala",
          chave: "baseline_fechamento",
          rotulo:
            "Hoje, de 0 a 10, quanto você se sente preparada para conduzir uma oportunidade comercial até o fechamento?",
        },
      ],
    },

    // ── Compromisso ──
    {
      tipo: "confirma",
      chave: "compromisso",
      ask: "Meu compromisso",
      support:
        "Durante os próximos 21 dias, eu me comprometo a não apenas consumir conteúdo. Vou executar as missões, registrar minhas ações e construir essa nova carreira com verdade, responsabilidade e consistência.",
      itens: ["Eu assumo esse compromisso."],
      cta: "Concluir minha matrícula",
    },
  ],

  fim: {
    kicker: "Matrícula concluída",
    titulo: "Agora sua jornada começa.",
    lede: "Guardei tudo que você me contou. Daqui a 21 dias a gente volta em algumas dessas respostas para você ver o tanto que mudou.",
    badge: "Dia 0 de 21 concluído",
    feito: [
      "Preencheu sua matrícula",
      "Definiu sua disponibilidade",
      "Assumiu seu compromisso",
    ],
    amanha:
      "Amanhã começa a sua Missão Primeiro Sim. No Dia 1 a gente entende juntas a carreira que você acabou de começar.",
  },
}
