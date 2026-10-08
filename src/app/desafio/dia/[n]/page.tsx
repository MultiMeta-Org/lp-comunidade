import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import {
  getInteresses,
  getJornada,
  getOperacao,
  getRadar,
} from "@/lib/desafio-server"
import { diaAtual, getDia, podeAbrir } from "@/lib/desafio"
import { Atmosphere } from "@/components/atmosphere"
import { Missao } from "@/components/desafio/missao"
import { DiasVizinhos } from "@/components/desafio/vizinhos"

/**
 * A missão de um dia, em tela cheia.
 *
 * Só o dia pedido viaja pela rede — é o motivo de a missão ser página e não
 * modal sobre a jornada (ver o comentário em /desafio).
 *
 * O guard roda aqui também, e não só no layout: em App Router uma navegação de
 * cliente pode renderizar a página sem reexecutar o layout, então layout não é
 * limite de segurança.
 */
export default async function DiaPage({
  params,
}: {
  params: Promise<{ n: string }>
}) {
  const { email } = await requireDesafio()

  const { n } = await params
  const numero = Number(n)
  if (!Number.isInteger(numero)) notFound()

  const dia = getDia(numero)
  if (!dia || dia.passos.length === 0) notFound()

  const [jornada, radar, interesses, operacao] = await Promise.all([
    getJornada(email),
    getRadar(email),
    getInteresses(email),
    getOperacao(email),
  ])

  // Correr na frente não dá: o Desafio é um dia por vez. Volta para a jornada,
  // onde o dia dela está em destaque — não para um erro.
  if (!podeAbrir(numero, jornada.concluidos)) redirect("/desafio")

  const progresso = jornada.dias.get(numero)
  const concluido = jornada.concluidos.has(numero)

  return (
    <main className="grain relative min-h-[calc(100vh-3.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="lesson" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <Link
          href="/desafio"
          className="group mb-6 inline-flex items-center gap-1.5 py-1 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground sm:mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Minha jornada
        </Link>

        {concluido && (
          <p className="mb-6 rounded-[14px] border border-primary/30 bg-primary-subtle px-4 py-3 text-[13px] leading-relaxed text-foreground">
            Você já concluiu este dia. Pode reler e mudar o que escreveu — o que
            você guardar aqui substitui o de antes.
          </p>
        )}

        <Missao
          dia={dia}
          respostasIniciais={progresso?.respostas ?? {}}
          // Dia concluído reabre no começo: ela voltou para reler, não para
          // continuar de onde parou.
          passoInicial={concluido ? 0 : (progresso?.passo ?? 0)}
          radarInicial={radar}
          jaConcluido={concluido}
          interesses={Object.fromEntries(interesses)}
          operacao={operacao}
          // A navegação entre os dias desce montada do servidor: a Missao só
          // decide SE mostra (não mostra depois da celebração).
          vizinhos={
            <DiasVizinhos
              n={numero}
              concluidos={jornada.concluidos}
              atual={diaAtual(jornada.concluidos)}
              empresasNoRadar={jornada.empresasNoRadar}
            />
          }
        />
      </div>
    </main>
  )
}
