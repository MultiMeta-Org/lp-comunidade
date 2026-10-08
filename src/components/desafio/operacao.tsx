import Link from "next/link"
import { ArrowRight, CalendarClock, MessageCircle, Users } from "lucide-react"
import type { Operacao } from "@/lib/desafio-server"

/**
 * "Sua operação hoje" — o que o Dia 9 pede: o portal trabalhando POR ela.
 *
 * Só aparece quando existe operação de verdade (alguma empresa abordada). Até
 * o Dia 6 a aluna não falou com ninguém, e um painel com três zeros no topo da
 * tela diria a ela que está atrasada no primeiro dia.
 *
 * As duas métricas de cima são diferentes de propósito, e o documento pede que
 * a diferença fique clara: RADAR são as empresas que ela encontrou, ABORDADAS
 * são aquelas com quem ela iniciou contato. Confundir as duas desanima sem
 * motivo — ter 30 no Radar e 10 abordadas não é 20 de dívida.
 */
export function OperacaoDeHoje({ operacao }: { operacao: Operacao }) {
  const { placar, followUpsDeHoje, conversasAbertas, reunioesMarcadas } = operacao

  if (placar.abordadas === 0) return null

  return (
    <section
      aria-label="Sua operação hoje"
      className="flex flex-col gap-4 rounded-[22px] border border-border bg-card px-5 py-5 sm:px-6"
    >
      <h2 className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        Sua operação hoje
      </h2>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Numero n={placar.noRadar} label="no radar" ajuda="empresas que você encontrou" />
        <Numero
          n={placar.abordadas}
          label="abordadas"
          ajuda="empresas com quem você falou"
        />
        <Numero n={placar.emConversa} label="em conversa" />
        <Numero n={placar.fechados || placar.propostas} label={placar.fechados ? "fechadas" : "propostas"} />
      </div>

      {(followUpsDeHoje.length > 0 ||
        conversasAbertas.length > 0 ||
        reunioesMarcadas.length > 0) && (
        <div className="flex flex-col gap-2 border-t border-border pt-4">
          {followUpsDeHoje.length > 0 && (
            <Fila
              icone={<CalendarClock className="h-4 w-4 flex-none text-secondary" />}
              titulo={`${followUpsDeHoje.length} ${followUpsDeHoje.length === 1 ? "follow-up" : "follow-ups"} para hoje`}
              sub={followUpsDeHoje
                .slice(0, 3)
                .map((e) => e.nome)
                .join(" · ")}
              destaque
            />
          )}
          {conversasAbertas.length > 0 && (
            <Fila
              icone={<MessageCircle className="h-4 w-4 flex-none text-primary" />}
              titulo={`${conversasAbertas.length} ${conversasAbertas.length === 1 ? "conversa aberta" : "conversas abertas"}`}
              sub={conversasAbertas
                .slice(0, 3)
                .map((e) => e.nome)
                .join(" · ")}
            />
          )}
          {reunioesMarcadas.length > 0 && (
            <Fila
              icone={<Users className="h-4 w-4 flex-none text-primary" />}
              titulo={`${reunioesMarcadas.length} ${reunioesMarcadas.length === 1 ? "reunião" : "reuniões"}`}
              sub={reunioesMarcadas
                .slice(0, 3)
                .map((e) => e.nome)
                .join(" · ")}
            />
          )}
        </div>
      )}

      <Link
        href="/desafio/radar"
        className="group inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
      >
        Abrir meu Radar
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  )
}

function Numero({
  n,
  label,
  ajuda,
}: {
  n: number
  label: string
  ajuda?: string
}) {
  return (
    <div className="flex flex-col">
      <b className="font-display text-2xl font-bold leading-none text-foreground">{n}</b>
      <small className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </small>
      {ajuda && (
        <small className="mt-0.5 text-[10px] leading-tight text-muted-foreground/80">
          {ajuda}
        </small>
      )}
    </div>
  )
}

function Fila({
  icone,
  titulo,
  sub,
  destaque = false,
}: {
  icone: React.ReactNode
  titulo: string
  sub: string
  destaque?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 ${
        destaque ? "bg-secondary-subtle" : "bg-muted/60"
      }`}
    >
      {icone}
      <span className="min-w-0 flex-1">
        <b className="block text-[13px] font-semibold text-foreground">{titulo}</b>
        <small className="block truncate text-[11.5px] text-muted-foreground">{sub}</small>
      </span>
    </div>
  )
}
