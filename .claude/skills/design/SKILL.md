---
name: design
description: Genauly design system + design-work process. MUST be loaded BEFORE creating or restyling ANY user-facing page, section, view, component, mockup, or preview (new surface, redesign, "make it prettier", layout, colors, spacing, motion, copy on chrome). Encodes the founder's locked visual language, the preview-first workflow, per-section rules (Bibliothek, Schreiben, Praktisch), and the pre-flight checklist that prevents rework rounds.
---

# Genauly design work: process + system

Distilled from ~150 sessions of founder feedback (sources: `docs/SESSION_PROMPT_LOG.md`,
`docs/DECISIONS.md`, CLAUDE.md). The founder's north star, stated verbatim across many sessions:
**"billion dollar edutech app": premium, minimal, visually pleasing, with finesse.** Premium means
subtle gradients + rich type + real contrast, NOT flat, and NOT glowing.

## Rule zero

**Extend the existing design system. Never invent a parallel style.** The Bibliothek section is the
reference design language; every new surface must read as an extension of it (the founder said this
explicitly for Schreiben, s147/s149, and it generalizes). Before designing anything, open the
closest existing surface and reuse its building blocks (§5).

## 1. Process (non-negotiable, in this order)

1. **Report before edits.** If asked for analysis or a recommendation, deliver the findings in chat
   first. Do NOT touch code or docs until the founder picks a direction (they have called this out
   twice: s135, s137).
2. **Previews first, always.** Never implement a new or redesigned surface directly. Build
   founder-reviewable mockups in `preview/*.html` using the REAL tokens (copy actual values from
   `src/index.css` + `tailwind.config.ts`, and real component geometry, never approximations).
3. **2-4 named variants** (A/B/C or 1/2/3), visibly different, each labeled. The founder picks by
   name ("I like option B", "go with 4a dark / 4b light"). One-option previews waste a round.
   **Never mark a recommendation unless asked** (founder, s187): state each option's cost and let
   them choose.
4. **Write the preview in ENGLISH** (founder rule, restated s187 after a German preview page):
   headings, option names, notes, tables, switch labels, every word of the review chrome. The only
   German in a preview is the copy that is literally app copy in the mocked screen (task text,
   button labels, tooltips), because that is what is under review. Same for the chat summary and the
   PR body. The German-UI rule is about the product, not about what the founder reads.
5. **Screenshot-verify before presenting.** Render the preview in headless Chromium
   (`/opt/pw-browsers/chromium`) and check it against the live app's real controls. The founder
   instantly catches drift ("the view buttons are not same as in the app", s154).
6. **Publish as an artifact** so the founder can view it inside Claude, AND save the file to
   `preview/` (iteration rounds suffixed `-r2`, `-r3`). Keep one artifact URL per topic and
   redeploy it across rounds.
7. **Wait for the pick, then implement EXACTLY the picked variant.** After implementing, verify the
   live surface matches the approved preview (screenshot compare). "Preview ≠ live" is a top-4
   complaint.
