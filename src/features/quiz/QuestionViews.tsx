import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Volume2, X } from "lucide-react";
import type {
  QuizQuestion,
  MCQQuestion,
  WordOrderQuestion,
  MatchingQuestion,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useAnswerTimer } from "@/lib/hooks";
import { useSettingsStore } from "@/store/useSettingsStore";
import { speak } from "@/engine/speech";
import { cn, shuffle } from "@/lib/utils";

/**
 * The three quiz-question renderers, shared between the standalone QuizRunner
 * and the composed SessionPlayer (UX overhaul Phase 1). Each is a pure "given a
 * question + answered flag, report a boolean result" view; the parent owns
 * scoring, XP and advancing. Extracted from QuizRunner so both surfaces render
 * questions identically without duplicating the markup.
 */

/* ---------------- Multiple-choice ---------------- */
export function MCQView({
  q,
  answered,
  onResult,
}: {
  q: MCQQuestion;
  answered: boolean;
  onResult: (correct: boolean, latencyMs?: number) => void;
}) {
  const guessFirst = useSettingsStore((s) => s.guessFirst);
  const speechRate = useSettingsStore((s) => s.speechRate);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const voiceVariety = useSettingsStore((s) => s.voiceVariety);
  const [picked, setPicked] = useState<string | null>(null);
  // Listening variant (2c): TTS speaks the full sentence; the written prompt is
  // the gapped frame. Auto-play once per question (a session is opened by a tap,
  // so the gesture requirement is satisfied); a replay button covers the rest.
  const isAudio = !!q.audioPrompt;
  const playAudio = () =>
    q.audioPrompt && speak(q.audioPrompt, { rate: speechRate, voiceURI: voiceURI ?? undefined, variety: voiceVariety });
  useEffect(() => {
    if (isAudio) playAudio();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.id]);
  // Correct-by-mount thanks to the per-question remount key (q.id) the parent
  // uses, so a new question always starts un-revealed when the setting is on.
  const [revealed, setRevealed] = useState(!guessFirst);
  // Latency = prompt render to option tap. This is a retrieval-latency signal,
  // so it spans the guess-first "think" stage (it is NOT reset on reveal).
  const elapsed = useAnswerTimer(q.id);

  const choose = (opt: string) => {
    if (picked) return;
    const latencyMs = elapsed();
    setPicked(opt);
    onResult(opt === q.answer, latencyMs);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {isAudio ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Hör zu und wähle das fehlende Wort:
              </p>
              <Button variant="outline" size="lg" className="gap-2" onClick={playAudio}>
                <Volume2 className="h-5 w-5" /> Anhören
              </Button>
              <p className="text-center text-lg font-medium leading-relaxed text-muted-foreground">{q.prompt}</p>
            </div>
          ) : (
            <>
              {q.hint && (
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{q.hint}</p>
              )}
              <div className="flex items-center gap-2">
                <p className="text-xl font-semibold tracking-tight">{q.prompt}</p>
                <SpeakButton text={q.prompt.replace(/_+/g, " … ")} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!revealed ? (
        <div className="space-y-3">
          <p className="text-center text-sm text-muted-foreground">
            Überlege zuerst: Wie heißt die Antwort? Dann vergleiche.
          </p>
          <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>
            Optionen zeigen
          </Button>
        </div>
      ) : (
        <div className="grid gap-2.5">
          {q.options.map((opt) => {
            const correct = opt === q.answer;
            const isPicked = picked === opt;
            const state = !picked ? "idle" : correct ? "correct" : isPicked ? "wrong" : "dim";
            return (
              <motion.button
                key={opt}
                whileTap={{ scale: 0.99 }}
                disabled={!!picked}
                onClick={() => choose(opt)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                  state === "idle" && "border-border bg-surface hover:border-primary/40 hover:bg-muted/40",
                  state === "correct" && "border-success bg-success/10 text-success",
                  state === "wrong" && "border-danger bg-danger/10 text-danger",
                  state === "dim" && "border-border opacity-50",
                )}
              >
                {opt}
                {state === "correct" && <Check className="h-4 w-4" />}
                {state === "wrong" && <X className="h-4 w-4" />}
              </motion.button>
            );
          })}
        </div>
      )}

      {answered && q.explain && (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{q.explain}</p>
      )}
    </div>
  );
}

