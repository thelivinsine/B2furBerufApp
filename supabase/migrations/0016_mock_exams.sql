-- 0016_mock_exams.sql
-- Prüfungssimulation rework (s186): the four-part mock exam.
--
-- Two columns:
-- 1. progress.mock_exams — the synced list of finished mock-exam runs
--    ({id, level, date, total, parts}), bounded client-side to the newest 100
--    (same bounded-row discipline as daily_xp/active_days, DB audit R1).
-- 2. writing_evaluations.exam_score — the 0-100 exam score the evaluator
--    returns in exam mode, persisted so a cache hit can serve the score back
--    instead of downgrading a retaken exam to feedback-only.
--
-- Idempotent on purpose: the deploy runs --include-all (see CLAUDE.md
-- §Deployment), so every statement must be safe to re-run.

alter table public.progress
  add column if not exists mock_exams jsonb not null default '[]'::jsonb;

alter table public.writing_evaluations
  add column if not exists exam_score smallint;
