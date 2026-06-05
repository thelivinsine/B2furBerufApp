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
];

export const examById = (id: string) => examSets.find((e) => e.id === id);
