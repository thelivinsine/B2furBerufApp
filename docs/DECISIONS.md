# Decisions & rationale (the "why" behind the locks)

_This file holds the **historical rationale and session-by-session evolution** behind decisions that
`CLAUDE.md` now states as short current-state rules. It exists so `CLAUDE.md` stays lean (it loads on
every turn), while the full "why" is one click away when someone needs it. Split out 2026-07-05._

**How to use this:** `CLAUDE.md` is the operative source of truth (what to do / not revert). When a rule
there needs its backstory, or you are tempted to undo a "locked" decision, read the matching section
here first. For the day-by-day prompt trail see `docs/SESSION_PROMPT_LOG.md`; for session narrative see
`docs/PROJECT_STATUS.md` and `docs/archive/PROJECT_STATUS_ARCHIVE.md`.

---

## UX overhaul (session 47–49) — phase-by-phase record

The app was migrated from a "drawer of 11 tools" to a **session-first learning loop** (four zones:
Heute · Bibliothek · Anwenden · Fortschritt). Founder-approved plan (`docs/archive/UX_OVERHAUL_PLAN.md`),
executed phase by phase. All phases below are **shipped**; `CLAUDE.md` carries only the current state
plus the two still-live operative notes (standalone `/quiz` status; `SHOW_PRACTICE_TABS` flag).

- **Phase 0 (quick wins) ✅** — banner demoted to Heute-only + persisted dismissal; header slimmed to 4
  mobile widgets; theme `blurbDe` + grammar `purposeDe` German copy (EN kept as data); "Deine Themen" +
  "Schnelle Runde" renames; Fortschritt cold-start goal card.
- **Phase 1 (session engine + Heute) ✅** — `engine/session.ts` composer + `SessionPlayer` + `/session`
  route + Heute hero/Situationen; Schnellwiederholung is the ~5-min preset.
- **Phase 2 (global search + Tier-0 defaults) ✅** — `lib/search.ts` `searchAll` + `GlobalSearch`
  (header icon / Sidebar / ⌘K); Bibliothek lists default to the learner's CEFR band + 1
  (`defaultVisibleBands`).
- **Phase 3 (library soft-merge + travelling scope) ✅** — `useLibraryScope` + `LibrarySwitcher` +
  `ScopeChip` + "Üben" scoped-session buttons. **Founder chose the soft merge:** the single `/library`
  URL, old-route redirects, Quiz retirement, and removing the Vokabeltrainer in-page tabs were DEFERRED
  to Phase 5 (with the nav re-map), not done earlier.
- **Phase 4 (Fortschritt + Can-Do) — SHIPPED (session 48).** The `canDo.ts` bank (25 milestones,
  AI-drafted then founder-reviewed and approved 2026-07-02, provenance `review_status: "verified"`) +
  linter rules, plus the Fortschritt UI: a Can-Do milestone section (the page's lead, checked off per
  theme via each statement's `threshold` vs theme mastery), a diagnose card (weakest CEFR band/theme
  with a one-tap "Session dazu starten"), and the theme mastery grid relocated off Heute (which now ends
  with a quiet "Alle Themen" link to `/vocabulary`).
- **Phase 5 (Anwenden hub + nav re-map + facet registry) — COMPLETE (session 49).** Done: new
  **Anwenden hub** (`/anwenden`, 3 cards → Sprechen/Schreiben/Prüfung); **Bibliothek hub**
  (`/library?tab=woerter|kollokationen|redemittel|grammatik`) folding the four library surfaces into one
  URL, with the old routes (`/vocabulary`, `/collocations`, `/redemittel`, `/grammar`) redirecting in
  (query params preserved) and `LibrarySwitcher` now tab-based; the founder-unlocked
  `DEFAULT_PINNED_TABS = ["/", "/library", "/anwenden", "/analytics"]` four-zone nav (nav-items collapsed
  to Heute · Bibliothek · Anwenden · Fortschritt · Einstellungen, with custom `/library` + `/anwenden`
  route marks in `route-icons.tsx`); a **settings-store persist migration** (`version: 1` +
  `ROUTE_SUCCESSOR`) that remaps existing users' pins/More-order onto the new zones (a pinned
  Wortschatz→Bibliothek, Simulation→Anwenden); the **central facet registry** (`src/lib/facets.ts`,
  `vocabFacets`/`collocationFacets`/`redemittelFacets` + `*_FACET_IDS`) that replaced the per-page facet
  defs, dropped the 100-option Verb facet, and codified the ≤12-option rule (`MAX_FACET_OPTIONS`); and
  the removal of the Vokabeltrainer's in-page Karteikarten/Quiz tabs (behind the reversible
  `SHOW_PRACTICE_TABS = false` flag in `VocabularyTrainer.tsx`) so the Vokabeltrainer is the
  browse/inspect surface and focused practice flows through the toolbar's **Üben → composed session**.
  The s26–28 bottom-bar mechanics stayed locked and untouched throughout.

