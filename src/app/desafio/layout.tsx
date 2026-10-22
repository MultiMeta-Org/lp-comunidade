import { ListOrdered } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { requireDesafio } from "@/lib/guard"
import { getJornada } from "@/lib/desafio-server"
import { TOTAL_DIAS, diaAtual } from "@/lib/desafio"
import { JornadaMenu } from "@/components/desafio/jornada-menu"

/**
 * O Desafio usa o MESMO cabeçalho do portal (logo → Início, trilha, Sair). Já
 * teve um cabeçalho próprio, com a logo levando à jornada e uma setinha
 * "← Portal" — entrar e sair dele confundia. O que é só do Desafio entra
 * nesse cabeçalho: o contador de dias, na linha da trilha, e a barra de
 * progresso embaixo, que acompanha o scroll e diz "você está indo" — é o que
 * faz voltar amanhã.
 *
 * O guard roda aqui e nas páginas de dentro. Layout não é limite de segurança
 * em App Router (uma navegação de cliente pode renderizar a página sem
 * reexecutar o layout), então cada página revalida por conta.
 */
export default async function DesafioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { email } = await requireDesafio()
  const { concluidos, empresasNoRadar, liberacao } = await getJornada(email)

  // O Dia Zero é matrícula, não missão: a barra conta os 21.
  const feitos = [...concluidos].filter((d) => d >= 1).length
  const pct = Math.round((feitos / TOTAL_DIAS) * 100)

  return (
    <div className="min-h-screen">
      <SiteHeader
        wide
        acoes={
          // O contador É o gatilho da lista completa: o número de dias é a
          // jornada, e tocar nele para ver a jornada inteira dispensa um
          // segundo botão.
          <JornadaMenu
            concluidos={concluidos}
            atual={diaAtual(concluidos)}
            empresasNoRadar={empresasNoRadar}
            liberacao={liberacao}
            className="inline-flex flex-none items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
          >
            <ListOrdered className="h-3.5 w-3.5" />
            <span className="sm:hidden">
              {feitos}/{TOTAL_DIAS}
            </span>
            <span className="hidden sm:inline">
              {feitos} de {TOTAL_DIAS} dias
            </span>
            <span className="sr-only">— ver os 21 dias</span>
          </JornadaMenu>
        }
        faixa={
          // Progresso: fina, sem número, sempre à vista.
          <div className="h-[3px] bg-muted" role="presentation">
            <div
              className="h-full bg-primary transition-[width] duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        }
      />

      {children}
    </div>
  )
}
