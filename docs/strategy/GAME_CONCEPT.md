# Game concept: the German life story RPG (working title)

_Status: concept, not scoped for build. Captured from the founder brainstorm on 2026-07-05
(session 54). Nothing here is implemented. This document is the reference for the idea so future
sessions build on it instead of re-deriving (or regressing) it._

## Scope guardrail (read first, do not regress this)

**This game is for a BROAD audience of German learners, not exam candidates.** The founder was
explicit: the app's scope was broadened long ago, and the game concept follows the broadened
scope. Exam preparation (telc B2 Beruf, Goethe B2, Einbürgerungstest) is at most **one optional
side path a player can choose**. It is never the spine of the story, never the default endgame,
and never the framing of the product. Any draft that centers the story on "passing the B2 exam"
is wrong and must be corrected.

## Core philosophy (founder, verbatim, 2026-07-05)

> The core philosophy (I'm just writing my thoughts as they come, so it's a bit unpolished) of
> this game concept in the app is to involve learner personally into a story and teach them
> german through cultural insights, visuals and emotions - each scene and mission builds upon
> the last one and progresses incrementally for the learner to keep learning new words and
> associate them properly with a personal situation in the game. The ultimate goal of the app
> is to have a huge storyline with several hundreds of missions by including 1000's of scenes
> like above in the game. Most of the apps these days are dry text based, context-less practice
> apps. The personal involvement is way less and visuals are almost zero. This should address
> that.

Unpacked into the four commitments every design decision must serve:

1. **Personal involvement.** The learner lives a life in Germany inside the game. Words attach
   to situations the player personally experienced, not to flashcard decks.
2. **Cultural insight, visuals, emotion.** Scenes teach how Germany actually works (Behörde,
   Pfand, Kneipe, S-Bahn etiquette) and make the player feel something: frustration, relief,
   pride, humor. Visual scenes, not walls of text.
3. **Incremental scene-on-scene progression.** Each mission builds on the previous one. New
   words arrive in context, then recur in later scenes so the association deepens.
4. **Scale.** The long-term ambition is a huge storyline: several hundred missions, thousands of
   scenes. Architecture and content pipelines should assume this from day one.

The positioning against the market: most language apps are dry, text-based, context-free
practice tools with near-zero visuals and low personal involvement. This game is the answer to
that gap.

## The concept in one paragraph

