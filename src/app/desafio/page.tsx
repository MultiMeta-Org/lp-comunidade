import Link from "next/link"
import { ArrowRight, BookOpen, Check, PartyPopper, Sparkles, Target } from "lucide-react"
import { requireDesafio } from "@/lib/guard"
import { getJornada, getOperacao } from "@/lib/desafio-server"
import { TOTAL_DIAS, diaAtual, getDia } from "@/lib/desafio"
import { getMemberFirstName } from "@/lib/access"
import { SUPPORT_URL } from "@/lib/links"
import { Atmosphere } from "@/components/atmosphere"
import { Jornada } from "@/components/desafio/jornada"
import { OperacaoDeHoje } from "@/components/desafio/operacao"

/**
 * A casa do Desafio: a jornada à esquerda, o dia de hoje à direita.
 *
 * Uma decisão de produto que vale registrar: a missão NÃO abre em modal, como
 * no protótipo, e sim numa página própria (/desafio/dia/[n]). Três razões —
 * só o dia aberto viaja pela rede, em vez dos 22; o botão "voltar" do celular
 * faz o que a aluna espera; e o link é compartilhável, o que importa no dia em
 * que o suporte precisar mandar "abre o seu Dia 7". O efeito é o mesmo que o
 * protótipo buscava: uma coisa de cada vez, em tela cheia.
 */
