# Área de membros — setup (quando o Supabase existir)

Este repositório já tem o **esqueleto** da área de membros do Portal EVP:
login passwordless (e-mail + código via Resend), gate de acesso de 7 dias pós-compra
com revogação por reembolso (Hotmart) e um admin com gestão de acesso + CMS de aulas.

Enquanto não houver Supabase configurado, o app cai para `SEED_LESSONS` e as rotas
de auth/admin não funcionam. Para ligar tudo:

## 1. Criar o projeto Supabase e aplicar o schema
- Criar o projeto no Supabase.
- Aplicar `supabase/migrations/0001_init.sql` (schema `comunidade`) e depois `supabase/seed.sql`.
- Criar os buckets de Storage `pdfs` e `audios` (privados) — ver comentário no fim do `0001_init.sql`.
- Aplicar `supabase/migrations/0006_video_bucket.sql` (bucket `videos` + policies de
  upload do admin). O teto de vídeo é **500 MB**, e mora em três lugares que
  precisam concordar: o limite global do projeto (**Storage → Settings → Upload
  file size limit**, que tem precedência), o `file_size_limit` do bucket na
  migration, e `MAX_VIDEO_BYTES` em `src/components/admin/uploads-provider.tsx`.
  Vídeo maior que isso vai por link do Drive/YouTube — o mesmo campo aceita os dois.
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
- **Uploads**: PDF e áudio vão por *signed upload URL* (navegador → Storage direto).
  Vídeo vai por **TUS/resumable** (`src/lib/video-upload.ts`), em chunks de 6 MB, com
  progresso e retomada se a conexão cair. O estado dos envios vive no
  `UploadsProvider` (layout do `/admin`), então fechar o modal da aula não
  interrompe o upload; ao terminar, `attachLessonMedia` grava a referência na aula.
- **Compressão de vídeo** (`src/lib/video-compress.ts`): vídeo acima de 500 MB é
  reencodado no navegador (ffmpeg.wasm) só o necessário para caber — o bitrate sai
  da duração, e a resolução só cai quando o bitrate não sustenta a original
  (~25 min → 1080p, ~1 h → 720p, 2 h → 480p). Até 500 MB sobe sem reencodar.
  Limite de **2 h**: acima disso não sobra bitrate e o caminho é o link do Drive.
  É lento (1x–3x a duração do vídeo) e precisa da aba aberta; roda em Web Worker,
  então não trava a tela.
- **Conteúdo**: `src/lib/lessons-server.ts` (`getLessons`/`getLesson`) lê as aulas via RLS; `src/lib/lessons.ts` guarda constantes/tipos/seed (client-safe).

## Verificação
- `npm run build` compila o esqueleto sem env real (usa fallback de seed).
- Fluxo real (com Supabase): simular `PURCHASE_APPROVED` → aguardar/forçar 7 dias
  (ajustar `authorized_at`) → logar por e-mail+código → editar aula no `/admin` →
  simular `PURCHASE_REFUNDED` e confirmar bloqueio no login.
