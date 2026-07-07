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
];

export const examById = (id: string) => examSets.find((e) => e.id === id);
