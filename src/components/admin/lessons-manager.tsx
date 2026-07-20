"use client"

import { useEffect, useState, useTransition } from "react"
import { Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CATEGORIES, categoryLabel, weekdayFromIso } from "@/lib/lessons"
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
  category: "",
  description: "",
  pdfUrl: "",
  audioUrl: "",
  published: true,
}

export function LessonsManager({ rows }: { rows: LessonRow[] }) {
  const [draft, setDraft] = useState<LessonRow | null>(null)
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof LessonRow>(key: K, value: LessonRow[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d))

  // Número exibido da próxima aula: incrementa a partir do maior existente (issue #7).
  const nextDia = rows.reduce((max, r) => Math.max(max, r.dia), 0) + 1

  // id é uma chave estável, desacoplada do número exibido (que é recompactado ao
  // excluir). Deriva do maior sufixo já usado para nunca colidir/reaproveitar.
  const maxIdNum = rows.reduce((max, r) => {
    const n = Number(String(r.id).replace(/^dia-/, ""))
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  const nextId = `dia-${maxIdNum + 1}`

  // Rótulos sugeridos: os fixos + os que já foram criados à mão (issue #8).
  const knownLabels: string[] = Object.values(CATEGORIES)
  const extraCategories = [...new Set(rows.map((r) => r.category))].filter(
    (c) => c && !knownLabels.includes(c)
  )

  const close = () => setDraft(null)

  const startNew = () => {
    setError("")
    setEditing(false)
    setDraft({ ...EMPTY, dia: nextDia, id: nextId })
  }

  const startEdit = (row: LessonRow) => {
    setError("")
    setEditing(true)
    setDraft(row)
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft) return
    setError("")
    startTransition(async () => {
      const res = await upsertLesson(draft)
      if (!res.ok) setError(res.error || "Erro ao salvar.")
      else close()
    })
  }

  const remove = (row: LessonRow) => {
    if (!confirm(`Excluir a Aula ${row.dia}? As demais serão renumeradas.`)) return
    setError("")
    startTransition(async () => {
      const res = await deleteLesson(row.id)
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
        <Button onClick={startNew} disabled={pending}>
          Nova aula
        </Button>
      </div>

      {!draft && error && <p className="text-xs text-destructive">{error}</p>}

      {draft && (
        <Modal
          title={editing ? `Editar Aula ${draft.dia}` : "Nova aula"}
          onClose={close}
        >
          <form onSubmit={save} className="grid gap-4">
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Número da aula">
              <div className="flex h-10 items-center rounded-md border border-input bg-muted/40 px-3 text-sm text-muted-foreground">
                Aula {draft.dia}
                {draft.isoDate ? ` · ${weekdayFromIso(draft.isoDate)}` : ""}
              </div>
            </Field>
            <Field label="Data">
              <Input
                type="date"
                value={draft.isoDate}
                onChange={(e) => set("isoDate", e.target.value)}
                required
              />
            </Field>
            <Field label="Categoria">
              <Input
                list="lesson-categories"
                value={draft.category}
                onChange={(e) => set("category", e.target.value)}
                placeholder="Escolha ou digite uma nova"
              />
              <datalist id="lesson-categories">
                {knownLabels.map((v) => (
                  <option key={v} value={v} />
                ))}
                {extraCategories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
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
              <Button type="button" variant="outline" onClick={close} disabled={pending}>
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Nº da aula</th>
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
              <tr
                key={l.id}
                className="border-b border-border last:border-0 hover:bg-accent transition-colors"
              >
                <td className="px-4 py-3 text-muted-foreground">{l.dia}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{l.topic}</div>
                  <div className="text-xs text-muted-foreground">{l.isoDate}</div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{categoryLabel(l.category)}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(l.id, !l.published)}
                    disabled={pending}
                    className={`cursor-pointer rounded px-2 py-0.5 text-[11px] font-semibold ${
                      l.published
                        ? "bg-primary-subtle text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {l.published ? "Sim" : "Não"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button variant="outline" size="sm" onClick={() => startEdit(l)} disabled={pending}>
                    Editar
                  </Button>{" "}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(l)}
                    disabled={pending}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
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

function Modal({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: React.ReactNode
}) {
  // Fecha no Esc e trava o scroll do body enquanto o modal está aberto.
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="relative my-auto w-full max-w-2xl rounded-2xl border border-border bg-card shadow-xl"
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
    </div>
  )
}
