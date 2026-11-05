import { createClient } from "@supabase/supabase-js"

/**
 * Client service-role no schema `bia` (o da assistente, repo multimeta-bia).
 * Ignora RLS — usar SOMENTE em server actions/páginas do admin.
 *
 * Sem os tipos gerados: o schema `bia` não entra no database.types do portal,
 * e as poucas colunas que o admin usa estão tipadas em admin/whatsapp.
 */
export function createBiaServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada")

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    db: { schema: "bia" },
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
