import { redirect } from "next/navigation"
import { createSupabaseServer } from "@/lib/supabase/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { getAccessState } from "@/lib/access"

/** E-mail do usuário logado (ou null). */
export async function currentUserEmail(): Promise<string | null> {
  const supabase = await createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.email?.toLowerCase().trim() ?? null
}

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

/** True se o e-mail está na allowlist comunidade.admins (não redireciona). */
export async function isAdmin(email: string): Promise<boolean> {
  const db = createComunidadeServiceClient()
  const { data } = await db.from("admins").select("email").eq("email", email).maybeSingle()
  return Boolean(data)
}

/** Guard do /admin: exige sessão E e-mail na allowlist comunidade.admins. */
export async function requireAdmin(): Promise<string> {
  const email = await currentUserEmail()
  if (!email) redirect("/login?redirect_to=/admin")

  const db = createComunidadeServiceClient()
  const { data } = await db.from("admins").select("email").eq("email", email).maybeSingle()
  if (!data) redirect("/login?status=admin_only")
  return email
}
