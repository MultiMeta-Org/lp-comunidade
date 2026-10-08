"use client"

import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import type { Fim } from "@/lib/desafio"
import { diaDisponivel } from "@/lib/desafio"

/**
 * A tela de conquista, no fim da missão.
 *
 * Ela existe porque concluir sem nada acontecer ensina que concluir não
 * importa. Aqui a aluna vê o que fez (não o que falta), o selo do dia e o
 * gancho de amanhã — nessa ordem, de propósito: primeiro o reconhecimento,
 * depois o próximo passo. Nenhum dos dois é um pedido.
 *
 * O placar com `de: "radar"` lê o Radar de verdade em vez de cravar o número
 * do conteúdo: ela pode ter cadastrado 14 empresas quando a meta era 10, e
 * dizer "10" seria diminuir o que ela fez.
 */
export function Celebracao({
  fim,
  empresasNoRadar,
  proximoDia,
}: {
  fim: Fim
  empresasNoRadar: number
  proximoDia: number
}) {
  const temProximo = diaDisponivel(proximoDia)

  const placar =
    fim.placar?.de === "radar"
      ? { n: empresasNoRadar, label: fim.placar.label }
      : fim.placar
        ? { n: fim.placar.n, label: fim.placar.label }
        : null

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 text-center">
      <span className="grid h-[84px] w-[84px] place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_13px_rgba(208,222,200,0.5)] motion-safe:animate-[pop_0.6s_cubic-bezier(0.3,1.5,0.5,1)_both]">
        <Check className="h-9 w-9" strokeWidth={2.6} />
      </span>

      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
        {fim.kicker}
      </p>
      <h1 className="max-w-[18ch] font-serif text-[clamp(25px,4vw,33px)] font-bold leading-[1.12] text-foreground">
        {fim.titulo}
      </h1>
      <p className="max-w-[44ch] text-[15px] leading-relaxed text-muted-foreground">
        {fim.lede}
      </p>

      {placar && (
        <div className="mt-1 flex flex-col items-center gap-0.5 rounded-[20px] border border-dashed border-secondary bg-secondary-subtle/40 px-8 py-4">
          <span className="font-serif text-[46px] font-bold leading-none text-secondary">
            {placar.n}
          </span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-secondary">
            {placar.label}
          </span>
        </div>
      )}

      {fim.feito.length > 0 && (
        <ul className="mt-2 flex w-full flex-col gap-1.5 text-left">
          {fim.feito.map((item) => (
            <li
              key={item}
              className="flex items-center gap-2.5 rounded-xl border border-primary/25 bg-card px-4 py-2.5 text-[13px] text-foreground"
            >
              <Check className="h-3.5 w-3.5 flex-none text-primary" strokeWidth={3} />
              {item}
            </li>
          ))}
        </ul>
      )}

      <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-subtle px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">
        {fim.badge}
      </span>

      <section className="mt-4 flex w-full flex-col gap-1.5 rounded-[20px] border border-dashed border-border bg-card px-6 py-5 text-left">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {temProximo ? "Amanhã" : "Em breve"}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{fim.amanha}</p>
      </section>

      {/* O destino é sempre a jornada, nunca o dia seguinte direto: o Desafio é
          feito para ser vivido um pouquinho por dia, e emendar um dia no outro
          seria desfazer isso com um botão. */}
      <Link
        href="/desafio"
        className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      >
        Voltar para a minha jornada
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
