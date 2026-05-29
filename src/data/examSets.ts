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
];

export const examById = (id: string) => examSets.find((e) => e.id === id);
