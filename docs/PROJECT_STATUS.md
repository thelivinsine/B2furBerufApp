# Project Status

_Last updated: 2026-07-16 (session 123). **Theorie graph-view P2/P3 batch (the rest of the session-122
audit), on branch `claude/graphs-troubleshooting-plan-2f6p4s`.** Finished the remaining fix list from the
session-122 P0–P3 audit report: label collision culling and the card-covers-node bug ported/fixed on the
Wörter graph, a wheel-hijacks-page-scroll bug fixed on both graphs (wheel now only zooms with ctrl/cmd
held, matching trackpad-pinch convention), the legend connection count now respects the active domain/
kind filter on both graphs (was always the unfiltered total), a resize no longer leaves either graph
off-center, and the fit-button's random-word/hub-jump picks now respect the active filter too. Plus a
P3 hygiene pass: removed the dead `register` field from the Kollokationen graph link plumbing, fixed a
setState-in-updater in `toggleLayout`, capped the position-cache growth, fixed a stale "6-domain" palette
comment (5 since the s121 merge), and added canvas aria-labels. Verified end-to-end with Playwright; all
gates green. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 123 (2026-07-16). Theorie graph-view P2/P3 batch (Sonnet 5), on branch
`claude/graphs-troubleshooting-plan-2f6p4s`.** Picked up the session-122 audit's leftover fix list
("Remaining P2/P3 batch... is scoped in the session-122 prompt-log entry") and finished it.
- **P2 (user-visible, Wörter graph unless noted):** (1) label collision culling ported from the
  Kollokationen graph into `WordGraph.tsx`'s draw loop (candidates ranked focused-first then by radius,
  skip a label whose box overlaps one already placed). (2) The selected-word card (bottom overlay) could
  cover the very node it describes; a new effect pans the view up just enough to clear it whenever the
  tapped node's screen position falls under the card, without touching zoom (unlike Kollokationen's
  forced-zoom `focusNode`, which was intentionally left alone). (3) **Wheel hijacked page scroll on BOTH
  graphs** (every wheel tick called `preventDefault`, so a user scrolling the Bibliothek page with the
  cursor over a graph got stuck zooming instead): wheel now only zooms with ctrl/cmd held (the same
  convention as trackpad pinch-zoom and Google Maps/Figma), otherwise it's left alone so the page scrolls;
  canvases got a `title` hint. (4) **Legend connection count ignored the domain/kind filter on BOTH
  graphs** (always showed the unfiltered total): now counts only edges whose both ends pass the active
  filter, computed via a `useMemo` mirroring the draw-time `domActive`/`isActive` check. (5) **Resize left
  both graphs off-center** (only the canvas pixel size updated, not the transform): the resize handler now
  shifts the transform by half the width/height delta so the visual center stays anchored across a window
  resize or phone rotation. (6) **Fit-button random-word/hub-jump ignored the active filter on BOTH
  graphs**, so it could jump to a domain/kind the user had just dimmed out; both now pick only among
  filter-passing nodes (falling back to the full set if the filter empties it).
- **P3 (hygiene, Haiku-tier per the session-122 model map):** removed the `register` field from
  `CollocationLink`/`SimLink` (carried through the builder and a test, never read by the renderer) plus
  the now-pointless test; moved `toggleLayout`'s side effects (ref write + `refitForLayout`) out of the
  `setCardLayout` functional updater, which must stay pure; capped the `posRef` position-cache growth at
  4000 entries (LRU-ish eviction) as a safety net (real bank sizes never approach it); fixed a stale
  "6-domain taxonomy spine" comment in `graphPalette.ts` (5 since the s121 arbeitswelt→beruf merge, and
  the file literally lists 5); added `role="img"` + a descriptive `aria-label` to both canvases. Left
  "node seeding" un-touched: Kollokationen's centroid-jitter seeding is deliberate (forms the theme
  islands) and porting it to Wörter would fight that graph's intentionally different "one global cloud"
  design (see CLAUDE.md); no other seeding bug was found on inspection.
- **Not done (explicitly out of scope):** the P1-5 content-curation follow-up (494/2,514 unresolved
  `related` refs, 118/797 Wörter-graph edge resolution) is a separate content-authoring task, not a
  graph-code bug; still open for a future session.
