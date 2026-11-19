# Plano — WhatsApp automático no pedido de reembolso do Desafio

> **Implementado em 19/11/2026** no repo `MultiMeta-Org/multimeta-whatsapp-automacoes`.
> O estado atual, as decisões e as pendências estão no `CLAUDE.md` e no `README.md` de lá;
> este plano fica como registro (as perguntas abertas já foram respondidas).

Para uma sessão nova do Claude Code. Este documento traz todo o contexto; não
depende da conversa em que foi escrito (19/11/2026).

## Objetivo

Quando uma aluna pede reembolso do **Desafio Empreendedora Anônima**, mandar
automaticamente uma mensagem do **WhatsApp de CS da Nati**, para o time falar
com ela rápido e tentar reverter — como já acontece no reembolso do Método EVP.

- Sem front-end. Só logs para saber se deu certo.
- E-mail de alerta quando o WhatsApp desconectar, para
  `gbevi281@gmail.com` e `gabriel.multimeta@gmail.com`.
- **Repo novo, só de automações de WhatsApp** (`multimeta-whatsapp-automacoes`).
  **Nada disto é feito dentro do repo da BIA** — decisão do Gabriel, fica mais
  organizado. O repo novo só divide o VPS e o banco com a BIA, e copia dela o
  jeito de conectar o Baileys e de fazer deploy (é referência, não lugar).
  Nasce genérico, para receber outras automações depois (ex.: o reembolso do
  Método EVP).

## O que já existe (verificado em 19/11/2026)

### O evento já chega e já fica no banco

- A Hotmart manda o postback para o portal: `lp-comunidade`,
  `src/app/api/hotmart/webhook/route.ts`. O mesmo postback também vai para o
  webhook do CRM (`multimeta-crm-1`).
- O pedido de reembolso é o evento **`PURCHASE_PROTEST`**. No Desafio
  (`perdeNoPedido: true`), o portal grava uma linha em
  **`comunidade.desafio_purchases`** e a aluna perde o Desafio na hora.
- Colunas de `comunidade.desafio_purchases`: `id, email, hotmart_product_id,
  transaction_id, event_type, origem, occurred_at, created_at`.
  Índice único em (e-mail, transação, evento): postback repetido não duplica.
- **Se a aluna cancela o pedido**, a Hotmart aprova a compra de novo e o
  webhook **apaga** a linha `PURCHASE_PROTEST` daquela transação
  (`registraCompra` no route.ts). Ou seja: protest que some do banco quer dizer
  que foi revertido.
- `PURCHASE_REFUNDED` / `PURCHASE_CHARGEBACK` = dinheiro devolvido (fim).
- Até 19/11: 47 linhas em `desafio_purchases`, sendo 3 `PURCHASE_PROTEST`
  (11/11, 15/11 e 19/11) e 2 `PURCHASE_REFUNDED`.
- Os ids do Desafio na Hotmart estão em `comunidade.desafio_products`.

### Onde está o telefone da aluna

Por ordem de confiança:
1. A matrícula do Desafio (Dia 0): `comunidade.desafio_progresso` com `dia = 0`,
   campo `respostas.whatsapp` (ela mesma digitou).
2. `comunidade.authorized_emails.phone` (vem da compra).
3. `public.hotmart_transactions.buyer_phone` (tabela do CRM, por `buyer_email`).

Nome: `respostas.nome_completo` da matrícula, ou `authorized_emails.buyer_name`.
O painel `/admin/desafio` do portal já faz essa mesma escolha
(`src/lib/desafio-admin.ts`, "Nome, cidade e WhatsApp saem da matrícula").

### Já existe Baileys rodando no VPS (a BIA) — só como molde

O repo `multimeta-bia` **não é alterado**. Dele se copiam estes arquivos para o
repo novo:
- `src/whatsapp.ts` + `src/canais/whatsapp/conexao.ts`: conexão Baileys
  (`baileys` 7.0.0-rc14), `useMultiFileAuthState`, reconexão, `DisconnectReason`.
- `src/canais/whatsapp/telefone.ts`: variantes do mesmo número (com/sem 55,
  com/sem nono dígito). **Copiar.**
