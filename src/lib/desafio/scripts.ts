import { getDia, semanaAberta, type Liberacao } from "./index"

/**
 * A Central de Scripts: todos os scripts do Desafio num lugar só, separados
 * pelo momento da venda.
 *
 * Pedido da Nati: os scripts ficavam presos no passo do dia em que apareceram,
 * e "ninguém volta no Dia 7 para achar a mensagem de indicação". O texto
 * continua morando nos dias (src/lib/desafio/dias) — aqui só se diz em que
 * gaveta cada passo `copiar` entra, pela chave `dia:chave`. Mudar um script
 * no dia muda aqui também; um passo `copiar` novo que não estiver na lista cai
 * em "Outros", em vez de sumir.
 */
const GAVETAS: readonly { titulo: string; descricao: string; passos: readonly string[] }[] = [
  {
    titulo: "Sua apresentação",
    descricao: "Para quando perguntarem o que você faz.",
    passos: ["5:minha-apresentacao-base", "5:central-de-scripts", "19:modelos-apresentacao-curta"],
  },
  {
    titulo: "Pedir indicação",
    descricao: "Para amigas, conhecidas e clientes que podem abrir uma porta.",
    passos: ["3:tres-indicacoes", "13:indicacoes-rodada-2", "14:indicacoes-rodada-3"],
  },
  {
    titulo: "Primeira abordagem",
    descricao: "A primeira mensagem para a empresa, por porta de entrada — e o que responder.",
    passos: ["7:scripts-indicacao", "7:scripts-conheco", "7:scripts-fria", "7:respostas-rapidas"],
  },
  {
    titulo: "Durante a conversa",
    descricao: "Perguntas para entender a empresa e fazer a conversa avançar.",
    passos: ["8:banco-de-perguntas", "8:scripts-avancar"],
  },
  {
    titulo: "Follow-up",
    descricao: "Para retomar quem não respondeu ou esfriou.",
    passos: ["9:central-follow-up", "16:scripts-retomada", "18:scripts-dia-18"],
  },
  {
    titulo: "Antes da reunião",
    descricao: "Convidar, marcar, confirmar e remarcar.",
    passos: ["10:scripts-convite", "10:scripts-agenda"],
  },
  {
    titulo: "Na reunião",
    descricao: "O roteiro da reunião online, etapa por etapa.",
    passos: [
      "11:roteiro-abertura",
      "11:roteiro-negocio",
      "11:roteiro-comercial",
      "11:roteiro-necessidade",
      "11:roteiro-conexao",
    ],
  },
  {
    titulo: "Depois da reunião",
    descricao: "O modelo da proposta e como enviar e sustentar.",
    passos: ["12:modelo-proposta", "12:scripts-proposta"],
  },
  {
    titulo: "Objeções",
    descricao: "Preço, tempo e as que são sobre você.",
    passos: ["13:objecoes-preco", "13:objecoes-voce"],
  },
  {
    titulo: "Para quando já tiver clientes",
    descricao: "Experiência, depoimento e indicação de quem já trabalhou com você.",
    passos: ["19:scripts-dia-19"],
  },
]

export type Script = { titulo?: string; texto: string; dia: number }
export type Gaveta = { titulo: string; descricao: string; scripts: Script[] }

/**
 * As gavetas com os scripts que ela já pode ver: só dos dias de semanas
 * abertas, como o resto do Desafio — quem está na primeira semana não leva o
 * material da terceira antes da garantia acabar.
 */
export function centralDeScripts(liberacao: Liberacao): Gaveta[] {
  const usados = new Set<string>()
  const ler = (ref: string): Script[] => {
    const [n, chave] = ref.split(":")
    const dia = getDia(Number(n))
    if (!dia || !semanaAberta(dia.dia, liberacao)) return []
    const passo = dia.passos.find((p) => p.chave === chave)
    if (!passo || passo.tipo !== "copiar") return []
    usados.add(ref)
    return passo.mensagens.map((m) => ({ ...m, dia: dia.dia }))
  }

  const gavetas: Gaveta[] = GAVETAS.map((g) => ({
    titulo: g.titulo,
    descricao: g.descricao,
    scripts: g.passos.flatMap(ler),
  }))

  // O que nenhum mapeamento pegou.
  const outros: Script[] = []
  for (let n = 0; n <= 21; n++) {
    const dia = getDia(n)
    if (!dia || !semanaAberta(n, liberacao)) continue
    for (const p of dia.passos) {
      if (p.tipo === "copiar" && !usados.has(`${n}:${p.chave}`)) {
        outros.push(...p.mensagens.map((m) => ({ ...m, dia: n })))
      }
    }
  }
  if (outros.length) gavetas.push({ titulo: "Outros", descricao: "", scripts: outros })

  return gavetas.filter((g) => g.scripts.length > 0)
}
