import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight, Check, Clock, FileText, Headphones, Play } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { getJornada } from "@/lib/desafio-server"
import {
  FASES_DA_TEORIA,
  ITENS_DA_TEORIA,
  itemDisponivel,
  progressoDaTeoria,
  type FaseDaTeoria,
  type ItemDaTeoria,
} from "@/lib/desafio/teoria"
import { Atmosphere } from "@/components/atmosphere"

/**
 * A parte teórica inteira: as três fases, aula por aula, com o que ela já fez.
 *
 * Vem depois da matrícula — antes dela, volta para a home, que é a matrícula.
 * A ordem é sugerida, não travada: qualquer aula abre a qualquer momento, e o
 * botão grande leva sempre à primeira que falta.
 */
export default async function TeoriaPage() {
  const { email } = await requireDesafio()
  const jornada = await getJornada(email)
  if (!jornada.concluidos.has(0)) redirect("/desafio")

  const progresso = progressoDaTeoria(jornada.dias.get(0)?.respostas)
  const fases = Object.keys(FASES_DA_TEORIA).map(Number) as FaseDaTeoria[]

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-3xl">
        <header className="mb-8 flex flex-col gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Aulas teóricas
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl">
            {progresso.concluida ? "Você já tem o mapa." : "Antes da prática, o mapa."}
          </h1>
          <p className="max-w-[52ch] text-sm leading-relaxed text-muted-foreground">
            {progresso.concluida
              ? "Você entendeu como o mercado funciona e qual é o seu lugar nele. Agora é a parte prática: um dia por vez, até o seu primeiro sim. As aulas continuam aqui para você rever quando quiser."
              : "Aqui você entende como o mercado de vendas funciona e qual é o seu lugar nele. Depois vem a parte prática, um dia por vez. Pode assistir no seu ritmo — e marcar cada aula quando terminar."}
          </p>

          <Barra feitos={progresso.feitos.size} total={progresso.total} />

          {progresso.proximo ? (
            <Link
              href={`/desafio/teoria/${progresso.proximo.chave}`}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:w-fit sm:py-3"
            >
              {progresso.feitos.size === 0 ? "Começar" : "Continuar"}: {progresso.proximo.titulo}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <Link
              href="/desafio"
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:w-fit sm:py-3"
            >
              Ir para a parte prática
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </header>

        <div className="flex flex-col gap-9">
          {fases.map((fase) => (
            <section key={fase} aria-labelledby={`fase-${fase}`} className="flex flex-col gap-3">
              <header className="flex flex-col gap-1 px-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  Fase {fase}
                </span>
                <h2 id={`fase-${fase}`} className="font-display text-xl font-bold tracking-tight text-foreground">
                  {FASES_DA_TEORIA[fase].titulo}
                </h2>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {FASES_DA_TEORIA[fase].descricao}
                </p>
              </header>
              <ol className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
                {ITENS_DA_TEORIA.filter((i) => i.fase === fase).map((item) => (
                  <LinhaDoItem key={item.chave} item={item} feito={progresso.feitos.has(item.chave)} />
                ))}
              </ol>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}

function Barra({ feitos, total }: { feitos: number; total: number }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={feitos}
        aria-label="Aulas feitas"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-700"
          style={{ width: `${total ? (feitos / total) * 100 : 0}%` }}
        />
      </div>
      <span className="flex-none text-xs font-semibold tabular-nums text-muted-foreground">
        {feitos} de {total}
      </span>
    </div>
  )
}

const ICONE = { video: Play, documento: FileText, externo: Headphones } as const

function LinhaDoItem({ item, feito }: { item: ItemDaTeoria; feito: boolean }) {
  const disponivel = itemDisponivel(item)
  const Icone = ICONE[item.tipo]
  const corpo = (
    <>
      <span
        className={`grid h-8 w-8 flex-none place-items-center rounded-full ${
          feito ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {feito ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icone className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <b
          className={`block text-sm font-semibold leading-snug ${
            disponivel ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {item.titulo}
        </b>
        {item.tipo === "documento" && (
          <small className="block text-xs text-muted-foreground">PDF para baixar</small>
        )}
      </span>
      {!disponivel ? (
        <span className="flex-none rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Em breve
        </span>
      ) : (
        item.duracao && (
          <span className="inline-flex flex-none items-center gap-1 text-xs tabular-nums text-muted-foreground">
            <Clock className="h-3 w-3" />
            {item.duracao}
          </span>
        )
      )}
    </>
  )

  return (
    <li className="border-b border-border last:border-b-0">
      {disponivel ? (
        <Link
          href={`/desafio/teoria/${item.chave}`}
          className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-primary-subtle/50 sm:px-5"
        >
          {corpo}
        </Link>
      ) : (
        <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">{corpo}</div>
      )}
    </li>
  )
}
