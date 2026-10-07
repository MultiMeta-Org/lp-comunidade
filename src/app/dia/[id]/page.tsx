import { notFound } from "next/navigation"
import { after } from "next/server"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Download, FileText, MessageCircle } from "lucide-react"
import { type Lesson, categoryLabel, hasMedia } from "@/lib/lessons"
import { WHATSAPP_VIP_URL } from "@/lib/links"
import { MATERIAL_NAME, PLANTAO_NAME } from "@/lib/produto"
import { getLessonWithNeighbors } from "@/lib/lessons-server"
import { requireLessonsViewer } from "@/lib/guard"
import { getCompletedLessonIds, markLessonViewed } from "@/lib/progress-server"
import { LessonComplete } from "@/components/lesson-complete"
import { AudioPlayer } from "@/components/audio-player"
import { SiteHeader } from "@/components/site-header"
import { LiveBanner } from "@/components/live-banner"
import { Atmosphere } from "@/components/atmosphere"
import { VideoPlayer } from "@/components/video-player"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { email, scope, admin } = await requireLessonsViewer()

  const { id } = await params
  // O alcance entra na busca: para quem não assina o Laboratório, uma aula que
  // não é o Plantão simplesmente não existe — 404, não "proibido", porque a
  // existência do acervo não é informação dela.
  const [{ lesson, older, newer }, completed] = await Promise.all([
    getLessonWithNeighbors(id, scope),
    getCompletedLessonIds(email),
  ])
  if (!lesson) notFound()

  // Presença: fato observado, gravado depois da resposta (não atrasa a página).
  // A admin não conta — ver LessonsViewer.admin.
  if (!admin) after(() => markLessonViewed(email, id))

  return (
    <div className="min-h-screen">
      <LiveBanner />
      <SiteHeader />

      <main className="grain relative overflow-hidden px-5 pb-16 pt-8">
        <Atmosphere variant="lesson" />

        <div className="relative z-10 mx-auto w-full max-w-2xl space-y-12">
          {/* ── Volta para o acervo ── */}
          <Link
            href="/aulas"
            className="group -mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors animate-rise"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            {scope === "lab" ? MATERIAL_NAME : PLANTAO_NAME}
          </Link>

          {/* ── Lesson header ── */}
          <div className="animate-rise" style={{ "--d": "70ms" } as React.CSSProperties}>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
              {lesson.weekday} · {lesson.date}
            </p>

            <span className="inline-block text-[10px] font-bold uppercase tracking-[0.14em] px-2.5 py-1 rounded-full border border-border bg-card/70 text-muted-foreground mb-4">
              {categoryLabel(lesson.category)}
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground leading-[1.1] mb-3">
              {lesson.topic}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
              {lesson.description}
            </p>

            {!admin && (
              <div className="mt-6">
                <LessonComplete lessonId={lesson.id} done={completed.has(lesson.id)} />
              </div>
            )}
          </div>

          {/* ── Vídeo ── */}
          {hasMedia(lesson.videoUrl) && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Vídeo
              </h2>
              <VideoPlayer src={lesson.videoUrl} title={lesson.topic} />
            </section>
          )}

          {/* ── Áudio ── */}
          {hasMedia(lesson.audioUrl) && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Áudio
              </h2>
              <AudioPlayer label={lesson.topic} src={lesson.audioUrl} />
            </section>
          )}

          {/* ── PDF ── */}
          {hasMedia(lesson.pdfUrl) && (
            <section className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Material em PDF
              </h2>
              <a
                href={lesson.pdfUrl}
                download
                className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 hover:border-primary/45 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 max-w-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary-subtle text-secondary flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    Material da aula
                  </p>
                  <p className="text-xs text-muted-foreground">PDF · clique para baixar</p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3 py-2 rounded-full flex-shrink-0">
                  <Download className="w-3.5 h-3.5" />
                  Baixar
                </span>
              </a>
            </section>
          )}

          {/* ── Ao vivo ── */}
          {/* O grupo é do Laboratório: quem está aqui pelo Plantão não vê a
              porta de uma sala que não é dela. */}
          {scope === "lab" && (
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Ao Vivo
            </h2>
            <div className="relative overflow-hidden flex items-start gap-4 rounded-2xl border border-primary/25 bg-card px-5 py-4 max-w-sm">
              <div aria-hidden className="card-sheen pointer-events-none absolute inset-0" />
              <MessageCircle className="relative w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="relative">
                <p className="text-sm font-semibold text-foreground mb-0.5">
                  Grupo abre às 9h
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Tire dúvidas sobre o tema de hoje com a turma
                </p>
                <a
                  href={WHATSAPP_VIP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-primary hover:underline underline-offset-2"
                >
                  Entrar no grupo no WhatsApp →
                </a>
              </div>
            </div>
          </section>
          )}

          {/* ── Navegação entre aulas ── */}
          {(older || newer) && (
            <nav className="grid grid-cols-2 gap-3 border-t border-border pt-8">
              {older ? (
                <NeighborLink lesson={older} direction="prev" />
              ) : (
                <span />
              )}
              {newer ? (
                <NeighborLink lesson={newer} direction="next" />
              ) : (
                <span />
              )}
            </nav>
          )}
        </div>
      </main>
    </div>
  )
}

function NeighborLink({
  lesson,
  direction,
}: {
  lesson: Lesson
  direction: "prev" | "next"
}) {
  const next = direction === "next"
  return (
    <Link
      href={`/dia/${lesson.id}`}
      className={`group flex flex-col gap-1 rounded-xl border border-border bg-card px-4 py-3 hover:border-muted-foreground hover:bg-accent transition-colors ${
        next ? "items-end text-right col-start-2" : "items-start"
      }`}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
        {next ? (
          <>
            Próxima aula
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <ArrowLeft className="w-3.5 h-3.5" />
            Aula anterior
          </>
        )}
      </span>
      <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {lesson.topic}
      </span>
    </Link>
  )
}
