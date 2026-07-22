# Project Status

_Last updated: 2026-07-22 (session 146). **Admin Control Center chunks 4-10 SHIPPED in one session**
(the whole MVP plus Phase-2 content-intel + Steuerung wave 2), on branch
`claude/landing-back-button-routing-jyhwot`, plus a landing back-button fix. Chunk 4 Review Cockpit
(priority-scored queue + keyboard Prüfmodus, `scripts/review-score.mjs` + `build-review-queue.mjs` →
`reviewQueue.json`). Chunk 5 Feedback-Inbox. Chunk 6 System health + Launch checklist. Chunk 7
Steuerung core (`src/lib/appConfig.ts` remote config + panel; consumers H1/H2/H4/H5/H6/H8 wired;
empty-config == today's behavior invariant pinned by tests). Chunk 8 report JSON sidecars + Übersicht
staleness strip. Chunk 9 content intelligence (depth matrix + flag triage + exercise-coverage
residual work-orders). Chunk 10 Steuerung wave 2 (H3 Impressum toggle behind a confirm dialog, H7
streak pill, H10 landing copy overrides, H12 Demo-Modus preset). All seven chunks:
typecheck/lint/test:unit(275)/build/check:bundle green; main chunk ~112-116 kB. Next = chunk 11
(Turnstile + abuse meters), then 12 (compliance pack); Phase-3 (13-16) on demand. Product name:
**Genauly** (`genauly.de`)._

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

**Handoff after session 146 (2026-07-22). Admin Control Center chunks 4-10 + a landing back-button
fix, branch `claude/landing-back-button-routing-jyhwot` (not yet PR'd to `main` at handoff time; nine
commits).** The founder asked to "continue with the admin control center build plan next chunk and
work until chunk 10", so all seven remaining MVP + early-Phase-2 chunks of
`docs/plans/ADMIN_CONTROL_CENTER_BUILD_PLAN.md` shipped in one sitting. Every chunk passed the full
gate set (typecheck · lint 0-errors · test:unit · build · check:bundle · lint:content) and was
committed separately.

- **Landing fix (first):** `HelpChrome` (public `/hilfe` + `/hilfe/:slug`) had its Back button
  hardcoded to `navigate("/hilfe")`, so on the hub itself (where the landing's Help link lands) Back
  looped to the same page. Now uses the history-aware `handleBack` (navigate(-1), fallback `/welcome`)
  that `LegalChrome` already uses. The article breadcrumb still links to the hub explicitly.
- **Chunk 4 · Review Cockpit (Prüfen):** `scripts/review-score.mjs` (pure A2 scoring: defect_signal >
  traffic_proxy > (1-confidence) > bank_criticality, shared by the build script + `tests/reviewScore.test.ts`),
  `scripts/build-review-queue.mjs` (`pnpm build:review-queue` → compact `src/features/admin/reviewQueue.json`,
  ~155 kB, tuple rows + `{generatedAt, registerRows}` stamp), `reviewQueueData.ts` (typed parser),
  `Pruefmodus.tsx` (filterable queue + keyboard review session V/X/N/→/←, item rendered as the learner
  sees it via `contentIndex`, machine-check panel, source link, autosave to `provenance_reviews` with a
  decision-time hash, 50-approvals rubber-stamp nudge). Deep links from the Übersicht trust-ladder card.
- **Chunk 5 · Feedback-Inbox:** `AdminFeedback.tsx` (list + expandable detail, status/priority/note/link
  triage via `admin_feedback_update`, emailed indicator, status filter, optimistic writes). Übersicht
  topline gains a "n new" quick-link.
- **Chunk 6 · System + Launch:** `systemHealth.ts` (fail-soft GitHub Actions gate runs + Supabase +
  Edge-Function CORS-preflight probes), `AdminSystem.tsx` (gate strip, service pings, AI/Resend/guest
  meters, 7-day-idle-pause warning, dashboard deep links), `AdminLaunch.tsx` (Impressum-blocker checklist
  persisted to `launch_checklist`, consent-version lockstep row).
- **Chunk 7 · Steuerung core:** `src/lib/appConfig.ts` (typed schema + compiled `DEFAULT_APP_CONFIG` =
  today's behavior + defensive `mergeAppConfig` + zustand store loaded once in `App.tsx`, fail-soft).
  **THE invariant — empty/unreachable config == unchanged app — is pinned by `tests/appConfig.test.ts`.**
  Consumers: H1 nav labels (BottomTabBar + Sidebar), H2 middle-tab hide (nav only, routes stay mounted,
  Home/Einstellungen locked), H4 feature flags (SHOW_PRACTICE_TABS/SHOW_RELATED → `features.*`), H5
  feedback widget, H6 Beta chip, H8 dashboard start tab. `AdminSteuerung.tsx` panel with live preview +
  save-only-real-overrides.
- **Chunk 8 · report sidecars:** `scripts/report-sidecar.mjs` wired into verify-facts/verify-cefr/
  review-queue/report-exercise-coverage (all emit `{generatedAt, registerRows, …}` JSON), `reportStaleness.ts`
  + Übersicht "Berichte-Aktualität" strip (import.meta.glob, absence-tolerant).
- **Chunk 9 · Inhalte:** `AdminInhalte.tsx` — F1 depth matrix (20 themes × 7 banks vs reference floor),
  F2 machine-flag triage (→ Prüfmodus deep links), F3 exercise-coverage residuals with a "Copy ids" work
  order (the coverage sidecar now carries per-theme residual ids).
- **Chunk 10 · Steuerung wave 2:** H3 Impressum (route always mounted + lazy; links gated on
  `impressumEnabled` behind a confirm dialog), H7 streak pill, H10 landing copy overrides (bilingual),
  H12 Demo-Modus preset.
- **Next:** open a PR into `main` and squash-merge (auto-ship). Then chunk 11 (Turnstile + abuse meters,
  founder does the Cloudflare/Supabase dashboard half) and chunk 12 (compliance pack). The remaining
  admin backend is already live (migration 0008 deployed s144), so no new founder DB step is needed for
  chunks 4-10; `app_config`/`launch_checklist`/`provenance_reviews` decisions all use the existing tables.

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

_(Session 144's Admin Control Center chunks 1+2 handoff (backend foundation migration 0008 + the
`apply:reviews` loop-closer, PRs #631-#633), session 143's Admin Control Center scoping handoff (the
expert-panel report + build plan + 4 mockup screens, PR #626), session 142's Wörter quality-control
handoff (the
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
