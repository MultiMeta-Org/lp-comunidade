"use client"

/**
 * Estado global dos trabalhos de vídeo do admin: comprimir (quando preciso) e
 * enviar.
 *
 * Vive no layout do /admin (fora do modal de aula) de propósito: as duas fases
 * demoram, e fechar o formulário — ou navegar dentro do admin — não pode
 * interromper nada. O painel flutuante mostra o progresso o tempo todo, e ao
 * terminar a referência é gravada na aula pelo servidor (`attachLessonMedia`),
 * sem depender de o formulário estar aberto.
 *
 * O que ainda para o trabalho: recarregar/fechar a aba (o navegador mata o JS).
 * Nesse caso o `beforeunload` avisa. Um ENVIO interrompido retoma ao reescolher
 * o mesmo arquivo (ver `src/lib/video-upload.ts`); uma COMPRESSÃO interrompida
 * recomeça do zero — não dá para retomar um encode pela metade.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Loader2, X, CheckCircle2, AlertCircle, RotateCw, Wand2 } from "lucide-react"
import { attachLessonMedia, createLessonUploadTicket } from "@/app/admin/lessons/actions"
import { uploadVideoResumable, type ResumableUpload } from "@/lib/video-upload"
import { compressVideo, planCompression, probeVideo } from "@/lib/video-compress"

const STORAGE_PREFIX = "storage://"

/**
 * Teto de tamanho aceito pelo Storage.
 *
 * Tem que espelhar o menor entre: o limite do bucket `videos` (migration 0006)
 * e o limite GLOBAL do projeto (Storage → Settings → "Upload file size limit"),
 * que tem precedência. Hoje o global é 500 MB.
 *
 * Vídeo maior que isto não é recusado: é reencodado no navegador para caber
 * (ver `src/lib/video-compress.ts`). O limite duro é a DURAÇÃO, não o tamanho —
 * acima de MAX_VIDEO_SECONDS o bitrate que sobra não entrega mais um vídeo
 * assistível, e o caminho passa a ser o link do Drive/YouTube.
 */
export const MAX_VIDEO_BYTES = 500 * 1024 * 1024

/**
 * 2 horas. Nesse teto o orçamento de bits cai para ~490 kbps em 480p — o piso
 * do assistível. Acima disso comprimir deixaria de ser "só pra caber" e viraria
 * destruir o vídeo, então o caminho passa a ser o link do Drive/YouTube.
 */
export const MAX_VIDEO_SECONDS = 2 * 60 * 60

export type VideoUpload = {
  /** Um trabalho por aula: reenviar substitui o anterior. */
  lessonId: string
  lessonLabel: string
  fileName: string
  /** "compressing" antecede "uploading" quando o arquivo não cabe. */
  status: "probing" | "compressing" | "uploading" | "error" | "done"
  /** 0..100 da fase atual. */
  pct: number
  sent: number
  total: number
  /** Resumo do reencode, para a UI explicar o que está acontecendo. */
  plan?: { fromHeight: number; toHeight: number; kbps: number }
  /** `storage://videos/...` quando concluído. */
  ref?: string
  /** Já gravado na aula pelo servidor (falso enquanto a aula não existir). */
  attached: boolean
  error?: string
}

type UploadsContextValue = {
  uploads: VideoUpload[]
  startVideoUpload: (args: {
    lessonId: string
    lessonLabel: string
    file: File
  }) => Promise<void>
  retryVideoUpload: (lessonId: string) => Promise<void>
  cancelVideoUpload: (lessonId: string) => void
  dismissUpload: (lessonId: string) => void
  uploadFor: (lessonId: string) => VideoUpload | undefined
}

const UploadsContext = createContext<UploadsContextValue | null>(null)

export function useUploads(): UploadsContextValue {
  const ctx = useContext(UploadsContext)
  if (!ctx) throw new Error("useUploads precisa estar dentro de <UploadsProvider>")
  return ctx
}

