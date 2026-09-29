import type { Lesson } from "@/lib/lessons"
import {
  COMUNIDADE_VIP_HOTMART_URL,
  CRM_URL,
  LIVE_CLASS_URL,
  LOUVORES_URL,
  MARKETPLACE_URL,
  METODO_EVP_URL,
  MULTIQUIZ_URL,
  PODCAST_URL,
  WHATSAPP_VIP_URL,
} from "@/lib/links"

/**
 * Conteúdo da home (produtos e novidades). Fica num módulo só para a Nati
 * poder trocar texto e link sem mexer em componente — e para o dia em que
 * isso virar tabela no banco, o formato já estar definido aqui.
 */

/**
 * "owned"  = a aluna já tem, o card leva ao ambiente.
 * "locked" = o produto existe mas não é dela — cadeado, sem destino.
 * "soon"   = ainda não existe no portal — cadeado, para conhecer.
 */
export type ProductState = "owned" | "locked" | "soon"

export type Product = {
  slug: string
  /** Nome grande na capa. */
  name: string
  /** Etiqueta pequena no topo da capa ("Seu curso", "Ferramenta"…). */
  kicker: string
  /** Linha de apoio embaixo da capa. */
  meta: string
  /** Gradiente da capa (CSS pronto para `style.background`). */
  art: string
  /** Destino. Ausente = card inerte (ambiente ainda não existe no portal). */
  href?: string
  /**
   * Produto travado que dá para comprar: o rótulo do convite ("Assinar na
   * Hotmart"), no lugar do selo "Não incluído". Sem isto, travado é só travado.
   */
  cta?: string
  state: ProductState
}

/**
 * Os produtos como esta aluna os vê. A Comunidade VIP é a única que varia — e
 * de um jeito diferente das outras: quando é dela, SAI da estante e vira a
 * seção de duas portas (grupo + material de aulas), porque é o único produto
 * com ambiente dentro do portal. Quando não é, fica na estante como capa com
 * cadeado, igual aos demais. Produto travado é capa; produto seu se abre.
 */
export function buildProducts({
  hasComunidadeVip,
}: {
  hasComunidadeVip: boolean
}): Product[] {
  return PRODUCTS.filter(
    (product) => product.slug !== "comunidade-vip" || !hasComunidadeVip
  ).map((product) => {
    if (product.slug === "comunidade-vip") {
      // Travada, mas à venda: a capa leva para a página da assinatura na
      // Hotmart. Comprou, o acesso chega pelo postback (ver rota do webhook).
      return {
        ...product,
        state: "locked",
        href: COMUNIDADE_VIP_HOTMART_URL,
        cta: "Assinar na Hotmart",
        meta: "Grupo no WhatsApp e material das aulas",
      }
    }
    return product
  })
}

const PRODUCTS: Product[] = [
  {
    slug: "metodo-evp",
    name: "Método EVP",
    kicker: "Seu curso",
    meta: "Assistir na Hotmart",
    art: "linear-gradient(160deg,#758E67,#5d7452)",
    // O ambiente do Método ainda não vive no portal: o card leva para a Hotmart,
    // onde a aluna assiste o curso que comprou.
    href: METODO_EVP_URL,
    state: "owned",
  },
  {
    slug: "comunidade-vip",
    name: "Comunidade VIP",
    kicker: "Assinatura",
    meta: "Seu grupo no WhatsApp",
    art: "linear-gradient(160deg,#C76E49,#9d4f2f)",
    href: WHATSAPP_VIP_URL,
    state: "owned",
  },
  {
    slug: "desafio-21-dias",
    name: "Desafio 21 Dias",
    kicker: "21 missões",
    meta: "Sua missão do primeiro contrato",
    art: "linear-gradient(155deg,#2A2A2A,#3b332e 55%,#7a4127)",
    state: "soon",
  },
  {
    slug: "marketplace",
    name: "Marketplace",
    kicker: "Oportunidades",
    meta: "Vagas e empresas contratando",
    art: "linear-gradient(160deg,#C08A5B,#8a5a33)",
    href: MARKETPLACE_URL,
    state: "owned",
  },
  {
    slug: "multiquiz",
    name: "MultiQuiz",
    kicker: "Ferramenta",
    meta: "Quizzes que trazem clientes",
    art: "linear-gradient(160deg,#6B8DAD,#4d6a86)",
    href: MULTIQUIZ_URL,
    state: "owned",
  },
  {
    slug: "crm",
    name: "CRM",
    kicker: "Ferramenta",
    meta: "Seus contatos organizados",
    art: "linear-gradient(160deg,#E2B04B,#b9852c)",
    href: CRM_URL,
    state: "owned",
  },
]

export type Highlight = {
  id: string
  eyebrow: string
  title: string
  text: string
  cta: string
  href: string
  /** Gradiente de fundo do slide (CSS pronto para `style.background`). */
  art: string
  /** Glifo gigante no canto direito — decorativo. */
  figure?: string
}

/**
 * Novidades do carrossel. A primeira é a aula mais recente (quando existe),
 * para a home abrir no que mudou hoje; as outras são fixas.
 */
export function buildHighlights(lesson: Lesson | null): Highlight[] {
  const highlights: Highlight[] = []

  if (lesson) {
    highlights.push({
      id: `aula-${lesson.id}`,
      eyebrow: "Aula mais recente",
      title: lesson.topic,
      text: lesson.description,
      cta: "Abrir a aula",
      href: `/dia/${lesson.id}`,
      art: "linear-gradient(112deg,#2A2A2A 0%,#42352f 46%,#9d4f2f 100%)",
    })
  }

  highlights.push(
    {
      id: "ao-vivo",
      eyebrow: "Toda sexta",
      title: "Aula ao vivo às 9h da manhã",
      text: "Toda sexta a Nati tira dúvidas ao vivo com a gente. Entra uns minutinhos antes para não perder o começo.",
      cta: "Entrar na aula ao vivo",
      href: LIVE_CLASS_URL,
      art: "linear-gradient(112deg,#2A2A2A 0%,#3f4436 46%,#5d7452 100%)",
      figure: "9h",
    },
    {
      id: "podprosperar",
      eyebrow: "PodProsperar",
      title: "Nosso podcast está no Spotify",
      text: "Conversa sobre prosperar na vida e no trabalho, para ouvir enquanto você cuida das suas coisas.",
      cta: "Ouvir no Spotify",
      href: PODCAST_URL,
      art: "linear-gradient(112deg,#2A2A2A 0%,#37413a 44%,#4d6341 100%)",
    },
    {
      id: "louvores",
      eyebrow: "Louvores",
      title: "A playlist do PodProsperar",
      text: "Os louvores que a gente ouve por aqui, reunidos numa playlist só.",
      cta: "Ouvir os louvores",
      href: LOUVORES_URL,
      art: "linear-gradient(112deg,#2A2A2A 0%,#453c35 46%,#b9852c 100%)",
      figure: "♪",
    }
  )

  return highlights
}
