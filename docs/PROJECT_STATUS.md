# Project Status

_Last updated: 2026-07-14 (session 118). **Kollokationen nodal graph shipped (Opus 4.8), on branch
`claude/kollokations-nodal-graph-080jt7`.** Added a Graph view to the Bibliothek Kollokationen tab
(parity with Wörter, reversing the old "graph stays Wörter-only" scoping): a **bipartite noun ↔ verb**
force-directed canvas of the filtered collocation list, built to look striking fully zoomed out (theme
islands, cached glow sprites, curved edges, vignette). Model + layout confirmed with the founder before
building. New files: `lib/graphPalette.ts` (shared domain palette, lifted out of WordGraph),
`collocations/collocationGraph.ts` (pure builder) + `tests/collocationGraph.test.ts`,
`collocations/CollocationGraph.tsx` (lazy renderer); wired into `CollocationsBrowser.tsx`. All gates
green (typecheck, lint 0 errors, test:unit 142/142, build, check:bundle main 79.5 kB, browser-verified
light+dark, desktop+mobile). (Parallel session 117 shipped Üben-exit navigation + Üben-button copy,
already on `main`.) Product name: **Genauly** (`genauly.de`)._

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

**Content banks (as of 2026-07-12, session 102 — re-verify with `pnpm lint:content` before quoting):**
vocab **1,113** · collocations **741** · Redemittel **149** · grammar **24 topics / 117 drills** ·
Lese-/Hörtexte **26** (78 checks) · Can-Do **37** · provenance **2,263 rows** · themes **15** ·
exam sets **15** · dialogues **20**. All six top-level domains are populated. **Branche is a scope
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

**Handoff after session 118 (2026-07-14). Kollokationen nodal graph (Opus 4.8), on branch
`claude/kollokations-nodal-graph-080jt7`.** Shipped a Graph view for the Bibliothek **Kollokationen**
tab, matching the Wörter graph's slot but purpose-built for collocations.
- **Model (founder-confirmed before building):** a **bipartite noun ↔ verb** graph. Every distinct noun
  and verb is a node; every collocation is an edge. Tap a verb → its nouns; tap a noun → its verbs. Hub
  verbs (machen/treffen) surface naturally. Edges are the authored collocations, nothing inferred.
- **Layout (founder-confirmed):** **theme islands** — nodes are pulled to per-theme centroids
  (`forceX/forceY`) so themes form glowing clusters, shared verbs bridge between them.
- **"Stunning zoomed out" finesse:** opens **fit-to-all** (not zoomed into a hub like Wörter); cached
  radial **glow sprites** (additive in dark) instead of per-frame shadowBlur; **curved** quadratic
  edges tinted by source domain; a **vignette** background; **nouns = solid discs, verbs = rings**
  (annuli) so the bipartite structure reads without a legend; labels fade in with zoom, hubs a touch
  earlier. Node size = **degree** (frequency.ts is keyed by content_id, not surface form, so degree is
  both available and more meaningful). Domain color = the node's majority theme's domain.
- **Files:** `src/lib/graphPalette.ts` (shared `DOMAIN_COLORS`/`domainColor`, lifted out of
  `WordGraph.tsx`, which now imports it — behavior unchanged); `src/features/collocations/collocationGraph.ts`
  (pure builder) + `tests/collocationGraph.test.ts` (8 tests); `src/features/collocations/CollocationGraph.tsx`
  (lazy canvas renderer, mirrors WordGraph's interaction/camera); wired into `CollocationsBrowser.tsx`
  (`KOLLOKATION_VIEWS` gained `graph`, `React.lazy` + Suspense, passes the `filtered` list). The
  bipartite selected-node card lists partner chips (clickable) + one example + SpeakButton; the legend
  doubles as a Nomen/Verben + domain filter.
- **Wörter graph untouched** except the one-line palette import swap. d3-force stays in the shared
  `vendor-misc` chunk (both graph chunks import it), so the main chunk is unaffected (79.5 kB/400).
- **Gates:** typecheck clean, lint 0 errors (pre-existing warnings only), `test:unit` 142/142, `build`
  green, `check:bundle` pass. Browser-verified via Playwright over `pnpm preview`: fit-to-all opens on
  the constellation, node selection dims + shows the partner card, zoom/pan/legend-filters work, light
  + dark + mobile all coherent, zero console errors. Screenshots in the session scratchpad.
- **Not yet shipped to `main`:** committed + pushed to the branch; PR/merge left for the founder to
  review the visuals first (per the "no PR unless asked" harness rule).
- **Possible follow-ups if the founder wants:** stronger island separation (raise centroid strength /
  ring radius), a "focus a theme" tap on the domain legend that recenters, or an Üben hook from the card.

**Handoff after session 117 (2026-07-14). Üben navigation + Bibliothek Üben-button copy (Opus 4.8),
on branch `claude/uben-session-navigation-q4pfs0`. Two small, self-contained founder fixes; both
shipped to `main`.**
- **(1) Exit-returns-to-origin.** `SessionPlayer` (`src/features/session/SessionPlayer.tsx`) added an
  `exit()` helper: `(window.history.state?.idx ?? 0) > 0 ? navigate(-1) : navigate("/")`. Every Üben
  entry point pushes a history entry (`navigate("/session?...")` from the Bibliothek trainers, Heute →
  `UebenPath`, Grammatik lessons, `Analytics`, `Sammlung`), so `navigate(-1)` lands back on the exact
  prior route with its filters/scroll intact; a deep link or fresh load (history idx 0) falls back to
  `/`. Wired into all three exit paths (empty-state button, done-screen "Zurück", exit-confirm
  "Beenden"); the two "Zur Übersicht" labels became "Zurück".
- **(2) Count in the Üben button.** `UebenLabel` (`src/features/shared/browseScroll.tsx`) now takes
  optional `count` + `noun` and renders "Üben mit {count} {noun}". The four Bibliothek trainers
  (`VocabularyTrainer`, `CollocationsBrowser`, `RedemittelTrainer`, `GrammarHub`) pass the filtered
  count with the correct **dative** noun (Wörtern / Kollokationen / Wendungen / Themen; singular
  fallbacks) at BOTH the desktop rail footer and the mobile sticky bar, and dropped the separate
  stacked count block (+ the `count` prop from each `filterRailProps`). `FilterRail`'s `count`/
  `countStack` are now unused but kept as an optional no-op API. Verified headless at 1280 + 390 wide.
- **Gates:** `pnpm typecheck` / `build` / `lint` (0 errors) / `test:unit` (134/134) all green. No
  content or engine changes, so no `lint:content` / `test:srs` impact.

_(Session 116's branding-redesign-support handoff (Cobalt & Butter previews + the AI mockup guide) and
session 115's demo-readiness-sweep handoff are now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 113's brand-identity-exploration
handoff (the 20-direction catalogue) is also in W29. Session 114's Theorie pill-animation +
dark-mode contrast handoff, session 113's Theorie tab-transition/compass/feedback-pill polish handoff,
session 112's Demo-readiness Chunks 2+3 handoff, its P2 content-accuracy handoff, session 111's handoff
(demo-readiness plan authored + baseline verified) and sessions 85-110's handoffs, plus the s104
Üben-map round + Bibliothek pre-demo round, are in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W28.md`. The shipped-architecture, locked-decisions,
and completed-setup sections that used to live here moved to `docs/PROJECT_FOUNDATION.md` in s95.)_
