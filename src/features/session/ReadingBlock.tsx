import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Play, RotateCw, BookOpen, Headphones } from "lucide-react";
import type { SessionBlock, TextKind, TextCheck } from "@/types";
import { textById } from "@/data/texts";
import { speak, stopSpeaking, ttsSupported } from "@/engine/speech";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gloss } from "@/features/shared/Gloss";

/** German label for each authentic-text genre (badge on the reading stage). */
const KIND_LABEL: Record<TextKind, string> = {
  letter: "Brief",
  email: "E-Mail",
  memo: "Notiz",
  announcement: "Aushang",
  voicemail: "Nachricht",
};

/** Split a bank text into paragraphs, keeping inner line breaks (signatures). */
function paragraphs(body: string): string[] {
  return body.split("\n\n").filter((p) => p.trim().length > 0);
}

/**
 * Lesen/Hören comprehension block (redesign Phase 4.4). An authentic-style text
 * (Behörden letter, workplace email, memo, announcement, voicemail) followed by
 * its comprehension checks. Two stages: first read the passage (a listening
 * variant hides the text and plays it via TTS instead, with a reveal fallback),
 * then answer 2–3 MCQs one at a time. Results feed XP + the session tally, never
 * vocab FSRS: this is production/comprehension practice, not a graded SRS card.
 *
 * `onCorrectCheck` awards XP per correct answer; `onComplete(passed)` fires once,
 * after the last check, so the player registers a single aggregate result (the
 * block counts as one tally unit) and reveals its "Weiter" button.
 */
export function ReadingBlock({
  block,
  onCorrectCheck,
  onComplete,
}: {
  block: Extract<SessionBlock, { kind: "reading" }>;
  onCorrectCheck: () => void;
  onComplete: (passed: boolean) => void;
}) {
  const text = textById(block.textId);
  const listening = block.listening && ttsSupported();

  const [stage, setStage] = useState<"read" | "checks">("read");
  // Listening: text stays hidden until the learner reveals it; reading shows it.
  const [textShown, setTextShown] = useState(!listening);
  const [translated, setTranslated] = useState(false);
  const [checkIndex, setCheckIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const correctRef = useRef(0);
  const completedRef = useRef(false);

  // A missing text should never strand the learner: complete the block so the
  // session can advance. (The composer only emits ids that exist, so this is a
  // guard, not an expected path.)
  useEffect(() => {
    if (!text && !completedRef.current) {
      completedRef.current = true;
      onComplete(false);
    }
  }, [text, onComplete]);

  // Never leave TTS talking when the block unmounts (advance / exit).
  useEffect(() => () => stopSpeaking(), []);

  if (!text) return null;

  const checks = text.checks;
  const check = checks[checkIndex];
  const isLast = checkIndex >= checks.length - 1;

  const play = () => speak(text.de, { rate: 0.92 });

  const goToChecks = () => {
    stopSpeaking();
    setStage("checks");
  };

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === check.answer) {
      correctRef.current += 1;
      onCorrectCheck();
    }
    // Answering the last check completes the block right away, so the player's
    // own "Weiter" is the single advance (no extra in-block confirm tap). The
    // block passes when the learner got the majority of checks right.
    if (isLast && !completedRef.current) {
      completedRef.current = true;
      onComplete(correctRef.current >= Math.ceil(checks.length / 2));
    }
  };

  const nextCheck = () => {
    setCheckIndex((i) => i + 1);
    setPicked(null);
  };

  /* ---- Stage 1: read (or listen to) the passage ---- */
  if (stage === "read") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge variant="muted" className="gap-1">
            {listening ? <Headphones className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
            {listening ? "Hören" : "Lesen"} · {KIND_LABEL[text.kind]}
          </Badge>
          <Badge variant="muted">{text.cefr}</Badge>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
          <Gloss
            de={text.title}
            en={text.titleEn}
            className="text-lg font-semibold leading-snug"
          />

          {listening && !textShown ? (
            <div className="mt-4 flex flex-col items-center gap-3 py-6">
              <button
                onClick={play}
                aria-label="Nachricht abspielen"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/20"
              >
                <Play className="h-7 w-7" />
              </button>
              <p className="text-sm text-muted-foreground">Tippe zum Abspielen</p>
              <Button variant="ghost" size="sm" onClick={() => setTextShown(true)}>
                Text anzeigen
              </Button>
            </div>
          ) : (
            <div className="mt-3 space-y-3">
              {paragraphs(translated ? text.en : text.de).map((p, i) => (
                <p
                  key={i}
                  className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90"
                >
                  {p}
                </p>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                {listening && (
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={play}>
                    <RotateCw className="h-4 w-4" /> Noch mal hören
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTranslated((t) => !t)}
                >
                  {translated ? "Deutsch zeigen" : "Übersetzung"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Button variant="gradient" className="h-12 w-full gap-2" onClick={goToChecks}>
          Zu den Fragen <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  /* ---- Stage 2: comprehension checks, one at a time ---- */
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge variant="muted">Verständnis · Frage {checkIndex + 1}/{checks.length}</Badge>
        <button
          onClick={() => (listening ? play() : setStage("read"))}
          className="text-xs font-medium text-muted-foreground underline decoration-dotted underline-offset-4 transition-colors hover:text-foreground"
        >
          {listening ? "Noch mal hören" : "Text noch mal lesen"}
        </button>
      </div>

      <CheckView check={check} picked={picked} onChoose={choose} />

      {/* Non-last checks advance in-block; the last check hands off to the
          player's own "Weiter" (set via onComplete) so there is one advance. */}
      {picked && !isLast && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <Button variant="gradient" className="h-12 w-full gap-2" onClick={nextCheck}>
            Nächste Frage <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

/** One comprehension MCQ, styled like the quiz MCQ options. */
function CheckView({
  check,
  picked,
  onChoose,
}: {
  check: TextCheck;
  picked: string | null;
  onChoose: (opt: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-soft">
        <p className="text-base font-semibold leading-snug">{check.question}</p>
      </div>

      <div className="grid gap-2.5">
        {check.options.map((opt) => {
          const correct = opt === check.answer;
          const isPicked = picked === opt;
          const state = !picked ? "idle" : correct ? "correct" : isPicked ? "wrong" : "dim";
          return (
            <motion.button
              key={opt}
              whileTap={{ scale: 0.99 }}
              disabled={!!picked}
              onClick={() => onChoose(opt)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                state === "idle" && "border-border bg-surface hover:border-primary/40 hover:bg-muted/40",
                state === "correct" && "border-success bg-success/10 text-success",
                state === "wrong" && "border-danger bg-danger/10 text-danger",
                state === "dim" && "border-border opacity-50",
              )}
            >
              {opt}
              {state === "correct" && <Check className="h-4 w-4 shrink-0" />}
              {state === "wrong" && <X className="h-4 w-4 shrink-0" />}
            </motion.button>
          );
        })}
      </div>

      {picked && check.explain && (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
          {check.explain}
        </p>
      )}
    </div>
  );
}
