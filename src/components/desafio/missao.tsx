"use client"

import { useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Copy, Play, Plus, Trash2, X } from "lucide-react"
import type { Campo, Dia, Passo, Respostas, StatusRadar } from "@/lib/desafio"
import { STATUS_RADAR, rotuloDoBotao } from "@/lib/desafio"
import {
  addEmpresaAction,
  arquivarEmpresaAction,
  concluirDiaAction,
  registrarInteresseAction,
  salvarNotasAction,
  salvarPassoAction,
} from "@/app/desafio/actions"
import type { Empresa, Operacao } from "@/lib/desafio-server"
import { Celebracao } from "@/components/desafio/celebracao"

/**
 * O motor da missão: um passo por tela.
 *
 * Por que uma coisa de cada vez, e não um formulário longo: a aluna faz isso
 * entre uma coisa e outra da vida dela, muitas vezes no celular, e um
 * formulário de nove perguntas abertas de uma vez é onde ela desiste. Um passo
 * por tela também deixa a Nati falar com ela no meio do caminho — o `support`
 * de cada passo é isso.
 *
 * O avanço é gravado a cada passo, não no fim: se o celular morrer no passo 4,
 * ela volta no passo 4. O `passo` do banco nunca retrocede, então voltar para
 * reler não desfaz nada.
 */
