import Link from "next/link"

/**
 * Paginação por LINK, não por estado.
 *
 * As listas do admin paginam no banco, então a página atual precisa estar na
 * URL: é o que faz um link compartilhado (ou o botão voltar do navegador) cair
 * no mesmo lugar, e é o que mantém a busca viva ao trocar de página.
 */
export function Pager({
  basePath,
  params,
  page,
  totalPages,
  total,
  unidade,
}: {
  basePath: string
  /** Filtros atuais, preservados nos links (valores vazios saem). */
  params: Record<string, string | undefined>
  page: number
  totalPages: number
  total: number
  /** ["acesso", "acessos"] — singular e plural para a contagem. */
  unidade: [string, string]
}) {
  const href = (p: number) => {
    const qs = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v) qs.set(k, v)
    if (p > 1) qs.set("page", String(p))
    const query = qs.toString()
    return query ? `${basePath}?${query}` : basePath
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        {total} {total === 1 ? unidade[0] : unidade[1]}
        {totalPages > 1 && ` · página ${page} de ${totalPages}`}
      </p>

      {totalPages > 1 && (
        <div className="flex gap-2">
          <PageLink href={href(page - 1)} disabled={page <= 1}>
            Anterior
          </PageLink>
          <PageLink href={href(page + 1)} disabled={page >= totalPages}>
            Próxima
          </PageLink>
        </div>
      )}
    </div>
  )
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string
  disabled: boolean
  children: React.ReactNode
}) {
  const base =
    "inline-flex h-8 items-center rounded-md border border-border px-3 text-xs font-semibold transition-colors"

  // Desabilitado é <span>, não <a> inerte: link que não leva a lugar nenhum
  // confunde leitor de tela e permite navegar para fora da lista.
  if (disabled) {
    return <span className={`${base} opacity-40`}>{children}</span>
  }
  return (
    <Link href={href} className={`${base} hover:bg-accent hover:text-foreground`}>
      {children}
    </Link>
  )
}
