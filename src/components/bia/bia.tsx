"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react"
import { createPortal } from "react-dom"
import { usePathname } from "next/navigation"
import { ArrowUp, Sparkles, X } from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { Markdown } from "./markdown"

/**
 * A B.IA dentro do portal: um botão flutuante que abre um drawer de chat.
 *
 * Quem responde é o servidor da BIA (repo `multimeta-bia`), não o portal. O
 * portal só manda o access token da sessão — a identidade da aluna sai dele lá
 * do outro lado, nunca de um campo que o navegador escolhe. Acesso por produto,
 * "um dia por vez" do Desafio e o material ficam todos no servidor da BIA.
 *
 * Sem NEXT_PUBLIC_BIA_URL o componente não renderiza nada: dá para fazer deploy
 * do portal antes de a BIA estar no ar sem botão que leva a erro.
 */

const BIA_URL = process.env.NEXT_PUBLIC_BIA_URL?.replace(/\/$/, "") ?? ""

/** Onde o botão flutuante não aparece: sem sessão de aluna ou área da equipe. */
const ROTAS_SEM_BIA = ["/login", "/admin"]

const SUGESTOES = [
  "Qual é a minha missão de hoje?",
  "Como faço follow-up sem parecer chata?",
  "O que pergunto no onboarding com o empresário?",
]

type Mensagem = { id: string; papel: "aluna" | "bia"; texto: string; erro?: boolean }

const assinaNada = () => () => {}

export function BiaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/"
  const noCliente = useSyncExternalStore(assinaNada, () => true, () => false)
  const [temSessao, setTemSessao] = useState(false)
  const [aberto, setAberto] = useState(false)

  useEffect(() => {
    if (!BIA_URL) return
    supabase.auth.getSession().then(({ data }) => setTemSessao(Boolean(data.session)))
    const { data } = supabase.auth.onAuthStateChange((_e, sessao) => {
      setTemSessao(Boolean(sessao))
      if (!sessao) setAberto(false)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const rotaPermitida = !ROTAS_SEM_BIA.some((r) => pathname.startsWith(r))
  const disponivel = Boolean(BIA_URL) && temSessao && rotaPermitida

  const fechar = useCallback(() => setAberto(false), [])

  return (
    <>
      {children}
      {noCliente &&
        disponivel &&
        createPortal(
          <>
            {!aberto && <BotaoFlutuante onClick={() => setAberto(true)} />}
            <Drawer aberto={aberto} onFechar={fechar} />
          </>,
          document.body
        )}
    </>
  )
}

function BotaoFlutuante({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Conversar com a B.IA"
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
      <span className="font-display text-sm font-bold tracking-tight">B.IA</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────────

async function chamarBia(metodo: "GET" | "POST", corpo?: { texto: string }) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error("Sua sessão expirou. Entre de novo no portal.")

  const r = await fetch(`${BIA_URL}/web/mensagens`, {
    method: metodo,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  const json = await r.json().catch(() => ({}))
  if (!r.ok) {
    if (r.status === 401) throw new Error("Sua sessão expirou. Entre de novo no portal.")
    if (r.status === 409) throw new Error("Ainda estou respondendo a anterior — um instante.")
    throw new Error(json.erro ?? "Não consegui falar com a B.IA agora. Tenta de novo daqui a pouco?")
  }
  return json
}

function Drawer({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [carregou, setCarregou] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [texto, setTexto] = useState("")
  const fimRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLTextAreaElement>(null)
  const drawerRef = useRef<HTMLElement>(null)

  // Histórico: só na primeira abertura, e só o DELA (o servidor filtra pela sessão).
  useEffect(() => {
    if (!aberto || carregou) return
    setCarregou(true)
    chamarBia("GET")
      .then((j: { mensagens: { id: string; papel: "aluna" | "bia"; texto: string }[] }) =>
        setMensagens((atuais) => [...j.mensagens, ...atuais])
      )
      .catch(() => {}) // Sem histórico ainda dá para conversar; o erro aparece se ela perguntar.
  }, [aberto, carregou])

  useEffect(() => {
    if (!aberto) return
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onFechar()
    // Clique fora fecha. Escuta o pointerdown no documento em vez de pôr um
    // fundo invisível por cima da página: o clique segue valendo para o que
    // ela clicou (um link da missão, um botão).
    const onFora = (e: PointerEvent) => {
      const alvo = e.target as Node | null
      if (alvo && !drawerRef.current?.contains(alvo)) onFechar()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onFora)
    const t = setTimeout(() => campoRef.current?.focus(), 250)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onFora)
      clearTimeout(t)
    }
  }, [aberto, onFechar])

  useEffect(() => {
    fimRef.current?.scrollIntoView({ block: "end", behavior: "smooth" })
  }, [mensagens, enviando, aberto])

  const perguntar = useCallback(
    async (pergunta: string) => {
      const limpa = pergunta.trim()
      if (!limpa || enviando) return
      setTexto("")
      setEnviando(true)
      setMensagens((m) => [...m, { id: `a-${Date.now()}`, papel: "aluna", texto: limpa }])
      try {
        const { texto: resposta } = await chamarBia("POST", { texto: limpa })
        setMensagens((m) => [...m, { id: `b-${Date.now()}`, papel: "bia", texto: resposta }])
      } catch (e) {
        setMensagens((m) => [
          ...m,
          { id: `e-${Date.now()}`, papel: "bia", texto: (e as Error).message, erro: true },
        ])
        setTexto(limpa) // Não perder o que ela escreveu.
      } finally {
        setEnviando(false)
        campoRef.current?.focus()
      }
    },
    [enviando]
  )

  return (
    <>
      {/* No celular o fundo escurece (o drawer cobre quase tudo); o toque
          fora é tratado pelo pointerdown do documento, como no desktop. */}
      <div
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 sm:hidden",
          aberto ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-label="Conversa com a B.IA"
        aria-hidden={!aberto}
        inert={!aberto}
        className={cn(
          "fixed z-50 flex flex-col border-border bg-card shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.22,0.85,0.3,1)]",
          "inset-x-0 bottom-0 h-[86dvh] rounded-t-2xl border-t",
          "sm:inset-x-auto sm:bottom-0 sm:right-0 sm:top-0 sm:h-dvh sm:w-[420px] sm:rounded-none sm:border-l sm:border-t-0",
          aberto ? "translate-y-0 sm:translate-x-0" : "translate-y-full sm:translate-x-full sm:translate-y-0"
        )}
      >
        <header className="flex flex-none items-center gap-3 border-b border-border px-4 py-3">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Sparkles className="h-4.5 w-4.5" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block font-display text-sm font-bold tracking-tight text-foreground">B.IA</b>
            <small className="block text-[11.5px] text-muted-foreground">
              Sua assistente do Desafio e do Método
            </small>
          </span>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar conversa"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {mensagens.length === 0 && !enviando ? (
            <BoasVindas onEscolher={perguntar} />
          ) : (
            <ol className="flex flex-col gap-3">
              {mensagens.map((m) => (
                <Bolha key={m.id} mensagem={m} />
              ))}
              {enviando && <Digitando />}
            </ol>
          )}
          <div ref={fimRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            perguntar(texto)
          }}
          className="flex-none border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          <div className="flex items-end gap-2 rounded-2xl border border-input bg-background px-3 py-2 transition-colors focus-within:border-primary/60">
            <textarea
              ref={campoRef}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault()
                  perguntar(texto)
                }
              }}
              rows={1}
              maxLength={2000}
              placeholder="Pergunte para a B.IA…"
              aria-label="Sua pergunta"
              className="field-sizing-content max-h-32 min-h-6 flex-1 resize-none bg-transparent py-1 text-[16px] leading-6 text-foreground outline-none placeholder:text-muted-foreground sm:text-sm"
            />
            <button
              type="submit"
              disabled={!texto.trim() || enviando}
              aria-label="Enviar"
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-1.5 px-1 text-[10.5px] text-muted-foreground">
            A B.IA responde com o material da Nati e pode errar. Não compartilhe senhas nem dados de clientes.
          </p>
        </form>
      </aside>
    </>
  )
}

