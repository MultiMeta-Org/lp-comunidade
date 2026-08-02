-- ═══════════════════════════════════════════════════════════════════
-- Espelho documental — a migration REAL vive no repo do CRM
-- (multimeta-crm-1), dono único do schema comunidade.*:
--   supabase/migrations/20260802133415_comunidade_lesson_video_url.sql
--
-- Vídeo da aula (URL — Drive/YouTube; não ocupa Storage) + folga de
-- tamanho nos buckets de upload (pdfs/audios).
-- ═══════════════════════════════════════════════════════════════════

alter table comunidade.lessons
  add column if not exists video_url text;

update storage.buckets set file_size_limit = 209715200 where id = 'audios'; -- 200 MB
update storage.buckets set file_size_limit =  52428800 where id = 'pdfs';   --  50 MB
