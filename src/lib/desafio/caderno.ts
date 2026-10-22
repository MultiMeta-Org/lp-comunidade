/**
 * O Caderno de Campo — a apostila do Desafio em PDF, na Biblioteca.
 *
 * O arquivo mora no bucket PRIVADO `pdfs` e só sai por /desafio/caderno, que
 * confere a posse do Desafio e devolve uma signed URL. É o mesmo corte do
 * material das aulas: no servidor, e não por link escondido.
 *
 * As páginas são as do PDF (a 1ª é a capa), não os números impressos no rodapé
 * — é o que `#page=N` entende. A BIA usa os mesmos números para mandar a aluna
 * à página exata (multimeta-bia/conteudo/desafio/caderno-*.md): se o PDF mudar
 * de diagramação, as duas pontas precisam mudar juntas.
 */
export const CADERNO = {
  bucket: "pdfs",
  path: "desafio/caderno-de-campo.pdf",
  totalPaginas: 65,
} as const

/** Rota que abre o Caderno, opcionalmente numa página. */
export function linkDoCaderno(pagina?: number): string {
  return pagina ? `/desafio/caderno?pagina=${pagina}` : "/desafio/caderno"
}

export type CapituloDoCaderno = { dia: number; titulo: string; pagina: number }

/** Índice do Caderno: onde começa cada dia (o estudo; a prática vem na seguinte). */
export const INDICE_DO_CADERNO: readonly CapituloDoCaderno[] = [
  { dia: 0, titulo: "Seu ponto de partida", pagina: 4 },
  { dia: 1, titulo: "Onde eu entro em uma empresa?", pagina: 7 },
  { dia: 2, titulo: "Como uma venda acontece?", pagina: 9 },
  { dia: 3, titulo: "Onde estão suas primeiras oportunidades?", pagina: 11 },
  { dia: 4, titulo: "Quais empresas merecem prioridade?", pagina: 14 },
  { dia: 5, titulo: "Com quem eu preciso falar?", pagina: 16 },
  { dia: 6, titulo: "Sua primeira abordagem", pagina: 18 },
  { dia: 7, titulo: "Como conduzir uma conversa comercial", pagina: 21 },
  { dia: 8, titulo: "Como reconhecer uma oportunidade", pagina: 24 },
  { dia: 9, titulo: "Perguntas que ajudam a vender", pagina: 26 },
  { dia: 10, titulo: "Follow-up com respeito", pagina: 28 },
  { dia: 11, titulo: "Seu pipeline comercial", pagina: 31 },
  { dia: 12, titulo: "Preparação para uma reunião", pagina: 33 },
  { dia: 13, titulo: "Condução da reunião", pagina: 35 },
  { dia: 14, titulo: "Como apresentar sua atuação", pagina: 38 },
  { dia: 15, titulo: "Como lidar com objeções", pagina: 41 },
  { dia: 16, titulo: "Como construir uma proposta profissional", pagina: 43 },
  { dia: 17, titulo: "Negociação e fechamento", pagina: 46 },
  { dia: 18, titulo: "Seus números contam uma história", pagina: 48 },
  { dia: 19, titulo: "Como é a rotina dentro da empresa", pagina: 50 },
  { dia: 20, titulo: "Fechei meu contrato: como começar", pagina: 53 },
  { dia: 21, titulo: "Sua carreira continua depois do desafio", pagina: 55 },
]

/** O material de apoio do fim do Caderno. */
export const APOIO_DO_CADERNO: readonly { titulo: string; pagina: number }[] = [
  { titulo: "Modelos de mensagens", pagina: 59 },
  { titulo: "Meu Radar e checklist de reunião", pagina: 60 },
  { titulo: "Central do Primeiro Contrato", pagina: 61 },
  { titulo: "Plano de 30 dias e minha evolução", pagina: 62 },
  { titulo: "Glossário", pagina: 64 },
]
