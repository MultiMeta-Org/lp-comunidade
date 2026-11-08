import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { MATERIAIS_DA_BIBLIOTECA, TRILHAS, getMaterial } from "@/lib/desafio/biblioteca"
import { assinarMateriais } from "@/lib/desafio/biblioteca-server"
import { Atmosphere } from "@/components/atmosphere"
import { CardDoMaterial } from "@/components/desafio/biblioteca"

/**
 * Uma aula extra da Biblioteca, tocando no portal.
 *
 * O vídeo sai do bucket privado com signed URL gerada aqui, depois do guard —
 * é o motivo de ela não ir mais para o Drive. Embaixo, o resto da trilha, para
 * emendar uma aula na outra.
 */
export default async function MaterialPage({ params }: { params: Promise<{ chave: string }> }) {
  await requireDesafio()

  const { chave } = await params
  const material = getMaterial(chave)
  if (!material || material.tipo !== "video" || !material.arquivo) notFound()

  const vizinhos = MATERIAIS_DA_BIBLIOTECA.filter(
    (m) => m.trilha === material.trilha && m.chave !== material.chave && m.arquivo
  )
  const [[m], resto] = await Promise.all([
    assinarMateriais([material], ["arquivo", "capa"]),
    assinarMateriais(vizinhos),
  ])
  const dia = m.dia ?? m.aprofunda?.[0]

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <Link
          href="/desafio/biblioteca"
          className="mb-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Biblioteca
        </Link>

        <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
          {TRILHAS[m.trilha].titulo}
        </p>
        <h1 className="mb-5 font-display text-[clamp(24px,3.6vw,32px)] font-bold leading-[1.15] text-foreground">
          {m.titulo}
        </h1>

        {m.arquivo ? (
          <video
            controls
            preload="metadata"
            playsInline
            poster={m.capa}
            className="aspect-video w-full overflow-hidden rounded-[18px] border border-border bg-black object-contain shadow-sm"
            aria-label={m.titulo}
          >
            <source src={m.arquivo} type="video/mp4" />
          </video>
        ) : (
          <p className="rounded-[18px] border border-dashed border-border bg-muted/60 px-5 py-8 text-center text-sm text-muted-foreground">
            Não consegui carregar o vídeo agora. Recarregue a página em instantes.
          </p>
        )}

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start">
          <p className="max-w-[56ch] flex-1 text-[15px] leading-relaxed text-foreground">{m.resumo}</p>
          <div className="flex flex-none flex-col items-start gap-2 sm:items-end">
            {m.duracao && (
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {m.duracao}
              </span>
            )}
            {dia !== undefined && (
              <Link
                href={`/desafio/dia/${dia}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:underline"
              >
                {m.dia !== undefined ? "Do" : "Combina com o"} Dia {dia}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {resto.length > 0 && (
          <section aria-labelledby="mesma-trilha" className="mt-12">
            <h2 id="mesma-trilha" className="mb-4 font-display text-lg font-bold tracking-tight text-foreground">
              Mais de {TRILHAS[m.trilha].titulo}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {resto.map((v) => (
                <CardDoMaterial key={v.chave} m={v} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
