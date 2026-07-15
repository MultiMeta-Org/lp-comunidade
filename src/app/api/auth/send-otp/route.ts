import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { getAccessState } from "@/lib/access"
import { sendEmail } from "@/lib/email/send-email"
import { otpEmail } from "@/lib/email/templates"

export const runtime = "nodejs"

/**
 * POST /api/auth/send-otp
 * Porta de entrada do login passwordless.
 *
 * 1. Confere o acesso (getAccessState): só e-mails liberados (active + 7 dias) recebem código.
 * 2. Rate limit: máx. 5 códigos/e-mail/hora; cooldown de 60s entre envios.
 * 3. Gera código de 6 dígitos, envia via Resend e grava em login_otps (expira em 10min).
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "E-mail obrigatório" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // 1. Portão de acesso — mensagens contextuais por motivo.
    const access = await getAccessState(normalizedEmail)
    if (!access.authorized) {
      if (access.reason === "waiting") {
        return NextResponse.json(
          {
            error:
              "Seu acesso ainda não foi liberado. Ele abre 7 dias após a compra.",
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
      // not_found — não revelar demais.
      return NextResponse.json(
        {
          error:
            "Não encontramos uma compra ativa com este e-mail. Use o e-mail da compra no Hotmart.",
          status: "not_found",
        },
        { status: 403 }
      )
    }

    const db = createComunidadeServiceClient()

    // 2. Rate limit: máx 5/hora.
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await db
      .from("login_otps")
      .select("*", { count: "exact", head: true })
      .eq("email", normalizedEmail)
      .gte("created_at", oneHourAgo)

    if ((count ?? 0) >= 5) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde antes de solicitar um novo código." },
        { status: 429 }
      )
    }

    // Cooldown de 60s desde o último envio.
    const { data: latestOtp } = await db
      .from("login_otps")
      .select("created_at")
      .eq("email", normalizedEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (latestOtp) {
      const secondsSinceLast =
        (Date.now() - new Date(latestOtp.created_at).getTime()) / 1000
      if (secondsSinceLast < 60) {
        return NextResponse.json(
          {
            error: "Aguarde antes de solicitar um novo código.",
            cooldown: Math.ceil(60 - secondsSinceLast),
          },
          { status: 429 }
        )
      }
    }

    // 3. Gera e envia o código.
    const code = crypto.randomInt(100000, 999999).toString()
    const { subject, html, text } = otpEmail({ code })
    const emailResult = await sendEmail({ to: normalizedEmail, subject, html, text })

    if (!emailResult.success) {
      console.error("[send-otp] falha no envio:", emailResult.error)
      return NextResponse.json(
        { error: "Falha ao enviar o código. Tente novamente." },
        { status: 500 }
      )
    }

    // Só persiste o código após o envio ter sucesso.
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()
    const { error: insertError } = await db.from("login_otps").insert({
      email: normalizedEmail,
      code,
      expires_at: expiresAt,
    })

    if (insertError) {
      console.error("[send-otp] insert error:", insertError.message)
      return NextResponse.json({ error: "Erro interno" }, { status: 500 })
    }

    console.log(`[send-otp] código enviado para ${normalizedEmail}`)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[send-otp] error:", error)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
