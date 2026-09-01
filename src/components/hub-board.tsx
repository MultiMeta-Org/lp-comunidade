import Link from "next/link"
import {
  MessageCircle,
  Users,
  Handshake,
  BookOpen,
  HelpCircle,
  Lock,
  ArrowRight,
  ArrowUpRight,
  Headphones,
  FileText,
  Play,
} from "lucide-react"

import type { FeatureUnlock } from "@/lib/access"
import { type Lesson, categoryLabel, hasMedia } from "@/lib/lessons"
import { Atmosphere } from "@/components/atmosphere"
import {
  WHATSAPP_VIP_URL,
  WHATSAPP_FREE_URL,
  NOTION_URL,
  SUPPORT_URL,
  MARKETPLACE_URL,
} from "@/lib/links"

const TZ = "America/Sao_Paulo"

/** "Bom dia" / "Boa tarde" / "Boa noite" no fuso de São Paulo. */
function greeting(now: Date): string {
  const hour =
    Number(
      new Intl.DateTimeFormat("pt-BR", {
        timeZone: TZ,
        hour: "numeric",
        hourCycle: "h23",
      }).format(now)
    ) % 24
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}

/** "segunda-feira, 1 de setembro" - sobrelinha do título. */
function todayLabel(now: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now)
}

/** "8 de set" - data em que Notion/Marketplace liberam. */
function unlockDateLabel(iso: string | null): string | null {
  if (!iso) return null
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
  })
    .format(new Date(iso))
    .replace(".", "")
}

/**
 * Corpo do Hub: saudação, destaque da aula de hoje e os atalhos.
 * Puramente apresentacional - a page faz o guard e busca os dados.
 */
export function HubBoard({
  name,
  lesson,
  lessonCount,
  unlock,
  waitingDays,
  now = new Date(),
}: {
  name: string | null
  lesson: Lesson | null
  lessonCount: number
  unlock: FeatureUnlock
  waitingDays: number
  now?: Date
}) {
  const unlockDate = unlockDateLabel(unlock.unlockAt)

  // Quanto da janela de espera já passou — vira a barra dos tiles travados.
  const progress = unlock.unlocked
    ? 100
    : waitingDays > 0
      ? Math.min(
          100,
          Math.max(4, Math.round(((waitingDays - unlock.daysRemaining) / waitingDays) * 100))
        )
      : 100

  const lockedNote = unlock.unlocked
    ? null
    : unlock.daysRemaining <= 1
      ? "Libera amanhã"
      : `Libera em ${unlock.daysRemaining} dias${unlockDate ? ` \u00b7 ${unlockDate}` : ""}`

  return (
    <main className="grain relative overflow-hidden px-5 pb-16 pt-10 sm:pt-14">
      <Atmosphere variant="hub" />

      <div className="relative z-10 mx-auto w-full max-w-4xl">
        {/* ── Saudação ── */}
        <header className="animate-rise" style={{ "--d": "0ms" } as React.CSSProperties}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
            {todayLabel(now)}
          </p>
          <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-bold leading-[1.05] text-foreground">
            {greeting(now)}
            {name ? (
              <>
                ,<br className="sm:hidden" /> <span className="text-primary">{name}</span>
              </>
            ) : null}
            <span className="text-secondary">.</span>
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Tudo que você precisa está aqui &mdash; a aula de hoje, o acervo completo e a
            sua comunidade.
          </p>
        </header>

        {/* ── Destaque: a aula de hoje ── */}
        <div className="mt-9 animate-rise" style={{ "--d": "90ms" } as React.CSSProperties}>
          <TodayFeature lesson={lesson} count={lessonCount} />
        </div>

        {/* ── Atalhos ── */}
        <SectionLabel className="mt-12">Seus atalhos</SectionLabel>

        <div className="mt-4 grid grid-cols-2 auto-rows-[152px] gap-3 sm:grid-cols-3">
          <Tile
            className="row-span-2"
            size="tall"
            href={WHATSAPP_VIP_URL}
            icon={Users}
            tone="sage"
            label="Comunidade VIP"
            description="Seu grupo exclusivo no WhatsApp — dúvidas, trocas e a aula ao vivo, todo dia às 9h."
            cta="Entrar no grupo"
            delay={160}
          />
          <Tile
            href={SUPPORT_URL}
            icon={HelpCircle}
            tone="clay"
            label="Suporte"
            description="Falar no WhatsApp"
            delay={210}
          />
          <Tile
            href={WHATSAPP_FREE_URL}
            icon={MessageCircle}
            tone="sky"
            label="Todas as Alunas"
            description="Grupo gratuito"
            delay={260}
          />
          <Tile
            href={unlock.unlocked ? NOTION_URL : undefined}
            icon={BookOpen}
            tone="sage"
            label="Notion"
            description={unlock.unlocked ? "Materiais e templates" : (lockedNote ?? "Em breve")}
            locked={!unlock.unlocked}
            progress={progress}
            delay={310}
          />
          <Tile
            href={unlock.unlocked ? MARKETPLACE_URL : undefined}
            icon={Handshake}
            tone="clay"
            label="Marketplace"
            description={unlock.unlocked ? "Oportunidades e vagas" : (lockedNote ?? "Em breve")}
            locked={!unlock.unlocked}
            progress={progress}
            delay={360}
          />
        </div>

        <footer className="mt-14 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px w-8 bg-border" />
          &copy; {now.getFullYear()} MultiMeta
          <span className="h-px w-8 bg-border" />
        </footer>
      </div>
    </main>
  )
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </h2>
      <span className="h-px flex-1 bg-border" />
    </div>
  )
}

