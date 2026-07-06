import type { GameChapter, GameNpc, KeyItem, Mission } from "@/types/game";

/* Lookup maps are exported alongside the banks so every consumer shares one
 * O(1) path instead of re-scanning the arrays (they live in the lazy game
 * chunk, built once). Defined at the bottom of the file. */

/**
 * The Neuland mission bank (game phase G1). Missions are data interpreted by
 * `engine/mission.ts`; the graph integrity (scene routing, battle nodes,
 * content-bank references, key-item chains) is enforced by
 * `scripts/lint-content.mjs`. Chapter-1 mission list founder-approved
 * 2026-07-06 (G1 ships mission 1.6, the Anmeldung boss; 1.1-1.5 follow in G2).
 *
 * Writing rules: bilingual everywhere (D/E buttons), CEFR-banded German,
 * warm humor that roasts the bureaucracy and never the learner, no em dashes.
 */

/* ---------------- chapters (the story spine, GAME_DESIGN.md section 9) ---------------- */

export const chapters: GameChapter[] = [
  { id: "kap1", title: "Ankommen", titleEn: "Arriving", district: "Bahnhofsviertel" },
  { id: "kap2", title: "Wohnen", titleEn: "Living", district: "Altbauviertel" },
  { id: "kap3", title: "Geld & Papierkram", titleEn: "Money & paperwork", district: "Innenstadt" },
  { id: "kap4", title: "Die Jobsuche", titleEn: "The job hunt", district: "Agentur & Zuhause" },
  { id: "kap5", title: "Gesund & Sozial", titleEn: "Healthy & social", district: "Kiez & Stadtpark" },
  { id: "kap6", title: "Mein Ziel", titleEn: "My goal", district: "Ganz Neustadt" },
];

/* ---------------- recurring cast (GAME_DESIGN.md section 2) ---------------- */

export const gameNpcs: GameNpc[] = [
  {
    id: "npc_jonas",
    name: "Jonas",
    role: { de: "Dein deutscher Freund", en: "Your local German friend" },
  },
  {
    id: "npc_frau_schmidt",
    name: "Frau Schmidt",
    role: { de: "Sachbearbeiterin im Bürgeramt", en: "Case worker at the citizens' office" },
    sprite: "schmidt",
  },
  {
    id: "npc_ayse",
    name: "Ayşe",
    role: { de: "Deine Mitbewohnerin", en: "Your flatmate" },
  },
  {
    id: "npc_herr_krause",
    name: "Herr Krause",
    role: { de: "Hausmeister im Altbau", en: "Caretaker of the old building" },
  },
  {
    id: "npc_frau_weber",
    name: "Frau Weber",
    role: { de: "Deine Chefin", en: "Your boss" },
  },
  {
    id: "npc_herr_nguyen",
    name: "Herr Nguyen",
    role: { de: "Betreiber des Spätis", en: "Runs the late-night kiosk" },
  },
  /* chapter-1 supporting cast (G2, session 74) */
  {
    id: "npc_beamter",
    name: "Der Grenzbeamte",
    role: { de: "Beamter an der Passkontrolle", en: "Officer at passport control" },
  },
  {
    id: "npc_automat",
    name: "Der Automat",
    role: { de: "Fahrkartenautomat im Hauptbahnhof", en: "Ticket machine at the main station" },
  },
  {
    id: "npc_milo",
    name: "Milo",
    role: { de: "Verkäufer im Handyladen", en: "Salesman at the phone shop" },
  },
  {
    id: "npc_herr_brandt",
    name: "Herr Brandt",
    role: { de: "Dein erster Vermieter", en: "Your first landlord" },
  },
];

/* ---------------- key items (Schlüssel-Dokumente) ---------------- */

export const keyItems: KeyItem[] = [
  {
    id: "ki_personalausweis",
    de: "der Personalausweis",
    en: "identity card",
    desc: { de: "Ohne ihn läuft im Amt gar nichts.", en: "Without it, nothing at the office moves." },
  },
  {
    id: "ki_mietvertrag",
    de: "der Mietvertrag",
    en: "rental contract",
    desc: { de: "Beweist, dass du wirklich dort wohnst.", en: "Proves you really live there." },
  },
  {
    id: "ki_wohnungsgeberbestaetigung",
    de: "die Wohnungsgeberbestätigung",
    en: "landlord confirmation",
    desc: {
      de: "Die Unterschrift des Vermieters. Paragraf 19 will es so.",
      en: "The landlord's signature. Section 19 says so.",
    },
  },
  {
    id: "ki_meldebestaetigung",
    de: "die Meldebestätigung",
    en: "registration certificate",
    desc: {
      de: "Der Schlüssel zu Bankkonto, Vertrag und mehr. Gut aufbewahren!",
      en: "The key to a bank account, contracts and more. Keep it safe!",
    },
  },
  {
    id: "ki_reisepass",
    de: "der Reisepass",
    en: "passport",
    desc: {
      de: "Dein wichtigstes Dokument. Verlier ihn nie.",
      en: "Your most important document. Never lose it.",
    },
  },
  {
    id: "ki_fahrschein",
    de: "der Fahrschein",
    en: "travel ticket",
    desc: {
      de: "Zone AB, entwertet. Der Kontrolleur wird ihn lieben.",
      en: "Zone AB, validated. The inspector will love it.",
    },
  },
  {
    id: "ki_sim_vertrag",
    de: "der SIM-Vertrag",
    en: "SIM registration",
    desc: {
      de: "Prepaid, ohne Laufzeit. Du bist jetzt online.",
      en: "Prepaid, no minimum term. You are online now.",
    },
  },
];

