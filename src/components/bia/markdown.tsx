import { createContext, Fragment, useContext, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Check, Copy, FileText } from "lucide-react"

/**
 * O Markdown que a B.IA escreve, e só ele: parágrafos, listas com "-" ou
 * "1.", citação com "> " (a mensagem pronta para copiar), **negrito**,
 * _itálico_, links soltos e [texto](link) — este só para caminhos do portal
 * ("/desafio/caderno?pagina=12") ou https. O prompt dela
 * proíbe títulos e tabelas, então um parser completo seria peso sem uso.
 *
 * Link para o próprio portal vira botão que navega na mesma aba, com a B.IA
 * aberta por cima; link de fora abre em outra aba. O Caderno é a exceção
 * interna: a rota redireciona para um PDF, que sairia do portal.
 *
 * Monta elementos React — nunca `innerHTML`. O texto vem de um LLM que leu
 * material e a pergunta da aluna; nada dele pode virar HTML executável.
 */
/** Quem usa o Markdown fica sabendo quando a aluna toca num botão do portal. */
export const AoNavegarNoPortal = createContext<(() => void) | null>(null)

const CITACAO = /^\s*>\s?/

/**
 * Blocos separados por linha em branco e, dentro de um bloco, a citação
 * separada do texto em volta: o modelo costuma colar "Manda assim:" na linha
 * de cima do "> ".
 */
function blocosDe(texto: string): string[][] {
  const blocos: string[][] = []
  for (const bloco of texto.trim().split(/\n{2,}/)) {
    let atual: string[] = []
    for (const linha of bloco.split("\n")) {
      if (atual.length > 0 && CITACAO.test(linha) !== CITACAO.test(atual[0])) {
        blocos.push(atual)
        atual = []
      }
      atual.push(linha)
    }
    if (atual.length > 0) blocos.push(atual)
  }
  // Parágrafos dentro da mesma mensagem vêm com ">" vazio entre eles; duas
  // citações separadas por linha em branco são duas mensagens.
  return blocos
}

export function Markdown({ texto }: { texto: string }) {
  return (
    <>
      {blocosDe(texto).map((linhas, i) => {
        if (CITACAO.test(linhas[0])) {
          return <MensagemPronta key={i} texto={linhas.map((l) => l.replace(CITACAO, "")).join("\n").trim()} />
        }
        if (linhas.every((l) => /^\s*[-*•]\s+/.test(l))) {
          return (
            <ul key={i} className="my-1.5 list-disc space-y-1 pl-5 marker:text-primary">
              {linhas.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*•]\s+/, ""))}</li>
              ))}
            </ul>
          )
        }
        if (linhas.every((l) => /^\s*\d+[.)]\s+/.test(l))) {
          return (
            <ol key={i} className="my-1.5 list-decimal space-y-1 pl-5 marker:font-semibold marker:text-primary">
              {linhas.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s+/, ""))}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={i} className="my-1.5 first:mt-0 last:mb-0">
            {linhas.map((l, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {inline(l.replace(/^#+\s*/, ""))}
              </Fragment>
            ))}
          </p>
        )
      })}
    </>
  )
}

const TOKEN = /(\[[^\]]+\]\((?:\/(?!\/)|https:\/\/)[^)\s]+\)|\*\*[^*]+\*\*|__[^_]+__|\*[^*\s][^*]*\*|_[^_\s][^_]*_|https?:\/\/[^\s)]+)/g

function inline(texto: string): React.ReactNode[] {
  return texto.split(TOKEN).map((parte, i) => {
    const link = parte.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/)
    if (link) {
      const interno = caminhoDoPortal(link[2])
      if (interno) return <BotaoDoPortal key={i} href={interno} texto={link[1]} />
      return (
        <a
          key={i}
          href={link[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2"
        >
          {link[1]}
        </a>
      )
    }
    if (/^(\*\*|__).+\1$/.test(parte)) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {parte.slice(2, -2)}
        </strong>
      )
    }
    if (/^([*_]).+\1$/.test(parte)) return <em key={i}>{parte.slice(1, -1)}</em>
    if (/^https?:\/\//.test(parte)) {
      // Pontuação final da frase não faz parte do link.
      const [, url, resto] = parte.match(/^(.*?)([.,;:!?]*)$/)!
      const interno = caminhoDoPortal(url)
      if (interno) {
        return (
          <Fragment key={i}>
            <BotaoDoPortal href={interno} texto={rotulo(interno)} />
            {resto}
          </Fragment>
        )
      }
      return (
        <Fragment key={i}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-primary underline underline-offset-2"
          >
            {url}
          </a>
          {resto}
        </Fragment>
      )
    }
    return <Fragment key={i}>{parte}</Fragment>
  })
}

