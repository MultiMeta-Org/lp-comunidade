import {
  MessageCircle,
  Users,
  Crown,
  ShoppingBag,
  BookOpen,
  Video,
  Lock,
  ArrowRight,
} from "lucide-react"

import { requireReleasedAccess } from "@/lib/guard"

export const metadata = {
  title: "Hub da Aluna · DVP",
  description: "Tudo que você precisa, num lugar só.",
}

export default async function HubPage() {
  await requireReleasedAccess()

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-5 py-12 overflow-hidden">
      <Decor />
      <div className="relative z-10 w-full max-w-4xl space-y-8">

        {/* ── Brand + Avatar ── */}
        <div className="text-center space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            MultiMeta · DVP
          </p>
          <div className="mx-auto w-16 h-16 rounded-full bg-muted border border-border flex items-center justify-center">
            <span className="text-xl font-serif font-bold text-muted-foreground">A</span>
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-foreground leading-tight">
              Hub da Aluna
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tudo que você precisa, num lugar só.
            </p>
          </div>
        </div>

        {/* ── Bento box ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 auto-rows-[140px] gap-3">

          {/* VIP — feature largo */}
          <BentoTile
            href="#"
            icon={Crown}
            label="Comunidade VIP"
            description="Seu espaço exclusivo"
            variant="secondary"
            className="col-span-2"
          />

          {/* Aula ao Vivo — feature alto */}
          <BentoTile
            href="#"
            icon={Video}
            label="Aula ao Vivo"
            description="Toda sexta às 9h · mesmo link"
            variant="primary"
            className="row-span-2"
          />

          <BentoTile
            href="#"
            icon={MessageCircle}
            label="Suporte"
            description="WhatsApp"
          />

          <BentoTile
            href="#"
            icon={Users}
            label="Todas as Alunas"
            description="Grupo gratuito"
          />

          <BentoTile
            href="#"
            icon={BookOpen}
            label="Notion"
            description="Materiais e templates"
          />

          {/* Marketplace — bloqueado */}
          <BentoTile
            icon={ShoppingBag}
            label="Marketplace"
            description="Disponível no 8º dia"
            locked
          />
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          © {new Date().getFullYear()} MultiMeta
        </p>
      </div>
    </main>
  )
}

/* ── Arte decorativa (line art botânico) ── */
function Decor() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 select-none">
      {/* Galho de folhas — topo esquerdo */}
      <Sprig className="hidden sm:block absolute -left-6 top-10 w-28 lg:w-36 text-primary opacity-20 -rotate-12" />

      {/* Galho de folhas — base direita (espelhado) */}
      <Sprig className="hidden sm:block absolute -right-8 bottom-8 w-28 lg:w-40 text-secondary opacity-20 rotate-[195deg]" />

      {/* Sol nascente — topo direito */}
      <Sun className="hidden md:block absolute right-16 top-24 w-20 lg:w-24 text-secondary opacity-25" />

      {/* Semente / broto — base esquerda */}
      <Seedhead className="hidden md:block absolute left-16 bottom-20 w-16 lg:w-20 text-primary opacity-25" />

      {/* Rabisco ondulado — sob o cabeçalho */}
      <Squiggle className="absolute left-1/2 top-6 -translate-x-1/2 w-40 sm:w-56 text-secondary opacity-15" />
    </div>
  )
}

function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 240"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M70 236C64 196 74 168 68 132 62 96 74 60 70 8" />
      <path d="M68 128C48 120 34 104 34 82 56 86 68 106 68 128Z" />
      <path d="M70 88C50 80 36 64 36 42 58 46 70 66 70 88Z" />
      <path d="M69 150C89 142 103 126 103 104 81 108 69 128 69 150Z" />
      <path d="M71 106C91 98 105 82 105 60 83 64 71 84 71 106Z" />
    </svg>
  )
}

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="60" cy="60" r="20" />
      <path d="M60 12v14M60 94v14M12 60h14M94 60h14M26 26l10 10M84 84l10 10M94 26 84 36M36 84 26 94" />
    </svg>
  )
}

function Seedhead({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M50 156V54" />
      <path d="M50 54C50 30 66 14 84 10 82 34 68 52 50 54Z" />
      <path d="M50 78C40 72 30 60 30 44 44 48 52 62 50 78Z" />
      <path d="M50 104C62 98 74 86 74 70 58 74 50 88 50 104Z" />
    </svg>
  )
}

function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className={className}
    >
      <path d="M6 16C26 2 40 30 62 16S104 2 126 16s44 14 66 0" />
    </svg>
  )
}

function BentoTile({
  icon: Icon,
  label,
  description,
  href,
  variant = "default",
  locked = false,
  className = "",
}: {
  icon: React.ElementType
  label: string
  description: string
  href?: string
  variant?: "default" | "primary" | "secondary"
  locked?: boolean
  className?: string
}) {
  const surface =
    variant === "primary"
      ? "bg-primary text-primary-foreground"
      : variant === "secondary"
      ? "bg-secondary text-secondary-foreground"
      : "border border-border bg-card text-foreground"

  const content = (
    <>
      <div className="flex items-center justify-between">
        <Icon className="w-6 h-6 flex-shrink-0" />
        {locked ? (
          <Lock className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ArrowRight
            className={`w-4 h-4 ${variant === "default" ? "text-muted-foreground" : "opacity-70"}`}
          />
        )}
      </div>
      <div>
        <p className="font-semibold text-sm leading-tight">{label}</p>
        <p
          className={`text-xs mt-0.5 leading-tight ${
            variant === "default" ? "text-muted-foreground" : "opacity-70"
          }`}
        >
          {description}
        </p>
      </div>
    </>
  )

  const base = `flex flex-col justify-between rounded-2xl p-4 h-full ${surface} ${className}`

  if (locked || !href) {
    return (
      <div className={`${base} opacity-50 cursor-not-allowed`}>{content}</div>
    )
  }

  return (
    <a href={href} className={`${base} hover:opacity-90 transition-opacity`}>
      {content}
    </a>
  )
}
