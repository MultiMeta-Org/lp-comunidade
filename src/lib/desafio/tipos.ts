/**
 * O formato do conteúdo do Desafio 21 Dias.
 *
 * Os 22 dias moram em código (src/lib/desafio/dias/dia-NN.ts) e não no banco.
 * A razão: quase todo dia tem um passo com interface própria — o Radar com
 * meta, a caixa que copia o script de indicação, a escala de 0 a 10, a empresa
 * escolhida lá no Dia 1 voltando no Dia 4. Um editor genérico que desse conta
 * disso seria uma pilha de exceções; em troca, o texto da Nati passa por
 * review no git e sobe junto com o código que sabe desenhá-lo.
 *
 * O banco guarda só o que é da aluna (comunidade.desafio_progresso) — onde ela
 * parou e o que respondeu, indexado pelas `chave`s declaradas aqui.
 *
 * REGRA QUE ATRAVESSA TODO O ARQUIVO, e que vem do documento:
 *   «A missão cobra aquilo que está sob o controle da aluna.»
 * Ela controla enviar três pedidos de indicação; não controla receber resposta.
 * Por isso existe o passo `confirma` — declaração do que ela fez — em vez de
 * exigir prova de um resultado que não é dela.
 */

// ─────────────────────────────────────────────────────────────
// Campos de formulário
// ─────────────────────────────────────────────────────────────

/** O que toda pergunta tem, qualquer que seja o tipo dela. */
type CampoBase = {
  /** Chave da resposta em `desafio_progresso.respostas`. Não mudar depois de a
   *  primeira aluna responder: é o que liga o dado à pergunta — e as views do
   *  dashboard interno leem por esta chave. */
  chave: string
  /** Rótulo acima do campo. Ausente quando a pergunta já é o `ask` do passo. */
  rotulo?: string
  ajuda?: string
  /** Padrão: obrigatório. `false` libera o passo sem resposta. */
  obrigatorio?: boolean
  /**
   * Só aparece quando outro campo do MESMO passo tem este valor — é o "se sim:
   * quantos filhos?" do formulário de matrícula. Escondido conta como
   * respondido: senão a aluna sem filhos ficaria presa num campo que ela não vê.
   */
  mostrarSe?: { chave: string; valor: string }
}

/** Uma pergunta dentro de um passo `formulario`. */
export type Campo =
  // Separados, e não `tipo: "texto" | "area" | "numero"` num membro só, para o
  // TypeScript conseguir estreitar cada um deles na hora de desenhar o campo.
  | (CampoBase & { tipo: "texto"; placeholder?: string })
  | (CampoBase & { tipo: "area"; placeholder?: string })
  | (CampoBase & { tipo: "numero"; placeholder?: string })
  | (CampoBase & {
      tipo: "radio"
      opcoes: readonly string[]
      /** Opções curtas em linha, em vez de uma por linha. */
      inline?: boolean
    })
  | (CampoBase & {
      tipo: "checks"
      opcoes: readonly string[]
      /** Teto de escolhas ("escolha até 2"). */
      max?: number
    })
  | (CampoBase & { tipo: "escala"; rotulo: string; min?: number; max?: number })

// ─────────────────────────────────────────────────────────────
// Passos
// ─────────────────────────────────────────────────────────────

/** O que todo passo tem: a pergunta grande, o apoio da Nati, o botão. */
type Base = {
  chave: string
  /** A frase grande do passo. É a Nati falando com ela, não um label. */
  ask: string
  /** Linha de apoio embaixo. Tira o peso da pergunta. */
  support?: string
  /** Nota em caixa, ao pé do passo. Ressalva, aviso legal, "guarde sem peso". */
  nota?: string
  /** Texto do botão. Padrão: "Continuar"; no último passo, "Concluir". */
  cta?: string
}

