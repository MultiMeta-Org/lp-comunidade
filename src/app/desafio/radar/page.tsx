import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { getRadar } from "@/lib/desafio-server"
import { Atmosphere } from "@/components/atmosphere"
import { RadarPagina } from "@/components/desafio/radar-pagina"

/**
 * A casa do Radar.
 *
 * Existe porque o Radar é vivo: o documento é explícito em que o botão de
 * adicionar empresa fica disponível para sempre, não só no Dia 3. Ela pode
 * estar no Dia 8, lembrar de uma empresa e cadastrar; pode receber uma
 * indicação no Dia 11 e cadastrar. Sem uma página própria, o Radar só existiria
 * dentro da missão do dia que o criou.
 */
export default async function RadarPage() {
  const { email } = await requireDesafio()
  const radar = await getRadar(email)

  return (
    <main className="grain relative min-h-[calc(100vh-3.5rem)] overflow-hidden px-5 pb-20 pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <Link
          href="/desafio"
          className="group mb-8 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Minha jornada
        </Link>

        <header className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Meu Radar
          </p>
          <h1 className="font-serif text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl">
            Minhas empresas e oportunidades
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
            Toda empresa que você encontrar termina aqui. É daqui que vão sair as
            suas conversas.
          </p>
        </header>

        <RadarPagina inicial={radar} />
      </div>
    </main>
  )
}
