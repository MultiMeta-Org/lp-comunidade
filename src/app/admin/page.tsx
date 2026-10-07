import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { bannerNoAr } from "@/lib/banners-server"
import { LAB_NAME, MATERIAL_NAME, PLANTAO_NAME } from "@/lib/produto"
import { SyncStatus, type SyncRun } from "@/components/admin/sync-status"

/** Contagem exata sem trazer linha nenhuma. */
const CONTAGEM = { count: "exact", head: true } as const

export default async function AdminOverviewPage() {
  const db = createComunidadeServiceClient()

  const [
    { data: syncRun },
    { count: ativasRaw },
    { count: comLabRaw },
    { count: publicadasRaw },
    { count: abertasRaw },
    { data: banners },
  ] = await Promise.all([
    // Última rodada do sync com a Hotmart — é o que prova que o acesso das
    // compradoras está sendo conferido contra a fonte.
    db
      .from("vip_sync_runs")
      .select("ran_at, ok, vendas_lidas, acessos_alterados, alunas_criadas, produtos_desconhecidos, erro")
      .order("ran_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    db.from("authorized_emails").select("*", CONTAGEM).eq("status", "active"),
    db
      .from("authorized_emails")
      .select("*", CONTAGEM)
      .eq("status", "active")
      .eq("has_comunidade_vip", true),
    db.from("lessons").select("*", CONTAGEM).eq("published", true),
    db
      .from("lessons")
      .select("*", CONTAGEM)
      .eq("published", true)
      .eq("open_to_all", true),
    db.from("banners").select("active, starts_at, ends_at"),
  ])

  const ativas = ativasRaw ?? 0
  const comLab = comLabRaw ?? 0
  const publicadas = publicadasRaw ?? 0
  const abertas = abertasRaw ?? 0

  const noAr = (banners ?? []).filter(
    (b) => b.active && bannerNoAr({ startsAt: b.starts_at, endsAt: b.ends_at })
  ).length

  return (
    <>
      <SyncStatus run={(syncRun as SyncRun | null) ?? null} />

      <section className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Visão geral</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            O estado do portal agora. Cada número leva para onde se mexe nele.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Numero
            valor={ativas}
            label="Alunas com acesso"
            nota="ativas, sem reembolso"
            href="/admin/acessos"
          />
          <Numero
            valor={comLab}
            label={`Com o ${LAB_NAME}`}
            nota={
              ativas > 0
                ? `${Math.round((comLab / ativas) * 100)}% das alunas ativas`
                : "ninguém ainda"
            }
            href="/admin/acessos?lab=sim"
          />
          <Numero
            valor={publicadas}
            label="Aulas publicadas"
            nota={`${abertas} aberta(s) para todas`}
            href="/admin/aulas"
          />
          <Numero
            valor={noAr}
            label="Banners no ar"
            nota={`de ${(banners ?? []).length} cadastrado(s)`}
            href="/admin/banners"
          />
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          O carrossel da home mostra os banners cadastrados e, depois deles,
          sempre os slides fixos do código — então ele nunca fica vazio, mesmo
          com zero banner no ar.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-serif text-xl font-bold text-foreground">Conferir como a aluna vê</h2>
        <p className="text-sm text-muted-foreground">
          O admin entra no acervo sem ter a assinatura — é quem publica a aula
          que precisa ver o resultado.
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Externo href="/aulas">{MATERIAL_NAME}</Externo>
          <Externo href="/">Home do portal</Externo>
        </div>
        <p className="text-xs text-muted-foreground">
          Para ver o que a aluna SEM a assinatura vê (só o {PLANTAO_NAME}), use
          uma conta de teste sem o {LAB_NAME} — o admin vê sempre o acervo
          inteiro.
        </p>
      </section>
    </>
  )
}

function Numero({
  valor,
  label,
  nota,
  href,
}: {
  valor: number
  label: string
  nota: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/45 hover:shadow-md"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-colors duration-300 group-hover:bg-primary-subtle/35"
      />
      <div className="relative">
        <p className="font-serif text-3xl font-bold leading-none text-foreground">{valor}</p>
        <p className="mt-2 text-sm font-semibold text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{nota}</p>
      </div>
    </Link>
  )
}

function Externo({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </Link>
  )
}
