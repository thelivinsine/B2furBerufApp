# Mission activity research: what the player should DO in Neuland

_Status: **COMPLETE** (session 74, 2026-07-06). Commissioned by the founder after the G1
playtest: "more variety in the question types, answers should be actions (tap the item in the
bag), meaningful choices, minimal text." This is the durable record of the research; the
founder-facing version (plus the full chapter-1 gameplay scripts) is the slide deck
`docs/strategy/CHAPTER1_GAMEPLAY_DECK.html`. Mission authoring in G2+ should draft against
this catalog._

## 1. Method (the research plan, as executed)

Four independent expert personas ran in parallel (multi-agent ideation, founder-requested),
each blind to the others, all grounded in `GAME_DESIGN.md`, `src/data/missions.ts` and
`src/types/game.ts`:

1. **DaF-Didaktikerin** (20y B1-B2 adult teaching, telc/Goethe examiner): activity types by
   language competence and SLA principle; meaningful-choice rules; error-handling design.
2. **Veteran game designer** (2D RPGs, adventure, serious games): interaction verbs beyond
   multiple choice; choice-architecture levers; bag/inventory design; full-screen scene grammar;
   chapter pacing.
3. **German culture and literature expert**: authentic text-genre props, cultural comedy beats,
   unwritten-rules moments, NPC register voices, text-genre difficulty ladder.
4. **Market researcher** (web): survey of shipped language-learning games (Wagotabi, Noun Town,
   Influent, Shashingo, Lingotopia, Learn Japanese to Survive, Duolingo Stories/Adventures,
   Crystallize, Newcomer, Terra Alia, Kagami), what their gameplay actually consists of, what
   reviews praise and pan.

The synthesis below deduplicates the four reports. The COMPLETE verbatim briefs and persona
reports are preserved in `MISSION_ACTIVITY_IDEATION_TRANSCRIPTS.md` (founder request, s74). To
rerun this method for a future chapter: same four personas, seeded with the chapter's mission
list and the current scene-kind union.

## 2. The synthesized activity-type catalog

Legend: **fit** = how it lands in the engine (`ships` = existing scene kind covers it,
`extend` = existing kind plus renderer work, `new` = new scene kind/renderer). The mixing rule
(DaF): every mission needs at least one act-in-the-world type, one productive type, and at most
one pure selection moment per scene.