export function UploadsProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<VideoUpload[]>([])
  /** Handle do tus, para cancelar/abortar o envio em curso. */
  const handles = useRef(new Map<string, ResumableUpload>())
  /** Arquivo ORIGINAL escolhido pelo admin — refazer o trabalho inteiro. */
  const originals = useRef(new Map<string, File>())
  /**
   * Arquivo pronto para subir (o comprimido, ou o próprio original quando já
   * cabia). Guardado para que um erro DE ENVIO não recomece a compressão — e
   * porque reusar o mesmo objeto File mantém o fingerprint do tus, que é o que
   * permite retomar de onde parou.
   */
  const ready = useRef(new Map<string, File>())
  /** Cancela a compressão em curso (derruba o worker do ffmpeg). */
  const aborters = useRef(new Map<string, AbortController>())

  const patch = useCallback((lessonId: string, changes: Partial<VideoUpload>) => {
    setUploads((list) =>
      list.map((u) => (u.lessonId === lessonId ? { ...u, ...changes } : u))
    )
  }, [])

  /** Fase 2: envio resumável do arquivo já pronto. */
  const runUpload = useCallback(
    async (lessonId: string, file: File, fresh: boolean) => {
      ready.current.set(lessonId, file)
      patch(lessonId, {
        status: "uploading",
        pct: 0,
        sent: 0,
        total: file.size,
        fileName: file.name,
        error: undefined,
      })

      const ticket = await createLessonUploadTicket("video", lessonId, file.name)
      if (!ticket.ok) {
        patch(lessonId, { status: "error", error: ticket.error })
        return
      }

      // O tus dispara progresso a cada evento do XHR; re-renderizar o admin
      // inteiro nessa frequência trava o formulário. Um repinte por ponto
      // percentual é suficiente para a barra.
      let lastPct = -1

      try {
        const handle = await uploadVideoResumable({
          bucket: ticket.bucket,
          objectName: ticket.path,
          file,
          fresh,
          onProgress: (sent, total) => {
            const pct = total > 0 ? Math.floor((sent / total) * 100) : 0
            if (pct === lastPct) return
            lastPct = pct
            patch(lessonId, { sent, total, pct })
          },
          onError: (error) => patch(lessonId, { status: "error", error }),
          onSuccess: async ({ bucket, objectName }) => {
            const ref = `${STORAGE_PREFIX}${bucket}/${objectName}`
            patch(lessonId, { status: "done", pct: 100, sent: file.size, ref })
            const res = await attachLessonMedia(lessonId, "video", ref)
            if (!res.ok) patch(lessonId, { status: "error", error: res.error })
            else patch(lessonId, { attached: res.attached })
          },
        })
        handles.current.set(lessonId, handle)
      } catch (e) {
        patch(lessonId, {
          status: "error",
          error: e instanceof Error ? e.message : "Falha ao iniciar o upload.",
        })
      }
    },
    [patch]
  )

  /** Fase 1: mede o vídeo e, se não couber no Storage, reencoda para caber. */
  const runJob = useCallback(
    async ({
      lessonId,
      lessonLabel,
      file: original,
    }: {
      lessonId: string
      lessonLabel: string
      file: File
    }) => {
      originals.current.set(lessonId, original)
      ready.current.delete(lessonId)

      setUploads((list) => {
        const entry: VideoUpload = {
          lessonId,
          lessonLabel,
          fileName: original.name,
          status: "probing",
          pct: 0,
          sent: 0,
          total: original.size,
          attached: false,
        }
        const i = list.findIndex((u) => u.lessonId === lessonId)
        if (i === -1) return [...list, entry]
        return list.map((u, j) => (j === i ? entry : u))
      })

      // Já cabe: sobe como está. É o caminho comum, e reencodar à toa só
      // custaria tempo e qualidade.
      if (original.size <= MAX_VIDEO_BYTES) {
        await runUpload(lessonId, original, false)
        return
      }

      let compressed: File
      try {
        const info = await probeVideo(original)
        if (info.duration > MAX_VIDEO_SECONDS) {
          const minutes = Math.round(info.duration / 60)
          patch(lessonId, {
            status: "error",
            error: `Vídeo de ${minutes} min — acima do limite de 2 h para comprimir. Suba no Drive e cole o link.`,
          })
          return
        }

        const plan = planCompression(original, info, MAX_VIDEO_BYTES)
        if (!plan) {
          await runUpload(lessonId, original, false)
          return
        }

        patch(lessonId, {
          status: "compressing",
          pct: 0,
          plan: { fromHeight: plan.sourceHeight, toHeight: plan.height, kbps: plan.videoKbps },
        })

        const controller = new AbortController()
        aborters.current.set(lessonId, controller)

        let lastPct = -1
        compressed = await compressVideo(original, plan, {
          signal: controller.signal,
          onProgress: (ratio) => {
            const pct = Math.floor(ratio * 100)
            if (pct === lastPct) return
            lastPct = pct
            patch(lessonId, { pct })
          },
        })
      } catch (e) {
        patch(lessonId, {
          status: "error",
          error: e instanceof Error ? e.message : "Falha ao comprimir o vídeo.",
        })
        return
      } finally {
        aborters.current.delete(lessonId)
      }

      // O controle de bitrate mira uma média; se ainda assim estourou, insistir
      // seria chute — melhor mandar o admin pro caminho que funciona.
      if (compressed.size > MAX_VIDEO_BYTES) {
        patch(lessonId, {
          status: "error",
          error: "Mesmo comprimido o vídeo passou de 500 MB. Suba no Drive e cole o link.",
        })
        return
      }

      await runUpload(lessonId, compressed, false)
    },
    [patch, runUpload]
  )

  const startVideoUpload = useCallback(
    async (args: { lessonId: string; lessonLabel: string; file: File }) => {
      // Trocar o vídeo no meio do caminho: derruba o trabalho anterior (e o
      // parcial no servidor). Só o que ainda está em curso — abortar um envio
      // já concluído pediria a exclusão de um upload que não existe mais.
      const current = uploads.find((u) => u.lessonId === args.lessonId)
      if (current?.status === "uploading") {
        await handles.current.get(args.lessonId)?.abort(true).catch(() => {})
      }
      aborters.current.get(args.lessonId)?.abort()
      handles.current.delete(args.lessonId)
      await runJob(args)
    },
    [runJob, uploads]
  )

  /**
   * Tenta de novo depois de um erro, sempre do ponto mais adiantado possível:
   *   • já subiu e só falhou gravar na aula → refaz só a gravação;
   *   • já comprimiu → reenvia o comprimido, e o tus retoma do último byte
   *     confirmado (nada de reencodar uma hora por causa de queda de rede);
   *   • nada pronto → refaz o trabalho inteiro.
   */
  const retryVideoUpload = useCallback(
    async (lessonId: string) => {
      const entry = uploads.find((u) => u.lessonId === lessonId)
      if (!entry) return

      if (entry.ref) {
        patch(lessonId, { status: "done", error: undefined })
        const res = await attachLessonMedia(lessonId, "video", entry.ref)
        if (!res.ok) patch(lessonId, { status: "error", error: res.error })
        else patch(lessonId, { attached: res.attached })
        return
      }

      const prepared = ready.current.get(lessonId)
      if (prepared) {
        await runUpload(lessonId, prepared, false)
        return
      }

      const original = originals.current.get(lessonId)
      if (!original) return
      await runJob({ lessonId, lessonLabel: entry.lessonLabel, file: original })
    },
    [patch, runJob, runUpload, uploads]
  )

  const forget = useCallback((lessonId: string) => {
    handles.current.delete(lessonId)
    aborters.current.delete(lessonId)
    originals.current.delete(lessonId)
    ready.current.delete(lessonId)
    setUploads((list) => list.filter((u) => u.lessonId !== lessonId))
  }, [])

  const cancelVideoUpload = useCallback(
    (lessonId: string) => {
      // `true` = apaga o parcial no servidor, não só para de enviar.
      void handles.current.get(lessonId)?.abort(true).catch(() => {})
      // Derruba o ffmpeg se o cancelamento pegou a fase de compressão.
      aborters.current.get(lessonId)?.abort()
      forget(lessonId)
    },
    [forget]
  )

  const dismissUpload = forget

  const uploadFor = useCallback(
    (lessonId: string) => uploads.find((u) => u.lessonId === lessonId),
    [uploads]
  )

  // Fechar/recarregar a aba mata o trabalho em andamento — avisa antes. Vale
  // ainda mais para a compressão, que (diferente do envio) não tem como retomar.
  const busy = uploads.some(
    (u) => u.status === "uploading" || u.status === "compressing" || u.status === "probing"
  )
  useEffect(() => {
    if (!busy) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [busy])

  const value = useMemo(
    () => ({
      uploads,
      startVideoUpload,
      retryVideoUpload,
      cancelVideoUpload,
      dismissUpload,
      uploadFor,
    }),
    [uploads, startVideoUpload, retryVideoUpload, cancelVideoUpload, dismissUpload, uploadFor]
  )

  return (
    <UploadsContext.Provider value={value}>
      {children}
      <UploadsPanel />
    </UploadsContext.Provider>
  )
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`
  return `${Math.round(bytes / 1024 ** 2)} MB`
}

/** Está ocupado (mostra barra e bloqueia o "fechar" simples)? */
function isBusy(status: VideoUpload["status"]): boolean {
  return status === "probing" || status === "compressing" || status === "uploading"
}

/**
 * Painel fixo com os trabalhos em andamento. Fica acima do modal (z-60) para
 * continuar visível enquanto o admin edita — ou depois de fechar o formulário.
 */
function UploadsPanel() {
  const { uploads, retryVideoUpload, cancelVideoUpload, dismissUpload } = useUploads()
  if (uploads.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-[60] w-[min(22rem,calc(100vw-2rem))] space-y-2">
      {uploads.map((u) => {
        const busy = isBusy(u.status)
        return (
          <div
            key={u.lessonId}
            className="rounded-xl border border-border bg-card p-3 shadow-lg"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">
                  {u.fileName}
                </p>
                <p className="text-[11px] text-muted-foreground">{u.lessonLabel}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  busy ? cancelVideoUpload(u.lessonId) : dismissUpload(u.lessonId)
                }
                aria-label={busy ? "Cancelar" : "Fechar"}
                className="cursor-pointer text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {u.status !== "error" && (
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-300"
                  style={{ width: `${u.status === "done" ? 100 : u.pct}%` }}
                />
              </div>
            )}

            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              {u.status === "probing" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Analisando o vídeo…
                </>
              )}
              {u.status === "compressing" && (
                <>
                  <Wand2 className="h-3.5 w-3.5 text-primary" />
                  Comprimindo… {u.pct}%
                </>
              )}
              {u.status === "uploading" && (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Enviando… {u.pct}% ({formatBytes(u.sent)} de {formatBytes(u.total)})
                </>
              )}
              {u.status === "done" && (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {u.attached
                    ? "Vídeo enviado e salvo na aula."
                    : "Vídeo enviado — salve a aula para vincular."}
                </>
              )}
              {u.status === "error" && (
                <>
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-destructive" />
                  <span className="text-destructive">{u.error}</span>
                </>
              )}
            </div>

            {u.status === "compressing" && u.plan && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                {u.plan.toHeight < u.plan.fromHeight
                  ? `${u.plan.fromHeight}p → ${u.plan.toHeight}p a ${u.plan.kbps} kbps`
                  : `${u.plan.toHeight}p a ${u.plan.kbps} kbps`}
                {" · pode levar bem mais que a duração do vídeo — pode deixar em segundo plano."}
              </p>
            )}

            {u.status === "error" && (
              <button
                type="button"
                onClick={() => void retryVideoUpload(u.lessonId)}
                className="mt-2 flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline"
              >
                <RotateCw className="h-3.5 w-3.5" />
                {u.ref ? "Tentar vincular de novo" : "Tentar de novo"}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
