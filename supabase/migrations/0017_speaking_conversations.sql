-- 0017_speaking_conversations.sql
-- Sprechen with an AI partner (s191): the spoken-conversation record.
--
-- WHY. Until now nothing in the Sprechen area recorded what a learner said,
-- because nothing ever heard them: the trainer replayed an authored branching
-- script answered by tapping a written option, and the Modelltest's Teil
-- Sprechen was graded by the learner ticking their own rubric checkboxes. This
-- table is what makes a spoken turn a real, gradeable artefact: one row per
-- finished conversation, holding the transcript, the AI's correction of it, and
-- which of the brief's Leitpunkte were actually achieved.
--
-- It is also the daily-allowance counter. `converse` counts rows in this table
-- for the current UTC day exactly the way `evaluate-writing` counts
-- writing_evaluations, so the "Heute noch N von M" the trainer prints and the
-- limit the server enforces are the same number by construction.
--
-- Idempotent on purpose: the deploy runs --include-all (CLAUDE.md §Deployment),
-- so every statement must be safe to re-run. `pnpm lint:migrations` gates this.

create table if not exists public.speaking_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  -- The permanent id of the Scenario or ExamSet the brief was built from.
  brief_id text,
  -- True for a Modelltest run (scored, clocked, no hints).
  exam boolean not null default false,
  -- "gespraech" | "buehne" | "anruf" — which layout it ran in.
  stage text,
  -- The whole transcript: [{ role: "partner" | "learner", text, edited? }].
  turns jsonb not null default '[]'::jsonb,
  -- The learner's own production, joined. Purged by the retention job below.
  learner_text text,
  -- The AI's correction of learner_text; the Verlauf diffs the two.
  corrected_text text,
  -- One boolean per brief goal, in the brief's order (Aufgabenerfüllung).
  goals_met jsonb not null default '[]'::jsonb,
  -- The single piece of advice, German + English, same shape as Schreiben.
  tip text,
  tip_en text,
  -- 0-100, exam runs only; null for practice.
  score smallint,
  model text,
  cost_estimate numeric(10, 6) not null default 0,
  created_at timestamptz not null default now()
);

-- The daily-limit count is (user_id, created_at); Verlauf reads newest-first.
create index if not exists speaking_conversations_user_created_idx
  on public.speaking_conversations (user_id, created_at desc);

alter table public.speaking_conversations enable row level security;

-- A learner reads and erases their own rows and nothing else. Inserts come from
-- the Edge Function under the service role, which bypasses RLS, so there is
-- deliberately no insert policy: a client cannot forge a conversation and so
-- cannot mint itself extra daily allowance.
drop policy if exists speaking_select_own on public.speaking_conversations;
create policy speaking_select_own on public.speaking_conversations
  for select using (auth.uid() = user_id);

drop policy if exists speaking_delete_own on public.speaking_conversations;
create policy speaking_delete_own on public.speaking_conversations
  for delete using (auth.uid() = user_id);

comment on table public.speaking_conversations is
  'One finished spoken conversation with the AI partner (s191): transcript, correction, goals met. Also the daily-allowance counter for the converse function.';

-- ---------------------------------------------------------------------------
-- Retention. The 730-day learner-text purge from migration 0015 has to cover
-- spoken transcripts too, or this table would quietly become the one place raw
-- learner prose lives forever. Same discipline as 0015: NULL the text columns
-- rather than delete rows, so the limits, the aggregates and the learner's own
-- Verlauf entry survive and only the raw words age out.
--
-- The privacy policy copy was updated in the SAME change (CLAUDE.md: a
-- retention timer and the copy describing it always ship together).
-- ---------------------------------------------------------------------------
create or replace function public.purge_old_learner_text(p_days integer default 730)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_cutoff timestamptz := now() - make_interval(days => greatest(p_days, 30));
  v_touched integer := 0;
  v_n integer;
begin
  update public.writing_evaluations
    set text = null, corrected_text = null
    where created_at < v_cutoff and (text is not null or corrected_text is not null);
  get diagnostics v_n = row_count;
  v_touched := v_touched + v_n;

  update public.sentence_checks
    set source_text = '', corrected = null
    where created_at < v_cutoff and source_text <> '';
  get diagnostics v_n = row_count;
  v_touched := v_touched + v_n;

  -- s191: spoken transcripts age out on the same clock. `turns` holds the same
  -- words as `learner_text` plus the partner's lines, so it is reset too.
  update public.speaking_conversations
    set learner_text = null, corrected_text = null, turns = '[]'::jsonb
    where created_at < v_cutoff
      and (learner_text is not null or corrected_text is not null or turns <> '[]'::jsonb);
  get diagnostics v_n = row_count;
  v_touched := v_touched + v_n;

  return v_touched;
end;
$$;

revoke all on function public.purge_old_learner_text(integer) from public, anon, authenticated;
