# Admin Control Center · Build Plan (chunked, with model recommendations)

_Session 143 (2026-07-22). The execution companion to `ADMIN_CONTROL_CENTER_PLAN.md` (the approved
scope; read that first for the "what and why"). This file answers "in what order, in what size
pieces, and with which Claude model per piece". Status: **chunks 1-10 SHIPPED (s144-s146); the whole
MVP (Phase 1) plus Phase-2 chunks 9-10 are done. Next = chunk 11 (Turnstile + abuse meters), then 12
(compliance pack), then Phase-3 (13-16) on demand.**_

> **Session 146 (2026-07-22):** chunks 4-10 built and shipped in one session. Chunk 4 Review Cockpit
> (`scripts/review-score.mjs` + `build-review-queue.mjs` → `reviewQueue.json`, `Pruefmodus.tsx`,
> `tests/reviewScore.test.ts`). Chunk 5 Feedback-Inbox (`AdminFeedback.tsx`). Chunk 6 System health +
> Launch checklist (`AdminSystem.tsx`, `AdminLaunch.tsx`, `systemHealth.ts`). Chunk 7 Steuerung core
> (`src/lib/appConfig.ts` + `AdminSteuerung.tsx`, consumers H1/H2/H4/H5/H6/H8 wired, `tests/appConfig.test.ts`).
> Chunk 8 report JSON sidecars (`report-sidecar.mjs` + 4 scripts, `reportStaleness.ts`). Chunk 9 content
> intelligence (`AdminInhalte.tsx`, coverage sidecar enriched with residual ids). Chunk 10 Steuerung
> wave 2 (H3 Impressum toggle + confirm dialog, H7 streak pill, H10 landing copy overrides, H12 Demo-Modus
> preset). All chunks: typecheck/lint/test:unit/build/check:bundle green; main chunk stayed ~112-116 kB.

**How to use this plan:** each chunk is one focused session producing one PR into `main`. Set the
recommended model with `/model` at the START of the session (the model cannot switch mid-task;
see the model guidance table in `docs/PROJECT_REFERENCE.md`). Chunks inside a phase are ordered by
dependency; do not start a chunk before its "Needs" row is satisfied. Every chunk ends with the
standard gates (`pnpm typecheck` · `lint` · `test:unit` · `build` · `check:bundle`) plus the
chunk-specific checks listed under Verify. All admin code rides lazy chunks; the ~75-80 kB main
chunk is a hard invariant.

**Model shorthand** (from the house guidance): **Fable** = Fable 5 (frontier; design, security,
legal nuance, integrity-critical logic) · **Opus** = Opus 4.8 (heavy cross-cutting implementation)
· **Sonnet** = Sonnet 5 (well-specified build work) · **Haiku** = Haiku 4.5 (mechanical fills).
Rule of thumb applied throughout: the spec work is already done (this plan), so most chunks are
build work; step UP a tier where a bug would be invisible or expensive (security boundaries, the
verified-content trust story, the founder-locked nav), step DOWN where the work follows a clear
recipe.

---

## Phase 1 · MVP

### Chunk 1 · Backend foundation (migration 0008 + admin RPCs + app_config)

**Executive summary:** everything the admin center reads or writes in the database gets created
here, in one migration: the upgraded review table (decisions instead of checkboxes, with the
safety hash), the feedback triage fields you chose (status, priority, note, link), the new
`app_config` table for the Steuerung switches, the launch-checklist storage, and the locked-down
"founder only" database functions that return aggregate numbers (never individual user data).
Nothing visible changes in the app yet; this is the plumbing every later chunk stands on. You will
have one small task at the end: paste the migration into the Supabase SQL editor, like previous
setup steps.

- **Scope:** `supabase/migrations/0008_admin_center.sql`: widen `provenance_reviews`
  (`decision approve|reject|needs_fix`, `content_hash`, `reviewer_email`, `applied_at`,
  `applied_sha`; backfill `verified=true` rows to `decision='approve'`); feedback triage columns
  (`status`, `priority`, `note`, `link`); `app_config` (world-readable, founder-writable RLS);
  `launch_checklist` state; `assert_founder()` + security-definer RPCs `admin_overview()`,
  `admin_feedback_recent(n)`, `admin_feedback_update(...)`, `admin_daily_series()`; revokes per the
  0004/0007 pattern. Client stubs in `src/lib/adminApi.ts` (typed wrappers, fail-soft). Founder
  deploy steps appended to `docs/plans/PHASE2_SETUP.md`.
