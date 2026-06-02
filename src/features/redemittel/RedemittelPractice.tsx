import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X, Lightbulb, RotateCw, Eye, ArrowRight, Trophy } from "lucide-react";
import type { RedemittelPhrase } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/misc";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { ChoiceButton } from "@/components/shared/ChoiceButton";
import { SessionProgress } from "@/components/shared/SessionProgress";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { redemittelCategories } from "@/data/redemittel";
import { XP } from "@/engine/scoring";
import { cn, normalize, sample, shuffle } from "@/lib/utils";

type ExType = "choose" | "construct" | "respond";

interface Task {
  type: ExType;
  phrase: RedemittelPhrase;
  choices?: string[]; // for "choose"
  tokens?: string[]; // shuffled for "construct"
}

const catLabel = (id: string) => redemittelCategories.find((c) => c.id === id)?.labelDe ?? id;

function buildTasks(phrases: RedemittelPhrase[], count: number): Task[] {
  const picked = sample(phrases, Math.min(count, phrases.length));
  return picked.map((phrase, i) => {
    const type: ExType = (["choose", "construct", "respond"] as ExType[])[i % 3];
    if (type === "choose") {
      const distractors = sample(
        phrases.filter((p) => p.id !== phrase.id),
        3,
      ).map((p) => p.de);
      return { type, phrase, choices: shuffle([phrase.de, ...distractors]) };
    }
    if (type === "construct") {
      return { type, phrase, tokens: shuffle(phrase.de.split(" ")) };
    }
    return { type, phrase };
  });
}

export function RedemittelPractice({ phrases }: { phrases: RedemittelPhrase[] }) {
  const addXp = useProgressStore((s) => s.addXp);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const registerSession = useProgressStore((s) => s.registerSession);
  const showToast = useSessionStore((s) => s.showToast);

  const [tasks, setTasks] = useState<Task[]>(() => buildTasks(phrases, 9));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  const total = tasks.length;
  const task = tasks[index];

  const restart = () => {
    setTasks(buildTasks(phrases, 9));
    setIndex(0);
    setScore(0);
    setAnswered(false);
    setDone(false);
  };

  // Record the result and reveal feedback — but stay on the question so the
  // learner can reflect before tapping "Weiter" (or anywhere) to continue.
  const recordResult = (correct: boolean) => {
    if (answered) return;
    practiceRedemittel(task.phrase.id);
    if (correct) {
      setScore((s) => s + 1);
      addXp(XP.redemittel);
    }
    setAnswered(true);
  };

  const next = () => {
    if (!answered) return;
    if (index + 1 >= total) {
      registerSession();
      showToast("Übung abgeschlossen!", "success");
      setDone(true);
    } else {
      setIndex((i) => i + 1);
      setAnswered(false);
    }
  };

  const handleTapAnywhere = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!answered) return;
    if ((e.target as HTMLElement).closest("button, a, input")) return;
    next();
  };

  if (phrases.length < 4) {
    return <EmptyState icon={Lightbulb} title="Zu wenige Wendungen" description="Es werden mindestens 4 Redemittel benötigt." />;
  }

  if (done) {
    const pctScore = Math.round((score / total) * 100);
    return (
      <EmptyState
        icon={Trophy}
        title={`${score} von ${total} · ${pctScore}%`}
        description={pctScore >= 80 ? "Klasse! Diese Redemittel sitzen." : "Weiter so – Wiederholung macht den Meister."}
        action={<Button variant="gradient" onClick={restart}><RotateCw className="h-4 w-4" /> Neue Übung</Button>}
      />
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5" onClick={handleTapAnywhere}>
      <SessionProgress
        value={(index / total) * 100}
        label={`Aufgabe ${index + 1} von ${total}`}
        right={<Badge variant="muted">{catLabel(task.phrase.category)}</Badge>}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
        >
          {task.type === "choose" && <ChooseTask task={task} onResult={recordResult} />}
          {task.type === "construct" && <ConstructTask task={task} onResult={recordResult} />}
          {task.type === "respond" && <RespondTask task={task} onResult={recordResult} />}
        </motion.div>
      </AnimatePresence>

      {answered && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <Button variant="gradient" className="w-full" onClick={next}>
            {index + 1 >= total ? "Übung beenden" : "Weiter"} <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground">Tippe irgendwo, um fortzufahren</p>
        </motion.div>
      )}
    </div>
  );
}

