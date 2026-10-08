import Link from "next/link"
import { TOTAL_DIAS } from "@/lib/desafio"
import {
  getAlunas,
  getPainelDoDesafio,
  type Aluna,
  type OrdemDasAlunas,
  type Ranking,
} from "@/lib/desafio-admin"

export const metadata = { title: "Desafio 21 Dias · Admin" }

const ORDENS: { chave: OrdemDasAlunas; label: string }[] = [
  { chave: "paradas", label: "Quem parou" },
  { chave: "recentes", label: "Mexeram agora" },
  { chave: "avancadas", label: "Mais avançadas" },
]

/**
 * O painel do Desafio 21 Dias.
 *
 * A ordem dos blocos é uma decisão de produto, não estética: começa pelo FUNIL
 * DOS 21 DIAS, porque a pergunta que a Nati traz para esta tela é "onde as
 * alunas estão parando?" — e termina no perfil da base, que é pesquisa, não
 * operação. O documento pede o painel de perfil; a experiência de quem vai
 * abrir isso todo dia pede a fila do suporte primeiro.
 */
export default async function AdminDesafioPage({
  searchParams,
}: {
  searchParams: Promise<{ ordem?: string }>
}) {
  const { ordem: ordemRaw } = await searchParams
  const ordem: OrdemDasAlunas = ORDENS.some((o) => o.chave === ordemRaw)
    ? (ordemRaw as OrdemDasAlunas)
    : "paradas"

  const [painel, alunas] = await Promise.all([
    getPainelDoDesafio(),
    getAlunas(ordem),
  ])
  const { visaoGeral: g, funil, comercial } = painel

  if (g.comAcesso === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card px-8 py-10">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          Desafio 21 Dias
        </h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
          Nenhuma aluna tem o Desafio ainda. O produto libera por compra na Hotmart
          (quando o id estiver cadastrado em <code>desafio_products</code>) ou por
          cortesia, na coluna &ldquo;Desafio&rdquo; de{" "}
          <Link href="/admin/acessos" className="text-primary underline underline-offset-2">
            Acessos
          </Link>
          .
        </p>
      </section>
    )
  }

  return (
    <>
      {/* ── Visão geral ── */}
      <section className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Desafio 21 Dias
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Onde as alunas estão, o que elas construíram e quem precisa de você hoje.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Numero
            valor={g.comAcesso}
            label="Alunas com o Desafio"
            nota="ativas, com o produto"
            href="/admin/acessos?desafio=sim"
          />
          <Numero
            valor={g.matriculaConcluida}
            label="Matrículas concluídas"
            nota={
              g.comecaramMatricula > 0
                ? `${g.comecaramMatricula} começaram · ${pct(g.matriculaConcluida, g.comecaramMatricula)} terminaram`
                : "ninguém começou ainda"
            }
          />
          <Numero
            valor={g.idadeMedia ?? "—"}
            label="Idade média"
            nota={`${g.ufs} ${g.ufs === 1 ? "estado" : "estados"}`}
          />
          <Numero
            valor={g.maes}
            label="São mães"
            nota={
              g.filhosMedia
                ? `${g.filhosMedia} filhos em média`
                : "sem dado de filhos ainda"
            }
          />
        </div>
      </section>

      {/* ── O funil dos 21 dias ── */}
      <section className="space-y-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">
            O funil dos 21 dias
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <b className="text-foreground">Travadas</b> é quem abriu o dia e não
            concluiu. É a fila de quem está parada ali agora.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Dia</th>
                <th className="px-4 py-3 font-semibold">Abriram</th>
                <th className="px-4 py-3 font-semibold">Concluíram</th>
                <th className="px-4 py-3 font-semibold">Travadas</th>
                <th className="px-4 py-3 font-semibold">Chegada</th>
              </tr>
            </thead>
            <tbody>
              {funil.map((l) => (
                <tr key={l.dia} className="border-b border-border last:border-0">
                  <td className="px-4 py-2.5">
                    <span className="font-semibold text-foreground">
                      {l.dia === 0 ? "Dia 0" : `Dia ${l.dia}`}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {l.titulo}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.abriram}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.concluiram}</td>
                  <td className="px-4 py-2.5">
                    {l.travadas > 0 ? (
                      <span className="rounded px-2 py-0.5 text-[11px] font-semibold bg-warning-subtle text-warning-foreground">
                        {l.travadas}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <Barra
                      pct={g.comAcesso > 0 ? (l.abriram / g.comAcesso) * 100 : 0}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── O que a base construiu ── */}
      <section className="space-y-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">
            O que a base construiu
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            A soma do funil comercial de todas as alunas.{" "}
            <b className="text-foreground">No radar</b> são empresas encontradas;{" "}
            <b className="text-foreground">abordadas</b> são aquelas com quem elas
            efetivamente falaram.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Numero valor={comercial.noRadar} label="No radar" compacto />
          <Numero valor={comercial.abordadas} label="Abordadas" compacto />
          <Numero valor={comercial.emConversa} label="Em conversa" compacto />
          <Numero valor={comercial.reunioes} label="Reuniões" compacto />
          <Numero valor={comercial.propostas} label="Propostas" compacto />
          <Numero valor={comercial.fechados} label="Contratos" compacto destaque />
        </div>
      </section>

      {/* ── Transformação ── */}
      {painel.transformacao.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Entrada → saída
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              As mesmas três notas de 0 a 10 da matrícula, respondidas de novo no
              Dia 21. A coluna de saída só enche quando as alunas chegarem lá.
            </p>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-semibold">Indicador</th>
                  <th className="px-4 py-3 font-semibold">Dia 0</th>
                  <th className="px-4 py-3 font-semibold">Dia 21</th>
                  <th className="px-4 py-3 font-semibold">Evolução</th>
                  <th className="px-4 py-3 font-semibold">Responderam</th>
                </tr>
              </thead>
              <tbody>
                {painel.transformacao.map((t) => (
                  <tr key={t.indicador} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 font-medium text-foreground">
                      {t.indicador}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {t.entrada ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {t.saida ?? "—"}
                    </td>
                    <td className="px-4 py-2.5">
                      {t.evolucao === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span
                          className={`font-semibold ${t.evolucao >= 0 ? "text-primary" : "text-destructive"}`}
                        >
                          {t.evolucao > 0 ? "+" : ""}
                          {t.evolucao}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {t.respondentes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── Alunas ── */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">Alunas</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Abre em &ldquo;quem parou&rdquo;: quem mexeu há mais tempo e ainda não
              terminou.
            </p>
          </div>
          <nav className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/60 p-1">
            {ORDENS.map((o) => (
              <Link
                key={o.chave}
                href={`/admin/desafio?ordem=${o.chave}`}
                // Sem isto o Next rola para o topo a cada troca de aba, e a
                // lista que a pessoa estava lendo sai da tela. Trocar a ordem
                // de uma lista não é navegar para outro lugar.
                scroll={false}
                aria-current={ordem === o.chave ? "page" : undefined}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  ordem === o.chave
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                {o.label}
              </Link>
            ))}
          </nav>
        </div>
        <TabelaDeAlunas alunas={alunas} />
      </section>

      {/* ── Interesses ── */}
      {painel.interesses.length > 0 && (
        <section className="space-y-4">
          <div>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Quem levantou a mão
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Interesses declarados dentro das missões. É a lista para falar com
              quem pediu, em vez de anunciar para a base inteira.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {painel.interesses.map((i) => (
              <div
                key={i.nome}
                className="space-y-3 rounded-xl border border-border bg-card px-5 py-4"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <b className="text-sm font-semibold text-foreground">{i.nome}</b>
                  <span className="font-serif text-xl font-bold text-secondary">
                    {i.total}
                  </span>
                </div>
                <ListaDeRanking itens={i.detalhe} total={i.total} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Perfil da base ── */}
      <section className="space-y-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-foreground">
            Perfil da base
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Tudo isto vem de pergunta estruturada na matrícula, não de IA lendo
            texto aberto.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Bloco titulo="Principais motivações" itens={painel.motivos} />
          <Bloco titulo="Principais dores" itens={painel.dores} />
          {painel.distribuicoes.map((d) => (
            <Bloco key={d.campo} titulo={d.campo} itens={d.itens} />
          ))}
        </div>
      </section>
    </>
  )
}

function pct(parte: number, total: number): string {
  if (total === 0) return "0%"
  return `${Math.round((parte / total) * 100)}%`
}

function Numero({
  valor,
  label,
  nota,
  href,
  compacto = false,
  destaque = false,
}: {
  valor: number | string
  label: string
  nota?: string
  href?: string
  compacto?: boolean
  destaque?: boolean
}) {
  const corpo = (
    <>
      <span
        className={`font-serif font-bold leading-none ${compacto ? "text-2xl" : "text-3xl"} ${
          destaque && valor !== 0 ? "text-primary" : "text-foreground"
        }`}
      >
        {valor}
      </span>
      <span className="mt-1.5 block text-xs font-semibold text-foreground">
        {label}
      </span>
      {nota && (
        <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">
          {nota}
        </span>
      )}
    </>
  )

  const classe = `block rounded-xl border border-border bg-card px-4 py-4 ${
    href ? "transition-colors hover:border-primary/45" : ""
  }`

  return href ? (
    <Link href={href} className={classe}>
      {corpo}
    </Link>
  ) : (
    <div className={classe}>{corpo}</div>
  )
}

function Barra({ pct }: { pct: number }) {
  return (
    <span className="block h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-muted">
      <span
        className="block h-full rounded-full bg-primary"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </span>
  )
}

function Bloco({ titulo, itens }: { titulo: string; itens: Ranking[] }) {
  if (itens.length === 0) return null
  const total = itens.reduce((s, i) => s + i.alunas, 0)
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card px-5 py-4">
      <b className="block text-sm font-semibold text-foreground">{titulo}</b>
      <ListaDeRanking itens={itens} total={total} />
    </div>
  )
}

function ListaDeRanking({ itens, total }: { itens: Ranking[]; total: number }) {
  return (
    <ul className="space-y-2">
      {itens.map((i) => (
        <li key={i.rotulo} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-xs">
            <span className="min-w-0 flex-1 text-muted-foreground">{i.rotulo}</span>
            <span className="flex-none font-semibold text-foreground">
              {i.alunas}
              <span className="ml-1 font-normal text-muted-foreground">
                · {i.pct !== null ? `${i.pct}%` : pct(i.alunas, total)}
              </span>
            </span>
          </div>
          <Barra pct={i.pct ?? (total > 0 ? (i.alunas / total) * 100 : 0)} />
        </li>
      ))}
    </ul>
  )
}

function TabelaDeAlunas({ alunas }: { alunas: Aluna[] }) {
  if (alunas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card px-5 py-6 text-center text-sm text-muted-foreground">
        Nenhuma aluna nesse recorte.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-4 py-3 font-semibold">Aluna</th>
            <th className="px-4 py-3 font-semibold">Progresso</th>
            <th className="px-4 py-3 font-semibold">Parou em</th>
            <th className="px-4 py-3 font-semibold">Radar</th>
            <th className="px-4 py-3 font-semibold">Abordou</th>
            <th className="px-4 py-3 font-semibold">Conversas</th>
            <th className="px-4 py-3 font-semibold">Fechou</th>
            <th className="px-4 py-3 font-semibold">Mexeu</th>
          </tr>
        </thead>
        <tbody>
          {alunas.map((a) => (
            <tr key={a.email} className="border-b border-border last:border-0">
              <td className="px-4 py-2.5">
                <div className="font-medium text-foreground">
                  {a.nome ?? a.email}
                  {a.uf && (
                    <span className="ml-1.5 text-[11px] text-muted-foreground">
                      {a.uf}
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">{a.email}</div>
              </td>
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {a.diasConcluidos}/{TOTAL_DIAS + 1}
                  </span>
                  <Barra pct={(a.diasConcluidos / (TOTAL_DIAS + 1)) * 100} />
                </div>
                {!a.matriculaConcluida && (
                  <span className="mt-0.5 block text-[11px] text-warning-foreground">
                    matrícula incompleta
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {a.ultimoDiaAberto === null ? "não abriu" : `Dia ${a.ultimoDiaAberto}`}
              </td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.noRadar}</td>
              <td className="px-4 py-2.5 text-muted-foreground">{a.abordadas}</td>
              <td className="px-4 py-2.5 text-muted-foreground">
                {a.emConversa}
                {a.reunioes > 0 && (
                  <span className="ml-1.5 rounded bg-primary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                    {a.reunioes} reun.
                  </span>
                )}
                {a.propostas > 0 && (
                  <span className="ml-1.5 rounded bg-secondary-subtle px-1.5 py-0.5 text-[10px] font-semibold text-secondary">
                    {a.propostas} prop.
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5">
                {a.fechados > 0 ? (
                  <span className="rounded bg-primary px-2 py-0.5 text-[11px] font-bold text-primary-foreground">
                    {a.fechados}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-4 py-2.5 text-xs text-muted-foreground">
                {a.atualizadoEm ? quando(a.atualizadoEm) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** "há 3 dias" diz mais que "05/10" para decidir quem cobrar hoje. */
function quando(iso: string): string {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000)
  if (dias <= 0) return "hoje"
  if (dias === 1) return "ontem"
  if (dias < 30) return `há ${dias} dias`
  return new Date(iso).toLocaleDateString("pt-BR")
}
