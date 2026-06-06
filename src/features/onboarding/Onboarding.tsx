import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Target,
  CalendarClock,
  GraduationCap,
  Briefcase,
  MessagesSquare,
  Check,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  useSettingsStore,
  type CefrLevel,
  type LearningGoal,
} from "@/store/useSettingsStore";

const goals: { id: LearningGoal; label: string; desc: string; icon: typeof Target }[] = [
  { id: "exam", label: "Ace the Prüfung", desc: "Train laser-focused for the B2-Beruf exam.", icon: GraduationCap },
  { id: "work", label: "Shine im Job", desc: "Handle everyday Kommunikation at work with ease.", icon: Briefcase },
  { id: "fluency", label: "Speak flüssiger", desc: "React spontan and sound natural.", icon: MessagesSquare },
];

const levels: { id: CefrLevel; label: string; desc: string }[] = [
  { id: "A2", label: "A2", desc: "Just starting" },
  { id: "B1", label: "B1", desc: "Mittelstufe" },
  { id: "B2", label: "B2", desc: "Getting there" },
  { id: "C1", label: "C1", desc: "Fortgeschritten" },
];

const goalsXp = [
  { value: 50, label: "Easy does it", desc: "≈ 5 Min / Tag" },
  { value: 80, label: "Steady, stetig", desc: "≈ 10 min a day" },
  { value: 120, label: "Ehrgeizig", desc: "≈ 15 min a day" },
];

const TOTAL = 4;

export function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState<LearningGoal>("exam");
  const [level, setLevel] = useState<CefrLevel>("B2");
  const [examDate, setExamDate] = useState("");
  const [dailyGoalXp, setDailyGoalXp] = useState(80);

  const next = () => setStep((s) => Math.min(s + 1, TOTAL - 1));
  // On the first step there's no previous step — go back to the landing page
  // instead of leaving a dead, disabled button.
  const back = () => {
    if (step === 0) navigate("/welcome");
    else setStep((s) => Math.max(s - 1, 0));
  };

  const finish = () => {
    completeOnboarding({
      name: name.trim() || "Lernende:r",
      goal,
      level,
      examDate: examDate || null,
      dailyGoalXp,
    });
    navigate("/", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background bg-mesh px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Genauly: German that clicks</span>
        </div>

        <Card className="overflow-hidden p-0 shadow-elevated">
          {/* Progress */}
          <div className="flex gap-1.5 p-4">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1.5 flex-1 rounded-full transition-colors",
                  i <= step ? "bg-accent-gradient" : "bg-muted",
                )}
              />
            ))}
          </div>

          <div className="px-6 pb-6 pt-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
              >
                {step === 0 && (
                  <div className="space-y-5">
                    <Header
                      icon={Sparkles}
                      title="Willkommen!"
                      subtitle="Your personal coach for Deutsch im Beruf, from Wortschatz and Grammatik to writing and speaking. Let's get you set up."
                    />
                    <div>
                      <label className="mb-1.5 block text-sm font-medium">Wie heißt du? What should we call you?</label>
                      <input
                        autoFocus
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && next()}
                        placeholder="Your name / dein Name"
                        className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                {step === 1 && (
                  <div className="space-y-4">
                    <Header icon={Target} title="Was ist dein Ziel?" subtitle="Tell us your goal, so we can tailor everything to you." />
                    <div className="space-y-2.5">
                      {goals.map((g) => (
                        <SelectRow
                          key={g.id}
                          active={goal === g.id}
                          onClick={() => setGoal(g.id)}
                          icon={g.icon}
                          title={g.label}
                          desc={g.desc}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-4">
                    <Header icon={GraduationCap} title="Dein aktuelles Niveau" subtitle="Your current level. A rough guess is totally fine." />
                    <div className="grid grid-cols-2 gap-2.5">
                      {levels.map((l) => (
                        <button
                          key={l.id}
                          onClick={() => setLevel(l.id)}
                          className={cn(
                            "rounded-xl border p-4 text-left transition-all",
                            level === l.id
                              ? "border-primary bg-primary/8 shadow-soft"
                              : "border-border hover:border-primary/40 hover:bg-muted/40",
                          )}
                        >
                          <p className="text-lg font-semibold">{l.label}</p>
                          <p className="text-xs text-muted-foreground">{l.desc}</p>
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                        Prüfungstermin / exam date (optional)
                      </label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDate(e.target.value)}
                        className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none transition-colors focus:ring-2 focus:ring-ring"
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-4">
                    <Header icon={Sparkles} title="Dein tägliches Ziel" subtitle="Consistency beats intensity, so pick a Ziel you can actually keep." />
                    <div className="space-y-2.5">
                      {goalsXp.map((g) => (
                        <SelectRow
                          key={g.value}
                          active={dailyGoalXp === g.value}
                          onClick={() => setDailyGoalXp(g.value)}
                          title={`${g.label} · ${g.value} XP`}
                          desc={g.desc}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6 flex items-center justify-between">
              <Button variant="ghost" onClick={back}>
                Zurück
              </Button>
              {step < TOTAL - 1 ? (
                <Button variant="gradient" onClick={next} className="gap-1.5">
                  Weiter <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button variant="gradient" onClick={finish} className="gap-1.5">
                  Los geht's <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function Header({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Target;
  title: string;
  subtitle: string;
}) {
  return (
    <div>
      <div className="mb-3 inline-flex rounded-xl bg-primary/12 p-2.5 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function SelectRow({
  active,
  onClick,
  icon: Icon,
  title,
  desc,
}: {
  active: boolean;
  onClick: () => void;
  icon?: typeof Target;
  title: string;
  desc: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
        active ? "border-primary bg-primary/8 shadow-soft" : "border-border hover:border-primary/40 hover:bg-muted/40",
      )}
    >
      {Icon && (
        <div className={cn("rounded-lg p-2", active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border transition-colors",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {active && <Check className="h-3 w-3" />}
      </div>
    </button>
  );
}
