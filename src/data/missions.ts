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
  /* chapter-1 supporting cast (G2) */
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
    id: "npc_kassiererin",
    name: "Die Kassiererin",
    role: { de: "Kassiererin im Supermarkt", en: "Cashier at the supermarket" },
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
      de: "Prepaid, ohne Laufzeit. Du bist jetzt erreichbar.",
      en: "Prepaid, no minimum term. You can be reached now.",
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
        next: "anzeigetafel",
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
      anzeigetafel: {
        id: "anzeigetafel",
        kind: "hotspot",
        setting: "terminal",
        label: "Bahnhof · Anzeigetafel",
        next: "jonas",
        prompt: {
          de: "Dein Zug nach Neustadt. Tippe dein Gleis auf der Tafel an.",
          en: "Your train to Neustadt. Tap your platform on the board.",
        },
        audio: {
          de: "Der Regionalexpress nach Neustadt fährt heute von Gleis 4.",
          en: "The regional express to Neustadt leaves from platform 4 today.",
        },
        cta: { de: "Zum Gleis", en: "To the platform" },
        spots: [
          {
            id: "g3",
            x: 22,
            y: 60,
            label: "Gleis 3",
            feedback: {
              de: "Gleis 3: das ist der Zug nach Altstadt. Nicht deiner.",
              en: "Platform 3: that is the train to Altstadt. Not yours.",
            },
          },
          {
            id: "g4",
            x: 50,
            y: 66,
            label: "Gleis 4",
            correct: true,
            feedback: {
              de: "Gleis 4, Neustadt. Zehn Minuten später, aber deiner.",
              en: "Platform 4, Neustadt. Ten minutes late, but yours.",
            },
          },
          {
            id: "g10",
            x: 78,
            y: 60,
            label: "Gleis 10",
            feedback: {
              de: "Gleis 10 fährt zum Flughafen. Da kommst du gerade her.",
              en: "Platform 10 goes to the airport. That is where you just came from.",
            },
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
        kind: "automat",
        setting: "terminal",
        label: "Der Fahrkartenautomat",
        next: "entwerten",
        device: { de: "Fahrkartenautomat", en: "Ticket machine" },
        start: "typ",
        steps: {
          typ: {
            id: "typ",
            screen: {
              de: "BITTE WÄHLEN: EINZELFAHRT ODER ZEITKARTE?",
              en: "PLEASE SELECT: SINGLE JOURNEY OR SEASON TICKET?",
            },
            keys: [
              {
                id: "einzel",
                label: "Einzelfahrt",
                correct: true,
                vocabId: "v_fahrkarte",
                feedback: { de: "Einzelfahrt. Genau richtig für heute.", en: "Single journey. Just right for today." },
              },
              {
                id: "zeit",
                label: "Zeitkarte",
                feedback: {
                  de: "Die Zeitkarte kostet 89 Euro im Monat. Für eine Fahrt? Lieber nicht.",
                  en: "The season ticket costs 89 euros a month. For one trip? Better not.",
                },
              },
            ],
            next: "zone",
          },
          zone: {
            id: "zone",
            screen: { de: "TARIFZONE WÄHLEN", en: "SELECT FARE ZONE" },
            hint: { de: "Jonas im Kopf: NUR Zone AB.", en: "Jonas in your head: ONLY zone AB." },
            keys: [
              {
                id: "ab",
                label: "AB",
                correct: true,
                feedback: { de: "Zone AB. Du hast Jonas zugehört.", en: "Zone AB. You listened to Jonas." },
              },
              {
                id: "abc",
                label: "ABC",
                feedback: {
                  de: "ABC kostet drei Euro mehr und reicht bis zum Flughafen. Brauchst du nicht.",
                  en: "ABC costs three euros more and reaches the airport. You do not need it.",
                },
              },
              {
                id: "a",
                label: "A",
                feedback: {
                  de: "Nur Zone A reicht nicht bis in die Innenstadt.",
                  en: "Zone A alone does not reach the city center.",
                },
              },
            ],
            next: "zahlen",
          },
          zahlen: {
            id: "zahlen",
            screen: { de: "ZAHLUNG: 3,20 EURO", en: "PAYMENT: 3.20 EUROS" },
            hint: { de: "Karte an das Feld halten oder Schein einlegen.", en: "Hold your card to the pad or insert a note." },
            keys: [
              {
                id: "karte",
                label: "Karte",
                correct: true,
                vocabId: "v_rechnung",
                feedback: { de: "Karte dran, Piep, fertig. Kein Kramen.", en: "Card on, beep, done. No fumbling." },
              },
              {
                id: "schein",
                label: "Schein",
                correct: true,
                feedback: {
                  de: "Du streichst den Schein glatt. Beim vierten Versuch nimmt er ihn. Ein kleines Wunder.",
                  en: "You smooth the note flat. On the fourth try it accepts. A small miracle.",
                },
              },
            ],
            next: "fertig",
          },
          fertig: {
            id: "fertig",
            screen: {
              de: "FAHRKARTE WIRD GEDRUCKT. BITTE ENTNEHMEN.",
              en: "TICKET PRINTING. PLEASE TAKE IT.",
            },
            keys: [],
            done: true,
          },
        },
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

  /* --- Mission 1.3: the SIM card, resisting the upsell --- */
  {
    id: "m_kap1_sim",
    chapter: "kap1",
    index: 3,
    title: "Die SIM-Karte",
    titleEn: "The SIM card",
    themeId: "technology",
    cefr: "B1.1",
    brief: {
      de: "Handyladen · Prepaid statt Vertrag · Milo will mehr verkaufen",
      en: "Phone shop · prepaid not a contract · Milo wants to sell more",
    },
    requiresMissions: ["m_kap1_automat"],
    rewardXp: 75,
    rewardItems: ["ki_sim_vertrag"],
    start: "laden",
    scenes: {
      laden: {
        id: "laden",
        kind: "cutscene",
        setting: "laden",
        label: "Handyladen",
        next: "beratung",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Ohne deutsche Nummer läuft nichts. Du brauchst eine SIM-Karte.",
            en: "Nothing works without a German number. You need a SIM card.",
          },
          {
            speaker: "npc_jonas",
            de: "Eine Regel: Prepaid, ohne Laufzeit. Der Verkäufer will dir mehr verkaufen.",
            en: "One rule: prepaid, no minimum term. The salesman will try to sell you more.",
          },
          {
            speaker: "du",
            de: "Prepaid. Ohne Laufzeit. Verstanden.",
            en: "Prepaid. No term. Understood.",
          },
        ],
      },
      beratung: {
        id: "beratung",
        kind: "dialogueBattle",
        setting: "laden",
        label: "Handyladen",
        next: "tarif",
        npc: "npc_milo",
        npcCefr: "B1.1",
        geduld: 100,
        mut: 100,
        mutStart: 60,
        start: "b1",
        onBarEmpty: "b_raus",
        onLose: "nochmal",
        nodes: {
          b1: {
            id: "b1",
            npcLine: {
              de: "Hey! Willkommen. Suchst du ein neues Handy mit einem richtig guten Vertrag?",
              en: "Hey! Welcome. Are you looking for a new phone with a really good contract?",
            },
            moves: [
              {
                id: "b1_prepaid",
                tag: "Antworten",
                quality: 0.8,
                vocabId: "v_beratung",
                de: "Danke, nein. Nur eine Prepaid-SIM-Karte, bitte.",
                en: "Thanks, no. Just a prepaid SIM card, please.",
                geduld: -2,
                mut: 8,
                next: "b2",
                feedback: {
                  de: "Klar und freundlich. Milo hört kurz zu.",
                  en: "Clear and friendly. Milo listens for a second.",
                },
              },
              {
                id: "b1_frage",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla2",
                de: "Was meinen Sie genau mit Vertrag? Ich möchte nur eine SIM-Karte.",
                en: "What exactly do you mean by contract? I just want a SIM card.",
                geduld: -4,
                mut: 4,
                next: "b1b",
              },
              {
                id: "b1_egal",
                tag: "Riskant",
                quality: 0.3,
                de: "Vertrag, Prepaid, egal. Zeigen Sie mal.",
                en: "Contract, prepaid, whatever. Show me.",
                geduld: -8,
                mut: -6,
                next: "b2",
                feedback: {
                  de: "„Egal“ hört ein Verkäufer gern. Zu gern.",
                  en: "'Whatever' is a word a salesman loves. Too much.",
                },
              },
            ],
          },
          b1b: {
            id: "b1b",
            npcLine: {
              de: "Ein Vertrag läuft 24 Monate. Aber sag mal, willst du wirklich nur Prepaid?",
              en: "A contract runs 24 months. But tell me, do you really only want prepaid?",
            },
            moves: [
              {
                id: "b1b_prepaid",
                tag: "Antworten",
                quality: 0.8,
                de: "Ja, wirklich. Prepaid, ohne Laufzeit.",
                en: "Yes, really. Prepaid, no term.",
                geduld: -2,
                mut: 8,
                next: "b2",
              },
            ],
          },
          b2: {
            id: "b2",
            npcLine: {
              de: "Aber schau, dieses Handy ist neu und im Vertrag fast geschenkt. Nur 39 Euro im Monat!",
              en: "But look, this phone is new and almost free with the contract. Only 39 euros a month!",
            },
            moves: [
              {
                id: "b2_nein",
                tag: "Ablehnen",
                quality: 0.8,
                redemittelId: "r_dis1",
                de: "Das sehe ich anders. 39 Euro im Monat ist mir zu teuer.",
                en: "I see it differently. 39 euros a month is too expensive for me.",
                geduld: -2,
                mut: 10,
                next: "b3",
                feedback: {
                  de: "Höflich, aber klar. So bleibt man standhaft.",
                  en: "Polite but clear. That is how you hold your ground.",
                },
              },
              {
                id: "b2_grund",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla3",
                de: "Und was kostet das Handy nach 24 Monaten wirklich?",
                en: "And what does the phone really cost after 24 months?",
                geduld: -4,
                mut: 4,
                next: "b3",
              },
              {
                id: "b2_ja",
                tag: "Riskant",
                quality: 0.3,
                de: "Fast geschenkt? Na gut, klingt fair.",
                en: "Almost free? All right, sounds fair.",
                geduld: -6,
                mut: -8,
                next: "b2b",
                feedback: {
                  de: "„Fast geschenkt“ heißt fast immer: teuer.",
                  en: "'Almost free' almost always means: expensive.",
                },
              },
            ],
          },
          b2b: {
            id: "b2b",
            npcLine: {
              de: "Super Wahl! Ich hole schon mal das Formular fürs Vertragskonto...",
              en: "Great choice! Let me get the form for the contract account...",
            },
            moves: [
              {
                id: "b2b_stop",
                tag: "Korrigieren",
                quality: 0.7,
                de: "Moment, nein. Kein Vertrag. Nur die Prepaid-Karte.",
                en: "Wait, no. No contract. Just the prepaid card.",
                geduld: -2,
                mut: 8,
                next: "b3",
                feedback: {
                  de: "Der Stopp im richtigen Moment. Gut gerettet.",
                  en: "The stop at the right moment. Nicely saved.",
                },
              },
            ],
          },
          b3: {
            id: "b3",
            npcLine: {
              de: "Okay, okay. Prepaid. Willst du wenigstens eine Handyversicherung dazu?",
              en: "Okay, okay. Prepaid. Do you at least want phone insurance with it?",
            },
            moves: [
              {
                id: "b3_nein",
                tag: "Ablehnen",
                quality: 0.8,
                de: "Nein danke, das brauche ich nicht.",
                en: "No thanks, I do not need that.",
                geduld: 4,
                mut: 8,
                next: "b_win",
              },
              {
                id: "b3_ja",
                tag: "Riskant",
                quality: 0.3,
                de: "Versicherung? Sicher ist sicher.",
                en: "Insurance? Better safe than sorry.",
                geduld: -6,
                mut: -4,
                next: "b_win",
                feedback: {
                  de: "Fünf Euro im Monat für ein Handy, das noch heil ist.",
                  en: "Five euros a month for a phone that is still intact.",
                },
              },
            ],
          },
          b_win: {
            id: "b_win",
            npcLine: {
              de: "Na gut. Eine Prepaid-Karte, ohne alles. Du bist ein harter Kunde.",
              en: "All right. One prepaid card, nothing added. You are a tough customer.",
            },
            outcome: "win",
          },
          b_raus: {
            id: "b_raus",
            npcLine: {
              de: "Wir können den Vertrag auch morgen fertig machen...",
              en: "We can also finish the contract tomorrow...",
            },
            outcome: "lose",
          },
        },
      },
      tarif: {
        id: "tarif",
        kind: "websiteParody",
        setting: "website",
        url: "shop.neustadt-mobil.de/tarife",
        heading: "Wähle deinen Tarif",
        headingEn: "Choose your tariff",
        lines: [
          {
            de: "Prepaid S: 9,99 € pro Monat, jederzeit kündbar, keine Laufzeit.",
            en: "Prepaid S: 9.99 € per month, cancel anytime, no term.",
          },
          {
            de: "Vertrag XL: 39,99 € pro Monat, 24 Monate Laufzeit, neues Handy.",
            en: "Contract XL: 39.99 € per month, 24-month term, new phone.",
          },
        ],
        notice: {
          de: "Kleingedrucktes: Der Vertrag verlängert sich automatisch.",
          en: "Fine print: the contract renews automatically.",
        },
        choices: [
          {
            id: "t_prepaid",
            de: "Prepaid S auswählen",
            en: "Select Prepaid S",
            next: "aktiv",
            feedback: {
              de: "Ohne Laufzeit. Genau wie Jonas gesagt hat.",
              en: "No term. Exactly as Jonas said.",
            },
          },
          {
            id: "t_vertrag",
            de: "Vertrag XL auswählen",
            en: "Select Contract XL",
            next: "warnung",
          },
        ],
      },
      warnung: {
        id: "warnung",
        kind: "cutscene",
        setting: "website",
        next: "tarif",
        lines: [
          {
            speaker: "erzaehler",
            de: "24 Monate Laufzeit. Automatische Verlängerung. Das Kleingedruckte blinkt.",
            en: "24-month term. Automatic renewal. The fine print blinks.",
          },
          {
            speaker: "du",
            de: "Zurück. Ich nehme Prepaid.",
            en: "Back. I will take prepaid.",
          },
        ],
      },
      aktiv: {
        id: "aktiv",
        kind: "cutscene",
        setting: "laden",
        label: "Handyladen",
        end: "win",
        grantsItems: ["ki_sim_vertrag"],
        lines: [
          {
            speaker: "npc_milo",
            de: "SIM ist aktiv. Deine neue Nummer läuft in fünf Minuten.",
            en: "The SIM is active. Your new number works in five minutes.",
          },
          {
            speaker: "du",
            de: "Prepaid. Ohne Laufzeit. Ich habe es geschafft.",
            en: "Prepaid. No term. I did it.",
          },
          {
            speaker: "npc_jonas",
            de: "Schick mir gleich eine Nachricht. Willkommen im Netz!",
            en: "Text me right away. Welcome to the network!",
          },
        ],
      },
      nochmal: {
        id: "nochmal",
        kind: "cutscene",
        setting: "laden",
        label: "Handyladen",
        next: "beratung",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Fast im Vertrag gelandet. Nochmal: Prepaid, ohne Laufzeit, freundlich Nein sagen.",
            en: "Almost ended up in a contract. Again: prepaid, no term, say no politely.",
          },
          {
            speaker: "du",
            de: "Prepaid. Ohne Laufzeit. Kein Handy. Los.",
            en: "Prepaid. No term. No phone. Go.",
          },
        ],
      },
    },
  },

  /* --- Mission 1.4: the first shop, the Pfand system, the checkout sprint --- */
  {
    id: "m_kap1_einkauf",
    chapter: "kap1",
    index: 4,
    title: "Der erste Einkauf",
    titleEn: "The first shopping trip",
    themeId: "sustainability",
    cefr: "B1.1",
    brief: {
      de: "Supermarkt · Pfand zurückgeben · das legendäre Kassen-Tempo",
      en: "Supermarket · return the deposit bottles · the legendary checkout speed",
    },
    requiresMissions: ["m_kap1_sim"],
    rewardXp: 80,
    start: "zettel",
    scenes: {
      zettel: {
        id: "zettel",
        kind: "cutscene",
        setting: "laden",
        label: "Supermarkt",
        next: "pfand",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Erster Einkauf! Und nimm die leeren Flaschen mit. Das ist Pfand, das ist Geld.",
            en: "First shopping trip! And bring the empty bottles. That is Pfand, that is money.",
          },
          {
            speaker: "npc_jonas",
            de: "Zwei Warnungen: der Leergutautomat vorne, und die Kasse ist schnell. Sehr schnell.",
            en: "Two warnings: the bottle machine up front, and the checkout is fast. Very fast.",
          },
          {
            speaker: "du",
            de: "Flaschen zuerst. Dann einkaufen. Dann überleben.",
            en: "Bottles first. Then shopping. Then survive.",
          },
        ],
      },
      pfand: {
        id: "pfand",
        kind: "automat",
        setting: "laden",
        label: "Supermarkt · Leergutrückgabe",
        next: "regal",
        device: { de: "Leergutautomat", en: "Bottle return machine" },
        start: "flasche1",
        steps: {
          flasche1: {
            id: "flasche1",
            screen: { de: "LEERGUT EINLEGEN", en: "INSERT EMPTIES" },
            hint: { de: "Nur Pfandflaschen werden angenommen.", en: "Only deposit bottles are accepted." },
            keys: [
              {
                id: "mehrweg",
                label: "Mehrwegflasche",
                correct: true,
                feedback: { de: "Klonk. 0,08 € gutgeschrieben.", en: "Clonk. 0.08 € credited." },
              },
              {
                id: "becher",
                label: "Kaffeebecher",
                feedback: {
                  de: "FEHLER: Auf Pappbecher gibt es kein Pfand.",
                  en: "ERROR: No deposit on paper cups.",
                },
              },
            ],
            next: "flasche2",
          },
          flasche2: {
            id: "flasche2",
            screen: { de: "NÄCHSTES LEERGUT", en: "NEXT EMPTY" },
            keys: [
              {
                id: "einweg",
                label: "Einwegflasche (PET)",
                correct: true,
                feedback: {
                  de: "Klonk. 0,25 € gutgeschrieben. Summe: 2,75 €.",
                  en: "Clonk. 0.25 € credited. Total: 2.75 €.",
                },
              },
              {
                id: "wein",
                label: "Weinflasche",
                feedback: {
                  de: "FEHLER: Auf diese Flasche gibt es kein Pfand.",
                  en: "ERROR: No deposit on this bottle.",
                },
              },
            ],
            next: "bon",
          },
          bon: {
            id: "bon",
            screen: { de: "GUTHABEN: 2,75 €. BON DRUCKEN?", en: "CREDIT: 2.75 €. PRINT RECEIPT?" },
            hint: { de: "Kein Bon, kein Geld. Der Bon gilt an der Kasse.", en: "No receipt, no money. The receipt counts at the checkout." },
            keys: [
              {
                id: "drucken",
                label: "BON drucken",
                correct: true,
                feedback: { de: "2,75 € gerettet. Herr Nguyen wäre stolz.", en: "2.75 € saved. Herr Nguyen would be proud." },
              },
            ],
            next: "raus",
          },
          raus: {
            id: "raus",
            screen: { de: "BITTE BON ENTNEHMEN. DANKE.", en: "PLEASE TAKE RECEIPT. THANK YOU." },
            keys: [],
            done: true,
          },
        },
      },
      regal: {
        id: "regal",
        kind: "hotspot",
        setting: "laden",
        label: "Supermarkt · Regale",
        next: "kasse",
        prompt: {
          de: "Auf dem Zettel: Milch, Brot, Äpfel. Tippe die drei im Regal an.",
          en: "On the list: milk, bread, apples. Tap the three on the shelf.",
        },
        cta: { de: "Zur Kasse", en: "To the checkout" },
        spots: [
          {
            id: "milch",
            x: 22,
            y: 34,
            label: "Milch",
            correct: true,
            feedback: { de: "Milch, abgehakt.", en: "Milk, checked off." },
          },
          {
            id: "brot",
            x: 50,
            y: 32,
            label: "Brot",
            correct: true,
            feedback: { de: "Brot, abgehakt.", en: "Bread, checked off." },
          },
          {
            id: "aepfel",
            x: 78,
            y: 34,
            label: "Äpfel",
            correct: true,
            feedback: { de: "Äpfel, abgehakt. Der Zettel ist leer.", en: "Apples, checked off. The list is empty." },
          },
          {
            id: "chips",
            x: 33,
            y: 64,
            label: "Chips",
            feedback: {
              de: "Chips stehen nicht auf dem Zettel. Jonas sieht alles.",
              en: "Chips are not on the list. Jonas sees everything.",
            },
          },
          {
            id: "cola",
            x: 65,
            y: 64,
            label: "Cola",
            feedback: {
              de: "Cola? Später. Erst der Zettel.",
              en: "Cola? Later. The list first.",
            },
          },
        ],
      },
      kasse: {
        id: "kasse",
        kind: "dialogueBattle",
        setting: "laden",
        label: "Supermarkt · Kasse",
        next: "ende",
        npc: "npc_kassiererin",
        npcCefr: "B1.1",
        geduld: 100,
        mut: 100,
        mutStart: 60,
        start: "c1",
        onBarEmpty: "c_stau",
        onLose: "nochmal",
        nodes: {
          c1: {
            id: "c1",
            npcLine: {
              de: "Guten Tag. Sammeln Sie Payback-Punkte?",
              en: "Hello. Do you collect Payback points?",
            },
            moves: [
              {
                id: "c1_nein",
                tag: "Antworten",
                quality: 0.8,
                de: "Nein danke.",
                en: "No thanks.",
                geduld: -2,
                mut: 8,
                next: "c2",
              },
              {
                id: "c1_frage",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla4",
                de: "Entschuldigung, was sammeln?",
                en: "Sorry, collect what?",
                geduld: -4,
                mut: 4,
                next: "c1b",
              },
              {
                id: "c1_kramen",
                tag: "Riskant",
                quality: 0.3,
                de: "Punkte? Moment, ich suche die Karte...",
                en: "Points? One moment, I am looking for the card...",
                geduld: -8,
                mut: -6,
                next: "c2",
                feedback: {
                  de: "Die Ware rollt schon. Du suchst noch.",
                  en: "The goods are already rolling. You are still searching.",
                },
              },
            ],
          },
          c1b: {
            id: "c1b",
            npcLine: {
              de: "Payback-Punkte. Haben Sie eine Karte, ja oder nein?",
              en: "Payback points. Do you have a card, yes or no?",
            },
            moves: [
              {
                id: "c1b_nein",
                tag: "Antworten",
                quality: 0.8,
                de: "Nein, keine Karte.",
                en: "No, no card.",
                geduld: -2,
                mut: 8,
                next: "c2",
              },
            ],
          },
          c2: {
            id: "c2",
            npcLine: { de: "Brauchen Sie eine Tüte?", en: "Do you need a bag?" },
            moves: [
              {
                id: "c2_nein",
                tag: "Antworten",
                quality: 0.8,
                vocabId: "v_kunde",
                de: "Nein, ich habe eine eigene Tasche dabei.",
                en: "No, I brought my own bag.",
                geduld: 2,
                mut: 8,
                next: "c3",
              },
              {
                id: "c2_ja",
                tag: "Kaufen",
                quality: 0.5,
                de: "Ja bitte, eine Tüte.",
                en: "Yes please, a bag.",
                geduld: -2,
                mut: 2,
                next: "c3",
                feedback: {
                  de: "25 Cent extra. Und Jonas' Beutel bleibt leer zu Hause.",
                  en: "25 cents extra. And Jonas' tote stays empty at home.",
                },
              },
            ],
          },
          c3: {
            id: "c3",
            npcLine: { de: "Das macht dann 12,40 Euro.", en: "That comes to 12.40 euros." },
            moves: [
              {
                id: "c3_passend",
                tag: "Zahlen",
                crit: true,
                cloze: "passend",
                quality: 0.9,
                vocabId: "v_rechnung",
                de: "Ich habe es passend: zwölf Euro vierzig.",
                en: "I have it exact: twelve euros forty.",
                geduld: 6,
                mut: 10,
                next: "c_win",
                feedback: {
                  de: "Passend gezahlt, Schlange gerettet. Ein Profi.",
                  en: "Paid exact, queue saved. A pro.",
                },
              },
              {
                id: "c3_kramen",
                tag: "Riskant",
                quality: 0.3,
                de: "Moment... ich habe hier irgendwo Münzen...",
                en: "One moment... I have coins here somewhere...",
                geduld: -10,
                mut: -6,
                next: "c3",
                feedback: {
                  de: "Die Schlange atmet hörbar aus.",
                  en: "The queue exhales audibly.",
                },
              },
            ],
          },
          c_win: {
            id: "c_win",
            npcLine: {
              de: "Danke, schönen Tag noch. Der Nächste, bitte!",
              en: "Thank you, have a nice day. Next, please!",
            },
            outcome: "win",
          },
          c_stau: {
            id: "c_stau",
            npcLine: {
              de: "Die Schlange stöhnt leise. Sie treten zur Seite und packen erst mal ein.",
              en: "The queue groans quietly. You step aside and pack up first.",
            },
            outcome: "lose",
          },
        },
      },
      ende: {
        id: "ende",
        kind: "cutscene",
        setting: "strasse",
        label: "Vor dem Supermarkt",
        end: "win",
        lines: [
          {
            speaker: "du",
            de: "Eingekauft, bezahlt, überlebt. Und 2,75 € Pfand gutgeschrieben.",
            en: "Shopped, paid, survived. And 2.75 € of deposit credited.",
          },
          {
            speaker: "npc_jonas",
            de: "Siehst du? Du sprichst schon Supermarkt. Das ist eine eigene Sprache.",
            en: "See? You already speak supermarket. That is a language of its own.",
          },
        ],
      },
      nochmal: {
        id: "nochmal",
        kind: "cutscene",
        setting: "laden",
        label: "Supermarkt · Kasse",
        next: "kasse",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Die Kasse verzeiht nichts. Nochmal: Karte nein, Beutel dabei, Geld passend.",
            en: "The checkout forgives nothing. Again: no card, own bag, exact change.",
          },
          {
            speaker: "du",
            de: "Nein, eigene Tasche, passend. Ich bin bereit.",
            en: "No, own bag, exact. I am ready.",
          },
        ],
      },
    },
  },

  /* --- Mission 1.5: a temporary room, the landlord, the first real form --- */
  {
    id: "m_kap1_dach",
    chapter: "kap1",
    index: 5,
    title: "Ein Dach über dem Kopf",
    titleEn: "A roof over your head",
    themeId: "wohnen",
    cefr: "B1.2",
    brief: {
      de: "Zwischenzimmer · Herr Brandt · die Wohnungsgeberbestätigung",
      en: "Temporary room · Herr Brandt · the landlord confirmation",
    },
    requiresMissions: ["m_kap1_einkauf"],
    rewardXp: 90,
    rewardItems: ["ki_wohnungsgeberbestaetigung"],
    start: "zimmer",
    scenes: {
      zimmer: {
        id: "zimmer",
        kind: "cutscene",
        setting: "wohnung",
        label: "Das Zwischenzimmer",
        next: "brandt",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Nur ein Zimmer für den Anfang, aber es hat ein Bett und einen Vermieter: Herr Brandt.",
            en: "Only a room to start with, but it has a bed and a landlord: Herr Brandt.",
          },
          {
            speaker: "npc_jonas",
            de: "Wichtig: Bitte ihn um die Wohnungsgeberbestätigung. Ohne sie keine Anmeldung.",
            en: "Important: ask him for the landlord confirmation. Without it, no registration.",
          },
          {
            speaker: "du",
            de: "Höflich fragen. Wohnungsgeberbestätigung. Ich merke es mir.",
            en: "Ask politely. Landlord confirmation. I will remember it.",
          },
        ],
      },
      brandt: {
        id: "brandt",
        kind: "dialogueBattle",
        setting: "wohnung",
        label: "Herr Brandt",
        next: "formular",
        npc: "npc_herr_brandt",
        npcCefr: "B1.2",
        geduld: 100,
        mut: 100,
        mutStart: 60,
        start: "d1",
        onBarEmpty: "d_weg",
        onLose: "nochmal",
        nodes: {
          d1: {
            id: "d1",
            npcLine: {
              de: "Also. Sie wollen das Zimmer. Pünktlich zahlen, leise sein. Fragen?",
              en: "So. You want the room. Pay on time, be quiet. Questions?",
            },
            effect: "beamtendeutsch",
            moves: [
              {
                id: "d1_hoefl",
                tag: "Höflich",
                quality: 0.8,
                de: "Guten Tag, Herr Brandt. Vielen Dank. Ich zahle gern pünktlich.",
                en: "Hello, Herr Brandt. Thank you very much. I am happy to pay on time.",
                geduld: -2,
                mut: 10,
                next: "d2",
                feedback: {
                  de: "Ein höflicher erster Satz öffnet Türen. Und Zimmer.",
                  en: "A polite first sentence opens doors. And rooms.",
                },
              },
              {
                id: "d1_frage",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla1",
                de: "Könnten Sie das kurz wiederholen? Ab wann ist leise sein wichtig?",
                en: "Could you repeat that briefly? From when does being quiet matter?",
                geduld: -4,
                mut: 4,
                next: "d1b",
              },
              {
                id: "d1_knapp",
                tag: "Riskant",
                quality: 0.3,
                de: "Ja ja, passt schon. Wo unterschreibe ich?",
                en: "Yeah yeah, it is fine. Where do I sign?",
                geduld: -10,
                mut: -6,
                next: "d2",
                feedback: {
                  de: "Herr Brandt mag keine Hektik. Und kein „ja ja“.",
                  en: "Herr Brandt does not like haste. Or 'yeah yeah'.",
                },
              },
            ],
          },
          d1b: {
            id: "d1b",
            npcLine: {
              de: "Ruhezeit ab 22 Uhr. Steht auch so im Haus. Sonst noch was?",
              en: "Quiet time from 10 pm. It is posted in the building too. Anything else?",
            },
            moves: [
              {
                id: "d1b_ok",
                tag: "Antworten",
                quality: 0.8,
                de: "Alles klar, ab 22 Uhr leise. Danke für die Erklärung.",
                en: "Got it, quiet from 10 pm. Thanks for explaining.",
                geduld: -2,
                mut: 8,
                next: "d2",
              },
            ],
          },
          d2: {
            id: "d2",
            npcLine: {
              de: "Gut. Sie brauchen bestimmt noch etwas fürs Amt, oder?",
              en: "Good. You probably still need something for the office, right?",
            },
            moves: [
              {
                id: "d2_bitte",
                tag: "Bitten",
                quality: 0.8,
                vocabId: "v_wohnungsgeberbestaetigung",
                de: "Ja, könnten Sie mir bitte die Wohnungsgeberbestätigung unterschreiben?",
                en: "Yes, could you please sign the landlord confirmation for me?",
                geduld: 2,
                mut: 10,
                next: "d3",
                feedback: {
                  de: "Genau das Wort, genau die Bitte. Perfekt.",
                  en: "Exactly the word, exactly the request. Perfect.",
                },
              },
              {
                id: "d2_grund",
                tag: "Nachfragen",
                quality: 0.6,
                redemittelId: "r_cla3",
                de: "Fürs Bürgeramt brauche ich eine Bestätigung. Wäre das möglich?",
                en: "For the citizens' office I need a confirmation. Would that be possible?",
                geduld: -2,
                mut: 6,
                next: "d3",
              },
              {
                id: "d2_fordern",
                tag: "Riskant",
                quality: 0.3,
                de: "Sie müssen mir das jetzt unterschreiben.",
                en: "You have to sign this for me now.",
                geduld: -10,
                mut: -6,
                next: "d2b",
                feedback: {
                  de: "„Müssen“ zum Vermieter? Herr Brandt zieht eine Augenbraue hoch.",
                  en: "'Have to' to a landlord? Herr Brandt raises one eyebrow.",
                },
              },
            ],
          },
          d2b: {
            id: "d2b",
            npcLine: {
              de: "Müssen tue ich gar nichts. Aber fragen Sie freundlich, dann reden wir.",
              en: "I do not have to do anything. But ask nicely, and we will talk.",
            },
            moves: [
              {
                id: "d2b_hoefl",
                tag: "Korrigieren",
                quality: 0.7,
                de: "Entschuldigung. Könnten Sie mir die Bestätigung bitte unterschreiben?",
                en: "Sorry. Could you please sign the confirmation for me?",
                geduld: 2,
                mut: 8,
                next: "d3",
                feedback: {
                  de: "Besser. Höflichkeit ist hier die stärkere Währung.",
                  en: "Better. Politeness is the stronger currency here.",
                },
              },
            ],
          },
          d3: {
            id: "d3",
            npcLine: {
              de: "Na also. Geht doch. Ich unterschreibe, Sie füllen den Rest aus.",
              en: "There you go. That works. I will sign, you fill in the rest.",
            },
            moves: [
              {
                id: "d3_danke",
                tag: "Danken",
                quality: 0.8,
                de: "Herzlichen Dank, Herr Brandt. Das hilft mir sehr.",
                en: "Many thanks, Herr Brandt. That helps me a lot.",
                geduld: 4,
                mut: 8,
                next: "d_win",
              },
            ],
          },
          d_win: {
            id: "d_win",
            npcLine: {
              de: "Willkommen im Haus. Das Formular liegt auf dem Tisch.",
              en: "Welcome to the building. The form is on the table.",
            },
            outcome: "win",
          },
          d_weg: {
            id: "d_weg",
            npcLine: {
              de: "Überlegen Sie es sich in Ruhe. Ich habe noch andere Interessenten.",
              en: "Think it over calmly. I have other interested people too.",
            },
            outcome: "lose",
          },
        },
      },
      formular: {
        id: "formular",
        kind: "formCloze",
        setting: "wohnung",
        label: "Am Tisch",
        next: "ende",
        grantsItems: ["ki_wohnungsgeberbestaetigung"],
        issuer: {
          de: "Wohnungsgeberbestätigung nach § 19 BMG",
          en: "Landlord confirmation under § 19 BMG",
        },
        title: "Bestätigung des Wohnungsgebers",
        titleEn: "Confirmation by the landlord",
        intro: {
          de: "Herr Brandt hat unterschrieben. Jetzt der Rest.",
          en: "Herr Brandt has signed. Now the rest.",
        },
        fields: [
          {
            id: "fd_geber",
            label: {
              de: "Der ___ bestätigt hiermit den Einzug.",
              en: "The ___ hereby confirms the move-in.",
            },
            answer: "Wohnungsgeber",
            options: ["Wohnungsgeber", "Wohnungssuchende", "Nachbar"],
            hint: {
              de: "Wohnungs + Geber: wer die Wohnung gibt.",
              en: "Wohnungs + Geber: the one who gives the flat.",
            },
          },
          {
            id: "fd_einzug",
            label: {
              de: "Ich bin am 1. September in die Wohnung ___.",
              en: "On 1 September I ___ into the flat.",
            },
            answer: "eingezogen",
            options: ["eingezogen", "ausgezogen", "eingeladen"],
            hint: {
              de: "einziehen = neu in eine Wohnung kommen",
              en: "einziehen = to move into a flat",
            },
          },
          {
            id: "fd_amt",
            label: {
              de: "Diese Bestätigung braucht das ___ für die Anmeldung.",
              en: "This confirmation is needed by the ___ for the registration.",
            },
            answer: "Amt",
            options: ["Amt", "Kino", "Café"],
            hint: {
              de: "Die Behörde, das Bürgeramt.",
              en: "The authority, the citizens' office.",
            },
          },
        ],
      },
      ende: {
        id: "ende",
        kind: "cutscene",
        setting: "wohnung",
        label: "Das Zwischenzimmer",
        end: "win",
        lines: [
          {
            speaker: "du",
            de: "Unterschrieben, ausgefüllt, eingesteckt. Die Wohnungsgeberbestätigung ist meine.",
            en: "Signed, filled in, pocketed. The landlord confirmation is mine.",
          },
          {
            speaker: "npc_jonas",
            de: "Das war das letzte Dokument vor dem Amt. Jetzt kommt Frau Schmidt.",
            en: "That was the last document before the office. Now comes Frau Schmidt.",
          },
          {
            speaker: "erzaehler",
            de: "Ein Zimmer, eine Nummer, ein Ticket, eine SIM. Neuland wird langsam zu Hause.",
            en: "A room, a number, a ticket, a SIM. Neuland is slowly becoming home.",
          },
        ],
      },
      nochmal: {
        id: "nochmal",
        kind: "cutscene",
        setting: "wohnung",
        label: "Herr Brandt",
        next: "brandt",
        lines: [
          {
            speaker: "npc_jonas",
            de: "Herr Brandt ist streng, aber fair. Höflich bleiben, freundlich fragen, nicht fordern.",
            en: "Herr Brandt is strict but fair. Stay polite, ask kindly, do not demand.",
          },
          {
            speaker: "du",
            de: "Höflich. Freundlich. Bitte statt müssen. Nochmal.",
            en: "Polite. Kind. Please instead of have-to. Again.",
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