/* ---------------- Word order ---------------- */
export function WordOrderView({
  q,
  answered,
  onResult,
}: {
  q: WordOrderQuestion;
  answered: boolean;
  onResult: (correct: boolean) => void;
}) {
  const [pool, setPool] = useState<string[]>(q.tokens);
  const [built, setBuilt] = useState<string[]>([]);
  const correct = built.join(" ") === q.answer;

  const check = () => onResult(correct);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{q.prompt}</p>
          {q.hint && <p className="mt-1 text-sm text-muted-foreground">{q.hint}</p>}
        </CardContent>
      </Card>

      <div
        className={cn(
          "flex min-h-[64px] flex-wrap content-start gap-2 rounded-xl border border-dashed p-3",
          answered && correct && "border-success bg-success/5",
          answered && !correct && "border-danger bg-danger/5",
          !answered && "border-border",
        )}
      >
        {built.length === 0 && (
          <span className="self-center text-sm text-muted-foreground">Tippe unten auf die Wörter …</span>
        )}
        {built.map((w, i) => (
          <button
            key={`${w}-${i}`}
            disabled={answered}
            onClick={() => {
              setBuilt((b) => b.filter((_, idx) => idx !== i));
              setPool((p) => [...p, w]);
            }}
            className="rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary"
          >
            {w}
          </button>
        ))}
      </div>

      {!answered && (
        <div className="flex flex-wrap gap-2">
          {pool.map((w, i) => (
            <button
              key={`${w}-${i}`}
              onClick={() => {
                setPool((p) => p.filter((_, idx) => idx !== i));
                setBuilt((b) => [...b, w]);
              }}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-muted/40"
            >
              {w}
            </button>
          ))}
        </div>
      )}

      {!answered ? (
        <Button className="w-full" variant="gradient" disabled={pool.length > 0} onClick={check}>
          Prüfen
        </Button>
      ) : (
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg p-3 text-sm font-medium",
            correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
          )}
        >
          {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {correct ? "Richtig!" : `Lösung: ${q.answer}`}
          <SpeakButton text={q.answer} className="ml-auto" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Matching ---------------- */
export function MatchingView({
  q,
  answered,
  onResult,
}: {
  q: MatchingQuestion;
  answered: boolean;
  onResult: (correct: boolean) => void;
}) {
  const rights = useMemo(() => shuffle(q.pairs.map((p) => p.right)), [q.id]);
  const [assignment, setAssignment] = useState<Record<string, string>>({});
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);

  const allAssigned = Object.keys(assignment).length === q.pairs.length;

  const assign = (right: string) => {
    if (answered || !selectedLeft) return;
    setAssignment((a) => {
      const copy: Record<string, string> = {};
      // remove this right from any prior left, keep others
      for (const [l, r] of Object.entries(a)) if (r !== right && l !== selectedLeft) copy[l] = r;
      copy[selectedLeft] = right;
      return copy;
    });
    setSelectedLeft(null);
  };

  const check = () => {
    const correct = q.pairs.every((p) => assignment[p.left] === p.right);
    onResult(correct);
  };

  const rightFor = (left: string) => assignment[left];
  const usedRights = new Set(Object.values(assignment));

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <p className="text-sm font-medium">{q.prompt}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {q.hint ?? "Wähle links ein Wort, dann rechts die Übersetzung."}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          {q.pairs.map((p) => {
            const assignedRight = rightFor(p.left);
            const isCorrect = answered && assignedRight === p.right;
            const isWrong = answered && assignedRight !== p.right;
            return (
              <button
                key={p.left}
                disabled={answered}
                onClick={() => setSelectedLeft(p.left)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                  selectedLeft === p.left && "border-primary bg-primary/10 text-primary",
                  selectedLeft !== p.left && !answered && "border-border bg-surface hover:border-primary/40",
                  isCorrect && "border-success bg-success/10 text-success",
                  isWrong && "border-danger bg-danger/10 text-danger",
                )}
              >
                <span>{p.left}</span>
                {assignedRight && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">→ {assignedRight}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="space-y-2">
          {rights.map((r) => (
            <button
              key={r}
              disabled={answered || usedRights.has(r)}
              onClick={() => assign(r)}
              className={cn(
                "w-full rounded-lg border px-3 py-2.5 text-left text-sm font-medium transition-colors",
                usedRights.has(r) ? "border-border opacity-40" : "border-border bg-surface hover:border-primary/40 hover:bg-muted/40",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {!answered && (
        <Button className="w-full" variant="gradient" disabled={!allAssigned} onClick={check}>
          Prüfen
        </Button>
      )}
    </div>
  );
}

/* ---------------- Shared dispatch + labels ---------------- */

/** Render whichever view matches the question kind. */
export function QuestionView({
  q,
  answered,
  onResult,
}: {
  q: QuizQuestion;
  answered: boolean;
  onResult: (correct: boolean, latencyMs?: number) => void;
}) {
  if (q.kind === "matching") return <MatchingView q={q} answered={answered} onResult={onResult} />;
  if (q.kind === "wordOrder") return <WordOrderView q={q} answered={answered} onResult={onResult} />;
  return <MCQView q={q} answered={answered} onResult={onResult} />;
}

export function kindLabel(kind: QuizQuestion["kind"]): string {
  const map: Record<QuizQuestion["kind"], string> = {
    translation: "Übersetzung",
    article: "Artikel",
    plural: "Plural",
    cloze: "Lückentext",
    redemittelCloze: "Redemittel-Lücke",
    listeningCloze: "Hören",
    wordOrder: "Satzbau",
    matching: "Zuordnung",
    collocationFill: "Nomen-Verb",
    connectorChoice: "Konnektoren",
    relativePronoun: "Relativpronomen",
    daWord: "da-/wo-Wörter",
  };
  return map[kind];
}
