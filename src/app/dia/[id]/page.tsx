import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileText, MessageCircle } from "lucide-react"
import { CATEGORIES } from "@/lib/lessons"
import { getLesson } from "@/lib/lessons-server"
import { requireReleasedAccess } from "@/lib/guard"
import { AudioPlayer } from "@/components/audio-player"

export default async function LessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireReleasedAccess()

  const { id } = await params
  const lesson = await getLesson(id)
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
            Comunidade VIP
          </Link>
          <a
            href="#"
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
            {CATEGORIES[lesson.category]}
          </span>

          <h1 className="font-serif text-3xl font-bold text-foreground leading-tight mb-3">
            {lesson.topic}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            {lesson.description}
          </p>
        </div>

        {/* ── Áudio ── */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Áudio
          </h2>
          <AudioPlayer label={lesson.topic} src={lesson.audioUrl} />
        </section>

        {/* ── PDF ── */}
        <section className="space-y-3">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Material em PDF
          </h2>
          <a
            href={lesson.pdfUrl}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-5 py-4 hover:bg-accent transition-colors max-w-sm"
          >
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Material do Dia {lesson.dia}
              </p>
              <p className="text-xs text-muted-foreground">PDF · clique para baixar</p>
            </div>
          </a>
        </section>

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
                href="#"
                className="text-xs font-semibold text-primary hover:underline underline-offset-2"
              >
                Entrar no WhatsApp VIP →
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
