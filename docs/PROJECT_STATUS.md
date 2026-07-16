# Project Status

_Last updated: 2026-07-16 (session 124). **Kollokationen Karten card text-cutoff + speak-button
alignment fix, on branch `claude/card-text-alignment-fixes-cc3k0r`, shipped to `main` (PR #545).** The
founder shared a screenshot of the Bibliothek/Theorie Kollokationen "Karten" grid showing titles cut off
mid-word ("die Aufgaben vertei...") and the speak-out-loud icon sitting at inconsistent horizontal
positions across cards. Root cause: `CollocationsBrowser.tsx`'s card title had a hard `truncate` class
with no `flex-1`, so a long phrase got ellipsis-cut while a short one left the icon hugging the text
instead of anchored to the card's right edge. Fix: let the title wrap (matching the example-sentence row
already below it) and gave it `flex-1` so the icon always sits flush right. Verified against a built
preview server with a headless screenshot; typecheck/lint/build/check:bundle all green. Product name:
**Genauly** (`genauly.de`)._

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

_(Session 122's Theorie graph-view quality audit + P0/P1 fixes handoff, session 121's
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
