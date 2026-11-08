import { ArrowUpRight, BookOpen, ChevronDown } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { getJornada } from "@/lib/desafio-server"
import { diaAtual } from "@/lib/desafio"
import { APOIO_DO_CADERNO, INDICE_DO_CADERNO, linkDoCaderno } from "@/lib/desafio/caderno"
import { MATERIAIS_DA_BIBLIOTECA, TRILHAS, materiaisDoDia, type Trilha } from "@/lib/desafio/biblioteca"
import { assinarMateriais } from "@/lib/desafio/biblioteca-server"
import { Atmosphere } from "@/components/atmosphere"
import { CardDoMaterial, LinhaDoMaterial } from "@/components/desafio/biblioteca"

const doisDigitos = (n: number) => String(n).padStart(2, "0")

/**
 * A Biblioteca do Desafio, em três andares:
 *
 *   1. Para hoje — o capítulo do Caderno e o material extra do dia em que ela
 *      está. É o que ela mais vai abrir, então vem primeiro.
 *   2. O Caderno de Campo — o PDF inteiro, com o índice por dia recolhido.
 *   3. As aulas extras por trilha (SDR, Closer, CRM), em cards com a capa.
 *
 * Tudo liberado, como a apostila impressa: é material para revisar, não a
 * missão (que continua um dia por vez no portal).
 */
export default async function BibliotecaPage() {
  const { email } = await requireDesafio()
  const { concluidos } = await getJornada(email)
  const atual = diaAtual(concluidos)

  const materiais = await assinarMateriais(MATERIAIS_DA_BIBLIOTECA)
  const porChave = new Map(materiais.map((m) => [m.chave, m]))
  const capituloDeHoje = INDICE_DO_CADERNO.find((c) => c.dia === atual)
  const extrasDeHoje = materiaisDoDia(atual).map((m) => porChave.get(m.chave)!)
  const trilhas = Object.keys(TRILHAS) as Trilha[]

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <header className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Biblioteca
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl">
            Para aprofundar seus estudos
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            O Caderno de Campo com o estudo de cada dia, e as aulas extras da Nati sobre o trabalho
            de SDR, de Closer e o CRM. Tudo liberado para você voltar quando quiser.
          </p>
        </header>

        {/* ── 1. Para hoje ── */}
        {capituloDeHoje && (
          <section
            aria-labelledby="para-hoje"
            className="mb-10 overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm"
          >
            <div className="flex flex-col gap-4 bg-primary-subtle/50 p-5 sm:flex-row sm:items-center sm:p-6">
              <span className="min-w-0 flex-1">
                <span className="mb-1 block text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Para hoje · Dia {doisDigitos(atual)}
                </span>
                <b id="para-hoje" className="block font-display text-xl font-bold tracking-tight text-foreground">
                  {capituloDeHoje.titulo}
                </b>
              </span>
              <a
                href={linkDoCaderno(capituloDeHoje.pagina)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-none items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Ler no Caderno, p. {capituloDeHoje.pagina}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </div>
            {extrasDeHoje.length > 0 && (
              <div className="border-t border-border p-3 sm:p-4">
                {extrasDeHoje.map((m) => (
                  <LinhaDoMaterial key={m.chave} m={m} dia={atual} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 2. O Caderno de Campo ── */}
        <section aria-labelledby="caderno" className="mb-12">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
              {/* A capa: um livro, não mais uma linha de lista. */}
              <div
                aria-hidden
                className="relative mx-auto flex h-40 w-28 flex-none flex-col justify-between overflow-hidden rounded-r-xl rounded-l-sm bg-gradient-to-br from-primary to-primary/70 p-3 text-primary-foreground shadow-md sm:mx-0"
              >
                <span className="absolute inset-y-0 left-0 w-2 bg-black/15" />
                <BookOpen className="ml-1 h-5 w-5 opacity-80" />
                <span className="ml-1 font-display text-[15px] font-bold leading-tight">
                  Caderno
                  <br />
                  de Campo
                </span>
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <h2 id="caderno" className="font-display text-xl font-bold tracking-tight text-foreground">
                  Caderno de Campo
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Os 21 dias em PDF: a teoria essencial de cada um, a prática e espaço para anotar. Dá
                  para imprimir.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {APOIO_DO_CADERNO.map(({ titulo, pagina }) => (
                    <a
                      key={pagina}
                      href={linkDoCaderno(pagina)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-border bg-background px-3 py-1 text-[12.5px] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
                    >
                      {titulo}
                    </a>
                  ))}
                </div>
                <a
                  href={linkDoCaderno()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/40 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                >
                  Abrir o Caderno inteiro
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            <details className="group border-t border-border">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-5 py-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50 sm:px-6 [&::-webkit-details-marker]:hidden">
                Capítulos por dia
                <ChevronDown className="ml-auto h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <nav aria-label="Índice do Caderno de Campo" className="px-3 pb-4 sm:px-4">
                <ol className="grid gap-1 sm:grid-cols-2">
                  {INDICE_DO_CADERNO.map(({ dia, titulo, pagina }) => {
                    const hoje = dia === atual
                    return (
                      <li key={dia}>
                        <a
                          href={linkDoCaderno(pagina)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-current={hoje ? "step" : undefined}
                          className={`group/cap flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-accent/60 ${
                            hoje ? "bg-primary-subtle/60" : ""
                          }`}
                        >
                          <span
                            className={`w-6 flex-none font-display text-xs font-bold tabular-nums ${
                              hoje ? "text-primary" : "text-muted-foreground"
                            }`}
                          >
                            {doisDigitos(dia)}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{titulo}</span>
                          <span className="flex-none text-[11px] tabular-nums text-muted-foreground group-hover/cap:text-primary">
                            p. {pagina}
                          </span>
                        </a>
                      </li>
                    )
                  })}
                </ol>
              </nav>
            </details>
          </div>
        </section>

        {/* ── 3. Aulas extras e modelos, por trilha ── */}
        <div className="space-y-12">
          {trilhas.map((trilha) => {
            const daTrilha = materiais.filter((m) => m.trilha === trilha)
            const prontos = daTrilha.filter((m) => m.disponivel)
            // O que ainda não chegou vira uma linha, não um card vazio do
            // tamanho de uma aula: quatro cartelas "em breve" afogavam a trilha.
            const emBreve = daTrilha.filter((m) => !m.disponivel)
            return (
              <section key={trilha} aria-labelledby={`trilha-${trilha}`}>
                <div className="mb-4 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <h2
                    id={`trilha-${trilha}`}
                    className="font-display text-xl font-bold tracking-tight text-foreground"
                  >
                    {TRILHAS[trilha].titulo}
                  </h2>
                  <span className="text-[13px] text-muted-foreground">{TRILHAS[trilha].descricao}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {prontos.map((m) => (
                    <CardDoMaterial key={m.chave} m={m} hoje={m.dia === atual} />
                  ))}
                </div>
                {emBreve.length > 0 && (
                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-[12.5px] text-muted-foreground">
                    <span className="font-semibold">Em breve:</span>
                    {emBreve.map((m) => (
                      <span
                        key={m.chave}
                        className="rounded-full border border-dashed border-border px-2.5 py-0.5"
                      >
                        {m.titulo}
                        {m.dia !== undefined && ` · Dia ${doisDigitos(m.dia)}`}
                      </span>
                    ))}
                  </p>
                )}
              </section>
            )
          })}
        </div>
      </div>
    </main>
  )
}
