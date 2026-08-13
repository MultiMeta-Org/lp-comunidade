-- ═══════════════════════════════════════════════════════════════════
-- Espelho documental — a migration REAL vive no repo do CRM
-- (multimeta-crm-1), dono único do schema comunidade.*
--
-- Upload de vídeo da aula: bucket privado `videos` + policies de
-- storage.objects que permitem ao ADMIN gravar direto do navegador.
--
-- Por que policy em vez de signed upload URL (como pdfs/audios): vídeo
-- sobe por TUS (upload resumável), e o endpoint resumável do Storage não
-- aceita signed upload URL — ele autoriza pelo JWT de quem envia. Logo a
-- permissão de escrita precisa existir na RLS do bucket.
-- ═══════════════════════════════════════════════════════════════════

-- ── Bucket ───────────────────────────────────────────────────────────
-- 500 MB por arquivo, espelhando o limite GLOBAL do projeto (Storage →
-- Settings → "Upload file size limit"), que tem PRECEDÊNCIA sobre este.
-- Aumentar aqui sozinho não adianta: subir os dois, e manter
-- MAX_VIDEO_BYTES (uploads-provider.tsx) igual ao menor deles.
--
-- Cabe ~1h de gravação de Zoom/Meet em 720p. Aula em 1080p com bitrate
-- alto passa disso — o caminho lá é o link do Drive/YouTube, que continua
-- disponível no mesmo campo e não consome storage nem egress.
insert into storage.buckets (id, name, public, file_size_limit)
values ('videos', 'videos', false, 524288000)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit;

-- ── É admin? ─────────────────────────────────────────────────────────
-- SECURITY DEFINER pelo mesmo motivo de has_released_access: a role
-- `authenticated` não pode ler comunidade.admins (RLS sem policy), então
-- a policy de storage precisa perguntar por uma função privilegiada.
create or replace function comunidade.is_admin(p_email text)
returns boolean
language sql
security definer
stable
set search_path = comunidade, public
as $$
  select exists (
    select 1 from comunidade.admins a where lower(a.email) = lower(p_email)
  );
$$;

grant execute on function comunidade.is_admin(text) to authenticated;

-- ── Policies do bucket `videos` ──────────────────────────────────────
-- Escrita (insert/update/delete): só admin. O update é necessário porque o
-- upload vai com `x-upsert`, e o select porque o TUS consulta o objeto ao
-- retomar um envio interrompido.
--
-- Leitura das alunas NÃO tem policy: as páginas servem signed URLs geradas
-- no servidor pelo service-role (ver lessons-server.ts), igual a pdfs/audios.
drop policy if exists videos_admin_read   on storage.objects;
drop policy if exists videos_admin_insert on storage.objects;
drop policy if exists videos_admin_update on storage.objects;
drop policy if exists videos_admin_delete on storage.objects;

create policy videos_admin_read on storage.objects
  for select to authenticated
  using (bucket_id = 'videos' and comunidade.is_admin(auth.jwt() ->> 'email'));

create policy videos_admin_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'videos' and comunidade.is_admin(auth.jwt() ->> 'email'));

create policy videos_admin_update on storage.objects
  for update to authenticated
  using (bucket_id = 'videos' and comunidade.is_admin(auth.jwt() ->> 'email'))
  with check (bucket_id = 'videos' and comunidade.is_admin(auth.jwt() ->> 'email'));

create policy videos_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'videos' and comunidade.is_admin(auth.jwt() ->> 'email'));
