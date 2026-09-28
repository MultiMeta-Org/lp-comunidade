import {
  ArrowUpRight,
  BookOpen,
  ListMusic,
  Lock,
  Video,
  MessageCircle,
  MessageCircleQuestionMark,
  Podcast,
} from "lucide-react"

import {
  INSTAGRAM_NATI_URL,
  LIVE_CLASS_URL,
  LOUVORES_URL,
  NOTION_URL,
  PODCAST_URL,
  SUPPORT_URL,
  WHATSAPP_FREE_URL,
} from "@/lib/links"

type QuickLink = {
  label: string
  description: string
  icon: React.ElementType
  href?: string
  /** Cadeado: trava do 8º dia (Notion, Marketplace) ou produto que não é dela. */
  locked?: boolean
}

/**
 * Os links que a aluna usa sempre, numa superfície só, separados por fios de
 * 1px. O Notion entra travado até a liberação do 8º dia — `lockedNote` mostra
 * quanto falta.
 *
 * Comunidade VIP e Marketplace não vivem aqui: são produtos, e aparecem como
 * capa na estante lá em cima. Repetir o mesmo destino nas duas superfícies só
 * dobrava a tela sem dar nada novo.
 */
export function QuickLinks({
  unlocked,
  lockedNote,
}: {
  unlocked: boolean
  lockedNote: string | null
}) {
  const links: QuickLink[] = [
    {
      label: "Aula ao vivo",
      description: "Toda sexta às 9h, no Meet",
      icon: Video,
      href: LIVE_CLASS_URL,
    },
    {
      label: "Todas as Alunas",
      description: "O grupo gratuito",
      icon: MessageCircle,
      href: WHATSAPP_FREE_URL,
    },
    {
      label: "Notion",
      description: unlocked
        ? "Materiais e modelos"
        : (lockedNote ?? "Libera em alguns dias"),
      icon: BookOpen,
      href: unlocked ? NOTION_URL : undefined,
      locked: !unlocked,
    },
    {
      label: "PodProsperar",
      description: "Nosso podcast no Spotify",
      icon: Podcast,
      href: PODCAST_URL,
    },
    {
      label: "Louvores",
      description: "A playlist do PodProsperar",
      icon: ListMusic,
      href: LOUVORES_URL,
    },
    {
      label: "@natiferraric",
      description: "A Nati no Instagram",
      icon: InstagramGlyph,
      href: INSTAGRAM_NATI_URL,
    },
    {
      label: "Falar com a equipe",
      description: "A gente responde rapidinho",
      icon: MessageCircleQuestionMark,
      href: SUPPORT_URL,
    },
  ]

  // A grade é "sem gap": o fundo do container é o fio de 1px que separa os
  // cartões. Buraco na última linha, então, não fica vazio — vira um bloco
  // chapado da cor do fio. Estas células cegas tapam o buraco com a cor do
  // cartão. Quantas faltam depende do número de colunas, que muda por
  // breakpoint, então cada uma só aparece onde é necessária.
  const missing2 = (2 - (links.length % 2)) % 2
  const missing3 = (3 - (links.length % 3)) % 3
  const fillers = Array.from({ length: Math.max(missing2, missing3) }, (_, i) =>
    i < missing2
      ? i < missing3
        ? "hidden sm:block"
        : "hidden sm:block lg:hidden"
      : "hidden lg:block"
  )

  return (
    <div className="grid gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <QuickLinkItem key={link.label} link={link} />
      ))}
      {fillers.map((visibility, i) => (
        <div key={`filler-${i}`} aria-hidden className={`bg-card ${visibility}`} />
      ))}
    </div>
  )
}

function QuickLinkItem({ link }: { link: QuickLink }) {
  const { icon: Icon, label, description, href, locked } = link

  const inner = (
    <>
      <span
        className={`flex h-9 w-9 flex-none items-center justify-center rounded-full transition-colors ${
          locked
            ? "bg-muted text-muted-foreground"
            : "bg-muted text-muted-foreground group-hover:bg-primary-subtle group-hover:text-primary"
        }`}
      >
        <Icon className="h-[18px] w-[18px]" />
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <b className="truncate text-sm font-semibold text-foreground">{label}</b>
        <small className="truncate text-xs text-muted-foreground">{description}</small>
      </span>

      {locked ? (
        <Lock className="ml-auto h-4 w-4 flex-none text-muted-foreground" />
      ) : (
        <ArrowUpRight className="ml-auto h-4 w-4 flex-none text-border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
      )}
    </>
  )

  const base =
    "group flex items-center gap-3.5 bg-card px-5 py-4 text-left transition-colors"

  if (!href) {
    return (
      <div aria-disabled className={`${base} cursor-not-allowed bg-card/60`}>
        {inner}
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} hover:bg-muted/70`}
    >
      {inner}
    </a>
  )
}

/** Lucide v1 não traz mais ícones de marca — glifo do Instagram desenhado aqui. */
function InstagramGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}
