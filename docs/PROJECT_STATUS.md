# Project Status

_Last updated: 2026-07-19 (session 134). **Theorie (Wörter) card + mobile-filter polish, shipped to
`main` via PR #598.** Four founder-driven changes (details in the s134 handoff below): (1) the
`FilterRail` mobile panel cap trimmed `max-h-[55dvh]`→`max-h-[45dvh]` (~3-4 fewer lines when open);
(2) the vocab card's cross-module "Verbunden" dropdown parked behind a reversible
`SHOW_RELATED = false` flag (`RelatedPanel` kept; founder wants to rethink it); (3) the Wörter Karten
cards rearranged to "Option B" (quiet headline = gender creature + word / bookmark; example gets
room; foot row = plural pill left + speak button right); (4) the noun gender-reveal effect
(`ArtikelEffect`) now fires from the empty right side of the card back (`align="right"` → `--fx-x`),
and the "die" bloom is snappier (`470ms` fast-out + tighter stagger). The s133 **brand rebrand is
COMPLETE** (Kit 1 · Nachtblau & Himmelblau + Koralle, `docs/branding/BRAND_SPEC.md`).  **A s133 follow-up then shipped the in-app logo TILE-LESS** (transparent, no tile; the g adapts Tinte-on-light / Papier-on-dark via `src/components/shared/Logo.tsx`; app icons keep their tile), plus the consolidated **`brand-kit/`** folder generated from the app's own source. Product name: **Genauly** (`genauly.de`)._

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

**Handoff after session 134 (2026-07-19). Theorie (Wörter) card + mobile-filter polish. Branch
`claude/filter-rail-mobile-height-n8ktd6`, shipped to `main` via PR #598 (squash `796fb01`).** A
short founder-driven round on the Theorie Wörter tab and the mobile filter (ran on Opus 4.8):
- **Mobile filter panel shorter (`FilterRail.tsx`, `panel` branch):** cap dropped
  `max-h-[55dvh]`→`max-h-[45dvh]` (~10 dvh, roughly 3-4 text lines) so an open filter leaves more of
  the card list visible on phones; the fixed header + internal `overflow-y-auto` scroll region are
  unchanged, so nothing is clipped.
- **"Verbunden" cross-module panel PARKED (`VocabList.tsx`):** the vocab card dropdown that linked a
  word to a Kollokation/Schreibtraining/Dialog (`RelatedPanel` + `relatedRows`) is hidden behind a
  reversible `const SHOW_RELATED = false` (founder wants to rethink its usefulness + dependencies
  before it ships). The panel + helper are untouched in the repo; re-enabling is a one-line flip. Do
  not delete them while parked.
- **Wörter Karten = "Option B" layout (`VocabList.tsx`):** with the bottom toggle gone the card was
  rearranged (founder picked B from a 4-option `preview/vocab-card-layouts.html`): quiet headline
  (gender creature + word left, bookmark right), the example gets room, and a foot row pins the
  plural (a small `bg-muted` pill) left + the speak button right via `mt-auto`, so every card in a
  row shares one foot line. Speak + plural moved OUT of the headline.
