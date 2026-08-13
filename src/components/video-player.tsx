import { toVideoEmbedUrl, isDirectVideoFile } from "@/lib/lessons"

/**
 * Player de vídeo da aula. A URL pode ser externa (Google Drive / YouTube) ou
 * uma signed URL do bucket privado `videos`, quando o admin sobe o arquivo.
 *   • arquivo direto (.mp4/.webm/…) → <video> nativo com controles. Cobre o
 *     upload nosso: a signed URL preserva a extensão antes do `?token=`, e o
 *     Storage responde a Range requests, então dá pra buscar no meio do vídeo;
 *   • Drive/YouTube/outros          → <iframe> de embed (streaming).
 * O container mantém proporção 16:9.
 */
export function VideoPlayer({ src, title }: { src: string; title: string }) {
  if (isDirectVideoFile(src)) {
    return (
      <video
        controls
        preload="metadata"
        src={src}
        className="w-full rounded-xl border border-border bg-black"
      />
    )
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-black aspect-video">
      <iframe
        src={toVideoEmbedUrl(src)}
        title={title}
        className="absolute inset-0 h-full w-full"
        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
