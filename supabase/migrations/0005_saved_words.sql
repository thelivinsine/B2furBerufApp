-- 0005_saved_words.sql
-- Adds the custom-deck "saved words" column (#29). Each learner bookmarks vocab
-- ids into `progress.savedWords`; cloudSync writes them into this column so the
-- deck survives across devices.
--
-- The column default covers every existing row, so no backfill is needed. Safe
-- to re-run (idempotent). Run once in the Supabase dashboard SQL editor.

alter table public.progress
  add column if not exists saved_words jsonb not null default '[]'::jsonb;
