"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, RefreshCw } from "lucide-react"

/**
 * "Já assinei e continua travado."
 *
 * A aluna clica em Assinar, paga na Hotmart e volta para a aba que já estava
 * aberta — sem novo login, nenhuma das verificações automáticas passa por ela.
 * Este botão é a saída: pergunta à Hotmart pela compra dela e recarrega.
 *
 * Fica discreto de propósito: quem não comprou não deve ser convidado a
 * apertá-lo, e quem comprou precisa achá-lo sem pedir ajuda.
 */
export function VerificarAssinatura() {
  const router = useRouter()
  const [estado, setEstado] = useState<"parado" | "checando" | "nada">("parado")

  async function verificar() {
    setEstado("checando")
    try {
      const res = await fetch("/api/comunidade/verificar-vip", { method: "POST" })
      const { liberado } = (await res.json()) as { liberado?: boolean }
      if (liberado) {
        router.refresh()
        return
      }
      setEstado("nada")
    } catch {
      setEstado("nada")
    }
  }

  if (estado === "nada") {
    return (
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Não encontramos uma assinatura no seu e-mail de acesso. Se você pagou com outro
        e-mail, fala com a gente que a gente resolve.
      </p>
    )
  }

  return (
    <button
      type="button"
      onClick={verificar}
      disabled={estado === "checando"}
      className="group mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-60"
    >
      {estado === "checando" ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      )}
      Já assinei a Comunidade VIP — liberar meu acesso
    </button>
  )
}
