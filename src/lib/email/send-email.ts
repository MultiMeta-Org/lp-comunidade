const RESEND_API_URL = "https://api.resend.com/emails"

interface SendEmailParams {
  to: string | string[]
  subject: string
  html: string
  text: string
}

interface SendEmailResult {
  success: boolean
  error?: string
}

/**
 * Fallback de desenvolvimento: envia via API REST do Mailpit do Supabase local
 * (mesmo host do NEXT_PUBLIC_SUPABASE_URL, porta 54324). Usado quando não há
 * RESEND_API_KEY — os e-mails caem na caixa local em http://localhost:54324.
 */
async function sendViaMailpit({
  to,
  subject,
  html,
  fromAddress,
}: {
  to: string[]
  subject: string
  html: string
  fromAddress: string
}): Promise<SendEmailResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const host = supabaseUrl.match(/https?:\/\/([^:/]+)/)?.[1] || "localhost"
  const port = process.env.MAILPIT_PORT || "54324"
  const mailpitUrl = `http://${host}:${port}/api/v1/send`

  try {
    const response = await fetch(mailpitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        From: {
          Email: fromAddress.match(/<(.+)>/)?.[1] || fromAddress,
          Name: fromAddress.match(/^(.+?)\s*</)?.[1] || "Comunidade VIP DVP",
        },
        To: to.map((email) => ({ Email: email, Name: "" })),
        Subject: subject,
        HTML: html,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[email] Mailpit error:", { status: response.status, body: errorText })
      return { success: false, error: `Mailpit error: ${response.status}` }
    }

    console.log("[email] Enviado via Mailpit (dev local):", { to, subject })
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error("[email] Mailpit falhou:", errorMessage)
    return { success: false, error: errorMessage }
  }
}

/**
 * Envia e-mail via API HTTP do Resend.
 * Server-side apenas — chamar de Route Handlers, nunca de client components.
 *
 * Sem RESEND_API_KEY configurada (ex.: esqueleto antes do Supabase/Resend),
 * apenas loga e retorna falha controlada — o chamador trata a mensagem.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailParams): Promise<SendEmailResult> {
  const resendKey = (process.env.RESEND_API_KEY || "").trim()
  const fromAddress =
    process.env.RESEND_FROM ||
    "Comunidade VIP DVP <contato@atualizacoes.crmmultimeta.com.br>"
  const recipients = Array.isArray(to) ? to : [to]

  // Dev local: sem Resend, cai no Mailpit do Supabase local.
  if (!resendKey) {
    console.warn("[email] RESEND_API_KEY ausente — usando Mailpit (dev local)")
    return sendViaMailpit({ to: recipients, subject, html, fromAddress })
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        subject,
        html,
        text,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[email] Resend error:", {
        status: response.status,
        body: errorText,
      })
      return { success: false, error: `Resend API error: ${response.status}` }
    }

    const result = await response.json()
    console.log("[email] Sent:", { to: recipients, messageId: result.id, subject })
    return { success: true }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error("[email] Failed:", errorMessage)
    return { success: false, error: errorMessage }
  }
}