---

## Mobile bottom tab bar — reference detail & mockups

`CLAUDE.md` carries the locked rules; these are the deeper references behind them.

- **Reference mockups / preview sheets:** `preview/route-icons-two-tone-neon.svg` (two-tone+neon marks),
  `preview/route-icons-preview.svg` (all marks), `preview/nav-cloud-refined.html` (squircle size),
  `preview/nav-cloud-gradients.html` (gradient studies; founder chose "G1 flat & even" before the flat
  fill superseded gradients in s29).
- **Neon second-tone examples:** home indigo + neon-cyan body; Wortschatz indigo `#5b5be6` + cyan
  `#10b7cf`; Kollokationen amber + neon-yellow ring; Fortschritt sky → neon-cyan bars; Einstellungen
  slate gear + neon-blue centre. Base layer reads the route accent (`c` in `route-icons.tsx`); the neon
  tone is hard-coded per mark in the renderer.
- **Sheet 2D drag-sort mechanism:** each tile is a `motion.div` with `layout` + `drag`;
  `reorderDuringDrag` finds the tile the pointer is over (by `getBoundingClientRect`) and splices the
  dragged path into that slot; `layout` animates the rest. Order persists in
  `useSettingsStore.moreOrder`; `setMoreOrder` keeps pinned routes in their slots and rearranges only the
  non-pinned ones.
- **Why opacity-only enter/exit (s26):** animating a transform (scale) on a `layout`/`Reorder` element
  fights framer-motion's layout projection. It froze the infinite jiggle until the next re-render and
  shifted icon positions on long-press. Keeping enter/exit on `opacity` fixed both.
- **Why `BottomTabBar` reads the store directly:** an earlier `localOrder` cache + `useEffect` sync layer
  was the root cause of the "icon added but didn't appear" bug. Never reintroduce that buffer.
- **Evolution of the icon treatment:** s25 gave every route one unique accent + custom SVG (replacing the
  old split where only four "hero" routes had custom SVGs, the rest lucide). s27 removed the 38% inactive
  dimming (it "read as blurred"), made marks two-tone+neon, and switched backdrops from section-tint to
  flat grey. s28 made the backdrop a compact squircle that hugs the icon (not a full-slot pill or raised
  dome) and limited the browse-sheet cloud to the selected tile. s29 dropped the backdrop gradient for a
  single flat `bg-border` shade.

## Domain-building marks (session 65) — founder-tuned visual language

The six city buildings (`src/components/city/domain-buildings.tsx`, redesign Phase 3.1/3.2) went
through two founder-feedback rounds. The resulting rules are locked; the "why":

- **Soft corners only.** The first cut had square body corners and pointed triangle roofs; the founder
  flagged them as off-language ("the existing icons don't have sharp corners"). Every rect now carries
  an `rx` (bodies 0.9–1.2, bands 0.6–0.85, windows 0.4–0.6), and pointed shapes (Bürgeramt pediment,
  Wohnhaus roof, Prüfungshalle dome base) are rounded via a same-color stroke with
  `strokeLinejoin="round"` on a slightly inset path. Bodies extend up BEHIND their wider
  cornices/roofbands (draw order matters) so rounded corners leave no white notch at seams. Don't add
  sharp-cornered shapes to these marks.
- **No gold windows; lit = white.** The lit state originally rendered windows/emblems in the Phase-2.3
  reward-gold token. The founder rejected it and chose the white-window look as lit. Lit = bright
  white openings; unlit = the same openings as dark shades (`#0c1222` at ~0.24–0.3, "lights off").
  Reward-gold (`--reward`/`--reward-bg`) is therefore reserved for **loot/combo moments only**; the
  unit test in `tests/domain-buildings.test.tsx` pins that neither building state uses the token. Do
  not reintroduce gold into the building marks.
