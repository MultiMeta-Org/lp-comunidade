import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Clock, Download } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { getInteresses, getJornada } from "@/lib/desafio-server"
import {
  FASES_DA_TEORIA,
  getItemDaTeoria,
  itemAnterior,
  itemDisponivel,
  itemSeguinte,
  progressoDaTeoria,
  type Destaque,
} from "@/lib/desafio/teoria"
import { assinarMateriais } from "@/lib/desafio/biblioteca-server"
import { Atmosphere } from "@/components/atmosphere"
import { Avisos } from "@/components/desafio/avisos"
import { ConcluirItem, InteresseDaTeoria, PerfilComercial } from "@/components/desafio/teoria"

/**
 * Uma aula da parte teórica: o vídeo (ou o PDF, ou o link de fora), os
 * recados da Nati embaixo dele e o botão que marca e leva à próxima.
 */
export default async function ItemDaTeoriaPage({ params }: { params: Promise<{ chave: string }> }) {
  const { email } = await requireDesafio()

  const { chave } = await params
  const item = getItemDaTeoria(chave)
  if (!item || !itemDisponivel(item)) notFound()

  const [jornada, interesses, [assinado]] = await Promise.all([
    getJornada(email),
    item.interesse ? getInteresses(email) : Promise.resolve(new Map<string, string | null>()),
    assinarMateriais([item], item.tipo === "video" ? ["arquivo", "capa"] : ["capa"]),
  ])
  if (!jornada.concluidos.has(0)) redirect("/desafio")

  const respostas = jornada.dias.get(0)?.respostas
  const progresso = progressoDaTeoria(respostas)
  const seguinte = itemSeguinte(item.chave)
  const anterior = itemAnterior(item.chave)
  const perfil = typeof respostas?.perfil_comercial === "string" ? respostas.perfil_comercial : null

  // Na última aula, ou quando esta fecha o que faltava, o próximo destino é a
  // página da teoria — que diz "concluída" e aponta para a prática.
  const proximo = seguinte
    ? { href: `/desafio/teoria/${seguinte.chave}`, rotulo: "Próxima aula" }
    : { href: "/desafio/teoria", rotulo: "Ver a parte teórica" }

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="lesson" />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-5">
        <Link
          href="/desafio/teoria"
          className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Parte teórica · {progresso.feitos.size} de {progresso.total}
        </Link>

        <header className="flex flex-col gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
            Fase {item.fase} · {FASES_DA_TEORIA[item.fase].titulo}
          </p>
          <h1 className="font-display text-[clamp(24px,3.6vw,32px)] font-bold leading-[1.15] text-foreground">
            {item.titulo}
          </h1>
          {item.duracao && (
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {item.duracao}
            </span>
          )}
        </header>

        {item.tipo === "video" &&
          (assinado.arquivo ? (
            <video
              controls
              preload="metadata"
              playsInline
              poster={assinado.capa}
              className="aspect-video w-full overflow-hidden rounded-[18px] border border-border bg-black object-contain shadow-sm"
              aria-label={item.titulo}
            >
              <source src={assinado.arquivo} type="video/mp4" />
            </video>
          ) : (
            <p className="rounded-[18px] border border-dashed border-border bg-muted/60 px-5 py-8 text-center text-sm text-muted-foreground">
              Não consegui carregar o vídeo agora. Recarregue a página em instantes.
            </p>
          ))}

        {item.tipo === "documento" && (
          <a
            href={`/desafio/teoria/${item.chave}/arquivo`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col overflow-hidden rounded-[18px] border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:flex-row"
          >
            {assinado.capa && (
              // Signed URL que expira: o otimizador do next/image buscaria de novo.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={assinado.capa} alt="" className="aspect-video w-full object-cover sm:w-72" />
            )}
            <span className="flex flex-1 flex-col justify-center gap-2 p-5">
              <b className="font-display text-lg font-bold text-foreground">{item.titulo}</b>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Download className="h-4 w-4" />
                Baixar o PDF
              </span>
            </span>
          </a>
        )}

        {item.tipo === "externo" && item.href && (
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 sm:w-fit sm:py-3"
          >
            {item.perfil ? "Fazer o teste" : "Abrir no Spotify"}
            <ArrowUpRight className="h-4 w-4" />
          </a>
        )}

        {item.resumo && (
          <p className="max-w-[60ch] text-[15px] leading-relaxed text-foreground">{item.resumo}</p>
        )}

        {item.anexo && (
          <a
            href={`/desafio/teoria/${item.chave}/arquivo?anexo=1`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-primary/45 bg-card px-5 py-3 text-sm font-semibold text-primary transition-all hover:-translate-y-0.5 sm:w-fit sm:py-2.5"
          >
            <Download className="h-4 w-4" />
            {item.anexo.rotulo}
          </a>
        )}

        {item.perfil && <PerfilComercial inicial={perfil} />}

        {item.destaques?.map((d) => <CartaoDestaque key={d.titulo} d={d} />)}

        {item.interesse && (
          <InteresseDaTeoria
            chave={item.chave}
            titulo={item.interesse.titulo}
            texto={item.interesse.texto}
            botao={item.interesse.botao}
            jaDeclarado={interesses.has(item.interesse.chave)}
          />
        )}

        <Avisos avisos={item.avisos} />

        <footer className="mt-4 flex flex-col gap-4 border-t border-border pt-6">
          <ConcluirItem chave={item.chave} feito={progresso.feitos.has(item.chave)} proximo={proximo} />
          {anterior && (
            <Link
              href={`/desafio/teoria/${anterior.chave}`}
              className="inline-flex w-fit items-center gap-1.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {anterior.titulo}
            </Link>
          )}
        </footer>
      </div>
    </main>
  )
}

/** Um produto em destaque: a calculadora, o MultiQuiz. */
function CartaoDestaque({ d }: { d: Destaque }) {
  return (
    <section className="relative flex flex-col gap-2 overflow-hidden rounded-[20px] border border-secondary/50 bg-gradient-to-br from-secondary-subtle/60 to-card px-5 py-5 sm:px-6">
      <span className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-secondary">{d.kicker}</span>
      <b className="font-display text-xl font-bold leading-snug text-foreground">{d.titulo}</b>
      <p className="text-sm leading-relaxed text-muted-foreground">{d.texto}</p>
      {d.preco && <p className="text-sm font-semibold text-foreground">{d.preco}</p>}
      <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {d.links.map((l, n) => (
          <a
            key={l.href}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex w-full items-center justify-center gap-1.5 rounded-full px-5 py-3 text-xs font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:w-fit sm:py-2.5 ${
              n === 0
                ? "bg-primary text-primary-foreground"
                : "border border-primary/45 bg-card text-primary"
            }`}
          >
            {l.rotulo}
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        ))}
      </div>
    </section>
  )
}
