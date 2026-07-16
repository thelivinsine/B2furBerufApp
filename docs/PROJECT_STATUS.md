# Project Status

_Last updated: 2026-07-16 (session 125). **Theorie graph word-selection distribution + focus polish, on
branch `claude/graph-word-selection-distribution-5av8xk`, shipped to `main` across PRs #542–#544, #546–#550
(nine squash-merges).** The founder iterated on how the Wörter and Kollokationen graphs behave when a word
is selected. End state: selecting a node keeps each connection's DIRECTION but fans clustered angles out
and places them on an ellipse sized to fill ~80% of the free area (so nothing is cramped near the center,
even a single connection, and the left/right space is used); nodes are spaced by their LABEL box so every
connection word stays legible (draw pass no longer culls focus labels); the view frames at a readable zoom;
deselecting animates every node home. The Kollokationen fit-to-screen button now matches the Wörter one
(random well-connected node), all fit-button view switches animate, and the Kollokationen card floats with
the same edge gap as the Wörter card. All animations respect prefers-reduced-motion. Two files only:
`WordGraph.tsx` + `CollocationGraph.tsx`. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 124 (2026-07-16). Kollokationen Karten card text-cutoff + speak-button
alignment fix (Sonnet 5), on branch `claude/card-text-alignment-fixes-cc3k0r`, shipped to `main`
(PR #545, squash-merged).** Founder-reported bug via screenshot: in the Bibliothek/Theorie →
Kollokationen "Karten" view, some card titles were cut off mid-word with an ellipsis, and the
speak-out-loud icon next to the title sat at inconsistent horizontal positions from card to card.
- **Root cause:** `CollocationCard` in `src/features/collocations/CollocationsBrowser.tsx` rendered
  the title (`c.full`) in a `flex items-center` row with a hard `truncate` class and no `flex-1`. A
  short title (e.g. "Zeit sparen") left the `<p>` at its natural content width, so the `SpeakButton`
  sat immediately after the text instead of at the card's right edge; a long title filled the row via
  flex-shrink and got ellipsis-truncated. The example-sentence row directly below it already used the
  correct pattern (`min-w-0 flex-1`, no truncate) and never had this bug.
- **Fix (one file, 2 lines):** changed the title row to `flex items-start gap-1.5` and the title `<p>`
  to `min-w-0 flex-1 ... leading-snug` (dropped `truncate`, dropped `items-center`), mirroring the
  example row. Titles now wrap onto a second line when needed instead of truncating, and the speak
  icon is always flush against the card's right edge regardless of title length.
- **Verification:** `pnpm typecheck` clean, `pnpm lint` clean on the file, `pnpm build` +
  `pnpm check:bundle` green (main chunk 79.6 kB). Visually verified end-to-end: built + served
  `pnpm preview`, seeded `localStorage b2beruf.settings.v1` to skip onboarding, Playwright screenshot of
  `/library?tab=kollokationen&view=karten` at 1200px wide confirmed every title (including previously
  truncated ones like "etwas zur Sprache bringen" and "einen Termin verschieben") renders in full and
  every speak button aligns flush right, from long titles down to the shortest ("Zeit sparen").
- **Scope note:** only the Kollokationen Karten tile was reported/fixed. The Wörter card
  (`VocabList.tsx`) has the same `truncate`-without-`flex-1` pattern on its title but was not reported
  as broken and was left untouched (single vocab words rarely overflow at card width); worth the same
  fix if it's ever reported.

_(Session 123's Theorie graph-view P2/P3 batch handoff, session 122's Theorie graph-view quality audit
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
