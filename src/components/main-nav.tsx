"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutGrid, GraduationCap, Settings } from "lucide-react"

type Item = {
  href: string
  label: string
  icon: React.ElementType
  isActive: (path: string) => boolean
}

/**
 * Navegação principal das páginas autenticadas: um controle segmentado com
 * estado ativo real (usePathname), em vez de esconder o link da página atual.
 * A aluna sempre vê para onde pode ir — e onde está.
 */
export function MainNav({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname() ?? "/"

  const items: Item[] = [
    {
      href: "/hub",
      label: "Hub",
      icon: LayoutGrid,
      isActive: (p) => p === "/hub",
    },
    {
      href: "/",
      label: "Aulas",
      icon: GraduationCap,
      // A página de uma aula (/dia/[id]) pertence a "Aulas".
      isActive: (p) => p === "/" || p.startsWith("/dia"),
    },
    ...(admin
      ? [
          {
            href: "/admin",
            label: "Admin",
            icon: Settings,
            isActive: (p: string) => p.startsWith("/admin"),
          },
        ]
      : []),
  ]

  return (
    <nav
      aria-label="Navegação principal"
      className="flex items-center gap-0.5 rounded-full border border-border/70 bg-muted/70 p-1"
    >
      {items.map(({ href, label, icon: Icon, isActive }) => {
        const active = isActive(pathname)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-card hover:text-foreground"
            }`}
          >
            <Icon className="w-3.5 h-3.5 flex-shrink-0" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
