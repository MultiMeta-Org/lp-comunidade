import Link from "next/link"
import Form from "next/form"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export type Chip = { label: string; href: string; active: boolean }

/**
 * `/admin/x?...` com os parâmetros dados — vazios e nulos somem, e `page` nunca
 * é preservado: trocar de busca ou de filtro é um recorte novo, e manter a
 * página 7 do recorte anterior é cair num vazio.
 */
export function hrefCom(
  basePath: string,
  params: Record<string, string | undefined>
): string {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v)
  const query = qs.toString()
  return query ? `${basePath}?${query}` : basePath
}

/**
 * Barra de busca + filtros das listas do admin, toda pela URL.
 *
 * `next/form` faz um GET que vira navegação do app (sem recarregar) e continua
 * funcionando sem JavaScript. A busca roda no banco: com mil linhas, filtrar na
 * tela obrigaria a baixar as mil a cada visita.
 */
export function ListToolbar({
  basePath,
  q,
  placeholder,
  hidden = {},
  chipGroups = [],
  limparHref,
}: {
  basePath: string
  q: string
  placeholder: string
  /** Filtros que viajam com a busca, senão submeter o formulário os zeraria. */
  hidden?: Record<string, string | undefined>
  /** Grupos de filtros, separados por um traço vertical. */
  chipGroups?: Chip[][]
  /** Para onde "Limpar" leva (sem busca, filtros preservados). */
  limparHref: string
}) {
  return (
    <div className="space-y-3">
      <Form action={basePath} className="flex flex-wrap items-center gap-2">
        {Object.entries(hidden).map(([name, value]) =>
          value ? <input key={name} type="hidden" name={name} value={value} /> : null
        )}

        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            name="q"
            type="search"
            defaultValue={q}
            aria-label="Buscar"
            placeholder={placeholder}
            className="pl-9"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-10 cursor-pointer items-center rounded-md border border-border px-4 text-xs font-semibold transition-colors hover:bg-accent hover:text-foreground"
        >
          Buscar
        </button>
        {q && (
          <Link
            href={limparHref}
            scroll={false}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            Limpar
          </Link>
        )}
      </Form>

      {chipGroups.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chipGroups.map((grupo, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              {i > 0 && <span className="mx-1 h-4 w-px bg-border" />}
              {grupo.map((chip) => (
                <ChipLink key={chip.label} chip={chip} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ChipLink({ chip }: { chip: Chip }) {
  return (
    <Link
      href={chip.href}
      // Filtrar não é navegar: sem `scroll={false}` o Next joga a página para o
      // topo a cada chip clicado, tirando da tela justamente a lista que a
      // pessoa está filtrando. A paginação segue rolando para o topo de
      // propósito — ali você quer ver o começo da página nova.
      scroll={false}
      aria-current={chip.active ? "true" : undefined}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
        chip.active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
      }`}
    >
      {chip.label}
    </Link>
  )
}
