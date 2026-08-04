# Database architecture audit — 2026-08-04 (session 185)

Prompted by the founder's concern that "the database architecture is concerningly linear."
Scope: the full Supabase layer — all 14 migrations, the 5 Edge Functions, the client sync
protocol (`src/lib/cloudSync.ts`), the admin RPCs, and how each part will behave as the
product grows. Security findings from the 2026-07-27 audit
(`docs/reports/security-audit-2026-07-27.md`) are not re-reported; where one is still open
and relevant it is referenced by its F-number.

## Verdict

**The "linear" shape is deliberate and mostly correct, not a flaw.** The schema diagram
looks like a line because there is almost nothing to relate: the entire content catalog
(~5,000 ids across vocabulary, collocations, Redemittel, grammar, tasks, missions) lives in
the repo as versioned TypeScript, not in the database. The database stores only three kinds
of things, and each is a small star around `auth.users`:

1. **Per-learner state** — `profiles`, `progress`, `writing_evaluations`,
   `sentence_checks`, `sentence_ai_ops` (owner-only RLS).
2. **Operations** — `feedback`, `ai_usage`, `gdpr_events`, `admins`, `app_config`,
   `launch_checklist`, `provenance_reviews` (service-role or founder-gated).
3. **One global cache** — `sentence_transforms` (service-role only).

For a solo-founder product at this scale, that is the right architecture: content in git
gets review, linting, provenance and free hosting; the database carries only what must be
per-user or server-authoritative. A "richer" relational model of the content would add
operational burden and remove the content gates, for no learner-visible benefit.

**What is genuinely concerning is not the shape but the growth curve.** Almost every
structure in the system grows linearly forever and nothing is ever trimmed, and the sync
protocol ships the whole accumulated state on nearly every write. None of this hurts today
(small user count, young accounts); all of it degrades smoothly and silently as accounts
age and users accumulate. The findings below are ranked by how much they will matter.

## What is healthy (verified, keep as is)

- **RLS posture**: every user table is owner-only; money/ops tables have no client
  policies at all; the founder gate is a single `is_founder()` against the service-role-only
  `admins` table (0013 closed audit F1). Admin RPCs return aggregates only.
- **Spend safety is layered**: global monthly fuse (`ai_usage` + `MONTHLY_SPEND_CAP_USD`),
  per-user daily and monthly caps, input length caps, a global cross-user transform cache
  with a hash key, and an `app_config` kill switch. A runaway bill is structurally hard.
- **Merge-on-login is convergent by construction**: `Math.max` for counters, set-union for
  lists, higher-`reps` for SRS cards (and `reps` is monotonic under FSRS precisely so this
  merge stays safe). Guest progress survives sign-in; account switching on a shared device
  wipes first (s174 law).
- **Migrations are idempotent by convention** and self-applying on merge (s179), with
  `list_only` / `probe_schema` / `repair_applied` escape hatches.
- **Id permanence is respected end to end**: `ID_RENAMES` is applied to the remote row
  before merging, and the zustand persist `migrate` applies it locally, so renamed content
  ids collapse instead of forking progress.

## Findings

### R1 — The progress row is one ever-growing blob, re-uploaded whole on nearly every action

`progress` is a single row per learner whose real payload is JSONB: `srs` (one entry per
card ever learned; the catalog is ~5,000 ids and an `SrsCard` serializes to roughly 150–250
bytes), `daily_xp` and `active_days` (one entry per day of account life, forever),
`exams_done`, `saved_words`. A dedicated one-year learner plausibly carries a 300–800 KB
row.

`cloudSync` pushes the **entire row** on a 1.5 s debounce after any store change. During an
SRS session every answer mutates the store, so the whole blob goes up roughly every couple
of seconds of active review. Costs, in the order they will appear:

- **Learner bandwidth** (mobile, PWA): hundreds of KB per review answer, uphill.
- **Postgres write amplification**: each upsert rewrites the whole TOASTed row — dead
  tuples, WAL and autovacuum churn scale with blob size × write rate.
- **Egress**: every login pulls the full row back down.

**Recommendation (near-term, cheap):** cap the per-day maps. Keep ~400 days of `daily_xp`
and `active_days` in the blob and fold anything older into two scalar columns
(`lifetime_days`, `lifetime_xp` already effectively exists as `xp`). The analytics graphs
never show more than a year. This bounds the two structures that grow with *time* rather
than with *learning*, which are the ones a learner cannot see or benefit from.

**Recommendation (medium-term, the real fix):** move `srs` out of the blob into a table
`srs_cards (user_id, content_id, card jsonb, updated_at)` with per-card upserts. A review
then writes ~200 bytes instead of the whole row, and R2 disappears as a side effect. This
is the single highest-leverage schema change available; do it before, not after, growth.

### R2 — Between logins, sync is whole-row last-write-wins

The careful max/union merge runs **only** in `startCloudSync` (login/session start). After
that, every push is a full-row upsert: two devices (or two browser tabs) signed into the
same account overwrite each other's entire row, last writer wins. The design mostly
self-heals — the next login merge re-unions what both sides kept locally, and the
higher-`reps` rule protects SRS ratchets — but two real losses exist:

- Reviews of the **same card on two devices in one day**: one device's review is discarded
  by the merge (same `reps` bump, one winner).
- A device that pushes and is then **retired before its next login** leaves its last
  session invisible if another device overwrote it in the window.

This is an accepted tradeoff today, but it is accepted implicitly. The `srs_cards` table in
R1 makes the write unit a card instead of an account, which shrinks the clobber window from
"everything" to "one card", server-side, with a `where excluded.reps > srs_cards.reps`
guard.

**Recommendation:** fold into R1's medium-term fix; until then, document the tradeoff (this
report does).