export type Passo =
  /** Assistir. `videoUrl` ausente = o vídeo ainda não foi gravado (ver
   *  `diaPublicado`), e o passo mostra a cartela com o rótulo. */
  | (Base & { tipo: "video"; label: string; videoUrl?: string })
  /** Uma ou mais perguntas numa tela. */
  | (Base & { tipo: "formulario"; campos: readonly Campo[] })
  /** Só ler: resumo do dia, princípio, "guarde isso". Nada a responder. */
  | (Base & { tipo: "leitura"; corpo: readonly string[]; destaque?: string })
  /** Ela declara o que fez. Avança quando tudo está marcado. */
  | (Base & { tipo: "confirma"; itens: readonly string[] })
  /** Script falado no vídeo = script disponível para copiar (regra do Dia 3). */
  | (Base & {
      tipo: "copiar"
      mensagens: readonly { titulo?: string; texto: string }[]
      /** A confirmação de envio. É o que ela controla. */
      confirmacao: string
    })
  /** O Radar. `meta` é quantas empresas o dia pede no total (não a mais). */
  | (Base & { tipo: "radar"; meta: number; origemSugerida?: OrigemRadar })
  /**
   * Uma empresa do Radar e perguntas sobre ela. As respostas vão para
   * `desafio_radar.notas`, e NÃO para as colunas do Radar: "acho que essa
   * empresa poderia fazer follow-up" é hipótese de exercício, não fato sobre a
   * empresa. O Radar principal fica simples — é ferramenta operacional.
   */
  | (Base & {
      tipo: "empresa"
      /**
       * Presente = o passo CADASTRA a empresa em vez de escolher uma já
       * cadastrada. É o Dia 1, em que o Radar ainda está vazio. Estes são os
       * únicos campos que entram nas colunas do Radar.
       */
      cadastro?: {
        origem: OrigemRadar
        rotuloNome: string
        rotuloSegmento: string
        /** Canal por onde o cliente chega. Vira `contato` no Radar. */
        rotuloCanal?: string
        canais?: readonly string[]
      }
      campos: readonly Campo[]
      /**
       * Quantas empresas este passo percorre, uma de cada vez. Padrão 1.
       *
       * O Dia 4 pede três Raio-X e o Dia 6 pede cinco escolhas — e são sempre
       * as MESMAS perguntas para empresas diferentes. Como passos repetidos no
       * conteúdo, as respostas de uma empresa apareceriam pré-preenchidas na
       * seguinte, porque o estado do dia é um só. Aqui cada rodada grava em
       * `desafio_radar.notas` da empresa dela e começa limpa.
       *
       * `"livre"` = quantas ela tiver, zero inclusive. É o passo que trabalha
       * as RESPOSTAS recebidas (Dia 8 em diante): quantas chegaram não depende
       * dela, e travar o dia em "trabalhe 3 respostas" puniria a aluna por um
       * silêncio que não é culpa dela. A missão cobra o que está sob o controle
       * dela — mandar —, não o que não está — receber.
       */
      quantidade?: number | "livre"
      /**
       * Pede o próximo passo desta empresa, gravado em
       * `desafio_radar.proxima_acao` (+ a data).
       *
       * É o que sustenta o follow-up do Dia 9 e o checklist que o Dia 8
       * introduz: "todas as conversas de hoje possuem um próximo passo". Em
       * texto livre porque o que ela combinou — "chamar sexta", "falar com o
       * sócio" — não cabe numa lista de opções.
       */
      proximaAcao?: { rotulo: string; placeholder?: string }
      /**
       * Para onde o status da empresa vai quando a rodada é salva.
       *
       * Declarado no conteúdo, e não escolhido pela aluna, porque o estágio é
       * consequência do que o dia pediu: terminar a rodada do Dia 7 É ter
       * mandado a abordagem. Pedir para ela marcar isso num seletor depois
       * seria burocracia sobre um fato que o sistema já sabe.
       */
      defineStatus?: StatusRadar
    })
  /**
   * O funil dela, com os números de verdade. Nada a responder.
   *
   * Números ABSOLUTOS, sem percentual: o documento é explícito em não mostrar
   * taxa ainda, para não criar ansiedade nem falso benchmark numa aluna que
   * está no Dia 14 da vida profissional dela.
   */
  | (Base & { tipo: "funil" })
  /**
   * "Onde estou travando?" — ela escolhe, e o passo aponta o dia que trata
   * daquilo.
   *
   * É o que faz o Desafio parecer personalizado sem sistema complexo atrás:
   * a resposta dela vira um link para um dia que ela já pode reabrir.
   */
  | (Base & {
      tipo: "diagnostico"
      opcoes: readonly { rotulo: string; dia: number; porque: string }[]
    })
  /** Levantar a mão para algo (hoje: Closer Presencial). Grava em
   *  comunidade.desafio_interesses, no perfil único da aluna. */
  | (Base & {
      tipo: "interesse"
      interesse: string
      pergunta: string
      opcoes: readonly string[]
      /** Passo que a aluna pode pular sem travar o dia. Interesse não é missão. */
      opcional: true
    })

