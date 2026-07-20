# Project Status Archive — 2026-W30

Append-only session-handoff history for ISO week 2026-W30 (chunked per the s70 doc-hygiene
rule; index at `docs/archive/PROJECT_STATUS_ARCHIVE.md`). Newest at the top.

**Handoff after session 135 (2026-07-20). Game demo-readiness review + P0 batch + P1 cutscene pass
SHIPPED (PRs #601, #602 merged to `main`). Branch `claude/game-review-demo-readiness-8fdpid`.** The
founder asked for a comprehensive review of the current game (Neuland, G1 + G2 Kapitel 1) with
priority actions so the game can be presented in this week's demo, then greenlit the P0 batch and the
P1 cutscene pass in-session. Deliverables:
**`docs/plans/GAME_DEMO_READINESS_REVIEW.md`** (verdict, evidence, prioritized actions, a
3–4-minute game demo script, and the implementation record) plus the shipped fixes below. Key facts:
- **Evidence gathered:** `pnpm typecheck` ✓ · `test:unit` 219/219 ✓ · `lint:content` ✓, plus a
  scripted Playwright playthrough (mobile 390x844, dev build, fresh profile): hub light+dark, mission
  1.1 scenes + battle + bag ask flow (Reisepass hand-over, Wörterbuch), boss 1.6 reachable ungated,
  Heute → Spielen embed. **Zero console errors.**
- **P0.1 SHIPPED — Spielen-tile auto-center fix (`NeulandHub.tsx`):** the compact 3-row mission tile
  opened scrolled to max (hid the next mission + its play button) because the tile was not
  positioned, so the auto-center's `r.offsetTop` was document-relative. The tile is now `relative`
  (it becomes the rows' offsetParent). Verified scripted: fresh profile shows 1.1–1.3 (scrollTop 0),
  mid-chapter centers 1.4.
- **P0.2 SHIPPED — battle opponents have bodies (founder-caught; the review's first pass missed
  it):** `NPC_SPRITES` had only Frau Schmidt, so 4 of 5 dialogue battles ran against an invisible
  opponent. Four new code-authored 26x32 sprites in `welt_assets.py` (Grenzbeamte peaked cap+badge,
  Milo lanyard, Kassiererin apron, Herr Brandt balding+mustache+cardigan; blessed style, locked
  world scale), wired via `stage.tsx` `NPC_SPRITES`, `sprite:` on the 4 battle NPCs in
  `missions.ts`, and the linter's `GAME_SPRITES` mirror (`lint-content.mjs`, it errors on
  unregistered sprites). Shared battle anchor composite-checked on all four backdrops.
- **P1 art SHIPPED — Nachtblau asset regen:** `welt_assets.py` `INDIGO` `(91,91,230)`→`(61,116,237)`
  (`#3D74ED`), all assets regenerated (player backpack, backdrop accents, doc + Wörterbuch icons).
- **P1 SHIPPED — cutscene characters (`scenes.tsx` `CutsceneCast`):** all 19 cutscenes rendered as
  empty rooms (only hotspot placed the player). Now the player stands bottom-left on every
  backdropped cutscene (the `website` prop scene stays character-free) and the speaking NPC stands
  right (current line's speaker if sprited, else the scene's primary sprited NPC, so no flicker).
  Needed a new **Jonas sprite** (the recurring companion, 22 cutscene lines, was spriteless);
  registered like the others. Composite-checked on all 5 cutscene backdrops; verified in-app the
  player renders on the 1.1 arrivals cutscene. Listening/automat/form/loadout keep prop/device focus
  (no person) by design.
- **Still open before the demo:** founder tasks only — seed missions 1.1–1.3 on the exact demo
  device (game progress is LOCAL-ONLY) + dress rehearsal of 1.4 and the boss after the merge is live
  (hard-refresh, PWA autoUpdate).
- **By-design, don't "fix":** missions light-only (hub theme-aware), Kapitel 2+ locked teaser, dark
  surround below short scenes, no game cloud sync until the G2 migration.
- **Gates:** typecheck ✓ · lint 0 errors ✓ · lint:content ✓ · test:unit 219/219 ✓ · build ✓ ·
  bundle 80.7 kB ✓.
