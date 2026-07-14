"use client"

import { useState } from "react"
import { Play, Pause } from "lucide-react"

export function AudioPlayer({ label }: { label: string }) {
  const [playing, setPlaying] = useState(false)

  return (
    <div className="flex items-center gap-3 bg-accent rounded-lg px-4 py-3 max-w-sm">
      <button
        onClick={() => setPlaying(!playing)}
        className="w-9 h-9 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
        aria-label={playing ? "Pausar" : "Ouvir áudio"}
      >
        {playing ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate mb-1.5">
          {label.length > 42 ? label.slice(0, 42) + "…" : label}
        </p>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-primary rounded-full transition-all duration-1000 ${
              playing ? "w-1/3" : "w-0"
            }`}
          />
        </div>
      </div>
    </div>
  )
}
