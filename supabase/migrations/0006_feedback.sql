-- 0006_feedback.sql
-- In-app feedback (founder, 2026-07-13). The subtle "Mit KI gebaut · Feedback"
-- button on every page posts to the `submit-feedback` Edge Function, which
-- stores one row here AND emails the founder. Storing a row means feedback is
-- never lost even if the email provider is down or unconfigured.
--
-- Feedback is allowed from anyone (signed-in or anonymous), so `user_id` is
-- nullable. Rows are written by the service role inside the Edge Function
-- (which bypasses RLS), so there is NO client insert policy and NO select
-- policy: the table is service-role only, like ai_usage. The founder reads it
-- from the Supabase dashboard.
--
-- Safe to re-run (idempotent). Run once in the Supabase dashboard SQL editor.

create table if not exists public.feedback (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users (id) on delete set null,
  email       text,          -- optional reply-to the submitter typed in
  message     text not null,
  page        text,          -- route the feedback was sent from
  user_agent  text,
  emailed     boolean not null default false  -- did the notification email go out?
);

alter table public.feedback enable row level security;
-- No policies: only the service role (Edge Function) can read or write this.

create index if not exists feedback_created_idx
  on public.feedback (created_at desc);
