-- ═══════════════════════════════════════════════════════════════════
-- Acesso imediato: remove a espera de 7 dias do gate geral
--
-- Regra nova: a aluna tem acesso desde a compra (dia 1) e só perde no
-- reembolso/chargeback (status='revoked'). A janela de 7 dias passa a
-- valer SÓ para Marketplace/Notion (no app, getFeatureUnlock).
--
-- has_released_access() é usada pela RLS de comunidade.lessons.
-- ═══════════════════════════════════════════════════════════════════

create or replace function comunidade.has_released_access(p_email text)
returns boolean
language sql
security definer
stable
set search_path = comunidade, public
as $$
  select exists (
    select 1 from comunidade.authorized_emails ae
    where lower(ae.email) = lower(p_email)
      and ae.status = 'active'
  );
$$;
