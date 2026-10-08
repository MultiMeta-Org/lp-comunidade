"use server"

import { refresh } from "next/cache"
import { requireDesafio } from "@/lib/guard"
import {
  MAX_EMPRESAS_NO_RADAR,
  filtrarRespostas,
  getDia,
  podeAbrir,
  type Respostas,
} from "@/lib/desafio"
import {
  addEmpresa,
  arquivarEmpresa,
  concluirDia,
  getJornada,
  getRadar,
  registrarInteresse,
  salvarNotasDaEmpresa,
  moverStatus,
  salvarPasso,
  type Empresa,
} from "@/lib/desafio-server"

/**
 * Gravações da missão.
 *
 * Três coisas valem para TODAS as actions deste arquivo, e são o motivo de
 * elas existirem em vez de o cliente falar com o banco:
 *
 *   1. o e-mail sai do guard, NUNCA do cliente — é o que impede um POST de
 *      gravar missão no nome de outra aluna;
 *   2. o dia é relido do conteúdo e checado contra o progresso dela, porque
 *      Server Actions são alcançáveis por POST direto: sem isso daria para
 *      concluir o Dia 14 no primeiro dia, bastando um fetch;
 *   3. as respostas passam por `filtrarRespostas`, que só deixa entrar as
 *      chaves que aquele dia pergunta.
 */

export type ActionResult = { ok: boolean; error?: string }

/**
 * Checa que esta aluna pode mexer NESTE dia e devolve o conteúdo dele.
 *
 * Dia concluído continua liberado: o documento pede que os anteriores sejam
 * revisitáveis e editáveis. O que não se pode é correr na frente.
 */
async function abrirDia(n: number) {
  const { email } = await requireDesafio()

  const dia = getDia(n)
  if (!dia) return { erro: "Esse dia ainda não existe." as const }

  const jornada = await getJornada(email)
  if (!podeAbrir(n, jornada.concluidos)) {
    return { erro: "Esse dia ainda não está liberado para você." as const }
  }
  return { email, dia, jornada }
}

/** Avança um passo da missão, guardando o que ela respondeu até aqui. */
export async function salvarPassoAction(
  n: number,
  passo: number,
  respostas: Record<string, unknown>
): Promise<ActionResult> {
  const ctx = await abrirDia(n)
  if ("erro" in ctx) return { ok: false, error: ctx.erro }

  // O passo é fixado nos limites do dia: um número fora disso deixaria o
  // progresso dela apontando para um passo que não existe.
  const limite = Math.max(0, Math.min(passo, ctx.dia.passos.length))

  const error = await salvarPasso(
    ctx.email,
    n,
    limite,
    filtrarRespostas(ctx.dia, respostas)
  )
  if (error) return { ok: false, error: "Não consegui salvar agora. Tenta de novo?" }
  return { ok: true }
}

/** Conclui o dia. */
export async function concluirDiaAction(
  n: number,
  respostas: Record<string, unknown>
): Promise<ActionResult> {
  const ctx = await abrirDia(n)
  if ("erro" in ctx) return { ok: false, error: ctx.erro }

  const error = await concluirDia(ctx.email, n, filtrarRespostas(ctx.dia, respostas))
  if (error) return { ok: false, error: "Não consegui concluir agora. Tenta de novo?" }

  // A jornada (anel, selos, próximo dia) vive na página de fora.
  refresh()
  return { ok: true }
}

export type EmpresaResult =
  | { ok: true; empresa: Empresa }
  | { ok: false; error: string; duplicada?: boolean }

/**
 * Cadastra uma empresa no Radar.
 *
 * O Radar é vivo: aceita empresa em qualquer dia, não só no Dia 3 — ela pode
 * estar no Dia 8, lembrar de uma empresa e cadastrar. Por isso a action não
 * exige que `n` seja o dia atual; `n` só marca de onde a empresa veio.
 */
export async function addEmpresaAction(entrada: {
  dia?: number
  nome: string
  segmento?: string
  contato?: string
  origem?: string
}): Promise<EmpresaResult> {
  const { email } = await requireDesafio()

  const radar = await getRadar(email)
  if (radar.length >= MAX_EMPRESAS_NO_RADAR) {
    return {
      ok: false,
      error: `Seu Radar já tem ${radar.length} empresas. Isso é muito mais que a meta.`,
    }
  }

  const res = await addEmpresa(email, {
    nome: entrada.nome,
    segmento: entrada.segmento,
    contato: entrada.contato,
    origem: entrada.origem,
    diaOrigem: typeof entrada.dia === "number" ? entrada.dia : null,
  })
  if (res.ok) refresh()
  return res
}

