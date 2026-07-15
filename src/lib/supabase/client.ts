import { createBrowserClient } from "@supabase/ssr"
import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cookie próprio da Comunidade (ver server.ts).
export const COMUNIDADE_COOKIE = "sb-comunidade-auth-token"

// Browser client SSR-aware, para persistência de sessão no cliente.
const createSupabaseClient = () => {
  if (typeof window === "undefined") {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
  try {
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookieOptions: { name: COMUNIDADE_COOKIE },
    })
  } catch {
    return createClient<Database>(supabaseUrl, supabaseAnonKey)
  }
}

type SupabaseClientType = ReturnType<typeof createSupabaseClient>
const globalForSupabase = globalThis as unknown as {
  __COMUNIDADE_SUPABASE__?: SupabaseClientType
}

export const supabase: SupabaseClientType =
  globalForSupabase.__COMUNIDADE_SUPABASE__ ?? createSupabaseClient()

if (typeof window !== "undefined") {
  globalForSupabase.__COMUNIDADE_SUPABASE__ = supabase
}
