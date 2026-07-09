# Neuland primer pack — paste this into ChatGPT / Gemini / NotebookLM

_A single, self-contained context brief for brainstorming the Neuland game with any external
AI tool. Paste the whole thing at the top of a fresh chat, then ask your question. Keeping the
model grounded in these facts is what turns a generic answer into a useful one. Distilled from
`GAME_CONCEPT.md` + `GAME_DESIGN.md`; keep in sync if those change._

---

## Copy from here ↓↓↓

You are helping me design **Neuland**, a story-driven RPG that lives *inside* a German-learning
app called **Genauly**. Read this whole brief, confirm you understand it, then wait for my
question. Do not start designing until I ask.

### What Neuland is
A 2D, Pokémon-spirited RPG where the player arrives in Germany with two suitcases and builds a
life: a flat, an income, a doctor, people who know their name. There is **no villain**; the
antagonist is everyday Germany itself — forms, Termine, small talk, unwritten rules. The "items"
of a classic RPG are **language**: vocabulary, Redemittel (set phrases), and grammar live in the
player's bag, are earned through play, and are spent to clear missions. Battles are conversations.
The player learns German by *living* situations, so words attach to a personal memory, not a
flashcard deck.

### Audience and scope (do not violate)
- **Broad audience**: adults learning German for real life (Behörde, work, health, housing),
  roughly A2 comprehension and up. **NOT** an exam-prep product. Exam prep (telc/Goethe B2) is at
  most ONE optional endgame path a player may pick; it is never the spine, never the default.
- **Level of Chapter 1**: B1.1–B1.2 (arrival basics). Later chapters climb toward B2.

### The four commitments every design decision must serve
1. **Personal involvement** — the learner lives a life; words attach to situations they
   personally experienced in-game.
2. **Cultural insight, visuals, emotion** — scenes teach how Germany actually works and make the
   player *feel* something (frustration, relief, pride, humor). Visual scenes, minimal text.
3. **Incremental scene-on-scene progression** — each mission builds on the last; new words recur
   later so the association deepens.
4. **Scale** — the long-term ambition is hundreds of missions / thousands of scenes, so
   missions must be cheap, data-driven content, not bespoke code.

### Locked design rules (a good idea must respect ALL of these)
- **Failure is content, never lockout.** No hearts, no energy, no lives. Losing a battle has a
  narrative consequence and an auto-scaffolded retry (a friend texts a hint, the missing phrase
  slips into the bag, a short fetch-quest teaches exactly the gap, re-entry is one tap).
- **The learning check must BE the game action**, never a quiz bolted onto a scene. Reading a real
  form IS the gameplay; handing over a document IS the answer.
- **Minimal on-screen text.** Every scene needs a visual that carries its meaning by itself.
- **English is a rationed resource inside missions.** A "Wörterbuch" bag item has 3 charges per
  mission; spending one reveals English for the current scene only. No always-on translation.
- **Meaningful choice, not right/wrong.** Choices are register-marked and have visible in-world
  consequences (say "du" to a Beamtin and her eyebrow rises and her patience drops), not error
  toasts. The best choices have a *delayed* consequence two beats later.
- **Input ladder: tap → type → speak.** Every exercise supports three courage levels; typing
  earns more, speaking (mic opt-in) the most.
- **No em dashes** anywhere in copy (founder rule). Use commas, periods, colons, or parentheses.
- **Tone**: warm, funny, on the player's side. It lovingly roasts German bureaucracy, never the
  learner.

### The scene kinds (a mission is a graph of these; this is the CLOSED set)
A mission is authored purely as **data**: a graph of scenes, each of one kind below. If your idea
needs a new kind, say so explicitly and justify it (new kinds are expensive; prefer these).
- **cutscene** — sequential bilingual story lines, optionally ending in a choice.
- **websiteParody** — a parody German website/portal rendered as an interactive prop (booking
  site, WG listing, job portal), with a choice.
- **loadout** — a pre-mission "pack your bag" screen; packing each item is a short retrieval
  exercise; walking to items in the room collects them.
- **listening** — a TTS voicemail/announcement with 1–3 comprehension checks; read-along reveal.
- **hotspot** — tap the right place in the pixel scene (your platform on the board, the right
  shelf product, the green customs lane). Proves comprehension by acting on the world.
- **automat** — operate a rendered machine step by step (ticket machine, bottle-return, PIN pad):
  read the screen, press the right key; wrong keys just buzz.
- **dialogueBattle** — the conversation battle (see below).
- **formCloze** — fill an official form as typed/select cloze (the finale ritual: sign + stamp).

### How a dialogueBattle works
- **Two bars**: the opponent's **Geduld** (patience) and the player's **Mut/Standing** (composure).
  Good moves hold their patience and raise your composure; fumbles drain patience. Either bar at
  zero ends the conversation ("Kommen Sie wieder, wenn Sie alle Unterlagen haben") and routes to a
  scaffolded retry.
