-- ---------------------------------------------------------------------------
-- 0011: task reference on writing evaluations (s167 P2)
--
-- Until now an evaluation recorded only `theme` and `length`, so the exact
-- Aufgabe behind an entry was unrecoverable once the task pools were random
-- draws: Verlauf could show the learner's text but never what they had been
-- asked to write. `task_id` stores the permanent `wt_<theme>_<s|l><nn>` id from
-- src/data/writingPrompts.ts, which lets Verlauf resolve the Aufgabe back and
-- lets us see which tasks are actually being practised.
--
-- Nullable on purpose: legacy rows have no task reference, and a client that
-- has not been updated may still omit it. Nothing reads it as required.
--
-- No RLS change: the existing per-user policies on writing_evaluations already
-- cover every column, and this adds no new access path.
-- ---------------------------------------------------------------------------

alter table public.writing_evaluations
  add column if not exists task_id text;

-- The daily limit counts per (user, day, length) and the cache looks up by
-- (user, input_hash); neither needs task_id. This index serves the coverage
-- question "which Aufgaben are being written?" without scanning the table.
create index if not exists writing_evaluations_task_id_idx
  on public.writing_evaluations (task_id)
  where task_id is not null;

comment on column public.writing_evaluations.task_id is
  'Permanent writing-task id (wt_<theme>_<s|l><nn>) from src/data/writingPrompts.ts. Nullable: legacy rows and pre-s167 clients have none.';
