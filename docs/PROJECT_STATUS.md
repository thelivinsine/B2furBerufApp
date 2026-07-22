# Project Status

_Last updated: 2026-07-22 (session 145). **Admin Control Center chunk 3 SHIPPED** (`/admin` shell +
Übersicht cockpit). The founder-only `/admin` route (lazy `features/admin/` chunk, `RequireFounder`
wrapper mirroring `RequireOnboarding`, standalone full-screen shell like `/sources`) with the
eight-item bilingual DE/EN sidebar and the Übersicht screen: A1 verification-funnel tiles + trust
ladder (bundled `provenance.ts` + `verification.ts`, zero backend), A4 sync-gap counter +
"Übergabe-Prompt kopieren" (approved-but-not-yet-verified ids, keyless-safe), D1 AI-budget tile
(`admin_overview`), C1 "Ist meine Änderung live?" widget (build stamp via Vite `define` vs latest
`main` from the public GitHub API + PWA-cache hint). AccountMenu shows a "Kontrollzentrum" entry for
founder accounts. Unbuilt screens (Prüfen/Feedback/Inhalte/Nutzer/System/Steuerung/Launch) resolve
to a placeholder so deep links never 404; chunks 4-7 swap them in. Main chunk unchanged (111.6 kB),
admin rides an 18 kB lazy chunk. Prior: chunks 1+2 (backend foundation + `apply:reviews`
loop-closer) shipped s144. Next = chunk 4 (Review Cockpit / Prüfmodus) on Opus per
`ADMIN_CONTROL_CENTER_BUILD_PLAN.md`. Product name: **Genauly** (`genauly.de`)._

This is the **lean, living** status doc: current state plus the two most recent session handoffs.
**Start at the `## Resume here (next session)` section at the end.** Companion files:
- **`docs/PROJECT_FOUNDATION.md`** — the stable technical baseline that rarely changes: shipped
  architecture (Phase 1/2), locked architectural decisions, backend/infra, and completed founder
  action items. Read it when you need the "what's built and how" detail that used to sit here.
- **`docs/PROJECT_REFERENCE.md`** — stable reference: the founder backlog, product-evaluation
  findings, per-session model guidance, and reusable research findings.
- **`docs/DECISIONS.md`** — the "why" behind locked UX decisions.
- **`docs/archive/PROJECT_STATUS_ARCHIVE.md`** — index into the append-only session-log history,
  chunked by ISO week under `docs/archive/status-log/`.
- **`../CLAUDE.md`** — developer/agent operating instructions, content conventions, and locked designs.

**Doc-hygiene rule (keep this file lean):** hold only **current state + the two most recent
handoffs**. When you append a new handoff to `## Resume here`, move any handoff older than the two
most recent into the current ISO-week chunk under `docs/archive/status-log/` (see the index at
`docs/archive/PROJECT_STATUS_ARCHIVE.md`). Do NOT let the `_Last updated_` block above grow into a
session-by-session narrative — keep it to the latest session only. Keep the whole file under ~250
lines. Stable "what's built" material goes to `PROJECT_FOUNDATION.md`, not here.

## Where things stand

The full SPA is live on `main`: onboarding, dashboard, the composed session loop, the four-zone nav
(Heute · Bibliothek · Anwenden · Fortschritt), the Neuland game layer (`/welt`, Kapitel 1 complete),
Supabase auth + cloud sync, and the AI writing coach. **The shipped architecture, locked
architectural decisions, and backend/infra setup are documented in `docs/PROJECT_FOUNDATION.md`** —
read that for the "what's built and how." The living detail of every feature area (mobile bar, the
session engine, Bibliothek views, the game layer, content conventions) is in `../CLAUDE.md`.

