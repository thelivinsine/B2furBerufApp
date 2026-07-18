# Project Status

_Last updated: 2026-07-18 (session 131). **Üben exercise-variety PR 1 shipped** (Phase 0 + Phase 1
of `docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md`): custom Bibliothek Üben sets (Wörter + Kollokationen)
now interleave auto-generated exercises with recall cards instead of flip-cards only, zero new
content data, plus an FSRS-guard fix (quiz answers no longer write SRS under collocation ids).
Session 130 shipped the data-architecture P0/P1 integrity fixes. Session 127's brand pick is still
open: Kit 1 · Kobalt & Butter recolored to the bottom-nav blues, founder owes the light-blue pick
(Himmelblau vs Cyan; handoff in the W29 archive). Product name: **Genauly** (`genauly.de`)._

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

**Content banks (as of 2026-07-18, session 130, verified against `pnpm lint:content` — re-verify
before quoting):** vocab **1,623** · collocations **1,033** · Redemittel **149** ·
grammar **24 topics / 117 drills** · Lese-/Hörtexte **36** · Can-Do **52** · provenance **~3,105
rows** · themes **20** (five new `alltag` themes in s126: einkaufen/essen/mobilitaet/freizeit/
digitales) · exam sets **15** · dialogues **30**. Taxonomy is **5 top-level domains** (the
`beruf`/`arbeitswelt` work split was merged into one `beruf` in s121), all populated. **Branche is a scope
since s102** (15 sectors, `sectors[]` multi-tag, untagged = universal) on Wörter + Kollokationen.
Standing governance debt: ~98% of provenance rows are AI-drafted, not yet human-verified (see
`strategy/DATA_GOVERNANCE.md`).

