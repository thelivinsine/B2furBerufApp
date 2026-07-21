# Project Status

_Last updated: 2026-07-21 (session 141). **Mobile bottom-nav labels shipped to `main` (PR #622).**
Each section's name now appears under its icon in the mobile bar, visible only on the selected tab
(the label slot is reserved on every tab so nothing shifts). Labels are a neutral theme-aware dark
grey (`slate-600`/`slate-300`), and the `/library` tab was renamed **Theorie → Bibliothek**. Bar
squircle 44→40px to fit; the old active underline was replaced by the label. `typecheck` + `build`
green. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 141 (2026-07-21). Mobile bottom-nav item labels, branch
`claude/mobile-nav-item-labels-vx29vh`, shipped to `main` (PR #622).** Founder asked to add each
nav item's name under its icon in the mobile view, visible only when selected, with real-screenshot
previews. What shipped (all in `src/components/layout/`):
- **`BottomTabBar.tsx` — `BarTab` restructured to a vertical column** (icon squircle on top, label
  below). The label slot is a **reserved fixed-height row on every tab** (`h-3`, `opacity-0` when
  inactive) so selecting a tab never shifts the icon rail; the name fades in only on the active tab.
  The old small active underline was removed (label + grey squircle now mark the active tab). The
  squircle shrank `h-11 w-11` → **`h-10 w-10`** so icon + label fit inside the locked 63px bar
  height (a deliberate, founder-driven exception to the s28 `h-11` lock; noted in CLAUDE.md).
- **Label color:** first shipped in the section accent, then the founder called blue "not premium"
  → switched to a neutral theme-aware **dark grey** (`text-slate-600 dark:text-slate-300`,
  `font-semibold text-[10px]`). `color` was dropped from the `BarTab` destructure (now unused).
- **Rename Theorie → Bibliothek** (founder): `nav-items.ts` `/library` label + `LibrarySwitcher.tsx`
  `aria-label`. (This reverses the s105 Bibliothek→Theorie rename; the s105 change is still in the
  historical comments.) Edit mode, icon marks/colors, and the iOS fixes are untouched.
- **Verification:** `pnpm typecheck` ✓ · `pnpm build` ✓ (incl. PWA + help prerender). Captured
  real 390×844 mobile screenshots of the running dev app via the preinstalled headless Chromium
  (seeded `onboarded:true` in `b2beruf.settings.v1` localStorage to skip onboarding). Post-merge
  branch realigned to `main`. PWA caveat: the nav is service-worker-cached; hard-refresh to see it.

**Handoff after session 140 (2026-07-21). Light-theme recolor (two rounds + a 3-round preview
picker), branch `claude/session-f94z5m`, shipped to `main`.** Founder screenshot of `/library` on
mobile: the warm Papier tint (switcher tracks, tags, page ground) read as "butter yellow". What
shipped:
- **Round 1 (PR #619): neutral grey chrome + flat Himmelblau ground.** `--muted`/`--border`/
  `--input` moved from the warm 42/43-hue tans to neutral 220-hue greys; `--background` to a pale
  Himmelblau. Covers the LibrarySwitcher/ViewSwitcher tracks, `bg-muted` tag pills, the bottom-bar
  active `bg-border` squircle, and every border, app-wide by token.
- **Preview picker (3 rounds, committed to `preview/`):** `background-gradient-variations.html`
  (8 ground options A–H rendered in the real chrome), `…-r2-himmel-mint.html` (the founder liked
  Himmel → Mint; 4 intensity steps), `…-r3-invertiert.html` (the founder picked "Sehr dezent" but
  inverted; 3 mirrored takes). Screenshotted via the preinstalled headless Chromium; founder picked
  **I1** (very subtle mint → sky, 150° diagonal).
- **Round 2 (PR #620): the "I1" gradient ground + lighter greys.** New `--page-from/mid/to` tokens
  (light: mint `144 45% 98%` → `150 50% 98%` → sky `198 83% 98%`; dark: all three = the flat dark
  ground, so dark mode is a NO-OP) + a **`bg-page`** backgroundImage in `tailwind.config.ts` (the
  bg-mesh washes layered over the 150° linear). Applied on the five full-page shells (AppShell ×2,
  Onboarding, LegalChrome, HelpChrome); ExamHub/SimulationHub Cards keep plain `bg-mesh`. Flat
  `--background` became the near-white fallback `180 45% 98%` (sticky bars, inputs); light
  `theme-color` meta = the mint top stop `#F7FCF9`. Mid-round the founder also asked for lighter
  button greys: `--muted` 87% → **`220 10% 90%`**, `--border`/`--input` 83% → **`220 9% 86%`**.
- **Deliberately untouched:** dark theme; the semantic `--warning` Butter tokens; the brand-kit /
  logo scripts' `PAPIER` app-icon tile constant. CLAUDE.md brand section documents the new ground.
- **Gates (both rounds):** `check:contrast` all pairings ✓ · build ✓. PWA caveat: the shell is
  service-worker-cached; hard-refresh the live site to see the new colors.

_(Session 139's three-small-fixes handoff (icon-size preview correction, mission-exit toggle fix,
Kollokationen graph tighter clusters), session 138's logo-v2 rework handoff, session 137's branding-refresh review + premium pass (fixes 1-7 + items 8-10) handoff, session 136's landing-page-redesign handoff and session 135's game demo-readiness review + P0/P1 batch handoff are now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W30.md`. Session 134's Theorie (Wörter) card + mobile-filter polish handoff, session 133's brand-kit-modernization handoff (plan + all 4 PRs + the consolidated brand-kit/ + the tile-less logo), session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
fused-doodle registry + batch 1, and the session/graph/flashcard reuse) is now in
`docs/archive/status-log/PROJECT_STATUS_ARCHIVE_2026-W29.md`. Session 128's gender-visuals research-panel + Artikel-Visuals implementation-plan handoff, session 127's brand-kit-catalogue handoff (Vol. IV–VII; the founder **finalized** Kit 1 · Nachtblau & Himmelblau + Koralle, locked spec at `docs/branding/BRAND_SPEC.md`, artifacts saved under `preview/branding/artifacts/`, NOT implemented — wire only on request; see the W29 archive), session 126's daily-life content scale-up handoff (Phase A + B), session 125's Theorie graph word-selection distribution + focus polish handoff, session 124's Kollokationen Karten card text-cutoff + speak-button alignment fix handoff,
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
