import type { Scenario } from "@/types";

/**
 * Branching scenarios for the „Lösung finden mit einem/einer Partner/in" module.
 * Each scenario reconverges so every path reaches a satisfying close, while the
 * candidate's option choices feed the quality score.
 */

const sommerfest: Scenario = {
  id: "sc_sommerfest",
  themeId: "scheduling",
  title: "Das Betriebsfest planen",
  task: "Planen Sie gemeinsam das jährliche Betriebsfest und einigen Sie sich auf Termin, Ort und Programm.",
  context:
    "Sie und Ihr:e Kolleg:in sollen das diesjährige Betriebsfest organisieren. Sie haben unterschiedliche Vorstellungen und müssen zu einer gemeinsamen Lösung kommen.",
  level: 1,
  minutes: 6,
  targetRedemittel: ["suggestions", "agree", "compromise", "negotiation"],
  start: "n1",
  nodes: {
    n1: {
      id: "n1",
      speaker: "partner",
      line: "Schön, dass wir das zusammen organisieren! Ich dachte an ein großes Grillfest im Park – was meinst du?",
      gloss: "Nice that we're organising this together! I was thinking of a big barbecue in the park – what do you think?",
      hints: [
        "Reagiere zuerst (z. B. „Das ist ein guter Punkt …“).",
        "Mach dann einen eigenen Vorschlag oder frage nach.",
      ],
      options: [
        {
          id: "n1a",
          text: "Gute Idee! Ein Grillfest kommt sicher gut an. Wann genau hättest du es gern?",
          uses: "agree",
          quality: 1,
          feedback: "Stark: Du stimmst zu und bringst das Gespräch direkt zum nächsten Punkt (Termin).",
          next: "n2",
        },
        {
          id: "n1b",
          text: "Ein Grillfest ist schön, aber bei Regen wird es schwierig. Wie wäre es mit einem Restaurant als Alternative?",
          uses: "suggestions",
          quality: 0.9,
          feedback: "Sehr gut: Du nennst ein Gegenargument und machst gleich einen konstruktiven Vorschlag.",
          next: "n2",
        },
        {
          id: "n1c",
          text: "Park? Nein, das finde ich nicht gut.",
          uses: "disagree",
          quality: 0.4,
          feedback: "Zu schroff. Im B2-Beruf solltest du höflich widersprechen und begründen.",
          next: "n2",
        },
      ],
    },
    n2: {
      id: "n2",
      speaker: "partner",
      line: "Beim Termin bin ich flexibel. Mir wäre ein Freitagnachmittag am liebsten, dann können alle danach ins Wochenende starten.",
      gloss: "I'm flexible on the date. I'd prefer a Friday afternoon so everyone can head into the weekend.",
      hints: ["Stimme zu oder schlage einen Kompromiss vor.", "Denke an Kolleg:innen mit langem Arbeitsweg."],
      options: [
        {
          id: "n2a",
          text: "Freitagnachmittag klingt ideal. Sollen wir sagen, es beginnt um 16 Uhr?",
          uses: "agree",
          quality: 1,
          feedback: "Perfekt – konkret und lösungsorientiert.",
          next: "n3",
        },
        {
          id: "n2b",
          text: "Freitag passt, aber 16 Uhr ist für die Spätschicht schwierig. Könnten wir uns auf 17 Uhr einigen?",
          uses: "compromise",
          quality: 1,
          feedback: "Ausgezeichnet: Du denkst an alle und schlägst einen Kompromiss vor.",
          next: "n3",
        },
        {
          id: "n2c",
          text: "Mir egal, entscheide du.",
          uses: "reactions",
          quality: 0.3,
          feedback: "In der Prüfung solltest du aktiv mitgestalten, nicht alles abgeben.",
          next: "n3",
        },
      ],
    },
    n3: {
      id: "n3",
      speaker: "partner",
      line: "Gut. Jetzt zum Budget: Pro Person haben wir 25 Euro. Sollen wir das Essen selbst organisieren oder einen Catering-Service buchen?",
      gloss: "Now the budget: we have 25 euros per person. Should we organise the food ourselves or book a caterer?",
      hints: ["Wäge Vor- und Nachteile ab (einerseits … andererseits …).", "Triff eine begründete Entscheidung."],
      options: [
        {
          id: "n3a",
          text: "Einerseits ist Catering bequemer, andererseits teurer. Bei 25 Euro würde ich für selbst grillen plädieren – das ist günstiger und persönlicher.",
          uses: "prosCons",
          quality: 1,
          feedback: "Top: Vor- und Nachteile plus klare, begründete Empfehlung.",
          next: "n4",
        },
        {
          id: "n3b",
          text: "Ich würde Catering vorschlagen, dann hat niemand Arbeit und wir können das Fest genießen.",
          uses: "suggestions",
          quality: 0.8,
          feedback: "Gut begründet – achte nur auf das knappe Budget.",
          next: "n4",
        },
        {
          id: "n3c",
          text: "Catering ist besser.",
          uses: "opinion",
          quality: 0.4,
          feedback: "Begründe deine Meinung – „… weil …“ macht dich überzeugender.",
          next: "n4",
        },
      ],
    },
    n4: {
      id: "n4",
      speaker: "partner",
      line: "Einverstanden. Wer kümmert sich um was? Ich könnte die Einladung schreiben.",
      gloss: "Agreed. Who takes care of what? I could write the invitation.",
      hints: ["Übernimm aktiv eine Aufgabe.", "Kläre die Zuständigkeiten klar (zuständig sein für …)."],
      options: [
        {
          id: "n4a",
          text: "Super, dann übernehme ich die Einkäufe und reserviere die Grillplätze. So ist alles verteilt.",
          uses: "negotiation",
          quality: 1,
          feedback: "Sehr gut: klare Aufgabenverteilung, lösungsorientiert.",
          next: "free1",
        },
        {
          id: "n4b",
          text: "Gerne. Ich bin dann für die Getränke und die Musik zuständig. Passt das so?",
          uses: "clarification",
          quality: 0.95,
          feedback: "Stark – du sicherst die Einigung mit einer Rückfrage ab.",
          next: "free1",
        },
      ],
    },
    free1: {
      id: "free1",
      speaker: "examiner",
      line: "Fassen Sie bitte zum Abschluss kurz zusammen, worauf Sie sich geeinigt haben.",
      gloss: "Please briefly summarise what you have agreed on.",
      prompt:
        "Sprich 20–30 Sekunden: Termin, Ort, Essen und Zuständigkeiten in einem kurzen Fazit.",
      model:
        "Wir haben uns auf ein Grillfest im Park am Freitag um 17 Uhr geeinigt. Das Essen organisieren wir selbst, um im Budget zu bleiben. Ich kümmere mich um die Einkäufe und die Grillplätze, und du schreibst die Einladung. Ich denke, das wird ein schönes Fest.",
      hints: ["Nutze „Wir haben uns darauf geeinigt, dass …“.", "Zähle die Punkte mit „erstens, zweitens …“ auf."],
      next: "end",
    },
    end: {
      id: "end",
      speaker: "narrator",
      line: "Sie haben gemeinsam eine Lösung gefunden. Geschafft!",
      end: true,
    },
  },
};

