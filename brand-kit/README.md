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

The mark is a lowercase **g** sitting on a Himmelblau **highlighter swipe** (Textmarker) — *genau*
lives inside *genauly*. The `g` is outlined from **Inter 800** (the app's own UI typeface, so the
mark and the wordmark are the same letterforms) into a real vector `<path>`, so it renders
identically everywhere from the favicon to print.

| File | Use |
|------|-----|
| `logo/mark.svg` | The icon mark (g on swipe, Papier tile). Primary app icon. |
| `logo/wordmark.svg` · `wordmark-white.svg` | "Genauly" set in Inter 800 (ink / white for dark). |
| `logo/lockup-horizontal.svg` · `-white.svg` | Mark + wordmark, side by side. Default lockup. |
| `logo/lockup-stacked.svg` | Mark above wordmark. For square/narrow spaces. |
| `logo/mark-mono-ink.svg` · `-white.svg` | Single-color mark (g knocked out of the swipe) for 1-color print / stamps. |
| `logo/clearspace.svg` | Clear-space + min-size guide. |
| `previews/logo-overview.png` | Visual contact sheet of all of the above. |

**Rules**
- **Clear space:** keep a margin of at least **¼ of the mark's height** clear on all sides.
- **Minimum size:** the mark reads down to **16 px** (the favicon); do not use the wordmark or
  lockups below ~20 px cap-height.
- **On light** use the ink wordmark; **on dark** use the white wordmark. The tile itself is Papier
  in every context (its swipe + g carry the identity, not the tile).
- **Don't:** recolor the swipe or the g, add effects/shadows, stretch, rotate, or box the mark in a
  new container, or set the wordmark in another typeface.

## Color

Named palette in [`color/palette.svg`](color/palette.svg) (PNG in `previews/palette.png`). Machine
formats: [`color/tokens.css`](color/tokens.css) (`hsl(var(--token))`) and
[`color/tokens.json`](color/tokens.json) (hex, both themes). Hex values below are the **shipped
light-mode tokens** (some are nudged from the spec swatches for WCAG AA — the token is the source of
truth, and `pnpm check:contrast` guards every pairing).

| Role | Name | Light hex | Dark hex | Token |
|------|------|-----------|----------|-------|
| Ground | Papier | `#FAF5EB` | `#151320` | `--background` |
| Text | Tinte | `#1C1A23` | `#EAE7F0`¹ | `--foreground` |
| Primär / action | **Nachtblau** | `#2866EB` | `#6E99F7` | `--primary` |
| Akzent / swipe | **Himmelblau** | `#53C7F9` | `#6ECEF7` | `--accent` |
| Accent-as-text | — | `#086F9B` | — | `--accent-ink` |
| Belohnung / streak | **Koralle** | `#EA4D2A` | `#F5785C` | `--reward` |
| Erfolg | Blatt | `#2E9E6C` | — | `--success` |
| Warnung | Butter | `#E19209` | — | `--warning` |
| Fehler | Rot | `#E1483D` | — | `--danger` |

¹ approximate; see `tokens.json` for every dark value.

**Discipline (what keeps it premium):** Nachtblau is the single action/identity color. Himmelblau is
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

`icons/` holds the shipped raster set, regenerated from the one mark:

- `favicon-16/32/48.png`, `genauly-default-logo-transparent-corners.png` — **rounded, transparent
  corners** (browser tab + in-app).
- `apple-touch-icon.png`, `pwa-192x192.png`, `pwa-512x512.png` — **full-bleed opaque** (iOS/Android
  fill transparency with black; these must stay full-bleed).
- `pwa-maskable-512x512.png` — mark inside the inner 80% safe zone.

## Social

- `social/og-image.png` — 1200×630 link-preview card (mark + wordmark + tagline).
- `social/avatar.png` — 512×512 square profile avatar (full-bleed mark).

---

## Regenerating

```bash
# needs a local Playwright Chromium for the PNG previews (SVGs/tokens build without it)
node scripts/branding/build-brand-kit.mjs
```

The mark geometry + outlined-g live in `scripts/branding/build-logo-assets.mjs` (which regenerates
the `public/` app icons); the outlined wordmark is `scripts/branding/wordmark-data.mjs`; the colors
are read live from `src/index.css`. Change those sources, rerun both scripts, done.
