/**
 * Upload de vídeo direto do navegador para o Storage via TUS (resumable).
 *
 * Por que não o `storage.from().upload()` normal: vídeo de aula tem centenas de
 * MB. Um PUT único não dá progresso confiável e, se a conexão cair no meio,
 * recomeça do zero. O Supabase recomenda TUS acima de ~6 MB — cada chunk de
 * 6 MB é confirmado pelo servidor, então uma queda retoma do último byte aceito
 * em vez de reiniciar.
 *
 * O tus-js-client guarda a URL do upload em localStorage (por "fingerprint" do
 * arquivo: nome+tamanho+data). Ao escolher o MESMO arquivo depois de um reload
 * ou de uma queda, `findPreviousUploads()` reencontra o envio e ele continua de
 * onde parou. (O navegador não persiste o File, então o admin precisa reescolher
 * o arquivo — mas os bytes já enviados não sobem de novo.)
 *
 * Autorização: vai o access token do próprio admin (sessão Supabase) em cada
 * request — o endpoint resumável não aceita signed upload URL. Quem pode gravar
 * no bucket `videos` é decidido pela RLS de storage.objects (ver migration 0006).
 * Renovamos o header a cada request porque um upload longo passa da validade do
 * JWT (o supabase-js já faz o refresh sozinho).
 */
import * as tus from "tus-js-client"
import { supabase } from "@/lib/supabase/client"

/** O endpoint resumável do Supabase exige chunks de exatamente 6 MB. */
const CHUNK_SIZE = 6 * 1024 * 1024

const RESUMABLE_ENDPOINT = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`

export type ResumableUpload = {
  /** Caminho final no bucket — pode diferir do pedido se retomou um envio anterior. */
  readonly objectName: string
  /** `terminate: true` também apaga o upload parcial no servidor. */
  abort: (terminate: boolean) => Promise<void>
}

export type ResumableUploadOptions = {
  bucket: string
  objectName: string
  file: File
  /** Ignora envios anteriores guardados e recomeça do zero. */
  fresh?: boolean
  onProgress: (sent: number, total: number) => void
  onSuccess: (result: { bucket: string; objectName: string }) => void
  onError: (message: string) => void
}

async function accessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  return data.session?.access_token ?? ""
}

/** Mensagem legível a partir de um erro do tus (que embute a resposta HTTP). */
function describeError(err: unknown): string {
  if (err instanceof tus.DetailedError && err.originalResponse) {
    const res = err.originalResponse
    const body = res.getBody?.() ?? ""
    return `Erro ${res.getStatus()}${body ? ` — ${body.slice(0, 200)}` : ""}`
  }
  return err instanceof Error ? err.message : "Falha no upload do vídeo."
}

/**
 * Inicia (ou retoma) o envio de um vídeo. Resolve assim que o upload começa —
 * o fim chega por `onSuccess`/`onError`.
 */
export async function uploadVideoResumable(
  opts: ResumableUploadOptions
): Promise<ResumableUpload> {
  if (!tus.isSupported) {
    throw new Error("Este navegador não suporta upload resumável.")
  }

  const { bucket, file } = opts
  // Pode mudar se retomarmos um envio anterior (o objeto já existe naquele caminho).
  let objectName = opts.objectName

  const upload = new tus.Upload(file, {
    endpoint: RESUMABLE_ENDPOINT,
    chunkSize: CHUNK_SIZE,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    uploadDataDuringCreation: true,
    removeFingerprintOnSuccess: true,
    headers: { "x-upsert": "true" },
    metadata: {
      bucketName: bucket,
      objectName,
      contentType: file.type || "video/mp4",
      cacheControl: "3600",
    },
    onBeforeRequest: async (req) => {
      req.setHeader("authorization", `Bearer ${await accessToken()}`)
    },
    onProgress: opts.onProgress,
    onError: (err) => opts.onError(describeError(err)),
    onSuccess: () => opts.onSuccess({ bucket, objectName }),
  })

  const previous = await upload.findPreviousUploads()

  if (opts.fresh) {
    // "Recomeçar": esquece as URLs guardadas para este arquivo (uma delas pode
    // ter expirado no servidor) e sobe tudo de novo.
    await Promise.all(
      previous.map((p) => tus.defaultOptions.urlStorage.removeUpload(p.urlStorageKey))
    )
  } else {
    const resumable = previous
      .filter((p) => p.metadata?.bucketName === bucket && p.metadata?.objectName)
      .sort((a, b) => b.creationTime.localeCompare(a.creationTime))[0]
    if (resumable) {
      // Alinha o metadata ao envio retomado: se a URL guardada já tiver expirado,
      // o tus recria o upload a partir do metadata — e ele precisa apontar para
      // o mesmo caminho que vamos gravar na aula.
      objectName = resumable.metadata.objectName
      upload.options.metadata = { ...upload.options.metadata, objectName }
      upload.resumeFromPreviousUpload(resumable)
    }
  }

  upload.start()

  return {
    get objectName() {
      return objectName
    },
    abort: (terminate) => upload.abort(terminate),
  }
}
