# Project Status

_Last updated: 2026-07-18 (session 130). **Data-architecture review: P0/P1 integrity fixes
shipped** (verification fingerprints + the `pnpm stamp:verified` gate, the permanent-content-ids
contract with `ID_RENAMES` remapping, global id uniqueness + per-bank prefixes as lint errors,
the related-terms drop report). Session 129 shipped the Artikel-Visuals plan fully (all 3 phases,
`docs/plans/ARTIKEL_VISUALS_PLAN.md`). Session 127's brand pick is still open: Kit 1 · Kobalt &
Butter recolored to the bottom-nav blues, founder owes the light-blue pick (Himmelblau vs Cyan;
handoff in the W29 archive). Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 129 (2026-07-18). Artikel-Visuals plan FULLY shipped (all 3 PRs), on branch
`claude/article-visuals-opus-tasks-rxurot`.** Implemented every phase of
`docs/plans/ARTIKEL_VISUALS_PLAN.md`; Phase 1 in the plan's intended two-model split, both halves on
the same branch:
- **Opus 4.8 wiring half:** the `--der/--die/--das` (+`-bg`) tokens in `src/index.css` (light +
  dark) exposed via `tailwind.config.ts`; the new `src/components/artikel/` feature (pure
  `gender.ts` `genderOf` helper reading ONLY the authored `article` field, `Wesen.tsx`,
  `ArtikelEffect.tsx`, `ArtikelLegend.tsx`); `FlipCard` gained an optional `onFlip` callback; marks
  wired into `VocabList` (24px on the card front, effect on the back face), `VocabViews` Tabelle +
  Liste (16px solid tier), the one-time legend at the top of the Wörter list (dismiss flag
  `artikelLegendDismissed` in `useSettingsStore`, rides cloudSync); `tests/gender.test.ts`.
- **Fable 5 art half (this session's second commit):** the placeholder art was replaced with the
  founder-picked Preview B/D geometry from `preview/artikel-visuals/gender-doodles-panel.html`:
  wobbly tinted-body creatures with dot eyes and one deliberate imperfection each (der = apex
  sprout, die = unclosed outline + eyelash, das = two stray hairs), and the real per-element
  effects (der = 8-ray burst, die = 3 staggered bloom rings, das = 6 spinning shards, CSS classes
  `.artikel-fx-*` in `index.css`). A **200ms animation delay** syncs the effect with the card flip
  (the back face is only visible ~225ms into the rotation, a timing bug found reviewing the
  placeholder). Reduced motion gets an opacity-only fading tint. Verified via headless-Chromium
  screenshots (three creatures at 56/28/24/16px in light + dark; effects freeze-framed at
  120/300/450ms with the paused/negative-delay trick).
- **PR 2 (same session, Fable 5): the fused-doodle registry + batch 1.** The batch was selected by
  running the plan §4 snippet verbatim (10 mission nouns + programm/hotel/verfahren/geraet via the
  das override + it_sicherheit/daten/verbindung/version/funktion/anschluss by Zipf; final tally
  5 der / 11 die / 4 das, per-word list recorded in the plan §4). New
  `src/features/vocabulary/doodles/`: `index.ts` (eager id list, `hasDoodle`, `loadDoodle` via
  dynamic import) + `art.tsx` (all 20 scenes: referents in the new `--ink` token, the creature via
  the now-exported `WesenBody` so geometry has one home; ~120x96 viewBox per Preview C).
  `VocabCard` loads the art chunk on the FIRST flip of a registered card and renders the doodle
  above the English; unregistered cards untouched. `tests/doodles.test.ts` (25 tests): registry ↔
  art ↔ bank integrity, declared gender === bank `article`, and a rendered-markup assertion that
  every scene contains ONLY its own gender's CSS tokens (the wrong-gender-doodle guard). All 20
  scenes reviewed via SSR screenshot sheet in light + dark; three composition fixes from that
  review (Vollmacht's receiving hand, Hotel wall overlap, Beratung bubble tail).
- **Gates (after both PRs):** typecheck, lint (0 errors), test:unit 174, build, check:bundle
  79.6 kB unchanged; the art is its own lazy chunk (`art-*.js` ~11.8 kB / 3.4 kB gzip) loaded only
  on flip.
- **PR 3 (same session, Opus 4.8): reuse beyond the Theorie cards.** The reveal effect now fires on
  a CORRECT noun answer in the composed session (`SessionPlayer` flashcard/typing/speaking grade
  paths; gender looked up via `vocabById(sourceId)`, no-op for non-nouns and Redemittel/collocation
  cards; the effect overlays the stage but the block content sits `z-10` above it so the burst
  radiates from behind the opaque card and never crosses the text, a legibility fix found by
  screenshot). The Wesen mark also joins the Wörter-graph selected-node card (`WordGraph.tsx`) and
  the legacy `Flashcards.tsx` front (the component the session engine reuses). No new tests needed
  (marks/effect are the same tested components); gates green.
- **Next (optional): later doodle batches** (plan §4 growth path: Kapitel-2 content when authored,
  then top-Zipf nouns bank-wide, data+SVG only). Also parked in backlog #4: the Neuland Wesen
  tie-in + the Eselsbrücke / Artikel-Sprint session blocks. PWA caveat: the Bibliothek is
  service-worker-cached, hard-refresh before judging the live result.

_(Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder picked Kit 1 · Kobalt & Butter recolored to the bottom-nav blues, awaiting the light-blue pick between Himmelblau `#38BDF8` and Cyan `#22D3EE`, see the W29 archive for the wiring steps), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