- `deploy/multimeta-bia-whatsapp.service`: systemd endurecido, usuário próprio,
  sessão em `StateDirectory` (`/var/lib/...`), env em `/etc/multimeta-bia/bia.env`
  (root, 600). **Copiar o formato.**
- `deploy/deploy-multimeta-bia.sh` + `.github/workflows/deploy.yml`: push na
  `main` → GitHub Actions testa, compila e manda para o VPS (releases em
  `/opt/<app>/releases`, symlink `current`, rollback se o health falhar).
  Secrets: `VPS_HOST`, `VPS_SSH_KEY`, `VPS_KNOWN_HOSTS`. **Copiar.**
- A BIA usa **outro número** (o da BIA). Este repo usa o **número de CS** —
  nunca o mesmo, cada número é uma sessão Baileys.

### VPS e banco

- VPS: `gabriel@187.41.103.77` com a chave `~/.ssh/id_ed25519_multimeta`
  (não existe alias `multimeta` no `~/.ssh/config` desta máquina). É o mesmo IP
  de `bia.conexaomultimeta.com.br`.
- Supabase: projeto `kmikrdilqeimgdczgmzl` (MultiMeta_CRM_1), compartilhado
  por CRM, portal e BIA. **As migrations são do repo `multimeta-crm-1`**:
  migration nova vai em `multimeta-crm-1/supabase/migrations/` e roda de lá
  (`npx supabase db push`); o repo novo guarda só um espelho documental, como
  o `lp-comunidade` faz em `supabase/migrations/0011_*.sql`.
- E-mail: o portal já envia pelo **Resend** (`lp-comunidade`,
  `src/lib/email/send-email.ts`), remetente `noreply@conexaomultimeta.com.br`
  (DKIM/SPF/DMARC ok). Para Gmail entrega normal — o problema de entrega é só
  com Hotmail/Outlook.

### O que NÃO foi encontrado

A automação de reembolso do **Método EVP** não está em nenhum repo
(procurado em `~/github/multimeta/*`). Deve rodar numa ferramenta de fora
(Hotmart, n8n, BotConversa, Zapier…). Ver "Perguntas abertas".

## Arquitetura proposta

Repo novo: **`multimeta-whatsapp-automacoes`** (Node 24 + TypeScript,
`baileys`, `@supabase/supabase-js`, `vitest`). Um processo, um serviço
systemd, sem porta aberta.

```
Hotmart ──postback──▶ portal (webhook) ──insert──▶ comunidade.desafio_purchases
                                                          │
                     ┌────── Supabase Realtime (INSERT) ──┤
                     │       + varredura a cada 5 min ────┘ (rede de segurança)
                     ▼
           multimeta-whatsapp-automacoes (VPS)
             1. registra em automacoes.envios (idempotente)
             2. espera o atraso / horário comercial
             3. confere: o pedido ainda está de pé?
             4. acha o telefone, confere onWhatsApp
             5. envia pelo número de CS (Baileys)
             6. grava o resultado + log
             └─ desconectou? ──▶ e-mail (Resend) para os dois endereços
```

### Gatilho: Realtime + varredura

- **Supabase Realtime** (`postgres_changes`, `INSERT` em
  `comunidade.desafio_purchases`, filtro `event_type=eq.PURCHASE_PROTEST`) é o
  "websocket": avisa em segundos. Exige a tabela na publicação
  `supabase_realtime` (migration no CRM).
- **Varredura a cada 5 min** dos `PURCHASE_PROTEST` das últimas 72 h: pega o
  que o Realtime perdeu (processo reiniciando, socket caído). Com a tabela de
  envios idempotente, rodar as duas coisas não duplica nada.
- Se o Realtime der trabalho, a varredura sozinha (a cada 1 min) já resolve —
  é o caminho mais simples e não depende de publicação.

### Tabela de envios (é o log e a trava contra duplicata)

Schema novo `automacoes` (migration no CRM):

