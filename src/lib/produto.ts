// Nomes de produto que aparecem na tela (client-safe).

/**
 * A assinatura que antes se chamava "Comunidade VIP".
 *
 * Fica numa constante porque o nome já mudou uma vez e aparece em dez telas —
 * a próxima troca é uma linha, não uma caçada. O que NÃO muda com o rótulo:
 * o banco (`comunidade.authorized_emails.has_comunidade_vip`, as tabelas
 * `vip_*`), lido também pelo CRM. Renomear coluna por causa de rótulo troca
 * risco por estética.
 */
export const LAB_NAME = "Laboratório de Vendas"

/** O acervo de aulas de dentro do Laboratório. */
export const MATERIAL_NAME = "Material de Aulas"

/**
 * A gravação do plantão de sexta — a única peça do acervo que vale para toda
 * aluna do Método, e não só para quem assina o Laboratório. No banco é a flag
 * `comunidade.lessons.open_to_all`.
 */
export const PLANTAO_NAME = "Plantão Tira Dúvidas"

/**
 * O primeiro produto que dá o portal sem o Método EVP. Quem compra só ele vê
 * a capa dele em "Meus produtos" e o resto travado. No banco é a coluna
 * `comunidade.authorized_emails.has_mapa`.
 */
export const MAPA_NAME = "Mapa de Transição para o Digital"
