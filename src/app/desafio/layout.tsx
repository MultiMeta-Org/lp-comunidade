import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MultiMetaLogo } from "@/components/multimeta-logo"
import { LogoutButton } from "@/components/logout-button"
import { requireDesafio } from "@/lib/guard"
import { getJornada } from "@/lib/desafio-server"
import { TOTAL_DIAS } from "@/lib/desafio"

/**
 * O Desafio é um ambiente próprio, e não uma página do portal.
 *
 * Header próprio, de propósito: a `main-nav` do portal oferece Início e Admin,
 * que são saídas. Aqui a aluna precisa de uma coisa só na frente dela — a
 * missão de hoje —, e de um caminho claro de volta. A barra de progresso no
 * topo é a mesma informação da jornada, num lugar que acompanha o scroll:
 * é ela que diz "você está indo", que é o que faz voltar amanhã.
 *
 * O guard roda aqui e nas páginas de dentro. Layout não é limite de segurança
 * em App Router (uma navegação de cliente pode renderizar a página sem
 * reexecutar o layout), então cada página revalida por conta.
 */
export default async function DesafioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { email } = await requireDesafio()
  const { concluidos } = await getJornada(email)

  // O Dia Zero é matrícula, não missão: a barra conta os 21.
  const feitos = [...concluidos].filter((d) => d >= 1).length
  const pct = Math.round((feitos / TOTAL_DIAS) * 100)

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/70">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-5">
          <Link
            href="/desafio"
            className="group flex min-w-0 shrink-0 items-center gap-2"
            aria-label="Ir para a sua jornada"
          >
            <MultiMetaLogo className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-6" />
            <span className="font-serif text-[15px] font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Desafio 21 Dias
            </span>
          </Link>

          <span className="ml-auto hidden text-xs font-semibold text-muted-foreground sm:inline">
            {feitos} de {TOTAL_DIAS} dias
          </span>

          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Portal</span>
          </Link>

          <span className="hidden h-5 w-px bg-border sm:block" />
          <LogoutButton />
        </div>

        {/* Progresso: fina, sem número, sempre à vista. */}
        <div className="h-[3px] bg-muted" role="presentation">
          <div
            className="h-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </header>

      {children}
    </div>
  )
}