```sql
create schema if not exists automacoes;
create table automacoes.envios (
  id            uuid primary key default gen_random_uuid(),
  automacao     text not null,            -- 'reembolso-desafio'
  chave         text not null,            -- transaction_id (ou email se faltar)
  email         text not null,
  telefone      text,                     -- só dígitos, como foi enviado
  status        text not null default 'pendente'
                  check (status in ('pendente','enviado','falhou','sem_telefone',
                                    'sem_whatsapp','cancelado','ignorado')),
  motivo        text,                     -- por que falhou / foi ignorado
  mensagem      text,                     -- o texto que saiu
  tentativas    int not null default 0,
  agendado_para timestamptz not null default now(),
  enviado_em    timestamptz,
  created_at    timestamptz not null default now(),
  unique (automacao, chave)
);
create table automacoes.whatsapp_estado (  -- 1 linha por número/sessão
  sessao        text primary key,          -- 'cs'
  status        text not null,             -- conectado/desconectado/pareando
  numero        text,
  erro          text,
  alerta_enviado_em timestamptz,
  atualizado_em timestamptz not null default now()
);
alter table automacoes.envios enable row level security;        -- só service_role
alter table automacoes.whatsapp_estado enable row level security;
grant usage on schema automacoes to service_role;
grant all on all tables in schema automacoes to service_role;
```

Lembrar: expor o schema `automacoes` na Data API (Settings → API → Exposed
schemas) para o supabase-js enxergar.

### Regras do envio (reembolso do Desafio)

1. **Uma mensagem por pedido.** `unique (automacao, chave)` com
   `chave = transaction_id`.
2. **Atraso curto** antes de mandar (sugestão: 10 min) e **horário comercial**
   (sugestão: 8h–20h, horário de Brasília, todos os dias). Fora do horário,
   `agendado_para` = próximo início de horário.
3. **Antes de enviar, reconferir** que a linha `PURCHASE_PROTEST` ainda existe
   e que não chegou `PURCHASE_REFUNDED` / `PURCHASE_CHARGEBACK` para a mesma
   transação. Se o pedido foi cancelado → `cancelado`, não envia.
4. **Telefone**: matrícula → `authorized_emails.phone` → `hotmart_transactions`.
   Normalizar com as variantes de `telefone.ts`. Sem número → `sem_telefone`.
   Com número, `sock.onWhatsApp(jid)` antes; não existe → `sem_whatsapp`.
5. **Mensagem**: texto da Nati com `{primeiro_nome}`. Guardar o texto num
   arquivo do repo (`src/mensagens/reembolso-desafio.ts`), não no código da regra.
   Simular digitação (`sendPresenceUpdate('composing')` por alguns segundos).
6. **Ritmo** (anti-bloqueio): no máximo 1 envio a cada 30–60 s, fila em série.
7. **Falha de envio**: até 3 tentativas com espera crescente; depois `falhou`
   com o `motivo`.
8. **Modo teste**: env `APENAS_NUMEROS=5561...` faz o processo só enviar para
   números da lista (o resto vira `ignorado`). `--seco` só loga o que faria.

### Conexão e alertas

- Sessão Baileys em `StateDirectory` (ex.: `/var/lib/multimeta-whatsapp-automacoes/cs`),
  como a BIA. **Dispositivo vinculado**: o celular de CS continua funcionando
  normalmente.
- **Parear sem front**: `npm run parear -- 5561999999999` (ou variável no env)
  pede `requestPairingCode` e mostra o código no log (`journalctl -u ...`);
  digita-se o código no celular de CS (Aparelhos conectados → Conectar com
  número). Opcional: mandar o código também por e-mail.
- **Alerta de desconexão por e-mail** (Resend, para os dois endereços):
  - `DisconnectReason.loggedOut` (sessão derrubada pelo celular/WhatsApp):
    e-mail **imediato**, porque precisa parear de novo.
  - Outras quedas: só se não reconectar em **5 min** (reconexão normal do
    Baileys acontece o tempo todo e não pode virar spam).
  - Um e-mail por queda (`alerta_enviado_em`), e um "voltou a conectar" quando
    reconectar depois de um alerta.
  - Também alerta se um envio terminar em `falhou`.
