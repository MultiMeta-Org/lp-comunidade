/**
 * Compressão de vídeo no NAVEGADOR com ffmpeg.wasm, só o suficiente para caber
 * no limite de upload do Storage.
 *
 * A regra é "comprimir o mínimo necessário", não "comprimir ao máximo":
 *   • vídeo que já cabe passa direto, sem reencodar (o caso comum);
 *   • quando não cabe, o bitrate alvo é derivado da DURAÇÃO — o orçamento de
 *     bits é o tamanho máximo dividido pelo tempo. Uma aula de 20 min ganha
 *     ~3,2 Mbps em 1080p (reencode leve, quase imperceptível); uma de 2 h fica
 *     com ~490 kbps em 480p, que é onde a coisa aperta de verdade;
 *   • a resolução só cai quando o bitrate disponível não sustenta a original
 *     (ver RESOLUTION_LADDER). Reduzir resolução é perda de qualidade, então é
 *     último recurso, não padrão.
 *
 * Sobre o custo: reencodar vídeo em WebAssembly é LENTO — na prática de 1x a 3x
 * a duração do vídeo. Por isso isto roda dentro do UploadsProvider, com barra de
 * progresso própria e sem travar a tela: o admin deixa a aba aberta e continua
 * usando o painel. O ffmpeg.wasm já executa em Web Worker, então a UI não
 * congela — mas fechar a aba cancela.
 *
 * Memória: o arquivo de ENTRADA é montado via WORKERFS (leitura sob demanda a
 * partir do File), não copiado para a memória virtual. Sem isso, uma gravação de
 * 2 h com 3 GB estouraria o heap do wasm antes de começar. A saída (≤ 500 MB)
 * essa sim fica em memória.
 *
 * Usa o core single-threaded pelo mesmo motivo do áudio (ver audio-compress.ts):
 * o `-mt` exigiria SharedArrayBuffer e headers COOP/COEP, que quebrariam o
 * Supabase client e os recursos externos da página.
 */
import { FFmpeg } from "@ffmpeg/ffmpeg"
import type { FFFSType } from "@ffmpeg/ffmpeg"
import { toBlobURL } from "@ffmpeg/util"

/**
 * O pacote resolve para um stub vazio na condição "node" (só exporta FFmpeg),
 * então importar o enum FFFSType como VALOR quebra o bundle de SSR. Este módulo
 * só roda no navegador, então basta o tipo + a string que o enum carrega.
 */
const WORKERFS = "WORKERFS" as FFFSType

