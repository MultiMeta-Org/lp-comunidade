# Protótipos

Protótipos navegáveis usados para validar decisões de produto antes de implementar.
São arquivos HTML autocontidos: basta abrir no navegador, sem build e sem dependências.

## portal-hub-desafio.html

Protótipo da reestruturação do Portal discutida na reunião de setembro de 2026
(épico [#11](https://github.com/MultiMeta-Org/lp-comunidade/issues/11)).

Cobre:

- **Home nova**: carrossel de novidades de lado a lado, produtos comprados em uma
  fileira e produtos com cadeado em outra, links de acesso rápido.
- **Troca de persona** na barra do topo (aluna nova só com Método EVP, Comunidade VIP,
  VIP com Desafio) para conferir o que cada uma enxerga, inclusive o caso em que
  Notion e Marketplace não aparecem nem com cadeado.
- **Página de venda** de produto não comprado, com vídeo e botão de checkout.
- **Desafio 21 Dias**: jornada fixa na lateral, missão do dia em modal com um passo
  por vez, celebração ao concluir, estado de "você fez tudo hoje" e revisão editável
  dos dias anteriores. Dias 0, 1, 2 e 3 montados por inteiro.

Publicado em https://claude.ai/code/artifact/5858a481-cfe0-4681-ab44-5629aed2ecaf

Os dados são todos de exemplo e ficam em memória: recarregar a página zera tudo.
