import Link from "next/link"
import { ChevronRight, Clock, FileText, Play } from "lucide-react"
import { linkDoMaterial } from "@/lib/desafio/biblioteca"
import type { MaterialAssinado } from "@/lib/desafio/biblioteca-server"

const doisDigitos = (n: number) => String(n).padStart(2, "0")

/**
 * O quadro 16:9 de um material: a capa do vídeo, ou o ícone do modelo. É o
 * mesmo no card da vitrine e na miniatura da faixa do dia.
 */
function Quadro({ m, compacto = false }: { m: MaterialAssinado; compacto?: boolean }) {
  const Icone = m.tipo === "modelo" ? FileText : Play
  return (
    <span className="relative block aspect-video overflow-hidden bg-muted">
      {m.capa ? (
        // Signed URL do bucket privado: o otimizador do next/image buscaria de
        // novo uma URL que expira. A capa já sai em 480p.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={m.capa}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="absolute inset-0 bg-gradient-to-br from-primary-subtle via-muted to-accent" />
      )}
      {m.disponivel && (
        <span
          className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-transform group-hover:scale-110 ${
            compacto ? "h-7 w-7" : "h-9 w-9 sm:h-12 sm:w-12"
          }`}
        >
          <Icone className={compacto ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"} fill={m.tipo === "video" ? "currentColor" : "none"} />
        </span>
      )}
      {!m.disponivel && !compacto && (
        <span className="absolute inset-0 grid place-items-center">
          <Icone className="h-8 w-8 text-muted-foreground/60" />
        </span>
      )}
      {m.duracao && !compacto && (
        <span className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-white">
          {m.duracao}
        </span>
      )}
    </span>
  )
}

/** O card da vitrine. Material que ainda não chegou fica visível, mas sem link. */
export function CardDoMaterial({ m, hoje = false }: { m: MaterialAssinado; hoje?: boolean }) {
  const selo = !m.disponivel ? (
    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
      Em breve
    </span>
  ) : hoje ? (
    <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
      Hoje
    </span>
  ) : null

  // No celular o card deita (miniatura à esquerda): em pé, um embaixo do
  // outro, cada aula ocupava uma tela inteira.
  const corpo = (
    <>
      <span className="w-32 flex-none self-start p-2.5 pr-0 sm:w-auto sm:self-auto sm:p-0">
        <span className="block overflow-hidden rounded-lg sm:rounded-none">
          <Quadro m={m} />
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1 p-3 sm:gap-1.5 sm:p-4">
        <span className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground">
          {m.tipo === "modelo" ? "Modelo" : "Aula"}
          {m.dia !== undefined && <span>· Dia {doisDigitos(m.dia)}</span>}
          <span className="ml-auto">{selo}</span>
        </span>
        <b className="font-display text-[15px] font-bold leading-snug tracking-tight text-foreground">
          {m.titulo}
        </b>
        <span className="line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{m.resumo}</span>
      </span>
    </>
  )

  const base = "group flex flex-row overflow-hidden rounded-2xl border bg-card shadow-sm sm:flex-col"
  if (!m.disponivel) {
    return <div className={`${base} border-dashed border-border opacity-75`}>{corpo}</div>
  }
  return (
    <Link
      href={linkDoMaterial(m)}
      prefetch={false}
      className={`${base} transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md ${
        hoje ? "border-primary/50 ring-1 ring-primary/30" : "border-border"
      }`}
    >
      {corpo}
    </Link>
  )
}

/** Uma linha com miniatura: a faixa do dia e o "Para hoje" da Biblioteca. */
export function LinhaDoMaterial({ m, dia }: { m: MaterialAssinado; dia: number }) {
  const daNati = m.dia === dia
  return (
    <Link
      href={linkDoMaterial(m)}
      prefetch={false}
      className="group flex items-center gap-3.5 rounded-xl p-2 transition-colors hover:bg-accent/60"
    >
      <span className="w-24 flex-none overflow-hidden rounded-lg border border-border sm:w-28">
        <Quadro m={m} compacto />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block truncate text-sm font-semibold text-foreground group-hover:text-primary">
          {m.titulo}
        </b>
        <small className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {daNati ? "Material do dia" : "Para aprofundar"}
          {m.duracao && (
            <>
              <span aria-hidden>·</span>
              {m.tipo === "video" && <Clock className="h-3 w-3" />}
              {m.duracao}
            </>
          )}
        </small>
      </span>
      <ChevronRight className="h-4 w-4 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  )
}

/**
 * A faixa no topo de um dia: as aulas extras e modelos daquele dia, à vista,
 * sem precisar lembrar que a Biblioteca existe. Dia sem material não mostra
 * nada.
 */
export function MaterialDoDia({ dia, materiais }: { dia: number; materiais: readonly MaterialAssinado[] }) {
  if (materiais.length === 0) return null
  return (
    <aside
      aria-label={`Material extra do Dia ${dia}`}
      className="mb-7 rounded-2xl border border-border bg-card/80 p-3 shadow-sm backdrop-blur-sm sm:p-4"
    >
      <div className="mb-1.5 flex items-baseline gap-2 px-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
          Na Biblioteca
        </span>
        <Link
          href="/desafio/biblioteca"
          className="ml-auto text-[12px] font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          Ver tudo
        </Link>
      </div>
      <div className="flex flex-col">
        {materiais.map((m) => (
          <LinhaDoMaterial key={m.chave} m={m} dia={dia} />
        ))}
      </div>
    </aside>
  )
}
