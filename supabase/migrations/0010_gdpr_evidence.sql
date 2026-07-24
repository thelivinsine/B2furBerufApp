-- Admin control center · chunk 12 (compliance pack) §G4: GDPR ops evidence.
--
-- Aggregate, CONTENT-FREE evidence that the GDPR operations run: counters of
-- executed erasures (Art. 17) and data exports (Art. 15/20), plus a probe for
-- whether a pg_cron retention job is actually scheduled. The table stores ONLY
-- an event kind and a timestamp. No user id, no content, so the founder-only
-- evidence RPC returns numbers, never a row about a person. This preserves the
-- data-minimization posture of migration 0008 (aggregates only for admins).
--
-- Founder action: run this in the Supabase SQL editor (like the earlier
-- migrations), then redeploy the `delete-account` Edge Function so erasures are
-- logged. Until then `admin_gdpr_evidence()` fails soft in the client (the
-- Launch screen shows "run migration 0010").

create table if not exists public.gdpr_events (
  id bigint generated always as identity primary key,
  kind text not null check (kind in ('delete', 'export')),
  created_at timestamptz not null default now()
);

alter table public.gdpr_events enable row level security;
-- No anon/authenticated policies on purpose: the table is written only through
-- the SECURITY DEFINER helper below (and by the service role in delete-account,
-- which bypasses RLS), and read only through the founder-gated evidence RPC. So
-- no client can read the log or tamper with another kind directly.

-- Log one aggregate GDPR event. SECURITY DEFINER so a client never needs a
-- table INSERT grant; validates the kind. Callable by anon + authenticated so a
-- guest data export is counted too.
create or replace function public.log_gdpr_event(p_kind text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind not in ('delete', 'export') then
    raise exception 'invalid gdpr event kind: %', p_kind;
  end if;
  insert into public.gdpr_events (kind) values (p_kind);
end;
$$;

revoke all on function public.log_gdpr_event(text) from public;
grant execute on function public.log_gdpr_event(text) to anon, authenticated, service_role;

-- Founder-only aggregate evidence: counts + last timestamps + whether a
-- retention job is scheduled. Returns numbers only.
create or replace function public.admin_gdpr_evidence()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_retention boolean := false;
begin
  perform public.assert_founder();

  -- pg_cron may not be enabled; probe defensively so the RPC never errors.
  begin
    select exists (select 1 from cron.job) into v_retention;
  exception
    when others then v_retention := false;
  end;

  return (
    select jsonb_build_object(
      'generatedAt', now(),
      'deletions', count(*) filter (where kind = 'delete'),
      'exports', count(*) filter (where kind = 'export'),
      'last_deletion_at', max(created_at) filter (where kind = 'delete'),
      'last_export_at', max(created_at) filter (where kind = 'export'),
      'retention_scheduled', v_retention
    )
    from public.gdpr_events
  );
end;
$$;

revoke all on function public.admin_gdpr_evidence() from public, anon;
grant execute on function public.admin_gdpr_evidence() to authenticated;
