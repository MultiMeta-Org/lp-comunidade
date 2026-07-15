import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createComunidadeServiceClient, createSupabaseAdmin } from "@/lib/supabase/comunidade"
import { createSupabaseServer } from "@/lib/supabase/server"
import { getAccessState } from "@/lib/access"

export const runtime = "nodejs"

/**
 * POST /api/auth/verify-otp
 * Verifica o código de 6 dígitos e estabelece a sessão (passwordless).
 *
 * Segurança:
 * - Máx. 5 tentativas por código
 * - Comparação constant-time (crypto.timingSafeEqual)
 * - Só o código mais recente, não expirado e não usado é válido
 *
 * Sessão: cria/garante o usuário de auth, gera um token de magic link via admin
 * e o troca por uma sessão com `verifyOtp` no client SSR (seta os cookies).
 */
export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json()
    if (!email || !code) {
      return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Revalida o acesso (defesa em profundidade — o gate principal é o send-otp).
    const access = await getAccessState(normalizedEmail)
    if (!access.authorized) {
      return NextResponse.json({ error: "Acesso não liberado." }, { status: 403 })
    }

    const db = createComunidadeServiceClient()

    const { data: otp, error: fetchError } = await db
      .from("login_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .is("verified_at", null)
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fetchError) {
      console.error("[verify-otp] fetch error:", fetchError.message)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    if (!otp) {
      return NextResponse.json(
        { error: "Código expirado ou inválido. Solicite um novo código." },
        { status: 400 }
      )
    }

    if (otp.attempts >= 5) {
      return NextResponse.json(
        { error: "Muitas tentativas. Solicite um novo código.", attemptsRemaining: 0 },
        { status: 429 }
      )
    }

    await db.from("login_otps").update({ attempts: otp.attempts + 1 }).eq("id", otp.id)

    const submitted = Buffer.from(String(code).padEnd(6, "0"))
    const stored = Buffer.from(otp.code.padEnd(6, "0"))
    const isValid =
      submitted.length === stored.length && crypto.timingSafeEqual(submitted, stored)

    if (!isValid) {
      const attemptsRemaining = Math.max(0, 4 - otp.attempts)
      return NextResponse.json(
        { error: "Código incorreto.", attemptsRemaining },
        { status: 400 }
      )
    }

    // Marca como usado.
    await db.from("login_otps").update({ verified_at: new Date().toISOString() }).eq("id", otp.id)

    // Garante o usuário de auth (cria no primeiro acesso; ignora se já existir).
    const admin = createSupabaseAdmin()
    const { error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      email_confirm: true,
    })
    if (createError && !/already|registered|exists/i.test(createError.message)) {
      console.error("[verify-otp] createUser error:", createError.message)
      return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 })
    }

    // Gera um OTP de magic link (sem enviar e-mail) e troca por sessão (seta cookies).
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: normalizedEmail,
    })

    const emailOtp = linkData?.properties?.email_otp
    if (linkError || !emailOtp) {
      console.error("[verify-otp] generateLink error:", linkError?.message)
      return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 })
    }

    const supabase = await createSupabaseServer()
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: emailOtp,
      type: "email",
    })

    if (verifyError) {
      console.error("[verify-otp] verifyOtp error:", verifyError.message)
      return NextResponse.json({ error: "Falha ao criar sessão" }, { status: 500 })
    }

    console.log(`[verify-otp] sessão criada para ${normalizedEmail}`)
    return NextResponse.json({ verified: true })
  } catch (error) {
    console.error("[verify-otp] error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