const reklamation: Scenario = {
  id: "sc_reklamation",
  themeId: "customer",
  title: "Eine Reklamation lösen",
  task: "Ein:e Kund:in hat eine fehlerhafte Lieferung erhalten. Finden Sie gemeinsam mit dem/der Kolleg:in eine Lösung für den Kunden.",
  context:
    "Sie arbeiten im Kundenservice. Eine wichtige Lieferung war beschädigt. Sie besprechen mit einem/einer Kolleg:in, wie Sie reagieren, damit der Kunde zufrieden bleibt.",
  level: 2,
  minutes: 6,
  targetRedemittel: ["clarification", "suggestions", "negotiation", "reactions"],
  start: "m1",
  nodes: {
    m1: {
      id: "m1",
      speaker: "partner",
      line: "Der Kunde ist ziemlich verärgert – die Hälfte der Ware ist beschädigt angekommen. Wie sollen wir am besten reagieren?",
      gloss: "The customer is quite upset – half the goods arrived damaged. How should we best react?",
      hints: ["Zeig Verständnis (Das kann ich gut nachvollziehen).", "Schlage einen ersten konkreten Schritt vor."],
      options: [
        {
          id: "m1a",
          text: "Das kann ich gut nachvollziehen. Ich würde vorschlagen, dass wir sofort Ersatz schicken und uns entschuldigen.",
          uses: "suggestions",
          quality: 1,
          feedback: "Vorbildlich: Empathie plus konkreter Lösungsvorschlag.",
          next: "m2",
        },
        {
          id: "m1b",
          text: "Erst sollten wir klären, ob der Schaden beim Transport entstanden ist. Hast du schon mit der Spedition gesprochen?",
          uses: "clarification",
          quality: 0.9,
          feedback: "Gut – du klärst die Ursache, bevor du handelst.",
          next: "m2",
        },
        {
          id: "m1c",
          text: "Das ist nicht unser Problem, das war die Spedition.",
          uses: "disagree",
          quality: 0.3,
          feedback: "Schiebe die Verantwortung nicht ab – der Kunde erwartet eine Lösung von uns.",
          next: "m2",
        },
      ],
    },
    m2: {
      id: "m2",
      speaker: "partner",
      line: "Ersatz schicken ist gut, aber das dauert drei Tage. Der Kunde braucht die Ware aber schon morgen für eine Veranstaltung.",
      gloss: "Sending a replacement is good, but it takes three days. The customer needs the goods tomorrow for an event.",
      hints: ["Denk an eine schnellere Alternative (Express, Teillieferung).", "Sei lösungsorientiert."],
      options: [
        {
          id: "m2a",
          text: "Dann sollten wir die unbeschädigte Hälfte sofort freigeben und den Rest per Express nachliefern. So hat er morgen zumindest einen Teil.",
          uses: "negotiation",
          quality: 1,
          feedback: "Exzellent: kreative Teil-Lösung unter Zeitdruck.",
          next: "m3",
        },
        {
          id: "m2b",
          text: "Könnten wir dem Kunden anbieten, die Ware aus einer anderen Filiale zu liefern?",
          uses: "suggestions",
          quality: 0.9,
          feedback: "Guter Ansatz – praktisch und kundenorientiert.",
          next: "m3",
        },
        {
          id: "m2c",
          text: "Dann muss er eben warten.",
          uses: "reactions",
          quality: 0.2,
          feedback: "Das gefährdet die Kundenbeziehung. Suche eine Lösung.",
          next: "m3",
        },
      ],
    },
    m3: {
      id: "m3",
      speaker: "partner",
      line: "Einverstanden. Sollen wir dem Kunden zusätzlich entgegenkommen, damit er zufrieden bleibt?",
      gloss: "Agreed. Should we additionally accommodate the customer so they stay satisfied?",
      hints: ["Denk an Kulanz: Rabatt, Gutschein, Erstattung der Versandkosten."],
      options: [
        {
          id: "m3a",
          text: "Ja, aus Kulanz würde ich die Versandkosten erstatten und einen Rabatt von zehn Prozent auf die nächste Bestellung anbieten.",
          uses: "negotiation",
          quality: 1,
          feedback: "Sehr gut: konkrete Kulanz, die die Beziehung sichert.",
          next: "free2",
        },
        {
          id: "m3b",
          text: "Ein kleiner Gutschein wäre eine schöne Geste. Was hältst du davon?",
          uses: "suggestions",
          quality: 0.9,
          feedback: "Gut – du holst auch die Meinung des Partners ein.",
          next: "free2",
        },
      ],
    },
    free2: {
      id: "free2",
      speaker: "examiner",
      line: "Wie würden Sie das nun dem Kunden am Telefon mitteilen?",
      gloss: "How would you now communicate this to the customer on the phone?",
      prompt: "Formuliere 20–30 Sekunden die Lösung freundlich und professionell, als würdest du mit dem Kunden sprechen.",
      model:
        "Guten Tag, Herr Müller. Es tut mir sehr leid, dass ein Teil Ihrer Lieferung beschädigt war. Wir senden Ihnen die unbeschädigte Ware sofort, sodass Sie sie morgen erhalten. Den Rest liefern wir per Express nach. Als Entschuldigung erstatten wir die Versandkosten und schreiben Ihnen einen Rabatt gut. Ich hoffe, das ist in Ihrem Sinne.",
      hints: ["Beginne mit einer Entschuldigung.", "Nenne die Lösung Schritt für Schritt."],
      next: "mend",
    },
    mend: {
      id: "mend",
      speaker: "narrator",
      line: "Sie haben eine kundenfreundliche Lösung gefunden. Sehr gut gemacht!",
      end: true,
    },
  },
};

