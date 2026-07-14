import {
  MessageCircle,
  Users,
  Crown,
  ShoppingBag,
  BookOpen,
  Video,
  Lock,
} from "lucide-react";

const LINKS = [
  {
    id: "whatsapp-suporte",
    icon: MessageCircle,
    label: "Suporte WhatsApp",
    description: "Fale com a equipe de suporte",
    href: "#",
    variant: "primary" as const,
    locked: false,
  },
  {
    id: "grupo-alunas",
    icon: Users,
    label: "Grupo de Todas as Alunas",
    description: "Comunidade gratuita com todas as participantes",
    href: "#",
    variant: "default" as const,
    locked: false,
  },
  {
    id: "comunidade-vip",
    icon: Crown,
    label: "Comunidade VIP",
    description: "Seu espaço exclusivo de alunas avançadas",
    href: "#",
    variant: "secondary" as const,
    locked: false,
  },
  {
    id: "marketplace",
    icon: ShoppingBag,
    label: "Marketplace",
    description: "Disponível a partir do 8º dia",
    href: "#",
    variant: "default" as const,
    locked: true,
  },
  {
    id: "notion",
    icon: BookOpen,
    label: "Notion — Sua Ferramenta de Trabalho",
    description: "Acesse seus materiais e templates",
    href: "#",
    variant: "default" as const,
    locked: false,
  },
  {
    id: "aula-ao-vivo",
    icon: Video,
    label: "Aula ao Vivo — Sextas às 9h",
    description: "Link fixo toda sexta-feira",
    href: "#",
    variant: "default" as const,
    locked: false,
  },
];

type Variant = "primary" | "secondary" | "default";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 border-transparent",
  secondary:
    "bg-secondary text-secondary-foreground hover:opacity-90 border-transparent",
  default: "bg-card text-card-foreground hover:bg-accent border-border",
};

export default function HubPage() {
  return (
    <main className="flex flex-col items-center min-h-screen py-16 px-4">
      <div className="w-full max-w-md space-y-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold tracking-widest uppercase text-muted-foreground">
            MultiMeta
          </p>
          <h1 className="text-3xl font-bold text-foreground leading-tight">
            Hub da Aluna DVP
          </h1>
          <p className="text-muted-foreground text-sm">
            Tudo que você precisa, num lugar só.
          </p>
        </div>

        {/* Avatar placeholder */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-muted border-2 border-border flex items-center justify-center">
            <span className="text-2xl font-bold text-muted-foreground">A</span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-3">
          {LINKS.map(
            ({ id, icon: Icon, label, description, href, variant, locked }) => (
              <a
                key={id}
                href={locked ? undefined : href}
                aria-disabled={locked}
                className={[
                  "flex items-center gap-4 w-full rounded-lg border px-4 py-4 transition-all",
                  variantClasses[variant],
                  locked
                    ? "opacity-50 cursor-not-allowed pointer-events-none"
                    : "cursor-pointer shadow-sm hover:shadow-md",
                ].join(" ")}
              >
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm leading-tight">{label}</p>
                  <p className="text-xs mt-0.5 opacity-70 truncate">
                    {description}
                  </p>
                </div>
                {locked && (
                  <Lock className="w-4 h-4 flex-shrink-0 opacity-60" />
                )}
              </a>
            )
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          © {new Date().getFullYear()} MultiMeta · DVP
        </p>
      </div>
    </main>
  );
}
