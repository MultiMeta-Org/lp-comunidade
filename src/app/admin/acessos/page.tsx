import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { waitingPeriodDays } from "@/lib/access"
import { LAB_NAME } from "@/lib/produto"
import { AccessManager, type AuthorizedRow } from "@/components/admin/access-manager"
import { ListToolbar, hrefCom, type Chip } from "@/components/admin/list-toolbar"
import { Pager } from "@/components/admin/pager"

export const metadata = { title: "Acessos · Admin" }

const PAGE_SIZE = 25

/**
 * Busca segura dentro de um filtro `or` do PostgREST.
 *
 * O `or=(a.ilike.*q*,b.ilike.*q*)` é uma MINILINGUAGEM: vírgula separa termos e
 * parêntese fecha o grupo, então um e-mail colado com vírgula viraria filtro
 * novo, não texto buscado. Sobra o que compõe nome e e-mail.
 */
function termoBusca(q: string): string {
  return q.replace(/[^\p{L}\p{N}@.\-_+ ]/gu, "").trim().slice(0, 80)
}

type Filtro = "todos" | "ativos" | "revogados"

type EmailRow = {
  email: string
  status: "active" | "revoked"
  source: string | null
  authorized_at: string
  buyer_name: string | null
  has_comunidade_vip: boolean
}

/**
 * Linha do banco → linha da tela. Função fora do componente porque lê o relógio
 * (`Date.now`), e ler o relógio no corpo de um componente é impuro — a regra de
 * pureza do React reclama, e com razão: dois renders dariam respostas diferentes.
 */
function toRows(emails: EmailRow[], waitDays: number): AuthorizedRow[] {
  const now = Date.now()
  return emails.map((e) => {
    const availableAtMs =
      new Date(e.authorized_at).getTime() + waitDays * 24 * 60 * 60 * 1000
    return {
      email: e.email,
      buyerName: e.buyer_name,
      source: e.source,
      state:
        e.status === "revoked" ? "revoked" : now < availableAtMs ? "waiting" : "released",
      availableAt: new Date(availableAtMs).toISOString(),
      hasLab: e.has_comunidade_vip === true,
    }
  })
}

export default async function AcessosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; lab?: string }>
}) {
  const sp = await searchParams
  const q = termoBusca(sp.q ?? "")
  const status: Filtro =
    sp.status === "ativos" || sp.status === "revogados" ? sp.status : "todos"
  const lab = sp.lab === "sim" || sp.lab === "nao" ? sp.lab : undefined
  const page = Math.max(1, Number(sp.page) || 1)

  const db = createComunidadeServiceClient()

  let query = db
    .from("authorized_emails")
    .select(
      "email, status, source, authorized_at, revoked_at, buyer_name, has_comunidade_vip",
      { count: "exact" }
    )

  if (q) query = query.or(`email.ilike.%${q}%,buyer_name.ilike.%${q}%`)
  if (status === "ativos") query = query.eq("status", "active")
  if (status === "revogados") query = query.eq("status", "revoked")
  if (lab) query = query.eq("has_comunidade_vip", lab === "sim")

  const desde = (page - 1) * PAGE_SIZE
  const { data, count, error } = await query
    .order("authorized_at", { ascending: false })
    .range(desde, desde + PAGE_SIZE - 1)

  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const waitDays = waitingPeriodDays()
  const rows = toRows(data ?? [], waitDays)

  // Os filtros são links: cada chip é o recorte atual com UM eixo trocado, e
  // clicar no que já está ativo desliga aquele eixo.
  const base = "/admin/acessos"
  const statusChips: Chip[] = (["todos", "ativos", "revogados"] as const).map((s) => ({
    label: { todos: "Todos", ativos: "Ativos", revogados: "Revogados" }[s],
    href: hrefCom(base, { q, status: s === "todos" ? undefined : s, lab }),
    active: status === s,
  }))
  const labChips: Chip[] = (["sim", "nao"] as const).map((v) => ({
    label: v === "sim" ? `Com o ${LAB_NAME}` : `Sem o ${LAB_NAME}`,
    href: hrefCom(base, {
      q,
      status: status === "todos" ? undefined : status,
      lab: lab === v ? undefined : v,
    }),
    active: lab === v,
  }))

  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Acessos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Compras do Hotmart entram automáticas (liberam {waitDays} dias após a
          compra). Reembolso/chargeback revoga sozinho. Aqui você adiciona à mão
          e também dá ou tira o {LAB_NAME}.
        </p>
      </div>

      {error && (
        <p className="text-xs text-destructive">
          Erro ao carregar os acessos: {error.message}
        </p>
      )}

      <ListToolbar
        basePath="/admin/acessos"
        q={q}
        placeholder="Buscar por e-mail ou nome…"
        hidden={{ status: status === "todos" ? undefined : status, lab }}
        limparHref={hrefCom("/admin/acessos", {
          status: status === "todos" ? undefined : status,
          lab,
        })}
        chipGroups={[statusChips, labChips]}
      />

      <AccessManager rows={rows} />

      <Pager
        basePath="/admin/acessos"
        params={{ q: sp.q, status: status === "todos" ? undefined : status, lab }}
        page={Math.min(page, totalPages)}
        totalPages={totalPages}
        total={total}
        unidade={["acesso", "acessos"]}
      />
    </section>
  )
}
