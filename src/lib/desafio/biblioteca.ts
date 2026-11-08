/**
 * Os vídeos e modelos da Biblioteca, fora do Caderno de Campo.
 *
 * Moram no Drive da Nati, compartilhados como "qualquer pessoa com o link" —
 * abrem no player do Drive, em outra aba. Ficam liberados de uma vez, como o
 * Caderno: são para aprofundar, não a missão do dia. Os que pertencem a um dia
 * levam o `dia`, que a página usa para marcar o de hoje.
 *
 * Falta o modelo de apresentação do Dia 14 (a Nati ainda vai achar o arquivo).
 */
export type MaterialDaBiblioteca = {
  titulo: string
  tipo: "video" | "modelo"
  url: string
  dia?: number
}

export type GrupoDaBiblioteca = {
  titulo: string
  descricao: string
  materiais: readonly MaterialDaBiblioteca[]
}

const drive = (id: string) => `https://drive.google.com/file/d/${id}/view`

export const MATERIAIS_DA_BIBLIOTECA: readonly GrupoDaBiblioteca[] = [
  {
    titulo: "SDR",
    descricao: "Prospecção: quem abre a conversa e marca a reunião",
    materiais: [
      { titulo: "Vídeo SDR", tipo: "video", dia: 10, url: drive("1OIioa5QKa8o4wqzqj0jcklRLxHygZ5hN") },
      { titulo: "SDR 2.0", tipo: "video", url: drive("1H-iC6c47DND2sajIi1Af-jp3T4gJMklk") },
      { titulo: "As métricas do SDR", tipo: "video", url: drive("1veR-hQiormt1rCLPDyKyyuiKpZXDp2KS") },
      { titulo: "Mentalidade do SDR", tipo: "video", url: drive("1dW3ewulj_IZX15szyfBdYRhwNTil4bnL") },
      { titulo: "Follow-up do SDR", tipo: "video", url: drive("1_EeuMESPo_cYhtYAad1H8XJFztL1zUkq") },
    ],
  },
  {
    titulo: "Closer",
    descricao: "Fechamento: quem conduz a reunião e fecha o contrato",
    materiais: [
      { titulo: "Fechamento high ticket", tipo: "video", dia: 13, url: drive("1aJTN98NJBkdqQgY4ZoZIZI5OVF_5LIgK") },
      { titulo: "Objeções e follow-up", tipo: "video", dia: 15, url: drive("1PQ4Xzsgl5ArQ2xmwteH8bosX3_2_dV3p") },
      { titulo: "Modelo de contrato de closer", tipo: "modelo", dia: 16, url: drive("1WTrGCoOqpIgcvP7Uq1f0Xu-MZwi-nR5f") },
      { titulo: "O Closer", tipo: "video", url: drive("189wzvS0hviea_BH1B7nWZLsrsXjvuCHK") },
      { titulo: "O papel do closer", tipo: "video", url: drive("1ykMY8cT2mT-a7DWUHZjuwbVR2YLvcfiP") },
      { titulo: "Closer: volume ou qualidade?", tipo: "video", url: drive("1TWbn-Cad8w_Xv88c1aK-qTqd0ja7BMHL") },
    ],
  },
  {
    titulo: "CRM",
    descricao: "Organização: onde cada oportunidade fica registrada",
    materiais: [{ titulo: "Vídeo CRM", tipo: "video", url: drive("1iIRpAyjq65v9qEzJxrzrDyjc3jyK3n3B") }],
  },
]
