import { Fragment } from "react"

/**
 * O Markdown que a B.IA escreve, e só ele: parágrafos, listas com "-" ou
 * "1.", **negrito**, _itálico_, links soltos e [texto](link) — este só para
 * caminhos do portal ("/desafio/caderno?pagina=12") ou https. O prompt dela
 * proíbe títulos e tabelas, então um parser completo seria peso sem uso.
 *
 * Monta elementos React — nunca `innerHTML`. O texto vem de um LLM que leu
 * material e a pergunta da aluna; nada dele pode virar HTML executável.
 */
export function Markdown({ texto }: { texto: string }) {
  const blocos = texto.trim().split(/\n{2,}/)
  return (
    <>
      {blocos.map((bloco, i) => {
        const linhas = bloco.split("\n")
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
