import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import type { Database } from "./database.types"
import { COMUNIDADE_COOKIE } from "./client"

/**
 * Client Supabase para uso dentro do `proxy.ts` (antigo middleware no Next 16).
 * Retorna o client e a `response` que carrega os cookies de sessão atualizados.
 */
export const createProxyClient = (request: NextRequest) => {
  const response = NextResponse.next()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: { name: COMUNIDADE_COOKIE },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: "", ...options })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    }
  )

  return { supabase, response }
}
