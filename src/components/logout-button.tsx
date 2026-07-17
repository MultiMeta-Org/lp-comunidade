"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

/** Botão de logout: encerra a sessão e volta para o login. */
export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      aria-label="Sair"
      className={
        className ??
        "inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-50"
      }
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sair</span>
    </button>
  )
}
