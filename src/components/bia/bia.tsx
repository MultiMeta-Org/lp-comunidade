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
import { ArrowUp, MessageCircle, Sparkles, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { AoNavegarNoPortal, Markdown } from "./markdown"

/**
 * A B.IA dentro do portal: um botão flutuante que abre um drawer de chat.
 *
 * Quem responde é o servidor da BIA (repo `multimeta-bia`), não o portal. O
 * portal só manda o access token da sessão — a identidade da aluna sai dele lá
 * do outro lado, nunca de um campo que o navegador escolhe. Acesso por produto,
 * "um dia por vez" do Desafio, o Radar dela e o material ficam todos no
 * servidor da BIA. A página aberta vai junto da pergunta só como contexto
 * ("o que eu faço aqui?").
 *
 * Sem NEXT_PUBLIC_BIA_URL o componente não renderiza nada: dá para fazer deploy
 * do portal antes de a BIA estar no ar sem botão que leva a erro.
 */

const BIA_URL = process.env.NEXT_PUBLIC_BIA_URL?.replace(/\/$/, "") ?? ""

/**
 * O client do Supabase só é carregado no navegador, quando a B.IA precisa da
 * sessão. O provider mora no layout raiz: importar o client no topo do módulo
 * o criaria até no prerender do build, que em preview não tem as variáveis do
 * Supabase — e derrubava o build inteiro.
 */
const supabaseDoNavegador = async () => (await import("@/lib/supabase/client")).supabase

/**
 * Onde o botão flutuante aparece: só no Desafio Empreendedora Anônima (jornada, dias, Radar,
 * Biblioteca). É ali que a aluna está executando e trava numa missão; no resto
 * do portal ela não aparece.
 */
const ROTAS_COM_BIA = ["/desafio"]

/** O que sugerir depende de onde ela está: no Radar, a dúvida é sobre as empresas dela. */
function sugestoesPara(pathname: string): string[] {
  if (/^\/desafio\/dia\/\d+/.test(pathname)) {
    return ["Me explica a missão deste dia", "Por onde eu começo aqui?", "Me dá um exemplo para este passo"]
  }
  if (pathname.startsWith("/desafio/radar")) {
    return [
      "Quais empresas eu ainda não abordei?",
      "Quem está esperando meu follow-up?",
      "Qual empresa eu priorizo agora?",
    ]
  }
  return [
    "Qual é a minha missão de hoje?",
    "Como estão as empresas do meu Radar?",
    "Como faço follow-up sem parecer chata?",
  ]
}

/** No celular o drawer cobre a página: tocar num botão do portal recolhe a conversa. */
const ehCelular = () => window.matchMedia("(max-width: 639px)").matches

type Mensagem = { id: string; papel: "aluna" | "bia"; texto: string; erro?: boolean }

const assinaNada = () => () => {}

export function BiaProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/"
  const noCliente = useSyncExternalStore(assinaNada, () => true, () => false)
  const [temSessao, setTemSessao] = useState(false)
  const [aberto, setAberto] = useState(false)
  // Recolhida por um botão da conversa (no celular): o botão flutuante vira
  // "Voltar à conversa" e aparece em qualquer página até ela voltar.
  const [recolhida, setRecolhida] = useState(false)

  useEffect(() => {
    if (!BIA_URL) return
    let cancelar = () => {}
    supabaseDoNavegador().then((supabase) => {
      supabase.auth.getSession().then(({ data }) => setTemSessao(Boolean(data.session)))
      const { data } = supabase.auth.onAuthStateChange((_e, sessao) => {
        setTemSessao(Boolean(sessao))
        if (!sessao) {
          setAberto(false)
          setRecolhida(false)
        }
      })
      cancelar = () => data.subscription.unsubscribe()
    })
    return () => cancelar()
  }, [])

  const rotaPermitida = ROTAS_COM_BIA.some((r) => pathname.startsWith(r))
  // Aberta (ou recolhida), ela acompanha a aluna: um botão da conversa pode
  // levar para fora do Desafio (as aulas do Método) e a conversa não some no
  // meio. Fechou fora do Desafio, o botão flutuante não volta.
  const disponivel = Boolean(BIA_URL) && temSessao && (rotaPermitida || aberto || recolhida)

  const fechar = useCallback(() => {
    setAberto(false)
    setRecolhida(false)
  }, [])
  const recolher = useCallback(() => {
    setAberto(false)
    setRecolhida(true)
  }, [])

  return (
    <>
      {children}
      {noCliente &&
        disponivel &&
        createPortal(
          <>
            {!aberto && (
              <BotaoFlutuante
                voltar={recolhida}
                onClick={() => {
                  setAberto(true)
                  setRecolhida(false)
                }}
              />
            )}
            <Drawer aberto={aberto} pathname={pathname} onFechar={fechar} onRecolher={recolher} />
          </>,
          document.body
        )}
    </>
  )
}

