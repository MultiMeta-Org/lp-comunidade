import Link from "next/link"
import { Lock } from "lucide-react"
import type { Product } from "@/lib/home"

/**
 * Fileira de capas de produto. Uma fileira para o que a aluna já tem, outra
 * para o que ela ainda vai conhecer (com cadeado). Produto sem `href` fica
 * inerte — o ambiente dele ainda não existe no portal.
 */
export function ProductShelf({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  const locked = product.state !== "owned"

  const poster = (
    <span
      className={`relative isolate grid aspect-[3/4] grid-rows-[1fr_auto] overflow-hidden rounded-2xl border border-border p-4 shadow-sm transition-all duration-300 ${
        locked ? "saturate-[0.7]" : ""
      } ${product.href ? "group-hover:-translate-y-1 group-hover:shadow-md" : ""}`}
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
      {locked ? (
        <span className="inline-flex w-fit items-center rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {product.state === "soon" ? "Em breve" : "Não incluído"}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">{product.meta}</span>
      )}
    </>
  )

  const base = "group flex w-full flex-col gap-2.5 text-left"

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
