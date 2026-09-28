"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Highlight } from "@/lib/home"

const AUTOPLAY_MS = 6000

/**
 * Carrossel de novidades do topo da home: slides de lado a lado, com o texto
 * na esquerda sobre o gradiente escuro. Troca sozinho a cada 6s, pausa no
 * hover/foco e fica parado quando a aluna pede menos movimento.
 */
export function NewsCarousel({ highlights }: { highlights: Highlight[] }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduceMotion = useRef(false)

  const count = highlights.length

  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  )

  useEffect(() => {
    reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }, [])

  useEffect(() => {
    if (paused || count < 2 || reduceMotion.current) return
    const t = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS)
    return () => clearInterval(t)
  }, [paused, count])

  if (count === 0) return null

  return (
    <section
      aria-roledescription="carrossel"
      aria-label="Novidades"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative w-full overflow-hidden bg-foreground"
      style={{ height: "clamp(320px, 36vw, 400px)" }}
    >
      {highlights.map((item, i) => (
        <Slide key={item.id} item={item} active={i === index} />
      ))}

      {count > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-20 mx-auto flex max-w-4xl items-center gap-4 px-5">
          <div className="flex gap-1.5" role="tablist" aria-label="Novidades">
            {highlights.map((item, i) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-current={i === index}
                aria-label={`Novidade ${i + 1}: ${item.title}`}
                onClick={() => goTo(i)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  i === index ? "w-10 bg-background" : "w-6 bg-background/35 hover:bg-background/60"
                }`}
              />
            ))}
          </div>

          <div className="ml-auto flex gap-2">
            <Arrow label="Novidade anterior" onClick={() => goTo(index - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Arrow>
            <Arrow label="Próxima novidade" onClick={() => goTo(index + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Arrow>
          </div>
        </div>
      )}
    </section>
  )
}

function Arrow({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-background/30 text-background transition-colors hover:bg-background/15"
    >
      {children}
    </button>
  )
}

function Slide({ item, active }: { item: Highlight; active: boolean }) {
  const external = !item.href.startsWith("/")

  return (
    <article
      aria-hidden={!active}
      className={`absolute inset-0 flex items-center transition-opacity duration-700 ${
        active ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span aria-hidden className="absolute inset-0" style={{ background: item.art }} />
      {/* Véu da esquerda para a direita: o texto sempre fica legível. */}
      <span
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg,rgba(26,24,22,.92) 0%,rgba(26,24,22,.72) 42%,rgba(26,24,22,.15) 100%)",
        }}
      />
      {item.figure && (
        <span
          aria-hidden
          className="pointer-events-none absolute right-[4%] top-1/2 hidden -translate-y-1/2 select-none font-serif font-bold leading-none text-secondary-subtle opacity-[0.16] sm:block"
          style={{ fontSize: "clamp(8rem, 19vw, 16rem)" }}
        >
          {item.figure}
        </span>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-start gap-3 px-5 pb-12 text-background">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary-subtle">
          {item.eyebrow}
        </p>
        <h2
          className="max-w-[17ch] font-serif font-bold leading-[1.08]"
          style={{ fontSize: "clamp(1.6rem, 3.9vw, 2.5rem)" }}
        >
          {item.title}
        </h2>
        <p className="max-w-[40ch] text-sm leading-relaxed text-background/80 line-clamp-3">
          {item.text}
        </p>

        {external ? (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={active ? 0 : -1}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:gap-3 hover:opacity-95"
          >
            {item.cta}
          </a>
        ) : (
          <Link
            href={item.href}
            tabIndex={active ? 0 : -1}
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground transition-all hover:gap-3 hover:opacity-95"
          >
            {item.cta}
          </Link>
        )}
      </div>
    </article>
  )
}
