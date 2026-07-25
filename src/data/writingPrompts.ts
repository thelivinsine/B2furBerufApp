import type {
  ContentCefr,
  ThemeId,
  WorkSector,
  WritingExam,
  WritingFormat,
  WritingRegister,
} from "@/types";

/**
 * Theme-linked writing-task POOLS for the AI writing coach (random-Aufgabe
 * redesign s148; task objects + Unterthema/Branche tags s149). Each theme
 * offers a pool of short (~40-60 words) and long (~120-150 words) tasks
 * framed like B1-B2 writing situations (E-Mail / Nachricht / Stellungnahme /
 * Bericht): picking a theme draws a RANDOM task, the dice on the Aufgabe card
 * re-rolls within the current scope.
 *
 * Tags (both optional): `sub` = a sub-theme slug declared on the theme (the
 * Unterthema dropdown filters to tagged tasks; untagged = theme-generic,
 * shown under "Gesamtes Thema" only). `sectors` = Branche tags with the
 * Bibliothek untagged-=-universal rule: choosing a Branche prefers its tagged
 * tasks and falls back to the universal ones, so no Branche ever empties a
 * pool. Wave 1 covers it/care/construction/transport/hospitality; further
 * Branchen follow in content waves.
 *
 * Provenance: the whole pool rides on the theme's one `wp_<themeId>` register
 * row (the mission pattern). Coverage target per sub-theme: at least 2 short
 * + 2 long tagged tasks. No em dashes in copy.
 */
export interface WritingTask {
  /**
   * The task instruction shown to the learner. Kept as the required field so
   * the bank can be upgraded theme by theme (s167) without a flag day.
   */
  text: string;
  /** Sub-theme slug declared on the theme (e.g. "bank.karte"). */
  sub?: string;
  /** Branche tags; absent = universal (shows under every Branche). */
  sectors?: WorkSector[];

  /* ---- s167 exam-realistic fields. All optional, all untagged = universal,
     so a partially upgraded bank keeps working and no filter ever empties. ---- */

  /**
   * The Inhaltspunkte the learner must cover, 2 to 5 of them. THE most
   * important field: this is what an examiner grades (Goethe "Erfüllung",
   * telc "Berücksichtigung der Leitpunkte") and what lets the AI coach say
   * "Punkt 3 fehlt" instead of only commenting on grammar.
   */
  points?: string[];
  /** Who the learner writes to, e.g. "Stationsleitung Frau Wagner". */
  addressee?: string;
  register?: WritingRegister;
  /** CEFR band this task targets. Absent = shows at every Niveau. */
  level?: ContentCefr;
  format?: WritingFormat;
  /** Which exam task shape this is modelled on (reference, not reproduction). */
  exam?: WritingExam;
  /**
   * Word target for THIS task, taken from the exam shape it follows. Absent
   * falls back to the mode default. Real exams do not share one number:
   * Goethe B1 runs 40 to 80, B2 100 to 150, C1 120 to 200.
   */
  words?: number;
  /** A short text the learner must react to (forum post, incoming mail). */
  source?: string;
}

export interface WritingPrompt {
  themeId: ThemeId;
  /** Kurz tasks (~40-60 words). */
  short: WritingTask[];
  /** Lang tasks (~120-150 words). */
  long: WritingTask[];
}

