import { NextResponse } from "next/server"
import { createSupabaseServer } from "@/lib/supabase/server"

export const runtime = "nodejs"

/** POST /api/auth/logout — encerra a sessão (limpa os cookies). */
export async function POST() {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
