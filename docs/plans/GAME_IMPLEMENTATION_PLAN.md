# Game implementation plan: how to actually build the life-story RPG

_Status: **PROPOSED**, awaiting founder go-ahead (session 62, 2026-07-05). Nothing here is
implemented. This is the engineering companion to `docs/strategy/GAME_CONCEPT.md` (the WHAT: the
concept, pillars, story spine) and `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md` (the on-ramp: the
redesign whose Phase 3 already seeds the game world). Read the concept doc first; its scope
guardrail (broad audience, exam prep is one optional side path) applies to everything below._

## Executive summary (plain words, phase by phase)

**G0, the facelift (done ✅, sessions 63–66).** The app redesign quietly built the game's
foundations while making today's app nicer: tap-to-translate on every German line, reward cards
at the end of a session, and a little city on the progress page that lights up as you learn.
This gate is cleared; the game build can start whenever you say go.

**G1, one playable mission.** Build the "mission machine" once, then use it to make one
complete, playable mission: registering your address at the Bürgeramt, ending in the boss fight
with Frau Schmidt. You play it on your phone. The bar: it must feel like a game, not a quiz in
a costume. If it does not, we fix that before building anything more.

**G2, the first chapter, then a reality check.** Five to eight missions covering arriving in
Germany (airport, SIM card, supermarket, flat hunt, Anmeldung), with recurring characters and
real pixel art. Then we deliberately stop building and let 5 to 10 real learners play. What
they do (finish missions, come back the next day, laugh) decides whether we scale up.

**G3, the walkable city.** The static city picture becomes a place you walk around, like the
old Pokémon games: stroll the streets, enter the bank or the Arztpraxis, and the mission starts.
This is the only phase that needs a real game engine, and it is free.

**G4, growth as a writing job.** From here on, expanding the game means writing new chapters
and side quests into the content pipeline, not building software. Money-wise the whole plan
stays at roughly 30 to 60 EUR one-time (art packs, optional), with zero running costs.

## The question this answers

The founder asked: what is the best way to implement the game idea, how to approach it, what
tools to use, what the strategy should be. The concept doc deliberately left the tech approach
unexplored. This plan closes that gap with four decisions and a phased build order.

## The key insight that shapes everything

**This game is 90% user interface, not physics.** Battles are conversations. Missions are parody
websites, forms, dialogues and choices. The bag is a filterable list. Loot is a card. None of
that wants a game engine; all of it is exactly what React (plus framer-motion) is best at, and
the app already owns the hard parts: a branching dialogue runner (`engine/dialogue.ts`), scoring
(`engine/scoring.ts`), FSRS memory (`engine/srs.ts`), a tolerant answer matcher
(`engine/pronounce.ts`), TTS/STT (`engine/speech.ts`), a session composer (`engine/session.ts`),
and 1,111 provenance-cleared content items with a CEFR/theme/facet taxonomy.

The only genuinely game-engine-shaped part is the **walkable pixel city**. That is one feature,
and it can arrive last. Getting this order right is the difference between shipping a playable
mission in weeks versus spending months wiring an engine before any learning happens.

## The four decisions (recommended)

### 1. Build inside Genauly, not as a separate app
Same repo, same PWA, a new top-level route (working route: `/welt`), loaded as its own lazy
chunk. Reasons: the unified-world contract already says app and game are two renderers over ONE
progression state (`useProgressStore` + cloudSync); a separate app would need its own auth,
sync, deploy, domain and legal pages, doubling the ops burden of a solo founder for zero player
benefit; and the content banks + provenance register (the moat) live in this repo. Because the
game layer will be its own module with a clean boundary, extracting it into a sister product
later stays possible if the brand question is ever answered that way. The name/brand decision
can wait; nothing below depends on it.

### 2. React renders the scenes; a game engine only for the walkable world, and later
Missions ship as **full-screen React scenes** (the redesign's focus-mode session is the
template: chrome hidden, one thing per screen). The entire Anmeldung vertical slice from the
concept doc needs zero game engine: a parody booking website, a loadout screen, a waiting room,
a dialogue battle, a form cloze are all React components. Text-heavy gameplay in a canvas engine
would actually be worse: crisp text rendering, D/E gloss buttons on every line, accessibility,
and reuse of existing components all favor DOM.

