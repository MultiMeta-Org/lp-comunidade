import type { Lesson } from "@/lib/lessons"
import type { Banner } from "@/lib/banners-server"
import { LAB_NAME, PLANTAO_NAME } from "@/lib/produto"
import {
  COMUNIDADE_VIP_HOTMART_URL,
  CRM_URL,
  LIVE_CLASS_URL,
  LOUVORES_URL,
  MARKETPLACE_URL,
  METODO_EVP_URL,
  MULTIQUIZ_URL,
  PODCAST_URL,
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
  /**
   * Arte da capa, em `public/produtos`. Quando existe, ela É a capa: o nome e
   * a etiqueta somem de cima dela, porque a arte já traz o nome do produto e
   * texto nosso em cima de arte pronta vira duplicata. O gradiente de `art`
   * continua obrigatório — é o que fica no lugar enquanto a imagem carrega, e
   * o que sobra se o arquivo sumir.
   */
  image?: string
  /** Destino. Ausente = card inerte (ambiente ainda não existe no portal). */
  href?: string
  /**
   * Produto travado que dá para comprar: o rótulo do convite ("Assinar na
   * Hotmart"), no lugar do selo "Não incluído". Sem isto, travado é só travado.
   */
  cta?: string
  /**
   * A capa abre um seletor em vez de um destino. É o caso do Laboratório, que
   * tem dois ambientes (grupo e material) e nenhum deles é "o principal" —
   * escolher por ela seria chutar.
   */
  chooser?: boolean
  state: ProductState
}

/** Slug do Laboratório na estante. O produto na Hotmart continua o mesmo. */
export const LAB_SLUG = "laboratorio-de-vendas"

/**
 * Os produtos como esta aluna os vê. Tudo é capa na mesma prateleira — o que
 * muda é o que acontece no clique.
 *
 * O Laboratório é o único com dois ambientes dentro do portal (o grupo e o
 * material), então a capa dele abre um seletor em vez de um destino: escolher
 * um dos dois por ela seria chutar qual ela quer.
 *
 * Quem não assina vê o Laboratório travado, à venda — e ganha no lugar a capa
 * do Plantão Tira Dúvidas, que É dela. Sem essa capa, a aluna teria o direito
 * ao plantão e nenhum jeito de descobrir: liberar no servidor sem mostrar a
 * porta não é dar acesso, é esconder melhor.
 */
export function buildProducts({
  hasLab,
  temPlantao = false,
}: {
  hasLab: boolean
  /** Existe ao menos uma aula aberta publicada. */
  temPlantao?: boolean
}): Product[] {
  return PRODUCTS.flatMap((product): Product[] => {
    if (product.slug !== LAB_SLUG) return [product]

    if (hasLab) {
      return [{ ...product, chooser: true, href: undefined }]
    }

    // Travada, mas à venda: a capa leva para a página da assinatura na
    // Hotmart. Comprou, o acesso chega pelo postback (ver rota do webhook).
    const travado: Product = {
      ...product,
      state: "locked",
      href: COMUNIDADE_VIP_HOTMART_URL,
      cta: "Assinar na Hotmart",
      meta: "Grupo no WhatsApp e material das aulas",
    }
    return temPlantao ? [PLANTAO, travado] : [travado]
  })
}

/**
 * O Plantão como capa de quem não assina: ocupa o lugar do Laboratório na
 * prateleira e leva ao mesmo /aulas, que serve o recorte dela (só as aulas
 * abertas, só o vídeo). Capa clara de propósito — é um pedaço do Laboratório
 * que saiu de dentro da assinatura, e a cor diz isso.
 */
const PLANTAO: Product = {
  slug: "plantao-tira-duvidas",
  name: PLANTAO_NAME,
  kicker: "Liberado para todas",
  meta: "As gravações de sexta",
  art: "linear-gradient(160deg,#E0A98B,#C76E49)",
  href: "/aulas",
  state: "owned",
}