- **Verification:** Playwright end-to-end against `pnpm dev` (onboarding skipped via seeded
  localStorage): plain wheel scrolls the page (`scrollY` 0→95/0→131) instead of zooming; ctrl+wheel still
  zooms and the culled labels stay legible and non-overlapping at a close zoom; tapping a word near the
  bottom edge of the Wörter canvas pans the view so the selected node lands clearly above the card instead
  of behind it; the Kollokationen legend count went 786→0 under a Nomen-only filter (correct: every edge
  is noun-verb, so an all-noun filter has zero valid edges) and the Wörter count went 1712→1281 under a
  Berufsleben-only filter; the fit button's hub-jump under a Verben-only filter landed on "beantragen" (a
  verb); the Kollokationen card-layout toggle (horizontal↔vertical) still refits correctly after the
  `toggleLayout` purity fix. Zero console errors across both views. Gates: `typecheck` clean, `lint` at
  the exact pre-change 53-warning baseline, `test:unit` 146/146 (147 minus the deleted dead-register
  test), `lint:content` clean, `build` + `check:bundle` 79.6 kB.

**Handoff after session 122 (2026-07-16). Theorie graph-view quality audit + P0/P1 fixes (Fable 5), on
branch `claude/bibliothek-theorie-graphs-sk0dr3`, shipped to `main` (PR #539, squash-merged).** The
founder asked for a comprehensive bug/quality analysis of the Bibliothek/Theorie graph views, then a
P0–P3 report with per-action Claude-model routing, then approved the Opus-tier batch.
- **The audit (delivered in-chat):** ran the pure builders + a d3-force benchmark against the real
  banks. Key numbers: sim warmup froze the main thread **951ms (Wörter) / 1019ms (Kollokationen)** on a
  desktop-class CPU per open AND per filter change; Kollokationen fit-to-all zoom is k≈0.21 (phone) /
  0.55 (laptop), both under the old k>0.7 label gate → zero labels at the flagship zoomed-out view; only
  118/797 collocations resolve noun+verb into Wörter-graph edges (350 noun-only, 234 neither) and 494/
  2,514 `related` refs drop unresolved — that content gap is the **open P1-5 follow-up** (Opus curation
  list → Sonnet authoring). Remaining P2/P3 batch (label-culling + card-refit ports to Wörter, wheel
  scroll-trap, count-vs-filter mismatch, resize refit, data nits, hygiene) is scoped in the session-122
  prompt-log entry; fix order and model routing per action are recorded there too.
- **The four fixes shipped (components only; pure builders + tests untouched):** (1) warmup now runs in
  rAF slices with a 10ms/frame budget; a rebuild where >50% of nodes kept cached positions (filter
  tweak) needs only 20 ticks and draws immediately, cold starts settle blank-then-reveal (design
  intent kept, freeze gone). (2) The pinch branch releases a half-started node drag and the cool-down
  (`alphaTarget(0)`) runs whenever the last pointer lifts, so the sim always sleeps again (was: permanent
  jitter + a pinned node in Wörter). (3) Draw ignores focus ids not in the current graph (dormant
  selection revives if the node returns; `fitView` ignores a dormant selection's card). (4) Kollokationen
  hub labels: degree ≥ 5 keeps a readable label at any zoom, alpha ramping 0.4→0.9 by degree (the old
  dead `hubBoost` removed); collision culling keeps the canvas clean.
- **Verification:** Playwright end-to-end (onboarding skipped via seeded localStorage): both views paint
  after chunked warmup with zero >200ms long tasks, tap opens the card, filter change with active
  selection no longer ghosts, hub labels screenshot-verified at fit-to-all. `typecheck` clean, `lint` at
  the exact pre-change warning baseline, `test:unit` 147/147, `build` + `check:bundle` 79.6 kB.
- **Note:** PRs #537 (backlog-item doc tick) and #538 (singular/plural noun merge onto one graph node,
  Theorie) merged between s121 and this session without status-doc entries; s122 numbering continues
  from the last documented session.

_(Session 121's arbeitswelt→beruf domain-merge handoff, session 120's content-coverage-deepening
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
