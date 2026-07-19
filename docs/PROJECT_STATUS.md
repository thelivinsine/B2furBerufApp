# Project Status

_Last updated: 2026-07-19 (session 133). **Brand-kit modernization plan authored** (docs-only,
no `src/` change): the implementation of the finalized s127 brand (Kit 1 · Nachtblau & Himmelblau +
Koralle, locked spec at `docs/branding/BRAND_SPEC.md`) is now scoped in
**`docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md`**: a four-PR sequence (A token flip + accent-role
audit + chrome/meta · B logo + icon pipeline · C deep surface sweep · D dark-mode design + premium
polish) with a model recommendation per PR, a sanctioned-deviations register (the logo is locked,
everything else may deviate subtly toward a premium finish), computed WCAG contrast findings, and a
proposed permanent `check:contrast` gate. **Plan PRs A+B+C then SHIPPED the same session** (founder
"go ahead with a", then "go ahead with b and c"): A = full token flip + designed dark theme +
chrome/meta + the live `pnpm check:contrast` gate (42/42); B = the new logo mark (lowercase g on the
Himmelblau swipe, g outlined from Inter 800) + regenerated favicon/PWA/og assets via
`scripts/branding/build-logo-assets.mjs`; C = deep surface sweep (Neuland game chrome, Üben map,
domain buildings, landing flatten, der-distinctness). Only plan PR D (dark-mode design polish + docs
language sweep) remains. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 133 (2026-07-19). Brand-kit modernization PLAN authored (Fable 5), branch
`claude/brand-kit-modernization-igqlnm`, docs-only, shipped to `main`.** The founder asked for the
brand-spec implementation to be scoped with a robust plan and clear model recommendations per chunk,
allowing subtle deviations everywhere EXCEPT the logo to reach a premium "top edutech" finish.
Result: **`docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md`**, grounded in a fresh code survey (the full
hardcoded-hex inventory is §2 of the plan):
- **Four-PR sequence (A → {B, C} → D):** **A** = atomic token flip (`src/index.css` per spec §1) +
  the accent-role audit (`--accent-foreground` flips white→ink; Himmelblau banned as text on light
  ground) + nav/route/graph chrome + theme-color/manifest/prerender meta (**Fable 5**); **B** = logo
  outline (g→`<path>`, founder picks the weight from a candidate panel) + the full favicon/PWA/
  og-image asset pipeline, zero deviation allowed (**Opus 4.8**); **C** = deep sweep of the Neuland
  game chrome, Üben city map (locked palettes re-hued only), domain buildings, landing flatten,
  der-vs-Nachtblau distinctness check (**Opus 4.8**, or Sonnet 5 + founder screenshots); **D** = the
  real dark-mode design pass + typography/motion/reward polish + CLAUDE.md/DECISIONS.md language
  sweep (**Fable 5**).
- **Contrast findings verified by computation (s133):** white on Nachtblau `#3D74ED` = 4.27:1 and
  Nachtblau on Papier = 3.96:1 (both under the 4.5:1 small-text AA floor → sanctioned darkening
  option ≈ `#2E6BEB` at 4.75:1); Himmelblau on white = 1.94:1 (never text); white on Koralle =
  3.26:1 (reward pairs with ink, 5.28:1). A zero-dep `scripts/check-contrast.mjs` gate
  (`pnpm check:contrast`, wired into `validate.yml`) is specced in plan §5.
- **Sanctioned-deviations register (plan §4)** pre-approves: primary darkening for AA, a new
  `--accent-ink`, ink-on-Koralle reward pairing, gradient demotion (founder prefers flat), a der
  token nudge, dual light/dark theme-color metas, and typography micro-polish. Risks in §6 include
  the accent-foreground semantic flip, PWA stale cache, and the Google OAuth consent-logo re-upload
  (founder action after PR B).
- **PR A was then built and shipped in the same session** (founder: "go ahead with a"). Everything
  in plan PR A landed: `src/index.css` light+dark token systems (final values in the BRAND_SPEC
  status header; deviations: primary `221 83% 54%`, warning `38 92% 46%`, reward `11 82% 54%`, new
  `--accent-ink`), `tailwind.config.ts` (accent.ink, gradient re-stopped primary→`hsl(198 88% 40%)`
  so white text survives, mesh dialed to a whisper), the `text-accent`→`text-accent-ink` sweep
  (7 files), `nav-items.ts`/`route-icons.tsx` BRAND→`#3D74ED`, `graphPalette.ts`
  beruf/professional→Nachtblau, `index.html` dual light/dark theme-color metas + no-JS shell retint,
  `vite.config.ts` manifest (`#3D74ED`/`#151320`), `prerender-help.mjs` shell, `src/main.tsx`
  boot-error gradient, and the new **`scripts/check-contrast.mjs`** (`pnpm check:contrast`, wired
  into `validate.yml`): 42/42 designed token pairings pass AA in both themes.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · test:unit 219 ✓ · build ✓ · check:bundle 80.8 kB ✓ ·
  check:contrast 42/42 ✓. Screenshots (light+dark × 390/1280) verified Praktisch, Theorie Karten +
  Graph, Fortschritt, Landing: warm ground + white cards + Nachtblau reads clean everywhere.
