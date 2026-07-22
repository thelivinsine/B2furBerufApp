-- 0008_admin_center.sql
-- Admin control center backend foundation (build plan chunk 1, session 144).
-- Everything the /admin center reads or writes in the database is created here:
--
--   1. provenance_reviews widened from a boolean to a real review DECISION
--      (approve | reject | needs_fix) with the decision-time content hash that
--      the apply:reviews loop-closer (chunk 2) compares before flipping repo
--      rows to "verified".
--   2. feedback triage columns (status / priority / note / link) per the
--      founder's 2026-07-22 decision.
--   3. app_config: the Steuerung remote-config store. World-READABLE (the app
--      itself consumes it at startup), founder-only WRITABLE.
--   4. launch_checklist: founder-only launch checklist state, synced across
--      devices.
--   5. is_founder() / assert_founder() + founder-gated SECURITY DEFINER RPCs
--      that return AGGREGATES ONLY (counts, sums, day series). No RPC ever
--      returns individual learner data; profiles/progress/writing_evaluations
--      keep their owner-only RLS untouched. The one per-row exception is the
--      feedback table: those rows are operational messages addressed to the
--      founder.
--
-- The founder email gate mirrors migrations 0004/0007. Keep the email list in
-- is_founder() in lockstep with FOUNDER_EMAILS in src/lib/admin.ts and the
-- provenance_reviews policy (0007); tests/admin.test.ts pins this file against
-- the client list.
--
-- Safe to re-run (idempotent). Run once in the Supabase dashboard SQL editor.

-- ---------------------------------------------------------------------------
-- Founder gate helpers. is_founder() is the single email source for every
-- policy and RPC in this migration.
-- ---------------------------------------------------------------------------
create or replace function public.is_founder()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) in (
    'thelivinsine@gmail.com',
    'thesuhaspala@gmail.com'
  );
$$;

grant execute on function public.is_founder() to anon, authenticated;

create or replace function public.assert_founder()
returns void
language plpgsql
stable
as $$
begin
  if not public.is_founder() then
    raise exception 'forbidden: founder account required'
      using errcode = '42501';
  end if;
end;
$$;

revoke all on function public.assert_founder() from public, anon;
grant execute on function public.assert_founder() to authenticated;

-- ---------------------------------------------------------------------------
-- 1. provenance_reviews: boolean checkbox -> review decision + safety hash.
--    `verified` stays (the current AdminWorkbench still writes it until the
--    chunk-2 client lands); existing verified=true rows backfill to
--    decision='approve'. Legacy rows have no content_hash: apply:reviews
--    treats a null hash as "needs re-review", never as a free pass.
-- ---------------------------------------------------------------------------
alter table public.provenance_reviews
  add column if not exists decision text
    check (decision in ('approve', 'reject', 'needs_fix')),
  add column if not exists content_hash text,
  add column if not exists reviewer_email text,
  add column if not exists applied_at timestamptz,
  add column if not exists applied_sha text;

update public.provenance_reviews
  set decision = 'approve'
  where verified and decision is null;

-- Best-effort backfill of the reviewer email from the stored user id.
update public.provenance_reviews r
  set reviewer_email = lower(u.email)
  from auth.users u
  where u.id = r.reviewed_by and r.reviewer_email is null;

-- ---------------------------------------------------------------------------
-- 2. feedback triage fields (founder decision 2026-07-22: all four).
--    The table stays service-role only at the table level (no client
--    policies); the founder reads/updates it through the gated RPCs below.
-- ---------------------------------------------------------------------------
alter table public.feedback
  add column if not exists status text not null default 'neu'
    check (status in ('neu', 'erledigt', 'verworfen')),
  add column if not exists priority text not null default 'normal'
    check (priority in ('hoch', 'normal', 'niedrig')),
  add column if not exists note text,
  add column if not exists link text;

