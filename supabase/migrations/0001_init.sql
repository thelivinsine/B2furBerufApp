-- Genauly Phase 2 — initial schema
-- Auth + cloud sync + AI writing evaluation.
-- All user tables are RLS owner-only. The ai_usage table is global and
-- writable only by the service role (the Edge Function).

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user. `tier` is the monetization-ready flag.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  name         text,
  level        text,
  goal         text,
  exam_date    date,
  daily_goal_xp integer not null default 80,
  settings     jsonb not null default '{}'::jsonb,
  tier         text not null default 'free' check (tier in ('free', 'pro')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- progress: mirror of the client zustand progress store.
-- ---------------------------------------------------------------------------
create table if not exists public.progress (
  user_id          uuid primary key references auth.users (id) on delete cascade,
  xp               integer not null default 0,
  daily_xp         jsonb not null default '{}'::jsonb,
  streak           integer not null default 0,
  longest_streak   integer not null default 0,
  last_active_day  text,
  active_days      jsonb not null default '[]'::jsonb,
  srs              jsonb not null default '{}'::jsonb,
  redemittel_seen  jsonb not null default '{}'::jsonb,
  scenarios_done   jsonb not null default '[]'::jsonb,
  exams_done       jsonb not null default '[]'::jsonb,
  total_sessions   integer not null default 0,
  updated_at       timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "progress_select_own" on public.progress
  for select using (auth.uid() = user_id);
create policy "progress_insert_own" on public.progress
  for insert with check (auth.uid() = user_id);
create policy "progress_update_own" on public.progress
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- writing_evaluations: one row per AI writing review. Backs both the
-- per-user daily limit and the input-hash cache.
-- ---------------------------------------------------------------------------
create table if not exists public.writing_evaluations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  theme         text,
  length        text check (length in ('short', 'long')),
  text          text,
  weakness      text,
  insight       text,
  practice_area text,
  input_hash    text,
  cached        boolean not null default false,
  model         text,
  cost_estimate numeric(10, 6) not null default 0
);

alter table public.writing_evaluations enable row level security;

create index if not exists writing_evaluations_user_day_idx
  on public.writing_evaluations (user_id, created_at);
create index if not exists writing_evaluations_hash_idx
  on public.writing_evaluations (user_id, input_hash);

-- Users may read their own history; inserts happen via the service role in
-- the Edge Function (which bypasses RLS), so no insert policy is needed.
create policy "writing_select_own" on public.writing_evaluations
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- ai_usage: global monthly counter backing the spend auto-shutoff.
-- Service-role only (no client policies → clients cannot read or write it).
-- ---------------------------------------------------------------------------
create table if not exists public.ai_usage (
  month         text primary key,           -- 'YYYY-MM'
  calls         integer not null default 0,
  cost_estimate numeric(10, 6) not null default 0,
  updated_at    timestamptz not null default now()
);

alter table public.ai_usage enable row level security;
-- No policies: only the service role (Edge Function) can touch this table.

-- ---------------------------------------------------------------------------
-- updated_at touch triggers
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-provision a profile + progress row when a user (incl. guest) is created.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  insert into public.progress (user_id) values (new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
