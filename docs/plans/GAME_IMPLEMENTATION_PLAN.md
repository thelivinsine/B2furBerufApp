# Game implementation plan: how to actually build the life-story RPG

_Status: **PROPOSED**, awaiting founder go-ahead (session 62, 2026-07-05). Nothing here is
implemented. This is the engineering companion to `docs/strategy/GAME_CONCEPT.md` (the WHAT: the
concept, pillars, story spine) and `docs/plans/MINIMAL_UX_REDESIGN_PLAN.md` (the on-ramp: the
redesign whose Phase 3 already seeds the game world). Read the concept doc first; its scope
guardrail (broad audience, exam prep is one optional side path) applies to everything below._

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

## Phases

### G0 (prerequisite): execute the minimal redesign first
`MINIMAL_UX_REDESIGN_PLAN.md` Phases 1–3 ARE the game's on-ramp: the D/E `<Gloss>` component,
full-screen focus mode, the loot-drop end screen with FSRS card levels, the collection bag view,
and the six SVG domain buildings / city strip. Every one ships standalone value to today's
learners even if the game slips, and the game then starts from a world that already exists.
Do not start G1 before the redesign's Phase 2 is live.

### G1: mission engine + the Anmeldung vertical slice (2–4 sessions)
Build `engine/mission.ts`, the `Mission`/`Scene` types, the 5 scene renderers the slice needs,
and the Anmeldung mission exactly as specced in the concept doc (booking parody → bag loadout →
waiting room → Frau Schmidt dialogue battle → form cloze → Meldebestätigung key item). Ships
behind the `/welt` route, visible but marked Beta. Uses the flat SVG/illustration style OR pixel
stills if the founder has blessed the direction by then; the engine does not care, art is a skin.
Gates: all existing CI gates plus new lint:content mission checks and a Vitest suite for the
mission runner. **Exit criterion: the founder plays the slice on their phone and it feels like a
game, not a quiz with a costume.**

### G2: Chapter 1 "Ankommen" + the playtest gate (3–5 sessions)
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
- **Pixel-art blessing is still pending.** Buy no packs and ship no sprites before the founder
  approves 2–3 mockup scenes (cheap to produce, next session if wanted).

## What the founder decides now

1. **Go-ahead order:** recommended path is redesign Phase 1 next, then G1. (Alternative: jump
   straight to G1 and fold the redesign in later; not recommended, the redesign is smaller,
   already specced, and every game surface reuses it.)
2. **Pixel-art direction:** approve producing 2–3 mockup scenes for blessing.
3. **Brand question** (Genauly feature vs. sister name): explicitly deferrable; revisit after
   the G2 playtest.
