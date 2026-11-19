import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSupabaseAdmin } from "@/lib/supabase/comunidade"
import { createSupabaseServer } from "@/lib/supabase/server"
import {
  getAccessState,
  refreshDesafioEntitlement,
  refreshVipEntitlement,
} from "@/lib/access"
import { PASSWORD_CHANGE_COOKIE, isDefaultPassword } from "@/lib/auth-password"

export const runtime = "nodejs"

const WRONG = "E-mail ou senha incorretos."

/**
 * POST /api/auth/login-password
 * Login por e-mail + senha, ao lado do código por e-mail e do Google.
 *
 * 1. Mesmo portão de acesso do send-otp (getAccessState).
 * 2. Quem já definiu senha (app_metadata.password_set) entra com ela, via
 *    signInWithPassword no client SSR (seta os cookies).
 * 3. Quem não definiu entra com a senha padrão: a sessão sai do mesmo caminho
 *    do verify-otp (magic link gerado pelo admin, trocado por sessão) e a
 *    resposta grava a flag que abre o pop-up de troca obrigatória.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Portão de acesso — mesmas mensagens do send-otp.
    const access = await getAccessState(normalizedEmail)
    if (!access.authorized) {
      if (access.reason === "waiting") {
        return NextResponse.json(
          {
            error: "Seu acesso ainda não foi liberado. Ele abre 7 dias após a compra.",
            status: "waiting",
            availableAt: access.availableAt,
          },
          { status: 403 }
        )
      }
      if (access.reason === "revoked") {
        return NextResponse.json(
          { error: "Seu acesso foi encerrado.", status: "revoked" },
          { status: 403 }
        )
      }
      return NextResponse.json(
        {
          error:
            "Não encontramos uma compra ativa com este e-mail. Use o e-mail da compra no Hotmart.",
          status: "not_found",
        },
        { status: 403 }
      )
    }

    // Garante o usuário de auth (cria no primeiro acesso; ignora se já existir).
    const admin = createSupabaseAdmin()
    const { error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    })
    if (createError && !/already|registered|exists/i.test(createError.message)) {
      console.error("[login-password] createUser error:", createError.message)
      return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 })
    }

    // generateLink devolve o usuário (com app_metadata) e um OTP de sessão —
    // não envia e-mail. O OTP só é usado no caminho da senha padrão.
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    })
    const emailOtp = linkData?.properties?.email_otp
    if (linkError || !emailOtp || !linkData.user) {
      console.error("[login-password] generateLink error:", linkError?.message)
      return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 })
    }

    const supabase = await createSupabaseServer()
    const passwordSet = linkData.user.app_metadata?.password_set === true

    if (passwordSet) {
      // 2. Senha própria.
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })
      if (signInError) {
        return NextResponse.json({ error: WRONG }, { status: 401 })
      }
    } else {
      // 3. Senha padrão.
      if (!isDefaultPassword(password)) {
        return NextResponse.json({ error: WRONG }, { status: 401 })
      }
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: normalizedEmail,
        token: emailOtp,
        type: "email",
      })
      if (verifyError) {
        console.error("[login-password] verifyOtp error:", verifyError.message)
        return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 })
      }
      const cookieStore = await cookies()
      cookieStore.set(PASSWORD_CHANGE_COOKIE, "1", {
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      })
    }

    // Quem comprou um dos produtos agora há pouco já entra com ele liberado.
    await Promise.all([
      refreshVipEntitlement(normalizedEmail),
      refreshDesafioEntitlement(normalizedEmail),
    ])

    console.log(
      `[login-password] sessão criada para ${normalizedEmail} (${passwordSet ? "senha própria" : "senha padrão"})`
    )
    return NextResponse.json({ success: true, mustChangePassword: !passwordSet })
  } catch (error) {
    console.error("[login-password] error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
