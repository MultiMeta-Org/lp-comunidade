import { createBiaServiceClient } from "@/lib/supabase/bia"
import {
  WhatsappConexao,
  WhatsappContatos,
  type ContatoRow,
  type EstadoWhatsapp,
} from "@/components/admin/whatsapp-manager"
import { ListToolbar, hrefCom, type Chip } from "@/components/admin/list-toolbar"
import { Pager } from "@/components/admin/pager"

export const metadata = { title: "WhatsApp · Admin" }

const PAGE_SIZE = 25

/** Mesmo cuidado de acessos/page.tsx: o `or` do PostgREST é uma minilinguagem. */
function termoBusca(q: string): string {
  return q.replace(/[^\p{L}\p{N}@.\-_+ ]/gu, "").trim().slice(0, 80)
}

type Filtro = "todos" | "pendente" | "vinculado" | "bloqueado"

export default async function WhatsappPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>
}) {
  const sp = await searchParams
  const q = termoBusca(sp.q ?? "")
  const status: Filtro =
    sp.status === "pendente" || sp.status === "vinculado" || sp.status === "bloqueado"
      ? sp.status
      : "todos"
  const page = Math.max(1, Number(sp.page) || 1)

  const db = createBiaServiceClient()

  let query = db
    .from("whatsapp_contatos")
    .select("jid, telefone, nome_whatsapp, status, email, origem, vinculado_por, ultima_mensagem_em", {
      count: "exact",
    })
  if (q) query = query.or(`telefone.ilike.%${q}%,email.ilike.%${q}%,nome_whatsapp.ilike.%${q}%`)
  if (status !== "todos") query = query.eq("status", status)

  const desde = (page - 1) * PAGE_SIZE
  const [estado, contatos] = await Promise.all([
    db
      .from("whatsapp_estado")
      .select("status, numero, codigo_pareamento, erro, pedido, atualizado_em")
      .eq("id", 1)
      .maybeSingle(),
    query
      .order("ultima_mensagem_em", { ascending: false, nullsFirst: false })
      .range(desde, desde + PAGE_SIZE - 1),
  ])

  const total = contatos.count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const base = "/admin/whatsapp"
  const chips: Chip[] = (["todos", "pendente", "vinculado", "bloqueado"] as const).map((s) => ({
    label: {
      todos: "Todos",
      pendente: "Não reconhecidos",
      vinculado: "Vinculados",
      bloqueado: "Bloqueados",
    }[s],
    href: hrefCom(base, { q, status: s === "todos" ? undefined : s }),
    active: status === s,
  }))

  return (
    <section className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-foreground">WhatsApp da BIA</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A aluna que manda mensagem do mesmo número que usou na compra é reconhecida
          sozinha. Quem comprou com outro número aparece em &ldquo;Não reconhecidos&rdquo;:
          vincule ao e-mail dela aqui. A BIA confere o acesso a cada mensagem, então
          reembolso corta o WhatsApp também.
        </p>
      </div>

      {estado.error ? (
        <p className="text-xs text-destructive">
          Erro ao ler a conexão: {estado.error.message}
        </p>
      ) : (
        <WhatsappConexao estado={(estado.data as EstadoWhatsapp | null) ?? null} />
      )}

      <div className="space-y-5">
        <h3 className="font-display text-lg font-bold text-foreground">Contatos</h3>

        {contatos.error && (
          <p className="text-xs text-destructive">
            Erro ao carregar os contatos: {contatos.error.message}
          </p>
        )}

        <ListToolbar
          basePath={base}
          q={q}
          placeholder="Buscar por telefone, e-mail ou nome…"
          hidden={{ status: status === "todos" ? undefined : status }}
          limparHref={hrefCom(base, { status: status === "todos" ? undefined : status })}
          chipGroups={[chips]}
        />

        <WhatsappContatos rows={(contatos.data ?? []) as ContatoRow[]} />

        <Pager
          basePath={base}
          params={{ q: sp.q, status: status === "todos" ? undefined : status }}
          page={Math.min(page, totalPages)}
          totalPages={totalPages}
          total={total}
          unidade={["contato", "contatos"]}
        />
      </div>
    </section>
  )
}
