# Brand identity exploration

## Vol. VII (session 127 cont., 2026-07-17) — Kit 1 recolored to the nav blues

Founder tweak on the Kit 1 · Kobalt & Butter favorite: swap Kobalt for the **dark blue of the bottom
nav** (`#2563EB`, the Praktisch/Theorie base color in `route-icons.tsx` / `nav-items.ts`), add the
nav's **light blue** to the palette, and use it in the logo highlighter swipe instead of butter yellow.
Because the nav carries two light-blue tones, `genauly-identity-vol7.html` shows both readings on the
real app: **Himmelblau** `#38BDF8` (sky-400, the gear-center dot; the recommendation, reads cleanly as
"light blue" and makes a dark/light two-blue system) and **Cyan** `#22D3EE` (cyan-400, the compass
needle + chart bar; the alternate). Both keep the g-on-highlighter mark; the light blue also becomes the
app `--accent` so chips/badges pick it up. Strips in `vol7-screens/`. Same token-swap method as Vol. V/VI.
No `src/` change.

## Vol. VI (session 127 cont., 2026-07-17) — premium color variations of Kit 1 + Kit 6

Founder direction: lean into the two favorites (Kit 1 Textmarker, Kit 6 Bauhaus), play with color while
keeping each core mark intact, goal = a **visually stunning app that builds trust and feels highly
premium**. So the palettes move away from candy-bright toward deep, considered tones and warm chosen
neutrals; the marks are unchanged (Kit 1 = g-on-highlighter, Kit 6 = circle/bar/dot G).

`genauly-identity-vol6.html` — eight variations, all previewed on the real app:
- **Kit 1 family:** `1` Kobalt & Butter (refined signature) · `1B` Tinte & Messing (ink + brass, bank/
  Behörde-premium) · `1C` Aubergine & Aprikose (editorial) · `1D` Marine & Koralle (navy = trust)
- **Kit 6 family:** `6` Bauhaus (refined signature) · `6E` Graphit & Messing (Braun/Vitra museum) ·
  `6F` Bordeaux & Marine (old-world) · `6G` **Mitternacht** (dark-mode: sapphire + gold on midnight)

Same token-swap method as Vol. V (documented below), extended to drive the app's real **dark mode**
(`.dark` class on the root) for the Mitternacht variant. Kits are defined once as hex-per-token-role and
converted to the app's HSL vars by a helper, so palettes stay single-source. Strips in `vol6-screens/`
(+ `aktuell.png` reference). Published as a self-contained Claude artifact. No `src/` change.

## Vol. V (session 127 cont., 2026-07-17) — Bauhaus family + real-app previews

Founder follow-up on Vol. IV: previews of Kit 1 (Textmarker) and Kit 6 (Bauhaus Pause) applied to the
app, plus more kits in Kit 6's philosophy, also previewed.

`genauly-identity-vol5.html` — four new geometric kits, each a full spec (mark, wordmark, palette,
type, UI probe) with an embedded real-app preview strip:

- **6A Bauklötze** — Fröbel building blocks; the friendliest reading, closest to the game
- **6B Ulm** — HfG-Ulm systematic; steel blue + signal orange, the "serious tool" positioning
- **6C Plakat** — Sachplakat poster; one dominant red, the loudest and most distinctive
- **6D Neubau** — same forms in contemporary colors (violet/rosé/grass); smallest jump from today

**Preview method (reuse this):** render the REAL app headless (Playwright + `pnpm dev`, seed
`localStorage b2beruf.settings.v1` to skip onboarding), inject a `:root` style tag overriding only the
CSS color tokens (`!important`), flatten `.bg-accent-gradient`/`.bg-mesh`, and swap the header logo
`<img>` to a data-URI mark. Screenshots: Praktisch / Theorie (Wörter) / Fortschritt at 390x844 light.
Strips live in `vol5-screens/` (incl. `aktuell.png` as the unmodified reference); nothing in `src/`
changed. What a preview shows is exactly what the real token swap would ship.

## Vol. IV (session 127, 2026-07-17) — 8 flat, colorful kits

Founder brief: the founder liked none of the 20 Vol. I–III directions and asked for a fresh set of
5–10 brand kits honoring the recorded preferences: **flat (no gradients on logo or buttons), a real
variety of colorful accents, nothing resembling a Canva tile, and respect for the already-designed
app** (two-tone neon nav icons, soft corners, the Neuland pixel game, the city map).

`genauly-identity-vol4.html` — eight complete kits, each with mark, wordmark, app icon at
64/40/20 px, palette with hex codes, a free Google-Fonts type pairing, a flat UI probe, and a
"Passt zum Bestand" note on how cheaply it maps onto the existing app:

