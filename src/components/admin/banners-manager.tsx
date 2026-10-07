"use client"

import { useRef, useState, useTransition } from "react"
import {
  ChevronDown,
  ChevronUp,
  FileCheck2,
  ImageOff,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { supabase } from "@/lib/supabase/client"
import {
  createBannerUploadUrl,
  deleteBanner,
  moveBanner,
  toggleBannerActive,
  upsertBanner,
  type BannerInput,
} from "@/app/admin/banners/actions"

export type BannerRow = {
  id: string
  label: string
  /** Valor GRAVADO (storage://… ou URL externa) — é o que volta no formulário. */
  imageRef: string
  /** URL pronta para a miniatura. Para arquivo do Storage, a pública do bucket. */
  imagePreview: string
  imageMobileRef: string
  imageMobilePreview: string
  href: string
  cta: string
  alt: string
  active: boolean
  /** "AAAA-MM-DD" ou "" — janela de vigência, no fuso de São Paulo. */
  startsOn: string
  endsOn: string
  estado: "no-ar" | "desligado" | "agendado" | "expirado"
}

const ESTADO: Record<BannerRow["estado"], { label: string; cor: string }> = {
  "no-ar": { label: "No ar", cor: "bg-primary-subtle text-primary" },
  desligado: { label: "Desligado", cor: "bg-muted text-muted-foreground" },
  agendado: { label: "Agendado", cor: "bg-warning-subtle text-warning-foreground" },
  expirado: { label: "Expirado", cor: "bg-destructive-subtle text-destructive" },
}

const VAZIO: BannerInput = {
  id: null,
  label: "",
  imageUrl: "",
  imageMobileUrl: "",
  href: "",
  cta: "Saiba mais",
  alt: "",
  active: true,
  startsOn: "",
  endsOn: "",
}

/** Limite do bucket `banners` (ver migration). Arte de carrossel cabe folgada. */
const MAX_BYTES = 10 * 1024 * 1024

export function BannersManager({ rows }: { rows: BannerRow[] }) {
  const [draft, setDraft] = useState<BannerInput | null>(null)
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof BannerInput>(key: K, value: BannerInput[K]) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d))

  const novo = () => {
    setError("")
    setDraft({ ...VAZIO })
  }

  const editar = (row: BannerRow) => {
    setError("")
    setDraft({
      id: row.id,
      label: row.label,
      imageUrl: row.imageRef,
      imageMobileUrl: row.imageMobileRef,
      href: row.href,
      cta: row.cta,
      alt: row.alt,
      active: row.active,
      startsOn: row.startsOn,
      endsOn: row.endsOn,
    })
  }

  const salvar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft) return
    setError("")
    startTransition(async () => {
      const res = await upsertBanner(draft)
      if (!res.ok) setError(res.error || "Erro ao salvar.")
      else setDraft(null)
    })
  }

  const excluir = (row: BannerRow) => {
    if (!confirm(`Excluir o banner "${row.label || row.cta}"? A imagem também sai.`)) return
    setError("")
    startTransition(async () => {
      const res = await deleteBanner(row.id)
      if (!res.ok) setError(res.error || "Erro ao excluir.")
    })
  }

  const acao = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError("")
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error || "Erro na operação.")
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-end">
        <Button onClick={novo} disabled={pending}>
          Novo banner
        </Button>
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {draft && (
        <Modal
          title={draft.id ? "Editar banner" : "Novo banner"}
          onClose={() => setDraft(null)}
        >
          <form onSubmit={salvar} className="grid gap-4">
            {error && <p className="text-xs text-destructive">{error}</p>}

            <Campo
              label="Nome interno"
              dica="Só para você reconhecer na lista — não aparece no site."
            >
              <Input
                value={draft.label}
                onChange={(e) => set("label", e.target.value)}
                placeholder="Promoção de outubro"
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImagemField
                label="Imagem (desktop)"
                dica="Faixa larga, algo como 1600×600."
                value={draft.imageUrl}
                onChange={(v) => set("imageUrl", v)}
              />
              <ImagemField
                label="Imagem (celular)"
                dica="Opcional. Sem ela, a de desktop entra cortada nas laterais."
                value={draft.imageMobileUrl}
                onChange={(v) => set("imageMobileUrl", v)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo label="Link do botão" dica="https://… ou /rota do portal.">
                <Input
                  value={draft.href}
                  onChange={(e) => set("href", e.target.value)}
                  placeholder="https://..."
                  required
                />
              </Campo>
              <Campo label="Texto do botão">
                <Input
                  value={draft.cta}
                  onChange={(e) => set("cta", e.target.value)}
                  placeholder="Saiba mais"
                />
              </Campo>
            </div>

            <Campo
              label="Descrição da imagem"
              dica="Lida por leitor de tela e exibida se a imagem não carregar."
            >
              <Input
                value={draft.alt}
                onChange={(e) => set("alt", e.target.value)}
                placeholder="Turma de outubro do Laboratório de Vendas"
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-3">
              <Campo label="Começa em" dica="Vazio = já vale.">
                <Input
                  type="date"
                  value={draft.startsOn}
                  onChange={(e) => set("startsOn", e.target.value)}
                />
              </Campo>
              <Campo label="Fica até" dica="Vazio = sem prazo.">
                <Input
                  type="date"
                  value={draft.endsOn}
                  onChange={(e) => set("endsOn", e.target.value)}
                />
              </Campo>
              <Campo label="Ligado">
                <label className="flex h-10 items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={draft.active}
                    onChange={(e) => set("active", e.target.checked)}
                  />
                  aparece no carrossel
                </label>
              </Campo>
            </div>

            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Salvando..." : "Salvar banner"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDraft(null)}
                disabled={pending}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-5 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum banner cadastrado. A home está mostrando só os slides fixos —
            o que é um estado válido, não um erro.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((row, i) => (
            <li
              key={row.id}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center"
            >
              <Miniatura src={row.imagePreview} alt={row.alt} />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">
                    {row.label || "(sem nome)"}
                  </p>
                  <span
                    className={`rounded px-2 py-0.5 text-[11px] font-semibold ${ESTADO[row.estado].cor}`}
                  >
                    {ESTADO[row.estado].label}
                  </span>
                  {row.imageMobileRef && (
                    <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                      tem arte de celular
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {row.cta} → {row.href}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {row.startsOn || row.endsOn
                    ? `${row.startsOn ? `de ${br(row.startsOn)}` : "desde sempre"} ${
                        row.endsOn ? `até ${br(row.endsOn)}` : "sem prazo"
                      }`
                    : "sem janela de datas"}
                </p>
              </div>

              <div className="flex flex-none items-center gap-1.5">
                <IconBtn
                  label="Subir"
                  disabled={pending || i === 0}
                  onClick={() => acao(() => moveBanner(row.id, "up"))}
                >
                  <ChevronUp className="h-4 w-4" />
                </IconBtn>
                <IconBtn
                  label="Descer"
                  disabled={pending || i === rows.length - 1}
                  onClick={() => acao(() => moveBanner(row.id, "down"))}
                >
                  <ChevronDown className="h-4 w-4" />
                </IconBtn>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => acao(() => toggleBannerActive(row.id, !row.active))}
                >
                  {row.active ? "Desligar" : "Ligar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => editar(row)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={pending}
                  onClick={() => excluir(row)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** "2026-10-31" → "31/10/2026" (sem passar por Date, que mexeria no fuso). */
function br(iso: string): string {
  const [y, m, d] = iso.split("-")
  return `${d}/${m}/${y}`
}

function Miniatura({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="flex h-20 w-full flex-none items-center justify-center rounded-xl border border-border bg-muted text-muted-foreground sm:w-36">
        <ImageOff className="h-5 w-5" />
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-20 w-full flex-none rounded-xl border border-border object-cover sm:w-36"
    />
  )
}

/**
 * Campo de imagem: envia o arquivo direto ao bucket público `banners` (signed
 * upload URL, sem passar pelo servidor Next) OU aceita uma URL já hospedada.
 */
function ImagemField({
  label,
  dica,
  value,
  onChange,
}: {
  label: string
  dica: string
  value: string
  onChange: (v: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [err, setErr] = useState("")

  const enviado = value.startsWith("storage://")

  const onFile = async (file: File | undefined) => {
    if (inputRef.current) inputRef.current.value = ""
    if (!file) return
    setErr("")

    if (file.size > MAX_BYTES) {
      setErr("Imagem acima de 10 MB — exporte em JPG/WebP com menos qualidade.")
      return
    }

    setEnviando(true)
    try {
      const res = await createBannerUploadUrl(file.name)
      if (!res.ok) {
        setErr(res.error)
        return
      }
      const { error } = await supabase.storage
        .from(res.bucket)
        .uploadToSignedUrl(res.path, res.token, file)
      if (error) {
        setErr(error.message)
        return
      }
      onChange(res.ref)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Campo label={label} dica={dica}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {enviado ? (
        <div className="flex h-10 items-center justify-between gap-2 rounded-md border border-input bg-muted/40 px-3 text-sm">
          <span className="flex items-center gap-1.5 text-foreground">
            <FileCheck2 className="h-4 w-4 text-primary" />
            Imagem enviada
          </span>
          <button
            type="button"
            onClick={() => onChange("")}
            className="cursor-pointer text-xs text-muted-foreground hover:text-destructive"
          >
            Remover
          </button>
        </div>
      ) : (
        <>
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Cole uma URL ou envie o arquivo"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="w-fit"
          >
            {enviando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Enviando…
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Enviar imagem
              </>
            )}
          </Button>
        </>
      )}
      {err && <p className="text-xs text-destructive">{err}</p>}
    </Campo>
  )
}

function Campo({
  label,
  dica,
  children,
}: {
  label: string
  dica?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
      {dica && <p className="text-xs text-muted-foreground">{dica}</p>}
    </div>
  )
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}
