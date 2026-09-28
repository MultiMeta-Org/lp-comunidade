import Link from "next/link"
import { currentUserEmail, isAdmin } from "@/lib/guard"
import { hasComunidadeVip } from "@/lib/access"
import { LogoutButton } from "@/components/logout-button"
import { MultiMetaLogo } from "@/components/multimeta-logo"
import { MainNav } from "@/components/main-nav"

/**
 * Header compartilhado das páginas autenticadas: marca + navegação principal
 * (Início / Material / Admin, com o item atual destacado) + logout.
 * "Material" só entra para quem tem a Comunidade VIP.
 *
 * `wide` alinha o header ao container mais largo do /admin (max-w-5xl).
 */
export async function SiteHeader({
  wide = false,
  children,
}: {
  wide?: boolean
  /** Conteúdo extra à esquerda da navegação (ex.: e-mail do admin). */
  children?: React.ReactNode
}) {
  const email = await currentUserEmail()
  const [admin, material] = email
    ? await Promise.all([isAdmin(email), hasComunidadeVip(email)])
    : [false, false]

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-card/85 backdrop-blur-md supports-[backdrop-filter]:bg-card/70">
      <div
        className={`${wide ? "max-w-5xl" : "max-w-4xl"} mx-auto px-5 h-14 flex items-center justify-between gap-3`}
      >
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
          <MainNav admin={admin} material={material} />
          <span className="h-5 w-px bg-border hidden sm:block" />
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
