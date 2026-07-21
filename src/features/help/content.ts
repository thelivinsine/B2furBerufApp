/**
 * Help & guides content bank (/hilfe). One bilingual source of truth shared by
 * BOTH the in-app React reader (HelpHub / HelpArticle) AND the build-time
 * prerender script (scripts/prerender-help.mjs), which emits a real static HTML
 * file per article so crawlers and social previews see the full text without
 * running JavaScript (the same "raw HTML for no-JS clients" approach the boot
 * splash and sitemap already use).
 *
 * Writing rule (CLAUDE.md): NO em dashes in any copy. Use periods, commas,
 * colons or parentheses instead. Keep both the `de` and `en` bodies in sync.
 */

export type Lang = "de" | "en";
export type Bilingual = { de: string; en: string };

/** A single content block. Kept deliberately small so the React renderer and
 *  the plain-HTML serializer in the prerender script stay trivial and in sync. */
export type HelpBlock =
  | { type: "p"; de: string; en: string }
  | { type: "h2"; de: string; en: string }
  | { type: "h3"; de: string; en: string }
  | { type: "ul"; de: string[]; en: string[] }
  | { type: "steps"; de: string[]; en: string[] }
  | { type: "note"; de: string; en: string };

export type HelpFaq = { q: Bilingual; a: Bilingual };

export type HelpCategory = "grundlagen" | "ueben" | "spielen";

export type HelpArticle = {
  slug: string;
  category: HelpCategory;
  /** lucide-react icon name, resolved in the hub UI. */
  icon: string;
  title: Bilingual;
  /** Doubles as the meta description and the hub-card subtitle. Keep it a
   *  single, self-contained sentence (~150 chars) for search snippets. */
  description: Bilingual;
  updated: string;
  body: HelpBlock[];
  faq?: HelpFaq[];
  /** slugs of related articles, shown at the foot of the reader. */
  related?: string[];
};

export const HELP_BASE_URL = "https://genauly.de";

export const helpCategories: Record<HelpCategory, Bilingual> = {
  grundlagen: { de: "Grundlagen", en: "Getting started" },
  ueben: { de: "Üben", en: "Practice (Üben)" },
  spielen: { de: "Spielen", en: "Play (Spielen)" },
};

export const helpHub = {
  title: { de: "Hilfe & Anleitungen", en: "Help & guides" } as Bilingual,
  description: {
    de: "So funktionieren Üben und Spielen in Genauly: der Lernpfad mit verteilter Wiederholung und die Story-Missionen der Welt Neuland.",
    en: "How Üben and Spielen work in Genauly: the learning path with spaced repetition and the story missions of the world of Neuland.",
  } as Bilingual,
  intro: {
    de: "Genauly hat zwei Wege, dein Deutsch auf B1 bis B2 zu bringen: Üben und Spielen. Üben ist dein tägliches Training mit verteilter Wiederholung. Spielen ist Neuland, eine Story, in der du Deutsch in echten Situationen anwendest. Diese Anleitungen erklären beide Wege und wie sie zusammenarbeiten.",
    en: "Genauly gives you two ways to push your German from B1 to B2: Üben and Spielen. Üben is your daily training with spaced repetition. Spielen is Neuland, a story where you use German in real situations. These guides explain both, and how they work together.",
  } as Bilingual,
  faq: [
    {
      q: { de: "Was ist der Unterschied zwischen Üben und Spielen?", en: "What is the difference between Üben and Spielen?" },
      a: {
        de: "Üben ist gezieltes Training: kurze Lerneinheiten, die den Wortschatz und die Redemittel einer Situation mit verteilter Wiederholung festigen. Spielen ist die Story Neuland, in der du dieselben Situationen als Missionen durchspielst. Beide teilen sich denselben Fortschritt.",
        en: "Üben is focused training: short sessions that lock in the vocabulary and phrases of a situation with spaced repetition. Spielen is the Neuland story, where you play through the same situations as missions. Both share the same progress.",
      },
    },
    {
      q: { de: "Kostet Genauly etwas?", en: "Does Genauly cost anything?" },
      a: {
        de: "Der Einstieg ist kostenlos und ohne Konto möglich. Wenn du dich anmeldest, wird dein Fortschritt über alle Geräte hinweg gespeichert.",
        en: "You can start for free with no account. If you sign in, your progress is saved across all your devices.",
      },
    },
    {
      q: { de: "Für welches Niveau ist Genauly gedacht?", en: "What level is Genauly for?" },
      a: {
        de: "Für das Zwischenniveau, ungefähr B1 bis B2. Die Inhalte sind nach CEFR-Stufe getaggt, du beginnst also dort, wo du dich wohlfühlst.",
        en: "The intermediate plateau, roughly B1 to B2. Content is tagged by CEFR level, so you start where you are comfortable.",
      },
    },
  ] as HelpFaq[],
};

