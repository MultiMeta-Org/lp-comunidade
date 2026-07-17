-- ═══════════════════════════════════════════════════════════════════
-- Categorias legíveis: chaves → rótulos
--
-- Agora que category é text livre (0002), guardamos o rótulo humano
-- direto ("Objeção" em vez de "objecao"), então o admin vê e digita
-- categorias já legíveis. categoryLabel() continua normalizando exibição.
-- ═══════════════════════════════════════════════════════════════════

update comunidade.lessons set category = case category
  when 'objecao'    then 'Objeção'
  when 'conversao'  then 'Conversão'
  when 'analise'    then 'Análise'
  when 'mindset'    then 'Mindset'
  when 'fechamento' then 'Fechamento'
  else category
end;
