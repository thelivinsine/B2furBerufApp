# Game demo-readiness review — Neuland for the demo this week (s135, 2026-07-20)

_Comprehensive review of the current game layer (G1 + G2 Kapitel 1) against the goal: **the game
is also presented in this week's demo.** Evidence-based: all CI gates were re-run and a scripted
Playwright playthrough (mobile 390x844) exercised the hub, mission 1.1 scenes, the battle + bag
ask flow, the boss opening, the Heute → Spielen embed, and the dark-mode hub. Companion docs:
`docs/DEMO_RUNBOOK.md` (the s115 demo playbook, still valid), `docs/plans/GAME_IMPLEMENTATION_PLAN.md`
(G2 status), `docs/plans/DEMO_READINESS_PLAN.md` (the s111 app-wide sweep, all chunks done)._

## Verdict

**The game is demo-ready today, with ONE small must-fix bug.** All 6 Kapitel-1 missions are
authored and playable, the runtime sweep produced **zero console errors**, the boss (1.6) is
directly reachable ungated, the hub is theme-aware and clean in light + dark, and the s133
rebrand chrome (Nachtblau) is live inside missions. What stands between "works" and "presents
well" is one P0 bug, one visual-consistency polish item, and demo prep (seeding + a dress
rehearsal). Nothing structural is needed this week.

## Verified baseline (2026-07-20, branch level with `main`)

- `pnpm typecheck` clean · `pnpm test:unit` **219/219** (incl. the mission-runner and
  city-mastery suites) · `pnpm lint:content` **passes** (mission graph integrity: routing +
  battle graphs reach a win, content ids resolve, key items obtainable, deps acyclic).
- Scripted playthrough findings (dev build, fresh profile): hub renders both surfaces
  (`/welt` + Heute → Spielen), 1.1 gating correct (1.2–1.5 locked, boss ungated as pinned by
  `tests/mission.test.ts`), battle HUD (Geduld/Mut bars, NPC plate, B1.1 chip) correct, the bag
  ask flow works (Reisepass hand-over, "Hab ich nicht dabei", Wörterbuch 3x), listening scenes
  have a real TTS fallback (`revealed = !tts`, so no dead scene on devices without German TTS),
  boss opens with the Terminvergabe website parody. Zero uncaught errors across the whole run.

## Current state of the game (what a demo can show)

- **Content:** Kapitel 1 "Ankommen", 6 missions (Willkommen, Fahrkarten-Automat, SIM-Karte,
  erster Einkauf, Dach über dem Kopf, Anmeldung boss), 33 scenes across 8 scene kinds
  (19 cutscene, 5 dialogueBattle, 2 automat, 2 hotspot, 2 listening, 2 formCloze,
  2 websiteParody, 1 loadout). All content linted, provenance-tracked, and covered by the s112
  content-accuracy proofread + the AI-jury sidecar.
- **Mechanics that land in a demo:** the persistent HUD bag with tap-to-hand document demands,
  the rationed Wörterbuch (English as a resource, 3 charges), the Automat keypad machine (1.2),
  tappable hotspot stages (1.1, 1.4), battle bars with a victory bonus, loot-card victory screen
  (Koralle reward tokens), and failure-as-content (`onLose` scaffolded-retry routes, 5 in the
  bank; no hearts/lockout).
- **Integration story:** one progression state. Mission grades write real FSRS
  (`reviewVocab`), XP and streak are shared, and Üben mission N practises mission N's exact
  content ids. This is the differentiator worth SAYING on stage, not just showing.
