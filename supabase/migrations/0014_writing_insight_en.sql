-- 0014: English gloss of the writing tip.
--
-- The Kurz/Lang verdict is the one piece of AI prose a learner has to READ, and
-- it was German-only (founder 2026-07-31: "with an english toggle button even
-- for this section"). `evaluate-writing` now asks the model for the same tip in
-- simple English and stores it here, so the hold-to-peek EN chip works on the
-- result card AND on every past row in Verlauf.
--
-- Idempotent on purpose: CI deploys Edge Functions but skips migrations (no
-- SUPABASE_DB_PASSWORD), so this is pasted into the Dashboard SQL editor and may
-- later be re-applied by a CI run that does have the password.
--
-- Nullable with no backfill: rows written before this (and the templated
-- spelling verdict on an un-migrated database) simply have no English, and the
-- UI hides the chip rather than inventing one.
alter table public.writing_evaluations
  add column if not exists insight_en text;
