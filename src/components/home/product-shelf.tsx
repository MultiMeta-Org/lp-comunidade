"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BookOpen, Lock, MessageCircle } from "lucide-react"
import type { Product } from "@/lib/home"
import { WHATSAPP_VIP_URL } from "@/lib/links"
import { LAB_NAME, MATERIAL_NAME } from "@/lib/produto"
import { Modal } from "@/components/ui/modal"

/**
 * Fileira de capas de produto. Uma fileira para o que a aluna já tem, outra
 * para o que ela ainda vai conhecer (com cadeado). Produto sem `href` fica
 * inerte — o ambiente dele ainda não existe no portal.
 *
 * Travado com `href` + `cta` é o terceiro caso: existe, não é dela, mas está à
 * venda. A capa continua com cadeado (não é mentira: ela ainda não tem), só que
 * clica e leva para a compra.
 *
 * E o quarto: `chooser`. O Laboratório tem dois ambientes dentro do portal, e
 * a capa abre a escolha entre eles — por isso este arquivo é client: a capa
 * precisa de estado para o diálogo.
 */
export function ProductShelf({ products }: { products: Product[] }) {
  const [escolhendo, setEscolhendo] = useState(false)

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.slug}
            product={product}
            onChoose={() => setEscolhendo(true)}
          />
        ))}
      </div>

      {escolhendo && (
        <Modal title={LAB_NAME} size="sm" onClose={() => setEscolhendo(false)}>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Sua assinatura tem dois lugares. Por onde você quer entrar?
          </p>
          <div className="grid gap-3">
            <Door
              icon={MessageCircle}
              label="Grupo no WhatsApp"
              description="Onde a gente conversa todo dia"
              href={WHATSAPP_VIP_URL}
            />
            <Door
              icon={BookOpen}
              label={MATERIAL_NAME}
              description="Vídeos, áudios e PDFs de todas as aulas"
              href="/aulas"
            />
          </div>
        </Modal>
      )}
    </>
  )
}

function ProductCard({
  product,
  onChoose,
}: {
  product: Product
  onChoose: () => void
}) {
  const locked = product.state !== "owned"
  const clicavel = Boolean(product.href) || product.chooser

  const poster = (
    <span
      className={`relative isolate grid aspect-[3/4] grid-rows-[1fr_auto] overflow-hidden rounded-2xl border border-border p-4 shadow-sm transition-all duration-300 ${
        locked ? "saturate-[0.7]" : ""
      } ${clicavel ? "group-hover:-translate-y-1 group-hover:shadow-md" : ""}`}
      style={{ background: product.art }}
    >
      {/* Malha fina sobre a capa: dá textura e disfarça o gradiente chapado. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(245,242,237,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(245,242,237,.6) 1px,transparent 1px)",
          backgroundSize: "25px 25px",
        }}
      />

      {locked && (
        <span className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-[9px] bg-foreground/80 text-background">
          <Lock className="h-3.5 w-3.5" />
        </span>
      )}

      <span className="relative self-start text-[9px] font-bold uppercase tracking-[0.2em] text-background/75">
        {product.kicker}
      </span>
      <span className="relative font-serif text-xl font-bold uppercase leading-none text-background">
        {product.name}
      </span>
    </span>
  )

  const body = (
    <>
      {poster}
      <span className="text-sm font-semibold text-foreground">{product.name}</span>
      {locked && product.cta ? (
        <span className="inline-flex w-fit items-center gap-1 rounded-full bg-secondary-subtle px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-secondary transition-all duration-200 group-hover:gap-1.5">
          {product.cta}
          <ArrowUpRight className="h-3 w-3" />
        </span>
      ) : locked ? (
        <span className="inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {product.state === "soon" ? "Em breve" : "Não incluído"}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">{product.meta}</span>
      )}
    </>
  )

  const base = "group flex w-full flex-col gap-2.5 text-left"

  if (product.chooser) {
    return (
      <button type="button" onClick={onChoose} className={`${base} cursor-pointer`}>
        {body}
      </button>
    )
  }

  if (!product.href) {
    return (
      <div className={base} aria-disabled={locked || undefined}>
        {body}
      </div>
    )
  }

  if (product.href.startsWith("/")) {
    return (
      <Link href={product.href} className={base}>
        {body}
      </Link>
    )
  }

  return (
    <a href={product.href} target="_blank" rel="noopener noreferrer" className={base}>
      {body}
    </a>
  )
}

/**
 * Uma das portas do Laboratório, dentro do seletor. Mesma linguagem das capas:
 * lavagem terracota, a cor do produto.
 */
function Door({
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
  const interno = href.startsWith("/")

  const body = (
    <>
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
    "group relative isolate flex items-start gap-4 overflow-hidden rounded-2xl border border-secondary/25 bg-card p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"

  if (interno) {
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
