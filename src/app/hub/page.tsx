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
import Link from "next/link"

export const metadata = {
  title: "Hub da Aluna · DVP",
  description: "Tudo que você precisa, num lugar só.",
}

export default function HubPage() {
  return (
    <main className="min-h-screen flex flex-col items-center px-5 py-12">
      <div className="w-full max-w-sm space-y-10">

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

        {/* ── Comunidade ── */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            Comunidade
          </p>

          <StandardLink
            icon={MessageCircle}
            label="Suporte WhatsApp"
            description="Fale com a equipe"
            href="#"
          />

          <StandardLink
            icon={Users}
            label="Grupo de Todas as Alunas"
            description="Comunidade gratuita"
            href="#"
          />

          {/* VIP — destaque */}
          <a
            href="#"
            className="flex items-center gap-4 w-full rounded-xl bg-secondary text-secondary-foreground px-5 py-4 hover:opacity-90 transition-opacity"
          >
            <Crown className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Comunidade VIP</p>
              <p className="text-xs opacity-70 mt-0.5">Seu espaço exclusivo</p>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70 flex-shrink-0" />
          </a>
        </div>

        {/* ── Ferramentas ── */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            Ferramentas
          </p>

          <StandardLink
            icon={BookOpen}
            label="Notion"
            description="Seus materiais e templates"
            href="#"
          />

          {/* Marketplace — bloqueado */}
          <div className="flex items-center gap-4 w-full rounded-xl border border-border bg-card px-5 py-4 opacity-50 cursor-not-allowed">
            <ShoppingBag className="w-5 h-5 flex-shrink-0 text-foreground" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground">Marketplace</p>
              <p className="text-xs text-muted-foreground mt-0.5">Disponível no 8º dia</p>
            </div>
            <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          </div>
        </div>

        {/* ── Ao Vivo ── */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">
            Ao Vivo
          </p>

          <a
            href="#"
            className="flex items-center gap-4 w-full rounded-xl bg-primary text-primary-foreground px-5 py-4 hover:opacity-90 transition-opacity"
          >
            <Video className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Aula ao Vivo</p>
              <p className="text-xs opacity-70 mt-0.5">Toda sexta às 9h · mesmo link</p>
            </div>
            <ArrowRight className="w-4 h-4 opacity-70 flex-shrink-0" />
          </a>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-2">
          © {new Date().getFullYear()} MultiMeta
        </p>
      </div>
    </main>
  )
}

function StandardLink({
  icon: Icon,
  label,
  description,
  href,
}: {
  icon: React.ElementType
  label: string
  description: string
  href: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 w-full rounded-xl border border-border bg-card px-5 py-4 hover:bg-accent transition-colors"
    >
      <Icon className="w-5 h-5 flex-shrink-0 text-foreground" />
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
    </a>
  )
}
