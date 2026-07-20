import { FileText } from "lucide-react"
import { categoryLabel, hasMedia } from "@/lib/lessons"
import { getLessons } from "@/lib/lessons-server"
import { requireReleasedAccess } from "@/lib/guard"
import { Library } from "@/components/library"
import { AudioPlayer } from "@/components/audio-player"
import { SiteHeader } from "@/components/site-header"
import { LiveBanner } from "@/components/live-banner"

export default async function VIPPage() {
  await requireReleasedAccess()

  const lessons = await getLessons()
  const today = lessons[0]
  const pastLessons = lessons.slice(1)

  return (
    <div className="min-h-screen">
      <LiveBanner />
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-5 py-12 space-y-12">
        {/* ── Título ── */}
        <div className="space-y-1">
          <h1 className="font-serif text-3xl font-bold text-foreground leading-tight">
            Material de Aulas
          </h1>
          <p className="text-sm text-muted-foreground">
            A aula de hoje e todo o acervo — áudios e PDFs.
          </p>
        </div>

        {/* ── Hoje ── */}
        {today && (
        <section>
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
              <span className="text-[10px] font-bold uppercase tracking-widest text-secondary">
                Hoje
              </span>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3 mt-3">
                {today.weekday} · {today.date}
              </p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent text-muted-foreground mb-4">
                {categoryLabel(today.category)}
              </span>

              <h2 className="font-serif text-2xl font-bold text-foreground leading-snug mb-2">
                {today.topic}
              </h2>
              <p className="text-sm text-muted-foreground">
                {today.description}
              </p>

              {hasMedia(today.audioUrl) && (
                <div className="mt-6">
                  <AudioPlayer label={today.topic} src={today.audioUrl} />
                </div>
              )}

              {hasMedia(today.pdfUrl) && (
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
              )}
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
