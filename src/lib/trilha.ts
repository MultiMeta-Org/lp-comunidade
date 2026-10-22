// A trilha (breadcrumbs) do portal — client-safe.

import { LAB_NAME, MATERIAL_NAME, PLANTAO_NAME } from "@/lib/produto"

/** Um passo da trilha. Sem `href`, é só rótulo (o atual, ou uma área sem página). */
export type Passo = { label: string; href?: string }

const ADMIN: Record<string, string> = {
  acessos: "Acessos",
  aulas: "Aulas",
  desafio: "Desafio",
  banners: "Banners",
}

/**
 * A trilha que sai só da URL — Desafio e Admin, onde o caminho já diz tudo.
 * As páginas cujo rótulo depende da aluna ou do banco (o acervo de aulas, uma
 * aula) passam a trilha pronta para o SiteHeader. O Início não entra: é a
 * casinha que abre toda trilha, e a home não tem trilha nenhuma.
 */
export function trilhaDaRota(pathname: string): Passo[] {
  const partes = pathname.split("/").filter(Boolean)

  if (partes[0] === "desafio") {
    const trilha: Passo[] = [{ label: "Desafio 21 Dias", href: "/desafio" }]
    if (partes[1] === "dia" && partes[2] !== undefined) {
      const n = Number(partes[2])
      trilha.push({ label: n === 0 ? "Matrícula" : `Dia ${n}` })
    } else if (partes[1] === "biblioteca") {
      trilha.push({ label: "Biblioteca" })
    } else if (partes[1] === "radar") {
      trilha.push({ label: "Meu Radar" })
    }
    return trilha
  }

  if (partes[0] === "admin") {
    const trilha: Passo[] = [{ label: "Admin", href: "/admin" }]
    const secao = partes[1] && ADMIN[partes[1]]
    if (secao) trilha.push({ label: secao, href: `/admin/${partes[1]}` })
    if (partes[1] === "aulas" && partes[2]) trilha.push({ label: "Progresso da aula" })
    return trilha
  }

  return []
}

/**
 * A trilha do acervo de aulas. O Laboratório (ou o Método, para quem só tem o
 * Plantão) não tem página própria — é uma seção da home —, então entra como
 * rótulo, sem link: diz de onde aquilo é sem prometer uma página que não há.
 */
export function trilhaDasAulas(scope: "lab" | "aberto", aula?: string): Passo[] {
  const trilha: Passo[] =
    scope === "lab"
      ? [{ label: LAB_NAME }, { label: MATERIAL_NAME, href: "/aulas" }]
      : [{ label: "Método EVP" }, { label: PLANTAO_NAME, href: "/aulas" }]
  return aula ? [...trilha, { label: aula }] : trilha
}
