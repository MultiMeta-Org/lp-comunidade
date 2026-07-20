"use client"

import { useEffect, useState } from "react"
import { Video } from "lucide-react"
import { LIVE_CLASS_URL } from "@/lib/links"

// Janela da aula ao vivo (America/Sao_Paulo): começa 9h e dura 1 hora.
const LIVE_START_HOUR = 9
const LIVE_END_HOUR = 10

function isLiveNow(): boolean {
  const hour = Number(
    new Intl.DateTimeFormat("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour: "numeric",
      hour12: false,
    }).format(new Date())
  )
  return hour >= LIVE_START_HOUR && hour < LIVE_END_HOUR
}

/**
 * Barra no topo da página que só aparece enquanto o grupo está ao vivo.
 * Bolinha vermelha pulsante sinaliza a transmissão em andamento.
 */
export function LiveBanner() {
  const [live, setLive] = useState(false)

  useEffect(() => {
    // ?preview-live força a barra visível para conferir o visual fora do horário.
    const preview = new URLSearchParams(window.location.search).has("preview-live")
    const update = () => setLive(preview || isLiveNow())
    update()
    const t = setInterval(update, 60_000)
    return () => clearInterval(t)
  }, [])

  if (!live) return null

  return (
    <a
      href={LIVE_CLASS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2.5 bg-destructive px-5 py-2 text-destructive-foreground hover:opacity-95 transition-opacity"
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/80" />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
      </span>
      <span className="text-xs font-bold uppercase tracking-wide">Ao vivo agora</span>
      <span className="hidden sm:inline text-xs font-medium opacity-90">
        · Entrar na aula ao vivo
      </span>
      <Video className="w-3.5 h-3.5" />
    </a>
  )
}