/* ---------------- missions ---------------- */

export const missions: Mission[] = [
  /* --- Mission 1.1: arrival, passport control, the first announcement --- */
  {
    id: "m_kap1_willkommen",
    chapter: "kap1",
    index: 1,
    title: "Willkommen in Neuland",
    titleEn: "Welcome to Neuland",
    themeId: "travel",
    cefr: "B1.1",
    brief: {
      de: "Passkontrolle · erste Durchsage · Jonas wartet",
      en: "Passport control · first announcement · Jonas is waiting",
    },
    rewardXp: 60,
    rewardItems: ["ki_reisepass"],
    start: "ankunft",
    scenes: {
      ankunft: {
        id: "ankunft",
        kind: "cutscene",
        setting: "terminal",
        label: "Flughafen · Ankunft",
        next: "kontrolle",
        grantsItems: ["ki_reisepass"],
        lines: [
          {
            speaker: "erzaehler",
            de: "Zwei Koffer. Ein Ticket. Und ein Wort, das du schon kennst: Willkommen.",
            en: "Two suitcases. One ticket. And one word you already know: Willkommen.",
          },
          {
            speaker: "erzaehler",
            de: "Vor dir: die Passkontrolle. Hinter dir: dein altes Leben.",
            en: "Ahead of you: passport control. Behind you: your old life.",
          },
        ],
      },
      kontrolle: {
        id: "kontrolle",
        kind: "dialogueBattle",
        setting: "terminal",
        label: "Passkontrolle",
        next: "gleis",
        npc: "npc_beamter",
        npcCefr: "B1.1",
        geduld: 100,
        mut: 100,
        mutStart: 60,
        start: "k1",
        onBarEmpty: "k_ohne",
        onLose: "durchatmen",
        nodes: {
          k1: {
            id: "k1",
            npcLine: {
              de: "Guten Tag. Woher kommen Sie, und was ist der Zweck Ihrer Reise?",
              en: "Good day. Where are you coming from, and what is the purpose of your trip?",
            },
            moves: [
              {
                id: "k1_gut",
                tag: "Antworten",
                quality: 0.8,
                de: "Guten Tag! Ich ziehe nach Neustadt. Arbeit und ein neues Leben.",
                en: "Good day! I am moving to Neustadt. Work and a new life.",
                geduld: -2,
                mut: 10,
                next: "k2",
                feedback: {
                  de: "Er nickt. Ein guter Anfang.",
                  en: "He nods. A good start.",
                },
              },
              {
                id: "k1_nachfrage",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla5",
                de: "Entschuldigung, das habe ich nicht ganz verstanden. Können Sie langsamer sprechen?",
                en: "Sorry, I did not quite understand. Could you speak more slowly?",
                geduld: -4,
                mut: 6,
                next: "k1b",
                feedback: {
                  de: "Er wiederholt es langsamer. Nachfragen ist keine Schwäche.",
                  en: "He repeats it more slowly. Asking is not a weakness.",
                },
              },
              {
                id: "k1_knapp",
                tag: "Riskant",
                quality: 0.3,
                de: "Urlaub. Oder so ähnlich.",
                en: "Holiday. Or something like that.",
                geduld: -12,
                mut: -6,
                next: "k2",
                feedback: {
                  de: "„Oder so ähnlich“ ist keine Kategorie im Formular. Er schaut streng.",
                  en: "'Or something like that' is not a category on the form. He looks stern.",
                },
              },
            ],
          },
          k1b: {
            id: "k1b",
            npcLine: {
              de: "Gern langsamer: Woher kommen Sie? Und warum sind Sie hier?",
              en: "Gladly, more slowly: where are you from? And why are you here?",
            },
            moves: [
              {
                id: "k1b_gut",
                tag: "Antworten",
                quality: 0.8,
                de: "Danke! Ich ziehe nach Neustadt. Arbeit und ein neues Leben.",
                en: "Thank you! I am moving to Neustadt. Work and a new life.",
                geduld: -2,
                mut: 8,
                next: "k2",
              },
            ],
          },
          k2: {
            id: "k2",
            npcLine: { de: "Ihren Reisepass, bitte.", en: "Your passport, please." },
            ask: {
              itemId: "ki_reisepass",
              geduld: -2,
              mut: 8,
              next: "k3",
              nextIfMissing: "k_ohne",
              wrongFeedback: {
                de: "Er schiebt es zurück. „Das ist kein Reisepass.“",
                en: "He slides it back. 'That is not a passport.'",
              },
              feedback: {
                de: "Stempel. Der schönste Klang des Tages.",
                en: "Stamp. The best sound of the day.",
              },
            },
          },
          k3: {
            id: "k3",
            npcLine: {
              de: "Willkommen in Deutschland. Der Nächste, bitte!",
              en: "Welcome to Germany. Next, please!",
            },
            outcome: "win",
          },
          k_ohne: {
            id: "k_ohne",
            npcLine: {
              de: "Treten Sie bitte kurz zur Seite und suchen Sie in Ruhe.",
              en: "Please step aside for a moment and look for it calmly.",
            },
            outcome: "lose",
          },
        },
      },
      durchatmen: {
        id: "durchatmen",
        kind: "cutscene",
        setting: "terminal",
        label: "Passkontrolle",
        next: "kontrolle",
        lines: [
          {
            speaker: "erzaehler",
            de: "Tief durchatmen. Der Reisepass steckt in der Jackentasche. Natürlich.",
            en: "Deep breath. The passport is in your jacket pocket. Of course.",
          },
          {
            speaker: "du",
            de: "Neuer Versuch. Diesmal mit Plan.",
            en: "New attempt. This time with a plan.",
          },
        ],
      },
      gleis: {
        id: "gleis",
        kind: "listening",
        setting: "terminal",
        label: "Zum Zug",
        next: "jonas",
        intro: {
          de: "Der Zug nach Neustadt fährt gleich. Hör auf die Durchsage.",
          en: "The train to Neustadt leaves soon. Listen to the announcement.",
        },
        audio: [
          {
            de: "Der Regionalexpress nach Neustadt fährt heute von Gleis 4.",
            en: "The regional express to Neustadt leaves from platform 4 today.",
          },
          {
            de: "Bitte beachten Sie: Der Zug fährt circa zehn Minuten später.",
            en: "Please note: the train is running about ten minutes late.",
          },
        ],
        checks: [
          {
            id: "mq_wil_g1",
            question: "Von welchem Gleis fährt der Zug nach Neustadt?",
            options: ["Gleis 4", "Gleis 3", "Gleis 10"],
            answer: "Gleis 4",
            explain: "The announcement says the train leaves from platform 4 today.",
          },
          {
            id: "mq_wil_g2",
            question: "Was ist mit dem Zug los?",
            options: ["Er kommt später", "Er fällt aus", "Er ist schon weg"],
            answer: "Er kommt später",
            explain: "'Circa zehn Minuten später' means about ten minutes late.",
          },
        ],
      },
      jonas: {
        id: "jonas",
        kind: "cutscene",
        setting: "strasse",
        label: "Neustadt · Bahnhofsvorplatz",
        end: "win",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Da bist du ja! Sorry, die Ringbahn hatte mal wieder ihre Laune.",
            en: "There you are! Sorry, the ring line was in one of its moods again.",
          },
          {
            speaker: "du",
            de: "Elf Minuten. Ich habe gezählt.",
            en: "Eleven minutes. I counted.",
          },
          {
            speaker: "npc_jonas",
            de: "Willkommen in Neuland. Komm, ich nehme einen Koffer.",
            en: "Welcome to Neuland. Come on, I will take one suitcase.",
          },
        ],
      },
    },
  },

  /* --- Mission 1.2: the ticket machine, the first (gentle) battle --- */
  {
    id: "m_kap1_automat",
    chapter: "kap1",
    index: 2,
    title: "Der Fahrkarten-Automat",
    titleEn: "The ticket machine",
    themeId: "travel",
    cefr: "B1.1",
    brief: {
      de: "Zone AB · eine Schlange hinter dir · der Automat hat Zeit",
      en: "Zone AB · a queue behind you · the machine has time",
    },
    requiresMissions: ["m_kap1_willkommen"],
    rewardXp: 70,
    rewardItems: ["ki_fahrschein"],
    start: "auftrag",
    scenes: {
      auftrag: {
        id: "auftrag",
        kind: "cutscene",
        setting: "terminal",
        label: "Hauptbahnhof",
        next: "automat",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Du brauchst eine Fahrkarte in die Innenstadt. Zone AB. Glaub mir: NUR Zone AB.",
            en: "You need a ticket to the city center. Zone AB. Trust me: ONLY zone AB.",
          },
          {
            speaker: "du",
            de: "Wie schwer kann das sein?",
            en: "How hard can it be?",
          },
          {
            speaker: "erzaehler",
            de: "Der Automat wartet. Er hat Zeit. Die Schlange hinter dir nicht.",
            en: "The machine waits. It has time. The queue behind you does not.",
          },
        ],
      },
      automat: {
        id: "automat",
        kind: "dialogueBattle",
        setting: "terminal",
        label: "Der Fahrkartenautomat",
        next: "entwerten",
        npc: "npc_automat",
        npcCefr: "B1.1",
        geduld: 100,
        mut: 100,
        mutStart: 60,
        start: "a1",
        onBarEmpty: "a_schlange",
        onLose: "neustart",
        nodes: {
          a1: {
            id: "a1",
            npcLine: {
              de: "WILLKOMMEN. BITTE WÄHLEN SIE: EINZELFAHRT ODER ZEITKARTE?",
              en: "WELCOME. PLEASE SELECT: SINGLE JOURNEY OR SEASON TICKET?",
            },
            moves: [
              {
                id: "a1_einzel",
                tag: "Wählen",
                quality: 0.8,
                vocabId: "v_fahrkarte",
                de: "Eine Einzelfahrt, bitte.",
                en: "A single journey, please.",
                geduld: -2,
                mut: 6,
                next: "a2",
              },
              {
                id: "a1_hilfe",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla1",
                de: "Könnten Sie das näher erklären? Was ist eine Zeitkarte?",
                en: "Could you explain that in more detail? What is a season ticket?",
                geduld: -6,
                mut: 2,
                next: "a1",
                feedback: {
                  de: "Der Automat erklärt nichts. Er ist ein Automat.",
                  en: "The machine explains nothing. It is a machine.",
                },
              },
              {
                id: "a1_zeit",
                tag: "Riskant",
                quality: 0.3,
                de: "Eine Zeitkarte. Klingt wichtig.",
                en: "A season ticket. Sounds important.",
                geduld: -8,
                mut: -4,
                next: "a1b",
                feedback: {
                  de: "Die Monatskarte kostet 89 Euro. Hinter dir seufzt jemand.",
                  en: "The monthly pass costs 89 euros. Someone behind you sighs.",
                },
              },
            ],
          },
          a1b: {
            id: "a1b",
            npcLine: {
              de: "ZEITKARTE GEWÄHLT. PREIS: 89,00 EURO.",
              en: "SEASON TICKET SELECTED. PRICE: 89.00 EUROS.",
            },
            moves: [
              {
                id: "a1b_zurueck",
                tag: "Korrigieren",
                quality: 0.7,
                de: "Zurück. Ich meinte eine Einzelfahrt.",
                en: "Back. I meant a single journey.",
                geduld: -4,
                mut: 4,
                next: "a2",
                feedback: {
                  de: "Der Zurück-Knopf: dein bester Freund.",
                  en: "The back button: your best friend.",
                },
              },
            ],
          },
          a2: {
            id: "a2",
            npcLine: {
              de: "TARIFZONE WÄHLEN: AB ODER ABC?",
              en: "SELECT FARE ZONE: AB OR ABC?",
            },
            moves: [
              {
                id: "a2_ab",
                tag: "Zone AB",
                crit: true,
                cloze: "Innenstadt",
                quality: 0.9,
                de: "Zone AB, bitte. Die Innenstadt liegt in Zone AB.",
                en: "Zone AB, please. The city center is in zone AB.",
                geduld: 4,
                mut: 10,
                next: "a3",
                feedback: {
                  de: "Jonas' Stimme im Kopf: NUR Zone AB. Du hast zugehört.",
                  en: "Jonas' voice in your head: ONLY zone AB. You listened.",
                },
              },
              {
                id: "a2_abc",
                tag: "Riskant",
                quality: 0.3,
                de: "Zone ABC. Sicher ist sicher.",
                en: "Zone ABC. Better safe than sorry.",
                geduld: -8,
                mut: -4,
                next: "a3",
                feedback: {
                  de: "Drei Euro zu viel bezahlt. Der Automat schweigt zufrieden.",
                  en: "Three euros overpaid. The machine stays contentedly silent.",
                },
              },
              {
                id: "a2_karte",
                tag: "Zeit gewinnen",
                quality: 0.4,
                de: "Moment, ich schaue kurz auf die Zonenkarte.",
                en: "One moment, let me check the zone map.",
                geduld: -8,
                mut: 0,
                next: "a2",
                feedback: {
                  de: "Die Zonenkarte sieht aus wie eine Dartscheibe. Hinter dir hustet jemand.",
                  en: "The zone map looks like a dartboard. Someone behind you coughs.",
                },
              },
            ],
          },
          a3: {
            id: "a3",
            npcLine: {
              de: "ZAHLUNG: BITTE SCHEIN GLATT EINLEGEN.",
              en: "PAYMENT: PLEASE INSERT NOTE FLAT.",
            },
            moves: [
              {
                id: "a3_glatt",
                tag: "Geduld",
                quality: 0.8,
                de: "Du streichst den Schein glatt. Ganz glatt. Noch glatter.",
                en: "You smooth the note. Completely flat. Even flatter.",
                geduld: -2,
                mut: 6,
                next: "a4",
                feedback: {
                  de: "Beim vierten Versuch nimmt er ihn. Ein kleines Wunder.",
                  en: "On the fourth try it accepts. A small miracle.",
                },
              },
              {
                id: "a3_knuellen",
                tag: "Riskant",
                quality: 0.2,
                de: "Du schiebst den Schein einfach so rein.",
                en: "You just shove the note in as it is.",
                geduld: -12,
                mut: -8,
                next: "a3",
                feedback: {
                  de: "SCHEIN NICHT LESBAR. Die Schlange hinter dir wächst.",
                  en: "NOTE NOT READABLE. The queue behind you grows.",
                },
              },
            ],
          },
          a4: {
            id: "a4",
            npcLine: {
              de: "FAHRKARTE WIRD GEDRUCKT. BITTE ENTNEHMEN SIE IHR TICKET.",
              en: "TICKET PRINTING. PLEASE TAKE YOUR TICKET.",
            },
            outcome: "win",
          },
          a_schlange: {
            id: "a_schlange",
            npcLine: {
              de: "Der Mann hinter dir räuspert sich sehr deutlich. Du lässt ihn vor.",
              en: "The man behind you clears his throat very audibly. You let him go first.",
            },
            outcome: "lose",
          },
        },
      },
      neustart: {
        id: "neustart",
        kind: "cutscene",
        setting: "terminal",
        label: "Hauptbahnhof",
        next: "automat",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Alles gut. Der Automat hat schon stärkere Nerven gebrochen. Nochmal, ich sage dir die Zone vor.",
            en: "All good. That machine has broken stronger nerves. Again, I will prompt you the zone.",
          },
          {
            speaker: "du",
            de: "Zone AB. Einzelfahrt. Schein glatt. Ich bin bereit.",
            en: "Zone AB. Single journey. Note flat. I am ready.",
          },
        ],
      },
      entwerten: {
        id: "entwerten",
        kind: "cutscene",
        setting: "terminal",
        label: "In der Tram",
        end: "win",
        lines: [
          {
            speaker: "erzaehler",
            de: "In der Tram wartet ein kleiner blauer Kasten. Dein Ticket will gestempelt werden.",
            en: "On the tram a small blue box is waiting. Your ticket wants to be stamped.",
          },
          {
            speaker: "npc_jonas",
            de: "Entwerten! Sonst gilt die Fahrkarte nicht. Frag nicht warum, es ist ein Ritual.",
            en: "Validate it! Otherwise the ticket does not count. Do not ask why, it is a ritual.",
          },
          {
            speaker: "du",
            de: "Klack. Erledigt.",
            en: "Clack. Done.",
          },
        ],
      },
    },
  },

  {
    id: "m_kap1_anmeldung",
    chapter: "kap1",
    index: 6,
    title: "Die Anmeldung",
    titleEn: "The address registration",
    themeId: "behoerde",
    cefr: "B1.2",
    boss: true,
    brief: {
      de: "Behördendeutsch · 3 Dokumente · Endgegnerin: Frau Schmidt",
      en: "Official German · 3 documents · boss: Frau Schmidt",
    },
    rewardXp: 120,
    rewardItems: ["ki_meldebestaetigung"],
    start: "termin",
    scenes: {
      /* --- Scene 1: the parody booking website --- */
      termin: {
        id: "termin",
        kind: "websiteParody",
        setting: "website",
        url: "termine.buergeramt-neustadt.de",
        heading: "Terminvergabe · Bürgeramt Neustadt",
        headingEn: "Appointment booking · Neustadt citizens' office",
        lines: [
          {
            de: "Hinweis: Die Anmeldung ist innerhalb von zwei Wochen nach Einzug gesetzlich vorgeschrieben.",
            en: "Note: registration is legally required within two weeks of moving in.",
          },
          {
            de: "Bitte bringen Sie alle Unterlagen im Original mit.",
            en: "Please bring all documents in the original.",
          },
        ],
        notice: {
          de: "Nächster freier Termin: in 8 Wochen",
          en: "Next available appointment: in 8 weeks",
        },
        choices: [
          {
            id: "c_warten",
            de: "Termin nehmen und warten",
            en: "Take the appointment and wait",
            next: "acht_wochen",
            feedback: {
              de: "Zwei Wochen Frist, acht Wochen Wartezeit. Willkommen in Neuland.",
              en: "A two-week deadline, an eight-week wait. Welcome to Neuland.",
            },
          },
          {
            id: "c_spontan",
            de: "Ohne Termin hingehen: um 6 Uhr anstehen",
            en: "Go without an appointment: queue at 6 a.m.",
            next: "sechs_uhr",
            feedback: {
              de: "Mutig. Dein Wecker wird es dir nie verzeihen.",
              en: "Brave. Your alarm clock will never forgive you.",
            },
          },
        ],
      },

      acht_wochen: {
        id: "acht_wochen",
        kind: "cutscene",
        setting: "wohnung",
        next: "packen",
        lines: [
          {
            speaker: "erzaehler",
            de: "Acht Wochen später. Du kennst inzwischen jede Ecke deines Zimmers.",
            en: "Eight weeks later. By now you know every corner of your room.",
          },
          {
            speaker: "npc_jonas",
            de: "Heute ist dein großer Tag! Bürgeramt, Schalter 2, Frau Schmidt. Viel Erfolg.",
            en: "Today is your big day! Citizens' office, counter 2, Frau Schmidt. Good luck.",
          },
          {
            speaker: "du",
            de: "Wer ist Frau Schmidt?",
            en: "Who is Frau Schmidt?",
          },
          {
            speaker: "npc_jonas",
            de: "Du wirst schon sehen. Pack deine Unterlagen ein. Alle.",
            en: "You will see. Pack your documents. All of them.",
          },
        ],
      },

      sechs_uhr: {
        id: "sechs_uhr",
        kind: "cutscene",
        setting: "strasse",
        next: "packen",
        lines: [
          {
            speaker: "erzaehler",
            de: "6:00 Uhr. Vor dem Bürgeramt steht schon eine Schlange. Natürlich.",
            en: "6 a.m. There is already a queue outside the citizens' office. Of course.",
          },
          {
            speaker: "npc_jonas",
            de: "Du bist wirklich um sechs aufgestanden? Respekt. Frau Schmidt wartet an Schalter 2.",
            en: "You really got up at six? Respect. Frau Schmidt is waiting at counter 2.",
          },
          {
            speaker: "du",
            de: "Der frühe Vogel bekommt den Termin.",
            en: "The early bird gets the appointment.",
          },
          {
            speaker: "npc_jonas",
            de: "Hast du alle Unterlagen dabei? Ohne Papiere gehst du da besser gar nicht rein.",
            en: "Do you have all your documents? Without papers you had better not even go in.",
          },
        ],
      },

      /* --- Scene 2: pack your bag (retrieval loadout) --- */
      packen: {
        id: "packen",
        kind: "loadout",
        setting: "wohnung",
        next: "wartezimmer",
        cta: { de: "Zum Wartezimmer", en: "To the waiting room" },
        slots: [
          { id: "s_ausweis", vocabId: "v_personalausweis", grantsItem: "ki_personalausweis" },
          { id: "s_mietvertrag", vocabId: "v_mietvertrag", grantsItem: "ki_mietvertrag" },
          {
            id: "s_wgb",
            vocabId: "v_wohnungsgeberbestaetigung",
            grantsItem: "ki_wohnungsgeberbestaetigung",
          },
        ],
        distractorVocabIds: ["v_vollmacht", "v_gebuehr", "v_bescheid"],
      },

      /* --- Scene 3: the waiting room (listening) --- */
      wartezimmer: {
        id: "wartezimmer",
        kind: "listening",
        setting: "wartezimmer",
        next: "schmidt",
        ticker: { label: "Aufruf", current: "107", yours: "112" },
        audio: [
          {
            de: "Nummer 107, bitte zu Schalter 3.",
            en: "Number 107, please go to counter 3.",
          },
          {
            de: "Bitte halten Sie Ihre Unterlagen bereit. Ohne vollständige Unterlagen kann Ihr Anliegen nicht bearbeitet werden.",
            en: "Please have your documents ready. Without complete documents your request cannot be processed.",
          },
          {
            de: "Nummer 109, bitte zu Schalter 1.",
            en: "Number 109, please go to counter 1.",
          },
        ],
        checks: [
          {
            id: "mq_anm_w1",
            question: "Was sollen die Wartenden bereithalten?",
            options: ["die Unterlagen", "die Wartenummer", "das Handy"],
            answer: "die Unterlagen",
            explain: "The announcement asks everyone to have their documents ready.",
          },
          {
            id: "mq_anm_w2",
            question: "Zu welchem Schalter soll Nummer 107 gehen?",
            options: ["Schalter 3", "Schalter 1", "Schalter 2"],
            answer: "Schalter 3",
            explain: "Number 107 is called to counter 3; number 109 goes to counter 1.",
          },
        ],
      },

      /* --- Scene 4: the boss battle --- */
      schmidt: {
        id: "schmidt",
        kind: "dialogueBattle",
        setting: "amt",
        next: "formular",
        npc: "npc_frau_schmidt",
        npcCefr: "B2.1",
        geduld: 100,
        mut: 100,
        mutStart: 60,
        start: "b1",
        onBarEmpty: "b_geduld_aus",
        onLose: "rueckschlag",
        nodes: {
          b1: {
            id: "b1",
            npcLine: { de: "Nummer 112? Kommen Sie. Was brauchen Sie?", en: "Number 112? Come in. What do you need?" },
            moves: [
              {
                id: "b1_krit",
                tag: "Konjunktiv II",
                crit: true,
                cloze: "freundlich",
                quality: 0.95,
                de: "Guten Morgen! Wären Sie so freundlich, mich anzumelden? Ich bin neu in Neustadt.",
                en: "Good morning! Would you be so kind as to register me? I am new in Neustadt.",
                geduld: 6,
                mut: 14,
                next: "b2",
                feedback: {
                  de: "Volltreffer: Konjunktiv II. Frau Schmidt taut sichtbar auf.",
                  en: "Direct hit: Konjunktiv II. Frau Schmidt visibly thaws.",
                },
              },
              {
                id: "b1_ok",
                tag: "Höflich fragen",
                quality: 0.7,
                de: "Guten Morgen, ich möchte mich anmelden.",
                en: "Good morning, I would like to register my address.",
                geduld: -4,
                mut: 6,
                next: "b2",
                feedback: {
                  de: "Korrekt, aber sie sieht nicht mal auf. Der Bildschirm ist interessanter als du.",
                  en: "Correct, but she does not even look up. The screen is more interesting than you.",
                },
              },
              {
                id: "b1_du",
                tag: "Riskant",
                quality: 0.1,
                de: "Hey, ich brauch schnell die Anmeldung. Dauert das lange?",
                en: "Hey, I need the registration quickly. Will it take long?",
                geduld: -16,
                mut: -10,
                next: "b2",
                feedback: {
                  de: "Der lockere Ton kommt nicht gut an. Eine Augenbraue wandert nach oben.",
                  en: "The casual tone does not land well. One eyebrow rises.",
                },
              },
            ],
          },
          /* The demand is answered from the bag, not with a sentence
           * (founder feedback s74): open the Tasche, tap the right document. */
          b2: {
            id: "b2",
            npcLine: {
              de: "Anmeldung. Dann brauche ich Ihren Personalausweis oder Reisepass.",
              en: "Registration. Then I need your identity card or passport.",
            },
            ask: {
              itemId: "ki_personalausweis",
              vocabId: "v_personalausweis",
              geduld: -2,
              mut: 8,
              next: "b3",
              nextIfMissing: "b_ohne_ausweis",
              wrongFeedback: {
                de: "Sie schiebt es wortlos zurück. „Das habe ich nicht verlangt.“",
                en: "She slides it back without a word. 'That is not what I asked for.'",
              },
              feedback: {
                de: "Sie prüft den Ausweis und nickt knapp. Weiter im Programm.",
                en: "She checks the card and gives a short nod. Moving on.",
              },
            },
          },
          b3: {
            id: "b3",
            effect: "beamtendeutsch",
            npcLine: {
              de: "Ferner benötige ich die Wohnungsgeberbestätigung gemäß Paragraf 19 Bundesmeldegesetz.",
              en: "Furthermore I require the landlord confirmation pursuant to section 19 of the Federal Registration Act.",
            },
            moves: [
              {
                id: "b3_nachhaken",
                tag: "Nachhaken",
                quality: 0.85,
                redemittelId: "r_cla2",
                de: "Wenn ich Sie richtig verstehe, meinen Sie die Bestätigung von meinem Vermieter?",
                en: "If I understand you correctly, you mean the confirmation from my landlord?",
                geduld: -2,
                mut: 8,
                next: "b3b",
                feedback: {
                  de: "Präzise nachgefragt. Das Beamtendeutsch verliert seinen Schrecken.",
                  en: "Precisely asked. The official German loses its terror.",
                },
              },
              {
                id: "b3_raten",
                tag: "So tun als ob",
                quality: 0.3,
                de: "Ja, ja, natürlich. Kein Problem.",
                en: "Yes, yes, of course. No problem.",
                geduld: -10,
                mut: -6,
                next: "b3b",
                feedback: {
                  de: "Sie merkt sofort, dass du nur nickst. „Also. Wo ist sie?“",
                  en: "She notices immediately that you are just nodding. 'Well. Where is it?'",
                },
              },
              {
                id: "b3_panik",
                tag: "Riskant",
                quality: 0.2,
                de: "Äh... welche Bestätigung? Davon höre ich zum ersten Mal.",
                en: "Uh... which confirmation? This is the first I have heard of it.",
                geduld: -14,
                mut: -12,
                next: "b3",
                feedback: {
                  de: "Frau Schmidt seufzt. Dieses Seufzen hat Jahrzehnte Übung.",
                  en: "Frau Schmidt sighs. That sigh has decades of practice.",
                },
              },
            ],
          },
          /* Handover from the bag, same as b2: the WGB is a tap, not a line. */
          b3b: {
            id: "b3b",
            npcLine: { de: "Genau die. Haben Sie sie dabei?", en: "Exactly that one. Do you have it with you?" },
            ask: {
              itemId: "ki_wohnungsgeberbestaetigung",
              vocabId: "v_wohnungsgeberbestaetigung",
              geduld: -2,
              mut: 10,
              next: "b4",
              nextIfMissing: "b_ohne_wgb",
              wrongFeedback: {
                de: "„Das ist keine Wohnungsgeberbestätigung.“ Ihr Blick könnte Akten lochen.",
                en: "'That is not a landlord confirmation.' Her stare could hole-punch files.",
              },
              feedback: {
                de: "Unterschrift geprüft. Paragraf 19 ist zufrieden.",
                en: "Signature checked. Section 19 is satisfied.",
              },
            },
          },
          b4: {
            id: "b4",
            npcLine: {
              de: "Gut. Dann füllen Sie jetzt das Formular aus. Vollständig und leserlich, bitte.",
              en: "Good. Then fill in the form now. Completely and legibly, please.",
            },
            moves: [
              {
                id: "b4_krit",
                tag: "Konjunktiv II",
                crit: true,
                cloze: "Kugelschreiber",
                quality: 0.9,
                de: "Sehr gern. Hätten Sie vielleicht einen Kugelschreiber für mich?",
                en: "Gladly. Would you perhaps have a pen for me?",
                geduld: 4,
                mut: 10,
                next: "b_sieg",
                feedback: {
                  de: "Sie reicht dir wortlos einen Stift. Nach ihren Maßstäben ist das eine Umarmung.",
                  en: "She hands you a pen without a word. By her standards, that is a hug.",
                },
              },
              {
                id: "b4_ok",
                tag: "Zustimmen",
                quality: 0.7,
                de: "Mache ich sofort. Vielen Dank.",
                en: "I will do it right away. Thank you.",
                geduld: -2,
                mut: 4,
                next: "b_sieg",
                feedback: {
                  de: "„Hm.“ Sie schiebt dir das Formular hin. Ihren Kugelschreiber behält sie.",
                  en: "'Hm.' She slides the form over. Her pen, she keeps.",
                },
              },
              {
                id: "b4_online",
                tag: "Riskant",
                quality: 0.3,
                de: "Kann ich das nicht einfach online machen?",
                en: "Can I not just do this online?",
                geduld: -12,
                mut: -6,
                next: "b4",
                feedback: {
                  de: "Stille. Irgendwo klappert ein Drucker aus dem Jahr 2003.",
                  en: "Silence. Somewhere a printer from 2003 rattles.",
                },
              },
            ],
          },
          b_sieg: {
            id: "b_sieg",
            npcLine: { de: "Na also. Geht doch.", en: "There you go. See, it works." },
            outcome: "win",
          },
          b_ohne_ausweis: {
            id: "b_ohne_ausweis",
            npcLine: {
              de: "Ohne Ausweisdokument kann ich gar nichts für Sie tun. Der Nächste, bitte!",
              en: "Without an identity document I cannot do anything for you. Next, please!",
            },
            outcome: "lose",
          },
          b_ohne_wgb: {
            id: "b_ohne_wgb",
            npcLine: {
              de: "Ohne Wohnungsgeberbestätigung keine Anmeldung. Kommen Sie wieder, wenn Sie alle Unterlagen haben.",
              en: "No registration without the landlord confirmation. Come back when you have all your documents.",
            },
            outcome: "lose",
          },
          b_geduld_aus: {
            id: "b_geduld_aus",
            npcLine: {
              de: "Mein nächster Termin wartet. Kommen Sie wieder, wenn Sie so weit sind.",
              en: "My next appointment is waiting. Come back when you are ready.",
            },
            outcome: "lose",
          },
        },
      },

      /* --- The failure branch: scaffolded retry, never a lockout --- */
      rueckschlag: {
        id: "rueckschlag",
        kind: "cutscene",
        setting: "strasse",
        next: "schmidt",
        grantsItems: ["ki_personalausweis", "ki_mietvertrag", "ki_wohnungsgeberbestaetigung"],
        lines: [
          {
            speaker: "erzaehler",
            de: "Draußen. Die Tür fällt zu. Drinnen ruft jemand „Nummer 113“.",
            en: "Outside. The door falls shut. Inside, someone calls 'number 113'.",
          },
          {
            speaker: "npc_jonas",
            de: "Rausgeflogen? Passiert allen beim ersten Mal. Hier, deine Papiere: Die Wohnungsgeberbestätigung ist jetzt unterschrieben.",
            en: "Thrown out? Happens to everyone the first time. Here, your papers: the landlord confirmation is signed now.",
          },
          {
            speaker: "npc_jonas",
            de: "Und ein Tipp: Frau Schmidt schmilzt bei Konjunktiv II. „Wären Sie so freundlich...“, das wirkt Wunder.",
            en: "And a tip: Frau Schmidt melts at Konjunktiv II. 'Would you be so kind...' works wonders.",
          },
          {
            speaker: "du",
            de: "Noch einmal von vorn. Diesmal mit allem.",
            en: "Once more from the top. This time with everything.",
          },
        ],
      },

      /* --- Scene 5: the form finale --- */
      formular: {
        id: "formular",
        kind: "formCloze",
        setting: "amt",
        next: "sieg",
        issuer: { de: "Stadt Neustadt · Bürgeramt", en: "City of Neustadt · Citizens' office" },
        title: "Anmeldung bei der Meldebehörde",
        titleEn: "Registration with the residents' office",
        intro: {
          de: "Druckbuchstaben. Blauer Kugelschreiber. Keine Fehler.",
          en: "Block letters. Blue pen. No mistakes.",
        },
        fields: [
          {
            id: "f_anmelden",
            label: {
              de: "Hiermit melde ich meine neue Wohnung ___.",
              en: "I hereby register my new home ___.",
            },
            answer: "an",
            options: ["an", "um", "ab"],
            hint: { de: "anmelden = zum ersten Mal melden", en: "anmelden = register for the first time" },
          },
          {
            id: "f_hauptwohnung",
            label: {
              de: "Die neue Wohnung ist meine ___.",
              en: "The new home is my ___.",
            },
            answer: "Hauptwohnung",
            options: ["Hauptwohnung", "Nebenwohnung", "Ferienwohnung"],
            hint: { de: "Du wohnst nur dort.", en: "It is the only place you live." },
          },
          {
            id: "f_wohnungsgeber",
            label: {
              de: "Der Vermieter heißt auf dem Formular der ___.",
              en: "On the form, the landlord is called the ___.",
            },
            answer: "Wohnungsgeber",
            hint: { de: "Wohnungs + Geber", en: "the person who 'gives' the flat" },
          },
          {
            id: "f_ausweis",
            label: {
              de: "Vorgelegtes Dokument: der ___.",
              en: "Document presented: the ___.",
            },
            answer: "Personalausweis",
            hint: { de: "Dein Ausweisdokument aus der Tasche.", en: "The ID document from your bag." },
          },
          {
            id: "f_anlage",
            label: {
              de: "Anlage: die unterschriebene ___.",
              en: "Attachment: the signed ___.",
            },
            answer: "Wohnungsgeberbestätigung",
            hint: {
              de: "Das lange Wort. Du schaffst das.",
              en: "The long word. You can do it.",
            },
          },
        ],
      },

      /* --- Victory --- */
      sieg: {
        id: "sieg",
        kind: "cutscene",
        setting: "amt",
        end: "win",
        lines: [
          {
            speaker: "npc_frau_schmidt",
            de: "Ihre Meldebestätigung. Verlieren Sie sie nicht, die Bank will sie sehen.",
            en: "Your registration certificate. Do not lose it, the bank will want to see it.",
          },
          {
            speaker: "du",
            de: "Vielen Dank, Frau Schmidt. Bis zum nächsten Formular.",
            en: "Thank you very much, Frau Schmidt. Until the next form.",
          },
          {
            speaker: "erzaehler",
            de: "Sie lächelt fast. Fast.",
            en: "She almost smiles. Almost.",
          },
        ],
      },
    },
  },
];

/* ---------------- shared lookup maps ---------------- */

export const npcById = new Map(gameNpcs.map((n) => [n.id, n]));
export const keyItemById = new Map(keyItems.map((k) => [k.id, k]));
