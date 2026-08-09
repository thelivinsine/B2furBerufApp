-- 0018_ai_calls.sql
-- The per-call AI usage ledger (founder s204: "how do we make sure we see real
-- usage and costs and not just estimates?").
--
-- WHY. Every AI call already reported its token counts, and every function threw
-- them away after turning them into a cost figure. Three of the four priced
-- GPT-5 at a hardcoded flat $0.004 per call, so `ai_usage.cost_estimate` could
-- not tell an expensive call from a cheap one, and nothing anywhere recorded
-- what the providers actually said. This table is the measured half: one row per
-- provider call, holding the counts the provider reported.
--
-- `ai_usage` (migration 0001) stays exactly as it is: it is the monthly spend
-- FUSE, read on every request, and a running total is the right shape for that.
-- This table is the detail behind it, and the thing a later reconciliation
-- against the providers' own usage/cost APIs gets compared to.
--
-- NO LEARNER TEXT LIVES HERE. Counts, model ids and a cost estimate only, which
-- is why the retention window below can be long without holding anyone's prose.
--
-- Safe to re-run (deploy runs `--include-all`).

-- ---------------------------------------------------------------------------
-- 1. The ledger.
-- ---------------------------------------------------------------------------
create table if not exists public.ai_calls (
  id                  bigint generated always as identity primary key,
  -- Null after the account is deleted: the aggregate spend must survive a
  -- GDPR erasure, and with no text and no user id the row is anonymous.
  user_id             uuid references auth.users (id) on delete set null,
  created_at          timestamptz not null default now(),
  -- Which surface spent it. Mirrors AiFeature in functions/_shared/aiUsage.ts;
  -- keep the two in step (the closed-enum rule, applied server-side).
  feature             text not null check (feature in (
                        'check', 'transform', 'writing_short', 'writing_long',
                        'converse_turn', 'converse_debrief')),
  provider            text not null check (provider in ('google', 'anthropic', 'openai')),
  model               text,
  input_tokens        integer not null default 0,
  output_tokens       integer not null default 0,
  -- Prompt tokens the provider served from its own cache, billed at ~0.1x.
  cached_input_tokens integer not null default 0,
  -- Derived from the tokens above at `rate_version`'s prices, NOT a bill.
  cost_estimate       numeric(12, 6) not null default 0,
  -- Which price table produced cost_estimate, so a reconciliation can tell a
  -- mispricing from a provider reprice.
  rate_version        text,
  -- True when our own cache answered and no provider call happened (cost 0).
  cache_hit           boolean not null default false,
  -- False when the call failed or returned something unusable. A losing leg of
  -- a cascade still costs money, so it is recorded rather than dropped.
  ok                  boolean not null default true
);

comment on table public.ai_calls is
  'One row per AI provider call: the token counts the provider actually reported, plus a cost derived from them. Measured usage; the cost is still an estimate until reconciled against the provider''s own usage/cost API.';

alter table public.ai_calls enable row level security;

-- Written by the Edge Functions with the service role, which bypasses RLS.
-- Learners may read their OWN rows, so a learner-facing usage readout can be
-- built without a new endpoint. There is deliberately no insert/update/delete
-- policy: nobody edits their own bill.
drop policy if exists "ai_calls_select_own" on public.ai_calls;
create policy "ai_calls_select_own" on public.ai_calls
  for select using (auth.uid() = user_id);

-- The two access patterns: a learner's own day (the readout) and a date range
-- across everyone (the admin roll-up and the nightly reconciliation).
create index if not exists ai_calls_user_time_idx on public.ai_calls (user_id, created_at desc);
create index if not exists ai_calls_time_idx on public.ai_calls (created_at desc);

-- ---------------------------------------------------------------------------
-- 2. Roll-up for the admin control centre: aggregates only, never rows
--    (the admin-RPC law in CLAUDE.md). Founder-only, checked against
--    public.admins the same way every other admin RPC is.
-- ---------------------------------------------------------------------------
create or replace function public.admin_ai_usage_breakdown(p_days integer default 30)
returns table (
  day             date,
  feature         text,
  provider        text,
  model           text,
  calls           bigint,
  input_tokens    bigint,
  output_tokens   bigint,
  cached_tokens   bigint,
  cost_estimate   numeric
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    (c.created_at at time zone 'utc')::date as day,
    c.feature,
    c.provider,
    c.model,
    count(*)                        as calls,
    sum(c.input_tokens)::bigint     as input_tokens,
    sum(c.output_tokens)::bigint    as output_tokens,
    sum(c.cached_input_tokens)::bigint as cached_tokens,
    sum(c.cost_estimate)            as cost_estimate
  from public.ai_calls c
  where exists (select 1 from public.admins a where a.user_id = auth.uid())
    and c.created_at >= now() - make_interval(days => greatest(coalesce(p_days, 30), 1))
  group by 1, 2, 3, 4
  order by 1 desc, 9 desc;
$$;

revoke all on function public.admin_ai_usage_breakdown(integer) from public, anon;
grant execute on function public.admin_ai_usage_breakdown(integer) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. Retention: 400 days, matching the client's own 400-day activity window
--    (migration 0015 §1) so the two horizons agree.
--
--    The privacy policy's retention section describes learner TEXT (2 years)
--    and account data. This table holds neither: no text, no prose, and the
--    user id goes null when the account is deleted. It is billing telemetry
--    about the app's own AI spend, kept long enough to compare one year against
--    the next. A retention timer and the copy describing it ship together, so
--    if a future change puts anything learner-identifying in here, the policy
--    section has to be revisited in the same PR.
-- ---------------------------------------------------------------------------
create or replace function public.purge_old_ai_calls(p_days integer default 400)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_cutoff timestamptz := now() - make_interval(days => greatest(p_days, 30));
  v_deleted integer;
begin
  delete from public.ai_calls where created_at < v_cutoff;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_old_ai_calls(integer) from public, anon, authenticated;

-- Scheduling is defensive for the same reason as 0015 §5: pg_cron may not be
-- available, and a hard failure here would block the Edge Function deploy that
-- runs after the migrations.
do $$
begin
  execute 'create extension if not exists pg_cron';

  begin
    perform cron.unschedule('genauly_purge_ai_calls');
  exception when others then null;
  end;

  -- Sundays, in the gap the 0015 jobs leave (they run 03:17, 03:42, 04:07).
  perform cron.schedule(
    'genauly_purge_ai_calls',
    '31 4 * * 0',
    $job$select public.purge_old_ai_calls(400)$job$
  );

  raise notice 'ai_calls retention scheduled (400d)';
exception when others then
  raise notice 'ai_calls retention NOT scheduled (%): call purge_old_ai_calls() manually', sqlerrm;
end;
$$;
