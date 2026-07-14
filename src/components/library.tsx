"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  FileText,
  Headphones,
  Search,
  LayoutGrid,
  List as ListIcon,
  X,
} from "lucide-react"
import { type Lesson, type CategoryKey, CATEGORIES } from "@/lib/lessons"

const ALL = "all"
type FilterValue = typeof ALL | CategoryKey
type ViewMode = "grid" | "list"

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
}

export function Library({ lessons }: { lessons: Lesson[] }) {
  const [filter, setFilter] = useState<FilterValue>(ALL)
  const [query, setQuery] = useState("")
  const [view, setView] = useState<ViewMode>("grid")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")

  const available = [...new Set(lessons.map((l) => l.category))]

  const filtered = useMemo(() => {
    const q = normalize(query.trim())
    return lessons.filter((l) => {
      if (filter !== ALL && l.category !== filter) return false
      if (from && l.isoDate < from) return false
      if (to && l.isoDate > to) return false
      if (q) {
        const haystack = normalize(
          `${l.topic} ${l.description} ${CATEGORIES[l.category]}`
        )
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [lessons, filter, query, from, to])

  const dateActive = Boolean(from || to)

  return (
    <div className="space-y-6">
      {/* Search + view toggle */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar aula por tema…"
            className="w-full rounded-full border border-border bg-card pl-9 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-muted-foreground transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              aria-label="Limpar busca"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center rounded-full border border-border bg-card p-1">
          <ViewButton
            active={view === "grid"}
            onClick={() => setView("grid")}
            label="Grade"
            icon={LayoutGrid}
          />
          <ViewButton
            active={view === "list"}
            onClick={() => setView("list")}
            label="Lista"
            icon={ListIcon}
          />
        </div>
      </div>

      {/* Category pills + date filter */}
      <div className="flex flex-wrap items-center gap-2">
        <FilterPill
          label="Todos"
          active={filter === ALL}
          onClick={() => setFilter(ALL)}
        />
        {available.map((cat) => (
          <FilterPill
            key={cat}
            label={CATEGORIES[cat]}
            active={filter === cat}
            onClick={() => setFilter(cat)}
          />
        ))}

        <div className="flex items-center gap-1.5 ml-auto text-xs text-muted-foreground">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            aria-label="Data inicial"
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-muted-foreground transition-colors"
          />
          <span>–</span>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-label="Data final"
            className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-muted-foreground transition-colors"
          />
          {dateActive && (
            <button
              onClick={() => {
                setFrom("")
                setTo("")
              }}
              aria-label="Limpar datas"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {filtered.length > 0 ? (
        view === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
            {filtered.map((lesson) => (
              <LessonRow key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )
      ) : (
        <p className="text-sm text-muted-foreground py-10 text-center">
          Nenhuma aula encontrada com esses filtros.
        </p>
      )}
    </div>
  )
}

function ViewButton({
  active,
  onClick,
  label,
  icon: Icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ElementType
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-card text-muted-foreground border-border hover:border-muted-foreground"
      }`}
    >
      {label}
    </button>
  )
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      href={`/dia/${lesson.id}`}
      className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 hover:shadow-md hover:border-muted-foreground transition-all"
    >
      {/* Signature: giant faded day number */}
      <span
        className="absolute right-2 bottom-0 font-serif font-bold text-foreground pointer-events-none select-none leading-none"
        style={{ fontSize: "7rem", opacity: 0.07 }}
        aria-hidden
      >
        {lesson.dia}
      </span>

      <div className="relative">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {lesson.weekday} · {lesson.date}
        </p>

        <span className="inline-block text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-accent text-muted-foreground mb-3">
          {CATEGORIES[lesson.category]}
        </span>

        <h3 className="text-sm font-semibold text-foreground leading-snug mb-5 line-clamp-3">
          {lesson.topic}
        </h3>

        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="flex items-center gap-1 text-[11px]">
            <Headphones className="w-3.5 h-3.5" />
            Áudio
          </span>
          <span className="flex items-center gap-1 text-[11px]">
            <FileText className="w-3.5 h-3.5" />
            PDF
          </span>
        </div>
      </div>
    </Link>
  )
}

function LessonRow({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      href={`/dia/${lesson.id}`}
      className="group flex items-center gap-4 px-4 py-3.5 hover:bg-accent transition-colors"
    >
      {/* Day number */}
      <span className="font-serif font-bold text-lg text-muted-foreground w-8 text-center flex-shrink-0 leading-none">
        {lesson.dia}
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            {lesson.weekday} · {lesson.date}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-accent text-muted-foreground">
            {CATEGORIES[lesson.category]}
          </span>
        </div>
        <h3 className="text-sm font-semibold text-foreground leading-snug truncate">
          {lesson.topic}
        </h3>
      </div>

      <div className="hidden sm:flex items-center gap-3 text-muted-foreground flex-shrink-0">
        <Headphones className="w-4 h-4" />
        <FileText className="w-4 h-4" />
      </div>
    </Link>
  )
}
