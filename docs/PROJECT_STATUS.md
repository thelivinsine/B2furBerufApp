# Project Status

_Last updated: 2026-07-21 (session 143). **Admin Control Center scoped (research + plan +
mockups; docs/preview only, nothing built).** A four-agent expert panel (product strategy,
infrastructure audit, content ops, analytics/ops) scoped a founder "Kontrollzentrum": the full
report + recommendations live in `docs/plans/ADMIN_CONTROL_CENTER_PLAN.md`, the visual direction in
`preview/admin-control-center-mockups.html` (3 mockup screens). Flagship = the Prüfmodus review
cockpit + the `pnpm apply:reviews` loop-closer for the content-review bottleneck. Product name:
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
- **Open founder decisions** (plan §10): route naming (/admin proposed), MVP order confirmation,
  feedback triage fields, checklist storage, German-only UI. Next step if approved: build the MVP
  per plan §8.

**Handoff after session 142 (2026-07-21). Wörter (words) quality-control, branch
`claude/words-collocations-qc-0pycjq`, shipped to `main` (PR #624).** Founder screenshot of the
Theorie → Wörter list: "Aufgaben verteilen" (a Nomen-Verb collocation) sat article-less among real
nouns. QC found the Wörter list renders the whole vocab bank with no POS filter, so **8 noun+verb
collocations leaked in**; **6 were literal duplicates** of existing Kollokationen entries. Founder
direction: the individual words may stay in Wörter, but the *combination* belongs in Kollokationen.
What shipped:
- **Retire-from-surface, never delete** (shipped ids are permanent, progress is id-keyed). New
  `RETIRED_VOCAB_IDS` set + `browsableVocabulary` (= bank − retired) in `src/data/vocabulary.ts`.
  Every "words" surface reads `browsableVocabulary`: the Wörter browse (list/table/graph/counts,
  via `themeScoped` + `vocabByTheme`/`vocabBySubTheme` which are now browsable-based), global search
  (`lib/search.ts`), the composed-session word pools (`engine/session.ts` ×3: libraryFocus, focus,
  weightedDue), and `Sammlung.tsx`. `vocabById`/`vocabulary` stay the full bank for id resolution.
- **The 8 retired ids:** `v_aufgabe_verteilen`, `v_zustandig_klaeren`, `v_software_einfuehren`,
  `v_muell_vermeiden`, `v_energie_sparen`, `v_wortergreifen`, `v_planung_revidieren`,
  `v_vorwuerfe_zurueckweisen`.
- **Added the 2 combos missing from Kollokationen** (`c_planung_revidieren`,
  `c_vorwuerfe_zurueckweisen`) + provenance rows; the other 6 already existed there. Collocations
  1,033 → **1,035**.
- **`lint:content` guardrail (new `lintVocabCollocationOverlap`)** upgraded from warn to **ERROR**:
  a vocab word whose German equals a collocation `full` must be removed or listed in
  `RETIRED_VOCAB_IDS`, so a future overlap fails CI. Retired ids are the sanctioned exception; a
  stale set entry is also flagged. Normalizes lexemes (drops leading article, lowercases).
- **Gates:** `pnpm lint:content` (1,035 colloc, no errors) · `typecheck` · `test:unit` (219) ·
  `build` · `check:bundle` (110.5/400 kB) all green. Post-merge branch realigned to `main`.
  PWA caveat: the word list is service-worker-cached; hard-refresh the live site to see it.

_(Session 141's mobile-nav-item-labels handoff (labels under the active icon + the
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