- **Needs:** nothing. **Effort:** M. **Founder action:** run the migration in Supabase.
- **Verify:** RPCs reject a non-founder JWT (manual test with a guest session); `tests/admin.test.ts`
  extended to pin the email list against the new policy count.
- **Recommended model: Fable.** This chunk IS the security boundary: RLS policies, security-definer
  SQL, and the privacy line (aggregates only) live here, and a subtle mistake (a missing revoke, a
  policy that leaks rows) is invisible in the UI and expensive later. Budget alternative: **Opus**,
  with the RLS section reviewed in a short Fable session before the founder runs it.

### Chunk 2 · The loop-closer: `pnpm apply:reviews` + decision-time hashes

**Executive summary:** this makes your review clicks actually count. A script fetches your
approvals from the database, checks that the content has not changed since you looked at it (the
hash safety check), flips the items to "verified" in the code, runs the fingerprint stamp and the
content linter, and reports back what it applied and what needs re-review. Your rejections become
a fix list for AI sessions. From this chunk on, "founder reviews on the phone, next Claude session
commits it" is a working pipeline instead of a plan.

- **Scope:** `scripts/apply-reviews.mjs` (`pnpm apply:reviews`; service-role key from env, dev
  tooling only, never in the SPA): fetch approve-rows with null `applied_at` → `ID_RENAMES` map →
  hash compare (`scripts/content-hash.mjs`) → codemod `src/data/provenance.ts` (flip + `verified_by`)
  → `pnpm stamp:verified` + `pnpm lint:content` in the SAME commit → write back
  `applied_at`/`applied_sha` → print PR-body summary; reject/needs_fix export to
  `docs/reports/review-defects.md` + `.json`. Share the canonical-JSON hash via a new
  `src/lib/contentHash.ts` (imported by scripts AND the client; browser SubtleCrypto), and make the
  existing AdminWorkbench store the hash + `decision` at click time (it currently writes a boolean).
- **Needs:** chunk 1. **Effort:** M. **Founder action:** none.
- **Verify:** new `tests/contentHash.test.ts` (browser hash == script hash for fixture rows);
  dry-run mode against a seeded review row; `lint:content` green after a real flip.
- **Recommended model: Fable.** Highest-stakes logic in the whole build: a bug here silently
  launders unreviewed or changed content into "menschlich geprüft", which is the trust story the
  /sources page and the audit posture stand on. The hash-gate sequencing (flip + stamp in one
  commit, never re-stamp to silence) has already bitten once in spirit (s130). Not a Sonnet task.

### Chunk 3 · `/admin` shell + Übersicht cockpit

**Executive summary:** the admin area gets its front door: the /admin page that only your account
can see, with the sidebar (Übersicht, Prüfen, Feedback, Inhalte, Nutzer, System, Steuerung,
Launch), in German and English, plus the Übersicht screen from mockup 1: the verification
headline, waiting-decisions counter with the copy-prompt button, the AI budget meter, and the
"Is my change live?" box. After this chunk you can open the cockpit on your phone and see real
numbers.

- **Scope:** `RequireFounder` route wrapper (mirror `RequireOnboarding`), lazy `features/admin/`
  chunk (`AdminShell`, `AdminOverview`), AccountMenu entry for founder accounts, DE/EN string pairs
  (simple `t(de, en)` helper, no i18n framework), A1 funnel tiles (bundle `provenance.ts` +
  `verification.ts`), A4 sync-gap counter + "Übergabe-Prompt kopieren" (reads pending decisions via
  `adminApi`), D1 budget tile (`admin_overview`), C1 live-widget v1 (build stamp via Vite `define`
  + latest-main via public GitHub API + SW-cache hint).
- **Needs:** chunks 1-2 (the sync-gap counter and handoff prompt read their outputs). **Effort:** M.
- **Verify:** non-founder and logged-out users get a clean redirect; `check:bundle` unchanged main
  chunk; tiles fail soft when Supabase is unreachable.
