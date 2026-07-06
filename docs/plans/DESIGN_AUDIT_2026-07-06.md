# Frontend Design, Brand & Visual Asset Audit — session 71 (2026-07-06)

_Read-only audit of the design system, brand assets, and visual/copy consistency. No code was
changed in this session; every finding below is a candidate work item. Companion to the
architecture-focused `docs/plans/APP_AUDIT_2026-07-05.md`._

## Method

Reviewed: `tailwind.config.ts`, `src/index.css` (token system), `index.html` + `vite.config.ts`
(PWA manifest, meta, boot splash), `public/` (all 11 brand assets), the shared component layer
(`components/ui/*`, `HubHero`, `SectionHeading`, `EmptyState`, `StatCard`), the app chrome
(`AppShell`, `Sidebar`, `nav-items.ts`, `route-icons.tsx`), the landing page, and repo-wide greps
for raw color usage (43 raw Tailwind palette classes across 17 files, 57 hex literals across 8
files), aria-labels (31 total), and font/meta configuration.

## What is already strong (keep, do not regress)

- **Token architecture is genuinely good.** Full HSL CSS-variable system with semantic names
  (`surface`/`elevated`/`muted`/`success`/`warning`/`danger`/`reward`), a radius scale derived
  from one `--radius`, tokenized shadow recipes (`soft`/`elevated`/`elevated-soft`/`glow`), and
  the locked dialog-overlay standard. Dark mode is a real second palette, not a filter.
- **Component discipline.** cva-variant `Button`/`Badge`, one shared Dialog with the locked
  backdrop, `HubHero`/`SectionHeading`/`EmptyState`/`BrowseToolbar` reused consistently. The s45
  filter-toolbar harmonization shows in the browse pages.
- **Accessibility base.** Global `:focus-visible` ring, `prefers-reduced-motion` kill switch,
  16px form controls on mobile (iOS zoom fix), safe-area utilities, `::selection` styling.
- **Performance-aware brand delivery.** Self-hosted Inter Variable (no third-party origins,
  CSP-clean), 78 kB eager chunk, correct full-bleed PWA icons (the locked s22 decision).
- **Icon system.** One custom two-tone + neon SVG mark per route with optical-size normalization
  is a distinctive, documented system few apps this size have.

The gaps below are therefore mostly about **coherence and outward-facing brand surfaces**, not
about missing craft.

## Weaknesses

### A. Brand assets and shareability (biggest gap)

1. **Zero social/link-preview metadata.** `index.html` has no `og:title`, `og:description`,
   `og:image`, `og:url`, or `twitter:card` tags, and no OG image asset exists anywhere in the
   repo. A Genauly link pasted into WhatsApp, LinkedIn, Instagram DMs, Slack or iMessage renders
   as a bare URL or an unstyled title. For a consumer language app whose growth channel is
   word-of-mouth link sharing, this is the single largest brand gap. There is also no
   `<link rel="canonical">`.
2. **No vector master for the logo.** The canonical mark is a 24 kB PNG
   (`genauly-default-logo-transparent-corners.png`); every favicon/PWA icon is rasterized from
   it. There is no SVG source in the repo, so any future size (OG image, print, app store,
   marketing site) means re-rasterizing from a raster.
3. **Three near-identical brand indigos.** `--primary` is `hsl(245 70% 60%)` (~`#5d52e0`), the
   nav/brand mark uses `#5b5be6`, and the PWA manifest `theme_color` is `#6366f1`. No user will
   see them side by side, but it means the brand color is not actually defined anywhere; each
   surface picked its own indigo.
4. **Stale `favicon.svg` still ships.** It is unreferenced (per the locked s22 decision) but
   still sits in `public/`, gets copied into `dist/`, and is precached by the service worker
   (`globPatterns` includes `svg`). It draws the wrong mark (plain system-font "G"). Separately,
   there is no *correct* SVG favicon, which modern browsers prefer (crisp at any density, can
   adapt to dark tabs).
5. **`theme-color` is dark-only and inconsistent.** `index.html` hardcodes
   `<meta name="theme-color" content="#0f1729">` with no `prefers-color-scheme` media variants,
   while the manifest says `#6366f1`. Light-theme users get dark browser chrome around a light
   app.