/** Tira a empresa do Radar (soft delete — as missões que a citam não ficam órfãs). */
export async function arquivarEmpresaAction(id: string): Promise<ActionResult> {
  const { email } = await requireDesafio()
  const error = await arquivarEmpresa(email, id)
  if (error) return { ok: false, error: "Não consegui tirar agora. Tenta de novo?" }
  refresh()
  return { ok: true }
}

/**
 * Guarda as respostas de uma missão ligadas a uma empresa.
 *
 * Vão para `desafio_radar.notas`, agrupadas por dia, e não para as colunas do
 * Radar: "acho que essa empresa poderia fazer follow-up" é hipótese de
 * exercício, não fato sobre a empresa.
 */
export async function salvarNotasAction(
  n: number,
  empresaId: string,
  notas: Record<string, unknown>,
  acao?: { proxima?: string; proximaEm?: string }
): Promise<ActionResult> {
  const ctx = await abrirDia(n)
  if ("erro" in ctx) return { ok: false, error: ctx.erro }

  // As chaves das notas são as dos campos do passo `empresa` daquele dia.
  const permitidas = new Set<string>()
  for (const passo of ctx.dia.passos) {
    if (passo.tipo === "empresa") {
      for (const campo of passo.campos) permitidas.add(campo.chave)
    }
  }
  const limpas: Respostas = {}
  for (const [chave, valor] of Object.entries(notas)) {
    if (!permitidas.has(chave)) continue
    if (typeof valor === "string") limpas[chave] = valor.slice(0, 4000)
    else if (typeof valor === "boolean" || typeof valor === "number") limpas[chave] = valor
    else if (Array.isArray(valor)) {
      limpas[chave] = valor
        .filter((v): v is string => typeof v === "string")
        .slice(0, 40)
        .map((v) => v.slice(0, 4000))
    }
  }

  const error = await salvarNotasDaEmpresa(ctx.email, empresaId, n, limpas)
  if (error) return { ok: false, error: "Não consegui salvar agora. Tenta de novo?" }

  /**
   * O estágio sai do CONTEÚDO do dia, nunca do cliente: terminar a rodada do
   * Dia 7 É ter mandado a abordagem. Se o cliente escolhesse o status, um POST
   * marcaria qualquer empresa como "fechado" e contaminaria o placar.
   */
  const comStatus = ctx.dia.passos.find(
    (p) => p.tipo === "empresa" && p.defineStatus !== undefined
  )
  const proxima = acao?.proxima?.trim().slice(0, 300) || undefined
  // `proxima_acao_em` é `date` no banco: só aceita AAAA-MM-DD. Qualquer outra
  // coisa iria como texto inválido e derrubaria o update inteiro.
  const proximaEm =
    acao?.proximaEm && /^\d{4}-\d{2}-\d{2}$/.test(acao.proximaEm)
      ? acao.proximaEm
      : undefined

  if (
    (comStatus?.tipo === "empresa" && comStatus.defineStatus) ||
    proxima ||
    proximaEm
  ) {
    const status =
      comStatus?.tipo === "empresa" ? comStatus.defineStatus : undefined
    await moverStatus(ctx.email, empresaId, status, {
      ultima: `Dia ${n}`,
      proxima,
      proximaEm,
    })
  }

  return { ok: true }
}

/**
 * Registra que a aluna levantou a mão para algo (hoje: o Closer Presencial).
 *
 * O interesse só é aceito se algum dia do Desafio o oferece — senão esta action
 * seria uma porta aberta para gravar qualquer linha em `desafio_interesses`.
 */
export async function registrarInteresseAction(
  n: number,
  interesse: string,
  resposta: string | null
): Promise<ActionResult> {
  const ctx = await abrirDia(n)
  if ("erro" in ctx) return { ok: false, error: ctx.erro }

  const passo = ctx.dia.passos.find(
    (p) => p.tipo === "interesse" && p.interesse === interesse
  )
  if (!passo || passo.tipo !== "interesse") {
    return { ok: false, error: "Esse interesse não existe neste dia." }
  }
  // A resposta precisa ser uma das opções oferecidas.
  const valida =
    resposta === null || passo.opcoes.includes(resposta) ? resposta : null

  const error = await registrarInteresse(ctx.email, interesse, valida)
  if (error) return { ok: false, error: "Não consegui registrar agora. Tenta de novo?" }
  return { ok: true }
}
