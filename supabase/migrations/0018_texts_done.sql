-- 0018_texts_done.sql
-- Reading/listening freshness (content audit §2.2 "Reuse", s198).
--
-- The session composer drew one Lese-/Hörtext at random with nothing to
-- exclude what the learner had already read: with a theme scope active the pool
-- is 1 to 3 texts, so a scoped learner saw the same text alternate. Dialogues
-- were already tracked (progress.scenarios_done); texts were not, so there was
-- no state a composer could read.
--
-- progress.texts_done — the synced list of text ids the learner has finished,
-- unioned across devices exactly like scenarios_done. Bounded by the size of
-- the text bank itself (42 today), so it needs no retention rule.
--
-- Idempotent on purpose: the deploy runs --include-all (see CLAUDE.md
-- §Deployment), so every statement must be safe to re-run.

alter table public.progress
  add column if not exists texts_done jsonb not null default '[]'::jsonb;
