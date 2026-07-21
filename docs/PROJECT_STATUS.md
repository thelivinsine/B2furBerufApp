# Project Status

_Last updated: 2026-07-21 (session 140). **Light-theme chrome recolor shipped to `main`:** the warm
Papier cream tokens read as "butter yellow" to the founder, so the light `--muted`/`--border`/
`--input` (switcher tracks, tags, tiles, borders) are now a neutral cool grey and the light
`--background` is a pale Himmelblau (`199 68% 95%`, hex `#EAF5FB` in the `theme-color` meta), which
the existing `bg-mesh` blue washes turn into a soft Himmelblau gradient. Dark theme untouched;
`check:contrast` 46/46 green. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 140 (2026-07-21). Light-theme chrome recolor, branch
`claude/session-f94z5m`, shipped to `main`.** Founder screenshot of `/library` on mobile: the warm
Papier tint across the tab/view switcher tracks, the plural tags, and the page ground read as
"butter yellow"; they asked for a good-contrast grey on the toggle and tags and a Himmelblau shade
for the background gradient. What shipped (light theme only, `src/index.css` + `index.html`):
- **Neutral grey chrome:** `--muted` `42 44% 89%` → **`220 9% 87%`**, `--muted-foreground`
  `43 11% 37%` → `220 8% 36%`, `--border`/`--input` `42 38% 85%` → **`220 8% 83%`**. This covers the
  LibrarySwitcher/ViewSwitcher tracks, the `bg-muted` tag pills (e.g. "Pl.: …"), the bottom-bar
  active `bg-border` squircle, and every border, app-wide by token.
- **Pale Himmelblau ground:** `--background` `43 58% 95%` → **`199 68% 95%`** (`#EAF5FB`); the
  existing `bg-mesh` primary/accent radial washes now sit on a blue ground, so the page reads as a
  soft Himmelblau gradient. The light `theme-color` meta in `index.html` follows (`#FAF6EC` →
  `#EAF5FB`).
- **Deliberately untouched:** dark theme; the semantic `--warning` butter tokens; the brand-kit /
  logo scripts' `PAPIER` app-icon tile constant (OS icons keep their filled tile, separate concern).
- **Gates:** `check:contrast` 46/46 ✓ (all token pairings, both themes) · build ✓. PWA caveat:
  the shell is service-worker-cached; hard-refresh the live site to see the new colors.

**Handoff after session 139 (2026-07-20). Three small fixes, branch
`claude/app-icon-favicon-update-gympjq`, all shipped to `main` (PRs #616, #617).** Founder-reported
issues, handled one prompt at a time:
- **Icon-size preview correction (#616):** the founder thought the app icon/favicon still showed the
  old **Randnah** (5% margin) size. The shipped assets were in fact already **Größer** (12% margin)
  since s138 — verified by measuring every committed PNG (mark ≈ 73–75% of the tile = 12% margin;
  Randnah would be ≈ 90%). The confusion came from the saved preview
  `preview/branding/artifacts/genauly-logo-v2-previews.html`, which still highlighted Randnah as
  "empfohlen" and rendered the home-screen mockup row at the 5% margin. Fixed the preview to mark
  Größer as applied and render the OS row at 12%. **No shipped asset changed.** If the live
  tab/home-screen icon still looks old it is PWA/browser cache (hard-refresh; re-add the PWA).
- **Mission-exit toggle fix (#616):** exiting a mission launched from Heute → Spielen stripped the
  `?mission=` param and left the learner on the standalone `/welt` hub, which has no Lernen/Spielen
  toggle. Now `SpielenHub` tags the deep link `&from=heute`, `Welt.tsx` navigates back to
  `/?tab=spielen` on exit when it sees that marker, and `Dashboard.tsx` opens on the Spielen tab for
  `?tab=spielen` (clearing the param on a manual switch). Direct `/welt` visits are unchanged.
- **Kollokationen graph — tighter clusters (#617):** founder asked to pull the nodes closer so the
  theme islands look better; generated a 3-option preview
  (`preview/collocation-graph-tightness.html` + generator `preview/gen-collocation-graph-tightness.mjs`,
  rendering the REAL bank through the shipped d3-force layout) and the founder picked **"Am engsten"**.
  `CollocationGraph.tsx` force block now: centroid pull (forceX/Y) **0.72** (was 0.38), link **0.38**
  (0.22), charge **−34/max200** (−55/240), collision **r+1.5** (r+3), centroid ring **118+N·26**
  (140+N·35). Pure builder unchanged, so `tests/collocationGraph.test.ts` (11) still passes; CLAUDE.md
  layout-recipe note refreshed.
- **Gates (each PR):** typecheck ✓ · build ✓ · check:bundle 110.5 kB ✓ · test:unit 219/219 (#616) /
  collocationGraph 11/11 (#617) ✓. Post-merge branch realigned to `main` both times. PWA caveat: the
  graph + icons are service-worker-cached; hard-refresh the live site.

_(Session 138's logo-v2 rework handoff, session 137's branding-refresh review + premium pass (fixes 1-7 + items 8-10) handoff, session 136's landing-page-redesign handoff and session 135's game demo-readiness review + P0/P1 batch handoff are now in
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
