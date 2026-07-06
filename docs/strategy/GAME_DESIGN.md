# Game design: storyline, missions, systems (title "Neuland", founder-approved)

_Status: **DRAFT for founder review** (session 62 continued, 2026-07-06). This is the detailed
design layer on top of `docs/strategy/GAME_CONCEPT.md` (pillars, scope guardrail, research) and
feeds `docs/plans/GAME_IMPLEMENTATION_PLAN.md` (how it gets built). The founder-facing slide-deck
version of this document was delivered as an Artifact in the same session. Names marked
(proposal) await founder approval, like the pixel-art direction. The concept doc's scope
guardrail applies: broad audience, exam prep is one optional endgame path, never the spine._

## 1. Premise and player

You play yourself, arriving in Germany with two suitcases, a reason (job, study, love, a fresh
start; chosen at character creation and echoed by the story), and imperfect German. The game is
your first years in the country, compressed into one city. There is no villain. The antagonist
is everyday Germany itself: forms, Termine, small talk, unwritten rules. Winning means building
a life: a flat, an income, a doctor you trust, people who know your name.

- **Character creation:** name, origin (free text, drives small dialogue variations), the
  reason for coming (4 options, sets the tone of recurring dream sequences), and a self-rated
  German level that seeds the CEFR difficulty (can be changed anytime).
- **The city (proposal): Neustadt.** Deliberately every-town Germany: an S-Bahn spine, an
  Altbau quarter, a concrete Amt, a Büropark, a Kiez with a Späti. One walkable map whose
  districts unlock chapter by chapter.
- **Title: "Neuland" — APPROVED by the founder (2026-07-06, session 72: "neuland is good").**
  German for uncharted territory, which is exactly what the player is standing in. No longer
  a proposal; use it as the game's name in design and content work. (The city name "Neustadt"
  stays a proposal the founder has not objected to.)

## 2. Recurring cast

Continuity is carried by a small cast that reappears across chapters (cheap to build, high
emotional payoff):

| NPC | Role | Arc |
|---|---|---|
| **Jonas** | The local German friend, met in mission 1.1. The playable "wild card": once per mission he can rescue a failing conversation, translate a Beamter sentence, or lend a missing document. | From guide to genuine friend; later missions have you helping HIM (role reversal as mastery metric). |
| **Frau Schmidt** | Bürgeramt Sachbearbeiterin, the chapter-1 boss. Rapid Beamtendeutsch, zero small talk. | Recurring across every Amt visit; by chapter 4 she greets you by name. The game's running gag and its warmest payoff. |
| **Ayşe** | WG flatmate from chapter 2. Berlin-born, switches between Hochdeutsch, Kiezdeutsch and Turkish with her mother. | Your window into how real, informal German actually sounds. Source of register lessons and side quests. |
| **Herr Krause** | Hausmeister of the Altbau. Speaks in complaints. | Diplomacy training dummy; eventually lends you tools, the highest honor he knows. |
| **Frau Weber** | Your boss from chapter 4. Fair but busy; loves Konjunktiv II. | Delivers the workplace arc across the ten workplace themes. |
| **Herr Nguyen** | Runs the Späti/Kiosk below your flat. | The town crier: rumors, side quests, collectibles, Pfand jokes. |

## 3. The core loop

1. **City map**: pick a mission (story), a recurring errand (FSRS-driven review in disguise),
   or a side quest.
