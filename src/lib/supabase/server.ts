import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./database.types"

// Cookie próprio da Comunidade — precisa diferir de outros produtos MultiMeta
// para isolar a sessão no mesmo domínio/localhost.
export const COMUNIDADE_COOKIE = "sb-comunidade-auth-token"

/**
 * Client Supabase para Server Components / Route Handlers, com sessão via cookie.
 * Usa o schema `public` para auth; para dados da comunidade use `.schema('comunidade')`.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: COMUNIDADE_COOKIE },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch {
            // Chamado de um Server Component — ignore (o proxy cuida do refresh).
          }
        },
        remove(name: string, options) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch {
            // idem
          }
        },
      },
    }
  )
}
