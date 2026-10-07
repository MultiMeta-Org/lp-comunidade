-- ═══════════════════════════════════════════════════════════════════
-- Espelho documental — as migrations REAIS vivem no repo do CRM
-- (multimeta-crm-1), dono único do schema comunidade.*:
--   20261006120000_comunidade_aula_aberta.sql
--   20261006121000_comunidade_lesson_progress.sql
--   20261006122000_comunidade_banners.sql
--
-- Três mudanças que o portal passa a usar:
--
--   1. comunidade.lessons.open_to_all — vídeo da aula visível para TODA aluna
--      autorizada (é o Plantão Tira Dúvidas). PDF e áudio seguem só para quem
--      tem o Laboratório de Vendas (antiga Comunidade VIP); o corte de mídia é
--      feito no servidor, em lessons-server.ts.
--
--   2. comunidade.lesson_progress — presença por aula: first_viewed_at (a
--      aluna abriu /dia/[id]) e completed_at (clicou em concluir). Mais a view
--      lesson_progress_stats (turma/abriram/concluíram por aula) e as funções
--      lesson_presentes(lesson_id) / lesson_ausentes(lesson_id). Os três partem
--      da MESMA turma (ativas; só as do Laboratório quando a aula não é aberta;
--      sem admins; rascunho tem turma 0), para número e lista não divergirem.
--
--   3. comunidade.banners + bucket público `banners` — carrossel da home
--      gerenciado pela admin: imagem (desktop + celular opcional), link, texto
--      do botão, ordem e vigência. Os slides fixos de src/lib/home.ts NÃO
--      saem: continuam depois dos banners, como redundância.
--
-- A posse do Laboratório dada à mão pela admin NÃO precisou de migration:
-- comunidade.vip_grants já existe desde 20260928210000 e é o sinal que
-- sobrevive ao refresh_vip_entitlement.
-- ═══════════════════════════════════════════════════════════════════

alter table comunidade.lessons
  add column if not exists open_to_all boolean not null default false;

create index if not exists lessons_open_to_all_idx
  on comunidade.lessons (open_to_all, sort_order desc)
  where published and open_to_all;

create table if not exists comunidade.lesson_progress (
  lesson_id       text not null references comunidade.lessons (id) on delete cascade,
  email           text not null,
  first_viewed_at timestamptz not null default now(),
  completed_at    timestamptz,
  primary key (lesson_id, email)
);

create index if not exists lesson_progress_email_idx
  on comunidade.lesson_progress (lower(email));

create index if not exists lesson_progress_lesson_email_lower_idx
  on comunidade.lesson_progress (lesson_id, lower(email));

alter table comunidade.lesson_progress enable row level security;
grant all on comunidade.lesson_progress to service_role;

create or replace view comunidade.lesson_progress_stats
with (security_invoker = true) as
select l.id                                        as lesson_id,
       count(c.email)        filter (where l.published) as elegiveis,
       count(p.email)        filter (where l.published) as abriram,
       count(p.completed_at) filter (where l.published) as concluiram
  from comunidade.lessons l
  -- A turma desta aula. LEFT JOIN para a aula não sumir da view quando a turma
  -- está vazia (base nova, ou aula do Laboratório sem nenhuma assinante).
  left join comunidade.authorized_emails c
    on c.status = 'active'
   and (l.open_to_all or c.has_comunidade_vip)
   and not exists (
     select 1 from comunidade.admins a where lower(a.email) = lower(c.email)
   )
  -- A presença DELAS. Quem não é da turma simplesmente não entra na conta.
  left join comunidade.lesson_progress p
    on p.lesson_id = l.id
   and lower(p.email) = lower(c.email)
 group by l.id;

grant select on comunidade.lesson_progress_stats to service_role;

-- ── Quem não apareceu ────────────────────────────────────────────────
-- Anti-join entre a turma elegível e quem tem linha de presença. Precisa ser
-- função porque a lista de ausentes não existe como tabela: é a diferença
-- entre duas, e PostgREST não faz `not exists`.
create or replace function comunidade.lesson_ausentes(p_lesson_id text)
returns table (email text, buyer_name text)
language sql
security definer
stable
set search_path = comunidade, public
as $$
  select c.email, c.buyer_name
    from comunidade.authorized_emails c
    join comunidade.lessons l on l.id = p_lesson_id
   where c.status = 'active'
     and (l.open_to_all or c.has_comunidade_vip)
     and not exists (
       select 1 from comunidade.admins a where lower(a.email) = lower(c.email)
     )
     and not exists (
       select 1 from comunidade.lesson_progress p
        where p.lesson_id = p_lesson_id
          and lower(p.email) = lower(c.email)
     )
   order by c.buyer_name nulls last, c.email;
$$;

grant execute on function comunidade.lesson_ausentes(text) to service_role;

-- ── Quem apareceu ───────────────────────────────────────────────────
-- Espelho de lesson_ausentes, com a MESMA definição de turma. Existe por isso:
-- se a lista de presentes saísse direto de lesson_progress, ela mostraria gente
-- que o número da view não conta (reembolsada depois de assistir, admin), e a
-- admin veria "Concluíram (21)" em cima de uma lista de 23 nomes.
create or replace function comunidade.lesson_presentes(p_lesson_id text)
returns table (
  email           text,
  buyer_name      text,
  first_viewed_at timestamptz,
  completed_at    timestamptz
)
language sql
security definer
stable
set search_path = comunidade, public
as $$
  select c.email, c.buyer_name, p.first_viewed_at, p.completed_at
    from comunidade.lesson_progress p
    join comunidade.lessons l on l.id = p.lesson_id
    join comunidade.authorized_emails c
      on lower(c.email) = lower(p.email)
     and c.status = 'active'
     and (l.open_to_all or c.has_comunidade_vip)
   where p.lesson_id = p_lesson_id
     and not exists (
       select 1 from comunidade.admins a where lower(a.email) = lower(c.email)
     )
   order by p.completed_at desc nulls last, p.first_viewed_at desc;
$$;

grant execute on function comunidade.lesson_presentes(text) to service_role;

create table if not exists comunidade.banners (
  id               uuid primary key default gen_random_uuid(),
  label            text not null default '',
  image_url        text not null,
  image_mobile_url text,
  href             text not null,
  cta              text not null default 'Saiba mais',
  alt              text not null default '',
  sort_order       int not null default 0,
  active           boolean not null default true,
  starts_at        timestamptz,
  ends_at          timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists banners_ativos_idx
  on comunidade.banners (sort_order, created_at)
  where active;

drop trigger if exists banners_touch_updated_at on comunidade.banners;
create trigger banners_touch_updated_at
  before update on comunidade.banners
  for each row execute function comunidade.touch_updated_at();

alter table comunidade.banners enable row level security;
grant all on comunidade.banners to service_role;

insert into storage.buckets (id, name, public, file_size_limit)
values ('banners', 'banners', true, 10485760)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit;
