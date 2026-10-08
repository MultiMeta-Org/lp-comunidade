import type { Dia, Passo, Respostas } from "./tipos"
import { dia00 } from "./dias/dia-00"
import { dia01 } from "./dias/dia-01"
import { dia02 } from "./dias/dia-02"
import { dia03 } from "./dias/dia-03"
import { dia04 } from "./dias/dia-04"
import { dia05 } from "./dias/dia-05"
import { dia06 } from "./dias/dia-06"
import { dia07 } from "./dias/dia-07"
import { dia08 } from "./dias/dia-08"
import { dia09 } from "./dias/dia-09"
import { dia10 } from "./dias/dia-10"
import { dia11 } from "./dias/dia-11"
import { dia12 } from "./dias/dia-12"
import { dia13 } from "./dias/dia-13"
import { dia14 } from "./dias/dia-14"
import { dia15 } from "./dias/dia-15"
import { dia16 } from "./dias/dia-16"
import { dia17 } from "./dias/dia-17"
import { dia18 } from "./dias/dia-18"
import { dia19 } from "./dias/dia-19"
import { dia20 } from "./dias/dia-20"
import { dia21 } from "./dias/dia-21"

export * from "./tipos"

/**
 * O conteúdo do Desafio 21 Dias, dia por dia.
 *
 * O registro é um mapa, e não um array, por um motivo prático: dia que ainda
 * não foi escrito simplesmente não está aqui, e a jornada o mostra como "em
 * breve" em vez de uma missão vazia. Assim o conteúdo entra um dia por vez,
 * conforme a Nati grava, sem nenhum dia fantasma no meio.
 */
const DIAS: Record<number, Dia> = {
  0: dia00,
  1: dia01,
  2: dia02,
  3: dia03,
  4: dia04,
  5: dia05,
  6: dia06,
  7: dia07,
  8: dia08,
  9: dia09,
  10: dia10,
  11: dia11,
  12: dia12,
  13: dia13,
  14: dia14,
  15: dia15,
  16: dia16,
  17: dia17,
  18: dia18,
  19: dia19,
  20: dia20,
  21: dia21,
}

/** Dias de missão. O Dia Zero é a matrícula e não entra na conta dos 21. */
export const TOTAL_DIAS = 21

/** Todos os números da jornada, do Dia Zero ao 21 — inclusive os não escritos. */
export const NUMEROS_DOS_DIAS = Array.from({ length: TOTAL_DIAS + 1 }, (_, i) => i)

export function getDia(n: number): Dia | null {
  return DIAS[n] ?? null
}

/** Dia existe e tem passos — ou seja, dá para abrir a missão. */
export function diaDisponivel(n: number): boolean {
  const dia = DIAS[n]
  return Boolean(dia && dia.passos.length > 0)
}

/**
 * O último passo de um dia fecha a missão, e o botão dele diz isso. Os outros
 * dizem "Continuar". O `cta` declarado no passo sempre ganha: há passos cujo
 * botão é a própria ação ("Salvar minha primeira empresa").
 */
export function rotuloDoBotao(passo: Passo, ultimo: boolean): string {
  if (passo.cta) return passo.cta
  return ultimo ? "Concluir minha missão de hoje" : "Continuar"
}

/**
 * Um passo que a aluna pode atravessar sem responder nada.
 *
 * O interesse no Closer Presencial é o caso que existe hoje: levantar a mão
 * para um evento não é missão, e travar o dia nisso transformaria uma oferta
 * em pedágio.
 */
export function passoOpcional(passo: Passo): boolean {
  return passo.tipo === "interesse"
}

/**
 * Qual dia a aluna deve abrir ao entrar no Desafio.
 *
 * O primeiro não concluído, limitado ao último disponível — ela não "pula"
 * para um dia sem conteúdo nem volta para o começo depois de concluir tudo.
 * A regra é a mesma do documento: um dia por vez, e a próxima ação sempre
 * visível.
 */
