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

## Heute Üben tab → Neuland city-map path (session 86, 2026-07-10) — founder-approved

Follow-up to the Heute polish. The founder felt the Option-B goal ring on the Üben tab **repeated
progress** already shown in the header (streak) and the stats line, so progress moved to Fortschritt and
the Üben tab was reimagined as a **learning path in sync with the Neuland game**.

**Why these calls:**
- **Üben orients, it doesn't re-report progress.** The daily-goal ring moved to Fortschritt (`/analytics`).
  The Üben tab now answers "where am I on the journey, what's next" instead of showing XP again.
- **A pixel bird's-eye city map (Concept C).** Chosen from a 3-concept preview, then iterated: the first
  render was too crude (labels covering art, no legible route, hard-edged fog), so it became a **proper
  street-grid city** with background buildings, one clear glowing route, numbered stop-pins with names in a
  **legend below the map**, and a **"Du bist hier"** pin. Founder later cut the fog entirely (upcoming route
  is just a dotted line) and centered the legend. Treatment stays flat top-down pixel (canvas drawn low-res,
  upscaled crisp) to read as a city map.
- **Synced to real missions.** Kapitel-1 stops (Bahnhof/Laden/Zuhause/Amt) are bound to real mission ids;
  stop state derives from `missionsDone`, so the map advances as the learner plays. The "Als Nächstes" tile
  routes the next mission into `/welt?mission=<id>`. Authored per-chapter for now (extend `STOPS`); the map
  is lazy so Heute keeps no content bank on its eager path.

## Branche (sector) axis ACTIVATED (session 94, 2026-07-12) — founder decision, supersedes the audit park

The 2026-07-09 categorization audit parked the `sector` facet (§5, §11 Q1: 4% coverage, per-industry
packs judged off-strategy for a sector-neutral exam product). On 2026-07-12 the founder un-parked it:
Genauly's audience (starting with the founder's German course: architecture, software engineering,
material science, mechanical engineering, manufacturing, gastronomy, beauty, medicine, sports,
transportation) needs the Bibliothek as their single source of truth for professional German, which an
office-only library cannot be. Full plan: `docs/strategy/BIBLIOTHEK_SCALEUP_PLAN.md`.

- **What stays law from the audit:** Branche = where you work, Thema = what you are doing; sector packs
  are tags spread across existing themes (the care-pack pattern), never new themes; no label reused
  across the two axes (`transport` is deliberately not "Logistik"); visibility follows the coverage
  floor, never a manual toggle. The activation worked exactly as the floor was designed to: content
  crossed 15% and the facet reappeared on its own, zero UI changes.
- **The taxonomy:** 11 values (care, trades, it, retail, hospitality + new engineering, construction,
  production, transport, beauty, sports), within the ≤12-option rule. A 12th is fine; a 13th forces a
  merge or a dropdown (ask the founder).
- **Redemittel stay sector-free.** Professionals need phrases to talk ABOUT their field, not per-field
  phrase variants; the new `professionalIntro` category delivers that. No `sector`/`themeId` on
  Redemittel (audit rationale unchanged).
- **Floor watch:** collocations sit at 15.6% sector coverage, just above the 15% floor. Bulk-adding
  untagged collocations without tagged ones would silently hide the Branche facet again.

## FilterRail visual redesign + count-beside-Üben (session 103, 2026-07-12) — founder-approved

The s91/s92 rounds settled on a flat, solid-grey `bg-border` tile for the Bibliothek filter rail
("every section shares the top row's shade" — see `docs/areas/BIBLIOTHEK.md` for the current
FilterRail rules; s91/s92 history below). In the s100 UI-refinements review the founder called that slab ugly against every
other white content card on the page, and separately asked why the result count jumps to the top of
the panel when it expands instead of staying beside the Üben button.

- **The fix (`docs/plans/UEBEN_UI_REFINEMENTS_PLAN.md` work items 4+5, shipped s103):** the tile
  (both the desktop rail and the mobile panel) became a standard content card, `bg-surface` + a
  visible `border-border` + `shadow-soft`, the same recipe every other card on the page already
  uses. Unselected facet pills moved from stark `bg-white` to `bg-muted` so they read as part of the
  card, not a separate layer. Scope section labels (Branche/Thema/Unterthema/Kategorie/Gruppe) picked
  up the same uppercase eyebrow style as the facet labels, for one label voice down the tile.