| # | Activity | The player... | Trains | Why it works | Fit | CEFR |
|---|---|---|---|---|---|---|
| 1 | **Dokument geben** | opens the bag and taps/hands the demanded item | Hören, Wortschatz | transfer-appropriate processing: the real Amt situation IS retrieval | **ships** (s74 `ask` nodes) | A2+ |
| 2 | **Hotspot antippen** | taps the answer in the pixel scene (your number on the board, Schalter 2, the right shelf product, green customs lane) | Lesen/Hören | comprehension proven by acting on the world | **new** (`hotspot` layer on stage) | A2+ |
| 3 | **Walk-to** | taps a floor spot, sprite walks (pick a queue, reach the counter) | orientation | sets place; navigation as comprehension | ships (loadout pattern, generalize) | A2+ |
| 4 | **Typ-Zug (cloze)** | types the key word to land a battle move at full strength | Schreiben | generation effect, pushed output | **ships** (`BattleMove.cloze`) | B1+ |
| 5 | **Sprech-Zug** | says the move aloud (mic opt-in), top XP rung | Sprechen | output hypothesis; the input ladder's top | extend (speech engine exists) | B1+ |
| 6 | **Formular ausfüllen** | fills an official form, typed/select, sign + stamp gestures as the finale ritual | Schreiben, Lesen | authentic text genre; no surveyed competitor owns real form props | **ships** (`formCloze`), stamp/sign = extend | B1+ |
| 7 | **Aufruf abfangen** | listens for THEIR number in the announcement noise and acts on it | Hören (Zahlen) | selective listening under distraction | extend (`listening` + hotspot) | A2+ |
| 8 | **Keypad/Automat** | presses real buttons on a rendered machine (ticket zones, PIN, phone dial) | Lesen | sequence + wrong-key buzz feels like a machine, not a quiz | **new** (`automat` prop kind) | A2+ |
| 9 | **Type-under-timer** | types against a gentle clock (the supermarket checkout) | Schreiben | retrieval under pressure; Prüfungsmodus's native verb | extend (cloze + timer flag) | B1+ |
| 10 | **Sortieren** | drags items into bins (der/die/das crates, brauche-ich-heute documents) | Grammatik, Wortschatz | N judgments in one gesture, self-pacing | **new** (sort minigame) | A1-B1 |
| 11 | **Anzeige entschlüsseln** | taps abbreviations in ads/listings to unfold them (2er-WG, NK, WM, NR) | Lesen | schema-building for a native text genre | extend (`websiteParody`) | B1-B2 |
| 12 | **Fallenklausel finden** | hunts the trap clause in a contract wall of text | Lesen (Detail) | critical reading in authentic layout | extend (tap-line reading prop) | B2 |
| 13 | **Nachfrage-Geste** | plays "Wie bitte? / Können Sie das anders sagen?" to trigger a recast | Interaktion | negotiation of meaning: not-understanding becomes a MOVE, not a fail | ships (battle move pattern) | B1 |
| 14 | **Register-Wahl mit Folgen** | picks du/Sie, locker/förmlich; the NPC visibly reacts and the ceiling shifts | Pragmatik | register as a stat; no surveyed game scores politeness | ships (move deltas) + extend (caps) | B1-B2 |
| 15 | **Leergutautomat** | feeds Pfand bottles in; each accepted bottle is one micro-retrieval | gemischt | spaced retrieval with a slot-machine feedback loop | **new** (G2 Pfand economy) | all |
| 16 | **Kollokations-Paare** | drags Nomen onto its Verb (Antrag stellen, Frist einhalten) | Chunks | formulaic sequences break the plateau | **new** (pairs minigame over collocations bank) | B1-B2 |
| 17 | **Schritte ordnen** | drags a process into order (erst Termin, dann Unterlagen...) | Pragmatik | procedural schema for bureaucracy | **new** (order minigame) | B1 |
| 18 | **Listen-and-act** | audio plays and the player ACTS during it (stand up at Gleis 4) | Hören | acting during audio beats quiz-after-audio | extend (`listening` + hotspot) | A2+ |
| 19 | **Small-Talk steuern** | keeps a drifting conversation alive with connectable moves | Sprechen, Pragmatik | interactional competence; the Small-Talk-Falle made playable | ships (battle effect) | B1-B2 |
| 20 | **Wrong-item comedy** | offers the wrong bag item and gets a deadpan world reaction | Wortschatz | errors punished with humor, not shame (affective filter) | **ships** (s74 wrongFeedback) | all |

## 3. Design rules (synthesized)

### Meaningful choices (the six levers, game designer x DaF)
1. **Resource cost**: an option spends a turn, Geduld headroom, Pfandgeld, or Müdigkeit.
2. **Time pressure**: at hard nodes, deliberation itself can drip Geduld (matches the real
   feeling at the counter).
3. **Information asymmetry**: the right move is only knowable if you read/asked first
   (information gap beats guessing); do not telegraph the crit on the button face.
4. **Delayed consequence**: an early choice pays off or bites two beats later (goodwill spent
   at b2 makes b4 pricklier; the SIM upsell accepted in 1.3 costs money in chapter 3).
5. **Reactive NPC**: consequences render in the world (eyebrow, denser Beamtendeutsch as a
   status effect), never as a toast.
6. **Visible bar deltas first**: the bars and the face are the primary readout; text second.

