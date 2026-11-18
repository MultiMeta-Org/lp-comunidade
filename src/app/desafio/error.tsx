"use client"

import { useEffect } from "react"
import Link from "next/link"

/**
 * Quando uma página do Desafio falha no meio (rede do celular caiu durante uma
 * gravação, o banco demorou), a aluna via a tela genérica do navegador, em
 * inglês, e achava que tinha perdido tudo. O que ela escreveu já foi salvo a
 * cada passo — então aqui é dizer isso e oferecer tentar de novo.
 */
export default function ErroDoDesafio({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error("[desafio]", error)
  }, [error])

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-start justify-center gap-4 px-4 py-16">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        Ops, a página travou
      </p>
      <h1 className="font-display text-2xl font-bold leading-tight text-foreground">
        A conexão falhou no meio do caminho.
      </h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        Fica tranquila: o que você já tinha respondido foi salvo. Toque em tentar de
        novo — se continuar, volte para a sua jornada e abra o dia outra vez.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Tentar de novo
        </button>
        <Link
          href="/desafio"
          className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-muted-foreground hover:text-primary"
        >
          Voltar para a minha jornada
        </Link>
      </div>
    </main>
  )
}
