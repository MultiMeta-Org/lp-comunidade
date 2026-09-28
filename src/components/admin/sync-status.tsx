import { AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react"

export type SyncRun = {
  ran_at: string
  ok: boolean
  vendas_lidas: number
  acessos_alterados: number
  alunas_criadas: number
  produtos_desconhecidos: { id: string; nome: string }[]
  erro: string | null
}

/** "há 2 horas", "há 3 dias" — quanto tempo desde a última rodada. */
function desde(iso: string, now: Date): string {
  const min = Math.floor((now.getTime() - new Date(iso).getTime()) / 60000)
  if (min < 1) return "agora há pouco"
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  return `há ${Math.floor(h / 24)} dias`
}

/**
 * Estado do sync com a Hotmart, no /admin.
 *
 * O sync roda de 6 em 6 horas e é o que garante que uma compra não se perca.
 * Só que sync quebrado não avisa: fica quieto, e o silêncio parece bom sinal.
 * Este bloco existe para transformar o silêncio em vermelho — e é por isso que
 * "atrasado" (mais de 12h sem rodar) conta como problema, mesmo que a última
 * rodada tenha dado certo.
 */
export function SyncStatus({
  run,
  // `now` por parâmetro, como no HomeBoard: relógio lido no default mantém o
  // corpo do componente puro.
  now = new Date(),
}: {
  run: SyncRun | null
  now?: Date
}) {
  if (!run) {
    return (
      <Moldura tom="alerta">
        <AlertTriangle className="h-4 w-4 flex-none" />
        <span>
          O sync com a Hotmart <b>nunca rodou</b>. Compras feitas lá podem não ter
          virado acesso aqui.
        </span>
      </Moldura>
    )
  }

  const horas = (now.getTime() - new Date(run.ran_at).getTime()) / 3_600_000
  const atrasado = horas > 12
  const problema = !run.ok || atrasado || run.produtos_desconhecidos.length > 0

  return (
    <Moldura tom={problema ? "alerta" : "ok"}>
      {problema ? (
        <AlertTriangle className="h-4 w-4 flex-none" />
      ) : (
        <CheckCircle2 className="h-4 w-4 flex-none" />
      )}
      <div className="min-w-0 space-y-1">
        <p>
          {run.ok ? "Última sincronização com a Hotmart" : "A última sincronização FALHOU"}{" "}
          <b>{desde(run.ran_at, now)}</b> · {run.vendas_lidas} venda(s) lida(s) ·{" "}
          {run.acessos_alterados} acesso(s) alterado(s)
          {run.alunas_criadas > 0 && ` · ${run.alunas_criadas} aluna(s) criada(s)`}
        </p>

        {atrasado && run.ok && (
          <p className="text-xs">
            Passou de 12 horas sem rodar — o normal é de 6 em 6. Vale conferir o cron.
          </p>
        )}

        {run.erro && <p className="break-words font-mono text-xs">{run.erro}</p>}

        {run.produtos_desconhecidos.length > 0 && (
          <p className="text-xs">
            Produto com cara de Comunidade VIP <b>sem cadastro</b>:{" "}
            {run.produtos_desconhecidos.map((p) => `${p.nome} (${p.id})`).join(", ")}. As
            compras dele não viram acesso enquanto não for cadastrado.
          </p>
        )}
      </div>
      <RefreshCw className="ml-auto hidden h-3.5 w-3.5 flex-none opacity-40 sm:block" />
    </Moldura>
  )
}

function Moldura({
  tom,
  children,
}: {
  tom: "ok" | "alerta"
  children: React.ReactNode
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm ${
        tom === "ok"
          ? "border-border bg-card text-muted-foreground"
          : "border-destructive/40 bg-destructive/5 text-foreground"
      }`}
    >
      {children}
    </div>
  )
}
