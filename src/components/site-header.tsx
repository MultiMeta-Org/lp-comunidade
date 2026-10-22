import Link from "next/link"
import { Settings } from "lucide-react"
import { currentUserEmail, isAdmin } from "@/lib/guard"
import type { Passo } from "@/lib/trilha"
import { LogoutButton } from "@/components/logout-button"
import { MultiMetaLogo } from "@/components/multimeta-logo"
import { Breadcrumbs } from "@/components/breadcrumbs"

/**
 * Header compartilhado de TODAS as páginas autenticadas, Desafio incluído.
 *
 * Linha de cima: a marca (sempre leva ao Início — por isso não existe aba
 * "Início"), o atalho do Admin para quem é admin, e Sair. Linha de baixo: a
 * trilha de onde ela está (breadcrumbs), que é a navegação do portal — some na
 * home, onde não há para onde subir.
 *
 * `trilha` sobrepõe a que sai da URL (ver trilhaDaRota), para páginas cujo
 * rótulo vem do banco. `acoes` fica à direita da trilha — no Desafio, o
 * contador de dias. `faixa` vem por último, colada embaixo — no Desafio, a
 * barra de progresso.
 */
export async function SiteHeader({
  wide = false,
  trilha,
  acoes,
  faixa,
  children,
}: {
  wide?: boolean
  trilha?: Passo[]
  /** À direita da trilha (ex.: o contador do Desafio). */
  acoes?: React.ReactNode
  /** Linha extra embaixo, dentro do cabeçalho fixo (ex.: progresso do Desafio). */
  faixa?: React.ReactNode
  /** Conteúdo extra à esquerda do Sair (ex.: e-mail do admin). */
  children?: React.ReactNode
}) {
  const email = await currentUserEmail()
  const admin = email ? await isAdmin(email) : false
  const largura = wide ? "max-w-5xl" : "max-w-4xl"

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/70">
      <div className={`${largura} mx-auto px-5 h-14 flex items-center justify-between gap-3`}>
        <Link
          href="/"
          aria-label="Ir para o início"
          className="group flex items-center gap-2 min-w-0 shrink-0"
        >
          <MultiMetaLogo className="h-6 w-6 transition-transform duration-300 group-hover:-rotate-6" />
          <span className="hidden sm:inline text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            MultiMeta
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {children}
          {admin && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
            >
              <Settings className="h-3.5 w-3.5" />
              Admin
            </Link>
          )}
          <span className="h-5 w-px bg-border hidden sm:block" />
          <LogoutButton />
        </div>
      </div>

      <TrilhaComAcoes largura={largura} trilha={trilha} acoes={acoes} />
      {faixa}
    </header>
  )
}

/**
 * A linha da trilha. Separada para não desenhar uma faixa vazia na home: a
 * trilha decide no cliente (pela URL) se aparece, então a linha só tem borda
 * quando tem conteúdo — `has-[nav]` cuida disso sem JavaScript.
 */
function TrilhaComAcoes({
  largura,
  trilha,
  acoes,
}: {
  largura: string
  trilha?: Passo[]
  acoes?: React.ReactNode
}) {
  return (
    <div className="hidden has-[nav]:block border-t border-border/60">
      <div className={`${largura} mx-auto flex h-11 items-center gap-2.5 px-3 sm:px-4`}>
        <Breadcrumbs trilha={trilha} />
        {acoes}
      </div>
    </div>
  )
}
