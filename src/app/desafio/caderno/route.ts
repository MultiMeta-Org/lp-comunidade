import { NextResponse, type NextRequest } from "next/server"
import { requireDesafio } from "@/lib/guard"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import { CADERNO } from "@/lib/desafio/caderno"

/** Curta: o link é gerado a cada clique, não precisa sobreviver a cache. */
const VALIDADE_SEGUNDOS = 60 * 60

/**
 * Abre o Caderno de Campo: /desafio/caderno?pagina=N.
 *
 * Confere a posse do Desafio (quem não tem vai para a home, como no resto do
 * /desafio), gera uma signed URL do bucket privado e redireciona para ela com
 * `#page=N` — o leitor de PDF do navegador abre direto na página. É o link que
 * a BIA manda quando cita o Caderno.
 */
export async function GET(request: NextRequest) {
  await requireDesafio()

  const n = Number(request.nextUrl.searchParams.get("pagina"))
  const pagina = Number.isInteger(n) && n >= 1 && n <= CADERNO.totalPaginas ? n : 1

  const { data, error } = await createComunidadeServiceClient()
    .storage.from(CADERNO.bucket)
    .createSignedUrl(CADERNO.path, VALIDADE_SEGUNDOS)

  if (error || !data) {
    console.error("[caderno] signed URL:", error?.message)
    return new NextResponse("Não consegui abrir o Caderno agora. Tente de novo em instantes.", {
      status: 502,
    })
  }

  return NextResponse.redirect(`${data.signedUrl}#page=${pagina}`)
}