8. **Absorb every feedback point.** Founder feedback arrives as numbered lists; address every
   number and report back per-point. Half-absorbed feedback forced a re-listed 13-point correction
   plus a demanded full audit once (s149). Watch for mid-prompt self-corrections ("I meant Himmel
   Mint", "I said B by mistake, use A") and honor the correction.
9. **Explain in plain, non-technical language.** The founder is non-technical and has asked
   repeatedly. No jargon in chat summaries.

## 2. Pre-flight checklist (run over your own work BEFORE showing it)

Ranked by how often the founder had to correct AI output:

1. **Redundancy.** Each fact appears exactly ONCE. No label restating what a toggle already says,
   no repeated ranges/word counts, no duplicate hints, no explanatory filler sentences under
   headers. This is the #1 complaint.
2. **Color.** Check every surface against §3. Most common misses: accent blue on labels (must be
   neutral dark grey), grey slabs where Himmelblau tiles belong, non-white content cards, green or
   coral used decoratively.
3. **Size.** Default SMALLER. Toggles are content-sized and capped (LibrarySwitcher geometry,
   ~44px tall, is the canonical reference; a 4-label switcher caps at `lg:max-w-xl` centered).
   Icon buttons 40px. Inline keys ~24px. When something feels borderline, shrink it ~30%.
4. **Dead controls.** Nothing tappable may sit disabled at its default state (reads as broken).
   A reset always acts: clear + fresh draw. Zero-yield options grey out with honest counts, never
   dead-end.
5. **Corners.** Squircle, not fully round: `rounded-lg` tracks / `rounded-md` pills for toggles,
   switchers, filter pills (s154). Fully round stays ONLY for dots, meters, count badges, avatars,
   circular icon buttons. **Check the radius against the BOX, not the token name** (s183): a radius
   at or above half the side is a circle whatever it is called, so `rounded-2xl` (`--radius + 10` =
   24px) on a 48px tile renders a full circle. The Prüfung hub tiles had been doing exactly that
   unnoticed; 48px tiles take `rounded-xl`.
6. **Placement.** AI/legal disclaimers are standalone muted lines BELOW cards, never inside them,
   horizontally centered in normal flow (not bottom-pinned) — EXCEPT the two Schreiben trainers
   (Fokus + Kurz/Lang), where the founder moved the Art. 50 note to a fixed bottom line level with
   the floating Feedback pill on desktop and a condensed line under the floating action buttons on
   mobile (s160, `docs/DECISIONS.md`; do not re-center these two). Primary actions sit in the same place
   across sibling modes (sticky bottom bars on mobile everywhere) — and "the same place" means to
   the pixel: the three Schreiben trainers share ONE fixed-cluster offset and ONE fixed KI line,
   because a 13px difference reads as a jump on every tab switch (s169).
7. **Motion.** One timing family: 0.12-0.18s panels/popovers, directional tab slides ~0.16s,
   everything reduced-motion safe. Snappy, never slow. Opacity-only enter/exit on framer `layout`/
   `Reorder` elements (scale fights layout projection, locked s26).
8. **Nothing see-through inside a chrome-less floating cluster** (s166). The two Schreiben trainers
   float their mobile action row over the cards with no bar behind it, so every control needs an
   opaque backing and the caption a `bg-background/90` plate (`features/writing/floatingCluster.ts`):
   otherwise a `disabled:opacity-50` or `outline` button lets the card text bleed through and reads
   as two labels stacked (the founder reported exactly this). Transient "you can't submit yet" hints
   belong in that cluster's caption slot, never at the card tail, which is where the pinned row
   parks. Never answer a future overlap here by re-adding a bar.

## 3. Color language (locked)

- **Brand Nachtblau `#3D74ED`** (`--primary`): the single loud accent. Actions, active tab text,
  card-title eyebrows.
- **Himmelblau / Himmel Soft** (`--accent`, `197 93% 77%` both themes): selection rails and accent
  tiles (`bg-accent/20`, dark `bg-accent/10`), key-press flashes, fix-tile chips. Schreiben-style
  rails are Himmelblau tiles, NEVER grey slabs. A control that OPENS such a rail wears its color
  too (`variant="accent"`, s166: the Schreiben "Aufgabe wählen" / "Grammatik" toggles), never brand
  blue, which would compete with the CTA beside it.
- **The accent is a FILL with NO visible edge** (founder s168, sharpened s169): every
  filter/selection rail and every button that opens one borders in its OWN fill colour
  (`border-accent/20` over `bg-accent/20`) and separates from the page by `shadow-soft` alone, the
  same lift the Bibliothek word cards use. Inner dividers on such a tile are tinted to match
  (`border-accent-ink/10`), never left grey. Two edges have now been tried and rejected: an accent
  edge (s166 `accent-ink/70`, too loud) and a neutral grey one (s168, "doesn't look good" around a
  blue wash). Fix tiles and result chips keep their accent edge: they are content, not rails.
- **White `bg-surface` cards** for content, with `border-border` + `shadow-soft`. AI output cards
  are white, never a grey wash.
- **Grey `bg-muted`** only as recessed chrome: the Bibliothek FilterRail tile, switcher tracks,
  with WHITE controls inside so they pop (this exact grey-tile/white-controls split was settled
  after multiple flip-flops, s104; do not re-litigate).
- **Green `--success`**: strictly "correct/detected". Green dot = detected fact, green underline =
  the fix, green badge = done. Never decoration.
- **Koralle `--reward`**: error marks in Fokus, loot/combo/streak celebration. Never on buildings,
  marks, or general chrome.
- **Labels and secondary text: neutral dark grey** (`text-slate-600 dark:text-slate-300` family),
  NEVER the section accent ("blue doesn't look very premium", s141).
- **Gradients yes, glow no.** `bg-accent-gradient` on primary CTAs, the subtle mint→sky page
  ground (`bg-page`). No halos/`shadow-glow` outside the sanctioned session CTA. Solid buttons for
  in-card actions (Korrigieren/Auswerten are solid, s150).
- Decorative gradient pairs come ONLY from brand families (blue/sky/cyan, emerald/teal/green,
  amber/orange/yellow, orange/red, rose/pink). Never indigo/violet/purple/fuchsia.
- Emerald stays the quiet Grammatik accent (icon tiles + Muster panel only).
- **Dark mode is near-neutral (s187, founder pick "N3 Slate"), never blue:** greys at 10-15%
  saturation (ground `220 15% 4%`, card `220 10% 17%`, border `220 10% 38%`), and the two coloured
  page radials are OFF in dark (`--wash-a`/`--wash-b` = 0), because on a dark ground they read as a
  blue haze. The reference set the founder named is Claude / ChatGPT / GitHub / VS Code: neutral
  greys, one accent, colour only where it acts. Three layers always separate: ground → card
  (1.38:1) → nested-in-card (`--elevated`). Always use tokens, never hardcoded hexes.
- **Corners are the "tighter" scale (s187):** `--radius: 0.5rem`, so card 10px, row 8px, pill 6px,
  `2xl` 14px. Check a radius against its BOX, not the token name.

## 4. Type, copy, chrome

- Page H1 = `.text-display`; overline kickers = `.text-eyebrow` (uppercase). Card-title eyebrows
  are **bold brand blue** ("Aufgabe:", "Dein Satz"); inner section labels stay muted uppercase.
- A bold colored word-label ("Hinweis:") beats an `i` icon.
- **Microcopy budget:** eyebrow ≤ 2 words, title ≤ 5 words, NO description sentence under section
  headers. Interface copy is chrome, not content.
- **No em dashes** anywhere in user-facing copy (founder rule; rewrite with period/comma/colon).
- In-app language is German; English via the hold-to-peek pattern (`EnPeek`), never sticky
  toggles. Public/landing pages are English-first.
- Positioning copy: Genauly is a "smart companion", never a textbook replacement; no unprovable
  claims.
- Numbers in stat cards ride `tabular-nums`.

## 5. Reusable building blocks (use these, don't rebuild)

- **`LibrarySwitcher` sliding-pill switcher AS the page header** (no HubHero/H1 above the
  Bibliothek-family tabs). Mechanism: `useSlidingPill` (one always-mounted pill; never
  per-segment `layoutId` crossfade).
- **`ViewSwitcher`** (icon-only 36px squares, white sliding pill).
- **`FilterRail`** (desktop rail / mobile `layout="panel"` behind a toolbar toggle; sticky Üben
  footer + result count; internal scrolling with bounded max-height, `max-h-[45dvh]` mobile).
- **Scope hierarchy: Branche → Lebensbereich → Thema → Unterthema** as dropdowns with live counts
  (`ScopeMultiSelect` / the Schreiben single-select listboxes). **Learner-facing groupings have
  exactly TWO categories, Berufsleben and Alltag** (`lib/lifeAreas.ts`; only `beruf` is
  Berufsleben, every other domain folds into Alltag). The five content domains are an authoring
  grain, never a heading; a third group anywhere is a bug (founder s181). **Dropdowns over pill
  walls** for long lists; facet pills only for short attribute sets (≤12 options).
- **`LifeAreaPills`** (founder s184): the Lebensbereich pair, in EVERY filter and Aufgabe rail, in
  one fixed slot directly below Branche (or leading, on a rail with no Branche dropdown). Single
  select that toggles off, so the resting state is "beides" and there is no third "Alle" pill; the
  visual recipe is the FilterRail facet pill verbatim, content-sized and wrapping, because the pill
  rows two sections below it in the same tile are exactly that. An equal-width 2-column grid was
  tried and truncated "Berufsleben" against a four-digit count in the 16rem rail. Never add it to a
  surface whose content carries no Thema (Grammatik): that is dead chrome, not a filter.
- Sticky mobile bottom action bar for the primary action; `SearchField` transient toolbar search;
  `DataTable` for tabular views; `UmlautKeys` for German text inputs; `Logo` component for any
  logo spot (never boxed).
- Modals/sheets inherit `bg-dialog-overlay` + `shadow-elevated-soft` from the shared dialog
  primitive. No flat `bg-black/*`, no `backdrop-blur`. The backdrop is what separates a white card
  from a near-white page (the soft shadow is invisible over it), so its alphas are 0.48/0.76 and
  never overridden per dialog (s169, `docs/areas/BRAND.md`).

## 6. Per-section anchors

**Bibliothek (`/library`) is the reference.** Four tabs, view switcher per tab, FilterRail both
breakpoints, transient search outside the filter tile, Üben footer. Wörter cards: quiet headline
(creature + word left, bookmark right), example gets room, foot row plural-pill left + speak
button right. Noun+verb combos live in Kollokationen, never as Wörter entries.

**Schreiben (`/writing`) is a Bibliothek extension.** 4-segment switcher as header (capped
`lg:max-w-xl`, centered). Kurz/Lang land straight on an Aufgabe + editor (never a theme-picker
interstitial); dice re-rolls in scope; "Aufgabe: <Thema>" eyebrow bold brand blue, Ziel stated
once. Fokus: detected form = white pill + green dot; correction card = Original/Korrigiert toggle
(coral marks on Original, green on Korrigiert) + Himmelblau fix tiles + "Neuer Satz" outline
button on the tile row. Rails are Himmelblau tiles with header reset icons. **A correction looks the
same on every surface** (s172): Fokus, the Kurz/Lang result and the Verlauf all render it from
`src/features/writing/correction.tsx` (toggle, coral/green marks, fix tiles with the category eyebrow +
struck original + "→" + green fix). Never hand-build a fourth copy; extend that module. In Kurz/Lang the
EDITOR CARD becomes that correction card once an evaluation lands (founder pick A,
`preview/kurz-lang-korrektur*.html`), so the result card stays tip-only. **Verlauf** (picked
s171, variant C "Entwicklung zuerst"): a "Deine Entwicklung" card leads with per-category monthly
bars + trend arrows (down = green, up = amber) and a "X % weniger" success badge, then a COMPACT
row list (date · Thema · Kurz/Lang · Himmelblau weakness chip · chevron; on mobile the row stays ONE
line by shortening the date and dropping the Thema, which returns inside the expanded area) whose
disclosure holds, in event order, the Aufgabe, Dein Text, then the Tipp beside the practice CTA. The
monthly bar layout is ALWAYS the card's shape, even with one month of data; only the arrows and the
badge wait for evidence. Fokus sentences share the SAME list and the same correction language (their
chip carries the correction count, or a green "fehlerfrei"), because one Verlauf means a correction
reads identically whichever trainer produced it. A trend is only ever claimed from months with
≥2 texts; months without texts print "–".

**Fortschritt (`/analytics`)** (picked s171, variant 3 "Kompetenzkurve"): the Überblick block is
unchanged; directly below it a Kompetenz curve (mastered words / Can-Dos over time, green
milestone dots) replaces XP as the headline, XP stays in Details. Dranbleiben = Prüfung
(countdown + last simulation, only while the exam date is ahead) + a writing-aware Diagnose +
Nächste Quest. The curve card shows the direction only; absolute counts stay on the tiles.

**Praktisch (`/`).** One centered column all breakpoints (two-column desktop was rejected);
Üben = the soft SVG city map in a white `bg-surface` mat with neutral grey border, Spielen = the
compact NeulandHub in the SAME mat geometry; both tiles land at the same screen position, page
fits a phone viewport without scrolling. The Trainieren/Spielen toggle shares the squircle-track +
sliding-pill mechanism with `LibrarySwitcher`/`WritingModeSwitcher` (s170), content-sized rather
than full width since it is only two segments. Bottom nav: 5 locked slots, label only under the
active tab in neutral dark grey, compact flat `bg-border` squircle backdrop, two-tone + neon route
marks at full opacity. Structure is locked; don't touch without an explicit founder request.

## 7. Landmines (shipped-then-reverted; do NOT reintroduce)

- White filter tile (reverted to grey `bg-muted`, s104) and, equally, grey slab rails on Schreiben
  (must be Himmelblau, s149).
- Gold/reward color on domain-building windows (lit = white, s65).
- Full-column-width 4-label switchers ("too big", s149) and fully-round toggles/pills (s154).
- Accent-blue nav labels ("not premium", s141); butter yellow as layout chrome (s140).
- Glow-heavy CTAs (s136) AND over-flattened "premium-less" surfaces (s137): both extremes rejected.
- Disabled-at-default reset/action buttons (s149, s151).
- Per-segment `layoutId` pill crossfade (stutters; use `useSlidingPill`, s114).
- Scale animations on framer `layout`/`Reorder` elements (s26).
- Theme-picker interstitial before writing tasks (s147); section-description filler sentences;
  repeated Ziel/word-count labels.
- Colored per-section mat borders on Praktisch tiles (neutral grey won, s90); two-column desktop
  dashboard (s90).
- Backdrop-blur / flat-black modal overlays (locked dialog recipe instead).
- **Accent-colored borders anywhere** (s168) AND grey outlines on accent rails (s169): the accent
  is a fill with no visible edge at all; shadow does the separating.
- **A caption line that swaps content between states** (s169): the pinned bottom line under the
  Schreiben action cluster is the Art. 50 note in every state; transient hints go in the card.
- **Per-cell borders as a column separator** (s169): with an odd number of items the rule stops
  mid-grid. Use one absolutely-positioned full-height line.
- **A page that scrolls the moment it opens** (s169): size the elastic element (writing field, tile
  column) to the room actually left and let it fall below its preferred floor. A resting scroll on a
  freshly opened trainer is a bug, not a trade-off.
- **Sticky bottom chrome on Schreiben** (s168): sticky parks at the end of the content whenever the
  page fits, so it sits at a different height per mode and drifts per task. Fixed, always.
- **The Fokus mobile rejects (four preview rounds, s168):** the grammar controls as a PANEL anywhere,
  in-page-expanding or pop-up alike (they read as settings, which was the original bug); renaming
  the feature away from "Grammatik"; one-tap action chips (`→ Passiv`, breaks once forms combine); a
  card-per-attempt transformation timeline (page scroll by design); the dials in the bottom thumb
  slot (four floating controls, no bar behind them); a deep navy "stage" tile (the app's only dark
  surface in light mode).

## 8. Deeper record

Why a rule exists: `docs/DECISIONS.md`. Verbatim founder wording: `docs/SESSION_PROMPT_LOG.md`.
Surface-by-surface specifics + current facts: `docs/areas/` (BIBLIOTHEK, SCHREIBEN,
PRAKTISCH-NAV, GAME, BRAND, COMPONENTS) with the always-on summary in `CLAUDE.md`. Approved
mockups: `preview/` (`-r2`/`-r3` = iteration rounds; generators `gen-*.mjs` sit beside outputs).
When this file and CLAUDE.md/`docs/areas/*` disagree, those are newer law; update this skill in
the same PR.