export function Missao({
  dia,
  respostasIniciais,
  passoInicial,
  radarInicial,
  jaConcluido,
  interesses,
  operacao,
  vizinhos,
}: {
  dia: Dia
  respostasIniciais: Respostas
  passoInicial: number
  radarInicial: Empresa[]
  jaConcluido: boolean
  /** Interesses que ela já declarou → resposta dada. */
  interesses: Record<string, string | null>
  /** O funil dela, para o passo `funil` do Dia 14. */
  operacao: Operacao
  /**
   * A navegação entre os dias (`DiasVizinhos`), montada no servidor e entregue
   * pronta. Entra por aqui, e não na página, porque só este componente sabe
   * quando a missão deu lugar à celebração — e "o Dia 8 abre quando você
   * concluir este" embaixo da tela de conquista seria falso.
   */
  vizinhos?: React.ReactNode
}) {
  const router = useRouter()
  const [i, setI] = useState(() => Math.min(passoInicial, dia.passos.length - 1))
  const [respostas, setRespostas] = useState<Respostas>(respostasIniciais)
  const [radar, setRadar] = useState(radarInicial)
  const [erro, setErro] = useState<string | null>(null)
  const [celebrando, setCelebrando] = useState(false)
  const [salvando, startSalvar] = useTransition()

  const passo = dia.passos[i]
  const ultimo = i === dia.passos.length - 1

  const pendencia = useMemo(
    () => oQueFalta(passo, respostas, radar),
    [passo, respostas, radar]
  )

  function set(chave: string, valor: Respostas[string]) {
    setRespostas((r) => ({ ...r, [chave]: valor }))
    setErro(null)
  }

  function avancar() {
    if (pendencia) {
      setErro(pendencia)
      return
    }

    startSalvar(async () => {
      // As notas de um passo `empresa` já foram salvas rodada por rodada, na
      // empresa delas (ver EmpresaDoPasso). Aqui só o dia avança.
      if (ultimo) {
        const res = await concluirDiaAction(dia.dia, respostas)
        if (!res.ok) {
          setErro(res.error ?? "Não consegui concluir agora.")
          return
        }
        setCelebrando(true)
        return
      }

      const res = await salvarPassoAction(dia.dia, i + 1, respostas)
      if (!res.ok) {
        setErro(res.error ?? "Não consegui salvar agora.")
        return
      }
      setI(i + 1)
    })
  }

  if (celebrando) {
    return (
      <Celebracao
        fim={dia.fim}
        empresasNoRadar={radar.length}
        proximoDia={dia.dia + 1}
      />
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Trilha dos passos. Diz onde ela está sem precisar de número. */}
      <div className="mb-7 flex gap-1" role="presentation">
        {dia.passos.map((_, n) => (
          <i
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              n <= i ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="mb-6 flex items-baseline gap-3">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-secondary">
          {dia.kicker}
        </span>
        <span className="ml-auto text-[11px] font-semibold text-muted-foreground">
          {i + 1} de {dia.passos.length}
        </span>
      </div>

      <div key={i} className="animate-rise flex flex-col gap-3.5">
        <h1 className="max-w-[22ch] font-display text-[clamp(22px,3.4vw,28px)] font-bold leading-[1.18] text-foreground">
          {passo.ask}
        </h1>
        {passo.support && (
          <p className="max-w-[48ch] text-[14.5px] leading-relaxed text-muted-foreground">
            {passo.support}
          </p>
        )}

        <div className="mt-2">
          <CorpoDoPasso
            passo={passo}
            dia={dia.dia}
            respostas={respostas}
            set={set}
            radar={radar}
            setRadar={setRadar}
            interesses={interesses}
            operacao={operacao}
            setErro={setErro}
          />
        </div>

        {passo.nota && (
          <p className="rounded-[14px] bg-muted px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
            {passo.nota}
          </p>
        )}
      </div>

      {/* O rodapé: para trás à esquerda, para a frente à direita — a direção
          que cada botão oferece é a mesma em que ele aponta.
          No celular eles empilham, e o `flex-col-reverse` coloca o de avançar
          em cima: ele é a continuação do que ela acabou de responder, e o
          Voltar fica embaixo, onde um toque errado não desfaz o passo. */}
      <div className="mt-9 flex flex-col gap-3.5 border-t border-border pt-6">
        {erro && (
          <span role="alert" className="text-[13px] font-semibold text-secondary">
            {erro}
          </span>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:gap-3.5">
          {i > 0 && (
            <button
              type="button"
              onClick={() => {
                setI(i - 1)
                setErro(null)
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary sm:px-0 sm:py-0"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Voltar
            </button>
          )}

          {jaConcluido && (
            <button
              type="button"
              onClick={() => router.push("/desafio")}
              className="inline-flex items-center justify-center rounded-full px-4 py-2.5 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-primary sm:px-0 sm:py-0"
            >
              Sair da revisão
            </button>
          )}

          <button
            type="button"
            onClick={avancar}
            disabled={salvando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:pointer-events-none disabled:opacity-60 sm:ml-auto sm:w-auto sm:min-w-[180px] sm:py-3"
          >
            {salvando ? "Salvando…" : rotuloDoBotao(passo, ultimo)}
          </button>
        </div>
      </div>

      {vizinhos}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// O que falta para avançar
// ─────────────────────────────────────────────────────────────

/** Um campo escondido por `mostrarSe` conta como respondido — ela não o vê. */
function visivel(campo: Campo, respostas: Respostas): boolean {
  if (!campo.mostrarSe) return true
  return respostas[campo.mostrarSe.chave] === campo.mostrarSe.valor
}

function vazio(valor: Respostas[string] | undefined): boolean {
  if (valor === undefined || valor === null) return true
  if (typeof valor === "string") return valor.trim() === ""
  if (Array.isArray(valor)) return valor.length === 0
  if (typeof valor === "boolean") return valor === false
  return false
}

/**
 * A mensagem do que falta — ou null se pode avançar.
 *
 * O texto é escrito para a aluna, não para o programador: "Responde essa
 * última para eu poder guardar" em vez de "campo obrigatório".
 */
function oQueFalta(
  passo: Passo,
  respostas: Respostas,
  radar: Empresa[]
): string | null {
  switch (passo.tipo) {
    case "video":
    case "leitura":
    case "interesse":
    case "funil":
      return null

    case "diagnostico":
      return typeof respostas[passo.chave] === "string" &&
        respostas[passo.chave] !== ""
        ? null
        : "Escolha onde você sente que está travando."

    case "formulario": {
      const falta = passo.campos.some(
        (c) =>
          c.obrigatorio !== false && visivel(c, respostas) && vazio(respostas[c.chave])
      )
      return falta ? "Faltou responder alguma coisa aqui em cima." : null
    }

    case "confirma":
      return respostas[passo.chave] === true
        ? null
        : "Marque aí embaixo para a gente seguir."

    case "copiar":
      return respostas[passo.chave] === true
        ? null
        : "Marque quando tiver enviado — é isso que está na sua mão."

    case "radar": {
      if (radar.length >= passo.meta) return null
      const falta = passo.meta - radar.length
      return `Faltam ${falta} ${falta === 1 ? "empresa" : "empresas"} para fechar a meta de hoje.`
    }

    case "empresa": {
      // `livre` nunca trava: quantas respostas chegaram não está sob o
      // controle da aluna.
      if (passo.quantidade === "livre") return null
      const feitas = respostas[`${passo.chave}:empresas`]
      const quantas = Array.isArray(feitas) ? feitas.length : 0
      const meta = passo.quantidade ?? 1
      if (quantas >= meta) return null
      const falta = meta - quantas
      if (meta === 1) {
        return passo.cadastro
          ? "Guarde a empresa para a gente seguir."
          : "Escolha uma empresa e responda sobre ela."
      }
      return `Faltam ${falta} ${falta === 1 ? "empresa" : "empresas"} para fechar.`
    }
  }
}

// ─────────────────────────────────────────────────────────────
// O corpo de cada tipo de passo
// ─────────────────────────────────────────────────────────────

type CorpoProps = {
  passo: Passo
  dia: number
  respostas: Respostas
  set: (chave: string, valor: Respostas[string]) => void
  radar: Empresa[]
  setRadar: React.Dispatch<React.SetStateAction<Empresa[]>>
  interesses: Record<string, string | null>
  operacao: Operacao
  setErro: (e: string | null) => void
}

function CorpoDoPasso(props: CorpoProps) {
  const { passo } = props

  switch (passo.tipo) {
    case "video":
      return <Video label={passo.label} src={passo.videoUrl} />

    case "leitura":
      return <Leitura corpo={passo.corpo} destaque={passo.destaque} />

    case "formulario":
      return <Campos {...props} campos={passo.campos} />

    case "confirma":
      return (
        <Confirmacao
          itens={passo.itens}
          marcado={props.respostas[passo.chave] === true}
          onChange={(v) => props.set(passo.chave, v)}
        />
      )

    case "copiar":
      return (
        <Copiar
          mensagens={passo.mensagens}
          confirmacao={passo.confirmacao}
          marcado={props.respostas[passo.chave] === true}
          onChange={(v) => props.set(passo.chave, v)}
        />
      )

    case "radar":
      return (
        <RadarDoPasso {...props} meta={passo.meta} origem={passo.origemSugerida} />
      )

    case "empresa":
      return <EmpresaDoPasso {...props} passo={passo} />

    case "interesse":
      return <Interesse {...props} passo={passo} />

    case "funil":
      return <Funil operacao={props.operacao} />

    case "diagnostico":
      return (
        <Diagnostico
          opcoes={passo.opcoes}
          escolhida={
            typeof props.respostas[passo.chave] === "string"
              ? (props.respostas[passo.chave] as string)
              : null
          }
          onChange={(v) => props.set(passo.chave, v)}
        />
      )
  }
}

/**
 * O funil dela, em números absolutos.
 *
 * Sem percentual de propósito: o documento pede explicitamente para não
 * mostrar taxa ainda. Uma aluna no Dia 14 vendo "taxa de conversão 4%" não
 * ganha informação — ganha ansiedade, contra um benchmark que ela não tem.
 */
function Funil({ operacao }: { operacao: Operacao }) {
  const { placar, reunioesRealizadas } = operacao
  const linhas = [
    { rotulo: "Empresas no seu radar", n: placar.noRadar },
    { rotulo: "Abordadas", n: placar.abordadas },
    { rotulo: "Em conversa", n: placar.emConversa },
    { rotulo: "Reuniões", n: placar.reunioes + reunioesRealizadas.length },
    { rotulo: "Propostas", n: placar.propostas },
    { rotulo: "Contratos", n: placar.fechados },
  ]

  return (
    <div className="flex flex-col gap-1.5">
      {linhas.map((l) => (
        <div
          key={l.rotulo}
          className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3"
        >
          <b className="w-12 flex-none font-display text-xl font-bold leading-none text-foreground">
            {l.n}
          </b>
          <span className="text-[13px] text-muted-foreground">{l.rotulo}</span>
        </div>
      ))}
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        São números absolutos, não porcentagem. Você está no Dia 14 da sua carreira
        comercial — comparar sua taxa com a de alguém não te diria nada de útil.
      </p>
    </div>
  )
}

/**
 * "Onde estou travando?" — e o caminho de volta.
 *
 * O dia indicado já está concluído, então ela pode reabrir e reler agora
 * mesmo. É o que faz o Desafio parecer personalizado sem nenhum sistema de
 * recomendação atrás: a resposta dela É o link.
 */
function Diagnostico({
  opcoes,
  escolhida,
  onChange,
}: {
  opcoes: readonly { rotulo: string; dia: number; porque: string }[]
  escolhida: string | null
  onChange: (v: string) => void
}) {
  const atual = opcoes.find((o) => o.rotulo === escolhida)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {opcoes.map((o) => (
          <Opcao
            key={o.rotulo}
            rotulo={o.rotulo}
            marcado={escolhida === o.rotulo}
            onClick={() => onChange(o.rotulo)}
          />
        ))}
      </div>

      {atual && (
        <div className="flex flex-col gap-2 rounded-[18px] border border-primary/35 bg-primary-subtle px-4 py-4 sm:px-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
            Onde isso é tratado
          </p>
          <p className="text-sm leading-relaxed text-foreground">{atual.porque}</p>
          <Link
            href={`/desafio/dia/${atual.dia}`}
            className="w-fit text-[13px] font-semibold text-primary underline underline-offset-[3px] hover:text-primary/80"
          >
            Reabrir o Dia {atual.dia} →
          </Link>
        </div>
      )}
    </div>
  )
}

/**
 * O vídeo do dia. Sem `src`, mostra a cartela com o rótulo: é o estado de um
 * dia cujo texto já está escrito e cuja gravação ainda não existe, e dizer
 * isso é melhor que um player quebrado.
 */
function Video({ label, src }: { label: string; src?: string }) {
  if (!src) {
    return (
      <div className="flex items-center gap-3.5 rounded-[18px] border border-dashed border-border bg-muted/60 px-4 py-5 sm:gap-4 sm:px-5 sm:py-6">
        <span className="grid h-11 w-11 flex-none place-items-center rounded-full bg-card text-muted-foreground">
          <Play className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <b className="block text-sm font-semibold text-foreground">{label}</b>
          <small className="block text-xs text-muted-foreground">
            A gravação está sendo preparada. Pode seguir — eu te explico tudo por escrito.
          </small>
        </span>
      </div>
    )
  }
  return (
    <video
      controls
      preload="metadata"
      className="w-full overflow-hidden rounded-[18px] border border-border bg-foreground/5"
      aria-label={label}
    >
      <source src={src} />
    </video>
  )
}

function Leitura({
  corpo,
  destaque,
}: {
  corpo: readonly string[]
  destaque?: string
}) {
  return (
    <div className="flex flex-col gap-3">
      {corpo.map((linha, n) => (
        <p
          key={n}
          className="rounded-[14px] border border-border bg-card px-4 py-3 text-sm leading-relaxed text-muted-foreground"
        >
          <Negrito texto={linha} />
        </p>
      ))}
      {destaque && (
        <p className="mt-1 font-display text-lg font-bold leading-snug text-foreground">
          {destaque}
        </p>
      )}
    </div>
  )
}

/** `**assim**` vira negrito. É a única marcação que o conteúdo usa. */
function Negrito({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*]+\*\*)/g).map((parte, n) =>
        parte.startsWith("**") && parte.endsWith("**") ? (
          <b key={n} className="font-semibold text-foreground">
            {parte.slice(2, -2)}
          </b>
        ) : (
          <span key={n}>{parte}</span>
        )
      )}
    </>
  )
}

function Campos({
  campos,
  respostas,
  set,
}: { campos: readonly Campo[] } & CorpoProps) {
  return (
    <div className="flex flex-col gap-5">
      {campos.filter((c) => visivel(c, respostas)).map((campo) => (
        <CampoUnico
          key={campo.chave}
          campo={campo}
          valor={respostas[campo.chave]}
          set={set}
        />
      ))}
    </div>
  )
}

function CampoUnico({
  campo,
  valor,
  set,
}: {
  campo: Campo
  valor: Respostas[string] | undefined
  set: (chave: string, valor: Respostas[string]) => void
}) {
  const base =
    "w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"

  return (
    <div className="flex flex-col gap-2">
      {campo.rotulo && (
        <label
          htmlFor={campo.chave}
          className="text-[13px] font-semibold leading-snug text-foreground"
        >
          {campo.rotulo}
        </label>
      )}

      {campo.tipo === "area" ? (
        <textarea
          id={campo.chave}
          rows={4}
          value={typeof valor === "string" ? valor : ""}
          placeholder={campo.placeholder}
          onChange={(e) => set(campo.chave, e.target.value)}
          className={`${base} resize-y leading-relaxed`}
        />
      ) : campo.tipo === "texto" || campo.tipo === "numero" ? (
        <input
          id={campo.chave}
          type={campo.tipo === "numero" ? "number" : "text"}
          inputMode={campo.tipo === "numero" ? "numeric" : undefined}
          value={typeof valor === "string" ? valor : ""}
          placeholder={campo.placeholder}
          onChange={(e) => set(campo.chave, e.target.value)}
          className={base}
        />
      ) : campo.tipo === "radio" ? (
        <div className={campo.inline ? "flex flex-wrap gap-2" : "flex flex-col gap-2"}>
          {campo.opcoes.map((opcao) => (
            <Opcao
              key={opcao}
              rotulo={opcao}
              marcado={valor === opcao}
              inline={campo.inline}
              onClick={() => set(campo.chave, opcao)}
            />
          ))}
        </div>
      ) : campo.tipo === "checks" ? (
        <Multipla campo={campo} valor={valor} set={set} />
      ) : (
        <Escala campo={campo} valor={valor} set={set} />
      )}

      {campo.ajuda && (
        <small className="text-xs leading-relaxed text-muted-foreground">
          {campo.ajuda}
        </small>
      )}
    </div>
  )
}

function Opcao({
  rotulo,
  marcado,
  inline,
  onClick,
}: {
  rotulo: string
  marcado: boolean
  inline?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={marcado}
      className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
        inline ? "" : "w-full"
      } ${
        marcado
          ? "border-primary bg-primary-subtle font-semibold text-foreground"
          : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
      }`}
    >
      <span
        className={`grid h-4 w-4 flex-none place-items-center rounded-full border transition-colors ${
          marcado ? "border-primary bg-primary text-primary-foreground" : "border-border"
        }`}
      >
        {marcado && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
      </span>
      {/* `min-w-0` + quebra no meio da palavra: o rótulo pode ser o nome de uma
          empresa que a aluna digitou, e um nome comprido sem espaço esticaria o
          botão para fora da tela no celular. */}
      <span className="min-w-0 break-words">{rotulo}</span>
    </button>
  )
}

/** Múltipla escolha, com teto quando a pergunta diz "escolha até 2". */
function Multipla({
  campo,
  valor,
  set,
}: {
  campo: Extract<Campo, { tipo: "checks" }>
  valor: Respostas[string] | undefined
  set: (chave: string, valor: Respostas[string]) => void
}) {
  const atuais = Array.isArray(valor) ? valor : []
  const cheio = campo.max !== undefined && atuais.length >= campo.max

  return (
    <div className="flex flex-col gap-2">
      {campo.opcoes.map((opcao) => {
        const marcado = atuais.includes(opcao)
        return (
          <button
            key={opcao}
            type="button"
            onClick={() =>
              set(
                campo.chave,
                marcado ? atuais.filter((o) => o !== opcao) : [...atuais, opcao]
              )
            }
            aria-pressed={marcado}
            // Teto atingido: as não marcadas apagam em vez de desaparecer, para
            // ela entender que precisa desmarcar uma antes de trocar.
            disabled={!marcado && cheio}
            className={`flex w-full items-center gap-2.5 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 ${
              marcado
                ? "border-primary bg-primary-subtle font-semibold text-foreground"
                : cheio
                  ? "border-border bg-card text-muted-foreground/50"
                  : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
            }`}
          >
            <span
              className={`grid h-4 w-4 flex-none place-items-center rounded border transition-colors ${
                marcado ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {marcado && <Check className="h-2.5 w-2.5" strokeWidth={4} />}
            </span>
            {opcao}
          </button>
        )
      })}
    </div>
  )
}

/** A nota de 0 a 10. Botões, não slider: no celular o slider erra o número. */
function Escala({
  campo,
  valor,
  set,
}: {
  campo: Extract<Campo, { tipo: "escala" }>
  valor: Respostas[string] | undefined
  set: (chave: string, valor: Respostas[string]) => void
}) {
  const min = campo.min ?? 0
  const max = campo.max ?? 10
  const notas = Array.from({ length: max - min + 1 }, (_, n) => min + n)

  return (
    // Grade de 6 no celular: em fila, onze botões de 40px quebram em duas
    // linhas tortas e a nota vira um alvo pequeno. Em grade cada número ocupa
    // a largura que sobra e continua fácil de acertar com o polegar.
    <div
      role="radiogroup"
      aria-label={campo.rotulo}
      className="grid grid-cols-6 gap-1.5 sm:flex sm:flex-wrap"
    >
      {notas.map((n) => {
        const marcado = valor === String(n)
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={marcado}
            onClick={() => set(campo.chave, String(n))}
            className={`h-11 w-full rounded-xl border font-display text-sm font-bold transition-all duration-200 sm:h-10 sm:w-10 ${
              marcado
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
            }`}
          >
            {n}
          </button>
        )
      })}
    </div>
  )
}