The walkable city arrives in Phase G3 as a **lazy-loaded chunk using Phaser** (MIT license, the
de-facto standard web 2D engine: tilemaps, sprites, camera, input; evaluate the current major
version when G3 starts). Phaser draws the overworld only; the moment the player enters a
building or talks to an NPC, control hands back to React scenes. Interim world before G3: the
static tappable SVG city from redesign Phase 3 (tap the Bürgeramt building, mission starts).
Rejected: Godot/Unity web exports (tens of MB of Wasm, weak iOS Safari performance, a separate
codebase in another language that cannot import the TypeScript content banks).

### 3. Missions are data, not code
The concept's ambition is hundreds of missions and thousands of scenes. That is a content
problem, not a code problem, so the engine must make a mission cheap to author. Exactly like
dialogues today (`data/dialogues.ts` + `engine/dialogue.ts`), missions become a content bank
(`src/data/missions.ts`) interpreted by a runner (`engine/mission.ts`):
- A `Mission` is scenes + rewards + prerequisites (key items, chapter). A `Scene` is a closed
  union of types, roughly: `websiteParody`, `loadout`, `dialogueBattle`, `formCloze`,
  `listening`, `choice`, `cutscene`. Each type gets ONE reusable React renderer, built once.
- Scenes reference content-bank items **by id** (vocab, Redemittel, collocations, grammar), so
  provenance, licensing and the D/E bilingual rendering come for free.
- Closed-enum rule applies: every new union mirrors into `scripts/lint-content.mjs` (scene type
  integrity, `next` targets resolve, referenced content ids exist, key-item dependency chains
  acyclic, every mission clearable). The linter catching a broken mission graph in CI is what
  makes scaling to hundreds of missions safe.
- Target metric for the pipeline: **authoring mission #2 touches only data files.** If it needs
  new components, the schema was wrong.

### 4. One progression state: FSRS is the dungeon master
No parallel game save. Game grades flow through the existing review path (`reviewVocab`, same
FSRS state), and the mission composer reads due-card state to decide recurrence: the game "moves
you to a new flat" when Behörde vocabulary is due (the concept's story-justifies-repetition
pillar). Game-only state (chapter reached, key items, XP already exists) extends
`useProgressStore` and rides the existing cloudSync jsonb. This keeps the app's session loop and
the game mutually reinforcing instead of two products fighting for the same minutes.

## Tooling and cost map

