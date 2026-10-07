"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, Settings } from "lucide-react"

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
 *
 * O material de aulas não entra aqui: é uma porta de dentro do Laboratório de
 * Vendas, e vive na seção dele na home. Quem não assina tem a sua própria porta
 * ali (o Plantão Tira Dúvidas) — e o recorte do que cada uma vê é decidido no
 * servidor (requireLessonsViewer), não por link escondido.
 */
export function MainNav({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname() ?? "/"

  const items: Item[] = [
    {
      href: "/",
      label: "Início",
      icon: House,
      isActive: (p) => p === "/",
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
