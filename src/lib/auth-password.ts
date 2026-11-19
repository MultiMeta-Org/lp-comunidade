/**
 * Login por senha — alternativa ao código por e-mail (que a Microsoft passou a
 * engolir nos endereços Hotmail/Outlook).
 *
 * A senha vive no próprio Supabase Auth (auth.users), não no schema comunidade.
 * Quem nunca definiu uma senha entra com a padrão e é obrigada a trocar logo
 * em seguida; depois disso a padrão deixa de valer para aquele e-mail.
 * `app_metadata.password_set` marca quem já trocou — só o service-role escreve.
 */
export const DEFAULT_PASSWORD = "Multimeta@2026"

/**
 * Flag (não-httpOnly) lida pelo pop-up de troca no client. Só a rota de senha
 * a grava, então OTP e Google nunca abrem o pop-up.
 */
export const PASSWORD_CHANGE_COOKIE = "comunidade-trocar-senha"

export const MIN_PASSWORD_LENGTH = 8

/**
 * Requisitos da senha nova — o pop-up mostra cada um ficando verde enquanto a
 * aluna digita, e a rota de troca valida os mesmos (`required`). O símbolo é
 * só recomendado: conta na força, mas não barra.
 */
export const PASSWORD_RULES = [
  {
    id: "length",
    label: `Pelo menos ${MIN_PASSWORD_LENGTH} caracteres`,
    required: true,
    test: (v: string) => v.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: "upper",
    label: "Uma letra maiúscula",
    required: true,
    test: (v: string) => /[A-ZÀ-Ý]/.test(v),
  },
  {
    id: "lower",
    label: "Uma letra minúscula",
    required: true,
    test: (v: string) => /[a-zà-ÿ]/.test(v),
  },
  {
    id: "number",
    label: "Um número",
    required: true,
    test: (v: string) => /\d/.test(v),
  },
  {
    id: "symbol",
    label: "Um símbolo, como ! @ # $ (recomendado)",
    required: false,
    test: (v: string) => /[^A-Za-zÀ-ÿ0-9\s]/.test(v),
  },
] as const

/** Primeira regra obrigatória que a senha não cumpre, ou null se está ok. */
export function passwordProblem(value: string): string | null {
  if (value === DEFAULT_PASSWORD) return "Escolha uma senha diferente da senha padrão."
  const missing = PASSWORD_RULES.find((r) => r.required && !r.test(value))
  return missing ? `A senha precisa ter: ${missing.label.toLowerCase()}.` : null
}

/** Comparação simples: a senha padrão não é segredo, timing não vaza nada. */
export function isDefaultPassword(value: string): boolean {
  return value === DEFAULT_PASSWORD
}
