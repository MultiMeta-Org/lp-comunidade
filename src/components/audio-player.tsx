"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"

function fmt(sec: number): string {
  if (!Number.isFinite(sec) || sec < 0) return "0:00"
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, "0")}`
}

export function AudioPlayer({ label, src }: { label: string; src?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  const hasAudio = Boolean(src && src !== "#")

  // Mantém o estado em sincronia com o elemento de áudio real.
  useEffect(() => {
    const el = audioRef.current
    if (!el) return
    const onTime = () => setCurrent(el.currentTime)
    const onMeta = () => setDuration(el.duration)
    const onEnded = () => {
      setPlaying(false)
      setCurrent(0)
    }
    el.addEventListener("timeupdate", onTime)
    el.addEventListener("loadedmetadata", onMeta)
    el.addEventListener("ended", onEnded)
    return () => {
      el.removeEventListener("timeupdate", onTime)
      el.removeEventListener("loadedmetadata", onMeta)
      el.removeEventListener("ended", onEnded)
    }
  }, [])

  const toggle = () => {
    const el = audioRef.current
    if (!el || !hasAudio) return
    if (playing) {
      el.pause()
      setPlaying(false)
    } else {
      void el.play()
      setPlaying(true)
    }
  }

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current
    if (!el || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    el.currentTime = Math.max(0, Math.min(1, ratio)) * duration
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 bg-accent rounded-lg px-4 py-3 max-w-sm">
      {hasAudio && <audio ref={audioRef} src={src} preload="metadata" />}
      <button
        onClick={toggle}
        disabled={!hasAudio}
        className="w-9 h-9 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
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
        <div
          onClick={hasAudio ? seek : undefined}
          className={`h-1.5 bg-muted rounded-full overflow-hidden ${hasAudio ? "cursor-pointer" : ""}`}
        >
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      {hasAudio && (
        <span className="text-[10px] tabular-nums text-muted-foreground flex-shrink-0">
          {fmt(current)} / {fmt(duration)}
        </span>
      )}
    </div>
  )
}
