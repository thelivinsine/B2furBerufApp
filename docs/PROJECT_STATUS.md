# Project Status

_Last updated: 2026-07-18 (session 129). **Artikel-Visuals PR 1 + PR 2 SHIPPED** (plan:
`docs/plans/ARTIKEL_VISUALS_PLAN.md`): gender tokens + the three Artikel-Wesen creature marks on the
Theorie Wörter views + the der-burst/die-bloom/das-shatter flip effects + the one-time legend (PR 1,
two-model split: Opus 4.8 wiring then Fable 5 art), and the lazy fused-doodle registry with all 20
batch-1 scenes on the card backs (PR 2, branch `claude/article-visuals-opus-tasks-rxurot`). Phase 3
(session/graph reuse) is next. Session 127's brand-kit work (Vol. IV–VII): the founder picked Kit 1 · Kobalt &
Butter recolored to the bottom-nav blues and still owes the light-blue pick (Himmelblau vs Cyan;
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

**Content banks (as of 2026-07-18, session 128, after the s126 daily-life scale-up — re-verify with
`pnpm lint:content` before quoting):** vocab **1,623** · collocations **1,011** · Redemittel **149** ·
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

**Handoff after session 129 (2026-07-18). Artikel-Visuals PR 1 + PR 2 shipped (Wesen marks + flip
effects, then the 20-word fused-doodle batch), on branch `claude/article-visuals-opus-tasks-rxurot`.**
Implemented Phases 1 + 2 of `docs/plans/ARTIKEL_VISUALS_PLAN.md`; Phase 1 in the plan's intended
two-model split, both halves on the same branch:
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
- **Next: Phase 3** (session-grading effect + graph-card mark + Flashcards mark, Sonnet 5 medium
  per plan §6), then later doodle batches (Kapitel-2 content when authored, then top-Zipf
  bank-wide). PWA caveat: the Bibliothek is service-worker-cached, hard-refresh before judging the
  live result.

**Handoff after session 128 (2026-07-18). Gender-visuals research panel + Artikel-Visuals
implementation plan (Opus 4.8 → Fable 5), on branch `claude/visual-gender-indicators-gsox24`,
docs/preview files only, nothing shipped to the app.** The founder asked how to add visuals showing a
word's gender so learners "also learn visually", then floated a moustache-stick-figure idea and asked
for an evidence-based expert brainstorm. What happened, in order:
- **Idea survey + first preview page:** seven visual-gender ideas (ArticleBadge chips, shape encoding,
  plural-morphology highlighting, graph gender rings, suffix-rule hints, a gender-sort game scene,
  sub-theme watermarks), mocked in the app's real tokens.
- **Three-expert evidence panel** (parallel research agents: SLA literature, memory science,
  competitor/illustration practice). Headline results: images that FUSE meaning+gender have the
  strongest evidence (Santos 2015, n=283); color alone is weak and voices are harmful; a repeated
  "bizarre" marker (the moustache) self-defeats (contrast collapse + seductive-details penalty); human
  personas teach a FALSE rule on `das Mädchen`/`die Person`/`der Gast` and carry stereotype risk, so
  they were dropped; learner-generated associations (generation effect) and retrieval-moment practice
  carry the largest durable gains. Full findings + citations live under **backlog #4 in
  `docs/PROJECT_REFERENCE.md`** (recorded this session; do not re-research), including two proposed
  quiz exercises the founder flagged: the **"Meine Eselsbrücke" self-made memory hook** and an
  **Artikel-Sprint** der/die/das drill.
- **Second preview page** (panel findings + previews A–E). The founder picked **Preview B
  (Artikel-Wesen: three non-human mascots, spiky-blue der / round-rose die / boxy-green das), Preview C
  (fused per-word doodles), and Preview D (gender effects at answer-reveal)** for the **Theorie
  cards**. Both preview pages are committed under **`preview/artikel-visuals/`** (open in a browser;
  they follow light/dark).
- **The build plan is `docs/plans/ARTIKEL_VISUALS_PLAN.md`:** three phased PRs (1: tokens + Wesen
  marks on Karten/Tabelle/Liste + flip effect + one-time legend; 2: lazy doodle registry + batch 1 of
  20 fused doodles; 3: reuse in session grading, graph card, flashcards), each with model
  recommendations (Opus 4.8 for the cross-cutting wiring, **Fable 5 high for the Wesen/doodle art**,
  Sonnet 5 for mechanical reuse), acceptance criteria, and guardrails (gender palette distinct from
  `graphPalette.ts` domain colors, shape never color-only, reduced-motion, bundle budget, no
  always-on animation).
- **Founder selection rule for the 20 batch-1 doodle words (2026-07-18): high frequency AND highly
  useful for Kapitel 1 of the game.** The plan encodes it: the 10 nouns Kapitel-1 missions directly
  reference (6 die / 4 der / 0 das, listed in the plan) + 10 top-Zipf nouns from the Kapitel-1 mission
  themes (`travel`/`technology`/`sustainability`/`wohnen`/`behoerde`) with a das-balance override
  (>= 4 das-words in the batch), selection snippet included in the plan. (The five NEW s126 `alltag`
  themes are not Kapitel-1 themes, so they don't enter batch 1.)
- **Next session: implement the plan, starting with PR 1** (restart the branch from `main` first per
  the merged-PR rule, since this session's docs PR has merged).

_(Session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder picked Kit 1 · Kobalt & Butter recolored to the bottom-nav blues, awaiting the light-blue pick between Himmelblau `#38BDF8` and Cyan `#22D3EE`, see the W29 archive for the wiring steps), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
