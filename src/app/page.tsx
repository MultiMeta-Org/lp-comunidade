import { FileText, MessageCircle } from "lucide-react"
import { CATEGORIES } from "@/lib/lessons"
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
            href="#"
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
          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
              Hoje
            </span>
            <span className="text-xs text-muted-foreground">
              {today.weekday} · {today.date}
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
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-secondary-subtle text-secondary mb-4">
                {CATEGORIES[today.category]}
              </span>

              <h1 className="font-serif text-2xl font-bold text-foreground leading-snug mb-2">
                {today.topic}
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                {today.description}
              </p>

              <AudioPlayer label={today.topic} src={today.audioUrl} />

              <div className="flex items-center gap-4 mt-4">
                <a
                  href={today.pdfUrl}
                  className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline underline-offset-2"
                >
                  <FileText className="w-4 h-4" />
                  Baixar PDF
                </a>
                <span className="text-border">·</span>
                <a
                  href="#"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Grupo ao vivo às 9h
                </a>
              </div>
            </div>
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
