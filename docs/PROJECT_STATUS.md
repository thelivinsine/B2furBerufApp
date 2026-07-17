# Project Status

_Last updated: 2026-07-17 (session 126). **Daily-life content scale-up (COMPLETE), branch
`claude/scale-words-domains-qjv9x4`, shipped to `main` across PRs #553–#558 (six squash-merges).** The
founder asked to scale up vocabulary beyond the workplace (Berufsleben was ~78% of the bank) and approved a
two-phase plan (`docs/plans/DAILY_LIFE_SCALEUP_PLAN.md`). **Phase A** deepened the five original daily-life
themes (bank/bildung/behoerde/wohnen/arzt) to ~80 vocab / ~50 collocations (#553). **Phase B** added five
NEW everyday-life `alltag` themes — einkaufen (#554), essen (#555), mobilitaet (#556), freizeit (#557),
digitales (#558) — each a full pack (49 vocab / 40 collocations / 2 dialogues / 2 texts / 3 Can-Do / 1
writing prompt / full provenance, new lucide icon + ThemeId wiring). New alltag themes fold into the
Wohnhaus city building via an `alltag` domain rollup. New bank totals: **1,623 vocabulary / 1,011
collocations / 3,105 provenance rows / 20 themes**. Every theme/PR passed lint:content, verify:facts (0
two-oracle-confirmed errors), build, test:unit 146/146, check:bundle 79.6 kB, eslint 0 errors. Product
name: **Genauly** (`genauly.de`)._

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

**Content banks (as of 2026-07-14, session 120 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,246** · collocations **797** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,452 rows** · themes **15** ·
exam sets **15** · dialogues **20**. Taxonomy is **5 top-level domains** (the `beruf`/`arbeitswelt`
work split was merged into one `beruf` in s121), all populated. **Branche is a scope
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

**Handoff after session 126 (2026-07-17). Daily-life content scale-up (Phase A + Phase B, COMPLETE), on
branch `claude/scale-words-domains-qjv9x4`, shipped to `main` across PRs #553–#558.** The founder:
_"currently the app has mainly berufsleben words. Can you scope a task to scale up words from other
domains?"_ → _"i chose both phase a and b"_ → _"go ahead with the plan"_ → _"yes go ahead with phase b"_.
- **Scoped** `docs/plans/DAILY_LIFE_SCALEUP_PLAN.md`: Phase A deepens the 5 existing daily-life themes to
  workplace parity; Phase B adds new everyday-life themes. Committed on the branch.
- **Executed Phase A (four theme commits on the branch, NOT yet merged to `main`):**
  - `bank`: 43 → **81 vocab**, 38 → **50 colloc** (+38 v / +12 c).
  - `bildung`: 46 → **80 vocab**, 39 → **50 colloc** (+34 v / +11 c).
  - `behoerde`: 49 → **80 vocab**, 42 → **50 colloc** (+31 v / +8 c).
  - `wohnen`: 57 → **80 vocab**, 45 → **50 colloc** (+23 v / +5 c); `arzt`: 74 → **80 vocab** (+6 v).
  - Every item CEFR-tagged B1–B2, spread across the theme's 4 sub-themes (deliberately lifting the thin
    ones, e.g. behoerde.bescheid/aufenthalt, bildung.anerkennung/weiterbildung, wohnen.suche/vertrag). One
    `provenance.ts` row per id (all `review_status: "draft"`, DWDS/Wiktionary references). New bank totals:
    **1,378 vocabulary / 811 collocations / 2,620 provenance rows.**
  - Gates per theme: `pnpm lint:content` ✔, `pnpm build:frequency` (regenerated), `pnpm verify:facts`
    (0 two-oracle-confirmed errors; the 7 review signals are all pre-existing dual-gender headwords, none
    from this work), `pnpm build` ✔.
- **Phase B (COMPLETE): five NEW `alltag` themes, one PR each, all squash-merged to `main`:**
  - `einkaufen` (Einkaufen & Geschäfte, #554), `essen` (Essen & Restaurant, #555), `mobilitaet` (Mobilität
    & Verkehr, #556), `freizeit` (Freizeit & Soziales, #557), `digitales` (Handy, Internet & Digitales,
    #558). Each is a full `behoerde`-shape pack: **49 vocab / 40 collocations / 2 dialogues / 2 texts /
    3 Can-Do / 1 writing prompt / ~97 provenance rows**, spread across 4 sub-themes, CEFR-tagged B1–B2.
  - Per theme, wired: `types/index.ts` `ThemeId` + `scripts/lint-content.mjs` `THEME_IDS` (kept in sync),
    a new lucide icon in `src/lib/icons.ts` (ShoppingCart/UtensilsCrossed/Bus/PartyPopper/Smartphone), the
    `src/data/themes.ts` record, and the required `writingPrompts` entry (the `Record<ThemeId>` type forces
    it). **Locked success metric held:** no feature/component code changed except the one-line city rollup.
  - **City buildings:** einkaufen's PR added `domains: ["alltag"]` to the **Wohnhaus** building so all five
    new (and any future) unclaimed `alltag` themes fold in by domain rollup; bank/behoerde/wohnen stay
    explicitly claimed first. Updated `tests/city-mastery.test.ts` (`toContain("wohnen")`) for the
    full-coverage invariant. A dedicated "consumer/town-life" building is a possible future founder call.
  - Gates each PR: lint:content, build:frequency, verify:facts (0 errors), build, **test:unit 146/146**,
    check:bundle 79.6 kB, eslint 0 errors.
- **Recurring gotcha (both phases):** many planned ids collided with existing entries in OTHER themes
  (shopping ↔ customer, food ↔ customer, transport ↔ travel/logistics, digital ↔ technology). **Pre-check
  every candidate id with `grep -c 'id: "v_X"'` / `'id: "c_X"'` across the whole bank BEFORE authoring** to
  avoid rework; pick theme-distinct words rather than duplicating a concept already tagged elsewhere.
- **Next / follow-ups:** the whole scale-up plan is done. Natural continuations: (1) founder review pass to
  flip the new `draft` provenance rows to `verified` (use `pnpm review:queue`); (2) exam sets / more
  dialogues for the new themes if depth is wanted; (3) a dedicated city building for the consumer themes if
  the Wohnhaus fold feels wrong. Nothing is blocking.

**Handoff after session 125 (2026-07-16). Theorie graph word-selection distribution + focus polish
(Opus 4.8), on branch `claude/graph-word-selection-distribution-5av8xk`, shipped to `main` across nine
squash-merges (PRs #542, #543, #544, #546, #547, #548, #549, #550).** A long founder-iterated thread on
how the **Wörter** and **Kollokationen** graph views (`/library?tab=…&view=graph`) behave when a word is
selected. All work is in two files: `src/features/vocabulary/WordGraph.tsx` +
`src/features/collocations/CollocationGraph.tsx`. The final selection/focus model (identical in both
graphs):
- **Fan-out on select, restore on deselect (#542/#543).** Selecting a node animates its connections into
  a focused arrangement and frames them at a readable zoom (clamped, so a selection is never left too
  zoomed out after a fit-to-all); deselecting (empty-space tap or card ✕) animates every displaced node
  back to its stored **home** position. Implemented with a `homePosRef` (true home per displaced node) +
  a `focusRafRef` easeOut tween that pins moved nodes (`fx/fy`) so the d3 sim can't fight it; home
  positions (not the transient focus spots) are what get cached to `posRef` on rebuild/unmount.
- **Direction-preserving pull-in, not a rebuilt ring (#544).** Rejected the first "even symmetric ring"
  because it rearranged too much. Each connection keeps its **direction**; the founder then asked for the
  space to be used, so the final placement (#549) puts each connection on an **ellipse sized to fill
  ~82% of the free area** at the target zoom (`TARGET_FOCUS_K = 2.3`, per-axis rx/ry so a wide-but-short
  free area still fills across), at a radial factor that keeps relative order but never below 0.72 of the
  ellipse — so even a **single** connection spreads out instead of cramping at center.
- **Angle spreading (#550).** A hub whose connections all pointed one way (e.g. `beantragen`, 16) still
  stacked in a central column. `spreadAngles()` (module-scope pure fn in both files) blends each angle
  toward an even slot (slots rotation-aligned to the originals to minimize movement), preserving circular
  ORDER, so clustered connections fan around the whole ellipse and use the left/right space.
- **Label legibility (#548).** Nodes are spaced by their **label box** (measured width + the line under
  the dot) via an AABB `relaxLabels` pass with the selected word as an immovable box; `frameFocus`
  expands its bounds by label extents so nothing clips; and while focused the draw pass **no longer culls
  overlapping labels**, so a connection word can never silently disappear.
- **Fit button + animation parity (#547).** The Kollokationen fit-to-screen button now behaves like the
  Wörter one (second press zooms into a **random well-connected node**, weighted by area, excluding the
  current selection, instead of always the biggest hub). Every fit-button view switch animates (the
  fit-all press tweens the camera via the focus tween; the word-jump animates through the focus effect).
  `fitToNodes`/`fitToRect` were refactored to **return** the transform (`computeFit`/`computeFitRect`).
- **Card spacing (#544).** The Kollokationen selected-node card (both horizontal bar + vertical panel
  shapes) now floats clear of the canvas edges by the same `bottom-3/left-3/right-3` gap the Wörter card
  uses, instead of sitting flush.
- All tweens respect `prefers-reduced-motion` (instant). Verified with dark-mode mobile Playwright
  screenshots across 1-, 2-, 5-, 9-, and 16-connection selections + a numerical check of `spreadAngles`.
  Gates each PR: typecheck clean, lint at the 53-warning baseline (0 errors), `test:unit` 146/146, build +
  check:bundle 79.6 kB, 0 console errors.
- **Caching caveat surfaced repeatedly:** several founder screenshots showed already-fixed behavior,
  i.e. the installed PWA was serving a **cached** service-worker build. If a graph change doesn't appear
  after deploy, hard-refresh / reopen the app so the new SW activates. If `beantragen` still looks
  cramped after that, `spreadAngles`' `blend` (0.7) is the one knob to push harder.

_(Session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
