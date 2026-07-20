import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Download, FileText, MessageCircle } from "lucide-react"
import { type Lesson, categoryLabel, hasMedia } from "@/lib/lessons"
import { WHATSAPP_VIP_URL } from "@/lib/links"
import { getLessonWithNeighbors } from "@/lib/lessons-server"
import { requireReleasedAccess } from "@/lib/guard"
import { AudioPlayer } from "@/components/audio-player"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireReleasedAccess()

  const { id } = await params
  const { lesson, older, newer } = await getLessonWithNeighbors(id)
  if (!lesson) notFound()

  return (
    <div className="min-h-screen">
      {/* ── Header ── */}
      <header className="border-b border-border bg-card">
        <div className="max-w-2xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Material de Aulas
          </Link>
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

      <main className="max-w-2xl mx-auto px-5 py-12 space-y-12">
        {/* ── Lesson header ── */}
        <div>
          <div className="flex items-end gap-4 mb-4">
            <span
              className="font-serif font-bold text-foreground leading-none"
              style={{ fontSize: "6rem", opacity: 0.1 }}
              aria-hidden
            >
              {lesson.dia}
            </span>
            <div className="pb-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Dia {lesson.dia}
              </p>
              <p className="text-xs text-muted-foreground">
                {lesson.weekday} · {lesson.date}
              </p>
            </div>
          </div>

          <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-accent text-muted-foreground mb-4">
            {categoryLabel(lesson.category)}
          </span>

          <h1 className="font-serif text-3xl font-bold text-foreground leading-tight mb-3">
            {lesson.topic}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            {lesson.description}
          </p>
        </div>

        {/* ── Áudio ── */}
        {hasMedia(lesson.audioUrl) && (
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Áudio
            </h2>
            <AudioPlayer label={lesson.topic} src={lesson.audioUrl} />
          </section>
        )}

        {/* ── PDF ── */}
        {hasMedia(lesson.pdfUrl) && (
          <section className="space-y-3">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Material em PDF
            </h2>
            <a
              href={lesson.pdfUrl}
              download
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 hover:bg-accent transition-colors max-w-sm"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  Material do Dia {lesson.dia}
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
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Ao Vivo
          </h2>
          <div className="flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4 max-w-sm">
            <MessageCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
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
                Entrar no WhatsApp VIP →
              </a>
            </div>
          </div>
        </section>

        {/* ── Navegação entre dias ── */}
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
            Dia seguinte
            <ArrowRight className="w-3.5 h-3.5" />
          </>
        ) : (
          <>
            <ArrowLeft className="w-3.5 h-3.5" />
            Dia anterior
          </>
        )}
      </span>
      <span className="text-sm font-semibold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {lesson.topic}
      </span>
    </Link>
  )
}
