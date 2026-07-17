// Módulo client-safe: constantes, tipos e seed. SEM dependências de servidor.
// Os fetchers (getLessons/getLesson) ficam em lessons-server.ts.

export const CATEGORIES = {
  objecao: "Objeção",
  conversao: "Conversão",
  analise: "Análise",
  mindset: "Mindset",
  fechamento: "Fechamento",
} as const

export type CategoryKey = keyof typeof CATEGORIES

export type Lesson = {
  id: string
  dia: number
  date: string
  isoDate: string
  weekday: string
  topic: string
  category: string
  description: string
  pdfUrl: string
  audioUrl: string
}

const MONTHS = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
]

/** "2026-07-14" → "14 Jul" (formato de exibição usado nos cards). */
export function displayDate(iso: string): string {
  const [, m, d] = iso.split("-")
  return `${Number(d)} ${MONTHS[Number(m) - 1] ?? ""}`
}

const WEEKDAYS = [
  "Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado",
]

/** "2026-07-14" → "Segunda". Derivado da data (sem depender de input manual). */
export function weekdayFromIso(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return ""
  return WEEKDAYS[new Date(y, m - 1, d).getDay()] ?? ""
}

/**
 * Rótulo de exibição da categoria. Usa o mapa CATEGORIES para as conhecidas
 * e cai para title-case em categorias novas (criadas pelo admin).
 */
export function categoryLabel(cat: string): string {
  if (cat in CATEGORIES) return CATEGORIES[cat as CategoryKey]
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

// ─────────────────────────────────────────────────────────────
// SEED_LESSONS — conteúdo inicial (também em supabase/seed.sql).
// Serve de fallback quando o Supabase ainda não está configurado.
// ─────────────────────────────────────────────────────────────
export const SEED_LESSONS: Lesson[] = [
  {
    id: "dia-12",
    dia: 12,
    isoDate: "2026-07-14",
    date: "14 Jul",
    weekday: "Segunda",
    topic: "Como reverter a objeção 'tá caro' sem parecer desesperada",
    category: "Objeção",
    description: "Três scripts testados para transformar resistência de preço em urgência de compra.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-11",
    dia: 11,
    isoDate: "2026-07-11",
    date: "11 Jul",
    weekday: "Quinta",
    topic: "Análise real: do 'não tenho dinheiro' ao fechamento",
    category: "Análise",
    description: "Estudo de caso com transcrição e anotações do que virou o jogo em cada etapa.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-10",
    dia: 10,
    isoDate: "2026-07-10",
    date: "10 Jul",
    weekday: "Quarta",
    topic: "Gatilhos de fechamento: quando e como usar sem pressionar",
    category: "Fechamento",
    description: "A diferença entre urgência real e urgência fabricada — e por que as clientes percebem.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-9",
    dia: 9,
    isoDate: "2026-07-09",
    date: "9 Jul",
    weekday: "Terça",
    topic: "Mindset da closer: como não deixar semana difícil virar resultado ruim",
    category: "Mindset",
    description: "Ritual de reset mental para semanas de baixa conversão.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-8",
    dia: 8,
    isoDate: "2026-07-08",
    date: "8 Jul",
    weekday: "Segunda",
    topic: "Taxa de conversão: o que seus números estão te dizendo",
    category: "Conversão",
    description: "Como calcular e interpretar sua taxa para tomar decisões mais precisas.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-7",
    dia: 7,
    isoDate: "2026-07-04",
    date: "4 Jul",
    weekday: "Quinta",
    topic: "Onde a conexão quebrou: análise de atendimento",
    category: "Análise",
    description: "Como identificar o momento exato em que a cliente se fechou — e o que fazer diferente.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-6",
    dia: 6,
    isoDate: "2026-07-03",
    date: "3 Jul",
    weekday: "Quarta",
    topic: "'Preciso pensar' — o que realmente está por trás disso",
    category: "Objeção",
    description: "As 3 razões reais por trás da resposta mais comum na sua call.",
    pdfUrl: "#",
    audioUrl: "#",
  },
  {
    id: "dia-5",
    dia: 5,
    isoDate: "2026-07-02",
    date: "2 Jul",
    weekday: "Terça",
    topic: "A pergunta que antecipa a conversão antes da oferta",
    category: "Conversão",
    description: "Uma pergunta simples que muda o estado emocional da cliente no momento certo.",
    pdfUrl: "#",
    audioUrl: "#",
  },
]