/* ---------------- Choose the correct German phrase ---------------- */
function ChooseTask({ task, onResult }: { task: Task; onResult: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<string | null>(null);
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Welche Wendung passt?</p>
          <p className="mt-1 text-lg font-semibold">{task.phrase.en}</p>
        </CardContent>
      </Card>
      <div className="grid gap-2.5">
        {task.choices!.map((c) => {
          const correct = c === task.phrase.de;
          const isPicked = picked === c;
          const state = !picked ? "idle" : correct ? "correct" : isPicked ? "wrong" : "dim";
          return (
            <ChoiceButton
              key={c}
              state={state}
              disabled={!!picked}
              onClick={() => {
                setPicked(c);
                onResult(correct);
              }}
            >
              {c}
            </ChoiceButton>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Construct the phrase from word tiles ---------------- */
function ConstructTask({ task, onResult }: { task: Task; onResult: (correct: boolean) => void }) {
  const [pool, setPool] = useState<string[]>(task.tokens!);
  const [built, setBuilt] = useState<string[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  const target = task.phrase.de;
  const correct = built.join(" ") === target;

  const check = () => {
    setChecked(correct);
    onResult(correct);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bring die Wörter in die richtige Reihenfolge</p>
          <p className="mt-1 text-sm text-muted-foreground">{task.phrase.en}</p>
        </CardContent>
      </Card>

      <div className={cn(
        "flex min-h-[64px] flex-wrap content-start gap-2 rounded-xl border border-dashed p-3",
        checked === true && "border-success bg-success/5",
        checked === false && "border-danger bg-danger/5",
        checked === null && "border-border",
      )}>
        {built.length === 0 && <span className="self-center text-sm text-muted-foreground">Tippe unten auf die Wörter …</span>}
        {built.map((w, i) => (
          <button
            key={`${w}-${i}`}
            disabled={checked !== null}
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

      {checked === null ? (
        <Button className="w-full" variant="gradient" disabled={pool.length > 0} onClick={check}>
          Prüfen
        </Button>
      ) : (
        <div className={cn("flex items-center gap-2 rounded-lg p-3 text-sm font-medium", correct ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
          {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
          {correct ? "Richtig!" : `Lösung: ${target}`}
          <SpeakButton text={target} className="ml-auto" />
        </div>
      )}
    </div>
  );
}

/* ---------------- Quick free-response prompt ---------------- */
function RespondTask({ task, onResult }: { task: Task; onResult: (correct: boolean) => void }) {
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState("");

  const close = normalize(answer).length > 5 && normalize(answer) === normalize(task.phrase.de);

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Schnelle Reaktion</p>
          <p className="mt-1 text-base">
            Wie drückst du das auf Deutsch aus? <span className="font-semibold">„{task.phrase.en}"</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Sprich laut – oder tippe deine Antwort.</p>
        </CardContent>
      </Card>

      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Deine Antwort (optional) …"
        className="h-11 w-full rounded-lg border border-input bg-surface px-3.5 text-sm outline-none focus:ring-2 focus:ring-ring"
      />

      {!revealed ? (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setRevealed(true);
            onResult(true);
          }}
        >
          <Eye className="h-4 w-4" /> Musterlösung zeigen
        </Button>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="rounded-xl border border-primary/30 bg-surface p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <p className="font-semibold">{task.phrase.de}</p>
              <SpeakButton text={task.phrase.de} />
            </div>
            <p className="mt-1 text-sm italic text-muted-foreground">„{task.phrase.example.de}"</p>
            {close && <Badge variant="success" className="mt-2">Deine Antwort passt! 🎯</Badge>}
          </div>
        </motion.div>
      )}
    </div>
  );
}
