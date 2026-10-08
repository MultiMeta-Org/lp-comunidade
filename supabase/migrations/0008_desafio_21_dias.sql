-- ═══════════════════════════════════════════════════════════════════
-- Espelho documental — as migrations REAIS vivem no repo do CRM
-- (multimeta-crm-1), dono único do schema comunidade.*:
--   20261008120000_comunidade_desafio_entitlement.sql
--   20261008130000_comunidade_desafio_jornada.sql
--
-- O Desafio 21 Dias ganha ambiente próprio no portal (/desafio). O que o
-- banco passa a ter:
--
--   1. POSSE DO PRODUTO, na mesma forma do Laboratório de Vendas —
--      desafio_products (ids da Hotmart), desafio_purchases (os postbacks que
--      o próprio portal recebe), desafio_grants (cortesia) e a coluna derivada
--      authorized_emails.has_desafio, calculada por
--      comunidade.refresh_desafio_entitlement. A derivação entrou como passo 4
--      do sync de 5 minutos.
--
--      Sem corte de direito adquirido, ao contrário da VIP: o Desafio nasce
--      agora como produto próprio, e nenhuma compra anterior prometeu ele a
--      ninguém.
--
--   2. A JORNADA DA ALUNA — desafio_progresso (uma linha por aluna/dia: em que
--      passo parou, o que respondeu, quando concluiu), desafio_radar (as
--      empresas, meta de 100, vivo em qualquer dia) e desafio_interesses (hoje
--      só o Closer Presencial).
--
--   3. O DASHBOARD INTERNO, em views: desafio_matriculas (o jsonb do Dia Zero
--      como colunas), desafio_visao_geral, desafio_funil, desafio_transformacao
--      (as três notas de 0 a 10 do Dia 0 contra as do Dia 21), desafio_motivos,
--      desafio_dores, desafio_radar_stats e desafio_closer_presencial.
--
-- O CONTEÚDO DOS 22 DIAS NÃO ESTÁ NO BANCO. Textos, passos e vídeos moram em
-- src/lib/desafio/dias/*.ts. Quase todo dia tem um passo com interface própria
-- (o Radar com meta, a caixa que copia o script de indicação, a escala de 0 a
-- 10, a empresa do Dia 1 voltando no Dia 2), e um editor genérico que desse
-- conta disso seria uma pilha de exceções. As chaves das respostas são
-- declaradas junto da pergunta, no código; as views deste arquivo são o único
-- lugar do banco que as conhece.
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Posse do produto ──────────────────────────────────────────────
create table if not exists comunidade.desafio_products (
  hotmart_product_id text primary key,
  label              text,
  created_at         timestamptz not null default now()
);

create table if not exists comunidade.desafio_grants (
  email      text primary key,
  motivo     text,
  created_at timestamptz not null default now()
);

create table if not exists comunidade.desafio_purchases (
  id                 uuid primary key default gen_random_uuid(),
  email              text not null,
  hotmart_product_id text,
  transaction_id     text,
  event_type         text not null,
  origem             text not null default 'postback',
  occurred_at        timestamptz not null default now(),
  created_at         timestamptz not null default now()
);

alter table comunidade.authorized_emails
  add column if not exists has_desafio boolean not null default false;

-- comunidade.refresh_desafio_entitlement(p_email) e o passo 4 do
-- sync_authorized_from_marketplace: ver a migration do CRM.

-- ── 2. A jornada ─────────────────────────────────────────────────────
create table if not exists comunidade.desafio_progresso (
  email        text not null,
  dia          int  not null check (dia between 0 and 21),
  passo        int  not null default 0,
  respostas    jsonb not null default '{}'::jsonb,
  started_at   timestamptz not null default now(),
  completed_at timestamptz,
  updated_at   timestamptz not null default now(),
  primary key (email, dia)
);

create table if not exists comunidade.desafio_radar (
  id           uuid primary key default gen_random_uuid(),
  email        text not null,
  nome         text not null,
  segmento     text,
  contato      text,
  origem       text,
  dia_origem   int,
  notas        jsonb not null default '{}'::jsonb,
  arquivada_em timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- A mesma empresa não entra duas vezes no Radar da mesma aluna: ela vai somar
-- até 100 ao longo de 21 dias e o contador precisa poder ser levado a sério.
create unique index if not exists desafio_radar_empresa_idx
  on comunidade.desafio_radar (lower(email), lower(btrim(nome)));

create table if not exists comunidade.desafio_interesses (
  email      text not null,
  interesse  text not null,
  resposta   text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (email, interesse)
);

-- ── 3. As views do dashboard interno: ver a migration do CRM ─────────

-- ═══════════════════════════════════════════════════════════════════
-- Painel do Desafio no /admin — migrations do CRM:
--   20261008150000_comunidade_desafio_radar_status.sql
--   20261008160000_comunidade_desafio_reuniao_realizada.sql
--   20261008170000_comunidade_desafio_admin.sql
--   20261008180000_comunidade_desafio_uf_normalizada.sql
--   20261008190000_comunidade_desafio_alunas_uf.sql
--
--   • desafio_radar ganhou status comercial (+ ultima_acao / proxima_acao e
--     data), e a view desafio_placar deriva o funil da aluna dali. O status
--     avança pelas missões: abordagem no Dia 7, resposta no Dia 8, reunião
--     marcada no 10 e realizada no 11, proposta no 12.
--   • desafio_distribuicao — as respostas categóricas da matrícula, um
--     recorte por `campo`. Acrescentar um recorte novo é um `union all`.
--   • desafio_alunas — uma linha por aluna: onde parou e o que construiu. É a
--     leitura do suporte; o painel diz quantas travaram, esta view diz quem.
--   • A UF é normalizada na LEITURA (upper/btrim) em todas as views de
--     relatório: ela é digitada à mão, e sem isso "sp" e "SP" viravam dois
--     estados diferentes. O que a aluna digitou continua intacto na resposta.
-- ═══════════════════════════════════════════════════════════════════