### B. Color system fragmentation (biggest in-app design weakness)

Five parallel accent systems coexist, none referencing another:

| System | Where | Format |
|---|---|---|
| Semantic tokens (primary indigo, accent cyan, status colors) | `index.css` | HSL vars |
| Route accents + neon second tones | `nav-items.ts`, `route-icons.tsx` | hex literals |
| 11 theme gradients | `data/themes.ts` `accent` | raw Tailwind pairs (`from-rose-500 to-pink-500`, …) |
| Hub/intent-card gradients | `intentCards.ts`, every `HubHero` call site | raw Tailwind pairs |
| Domain-building palette | `city/domain-buildings.tsx` | hex literals |

Consequences:

- **Nearly every Tailwind hue is in use** (rose, pink, fuchsia, purple, violet, indigo, blue,
  sky, cyan, teal, emerald, green, amber, orange, red, yellow). The app reads as a rainbow, which
  dilutes the indigo brand identity and makes color carry no meaning (color ≠ zone ≠ theme).
- **The same zone wears different colors on different surfaces.** Anwenden's nav accent is
  orange `#f97316`, but its three hub cards are cyan/rose/fuchsia. Fortschritt's nav accent is
  sky, its lead card violet-fuchsia (Sammlung). Recognition-by-color, the stated goal of the
  one-accent-per-route rule, stops at the nav rail.
- **Raw `-500` stops bypass dark mode.** Token colors get a tuned dark variant; the ~43 raw
  palette classes render identically in both themes (acceptable for white-text gradient tiles,
  but untunable).
- 57 hex literals and arbitrary values like `text-[#0f172a]` (landing CTA) sit outside the
  system entirely.

### C. Theme bootstrapping: wrong-theme flash for light users

`index.html` hardcodes `<html class="dark">` and a dark-only boot splash (`#0f1729`), but the
default `themeMode` is `"system"`. A light-preference user gets: dark splash → dark first paint →
flash to light once React mounts and `useApplyTheme` runs. Combined with the dark-only
`theme-color` (A5), the app's first impression on light devices is a theme it is not in. The CSP
(`script-src 'self'`, no inline) means the standard inline pre-boot snippet is not available, but
a tiny external classic script (same pattern as `public/spa-redirect.js`, which already runs
pre-boot) can read the persisted setting / `prefers-color-scheme` and set the class before first
paint.

### D. Brand voice: charming Denglish, but unregulated

The German-English blend is clearly deliberate and genuinely on-brand for the audience ("Speak
without Angst", "Wortschatz that sticks"). But no rule governs it, and it shows on one screen:

- Duplicate CTAs disagree: header says **"Kostenlos starten"**, the hero says **"Kostenlos
  testen"**, the closing CTA says "Kostenlos starten" again. Same action, two promises (starten
  vs testen is a real semantic difference).
- Hybrids that read as accidents rather than style: "Sofort loslegen, in seconds",
  "keep the Schwung", "Du schaffst das." mid-English paragraph.
- Grammar slip: "a Arztbesuch" (needs "an", or recast the sentence).
- Register mix: "Log in" (EN, ghost button) beside "Konto erstellen" (DE) in the same view;
  "comfy" in a feature card aimed at B1–B2 professionals.
- **`<html lang="en">`** while the manifest declares `lang: "de"` and most app UI (Heute,
  Bibliothek, Wörter …) is German. Screen readers voice German UI text with an English voice;
  search engines get a mixed signal. German content spans carry no `lang="de"`.

### E. Accessibility gaps on top of the good base

- **`--warning` amber fails contrast as text.** `hsl(38 92% 50%)` on the near-white background
  is ~2.2:1 (AA needs 4.5:1, large-text 3:1). It is used as a *text* color in `StreakBadge`,
  badges, toasts, and hub stats (10+ files use `text-warning`). Success green (~3.5:1) is also
  below AA for small text.
- **Gradient headline text bottoms out at cyan.** `text-gradient`/`accent-gradient` ends at
  `hsl(188 86% 43%)`, ~2.9:1 on white; passes only under the large-text rule, and only barely.