- **Known-by-design (do NOT "fix" and do not let them surprise you on stage):** missions are
  light-theme-only (dark deferred, backlog #31; the hub IS theme-aware), game progress is
  local-only (no cloud sync until the G2 Supabase migration), Kapitel 2+ show as a locked
  teaser card, and tall phones show dark surround below short scenes (the stage is a scroll
  surface).

## Priority actions

### P0 — must fix before the demo (small, low-risk) — **BOTH FIXED s135** ✅

1. **Heute → Spielen compact tile opens scrolled to the WRONG rows — FIXED s135.** Reproduced
   and measured: on a fresh profile the 3-row mission checklist opened showing 1.4–1.6 with the
   next-mission row (1.1) and its play button scrolled out of view (`scrollTop` landed at the
   max, 182/182). Root cause in `NeulandHub.tsx`: the auto-center math uses `r.offsetTop`, but
   the scroll tile was not a positioned ancestor, so `offsetTop` (measured 615px, against the
   page) was document-relative and the tile always slammed to the bottom. Fix: the compact
   scroll container is now `relative`, making it the rows' offsetParent. Verified scripted:
   fresh profile shows 1.1–1.3 (`scrollTop` 0), mid-chapter profile centers 1.4.
2. **Battles fought against invisible opponents — FIXED s135** _(founder-caught: the first
   review pass misfiled the sparse stages as "placeholder art, by design"; an invisible battle
   opponent violates the game's own "feels like a game" bar and the s82 precedent that blank
   stages read as missing art)._ `NPC_SPRITES` contained exactly ONE character (Frau Schmidt),
   so 4 of the 5 dialogue battles showed a name plate + Geduld bar over an empty backdrop, and
   only the hotspot scene ever placed the player. Fix: four new code-authored 26x32 front
   sprites in `welt_assets.py` in the blessed style + world scale (Grenzbeamte with peaked cap
   + badge, Milo with lanyard, Kassiererin with Supermarkt apron, Herr Brandt balding with
   mustache + cardigan), registered in `NPC_SPRITES` (`stage.tsx`), `sprite:` set on the four
   battle NPCs (`missions.ts`), and the linter's `GAME_SPRITES` mirror extended. The shared
   battle anchor (65.5%/23%) was composite-checked against all four battle backdrops: every
   NPC lands behind their counter/desk. Every dialogue battle now has a visible opponent.

### P1 — high value this week, still low-risk

2. **Regenerate the pixel placeholder assets in Nachtblau — DONE s135** (rode along with the
   sprite work). The s133 rebrand (PR #595) swept the game's TSX chrome to `#3D74ED`, but the
   code-authored PNG assets were never regenerated: `welt_assets.py` still had
   `INDIGO = (91, 91, 230)` (`#5b5be6`), so backdrop signs/awnings, the player sprite's
   backpack, the doc icons and the Wörterbuch sprite carried the OLD indigo next to Nachtblau
   buttons. The constant is now `(61, 116, 237)` and every asset is regenerated.
3. **Cutscene stages had no characters — DONE s135 (P1 pass).** Only the hotspot renderer
   placed the player, so all 19 cutscenes rendered as empty rooms. Fixed: `CutsceneCast` in
   `scenes.tsx` now stands the player bottom-left on every backdropped cutscene (the `website`
   prop scene stays character-free) and the speaking NPC to the right — the NPC is the current
   line's speaker when sprited, otherwise the scene's primary sprited NPC (most lines), so the
   figure stays put through narrator/player lines instead of flickering. This needed a **Jonas
   sprite** (the recurring companion, 22 cutscene lines, previously spriteless): a new
   code-authored sprite (messy brown hair, rust hoodie, denim), registered like the others.
   Placement was composite-checked across all five cutscene backdrops (terminal/strasse/laden/
   wohnung/amt); verified in-app that the player stands in the 1.1 arrivals hall. The
   listening/automat/form/loadout stages still render their prop/device without a person by
   design (the device or form is the focus); revisit only if they read empty in the rehearsal.
4. **Seed the demo device the evening before.** Play missions 1.1–1.3 by hand on the demo
   profile so the hub reads lived-in (3/6, checkmarks + replay buttons, streak alive) and the
   live demo can start at 1.4 (hotspot + automat + battle variety) instead of the text-heavy
   1.1 opening. Remember game progress is LOCAL-ONLY: seed on the exact device/profile you
   will present from, and do not switch devices for the game segment. _(Founder task.)_
5. **Dress rehearsal on the founder's phone, after the P0/P1 merges are live.** Hard-refresh
   first (PWA `autoUpdate` serves the old build for one load). Play 1.4 and the boss 1.6
   end-to-end once, including one deliberate wrong answer (to show the retry scaffolding) and
   one Wörterbuch use. My sweep exercised mechanics but did not complete every mission on a
   real device; the rehearsal is the last mile. _(Founder task, runbook applies.)_

### P2 — post-demo (explicitly NOT this week)

- The remaining G2 rungs in planned order: type-under-timer (1.4 checkout), FSRS-driven
  recurring-mission composer, failure-as-fetch-quest loop, the Supabase `missions_done`/
  `key_items` migration (unlocks cross-device game progress), chapter-select entry.
- Kapitel 2 "Wohnen" authoring (the locked teaser card is actually a good "coming soon" beat).
- Licensed pixel-art packs (scene-7 reference) replacing the placeholder art.
- Game dark mode (backlog #31), audio/SFX, print-prop side quests.

## Suggested game segment for the demo script (3–4 minutes)

1. **Enter from the dashboard** (Heute → Spielen), not `/welt`: it shows the game living inside
   the learning app, and the fixed compact tile (P0) now centers the next mission.
2. **Hub beat (15s):** chapter hero, 3/6 progress, the Boss tag, the locked Kapitel-2 teaser
   ("six chapters planned, this is chapter one").
3. **Play mission 1.4 "Der erste Einkauf" (2 min):** it has the best scene variety density
   (hotspot shelf search → automat Leergut → battle) and shows tap-first gameplay with minimal
   reading.
4. **One battle moment:** open the bag on a document demand, show the Wörterbuch ("English is a
   rationed resource, 3 uses per mission") — this is the strongest pedagogy-in-disguise beat.
5. **Boss opening as the closer (30s):** the Terminvergabe parody ("Nächster freier Termin: in
   8 Wochen") reliably gets the laugh from anyone who knows German Behörden; you can exit after
   the joke, or land the victory loot screen if time allows.
6. **Say the integration line:** "Everything you answer in the game feeds the same memory model
   as the practice sessions — one progression, two ways to learn."

## Implementation record (same session, founder-approved "whole P0 batch")

Shipped in s135 after the founder greenlit the batch, then the P1 cutscene pass: the scroll fix
(`NeulandHub.tsx`), the four battle-NPC sprites + the Jonas cutscene sprite + Nachtblau asset
regeneration (`welt_assets.py` → `src/features/welt/assets/`, wiring in `stage.tsx` +
`missions.ts` + `lint-content.mjs` `GAME_SPRITES`), and the `CutsceneCast` player/NPC placement
in `scenes.tsx`. Verified: scripted Playwright checks for both scroll cases + the Beamter
rendering in the 1.1 battle + the player rendering on the 1.1 cutscene (zero console errors), PIL
composites of every battle AND cutscene backdrop × character at the shared anchors, and the full
gate set (typecheck · lint 0 errors · lint:content · test:unit 219 · build · bundle 80.7 kB).
Remaining before the demo: the founder tasks (seed + dress rehearsal). The five daily-life scene
kinds that show a prop/device without a person (listening/automat/form/loadout) are left as-is by
design; revisit only if the rehearsal makes one read empty.