-- ---------------------------------------------------------------------------
-- 3. app_config: Steuerung remote config (key/value jsonb rows).
--    Everyone may READ (the app fetches it at startup and falls back to
--    compiled defaults when offline/unset); only founder emails may WRITE.
-- ---------------------------------------------------------------------------
create table if not exists public.app_config (
  key        text primary key,
  value      jsonb not null,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

drop policy if exists "app_config_read_all" on public.app_config;
create policy "app_config_read_all" on public.app_config
  for select using (true);

drop policy if exists "app_config_founder_insert" on public.app_config;
create policy "app_config_founder_insert" on public.app_config
  for insert with check (public.is_founder());

drop policy if exists "app_config_founder_update" on public.app_config;
create policy "app_config_founder_update" on public.app_config
  for update using (public.is_founder()) with check (public.is_founder());

drop policy if exists "app_config_founder_delete" on public.app_config;
create policy "app_config_founder_delete" on public.app_config
  for delete using (public.is_founder());

drop trigger if exists app_config_touch on public.app_config;
create trigger app_config_touch before update on public.app_config
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 4. launch_checklist: founder-only, synced across devices. Items are seeded
--    by the admin UI (chunk 6); this is just the state store.
-- ---------------------------------------------------------------------------
create table if not exists public.launch_checklist (
  item_id    text primary key,
  done       boolean not null default false,
  note       text,
  updated_by text,
  updated_at timestamptz not null default now()
);

alter table public.launch_checklist enable row level security;

drop policy if exists "launch_checklist_founder_all" on public.launch_checklist;
create policy "launch_checklist_founder_all" on public.launch_checklist
  for all using (public.is_founder()) with check (public.is_founder());

drop trigger if exists launch_checklist_touch on public.launch_checklist;
create trigger launch_checklist_touch before update on public.launch_checklist
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- 5. Founder-gated RPCs (SECURITY DEFINER, aggregates only).
--    Gate = assert_founder() in the body (the 0004/0007 email pattern); the
--    definer context is what lets them aggregate over auth.users and the
--    owner-only tables WITHOUT adding any admin SELECT policies to them.
--    Executable by `authenticated` only (guests are anonymous sessions on the
--    authenticated role, so the in-body email check is the real boundary).
-- ---------------------------------------------------------------------------

-- One jsonb of headline aggregates for the Uebersicht cockpit tiles.
create or replace function public.admin_overview()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_accounts jsonb;
  v_activity jsonb;
  v_ai       jsonb;
  v_feedback jsonb;
  v_reviews  jsonb;
  v_month    text := to_char(now(), 'YYYY-MM');
  v_today    text := to_char(current_date, 'YYYY-MM-DD');
begin
  perform public.assert_founder();

  select jsonb_build_object(
    'total', count(*),
    'anonymous', count(*) filter (where is_anonymous),
    'google', count(*) filter (
      where not is_anonymous
        and coalesce(raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'
    ),
    'email', count(*) filter (
      where not is_anonymous
        and not coalesce(raw_app_meta_data -> 'providers', '[]'::jsonb) ? 'google'
    ),
    'new7d', count(*) filter (where created_at >= now() - interval '7 days')
  )
  into v_accounts
  from auth.users;

  select jsonb_build_object(
    'activeToday', count(*) filter (where last_active_day = v_today),
    'active7d', count(*) filter (
      where last_active_day >= to_char(current_date - 6, 'YYYY-MM-DD')
    ),
    'totalSessions', coalesce(sum(total_sessions), 0),
    'totalXp', coalesce(sum(xp), 0),
    'srsCards', coalesce(sum(
      case when jsonb_typeof(srs) = 'object'
        then (select count(*) from jsonb_object_keys(srs))
        else 0
      end
    ), 0)
  )
  into v_activity
  from public.progress;

  select jsonb_build_object(
    'month', v_month,
    'calls', coalesce((select calls from public.ai_usage where month = v_month), 0),
    'costEstimate',
      coalesce((select cost_estimate from public.ai_usage where month = v_month), 0),
    'evals30d', (
      select count(*) from public.writing_evaluations
      where created_at >= now() - interval '30 days'
    ),
    'cachedEvals30d', (
      select count(*) filter (where cached) from public.writing_evaluations
      where created_at >= now() - interval '30 days'
    )
  )
  into v_ai;

  select jsonb_build_object(
    'total', count(*),
    'neu', count(*) filter (where status = 'neu'),
    'emailedToday', count(*) filter (
      where emailed and created_at >= current_date
    )
  )
  into v_feedback
  from public.feedback;

  select jsonb_build_object(
    'decided', count(*) filter (where decision is not null),
    'approvedUnapplied', count(*) filter (
      where decision = 'approve' and applied_at is null
    ),
    'rejectedOpen', count(*) filter (
      where decision = 'reject' and applied_at is null
    ),
    'needsFixOpen', count(*) filter (
      where decision = 'needs_fix' and applied_at is null
    )
  )
  into v_reviews
  from public.provenance_reviews;

  return jsonb_build_object(
    'generatedAt', now(),
    'accounts', v_accounts,
    'activity', v_activity,
    'ai', v_ai,
    'feedback', v_feedback,
    'reviews', v_reviews
  );
end;
$$;

revoke all on function public.admin_overview() from public, anon;
grant execute on function public.admin_overview() to authenticated;

-- Last 30 days of signups + active learners as [{day, signups, actives}].
-- Aggregate counts per day only; no user identifiers leave the function.
create or replace function public.admin_daily_series()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_from date := current_date - 29;
  result jsonb;
begin
  perform public.assert_founder();

  with span as (
    select to_char(d, 'YYYY-MM-DD') as day
    from generate_series(v_from, current_date, interval '1 day') d
  ),
  signups as (
    select to_char(created_at, 'YYYY-MM-DD') as day, count(*) as n
    from auth.users
    where created_at >= v_from
    group by 1
  ),
  actives as (
    select d.value as day, count(distinct p.user_id) as n
    from public.progress p
    cross join lateral jsonb_array_elements_text(
      case when jsonb_typeof(p.active_days) = 'array'
        then p.active_days else '[]'::jsonb end
    ) as d(value)
    where d.value >= to_char(v_from, 'YYYY-MM-DD')
    group by 1
  )
  select coalesce(jsonb_agg(jsonb_build_object(
    'day', span.day,
    'signups', coalesce(signups.n, 0),
    'actives', coalesce(actives.n, 0)
  ) order by span.day), '[]'::jsonb)
  into result
  from span
  left join signups on signups.day = span.day
  left join actives on actives.day = span.day;

  return result;
end;
$$;

revoke all on function public.admin_daily_series() from public, anon;
grant execute on function public.admin_daily_series() to authenticated;

-- The newest n feedback rows (default 50, capped at 500) for the inbox.
create or replace function public.admin_feedback_recent(p_limit integer default 50)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  perform public.assert_founder();

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', f.id,
    'createdAt', f.created_at,
    'userId', f.user_id,
    'email', f.email,
    'message', f.message,
    'page', f.page,
    'userAgent', f.user_agent,
    'emailed', f.emailed,
    'status', f.status,
    'priority', f.priority,
    'note', f.note,
    'link', f.link
  ) order by f.created_at desc), '[]'::jsonb)
  into result
  from (
    select * from public.feedback
    order by created_at desc
    limit greatest(1, least(coalesce(p_limit, 50), 500))
  ) f;

  return result;
