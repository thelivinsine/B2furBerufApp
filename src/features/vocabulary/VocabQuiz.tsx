import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, RotateCw, Trophy } from "lucide-react";
import type { VocabItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { XP } from "@/engine/scoring";
import { cn, sample, shuffle } from "@/lib/utils";

interface Question {
  item: VocabItem;
  choices: string[];
}

function buildQuiz(items: VocabItem[], count: number): Question[] {
  const pool = sample(items, Math.min(count, items.length));
  return pool.map((item) => {
    const distractors = sample(
      items.filter((v) => v.id !== item.id),
      3,
    ).map((v) => v.en);
    return { item, choices: shuffle([item.en, ...distractors]) };
  });
}

export function VocabQuiz({ items }: { items: VocabItem[] }) {
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  const [questions, setQuestions] = useState<Question[]>(() => buildQuiz(items, 10));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[index];

  const restart = () => {
    setQuestions(buildQuiz(items, 10));
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  };

  const summary = useMemo(() => Math.round((score / Math.max(total, 1)) * 100), [score, total]);

  if (items.length < 4) {
    return <EmptyState icon={Sparkles} title="Zu wenige Vokabeln" description="Wähle ein Thema mit mindestens 4 Vokabeln für das Quiz." />;
  }

  if (done) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
        <EmptyState
          icon={Trophy}
          title={`${score} von ${total} richtig · ${summary}%`}
          description={summary >= 80 ? "Ausgezeichnet! Du beherrschst diese Vokabeln." : "Gute Arbeit – wiederhole die schwierigen Wörter."}
          action={<Button variant="gradient" onClick={restart}><RotateCw className="h-4 w-4" /> Neues Quiz</Button>}
        />
      </motion.div>
    );
  }

  const choose = (choice: string) => {
    if (picked) return;
    setPicked(choice);
    const correct = choice === q.item.en;
    reviewVocab(q.item.id, correct ? 4 : 0);
    if (correct) {
      setScore((s) => s + 1);
      addXp(XP.quizCorrect);
    }
    setTimeout(() => {
      if (index + 1 >= total) {
        registerSession();
        showToast(`Quiz beendet: ${correct ? score + 1 : score}/${total}`, "success");
        setDone(true);
      } else {
        setIndex((i) => i + 1);
        setPicked(null);
      }
    }, 900);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Frage {index + 1} von {total}</span>
          <span className="tabular-nums">{score} richtig</span>
        </div>
        <Progress value={(index / total) * 100} />
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Was bedeutet …?
          </p>
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold tracking-tight">{q.item.de}</p>
            <SpeakButton text={q.item.de} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-2.5">
        {q.choices.map((choice) => {
          const isCorrect = choice === q.item.en;
          const isPicked = picked === choice;
          const state = !picked ? "idle" : isCorrect ? "correct" : isPicked ? "wrong" : "dim";
          return (
            <motion.button
              key={choice}
              whileTap={{ scale: 0.99 }}
              disabled={!!picked}
              onClick={() => choose(choice)}
              className={cn(
                "flex items-center justify-between rounded-xl border px-4 py-3.5 text-left text-sm font-medium transition-colors",
                state === "idle" && "border-border bg-surface hover:border-primary/40 hover:bg-muted/40",
                state === "correct" && "border-success bg-success/10 text-success",
                state === "wrong" && "border-danger bg-danger/10 text-danger",
                state === "dim" && "border-border opacity-50",
              )}
            >
              {choice}
              {state === "correct" && <Check className="h-4 w-4" />}
              {state === "wrong" && <X className="h-4 w-4" />}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
