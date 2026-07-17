-- ═══════════════════════════════════════════════════════════════════
-- Categoria de aula: enum → text
--
-- O admin passou a poder criar categorias novas direto no CMS (não só as
-- 5 fixas). Widening seguro: o enum comunidade.category_key deixa de
-- restringir a coluna. O type continua existindo (não referenciado).
-- ═══════════════════════════════════════════════════════════════════

alter table comunidade.lessons
  alter column category type text using category::text;
