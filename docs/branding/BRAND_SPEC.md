# Genauly Brand Spec — FINALIZED, not yet implemented

**Status:** ✅ Design finalized (session 127, 2026-07-19). ⛔ **NOT wired into the app yet** — no
`src/` change has been made. This file is the locked reference for the implementation session.

**Chosen direction:** Kit 1 · **Nachtblau & Himmelblau + Koralle** (brand catalogue Vol. VIII).
The core mark is the Textmarker: a lowercase **g** sitting on a highlighter swipe, with *genau* living
inside *genauly*. Colors are drawn from the app's own bottom-nav blues, then lightened ~10–15% and
warmed with a coral accent.

- Preview (self-contained): `preview/branding/artifacts/genauly-vol8-artifact.html`
- Editable source + real-app strip: `preview/branding/genauly-identity-vol8.html`
- Logo design reference: `preview/branding/genauly-logo-final.svg`

---

## 1. Palette + token map (light mode)

Every color maps to an existing CSS custom property in `src/index.css` (`:root`). HSL is in the app's
space-separated format, ready to paste.

| Role | Name | Hex | HSL (`H S% L%`) | App token |
|------|------|-----|-----------------|-----------|
| Ground | Papier | `#FAF6EC` | `43 58% 95%` | `--background` |
| Text | Tinte | `#1C1A24` | `252 16% 12%` | `--foreground` |
| Cards | Weiß | `#FFFFFF` | `0 0% 100%` | `--surface`, `--elevated` |
| Fill | Muted | `#F0E9D8` | `42 44% 89%` | `--muted` |
| Muted text | — | `#6A6455` | `43 11% 37%` | `--muted-foreground` |
| Lines | — | `#E7DEC9` | `42 38% 85%` | `--border`, `--input` |
| **Primär** | **Nachtblau** | **`#3D74ED`** | **`221 83% 58%`** | `--primary`, `--ring` |
| — | on primary | `#FFFFFF` | `0 0% 100%` | `--primary-foreground` |
| **Akzent** | **Himmelblau** | **`#52C6F9`** | **`198 93% 65%`** | `--accent` |
| — | on accent | `#0A2A3A` | `202 71% 13%` | `--accent-foreground` |
| Erfolg | Blatt | `#2E9E6B` | `153 55% 40%` | `--success` |
| Warnung | Butter | `#F3C24B` | `43 87% 62%` | `--warning` (fg `#3A2E12`) |
| Fehler | Rot | `#E0483C` | `4 73% 56%` | `--danger` |
| **Belohnung** | **Koralle** | **`#F0603F`** | **`11 86% 59%`** | `--reward` |
| Belohnung-bg | — | `#FBE7E0` | `16 77% 93%` | `--reward-bg` |
| Schatten | — | `#22304F` | `221 40% 22%` | `--shadow` |

**The three brand moves vs. today:**
1. **Nachtblau `#3D74ED`** replaces the indigo primary. It is the nav's dark blue `#2563EB`
   (`nav-items.ts`) lightened ~11%.
2. **Himmelblau `#52C6F9`** is the new accent (chips, active-tab tint, the logo swipe). It is the nav's
   light blue `#38BDF8` lightened ~13%.
3. **Koralle `#F0603F`** is a warm counterpoint to the two blues, mapped to `--reward` (streak /
   celebration). Butter stays as a secondary warm tone (`--warning`).

## 2. Dark mode (to be tuned at implementation)

Not finalized. Proposed starting point (keep the two-blue + coral identity, lift lightness for a dark
ground, mirror the existing `.dark` block in `src/index.css`):
- `--background` ~ `250 24% 10%`, `--surface` ~ `250 20% 14%`, `--foreground` ~ `250 20% 92%`
- `--primary` Nachtblau lifted ~ `221 90% 70%`, `--accent` Himmelblau ~ `198 90% 70%`
- `--reward` Koralle ~ `11 88% 66%`
Verify contrast (white/ink on primary and accent) and screenshot both themes before shipping.

## 3. Logo

- Mark: `preview/branding/genauly-logo-final.svg`. Swipe path (in a 64×64 viewBox, rotated `-3° about
  32,32`): `M 12 24 L 52 20 Q 57 23 55 30 L 54 45 L 13 49 Q 9 45 10 34 Z`, fill Himmelblau `#52C6F9`.
  The swipe bottom was extended (from `…L 54 40 L 13 44 Q 9 40 10 32 Z`) so it fully covers the closed
  bowl of the **g**; the descender still pokes out naturally.
- **The g must be outlined to a `<path>` at implementation time** — the reference SVG uses a system-ui
  `<text>` element, which renders differently across platforms and would not be reproducible in the
  favicon / PWA icons. Outline it from a chosen weight (a heavy geometric-humanist sans; the reference
  approximates an 800-weight system sans).
- Regenerate from the final mark: `public/genauly-default-logo-transparent-corners.png`,
  `public/favicon-32.png` / `favicon-16.png`, `public/apple-touch-icon.png`,
  `public/pwa-192x192.png` / `pwa-512x512.png` / `pwa-maskable-512x512.png`. Keep the full-bleed-opaque
  rule for the OS-masked icons (see `CLAUDE.md` → Brand logo), rounded-transparent for in-app.

## 4. Implementation checklist (run only when the founder says go)

1. `src/index.css` — replace the `:root` token values per §1; tune and add the `.dark` block per §2.
2. `tailwind.config.ts` — the tokens flow through automatically; confirm `--accent-gradient` /
   `bg-mesh` still read well with the new hues (the brand is flat, so gradients may be dialed back or
   left; founder preference is flat).
3. `src/components/layout/route-icons.tsx` / `nav-items.ts` — the nav marks are **already** Nachtblau
   `#2563EB` / cyan family, i.e. the palette was drawn *from* them, so they align by construction. If
   the founder wants the nav marks to match the lightened `#3D74ED` exactly, update the hard-coded
   values there (they are not tokenized).
4. Regenerate the logo + all favicons / PWA icons from §3 (outline the g first).
5. `pnpm build` + screenshot Praktisch / Theorie / Fortschritt in **light and dark**, mobile + desktop.
6. Ship via PR to `main`.

## 5. Provenance

Full exploration in `preview/branding/README.md` (catalogue Vol. IV–VIII). The token-swap preview
method (real app headless, only tokens + logo swapped) means these previews match what shipping will
look like, because it is the same mechanism (the tokens in `src/index.css`).