const PRODUCTS: Product[] = [
  {
    slug: "metodo-evp",
    name: "Método EVP",
    kicker: "Seu curso",
    meta: "Assistir na Hotmart",
    art: "linear-gradient(160deg,#D8A888,#B57C56)",
    image: "/produtos/metodo-evp.webp",
    // O ambiente do Método ainda não vive no portal: o card leva para a Hotmart,
    // onde a aluna assiste o curso que comprou.
    href: METODO_EVP_URL,
    state: "owned",
  },
  {
    slug: LAB_SLUG,
    name: LAB_NAME,
    kicker: "Assinatura",
    meta: "Grupo no WhatsApp e material das aulas",
    art: "linear-gradient(160deg,#C76E49,#9d4f2f)",
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
    art: "linear-gradient(160deg,#7D9459,#44552B)",
    image: "/produtos/marketplace.webp",
    href: MARKETPLACE_URL,
    state: "owned",
  },
  {
    slug: "multiquiz",
    name: "MultiQuiz",
    kicker: "Ferramenta",
    meta: "Quizzes que trazem clientes",
    art: "linear-gradient(160deg,#FFC93C,#E0A411)",
    image: "/produtos/multiquiz.webp",
    href: MULTIQUIZ_URL,
    state: "owned",
  },
  {
    slug: "crm",
    name: "CRM",
    kicker: "Ferramenta",
    meta: "Seus contatos organizados",
    art: "linear-gradient(160deg,#F7873A,#E35205)",
    image: "/produtos/crm.webp",
    href: CRM_URL,
    state: "owned",
  },
]

/**
 * Slide do carrossel. Duas formas, porque são duas origens:
 *   • "texto"  — os slides escritos aqui no código (e o da aula mais recente).
 *   • "imagem" — os banners que a admin cadastra: arte inteira + botão, sem
 *     texto por cima. Texto sobre arte alheia quebra em qualquer tela.
 */
export type Highlight =
  | {
      kind: "texto"
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
  | {
      kind: "imagem"
      id: string
      imageUrl: string
      imageMobileUrl: string | null
      href: string
      cta: string
      alt: string
    }

/**
 * Novidades do carrossel, nesta ordem:
 *   1. os banners cadastrados pela admin (ela manda na ordem e na vigência);
 *   2. a aula mais recente que ESTA aluna pode abrir;
 *   3. os slides fixos — SÓ quando não há nenhum banner no ar.
 *
 * Os fixos são rede de segurança, não conteúdo permanente: existem para a home
 * nunca virar uma faixa preta quando a tabela está vazia, o banner expirou ou
 * ninguém lembrou de atualizar. Havendo banner cadastrado, quem fala é a
 * admin — e os fixos saem de cena em vez de disputar a atenção com ela.
 *
 * A aula mais recente não é "fixo": é conteúdo vivo, desta aluna, e fica.
 */
export function buildHighlights(
  lesson: Lesson | null,
  banners: Banner[] = []
): Highlight[] {
  const highlights: Highlight[] = banners.map((b) => ({
    kind: "imagem",
    id: `banner-${b.id}`,
    imageUrl: b.imageUrl,
    imageMobileUrl: b.imageMobileUrl,
    href: b.href,
    cta: b.cta,
    alt: b.alt,
  }))

  if (lesson) {
    highlights.push({
      kind: "texto",
      id: `aula-${lesson.id}`,
      // Para quem não assina o Laboratório, a única aula que chega aqui é a
      // gravação do plantão — e chamá-la de "aula mais recente" esconderia
      // justamente o que ela ganhou.
      eyebrow: lesson.openToAll ? PLANTAO_NAME : "Aula mais recente",
      title: lesson.topic,
      text: lesson.description,
      cta: "Abrir a aula",
      href: `/dia/${lesson.id}`,
      art: "linear-gradient(112deg,#2A2A2A 0%,#42352f 46%,#9d4f2f 100%)",
    })
  }

  if (banners.length > 0) return highlights

  highlights.push(
    {
      kind: "texto",
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
      kind: "texto",
      id: "podprosperar",
      eyebrow: "PodProsperar",
      title: "Nosso podcast está no Spotify",
      text: "Conversa sobre prosperar na vida e no trabalho, para ouvir enquanto você cuida das suas coisas.",
      cta: "Ouvir no Spotify",
      href: PODCAST_URL,
      art: "linear-gradient(112deg,#2A2A2A 0%,#37413a 44%,#4d6341 100%)",
    },
    {
      kind: "texto",
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
