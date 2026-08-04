# Brand, logo & theme tokens — current state

Design source: `docs/branding/BRAND_SPEC.md` §3. Usage rules + browsable assets:
`brand-kit/README.md`. Visual-language rules for building UI: the `/design` skill.

## Brand kit (generated, never hand-edit)
The full kit lives in `brand-kit/` (logo mark/wordmark/lockups/mono, `color/` palette +
`tokens.css`/`tokens.json`, `type/` specimen, `icons/`, `social/`, `previews/`, README). It is
generated from the app's own source by `scripts/branding/build-brand-kit.mjs` (colors read live
from `src/index.css`; marks are SVG; the wordmark + lockups are PNG composited from the
`public/genauly-wordmark*.png` that `build-logo-assets.mjs` renders — the lowercase wordmark is
live Inter, so it cannot be a portable vector). **Run `build-logo-assets.mjs` first, then
`build-brand-kit.mjs`** after any mark or token change. `build-logo-assets.mjs` is dev tooling,
NOT part of the app build: it needs a local Playwright Chromium (deterministic SVG→PNG, no
`sharp`) and the installed `@fontsource-variable/inter`.

## The mark
- **Current mark: the lowercase g on a Himmel Soft `#8CDBFB` highlighter swipe** (the original
  Himmelblau `#52C6F9` read too harsh against black/white; the founder then applied Himmel Soft
  app-wide: `--accent` is `197 93% 77%` in BOTH themes; `--accent-ink` and the CTA `--gradient-*`
  stops are different blues and stayed). The **g is OUTLINED to a `<path>`** (Inter 800) so it
  renders identically everywhere. The old gradient "G" is retired.
- Every icon centers the mark by its TRUE bounding box (12% margin, `TILE_MARGIN` in
  `build-logo-assets.mjs`; never revert to raw-coordinate centering — the raw path sits low in
  the 64-box and left an empty band at the top of the app icon).
