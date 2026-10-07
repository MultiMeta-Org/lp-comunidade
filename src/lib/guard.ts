import { cache } from "react"
import { redirect } from "next/navigation"
import { createSupabaseServer } from "@/lib/supabase/server"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { getAccessState, hasLab } from "@/lib/access"

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
 * Quem está vendo o acervo, e com qual alcance.
 *
 * `scope` é o que decide o que a página mostra e, principalmente, o que ela
 * NÃO monta: com "aberto", lessons-server devolve apenas as aulas marcadas
 * como `open_to_all` e sem PDF/áudio. O corte é no servidor porque esconder o
 * botão não bastaria — a URL assinada iria no HTML junto.
 *
 * Admin entra como "lab" sem ter comprado: é ela quem publica a aula e precisa
 * conferir do jeito que a aluna vê. Não é posse do produto — a home segue sem
 * a seção do Laboratório para ela.
 */
export type LessonsViewer = {
  email: string
  scope: "lab" | "aberto"
  /**
   * Admin conferindo o próprio trabalho. As páginas usam isto para NÃO contar a
   * visita dela na presença da aula: quem publica entra em toda aula para ver se
   * ficou certo, e isso inflaria "abriram" com alguém que não é da turma.
   */
  admin: boolean
}

/**
 * Guard das páginas de material (/aulas, /dia/[id]): exige acesso liberado e
 * devolve o alcance. Já não redireciona quem não tem a assinatura — ela vê o
 * Plantão Tira Dúvidas, que agora é de todas.
 */
export async function requireLessonsViewer(): Promise<LessonsViewer> {
  const email = await requireReleasedAccess()
  const [lab, admin] = await Promise.all([hasLab(email), isAdmin(email)])
  return { email, scope: lab || admin ? "lab" : "aberto", admin }
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
