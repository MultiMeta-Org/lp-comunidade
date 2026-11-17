import { requireDesafio } from "@/lib/guard"
import { getJornada } from "@/lib/desafio-server"
import { centralDeScripts } from "@/lib/desafio/scripts"
import { Atmosphere } from "@/components/atmosphere"
import { GavetasDeScripts } from "@/components/desafio/scripts"

/**
 * A Central de Scripts — todas as mensagens do Desafio, separadas pelo
 * momento da venda (abordagem, follow-up, antes e depois da reunião…), para
 * copiar sem precisar lembrar em que dia cada uma apareceu.
 */
export default async function ScriptsPage() {
  const { email } = await requireDesafio()
  const { liberacao } = await getJornada(email)
  const gavetas = centralDeScripts(liberacao)

  return (
    <main className="grain relative min-h-[calc(100vh-6.5rem)] overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="library" />

      <div className="relative z-10 mx-auto w-full max-w-2xl">
        <header className="mb-8">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
            Central de Scripts
          </p>
          <h1 className="font-display text-3xl font-bold leading-[1.1] text-foreground sm:text-4xl">
            Todas as suas mensagens, num lugar só
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Separadas pelo momento da conversa. Copie, troque os [colchetes] pelos dados
            da empresa e adapte do seu jeito — nunca envie sem ler. Os scripts das próximas
            semanas aparecem aqui quando a semana abrir.
          </p>
        </header>

        <GavetasDeScripts gavetas={gavetas} />
      </div>
    </main>
  )
}
