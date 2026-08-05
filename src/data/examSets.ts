import type { ExamSet } from "@/types";

const sharedRubric = [
  {
    id: "fulfilment",
    label: "Aufgabenerfüllung",
    description: "Wurde die Aufgabe gelöst und eine gemeinsame Entscheidung getroffen?",
  },
  {
    id: "interaction",
    label: "Interaktion",
    description: "Auf den Partner eingehen, Fragen stellen, Vorschläge aufgreifen.",
  },
  {
    id: "redemittel",
    label: "Redemittel & Wortschatz",
    description: "Passende, abwechslungsreiche Wendungen für Vorschläge, Zustimmung, Kompromiss.",
  },
  {
    id: "fluency",
    label: "Flüssigkeit",
    description: "Zusammenhängend und ohne lange Pausen sprechen.",
  },
  {
    id: "correctness",
    label: "Korrektheit",
    description: "Grammatik und Aussprache verständlich und weitgehend korrekt.",
  },
];

export const examSets: ExamSet[] = [
  {
    id: "ex_betriebsfest",
    title: "Prüfungssimulation: Betriebsfest planen",
    themeId: "scheduling",
    scenarioId: "sc_sommerfest",
    totalMinutes: 6,
    taskSheet:
      "Ihre Firma möchte ein Betriebsfest veranstalten. Planen Sie gemeinsam mit Ihrem Gesprächspartner / Ihrer Gesprächspartnerin das Fest und einigen Sie sich auf eine gemeinsame Lösung.",
    aspects: [
      "Termin und Uhrzeit",
      "Ort des Festes",
      "Essen und Getränke (Budget: 25 € pro Person)",
      "Wer übernimmt welche Aufgabe?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_reklamation",
    title: "Prüfungssimulation: Reklamation lösen",
    themeId: "customer",
    scenarioId: "sc_reklamation",
    totalMinutes: 6,
    taskSheet:
      "Ein wichtiger Kunde hat eine beschädigte Lieferung erhalten und ist verärgert. Finden Sie gemeinsam eine Lösung, mit der der Kunde zufrieden bleibt.",
    aspects: [
      "Wie reagieren Sie auf die Beschwerde?",
      "Welche schnelle Lösung bieten Sie an?",
      "Wie kommen Sie dem Kunden entgegen (Kulanz)?",
      "Wer übernimmt welche Schritte?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_nachhaltigkeit",
    title: "Prüfungssimulation: Büro nachhaltiger machen",
    themeId: "sustainability",
    scenarioId: "sc_nachhaltigkeit",
    totalMinutes: 7,
    taskSheet:
      "Ihre Geschäftsleitung möchte das Büro umweltfreundlicher gestalten. Sammeln Sie gemeinsam Maßnahmenvorschläge, priorisieren Sie diese und einigen Sie sich auf einen umsetzbaren Plan.",
    aspects: [
      "Welche Maßnahmen schlagen Sie vor?",
      "Wie priorisieren Sie angesichts des begrenzten Budgets?",
      "Wie lösen Sie den Konflikt zwischen Wunsch und Budget?",
      "Wie stellen Sie das Ergebnis der Geschäftsleitung vor?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_projektplanung",
    title: "Prüfungssimulation: Projekt in Verzug",
    themeId: "project",
    scenarioId: "sc_projektplanung",
    totalMinutes: 7,
    taskSheet:
      "Ihr Projekt für einen Großkunden ist zwei Wochen in Verzug. Finden Sie gemeinsam Maßnahmen, um die Deadline einzuhalten, und klären Sie die Kundenkommunikation.",
    aspects: [
      "Welche Maßnahmen helfen, den Rückstand aufzuholen?",
      "Wie priorisieren Sie die verbleibenden Aufgaben?",
      "Wie und wann informieren Sie den Kunden?",
      "Wer übernimmt welche Aufgaben?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_homeoffice",
    title: "Prüfungssimulation: Homeoffice-Regelung",
    themeId: "technology",
    scenarioId: "sc_homeoffice",
    totalMinutes: 6,
    taskSheet:
      "Ihr Unternehmen führt Homeoffice ein. Erarbeiten Sie gemeinsam mit Ihrer Kollegin / Ihrem Kollegen eine faire und praktikable Regelung für alle Mitarbeitenden.",
    aspects: [
      "Wie viele Homeoffice-Tage empfehlen Sie und warum?",
      "Wie gehen Sie mit Stellen um, die Präsenz erfordern?",
      "Wie sichern Sie Erreichbarkeit und Produktivität?",
      "Was passiert bei Nichteinhaltung der Regelung?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_konflikt",
    title: "Prüfungssimulation: Konflikt im Team",
    themeId: "conflict",
    scenarioId: "sc_konflikt",
    totalMinutes: 7,
    taskSheet:
      "Zwei Mitarbeitende in Ihrem Team haben einen Konflikt, der die Zusammenarbeit belastet. Entwickeln Sie gemeinsam mit der Teamleitung einen Plan zur Vermittlung und langfristigen Lösung.",
    aspects: [
      "Wie gehen Sie als Erstes vor?",
      "Wie gestalten Sie das Vermittlungsgespräch?",
      "Welche Maßnahmen sichern eine langfristige Lösung?",
      "Wie kommunizieren Sie das Ergebnis an das Team?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_sicherheit",
    title: "Prüfungssimulation: Sicherheitsmängel beheben",
    themeId: "safety",
    scenarioId: "sc_sicherheit",
    totalMinutes: 6,
    taskSheet:
      "Eine Sicherheitsbegehung hat drei Mängel in Ihrem Betrieb festgestellt. Einigen Sie sich mit der Sicherheitsbeauftragten Person auf Prioritäten, Maßnahmen und Zuständigkeiten.",
    aspects: [
      "Wie priorisieren Sie die drei Mängel?",
      "Was tun Sie, wenn das Budget fehlt?",
      "Wie informieren Sie die Belegschaft?",
      "Wer ist für welche Maßnahme zuständig, und bis wann?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_teambesprechung",
    title: "Prüfungssimulation: Teambesprechung",
    themeId: "meetings",
    scenarioId: "sc_teambesprechung",
    totalMinutes: 6,
    taskSheet:
      "Sie sollen gemeinsam mit einer Kollegin / einem Kollegen eine Teambesprechung vorbereiten. Einigen Sie sich auf Tagesordnung, Zeitplan und Aufgaben.",
    aspects: [
      "Welche Themen kommen auf die Tagesordnung?",
      "Wie viel Zeit planen Sie für jeden Punkt ein?",
      "Wer leitet die Besprechung, wer schreibt das Protokoll?",
      "Wie stellen Sie sicher, dass Beschlüsse umgesetzt werden?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_lieferproblem",
    title: "Prüfungssimulation: Lieferverzögerung",
    themeId: "logistics",
    scenarioId: "sc_lieferproblem",
    totalMinutes: 7,
    taskSheet:
      "Ihr wichtigster Rohstofflieferant kann nicht pünktlich liefern. Finden Sie gemeinsam Maßnahmen, um die Produktion zu sichern und die Kunden zu informieren.",
    aspects: [
      "Wie bewerten Sie die Auswirkungen der Verzögerung?",
      "Wie nutzen Sie die mögliche Teillieferung?",
      "Wie sichern Sie die Versorgung langfristig ab?",
      "Wie kommunizieren Sie mit den betroffenen Kunden?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_dienstreise",
    title: "Prüfungssimulation: Dienstreise planen",
    themeId: "travel",
    scenarioId: "sc_dienstreise",
    totalMinutes: 6,
    taskSheet:
      "Sie und eine Kollegin / ein Kollege sollen zu einem wichtigen Kundengespräch in eine andere Stadt reisen. Planen Sie gemeinsam alle Details der Dienstreise.",
    aspects: [
      "Wie reisen Sie an – Zug oder Auto?",
      "Wann reisen Sie an?",
      "Welches Hotel buchen Sie?",
      "Welche Unterlagen und Materialien nehmen Sie mit?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_behoerde",
    title: "Prüfungssimulation: Behördengänge organisieren",
    themeId: "behoerde",
    scenarioId: "sc_anmeldung",
    totalMinutes: 6,
    taskSheet:
      "Sie und Ihre Partnerin / Ihr Partner sind gerade nach Deutschland gezogen und müssen mehrere Behördengänge erledigen. Planen Sie gemeinsam, welche Termine Sie machen und wer welche Aufgabe übernimmt.",
    aspects: [
      "Welche Ämter müssen Sie zuerst aufsuchen (Anmeldung, Ausländerbehörde)?",
      "In welcher Reihenfolge gehen Sie vor?",
      "Wer besorgt welche Unterlagen?",
      "Wer übernimmt welchen Termin?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_arzt",
    title: "Prüfungssimulation: Arzttermine organisieren",
    themeId: "arzt",
    scenarioId: "sc_arztbesuch",
    totalMinutes: 6,
    taskSheet:
      "Ein Familienmitglied ist krank und braucht in den nächsten Wochen Unterstützung. Planen Sie gemeinsam mit Ihrer Partnerin / Ihrem Partner, wie Sie Arztbesuche, Medikamente und Hilfe im Alltag organisieren.",
    aspects: [
      "Welche Arzttermine sind nötig und wer begleitet?",
      "Wie organisieren Sie die Medikamente aus der Apotheke?",
      "Wer hilft wann im Alltag (Einkäufe, Wege)?",
      "Wie halten Sie wichtige Infos für die Krankenkasse fest?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_wohnen",
    title: "Prüfungssimulation: Wohnung gemeinsam entscheiden",
    themeId: "wohnen",
    scenarioId: "sc_wohnungsbesichtigung",
    totalMinutes: 6,
    taskSheet:
      "Sie und Ihre Partnerin / Ihr Partner haben eine Wohnung besichtigt und müssen sich entscheiden. Besprechen Sie die Vor- und Nachteile und einigen Sie sich, ob und wie Sie die Wohnung nehmen.",
    aspects: [
      "Was spricht für und gegen die Wohnung (Lage, Größe, Miete)?",
      "Passen die Kosten in Ihr Budget?",
      "Wer kümmert sich um Vertrag und Kaution?",
      "Wie teilen Sie die Aufgaben beim Umzug auf?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_bank",
    title: "Prüfungssimulation: Finanzen gemeinsam planen",
    themeId: "bank",
    scenarioId: "sc_kontoeroeffnung",
    totalMinutes: 6,
    taskSheet:
      "Sie und Ihre Partnerin / Ihr Partner möchten Ihre Finanzen besser organisieren. Planen Sie gemeinsam, wie Sie Ihre Konten einrichten und Geld für ein gemeinsames Ziel sparen.",
    aspects: [
      "Getrenntes oder gemeinsames Konto: Was passt besser?",
      "Wie viel können Sie monatlich sparen?",
      "Für welches Ziel sparen Sie (Reise, Notgroschen)?",
      "Wer behält welche Ausgaben im Blick?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_bildung",
    title: "Prüfungssimulation: Sprachkurs gemeinsam planen",
    themeId: "bildung",
    scenarioId: "sc_sprachkursberatung",
    totalMinutes: 6,
    taskSheet:
      "Sie und eine Freundin / ein Freund möchten Ihr Deutsch gemeinsam verbessern. Planen Sie zusammen, welchen Kurs Sie besuchen, und einigen Sie sich auf einen gemeinsamen Plan.",
    aspects: [
      "Welches Kursformat passt (Abendkurs, Onlinekurs, Intensivkurs)?",
      "Wie viel Zeit und Geld möchten Sie investieren?",
      "Welches Ziel verfolgen Sie (Beruf, Prüfung, Alltag)?",
      "Wie unterstützen Sie sich gegenseitig beim Lernen?",
    ],
    rubric: sharedRubric,
  },

  /* ------------------------------------------------------------------------
   * Alltag above the entry rung (s194 audit P17).
   *
   * Every Alltag set authored before this one hangs off a level-1 scenario, and
   * the Modelltest picks its speaking task by that ladder (B1 -> 1, B2 -> 2,
   * C1 -> 3). A B2 or C1 candidate could therefore only ever be given a
   * WORKPLACE speaking task, which contradicts the product's own scope: daily
   * life is a pillar, not an extra.
   *
   * The scenarios were already there at both rungs; only the exam framings were
   * missing. These six sit on them: three level-2 (B2) and three level-3 (C1),
   * across Behörde, Wohnen, Arzt and Digitales.
   * ---------------------------------------------------------------------- */
  {
    id: "ex_auslaenderbehoerde",
    title: "Prüfungssimulation: Behördentermin vorbereiten",
    themeId: "behoerde",
    scenarioId: "sc_auslaenderbehoerde",
    totalMinutes: 7,
    taskSheet:
      "Sie und Ihre Partnerin / Ihr Partner haben einen Termin bei der Ausländerbehörde und wollen ihn zusammen vorbereiten. Klären Sie gemeinsam, was mitgebracht werden muss, und einigen Sie sich auf ein Vorgehen.",
    aspects: [
      "Welche Unterlagen brauchen Sie und was fehlt noch?",
      "Wie gehen Sie vor, wenn ein Dokument nicht rechtzeitig da ist?",
      "Wie formulieren Sie Ihr Anliegen am Schalter?",
      "Wer übernimmt welchen Schritt vor dem Termin?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_wohnungsmangel",
    title: "Prüfungssimulation: Mangel in der Wohnung melden",
    themeId: "wohnen",
    scenarioId: "sc_wohnungsmangel",
    totalMinutes: 7,
    taskSheet:
      "In Ihrer Wohnung gibt es seit Wochen einen Mangel, den die Hausverwaltung nicht behoben hat. Besprechen Sie gemeinsam, wie Sie vorgehen, und einigen Sie sich auf die nächsten Schritte.",
    aspects: [
      "Wie beschreiben Sie den Mangel und seine Folgen?",
      "Welche Frist setzen Sie der Hausverwaltung?",
      "Was tun Sie, wenn nichts passiert?",
      "Wer kümmert sich um welchen Schritt?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_internetstoerung",
    title: "Prüfungssimulation: Störung reklamieren",
    themeId: "digitales",
    scenarioId: "sc_internet_stoerung",
    totalMinutes: 6,
    taskSheet:
      "Ihr Internetanschluss fällt seit Tagen immer wieder aus, und beide von Ihnen arbeiten von zu Hause. Besprechen Sie gemeinsam, wie Sie den Anbieter dazu bringen, das Problem zu lösen.",
    aspects: [
      "Wie schildern Sie die Störung nachvollziehbar?",
      "Welche Lösung fordern Sie vom Anbieter?",
      "Was verlangen Sie als Ausgleich für die Ausfälle?",
      "Wie überbrücken Sie die Zeit bis zur Reparatur?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_widerspruch",
    title: "Prüfungssimulation: Widerspruch gegen einen Bescheid",
    themeId: "behoerde",
    scenarioId: "sc_widerspruch",
    totalMinutes: 7,
    taskSheet:
      "Sie haben einen ablehnenden Bescheid von einer Behörde bekommen und halten ihn für falsch. Besprechen Sie gemeinsam mit Ihrer Partnerin / Ihrem Partner, wie Sie Widerspruch einlegen, und einigen Sie sich auf eine Strategie.",
    aspects: [
      "Auf welche Punkte des Bescheids gehen Sie ein?",
      "Womit begründen Sie Ihren Widerspruch?",
      "Welche Nachweise legen Sie bei?",
      "Wie gehen Sie vor, wenn der Widerspruch abgelehnt wird?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_mietminderung",
    title: "Prüfungssimulation: Schimmel und Mietminderung",
    themeId: "wohnen",
    scenarioId: "sc_mietminderung",
    totalMinutes: 7,
    taskSheet:
      "In der Wohnung tritt seit Monaten Schimmel auf, und die Vermieterin macht Ihnen Vorwürfe wegen falschen Lüftens. Besprechen Sie gemeinsam, wie Sie reagieren, und einigen Sie sich auf ein gemeinsames Vorgehen.",
    aspects: [
      "Wie widersprechen Sie dem Vorwurf sachlich?",
      "Wie dokumentieren Sie den Schaden?",
      "Unter welchen Bedingungen mindern Sie die Miete?",
      "Wann schalten Sie eine Beratungsstelle ein?",
    ],
    rubric: sharedRubric,
  },
  {
    id: "ex_kostenuebernahme",
    title: "Prüfungssimulation: Kasse lehnt die Behandlung ab",
    themeId: "arzt",
    scenarioId: "sc_kostenuebernahme",
    totalMinutes: 7,
    taskSheet:
      "Ihre Krankenkasse hat die Kostenübernahme für eine ärztlich empfohlene Behandlung abgelehnt. Besprechen Sie gemeinsam, wie Sie darauf reagieren, und einigen Sie sich auf die nächsten Schritte.",
    aspects: [
      "Wie begründen Sie, dass die Behandlung nötig ist?",
      "Welche Unterlagen holen Sie bei der Ärztin oder dem Arzt ein?",
      "Wie formulieren Sie Ihren Antrag an die Kasse?",
      "Welche Alternative haben Sie, falls es bei der Ablehnung bleibt?",
    ],
    rubric: sharedRubric,
  },
];

export const examById = (id: string) => examSets.find((e) => e.id === id);
