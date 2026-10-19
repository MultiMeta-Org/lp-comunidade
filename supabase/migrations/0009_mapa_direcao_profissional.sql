-- ═══════════════════════════════════════════════════════════════════
-- Espelho documental — a migration REAL vive no repo do CRM
-- (multimeta-crm-1), dono único do schema comunidade.*:
--   20261019120000_comunidade_mapa_direcao.sql
--
-- O Mapa de Direção Profissional dá o portal SEM o Método. O banco passa a
-- ter has_metodo (true para toda a base existente) e has_mapa em
-- authorized_emails, as tabelas mapa_products / mapa_purchases e um trigger
-- que impede o sync do marketplace de trazer a compradora do Mapa como aluna
-- do Método. O corpo completo, com o porquê de cada peça, está lá.
-- ═══════════════════════════════════════════════════════════════════

-- ── Produtos e compras ───────────────────────────────────────────────
create table if not exists comunidade.mapa_products (
  hotmart_product_id text primary key,
  label              text,
  created_at         timestamptz not null default now()
);

comment on table comunidade.mapa_products is
  'Ids da Hotmart do Mapa de Direção Profissional. Preenchida sozinha pelo primeiro postback em /testemapadir; o webhook geral do portal e o trigger de has_metodo leem daqui.';

alter table comunidade.mapa_products enable row level security;
grant all on comunidade.mapa_products to service_role;

create table if not exists comunidade.mapa_purchases (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  hotmart_product_id text,
  transaction_id     text,
  event_type         text not null,
  origem             text not null default 'postback',
  occurred_at        timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

create index if not exists mapa_purchases_email_idx
  on comunidade.mapa_purchases (lower(email), occurred_at desc);

create unique index if not exists mapa_purchases_evento_idx
  on comunidade.mapa_purchases (lower(email), transaction_id, event_type)
  where transaction_id is not null;

comment on table comunidade.mapa_purchases is
  'Postbacks do Mapa de Direção Profissional recebidos em /testemapadir. Registro do fato — has_mapa não é derivada daqui.';

alter table comunidade.mapa_purchases enable row level security;
grant all on comunidade.mapa_purchases to service_role;

-- ── As colunas ───────────────────────────────────────────────────────
alter table comunidade.authorized_emails
  add column if not exists has_metodo boolean not null default true,
  add column if not exists has_mapa   boolean not null default false;

comment on column comunidade.authorized_emails.has_metodo is
  'Posse do Método EVP. False só para quem entrou pelo Mapa de Direção Profissional e não comprou o Método. Liga na compra do Método (webhook do portal ou trigger, via sync); desliga no reembolso dele, sem revogar o portal de quem tem o Mapa.';

comment on column comunidade.authorized_emails.has_mapa is
  'Posse do Mapa de Direção Profissional. Escrita só pelo webhook /testemapadir do portal — não é derivada, nenhum cron passa por cima.';

-- ── O trigger ────────────────────────────────────────────────────────
create or replace function comunidade.authorized_emails_has_metodo()
returns trigger
language plpgsql
set search_path = comunidade, public
as $$
begin
  if new.hotmart_product_id is null then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if exists (select 1 from comunidade.mapa_products p
                where p.hotmart_product_id = new.hotmart_product_id) then
      new.has_metodo := false;
    end if;
    return new;
  end if;

  -- UPDATE: só liga. Produto de extra não conta — o marketplace também recebe
  -- os postbacks do Laboratório e do Desafio, e comprar um deles não é
  -- comprar o Método.
  if not new.has_metodo
     and new.hotmart_product_id is distinct from old.hotmart_product_id
     and not exists (select 1 from comunidade.mapa_products p
                      where p.hotmart_product_id = new.hotmart_product_id)
     and not exists (select 1 from comunidade.vip_products p
                      where p.hotmart_product_id = new.hotmart_product_id)
     and not exists (select 1 from comunidade.desafio_products p
                      where p.hotmart_product_id = new.hotmart_product_id) then
    new.has_metodo := true;
  end if;
  return new;
end;
$$;

drop trigger if exists authorized_emails_has_metodo on comunidade.authorized_emails;
create trigger authorized_emails_has_metodo
  before insert or update of hotmart_product_id on comunidade.authorized_emails
  for each row execute function comunidade.authorized_emails_has_metodo();
