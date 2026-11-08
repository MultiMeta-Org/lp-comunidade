import { NextResponse, type NextRequest } from "next/server"
import { requireDesafio } from "@/lib/guard"
import { getMaterial } from "@/lib/desafio/biblioteca"
import { assinarMateriais } from "@/lib/desafio/biblioteca-server"

/**
 * Baixa um modelo da Biblioteca (o contrato de closer, a apresentação): confere
 * a posse do Desafio e redireciona para a signed URL, como o /desafio/caderno.
 */
export async function GET(_request: NextRequest, { params }: { params: Promise<{ chave: string }> }) {
  await requireDesafio()

  const { chave } = await params
  const material = getMaterial(chave)
  if (!material?.arquivo) return new NextResponse("Material não encontrado.", { status: 404 })

  const [m] = await assinarMateriais([material], ["arquivo"])
  if (!m.arquivo) {
    return new NextResponse("Não consegui abrir o arquivo agora. Tente de novo em instantes.", {
      status: 502,
    })
  }
  return NextResponse.redirect(m.arquivo)
}
