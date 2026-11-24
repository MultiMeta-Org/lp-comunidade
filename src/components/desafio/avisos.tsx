import Link from "next/link"
import { ArrowUpRight, BookOpen, Mail, MessageCircle, Sparkles } from "lucide-react"
import type { Aviso } from "@/lib/desafio"

const ICONES = {
  email: Mail,
  bia: Sparkles,
  whatsapp: MessageCircle,
  livro: BookOpen,
} as const

/** Link para fora (http, mailto) abre em outra aba; para dentro do portal, navega. */
const ehExterno = (href: string) => /^(https?:|mailto:)/.test(href)

/**
 * Os recados em cartão embaixo de um vídeo ou áudio. É o "anota aí" das
 * boas-vindas e das aulas da parte teórica: coisa para guardar, não para
 * responder.
 */
export function Avisos({ avisos }: { avisos?: readonly Aviso[] }) {
  if (!avisos || avisos.length === 0) return null
  return (
    <ul className="flex flex-col gap-2.5">
      {avisos.map((a) => {
        const Icone = a.icone ? ICONES[a.icone] : null
        return (
          <li
            key={a.titulo}
            className="flex gap-3.5 rounded-[16px] border border-border bg-card px-4 py-3.5 sm:px-5"
          >
            {Icone && (
              <span className="mt-0.5 grid h-9 w-9 flex-none place-items-center rounded-full bg-primary-subtle text-primary">
                <Icone className="h-4 w-4" />
              </span>
            )}
            <span className="flex min-w-0 flex-1 flex-col gap-1">
              <b className="text-sm font-semibold text-foreground">{a.titulo}</b>
              <span className="whitespace-pre-line text-[13.5px] leading-relaxed text-muted-foreground">
                {a.texto}
              </span>
              {a.link &&
                (ehExterno(a.link.href) ? (
                  <a
                    href={a.link.href}
                    target={a.link.href.startsWith("mailto:") ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                  >
                    {a.link.rotulo}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                ) : (
                  <Link
                    href={a.link.href}
                    className="mt-1 inline-flex w-fit items-center gap-1 text-[13px] font-semibold text-primary hover:underline"
                  >
                    {a.link.rotulo}
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                ))}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
