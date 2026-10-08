import Link from "next/link"
import { Check, Lock } from "lucide-react"
import { NUMEROS_DOS_DIAS, TOTAL_DIAS, diaDisponivel, getDia, podeAbrir } from "@/lib/desafio"

/**
 * A jornada inteira: os 21 dias (mais o Zero) de uma vez.
 *
 * Por que mostrar tudo, inclusive o que ela não pode abrir: o Desafio é uma
 * promessa de 21 dias, e uma lista que só revela o dia de hoje esconde
 * justamente o tamanho do que ela está construindo. O cadeado nos dias à
 * frente não é bloqueio decorativo — é o recado de que isso é para ser vivido
 * um pouquinho por dia, não maratonado numa tarde.
 *
 * Dia concluído é clicável: o documento pede que os anteriores sejam
 * revisitáveis e editáveis.
 *
 * O conteúdo é separado do `aside` porque ele vive em dois lugares: a coluna
 * da esquerda na tela larga e o painel do `JornadaMenu` no celular — onde 22
 * linhas antes da missão de hoje empurrariam para baixo a única coisa que ela
 * precisa fazer agora.
 */
export function Jornada(props: {
  concluidos: ReadonlySet<number>
  atual: number
  empresasNoRadar: number
}) {
  return (
    <aside className="w-full min-w-0 lg:sticky lg:top-24">
      <ConteudoDaJornada {...props} />
    </aside>
  )
}

export function ConteudoDaJornada({
  concluidos,
  atual,
  empresasNoRadar,
}: {
  concluidos: ReadonlySet<number>
  atual: number
  empresasNoRadar: number
}) {
  const feitos = [...concluidos].filter((d) => d >= 1).length

  return (
    <div className="flex w-full min-w-0 flex-col gap-3.5">
      <AnelDoProgresso feitos={feitos} />

      <nav aria-label="Os 21 dias" className="flex min-w-0 flex-col gap-0.5">
        {NUMEROS_DOS_DIAS.map((n) => (
          <LinhaDoDia
            key={n}
            n={n}
            concluido={concluidos.has(n)}
            atual={n === atual}
            aberto={podeAbrir(n, concluidos)}
          />
        ))}
      </nav>

      <div className="flex gap-6 rounded-2xl bg-muted px-4 py-4 sm:px-5">
        <div className="flex flex-col">
          <b className="font-serif text-xl font-bold leading-none text-foreground">
            {feitos}
          </b>
          <small className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            dias feitos
          </small>
        </div>
        <div className="flex flex-col">
          <b className="font-serif text-xl font-bold leading-none text-foreground">
            {empresasNoRadar}
          </b>
          <small className="mt-1 text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            no radar
          </small>
        </div>
      </div>
    </div>
  )
}

/** O anel. 21 dias, não 22 — o Dia Zero é matrícula. */
function AnelDoProgresso({ feitos }: { feitos: number }) {
  const r = 23
  const volta = 2 * Math.PI * r
  const falta = volta * (1 - feitos / TOTAL_DIAS)

  return (
    <div className="flex items-center gap-3.5 rounded-[18px] border border-border bg-card px-4 py-4">
      <div className="relative h-[54px] w-[54px] flex-none">
        <svg width="54" height="54" viewBox="0 0 54 54" className="-rotate-90">
          <circle cx="27" cy="27" r={r} fill="none" stroke="var(--muted)" strokeWidth="5" />
          <circle
            cx="27"
            cy="27"
            r={r}
            fill="none"
            stroke="var(--primary)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={volta}
            strokeDashoffset={falta}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        <span className="absolute inset-0 grid place-items-center font-serif text-[15px] font-bold text-foreground">
          {feitos}
        </span>
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <b className="text-[13px] font-semibold text-foreground">Missão Primeiro Sim</b>
        <small className="text-[11.5px] leading-snug text-muted-foreground">
          21 dias, um por vez
        </small>
      </div>
    </div>
  )
}

function LinhaDoDia({
  n,
  concluido,
  atual,
  aberto,
}: {
  n: number
  concluido: boolean
  atual: boolean
  aberto: boolean
}) {
  const dia = getDia(n)
  const existe = diaDisponivel(n)
  const rotulo = n === 0 ? "Matrícula" : dia?.titulo ?? "Em breve"

  const numero = (
    <span
      className={`grid h-[26px] w-[26px] flex-none place-items-center rounded-full font-serif text-[11.5px] font-bold transition-colors duration-200 sm:h-[25px] sm:w-[25px] ${
        concluido
          ? "bg-primary text-primary-foreground"
          : atual
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {concluido ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : n}
    </span>
  )

  const texto = (
    <span
      className={`min-w-0 flex-1 truncate text-[13px] leading-snug sm:text-[12.5px] ${
        atual
          ? "font-bold text-secondary"
          : concluido
            ? "font-medium text-foreground"
            : "text-muted-foreground"
      }`}
    >
      {rotulo}
    </span>
  )

  // Dia que ela pode abrir é link; o resto é só informação — e um botão morto
  // que não leva a nada ensina a aluna a não confiar no que ela vê.
  if (!aberto) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-transparent px-2.5 py-2.5 sm:py-2">
        {numero}
        {texto}
        {!existe ? (
          <span className="flex-none text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            em breve
          </span>
        ) : (
          <Lock className="h-3 w-3 flex-none text-muted-foreground" aria-label="Ainda não liberado" />
        )}
      </div>
    )
  }

  return (
    <Link
      href={`/desafio/dia/${n}`}
      aria-current={atual ? "page" : undefined}
      className={`group flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 transition-all duration-200 sm:py-2 ${
        atual
          ? "border-secondary/40 bg-secondary-subtle"
          : "border-transparent hover:border-primary/35 hover:bg-primary-subtle"
      }`}
    >
      {numero}
      {texto}
      {atual ? (
        <span className="flex-none text-[9.5px] font-bold uppercase tracking-[0.1em] text-secondary">
          hoje
        </span>
      ) : (
        <span className="flex-none text-[10px] font-bold uppercase tracking-[0.1em] text-primary opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-60">
          rever
        </span>
      )}
    </Link>
  )
}
