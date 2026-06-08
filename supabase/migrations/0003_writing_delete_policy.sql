-- 0003_writing_delete_policy.sql
-- Lets a signed-in user delete their own writing submissions from the app
-- (GDPR right to erasure, per-item). Inserts still happen only via the service
-- role in the evaluate-writing Edge Function, so no insert policy is added.
--
-- Without this policy a client DELETE silently affects 0 rows (RLS denies it),
-- so this MUST be applied before shipping the per-row delete button.

create policy "writing_delete_own"
  on public.writing_evaluations
  for delete
  using (auth.uid() = user_id);