- **Landing page navigation is `<button onClick={navigate}>`, not links.** Footer (Über uns,
  Datenschutz, AGB, Quellen), "Mehr über Genauly", and CTAs are buttons, so no middle-click/new
  tab, no link semantics for assistive tech, and crawlers cannot follow the landing page to
  `/about`, `/privacy`, `/terms` (the `index.html` no-JS fallback partially compensates).
- **Icon-only affordances are thin on labels:** 31 `aria-label`s across the whole app; several
  icon buttons (header search, theme toggle call sites, facet chips) rely on visual context.

### F. Typography: safe but anonymous (minor)

Inter for everything, weight-only hierarchy, consistent scale (`text-2xl`/`3xl` page titles,
`text-xs` uppercase eyebrows). Nothing wrong, but nothing ownable either; the app inherits the
default "2024 SaaS" look. Long German compounds (Schnellwiederholung, Kollokationen) have no
hyphenation strategy on narrow screens; the global `overflow-x: clip` hides rather than solves
any overflow. Low priority next to A–E.

## Top 5 recommendations (impact ÷ effort)

1. **Ship link-preview brand assets (do first, smallest effort, highest external impact).**
   Design one 1200×630 OG card (logo + "German for real life. Break through the B1–B2 plateau."
   on the brand indigo), save as `public/og-image.png` (< 300 kB), and add the meta set to
   `index.html`: `og:title`, `og:description`, `og:image` (absolute `https://genauly.de/...`
   URL), `og:url`, `og:type`, `og:locale`, `twitter:card=summary_large_image`, plus
   `<link rel="canonical">`. Every shared link becomes a branded card. Roughly an hour of work.

2. **Define the brand palette once, then collapse the five accent systems onto it.**
   Step 1: pick THE indigo (recommend the mark's `#5b5be6`), and align `--primary`, the manifest
   `theme_color`, and nav Home to it. Step 2: define a curated 5–7 hue functional palette as
   named tokens (e.g. one accent per zone: Heute indigo, Bibliothek blue, Anwenden orange,
   Fortschritt sky, plus success/warn/danger), each with a light + dark value. Step 3: remap
   `themes.ts` accents, `intentCards.ts`, and every `HubHero` gradient to those tokens so a
   zone's hub, cards, and nav icon finally share a hue, and add a lint/grep convention against
   new raw `-500` classes in `features/`. This is the highest-leverage *visual* change: the app
   goes from "rainbow template" to "branded system" without redesigning any screen.

3. **Fix the light-mode boot experience.** Add a tiny external pre-boot script (CSP-safe, same
   mechanism as `spa-redirect.js`) that reads the persisted theme setting (or
   `prefers-color-scheme`) and sets/removes `.dark` on `<html>` before first paint; make the boot
   splash inherit it (CSS vars instead of hardcoded `#0f1729`); replace the single `theme-color`
   meta with light + dark `media` variants matching `--background`. Kills the dark flash and the
   mismatched browser chrome, the kind of polish users perceive as quality without naming it.

4. **Write the voice rule, then sweep the copy.** Add a short "Sprachmix" section to the
   CLAUDE.md writing-style block: German for actions/UI chrome and all CTAs, English only for
   marketing headlines and level-appropriate flavor words, never mid-clause hybrids, one
   canonical CTA label ("Kostenlos starten"). Then fix the landing/onboarding copy against it
   ("a Arztbesuch", "Sofort loslegen, in seconds", "keep the Schwung", Log in → "Anmelden"),
   and set `<html lang="de">` (the UI's dominant language and the manifest's declared one).

5. **Contrast + semantics pass on the a11y gaps.** Darken `--warning`/`--success` for text use
   (or add `--warning-text`-style companions ~45% lightness; keep the current values for fills),
   deepen the cyan end of `accent-gradient` when used via `text-gradient`, convert the landing
   page's navigational buttons to real `<Link>`/`<a>` elements, and sweep icon-only buttons for
   `aria-label`s. One focused session; verifiable with a contrast checker and keyboard walk.

**Also worth doing when touched next (not top-5):** commission/trace an SVG master of the logo
and check it into the repo; delete the stale `public/favicon.svg` (or replace it with a correct
SVG favicon and reference it); consider a display weight/optical size of Inter (or a single
distinctive display face) for hero + hub titles if brand differentiation becomes a priority.
