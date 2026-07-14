"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Headphones } from "lucide-react"
import { type Lesson, type CategoryKey, CATEGORIES } from "@/lib/lessons"

const ALL = "all"
type FilterValue = typeof ALL | CategoryKey

export function Library({ lessons }: { lessons: Lesson[] }) {
  const [filter, setFilter] = useState<FilterValue>(ALL)

  const available = [...new Set(lessons.map((l) => l.category))]
  const filtered =
    filter === ALL ? lessons : lessons.filter((l) => l.category === filter)

  return (
    <div className="space-y-6">
      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
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
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground py-10 text-center">
          Nenhuma aula nessa categoria ainda.
        </p>
      )}
    </div>
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