1. **Textmarker** — highlighter swipe over the *genau* hidden inside "genauly"; Cobalt & Butter warmth
2. **Haken dran** — evolution kit: keeps the existing indigo, a lime check through the open G
3. **Sticker-Klub** — die-cut sticker G in the game's outline ink `#463C44`, candy palette
4. **Linie B2** — the G as a transit line with stations; five line colors = the five domains
5. **Zwei Stimmen** — two speech bubbles, no letter; teal + tangerine (the two Heute tabs)
6. **Bauhaus Pause** — G from circle, bar, and dot in softened primaries on paper
7. **Neonschild** — neon-tube G on night ink, for after-work learners; marketing face only
8. **Der Dachs** — a geometric badger mascot: gründlich, digs through the plateau; brand surfaces only

Mixing is allowed (e.g. Kit 2's mark under Kit 1's palette). Published as a private Claude artifact
(`b4bd024b`). Next step when a direction is chosen: same protocol as below (lock the spec, wire the
tokens light + dark, regenerate logo/favicons/PWA icons, ship via PR to `main`).

## Vol. I–III (session 113, 2026-07-13)

Founder brief: *"I want to change the branding including logo, visual assets and color schemes. The
current logo looks like a direct copy of the Canva logo. Can you provide me with a catalogue of
options?"* Then, across follow-ups: *"generate 5 more"* and *"generate 10 more with 2-3 other core
philosophical bases."*

These three HTML sheets are the result: **20 logo/identity directions** for **Genauly**, each rendered
as a live concept (real SVG/CSS marks, a 5-color palette with hex codes, and a licensable type
pairing). Open any file in a browser to review. They are a **pitch for founder review, not applied
branding** — nothing in the app (`src/index.css`, `tailwind.config.ts`, the logo assets) has changed.

The starting point being replaced: the current mark is a gradient rounded-square "G" (indigo → cyan),
which reads as a Canva lookalike. Every direction deliberately steps away from that gradient tile.

## The four foundations, 20 directions

**Vol. I + II — foundation: *Genau* (precision / the click of being correct).** The name comes from
*genau* ("exactly"), so these ten draw precision as an object or a piece of German.

`genauly-identity-vol1.html`
1. **Genau.** — a confident red period, editorial, no tile
2. **Wasserwaage** — a spirit-level bubble sitting dead-center (level = exact), Braun/industrial
3. **Umlaut** — the two dots, unmistakably German, also a progress-pair device
4. **Zielband** — a target with a B2 marker notch (hit your level)
5. **Neuland** — a summit rising off the plateau line, ties to the in-app game world

`genauly-identity-vol2.html`
6. **„Genau"** — the German quotation marks (Gänsefüßchen) wrapping the G
7. **Der·Die·Das** — the three genders as a live color system (der blue / die red / das green)
8. **Fokus** — a camera aperture resolving to a precise point, premium graphite + brass
9. **Roter Faden** — the German idiom for the through-line, drawn as one continuous red thread
10. **Stempel** — the bureaucratic approval stamp reframed as "correct", ties to the Amt content

**Vol. III — three *other* core philosophies (what the brand is really *for*).**

`genauly-identity-vol3.html`
- **Philosophy A · Ankommen (belonging):** A1 **Schwelle** (lit doorway) · A2 **Der Tisch** (a seat at
  the table) · A3 **Schlüssel** (the key) · A4 **Heimat** (a home-pin on the map)
- **Philosophy B · Durchbruch (momentum):** B1 **Durchbruch** (arrow through the plateau line) ·
  B2 **Schwung** (momentum sweep) · B3 **Sprung** (the leap from B1 to B2)
- **Philosophy C · Klarheit (clarity):** C1 **Prisma** (light split into a readable spectrum) ·
  C2 **Sonnenaufgang** (the fog lifts over the plateau) · C3 **Klartext** (noise resolving into signal)

## Cross-volume shortlist (assistant recommendation)

- **Der·Die·Das (07)** — boldest: the brand *is* the core teaching mechanic (gender color-coding).
- **Neuland (05)** — best story: one world across brand, app, and the game already in build.
- **Durchbruch (B1)** — sharpest marketing: names the exact pain (the plateau) and sells the escape.
- **Ankommen / Schwelle (A1)** — warmest feeling, furthest from every competitor.

Mixing is on the table (e.g. Der·Die·Das color under a Roter Faden mark, or the Fokus palette with the
„Genau" wordmark).

## Notes / caveats

- Marks are **live-rendered concepts**, accurate enough to judge the idea, not final vector artwork.
- Typeface names (Fraunces, Clash Display, Instrument Serif, Zodiak, Geist, etc.) are
  **recommendations**; the sheets preview them with system-font fallbacks because the pages don't load
  web fonts.
- Published as private Claude artifacts during the session: Vol. I `fed14c61`, Vol. II `02c0d954`,
  Vol. III `dc5d3da7` (see `docs/SESSION_PROMPT_LOG.md` entry 380).

## Next step when a direction is chosen

Tell the assistant the **belief + mark + palette** (or a mix). It will lock one spec, wire the palette
into `src/index.css` + `tailwind.config.ts` (light + dark), regenerate the logo / favicons (16/32) /
PWA + Apple-touch icons from the chosen mark, run `pnpm build`, and ship to `main`.
