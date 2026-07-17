-- ═══════════════════════════════════════════════════════════════════
-- Seed — aulas atuais (migradas de src/lib/lessons.ts → LESSONS)
-- Roda após 0001_init.sql para o CMS já nascer populado.
-- `weekday` e `date` de exibição são derivados de iso_date na aplicação,
-- mas guardamos weekday para preservar o texto original.
-- ═══════════════════════════════════════════════════════════════════

insert into comunidade.lessons
  (id, dia, iso_date, weekday, topic, category, description, pdf_url, audio_url, published, sort_order)
values
  ('dia-12', 12, '2026-07-14', 'Segunda',
   'Como reverter a objeção ''tá caro'' sem parecer desesperada', 'Objeção',
   'Três scripts testados para transformar resistência de preço em urgência de compra.',
   null, null, true, 12),

  ('dia-11', 11, '2026-07-11', 'Quinta',
   'Análise real: do ''não tenho dinheiro'' ao fechamento', 'Análise',
   'Estudo de caso com transcrição e anotações do que virou o jogo em cada etapa.',
   null, null, true, 11),

  ('dia-10', 10, '2026-07-10', 'Quarta',
   'Gatilhos de fechamento: quando e como usar sem pressionar', 'Fechamento',
   'A diferença entre urgência real e urgência fabricada — e por que as clientes percebem.',
   null, null, true, 10),

  ('dia-9', 9, '2026-07-09', 'Terça',
   'Mindset da closer: como não deixar semana difícil virar resultado ruim', 'Mindset',
   'Ritual de reset mental para semanas de baixa conversão.',
   null, null, true, 9),

  ('dia-8', 8, '2026-07-08', 'Segunda',
   'Taxa de conversão: o que seus números estão te dizendo', 'Conversão',
   'Como calcular e interpretar sua taxa para tomar decisões mais precisas.',
   null, null, true, 8),

  ('dia-7', 7, '2026-07-04', 'Quinta',
   'Onde a conexão quebrou: análise de atendimento', 'Análise',
   'Como identificar o momento exato em que a cliente se fechou — e o que fazer diferente.',
   null, null, true, 7),

  ('dia-6', 6, '2026-07-03', 'Quarta',
   '''Preciso pensar'' — o que realmente está por trás disso', 'Objeção',
   'As 3 razões reais por trás da resposta mais comum na sua call.',
   null, null, true, 6),

  ('dia-5', 5, '2026-07-02', 'Terça',
   'A pergunta que antecipa a conversão antes da oferta', 'Conversão',
   'Uma pergunta simples que muda o estado emocional da cliente no momento certo.',
   null, null, true, 5)
on conflict (id) do nothing;

-- Admin inicial (Paola/Gabriel) — ajuste os e-mails:
-- insert into comunidade.admins (email) values ('gabriel.multimeta@gmail.com') on conflict do nothing;
-- insert into comunidade.admins (email) values ('paola@...') on conflict do nothing;