- **Count beside Üben, always:** the old layout hid the result count in an expanded-only first row
  and only showed it beside the Üben button while collapsed (so it visibly jumped position on
  expand/collapse). The expanded first row was deleted; the count now renders unconditionally in the
  footer next to Üben in every state. The reset icon moved out of that deleted row into the header
  (a `<div>` wrapping the expand/collapse toggle plus the reset icon beside it, mirroring the mobile
  panel header's "label left, icons right" layout), so it too is now always reachable instead of only
  while expanded.
- **Not a re-litigation of s91/s92:** the collapsible-tile mechanism, the per-section pins, the
  sticky Üben footer, and the panel/rail layout split are all unchanged. This is a visual reskin of
  the tile plus a control-placement fix, not a structural rework.

## Multi-select scope dropdowns + Bibliothek filter polish (session 104, 2026-07-13) — founder-approved

A pre-demo founder round the day of the presentation. Two structural decisions plus a batch of
visual fixes.

- **Scope dropdowns are now MULTI-select. This reverses the s84 lock** ("Primary dropdown = the ONE
  single-select 'where am I' cut … never multi-select"). The founder asked directly for multi-select
  on Branche/Thema/Unterthema/Kategorie/Gruppe, and picking `AskUserQuestion` chose "All scope
  dropdowns". Radix `Select` is single-value, so `FilterRail` grew a hand-built checkbox popover
  (`ScopeMultiSelect`); `RailPrimary` moved from `value`/`onChange(v)` to `values: string[]`/
  `onChange(values)`. Semantics are OR-within (an item matches if it carries ANY selected value), the
  same as a facet, so the dropdown/facet distinction is now purely about control shape (long/grouped
  option lists get a dropdown; short attribute lists get pills), not single-vs-multi. `matchesSector`/
  `sectorFirst`/`themeGroupsForMode` all take arrays. **Dependent single-value machinery degrades
  gracefully:** sub-theme drill-down and the travelling `useLibraryScope` only engage with exactly one
  active Thema, and a library Üben session collapses multi-Thema to the first value (the composer
  biases one theme) while forwarding every Branche. The s84 control-choice rule text in
  `lib/facets.ts` was amended in place.
- **The filter tile went back to subtle grey (`bg-muted`), reversing the s103 `bg-surface`.** s103
  made it white to stop it reading as an "ugly grey slab"; the founder then found white-on-white gave
  too little contrast against the white content cards. The resolution keeps BOTH concerns: the tile is
  the recessed `bg-muted` grey (the same shade the ViewSwitcher / page-toggle track uses, so it is a
  familiar surface, not a slab), while every control INSIDE it is white (`bg-surface` scope dropdowns
  and unselected facet pills), so the controls pop off the grey. This is the stable answer to the
  contrast question that s92→s103 kept flipping on.
- **The rest of the round (no decisions, just fixes):** reset clears scope dropdowns too; the rail
  fills the viewport vertically with a slim visible scrollbar on overflow; the "Alle X" dropdown
  numbers show the option count (15 Branchen) not the item total; desktop search grows inline in the
  toolbar row (no third line); Wörter facet order puts Wortart up top and Stufe last; Redemittel lost
  its per-category card section headers (they read as page headers) for a flat grid, with Kategorie
  moved into the filter as pill facets; Grammatik hub cards show one clean emerald pattern instead of a
  truncated variant list, and drill options got a fill so they read as tappable.

## Schreiben = Bibliothek extension + founder design preferences (session 149, 2026-07-23) — founder-approved

The whole Schreiben section was rebuilt as a visual EXTENSION of the Bibliothek over five founder
rounds (2 preview rounds, a 13-point fix list, a full audit with a P0/P1/P2 action list, then
execution of all of it; PRs #648-#651). The shipped state is specced in `docs/areas/SCHREIBEN.md`.
This entry records the REUSABLE design preferences the founder expressed across those rounds, so a
future surface starts from them instead of rediscovering them:

1. **New sections extend the existing design system.** Reuse the Bibliothek building blocks
   (sliding-pill switcher as page header, FilterRail tile language, scope dropdowns, facet pills,
   sticky mobile action bars) rather than inventing a new style per section. Same categorization
   hierarchy everywhere: Branche → Thema → Unterthema; in learner-facing daily-life groupings,
   Gesundheit folds into Alltag.
2. **Previews before implementation.** For design work, ship founder-reviewable HTML mockups
   (preview/) built from the real tokens, iterate on the feedback list, and only then implement.
3. **No redundancy in copy or chrome.** A fact appears once (the Ziel range lives on the Aufgabe
   card, never repeated at the editor; the mode name never repeats under the toggle). No
   explanatory filler lines in the UI (the "15-20 Aufgaben" hint was cut). Compact chrome: toggles
   sized to their content (capped, centered), standard 40px icon buttons.
4. **Dropdowns over pill walls for scopes.** Long option lists (themes) belong in grouped
   dropdowns with internal scrolling, not wrapping pill grids; rails must never grow past their
   tile.
5. **Every visible control must visibly do something.** A reset that is disabled at the default
   state reads as broken; prefer always-active controls with a real effect (reset = clear scopes +
   draw a fresh task). Zero-yield options grey out with honest counts instead of dead-ending.
6. **Color language:** Himmelblau accent tiles for selection rails (never grey slabs there);
   content on WHITE cards (never grey washes, e.g. the AI transform card); card-title eyebrows
   bold brand blue ("Aufgabe:", "Dein Satz"), inner section labels muted; a bold colored word
   label ("Hinweis:") over a generic i icon; green dot = detected fact (never a blue fill/ring);
   legal/AI disclaimers as standalone muted lines below cards, never inside them.
7. **Consistent placement + motion.** Primary actions sit in the same place across sibling modes
   (sticky bottom bars on mobile everywhere); micro-motion is subtle and shares one timing family
   (directional tab slides like the Bibliothek, 0.12-0.18s panels/popovers, reduced-motion safe).

## Nav-icon family harmonization + pinned Fortschritt (session 158, 2026-07-24) — founder-picked

The founder flagged the Schreiben pencil as "not harmonious" with the other bottom-bar marks. Root
causes identified and accepted: it was the only thin diagonal mark in a row of chunky upright
shapes, and its second tone (#fb7185) was nearly its body rose (#f43f5e), so it lacked the bright
two-tone pop every sibling had. Four preview rounds followed (one per tab, each variant rendered
inside the real 63px bar in both themes, picks by letter). Decisions, all founder-picked and now
shipped (PRs #679-#683):

1. **Schreiben = Federspitze (pick E).** A fountain-pen nib in brand blue with neon-cyan breather
   hole + slit. The route accent moved rose → brand blue `#3D74ED` WITH the mark: the founder
   explicitly wanted "similar colors as other icons, not red". Feather/quill and upright-pen
   alternates were rejected in favor of the nib. **Superseded s170 (pick AB): a pencil on the
   diagonal**, blue body + neon-cyan tip, same accent. Twelve of the marks proposed across s158
   and s170 were pens and all of them stood upright; round 4 offered a sheet-with-pen, a pilcrow,
   a clipboard and this one. The diagonal is the only slanted silhouette in the bar, so it is
   found without learning a new shape.
2. **Praktisch = Wegweiser (pick I).** Two direction boards on a post (blue + cyan), replacing the
   compass but keeping its "finding your way in real life" motif as a solid upright silhouette.
   Stadt, Zuhause and Route alternates rejected.
3. **Bibliothek = Buch mit Lesezeichen (pick P).** A closed book with a cyan bookmark ribbon,
   replacing the lying three-book stack. Open book, shelf and library-building alternates rejected.
4. **Fortschritt = Fortschrittsring (pick S).** A near-closed progress ring with neon endpoint,
   replacing the bar chart. Kurve, Gipfel and Pokal alternates rejected.
5. **Trainieren toggle.** The Praktisch dashboard toggle "Lernen" renamed to "Trainieren" with the
   lucide Dumbbell restored (the toggle's pre-s147 icon), per explicit founder request.
6. **Fortschritt is pinned left of Einstellungen for every user.** The bar's reorder easter egg now
   covers only Bibliothek + Schreiben; Fortschritt joined Home and Einstellungen as a fixed slot,
   and older persisted orders normalise at read time. This amends the locked bar structure on an
   explicit founder request.

Method notes that worked (keep for future icon rounds): show every variant inside the real tab bar
next to the already-picked marks (the founder judges the future bar, not a lone glyph), continue
variant letters across rounds (A-T) so picks stay unambiguous, and keep all marks two-tone with a
neon-cyan companion on the 20x20 grid with `NORM` optical normalisation.

## Schreiben AI-disclaimer relocated + "Feedback" pill label (session 160, 2026-07-24) — founder-requested

Founder, verbatim across two prompts: move the Fokus KI-Hinweis "to be horizontally in-line with
feedback button for the computer view ... for mobile view ... condensed as much as possible and
reside below the auswerten button ... with just 'Mehr'"; then, correcting round 1's bordered bar:
"I like the floating button as before and the text should just be moved downwards to the horizontal
level of the feedback button ... For mobile view ... bring the feedback button next to the auswerten
button. Both the buttons should be floating not in a separate section along with the short text below
the buttons." Follow-up: "kurz and lang should also have same design. Also, for the floating button
'Mit KI gebaut · Feedback' - make it just 'Feedback' with an icon ... Do this across the app".

Decisions:
1. **The Schreiben Art. 50 disclaimer is now bottom-anchored, not centered-in-flow.** On desktop it
   is a `fixed bottom-4` line level with the floating Feedback pill (no bordered bar); on mobile it
   is a condensed "KI-geprüft, kann Fehler enthalten. Mehr" line under the floating action buttons.
   This **explicitly overrides** the general design guideline that disclaimers sit "centered in
   normal flow (not bottom-pinned)" (`design` skill §2.6) — but ONLY for the Schreiben trainers
   (Fokus + Kurz/Lang). The earlier "bottom-pinning was tried and reverted" note (s151) is
   superseded here by direct founder instruction; do NOT re-center these two.
2. **Round 1 (a bordered bottom bar holding text + pill) was rejected.** Keep the existing floating
   pill untouched; only the text drops to its level. No separate section/border.
3. **Mobile action bars in Schreiben lose their bar chrome.** The Feedback icon button floats beside
   Auswerten/Korrigieren (both squircle), condensed note beneath. Applies to both trainers.
4. **The feedback affordance label is shortened to "Feedback" app-wide** (was "Mit KI gebaut ·
   Feedback"): pill default, in-session button, icon-button aria/title, admin placeholder. Icons
   unchanged; remote-config `feedback.label` still overrides the pill.

Shipped in PR #688 (squash-merged to `main`, 2026-07-24).

---

## Control-center comment saves reliably next to approve (session 164, 2026-07-24)

**Prompt (verbatim):** "In the control center, if I write a comment and then reject or approve, are
the comments being saved? it's unclear" → then "do both" (fix + run `pnpm apply:reviews`).

**Finding.** The `/sources/werkbank` workbench row exposes only a verified **checkbox** (= the
`approve` decision) and a **Notiz** text field. There is **no reject / needs_fix control** in the UI,
even though the `ReviewDecision` type supports them. The note commits on blur/Enter; the checkbox
saves separately. Both went through `useWorkbench.onChange` (`src/features/legal/Sources.tsx`), which
read its base row from the memoized `reviews` snapshot and `upsert`ed the WHOLE row. Typing a note
and then ticking approve fired two writes off the same stale base, so the approve write (carrying the
pre-note empty comment) overwrote the note, in local state and in Supabase.

**Decisions.**
1. **`onChange` merges from an always-latest `reviewsRef`, not the memo closure**, and pushes the ref
   forward on a successful save, so a sibling write already sees the committed row.
2. **Writes are serialised per `content_id`** via a `writeChains` promise map: back-to-back edits to
   one row run strictly in order, so the approve write merges on top of the note write's result
   (and vice-versa). Neither field can clobber the other regardless of blur/click ordering.
3. **Row-level call sites stay unchanged** (`AdminWorkbench.tsx` still sends `{ verified }` and
   `{ comment }` separately) so the pinned `onChange(id, { verified: true })` test contract holds.
4. **A real reject/needs_fix control was NOT added** in this pass (would be a design change needing a
   founder-reviewed preview); logged as a follow-up. Today "reject" is not expressible in the UI.

---

## Review harmonised into the Control Center (session 164, 2026-07-24)

**Prompts (verbatim):** "Can you merge and harmonize the source list with checkboxes page in sources
page by bringing it to control center? Integrate all the features from the source list page to the
existing review page in control center. Aim for the highest quality." · "Can you add a save button
for the Notes field - increase the notes field width if needed." · "Make sure there's no redundancy
in the review mode/prufmodus/warteschlange page. No need of previews anymore. Implement the design
directly and merge to main."

**Context.** Founder review lived in two places: the Control Center's keyboard cockpit
(`/admin/pruefen`) and a separate full-register table on `/sources/werkbank`. A preview offered two
integration layouts; the founder picked **Variant A — two areas**.

**Decisions.**
1. **One Prüfen page, two segments.** `/admin/pruefen` heads with a two-segment sliding-pill switcher
   (`useSlidingPill`, the locked mechanism — no per-segment `layoutId`): **Warteschlange** (priority
   queue + keyboard cockpit) and **Alle Inhalte** (the full `AdminWorkbench` table). `?view=table`
   deep-links the table. `/sources/werkbank` is **retired**; `/sources` links admins into the
   Control Center instead.
2. **One shared review store.** `useWorkbench` was extracted to
   `src/features/legal/useWorkbench.ts`, exported, and is now the single review state behind BOTH the
   cockpit and the table — a decision in one shows in the other. `onChange` is decision-centric
   (`approve` / `reject` / `needs_fix` / null-to-clear) and serialised per content_id.
3. **Reject in the table + a note Save button.** The table cell replaced the approve-only checkbox
   with a segmented **Freigeben / Ablehnen** control (reject was previously impossible in the table),
   widened the note field, and added an explicit **Save button** that appears once the note is edited
   (still saves on blur/Enter). The button appears only when dirty, so it never sits disabled at rest
   (the "no dead controls at default" rule).
4. **No redundancy on the queue page.** Dropped the description sentence under the "Prüfen" header
   and the duplicated open-count; the as-of date appears once (preview-list caption), the open count
   once (start card).

## s166 — The mobile floating action cluster on Schreiben (opacity is the contract, not a bar)

**Prompts (verbatim):** "[screenshot] there's a button overlap issue here. Fix it." · "make sure the
fixes are applied across the app" · "increase the contrast of the grammatik and aufgabe wahlen
buttons in schreiben section." · "no need of a new preview. Refer to the previous designs and take my
preference into account"

**Context.** The founder's screenshot of `/writing` (Lang, mobile, dark) showed the Feedback pill,
the Auswerten button and the card's "Noch N Wörter schreiben …" hint all drawn on top of each other.
The cluster is `sticky` and carries **no bar chrome** by the s159/s160 decision, so it floats
straight over the content cards — that part is not the bug and was not touched.

**Decisions.**
1. **The no-bar-chrome rule stands; opacity becomes its contract.** Because there is no bar, nothing
   in the cluster may be see-through. `src/features/writing/floatingCluster.ts` holds the two class
   names: `floatingSlot` (opaque `bg-background` behind each control) and `floatingNote`
   (`bg-background/90` + `backdrop-blur-sm` behind the caption, the same treatment the four other
   mobile bars use). `--background` equals the page stops, so both are invisible against the page
   ground and only mask where they float over a card. This is what makes the founder-approved
   chrome-less look survivable — do not "fix" a future overlap by re-adding a bar.
2. **Transient hint lines ride the cluster, never the card tail.** The "Noch N Wörter …" line is the
   honest reason the primary button is inactive, and a card-tail line lands exactly under the pinned
   cluster. It now shares the cluster's single caption slot with the Art. 50 note: hint while the
   text is too short, note once prüfen/auswerten is possible, never both. The card keeps the hint on
   `lg:` only, where there is no cluster. Bottom padding was considered and rejected: a bottom-pinned
   sticky element floats over content at every scroll position except the very end.
3. **The panel toggles wear the rail's Himmelblau.** "Aufgabe wählen" and "Grammatik" were the shared
   `outline` variant, whose `bg-surface/50` fill reads as a ghost on the page ground. Closed, they now
   use a new **`accent` Button variant** (the tile language of the rail each one opens, per the s149
   "Schreiben rails are Himmelblau, never grey" rule); open, they keep the solid `default`, so the
   open/closed distinction survives. Brand blue was rejected: the Auswerten/Korrigieren CTA sits in
   the same viewport and a second blue control would compete with it.
4. ~~**A Himmelblau border needs `accent-ink` in light mode.**~~ **SUPERSEDED by s168 below**, which
   removed accent borders altogether. Kept for the measurement, which still holds: `--accent` is a
   77%-light sky, so NO alpha of it clears the 3:1 UI-component floor against the near-white light
   ground (1.31:1); `accent-ink/70` reached 3.07:1. The s168 answer was simpler — stop outlining in
   accent at all.

## s168 — Schreiben on mobile: pinned chrome, measured heights, and the Fokus dial tile (2026-07-26) — founder-approved

**Context.** Three founder reports in one session, all on `/writing` on a phone: the action buttons
drifted up and down between modes and tasks; the writing field left dead space or overflowed; and
the sentence-transform feature, which IS the Satzlabor, went undiscovered.

**Decisions.**
1. **Bottom chrome is `fixed`, not `sticky`.** A sticky element only sticks once the page actually
   scrolls, so whenever the content fit the viewport the cluster parked at the END of the content —
   a different height in Kurz than in Lang, moving with every Aufgabe. Fixed pins it once and for
   all; the trainer carries the matching clearance instead. Applies to Kurz/Lang and Fokus alike.
   The KI-Hinweis line is fixed on its own, locked just above the nav in every state.
2. **All fixed mobile chrome is portalled to `<body>`.** WritingHub slides tab panels with an `x`
   transform, and a transformed ancestor becomes the containing block for its `fixed` descendants,
   so without the portal every pinned layer re-anchors to the panel mid-slide and any measurement
   reads the wrong reserve on mount. This is a general trap, not a Schreiben quirk.
3. **Heights are measured in JS (`useFillEditor`), not expressed as a `dvh`/flex chain.** The
   trainer sits inside AppShell → WritingHub → AnimatePresence, none of them height-constrained;
   constraining them would have changed every other Schreiben surface. The hook fills to the bottom
   chrome at rest, grows with the text, then scrolls internally.
4. **When space runs out, the AUFGABE gives way, not the page.** A long Aufgabe (Inhaltspunkte) can
   exceed half a phone screen. Rather than shrinking the writing field to an unusable slot or
   scrolling the whole page, the card's prompt region caps by exactly the shortfall and scrolls
   internally, with the eyebrow + dice row always visible. Floors on both sides (field 160px / 22%
   of viewport, card region 96px) mean sub-660px viewports still page-scroll a little; that is
   structural and accepted.
5. **Desktop caps the resting field height; mobile does not.** Filling a tall desktop window read as
   "one giant empty box" (founder). Kurz = max(176px, 22% of viewport), Lang = max(252px, 32%), so
   the two modes read as different sizes and neither reaches the bottom chrome. On mobile the space
   is genuinely scarce, so it still fills.
6. **The accent is a FILL, never an outline.** Every filter/selection rail and the button that opens
   it wears the neutral `border` token; the Himmelblau fill is untouched. A blue wash inside a blue
   edge read as too loud, and this is the same edge the Bibliothek FilterRail and every card already
   use. Supersedes the s166 `accent-ink/70` workaround entirely. Fix tiles and Verlauf detail tiles
   keep their accent edge on purpose: they are content, not rails.
7. **The Fokus transform feature is a FLOW STEP, not a filter — so its controls live on the
   sentence.** This was the whole diagnosis, reached only after a first preview round was rejected.
   The old mobile UI put a "Grammatik" toggle exactly where Kurz/Lang put "Aufgabe wählen", so
   learners read it as a filter and never opened it. Moving that same panel elsewhere (preview round
   1) did not help, because a pill panel still reads as settings. The shipped answer: a **Himmelblau
   dial tile below the sentence card**, one dial per grammar axis, each showing what the sentence
   currently IS (green dot = detected form) and opening a picker to change it. Every corrected
   sentence therefore arrives already classified, which teaches the taxonomy as a side effect.
8. **The transformed sentence appears where the correction does, behind a third view segment.**
   Original / Korrigiert / **Umgeformt** on one centered toggle; the separate transform card is
   desktop-only now. "Neu" (not "Neuer Satz") sits in the card's top-right corner, the same spot
   Kurz/Lang use for the dice. Corrections render as two text columns with a vertical separator —
   **no chip backgrounds on mobile** (founder amendment), colors and formatting kept.

**Rejected along the way (four preview rounds; do not reintroduce):** moving the Grammatik panel
below the field but keeping it a panel, whether it expanded in-page or as a pop-up (round 1, both
rejected); renaming the feature "Satz umformen" (round 2 proposal, founder kept "Grammatik");
one-tap action chips (`→ Passiv`), which break as soon as forms combine; a transformation timeline
that stacks a card per attempt (re-introduces page scroll by design); the dials in the bottom thumb
slot (best ergonomics, but four floating controls with no bar behind them); and a deep navy "stage"
panel for the Grammatik tile, which would have been the app's only dark surface in light mode.

## s169 — Schreiben follow-up: no resting scroll, one bottom-chrome geometry, edgeless rails (2026-07-26) — founder-requested

**Context.** The founder reviewed the shipped s168 rework on a phone and sent an eight-point list.
Two points were bugs (a persistent page scroll on all three trainers; the action buttons jumping
between Fokus and Kurz/Lang), the rest were finishing work on the Fokus sentence tile and the rails.

**Decisions.**
1. **A freshly opened page never scrolls, and the elastic element pays for it.** `useFillEditor`
   handed the writing field its floor (`max(160px, 22vh)`) even when the screen did not have the
   room, which is exactly where the ~60px of resting scroll came from: the floor was written as a
   guarantee when it is only a preference. Order of concession is now Aufgabe card (its prompt
   region caps + scrolls internally, down to 72px) → field (down to `HARD_MIN` 72px) → page scroll,
   and in practice the page never gets there on a 360x740 screen or larger. Typing grows the field
   again immediately, so a short resting field costs nothing.
2. **Fokus's tile column gets a fixed `height` before a correction, a `minHeight` after.** A minimum
   alone let the tiles' natural height win: on a narrow phone the dial row wraps and the legend runs
   to three lines, and the column silently outgrew the screen. A fixed height forces the writing
   field to absorb it. After a correction it must be a minimum again, because a long list of fixes
   has to be able to grow the page. Verified headless from 320x568 to 412x915 with and without
   simulated safe-area insets.
3. **The three trainers share ONE bottom-chrome geometry.** Both clusters sit at
   `bottom-[calc(nav + safe-area + 2rem)]` and both carry the KI line as a separately fixed line at
   `+0.5rem`. Kurz/Lang used to keep its note INSIDE the cluster, which pushed its buttons ~13px
   below the Fokus ones; that difference was visible as a jump on every tab switch. The lift came
   down from 2.5rem to 2rem to pay for the extra reservation this costs Kurz/Lang.
4. **The "Noch N Wörter" hint belongs in the card being typed in, under the umlaut keys.** This
   reverses the s168 rule that parked transient hints in the cluster's caption slot. Two reasons:
   the slot's job is the Art. 50 note, and a bottom line that swaps content between states reads as
   chrome that cannot be trusted; and the original hazard (a card-tail line landing under the pinned
   cluster) is gone now that the cluster sits 2rem higher and the field is sized to end above it.
5. **The rails have no visible edge at all.** Third and final answer after an accent edge (s166) and
   a neutral grey one (s168): the border wears the fill's own colour and `shadow-soft` does the
   separating, exactly like the Bibliothek word cards the founder pointed at. Inner dividers are
   tinted to match, so no hard grey line survives. Applies to `WritingRail`, `GrammarRail`,
   `GrammarDials` and the `accent` button variant that opens them. Label contrast is untouched
   (4.72:1 light / 7.71:1 dark), so this is a pure edge change.
6. **The Fokus sentence tile is two stacked regions.** Sentence centered in a `flex-1` region, the
   detail block anchored under it. One centered group put all its slack above the sentence, which
   the founder read as "more space before the sentence than after". The horizontal rule under the
   sentence is gone with it: the gap separates them.
7. **The correction separator is one full-height rule, not a per-cell border.** With three fixes the
   per-cell `border-l` stopped after row 1 and looked broken. An absolutely-positioned
   `inset-y-0 left-1/2` line spans whatever the grid ends up being. The eyebrow also hugs its own
   fix now (`mb-0.5`) while the row gap widened (`gap-y-5`), so each category + edit reads as one
   unit rather than an evenly spaced list.
8. **Waiting is shown in the tile the answer will appear in.** A skeleton of three tapering rounded
   bars with a slow Himmelblau sweep (`.fx-skeleton-bar`, reduced-motion safe) replaces the sentence
   line while the KI works, during both the correction and a transform. The spinning dial and the
   "Wird geprüft …" button label were the only signals before, and the founder did not read them as
   "something is happening".

## s169 follow-up — the Grammatik legend, the Aufgabe pop-up, and the shuffle button (2026-07-26) — founder-requested

1. **The Grammatik tile's legend sits at the tile's foot.** Dials centered in the room above,
   legend on the bottom edge. Same two-region split as the Fokus sentence card, so the two tiles
   rhyme instead of each centering their own contents.
2. **The Aufgabe card gets an expand button that opens the task in a pop-up.** This is the
   consequence of the s168/s169 capping rule: the card is deliberately capped so the page fits one
   viewport, which means a long Aufgabe gets cut mid-line, so there has to be one place that shows
   all of it. The founder pointed at the round-1 Fokus preview's "Variante A" as the reference: the
   app's standard centered dialog, soft darkening, no blur, explicitly NOT a bottom sheet (the
   retired "Mehr" sheet is on the landmine list). The pop-up repeats the card's eyebrow and Ziel
   line so it reads as the same object, not a new surface.
3. **Shuffle replaces the dice, and neither icon button wears a box.** A border around a 40px icon
   inside a card competed with the card's own edge; the hover tint is affordance enough, and it
   matches the rail header icons. The shuffle glyph is point-symmetric, so the existing half-turn
   per roll still reads as motion and settles back into the same shape.

## s169 second follow-up — button order and a dialog backdrop that actually separates (2026-07-26) — founder-requested

1. **Shuffle left, expand right** on the Aufgabe card. Founder's order. It also happens to be the
   defensible one: the button that CHANGES the task keeps away from the card's outer corner, the one
   that only opens it takes the corner.
2. **The dialog backdrop deepened from 0.30/0.62 to 0.48/0.76.** Founder: "the pop up window doesn't
   have any contrast with the background." Measured in the running app rather than judged by eye: a
   white card on the near-white page ground came out at **1.9:1** against the old backdrop, because
   the card's `shadow-elevated-soft` (2.4% and 6% alpha) is invisible over a dark wash, so the
   backdrop is the ONLY thing defining the card. 0.48 puts it at **3.3:1**, clear of the 3:1 UI
   floor, and dark mode stays comfortable (its `--shadow` is near-black, and the 18%-L card still
   separates). Changed on the shared `bg-dialog-overlay` token, never per dialog: the locked recipe
   exists so every dialog in the app reads the same, and a one-off override here would be exactly
   the parallel style rule zero forbids.

## s170 — Praktisch toggle joins the squircle language; Bibliothek icon reverted; Fortschritt gets the Pokal (2026-07-26) — founder-requested

1. **The Trainieren/Spielen toggle now uses the same squircle-track + sliding-pill mechanism as
   `LibrarySwitcher`/`WritingModeSwitcher`**, in place of the older `rounded-full` track with a
   per-button `bg-surface` flag. Track `rounded-lg`, pill `rounded-md`, `useSlidingPill` measures
   the active segment so the white pill glides on a transform instead of two buttons independently
   flipping their background. Kept content-sized (`w-fit`, centered) rather than stretched full
   width: it is a two-segment toggle, and the landmine against full-width switchers (s149) was about
   a four-label row, not this one. The section-tinted icon + label on the active segment (blue
   Dumbbell / orange Play) is untouched, since that pairing is the Praktisch-specific part of this
   control, not the part the founder asked to change.
2. **Bibliothek's route icon reverts to the pre-s158 "stack of three books"** (`route-icons.tsx`,
   founder request): same geometry and colours as the mark shipped before the s158 "closed book +
   bookmark ribbon" pick replaced it. Restored verbatim from git history (`997e8a0`), including its
   `NORM` bounding box, rather than redrawn, so the optical size matches exactly what shipped then.
3. **Fortschritt's route icon becomes the "Pokal" (trophy/cup)**, option **T** from the session-158
   icon-preview batch (`preview/fortschritt-icon-vorschlaege.html`) that the founder did not pick at
   the time (S "Ring" won instead). Same mark, same `#0ea5e9` route colour, ported verbatim into
   `route-icons.tsx` with its own `NORM` box rather than reusing the Ring's. The progress-ring mark
   it replaces is not otherwise used elsewhere in the app, so nothing else needed a corresponding
   change.
- All three are direct, unambiguous ports of already-approved designs (an existing shipped
  component's toggle language; a previously-shipped icon; a previously-drawn-but-unpicked icon
  option), so this shipped without a new preview round. Verified in headless Chromium at 390×844
  (bottom tab bar, both new icons in their active and inactive states) and at 1280×900 (desktop
  Sidebar + the toggle), plus the full gate list.

## Session 171 (2026-07-26) — Verlauf + Fortschritt redesign

Preview-first round on the two surfaces with almost no recorded founder direction (the whole prior
record was "except the verlauf - I want to rework it", s155, and "Redesign fortschritt section - it's
chaotic at the moment", s105). Three variants each in
`preview/verlauf-fortschritt-redesign.html`; the founder picked **C** and **3**.

1. **Verlauf = "Entwicklung zuerst" (pick C).** A development card (per-category monthly bars, trend
   arrows, "X % weniger" badge) leads, over a COMPACT row list. Rejected: A "Korrekturkarten"
   (correction-first cards) and B "Archiv mit Filter-Rail" (rail + month groups). A's premise, showing
   the real correction, is still the top follow-up but needs a schema migration; C shipped against
   today's data without faking anything.
2. **Fortschritt = "Kompetenzkurve" (pick 3).** Mastered words / Can-Dos over time became the
   headline and XP moved into Details: XP measures effort and DIPS in a quiet week, which a plateau
   learner reads as regression, while mastered-words only rises (the LingQ known-words lesson).
   Rejected: 1 "Prüfungs-Cockpit" (full readiness bars per pillar) and 2 "Diagnose zuerst" (weakness
   tiles as hero) — though both donated pieces: the exam countdown and the writing-aware diagnosis
   shipped in compact form.
3. **Competence history is sampled, never reconstructed.** FSRS keeps only current card state, so
   "am I getting better" cannot be derived retroactively. Rejected: dating each mastered card by its
   `lastReview`, which would date a word mastered in May but reviewed yesterday as yesterday and fake
   a hockey stick. Instead `masteryHistory` samples daily (Analytics on view, session end via
   `lib/competence.ts`), the card degrades to a plain number under two samples, and pre-existing
   milestones carry `SEEDED_MILESTONE` so they never plot as "reached today".
4. **A trend needs a comparable month.** `MIN_TEXTS_PER_MONTH = 2`. Comparing against a month with a
   single text made an improving category (June 3 -> July 2) render as WORSENING in the first live
   check. Months without texts print "-", never 0: no writing is not the same as no mistakes.
5. **One weakness ranking, one home.** The duplicated writing-weakness panel in Fortschritt's Details
   (60 entries against Verlauf's 30, so the pages could name different top weaknesses) was deleted.
   The aggregate lives in the Diagnose card; the per-text artifacts live in Verlauf.
6. **The Kompetenz card owns direction, not the count.** Its footer states only "+16 Wörter diese
   Woche"; the absolute number already rides the Vokabeln tile and the Kompetenzen badge. A deliberate
   deviation from the approved preview (which printed both) in service of the no-redundancy rule.
7. **The Fokus filter segment was deliberately omitted** from Verlauf's Kurz/Lang switcher: Fokus
   persists nothing yet, so shipping the segment would have shipped a dead control.
8. **Verlauf's disclosure reads in event order:** Aufgabe (s167 `task_id`) -> Dein Text -> Tipp, with
   the Tipp deliberately adjacent to the practice CTA. The tip used to sit outside the disclosure and
   always visible; in a compact list the weakness chip carries that signal in the collapsed row.

Method note: items 4 and the label/arrow layout bug were caught ONLY by seeding a demo state and
screenshotting the REAL pages (light + dark + expanded row), not the static mockup. Verify in the
app, not only in the preview.

### s171 follow-up — storing the correction (same session)

9. **The corrected text is stored; the diff is not.** Only `corrected_text` goes in the row; the marks,
   categories and fix tiles are recomputed in the browser by `lib/wordDiff.ts` on every view. Storing a
   rendered diff would have frozen today's presentation into the database and cost tokens to produce.
10. **A minimal repair, never a rewrite.** The prompt forbids reformulating, shortening or adding
    content, and `sanitizeCorrected` drops a candidate that is much shorter (truncated), much longer
    (commentary or an echoed Aufgabe), or identical to the original (nothing to toggle). A diff against
    a re-imagined text is unreadable and teaches nothing.
11. **The verdict must survive a truncated correction.** Adding `corrected` roughly doubles output
    tokens, so `parseInsight` now falls back to salvaging `weakness` + `insight` out of a payload too
    broken to parse, and simply drops the correction. The learner never loses their tip because the
    optional extra did not fit.
12. **The insert steps DOWN through optional columns.** The function can be live before its column
    exists (CI deployed functions but skipped migrations until s179, and a deploy still lands before
    the migration in the same run): full row -> without `insight_en` -> without `corrected_text` ->
    base row. A lost row would also stop the daily limit counting,
    since that limit counts rows, so this protects a cost guardrail, not just a feature.
13. **`Zeichensetzung` became its own edit category.** A bare added comma normalised to the same word
    and therefore read as "Groß-/Kleinschreibung", which taught the wrong rule. Longer Verlauf texts are
    full of comma fixes, unlike Fokus's single sentences, which is why this only surfaced now.
14. **The diff runs per paragraph.** `diffWords` tokenizes on whitespace, so one diff over a whole
    letter rejoined salutation, body and sign-off into a single block. A changed paragraph count falls
    back to one whole-text diff rather than mispairing.
15. **The Kurz/Lang result card was left alone.** Showing the correction at the moment of submitting is
    the higher-value placement, but that surface carries the locked measured-height geometry from
    s166-s169, so it needs its own preview round instead of being changed as a side effect.

### s171 review round — the card's shape does not wait for data

16. **A surface must not change LAYOUT based on how much data exists.** The Entwicklung card used to
    fall back to totals-only bars until two months qualified, which meant the first thing a new learner
    saw was a card the founder had never approved. Now the monthly layout is always the shape, and only
    the *claim* (arrows, "% weniger" badge) waits for evidence. Generalise this: gate the assertion, not
    the design.
17. **On a phone the Thema badge loses to the weakness chip.** A row must stay one line; date + Art +
    weakness is what gets scanned, so below `sm` the date shortens and the Thema drops, reappearing at
    the top of the expanded area. It cannot simply vanish, because an entry written before s167 has no
    stored Aufgabe to name the topic.
18. **Headless Chromium clamps its viewport to 500px minimum.** `--window-size=390` lays out at 500 and
    crops the screenshot, which is indistinguishable from real horizontal overflow and nearly sent this
    session chasing a non-existent bug. Verify phone widths with the app in an iframe of the target
    width inside a wider window.

### s171 follow-up — the Fokus history

19. **No new schema was needed.** `sentence_checks` (migration 0009, s147) already stored every
    check's `source_text`, `corrected`, `has_errors` and detected `grammar`, with owner-read and
    owner-delete RLS. Reading what was already there meant the founder's existing sentences showed up
    the moment the feature shipped, instead of a history that starts empty. Look for the data before
    designing a table.
20. **One list, not a second tab.** A Fokus sentence and a Kurz text are both "something I wrote and
    got corrected", so they share one chronological list and one correction language; the kind lives in
    a badge and the filter. A separate Fokus history would have split the same question across two
    surfaces.
21. **The trend card stays Kurz/Lang-only.** It ranks the evaluator's single prioritised
    `WeaknessCategory`. Fokus yields diff categories (Rechtschreibung / Wortstellung / …) from a
    different taxonomy, so feeding both into one ranking would compare incomparable things.
22. **A swapped run is ONE word-order fix.** `wordDiff` reported "weil ich war krank." ->
    "weil ich krank war." as two spelling errors, because `collapseMoves` only caught a single word
    moving past matching tokens. A run whose words are a permutation now collapses to one
    "Wortstellung" change. This was visible in Fokus's live card all along; the history just made it
    impossible to ignore.

## Session 173 (2026-07-27) — a deploy never refreshes a learner's work away — founder-reported bug

Founder: "whenever the user is working on something like writing an email or practicing an Übung
session, the update takes place and the app refreshes! ... the uben session progress or the writing
draft is lost." The cause was `lib/swUpdate.ts` reloading unconditionally once a new service worker
took control, in particular on the next `visibilitychange` back to visible.

1. **A reload is gated on unsaved work, not on a timer.** The old code was already trying to be
   polite (reload immediately only inside the first 30s, otherwise defer). It deferred to the wrong
   event: "the learner came back to the app" is the single worst moment to reload, because it is
   exactly when someone returns to a half-written email. The condition that matters is not *when* but
   *whether anything would be destroyed*, so `hasLiveWork()` now gates every automatic reload and the
   update simply waits for a resume with nothing open.
2. **A module-level registry, not a zustand store.** The reloaders (`swUpdate`, `recover`) run
   outside React and must answer synchronously during an event handler. `lib/liveWork.ts` is plain
   module state with a thin `useLiveWork` hook for the React side.
3. **Claiming and persisting are BOTH required; neither is sufficient.** Claiming alone still loses
   work to the reloads nobody controls (chunk-load self-heal, manual refresh, iOS discarding the
   tab). Persisting alone still yanks the surrounding on-screen state away mid-task. The CLAUDE.md
   invariant therefore demands both of any new surface.
4. **sessionStorage for the Üben run, localStorage for the writing draft.** Not an implementation
   detail: it IS the resume policy. A draft is a document, so it should still be there tomorrow.
   A practice session is a moment, so resuming one the learner walked away from yesterday would be
   surprising; sessionStorage survives a reload of the tab and dies with it, which is exactly the
   "only recover from an interruption" semantics wanted, with no TTL guesswork.
5. **The session snapshot points at the next UNANSWERED block.** An answered block has already been
   written to FSRS and XP, so resuming onto it would grade it twice. `finish`/`Beenden`/`Neue Runde`
   clear the snapshot and set an `abandoned` ref first, since the unmount that follows would
   otherwise flush it straight back.
6. **The autosave is a SEPARATE store from `resumeDraft.ts`.** That file is the sign-in hand-off, and
   its `resume: true` flag is what makes AppShell redirect to `/writing` after the OAuth round trip.
   Reusing it for a continuous autosave would have turned every signed-in launch into a redirect.
7. **No "a new version is available, reload?" banner.** The complaint was interruption; a prompt is a
   second interruption, and it moves a decision the app can make correctly onto the learner. Revisit
   only if a deploy ever has to be forced out mid-session (e.g. a broken backend contract).

## s174 · Auth, sign-up and the profile-restore chain

Recorded because one latent fault produced three different-looking bug reports over an evening, and
the shape of the mistake is repeatable.

1. **A cloud profile is adopted on the strength of `settings.onboarded`, never a display field.**
   `mergeRemoteSettings` used to ask `if (!profile.name) return`, treating "has a name" as a proxy
   for "is a real profile". Onboarding collects goal, mode and level, and no name, so `name` was `""`
   for every account that has ever existed: the flag was pushed to the cloud and never read back.
   Because signing in wipes the local cache first (account isolation, deliberate), `onboarded` could
   ONLY come back from the cloud, so every sign-in on a device restarted onboarding and discarded the
   learner's level and goal. The lesson generalizes past this one line: when a check needs to know
   whether state exists, ask the flag that means that, not a field that usually accompanies it. A
   proxy that is right most of the time fails silently and permanently when it is wrong.
2. **Where a not-onboarded visitor goes depends on whether they hold a session.** Signed out belongs
   on `/welcome`, which exists to ask for a sign-up. Someone who just signed in belongs in `/start`.
   Sending an account holder to the marketing page is indistinguishable from a failed log-in, and
   was reported as exactly that.
3. **A successful sign-in from a public page must navigate.** The dialog closing was not enough: the
   landing page kept rendering its signed-out story ("Start free"), so a correct password produced no
   visible change. Sign-ins from inside the app deliberately do NOT navigate, since those surfaces
   already show the signed-in state and moving someone out of Settings would be its own bug.
4. **`needsConfirmation` comes from the error message alone.** An earlier version also inferred it
   from a response that carried no session, which would answer a correct password with "check your
   inbox". A sign-in with no error is a sign-in.
5. **"We sent you a link" may only be shown when a link was actually sent.** The sign-up panel was
   reused on the log-in path, where nothing had been sent, and it replaced the form, removing the
   only way in. `pending` (mail genuinely sent) and `resendFor` (log-in refused) are separate states
   for that reason.
6. **The confirmation link needs its own landing route.** Supabase's default template returns the
   session in the URL hash, which React Router wipes on mount, and the PKCE client does not look
   there. `src/lib/authCallback.ts` snapshots the parameters at module-eval time and `/auth/confirm`
   redeems them, accepting all three link shapes so the flow does not depend on which email template
   the project happens to have.
7. **Diagnostic note, for the next time a founder says a flow "doesn't work".** Three rounds were
   spent in the auth code because that is where the last change had been. The report that solved it
   ("with a secondary account, it redirects me to landing page") was a profile-restore symptom, not
   an authentication one. Ask what is on screen and where the learner ends up BEFORE re-reading the
   file you just edited.

## s179 · The Bibliothek grid, the AI's own voice, and a migration history that was never real

Four founder reports on the UI, one on the AI's language, and one ops question that turned into a
production finding.

1. **A sticky row either masks what passes under it or it does not exist.** The browse toolbar faded
   a `bg-background/90 backdrop-blur` band in on scroll, which the founder read as "a blurred band
   strapped across the page". It is transparent in every state now, and that decision has a cost
   that must be paid deliberately: **every control in that row needs a FULL-ALPHA fill**. The shared
   `outline` variant is `bg-surface/50`, so the first version shipped buttons the card titles printed
   straight through ("the buttons are illegible"). `BROWSE_TOOLBAR_BUTTON` exists to make that
   non-optional. A half-transparent control is invisible as a bug until the thing behind it moves.
2. **Clearance under a sticky header belongs in the sticky OFFSET, never in padding.** Padding applies
   in every state, so it also pushed the controls away from the tabs at the top of the page ("when at
   top it's way too much"). `top-[calc(4rem+…+0.75rem)]` does nothing until the row pins, and it
   leaves the flow height unchanged, so nothing shifts at the moment it pins. A conditional padding
   would have twitched the page.
3. **A card grid has ONE card height, not one per row.** CSS grid equalises rows, which reads as
   raggedness down the page. `auto-rows-fr` equalises the whole grid and stays content-driven, so a
   filtered set of short cards stays short and no fixed height can ever clip. The height is then set
   by the tallest card, which makes tall cards everyone's problem: the Wörter verb paradigm went to
   two label/value pairs per row for exactly that reason (209px → 189px). **With one height for the
   whole grid, top-aligned content leaves a hollow lower half**, so card content is centered on the
   three text-card tabs; anchored elements (the Wörter foot row, the Grammatik pattern chip) stay
   anchored.
4. **A cap is a starting view, never a dead end.** "+6 weitere" under the fix tiles hid corrections
   with no way back. The cap now decides only what the card opens with. Any future truncation that
   cannot be expanded is a bug, not a layout choice.
5. **Grading level and EXPLAINING level are different things, and only the first was ever specified.**
   The rubric graded at the task's CEFR band while the tip inherited whatever register the model
   chose, so a B2 learner was told about "Aufgabenerfüllung" and "Anredeform". Both prompts now demand
   simple A2 German with the jargon banned by name, plus the same sentence in equally simple English.
   **A prompt-wording change is a cache invalidation**: `PROMPT_REV` and `PROMPT_VERSION` were bumped,
   or the old prose would have kept being served from the hash cache forever.
6. **The DE/EN switch on AI feedback is a deliberate exception to "EnPeek, never sticky" (s93).** That
   law protects LEARNING content: a one-line gloss should be a peek, because a sticky English would
   let a learner dodge the German. A Kurz/Lang tip is a paragraph of INSTRUCTION about the learner's
   own text, and nobody reads a paragraph with a finger held down. The two are kept apart by their
   labels: the peek chip always reads "EN", the switch flips "EN"/"DE". Do not merge them.
7. **Shuffle clears the editor** (reverses the older "keeps typed text, a mis-tap must not destroy
   work" rule, founder-instructed). A new Aufgabe means a new text; leaving the old one there means
   writing the next answer around it. The rail reset and the scope-change redraw already cleared, so
   all three paths agree now.
8. **A limit that is only enforced is a trap; the number belongs on screen.** Fokus 10 / Kurz 4 /
   Lang 2 were invisible until a learner hit one and got "komm morgen wieder". Each trainer prints
   "Heute noch 7 von 10" beside the button that spends it, and **the number is the server's**:
   `check-sentence` and `evaluate-writing` return `dailyLimit`/`dailyRemaining` on every response, so
   an env-raised limit surfaces without a code change. Unknown renders NOTHING rather than a guess.
9. **Never repair a migration history on trust.** `supabase migration repair --status applied` skips
   that version's SQL forever. The remote had no history at all (everything to date was pasted by
   hand, which never writes to `supabase_migrations`), so the first `db push` tried to replay 0001.
   The bridge was done only after a schema probe printed what the database actually carried, **and
   that probe found migration 0010 had never been applied**: no `gdpr_events`, no `log_gdpr_event`,
   so the GDPR evidence counters had no store behind them. A blanket "mark everything applied" would
   have buried that permanently. `--include-all` is permanent for the same reason a repaired history
   exists: an older file can legitimately sit unrecorded below a newer applied one. **Keep every
   migration idempotent.**
10. **What an API cannot do is worth writing down.** The dashboard's saved SQL queries cannot be
    renamed from outside the dashboard: the Management API exposes `GET /v1/snippets` and
    `GET /v1/snippets/{id}` and nothing else, and a PATCH against all twelve returned 404. Tested,
    not assumed, and recorded in the workflow so nobody re-tests it.

## s180 · A filter that "prefers" is not a filter

The founder picked Textsorte "Forumsbeitrag" and got a Beschwerde an eine Fluggesellschaft. The
selector had two kinds of axis and only one of them was honest.

1. **Untagged-=-universal is a claim about the CONTENT, not a convenience.** It is true of Branche
   ("besprechen" really does apply to every industry) and false of Niveau and Textsorte (an untagged
   task is not "every level", and it is certainly not "every Textsorte"). s167 had already written
   that distinction down and implemented it as *prefer tagged, else fall back to untagged, else keep
   everything*, which is the same fallback wearing a different name. With 373 of 643 tasks untagged,
   the fallback fired on most themes: 84% of the pool under "Alle Themen + Forumsbeitrag"
   contradicted the filter. **A soft axis is a preference; a hard axis is a filter. Never implement
   one with the other's code path.**
2. **Two counting functions meant two answers to one question.** The rail counted Niveau/Textsorte
   with `countExact` (no fallback, honest) while the trainer drew with the fallback, so the option
   said 14 and the pool held 85. That is the exact rail-vs-engine split s167 fixed for Branche,
   reintroduced on the next axis. There is now ONE function, `countTasks`, and it is definitionally
   the draw pool. **If a count and a draw can disagree, they eventually will.**
3. **The order of a hard and a soft axis is part of the semantics.** Branche used to narrow first, so
   its preference could hide the only task carrying the chosen Textsorte. Soft axes apply LAST, over
   whatever the hard ones left. This also preserves the older invariant "Branche never empties a
   pool" for free: a preference cannot change emptiness.
4. **"No scope is ever empty" was the wrong invariant to defend.** It is what forced the fallback in
   the first place. Kurz + Forumsbeitrag genuinely has no task, and the honest answer is to say so
   and name the one filter to drop (`blockingAxis`), not to serve a Notiz under a Forumsbeitrag
   label. The escape hatches are the never-disabled generic "Alle …" option, the empty state's
   button, and the rail reset. Where a fallback exists, its callers stop being able to tell "here is
   your thing" from "here is something else".
5. **A regression test that asserts `some` pins nothing.** `tests/writingScope.test.ts` checked that
   a Textsorte scope contained *at least one* matching task, which was true throughout the bug's
   whole life. It asserts EVERY task now, over every format and both lengths, and a rendered-trainer
   test draws 20 times per scope. **For a filter, the assertion is always "nothing else got in".**
6. **A dropdown option that can never yield anything is not a zero-yield option.** `bewerbung` had
   sat in the rail at 0 since s167 because the list was hand-kept. Scope-dependent zeros grey out
   with an honest count (they teach: "exists, but not at this length"); a value the bank has never
   had is dead chrome, so the option list is derived from the bank and returns by itself.
7. **A coarse label must match by band, not by one of its halves.** The option labelled "B2" matched
   the tag `B2.1` with `===`, so the first `B2.2` task authored would have been silently unreachable
   from the UI *and* excluded from every Niveau filter. Matching goes through `levelBand`. The same
   sloppiness had the C1 option labelled "C1.1", a band `lib/cefr.ts` does not define.

## s180 (cont.) · Only fully briefed Aufgaben are served

Founder, on a screenshot of `wt_safety_l12` ("Verfasse eine kurze Unterweisung für neue
Mitarbeitende ...", one sentence, no Adressat, no Leitpunkte, no Niveau): **"this one has too little
description of the task. Check for such instances and make sure they're well described."**

The bank held two generations of task. 270 carry the whole exam brief (Adressat, du/Sie, 2 to 5
Leitpunkte, Niveau, Textsorte, word target); 373 are a single sentence from before that shape
existed. The bare ones failed in three ways at once, which is why they had to go rather than be
tolerated until the rewrite catches up:

1. **They downgrade the AI.** `evaluate-writing` is sent the Aufgabe so it can grade
   Aufgabenerfüllung, the thing an examiner checks first. With no Leitpunkte there is nothing to
   check against, so the learner silently gets grammar-and-vocabulary feedback instead. The learner
   cannot tell which kind of feedback they just got, or why it changed between two sessions.
2. **They are invisible to the filters.** Carrying neither `level` nor `format`, they can only ever
   be reached under "Alle Niveaus + Alle Textsorten", which is the DEFAULT, so 58% of first-visit
   draws served the one shape of task the rest of the product cannot reason about.
3. **They made the shipped product look unfinished**, which is how the founder found them.

The choice was "upgrade 373 tasks over several content sessions, serving them meanwhile" or "serve
the 270 good ones now". **Quantity was the cheaper thing to give up:** at the Kurz 4 / Lang 2 daily
allowance, 270 tasks is about two months of daily practice before anything repeats, so the number a
learner can feel is unchanged, while every single session gets better feedback.

**Retire from the surface, never from the bank.** The 373 stay in `writingPrompts.ts` with their
permanent ids AND their pool positions, because a draft ref is `{theme, index}` and a Verlauf row is
a task id: `taskAt` and `writingTaskById` index the FULL pool on purpose, so old work still resolves
to the Aufgabe it was written against. Each task returns to the draw the moment it is authored up to
the full shape, with no code change. That is the same id-permanence law every other bank follows.

**The zeros are the backlog.** Serving only the full shape leaves honest gaps in the rail (15 of 46
Unterthemen at each length, `bewerbung` at zero everywhere, `bericht` at C1 with one). Rather than
hide them, they are the content to-do list, and each one closes by authoring a task. A gap that is
visible gets filled; a gap papered over by a fallback stays forever, which is exactly how the
Textsorte bug survived three sessions.

## s181 (2026-07-31) - closing the Aufgabe backlog: three founder calls

**"The zeros are the backlog" worked.** The s180 decision to serve only fully briefed Aufgaben left
visible gaps instead of hidden substitutions, and one session later they are filled: all 373 bare
tasks authored in place, 74 added, bank 717 with nothing retired. The gaps closed *because* they were
visible and countable. Keep doing this: a fallback that hides a gap keeps it forever.

**Niveau mix: B1-heavy, then B2, thin C1** (target 35/50/15). Shipped at B1 307 / B2 302 / C1 108.
B1 sits above target on purpose. The excess is entirely Kurz tasks, and a 40-word task with three
Leitpunkte is B1 work whatever tag it carries. Promotion to B2 was restricted to Lang tasks in
demanding genres with 4+ Leitpunkte, so nothing wears a Niveau it cannot support. **Rule this sets:
never hit a distribution target by retagging.** Moving B2 to 50% is an authoring job, not a relabel.

**Bewerbung lives under Bildung**, in `bildung.anerkennung` and `bildung.weiterbildung`, at B1/B2/C1
in both lengths. The alternatives were spreading it across Beruf Themen (nobody looking for a
Bewerbung would search there) or a 21st Thema (a whole content system: vocab, collocations,
dialogues, a city building). It sits next to the recognition and further-training content a job
seeker is already using, and it needed no schema change. `bewerbung` had been dead chrome in the
Textsorte list since s167; the list is derived from the bank, so it came back by itself.

**Every Alltag task carries Branche tags** (founder, overruling this plan's own recommendation, which
was to tag only where work genuinely changes the task). The risk the plan named is real: a
Gastronomie-flavoured Kontokündigung is a name-drop and reads as fake. The answer was to make the tag
do work instead of dropping it on: **the work context is the REASON the everyday task is hard.**
Schichtdienst gegen Behörden-Öffnungszeiten, Montage ohne Wochentage, Ferntour gegen
Apotheken-Öffnungszeiten, Spätdienst gegen Filialschluss. Under that rule the tag earns its place in
the text, and a learner filtering by their own Branche gets Alltag tasks that sound like their life.
**If a future Alltag task cannot name such a reason, it should not carry the tag.**

**One deliberate zero kept: C1 + E-Mail (privat).** A private informal mail has no C1 exam analogue,
so it stays empty and greys out with an honest count. It is also the fixture that pins `blockingAxis`
in `tests/writingScope.test.ts`, which needs one genuinely empty scope to test against. Filling it
would cost the test its subject and the rail its honesty.

## s181 (2026-07-31) - exactly two learner-facing categories, everywhere

**Founder:** "There has to be only two overarching categories similar to the nodal graphs in
bibliothek. This has to be consistent across the app."

The content spine has five domains (`beruf`, `alltag`, `gesundheit`, `bildung`, `pruefung`) and that
grain is real for authoring, coverage reports and the city buildings. It had also been leaking into
the UI, differently on each surface: the Schreiben rail folded `gesundheit` into Alltag but not
`bildung` (so "Bildung & Sprache" was a third heading), the Bibliothek Thema dropdown grouped by all
five, and the graphs were already binary but called the second area "Privatleben".

**The law now: two areas, Berufsleben and Alltag, from `src/lib/lifeAreas.ts`.** Only `beruf` is
Berufsleben; every other domain folds into Alltag, and that default is what makes a NEW domain
unable to introduce a third heading anywhere. `themeGroupsByArea` is the single builder both the
Schreiben rail and the Bibliothek dropdown call, so the fold cannot drift back per surface.

**Naming: Berufsleben / Alltag** (founder pick over Berufsleben / Privatleben). It matches the
product framing (the workplace plus everyday life), CLAUDE.md's own wording, and the founder's
report; the cost is retiring "Privatleben" from the graph legend, which was a July decision. One
wording across the app beat keeping the older legend.

**The Mode lens survives unchanged.** It filters which themes appear INSIDE the two groups, never
which headings exist, and an actively selected theme is still never orphaned (s104).

**Where the five domains still belong:** authoring, `docs/areas/CONTENT.md` coverage, the city
buildings, graph clustering. They are a grain, not a heading. `tests/lifeAreas.test.ts` fails if a
third group ever reaches a dropdown.

## s181 (2026-07-31, end of session) - the Niveau mix is settled; quality is the open question

**Founder: "keep the Niveau mix as it is."** So **B1 307 / B2 302 / C1 108** is the intended
distribution, not a deviation to be corrected later. The 35/50/15 target that produced it is
retired; do not "fix" the mix in a future session. The reasoning that survives: promotion between
bands must follow what a task actually demands, never a distribution target, and a 40-word Kurz task
with three Leitpunkte is B1 work whatever number the rail would prefer.

**What that makes the real open question: are the labels honest?** The founder queued a thorough
audit of task quality and filter fit (scope in `docs/PROJECT_REFERENCE.md`). Coverage is proven and
gated; quality is unproven. A B1 tag on a task that reads as B2 is now a content bug, not a
distribution one.

**The exam-source items are parked, not blocked-and-waiting.** Founder: "it's not that important."
They stay in `docs/plans/SCHREIBEN-OVERHAUL.md` §12 and P0.3 with the reasoning intact, and unparking
them needs a purchase (the Goethe Modellsätze), not engineering. Nothing in the app depends on them,
so a future session should not treat them as a prerequisite for the quality audit: that audit uses
CEFR descriptors (cited, never reproduced), publicly published task-type descriptions and open
corpora instead.

## s182 (2026-08-01) - Redemittel: untagged means universal, so tagging stays selective

The content audit's P6 said "tag the 158 with `themeId`". Doing that literally would have been
wrong, and the reason is worth keeping.

**Two banks, two different meanings for the same field.** Wörter and Kollokationen carry a `themeId`
on EVERY item, so their Thema dropdown is a hard filter. A Redemittel is not that kind of object:
"Da bin ich anderer Meinung." belongs to no situation and works in all of them. Forcing a theme onto
it would have produced the sticker problem the founder rejected for Alltag Branche tags in s181, and
it would have made the phrase INVISIBLE under every other Thema.

**The rule as shipped:** a phrase is tagged only when it belongs to one theme's situation
(a Vortrag → meetings, a Bewerbungsgespräch → bildung, the Amt/Arzt/Wohnen/Bank/Reklamation packs →
their Alltag theme). Everything else stays untagged, and untagged is read as UNIVERSAL, exactly like
an untagged Branche: it shows under every Thema and in every learning mode. 111 of 220 phrases are
tagged. `tests/redemittel.test.ts` fails if a later pass blanket-tags the discussion functions.

**Why it mattered beyond the Bibliothek:** the session composer already had the mode rule
(`if (!r.themeId) return true`), so with zero phrases tagged it was dead code, and a personal-mode
session happily served "Vielen Dank für Ihre Aufmerksamkeit." The tagging turned an existing rule on
rather than adding one.

## s182 (2026-08-01) - Anwenden returns to the DESKTOP nav only (SUPERSEDED same day, see below)

Audit P4 asked for the Anwenden entry back (it was pulled from `navItems` on 2026-07-13 for the
demo), because Sprechen and Prüfung were reachable only from a dashboard recommendation and ⌘K.

**It is back in `navItems`, which is the desktop sidebar. It is deliberately NOT in the mobile
bottom bar.** That bar is a locked five-slot structure (CLAUDE.md, `docs/areas/PRAKTISCH-NAV.md`),
and a sixth entry means moving something or growing it. That is a founder call, not an audit
follow-through, so it is parked as an open action item instead of being decided by a session. The
consequence is stated rather than hidden: on a phone the Sprechsimulation is still hard to find.

## s182 (2026-08-01) - grammar groups are named after the group, not one member

Adding the B1 accuracy canon (audit P5) exposed two group labels that had been named after their
only member: `attributes` read "Partizipialattribute" and `prepositionalPronouns` read
"da-/wo-Wörter". With Adjektivdeklination and Komparativ/Superlativ joining the first, and Verben mit
Präpositionen joining the second, both labels became wrong: they are "Adjektive & Attribute" and
"Verben mit Präpositionen" now. The da-/wo-forms sit under the latter on purpose, because they only
exist BECAUSE a verb governs a fixed preposition.

**One new group, `tenses` ("Zeitformen"),** for the Perfekt/Präteritum choice. It fits neither
`future` (which is about Vermutung, not time) nor `verbPosition`, and it sits after `cases` on the
priority spine, with the accuracy levers rather than the polish.

**The drill law that came with it:** a topic is not practised by recognising an answer. Every B1
topic carries at least three PRODUCTIVE drills (no `options`, the learner types the answer), gated in
`tests/grammar.test.ts`. A productive answer must be unambiguous, since it is compared as one
normalised string. The 21 B2/C1 topics still cap at five multiple-choice drills; that is known, open
and written down, not an oversight.


## s182 (2026-08-01, founder) - the fifth zone is Prüfung, and Schreiben lives inside it

The open question from the P4 pass was whether the transfer hub belongs in the mobile bottom bar.
The founder first said yes ("yes keep it in the bottom bar"), which meant six slots. That version
was built and measured before anything was shown: at 320px it **overflowed**, because the longest
label ("Einstellungen") set a 73px floor on its slot and pushed the gear off screen. The floor was a
real bug (a flex item without `min-w-0` cannot shrink below its content, so the `truncate` on the
label never fired) and is fixed independently. But six slots on a 320px phone leaves 53px each, and
several labels truncate.

**The founder's answer, and why it is better:** "just move schreiben to anwenden and rename anwenden
as prufung." The bar keeps FIVE slots and gains a zone instead of a tab:
**Praktisch · Bibliothek · Prüfung · Fortschritt · Einstellungen.**

- The zone is now named for what it prepares you for, and it holds the three exam skills:
  **Sprechen · Schreiben · Prüfungssimulation**. The exam card is deliberately NOT called "Prüfung":
  a card may not carry the name of the page it sits on.
- **Schreiben lost its tab, not its route.** `/writing` keeps its path, its pencil mark, its deep
  links and the `AppShell` draft-resume redirect. It had been a top-level tab from 2026-07-22 to
  s182, so `ROUTE_SUCCESSOR["/writing"] = "/anwenden"` remaps a pin saved in that window and nobody
  lands on an empty slot.
- **What this costs, stated plainly:** the writing coach is one tap deeper than it was. That is the
  founder's trade for a bar that stays at five slots and a zone name that says what it is for.
- `tests/nav.test.tsx` pins the five slots and their order, the remap, and the two registry facts
  (Schreiben is not top-level; the `/anwenden` label is "Prüfung"). The bar remains a locked
  structure: change it only on an explicit founder request.

## s183 (2026-08-02, founder) - Sprechen and Prüfungssimulation stay SEPARATE

The founder asked whether the two speaking cards in the Prüfung hub are the same thing and should be
merged. They are not, and they are not merged. Founder verdict: "keep them separate."

They do share their machinery, which is what makes the question fair: both run `engine/dialogue.ts`
over the SAME 30 scenarios in `src/data/dialogues.ts`. The split is the framing, and the framing is
the product:

- **Sprechen** (`/simulation`) is practice. Any of the 30 scenarios, no clock, hints and coaching
  feedback in the run, repeat as often as you like.
- **Prüfungssimulation** (`/exam`) is the rehearsal. One scenario wrapped in exam conditions: the
  Aufgabenblatt briefing with its aspects, a 6-minute countdown, then a self-check against the real
  telc rubric (Aufgabenerfüllung · Interaktion · Redemittel · Flüssigkeit · Korrektheit) and a score.

**Why merging is the wrong move:** the practice-then-under-pressure split is how learners actually
prepare, and it is the reason the zone carries the name Prüfung. A merge would demote the timed run
to a toggle inside Sprechen, burying the one feature the zone is named after. The honest weakness is
DEPTH (few exam sets, speaking only), and the fix for that is growing the exam run toward a fuller
timed pass, which makes the two MORE distinct, not less. If the two cards ever read as samey, sharpen
the card copy; do not merge the runners.

## s183 (2026-08-02, founder) - the Prüfung icon language, and two traps it exposed

Founder picks D and 2 from `preview/pruefung-icons.html` (variants A-D for the bar mark, 1-3 for the
hub tiles).

- **The bar mark is the orange Absolventenhut.** The target rings it replaced were the bottom bar's
  ONLY outline mark surrounded by filled two-tone shapes, which is the entire reason the founder saw
  it as not matching. Diagnosis rule worth keeping: in that bar, a mark is off when it is drawn in a
  different WAY, not when it is drawn in a different colour.
- **`/anwenden` and `/exam` deliberately share one `graduationCap` render.** The tab and the hub card
  are the same destination at two depths; two different marks for it would be the bug.
- **Hub tiles carry the branded route marks on tinted squircles**, so the Schreiben card shows the
  exact pencil the nav shows. The white-on-gradient tiles they replaced flattened every mark into the
  same white silhouette, which is why the founder could not reuse the nav's pencil there.
- **Trap 1, colour: `RouteIcon` had no colour for routes outside `navItems`.** Since s182 only
  `/anwenden` is a nav entry, so `/writing`, `/simulation` and `/exam` all fell back to brand blue and
  the three tiles would have been identical. `OFF_NAV_COLOR` supplies their accents. Any future
  surface that draws `RouteIcon` for a non-nav route must add its colour there.
- **Trap 2, geometry: `rounded-2xl` on a 48px tile is a CIRCLE, not a squircle.** `--radius + 10` is
  24px, exactly half the tile, so the corner radius consumed the whole side. The old gradient tiles
  had been rendering as full circles for this reason and nobody had noticed. Rule: a corner radius at
  or above half the box side is round, whatever the class is called. Check the number against the box,
  not the name of the token.

## s184 (2026-08-03, founder) - the Lebensbereich pills, in every rail

Founder: *"I want a clear Berufswelt and Alltag pills in each and every filter or aufgabe rail
through out the app right below the Branchen filter."*

**Naming: Berufsleben, not Berufswelt.** Asked before building, because the word appears in the
graph legend, every Thema dropdown heading and the Schreiben rail, and one surface saying something
different is exactly the drift `lib/lifeAreas.ts` exists to prevent. Founder kept **Berufsleben**
(the s181 pick), so nothing was renamed.

**What shipped:** one shared `LifeAreaPills` control (`features/shared/LifeAreaPills.tsx`) in Wörter,
Kollokationen, Redemittel and the Schreiben Kurz/Lang Aufgabe rail, on both breakpoints.

- **The rail owns the slot, not the caller.** In `FilterRail` it is an `area` prop, not another
  `RailPrimary` entry, and the rail inserts it directly after the `sector` scope (or first, when a
  tab has no Branche dropdown, which is the same place in the hierarchy: coarser than Thema). A
  caller cannot put it somewhere else, so "right below the Branchen filter" cannot drift per surface.
- **Single-select that toggles off, no "Alle" pill.** With exactly two options, "both selected" and
  "none selected" mean the same thing, so multi-select semantics would ship a meaningless state. The
  resting state is beides; tapping the active pill returns to it. A third "Alle" chip would also put
  three pills where the app's categorization law says two.
- **The pill wins over the Thema below it.** Picking an area narrows the Thema dropdown to that area
  AND drops a selected Thema from the other one, so pill, dropdown and list can never contradict each
  other. Consequence: with a pill active the dropdown shows ONE heading (the area the learner just
  chose), which is not a violation of the two-category law but the law applied.
- **Counts ignore what they supersede.** Area counts are computed before Thema/Unterthema, search and
  facets, within the current Branche scope only, the same convention the Branche dropdown counts by.
  Counting them post-Thema would grey out the other area the moment a Thema was picked, i.e. a dead
  control at exactly the moment you want to switch.
- **In Schreiben, `area` is a HARD axis and the coarsest one** (`lib/writingScope.ts`), so the two
  areas partition the task pool exactly. `blockingAxis` gained `area` last, for the one reachable
  empty case: a stale deep link pairing an area with a Thema from the other one.
- **Redemittel passes `disableZero: false`.** Untagged phrases are universal there, so an area's
  count is a dedicated-content signal, not the yield, exactly like the Branche dropdown that stays
  selectable at zero.
- **Grammatik deliberately has NO pills.** Grammar topics carry no `themeId`, so there is no honest
  area to filter by; a pill pair there would be dead chrome, which is the rule that bans it.
- **Layout: content-sized wrapping pills, not an equal-width 2-column grid.** The grid was built
  first and looked deliberate, but "Berufsleben" truncated against a four-digit count in the 16rem
  desktop rail. The facet pill rows two sections below it in the same tile are content-sized and
  wrap, so matching them is both the fix and the more consistent answer.
