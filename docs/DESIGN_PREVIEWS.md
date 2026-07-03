# Design Previews

> **Status (2026-07-03): the bottom-nav exploration below is RESOLVED and historical.** It captures the
> session-24 mockup rounds. The founder ultimately selected the **Context Strip + Icon Rail (Concept F)**
> direction, which was then refined and **locked across sessions 26–28** (the context strip was later
> removed in s26; two-tone neon marks + compact-squircle backdrops landed in s27–28). The authoritative,
> current spec for the shipped bar is the **"Mobile bottom tab bar (locked)"** section of `CLAUDE.md`, not
> this file. This doc is kept as the design paper trail and as the how-to for adding future previews.

All HTML mockups live in the **`preview/`** folder at the repo root. Open any link below in a browser to see the rendered preview (the htmlpreview.github.io service renders the raw GitHub HTML).

## Bottom Navigation Bar

### Session 24 (2026-06-15) — Bottom nav exploration

#### v1 — Initial 4 concepts (A–D)

File: `preview/bottom-nav-concepts.html`

[Open preview](https://htmlpreview.github.io/?https://github.com/thelivinsine/B2furBerufApp/blob/main/preview/bottom-nav-concepts.html)

| Concept | Description |
|---|---|
| A | iOS glass pill — floating frosted pill |
| B | Material You — colored indicator blob |
| C | Center FAB — large central action button |
| D | Expanding pill — pill stretches on active tab |

Status: **rejected by founder** (all four). See v2 for new directions.

---

#### v2 — 6 creative concepts (A–F)

File: `preview/bottom-nav-v2.html`

[Open preview](https://htmlpreview.github.io/?https://github.com/thelivinsine/B2furBerufApp/blob/main/preview/bottom-nav-v2.html)

Research sources: iOS 26 Liquid Glass (WWDC 2025), Duolingo gamification, Linear/Raycast dark aesthetic, Apple Watch Activity rings, GitHub Mobile context strip.

| Concept | Description | Inspired by |
|---|---|---|
| A | iOS 26 Liquid Glass — floating frosted pill that shrinks on scroll | Apple WWDC 2025 |
| B | Gamified Streak Bar — streak + XP always visible above tabs | Duolingo |
| C | Neon Dark Command Bar — active tab glows brand indigo | Linear, Raycast, Vercel |
| D | Floating Action Dock — dark pill with ambient glow + center lightning FAB | macOS Dock + TikTok |
| E | Progress Ring Nav — circular ring around each icon shows section completion % | Apple Watch Activity |
| F | Context Strip + Icon Rail — slim strip above icons showing section name + badge | GitHub Mobile, Notion |

Status: **founder selected Concept F** for further refinement.

---

#### F — Refined variants (F1–F2)

File: `preview/bottom-nav-f-refined.html`

[Open preview](https://htmlpreview.github.io/?https://github.com/thelivinsine/B2furBerufApp/blob/main/preview/bottom-nav-f-refined.html)

Changes from base F: no labels under icons, no dot in context strip, custom SVG icons (no emoji).

| Variant | Description |
|---|---|
| F1 | Gradient Wash — all icons share brand indigo-to-cyan gradient; soft pill + underline on active |
| F2 | Per-section Color — two-tone book icon (indigo left / cyan right); each section gets its own accent color |

Status: founder liked both; requested all variants in one page.

---

#### F — All 5 variants (F1–F5)

File: `preview/bottom-nav-f-all.html`

[Open preview](https://htmlpreview.github.io/?https://github.com/thelivinsine/B2furBerufApp/blob/main/preview/bottom-nav-f-all.html)

All variants include: context strip (no dot), icon-only rail (no labels), custom SVG icons.

| Variant | Active state | Context strip | Feel |
|---|---|---|---|
| F1 | Soft gradient pill + underline | Gradient tinted bg | Cohesive, premium |
| F2 | Soft tinted pill + underline | Section color tint | Each section its own identity |
| F3 | Fully filled gradient pill; icon turns white | Gradient tinted bg | High contrast, bold |
| F4 | Gradient icon + thin underline only; no pill | Plain white, minimal | Ultra minimal, Spotify-like |
| F5 | Soft pill + underline | Full gradient floating pill | Context-first, very distinctive |

Status: **RESOLVED.** The founder chose the Concept F direction; it was refined and locked in sessions
26–28 (see the banner at the top of this file and the "Mobile bottom tab bar (locked)" section of
`CLAUDE.md` for the shipped design).

---

## How to add a new preview

1. Create your HTML file in `preview/<name>.html`.
2. Commit it to the dev branch and merge to `main`.
3. Add a row to this file with the htmlpreview.github.io link pointing to `main`.

The `preview/` folder is not processed by Vite — it is inert to the build and safe to merge at any time.
