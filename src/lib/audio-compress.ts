/**
 * Compressão de áudio no NAVEGADOR com ffmpeg.wasm.
 *
 * Áudios de aula são fala (não música), então reencodamos para MP3 mono 48 kbps
 * — inteligível e bem menor, pra caber no cap de 50 MB do bucket. A compressão
 * roda antes do upload direto pro Storage (ver MediaField em lessons-manager),
 * então o servidor Next nunca vê o arquivo (mantém a arquitetura de signed URL).
 *
 * Usa o core SINGLE-THREADED (`@ffmpeg/core`, não o `-mt`): não precisa de
 * SharedArrayBuffer nem dos headers COOP/COEP de cross-origin isolation — que
 * quebrariam o Supabase client e recursos externos. É mais lento, mas o admin é
 * uso pontual.
 */
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"

// Core single-threaded, mesma minor do @ffmpeg/ffmpeg instalado.
const CORE_VERSION = "0.12.10"
const CORE_BASE = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`

let ffmpegPromise: Promise<FFmpeg> | null = null

/** Carrega (uma única vez) a instância do ffmpeg.wasm com o core via CDN. */
function getFFmpeg(): Promise<FFmpeg> {
  if (!ffmpegPromise) {
    ffmpegPromise = (async () => {
      const ffmpeg = new FFmpeg()
      await ffmpeg.load({
        coreURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${CORE_BASE}/ffmpeg-core.wasm`, "application/wasm"),
      })
      return ffmpeg
    })().catch((err) => {
      // Não deixa uma falha de carregamento envenenar o singleton pra sempre.
      ffmpegPromise = null
      throw err
    })
  }
  return ffmpegPromise
}

/** Troca a extensão do nome original por `.mp3` (fallback: "audio.mp3"). */
function toMp3Name(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, "").trim()
  return `${base || "audio"}.mp3`
}

/**
 * Reencoda um arquivo de áudio para MP3 mono 48 kbps.
 * @param onProgress recebe 0..1 conforme o ffmpeg avança.
 * @returns um novo File `.mp3` (audio/mpeg).
 */
export async function compressAudioToMp3(
  file: File,
  onProgress?: (ratio: number) => void
): Promise<File> {
  const ffmpeg = await getFFmpeg()

  const handleProgress = ({ progress }: { progress: number }) => {
    // ffmpeg às vezes reporta valores fora de [0,1]; clampamos pra UI.
    onProgress?.(Math.min(1, Math.max(0, progress)))
  }
  ffmpeg.on("progress", handleProgress)

  // Preserva a extensão original no nome de entrada pro ffmpeg detectar o formato.
  const inExt = (file.name.split(".").pop() || "dat").replace(/[^a-z0-9]/gi, "").toLowerCase()
  const inName = `input.${inExt || "dat"}`
  const outName = "output.mp3"

  try {
    await ffmpeg.writeFile(inName, await fetchFile(file))
    await ffmpeg.exec([
      "-i", inName,
      "-vn", // descarta capa/vídeo embutido
      "-ac", "1", // mono
      "-ar", "44100",
      "-c:a", "libmp3lame",
      "-b:a", "48k",
      "-f", "mp3",
      outName,
    ])
    const data = (await ffmpeg.readFile(outName)) as Uint8Array
    // Cópia num ArrayBuffer "normal" — o buffer do ffmpeg pode ser SharedArrayBuffer,
    // que não é aceito como BlobPart pelo File().
    const bytes = new Uint8Array(data.length)
    bytes.set(data)
    return new File([bytes], toMp3Name(file.name), { type: "audio/mpeg" })
  } finally {
    ffmpeg.off("progress", handleProgress)
    // Limpa o FS virtual pra não acumular entre uploads (best-effort).
    await ffmpeg.deleteFile(inName).catch(() => {})
    await ffmpeg.deleteFile(outName).catch(() => {})
  }
}
