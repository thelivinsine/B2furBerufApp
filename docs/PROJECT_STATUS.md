# Project Status

_Last updated: 2026-07-22 (session 144). **Admin Control Center chunk 1 SHIPPED (backend
foundation).** Migration `supabase/migrations/0008_admin_center.sql` (provenance_reviews decisions
+ safety hash, feedback triage columns, `app_config`, `launch_checklist`, `is_founder()`/
`assert_founder()` + the aggregate-only founder RPCs), typed fail-soft client stubs in
`src/lib/adminApi.ts`, lockstep tests pinning the migration's email gate, and founder deploy steps
in `docs/plans/PHASE2_SETUP.md`. **Founder action: run migration 0008 in the Supabase SQL editor.**
Next step = chunk 2 (`pnpm apply:reviews` loop-closer) per
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md`. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 144 (2026-07-22). Admin Control Center chunk 1: backend foundation,
branch `claude/admin-control-center-chunk-1-eafquu`.** First build chunk of
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md` (run on the recommended Fable tier: this chunk IS
the security boundary). What shipped:
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
- **Next:** chunk 2, `pnpm apply:reviews` + decision-time hashes in the workbench (Fable
  recommended); then chunk 3, the `/admin` shell + Übersicht (Opus).

**Handoff after session 143 (2026-07-21). Admin Control Center scoping, branch
`claude/genauly-admin-control-center-7ohvnb`, shipped to `main` (PR #626, docs + preview only).** Founder
asked for a full-blown comprehensive admin control center: an expert-agent panel to research and
scope it, a detailed report with recommendations, and HTML previews. What shipped (research/design
only, zero app-code changes):
- **Four-agent expert panel** ran in parallel: product strategy + founder ops, infrastructure/
  codebase audit, content operations, analytics/telemetry/ops. Findings synthesized into
  **`docs/plans/ADMIN_CONTROL_CENTER_PLAN.md`**: a 7-module blueprint (A Review Cockpit "Prüfmodus"
  as the flagship, B Feedback-Inbox, C Versand & Systemzustand incl. the "Ist meine Änderung live?"
  widget, D Kosten & Missbrauch, E Nutzer-Aggregate, F Inhalts-Intelligenz incl. a report-staleness
  panel, G Launch & Compliance), plus the **P0 loop-closer `pnpm apply:reviews`** (Supabase review
  decisions → `provenance.ts` flip + `stamp:verified` in ONE commit, guarded by decision-time
  content hashes), a migration-0008 sketch (widen `provenance_reviews` to
  decision/content_hash/applied_at + founder-gated aggregate RPCs like `admin_overview()`), an
  explicit do-NOT-build list (no live CMS, no roles, no analytics SDKs/cookie-banner risk, no
  per-user data browsing), phasing (MVP ≈ 2 sessions, loop-closer first), and risks (hash-gate
  race, jury vs human tier confusion, review fatigue, stale artifacts).
- **`preview/admin-control-center-mockups.html`**: 3 mockup screens on the real brand tokens
  (Übersicht cockpit, Prüfmodus review card with V/X/N/→ keyboard flow, Feedback-Inbox +
  Systemzustand). Standalone file, open in a browser.
- **Key audit facts for whoever builds it:** the only existing admin surface is the /sources
  Daten-Werkbank; learner tables are owner-only RLS (cross-user reads are impossible from the
  client today); `ai_usage` + `feedback` have zero client policies (service-role only); the
  founder-email list is duplicated in 3 places that must stay in lockstep (`admin.ts`, RLS 0007,
  submit-feedback default); `/admin` must be a lazy chunk (400 kB budget).
- **Founder decisions resolved (2026-07-22, plan §10):** dedicated `/admin` route · MVP order
  confirmed · feedback triage fields = status + note + **link + priority** · launch checklist
  persisted in **Supabase** · admin UI **bilingual DE/EN**. The founder additionally requested a
  **Steuerung (remote-config) module**: a prompt-log mining pass over all ~440 entries (s26-s143)
  found 25+ config-shaped asks (nav renames incl. the Theorie↔Bibliothek flip-flop, s105 "hide
  Anwendung for the demo", three "keep it in code but hide it" flags, feedback-pill rounds, demo
  crunches) and produced a 12-switch catalog + guardrails, now plan §4 H (mechanism: Supabase
  `app_config`, world-readable/founder-writable, fetched at runtime to dodge the PWA cache;
  visibility toggles never unmount routes; locked bar structure stays locked). Steuerung core
  joins the MVP (plan §8). A 4th mockup screen (Steuerung) was added to the preview HTML.
- **Build plan authored (2026-07-22): `docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md`.** The
  approved scope chunked into 12 numbered PR-sized chunks (+4 later items), each with a
  plain-language executive summary, scope/verify lists, dependencies, effort, and a per-chunk
  Claude-model recommendation (MVP mix: Fable ×2 for the security/integrity core = migration 0008
  + apply:reviews; Opus ×3 for the cross-cutting builds = shell/Übersicht, Prüfmodus, Steuerung
  core; Sonnet ×3 for feedback inbox, system/launch, report sidecars). Sequencing diagram + model
  rationale included. **Next step: chunk 1 (backend foundation) on Fable.**

_(Session 142's Wörter quality-control handoff (the `RETIRED_VOCAB_IDS`/`browsableVocabulary`
retire-from-surface set + the vocab↔collocation overlap lint gate, PR #624), session 141's
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
