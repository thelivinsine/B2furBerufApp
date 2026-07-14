# Brand identity exploration (session 113, 2026-07-13)

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
