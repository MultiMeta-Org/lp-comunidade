"use client"

import { useOptimistic, useState, useTransition } from "react"
import { Check, Circle, Loader2 } from "lucide-react"
import { toggleLessonCompleted } from "@/app/aulas/actions"

/**
 * "Concluí esta aula" — a aluna declara que terminou.
 *
 * Declaração, não medição: o servidor já registrou que ela abriu a página da
 * aula (markLessonViewed, em /dia/[id]), e esse dado vale sozinho. O botão é para
 * ela marcar o próprio avanço — e por isso desmarcar é tão válido quanto
 * marcar, sem confirmação nem alarde.
 *
 * `useOptimistic` troca o estado na hora: um check que demora dois segundos
 * para aparecer faz a aluna clicar de novo, e o segundo clique desmarcaria.
 */
export function LessonComplete({
  lessonId,
  done,
}: {
  lessonId: string
  done: boolean
}) {
  const [otimista, setOtimista] = useOptimistic(done)
  const [erro, setErro] = useState("")
  const [pending, startTransition] = useTransition()

  const toggle = () => {
    const next = !otimista
    startTransition(async () => {
      setOtimista(next)
      const res = await toggleLessonCompleted(lessonId, next)
      // Falhou: o otimista já voltou sozinho ao fim da transição (o `done` do
      // servidor não mudou). O que faltava era dizer isso — marca que não
      // grava e volta sem aviso é pior que botão que não responde.
      setErro(res.ok ? "" : res.error || "Não deu para salvar agora.")
    })
  }

  return (
    <span className="inline-flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={otimista}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-all disabled:opacity-70 ${
          otimista
            ? "border-primary bg-primary-subtle text-primary"
            : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
        }`}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : otimista ? (
          <Check className="h-4 w-4" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
        {otimista ? "Aula concluída" : "Marcar como concluída"}
      </button>

      {erro && <span className="text-xs text-destructive">{erro}</span>}
    </span>
  )
}