function BoasVindas({ onEscolher }: { onEscolher: (pergunta: string) => void }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="rounded-2xl rounded-tl-md bg-muted/70 px-4 py-3 text-sm leading-relaxed text-foreground">
        Oi! Eu sou a <b>B.IA</b>. Posso te ajudar com a missão do dia, os scripts, o Radar e as aulas do Método. O que
        você quer destravar hoje?
      </div>
      <div className="flex flex-col items-start gap-2">
        {SUGESTOES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onEscolher(s)}
            className="cursor-pointer rounded-full border border-border bg-background px-3.5 py-1.5 text-left text-[13px] text-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  )
}

function Bolha({ mensagem }: { mensagem: Mensagem }) {
  if (mensagem.papel === "aluna") {
    return (
      <li className="max-w-[85%] self-end whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-sm leading-relaxed text-primary-foreground">
        {mensagem.texto}
      </li>
    )
  }
  return (
    <li
      className={cn(
        "max-w-[92%] self-start break-words rounded-2xl rounded-tl-md px-3.5 py-2.5 text-sm leading-relaxed",
        mensagem.erro ? "border border-destructive/30 bg-destructive/5 text-foreground" : "bg-muted/70 text-foreground"
      )}
    >
      <Markdown texto={mensagem.texto} />
    </li>
  )
}

function Digitando() {
  return (
    <li aria-label="A B.IA está escrevendo" className="flex gap-1 self-start rounded-2xl rounded-tl-md bg-muted/70 px-4 py-3.5">
      {[0, 150, 300].map((d) => (
        <span
          key={d}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${d}ms` }}
        />
      ))}
    </li>
  )
}
