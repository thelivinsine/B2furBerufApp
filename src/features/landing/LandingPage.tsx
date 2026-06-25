import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
    title: "Real situations, zero pressure",
    desc: "Practise branching dialogues set in real-life situations: a job presentation, a Behörde appointment, a Arztbesuch, a job interview. Repeat until it feels natural.",
  },
  {
    icon: GraduationCap,
    title: "Wortschatz that sticks",
    desc: "Workplace words, Redemittel and Grammatik drills across a growing range of everyday topics, with spaced repetition so you actually remember them.",
  },
  {
    icon: Target,
    title: "Quizzes for every Niveau",
    desc: "Topic quizzes in three levels (leicht → schwer) with instant feedback. Start where you're comfy and level up.",
  },
  {
    icon: PenLine,
    title: "Your AI Schreibcoach",
    desc: "Write a short text, get one clear, prioritised tip on your biggest Schwäche, like a tutor who never gets tired.",
  },
  {
    icon: Mic,
    title: "Speak without Angst",
    desc: "Text-to-speech and speech recognition help you find your voice and nail your Aussprache, out loud and judgement-free.",
  },
  {
    icon: Cloud,
    title: "Your Fortschritt, everywhere",
    desc: "Sign in and continue right where you stopped, on Handy, Tablet or Laptop. Dein Fortschritt reist mit.",
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const onboarded = useSettingsStore((s) => s.onboarded);
  const [authOpen, setAuthOpen] = useState(false);
  const [intent, setIntent] = useState<AuthIntent>("signup");

  const openAuth = (i: AuthIntent) => {
    setIntent(i);
    setAuthOpen(true);
  };

  const start = () => navigate("/start");
  const goDashboard = () => navigate("/");

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />

      {/* Top nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <div className="flex items-center gap-2.5">
          <img src="/genauly-default-logo-transparent-corners.png" alt="" className="h-9 w-9 rounded-lg shadow-glow" />
          <div className="leading-tight">
            <p className="text-lg font-semibold tracking-tight">Genauly</p>
            <p className="text-xs text-muted-foreground">German for real life · B1–B2</p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {onboarded ? (
            <Button variant="gradient" onClick={goDashboard} className="hidden gap-1.5 sm:inline-flex">
              Zum Dashboard <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => openAuth("login")}>
                Log in
              </Button>
              <Button variant="gradient" onClick={start} className="hidden gap-1.5 sm:inline-flex">
                Kostenlos starten <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          )}
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
            <GraduationCap className="h-3.5 w-3.5 text-primary" /> German for real life · B1–B2
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl">
            Break through the{" "}
            <span className="bg-accent-gradient bg-clip-text text-transparent">plateau.</span>
            <span className="mt-1 block text-2xl font-semibold text-muted-foreground sm:text-3xl">
              German for the situations that actually matter.
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Already past the basics but stuck? Genauly helps you move from textbook German to
            confident, real-world use: at work, at the Behörde, at the Arzt, and in every
            conversation that used to make you nervous.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {onboarded ? (
              <Button variant="gradient" size="lg" onClick={goDashboard} className="gap-1.5">
                Zum Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button variant="gradient" size="lg" onClick={start} className="gap-1.5">
                  Kostenlos testen <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => openAuth("login")}>
                  I already have an account
                </Button>
              </>
            )}
          </div>
          {!onboarded && (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Free to start</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Kein Konto nötig</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" /> Sofort loslegen, in seconds</span>
            </div>
          )}
        </motion.div>
      </section>

      {/* What is Genauly — plain-language purpose (also satisfies OAuth homepage review) */}
      <section className="relative z-10 mx-auto max-w-3xl px-4 pb-12 sm:px-6">
        <div className="rounded-2xl border border-border bg-surface/70 p-6 shadow-soft backdrop-blur sm:p-8">
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Was ist Genauly?</h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Genauly is a German-learning app for adults who already know the basics but feel stuck
            at the intermediate level, typically somewhere between B1 and B2. Instead of more
            grammar tables, it builds confidence through the real situations you actually face:
            a presentation at work, filling in a Behörde form, talking to a doctor, preparing for
            a job interview, or navigating a difficult conversation with a colleague.
          </p>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            You practise branching dialogues, drill vocabulary with spaced repetition, take leveled
            quizzes, and get AI feedback on your writing and Aussprache. The app also helps with
            preparation for the{" "}
            <span className="font-medium text-foreground">telc Deutsch B2 Beruf</span> and{" "}
            <span className="font-medium text-foreground">Goethe-Zertifikat B2</span> exams.
            Sign in with Google to save your Fortschritt across devices. Free to start, kein Konto
            nötig.
          </p>
          <button
            onClick={() => navigate("/about")}
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
          >
            Mehr über Genauly <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* Feature grid */}
      <section className="relative z-10 mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            {onboarded ? "Weiter geht's, keep the Schwung!" : "Bereit? Let's break through that plateau."}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {onboarded
              ? "Pick up your Training right where you left off. Du schaffst das."
              : "Start free, save your Fortschritt with an account, and learn on every device. Dein Deutsch wartet, let's go."}
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {onboarded ? (
              <Button
                size="lg"
                onClick={goDashboard}
                className="bg-white text-[#0f172a] hover:bg-white/90"
              >
                Zum Dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  onClick={start}
                  className="bg-white text-[#0f172a] hover:bg-white/90"
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
              </>
            )}
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Genauly · German for real life · Deutsch für das echte Leben · B1–B2</p>
        <nav className="mt-1.5 flex items-center justify-center gap-4">
          <button
            onClick={() => navigate("/about")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Über uns
          </button>
          <span aria-hidden className="text-border">·</span>
          <button
            onClick={() => navigate("/privacy")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Datenschutz
          </button>
          <span aria-hidden className="text-border">·</span>
          <button
            onClick={() => navigate("/terms")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            AGB
          </button>
          <span aria-hidden className="text-border">·</span>
          <button
            onClick={() => navigate("/sources")}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            Quellen & Lizenzen
          </button>
        </nav>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} intent={intent} />
    </div>
  );
}
