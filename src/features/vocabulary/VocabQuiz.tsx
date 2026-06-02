import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Sparkles, RotateCw, Trophy, ArrowRight } from "lucide-react";
import type { VocabItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { ChoiceButton } from "@/components/shared/ChoiceButton";
import { SessionProgress } from "@/components/shared/SessionProgress";
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
  };

  const next = () => {
    if (!picked) return;
    if (index + 1 >= total) {
      registerSession();
      showToast(`Quiz beendet: ${score}/${total}`, "success");
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  // Allow advancing by tapping anywhere once the question has been answered —
  // but ignore taps that land on an interactive control (choices, speak button).
  const handleTapAnywhere = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!picked) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    next();
  };

  const wasCorrect = picked === q.item.en;

  return (
    <div className="mx-auto max-w-2xl space-y-5" onClick={handleTapAnywhere}>
      <SessionProgress
        value={(index / total) * 100}
        label={`Frage ${index + 1} von ${total}`}
        right={<span className="tabular-nums">{score} richtig</span>}
      />

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
            <ChoiceButton
              key={choice}
              state={state}
              disabled={!!picked}
              onClick={() => choose(choice)}
            >
              {choice}
            </ChoiceButton>
          );
        })}
      </div>

      {picked && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div
            className={cn(
              "rounded-xl border p-4 text-sm",
              wasCorrect ? "border-success/40 bg-success/5" : "border-danger/40 bg-danger/5",
            )}
          >
            <div className="flex items-center gap-2 font-medium">
              {wasCorrect ? <Check className="h-4 w-4 text-success" /> : <X className="h-4 w-4 text-danger" />}
              <span>{q.item.de} → {q.item.en}</span>
              <SpeakButton text={q.item.de} className="ml-auto" />
            </div>
            {q.item.examples[0] && (
              <p className="mt-2 text-muted-foreground">
                <span className="italic">„{q.item.examples[0].de}"</span>
                <span className="mt-0.5 block text-xs">{q.item.examples[0].en}</span>
              </p>
            )}
          </div>
          <Button variant="gradient" className="w-full" onClick={next}>
            {index + 1 >= total ? "Quiz beenden" : "Weiter"} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">Tippe irgendwo, um fortzufahren</p>
        </motion.div>
      )}
    </div>
  );
}
