import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"
import { getAccessState, refreshVipEntitlement } from "@/lib/access"

export const runtime = "nodejs"

/**
 * GET /api/auth/callback — volta do OAuth (login com Google).
 *
 * Troca o `code` pela sessão (PKCE: o verifier está no cookie que o client do
 * browser gravou ao iniciar o fluxo) e SÓ ENTÃO aplica o portão de acesso:
 * se o e-mail do Google não está liberado em comunidade.authorized_emails,
 * a sessão é encerrada na hora e a aluna volta ao login com o motivo.
 *
 * Fica sob /api porque o proxy libera essa árvore — o callback precisa rodar
 * antes de existir sessão.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const redirectTo = safeRedirect(searchParams.get("redirect_to"))
  const code = searchParams.get("code")

  // O provedor pode voltar com erro (a aluna cancelou, consentimento negado…).
  if (searchParams.get("error") || !code) {
    return back(request, "/login?status=oauth_error")
  }

  const supabase = await createSupabaseServer()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error("[auth/callback] falha ao trocar o code:", error?.message)
    return back(request, "/login?status=oauth_error")
  }

  const email = data.session.user.email?.toLowerCase().trim()
  if (!email) {
    await supabase.auth.signOut()
    return back(request, "/login?status=oauth_no_email")
  }

  const access = await getAccessState(email)
  if (!access.authorized) {
    await supabase.auth.signOut()
    return back(request, `/login?status=${access.reason}`)
  }

  // Quem assinou a Comunidade VIP agora há pouco já entra com ela liberada.
  await refreshVipEntitlement(email)

  return back(request, redirectTo)
}

/** Só caminho interno — evita open redirect via ?redirect_to. */
function safeRedirect(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//")) return value
  return "/"
}

/**
 * Redireciona preservando o host público. Atrás de proxy (Vercel), o host da
 * request é interno: em produção vale o x-forwarded-host.
 */
function back(request: NextRequest, path: string): NextResponse {
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isDev = process.env.NODE_ENV === "development"

  if (!isDev && forwardedHost) {
    const proto = request.headers.get("x-forwarded-proto") ?? "https"
    return NextResponse.redirect(new URL(path, `${proto}://${forwardedHost}`))
  }
  return NextResponse.redirect(new URL(path, request.nextUrl.origin))
}