### Error handling (DaF, binding for content authoring)
- **Recast, not red X**: the NPC repeats the correct form in flow ("Sie MÖCHTEN sich also
  ANMELDEN. Gut.").
- **Uptake window**: after a recast, one self-repair chance for a small Mut bonus.
- **Delayed correction**: explicit analysis goes to the debrief/Jonas text, never mid-scene.
- **FSRS as consequence**: a fumbled item lowers stability so exactly that gap recurs.
- **Failure is content** (already locked): scaffolded retry, never lockout.

### The bag (shipped s74, direction confirmed by research)
Always one tap away in the HUD; items are verbs, not a menu. Demands pulse the bag. Wrong
items earn deadpan reactions (author 1-2 joke reactions per boss). The Wörterbuch's limited
charges make English a rationed lifeline (the founder's "not always available" rule); the
Jonas wild card (G2) is the big rescue version, once per mission, and shows HOW he did it.
Prüfungsmodus simply removes the Wörterbuch from the bag.

### Market lessons (evidence-based)
Most praised across shipped games: mixed exercise types inside one continuous scene (Duolingo
Stories); recall gated on just-taught content in an RPG frame (Wagotabi, Kagami); forced
communicative need (Crystallize, the only controlled-study result); translation withheld until
requested (Influent). Most panned: the language check detached from the mechanic it gates
(Terra Alia's "boring computer", players avoided battles); no production demanded at all
(Lingotopia); recognition ceiling with no sentence-level output (Learn Japanese to Survive);
metagame hijacking the goal (Duolingo leaderboards); content bugs in the target language
(Newcomer), which validates our lint/provenance discipline. Gaps no competitor owns that we
can: real fillable form props, typed free recall in dialogue, register/politeness as a stat,
a comedic composure meter attached to actual language production.

### Don'ts (merged top list)
1. No nice/nice option pairs: if no bar, resource or register line moves, it is decoration.
2. Never quiz recognition where the situation demands production or action.
3. Never punish with shame or lockout (recast + retry; the affective filter is the churn risk).
4. Do not drown scenes in text or default-on translation (kills noticing; picture carries
   meaning, D/E on demand).
5. Teach chunks and speech acts, not isolated words; keep Beamtendeutsch short and REAL.
6. Do not telegraph the correct answer with a special chip; let the flourish come with the hit.
7. Never park the learning check outside the game verb that it gates.

## 4. Adoption order (G2 focus)

Ranked for the next build slices, weighing playtest impact against build cost:
1. **Hotspot antippen** (one generic tappable-stage layer unlocks #2, #7, #18 and Pfand pickup)
2. **Keypad/Automat** (mission 1.2 is built on it; battles vs machines teach the battle UI safely)
3. **Type-under-timer** (mission 1.4 checkout; reuses typing engine)
4. **Register-Wahl consequence caps** (deepens every battle at data level)
5. **Sortieren / Kollokations-Paare / Schritte ordnen** (one drag-sort minigame renderer, three skins)
6. **Leergutautomat** (the Pfand economy's engine, mission 1.4 onward)
7. **Anzeige entschlüsseln** (chapter-2 WG hunt depends on it)
8. **Sprech-Zug** (mic opt-in ladder rung; engine exists, needs battle wiring)

## 5. Chapter-1 pedagogy map (objectives per mission)

| Mission | Language objectives | Signature activity types |
|---|---|---|
| 1.1 Willkommen | greetings/politeness formulas, W-questions at passport control, first directions | Dokument geben (tutorial), listen-and-act, walk-to |
| 1.2 Fahrkarten-Automat | transport vocab, prices/numbers, decoding a machine UI | Keypad/Automat battle (infinite Geduld, eats coins) |
| 1.3 SIM-Karte | comparative contract reading, polite-but-firm refusal, Denglisch immunity | Register-Wahl with delayed cost, Anzeige/AGB reading |
| 1.4 Erster Einkauf | food/quantities, Grundpreis math, the Pfand system | Hotspot shelf search, type-under-timer checkout, Leergutautomat |
| 1.5 Dach über dem Kopf | housing vocab, first real form, Nomen-Verb chunks | Kollokations-Paare warm-up, formCloze + sign ritual |
| 1.6 BOSS Anmeldung | Beamtendeutsch decoding, Konjunktiv II register, documents on demand | everything above stacked; introduces NOTHING new (boss = exam of the chapter) |

Boss rule (game designer): each mission introduces exactly ONE new mechanic; the boss stacks
them all and introduces none. Text-genre ramp (culture expert): Schild → Kassenzettel →
Werbeplakat → Automat-UI → Fahrplan → Kleinanzeige → Hausordnung → Formular → Amtsbrief.
