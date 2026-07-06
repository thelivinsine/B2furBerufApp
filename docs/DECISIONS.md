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
