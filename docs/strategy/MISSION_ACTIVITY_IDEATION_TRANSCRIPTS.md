# Mission-activity ideation: the multi-agent transcripts (session 74)

_Status: **ARCHIVE, verbatim** (2026-07-06). This file preserves the complete multi-agent
brainstorm commissioned by the founder: the brief given to each expert persona and each
persona's full, unedited report. It complements `MISSION_ACTIVITY_RESEARCH.md` (the synthesis
those reports were merged into) and `CHAPTER1_GAMEPLAY_DECK.html` (the founder-facing deck).
Because the reports are quoted verbatim, the house no-em-dash rule is waived inside the quoted
sections only._

## How the brainstorm was run

- **Commission (founder, verbatim):** "I want you to do write a robust plan on researching,
  brainstorming and ideating what kind of questions and activities should be part of the
  missions - just sharing an idea but you could also use different approach if better - may be
  you could use multiple agents with various personalities like expert german teacher meets
  expert game developer meets expert in german literature to ideate this."
- **Setup:** four expert personas ran IN PARALLEL as independent subagents, each blind to the
  others' work, each grounded in the same repo sources (`docs/strategy/GAME_DESIGN.md`,
  `src/data/missions.ts`, `src/types/game.ts`) and the founder's playtest feedback.
- **Models:** per the founder's session-73 budget decision (save Fable usage), the two
  judgment-heavy personas (DaF teacher, game designer) ran on Opus 4.8 and the other two
  (culture expert, market researcher) on Sonnet 5. The lead session synthesized the reports.
- **Outcome:** the merged catalog, rules and adoption order live in
  `MISSION_ACTIVITY_RESEARCH.md`; the chapter-1 scripts built on them live in the deck.

---

## Persona 1 · DaF-Didaktikerin (B1-B2, telc/Goethe examiner) — brief