function BotaoFlutuante({ onClick, voltar }: { onClick: () => void; voltar: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={voltar ? "Voltar à conversa com a B.IA" : "Conversar com a B.IA"}
      className="group fixed bottom-5 right-5 z-40 flex h-14 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-primary-foreground shadow-lg shadow-primary/25 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:bottom-6 sm:right-6"
    >
      {voltar ? (
        <MessageCircle className="h-5 w-5" />
      ) : (
        <Sparkles className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
      )}
      <span className="font-display text-sm font-bold tracking-tight">{voltar ? "Voltar à conversa" : "B.IA"}</span>
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// Conversa com o servidor
// ─────────────────────────────────────────────────────────────

const SESSAO_EXPIROU = "Sua sessão expirou. Entre de novo no portal."

async function requisitar(metodo: "GET" | "POST", corpo?: object) {
  const { data } = await (await supabaseDoNavegador()).auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error(SESSAO_EXPIROU)

  const r = await fetch(`${BIA_URL}/web/mensagens`, {
    method: metodo,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: metodo === "POST" ? "text/event-stream, application/json" : "application/json",
    },
    body: corpo ? JSON.stringify(corpo) : undefined,
  })
  if (!r.ok) {
    const json = await r.json().catch(() => ({}))
    if (r.status === 401) throw new Error(SESSAO_EXPIROU)
    if (r.status === 409) throw new Error("Ainda estou respondendo a anterior — um instante.")
    throw new Error(json.erro ?? "Não consegui falar com a B.IA agora. Tenta de novo daqui a pouco?")
  }
  return r
}

async function carregarHistorico(): Promise<Mensagem[]> {
  const j: { mensagens: Mensagem[] } = await (await requisitar("GET")).json()
  return j.mensagens.map(({ id, papel, texto }) => ({ id, papel, texto }))
}

/**
 * Manda a pergunta e devolve o texto final. Em SSE, `aoEscrever` recebe o
 * texto acumulado a cada pedaço; o `fim` traz o texto que vale (respostas
 * fixas, como o limite de mensagens, só chegam nele). Servidor que responde
 * JSON (versão anterior da BIA) também serve: vem tudo de uma vez.
 */
async function perguntarABia(
  corpo: { texto: string; pagina: string },
  aoEscrever: (acumulado: string) => void
): Promise<string> {
  const r = await requisitar("POST", corpo)
  if (!r.headers.get("content-type")?.includes("text/event-stream") || !r.body) {
    const json = await r.json()
    return json.texto
  }

  const leitor = r.body.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ""
  let acumulado = ""
  for (;;) {
    const { done, value } = await leitor.read()
    if (done) break
    buffer += value
    const eventos = buffer.split("\n\n")
    buffer = eventos.pop() ?? ""
    for (const bruto of eventos) {
      const evento = bruto.match(/^event: (.+)$/m)?.[1]
      const dado = bruto.match(/^data: (.*)$/m)?.[1]
      if (!evento || !dado) continue
      const json = JSON.parse(dado)
      if (evento === "pedaco") {
        acumulado += json.t
        aoEscrever(acumulado)
      } else if (evento === "fim") {
        return json.texto
      } else if (evento === "erro") {
        throw new Error(json.erro)
      }
    }
  }
  if (acumulado) return acumulado
  throw new Error("A resposta se perdeu no caminho. Tenta de novo?")
}

// ─────────────────────────────────────────────────────────────
// Drawer
// ─────────────────────────────────────────────────────────────

function Drawer({
  aberto,
  pathname,
  onFechar,
  onRecolher,
}: {
  aberto: boolean
  pathname: string
  onFechar: () => void
  onRecolher: () => void
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>([])
  const [historicoPronto, setHistoricoPronto] = useState(false)
  const pediuHistorico = useRef(false)
  const [enviando, setEnviando] = useState(false)
  const [texto, setTexto] = useState("")
  const listaRef = useRef<HTMLDivElement>(null)
  const fimRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLTextAreaElement>(null)
  const drawerRef = useRef<HTMLElement>(null)
  // Segue o fim da conversa enquanto ela está lá embaixo; se subiu para reler
  // algo, a resposta que está chegando não a puxa de volta.
  const seguindo = useRef(true)
  const jaRolou = useRef(false)

  // Histórico: só na primeira abertura, e só o DELA (o servidor filtra pela sessão).
  // Enquanto carrega, nem boas-vindas nem lista: evita o pulo de uma para a outra.
  useEffect(() => {
    if (!aberto || pediuHistorico.current) return
    pediuHistorico.current = true
    carregarHistorico()
      .then((anteriores) => setMensagens((atuais) => [...anteriores, ...atuais]))
      .catch(() => {}) // Sem histórico ainda dá para conversar; o erro aparece se ela perguntar.
      .finally(() => setHistoricoPronto(true))
  }, [aberto])

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
    if (!aberto || !historicoPronto || !seguindo.current) return
    // A primeira vez vai direto ao fim (sem rolar o histórico inteiro na
    // frente dela); durante o streaming também, senão a animação briga com o
    // texto crescendo.
    const suave = jaRolou.current && !enviando
    fimRef.current?.scrollIntoView({ block: "end", behavior: suave ? "smooth" : "auto" })
    jaRolou.current = true
  }, [mensagens, enviando, aberto, historicoPronto])

  const perguntar = useCallback(
    async (pergunta: string) => {
      const limpa = pergunta.trim()
      if (!limpa || enviando) return
      setTexto("")
      setEnviando(true)
      seguindo.current = true
      const idResposta = `b-${Date.now()}`
      setMensagens((m) => [...m, { id: `a-${Date.now()}`, papel: "aluna", texto: limpa }])

      // Cria a resposta no primeiro pedaço e a atualiza nos seguintes.
      const escrever = (textoAtual: string, erro?: boolean) =>
        setMensagens((m) => {
          const resto = m.filter((x) => x.id !== idResposta)
          return [...resto, { id: idResposta, papel: "bia", texto: textoAtual, erro }]
        })

      try {
        const final = await perguntarABia({ texto: limpa, pagina: pathname }, (parcial) => escrever(parcial))
        escrever(final)
      } catch (e) {
        escrever((e as Error).message, true)
        setTexto(limpa) // Não perder o que ela escreveu.
      } finally {
        setEnviando(false)
        campoRef.current?.focus()
      }
    },
    [enviando, pathname]
  )

  const aoNavegar = useCallback(() => {
    if (ehCelular()) onRecolher()
  }, [onRecolher])

  const sugestoes = sugestoesPara(pathname)
  const escrevendo = enviando && mensagens.at(-1)?.papel === "bia"

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

        <div
          ref={listaRef}
          onScroll={() => {
            const l = listaRef.current
            if (l) seguindo.current = l.scrollHeight - l.scrollTop - l.clientHeight < 80
          }}
          className="flex-1 overflow-y-auto overscroll-contain px-4 py-4"
        >
          <AoNavegarNoPortal.Provider value={aoNavegar}>
            {!historicoPronto ? (
              <Carregando />
            ) : mensagens.length === 0 ? (
              <BoasVindas sugestoes={sugestoes} onEscolher={perguntar} />
            ) : (
              <ol className="flex flex-col gap-4">
                {mensagens.map((m) => (
                  <Bolha key={m.id} mensagem={m} />
                ))}
                {enviando && !escrevendo && <Digitando />}
              </ol>
            )}
          </AoNavegarNoPortal.Provider>
          <div ref={fimRef} />
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            perguntar(texto)
          }}
          className="flex-none border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        >
          {/* Com conversa na tela, as sugestões da página moram aqui, numa linha só. */}
          {historicoPronto && mensagens.length > 0 && !enviando && !texto && (
            <div className="-mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 [scrollbar-width:none]">
              {sugestoes.map((s) => (
                <Sugestao key={s} texto={s} onEscolher={perguntar} className="flex-none whitespace-nowrap" />
              ))}
            </div>
          )}
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