/**
 * "Eu fiz isso."
 *
 * Declaração, não prova: a missão cobra o que está sob o controle da aluna.
 * Ela controla enviar; não controla receber resposta.
 */
function Confirmacao({
  itens,
  marcado,
  onChange,
}: {
  itens: readonly string[]
  marcado: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      {itens.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => onChange(!marcado)}
          aria-pressed={marcado}
          className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-sm transition-all duration-200 ${
            marcado
              ? "border-primary bg-primary-subtle font-semibold text-foreground"
              : "border-border bg-card text-muted-foreground hover:border-primary/45 hover:text-foreground"
          }`}
        >
          <span
            className={`grid h-5 w-5 flex-none place-items-center rounded border transition-colors ${
              marcado ? "border-primary bg-primary text-primary-foreground" : "border-border"
            }`}
          >
            {marcado && <Check className="h-3 w-3" strokeWidth={3.5} />}
          </span>
          {item}
        </button>
      ))}
    </div>
  )
}

/**
 * Script falado no vídeo = script disponível para copiar. É regra do
 * documento, e o motivo é prático: fazer a aluna transcrever de ouvido o que a
 * Nati acabou de falar é a diferença entre ela mandar a mensagem e não mandar.
 */
function Copiar({
  mensagens,
  confirmacao,
  marcado,
  onChange,
}: {
  mensagens: readonly { titulo?: string; texto: string }[]
  confirmacao: string
  marcado: boolean
  onChange: (v: boolean) => void
}) {
  const [copiada, setCopiada] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3">
      {mensagens.map((msg, n) => (
        <div
          key={n}
          className="flex flex-col gap-3 rounded-[18px] border border-border bg-card px-4 py-4 sm:px-5"
        >
          {msg.titulo && (
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-secondary">
              {msg.titulo}
            </p>
          )}
          <p className="text-sm leading-relaxed text-foreground">{msg.texto}</p>
          <button
            type="button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(msg.texto)
                setCopiada(n)
                window.setTimeout(() => setCopiada(null), 2200)
              } catch {
                // Sem permissão de área de transferência: o texto está na tela,
                // ela seleciona e copia à mão. Não vale travar o passo por isso.
                setCopiada(null)
              }
            }}
            className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-primary/45 hover:text-primary"
          >
            {copiada === n ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copiada
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copiar mensagem
              </>
            )}
          </button>
        </div>
      ))}

      <Confirmacao itens={[confirmacao]} marcado={marcado} onChange={onChange} />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Radar
// ─────────────────────────────────────────────────────────────

function RadarDoPasso({
  meta,
  origem,
  dia,
  radar,
  setRadar,
  setErro,
}: { meta: number; origem?: string } & CorpoProps) {
  return (
    <RadarEditor
      dia={dia}
      radar={radar}
      setRadar={setRadar}
      setErro={setErro}
      origem={origem}
      meta={meta}
    />
  )
}

/**
 * O Radar editável, usado dentro da missão e na página própria dele.
 *
 * O contador mostra a meta do dia e a do Desafio inteiro ao lado, porque são
 * duas coisas diferentes: hoje são 10, no Desafio são 100. Sem a segunda, a
 * aluna acha que terminou; sem a primeira, ela acha que está longe.
 */
export function RadarEditor({
  dia,
  radar,
  setRadar,
  setErro,
  origem,
  meta,
  metaTotal = 100,
}: {
  /** Dia que originou a empresa. `null` fora da missão: ali não existe "hoje". */
  dia: number | null
  radar: Empresa[]
  setRadar: React.Dispatch<React.SetStateAction<Empresa[]>>
  setErro: (e: string | null) => void
  origem?: string
  meta?: number
  metaTotal?: number
}) {
  const [nome, setNome] = useState("")
  const [segmento, setSegmento] = useState("")
  const [contato, setContato] = useState("")
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, startSalvar] = useTransition()

  function adicionar() {
    const limpo = nome.trim()
    if (!limpo) return

    startSalvar(async () => {
      const res = await addEmpresaAction({
        dia: dia ?? undefined,
        nome: limpo,
        segmento,
        contato,
        origem,
      })
      if (!res.ok) {
        setAviso(res.error)
        return
      }
      setRadar((r) => [...r, res.empresa])
      setNome("")
      setSegmento("")
      setContato("")
      setAviso(null)
      setErro(null)
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-[18px] bg-muted px-4 py-4 sm:px-5">
        <span className="font-display text-3xl font-bold leading-none text-foreground">
          {radar.length}
        </span>
        {meta !== undefined && (
          <small className="text-[11px] font-semibold leading-tight text-muted-foreground">
            de {meta}
            <br />
            hoje
          </small>
        )}
        {/* Passadas as 100, o contador deixa de ter teto — é o que o Dia 18
            estabelece. Seguir mostrando "a meta é 100" para quem já tem 112
            transformaria a conquista dela em régua vencida. */}
        {radar.length < metaTotal ? (
          <span className="ml-auto text-right text-[11px] leading-tight text-muted-foreground">
            no Desafio inteiro
            <br />a meta é {metaTotal}
          </span>
        ) : (
          <span className="ml-auto text-right text-[11px] font-semibold leading-tight text-primary">
            meta das {metaTotal}
            <br />
            conquistada
          </span>
        )}
      </div>

      {radar.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {radar.map((empresa) => (
            <li
              key={empresa.id}
              className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5"
            >
              <Check className="h-3.5 w-3.5 flex-none text-primary" strokeWidth={3} />
              <span className="min-w-0 flex-1">
                <b className="block truncate text-[13px] font-semibold text-foreground">
                  {empresa.nome}
                </b>
                {/* O estágio e o próximo passo são o que faz o Radar valer como
                    ferramenta de trabalho, e não como lista. Escondê-los aqui
                    obrigaria a aluna a abrir uma por uma para saber o que fazer. */}
                {empresa.proximaAcao ? (
                  <small className="block truncate text-[11.5px] text-muted-foreground">
                    {empresa.proximaAcao}
                    {empresa.proximaAcaoEm && ` · ${formataData(empresa.proximaAcaoEm)}`}
                  </small>
                ) : (
                  empresa.segmento && (
                    <small className="block truncate text-[11.5px] text-muted-foreground">
                      {empresa.segmento}
                    </small>
                  )
                )}
              </span>
              {empresa.status !== "no-radar" && (
                <span className="flex-none rounded-full bg-secondary-subtle px-2.5 py-1 text-[10px] font-bold text-secondary">
                  {STATUS_RADAR[empresa.status as StatusRadar] ?? empresa.status}
                </span>
              )}
              <button
                type="button"
                aria-label={`Tirar ${empresa.nome} do Radar`}
                onClick={() =>
                  startSalvar(async () => {
                    const res = await arquivarEmpresaAction(empresa.id)
                    if (res.ok) setRadar((r) => r.filter((e) => e.id !== empresa.id))
                  })
                }
                // Visível no celular: sem hover, um botão que só aparece ao
                // passar o mouse simplesmente não existe para quem toca.
                className="flex-none p-1 text-muted-foreground transition-opacity hover:text-destructive lg:opacity-0 lg:group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 rounded-[18px] border border-dashed border-border bg-card px-4 py-4">
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              adicionar()
            }
          }}
          placeholder="Nome da empresa"
          aria-label="Nome da empresa"
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
        />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            placeholder="O que ela faz"
            aria-label="O que ela faz"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
          <input
            type="text"
            value={contato}
            onChange={(e) => setContato(e.target.value)}
            placeholder="Instagram ou site"
            aria-label="Instagram ou site"
            className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>
        <button
          type="button"
          onClick={adicionar}
          disabled={salvando || nome.trim() === ""}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-3 text-xs font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 sm:w-fit sm:py-2.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Adicionar empresa
        </button>
        {aviso && (
          <small role="status" className="text-xs font-semibold text-secondary">
            {aviso}
          </small>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Seu Radar não termina hoje. Sempre que encontrar uma empresa nova durante a
        jornada, volte aqui e adicione.
      </p>
    </div>
  )
}

/**
 * Uma ou mais empresas do Radar + as mesmas perguntas sobre cada uma.
 *
 * As respostas vão para `desafio_radar.notas`, agrupadas por dia, e NÃO para
 * as colunas do Radar: "acho que essa empresa poderia fazer follow-up" é
 * hipótese de exercício, não fato sobre a empresa. O Radar principal fica
 * simples — é ferramenta operacional, e o documento pede que novos campos
 * entrem só quando a aluna realmente precisar deles.
 *
 * Com `cadastro`, o passo CRIA a empresa (é o Dia 1, Radar vazio). Sem ele,
 * ela escolhe uma que já cadastrou — e o sistema NÃO pede o nome de novo:
 * perguntar duas vezes o que já está guardado ensina que o registro não serve
 * para nada.
 *
 * Com `quantidade > 1`, percorre uma empresa por rodada. Cada rodada salva e
 * começa limpa: é o Raio-X do Dia 4 (três empresas) e as cinco escolhas do
 * Dia 6.
 */
function EmpresaDoPasso({
  passo,
  dia,
  respostas,
  set,
  radar,
  setRadar,
}: { passo: Extract<Passo, { tipo: "empresa" }> } & CorpoProps) {
  const chaveFeitas = `${passo.chave}:empresas`
  const feitasRaw = respostas[chaveFeitas]
  const feitas = Array.isArray(feitasRaw) ? feitasRaw : []
  const livre = passo.quantidade === "livre"
  // Narrowing explícito: `livre ? … : passo.quantidade` deixaria o tipo como
  // `number | "livre"` para o TypeScript, que não liga o booleano ao campo.
  const meta = passo.quantidade === "livre" ? Infinity : (passo.quantidade ?? 1)

  const [escolhida, setEscolhida] = useState<string | null>(null)
  const [rodada, setRodada] = useState<Respostas>({})
  const [proxima, setProxima] = useState("")
  const [proximaEm, setProximaEm] = useState("")
  const [nome, setNome] = useState("")
  const [segmento, setSegmento] = useState("")
  const [canal, setCanal] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [salvando, startSalvar] = useTransition()

  const empresa = radar.find((e) => e.id === escolhida)
  const disponiveis = radar.filter((e) => !feitas.includes(e.id))
  const completo = feitas.length >= meta

  function setRodadaCampo(chave: string, valor: Respostas[string]) {
    setRodada((r) => ({ ...r, [chave]: valor }))
  }

  /** Grava as notas desta empresa e abre a rodada seguinte, já limpa. */
  function guardarRodada() {
    if (!escolhida) return
    const faltando = passo.campos.some(
      (c) => c.obrigatorio !== false && visivel(c, rodada) && vazio(rodada[c.chave])
    )
    if (faltando) {
      setAviso("Faltou responder alguma coisa aqui em cima.")
      return
    }
    if (passo.proximaAcao && proxima.trim() === "") {
      setAviso("Escreva o próximo passo dessa conversa — é ele que não deixa ela esfriar.")
      return
    }

    startSalvar(async () => {
      const notas: Record<string, unknown> = {}
      for (const campo of passo.campos) notas[campo.chave] = rodada[campo.chave]

      const res = await salvarNotasAction(dia, escolhida, notas, {
        proxima: passo.proximaAcao ? proxima : undefined,
        proximaEm: passo.proximaAcao && proximaEm ? proximaEm : undefined,
      })
      if (!res.ok) {
        setAviso(res.error ?? "Não consegui salvar agora.")
        return
      }
      set(chaveFeitas, [...feitas, escolhida])
      setEscolhida(null)
      setRodada({})
      setProxima("")
      setProximaEm("")
      setAviso(null)
    })
  }

  const contador = livre ? (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
      {feitas.length === 0
        ? "Nenhuma ainda"
        : `${feitas.length} ${feitas.length === 1 ? "conversa trabalhada" : "conversas trabalhadas"}`}
    </p>
  ) : meta > 1 ? (
    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-secondary">
      {completo
        ? `${feitas.length} de ${meta} prontas`
        : `Empresa ${feitas.length + 1} de ${meta}`}
    </p>
  ) : null

  // Terminou o que o passo pedia.
  if (completo && !escolhida) {
    return (
      <div className="flex flex-col gap-3">
        {contador}
        <ul className="flex flex-col gap-1.5">
          {feitas.map((id) => {
            const e = radar.find((x) => x.id === id)
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-subtle px-4 py-3"
              >
                <Check className="h-3.5 w-3.5 flex-none text-primary" strokeWidth={3} />
                <b className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                  {e?.nome ?? "Empresa"}
                </b>
              </li>
            )
          })}
        </ul>
        {disponiveis.length > 0 && (
          <button
            type="button"
            onClick={() => setEscolhida(disponiveis[0].id)}
            className="w-fit text-xs font-semibold text-primary underline underline-offset-2"
          >
            {livre ? "Trabalhar mais uma conversa" : "Quero fazer uma empresa a mais"}
          </button>
        )}
      </div>
    )
  }

  // Rodada em andamento: as perguntas sobre a empresa escolhida.
  if (empresa) {
    return (
      <div className="flex flex-col gap-5">
        {contador}
        <div className="flex items-center gap-3 rounded-[18px] border border-primary/35 bg-primary-subtle px-4 py-4 sm:px-5">
          <span className="min-w-0 flex-1">
            <small className="block text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
              Sua empresa
            </small>
            <b className="block truncate font-display text-lg font-bold text-foreground">
              {empresa.nome}
            </b>
            {empresa.segmento && (
              <small className="block truncate text-xs text-muted-foreground">
                {empresa.segmento}
              </small>
            )}
          </span>
          {!passo.cadastro && disponiveis.length > 1 && (
            <button
              type="button"
              onClick={() => {
                setEscolhida(null)
                setRodada({})
              }}
              className="flex-none text-[11px] font-semibold text-primary underline underline-offset-2"
            >
              trocar
            </button>
          )}
        </div>

        <div className="flex flex-col gap-5">
          {passo.campos.filter((c) => visivel(c, rodada)).map((campo) => (
            <CampoUnico
              key={campo.chave}
              campo={campo}
              valor={rodada[campo.chave]}
              set={setRodadaCampo}
            />
          ))}

          {/* O próximo passo é o que impede a conversa de esfriar. Fica junto
              da empresa no Radar, não no dia: ela vai consultar isso amanhã. */}
          {passo.proximaAcao && (
            <div className="flex flex-col gap-2">
              <label
                htmlFor="proxima-acao"
                className="text-[13px] font-semibold leading-snug text-foreground"
              >
                {passo.proximaAcao.rotulo}
              </label>
              <input
                id="proxima-acao"
                type="text"
                value={proxima}
                onChange={(e) => setProxima(e.target.value)}
                placeholder={passo.proximaAcao.placeholder}
                className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
              />
              <label htmlFor="proxima-em" className="text-xs text-muted-foreground">
                Quando? (opcional)
              </label>
              <input
                id="proxima-em"
                type="date"
                value={proximaEm}
                onChange={(e) => setProximaEm(e.target.value)}
                className="w-fit rounded-xl border border-input bg-card px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={guardarRodada}
          disabled={salvando}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-3 text-xs font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 sm:w-fit sm:py-2.5"
        >
          {salvando
            ? "Salvando…"
            : meta > 1 && feitas.length + 1 < meta
              ? "Salvar e ir para a próxima"
              : "Salvar"}
        </button>
        {aviso && (
          <small role="status" className="text-xs font-semibold text-secondary">
            {aviso}
          </small>
        )}
      </div>
    )
  }

  // Cadastro: o Dia 1, em que o Radar ainda está vazio.
  if (passo.cadastro) {
    const cad = passo.cadastro
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="emp-nome" className="text-[13px] font-semibold text-foreground">
            {cad.rotuloNome}
          </label>
          <input
            id="emp-nome"
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Studio de pilates da Ana"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="emp-seg" className="text-[13px] font-semibold text-foreground">
            {cad.rotuloSegmento}
          </label>
          <input
            id="emp-seg"
            type="text"
            value={segmento}
            onChange={(e) => setSegmento(e.target.value)}
            placeholder="Aulas de pilates por plano mensal"
            className="w-full rounded-xl border border-input bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/25"
          />
        </div>

        {cad.canais && cad.rotuloCanal && (
          <div className="flex flex-col gap-2">
            <span className="text-[13px] font-semibold text-foreground">
              {cad.rotuloCanal}
            </span>
            <div className="flex flex-wrap gap-2">
              {cad.canais.map((opcao) => (
                <Opcao
                  key={opcao}
                  rotulo={opcao}
                  marcado={canal === opcao}
                  inline
                  onClick={() => setCanal(opcao)}
                />
              ))}
            </div>
          </div>
        )}

        <button
          type="button"
          disabled={salvando || nome.trim() === ""}
          onClick={() =>
            startSalvar(async () => {
              const res = await addEmpresaAction({
                dia,
                nome,
                segmento,
                contato: canal ?? undefined,
                origem: cad.origem,
              })
              if (!res.ok) {
                setAviso(res.error)
                return
              }
              setRadar((r) => [...r, res.empresa])
              setEscolhida(res.empresa.id)
              setAviso(null)
            })
          }
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-secondary px-5 py-3 text-xs font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 sm:w-fit sm:py-2.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Guardar essa empresa
        </button>
        {aviso && (
          <small role="status" className="text-xs font-semibold text-secondary">
            {aviso}
          </small>
        )}
      </div>
    )
  }

  // Escolher uma das que ela já tem.
  if (disponiveis.length === 0) {
    return (
      <p className="rounded-[14px] border border-dashed border-border bg-card px-4 py-4 text-sm leading-relaxed text-muted-foreground">
        Você já percorreu todas as empresas do seu Radar. Volte ao{" "}
        <b className="text-foreground">Radar</b> e cadastre mais uma para continuar daqui.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {contador}

      {feitas.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {feitas.map((id) => {
            const e = radar.find((x) => x.id === id)
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary-subtle px-4 py-2.5"
              >
                <Check className="h-3.5 w-3.5 flex-none text-primary" strokeWidth={3} />
                <b className="min-w-0 flex-1 truncate text-[13px] font-semibold text-foreground">
                  {e?.nome ?? "Empresa"}
                </b>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2">
        {disponiveis.map((e) => (
          <Opcao
            key={e.id}
            rotulo={e.segmento ? `${e.nome} — ${e.segmento}` : e.nome}
            marcado={false}
            onClick={() => setEscolhida(e.id)}
          />
        ))}
      </div>

      {livre && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Se nenhuma respondeu ainda, pode seguir. Quantas respondem não está sob o
          seu controle — e isso não é o seu trabalho mal feito.
        </p>
      )}
    </div>
  )
}

/**
 * Levantar a mão para algo (hoje: o Closer Presencial).
 *
 * A pergunta de disponibilidade vem DEPOIS do clique, de propósito: assim
 * sabemos não só quantas acharam interessante, mas quantas efetivamente
 * considerariam viajar — que é informação comercial muito mais útil. E cidade
 * e UF não são perguntadas de novo: já vieram da matrícula.
 *
 * O passo é atravessável sem responder nada. Interesse não é missão.
 */
function Interesse({
  passo,
  dia,
  interesses,
}: { passo: Extract<Passo, { tipo: "interesse" }> } & CorpoProps) {
  const jaDeclarado = passo.interesse in interesses
  const [dentro, setDentro] = useState(jaDeclarado)
  const [resposta, setResposta] = useState<string | null>(
    interesses[passo.interesse] ?? null
  )
  const [, startSalvar] = useTransition()

  function registrar(valor: string | null) {
    setResposta(valor)
    startSalvar(async () => {
      await registrarInteresseAction(dia, passo.interesse, valor)
    })
  }

  if (!dentro) {
    return (
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            setDentro(true)
            registrar(null)
          }}
          className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary px-6 py-3 text-sm font-semibold text-secondary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          Quero entrar na lista
        </button>
        <p className="text-xs text-muted-foreground">
          Sem compromisso nenhum. Se não for para você, é só seguir para o próximo
          passo.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-[18px] border border-primary/35 bg-primary-subtle px-5 py-4">
        <Check className="h-4 w-4 flex-none text-primary" strokeWidth={3} />
        <span className="text-sm font-semibold text-foreground">
          Você está na lista de interessadas.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-[13px] font-semibold leading-snug text-foreground">
          {passo.pergunta}
        </span>
        <div className="flex flex-col gap-2">
          {passo.opcoes.map((opcao) => (
            <Opcao
              key={opcao}
              rotulo={opcao}
              marcado={resposta === opcao}
              onClick={() => registrar(opcao)}
            />
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          setDentro(false)
          setResposta(null)
          startSalvar(async () => {
            await registrarInteresseAction(dia, passo.interesse, null)
          })
        }}
        className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
      >
        <X className="h-3 w-3" />
        Mudei de ideia
      </button>
    </div>
  )
}

/** `2026-10-12` → `12/10`. A aluna não precisa do ano para amanhã. */
function formataData(iso: string): string {
  const [, mes, dia] = iso.split("-")
  return dia && mes ? `${dia}/${mes}` : iso
}