> You are role-playing a specific expert persona for a product-design ideation exercise.
> Persona: a veteran DaF-Didaktikerin (German as a Foreign Language teacher) with 20 years of
> experience teaching adult immigrants at B1-B2, a licensed telc and Goethe examiner, deeply
> versed in task-based language teaching (handlungsorientierter Unterricht), SLA research
> (retrieval practice, comprehensible input/output, focus-on-form), and the specific failure
> modes of the intermediate plateau.
>
> [Grounding: GAME_DESIGN.md, missions.ts, types/game.ts. The founder's playtest feedback to
> answer: (a) too many moments are multiple-choice lists where two options are both "nice" so
> the choice feels meaningless; (b) when an official asks for the Personalausweis, the answer
> should be ACTING (tapping the ID card in your bag), not picking a sentence; (c) much more
> VARIETY in question/activity types; (d) minimal on-screen text, interaction-first.
> Deliverable: activity-type catalog (12-18 entries with competence + SLA principle + scene-kind
> fit + CEFR), meaningful-choice design rules with worked Anmeldung examples, feedback &
> error-handling design, per-mission pedagogy notes for 1.1-1.6, top 5 don'ts.]

### Persona 1 · full report (verbatim)

# Neuland: Aktivitätentypen, Entscheidungsdesign und Fehlerkultur

Von einer DaF-Didaktikerin (B1–B2, telc/Goethe-Prüferin). Kurzurteil zur Playtest-Kritik: ihr habt recht. Die B1–B2-Plateauphase bricht nicht durch Wiedererkennen auf, sondern durch *Handeln unter Situationsdruck*. Wo im echten Amt gehandelt und produziert wird, darf das Spiel nicht multiple-choice-tippen lassen. Unten liegt die Antwort ist eine Handlung überall vor dem Satz-Auswählen.

## 1. Aktivitäten-Katalog

Format: **Name** · was der Lernende TUT · Kompetenz · warum (Prinzip) · Scene kind · CEFR.

1. **Dokument ziehen** · Beamter sagt "Ihren Personalausweis, bitte", der Spieler tippt/zieht das richtige Item aus der Tasche (nicht einen Satz). · Hören + Wortschatz · situated cognition, transfer-appropriate processing: geübt wird die reale Abrufsituation. · erweitert `dialogueBattle` (das `requiresItem`-"Dokument zeigen" existiert schon) · A2–B1.
2. **Regal-Suche** · im Supermarkt das genannte/gesuchte Produkt am deutschen Etikett unter Ablenkern antippen. · Lesen + Wortschatz · dual coding (Wort–Bild) plus Abruf. · neuer minigame-Prop, verwandt mit `websiteParody` · A2–B1.
3. **der/die/das-Kisten** · Wörter in drei Genus-Kisten sortieren (Zeitdruck, Späti-Auftrag). · Grammatik (Genus) · retrieval + spacing; Genus als Item, nicht als Regel. · neuer Prop (in §10 schon angedacht) · A1–B1.
4. **Leergutautomat** · Flaschen einfüttern, jede akzeptierte Flasche ist ein Blitz-Abruf, Fehler spuckt sie zurück. · gemischt · spaced retrieval, sichtbares Erfolgssignal. · neuer Prop · alle Bänder.
5. **Wegweiser hören** · Ansage/Jonas beschreibt den Weg, Spieler tippt Route/Ziel auf der Karte. · Hören + Präpositionen/Richtungen · TPR (Handeln auf Sprachbefehl), selektives Hören. · erweitert `listening` · A2–B1.
6. **Aufruf abfangen** · im Wartezimmer im Zahlenrauschen genau die eigene Nummer/den Schalter antippen, wenn sie fällt. · Hören (Zahlen) · selektives Hören unter Störung. · erweitert `listening` (das `ticker`-Feld existiert) · A2–B1.
7. **Terminwahl** · aus echten Slots einen wählen, der zur Vorgabe passt ("vormittags, nächste Woche"). · Lesen + Datum/Uhrzeit · Verarbeiten authentischer Textformate. · erweitert `websiteParody` · A2–B1.
8. **Anzeige entschlüsseln** · Abkürzungen in WG-/Kleinanzeigen antippen, um sie zu entfalten (2er-WG, NK, WM, NR). · Lesen + Pragmatik · Schema-Aufbau für Textsorten. · erweitert `websiteParody` · B1–B2.
9. **Register-Regler** · eine Bedeutung, der Spieler schiebt zwischen du/Sie bzw. locker/förmlich, die NPC-Reaktion (Augenbraue, Geduld) ändert sich live. · Pragmatik/Register · focus on form, noticing der Registerwirkung. · erweitert `dialogueBattle` · B1–B2.
10. **Nachfrage-Geste** · Beamtendeutsch verstanden nicht, Spieler löst mit "Wie bitte?"/"Können Sie das anders sagen?" einen Recast aus. · Interaktionskompetenz · negotiation of meaning (Long): Nichtverstehen wird zum Zug, nicht zum Fehler. · erweitert `dialogueBattle` · B1.
11. **Typ-Zug (Cloze)** · das Schlüsselwort eines Battle-Satzes in die Lücke tippen, um den Zug voll zu landen. · Schreiben/Wortschatz · generation effect, pushed output. · bereits im `BattleMove.cloze` angelegt · B1–B2.
12. **Sprech-Zug** · den Zug per Mikro sagen, höchste XP-Stufe der Leiter. · Sprechen/Aussprache · output hypothesis (Swain): Produktion zwingt zur Verarbeitung. · nutzt vorhandenes STT/pronounce · B1–B2.
13. **Körper zeigen** · Arzt fragt "Wo tut es weh?", Spieler tippt die Körperstelle. · Hören + Wortschatz · TPR + dual coding. · neuer Prop (Kapitel 5) · A2–B1.
14. **Kollokations-Paare** · Nomen an sein Verb ziehen (Antrag stellen, Termin vereinbaren, Frist einhalten). · Wortschatz/Grammatik · formulaic sequences (Wray): Chunks statt Einzelwörter brechen das Plateau. · neuer Prop über die `collocations`-Bank · B1–B2.
15. **Fallenklausel finden** · im Mietvertrag die riskante Stelle antippen (Schönheitsreparaturen, Kaution, Nebenkosten). · Lesen (Detail) + Pragmatik · kritisches Lesen, noticing des Relevanten. · erweitert `websiteParody`/`formCloze` · B2.
16. **Schritte ordnen** · den Behördenablauf in die richtige Reihenfolge ziehen (erst Termin, dann Unterlagen, dann Anmeldung). · Pragmatik/Lesen · prozedurales Schema, Handlungsorientierung. · neuer Prop · B1.
17. **Small Talk steuern** · das Gespräch mit anschlussfähigen Zügen am Laufen halten, Sackgassen vermeiden (Besichtigung, Stammtisch). · Sprechen/Pragmatik · interactional competence. · erweitert `dialogueBattle` (`smalltalk`-Effekt) · B1–B2.
18. **Formular ausfüllen** · Felder tippen/wählen unter Formsprache. · Schreiben/Grammatik · generation effect, authentische Textsorte. · bestehender `formCloze` · B1–B2.

Regel für die Mischung: pro Mission mindestens ein *Handeln-in-der-Welt*-Typ (1, 2, 3, 5, 13), ein *produktiver* Typ (11, 12, 18) und höchstens ein reiner Auswahl-Moment.

## 2. Regeln für bedeutsame Entscheidungen

Eine Wahl ist nur dann eine Wahl, wenn sie eine Bar bewegt, eine Ressource kostet, eine Registerlinie festlegt oder eine Information voraussetzt, die man sich erarbeiten musste. Vier Hebel:

- **Registerfolge, die bindet:** eine Registerwahl senkt/hebt eine Obergrenze für den Rest der Szene, nicht nur einen einzelnen Treffer.
- **Informationslücke:** die richtige Wahl ist nur erkennbar, wenn man vorher gelesen/gefragt hat (information gap statt Ratespiel).
- **Irreversible Ressourcenkosten:** Zeit, Geld (Pfandgeld), Müdigkeit, verbrauchte Jonas-Karte.
- **Verpflichtung, die später einlöst:** eine frühe Zusage taucht Missionen später wieder auf.

**Worked example A (irreversible Ressourcenkosten).** Der Termin-Screen bietet heute "8 Wochen warten" gegen "um 6 Uhr anstehen", beide führen aber ins gleiche `packen`. Das ist Deko. Neu: Warten überschreitet die gesetzliche Zwei-Wochen-Frist und setzt einen Verwarnungs-Nebenquest (Bußgeld in Pfandgeld); Anstehen kostet "Müdigkeit", die den `mutStart` gegen Frau Schmidt von 60 auf 45 drückt. Jetzt wägt der Spieler echt ab.

**Worked example B (Registerfolge, die bindet).** Der Eröffnungszug `b1_du` ("Hey, ich brauch schnell...") darf nicht nur einmalig Geduld kosten. Er senkt Frau Schmidts Geduld-*Decke* für die ganze Begegnung (spätere gute Züge deckeln früher). Wer förmlich eröffnet ("Guten Morgen, wären Sie so freundlich..."), hält die volle Decke. So lernt der Spieler, dass Register eine Rahmung ist, keine Einzelvokabel.

**Worked example C (Informationslücke im Loadout).** `packen` legt aktuell die drei Slots offen. Neu: die Tasche hat mehr Fächer als nötig, mit Ablenkern (Vollmacht, Gebühr, Bescheid), und *welche* Papiere Frau Schmidt verlangt, verrät nur der Website-Hinweis ("alle Unterlagen im Original") oder eine verbrauchte Jonas-Frage. Wer den Text überflog, packt falsch und landet im Fetch-Quest. Die Wahl "sorgfältig lesen oder losstürmen" bekommt eine Konsequenz, und Lesen wird belohnt, nicht bestraft.

## 3. Feedback und Fehlerbehandlung

Erwachsene auf dem Plateau steigen aus, wenn sie sich blamiert fühlen (affektiver Filter, Krashen). Fehler müssen lehren, ohne die Immersion oder die Würde zu brechen.

- **Recast statt Kreuz.** Falscher/holpriger Zug: die NPC wiederholt korrekt eingebettet, ohne Metakommentar. "Ich brauch die Anmeldung" wird beantwortet mit "Sie *möchten* sich also *anmelden*. Gut." Das Modell steht im Fluss, kein rotes X.
- **Nichtverstehen ist ein Zug, keine Niederlage.** Der Nachfrage-Zug (Typ 10) triggert eine Umformulierung. So wird die reale B1-Überlebensstrategie (um Wiederholung bitten) belohnt statt bestraft.
- **Uptake-Fenster.** Nach einem Recast bekommt der Spieler *eine* Gelegenheit zur Selbstreparatur (den Zug neu sagen/tippen). Gelingt sie, gibt es einen kleinen Mut-Bonus. Das ist der Moment, in dem Lernen passiert.
- **Verzögerte Korrektur.** Explizite Fehleranalyse gehört nicht mitten ins Gespräch, sondern auf den Debrief-Screen danach oder in eine Jonas-Nachricht ("Tipp: bei Ämtern immer Sie"). Mid-flow bleibt es Welt-Reaktion (Augenbraue, Seufzen, Geduld sinkt), nie Toast.
- **FSRS als Konsequenz.** Ein misslungener Zug senkt die Stabilität der betroffenen Vokabel/Redemittel, sodass genau diese Lücke als Errand/Variante wiederkommt. Der Fehler plant seine eigene Wiederholung.
- **Fehler nie als Sackgasse.** Verlorene Battles laufen über `onLose` in einen gerüsteten Retry (das existiert schon, gut so). Das Rüstzeug, das reingereicht wird, muss exakt die Lücke schließen.

## 4. Pädagogik-Notizen zu den Missionen 1.1–1.6

**1.1 Willkommen in Neuland** · Ziele: Begrüßungs- und Höflichkeitsformeln, W-Fragen an der Kontrolle verstehen ("Woher? Wie lange?"), erste Richtungen. · Best-fit: **Dokument ziehen** (Pass an der Kontrolle zeigen) als Tutorial für die Kern-Mechanik, plus **Wegweiser hören** zum Zug. · A2. Textarm halten, hier wird die Handlung gelehrt.

**1.2 Der Fahrkarten-Automat** · Ziele: Tarifzonen/Verbindung-Wortschatz, Preise und Zahlen lesen, eine Automaten-UI dekodieren. · Best-fit: **Terminwahl**-Variante (Zone/Ticket aus echten Optionen wählen) am parodierten Automaten, sicheres Battle-UI-Tutorial gegen einen Gegner mit unendlicher Geduld. · A2–B1.

**1.3 Die SIM-Karte** · Ziele: Prepaid vs. Vertrag vergleichend lesen, einen Upsell höflich, aber bestimmt ablehnen ("Nein danke, das brauche ich nicht"), Vertrags-Schlüsselwörter. · Best-fit: **Register-Regler** / registermarkierte Entscheidung, die erste echt bindende Wahl (zu weich zugesagt = teurer Vertrag im Gepäck). · B1.

**1.4 Der erste Einkauf** · Ziele: Lebensmittel und Mengen, das Pfand-System kulturell verstehen, Etiketten lesen. · Best-fit: **Regal-Suche** (Etikett-Scan) plus **Leergutautomat** als Abruf-Minispiel. · A2–B1. Ideal, um Handlung-vor-Satz zu zeigen.

**1.5 Ein Dach über dem Kopf** · Ziele: Wohnungs-Wortschatz, das erste echte Formular (Wohnungsgeberbestätigung), Nomen-Verb-Chunks (Formular ausfüllen, Unterschrift leisten). · Best-fit: **Formular ausfüllen** (`formCloze`) mit vorgeschaltetem **Kollokations-Paare**-Warm-up. Baut bewusst die Dokumentenkette zu 1.6. · B1.

**1.6 BOSS: Die Anmeldung** · Ziele: Behördendeutsch verstehen (inkl. Nachfragen als Strategie), formales Register mit Höflichkeits-Konjunktiv, Dokumente auf Aufforderung präsentieren. · Best-fit: **Dokument ziehen** als Kern der `dialogueBattle` (auf "Ihren Personalausweis?" tippt man die Karte, man wählt keinen Satz), gestützt durch Typ-/Sprech-Züge. · B1.2–B2.1. Genau hier muss die Playtest-Kritik (b) sichtbar eingelöst werden.

## 5. Die fünf Don'ts (aus Klassenzimmer und Prüfung)

1. **Keine folgenlosen "nice/nice"-Optionen.** Wenn keine Bar, keine Ressource und keine Registerlinie sich bewegt, ist es keine Entscheidung, sondern Deko. Jede Option muss etwas kosten, festlegen oder freischalten.
2. **Nicht Wiedererkennen abfragen, wo die Situation Produktion verlangt.** Das echte Amt lässt handeln und sprechen, nicht ankreuzen. Auswahl ist die unterste Stützstufe, nicht das Ziel; wo immer möglich: tippen, tippen (Karte), reden.
3. **Fehler nie mit Aussperrung oder Scham bestrafen.** Rotes X und Lockout treiben genau die Plateau-Lernenden aus dem Spiel. Recast, Uptake-Fenster, gerüsteter Retry. Der affektive Filter entscheidet über Weiterlernen.
4. **Die Szene nicht in Text und Glossen ertränken.** Überstützung tötet das Noticing, und der Input wird zur Tapete. Bild trägt die Bedeutung, D/E nur auf Abruf, Prosa minimal. Weniger Wörter, mehr Welt.
5. **Keine isolierten Einzelwörter, keine falsche Authentizität.** Chunks und ganze Sprechhandlungen unterrichten (Antrag stellen, Frist einhalten, sich höflich weigern), denn formelhafte Kompetenz bricht das Plateau. Und: Beamtendeutsch, das so in keinem echten Amt fällt, lehrt das falsche Modell. Lieber knapp und echt als lang und erfunden.

---

## Persona 2 · Veteran game designer — brief

> Persona: a veteran game designer with 15 years shipping 2D RPGs and adventure games (deep
> knowledge of Pokémon, Zelda, Stardew Valley, Ace Attorney, Papers Please, Return of the Obra
> Dinn, WarioWare) plus serious-games experience; obsessed with diegetic UI, meaningful choice
> architecture, and "show, don't quiz" design.
>
> [Same grounding + founder feedback. Deliverable: interaction-verb catalog (15-20 entries with
> build cost), choice-architecture rules applied as rewrites of the shipped Frau-Schmidt battle,
> bag design spec (incl. the Wörterbuch as a limited item), full-screen scene grammar for a
> phone, boss/pacing notes for the 6-mission chapter arc.]

### Persona 2 · full report (verbatim)

# Neuland: making the mission play like a game, not a quiz in a costume

A note before the catalog. The shipped Anmeldung is genuinely good bones. The problem the founder is feeling is real but narrow: the battle and the website scenes resolve to **vertical lists of full sentences you read and tap**, and the bag only exists at the loadout, then vanishes. Both are fixable without touching the mission-as-data architecture. Most of what follows reuses `dialogueBattle`, `websiteParody`, `loadout`, and `formCloze` with a richer renderer, plus three or four genuinely new scene kinds worth building.

## 1. Interaction-verb catalog

Format per entry: **what the hand does** / example beat / why it beats a multiple-choice list / build cost.

1. **Give item (drag from bag onto NPC/hand).** Frau Schmidt says "Ihren Ausweis, bitte." You drag the Personalausweis card out of the persistent bag onto her outstretched hand. Beats MCQ because the *object* is the answer, not a sentence describing the object; the ID request is the single most-repeated real bureaucratic beat and should never be a text button. Cost: **new renderer** (drag target on the battle stage), reuses `requiresItem` logic already in `BattleMove`.

2. **Point-at-object-in-scene (tap a hotspot in the pixel art).** The Aufruf board flashes "112". You tap *your* number on the board, not a "that's me" button. Or: the notice says "Schalter 2", you tap counter 2 to walk there. Beats MCQ because comprehension is proven by acting on the world. Cost: **new renderer** (tappable scene hotspots), thin engine glue.

3. **Walk-to (tap a floor destination, sprite pathfinds).** Enter the Amt: walk your sprite from the door to the right counter past the wrong ones. The loadout becomes walk-and-pick (already the founder's stated intent). Beats a menu because navigation is orientation practice and sets place. Cost: **new renderer** (tile walk), no new engine; scene just declares waypoints.

4. **Sort (drag items into bins/columns).** Der/die/das crate-sorting at Herr Nguyen's; or sort a pile of Unterlagen into "brauche ich heute" vs "kann weg". Beats MCQ because it is N judgments in one gesture and self-paces. Cost: **new renderer**, reuses vocab bank.

5. **Stamp (press a stamp onto the correct field).** The form needs a Stempel on the signature line, not the date line. You pick up the stamp and slam it. Pure kinesthetic punctuation to a form scene. Beats a "which line?" MCQ because the *thunk* is the reward. Cost: **new renderer** on top of `formCloze`.

6. **Sign (trace/hold to sign a line).** Drag a finger across the Unterschrift line to commit the Wohnungsgeberbestätigung. A ritual beat that says "this is binding." Cost: small renderer, reuses `formCloze`.

7. **Dial / press buttons (a rendered keypad or Automat).** The DB Automat (mission 1.2) and phone calls (Der Anruf) become real button-mashing: enter the Tarifzone, dial the Praxis number read aloud. Beats MCQ because sequence + a wrong-key buzz is a machine, not a quiz. Cost: **new renderer** (keypad prop), fits `websiteParody`'s prop pattern.

8. **Type-under-timer (the checkout / cloze with a gentle clock).** Supermarket Kasse: the cashier scans fast, you bag and pay before the queue sighs. The existing `cloze` field gains an optional soft timer. Beats MCQ because pressure produces retrieval, not recognition. Cost: **reuses `formCloze`/battle cloze** + a timer flag. This is Prüfungsmodus's native verb.

9. **Listen-and-act (audio triggers a physical response, not a quiz after).** You hear "Nummer 112 zu Schalter 3" and must *stand up and walk* on the right number, or the announcement says "Gleis 4" and you tap platform 4. Beats the current listening scene (audio then MCQ) because you act *during* the audio. Cost: **new renderer** wrapping `listening`, engine already emits audio.

10. **Barter / negotiate (a slider or offer-counteroffer exchange).** Flea market, or salary Konjunktiv with Frau Weber: propose a number, NPC counters, you hold or push. Beats MCQ because the *quantity* is the choice and there is a real frontier. Cost: **new engine** (offer/counter state machine), high value, save for chapter 4.

11. **Queue-jockeying (hold your place while events tempt you).** The 6-Uhr line: someone tries to cut, a neighbor makes small talk, the door opens. Do you defend your spot, chat (bag XP), or bolt? The waiting-beat made playable. Beats a loading screen because the wait *is* the scene. Cost: **new renderer**, reuses cutscene choices with a position meter.

12. **Assemble / build (drag parts in order).** Flat-pack furniture from German imperative instructions (mission 2.4): "Stecken Sie A in B." Beats reading-then-MCQ because you follow an instruction with your hands. Cost: **new renderer**, reuses reading bank.

13. **Match-pairs (drag connectors).** Match Amt vocabulary to its icon, or a Behörde to what it does. A fast warm-up verb. Beats a list because it is spatial and timed-able. Cost: **light new renderer**.

14. **Redact / find-the-trap (tap the suspicious clause).** Mietvertrag reading (2.3): tap the Schönheitsreparaturen trap clause hidden in a wall of text; wrong taps cost nothing but time. Beats a "which clause is bad?" MCQ because you hunt in authentic layout. Cost: **new renderer** over the reading/text bank, high reuse.

15. **Pour / measure / dose (a quantity gesture).** Apotheke: set the dosage on a rendered blister pack ("zweimal täglich"). Cost: small renderer, chapter 5.

16. **Steer-the-topic (tug a drifting conversation back).** Small-Talk-Falle status: a topic-bubble drifts off-screen; you tap the on-theme Redemittel to yank it back before it exits. Beats MCQ because the drift is *shown*. Cost: **new renderer** on `dialogueBattle`, reuses the effect flag already in types.

17. **Scan / photograph (Wort-Safari, real camera).** Point the phone at a real German sign to bag the word with a personal badge. Already specced §10. Cost: **new renderer**, device camera, on-device only.

18. **Tap-to-collect in the world (Pfand pickup).** Bottles glint in the scene; tap to bag, feeding the Leergutautomat mini-game. Beats nothing, it *is* the ambient verb that makes the world feel alive and funds the shop. Cost: **light**, shared hotspot system with #2.

19. **Hold-to-wait / skip (a diegetic time dial).** The fictional in-game clock (§4): spin it forward to skip a wait, or drop into an engage-beat. Cost: **light renderer**.

20. **Reorder / rank (drag a list into priority).** Versicherungs-Dschungel (3.2): rank insurances essential to nonsense; wrong order costs in-game money, not progress. Beats MCQ because it forces a *whole model*, not one pick. Cost: **new renderer**, reuses reading bank.

The through-line: about six new renderers cover fifteen of these, and every one is *data-declared* against banks you already have. Prioritize **give-item, point/walk, listen-and-act, and topic-steer** first; they retrofit directly into the shipped mission.

## 2. Choice-architecture rules, applied to Frau Schmidt

The founder's exact complaint is node `b1`: `b1_krit` (Konjunktiv II crit) and `b1_ok` (höflich fragen) are both "nice" and differ only in bar magnitude. Same at `b4`. RPGs make choices matter with six levers. Apply each:

**Rule 1: Resource cost.** A choice that spends something is never a throwaway. *Rewrite b1:* the polite-but-plain `b1_ok` costs you a **turn** (Frau Schmidt just says "Ja, und?" and you must produce a second move), while `b1_krit` advances immediately. Now "nice" and "excellent" differ in *tempo*, not just a number the player barely reads.

**Rule 2: Time pressure.** Geduld should visibly tick down *while you deliberate* at hard nodes, not only when you fumble. *Rewrite b3* (the Beamtendeutsch node): a slow Geduld drip starts the moment she finishes her §19 sentence. Reading the D gloss is free, but dithering between three long buttons now has a felt cost, which is exactly the real-life feeling.

**Rule 3: Information asymmetry.** Hide which move is "crit" until the player understands *why*. *Rewrite:* strip the `tag: "Konjunktiv II"` and `crit` telegraph from the button face; reveal the crit flourish only *after* it lands, in the feedback. The current UI labels the right answer ("Konjunktiv II") like a quiz key. Let the player earn the read.

**Rule 4: Delayed consequence.** A choice should pay off two beats later. *Rewrite b2 vs b4:* if you burned the Nachfragen move at `b2` ("Gilt auch eine Kopie?"), Frau Schmidt at `b4` is pricklier and withholds the pen (`b4_krit` misfires) because you have spent her goodwill. One shared "Geduld reserve" that carries across nodes turns four isolated MCQs into one conversation with memory.

**Rule 5: Reactive NPC.** The world reacts visibly, which the mission already does well (the eyebrow, the sigh). Push it further: *rewrite the du-form `b1_du`* so it is not just a big negative delta but a **status effect**: Frau Schmidt switches to denser Beamtendeutsch for the rest of the fight (apply `beamtendeutsch` early). The rude choice makes the language *harder*, a consequence you feel in comprehension, not a hitpoint.

**Rule 6: Visible bar deltas as the feedback channel.** Show the hit land on the bar with a punchy animation and a floating number, *before* any text. *Rewrite the whole battle:* the player should be able to play a node watching the two bars and the NPC's face, gloss-off. Right now the deltas are silent data; make them the primary readout so the sentences become *moves* you throw, not answers you select.

Net effect on `b1`: instead of two nice options and one trap, you get one move that costs a turn, one that spends goodwill you will miss later, one that lands a hidden crit, and one that mutates the enemy. Four *different kinds of consequence*, zero "which nice sentence."

## 3. The persistent bag

**How the masters do it.** Pokémon keeps the Bag one button from every battle, categorized (Items / Poké Balls / Key Items), and using an item *is a turn*. Zelda binds items to the face buttons and to physical verbs (the hookshot is a verb, not an inventory line). The lesson: an always-visible bag only feels good when items are **verbs you perform on the world**, not a menu you browse.

**Neuland spec.** A slim bag rail lives at the **bottom edge of the game frame at all times**, 4 to 5 slot silhouettes, pixel-art icons, never app cards. Tap to expand into a Pokémon-style pouch with tabs mapped to the item classes already in GAME_DESIGN §6: **Dokumente** (key items), **Redemittel** (moves), **Wortkarten**, **Verbrauchsgüter** (Kaffee/Döner), **Pfand**.

**When it pulses/hints.** The bag glows softly and the *relevant tab* lifts when a scene poses a demand the bag can meet: Frau Schmidt says "Ihren Ausweis," the Dokumente tab pulses once. This is the Zelda "the item you need just became relevant" nudge. It never auto-solves; it says "look here." Pulse decays after one beat so it teaches, then trusts.

**How "hand over item X" plays.** NPC extends a hand (a rendered hotspot). Player opens the bag, drags the Personalausweis onto the hand. Correct item: she takes it, Geduld holds, a satisfying stamp. This replaces `b2_doc` as a *button* with `b2_doc` as a *gesture*, using the exact `requiresItem`/`nextIfMissing` branch already in the data.

**Wrong-item comedy (this is the fun).** Drag the Pfandbon instead of the Ausweis: Frau Schmidt stares, "Das ist ein Pfandbon." (small Geduld hit, big laugh). Drag the Döner: she recoils. Wrong items are never punished with a fail; they are punished with *deadpan*, which is the whole tone of the game. Author one or two joke reactions per boss; cheap, high delight.

**The Wörterbuch as a limited resource, not a cheat button.** This is the key move for the founder's "English help should feel like a game resource." Put the **Wörterbuch** in Verbrauchsgüter as an item with **charges** (say 3 per mission, refilled by Pfand or by beating a mission gloss-free). Tapping E on a line spends nothing *cosmetically small*, but "translate the whole NPC turn" spends a Wörterbuch charge and visibly ticks it down. Jonas's wild-card rescue is the *big* version (once per mission, full translate + a lesson). Now English is a rationed lifeline you *choose* to spend, the same dopamine as saving a Full Restore, instead of a guilt-free escape hatch that undercuts the German. Prüfungsmodus simply removes the Wörterbuch from the bag entirely.

## 4. Full-screen scene grammar

The founder wants everything *inside the frame* in the pixel language. Here is the phone-first layout, drawn from GBA JRPG and modern indie convention (Pokémon FR/LG, Ace Attorney, Stardew, Obra Dinn's committed diegesis).

**The frame owns the whole viewport.** No app chrome (`/welt` is already in the focus-mode gate, good). Portrait phone, three horizontal bands:

- **Stage (top ~55%).** The pixel backdrop (the scene-7 Amt room). Sprites, hotspots, drag targets, and the walk floor all live here. Battle HUD (Geduld bar top-left over the NPC, a small NPC portrait; Standing/Mut bar bottom-left over the player) sits *inside* the stage as a diegetic overlay, GBA-style, never a floating card.
- **Dialogue box (bottom ~30%).** A single, opaque, high-contrast textbox pinned to the bottom, the Ace Attorney/Pokémon convention: chunky border, one or two lines of German at display size, a name tag, the D/E buttons as *small pixel tabs on the box itself*. Text advances on tap. Readability rules that survive on a phone: opaque dark box with a light face (never text straight on art), a bitmap/pixel-friendly font at large size, max ~2 lines visible, reveal by typewriter so the eye tracks.
- **Bag rail + input (bottom edge, ~15%).** The persistent bag slots. When a scene needs choices, the **move/choice buttons rise from the bottom over the dialogue box as pixel-framed options**, max three, styled as the same material as the box, so they read as *part of the machine*, not app cards floating on a stage. This is the single biggest visual fix: the current stacked cards should become framed "command window" options anchored bottom, like Pokémon's Fight/Bag/Run box.

**Rules that keep it a game, not a form:**
- One decision surface at a time. Never a card *and* a textbox *and* a menu competing.
- Options are ≤3 and short. Long sentences move *into* the dialogue box as the spoken move; the button shows the *move name/gist*, not the whole utterance (Pokémon shows "Tackle," not the sentence).
- HUD is diegetic and lives on the stage. Bars, portraits, item counts render in the art layer.
- Everything tappable is *in* the picture. If the answer is "counter 2," counter 2 is on screen and tappable.

## 5. Chapter 1 boss/pacing notes (6 missions to Frau Schmidt)

The arc is a difficulty ramp where **each mission introduces exactly one new mechanic**, so the boss can combine them without teaching anything new. One signature set-piece each.

1. **Willkommen (tutorial).** Mechanic: D/E gloss, word-bagging, tap-a-choice, **walk-to**. Difficulty: floor, no fail state. Set-piece: carrying two suitcases down the platform while Jonas talks, learning to walk and read at once.
2. **Der Fahrkarten-Automat.** New mechanic: **the two-bar battle UI + dial/keypad**, safely, against a machine (infinite Geduld, it eats coins instead of ending you). Set-piece: the Tarifzone riddle, the Automat's smug "Zahlung fehlgeschlagen."
3. **Die SIM-Karte.** New mechanic: **register-marked choices with a real consequence** (the upsell) + contract-reading prop. First time a "nice" choice and a "firm" choice *diverge* (accept the upsell = poorer, funnier later). Set-piece: the salesman's Vertrag-vs-Prepaid pitch as a barter-lite exchange.
4. **Der erste Einkauf.** New mechanic: **type-under-timer** (the checkout) + **tap-to-collect Pfand** + the Leergutautomat micro-review. Set-piece: the legendary Kasse speed run with its self-deprecating fail ("Sie halten die Schlange auf").
5. **Ein Dach über dem Kopf.** New mechanic: the **form scene (formCloze) + sign/stamp** verbs, and the **key-item dependency chain** (you earn the Wohnungsgeberbestätigung that 1.6 will demand). Set-piece: the landlord's signature ritual, the document slotting into your bag with a *clunk*.
6. **BOSS: Die Anmeldung.** Introduces *nothing new*. It **stacks all five**: loadout (walk-and-pick, from 1.1), listening-and-act in the Wartezimmer (from 1.4's audio), give-item to Frau Schmidt (from 1.5's documents), the full two-bar battle with the six choice-architecture rules above (from 1.2/1.3), and the formCloze finale with stamp/sign (from 1.5). New *intensity*, not new *verbs*. The signature set-piece is the battle itself: Frau Schmidt's Beamtendeutsch status effect, the §19 wall of German, and the Konjunktiv II crit that makes her *almost* smile. Difficulty peak of the chapter; the scaffolded `rueckschlag` retry (already shipped) guarantees it is a wall you climb, not one you bounce off.

**Ramp shape:** each mission adds one verb and raises the CEFR band a notch (B1.1 to B1.2), so by the boss the player has every tool and the only new thing is doing them all under Frau Schmidt's gaze. That is how a boss should feel: a test of what the chapter taught, never a lesson itself.

---

## Persona 3 · German culture & literature expert — brief

> Persona: a German culture and literature expert (Germanistik background), a keen observer of
> everyday German life and its comedy (Loriot, Kafka's bureaucracy, modern Alltagssatire), with
> an immigrant's eye for the unwritten rules newcomers trip over; expert in authentic German
> text genres (Amtsbriefe, Kleinanzeigen, Werbeprospekte, Aushänge, Formulare, Fahrpläne,
> Speisekarten).
>
> [Same grounding + the six-mission chapter list. Deliverable: authentic-prop catalog for
> chapter 1, cultural comedy beats per mission, unwritten-rules moments, register & voice notes
> for the cast, text-genre difficulty ladder.]

### Persona 3 · full report (verbatim)

# Chapter 1 "Ankommen": Authentic Text-Genre &amp; Comedy Design Notes

*Grounded in `docs/strategy/GAME_DESIGN.md` and the shipped `m_kap1_anmeldung` mission. Written for the G2 authoring pass on missions 1.1 to 1.5.*

## 1. Authentic-prop catalog

**Zoll-Schilder, grün/rot (1.1)**: two lane signs at customs, "Anmeldefreie Waren" (green) versus "Anmeldepflichtige Waren" (rot). Challenge: the player must pick a lane from two compound nouns before a cutscene timer runs out. Lesson: Germany sorts you into a category before you have said a single word. Bureaucracy starts at the gate, not the counter.

**Abfahrtstafel im Bahnhof (1.1)**: yellow departure board, Zeit, Ziel, Gleis, and a small "ca. 10 Min später" in orange. Challenge: match the correct Gleis before boarding. Lesson: the punctuality myth meets its first correction five minutes after landing.

**DB-Fahrkartenautomat-Bildschirm (1.2)**: a touchscreen tree, Ziel eingeben, Tarifzone A/B/C oder ABC, Zeitkarte oder Einzelfahrt. Challenge: the zones nest inside each other with no visual overlap shown, so the "cheap" option is a guess. Lesson: German infrastructure trusts you to already understand the system it never explained to you.

**Liniennetzplan (1.2)**: a color-coded transit map with concentric tariff rings drawn over it like a dartboard. Challenge: find your stop's ring before the machine's coin slot times out. Lesson: the map is beautiful and nearly unreadable to a first-timer, form has won over guidance.

**Fahrschein/Quittung (1.2)**: a thermal printout, Hinfahrt, Klasse 2, Sparpreis, a stamp field marked "entwerten". Challenge: realizing a paper ticket for the tram still needs stamping in a small blue box even though the DB ticket does not. Lesson: every transport mode has its own silent ritual, and skipping one is how you meet the Kontrolleur.

**Prepaid-Tarif-Werbeplakat (1.3)**: shop-window poster, "Flex-Flat XL", "Datenvolumen 20 GB", a crossed-out higher price beside a "Nur diese Woche!" burst. Challenge: separating the advertised headline price from the setup fee in size-6 footnote text. Lesson: Denglisch marketing sells excitement, the Kleingedruckte sells the truth.

**SIM-Vertrag mit Ausweispflicht-Hinweis (1.3)**: a contract page plus a boxed notice, "Zur Identifizierung ist ein gültiges Ausweisdokument erforderlich." Challenge: noticing that a prepaid SIM, sold as no-strings-attached, legally requires the same ID check as opening a bank account. Lesson: even "no commitment" has paperwork here.

**Kassenzettel (1.4)**: itemized receipt with EAN-style lines, a positive "Pfand 0,25" entry, and MwSt split at 7% and 19%. Challenge: finding the one line where the store paid you back. Lesson: German receipts are legal documents in miniature, and even a bottle deposit gets its own line item.

**Pfandbon (1.4)**: a slim thermal coupon from the Leergutautomat, a barcode and a Euro value, redeemable only at the register, not as cash. Challenge: realizing the machine gives paper, not money, and the cashier is the only way to cash it in. Lesson: even garbage in Germany comes with a voucher and a process.

**Regal-Preisschild mit Grundpreis (1.4)**: shelf tag showing the item price large and a small "1,49 € / 100 g" beneath it. Challenge: comparing two brands by the small number, not the big one. Lesson: a consumer-protection law (Preisangabenverordnung) quietly does the shopper's math for them, if they know to look.

**Öffnungszeiten-Schild (1.4)**: a door plaque, Mo-Sa 8-20 Uhr, Sonntag geschlossen, taped-over hours for a holiday. Challenge: doing the date math to realize today is the one day nothing is open. Lesson: the whole country agrees to rest on Sunday, and it will not make an exception for a hungry newcomer.

**WG-Kleinanzeige (1.5)**: a classified ad, "2 Zi., 60m², NR, WM vorh., DG, 550 € WM, VB, ab 01.09." Challenge: the same abbreviation, WM, means Waschmaschine in one line and Warmmiete two lines down. Lesson: German housing ads compress a whole vetting process into acronyms nobody teaches you.

**Hausordnung (1.5)**: a laminated A4 pinned in the Treppenhaus, Ruhezeiten 13-15 Uhr and 22-6 Uhr, Mülltrennung diagram, a Kehrwoche sign-up grid. Challenge: cross-referencing today's date against the cleaning rota to know whose turn it is. Lesson: shared living here runs on a written constitution, not on goodwill.

**Wohnungsgeberbestätigung (1.5)**: the actual one-page form, landlord name, address, move-in date, a citation of Paragraf 19 Bundesmeldegesetz. Challenge: realizing the landlord, not the tenant, must sign, so the player cannot solve this one alone. Lesson: German bureaucracy loves a form that requires someone else's cooperation to complete.

**Wartemarke + Aufrufanzeige (1.6)**: a small numbered paper slip from a ticket dispenser and an overhead LED board calling numbers to counters. Challenge: tracking your number rising against the board while resisting the urge to ask "wie lange noch." Lesson: the queue has its own silent authority, and jumping it is unthinkable even when the room is empty.

## 2. Cultural comedy beats

**1.1 Willkommen in Neuland**
- Jonas arrives eleven minutes late blaming the S-Bahn: "Die Ringbahn hatte mal wieder ihre Laune." The transit system is both beloved and constantly, fondly blamed.
- The arrivals hall has six identical-looking signs pointing in four different directions, all technically correct.
- A recorded announcement asks travelers not to rush on the escalator while every single traveler rushes on the escalator.

**1.2 Der Fahrkarten-Automat**
- The machine rejects a slightly creased five-euro note four times running: "Bitte legen Sie den Schein glatt hin." A cashless country this is not.
- A silent queue forms behind the player, arms crossed, radiating patient disapproval without a single word spoken.
- Choosing "Zone AB" versus "Zone ABC" turns out to be a coin flip dressed as expertise.

**1.3 Die SIM-Karte**
- The seller's pitch is 70 percent English loanwords: "Unser Bestseller, die Flex-Flat XL, volles Datenvolumen zum Fair-Use-Preis!"
- Buying a "no-commitment" prepaid card still requires ID verification, to the seller's genuine confusion at the player's surprise: "Ist doch nur ein Ausweis, dauert eine Minute."
- The AGB fine print scrolls for what feels like a Bildungsroman; the seller waves it off: "Lesen Sie das später, ist Standard."

**1.4 Der erste Einkauf**
- The cashier scans items at competitive-sport speed while the player fumbles items into bags: "Der Nächste kann schon einräumen," she says, to the queue, not to the player.
- No bag brought means buying one on the spot or carrying six items in bare arms to the door.
- The Pfandautomat spits a bottle back with a red X and a beep loud enough to turn heads, for a crime the player cannot identify.

**1.5 Ein Dach über dem Kopf**
- The temporary landlord, reached through Jonas, hesitates over the free Wohnungsgeberbestätigung as if it will cost him something: "Das bringt mir doch nichts, oder?"
- The player vacuums at 13:05 and a knock arrives before the vacuum is even switched off, a first, wordless preview of Herr Krause.
- The WG ad's "WM vorh." turns out to mean a washing machine in the furnishing line and Warmmiete two lines later in the price line, the same three letters, two different lives.

**1.6 BOSS: Die Anmeldung**
- The legal deadline is two weeks; the earliest appointment is eight. Jonas: "Zwei Wochen Frist, acht Wochen Wartezeit. Willkommen in Neuland."
- A fax machine hums in the corner of a modern government office, still very much in service: "Das faxen wir noch heute raus."
- Frau Schmidt hands over a pen after a well-placed Konjunktiv II, wordlessly. By her standards, this is an embrace.

## 3. Unwritten-rules moments

1. **Sonntagsruhe.** Vacuuming on Sunday: a neighbor's radiator pipe knocks twice from below, no words needed.
2. **Mittagsruhe.** Drilling a shelf hook at 13:30: the hallway light outside flicks on and off as someone opens then quietly shuts their door.
3. **Mülltrennung.** A yogurt cup in the Restmüll bin: the lid does not fully close, and it sits there conspicuously until the player notices and moves it.
4. **Rote Ampel.** Crossing an empty street on red: an elderly passerby stops, actually waits for green, three meters away, saying nothing but making eye contact the whole time.
5. **Bargeld only.** Tapping a card at a small Imbiss: the reader is dead, a handwritten "Nur Bar!" sign was there the whole time, the cashier just points at it.
6. **Termin-Kultur.** Walking into an office without an appointment: the receptionist's calendar app visibly flips to a date weeks out before she even asks the question.
7. **Du/Sie.** Using du with Frau Schmidt: her expression does not change, but the Geduld bar visibly ticks down a notch, no dialogue needed.
8. **Kehrwoche.** Skipping the stairwell-cleaning rota: a broom appears outside the player's door the next morning, propped meaningfully against the frame.
9. **Warteschlangen-Ordnung.** Cutting into a bakery queue by standing at the wrong angle: a quiet "Ich war zuerst dran" from someone who was very clearly first.
10. **Pfand-Etikette.** Throwing a deposit bottle straight into a public bin: Herr Nguyen, passing by, fishes it back out and sets it beside the bin instead, without comment.

## 4. Register &amp; voice notes

**Frau Schmidt (Beamtendeutsch: passive voice, nominal style, zero small talk)**
- "Ich benötige zusätzlich eine beglaubigte Kopie, sonst kann der Vorgang nicht abgeschlossen werden." (stretch: passive + "beglaubigt")
- "Bitte füllen Sie das Formular vollständig aus, sonst muss ich es zurückweisen."
- "Der Nächste, bitte. Und denken Sie beim nächsten Mal an Ihre Unterlagen."

**Jonas (casual young German, idiomatic, warm)**
- "Alter, entspann dich, das wird schon."
- "Komm, ich zeig dir, wie der Automat tickt." (stretch: idiom "wie etwas tickt")
- "Ehrlich, ohne mich wärst du aufgeschmissen." (stretch: idiom "aufgeschmissen sein")

**Phone-shop seller (Denglisch upsell, sales cadence)**
- "Unser Bestseller: die Flex-Flat XL, mit richtig viel Datenvolumen zum Fair-Use-Preis!"
- "Für nur zwei Euro mehr im Monat holen Sie sich das Upgrade, glauben Sie mir, das lohnt sich."
- "Soll ich Ihnen gleich noch eine Hülle mit dazu packen? Die ist gerade im Sale." (stretch: rhetorical tag + loanword density)

**Supermarket cashier (clipped, elliptical, transactional)**
- "Zwölf achtundvierzig. Haben Sie es passend?"
- "Beutel brauchen Sie noch?" (stretch: elliptical, subject dropped)
- "Der Nächste kann schon einräumen."

## 5. Text-genre difficulty ladder (easiest to hardest at B1)

1. **Aushang/Schild** (Öffnungszeiten, Zoll-Schilder): short, mostly nouns and pictograms.
2. **Kassenzettel/Bon**: numbers and concrete nouns, almost no syntax.
3. **Wartemarke**: a number and a word, as simple as text gets.
4. **Werbeplakat** (Prepaid poster): punchy phrases, but Denglisch and hyperbole add noise.
5. **Automatenbildschirm** (ticket machine UI): short branching instructions, but bureaucratic vocabulary (Tarifzone, Zeitkarte).
6. **Fahrplan/Tarifzonenkarte**: structured but demands cross-referencing rows against a spatial map.
7. **Kleinanzeige** (WG ad): short in length, dense in abbreviation, no full sentences to lean on.
8. **Hausordnung**: longer prose, legal-adjacent phrasing, compound nouns stacking up.
9. **Formular** (Anmeldeformular, Wohnungsgeberbestätigung): dense nominalizations, precise field-matching required.
10. **Amtsbrief/Beamtendeutsch dialogue**: passive constructions, subordinate clauses, legal citations, the hardest register the chapter offers.

---

## Persona 4 · Market researcher (live web sweep) — brief

> Task: survey how existing LANGUAGE-LEARNING GAMES design their in-game questions, activities
> and interactions, and extract lessons. Games to research: Wagotabi, Noun Town, Influent,
> Shashingo, Lingotopia, Learn Japanese to Survive trilogy, Duolingo (Stories + Adventures),
> Crystallize (Cornell research game), plus any relevant 2024-2026 releases found. For each:
> what the gameplay actually consists of, what reviews praise/criticize about the LEARNING
> interactions, one lesson for Neuland. Then synthesize: cross-game activity inventory, five
> most-praised patterns, five most-criticized failure modes, gaps a DOM-based phone game could
> own, and the 8 activity types Neuland should adopt first, ranked. Sources inline.

### Persona 4 · full report (verbatim)

# Language-Learning Games: Interaction Patterns and Lessons for Neuland

## Per-game notes

**Wagotabi: A Japanese Journey** (2024, retro pixel RPG, Steam/mobile). Exploration-based JRPG that teaches practical vocab/grammar in context (directions, ordering food); "battles" are pop-quizzes testing recently-learned vocab/grammar, gated by a "language replacement" technique that gradually swaps English UI text for kana then kanji as you progress. Quests ask players to pick the correct particle or kanji to complete a sentence. Praised for a "healthy balance between role-playing and learning," recommended especially for complete beginners; difficulty visibly ramps after the first hour. *Lesson for Neuland*: gate combat encounters on material the player was *just* taught, not a random pool, so review feels earned rather than a vocab-drill tax. [Steam](https://store.steampowered.com/app/2701720/Wagotabi_A_Japanese_Journey/) · [Odaiba Chronicles review](https://odaibachronicles.substack.com/p/wagotabi-review-a-unique-and-engaging) · [Satori Reader blog](https://blog.satorireader.com/2024/10/11/wagotabi-a-retro-rpg-for-learning-japanese/)

**Noun Town** (VR, Quest/Steam, 13 languages, 200k+ players, 87% positive). Minigames plus 16 speaking NPCs; speech recognition scores pronunciation against native-speaker audio for feedback. Praised for immersion and breadth (1,000+ practical words); criticized because it "doesn't teach you how to pronounce any specific words/sounds" (no phoneme-level coaching) and some vocab isn't beginner-friendly. *Lesson*: pair every production attempt with an audible native-model answer, not just a right/wrong flag. [RoadToVR](https://www.roadtovr.com/nountown-vr-language-learning-quest-2-steam/) · [Coto Academy review](https://cotoacademy.com/noun-town-review-should-you-learn-japanese-in-vr/) · [Steam](https://store.steampowered.com/app/1643100/Noun_Town_VR_Language_Learning/)

**Influent** (PC, 420 words/23 languages, 73% Steam positive). First-person 3D apartment; clicking an object shows/plays its name in the target language only, no translation, "encouraging word association rather than translation." Praised as a "virtual memory palace" with strong native audio; criticized as noun-heavy ("building a house with only bricks") and not effective as a standalone method. *Lesson*: withholding the translation and forcing audio-first recall is a cheap, high-leverage design rule worth stealing even outside a 3D world. [Tofugu](https://www.tofugu.com/reviews/influent-game/) · [Languages Around the Globe](https://latg.org/review-of-influent-language-learning/) · [Steam](https://store.steampowered.com/app/274980/Influent_Language_Learning_Game/)

**Shashingo: Learn Japanese with Photography** (Switch/PC, 90% Steam positive). You walk a miniature Shibuya taking photos; each photo becomes a flashcard (furigana/katakana/romaji/kanji + audio). Praised as "more fun than flashcards" and easy to use; criticized as supplemental-only, not a real starting point since it lacks grammar/sentence-level use. *Lesson*: turning the act of *finding* a word into the reward (camera framing, discovery) beats a static list, but discovery alone isn't a curriculum. [Siliconera](https://www.siliconera.com/review-shashingo-learn-japanese-with-photography-is-more-fun-than-flashcards/) · [NookGaming](https://www.nookgaming.com/shashingo-learn-japanese-with-photography-review/)

**Lingotopia** (PC). You wander a town overhearing NPC chatter (speech bubbles) and clicking objects to build a dictionary; no combat, no dialogue choices. Split reception: some call it immersive, but the dominant complaint is structural — "for a game focused on language learning, there is very little language learning involved... makes no attempt to test what you have learned or provide puzzles and conversation options," and bubbles vanish faster than a learner can read them. *Lesson*: passive exposure without any recall check or player-initiated speech reads as a tech demo, not a learning game, even to sympathetic reviewers. [Second Union](https://wearesecondunion.com/lingotopia-great-for-language-learners-okay-for-gamers/) · [IntoIndieGames](https://intoindiegames.com/reviews/lingotopia-review/) · [Steam](https://store.steampowered.com/app/860640/Lingotopia/)

**Learn Japanese to Survive! trilogy** (Hiragana Battle/Katakana War/Kanji Combat, 91% positive on the first title). JRPG/visual-novel hybrid: you defeat enemy characters by correctly reading (saying) their kana/kanji name. Strong early reception, but one telling long-time-player review after finishing all three: "I still can't read a single Japanese sentence" — the games teach character *recognition*, not composition or comprehension. *Lesson*: a combat hook that rewards isolated character/word recognition scales well for onboarding but plateaus fast; it needs a second layer that forces sentence-level production. [Tofugu](https://www.tofugu.com/japanese-learning-resources-database/learn-japanese-to-survive-kanji-combat/) · [Steam bundle](https://store.steampowered.com/bundle/7746/Learn_Japanese_To_Survive_Trilogy/)

**Duolingo Stories + Adventures**. Stories: short branching dialogues with ~12 possible exercise types per story (comprehension MCQ, typing what you hear, connecting words to audio); widely cited as users' favorite Duolingo feature for contextualized listening/reading. Adventures (2024+, French/Spanish only): the learner "plays" a character completing a real task (ordering coffee, passport control) by tapping objects, reading signs, and making dialogue choices, explicitly pitched as consequence-free practice. Facebook/community threads also call some Adventures "confusing and tedious." *Lesson*: rotating several short exercise *types* inside one continuous scene keeps a single conversation from feeling monotonous. [duoplanet guide](https://duoplanet.com/duolingo-stories-the-complete-guide-what-you-need-to-know/) · [Duolingo blog: Adventures](https://blog.duolingo.com/adventures/) · [Duolingo Wiki: Adventures](https://duolingo.fandom.com/wiki/Adventures)

**Crystallize** (Cornell research game, collaborative 3D quest). Two players in separate rooms, connected only by an in-game chat interface, must communicate in the target language to solve joint puzzles. The controlled study's headline finding: pairs *required* to collaborate learned more words and enjoyed the game more than pairs who could complete quests solo. *Lesson*: forcing genuine communicative need (not just quizzing) is the single most evidence-backed lever found in this survey, even though it's the hardest to ship without social infrastructure. [Cornell Chronicle](https://news.cornell.edu/stories/2016/06/social-interaction-drives-language-learning-game) · [ResearchGate paper](https://www.researchgate.net/publication/296703802_Crystallize_An_Immersive_Collaborative_Game_for_Second_Language_Learning)

**Newcomer: A Language Learning RPG** (Zelda-styled, ~77% Steam positive) — the closest existing analog to Neuland's premise: "learn and communicate in a second language to save the kingdom and befriend its people." Reviewers flagged real translation/TTS errors (misspelled target-language words, off pronunciation/intonation reported by a native Dutch speaker) undermining trust in the content itself. *Lesson*: in a language-teaching product, a content bug isn't cosmetic, it actively teaches the wrong form; this validates Neuland's `lint-content` + provenance-register discipline as a competitive advantage, not overhead. [Steam](https://store.steampowered.com/app/2063790/Newcomer__A_Language_Learning_RPG/) · [Steambase](https://steambase.io/games/newcomer-a-language-learning-rpg)

**Terra Alia** (10 languages, Switch/VR/PC, mixed reception). You cast spells by learning/saying vocabulary words, revealed via a magic pointer. The sharpest, most useful criticism found in this whole survey: "during battles, you don't need language skills to win, and the language knowledge test was put in a boring computer rather than integrated into battle itself" — so players began actively avoiding battles as a chore, and the game "tried to do too much" across ten languages as a budget title. *Lesson*: this is the single clearest cautionary tale for Neuland's conversation battles — the language check must be a battle *move*, never a menu you visit to satisfy the battle. [gamerheadspodcast](https://www.gamerheadspodcast.com/post/terra-alia-review-an-intriguing-rpg-language-learning-experience) · [Churape's Dungeon](https://churapereviews.com/2024/01/12/rerra-alia-vr-review-meta-quest/) · [Steam](https://store.steampowered.com/app/1183580/Terra_Alia_The_Language_Discovery_RPG/)

**Kagami: An Odyssey in Japanese Language Learning** (top-down RPG-lite, Yokai enemies, kana-only, no romaji). Vocabulary found by exploring/minigames directly gives combat advantage against Yokai. Positioned as suited to intermediate learners committed to reading kana without a romaji crutch. *Lesson*: forcing the target script (no romanization crutch) plus tying found vocabulary to real mechanical advantage is the positive mirror of Terra Alia's failure. [Steam](https://store.steampowered.com/app/2340320/Kagami_An_Odyssey_in_Japanese_Language_Learning/) · [noun.town roundup](https://noun.town/blog/best-language-learning-games-steam-2026/)

**Speechbound: A Language RPG** (in development). Uses generative TTS instead of voice actors so dialogue can be produced dynamically in many languages, plus a custom SRS that reprioritizes missed exercises. Community discussion is mostly pre-release speculation and language-coverage requests. *Lesson*: generative TTS dialogue is a viable way to scale content without recording every line, relevant if Neuland ever wants more mission variety than hand-authored dialogue trees allow. [80.lv](https://80.lv/articles/moonspire-on-how-its-speechbound-rpg-helps-learn-languages-in-fun-way) · [Steam](https://store.steampowered.com/app/2521500/Speechbound__A_language_RPG/)

**Dead ends**: languagerush.com (Lingotopia review) no longer resolves (DNS failure) — used mirrored coverage instead. Most Steam Community review pages and several outlet review pages (Tofugu, Odaiba Chronicles, Coto, 80.lv, gamerheadspodcast, siliconera, nookgaming) blocked direct fetch (HTTP 403 to the fetch tool); worked around this using search-engine result summaries, which still surfaced direct reviewer quotes.

## Synthesis

### 1. Cross-game activity-type inventory
- **Object-tap-to-label exploration** (Influent, Shashingo's camera, Duolingo Adventures, Wagotabi environment) — lands well as passive vocabulary reinforcement, weak alone.
- **Combat-gated recall quiz** (Wagotabi, Kagami, Learn JP to Survive) — lands well when tied to just-taught material; plateaus at recognition-only if never escalated to production.
- **"Say/select the word to attack"** (Terra Alia, Learn JP to Survive) — lands badly when the check is a separate menu from the fight (Terra Alia); lands well when vocabulary directly buffs combat (Kagami).
- **Ambient overheard dialogue with no test** (Lingotopia) — lands badly; reviewers explicitly want a puzzle/conversation-choice layer.
- **Branching story with mixed exercise types per scene** (Duolingo Stories) — the most consistently beloved pattern found.
- **Task-based real-world scenario minigame** (Duolingo Adventures, Newcomer's village quests) — promising but young; execution complaints ("confusing," bugs) show this is hard to tune.
- **Forced player-to-player communication** (Crystallize) — the only pattern with a controlled-study result behind it; both more learning and more fun.
- **Speech-recognition pronunciation loop with native-audio model** (Noun Town) — well liked but reviewers want phoneme-level feedback, not just pass/fail.
- **Streak/leaderboard metagame** (Duolingo) — a documented failure mode when it displaces the language content as the actual goal (arxiv gamification-misuse study, [2203.16175](https://arxiv.org/abs/2203.16175)).
- **Form-filling + frustration meter** (Infocom's *Bureaucracy*, 1987 — not a language game but the clearest structural precedent for a composure bar) — a "blood pressure" meter fills with bureaucratic annoyance and ends the game at max; comedic tone throughout. [Wikipedia](https://en.wikipedia.org/wiki/Bureaucracy_(video_game))

### 2. Five most-praised patterns
1. **Contextualized, mixed-exercise-type story scenes** — Duolingo's most-cited favorite feature.
2. **Battle/quiz gated on just-taught content, RPG-framed** — Wagotabi, Kagami: review feels earned, not homework.
3. **Forced communicative need between two learners** — Crystallize's Cornell study: measurably more words learned *and* more fun.
4. **No-translation, audio-first object learning** — Influent's "memory palace" discipline.
5. **Speech recognition + native-model playback loop** — Noun Town's core praise driver (87% positive, 200k+ players).

### 3. Five most-criticized failure modes
1. **Language check detached from the actual mechanic it's supposed to gate** — Terra Alia's "boring computer" popup instead of an in-battle move; players avoided battles entirely.
2. **No testing or production demanded at all** — Lingotopia's ambient-only design, explicitly panned for this.
3. **Recognition ceiling, no sentence-level production** — "beat the whole trilogy, still can't read a single Japanese sentence" (Learn JP to Survive); Influent/Shashingo both self-limit to noun flashcards.
4. **Extrinsic metagame hijacking the actual goal** — Duolingo leaderboard obsession: "I didn't even care about what I was learning" ([2203.16175](https://arxiv.org/abs/2203.16175)).
5. **Content/localization bugs in the target language itself** — Newcomer's misspelled words and off TTS pronunciation, uniquely damaging because it teaches wrong forms, not just an annoyance.

### 4. Gaps a DOM-based phone game could own
No surveyed title has a real **tappable, fillable in-game form** as a first-class object (closest precedent is 1987 text-parser *Bureaucracy*); genuine **typed free-recall** answers are rare outside Duolingo's "type what you hear" dictation; nobody scores **register/politeness** (Sie/du, formal-letter vs. chat tone) as a stat; nobody pairs a **comedic composure/frustration meter** with actual language production (Bureaucracy has the meter but no language mechanic); and every strong entry above is a paid desktop/VR client, none is a zero-friction, already-installed phone web app.

### 5. Recommendations — 8 activity types to adopt first
1. **Battle-gated recall on just-taught vocab/Redemittel** (Wagotabi/Kagami pattern) — proven, and slots onto Neuland's existing FSRS-scheduled blocks.
2. **Typed free-recall inside dialogue battles**, not just MCQ — the one gap every criticized game shares; matches the existing `typing` block kind.
3. **Composure/patience bars that react to register mistakes** (Sie/du, tone) — the most ownable, German-specific mechanic; no surveyed game does formality-as-stat, and it's built on facets Neuland already tags.
4. **Tappable, fillable document props** (Anmeldung, SIM contract) as bag items — the single biggest unclaimed gap across all games surveyed, and a natural fit for real HTML form inputs.
5. **Mixed exercise types within one scene** (comprehension MCQ + typed + audio-match) — Duolingo Stories' most-loved trait, cheap to reuse from the existing dialogue/text content schema.
6. **Object-tap vocabulary in mission backgrounds** during waiting beats — low-cost passive reinforcement (Influent/Adventures pattern), and matches Neuland's planned "waiting beats become gameplay" design.
7. **Audio-first presentation, translation withheld until requested** — Influent's cheap, high-leverage rule to force active recall over translation-peeking.
8. **Light collaborative/social prompts** (Crystallize's forced-communication mechanic) as a stretch goal — the strongest research-backed result found, but scope it last since it needs backend/social infrastructure Neuland doesn't have yet.
