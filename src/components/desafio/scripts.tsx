"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, ChevronDown, Copy } from "lucide-react"
import type { Gaveta } from "@/lib/desafio/scripts"

/**
 * As gavetas da Central de Scripts. Recolhidas, com a primeira aberta: são
 * mais de cinquenta mensagens, e uma rolagem corrida delas era o mesmo
 * problema de antes — não achar a que precisa.
 */
export function GavetasDeScripts({ gavetas }: { gavetas: Gaveta[] }) {
  return (
    <div className="flex flex-col gap-3">
      {gavetas.map((g, n) => (
        <details
          key={g.titulo}
          open={n === 0}
          className="group rounded-2xl border border-border bg-card"
        >
          <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 sm:px-5">
            <span className="min-w-0 flex-1">
              <b className="block font-display text-lg font-bold text-foreground">{g.titulo}</b>
              {g.descricao && (
                <small className="block text-xs leading-relaxed text-muted-foreground">
                  {g.descricao}
                </small>
              )}
            </span>
            <span className="flex-none rounded-full bg-primary-subtle px-2.5 py-1 text-[10px] font-bold text-primary">
              {g.scripts.length}
            </span>
            <ChevronDown className="h-4 w-4 flex-none text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <ul className="flex flex-col gap-2.5 border-t border-border px-4 py-4 sm:px-5">
            {g.scripts.map((s, i) => (
              <ScriptParaCopiar key={i} {...s} />
            ))}
          </ul>
        </details>
      ))}
    </div>
  )
}

function ScriptParaCopiar({ titulo, texto, dia }: { titulo?: string; texto: string; dia: number }) {
  const [copiado, setCopiado] = useState(false)

  return (
    <li className="flex flex-col gap-2.5 rounded-[14px] border border-border bg-background/60 px-4 py-3.5">
      <div className="flex items-baseline gap-2">
        {titulo && (
          <p className="min-w-0 flex-1 text-[10.5px] font-bold uppercase tracking-[0.12em] text-secondary">
            {titulo}
          </p>
        )}
        <Link
          href={`/desafio/dia/${dia}`}
          className="ml-auto flex-none text-[11px] font-semibold text-muted-foreground hover:text-primary"
        >
          Dia {dia}
        </Link>
      </div>
      <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{texto}</p>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(texto)
            setCopiado(true)
            window.setTimeout(() => setCopiado(false), 2200)
          } catch {
            // Sem permissão de área de transferência: o texto está na tela.
          }
        }}
        className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/45 hover:text-primary"
      >
        {copiado ? (
          <>
            <Check className="h-3.5 w-3.5" /> Copiado
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" /> Copiar
          </>
        )}
      </button>
    </li>
  )
}
