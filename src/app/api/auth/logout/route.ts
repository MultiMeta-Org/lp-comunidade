import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSupabaseServer } from "@/lib/supabase/server"
import { PASSWORD_CHANGE_COOKIE } from "@/lib/auth-password"

export const runtime = "nodejs"

/** POST /api/auth/logout — encerra a sessão (limpa os cookies). */
export async function POST() {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  // A troca de senha pendente é da sessão que saiu, não de quem entrar depois.
  const cookieStore = await cookies()
  cookieStore.delete(PASSWORD_CHANGE_COOKIE)
  return NextResponse.json({ success: true })
}