- **PR B (logo + icon pipeline) then shipped** (PR #594): new mark = lowercase **g** on the
  Himmelblau highlighter swipe on a Papier tile; the g is OUTLINED from **Inter 800** (the app's own
  UI typeface, picked from a 5-candidate panel) into a real `<path>` via opentype.js.
  **`scripts/branding/build-logo-assets.mjs`** is the one source of truth: rasterizes every asset
  from the mark with Playwright Chromium (no `sharp` dep) — default logo + favicon-16/32/48
  (transparent corners), apple-touch/pwa-192/512 (full-bleed opaque), maskable (inner 80%), and a new
  Papier og-image (mark + Inter-800 wordmark + tagline). Founder action item: re-upload the OAuth
  consent full-bleed logo variant (not in repo).
- **PR C (deep surface sweep) then shipped** (PR #595): Neuland game chrome `#5b5be6`→Nachtblau across
  all four welt files (`GAME_INDIGO`→`GAME_BLUE`; leather-backpack art + `GAME_OUT` kept; victory loot
  already Koralle via the PR A token); Üben map route/Bahnhof→Nachtblau + MAP_LIGHT scenery tints
  hue-shifted 245→221 at identical (founder-locked) lightness + MAP_DARK route→`#8AB0F9`; Büro
  building→Nachtblau; landing step-chips + closing CTA band flattened `bg-accent-gradient`→flat
  `bg-primary` (hero CTAs + "plateau." headline keep the gradient); **der token deepened to a cooler
  cobalt** (hue 226, light `226 74% 48%` / dark `226 88% 76%`) so a der Wesen never reads as the
  Nachtblau brand. Verified in-mission battle chrome, Spielen hub, der/die/das marks, flattened CTA.
- **Gates (B+C):** typecheck ✓ · lint 0 errors ✓ · test:unit 219 ✓ · build ✓ · check:bundle 80.8 kB ✓
  · check:contrast 42/42 ✓.
- **Next:** plan PR D (dark-mode design pass + typography/motion/reward polish + CLAUDE.md/DECISIONS.md
  language sweep) on founder go. **PWA caveat:** hard-refresh before judging the live result; the
  service worker serves the old build until then.

**Handoff after session 132 (2026-07-19). Bibliothek mobile-filter bug-fixes + graph two-area color &
"by topic + tighter" layout. Branch `claude/filter-scroll-badge-bugs-y75thb`, all shipped to `main`
via PRs #581 / #582 / #583 / #584 / #585 / #589.** Multiple founder screenshots drove a run of
mobile-filter fixes on the Theorie browse tabs plus a graph redesign:
- **Mobile filter, three fixes (`FilterRail.tsx` was already fine; the fixes were in the four browse
  trainers `VocabularyTrainer`/`CollocationsBrowser`/`RedemittelTrainer`/`GrammarHub` + `browseScroll`):**
  (1) empty-gap-on-scroll — the open filter panel lived inside the sticky/collapsing browse header, so
  collapsing it left its reserved flow space as a blank gap; (2) the mobile Filter-button badge counted
  only facet pills, not the Branche/Thema/Unterthema scope dropdowns; (3) after an interim guard the
  panel got *stuck* pinned open while scrolling. Final resolution: the filter panel is now **normal-flow
  content moved OUTSIDE the sticky header** (only the compact toolbar stays sticky and collapses), the
  badge adds `scopeActiveCount` (sectors + themes + subs) on Wörter/Kollokationen, and the header-collapse
  guard was reverted. All four tabs.
- **Mobile filter panel cap + go-to-top centering (PR #589, `FilterRail.tsx` panel branch +
  `browseScroll.tsx`):** the expanded panel is capped at `max-h-[55dvh]` as a flex column (fixed header +
  one internal `overflow-y-auto` scroll region), so it never swallows the screen. The `ScrollTopButton`
  was off-center because it is a `motion.button` whose framer inline `transform` (the `y` slide) overrode
  the Tailwind `-translate-x-1/2` class; fixed by animating `x: "-50%"` on every keyframe and dropping the
  class.
- **Graphs recolored to TWO life areas (`lib/graphPalette.ts` + `WordGraph.tsx` + `CollocationGraph.tsx`):**
  new `lifeAreaOf`/`lifeAreaColor`/`LIFE_AREAS`/`LIFE_AREA_COLORS` helpers bucket the five content
  domains into **Berufsleben (professional = `beruf`, brand indigo)** vs **Privatleben (personal =
  everything else, teal)**. Node color, glow, lit edges, legend chips and the legend domain-filter all
  collapse to these two on BOTH graphs; clustering still uses the finer theme grain.
- **Kollokationen graph layout = founder-picked "by topic + tighter"** (from a published comparison
  artifact of 5 force recipes on the real 1,243-node data): per-topic centroids kept, but firmer pull
  and tighter packing. **Final values after the s132 "tighter clusters" follow-up (PR #584):** forceX/Y
  `0.38`, link tension `0.22`, collision `r+3`, wider ring (`N*35`); charge `-55/240`. (The intermediate
  first pass was `0.28`/`0.11`/`r+5`.) Also thinned the default edge stroke (`1→0.55`) + lowered edge
  opacity earlier in the session for less visual noise.
- **Gates:** typecheck, `test:unit` 219, lint 0 errors, build all green. Comparison artifact (English,
  with a plain-language "how to read this" explainer) is a scratchpad HTML, not in the repo.
- **Deploy gotcha (learned this session):** the #583 squash-merge did NOT fire the GitHub `push` event,
  so neither `pages.yml` nor `validate.yml` ran and the commit showed no check. `pages.yml` has
  `workflow_dispatch`, so a manual dispatch against `main` re-deploys the current HEAD; that recovered it.
  If a merged commit shows no Actions run, dispatch `pages.yml` rather than assuming a build failure.
- **Not done / open:** the two-level (domains-as-regions, topics-as-sub-islands) layout was previewed
  but the founder chose topic+tighter instead. The preview artifact's variants still describe the
  earlier "by life area" options; it was a decision aid, not kept in sync post-decision.

_(Session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
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
