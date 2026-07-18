-- 0007: extend the provenance_reviews founder gate to BOTH admin accounts.
--
-- Migration 0004 locked the table to a single founder email. The /sources
-- admin workbench (s130) is available to two founder accounts, so the RLS
-- policy must accept both; otherwise the second account's review marks fail
-- server-side even though the UI renders. Keep this list in lockstep with
-- FOUNDER_EMAILS in src/lib/admin.ts.

drop policy if exists "provenance_reviews_founder_all" on public.provenance_reviews;

create policy "provenance_reviews_founder_all" on public.provenance_reviews
  for all
  using (
    (auth.jwt() ->> 'email') in ('thelivinsine@gmail.com', 'thesuhaspala@gmail.com')
  )
  with check (
    (auth.jwt() ->> 'email') in ('thelivinsine@gmail.com', 'thesuhaspala@gmail.com')
  );
