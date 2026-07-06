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
];

/* ---------------- missions ---------------- */

export const missions: Mission[] = [
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
                quality: 0.95,
                de: "Guten Morgen! Wären Sie so freundlich, mich anzumelden? Ich bin neu in Neustadt.",
                en: "Good morning! Would you be so kind as to register me? I am new in Neustadt.",
                geduld: 6,
                mut: 8,
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
                geduld: -2,
                mut: 4,
                next: "b2",
              },
              {
                id: "b1_du",
                tag: "Riskant",
                quality: 0.1,
                de: "Hey, ich brauch schnell die Anmeldung. Dauert das lange?",
                en: "Hey, I need the registration quickly. Will it take long?",
                geduld: -16,
                mut: -6,
                next: "b2",
                feedback: {
                  de: "Der lockere Ton kommt nicht gut an. Eine Augenbraue wandert nach oben.",
                  en: "The casual tone does not land well. One eyebrow rises.",
                },
              },
            ],
          },
          b2: {
            id: "b2",
            npcLine: {
              de: "Anmeldung. Dann brauche ich Ihren Personalausweis oder Reisepass.",
              en: "Registration. Then I need your identity card or passport.",
            },
            moves: [
              {
                id: "b2_doc",
                tag: "Dokument zeigen",
                quality: 0.8,
                vocabId: "v_personalausweis",
                requiresItem: "ki_personalausweis",
                de: "Hier ist mein Personalausweis.",
                en: "Here is my identity card.",
                geduld: -2,
                mut: 4,
                next: "b3",
                nextIfMissing: "b_ohne_ausweis",
              },
              {
                id: "b2_nachfragen",
                tag: "Nachfragen",
                quality: 0.5,
                redemittelId: "r_cla6",
                de: "Was genau meinen Sie mit „Reisepass“? Gilt auch eine Kopie?",
                en: "What exactly do you mean by 'passport'? Does a copy count?",
                geduld: -8,
                mut: 2,
                next: "b2",
                feedback: {
                  de: "„Im Original“, sagt sie. Natürlich im Original.",
                  en: "'In the original,' she says. Of course in the original.",
                },
              },
              {
                id: "b2_zeit",
                tag: "Zeit gewinnen",
                quality: 0.4,
                de: "Einen Moment bitte, ich habe ihn gleich gefunden.",
                en: "One moment please, I will find it in a second.",
                geduld: -8,
                mut: 0,
                next: "b2",
              },
            ],
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
                id: "b3_doc",
                tag: "Dokument zeigen",
                quality: 0.8,
                vocabId: "v_wohnungsgeberbestaetigung",
                requiresItem: "ki_wohnungsgeberbestaetigung",
                de: "Die Wohnungsgeberbestätigung habe ich hier, unterschrieben vom Vermieter.",
                en: "I have the landlord confirmation here, signed by the landlord.",
                geduld: -2,
                mut: 6,
                next: "b4",
                nextIfMissing: "b_ohne_wgb",
              },
              {
                id: "b3_nachhaken",
                tag: "Nachhaken",
                quality: 0.85,
                redemittelId: "r_cla2",
                de: "Wenn ich Sie richtig verstehe, meinen Sie die Bestätigung von meinem Vermieter?",
                en: "If I understand you correctly, you mean the confirmation from my landlord?",
                geduld: -2,
                mut: 6,
                next: "b3b",
                feedback: {
                  de: "Präzise nachgefragt. Das Beamtendeutsch verliert seinen Schrecken.",
                  en: "Precisely asked. The official German loses its terror.",
                },
              },
              {
                id: "b3_panik",
                tag: "Riskant",
                quality: 0.2,
                de: "Äh... welche Bestätigung? Davon höre ich zum ersten Mal.",
                en: "Uh... which confirmation? This is the first I have heard of it.",
                geduld: -14,
                mut: -8,
                next: "b3",
                feedback: {
                  de: "Frau Schmidt seufzt. Dieses Seufzen hat Jahrzehnte Übung.",
                  en: "Frau Schmidt sighs. That sigh has decades of practice.",
                },
              },
            ],
          },
          b3b: {
            id: "b3b",
            npcLine: { de: "Genau die. Haben Sie sie dabei?", en: "Exactly that one. Do you have it with you?" },
            moves: [
              {
                id: "b3b_doc",
                tag: "Dokument zeigen",
                quality: 0.8,
                vocabId: "v_wohnungsgeberbestaetigung",
                requiresItem: "ki_wohnungsgeberbestaetigung",
                de: "Ja, hier ist die Wohnungsgeberbestätigung.",
                en: "Yes, here is the landlord confirmation.",
                geduld: -2,
                mut: 4,
                next: "b4",
                nextIfMissing: "b_ohne_wgb",
              },
              {
                id: "b3b_leider",
                tag: "Zeit gewinnen",
                quality: 0.3,
                de: "Ich glaube schon. Irgendwo.",
                en: "I think so. Somewhere.",
                geduld: -10,
                mut: -2,
                next: "b3b",
              },
            ],
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
                quality: 0.9,
                de: "Sehr gern. Hätten Sie vielleicht einen Kugelschreiber für mich?",
                en: "Gladly. Would you perhaps have a pen for me?",
                geduld: -2,
                mut: 6,
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
                mut: 2,
                next: "b_sieg",
              },
              {
                id: "b4_online",
                tag: "Riskant",
                quality: 0.3,
                de: "Kann ich das nicht einfach online machen?",
                en: "Can I not just do this online?",
                geduld: -12,
                mut: 0,
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