2. **Loadout**: the mission preview shows what language it needs ("Behördendeutsch, B1+,
   3 documents"); the player packs the bag, and packing IS a short retrieval exercise.
3. **Scenes**: 3 to 6 playable scenes (dialogue, reading, listening, forms, choices).
4. **Loot**: XP, new word/Redemittel cards into the bag, key items, story progress. Failure
   spawns a fetch quest instead of a lockout.
5. **The scheduler closes the loop**: FSRS decides when a mission variant recurs ("your Ausweis
   expires", "the Hausmeister knocks again") so review always has a narrative excuse.

## 4. How the player interacts

- **Every German line carries D and E.** Tap D for a simple German explanation, E for English.
  Tap any single word for its card (and bag it if it is new). No player is ever stuck.
- **The input ladder: tap → type → speak.** Every exercise moment supports three input levels.
  Tapping a choice is always available; typing earns more XP; saying it aloud (mic opt-in,
  existing speech engine) earns the most. The player picks their courage level per moment; the
  game gently nudges one rung up when FSRS says a card is strong.
- **Dialogue choices with consequence flags.** Choices are not right/wrong but register-marked:
  a du-form to Frau Schmidt is not an error dialog, it is a scene where she raises one eyebrow
  and the Geduld bar drops. Language consequences are shown in the world, not in a toast.
- **Documents and websites are playable.** Parody Anmeldeformulare, WG listings, ticket
  machines and booking sites are rendered as interactive props with the same D/E affordances.
  Reading real-life text formats IS the gameplay, not a cutscene.
- **Voicemails and announcements are listening moments** (existing TTS), with replay and a
  read-along reveal for support.

## 5. Battles are conversations

The Pokémon fight, rebuilt for language and without violence:

- **Two bars.** The opponent has **Geduld** (patience). You have **Standing** (composure). Say
  the right thing: their patience holds and your standing grows. Fumble: patience drains, and
  at zero they end the conversation ("Kommen Sie wieder, wenn Sie alle Unterlagen haben").
- **Moves are cards from your bag**: Redemittel grouped as move types (höflich fragen,
  widersprechen, nachhaken, zusammenfassen, Zeit gewinnen). Using a move = producing it (tap,
  type or speak, the ladder above).
- **Kritische Treffer:** a well-placed Konjunktiv II ("Wären Sie so freundlich...") lands a
  crit. Register mismatches misfire. Grammar powers (Passiv, Nominalisierung) unlock bigger
  moves at higher levels.
- **Status effects, kindly:** "Missverständnis" (a comprehension check appears: what did they
  just say?), "Beamtendeutsch" (opponent's text gets denser; the D button becomes your best
  friend), "Small-Talk-Falle" (the topic drifts; steer it back).
- **The Jonas wild card** can be played once per mission: he rephrases, translates or lends a
  document, and the game shows HOW he did it, so the rescue is also a lesson.

## 6. The bag: language as items

| Item class | What it is | Examples |
|---|---|---|
| **Wortkarten** | Vocabulary cards, Lv 1–5 from live FSRS stability (already shipped as `engine/collection.ts` + Sammlung). | der Mietvertrag, die Vollmacht |
| **Redemittel-Moves** | Conversation moves by function and register. | "Ich sehe das etwas anders, weil..." |
| **Grammatik-Kräfte** | Unlockable powers that enable bigger moves. | Konjunktiv II (politeness crits), Passiv |
| **Schlüssel-Dokumente** | Key items real missions genuinely require, mirroring real dependency chains. | Meldebestätigung (from 1.6, needed in 3.1), Mietvertrag, SIM-Vertrag |
| **Verbrauchsgüter** | Mid-battle composure restores, jokey and rare. | Kaffee (small heal), Döner (revive after a lost battle, skips the walk back), Feierabendbier (rare full restore; alcohol stays a rare collectible, never the core heal) |
| **Fundstücke** | Cultural collectibles with zero mechanical power, pure joy. | Pfandflaschen, a Wackeldackel, Kleingartenzwerg |

The bag reuses the existing facet system (theme, CEFR, word class, register, sub-theme) so loot
is findable when a mission demands it.

## 7. Progression

- **XP and player level**: the existing scoring engine, one shared pool with the app.
- **Card levels**: FSRS stability bands, Lv 1–5 (shipped contract, `engine/collection.ts`).
- **The city lights up**: district and building states render theme/domain mastery (the shipped
  city strip grows into the world map).
- **Quests**: Can-Do milestones ("Ich kann einen Mietvertrag verstehen") are the quest log;
  claiming one is a story beat, not a settings screen.
- **FSRS is the dungeon master**: recurring mission variants are scheduled by review need, so
  "the game made me do the Anmeldung again" and "my Behörde vocabulary was due" are the same
  event.

## 8. Failure is content, never lockout (locked design rule)

- No hearts, no energy meter, no lives. The player can always play.
- Losing a battle has narrative consequences and a scaffolded retry: Jonas texts a hint, the
  missing Redemittel slips into the bag, the fetch quest teaches exactly the gap, re-entry is
  one tap.
- A missing key item spawns its acquisition mission instead of blocking progress silently.
- Scarcity shapes style, not possibility: a thin bag scrapes through awkwardly (less XP, funny
  scene variants); a rich bag wins with flair and bonus loot.
- **Prüfungsmodus** is a per-mission opt-in replay mode (typed answers, timers, no D/E) with
  better loot. Never the default. This also gives every mission natural replay value.

## 9. The story: seven chapters, ~40 authored missions

The authored spine below is v1. Within and after it, mission VARIANTS are procedurally composed
from the content banks (same schema, FSRS-picked language), which is how "several hundred
missions" scale without hundreds of hand-authored scripts. **Structural rule (founder,
2026-07-06): every chapter ends on its boss.** Missions inside a chapter lead up to the boss;
what happens after a boss belongs to the next chapter.

### Kapitel 1 · Ankommen (district: Bahnhofsviertel) — 6 missions
1. **Willkommen in Neuland.** Airport arrival: passport control small talk, find the train.
   Tutorial for D/E, word-bagging, dialogue choices. Meet Jonas (helps carry a suitcase).
   Loot: survival starter pack (Begrüßungen, Richtungen).
2. **Der Fahrkarten-Automat.** First battle, against a machine: the parody DB Automat with its
   tariff-zone riddles. Teaches the battle UI safely (a machine has infinite Geduld but eats
   coins). Loot: transport vocab, "die Verbindung" card.
3. **Die SIM-Karte.** Phone-shop dialogue: prepaid vs Vertrag, an upsell to resist (first
   register-marked choices). Key item: SIM-Vertrag. Introduces contract-reading UI.
4. **Der erste Einkauf.** Supermarket: find items by German labels, the Pfand system,
   the legendary checkout speed (a gentle timed mini-game with a self-deprecating fail state).
   Loot: food/quantities, Pfandflasche collectible #1.
5. **Ein Dach über dem Kopf.** Jonas arranges a temporary room; the landlord needs a signed
   Wohnungsgeberbestätigung. First real form. Sets up 1.6's document chain.
6. **BOSS: Die Anmeldung.** The five-scene vertical slice (booking parody, bag loadout,
   waiting room, Frau Schmidt dialogue battle, Anmeldeformular typed finale). Reward: the
   **Meldebestätigung** key item plus the Behörde quest badge. Unlocks chapter 2.

### Kapitel 2 · Wohnen (district: Altbauviertel) — 6 missions
1. **Die WG-Suche.** Read parody WG listings (decode "2er-WG, NR, WM vorhanden"), spot the
   scam ad, write a short application message (typed, writing-coach tie-in).
2. **Die Besichtigung.** A casting battle: impress Ayşe and the WG over tea. Small talk,
   hobbies, the du/Sie decision. Success = your room; the fail path is a worse-but-funny
   sublet that retries into the same WG later.
3. **Der Mietvertrag.** Contract reading with trap clauses: Kaution, Nebenkosten, Schönheits-
   reparaturen. Comprehension checks decide whether you catch the bad clause. Key item:
   Mietvertrag.
4. **Der Umzug.** Moving day logistics: borrow a Transporter, navigate Halteverbot, build
   flat-pack furniture from German-only instructions (imperative grammar as gameplay).
5. **Der Hausmeister.** The heater is broken. Herr Krause must be won over with diplomatic
   register (first "diplomatisch" Redemittel moves). Reward: warmth, and Krause's grudging
   respect meter appears.
6. **BOSS: Die Ruhestörung.** Your housewarming was loud; the neighbor complains formally.
   Mediation battle using everything from the chapter: apologize without groveling, propose
   Ruhezeiten, win the Nachbarschaftsfrieden achievement.

### Kapitel 3 · Geld & Papierkram (district: Innenstadt) — 5 missions
1. **Das Bankkonto.** The bank demands the Meldebestätigung (the chapter-1 key item, the
   dependency chain made visible). Choose account types, decode fee tables, parody online
   banking setup with TAN comedy.
2. **Der Versicherungs-Dschungel.** A street promoter, a friend's advice and a comparison
   site disagree. Reading mission: which insurances are essential (Haftpflicht) vs nonsense.
   Wrong choices cost in-game money, not progress.
3. **Der Brief vom Beitragsservice.** The mysterious Rundfunkbeitrag letter. Official-letter
   reading UI, reply-by-form, and the cultural insight scene that explains WHY it exists.
4. **Das Paket vom Zoll.** A package from home is held at customs. Fetch-quest chain across
   the city with a Zollamt battle; teaches formal phone calls (voicemail listening + callback).
5. **BOSS: Die Formular-Hydra.** A multi-form gauntlet (Steuer-ID, GEZ reply, bank forms):
   every completed form spawns the next, until the player's typed-cloze accuracy cuts all
   heads. Pure recurring-review content wearing its boss costume openly.

### Kapitel 4 · Die Jobsuche (Agentur & Zuhause) — 7 missions, boss last
1. **Die Orientierung.** Coffee with Jonas: what do you actually want here? Decode German job
   titles and the m/w/d jungle on a parody job portal; build a skills inventory (the first
   talking-about-yourself Redemittel).
2. **Die Stellenanzeige.** Reading battle over three job ads: requirements vs nice-to-haves,
   corporate Denglisch, and one red-flag ad to spot before wasting an application on it.
3. **Der Lebenslauf.** Build the tabellarischer Lebenslauf: German CV conventions, the photo
   question, explaining gaps without panic. Typed form finale.
4. **Das Anschreiben.** The cover letter, assembled from Redemittel blocks then personalized
   (typed; ties into the existing Schreibtraining). Confident without bragging: the register
   tightrope.
5. **Der Anruf.** Call the company: get past the front desk, ask two smart questions about the
   role, leave a voicemail that gets returned. Listening + speaking under gentle pressure.
6. **Die Generalprobe.** Mock-interview night in the WG: Ayşe plays the merciless interviewer,
   Jonas coaches. The Stärken/Schwächen cards are forged here; bag loadout for the boss.
7. **BOSS: Das Vorstellungsgespräch.** Interview battle with Frau Weber: strengths without
   bragging, weaknesses without self-destruction, salary Konjunktiv. Reward: der
   Arbeitsvertrag key item; the Büropark district unlocks.

### Kapitel 5 · Im Büro (district: Büropark) — 5 missions (maps onto the ten workplace themes)
1. **Der erste Arbeitstag.** Onboarding maze: IT passwords, Kaffeeküche etiquette, the du/Sie
   minefield mapped per colleague (a social graph the player fills in).
2. **Das Meeting.** Meetings theme: agenda-following, interrupting politely, summarizing.
   Introduces the "zusammenfassen" move class.
3. **Der schwierige Kunde.** Customer theme: complaint call battle (patience bar in its purest
   form), de-escalation Redemittel.
4. **Der Streit ums Projekt.** Conflict + project themes: defend your plan diplomatically in
   front of the team, then absorb a deadline change without losing standing.
5. **BOSS: Die Dienstreise.** Travel theme capstone: book, ride, survive a delayed ICE,
   present at the client site with everything the chapter taught. Afterwards office life
   continues as recurring errands over all ten workplace themes
   (scheduling/logistics/technology weave in here).

### Kapitel 6 · Gesund & Sozial (districts: Kiez & Stadtpark) — 6 missions
1. **Der Arzttermin.** Call the Praxis (listening + speaking), describe symptoms with body
   vocab, navigate the Versichertenkarte ritual with Dr. Sommer.
2. **In der Apotheke.** Pharmacy consultation: dosage language, generics question, the
   rezeptfrei/rezeptpflichtig split.
3. **Der Stammtisch.** Herr Nguyen sends you to the Kneipe. Social battle night: rounds of
   small talk, opinions and toasts; the Feierabendbier item is discovered here (rare, jokey).
4. **Der Verein.** Join one: Fußball, Chor or Kleingarten (player choice, cosmetic branch).
   German club bureaucracy is the comedy; belonging is the reward.
5. **Das Wochenende.** S-Bahn day trip: ticket zones revisited, etiquette micro-scenes
   (the stare, the seat rules), a Kontrolleur encounter that replays chapter-1 vocab.
6. **BOSS: Das Einweihungsfest.** Host your own party: invite neighbors, colleagues and
   friends (written invitations), cook from a German recipe, handle Krause at the door and
   Frau Schmidt's surprise cameo. The chapter's whole cast on one stage; standing bar renamed
   "Gastgeber-Ehre" for the night.

### Kapitel 7 · Mein Ziel (endgame, player-chosen) — 4+ mission chains
At the chapter-6 finale the player picks their life goal; each is an authored chain that
hardens earlier systems (all input rungs, thinner D/E, richer registers):
- **Der unbefristete Vertrag** (career: negotiation arc with Frau Weber).
- **Die Traumwohnung** (housing: the full apartment hunt at higher difficulty, solo).
- **Die Einbürgerung** (citizenship: the paperwork summit; includes optional Einbürgerungstest
  content).
- **Das eigene Projekt** (community: found a Verein or a Kiez initiative; you become the
  helper NPC for a newcomer, the role-reversal ending with Jonas cheering).
- **Die Prüfung** (optional, per the scope guardrail: telc B2 / Goethe B2 as ONE selectable
  goal for players who want it, reusing the exam-prep pillar; never the default).

## 10. Side quests and the real world

- **Wort-Safari:** photograph a sign or record a voice note using a newly learned word out in
  the real world; the word's card gets a personal badge and an FSRS boost. V1 stores media
  on-device only (privacy, and free).
- **Kiez-Aufträge:** Herr Nguyen's rotating errands (mini-games over the content banks:
  listening snippets, speed-sorting der/die/das crates, Pfand-return arithmetic in German).
