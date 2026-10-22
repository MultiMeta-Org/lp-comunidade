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
  /** Cadeado: trava do 8º dia (hoje só o Notion) ou produto que não é dela. */
  locked?: boolean
}

/**
 * Os links que a aluna usa sempre, cada um num cartão próprio. Já foram uma
 * grade única separada por fios de 1px, mas lia como tabela, não como botão:
 * ícone cinza e seta da cor da borda só ganhavam cor no hover — e no celular
 * não existe hover. Agora o ícone e a seta têm cor sempre, e o cartão inteiro
 * é o alvo. O Notion entra travado até a liberação do 8º dia — `lockedNote`
 * mostra quanto falta.
 *
 * Laboratório de Vendas e Marketplace não vivem aqui: são produtos, e aparecem como
 * capa na estante lá em cima. Repetir o mesmo destino nas duas superfícies só
 * dobrava a tela sem dar nada novo.
 *
 * Aula ao vivo, grupo das alunas e Notion são do Método: quem entrou só pelo
 * Mapa os vê travados. O resto é aberto para qualquer pessoa.
 */
export function QuickLinks({
  unlocked,
  lockedNote,
  hasMetodo = true,
}: {
  unlocked: boolean
  lockedNote: string | null
  hasMetodo?: boolean
}) {
  const doMetodo = (link: QuickLink): QuickLink =>
    hasMetodo
      ? link
      : { ...link, description: "Vem com o Método EVP", href: undefined, locked: true }

  const links: QuickLink[] = [
    doMetodo({
      label: "Aula ao vivo",
      description: "Toda sexta às 9h, no Meet",
      icon: Video,
      href: LIVE_CLASS_URL,
    }),
    doMetodo({
      label: "Todas as Alunas",
      description: "O grupo gratuito",
      icon: MessageCircle,
      href: WHATSAPP_FREE_URL,
    }),
    doMetodo({
      label: "Notion",
      description: unlocked
        ? "Materiais e modelos"
        : (lockedNote ?? "Libera em alguns dias"),
      icon: BookOpen,
      href: unlocked ? NOTION_URL : undefined,
      locked: !unlocked,
    }),
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

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {links.map((link) => (
        <QuickLinkItem key={link.label} link={link} />
      ))}
    </div>
  )
}

function QuickLinkItem({ link }: { link: QuickLink }) {
  const { icon: Icon, label, description, href, locked } = link

  const inner = (
    <>
      <span
        className={`flex h-11 w-11 flex-none items-center justify-center rounded-xl transition-colors ${
          locked
            ? "bg-muted text-muted-foreground"
            : "bg-primary-subtle text-primary group-hover:bg-primary group-hover:text-primary-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>

      <span className="flex min-w-0 flex-col gap-0.5">
        <b className="truncate text-[15px] font-semibold text-foreground">{label}</b>
        <small className="truncate text-xs text-muted-foreground">{description}</small>
      </span>

      {locked ? (
        <Lock className="ml-auto h-4 w-4 flex-none text-muted-foreground" />
      ) : (
        <span className="ml-auto flex h-8 w-8 flex-none items-center justify-center rounded-full border border-primary/30 text-primary transition-all duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
        </span>
      )}
    </>
  )

  const base =
    "group flex items-center gap-3.5 rounded-2xl border px-4 py-4 text-left transition-all duration-200 sm:px-5"

  if (!href) {
    return (
      <div aria-disabled className={`${base} cursor-not-allowed border-dashed border-border bg-card/60 opacity-80`}>
        {inner}
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} border-border bg-card shadow-sm hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md`}
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
