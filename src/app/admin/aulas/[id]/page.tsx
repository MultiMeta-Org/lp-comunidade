import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Check, Eye, UserX } from "lucide-react"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import {
  getLessonAusentes,
  getLessonPresentes,
  getLessonStats,
  type AlunaProgresso,
} from "@/lib/progress-server"
import { categoryLabel } from "@/lib/lessons"
import { LAB_NAME, PLANTAO_NAME } from "@/lib/produto"

export const metadata = { title: "Presença da aula · Admin" }

/** "14/03, 09:41" — data curta no fuso de São Paulo. */
function quando(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export default async function AulaProgressoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const db = createComunidadeServiceClient()

  const { data: lesson } = await db
    .from("lessons")
    .select("id, dia, topic, category, iso_date, weekday, published, open_to_all")
    .eq("id", id)
    .maybeSingle()

  if (!lesson) notFound()

  const [stats, presentes, ausentes] = await Promise.all([
    getLessonStats([id]),
    getLessonPresentes(id),
    getLessonAusentes(id),
  ])

  const s = stats.get(id) ?? { elegiveis: 0, abriram: 0, concluiram: 0 }
  const concluiram = presentes.filter((p) => p.completedAt)
  const abriramSemConcluir = presentes.filter((p) => !p.completedAt)

  return (
    <section className="space-y-6">
      <div>
        <Link
          href="/admin/aulas"
          className="group inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Aulas
        </Link>

        <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">
          Aula {lesson.dia} · {lesson.topic}
        </h2>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
          <span>
            {lesson.weekday} · {lesson.iso_date}
          </span>
          <span>·</span>
          <span>{categoryLabel(lesson.category)}</span>
          {!lesson.published && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]">
              rascunho
            </span>
          )}
          {lesson.open_to_all && (
            <span className="rounded bg-secondary-subtle px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-secondary">
              aberta para todas
            </span>
          )}
        </p>
        {!lesson.published && (
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-warning-foreground">
            Aula em <b>rascunho</b>: ninguém consegue abrir, então a turma é 0 e
            os números ficam zerados — não é falta da turma, é aula que ainda não
            saiu.
          </p>
        )}
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-muted-foreground">
          A turma desta aula são{" "}
          {lesson.open_to_all
            ? `todas as alunas ativas (ela é do ${PLANTAO_NAME})`
            : `as alunas ativas com o ${LAB_NAME}`}
          , sem contar admins. “Abriu” é o servidor registrando a visita à página
          DESTA aula (passar pelo acervo não conta); “concluiu” é a própria aluna
          marcando — quem assistiu e não marcou aparece como aberta sem concluir.
          Quem perdeu o acesso depois de assistir sai das duas contas.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Numero icon={Eye} valor={s.abriram} total={s.elegiveis} label="Abriram a aula" />
        <Numero icon={Check} valor={s.concluiram} total={s.elegiveis} label="Concluíram" />
        <Numero
          icon={UserX}
          valor={ausentes.length}
          total={s.elegiveis}
          label="Nunca abriram"
          tom="alerta"
        />
      </div>

      <Lista
        titulo="Concluíram"
        vazio="Ninguém marcou esta aula como concluída ainda."
        linhas={concluiram}
      />
      <Lista
        titulo="Abriram e não concluíram"
        vazio="Ninguém nesta situação."
        linhas={abriramSemConcluir}
      />

      <div className="space-y-3">
        <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Nunca abriram ({ausentes.length})
        </h3>
        {ausentes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Toda a turma já abriu esta aula.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <ul className="divide-y divide-border text-sm">
              {ausentes.map((a) => (
                <li key={a.email} className="flex flex-wrap gap-x-3 px-4 py-2.5">
                  <span className="font-medium text-foreground">{a.email}</span>
                  {a.buyerName && (
                    <span className="text-muted-foreground">{a.buyerName}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}

function Numero({
  icon: Icon,
  valor,
  total,
  label,
  tom = "normal",
}: {
  icon: React.ElementType
  valor: number
  total: number
  label: string
  tom?: "normal" | "alerta"
}) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold">{label}</p>
      </div>
      <p className="mt-3 font-serif text-3xl font-bold leading-none text-foreground">
        {valor}
        <span className="ml-1 text-base font-normal text-muted-foreground">
          de {total}
        </span>
      </p>
      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full ${tom === "alerta" ? "bg-destructive" : "bg-primary"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{pct}% da turma</p>
    </div>
  )
}

function Lista({
  titulo,
  vazio,
  linhas,
}: {
  titulo: string
  vazio: string
  linhas: AlunaProgresso[]
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {titulo} ({linhas.length})
      </h3>
      {linhas.length === 0 ? (
        <p className="text-sm text-muted-foreground">{vazio}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Aluna</th>
                <th className="px-4 py-3 font-semibold">Abriu</th>
                <th className="px-4 py-3 font-semibold">Concluiu</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.email} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{l.email}</div>
                    {l.buyerName && (
                      <div className="text-xs text-muted-foreground">{l.buyerName}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {quando(l.firstViewedAt)}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {l.completedAt ? quando(l.completedAt) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
