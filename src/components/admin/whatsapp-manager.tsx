"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  bloquearContato,
  pedirDesconexao,
  pedirPareamento,
  reabrirContato,
  vincularContato,
} from "@/app/admin/whatsapp/actions"

export type EstadoWhatsapp = {
  status: "desconectado" | "conectando" | "pareando" | "conectado"
  numero: string | null
  codigo_pareamento: string | null
  erro: string | null
  pedido: "parear" | "desconectar" | null
  atualizado_em: string
}

export type ContatoRow = {
  jid: string
  telefone: string | null
  nome_whatsapp: string | null
  status: "pendente" | "vinculado" | "bloqueado"
  email: string | null
  origem: "compra" | "admin" | null
  vinculado_por: string | null
  ultima_mensagem_em: string | null
}

const STATUS_CONEXAO: Record<EstadoWhatsapp["status"], { label: string; className: string }> = {
  conectado: { label: "Conectado", className: "bg-primary-subtle text-primary" },
  pareando: { label: "Aguardando o código", className: "bg-warning-subtle text-warning-foreground" },
  conectando: { label: "Conectando…", className: "bg-warning-subtle text-warning-foreground" },
  desconectado: { label: "Desconectado", className: "bg-destructive-subtle text-destructive" },
}

const STATUS_CONTATO: Record<ContatoRow["status"], { label: string; className: string }> = {
  vinculado: { label: "Vinculado", className: "bg-primary-subtle text-primary" },
  pendente: { label: "Não reconhecido", className: "bg-warning-subtle text-warning-foreground" },
  bloqueado: { label: "Bloqueado", className: "bg-destructive-subtle text-destructive" },
}

/** 5511987654321 → +55 11 98765-4321 (o resto fica como veio). */
function formatarTelefone(t: string | null): string {
  if (!t) return "—"
  const m = t.match(/^55(\d{2})(\d{4,5})(\d{4})$/)
  return m ? `+55 ${m[1]} ${m[2]}-${m[3]}` : `+${t}`
}

/**
 * O chip da BIA. Enquanto há um pedido em andamento (conectando, pareando),
 * a página se relê a cada 3 s: o processo no VPS escreve o código de
 * pareamento e o status em bia.whatsapp_estado, e só a releitura os traz.
 */
export function WhatsappConexao({ estado }: { estado: EstadoWhatsapp | null }) {
  const router = useRouter()
  const [telefone, setTelefone] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const status = estado?.status ?? "desconectado"
  const aguardando = Boolean(estado?.pedido) || status === "conectando" || status === "pareando"

  useEffect(() => {
    if (!aguardando) return
    const id = setInterval(() => router.refresh(), 3000)
    return () => clearInterval(id)
  }, [aguardando, router])

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) => {
    setError("")
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error || "Erro na operação.")
    })
  }

  if (!estado) {
    return (
      <p className="text-xs text-destructive">
        A tabela bia.whatsapp_estado está vazia — a migration do WhatsApp da BIA foi aplicada?
      </p>
    )
  }

  const { label, className } = STATUS_CONEXAO[status]

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Número da BIA
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold text-foreground">
              {estado.numero ? formatarTelefone(estado.numero) : "Nenhum número"}
            </span>
            <span className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${className}`}>
              {estado.pedido ? "Pedido enviado…" : label}
            </span>
          </div>
        </div>
        {status === "conectado" && (
          <Button
            variant="outline"
            size="sm"
            disabled={pending || Boolean(estado.pedido)}
            onClick={() => {
              if (confirm("Desconectar o WhatsApp da BIA? Ela para de responder até parear de novo.")) {
                run(pedirDesconexao)
              }
            }}
          >
            Desconectar
          </Button>
        )}
      </div>

      {status === "pareando" && estado.codigo_pareamento && (
        <div className="space-y-2 rounded-lg border border-warning/40 bg-warning-subtle p-4">
          <div className="font-display text-3xl font-bold tracking-[0.2em] text-foreground">
            {estado.codigo_pareamento}
          </div>
          <p className="text-xs leading-relaxed text-warning-foreground">
            No celular do chip: WhatsApp → Configurações → Aparelhos conectados → Conectar
            um aparelho → <strong>Conectar com número de telefone</strong>, e digite o
            código. Ele vale por poucos minutos; se expirar, peça outro.
          </p>
        </div>
      )}

      {status !== "conectado" && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            run(() => pedirPareamento(telefone))
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="grid min-w-[220px] flex-1 gap-1.5">
            <Label htmlFor="wa-numero">Número do chip (com DDI e DDD)</Label>
            <Input
              id="wa-numero"
              inputMode="tel"
              placeholder="5511987654321"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" disabled={pending || aguardando}>
            {aguardando ? "Aguardando…" : "Gerar código de pareamento"}
          </Button>
        </form>
      )}

      {(error || estado.erro) && <p className="text-xs text-destructive">{error || estado.erro}</p>}
    </div>
  )
}

/** Os contatos que escreveram para a BIA e o vínculo de cada um. */
export function WhatsappContatos({ rows }: { rows: ContatoRow[] }) {
  const [editando, setEditando] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [pending, startTransition] = useTransition()

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, depois?: () => void) => {
    setError("")
    startTransition(async () => {
      const res = await fn()
      if (!res.ok) setError(res.error || "Erro na operação.")
      else depois?.()
    })
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Contato</th>
              <th className="px-4 py-3 font-semibold">Aluna</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Última mensagem</th>
              <th className="px-4 py-3 text-right font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  Nenhum contato com esses filtros.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.jid} className="border-b border-border align-top last:border-0">
                <td className="px-4 py-3">
                  <div className="font-medium text-foreground">{formatarTelefone(r.telefone)}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.nome_whatsapp ?? (r.telefone ? "" : "número oculto pelo WhatsApp")}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {editando === r.jid ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault()
                        run(() => vincularContato(r.jid, email), () => {
                          setEditando(null)
                          setEmail("")
                        })
                      }}
                      className="flex min-w-[260px] gap-2"
                    >
                      <Input
                        type="email"
                        placeholder="aluna@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                        required
                        className="h-9"
                      />
                      <Button type="submit" size="sm" disabled={pending}>
                        Salvar
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditando(null)}>
                        Cancelar
                      </Button>
                    </form>
                  ) : (
                    <>
                      <div className="text-foreground">{r.email ?? "—"}</div>
                      {r.status !== "pendente" && r.origem && (
                        <div className="text-xs text-muted-foreground">
                          {r.origem === "compra" ? "pelo telefone da compra" : `por ${r.vinculado_por ?? "admin"}`}
                        </div>
                      )}
                    </>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[11px] font-semibold ${STATUS_CONTATO[r.status].className}`}
                  >
                    {STATUS_CONTATO[r.status].label}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.ultima_mensagem_em
                    ? new Date(r.ultima_mensagem_em).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {editando !== r.jid && r.status !== "bloqueado" && (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          setEditando(r.jid)
                          setEmail(r.email ?? "")
                        }}
                      >
                        {r.status === "vinculado" ? "Trocar aluna" : "Vincular"}
                      </Button>
                    )}
                    {r.status === "bloqueado" ? (
                      <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => reabrirContato(r.jid))}>
                        Desbloquear
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pending}
                        onClick={() => {
                          if (confirm("Desvincular e bloquear este número? A BIA deixa de responder a ele.")) {
                            run(() => bloquearContato(r.jid))
                          }
                        }}
                      >
                        Bloquear
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