### R3 — Push failures are invisible: the error channel is never read

`supabase-js` does not throw on HTTP/RLS errors; it returns `{ error }`. `pushProgress()`
and `pushSettings()` `await` the call inside a `try/catch` and **never look at the
result**, so only network-level exceptions are even swallowed knowingly; a 4xx (expired
session that failed to refresh, RLS denial, quota) is silently treated as success, forever.
Only `pushProgressNow()` (the reset path) checks. A learner whose pushes always fail sees a
perfectly working app — localStorage keeps working — and discovers the truth when the
device is lost. This is the riskiest *silent* failure mode in the system because the
offline-first design is explicitly built on "the cloud row is the backup," and nothing
verifies the backup is happening.

**Recommendation:** read `error` in both push helpers; on repeated consecutive failures
(say 3+) set a store flag and show a quiet non-blocking indicator in Einstellungen /
profile ("Cloud-Sync pausiert, letzte Sicherung: …") plus a retry with backoff. Roughly a
40-line change, no schema impact.

### R4 — Nothing is ever deleted: every operational table grows linearly forever

- **Anonymous guests**: every visitor who taps into the app gets an `auth.users` row plus
  `profiles` + `progress` rows via the signup trigger, permanently. Abandoned guests will
  eventually dominate the user tables and skew the admin account metrics.
- **Learner text is kept indefinitely** in `writing_evaluations` and `sentence_checks`
  (known: audit F11, still open). This is a GDPR data-minimization exposure, and the
  biggest tables in the system are the ones holding free-text.
- **`sentence_transforms`** is keyed by `hash(source | target | prompt_version | model)`,
  so every prompt or model bump strands the previous generation of cache rows forever; no
  eviction exists.
- Migration 0010 built the **evidence probe for a retention job** (`retention_scheduled`)
  — it reports `false` because no `pg_cron` job has ever been scheduled. The schema
  expects retention; retention does not exist.

**Recommendation:** one `pg_cron` migration with three jobs: (a) delete anonymous accounts
inactive > 90 days (`is_anonymous` + `progress.updated_at`; the cascades clean everything),
(b) null out `text`/`corrected_text`/`source_text` older than the retention period the
privacy policy promises (keep the rows for limits/metrics), (c) purge `sentence_transforms`
rows whose `prompt_version` is no longer current and `hits = 0` after 60 days. This closes
F11, makes the 0010 evidence real, and flattens all three growth curves at once.

### R5 — Admin analytics recompute from the blobs, O(users × account-age) per dashboard view

`admin_daily_series()` cross-joins every `progress` row against its unbounded
`active_days` array; `admin_overview()` counts the JSON keys of every `srs` blob. Both are
sequential scans whose cost grows with user count × account age, run synchronously on the
same database serving learners, every time the cockpit renders. At hundreds of users this
is milliseconds; at 10k year-old accounts it is multi-second scans per admin page load.

**Recommendation:** nothing now. When the cockpit feels slow, add a nightly `pg_cron`
rollup into a small `daily_stats` table and point the RPCs at it. Trimming `active_days`
(R1) also directly bounds the worst query. Noted here so the fix is designed, not
rediscovered.

### R6 — Migration idempotency is a convention with no gate

The self-applying pipeline runs `db push --include-all`, which re-applies any file missing
from remote history — safe only while every file stays idempotent. That rule lives in
comments. One future `create policy` without a preceding `drop policy if exists` (or a bare
`create table`) fails the Supabase workflow and, because migrations run **before** function
deploys, also blocks every Edge Function deploy behind it.

**Recommendation:** a ~30-line check in `validate.yml` (or `scripts/`) that greps staged
migrations for non-idempotent patterns: `create table` without `if not exists`,
`create policy` without a paired `drop policy if exists`, `alter table … add column`
without `if not exists`, `create index` without `if not exists`. Cheap insurance for a
non-technical-founder pipeline where a red backend deploy is expensive to diagnose.

### R7 — Known-open items from the 2026-07-27 audit that are architectural

- **F6**: the AI limits are check-then-act; parallel requests can slip past a boundary.
  Bounded by the global monthly fuse; still accepted risk.
- **F11**: retention — folded into R4 above.

### R8 — Minor notes (no action urgency)

- `profiles.settings` round-trips the **entire** settings store (minus functions) and
  `mergeRemoteSettings` spreads it back blindly: a stale cloud blob can resurrect removed
  settings keys, and any future store field is silently cloud-persisted. Consider an
  explicit key whitelist on push, or a `settingsVersion` field, next time the store gains a
  sensitive field.
- `progressRow()` sets `updated_at` client-side; the touch trigger overwrites it anyway.
  Harmless; the client field could be dropped for clarity.
- `exams_done` merges on `id|date|score`, so two genuine same-day attempts with the same
  score collapse into one. Cosmetic.
- `profiles.tier` (`free`/`pro`) is in place and unused — correctly monetization-ready.

## Priority order, in plain language

| # | Action | Effort | When |
|---|--------|--------|------|
| 1 | Read the push result; show a quiet "sync failing" indicator (R3) | Small | Soon |
| 2 | Retention jobs: stale guests, old learner text, dead cache rows (R4) | Small-medium | Soon |
| 3 | Cap `daily_xp` / `active_days` to ~400 days (R1) | Small | Soon |
| 4 | Idempotency lint for migrations (R6) | Small | Whenever |
| 5 | Split `srs` into a per-card table (R1+R2) | Medium | Before serious growth |
| 6 | Rollup table for admin analytics (R5) | Medium | When the cockpit slows |

Items 1–4 are independent, low-risk, and together remove every *silent* failure mode found.
Item 5 is the one real schema evolution this architecture will eventually need; everything
else about the "linear" design can stay linear on purpose.
