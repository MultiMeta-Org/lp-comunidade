import { requireDesafio } from "@/lib/guard"
import { linkDoCaderno } from "@/lib/desafio/caderno"
import { ROTINA_COMERCIAL_NOTION_URL, SUPPORT_URL } from "@/lib/links"
import { Central } from "@/components/desafio/central"

/**
 * "Fechei meu primeiro contrato" — a Central do Primeiro Contrato.
 *
 * O Dia 21 promete que aqui está "contrato, onboarding, acessos, rotina,
 * processo, indicadores e comunicação com o empresário". Antes o botão ia
 * direto ao WhatsApp do suporte; agora ela encontra o modelo de contrato e a
 * Rotina Comercial (o passo a passo do trabalho diário) sem pedir a ninguém, e
 * o suporte continua no fim, para contar a novidade.
 */
export default async function FecheiPage() {
  await requireDesafio()

  return (
    <Central
      kicker="Fechei meu primeiro contrato"
      titulo="Parabéns! Agora é hora de começar bem."
      lede="Você chegou no primeiro sim. Aqui está tudo o que você precisa para formalizar e começar o trabalho dentro da empresa:"
      acessos={[
        {
          titulo: "Modelo de contrato de closer",
          texto: "Objeto, comissão, sigilo, exclusividade, prazo e LGPD. É só preencher com os dados da empresa.",
          href: "/desafio/biblioteca/contrato-closer/arquivo",
          fora: true,
        },
        {
          titulo: "Como começar",
          texto: "Caderno de Campo, capítulo “Fechei meu contrato: como começar” (p. 53).",
          href: linkDoCaderno(53),
          fora: true,
        },
        {
          titulo: "Rotina Comercial no Notion",
          texto: "O passo a passo do seu trabalho diário. Para usar, abra o link e clique em “Duplicar” (no canto de cima, à direita) para levar a página para o seu Notion.",
          href: ROTINA_COMERCIAL_NOTION_URL,
          fora: true,
        },
        {
          titulo: "Central do Primeiro Contrato",
          texto: "Caderno de Campo, “Central do Primeiro Contrato” (p. 61).",
          href: linkDoCaderno(61),
          fora: true,
        },
        {
          titulo: "Marque como fechado no Radar",
          texto: "Abra a empresa no lápis e mude o estágio para “Fechado”.",
          href: "/desafio/radar",
        },
        {
          titulo: "Conte para a gente",
          texto: "Fala com o suporte da MultiMeta pelo WhatsApp: a gente quer comemorar com você e te acompanhar nesse começo.",
          href: SUPPORT_URL,
          fora: true,
        },
      ]}
    />
  )
}