- **Ground-aligned normalisation.** Buildings normalise like route icons (bounding box + weight) but
  anchor to a common ground line (`groundTransform`) instead of a centred box: a city strip needs one
  street level with a varied skyline. Skyline height variety is deliberate, not an inconsistency.
- **Review workflow.** The static sheet `preview/domain-buildings-preview.svg` (generator
  `preview/gen-domain-buildings-preview.mjs`, light/dark × unlit/lit) is the founder-review artifact;
  the TSX is the geometry source of truth and the two are kept in sync manually.

## Game art direction (session 72, 2026-07-06) — modern pixel style blessed, GBA look rejected

The pre-G1 art blessing for the German life story RPG (`docs/strategy/GAME_CONCEPT.md`) ran as
three mockup rounds on the Anmeldung vertical slice, all zero-spend and hand-authored in code
(the sandbox network policy blocks kenney.nl / OpenGameArt / itch.io, so no packs could be
downloaded; the generators live next to the PNGs in `preview/game-pixel-mockups/`).

**Round 1 (scenes 1–3):** GBA-authentic look (240x160, saturated primaries, black-bordered
boxy chrome, ALL-CAPS bitmap text): Termin parody website, Bürgeramt waiting room, Frau
Schmidt dialogue battle. **Round 2 (scenes 4–6, founder request):** three more takes on the
Frau Schmidt boss — Schalter close-up with a 2x bust, Konjunktiv-II crit moment, victory loot
card (the loot card is the one mockup using reward-gold, honoring the app's loot-only gold
rule). **Round 3 (scenes 7–8, founder feedback):** the same battle restyled modern.

**Founder verdicts (recorded so future sessions do not relitigate):**

1. **2D pixel art form: APPROVED.** The founder called rounds 1–2 "good in being honest to
   the art form". The pixel medium itself is settled.
2. **GBA-era styling: REJECTED for shipping.** Verbatim: the "color and design language feels
   quite outdated. It reminds me of the 90's." Do not ship the saturated primary palette,
   hard black UI borders, boxy dialogue chrome, or ALL-CAPS-everywhere text of scenes 1–6.
   Those mockups stay in the folder as the art-form proof, not as style reference.
3. **Modern restyle: BLESSED.** Verbatim: "i love this new mock up style!" The reference
   image is `preview/game-pixel-mockups/scene7-modern-hell.png` (generator: `scenes3.py`).
   Its defining traits, which G1/G2 art and UI must match:
   - muted contemporary palette (greige walls, light oak floor, sage plants, mustard/denim
     clothing) with **brand indigo #5b5be6 as the single loud accent**;
   - relatable modern set design (today's Bürgeramt: wood floor, monstera, bookshelf, white
     desk with monitor), not 90s-institutional grey;
   - sprite outlines in soft warm darks, never pure black;
   - **app-language UI over the pixel world:** floating rounded cards with soft drop shadows,
     thin rounded progress bars, level chips, pill buttons (primary action filled indigo),
     bottom sheet with grab handle, sentence case (no ALL-CAPS chrome);
   - UI rendered at half-size pixels (world 240x160, UI 480x320) — the crisp-UI-over-chunky-
     world convention of modern indie pixel games (Eastward, Unpacking, Coffee Talk register);
   - LimeZu "Modern Interiors/Exteriors" remains the reference register when packs are bought
     in G2; select against scene 7, not scenes 1–6.
4. **In-game dark mode: DEFERRED, future to-do.** The founder liked the dark variant
   (`scene8-modern-dunkel.png`) but ruled it "a bit of a stretch because of limited budget".
   v1 ships light-theme-only game scenes; dark mode is parked in the `PROJECT_REFERENCE.md`
   backlog. Do not spend art or engineering budget on game dark mode without a new founder
   go-ahead.

## Game title (session 72, 2026-07-06) — "Neuland" approved

The founder approved the game's title from the `GAME_DESIGN.md` naming proposals: **"Neuland"**
(verbatim: "neuland is good"). Use it as the game's name in design docs and content. The city
name "Neustadt" and the NPC cast names remain proposals the founder has not objected to; treat
them as defaults until renamed, not as locked.

## Chapter-1 mission list (session 73, 2026-07-06) — approved as-is