- **Recommended model: Opus.** Cross-cutting wiring (router, auth store, menu, new lazy chunk,
  RPC integration) with an approved design to follow; no open design questions, but too many
  moving parts across locked surfaces for a budget model. Sonnet only if split into two sittings.

### Chunk 4 · Review Cockpit: priority queue + Prüfmodus

**Executive summary:** the flagship review experience from mockup 2. A build step scores every
content item by "how much does a review here matter" (machine flags first, then mission words and
common vocabulary), and the Prüfmodus screen deals them to you one at a time with V/X/N/arrow
keys, the automatic check results, and the source link. This is the chunk that turns your review
hours from spreadsheet grinding into something closer to a game with a progress bar.

- **Scope:** `scripts/build-review-queue.mjs` → a generated, lazily imported
  `src/features/admin/reviewQueue.json` (score = defect_signal / traffic_proxy / confidence /
  bank_criticality per plan §A2, with `{generatedAt, registerRows}` staleness stamp); `Pruefmodus`
  screen (item render per bank type, machine-check panel, keyboard handler, autosave via
  `adminApi`, session progress + resumable cursor, approve-streak nudge after 50 no-note
  approvals); queue list view with filters; deep links from Übersicht tiles.
- **Needs:** chunks 1-3. **Effort:** L (the item renderer covers several bank shapes).
- **Verify:** unit test for the scoring function (fixture items rank as specced); keyboard flow
  manual pass on mobile + desktop; a decision round-trips to Supabase with hash + reviewer email.
- **Recommended model: Opus.** Large multi-file feature with real interaction design finesse
  (keyboard, focus, mobile), but the scoring formula and UX are fully specced. Fable is not needed
  if the spec is followed; step up only if the item-renderer abstraction gets hairy.

### Chunk 5 · Feedback-Inbox

**Executive summary:** your feedback stops living in your email. Mockup 3's inbox: every message
with where it was sent from, triage with the four fields you chose (status, priority, note, link
to the fix), and counts on the Übersicht tile. Messages are already being stored today, so the
history appears retroactively the moment this ships.

- **Scope:** `AdminFeedback` screen (list + detail, status/priority chips, note + link fields,
  `emailed` indicator), `admin_feedback_recent`/`admin_feedback_update` wiring, "neu" badge count
  into the shell sidebar + Übersicht tile.
- **Needs:** chunks 1, 3. **Effort:** S-M.
- **Verify:** triage round-trip persists; non-founder RPC calls rejected; empty/error states.
- **Recommended model: Sonnet.** A well-specified CRUD surface on an existing pattern (DataTable,
  chips, fail-soft fetches) with the design already drawn. This is exactly Sonnet's lane.

### Chunk 6 · System & health + launch checklist

**Executive summary:** the "is anything on fire" corner: CI gate status in plain words, service
pings (database reachable, functions answering), the Resend/AI/guest-account limit meters, the
free-tier "project pauses after 7 days idle" warning, deep-link tiles to the Supabase/GitHub/
Resend dashboards, and the tickable launch checklist saved online (Impressum flagged as the legal
blocker, with the Google-review "do not re-click" memo).

- **Scope:** `AdminSystem` screen (C2 gate strip via public Actions API, C3 pings incl. Edge
  Function CORS preflight, D2 meters from `admin_overview`, deep links), `AdminLaunch` checklist
  (seeded from PROJECT_STATUS open items, state in the chunk-1 table), consent-version lockstep
  assert surfaced as a checklist row.
- **Needs:** chunks 1, 3. **Effort:** S-M.
- **Verify:** all tiles degrade gracefully offline; GitHub API unauthenticated rate limit
  respected (cache responses); checklist ticks sync across two devices.
- **Recommended model: Sonnet.** Bounded widgets against public APIs plus one small table, all
  specced. Haiku is too low (multiple integrations), Opus is overkill.

### Chunk 7 · Steuerung core (remote config)