// Core single-threaded, mesma minor do @ffmpeg/ffmpeg instalado.
const CORE_VERSION = "0.12.10"
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`

/**
 * Áudio de aula é fala: 48 kbps mono basta (mesma escolha do audio-compress.ts).
 * Num vídeo de 2 h cada kbps de áudio é um kbps a menos de imagem, então não
 * vale gastar mais aqui.
 */
const AUDIO_KBPS = 48

/**
 * Margem de segurança sobre o teto. O controle de bitrate do x264 mira uma
 * MÉDIA e o arquivo final varia alguns por cento para cima; mirar em 93% do
 * limite evita gastar uma hora de encode e ainda assim estourar no upload.
 */
const SIZE_SAFETY = 0.93

/**
 * Bitrate mínimo (kbps) para cada altura valer a pena. Abaixo do piso a imagem
 * vira blocos, e entregar uma resolução menor bem codificada fica melhor.
 *
 * Onde cada duração cai, com o teto de 500 MB:
 *   até ~25 min → 1080p · ~35–60 min → 720p · ~1h15–2h → 480p (2 h = 493 kbps).
 */
const RESOLUTION_LADDER: { height: number; minKbps: number }[] = [
  { height: 1080, minKbps: 2500 },
  { height: 720, minKbps: 1000 },
  { height: 480, minKbps: 450 },
  { height: 360, minKbps: 0 },
]

export type VideoInfo = { duration: number; width: number; height: number }

export type CompressionPlan = {
  videoKbps: number
  /** Altura de saída; igual à original quando não há downscale. */
  height: number
  /** Altura original — para a UI dizer "1080p → 720p". */
  sourceHeight: number
  /** Estimativa do tamanho final, em bytes. */
  estimatedBytes: number
}

/**
 * Lê duração e dimensões sem tocar no ffmpeg — o elemento <video> do próprio
 * navegador resolve isso lendo só os metadados do arquivo.
 */
export function probeVideo(file: File): Promise<VideoInfo> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    video.preload = "metadata"

    const cleanup = () => URL.revokeObjectURL(url)

    video.onloadedmetadata = () => {
      const { duration, videoWidth, videoHeight } = video
      cleanup()
      if (!Number.isFinite(duration) || duration <= 0) {
        reject(new Error("Não foi possível ler a duração do vídeo."))
        return
      }
      resolve({ duration, width: videoWidth, height: videoHeight })
    }
    video.onerror = () => {
      cleanup()
      reject(new Error("Formato de vídeo não reconhecido pelo navegador."))
    }
    video.src = url
  })
}

/**
 * Decide se — e quanto — comprimir. `null` significa "já cabe, sobe como está".
 */
export function planCompression(
  file: File,
  info: VideoInfo,
  maxBytes: number
): CompressionPlan | null {
  if (file.size <= maxBytes) return null

  const budgetKbps = (maxBytes * SIZE_SAFETY * 8) / info.duration / 1000
  const videoKbps = Math.max(200, Math.floor(budgetKbps - AUDIO_KBPS))

  const sourceHeight = info.height || 720
  const rung =
    RESOLUTION_LADDER.find((r) => videoKbps >= r.minKbps) ??
    RESOLUTION_LADDER[RESOLUTION_LADDER.length - 1]
  // Nunca aumenta a resolução: só desce se a original for maior que o degrau.
  const height = Math.min(rung.height, sourceHeight)

  return {
    videoKbps,
    height,
    sourceHeight,
    estimatedBytes: Math.round((((videoKbps + AUDIO_KBPS) * 1000) / 8) * info.duration),
  }
}

/** Nome de saída `.mp4` a partir do original. */
function toMp4Name(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "").trim()
  return `${base || "video"}.mp4`
}

/**
 * Reencoda o vídeo para caber no plano dado.
 *
 * Instância própria de FFmpeg (não o singleton do áudio): terminá-la ao final
 * devolve de uma vez os centenas de MB que o encode segurou, e permite cancelar
 * um trabalho longo sem derrubar a compressão de áudio.
 *
 * @param onProgress recebe 0..1.
 */
export async function compressVideo(
  file: File,
  plan: CompressionPlan,
  opts: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {}
): Promise<File> {
  const { onProgress, signal } = opts
  if (signal?.aborted) throw new Error("Compressão cancelada.")

  const ffmpeg = new FFmpeg()
  // Cancelar um encode longo = derrubar o worker; o exec em curso rejeita.
  const onAbort = () => ffmpeg.terminate()
  signal?.addEventListener("abort", onAbort, { once: true })

  // Última linha de log do ffmpeg — vira mensagem de erro se o exec falhar.
  let lastLog = ""
  ffmpeg.on("log", ({ message }) => {
    if (message.trim()) lastLog = message
  })

  const handleProgress = ({ progress }: { progress: number }) => {
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  ffmpeg.on("progress", handleProgress)

  const mountPoint = "/mnt-in"
  const outName = "output.mp4"

  try {
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
    })

    // WORKERFS: o ffmpeg lê o File direto do disco do navegador, sob demanda.
    await ffmpeg.createDir(mountPoint)
    await ffmpeg.mount(WORKERFS, { files: [file] }, mountPoint)

    const maxrate = Math.round(plan.videoKbps * 1.45)
    const bufsize = plan.videoKbps * 2

    const code = await ffmpeg.exec([
      "-i", `${mountPoint}/${file.name}`,
      // scale=-2 mantém a proporção e garante largura par (exigência do yuv420p).
      // Sem downscale, o filtro é omitido para não reamostrar à toa.
      ...(plan.height < plan.sourceHeight ? ["-vf", `scale=-2:${plan.height}`] : []),
      "-c:v", "libx264",
      // veryfast é o ponto de equilíbrio no wasm: ultrafast encodaria mais rápido
      // mas gasta bits demais — e aqui o bitrate é justamente o recurso escasso.
      "-preset", "veryfast",
      "-profile:v", "high",
      "-pix_fmt", "yuv420p",
      "-b:v", `${plan.videoKbps}k`,
      "-maxrate", `${maxrate}k`,
      "-bufsize", `${bufsize}k`,
      "-c:a", "aac",
      "-b:a", `${AUDIO_KBPS}k`,
      "-ac", "1",
      // Move o índice do mp4 para o começo: sem isso o <video> precisa baixar o
      // arquivo inteiro antes de deixar a aluna avançar/voltar.
      "-movflags", "+faststart",
      "-f", "mp4",
      outName,
    ])
    if (signal?.aborted) throw new Error("Compressão cancelada.")
    if (code !== 0) {
      throw new Error(lastLog || `ffmpeg terminou com código ${code}.`)
    }

    const data = await ffmpeg.readFile(outName)
    if (typeof data === "string") throw new Error("Saída inesperada do ffmpeg.")

    // `data` já chega como cópia própria (veio por postMessage do worker) e o
    // core single-threaded não usa SharedArrayBuffer — dá para embrulhar direto,
    // sem duplicar centenas de MB.
    return new File([data as BlobPart], toMp4Name(file.name), { type: "video/mp4" })
  } finally {
    signal?.removeEventListener("abort", onAbort)
    ffmpeg.off("progress", handleProgress)
    // terminate() já descarta o worker inteiro (FS virtual incluído); as limpezas
    // são best-effort para o caso de o terminate falhar.
    await ffmpeg.unmount(mountPoint).catch(() => {})
    await ffmpeg.deleteFile(outName).catch(() => {})
    ffmpeg.terminate()
  }
}