export const writingPrompts: Record<ThemeId, WritingPrompt> = {
  meetings: {
    themeId: "meetings",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an dein Team: Schlage einen neuen Termin für die wöchentliche Besprechung vor und nenne einen Grund.",
        sub: "meetings.ablauf",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Erinnere an das Meeting morgen und nenne die zwei wichtigsten Punkte der Tagesordnung.",
        sub: "meetings.ablauf",
      },
      {
        text: "Schreibe eine kurze E-Mail an deinen Chef: Bitte darum, einen Punkt auf die Tagesordnung der nächsten Besprechung zu setzen, und begründe kurz, warum er wichtig ist.",
        sub: "meetings.beitrag",
      },
      {
        text: "Schreibe eine kurze Entschuldigung an die Runde: Du kommst 20 Minuten später zur Besprechung. Nenne den Grund und schlage vor, wie ihr trotzdem gut starten könnt.",
      },
      {
        text: "Schreibe eine kurze Notiz für das Protokoll: Fasse die zwei wichtigsten Beschlüsse der heutigen Besprechung zusammen.",
        sub: "meetings.entscheidung",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Moderatorin: Du möchtest in der nächsten Besprechung fünf Minuten für dein Thema bekommen. Begründe kurz.",
        sub: "meetings.beitrag",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Bitte alle, bis Freitag über den Terminvorschlag abzustimmen, und erkläre, wie.",
        sub: "meetings.entscheidung",
      },
      {
        text: "Schreibe eine kurze Übergabenotiz für die Nachtschicht: Nenne die zwei wichtigsten Punkte zu einer Bewohnerin, damit die Kolleg:innen informiert sind.",
        sectors: ["care"],
      },
      {
        text: "Sie können am Dienstag nicht an der Teambesprechung teilnehmen. Schreiben Sie eine kurze E-Mail an Ihre Teamleitung.",
        sub: "meetings.ablauf",
        points: [
          "Sagen Sie höflich ab.",
          "Nennen Sie den Grund.",
          "Fragen Sie nach dem Protokoll.",
        ],
        addressee: "Teamleitung, Herr Brandt",
        register: "sie",
        level: "B1.2",
        format: "email_halbformell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "In Ihrem Team dauern die wöchentlichen Besprechungen regelmäßig eine Stunde länger als geplant. Schreiben Sie eine Nachricht an Ihre Vorgesetzte.",
        sub: "meetings.ablauf",
        points: [
          "Beschreiben Sie das Problem sachlich.",
          "Erklären Sie, welche Folgen die Überziehung für Ihre Arbeit hat.",
          "Schlagen Sie eine feste Zeitbegrenzung vor.",
          "Bitten Sie um eine kurze Rückmeldung.",
        ],
        addressee: "Abteilungsleiterin, Frau Kessler",
        register: "sie",
        level: "B2.1",
        format: "nachricht",
        exam: "goethe_b2",
        words: 100,
      },
      {
        text: "Ihr Vorschlag aus der letzten Sitzung wurde ohne Diskussion abgelehnt. Schreiben Sie eine formelle E-Mail an die Bereichsleitung.",
        sub: "meetings.beitrag",
        points: [
          "Nehmen Sie sachlich auf die Entscheidung Bezug.",
          "Zeigen Sie Verständnis für die Argumente der Gegenseite.",
          "Begründen Sie, warum Sie den Vorschlag weiterhin für sinnvoll halten.",
          "Bitten Sie um eine erneute Prüfung im nächsten Quartal.",
        ],
        addressee: "Bereichsleitung, Frau Dr. Ahrens",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "goethe_c1",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine E-Mail an deine Kolleg:innen. Fasse die wichtigsten Ergebnisse der letzten Besprechung zusammen, benenne die offenen Punkte und schlage konkrete nächste Schritte mit Verantwortlichkeiten vor.",
        sub: "meetings.entscheidung",
      },
      {
        text: "Verfasse ein kurzes Protokoll einer Teambesprechung. Nenne die Teilnehmenden, fasse die besprochenen Themen zusammen und halte die Beschlüsse mit Verantwortlichkeiten und Fristen fest.",
        sub: "meetings.ablauf",
      },
      {
        text: "Schreibe eine E-Mail an eine Kollegin, die bei der Besprechung gefehlt hat. Erkläre, was besprochen wurde, welche Aufgaben sie übernehmen soll und bis wann.",
      },
      {
        text: "Verfasse eine Stellungnahme: Dein Team hat zu viele Meetings. Beschreibe das Problem, erkläre die Folgen für die Arbeit und schlage zwei konkrete Verbesserungen vor.",
        sub: "meetings.ablauf",
      },
      {
        text: "Schreibe eine Einladung zu einem Kick-off-Meeting. Nenne Anlass, Termin und Ort, stelle die Tagesordnung vor und bitte um Rückmeldung bis zu einer Frist.",
        sub: "meetings.ablauf",
      },
      {
        text: "Verfasse eine E-Mail an die Projektleitung: Du möchtest in der nächsten Sitzung einen Verbesserungsvorschlag vorstellen. Beschreibe kurz die Idee, begründe ihren Nutzen und bitte um einen Platz auf der Tagesordnung.",
        sub: "meetings.beitrag",
      },
      {
        text: "Schreibe eine Stellungnahme für die Teamrunde: Nimm zum Vorschlag deiner Kollegin Stellung, nenne zwei Argumente dafür oder dagegen und formuliere ein höfliches Fazit.",
        sub: "meetings.beitrag",
      },
      {
        text: "Verfasse eine E-Mail an dein Team nach einer strittigen Abstimmung: Fasse das Ergebnis zusammen, erkläre, wie es zustande kam, und beschreibe, was jetzt umgesetzt wird.",
        sub: "meetings.entscheidung",
      },
      {
        text: "Schreibe eine E-Mail an die Entwicklerrunde: Schlage ein neues Vorgehen für Code-Reviews vor, begründe es mit zwei aktuellen Beispielen und bitte um Feedback bis zum nächsten Sprint.",
        sectors: ["it"],
      },
      {
        text: "Schreibe eine Mitteilung an das Küchen- und Serviceteam: Die Karte wechselt zur neuen Saison. Nenne die wichtigsten neuen Gerichte, die Allergene und was das Team den Gästen erzählen soll.",
        sectors: ["hospitality"],
      },
      {
        text: "Schreibe eine E-Mail an den Auftraggeber nach einem Projekttreffen: Fasse die technischen Entscheidungen zusammen und liste die offenen Prüfpunkte mit Terminen auf.",
        sectors: ["engineering"],
      },
      {
        text: "Eine Kollegin hat die Besprechung verpasst. Schreiben Sie ihr eine E-Mail und berichten Sie, was besprochen wurde.",
        sub: "meetings.entscheidung",
        points: [
          "Erzählen Sie, welche Themen besprochen wurden.",
          "Erklären Sie, welche Aufgabe sie übernehmen soll.",
          "Nennen Sie die Frist.",
          "Bieten Sie Ihre Hilfe an.",
        ],
        addressee: "Kollegin Sofia",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum für Berufstätige wird diskutiert, ob feste wöchentliche Meetings noch zeitgemäß sind. Schreiben Sie einen Beitrag.",
        points: [
          "Äußern Sie Ihre Meinung zu festen wöchentlichen Meetings.",
          "Nennen Sie zwei Vorteile regelmäßiger Besprechungen.",
          "Beschreiben Sie einen Nachteil aus Ihrer eigenen Erfahrung.",
          "Schlagen Sie eine Alternative vor. Denken Sie an Einleitung und Schluss.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "In vielen Betrieben ersetzen kurze schriftliche Updates die klassische Teambesprechung. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie die Entwicklung kurz.",
          "Vergleichen Sie schriftliche Updates mit persönlichen Besprechungen.",
          "Nennen Sie Argumente für beide Seiten.",
          "Räumen Sie einen Einwand gegen Ihre Position ein.",
          "Formulieren Sie ein begründetes Fazit.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  scheduling: {
    themeId: "scheduling",
    short: [
      {
        text: "Schreibe eine kurze Nachricht: Bitte eine Kollegin, einen Termin zu verschieben, und biete zwei Alternativen an.",
      },
      {
        text: "Schreibe eine kurze Bestätigung an einen Geschäftspartner: Bestätige den vereinbarten Termin und nenne Ort und Uhrzeit.",
      },
      {
        text: "Schreibe eine kurze Absage: Du musst einen Termin am Freitag absagen. Entschuldige dich und schlage einen neuen Termin vor.",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Der Zeitplan für diese Woche ändert sich. Nenne die wichtigste Änderung und was zu tun ist.",
      },
      {
        text: "Schreibe eine kurze Erinnerung an einen Kollegen: Eine Frist läuft übermorgen ab. Bitte um einen kurzen Status.",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Stationsleitung: Bitte um einen Diensttausch am Samstag und nenne, wer für dich einspringen würde.",
        sectors: ["care"],
      },
      {
        text: "Schreibe eine kurze Meldung an den Polier: Wegen Regen konnte heute nicht betoniert werden. Nenne den neuen Plan für morgen.",
        sectors: ["construction"],
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Schichtteam: Für Samstagabend fehlt eine Servicekraft. Frage, wer die Schicht übernehmen kann.",
        sectors: ["hospitality"],
      },
      {
        text: "Schreibe eine kurze Nachricht an einen Kunden: Du schaffst den Termin heute nicht mehr. Entschuldige dich und schlage morgen früh vor.",
        sectors: ["trades"],
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Wegen Inventur öffnet der Laden am Freitag später. Nenne die neue Öffnungszeit.",
        sectors: ["retail"],
      },
      {
        text: "Schreibe eine kurze Nachricht an die Frühschicht: Die Wartung der Anlage verschiebt sich auf Mittwoch. Nenne, was das für den Plan bedeutet.",
        sectors: ["production"],
      },
      {
        text: "Schreibe eine kurze Nachricht an deine Kolleginnen: Der Samstag ist voll ausgebucht. Frage, wer eine Stunde länger bleiben kann.",
        sectors: ["beauty"],
      },
      {
        text: "Schreibe eine kurze Nachricht an die Einsatzleitung: Du bist krank und kannst die Frühschicht nicht übernehmen. Bitte um Vertretung.",
        sectors: ["cleaning"],
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Objektleiter: Tausche deine Nachtschicht am Samstag mit einem Kollegen und bitte um Freigabe.",
        sectors: ["security"],
      },
      {
        text: "Schreibe eine kurze Nachricht an die Trainer: Der Kursplan für August ändert sich. Nenne die wichtigste Änderung und bis wann Rückmeldungen möglich sind.",
        sectors: ["sports"],
      },
      {
        text: "Sie haben einen Termin beim Kunden und schaffen es nicht pünktlich. Schreiben Sie eine kurze Nachricht.",
        points: [
          "Entschuldigen Sie sich.",
          "Nennen Sie die neue Uhrzeit.",
          "Fragen Sie, ob das passt.",
        ],
        addressee: "Kundin, Frau Öztürk",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Ihr Projektplan lässt sich wegen einer verspäteten Lieferung nicht halten. Schreiben Sie an die Projektleitung.",
        points: [
          "Melden Sie die Verzögerung.",
          "Erklären Sie kurz die Ursache.",
          "Nennen Sie den neuen realistischen Termin.",
          "Schlagen Sie vor, welche Aufgaben vorgezogen werden können.",
        ],
        addressee: "Projektleitung, Herr Yilmaz",
        register: "sie",
        level: "B2.1",
        format: "email_halbformell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Sie sollen zusätzlich zu Ihrem Projekt eine weitere Aufgabe übernehmen, obwohl Ihr Zeitplan bereits voll ist. Schreiben Sie an Ihre Vorgesetzte.",
        points: [
          "Zeigen Sie Verständnis für die Dringlichkeit.",
          "Legen Sie Ihre aktuelle Auslastung nachvollziehbar dar.",
          "Schlagen Sie eine Priorisierung vor.",
          "Bitten Sie um eine Entscheidung, welche Aufgabe zurückstehen soll.",
        ],
        addressee: "Vorgesetzte, Frau Radtke",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "goethe_c1",
        words: 120,
      },
    ],
    long: [
      {
        text: "Schreibe eine E-Mail, in der du einen Projektzeitplan erläuterst. Begründe, warum sich eine Frist verschiebt, beschreibe die Auswirkungen und schlage einen angepassten Plan vor.",
      },
      {
        text: "Schreibe eine E-Mail an eine Kundin: Ein vereinbarter Liefertermin ist nicht zu halten. Entschuldige dich, erkläre die Gründe und biete einen neuen, realistischen Termin mit einem Ausgleich an.",
      },
      {
        text: "Verfasse eine E-Mail an dein Team zu deinem Urlaub: Erkläre, wie die Vertretung geregelt ist, wer welche Aufgaben übernimmt und was vor deinem Urlaub noch erledigt werden muss.",
      },
      {
        text: "Schreibe eine Stellungnahme zur Terminplanung in deinem Team. Beschreibe, warum es oft zu Überschneidungen kommt, und schlage feste Regeln für Besprechungszeiten vor.",
      },
      {
        text: "Verfasse eine E-Mail an mehrere Beteiligte, um einen gemeinsamen Workshop-Termin zu finden. Schlage drei Optionen vor, erkläre den Zweck des Workshops und bitte um Antwort bis zu einer Frist.",
      },
      {
        text: "Schreibe eine E-Mail an die Pflegedienstleitung: Der Dienstplan für die Feiertage ist zu knapp besetzt. Beschreibe die Engpässe und schlage eine fairere Verteilung vor.",
        sectors: ["care"],
      },
      {
        text: "Verfasse eine E-Mail an dein Team zur Urlaubsplanung im Sommer: Erkläre, wie viele pro Woche fehlen dürfen, bis wann Wünsche abgegeben werden und wie ihr Konflikte löst.",
        sectors: ["hospitality"],
      },
      {
        text: "Verfasse eine E-Mail an einen externen Dienstleister: Vereinbare einen festen monatlichen Wartungstermin. Schlage einen Rhythmus vor, kläre Ausweichregeln für Feiertage und bitte um Bestätigung.",
      },
      {
        text: "Sie möchten Ihren Urlaub im August nehmen. Schreiben Sie eine E-Mail an Ihre Vorgesetzte.",
        points: [
          "Nennen Sie den gewünschten Zeitraum.",
          "Begründen Sie Ihren Wunsch.",
          "Erklären Sie, wer Sie vertritt.",
          "Bitten Sie um eine Bestätigung.",
        ],
        addressee: "Vorgesetzte, Frau Neumann",
        register: "sie",
        level: "B1.2",
        format: "antrag",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird über die Vier-Tage-Woche diskutiert. Schreiben Sie einen Beitrag.",
        points: [
          "Äußern Sie Ihre Meinung zur Vier-Tage-Woche.",
          "Begründen Sie Ihre Position mit einem Beispiel aus Ihrem Arbeitsalltag.",
          "Nennen Sie einen möglichen Nachteil für Betriebe.",
          "Schlagen Sie vor, für welche Branchen das Modell geeignet wäre.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Flexible Arbeitszeiten gelten als Vorteil, führen aber oft zu ständiger Erreichbarkeit. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie den Zusammenhang zwischen Flexibilität und Erreichbarkeit.",
          "Analysieren Sie, wem die Flexibilität tatsächlich nützt.",
          "Nennen Sie Gegenargumente zu Ihrer eigenen Position.",
          "Schlagen Sie eine betriebliche Regelung vor.",
          "Ziehen Sie ein abwägendes Fazit.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  logistics: {
    themeId: "logistics",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an einen Lieferanten: Frage nach dem Status einer verspäteten Lieferung.",
      },
      {
        text: "Schreibe eine kurze Nachricht ans Lager: Eine Palette ist beschädigt angekommen. Beschreibe den Schaden und frage nach dem weiteren Vorgehen.",
      },
      {
        text: "Schreibe eine kurze E-Mail an einen Kunden: Seine Bestellung verzögert sich um drei Tage. Entschuldige dich und nenne den neuen Liefertermin.",
      },
      {
        text: "Schreibe eine kurze Bestellung an einen Lieferanten: Bestelle Büromaterial nach und bitte um eine Auftragsbestätigung.",
      },
      {
        text: "Schreibe eine kurze Notiz an die Spedition: Die Lieferadresse für eine Sendung hat sich geändert. Nenne die neue Adresse und die Auftragsnummer.",
      },
      {
        text: "Schreibe eine kurze Nachricht an den Baustoffhändler: Der Kies wurde nicht geliefert. Frage nach dem neuen Liefertermin.",
        sectors: ["construction"],
      },
      {
        text: "Schreibe eine kurze Meldung an die Disposition: Du stehst im Stau auf der A3. Nenne deine voraussichtliche Ankunft beim Kunden.",
        sectors: ["transport"],
      },
      {
        text: "Schreibe eine kurze Bestellung an den Getränkehändler: Bestelle für das Wochenende nach und bitte um Lieferung bis Freitagmittag.",
        sectors: ["hospitality"],
      },
      {
        text: "Schreibe eine kurze Meldung an die Zentrale: Ein Aktionsartikel ist ausverkauft. Frage nach Nachschub und dem Liefertermin.",
        sectors: ["retail"],
      },
      {
        text: "Schreibe eine kurze Nachricht an den Einkauf: Das Lösungsmittel wird knapp. Bitte um eine Eilbestellung.",
        sectors: ["chemicals"],
      },
      {
        text: "Schreibe eine kurze Nachricht an den Versand: Eine Kühlketten-Lieferung muss heute noch raus. Bitte um Priorität.",
        sectors: ["pharma"],
      },
      {
        text: "Schreibe eine kurze Meldung ans Büro: Im Objekt fehlen Reinigungsmittel und Müllbeutel. Bitte um Nachlieferung.",
        sectors: ["cleaning"],
      },
      {
        text: "Eine Lieferung ist nicht vollständig angekommen. Schreiben Sie eine kurze Nachricht an den Lieferanten.",
        points: [
          "Nennen Sie die Lieferung und das Datum.",
          "Beschreiben Sie, was fehlt.",
          "Bitten Sie um eine Nachlieferung.",
        ],
        addressee: "Lieferant, Firma Bergmann",
        register: "sie",
        level: "B1.2",
        format: "reklamation",
        exam: "telc_b2_beruf",
        words: 40,
      },
      {
        text: "Bei einer Sendung wurden beschädigte Paletten angeliefert. Schreiben Sie eine Reklamation.",
        sectors: ["transport"],
        points: [
          "Nennen Sie Lieferschein und Datum.",
          "Beschreiben Sie den Schaden genau.",
          "Erklären Sie, welche Folgen der Schaden für Ihren Betrieb hat.",
          "Fordern Sie Ersatz und nennen Sie eine Frist.",
        ],
        addressee: "Disposition der Spedition Karls",
        register: "sie",
        level: "B2.1",
        format: "reklamation",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Ein Logistikpartner hält seit Monaten die vereinbarten Lieferzeiten nicht ein. Schreiben Sie eine formelle E-Mail.",
        sectors: ["transport"],
        points: [
          "Fassen Sie die Vertragslage sachlich zusammen.",
          "Belegen Sie das Problem mit zwei konkreten Vorfällen.",
          "Erläutern Sie die wirtschaftlichen Folgen.",
          "Fordern Sie eine verbindliche Zusage und kündigen Sie weitere Schritte an.",
        ],
        addressee: "Geschäftsführung des Logistikpartners",
        register: "sie",
        level: "C1",
        format: "beschwerde",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine Stellungnahme zu einem Lieferengpass. Beschreibe das Problem, nenne mögliche Ursachen und schlage Maßnahmen vor, um die Versorgung sicherzustellen.",
      },
      {
        text: "Verfasse eine Reklamation an einen Lieferanten: Die letzte Lieferung war unvollständig und teilweise beschädigt. Beschreibe die Mängel, fordere Ersatz und setze eine Frist.",
      },
      {
        text: "Schreibe einen kurzen Bericht über die Lagerbestände: Beschreibe, welche Artikel knapp werden, erkläre die Ursachen und empfiehl, was nachbestellt werden soll.",
      },
      {
        text: "Schreibe eine E-Mail an eine Spedition: Hole ein Angebot für regelmäßige Transporte ein. Beschreibe Strecke, Häufigkeit und Ware und frage nach Preisen und Konditionen.",
      },
      {
        text: "Verfasse eine Stellungnahme zur Einführung eines neuen Systems für die Lagerverwaltung. Nenne die Probleme mit dem alten Ablauf und begründe, welche Vorteile das neue System bringt.",
      },
      {
        text: "Verfasse einen Bericht über eine Tour: Beschreibe die Route, die Zahl der Stopps, wo es Wartezeiten gab und was die Planung morgen besser machen könnte.",
        sectors: ["transport"],
      },
      {
        text: "Verfasse einen kurzen Schichtbericht: Beschreibe die produzierte Menge, einen Maschinenstillstand mit Ursache und was die nächste Schicht wissen muss.",
        sectors: ["production"],
      },
      {
        text: "Schreibe eine E-Mail an einen Paketdienst: Eine wichtige Sendung an einen Kunden ist seit Tagen unterwegs. Nenne die Sendungsnummer, beschreibe die Dringlichkeit und bitte um Nachforschung.",
      },
      {
        text: "Sie haben eine Tour übernommen und sollen Ihrem Kollegen berichten. Schreiben Sie eine Übergabenotiz.",
        sectors: ["transport"],
        points: [
          "Nennen Sie die gefahrene Strecke.",
          "Beschreiben Sie ein Problem unterwegs.",
          "Erklären Sie, was noch zu erledigen ist.",
          "Nennen Sie den Standort der Papiere.",
        ],
        addressee: "Kollege Marek",
        register: "du",
        level: "B1.2",
        format: "uebergabe",
        exam: "dtb",
        words: 80,
      },
      {
        text: "Ihr Lager wurde umgestellt und die Kommissionierung dauert seitdem länger. Schreiben Sie einen Bericht an die Betriebsleitung.",
        sectors: ["transport", "production"],
        points: [
          "Beschreiben Sie die neue Lagerordnung.",
          "Stellen Sie dar, an welchen Stellen Zeit verloren geht.",
          "Nennen Sie zwei mögliche Ursachen.",
          "Schlagen Sie konkrete Verbesserungen mit Verantwortlichen vor.",
        ],
        addressee: "Betriebsleitung",
        register: "sie",
        level: "B2.1",
        format: "bericht",
        exam: "telc_b2_beruf",
        words: 150,
      },
      {
        text: "Der Onlinehandel führt zu immer kürzeren Lieferversprechen. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie die Entwicklung kurz.",
          "Analysieren Sie die Folgen für Beschäftigte in der Zustellung.",
          "Vergleichen Sie Kundennutzen und Arbeitsbedingungen.",
          "Nennen Sie einen Einwand gegen Ihre Position.",
          "Formulieren Sie ein Fazit mit einem konkreten Vorschlag.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  customer: {
    themeId: "customer",
    short: [
      {
        text: "Schreibe eine kurze Antwort an einen Kunden, der sich über eine fehlerhafte Bestellung beschwert hat.",
        sub: "customer.reklamation",
      },
      {
        text: "Schreibe eine kurze Antwort an eine Kundin: Sie fragt nach dem Stand ihrer Anfrage. Entschuldige die Wartezeit und nenne einen Termin für die Antwort.",
        sub: "customer.beratung",
      },
      {
        text: "Schreibe eine kurze E-Mail an einen Neukunden: Bedanke dich für die erste Bestellung und biete Hilfe bei Fragen an.",
        sub: "customer.service",
      },
      {
        text: "Schreibe eine kurze Absage an einen Kunden: Ein gewünschter Sonderrabatt ist nicht möglich. Begründe höflich und biete eine Alternative an.",
        sub: "customer.beratung",
      },
      {
        text: "Schreibe eine kurze Terminbestätigung für ein Beratungsgespräch mit einer Kundin. Nenne Datum, Uhrzeit und was sie mitbringen soll.",
        sub: "customer.beratung",
      },
      {
        text: "Schreibe eine kurze Antwort an einen Kunden: Seine Reklamation ist angekommen. Bestätige den Eingang und nenne, bis wann er eine Lösung bekommt.",
        sub: "customer.reklamation",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine Kundin: Ihr repariertes Gerät ist abholbereit. Nenne die Öffnungszeiten und was sie mitbringen muss.",
        sub: "customer.service",
      },
      {
        text: "Schreibe eine kurze Antwort an eine Nutzerin: Ihr gemeldeter Fehler ist behoben. Bitte sie, die neue Version zu testen.",
        sectors: ["it"],
      },
      {
        text: "Schreibe eine kurze Nachricht an einen Empfänger: Du erreichst ihn nicht an der Lieferadresse. Frage, wo du das Paket abstellen darfst.",
        sectors: ["transport"],
      },
      {
        text: "Schreibe eine kurze Antwort an einen Gast: Bedanke dich für die Reservierungsanfrage und bestätige den Tisch für acht Personen auf der Terrasse.",
        sectors: ["hospitality"],
      },
      {
        text: "Schreibe eine kurze Erinnerung an eine Kundin: Ihr Termin ist morgen um 14 Uhr. Bitte um eine kurze Bestätigung.",
        sectors: ["beauty"],
      },
      {
        text: "Schreibe eine kurze Antwort an ein Mitglied: Der Kurs am Montag fällt aus. Nenne den Grund und eine Alternative.",
        sectors: ["sports"],
      },
      {
        text: "Eine Kundin hat nach dem Preis für eine Reparatur gefragt. Schreiben Sie eine kurze Antwort.",
        sub: "customer.beratung",
        points: [
          "Danken Sie für die Anfrage.",
          "Nennen Sie den ungefähren Preis.",
          "Schlagen Sie einen Termin vor.",
        ],
        addressee: "Kundin, Frau Lorenz",
        register: "sie",
        level: "B1.2",
        format: "email_halbformell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Ein Kunde beschwert sich, dass eine zugesagte Leistung nicht erbracht wurde. Antworten Sie auf die Beschwerde.",
        sub: "customer.reklamation",
        points: [
          "Entschuldigen Sie sich für den Fehler.",
          "Erklären Sie sachlich, wie es dazu kam.",
          "Bieten Sie eine konkrete Lösung an.",
          "Nennen Sie, bis wann die Sache erledigt ist.",
        ],
        addressee: "Kunde, Herr Wagner",
        register: "sie",
        level: "B2.1",
        format: "email_formell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Ein langjähriger Kunde fordert eine Erstattung, auf die er vertraglich keinen Anspruch hat. Antworten Sie.",
        sub: "customer.reklamation",
        points: [
          "Zeigen Sie Verständnis für seinen Ärger.",
          "Legen Sie die vertragliche Lage höflich dar.",
          "Begründen Sie, warum eine volle Erstattung nicht möglich ist.",
          "Bieten Sie eine Kulanzlösung an und werben Sie um Verständnis.",
        ],
        addressee: "Kunde, Herr Petrov",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Schreibe eine E-Mail an einen unzufriedenen Kunden. Entschuldige dich angemessen, erkläre, wie es zum Problem kam, und biete eine konkrete Lösung sowie eine Wiedergutmachung an.",
        sub: "customer.reklamation",
      },
      {
        text: "Verfasse eine E-Mail an eine langjährige Kundin: Kündige eine Preiserhöhung an. Begründe sie nachvollziehbar, betone den Wert eurer Zusammenarbeit und biete ein Gespräch an.",
      },
      {
        text: "Schreibe eine Antwort auf eine öffentliche negative Bewertung eures Unternehmens. Bleibe sachlich und freundlich, gehe auf die Kritikpunkte ein und biete eine Klärung im direkten Kontakt an.",
        sub: "customer.reklamation",
      },
      {
        text: "Verfasse ein Angebot für einen Interessenten: Beschreibe die angefragte Leistung, nenne Preis und Lieferzeit und erkläre, warum euer Unternehmen die richtige Wahl ist.",
        sub: "customer.beratung",
      },
      {
        text: "Schreibe eine E-Mail an einen Kunden, dessen Vertrag bald ausläuft. Erinnere an das Vertragsende, stelle die Verlängerungsoptionen vor und empfiehl die passende Option mit Begründung.",
        sub: "customer.beratung",
      },
      {
        text: "Verfasse eine E-Mail an einen Kunden nach einer gelösten Reklamation: Fasse zusammen, was gemacht wurde, bedanke dich für die Geduld und biete für die Zukunft einen direkten Ansprechpartner an.",
        sub: "customer.service",
      },
      {
        text: "Schreibe eine E-Mail an eine Kundin, die häufig bei euch bestellt: Stelle den neuen Abhol- und Lieferservice vor, erkläre, wie er funktioniert, und lade sie ein, ihn beim nächsten Auftrag zu testen.",
        sub: "customer.service",
      },
      {
        text: "Verfasse eine E-Mail an einen Kunden: Erkläre in einfacher Sprache, warum die gewünschte Funktion erst im nächsten Release kommt, und biete eine Zwischenlösung an.",
        sectors: ["it"],
      },
      {
        text: "Verfasse eine E-Mail an die Tochter eines Bewohners: Beschreibe einfühlsam, wie es ihrem Vater diese Woche geht, was gut läuft und wobei ihr euch mehr Unterstützung wünscht, und schlage ein Gespräch vor.",
        sectors: ["care"],
      },
      {
        text: "Verfasse eine E-Mail an die Bauherrin: Erkläre, warum sich der Innenausbau um zwei Wochen verzögert, welche Gewerke betroffen sind und wie ihr die Zeit teilweise aufholen wollt.",
        sectors: ["construction"],
      },
      {
        text: "Verfasse eine E-Mail an einen Stammkunden: Wegen einer Baustelle ändert sich euer Lieferfenster für vier Wochen. Erkläre die Änderung und biete zwei Alternativen an.",
        sectors: ["transport"],
      },
      {
        text: "Verfasse eine Antwort auf die Beschwerde eines Gastes über einen verpatzten Abend: Entschuldige dich konkret, erkläre, was schiefging, und lade ihn mit einem Gutschein zu einem zweiten Besuch ein.",
        sectors: ["hospitality"],
      },
      {
        text: "Verfasse ein kurzes Angebot für eine Badsanierung: Beschreibe die Arbeiten, nenne Preis und Dauer und erkläre, warum sich die Qualität lohnt.",
        sectors: ["trades"],
      },
      {
        text: "Verfasse eine Antwort an eine Kundin, die sich über eine lange Wartezeit an der Kasse beschwert hat: Entschuldige dich, erkläre die Ursache und beschreibe, was ihr ändert.",
        sectors: ["retail"],
      },
      {
        text: "Verfasse eine E-Mail an eine Stammkundin: Stelle die neue Behandlung vor, erkläre, für wen sie geeignet ist, und biete ihr einen Kennenlernpreis an.",
        sectors: ["beauty"],
      },
      {
        text: "Verfasse eine E-Mail an ein Mitglied, das kündigen möchte: Zeige Verständnis, frage nach den Gründen und mache ein passendes Angebot, zum Beispiel eine Pause der Mitgliedschaft.",
        sectors: ["sports"],
      },
      {
        text: "Verfasse eine Antwort an einen Kunden, der die Reinigung reklamiert hat: Entschuldige dich, erkläre, was passiert ist, und beschreibe, wie ihr die Qualität ab sofort sichert.",
        sectors: ["cleaning"],
      },
      {
        text: "Schreibe eine E-Mail an eine Klinik: Erkläre die verspätete Lieferung eines Medizinprodukts, nenne den neuen Termin und beschreibe, wie ihr Engpässe künftig vermeidet.",
        sectors: ["pharma"],
      },
      {
        text: "Schreibe eine E-Mail an einen Auftraggeber: Empfiehl nach mehreren Vorfällen eine zusätzliche Kontrollrunde am Wochenende. Begründe mit Beispielen und nenne die Kosten.",
        sectors: ["security"],
      },
      {
        text: "Ein Kunde möchte wissen, welches Angebot für ihn passt. Schreiben Sie eine beratende E-Mail.",
        sub: "customer.beratung",
        points: [
          "Danken Sie für das Interesse.",
          "Stellen Sie zwei Angebote kurz vor.",
          "Empfehlen Sie eines und begründen Sie warum.",
          "Bitten Sie um Rückmeldung.",
        ],
        addressee: "Kunde, Herr Sahin",
        register: "sie",
        level: "B1.2",
        format: "email_halbformell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Ihr Betrieb hat viele Beschwerden über lange Wartezeiten am Telefon erhalten. Schreiben Sie einen Bericht.",
        sub: "customer.service",
        points: [
          "Fassen Sie die Rückmeldungen der Kundschaft zusammen.",
          "Beschreiben Sie, wann die Wartezeiten am längsten sind.",
          "Nennen Sie zwei Ursachen.",
          "Schlagen Sie Maßnahmen vor und benennen Sie Verantwortliche.",
        ],
        addressee: "Geschäftsleitung",
        register: "sie",
        level: "B2.1",
        format: "bericht",
        exam: "telc_b2_beruf",
        words: 150,
      },
      {
        text: "Immer mehr Betriebe lassen den Erstkontakt mit Kundschaft von Chatbots übernehmen. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "customer.service",
        points: [
          "Beschreiben Sie die Entwicklung.",
          "Analysieren Sie Vorteile für Betriebe und Nachteile für Kundschaft.",
          "Beziehen Sie sich auf eine eigene Erfahrung.",
          "Entkräften Sie ein Gegenargument.",
          "Ziehen Sie ein abwägendes Fazit.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  conflict: {
    themeId: "conflict",
    short: [
      {
        text: "Schreibe eine kurze, diplomatische Nachricht an einen Kollegen, mit dem es eine Meinungsverschiedenheit gab.",
      },
      {
        text: "Schreibe eine kurze Entschuldigung an eine Kollegin: Du warst im Gespräch gestern zu direkt. Erkläre kurz, wie du es gemeint hast.",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Chef: Bitte um ein Gespräch über ein Problem im Team, ohne Namen zu nennen.",
      },
      {
        text: "Schreibe eine kurze, sachliche Antwort auf eine verärgerte E-Mail eines Kollegen. Zeige Verständnis und schlage ein kurzes Gespräch vor.",
      },
      {
        text: "Schreibe eine kurze Nachricht an zwei Kollegen, die sich gestritten haben: Lade beide zu einem klärenden Gespräch ein und bleibe neutral.",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine Kollegin: Ihr habt euch bei der Aufgabenverteilung missverstanden. Kläre kurz, wer was übernimmt.",
      },
      {
        text: "Schreibe eine kurze, ruhige Antwort an einen Kunden, der am Telefon laut geworden ist: Fasse sein Anliegen zusammen und nenne den nächsten Schritt.",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Teamleiter: Du fühlst dich bei einer Entscheidung übergangen. Bitte sachlich um ein kurzes Gespräch.",
      },
      {
        text: "Sie haben sich mit einem Kollegen über die Pausenzeiten gestritten. Schreiben Sie ihm eine kurze Nachricht.",
        points: [
          "Entschuldigen Sie sich für Ihren Ton.",
          "Erklären Sie kurz Ihre Sicht.",
          "Schlagen Sie ein Gespräch vor.",
        ],
        addressee: "Kollege Daniel",
        register: "du",
        level: "B1.2",
        format: "nachricht",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Eine Kollegin übergeht Sie regelmäßig bei Absprachen, die Ihre Arbeit betreffen. Schreiben Sie an Ihre Teamleitung.",
        points: [
          "Schildern Sie die Situation sachlich.",
          "Nennen Sie ein konkretes Beispiel.",
          "Erklären Sie, welche Folgen das für Ihre Arbeit hat.",
          "Bitten Sie um ein moderiertes Gespräch.",
        ],
        addressee: "Teamleitung, Frau Bauer",
        register: "sie",
        level: "B2.1",
        format: "email_halbformell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Zwischen zwei Abteilungen gibt es seit Monaten Spannungen, die Ihre Arbeit blockieren. Schreiben Sie an die Bereichsleitung.",
        points: [
          "Stellen Sie den Konflikt neutral dar, ohne Schuldzuweisung.",
          "Beschreiben Sie die konkreten Auswirkungen auf die Abläufe.",
          "Räumen Sie den Anteil Ihrer eigenen Abteilung ein.",
          "Schlagen Sie ein Vorgehen zur Klärung vor.",
        ],
        addressee: "Bereichsleitung, Herr Dr. Falk",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "goethe_c1",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine Stellungnahme zu einem Konflikt im Team. Schildere die Situation sachlich, zeige Verständnis für beide Seiten und schlage einen Kompromiss vor.",
      },
      {
        text: "Schreibe eine E-Mail an deine Vorgesetzte: Die Aufgabenverteilung im Team empfindest du als ungerecht. Beschreibe die Situation sachlich mit Beispielen und schlage eine fairere Lösung vor.",
      },
      {
        text: "Verfasse eine vermittelnde E-Mail an zwei Abteilungen, die sich gegenseitig die Schuld für einen Fehler geben. Fasse die Sicht beider Seiten zusammen und schlage ein gemeinsames Vorgehen vor.",
      },
      {
        text: "Schreibe eine Antwort auf eine unberechtigte Kritik an deiner Arbeit. Weise die Vorwürfe höflich, aber bestimmt zurück, belege deine Sicht mit Fakten und schlage vor, wie ihr künftig Missverständnisse vermeidet.",
      },
      {
        text: "Verfasse eine Stellungnahme zu einem Streit über die Urlaubsplanung im Team. Beschreibe das Problem, zeige Verständnis für beide Seiten und schlage eine klare Regel für die Zukunft vor.",
      },
      {
        text: "Schreibe eine sachliche E-Mail an die Disposition: Deine Touren sind regelmäßig zu eng getaktet. Beschreibe zwei konkrete Tage, erkläre die Folgen und schlage realistische Zeitfenster vor.",
        sectors: ["transport"],
      },
      {
        text: "Verfasse eine E-Mail an eine Kollegin nach einem Streit in der Besprechung: Entschuldige dich für den Ton, erkläre deine Sicht in der Sache und schlage vor, wie ihr das Thema gemeinsam löst.",
      },
      {
        text: "Schreibe eine Stellungnahme an die Teamleitung zu wiederholten Konflikten über Zuständigkeiten: Beschreibe zwei konkrete Situationen, benenne die Ursache und schlage klare Regeln vor.",
      },
      {
        text: "Im Team gibt es Streit darüber, wer die Küche aufräumt. Schreiben Sie eine E-Mail an alle Kolleginnen und Kollegen.",
        points: [
          "Beschreiben Sie das Problem freundlich.",
          "Machen Sie einen Vorschlag für einen Plan.",
          "Bitten Sie um Rückmeldung.",
          "Danken Sie für die Mitarbeit.",
        ],
        addressee: "das Team",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird gefragt, wie man Konflikte am Arbeitsplatz ansprechen sollte. Schreiben Sie einen Beitrag.",
        points: [
          "Äußern Sie Ihre Meinung dazu, ob man Konflikte direkt ansprechen sollte.",
          "Begründen Sie Ihre Position.",
          "Beschreiben Sie eine Situation aus Ihrem Berufsalltag.",
          "Nennen Sie Vorteile einer frühen Klärung.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Viele Betriebe setzen bei Konflikten auf externe Mediation statt auf Führungskräfte. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie beide Vorgehensweisen.",
          "Analysieren Sie, welche Konflikte sich wofür eignen.",
          "Wägen Sie Kosten und Wirkung gegeneinander ab.",
          "Nennen Sie einen Einwand gegen Ihre Position.",
          "Ziehen Sie ein Fazit mit einer Empfehlung.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  project: {
    themeId: "project",
    short: [
      {
        text: "Schreibe eine kurze Statusmeldung zu deinem aktuellen Projekt für die Projektleitung.",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Projektteam: Ein Meilenstein ist geschafft. Bedanke dich und nenne den nächsten Schritt.",
      },
      {
        text: "Schreibe eine kurze Warnung an die Projektleitung: Eine Aufgabe verzögert sich. Nenne den Grund und die Auswirkung auf den Zeitplan.",
      },
      {
        text: "Schreibe eine kurze Bitte an eine Kollegin aus einer anderen Abteilung: Du brauchst ihre Zuarbeit für dein Projekt bis Ende der Woche.",
      },
      {
        text: "Schreibe eine kurze Zusammenfassung für das Projektboard: Was wurde diese Woche erledigt, was steht als Nächstes an?",
      },
      {
        text: "Schreibe eine kurze Nachricht an den Product Owner: Ein Ticket dauert länger als geschätzt. Nenne den Grund und die neue Schätzung.",
        sectors: ["it"],
      },
      {
        text: "Schreibe eine kurze Meldung an deinen Meister: Beim Kunden fehlt Material. Nenne, was du brauchst, um weiterzuarbeiten.",
        sectors: ["trades"],
      },
      {
        text: "Schreibe eine kurze Statusmeldung an die Projektleitung: Die Berechnung ist fertig, die Prüfung läuft. Nenne den nächsten Meilenstein.",
        sectors: ["engineering"],
      },
      {
        text: "Sie sollen einen kurzen Zwischenstand zu Ihrer Aufgabe geben. Schreiben Sie eine kurze Nachricht.",
        points: [
          "Sagen Sie, was fertig ist.",
          "Nennen Sie, was noch fehlt.",
          "Nennen Sie den geplanten Abschluss.",
        ],
        addressee: "Projektleitung, Frau Hofer",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "In Ihrem Projekt fehlt seit zwei Wochen eine Zuarbeit aus einer anderen Abteilung. Schreiben Sie eine E-Mail.",
        points: [
          "Erinnern Sie freundlich an die Zusage.",
          "Beschreiben Sie, was dadurch blockiert ist.",
          "Nennen Sie eine neue Frist.",
          "Bieten Sie Unterstützung an.",
        ],
        addressee: "Abteilungsleitung Einkauf, Herr Klein",
        register: "sie",
        level: "B2.1",
        format: "email_halbformell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Ein Projekt soll trotz erkennbarer Risiken vorzeitig gestartet werden. Schreiben Sie an die Projektleitung.",
        points: [
          "Anerkennen Sie den Zeitdruck.",
          "Benennen Sie die zwei größten Risiken präzise.",
          "Schlagen Sie eine abgesicherte Alternative vor.",
          "Bitten Sie um eine dokumentierte Entscheidung.",
        ],
        addressee: "Projektleitung, Frau Dr. Simon",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Schreibe einen Projektbericht. Beschreibe den aktuellen Stand, nenne Risiken und Verzögerungen und empfiehl, wie das Projekt wieder in den Zeitplan kommt.",
      },
      {
        text: "Verfasse einen Abschlussbericht zu einem kleinen Projekt. Fasse Ziel und Ergebnis zusammen, bewerte, was gut und was schlecht lief, und ziehe Lehren für das nächste Projekt.",
      },
      {
        text: "Schreibe eine E-Mail an einen Auftraggeber: Das Projekt braucht mehr Budget. Erkläre die Gründe, beziffere den Mehrbedarf und beschreibe, was ohne die Erhöhung passiert.",
      },
      {
        text: "Verfasse einen Projektvorschlag für deine Führungskraft: Beschreibe die Idee, den Nutzen für das Unternehmen, den groben Zeitplan und welche Unterstützung du brauchst.",
      },
      {
        text: "Schreibe eine E-Mail an dein Projektteam zum Projektstart: Stelle das Ziel vor, erkläre die Rollen und Verantwortlichkeiten und nenne die ersten Aufgaben mit Fristen.",
      },
      {
        text: "Verfasse einen kurzen Bautagebuch-Eintrag: Beschreibe die heutigen Arbeiten, das Wetter, die Zahl der Arbeiter und besondere Vorkommnisse auf der Baustelle.",
        sectors: ["construction"],
      },
      {
        text: "Schreibe einen kurzen Vorschlag an die Filialleitung: Die Umkleiden sollen umgebaut werden. Beschreibe das Problem, die Idee und den Nutzen für den Verkauf.",
        sectors: ["retail"],
      },
      {
        text: "Verfasse einen kurzen Bericht für die Qualitätssicherung: Beschreibe eine Abweichung im Prozess, die Sofortmaßnahme und deinen Vorschlag zur dauerhaften Korrektur.",
        sectors: ["pharma"],
      },
      {
        text: "Ihr Projekt ist abgeschlossen. Schreiben Sie eine E-Mail an das Team.",
        points: [
          "Bedanken Sie sich für die Zusammenarbeit.",
          "Nennen Sie das wichtigste Ergebnis.",
          "Beschreiben Sie, was gut lief.",
          "Laden Sie zu einem Abschlusstreffen ein.",
        ],
        addressee: "das Projektteam",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Verfassen Sie einen Projektbericht für die Geschäftsleitung.",
        points: [
          "Fassen Sie Ziel und Ergebnis des Projekts zusammen.",
          "Beschreiben Sie die größte Schwierigkeit und wie Sie sie gelöst haben.",
          "Nennen Sie die offenen Punkte mit Fristen.",
          "Geben Sie eine Empfehlung für Folgeprojekte.",
        ],
        addressee: "Geschäftsleitung",
        register: "sie",
        level: "B2.1",
        format: "bericht",
        exam: "telc_b2_beruf",
        words: 150,
      },
      {
        text: "Viele Projekte scheitern nicht an der Technik, sondern an der Kommunikation. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie die These kurz.",
          "Analysieren Sie zwei typische Kommunikationsfehler.",
          "Belegen Sie Ihre Analyse mit einem Beispiel.",
          "Räumen Sie ein, wo die These zu kurz greift.",
          "Formulieren Sie ein begründetes Fazit.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  technology: {
    themeId: "technology",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an den IT-Support: Beschreibe ein technisches Problem an deinem Arbeitsplatz.",
      },
      {
        text: "Schreibe eine kurze Antwort an den IT-Support: Das Problem besteht weiter. Beschreibe, was du schon versucht hast.",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Morgen wird eine neue Software installiert. Erkläre, was das für die Arbeit bedeutet.",
      },
      {
        text: "Schreibe eine kurze Bitte an die IT: Du brauchst Zugriff auf einen gemeinsamen Ordner. Begründe kurz, wofür.",
      },
      {
        text: "Schreibe eine kurze Störungsmeldung: Der Drucker im zweiten Stock funktioniert nicht. Beschreibe das Problem und seit wann es besteht.",
      },
      {
        text: "Schreibe eine kurze Statusmeldung an dein Team: Das Update ist eingespielt. Nenne die wichtigste Änderung und wo man Probleme melden kann.",
        sectors: ["it"],
      },
      {
        text: "Schreibe eine kurze Nachricht an das Konstruktionsteam: In der Zeichnung fehlt ein Maß. Nenne die Stelle und bitte um eine korrigierte Version.",
        sectors: ["engineering"],
      },
      {
        text: "Schreibe eine kurze Meldung an die Qualitätssicherung: Ein Prüfgerät zeigt unplausible Werte. Nenne Gerät und Charge und bitte um Prüfung.",
        sectors: ["pharma"],
      },
      {
        text: "Ihr Computer im Büro startet seit Tagen sehr langsam. Schreiben Sie eine kurze Meldung an die IT.",
        points: [
          "Beschreiben Sie das Problem.",
          "Sagen Sie, seit wann es besteht.",
          "Bitten Sie um einen Termin.",
        ],
        addressee: "IT-Support",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Eine neue Software soll eingeführt werden, ohne dass Ihr Team geschult wurde. Schreiben Sie an die Projektleitung.",
        sectors: ["it"],
        points: [
          "Beschreiben Sie die geplante Einführung.",
          "Erklären Sie, warum eine Schulung nötig ist.",
          "Schätzen Sie den Aufwand ohne Schulung ein.",
          "Schlagen Sie einen Schulungstermin vor.",
        ],
        addressee: "Projektleitung Digitalisierung, Herr Vogt",
        register: "sie",
        level: "B2.1",
        format: "email_halbformell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "In Ihrem Betrieb sollen Arbeitsschritte künftig automatisch ausgewertet werden. Schreiben Sie an die Geschäftsleitung.",
        points: [
          "Anerkennen Sie den Nutzen der Auswertung.",
          "Benennen Sie die Bedenken der Belegschaft präzise.",
          "Unterscheiden Sie zwischen Prozessdaten und Leistungskontrolle.",
          "Schlagen Sie eine Regelung mit dem Betriebsrat vor.",
        ],
        addressee: "Geschäftsleitung",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine Stellungnahme zur Einführung einer neuen Software im Unternehmen. Nenne Vor- und Nachteile und gib eine begründete Empfehlung.",
      },
      {
        text: "Verfasse eine Anleitung in einfachen Schritten für dein Team: Erkläre, wie man sich im neuen System anmeldet, wo die wichtigsten Funktionen liegen und an wen man sich bei Problemen wendet.",
      },
      {
        text: "Schreibe eine E-Mail an deine Führungskraft: Beantrage neue Hardware für dein Team. Beschreibe die Probleme mit den alten Geräten, den Nutzen der Anschaffung und die ungefähren Kosten.",
      },
      {
        text: "Verfasse eine Stellungnahme zum Thema Homeoffice und Technik: Beschreibe, welche technischen Voraussetzungen fehlen, welche Risiken das hat und was das Unternehmen verbessern sollte.",
      },
      {
        text: "Schreibe einen kurzen Bericht über eine IT-Störung: Beschreibe, was ausgefallen ist, wie lange die Störung dauerte, welche Folgen sie hatte und wie sich so ein Ausfall vermeiden lässt.",
      },
      {
        text: "Verfasse eine Incident-Zusammenfassung für dein Team: Beschreibe, welcher Dienst ausgefallen ist, was die Ursache war, wie ihr sie behoben habt und was ihr gegen eine Wiederholung tut.",
        sectors: ["it"],
      },
      {
        text: "Verfasse eine Stellungnahme zu einem Konstruktionsproblem: Beschreibe den Fehler, seine möglichen Folgen und schlage zwei Lösungen mit Vor- und Nachteilen vor.",
        sectors: ["engineering"],
      },
      {
        text: "Schreibe einen kurzen Bericht an die Produktionsleitung: Eine Charge weicht von der Spezifikation ab. Beschreibe die Messwerte, die mögliche Ursache und dein weiteres Vorgehen.",
        sectors: ["chemicals"],
      },
      {
        text: "Ein Kollege möchte wissen, wie er das neue Programm benutzt. Schreiben Sie ihm eine E-Mail.",
        points: [
          "Erklären Sie, wie er sich anmeldet.",
          "Beschreiben Sie die zwei wichtigsten Funktionen.",
          "Nennen Sie einen häufigen Fehler.",
          "Bieten Sie Ihre Hilfe an.",
        ],
        addressee: "Kollege Ahmed",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird diskutiert, ob künstliche Intelligenz Arbeitsplätze bedroht. Schreiben Sie einen Beitrag.",
        points: [
          "Äußern Sie Ihre Meinung.",
          "Nennen Sie Gründe, warum viele Menschen beunruhigt sind.",
          "Beschreiben Sie eine Tätigkeit, die sich in Ihrem Beruf verändert hat.",
          "Nennen Sie Vorteile der Technik. Denken Sie an Einleitung und Schluss.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Der Einsatz digitaler Werkzeuge steigert die Produktivität, erhöht aber auch die Belastung. Verfassen Sie einen Diskussionsbeitrag.",
        sectors: ["it", "engineering"],
        points: [
          "Beschreiben Sie den Zusammenhang.",
          "Analysieren Sie, wie sich Arbeitsverdichtung bemerkbar macht.",
          "Vergleichen Sie den betrieblichen Nutzen mit den Kosten für Beschäftigte.",
          "Entkräften Sie ein Gegenargument.",
          "Formulieren Sie ein Fazit mit einem Vorschlag.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  sustainability: {
    themeId: "sustainability",
    short: [
      {
        text: "Schreibe einen kurzen Vorschlag, wie dein Team im Büro nachhaltiger arbeiten könnte.",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Ab nächster Woche wird der Müll im Büro getrennt. Erkläre kurz die neuen Regeln.",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Verwaltung: Schlage vor, auf Ökostrom umzustellen, und begründe kurz.",
      },
      {
        text: "Schreibe eine kurze Einladung zu einer Aktion: Dein Team räumt am Freitag den Park neben dem Büro auf. Nenne Zeit und Treffpunkt.",
      },
      {
        text: "Schreibe eine kurze Notiz für das schwarze Brett: Erinnere daran, Licht und Geräte am Feierabend auszuschalten, und nenne einen Grund.",
      },
      {
        text: "Schreibe eine kurze Nachricht an dein Team: Schlage vor, für kurze Wege das Fahrrad statt des Firmenwagens zu nutzen, und nenne einen Vorteil.",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Kantine: Frage nach einem festen vegetarischen Tag und begründe kurz.",
      },
      {
        text: "Schreibe eine kurze Notiz an die Verwaltung: Schlage vor, Restpapier als Notizzettel zu nutzen, und erkläre, wie das organisiert wird.",
      },
      {
        text: "In Ihrem Betrieb wird viel Papier verbraucht. Schreiben Sie eine kurze Nachricht an Ihr Team.",
        points: [
          "Beschreiben Sie das Problem.",
          "Machen Sie einen Vorschlag.",
          "Bitten Sie um Mithilfe.",
        ],
        addressee: "das Team",
        register: "du",
        level: "B1.2",
        format: "nachricht",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Sie möchten anregen, dass Ihr Betrieb auf Mehrwegverpackungen umstellt. Schreiben Sie an die Betriebsleitung.",
        points: [
          "Beschreiben Sie die derzeitige Verpackungspraxis.",
          "Nennen Sie zwei Vorteile der Umstellung.",
          "Gehen Sie kurz auf die Kosten ein.",
          "Bitten Sie um Prüfung Ihres Vorschlags.",
        ],
        addressee: "Betriebsleitung, Frau Sommer",
        register: "sie",
        level: "B2.1",
        format: "email_halbformell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Ihr Betrieb wirbt mit Nachhaltigkeit, ändert im Alltag aber wenig. Schreiben Sie an die Geschäftsleitung.",
        points: [
          "Anerkennen Sie die bisherigen Schritte.",
          "Benennen Sie die Lücke zwischen Anspruch und Praxis konkret.",
          "Erläutern Sie das Risiko für die Glaubwürdigkeit.",
          "Schlagen Sie zwei überprüfbare Maßnahmen vor.",
        ],
        addressee: "Geschäftsleitung",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Schreibe eine Stellungnahme zum Thema Nachhaltigkeit am Arbeitsplatz. Begründe, warum das Thema wichtig ist, und schlage drei konkrete Maßnahmen mit erwartetem Nutzen vor.",
      },
      {
        text: "Verfasse eine E-Mail an die Geschäftsführung: Schlage vor, Dienstreisen durch Videokonferenzen zu ersetzen. Erkläre die Vorteile für Umwelt und Kosten und nenne, wann Reisen weiter nötig sind.",
      },
      {
        text: "Schreibe einen kurzen Bericht über die Umweltmaßnahmen in deiner Abteilung: Was wurde umgesetzt, was hat es gebracht und wo gibt es noch Verbesserungsbedarf?",
      },
      {
        text: "Verfasse eine Stellungnahme zur Frage, ob euer Betrieb auf Papier verzichten kann. Beschreibe den aktuellen Verbrauch, nenne digitale Alternativen und mögliche Schwierigkeiten bei der Umstellung.",
      },
      {
        text: "Schreibe eine E-Mail an alle Mitarbeitenden: Stelle ein neues Jobrad- oder Jobticket-Angebot vor, erkläre die Bedingungen und begründe, warum sich die Teilnahme lohnt.",
      },
      {
        text: "Schreibe einen Vorschlag an die Werksleitung: Beschreibe, wo in der Produktion Energie verschwendet wird, und schlage zwei Maßnahmen mit geschätzter Einsparung vor.",
        sectors: ["production"],
      },
      {
        text: "Schreibe eine Mitteilung an dein Team: Der Salon stellt auf nachfüllbare Produkte um. Erkläre die Gründe und was sich im Arbeitsalltag ändert.",
        sectors: ["beauty"],
      },
      {
        text: "Verfasse eine Stellungnahme zur Anschaffung von Mehrweggeschirr für die Firmenküche: Vergleiche die Kosten mit dem Einwegverbrauch, nenne die Umweltwirkung und gib eine Empfehlung.",
      },
      {
        text: "Ihre Firma möchte, dass mehr Beschäftigte mit dem Rad zur Arbeit kommen. Schreiben Sie eine E-Mail an Ihre Kolleginnen und Kollegen.",
        points: [
          "Erklären Sie die Idee.",
          "Nennen Sie zwei Vorteile.",
          "Beschreiben Sie, was die Firma anbietet.",
          "Bitten Sie um Rückmeldung bis Freitag.",
        ],
        addressee: "das Team",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird diskutiert, ob Betriebe zu mehr Klimaschutz verpflichtet werden sollten. Schreiben Sie einen Beitrag.",
        points: [
          "Äußern Sie Ihre Meinung zu einer gesetzlichen Pflicht.",
          "Begründen Sie Ihre Position.",
          "Nennen Sie eine mögliche Belastung für kleine Betriebe.",
          "Schlagen Sie eine faire Lösung vor.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Nachhaltigkeit im Betrieb scheitert oft weniger am Willen als an den Kosten. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie den Zielkonflikt.",
          "Analysieren Sie, wer die Kosten kurzfristig trägt.",
          "Vergleichen Sie kurzfristige Kosten mit langfristigem Nutzen.",
          "Räumen Sie einen Einwand ein.",
          "Ziehen Sie ein Fazit mit einer konkreten Forderung.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  safety: {
    themeId: "safety",
    short: [
      {
        text: "Schreibe eine kurze Notiz an die Kolleg:innen zu einer neuen Sicherheitsregel im Betrieb.",
      },
      {
        text: "Schreibe eine kurze Meldung an deinen Vorgesetzten: Du hast einen Beinahe-Unfall im Lager beobachtet. Beschreibe kurz, was passiert ist.",
      },
      {
        text: "Schreibe eine kurze Erinnerung an dein Team: Am Donnerstag ist die jährliche Sicherheitsunterweisung. Nenne Zeit und Ort und dass die Teilnahme Pflicht ist.",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Haustechnik: Ein Feuerlöscher im Flur fehlt. Bitte um schnellen Ersatz.",
      },
      {
        text: "Schreibe eine kurze Notiz an die Kolleg:innen: Ab sofort gilt im Bereich der Maschinen Helmpflicht. Begründe kurz.",
      },
      {
        text: "Schreibe eine kurze Meldung an die Hygienebeauftragte: Das Desinfektionsmittel auf Station 3 ist fast leer. Bitte um Nachschub.",
        sectors: ["care"],
      },
      {
        text: "Schreibe eine kurze Notiz an die Kolonne: Ab morgen gilt auf der Baustelle eine neue Anfahrt für Lieferungen. Beschreibe sie kurz.",
        sectors: ["construction"],
      },
      {
        text: "Schreibe eine kurze Nachricht an den Fuhrparkleiter: Am LKW leuchtet die Bremswarnleuchte. Frage, ob du die Tour fortsetzen sollst.",
        sectors: ["transport"],
      },
      {
        text: "Schreibe eine kurze Meldung an den Schichtleiter: An der Anlage 2 ist die Schutzabdeckung locker. Bitte um Reparatur vor der Nachtschicht.",
        sectors: ["production"],
      },
      {
        text: "Schreibe eine kurze Meldung an die Sicherheitsfachkraft: Ein Gebinde im Lager ist undicht. Beschreibe, wo es steht und was du gesichert hast.",
        sectors: ["chemicals"],
      },
      {
        text: "Schreibe eine kurze Meldung an die Leitstelle: Am Nebeneingang ist ein Türschloss defekt. Beschreibe das Risiko und bitte um Reparatur.",
        sectors: ["security"],
      },
      {
        text: "Im Lager liegt seit Tagen Material im Fluchtweg. Schreiben Sie eine kurze Meldung.",
        points: [
          "Sagen Sie, wo das Problem ist.",
          "Beschreiben Sie die Gefahr.",
          "Bitten Sie darum, es schnell zu beseitigen.",
        ],
        addressee: "Sicherheitsbeauftragter, Herr Roth",
        register: "sie",
        level: "B1.2",
        format: "notiz",
        exam: "dtb",
        words: 40,
      },
      {
        text: "Eine Schutzeinrichtung an einer Maschine ist defekt und wird trotzdem weiter genutzt. Schreiben Sie eine Meldung.",
        sectors: ["production", "engineering"],
        points: [
          "Benennen Sie Maschine und Defekt genau.",
          "Beschreiben Sie, welche Gefahr besteht.",
          "Nennen Sie, seit wann der Zustand besteht.",
          "Fordern Sie die sofortige Außerbetriebnahme.",
        ],
        addressee: "Sicherheitsfachkraft, Frau Ilić",
        register: "sie",
        level: "B2.1",
        format: "notiz",
        exam: "dtb",
        words: 100,
      },
      {
        text: "Nach einem Beinaheunfall wurde keine Meldung erfasst. Schreiben Sie an die Werksleitung.",
        sectors: ["production", "construction"],
        points: [
          "Schildern Sie den Vorfall sachlich.",
          "Erklären Sie, warum auch Beinaheunfälle erfasst werden müssen.",
          "Benennen Sie die Lücke im derzeitigen Verfahren.",
          "Schlagen Sie eine verbindliche Meldepflicht vor.",
        ],
        addressee: "Werksleitung",
        register: "sie",
        level: "C1",
        format: "bericht",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine Stellungnahme zu einem Sicherheitsvorfall. Beschreibe, was passiert ist, welche Maßnahmen nötig sind und wie sich ein solcher Vorfall künftig vermeiden lässt.",
      },
      {
        text: "Verfasse einen Unfallbericht: Beschreibe, wann und wo sich der Unfall ereignet hat, wer beteiligt war, welche Verletzungen oder Schäden entstanden sind und welche ersten Maßnahmen ergriffen wurden.",
      },
      {
        text: "Schreibe eine E-Mail an die Sicherheitsbeauftragte: Melde einen Mangel an der Schutzausrüstung in deinem Bereich, beschreibe das Risiko und bitte um Abhilfe mit Frist.",
      },
      {
        text: "Verfasse eine Stellungnahme zu einem geplanten Sicherheitstraining: Begründe, warum das Training nötig ist, welche Themen es abdecken soll und wie oft es stattfinden sollte.",
      },
      {
        text: "Schreibe eine Mitteilung an alle Mitarbeitenden über einen neuen Fluchtwegeplan: Erkläre, was sich geändert hat, wo die Sammelpunkte sind und was bei einem Alarm zu tun ist.",
      },
      {
        text: "Verfasse einen kurzen Bericht über einen Sturz: Beschreibe, wann und wo der Bewohner gestürzt ist, wie ihr reagiert habt und welche Maßnahmen künftig helfen.",
        sectors: ["care"],
      },
      {
        text: "Schreibe eine E-Mail an den Bauleiter: Auf dem Gerüst fehlen Absturzsicherungen. Beschreibe die Stelle, das Risiko und fordere die Nachrüstung, bevor weitergearbeitet wird.",
        sectors: ["construction"],
      },
      {
        text: "Schreibe eine Unterweisung für einen neuen Azubi: Erkläre die drei wichtigsten Sicherheitsregeln in der Werkstatt und warum sie gelten.",
        sectors: ["trades"],
      },
      {
        text: "Schreibe eine Mitteilung an alle Mitglieder: Erkläre die neuen Regeln im Kraftraum (Einweisung, Ablegen der Gewichte, Reinigung der Geräte) und begründe sie kurz.",
        sectors: ["sports"],
      },
      {
        text: "Schreibe eine kurze Unterweisung für dein Team: Erkläre den sicheren Umgang mit Reinigungschemie und warum Produkte nie gemischt werden dürfen.",
        sectors: ["cleaning"],
      },
      {
        text: "Verfasse einen kurzen Bericht über einen Vorfall im Objekt: Beschreibe, was du beobachtet hast, wie du reagiert hast und wen du informiert hast.",
        sectors: ["security"],
      },
      {
        text: "Verfasse eine kurze Unterweisung für neue Mitarbeitende: Erkläre den Umgang mit Gefahrstoffen (Kennzeichnung, Schutzausrüstung, Verhalten bei einem Unfall).",
        sectors: ["chemicals"],
      },
      {
        text: "Ein neuer Kollege beginnt nächste Woche. Schreiben Sie ihm eine E-Mail zu den Sicherheitsregeln.",
        points: [
          "Begrüßen Sie ihn.",
          "Nennen Sie die drei wichtigsten Regeln.",
          "Erklären Sie, wo die Schutzkleidung liegt.",
          "Sagen Sie, an wen er sich bei Fragen wendet.",
        ],
        addressee: "neuer Kollege Tomasz",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Nach einem Arbeitsunfall sollen Sie einen Bericht schreiben.",
        points: [
          "Beschreiben Sie den Hergang mit Zeit und Ort.",
          "Nennen Sie die beteiligten Personen und die Verletzung.",
          "Erklären Sie, welche Sofortmaßnahmen ergriffen wurden.",
          "Schlagen Sie Maßnahmen zur Vermeidung vor.",
        ],
        addressee: "Sicherheitsfachkraft und Betriebsleitung",
        register: "sie",
        level: "B2.1",
        format: "bericht",
        exam: "dtb",
        words: 150,
      },
      {
        text: "Sicherheitsvorschriften werden im Betriebsalltag oft aus Zeitdruck umgangen. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie das Spannungsfeld zwischen Termindruck und Sicherheit.",
          "Analysieren Sie, warum Regeln trotz Kenntnis übergangen werden.",
          "Beziehen Sie ein Beispiel aus der Praxis ein.",
          "Entkräften Sie den Einwand, Vorschriften seien praxisfern.",
          "Formulieren Sie ein Fazit mit einer Empfehlung an Führungskräfte.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  travel: {
    themeId: "travel",
    short: [
      {
        text: "Schreibe eine kurze E-Mail, um eine Dienstreise zu organisieren (Termin, Ziel, Zweck).",
      },
      {
        text: "Schreibe eine kurze E-Mail an ein Hotel: Reserviere ein Einzelzimmer für zwei Nächte und frage nach dem Frühstück.",
      },
      {
        text: "Schreibe eine kurze Nachricht an deine Chefin: Dein Zug fällt aus, du erreichst den Termin später. Nenne deine neue Ankunftszeit.",
      },
      {
        text: "Schreibe eine kurze Bitte an das Sekretariat: Buche dir einen Flug für eine Dienstreise. Nenne Ziel, Datum und gewünschte Zeit.",
      },
      {
        text: "Schreibe eine kurze Abwesenheitsnotiz für deine E-Mails: Nenne den Zeitraum deiner Dienstreise und wer dich vertritt.",
      },
      {
        text: "Schreibe eine kurze E-Mail an das Hotel: Du reist einen Tag später an. Bitte darum, die Reservierung anzupassen.",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Kollegen vor der gemeinsamen Dienstreise: Schlage einen Treffpunkt am Bahnhof vor und nenne die Abfahrtszeit.",
      },
      {
        text: "Schreibe eine kurze Anfrage an den Empfang des Kunden: Melde deinen Besuch für Dienstag an und frage nach einem Besucherparkplatz.",
      },
      {
        text: "Sie brauchen für eine Dienstreise ein Hotelzimmer. Schreiben Sie eine kurze E-Mail an das Hotel.",
        points: [
          "Nennen Sie die Daten Ihrer Reise.",
          "Sagen Sie, welches Zimmer Sie möchten.",
          "Bitten Sie um eine Bestätigung.",
        ],
        addressee: "Hotel Adler, Reservierung",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Ihre Dienstreise muss kurzfristig abgesagt werden. Schreiben Sie an den Geschäftspartner.",
        points: [
          "Sagen Sie den Termin ab und entschuldigen Sie sich.",
          "Nennen Sie den Grund.",
          "Schlagen Sie zwei Ersatztermine vor.",
          "Bieten Sie ein Videogespräch als Zwischenlösung an.",
        ],
        addressee: "Geschäftspartner, Herr Lindqvist",
        register: "sie",
        level: "B2.1",
        format: "email_formell",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Die Reisekostenabrechnung Ihres Betriebs deckt tatsächliche Kosten seit Jahren nicht mehr. Schreiben Sie an die Personalabteilung.",
        points: [
          "Anerkennen Sie den bestehenden Rahmen.",
          "Belegen Sie die Lücke mit zwei konkreten Beispielen.",
          "Erläutern Sie, welche Wirkung das auf die Reisebereitschaft hat.",
          "Bitten Sie um eine Anpassung zum nächsten Geschäftsjahr.",
        ],
        addressee: "Personalabteilung, Frau Krüger",
        register: "sie",
        level: "C1",
        format: "antrag",
        exam: "telc_b2_beruf",
        words: 120,
      },
    ],
    long: [
      {
        text: "Schreibe einen Bericht über eine Dienstreise. Fasse die wichtigsten Ergebnisse zusammen, bewerte den Nutzen der Reise und gib eine Empfehlung für künftige Reisen.",
      },
      {
        text: "Verfasse eine E-Mail an die Buchhaltung zu deiner Reisekostenabrechnung: Liste die wichtigsten Ausgaben der Reise auf, erkläre eine ungewöhnliche Position und bitte um Erstattung.",
      },
      {
        text: "Schreibe eine E-Mail an einen Geschäftspartner im Ausland: Kündige deinen Besuch an, schlage ein Programm für die zwei Tage vor und frage nach einem Termin für ein gemeinsames Abendessen.",
      },
      {
        text: "Verfasse eine Stellungnahme zur Reiserichtlinie deines Unternehmens: Beschreibe, was aus deiner Sicht unpraktisch ist, und schlage konkrete Verbesserungen vor, zum Beispiel bei Buchung oder Abrechnung.",
      },
      {
        text: "Schreibe eine Beschwerde an eine Fluggesellschaft: Dein Flug hatte große Verspätung und dein Gepäck kam beschädigt an. Beschreibe den Ablauf, nenne die Folgen und fordere eine Entschädigung.",
      },
      {
        text: "Verfasse eine E-Mail an die Assistenz: Plane deine zweitägige Dienstreise nach München. Nenne Termine, gewünschte Zugzeiten und Hotelwünsche und bitte um die Buchung.",
      },
      {
        text: "Schreibe eine E-Mail an den Veranstalter einer Messe: Melde dein Unternehmen als Besucher an und frage nach Tagestickets, Workshops und Hotelempfehlungen in der Nähe.",
      },
      {
        text: "Verfasse einen kurzen Leitfaden für die Geschäftsreise deines Teams ins Ausland: Beschreibe Begrüßung, Pünktlichkeit und Kleidung und gib zwei praktische Tipps.",
      },
      {
        text: "Sie waren auf einer Messe. Schreiben Sie eine E-Mail an Ihre Kollegin.",
        points: [
          "Erzählen Sie, wo Sie waren.",
          "Beschreiben Sie, was interessant war.",
          "Nennen Sie einen neuen Kontakt.",
          "Schlagen Sie ein Gespräch nach Ihrer Rückkehr vor.",
        ],
        addressee: "Kollegin Nadia",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Schreiben Sie einen Bericht über Ihre Dienstreise zu einer Fachmesse.",
        points: [
          "Nennen Sie Anlass, Ort und Zeitraum.",
          "Fassen Sie die wichtigsten Eindrücke zusammen.",
          "Beschreiben Sie zwei Kontakte oder Angebote.",
          "Geben Sie eine Empfehlung, ob eine Teilnahme im nächsten Jahr sinnvoll ist.",
        ],
        addressee: "Abteilungsleitung",
        register: "sie",
        level: "B2.1",
        format: "bericht",
        exam: "telc_b2_beruf",
        words: 150,
      },
      {
        text: "Viele Betriebe ersetzen Dienstreisen dauerhaft durch Videokonferenzen. Verfassen Sie einen Diskussionsbeitrag.",
        points: [
          "Beschreiben Sie die Entwicklung.",
          "Analysieren Sie, was bei rein digitalen Treffen verloren geht.",
          "Wägen Sie Kosten, Klimawirkung und Beziehungspflege ab.",
          "Räumen Sie ein Gegenargument ein.",
          "Ziehen Sie ein Fazit mit einer klaren Empfehlung.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  behoerde: {
    themeId: "behoerde",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an das Bürgeramt: Bitte um einen Termin zur Anmeldung deines neuen Wohnsitzes und nenne deine Verfügbarkeit.",
        sub: "behoerde.meldewesen",
      },
      {
        text: "Schreibe eine kurze E-Mail an das Bürgeramt: Frage nach, welche Unterlagen du für einen neuen Personalausweis brauchst.",
        sub: "behoerde.antrag",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Behörde: Du musst einen Termin absagen. Entschuldige dich und bitte um einen neuen Termin.",
      },
      {
        text: "Schreibe eine kurze Antwort auf ein Schreiben vom Amt: Bestätige den Erhalt und kündige an, die fehlenden Unterlagen nachzureichen.",
        sub: "behoerde.antrag",
      },
      {
        text: "Schreibe eine kurze E-Mail an das Standesamt: Frage, wie du eine Geburtsurkunde beantragen kannst und was sie kostet.",
        sub: "behoerde.antrag",
      },
      {
        text: "Schreibe eine kurze E-Mail an das Bürgeramt: Du bist umgezogen und fragst, ob du für die Ummeldung einen Termin brauchst und welche Unterlagen nötig sind.",
        sub: "behoerde.meldewesen",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Ausländerbehörde: Frage nach dem Stand deines Antrags auf Verlängerung und nenne dein Aktenzeichen.",
        sub: "behoerde.aufenthalt",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Ausländerbehörde: Deine Adresse hat sich geändert. Teile die neue Adresse mit und bitte um eine Bestätigung.",
        sub: "behoerde.aufenthalt",
      },
      {
        text: "Schreibe eine kurze Nachricht an das Amt: In deinem Bescheid ist dein Name falsch geschrieben. Bitte um eine Korrektur.",
        sub: "behoerde.bescheid",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Behörde: Du verstehst eine Formulierung in deinem Bescheid nicht. Bitte um eine einfache Erklärung.",
        sub: "behoerde.bescheid",
      },
      {
        text: "Sie können Ihren Termin bei der Ausländerbehörde nicht wahrnehmen. Schreiben Sie eine kurze E-Mail.",
        sub: "behoerde.aufenthalt",
        points: [
          "Nennen Sie Ihren Termin mit Datum und Uhrzeit.",
          "Sagen Sie den Termin ab und entschuldigen Sie sich.",
          "Bitten Sie um einen neuen Termin.",
        ],
        addressee: "Ausländerbehörde, Sachbearbeitung",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Sie haben Unterlagen eingereicht, aber seit Wochen keine Antwort erhalten. Schreiben Sie eine Sachstandsanfrage.",
        sub: "behoerde.antrag",
        points: [
          "Schreiben Sie eine Betreffzeile mit Ihrem Aktenzeichen.",
          "Nennen Sie, was Sie wann eingereicht haben.",
          "Bitten Sie höflich um eine Auskunft zum Bearbeitungsstand.",
          "Bitten Sie um eine Antwort bis zu einem von Ihnen genannten Datum.",
        ],
        addressee: "Sachbearbeitung des Amtes",
        register: "sie",
        level: "B2.1",
        format: "antrag",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Sie haben einen Bescheid erhalten, mit dem Sie nicht einverstanden sind. Schreiben Sie einen Widerspruch.",
        sub: "behoerde.bescheid",
        points: [
          "Nennen Sie im Betreff den Bescheid, sein Datum und das Aktenzeichen.",
          "Erklären Sie ausdrücklich, dass Sie Widerspruch einlegen.",
          "Begründen Sie sachlich, welcher Punkt aus Ihrer Sicht falsch beurteilt wurde.",
          "Beantragen Sie eine erneute Entscheidung und kündigen Sie fehlende Unterlagen an.",
          "Schließen Sie mit einer förmlichen Grußformel.",
        ],
        addressee: "die zuständige Behörde",
        register: "sie",
        level: "C1",
        format: "widerspruch",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an die Ausländerbehörde. Erkläre, dass du deinen Aufenthaltstitel verlängern möchtest, frage nach den nötigen Unterlagen und bitte höflich um einen Termin.",
        sub: "behoerde.aufenthalt",
      },
      {
        text: "Verfasse einen Widerspruch gegen einen Bescheid: Erkläre höflich, warum du die Entscheidung für falsch hältst, nenne dein Aktenzeichen, lege deine Gründe dar und bitte um eine neue Prüfung.",
        sub: "behoerde.bescheid",
      },
      {
        text: "Schreibe eine E-Mail an das Jobcenter: Erkläre deine aktuelle Situation, frage nach, welche Leistungen dir zustehen, und bitte um einen Beratungstermin.",
        sub: "behoerde.antrag",
      },
      {
        text: "Verfasse eine formelle E-Mail an die Kfz-Zulassungsstelle: Du möchtest ein Auto anmelden. Frage nach den nötigen Unterlagen, den Kosten und ob du einen Termin brauchst.",
        sub: "behoerde.antrag",
      },
      {
        text: "Schreibe eine E-Mail an die Elterngeldstelle: Dein Antrag ist seit acht Wochen in Bearbeitung. Frage höflich nach dem Stand, nenne dein Aktenzeichen und erkläre, warum die Antwort dringend ist.",
        sub: "behoerde.bescheid",
      },
      {
        text: "Verfasse eine formelle E-Mail an das Bürgeramt: Du brauchst eine Meldebescheinigung für deinen Vermieter. Erkläre den Zweck, frage nach Kosten und Ablauf und bitte um einen kurzfristigen Termin.",
        sub: "behoerde.meldewesen",
      },
      {
        text: "Schreibe eine E-Mail an das Bürgeramt: Bei deiner Anmeldung wurde dein Einzugsdatum falsch erfasst. Beschreibe den Fehler, nenne das richtige Datum und bitte um eine korrigierte Bestätigung.",
        sub: "behoerde.meldewesen",
      },
      {
        text: "Verfasse eine formelle E-Mail an die Ausländerbehörde: Dein Termin liegt nach Ablauf deines Aufenthaltstitels. Beschreibe die Situation, frage nach einer Fiktionsbescheinigung und bitte um einen früheren Termin.",
        sub: "behoerde.aufenthalt",
      },
      {
        text: "Sie sind umgezogen und müssen sich anmelden. Schreiben Sie eine E-Mail an das Bürgeramt.",
        sub: "behoerde.meldewesen",
        points: [
          "Sagen Sie, dass Sie umgezogen sind.",
          "Nennen Sie Ihre neue Adresse und das Datum des Umzugs.",
          "Fragen Sie, welche Unterlagen Sie mitbringen müssen.",
          "Bitten Sie um einen Termin.",
        ],
        addressee: "Bürgeramt",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Ihr Antrag wurde abgelehnt, weil angeblich eine Unterlage fehlte, die Sie eingereicht hatten. Schreiben Sie an die Behörde.",
        sub: "behoerde.bescheid",
        points: [
          "Nennen Sie Betreff, Aktenzeichen und das Datum des Bescheids.",
          "Stellen Sie dar, wann und wie Sie die Unterlage eingereicht haben.",
          "Bitten Sie um Überprüfung der Entscheidung.",
          "Kündigen Sie an, die Unterlage erneut beizufügen, und bitten Sie um eine Eingangsbestätigung.",
        ],
        addressee: "Sachbearbeitung des Amtes",
        register: "sie",
        level: "B2.1",
        format: "widerspruch",
        exam: "alltag",
        words: 150,
      },
      {
        text: "Sie benötigen mehr Zeit, um geforderte Nachweise einzureichen. Schreiben Sie einen begründeten Antrag auf Fristverlängerung.",
        sub: "behoerde.antrag",
        points: [
          "Nehmen Sie mit Aktenzeichen auf die Aufforderung und ihr Datum Bezug.",
          "Legen Sie nachvollziehbar dar, warum die Unterlagen noch fehlen.",
          "Zeigen Sie, welche Schritte Sie bereits unternommen haben.",
          "Beantragen Sie eine Verlängerung bis zu einem konkreten Datum.",
          "Sichern Sie zu, die Unterlagen unaufgefordert nachzureichen.",
        ],
        addressee: "die zuständige Behörde",
        register: "sie",
        level: "C1",
        format: "antrag",
        exam: "alltag",
        words: 200,
      },
    ],
  },
  arzt: {
    themeId: "arzt",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an eine Arztpraxis: Bitte um einen Termin, beschreibe kurz deine Beschwerden und nenne deine Verfügbarkeit.",
        sub: "arzt.termin",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Praxis: Sage deinen Termin am Montag ab und bitte um einen neuen.",
        sub: "arzt.termin",
      },
      {
        text: "Schreibe eine kurze E-Mail an deine Hausärztin: Bitte um ein Wiederholungsrezept für dein Medikament.",
        sub: "arzt.behandlung",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Arbeitgeber: Du bist krank und bleibst heute zu Hause. Die Krankmeldung reichst du nach.",
      },
      {
        text: "Schreibe eine kurze Frage an die Praxis: Musst du für die Blutabnahme am Freitag nüchtern kommen? Frage auch, ob du früher kommen kannst.",
        sub: "arzt.behandlung",
      },
      {
        text: "Schreibe eine kurze Nachricht an deine Hausärztin: Beschreibe deine Erkältungssymptome und frage, ob du vorbeikommen sollst.",
        sub: "arzt.symptome",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Praxis: Nach der neuen Tablette hast du Kopfschmerzen bekommen. Beschreibe, seit wann, und frage, ob du sie weiter nehmen sollst.",
        sub: "arzt.symptome",
      },
      {
        text: "Schreibe eine kurze E-Mail an deine Krankenkasse: Deine Versichertenkarte ist verloren gegangen. Bitte um eine neue.",
        sub: "arzt.versicherung",
      },
      {
        text: "Schreibe eine kurze Anfrage an die Apotheke: Frage, ob dein Medikament vorrätig ist und was es mit Rezept kostet.",
        sub: "arzt.versicherung",
      },
      {
        text: "Sie sind krank und können nicht zur Arbeit kommen. Schreiben Sie eine kurze Nachricht.",
        sub: "arzt.termin",
        points: [
          "Sagen Sie, dass Sie krank sind.",
          "Nennen Sie, wie lange Sie voraussichtlich ausfallen.",
          "Sagen Sie, dass Sie eine Bescheinigung nachreichen.",
        ],
        addressee: "Vorgesetzte, Frau Weber",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "alltag",
        words: 40,
      },
      {
        text: "Sie brauchen für Ihren Arbeitgeber eine Bescheinigung von Ihrer Praxis. Schreiben Sie eine E-Mail.",
        sub: "arzt.behandlung",
        points: [
          "Nennen Sie Ihren Namen und Ihr Geburtsdatum.",
          "Beschreiben Sie, welche Bescheinigung Sie benötigen und wofür.",
          "Nennen Sie den Zeitraum, den sie abdecken soll.",
          "Fragen Sie, wie und wann Sie sie erhalten können.",
        ],
        addressee: "Hausarztpraxis Dr. Schneider",
        register: "sie",
        level: "B2.1",
        format: "email_formell",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Ihre Krankenkasse hat eine Leistung abgelehnt, die Ihnen Ihre Ärztin empfohlen hat. Schreiben Sie einen Widerspruch.",
        sub: "arzt.versicherung",
        points: [
          "Nennen Sie im Betreff Versichertennummer, Bescheid und dessen Datum.",
          "Erklären Sie ausdrücklich, dass Sie Widerspruch einlegen.",
          "Stellen Sie die ärztliche Empfehlung sachlich dar.",
          "Kündigen Sie eine ergänzende ärztliche Begründung an.",
          "Bitten Sie um eine schriftliche Entscheidung.",
        ],
        addressee: "Krankenkasse, Leistungsabteilung",
        register: "sie",
        level: "C1",
        format: "widerspruch",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an deine Krankenkasse. Erkläre, dass du eine Rechnung einreichen möchtest, frage nach der Kostenübernahme für eine Behandlung und bitte höflich um eine schriftliche Bestätigung.",
        sub: "arzt.versicherung",
      },
      {
        text: "Verfasse eine E-Mail an eine Facharztpraxis: Du hast erst in drei Monaten einen Termin bekommen. Erkläre deine Beschwerden und bitte um einen früheren Termin oder einen Platz auf der Warteliste.",
        sub: "arzt.termin",
      },
      {
        text: "Schreibe eine E-Mail an deine Krankenkasse: Frage, ob sie die Kosten für einen Gesundheitskurs übernimmt. Beschreibe den Kurs, begründe, warum er dir hilft, und frage nach dem Verfahren.",
        sub: "arzt.versicherung",
      },
      {
        text: "Verfasse eine höfliche Beschwerde an eine Klinik: Beschreibe, was bei deinem Aufenthalt nicht gut gelaufen ist, bleibe sachlich und schlage vor, wie es besser gemacht werden könnte.",
        sub: "arzt.behandlung",
      },
      {
        text: "Schreibe eine E-Mail an die Praxis, weil du eine falsche Rechnung bekommen hast: Erkläre, welche Leistung berechnet wurde, die du nicht erhalten hast, und bitte um eine korrigierte Rechnung.",
        sub: "arzt.versicherung",
      },
      {
        text: "Verfasse eine E-Mail an deine Hausarztpraxis vor einem Termin: Beschreibe deine Beschwerden genau (seit wann, wie oft, was hilft), damit die Ärztin sich vorbereiten kann.",
        sub: "arzt.symptome",
      },
      {
        text: "Schreibe eine Nachricht an eine Fachärztin: Beschreibe deine Rückenschmerzen, erkläre, was du schon versucht hast, und frage, welche Untersuchung sinnvoll wäre.",
        sub: "arzt.symptome",
      },
      {
        text: "Verfasse eine E-Mail an eine Praxis: Du brauchst einen Kontrolltermin und eine Überweisung. Nenne deine Verfügbarkeit, frage nach freien Terminen und ob die Überweisung vorbereitet werden kann.",
        sub: "arzt.termin",
      },
      {
        text: "Schreibe eine E-Mail an deine Ärztin nach einer Untersuchung: Bitte um eine verständliche Erklärung deines Befunds und frage, welche Behandlung sie empfiehlt und welche Alternativen es gibt.",
        sub: "arzt.behandlung",
      },
      {
        text: "Sie möchten einen Termin bei einer neuen Praxis. Schreiben Sie eine E-Mail.",
        sub: "arzt.termin",
        points: [
          "Stellen Sie sich kurz vor.",
          "Beschreiben Sie, warum Sie einen Termin brauchen.",
          "Nennen Sie, wann Sie Zeit haben.",
          "Fragen Sie, welche Unterlagen Sie mitbringen sollen.",
        ],
        addressee: "Praxis Dr. Hoffmann",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Sie warten seit Wochen auf einen Facharzttermin und Ihre Beschwerden werden schlimmer. Schreiben Sie an die Praxis.",
        sub: "arzt.symptome",
        points: [
          "Nehmen Sie auf Ihre Terminanfrage und deren Datum Bezug.",
          "Beschreiben Sie sachlich, wie sich Ihre Beschwerden verändert haben.",
          "Bitten Sie um einen früheren Termin oder um einen Platz auf der Warteliste.",
          "Fragen Sie, an wen Sie sich sonst wenden können.",
        ],
        addressee: "Facharztpraxis, Terminvergabe",
        register: "sie",
        level: "B2.1",
        format: "email_formell",
        exam: "alltag",
        words: 150,
      },
      {
        text: "In einem Gesundheitsforum wird diskutiert, ob Videosprechstunden persönliche Arztbesuche ersetzen können. Schreiben Sie einen Beitrag.",
        sub: "arzt.behandlung",
        points: [
          "Beschreiben Sie, wofür sich Videosprechstunden eignen.",
          "Analysieren Sie, was bei einer Untersuchung aus der Ferne fehlt.",
          "Wägen Sie Erreichbarkeit gegen Behandlungsqualität ab.",
          "Räumen Sie ein Gegenargument ein.",
          "Formulieren Sie ein begründetes Fazit.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "forumsbeitrag",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  wohnen: {
    themeId: "wohnen",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an einen Vermieter: Zeige Interesse an einer Wohnung, bitte um einen Besichtigungstermin und nenne deine Verfügbarkeit.",
        sub: "wohnen.suche",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Nachbarn: Bei dir kommt morgen ein Handwerker, es kann laut werden. Entschuldige dich im Voraus.",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Hausverwaltung: Der Aufzug ist seit zwei Tagen kaputt. Bitte um schnelle Reparatur.",
        sub: "wohnen.probleme",
      },
      {
        text: "Schreibe eine kurze Nachricht an deine Vermieterin: Kündige an, dass du im Sommer für vier Wochen verreist, und nenne eine Kontaktperson.",
      },
      {
        text: "Schreibe eine kurze Anfrage an einen Umzugsservice: Frage nach einem Angebot für deinen Umzug und nenne Datum und Adressen.",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine WG: Stelle dich in zwei Sätzen vor und frage, ob das Zimmer noch frei ist.",
        sub: "wohnen.suche",
      },
      {
        text: "Schreibe eine kurze E-Mail an deinen Vermieter: Frage, ob du die Wohnung mit einer neuen Mitbewohnerin teilen darfst.",
        sub: "wohnen.vertrag",
      },
      {
        text: "Schreibe eine kurze Nachricht an die Hausverwaltung: Bitte um einen Termin für die Wohnungsübergabe und frage, was du vorbereiten musst.",
        sub: "wohnen.vertrag",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Hausverwaltung: Frage, warum deine Nebenkostenvorauszahlung steigt.",
        sub: "wohnen.nebenkosten",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Vermieter: Bitte um die Nebenkostenabrechnung für das letzte Jahr.",
        sub: "wohnen.nebenkosten",
      },
      {
        text: "Schreibe eine kurze Meldung an die Hausverwaltung: Die Heizung wird nicht warm. Beschreibe das Problem und bitte um schnelle Hilfe.",
        sub: "wohnen.probleme",
      },
      {
        text: "In Ihrer Wohnung tropft seit gestern der Wasserhahn im Bad. Schreiben Sie eine kurze Nachricht an die Hausverwaltung.",
        sub: "wohnen.probleme",
        points: [
          "Nennen Sie Ihre Adresse und Wohnungsnummer.",
          "Beschreiben Sie den Schaden.",
          "Bitten Sie um eine Reparatur.",
        ],
        addressee: "Hausverwaltung Meier",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "alltag",
        words: 40,
      },
      {
        text: "Seit drei Wochen ist die Heizung in Ihrer Wohnung defekt, trotz Meldung ist nichts passiert. Schreiben Sie eine Mängelanzeige.",
        sub: "wohnen.probleme",
        points: [
          "Nennen Sie im Betreff Ihre Adresse und den Mangel.",
          "Beschreiben Sie den Mangel und seit wann er besteht.",
          "Nehmen Sie auf Ihre erste Meldung mit Datum Bezug.",
          "Fordern Sie die Beseitigung bis zu einem von Ihnen gesetzten Datum.",
        ],
        addressee: "Vermieterin, Frau Schuster",
        register: "sie",
        level: "B2.1",
        format: "beschwerde",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Ihre Betriebskostenabrechnung enthält einen Posten, den Sie für nicht nachvollziehbar halten. Schreiben Sie an die Hausverwaltung.",
        sub: "wohnen.nebenkosten",
        points: [
          "Nennen Sie im Betreff das Abrechnungsjahr und Ihre Wohnung.",
          "Benennen Sie den strittigen Posten genau.",
          "Legen Sie dar, warum die Umlage für Sie nicht nachvollziehbar ist.",
          "Bitten Sie um Einsicht in die Belege.",
          "Bitten Sie um eine schriftliche Antwort bis zu einem konkreten Datum.",
        ],
        addressee: "Hausverwaltung",
        register: "sie",
        level: "C1",
        format: "widerspruch",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an deine Hausverwaltung. Melde einen Mangel in der Wohnung (zum Beispiel Schimmel oder eine defekte Heizung), bitte um eine Reparatur mit Frist und weise höflich auf deine Rechte als Mieter hin.",
        sub: "wohnen.probleme",
      },
      {
        text: "Verfasse eine Antwort auf eine Mieterhöhung: Bestätige den Erhalt des Schreibens, stelle sachliche Rückfragen zur Begründung und bitte um ausreichend Zeit zur Prüfung.",
        sub: "wohnen.nebenkosten",
      },
      {
        text: "Schreibe eine Kündigung für deine Wohnung: Kündige fristgerecht, nenne das Datum des Auszugs, bitte um einen Übergabetermin und um die Rückzahlung der Kaution.",
        sub: "wohnen.vertrag",
      },
      {
        text: "Verfasse eine Beschwerde an die Hausverwaltung über wiederholten Lärm im Haus: Beschreibe die Störungen mit Zeiten, erkläre die Folgen für dich und bitte um ein Gespräch mit den Verursachern.",
        sub: "wohnen.probleme",
      },
      {
        text: "Schreibe eine Bewerbung um eine Wohnung: Stelle dich und deine Situation kurz vor, erkläre, warum die Wohnung gut passt, und nenne die Unterlagen, die du mitbringen kannst.",
        sub: "wohnen.suche",
      },
      {
        text: "Verfasse eine E-Mail an einen Makler: Beschreibe, welche Wohnung du suchst (Größe, Lage, Budget), und frage nach passenden Angeboten und den nächsten Schritten.",
        sub: "wohnen.suche",
      },
      {
        text: "Schreibe eine E-Mail an deinen Vermieter vor der Vertragsunterschrift: Stelle drei konkrete Fragen zum Mietvertrag (zum Beispiel Kündigungsfrist, Kaution, Renovierung) und bitte um schriftliche Antwort.",
        sub: "wohnen.vertrag",
      },
      {
        text: "Verfasse eine höfliche Reklamation deiner Nebenkostenabrechnung: Nenne die Posten, die dir zu hoch erscheinen, bitte um Einsicht in die Belege und um eine Prüfung der Abrechnung.",
        sub: "wohnen.nebenkosten",
      },
      {
        text: "Sie interessieren sich für eine Wohnung aus einer Anzeige. Schreiben Sie eine E-Mail.",
        sub: "wohnen.suche",
        points: [
          "Sagen Sie, auf welche Anzeige Sie sich beziehen.",
          "Stellen Sie sich und Ihre Situation kurz vor.",
          "Fragen Sie nach den Nebenkosten.",
          "Bitten Sie um einen Besichtigungstermin.",
        ],
        addressee: "Vermieter, Herr Krause",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Ihre Nachbarn verursachen regelmäßig nachts Lärm. Schreiben Sie an die Hausverwaltung.",
        sub: "wohnen.probleme",
        points: [
          "Nennen Sie Ihre Wohnung und die betroffene Nachbarwohnung.",
          "Beschreiben Sie den Lärm mit Uhrzeiten und Häufigkeit.",
          "Schildern Sie, was Sie bereits selbst unternommen haben.",
          "Bitten Sie um ein Einschreiten und um eine Rückmeldung.",
        ],
        addressee: "Hausverwaltung",
        register: "sie",
        level: "B2.1",
        format: "beschwerde",
        exam: "alltag",
        words: 150,
      },
      {
        text: "Sie möchten Ihren Mietvertrag ordentlich kündigen. Verfassen Sie das Kündigungsschreiben.",
        sub: "wohnen.vertrag",
        points: [
          "Nennen Sie im Betreff die Wohnung mit vollständiger Adresse.",
          "Erklären Sie eindeutig, dass Sie das Mietverhältnis kündigen.",
          "Nennen Sie den Termin, zu dem die Kündigung wirken soll.",
          "Bitten Sie um eine schriftliche Bestätigung des Kündigungstermins.",
          "Schlagen Sie Termine für die Wohnungsübergabe vor.",
        ],
        addressee: "Vermieterin",
        register: "sie",
        level: "C1",
        format: "kuendigung",
        exam: "alltag",
        words: 200,
      },
    ],
  },
  bank: {
    themeId: "bank",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an deine Bank: Bitte um einen Beratungstermin zur Eröffnung eines Girokontos und frage, welche Unterlagen du mitbringen musst.",
        sub: "bank.konto",
      },
      {
        text: "Schreibe eine kurze Nachricht an deine Bank: Deine Karte ist verloren gegangen. Bitte um eine Sperrung und eine neue Karte.",
        sub: "bank.karte",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Bank: Frage nach den Gebühren für Überweisungen ins Ausland.",
        sub: "bank.zahlung",
      },
      {
        text: "Schreibe eine kurze Mitteilung an deine Bank: Deine Adresse hat sich geändert. Nenne die neue Adresse und bitte um eine Bestätigung.",
        sub: "bank.konto",
      },
      {
        text: "Schreibe eine kurze Anfrage an die Bank: Du möchtest dein Kreditkartenlimit erhöhen. Nenne den gewünschten Betrag und begründe kurz.",
        sub: "bank.karte",
      },
      {
        text: "Schreibe eine kurze Nachricht an deine Bank: Eine Überweisung von letzter Woche ist noch nicht angekommen. Bitte um Prüfung.",
        sub: "bank.zahlung",
      },
      {
        text: "Schreibe eine kurze Anfrage an deine Bank: Du möchtest monatlich etwas sparen. Frage nach einem Beratungstermin zu Sparplänen.",
        sub: "bank.finanzen",
      },
      {
        text: "Schreibe eine kurze E-Mail an deine Bank: Frage nach den aktuellen Zinsen für Tagesgeld und Festgeld.",
        sub: "bank.finanzen",
      },
      {
        text: "Sie haben Ihre Bankkarte verloren. Schreiben Sie eine kurze Nachricht an Ihre Bank.",
        sub: "bank.karte",
        points: [
          "Sagen Sie, dass Sie Ihre Karte verloren haben.",
          "Nennen Sie Ihren Namen und Ihre Kontonummer.",
          "Bitten Sie darum, die Karte zu sperren.",
        ],
        addressee: "Kundenservice der Bank",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "alltag",
        words: 40,
      },
      {
        text: "Auf Ihrem Kontoauszug steht eine Abbuchung, die Sie nicht zuordnen können. Schreiben Sie an Ihre Bank.",
        sub: "bank.zahlung",
        points: [
          "Nennen Sie Ihre Kontonummer und den Buchungstag.",
          "Beschreiben Sie die Buchung mit Betrag und Empfänger.",
          "Erklären Sie, warum Sie die Buchung für unberechtigt halten.",
          "Bitten Sie um Prüfung und um eine schriftliche Rückmeldung.",
        ],
        addressee: "Kundenservice der Bank",
        register: "sie",
        level: "B2.1",
        format: "reklamation",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Ihre Bank hat Gebühren erhöht, über die Sie sich nicht ausreichend informiert fühlen. Schreiben Sie eine Beschwerde.",
        sub: "bank.konto",
        points: [
          "Nennen Sie im Betreff Ihre Kundennummer und das Thema.",
          "Stellen Sie dar, wann und wie Sie von der Änderung erfahren haben.",
          "Legen Sie sachlich dar, warum Sie die Information für unzureichend halten.",
          "Bitten Sie um eine Aufstellung der neuen Gebühren.",
          "Fordern Sie eine schriftliche Stellungnahme bis zu einem Datum.",
        ],
        addressee: "Beschwerdestelle der Bank",
        register: "sie",
        level: "C1",
        format: "beschwerde",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an deine Bank. Beschwere dich höflich über eine falsch gebuchte Lastschrift, bitte um eine Rückbuchung und frage nach, wie du solche Abbuchungen künftig verhindern kannst.",
        sub: "bank.zahlung",
      },
      {
        text: "Verfasse eine E-Mail an deine Bank: Beantrage einen kleinen Kredit für ein gebrauchtes Auto. Nenne den Betrag, beschreibe deine Einkommenssituation und frage nach Zinsen und Laufzeit.",
        sub: "bank.finanzen",
      },
      {
        text: "Schreibe eine Kündigung für dein altes Konto: Nenne das gewünschte Datum, das neue Konto für das Restguthaben und bitte um eine schriftliche Bestätigung der Auflösung.",
        sub: "bank.konto",
      },
      {
        text: "Verfasse eine Beschwerde an deine Bank: Trotz Termin hast du in der Filiale lange gewartet und keine klare Auskunft erhalten. Beschreibe den Ablauf und formuliere, was du erwartest.",
      },
      {
        text: "Schreibe eine E-Mail an die Bank, weil du eine Abbuchung nicht erkennst: Beschreibe die verdächtige Buchung, frage nach dem Empfänger und bitte darum, die Zahlung zu prüfen und gegebenenfalls zurückzuholen.",
        sub: "bank.zahlung",
      },
      {
        text: "Verfasse eine E-Mail an deine Bank: Du möchtest dein Einzelkonto in ein Gemeinschaftskonto umwandeln. Erkläre die Situation und frage nach Unterlagen und Ablauf.",
        sub: "bank.konto",
      },
      {
        text: "Schreibe eine E-Mail an deine Bank: Deine Kartenzahlung wurde im Ausland abgelehnt, obwohl das Konto gedeckt war. Beschreibe die Situation und bitte um Klärung und eine Lösung für die Zukunft.",
        sub: "bank.karte",
      },
      {
        text: "Verfasse eine Nachricht an den Bank-Support: Du kommst nicht mehr ins Online-Banking, die App verlangt eine neue Freigabe. Beschreibe das Problem und frage nach den Schritten zur Entsperrung.",
        sub: "bank.karte",
      },
      {
        text: "Schreibe eine E-Mail an deine Bankberaterin: Du möchtest für deine Kinder langfristig Geld anlegen. Beschreibe deine Situation, nenne den monatlichen Betrag und bitte um zwei konkrete Vorschläge.",
        sub: "bank.finanzen",
      },
      {
        text: "Sie möchten ein Konto eröffnen. Schreiben Sie eine E-Mail an die Bank.",
        sub: "bank.konto",
        points: [
          "Sagen Sie, welches Konto Sie möchten.",
          "Stellen Sie sich kurz vor.",
          "Fragen Sie nach den Unterlagen.",
          "Bitten Sie um einen Termin.",
        ],
        addressee: "Bankfiliale, Kundenberatung",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Sie möchten Ihr Konto bei Ihrer bisherigen Bank auflösen. Verfassen Sie das Kündigungsschreiben.",
        sub: "bank.konto",
        points: [
          "Nennen Sie im Betreff Ihre Kontonummer.",
          "Erklären Sie eindeutig, dass Sie das Konto kündigen.",
          "Nennen Sie den gewünschten Auflösungstermin.",
          "Geben Sie an, wohin ein Restguthaben überwiesen werden soll.",
          "Bitten Sie um eine schriftliche Bestätigung.",
        ],
        addressee: "Kundenservice der Bank",
        register: "sie",
        level: "B2.1",
        format: "kuendigung",
        exam: "alltag",
        words: 150,
      },
      {
        text: "In einem Forum wird diskutiert, ob Bargeld langfristig verschwinden sollte. Schreiben Sie einen Beitrag.",
        sub: "bank.finanzen",
        points: [
          "Beschreiben Sie die Entwicklung des bargeldlosen Bezahlens.",
          "Analysieren Sie, welche Gruppen ein Ende des Bargelds benachteiligen würde.",
          "Wägen Sie Bequemlichkeit gegen Datenschutz ab.",
          "Entkräften Sie ein Gegenargument.",
          "Ziehen Sie ein begründetes Fazit.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "forumsbeitrag",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  bildung: {
    themeId: "bildung",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an eine Sprachschule: Frage nach einem passenden Kurs für dein Niveau, nach den Kosten und nach dem nächsten Kursbeginn.",
        sub: "bildung.sprachkurs",
      },
      {
        text: "Schreibe eine kurze E-Mail an deine Kursleiterin: Du kannst am Donnerstag nicht zum Unterricht kommen. Frage nach den Hausaufgaben.",
        sub: "bildung.sprachkurs",
      },
      {
        text: "Schreibe eine kurze Anfrage an eine Volkshochschule: Frage, ob im Kurs noch Plätze frei sind und wie du dich anmelden kannst.",
      },
      {
        text: "Schreibe eine kurze E-Mail an das Prüfungszentrum: Frage nach dem nächsten Termin für die B2-Prüfung und den Kosten.",
        sub: "bildung.pruefung",
      },
      {
        text: "Schreibe eine kurze Bitte an deinen Arbeitgeber: Frage, ob du für eine Fortbildung am Freitag frei bekommen kannst.",
        sub: "bildung.weiterbildung",
      },
      {
        text: "Schreibe eine kurze E-Mail an die Anerkennungsstelle: Frage nach dem Stand deines Verfahrens und nenne dein Aktenzeichen.",
        sub: "bildung.anerkennung",
      },
      {
        text: "Schreibe eine kurze Anfrage an die Anerkennungsstelle: Frage, ob dein Zeugnis übersetzt und beglaubigt sein muss und wer das machen darf.",
        sub: "bildung.anerkennung",
      },
      {
        text: "Schreibe eine kurze E-Mail an das Prüfungszentrum: Du warst krank und hast die Prüfung verpasst. Frage, ob du sie nachholen kannst.",
        sub: "bildung.pruefung",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine Kollegin: Empfiehl ihr deinen Computerkurs und erkläre in einem Satz, warum er sich lohnt.",
        sub: "bildung.weiterbildung",
      },
      {
        text: "Sie können nächste Woche nicht zum Deutschkurs kommen. Schreiben Sie eine kurze E-Mail.",
        sub: "bildung.sprachkurs",
        points: [
          "Entschuldigen Sie sich.",
          "Nennen Sie den Grund.",
          "Fragen Sie nach den Hausaufgaben.",
        ],
        addressee: "Kursleiterin, Frau Berger",
        register: "sie",
        level: "B1.2",
        format: "email_halbformell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Sie möchten sich für eine Weiterbildung anmelden, die Ihr Arbeitgeber bezahlen soll. Schreiben Sie an die Personalabteilung.",
        sub: "bildung.weiterbildung",
        points: [
          "Nennen Sie die Weiterbildung mit Titel und Zeitraum.",
          "Begründen Sie den Nutzen für Ihre Tätigkeit.",
          "Nennen Sie die Kosten und den Zeitaufwand.",
          "Bitten Sie um Kostenübernahme und um eine Rückmeldung.",
        ],
        addressee: "Personalabteilung, Herr Baumann",
        register: "sie",
        level: "B2.1",
        format: "antrag",
        exam: "telc_b2_beruf",
        words: 100,
      },
      {
        text: "Ihr im Ausland erworbener Abschluss wurde nur teilweise anerkannt. Schreiben Sie an die Anerkennungsstelle.",
        sub: "bildung.anerkennung",
        points: [
          "Nennen Sie im Betreff das Aktenzeichen und den Bescheid mit Datum.",
          "Stellen Sie Ihren Abschluss und Ihre Berufserfahrung sachlich dar.",
          "Legen Sie dar, welche Gleichwertigkeit aus Ihrer Sicht übersehen wurde.",
          "Kündigen Sie ergänzende Nachweise an.",
          "Bitten Sie um eine erneute Prüfung.",
        ],
        addressee: "Anerkennungsstelle",
        register: "sie",
        level: "C1",
        format: "widerspruch",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an eine zuständige Stelle. Bitte um die Anerkennung deines ausländischen Abschlusses, erkläre deinen bisherigen Werdegang und frage nach den nötigen Unterlagen und dem Ablauf des Verfahrens.",
        sub: "bildung.anerkennung",
      },
      {
        text: "Verfasse eine E-Mail an eine Bildungseinrichtung: Bitte um ein Zertifikat über deinen abgeschlossenen Kurs, erkläre, wofür du es brauchst, und frage, wie lange die Ausstellung dauert.",
        sub: "bildung.pruefung",
      },
      {
        text: "Schreibe eine Bewerbung für ein Stipendium oder eine Kursförderung: Stelle dich vor, beschreibe deine Ziele und begründe, warum die Förderung dir helfen würde.",
        sub: "bildung.weiterbildung",
      },
      {
        text: "Verfasse eine E-Mail an deinen Arbeitgeber: Schlage eine Weiterbildung vor, die du machen möchtest. Beschreibe Inhalt, Dauer und Kosten und erkläre den Nutzen für deine Arbeit.",
        sub: "bildung.weiterbildung",
      },
      {
        text: "Schreibe eine höfliche Beschwerde an eine Sprachschule: Der Kurs ist oft ausgefallen und der Ersatzunterricht fehlt. Beschreibe die Situation und schlage eine Lösung vor, zum Beispiel eine Erstattung.",
        sub: "bildung.sprachkurs",
      },
      {
        text: "Verfasse eine E-Mail an die zuständige Kammer: Frage, welche Nachqualifizierung dir für die volle Anerkennung fehlt, wie lange sie dauert und was sie kostet.",
        sub: "bildung.anerkennung",
      },
      {
        text: "Schreibe eine E-Mail an das Prüfungszentrum: Du möchtest Einsicht in deine Prüfung beantragen. Erkläre, warum, und frage nach Termin und Ablauf der Einsicht.",
        sub: "bildung.pruefung",
      },
      {
        text: "Verfasse eine E-Mail an deine Sprachschule: Der Kurs ist für dich zu leicht. Beschreibe, was du schon kannst, und bitte um einen Wechsel in die nächste Stufe mit einem Einstufungstest.",
        sub: "bildung.sprachkurs",
      },
      {
        text: "Eine Freundin möchte auch Deutsch lernen. Schreiben Sie ihr eine E-Mail über Ihren Kurs.",
        sub: "bildung.sprachkurs",
        points: [
          "Erzählen Sie, wo Sie lernen.",
          "Beschreiben Sie, wie der Unterricht abläuft.",
          "Sagen Sie, was Ihnen gut gefällt.",
          "Schlagen Sie vor, gemeinsam zu lernen.",
        ],
        addressee: "Freundin Amina",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird gefragt, ob Sprachkurse neben der Arbeit realistisch sind. Schreiben Sie einen Beitrag.",
        sub: "bildung.sprachkurs",
        points: [
          "Äußern Sie Ihre Meinung.",
          "Beschreiben Sie, wie Sie Arbeit und Lernen verbinden.",
          "Nennen Sie die größte Schwierigkeit.",
          "Geben Sie zwei konkrete Tipps. Denken Sie an Einleitung und Schluss.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Berufliche Weiterbildung wird gefordert, findet aber meist in der Freizeit statt. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "bildung.weiterbildung",
        points: [
          "Beschreiben Sie die Erwartung an lebenslanges Lernen.",
          "Analysieren Sie, wer Zeit und Kosten trägt.",
          "Vergleichen Sie den Nutzen für Betrieb und Beschäftigte.",
          "Räumen Sie einen Einwand ein.",
          "Formulieren Sie ein Fazit mit einer konkreten Forderung.",
        ],
        addressee: "die Fachöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  einkaufen: {
    themeId: "einkaufen",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an einen Onlineshop: Ein Artikel ist beschädigt angekommen. Beschreibe das Problem und frage nach Umtausch oder Erstattung.",
        sub: "einkaufen.umtausch",
      },
      {
        text: "Schreibe eine kurze E-Mail an einen Onlineshop: Frage nach dem Stand deiner Bestellung und nenne die Bestellnummer.",
        sub: "einkaufen.online",
      },
      {
        text: "Schreibe eine kurze Nachricht an ein Geschäft: Frage, ob ein bestimmter Artikel vorrätig ist und ob er zurückgelegt werden kann.",
      },
      {
        text: "Schreibe eine kurze E-Mail an den Kundenservice: Du möchtest eine Bestellung stornieren. Nenne die Bestellnummer und den Grund.",
        sub: "einkaufen.online",
      },
      {
        text: "Schreibe eine kurze Anfrage an einen Onlineshop: Ein Gutscheincode funktioniert nicht. Beschreibe das Problem und bitte um Hilfe.",
        sub: "einkaufen.online",
      },
      {
        text: "Schreibe eine kurze E-Mail an deinen Supermarkt: Frage, ob ein Produkt wieder ins Sortiment kommt, das du nicht mehr findest.",
        sub: "einkaufen.supermarkt",
      },
      {
        text: "Schreibe eine kurze Nachricht an den Markt: An der Kasse wurde der Angebotspreis nicht berechnet. Frage, wie du den Unterschied zurückbekommst.",
        sub: "einkaufen.supermarkt",
      },
      {
        text: "Schreibe eine kurze Anfrage an ein Modegeschäft: Frage, ob es die Jacke aus dem Schaufenster auch in Größe M gibt.",
        sub: "einkaufen.kleidung",
      },
      {
        text: "Schreibe eine kurze E-Mail an einen Onlineshop: Frage, wie die Hose ausfällt und welche Größe sie bei deinen Maßen empfehlen.",
        sub: "einkaufen.kleidung",
      },
      {
        text: "Schreibe eine kurze Nachricht an ein Geschäft: Du möchtest ein Geschenk ohne Kassenbon umtauschen. Frage, ob das möglich ist.",
        sub: "einkaufen.umtausch",
      },
      {
        text: "Sie möchten eine online bestellte Jacke umtauschen. Schreiben Sie eine kurze E-Mail.",
        sub: "einkaufen.umtausch",
        points: [
          "Nennen Sie Ihre Bestellnummer.",
          "Sagen Sie, was Sie umtauschen möchten und warum.",
          "Fragen Sie, wie Sie die Ware zurücksenden.",
        ],
        addressee: "Kundenservice des Onlineshops",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Ein gekauftes Gerät ist nach kurzer Zeit defekt. Schreiben Sie eine Reklamation.",
        sub: "einkaufen.umtausch",
        points: [
          "Nennen Sie Rechnungsnummer und Kaufdatum.",
          "Beschreiben Sie den Defekt genau.",
          "Erklären Sie, was Sie bereits versucht haben.",
          "Fordern Sie Reparatur oder Ersatz und nennen Sie eine Frist.",
        ],
        addressee: "Kundenservice des Händlers",
        register: "sie",
        level: "B2.1",
        format: "reklamation",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Sie möchten einen Online-Kauf widerrufen, der Shop reagiert nicht. Schreiben Sie ein förmliches Schreiben.",
        sub: "einkaufen.online",
        points: [
          "Nennen Sie im Betreff Bestellnummer und Bestelldatum.",
          "Erklären Sie ausdrücklich, dass Sie den Kauf widerrufen.",
          "Nehmen Sie auf Ihre bisherigen erfolglosen Kontaktversuche Bezug.",
          "Fordern Sie die Rückzahlung bis zu einem konkreten Datum.",
          "Bitten Sie um eine Bestätigung des Widerrufs.",
        ],
        addressee: "Kundenservice des Onlineshops",
        register: "sie",
        level: "C1",
        format: "widerspruch",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle Reklamations-E-Mail an einen Onlineshop. Erkläre, welchen Artikel du bestellt hast und was mit der Lieferung nicht stimmt, nenne deine Bestellnummer und bitte höflich um eine Erstattung oder einen Ersatz mit einer klaren Frist.",
        sub: "einkaufen.umtausch",
      },
      {
        text: "Verfasse eine E-Mail an einen Onlineshop: Du hast einen Artikel zurückgeschickt, aber nach drei Wochen noch keine Erstattung erhalten. Beschreibe den Fall mit Daten, nenne die Sendungsnummer und setze eine Frist.",
        sub: "einkaufen.online",
      },
      {
        text: "Schreibe eine Beschwerde an einen Supermarkt: An der Kasse wurde dir ein falscher Preis berechnet, und das Personal war unfreundlich. Beschreibe die Situation und formuliere deine Erwartung.",
        sub: "einkaufen.supermarkt",
      },
      {
        text: "Verfasse eine Anfrage an ein Möbelhaus: Du interessierst dich für eine Einbauküche. Beschreibe deine Wohnung und deine Wünsche und bitte um einen Beratungstermin mit Kostenvoranschlag.",
      },
      {
        text: "Schreibe eine E-Mail an einen Händler: Ein gekauftes Gerät ist nach vier Monaten kaputt. Berufe dich auf die Gewährleistung, beschreibe den Defekt und fordere Reparatur oder Ersatz.",
        sub: "einkaufen.umtausch",
      },
      {
        text: "Verfasse eine E-Mail an einen Onlineshop: Das Paket gilt als zugestellt, ist aber nie angekommen. Beschreibe den Fall, nenne die Sendungsnummer und bitte um Nachforschung oder Ersatz.",
        sub: "einkaufen.online",
      },
      {
        text: "Schreibe eine E-Mail an die Filialleitung deines Supermarkts: Lobe das Personal, kritisiere die langen Schlangen am Abend und schlage eine Lösung vor, zum Beispiel eine zweite Kasse ab 17 Uhr.",
        sub: "einkaufen.supermarkt",
      },
      {
        text: "Verfasse eine Reklamation an ein Modegeschäft: Der Pullover ist nach der ersten Wäsche eingelaufen, obwohl du die Pflegehinweise beachtet hast. Fordere Umtausch oder Erstattung.",
        sub: "einkaufen.kleidung",
      },
      {
        text: "Schreibe eine E-Mail an einen Schuhhändler: Die bestellten Schuhe drücken trotz richtiger Größe. Frage nach einem Umtausch in ein anderes Modell und beschreibe, was dir wichtig ist.",
        sub: "einkaufen.kleidung",
      },
      {
        text: "Sie haben im Supermarkt etwas Wichtiges nicht gefunden. Schreiben Sie eine E-Mail an den Markt.",
        sub: "einkaufen.supermarkt",
        points: [
          "Sagen Sie, in welchem Markt Sie waren.",
          "Beschreiben Sie, was Sie gesucht haben.",
          "Fragen Sie, ob es das Produkt wieder geben wird.",
          "Bedanken Sie sich für die Antwort.",
        ],
        addressee: "Marktleitung",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Eine Lieferung ist beschädigt angekommen. Schreiben Sie an den Onlineshop.",
        sub: "einkaufen.online",
        points: [
          "Nennen Sie Bestellnummer und Lieferdatum.",
          "Beschreiben Sie den Schaden an Verpackung und Ware.",
          "Erklären Sie, wie Sie den Schaden festgestellt haben.",
          "Fordern Sie Ersatz und fragen Sie nach dem Rücksendeverfahren.",
        ],
        addressee: "Kundenservice des Onlineshops",
        register: "sie",
        level: "B2.1",
        format: "reklamation",
        exam: "alltag",
        words: 150,
      },
      {
        text: "Der Onlinehandel verdrängt Geschäfte in den Innenstädten. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "einkaufen.online",
        points: [
          "Beschreiben Sie die Entwicklung.",
          "Analysieren Sie die Folgen für kleinere Städte.",
          "Wägen Sie Preisvorteile gegen den Verlust von Nahversorgung ab.",
          "Entkräften Sie ein Gegenargument.",
          "Ziehen Sie ein Fazit mit einem Vorschlag.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "forumsbeitrag",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  essen: {
    themeId: "essen",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an ein Restaurant: Reserviere einen Tisch für vier Personen, nenne Datum und Uhrzeit und frage nach vegetarischen Gerichten.",
        sub: "essen.restaurant",
      },
      {
        text: "Schreibe eine kurze Nachricht an ein Restaurant: Sage deine Reservierung für heute Abend ab und entschuldige dich.",
        sub: "essen.restaurant",
      },
      {
        text: "Schreibe eine kurze E-Mail an einen Lieferdienst: Deine Bestellung kam kalt und unvollständig an. Bitte um eine Lösung.",
        sub: "essen.bestellen",
      },
      {
        text: "Schreibe eine kurze Frage an ein Restaurant: Gibt es Gerichte ohne Gluten? Du möchtest am Samstag mit vier Personen kommen.",
        sub: "essen.bestellen",
      },
      {
        text: "Schreibe eine kurze Dankesnachricht an ein Restaurant nach einer Feier: Lobe Essen und Service und kündige an wiederzukommen.",
      },
      {
        text: "Schreibe eine kurze E-Mail an ein Restaurant: Auf deiner Rechnung steht ein Gericht, das ihr nicht bestellt habt. Bitte um eine Korrektur.",
        sub: "essen.bezahlen",
      },
      {
        text: "Schreibe eine kurze Frage an ein Restaurant: Kann man bei euch getrennt und mit Karte zahlen? Ihr kommt am Freitag mit acht Personen.",
        sub: "essen.bezahlen",
      },
      {
        text: "Schreibe eine kurze Nachricht an einen Freund: Bitte ihn um sein Rezept für die Lasagne vom Wochenende und frage nach den wichtigsten Zutaten.",
        sub: "essen.kochen",
      },
      {
        text: "Schreibe eine kurze Nachricht in die Nachbarschaftsgruppe: Dir fehlt eine Zutat fürs Abendessen. Frage, ob dir jemand aushelfen kann.",
        sub: "essen.kochen",
      },
      {
        text: "Sie möchten für Samstag einen Tisch reservieren. Schreiben Sie eine kurze E-Mail.",
        sub: "essen.restaurant",
        points: [
          "Nennen Sie Tag und Uhrzeit.",
          "Sagen Sie, für wie viele Personen.",
          "Bitten Sie um eine Bestätigung.",
        ],
        addressee: "Restaurant Sonnenhof",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Bei einer Feier in einem Restaurant wurde eine bestellte Leistung nicht erbracht. Schreiben Sie eine Beschwerde.",
        sub: "essen.bezahlen",
        points: [
          "Nennen Sie Datum und Anlass Ihres Besuchs.",
          "Beschreiben Sie sachlich, was nicht wie vereinbart war.",
          "Erklären Sie, wie Sie vor Ort reagiert haben.",
          "Formulieren Sie, welche Lösung Sie erwarten.",
        ],
        addressee: "Restaurantleitung",
        register: "sie",
        level: "B2.1",
        format: "beschwerde",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Sie organisieren ein Essen für Kolleginnen und Kollegen mit sehr unterschiedlichen Ernährungsweisen. Schreiben Sie an das Restaurant.",
        sub: "essen.bestellen",
        points: [
          "Nennen Sie Termin, Personenzahl und Anlass.",
          "Legen Sie die Anforderungen an das Menü präzise dar.",
          "Fragen Sie gezielt nach Allergenen und Alternativen.",
          "Bitten Sie um einen Menüvorschlag mit Preisen bis zu einem Datum.",
        ],
        addressee: "Restaurantleitung",
        register: "sie",
        level: "C1",
        format: "email_formell",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an ein Restaurant. Reserviere einen Tisch für eine Feier, nenne die Personenzahl und den Anlass, frage nach einem Menü mit vegetarischen und veganen Optionen und bitte um eine Bestätigung der Reservierung.",
        sub: "essen.restaurant",
      },
      {
        text: "Verfasse eine E-Mail an einen Caterer: Hole ein Angebot für eine Firmenfeier mit 30 Personen ein. Beschreibe Anlass, Ort und Termin, nenne Wünsche zum Essen und frage nach Preisen pro Person.",
        sub: "essen.bestellen",
      },
      {
        text: "Schreibe eine Beschwerde an ein Restaurant: Bei eurem Besuch gestern habt ihr sehr lange gewartet und ein Gericht war nicht in Ordnung. Beschreibe den Abend sachlich und formuliere deine Erwartung.",
        sub: "essen.restaurant",
      },
      {
        text: "Verfasse eine Einladung an dein Team zu einem gemeinsamen Essen: Nenne Anlass, Restaurant, Datum und Uhrzeit, erkläre, wer die Kosten übernimmt, und bitte um Rückmeldung mit Essenswünschen.",
      },
      {
        text: "Schreibe eine E-Mail an einen Lieferdienst: Du wurdest doppelt belastet. Beschreibe die Bestellung, nenne die Zahlungsdaten und bitte um die Rückerstattung des doppelten Betrags.",
        sub: "essen.bezahlen",
      },
      {
        text: "Verfasse eine E-Mail an einen Partyservice: Bestelle Fingerfood für 15 Personen, nenne Datum und Uhrzeit, beschreibe Allergien im Team und frage, bis wann du die Bestellung ändern kannst.",
        sub: "essen.bestellen",
      },
      {
        text: "Schreibe eine E-Mail an ein Restaurant nach einer Firmenfeier: Bitte um eine korrigierte Rechnung mit Firmenanschrift und getrennt ausgewiesenen Getränken, damit die Buchhaltung sie akzeptiert.",
        sub: "essen.bezahlen",
      },
      {
        text: "Verfasse eine Nachricht an deine Freundesgruppe: Lade zu einem gemeinsamen Kochabend ein. Schlage ein Menü vor, verteile, wer welche Zutaten mitbringt, und nenne Ort und Uhrzeit.",
        sub: "essen.kochen",
      },
      {
        text: "Schreibe eine E-Mail an eine Kochschule: Frage nach einem Anfängerkurs für die deutsche Küche, nach Terminen und Preis und ob Zutaten und Schürze gestellt werden.",
        sub: "essen.kochen",
      },
      {
        text: "Sie möchten Freunde zum Essen einladen. Schreiben Sie eine E-Mail.",
        sub: "essen.restaurant",
        points: [
          "Laden Sie ein und nennen Sie den Anlass.",
          "Nennen Sie Tag, Uhrzeit und Ort.",
          "Fragen Sie, ob jemand etwas nicht isst.",
          "Bitten Sie um eine kurze Antwort.",
        ],
        addressee: "Freundeskreis",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird über Trinkgeld in Deutschland diskutiert. Schreiben Sie einen Beitrag.",
        sub: "essen.bezahlen",
        points: [
          "Äußern Sie Ihre Meinung zum Trinkgeld.",
          "Begründen Sie Ihre Position.",
          "Beschreiben Sie, wie Sie selbst vorgehen.",
          "Nennen Sie ein Argument der Gegenseite.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Lieferdienste verändern, wie und wo wir essen. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "essen.kochen",
        points: [
          "Beschreiben Sie die Entwicklung.",
          "Analysieren Sie die Folgen für Restaurants und für Fahrerinnen und Fahrer.",
          "Wägen Sie Bequemlichkeit gegen Arbeitsbedingungen ab.",
          "Räumen Sie ein Gegenargument ein.",
          "Formulieren Sie ein begründetes Fazit.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "forumsbeitrag",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  mobilitaet: {
    themeId: "mobilitaet",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an den Verkehrsverbund: Du hast wegen einer Verspätung deinen Anschluss verpasst und möchtest die Kosten für ein Ersatzticket zurück.",
        sub: "mobilitaet.oepnv",
      },
      {
        text: "Schreibe eine kurze E-Mail an den Kundenservice der Bahn: Frage, wie du dein Monatsticket kündigen kannst.",
        sub: "mobilitaet.ticket",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine Fahrschule: Frage nach den Preisen für den Führerschein Klasse B und nach freien Terminen.",
        sub: "mobilitaet.auto",
      },
      {
        text: "Schreibe eine kurze E-Mail an eine Autowerkstatt: Bitte um einen Termin für die Inspektion und nenne dein Automodell.",
        sub: "mobilitaet.auto",
      },
      {
        text: "Schreibe eine kurze Meldung an den Verkehrsverbund: Der Fahrkartenautomat am Bahnhof ist defekt. Beschreibe das Problem.",
        sub: "mobilitaet.ticket",
      },
      {
        text: "Schreibe eine kurze Nachricht an den Verkehrsverbund: Frage, welche Linie am Wochenende zum Flughafen fährt und wie oft sie kommt.",
        sub: "mobilitaet.oepnv",
      },
      {
        text: "Schreibe eine kurze Nachricht an einen Besucher: Beschreibe den Weg vom Bahnhof zu deiner Wohnung in drei einfachen Schritten.",
        sub: "mobilitaet.wegbeschreibung",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine Kollegin: Erkläre ihr, wo sie am Gebäude klingeln muss und wie sie den Besprechungsraum findet.",
        sub: "mobilitaet.wegbeschreibung",
      },
      {
        text: "Sie haben im Zug Ihre Tasche vergessen. Schreiben Sie eine kurze E-Mail an den Fundservice.",
        sub: "mobilitaet.oepnv",
        points: [
          "Nennen Sie Zug, Datum und Uhrzeit.",
          "Beschreiben Sie die Tasche.",
          "Fragen Sie, wie Sie sie zurückbekommen.",
        ],
        addressee: "Fundservice der Bahn",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Ihr Zug hatte erhebliche Verspätung und Sie haben einen Anschluss verpasst. Schreiben Sie an den Kundenservice.",
        sub: "mobilitaet.ticket",
        points: [
          "Nennen Sie Verbindung, Datum und Buchungsnummer.",
          "Beschreiben Sie den Verlauf der Verspätung.",
          "Erklären Sie, welche Folgen die Verspätung für Sie hatte.",
          "Fragen Sie nach einer Entschädigung und dem weiteren Vorgehen.",
        ],
        addressee: "Kundenservice des Verkehrsunternehmens",
        register: "sie",
        level: "B2.1",
        format: "reklamation",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Sie haben ein erhöhtes Beförderungsentgelt erhalten, obwohl Sie eine gültige Zeitkarte besitzen. Schreiben Sie einen Einspruch.",
        sub: "mobilitaet.ticket",
        points: [
          "Nennen Sie im Betreff Vorgangsnummer und Datum der Kontrolle.",
          "Schildern Sie den Ablauf der Kontrolle sachlich.",
          "Legen Sie dar, warum die Forderung aus Ihrer Sicht unbegründet ist.",
          "Kündigen Sie an, einen Nachweis Ihrer Zeitkarte beizufügen.",
          "Bitten Sie um eine schriftliche Entscheidung.",
        ],
        addressee: "Verkehrsbetrieb, Kundenabteilung",
        register: "sie",
        level: "C1",
        format: "widerspruch",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle Beschwerde-E-Mail an ein Verkehrsunternehmen. Beschreibe, welche Verbindung du nutzen wolltest, wie es zur Verspätung kam und welche Folgen das hatte, und bitte höflich um eine Erstattung oder Entschädigung mit einer klaren Frist.",
        sub: "mobilitaet.oepnv",
      },
      {
        text: "Verfasse einen Antrag auf Erstattung bei der Bahn: Dein Zug fiel aus und du musstest ein Taxi nehmen. Beschreibe die Verbindung, verweise auf deine Belege und begründe deinen Anspruch.",
        sub: "mobilitaet.ticket",
      },
      {
        text: "Schreibe eine E-Mail an eine Autowerkstatt: Nach der Reparatur ist das Problem wieder aufgetreten. Beschreibe den Mangel, verweise auf die Rechnung und bitte um eine kostenlose Nachbesserung.",
        sub: "mobilitaet.auto",
      },
      {
        text: "Verfasse eine Anfrage an eine Autovermietung: Du brauchst für einen Umzug einen Transporter. Nenne Datum und Dauer und frage nach Preisen, Versicherung und Kaution.",
        sub: "mobilitaet.auto",
      },
      {
        text: "Schreibe eine Stellungnahme an deine Stadtverwaltung: Die Busverbindung in deinem Viertel ist schlecht. Beschreibe die Probleme, erkläre die Folgen für die Anwohner und schlage Verbesserungen vor.",
        sub: "mobilitaet.oepnv",
      },
      {
        text: "Verfasse eine E-Mail an den Verkehrsverbund: Du wurdest trotz gültigem Abo kontrolliert und sollst eine erhöhte Gebühr zahlen. Erkläre die Situation, verweise auf deine Abo-Nummer und bitte um Erlass der Gebühr.",
        sub: "mobilitaet.ticket",
      },
      {
        text: "Schreibe eine E-Mail an die Teilnehmenden eines Treffens: Beschreibe die Anreise mit Bahn und Auto, nenne Parkmöglichkeiten und erkläre den Weg vom Eingang zum Raum.",
        sub: "mobilitaet.wegbeschreibung",
      },
      {
        text: "Verfasse eine Nachricht an eine Freundin, die dich zum ersten Mal besucht: Beschreibe die beste Verbindung von ihrem Ort zu dir, wo sie umsteigen muss und wo du sie abholst.",
        sub: "mobilitaet.wegbeschreibung",
      },
      {
        text: "Ein Freund besucht Sie und weiß nicht, wie er zu Ihnen kommt. Schreiben Sie ihm eine E-Mail.",
        sub: "mobilitaet.wegbeschreibung",
        points: [
          "Erklären Sie, welche Bahn er nehmen soll.",
          "Beschreiben Sie, wo er umsteigen muss.",
          "Sagen Sie, wie lange die Fahrt dauert.",
          "Erklären Sie den Weg vom Bahnhof zu Ihnen.",
        ],
        addressee: "Freund Luca",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In Ihrer Stadt soll eine Buslinie gestrichen werden. Schreiben Sie an die Stadtverwaltung.",
        sub: "mobilitaet.oepnv",
        points: [
          "Nennen Sie die betroffene Linie.",
          "Beschreiben Sie, wer die Linie nutzt.",
          "Erklären Sie die Folgen der Streichung für den Alltag.",
          "Schlagen Sie eine Alternative vor und bitten Sie um Prüfung.",
        ],
        addressee: "Stadtverwaltung, Amt für Verkehr",
        register: "sie",
        level: "B2.1",
        format: "beschwerde",
        exam: "alltag",
        words: 150,
      },
      {
        text: "Städte schränken den Autoverkehr in Innenstädten zunehmend ein. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "mobilitaet.auto",
        points: [
          "Beschreiben Sie die Maßnahmen kurz.",
          "Analysieren Sie, wen sie entlasten und wen sie belasten.",
          "Wägen Sie Lebensqualität gegen Erreichbarkeit ab.",
          "Entkräften Sie ein Gegenargument.",
          "Ziehen Sie ein Fazit mit einer Empfehlung.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "forumsbeitrag",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  freizeit: {
    themeId: "freizeit",
    short: [
      {
        text: "Schreibe eine kurze Nachricht an einen Freund: Lade ihn zu einem gemeinsamen Ausflug am Wochenende ein und schlage Zeit und Treffpunkt vor.",
        sub: "freizeit.verabredung",
      },
      {
        text: "Schreibe eine kurze Absage an eine Freundin: Du kannst am Samstag doch nicht kommen. Entschuldige dich und schlage einen neuen Termin vor.",
        sub: "freizeit.verabredung",
      },
      {
        text: "Schreibe eine kurze Nachricht an einen Sportverein: Frage nach einem Probetraining und den Mitgliedsbeiträgen.",
        sub: "freizeit.hobbys",
      },
      {
        text: "Schreibe eine kurze Antwort auf eine Einladung: Bedanke dich, sage zu und frage, ob du etwas mitbringen sollst.",
        sub: "freizeit.verabredung",
      },
      {
        text: "Schreibe eine kurze Nachricht in eure Nachbarschaftsgruppe: Du organisierst ein Sommerfest im Hof. Nenne das Datum und bitte um Helfer.",
        sub: "freizeit.veranstaltung",
      },
      {
        text: "Schreibe eine kurze Nachricht an einen Fotokurs-Anbieter: Frage, ob der Kurs auch für Anfänger geeignet ist und welche Kamera du brauchst.",
        sub: "freizeit.hobbys",
      },
      {
        text: "Schreibe eine kurze Nachricht an einen neuen Nachbarn: Stelle dich vor, heiße ihn willkommen und biete Hilfe beim Ankommen an.",
        sub: "freizeit.smalltalk",
      },
      {
        text: "Schreibe eine kurze Nachricht an eine Bekannte nach einer Feier: Bedanke dich für den netten Abend und schlage vor, in Kontakt zu bleiben.",
        sub: "freizeit.smalltalk",
      },
      {
        text: "Schreibe eine kurze Frage an ein Konzertbüro: Gibt es noch Karten für Samstag, und ab wann ist Einlass?",
        sub: "freizeit.veranstaltung",
      },
      {
        text: "Sie können sich am Wochenende nicht mit Ihrer Freundin treffen. Schreiben Sie eine kurze Nachricht.",
        sub: "freizeit.verabredung",
        points: [
          "Sagen Sie ab und entschuldigen Sie sich.",
          "Nennen Sie den Grund.",
          "Schlagen Sie einen neuen Termin vor.",
        ],
        addressee: "Freundin Elif",
        register: "du",
        level: "B1.2",
        format: "nachricht",
        exam: "goethe_b1",
        words: 40,
      },
      {
        text: "Sie möchten in einem Verein mitmachen. Schreiben Sie eine E-Mail an den Vorstand.",
        sub: "freizeit.hobbys",
        points: [
          "Stellen Sie sich kurz vor.",
          "Erklären Sie, warum Sie mitmachen möchten.",
          "Fragen Sie nach Trainingszeiten und Beitrag.",
          "Bitten Sie um die Möglichkeit zum Probetraining.",
        ],
        addressee: "Vereinsvorstand, Herr Fischer",
        register: "sie",
        level: "B2.1",
        format: "email_halbformell",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Eine gebuchte Veranstaltung wurde kurzfristig abgesagt und Sie haben kein Geld zurückerhalten. Schreiben Sie an den Veranstalter.",
        sub: "freizeit.veranstaltung",
        points: [
          "Nennen Sie im Betreff Veranstaltung, Datum und Buchungsnummer.",
          "Stellen Sie den Ablauf der Absage sachlich dar.",
          "Nehmen Sie auf Ihre bisherigen Anfragen Bezug.",
          "Fordern Sie die Erstattung bis zu einem konkreten Datum.",
          "Bitten Sie um eine schriftliche Bestätigung.",
        ],
        addressee: "Veranstalter, Kundenservice",
        register: "sie",
        level: "C1",
        format: "beschwerde",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine Einladung an mehrere Freunde zu einer kleinen Feier. Nenne den Anlass, Datum und Ort, beschreibe kurz, was geplant ist, und bitte um eine Zu- oder Absage bis zu einem bestimmten Termin.",
        sub: "freizeit.veranstaltung",
      },
      {
        text: "Verfasse eine E-Mail an ein Fitnessstudio: Kündige deine Mitgliedschaft fristgerecht, nenne den gewünschten Kündigungstermin und bitte um eine schriftliche Bestätigung.",
        sub: "freizeit.hobbys",
      },
      {
        text: "Schreibe eine Nachricht an eine alte Freundin, die weit weg wohnt: Erzähle, was sich bei dir verändert hat, frage nach ihrem Leben und schlage ein Wiedersehen mit konkreten Ideen vor.",
        sub: "freizeit.verabredung",
      },
      {
        text: "Verfasse eine Anfrage an ein Ferienhaus: Du möchtest mit Freunden ein Wochenende buchen. Nenne Zeitraum und Personenzahl und frage nach Preis, Ausstattung und Stornobedingungen.",
      },
      {
        text: "Schreibe eine E-Mail an die Organisatoren eines Volkslaufs: Melde dich und zwei Freunde an, frage nach dem Ablauf und der Startzeit und ob man die Startnummer vorher abholen muss.",
        sub: "freizeit.veranstaltung",
      },
      {
        text: "Verfasse eine E-Mail an einen Verein: Du möchtest Mitglied werden. Stelle dich kurz vor, beschreibe deine Erfahrung und frage nach Trainingszeiten und Beitrag.",
        sub: "freizeit.hobbys",
      },
      {
        text: "Schreibe eine Nachricht an deine Freundesgruppe: Organisiere ein Wiedersehen. Schlage zwei Termine und einen Ort vor, frage nach Wünschen und bitte um Antwort bis Sonntag.",
        sub: "freizeit.verabredung",
      },
      {
        text: "Verfasse eine Nachricht an einen Arbeitskollegen, der umgezogen ist: Frage, wie das Einleben läuft, erzähle kurz Neuigkeiten aus dem Team und wünsche alles Gute.",
        sub: "freizeit.smalltalk",
      },
      {
        text: "Schreibe eine Nachricht an deine Sprachpartnerin: Erzähle, was du am Wochenende gemacht hast, stelle ihr zwei Fragen dazu und schlage das nächste Treffen vor.",
        sub: "freizeit.smalltalk",
      },
      {
        text: "Sie waren am Wochenende auf einem Fest. Schreiben Sie einem Freund eine E-Mail.",
        sub: "freizeit.veranstaltung",
        points: [
          "Erzählen Sie, wo Sie waren.",
          "Beschreiben Sie, was Ihnen gefallen hat.",
          "Erzählen Sie, wen Sie getroffen haben.",
          "Schlagen Sie vor, nächstes Mal zusammen hinzugehen.",
        ],
        addressee: "Freund Jonas",
        register: "du",
        level: "B1.2",
        format: "email_informell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "In einem Forum wird gefragt, wie man als Zugezogener neue Leute kennenlernt. Schreiben Sie einen Beitrag.",
        sub: "freizeit.smalltalk",
        points: [
          "Äußern Sie Ihre Meinung dazu, was am besten funktioniert.",
          "Beschreiben Sie eine eigene Erfahrung.",
          "Nennen Sie eine Schwierigkeit.",
          "Geben Sie zwei konkrete Tipps.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "B2.1",
        format: "forumsbeitrag",
        exam: "goethe_b2",
        words: 150,
      },
      {
        text: "Vereine finden immer schwerer ehrenamtliche Mitglieder. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "freizeit.hobbys",
        points: [
          "Beschreiben Sie die Entwicklung.",
          "Analysieren Sie mögliche Ursachen.",
          "Vergleichen Sie feste Mitgliedschaft mit projektbezogenem Engagement.",
          "Räumen Sie ein Gegenargument ein.",
          "Formulieren Sie ein Fazit mit einem Vorschlag.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "stellungnahme",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
  digitales: {
    themeId: "digitales",
    short: [
      {
        text: "Schreibe eine kurze E-Mail an deinen Internetanbieter: Deine Verbindung fällt ständig aus. Beschreibe das Problem und bitte um eine schnelle Lösung.",
        sub: "digitales.internet",
      },
      {
        text: "Schreibe eine kurze E-Mail an deinen Mobilfunkanbieter: Frage, warum deine Rechnung diesen Monat höher ist.",
        sub: "digitales.vertrag",
      },
      {
        text: "Schreibe eine kurze Nachricht an den Support eines Onlinedienstes: Du kommst nicht mehr in dein Konto. Bitte um Hilfe beim Zurücksetzen.",
        sub: "digitales.konto",
      },
      {
        text: "Schreibe eine kurze Anfrage an deinen Anbieter: Du ziehst um. Frage, wie du deinen Internetanschluss mitnehmen kannst.",
        sub: "digitales.vertrag",
      },
      {
        text: "Schreibe eine kurze E-Mail an einen Handyshop: Das neue Handy hängt sich oft auf. Frage, ob du es umtauschen kannst.",
        sub: "digitales.geraete",
      },
      {
        text: "Schreibe eine kurze Nachricht an deinen Anbieter: Das WLAN ist abends sehr langsam. Frage, woran das liegen kann.",
        sub: "digitales.internet",
      },
      {
        text: "Schreibe eine kurze Frage an einen Reparaturservice: Was kostet ein neues Display für dein Handymodell, und wie lange dauert die Reparatur?",
        sub: "digitales.geraete",
      },
      {
        text: "Schreibe eine kurze Nachricht an den Support: Du bekommst zu viele Werbe-Mails. Frage, wie du sie abbestellen kannst.",
        sub: "digitales.konto",
      },
      {
        text: "Ihr Internet funktioniert seit zwei Tagen nicht. Schreiben Sie eine kurze Nachricht an Ihren Anbieter.",
        sub: "digitales.internet",
        points: [
          "Nennen Sie Ihre Kundennummer.",
          "Beschreiben Sie das Problem.",
          "Bitten Sie um eine schnelle Lösung.",
        ],
        addressee: "Kundenservice des Anbieters",
        register: "sie",
        level: "B1.2",
        format: "nachricht",
        exam: "alltag",
        words: 40,
      },
      {
        text: "Ihr Internetanschluss ist seit Wochen deutlich langsamer als vereinbart. Schreiben Sie an Ihren Anbieter.",
        sub: "digitales.internet",
        points: [
          "Nennen Sie Kundennummer und Tarif.",
          "Beschreiben Sie die tatsächliche Leistung im Vergleich zur vereinbarten.",
          "Nehmen Sie auf frühere Störungsmeldungen Bezug.",
          "Fordern Sie eine Behebung bis zu einem konkreten Datum.",
        ],
        addressee: "Kundenservice des Anbieters",
        register: "sie",
        level: "B2.1",
        format: "beschwerde",
        exam: "alltag",
        words: 100,
      },
      {
        text: "Sie möchten Ihren Mobilfunkvertrag kündigen. Verfassen Sie das Kündigungsschreiben.",
        sub: "digitales.vertrag",
        points: [
          "Nennen Sie im Betreff Kundennummer und Rufnummer.",
          "Erklären Sie eindeutig, dass Sie den Vertrag kündigen.",
          "Nennen Sie den gewünschten Kündigungstermin.",
          "Bitten Sie um eine schriftliche Bestätigung mit Enddatum.",
          "Widersprechen Sie ausdrücklich einer stillschweigenden Verlängerung.",
        ],
        addressee: "Kundenservice des Mobilfunkanbieters",
        register: "sie",
        level: "C1",
        format: "kuendigung",
        exam: "alltag",
        words: 120,
      },
    ],
    long: [
      {
        text: "Verfasse eine formelle E-Mail an deinen Mobilfunk- oder Internetanbieter. Erkläre, seit wann und wie oft die Störung auftritt, welche Schritte du schon versucht hast, nenne deine Kundennummer und bitte um eine Lösung oder eine Minderung der Gebühr mit einer klaren Frist.",
        sub: "digitales.internet",
      },
      {
        text: "Verfasse eine Kündigung für deinen Handyvertrag: Kündige fristgerecht zum Vertragsende, nenne deine Rufnummer, widersprich einer automatischen Verlängerung und bitte um eine Bestätigung.",
        sub: "digitales.vertrag",
      },
      {
        text: "Schreibe eine E-Mail an deinen Anbieter: Widersprich einer Rechnung, auf der ein Dienst steht, den du nie bestellt hast. Beschreibe die Position, verlange eine Korrektur und eine Erklärung, wie es dazu kam.",
        sub: "digitales.vertrag",
      },
      {
        text: "Verfasse eine Anfrage an einen Anbieter: Vergleiche zwei Tarife, die für dich infrage kommen. Beschreibe dein Nutzungsverhalten und bitte um eine Empfehlung mit Preisen und Bedingungen.",
        sub: "digitales.vertrag",
      },
      {
        text: "Schreibe eine E-Mail an den Datenschutzbeauftragten eines Onlinedienstes: Bitte um Auskunft, welche Daten über dich gespeichert sind, und um die Löschung deines alten Kontos.",
        sub: "digitales.konto",
      },
      {
        text: "Verfasse eine E-Mail an deinen Anbieter: Nach dem Techniker-Termin ist das Internet immer noch instabil. Beschreibe die Messwerte, verweise auf den ersten Termin und fordere eine dauerhafte Lösung.",
        sub: "digitales.internet",
      },
      {
        text: "Schreibe eine E-Mail an den Hersteller-Support: Dein Laptop wird sehr heiß und geht aus. Beschreibe, wann das passiert und was du versucht hast, und frage nach Garantie und Reparatur.",
        sub: "digitales.geraete",
      },
      {
        text: "Verfasse eine Anfrage an einen Elektromarkt: Du suchst ein Tablet für Videotelefonie und Lern-Apps. Beschreibe, wofür du es brauchst, nenne dein Budget und bitte um zwei Empfehlungen.",
        sub: "digitales.geraete",
      },
      {
        text: "Schreibe eine E-Mail an einen Onlinedienst: Dein Konto wurde gesperrt und du weißt nicht, warum. Beschreibe, wann du dich zuletzt eingeloggt hast, und bitte um Entsperrung oder eine Erklärung.",
        sub: "digitales.konto",
      },
      {
        text: "Ihr Handy ist kaputt. Schreiben Sie eine E-Mail an den Laden, in dem Sie es gekauft haben.",
        sub: "digitales.geraete",
        points: [
          "Nennen Sie, wann Sie das Handy gekauft haben.",
          "Beschreiben Sie, was nicht funktioniert.",
          "Fragen Sie nach einer Reparatur.",
          "Fragen Sie, wie lange es dauert.",
        ],
        addressee: "Elektrofachmarkt, Kundenservice",
        register: "sie",
        level: "B1.2",
        format: "email_formell",
        exam: "goethe_b1",
        words: 80,
      },
      {
        text: "Sie vermuten, dass Ihr E-Mail-Konto von einer fremden Person genutzt wurde. Schreiben Sie an den Anbieter.",
        sub: "digitales.konto",
        points: [
          "Nennen Sie Ihre Kontodaten ohne Ihr Passwort.",
          "Beschreiben Sie die auffälligen Vorgänge mit Datum.",
          "Erklären Sie, welche Schritte Sie bereits unternommen haben.",
          "Bitten Sie um Sperrung und um Hinweise zur Wiederherstellung.",
        ],
        addressee: "Sicherheitsteam des Anbieters",
        register: "sie",
        level: "B2.1",
        format: "email_formell",
        exam: "alltag",
        words: 150,
      },
      {
        text: "Immer mehr Dienste sind nur noch digital erreichbar. Verfassen Sie einen Diskussionsbeitrag.",
        sub: "digitales.vertrag",
        points: [
          "Beschreiben Sie die Entwicklung.",
          "Analysieren Sie, wer dadurch ausgeschlossen wird.",
          "Wägen Sie Effizienz gegen Zugänglichkeit ab.",
          "Entkräften Sie ein Gegenargument.",
          "Ziehen Sie ein Fazit mit einer konkreten Forderung.",
        ],
        addressee: "die Forumsöffentlichkeit",
        register: "sie",
        level: "C1",
        format: "forumsbeitrag",
        exam: "goethe_c1",
        words: 200,
      },
    ],
  },
};
