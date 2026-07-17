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
  behoerde: {
    themeId: "behoerde",
    short:
      "Schreibe eine kurze E-Mail an das Bürgeramt: Bitte um einen Termin zur Anmeldung deines neuen Wohnsitzes und nenne deine Verfügbarkeit.",
    long: "Verfasse eine formelle E-Mail an die Ausländerbehörde. Erkläre, dass du deinen Aufenthaltstitel verlängern möchtest, frage nach den nötigen Unterlagen und bitte höflich um einen Termin.",
  },
  arzt: {
    themeId: "arzt",
    short:
      "Schreibe eine kurze E-Mail an eine Arztpraxis: Bitte um einen Termin, beschreibe kurz deine Beschwerden und nenne deine Verfügbarkeit.",
    long: "Verfasse eine formelle E-Mail an deine Krankenkasse. Erkläre, dass du eine Rechnung einreichen möchtest, frage nach der Kostenübernahme für eine Behandlung und bitte höflich um eine schriftliche Bestätigung.",
  },
  wohnen: {
    themeId: "wohnen",
    short:
      "Schreibe eine kurze E-Mail an einen Vermieter: Zeige Interesse an einer Wohnung, bitte um einen Besichtigungstermin und nenne deine Verfügbarkeit.",
    long: "Verfasse eine formelle E-Mail an deine Hausverwaltung. Melde einen Mangel in der Wohnung (zum Beispiel Schimmel oder eine defekte Heizung), bitte um eine Reparatur mit Frist und weise höflich auf deine Rechte als Mieter hin.",
  },
  bank: {
    themeId: "bank",
    short:
      "Schreibe eine kurze E-Mail an deine Bank: Bitte um einen Beratungstermin zur Eröffnung eines Girokontos und frage, welche Unterlagen du mitbringen musst.",
    long: "Verfasse eine formelle E-Mail an deine Bank. Beschwere dich höflich über eine falsch gebuchte Lastschrift, bitte um eine Rückbuchung und frage nach, wie du solche Abbuchungen künftig verhindern kannst.",
  },
  bildung: {
    themeId: "bildung",
    short:
      "Schreibe eine kurze E-Mail an eine Sprachschule: Frage nach einem passenden Kurs für dein Niveau, nach den Kosten und nach dem nächsten Kursbeginn.",
    long: "Verfasse eine formelle E-Mail an eine zuständige Stelle. Bitte um die Anerkennung deines ausländischen Abschlusses, erkläre deinen bisherigen Werdegang und frage nach den nötigen Unterlagen und dem Ablauf des Verfahrens.",
  },
  einkaufen: {
    themeId: "einkaufen",
    short:
      "Schreibe eine kurze E-Mail an einen Onlineshop: Ein Artikel ist beschädigt angekommen. Beschreibe das Problem und frage nach Umtausch oder Erstattung.",
    long: "Verfasse eine formelle Reklamations-E-Mail an einen Onlineshop. Erkläre, welchen Artikel du bestellt hast und was mit der Lieferung nicht stimmt, nenne deine Bestellnummer und bitte höflich um eine Erstattung oder einen Ersatz mit einer klaren Frist.",
  },
  essen: {
    themeId: "essen",
    short:
      "Schreibe eine kurze E-Mail an ein Restaurant: Reserviere einen Tisch für vier Personen, nenne Datum und Uhrzeit und frage nach vegetarischen Gerichten.",
    long: "Verfasse eine formelle E-Mail an ein Restaurant. Reserviere einen Tisch für eine Feier, nenne die Personenzahl und den Anlass, frage nach einem Menü mit vegetarischen und veganen Optionen und bitte um eine Bestätigung der Reservierung.",
  },
  mobilitaet: {
    themeId: "mobilitaet",
    short:
      "Schreibe eine kurze E-Mail an den Verkehrsverbund: Du hast wegen einer Verspätung deinen Anschluss verpasst und möchtest die Kosten für ein Ersatzticket zurück.",
    long: "Verfasse eine formelle Beschwerde-E-Mail an ein Verkehrsunternehmen. Beschreibe, welche Verbindung du nutzen wolltest, wie es zur Verspätung kam und welche Folgen das hatte, und bitte höflich um eine Erstattung oder Entschädigung mit einer klaren Frist.",
  },
  freizeit: {
    themeId: "freizeit",
    short:
      "Schreibe eine kurze Nachricht an einen Freund: Lade ihn zu einem gemeinsamen Ausflug am Wochenende ein und schlage Zeit und Treffpunkt vor.",
    long: "Verfasse eine Einladung an mehrere Freunde zu einer kleinen Feier. Nenne den Anlass, Datum und Ort, beschreibe kurz, was geplant ist, und bitte um eine Zu- oder Absage bis zu einem bestimmten Termin.",
  },
  digitales: {
    themeId: "digitales",
    short:
      "Schreibe eine kurze E-Mail an deinen Internetanbieter: Deine Verbindung fällt ständig aus. Beschreibe das Problem und bitte um eine schnelle Lösung.",
    long: "Verfasse eine formelle E-Mail an deinen Mobilfunk- oder Internetanbieter. Erkläre, seit wann und wie oft die Störung auftritt, welche Schritte du schon versucht hast, nenne deine Kundennummer und bitte um eine Lösung oder eine Minderung der Gebühr mit einer klaren Frist.",
  },
};
