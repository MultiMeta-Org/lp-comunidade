import { NextResponse, type NextRequest } from "next/server"
import { requireDesafio } from "@/lib/guard"
import { getItemDaTeoria } from "@/lib/desafio/teoria"
import { assinarMateriais } from "@/lib/desafio/biblioteca-server"

/**
 * Baixa o PDF de uma fase (ou, com `?anexo=1`, o anexo da aula — a cartinha
 * da Virada): confere a posse do Desafio e redireciona para a signed URL, como
 * o /arquivo da Biblioteca.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ chave: string }> }) {
  await requireDesafio()

  const { chave } = await params
  const item = getItemDaTeoria(chave)
  const arquivo = request.nextUrl.searchParams.has("anexo")
    ? item?.anexo?.arquivo
    : item?.tipo === "documento"
      ? item.arquivo
      : undefined
  if (!arquivo) return new NextResponse("Arquivo não encontrado.", { status: 404 })

  const [m] = await assinarMateriais([{ arquivo }], ["arquivo"])
  if (!m.arquivo) {
    return new NextResponse("Não consegui abrir o arquivo agora. Tente de novo em instantes.", {
      status: 502,
    })
  }
  return NextResponse.redirect(m.arquivo)
}