function Sugestao({
  texto,
  onEscolher,
  className,
}: {
  texto: string
  onEscolher: (pergunta: string) => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => onEscolher(texto)}
      className={cn(
        "cursor-pointer rounded-full border border-border bg-background px-3.5 py-1.5 text-left text-[13px] text-foreground transition-colors hover:border-primary/50 hover:text-primary",
        className
      )}
    >
      {texto}
    </button>
  )
}

function BoasVindas({ sugestoes, onEscolher }: { sugestoes: string[]; onEscolher: (pergunta: string) => void }) {
  return (
    <div className="flex flex-col gap-4 pt-2">
      <div className="text-sm leading-relaxed text-foreground">
        Oi! Eu sou a <b>B.IA</b>. Posso te ajudar com a missão do dia, os scripts, as empresas do seu Radar e as aulas
        do Método. O que você quer destravar hoje?
      </div>
      <div className="flex flex-col items-start gap-2">
        {sugestoes.map((s) => (
          <Sugestao key={s} texto={s} onEscolher={onEscolher} />
        ))}
      </div>
    </div>
  )
}

/** Enquanto o histórico chega: linhas no lugar do texto, sem trocar de tela depois. */
function Carregando() {
  return (
    <div aria-label="Carregando a conversa" className="flex animate-pulse flex-col gap-4 pt-2">
      <div className="ml-auto h-9 w-2/3 rounded-2xl bg-muted" />
      <div className="flex flex-col gap-2">
        <div className="h-3 w-full rounded bg-muted" />
        <div className="h-3 w-5/6 rounded bg-muted" />
        <div className="h-3 w-2/3 rounded bg-muted" />
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
  // A B.IA escreve solta, sem balão: só a aluna tem balão, e a conversa se lê
  // como texto corrido. O erro se distingue pela cor, não por uma caixa.
  return (
    <li
      className={cn(
        "self-stretch break-words text-sm leading-relaxed",
        mensagem.erro ? "text-destructive" : "text-foreground"
      )}
    >
      <Markdown texto={mensagem.texto} />
    </li>
  )
}

function Digitando() {
  return (
    <li aria-label="A B.IA está escrevendo" className="flex gap-1 self-start py-2">
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