- **Moves are cards from the bag**: Redemittel grouped by function (höflich fragen, widersprechen,
  nachhaken, zusammenfassen, Zeit gewinnen).
- **Critical hits**: a well-placed **Konjunktiv II** ("Wären Sie so freundlich...") crits;
  register mismatches misfire.
- **Item demands**: when an NPC asks for a document, the player opens the bag and TAPS the item
  (never a sentence list). Wrong item = deadpan reaction + patience cost.
- **Typed moves**: some moves have a cloze word to type for full strength (the input ladder).

### The bag (language as items)
Wortkarten (vocab, Lv 1–5 by memory strength), Redemittel-Moves, Grammatik-Kräfte (Konjunktiv II,
Passiv), **Schlüssel-Dokumente** (key items real missions require, e.g. the Meldebestätigung from
Ch.1 is demanded by the Ch.3 bank mission — a real dependency chain), Verbrauchsgüter (jokey
composure heals: Kaffee, Döner), **Pfandflaschen** (found currency + the longest-running cultural
gag), Fundstücke (cultural collectibles, pure joy).

### The recurring cast
- **Jonas** — the local German friend, the once-per-mission "wild card" who can rescue a failing
  conversation. Arc: guide → real friend → eventually YOU help him (role reversal = mastery).
- **Frau Schmidt** — the Bürgeramt Sachbearbeiterin, Chapter-1 boss, rapid Beamtendeutsch. Recurs
  at every Amt; by Ch.4 she greets you by name (the game's warmest payoff).
- **Ayşe** — Ch.2 WG flatmate; switches Hochdeutsch/Kiezdeutsch/Turkish; your window into real
  informal German.
- **Herr Krause** — the Hausmeister who speaks in complaints; diplomacy training.
- **Frau Weber** — your Ch.4 boss; loves Konjunktiv II.
- **Herr Nguyen** — runs the Späti; town crier, side quests, Pfand jokes.

### The story spine (6 chapters + a chosen ending, ~40 authored missions)
Chapters are life domains. Every chapter ends on its boss.
1. **Ankommen** (Bahnhofsviertel): airport → ticket machine → SIM → first shop → temporary room →
   BOSS Anmeldung (Frau Schmidt). *[This is what exists today.]*
2. **Wohnen** (Altbau): WG-Suche → Besichtigung (win over Ayşe) → Mietvertrag trap clauses →
   Umzug → Hausmeister → BOSS Ruhestörung (neighbor mediation).
3. **Geld & Papierkram** (Innenstadt): Bankkonto (needs the Ch.1 Meldebestätigung) → Versicherung
   → Rundfunkbeitrag letter → Zoll package → BOSS Formular-Hydra.
4. **Die Jobsuche**: Orientierung → Stellenanzeige → Lebenslauf → Anschreiben → Anruf →
   Generalprobe → BOSS Vorstellungsgespräch (Frau Weber).
5. **Gesund & Sozial** (Kiez/Stadtpark): Arzttermin → Apotheke → Stammtisch → Verein → Wochenende
   → BOSS Einweihungsfest (the whole cast on one stage).
6. **Mein Ziel** (player-chosen endgame): Die Karriere (office life), Die Traumwohnung, Die
   Einbürgerung, Das eigene Projekt (you become the helper NPC for a newcomer), or Die Prüfung
   (optional exam path).

### A sample mission, abbreviated (the shape you should match)
Mission **1.6 "Die Anmeldung"** (Chapter-1 boss), a graph of scenes:
1. `websiteParody` — the Termin booking site shows "Nächster freier Termin: in 8 Wochen". Choice:
   wait 8 weeks (safe) or show up spontan at 6 a.m. (harder, faster) — a real trade-off.
2. `loadout` — pack the bag: collect Personalausweis, Mietvertrag, Wohnungsgeberbestätigung; each
   is a short retrieval exercise.
3. `listening` — the waiting room: a number-board TTS announcement + comprehension checks.
4. `dialogueBattle` — Frau Schmidt, rapid Beamtendeutsch. Redemittel are moves; Konjunktiv II
   crits; she demands documents (bag `ask` nodes); a missing document routes to a fetch quest.
5. `formCloze` — the Anmeldeformular as typed cloze; sign + stamp finale. Reward: the
   **Meldebestätigung** key item (which Chapter 3 will demand).

### What I think is currently WEAK (the reason I'm asking you)
- The **story** is a to-do list: passport, ticket, SIM, shop, flat, Anmeldung. There is no
  personal *want* pulling the player through, stakes are flat, and the NPCs are thin.
- The **missions** repeat in shape and the choices rarely have real consequences; the emotional
  spine (why do I care?) is missing.

Confirm you have understood all of the above, then wait for my specific question.

## ↑↑↑ Copy to here

---

### How to use this file
1. Paste everything between the "Copy from here" markers into a fresh chat.
2. Let the model confirm understanding.
3. Then paste ONE targeted prompt from `BRAINSTORM_TOOLKIT.md`.
4. Bring the winning output back to the Genauly repo (or to Claude Code) to turn into missions.