A 2D story-driven RPG (hero's journey, Pokémon-like in structure and spirit) where the player
arrives in Germany and builds a life. The "items" of a classic RPG are language: verbs, nouns,
prepositions, Redemittel, Konjunktiv I/II, Passiv and other grammar live in the player's bag,
are earned through play, upgrade as the player levels, and are spent to clear missions. Missions
are real-life scenarios (Anmeldung, supermarket, S-Bahn, WG hunt, job interview, Arzt) rendered
as playable scenes, including parodies of real German websites and paperwork. Battles are
conversations. Every line and word carries a D and an E button (German explanation / English
translation). Side quests reach into the real world: photograph or voice-record a newly learned
word out in the wild. Progress is XP plus a growing, well-categorized bag of language loot that
later missions draw on.

## Design pillars (agreed in the 2026-07-05 brainstorm)

### Items are language
Elixirs, potions, wild cards, vouchers, stones and balls become word classes and grammar.
Missions are only clearable by retrieving and using items, which makes gameplay itself the
retrieval practice. Items upgrade as the player levels (a B1 verb card can grow B2 senses,
collocations, and register variants). Draft item lexicon, to be iterated:
- **Kaffee**: small heal. **Feierabendbier**: rare full restore. **Döner**: revive.
  (Alcohol stays a rare, jokey collectible rather than the core heal: the broad audience
  includes non-drinkers, and app-store ratings notice alcohol prominence.)
- **Wild card: the local German friend.** An NPC ally who can intervene once per mission
  (rescue a failing conversation, translate a Beamter sentence, lend a missing document).
- **Key items**: real-bureaucracy documents (Meldebestätigung, SIM contract, bank card) that
  later missions genuinely require, mirroring real dependency chains.
- **Achievements / finds**: cultural collectibles (German cars, Pfand bottles, etc.).

### The story justifies repetition; the SRS decides its timing
Real life in Germany repeats itself (a new Anmeldung on every move, another form, another
Termin). The game embraces that: recurring missions are the narrative disguise for spaced
repetition. The FSRS scheduler acts as the dungeon master: the game "moves you to a new
apartment" precisely when your Behörde vocabulary is due for review. Nobody redoes a flashcard
deck for fun; everybody accepts that an RPG makes you fight trainers again.

### Battles are conversations
"Fights with strangers in supermarkets or S-Bahn stations" are dialogue battles. Your moves are
Redemittel and vocabulary from the bag; the opponent's HP is their patience or your standing in
the argument; Konjunktiv II politeness lands critical hits. This keeps the Pokémon battle
feeling without depicting violence, and it reuses the existing dialogue + scoring engines.

### Failure is content, never lockout
Evidence from the market: Duolingo's hearts punished mistakes and drove dropout, and its 2025
"Energy" replacement (a depleting meter that gates play) triggered its own backlash. Both
directions of "meter that stops you from playing" have visibly failed. Therefore:
- The player can **never** be locked out of playing or learning.
- Losing a mission has narrative consequences and an automatically scaffolded retry (the friend
  wild card texts a hint, a needed Redemittel slips into the bag). Pokémon-style: you white out,
  you wake up, you walk back in stronger.
- A missing item mid-mission spawns a fetch quest: a short targeted mini-session that teaches
  exactly that gap, then re-entry.
- Typing and time limits exist as an **opt-in Prüfungsmodus** per mission with better loot, not
  as the default. This also gives missions natural replay value.
- Item scarcity shapes style, not possibility: a thin bag scrapes through awkwardly, a rich bag
  wins with flair and bonus XP. Harder later, never stuck later.

### Real-world side quests
Collect words from the real world: photograph a sign, record a voice note using a newly learned
word, log a phrase overheard on the platform. These feed loot into the bag and bind the game to
the learner's actual life in Germany. Privacy constraint: photos and recordings are personal
data, so v1 stores them **on-device only** (also the cheap option). Additional side quests are
mini-games (inspired by the best mechanics across existing platforms) that discover new words,
grammar and use cases, all deposited into the bag. The bag needs strong categorization and
filters so loot is findable when a mission demands it (the existing facet system: theme, CEFR,
word class, register, sub-theme).

### D/E on every line
Every sentence and word in the game has a **D** button (German explanation, monolingual) and an
**E** button (English translation). The existing content banks are already bilingual, so this is
a rendering convention, not a content rewrite.

### Visuals: committed retro 2D pixel art
Pokémon GBA-era style: tilemaps, sprite characters, scene illustrations. Deliberate retro charm
is achievable solo (high-quality affordable asset packs exist for exactly this style) and reads
as a feature; imitating Clash-of-Clans production values is a nine-figure art budget and reads
as cheap when underfunded.

**BLESSED with a styling correction (founder, 2026-07-06, session 72).** Mockups of the
Anmeldung slice settled the direction: the 2D pixel form stays, but the literal GBA-era
palette and chrome read as "90s" to the founder and are rejected for shipping. The approved
look is **modern indie pixel** (reference: `preview/game-pixel-mockups/scene7-modern-hell.png`
and its README): muted contemporary palette, relatable modern set design, soft colored
outlines instead of black, and app-language UI (floating rounded cards, pill buttons, bottom
sheet, brand indigo accent) rendered at finer resolution over the chunky pixel world. Light
theme only for v1; an in-game dark mode was liked but explicitly deferred as a future to-do
(budget). Full record in `docs/DECISIONS.md`.

## Audience and tone

Broad audience: anyone learning German and living (or dreaming of living) a German life, from
roughly A2 comprehension upward, with the D/E buttons and CEFR-faceted difficulty carrying
weaker learners. The tone is warmer and funnier than a study tool: the game can lovingly roast
German bureaucracy. Exam prep appears only as optional content for players who seek it (see the
scope guardrail above).

## Story structure: authored spine, procedural flesh

An authored chapter skeleton shared by everyone, where chapters are life domains (mapping 1:1
onto the existing domain/theme taxonomy):

1. **Ankommen**: airport, SIM card, first supermarket, Anmeldung as the chapter boss.
2. **Wohnen**: WG hunt, Mietvertrag, Hausmeister, neighbor noise dispute.
3. **Geld & Papierkram**: bank account (requires the Meldebestätigung key item from chapter 1),
   insurance, Rundfunkbeitrag.
4. **Arbeit**: job search, interview boss fight, then office life (the ten workplace themes).
5. **Gesund & Sozial**: Arzt, Apotheke, making friends, Stammtisch.
6. **Endgame: the player picks their own life goal.** Examples: der unbefristete Vertrag, the
   dream apartment, Einbürgerung, founding a Verein. An exam can be one selectable goal among
   many, never the default (scope guardrail).

Within chapters, individual missions are procedurally assembled from the content banks, with
FSRS steering which language is rehearsed and when. Recurring NPCs (Frau Schmidt vom Bürgeramt,
the Hausmeister, Jonas the local friend) carry continuity cheaply. The world map is one German
city whose buildings are the domains (Bürgeramt, supermarket, S-Bahn station, office,
Arztpraxis, Kneipe); new districts unlock per chapter. This structure is deliberately open to
revision; the founder is flexible on story shape.

## First vertical slice: the Anmeldung mission

Five scenes, each proving one core system:

1. **Get the Termin.** Parody booking website ("Nächster freier Termin: in 8 Wochen").
   Proves: simulated-website reading UI with D/E buttons; a real trade-off choice (wait in-game
   vs. show up spontan at 6 a.m., harder but faster).
2. **Pack your bag.** Pre-mission loadout: collect each required document word cluster
   (Personalausweis, Mietvertrag, Wohnungsgeberbestätigung) by clearing a short retrieval
   exercise. Proves: bag/loadout fed by review exercises.
3. **The waiting room.** Number ticker, ambient dialogue, light listening exercise, one optional
   side interaction. Proves: low-stakes listening plus side-quest hooks.
4. **Boss: Frau Schmidt.** Dialogue battle against rapid Beamtendeutsch; Redemittel are moves,
   Konjunktiv II crits. A missing document sends you home into the failure-as-fetch-quest loop.
   Proves: conversation combat and the failure design.
5. **The form.** The Anmeldeformular as typed cloze finale. Reward: the **Meldebestätigung**
   key item, which the chapter-3 bank mission will demand. Proves: key items and the
   dependency-chain hook (German bureaucracy is already a quest dependency graph).

## Relationship to Genauly

Strong instinct from the brainstorm: a **sister product / layer over the Genauly content
engine**, not a rewrite and not a new tab squeezed into the current app. It reuses the
provenance-cleared content banks (1,111 items with license tracking, a real moat), the FSRS
engine, the dialogue runner, the scoring engine, and the CEFR/theme/facet taxonomy. Open
questions, not yet decided:
- Does it ship under the Genauly brand or its own name?
- ~~Final blessing on the pixel-art direction.~~ RESOLVED 2026-07-06: modern pixel style
  blessed (see the Visuals pillar above); dark mode deferred.
- Tech approach for the 2D layer: explored and PROPOSED in
  `docs/plans/GAME_IMPLEMENTATION_PLAN.md` (session 62, 2026-07-05): build inside Genauly as a
  lazy route, React renders all scenes, Phaser only for the later walkable overworld, missions
  as a lintable data bank over the existing engines. Awaiting founder go-ahead.

## Research grounding (from the brainstorm)

- Task-based language teaching: real-world task simulation builds fluency and accuracy
  (Cambridge, Language Teaching: https://www.cambridge.org/core/journals/language-teaching/article/research-into-practice-the-taskbased-approach-to-instructed-second-language-acquisition/664FB7A40E0C8424339DA8CF51A59DB3)
- Task-based RPG frameworks outperform traditional instruction on vocabulary growth, active
  usage and engagement (arXiv: https://arxiv.org/pdf/2511.15504)
- Digital RPG-based vocabulary learning evidence (Springer: https://link.springer.com/chapter/10.1007/978-3-031-51540-8_2)
- Game-based learning and speaking proficiency (PMC: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC11381748/)
- Punitive metering fails: Duolingo hearts dropout criticism and 2025 Energy backlash
  (https://www.oreateai.com/blog/the-evolution-of-duolingo-why-the-energy-system-changed/57e6ed39a5a26b130e05c5099cbbd601 ,
  https://techissuestoday.com/duolingo-energy-system-user-backlash/ ,
  https://www.classcentral.com/report/duolingo-breaks-hearts-for-energy/)