/** Os domínios em que o portal responde; respostas antigas da B.IA têm a URL inteira. */
const ORIGENS_DO_PORTAL = /^https:\/\/(?:portal|portalevp)\.conexaomultimeta\.com\.br(?=\/|$)/

/** O caminho dentro do portal ("/desafio/dia/5"), ou null se o link é de fora. */
function caminhoDoPortal(href: string): string | null {
  if (/^\/(?!\/)/.test(href)) return href
  if (ORIGENS_DO_PORTAL.test(href)) return href.replace(ORIGENS_DO_PORTAL, "") || "/"
  return null
}

const ehCaderno = (href: string) => href.startsWith("/desafio/caderno")

/** Para link solto, sem texto escolhido pela B.IA. */
function rotulo(href: string): string {
  const [caminho] = href.split(/[?#]/)
  const dia = caminho.match(/^\/desafio\/dia\/(\d+)/)
  if (dia) return Number(dia[1]) === 0 ? "Abrir o Dia Zero" : `Abrir o Dia ${dia[1]}`
  if (caminho.startsWith("/desafio/radar")) return "Abrir o Radar"
  if (caminho.startsWith("/desafio/biblioteca")) return "Abrir a Biblioteca"
  if (ehCaderno(caminho)) return "Abrir o Caderno de Campo"
  if (caminho.startsWith("/desafio")) return "Abrir a jornada do Desafio"
  if (caminho.startsWith("/aulas")) return "Abrir as aulas"
  return "Abrir no portal"
}

const BOTAO =
  "mx-0.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/25 bg-primary-subtle px-3 py-1 align-middle text-[13px] font-semibold leading-5 text-primary no-underline transition-colors hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function BotaoDoPortal({ href, texto }: { href: string; texto: string }) {
  const aoNavegar = useContext(AoNavegarNoPortal)
  if (ehCaderno(href)) {
    return (
      <a href={href} target="_blank" rel="noopener" className={BOTAO}>
        <FileText className="h-3.5 w-3.5 flex-none" />
        <span className="truncate">{texto}</span>
      </a>
    )
  }
  return (
    <Link href={href} onClick={() => aoNavegar?.()} className={BOTAO}>
      <span className="truncate">{texto}</span>
      <ArrowRight className="h-3.5 w-3.5 flex-none" />
    </Link>
  )
}

/**
 * A mensagem que ela vai mandar para a empresa, com botão de copiar: no
 * celular, selecionar um parágrafo exato dentro do chat é o que mais irrita.
 */
function MensagemPronta({ texto }: { texto: string }) {
  const [copiou, setCopiou] = useState(false)

  useEffect(() => {
    if (!copiou) return
    const t = setTimeout(() => setCopiou(false), 2000)
    return () => clearTimeout(t)
  }, [copiou])

  // Na tela, com negrito; no que ela copia, sem os asteriscos — é o texto
  // que vai para o WhatsApp.
  const limpo = texto.replace(/\*\*([^*]+)\*\*|__([^_]+)__/g, "$1$2")

  return (
    <figure className="my-2.5 overflow-hidden rounded-xl border border-border bg-muted/40">
      <blockquote className="px-3.5 pb-2 pt-3 text-[13.5px] leading-relaxed text-foreground">
        {texto.split("\n").map((l, j) => (
          <Fragment key={j}>
            {j > 0 && <br />}
            {inline(l)}
          </Fragment>
        ))}
      </blockquote>
      <figcaption className="flex justify-end border-t border-border/70 px-2 py-1">
        <button
          type="button"
          onClick={() => {
            navigator.clipboard
              ?.writeText(limpo)
              .then(() => setCopiou(true))
              .catch(() => {})
          }}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold text-muted-foreground transition-colors hover:bg-background hover:text-primary"
        >
          {copiou ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          <span aria-live="polite">{copiou ? "Copiado" : "Copiar mensagem"}</span>
        </button>
      </figcaption>
    </figure>
  )
}
