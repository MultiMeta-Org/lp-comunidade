import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { currentUserEmail, isAdmin } from "@/lib/guard"
import { WHATSAPP_VIP_URL } from "@/lib/links"
import { LogoutButton } from "@/components/logout-button"

/**
 * Header compartilhado das páginas autenticadas: marca + navegação
 * (Hub, Admin quando for admin), WhatsApp VIP e logout.
 */
export async function SiteHeader({ page = "vip" }: { page?: "vip" | "hub" }) {
  const email = await currentUserEmail()
  const admin = email ? await isAdmin(email) : false

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card/90 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            MultiMeta
          </span>
          <span className="text-border">·</span>
          <Link
            href="/"
            className="text-sm font-semibold text-foreground truncate hover:text-primary transition-colors"
          >
            Comunidade VIP
          </Link>
        </div>

        <nav className="flex items-center gap-3 sm:gap-4">
          {page === "hub" ? (
            <Link
              href="/"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Comunidade VIP
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
          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp VIP
          </a>
          <LogoutButton />
        </nav>
      </div>
    </header>
  )
}
