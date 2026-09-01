import { FileText, Play, Headphones } from "lucide-react"
import { categoryLabel, hasMedia } from "@/lib/lessons"
import { getLessons } from "@/lib/lessons-server"
import { requireReleasedAccess } from "@/lib/guard"
import { Library } from "@/components/library"
import { AudioPlayer } from "@/components/audio-player"
import { VideoPlayer } from "@/components/video-player"
import { SiteHeader } from "@/components/site-header"
import { LiveBanner } from "@/components/live-banner"
import { Atmosphere } from "@/components/atmosphere"

export default async function VIPPage() {
  await requireReleasedAccess()

  const lessons = await getLessons()
  const today = lessons[0]
  const pastLessons = lessons.slice(1)

  return (
    <div className="min-h-screen">
      <LiveBanner />
      <SiteHeader />

      <main className="grain relative overflow-hidden px-5 pb-16 pt-10 sm:pt-14">
        <Atmosphere variant="library" />

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          {/* ── Título ── */}
          <header className="animate-rise" style={{ "--d": "0ms" } as React.CSSProperties}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
              Acervo
            </p>
            <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold leading-[1.05] text-foreground">
              Material de Aulas
              <span className="text-secondary">.</span>
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              A aula de hoje e todo o acervo — vídeos, áudios e PDFs.
            </p>
          </header>

          {/* ── Hoje ── */}
          {today && (
            <section
              className="mt-9 animate-rise"
              style={{ "--d": "90ms" } as React.CSSProperties}
            >
              <article className="group relative overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
                {/* Lavagem sage + numeral gigante: mesma assinatura do Hub. */}
                <div aria-hidden className="card-sheen pointer-events-none absolute inset-0" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute bottom-1 right-2 select-none font-serif font-bold leading-none text-primary opacity-[0.12] transition-transform duration-500 group-hover:scale-105 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2"
                  style={{ fontSize: "clamp(5.5rem, 20vw, 13rem)" }}
                >
                  {today.dia}
                </span>

                <div className="relative p-7 sm:p-9">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                      Hoje
                    </span>
                    <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {categoryLabel(today.category)}
                    </span>
                  </div>

                  <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                    Dia {today.dia} · {today.weekday} · {today.date}
                  </p>

                  <h2 className="mt-2 max-w-lg font-serif text-2xl sm:text-3xl font-bold leading-snug text-foreground">
                    {today.topic}
                  </h2>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">
                    {today.description}
                  </p>

                  {/* Chips do que essa aula tem — some quando não há mídia. */}
                  {(hasMedia(today.videoUrl) ||
                    hasMedia(today.audioUrl) ||
                    hasMedia(today.pdfUrl)) && (
                    <div className="mt-5 flex flex-wrap items-center gap-3 text-muted-foreground">
                      {hasMedia(today.videoUrl) && <MediaChip icon={Play} label="Vídeo" />}
                      {hasMedia(today.audioUrl) && (
                        <MediaChip icon={Headphones} label="Áudio" />
                      )}
                      {hasMedia(today.pdfUrl) && <MediaChip icon={FileText} label="PDF" />}
                    </div>
                  )}

                  {hasMedia(today.videoUrl) && (
                    <div className="mt-6 max-w-2xl">
                      <VideoPlayer src={today.videoUrl} title={today.topic} />
                    </div>
                  )}

                  {hasMedia(today.audioUrl) && (
                    <div className="mt-6 max-w-2xl">
                      <AudioPlayer label={today.topic} src={today.audioUrl} />
                    </div>
                  )}

                  {hasMedia(today.pdfUrl) && (
                    <div className="mt-7">
                      <a
                        href={today.pdfUrl}
                        download
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:gap-3 hover:opacity-90"
                      >
                        <FileText className="h-4 w-4" />
                        Baixar PDF
                      </a>
                    </div>
                  )}
                </div>
              </article>
            </section>
          )}

          {/* ── Biblioteca ── */}
          <section
            className="mt-12 animate-rise"
            style={{ "--d": "180ms" } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Biblioteca
              </h2>
              <span className="text-xs text-muted-foreground">
                {pastLessons.length} aulas
              </span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <div className="mt-6">
              <Library lessons={pastLessons} />
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

function MediaChip({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  )
}
