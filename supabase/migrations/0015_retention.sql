-- 0015_retention.sql
-- Data-retention jobs + the folded-active-days counter.
-- (Database architecture audit 2026-08-04, findings R4 and R1:
--  docs/reports/db-architecture-audit-2026-08-04.md)
--
-- WHY. Nothing in this database was ever deleted. Every visitor who tapped into
-- the app left a permanent anonymous account behind, every AI transform ever
-- computed stayed cached whether or not it was reused again, and migration 0010
-- built a probe for "is a retention job scheduled?" that has reported false
-- since the day it shipped, because no job was ever created. This migration
-- schedules the two purges that are safe to run unattended, and adds the third
-- (learner text) as a function that is deliberately NOT scheduled: see §4.
--
-- Safe to re-run. Every statement is idempotent, including the cron schedules,
-- which are unscheduled before being (re-)created.

-- ---------------------------------------------------------------------------
-- 1. progress.active_days_folded (audit R1)
--    The client now keeps only the last 400 days in `active_days` / `daily_xp`
--    and folds the number of dropped ACTIVE days into this counter, so the
--    lifetime "N aktive Tage" figure survives the trim. Default 0 covers every
--    existing row: nothing has been trimmed yet, so nothing has been folded.
-- ---------------------------------------------------------------------------
alter table public.progress
  add column if not exists active_days_folded integer not null default 0;

comment on column public.progress.active_days_folded is
  'Active days that aged out of active_days when the 400-day client retention window moved. Lifetime total = jsonb_array_length(active_days) + active_days_folded.';

-- ---------------------------------------------------------------------------
-- 2. Purge abandoned guest accounts.
--    An anonymous account is created for every visitor who starts the app. One
--    that has not been active for 90 days is an abandoned trial, not a learner:
--    it holds no email, so it can never be signed back into, and its owner has
--    no way to return to it. Deleting the auth user cascades to profiles,
--    progress, writing_evaluations, sentence_checks and sentence_ai_ops.
--
--    Registered accounts are never touched here, whatever their age: the
--    privacy policy promises their data lives as long as the account does.
-- ---------------------------------------------------------------------------
create or replace function public.purge_stale_guests(p_days integer default 90)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_cutoff timestamptz := now() - make_interval(days => greatest(p_days, 7));
  v_deleted integer;
begin
  with victims as (
    delete from auth.users u
    where u.is_anonymous
      and u.created_at < v_cutoff
      -- Never delete an account that is still in use: `progress.updated_at` is
      -- touched by the sync trigger on every write-through.
      and coalesce(
        (select p.updated_at from public.progress p where p.user_id = u.id),
        u.created_at
      ) < v_cutoff
    returning 1
  )
  select count(*) into v_deleted from victims;
  return v_deleted;
end;
$$;

revoke all on function public.purge_stale_guests(integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 3. Purge dead transform-cache rows.
--    `sentence_transforms` is keyed by a hash that includes the prompt version
--    and the model, so every prompt or model change strands the previous
--    generation of rows forever. A row that has never been reused in 60 days
--    never will be: its hash can only be hit again by the exact same sentence
--    under the exact same prompt and model. `hits` is bumped on every cache
--    hit, so `hits = 0` is precisely "computed once, never reused".
--
--    No personal data is involved (the table holds practice German sentences
--    and no user id), so this is pure cost hygiene.
-- ---------------------------------------------------------------------------
create or replace function public.purge_transform_cache(p_days integer default 60)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_deleted integer;
begin
  with victims as (
    delete from public.sentence_transforms
    where hits = 0
      and created_at < now() - make_interval(days => greatest(p_days, 7))
    returning 1
  )
  select count(*) into v_deleted from victims;
  return v_deleted;
end;
$$;

revoke all on function public.purge_transform_cache(integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4. Learner-text retention: BUILT, NOT SCHEDULED. Founder decision required.
--
--    The audit flagged indefinite retention of learner writing (finding F11 of
--    the 2026-07-27 security audit). It cannot simply be switched on, because
--    the published privacy policy currently promises the opposite:
--
--      "Schreibeinreichungen und ihr KI-Feedback bleiben gespeichert, damit
--       dein Analyseverlauf vollstaendig bleibt."
--
--    Deleting learner text on a timer would contradict that sentence, and the
--    learner's own Verlauf is the feature that promise describes. So this
--    function exists, is tested by being callable by hand, and is scheduled
--    only if the founder decides to shorten retention AND the privacy policy is
--    updated in the same change.
--
--    It NULLS the text columns rather than deleting rows, so the daily/monthly
--    AI limits, the cache bookkeeping and the admin aggregates keep working on
--    history that no longer holds anyone's prose.
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

  return v_touched;
end;
$$;

revoke all on function public.purge_old_learner_text(integer) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5. Schedule the two safe jobs.
--    pg_cron may not be enabled on the project, and a hard failure here would
--    fail the migration step of the deploy workflow, which runs BEFORE the Edge
--    Function deploys and would therefore block those too. So the whole block
--    is defensive: if pg_cron cannot be enabled or scheduled, the migration
--    still succeeds and the functions above remain callable by hand.
--
--    After this runs, admin_gdpr_evidence().retention_scheduled (migration
--    0010) reports true, which is the evidence it was written to collect.
-- ---------------------------------------------------------------------------
do $$
begin
  -- EXECUTE so the statement is planned at runtime: on a project without the
  -- extension available this raises where the handler below can catch it.
  execute 'create extension if not exists pg_cron';

  -- Idempotent (re-)scheduling: unschedule by name first, ignoring "not found".
  begin
    perform cron.unschedule('genauly_purge_stale_guests');
  exception when others then null;
  end;
  begin
    perform cron.unschedule('genauly_purge_transform_cache');
  exception when others then null;
  end;

  -- Sundays 03:17 UTC and 03:42 UTC. Off-peak, and not on the hour, so they do
  -- not pile onto whatever else the platform runs at :00.
  perform cron.schedule(
    'genauly_purge_stale_guests',
    '17 3 * * 0',
    $job$select public.purge_stale_guests(90)$job$
  );
  perform cron.schedule(
    'genauly_purge_transform_cache',
    '42 3 * * 0',
    $job$select public.purge_transform_cache(60)$job$
  );

  raise notice 'retention jobs scheduled (guests 90d, transform cache 60d)';
exception
  when others then
    raise warning 'pg_cron unavailable (%), retention functions installed but NOT scheduled. Enable pg_cron under Database -> Extensions, then re-run this migration.', sqlerrm;
end $$;
