"use client"

import { useState, useTransition } from "react"
import { Check, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LAB_NAME } from "@/lib/produto"
import {
  addAuthorizedEmail,
  revokeAccess,
  reactivateAccess,
  setDesafioAccess,
  setLabAccess,
} from "@/app/admin/acessos/actions"

export type AuthorizedRow = {
  email: string
  buyerName: string | null
  source: string | null
  state: "released" | "waiting" | "revoked"
  availableAt: string
  /** Tem a assinatura (coluna has_comunidade_vip, derivada das compras). */
  hasLab: boolean
  /** Tem o Desafio 21 Dias (coluna has_desafio, derivada das compras). */
  hasDesafio: boolean
}

const STATE_LABEL: Record<AuthorizedRow["state"], string> = {
  released: "Liberado",
  waiting: "Aguardando 7 dias",
  revoked: "Revogado",
}

const STATE_CLASS: Record<AuthorizedRow["state"], string> = {
  released: "bg-primary-subtle text-primary",
  waiting: "bg-warning-subtle text-warning-foreground",
  revoked: "bg-destructive-subtle text-destructive",
}

/**
 * A lista de acessos e as ações sobre cada linha.
 *
 * Busca, filtros e paginação NÃO estão aqui: moram na URL e são resolvidos no
 * servidor (ver acessos/page.tsx). Este componente recebe só a página atual —
 * antes ele recebia a base inteira e filtrava no navegador, o que significava
 * mandar todas as alunas para a tela a cada visita.
 */
export function AccessManager({ rows }: { rows: AuthorizedRow[] }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [comLab, setComLab] = useState(false)
  const [error, setError] = useState("")
  const [aviso, setAviso] = useState("")
  const [pending, startTransition] = useTransition()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setAviso("")
    startTransition(async () => {
      const res = await addAuthorizedEmail(email, {
        buyerName: name || undefined,
        comLab,
      })
      if (!res.ok) setError(res.error || "Erro ao adicionar.")
      else {
        setEmail("")
        setName("")
        setComLab(false)
      }
    })
  }

  const act = (
    fn: (email: string) => Promise<{ ok: boolean; error?: string }>,
    target: string
  ) => {
    setError("")
    setAviso("")
    startTransition(async () => {
      const res = await fn(target)
      if (!res.ok) setError(res.error || "Erro na operação.")
    })
  }

  /**
   * Dá ou tira um produto à mão.
   *
   * Os dois produtos extras compartilham o mesmo botão porque compartilham a
   * mesma mecânica: a cortesia é gravada numa tabela própria e a coluna é
   * RECALCULADA. Por isso o aviso depois do clique — tirar a cortesia não
   * vence uma compra registrada (nem, no caso do Laboratório, o direito
   * adquirido de quem comprou o Método antes de 23/07/2026), e a derivação
   * devolve o produto no mesmo instante. Dizer isso é melhor que deixar a Nati
   * clicando num botão que não obedece.
   */
  const togglePosse = (
    row: AuthorizedRow,
    produto: "lab" | "desafio"
  ) => {
    setError("")
    setAviso("")
    const tinha = produto === "lab" ? row.hasLab : row.hasDesafio
    const nome = produto === "lab" ? LAB_NAME : "Desafio 21 Dias"
    const acao = produto === "lab" ? setLabAccess : setDesafioAccess

    startTransition(async () => {
      const res = await acao(row.email, !tinha)
      if (!res.ok) {
        setError(res.error)
        return
      }
      if (!res.has !== !tinha) {
        setAviso(
          tinha
            ? `${row.email} continua com o ${nome}: a cortesia saiu, mas existe compra registrada${produto === "lab" ? " ou direito adquirido (Método antes de 23/07/2026)" : ""}.`
            : `${row.email} segue sem o ${nome} — a cortesia foi gravada, mas o recálculo não a confirmou. Confira se o e-mail tem acesso ativo.`
        )
      }
    })
  }

  return (
    <div className="space-y-5">
      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4"
      >
        <div className="grid min-w-[200px] flex-1 gap-1.5">
          <Label htmlFor="new-email">E-mail</Label>
          <Input
            id="new-email"
            type="email"
            placeholder="aluna@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid min-w-[160px] flex-1 gap-1.5">
          <Label htmlFor="new-name">Nome (opcional)</Label>
          <Input
            id="new-name"
            placeholder="Nome da aluna"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <label className="flex h-10 items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={comLab}
            onChange={(e) => setComLab(e.target.checked)}
          />
          já com o {LAB_NAME}
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Liberar acesso"}
        </Button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}
      {aviso && (
        <p className="rounded-lg border border-warning/40 bg-warning-subtle px-3 py-2 text-xs leading-relaxed text-warning-foreground">
          {aviso}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">E-mail</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">{LAB_NAME}</th>
              <th className="px-4 py-3 font-semibold">Desafio</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum acesso encontrado com esses filtros.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.email} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{r.email}</div>
                  {r.buyerName && (
                    <div className="text-xs text-muted-foreground">{r.buyerName}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{r.source ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${STATE_CLASS[r.state]}`}
                  >
                    {STATE_LABEL[r.state]}
                  </span>
                  {r.state === "waiting" && (
                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                      libera {new Date(r.availableAt).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <BotaoDePosse
                    tem={r.hasLab}
                    nome={LAB_NAME}
                    disabled={pending}
                    onClick={() => togglePosse(r, "lab")}
                  />
                </td>
                <td className="px-4 py-3">
                  <BotaoDePosse
                    tem={r.hasDesafio}
                    nome="Desafio 21 Dias"
                    disabled={pending}
                    onClick={() => togglePosse(r, "desafio")}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  {r.state === "revoked" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => act(reactivateAccess, r.email)}
                    >
                      Reativar
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pending}
                      onClick={() => act(revokeAccess, r.email)}
                    >
                      Revogar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/** O selo clicável de posse de um produto. Mesmo desenho para os dois. */
function BotaoDePosse({
  tem,
  nome,
  disabled,
  onClick,
}: {
  tem: boolean
  nome: string
  disabled: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={tem ? `Tirar o ${nome} desta aluna` : `Dar o ${nome} a esta aluna`}
      className={`inline-flex cursor-pointer items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
        tem
          ? "bg-secondary-subtle text-secondary hover:bg-secondary hover:text-secondary-foreground"
          : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      {tem ? (
        <>
          <Check className="h-3 w-3" />
          Tem
        </>
      ) : (
        <>
          <Minus className="h-3 w-3" />
          Não tem
        </>
      )}
    </button>
  )
}
