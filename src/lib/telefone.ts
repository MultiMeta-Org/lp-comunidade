// Telefone brasileiro: máscara enquanto digita e validação — client-safe.
//
// O mesmo arquivo serve o campo (máscara + aviso) e a action (que revalida e
// grava já formatado): a regra não pode existir em dois lugares.

/** Só os dígitos, sem o 55 do país quando ela cola um número com DDI. */
function digitosNacionais(valor: string): string {
  const d = valor.replace(/\D/g, "")
  return d.length > 11 && d.startsWith("55") ? d.slice(2) : d
}

/**
 * Formata conforme ela digita: `11` → `(11`, `1198765` → `(11) 98765`,
 * `11987654321` → `(11) 98765-4321`, fixo `1133334444` → `(11) 3333-4444`.
 * O hífen acompanha o tamanho: com 10 dígitos fica depois do 4º do número;
 * com 11, depois do 5º.
 */
export function formatarTelefone(valor: string): string {
  const d = digitosNacionais(valor).slice(0, 11)
  if (d.length === 0) return ""
  if (d.length <= 2) return `(${d}`
  const ddd = d.slice(0, 2)
  const numero = d.slice(2)
  if (numero.length <= 4) return `(${ddd}) ${numero}`
  const corte = numero.length === 9 ? 5 : 4
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`
}

/**
 * O que está errado no telefone — ou null se está ok. Vazio é ok: o campo é
 * opcional.
 *
 * Regras (Anatel): DDD de 11 a 99 sem zero; celular tem 9 dígitos e começa
 * com 9; fixo tem 8 e começa de 2 a 5.
 */
export function problemaNoTelefone(valor: string): string | null {
  const d = digitosNacionais(valor)
  if (d.length === 0) return null
  if (d.length < 10) return "Faltam números. Coloque o DDD e o número completo."
  if (d.length > 11) return "Esse número tem dígitos a mais."
  if (d[0] === "0" || d[1] === "0") return "Esse DDD não existe. Confira os dois primeiros números."
  if (/^(\d)\1+$/.test(d)) return "Esse número não parece real."
  const numero = d.slice(2)
  if (numero.length === 9 && numero[0] !== "9") {
    return "Celular começa com 9 depois do DDD."
  }
  if (numero.length === 8 && !/^[2-5]/.test(numero)) {
    return "Se for celular, falta o 9 na frente."
  }
  return null
}

/** Dígitos com DDI para o link do WhatsApp (`5511987654321`), ou null se inválido. */
export function telefoneParaWhatsApp(valor: string): string | null {
  if (problemaNoTelefone(valor) !== null) return null
  const d = digitosNacionais(valor)
  return d ? `55${d}` : null
}
