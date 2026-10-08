import Link from "next/link"
import { ArrowLeft, ArrowRight, ListOrdered } from "lucide-react"
import { TOTAL_DIAS, diaDisponivel, getDia, podeAbrir } from "@/lib/desafio"
import { JornadaMenu } from "@/components/desafio/jornada-menu"

/**
 * O rodapé de navegação da missão: o dia anterior, onde ela está, o próximo.
 *
 * Existe porque a lista completa saiu da tela no celular (ver `JornadaMenu`), e
 * sem ela a aluna que estava revendo o Dia 5 não tinha como chegar no 6 a não
 * ser voltando para a jornada. Aqui o movimento mais comum — o dia de antes e o
 * de depois — fica a um toque, e o meio abre a lista inteira para quando ela
 * quiser pular.
 *
 * Fica no FIM da missão, não no começo: no começo seria mais uma fileira de
 * botões antes da pergunta do dia, e a tela da missão é feita para ter uma
 * coisa de cada vez. No fim, é a resposta de "e agora?".
 */
export function DiasVizinhos({
  n,
  concluidos,
  atual,
  empresasNoRadar,
}: {
  n: number
  concluidos: ReadonlySet<number>
  atual: number
  empresasNoRadar: number
}) {
  const anterior = vizinho(n, -1, concluidos)
  const proximo = vizinho(n, +1, concluidos)

  return (
    <nav
      aria-label="Navegar entre os dias"
      className="mt-10 flex flex-col gap-3 border-t border-dashed border-border pt-7"
    >
      {/* No celular empilham com o próximo em cima — é para onde ela está indo.
          Na tela larga voltam para os lados que os botões apontam. */}
      <div className="flex flex-col-reverse gap-2.5 sm:grid sm:grid-cols-2 sm:gap-3">
        {anterior === null ? (
          <span className="hidden sm:block" />
        ) : (
          <CartaoDoVizinho n={anterior} sentido="anterior" />
        )}

        {proximo === null ? (
          <AindaNao n={n} />
        ) : (
          <CartaoDoVizinho n={proximo} sentido="proximo" />
        )}
      </div>

      <JornadaMenu
        concluidos={concluidos}
        atual={atual}
        empresasNoRadar={empresasNoRadar}
        className="mx-auto inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
      >
        <ListOrdered className="h-3.5 w-3.5 flex-none" />
        <span className="truncate">
          {rotulo(n)} <span className="font-normal">· ver todos</span>
        </span>
      </JornadaMenu>
    </nav>
  )
}

/** O dia aberto mais próximo numa direção, ou nada se não há. */
function vizinho(
  n: number,
  passo: 1 | -1,
  concluidos: ReadonlySet<number>
): number | null {
  for (let m = n + passo; m >= 0 && m <= TOTAL_DIAS; m += passo) {
    if (podeAbrir(m, concluidos)) return m
  }
  return null
}

/** "Dia 7 de 21" — e "Matrícula" para o Dia Zero, que não é missão. */
function rotulo(n: number): string {
  return n === 0 ? "Matrícula" : `Dia ${n} de ${TOTAL_DIAS}`
}

function CartaoDoVizinho({
  n,
  sentido,
}: {
  n: number
  sentido: "anterior" | "proximo"
}) {
  const proximo = sentido === "proximo"
  const titulo = n === 0 ? "Matrícula" : (getDia(n)?.titulo ?? `Dia ${n}`)

  return (
    <Link
      href={`/desafio/dia/${n}`}
      className={`group flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-card px-4 py-3.5 transition-all duration-300 hover:border-primary/45 hover:shadow-sm ${
        proximo ? "sm:items-end sm:text-right" : ""
      }`}
    >
      <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {!proximo && (
          <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-0.5" />
        )}
        {proximo ? "Próximo dia" : "Dia anterior"}
        {proximo && (
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      {/* Duas linhas, não uma cortada: o título de um dia é uma frase inteira
          ("Hoje a gente monta o seu radar de empresas"), e no cartão cabe. O
          `line-clamp` é o que impede a terceira linha de esticar a dupla. */}
      <b className="min-w-0 max-w-full text-[13.5px] font-semibold leading-snug text-foreground line-clamp-2">
        {n === 0 ? titulo : `${n}. ${titulo}`}
      </b>
    </Link>
  )
}

/**
 * Não existe próximo dia para abrir — e o motivo importa.
 *
 * "Bloqueado" seria castigo; aqui ela lê que o dia abre quando este fechar, que
 * é a regra do Desafio. Depois do 21 não existe Dia 22, e prometer um
 * transformaria a formatura em sala de espera.
 */
function AindaNao({ n }: { n: number }) {
  const seguinte = n + 1

  const aviso =
    n >= TOTAL_DIAS
      ? "Você está no último dia dos 21."
      : !diaDisponivel(seguinte)
        ? "O próximo dia ainda está sendo preparado."
        : `O Dia ${seguinte} abre quando você concluir este.`

  return (
    <p className="flex min-w-0 flex-col gap-1 rounded-2xl border border-dashed border-border px-4 py-3.5 sm:items-end sm:text-right">
      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {n >= TOTAL_DIAS ? "Fim da jornada" : "Próximo dia"}
      </span>
      <span className="text-[12.5px] leading-snug text-muted-foreground">{aviso}</span>
    </p>
  )
}