Before G1 content authoring (the open decision 3 in `GAME_DESIGN.md` §13), the six-mission
Kapitel-1 "Ankommen" list was presented for sign-off and the founder chose **"Approved as-is"**:
1.1 Willkommen in Neuland (airport tutorial, meet Jonas) · 1.2 Der Fahrkarten-Automat (first
battle vs the parody DB Automat) · 1.3 Die SIM-Karte (SIM-Vertrag key item) · 1.4 Der erste
Einkauf (supermarket, Pfand) · 1.5 Ein Dach über dem Kopf (Wohnungsgeberbestätigung setup) ·
1.6 BOSS Die Anmeldung (the five-scene vertical slice, Meldebestätigung reward). G1 shipped 1.6
playable (`src/data/missions.ts`); G2 authors 1.1-1.5 against this list. Do not re-litigate the
list without a new founder request.

## Game interaction & pixel-UI rules (session 74, 2026-07-06) — founder playtest round 3

Six-point founder feedback on the G1 slice, applied same-session (PRs #343/#344/#345). The
rulings below are locked; the research that grounds them is `docs/strategy/
MISSION_ACTIVITY_RESEARCH.md` and the founder-facing `CHAPTER1_GAMEPLAY_DECK.html`.

1. **The bag is with the player at all times** (Pokemon rule): a HUD bag slot in every mission
   scene, and bag items must be USEFUL. Document demands in battles are `ask` nodes answered by
   opening the Tasche and tapping the item; a wrong item costs Geduld and earns a deadpan
   reaction line; "Hab ich nicht dabei" concedes into the fetch-quest branch. Never render a
   document demand as a sentence-choice list again.
2. **The bag popup is drawn as the backpack itself** (founder: "outline of the pop up window in
   the shape of a backpack"): carry handle, leather dome, amber zip band, cream interior.
3. **English is a rationed game resource, not a button.** The always-on E toggle was removed;
   the Wörterbuch bag item holds 3 charges per mission and one charge reveals English for the
   CURRENT scene only (`MissionRun.dictUses`, `useDictionary`). This deliberately supersedes
   the s63 "D/E on every line" promise INSIDE missions; the rest of the app keeps tap-to-gloss.
4. **Full-screen, one visual language.** The founder rejected app-style cards floating around a
   small stage as "a patchwork of different arts": the mission player is now a fixed full-screen
   game layer (dark surround, edge-to-edge stage) and every in-game surface speaks the pixel
   language (chunky outlines in the sprite outline color #463c44, hard offset shadows, near-
   square corners, RPG name plates). This AMENDS the scene-7 blessing's "app-language UI" trait
   (s72 record above): the layout conventions stay (cards, pills, sheet, indigo accent) but
   their skin is pixel-game, not app chrome. Light-theme-only rule unchanged.
5. **World scale is locked** (founder: chairs read bigger than the player, player squished):
   on the 240x160 world a standing adult is 28-32 px (3.5-4 heads), seated ~20 px, waiting-room
   chair ~19 px, desks 18-24 px in the 3/4 view, doors 40-44 px. The table lives at the top of
   `preview/game-pixel-mockups/welt_assets.py` with a committed `proportions-check.png` sheet;
   G2 pack purchases must be checked against it.
6. **Battle composition:** opponent + her bar hold the TOP band, the player sprite + Mut bar
   hold the BOTTOM band, and people stay at ONE human scale (an attempted foreground zoom of
   the player was explicitly rejected: "keep the people's sizes more or less the same").

## Bibliothek classification axes & control choices (session 84, 2026-07-09) — locked

Source: `docs/plans/BIBLIOTHEK_CATEGORIZATION_AUDIT_2026-07-09.md` (expert panel + red-team) and the
five founder decisions recorded in `docs/plans/BIBLIOTHEK_CATEGORIZATION_IMPLEMENTATION_PLAN.md`.
Shipped across PRs #379–#385. Do not re-litigate these without a founder request.

### The axis model (three families)
- **TOPIC, one spine at three grains: Domain → Thema → Sub-theme.** "Situation" IS the sub-theme grain
  of Thema, never a separate axis (the retired `workSituation` facet duplicated themes, e.g. its
  `meeting` value restated the `meetings` theme). Domain groups themes and is surfaced as group
  headings inside the theme dropdown; the Mode lens pre-selects which domains show ("Mode on top").
- **CONTEXT: Branche** (`sector`) = the industry a learner is EMPLOYED in, orthogonal to Thema (the
  same topic happens in every industry). Decide by ROLE: customer/citizen doing an errand → Thema;
  the field you work in → Branche. So "Bank & Finanzen" is a Thema (Alltag errand); a finance
  INDUSTRY would be a differently-named Branche value. Never reuse a label across the two axes.
  "Büro" was deleted (every industry has an office: category error). Branche is PARKED: field + Pflege
  tags stay, the facet sits below the coverage floor until a sector has real depth.
- **ATTRIBUTES: CEFR, Register, Wortart, Häufigkeit, Lernstand.** Intrinsic properties, multi-select
  refinements. CEFR ≠ Häufigkeit (difficulty is not commonness; a word can be easy but rare, or hard
  but everyday). Register is 2-tier (neutral/formell; "diplomatisch" folded in: diplomacy is a
  pragmatic function, not a register; an Amtssprache axis is PARKED as a v2 content project).
  Lernstand is per-learner (reads the FSRS map), so it is built in the page, not the registry.

### Control-choice rule (mirrored in the `lib/facets.ts` header)
Segmented control = content kind (the 4 tabs). Primary dropdown = the one single-select "where am I"
cut (Thema/Kategorie/Gruppe). Facet pills in the bottom sheet = orthogonal multi-select attributes,
≤12 options; a page with exactly one small dimension gets an inline chip row instead of a modal
(Redemittel Register). Sub-theme picker = the dependent topic grain, never a facet.

### Honesty rules
- **Coverage floor** (`MIN_FACET_COVERAGE` 15% / `MIN_FACET_VALUES` 2 in `lib/facets.ts`): a facet the
  bank barely uses hides as a WHOLE; visibility follows coverage, never the Mode lens. A near-empty
  filter reads as broken, not filtered.
- **Häufigkeit** is machine-derived (generated `src/data/frequency.ts` from wordfreq Zipf). Items
  below Zipf 1.5, including out-of-corpus compounds, get NO bin: absence of corpus evidence must never
  be labelled "Fachsprache". Never claim "die häufigsten deutschen Wörter" (the bank is curated by
  exam word-fields, not corpus rank); the axis is Häufigkeit, not Wichtigkeit.
- **Cut, don't hoard, dead axes:** `counterpart`/`taskType` (0-tagged forward-declares with no
  authoring plan) were cut in the P3 resolution; the linter errors if rows reintroduce them. Re-declare
  properly if an authoring plan ever exists.

## Heute polish + header/bottom-bar cleanup (session 86, 2026-07-10) — founder-approved

A "panel of experts" review of the Heute screen led to a redesign. The founder approved **Option B**
(a goal-ring "Momentum" layout) from a 3-mockup HTML Artifact and locked a set of chrome cuts.

**Why these calls:**
- **Header down to logo · streak · account.** The top row carried six controls; two (theme, mode) are
  set-once and don't earn permanent header space. Search left the mobile header (⌘K + the desktop Sidebar
  keep it there; the founder accepted no mobile global-search entry — Bibliothek has its own per-list
  search). Theme moved into the `AccountMenu` dropdown; **Modus moved into Einstellungen → Lernen** (the
  founder explicitly did NOT want it in the account dropdown). The "Genauly" wordmark is redundant on an
  internal screen, so it's mobile-hidden.
- **Mehr → Einstellungen; the More sheet is gone.** `navItems` has only 5 routes and Settings was the sole
  unpinned one, so the sheet existed essentially to hold Settings. Making Settings the fixed last tab
  orphans nothing. With no sheet there is no add/remove, so the three content sections are always visible;
  the earlier "add a tab" affordance and the Settings "Navigation anpassen" pin-picker were removed. The
  founder wanted reordering kept, so it survives as a hidden **long-press easter egg** (jiggle + drag only).
  This is an authorized change to the otherwise-locked mobile bar (the locked rules in CLAUDE.md were
  updated, not silently broken).
- **Dedupe every number.** Streak/goal/due each appeared 2–3× and the stat labels truncated
  ("Tag…/Wör…/Fälli…"). Option B shows each once: streak in the header, goal in the ring, and a real
  full-width session button. Per the founder's final tweaks the session subtitle is **minutes only** (no
  "~", no due count) and the account icon dropped its sync dot.
