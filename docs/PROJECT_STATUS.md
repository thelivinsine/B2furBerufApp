# Project Status

_Last updated: 2026-07-19 (session 132). **Bibliothek mobile-filter fixes + graph two-area color &
layout** (PRs #581/#582/#583/#584, all squash-merged to `main`): fixed the mobile filter's empty-scroll
gap, made the mobile Filter badge count scope-dropdown selections (not just facet pills), and made the
open filter panel scroll away instead of sticking (moved it out of the sticky header). Both Bibliothek
graphs now **color-code by TWO life areas** (Berufsleben/professional vs Privatleben/personal) instead
of the five domains, and the Kollokationen graph uses the founder-picked **"by topic + tighter"** force
layout (firmer per-topic pull, looser links) so topics read as distinct islands. Session 131 shipped
Üben exercise-variety Phases 0–3. Session 127's brand pick is still open: Kit 1 · Kobalt & Butter
recolored to the bottom-nav blues, founder owes the light-blue pick (Himmelblau vs Cyan; handoff in the
W29 archive). Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 132 (2026-07-19). Bibliothek mobile-filter bug-fixes + graph two-area color &
"by topic + tighter" layout. Branch `claude/filter-scroll-badge-bugs-y75thb`, all shipped to `main`
via PRs #581 / #582 / #583.** Four founder screenshots drove a run of mobile-filter fixes on the
Theorie browse tabs plus a graph redesign:
- **Mobile filter, three fixes (`FilterRail.tsx` was already fine; the fixes were in the four browse
  trainers `VocabularyTrainer`/`CollocationsBrowser`/`RedemittelTrainer`/`GrammarHub` + `browseScroll`):**
  (1) empty-gap-on-scroll — the open filter panel lived inside the sticky/collapsing browse header, so
  collapsing it left its reserved flow space as a blank gap; (2) the mobile Filter-button badge counted
  only facet pills, not the Branche/Thema/Unterthema scope dropdowns; (3) after an interim guard the
  panel got *stuck* pinned open while scrolling. Final resolution: the filter panel is now **normal-flow
  content moved OUTSIDE the sticky header** (only the compact toolbar stays sticky and collapses), the
  badge adds `scopeActiveCount` (sectors + themes + subs) on Wörter/Kollokationen, and the header-collapse
  guard was reverted. All four tabs.
- **Graphs recolored to TWO life areas (`lib/graphPalette.ts` + `WordGraph.tsx` + `CollocationGraph.tsx`):**
  new `lifeAreaOf`/`lifeAreaColor`/`LIFE_AREAS`/`LIFE_AREA_COLORS` helpers bucket the five content
  domains into **Berufsleben (professional = `beruf`, brand indigo)** vs **Privatleben (personal =
  everything else, teal)**. Node color, glow, lit edges, legend chips and the legend domain-filter all
  collapse to these two on BOTH graphs; clustering still uses the finer theme grain.
- **Kollokationen graph layout = founder-picked "by topic + tighter"** (from a published comparison
  artifact of 5 force recipes on the real 1,243-node data): per-topic centroids kept, but firmer pull
  and tighter packing. **Final values after the s132 "tighter clusters" follow-up (PR #584):** forceX/Y
  `0.38`, link tension `0.22`, collision `r+3`, wider ring (`N*35`); charge `-55/240`. (The intermediate
  first pass was `0.28`/`0.11`/`r+5`.) Also thinned the default edge stroke (`1→0.55`) + lowered edge
  opacity earlier in the session for less visual noise.
- **Gates:** typecheck, `test:unit` 219, lint 0 errors, build all green. Comparison artifact (English,
  with a plain-language "how to read this" explainer) is a scratchpad HTML, not in the repo.
- **Deploy gotcha (learned this session):** the #583 squash-merge did NOT fire the GitHub `push` event,
  so neither `pages.yml` nor `validate.yml` ran and the commit showed no check. `pages.yml` has
  `workflow_dispatch`, so a manual dispatch against `main` re-deploys the current HEAD; that recovered it.
  If a merged commit shows no Actions run, dispatch `pages.yml` rather than assuming a build failure.
- **Not done / open:** the two-level (domains-as-regions, topics-as-sub-islands) layout was previewed
  but the founder chose topic+tighter instead. The preview artifact's variants still describe the
  earlier "by life area" options; it was a decision aid, not kept in sync post-decision.

**Handoff after session 131 (2026-07-18). Üben exercise-variety plan authored (Fable 5) + fully built
in 5 PRs (mostly Opus 4.8), branch `claude/ueben-exercise-variety-i59ry0`, all shipped to `main`.**
The founder wanted custom Üben sets (the Bibliothek Üben button on a filtered tab) to play as varied
exercises, not flip-cards, **without authoring content per set combination**. The variety machinery
already existed (`engine/quiz.ts` auto-generates exercise types from the banks; `SessionPlayer` renders
them) but was theme-keyed while `buildScopedSession` mapped custom-set items to flashcards. The plan
`docs/plans/UEBEN_EXERCISE_VARIETY_PLAN.md` (5-option analysis in Appendix A, per-PR model map in §6,
per-phase blow-by-blow) locks "sets are filters, exercises are per-item templates" and **Phases 0–3 are
now COMPLETE** (only the deferred Phase 4 remains). Full per-PR detail is in the plan + the s131 prompt
log; the shipped result, and the anchors not to regress:
- **PR 1 (Phase 0/1):** generalized `buildThemeQuiz` → pool-based `buildPoolQuiz` (`/quiz` + composed
  Pool 2 behavior-identical); `buildScopedSession` now interleaves recall cards with generated exercises
  (Wörter + Kollokationen), capped at 2 appearances/item (`capBySource`); **FSRS guard** in
  `SessionPlayer.onQuizResult` writes SRS only for ids that resolve in the vocab bank (also fixed the
  latent Pool 2 bug where collocation questions wrote SRS under `c_*`).
- **PR 2 (2a + 2e):** noun↔verb match grid (`collocationMatchQ`, reuses kind `"matching"`, `distinctCols`
  dedupe) + Redemittel cloze (`redemittelCloze` kind, `buildRedemittelQuiz`).
- **PR 3 (2b):** typed-cloze `typing` variant (`cloze` field, graduated words only) + `gradeTypedAny`
  (accepts the surface form OR the base head).
- **PR 4 (2c):** TTS listening pick (`listeningCloze` + `audioPrompt`), gated on
  `ttsSupported() && speechEnabled`; `MCQView` audio branch.
- **PR 5 (2d + Phase 3):** odd-one-out (`oddOneOut`, no sourceId → XP only) + `avoidRuns` (no 3-in-a-row
  same kind). Every quiz kind labeled in `kindLabel`.
- **Coverage gauge:** `pnpm report:exercise-coverage` (`scripts/report-exercise-coverage.mjs`) runs the
  REAL builder across every theme (all levels × new/mature decks, seeded → deterministic) → visual
  `docs/reports/exercise-coverage-report.md`. **Finding: theme-level variety is already exhausted
  (20/20 🟢)**; the residual is cheap word-level polish (85 words with no self-example → no
  cloze/typing/listening; 74 with no resolvable `related` → no odd-one-out). The plan's "Deciding when
  to start Phase 4" section holds the rule: start Phase 4 only when that residual is closed AND a
  learner-repetition/plateau signal appears (needs telemetry the report deliberately lacks).
- **Gates (final):** typecheck ✓ · test:unit **219** ✓ · lint 0 errors ✓ · build ✓ · check:bundle
  **80.8 kB** (main chunk unchanged across all 5 PRs) · lint:content ✓. Zero new content-bank rows.
- **Next:** close the word-level residual (content edits, cheap) before considering Phase 4. **PWA
  caveat:** the session surface is service-worker-cached; hard-refresh before judging the live result.

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
