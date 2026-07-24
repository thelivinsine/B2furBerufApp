# Neuland game layer — current state

G1 shipped; **G2 in progress, Kapitel 1 complete**. Plan + per-task model map:
`docs/plans/GAME_IMPLEMENTATION_PLAN.md`. Art decisions: `docs/DECISIONS.md` ("Game art
direction", "Game interaction & pixel-UI rules"). Activity design source:
`docs/strategy/MISSION_ACTIVITY_RESEARCH.md`; founder-facing chapter-1 scripts:
`docs/strategy/CHAPTER1_GAMEPLAY_DECK.html`.

## G2 direction (founder)
(1) **Scene variety before plumbing:** next build rungs are the hotspot tappable-stage layer →
Keypad/Automat scene kind (re-skinning mission 1.2 off the dialogueBattle) → type-under-timer,
THEN the composer / fetch-quest loop / Supabase game-state migration (all 6 Kapitel-1 missions
center on one dialogueBattle, so the bars repeat and the boss stops feeling special).
(2) **The external 5-10-learner playtest moves to the END of the full build** (G2 + Kapitel 2-6 +
the G3 city): the playtest crowd is B2 and Kapitel 1 is B1.1-B1.2; the founder is the per-chapter
internal tester until then. A chapter-select / start-at-your-level entry is on the build list.

## Structure
- The life-story RPG ships INSIDE Genauly as the lazy `/welt` route (Beta; entry card on the
  Anwenden hub; also the Dashboard Spielen tab). **Chapter 1 "Ankommen": 6 missions 1.1→1.6**
  (Willkommen, Fahrkarten-Automat, SIM-Karte, erster Einkauf, Dach über dem Kopf, Anmeldung
  boss), chained 1.2→1.5 via `requiresMissions`; the boss (1.6) is deliberately **ungated** as
  the standalone playtest slice (pinned by a `tests/mission.test.ts` fixture, do not gate it).
- **Missions are data, not code:** `src/data/missions.ts` (bank + `chapters`/`gameNpcs`/
  `keyItems` registries) is interpreted by the pure runner `src/engine/mission.ts` (immutable
  transitions emit effects; `MissionPlayer` applies them to the real stores, so the game shares
  ONE progression state with the app: `addXp`, FSRS grades via `reviewVocab`,
  `practiceRedemittel`, key items). Locked success metric: authoring mission #2 touches only data
  files. Scene kinds (closed union in `types/game.ts`, mirrored in `lint-content.mjs`):
  `cutscene`, `websiteParody`, `loadout`, `listening`, `dialogueBattle`, `formCloze`. The linter
  enforces mission graph integrity (see `docs/areas/CONTENT.md` §Linter). `tests/mission.test.ts`
  pins the runner; extend it when touching `engine/mission.ts`.
- **Game progression state** (`missionsDone`, `keyItems` on `useProgressStore`) is local-only for
  now: cloudSync's `progress` upsert has a fixed column set and an unknown column fails the whole
  upsert; syncing game state needs the G2 Supabase migration first.

## Scenes, sprites, backdrops
- Scene backdrops live in the `SceneSetting` enum (`website`/`wohnung`/`strasse`/`wartezimmer`/
  `amt`/`terminal`/`laden`); every setting except `website` (renders its own browser chrome) has
  a code-authored placeholder backdrop from `preview/game-pixel-mockups/welt_assets.py`; licensed
  pixel art is the eventual G2 upgrade.
- **Every scene shows people** (founder-caught: empty stages read as broken/missing art).
  Character sprites are code-authored in `welt_assets.py` (26x32 front NPCs at the locked world
  scale, 16-wide player back sprite), written to `src/features/welt/assets/`, keyed in
  `stage.tsx` `NPC_SPRITES` and mirrored by the linter's `GAME_SPRITES` (ERRORS on a
  `GameNpc.sprite` with no registered art). Every dialogue-battle opponent AND the companion
  Jonas have a `sprite:`; a new NPC must ship one. `BattleView` stages opponent-top /
  player-bottom; `scenes.tsx` `CutsceneCast` stands the player bottom-left on every backdropped
  cutscene plus the speaking NPC. Listening/automat/form/loadout deliberately keep prop/device
  focus (no person).
- **World scale is locked** at the top of `welt_assets.py` (standing adult 28-32px on the 240x160
  world, chair ~19px; `proportions-check.png` verifies); battles stage at ONE human scale (no
  foreground zoom).

## Art / UI rules (in-mission)
- Scene-7 palette, PIXEL-GAME chrome, full-screen: the `MissionPlayer` is a FIXED full-screen
  layer (dark surround, edge-to-edge stage), light-theme-only (dark deferred, backlog #31), brand
  Nachtblau the single loud accent, Koralle reward tokens only on the victory loot screen. Every
  in-game surface is pixel-styled (2px outlines in `GAME_OUT` #463c44, hard offset shadows,
  near-square corners, RPG name plates); **do not reintroduce app-chrome cards inside missions.**
- **Interaction-first:** scenes play like game missions with minimal on-screen text. The **bag is
  in the HUD at all times** (backpack popup); document demands are battle `ask` nodes answered by
  tapping the item in the bag (`handItem`/`admitMissing`), never sentence lists. **English is a
  rationed resource:** the Wörterbuch bag item (3 charges/mission, `MissionRun.dictUses` +
  `useDictionary`) reveals English for the current scene only; no always-on E toggle. Battles mix
  tap and typed cloze moves; both bars must stay high and finish quality pays a victory bonus.
  Waiting beats become gameplay; print-prop mini-quests (Werbung/Anzeige/Flyer) are the recurring
  side-quest pattern (`GAME_DESIGN.md` §4/§10, built in G2).
- **Failure is content, never lockout:** battle losses route through `onLose` scaffolded-retry
  scenes; no hearts or energy meters, ever.

## Hub surfaces (theme-aware, NOT the in-mission scenes)
- `features/welt/NeulandHub` (Heute → Spielen embed AND `/welt`): a **centered header hoisted
  OUTSIDE the chapter loop** (keep it there — inside the loop it duplicates the H1 once Kapitel 2
  is authored). "Neuland" is centered like Üben's "Lernpfad" (`text-display`/`text-2xl`); the
  neutral Beta chip (no amber) is a suffix, absolutely positioned off the h1's right edge and out
  of flow so it does not shift the word off-center. A chapter hero with a scrim overlay (Kapitel
  eyebrow, district title, n/6 count, "Mission spielen" CTA) sits over ONE dense checklist card
  (done = green check + quiet replay icon button, next = the single gradient play control,
  locked = Lock, boss tag inline, a locked next-chapter teaser card instead of a footer
  sentence). The owned-key-item "Schlüssel-Dokumente" shelf was removed from the hub (redundant
  with the in-mission bag/HUD).
- In the Heute embed the hub takes a **`compact` prop** (`SpielenHub` passes it, `/welt` does
  not): the checklist crops to exactly THREE uniform rows (`ROW_H`=60, `COMPACT_LIST_H`),
  scrolls internally (`no-scrollbar`), and a `useLayoutEffect` auto-centers the next unplayed
  mission on open; the rest of the page is normal flow and fits without scrolling. `/welt`
  scrolls normally.
- `PixelStage` keeps an opt-in `themed` prop (hub only) that dims the bright backdrop art in dark
  mode; in-mission scenes stay fixed light. Renderers live in `src/features/welt/`; `/welt` is in
  the AppShell focus-mode gate.
