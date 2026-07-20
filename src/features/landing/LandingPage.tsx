import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Filter,
  Flame,
  GraduationCap,
  MapPin,
  MessagesSquare,
  Mic,
  Search,
  ShieldCheck,
  Volume2,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AuthDialog, type AuthIntent } from "@/features/auth/AuthDialog";
import { Logo } from "@/components/shared/Logo";
import { Wesen } from "@/components/artikel/Wesen";

/**
 * Landing page, "Der Textmarker" redesign (s136, founder-picked from
 * preview/landing-redesign/). The logo's Himmelblau highlighter swipe is the
 * page-wide device (`.landing-swipe` in index.css); the hero shows the product
 * as a flashcard collage with the real Artikel-Wesen; a dedicated section sells
 * the faceted library + custom scoped Üben sessions. Copy is English-first with
 * German only for obvious/brand terms, and the whole page switches EN/DE via
 * the same bilingual pattern as /about and the legal pages. Logged-in visitors
 * get one "Go to app" CTA instead of login/signup (founder: not "Dashboard").
 */

type Lang = "en" | "de";

/** The swiped-highlight phrase. Ink text on the light swipe in both themes. */
function Swipe({ children, reward }: { children: React.ReactNode; reward?: boolean }) {
  return (
    <span className={cn("landing-swipe", reward && "landing-swipe-reward")}>
      <i aria-hidden />
      <span>{children}</span>
    </span>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Check className="h-3.5 w-3.5 text-success" strokeWidth={3} /> {children}
    </span>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Language / Sprache"
      className="inline-grid shrink-0 grid-cols-2 gap-0.5 rounded-full border border-border bg-surface p-0.5 shadow-soft"
    >
      {(["en", "de"] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="tab"
          aria-selected={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-bold transition-colors",
            lang === l ? "bg-accent/25 text-accent-ink" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

/** Pain/benefit row: tinted icon tile + heading + line. */
function PainRow({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-10 w-10 flex-none place-items-center rounded-[13px] bg-accent/20 text-accent-ink">
        {icon}
      </span>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}

/** Hand-drawn learning-curve chart: fast rise, the plateau, the dashed way up. */
function PlateauChart({ lang }: { lang: Lang }) {
  return (
    <svg
      viewBox="0 0 440 300"
      className="w-full"
      role="img"
      aria-label={
        lang === "de"
          ? "Die Lernkurve: schneller Fortschritt bis B1, dann das Plateau"
          : "The learning curve: fast progress to B1, then the plateau"
      }
    >
      <path d="M40 20 L40 260 L420 260" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
      <text x="14" y="60" fontSize="13" fontWeight="700" fill="hsl(var(--muted-foreground))">B2</text>
      <text x="14" y="150" fontSize="13" fontWeight="700" fill="hsl(var(--muted-foreground))">B1</text>
      <text x="14" y="240" fontSize="13" fontWeight="700" fill="hsl(var(--muted-foreground))">A1</text>
      <text x="390" y="282" fontSize="12" fill="hsl(var(--muted-foreground))">
        {lang === "de" ? "Zeit" : "time"}
      </text>
      <path
        d="M42 250 Q80 240 105 200 Q135 152 170 145 Q220 138 268 140 Q300 141 316 139"
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <rect
        x="168" y="126" width="152" height="26" rx="10"
        fill="hsl(var(--accent))" opacity="0.45" transform="rotate(-1 244 139)"
      />
      <text x="196" y="122" fontSize="13" fontWeight="800" fill="hsl(var(--accent-ink))">das Plateau</text>
      <circle cx="316" cy="139" r="7" fill="hsl(var(--reward))" />
      <circle cx="316" cy="139" r="12" fill="none" stroke="hsl(var(--reward))" strokeWidth="2" opacity="0.4" />
      <g transform="translate(258 165)">
        <rect width="104" height="28" rx="14" fill="hsl(var(--foreground))" />
        <text x="52" y="18.5" fontSize="12.5" fontWeight="700" fill="hsl(var(--background))" textAnchor="middle">
          {lang === "de" ? "Du bist hier" : "you are here"}
        </text>
      </g>
      <path
        d="M316 139 Q352 130 372 100 Q392 70 402 52"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray="1 9"
      />
      <g transform="translate(360 26)">
        <rect width="76" height="26" rx="13" fill="hsl(var(--primary))" />
        <text x="38" y="17.5" fontSize="12" fontWeight="800" fill="hsl(var(--primary-foreground))" textAnchor="middle">
          mit Genauly
        </text>
      </g>
      <path d="M398 40 l3 6 6 1-4.5 4 1 6-5.5-3-5.5 3 1-6L389 47l6-1z" fill="hsl(var(--reward))" opacity="0.9" />
    </svg>
  );
}

/** The Bibliothek filter-rail mockup: scopes + facets + the Üben footer. */
function FilterRailMock() {
  const pill = (label: string, on?: boolean) => (
    <span
      key={label}
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-semibold",
        on
          ? "border-accent bg-accent/20 font-bold text-accent-ink"
          : "border-border bg-surface text-muted-foreground",
      )}
    >
      {label}
    </span>
  );
  return (
    <div
      aria-hidden
      className="mx-auto max-w-[23rem] -rotate-1 rounded-[20px] border border-border bg-surface p-6 shadow-elevated"
    >
      <div className="flex items-center justify-between">
        <b className="inline-flex items-center gap-1.5 text-primary">
          <Filter className="h-4 w-4" /> Filter
        </b>
        <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-extrabold text-primary-foreground">3</span>
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
        <Search className="h-4 w-4 flex-none" /> Suchen…
      </div>
      <div className="mt-4">
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Thema</span>
        <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-2 text-sm font-bold">
          Arzt &amp; Gesundheit <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      <div className="mt-4">
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Stufe</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pill("B1.1")}{pill("B1.2")}{pill("B2.1", true)}{pill("B2.2")}
        </div>
      </div>
      <div className="mt-4">
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Wortart</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pill("Nomen", true)}{pill("Verben")}{pill("Adjektive")}
        </div>
      </div>
      <div className="mt-4">
        <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">Branche</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {pill("Pflege", true)}{pill("IT")}{pill("Handwerk")}
        </div>
      </div>
      <div className="mt-5 border-t border-dashed border-border pt-4">
        <span className="block rounded-xl bg-accent-gradient py-3 text-center text-sm font-extrabold text-white shadow-glow tabular-nums">
          Üben · 34 Wörter
        </span>
      </div>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("signup");
  const [lang, setLang] = useState<Lang>("en");

  const t = (en: string, de: string) => (lang === "de" ? de : en);

  const openAuth = (i: AuthIntent) => {
    setIntent(i);
    setAuthOpen(true);
  };
  const start = () => navigate("/start");
  const goApp = () => navigate("/");

  const goAppLabel = t("Go to app", "Zur App");
  const startLabel = t("Start free", "Kostenlos starten");

  const navLinks: Array<{ label: string; href?: string; to?: string }> = [
    { label: t("Why Genauly", "Vorteile"), href: "#plateau" },
    { label: t("Features", "Funktionen"), href: "#features" },
    { label: "FAQ", href: "#faq" },
    { label: t("About", "Über uns"), to: "/about" },
    { label: t("Help", "Hilfe"), to: "/hilfe" },
    { label: t("Sources", "Quellen"), to: "/sources" },
  ];

  const marquee = [
    ["#2866EB", "Gehaltsgespräch führen"],
    ["#EA4D2A", "Termin beim Bürgeramt"],
    ["#2E9E6C", "Nebenkostenabrechnung verstehen"],
    ["#086F9B", "Arzttermin verschieben"],
    ["#E19209", "Smalltalk in der Kaffeeküche"],
    ["#DB2C7F", "Wohnungsbesichtigung"],
    ["#2866EB", "Vorstellungsgespräch üben"],
    ["#16A24E", "Konto eröffnen"],
    ["#EA4D2A", "Reklamation im Geschäft"],
    ["#086F9B", "Meeting moderieren"],
    ["#DB2C7F", "Krankmeldung schreiben"],
    ["#E19209", "Handyvertrag kündigen"],
  ] as const;

  const pains = [
    {
      icon: <MessagesSquare className="h-5 w-5" />,
      title: t("Your course gave you grammar. Not conversations.", "Der Kurs hat dir Grammatik gegeben. Nicht Gespräche."),
      text: t(
        "Genauly drills exactly the situations where you still switch to English: branching dialogues you can replay until they feel easy.",
        "Genauly übt genau die Situationen, in denen du bisher ins Englische wechselst: verzweigte Dialoge zum Durchspielen, so oft du willst.",
      ),
    },
    {
      icon: <Clock3 className="h-5 w-5" />,
      title: t("You learn words. Then you lose them.", "Du lernst Wörter. Und vergisst sie wieder."),
      text: t(
        "Spaced repetition (FSRS) brings each word back right before you would forget it. So it sticks. For good.",
        "Spaced Repetition (FSRS) zeigt dir jedes Wort genau dann, wenn du es fast vergessen hättest. So bleibt es. Dauerhaft.",
      ),
    },
    {
      icon: <Mic className="h-5 w-5" />,
      title: t(
        "You never practice speaking, because someone is always listening.",
        "Sprechen übst du nie, weil immer jemand zuhört.",
      ),
      text: t(
        "Not here. Talk to the speech recognition as long, and as wrong, as you like. Feedback yes, audience no.",
        "Hier nicht. Sprich mit der Spracherkennung, so lange und so falsch du willst. Feedback ja, Publikum nein.",
      ),
    },
  ];

  const filterPoints = [
    {
      icon: <Filter className="h-5 w-5" />,
      title: t("Slice 1,600+ words any way you like", "1.600+ Wörter, geschnitten wie du willst"),
      text: t(
        "By topic and sub-topic, CEFR level (B1.1 to B2.2), industry, word type, frequency, or what's due for review. Combine filters freely.",
        "Nach Thema und Unterthema, GER-Stufe (B1.1 bis B2.2), Branche, Wortart, Häufigkeit oder fälligen Wiederholungen. Frei kombinierbar.",
      ),
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: t("One tap turns your filter into a session", "Ein Tipp macht aus deinem Filter eine Session"),
      text: t(
        "Hit Üben and that exact list becomes a custom practice session: cards, quiz, typing, listening, matching. Built from your words, nothing generic.",
        "Tippe auf Üben und genau diese Liste wird eine eigene Übungs-Session: Karten, Quiz, Tippen, Hören, Zuordnen. Aus deinen Wörtern, nichts von der Stange.",
      ),
    },
    {
      icon: <Clock3 className="h-5 w-5" />,
      title: t("Made for busy weeks", "Gemacht für volle Wochen"),
      text: t(
        "Doctor's appointment on Friday? Filter Arzt at your level, practice ten minutes a day, walk in prepared.",
        "Freitag Arzttermin? Filtere Arzt auf deinem Niveau, übe zehn Minuten am Tag, geh vorbereitet hin.",
      ),
    },
  ];

  const numbers = [
    ["1,623", "1.623", t("words with article, plural and two real example sentences", "Wörter mit Artikel, Plural und zwei echten Beispielsätzen")],
    ["1,033", "1.033", t("noun-verb collocations, the way Germans actually speak", "Nomen-Verb-Kollokationen, wie Deutsche wirklich sprechen")],
    ["117", "117", t("grammar drills along the biggest B2 markers", "Grammatik-Übungen entlang der wichtigsten B2-Marker")],
    ["20", "20", t("topics from work and daily life, from meetings to Mietvertrag", "Themen aus Beruf und Alltag, vom Meeting bis zur Mietwohnung")],
  ] as const;

  const steps = [
    {
      n: "1",
      tone: "bg-accent-gradient",
      rot: "-rotate-3",
      title: t("Pick a real situation", "Wähle eine echte Situation"),
      text: t(
        "Work, Behörde, doctor, housing, bank or exam prep. Every topic mirrors the German you actually need.",
        "Beruf, Behörde, Arzt, Wohnen, Bank oder Prüfung. Jedes Thema spiegelt das Deutsch, das du wirklich brauchst.",
      ),
    },
    {
      n: "2",
      tone: "bg-accent-ink",
      rot: "rotate-2",
      title: t("Practice out loud and in writing", "Übe laut und schriftlich"),
      text: t(
        "Branching dialogues, vocabulary with spaced repetition, leveled quizzes, and speaking with speech recognition.",
        "Verzweigte Dialoge, Wortschatz mit Spaced Repetition, Quiz in drei Stufen, Sprechen mit Spracherkennung.",
      ),
    },
    {
      n: "3",
      tone: "bg-reward",
      rot: "-rotate-2",
      title: t("Get feedback, see progress", "Bekomm Feedback, sieh Fortschritt"),
      text: t(
        "One clear AI tip on your biggest weakness, plus Can-Do milestones and progress that follows you across devices.",
        "Ein klarer KI-Tipp zu deiner größten Schwäche, plus Can-Do-Meilensteine und Fortschritt auf allen Geräten.",
      ),
    },
  ];

  const faqs = [
    {
      q: t("Who is Genauly for?", "Für wen ist Genauly?"),
      a: t(
        "Adults who already know basic German (around B1) and want to become confident in real-life situations at work and in daily life. It also suits anyone preparing for the telc Deutsch B2 Beruf or Goethe-Zertifikat B2 exam.",
        "Für Erwachsene, die schon Deutsch können (etwa B1) und in echten Situationen sicher werden wollen: im Job und im Alltag. Auch ideal zur Vorbereitung auf telc Deutsch B2 Beruf oder das Goethe-Zertifikat B2.",
      ),
    },
    {
      q: t("Is Genauly free?", "Ist Genauly kostenlos?"),
      a: t(
        "Yes. You can start for free with no account. Signing in is optional and saves your progress across your devices.",
        "Ja. Du startest kostenlos und ohne Konto. Anmelden ist optional und speichert deinen Fortschritt auf allen Geräten.",
      ),
    },
    {
      q: t("What level do I need?", "Welches Niveau brauche ich?"),
      a: t(
        "The intermediate plateau, roughly B1 to B2. Content is tagged by CEFR level, so you start where you are comfortable and level up at your own pace.",
        "Das Plateau, ungefähr B1 bis B2. Alle Inhalte sind nach GER-Stufe markiert, du startest wo du dich wohlfühlst und steigerst dich in deinem Tempo.",
      ),
    },
    {
      q: t("How does the AI writing feedback work?", "Wie funktioniert das KI-Schreibfeedback?"),
      a: t(
        "You write a short text and get one clear, prioritised tip on your biggest weakness. A grammar checker categorises errors first, and an AI model is used only when a deeper read helps. AI feedback is always marked as such.",
        "Du schreibst einen kurzen Text und bekommst einen klaren, priorisierten Tipp zu deiner größten Schwäche. Ein Grammatik-Checker kategorisiert zuerst, ein KI-Modell hilft nur, wenn ein tieferer Blick nötig ist. KI-Feedback ist immer als solches markiert.",
      ),
    },
    {
      q: t("Do I need to install anything?", "Muss ich etwas installieren?"),
      a: t(
        "No. Genauly runs in your browser and can be added to your home screen as an app. It works on phone, tablet and laptop.",
        "Nein. Genauly läuft im Browser und lässt sich als App auf den Homescreen legen. Funktioniert auf Handy, Tablet und Laptop.",
      ),
    },
  ];

  const footLinks = [
    { label: t("About", "Über uns"), to: "/about" },
    { label: t("Help", "Hilfe"), to: "/hilfe" },
    { label: t("Privacy", "Datenschutz"), to: "/privacy" },
    { label: t("Terms", "AGB"), to: "/terms" },
    { label: t("Sources & licenses", "Quellen & Lizenzen"), to: "/sources" },
  ];

  const primaryCta = (
    <button
      onClick={onboarded ? goApp : start}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent-gradient px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-glow transition hover:brightness-105"
    >
      {onboarded ? goAppLabel : startLabel} <ArrowRight className="h-4 w-4" />
    </button>
  );

  /* Gentle 7s bob for the hero collage. Driven by framer (not a CSS keyframe)
     so it renders on iOS Safari configurations where the CSS animation was
     observed not to run (founder report, s136). */
  const float = (delay = 0) => ({
    animate: { y: [0, -9, 0] },
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" as const, delay },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ---- Nav ---- */}
      <nav className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <div className="flex items-center">
            {/* Compact mark on phones, the full wordmark from sm up. The
                responsive toggle lives on wrappers: display utilities passed
                INTO <Logo> would fight its internal light/dark image swap. */}
            <span className="sm:hidden">
              <Logo className="h-9 w-9" />
            </span>
            <span className="hidden sm:block">
              <Logo variant="wordmark" className="h-8 w-auto" />
            </span>
          </div>
          <div className="hidden items-center gap-5 text-sm font-semibold text-muted-foreground lg:flex">
            {navLinks.map((l) =>
              l.href ? (
                <a key={l.label} href={l.href} className="whitespace-nowrap transition-colors hover:text-foreground">
                  {l.label}
                </a>
              ) : (
                <button
                  key={l.label}
                  onClick={() => navigate(l.to!)}
                  className="whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {l.label}
                </button>
              ),
            )}
          </div>
          <div className="flex items-center gap-2">
            <LangToggle lang={lang} setLang={setLang} />
            {!onboarded && (
              <button
                onClick={() => openAuth("login")}
                className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-foreground/5 sm:block"
              >
                {t("Log in", "Anmelden")}
              </button>
            )}
            {primaryCta}
          </div>
        </div>
      </nav>

      {/* ---- Hero ---- */}
      <header className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-14 sm:px-6 lg:grid-cols-[7fr_5fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface py-1.5 pl-1.5 pr-3.5 text-xs font-semibold text-muted-foreground shadow-soft">
            <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-accent/25">
              <GraduationCap className="h-3.5 w-3.5 text-accent-ink" />
            </span>
            {t("German for real life", "Deutsch fürs echte Leben")}
          </span>
          <h1 className="mt-5 text-[clamp(2.5rem,5.4vw,4rem)] font-extrabold leading-[1.05] tracking-tight">
            {lang === "de" ? (
              <>Durchbrich das <Swipe>Plateau.</Swipe></>
            ) : (
              <>Break through the <Swipe>plateau.</Swipe></>
            )}
            <span className="mt-1.5 block text-[0.62em] font-bold tracking-tight text-muted-foreground">
              {t(
                "German for the situations that actually matter.",
                "Deutsch für die Situationen, die wirklich zählen.",
              )}
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {lang === "de" ? (
              <>
                Du hast B1 geschafft. Und übst trotzdem vor jedem Anruf die Sätze. Genauly macht aus
                Lehrbuch-Deutsch <b className="font-semibold text-foreground">sicheres Deutsch für das echte Leben</b>:
                im Job, beim Amt, beim Arzt und in jedem Gespräch, das dich bisher nervös gemacht hat.
              </>
            ) : (
              <>
                You passed B1. You still rehearse sentences before every phone call. Genauly turns
                textbook German into <b className="font-semibold text-foreground">confident, real-world German</b>:
                at work, at the Behörde, at the doctor, and in every conversation that used to make you
                nervous.
              </>
            )}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            {onboarded ? (
              <button
                onClick={goApp}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-gradient px-8 py-4 text-lg font-bold text-primary-foreground shadow-glow transition hover:brightness-105"
              >
                {goAppLabel} <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <>
                <button
                  onClick={start}
                  className="inline-flex items-center gap-1.5 rounded-full bg-accent-gradient px-8 py-4 text-lg font-bold text-primary-foreground shadow-glow transition hover:brightness-105"
                >
                  {startLabel} <ArrowRight className="h-5 w-5" />
                </button>
                <button
                  onClick={() => openAuth("login")}
                  className="border-b-2 border-border text-sm font-semibold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  {t("I already have an account", "Ich habe schon ein Konto")}
                </button>
              </>
            )}
          </div>
          {!onboarded && (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-1.5 text-xs font-medium text-muted-foreground">
              <CheckItem>{t("Free to start", "Kostenlos loslegen")}</CheckItem>
              <CheckItem>{t("No account needed", "Kein Konto nötig")}</CheckItem>
              <CheckItem>{t("Runs in your browser", "Läuft im Browser")}</CheckItem>
            </div>
          )}
        </motion.div>

        {/* card collage */}
        <div aria-hidden className="relative mx-auto h-[430px] w-full max-w-md lg:h-[460px]">
          <svg className="absolute -left-2 top-[18%] w-[84px]" viewBox="0 0 90 70" fill="none" stroke="hsl(var(--accent-ink))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 8 Q40 4 58 26 Q72 42 70 56" /><path d="M60 48 L70 58 L78 46" />
          </svg>
          <svg className="absolute right-0 top-[44%] w-[52px]" viewBox="0 0 60 60" fill="none" stroke="hsl(var(--reward))" strokeWidth="2.6" strokeLinecap="round">
            <path d="M30 8 L30 22 M30 38 L30 52 M8 30 L22 30 M38 30 L52 30" />
          </svg>
          <svg className="absolute bottom-[2%] left-[12%] w-[42px]" viewBox="0 0 50 50" fill="none" stroke="hsl(var(--accent))" strokeWidth="2.8" strokeLinecap="round">
            <path d="M10 40 Q18 12 40 10" /><path d="M32 8 L42 10 L38 20" />
          </svg>

          {/* back card: der Termin */}
          <div className="absolute left-[8%] top-[6%] z-[2] w-[240px] rotate-[4.5deg] rounded-[20px] border border-border bg-surface p-5 opacity-95 shadow-elevated">
            <span className="text-sm font-extrabold text-der">der</span>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-extrabold tracking-tight">Termin</h3>
              <Wesen gender="der" size={30} />
            </div>
            <span className="mt-2.5 inline-block rounded-full bg-der-bg px-2.5 py-1 text-[0.72rem] font-bold text-der">
              Beim Amt
            </span>
          </div>

          {/* main flashcard: die Bewerbung. The float lives on an inner wrapper:
              animating transform on the positioned element itself would override
              its centering translate + rotate. */}
          <div className="absolute left-1/2 top-[46%] z-[3] w-[290px] -translate-x-1/2 -translate-y-1/2" style={{ rotate: "-2deg" }}>
            <motion.div {...float()} className="rounded-[20px] border border-border bg-surface p-6 shadow-elevated">
            <div className="flex items-center justify-between">
              <span className="relative px-2 py-0.5 text-base font-extrabold text-die">
                die
                <svg className="absolute -inset-x-2 -inset-y-1.5 h-[calc(100%+12px)] w-[calc(100%+16px)]" viewBox="0 0 60 34" fill="none" stroke="hsl(var(--die))" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M8 17 Q6 5 30 4 Q56 3 54 16 Q53 30 28 30 Q10 30 9 20" />
                </svg>
              </span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent/25">
                <Volume2 className="h-5 w-5 text-accent-ink" />
              </span>
            </div>
            <div className="mt-2 flex items-end gap-2.5">
              <h3 className="text-[1.7rem] font-extrabold tracking-tight">Bewerbung</h3>
              <Wesen gender="die" size={44} className="mb-0.5" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">die Bewerbungen · Pl.</p>
            <p className="mt-4 border-t-2 border-dashed border-border pt-3.5 text-sm text-muted-foreground">
              the <b className="text-foreground">job application</b>
              <br />
              <span className="text-[0.83rem]">Ich habe meine Bewerbung gestern abgeschickt.</span>
            </p>
            </motion.div>
          </div>

          {/* floating pills (same inner-wrapper pattern for the float animation) */}
          <div className="absolute right-[2%] top-[10%] z-[4] rotate-2">
            <motion.div {...float(0.8)} className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-reward shadow-elevated">
              <Flame className="h-4 w-4 fill-current" />
              <span className="tabular-nums">{t("12-day streak", "12 Tage Serie")}</span>
            </motion.div>
          </div>
          <div className="absolute bottom-[14%] left-[2%] z-[4] -rotate-3">
            <motion.div {...float(0.3)} className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-success shadow-elevated">
              <span className="grid h-[22px] w-[22px] place-items-center rounded-full bg-success/15">
                <Check className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              <span className="tabular-nums">+10 XP · Genau!</span>
            </motion.div>
          </div>
          <div className="absolute bottom-[4%] right-[4%] z-[4] flex rotate-[1.5deg] items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-bold text-accent-ink shadow-elevated">
            <MapPin className="h-4 w-4" /> Bürgeramt, Schalter 3
          </div>
        </div>
      </header>

      {/* ---- Scenario marquee ---- */}
      <div aria-hidden className="landing-marquee relative overflow-hidden border-y border-border bg-surface py-3.5">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-[2] w-24 bg-gradient-to-r from-surface to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-[2] w-24 bg-gradient-to-l from-surface to-transparent" />
        <div className="landing-marquee-track flex w-max gap-3.5">
          {[...marquee, ...marquee].map(([dot, label], i) => (
            <span
              key={`${label}-${i}`}
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-border bg-background px-4 py-1.5 text-sm font-semibold text-muted-foreground"
            >
              <i className="h-2 w-2 flex-none rounded-full" style={{ background: dot }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* ---- The plateau ---- */}
      <section id="plateau" className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="rounded-[20px] border border-border bg-surface p-6 shadow-soft sm:p-8">
          <PlateauChart lang={lang} />
        </div>
        <div>
          <p className="text-eyebrow text-accent-ink">
            {t("Why you're stuck", "Warum du feststeckst")}
          </p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-tight sm:text-[clamp(1.9rem,3.4vw,2.7rem)]">
            {lang === "de" ? (
              <>B1 ist nicht das Ziel.<br />Es ist <Swipe>die Hälfte.</Swipe></>
            ) : (
              <>B1 isn't the finish line.<br />It's <Swipe>halfway.</Swipe></>
            )}
          </h2>
          <div className="mt-7 space-y-4">
            {pains.map((p) => (
              <PainRow key={p.title} icon={p.icon} title={p.title} text={p.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Bento features ---- */}
      <section id="features" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-accent-ink">
            {t("What you get", "Was du bekommst")}
          </p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-tight sm:text-[clamp(1.9rem,3.4vw,2.7rem)]">
            {lang === "de" ? (
              <>Ein komplettes Trainingssystem.<br />Kein <Swipe reward>Karteikarten-Friedhof.</Swipe></>
            ) : (
              <>A complete training system.<br />Not a <Swipe reward>flashcard graveyard.</Swipe></>
            )}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
          {/* session */}
          <div className="relative rounded-[20px] border border-border bg-surface p-6 shadow-soft sm:col-span-2 lg:col-span-4">
            <span className="absolute right-5 top-5 rounded-full bg-accent/25 px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-accent-ink">
              {t("The session", "Die Session")}
            </span>
            <h3 className="mt-7 text-lg font-extrabold tracking-tight">
              {t("Sessions that feel like progress", "Lern-Sessions, die sich nach Fortschritt anfühlen")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Five minutes or fifty: Genauly mixes cards, quiz, typing, listening and speaking into one session that matches exactly where you are.",
                "Fünf Minuten oder fünfzig: Genauly mischt Karten, Quiz, Tippen, Hören und Sprechen zu einer Session, die genau zu deinem Stand passt.",
              )}
            </p>
            <div aria-hidden className="mt-5 rounded-2xl border border-border bg-background p-5">
              <div className="h-[7px] overflow-hidden rounded-full bg-muted">
                <i className="block h-full w-[62%] rounded-full bg-accent-gradient" />
              </div>
              <p className="mt-4 font-bold">
                Ich möchte einen Termin{" "}
                <span className="inline-block min-w-[5.5rem] border-b-[2.5px] border-primary text-center font-extrabold text-primary">
                  vereinbaren
                </span>
                .
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2 text-sm font-semibold">machen</span>
                <span className="rounded-xl border-[1.5px] border-success bg-success/15 px-3.5 py-2 text-sm font-bold text-success">✓ vereinbaren</span>
                <span className="rounded-xl border-[1.5px] border-border bg-surface px-3.5 py-2 text-sm font-semibold">bekommen</span>
              </div>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {["Karten", "Quiz", "Tippen", "Hören", "Sprechen", "Lesen"].map((k) => (
                  <span key={k} className="rounded-full bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground">{k}</span>
                ))}
              </div>
            </div>
          </div>
          {/* artikel */}
          <div className="relative rounded-[20px] border border-border bg-surface p-6 shadow-soft sm:col-span-2 lg:col-span-2">
            <span className="absolute right-5 top-5 rounded-full bg-accent/25 px-2.5 py-1 text-[0.7rem] font-extrabold uppercase tracking-wider text-accent-ink">
              der · die · das
            </span>
            <h3 className="mt-7 text-lg font-extrabold tracking-tight">
              {t("Articles you'll never forget again", "Artikel, die du nie wieder vergisst")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Every noun has its creature: spiky, round or boxy. Shape + color + character, anchored three ways.",
                "Jedes Nomen hat sein Wesen: spitz, rund oder eckig. Form + Farbe + Figur, dreifach verankert.",
              )}
            </p>
            <div aria-hidden className="mt-6 flex justify-between gap-2.5">
              {(
                [
                  ["der", "bg-der-bg", "text-der", t("spiky", "spitz")],
                  ["die", "bg-die-bg", "text-die", t("round", "rund")],
                  ["das", "bg-das-bg", "text-das", t("boxy", "eckig")],
                ] as const
              ).map(([g, bg, tone, label]) => (
                <div key={g} className={cn("flex-1 rounded-2xl px-2 pb-3 pt-4 text-center", bg)}>
                  <Wesen gender={g} size={52} className="mx-auto" />
                  <b className={cn("mt-1 block text-sm font-extrabold", tone)}>{g}</b>
                  <small className="text-xs text-muted-foreground">{label}</small>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[0.85rem] leading-relaxed text-muted-foreground">
              {t(
                "Answer right and the card bursts, blooms or shatters. Small reward, strong memory.",
                "Beim richtigen Artikel platzt, blüht oder zerspringt die Karte. Kleine Belohnung, großer Anker.",
              )}
            </p>
          </div>
          {/* srs */}
          <div className="rounded-[20px] border border-border bg-surface p-6 shadow-soft lg:col-span-2">
            <h3 className="text-lg font-extrabold tracking-tight">
              {t("Forgetting, scientifically cancelled", "Vergessen, wissenschaftlich abgeschafft")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(
                "FSRS spaced repetition schedules every review for the optimal moment.",
                "FSRS-Spaced-Repetition plant jede Wiederholung auf den optimalen Moment.",
              )}
            </p>
            <div aria-hidden className="mt-5 flex h-14 items-end gap-[5px]">
              {[30, 45, 70, 38, 55, 90, 48, 26, 64, 40, 58, 82].map((h, i) => (
                <i
                  key={i}
                  className={cn("flex-1 rounded-t", [2, 5, 8, 11].includes(i) ? "bg-primary" : "bg-accent/30")}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
          {/* speaking */}
          <div className="rounded-[20px] border border-border bg-surface p-6 shadow-soft lg:col-span-2">
            <h3 className="text-lg font-extrabold tracking-tight">
              {t("Speak without an audience", "Sprich, ohne Publikum")}
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Speech recognition and a read-aloud voice, right in your browser. Practice your Aussprache, judgement-free.",
                "Spracherkennung und Vorlesestimme, direkt im Browser. Aussprache üben, ganz ohne Bewertung von außen.",
              )}
            </p>
            <div aria-hidden className="mt-5 flex h-[52px] items-center gap-1">
              {[22, 48, 80, 56, 92, 40, 66, 30, 74, 50, 88, 36, 60, 24].map((h, i) => (
                <i key={i} className="w-[5px] rounded-full bg-primary/85" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
          {/* exam */}
          <div className="rounded-[20px] border border-border bg-surface p-6 shadow-soft lg:col-span-2">
            <h3 className="text-lg font-extrabold tracking-tight">{t("Exam? Covered.", "Prüfung? Eingeplant.")}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {t(
                "Vocabulary, Redemittel and simulations aligned with the two big B2 exams.",
                "Wortschatz, Redemittel und Simulationen, ausgerichtet auf die zwei großen B2-Prüfungen.",
              )}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <span className="rounded-[14px] border-[1.5px] border-border bg-background px-3.5 py-2 text-[0.82rem] font-bold">
                telc Deutsch B2 Beruf
                <small className="mt-0.5 block text-[0.7rem] font-semibold text-muted-foreground">
                  {t("Speaking · Writing · Vocabulary", "Sprechen · Schreiben · Wortschatz")}
                </small>
              </span>
              <span className="rounded-[14px] border-[1.5px] border-border bg-background px-3.5 py-2 text-[0.82rem] font-bold">
                Goethe-Zertifikat B2
                <small className="mt-0.5 block text-[0.7rem] font-semibold text-muted-foreground">
                  {t("All four modules", "Alle vier Module")}
                </small>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Filter -> custom Üben ---- */}
      <section id="filter" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-20 sm:px-6 lg:grid-cols-2 lg:gap-14">
        <div className="relative">
          <FilterRailMock />
          <svg className="absolute bottom-[2%] right-[2%] w-[70px]" viewBox="0 0 80 80" fill="none" stroke="hsl(var(--reward))" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M72 8 Q54 18 44 40 Q37 54 22 62" /><path d="M30 68 L18 64 L24 52" />
          </svg>
        </div>
        <div>
          <p className="text-eyebrow text-accent-ink">
            {t("Your library, your rules", "Deine Bibliothek, deine Regeln")}
          </p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-tight sm:text-[clamp(1.9rem,3.4vw,2.7rem)]">
            {lang === "de" ? (
              <>Filtere, was du brauchst.<br /><Swipe>Übe genau das.</Swipe></>
            ) : (
              <>Filter what you need.<br /><Swipe>Practice exactly that.</Swipe></>
            )}
          </h2>
          <div className="mt-7 space-y-4">
            {filterPoints.map((p) => (
              <PainRow key={p.title} icon={p.icon} title={p.title} text={p.text} />
            ))}
          </div>
        </div>
      </section>

      {/* ---- Numbers ---- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] bg-[#1c1a23] p-8 text-[#faf5eb] dark:border dark:border-white/10 sm:p-12">
          <div
            className="pointer-events-none absolute -right-24 -top-40 h-[420px] w-[420px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(83,199,249,0.25), transparent 65%)" }}
          />
          <p className="text-eyebrow text-accent">
            {t("Handmade, not scraped", "Handgebaut, nicht zusammengekratzt")}
          </p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-tight text-white sm:text-[clamp(1.9rem,3.4vw,2.7rem)]">
            {lang === "de" ? (
              <>Jedes Wort hat eine Quelle.<br />Jeder Satz einen Zweck.</>
            ) : (
              <>Every word has a source.<br />Every sentence has a job.</>
            )}
          </h2>
          <div className="mt-9 grid grid-cols-2 gap-7 tabular-nums lg:grid-cols-4">
            {numbers.map(([en, de, label]) => (
              <div key={label}>
                {/* Gradient-clipped stat numbers (s137, report item 10): the ONE
                    sanctioned text-gradient moment. Fixed light Himmel-Soft→sky
                    stops because this band is fixed-dark in both themes (the
                    token gradient would be too dark here in light mode). */}
                <b className="block bg-gradient-to-r from-[#8CDBFB] to-[#8AB0F9] bg-clip-text text-[clamp(1.8rem,3.4vw,2.5rem)] font-extrabold tracking-tight text-transparent">
                  {lang === "de" ? de : en}
                </b>
                <span className="mt-1 block text-sm leading-snug text-[#faf5eb]/65">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-9 flex items-center gap-3 border-t border-[#faf5eb]/15 pt-6 text-sm text-[#faf5eb]/80">
            <ShieldCheck className="h-5 w-5 flex-none text-accent" />
            <span>
              {t(
                "Every item is machine-checked and human-reviewed, with open provenance per entry.",
                "Alle Inhalte werden maschinell und menschlich geprüft, mit offener Herkunft pro Eintrag.",
              )}{" "}
              <button
                onClick={() => navigate("/sources")}
                className="border-b border-accent/40 font-semibold text-accent"
              >
                {t("See sources & data quality", "Quellen & Datenqualität ansehen")}
              </button>
            </span>
          </div>
        </div>
      </section>

      {/* ---- Steps ---- */}
      <section id="steps" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-eyebrow text-accent-ink">
            {t("How it works", "So funktioniert's")}
          </p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-tight sm:text-[clamp(1.9rem,3.4vw,2.7rem)]">
            {lang === "de" ? (
              <>Drei Schritte. <Swipe>Dein smarter Begleiter.</Swipe></>
            ) : (
              <>Three steps. <Swipe>Your smart companion.</Swipe></>
            )}
          </h2>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-[20px] border border-border bg-surface p-7 shadow-soft">
              <span
                className={cn(
                  "grid h-11 w-11 place-items-center rounded-[14px] text-lg font-extrabold text-primary-foreground shadow-soft",
                  s.tone,
                  s.rot,
                )}
              >
                {s.n}
              </span>
              <h3 className="mt-4 text-[1.05rem] font-extrabold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- What is Genauly (plain-language purpose; also satisfies OAuth homepage review) ---- */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="rounded-[20px] border border-border bg-surface p-6 shadow-soft sm:p-8">
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            {t("What is Genauly?", "Was ist Genauly?")}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {t(
              "Genauly is a German-learning app for adults who already know the basics but feel stuck at the intermediate level, typically somewhere between B1 and B2. Instead of more grammar tables, it builds confidence through the real situations you actually face: a presentation at work, filling in a Behörde form, talking to a doctor, preparing for a job interview, or navigating a difficult conversation with a colleague.",
              "Genauly ist eine Deutsch-Lern-App für Erwachsene, die die Grundlagen schon beherrschen, aber auf dem Mittelstufen-Niveau feststecken, meist irgendwo zwischen B1 und B2. Statt noch mehr Grammatiktabellen baut sie Sicherheit durch die echten Situationen auf, die dir wirklich begegnen: eine Präsentation im Job, ein Behördenformular, das Gespräch mit der Ärztin, die Vorbereitung auf ein Vorstellungsgespräch oder ein schwieriges Gespräch mit Kollegen.",
            )}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {lang === "de" ? (
              <>
                Du spielst verzweigte Dialoge durch, lernst Wortschatz mit Spaced Repetition, machst Quiz
                in mehreren Stufen und bekommst KI-Feedback zu Schreiben und Aussprache. Die App hilft auch
                bei der Vorbereitung auf{" "}
                <span className="font-medium text-foreground">telc Deutsch B2 Beruf</span> und das{" "}
                <span className="font-medium text-foreground">Goethe-Zertifikat B2</span>. Mit
                Google-Anmeldung wandert dein Fortschritt auf alle Geräte. Kostenlos starten, kein Konto
                nötig.
              </>
            ) : (
              <>
                You practise branching dialogues, drill vocabulary with spaced repetition, take leveled
                quizzes, and get AI feedback on your writing and pronunciation. The app also helps with
                preparation for the <span className="font-medium text-foreground">telc Deutsch B2 Beruf</span>{" "}
                and <span className="font-medium text-foreground">Goethe-Zertifikat B2</span> exams. Sign in
                with Google to save your progress across devices. Free to start, no account needed.
              </>
            )}
          </p>
          <button
            onClick={() => navigate("/about")}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            {t("More about Genauly", "Mehr über Genauly")} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section id="faq" className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-eyebrow text-accent-ink">FAQ</p>
          <h2 className="mt-3 text-[1.55rem] font-extrabold leading-tight tracking-tight sm:text-[clamp(1.9rem,3.4vw,2.7rem)]">
            {t("Questions? Genau.", "Noch Fragen? Genau.")}
          </h2>
        </div>
        <div className="mx-auto mt-8 max-w-2xl space-y-3">
          {faqs.map((f, i) => (
            <details
              key={f.q}
              open={i === 0}
              className="group overflow-hidden rounded-[18px] border border-border bg-surface shadow-soft [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 px-6 py-5 font-bold">
                {f.q}
                <span className="grid h-[26px] w-[26px] flex-none place-items-center rounded-full bg-accent/25 font-extrabold text-accent-ink transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ---- Closing CTA ---- */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#2866EB] via-[#1D4FC0] to-[#173F9E] px-6 py-16 text-center text-white shadow-elevated sm:py-20">
          <svg className="absolute left-[6%] top-[18%] w-[56px] opacity-50" viewBox="0 0 60 60" fill="none" stroke="#8CDBFB" strokeWidth="2.6" strokeLinecap="round">
            <path d="M30 8 L30 22 M30 38 L30 52 M8 30 L22 30 M38 30 L52 30" />
          </svg>
          <svg className="absolute bottom-[20%] right-[8%] w-[44px] opacity-60" viewBox="0 0 50 50" fill="#F5785C">
            <path d="M25 4 l5 12 12 2-9 8.5 2.5 12L25 32l-10.5 6.5L17 26.5 8 18l12-2z" />
          </svg>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-extrabold tracking-tight">
            {t("Ready? Dein Deutsch is waiting.", "Bereit? Dein Deutsch wartet.")}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-white/85 sm:text-lg">
            {onboarded
              ? t(
                  "Pick up your training right where you left off. Du schaffst das.",
                  "Mach genau da weiter, wo du aufgehört hast. Du schaffst das.",
                )
              : t(
                  "Start free, no account, right in your browser. Two minutes from now you'll be mid-session.",
                  "Starte kostenlos, ohne Konto, direkt im Browser. In zwei Minuten steckst du mitten in deiner ersten Session.",
                )}
          </p>
          <button
            onClick={onboarded ? goApp : start}
            className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-white px-9 py-4 text-lg font-bold text-[#2866EB] transition-colors hover:bg-[#FAF5EB]"
          >
            {onboarded ? goAppLabel : startLabel} <ArrowRight className="h-5 w-5" />
          </button>
          {!onboarded && (
            <small className="mt-4 block text-sm text-white/65">
              {t(
                "No subscription. No credit card. No fine print.",
                "Kein Abo. Keine Kreditkarte. Kein Kleingedrucktes.",
              )}
            </small>
          )}
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="border-t border-border py-10 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center">
            <Logo variant="wordmark" className="h-6 w-auto" />
          </div>
          <nav className="flex flex-wrap gap-5">
            {footLinks.map((l) => (
              <button
                key={l.to}
                onClick={() => navigate(l.to)}
                className="font-medium transition-colors hover:text-foreground"
              >
                {l.label}
              </button>
            ))}
          </nav>
        </div>
        <p className="mx-auto mt-7 max-w-6xl border-t border-border px-4 pt-5 text-xs sm:px-6">
          Genauly · German for real life · Deutsch für das echte Leben · B1–B2
        </p>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent={intent} />
    </div>
  );
}