const nachhaltigkeit: Scenario = {
  id: "sc_nachhaltigkeit",
  themeId: "sustainability",
  title: "Das Büro nachhaltiger machen",
  task: "Ihr:e Chef:in möchte das Büro umweltfreundlicher gestalten. Entwickeln Sie gemeinsam ein Maßnahmenpaket und priorisieren Sie es.",
  context:
    "In einer kurzen Besprechung sollen Sie und ein:e Kolleg:in Vorschläge sammeln, wie das Büro nachhaltiger werden kann, und sich auf die wichtigsten Maßnahmen einigen.",
  level: 3,
  minutes: 7,
  targetRedemittel: ["suggestions", "opinion", "prosCons", "compromise"],
  start: "k1",
  nodes: {
    k1: {
      id: "k1",
      speaker: "partner",
      line: "Unser Chef möchte das Büro nachhaltiger machen. Mir fällt spontan ein: weniger Papier und Mülltrennung. Was schlägst du vor?",
      gloss: "Our boss wants to make the office more sustainable. Off the top of my head: less paper and waste separation. What do you suggest?",
      hints: ["Bring eine eigene, konkrete Maßnahme ein.", "Nutze „Mein Vorschlag wäre, …“."],
      options: [
        {
          id: "k1a",
          text: "Gute Ideen! Mein Vorschlag wäre außerdem, auf Ökostrom umzustellen und Mehrwegbecher in der Küche einzuführen.",
          uses: "suggestions",
          quality: 1,
          feedback: "Stark: du baust auf den Vorschlägen auf und ergänzt konkret.",
          next: "k2",
        },
        {
          id: "k1b",
          text: "Da bin ich ganz deiner Meinung. Wir könnten auch Dienstreisen reduzieren und stattdessen Videokonferenzen nutzen.",
          uses: "agree",
          quality: 0.95,
          feedback: "Sehr gut – Zustimmung plus relevanter Zusatzvorschlag.",
          next: "k2",
        },
        {
          id: "k1c",
          text: "Mülltrennung haben wir doch schon, das bringt nichts Neues.",
          uses: "disagree",
          quality: 0.4,
          feedback: "Wirkt abweisend. Lieber konstruktiv ergänzen statt abblocken.",
          next: "k2",
        },
      ],
    },
    k2: {
      id: "k2",
      speaker: "partner",
      line: "Das sind viele Ideen. Aber wir haben ein begrenztes Budget. Was hat für dich Priorität?",
      gloss: "Those are many ideas. But we have a limited budget. What is your priority?",
      hints: ["Priorisiere und begründe (… weil es günstig und schnell umsetzbar ist).", "Nenne Vor- und Nachteile."],
      options: [
        {
          id: "k2a",
          text: "Ich würde mit den günstigen Maßnahmen beginnen: weniger Papier und Mehrwegbecher. Das kostet fast nichts und wirkt sofort.",
          uses: "opinion",
          quality: 1,
          feedback: "Top: klare Priorisierung mit überzeugender Begründung.",
          next: "k3",
        },
        {
          id: "k2b",
          text: "Ökostrom hat zwar höhere Kosten, aber den größten Effekt. Einerseits teurer, andererseits langfristig sinnvoll.",
          uses: "prosCons",
          quality: 0.95,
          feedback: "Sehr gut abgewogen – starke Pro-Contra-Struktur.",
          next: "k3",
        },
      ],
    },
    k3: {
      id: "k3",
      speaker: "partner",
      line: "Ich finde Ökostrom auch wichtig, aber ich fürchte, das Budget reicht dieses Jahr nicht für alles. Wie lösen wir das?",
      gloss: "I think green electricity is important too, but I fear the budget won't cover everything this year. How do we solve that?",
      hints: ["Schlage einen Kompromiss / Stufenplan vor.", "Nutze „Lassen Sie uns einen Mittelweg finden.“"],
      options: [
        {
          id: "k3a",
          text: "Lass uns einen Stufenplan machen: Dieses Jahr die günstigen Maßnahmen, nächstes Jahr Ökostrom. So bleiben wir im Budget.",
          uses: "compromise",
          quality: 1,
          feedback: "Ausgezeichnet: ein tragfähiger Kompromiss mit Zeitplan.",
          next: "free3",
        },
        {
          id: "k3b",
          text: "Wir könnten uns in der Mitte treffen und Ökostrom nur für einen Teil des Büros testen.",
          uses: "compromise",
          quality: 0.9,
          feedback: "Guter, pragmatischer Mittelweg.",
          next: "free3",
        },
      ],
    },
    free3: {
      id: "free3",
      speaker: "examiner",
      line: "Stellen Sie das Ergebnis bitte so vor, wie Sie es Ihrem Chef präsentieren würden.",
      gloss: "Please present the result as you would to your boss.",
      prompt: "Sprich 25–35 Sekunden: Präsentiere euer Maßnahmenpaket, die Priorisierung und den Zeitplan.",
      model:
        "Wir schlagen einen Stufenplan vor. In diesem Jahr starten wir mit günstigen, schnell wirksamen Maßnahmen: weniger Papier, Mülltrennung und Mehrwegbecher. Im nächsten Jahr stellen wir, sobald das Budget es erlaubt, auf Ökostrom um. So bleiben wir im Rahmen des Budgets und machen das Büro Schritt für Schritt nachhaltiger.",
      hints: ["Strukturiere mit „zunächst … anschließend …“.", "Betone den Nutzen für die Firma."],
      next: "kend",
    },
    kend: {
      id: "kend",
      speaker: "narrator",
      line: "Sie haben ein überzeugendes Maßnahmenpaket entwickelt. Hervorragend!",
      end: true,
    },
  },
};

export const scenarios: Scenario[] = [sommerfest, reklamation, nachhaltigkeit];

export const scenarioById = (id: string) => scenarios.find((s) => s.id === id);
export const scenariosByTheme = (themeId: string) =>
  scenarios.filter((s) => s.themeId === themeId);
