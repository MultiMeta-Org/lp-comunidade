"use server"

import { revalidatePath } from "next/cache"
import { createBiaServiceClient } from "@/lib/supabase/bia"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { requireAdmin } from "@/lib/guard"

export type ActionResult = { ok: boolean; error?: string }

/**
 * O admin não fala com o WhatsApp direto: escreve um PEDIDO em
 * bia.whatsapp_estado, e o processo da BIA no VPS o executa em poucos
 * segundos e escreve de volta o status (e o código de pareamento).
 */
async function pedir(
  pedido: "parear" | "desconectar",
  telefone: string | null
): Promise<ActionResult> {
  const admin = await requireAdmin()
  const { error } = await createBiaServiceClient()
    .from("whatsapp_estado")
    .update({
      pedido,
      pedido_telefone: telefone,
      pedido_por: admin,
      pedido_em: new Date().toISOString(),
      erro: null,
    })
    .eq("id", 1)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/whatsapp")
  return { ok: true }
}

export async function pedirPareamento(telefone: string): Promise<ActionResult> {
  const digitos = telefone.replace(/\D/g, "")
  if (digitos.length < 12) {
    return { ok: false, error: "Use DDI + DDD + número, ex.: 5511987654321." }
  }
  return pedir("parear", digitos)
}

export async function pedirDesconexao(): Promise<ActionResult> {
  return pedir("desconectar", null)
}

/**
 * Liga um contato do WhatsApp a uma aluna. Só e-mail com acesso ATIVO: a BIA
 * confere o acesso de novo a cada mensagem, mas vincular a um e-mail revogado
 * só criaria uma conversa que responde "sem acesso".
 */
export async function vincularContato(jid: string, email: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  const normalizado = email.toLowerCase().trim()
  if (!normalizado.includes("@")) return { ok: false, error: "E-mail inválido." }

  const { data: acesso } = await createComunidadeServiceClient()
    .from("authorized_emails")
    .select("status")
    .eq("email", normalizado)
    .maybeSingle()
  if (acesso?.status !== "active") {
    return { ok: false, error: `${normalizado} não tem acesso ativo no portal.` }
  }

  return atualizarContato(jid, {
    status: "vinculado",
    email: normalizado,
    origem: "admin",
    vinculado_por: admin,
    vinculado_em: new Date().toISOString(),
  })
}

/** Desvincula e não deixa a BIA reconhecer de novo pelo telefone da compra. */
export async function bloquearContato(jid: string): Promise<ActionResult> {
  const admin = await requireAdmin()
  return atualizarContato(jid, {
    status: "bloqueado",
    email: null,
    origem: "admin",
    vinculado_por: admin,
    vinculado_em: new Date().toISOString(),
  })
}

/** Volta para pendente: na próxima mensagem a BIA tenta o telefone da compra de novo. */
export async function reabrirContato(jid: string): Promise<ActionResult> {
  await requireAdmin()
  return atualizarContato(jid, {
    status: "pendente",
    email: null,
    origem: null,
    vinculado_por: null,
    vinculado_em: null,
    aviso_em: null,
  })
}

async function atualizarContato(
  jid: string,
  campos: Record<string, string | null>
): Promise<ActionResult> {
  const { error } = await createBiaServiceClient()
    .from("whatsapp_contatos")
    .update(campos)
    .eq("jid", jid)
  if (error) return { ok: false, error: error.message }
  revalidatePath("/admin/whatsapp")
  return { ok: true }
}
