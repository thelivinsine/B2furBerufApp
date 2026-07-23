import type { ThemeId } from "@/types";

/**
 * Theme-linked writing-prompt POOLS for the AI writing coach (random-Aufgabe
 * redesign, s148; single prompt per length before that). Each theme offers a
 * pool of short (~40-60 words) and long (~120-150 words) tasks framed like
 * B1-B2 writing situations (E-Mail / Nachricht / Stellungnahme / Bericht):
 * picking a theme draws a RANDOM task, the dice on the Aufgabe card re-rolls
 * within the theme. Provenance: the whole pool rides on the theme's one
 * `wp_<themeId>` register row (the mission pattern: scenes ride on the
 * mission's row). Wave 1 ships 5 per theme per length; the founder target is
 * 15-20, grown in later content waves. No em dashes in copy.
 */
export interface WritingPrompt {
  themeId: ThemeId;
  /** Kurz tasks (~40-60 words). */
  short: string[];
  /** Lang tasks (~120-150 words). */
  long: string[];
}

export const writingPrompts: Record<ThemeId, WritingPrompt> = {
  meetings: {
    themeId: "meetings",
    short: [
      "Schreibe eine kurze E-Mail an dein Team: Schlage einen neuen Termin für die wöchentliche Besprechung vor und nenne einen Grund.",
      "Schreibe eine kurze Nachricht an dein Team: Erinnere an das Meeting morgen und nenne die zwei wichtigsten Punkte der Tagesordnung.",
      "Schreibe eine kurze E-Mail an deinen Chef: Bitte darum, einen Punkt auf die Tagesordnung der nächsten Besprechung zu setzen, und begründe kurz, warum er wichtig ist.",
      "Schreibe eine kurze Entschuldigung an die Runde: Du kommst 20 Minuten später zur Besprechung. Nenne den Grund und schlage vor, wie ihr trotzdem gut starten könnt.",
      "Schreibe eine kurze Notiz für das Protokoll: Fasse die zwei wichtigsten Beschlüsse der heutigen Besprechung zusammen.",
    ],
    long: [
      "Verfasse eine E-Mail an deine Kolleg:innen. Fasse die wichtigsten Ergebnisse der letzten Besprechung zusammen, benenne die offenen Punkte und schlage konkrete nächste Schritte mit Verantwortlichkeiten vor.",
      "Verfasse ein kurzes Protokoll einer Teambesprechung. Nenne die Teilnehmenden, fasse die besprochenen Themen zusammen und halte die Beschlüsse mit Verantwortlichkeiten und Fristen fest.",
      "Schreibe eine E-Mail an eine Kollegin, die bei der Besprechung gefehlt hat. Erkläre, was besprochen wurde, welche Aufgaben sie übernehmen soll und bis wann.",
      "Verfasse eine Stellungnahme: Dein Team hat zu viele Meetings. Beschreibe das Problem, erkläre die Folgen für die Arbeit und schlage zwei konkrete Verbesserungen vor.",
      "Schreibe eine Einladung zu einem Kick-off-Meeting. Nenne Anlass, Termin und Ort, stelle die Tagesordnung vor und bitte um Rückmeldung bis zu einer Frist.",
    ],
  },
  scheduling: {
    themeId: "scheduling",
    short: [
      "Schreibe eine kurze Nachricht: Bitte eine Kollegin, einen Termin zu verschieben, und biete zwei Alternativen an.",
      "Schreibe eine kurze Bestätigung an einen Geschäftspartner: Bestätige den vereinbarten Termin und nenne Ort und Uhrzeit.",
      "Schreibe eine kurze Absage: Du musst einen Termin am Freitag absagen. Entschuldige dich und schlage einen neuen Termin vor.",
      "Schreibe eine kurze Nachricht an dein Team: Der Zeitplan für diese Woche ändert sich. Nenne die wichtigste Änderung und was zu tun ist.",
      "Schreibe eine kurze Erinnerung an einen Kollegen: Eine Frist läuft übermorgen ab. Bitte um einen kurzen Status.",
    ],
    long: [
      "Schreibe eine E-Mail, in der du einen Projektzeitplan erläuterst. Begründe, warum sich eine Frist verschiebt, beschreibe die Auswirkungen und schlage einen angepassten Plan vor.",
      "Schreibe eine E-Mail an eine Kundin: Ein vereinbarter Liefertermin ist nicht zu halten. Entschuldige dich, erkläre die Gründe und biete einen neuen, realistischen Termin mit einem Ausgleich an.",
      "Verfasse eine E-Mail an dein Team zu deinem Urlaub: Erkläre, wie die Vertretung geregelt ist, wer welche Aufgaben übernimmt und was vor deinem Urlaub noch erledigt werden muss.",
      "Schreibe eine Stellungnahme zur Terminplanung in deinem Team. Beschreibe, warum es oft zu Überschneidungen kommt, und schlage feste Regeln für Besprechungszeiten vor.",
      "Verfasse eine E-Mail an mehrere Beteiligte, um einen gemeinsamen Workshop-Termin zu finden. Schlage drei Optionen vor, erkläre den Zweck des Workshops und bitte um Antwort bis zu einer Frist.",
    ],
  },
  logistics: {
    themeId: "logistics",
    short: [
      "Schreibe eine kurze E-Mail an einen Lieferanten: Frage nach dem Status einer verspäteten Lieferung.",
      "Schreibe eine kurze Nachricht ans Lager: Eine Palette ist beschädigt angekommen. Beschreibe den Schaden und frage nach dem weiteren Vorgehen.",
      "Schreibe eine kurze E-Mail an einen Kunden: Seine Bestellung verzögert sich um drei Tage. Entschuldige dich und nenne den neuen Liefertermin.",
      "Schreibe eine kurze Bestellung an einen Lieferanten: Bestelle Büromaterial nach und bitte um eine Auftragsbestätigung.",
      "Schreibe eine kurze Notiz an die Spedition: Die Lieferadresse für eine Sendung hat sich geändert. Nenne die neue Adresse und die Auftragsnummer.",
    ],
    long: [
      "Verfasse eine Stellungnahme zu einem Lieferengpass. Beschreibe das Problem, nenne mögliche Ursachen und schlage Maßnahmen vor, um die Versorgung sicherzustellen.",
      "Verfasse eine Reklamation an einen Lieferanten: Die letzte Lieferung war unvollständig und teilweise beschädigt. Beschreibe die Mängel, fordere Ersatz und setze eine Frist.",
      "Schreibe einen kurzen Bericht über die Lagerbestände: Beschreibe, welche Artikel knapp werden, erkläre die Ursachen und empfiehl, was nachbestellt werden soll.",
      "Schreibe eine E-Mail an eine Spedition: Hole ein Angebot für regelmäßige Transporte ein. Beschreibe Strecke, Häufigkeit und Ware und frage nach Preisen und Konditionen.",
      "Verfasse eine Stellungnahme zur Einführung eines neuen Systems für die Lagerverwaltung. Nenne die Probleme mit dem alten Ablauf und begründe, welche Vorteile das neue System bringt.",
    ],
  },
  customer: {
    themeId: "customer",
    short: [
      "Schreibe eine kurze Antwort an einen Kunden, der sich über eine fehlerhafte Bestellung beschwert hat.",
      "Schreibe eine kurze Antwort an eine Kundin: Sie fragt nach dem Stand ihrer Anfrage. Entschuldige die Wartezeit und nenne einen Termin für die Antwort.",
      "Schreibe eine kurze E-Mail an einen Neukunden: Bedanke dich für die erste Bestellung und biete Hilfe bei Fragen an.",
      "Schreibe eine kurze Absage an einen Kunden: Ein gewünschter Sonderrabatt ist nicht möglich. Begründe höflich und biete eine Alternative an.",
      "Schreibe eine kurze Terminbestätigung für ein Beratungsgespräch mit einer Kundin. Nenne Datum, Uhrzeit und was sie mitbringen soll.",
    ],
    long: [
      "Schreibe eine E-Mail an einen unzufriedenen Kunden. Entschuldige dich angemessen, erkläre, wie es zum Problem kam, und biete eine konkrete Lösung sowie eine Wiedergutmachung an.",
      "Verfasse eine E-Mail an eine langjährige Kundin: Kündige eine Preiserhöhung an. Begründe sie nachvollziehbar, betone den Wert eurer Zusammenarbeit und biete ein Gespräch an.",
      "Schreibe eine Antwort auf eine öffentliche negative Bewertung eures Unternehmens. Bleibe sachlich und freundlich, gehe auf die Kritikpunkte ein und biete eine Klärung im direkten Kontakt an.",
      "Verfasse ein Angebot für einen Interessenten: Beschreibe die angefragte Leistung, nenne Preis und Lieferzeit und erkläre, warum euer Unternehmen die richtige Wahl ist.",
      "Schreibe eine E-Mail an einen Kunden, dessen Vertrag bald ausläuft. Erinnere an das Vertragsende, stelle die Verlängerungsoptionen vor und empfiehl die passende Option mit Begründung.",
    ],
  },
  conflict: {
    themeId: "conflict",
    short: [
      "Schreibe eine kurze, diplomatische Nachricht an einen Kollegen, mit dem es eine Meinungsverschiedenheit gab.",
      "Schreibe eine kurze Entschuldigung an eine Kollegin: Du warst im Gespräch gestern zu direkt. Erkläre kurz, wie du es gemeint hast.",
      "Schreibe eine kurze Nachricht an deinen Chef: Bitte um ein Gespräch über ein Problem im Team, ohne Namen zu nennen.",
      "Schreibe eine kurze, sachliche Antwort auf eine verärgerte E-Mail eines Kollegen. Zeige Verständnis und schlage ein kurzes Gespräch vor.",
      "Schreibe eine kurze Nachricht an zwei Kollegen, die sich gestritten haben: Lade beide zu einem klärenden Gespräch ein und bleibe neutral.",
    ],
    long: [
      "Verfasse eine Stellungnahme zu einem Konflikt im Team. Schildere die Situation sachlich, zeige Verständnis für beide Seiten und schlage einen Kompromiss vor.",
      "Schreibe eine E-Mail an deine Vorgesetzte: Die Aufgabenverteilung im Team empfindest du als ungerecht. Beschreibe die Situation sachlich mit Beispielen und schlage eine fairere Lösung vor.",
      "Verfasse eine vermittelnde E-Mail an zwei Abteilungen, die sich gegenseitig die Schuld für einen Fehler geben. Fasse die Sicht beider Seiten zusammen und schlage ein gemeinsames Vorgehen vor.",
      "Schreibe eine Antwort auf eine unberechtigte Kritik an deiner Arbeit. Weise die Vorwürfe höflich, aber bestimmt zurück, belege deine Sicht mit Fakten und schlage vor, wie ihr künftig Missverständnisse vermeidet.",
      "Verfasse eine Stellungnahme zu einem Streit über die Urlaubsplanung im Team. Beschreibe das Problem, zeige Verständnis für beide Seiten und schlage eine klare Regel für die Zukunft vor.",
    ],
  },
  project: {
    themeId: "project",
    short: [
      "Schreibe eine kurze Statusmeldung zu deinem aktuellen Projekt für die Projektleitung.",
      "Schreibe eine kurze Nachricht an dein Projektteam: Ein Meilenstein ist geschafft. Bedanke dich und nenne den nächsten Schritt.",
      "Schreibe eine kurze Warnung an die Projektleitung: Eine Aufgabe verzögert sich. Nenne den Grund und die Auswirkung auf den Zeitplan.",
      "Schreibe eine kurze Bitte an eine Kollegin aus einer anderen Abteilung: Du brauchst ihre Zuarbeit für dein Projekt bis Ende der Woche.",
      "Schreibe eine kurze Zusammenfassung für das Projektboard: Was wurde diese Woche erledigt, was steht als Nächstes an?",
    ],
    long: [
      "Schreibe einen Projektbericht. Beschreibe den aktuellen Stand, nenne Risiken und Verzögerungen und empfiehl, wie das Projekt wieder in den Zeitplan kommt.",
      "Verfasse einen Abschlussbericht zu einem kleinen Projekt. Fasse Ziel und Ergebnis zusammen, bewerte, was gut und was schlecht lief, und ziehe Lehren für das nächste Projekt.",
      "Schreibe eine E-Mail an einen Auftraggeber: Das Projekt braucht mehr Budget. Erkläre die Gründe, beziffere den Mehrbedarf und beschreibe, was ohne die Erhöhung passiert.",
      "Verfasse einen Projektvorschlag für deine Führungskraft: Beschreibe die Idee, den Nutzen für das Unternehmen, den groben Zeitplan und welche Unterstützung du brauchst.",
      "Schreibe eine E-Mail an dein Projektteam zum Projektstart: Stelle das Ziel vor, erkläre die Rollen und Verantwortlichkeiten und nenne die ersten Aufgaben mit Fristen.",
    ],
  },
  technology: {
    themeId: "technology",
    short: [
      "Schreibe eine kurze E-Mail an den IT-Support: Beschreibe ein technisches Problem an deinem Arbeitsplatz.",
      "Schreibe eine kurze Antwort an den IT-Support: Das Problem besteht weiter. Beschreibe, was du schon versucht hast.",
      "Schreibe eine kurze Nachricht an dein Team: Morgen wird eine neue Software installiert. Erkläre, was das für die Arbeit bedeutet.",
      "Schreibe eine kurze Bitte an die IT: Du brauchst Zugriff auf einen gemeinsamen Ordner. Begründe kurz, wofür.",
      "Schreibe eine kurze Störungsmeldung: Der Drucker im zweiten Stock funktioniert nicht. Beschreibe das Problem und seit wann es besteht.",
    ],
    long: [
      "Verfasse eine Stellungnahme zur Einführung einer neuen Software im Unternehmen. Nenne Vor- und Nachteile und gib eine begründete Empfehlung.",
      "Verfasse eine Anleitung in einfachen Schritten für dein Team: Erkläre, wie man sich im neuen System anmeldet, wo die wichtigsten Funktionen liegen und an wen man sich bei Problemen wendet.",
      "Schreibe eine E-Mail an deine Führungskraft: Beantrage neue Hardware für dein Team. Beschreibe die Probleme mit den alten Geräten, den Nutzen der Anschaffung und die ungefähren Kosten.",
      "Verfasse eine Stellungnahme zum Thema Homeoffice und Technik: Beschreibe, welche technischen Voraussetzungen fehlen, welche Risiken das hat und was das Unternehmen verbessern sollte.",
      "Schreibe einen kurzen Bericht über eine IT-Störung: Beschreibe, was ausgefallen ist, wie lange die Störung dauerte, welche Folgen sie hatte und wie sich so ein Ausfall vermeiden lässt.",
    ],
  },
  sustainability: {
    themeId: "sustainability",
    short: [
      "Schreibe einen kurzen Vorschlag, wie dein Team im Büro nachhaltiger arbeiten könnte.",
      "Schreibe eine kurze Nachricht an dein Team: Ab nächster Woche wird der Müll im Büro getrennt. Erkläre kurz die neuen Regeln.",
      "Schreibe eine kurze E-Mail an die Verwaltung: Schlage vor, auf Ökostrom umzustellen, und begründe kurz.",
      "Schreibe eine kurze Einladung zu einer Aktion: Dein Team räumt am Freitag den Park neben dem Büro auf. Nenne Zeit und Treffpunkt.",
      "Schreibe eine kurze Notiz für das schwarze Brett: Erinnere daran, Licht und Geräte am Feierabend auszuschalten, und nenne einen Grund.",
    ],
    long: [
      "Schreibe eine Stellungnahme zum Thema Nachhaltigkeit am Arbeitsplatz. Begründe, warum das Thema wichtig ist, und schlage drei konkrete Maßnahmen mit erwartetem Nutzen vor.",
      "Verfasse eine E-Mail an die Geschäftsführung: Schlage vor, Dienstreisen durch Videokonferenzen zu ersetzen. Erkläre die Vorteile für Umwelt und Kosten und nenne, wann Reisen weiter nötig sind.",
      "Schreibe einen kurzen Bericht über die Umweltmaßnahmen in deiner Abteilung: Was wurde umgesetzt, was hat es gebracht und wo gibt es noch Verbesserungsbedarf?",
      "Verfasse eine Stellungnahme zur Frage, ob euer Betrieb auf Papier verzichten kann. Beschreibe den aktuellen Verbrauch, nenne digitale Alternativen und mögliche Schwierigkeiten bei der Umstellung.",
      "Schreibe eine E-Mail an alle Mitarbeitenden: Stelle ein neues Jobrad- oder Jobticket-Angebot vor, erkläre die Bedingungen und begründe, warum sich die Teilnahme lohnt.",
    ],
  },
  safety: {
    themeId: "safety",
    short: [
      "Schreibe eine kurze Notiz an die Kolleg:innen zu einer neuen Sicherheitsregel im Betrieb.",
      "Schreibe eine kurze Meldung an deinen Vorgesetzten: Du hast einen Beinahe-Unfall im Lager beobachtet. Beschreibe kurz, was passiert ist.",
      "Schreibe eine kurze Erinnerung an dein Team: Am Donnerstag ist die jährliche Sicherheitsunterweisung. Nenne Zeit und Ort und dass die Teilnahme Pflicht ist.",
      "Schreibe eine kurze Nachricht an die Haustechnik: Ein Feuerlöscher im Flur fehlt. Bitte um schnellen Ersatz.",
      "Schreibe eine kurze Notiz an die Kolleg:innen: Ab sofort gilt im Bereich der Maschinen Helmpflicht. Begründe kurz.",
    ],
    long: [
      "Verfasse eine Stellungnahme zu einem Sicherheitsvorfall. Beschreibe, was passiert ist, welche Maßnahmen nötig sind und wie sich ein solcher Vorfall künftig vermeiden lässt.",
      "Verfasse einen Unfallbericht: Beschreibe, wann und wo sich der Unfall ereignet hat, wer beteiligt war, welche Verletzungen oder Schäden entstanden sind und welche ersten Maßnahmen ergriffen wurden.",
      "Schreibe eine E-Mail an die Sicherheitsbeauftragte: Melde einen Mangel an der Schutzausrüstung in deinem Bereich, beschreibe das Risiko und bitte um Abhilfe mit Frist.",
      "Verfasse eine Stellungnahme zu einem geplanten Sicherheitstraining: Begründe, warum das Training nötig ist, welche Themen es abdecken soll und wie oft es stattfinden sollte.",
      "Schreibe eine Mitteilung an alle Mitarbeitenden über einen neuen Fluchtwegeplan: Erkläre, was sich geändert hat, wo die Sammelpunkte sind und was bei einem Alarm zu tun ist.",
    ],
  },
  travel: {
    themeId: "travel",
    short: [
      "Schreibe eine kurze E-Mail, um eine Dienstreise zu organisieren (Termin, Ziel, Zweck).",
      "Schreibe eine kurze E-Mail an ein Hotel: Reserviere ein Einzelzimmer für zwei Nächte und frage nach dem Frühstück.",
      "Schreibe eine kurze Nachricht an deine Chefin: Dein Zug fällt aus, du erreichst den Termin später. Nenne deine neue Ankunftszeit.",
      "Schreibe eine kurze Bitte an das Sekretariat: Buche dir einen Flug für eine Dienstreise. Nenne Ziel, Datum und gewünschte Zeit.",
      "Schreibe eine kurze Abwesenheitsnotiz für deine E-Mails: Nenne den Zeitraum deiner Dienstreise und wer dich vertritt.",
    ],
    long: [
      "Schreibe einen Bericht über eine Dienstreise. Fasse die wichtigsten Ergebnisse zusammen, bewerte den Nutzen der Reise und gib eine Empfehlung für künftige Reisen.",
      "Verfasse eine E-Mail an die Buchhaltung zu deiner Reisekostenabrechnung: Liste die wichtigsten Ausgaben der Reise auf, erkläre eine ungewöhnliche Position und bitte um Erstattung.",
      "Schreibe eine E-Mail an einen Geschäftspartner im Ausland: Kündige deinen Besuch an, schlage ein Programm für die zwei Tage vor und frage nach einem Termin für ein gemeinsames Abendessen.",
      "Verfasse eine Stellungnahme zur Reiserichtlinie deines Unternehmens: Beschreibe, was aus deiner Sicht unpraktisch ist, und schlage konkrete Verbesserungen vor, zum Beispiel bei Buchung oder Abrechnung.",
      "Schreibe eine Beschwerde an eine Fluggesellschaft: Dein Flug hatte große Verspätung und dein Gepäck kam beschädigt an. Beschreibe den Ablauf, nenne die Folgen und fordere eine Entschädigung.",
    ],
  },
  behoerde: {
    themeId: "behoerde",
    short: [
      "Schreibe eine kurze E-Mail an das Bürgeramt: Bitte um einen Termin zur Anmeldung deines neuen Wohnsitzes und nenne deine Verfügbarkeit.",
      "Schreibe eine kurze E-Mail an das Bürgeramt: Frage nach, welche Unterlagen du für einen neuen Personalausweis brauchst.",
      "Schreibe eine kurze Nachricht an die Behörde: Du musst einen Termin absagen. Entschuldige dich und bitte um einen neuen Termin.",
      "Schreibe eine kurze Antwort auf ein Schreiben vom Amt: Bestätige den Erhalt und kündige an, die fehlenden Unterlagen nachzureichen.",
      "Schreibe eine kurze E-Mail an das Standesamt: Frage, wie du eine Geburtsurkunde beantragen kannst und was sie kostet.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an die Ausländerbehörde. Erkläre, dass du deinen Aufenthaltstitel verlängern möchtest, frage nach den nötigen Unterlagen und bitte höflich um einen Termin.",
      "Verfasse einen Widerspruch gegen einen Bescheid: Erkläre höflich, warum du die Entscheidung für falsch hältst, nenne dein Aktenzeichen, lege deine Gründe dar und bitte um eine neue Prüfung.",
      "Schreibe eine E-Mail an das Jobcenter: Erkläre deine aktuelle Situation, frage nach, welche Leistungen dir zustehen, und bitte um einen Beratungstermin.",
      "Verfasse eine formelle E-Mail an die Kfz-Zulassungsstelle: Du möchtest ein Auto anmelden. Frage nach den nötigen Unterlagen, den Kosten und ob du einen Termin brauchst.",
      "Schreibe eine E-Mail an die Elterngeldstelle: Dein Antrag ist seit acht Wochen in Bearbeitung. Frage höflich nach dem Stand, nenne dein Aktenzeichen und erkläre, warum die Antwort dringend ist.",
    ],
  },
  arzt: {
    themeId: "arzt",
    short: [
      "Schreibe eine kurze E-Mail an eine Arztpraxis: Bitte um einen Termin, beschreibe kurz deine Beschwerden und nenne deine Verfügbarkeit.",
      "Schreibe eine kurze Nachricht an die Praxis: Sage deinen Termin am Montag ab und bitte um einen neuen.",
      "Schreibe eine kurze E-Mail an deine Hausärztin: Bitte um ein Wiederholungsrezept für dein Medikament.",
      "Schreibe eine kurze Nachricht an deinen Arbeitgeber: Du bist krank und bleibst heute zu Hause. Die Krankmeldung reichst du nach.",
      "Schreibe eine kurze Frage an die Praxis: Musst du für die Blutabnahme am Freitag nüchtern kommen? Frage auch, ob du früher kommen kannst.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an deine Krankenkasse. Erkläre, dass du eine Rechnung einreichen möchtest, frage nach der Kostenübernahme für eine Behandlung und bitte höflich um eine schriftliche Bestätigung.",
      "Verfasse eine E-Mail an eine Facharztpraxis: Du hast erst in drei Monaten einen Termin bekommen. Erkläre deine Beschwerden und bitte um einen früheren Termin oder einen Platz auf der Warteliste.",
      "Schreibe eine E-Mail an deine Krankenkasse: Frage, ob sie die Kosten für einen Gesundheitskurs übernimmt. Beschreibe den Kurs, begründe, warum er dir hilft, und frage nach dem Verfahren.",
      "Verfasse eine höfliche Beschwerde an eine Klinik: Beschreibe, was bei deinem Aufenthalt nicht gut gelaufen ist, bleibe sachlich und schlage vor, wie es besser gemacht werden könnte.",
      "Schreibe eine E-Mail an die Praxis, weil du eine falsche Rechnung bekommen hast: Erkläre, welche Leistung berechnet wurde, die du nicht erhalten hast, und bitte um eine korrigierte Rechnung.",
    ],
  },
  wohnen: {
    themeId: "wohnen",
    short: [
      "Schreibe eine kurze E-Mail an einen Vermieter: Zeige Interesse an einer Wohnung, bitte um einen Besichtigungstermin und nenne deine Verfügbarkeit.",
      "Schreibe eine kurze Nachricht an deinen Nachbarn: Bei dir kommt morgen ein Handwerker, es kann laut werden. Entschuldige dich im Voraus.",
      "Schreibe eine kurze E-Mail an die Hausverwaltung: Der Aufzug ist seit zwei Tagen kaputt. Bitte um schnelle Reparatur.",
      "Schreibe eine kurze Nachricht an deine Vermieterin: Kündige an, dass du im Sommer für vier Wochen verreist, und nenne eine Kontaktperson.",
      "Schreibe eine kurze Anfrage an einen Umzugsservice: Frage nach einem Angebot für deinen Umzug und nenne Datum und Adressen.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an deine Hausverwaltung. Melde einen Mangel in der Wohnung (zum Beispiel Schimmel oder eine defekte Heizung), bitte um eine Reparatur mit Frist und weise höflich auf deine Rechte als Mieter hin.",
      "Verfasse eine Antwort auf eine Mieterhöhung: Bestätige den Erhalt des Schreibens, stelle sachliche Rückfragen zur Begründung und bitte um ausreichend Zeit zur Prüfung.",
      "Schreibe eine Kündigung für deine Wohnung: Kündige fristgerecht, nenne das Datum des Auszugs, bitte um einen Übergabetermin und um die Rückzahlung der Kaution.",
      "Verfasse eine Beschwerde an die Hausverwaltung über wiederholten Lärm im Haus: Beschreibe die Störungen mit Zeiten, erkläre die Folgen für dich und bitte um ein Gespräch mit den Verursachern.",
      "Schreibe eine Bewerbung um eine Wohnung: Stelle dich und deine Situation kurz vor, erkläre, warum die Wohnung gut passt, und nenne die Unterlagen, die du mitbringen kannst.",
    ],
  },
  bank: {
    themeId: "bank",
    short: [
      "Schreibe eine kurze E-Mail an deine Bank: Bitte um einen Beratungstermin zur Eröffnung eines Girokontos und frage, welche Unterlagen du mitbringen musst.",
      "Schreibe eine kurze Nachricht an deine Bank: Deine Karte ist verloren gegangen. Bitte um eine Sperrung und eine neue Karte.",
      "Schreibe eine kurze E-Mail an die Bank: Frage nach den Gebühren für Überweisungen ins Ausland.",
      "Schreibe eine kurze Mitteilung an deine Bank: Deine Adresse hat sich geändert. Nenne die neue Adresse und bitte um eine Bestätigung.",
      "Schreibe eine kurze Anfrage an die Bank: Du möchtest dein Kreditkartenlimit erhöhen. Nenne den gewünschten Betrag und begründe kurz.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an deine Bank. Beschwere dich höflich über eine falsch gebuchte Lastschrift, bitte um eine Rückbuchung und frage nach, wie du solche Abbuchungen künftig verhindern kannst.",
      "Verfasse eine E-Mail an deine Bank: Beantrage einen kleinen Kredit für ein gebrauchtes Auto. Nenne den Betrag, beschreibe deine Einkommenssituation und frage nach Zinsen und Laufzeit.",
      "Schreibe eine Kündigung für dein altes Konto: Nenne das gewünschte Datum, das neue Konto für das Restguthaben und bitte um eine schriftliche Bestätigung der Auflösung.",
      "Verfasse eine Beschwerde an deine Bank: Trotz Termin hast du in der Filiale lange gewartet und keine klare Auskunft erhalten. Beschreibe den Ablauf und formuliere, was du erwartest.",
      "Schreibe eine E-Mail an die Bank, weil du eine Abbuchung nicht erkennst: Beschreibe die verdächtige Buchung, frage nach dem Empfänger und bitte darum, die Zahlung zu prüfen und gegebenenfalls zurückzuholen.",
    ],
  },
  bildung: {
    themeId: "bildung",
    short: [
      "Schreibe eine kurze E-Mail an eine Sprachschule: Frage nach einem passenden Kurs für dein Niveau, nach den Kosten und nach dem nächsten Kursbeginn.",
      "Schreibe eine kurze E-Mail an deine Kursleiterin: Du kannst am Donnerstag nicht zum Unterricht kommen. Frage nach den Hausaufgaben.",
      "Schreibe eine kurze Anfrage an eine Volkshochschule: Frage, ob im Kurs noch Plätze frei sind und wie du dich anmelden kannst.",
      "Schreibe eine kurze E-Mail an das Prüfungszentrum: Frage nach dem nächsten Termin für die B2-Prüfung und den Kosten.",
      "Schreibe eine kurze Bitte an deinen Arbeitgeber: Frage, ob du für eine Fortbildung am Freitag frei bekommen kannst.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an eine zuständige Stelle. Bitte um die Anerkennung deines ausländischen Abschlusses, erkläre deinen bisherigen Werdegang und frage nach den nötigen Unterlagen und dem Ablauf des Verfahrens.",
      "Verfasse eine E-Mail an eine Bildungseinrichtung: Bitte um ein Zertifikat über deinen abgeschlossenen Kurs, erkläre, wofür du es brauchst, und frage, wie lange die Ausstellung dauert.",
      "Schreibe eine Bewerbung für ein Stipendium oder eine Kursförderung: Stelle dich vor, beschreibe deine Ziele und begründe, warum die Förderung dir helfen würde.",
      "Verfasse eine E-Mail an deinen Arbeitgeber: Schlage eine Weiterbildung vor, die du machen möchtest. Beschreibe Inhalt, Dauer und Kosten und erkläre den Nutzen für deine Arbeit.",
      "Schreibe eine höfliche Beschwerde an eine Sprachschule: Der Kurs ist oft ausgefallen und der Ersatzunterricht fehlt. Beschreibe die Situation und schlage eine Lösung vor, zum Beispiel eine Erstattung.",
    ],
  },
  einkaufen: {
    themeId: "einkaufen",
    short: [
      "Schreibe eine kurze E-Mail an einen Onlineshop: Ein Artikel ist beschädigt angekommen. Beschreibe das Problem und frage nach Umtausch oder Erstattung.",
      "Schreibe eine kurze E-Mail an einen Onlineshop: Frage nach dem Stand deiner Bestellung und nenne die Bestellnummer.",
      "Schreibe eine kurze Nachricht an ein Geschäft: Frage, ob ein bestimmter Artikel vorrätig ist und ob er zurückgelegt werden kann.",
      "Schreibe eine kurze E-Mail an den Kundenservice: Du möchtest eine Bestellung stornieren. Nenne die Bestellnummer und den Grund.",
      "Schreibe eine kurze Anfrage an einen Onlineshop: Ein Gutscheincode funktioniert nicht. Beschreibe das Problem und bitte um Hilfe.",
    ],
    long: [
      "Verfasse eine formelle Reklamations-E-Mail an einen Onlineshop. Erkläre, welchen Artikel du bestellt hast und was mit der Lieferung nicht stimmt, nenne deine Bestellnummer und bitte höflich um eine Erstattung oder einen Ersatz mit einer klaren Frist.",
      "Verfasse eine E-Mail an einen Onlineshop: Du hast einen Artikel zurückgeschickt, aber nach drei Wochen noch keine Erstattung erhalten. Beschreibe den Fall mit Daten, nenne die Sendungsnummer und setze eine Frist.",
      "Schreibe eine Beschwerde an einen Supermarkt: An der Kasse wurde dir ein falscher Preis berechnet, und das Personal war unfreundlich. Beschreibe die Situation und formuliere deine Erwartung.",
      "Verfasse eine Anfrage an ein Möbelhaus: Du interessierst dich für eine Einbauküche. Beschreibe deine Wohnung und deine Wünsche und bitte um einen Beratungstermin mit Kostenvoranschlag.",
      "Schreibe eine E-Mail an einen Händler: Ein gekauftes Gerät ist nach vier Monaten kaputt. Berufe dich auf die Gewährleistung, beschreibe den Defekt und fordere Reparatur oder Ersatz.",
    ],
  },
  essen: {
    themeId: "essen",
    short: [
      "Schreibe eine kurze E-Mail an ein Restaurant: Reserviere einen Tisch für vier Personen, nenne Datum und Uhrzeit und frage nach vegetarischen Gerichten.",
      "Schreibe eine kurze Nachricht an ein Restaurant: Sage deine Reservierung für heute Abend ab und entschuldige dich.",
      "Schreibe eine kurze E-Mail an einen Lieferdienst: Deine Bestellung kam kalt und unvollständig an. Bitte um eine Lösung.",
      "Schreibe eine kurze Frage an ein Restaurant: Gibt es Gerichte ohne Gluten? Du möchtest am Samstag mit vier Personen kommen.",
      "Schreibe eine kurze Dankesnachricht an ein Restaurant nach einer Feier: Lobe Essen und Service und kündige an wiederzukommen.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an ein Restaurant. Reserviere einen Tisch für eine Feier, nenne die Personenzahl und den Anlass, frage nach einem Menü mit vegetarischen und veganen Optionen und bitte um eine Bestätigung der Reservierung.",
      "Verfasse eine E-Mail an einen Caterer: Hole ein Angebot für eine Firmenfeier mit 30 Personen ein. Beschreibe Anlass, Ort und Termin, nenne Wünsche zum Essen und frage nach Preisen pro Person.",
      "Schreibe eine Beschwerde an ein Restaurant: Bei eurem Besuch gestern habt ihr sehr lange gewartet und ein Gericht war nicht in Ordnung. Beschreibe den Abend sachlich und formuliere deine Erwartung.",
      "Verfasse eine Einladung an dein Team zu einem gemeinsamen Essen: Nenne Anlass, Restaurant, Datum und Uhrzeit, erkläre, wer die Kosten übernimmt, und bitte um Rückmeldung mit Essenswünschen.",
      "Schreibe eine E-Mail an einen Lieferdienst: Du wurdest doppelt belastet. Beschreibe die Bestellung, nenne die Zahlungsdaten und bitte um die Rückerstattung des doppelten Betrags.",
    ],
  },
  mobilitaet: {
    themeId: "mobilitaet",
    short: [
      "Schreibe eine kurze E-Mail an den Verkehrsverbund: Du hast wegen einer Verspätung deinen Anschluss verpasst und möchtest die Kosten für ein Ersatzticket zurück.",
      "Schreibe eine kurze E-Mail an den Kundenservice der Bahn: Frage, wie du dein Monatsticket kündigen kannst.",
      "Schreibe eine kurze Nachricht an eine Fahrschule: Frage nach den Preisen für den Führerschein Klasse B und nach freien Terminen.",
      "Schreibe eine kurze E-Mail an eine Autowerkstatt: Bitte um einen Termin für die Inspektion und nenne dein Automodell.",
      "Schreibe eine kurze Meldung an den Verkehrsverbund: Der Fahrkartenautomat am Bahnhof ist defekt. Beschreibe das Problem.",
    ],
    long: [
      "Verfasse eine formelle Beschwerde-E-Mail an ein Verkehrsunternehmen. Beschreibe, welche Verbindung du nutzen wolltest, wie es zur Verspätung kam und welche Folgen das hatte, und bitte höflich um eine Erstattung oder Entschädigung mit einer klaren Frist.",
      "Verfasse einen Antrag auf Erstattung bei der Bahn: Dein Zug fiel aus und du musstest ein Taxi nehmen. Beschreibe die Verbindung, verweise auf deine Belege und begründe deinen Anspruch.",
      "Schreibe eine E-Mail an eine Autowerkstatt: Nach der Reparatur ist das Problem wieder aufgetreten. Beschreibe den Mangel, verweise auf die Rechnung und bitte um eine kostenlose Nachbesserung.",
      "Verfasse eine Anfrage an eine Autovermietung: Du brauchst für einen Umzug einen Transporter. Nenne Datum und Dauer und frage nach Preisen, Versicherung und Kaution.",
      "Schreibe eine Stellungnahme an deine Stadtverwaltung: Die Busverbindung in deinem Viertel ist schlecht. Beschreibe die Probleme, erkläre die Folgen für die Anwohner und schlage Verbesserungen vor.",
    ],
  },
  freizeit: {
    themeId: "freizeit",
    short: [
      "Schreibe eine kurze Nachricht an einen Freund: Lade ihn zu einem gemeinsamen Ausflug am Wochenende ein und schlage Zeit und Treffpunkt vor.",
      "Schreibe eine kurze Absage an eine Freundin: Du kannst am Samstag doch nicht kommen. Entschuldige dich und schlage einen neuen Termin vor.",
      "Schreibe eine kurze Nachricht an einen Sportverein: Frage nach einem Probetraining und den Mitgliedsbeiträgen.",
      "Schreibe eine kurze Antwort auf eine Einladung: Bedanke dich, sage zu und frage, ob du etwas mitbringen sollst.",
      "Schreibe eine kurze Nachricht in eure Nachbarschaftsgruppe: Du organisierst ein Sommerfest im Hof. Nenne das Datum und bitte um Helfer.",
    ],
    long: [
      "Verfasse eine Einladung an mehrere Freunde zu einer kleinen Feier. Nenne den Anlass, Datum und Ort, beschreibe kurz, was geplant ist, und bitte um eine Zu- oder Absage bis zu einem bestimmten Termin.",
      "Verfasse eine E-Mail an ein Fitnessstudio: Kündige deine Mitgliedschaft fristgerecht, nenne den gewünschten Kündigungstermin und bitte um eine schriftliche Bestätigung.",
      "Schreibe eine Nachricht an eine alte Freundin, die weit weg wohnt: Erzähle, was sich bei dir verändert hat, frage nach ihrem Leben und schlage ein Wiedersehen mit konkreten Ideen vor.",
      "Verfasse eine Anfrage an ein Ferienhaus: Du möchtest mit Freunden ein Wochenende buchen. Nenne Zeitraum und Personenzahl und frage nach Preis, Ausstattung und Stornobedingungen.",
      "Schreibe eine E-Mail an die Organisatoren eines Volkslaufs: Melde dich und zwei Freunde an, frage nach dem Ablauf und der Startzeit und ob man die Startnummer vorher abholen muss.",
    ],
  },
  digitales: {
    themeId: "digitales",
    short: [
      "Schreibe eine kurze E-Mail an deinen Internetanbieter: Deine Verbindung fällt ständig aus. Beschreibe das Problem und bitte um eine schnelle Lösung.",
      "Schreibe eine kurze E-Mail an deinen Mobilfunkanbieter: Frage, warum deine Rechnung diesen Monat höher ist.",
      "Schreibe eine kurze Nachricht an den Support eines Onlinedienstes: Du kommst nicht mehr in dein Konto. Bitte um Hilfe beim Zurücksetzen.",
      "Schreibe eine kurze Anfrage an deinen Anbieter: Du ziehst um. Frage, wie du deinen Internetanschluss mitnehmen kannst.",
      "Schreibe eine kurze E-Mail an einen Handyshop: Das neue Handy hängt sich oft auf. Frage, ob du es umtauschen kannst.",
    ],
    long: [
      "Verfasse eine formelle E-Mail an deinen Mobilfunk- oder Internetanbieter. Erkläre, seit wann und wie oft die Störung auftritt, welche Schritte du schon versucht hast, nenne deine Kundennummer und bitte um eine Lösung oder eine Minderung der Gebühr mit einer klaren Frist.",
      "Verfasse eine Kündigung für deinen Handyvertrag: Kündige fristgerecht zum Vertragsende, nenne deine Rufnummer, widersprich einer automatischen Verlängerung und bitte um eine Bestätigung.",
      "Schreibe eine E-Mail an deinen Anbieter: Widersprich einer Rechnung, auf der ein Dienst steht, den du nie bestellt hast. Beschreibe die Position, verlange eine Korrektur und eine Erklärung, wie es dazu kam.",
      "Verfasse eine Anfrage an einen Anbieter: Vergleiche zwei Tarife, die für dich infrage kommen. Beschreibe dein Nutzungsverhalten und bitte um eine Empfehlung mit Preisen und Bedingungen.",
      "Schreibe eine E-Mail an den Datenschutzbeauftragten eines Onlinedienstes: Bitte um Auskunft, welche Daten über dich gespeichert sind, und um die Löschung deines alten Kontos.",
    ],
  },
};