- **Fundstücke hunting:** cultural collectibles hidden in scenes; a shelf in your flat
  displays them (the flat slowly becoming "yours" is the ambient progress display).

## 11. Tone, style, language

- **Tone:** warm, funny, on the player's side. The game lovingly roasts German bureaucracy
  and never the learner. Humor is situational, not text-wall jokes.
- **Visual style:** committed retro 2D pixel art (GBA-era Pokémon spirit), per the concept
  doc; **direction still awaits founder blessing via 2–3 mockup scenes** (free assets, zero
  spend). Until then all design is art-agnostic.
- **Language policy:** scene German is CEFR-banded per player level (the existing facet
  system); interface chrome follows the app's microcopy budget; D/E on every content line.
  No em dashes anywhere in copy.

## 12. What already exists vs what is new

| Already shipped (reused as-is) | New for the game |
|---|---|
| FSRS engine + collection levels + Sammlung bag view | Mission/Scene schema + runner (`engine/mission.ts`) |
| Dialogue runner, scoring, speech (TTS/STT), typing/pronounce matchers | Battle presentation layer (Geduld/Standing bars, move picker) |
| Content banks + facets + provenance (1,121 rows) | Mission content bank + NPC cast + key items |
| City strip, quest cards, focus mode, D/E gloss, reading block | World map route `/welt`, loadout screen, parody-document props |
| XP/streak/Can-Do | Consumables, collectibles, wild-card moment |

Build order, tooling, cost cap (~30–60 EUR one-time, no recurring) and model recommendations:
see `docs/plans/GAME_IMPLEMENTATION_PLAN.md`.

## 13. Open decisions for the founder

1. ~~**Art blessing:** approve producing 2–3 pixel mockup scenes (free assets).~~ RESOLVED
   2026-07-06 (session 72): mockups produced and the **modern pixel style blessed**
   (`preview/game-pixel-mockups/scene7-modern-hell.png` is the reference; GBA styling
   rejected; in-game dark mode deferred). Record: `docs/DECISIONS.md` → "Game art direction".
2. ~~**Names (proposals):** game title "Neuland", city "Neustadt", the NPC cast. All
   renameable.~~ PARTIALLY RESOLVED 2026-07-06 (session 72): the founder approved the game
   title **"Neuland"**. City "Neustadt" and the NPC cast remain unobjected proposals.
3. **Chapter-1 mission list sign-off** before G1 content authoring starts (the vertical slice
   itself is already specced in the concept doc). STILL OPEN.
