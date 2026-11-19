"use client"

import { useState, useSyncExternalStore } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Check, Circle, Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PASSWORD_CHANGE_COOKIE, PASSWORD_RULES, passwordProblem } from "@/lib/auth-password"

const assinaNada = () => () => {}
const temFlag = () =>
  document.cookie.split("; ").some((c) => c.startsWith(`${PASSWORD_CHANGE_COOKIE}=`))
const noServidor = () => false

/** Força pela quantidade de regras cumpridas, com bônus para senha longa. */
const FORCAS = [
  { label: "Muito fraca", cor: "bg-destructive" },
  { label: "Fraca", cor: "bg-destructive" },
  { label: "Razoável", cor: "bg-amber-500" },
  { label: "Boa", cor: "bg-emerald-500" },
  { label: "Forte", cor: "bg-emerald-600" },
] as const

function forca(senha: string) {
  const cumpridas = PASSWORD_RULES.filter((r) => r.test(senha)).length
  const pontos = Math.min(4, Math.max(0, cumpridas - 1 + (senha.length >= 12 ? 1 : 0)))
  return { nivel: pontos, ...FORCAS[pontos] }
}

/**
 * Pop-up obrigatório "Crie uma senha". Aparece só depois do login com a senha
 * padrão — a rota /api/auth/login-password grava a flag; OTP e Google, não.
 * Não pede a senha atual: quem chegou aqui acabou de entrar com a padrão.
 * Some quando a senha é salva (a rota apaga a flag).
 */
export function PasswordChangePrompt() {
  const pathname = usePathname()
  const router = useRouter()
  const pendente = useSyncExternalStore(assinaNada, temFlag, noServidor)
  const [feito, setFeito] = useState(false)
  const [senha, setSenha] = useState("")
  const [confirma, setConfirma] = useState("")
  const [mostrar, setMostrar] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  if (!pendente || feito || pathname.startsWith("/login")) return null

  const problema = passwordProblem(senha)
  const conferem = confirma.length > 0 && senha === confirma
  const { nivel, label, cor } = forca(senha)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (problema) {
      setError(problema)
      return
    }
    if (!conferem) {
      setError("As duas senhas precisam ser iguais.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: senha }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Não foi possível salvar a senha.")
        setLoading(false)
        return
      }
      setFeito(true)
      router.refresh()
    } catch {
      setError("Erro de conexão. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <Modal title="Crie uma senha" size="sm">
      <form onSubmit={salvar} className="grid gap-4">
        <p className="text-sm text-muted-foreground">
          Crie a sua senha para os próximos acessos. Dica: junte palavras que só
          você conhece com números e um símbolo — por exemplo,{" "}
          <span className="font-medium text-foreground">Cafe!Praia2024</span>. Não
          use datas de aniversário nem a mesma senha de outros sites.
        </p>

        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive-subtle/40 p-3">
            <p className="text-xs text-destructive text-center">{error}</p>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="nova-senha">Nova senha</Label>
          <div className="relative">
            <Input
              id="nova-senha"
              type={mostrar ? "text" : "password"}
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              disabled={loading}
              autoFocus
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setMostrar((m) => !m)}
              aria-label={mostrar ? "Esconder senha" : "Mostrar senha"}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {senha && (
            <div className="grid gap-1">
              <div className="flex gap-1" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className={cn("h-1 flex-1 rounded-full bg-border", i < nivel && cor)}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted-foreground">Força: {label}</span>
            </div>
          )}

          <ul className="grid gap-1 pt-1">
            {PASSWORD_RULES.map((r) => {
              const ok = r.test(senha)
              return (
                <li
                  key={r.id}
                  className={cn(
                    "flex items-center gap-2 text-xs",
                    ok ? "text-emerald-600" : "text-muted-foreground"
                  )}
                >
                  {ok ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                  {r.label}
                </li>
              )
            })}
          </ul>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="confirma-senha">Repita a nova senha</Label>
          <Input
            id="confirma-senha"
            type={mostrar ? "text" : "password"}
            autoComplete="new-password"
            value={confirma}
            onChange={(e) => setConfirma(e.target.value)}
            disabled={loading}
            required
          />
          {confirma && (
            <span
              className={cn(
                "text-xs",
                conferem ? "text-emerald-600" : "text-destructive"
              )}
            >
              {conferem ? "As senhas conferem." : "As senhas ainda não estão iguais."}
            </span>
          )}
        </div>

        <Button type="submit" disabled={loading || !!problema || !conferem}>
          {loading ? "Salvando..." : "Criar senha"}
        </Button>
      </form>
    </Modal>
  )
}