- Variáveis (`/etc/multimeta-whatsapp-automacoes/env`, root 600):
  `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `RESEND_FROM`,
  `ALERTA_EMAILS=gbevi281@gmail.com,gabriel.multimeta@gmail.com`,
  `WHATSAPP_AUTH_DIR`, `APENAS_NUMEROS` (opcional), `HORARIO_INICIO=8`,
  `HORARIO_FIM=20`, `ATRASO_MIN=10`.
  Os valores de Supabase e Resend são os mesmos do portal/BIA; a Resend key
  está como sensível na Vercel (não dá para baixar) — pegar do painel do Resend
  ou criar uma key nova só para este serviço.

### Logs

- Uma linha por acontecimento no stdout (vai para o `journalctl`):
  `[reembolso-desafio] pedido recebido · email · transação`,
  `... enviado · telefone`, `... cancelado (aluna desistiu do reembolso)`,
  `[whatsapp] conectado como 5561...`, `[whatsapp] caiu (motivo) ...`.
- A tabela `automacoes.envios` é o histórico consultável
  (`select status, count(*) from automacoes.envios group by 1`).
- Opcional depois: um resumo diário por e-mail (enviados / sem telefone / falhas).

## Passos de implementação

1. **Perguntas abertas** (abaixo) respondidas pelo Gabriel/Nati.
2. Migration `automacoes` (+ Realtime em `comunidade.desafio_purchases`) no
   repo **`multimeta-crm-1`**, rodar `db push`; expor o schema na Data API.
3. Criar o repo `multimeta-whatsapp-automacoes` (GitHub org `MultiMeta-Org`):
   estrutura `src/conexao.ts`, `src/automacoes/reembolso-desafio.ts`,
   `src/telefone.ts`, `src/alertas.ts`, `src/db.ts`, `src/index.ts`,
   `src/scripts/parear.ts`; testes em `src/tests/`.
4. Testes (vitest): variantes de telefone, escolha do telefone, horário
   comercial / `agendado_para`, idempotência, "pedido cancelado não envia".
5. Rodar local com `APENAS_NUMEROS` = número do Gabriel e uma linha
   `PURCHASE_PROTEST` de teste (inserir à mão e apagar depois — **não** usar o
   botão de teste da Hotmart, o portal ignora evento de teste).
6. Deploy no VPS copiando o padrão da BIA (systemd + GitHub Actions + secrets).
7. Parear o número de CS, conferir `journalctl`, mandar um teste real para o
   número do Gabriel, derrubar a sessão de propósito e conferir o e-mail.
8. Tirar `APENAS_NUMEROS` e acompanhar os primeiros pedidos reais.
9. Depois: reembolso do Método EVP pelo mesmo repo — gatilho em
   `public.hotmart_transactions` (`event_type = 'PURCHASE_PROTEST'`, produto do
   Método), outra automação, mesma tabela de envios.

## Perguntas abertas (responder antes de codar)

1. **Como é feito hoje no Método EVP?** Qual ferramenta dispara, e qual é o
   **texto exato** da mensagem? A do Desafio deve seguir o mesmo tom.
2. **Qual é o número de CS** e em que celular ele está (WhatsApp normal ou
   Business)? Quem vai digitar o código de pareamento?
3. **Atraso e horário**: mandar logo (10 min) ou esperar? Mandar no fim de
   semana / à noite?
4. Mandar também quando o reembolso **já foi concluído** (`PURCHASE_REFUNDED`)
   sem ter passado pelo pedido? (Hoje a sugestão é só o pedido.)
5. Se a aluna **responder** no WhatsApp de CS, quem atende é humano (a ideia é
   essa) — confirmar que a automação não deve responder nada.
6. A ferramenta do EVP vai continuar fora, ou a ideia é migrar o EVP para este
   repo depois?

## Cuidados

- **Nunca** usar o número da BIA nem a sessão dela.
- Baileys não é API oficial: ritmo baixo, uma mensagem por pessoa, só para
  quem é cliente (é o caso). Número de CS já "aquecido" ajuda.
- Não logar telefone completo + e-mail juntos em canal externo; no `journalctl`
  do próprio VPS tudo bem.
- Segredos: env do VPS (root 600), nunca no repo; `.env` local no `.gitignore`.
