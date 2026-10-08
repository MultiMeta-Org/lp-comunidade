"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowRight, X } from "lucide-react"
import { ConteudoDaJornada } from "@/components/desafio/jornada"

/** Nada muda nunca: a "assinatura" existe só para satisfazer a API. */
const assinaNada = () => () => {}
const noCliente = () => true
const noServidor = () => false

/**
 * A lista dos 21 dias atrás de um menu.
 *
 * No celular a jornada não cabe antes da missão: 22 linhas empurram para baixo
 * a única coisa que a aluna precisa fazer agora, e o que está no topo é o que
 * se entende como tarefa. Então ela sai da página e fica aqui — a um toque, de
 * qualquer tela do Desafio, sem nunca disputar espaço com o dia de hoje.
 *
 * O botão é `children`: o mesmo painel abre do contador no cabeçalho (onde o
 * número de dias É a jornada) e do rodapé da missão. Dois gatilhos, um
 * componente — cada instância cuida do seu estado, e só uma pode estar aberta
 * porque só uma é tocada.
 *
 * Vai para o `document.body` por PORTAL, e não onde foi escrito. É obrigatório
 * aqui: o cabeçalho do Desafio tem `backdrop-blur`, e `backdrop-filter`
 * transforma o elemento em bloco de contenção dos descendentes `fixed` — sem o
 * portal, o `inset-0` do painel seria a barra de 56px, não a tela. (Mesmo
 * motivo documentado em `ui/modal.tsx`.)
 */
export function JornadaMenu({
  concluidos,
  atual,
  empresasNoRadar,
  className,
  children,
}: {
  concluidos: ReadonlySet<number>
  atual: number
  empresasNoRadar: number
  /** Aparência do gatilho — ele muda de lugar para lugar; o painel, não. */
  className?: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // O estado guarda ONDE ela abriu, não um sim/não: assim trocar de página
  // fecha o painel sem nenhum efeito. Ele é renderizado pelo layout, que
  // sobrevive à navegação de cliente — sem isso a aluna chegaria no Dia 8 com a
  // lista ainda cobrindo a tela.
  const [abertoEm, setAbertoEm] = useState<string | null>(null)
  const aberto = abertoEm !== null && abertoEm === pathname
  const setAberto = (v: boolean) => setAbertoEm(v ? pathname : null)

  // `document` não existe no servidor: o portal só monta depois da hidratação.
  const montado = useSyncExternalStore(assinaNada, noCliente, noServidor)

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbertoEm(null)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [aberto])

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-expanded={aberto}
        className={className}
      >
        {children}
      </button>

      {aberto &&
        montado &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Os 21 dias"
            className="fixed inset-0 z-50 flex"
          >
            <div
              aria-hidden
              onClick={() => setAberto(false)}
              className="animate-fade absolute inset-0 bg-black/40"
            />

            {/* Entra pela esquerda, que é onde a coluna mora na tela larga: o
                painel é a mesma jornada, não um lugar novo. */}
            <div className="animate-sheet relative flex h-full w-[min(86vw,330px)] flex-col border-r border-border bg-card shadow-xl">
              <div className="flex flex-none items-center justify-between gap-3 border-b border-border px-4 py-3.5">
                <b className="font-display text-sm font-bold text-foreground">
                  Os 21 dias
                </b>
                <button
                  type="button"
                  onClick={() => setAberto(false)}
                  aria-label="Fechar"
                  className="-mr-1 p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* A lista é mais alta que a tela: rola aqui dentro, e o
                  `overscroll-contain` impede que o fim dela puxe a página
                  atrás — que é o pior jeito de perder o lugar no celular.
                  Tocar num dia fecha o painel: a navegação de cliente não
                  remonta o layout, então ninguém fecharia por ela. */}
              <div
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest("a")) setAberto(false)
                }}
                className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3.5 py-4"
              >
                <ConteudoDaJornada
                  concluidos={concluidos}
                  atual={atual}
                  empresasNoRadar={empresasNoRadar}
                />
              </div>

              <div className="flex-none border-t border-border px-4 py-3">
                <Link
                  href="/desafio"
                  onClick={() => setAberto(false)}
                  className="group inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Voltar para a minha jornada
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