end;
$$;

revoke all on function public.admin_feedback_recent(integer) from public, anon;
grant execute on function public.admin_feedback_recent(integer) to authenticated;

-- Triage one feedback row. Null leaves a field unchanged; an empty string
-- clears note/link.
create or replace function public.admin_feedback_update(
  p_id uuid,
  p_status text default null,
  p_priority text default null,
  p_note text default null,
  p_link text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_founder();

  if p_status is not null and p_status not in ('neu', 'erledigt', 'verworfen') then
    raise exception 'invalid status: %', p_status;
  end if;
  if p_priority is not null and p_priority not in ('hoch', 'normal', 'niedrig') then
    raise exception 'invalid priority: %', p_priority;
  end if;

  update public.feedback
  set status   = coalesce(p_status, status),
      priority = coalesce(p_priority, priority),
      note     = case when p_note is null then note
                      when p_note = '' then null
                      else p_note end,
      link     = case when p_link is null then link
                      when p_link = '' then null
                      else p_link end
  where id = p_id;

  if not found then
    raise exception 'feedback row not found: %', p_id;
  end if;
end;
$$;

revoke all on function public.admin_feedback_update(uuid, text, text, text, text)
  from public, anon;
grant execute on function public.admin_feedback_update(uuid, text, text, text, text)
  to authenticated;
