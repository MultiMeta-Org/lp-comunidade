import Link from "next/link"
import { ArrowRight, ArrowUpRight } from "lucide-react"
import { Atmosphere } from "@/components/atmosphere"

export type Acesso = {
  titulo: string
  texto: string
  href: string
  /** Sai do portal (Notion, WhatsApp, PDF): abre em outra aba. */
  fora?: boolean
}

/**
 * As páginas "Vou fazer uma reunião" e "Fechei meu primeiro contrato": tudo o
 * que ela precisa naquele momento, reunido num lugar só. Antes o material
 * estava espalhado entre Biblioteca, Caderno e dias que ela talvez nem tenha
 * aberto — e "fechei" levava direto ao WhatsApp do suporte.
 */
export function Central({
  kicker,
  titulo,
  lede,
  acessos,
  rodape,
}: {
  kicker: string
  titulo: string
  lede: string
  acessos: readonly Acesso[]
  rodape?: React.ReactNode
}) {
  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            {kicker}
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl">
            {titulo}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">{lede}</p>
        </header>

        <ol className="flex flex-col gap-2.5">
          {acessos.map((a, n) => {
            const conteudo = (
              <>
                <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-primary-subtle font-display text-xs font-bold text-primary">
                  {n + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <b className="block text-sm font-semibold text-foreground">{a.titulo}</b>
                  <small className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                    {a.texto}
                  </small>
                </span>
                {a.fora ? (
                  <ArrowUpRight className="h-4 w-4 flex-none text-primary" />
                ) : (
                  <ArrowRight className="h-4 w-4 flex-none text-primary transition-transform group-hover:translate-x-0.5" />
                )}
              </>
            )
            const classe =
              "group flex items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md sm:px-5"
            return (
              <li key={a.titulo}>
                {a.fora ? (
                  <a href={a.href} target="_blank" rel="noopener noreferrer" className={classe}>
                    {conteudo}
                  </a>
                ) : (
                  <Link href={a.href} className={classe}>
                    {conteudo}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>

        {rodape && <div className="mt-6">{rodape}</div>}

        <Link
          href="/desafio"
          className="group mt-8 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
        >
          Voltar para a minha jornada
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </main>
  )
}