**Executive summary:** the control switches you asked for. The app learns to read a small
settings object from the database at startup (falling back to today's built-in values when
offline), and the Steuerung screen from mockup 4 lets you rename the menu tabs, hide or show the
middle tabs, flip the parked feature switches, control the feedback button and Beta chip, and pick
which Dashboard tab opens first. Changes go live for everyone within a minute, no deployment, and
the guardrails from the scoping plan are enforced in code so a switch can never break navigation.

- **Scope:** `src/lib/appConfig.ts` (typed schema + runtime fetch with short cache + compiled
  defaults + zustand store), consumers wired: `nav-items.ts` labels (H1) + middle-tab visibility
  (H2, through the pinned-tabs semantics; routes stay mounted), feature-flag registry (H4:
  `practiceTabs`, `relatedPanel`, `flipHint` replace the ad-hoc constants), FeedbackButton config
  (H5), Beta chip (H6), Dashboard start tab (H8); `AdminSteuerung` panel (switch rows, label
  inputs with reset-to-default, "referenced in content" warning for renamed labels).
- **Needs:** chunks 1, 3. **Effort:** L. This chunk touches the founder-LOCKED bottom-bar and
  header surfaces; the locks constrain the implementation (relabel/hide only, no structural
  change) and every locked behavior must be regression-checked.
- **Verify:** with `app_config` empty/unreachable the app is byte-for-byte today's behavior (the
  critical test); label override propagates to BottomTabBar + Sidebar + LibrarySwitcher aria-label
  in one place; hiding a tab keeps its route resolving and forwards stale pins; `test:unit`
  extended for the config-merge logic.
- **Recommended model: Opus** (strong recommendation, do NOT drop to Sonnet). Not because the
  logic is deep, but because the blast radius is: it rewires the locked nav, the persisted-settings
  pins, and offline behavior at once, and the failure mode ("app boots weird for every user")
  is the worst in the plan. Fable optional for a pre-build 30-minute design check of the config
  schema if anything in the spec feels ambiguous.

### Chunk 8 · Report JSON sidecars + staleness metadata

**Executive summary:** a housekeeping chunk that makes the dashboards trustworthy: every offline
report script also writes a machine-readable file with a timestamp and the register size it saw,
so the admin center can show "this number is from last Tuesday, 2,132 of 3,105 items" instead of
presenting stale data as current. It unblocks the content-intelligence screens in v2.

- **Scope:** `verify-facts` / `verify-cefr` / `review-queue` / `report-exercise-coverage` emit
  `.json` sidecars beside their markdown (verify-grammar already does), all carrying
  `{generatedAt, registerRows}`; a shared helper in `scripts/`; Übersicht staleness strip reads
  them via lazy import.
- **Needs:** nothing (parallel-safe any time after chunk 3 for the UI part). **Effort:** S.
- **Verify:** `pnpm verify:sentences` + `review:queue` + `report:exercise-coverage` run green and
  emit valid JSON; linter untouched.
- **Recommended model: Sonnet.** Mechanical, well-bounded script edits with an existing example
  to copy (`verify-grammar.json`). Haiku is plausible but the scripts differ enough in structure
  that Sonnet is the safe floor.

---

## Phase 2 · v2 (pre-launch)

### Chunk 9 · Content intelligence (Inhalte screens)

**Executive summary:** the "what should I build next" screens: the 20-theme depth matrix colored
against the reference standard, the machine-check triage counts that click through into the
review queue, and the per-theme exercise-coverage gaps with a "copy id list" button that hands an
AI session an exact work order.

- **Scope:** F1 depth matrix (bundle banks vs the reference floor), F2 flag triage (from
  `verification.ts` + sidecars → Prüfmodus deep links), F3 coverage residuals (chunk-8 sidecar).
- **Needs:** chunks 3, 4, 8. **Effort:** M.
- **Recommended model: Sonnet.** Aggregation + presentation over data that already exists, fully
  specced; the one judgment call (reference floors) is already written down in the scoping plan.

### Chunk 10 · Steuerung wave 2

**Executive summary:** the second round of switches: the Impressum on/off (behind a confirmation
checklist since it has legal prerequisites), the header element switches, the optional hub
tiles, the landing-page text overrides in both languages, and the one-tap Demo-Modus bundle for
presentation days.

