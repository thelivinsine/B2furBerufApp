# Project Status

_Last updated: 2026-07-18 (session 128). **Gender-visuals research + Artikel-Visuals implementation
plan (docs/preview only, nothing shipped to the app), on branch
`claude/visual-gender-indicators-gsox24`.** A three-expert evidence panel (SLA research, memory
science, competitor/illustration scan) evaluated how to teach der/die/das visually; findings live
under **backlog #4 in `docs/PROJECT_REFERENCE.md`** (don't re-research). The founder reviewed two
design-preview pages (committed under `preview/artikel-visuals/`) and picked Artikel-Wesen mascots +
fused doodles + gender flip effects for the Theorie cards; the phased build plan with model
recommendations is **`docs/plans/ARTIKEL_VISUALS_PLAN.md`** (next session implements PR 1). Session
127's brand-kit catalogue (Vol. IV–VI) is still awaiting the founder's kit pick, see its handoff
below. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 127 (2026-07-17). Brand kit catalogue Vol. IV, on branch
`claude/epic-ramanujan-p049i8`. Preview + docs only; no `src/` touched, no gates run.** The founder
rejected all 20 of session 113's brand directions and asked Fable for 5–10 fresh brand kits built on
the recorded preferences (s116 verbatim: no gradients on logo or buttons; a variety of colorful
accents; don't bulldoze the already-designed pages/menus/icons).
- **Delivered `preview/branding/genauly-identity-vol4.html`** (indexed in that folder's `README.md`,
  also published as private Claude artifact `b4bd024b`): 8 complete kits, each a live SVG mark +
  wordmark + 64/40/20 px app icon + hex palette + free Google-Fonts type pairing + flat UI probe +
  a "Passt zum Bestand" line mapping it onto the existing app. The set: **Textmarker** (highlighter
  over the *genau* in "genauly", Cobalt & Butter), **Haken dran** (keeps existing indigo, lime check
  through the open G, cheapest to ship), **Sticker-Klub** (die-cut sticker G in the game's
  `GAME_OUT #463C44`), **Linie B2** (transit-line G, five line colors = five domains), **Zwei
  Stimmen** (two speech bubbles, teal + tangerine like the Heute tabs), **Bauhaus Pause** (G from
  circle/bar/dot primitives), **Neonschild** (neon-tube G on night ink, marketing face only),
  **Der Dachs** (geometric badger mascot, brand surfaces only).
- **Vol. V follow-up (same session):** the founder asked for real-app previews of Kits 1 + 6 and more
  kits in Kit 6's geometric philosophy. Delivered `preview/branding/genauly-identity-vol5.html` + seven
  preview strips in `preview/branding/vol5-screens/` (Kit 1, Kit 6, new kits **6A Bauklötze / 6B Ulm /
  6C Plakat / 6D Neubau**, plus an "Aktuell" reference), produced with the s116-proven token-swap method
  (real app headless, only CSS tokens + header logo swapped, gradients flattened; method documented in
  `preview/branding/README.md` for reuse). Still no `src/` change.
- **Vol. VI follow-up (same session, model switched to Opus 4.8):** the founder asked to lean into the
  two favorites (Kit 1, Kit 6) with more color variations, aiming for a stunning/premium/trust feel.
  Delivered `preview/branding/genauly-identity-vol6.html` + 9 strips in `preview/branding/vol6-screens/`:
  eight premium variations (Kit 1: Kobalt & Butter / Tinte & Messing / Aubergine & Aprikose / Marine &
  Koralle; Kit 6: Bauhaus / Graphit & Messing / Bordeaux & Marine / **Mitternacht** dark-mode) with the
  core marks intact, deep considered palettes, previewed on the real app (the harness now also drives the
  app's real `.dark` mode). Artifact `dfcad5f6`. Still no `src/` change.
- **Vol. VII follow-up (same session):** the founder picked Kit 1 · Kobalt & Butter and asked to recolor
  it to the bottom-nav blues (dark blue `#2563EB` as primary; the nav's light blue added to the palette
  and used in the logo swipe instead of butter). Delivered `preview/branding/genauly-identity-vol7.html`
  + 3 strips (`vol7-screens/`): two light-blue readings on the real app, **Himmelblau `#38BDF8`**
  (recommended) and **Cyan `#22D3EE`** (alternate), plus the original for reference. Artifact `a4b80dcf`.
  Awaiting the founder's pick of light blue; **that is the likely next real `src/` change** (wire the
  chosen two-blue palette into `index.css` light+dark, regenerate logo/favicons/PWA icons, and note the
  nav-mark colors already match since the palette is drawn from them). Still no `src/` change yet.
- **Next:** the founder picks a kit or a mix (e.g. "6A but with the Kit-6 mark", or "6C with red only
  in the logo"); then lock the spec, wire the palette into `src/index.css` + `tailwind.config.ts`
  (light + dark), regenerate logo/favicons/PWA icons from the mark, `pnpm build`, ship to `main`.
  Dark-mode previews of a favorite on request. Until then nothing brand-related changes in the app.

_(Session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