/**
 * Estágio comercial da empresa no Radar.
 *
 * Cresce junto com a aluna: até o Dia 6 toda empresa é "no-radar", porque ela
 * ainda não falou com ninguém. Ausência de resposta NÃO é "sem-interesse" —
 * fica em "abordagem-enviada" até o follow-up do Dia 9.
 */
export type StatusRadar =
  | "no-radar"
  | "abordagem-enviada"
  | "respondeu"
  | "conversando"
  | "reuniao"
  | "reuniao-realizada"
  | "proposta"
  | "fechado"
  | "sem-interesse"

/** Como cada estágio aparece para a aluna. */
export const STATUS_RADAR: Record<StatusRadar, string> = {
  "no-radar": "No radar",
  "abordagem-enviada": "Abordagem enviada",
  respondeu: "Respondeu",
  conversando: "Conversando",
  reuniao: "Reunião marcada",
  "reuniao-realizada": "Reunião realizada",
  proposta: "Proposta",
  fechado: "Fechado",
  "sem-interesse": "Sem interesse",
}

/** De onde a empresa veio. As quatro primeiras são as "4 fontes" do Dia 3. */
export type OrigemRadar =
  | "formacao"
  | "experiencia"
  | "rede"
  | "consumo"
  | "indicacao"
  | "busca"

// ─────────────────────────────────────────────────────────────
// O dia
// ─────────────────────────────────────────────────────────────

/** A tela de conquista, depois do último passo. */
export type Fim = {
  kicker: string
  titulo: string
  lede: string
  /** Selo do dia ("Dia 3 de 21 concluído"). */
  badge: string
  /** Número grande da conquista. `de: "radar"` lê o Radar de verdade em vez de
   *  cravar um número — ela pode ter cadastrado 14 empresas, não 10. */
  placar?: { de: "radar"; label: string } | { de: "numero"; n: number; label: string }
  /** "HOJE VOCÊ:" — o que ela fez, em frases curtas. */
  feito: readonly string[]
  /** O gancho de amanhã. Fecha o dia e abre o seguinte. */
  amanha: string
}

export type Dia = {
  /** 0 a 21. O Dia Zero é a matrícula. */
  dia: number
  /** Etiqueta pequena ("Dia 3", "Comece por aqui"). */
  kicker: string
  titulo: string
  lede: string
  /** Quanto tempo leva, do jeito que a Nati diria ("30 minutinhos"). */
  tempo: string
  /** O objetivo do dia, como está no documento. Não vai para a tela da aluna:
   *  é para quem mexe no conteúdo entender o que o dia precisa entregar. */
  objetivo: string
  /** "O QUE VOCÊ PRECISA GUARDAR DE HOJE" — fica no dia depois de concluído,
   *  como resumo consultável. */
  guarde?: readonly { titulo: string; texto: string }[]
  passos: readonly Passo[]
  fim: Fim
}

/**
 * Um dia sem nenhum passo ainda não é navegável: a jornada mostra ele como
 * "em breve" em vez de abrir uma missão vazia. É o estado de um dia cujo
 * conteúdo está escrito mas cuja gravação não existe.
 */
export function diaPublicado(dia: Dia): boolean {
  return dia.passos.length > 0
}

/** O que a aluna respondeu num dia: chave do campo → valor. */
export type Respostas = Record<string, string | string[] | boolean | number>
