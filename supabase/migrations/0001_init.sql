-- ═══════════════════════════════════════════════════════════════════
-- Comunidade VIP · DVP — schema inicial
--
-- Espelha o padrão do multimeta-marketplace-2:
--   • authorized_emails  → fonte da verdade do acesso (gate 7 dias + reembolso)
--   • login_otps         → código de login passwordless (e-mail + código)
--   • admins             → allowlist de quem acessa /admin
--   • lessons            → CMS de conteúdo (aulas)
--
-- Aplicar quando o projeto Supabase existir:
--   supabase db push   (ou colar no SQL Editor)
-- ═══════════════════════════════════════════════════════════════════

create schema if not exists comunidade;

-- Acesso das roles da Data API ao schema (PostgREST). Lembrar de adicionar
-- "comunidade" em [api].schemas no config.toml / painel (Exposed schemas).
grant usage on schema comunidade to anon, authenticated, service_role;

-- ── Enums ────────────────────────────────────────────────────────────
do $$ begin
  create type comunidade.access_status as enum ('active', 'revoked');
exception when duplicate_object then null; end $$;

do $$ begin
  create type comunidade.category_key as enum
    ('objecao', 'conversao', 'analise', 'mindset', 'fechamento');
exception when duplicate_object then null; end $$;

-- ── authorized_emails ────────────────────────────────────────────────
-- Uma linha por comprador. `authorized_at` ancora no order_date do Hotmart;
-- o acesso só libera em authorized_at + ACCESS_WAITING_PERIOD_DAYS (7 dias).
-- Reembolso/chargeback → status='revoked'.
create table if not exists comunidade.authorized_emails (
  id                     uuid primary key default gen_random_uuid(),
  email                  text not null unique,
  status                 comunidade.access_status not null default 'active',
  source                 text,                        -- 'hotmart' | 'manual'
  authorized_at          timestamptz not null default now(),
  revoked_at             timestamptz,
  hotmart_transaction_id text,
  hotmart_product_id     text,
  buyer_name             text,
  phone                  text,
  created_at             timestamptz not null default now()
);

-- e-mails sempre em minúsculo (defesa extra além do normalize na aplicação)
create unique index if not exists authorized_emails_email_lower_idx
  on comunidade.authorized_emails (lower(email));

-- ── login_otps ───────────────────────────────────────────────────────
-- Código de 6 dígitos para login. Sem user_id: o login é por e-mail.
create table if not exists comunidade.login_otps (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  code        text not null,
  expires_at  timestamptz not null,
  attempts    int not null default 0,
  verified_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists login_otps_email_created_idx
  on comunidade.login_otps (email, created_at desc);

-- ── admins ───────────────────────────────────────────────────────────
create table if not exists comunidade.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

-- ── lessons (CMS) ────────────────────────────────────────────────────
-- Espelha o type `Lesson` de src/lib/lessons.ts (id textual "dia-N").
create table if not exists comunidade.lessons (
  id          text primary key,
  dia         int not null,
  iso_date    date not null,
  weekday     text not null,
  topic       text not null,
  category    comunidade.category_key not null,
  description text not null default '',
  pdf_url     text,
  audio_url   text,
  published   boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists lessons_published_date_idx
  on comunidade.lessons (published, iso_date desc);

-- keep updated_at fresh
create or replace function comunidade.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists lessons_touch_updated_at on comunidade.lessons;
create trigger lessons_touch_updated_at
  before update on comunidade.lessons
  for each row execute function comunidade.touch_updated_at();

-- ── Grants para as roles da API ──────────────────────────────────────
-- service_role faz tudo (webhook, rotas de auth, admin) — RLS é ignorada por ele.
grant all on all tables in schema comunidade to service_role;
grant all on all sequences in schema comunidade to service_role;
-- authenticated lê as aulas (a RLS abaixo restringe as linhas a quem tem acesso).
grant select on comunidade.lessons to authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- RLS
-- authorized_emails / login_otps / admins: NUNCA expostas ao cliente.
-- Só o service-role (rotas de auth, webhook, admin) acessa. RLS ligado
-- sem policies = tudo negado para anon/authenticated; service-role ignora RLS.
-- ═══════════════════════════════════════════════════════════════════
alter table comunidade.authorized_emails enable row level security;
alter table comunidade.login_otps        enable row level security;
alter table comunidade.admins            enable row level security;
alter table comunidade.lessons           enable row level security;

-- Checagem de acesso liberado via SECURITY DEFINER: a role `authenticated` NÃO
-- pode ler authorized_emails diretamente (vazaria a lista de compradores), então
-- a policy chama esta função, que roda com os privilégios do dono (postgres).
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
      and ae.authorized_at + interval '7 days' <= now()
  );
$$;

grant execute on function comunidade.has_released_access(text) to authenticated;

-- Leitura das aulas publicadas: apenas usuários autenticados cujo e-mail
-- tem acesso liberado (active + passados os 7 dias). A escrita é só service-role.
drop policy if exists lessons_read_released on comunidade.lessons;
create policy lessons_read_released on comunidade.lessons
  for select
  to authenticated
  using (
    published = true
    and comunidade.has_released_access(auth.jwt() ->> 'email')
  );

-- ═══════════════════════════════════════════════════════════════════
-- Storage (executar após criar o projeto; buckets não versionam em SQL puro)
--   • bucket `pdfs`   (privado) — PDFs das aulas
--   • bucket `audios` (privado) — áudios das aulas
-- Via dashboard ou:
--   insert into storage.buckets (id, name, public) values ('pdfs','pdfs',false);
--   insert into storage.buckets (id, name, public) values ('audios','audios',false);
-- E policies de leitura análogas à de lessons acima (acesso liberado).
-- ═══════════════════════════════════════════════════════════════════
