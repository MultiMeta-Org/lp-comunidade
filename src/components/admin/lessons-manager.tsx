"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORIES, type CategoryKey } from "@/lib/lessons"
import {
  upsertLesson,
  deleteLesson,
  togglePublished,
  type LessonInput,
} from "@/app/admin/lessons/actions"

export type LessonRow = LessonInput

const EMPTY: LessonRow = {
  id: "",
  dia: 0,
  isoDate: "",
  weekday: "",
  topic: "",
  category: "objecao",
  description: "",
  pdfUrl: "",
  audioUrl: "",
  published: true,
}

export function LessonsManager({ rows }: { rows: LessonRow[] }) {
  const [draft, setDraft] = useState<LessonRow | null>(null)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof LessonRow>(key: K, value: LessonRow[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d))

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft) return
    setError("")
    startTransition(async () => {
      const res = await upsertLesson(draft)
      if (!res.ok) setError(res.error || "Erro ao salvar.")
      else setDraft(null)
    })
  }

  const remove = (id: string) => {
    if (!confirm(`Excluir a aula ${id}?`)) return
    setError("")
    startTransition(async () => {
      const res = await deleteLesson(id)
      if (!res.ok) setError(res.error || "Erro ao excluir.")
    })
  }

  const toggle = (id: string, next: boolean) => {
    startTransition(async () => {
      await togglePublished(id, next)
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{rows.length} aula(s)</p>
        <Button onClick={() => setDraft({ ...EMPTY })} disabled={pending}>
          Nova aula
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {draft && (
        <form onSubmit={save} className="grid gap-4 rounded-xl border border-border bg-card p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="ID (ex.: dia-13)">
              <Input value={draft.id} onChange={(e) => set("id", e.target.value)} required />
            </Field>
            <Field label="Dia (número)">
              <Input
                type="number"
                value={draft.dia || ""}
                onChange={(e) => set("dia", Number(e.target.value))}
              />
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={draft.isoDate}
                onChange={(e) => set("isoDate", e.target.value)}
                required
              />
            </Field>
            <Field label="Dia da semana">
              <Input
                placeholder="Segunda"
                value={draft.weekday}
                onChange={(e) => set("weekday", e.target.value)}
              />
            </Field>
            <Field label="Categoria">
              <select
                className="flex h-10 w-full rounded-md border border-input bg-card px-3 text-sm"
                value={draft.category}
                onChange={(e) => set("category", e.target.value as CategoryKey)}
              >
                {Object.entries(CATEGORIES).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Publicada">
              <label className="flex h-10 items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft.published}
                  onChange={(e) => set("published", e.target.checked)}
                />
                visível para as alunas
              </label>
            </Field>
          </div>

          <Field label="Tópico">
            <Input value={draft.topic} onChange={(e) => set("topic", e.target.value)} required />
          </Field>
          <Field label="Descrição">
            <textarea
              className="flex min-h-20 w-full rounded-md border border-input bg-card px-3 py-2 text-sm"
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="URL do PDF">
              <Input value={draft.pdfUrl} onChange={(e) => set("pdfUrl", e.target.value)} placeholder="https://..." />
            </Field>
            <Field label="URL do áudio">
              <Input value={draft.audioUrl} onChange={(e) => set("audioUrl", e.target.value)} placeholder="https://..." />
            </Field>
          </div>
          {/* TODO: upload direto de arquivo para o Storage (buckets pdfs/audios). */}

          <div className="flex gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar aula"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setDraft(null)} disabled={pending}>
              Cancelar
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Dia</th>
              <th className="px-4 py-3 font-semibold">Tópico</th>
              <th className="px-4 py-3 font-semibold">Categoria</th>
              <th className="px-4 py-3 font-semibold">Publicada</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhuma aula ainda.
                </td>
              </tr>
            )}
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{l.dia}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{l.topic}</div>
                  <div className="text-xs text-muted-foreground">{l.isoDate}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{CATEGORIES[l.category]}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(l.id, !l.published)}
                    disabled={pending}
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                      l.published
                        ? "bg-primary-subtle text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {l.published ? "Sim" : "Não"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button variant="outline" size="sm" onClick={() => setDraft(l)} disabled={pending}>
                    Editar
                  </Button>{" "}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(l.id)}
                    disabled={pending}
                    className="text-destructive"
                  >
                    Excluir
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
