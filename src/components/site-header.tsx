import Link from "next/link"
import { currentUserEmail, isAdmin } from "@/lib/guard"
import { LogoutButton } from "@/components/logout-button"

/**
 * Header compartilhado das páginas autenticadas: marca + navegação
 * entre páginas (Hub / Comunidade VIP, Admin quando for admin) e logout.
 */
export async function SiteHeader({ page = "vip" }: { page?: "vip" | "hub" }) {
  const email = await currentUserEmail()
  const admin = email ? await isAdmin(email) : false

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        <Link href="/" className="min-w-0 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
            MultiMeta
          </span>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-4">
          {page === "hub" ? (
            <Link
              href="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Material de Aulas
            </Link>
          ) : (
            <Link
              href="/hub"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Hub
            </Link>
          )}
          {admin && (
            <Link
              href="/admin"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Admin
            </Link>
          )}
          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}
