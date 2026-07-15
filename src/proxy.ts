import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createProxyClient } from "@/lib/supabase/proxy-client"

/**
 * Proxy (Next 16 — antigo middleware). Ver:
 *   node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md
 *
 * Faz o refresh da sessão e o gate de autenticação (optimistic check):
 *   • sem sessão em rota protegida → /login?redirect_to=...
 *   • sessão presente → segue; a autorização fina fica nas camadas certas:
 *       - liberação (7 dias)  → RLS de comunidade.lessons + guard das páginas
 *       - /admin              → verificação da allowlist no layout do /admin
 *
 * Rotas públicas (excluídas pelo matcher): /login, /api/*, assets estáticos.
 */
export async function proxy(request: NextRequest) {
  const { supabase, response } = createProxyClient(request)

  // getUser valida o JWT junto ao Supabase (recomendado no SSR).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const loginUrl = new URL("/login", request.url)
    const { pathname, search } = request.nextUrl
    if (pathname !== "/") loginUrl.searchParams.set("redirect_to", pathname + search)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  // Roda em tudo, exceto: rotas de API, assets do Next, arquivos estáticos e /login.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
}
