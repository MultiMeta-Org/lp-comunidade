import { cache } from "react"
import { redirect } from "next/navigation"
import { createSupabaseServer } from "@/lib/supabase/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { getAccessState } from "@/lib/access"

/**
 * E-mail do usuário logado (ou null).
 * Usa getClaims(): com JWT signing keys assimétricas (ECC/RSA), a verificação
 * do token é feita LOCALMENTE via JWKS — sem ida-e-volta de rede ao Supabase
 * Auth a cada navegação. Com o segredo HS256 legado cai no fallback de rede
 * (mesma latência do getUser), então é seguro trocar antes de rotacionar a chave.
 * Memoizado por request (React cache): página + SiteHeader compartilham a leitura.
 */
export const currentUserEmail = cache(async (): Promise<string | null> => {
  const supabase = await createSupabaseServer()
  const { data } = await supabase.auth.getClaims()
  const email = data?.claims?.email
  return typeof email === "string" ? email.toLowerCase().trim() : null
})

/**
 * Guard das páginas de conteúdo: exige sessão E acesso liberado (7 dias + active).
 * Cobre o caso de um usuário logado que teve o acesso revogado (reembolso).
 * Retorna o e-mail liberado.
 */
export async function requireReleasedAccess(): Promise<string> {
  const email = await currentUserEmail()
  if (!email) redirect("/login")

  const access = await getAccessState(email)
  if (!access.authorized) {
    redirect(`/login?status=${access.reason}`)
  }
  return email
}

/**
 * True se o e-mail está na allowlist comunidade.admins (não redireciona).
 * Memoizado por request: SiteHeader e o guard do /admin compartilham a query.
 */
export const isAdmin = cache(async (email: string): Promise<boolean> => {
  const db = createComunidadeServiceClient()
  const { data } = await db.from("admins").select("email").eq("email", email).maybeSingle()
  return Boolean(data)
})

/** Guard do /admin: exige sessão E e-mail na allowlist comunidade.admins. */
export async function requireAdmin(): Promise<string> {
  const email = await currentUserEmail()
  if (!email) redirect("/login?redirect_to=/admin")
  if (!(await isAdmin(email))) redirect("/login?status=admin_only")
  return email
}
