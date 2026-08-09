import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  Home,
  GraduationCap,
  Sparkles,
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
import type { LearningMode } from "@/types";
import { recordConsent, hasConsented } from "@/lib/consent";
import { translate, uiLangFor } from "@/lib/uiLang";
import { Logo } from "@/components/shared/Logo";

/**
 * One-screen setup (redesign Phase 1.3). A single "Wofür lernst du Deutsch?"
 * choice sets both the learning goal and the Mode lens, one CEFR chip row sets
 * the level, and the consent checkbox is recorded BEFORE any learning progress
 * is stored. Then the learner lands in the **Bibliothek** (founder s207): the
 * setup card used to hand straight over to a ~90s composed taster session
 * (`/session?min=1`), which decided the first minute for the learner. The
 * library is the zone the nav now opens with, so setup ends by showing them
 * what they signed up for instead of starting a drill.
 * Name, exam date and daily rhythm are collected contextually later, so
 * completeOnboarding leaves them at their store defaults.
 */

const setups: {
  id: string;
  label: string;
  desc: string;
  icon: typeof Briefcase;
  goal: LearningGoal;
  mode: LearningMode;
}[] = [
  { id: "beruf", label: "Beruf", desc: "Job & Büro", icon: Briefcase, goal: "work", mode: "work" },
  { id: "alltag", label: "Alltag", desc: "Behörde, Arzt, Bank", icon: Home, goal: "fluency", mode: "personal" },
  { id: "pruefung", label: "Prüfung", desc: "telc / Goethe B2", icon: GraduationCap, goal: "exam", mode: "both" },
  { id: "beides", label: "Beides", desc: "Beruf & Alltag", icon: Sparkles, goal: "fluency", mode: "both" },
];

const levels: CefrLevel[] = ["A2", "B1", "B2", "C1"];

export function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);
  const langPref = useSettingsStore((s) => s.uiLang);

  const [setupId, setSetupId] = useState("pruefung");
  const [level, setLevel] = useState<CefrLevel>("B2");
  // Guests never open AuthDialog, so setup gates on accepting the terms here.
  const [consent, setConsent] = useState(hasConsented());

  // The interface language follows the level chip the learner is LOOKING at,
  // not the one in the store (nothing is stored until they submit), so tapping
  // A2 switches this card to English on the spot. That is also the moment the
  // rule is easiest to understand: you say your level, the app answers in a
  // language you can read (founder s207).
  const lang = uiLangFor(langPref, level);
  const t = (de: string) => translate(de, lang);

  const start = () => {
    if (!consent) return;
    const setup = setups.find((s) => s.id === setupId) ?? setups[2];
    // Consent is recorded before completeOnboarding writes any profile state.
    recordConsent();
    completeOnboarding({ goal: setup.goal, mode: setup.mode, level });
    // Straight into the Bibliothek, the zone the nav opens with (s207).
    navigate("/library", { replace: true });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background bg-page px-4 py-10">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg"
      >
        <div className="mb-6 flex items-center justify-center">
          <Logo variant="wordmark" className="h-9 w-auto" />
        </div>

        <Card className="space-y-6 p-6 shadow-elevated">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">{t("Wofür lernst du Deutsch?")}</h2>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {setups.map((s) => {
                const Icon = s.icon;
                const active = setupId === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSetupId(s.id)}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      active
                        ? "border-primary bg-primary/10 shadow-soft"
                        : "border-border hover:border-primary/40 hover:bg-muted/40",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-2 inline-flex rounded-lg p-2",
                        active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-semibold">{t(s.label)}</p>
                    <p className="text-xs text-muted-foreground">{t(s.desc)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">{t("Dein Niveau")}</p>
            <div className="grid grid-cols-4 gap-2">
              {levels.map((l) => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "rounded-lg border py-2.5 text-sm font-semibold transition-all",
                    level === l
                      ? "border-primary bg-primary/10 text-primary shadow-soft"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
            />
            {/* Composed as one sentence per language rather than three
                translated fragments: the two links sit in different places in
                German and English, and a fragment map cannot move them. */}
            <span>
              {lang === "de" ? (
                <>
                  Ich stimme den{" "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                    AGB
                  </a>{" "}
                  und der{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                    Datenschutzerklärung
                  </a>{" "}
                  zu.
                </>
              ) : (
                <>
                  I accept the{" "}
                  <a href="/terms" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                    Terms
                  </a>{" "}
                  and the{" "}
                  <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
                    Privacy Policy
                  </a>
                  .
                </>
              )}
            </span>
          </label>

          <Button variant="gradient" onClick={start} disabled={!consent} className="w-full gap-1.5">
            {t("Los geht's")} <ArrowRight className="h-4 w-4" />
          </Button>
        </Card>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Check className="h-3.5 w-3.5" /> {t("In unter einer Minute in deiner Bibliothek")}
        </p>
      </motion.div>
    </div>
  );
}
