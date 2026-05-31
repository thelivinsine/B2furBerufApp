import type { ThemeId } from "@/types";

/**
 * Theme-linked writing prompts for the AI writing coach. Each theme offers a
 * short (~40–60 words) and a long (~120–150 words) task framed like a B2 Beruf
 * workplace writing situation (E-Mail / Stellungnahme / Notiz).
 */
export interface WritingPrompt {
  themeId: ThemeId;
  short: string;
  long: string;
}

export const writingPrompts: Record<ThemeId, WritingPrompt> = {
  meetings: {
    themeId: "meetings",
    short:
      "Schreibe eine kurze E-Mail an dein Team: Schlage einen neuen Termin für die wöchentliche Besprechung vor und nenne einen Grund.",
    long: "Verfasse eine E-Mail an deine Kolleg:innen. Fasse die wichtigsten Ergebnisse der letzten Besprechung zusammen, benenne die offenen Punkte und schlage konkrete nächste Schritte mit Verantwortlichkeiten vor.",
  },
  scheduling: {
    themeId: "scheduling",
    short:
      "Schreibe eine kurze Nachricht: Bitte eine Kollegin, einen Termin zu verschieben, und biete zwei Alternativen an.",
    long: "Schreibe eine E-Mail, in der du einen Projektzeitplan erläuterst. Begründe, warum sich eine Frist verschiebt, beschreibe die Auswirkungen und schlage einen angepassten Plan vor.",
  },
  logistics: {
    themeId: "logistics",
    short:
      "Schreibe eine kurze E-Mail an einen Lieferanten: Frage nach dem Status einer verspäteten Lieferung.",
    long: "Verfasse eine Stellungnahme zu einem Lieferengpass. Beschreibe das Problem, nenne mögliche Ursachen und schlage Maßnahmen vor, um die Versorgung sicherzustellen.",
  },
  customer: {
    themeId: "customer",
    short:
      "Schreibe eine kurze Antwort an einen Kunden, der sich über eine fehlerhafte Bestellung beschwert hat.",
    long: "Schreibe eine E-Mail an einen unzufriedenen Kunden. Entschuldige dich angemessen, erkläre, wie es zum Problem kam, und biete eine konkrete Lösung sowie eine Wiedergutmachung an.",
  },
  conflict: {
    themeId: "conflict",
    short:
      "Schreibe eine kurze, diplomatische Nachricht an einen Kollegen, mit dem es eine Meinungsverschiedenheit gab.",
    long: "Verfasse eine Stellungnahme zu einem Konflikt im Team. Schildere die Situation sachlich, zeige Verständnis für beide Seiten und schlage einen Kompromiss vor.",
  },
  project: {
    themeId: "project",
    short:
      "Schreibe eine kurze Statusmeldung zu deinem aktuellen Projekt für die Projektleitung.",
    long: "Schreibe einen Projektbericht. Beschreibe den aktuellen Stand, nenne Risiken und Verzögerungen und empfiehl, wie das Projekt wieder in den Zeitplan kommt.",
  },
  technology: {
    themeId: "technology",
    short:
      "Schreibe eine kurze E-Mail an den IT-Support: Beschreibe ein technisches Problem an deinem Arbeitsplatz.",
    long: "Verfasse eine Stellungnahme zur Einführung einer neuen Software im Unternehmen. Nenne Vor- und Nachteile und gib eine begründete Empfehlung.",
  },
  sustainability: {
    themeId: "sustainability",
    short:
      "Schreibe einen kurzen Vorschlag, wie dein Team im Büro nachhaltiger arbeiten könnte.",
    long: "Schreibe eine Stellungnahme zum Thema Nachhaltigkeit am Arbeitsplatz. Begründe, warum das Thema wichtig ist, und schlage drei konkrete Maßnahmen mit erwartetem Nutzen vor.",
  },
  safety: {
    themeId: "safety",
    short:
      "Schreibe eine kurze Notiz an die Kolleg:innen zu einer neuen Sicherheitsregel im Betrieb.",
    long: "Verfasse eine Stellungnahme zu einem Sicherheitsvorfall. Beschreibe, was passiert ist, welche Maßnahmen nötig sind und wie sich ein solcher Vorfall künftig vermeiden lässt.",
  },
  travel: {
    themeId: "travel",
    short:
      "Schreibe eine kurze E-Mail, um eine Dienstreise zu organisieren (Termin, Ziel, Zweck).",
    long: "Schreibe einen Bericht über eine Dienstreise. Fasse die wichtigsten Ergebnisse zusammen, bewerte den Nutzen der Reise und gib eine Empfehlung für künftige Reisen.",
  },
};
