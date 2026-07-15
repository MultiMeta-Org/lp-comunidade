# Área de membros — setup (quando o Supabase existir)

Este repositório já tem o **esqueleto** da área de membros da Comunidade VIP DVP:
login passwordless (e-mail + código via Resend), gate de acesso de 7 dias pós-compra
com revogação por reembolso (Hotmart) e um admin com gestão de acesso + CMS de aulas.

Enquanto não houver Supabase configurado, o app cai para `SEED_LESSONS` e as rotas
de auth/admin não funcionam. Para ligar tudo:

## 1. Criar o projeto Supabase e aplicar o schema
- Criar o projeto no Supabase.
- Aplicar `supabase/migrations/0001_init.sql` (schema `comunidade`) e depois `supabase/seed.sql`.
- Criar os buckets de Storage `pdfs` e `audios` (privados) — ver comentário no fim do `0001_init.sql`.
- Cadastrar os admins:
  `insert into comunidade.admins (email) values ('gabriel.multimeta@gmail.com');`

## 2. Preencher `.env.local` (base em `.env.local.example`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (domínio público — usado nos links dos e-mails)
- `RESEND_API_KEY`, `RESEND_FROM` (domínio verificado no Resend)
- `HOTMART_HOTTOK` (token do webhook)
- `ACCESS_WAITING_PERIOD_DAYS` (padrão 7)

## 3. Configurar o webhook do Hotmart
- Apontar para `POST https://<app>/api/hotmart/webhook`.
- Enviar o header `x-hotmart-hottok` = `HOTMART_HOTTOK`.
- Eventos: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`.

## 4. Regenerar os tipos (opcional, recomendado)
`npx supabase gen types typescript --project-id <ref> --schema comunidade > src/lib/supabase/database.types.ts`

## Como funciona (mapa rápido)
- **Login** (`/login`): `src/components/login-form.tsx` → `POST /api/auth/send-otp` (checa acesso liberado + envia código Resend) → `POST /api/auth/verify-otp` (valida código e cria sessão).
- **Gate de acesso**: `src/lib/access.ts` (`getAccessState`) é a regra única dos 7 dias; fonte de verdade em `comunidade.authorized_emails`.
- **Proteção de rotas**: `src/proxy.ts` (Next 16 — antigo middleware) exige sessão; `src/lib/guard.ts` faz o gate fino (acesso liberado nas páginas de conteúdo, allowlist no `/admin`).
- **Hotmart**: `src/app/api/hotmart/webhook/route.ts` mantém `authorized_emails` (autoriza ancorando no `order_date`, revoga em reembolso/chargeback).
- **Admin** (`/admin`): gestão de acessos + CMS de aulas (`comunidade.lessons`), server actions em `src/app/admin/*/actions.ts`.
- **Conteúdo**: `src/lib/lessons-server.ts` (`getLessons`/`getLesson`) lê as aulas via RLS; `src/lib/lessons.ts` guarda constantes/tipos/seed (client-safe).

## Verificação
- `npm run build` compila o esqueleto sem env real (usa fallback de seed).
- Fluxo real (com Supabase): simular `PURCHASE_APPROVED` → aguardar/forçar 7 dias
  (ajustar `authorized_at`) → logar por e-mail+código → editar aula no `/admin` →
  simular `PURCHASE_REFUNDED` e confirmar bloqueio no login.