| Need | Tool | Cost | When |
|---|---|---|---|
| Scene UI, mission runner | React + framer-motion + existing engines | 0 | G1 |
| Pixel art scenes/sprites | itch.io modern-city pixel packs (LimeZu's Modern Interiors/Exteriors series is the reference style), commercial license | ~10–40 EUR total | G1 mockups, G2 |
| Art touch-ups | Aseprite | ~20 EUR one-time | G2 |
| SFX / UI audio | kenney.nl packs (CC0) | 0 | G2 |
| NPC voices | existing Web Speech TTS (`engine/speech.ts`) | 0 | G1 |
| Walkable map authoring | Tiled map editor | 0 | G3 |
| Overworld engine | Phaser (MIT), lazy chunk | 0 | G3 |
| Mission content drafting | AI-assisted drafts, founder-verified, provenance rows per `DATA_GOVERNANCE.md` | existing plan | G2+ |

**Cost boundary (founder question, session 62):** the paid rows above (asset packs + Aseprite,
~30–60 EUR one-time, no recurring costs anywhere in the plan) are the ONLY money in the plan,
and both are optional. Free path: Pixelorama or LibreSprite replace Aseprite at comparable
quality for our needs (buy Aseprite only if heavy sprite animation becomes routine), and Kenney
CC0 pixel tilesets + OpenGameArt replace the paid packs. The trade-off on art is setting and
consistency, not raw quality: free packs in the modern-everyday-city style the game needs are
scarce, so mixing artists' styles reads as cheap and the patching time costs more than the
packs. Decision: mockups for the art blessing are produced with free assets (zero spend); the
specific packs are bought only after the founder approves the direction.

Asset licenses get tracked like content provenance (a row per pack: source URL, license, what it
covers). AI image generation may be used to explore concepts, but shipped art comes from
licensed packs or commissioned/hand-touched work; do not ship raw AI sprites into the app
without a license-clean redraw. New runtime dependency total for the whole plan: **one**
(Phaser, at G3, in a lazy chunk). The 400 kB main-chunk budget is untouched because the entire
game layer is lazy.

## Claude model recommendations (how to run each phase)

Same tiers and working pattern as `docs/plans/UX_REDESIGN_IMPLEMENTATION_PLAN.md`: open each
session on the phase's strongest-model task, then downshift for the mechanical remainder, and
run a `/code-review` pass before each phase's PR.

| Model | Use for | Cost posture |
|---|---|---|
| **Haiku 4.5** | Mechanical, low-ambiguity edits: asset wiring, provenance rows, running gates + ship | Cheapest, fastest |
| **Sonnet 5** | Standard component and data work inside a fixed schema | Default workhorse |
| **Opus 4.8** | Multi-engine integration, composer/SRS-adjacent logic, perf-sensitive boundaries | When a subtle regression is expensive |
| **Fable 5** | One-shot architecture, narrative/content design, visual direction | Highest capability, use sparingly |

Per-task map:

| Phase | Task | Model | Why this model |
|---|---|---|---|
| pre-G1 | 2–3 pixel mockup scenes for the art blessing (free assets) | **Fable 5** | Visual direction judgment; the cheapest moment to get the look right |
| G1 | `Mission`/`Scene` schema + `engine/mission.ts` runner + lint graph checks | **Fable 5** | The schema must survive hundreds of missions; a wrong shape here is the most expensive mistake in the plan |
| G1 | Scene renderers: website parody, loadout, waiting room, form cloze | **Sonnet 5** | Well-specified components on existing patterns (focus mode, Gloss, browse lists) |
| G1 | Dialogue-battle renderer (dialogue engine + scoring + FSRS grading wired together) | **Opus 4.8** | Threads three engines; a subtle grading bug silently poisons the SRS data |
| G1 | Anmeldung mission content (German dialogue, humor, cultural accuracy) | **Fable 5** | The content IS the product; tone- and pedagogy-critical, founder-verified |
| G1 | Runner Vitest suite + mission checks in `lint-content.mjs` | **Sonnet 5** | Bounded test/validation work against a fixed schema |
| G1/G2/G3 | Gates + ship (build, lint, tests, bundle, PR, realign) | **Haiku 4.5** | Mechanical |
| G2 | Chapter 1 arc design: mission sequence, recurring NPCs, key-item chain | **Fable 5** | Narrative design quality decides the playtest outcome |
| G2 | Mission data authoring at volume + provenance rows | **Sonnet 5** | Workhorse drafting inside the fixed schema; founder verifies per `DATA_GOVERNANCE.md` |
| G2 | FSRS-as-dungeon-master recurrence in the mission composer | **Opus 4.8** | Touches session weighting and SRS state; classic silent-regression territory |
| G2 | Failure/fetch-quest loop, opt-in Prüfungsmodus flag, pixel-asset wiring | **Sonnet 5** | Conventional feature work |
| G3 | React↔Phaser bridge design + lazy-chunk/PWA-precache integration | **Opus 4.8** | A new dependency at a perf-sensitive boundary; bundle budget and PWA caching rules in play |
| G3 | Tilemap city wiring: Tiled maps, districts, NPC placement | **Sonnet 5** | Conventional once the bridge exists |
| G4 | New chapters via the pipeline | **Sonnet 5** draft + **Haiku 4.5** provenance/gates | Content routine; **Fable 5** only for each new chapter's arc design |

## Phases

### G0 (prerequisite): execute the minimal redesign first
_Status update 2026-07-06: **COMPLETE ✅.** Redesign Phases 1–3 all shipped (sessions 63–66,
PRs #305/#307 + the Phase-3 PRs), and Phase 4 Sessions A+B shipped too (typed recall,
Lesen/Hören). **G1 is eligible now.**_
`MINIMAL_UX_REDESIGN_PLAN.md` Phases 1–3 ARE the game's on-ramp: the D/E `<Gloss>` component,
full-screen focus mode, the loot-drop end screen with FSRS card levels, the collection bag view,
and the six SVG domain buildings / city strip. Every one ships standalone value to today's
learners even if the game slips, and the game then starts from a world that already exists.
Do not start G1 before the redesign's Phase 2 is live.

### G1: mission engine + the Anmeldung vertical slice (2–4 sessions)
_Status update 2026-07-06 (session 73): **SHIPPED ✅.** `src/types/game.ts` + `engine/mission.ts`
+ mission graph checks in `lint-content.mjs` + `tests/mission.test.ts`; six scene renderers in
`src/features/welt/` styled to the blessed scene-7 reference (light-only, code-authored placeholder
pixel art, `welt_assets.py`); the founder-approved chapter-1 boss mission `m_kap1_anmeldung` live
behind the lazy `/welt` route (Beta card on Anwenden). Game progression state is local-only until a
G2 Supabase migration adds columns for `missions_done`/`key_items` (an unknown column would fail
the whole progress upsert). The exit criterion (founder plays it on their phone; feels like a game,
not a quiz in a costume) is now in the founder's hands._
Build `engine/mission.ts`, the `Mission`/`Scene` types, the 5 scene renderers the slice needs,
and the Anmeldung mission exactly as specced in the concept doc (booking parody → bag loadout →
waiting room → Frau Schmidt dialogue battle → form cloze → Meldebestätigung key item). Ships
behind the `/welt` route, visible but marked Beta. Uses the flat SVG/illustration style OR pixel
stills if the founder has blessed the direction by then; the engine does not care, art is a skin.
Gates: all existing CI gates plus new lint:content mission checks and a Vitest suite for the
mission runner. **Exit criterion: the founder plays the slice on their phone and it feels like a
game, not a quiz with a costume.**

### G2: Chapter 1 "Ankommen" + the playtest gate (3–5 sessions)
_Status update 2026-07-08 (session 81): **IN PROGRESS.** Founder greenlit G2 (zero-spend, incremental,
playtest-first). **Kapitel 1 authored complete: 6 missions 1.1→1.6** (PR #365 shipped 1.1/1.2 from the
parked draft; PR #366 authored 1.3 SIM-Karte, 1.4 erster Einkauf/Pfand, 1.5 Dach/Wohnungsgeberbestätigung).
The `terminal`/`laden` settings now have code-authored placeholder backdrops (s82, PR #368: a transit
hall and a shop, added to `welt_assets.py`); they were blank stages before, which read as missing art.
Licensed pixel-art packs remain the eventual upgrade.
**Build-order decision (2026-07-08, session 82, founder-approved): scene VARIETY comes before the
plumbing.** The founder reviewed Kapitel 1 and flagged that every mission plays as cutscene → dialogue
battle → cutscene, so the Geduld/Mut bars appear in all six missions and the boss no longer feels
special (scene mix: 20 cutscenes, 6 battles, 3 websiteParody, 2 listening, 2 formCloze, 1 loadout).
Since the playtest gate is the whole point of G2, testers must see the varied chapter, not the
repetitive one. **New order of the remaining G2 rungs:**
1. **Hotspot layer** (tappable stage: catalog #2/#7/#18; one generic renderer)
2. **Keypad/Automat scene kind** (catalog #8), then **re-skin mission 1.2** (ticket machine becomes a
   real machine, not a battle) and the 1.4 Leergutautomat beat
3. **Type-under-timer** (catalog #9) for the 1.4 checkout
4. FSRS-driven recurring-mission composer
5. Failure-as-fetch-quest loop
6. Supabase migration for `missions_done`/`key_items` (game state is local-only until then)
Nothing is cut; this is the same work re-sequenced so the playtest measures fun, not repetition.
Activity source: `docs/strategy/MISSION_ACTIVITY_RESEARCH.md` §2 catalog + §4 adoption order (which
already ranked hotspot/automat first)._
5–8 missions (airport, SIM card, supermarket, WG viewing, Anmeldung boss), recurring NPCs,
key-item dependency chain, FSRS-driven recurring missions, failure-as-fetch-quest loop, pixel
art scene stills from the licensed packs. Then **stop building and playtest with 5–10 real
learners** (the founder recruits; the app is live and installable). The concept's scale
ambition only gets funded with evidence: session completion, next-day return, and "did they
laugh" decide whether G3 proceeds or G2 iterates.

### G3: the walkable world (3–5 sessions)
Phaser overworld in a lazy chunk: one German city, tilemap districts per chapter, walk to
buildings to enter missions, NPCs on the map. React↔Phaser bridge is a thin event interface
(enter building → unmount map, mount mission; mission result → map state). Districts unlock per
chapter. This is also the natural moment for ambient audio and the achievement collectibles.

### G4: content scale + side systems (ongoing)
Chapters 2+ authored via the data pipeline (AI-drafted, founder-verified, provenance-tracked),
real-world side quests (photo/voice word capture, on-device only per the concept's privacy
constraint), opt-in Prüfungsmodus per mission, the endgame goal picker. By now mission authoring
is a content routine, not an engineering task.

## Risks and guardrails

- **Engine-first trap.** The failure mode of every indie RPG: months on engine, no content.
  Countered by decision 2 (no Phaser until G3) and the G1 exit criterion.
- **Content-scale trap.** Hundreds of hand-coded missions would die. Countered by decision 3;
  enforce the "mission #2 touches only data" metric in review.
- **Two-souls trap.** If the game forks progress state, learners must choose between app and
  game and both lose. Countered by decision 4 (one FSRS state, one store).
- **Scope guardrail** from the concept doc stands: broad audience, exam prep is one optional
  side path, never the spine.
- **Failure is content, never lockout** (concept doc): no hearts, no energy meter, ever.
- **Performance:** game chunk lazy, 400 kB main budget enforced by CI; pixel assets are small,
  but watch PWA precache growth when tilemaps land (exclude large game assets from precache if
  needed).
- **Pixel-art direction BLESSED (2026-07-06, session 72), with a styling correction.** Eight
  mockups shipped in `preview/game-pixel-mockups/` (zero spend, hand-authored in code because
  the sandbox blocks the free asset hosts). Founder verdict: the 2D pixel form stays, but the
  GBA-authentic palette/chrome of scenes 1–6 read as "90s"; the approved shipping style is the
  **modern restyle** of `scene7-modern-hell.png` — muted contemporary palette, modern relatable
  set design, soft outlines, app-language UI (rounded floating cards, pills, bottom sheet,
  brand indigo) drawn at half-size pixels over the chunky world. Light theme only for v1:
  the dark-mode variant (`scene8-modern-dunkel.png`) was liked but deferred as a future to-do
  for budget reasons (tracked in the `PROJECT_REFERENCE.md` backlog). When buying packs in G2,
  select against the scene-7 reference (LimeZu modern register), not against scenes 1–6.

## What the founder decides now

1. **Go-ahead order:** recommended path is redesign Phase 1 next, then G1. (Alternative: jump
   straight to G1 and fold the redesign in later; not recommended, the redesign is smaller,
   already specced, and every game surface reuses it.)
2. ~~**Pixel-art direction:** approve producing 2–3 mockup scenes for blessing.~~ DONE
   2026-07-06: mockups produced and the modern pixel style blessed (see the risks/guardrails
   bullet above for the full verdict).
3. **Brand question** (Genauly feature vs. sister name): explicitly deferrable; revisit after
   the G2 playtest.
