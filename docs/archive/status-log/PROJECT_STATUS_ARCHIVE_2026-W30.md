# Project Status Archive — 2026-W30 (Jul 20–26)

_Condensed "Resume here" handoffs aged out of `docs/PROJECT_STATUS.md`, filed by the ISO week of their
date. For current status see `docs/PROJECT_STATUS.md`; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`._

## Session 133 (2026-07-19) — Brand-kit modernization plan + full ship (condensed handoff)

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
