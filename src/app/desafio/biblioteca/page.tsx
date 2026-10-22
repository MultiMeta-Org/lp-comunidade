import Link from "next/link"
import { ArrowLeft, ArrowUpRight, BookOpen } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { getJornada } from "@/lib/desafio-server"
import { diaAtual } from "@/lib/desafio"
import { APOIO_DO_CADERNO, INDICE_DO_CADERNO, linkDoCaderno } from "@/lib/desafio/caderno"
import { Atmosphere } from "@/components/atmosphere"

/**
 * A Biblioteca do Desafio. Por enquanto, um livro só: o Caderno de Campo.
 *
 * O índice leva direto à página de cada dia, e o dia em que ela está vem
 * marcado — é o que ela mais vai abrir. O Caderno inteiro fica liberado, como
 * a apostila impressa: é material para revisar e imprimir, não a missão (que
 * continua um dia por vez no portal).
 */
export default async function BibliotecaPage() {
  const { email } = await requireDesafio()
  const { concluidos } = await getJornada(email)
  const atual = diaAtual(concluidos)

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <Link
          href="/desafio"
          className="group mb-6 inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Minha jornada
        </Link>

        <header className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Biblioteca
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl">
            Para aprofundar seus estudos
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            O Caderno de Campo acompanha os vídeos: o estudo completo de cada dia, esquemas para
            consultar rápido e espaço para suas anotações.
          </p>
        </header>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:p-6">
            <span className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-primary-subtle text-primary">
              <BookOpen className="h-6 w-6" />
            </span>
            <span className="min-w-0 flex-1">
              <b className="block font-display text-lg font-bold tracking-tight text-foreground">
                Caderno de Campo
              </b>
              <small className="block text-[13px] text-muted-foreground">
                21 dias · teoria essencial, prática e espaço para anotações · PDF
              </small>
            </span>
            <a
              href={linkDoCaderno()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-none items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Abrir o Caderno
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <nav aria-label="Índice do Caderno de Campo">
            <ol className="divide-y divide-border/70">
              {INDICE_DO_CADERNO.map(({ dia, titulo, pagina }) => {
                const hoje = dia === atual
                return (
                  <li key={dia}>
                    <a
                      href={linkDoCaderno(pagina)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-current={hoje ? "step" : undefined}
                      className={`group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-accent/60 sm:px-6 ${
                        hoje ? "bg-primary-subtle/50" : ""
                      }`}
                    >
                      <span
                        className={`w-11 flex-none font-display text-xs font-bold tabular-nums ${
                          hoje ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        Dia {String(dia).padStart(2, "0")}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-sm text-foreground">{titulo}</span>
                      {hoje && (
                        <span className="flex-none rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
                          hoje
                        </span>
                      )}
                      <span className="flex-none font-display text-xs tabular-nums text-muted-foreground group-hover:text-primary">
                        p. {pagina}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className="border-t border-border bg-muted/30 px-5 py-4 sm:px-6">
            <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Para consultar sempre
            </p>
            <div className="flex flex-wrap gap-2">
              {APOIO_DO_CADERNO.map(({ titulo, pagina }) => (
                <a
                  key={pagina}
                  href={linkDoCaderno(pagina)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                >
                  {titulo}
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
