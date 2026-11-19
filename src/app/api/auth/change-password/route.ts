import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSupabaseAdmin } from "@/lib/supabase/comunidade"
import { createSupabaseServer } from "@/lib/supabase/server"
import { PASSWORD_CHANGE_COOKIE, passwordProblem } from "@/lib/auth-password"

export const runtime = "nodejs"

/**
 * POST /api/auth/change-password
 * Define a senha própria da aluna logada (o pop-up obrigatório depois do
 * login com a senha padrão). Marca app_metadata.password_set — a partir daí a
 * senha padrão deixa de valer para este e-mail.
 */
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    if (typeof password !== "string") {
      return NextResponse.json({ error: "Informe a senha." }, { status: 400 })
    }
    const problem = passwordProblem(password)
    if (problem) {
      return NextResponse.json({ error: problem }, { status: 400 })
    }

    const supabase = await createSupabaseServer()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) {
      return NextResponse.json({ error: "Sessão expirada. Entre de novo." }, { status: 401 })
    }

    const admin = createSupabaseAdmin()
    const { error: updateError } = await admin.auth.admin.updateUserById(user.id, {
      password,
      app_metadata: { ...user.app_metadata, password_set: true },
    })
    if (updateError) {
      console.error("[change-password] update error:", updateError.message)
      return NextResponse.json(
        { error: "Não foi possível salvar a senha. Tente outra." },
        { status: 400 }
      )
    }

    // Renova a sessão já com a senha nova (e o app_metadata novo no JWT).
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })
    if (signInError) {
      console.error("[change-password] re-login error:", signInError.message)
    }

    const cookieStore = await cookies()
    cookieStore.delete(PASSWORD_CHANGE_COOKIE)

    console.log(`[change-password] senha definida para ${user.email}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[change-password] error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
