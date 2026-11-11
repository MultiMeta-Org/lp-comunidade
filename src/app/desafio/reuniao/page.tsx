import { requireDesafio } from "@/lib/guard"
import { linkDoCaderno } from "@/lib/desafio/caderno"
import { Central } from "@/components/desafio/central"

/**
 * "Vou fazer uma reunião com um empresário."
 *
 * Pedido da Nati: antes do "Fechei", existe a reunião em que ela se apresenta
 * e se vende. Quem marca reunião no Dia 7 não pode esperar o Dia 12 para
 * saber como se preparar — então o caminho fica à mão em qualquer dia.
 */
export default async function ReuniaoPage() {
  await requireDesafio()

  return (
    <Central
      kicker="Vou fazer uma reunião"
      titulo="Você vai sentar com um empresário."
      lede="Nessa primeira conversa você se apresenta, entende a empresa e mostra onde o seu trabalho faz sentido. O contrato vem depois. Siga na ordem:"
      acessos={[
        {
          titulo: "Prepare a reunião",
          texto: "Caderno de Campo, capítulo “Preparação para uma reunião” (p. 33).",
          href: linkDoCaderno(33),
          fora: true,
        },
        {
          titulo: "Use o checklist de reunião",
          texto: "Caderno de Campo, “Meu Radar e checklist de reunião” (p. 60).",
          href: linkDoCaderno(60),
          fora: true,
        },
        {
          titulo: "Conduza a conversa",
          texto: "Caderno de Campo, capítulo “Condução da reunião” (p. 35).",
          href: linkDoCaderno(35),
          fora: true,
        },
        {
          titulo: "Apresente a sua atuação",
          texto: "Caderno de Campo, capítulo “Como apresentar sua atuação” (p. 38).",
          href: linkDoCaderno(38),
          fora: true,
        },
        {
          titulo: "Tenha os scripts à mão",
          texto: "Caderno de Campo, “Modelos de mensagens” (p. 59).",
          href: linkDoCaderno(59),
          fora: true,
        },
        {
          titulo: "Registre no seu Radar",
          texto: "Abra a empresa no lápis e mude o estágio para “Reunião marcada”. Depois da conversa, “Reunião realizada”.",
          href: "/desafio/radar",
        },
      ]}
    />
  )
}
