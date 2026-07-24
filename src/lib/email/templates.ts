const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

// ─── Design tokens (de globals.css, tema claro) ─────────────────────
const colors = {
  background: "#F5F2ED",
  foreground: "#2A2A2A",
  card: "#FCFAF8",
  mutedFg: "#5A524A",
  primary: "#758E67",
}

const ff = "'Helvetica Neue', Helvetica, Arial, sans-serif"

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

// ─── Layout compartilhado ───────────────────────────────────────────
function layout(content: string): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:${colors.background};font-family:${ff};">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${colors.background};padding:40px 20px;">
      <tr>
        <td style="font-family:${ff};" align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;margin:0 auto;">
            <tr>
              <td style="font-family:${ff};background-color:${colors.card};border-radius:12px;padding:40px 32px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <p style="font-family:${ff};margin:0 0 24px 0;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${colors.mutedFg};text-align:center;">
                  MultiMeta · Comunidade VIP
                </p>
                ${content}
              </td>
            </tr>
            <tr>
              <td style="font-family:${ff};padding:24px 0 0 0;text-align:center;">
                <p style="font-family:${ff};margin:0;font-size:13px;color:${colors.mutedFg};line-height:1.5;">
                  Você recebeu este e-mail porque tem acesso à
                  <a href="${baseUrl}" style="color:${colors.primary};text-decoration:none;">Comunidade VIP EVP</a>.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`
}

// ─── Código de login (OTP) ──────────────────────────────────────────
export function otpEmail(params: { code: string }) {
  const { code } = params

  const html = layout(`
                <h1 style="font-family:${ff};margin:0 0 8px 0;font-size:22px;font-weight:600;color:${colors.foreground};text-align:center;">
                  Seu código de acesso
                </h1>
                <p style="font-family:${ff};margin:0 0 28px 0;font-size:15px;color:${colors.mutedFg};line-height:1.6;text-align:center;">
                  Use o código abaixo para entrar na Comunidade VIP EVP.
                </p>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="font-family:${ff};padding:24px;background-color:${colors.background};border-radius:8px;text-align:center;">
                      <p style="font-family:'Courier New',Courier,monospace;margin:0;font-size:36px;font-weight:700;letter-spacing:8px;color:${colors.foreground};">${escapeHtml(code)}</p>
                    </td>
                  </tr>
                </table>
                <p style="font-family:${ff};margin:20px 0 0 0;font-size:13px;color:${colors.mutedFg};line-height:1.5;text-align:center;">
                  Este código expira em <strong>10 minutos</strong>.<br/>
                  Se você não solicitou este código, ignore este e-mail.
                </p>
  `)

  const text = [
    "Seu código de acesso — Comunidade VIP EVP",
    "",
    `Código: ${code}`,
    "",
    "Este código expira em 10 minutos.",
    "Se você não solicitou este código, ignore este e-mail.",
    "",
    "— Comunidade VIP EVP",
  ].join("\n")

  return {
    subject: `${code} — Seu código de acesso`,
    html,
    text,
  }
}
