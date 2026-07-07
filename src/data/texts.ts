import type { ReadingText } from "@/types";

/**
 * Lesen/Hören text bank (redesign Phase 4.3, audit rec #3).
 *
 * Short authentic-STYLE texts (all invented: names, numbers, addresses and
 * offices are fictitious) in the genres an intermediate learner actually
 * meets: Behörden letters, workplace emails, memos, announcements and
 * voicemail scripts. Each text carries an English gloss and two to three
 * German multiple-choice comprehension checks. Voicemail scripts double as
 * listening input via TTS in the 4.4 session block.
 *
 * Authorship note (data governance): every text is written in our own German,
 * pitched at the tagged CEFR band using the CoE level descriptors as the
 * calibration reference (cited in provenance, never reproduced). AI-drafted,
 * founder review pending: provenance rows start as review_status "draft".
 */
export const texts: ReadingText[] = [
  /* ---------------- Behörden & Ämter ---------------- */
  {
    id: "tx_behoerde_anmeldung_brief",
    kind: "letter",
    themeId: "behoerde",
    cefr: "B1.2",
    subThemeId: "behoerde.meldewesen",
    title: "Ihr Termin zur Anmeldung im Bürgeramt",
    titleEn: "Your appointment for address registration at the citizens' office",
    de: [
      "Sehr geehrte Frau Yilmaz,",
      "vielen Dank für Ihre Terminanfrage. Ihr Termin zur Anmeldung Ihrer neuen Wohnung findet am Dienstag, den 14. Juli, um 9:30 Uhr im Bürgeramt Mitte statt (Zimmer 204).",
      "Bitte bringen Sie folgende Unterlagen mit: Ihren Reisepass oder Personalausweis, die Wohnungsgeberbestätigung Ihres Vermieters und das ausgefüllte Anmeldeformular. Ohne diese Unterlagen können wir die Anmeldung nicht bearbeiten.",
      "Falls Sie den Termin nicht wahrnehmen können, sagen Sie ihn bitte spätestens 24 Stunden vorher online ab.",
      "Mit freundlichen Grüßen\nIhr Bürgeramt Mitte",
    ].join("\n\n"),
    en: [
      "Dear Ms Yilmaz,",
      "Thank you for your appointment request. Your appointment to register your new flat takes place on Tuesday, 14 July, at 9:30 in the Bürgeramt Mitte (room 204).",
      "Please bring the following documents: your passport or ID card, the landlord confirmation (Wohnungsgeberbestätigung) from your landlord, and the completed registration form. Without these documents we cannot process the registration.",
      "If you cannot attend the appointment, please cancel it online at least 24 hours in advance.",
      "Kind regards\nYour Bürgeramt Mitte",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_behoerde_anmeldung_brief_q1",
        question: "Was ist der Zweck des Termins?",
        options: [
          "Die Anmeldung einer neuen Wohnung",
          "Die Beantragung eines Reisepasses",
          "Die Verlängerung eines Visums",
        ],
        answer: "Die Anmeldung einer neuen Wohnung",
        explain: "The letter confirms a 'Termin zur Anmeldung Ihrer neuen Wohnung' (appointment to register the new flat).",
      },
      {
        id: "tx_behoerde_anmeldung_brief_q2",
        question: "Welche Unterlage kommt vom Vermieter?",
        options: [
          "Die Wohnungsgeberbestätigung",
          "Das Anmeldeformular",
          "Der Personalausweis",
        ],
        answer: "Die Wohnungsgeberbestätigung",
        explain: "The Wohnungsgeberbestätigung is explicitly 'Ihres Vermieters' (from your landlord).",
      },
      {
        id: "tx_behoerde_anmeldung_brief_q3",
        question: "Was soll Frau Yilmaz tun, wenn sie nicht kommen kann?",
        options: [
          "Den Termin spätestens 24 Stunden vorher online absagen",
          "Am selben Tag im Bürgeramt anrufen",
          "Ohne Absage zu einem späteren Termin kommen",
        ],
        answer: "Den Termin spätestens 24 Stunden vorher online absagen",
        explain: "The final paragraph asks her to cancel online at least 24 hours in advance.",
      },
    ],
  },
  {
    id: "tx_behoerde_unterlagen_brief",
    kind: "letter",
    themeId: "behoerde",
    cefr: "B2.1",
    subThemeId: "behoerde.antrag",
    title: "Ihr Antrag auf Wohngeld: fehlende Unterlagen",
    titleEn: "Your housing benefit application: missing documents",
    de: [
      "Sehr geehrter Herr Rahimi,",
      "wir haben Ihren Antrag auf Wohngeld vom 2. Juni erhalten. Nach Prüfung Ihrer Unterlagen stellen wir fest, dass noch zwei Nachweise fehlen: eine aktuelle Verdienstbescheinigung Ihres Arbeitgebers sowie eine Kopie Ihres Mietvertrags.",
      "Bitte reichen Sie die fehlenden Unterlagen bis zum 31. Juli bei uns ein. Sie können sie per Post schicken oder über das Online-Portal hochladen. Geben Sie dabei immer Ihr Aktenzeichen an: WG-2026-4471.",
      "Sollten die Unterlagen nicht fristgerecht eingehen, müssen wir Ihren Antrag ablehnen. In diesem Fall wäre ein neuer Antrag erforderlich.",
      "Für Rückfragen erreichen Sie uns montags bis freitags von 8 bis 12 Uhr unter der oben genannten Telefonnummer.",
      "Mit freundlichen Grüßen\nIhre Wohngeldstelle",
    ].join("\n\n"),
    en: [
      "Dear Mr Rahimi,",
      "We have received your housing benefit application of 2 June. After reviewing your documents, we find that two proofs are still missing: a current salary statement from your employer and a copy of your rental contract.",
      "Please submit the missing documents to us by 31 July. You can send them by post or upload them via the online portal. Always state your file number when doing so: WG-2026-4471.",
      "If the documents do not arrive within the deadline, we will have to reject your application. In that case a new application would be required.",
      "For questions you can reach us Monday to Friday from 8 to 12 at the phone number given above.",
      "Kind regards\nYour housing benefit office",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_behoerde_unterlagen_brief_q1",
        question: "Welche Unterlagen fehlen noch?",
        options: [
          "Eine Verdienstbescheinigung und eine Kopie des Mietvertrags",
          "Ein Reisepass und ein aktuelles Foto",
          "Eine Meldebescheinigung und ein Kontoauszug",
        ],
        answer: "Eine Verdienstbescheinigung und eine Kopie des Mietvertrags",
        explain: "Two proofs are named: a salary statement from the employer and a copy of the rental contract.",
      },
      {
        id: "tx_behoerde_unterlagen_brief_q2",
        question: "Was passiert, wenn die Unterlagen nicht bis zum 31. Juli eingehen?",
        options: [
          "Der Antrag wird abgelehnt",
          "Die Frist wird automatisch verlängert",
          "Das Amt ruft Herrn Rahimi an",
        ],
        answer: "Der Antrag wird abgelehnt",
        explain: "'Sollten die Unterlagen nicht fristgerecht eingehen, müssen wir Ihren Antrag ablehnen.'",
      },
      {
        id: "tx_behoerde_unterlagen_brief_q3",
        question: "Was muss Herr Rahimi beim Einreichen immer angeben?",
        options: [
          "Sein Aktenzeichen",
          "Seine Steuernummer",
          "Seine Kontonummer",
        ],
        answer: "Sein Aktenzeichen",
        explain: "The letter asks him to always state the file number (Aktenzeichen) WG-2026-4471.",
      },
    ],
  },

  /* ---------------- Termine & Planung ---------------- */
  {
    id: "tx_scheduling_email_verschiebung",
    kind: "email",
    themeId: "scheduling",
    cefr: "B1.2",
    title: "Verschiebung unseres Termins am Donnerstag",
    titleEn: "Rescheduling our Thursday appointment",
    de: [
      "Liebe Frau Krause,",
      "leider muss ich unseren Termin am Donnerstag um 14 Uhr verschieben. Bei uns ist kurzfristig eine wichtige Kundenpräsentation dazwischengekommen.",
      "Hätten Sie stattdessen am Freitag um 10 Uhr oder am Montag um 15 Uhr Zeit? Beide Termine wären bei mir möglich. Das Besprechungsthema bleibt gleich: die Planung der Schulung im September.",
      "Bitte geben Sie mir kurz Bescheid, welcher Termin für Sie besser passt. Vielen Dank für Ihr Verständnis!",
      "Viele Grüße\nTomas Berger",
    ].join("\n\n"),
    en: [
      "Dear Ms Krause,",
      "Unfortunately I have to postpone our appointment on Thursday at 2 pm. An important client presentation has come up at short notice on our side.",
      "Would you instead have time on Friday at 10 or on Monday at 3 pm? Both slots would work for me. The topic of the meeting stays the same: planning the training in September.",
      "Please let me know briefly which slot suits you better. Thank you for your understanding!",
      "Best regards\nTomas Berger",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_scheduling_email_verschiebung_q1",
        question: "Warum verschiebt Herr Berger den Termin?",
        options: [
          "Eine wichtige Kundenpräsentation ist dazwischengekommen",
          "Er ist krank geworden",
          "Frau Krause hat abgesagt",
        ],
        answer: "Eine wichtige Kundenpräsentation ist dazwischengekommen",
        explain: "He writes that an important client presentation came up at short notice.",
      },
      {
        id: "tx_scheduling_email_verschiebung_q2",
        question: "Welche neuen Termine schlägt er vor?",
        options: [
          "Freitag um 10 Uhr oder Montag um 15 Uhr",
          "Donnerstag um 14 Uhr oder Freitag um 16 Uhr",
          "Montag um 10 Uhr oder Dienstag um 15 Uhr",
        ],
        answer: "Freitag um 10 Uhr oder Montag um 15 Uhr",
        explain: "He offers Friday at 10 or Monday at 3 pm as alternatives.",
      },
      {
        id: "tx_scheduling_email_verschiebung_q3",
        question: "Worum geht es in der Besprechung?",
        options: [
          "Um die Planung einer Schulung",
          "Um eine Kundenpräsentation",
          "Um einen neuen Vertrag",
        ],
        answer: "Um die Planung einer Schulung",
        explain: "The topic stays the same: planning the training in September.",
      },
    ],
  },

  /* ---------------- Kundenkontakt ---------------- */
  {
    id: "tx_customer_email_reklamation",
    kind: "email",
    themeId: "customer",
    cefr: "B2.1",
    subThemeId: "customer.reklamation",
    title: "Ihre Reklamation vom 28. Juni, Auftragsnummer 88213",
    titleEn: "Your complaint of 28 June, order number 88213",
    de: [
      "Sehr geehrte Frau Winter,",
      "vielen Dank für Ihre Nachricht. Es tut uns leid, dass die gelieferten Regale beschädigt bei Ihnen angekommen sind. Das entspricht nicht unserem Qualitätsanspruch.",
      "Wir bieten Ihnen zwei Lösungen an: Entweder senden wir Ihnen innerhalb von fünf Werktagen kostenlos Ersatz, oder wir erstatten Ihnen den vollen Kaufpreis. Die beschädigte Ware müssen Sie in beiden Fällen nicht zurückschicken.",
      "Bitte teilen Sie uns bis zum 15. Juli mit, welche Lösung Sie bevorzugen. Als Entschuldigung für die Unannehmlichkeiten erhalten Sie außerdem einen Gutschein über 20 Euro für Ihre nächste Bestellung.",
      "Mit freundlichen Grüßen\nSandra Nowak, Kundenservice",
    ].join("\n\n"),
    en: [
      "Dear Ms Winter,",
      "Thank you for your message. We are sorry that the delivered shelves arrived damaged. That does not meet our quality standard.",
      "We offer you two solutions: either we send you a free replacement within five working days, or we refund the full purchase price. In both cases you do not need to send the damaged goods back.",
      "Please let us know by 15 July which solution you prefer. As an apology for the inconvenience you will also receive a 20 euro voucher for your next order.",
      "Kind regards\nSandra Nowak, customer service",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_customer_email_reklamation_q1",
        question: "Was war das Problem mit der Lieferung?",
        options: [
          "Die Regale kamen beschädigt an",
          "Die Regale kamen zu spät an",
          "Es wurden die falschen Regale geliefert",
        ],
        answer: "Die Regale kamen beschädigt an",
        explain: "The shelves arrived damaged ('beschädigt bei Ihnen angekommen').",
      },
      {
        id: "tx_customer_email_reklamation_q2",
        question: "Welche zwei Lösungen bietet die Firma an?",
        options: [
          "Kostenlosen Ersatz oder die Erstattung des Kaufpreises",
          "Eine Reparatur oder einen Preisnachlass",
          "Einen Umtausch im Geschäft oder eine Gutschrift",
        ],
        answer: "Kostenlosen Ersatz oder die Erstattung des Kaufpreises",
        explain: "Either a free replacement within five working days or a full refund.",
      },
      {
        id: "tx_customer_email_reklamation_q3",
        question: "Was bekommt Frau Winter als Entschuldigung?",
        options: [
          "Einen Gutschein über 20 Euro",
          "Kostenlosen Versand für ein Jahr",
          "Ein zusätzliches Regal geschenkt",
        ],
        answer: "Einen Gutschein über 20 Euro",
        explain: "As an apology she receives a 20 euro voucher for her next order.",
      },
    ],
  },

  /* ---------------- Besprechungen & Teamarbeit ---------------- */
  {
    id: "tx_meetings_memo_protokoll",
    kind: "memo",
    themeId: "meetings",
    cefr: "B2.1",
    subThemeId: "meetings.entscheidung",
    title: "Kurzprotokoll: Teambesprechung vom 3. Juli",
    titleEn: "Brief minutes: team meeting of 3 July",
    de: [
      "An alle Teammitglieder,",
      "hier die wichtigsten Ergebnisse unserer Besprechung von gestern.",
      "Erstens: Die neue Dienstplan-Software wird ab dem 1. August eingeführt. Alle Mitarbeitenden erhalten vorher eine einstündige Einführung, die Termine folgen per E-Mail.",
      "Zweitens: Die Frage der Homeoffice-Regelung wurde vertagt. Herr Schmid holt bis zur nächsten Sitzung die Position der Personalabteilung ein.",
      "Drittens: Frau Alvarez übernimmt ab sofort die Urlaubsplanung für das dritte Quartal. Bitte tragt eure Wünsche bis zum 10. Juli in die Liste im Intranet ein.",
      "Die nächste Besprechung findet am 17. Juli um 9 Uhr statt.",
      "Beste Grüße\nJana (Teamleitung)",
    ].join("\n\n"),
    en: [
      "To all team members,",
      "Here are the key outcomes of our meeting yesterday.",
      "First: the new shift-planning software will be introduced from 1 August. All staff will receive a one-hour introduction beforehand; the dates will follow by email.",
      "Second: the question of the home-office policy was postponed. Mr Schmid will obtain the HR department's position before the next meeting.",
      "Third: Ms Alvarez is taking over holiday planning for the third quarter with immediate effect. Please enter your requests in the list on the intranet by 10 July.",
      "The next meeting takes place on 17 July at 9 am.",
      "Best regards\nJana (team lead)",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_meetings_memo_protokoll_q1",
        question: "Ab wann wird die neue Dienstplan-Software eingeführt?",
        options: [
          "Ab dem 1. August",
          "Ab dem 10. Juli",
          "Ab dem 17. Juli",
        ],
        answer: "Ab dem 1. August",
        explain: "The software will be introduced from 1 August; the introductions happen before that.",
      },
      {
        id: "tx_meetings_memo_protokoll_q2",
        question: "Was wurde mit der Homeoffice-Regelung gemacht?",
        options: [
          "Die Entscheidung wurde vertagt",
          "Sie wurde beschlossen",
          "Sie wurde abgelehnt",
        ],
        answer: "Die Entscheidung wurde vertagt",
        explain: "The question was postponed ('vertagt'); HR's position is still being gathered.",
      },
      {
        id: "tx_meetings_memo_protokoll_q3",
        question: "Bis wann sollen die Urlaubswünsche eingetragen werden?",
        options: [
          "Bis zum 10. Juli",
          "Bis zum 1. August",
          "Bis zur nächsten Besprechung",
        ],
        answer: "Bis zum 10. Juli",
        explain: "Requests go into the intranet list by 10 July.",
      },
    ],
  },

  /* ---------------- Projektmanagement ---------------- */
  {
    id: "tx_project_memo_status",
    kind: "memo",
    themeId: "project",
    cefr: "B2.2",
    title: "Statusbericht: Projekt Kundenportal, Stand 30. Juni",
    titleEn: "Status report: customer portal project, as of 30 June",
    de: [
      "An die Projektbeteiligten,",
      "das Projekt liegt insgesamt im Zeitplan, allerdings mit einer Einschränkung. Die Entwicklung der Benutzeroberfläche ist abgeschlossen und wurde vom Auftraggeber abgenommen. Auch die Schnittstelle zur Kundendatenbank läuft stabil im Testbetrieb.",
      "Kritisch ist derzeit die Anbindung des Bezahlsystems: Der externe Dienstleister hat die Lieferung der Testumgebung um zwei Wochen verschoben. Dadurch verschiebt sich unsere interne Testphase auf Mitte August. Der Endtermin am 30. September ist nach aktueller Einschätzung trotzdem zu halten, sofern keine weiteren Verzögerungen eintreten.",
      "Nächste Schritte: Bis zum 11. Juli erstellt Frau Vogel einen angepassten Testplan. Herr Duman klärt mit dem Dienstleister einen verbindlichen Liefertermin.",
      "Rückfragen gern an die Projektleitung.",
    ].join("\n\n"),
    en: [
      "To the project stakeholders,",
      "Overall the project is on schedule, though with one caveat. Development of the user interface is complete and has been accepted by the client. The interface to the customer database is also running stably in test operation.",
      "Currently critical is the connection of the payment system: the external provider has postponed delivery of the test environment by two weeks. As a result our internal test phase moves to mid-August. According to the current assessment the end date of 30 September can still be met, provided no further delays occur.",
      "Next steps: by 11 July Ms Vogel will produce an adjusted test plan. Mr Duman will agree a binding delivery date with the provider.",
      "Questions welcome via the project lead.",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_project_memo_status_q1",
        question: "Welcher Teil des Projekts ist bereits abgenommen?",
        options: [
          "Die Benutzeroberfläche",
          "Das Bezahlsystem",
          "Der angepasste Testplan",
        ],
        answer: "Die Benutzeroberfläche",
        explain: "The UI development is complete and was accepted ('abgenommen') by the client.",
      },
      {
        id: "tx_project_memo_status_q2",
        question: "Warum ist das Bezahlsystem derzeit kritisch?",
        options: [
          "Der externe Dienstleister hat die Testumgebung um zwei Wochen verschoben",
          "Das Bezahlsystem ist im Test ausgefallen",
          "Der Auftraggeber hat das Bezahlsystem abgelehnt",
        ],
        answer: "Der externe Dienstleister hat die Testumgebung um zwei Wochen verschoben",
        explain: "The external provider postponed delivery of the test environment by two weeks.",
      },
      {
        id: "tx_project_memo_status_q3",
        question: "Was gilt nach aktueller Einschätzung für den Endtermin am 30. September?",
        options: [
          "Er ist zu halten, wenn nichts Weiteres passiert",
          "Er verschiebt sich auf Mitte August",
          "Er wurde bereits abgesagt",
        ],
        answer: "Er ist zu halten, wenn nichts Weiteres passiert",
        explain: "The end date can still be met, provided no further delays occur.",
      },
    ],
  },

  /* ---------------- Technologie & Digitalisierung ---------------- */
  {
    id: "tx_technology_ankuendigung_wartung",
    kind: "announcement",
    themeId: "technology",
    cefr: "B1.2",
    title: "Wartung der IT-Systeme am Samstag",
    titleEn: "Maintenance of the IT systems on Saturday",
    de: [
      "Liebe Kolleginnen und Kollegen,",
      "am kommenden Samstag, den 12. Juli, werden unsere IT-Systeme zwischen 8 und 16 Uhr gewartet. In dieser Zeit sind das E-Mail-Programm, das Kundenportal und die gemeinsamen Laufwerke nicht erreichbar.",
      "Bitte speichert alle offenen Dokumente bis Freitagabend und meldet euch aus allen Systemen ab. Nicht gespeicherte Änderungen können bei der Wartung verloren gehen.",
      "Ab Sonntagmorgen stehen alle Systeme wieder normal zur Verfügung. Bei Problemen nach der Wartung wendet euch bitte an den IT-Support unter der Durchwahl 4500.",
      "Euer IT-Team",
    ].join("\n\n"),
    en: [
      "Dear colleagues,",
      "Next Saturday, 12 July, our IT systems will be maintained between 8 am and 4 pm. During this time the email program, the customer portal and the shared drives will not be available.",
      "Please save all open documents by Friday evening and log out of all systems. Unsaved changes can be lost during the maintenance.",
      "From Sunday morning all systems will be available as normal again. For problems after the maintenance please contact IT support on extension 4500.",
      "Your IT team",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_technology_ankuendigung_wartung_q1",
        question: "Wann sind die Systeme nicht erreichbar?",
        options: [
          "Am Samstag zwischen 8 und 16 Uhr",
          "Am Freitagabend",
          "Am Sonntagmorgen",
        ],
        answer: "Am Samstag zwischen 8 und 16 Uhr",
        explain: "Maintenance runs on Saturday, 12 July, between 8 am and 4 pm.",
      },
      {
        id: "tx_technology_ankuendigung_wartung_q2",
        question: "Was sollen die Mitarbeitenden bis Freitagabend tun?",
        options: [
          "Alle Dokumente speichern und sich abmelden",
          "Den IT-Support anrufen",
          "Das Kundenportal testen",
        ],
        answer: "Alle Dokumente speichern und sich abmelden",
        explain: "Save all open documents and log out of all systems, because unsaved changes can be lost.",
      },
      {
        id: "tx_technology_ankuendigung_wartung_q3",
        question: "An wen wendet man sich bei Problemen nach der Wartung?",
        options: [
          "An den IT-Support unter der Durchwahl 4500",
          "An die Teamleitung",
          "An das Kundenportal",
        ],
        answer: "An den IT-Support unter der Durchwahl 4500",
        explain: "Problems after the maintenance go to IT support on extension 4500.",
      },
    ],
  },

  /* ---------------- Arbeitssicherheit ---------------- */
  {
    id: "tx_safety_aushang_unterweisung",
    kind: "announcement",
    themeId: "safety",
    cefr: "B2.1",
    title: "Jährliche Sicherheitsunterweisung im Lager",
    titleEn: "Annual safety briefing in the warehouse",
    de: [
      "An alle Mitarbeitenden der Abteilungen Lager und Versand,",
      "die jährliche Sicherheitsunterweisung findet in diesem Jahr am Mittwoch, den 23. Juli, statt. Es gibt zwei Durchgänge: um 8 Uhr für die Frühschicht und um 14 Uhr für die Spätschicht. Die Teilnahme ist für alle verpflichtend und zählt als Arbeitszeit.",
      "Themen sind unter anderem der richtige Umgang mit dem Gabelstapler, das Verhalten im Brandfall und die neuen Regeln zur Schutzausrüstung: Ab August ist im gesamten Lagerbereich ein Sicherheitsschuh der Klasse S3 vorgeschrieben.",
      "Wer an diesem Tag Urlaub hat oder krank ist, meldet sich bitte bei der Schichtleitung für den Nachholtermin am 6. August.",
      "Die Abteilungsleitung",
    ].join("\n\n"),
    en: [
      "To all employees of the warehouse and shipping departments,",
      "This year's annual safety briefing takes place on Wednesday, 23 July. There are two rounds: at 8 am for the early shift and at 2 pm for the late shift. Attendance is mandatory for everyone and counts as working time.",
      "Topics include the correct handling of the forklift, what to do in case of fire, and the new rules on protective equipment: from August, class S3 safety shoes are required in the entire warehouse area.",
      "Anyone on holiday or ill on that day should contact the shift lead about the make-up session on 6 August.",
      "The department management",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_safety_aushang_unterweisung_q1",
        question: "Was gilt für die Teilnahme an der Unterweisung?",
        options: [
          "Sie ist verpflichtend und zählt als Arbeitszeit",
          "Sie ist freiwillig und findet nach der Arbeit statt",
          "Sie ist nur für neue Mitarbeitende verpflichtend",
        ],
        answer: "Sie ist verpflichtend und zählt als Arbeitszeit",
        explain: "Attendance is mandatory for everyone and counts as working time.",
      },
      {
        id: "tx_safety_aushang_unterweisung_q2",
        question: "Was ist ab August im Lagerbereich vorgeschrieben?",
        options: [
          "Ein Sicherheitsschuh der Klasse S3",
          "Ein Helm für alle Mitarbeitenden",
          "Eine neue Schutzbrille",
        ],
        answer: "Ein Sicherheitsschuh der Klasse S3",
        explain: "From August, class S3 safety shoes are required in the entire warehouse area.",
      },
      {
        id: "tx_safety_aushang_unterweisung_q3",
        question: "Was sollen Mitarbeitende tun, die am 23. Juli krank oder im Urlaub sind?",
        options: [
          "Sich bei der Schichtleitung für den Nachholtermin melden",
          "Die Unterweisung online nachholen",
          "Eine schriftliche Entschuldigung einreichen",
        ],
        answer: "Sich bei der Schichtleitung für den Nachholtermin melden",
        explain: "They should contact the shift lead about the make-up session on 6 August.",
      },
    ],
  },

  /* ---------------- Dienstreisen ---------------- */
  {
    id: "tx_travel_voicemail_flug",
    kind: "voicemail",
    themeId: "travel",
    cefr: "B1.2",
    title: "Voicemail: Umbuchung Ihres Rückflugs aus Wien",
    titleEn: "Voicemail: rebooking of your return flight from Vienna",
    de: [
      "Hallo Frau Petrova, hier ist Markus Lang vom Reisebüro Atlas.",
      "Ich rufe wegen Ihrer Dienstreise nach Wien nächste Woche an. Die Fluggesellschaft hat Ihren Rückflug am Donnerstag leider gestrichen. Ich habe Sie deshalb auf einen früheren Flug umgebucht: Er geht am selben Tag um 16:20 Uhr statt um 19:40 Uhr.",
      "Ihr Hotel und der Hinflug bleiben unverändert. Die neue Buchungsbestätigung schicke ich Ihnen gleich per E-Mail.",
      "Falls der frühere Flug für Sie nicht passt, rufen Sie mich bitte bis morgen 12 Uhr zurück, dann suche ich eine andere Verbindung. Sie erreichen mich unter 030 55 44 88 12. Vielen Dank und auf Wiederhören!",
    ].join("\n\n"),
    en: [
      "Hello Ms Petrova, this is Markus Lang from the Atlas travel agency.",
      "I'm calling about your business trip to Vienna next week. Unfortunately the airline has cancelled your return flight on Thursday. I have therefore rebooked you onto an earlier flight: it leaves the same day at 16:20 instead of 19:40.",
      "Your hotel and the outbound flight remain unchanged. I'll send you the new booking confirmation by email right away.",
      "If the earlier flight doesn't suit you, please call me back by noon tomorrow and I'll look for another connection. You can reach me on 030 55 44 88 12. Thank you and goodbye!",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_travel_voicemail_flug_q1",
        question: "Warum ruft Herr Lang an?",
        options: [
          "Der Rückflug wurde von der Fluggesellschaft gestrichen",
          "Das Hotel hat die Buchung storniert",
          "Die Dienstreise wurde abgesagt",
        ],
        answer: "Der Rückflug wurde von der Fluggesellschaft gestrichen",
        explain: "The airline cancelled the Thursday return flight; that's the reason for the call.",
      },
      {
        id: "tx_travel_voicemail_flug_q2",
        question: "Was hat sich durch die Umbuchung geändert?",
        options: [
          "Der Rückflug geht früher, um 16:20 Uhr statt um 19:40 Uhr",
          "Der Rückflug geht einen Tag später",
          "Der Hinflug wurde verschoben",
        ],
        answer: "Der Rückflug geht früher, um 16:20 Uhr statt um 19:40 Uhr",
        explain: "She was rebooked onto an earlier flight the same day: 16:20 instead of 19:40.",
      },
      {
        id: "tx_travel_voicemail_flug_q3",
        question: "Was soll Frau Petrova tun, wenn der neue Flug nicht passt?",
        options: [
          "Bis morgen 12 Uhr zurückrufen",
          "Direkt bei der Fluggesellschaft anrufen",
          "Eine E-Mail an das Hotel schreiben",
        ],
        answer: "Bis morgen 12 Uhr zurückrufen",
        explain: "He asks her to call back by noon tomorrow so he can find another connection.",
      },
    ],
  },

  /* ---------------- Logistik & Lieferketten ---------------- */
  {
    id: "tx_logistics_voicemail_lieferung",
    kind: "voicemail",
    themeId: "logistics",
    cefr: "B2.1",
    title: "Voicemail: Verzögerung Ihrer Lieferung 774512",
    titleEn: "Voicemail: delay of your delivery 774512",
    de: [
      "Guten Tag, hier spricht Carla Fischer von der Spedition Nordkurier, eine Nachricht für die Warenannahme der Firma Brandt.",
      "Es geht um Ihre Lieferung mit der Sendungsnummer 774512, angekündigt für morgen früh. Wegen einer Vollsperrung auf der A7 verzögert sich die Zustellung voraussichtlich um einen halben Tag. Unser Fahrer wird also erst morgen zwischen 14 und 16 Uhr bei Ihnen eintreffen.",
      "Da die Sendung zwei Paletten Kühlware enthält, bitten wir Sie, die Annahme bis 17 Uhr sicherzustellen. Falls das nicht möglich ist, rufen Sie bitte umgehend unsere Dispositionszentrale unter 040 33 21 90 an, damit wir die Tour umplanen können.",
      "Vielen Dank und einen schönen Tag!",
    ].join("\n\n"),
    en: [
      "Good day, this is Carla Fischer from the Nordkurier haulage company, a message for goods receiving at the Brandt company.",
      "It's about your delivery with shipment number 774512, announced for tomorrow morning. Because of a full closure on the A7 motorway, delivery is expected to be delayed by half a day. Our driver will therefore only arrive at your site tomorrow between 2 and 4 pm.",
      "Since the shipment contains two pallets of refrigerated goods, we ask you to ensure acceptance until 5 pm. If that is not possible, please call our dispatch centre immediately on 040 33 21 90 so we can replan the route.",
      "Thank you and have a nice day!",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_logistics_voicemail_lieferung_q1",
        question: "Warum verzögert sich die Lieferung?",
        options: [
          "Wegen einer Vollsperrung auf der Autobahn",
          "Weil der Fahrer krank ist",
          "Weil die Ware noch nicht fertig ist",
        ],
        answer: "Wegen einer Vollsperrung auf der Autobahn",
        explain: "A full closure on the A7 motorway delays the delivery by about half a day.",
      },
      {
        id: "tx_logistics_voicemail_lieferung_q2",
        question: "Wann wird der Fahrer voraussichtlich eintreffen?",
        options: [
          "Morgen zwischen 14 und 16 Uhr",
          "Morgen früh",
          "Heute um 17 Uhr",
        ],
        answer: "Morgen zwischen 14 und 16 Uhr",
        explain: "The driver will now arrive tomorrow between 2 and 4 pm instead of tomorrow morning.",
      },
      {
        id: "tx_logistics_voicemail_lieferung_q3",
        question: "Was soll die Firma Brandt tun, wenn die Annahme bis 17 Uhr nicht möglich ist?",
        options: [
          "Umgehend die Dispositionszentrale anrufen",
          "Die Kühlware am nächsten Tag annehmen",
          "Eine E-Mail an den Fahrer schreiben",
        ],
        answer: "Umgehend die Dispositionszentrale anrufen",
        explain: "If acceptance until 5 pm isn't possible, they should immediately call the dispatch centre so the route can be replanned.",
      },
    ],
  },

  /* ---------------- Arzt & Gesundheit ---------------- */
  {
    id: "tx_arzt_email_termin",
    kind: "email",
    themeId: "arzt",
    cefr: "B1.2",
    subThemeId: "arzt.termin",
    title: "Terminbestätigung Ihrer Hausarztpraxis",
    titleEn: "Appointment confirmation from your GP practice",
    de: [
      "Sehr geehrte Frau Novak,",
      "wir bestätigen Ihnen hiermit Ihren Termin in unserer Praxis am Donnerstag, den 16. Juli, um 8:45 Uhr bei Dr. Weber.",
      "Bitte bringen Sie Ihre Versichertenkarte mit und kommen Sie etwa zehn Minuten früher, damit wir Sie an der Anmeldung aufnehmen können. Falls Sie derzeit Medikamente einnehmen, notieren Sie diese bitte vorab auf einem Zettel.",
      "Sollten Sie den Termin nicht wahrnehmen können, sagen Sie ihn bitte spätestens 24 Stunden vorher telefonisch ab. So können wir den Termin an andere Patienten vergeben.",
      "Mit freundlichen Grüßen\nIhr Praxisteam Dr. Weber",
    ].join("\n\n"),
    en: [
      "Dear Ms Novak,",
      "we hereby confirm your appointment at our practice on Thursday, 16 July, at 8:45 with Dr Weber.",
      "Please bring your health insurance card and arrive about ten minutes early so we can check you in at reception. If you are currently taking any medication, please note it down on a piece of paper in advance.",
      "If you cannot attend the appointment, please cancel it by phone at least 24 hours in advance. That way we can give the slot to other patients.",
      "Kind regards\nYour practice team Dr Weber",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_arzt_email_termin_q1",
        question: "Was soll Frau Novak zum Termin mitbringen?",
        options: [
          "Ihre Versichertenkarte",
          "Eine Überweisung vom Facharzt",
          "Ein Rezept aus der Apotheke",
        ],
        answer: "Ihre Versichertenkarte",
        explain: "The email asks her to bring her health insurance card and to arrive about ten minutes early.",
      },
      {
        id: "tx_arzt_email_termin_q2",
        question: "Was soll die Patientin tun, wenn sie Medikamente einnimmt?",
        options: [
          "Die Medikamente vorab auf einem Zettel notieren",
          "Die Medikamente in die Praxis mitbringen",
          "Vorher die Krankenkasse informieren",
        ],
        answer: "Die Medikamente vorab auf einem Zettel notieren",
        explain: "If she is currently taking medication, she should note it down on a piece of paper in advance.",
      },
      {
        id: "tx_arzt_email_termin_q3",
        question: "Bis wann muss ein Termin spätestens abgesagt werden?",
        options: [
          "Spätestens 24 Stunden vorher",
          "Spätestens eine Woche vorher",
          "Am selben Tag bis 8 Uhr",
        ],
        answer: "Spätestens 24 Stunden vorher",
        explain: "The appointment must be cancelled by phone at least 24 hours in advance so it can be offered to other patients.",
      },
    ],
  },
  {
    id: "tx_arzt_voicemail_apotheke",
    kind: "voicemail",
    themeId: "arzt",
    cefr: "B2.1",
    subThemeId: "arzt.versicherung",
    title: "Voicemail: Ihr Medikament ist abholbereit",
    titleEn: "Voicemail: your medication is ready to collect",
    de: [
      "Guten Tag, hier ist die Stadt-Apotheke am Markt, eine Nachricht für Herrn Aydin.",
      "Sie haben gestern ein Rezept bei uns eingereicht. Das verschriebene Medikament war nicht vorrätig, deshalb mussten wir es bestellen. Es ist jetzt eingetroffen und liegt für Sie zur Abholung bereit.",
      "Sie können es bis Samstag, 18 Uhr, bei uns abholen. Bringen Sie bitte das Rezept mit, falls Sie es noch nicht bei uns gelassen haben. Die Zuzahlung beträgt fünf Euro.",
      "Bei Fragen zur Einnahme beraten wir Sie gern direkt am Schalter. Vielen Dank und gute Besserung!",
    ].join("\n\n"),
    en: [
      "Hello, this is the Stadt-Apotheke am Markt, a message for Mr Aydin.",
      "You submitted a prescription with us yesterday. The prescribed medication was not in stock, so we had to order it. It has now arrived and is ready for you to collect.",
      "You can pick it up from us until Saturday, 6 pm. Please bring the prescription if you have not already left it with us. The co-payment is five euros.",
      "If you have questions about how to take it, we are happy to advise you directly at the counter. Thank you and get well soon!",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_arzt_voicemail_apotheke_q1",
        question: "Warum war das Medikament nicht sofort verfügbar?",
        options: [
          "Es war nicht vorrätig und musste bestellt werden",
          "Das Rezept war ungültig",
          "Die Krankenkasse hat die Kosten nicht übernommen",
        ],
        answer: "Es war nicht vorrätig und musste bestellt werden",
        explain: "The medication was not in stock, so the pharmacy had to order it; it has now arrived.",
      },
      {
        id: "tx_arzt_voicemail_apotheke_q2",
        question: "Bis wann kann Herr Aydin das Medikament abholen?",
        options: [
          "Bis Samstag um 18 Uhr",
          "Bis Freitag um 12 Uhr",
          "Nur heute bis 20 Uhr",
        ],
        answer: "Bis Samstag um 18 Uhr",
        explain: "He can collect it until Saturday at 6 pm.",
      },
      {
        id: "tx_arzt_voicemail_apotheke_q3",
        question: "Wie hoch ist die Zuzahlung?",
        options: [
          "Fünf Euro",
          "Zehn Euro",
          "Die Zuzahlung entfällt",
        ],
        answer: "Fünf Euro",
        explain: "The co-payment for the medication is five euros.",
      },
    ],
  },

  /* ---------------- Wohnen & Zuhause ---------------- */
  {
    id: "tx_wohnen_email_besichtigung",
    kind: "email",
    themeId: "wohnen",
    cefr: "B1.2",
    subThemeId: "wohnen.suche",
    title: "Einladung zur Wohnungsbesichtigung",
    titleEn: "Invitation to a flat viewing",
    de: [
      "Sehr geehrte Frau Costa,",
      "vielen Dank für Ihre Anfrage zu unserer Zweizimmerwohnung in der Lindenstraße 12. Gerne laden wir Sie zu einer Besichtigung am Samstag, den 19. Juli, um 11:00 Uhr ein.",
      "Die Wohnung hat 58 Quadratmeter, einen Balkon und liegt im zweiten Stock ohne Aufzug. Die Kaltmiete beträgt 720 Euro, dazu kommen 180 Euro Nebenkosten. Die Kaution beträgt zwei Kaltmieten.",
      "Bitte bringen Sie zur Besichtigung einen Nachweis über Ihr Einkommen und Ihren Personalausweis mit. Falls Ihnen der Termin nicht passt, schlagen Sie mir gern eine Alternative vor.",
      "Mit freundlichen Grüßen\nA. Berger, Hausverwaltung Berger",
    ].join("\n\n"),
    en: [
      "Dear Ms Costa,",
      "thank you for your enquiry about our two-room flat at Lindenstraße 12. We are happy to invite you to a viewing on Saturday, 19 July, at 11:00.",
      "The flat is 58 square metres, has a balcony and is on the second floor without a lift. The base rent is 720 euros, plus 180 euros in utility costs. The deposit is two months' base rent.",
      "Please bring proof of your income and your ID card to the viewing. If the appointment does not suit you, feel free to suggest an alternative.",
      "Kind regards\nA. Berger, Berger property management",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_wohnen_email_besichtigung_q1",
        question: "Wie hoch ist die Kaltmiete für die Wohnung?",
        options: [
          "720 Euro",
          "180 Euro",
          "900 Euro",
        ],
        answer: "720 Euro",
        explain: "The base rent is 720 euros; the 180 euros are the separate utility costs.",
      },
      {
        id: "tx_wohnen_email_besichtigung_q2",
        question: "Was soll Frau Costa zur Besichtigung mitbringen?",
        options: [
          "Einen Einkommensnachweis und ihren Personalausweis",
          "Den unterschriebenen Mietvertrag",
          "Die Kaution in bar",
        ],
        answer: "Einen Einkommensnachweis und ihren Personalausweis",
        explain: "She is asked to bring proof of income and her ID card.",
      },
      {
        id: "tx_wohnen_email_besichtigung_q3",
        question: "Was kann Frau Costa tun, wenn ihr der Termin nicht passt?",
        options: [
          "Eine alternative Zeit vorschlagen",
          "Die Wohnung trotzdem sofort mieten",
          "Die Besichtigung absagen und aufgeben",
        ],
        answer: "Eine alternative Zeit vorschlagen",
        explain: "If the appointment does not suit her, she may suggest an alternative time.",
      },
    ],
  },
  {
    id: "tx_wohnen_letter_nebenkosten",
    kind: "letter",
    themeId: "wohnen",
    cefr: "B2.1",
    subThemeId: "wohnen.nebenkosten",
    title: "Nebenkostenabrechnung für das Jahr 2025",
    titleEn: "Utility cost statement for the year 2025",
    de: [
      "Sehr geehrter Herr Demir,",
      "anbei erhalten Sie die Nebenkostenabrechnung für den Zeitraum vom 1. Januar bis 31. Dezember 2025.",
      "Ihre monatliche Vorauszahlung betrug 150 Euro, insgesamt also 1.800 Euro. Die tatsächlichen Kosten für Heizung, Wasser und Müll lagen bei 2.040 Euro. Daraus ergibt sich eine Nachzahlung von 240 Euro.",
      "Bitte überweisen Sie den Betrag innerhalb von vier Wochen auf das bekannte Konto. Sollten Sie Fragen zur Abrechnung haben, können Sie die Belege nach Vereinbarung bei uns einsehen.",
      "Mit freundlichen Grüßen\nHausverwaltung Sonnenhof",
    ].join("\n\n"),
    en: [
      "Dear Mr Demir,",
      "please find enclosed the utility cost statement for the period from 1 January to 31 December 2025.",
      "Your monthly advance payment was 150 euros, so 1,800 euros in total. The actual costs for heating, water and rubbish were 2,040 euros. This results in a back-payment of 240 euros.",
      "Please transfer the amount within four weeks to the known account. If you have questions about the statement, you can inspect the receipts with us by appointment.",
      "Kind regards\nSonnenhof property management",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_wohnen_letter_nebenkosten_q1",
        question: "Warum muss Herr Demir Geld nachzahlen?",
        options: [
          "Die tatsächlichen Kosten waren höher als seine Vorauszahlungen",
          "Er hat die Miete zu spät gezahlt",
          "Die Kaution war zu niedrig",
        ],
        answer: "Die tatsächlichen Kosten waren höher als seine Vorauszahlungen",
        explain: "His advance payments totalled 1,800 euros but the actual costs were 2,040 euros, so 240 euros are owed.",
      },
      {
        id: "tx_wohnen_letter_nebenkosten_q2",
        question: "Wie hoch ist die Nachzahlung?",
        options: [
          "240 Euro",
          "150 Euro",
          "2.040 Euro",
        ],
        answer: "240 Euro",
        explain: "The back-payment is the difference: 2,040 euros minus 1,800 euros = 240 euros.",
      },
      {
        id: "tx_wohnen_letter_nebenkosten_q3",
        question: "Was kann Herr Demir tun, wenn er Fragen zur Abrechnung hat?",
        options: [
          "Nach Vereinbarung die Belege einsehen",
          "Die Zahlung einfach verweigern",
          "Sofort den Mietvertrag kündigen",
        ],
        answer: "Nach Vereinbarung die Belege einsehen",
        explain: "If he has questions, he can inspect the receipts with the management by appointment.",
      },
    ],
  },

  /* ---------------- Bank & Finanzen ---------------- */
  {
    id: "tx_bank_email_konto",
    kind: "email",
    themeId: "bank",
    cefr: "B1.2",
    subThemeId: "bank.konto",
    title: "Ihr Termin zur Kontoeröffnung",
    titleEn: "Your appointment to open an account",
    de: [
      "Sehr geehrter Herr Ivanov,",
      "vielen Dank für Ihr Interesse an einem Girokonto bei der Stadtbank. Wir bestätigen Ihren Beratungstermin am Mittwoch, den 16. Juli, um 15:30 Uhr in unserer Filiale am Marktplatz.",
      "Bitte bringen Sie zu dem Termin Ihren Personalausweis oder Reisepass sowie eine aktuelle Meldebescheinigung mit. Wenn Sie Ihr Gehalt über das Konto empfangen möchten, ist auch Ihr Arbeitsvertrag hilfreich.",
      "Das Girokonto ist bei Zahlungseingang ab 700 Euro im Monat kostenlos. Andernfalls fällt eine Kontoführungsgebühr von 4,90 Euro an. Ihre Girocard und die PIN erhalten Sie einige Tage nach der Eröffnung getrennt per Post.",
      "Mit freundlichen Grüßen\nIhr Team der Stadtbank",
    ].join("\n\n"),
    en: [
      "Dear Mr Ivanov,",
      "thank you for your interest in a current account with Stadtbank. We confirm your advisory appointment on Wednesday, 16 July, at 15:30 in our branch at the market square.",
      "Please bring your ID card or passport and a current registration certificate to the appointment. If you would like to receive your salary via the account, your employment contract is also helpful.",
      "The current account is free with an incoming payment of at least 700 euros a month. Otherwise there is an account maintenance fee of 4.90 euros. You will receive your debit card and the PIN separately by post a few days after opening.",
      "Kind regards\nYour Stadtbank team",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_bank_email_konto_q1",
        question: "Was muss Herr Ivanov zum Termin mitbringen?",
        options: [
          "Einen Ausweis und eine aktuelle Meldebescheinigung",
          "Nur seine Girocard",
          "Die Kaution für das Konto",
        ],
        answer: "Einen Ausweis und eine aktuelle Meldebescheinigung",
        explain: "He should bring his ID or passport and a current registration certificate (plus optionally his employment contract).",
      },
      {
        id: "tx_bank_email_konto_q2",
        question: "Wann ist das Girokonto kostenlos?",
        options: [
          "Bei einem Zahlungseingang ab 700 Euro im Monat",
          "Immer, ohne Bedingungen",
          "Nur im ersten Jahr",
        ],
        answer: "Bei einem Zahlungseingang ab 700 Euro im Monat",
        explain: "The account is free with a monthly incoming payment of at least 700 euros; otherwise a 4.90 euro fee applies.",
      },
      {
        id: "tx_bank_email_konto_q3",
        question: "Wie bekommt Herr Ivanov seine Girocard und die PIN?",
        options: [
          "Einige Tage nach der Eröffnung getrennt per Post",
          "Sofort am Termin in der Filiale",
          "Per E-Mail als Datei",
        ],
        answer: "Einige Tage nach der Eröffnung getrennt per Post",
        explain: "The card and the PIN are sent separately by post a few days after the account is opened.",
      },
    ],
  },
  {
    id: "tx_bank_voicemail_karte",
    kind: "voicemail",
    themeId: "bank",
    cefr: "B2.1",
    subThemeId: "bank.karte",
    title: "Voicemail: Auffällige Abbuchung von Ihrer Karte",
    titleEn: "Voicemail: unusual charge on your card",
    de: [
      "Guten Tag, hier ist der Sicherheitsdienst Ihrer Stadtbank, eine Nachricht für Frau Kowalski.",
      "Uns ist eine ungewöhnliche Abbuchung von Ihrer Kreditkarte aufgefallen: 480 Euro bei einem Online-Händler im Ausland. Zur Sicherheit haben wir Ihre Karte vorübergehend gesperrt.",
      "Falls Sie diese Zahlung selbst getätigt haben, ist nichts weiter zu tun, die Karte wird morgen wieder freigeschaltet. Falls nicht, rufen Sie uns bitte umgehend unter der Nummer auf Ihrer Kartenrückseite an, damit wir die Abbuchung zurückbuchen und eine neue Karte ausstellen können.",
      "Bitte nennen Sie am Telefon niemals Ihre PIN. Unsere Mitarbeiter fragen Sie niemals danach. Vielen Dank.",
    ].join("\n\n"),
    en: [
      "Hello, this is the security service of your Stadtbank, a message for Ms Kowalski.",
      "We have noticed an unusual charge on your credit card: 480 euros at an online retailer abroad. As a precaution we have temporarily blocked your card.",
      "If you made this payment yourself, there is nothing further to do; the card will be reactivated tomorrow. If not, please call us immediately on the number on the back of your card so we can reverse the charge and issue a new card.",
      "Please never state your PIN on the phone. Our staff will never ask you for it. Thank you.",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_bank_voicemail_karte_q1",
        question: "Warum wurde die Karte gesperrt?",
        options: [
          "Wegen einer auffälligen Abbuchung im Ausland",
          "Weil die PIN falsch eingegeben wurde",
          "Weil das Konto überzogen war",
        ],
        answer: "Wegen einer auffälligen Abbuchung im Ausland",
        explain: "An unusual 480-euro charge at a foreign online retailer led the bank to block the card as a precaution.",
      },
      {
        id: "tx_bank_voicemail_karte_q2",
        question: "Was soll Frau Kowalski tun, wenn sie die Zahlung nicht selbst getätigt hat?",
        options: [
          "Sofort die Nummer auf der Kartenrückseite anrufen",
          "Nichts tun und abwarten",
          "Die 480 Euro erneut überweisen",
        ],
        answer: "Sofort die Nummer auf der Kartenrückseite anrufen",
        explain: "If she did not make the payment, she should call the number on the back of her card immediately.",
      },
      {
        id: "tx_bank_voicemail_karte_q3",
        question: "Was sagt die Nachricht über die PIN?",
        options: [
          "Man soll sie am Telefon niemals nennen",
          "Man soll sie dem Mitarbeiter zur Prüfung nennen",
          "Man soll sie in einer E-Mail schicken",
        ],
        answer: "Man soll sie am Telefon niemals nennen",
        explain: "The message warns never to state the PIN on the phone; bank staff will never ask for it.",
      },
    ],
  },

  /* ---------------- Bildung & Sprache ---------------- */
  {
    id: "tx_bildung_email_kurs",
    kind: "email",
    themeId: "bildung",
    cefr: "B1.2",
    subThemeId: "bildung.sprachkurs",
    title: "Anmeldung zum Deutschkurs bestätigt",
    titleEn: "Registration for the German course confirmed",
    de: [
      "Sehr geehrte Frau Haddad,",
      "vielen Dank für Ihre Anmeldung zum Deutschkurs B2 an der Volkshochschule. Aufgrund Ihres Einstufungstests haben wir Sie dem Kurs am Dienstag- und Donnerstagabend von 18:00 bis 20:15 Uhr zugeteilt. Der Kurs beginnt am 2. September und umfasst 20 Termine.",
      "Die Kursgebühr beträgt 240 Euro. Wenn Sie einen Bildungsgutschein haben, legen Sie ihn bitte vor dem ersten Termin im Büro vor, dann entfällt die Gebühr für Sie.",
      "Das Lehrbuch bringen Sie bitte selbst mit. Den genauen Titel finden Sie im Anhang. Am Ende des Kurses können Sie eine Prüfung ablegen und ein Zertifikat erwerben.",
      "Mit freundlichen Grüßen\nIhre Volkshochschule Mitte",
    ].join("\n\n"),
    en: [
      "Dear Ms Haddad,",
      "thank you for registering for the German course B2 at the adult education centre. Based on your placement test, we have assigned you to the course on Tuesday and Thursday evenings from 18:00 to 20:15. The course starts on 2 September and comprises 20 sessions.",
      "The course fee is 240 euros. If you have an education voucher, please present it at the office before the first session; then the fee is waived for you.",
      "Please bring the textbook yourself. You will find the exact title in the attachment. At the end of the course you can sit an exam and obtain a certificate.",
      "Kind regards\nYour adult education centre Mitte",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_bildung_email_kurs_q1",
        question: "Wie wurde Frau Haddad dem Kurs zugeteilt?",
        options: [
          "Aufgrund ihres Einstufungstests",
          "Nach dem Zufallsprinzip",
          "Nach ihrem Alter",
        ],
        answer: "Aufgrund ihres Einstufungstests",
        explain: "She was assigned to the B2 course based on her placement test result.",
      },
      {
        id: "tx_bildung_email_kurs_q2",
        question: "Wie kann für Frau Haddad die Kursgebühr entfallen?",
        options: [
          "Wenn sie einen Bildungsgutschein vorlegt",
          "Wenn sie den Kurs zweimal besucht",
          "Wenn sie das Lehrbuch selbst kauft",
        ],
        answer: "Wenn sie einen Bildungsgutschein vorlegt",
        explain: "If she presents an education voucher before the first session, the 240-euro fee is waived.",
      },
      {
        id: "tx_bildung_email_kurs_q3",
        question: "Was kann Frau Haddad am Ende des Kurses tun?",
        options: [
          "Eine Prüfung ablegen und ein Zertifikat erwerben",
          "Den Kurs kostenlos wiederholen",
          "Direkt an der Hochschule studieren",
        ],
        answer: "Eine Prüfung ablegen und ein Zertifikat erwerben",
        explain: "At the end of the course she can sit an exam and obtain a certificate.",
      },
    ],
  },
  {
    id: "tx_bildung_letter_anerkennung",
    kind: "letter",
    themeId: "bildung",
    cefr: "B2.2",
    subThemeId: "bildung.anerkennung",
    title: "Ihr Antrag auf Anerkennung Ihres Abschlusses",
    titleEn: "Your application for recognition of your qualification",
    de: [
      "Sehr geehrter Herr Okonkwo,",
      "wir bestätigen den Eingang Ihres Antrags auf Anerkennung Ihres im Ausland erworbenen Abschlusses als Ingenieur.",
      "Zur Bearbeitung fehlen uns noch zwei Unterlagen: eine beglaubigte Kopie Ihres Abschlusszeugnisses sowie eine beglaubigte Übersetzung ins Deutsche. Bitte reichen Sie diese innerhalb von sechs Wochen nach.",
      "Nach vollständiger Prüfung erhalten Sie einen schriftlichen Bescheid. Dieser stellt fest, ob Ihr Abschluss als gleichwertig anerkannt wird oder ob eine Anpassungsqualifizierung nötig ist. Die Bearbeitung dauert in der Regel drei bis vier Monate.",
      "Mit freundlichen Grüßen\nZentralstelle für ausländische Abschlüsse",
    ].join("\n\n"),
    en: [
      "Dear Mr Okonkwo,",
      "we confirm receipt of your application for recognition of your qualification as an engineer obtained abroad.",
      "For processing we are still missing two documents: a certified copy of your final certificate and a certified translation into German. Please submit these within six weeks.",
      "After a complete review you will receive a written decision. It states whether your qualification is recognised as equivalent or whether an adaptation course is necessary. Processing usually takes three to four months.",
      "Kind regards\nCentral office for foreign qualifications",
    ].join("\n\n"),
    checks: [
      {
        id: "tx_bildung_letter_anerkennung_q1",
        question: "Welche Unterlagen fehlen noch?",
        options: [
          "Eine beglaubigte Kopie des Zeugnisses und eine beglaubigte Übersetzung",
          "Ein neuer Lebenslauf und ein Foto",
          "Ein Nachweis der Krankenversicherung",
        ],
        answer: "Eine beglaubigte Kopie des Zeugnisses und eine beglaubigte Übersetzung",
        explain: "Two documents are still needed: a certified copy of the certificate and a certified German translation.",
      },
      {
        id: "tx_bildung_letter_anerkennung_q2",
        question: "Innerhalb welcher Frist soll Herr Okonkwo die Unterlagen nachreichen?",
        options: [
          "Innerhalb von sechs Wochen",
          "Innerhalb von drei Tagen",
          "Innerhalb eines Jahres",
        ],
        answer: "Innerhalb von sechs Wochen",
        explain: "He is asked to submit the missing documents within six weeks.",
      },
      {
        id: "tx_bildung_letter_anerkennung_q3",
        question: "Was kann der Bescheid am Ende feststellen?",
        options: [
          "Ob der Abschluss gleichwertig ist oder eine Anpassungsqualifizierung nötig ist",
          "Ob Herr Okonkwo einen Sprachkurs bestanden hat",
          "Wie hoch sein künftiges Gehalt sein wird",
        ],
        answer: "Ob der Abschluss gleichwertig ist oder eine Anpassungsqualifizierung nötig ist",
        explain: "The written decision states whether the qualification is equivalent or whether an adaptation course is required.",
      },
    ],
  },
];

export const textById = (id: string) => texts.find((t) => t.id === id);
