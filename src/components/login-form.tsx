"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail } from "lucide-react"

import { cn } from "@/lib/utils"
import { supabase } from "@/lib/supabase/client"
import { MultiMetaLogo } from "@/components/multimeta-logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/ui/input-otp"

type Step = "email" | "code"

export function LoginForm({ className }: { className?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get("redirect_to"))

  // Mensagem inicial vinda do proxy (?status=waiting|revoked|not_found)
  const initialStatus = searchParams.get("status")

  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(() =>
    initialStatus ? statusMessage(initialStatus) : ""
  )
  const [info, setInfo] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setInterval(() => setResendCooldown((p) => Math.max(0, p - 1)), 1000)
    return () => clearInterval(t)
  }, [resendCooldown])

  /**
   * Login com Google (OAuth/PKCE do Supabase). O portão de acesso roda no
   * retorno, em /api/auth/callback: e-mail sem compra ativa não vira sessão.
   */
  const signInWithGoogle = useCallback(async () => {
    setGoogleLoading(true)
    setError("")
    setInfo("")
    const callback = new URL("/api/auth/callback", window.location.origin)
    callback.searchParams.set("redirect_to", redirectTo)

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callback.toString(),
        queryParams: { prompt: "select_account" },
      },
    })

    if (oauthError) {
      setGoogleLoading(false)
      setError("Não foi possível abrir o login do Google. Tente novamente.")
    }
    // Sem erro o browser sai desta página — mantém o botão em "Abrindo…".
  }, [redirectTo])

  const requestCode = useCallback(async () => {
    const normalized = email.toLowerCase().trim()
    if (!normalized) {
      setError("Informe seu e-mail.")
      return false
    }
    setLoading(true)
    setError("")
    setInfo("")
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalized }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Não foi possível enviar o código.")
        if (typeof data.cooldown === "number") setResendCooldown(data.cooldown)
        return false
      }
      setStep("code")
      setResendCooldown(60)
      setInfo("Código enviado. Verifique seu e-mail.")
      return true
    } catch {
      setError("Erro de conexão. Tente novamente.")
      return false
    } finally {
      setLoading(false)
    }
  }, [email])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestCode()
  }

  const verifyCode = useCallback(
    async (value: string) => {
      setLoading(true)
      setError("")
      try {
        const res = await fetch("/api/auth/verify-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.toLowerCase().trim(), code: value }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(
            data.attemptsRemaining !== undefined
              ? `${data.error} (${data.attemptsRemaining} tentativa(s) restante(s))`
              : data.error || "Código inválido."
          )
          setCode("")
          setLoading(false)
          return
        }
        // Sessão criada (cookies setados pela rota). Vai para o destino.
        router.replace(redirectTo)
        router.refresh()
      } catch {
        setError("Erro ao verificar. Tente novamente.")
        setLoading(false)
      }
    },
    [email, redirectTo, router]
  )

  // Auto-verifica quando o código completa 6 dígitos (sem efeito colateral em effect).
  const handleCodeChange = (value: string) => {
    setCode(value)
    if (value.length === 6 && !loading) verifyCode(value)
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2.5">
          <MultiMetaLogo className="h-9 w-9" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-sm font-bold tracking-tight text-foreground">
              Conexão Multimeta
            </span>
            <span className="text-[11px] font-medium text-muted-foreground">
              Portal EVP
            </span>
          </div>
        </div>
        <h1 className="text-2xl font-bold mt-2">
          {step === "email" ? "Entrar" : "Verifique seu e-mail"}
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          {step === "email"
            ? "Use o e-mail da sua compra. Enviaremos um código de acesso."
            : `Enviamos um código de 6 dígitos para ${email}.`}
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive-subtle/40 p-3">
          <p className="text-xs text-destructive text-center">{error}</p>
        </div>
      )}
      {!error && info && (
        <div className="rounded-lg border border-primary/30 bg-primary-subtle/40 p-3">
          <p className="text-xs text-primary text-center">{info}</p>
        </div>
      )}

      {step === "email" ? (
        <div className="grid gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={signInWithGoogle}
            disabled={googleLoading || loading}
            className="w-full"
          >
            <GoogleGlyph className="h-4 w-4" />
            {googleLoading ? "Abrindo o Google..." : "Continuar com Google"}
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
              ou pelo e-mail
            </span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                autoFocus
              />
            </div>
            <Button type="submit" disabled={loading || googleLoading}>
              {loading ? "Enviando..." : "Enviar código"}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-5">
          <InputOTP maxLength={6} value={code} onChange={handleCodeChange} disabled={loading}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          <Button
            className="w-full"
            disabled={loading || code.length !== 6}
            onClick={() => verifyCode(code)}
          >
            {loading ? "Verificando..." : "Entrar"}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Não recebeu?{" "}
            {resendCooldown > 0 ? (
              <span>Reenviar em {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={requestCode}
                className="underline underline-offset-4 text-foreground hover:text-primary"
              >
                Reenviar código
              </button>
            )}
          </p>

          <button
            type="button"
            onClick={() => {
              setStep("email")
              setCode("")
              setError("")
              setInfo("")
            }}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Mail className="h-3.5 w-3.5" />
            Usar outro e-mail
          </button>
        </div>
      )}
    </div>
  )
}

function safeRedirect(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value
  return "/"
}

function statusMessage(status: string): string {
  switch (status) {
    case "waiting":
      return "Seu acesso ainda não foi liberado. Ele abre 7 dias após a compra."
    case "revoked":
      return "Seu acesso foi encerrado."
    case "not_found":
      return "Não encontramos uma compra ativa com este e-mail."
    case "admin_only":
      return "Área restrita ao administrador."
    case "oauth_error":
      return "Não conseguimos concluir o login com o Google. Tente de novo."
    case "oauth_no_email":
      return "A conta do Google não liberou o e-mail. Entre pelo código."
    default:
      return "Faça login para continuar."
  }
}

/** "G" do Google, nas cores oficiais (lucide não traz ícones de marca). */
function GoogleGlyph({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.4a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.6-5.2 3.6-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3a7.2 7.2 0 0 1-10.7-3.8H1.3v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.5-3.5A12 12 0 0 0 1.3 6.6l4 3.1A7.2 7.2 0 0 1 12 4.8z"
      />
    </svg>
  )
}
