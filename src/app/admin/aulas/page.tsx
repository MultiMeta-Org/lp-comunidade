import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { getLessonStats } from "@/lib/progress-server"
import { MATERIAL_NAME, PLANTAO_NAME } from "@/lib/produto"
import {
  LessonsManager,
  type LessonRow,
  type LessonStatsRow,
} from "@/components/admin/lessons-manager"
import { ListToolbar, hrefCom, type Chip } from "@/components/admin/list-toolbar"
import { Pager } from "@/components/admin/pager"
import type { Database } from "@/lib/supabase/database.types"

export const metadata = { title: "Aulas · Admin" }

const PAGE_SIZE = 20

type LessonDbRow = Database["comunidade"]["Tables"]["lessons"]["Row"]
type Filtro = "todas" | "publicadas" | "rascunhos" | "abertas"

/** Busca livre dentro de um `or` do PostgREST — ver nota em acessos/page.tsx. */
function termoBusca(q: string): string {
  return q.replace(/[^\p{L}\p{N}@.\-_+ ]/gu, "").trim().slice(0, 80)
}

function toRow(l: LessonDbRow): LessonRow {
  return {
    id: l.id,
    dia: l.dia,
    isoDate: l.iso_date,
    weekday: l.weekday,
    topic: l.topic,
    category: l.category,
    description: l.description,
    pdfUrl: l.pdf_url ?? "",
    audioUrl: l.audio_url ?? "",
    videoUrl: l.video_url ?? "",
    published: l.published,
    openToAll: l.open_to_all,
  }
}

export default async function AdminAulasPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}) {
  const sp = await searchParams
  const q = termoBusca(sp.q ?? "")
  const status: Filtro =
    sp.status === "publicadas" || sp.status === "rascunhos" || sp.status === "abertas"
      ? sp.status
      : "todas"
  const page = Math.max(1, Number(sp.page) || 1)

  const db = createComunidadeServiceClient()

  let query = db.from("lessons").select("*", { count: "exact" })
  if (q) query = query.or(`topic.ilike.%${q}%,category.ilike.%${q}%`)
  if (status === "publicadas") query = query.eq("published", true)
  if (status === "rascunhos") query = query.eq("published", false)
  if (status === "abertas") query = query.eq("open_to_all", true)

  const desde = (page - 1) * PAGE_SIZE
  const [{ data, count, error }, { data: todas }] = await Promise.all([
    query.order("sort_order", { ascending: false }).range(desde, desde + PAGE_SIZE - 1),
    // Três colunas da base inteira: é de onde saem o próximo número/id e as
    // categorias já usadas. Derivar isso da página visível daria "Aula 1" de
    // novo na página 2.
    db.from("lessons").select("id, dia, category"),
  ])

  const rows = (data ?? []).map(toRow)
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const stats = await getLessonStats(rows.map((r) => r.id))
  const statsPorId: Record<string, LessonStatsRow | undefined> = Object.fromEntries(
    rows.map((r) => [r.id, stats.get(r.id)])
  )

  const base = todas ?? []
  const nextDia = base.reduce((max, l) => Math.max(max, l.dia), 0) + 1
  // id é chave estável, desacoplada do número exibido (recompactado ao excluir):
  // deriva do maior sufixo já usado para nunca colidir nem reaproveitar.
  const maxIdNum = base.reduce((max, l) => {
    const n = Number(String(l.id).replace(/^dia-/, ""))
    return Number.isFinite(n) ? Math.max(max, n) : max
  }, 0)
  const categorias = [...new Set(base.map((l) => l.category).filter(Boolean))]

  const chips: Chip[] = (["todas", "publicadas", "rascunhos", "abertas"] as const).map(
    (f) => ({
      label: {
        todas: "Todas",
        publicadas: "Publicadas",
        rascunhos: "Rascunhos",
        abertas: "Abertas para todas",
      }[f],
      href: hrefCom("/admin/aulas", { q, status: f === "todas" ? undefined : f }),
      active: status === f,
    })
  )

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">Conteúdo</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Crie e edite as aulas sem precisar de código. Marque uma aula como
          aberta para liberar o vídeo dela a todas as alunas — é assim que o{" "}
          {PLANTAO_NAME} sai de dentro da assinatura sem levar o PDF junto.
        </p>
        <Link
          href="/aulas"
          className="group mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Ver o {MATERIAL_NAME} como a aluna vê
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      {error && (
        <p className="text-xs text-destructive">Erro ao carregar as aulas: {error.message}</p>
      )}

      <ListToolbar
        basePath="/admin/aulas"
        q={q}
        placeholder="Buscar por tópico ou categoria…"
        hidden={{ status: status === "todas" ? undefined : status }}
        limparHref={hrefCom("/admin/aulas", {
          status: status === "todas" ? undefined : status,
        })}
        chipGroups={[chips]}
      />

      <LessonsManager
        rows={rows}
        nextDia={nextDia}
        nextId={`dia-${maxIdNum + 1}`}
        categorias={categorias}
        stats={statsPorId}
      />

      <Pager
        basePath="/admin/aulas"
        params={{ q, status: status === "todas" ? undefined : status }}
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        total={total}
        unidade={["aula", "aulas"]}
      />
    </section>
  )
}