- **Gender reveal effect moved right + snappier die (`ArtikelEffect.tsx` + `index.css`):** new
  `align` prop; the vocab card back face passes `align="right"`, shifting the burst/bloom/shatter
  origin to `--fx-x: 78%` (into the empty right side where the English text isn't). The session
  player (`SessionPlayer`) keeps the default centered origin. The "die" bloom is now `470ms` fast-out
  cubic-bezier (was `650ms` ease-out) with a tighter `200/280/360ms` ring stagger (was
  `200/310/420`), finishing as crisply as der's rays / das's shards. The `left:50%` origins in
  `.artikel-fx-ray/ring/shard` now read `var(--fx-x, 50%)`.
- **Gates:** typecheck clean, lint 0 errors, build green, `test:unit` 219/219. **PWA caveat:** the
  Wörter cards are a service-worker-cached surface; hard-refresh before judging the live result.

**Handoff after session 133 (2026-07-19). Brand-kit modernization: plan authored AND fully shipped
(all 4 PRs), branch `claude/brand-kit-modernization-igqlnm`, everything merged to `main`.** The
founder asked to scope the brand-spec implementation with a robust plan + per-chunk model
recommendations (logo locked, subtle deviations allowed elsewhere for a premium "top edutech"
finish), then gave the go for each phase in turn ("go ahead with a" → "b and c" → "go ahead"). The
finalized Kit 1 brand (Nachtblau & Himmelblau + Koralle, `docs/branding/BRAND_SPEC.md`) is now LIVE.
Plan + implementation record: **`docs/plans/BRAND_KIT_MODERNIZATION_PLAN.md`** (§2 = the full
hardcoded-hex inventory; each PR section marked SHIPPED with its final values):
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
- **PR D (polish + docs sweep) then shipped** (PR #596): streak surfaces → Koralle (the header
  streak pill off `warning` onto `bg-reward-bg`/`text-reward`, + the Fortschritt "Aktuelle Serie"
  StatCard via a new `reward` accent in the accentMap); dark `--muted-foreground` 76%→72% (secondary
  text reads secondary, still ~8:1); `tabular-nums` added to the StatCard value; CLAUDE.md
  color-language sweep (0 stale "brand indigo"/"reward-gold" references; DECISIONS.md deliberately
  left as the historical record). Buttons already had pressed states + display tracking, no change
  needed. **The brand plan is COMPLETE (all 4 PRs).**
- **Brand kit consolidated** (post-plan, founder ask "store all the brand kit items in a dedicated
  repo… generate proper brand kit if any of them isn't available"; founder chose a folder in THIS
  repo over a standalone repo, to keep one source of truth). New **`brand-kit/`** folder + generator
  **`scripts/branding/build-brand-kit.mjs`**: logo mark/wordmark/lockups(H+stacked)/mono-knockout +
  clear-space guide, `color/` palette.svg + `tokens.css`/`tokens.json` (parsed live from
  `src/index.css`), `type/` Inter specimen, `icons/` (shipped raster set), `social/` og + square
  avatar, `previews/` PNG contact sheets, and a `README.md` with usage rules. **Generated the missing
  pieces** that a proper kit needs and we didn't have: the "Genauly" **wordmark** (outlined from Inter
  800 glyph-by-glyph, kerned → `scripts/branding/wordmark-data.mjs`), all lockups, the mono knockout
  mark, the palette/type sheets, and the square social avatar. Kit is ~592 kB, 27 files, generated (do
  not hand-edit). CLAUDE.md Brand-logo section points at it.
- **Logo reworked TILE-LESS** (founder: the logo should be just the letter + swipe, background always
  transparent, no tile). The in-app logo is now `public/genauly-logo.png` (ink g) +
  `genauly-logo-dark.png` (Papier g), transparent, swapped by theme via the new shared
  `src/components/shared/Logo.tsx` (`.dark` class, no JS). All 7 in-app spots (`AppShell`/`Sidebar`/
  `AuthDialog`/`LandingPage`/`Onboarding`/`LegalChrome`/`HelpChrome`) use `<Logo>` with no
  tile/`rounded`/`shadow-glow`; the dark no-JS shells (`index.html`, `prerender-help.mjs`) hard-code
  the dark logo. **App icons (favicon/PWA/apple-touch/maskable) keep their Papier tile** (browser/OS
  masks turn transparency black). g shade on dark = Papier `#FAF6EC` (light/dark inversion of
  ink-on-Papier). The old `genauly-default-logo-transparent-corners.png` was removed. Brand kit +
  generators (`build-logo-assets.mjs`, `build-brand-kit.mjs`) + README updated to tile-less; an
  interactive `brand-kit/previews/logo-preview.html` artifact was published. Verified the swap in the
  header/landing/sign-in light+dark.
- **Open founder items:** re-upload the Google OAuth consent-screen logo (full-bleed variant, not in
  repo) from the new mark; verify the live site after deploy (hard-refresh first, the service worker
  serves the old build until then).

_(Session 132's Bibliothek mobile-filter bug-fixes + graph two-area color/layout handoff, session 131's Üben exercise-variety plan + full-build handoff, session 130's data-architecture-review handoff (P0/P1 integrity fixes + the /sources redesign with the admin Daten-Werkbank) and session 129's Artikel-Visuals full-ship handoff (all 3 PRs: tokens/Wesen marks/effects, the
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
