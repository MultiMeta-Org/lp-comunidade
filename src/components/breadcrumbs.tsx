"use client"

import { Fragment } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, House } from "lucide-react"
import { type Passo, trilhaDaRota } from "@/lib/trilha"

/**
 * A trilha de onde a aluna está: 🏠 › Desafio Empreendedora Anônima › Dia 3.
 *
 * Substitui as abas e as setinhas "← voltar" soltas em cada página — uma
 * forma só de subir um nível, no mesmo lugar em todo o portal. O último passo
 * é a página atual (sem link). No celular, os passos do meio somem e fica
 * casinha › pai › atual, cada um truncado.
 */
export function Breadcrumbs({ trilha }: { trilha?: Passo[] }) {
  const pathname = usePathname() ?? "/"
  const passos = trilha ?? trilhaDaRota(pathname)
  if (passos.length === 0) return null

  return (
    <nav aria-label="Você está em" className="min-w-0 flex-1">
      <ol className="flex min-w-0 items-center gap-1 text-xs font-semibold">
        <li className="flex-none">
          <Link
            href="/"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <House className="h-3.5 w-3.5" />
            <span className="sr-only">Início</span>
          </Link>
        </li>
        {passos.map((passo, i) => {
          const atual = i === passos.length - 1
          // No celular, só o pai e o atual.
          const escondeNoCelular = i < passos.length - 2
          return (
            <Fragment key={`${i}-${passo.label}`}>
              <li
                aria-hidden
                className={`flex-none text-muted-foreground/50 ${escondeNoCelular ? "hidden sm:block" : ""}`}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li className={`min-w-0 ${atual ? "" : "flex-none max-w-[45%]"} ${escondeNoCelular ? "hidden sm:block" : ""}`}>
                {atual || !passo.href ? (
                  <span
                    aria-current={atual ? "page" : undefined}
                    className={`block truncate px-1 ${atual ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {passo.label}
                  </span>
                ) : (
                  <Link
                    href={passo.href}
                    className="block truncate rounded-md px-1 text-muted-foreground transition-colors hover:text-primary"
                  >
                    {passo.label}
                  </Link>
                )}
              </li>
            </Fragment>
          )
        })}
      </ol>
    </nav>
  )
}
