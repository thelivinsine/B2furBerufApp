import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Mic,
  GraduationCap,
  MessagesSquare,
  PenLine,
  BrainCircuit,
  Cloud,
  Target,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/useSettingsStore";
import { AuthDialog, type AuthIntent } from "@/features/auth/AuthDialog";

const features = [
  {
    icon: MessagesSquare,
    title: "Dialog-Simulationen",
    desc: "Übe das Prüfungsmodul „Gemeinsam eine Lösung finden\" mit realistischen, verzweigten Gesprächen.",
  },
  {
    icon: GraduationCap,
    title: "Wortschatz & Grammatik",
    desc: "300+ Berufs-Vokabeln, Redemittel und gezielte Grammatik-Drills – mit Spaced-Repetition.",
  },
  {
    icon: Target,
    title: "Leveled Quizze",
    desc: "Themenbezogene Quizze in drei Schwierigkeitsstufen mit sofortigem Feedback.",
  },
  {
    icon: PenLine,
    title: "KI-Schreibcoach",
    desc: "Schreibaufgaben mit einer klaren, priorisierten Rückmeldung zu deiner größten Schwäche.",
  },
  {
    icon: Mic,
    title: "Sprechen & Aussprache",
    desc: "Text-to-Speech und Spracherkennung helfen dir, frei und natürlich zu sprechen.",
  },
  {
    icon: Cloud,
    title: "Fortschritt überall",
    desc: "Melde dich an und lerne nahtlos auf Handy, Tablet und Laptop weiter.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("signup");

  // Returning learners already set up → straight to the app.
  if (onboarded) return <Navigate to="/" replace />;

  const openAuth = (i: AuthIntent) => {
    setIntent(i);
    setAuthOpen(true);
  };

  const start = () => navigate("/start");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Sprechfit</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="ghost" onClick={() => openAuth("login")}>
            Anmelden
          </Button>
          <Button variant="gradient" onClick={start} className="gap-1.5">
            Kostenlos starten <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-10 pt-12 text-center sm:px-6 sm:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <GraduationCap className="h-3.5 w-3.5 text-primary" /> Goethe / telc · Deutsch B2 Beruf
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Bestehe die mündliche{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">B2-Beruf-Prüfung</span>{" "}
            mit Selbstvertrauen
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Dein interaktiver Trainer fürs Sprechen am Arbeitsplatz – Dialog-Simulationen,
            Wortschatz, Grammatik und ein KI-Schreibcoach. Üben in Minuten, nicht Stunden.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="gradient" size="lg" onClick={start} className="gap-1.5">
              Kostenlos testen <ArrowRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => openAuth("login")}>
              Ich habe ein Konto
            </Button>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Keine Kreditkarte</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Sofort loslegen</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Ohne Anmeldung nutzbar</span>
          </div>
        </motion.div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="rounded-2xl border border-border bg-surface/70 p-5 shadow-soft backdrop-blur"
            >
              <div className="inline-flex rounded-xl bg-primary/12 p-2.5 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="overflow-hidden rounded-3xl border border-border bg-accent-gradient p-8 text-center text-white shadow-elevated sm:p-12">
          <BrainCircuit className="mx-auto h-9 w-9 opacity-90" />
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            Bereit für deine Prüfung?
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            Starte kostenlos und sichere deinen Fortschritt mit einem Konto – auf allen Geräten.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={start}
              className="bg-white text-foreground hover:bg-white/90"
            >
              Kostenlos starten <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => openAuth("signup")}
              className="text-white hover:bg-white/15"
            >
              Konto erstellen
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        Sprechfit · Deutsch im Beruf · B2 Prüfung
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent={intent} />
    </div>
  );
}