/* -------------------------------------------------------------------------- */
/*  Articles                                                                    */
/* -------------------------------------------------------------------------- */

export const helpArticles: HelpArticle[] = [
  {
    slug: "erste-schritte",
    category: "grundlagen",
    icon: "Rocket",
    updated: "2026-07-10",
    title: { de: "Erste Schritte mit Genauly", en: "Getting started with Genauly" },
    description: {
      de: "Ein Überblick über Genauly: wie du beginnst, was Üben und Spielen sind und wie dein Fortschritt gespeichert wird.",
      en: "An overview of Genauly: how to begin, what Üben and Spielen are, and how your progress is saved.",
    },
    body: [
      {
        type: "p",
        de: "Genauly ist eine Lern-App für Erwachsene, die schon Grundkenntnisse in Deutsch haben, aber auf dem Zwischenniveau feststecken. Statt weiterer Grammatiktabellen übst du Deutsch in echten Situationen: bei der Arbeit, auf dem Amt, beim Arzt, bei der Wohnungssuche und in der Prüfungsvorbereitung.",
        en: "Genauly is a learning app for adults who already know some German but feel stuck at the intermediate level. Instead of more grammar tables, you practise German in real situations: at work, at the Behörde, at the doctor, looking for a flat, and preparing for exams.",
      },
      {
        type: "h2",
        de: "Die zwei Wege: Üben und Spielen",
        en: "The two paths: Üben and Spielen",
      },
      {
        type: "p",
        de: "Auf dem Startbildschirm (Praktisch) findest du zwei Tabs. Üben ist dein tägliches Training. Spielen führt dich in die Story-Welt Neuland. Du kannst frei zwischen beiden wechseln, denn sie teilen sich denselben Lernfortschritt.",
        en: "On the home screen (Praktisch) you will find two tabs. Üben is your daily training. Spielen takes you into the story world Neuland. You can switch freely between them, because they share the same learning progress.",
      },
      {
        type: "ul",
        de: [
          "Üben: kurze Lerneinheiten, die Wortschatz, Redemittel und Grammatik einer Situation festigen.",
          "Spielen: Missionen in Neuland, in denen du dieselben Situationen als Geschichte durchspielst.",
        ],
        en: [
          "Üben: short sessions that lock in the vocabulary, phrases and grammar of a situation.",
          "Spielen: missions in Neuland where you play through the same situations as a story.",
        ],
      },
      {
        type: "h2",
        de: "So beginnst du",
        en: "How to begin",
      },
      {
        type: "steps",
        de: [
          "Öffne Genauly und wähle beim Onboarding dein ungefähres Niveau und deine Ziele.",
          "Starte im Tab Üben eine kurze Lerneinheit, oder tippe im Tab Spielen auf die erste Mission in Neuland.",
          "Melde dich an, wenn du deinen Fortschritt über Handy, Tablet und Laptop hinweg sichern möchtest.",
        ],
        en: [
          "Open Genauly and pick your approximate level and goals during onboarding.",
          "Start a short session in the Üben tab, or tap the first mission in Neuland in the Spielen tab.",
          "Sign in whenever you want to save your progress across phone, tablet and laptop.",
        ],
      },
      {
        type: "note",
        de: "Du brauchst kein Konto, um loszulegen. Anmelden lohnt sich nur, wenn du auf mehreren Geräten weiterlernen willst.",
        en: "You do not need an account to start. Signing in is only worth it if you want to keep learning across several devices.",
      },
    ],
    faq: [
      {
        q: { de: "Muss ich mich anmelden?", en: "Do I have to sign in?" },
        a: {
          de: "Nein. Du kannst sofort und ohne Konto starten. Die Anmeldung speichert deinen Fortschritt geräteübergreifend.",
          en: "No. You can start right away with no account. Signing in saves your progress across devices.",
        },
      },
      {
        q: { de: "Auf welchen Geräten läuft Genauly?", en: "Which devices does Genauly run on?" },
        a: {
          de: "Genauly läuft im Browser und lässt sich auf dem Startbildschirm als App installieren. Es funktioniert auf Handy, Tablet und Laptop.",
          en: "Genauly runs in your browser and can be installed to your home screen as an app. It works on phone, tablet and laptop.",
        },
      },
    ],
    related: ["app-installieren", "ueben", "spielen-neuland"],
  },

  {
    slug: "app-installieren",
    category: "grundlagen",
    icon: "Smartphone",
    updated: "2026-07-21",
    title: { de: "Genauly als App aufs Handy", en: "Add Genauly to your phone" },
    description: {
      de: "So legst du Genauly in wenigen Sekunden als App auf deinen Startbildschirm, auf iPhone und Android. Ohne Download, ohne App Store.",
      en: "How to add Genauly to your home screen as an app in seconds, on iPhone and Android. No download, no app store.",
    },
    body: [
      {
        type: "p",
        de: "Genauly läuft im Browser, du kannst es aber wie eine echte App auf den Startbildschirm legen. Danach öffnest du es mit einem Tipp auf das Symbol, im Vollbild und auch offline für schon geladene Inhalte. Du musst nichts aus einem App Store herunterladen.",
        en: "Genauly runs in your browser, but you can place it on your home screen like a real app. After that you open it with one tap on the icon, full screen and even offline for content you have already loaded. There is nothing to download from an app store.",
      },
      {
        type: "h2",
        de: "iPhone und iPad (Safari)",
        en: "iPhone and iPad (Safari)",
      },
      {
        type: "steps",
        de: [
          "Öffne genauly.de in Safari.",
          "Tippe unten auf das Teilen-Symbol (das Quadrat mit dem Pfeil nach oben).",
          "Wähle in der Liste Zum Home-Bildschirm.",
          "Tippe oben rechts auf Hinzufügen. Fertig, das Genauly-Symbol liegt jetzt auf deinem Startbildschirm.",
        ],
        en: [
          "Open genauly.de in Safari.",
          "Tap the share icon at the bottom (the square with an arrow pointing up).",
          "Choose Add to Home Screen in the list.",
          "Tap Add in the top right. Done, the Genauly icon is now on your home screen.",
        ],
      },
      {
        type: "note",
        de: "Auf dem iPhone klappt das nur in Safari, nicht in Chrome. Öffne genauly.de also zuerst in Safari.",
        en: "On iPhone this only works in Safari, not Chrome. So open genauly.de in Safari first.",
      },
      {
        type: "h2",
        de: "Android (Chrome)",
        en: "Android (Chrome)",
      },
      {
        type: "steps",
        de: [
          "Öffne genauly.de in Chrome.",
          "Tippe oben rechts auf das Menü (die drei Punkte).",
          "Wähle App installieren oder Zum Startbildschirm hinzufügen.",
          "Bestätige mit Installieren oder Hinzufügen. Das Symbol erscheint auf deinem Startbildschirm.",
        ],
        en: [
          "Open genauly.de in Chrome.",
          "Tap the menu in the top right (the three dots).",
          "Choose Install app or Add to Home screen.",
          "Confirm with Install or Add. The icon appears on your home screen.",
        ],
      },
      {
        type: "h2",
        de: "Laptop und PC",
        en: "Laptop and desktop",
      },
      {
        type: "p",
        de: "Auch am Computer kannst du Genauly installieren. In Chrome oder Edge erscheint rechts in der Adressleiste ein kleines Installieren-Symbol. Ein Klick darauf legt Genauly als eigenes Fenster an.",
        en: "You can install Genauly on your computer too. In Chrome or Edge a small install icon appears at the right of the address bar. One click on it opens Genauly in its own window.",
      },
      {
        type: "note",
        de: "Dein Fortschritt bleibt derselbe. Wenn du dich anmeldest, findest du deine Wörter und deinen Fortschritt in der installierten App genauso wieder wie im Browser.",
        en: "Your progress stays the same. If you sign in, your words and progress appear in the installed app exactly as in the browser.",
      },
    ],
    faq: [
      {
        q: {
          de: "Kostet die App etwas oder brauche ich einen App Store?",
          en: "Does the app cost anything, or do I need an app store?",
        },
        a: {
          de: "Nein. Es gibt keinen Download und keine Kosten. Du legst nur die Webseite als Symbol auf den Startbildschirm.",
          en: "No. There is no download and no cost. You only place the website as an icon on your home screen.",
        },
      },
      {
        q: {
          de: "Ich sehe die Option nicht. Was tun?",
          en: "I do not see the option. What should I do?",
        },
        a: {
          de: "Nutze auf dem iPhone Safari und auf Android Chrome. In anderen Browsern fehlt die Funktion manchmal. Lade die Seite einmal neu und öffne das Teilen- oder Menü-Symbol erneut.",
          en: "Use Safari on iPhone and Chrome on Android. Some other browsers do not offer the option. Reload the page once and open the share or menu icon again.",
        },
      },
    ],
    related: ["erste-schritte", "ueben", "spielen-neuland"],
  },

  {
    slug: "ueben",
    category: "ueben",
    icon: "Dumbbell",
    updated: "2026-07-10",
    title: { de: "Üben: dein persönlicher Lernpfad", en: "Üben: your personal learning path" },
    description: {
      de: "Üben ist das tägliche Training in Genauly: kurze Lerneinheiten mit Wortschatz, Redemittel, Grammatik, Sprechen und Lesen, gesteuert von verteilter Wiederholung.",
      en: "Üben is your daily training in Genauly: short sessions with vocabulary, phrases, grammar, speaking and reading, driven by spaced repetition.",
    },
    body: [
      {
        type: "p",
        de: "Der Tab Üben ist dein Trainingsraum. Er zeigt einen Lernpfad, eine kleine Stadtkarte mit Stationen für die Situationen, die du gerade lernst. Von hier startest du kurze, gemischte Lerneinheiten, die genau die Wörter und Redemittel festigen, die du für die jeweilige Situation brauchst.",
        en: "The Üben tab is your training room. It shows a learning path, a small city map with stops for the situations you are currently learning. From here you start short, mixed sessions that lock in exactly the words and phrases you need for each situation.",
      },
      {
        type: "h2",
        de: "Was in einer Lerneinheit steckt",
        en: "What a session is made of",
      },
      {
        type: "p",
        de: "Jede Lerneinheit ist bewusst kurz und mischt verschiedene Übungsarten, damit du eine Situation aus mehreren Blickwinkeln übst:",
        en: "Each session is deliberately short and mixes several exercise types, so you practise a situation from several angles:",
      },
      {
        type: "ul",
        de: [
          "Wortschatz und Redemittel als Karteikarten (Wiedererkennen und aktives Abrufen).",
          "Kurze Quizfragen mit sofortigem Feedback.",
          "Gezielte Grammatikübungen zu typischen B2-Stolpersteinen.",
          "Tippen: die Antwort selbst schreiben, statt nur auszuwählen.",
          "Sprechen mit Text-to-Speech und optionaler Spracherkennung (Mikrofon freiwillig).",
          "Lesen und Hören: kurze, lebensnahe Texte mit Verständnisfragen.",
        ],
        en: [
          "Vocabulary and phrases as flashcards (recognition and active recall).",
          "Short quiz questions with instant feedback.",
          "Targeted grammar drills on typical B2 stumbling blocks.",
          "Typing: writing the answer yourself instead of only choosing it.",
          "Speaking with text-to-speech and optional speech recognition (microphone is voluntary).",
          "Reading and listening: short, lifelike texts with comprehension questions.",
        ],
      },
      {
        type: "h2",
        de: "Der Lernpfad",
        en: "The learning path",
      },
      {
        type: "p",
        de: "Die Karte im Tab Üben zeigt deinen Weg durch eine Reihe von Situationen. Eine Markierung zeigt, wo du gerade bist. Erledigte Stationen bekommen einen Punkt, die kommenden sind gestrichelt angedeutet. Unter der Karte wählst du das Modul, das du üben willst, und startest mit einem Tipp die passende Lerneinheit.",
        en: "The map in the Üben tab shows your route through a series of situations. A marker shows where you are. Completed stops get a dot, the ones ahead are shown as a dotted line. Below the map you pick the module you want to practise and start the matching session with one tap.",
      },
      {
        type: "note",
        de: "Üben und Spielen sind auf dieselben Situationen abgestimmt. Wenn du in Neuland eine Mission spielst, übt der passende Pfad in Üben genau deren Wortschatz und Redemittel.",
        en: "Üben and Spielen are aligned to the same situations. When you play a mission in Neuland, the matching path in Üben practises exactly its vocabulary and phrases.",
      },
      {
        type: "h2",
        de: "Warum verteilte Wiederholung",
        en: "Why spaced repetition",
      },
      {
        type: "p",
        de: "Genauly entscheidet für dich, wann ein Wort wieder dran ist. Kurz bevor du es vergessen würdest, taucht es erneut auf. So bleibt der Aufwand klein und du behältst mehr. Wie das genau funktioniert, erklärt die Anleitung zur verteilten Wiederholung.",
        en: "Genauly decides for you when a word is due again. Just before you would forget it, it comes back. That keeps the effort small and helps you retain more. The spaced repetition guide explains exactly how this works.",
      },
    ],
    faq: [
      {
        q: { de: "Wie lange dauert eine Lerneinheit?", en: "How long is a session?" },
        a: {
          de: "Die meisten Lerneinheiten sind auf wenige Minuten ausgelegt. Die Schnellwiederholung ist die kürzeste Voreinstellung, ideal für zwischendurch.",
          en: "Most sessions are designed to take a few minutes. The quick review is the shortest preset, ideal for a spare moment.",
        },
      },
      {
        q: { de: "Brauche ich ein Mikrofon?", en: "Do I need a microphone?" },
        a: {
          de: "Nein. Sprechübungen mit Spracherkennung sind freiwillig und werden extra eingeschaltet. Text-to-Speech funktioniert ohne Mikrofon.",
          en: "No. Speaking exercises with speech recognition are voluntary and opt-in. Text-to-speech works without a microphone.",
        },
      },
    ],
    related: ["spaced-repetition", "ueben-und-spielen", "spielen-neuland"],
  },

  {
    slug: "spielen-neuland",
    category: "spielen",
    icon: "Gamepad2",
    updated: "2026-07-10",
    title: { de: "Spielen: die Welt von Neuland", en: "Spielen: the world of Neuland" },
    description: {
      de: "Neuland ist die Story-Welt in Genauly: ein Pixel-Rollenspiel, in dem du als Neuankömmling Deutsch in echten Situationen anwendest, von der Fahrkarte bis zur Anmeldung.",
      en: "Neuland is the story world in Genauly: a pixel role-playing game where you arrive as a newcomer and use German in real situations, from buying a ticket to registering your address.",
    },
    body: [
      {
        type: "p",
        de: "Spielen führt dich nach Neuland, einer Stadt, in der du als Neuankömmling ankommst. Neuland ist ein Pixel-Rollenspiel, in dem jede Mission eine echte Alltagssituation nachspielt. Du wendest Deutsch dort an, wo es zählt, statt es nur abzufragen.",
        en: "Spielen takes you to Neuland, a city where you arrive as a newcomer. Neuland is a pixel role-playing game where every mission recreates a real everyday situation. You use German where it counts, instead of only being quizzed on it.",
      },
      {
        type: "h2",
        de: "Wie sich eine Mission spielt",
        en: "How a mission plays",
      },
      {
        type: "p",
        de: "Eine Mission läuft im Vollbild als kleine Szene ab, mit wenig Text und viel Interaktion. Statt Vokabellisten abzuarbeiten, tippst, sprichst und antwortest du in Gesprächen. Manche Szenen sind Gespräche, andere ein Automat oder ein Formular.",
        en: "A mission plays full screen as a small scene, with little text and a lot of interaction. Instead of working through vocabulary lists, you tap, speak and answer in conversations. Some scenes are conversations, others a machine or a form.",
      },
      {
        type: "ul",
        de: [
          "Gespräche laufen wie kleine Duelle: Zwei Anzeigen, Geduld und Mut, sollen hoch bleiben, indem du passend und höflich antwortest.",
          "Dein Rucksack ist immer dabei. Wenn jemand ein Dokument verlangt, tippst du es im Rucksack an, statt lange Sätze zu suchen.",
          "Das Wörterbuch ist eine begrenzte Hilfe: Es zeigt dir pro Mission einige Male die englische Bedeutung der aktuellen Szene.",
        ],
        en: [
          "Conversations play like small duels: two meters, Geduld (patience) and Mut (courage), should stay high as you answer aptly and politely.",
          "Your backpack is always with you. When someone asks for a document, you tap it in the backpack instead of hunting for long sentences.",
          "The dictionary is a limited helper: a few times per mission it reveals the English meaning of the current scene.",
        ],
      },
      {
        type: "note",
        de: "Scheitern ist Teil des Spiels, kein Rausschmiss. Verlierst du ein Gespräch, führt dich das Spiel in eine Wiederholung mit mehr Unterstützung. Es gibt keine Leben und keine Energiebalken.",
        en: "Failing is part of the game, not a lockout. If you lose a conversation, the game routes you into a retry with more support. There are no lives and no energy meters.",
      },
      {
        type: "h2",
        de: "Kapitel 1: Ankommen",
        en: "Chapter 1: Arriving",
      },
      {
        type: "p",
        de: "Das erste Kapitel spielt im Bahnhofsviertel und begleitet deine ersten Tage in Neuland. Es besteht aus sechs Missionen, die aufeinander aufbauen und mit einer Behörden-Aufgabe enden. Details stehen in der Anleitung zu Kapiteln und Missionen.",
        en: "The first chapter is set in the station district and follows your first days in Neuland. It has six missions that build on each other and end with a task at a government office. Details are in the chapters and missions guide.",
      },
    ],
    faq: [
      {
        q: { de: "Kann ich in Neuland verlieren und feststecken?", en: "Can I lose in Neuland and get stuck?" },
        a: {
          de: "Nein. Verlierst du ein Gespräch, kommst du in eine Wiederholung mit mehr Hilfe. Es gibt keine Leben und keine Sperren.",
          en: "No. If you lose a conversation you enter a retry with more help. There are no lives and no lockouts.",
        },
      },
      {
        q: { de: "Ist Neuland fertig?", en: "Is Neuland finished?" },
        a: {
          de: "Kapitel 1 (Ankommen) ist vollständig spielbar. Neuland ist als Beta gekennzeichnet, weitere Kapitel folgen.",
          en: "Chapter 1 (Arriving) is fully playable. Neuland is marked as a Beta, and more chapters are on the way.",
        },
      },
    ],
    related: ["neuland-kapitel-missionen", "ueben-und-spielen", "ueben"],
  },

  {
    slug: "neuland-kapitel-missionen",
    category: "spielen",
    icon: "Map",
    updated: "2026-07-10",
    title: { de: "Neuland: Kapitel und Missionen", en: "Neuland: chapters and missions" },
    description: {
      de: "Ein Überblick über die Struktur von Neuland: die Kapitel als Stadtviertel und die sechs Missionen von Kapitel 1, von der Ankunft bis zur Anmeldung.",
      en: "An overview of how Neuland is structured: chapters as city districts, and the six missions of Chapter 1, from arrival to registering your address.",
    },
    body: [
      {
        type: "p",
        de: "Neuland erzählt eine durchgehende Geschichte, aufgeteilt in Kapitel. Jedes Kapitel ist ein Stadtviertel mit einem Lebensthema. Innerhalb eines Kapitels spielst du einzelne Missionen, kurze Situationen, die aufeinander aufbauen.",
        en: "Neuland tells one continuous story, split into chapters. Each chapter is a city district with a life theme. Within a chapter you play individual missions, short situations that build on each other.",
      },
      {
        type: "h2",
        de: "Die Kapitel",
        en: "The chapters",
      },
      {
        type: "ul",
        de: [
          "Kapitel 1, Ankommen (Bahnhofsviertel): deine ersten Tage in der Stadt.",
          "Kapitel 2, Wohnen (Altbauviertel): eine Wohnung finden und einrichten.",
          "Kapitel 3, Geld und Papierkram (Innenstadt): Konto, Verträge, Formulare.",
          "Kapitel 4, Die Jobsuche (Agentur und Zuhause): Bewerbung und Vorstellungsgespräch.",
          "Kapitel 5, Gesund und Sozial (Kiez und Stadtpark): Arzt, Nachbarschaft, Kontakte.",
          "Kapitel 6, Mein Ziel (ganz Neustadt): dein persönliches Ziel in Neuland.",
        ],
        en: [
          "Chapter 1, Arriving (station district): your first days in the city.",
          "Chapter 2, Living (old-building district): finding and setting up a flat.",
          "Chapter 3, Money and paperwork (city centre): account, contracts, forms.",
          "Chapter 4, The job hunt (agency and home): applications and interviews.",
          "Chapter 5, Healthy and social (neighbourhood and park): doctor, neighbours, contacts.",
          "Chapter 6, My goal (all of Neustadt): your personal goal in Neuland.",
        ],
      },
      {
        type: "note",
        de: "Kapitel 1 ist vollständig spielbar. Die weiteren Kapitel sind Teil der laufenden Entwicklung von Neuland.",
        en: "Chapter 1 is fully playable. The later chapters are part of the ongoing development of Neuland.",
      },
      {
        type: "h2",
        de: "Die sechs Missionen von Kapitel 1",
        en: "The six missions of Chapter 1",
      },
      {
        type: "steps",
        de: [
          "Willkommen in Neuland: die Ankunft und die ersten Worte.",
          "Der Fahrkarten-Automat: ein Ticket am Automaten lösen.",
          "Die SIM-Karte: eine SIM-Karte kaufen und einrichten.",
          "Der erste Einkauf: im Laden zurechtkommen.",
          "Ein Dach über dem Kopf: die erste Unterkunft klären.",
          "Die Anmeldung: der Termin bei der Meldebehörde, das Finale des Kapitels.",
        ],
        en: [
          "Welcome to Neuland: arriving and the first words.",
          "The ticket machine: buying a ticket at the machine.",
          "The SIM card: buying and setting up a SIM card.",
          "The first shopping trip: getting by in the shop.",
          "A roof over your head: sorting out your first place to stay.",
          "The registration: the appointment at the registration office, the chapter finale.",
        ],
      },
      {
        type: "p",
        de: "Die Missionen 2 bis 5 bauen aufeinander auf, du spielst sie also der Reihe nach. Das Finale, Die Anmeldung, ist bewusst frei zugänglich, damit du die Kern-Situation des Kapitels jederzeit ausprobieren kannst.",
        en: "Missions 2 to 5 build on each other, so you play them in order. The finale, The registration, is deliberately open so you can try the core situation of the chapter at any time.",
      },
      {
        type: "h2",
        de: "Dieselbe Situation üben",
        en: "Practising the same situation",
      },
      {
        type: "p",
        de: "Zu jeder Mission gibt es im Tab Üben einen passenden Trainingspfad. Er beginnt mit genau dem Wortschatz und den Redemitteln, die in der Mission vorkommen, und füllt danach mit weiteren Übungen zum Thema auf. So kannst du eine Mission zuerst üben und dann spielen, oder umgekehrt.",
        en: "For every mission there is a matching training path in the Üben tab. It starts with exactly the vocabulary and phrases that appear in the mission, then fills up with more practice on the topic. So you can practise a mission first and then play it, or the other way round.",
      },
    ],
    related: ["spielen-neuland", "ueben-und-spielen", "ueben"],
  },

  {
    slug: "spaced-repetition",
    category: "ueben",
    icon: "Repeat",
    updated: "2026-07-10",
    title: { de: "Wie Wiederholung funktioniert", en: "How spaced repetition works" },
    description: {
      de: "Genauly nutzt verteilte Wiederholung (Spaced Repetition), damit Wörter genau dann wiederkommen, bevor du sie vergisst. So lernst du mit weniger Aufwand mehr.",
      en: "Genauly uses spaced repetition so words come back right before you would forget them. That way you learn more with less effort.",
    },
    body: [
      {
        type: "p",
        de: "Wenn du etwas Neues lernst, vergisst du es schnell wieder, außer du wiederholst es. Verteilte Wiederholung (auf Englisch spaced repetition) plant diese Wiederholungen so, dass ein Wort immer kurz vor dem Vergessen wieder auftaucht. Jedes richtige Erinnern verlängert den Abstand bis zur nächsten Wiederholung.",
        en: "When you learn something new, you forget it quickly unless you review it. Spaced repetition schedules those reviews so a word always reappears just before you would forget it. Each successful recall lengthens the gap until the next review.",
      },
      {
        type: "h2",
        de: "Was du dafür tun musst",
        en: "What you need to do",
      },
      {
        type: "p",
        de: "Fast nichts. Du übst einfach, und Genauly plant im Hintergrund, wann jedes Wort wieder dran ist. Du musst keine Intervalle einstellen und keine Listen pflegen. Kurze, regelmäßige Lerneinheiten wirken dabei stärker als seltenes, langes Pauken.",
        en: "Almost nothing. You just practise, and Genauly schedules in the background when each word is due again. You do not have to set intervals or maintain lists. Short, regular sessions work better than rare, long cramming.",
      },
      {
        type: "ul",
        de: [
          "Wörter, die du sicher kannst, kommen seltener und in wachsenden Abständen.",
          "Wörter, die du oft verwechselst, kommen häufiger, bis sie sitzen.",
          "Neue Wörter werden nach und nach eingemischt, damit dich nichts überfordert.",
        ],
        en: [
          "Words you know well come back less often, at growing intervals.",
          "Words you often get wrong come back more often, until they stick.",
          "New words are mixed in gradually, so nothing overwhelms you.",
        ],
      },
      {
        type: "note",
        de: "Der beste Rhythmus ist kurz und täglich. Schon wenige Minuten pro Tag halten deine Wiederholungen aktuell und deinen Wortschatz wach.",
        en: "The best rhythm is short and daily. Even a few minutes a day keeps your reviews current and your vocabulary awake.",
      },
      {
        type: "h2",
        de: "Verteilte Wiederholung in Üben und Spielen",
        en: "Spaced repetition in Üben and Spielen",
      },
      {
        type: "p",
        de: "Beide Wege speisen dieselbe Wiederholungsplanung. Wenn du in Neuland eine Vokabel richtig anwendest, zählt das genauso wie eine richtige Antwort im Training. Deshalb ergänzen sich Üben und Spielen: Spielen zeigt dir, ob du ein Wort wirklich benutzen kannst, Üben sorgt dafür, dass es nicht verloren geht.",
        en: "Both paths feed the same review schedule. When you use a word correctly in Neuland, it counts just like a correct answer in training. That is why Üben and Spielen complement each other: Spielen shows whether you can really use a word, Üben makes sure it is not lost.",
      },
    ],
    faq: [
      {
        q: { de: "Muss ich Intervalle selbst einstellen?", en: "Do I have to set intervals myself?" },
        a: {
          de: "Nein. Genauly plant alle Wiederholungen automatisch. Du übst einfach, der Rest passiert im Hintergrund.",
          en: "No. Genauly schedules all reviews automatically. You just practise, the rest happens in the background.",
        },
      },
    ],
    related: ["ueben", "ueben-und-spielen"],
  },

  {
    slug: "ueben-und-spielen",
    category: "grundlagen",
    icon: "Sparkles",
    updated: "2026-07-10",
    title: { de: "Üben und Spielen zusammen nutzen", en: "Using Üben and Spielen together" },
    description: {
      de: "Üben und Spielen teilen sich denselben Fortschritt. So kombinierst du das Training im Lernpfad mit den Missionen in Neuland für den schnellsten Weg zu B2.",
      en: "Üben and Spielen share the same progress. Here is how to combine training on the learning path with the missions in Neuland for the fastest route to B2.",
    },
    body: [
      {
        type: "p",
        de: "Üben und Spielen sind keine getrennten Modi, sondern zwei Seiten derselben Sache. Sie teilen sich denselben Lernfortschritt: Erfahrungspunkte, die Wiederholungsplanung deines Wortschatzes und die Schlüssel-Dokumente aus dem Spiel. Was du an einer Stelle tust, wirkt an der anderen.",
        en: "Üben and Spielen are not separate modes but two sides of the same thing. They share the same learning progress: experience points, the review schedule of your vocabulary, and the key documents from the game. What you do in one place shows up in the other.",
      },
      {
        type: "h2",
        de: "Ein einfacher Rhythmus",
        en: "A simple rhythm",
      },
      {
        type: "steps",
        de: [
          "Übe zuerst die Situation im Tab Üben. Der Pfad startet mit genau dem Wortschatz und den Redemitteln der passenden Mission.",
          "Spiele dann dieselbe Mission in Neuland. Jetzt wendest du an, was du geübt hast, in einer echten Szene.",
          "Komm über die Tage zum Üben zurück. Die verteilte Wiederholung frischt genau die Wörter auf, die zu verblassen drohen.",
        ],
        en: [
          "First practise the situation in the Üben tab. The path starts with exactly the vocabulary and phrases of the matching mission.",
          "Then play the same mission in Neuland. Now you apply what you practised, in a real scene.",
          "Come back to Üben over the following days. Spaced repetition refreshes exactly the words that are starting to fade.",
        ],
      },
      {
        type: "note",
        de: "Üben Mission 3 und Spielen Mission 3 gehören zusammen. Der Trainingspfad ist bewusst an dieselbe Situation gekoppelt wie die Mission.",
        en: "Üben mission 3 and Spielen mission 3 belong together. The training path is deliberately tied to the same situation as the mission.",
      },
      {
        type: "h2",
        de: "Warum die Kombination wirkt",
        en: "Why the combination works",
      },
      {
        type: "ul",
        de: [
          "Üben baut auf: Es sorgt dafür, dass Wörter und Redemittel überhaupt sitzen.",
          "Spielen prüft in echt: In einer Mission merkst du sofort, ob du ein Wort wirklich anwenden kannst.",
          "Zusammen schließt sich der Kreis: verstehen, anwenden, behalten, ohne dass etwas verloren geht.",
        ],
        en: [
          "Üben builds up: it makes sure words and phrases actually stick.",
          "Spielen tests for real: in a mission you notice at once whether you can truly use a word.",
          "Together they close the loop: understand, apply, retain, without anything getting lost.",
        ],
      },
    ],
    related: ["ueben", "spielen-neuland", "spaced-repetition"],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return helpArticles.find((a) => a.slug === slug);
}
