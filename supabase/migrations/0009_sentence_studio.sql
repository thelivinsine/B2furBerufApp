-- 0009_sentence_studio.sql
-- Backend for the Fokus "Satzlabor" (Schreibtraining redesign, plan:
-- docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md): the interactive
-- write -> correct -> transform loop.
--
--   1. sentence_checks     — per-sentence correction + detected grammar. Owner-only.
--   2. sentence_transforms — GLOBAL, cross-user transform cache (the main cost lever).
--   3. sentence_ai_ops     — per-user append-only ledger of PAID ai ops (backs the
--                            transform/check rate limits; cache hits are NOT recorded).
--
-- The global monthly $ fuse stays the EXISTING ai_usage table + bump_ai_usage RPC
-- (0001/0002), so this feature multiplies calls but NOT maximum monthly spend.
-- Kill-switch reuses app_config (0008): key 'sentence_studio', absent => enabled.

-- ---------------------------------------------------------------------------
-- 1. sentence_checks: source-of-truth for a checked sentence. Owner-only read;
--    inserts are service-role (Edge Function) and bypass RLS. The transform path
--    requires a check_id that resolves here, so no un-checked text is transformed.
-- ---------------------------------------------------------------------------
create table if not exists public.sentence_checks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  created_at    timestamptz not null default now(),
  source_text   text not null,
  source_hash   text not null,
  corrected     text,
  has_errors    boolean not null default false,
  grammar       jsonb not null default '{}'::jsonb,   -- detected {voice,tense,mood} of the focal sentence
  model         text,
  cached        boolean not null default false,
  cost_estimate numeric(10,6) not null default 0
);
alter table public.sentence_checks enable row level security;
create index if not exists sentence_checks_user_hash_idx on public.sentence_checks (user_id, source_hash);
create index if not exists sentence_checks_hash_idx on public.sentence_checks (source_hash);
create index if not exists sentence_checks_user_day_idx on public.sentence_checks (user_id, created_at);

drop policy if exists "sentence_checks_select_own" on public.sentence_checks;
create policy "sentence_checks_select_own" on public.sentence_checks
  for select using (auth.uid() = user_id);
drop policy if exists "sentence_checks_delete_own" on public.sentence_checks;
create policy "sentence_checks_delete_own" on public.sentence_checks
  for delete using (auth.uid() = user_id);   -- GDPR per-item erasure

-- ---------------------------------------------------------------------------
-- 2. sentence_transforms: GLOBAL cache. NOT user-scoped — a transform of a given
--    (corrected sentence + target tuple) is identical for everyone, so sharing
--    across users is the single biggest cost saver. No user_id, no PII beyond the
--    practice German sentence. Service-role only (no client RLS policies), same
--    posture as ai_usage.
-- ---------------------------------------------------------------------------
create table if not exists public.sentence_transforms (
  transform_hash text primary key,   -- hash(source_normalized | canonical target_tuple | prompt_version | model)
  source_hash    text not null,
  target_tuple   jsonb not null,
  applicable     boolean not null default true,
  reason         text,
  result         text,
  note           text,
  note_en        text,
  tier           text not null default 'llm' check (tier in ('rule','llm')),
  model          text,
  hits           integer not null default 0,
  created_at     timestamptz not null default now()
);
alter table public.sentence_transforms enable row level security;
create index if not exists sentence_transforms_source_idx on public.sentence_transforms (source_hash);
-- No client policies: only the service-role Edge Function reads/writes this cache.

-- ---------------------------------------------------------------------------
-- 3. sentence_ai_ops: append-only ledger of PAID ops (tier=llm), backs the
--    per-minute / per-day / per-month rate limits. Cache/rule hits are NOT
--    recorded (they cost nothing and must not consume a learner's budget).
--    Service-role writes; owner-read for transparency + GDPR export.
-- ---------------------------------------------------------------------------
create table if not exists public.sentence_ai_ops (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  kind       text not null check (kind in ('check','transform')),
  model      text,
  cost_estimate numeric(10,6) not null default 0
);
alter table public.sentence_ai_ops enable row level security;
create index if not exists sentence_ai_ops_user_time_idx on public.sentence_ai_ops (user_id, created_at);

drop policy if exists "sentence_ai_ops_select_own" on public.sentence_ai_ops;
create policy "sentence_ai_ops_select_own" on public.sentence_ai_ops
  for select using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 4. Kill-switch seed (optional; absent key => feature enabled by the compiled
--    default in the functions). Founder flips it from /admin Steuerung, no redeploy.
-- ---------------------------------------------------------------------------
insert into public.app_config (key, value)
  values ('sentence_studio', '{"enabled": true, "transforms_disabled": false}'::jsonb)
  on conflict (key) do nothing;

-- ---------------------------------------------------------------------------
-- 5. Best-effort popularity counter for a cached transform (drives the admin
--    cache-hit-rate metric). SECURITY DEFINER, service-role only.
-- ---------------------------------------------------------------------------
create or replace function public.bump_transform_hit(p_hash text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.sentence_transforms set hits = hits + 1 where transform_hash = p_hash;
$$;
revoke all on function public.bump_transform_hit(text) from public, anon, authenticated;