## Open founder action items
Completed setup items are recorded in `docs/PROJECT_FOUNDATION.md`. Still open:
- [ ] **Run migration 0007 (s130):** `supabase/migrations/0007_provenance_reviews_admins.sql` in the
      Supabase SQL editor, so the second admin account (`thesuhaspala@gmail.com`) can save review
      marks in the new /sources Daten-Werkbank. Steps in `docs/plans/PHASE2_SETUP.md` ("Admin source
      review"). Until then that account sees the workbench but its saves silently no-op.
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

**Handoff after session 131 (2026-07-18). Üben exercise-variety: plan authored (Fable 5) THEN PR 1
implemented (Opus 4.8), branch `claude/ueben-exercise-variety-i59ry0`, shipped to `main`.** The
founder wanted custom Üben sets (the Bibliothek Üben button on a filtered tab) to play as varied
exercises, not flip-cards, without authoring content per set combination. Analysis found the variety
machinery already existed (`engine/quiz.ts` auto-generates ~10 exercise types from the banks;
`SessionPlayer` renders all of them) but was theme-keyed while `buildScopedSession` mapped custom-set
items to flashcards. The plan (`docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md`, incl. the full 5-option
analysis in Appendix A + per-PR model map in §6) locks the principle "sets are filters, exercises are
per-item templates". **Shipped in PR 1 (Phase 0 + Phase 1):**
- **Phase 0 — `buildPoolQuiz`:** `engine/quiz.ts`'s theme-keyed generator was generalized to take an
  arbitrary `{ vocab, collocations }` pool. `buildThemeQuiz` is now a thin wrapper (full-bank
  distractors + `includeGeneric: true`), so `/quiz` and composed-session Pool 2 are behavior-identical.
  New opts: `includeGeneric` (theme-agnostic connector/relative/daWord banks, OFF for scoped sessions
  per the content-pure rule), `vocabDistractors`/`collocationDistractors` (default: the pool if ≥ 4
  else the full bank, so small sets still build 4-option MCQs), `themeId`. A shared `anyContent()`
  fallback makes sparse/collocation-only pools still yield exercises at any difficulty.
- **Phase 1 — varied `buildScopedSession`:** the Wörter + Kollokationen scopes now `interleave` recall
  cards with `buildPoolQuiz` exercises (~50/50), capped at **2 appearances per item** (`capBySource`);
  a vocab set also pulls collocation fill/word-order from collocations whose noun is a set word
  (`headword` resolution). Redemittel + Grammatik scopes unchanged. `difficulty` now flows from the
  learner's level (`SessionPlayer` passes `difficultyForLevel(level)`). Preview line shows the mix
  ("n Karten · m Übungen").
- **FSRS guard (correctness fix):** `SessionPlayer.onQuizResult` now only calls `captureLoot`
  (→ `reviewVocab`) when the question's `sourceId` resolves in the vocab bank (`vocabById`).
  Collocation-sourced questions (fill/word-order, `c_*` ids) award XP + combo only, so they no longer
  create phantom SRS cards under collocation ids. This also fixes the same latent bug in the composed
  session's Pool 2.
- **Tests:** new `tests/scopedSession.test.ts` (pool-purity, no-generic-when-disabled, degenerate
  pools, variety ≥ 3 kinds, 2-appearance cap, tiny-set degrade, Redemittel/Grammatik unchanged).
- **Gates:** typecheck ✓ · test:unit **209** ✓ · lint 0 errors ✓ · build ✓ · check:bundle **80.8 kB**
  (main chunk unchanged; all engine code rides the lazy session chunk) · lint:content ✓.
- **Next: PR 2** (Phase 2a noun↔verb match grid + 2e Redemittel cloze, Sonnet 5), then PRs 3–5 per the
  plan §6 model map. Restart the branch from `main` first per the merged-PR rule. **PWA caveat:** the
  session surface is service-worker-cached; hard-refresh before judging the live result.

**Handoff after session 130 (2026-07-18). Data-architecture review + P0/P1 integrity fixes (Fable 5),
branch `claude/app-data-management-guide-tcmz3j`, shipped to `main`.** The founder asked how the
content/data layer is managed (answered in chat + a private pipeline-diagram artifact), then asked for
an expert architecture review with P0–P3 recommendations, then approved implementing the P0 + P1 set:
- **P0, verification fingerprints:** a `review_status: "verified"` stamp is now tied to the exact
  content the human reviewed. New `pnpm stamp:verified` (`scripts/stamp-verified-hashes.mjs` + shared
  `scripts/content-hash.mjs`) writes a canonical-JSON sha256 per verified provenance row to
  `docs/reports/verified-hashes.json`; `pnpm lint:content` FAILS when a verified item's current
  content no longer matches its stamp (tamper-tested end to end). The 25 verified Can-Do rows are
  stamped. **New reviewer workflow: flip rows to `verified` → `pnpm stamp:verified` → commit both.**
- **P1, shipped-ids-are-permanent contract:** new `src/lib/idRenames.ts` (`ID_RENAMES` table, empty
  for now, + pure remap helpers). Applied in `useProgressStore` persist migrate (version 0 → 1) and on
  incoming cloudSync remote rows, so a future id rename carries FSRS/progress history instead of
  silently orphaning it. The linter validates the table (source gone, target resolves, no cycles).
  Pinned by `tests/idRenames.test.ts`.
- **P1, global id integrity:** cross-bank content-id uniqueness AND the per-bank id prefixes
  (v_/c_/g_/sc_/ex_/r_/cd_/tx_/m_/wp_) are now lint ERRORS (`lintGlobalIds`; the scattered per-bank
  prefix warnings were removed). All banks were already compliant, so nothing needed retagging.
- **P1, related-terms audit:** `lint:content` now writes `docs/reports/related-terms-report.md`
  (495 of 3,268 `related` terms don't resolve to a bank entry, i.e. word-graph edges dropped by
  design but previously invisible) plus a one-line summary in the lint output. Not a gate.
- **P2/P3 recommendations delivered but NOT implemented** (each has a natural trigger): an
  `add-content` scaffolding script + JSON banks (next big content wave), a build-time summary for the
  ~2 MB `/sources` chunk (content growth), zod-style single-source schemas (next linter surgery),
  game-state cloud sync (G2, already planned), an oracle-coverage warning for fact-unchecked new
  nouns, and a learner-performance → review-queue feedback loop (post-launch, needs telemetry).
- Gates: `lint:content` 0 errors · `test:unit` 184/184 (after rebasing onto the s129 Artikel-Visuals PRs) · `pnpm build` green · bundle 80.7 kB.
  Also refreshed the stale collocation count (1,011 → 1,033) in the docs.
- **Second task (same session): /sources redesign + admin Daten-Werkbank.** The public page now
  tells the data-architecture story visually (four stat tiles, the five-step pipeline graphic, a
  stacked tier-distribution bar with legend incl. a "nächste Prüfwelle" remainder row, per-bank
  count tiles; sources/licenses/item browse kept, title now "Quellen & Datenqualität"). Founders
  additionally get **`features/legal/AdminWorkbench.tsx`**: the full register joined with tier +
  live review marks as a sortable `DataTable` with fuzzy search, Typ/Stufe/Status filters (incl.
  Zu prüfen / Mit Notiz / Ohne Quelle / Namensnennung), **CSV export of the filtered view**
  (`src/lib/csv.ts`, BOM for Excel), copy-id chips, per-row "geprüft" checkbox + note saving
  immediately to Supabase, and a progress bar. **Admin gate is now TWO accounts**
  (`FOUNDER_EMAILS` in `src/lib/admin.ts`: thelivinsine + thesuhaspala, pinned by
  `tests/admin.test.ts`); the matching RLS update is **migration 0007** (founder action item
  above). Verified via headless-Chromium screenshots (public light/dark/mobile + workbench
  desktop with live search). New tests: csv (6), admin gate (4), workbench smoke (4);
  `test:unit` 198/198, build green, bundle 80.8 kB.

_(Session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder picked Kit 1 · Kobalt & Butter recolored to the bottom-nav blues, awaiting the light-blue pick between Himmelblau `#38BDF8` and Cyan `#22D3EE`, see the W29 archive for the wiring steps), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