- **Scope:** H3 (Impressum route + all links restored together, confirmation dialog), H7 header
  switches, H9 hub optional elements, H10/H11 copy overrides (DE/EN pairs, content-reference
  warning), H12 Demo-Modus preset.
- **Needs:** chunk 7. **Effort:** M.
- **Recommended model: Opus.** Same locked-surface blast radius as chunk 7 (header, landing,
  legal links); the Impressum toggle in particular must restore route + footer + Settings + legal
  cross-links atomically. (Filling the actual Impressum address stays its own Sonnet backlog item.)

### Chunk 11 · Abuse hardening: Turnstile + meters

**Executive summary:** before the demo link travels further: switch on the bot check for guest
accounts (already prepared in the setup docs), add a daily cap to the feedback email function so
a spam burst cannot exhaust the email quota, and light up the abuse tiles (guest-signup spikes,
burst-limit trips) that chunk 6 stubbed.

- **Scope:** enable Turnstile per `PHASE2_SETUP.md` §4 (founder does the dashboard half), daily
  email cap in `submit-feedback`, wire D2 abuse tiles to real thresholds.
- **Needs:** chunk 6. **Effort:** S. **Founder action:** Turnstile keys in Supabase + Cloudflare.
- **Recommended model: Sonnet.** Follows provider docs + one bounded function edit (matches the
  existing backlog rec for Turnstile).

### Chunk 12 · Compliance pack

**Executive summary:** the audit-and-trust round: the consent-version drift check as a live
warning, the one-button auditor export (register CSV + tier distribution + report links + the
sampling guide), and the GDPR operations counters (how many deletions/exports ran, is the
retention job scheduled). Cheap to build, and it converts the project's provenance discipline
into a sales asset for B2B conversations.

- **Scope:** G2 runtime assert + admin warning, G3 export bundle (reuse `csv.ts` + /sources
  stats), G4 counters via one RPC addition.
- **Needs:** chunks 1, 3. **Effort:** S-M.
- **Recommended model: Sonnet build + a Fable review pass.** The build is bounded reuse, but the
  claims the export makes ("verified means X, jury means Y") and the GDPR counter wording carry
  legal weight; have Fable read the final copy the way the legal pages were handled.

---

## Phase 3 · later (post-launch or on demand)

| Chunk | What | Trigger | Model |
| --- | --- | --- | --- |
| 13 | Audience tiles live (E1/E2 signups/actives/series charts) | The week the link goes public | **Sonnet** (recharts on existing RPCs) |
| 14 | Sampling protocol (A5) + `sample-audits.json` attestation + native-reviewer lane (3rd email, reviewer filter) | A native reviewer is engaged, or wave-review starts | **Opus** (attestation semantics must not blur the human tier) |
| 15 | Aggregate telemetry counters (day/event/count, no user key) + privacy-policy sentence + `CONSENT_VERSION` bump | A concrete product question needs funnels | **Fable** for the privacy design/wording, **Sonnet** for the build |
| 16 | Review streaks/gamification (A4b), bundle-size trend from CI | Whenever convenient, filler work | **Haiku-Sonnet** |

---

## Sequencing at a glance

```
Phase 1:  1 ──► 2 ──► 3 ──► 4        (the review pipeline, in strict order)
                      3 ──► 5, 6, 7   (independent once the shell exists)
          8 (any time; needed before 9)
Phase 2:  9 (after 4+8) · 10 (after 7) · 11 (after 6) · 12 (after 3)
```

Model mix across the MVP: **Fable ×2** (chunks 1-2, the security + integrity core), **Opus ×3**
(chunks 3, 4, 7, the cross-cutting builds), **Sonnet ×3** (chunks 5, 6, 8). That concentrates the
expensive model where a mistake is invisible-but-costly and keeps the well-specified UI work on
the mid tier, matching the house rule (design/decide with Fable, build with Opus/Sonnet).

Standing rules for every chunk: one PR into `main`, squash-merge, post-merge branch realignment;
update `PROJECT_STATUS.md` + the prompt log; no em dashes in any user-facing string; admin
strings ship DE/EN; nothing imports content banks or report JSON into the eager main chunk.
