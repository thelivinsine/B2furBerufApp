-- Keep the CORRECTED version of a submitted text, not just the one-line tip.
--
-- Until now an evaluation stored the learner's text plus a single `insight`
-- sentence, so the actual correction the AI produced was discarded the moment
-- the response was rendered. Verlauf could therefore show what to work on but
-- never what was wrong, which is the most valuable study material a writing
-- trainer can keep (it is the learner's own text, in their own context).
--
-- Nullable on purpose, and it stays null for:
--   * every row written before this migration,
--   * the templated spelling verdict (no LLM call, so no corrected text),
--   * an error-free text (the evaluator stores null rather than a copy of the
--     original, so the UI has nothing to toggle).
--
-- Idempotent: `SUPABASE_DB_PASSWORD` is not set in CI, so this may be applied by
-- hand in the SQL editor first and re-applied later by `supabase db push`
-- (a hand-applied migration is absent from supabase_migrations.schema_migrations).
alter table public.writing_evaluations
  add column if not exists corrected_text text;

comment on column public.writing_evaluations.corrected_text is
  'AI-corrected version of `text`; null when unavailable or when the text needed no changes. Rendered in Verlauf as an Original/Korrigiert diff.';