export default async function DesafioPage() {
  const { email } = await requireDesafio()

  const [jornada, operacao, primeiroNome] = await Promise.all([
    getJornada(email),
    getOperacao(email),
    getMemberFirstName(email),
  ])

  const atual = diaAtual(jornada.concluidos)
  const dia = getDia(atual)
  const feitoHoje = jornada.concluidos.has(atual)
  const feitos = [...jornada.concluidos].filter((d) => d >= 1).length

  // O apelido que ELA escolheu na matrícula manda sobre o nome da Hotmart:
  // foi a primeira coisa que o Desafio perguntou, e ignorá-la depois seria
  // perguntar por educação.
  const apelido =
    (jornada.dias.get(0)?.respostas.apelido as string | undefined)?.trim() ||
    primeiroNome

  return (
    <main className="grain relative overflow-hidden px-4 pb-20 pt-6 sm:px-5 sm:pt-8">
      <Atmosphere variant="quiet" />

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-7 lg:grid-cols-[292px_1fr] lg:items-start lg:gap-9">
        {/* No celular a jornada desce. Uma lista de 22 dias antes da missão de
            hoje faz a aluna rolar para encontrar a única coisa que ela precisa
            fazer agora — e o que está no topo é o que ela entende como tarefa.
            Na tela larga a coluna volta para a esquerda, onde ela guia. */}
        <div
          className="order-2 min-w-0 animate-rise lg:order-1"
          style={{ "--d": "0ms" } as React.CSSProperties}
        >
          <Jornada
            concluidos={jornada.concluidos}
            atual={atual}
            empresasNoRadar={jornada.empresasNoRadar}
          />
        </div>

        <div
          className="order-1 flex min-w-0 flex-col gap-4 animate-rise sm:gap-5 lg:order-2"
          style={{ "--d": "90ms" } as React.CSSProperties}
        >
          {dia ? (
            feitoHoje ? (
              <TudoFeito
                titulo={dia.fim.titulo}
                amanha={dia.fim.amanha}
                n={atual}
                proximoEscrito={Boolean(getDia(atual + 1))}
                acabou={atual === TOTAL_DIAS}
              />
            ) : (
              <CartaoDoDia
                n={atual}
                kicker={dia.kicker}
                titulo={dia.titulo}
                lede={dia.lede}
                tempo={dia.tempo}
                passos={dia.passos.length}
                apelido={apelido}
                comecou={(jornada.dias.get(atual)?.passo ?? 0) > 0}
              />
            )
          ) : (
            <SemConteudo />
          )}

          {/* A operação vem ANTES dos acessos e DEPOIS da missão: a missão de
              hoje é o destino do dia; a operação é o que já está em campo. */}
          <OperacaoDeHoje operacao={operacao} />

          <AcessosPermanentes empresas={jornada.empresasNoRadar} />

          {feitos > 0 && (
            <p className="text-center text-xs text-muted-foreground">
              Você já concluiu {feitos} de {TOTAL_DIAS} dias. Pode rever qualquer um
              deles na lista ao lado — e editar o que escreveu.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}

/** O cartão do dia de hoje. É a única coisa que ela precisa fazer agora. */
function CartaoDoDia({
  n,
  kicker,
  titulo,
  lede,
  tempo,
  passos,
  apelido,
  comecou,
}: {
  n: number
  kicker: string
  titulo: string
  lede: string
  tempo: string
  passos: number
  apelido: string | null
  comecou: boolean
}) {
  return (
    <section className="relative flex flex-col items-start gap-3 overflow-hidden rounded-[22px] border border-border bg-card px-5 py-7 shadow-sm sm:rounded-[26px] sm:px-10 sm:py-9">
      <div aria-hidden className="card-sheen pointer-events-none absolute inset-0" />
      {/* O número do dia é marca d'água: no celular ele encolhe e encosta na
          borda, porque em tela estreita ele cairia por baixo do texto. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 select-none font-serif text-[clamp(84px,20vw,200px)] font-bold leading-none text-primary opacity-[0.1] sm:right-6 sm:opacity-[0.13]"
      >
        {n}
      </span>

      <p className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-primary">
        {kicker}
      </p>
      <h1 className="relative max-w-[17ch] font-serif text-[clamp(27px,3.6vw,38px)] font-bold leading-[1.08] text-foreground">
        {titulo}
      </h1>
      <p className="relative max-w-[44ch] text-base leading-relaxed text-muted-foreground">
        {apelido && n === 0 ? `${apelido}, ` : ""}
        {apelido && n === 0 ? lede.charAt(0).toLowerCase() + lede.slice(1) : lede}
      </p>

      <div className="relative mt-1 flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
        <span>{tempo}</span>
        <span aria-hidden>·</span>
        <span>
          {passos} {passos === 1 ? "etapa" : "etapas"}
        </span>
      </div>

      <Link
        href={`/desafio/dia/${n}`}
        className="relative mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:py-3"
      >
        {comecou ? "Continuar de onde parei" : n === 0 ? "Fazer minha matrícula" : "Começar a missão de hoje"}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

/**
 * "Você fez tudo hoje."
 *
 * Este estado existe porque sem ele a aluna que concluiu a missão voltaria à
 * mesma tela de antes e ficaria procurando o que mais fazer — e o Desafio é
 * feito para ser vivido um pouquinho por dia. Aqui a tela diz, com letras
 * grandes, que acabou: pode fechar e ir cuidar da vida dela.
 */
function TudoFeito({
  titulo,
  amanha,
  n,
  proximoEscrito,
  acabou,
}: {
  titulo: string
  amanha: string
  n: number
  proximoEscrito: boolean
  /** Dia 21 concluído: não existe "próximo dia", e dizer que existe seria mentir. */
  acabou: boolean
}) {
  return (
    <>
      <section className="relative flex flex-col items-start gap-3.5 overflow-hidden rounded-[22px] border border-primary/40 bg-gradient-to-br from-primary-subtle to-card px-5 py-8 sm:rounded-[26px] sm:px-10 sm:py-10">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground shadow-[0_0_0_12px_rgba(208,222,200,0.5)] sm:h-20 sm:w-20">
          <Check className="h-8 w-8 sm:h-9 sm:w-9" strokeWidth={2.6} />
        </span>
        <h1 className="max-w-[16ch] font-serif text-[clamp(28px,3.8vw,40px)] font-bold leading-[1.06] text-foreground">
          {titulo}
        </h1>
        <p className="max-w-[46ch] text-base leading-relaxed text-muted-foreground">
          {acabou
            ? "Os 21 dias acabaram. A sua operação não — ela continua amanhã, com o plano que você mesma definiu."
            : "Você fez o seu dia. Pode fechar o portal e ir cuidar da sua vida — amanhã eu te espero aqui."}
        </p>
        <Link
          href={`/desafio/dia/${n}`}
          className="self-start text-sm font-semibold text-primary underline decoration-1 underline-offset-[3px] hover:text-primary/80"
        >
          {acabou ? "Rever o meu plano de 30 dias" : "Rever o que eu fiz hoje"}
        </Link>
      </section>

      <section className="flex flex-col gap-1.5 rounded-[20px] border border-dashed border-border bg-card px-5 py-5 sm:px-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">
          {acabou ? "A partir de agora" : proximoEscrito ? "Amanhã" : "Em breve"}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">{amanha}</p>
        {/* Só promete um próximo dia quando ele pode existir. Depois do 21 não
            existe Dia 22, e dizer "em breve" ali transformaria a formatura em
            sala de espera. */}
        {!proximoEscrito && !acabou && (
          <p className="mt-1 text-xs text-muted-foreground">
            O próximo dia ainda está sendo preparado. Assim que ele abrir, aparece aqui.
          </p>
        )}
      </section>
    </>
  )
}

/** Nenhum dia escrito ainda. Não deveria acontecer em produção. */
function SemConteudo() {
  return (
    <section className="rounded-[22px] border border-border bg-card px-5 py-8 sm:rounded-[26px] sm:px-8 sm:py-10">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Seu Desafio está sendo preparado.
      </h1>
      <p className="mt-3 max-w-[44ch] text-sm leading-relaxed text-muted-foreground">
        Assim que o primeiro dia abrir, ele aparece aqui. Pode fechar essa página
        tranquila — a gente te avisa.
      </p>
    </section>
  )
}

/**
 * Os acessos que acompanham a aluna por toda a formação.
 *
 * Biblioteca e B.IA ainda não existem como ambiente, e aparecem dizendo isso
 * em vez de como botão que não leva a nada: a aluna precisa poder confiar que
 * o que está clicável funciona. "Fechei meu primeiro contrato" tem mais
 * destaque que os outros, como o documento pede, e hoje leva ao suporte — que
 * é, de fato, quem conduz a Central Primeiro Contrato.
 */
function AcessosPermanentes({ empresas }: { empresas: number }) {
  return (
    <section aria-label="Seus acessos" className="flex flex-col gap-2.5">
      <a
        href={SUPPORT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center gap-3.5 overflow-hidden rounded-2xl border border-secondary/40 bg-secondary-subtle px-4 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md sm:px-5"
      >
        <PartyPopper className="h-5 w-5 flex-none text-secondary" />
        <span className="min-w-0 flex-1">
          <b className="block text-sm font-bold text-foreground">
            Fechei meu primeiro contrato
          </b>
          <small className="block text-xs text-muted-foreground">
            Fechou? Não importa em que dia você está. Clique aqui.
          </small>
        </span>
        <ArrowRight className="h-4 w-4 flex-none text-secondary transition-transform group-hover:translate-x-0.5" />
      </a>

      <div className="grid gap-2.5 sm:grid-cols-2">
        <Link
          href="/desafio/radar"
          className="group flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 transition-all duration-300 hover:border-primary/45 hover:shadow-md"
        >
          <Target className="h-4.5 w-4.5 flex-none text-primary" />
          <span className="min-w-0 flex-1">
            <b className="block text-[13px] font-semibold text-foreground">Radar</b>
            <small className="block text-[11.5px] text-muted-foreground">
              {empresas === 0
                ? "Suas empresas e oportunidades"
                : `${empresas} ${empresas === 1 ? "empresa" : "empresas"} de 100`}
            </small>
          </span>
          <ArrowRight className="h-3.5 w-3.5 flex-none text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        </Link>

        <EmBreve
          icone={<BookOpen className="h-4.5 w-4.5 flex-none text-muted-foreground" />}
          titulo="Biblioteca"
          sub="Aprofundar meus estudos"
        />
        <EmBreve
          icone={<Sparkles className="h-4.5 w-4.5 flex-none text-muted-foreground" />}
          titulo="B.IA"
          sub="Minha assistente de execução"
        />
      </div>
    </section>
  )
}

function EmBreve({
  icone,
  titulo,
  sub,
}: {
  icone: React.ReactNode
  titulo: string
  sub: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-4 py-3.5">
      {icone}
      <span className="min-w-0 flex-1">
        <b className="block text-[13px] font-semibold text-muted-foreground">{titulo}</b>
        <small className="block text-[11.5px] text-muted-foreground">{sub}</small>
      </span>
      <span className="flex-none text-[9.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
        em breve
      </span>
    </div>
  )
}
