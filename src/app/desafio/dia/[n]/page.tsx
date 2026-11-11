import { notFound, redirect } from "next/navigation"
import { requireDesafio } from "@/lib/guard"
import {
  assinarVideosDoDia,
  getInteresses,
  getJornada,
  getOperacao,
  getRadar,
  liberarMarketplace,
} from "@/lib/desafio-server"
import { DIA_DO_MARKETPLACE, diaAtual, diaDisponivel, getDia, podeAbrir, semanaAberta, type ProximoDia } from "@/lib/desafio"
import { materiaisDoDia } from "@/lib/desafio/biblioteca"
import { assinarMateriais } from "@/lib/desafio/biblioteca-server"
import { Atmosphere } from "@/components/atmosphere"
import { MaterialDoDia } from "@/components/desafio/biblioteca"
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
  const { email, admin } = await requireDesafio()

  const { n } = await params
  const numero = Number(n)
  if (!Number.isInteger(numero)) notFound()

  const dia = getDia(numero)
  if (!dia || dia.passos.length === 0) notFound()

  const [jornada, radar, interesses, operacao, diaComVideos, extras] = await Promise.all([
    getJornada(email),
    getRadar(email),
    getInteresses(email),
    getOperacao(email),
    assinarVideosDoDia(dia),
    assinarMateriais(materiaisDoDia(numero)),
  ])

  // Correr na frente não dá: o Desafio é um dia por vez. Volta para a jornada,
  // onde o dia dela está em destaque — não para um erro.
  if (!podeAbrir(numero, jornada.concluidos, jornada.liberacao)) redirect("/desafio")

  // Chegou no Dia 8 (abrir já prova isso): ganha o Marketplace de bônus. Do 9
  // em diante também, para quem passou do 8 antes de a liberação existir.
  // Admin não precisa — e não vira closer autorizada por conferir conteúdo.
  if (numero >= DIA_DO_MARKETPLACE && !admin) await liberarMarketplace(email)

  // Para o botão do fim: depois de concluir este, o seguinte já abre? Só não
  // abre se não existe ainda ou se a semana dele está fechada — aí a
  // celebração diz quando, em vez de mandar para um dia trancado.
  const seguinte = numero + 1
  const abreJa = podeAbrir(seguinte, new Set([...jornada.concluidos, numero]), jornada.liberacao)
  const proximo: ProximoDia = {
    n: seguinte,
    aberto: abreJa,
    semanaAbreEm:
      !abreJa && diaDisponivel(seguinte) && !semanaAberta(seguinte, jornada.liberacao)
        ? jornada.liberacao.proximaSemanaEm
        : null,
  }

  const progresso = jornada.dias.get(numero)
  const concluido = jornada.concluidos.has(numero)

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="lesson" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        {concluido && (
          <p className="mb-6 rounded-[14px] border border-primary/30 bg-primary-subtle px-4 py-3 text-[13px] leading-relaxed text-foreground">
            Você já concluiu este dia. Pode reler e mudar o que escreveu — o que
            você guardar aqui substitui o de antes.
          </p>
        )}

        {/* As aulas extras e modelos deste dia, antes da missão: quem não
            lembra que a Biblioteca existe encontra aqui. */}
        <MaterialDoDia dia={numero} materiais={extras} />

        <Missao
          dia={diaComVideos}
          respostasIniciais={progresso?.respostas ?? {}}
          // Dia concluído reabre no começo: ela voltou para reler, não para
          // continuar de onde parou.
          passoInicial={concluido ? 0 : (progresso?.passo ?? 0)}
          radarInicial={radar}
          jaConcluido={concluido}
          interesses={Object.fromEntries(interesses)}
          operacao={operacao}
          proximo={proximo}
          // A navegação entre os dias desce montada do servidor: a Missao só
          // decide SE mostra (não mostra depois da celebração).
          vizinhos={
            <DiasVizinhos
              n={numero}
              concluidos={jornada.concluidos}
              atual={diaAtual(jornada.concluidos)}
              empresasNoRadar={jornada.empresasNoRadar}
              liberacao={jornada.liberacao}
            />
          }
        />
      </div>
    </main>
  )
}