export function diaAtual(concluidos: ReadonlySet<number>): number {
  for (const n of NUMEROS_DOS_DIAS) {
    if (!concluidos.has(n) && diaDisponivel(n)) return n
  }
  // Tudo que existe já foi feito: fica no último escrito, que é onde ela
  // acabou de estar — e não num dia em branco com cara de erro.
  const escritos = NUMEROS_DOS_DIAS.filter(diaDisponivel)
  return escritos[escritos.length - 1] ?? 0
}

/**
 * A aluna pode abrir este dia?
 *
 * Sim se já concluiu (revisão — o documento pede que os dias anteriores sejam
 * revisitáveis e editáveis) ou se é o dia atual dela. Não dá para correr na
 * frente: o Desafio é feito para ser vivido um pouquinho por dia, e liberar
 * tudo de uma vez o transformaria em curso para maratonar.
 */
export function podeAbrir(n: number, concluidos: ReadonlySet<number>): boolean {
  if (!diaDisponivel(n)) return false
  return concluidos.has(n) || n === diaAtual(concluidos)
}

/**
 * As chaves de resposta que este dia pode gravar.
 *
 * Existe porque Server Actions são alcançáveis por POST direto, não só pela
 * interface: sem isso, qualquer um com sessão poderia despejar jsonb arbitrário
 * em `desafio_progresso.respostas` e envenenar as views do dashboard interno
 * (que leem por chave). O dia declara suas perguntas; o resto não entra.
 */
export function chavesDoDia(dia: Dia): Set<string> {
  const chaves = new Set<string>()
  for (const passo of dia.passos) {
    switch (passo.tipo) {
      case "formulario":
        for (const campo of passo.campos) chaves.add(campo.chave)
        break
      case "empresa":
        // As respostas de um passo `empresa` vão para desafio_radar.notas, não
        // para o progresso. O que fica no progresso é só QUAIS empresas ela
        // percorreu, para a missão saber de quem ela estava falando — e para o
        // passo saber que já terminou.
        chaves.add(`${passo.chave}:empresas`)
        break
      // Vídeo, leitura, confirmação, cópia, radar e interesse gravam apenas a
      // marca de que o passo foi vencido — o avanço do `passo` já é isso. A
      // confirmação e a cópia guardam o aceite, porque é o que a aluna
      // declarou ter feito, e isso é a missão dela.
      case "confirma":
      case "copiar":
      case "diagnostico":
        chaves.add(passo.chave)
        break
      default:
        break
    }
  }
  return chaves
}

/** Teto de tamanho de uma resposta de texto. Campo aberto não é depósito. */
const MAX_TEXTO = 4000

/**
 * Deixa passar só o que este dia pergunta, no formato que ele pergunta.
 *
 * Descarta chave desconhecida em silêncio em vez de recusar a gravação
 * inteira: um passo novo no código com resposta antiga no navegador da aluna é
 * caso real, e perder a missão dela por causa disso seria o pior desfecho
 * possível.
 */
export function filtrarRespostas(
  dia: Dia,
  entrada: Record<string, unknown>
): Respostas {
  const permitidas = chavesDoDia(dia)
  const saida: Respostas = {}

  for (const [chave, valor] of Object.entries(entrada)) {
    if (!permitidas.has(chave)) continue

    if (typeof valor === "string") {
      saida[chave] = valor.slice(0, MAX_TEXTO)
    } else if (typeof valor === "boolean" || typeof valor === "number") {
      saida[chave] = valor
    } else if (Array.isArray(valor)) {
      // Múltipla escolha. O teto de 40 é folgado para qualquer pergunta do
      // Desafio e fecha a porta de um array de mil itens.
      saida[chave] = valor
        .filter((v): v is string => typeof v === "string")
        .slice(0, 40)
        .map((v) => v.slice(0, MAX_TEXTO))
    }
  }
  return saida
}

/** Teto por aluna no Radar. A meta do Desafio é 100; o dobro é folga, não meta. */
export const MAX_EMPRESAS_NO_RADAR = 200
