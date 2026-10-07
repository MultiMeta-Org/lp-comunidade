"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GalleryHorizontalEnd, Gauge, GraduationCap, Users } from "lucide-react"

type Item = {
  href: string
  label: string
  icon: React.ElementType
}

const ITEMS: Item[] = [
  { href: "/admin", label: "Visão geral", icon: Gauge },
  { href: "/admin/acessos", label: "Acessos", icon: Users },
  { href: "/admin/aulas", label: "Aulas", icon: GraduationCap },
  { href: "/admin/banners", label: "Banners", icon: GalleryHorizontalEnd },
]

/**
 * Navegação do /admin.
 *
 * O painel virou quatro rotas em vez de uma página rolante: cada lista pagina
 * e filtra pela URL, então um link reaberto cai exatamente onde a Nati estava.
 * "Visão geral" é só o item exato — as outras acendem no prefixo, para a página
 * de progresso de uma aula manter "Aulas" aceso.
 */
export function AdminNav() {
  const pathname = usePathname() ?? "/admin"

  return (
    <nav
      aria-label="Seções do admin"
      className="flex flex-wrap items-center gap-1 rounded-full border border-border/70 bg-muted/60 p-1"
    >
      {ITEMS.map(({ href, label, icon: Icon }) => {
        const active = href === "/admin" ? pathname === href : pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
