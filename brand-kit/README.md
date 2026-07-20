# Genauly — Brand Kit

The complete, self-contained brand kit for **Genauly** (German for real life, B1–B2).
Everything here is **generated from the app's own source** by
`scripts/branding/build-brand-kit.mjs`, so the colors and logo can never drift from what ships.
Regenerate any time the mark or tokens change; do not hand-edit the files.

**Design system:** Kit 1 · **Nachtblau & Himmelblau + Koralle**. Warm paper ground, crisp white
cards, one confident blue for action, a lighter sky blue for accents and the logo swipe, and a warm
coral reserved for celebration. Full design reference: [`../docs/branding/BRAND_SPEC.md`](../docs/branding/BRAND_SPEC.md).

---

## Logo

The mark is a lowercase **g** sitting on a **Himmel Soft** highlighter swipe (Textmarker) — *genau*
lives inside *genauly*. The `g` is outlined from **Inter 800** (the app's own UI typeface, so the
mark and the wordmark are the same letterforms) into a real vector `<path>`, so it renders
identically everywhere. **The logo is tile-less: transparent background, no tile.** On light grounds
the `g` is **Tinte ink**; on dark grounds the mark is **two-tone** — ink where the `g` sits on the
swipe, **white** where it falls off (only the descender) — so it reads on any surface. The primary
logo everywhere there is room is the **wordmark** (the whole word "genauly"); the compact **g mark**
is for tight spots.

| File | Use |
|------|-----|
| `logo/mark.svg` · `mark-dark.svg` | The compact mark, tile-less + transparent. `mark` = ink g (light grounds), `mark-dark` = two-tone (dark grounds). |
| `logo/wordmark.png` · `wordmark-dark.png` | The primary logo: lowercase "genauly", Inter 800, swipe under "genau". Ships as PNG (live Inter text; the swipe two-tones the g on dark). Use `-dark` on dark grounds. |
| `logo/lockup-horizontal.png` · `-dark.png` | Compact mark + wordmark, side by side (`-dark` for dark grounds). |
| `logo/lockup-stacked.png` | Mark above wordmark. For square/narrow spaces. |
| `logo/mark-mono-ink.svg` · `-white.svg` | Single-color mark (g knocked out of the swipe) for 1-color print / stamps. |
| `logo/app-icon-tile.svg` | The Papier-tiled version (mark centered "Größer", 12% margin) — **only** for the browser/OS app icons (favicon, PWA, apple-touch), never the in-app logo. |
| `logo/clearspace.svg` | Clear-space + min-size guide. |
| `previews/logo-overview.png` · `logo-preview.html` | Contact sheet + an interactive preview of the tile-less mark on light/dark grounds. |

**Rules**
- **The logo background is always transparent.** Never put the logo in a tile or box. The one
  exception is the app icons (`icons/`), which need a filled Papier tile because a browser tab or an
  OS home-screen mask turns transparency into black.
- **The mark adapts to the ground:** ink g on light; two-tone (ink on the swipe, white off it) on
  dark. In code this is one `<Logo>` component that swaps the light ↔ dark image on the `.dark` class.
- **Clear space:** keep a margin of at least **¼ of the mark's height** clear on all sides.
- **Minimum size:** the mark reads down to **16 px** (the favicon); do not use the wordmark or
  lockups below ~20 px cap-height.
- **On light** use `wordmark.png`; **on dark** use `wordmark-dark.png`.
- **Don't:** recolor the swipe, add effects/shadows, stretch, rotate, box the mark in a container, or
  set the wordmark in another typeface.

## Color

Named palette in [`color/palette.svg`](color/palette.svg) (PNG in `previews/palette.png`). Machine
formats: [`color/tokens.css`](color/tokens.css) (`hsl(var(--token))`) and
[`color/tokens.json`](color/tokens.json) (hex, both themes). Hex values below are the **shipped
light-mode tokens** (some are nudged from the spec swatches for WCAG AA — the token is the source of
truth, and `pnpm check:contrast` guards every pairing).

| Role | Name | Light hex | Dark hex | Token |
|------|------|-----------|----------|-------|
| Ground | Papier | `#FAF5EB` | `#131620` | `--background` |
| Text | Tinte | `#1C1A23` | `#EAE7F0`¹ | `--foreground` |
| Primär / action | **Nachtblau** | `#2866EB` | `#6E99F7` | `--primary` |
| Akzent / swipe | **Himmel Soft** | `#8EDCFB` | `#8EDCFB` | `--accent` |
| Accent-as-text | — | `#086F9B` | — | `--accent-ink` |
| Belohnung / streak | **Koralle** | `#EA4D2A` | `#F5785C` | `--reward` |
| Erfolg | Blatt | `#2E9E6C` | — | `--success` |
| Warnung | Butter | `#E19209` | — | `--warning` |
| Fehler | Rot | `#E1483D` | — | `--danger` |

¹ approximate; see `tokens.json` for every dark value.

**Discipline (what keeps it premium):** Nachtblau is the single action/identity color. Himmel Soft is
for tints, chips, and the swipe — **never body text on a light ground** (use `--accent-ink` for
that). Koralle is for **reward / streak / celebration only**, never decoration. Butter is warning
only. The warm Papier ground + warm-navy shadows are the biggest "premium" move; keep cards on it.

## Typography

**Inter** (variable, self-hosted) is the one typeface — UI, wordmark, and body. Specimen in
[`type/typography.svg`](type/typography.svg) (PNG in `previews/typography.png`).

- **800** — display + the wordmark
- **700** — headings
- **600** — UI labels
- **400** — body text
- Use **`tabular-nums`** for all figures (counts, XP, streaks, stats).
- Tighten tracking on display sizes; **avoid em dashes** in all copy (house rule).

## App icons

`icons/` holds the shipped raster set, regenerated from the one mark. These keep the Papier **tile**
(unlike the tile-less in-app logo above): a browser tab or an OS mask needs a filled background.

- `genauly-logo.png` · `genauly-logo-dark.png` — the **tile-less in-app logo** (transparent), ink g
  and Papier g. Swapped by theme in the app.
- `favicon-16/32/48.png` — **rounded, transparent-corner tile** (browser tab).
- `apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png` — **full-bleed opaque** (iOS/Android
  fill transparency with black; these must stay full-bleed).
- `pwa-maskable-512x512.png` — mark inside the inner 80% safe zone.

## Social

- `social/og-image.png` — 1200×630 link-preview card (mark + wordmark + tagline).
- `social/avatar.png` — 512×512 square profile avatar (full-bleed mark).

---

## Regenerating

```bash
# needs a local Playwright Chromium for the PNG previews + lockups + wordmark
# (the marks/tokens/palette build without it). Run build-logo-assets.mjs first
# so the wordmark PNGs the kit copies are up to date.
node scripts/branding/build-logo-assets.mjs
node scripts/branding/build-brand-kit.mjs
```

The mark geometry + outlined-g + the lowercase wordmark all live in
`scripts/branding/build-logo-assets.mjs` (which regenerates the `public/` app icons **and** the
`public/genauly-wordmark*.png` the kit copies); the colors are read live from `src/index.css`.
Change those sources, rerun both scripts, done.
