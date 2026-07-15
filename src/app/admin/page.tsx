import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { waitingPeriodDays } from "@/lib/access"
import { AccessManager, type AuthorizedRow } from "@/components/admin/access-manager"
import { LessonsManager, type LessonRow } from "@/components/admin/lessons-manager"
import type { Database } from "@/lib/supabase/database.types"

type EmailRow = Pick<
  Database["comunidade"]["Tables"]["authorized_emails"]["Row"],
  "email" | "status" | "source" | "authorized_at" | "revoked_at" | "buyer_name"
>
type LessonDbRow = Database["comunidade"]["Tables"]["lessons"]["Row"]

function toAccessRows(emails: EmailRow[], waitDays: number): AuthorizedRow[] {
  const now = Date.now()
  return emails.map((e) => {
    const availableAtMs =
      new Date(e.authorized_at).getTime() + waitDays * 24 * 60 * 60 * 1000
    let state: AuthorizedRow["state"]
    if (e.status === "revoked") state = "revoked"
    else if (now < availableAtMs) state = "waiting"
    else state = "released"
    return {
      email: e.email,
      buyerName: e.buyer_name,
      source: e.source,
      state,
      availableAt: new Date(availableAtMs).toISOString(),
    }
  })
}

function toLessonRows(lessons: LessonDbRow[]): LessonRow[] {
  return lessons.map((l) => ({
    id: l.id,
    dia: l.dia,
    isoDate: l.iso_date,
    weekday: l.weekday,
    topic: l.topic,
    category: l.category,
    description: l.description,
    pdfUrl: l.pdf_url ?? "",
    audioUrl: l.audio_url ?? "",
    published: l.published,
  }))
}

export default async function AdminPage() {
  const db = createComunidadeServiceClient()

  const [{ data: emails }, { data: lessons }] = await Promise.all([
    db
      .from("authorized_emails")
      .select("email, status, source, authorized_at, revoked_at, buyer_name")
      .order("authorized_at", { ascending: false }),
    db.from("lessons").select("*").order("sort_order", { ascending: false }),
  ])

  const waitDays = waitingPeriodDays()
  const accessRows = toAccessRows(emails ?? [], waitDays)
  const lessonRows = toLessonRows(lessons ?? [])

  return (
    <>
      <section className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Acessos</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Compras do Hotmart entram automáticas (liberam {waitDays} dias após a compra).
            Reembolso/chargeback revoga sozinho. Aqui você também adiciona manualmente.
          </p>
        </div>
        <AccessManager rows={accessRows} />
      </section>

      <section className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Conteúdo</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Crie e edite as aulas da comunidade sem precisar de código.
          </p>
        </div>
        <LessonsManager rows={lessonRows} />
      </section>
    </>
  )
}
