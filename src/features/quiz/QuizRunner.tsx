import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, RotateCw, Trophy, ArrowRight, Sparkles } from "lucide-react";
import type {
  Difficulty,
  QuizQuestion,
  MCQQuestion,
  WordOrderQuestion,
  MatchingQuestion,
  ThemeId,
} from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { ChoiceButton } from "@/components/shared/ChoiceButton";
import { SessionProgress } from "@/components/shared/SessionProgress";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { buildThemeQuiz, quizXp } from "@/engine/quiz";
import { cn, shuffle } from "@/lib/utils";

const levelLabel: Record<Difficulty, string> = { 1: "Leicht", 2: "Mittel", 3: "Schwer" };

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
      <SessionProgress
        value={(index / total) * 100}
        label={`${themeTitle} · ${levelLabel[difficulty]}`}
        right={<span className="tabular-nums">{score} richtig</span>}
        below={
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Frage {index + 1} von {total}</span>
            <Badge variant="muted">{kindLabel(q.kind)}</Badge>
          </div>
        }
      />

      <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {q.kind === "matching" ? (
          <MatchingView q={q} answered={answered} onResult={recordAndNext} />
        ) : q.kind === "wordOrder" ? (
          <WordOrderView q={q} answered={answered} onResult={recordAndNext} />
        ) : (
          <MCQView q={q} answered={answered} onResult={recordAndNext} />
        )}
      </motion.div>

      {answered && (
        <Button variant="gradient" className="w-full" onClick={next}>
          {index + 1 >= total ? "Ergebnis ansehen" : "Weiter"} <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

/* ---------------- Multiple-choice ---------------- */
function MCQView({
  q,
  answered,
  onResult,
}: {
  q: MCQQuestion;
  answered: boolean;
  onResult: (correct: boolean) => void;
}) {
  const [picked, setPicked] = useState<string | null>(null);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    onResult(opt === q.answer);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          {q.hint && (
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">{q.hint}</p>
          )}
          <div className="flex items-center gap-2">
            <p className="text-xl font-semibold tracking-tight">{q.prompt}</p>
            <SpeakButton text={q.prompt.replace(/_+/g, " … ")} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2.5">
        {q.options.map((opt) => {
          const correct = opt === q.answer;
          const isPicked = picked === opt;
          const state = !picked ? "idle" : correct ? "correct" : isPicked ? "wrong" : "dim";
          return (
            <ChoiceButton
              key={opt}
              state={state}
              disabled={!!picked}
              onClick={() => choose(opt)}
            >
              {opt}
            </ChoiceButton>
          );
        })}
      </div>

      {answered && q.explain && (
        <p className="rounded-lg bg-muted/50 px-3 py-2 text-sm text-muted-foreground">{q.explain}</p>
      )}
    </div>
  );
}

/* ---------------- Word order ---------------- */
function WordOrderView({
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
            className="rounded-lg bg-primary/12 px-3 py-1.5 text-sm font-medium text-primary"
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
function MatchingView({
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
          <p className="mt-1 text-xs text-muted-foreground">Wähle links ein Wort, dann rechts die Übersetzung.</p>
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

/* ---------------- Helpers ---------------- */
function kindLabel(kind: QuizQuestion["kind"]): string {
  const map: Record<QuizQuestion["kind"], string> = {
    translation: "Übersetzung",
    article: "Artikel",
    plural: "Plural",
    cloze: "Lückentext",
    wordOrder: "Satzbau",
    matching: "Zuordnung",
    collocationFill: "Nomen-Verb",
    connectorChoice: "Konnektoren",
    relativePronoun: "Relativpronomen",
    daWord: "da-/wo-Wörter",
  };
  return map[kind];
}

function reviewPrompt(q: QuizQuestion): string {
  if (q.kind === "matching") return q.pairs.map((p) => p.left).join(", ");
  return q.prompt;
}

function reviewAnswer(q: QuizQuestion): string {
  if (q.kind === "matching") return q.pairs.map((p) => `${p.left} = ${p.right}`).join("; ");
  return q.answer;
}
