import type { GrammarTopic } from "@/types";

/**
 * Grammar topics for the B2 Beruf revision platform. Each topic carries a
 * short explanation, a pattern, worked examples, common pitfalls and a few
 * inline drills (instant-feedback practice). Surfaced in the Grammar hub.
 *
 * Originally authored; example sentences follow standard B2 usage and were
 * cross-checked against openly-licensed corpora (Tatoeba CC-BY patterns).
 */
export const grammar: GrammarTopic[] = [
  /* ---------------- Konnektoren (expanded) ---------------- */
  {
    id: "g_konnektoren",
    cefr: "B2.1",
    group: "connectors",
    title: "Connectors for structured arguments",
    titleDe: "Konnektoren",
    purpose: "Link ideas so you sound coherent when weighing options.",
    purposeDe: "Ideen verknüpfen, damit du beim Abwägen von Optionen zusammenhängend klingst.",
    explanation:
      "Connectors signal how two ideas relate: cause (deshalb, deswegen), concession (trotzdem, dennoch), addition (außerdem, zudem) and contrast (jedoch, allerdings). Most of these are adverbial connectors that occupy position 1, so the conjugated verb stays in position 2.",
    explanationDe:
      "Konnektoren zeigen, wie zwei Aussagen zusammenhängen: Grund (deshalb, deswegen), Einräumung (trotzdem, dennoch), Ergänzung (außerdem, zudem) und Kontrast (jedoch, allerdings). Die meisten sind adverbiale Konnektoren auf Position 1, das konjugierte Verb bleibt also auf Position 2.",
    pattern: "…, deshalb + Verb + … · zwar … aber … · einerseits … andererseits …",
    examples: [
      { de: "Wir haben wenig Zeit, deshalb müssen wir uns entscheiden.", en: "We have little time, that's why we have to decide." },
      { de: "Das ist zwar teurer, aber dafür zuverlässiger.", en: "It's more expensive, but more reliable in return." },
      { de: "Einerseits spart es Geld, andererseits dauert es länger.", en: "On one hand it saves money, on the other it takes longer." },
    ],
    pitfalls: [
      "After 'deshalb', 'trotzdem', 'außerdem' the verb comes next (V2): „Es regnet, trotzdem gehen wir.\"",
      "'weil' (subordinating) sends the verb to the end; 'denn' (coordinating) does not.",
    ],
    pitfallsDe: [
      "Nach 'deshalb', 'trotzdem', 'außerdem' folgt sofort das Verb (V2): „Es regnet, trotzdem gehen wir.\"",
      "'weil' (Nebensatz) schickt das Verb ans Ende; 'denn' (Hauptsatz) nicht.",
    ],
    drills: [
      {
        id: "g_konnektoren_d1",
        prompt: "Es war teuer. ___ hat es sich gelohnt.",
        answer: "Trotzdem",
        options: ["Trotzdem", "Weil", "Damit", "Obwohl"],
        explain: "Concession + main-clause word order (verb second): Trotzdem hat es sich gelohnt.",
        gloss: "It was expensive. Nevertheless it was worth it.",
      },
      {
        id: "g_konnektoren_d2",
        prompt: "Wir müssen sparen, ___ senken wir die Kosten.",
        answer: "deshalb",
        options: ["deshalb", "obwohl", "dass", "trotzdem"],
        explain: "Cause → consequence: 'deshalb' introduces the result.",
        gloss: "We have to save, that's why we're cutting costs.",
      },
      {
        id: "g_konnektoren_d3",
        prompt: "Der Plan ist gut. ___ fehlt uns das Budget.",
        answer: "Jedoch",
        options: ["Jedoch", "Damit", "Sobald", "Weil"],
        explain: "'Jedoch' marks a formal contrast and keeps the verb in position 2.",
        gloss: "The plan is good. However, we lack the budget.",
      },
      {
        id: "g_konnektoren_d4",
        prompt: "Das Projekt war aufwendig. ___ haben wir viel gelernt.",
        answer: "Dennoch",
        options: ["Dennoch", "Obwohl", "Weil", "Damit"],
        explain: "'Dennoch' (nevertheless) is a formal concession adverb; verb stays second.",
        gloss: "The project was demanding. Nevertheless we learned a lot.",
      },
      {
        id: "g_konnektoren_d5",
        prompt: "Wir sparen Zeit, ___ wir Meetings online abhalten.",
        answer: "indem",
        options: ["indem", "damit", "weil", "obwohl"],
        explain: "'indem' (by doing) is subordinating, so the verb goes to the end of that clause.",
        gloss: "We save time by holding meetings online.",
      },
    ],
  },

  /* ---------------- Relativsätze ---------------- */
  {
    id: "g_relativsaetze",
    cefr: "B1.2",
    group: "relativeClauses",
    title: "Relative clauses",
    titleDe: "Relativsätze",
    purpose: "Add precise detail about a person or thing in one smooth sentence.",
    purposeDe: "Präzise Details zu einer Person oder Sache in einem einzigen flüssigen Satz ergänzen.",
    explanation:
      "A relative clause describes a noun. The relative pronoun (der/die/das …) matches the noun in gender and number, but its CASE comes from its role inside the relative clause. The verb goes to the end of the relative clause.",
    explanationDe:
      "Ein Relativsatz beschreibt ein Nomen. Das Relativpronomen (der/die/das …) richtet sich in Genus und Numerus nach dem Nomen, sein KASUS kommt aber von seiner Rolle im Relativsatz. Das Verb steht am Ende des Relativsatzes.",
    pattern: "Nom: der/die/das · Akk: den/die/das · Dat: dem/der/dem/denen · Gen: dessen/deren",
    examples: [
      { de: "Der Kollege, der das Projekt leitet, ist im Urlaub.", en: "The colleague who leads the project is on holiday." },
      { de: "Die Lösung, die wir gefunden haben, ist günstig.", en: "The solution that we found is cheap." },
      { de: "Der Kunde, dem wir geholfen haben, war zufrieden.", en: "The customer whom we helped was satisfied." },
    ],
    pitfalls: [
      "Gender/number come from the noun; case comes from the role in the relative clause.",
      "Dative plural is 'denen', not 'die': „die Kollegen, denen ich danke\".",
      "With a preposition, it goes in front of the pronoun: „das Team, mit dem ich arbeite\".",
    ],
    pitfallsDe: [
      "Genus/Numerus kommen vom Nomen; der Kasus kommt von der Rolle im Relativsatz.",
      "Dativ Plural ist 'denen', nicht 'die': „die Kollegen, denen ich danke\".",
      "Eine Präposition steht vor dem Pronomen: „das Team, mit dem ich arbeite\".",
    ],
    drills: [
      {
        id: "g_rel_d1",
        prompt: "Das ist der Bericht, ___ ich gestern geschrieben habe.",
        answer: "den",
        options: ["den", "der", "dem", "dessen"],
        explain: "Masculine 'der Bericht' is the accusative object inside the clause → 'den'.",
        gloss: "That's the report that I wrote yesterday.",
      },
      {
        id: "g_rel_d2",
        prompt: "Die Kundin, ___ wir geholfen haben, kommt wieder.",
        answer: "der",
        options: ["der", "die", "den", "deren"],
        explain: "'helfen' takes the dative; feminine dative relative pronoun is 'der'.",
        gloss: "The customer whom we helped is coming back.",
      },
      {
        id: "g_rel_d3",
        prompt: "Das Team, mit ___ ich arbeite, ist sehr motiviert.",
        answer: "dem",
        options: ["dem", "den", "das", "der"],
        explain: "'mit' + dative; neuter 'das Team' → dative 'dem'.",
        gloss: "The team I work with is very motivated.",
      },
      {
        id: "g_rel_d4",
        prompt: "Das ist der Kollege, ___ Präsentation sehr überzeugend war.",
        answer: "dessen",
        options: ["dessen", "der", "dem", "den"],
        explain: "Genitive relative pronoun; masculine 'der Kollege' → 'dessen'.",
        gloss: "That's the colleague whose presentation was very convincing.",
      },
      {
        id: "g_rel_d5",
        prompt: "Das sind die Mitarbeiter, ___ wir vertrauen.",
        answer: "denen",
        options: ["denen", "die", "den", "deren"],
        explain: "'vertrauen' takes the dative; dative plural is always 'denen'.",
        gloss: "These are the employees whom we trust.",
      },
    ],
  },

  /* ---------------- Präpositionalpronomen (da-/wo-words) ---------------- */
  {
    id: "g_praepositionalpronomen",
    cefr: "B2.1",
    group: "prepositionalPronouns",
    title: "Prepositional pronouns (da-/wo-words)",
    titleDe: "Präpositionalpronomen (da-/wo-Wörter)",
    purpose: "Refer back to whole ideas and ask about prepositional objects naturally.",
    purposeDe: "Auf ganze Sachverhalte zurückverweisen und natürlich nach Präpositionalobjekten fragen.",
    explanation:
      "When a preposition refers to a thing or idea (not a person), German fuses it: da + preposition (darüber, damit, dafür) for statements, wo + preposition (worüber, womit, wofür) for questions. An -r- is inserted before a vowel: da+auf → darauf, wo+an → woran.",
    explanationDe:
      "Wenn sich eine Präposition auf eine Sache oder Idee bezieht (nicht auf eine Person), verschmilzt das Deutsche sie zu einem Wort: da + Präposition (darüber, damit, dafür) für Aussagen, wo + Präposition (worüber, womit, wofür) für Fragen. Vor Vokal wird ein -r- eingefügt: da+auf → darauf, wo+an → woran.",
    pattern: "da(r) + Präposition → darauf, damit, dafür · wo(r) + Präposition → worauf, womit, wofür",
    examples: [
      { de: "Wir sprechen über das Projekt. → Wir sprechen darüber.", en: "We talk about the project. → We talk about it." },
      { de: "Worüber habt ihr diskutiert?", en: "What did you discuss?" },
      { de: "Ich freue mich darauf, dich zu sehen.", en: "I'm looking forward to seeing you." },
    ],
    pitfalls: [
      "Use da-/wo-words only for things/ideas. For people use preposition + pronoun: „mit ihm\", „auf wen?\".",
      "Insert -r- before a vowel: darauf, daran, worauf, woran (not da-auf).",
    ],
    pitfallsDe: [
      "Da-/wo-Wörter nur für Sachen und Ideen. Für Personen: Präposition + Pronomen: „mit ihm\", „auf wen?\".",
      "Vor Vokal ein -r- einfügen: darauf, daran, worauf, woran (nicht da-auf).",
    ],
    drills: [
      {
        id: "g_da_d1",
        prompt: "Wir haben über die Kosten gesprochen. – Ja, wir haben ___ gesprochen.",
        answer: "darüber",
        options: ["darüber", "davon", "damit", "worüber"],
        explain: "'sprechen über' + thing → da + über = darüber.",
        gloss: "We talked about the costs. – Yes, we talked about it.",
      },
      {
        id: "g_da_d2",
        prompt: "___ wartest du? – Auf die Antwort des Kunden.",
        answer: "Worauf",
        options: ["Worauf", "Worüber", "Womit", "Wovon"],
        explain: "'warten auf' → question form wo + auf = worauf.",
        gloss: "What are you waiting for? – For the customer's reply.",
      },
      {
        id: "g_da_d3",
        prompt: "Ich freue mich ___, bald anzufangen.",
        answer: "darauf",
        options: ["darauf", "davon", "darüber", "dafür"],
        explain: "'sich freuen auf' (anticipation) → darauf.",
        gloss: "I'm looking forward to starting soon.",
      },
      {
        id: "g_da_d4",
        prompt: "Ich denke ___ oft, dass wir mehr Zeit brauchen.",
        answer: "daran",
        options: ["daran", "davon", "dabei", "darum"],
        explain: "'denken an' + thing/idea → da + an = daran.",
        gloss: "I often think about the fact that we need more time.",
      },
      {
        id: "g_da_d5",
        prompt: "Er besteht ___, pünktlich anzufangen.",
        answer: "darauf",
        options: ["darauf", "darüber", "dafür", "davon"],
        explain: "'bestehen auf' + thing → da + auf = darauf.",
        gloss: "He insists on starting on time.",
      },
    ],
  },

  /* ---------------- Verbstellung / Verbklammer (TeKaMoLo) ---------------- */
  {
    id: "g_verbstellung",
    cefr: "B1.2",
    group: "verbPosition",
    title: "Verb position & sentence bracket",
    titleDe: "Verbstellung & Verbklammer (TeKaMoLo)",
    purpose: "Build correct, natural word order, a top marker of B2 accuracy.",
    purposeDe: "Korrekte, natürliche Wortstellung bilden, ein wichtiges Merkmal für B2-Genauigkeit.",
    explanation:
      "In a main clause the conjugated verb is always second; any second verb part (Infinitiv/Partizip) goes to the very end, forming the 'Verbklammer' (sentence bracket). Mid-field adverbials follow TeKaMoLo order: Temporal – Kausal – Modal – Lokal (when – why – how – where).",
    explanationDe:
      "Im Hauptsatz steht das konjugierte Verb immer an zweiter Stelle; ein zweiter Verbteil (Infinitiv/Partizip) geht ganz ans Ende und bildet die 'Verbklammer'. Angaben im Mittelfeld folgen der TeKaMoLo-Regel: Temporal – Kausal – Modal – Lokal (wann – warum – wie – wo).",
    pattern: "Pos.1 + Verb(2) + … Te-Ka-Mo-Lo … + Verbteil(Ende)",
    examples: [
      { de: "Wir haben gestern die Lieferung verschickt.", en: "We sent the delivery yesterday." },
      { de: "Ich fahre morgen wegen des Termins mit dem Zug nach Berlin.", en: "Tomorrow I'm taking the train to Berlin because of the meeting." },
      { de: "Das Team muss den Bericht bis Freitag fertigstellen.", en: "The team has to finish the report by Friday." },
    ],
    pitfalls: [
      "The second verb part goes to the end: „Wir wollen den Plan morgen besprechen.\"",
      "Order is Temporal–Kausal–Modal–Lokal: „heute (Te) wegen des Staus (Ka) schnell (Mo) ins Büro (Lo)\".",
    ],
    pitfallsDe: [
      "Der zweite Verbteil geht ans Ende: „Wir wollen den Plan morgen besprechen.\"",
      "Reihenfolge ist Temporal–Kausal–Modal–Lokal: „heute (Te) wegen des Staus (Ka) schnell (Mo) ins Büro (Lo)\".",
    ],
    drills: [
      {
        id: "g_verb_d1",
        prompt: "Ordne: morgen / wir / besprechen / den Plan / wollen",
        answer: "Wir wollen morgen den Plan besprechen.",
        explain: "Verb 'wollen' in position 2, infinitive 'besprechen' at the end (Verbklammer).",
        gloss: "We want to discuss the plan tomorrow.",
      },
      {
        id: "g_verb_d2",
        prompt: "Ordne: die Lieferung / gestern / haben / verschickt / wir",
        answer: "Wir haben die Lieferung gestern verschickt.",
        explain: "'haben' second, past participle 'verschickt' at the end.",
        gloss: "We sent the delivery yesterday.",
      },
      {
        id: "g_verb_d3",
        prompt: "Wähle die richtige Reihenfolge der Angaben: Ich fahre ___ ins Büro.",
        answer: "heute wegen des Termins schnell",
        options: [
          "heute wegen des Termins schnell",
          "schnell heute wegen des Termins",
          "wegen des Termins schnell heute",
        ],
        explain: "TeKaMoLo: Temporal (heute) – Kausal (wegen …) – Modal (schnell) – Lokal (ins Büro).",
        gloss: "Today I'm going to the office quickly because of the meeting.",
      },
      {
        id: "g_verb_d4",
        prompt: "Ordne: morgen / wegen des Termins / wir / nach München / fahren / mit dem Zug",
        answer: "Wir fahren morgen wegen des Termins mit dem Zug nach München.",
        explain: "TeKaMoLo: temporal (morgen) → kausal (wegen des Termins) → modal (mit dem Zug) → lokal (nach München).",
        gloss: "Tomorrow we are taking the train to Munich because of the meeting.",
      },
      {
        id: "g_verb_d5",
        prompt: "Ordne: das Team / den Projektplan / bis Dienstag / muss / vorstellen",
        answer: "Das Team muss den Projektplan bis Dienstag vorstellen.",
        explain: "Modal 'muss' in position 2; infinitive 'vorstellen' at the end (Verbklammer).",
        gloss: "The team must present the project plan by Tuesday.",
      },
    ],
  },

  /* ---------------- Nebensätze: dass / weil / damit ---------------- */
  {
    id: "g_nebensatz",
    cefr: "B1.1",
    group: "subordinate",
    title: "Subordinate clauses: dass / weil / damit",
    titleDe: "Nebensätze: dass / weil / damit",
    purpose: "Justify opinions and explain reasons. The verb goes to the end.",
    purposeDe: "Meinungen begründen und Gründe erklären. Das Verb steht am Ende.",
    explanation:
      "Subordinating conjunctions (dass, weil, damit, obwohl, wenn) push the conjugated verb to the end of their clause. If the subordinate clause comes first, the main clause starts with its verb (because position 1 is filled by the whole clause).",
    explanationDe:
      "Subjunktionen (dass, weil, damit, obwohl, wenn) schieben das konjugierte Verb ans Ende ihres Satzes. Steht der Nebensatz zuerst, beginnt der Hauptsatz mit dem Verb (denn Position 1 ist schon durch den ganzen Nebensatz besetzt).",
    pattern: "Ich denke, dass … (Verb am Ende) · …, weil … · …, damit …",
    examples: [
      { de: "Ich glaube, dass wir die Frist einhalten können.", en: "I think that we can meet the deadline." },
      { de: "Ich bin dafür, weil es Zeit spart.", en: "I'm in favour because it saves time." },
      { de: "Weil es regnet, fahren wir mit dem Zug.", en: "Because it's raining, we take the train." },
    ],
    pitfalls: [
      "Verb to the very end after dass/weil/damit: „…, weil es Zeit spart.\"",
      "'weil' + verb-final vs. 'denn' + normal order. Don't mix them.",
      "Fronted subordinate clause → main clause is verb-first: „Weil … regnet, fahren wir …\".",
    ],
    pitfallsDe: [
      "Verb ganz ans Ende nach dass/weil/damit: „…, weil es Zeit spart.\"",
      "'weil' + Verb am Ende vs. 'denn' + normale Wortstellung. Nicht mischen.",
      "Nebensatz vorn → Hauptsatz beginnt mit dem Verb: „Weil … regnet, fahren wir …\".",
    ],
    drills: [
      {
        id: "g_neb_d1",
        prompt: "Ich bin dafür, weil es Zeit ___.",
        answer: "spart",
        options: ["spart", "sparen", "gespart", "zu sparen"],
        explain: "After 'weil' the conjugated verb goes to the end: „…, weil es Zeit spart.\"",
        gloss: "I'm in favour because it saves time.",
      },
      {
        id: "g_neb_d2",
        prompt: "Ordne nach „Ich denke, …“: dass / wir / können / einhalten / die Frist",
        answer: "Ich denke, dass wir die Frist einhalten können.",
        explain: "After 'dass', the verbs go to the end; modal 'können' last.",
        gloss: "I think that we can meet the deadline.",
      },
      {
        id: "g_neb_d3",
        prompt: "Wir schicken eine Erinnerung, ___ niemand den Termin vergisst.",
        answer: "damit",
        options: ["damit", "weil", "obwohl", "dass"],
        explain: "'damit' expresses purpose (so that) and sends the verb to the end.",
        gloss: "We send a reminder so that no one forgets the appointment.",
      },
      {
        id: "g_neb_d4",
        prompt: "Obwohl wir wenig Zeit ___, schaffen wir das Projekt.",
        answer: "haben",
        options: ["haben", "hatten", "hätten", "gehabt haben"],
        explain: "After 'obwohl' the verb goes to the end: '…, obwohl wir wenig Zeit haben.'",
        gloss: "Although we have little time, we'll manage the project.",
      },
      {
        id: "g_neb_d5",
        prompt: "___ wir mehr Mitarbeiter einstellen, können wir schneller liefern.",
        answer: "Wenn",
        options: ["Wenn", "Weil", "Dass", "Damit"],
        explain: "'Wenn' (if/when) is subordinating, so the verb goes to the end; the whole clause fills position 1, so the main clause starts with its verb.",
        gloss: "If we hire more employees, we can deliver faster.",
      },
    ],
  },

  /* ---------------- Kasus & Wechselpräpositionen ---------------- */
  {
    id: "g_kasus",
    cefr: "B1.2",
    group: "cases",
    title: "Cases & two-way prepositions",
    titleDe: "Kasus & Wechselpräpositionen",
    purpose: "Pick the right article ending, the backbone of accurate German.",
    purposeDe: "Die richtige Artikelendung wählen, das Rückgrat von korrektem Deutsch.",
    explanation:
      "Cases mark a noun's role: Nominativ (subject), Akkusativ (direct object), Dativ (indirect object), Genitiv (possession). Two-way prepositions (in, an, auf, über, unter, vor, hinter, neben, zwischen) take the accusative for movement/direction (wohin?) and the dative for location (wo?).",
    explanationDe:
      "Der Kasus zeigt die Rolle eines Nomens: Nominativ (Subjekt), Akkusativ (direktes Objekt), Dativ (indirektes Objekt), Genitiv (Besitz). Wechselpräpositionen (in, an, auf, über, unter, vor, hinter, neben, zwischen) nehmen bei Bewegung/Richtung (wohin?) den Akkusativ und bei Ort (wo?) den Dativ.",
    pattern: "wohin? → Akkusativ (in den Raum) · wo? → Dativ (in dem Raum)",
    examples: [
      { de: "Ich lege den Bericht auf den Tisch. (wohin? → Akk.)", en: "I put the report on the table. (direction)" },
      { de: "Der Bericht liegt auf dem Tisch. (wo? → Dat.)", en: "The report is on the table. (location)" },
      { de: "Wir helfen dem Kunden. (Dativ nach 'helfen')", en: "We help the customer. (dative verb)" },
    ],
    pitfalls: [
      "Movement → accusative, position → dative: „in die Besprechung gehen\" vs. „in der Besprechung sein\".",
      "Some verbs always take dative: helfen, danken, gratulieren, gehören, passen.",
    ],
    pitfallsDe: [
      "Bewegung → Akkusativ, Position → Dativ: „in die Besprechung gehen\" vs. „in der Besprechung sein\".",
      "Manche Verben brauchen immer den Dativ: helfen, danken, gratulieren, gehören, passen.",
    ],
    drills: [
      {
        id: "g_kasus_d1",
        prompt: "Ich lege die Unterlagen auf ___ Tisch. (wohin?)",
        answer: "den",
        options: ["den", "dem", "der", "das"],
        explain: "Movement/direction (wohin?) → accusative; masc. 'der Tisch' → 'den'.",
        gloss: "I put the documents on the table.",
      },
      {
        id: "g_kasus_d2",
        prompt: "Die Unterlagen liegen auf ___ Tisch. (wo?)",
        answer: "dem",
        options: ["dem", "den", "der", "das"],
        explain: "Location (wo?) → dative; masc. 'der Tisch' → 'dem'.",
        gloss: "The documents are lying on the table.",
      },
      {
        id: "g_kasus_d3",
        prompt: "Wir danken ___ Team für die gute Arbeit.",
        answer: "dem",
        options: ["dem", "das", "den", "der"],
        explain: "'danken' takes the dative; neuter 'das Team' → 'dem'.",
        gloss: "We thank the team for the good work.",
      },
      {
        id: "g_kasus_d4",
        prompt: "Wir gehen in ___ Besprechungsraum. (wohin?)",
        answer: "den",
        options: ["den", "dem", "der", "das"],
        explain: "Movement (wohin?) → accusative; masc. 'der Besprechungsraum' → 'den'.",
        gloss: "We are going into the meeting room.",
      },
      {
        id: "g_kasus_d5",
        prompt: "Das Formular liegt in ___ Schublade. (wo?)",
        answer: "der",
        options: ["der", "die", "dem", "den"],
        explain: "Location (wo?) → dative; fem. 'die Schublade' → 'der'.",
        gloss: "The form is lying in the drawer.",
      },
    ],
  },

  /* ---------------- Nomen-Verb-Verbindungen (explainer) ---------------- */
  {
    id: "g_nomen_verb",
    cefr: "B2.2",
    group: "collocations",
    title: "Noun-verb combinations",
    titleDe: "Nomen-Verb-Verbindungen (Funktionsverbgefüge)",
    purpose: "Sound natural and precise by learning verbs and nouns as fixed chunks.",
    purposeDe: "Natürlich und präzise klingen, indem du Verben und Nomen als feste Wendungen lernst.",
    explanation:
      "Many ideas are expressed by a fixed noun + verb pair where the verb carries little meaning on its own: eine Entscheidung treffen, Maßnahmen ergreifen, Rücksicht nehmen. Learn them as units; the wrong verb sounds foreign even if each word is correct.",
    explanationDe:
      "Viele Ideen werden durch ein festes Nomen-Verb-Paar ausgedrückt, bei dem das Verb allein wenig Bedeutung trägt: eine Entscheidung treffen, Maßnahmen ergreifen, Rücksicht nehmen. Lerne sie als Einheiten; das falsche Verb klingt fremd, auch wenn jedes Wort für sich korrekt ist.",
    pattern: "Nomen + festes Verb → eine Entscheidung treffen · in Frage stellen · zur Verfügung stehen",
    examples: [
      { de: "Wir müssen eine Entscheidung treffen.", en: "We have to make a decision." },
      { de: "Das Unternehmen ergreift Maßnahmen gegen die Verspätung.", en: "The company takes measures against the delay." },
      { de: "Ich stehe Ihnen gern zur Verfügung.", en: "I'm happy to be at your disposal." },
    ],
    pitfalls: [
      "It's „eine Entscheidung treffen\", not „machen\". The verb is fixed.",
      "Many take a fixed preposition too: „in Frage stellen\", „zur Verfügung stehen\".",
    ],
    pitfallsDe: [
      "Es heißt „eine Entscheidung treffen\", nicht „machen\". Das Verb ist fest.",
      "Viele haben auch eine feste Präposition: „in Frage stellen\", „zur Verfügung stehen\".",
    ],
    drills: [
      {
        id: "g_nv_d1",
        prompt: "Wir müssen heute eine Entscheidung ___.",
        answer: "treffen",
        options: ["treffen", "machen", "nehmen", "geben"],
        explain: "Fixed collocation: eine Entscheidung treffen.",
        gloss: "We have to make a decision today.",
      },
      {
        id: "g_nv_d2",
        prompt: "Die Firma ___ Maßnahmen gegen die Verspätung.",
        answer: "ergreift",
        options: ["ergreift", "macht", "nimmt", "trifft"],
        explain: "Fixed collocation: Maßnahmen ergreifen.",
        gloss: "The company takes measures against the delay.",
      },
      {
        id: "g_nv_d3",
        prompt: "Ich ___ Ihnen gern zur Verfügung.",
        answer: "stehe",
        options: ["stehe", "bin", "habe", "gebe"],
        explain: "Fixed collocation: zur Verfügung stehen.",
        gloss: "I'm happy to be at your disposal.",
      },
      {
        id: "g_nv_d4",
        prompt: "Wer ___ heute das Protokoll?",
        answer: "führt",
        options: ["führt", "macht", "schreibt", "nimmt"],
        explain: "Fixed collocation: Protokoll führen (to take the minutes).",
        gloss: "Who is taking the minutes today?",
      },
      {
        id: "g_nv_d5",
        prompt: "Das Gremium ___ am Ende der Sitzung einen Beschluss.",
        answer: "fasst",
        options: ["fasst", "macht", "trifft", "nimmt"],
        explain: "Fixed collocation: einen Beschluss fassen (to pass a resolution).",
        gloss: "The committee passes a resolution at the end of the meeting.",
      },
    ],
  },

  /* ---------------- Konjunktiv II ---------------- */
  {
    id: "g_konjunktiv2",
    cefr: "B2.1",
    group: "konjunktiv2",
    title: "Konjunktiv II for polite suggestions",
    titleDe: "Konjunktiv II",
    purpose: "Soften proposals and requests so they sound diplomatic.",
    purposeDe: "Vorschläge und Bitten abschwächen, damit sie diplomatisch klingen.",
    explanation:
      "Konjunktiv II expresses politeness and hypotheticals. The everyday form is 'würde + Infinitiv'; common modals have their own forms: könnte, sollte, müsste, dürfte. Use it to make suggestions and requests less direct.",
    explanationDe:
      "Der Konjunktiv II drückt Höflichkeit und Hypothetisches aus. Die Alltagsform ist 'würde + Infinitiv'; häufige Modalverben haben eigene Formen: könnte, sollte, müsste, dürfte. Nutze ihn, um Vorschläge und Bitten weniger direkt zu machen.",
    pattern: "würde + Infinitiv · könnte / sollte / müsste / dürfte",
    examples: [
      { de: "Wir könnten den Termin verschieben.", en: "We could postpone the appointment." },
      { de: "Ich würde vorschlagen, zuerst die Kosten zu klären.", en: "I would suggest clarifying the costs first." },
      { de: "Sollten wir nicht lieber online tagen?", en: "Shouldn't we rather meet online?" },
    ],
    pitfalls: [
      "Prefer 'könnte/würde' over the plain present for polite requests.",
      "'hätte' and 'wäre' are used directly (not with würde): „Ich hätte eine Frage.\"",
    ],
    pitfallsDe: [
      "Für höfliche Bitten lieber 'könnte/würde' als das einfache Präsens.",
      "'hätte' und 'wäre' stehen direkt (nicht mit würde): „Ich hätte eine Frage.\"",
    ],
    drills: [
      {
        id: "g_k2_d1",
        prompt: "___ wir den Termin vielleicht verschieben? (höflich)",
        answer: "Könnten",
        options: ["Könnten", "Können", "Konnten", "Kennen"],
        explain: "Polite request → Konjunktiv II 'könnten'.",
        gloss: "Could we perhaps postpone the appointment?",
      },
      {
        id: "g_k2_d2",
        prompt: "Ich ___ vorschlagen, zuerst die Kosten zu klären.",
        answer: "würde",
        options: ["würde", "werde", "wurde", "will"],
        explain: "'würde + Infinitiv' softens the suggestion.",
        gloss: "I would suggest clarifying the costs first.",
      },
      {
        id: "g_k2_d3",
        prompt: "Ich ___ eine Frage. (höfliche Formulierung)",
        answer: "hätte",
        options: ["hätte", "habe", "hatte", "haben"],
        explain: "'hätte' is used directly (without würde) for polite requests: 'Ich hätte eine Frage.'",
        gloss: "I would have a question. (= I have a question, politely)",
      },
      {
        id: "g_k2_d4",
        prompt: "Es ___ sinnvoll, früher zu beginnen.",
        answer: "wäre",
        options: ["wäre", "ist", "war", "sei"],
        explain: "'wäre' (KII of 'sein') is used directly to express a polite opinion.",
        gloss: "It would make sense to start earlier.",
      },
    ],
  },

  /* ---------------- Modalverben ---------------- */
  {
    id: "g_modal",
    cefr: "B1.1",
    group: "modals",
    title: "Modal verbs for negotiation",
    titleDe: "Modalverben",
    purpose: "Express possibility, necessity and permission precisely.",
    purposeDe: "Möglichkeit, Notwendigkeit und Erlaubnis präzise ausdrücken.",
    explanation:
      "Modal verbs (können, müssen, sollen, dürfen, wollen, mögen) are conjugated in position 2; the main verb stays as an infinitive at the end. They shade meaning: müssen (necessity), dürfen (permission), sollen (recommendation/others' wish).",
    explanationDe:
      "Modalverben (können, müssen, sollen, dürfen, wollen, mögen) werden auf Position 2 konjugiert; das Hauptverb bleibt als Infinitiv am Ende. Sie nuancieren die Bedeutung: müssen (Notwendigkeit), dürfen (Erlaubnis), sollen (Empfehlung oder Wunsch anderer).",
    pattern: "Subjekt + Modalverb(2) + … + Infinitiv (Ende)",
    examples: [
      { de: "Wir müssen eine Lösung finden.", en: "We have to find a solution." },
      { de: "Können wir uns auf Freitag einigen?", en: "Can we agree on Friday?" },
      { de: "Wir sollten den Kunden rechtzeitig informieren.", en: "We should inform the customer in good time." },
    ],
    pitfalls: [
      "Infinitive goes to the end: „Wir müssen den Kunden informieren.\"",
      "'dürfen' = permission, 'müssen' = necessity; 'nicht müssen' ≠ 'nicht dürfen'.",
    ],
    pitfallsDe: [
      "Der Infinitiv geht ans Ende: „Wir müssen den Kunden informieren.\"",
      "'dürfen' = Erlaubnis, 'müssen' = Notwendigkeit; 'nicht müssen' ≠ 'nicht dürfen'.",
    ],
    drills: [
      {
        id: "g_mod_d1",
        prompt: "Wir ___ eine Lösung finden. (Notwendigkeit)",
        answer: "müssen",
        options: ["müssen", "dürfen", "mögen", "sollen"],
        explain: "Necessity → 'müssen'.",
        gloss: "We have to find a solution.",
      },
      {
        id: "g_mod_d2",
        prompt: "Ordne: informieren / wir / den Kunden / sollten",
        answer: "Wir sollten den Kunden informieren.",
        explain: "Modal 'sollten' in position 2, infinitive 'informieren' at the end.",
        gloss: "We should inform the customer.",
      },
      {
        id: "g_mod_d3",
        prompt: "Man ___ hier nicht rauchen. (Verbot)",
        answer: "darf",
        options: ["darf", "muss", "soll", "kann"],
        explain: "'darf nicht' = prohibition (not allowed); 'muss nicht' = not necessary.",
        gloss: "One must not smoke here.",
      },
      {
        id: "g_mod_d4",
        prompt: "Die Unterlagen ___ bis Montag eingereicht werden. (Pflicht)",
        answer: "müssen",
        options: ["müssen", "können", "dürfen", "sollen"],
        explain: "Necessity/obligation → 'müssen'; with passive: müssen + Partizip + werden.",
        gloss: "The documents must be submitted by Monday.",
      },
    ],
  },

  /* ---------------- Passiv ---------------- */
  {
    id: "g_passiv",
    cefr: "B2.1",
    group: "passive",
    title: "Passive for processes",
    titleDe: "Passiv",
    purpose: "Describe workplace procedures neutrally, without naming an actor.",
    purposeDe: "Arbeitsabläufe neutral beschreiben, ohne eine handelnde Person zu nennen.",
    explanation:
      "The passive (werden + Partizip II) focuses on the action or process rather than who does it, which is ideal for describing procedures. The agent is often omitted or added with 'von'. With modals: modal + Partizip II + werden.",
    explanationDe:
      "Das Passiv (werden + Partizip II) rückt die Handlung oder den Prozess in den Fokus statt der handelnden Person, ideal für Abläufe. Der Handelnde wird oft weggelassen oder mit 'von' ergänzt. Mit Modalverb: Modal + Partizip II + werden.",
    pattern: "werden + Partizip II · (Modal) … + Partizip II + werden",
    examples: [
      { de: "Die Lieferung wird morgen verschickt.", en: "The delivery will be sent tomorrow." },
      { de: "Jeder Unfall muss gemeldet werden.", en: "Every accident must be reported." },
      { de: "Die Spesen werden monatlich abgerechnet.", en: "The expenses are settled monthly." },
    ],
    pitfalls: [
      "Word order with modal: „Der Bericht muss heute geschrieben werden.\"",
      "Use the agent sparingly: „… wird von der IT geprüft.\"",
    ],
    pitfallsDe: [
      "Wortstellung mit Modalverb: „Der Bericht muss heute geschrieben werden.\"",
      "Den Handelnden sparsam nennen: „… wird von der IT geprüft.\"",
    ],
    drills: [
      {
        id: "g_pas_d1",
        prompt: "Die Lieferung ___ morgen verschickt.",
        answer: "wird",
        options: ["wird", "ist", "hat", "werden"],
        explain: "Passiv Präsens: werden + Partizip II → wird verschickt.",
        gloss: "The delivery will be sent tomorrow.",
      },
      {
        id: "g_pas_d2",
        prompt: "Jeder Unfall muss sofort gemeldet ___.",
        answer: "werden",
        options: ["werden", "wird", "sein", "worden"],
        explain: "Modal + Passiv: … gemeldet werden.",
        gloss: "Every accident must be reported immediately.",
      },
      {
        id: "g_pas_d3",
        prompt: "Der Bericht ___ gerade von der Buchhaltung geprüft.",
        answer: "wird",
        options: ["wird", "ist", "hat", "wurde"],
        explain: "Passiv Präsens: werden + Partizip II → 'wird geprüft'.",
        gloss: "The report is currently being checked by accounting.",
      },
      {
        id: "g_pas_d4",
        prompt: "Das System ___ letzte Woche aktualisiert.",
        answer: "wurde",
        options: ["wurde", "wird", "ist", "worden"],
        explain: "Passiv Präteritum (for past events in writing): wurde + Partizip II.",
        gloss: "The system was updated last week.",
      },
    ],
  },

  /* ================================================================
     Scale-up Wave 4 (2026-07-12): the missing B1-B2 canon, 14 topics.
     German-first lessons (explanationDe/pitfallsDe), 5 drills each.
     ================================================================ */

  /* ---------------- Indirekte Rede (Konjunktiv I) ---------------- */
  {
    id: "g_indirekte_rede",
    cefr: "B2.2",
    group: "reportedSpeech",
    title: "Reported speech with Konjunktiv I",
    titleDe: "Indirekte Rede",
    purpose: "Report what others said neutrally, as in emails, minutes and news.",
    purposeDe: "Neutral wiedergeben, was andere gesagt haben, wie in E-Mails, Protokollen und Nachrichten.",
    explanation:
      "Konjunktiv I reports speech without claiming it is true. Take the verb stem and add -e endings: er sagt, er habe keine Zeit; sie komme morgen. 'sein' is irregular: ich sei, du sei(e)st, er sei, wir seien. When Konjunktiv I looks identical to the present tense (most plural forms: sie haben), German switches to Konjunktiv II (sie hätten) to keep the reported meaning visible. In everyday speech 'dass' + indicative is common, but formal writing expects Konjunktiv I.",
    explanationDe:
      "Mit dem Konjunktiv I gibst du Aussagen wieder, ohne zu behaupten, dass sie stimmen. Verbstamm + -e-Endungen: er sagt, er habe keine Zeit; sie komme morgen. 'sein' ist unregelmäßig: ich sei, du sei(e)st, er sei, wir seien. Wenn der Konjunktiv I wie das Präsens aussieht (meist im Plural: sie haben), weicht man auf den Konjunktiv II aus (sie hätten), damit die indirekte Rede erkennbar bleibt. Mündlich ist 'dass' + Indikativ üblich, in formellen Texten erwartet man aber den Konjunktiv I.",
    pattern: "Er sagt, er habe … · Sie erklärte, sie komme später · Man behauptet, sie seien im Urlaub · Plural gleich? → Konjunktiv II: sie hätten",
    examples: [
      { de: "Der Kunde sagt, die Lieferung sei nicht angekommen.", en: "The customer says the delivery has not arrived." },
      { de: "Die Kollegin erklärte, sie habe die E-Mail nie erhalten.", en: "The colleague explained that she never received the email." },
      { de: "Im Protokoll steht, die Firma wolle die Preise erhöhen.", en: "The minutes say the company intends to raise prices." },
    ],
    pitfalls: [
      "Third person singular has NO -t: er habe (not: er hat), sie komme (not: sie kommt).",
      "If Konjunktiv I equals the indicative (wir haben), use Konjunktiv II instead: wir hätten.",
      "No 'dass' needed: after a comma the reported clause keeps main-clause word order: Er sagt, er komme morgen.",
    ],
    pitfallsDe: [
      "3. Person Singular ohne -t: er habe (nicht: er hat), sie komme (nicht: sie kommt).",
      "Wenn Konjunktiv I wie der Indikativ aussieht (wir haben), nimm Konjunktiv II: wir hätten.",
      "Ohne 'dass' bleibt nach dem Komma die Hauptsatz-Wortstellung: Er sagt, er komme morgen.",
    ],
    drills: [
      {
        id: "g_indirekte_rede_d1",
        prompt: "Der Chef sagt, er ___ heute keine Zeit.",
        answer: "habe",
        options: ["habe", "hat", "hätten", "haben"],
        explain: "Konjunktiv I, 3rd person singular: er habe (stem hab- + e).",
        gloss: "The boss says he has no time today.",
      },
      {
        id: "g_indirekte_rede_d2",
        prompt: "Sie erklärte, sie ___ mit dem Ergebnis zufrieden.",
        answer: "sei",
        options: ["sei", "ist", "wäre gewesen", "seid"],
        explain: "'sein' in Konjunktiv I: ich sei, er/sie sei.",
        gloss: "She explained that she was satisfied with the result.",
      },
      {
        id: "g_indirekte_rede_d3",
        prompt: "Die Mitarbeiter sagen, sie ___ zu viele Überstunden.",
        answer: "hätten",
        options: ["hätten", "haben", "habe", "hatten"],
        explain: "Plural Konjunktiv I 'haben' looks like the indicative, so German switches to Konjunktiv II: hätten.",
        gloss: "The employees say they have too much overtime.",
      },
      {
        id: "g_indirekte_rede_d4",
        prompt: "Im Bericht steht, das Projekt ___ gut voran.",
        answer: "komme",
        options: ["komme", "kommt", "käme gewesen", "kommen"],
        explain: "Konjunktiv I of 'kommen', 3rd person singular: komme.",
        gloss: "The report says the project is progressing well.",
      },
      {
        id: "g_indirekte_rede_d5",
        prompt: "Der Vermieter behauptet, er ___ den Schaden nicht verursacht.",
        answer: "habe",
        options: ["habe", "hat", "wird", "sei"],
        explain: "Reported past: habe + Partizip II (er habe … verursacht).",
        gloss: "The landlord claims he did not cause the damage.",
      },
    ],
  },

  /* ---------------- Zweiteilige Konnektoren ---------------- */
  {
    id: "g_zweiteilige_konnektoren",
    cefr: "B2.1",
    group: "connectors",
    title: "Two-part connectors",
    titleDe: "Zweiteilige Konnektoren",
    purpose: "Weigh, compare and combine ideas elegantly, a hallmark of B2 argument.",
    purposeDe: "Abwägen, vergleichen und verbinden auf B2-Niveau: je…desto, sowohl…als auch, entweder…oder.",
    explanation:
      "Two-part connectors frame two pieces of information: sowohl … als auch (both), entweder … oder (either/or), weder … noch (neither/nor), nicht nur …, sondern auch (not only/but also), zwar …, aber (admittedly/but) and je + comparative …, desto + comparative (the more, the more). 'je' opens a subordinate clause (verb at the end); 'desto' opens a main clause with comparative + verb right after.",
    explanationDe:
      "Zweiteilige Konnektoren rahmen zwei Informationen: sowohl … als auch, entweder … oder, weder … noch, nicht nur …, sondern auch, zwar …, aber sowie je + Komparativ …, desto + Komparativ. Wichtig bei je/desto: 'je' leitet einen Nebensatz ein (Verb am Ende), nach 'desto' + Komparativ folgt sofort das Verb: Je früher wir bestellen, desto günstiger wird es.",
    pattern: "sowohl … als auch … · entweder … oder … · weder … noch … · nicht nur …, sondern auch … · je + Komparativ …, desto + Komparativ …",
    examples: [
      { de: "Je früher wir bestellen, desto günstiger wird die Lieferung.", en: "The earlier we order, the cheaper the delivery gets." },
      { de: "Die Stelle erfordert sowohl Erfahrung als auch Flexibilität.", en: "The position requires both experience and flexibility." },
      { de: "Wir können entweder liefern lassen oder selbst abholen.", en: "We can either have it delivered or pick it up ourselves." },
    ],
    pitfalls: [
      "After 'je' the verb goes to the END (subordinate clause); after 'desto' it comes right after the comparative.",
      "'weder … noch' already negates; do not add 'nicht': Er hat weder angerufen noch geschrieben.",
      "'nicht nur …, sondern auch' needs the comma before 'sondern'.",
    ],
    pitfallsDe: [
      "Nach 'je' steht das Verb am ENDE (Nebensatz); nach 'desto' + Komparativ folgt es sofort.",
      "'weder … noch' verneint schon; kein zusätzliches 'nicht': Er hat weder angerufen noch geschrieben.",
      "Vor 'sondern' steht immer ein Komma: nicht nur …, sondern auch …",
    ],
    drills: [
      {
        id: "g_zweiteilige_konnektoren_d1",
        prompt: "Je länger wir warten, ___ teurer wird die Reparatur.",
        answer: "desto",
        options: ["desto", "damit", "sodass", "als"],
        explain: "The fixed pair: je + comparative, desto + comparative.",
        gloss: "The longer we wait, the more expensive the repair gets.",
      },
      {
        id: "g_zweiteilige_konnektoren_d2",
        prompt: "Das Gerät ist ___ leicht als auch robust.",
        answer: "sowohl",
        options: ["sowohl", "weder", "entweder", "zwar"],
        explain: "'sowohl … als auch' = both … and.",
        gloss: "The device is both light and sturdy.",
      },
      {
        id: "g_zweiteilige_konnektoren_d3",
        prompt: "Er hat ___ angerufen noch eine E-Mail geschrieben.",
        answer: "weder",
        options: ["weder", "entweder", "sowohl", "nicht nur"],
        explain: "'weder … noch' = neither … nor, no extra negation needed.",
        gloss: "He neither called nor wrote an email.",
      },
      {
        id: "g_zweiteilige_konnektoren_d4",
        prompt: "Sie spricht nicht nur Deutsch, ___ auch Polnisch und Englisch.",
        answer: "sondern",
        options: ["sondern", "aber", "oder", "denn"],
        explain: "After 'nicht nur' the second part is 'sondern auch', with a comma before it.",
        gloss: "She speaks not only German but also Polish and English.",
      },
      {
        id: "g_zweiteilige_konnektoren_d5",
        prompt: "Je genauer die Planung ___, desto weniger Fehler passieren.",
        answer: "ist",
        options: ["ist", "sein", "wird sein", "wäre"],
        explain: "'je' opens a subordinate clause, so the conjugated verb 'ist' goes to the end.",
        gloss: "The more precise the planning is, the fewer mistakes happen.",
      },
    ],
  },

  /* ---------------- Infinitivsätze ---------------- */
  {
    id: "g_infinitivsaetze",
    cefr: "B2.1",
    group: "infinitives",
    title: "Infinitive clauses: zu, um…zu, ohne…zu, statt…zu",
    titleDe: "Infinitivsätze",
    purpose: "Compress purpose, manner and intention into elegant zu-clauses.",
    purposeDe: "Absicht, Art und Zweck elegant verdichten: Ich habe vor, zu kündigen. Er ging, ohne zu grüßen.",
    explanation:
      "Infinitive clauses replace a full clause when the subject stays the same: Ich habe vor, den Vertrag zu kündigen. 'um … zu' expresses purpose (only with the SAME subject; otherwise use 'damit'), 'ohne … zu' means without doing, 'statt … zu' means instead of doing. With separable verbs, 'zu' goes inside: anzurufen, einzukaufen. After verbs like vorhaben, versuchen, empfehlen, vergessen and phrases like 'Es ist wichtig, …' the zu-infinitive is the standard pattern.",
    explanationDe:
      "Infinitivsätze ersetzen einen ganzen Nebensatz, wenn das Subjekt gleich bleibt: Ich habe vor, den Vertrag zu kündigen. 'um … zu' drückt einen Zweck aus (nur bei GLEICHEM Subjekt, sonst 'damit'), 'ohne … zu' = ohne dass man es tut, 'statt … zu' = anstelle davon. Bei trennbaren Verben rückt 'zu' in die Mitte: anzurufen, einzukaufen. Nach Verben wie vorhaben, versuchen, empfehlen, vergessen und nach 'Es ist wichtig, …' ist der zu-Infinitiv das Standardmuster.",
    pattern: "…, den Vertrag zu kündigen · um pünktlich zu sein · ohne Bescheid zu geben · statt lange zu diskutieren · trennbar: anzurufen",
    examples: [
      { de: "Wir empfehlen, den Termin schriftlich zu bestätigen.", en: "We recommend confirming the appointment in writing." },
      { de: "Er verließ das Meeting, ohne ein Wort zu sagen.", en: "He left the meeting without saying a word." },
      { de: "Statt lange zu diskutieren, sollten wir einfach testen.", en: "Instead of discussing at length, we should simply test." },
    ],
    pitfalls: [
      "Separable verbs take 'zu' in the middle: anzurufen, NOT zu anrufen.",
      "'um … zu' only works with the same subject; different subjects need 'damit': Ich erkläre es, damit ihr es versteht.",
      "After verbs like vergessen or vorhaben, do not forget the comma when the infinitive clause is extended: Ich habe vor, den Vertrag zu kündigen.",
    ],
    pitfallsDe: [
      "Trennbare Verben: 'zu' in der Mitte: anzurufen, NICHT zu anrufen.",
      "'um … zu' nur bei gleichem Subjekt; sonst 'damit': Ich erkläre es, damit ihr es versteht.",
      "Nach 'vergessen', 'vorhaben' usw. Komma nicht vergessen, wenn der Infinitivsatz erweitert ist.",
    ],
    drills: [
      {
        id: "g_infinitivsaetze_d1",
        prompt: "Ich habe vor, morgen früher ___.",
        answer: "anzufangen",
        options: ["anzufangen", "zu anfangen", "anfangen", "angefangen"],
        explain: "Separable verb: 'zu' goes between prefix and stem: an-zu-fangen.",
        gloss: "I plan to start earlier tomorrow.",
      },
      {
        id: "g_infinitivsaetze_d2",
        prompt: "Sie lernt Deutsch, ___ in Deutschland zu arbeiten.",
        answer: "um",
        options: ["um", "damit", "ohne", "statt"],
        explain: "Purpose with the same subject: um … zu + infinitive.",
        gloss: "She is learning German in order to work in Germany.",
      },
      {
        id: "g_infinitivsaetze_d3",
        prompt: "Er hat gekündigt, ___ vorher mit uns zu sprechen.",
        answer: "ohne",
        options: ["ohne", "um", "statt", "damit"],
        explain: "'ohne … zu' = without doing something.",
        gloss: "He quit without speaking to us first.",
      },
      {
        id: "g_infinitivsaetze_d4",
        prompt: "___ zu klagen, sollten wir eine Lösung suchen.",
        answer: "Statt",
        options: ["Statt", "Ohne", "Um", "Damit"],
        explain: "'statt … zu' = instead of doing something.",
        gloss: "Instead of complaining, we should look for a solution.",
      },
      {
        id: "g_infinitivsaetze_d5",
        prompt: "Ich erkläre die Regel noch einmal, ___ alle sie verstehen.",
        answer: "damit",
        options: ["damit", "um", "ohne", "zu"],
        explain: "Different subjects (ich erkläre / alle verstehen) require 'damit', not 'um … zu'.",
        gloss: "I will explain the rule again so that everyone understands it.",
      },
    ],
  },

  /* ---------------- Finalsätze ---------------- */
  {
    id: "g_finalsaetze",
    cefr: "B1.2",
    group: "subordinate",
    title: "Purpose clauses: damit vs. um…zu",
    titleDe: "Finalsätze (damit / um…zu)",
    purpose: "Say WHY you do something, and pick the right construction automatically.",
    purposeDe: "Sagen, WOZU man etwas tut, und automatisch die richtige Konstruktion wählen.",
    explanation:
      "Both express purpose. Use 'um … zu' + infinitive when both actions share one subject: Ich spare, um ein Auto zu kaufen. Use 'damit' + subordinate clause when the subjects differ: Ich spreche langsam, damit alle mich verstehen. 'damit' also works with the same subject, but 'um … zu' is shorter and preferred. Never combine them, and do not use 'für' + infinitive (a common transfer error).",
    explanationDe:
      "Beide drücken einen Zweck aus. 'um … zu' + Infinitiv, wenn beide Handlungen dasselbe Subjekt haben: Ich spare, um ein Auto zu kaufen. 'damit' + Nebensatz, wenn die Subjekte verschieden sind: Ich spreche langsam, damit alle mich verstehen. 'damit' geht auch bei gleichem Subjekt, aber 'um … zu' ist kürzer und klingt besser. Nie beides kombinieren, und nie 'für' + Infinitiv (häufiger Übertragungsfehler aus anderen Sprachen).",
    pattern: "…, um + … + zu + Infinitiv (gleiches Subjekt) · …, damit + Subjekt + … + Verb(Ende) (verschiedene Subjekte)",
    examples: [
      { de: "Wir dokumentieren alles, um Fehler schneller zu finden.", en: "We document everything in order to find errors faster." },
      { de: "Ich schicke Ihnen die Daten, damit Sie das Angebot kalkulieren können.", en: "I am sending you the data so that you can calculate the offer." },
      { de: "Sie macht den Kurs, um die Prüfung zu bestehen.", en: "She is taking the course to pass the exam." },
    ],
    pitfalls: [
      "Different subjects → 'damit' is mandatory: Ich rufe an, damit DU Bescheid weißt.",
      "'um … zu' has no subject of its own; the implied subject is the main-clause subject.",
      "No 'für zu machen': German never uses 'für' + infinitive for purpose.",
    ],
    pitfallsDe: [
      "Verschiedene Subjekte → 'damit' ist Pflicht: Ich rufe an, damit DU Bescheid weißt.",
      "'um … zu' hat kein eigenes Subjekt; es gilt das Subjekt des Hauptsatzes.",
      "Kein 'für zu machen': Zweck nie mit 'für' + Infinitiv ausdrücken.",
    ],
    drills: [
      {
        id: "g_finalsaetze_d1",
        prompt: "Ich stehe früh auf, ___ den ersten Zug zu erreichen.",
        answer: "um",
        options: ["um", "damit", "weil", "dass"],
        explain: "Same subject (ich) → um … zu.",
        gloss: "I get up early to catch the first train.",
      },
      {
        id: "g_finalsaetze_d2",
        prompt: "Der Chef erklärt die Aufgabe genau, ___ das Team keine Fehler macht.",
        answer: "damit",
        options: ["damit", "um", "denn", "ohne"],
        explain: "Different subjects (Chef / Team) → damit.",
        gloss: "The boss explains the task precisely so that the team makes no mistakes.",
      },
      {
        id: "g_finalsaetze_d3",
        prompt: "Wir testen die Software, ___ Probleme früh zu erkennen.",
        answer: "um",
        options: ["um", "damit", "sodass", "als"],
        explain: "Same subject (wir) → um … zu erkennen.",
        gloss: "We test the software in order to spot problems early.",
      },
      {
        id: "g_finalsaetze_d4",
        prompt: "Sie schreibt alles auf, damit ihre Vertretung alles ___.",
        answer: "findet",
        options: ["findet", "zu finden", "finden", "gefunden"],
        explain: "'damit' opens a subordinate clause: conjugated verb at the end (findet).",
        gloss: "She writes everything down so that her stand-in can find everything.",
      },
      {
        id: "g_finalsaetze_d5",
        prompt: "Er nimmt ein Taxi, um pünktlich ___ sein.",
        answer: "zu",
        options: ["zu", "damit", "für", "um"],
        explain: "The infinitive marker in 'um … zu': um pünktlich ZU sein.",
        gloss: "He takes a taxi in order to be on time.",
      },
    ],
  },

  /* ---------------- Temporalsätze ---------------- */
  {
    id: "g_temporalsaetze",
    cefr: "B1.2",
    group: "subordinate",
    title: "Time clauses: während, bevor, nachdem, seitdem, sobald",
    titleDe: "Temporalsätze",
    purpose: "Put events in order: what happened before, during and after.",
    purposeDe: "Ereignisse zeitlich ordnen: was davor, währenddessen und danach passiert.",
    explanation:
      "Time conjunctions open subordinate clauses (verb at the end). 'während' = during/while, 'bevor' = before, 'nachdem' = after, 'seitdem' = since (a starting point that continues), 'sobald' = as soon as, 'bis' = until. 'nachdem' demands a tense shift: the nachdem-clause is one step further in the past than the main clause (nachdem er gegangen war, rief sie an; nachdem er gegangen ist, ruft sie an).",
    explanationDe:
      "Temporale Konjunktionen leiten Nebensätze ein (Verb am Ende). 'während' = gleichzeitig, 'bevor' = davor, 'nachdem' = danach, 'seitdem' = seit einem Zeitpunkt bis jetzt, 'sobald' = direkt danach, 'bis' = bis zu einem Zeitpunkt. Besonderheit bei 'nachdem': Zeitverschiebung. Der nachdem-Satz steht eine Zeitstufe weiter in der Vergangenheit als der Hauptsatz: Nachdem er gegangen war, rief sie an. Nachdem er gegangen ist, ruft sie an.",
    pattern: "Während ich arbeite, … · Bevor du gehst, … · Nachdem er gegangen war, … (Plusquamperfekt!) · Seitdem sie hier wohnt, … · Sobald der Chef zusagt, …",
    examples: [
      { de: "Bevor Sie unterschreiben, lesen Sie bitte den Vertrag genau.", en: "Before you sign, please read the contract carefully." },
      { de: "Nachdem die Ware angekommen war, prüften wir jede Charge.", en: "After the goods had arrived, we inspected every batch." },
      { de: "Sobald die Freigabe da ist, starten wir die Produktion.", en: "As soon as the approval is in, we start production." },
    ],
    pitfalls: [
      "'nachdem' needs the tense shift: Perfekt/Präsens or Plusquamperfekt/Präteritum, never the same tense twice.",
      "'seit/seitdem' with an action that continues takes the PRESENT: Seitdem sie hier arbeitet, … (not: gearbeitet hat).",
      "'bevor' does not need a negative: 'Bevor du gehst' is complete (no 'nicht' as in some languages).",
    ],
    pitfallsDe: [
      "'nachdem' verlangt die Zeitverschiebung: Perfekt/Präsens oder Plusquamperfekt/Präteritum, nie zweimal dieselbe Zeit.",
      "'seit/seitdem' bei andauernder Handlung mit PRÄSENS: Seitdem sie hier arbeitet, … (nicht: gearbeitet hat).",
      "Nach 'bevor' steht KEINE Verneinung: 'Bevor du gehst' ist vollständig.",
    ],
    drills: [
      {
        id: "g_temporalsaetze_d1",
        prompt: "___ die Maschine läuft, dürfen Sie die Tür nicht öffnen.",
        answer: "Während",
        options: ["Während", "Nachdem", "Bevor", "Bis"],
        explain: "Simultaneous actions → während (while).",
        gloss: "While the machine is running, you must not open the door.",
      },
      {
        id: "g_temporalsaetze_d2",
        prompt: "Nachdem wir die Ergebnisse geprüft ___, informieren wir den Kunden.",
        answer: "haben",
        options: ["haben", "hatten", "haben werden", "hätten"],
        explain: "Main clause in present → nachdem-clause in Perfekt: geprüft haben.",
        gloss: "After we have checked the results, we inform the customer.",
      },
      {
        id: "g_temporalsaetze_d3",
        prompt: "___ sie in Deutschland lebt, spricht sie jeden Tag Deutsch.",
        answer: "Seitdem",
        options: ["Seitdem", "Bevor", "Bis", "Nachdem"],
        explain: "A state that started in the past and continues → seitdem + present.",
        gloss: "Since she has been living in Germany, she speaks German every day.",
      },
      {
        id: "g_temporalsaetze_d4",
        prompt: "Bitte warten Sie, ___ die Anlage vollständig stillsteht.",
        answer: "bis",
        options: ["bis", "seit", "während", "nachdem"],
        explain: "'bis' marks the endpoint: wait UNTIL the plant has fully stopped.",
        gloss: "Please wait until the plant has come to a complete stop.",
      },
      {
        id: "g_temporalsaetze_d5",
        prompt: "___ der Vertrag unterschrieben ist, schicken wir die Rechnung.",
        answer: "Sobald",
        options: ["Sobald", "Während", "Bevor", "Seit"],
        explain: "'sobald' = as soon as, the trigger for the next action.",
        gloss: "As soon as the contract is signed, we send the invoice.",
      },
    ],
  },
  /* ---------------- Vergleichssätze ---------------- */
  {
    id: "g_vergleichssaetze",
    cefr: "B2.1",
    group: "subordinate",
    title: "Comparison clauses: als, wie, als ob",
    titleDe: "Vergleichssätze (als / wie / als ob)",
    purpose: "Compare correctly and speculate elegantly with 'als ob' + Konjunktiv II.",
    purposeDe: "Richtig vergleichen und mit 'als ob' + Konjunktiv II elegant spekulieren.",
    explanation:
      "Equality uses 'so … wie': Das Projekt ist so teuer wie geplant. Inequality uses comparative + 'als': Die Lieferung war schneller als erwartet. Hypothetical comparisons use 'als ob' + Konjunktiv II with the verb at the end: Er tut so, als ob er alles wüsste. The short form 'als' + verb directly after is also possible: als wüsste er alles. Never mix: 'wie' after a comparative (schneller wie) is a classic spoken-German mistake to avoid in professional settings.",
    explanationDe:
      "Gleichheit mit 'so … wie': Das Projekt ist so teuer wie geplant. Ungleichheit mit Komparativ + 'als': Die Lieferung war schneller als erwartet. Irreale Vergleiche mit 'als ob' + Konjunktiv II, Verb am Ende: Er tut so, als ob er alles wüsste. Kurzform: 'als' + Verb direkt danach: als wüsste er alles. Nie mischen: 'schneller wie' ist ein typischer Fehler der gesprochenen Sprache, den man im Beruf vermeiden sollte.",
    pattern: "so + Adjektiv + wie … · Komparativ + als … · …, als ob + … + Konjunktiv II (Ende) · …, als + Konjunktiv II + …",
    examples: [
      { de: "Die Reparatur war teurer als gedacht.", en: "The repair was more expensive than expected." },
      { de: "Das neue System ist so zuverlässig wie das alte.", en: "The new system is as reliable as the old one." },
      { de: "Sie tut so, als ob sie die E-Mail nie bekommen hätte.", en: "She acts as if she had never received the email." },
    ],
    pitfalls: [
      "Comparative + 'als', never 'wie': besser als (not: besser wie).",
      "'als ob' triggers Konjunktiv II: als ob er Zeit hätte (not: hat).",
      "'so … wie' needs the 'so': doppelt so groß wie, halb so teuer wie.",
    ],
    pitfallsDe: [
      "Komparativ + 'als', nie 'wie': besser als (nicht: besser wie).",
      "'als ob' verlangt Konjunktiv II: als ob er Zeit hätte (nicht: hat).",
      "'so … wie' braucht das 'so': doppelt so groß wie, halb so teuer wie.",
    ],
    drills: [
      {
        id: "g_vergleichssaetze_d1",
        prompt: "Die neue Maschine arbeitet schneller ___ die alte.",
        answer: "als",
        options: ["als", "wie", "als ob", "so"],
        explain: "Comparative (schneller) + als.",
        gloss: "The new machine works faster than the old one.",
      },
      {
        id: "g_vergleichssaetze_d2",
        prompt: "Das Ergebnis ist genauso gut ___ letztes Jahr.",
        answer: "wie",
        options: ["wie", "als", "als ob", "denn"],
        explain: "Equality: (genau)so … wie.",
        gloss: "The result is just as good as last year.",
      },
      {
        id: "g_vergleichssaetze_d3",
        prompt: "Er tut so, als ob er von nichts ___.",
        answer: "wüsste",
        options: ["wüsste", "weiß", "wusste", "wissen"],
        explain: "'als ob' + Konjunktiv II at the end: wüsste.",
        gloss: "He acts as if he knew nothing about it.",
      },
      {
        id: "g_vergleichssaetze_d4",
        prompt: "Die Besprechung dauerte doppelt so lange ___ geplant.",
        answer: "wie",
        options: ["wie", "als", "dass", "ob"],
        explain: "'doppelt so lange' is an equality frame → wie.",
        gloss: "The meeting took twice as long as planned.",
      },
      {
        id: "g_vergleichssaetze_d5",
        prompt: "Es sieht so aus, ___ die Lieferung sich verspäten würde.",
        answer: "als ob",
        options: ["als ob", "wie", "als", "damit"],
        explain: "Appearance/speculation: als ob + Konjunktiv II at the end (verspäten würde).",
        gloss: "It looks as if the delivery is going to be late.",
      },
    ],
  },

  /* ---------------- Partizipialattribute ---------------- */
  {
    id: "g_partizipialattribute",
    cefr: "B2.2",
    group: "attributes",
    title: "Participles as attributes",
    titleDe: "Partizipialattribute",
    purpose: "Understand and build the compressed noun phrases of formal German.",
    purposeDe: "Die verdichteten Nominalphrasen des formellen Deutsch verstehen und bilden.",
    explanation:
      "Formal German compresses relative clauses into participles before the noun. Partizip I (infinitive + d) is active/ongoing: die wartenden Kunden = die Kunden, die warten. Partizip II is passive/completed: die gelieferte Ware = die Ware, die geliefert wurde. The participle takes normal adjective endings and can carry its own objects and adverbs: die gestern gelieferte Ware. Reading strategy: find the article, jump to the noun, then read the middle as a clause.",
    explanationDe:
      "Formelles Deutsch verdichtet Relativsätze zu Partizipien vor dem Nomen. Partizip I (Infinitiv + d) ist aktiv/gleichzeitig: die wartenden Kunden = die Kunden, die warten. Partizip II ist passiv/abgeschlossen: die gelieferte Ware = die Ware, die geliefert wurde. Das Partizip bekommt normale Adjektivendungen und kann eigene Objekte und Adverbien mitnehmen: die gestern gelieferte Ware. Lesestrategie: Artikel finden, zum Nomen springen, die Mitte als Satz lesen.",
    pattern: "Partizip I: der laufende Vertrag (aktiv) · Partizip II: das unterschriebene Formular (passiv) · erweitert: die im Juni gelieferte Ware",
    examples: [
      { de: "Bitte prüfen Sie die beiliegende Rechnung.", en: "Please check the enclosed invoice." },
      { de: "Die an der Besprechung teilnehmenden Kollegen bekommen das Protokoll.", en: "The colleagues taking part in the meeting receive the minutes." },
      { de: "Der unterschriebene Vertrag muss bis Freitag zurück sein.", en: "The signed contract has to be back by Friday." },
    ],
    pitfalls: [
      "Partizip I = active (die prüfende Kollegin checks), Partizip II = passive (die geprüfte Rechnung was checked). Mixing them flips the meaning.",
      "The participle needs adjective endings: die laufendEN Verträge, ein unterschriebenER Vertrag.",
      "In extended attributes, everything between article and noun belongs to the participle: die [vom Kunden gemeldete] Störung.",
    ],
    pitfallsDe: [
      "Partizip I = aktiv (die prüfende Kollegin prüft), Partizip II = passiv (die geprüfte Rechnung wurde geprüft). Verwechslung dreht die Bedeutung um.",
      "Das Partizip braucht Adjektivendungen: die laufendEN Verträge, ein unterschriebenER Vertrag.",
      "Beim erweiterten Attribut gehört alles zwischen Artikel und Nomen zum Partizip: die [vom Kunden gemeldete] Störung.",
    ],
    drills: [
      {
        id: "g_partizipialattribute_d1",
        prompt: "Die ___ Kunden werden zuerst bedient. (warten)",
        answer: "wartenden",
        options: ["wartenden", "gewarteten", "wartende", "gewartete"],
        explain: "Active + ongoing → Partizip I: wartend + adjective ending -en.",
        gloss: "The waiting customers are served first.",
      },
      {
        id: "g_partizipialattribute_d2",
        prompt: "Bitte senden Sie das ___ Formular zurück. (ausfüllen)",
        answer: "ausgefüllte",
        options: ["ausgefüllte", "ausfüllende", "auszufüllende", "ausgefüllten"],
        explain: "Passive + completed → Partizip II: ausgefüllt + ending -e (das Formular).",
        gloss: "Please send back the completed form.",
      },
      {
        id: "g_partizipialattribute_d3",
        prompt: "Die gestern ___ Ware ist schon verkauft. (liefern)",
        answer: "gelieferte",
        options: ["gelieferte", "liefernde", "geliefert", "zu liefernde"],
        explain: "The goods WERE delivered (passive, completed) → Partizip II with -e.",
        gloss: "The goods delivered yesterday are already sold.",
      },
      {
        id: "g_partizipialattribute_d4",
        prompt: "„Die vom Kunden gemeldete Störung\" bedeutet: Die Störung, die …",
        answer: "der Kunde gemeldet hat",
        options: ["der Kunde gemeldet hat", "den Kunden meldet", "beim Kunden entsteht", "der Kunde melden wird"],
        explain: "Unpack the extended attribute into a relative clause: die Störung, die der Kunde gemeldet hat.",
        gloss: "'The malfunction reported by the customer' = the malfunction that the customer reported.",
      },
      {
        id: "g_partizipialattribute_d5",
        prompt: "Der seit Montag ___ Vertrag gilt zwei Jahre. (laufen)",
        answer: "laufende",
        options: ["laufende", "gelaufene", "laufenden", "zu laufende"],
        explain: "The contract is actively running → Partizip I: laufend + -e (der Vertrag).",
        gloss: "The contract running since Monday is valid for two years.",
      },
    ],
  },

  /* ---------------- Genitiv & Präpositionen mit Genitiv ---------------- */
  {
    id: "g_genitiv",
    cefr: "B2.1",
    group: "cases",
    title: "Genitive case and its prepositions",
    titleDe: "Genitiv & Genitiv-Präpositionen",
    purpose: "Sound professional in writing: wegen, trotz, während, innerhalb + Genitiv.",
    purposeDe: "Im Schriftlichen professionell klingen: wegen, trotz, während, innerhalb + Genitiv.",
    explanation:
      "The genitive marks possession and follows certain prepositions. Masculine/neuter singular: des + noun with -(e)s (des Vertrags, des Teams); feminine and plural: der (der Firma, der Kunden). Professional German relies on genitive prepositions: wegen (because of), trotz (despite), während (during), innerhalb/außerhalb (inside/outside of), anstelle (instead of), aufgrund (owing to), anhand (on the basis of). Colloquial speech often uses dative after wegen/trotz; in professional writing the genitive is expected.",
    explanationDe:
      "Der Genitiv zeigt Besitz und steht nach bestimmten Präpositionen. Maskulin/Neutrum Singular: des + Nomen mit -(e)s (des Vertrags, des Teams); Feminin und Plural: der (der Firma, der Kunden). Berufsdeutsch lebt von Genitiv-Präpositionen: wegen, trotz, während, innerhalb/außerhalb, anstelle, aufgrund, anhand. Umgangssprachlich hört man nach wegen/trotz oft den Dativ; im professionellen Schreiben wird der Genitiv erwartet.",
    pattern: "wegen des Umbaus · trotz der Verspätung · während der Besprechung · innerhalb einer Woche · aufgrund der hohen Nachfrage",
    examples: [
      { de: "Wegen des Feiertags bleibt das Büro geschlossen.", en: "Because of the public holiday the office stays closed." },
      { de: "Trotz der hohen Kosten hat sich die Investition gelohnt.", en: "Despite the high costs the investment was worth it." },
      { de: "Bitte antworten Sie innerhalb einer Woche.", en: "Please reply within one week." },
    ],
    pitfalls: [
      "Masculine/neuter nouns need -(e)s: wegen des Umbaus, während des Meetings.",
      "'wegen dem Wetter' is colloquial; write 'wegen des Wetters'.",
      "Time phrases like 'eines Tages' are fixed genitives worth memorising.",
    ],
    pitfallsDe: [
      "Maskulin/Neutrum brauchen -(e)s: wegen des Umbaus, während des Meetings.",
      "'wegen dem Wetter' ist umgangssprachlich; schreib 'wegen des Wetters'.",
      "Feste Wendungen wie 'eines Tages' sind Genitive zum Auswendiglernen.",
    ],
    drills: [
      {
        id: "g_genitiv_d1",
        prompt: "Wegen ___ Umbaus ist der Eingang gesperrt.",
        answer: "des",
        options: ["des", "dem", "der", "den"],
        explain: "wegen + Genitiv; der Umbau (masculine) → des Umbaus.",
        gloss: "Because of the renovation the entrance is closed.",
      },
      {
        id: "g_genitiv_d2",
        prompt: "Trotz ___ Verspätung haben wir den Termin gehalten.",
        answer: "der",
        options: ["der", "die", "dem", "des"],
        explain: "trotz + Genitiv; die Verspätung (feminine) → der Verspätung.",
        gloss: "Despite the delay we kept the deadline.",
      },
      {
        id: "g_genitiv_d3",
        prompt: "Während ___ Besprechung bitte die Handys ausschalten.",
        answer: "der",
        options: ["der", "die", "dem", "den"],
        explain: "während + Genitiv; die Besprechung → der Besprechung.",
        gloss: "Please switch off phones during the meeting.",
      },
      {
        id: "g_genitiv_d4",
        prompt: "Die Unterschrift ___ Geschäftsführers fehlt noch.",
        answer: "des",
        options: ["des", "dem", "der", "vom"],
        explain: "Possession: die Unterschrift des Geschäftsführers (whose signature?).",
        gloss: "The managing director's signature is still missing.",
      },
      {
        id: "g_genitiv_d5",
        prompt: "Aufgrund ___ hohen Nachfrage verlängern wir die Aktion.",
        answer: "der",
        options: ["der", "des", "die", "dem"],
        explain: "aufgrund + Genitiv; die Nachfrage (feminine) → der hohen Nachfrage.",
        gloss: "Owing to high demand we are extending the offer.",
      },
    ],
  },

  /* ---------------- n-Deklination ---------------- */
  {
    id: "g_ndeklination",
    cefr: "B2.1",
    group: "nouns",
    title: "The n-declension (weak nouns)",
    titleDe: "n-Deklination",
    purpose: "Get Kollegen, Kunden, Experten right in every case, they follow one hidden rule.",
    purposeDe: "Kollegen, Kunden, Experten in jedem Kasus richtig bilden, sie folgen einer versteckten Regel.",
    explanation:
      "A group of masculine nouns adds -(e)n in EVERY case except nominative singular: der Kunde, den Kunden, dem Kunden, des Kunden. Members: masculine nouns for people ending in -e (Kunde, Kollege, Experte), nouns in -ent/-ant/-ist (Student, Praktikant, Spezialist), and a few others (Herr, Mensch, Nachbar). In working life the most common are Kunde, Kollege, Experte, Praktikant, Herr and Mensch. Forgetting the -n (mit dem Kunde) is one of the most visible B1 fossils.",
    explanationDe:
      "Eine Gruppe maskuliner Nomen bekommt in JEDEM Kasus außer dem Nominativ Singular ein -(e)n: der Kunde, den Kunden, dem Kunden, des Kunden. Dazu gehören: maskuline Personen auf -e (Kollege, Experte, Junge), Nomen auf -ent/-ant/-ist (Student, Praktikant, Spezialist) und einige weitere (Herr, Mensch, Nachbar). Im Berufsalltag am wichtigsten: Kunde, Kollege, Experte, Praktikant, Herr, Mensch. Das vergessene -n (mit dem Kunde) ist einer der sichtbarsten B1-Fehler.",
    pattern: "der Kunde → den/dem/des Kunden · der Herr → den/dem/des Herrn · der Praktikant → den/dem/des Praktikanten",
    examples: [
      { de: "Ich habe gestern mit dem Kunden telefoniert.", en: "I spoke to the customer on the phone yesterday." },
      { de: "Wir suchen für den Praktikanten einen Schreibtisch.", en: "We are looking for a desk for the intern." },
      { de: "Das ist die Entscheidung des Experten.", en: "That is the expert's decision." },
    ],
    pitfalls: [
      "Accusative already takes -n: Ich rufe den Kollegen an (not: den Kollege).",
      "'Herr' takes -n in singular (dem Herrn) and -en in plural (die Herren).",
      "Not every masculine noun joins in: der Computer, der Plan stay unchanged.",
    ],
    pitfallsDe: [
      "Schon im Akkusativ steht -n: Ich rufe den Kollegen an (nicht: den Kollege).",
      "'Herr': Singular dem Herrn, Plural die Herren.",
      "Nicht jedes maskuline Nomen gehört dazu: der Computer, der Plan bleiben unverändert.",
    ],
    drills: [
      {
        id: "g_ndeklination_d1",
        prompt: "Haben Sie schon mit dem neuen ___ gesprochen? (Kollege)",
        answer: "Kollegen",
        options: ["Kollegen", "Kollege", "Kolleg", "Kolleges"],
        explain: "Dative singular of a weak noun: dem Kollegen.",
        gloss: "Have you already spoken to the new colleague?",
      },
      {
        id: "g_ndeklination_d2",
        prompt: "Bitte leiten Sie die E-Mail an Herrn Weber und den ___ weiter. (Praktikant)",
        answer: "Praktikanten",
        options: ["Praktikanten", "Praktikant", "Praktikants", "Praktikanter"],
        explain: "Accusative singular: den Praktikanten (-ant noun).",
        gloss: "Please forward the email to Mr Weber and the intern.",
      },
      {
        id: "g_ndeklination_d3",
        prompt: "Das Feedback ___ Kunden ist uns wichtig. (Genitiv Singular)",
        answer: "des Kunden",
        options: ["des Kunden", "des Kundes", "dem Kunden", "der Kunde"],
        explain: "Genitive of weak nouns: des Kunden (no -s!).",
        gloss: "The customer's feedback is important to us.",
      },
      {
        id: "g_ndeklination_d4",
        prompt: "Guten Tag, ich möchte bitte ___ Müller sprechen.",
        answer: "Herrn",
        options: ["Herrn", "Herr", "Herren", "Herrns"],
        explain: "Accusative of 'Herr' in singular: Herrn Müller.",
        gloss: "Hello, I would like to speak to Mr Müller, please.",
      },
      {
        id: "g_ndeklination_d5",
        prompt: "Wir fragen einen ___ um Rat. (Experte)",
        answer: "Experten",
        options: ["Experten", "Experte", "Expertes", "Experter"],
        explain: "Accusative singular: einen Experten.",
        gloss: "We are asking an expert for advice.",
      },
    ],
  },

  /* ---------------- Nominalisierung ↔ Verbalstil ---------------- */
  {
    id: "g_nominalisierung",
    cefr: "B2.2",
    group: "wordFormation",
    title: "Nominal style vs. verbal style",
    titleDe: "Nominalisierung",
    purpose: "Read Amtsdeutsch and formal emails fluently, and switch styles on purpose.",
    purposeDe: "Amtsdeutsch und formelle E-Mails flüssig lesen und bewusst zwischen den Stilen wechseln.",
    explanation:
      "Formal German turns verbs into nouns: prüfen → die Prüfung, teilnehmen → die Teilnahme, bei der Ankunft = wenn Sie ankommen. Typical patterns: -ung nouns (die Lieferung), infinitive as noun (das Schweißen), and preposition + noun replacing a clause: nach Abschluss der Arbeiten = nachdem die Arbeiten abgeschlossen sind; bei Fragen = wenn Sie Fragen haben; zur Klärung = um zu klären. You need both directions: unpack nominal style when reading letters from authorities, and build it when writing formally.",
    explanationDe:
      "Formelles Deutsch macht aus Verben Nomen: prüfen → die Prüfung, teilnehmen → die Teilnahme, bei der Ankunft = wenn Sie ankommen. Typische Muster: -ung-Nomen (die Lieferung), substantivierter Infinitiv (das Schweißen) und Präposition + Nomen statt Nebensatz: nach Abschluss der Arbeiten = nachdem die Arbeiten abgeschlossen sind; bei Fragen = wenn Sie Fragen haben; zur Klärung = um zu klären. Man braucht beide Richtungen: Nominalstil entpacken beim Lesen von Behördenbriefen, Nominalstil bilden beim formellen Schreiben.",
    pattern: "prüfen → die Prüfung · nach Abschluss der Arbeiten (= nachdem …) · bei Fragen (= wenn …) · zur Klärung (= um zu klären)",
    examples: [
      { de: "Nach Eingang Ihrer Zahlung versenden wir die Ware.", en: "After receipt of your payment we dispatch the goods." },
      { de: "Bei Fragen stehe ich Ihnen gern zur Verfügung.", en: "If you have questions, I am happy to help." },
      { de: "Die Teilnahme an der Schulung ist verpflichtend.", en: "Participation in the training is mandatory." },
    ],
    pitfalls: [
      "-ung nouns are always feminine: die Prüfung, die Lieferung, die Bewerbung.",
      "Nominalised infinitives are neuter: das Arbeiten, das Schweißen.",
      "Do not stack too much in speech; nominal style is for writing, verbal style for talking.",
    ],
    pitfallsDe: [
      "-ung-Nomen sind immer feminin: die Prüfung, die Lieferung, die Bewerbung.",
      "Substantivierte Infinitive sind Neutrum: das Arbeiten, das Schweißen.",
      "Im Gespräch nicht stapeln: Nominalstil ist fürs Schreiben, Verbalstil fürs Sprechen.",
    ],
    drills: [
      {
        id: "g_nominalisierung_d1",
        prompt: "„Nachdem die Arbeiten abgeschlossen sind\" heißt im Nominalstil: „Nach ___ der Arbeiten\".",
        answer: "Abschluss",
        options: ["Abschluss", "Abschließen", "Abschließung", "Geschlossenheit"],
        explain: "abschließen → der Abschluss; 'nach Abschluss der Arbeiten' is the fixed formal pattern.",
        gloss: "After completion of the work.",
      },
      {
        id: "g_nominalisierung_d2",
        prompt: "„Wenn Sie Fragen haben\" heißt kurz: „___ Fragen\".",
        answer: "Bei",
        options: ["Bei", "Nach", "Zur", "Ohne"],
        explain: "bei + noun replaces the wenn-clause: bei Fragen, bei Problemen, bei Bedarf.",
        gloss: "If you have questions … / In case of questions …",
      },
      {
        id: "g_nominalisierung_d3",
        prompt: "Das Nomen zu 'sich bewerben' ist ___.",
        answer: "die Bewerbung",
        options: ["die Bewerbung", "das Bewerben", "der Bewerb", "die Bewerbe"],
        explain: "-ung nominalisation, feminine: die Bewerbung.",
        gloss: "to apply → the application.",
      },
      {
        id: "g_nominalisierung_d4",
        prompt: "„___ Klärung der offenen Punkte rufe ich Sie morgen an.\"",
        answer: "Zur",
        options: ["Zur", "Bei", "Als", "Für"],
        explain: "zur + -ung noun = um … zu klären: zur Klärung.",
        gloss: "To clarify the open points, I will call you tomorrow.",
      },
      {
        id: "g_nominalisierung_d5",
        prompt: "„Bei der Ankunft des Zuges\" bedeutet: „Wenn der Zug ___\".",
        answer: "ankommt",
        options: ["ankommt", "angekommen", "ankam", "ankommen wird"],
        explain: "Unpack the nominal style back into a clause: wenn der Zug ankommt.",
        gloss: "When the train arrives.",
      },
    ],
  },
  /* ---------------- lassen + Infinitiv ---------------- */
  {
    id: "g_lassen",
    cefr: "B2.1",
    group: "verbPosition",
    title: "lassen + infinitive",
    titleDe: "lassen + Infinitiv",
    purpose: "Say what you have done FOR you and what you allow, one verb, three superpowers.",
    purposeDe: "Sagen, was man machen LÄSST und was man erlaubt: ein Verb, drei Superkräfte.",
    explanation:
      "'lassen' + infinitive has three core uses. (1) Having something done by someone else: Ich lasse das Auto reparieren (I am not repairing it myself). (2) Allowing: Der Chef lässt uns früher gehen. (3) The sich-lassen passive alternative: Das Problem lässt sich lösen = kann gelöst werden. In the perfect tense, lassen behaves like a modal: Ich habe das Auto reparieren lassen (double infinitive, NOT 'gelassen').",
    explanationDe:
      "'lassen' + Infinitiv hat drei Kernbedeutungen. (1) Etwas von anderen erledigen lassen: Ich lasse das Auto reparieren (ich repariere nicht selbst). (2) Erlauben: Der Chef lässt uns früher gehen. (3) Die sich-lassen-Passiv-Alternative: Das Problem lässt sich lösen = kann gelöst werden. Im Perfekt verhält sich lassen wie ein Modalverb: Ich habe das Auto reparieren lassen (Doppelinfinitiv, NICHT 'gelassen').",
    pattern: "etwas machen lassen (Auftrag) · jemanden etwas tun lassen (Erlaubnis) · etwas lässt sich + Infinitiv (= kann gemacht werden) · Perfekt: … reparieren lassen",
    examples: [
      { de: "Wir lassen die Anlage jährlich vom Hersteller warten.", en: "We have the plant serviced by the manufacturer every year." },
      { de: "Der Fehler lässt sich leicht beheben.", en: "The error can easily be fixed." },
      { de: "Ich habe mir die Haare schneiden lassen.", en: "I had my hair cut." },
    ],
    pitfalls: [
      "Perfect = double infinitive: Ich habe es prüfen lassen (not: prüfen gelassen).",
      "'sich lassen' + infinitive replaces 'können' + passive: Das lässt sich machen = Das kann gemacht werden.",
      "Word order: the infinitive goes to the end: Ich lasse den Vertrag von der Anwältin prüfen.",
    ],
    pitfallsDe: [
      "Perfekt = Doppelinfinitiv: Ich habe es prüfen lassen (nicht: prüfen gelassen).",
      "'sich lassen' + Infinitiv ersetzt 'können' + Passiv: Das lässt sich machen = Das kann gemacht werden.",
      "Wortstellung: Der Infinitiv steht am Ende: Ich lasse den Vertrag von der Anwältin prüfen.",
    ],
    drills: [
      {
        id: "g_lassen_d1",
        prompt: "Ich repariere den Drucker nicht selbst, ich ___ ihn reparieren.",
        answer: "lasse",
        options: ["lasse", "werde", "muss", "gehe"],
        explain: "Having something done by someone else: lassen + infinitive.",
        gloss: "I am not repairing the printer myself, I am having it repaired.",
      },
      {
        id: "g_lassen_d2",
        prompt: "Das Problem ___ sich mit einem Update lösen.",
        answer: "lässt",
        options: ["lässt", "kann", "wird", "muss"],
        explain: "The sich-lassen passive alternative: lässt sich lösen = kann gelöst werden.",
        gloss: "The problem can be solved with an update.",
      },
      {
        id: "g_lassen_d3",
        prompt: "Wir haben die Verträge von der Anwältin prüfen ___.",
        answer: "lassen",
        options: ["lassen", "gelassen", "prüfen", "geprüft"],
        explain: "Perfect with double infinitive: haben + prüfen lassen.",
        gloss: "We had the contracts checked by the lawyer.",
      },
      {
        id: "g_lassen_d4",
        prompt: "Die Chefin ___ uns freitags früher gehen.",
        answer: "lässt",
        options: ["lässt", "erlaubt", "geht", "macht"],
        explain: "Allowing: jemanden etwas tun lassen.",
        gloss: "The boss lets us leave earlier on Fridays.",
      },
      {
        id: "g_lassen_d5",
        prompt: "„Das lässt sich einrichten\" bedeutet: Das ___ eingerichtet werden.",
        answer: "kann",
        options: ["kann", "muss", "soll", "darf"],
        explain: "sich lassen + infinitive = können + passive.",
        gloss: "'That can be arranged.'",
      },
    ],
  },

  /* ---------------- brauchen + zu ---------------- */
  {
    id: "g_brauchen_zu",
    cefr: "B2.1",
    group: "modals",
    title: "nur/nicht brauchen + zu",
    titleDe: "brauchen + zu",
    purpose: "Soften obligations: what you need NOT do, and what you ONLY need to do.",
    purposeDe: "Pflichten abschwächen: was man NICHT tun muss und was man NUR tun muss.",
    explanation:
      "'brauchen' + zu-infinitive works like a modal verb in negated or restricted sentences. 'nicht brauchen zu' = müssen is cancelled: Sie brauchen nicht zu warten = Sie müssen nicht warten. 'nur brauchen zu' = the only thing required: Sie brauchen nur zu unterschreiben. It is the polite way to reduce workload in service situations. In the perfect it takes the double infinitive like a modal: Sie hätten nicht zu kommen brauchen.",
    explanationDe:
      "'brauchen' + zu-Infinitiv funktioniert in verneinten oder eingeschränkten Sätzen wie ein Modalverb. 'nicht brauchen zu' = müssen entfällt: Sie brauchen nicht zu warten = Sie müssen nicht warten. 'nur brauchen zu' = das Einzige, was nötig ist: Sie brauchen nur zu unterschreiben. So klingt Entlastung im Service höflich. Im Perfekt steht der Doppelinfinitiv wie beim Modalverb: Sie hätten nicht zu kommen brauchen.",
    pattern: "Sie brauchen nicht zu + Infinitiv (= müssen nicht) · Sie brauchen nur zu + Infinitiv (= das Einzige) · umgangssprachlich oft ohne zu",
    examples: [
      { de: "Sie brauchen das Formular nicht persönlich abzugeben.", en: "You do not need to hand in the form in person." },
      { de: "Sie brauchen nur diesen Knopf zu drücken.", en: "You only need to press this button." },
      { de: "Ihr braucht nicht auf mich zu warten.", en: "You do not need to wait for me." },
    ],
    pitfalls: [
      "Only with 'nicht/nur/kaum': plain positive obligation uses müssen, not brauchen.",
      "Standard German keeps the 'zu': Sie brauchen nicht ZU warten (colloquially often dropped).",
      "'nicht brauchen zu' negates the NECESSITY (you may still do it); 'nicht dürfen' forbids.",
    ],
    pitfallsDe: [
      "Nur mit 'nicht/nur/kaum': positive Pflicht heißt müssen, nicht brauchen.",
      "Standardsprachlich mit 'zu': Sie brauchen nicht ZU warten (mündlich fällt es oft weg).",
      "'nicht brauchen zu' hebt die NOTWENDIGKEIT auf (erlaubt bleibt es); 'nicht dürfen' verbietet.",
    ],
    drills: [
      {
        id: "g_brauchen_zu_d1",
        prompt: "Sie ___ nicht zu warten, wir rufen Sie zurück.",
        answer: "brauchen",
        options: ["brauchen", "müssen", "dürfen", "sollen"],
        explain: "Cancelled obligation with the zu-infinitive → brauchen nicht zu.",
        gloss: "You do not need to wait, we will call you back.",
      },
      {
        id: "g_brauchen_zu_d2",
        prompt: "Sie brauchen das Passwort nur einmal ___ ändern.",
        answer: "zu",
        options: ["zu", "um", "für", "und"],
        explain: "brauchen takes the zu-infinitive: nur einmal zu ändern.",
        gloss: "You only need to change the password once.",
      },
      {
        id: "g_brauchen_zu_d3",
        prompt: "„Sie brauchen nicht zu kommen\" bedeutet: Sie ___ nicht kommen.",
        answer: "müssen",
        options: ["müssen", "dürfen", "können", "wollen"],
        explain: "nicht brauchen zu = nicht müssen (no necessity, still allowed).",
        gloss: "'You do not need to come' = you do not have to come.",
      },
      {
        id: "g_brauchen_zu_d4",
        prompt: "Du brauchst dir ___ Sorgen zu machen.",
        answer: "keine",
        options: ["keine", "nicht", "keinen", "nichts"],
        explain: "With a noun the negation is 'keine': keine Sorgen zu machen.",
        gloss: "You need not worry.",
      },
      {
        id: "g_brauchen_zu_d5",
        prompt: "Sie brauchen ___ die Anlage anzuschließen, alles andere ist fertig.",
        answer: "nur",
        options: ["nur", "nicht", "kaum", "noch nicht"],
        explain: "Restriction: nur brauchen zu = the only required step.",
        gloss: "You only need to connect the unit, everything else is done.",
      },
    ],
  },

  /* ---------------- Futur I/II für Vermutungen ---------------- */
  {
    id: "g_futur_vermutung",
    cefr: "B2.2",
    group: "future",
    title: "Futur I and II for assumptions",
    titleDe: "Futur I/II für Vermutungen",
    purpose: "Speculate like a native: 'Er wird im Meeting sein' means he probably IS.",
    purposeDe: "Vermuten wie Muttersprachler: 'Er wird im Meeting sein' heißt: wahrscheinlich ist er gerade dort.",
    explanation:
      "Beyond future time, 'werden' expresses assumption. Futur I (werden + infinitive) speculates about NOW: Sie wird im Zug sitzen = she is probably on the train. Futur II (werden + Partizip II + haben/sein) speculates about a COMPLETED event: Er wird die E-Mail übersehen haben = he probably missed the email. Particles like 'wohl', 'sicher', 'vermutlich' reinforce the reading: Das wird wohl stimmen. For plain future time, German usually prefers the present tense plus a time phrase (Ich komme morgen).",
    explanationDe:
      "Neben der Zukunft drückt 'werden' Vermutungen aus. Futur I (werden + Infinitiv) vermutet über JETZT: Sie wird im Zug sitzen = wahrscheinlich sitzt sie gerade im Zug. Futur II (werden + Partizip II + haben/sein) vermutet über ABGESCHLOSSENES: Er wird die E-Mail übersehen haben = er hat sie wahrscheinlich übersehen. Partikeln wie 'wohl', 'sicher', 'vermutlich' verstärken die Lesart: Das wird wohl stimmen. Für reine Zukunft nimmt Deutsch meist Präsens + Zeitangabe (Ich komme morgen).",
    pattern: "Futur I: Er wird (wohl) krank sein (Vermutung über jetzt) · Futur II: Sie wird es (wohl) vergessen haben (Vermutung über Vergangenes)",
    examples: [
      { de: "Der Kollege wird wohl noch im Stau stehen.", en: "The colleague is probably still stuck in traffic." },
      { de: "Die Lieferung wird inzwischen angekommen sein.", en: "The delivery will have arrived by now." },
      { de: "Das wird schon stimmen.", en: "That is probably right." },
    ],
    pitfalls: [
      "'Er wird im Büro sein' usually means 'he is probably there NOW', not future.",
      "Futur II picks haben/sein by the participle's normal auxiliary: angekommen SEIN, gemacht HABEN.",
      "For real future plans, prefer present + time phrase: Ich fange am Montag an.",
    ],
    pitfallsDe: [
      "'Er wird im Büro sein' heißt meist: wahrscheinlich ist er JETZT dort, nicht Zukunft.",
      "Futur II wählt haben/sein nach dem normalen Hilfsverb: angekommen SEIN, gemacht HABEN.",
      "Für echte Zukunftspläne lieber Präsens + Zeitangabe: Ich fange am Montag an.",
    ],
    drills: [
      {
        id: "g_futur_vermutung_d1",
        prompt: "Anruf kommt nicht durch. Sie ___ wohl in einer Besprechung sein.",
        answer: "wird",
        options: ["wird", "ist", "war", "würde"],
        explain: "Assumption about now: Futur I (wird + sein) with 'wohl'.",
        gloss: "The call is not going through. She is probably in a meeting.",
      },
      {
        id: "g_futur_vermutung_d2",
        prompt: "Der Fahrer ist nicht da. Er wird schon losgefahren ___.",
        answer: "sein",
        options: ["sein", "haben", "werden", "ist"],
        explain: "Futur II with a movement verb: losgefahren SEIN.",
        gloss: "The driver is not here. He will already have left.",
      },
      {
        id: "g_futur_vermutung_d3",
        prompt: "Keine Antwort auf die Mail? Er wird sie übersehen ___.",
        answer: "haben",
        options: ["haben", "sein", "werden", "hat"],
        explain: "Futur II with a transitive verb: übersehen HABEN.",
        gloss: "No reply to the email? He will probably have missed it.",
      },
      {
        id: "g_futur_vermutung_d4",
        prompt: "„Das wird ___ stimmen\" drückt eine beruhigende Vermutung aus.",
        answer: "schon",
        options: ["schon", "noch", "erst", "kaum"],
        explain: "'wird schon' = reassuring assumption: it will be fine / it is probably true.",
        gloss: "'That is probably right / it will be fine.'",
      },
      {
        id: "g_futur_vermutung_d5",
        prompt: "Reine Zukunft klingt natürlicher im Präsens: „Ich ___ morgen mit dem Bericht.\"",
        answer: "beginne",
        options: ["beginne", "werde beginnen", "würde beginnen", "begann"],
        explain: "For plain future plans, present + time phrase beats Futur I in natural German.",
        gloss: "I will start on the report tomorrow.",
      },
    ],
  },

  /* ---------------- es-Konstruktionen ---------------- */
  {
    id: "g_es_konstruktionen",
    cefr: "B2.2",
    group: "verbPosition",
    title: "'es' as placeholder and dummy subject",
    titleDe: "es-Konstruktionen",
    purpose: "Master the little 'es' that German sentences lean on, and know when it disappears.",
    purposeDe: "Das kleine 'es' beherrschen, auf das sich deutsche Sätze stützen, und wissen, wann es verschwindet.",
    explanation:
      "'es' has three jobs. (1) Fixed subject of weather/impersonal verbs: es regnet, es gibt, es geht um. (2) Placeholder in position 1 that vanishes when something else moves there: Es warten viele Kunden → Viele Kunden warten. (3) Correlate pointing forward to a clause: Es freut mich, dass Sie kommen; here 'es' also disappears when the clause comes first: Dass Sie kommen, freut mich. Fixed workplace phrases: Es handelt sich um …, Es kommt darauf an, Es lohnt sich.",
    explanationDe:
      "'es' hat drei Aufgaben. (1) Festes Subjekt bei Wetter-/Impersonalverben: es regnet, es gibt, es geht um. (2) Platzhalter auf Position 1, der verschwindet, wenn etwas anderes dorthin rückt: Es warten viele Kunden → Viele Kunden warten. (3) Korrelat, das auf einen Satz vorausweist: Es freut mich, dass Sie kommen; auch dieses 'es' fällt weg, wenn der Nebensatz vorangeht: Dass Sie kommen, freut mich. Feste Berufsformeln: Es handelt sich um …, Es kommt darauf an, Es lohnt sich.",
    pattern: "es gibt + Akkusativ · Es handelt sich um … · Es lohnt sich, … zu … · Platzhalter-es: Es warten viele Kunden → Viele Kunden warten",
    examples: [
      { de: "Es handelt sich um einen Fehler im System.", en: "It concerns an error in the system." },
      { de: "Es lohnt sich, die Preise zu vergleichen.", en: "It is worth comparing the prices." },
      { de: "Bei dem Termin geht es um die neue Halle.", en: "The meeting is about the new hall." },
    ],
    pitfalls: [
      "Placeholder 'es' disappears when another element takes position 1: Heute warten viele Kunden (no 'es').",
      "'es gibt' always takes the accusative: Es gibt einen Termin (not: ein Termin).",
      "In 'es geht um / es handelt sich um', 'es' can never be dropped or replaced.",
    ],
    pitfallsDe: [
      "Platzhalter-'es' fällt weg, wenn etwas anderes auf Position 1 steht: Heute warten viele Kunden (ohne 'es').",
      "'es gibt' immer mit Akkusativ: Es gibt einen Termin (nicht: ein Termin).",
      "Bei 'es geht um / es handelt sich um' kann 'es' nie wegfallen oder ersetzt werden.",
    ],
    drills: [
      {
        id: "g_es_konstruktionen_d1",
        prompt: "___ handelt sich um eine dringende Reklamation.",
        answer: "Es",
        options: ["Es", "Das", "Dies", "Man"],
        explain: "Fixed phrase: Es handelt sich um + accusative.",
        gloss: "It concerns an urgent complaint.",
      },
      {
        id: "g_es_konstruktionen_d2",
        prompt: "„Es warten draußen zwei Kunden.\" → „Draußen ___ zwei Kunden.\"",
        answer: "warten",
        options: ["warten", "es warten", "warten es", "wartet"],
        explain: "Placeholder 'es' vanishes when 'draußen' takes position 1.",
        gloss: "Two customers are waiting outside.",
      },
      {
        id: "g_es_konstruktionen_d3",
        prompt: "Es gibt ___ neuen Schichtplan.",
        answer: "einen",
        options: ["einen", "ein", "einem", "eines"],
        explain: "'es gibt' + accusative: einen neuen Schichtplan (der Schichtplan).",
        gloss: "There is a new shift schedule.",
      },
      {
        id: "g_es_konstruktionen_d4",
        prompt: "___ freut mich, dass das Projekt genehmigt wurde.",
        answer: "Es",
        options: ["Es", "Das freut", "Mich", "Dass"],
        explain: "Correlate 'es' points forward to the dass-clause.",
        gloss: "I am pleased that the project was approved.",
      },
      {
        id: "g_es_konstruktionen_d5",
        prompt: "In dem Gespräch geht ___ um Ihre Gehaltserhöhung.",
        answer: "es",
        options: ["es", "das", "sich", "man"],
        explain: "'es geht um' is fixed; the 'es' can never be dropped.",
        gloss: "The conversation is about your pay rise.",
      },
    ],
  },
];

export const grammarById = (id: string) => grammar.find((t) => t.id === id);

export const grammarByGroup = (group: GrammarTopic["group"]) =>
  grammar.filter((t) => t.group === group);
