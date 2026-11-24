import "server-only"
import { createComunidadeServiceClient } from "@/lib/supabase/comunidade"
import type { MaterialDaBiblioteca } from "@/lib/desafio/biblioteca"

/** Como o vídeo dos dias: a página fica aberta numa aba e é assistida horas depois. */
const TTL = 60 * 60 * 12

/** O material com `arquivo` e `capa` trocados por signed URLs. */
export type MaterialAssinado = Omit<MaterialDaBiblioteca, "arquivo" | "capa"> & {
  arquivo?: string
  capa?: string
  /** O arquivo existe no bucket (assinado ou não nesta chamada). */
  disponivel: boolean
}

function separar(ref: string): { bucket: string; caminho: string } | null {
  if (!ref.startsWith("storage://")) return null
  const resto = ref.slice("storage://".length)
  const barra = resto.indexOf("/")
  return barra === -1 ? null : { bucket: resto.slice(0, barra), caminho: resto.slice(barra + 1) }
}

/**
 * Assina capas e/ou arquivos de vários materiais de uma vez (uma chamada por
 * bucket, não uma por arquivo — a Biblioteca tem uma capa por card).
 *
 * `campos` escolhe o que assinar: a vitrine só precisa da capa; o vídeo só
 * desce assinado na página dele. Falhou a assinatura, o campo fica vazio e o
 * card mostra o estado sem arquivo — melhor que uma imagem quebrada.
 *
 * Serve também às aulas da parte teórica, que têm o mesmo `arquivo` e `capa`.
 */
export async function assinarMateriais<M extends { arquivo?: string; capa?: string }>(
  materiais: readonly M[],
  campos: readonly ("arquivo" | "capa")[] = ["capa"]
): Promise<(M & { disponivel: boolean })[]> {
  const porBucket = new Map<string, Set<string>>()
  for (const m of materiais) {
    for (const campo of campos) {
      const alvo = m[campo] && separar(m[campo])
      if (!alvo) continue
      if (!porBucket.has(alvo.bucket)) porBucket.set(alvo.bucket, new Set())
      porBucket.get(alvo.bucket)!.add(alvo.caminho)
    }
  }

  const db = createComunidadeServiceClient()
  const assinadas = new Map<string, string>()
  await Promise.all(
    [...porBucket].map(async ([bucket, caminhos]) => {
      const { data, error } = await db.storage.from(bucket).createSignedUrls([...caminhos], TTL)
      if (error) console.error("[biblioteca] assinar:", error.message)
      for (const item of data ?? []) {
        if (item.path && item.signedUrl) assinadas.set(`storage://${bucket}/${item.path}`, item.signedUrl)
      }
    })
  )

  return materiais.map((m) => ({
    ...m,
    disponivel: Boolean(m.arquivo),
    // Link de fora (o modelo no Canva) não tem o que assinar: passa como está.
    arquivo:
      campos.includes("arquivo") && m.arquivo
        ? separar(m.arquivo)
          ? assinadas.get(m.arquivo)
          : m.arquivo
        : undefined,
    capa: m.capa ? assinadas.get(m.capa) : undefined,
  }))
}
