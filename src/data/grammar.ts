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
    pattern: "Nom: der/die/das · Akk: den/die/das · Dat: dem/der/dem/denen · Gen: dessen/deren",
    examples: [
      { de: "Der Kollege, der das Projekt leitet, ist im Urlaub.", en: "The colleague who leads the project is on holiday." },
      { de: "Die Lösung, die wir gefunden haben, ist günstig.", en: "The solution that we found is cheap." },
      { de: "Der Kunde, dem wir geholfen haben, war zufrieden.", en: "The customer whom we helped was satisfied." },
    ],
    pitfalls: [
      "Gender/number come from the noun; case comes from the role in the relative clause.",
      "Dative plural is 'denen', not 'denen' ↔ 'die': „die Kollegen, denen ich danke\".",
      "With a preposition, it goes in front of the pronoun: „das Team, mit dem ich arbeite\".",
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
    pattern: "da(r) + Präposition → darauf, damit, dafür · wo(r) + Präposition → worauf, womit, wofür",
    examples: [
      { de: "Wir sprechen über das Projekt. → Wir sprechen darüber.", en: "We talk about the project. → We talk about it." },
      { de: "Worüber habt ihr diskutiert?", en: "What did you discuss about?" },
      { de: "Ich freue mich darauf, dich zu sehen.", en: "I'm looking forward to seeing you." },
    ],
    pitfalls: [
      "Use da-/wo-words only for things/ideas. For people use preposition + pronoun: „mit ihm\", „auf wen?\".",
      "Insert -r- before a vowel: darauf, daran, worauf, woran (not da-auf).",
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
      "Subordinating conjunctions (dass, weil, damit, obwohl, wenn, dass) push the conjugated verb to the end of their clause. If the subordinate clause comes first, the main clause starts with its verb (because position 1 is filled by the whole clause).",
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
];

export const grammarById = (id: string) => grammar.find((t) => t.id === id);

export const grammarByGroup = (group: GrammarTopic["group"]) =>
  grammar.filter((t) => t.group === group);