/* ── Card de destaque: a aula mais recente ── */
function TodayFeature({ lesson, count }: { lesson: Lesson | null; count: number }) {
  if (!lesson) {
    return (
      <Link
        href="/"
        className="group flex items-center justify-between gap-4 rounded-3xl border border-dashed border-border bg-card/70 px-7 py-8 transition-colors hover:border-primary/50"
      >
        <div>
          <p className="font-serif text-xl font-bold text-foreground">
            A primeira aula chega em breve
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Enquanto isso, dá uma olhada no material de aulas.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </Link>
    )
  }

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-primary/25 bg-card shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Lavagem sage do card + numeral gigante: assinatura visual do portal. */}
      <div
        aria-hidden
        className="card-sheen pointer-events-none absolute inset-0"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-1 right-2 select-none font-serif font-bold leading-none text-primary opacity-[0.12] transition-transform duration-500 group-hover:scale-105 sm:bottom-auto sm:right-8 sm:top-1/2 sm:-translate-y-1/2"
        style={{ fontSize: "clamp(5.5rem, 20vw, 13rem)" }}
      >
        {lesson.dia}
      </span>

      <div className="relative p-7 sm:p-9">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
            Aula de hoje
          </span>
          <span className="rounded-full border border-border bg-card/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {categoryLabel(lesson.category)}
          </span>
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Dia {lesson.dia} · {lesson.weekday} · {lesson.date}
        </p>

        <h2 className="mt-2 max-w-lg font-serif text-2xl sm:text-3xl font-bold leading-snug text-foreground">
          {lesson.topic}
        </h2>
        <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {lesson.description}
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
          <Link
            href={`/dia/${lesson.id}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:gap-3 hover:opacity-90"
          >
            <Play className="h-4 w-4 fill-current" />
            Abrir aula de hoje
          </Link>

          <div className="flex items-center gap-3 text-muted-foreground">
            {hasMedia(lesson.videoUrl) && <MediaChip icon={Play} label="Vídeo" />}
            {hasMedia(lesson.audioUrl) && <MediaChip icon={Headphones} label="Áudio" />}
            {hasMedia(lesson.pdfUrl) && <MediaChip icon={FileText} label="PDF" />}
          </div>

          <Link
            href="/"
            className="group/all ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-primary"
          >
            {count > 1 ? `Ver as ${count} aulas` : "Ver o acervo"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/all:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
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

/* ── Tiles de atalho ── */

type Tone = "sage" | "clay" | "sky"

const TONES: Record<
  Tone,
  { chip: string; border: string; wash: string; ink: string; fill: string }
> = {
  sage: {
    chip: "bg-primary-subtle text-primary",
    border: "group-hover:border-primary/45",
    wash: "group-hover:bg-primary-subtle/40",
    ink: "text-primary",
    fill: "bg-primary-subtle/35",
  },
  clay: {
    chip: "bg-secondary-subtle text-secondary",
    border: "group-hover:border-secondary/45",
    wash: "group-hover:bg-secondary-subtle/40",
    ink: "text-secondary",
    fill: "bg-secondary-subtle/35",
  },
  sky: {
    chip: "bg-info-subtle text-info",
    border: "group-hover:border-info/45",
    wash: "group-hover:bg-info-subtle/40",
    ink: "text-info",
    fill: "bg-info-subtle/35",
  },
}

/**
 * Atalho do Hub. `size="tall"` é o tile âncora (ocupa duas linhas do bento):
 * ganha fundo tingido, ícone maior e um CTA explícito.
 */
function Tile({
  icon: Icon,
  label,
  description,
  href,
  tone,
  cta,
  size = "sm",
  locked = false,
  progress = 0,
  delay = 0,
  className = "",
}: {
  icon: React.ElementType
  label: string
  description: string
  href?: string
  tone: Tone
  cta?: string
  size?: "sm" | "tall"
  locked?: boolean
  progress?: number
  delay?: number
  className?: string
}) {
  const t = TONES[tone]
  const tall = size === "tall"
  const style = { "--d": `${delay}ms` } as React.CSSProperties

  const inner = (
    <>
      {/* Marca d'água do ícone — ecoa o numeral gigante das aulas. */}
      <Icon
        aria-hidden
        strokeWidth={1}
        className={`pointer-events-none absolute transition-transform duration-500 ${
          tall ? "-bottom-10 -right-10 h-56 w-56" : "-bottom-5 -right-4 h-24 w-24"
        } ${
          locked
            ? "text-muted-foreground opacity-[0.07]"
            : `${t.ink} ${tall ? "opacity-[0.16]" : "opacity-[0.11]"} group-hover:-rotate-6 group-hover:scale-110`
        }`}
      />

      <div className="relative flex items-start justify-between gap-2">
        <span
          className={`flex items-center justify-center rounded-xl transition-colors ${
            tall ? "h-11 w-11" : "h-9 w-9"
          } ${locked ? "bg-muted text-muted-foreground" : t.chip}`}
        >
          <Icon className={tall ? "h-5 w-5" : "h-[18px] w-[18px]"} />
        </span>
        {locked ? (
          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
        )}
      </div>

      <div className="relative mt-auto">
        <p
          className={`font-semibold leading-tight text-foreground ${
            tall ? "font-serif text-lg" : "text-sm"
          }`}
        >
          {label}
        </p>
        <p
          className={`mt-1 leading-snug text-muted-foreground ${
            tall ? "text-xs" : "text-xs line-clamp-2"
          }`}
        >
          {description}
        </p>

        {cta && !locked && (
          <span
            className={`mt-3 inline-flex items-center gap-1.5 text-xs font-semibold ${t.ink}`}
          >
            {cta}
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        )}

        {locked && (
          <div
            className="mt-3 h-1 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Liberação de ${label}`}
          >
            <span
              className="block h-full rounded-full bg-primary/60"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </>
  )

  const base = `animate-rise group relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 sm:p-5 ${
    tall ? `border-transparent ${t.fill}` : "border-border bg-card"
  }`

  if (locked || !href) {
    return (
      <div
        style={style}
        aria-disabled
        className={`${base} cursor-not-allowed bg-card/55 ${className}`}
      >
        {inner}
      </div>
    )
  }

  const interactive = `${base} ${t.border} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${className}`
  const wash = (
    <span
      aria-hidden
      className={`pointer-events-none absolute inset-0 transition-colors duration-300 ${t.wash}`}
    />
  )

  // Rota interna usa Link (prefetch); externo abre em nova aba.
  if (href.startsWith("/")) {
    return (
      <Link href={href} style={style} className={interactive}>
        {wash}
        {inner}
      </Link>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={style}
      className={interactive}
    >
      {wash}
      {inner}
    </a>
  )
}
