"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Check } from "lucide-react"
import {
  interesseDaTeoriaAction,
  marcarItemDaTeoriaAction,
  salvarPerfilComercialAction,
} from "@/app/desafio/actions"
import { PERFIS_COMERCIAIS } from "@/lib/desafio/teoria"

/**
 * O botão do pé da aula. Marca como feita E leva à próxima numa ação só: é o
 * "Já assisti" da missão. Feita, vira um selo que desfaz — ela pode ter
 * marcado sem querer.
 */
export function ConcluirItem({
  chave,
  feito,
  proximo,
}: {
  chave: string
  feito: boolean
  /** Para onde ir depois: a próxima aula, ou a página da teoria no fim. */
  proximo: { href: string; rotulo: string }
}) {
  const router = useRouter()
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  const marcar = (valor: boolean, depois?: string) =>
    iniciar(async () => {
      setErro(null)
      const r = await marcarItemDaTeoriaAction(chave, valor)
      if (!r.ok) return setErro(r.error ?? "Não consegui salvar agora.")
      if (depois) router.push(depois)
    })

  return (
    <div className="flex flex-col items-stretch gap-2.5 sm:items-start">
      {feito ? (
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => router.push(proximo.href)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:py-3"
          >
            {proximo.rotulo}
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={pendente}
            onClick={() => marcar(false)}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:text-primary/80 disabled:opacity-60"
            title="Desmarcar"
          >
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Feita
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={pendente}
          onClick={() => marcar(true, proximo.href)}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 sm:w-auto sm:py-3"
        >
          {pendente ? "Salvando…" : `Marcar como feita · ${proximo.rotulo}`}
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
      {erro && <p className="text-[13px] text-destructive">{erro}</p>}
    </div>
  )
}

/** "Tenho interesse" — levantar a mão para um produto que ainda vai lançar. */
export function InteresseDaTeoria({
  chave,
  titulo,
  texto,
  botao,
  jaDeclarado,
}: {
  chave: string
  titulo: string
  texto: string
  botao: string
  jaDeclarado: boolean
}) {
  const [feito, setFeito] = useState(jaDeclarado)
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  return (
    <section className="flex flex-col gap-2 rounded-[18px] border border-primary/35 bg-primary-subtle px-5 py-5">
      <b className="font-display text-lg font-bold leading-snug text-foreground">{titulo}</b>
      <p className="text-sm leading-relaxed text-muted-foreground">{texto}</p>
      {feito ? (
        <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          <Check className="h-4 w-4" strokeWidth={3} />
          Anotado! A gente te avisa quando lançar.
        </p>
      ) : (
        <button
          type="button"
          disabled={pendente}
          onClick={() =>
            iniciar(async () => {
              setErro(null)
              const r = await interesseDaTeoriaAction(chave)
              if (r.ok) setFeito(true)
              else setErro(r.error ?? "Não consegui registrar agora.")
            })
          }
          className="mt-1 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 sm:w-fit sm:py-2.5"
        >
          {pendente ? "Registrando…" : botao}
        </button>
      )}
      {erro && <p className="text-[13px] text-destructive">{erro}</p>}
    </section>
  )
}

/** Depois do teste: qual perfil deu. Grava na hora em que ela escolhe. */
export function PerfilComercial({ inicial }: { inicial: string | null }) {
  const [perfil, setPerfil] = useState(inicial)
  const [pendente, iniciar] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  return (
    <fieldset className="flex flex-col gap-2.5 rounded-[18px] border border-border bg-card px-5 py-5">
      <legend className="sr-only">Qual perfil deu no seu teste?</legend>
      <b className="text-sm font-semibold text-foreground">Qual perfil deu no seu teste?</b>
      <div className="flex flex-wrap gap-2">
        {PERFIS_COMERCIAIS.map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={perfil === p}
            disabled={pendente}
            onClick={() =>
              iniciar(async () => {
                setErro(null)
                const anterior = perfil
                setPerfil(p)
                const r = await salvarPerfilComercialAction(p)
                if (!r.ok) {
                  setPerfil(anterior)
                  setErro(r.error ?? "Não consegui salvar agora.")
                }
              })
            }
            className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
              perfil === p
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:border-primary/45"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      {erro && <p className="text-[13px] text-destructive">{erro}</p>}
    </fieldset>
  )
}
