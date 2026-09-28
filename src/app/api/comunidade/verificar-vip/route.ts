import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import { currentUserEmail } from "@/lib/guard"
import { verificarCompraVip } from "@/lib/vip-check"

export const runtime = "nodejs"

/**
 * POST /api/comunidade/verificar-vip
 * "Acabei de assinar, e continua travado." — o botão que a aluna aperta.
 *
 * Pergunta à Hotmart pela compra DELA (a sessão diz quem é; o e-mail não vem
 * do corpo, senão qualquer um verificaria qualquer um) e libera na hora se
 * houver compra. É o mesmo caminho do login, disponível para quem já estava
 * logada quando comprou — que é justamente o caso de quem clicou em "Assinar"
 * a partir da home.
 */
export async function POST() {
  const email = await currentUserEmail()
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const liberado = await verificarCompraVip(email)
  if (liberado) revalidatePath("/")

  return NextResponse.json({ liberado })
}
