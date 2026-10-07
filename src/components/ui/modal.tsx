"use client"

import { useEffect, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/** Nada muda nunca: a "assinatura" existe só para satisfazer a API. */
const assinaNada = () => () => {}
const noCliente = () => true
const noServidor = () => false

const SIZES = {
  sm: "max-w-md",
  lg: "max-w-2xl",
} as const

/**
 * Diálogo centralizado com overlay. Fecha no Esc, no clique fora e no X.
 * Trava o scroll do body enquanto está aberto.
 *
 * Vai para o `document.body` por PORTAL, e não onde foi escrito. `fixed` e
 * `z-50` só valem contra o resto da página quando o diálogo não está preso
 * dentro de um contexto de empilhamento alheio — e basta um ancestral com
 * `z-10` (a home tem) para o overlay ficar DEBAIXO do header sticky, ou um
 * ancestral com `transform`/`overflow-hidden` para recortá-lo. O portal tira
 * o diálogo dessa árvore e acaba com a classe inteira de bug.
 */
export function Modal({
  title,
  onClose,
  size = "lg",
  children,
}: {
  title: string
  onClose: () => void
  size?: keyof typeof SIZES
  children: React.ReactNode
}) {
  // `document` não existe no servidor: o portal só monta depois da hidratação.
  // `useSyncExternalStore` com duas leituras (cliente true, servidor false) é o
  // jeito sem efeito nem setState de perguntar "já estou no navegador?".
  const montado = useSyncExternalStore(assinaNada, noCliente, noServidor)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  if (!montado) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={cn(
          "relative my-auto w-full rounded-2xl border border-border bg-card shadow-xl",
          SIZES[size]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
