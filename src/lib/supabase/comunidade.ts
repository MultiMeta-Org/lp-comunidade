import { createClient, SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

type ComunidadeClient = SupabaseClient<Database, "comunidade">

/**
 * Client service-role apontando para o schema `comunidade`.
 * Ignora RLS — usar SOMENTE em contexto de servidor confiável
 * (webhooks, rotas de auth, server actions do admin).
 */
export function createComunidadeServiceClient(): ComunidadeClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada")

  return createClient<Database, "comunidade">(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { db: { schema: "comunidade" } }
  )
}

/**
 * Client admin no schema `public` (auth). Usado para operações de auth admin
 * (generateLink, updateUserById) no fluxo passwordless.
 */
export function createSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada")

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
