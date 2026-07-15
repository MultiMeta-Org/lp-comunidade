"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  addAuthorizedEmail,
  revokeAccess,
  reactivateAccess,
} from "@/app/admin/access/actions"

export type AuthorizedRow = {
  email: string
  buyerName: string | null
  source: string | null
  state: "released" | "waiting" | "revoked"
  availableAt: string
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

export function AccessManager({ rows }: { rows: AuthorizedRow[] }) {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await addAuthorizedEmail(email, { buyerName: name || undefined })
      if (!res.ok) setError(res.error || "Erro ao adicionar.")
      else {
        setEmail("")
        setName("")
      }
    })
  }

  const act = (fn: (email: string) => Promise<{ ok: boolean; error?: string }>, target: string) => {
    setError("")
    startTransition(async () => {
      const res = await fn(target)
      if (!res.ok) setError(res.error || "Erro na operação.")
    })
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-1.5 flex-1 min-w-[200px]">
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
        <div className="grid gap-1.5 flex-1 min-w-[160px]">
          <Label htmlFor="new-name">Nome (opcional)</Label>
          <Input
            id="new-name"
            placeholder="Nome da aluna"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Liberar acesso"}
        </Button>
      </form>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">E-mail</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum acesso ainda.
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
