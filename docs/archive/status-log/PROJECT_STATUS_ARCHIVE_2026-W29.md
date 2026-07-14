# Project Status Archive — 2026-W29 (Jul 13–19)

_Condensed "Resume here" handoffs aged out of `docs/PROJECT_STATUS.md`, filed by the ISO week of their
date. For current status see `docs/PROJECT_STATUS.md`; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`._

## Session 113 (2026-07-13) — Brand identity exploration (condensed handoff)

**Handoff after session 113 (2026-07-13). Brand identity exploration (Opus 4.8), on branch
`claude/branding-logo-redesign-947e61`, merged to `main` (PR #516). Parallel to the demo work; no app
code changed.** The founder wants to replace the branding (logo, visual assets, colour scheme): the
current gradient rounded-square "G" reads as a Canva lookalike. Deliverable = a **catalogue of 20
logo/identity directions** for founder review, saved under `preview/branding/` (open the HTML files in
a browser; index in that folder's `README.md`).
- **What was produced:** three self-contained HTML "studio spec-sheet" pages, each direction a live
  SVG/CSS mark + a 5-colour palette (hex) + a licensable type pairing. `genauly-identity-vol1.html` +
  `vol2.html` (foundation *genau* = precision): Genau., Wasserwaage, Umlaut, Zielband, Neuland, „Genau",
  Der·Die·Das, Fokus, Roter Faden, Stempel. `vol3.html` (three new brand *philosophies*):
  Ankommen/belonging (Schwelle, Der Tisch, Schlüssel, Heimat), Durchbruch/momentum (Durchbruch, Schwung,
  Sprung), Klarheit/clarity (Prisma, Sonnenaufgang, Klartext).
- **Assistant shortlist:** Der·Die·Das (brand = the gender-colour teaching system), Neuland (one world
  with the game), Durchbruch (owns the plateau story), Ankommen/Schwelle (warmest, most distinctive).
- **NOT done (deliberate):** nothing in `src/` touched. No palette/token edit in `src/index.css` or
  `tailwind.config.ts`, no logo/favicon/PWA-icon regen. **That is the next step, and it only starts once
  the founder picks a direction** (belief + mark + palette, mixes allowed): lock one spec, wire the
  tokens (light + dark), regenerate all icons from the mark, `pnpm build`, ship to `main`. Also published
  as private Claude artifacts (Vol. I `fed14c61`, II `02c0d954`, III `dc5d3da7`).
- **Gates:** none run (no code change); docs + preview HTML only.

_Follow-on: session 116 (2026-07-14) picked up this thread — explored applying direction 03's
"Cobalt & Butter" palette to the real app (rejected) and shipped `docs/branding/genauly-ai-mockup-guide.pdf`.
See that session's handoff in `docs/PROJECT_STATUS.md`._
