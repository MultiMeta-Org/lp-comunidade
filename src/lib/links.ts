// Links externos do Portal EVP (client-safe).

/** Método EVP na Hotmart — onde o curso é assistido, até ter ambiente no portal. */
export const METODO_EVP_URL =
  "https://hotmart.com/pt-br/marketplace/produtos/hagsxd-metodo-evp-920q0/S104764925D"

/** Laboratório de Vendas na Hotmart — onde quem não assina compra. O produto na
 *  Hotmart pode seguir com o nome antigo; o link é o mesmo. */
export const COMUNIDADE_VIP_HOTMART_URL =
  "https://hotmart.com/pt-br/marketplace/produtos/hagsxd-comunidade-vip-evp-j2b07/Y106820903X?sck=HOTMART_PRODUCT_PAGE"

/**
 * Desafio 21 Dias na Hotmart — onde quem não tem compra.
 *
 * `null` enquanto o produto não existir na Hotmart: a capa travada fica inerte,
 * sem botão. Mandar quem clicou com vontade de comprar para a página de OUTRO
 * produto é pior que não ter botão, e um 404 é pior ainda. Quando o produto
 * existir, trocar por aqui — e cadastrar o id em comunidade.desafio_products,
 * que é o que liga o entitlement.
 */
export const DESAFIO_HOTMART_URL: string | null = null

/** Grupo no WhatsApp do Laboratório de Vendas — exclusivo de quem assina. */
export const WHATSAPP_VIP_URL =
  "https://chat.whatsapp.com/ClfrOZ05MY2K2pOwnxvHDd?s=cl&p=i&mlu=0&ilr=4"

/** Grupo gratuito no WhatsApp — "Todas as Alunas". */
export const WHATSAPP_FREE_URL = "https://chat.whatsapp.com/DuLpwAf5ICkBjjCrY2Pluy"

/** Aula ao vivo (Google Meet) — toda sexta às 9h, mesmo link toda semana. */
export const LIVE_CLASS_URL = "https://meet.google.com/kgp-mkqc-ryt"

/** Notion — materiais e templates (libera 7 dias após a compra). */
export const NOTION_URL = "https://welcome-aboard-multimeta.lovable.app/"

/** Suporte no WhatsApp (atendimento direto). */
export const SUPPORT_URL = "https://wa.me/message/2BXZEO5TDW4QN1"

/** Marketplace — aberto para toda aluna autorizada, sem espera. */
export const MARKETPLACE_URL = "https://www.conexaomultimeta.com.br/"

/** CRM da MultiMeta — contatos e follow-up das alunas. */
export const CRM_URL = "https://www.crmmultimeta.com.br"

/** MultiQuiz — quizzes que captam clientes. */
export const MULTIQUIZ_URL = "https://multi-quiz.com/pt-BR"

/** Podcast PodProsperar no Spotify. */
export const PODCAST_URL = "https://open.spotify.com/show/5JOusoAR3ufe62i8Z86OEg"

/** Playlist de louvores do PodProsperar no Spotify. */
export const LOUVORES_URL =
  "https://open.spotify.com/playlist/2k66tcPZqFvnBKjn3wUTSh"

/** Instagram da Nati Ferraric. */
export const INSTAGRAM_NATI_URL = "https://www.instagram.com/natiferraric"