**Content banks (as of 2026-07-21, session 142, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** (8 mis-filed noun+verb combos retired from the Wörter surface
in s142, ids kept) · collocations **1,035** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **~3,105
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: ~98% of provenance rows are AI-drafted, not yet human-verified (see
`strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. Still open:
- [ ] (Optional) Add Resend SMTP to fix the email magic-link rate-limit. Auth → SMTP settings.
- [ ] (Optional) Enable Turnstile CAPTCHA on guest sign-in to deter bot abuse before public launch.
- [ ] (Optional) Get a hosted LanguageTool key (free tier) for better grammar pre-checks.
- [ ] **Google sign-in branding verification — awaiting async Google review (re-submitted s22):**
      The blocking technical issue ("home page does not explain purpose") is fixed: `index.html`
      now contains a full static pre-render inside `#root` that Google's no-JS HTML crawler can read.
      Founder re-submitted via Google Cloud Console → OAuth consent screen → "I have fixed the issues."
      Google's async re-review takes hours to days; wait for an email from Google's Trust and Safety
      team. **Do NOT re-click "I have fixed the issues" again while waiting.** If issues remain,
      escalate via the Google Developer forums with the raw-HTML evidence (visible in
      `view-source:https://genauly.de`).

## Resume here (next session)

**Handoff after session 145 (2026-07-22). Admin Control Center chunk 3 (`/admin` shell + Übersicht
cockpit), branch `claude/admin-control-center-chunk-3-7g5829`.** Chunk 3 of
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md` on the recommended Opus tier: the founder's front
door to the admin center, cross-cutting wiring against an already-approved design (mockup 1 in
`preview/admin-control-center-mockups.html`). What shipped:
- **Route + gate:** `RequireFounder` in `router.tsx` (mirrors `RequireOnboarding`; renders nothing
  while auth `status === "loading"` to avoid a redirect flash, else `isFounder(user)` or `<Navigate
  to="/">`). New standalone top-level route `/admin/*` (outside AppShell chrome, like `/sources`),
  lazy `AdminApp` (one chunk owns the whole `/admin` subtree via descendant `<Routes>`). Client gate
  is cosmetic; the real boundary stays the 0008 RLS/RPC.
- **`src/features/admin/` (all new, lazy):** `AdminApp.tsx` (lang provider + descendant routes),
  `AdminShell.tsx` (full-screen sidebar cockpit: 8-item DE/EN nav, founder chip, DE/EN toggle,
  "back to app"; fetches `admin_overview` ONCE and shares it via Outlet context so screens don't
  re-fetch; Feedback nav badge = `feedback.neu`), `AdminOverview.tsx` (the Übersicht), `adminI18n.tsx`
  (a `t(de, en)` context + localStorage-persisted lang, no i18n framework), `adminFunnel.ts` (pure,
  unit-tested), `liveWidget.ts` (C1), `AdminPlaceholder.tsx` (the not-yet-built screens
  Prüfen/Feedback/Inhalte/Nutzer/System/Steuerung/Launch resolve to it so deep links never 404;
  chunks 4-7 swap them in).
- **Übersicht tiles (mockup 1):** **A1** verification-funnel — "Menschlich geprüft" (verified count,
  25 today), "KI-Jury-Abdeckung" % (tier ≥ jury, the machine floor that costs nothing), and the
  all-banks trust-ladder stacked bar, all computed synchronously from bundled `provenance.ts` +
  `verification.ts` (zero backend). **A4** sync-gap — "Wartende Entscheidungen" count + a
  "Übergabe-Prompt kopieren" button producing the ready-to-paste `pnpm apply:reviews` handoff with
  the exact ids; pending = approved (`provenance_reviews.decision === "approve"`) minus already
  `verified` in the bundle (keyless-safe, matches how apply:reviews reconciles). **D1** AI-budget
  tile (`admin_overview` cost vs $5 + cache-hit rate). **C1** "Ist meine Änderung live?" — build
  stamp (new Vite `define` `__BUILD_SHA__`/`__BUILD_TIME__`, read only in the admin chunk) vs latest
  `main` from the public GitHub commits API, plain-language verdicts + the recurring PWA-cache hint +
  a Supabase-reachable line. Honest metrics: no fabricated deltas; "+N diese Woche" shows only when
  real (from `verified_date`).
- **AccountMenu:** founder accounts get a "Kontrollzentrum" (`ShieldCheck`) entry to `/admin`.
- **Gates:** `typecheck` ✓ · `lint` (0 errors; warnings are the pre-existing compiler-era debt) ·
  `test:unit` **253/253** (new `tests/adminFunnel.test.ts` pins the funnel + sync-gap + handoff) ·
  `build` ✓ · `check:bundle` **111.6 kB** (main chunk unchanged; admin rides an 18 kB lazy chunk).
- **Next:** chunk 4, the Review Cockpit / Prüfmodus (Opus), needs the `build-review-queue.mjs`
  scorer; deep-links from the Übersicht tiles land there.

**Handoff after session 144 (2026-07-22). Admin Control Center chunks 1 + 2 (backend foundation +
the review loop-closer), branch `claude/admin-control-center-chunk-1-eafquu` (three PRs to `main`:
#631 chunk 1, #632 setup-doc fixes, #633 chunk 2).** The first two build chunks of
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md`, both on the recommended Fable tier (they are the
security + integrity core). Migration 0008 was deployed live by the founder and verified in-session.

### Chunk 1 · backend foundation (this chunk IS the security boundary)
What shipped:
- **Migration `supabase/migrations/0008_admin_center.sql`** (idempotent, founder pastes it into
  the Supabase SQL editor; steps appended to `docs/plans/PHASE2_SETUP.md`):
  (1) `provenance_reviews` widened from the boolean checkbox to real decisions:
  `decision approve|reject|needs_fix`, `content_hash` (the decision-time safety hash chunk 2's
  `apply:reviews` compares before flipping repo rows), `reviewer_email`, `applied_at`,
  `applied_sha`; `verified=true` rows backfilled to `decision='approve'` (legacy rows keep a null
  hash, which apply:reviews must treat as "needs re-review", never a free pass), reviewer emails
  backfilled from `reviewed_by`. The `verified` boolean stays until the chunk-2 workbench update.
  (2) `feedback` triage columns: `status neu|erledigt|verworfen`, `priority hoch|normal|niedrig`,
  `note`, `link` (table stays service-role-only; founder access via RPC only).
  (3) **`app_config`** (Steuerung store): key/value jsonb rows, world-READABLE RLS (the app will
  consume it at startup in chunk 7), founder-only writes. (4) **`launch_checklist`**: founder-only
  RLS, state synced across devices (items seeded by the chunk-6 UI).
  (5) **`is_founder()`** (the SINGLE email source for every 0008 policy/RPC) + **`assert_founder()`**
  + SECURITY DEFINER RPCs gated in-body per the 0004/0007 pattern: `admin_overview()` (one jsonb:
  accounts split guests/email/Google + new7d, active today/7d, sessions/XP/SRS-card totals, AI
  month spend vs cap inputs, feedback counts, review sync-gap counts), `admin_daily_series()`
  (30-day `{day, signups, actives}`), `admin_feedback_recent(n)`, `admin_feedback_update(...)`
  (validates enums; empty string clears note/link). All revoked from `public`/`anon`, granted to
  `authenticated` (guests ride the authenticated role, so the in-body email check is the real
  boundary). **Privacy line held: aggregates only, no RPC returns learner rows; no admin SELECT
  policies were added to `profiles`/`progress`/`writing_evaluations`** (the `feedback` table is the
  sanctioned per-row exception: operational mail addressed to the founder).
- **`src/lib/adminApi.ts`**: typed fail-soft wrappers (null/empty/false on error, offline-first)
  for the four RPCs + raw `app_config` and `launch_checklist` helpers. Not imported by any eager
  code yet (main chunk unchanged); consumers arrive with the `/admin` shell in chunk 3.
- **`tests/admin.test.ts` extended (lockstep pin):** migration 0007 + 0008 email sets must equal
  `FOUNDER_EMAILS` exactly, both emails must sit inside `is_founder()`, and every 0008 admin RPC
  must contain `perform public.assert_founder();` and a `revoke ... from public, anon`.
- **Docs:** founder deploy/verify steps in `PHASE2_SETUP.md` (run 0008; existing Werkbank ticks
  carry over as approve decisions, nothing re-clicked); CLAUDE.md admin-gate note now covers 0008.
- **Gates:** `typecheck` · `lint` (0 errors) · `test:unit` 222/222 · `build` · `check:bundle`
  (110.6/400 kB) · `lint:content` all green. Nothing visible in the app changes yet.
- **Deployed + verified live (same session):** the founder ran migration 0008 in the Supabase SQL
  editor (via the dashboard paste path; `PHASE2_SETUP.md` §1 now marks the CLI optional), confirmed
  the gate rejects an identity-less call ("forbidden: founder account required" is the HEALTHY
  result in the SQL editor), and got a real `admin_overview()` JSON via the
  `set_config('request.jwt.claims', ...)` trick: 6 accounts (4 Google / 2 guests), 8,053 XP,
  532 SRS cards, 60 sessions, 1 feedback (neu), reviews `decided: 1, approvedUnapplied: 1` (a
  legacy boolean-era tick, no decision hash, so chunk 2 routes it to re-review, never a blind flip).

### Chunk 2 · the loop-closer `pnpm apply:reviews` + decision-time hashes
The review pipeline "founder clicks on the phone → next Claude session commits it" now works end
to end:
- **Shared fingerprint:** new `src/lib/contentHash.ts` (browser SubtleCrypto sha256 over canonical
  JSON, byte-compatible with `scripts/content-hash.mjs`) + `src/lib/contentIndex.ts` (the same
  content-id universe as the stamp script; dynamic-import only, a ~4 kB glue chunk over the shared
  bank chunks, main chunk untouched at 110.7 kB). Parity pinned by `tests/contentHash.test.ts`
  (canonicalization, hashes, id universe; jsdom gets node webcrypto).
- **Decision-time capture:** the /sources Daten-Werkbank tick now saves `decision: "approve"` + a
  `content_hash` of the item as reviewed + `reviewer_email` (untick clears the decision; note-only
  edits leave it untouched); CSV export gained the decision column.
- **`scripts/apply-reviews.mjs`** (`pnpm apply:reviews`): decision source → `ID_RENAMES` → hash
  compare → codemod `provenance.ts` (`draft`→`verified` + `verified_by`/`verified_date`,
  format-exact) → `stamp:verified` + `lint:content` in the SAME commit → defects/re-review export
  to `docs/reports/review-defects.md` + `.json`. `--dry-run` writes nothing. Integrity rules pinned
  by `tests/applyReviews.test.ts`: null/mismatched decision hash = re-review (never a flip),
  already-verified rows only ever mark applied.
- **Verified end to end in-session:** real flip of `v_besprechung` through the codemod →
  `stamp:verified` (25→26) → `lint:content` green → reverted.

### Chunk 2 addendum · keyless review handoff (founder security review, same session)
The founder correctly flagged that the Claude environment's **environment-variables box is plaintext
and explicitly warns against secrets**, so storing `SUPABASE_SERVICE_ROLE_KEY` there (my first
instruction) was wrong. Replaced the key path with a keyless file handoff, no secret ever touches
the environment:
- **Browser export:** `src/lib/reviewExport.ts` (`buildDecisionExport`/`downloadDecisions`) + an
  **"Entscheidungen (N)"** button in the AdminWorkbench toolbar. The founder is already securely
  signed in on /sources (RLS grants read), so the browser downloads a `genauly-review-decisions-*.json`
  file (decisions + decision-time fingerprints, NO credential). CSV export unchanged.
- **Keyless script mode:** `pnpm apply:reviews --from <file>` (`parseDecisionFile`) reads that file
  instead of Supabase, does the identical hash-compare + codemod + stamp + lint, and writes NO
  database (applied state reconciles from the deployed bundle: the item is `verified` in
  provenance.ts). The direct-DB path stays for a secure local shell with the key, but is no longer
  the founder's path. Round-trip (browser export → script parse) pinned by `tests/reviewExport.test.ts`.
- **Verified end to end:** built a realistic 2-decision fixture (one hash-matching `v_besprechung`,
  one stale `v_tagesordnung`) → `--from` dry-run classified correctly (1 ready, 1 re-review) →
  real `--from` run flipped `v_besprechung`, stamped, linted green, exported the stale one to the
  re-review report → reverted.
- **Founder action: NONE.** No key to set up; the workbench button + file handoff is the whole flow.
  `PHASE2_SETUP.md` rewritten accordingly (and now says NOT to put the service-role key in the
  environment variables).
- **Gates:** `typecheck` · `lint` (0 errors; the one new hook-deps warning was fixed properly) ·
  `test:unit` 237/237 · `build` · `check:bundle` (110.7/400 kB) · `lint:content` all green.
- **Next:** chunk 3, the `/admin` shell + Übersicht cockpit (Opus recommended); chunks 1-2 outputs
  (sync-gap counter + handoff prompt) are its data feed.

_(Session 143's Admin Control Center scoping handoff (the expert-panel report + build plan + 4
mockup screens, PR #626), session 142's Wörter quality-control handoff (the
`RETIRED_VOCAB_IDS`/`browsableVocabulary` retire-from-surface set + the vocab↔collocation overlap
lint gate, PR #624), session 141's
mobile-nav-item-labels handoff (labels under the active icon + the
Theorie→Bibliothek revert, PR #622), session 140's light-theme recolor handoff (neutral grey chrome + the "I1" mint→sky gradient
ground, 2 PRs + a 3-round preview picker), session 139's three-small-fixes handoff (icon-size
preview correction, mission-exit toggle fix, Kollokationen graph tighter clusters), session 138's
logo-v2 rework handoff, session 137's branding-refresh review + premium pass (fixes 1-7 + items 8-10) handoff, session 136's landing-page-redesign handoff and session 135's game demo-readiness review + P0/P1 batch handoff are now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md`. Session 134's Theorie (Wörter) card + mobile-filter polish handoff, session 133's brand-kit-modernization handoff (plan + all 4 PRs + the consolidated brand-kit/ + the tile-less logo), session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder **finalized** Kit 1 · Nachtblau & Himmelblau + Koralle, locked spec at `docs/branding/BRAND_SPEC.md`, artifacts saved under `preview/branding/artifacts/`, NOT implemented — wire only on request; see the W29 archive), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
session 123's Theorie graph-view P2/P3 batch handoff, session 122's Theorie graph-view quality audit
+ P0/P1 fixes handoff, session 121's
arbeitswelt→beruf domain-merge handoff, session 120's content-coverage-deepening
handoff, session 119's account-dropdown z-index-fix handoff, session 118's Kollokationen-nodal-graph
handoff, session 117's Üben-navigation + Üben-button-copy handoff, session 116's branding-redesign-support
handoff (Cobalt & Butter previews + the AI mockup guide) and session 115's demo-readiness-sweep handoff
are now in `docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
