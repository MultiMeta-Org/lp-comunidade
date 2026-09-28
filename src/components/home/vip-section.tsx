import Link from "next/link"
import { ArrowUpRight, MessageCircle, BookOpen } from "lucide-react"
import { WHATSAPP_VIP_URL } from "@/lib/links"

type Door = {
  label: string
  description: string
  icon: React.ElementType
  href: string
}

/**
 * As portas de dentro da Comunidade VIP: o grupo no WhatsApp e o material das
 * aulas. Só aparece para quem tem a assinatura.
 *
 * Por que não são duas capas na estante: capa ali significa "um produto", e
 * isto é um produto só com dois ambientes. E por que a VIP some da estante
 * quando é dela: repetir o mesmo destino em duas superfícies dobra a tela sem
 * dar nada novo. Produto travado continua capa com cadeado; produto seu se
 * abre nesta seção.
 */
export function VipSection() {
  const doors: Door[] = [
    {
      label: "Grupo no WhatsApp",
      description: "Onde a gente conversa todo dia",
      icon: MessageCircle,
      href: WHATSAPP_VIP_URL,
    },
    {
      label: "Material de aulas",
      description: "Vídeos, áudios e PDFs de todas as aulas",
      icon: BookOpen,
      href: "/aulas",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {doors.map((door) => (
        <DoorCard key={door.label} door={door} />
      ))}
    </div>
  )
}

function DoorCard({ door }: { door: Door }) {
  const { icon: Icon, label, description, href } = door
  const internal = href.startsWith("/")

  const body = (
    <>
      {/* Lavagem terracota: a cor da Comunidade VIP, a mesma da capa dela. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "linear-gradient(135deg, var(--secondary-subtle) 0%, transparent 62%)",
        }}
      />

      <span className="relative flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-secondary text-secondary-foreground shadow-sm">
        <Icon className="h-5 w-5" />
      </span>

      <span className="relative flex min-w-0 flex-col gap-1">
        <b className="font-serif text-lg font-bold leading-tight text-foreground">
          {label}
        </b>
        <small className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </small>
      </span>

      <ArrowUpRight className="relative ml-auto h-4 w-4 flex-none self-start text-border transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-secondary" />
    </>
  )

  const base =
    "group relative isolate flex items-start gap-4 overflow-hidden rounded-3xl border border-secondary/25 bg-card p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"

  if (internal) {
    return (
      <Link href={href} className={base}>
        {body}
      </Link>
    )
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={base}>
      {body}
    </a>
  )
}
