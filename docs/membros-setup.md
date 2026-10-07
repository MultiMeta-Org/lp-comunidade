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
- Aplicar `supabase/migrations/0007_lesson_aberta_progresso_banners.sql` (aula aberta
  para todas, presença nas aulas e banners da home + bucket público `banners`).
  ⚠️ As migrations REAIS de `comunidade.*` vivem no repo do CRM
  (`multimeta-crm-1/supabase/migrations/20261006*`), que é o dono do schema — o
  arquivo daqui é espelho documental. Aplicar pelo CRM:
  `cd ../multimeta-crm-1 && npx supabase db push`
- Cadastrar os admins:
  `insert into comunidade.admins (email) values ('gabriel.multimeta@gmail.com');`

## 2. Preencher `.env.local` (base em `.env.local.example`)
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL` (domínio público — usado nos links dos e-mails)
- `RESEND_API_KEY`, `RESEND_FROM` (domínio verificado no Resend)
- `HOTMART_HOTTOK` (token do webhook)
- `ACCESS_WAITING_PERIOD_DAYS` (padrão 7)

## 3. Ligar o login com Google
O botão "Continuar com Google" do `/login` usa o OAuth do Supabase. O projeto
hospedado é o **MultiMeta_CRM_1** (`kmikrdilqeimgdczgmzl`), compartilhado com o CRM,
e o provider **Google já está habilitado lá** — com o mesmo OAuth client
(`302365822240-…apps.googleusercontent.com`). Então não há o que configurar em
*Providers*; o que falta é a lista de redirect e o Google Cloud:

1. **Supabase** → *Authentication* → *URL Configuration* → *Redirect URLs*:
   **acrescentar** (sem apagar as do CRM/Marketplace)
   - `https://comunidade.conexaomultimeta.com.br/api/auth/callback`
   - `https://comunidade.conexaomultimeta.com.br/**` (previews do mesmo domínio)
   - `http://localhost:3000/api/auth/callback` (dev apontando para o projeto hospedado)
2. **Google Cloud Console** → *APIs & Services* → *Credentials* → o OAuth client acima →
   *Authorized redirect URIs*: já tem `https://kmikrdilqeimgdczgmzl.supabase.co/auth/v1/callback`.
   Para usar Google com o **Supabase local**, acrescentar também
   `http://127.0.0.1:55321/auth/v1/callback`.
3. Local (`supabase start`): o provider já vem ligado em `supabase/config.toml`
   (`[auth.external.google]`) e as credenciais estão no `.env.local`
   (`SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID` / `_SECRET`) — reiniciar o Supabase
   depois de mexer nelas. Sem o passo 2, o Google local recusa o redirect.

O portão de acesso continua sendo o mesmo: `GET /api/auth/callback` troca o `code`
pela sessão e, se o e-mail do Google não estiver liberado em
`comunidade.authorized_emails`, encerra a sessão na hora e devolve a aluna ao
`/login` com o motivo. Ou seja, entrar com Google só funciona com o **mesmo e-mail
da compra**.

## 4. Configurar o webhook do Hotmart
- Apontar para `POST https://<app>/api/hotmart/webhook`.
- Enviar o header `x-hotmart-hottok` = `HOTMART_HOTTOK`.
- Eventos: `PURCHASE_APPROVED`, `PURCHASE_COMPLETE`, `PURCHASE_REFUNDED`, `PURCHASE_CHARGEBACK`.

## 5. Regenerar os tipos (opcional, recomendado)
`npx supabase gen types typescript --project-id <ref> --schema comunidade > src/lib/supabase/database.types.ts`

## Como funciona (mapa rápido)
- **Páginas**: `/` é a **home** do portal (`src/components/home-board.tsx`: carrossel de
  novidades, produtos da aluna, produtos para conhecer e os links de sempre),
  `/aulas` é o acervo, `/dia/[id]` é a aula. `/hub` redireciona para `/` (link antigo).
  O conteúdo da home — produtos e novidades — mora em `src/lib/home.ts`; os links
  externos, em `src/lib/links.ts`.
- **Login** (`/login`): `src/components/login-form.tsx` → `POST /api/auth/send-otp` (checa acesso liberado + envia código Resend) → `POST /api/auth/verify-otp` (valida código e cria sessão). O mesmo formulário oferece **Google** (`signInWithOAuth`), que volta em `GET /api/auth/callback` — troca o code pela sessão e aplica o gate de acesso.
- **Gate de acesso**: `src/lib/access.ts` (`getAccessState`) é a regra única dos 7 dias; fonte de verdade em `comunidade.authorized_emails`.
- **Proteção de rotas**: `src/proxy.ts` (Next 16 — antigo middleware) exige sessão; `src/lib/guard.ts` faz o gate fino (acesso liberado nas páginas de conteúdo, allowlist no `/admin`).
- **Hotmart**: `src/app/api/hotmart/webhook/route.ts` mantém `authorized_emails` (autoriza ancorando no `order_date`, revoga em reembolso/chargeback).
- **Admin**: quatro rotas — `/admin` (visão geral + estado do sync),
  `/admin/acessos`, `/admin/aulas` (+ `/admin/aulas/[id]` com a presença da aula) e
  `/admin/banners`. Cada lista **pagina e filtra no banco**, pela URL
  (`?q=&status=&page=`), então link reaberto cai no mesmo lugar. Server actions em
  `src/app/admin/*/actions.ts`.
- **Laboratório de Vendas**: é o nome novo da Comunidade VIP. Só o rótulo mudou
  (`src/lib/produto.ts`); o banco segue com `has_comunidade_vip` e as tabelas
  `vip_*`, que o CRM também lê. Dar/tirar à mão no `/admin/acessos` escreve em
  `comunidade.vip_grants` (cortesia) e chama `refresh_vip_entitlement` — escrever
  direto na coluna derivada seria desfeito pelo próximo sync. Tirar a cortesia não
  vence compra registrada nem direito adquirido (Método antes de 23/07/2026), e a
  tela diz isso quando acontece.
- **Plantão Tira Dúvidas**: `comunidade.lessons.open_to_all` libera **só o vídeo**
  da aula para toda aluna autorizada. O corte de PDF/áudio é no servidor
  (`lessons-server.ts`, `LessonsScope`), não na interface — esconder o botão
  mandaria a URL assinada no HTML de todo jeito. `/aulas` e `/dia/[id]` passaram a
  aceitar quem não assina, servindo esse recorte.
- **Presença nas aulas**: `comunidade.lesson_progress` guarda `first_viewed_at`
  (servidor grava com `after()` quando a aluna abre a aula) e `completed_at` (a
  aluna clica em concluir). O `/admin` lê pela view `lesson_progress_stats` e pela
  função `lesson_ausentes`. Visita de admin não entra na conta.
- **Banners da home**: `comunidade.banners` (imagem desktop + celular opcional,
  link, texto do botão, ordem e vigência), imagens no bucket público `banners`.
  Entram ANTES dos slides fixos de `src/lib/home.ts`, que **continuam existindo**
  como redundância — carrossel nunca fica vazio.
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
