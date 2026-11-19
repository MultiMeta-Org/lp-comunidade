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
/** As perguntas que fazem o empresário contar a operação (Dias 8 e 11). */
const PERGUNTAS_CHAVE = [
  "Me conta um pouco sobre a empresa hoje. O que vocês vendem e quem normalmente compra de vocês?",
  "Hoje, como normalmente chegam novos clientes ou pessoas interessadas em vocês?",
  "Quando uma pessoa demonstra interesse, o que acontece a partir dali? Quem fica responsável por esse contato?",
  "E quando a pessoa demonstra interesse, mas não compra naquele momento, o que vocês fazem hoje?",
  "Olhando para a sua parte comercial, o que mais te incomoda ou o que você sente que poderia funcionar melhor?",
  "Se essa parte estivesse funcionando melhor, o que você gostaria que mudasse na prática?",
]

export default async function ReuniaoPage() {
  await requireDesafio()

  return (
    <Central
      kicker="Vou fazer uma reunião"
      titulo="Você vai sentar com um empresário."
      lede="Nessa primeira conversa você se apresenta, entende a empresa e mostra onde o seu trabalho faz sentido. O contrato vem depois. Siga na ordem:"
      acessos={[
        {
          titulo: "Veja uma reunião de verdade",
          texto: "A Monique numa reunião real, do começo ao fechamento de R$ 6.500. Assista antes da sua: você vai ver que é uma conversa leve.",
          href: "/desafio/biblioteca/fechamento-high-ticket",
        },
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
          titulo: "Tenha o roteiro e os scripts à mão",
          texto: "Central de Scripts: gavetas “Antes da reunião”, “Na reunião” e “Depois da reunião”. Deixe aberta durante a conversa.",
          href: "/desafio/scripts",
        },
        {
          titulo: "Registre no seu Radar",
          texto: "Abra a empresa no lápis e mude o estágio para “Reunião marcada”. Depois da conversa, “Reunião realizada”.",
          href: "/desafio/radar",
        },
      ]}
      rodape={
        <section className="flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary-subtle/50 px-4 py-5 sm:px-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            As perguntas-chave para entender a empresa
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-foreground">
            {PERGUNTAS_CHAVE.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ol>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Uma reunião costuma durar de 20 a 30 minutos — e está tudo bem. Algumas se
            estendem porque o empresário dá abertura para conversar mais; isso depende de
            cada pessoa. E, sempre que puder, saia com o valor já falado: é mais fácil
            fechar ali do que depois.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            <b className="font-semibold text-foreground">Onde fazer a reunião:</b> Google
            Meet ou Zoom — plataformas profissionais, com versão gratuita (no Zoom
            gratuito a reunião vai até 40 minutos). Mande o link junto com a confirmação
            do horário.
          </p>
        </section>
      }
    />
  )
}
