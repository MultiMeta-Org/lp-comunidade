/**
 * Camada decorativa das páginas autenticadas: luz quente + line art botânico
 * sangrando pelas bordas. Fica atrás do conteúdo (o container do conteúdo usa
 * z-10) e some para leitores de tela.
 *
 * Cada `variant` arruma os elementos de um jeito — as páginas compartilham a
 * linguagem sem virar a mesma tela repetida:
 *   • hub     → galho à esquerda, sol à direita (página mais larga)
 *   • library → espelhado: sol à esquerda, galho à direita
 *   • lesson  → discreto, encostado nas bordas (coluna estreita de leitura)
 */
export function Atmosphere({
  variant = "hub",
}: {
  variant?: "hub" | "library" | "lesson"
}) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 h-[520px] select-none"
    >
      <div
        className={`absolute inset-0 ${variant === "hub" ? "page-wash" : "page-wash-alt"}`}
      />

      {variant === "hub" && (
        <>
          <Sprig className="absolute -left-16 -top-8 w-52 rotate-[8deg] text-primary opacity-[0.16] sm:w-64" />
          <Sun className="absolute right-6 top-10 w-24 text-secondary opacity-[0.22] sm:right-16 sm:w-32" />
          <Seedhead className="absolute -right-6 top-56 hidden w-24 rotate-[14deg] text-primary opacity-[0.14] lg:block" />
        </>
      )}

      {/* Sem sol aqui: um disco compacto atrás do título vira sujeira.
          Só formas verticais finas, que se leem como margem. */}
      {variant === "library" && (
        <>
          <Sprig className="absolute -right-20 -top-6 w-52 -rotate-[14deg] text-primary opacity-[0.15] sm:w-64" />
          <Seedhead className="absolute -left-10 top-6 w-20 -rotate-[10deg] text-secondary opacity-[0.16] sm:-left-6 sm:w-24" />
        </>
      )}

      {/* Página de leitura: o mínimo, só para não ficar chapada. */}
      {variant === "lesson" && (
        <Sprig className="absolute -right-24 -top-10 w-48 -rotate-[18deg] text-primary opacity-[0.12] sm:w-56" />
      )}

      {/* Dissolve a lavagem no fundo da página. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
    </div>
  )
}

function Sprig({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 240"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M70 236C64 196 74 168 68 132 62 96 74 60 70 8" />
      <path d="M68 128C48 120 34 104 34 82 56 86 68 106 68 128Z" />
      <path d="M70 88C50 80 36 64 36 42 58 46 70 66 70 88Z" />
      <path d="M69 150C89 142 103 126 103 104 81 108 69 128 69 150Z" />
      <path d="M71 106C91 98 105 82 105 60 83 64 71 84 71 106Z" />
    </svg>
  )
}

function Sun({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="60" cy="60" r="20" />
      <path d="M60 12v14M60 94v14M12 60h14M94 60h14M26 26l10 10M84 84l10 10M94 26 84 36M36 84 26 94" />
    </svg>
  )
}

function Seedhead({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 160"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M50 156V54" />
      <path d="M50 54C50 30 66 14 84 10 82 34 68 52 50 54Z" />
      <path d="M50 78C40 72 30 60 30 44 44 48 52 62 50 78Z" />
      <path d="M50 104C62 98 74 86 74 70 58 74 50 88 50 104Z" />
    </svg>
  )
}
