import type { FeatureUnlock } from "@/lib/access"
import type { Lesson } from "@/lib/lessons"
import { buildHighlights, buildProducts } from "@/lib/home"
import { Atmosphere } from "@/components/atmosphere"
import { NewsCarousel } from "@/components/home/news-carousel"
import { ProductShelf } from "@/components/home/product-shelf"
import { QuickLinks } from "@/components/home/quick-links"
import { VipSection } from "@/components/home/vip-section"
import { VerificarAssinatura } from "@/components/home/verificar-assinatura"

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

/** "segunda-feira, 1 de setembro" — sobrelinha da saudação. */
function todayLabel(now: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(now)
}

/** "8 de set" — data em que o Notion libera. */
function unlockDateLabel(iso: string | null): string | null {
  if (!iso) return null
  return new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "numeric", month: "short" })
    .format(new Date(iso))
    .replace(".", "")
}

/**
 * Home do portal: novidades no topo, os produtos da aluna em uma fileira, os
 * que ela ainda vai conhecer em outra, e os links de sempre no pé.
 * Puramente apresentacional — a page faz o guard e busca os dados.
 */
export function HomeBoard({
  name,
  lesson,
  unlock,
  hasComunidadeVip,
  now = new Date(),
}: {
  name: string | null
  lesson: Lesson | null
  unlock: FeatureUnlock
  hasComunidadeVip: boolean
  now?: Date
}) {
  const highlights = buildHighlights(lesson)

  const unlockDate = unlockDateLabel(unlock.unlockAt)
  const lockedNote = unlock.unlocked
    ? null
    : unlock.daysRemaining <= 1
      ? "Libera amanhã"
      : `Libera em ${unlock.daysRemaining} dias${unlockDate ? ` · ${unlockDate}` : ""}`

  const products = buildProducts({ hasComunidadeVip })
  const owned = products.filter((p) => p.state === "owned")
  const soon = products.filter((p) => p.state !== "owned")

  return (
    <>
      <NewsCarousel highlights={highlights} />

      <main className="grain relative overflow-hidden px-5 pb-16 pt-9">
        <Atmosphere variant="hub" />

        <div className="relative z-10 mx-auto w-full max-w-4xl">
          {/* ── Saudação ── */}
          <header
            className="animate-rise flex flex-wrap items-end gap-x-7 gap-y-3"
            style={{ "--d": "0ms" } as React.CSSProperties}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-secondary">
                {todayLabel(now)}
              </p>
              <h1 className="mt-3 font-serif text-4xl font-bold leading-[1.05] text-foreground sm:text-5xl">
                {greeting(now)}
                {name ? (
                  <>
                    ,<br className="sm:hidden" /> <span className="text-primary">{name}</span>
                  </>
                ) : null}
                <span className="text-secondary">.</span>
              </h1>
            </div>
            <p className="mb-1 max-w-[42ch] text-sm leading-relaxed text-muted-foreground">
              Aqui fica tudo que é seu. Pode ir com calma, não tem pressa.
            </p>
          </header>

          {/* ── Produtos da aluna ── */}
          <SectionLabel className="mt-11" delay={60}>
            Meus produtos
          </SectionLabel>
          <div className="animate-rise mt-4" style={{ "--d": "90ms" } as React.CSSProperties}>
            <ProductShelf products={owned} />
          </div>

          {/* ── Comunidade VIP: o único produto com ambiente dentro do portal ── */}
          {hasComunidadeVip && (
            <>
              <SectionLabel className="mt-12" delay={110} hint="sua assinatura">
                Comunidade VIP
              </SectionLabel>
              <div
                className="animate-rise mt-4"
                style={{ "--d": "140ms" } as React.CSSProperties}
              >
                <VipSection />
              </div>
            </>
          )}

          {/* ── O que ela ainda vai conhecer ── */}
          {soon.length > 0 && (
            <>
              <SectionLabel className="mt-12" delay={130} hint="em breve no portal">
                Para conhecer
              </SectionLabel>
              <div
                className="animate-rise mt-4"
                style={{ "--d": "160ms" } as React.CSSProperties}
              >
                <ProductShelf products={soon} />
                {/* Quem assinou com a aba já aberta não passa por nenhuma das
                    verificações automáticas — este botão é a saída dela. */}
                {!hasComunidadeVip && <VerificarAssinatura />}
              </div>
            </>
          )}

          {/* ── Links de sempre ── */}
          <SectionLabel className="mt-12" delay={200}>
            Links que você usa sempre
          </SectionLabel>
          <div className="animate-rise mt-4" style={{ "--d": "230ms" } as React.CSSProperties}>
            <QuickLinks unlocked={unlock.unlocked} lockedNote={lockedNote} />
          </div>

          <footer className="mt-14 flex items-center justify-center gap-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <span className="h-px w-8 bg-border" />
            &copy; {now.getFullYear()} MultiMeta
            <span className="h-px w-8 bg-border" />
          </footer>
        </div>
      </main>
    </>
  )
}

function SectionLabel({
  children,
  hint,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  hint?: string
  delay?: number
  className?: string
}) {
  return (
    <div
      className={`animate-rise flex items-baseline gap-3 ${className}`}
      style={{ "--d": `${delay}ms` } as React.CSSProperties}
    >
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {children}
      </h2>
      <span className="h-px flex-1 -translate-y-1 bg-border" />
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </div>
  )
}
