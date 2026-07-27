-- 0013_admins_table.sql
-- Move the admin gate off the email claim and onto a table of user ids.
-- (Security audit 2026-07-27, finding F1: docs/reports/security-audit-2026-07-27.md)
--
-- WHY. Until now `is_founder()` asked "does this session's JWT carry one of two
-- Gmail addresses?" (migrations 0004 / 0007 / 0008). An email address is a
-- CHANGEABLE property of an account: with "Confirm email" off in the Supabase
-- dashboard, GoTrue applies `updateUser({ email })` immediately and without any
-- proof of ownership, and the app already calls exactly that on the guest
-- upgrade path (src/store/useAuthStore.ts). Taking an address that is already
-- registered is rejected, so the gate held only because both founder addresses
-- happen to be registered accounts. That is a coincidence, not a boundary.
--
-- A user id cannot be changed by its owner, so gating on `auth.uid()` against a
-- service-role-only table removes the dependency on any auth setting.
--
-- SAFE TO RUN. The seed reads the two existing accounts out of auth.users, and
-- the guard below REFUSES to swap the function if it found nobody, because
-- swapping against an empty table would lock every admin out of /admin. Running
-- this twice is a no-op. Nothing else in the app changes: every policy and RPC
-- already calls is_founder(), so replacing its body re-points all of them at
-- once.
--
-- AFTER RUNNING: sign out and back in once on /admin to confirm you still get
-- in. If something is wrong, the rollback is at the bottom of this file.

-- ---------------------------------------------------------------------------
-- 1. The table. No client policies at all (same posture as ai_usage and
--    feedback): nobody but the service role can read or write it, and even the
--    admins themselves cannot grant admin from the browser.
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id        uuid primary key references auth.users (id) on delete cascade,
  -- Recorded for the audit trail only. NEVER read by the gate: the whole point
  -- of this migration is that the email is not what grants access.
  email_at_grant text,
  added_at       timestamptz not null default now()
);

alter table public.admins enable row level security;

-- ---------------------------------------------------------------------------
-- 2. Seed from the accounts that hold the two founder addresses TODAY. This is
--    the one moment the email is still trusted, and it runs against auth.users
--    (server side, in the SQL editor), not against a claim in someone's token.
-- ---------------------------------------------------------------------------
insert into public.admins (user_id, email_at_grant)
select u.id, lower(u.email)
  from auth.users u
 where lower(u.email) in ('thelivinsine@gmail.com', 'thesuhaspala@gmail.com')
    on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- 3. Lock-out guard. If the seed matched no account, stop here with a readable
--    error instead of installing a gate that admits nobody.
-- ---------------------------------------------------------------------------
do $$
declare
  v_n integer;
begin
  select count(*) into v_n from public.admins;
  if v_n = 0 then
    raise exception
      'public.admins is empty, so the founder gate was NOT changed. Neither founder address matched a row in auth.users. Check Authentication -> Users for the exact address you sign in with, then re-run this migration (it is safe to re-run).';
  end if;
  raise notice 'public.admins seeded with % account(s); swapping the founder gate.', v_n;
end $$;

-- ---------------------------------------------------------------------------
-- 4. The gate itself. SECURITY DEFINER because public.admins has no client
--    policies: the function must read it on the caller's behalf without giving
--    the caller any access to the table. search_path is pinned (audit F12) so
--    the body can never resolve a name through a schema someone else controls.
-- ---------------------------------------------------------------------------
create or replace function public.is_founder()
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

grant execute on function public.is_founder() to anon, authenticated;

-- Same search_path hardening for the assertion helper (audit F12). Body
-- unchanged.
create or replace function public.assert_founder()
returns void
language plpgsql
stable
set search_path = pg_catalog, public
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
-- 5. provenance_reviews still carried the hard-coded email list from 0007, the
--    last policy in the schema that did not go through is_founder(). Point it
--    at the same single source so there is exactly one place that decides.
-- ---------------------------------------------------------------------------
drop policy if exists "provenance_reviews_founder_all" on public.provenance_reviews;

create policy "provenance_reviews_founder_all" on public.provenance_reviews
  for all
  using (public.is_founder())
  with check (public.is_founder());

-- ---------------------------------------------------------------------------
-- Adding an admin later (SQL editor, one statement):
--
--   insert into public.admins (user_id, email_at_grant)
--   select id, lower(email) from auth.users where lower(email) = 'new@example.com'
--   on conflict (user_id) do nothing;
--
-- Removing one:
--
--   delete from public.admins where email_at_grant = 'old@example.com';
--
-- Keep FOUNDER_EMAILS in src/lib/admin.ts in step: it decides whether the admin
-- UI renders. It is cosmetic (the server gate is what protects the data), but a
-- new admin who is not in that list would reach a /admin that redirects home.
--
-- ROLLBACK (restores the 0008 email gate exactly):
--
--   create or replace function public.is_founder()
--   returns boolean language sql stable as $$
--     select lower(coalesce(auth.jwt() ->> 'email', '')) in
--       ('thelivinsine@gmail.com', 'thesuhaspala@gmail.com');
--   $$;
-- ---------------------------------------------------------------------------
