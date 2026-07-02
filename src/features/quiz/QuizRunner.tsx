import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCw, Trophy, ArrowRight, Sparkles } from "lucide-react";
import type { Difficulty, QuizQuestion, ThemeId } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/misc";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { buildThemeQuiz, quizXp, difficultyLabel } from "@/engine/quiz";
import { QuestionView, kindLabel } from "@/features/quiz/QuestionViews";
import { cn } from "@/lib/utils";

interface Result {
  q: QuizQuestion;
  correct: boolean;
}

export function QuizRunner({
  themeId,
  difficulty,
  themeTitle,
  count = 10,
  onExit,
}: {
  themeId: ThemeId;
  difficulty: Difficulty;
  themeTitle: string;
  count?: number;
  onExit?: () => void;
}) {
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    buildThemeQuiz(themeId, difficulty, count),
  );
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Result[]>([]);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[index];

  const restart = () => {
    setQuestions(buildThemeQuiz(themeId, difficulty, count));
    setIndex(0);
    setResults([]);
    setAnswered(false);
    setDone(false);
  };

  const score = results.filter((r) => r.correct).length;
  const summary = useMemo(
    () => Math.round((score / Math.max(total, 1)) * 100),
    [score, total],
  );

  const recordAndNext = (correct: boolean) => {
    if (answered) return;
    setAnswered(true);
    if (q.sourceId && q.kind !== "matching") {
      reviewVocab(q.sourceId, correct ? 4 : 0);
    }
    if (correct) addXp(quizXp(difficulty));
    setResults((r) => [...r, { q, correct }]);
  };

  const next = () => {
    if (index + 1 >= total) {
      registerSession();
      showToast(`Quiz beendet: ${score}/${total}`, "success");
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(false);
    }
  };

  if (total === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        title="Kein Quiz möglich"
        description="Für dieses Thema und diese Stufe konnten keine Fragen erzeugt werden."
        action={onExit && <Button variant="outline" onClick={onExit}>Zurück</Button>}
      />
    );
  }

  if (done) {
    const weakKinds = Array.from(
      new Set(results.filter((r) => !r.correct).map((r) => kindLabel(r.q.kind))),
    );
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <EmptyState
          icon={Trophy}
          title={`${score} von ${total} richtig · ${summary}%`}
          description={
            summary >= 80
              ? "Ausgezeichnet! Diese Stufe sitzt."
              : "Gute Arbeit – wiederhole die markierten Bereiche."
          }
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="gradient" onClick={restart}>
                <RotateCw className="h-4 w-4" /> Neues Quiz
              </Button>
              {onExit && (
                <Button variant="outline" onClick={onExit}>
                  Andere Stufe
                </Button>
              )}
            </div>
          }
        />

        {weakKinds.length > 0 && (
          <Card>
            <CardContent className="space-y-2 p-4">
              <p className="text-sm font-semibold">Schwächere Bereiche</p>
              <div className="flex flex-wrap gap-2">
                {weakKinds.map((k) => (
                  <Badge key={k} variant="warning">{k}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Per-question review */}
        <div className="space-y-2">
          {results.map((r, i) => (
            <div
              key={r.q.id}
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                r.correct ? "border-success/30 bg-success/5" : "border-danger/30 bg-danger/5",
              )}
            >
              {r.correct ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              )}
              <div>
                <span className="text-muted-foreground">{i + 1}. </span>
                <span className="font-medium">{reviewPrompt(r.q)}</span>
                {!r.correct && (
                  <span className="text-muted-foreground"> → {reviewAnswer(r.q)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{themeTitle} · {difficultyLabel(difficulty)}</span>
          <span className="tabular-nums">{score} richtig</span>
        </div>
        <Progress value={(index / total) * 100} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Frage {index + 1} von {total}</span>
          <Badge variant="muted">{kindLabel(q.kind)}</Badge>
        </div>
      </div>

      <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <QuestionView q={q} answered={answered} onResult={recordAndNext} />
      </motion.div>

      {answered && (
        <Button variant="gradient" className="w-full" onClick={next}>
          {index + 1 >= total ? "Ergebnis ansehen" : "Weiter"} <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}


function reviewPrompt(q: QuizQuestion): string {
  if (q.kind === "matching") return q.pairs.map((p) => p.left).join(", ");
  return q.prompt;
}

function reviewAnswer(q: QuizQuestion): string {
  if (q.kind === "matching") return q.pairs.map((p) => `${p.left} = ${p.right}`).join("; ");
  return q.answer;
}