- **Dark-ground marks are TWO-TONE:** ink where the artwork sits on the swipe, white where it
  falls off (only the g's descender). The lowercase **wordmark** "genauly" (swipe under "genau")
  is the primary logo where there is room (`public/genauly-wordmark.png`/`-dark.png`; dark keeps
  "enau" solid ink + "ly" white so ONLY the g is dual-tone).

## In-app logo placement
- **The in-app logo is TILE-LESS** (transparent, no tile, no `rounded`/`shadow-glow` box). Two
  variants via the shared `src/components/shared/Logo.tsx` (`variant="mark" | "wordmark"`, images
  swapped by the `.dark` class): the compact g mark for space-constrained spots, the wordmark
  (size with `h-* w-auto`) as the primary logo where there is room.
- Placement: mobile header `AppShell` = mark; desktop `Sidebar`, `AuthDialog`, onboarding,
  `LegalChrome`, `HelpChrome`, landing footer = wordmark (the image IS the name, no adjacent
  text span); landing header = mark on phones, wordmark from `sm:`. The static no-JS shells
  (`index.html`, `scripts/prerender-help.mjs`) are dark and hard-code
  `genauly-wordmark-dark.png`. When adding a logo spot, use `<Logo>`, do not box it.

## Icons & favicons
- **App icons keep their Papier tile** (browser tab + OS masks need a filled background).
- Browser-tab favicon: `public/favicon-32.png` + `favicon-16.png`, rounded transparent corners,
  linked from `index.html` (the old `favicon.svg` is retired as favicon; don't reintroduce it).
- **Home-screen / PWA icons are intentionally FULL-BLEED OPAQUE** (`apple-touch-icon.png`,
  `pwa-192x192.png`/`pwa-512x512.png`; corner alpha 255): iOS fills transparent corners with
  black under its own rounding mask. The maskable `pwa-maskable-512x512.png` keeps the logo in
  the inner 80% safe zone. **Do not "fix" these back to transparent corners.** This is the one
  exception to the rounded-transparent rule.
- **The in-app `<img>` logo is NEVER full-bleed.** A full-bleed square exists only for Google's
  OAuth consent screen (not in the repo). Full-bleed-everywhere in-app was shipped then reverted;
  keep in-app logos on the rounded transparent mark.

## Theme tokens (the premium pass + later refinements)
- The `accent-gradient` stops are the theme-aware `--gradient-from`/`--gradient-to` tokens in
  `index.css` (light: deep Nachtblau → primary → vivid sky; dark: light end-to-end so the dark
  `primary-foreground` text passes AA — **never reintroduce a fixed dark end stop**, it broke
  dark contrast once). Both stops are gated in `check-contrast.mjs`.
- Shared text classes in `index.css`: `.text-display` for page H1s (extrabold, tracking-tight,
  balanced wrap) and `.text-eyebrow` for overline kickers. Use these, don't hand-roll heading
  recipes. The default Button variant carries a subtle white top sheen over `bg-primary`; landing
  CTAs ride `bg-accent-gradient` with `text-primary-foreground` (NOT `text-white`, which fails on
  the light dark-mode gradient).
- Decorative gradient pairs (themes.ts `accent`, HubHero tiles, intent cards) come ONLY from the
  brand families (blue/sky/cyan = Nachtblau/Himmelblau, emerald/teal/green = Blatt,
  amber/orange/yellow = Butter, orange/red = Koralle, rose/pink = the sanctioned extra); never
  indigo/violet/purple/fuchsia. `bg-mesh` sits at 0.10/0.09; the landing numbers band's
  gradient-clipped stat values are the one sanctioned `text-gradient` moment.
- **Light ground:** the warm Papier chrome is retired. `--muted`/`--border`/`--input` are neutral
  cool greys (220-hue); the page ground is **`bg-page`**: the bg-mesh washes over a very subtle
  mint → sky 150° diagonal riding `--page-from/mid/to` (dark sets all three to the flat dark
  ground). `bg-page` is on the five full-page shells (AppShell ×2, Onboarding, LegalChrome,
  HelpChrome); Cards keep plain `bg-mesh`. Flat `--background` (`180 45% 98%`) is the fallback +
  sticky-bar/input fill; the light `theme-color` meta rides the mint top stop `#F7FCF9`.
  Semantic `--warning` Butter and the app-icon Papier tile are deliberately untouched.
- **Dark palette, s187 ("N3 Slate", founder-picked from
  `preview/exam-question-tile-polish.html`):** the s153 "Option C" greys were a blue at 44 %
  saturation, which read as "too much blue in the dark mode" beside Claude / ChatGPT / GitHub /
  VS Code. The greys are now **near-neutral with a whisper of cool** and the two coloured page
  radials are OFF in dark (`--wash-a`/`--wash-b`, read by `bg-page`/`bg-mesh` in
  tailwind.config.ts), because on a dark ground they were a blue haze over every screen.
  Ground `220 15% 4%` · card `--surface 220 10% 17%` · `--elevated 220 9% 22%` ·
  `--muted 220 9% 25%` · `--border 220 10% 38%` · `--foreground 220 12% 94%` ·
  `--muted-foreground 220 8% 72%` · `--primary`/`--ring 219 90% 74%` · `--accent-ink 198 72% 72%` ·
  `--shadow 220 30% 2%`. **The contrast RELATIONSHIP is the founder-approved part** (preview option
  "K2"): card over ground **1.38:1**, edge over ground **3.03:1**, and a third step for anything
  nested INSIDE a card (`--elevated`, 1.20:1 over the card), because answer rows used to carry
  `bg-surface` inside a `bg-surface` card, i.e. 1.00:1, and simply vanished. Blue now survives only
  where it ACTS: the gradient CTA, an active answer number, a selected answer. Do not re-saturate
  the greys, and do not switch the washes back on in dark.
  Light = "Option B" (PR #665): card lift via a stronger shared `shadow-soft` (tailwind.config.ts;
  light-only effect), deeper `--muted`/`--border` (`88%/84%`). The mint→sky light ground + the
  `--background` contrast-gate anchor are unchanged ON PURPOSE (so `check-contrast.mjs` stays
  honest). All pairings pass the gate.
- **Squircle:** page toggles and filter pills are `rounded-lg` track / `rounded-md` pill
  (LibrarySwitcher, WritingModeSwitcher, Fokus toggle, FilterRail facet pills, GrammarRail
  pills). Dots, meters, count badges, avatars, circular icon buttons, and the landing page stay
  round.
- **Corner scale, s187 ("tighter", founder):** `--radius` is **0.5rem** (was 0.875rem) and the
  steps in tailwind.config.ts tightened with it, so a card (`rounded-xl`) is **10px**, an answer row
  (`rounded-lg`) 8px, a pill (`rounded-md`) 6px, `rounded-sm` 4px and `rounded-2xl` 14px. The old
  ±4/±10 steps would have collapsed `sm` to 0 and left `2xl` at twice the card radius. Still
  squircle, never circle: check a radius against its BOX, not the token name.

## Dialog / overlay convention (locked)
All popups/modals/dialogs: backdrop `bg-dialog-overlay` (a brand-tinted radial spotlight on the
`--shadow` token — lighter behind the card, deepening to the edges; adapts to dark mode; **no
`backdrop-blur`**) + card `shadow-elevated-soft`. Both are wired into the shared
`DialogContent`/overlay in `src/components/ui/dialog.tsx`; any new dialog on that primitive
inherits them. Reuse for sheets/drawers too (adjust only the radial center); never flat
`bg-black/*`.
**Alphas: 0.48 behind the card, 0.76 at the edges** (deepened from 0.30/0.62, founder s169: "the
pop up window doesn't have any contrast with the background"). A white card on a near-white page
gets its definition from the BACKDROP, not from its shadow, which is invisible over a dark wash:
0.30 left white-on-backdrop at 1.9:1, 0.48 puts it at **3.3:1** (measured in the running app), clear
of the 3:1 UI floor. This is one token on purpose, so every dialog in the app reads the same;
never override it per dialog.
