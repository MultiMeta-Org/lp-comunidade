import { FileText, MessageCircle } from "lucide-react"
import { categoryLabel } from "@/lib/lessons"
import { WHATSAPP_VIP_URL } from "@/lib/links"
import { getLessons } from "@/lib/lessons-server"
import { requireReleasedAccess } from "@/lib/guard"
import { Library } from "@/components/library"
import { AudioPlayer } from "@/components/audio-player"

export default async function VIPPage() {
  await requireReleasedAccess()

  const lessons = await getLessons()
  const today = lessons[0]
  const pastLessons = lessons.slice(1)

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 border-b border-border bg-card backdrop-blur-sm bg-opacity-90">
        <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              MultiMeta
            </span>
            <span className="text-border">·</span>
            <span className="text-sm font-semibold text-foreground">
              Comunidade VIP
            </span>
          </div>
          <a
            href={WHATSAPP_VIP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            WhatsApp VIP
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-12 space-y-16">
        {/* ── Hoje ── */}
        {today && (
        <section>
          <div className="mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
              Hoje
            </span>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-7 shadow-sm">
            {/* Signature background number */}
            <span
              className="absolute right-4 top-2 font-serif font-bold text-foreground pointer-events-none select-none leading-none"
              style={{ fontSize: "10rem", opacity: 0.06 }}
              aria-hidden
            >
              {today.dia}
            </span>

            <div className="relative max-w-lg">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">
                {today.weekday} · {today.date}
              </p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-secondary-subtle text-secondary mb-4">
                {categoryLabel(today.category)}
              </span>

              <h1 className="font-serif text-2xl font-bold text-foreground leading-snug mb-2">
                {today.topic}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {today.description}
              </p>

              <AudioPlayer label={today.topic} src={today.audioUrl} />

              <div className="mt-8">
                <a
                  href={today.pdfUrl}
                  download
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-opacity"
                >
                  <FileText className="w-4 h-4" />
                  Baixar PDF
                </a>
              </div>
            </div>
          </div>

          {/* ── Card ao vivo ── */}
          <div className="mt-4 flex items-center gap-4 rounded-2xl border border-border bg-card px-6 py-5">
            <div className="w-11 h-11 rounded-xl bg-primary-subtle flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                Grupo ao vivo às 9h
              </p>
              <p className="text-xs text-muted-foreground">
                Tire dúvidas sobre o tema de hoje com a turma
              </p>
            </div>
            <a
              href={WHATSAPP_VIP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Entrar
            </a>
          </div>
        </section>
        )}

        {/* ── Biblioteca ── */}
        <section>
          <div className="flex items-baseline gap-3 mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Biblioteca
            </h2>
            <span className="text-xs text-muted-foreground">
              {pastLessons.length} aulas
            </span>
          </div>

          <Library lessons={pastLessons} />
        </section>
      </main>
    </div>
  )
}
