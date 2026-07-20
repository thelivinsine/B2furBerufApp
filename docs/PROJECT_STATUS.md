# Project Status

_Last updated: 2026-07-20 (session 135). **Game demo-readiness review authored (no app code
changed):** the Neuland game layer was reviewed end-to-end for this week's demo — all gates green,
zero-console-error scripted playthrough, verdict "demo-ready with ONE must-fix bug" (the Heute →
Spielen compact tile opens scrolled to the wrong rows) plus a Nachtblau asset-regeneration polish
item and a 3–4-minute game demo script. Full findings + prioritized actions:
**`docs/plans/GAME_DEMO_READINESS_REVIEW.md`** (details in the s135 handoff below). The s133
**brand rebrand is COMPLETE** (Kit 1 · Nachtblau & Himmelblau + Koralle,
`docs/branding/BRAND_SPEC.md`), incl. the tile-less in-app logo + the generated `brand-kit/`
folder. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 135 (2026-07-20). Game demo-readiness review for this week's demo. Branch
`claude/game-review-demo-readiness-8fdpid`, doc-only.** The founder asked for a comprehensive review
of the current game (Neuland, G1 + G2 Kapitel 1) with priority actions so the game can be presented
in this week's demo. Deliverable: **`docs/plans/GAME_DEMO_READINESS_REVIEW.md`** (verdict, evidence,
prioritized P0/P1/P2 actions, and a suggested 3–4-minute game demo script). Key facts for the next
session:
- **Evidence gathered:** `pnpm typecheck` ✓ · `test:unit` 219/219 ✓ · `lint:content` ✓, plus a
  scripted Playwright playthrough (mobile 390x844, dev build, fresh profile): hub light+dark, mission
  1.1 scenes + battle + bag ask flow (Reisepass hand-over, Wörterbuch), boss 1.6 reachable ungated,
  Heute → Spielen embed. **Zero console errors.**
- **P0 (the one demo blocker):** the Heute → Spielen compact 3-row mission tile opens scrolled to the
  BOTTOM (shows 1.4–1.6, hides the next mission + its play button). Root cause in
  `src/features/welt/NeulandHub.tsx`: the auto-center uses `r.offsetTop`, but the compact scroll
  container is not positioned, so `offsetTop` (measured 615px) is document-relative and the tile
  slams to max scroll (182/182 measured). Fix: make the container `relative` or compute
  `r.offsetTop - c.offsetTop`; re-verify fresh + mid-chapter profiles.
- **P1:** regenerate the pixel assets in Nachtblau — `preview/game-pixel-mockups/welt_assets.py`
  still has `INDIGO = (91, 91, 230)` (`#5b5be6`); the s133 PR C swept only the TSX chrome, so
  backdrop signs/awnings, the player sprite, doc icons and the Wörterbuch sprite carry pre-rebrand
  indigo next to Nachtblau buttons. Change to `(61, 116, 237)`, rerun (needs Python + PIL), assets
  land in `src/features/welt/assets/`. Plus founder tasks: seed missions 1.1–1.3 on the demo device
  (game progress is LOCAL-ONLY, seed the exact presenting device) and a dress rehearsal of 1.4 + the
  boss after merges are live (hard-refresh first, PWA autoUpdate).
- **By-design, don't "fix":** missions light-only (hub theme-aware), Kapitel 2+ locked teaser, dark
  surround below short scenes, no game cloud sync until the G2 migration.
- **No code changed this session** (review only, per the ask). P0 + P1 fit one short session.

**Handoff after session 134 (2026-07-19). Theorie (Wörter) card + mobile-filter polish. Branch
`claude/filter-rail-mobile-height-n8ktd6`, shipped to `main` via PR #598 (squash `796fb01`).** A
short founder-driven round on the Theorie Wörter tab and the mobile filter (ran on Opus 4.8):
- **Mobile filter panel shorter (`FilterRail.tsx`, `panel` branch):** cap dropped
  `max-h-[55dvh]`→`max-h-[45dvh]` (~10 dvh, roughly 3-4 text lines) so an open filter leaves more of
  the card list visible on phones; the fixed header + internal `overflow-y-auto` scroll region are
  unchanged, so nothing is clipped.
- **"Verbunden" cross-module panel PARKED (`VocabList.tsx`):** the vocab card dropdown that linked a
  word to a Kollokation/Schreibtraining/Dialog (`RelatedPanel` + `relatedRows`) is hidden behind a
  reversible `const SHOW_RELATED = false` (founder wants to rethink its usefulness + dependencies
  before it ships). The panel + helper are untouched in the repo; re-enabling is a one-line flip. Do
  not delete them while parked.
- **Wörter Karten = "Option B" layout (`VocabList.tsx`):** with the bottom toggle gone the card was
  rearranged (founder picked B from a 4-option `preview/vocab-card-layouts.html`): quiet headline
  (gender creature + word left, bookmark right), the example gets room, and a foot row pins the
  plural (a small `bg-muted` pill) left + the speak button right via `mt-auto`, so every card in a
  row shares one foot line. Speak + plural moved OUT of the headline.
- **Gender reveal effect moved right + snappier die (`ArtikelEffect.tsx` + `index.css`):** new
  `align` prop; the vocab card back face passes `align="right"`, shifting the burst/bloom/shatter
  origin to `--fx-x: 78%` (into the empty right side where the English text isn't). The session
  player (`SessionPlayer`) keeps the default centered origin. The "die" bloom is now `470ms` fast-out
  cubic-bezier (was `650ms` ease-out) with a tighter `200/280/360ms` ring stagger (was
  `200/310/420`), finishing as crisply as der's rays / das's shards. The `left:50%` origins in
  `.artikel-fx-ray/ring/shard` now read `var(--fx-x, 50%)`.
- **Gates:** typecheck clean, lint 0 errors, build green, `test:unit` 219/219. **PWA caveat:** the
  Wörter cards are a service-worker-cached surface; hard-refresh before judging the live result.

_(Session 133's brand-kit-modernization handoff (plan + all 4 PRs + the consolidated brand-kit/ + the tile-less logo), session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VIII; the founder **finalized** Kit 1 · Nachtblau & Himmelblau + Koralle, locked spec at `docs/branding/BRAND_SPEC.md`, artifacts saved under `preview/branding/artifacts/`, NOT implemented — wire only on request; see the W29 archive), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
