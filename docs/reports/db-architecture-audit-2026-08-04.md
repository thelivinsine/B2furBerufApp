# Database architecture audit — 2026-08-04 (session 185)

> **Status (same session):** the founder approved the four small fixes and they shipped. R3, R4
> (partly), R1 and R6 are **fixed below**; R2 and R5 remain open by design, and the learner-text
> half of R4 is **blocked on a founder decision** (the privacy policy currently promises the
> opposite). Each finding carries its own status line.

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

**FIXED (near-term half, s185).** `RETAIN_DAYS = 400` in `src/store/useProgressStore.ts`;
`trimDayMaps()` drops older entries from both day maps and folds the dropped ACTIVE days
into the new `activeDaysFolded` counter (cloud column `progress.active_days_folded`,
migration 0015). Folding runs in `touchStreak`, i.e. once per day at rollover, not on the
review hot path. The learner-visible lifetime figure is unchanged: the Fortschritt activity
calendar now renders `activeDays.length + activeDaysFolded`. Merge-safe across devices
(`Math.max` on the counter, each device incrementing from the same synced base);
`tests/retention.test.ts` pins the window, the fold and the lifetime total.
**The `srs` split (medium-term) is NOT done and remains the one real schema evolution.**

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

**FIXED (s185).** Both push helpers now read `{ error }` and return a boolean; `settle()`
tracks consecutive failures per channel (progress / settings separately, so one healthy row
cannot mask a stuck one) and schedules a backed-off retry (5 s → 20 s → 60 s → 5 min). Three
consecutive failures flip `useAuthStore.syncHealth` to `"failing"`, which the Settings
account panel renders as an amber "Sync pausiert" badge plus one line of plain German, the
last successful backup time, and an always-live "Erneut versuchen" button
(`retryCloudSync()`). Recovery clears the alarm and stamps `lastSyncedAt`. A transient
failure therefore heals itself and is never shown; a persistent one can no longer hide.
`tests/cloudSync.test.ts` pins the threshold, the recovery and the healthy path.

The same change added an **unknown-column safety net**: the site deploy and the migration
deploy are independent workflows, so a build that writes a newly added column can go live
minutes before the column exists, and an unknown column fails the WHOLE upsert. On a
PGRST204/42703 error the push retries once with the young columns removed, so that window
degrades to "the new field waits" instead of "every push fails".

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

**PARTLY FIXED (s185), migration `0015_retention.sql`.**
- (a) **Done and scheduled.** `purge_stale_guests(90)` runs Sundays 03:17 UTC. An anonymous
  account holds no email, so its owner can never sign back into it; after 90 days with no
  write it is an abandoned trial and the cascade removes every dependent row. Registered
  accounts are never touched, whatever their age. The privacy policy gained a paragraph
  stating this rule, because the code now does something the policy did not describe.
- (c) **Done and scheduled.** `purge_transform_cache(60)` runs Sundays 03:42 UTC and deletes
  cache rows with `hits = 0` older than 60 days. (Correction to the finding above: the table
  has no `prompt_version` column, the prompt version is baked into the hash key, so
  "never reused" is the workable criterion and `hits = 0` states it exactly.) No personal
  data is involved.
- (b) **BUILT BUT NOT SCHEDULED, founder decision required.** `purge_old_learner_text()`
  exists and nulls the text columns (keeping rows so limits and aggregates still work), but
  scheduling it would contradict the published privacy policy, which promises the opposite in
  as many words: *"Schreibeinreichungen und ihr KI-Feedback bleiben gespeichert, damit dein
  Analyseverlauf vollständig bleibt."* That promise describes the learner's own Verlauf, a
  real feature. Turning the job on is therefore a product decision plus a policy edit in the
  same change, not a maintenance task. **Audit F11 stays open until then.**

Because a job is now scheduled, `admin_gdpr_evidence().retention_scheduled` (migration 0010)
reports `true` for the first time, which is the evidence that probe was written to collect.
The whole `pg_cron` block is wrapped in an exception handler: if the extension is unavailable
the migration still succeeds with a warning and the purge functions stay callable by hand,
rather than failing the migration step and blocking the Edge Function deploys behind it.

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

**FIXED (s185).** `scripts/lint-migrations.mjs`, wired as `pnpm lint:migrations` and a
`validate.yml` step. It strips comments, string literals and dollar-quoted function bodies
before parsing, then enforces six rules: `if not exists` on `create table/index/extension/
sequence` and on `add column`, `or replace` on `create function`, a matching earlier
`drop … if exists` for every `create policy`/`create trigger`, and `on conflict` on every
`insert`. Migrations ≤ 0014 are exempt (already recorded remotely, so `--include-all` can
never re-apply them); everything new must pass. Verified in both directions: the real tree
passes, and a scratch file carrying all six violations fails with all six named.

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

| # | Action | Effort | Status |
|---|--------|--------|--------|
| 1 | Read the push result; show a quiet "sync failing" indicator (R3) | Small | **Done, s185** |
| 2 | Retention jobs: stale guests, dead cache rows (R4 a+c) | Small-medium | **Done, s185** |
| 3 | Cap `daily_xp` / `active_days` to ~400 days (R1) | Small | **Done, s185** |
| 4 | Idempotency lint for migrations (R6) | Small | **Done, s185** |
| 2b | Learner-text retention (R4 b, audit F11) | Small | **Blocked:** needs a founder decision + a privacy-policy change |
| 5 | Split `srs` into a per-card table (R1+R2) | Medium | Open, before serious growth |
| 6 | Rollup table for admin analytics (R5) | Medium | Open, when the cockpit slows |

Items 1–4 were independent and low-risk, and together they removed every *silent* failure
mode found. Item 5 is the one real schema evolution this architecture will eventually need;
everything else about the "linear" design can stay linear on purpose.

## The one open question for the founder

**Should learner writing be kept forever?** Today it is, and the privacy policy promises
exactly that, so nothing was changed. Keeping it is defensible (the Verlauf is a real
feature and the data is the learner's own, protected by owner-only RLS) and it is also the
largest and most sensitive data the product holds. If it should expire, say after how long
(2 years is a common default), and the job plus the policy paragraph ship together.
