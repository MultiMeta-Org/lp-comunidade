import { formatarTelefone, telefoneParaWhatsApp } from "@/lib/telefone"

/**
 * Telefone como link do WhatsApp Web — é por onde a conversa acontece.
 *
 * O link é `wa.me`, não `web.whatsapp.com`: o mesmo href abre o WhatsApp Web no
 * computador e o aplicativo no celular, então a mesma tela serve a Nati nos dois
 * lugares. Número que não passa na validação (cadastrado antes dela existir, ou
 * vindo torto da Hotmart) fica só texto — um link para um número inválido abre
 * uma conversa com ninguém.
 */
export function TelefoneWhatsApp({
  telefone,
  vazio = "—",
  className = "",
}: {
  telefone: string | null | undefined
  /** O que mostrar quando não há telefone nenhum. */
  vazio?: string
  className?: string
}) {
  if (!telefone?.trim()) {
    return <span className={`text-muted-foreground ${className}`}>{vazio}</span>
  }

  const whatsapp = telefoneParaWhatsApp(telefone)
  if (!whatsapp) return <span className={className}>{telefone}</span>

  return (
    <a
      href={`https://wa.me/${whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      title="Abrir conversa no WhatsApp"
      className={`text-primary underline-offset-2 hover:underline ${className}`}
    >
      {formatarTelefone(telefone)}
    </a>
  )
}
