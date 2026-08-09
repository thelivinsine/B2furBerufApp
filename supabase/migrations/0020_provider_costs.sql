-- 0020_provider_costs.sql
-- What the PROVIDER says we spent (founder s205, step 2 of "how do we make sure
-- we see real usage and costs and not just estimates?").
--
-- WHY. Migration 0019 made usage measured: every call records the token counts
-- the provider reported. The COST is still ours to derive, from a rate table we
-- maintain, so it can drift from the bill in three ways: a provider repricing, a
-- model we price by fallback, or an assumption (Gemini's free tier) quietly
-- becoming false. This table holds the other side of that comparison: the daily
-- figure the provider itself publishes, pulled by the `reconcile-ai-cost` Edge
-- Function from Anthropic's Cost Report API.
--
-- The point is the DIFFERENCE, not the number. `admin_ai_reconciliation()`
-- returns ours and theirs side by side so a divergence is visible the day it
-- starts instead of at the end of a billing period.
--
-- No learner data of any kind lives here: it is one row per provider per day.
--
-- Safe to re-run.

-- ---------------------------------------------------------------------------
-- 1. The provider's own numbers.
-- ---------------------------------------------------------------------------
create table if not exists public.provider_costs (
  -- The UTC day the provider attributes the spend to.
  day        date not null,
  -- Matches ai_calls.provider, so the two sides join on a shared vocabulary.
  provider   text not null check (provider in ('google', 'anthropic', 'openai')),
  -- US dollars. Anthropic reports cents as a decimal string; the function
  -- converts once, at the edge, so nothing downstream has to remember.
  cost_usd   numeric(12, 6) not null default 0,
  -- When we last read this day from the provider. A day can be restated, so
  -- rows are upserted rather than inserted once.
  fetched_at timestamptz not null default now(),
  primary key (day, provider)
);

comment on table public.provider_costs is
  'Daily spend as the PROVIDER reports it, for comparison against our own derived ai_calls figure. One row per provider per UTC day; no learner data.';

alter table public.provider_costs enable row level security;
-- Service role only: written by the Edge Function, read through the admin RPC
-- below. No client policy of any kind.

-- ---------------------------------------------------------------------------
-- 2. Sync state, so a stale comparison can never look like a healthy one.
--    One row per provider. `last_error` is what the admin screen shows when the
--    admin key expires, which it will: the founder chose a 30-day key on
--    purpose (s205), so the failure mode is planned, not hypothetical.
-- ---------------------------------------------------------------------------
create table if not exists public.provider_sync_state (
  provider     text primary key check (provider in ('google', 'anthropic', 'openai')),
  last_ok_at   timestamptz,
  last_try_at  timestamptz,
  last_error   text,
  days_fetched integer not null default 0
);

comment on table public.provider_sync_state is
  'Last successful and last attempted reconciliation per provider, plus the last error. Read by the admin screen so a stale "ours vs theirs" is never shown as current.';

alter table public.provider_sync_state enable row level security;

-- ---------------------------------------------------------------------------
-- 3. The founder-facing comparison: aggregates only, like every admin RPC.
--    Ours comes from ai_calls (what we derived), theirs from provider_costs
--    (what they charged). A day the provider has not reported yet returns NULL
--    for theirs rather than 0, because "not yet known" and "cost nothing" are
--    different facts and only one of them is reassuring.
-- ---------------------------------------------------------------------------
create or replace function public.admin_ai_reconciliation(p_days integer default 14)
returns table (
  day        date,
  provider   text,
  ours_usd   numeric,
  theirs_usd numeric,
  calls      bigint
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  with span as (
    select (current_date - (greatest(least(coalesce(p_days, 14), 60), 1))::integer) as from_day
  ),
  ours as (
    select
      (c.created_at at time zone 'utc')::date as day,
      c.provider,
      sum(c.cost_estimate)                    as ours_usd,
      count(*)                                as calls
    from public.ai_calls c, span
    where c.created_at >= span.from_day
    group by 1, 2
  ),
  theirs as (
    select p.day, p.provider, p.cost_usd as theirs_usd
    from public.provider_costs p, span
    where p.day >= span.from_day
  )
  select
    coalesce(o.day, t.day)           as day,
    coalesce(o.provider, t.provider) as provider,
    coalesce(o.ours_usd, 0)          as ours_usd,
    t.theirs_usd                     as theirs_usd,
    coalesce(o.calls, 0)             as calls
  from ours o
  full outer join theirs t on t.day = o.day and t.provider = o.provider
  where exists (select 1 from public.admins a where a.user_id = auth.uid())
  order by 1 desc, 2;
$$;

revoke all on function public.admin_ai_reconciliation(integer) from public, anon;
grant execute on function public.admin_ai_reconciliation(integer) to authenticated;

-- The health of the comparison itself, so the screen can say "last checked
-- 3 hours ago" or "the key expired" instead of showing numbers with no date.
create or replace function public.admin_ai_sync_state()
returns table (
  provider     text,
  last_ok_at   timestamptz,
  last_try_at  timestamptz,
  last_error   text,
  days_fetched integer
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select s.provider, s.last_ok_at, s.last_try_at, s.last_error, s.days_fetched
  from public.provider_sync_state s
  where exists (select 1 from public.admins a where a.user_id = auth.uid())
  order by s.provider;
$$;

revoke all on function public.admin_ai_sync_state() from public, anon;
grant execute on function public.admin_ai_sync_state() to authenticated;

-- ---------------------------------------------------------------------------
-- 4. Retention: the same 400 days as ai_calls (0019), so the two sides of the
--    comparison always cover the same span. One row per provider per day is
--    tiny, but a table nothing ever prunes is how the last audit found trouble.
-- ---------------------------------------------------------------------------
create or replace function public.purge_old_provider_costs(p_days integer default 400)
returns integer
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_cutoff date := (current_date - greatest(p_days, 30)::integer);
  v_deleted integer;
begin
  delete from public.provider_costs where day < v_cutoff;
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

revoke all on function public.purge_old_provider_costs(integer) from public, anon, authenticated;

do $$
begin
  execute 'create extension if not exists pg_cron';

  begin
    perform cron.unschedule('genauly_purge_provider_costs');
  exception when others then null;
  end;

  -- Sundays, after the ai_calls purge at 04:31 (0019).
  perform cron.schedule(
    'genauly_purge_provider_costs',
    '52 4 * * 0',
    $job$select public.purge_old_provider_costs(400)$job$
  );

  raise notice 'provider_costs retention scheduled (400d)';
exception when others then
  raise notice 'provider_costs retention NOT scheduled (%): call purge_old_provider_costs() manually', sqlerrm;
end;
$$;
