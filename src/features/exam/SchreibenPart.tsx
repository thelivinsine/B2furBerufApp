import { useEffect, useRef, useState } from "react";
import { Loader2, Maximize2 } from "lucide-react";
import { planWritingTask, writingLengthFor } from "@/engine/exam";
import { useExamStore, type MockExamRun } from "@/store/useExamStore";
import { evaluateWriting } from "@/lib/writing";
import { levelBand } from "@/lib/writingScope";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UmlautKeys } from "@/features/writing/UmlautKeys";
import { RunBar } from "./MockExamRunner";

/**
 * Teil Schreiben: one fully briefed Aufgabe against the clock. On Abgeben (or
 * when the clock runs out) the text goes through the same AI evaluator the
 * Schreiben trainer uses, in exam mode, which also returns a 0-100 score.
 * When the evaluator cannot score (offline, allowance spent), the part
 * finishes without a number and the result screen says so; an empty page at
 * 0:00 scores 0 like in the real exam.
 */
export function SchreibenPart({ run }: { run: MockExamRun }) {
  const setEssay = useExamStore((s) => s.setEssay);
  const completePart = useExamStore((s) => s.completePart);
  const [taskOpen, setTaskOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const submittingRef = useRef(false);

  const task = planWritingTask(run.plan);
  const words = run.essay.trim() ? run.essay.trim().split(/\s+/).length : 0;

  const submit = async () => {
    if (submittingRef.current) return;
    if (run.essay.trim().length < 10) {
      // Nothing usable submitted: in a real exam an empty sheet is 0 points.
      completePart({ pct: 0, total: 1, correct: 0 });
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setError(null);
    const result = await evaluateWriting({
      theme: run.plan.schreiben?.theme ?? "meetings",
      length: writingLengthFor(run.plan.level),
      text: run.essay,
      taskId: task?.id,
      task: task?.text,
      points: task?.points,
      level: task?.level ? levelBand(task.level) : run.plan.level,
      format: task?.format,
      addressee: task?.addressee,
      register: task?.register,
      words: task?.words,
      exam: true,
    });
    setSubmitting(false);
    submittingRef.current = false;
    if (!result.ok && !result.limitReached) {
      setError(result.message ?? "Die Bewertung ist momentan nicht verfügbar.");
      return;
    }
    completePart({
      pct: typeof result.score === "number" ? result.score : null,
      weakness: result.weakness,
      insight: result.insight ?? result.message,
      corrected: result.corrected ?? null,
    });
  };

  // The clock ran out: submit whatever is on the page, exactly once.
  useEffect(() => {
    if (run.phase === "part" && run.remainingSec === 0) void submit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run.phase, run.remainingSec]);

  // A stale ref after a bank re-authoring: nothing to write against, skip on.
  const missing = !task;
  useEffect(() => {
    if (missing) completePart({ pct: null });
  }, [missing, completePart]);
  if (!task) return null;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col gap-3">
      <div className="shrink-0">
        <RunBar run={run} />
      </div>

      {/* The Aufgabe takes at most a third of the stage and scrolls inside
          (founder s186: no page scroll). The expand button reads it in full. */}
      <Card className="max-h-[34%] shrink-0 overflow-hidden">
        <CardContent className="slim-scrollbar h-full overflow-y-auto p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-primary">Aufgabe</p>
            <button
              type="button"
              onClick={() => setTaskOpen(true)}
              aria-label="Aufgabe vergrößern"
              title="Aufgabe vergrößern"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm leading-relaxed">{task.text}</p>
          {task.points?.length ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {task.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2.5 text-xs tabular-nums text-muted-foreground">{taskMeta(task)}</p>
        </CardContent>
      </Card>

      {/* The elastic element: the field takes exactly the room left over and
          scrolls internally once the text outgrows it. `resize-none` because a
          hand-dragged textarea would push the page past one viewport again. */}
      <Card className="flex min-h-0 flex-1 flex-col">
        <CardContent className="flex min-h-0 flex-1 flex-col p-4">
          <textarea
            ref={textareaRef}
            value={run.essay}
            onChange={(e) => setEssay(e.target.value)}
            aria-label="Dein Text"
            placeholder="Schreibe hier deinen Text …"
            className="slim-scrollbar min-h-0 w-full flex-1 resize-none bg-transparent text-sm leading-relaxed outline-none"
          />
          <div className="mt-2 flex shrink-0 items-center justify-between gap-2 border-t border-border pt-2.5">
            <span className="text-xs tabular-nums text-muted-foreground">
              {words} {words === 1 ? "Wort" : "Wörter"}
              {task.words ? ` · Ziel ca. ${task.words}` : ""}
            </span>
            <UmlautKeys textareaRef={textareaRef} value={run.essay} onChange={setEssay} />
          </div>
        </CardContent>
      </Card>

      <div className="shrink-0 space-y-2">
      <Button variant="gradient" className="w-full" onClick={() => void submit()} disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Wird bewertet …
          </>
        ) : (
          "Abgeben"
        )}
      </Button>
      {error && (
        <div className="space-y-2">
          <p className="text-center text-xs text-danger">{error}</p>
          <Button
            variant="outline"
            className="w-full"
            onClick={() =>
              completePart({ pct: null, insight: "Der Text wurde ohne KI-Bewertung abgegeben." })
            }
          >
            Ohne Bewertung fortfahren
          </Button>
        </div>
      )}
      <p className="text-center text-xs text-muted-foreground">
        Dein Text wird zur Auswertung an eine KI gesendet.
      </p>
      </div>

      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent className="gap-3">
          <DialogHeader>
            <DialogTitle className="pr-8 text-xs font-bold uppercase tracking-wide text-primary">
              Aufgabe
            </DialogTitle>
            <DialogDescription className="text-xs">{taskMeta(task)}</DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed">{task.text}</p>
          {task.points?.length ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {task.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function taskMeta(task: {
  format?: string;
  register?: string;
  words?: number;
  addressee?: string;
}): string {
  const bits: string[] = [];
  if (task.addressee) bits.push(`An: ${task.addressee}`);
  if (task.register) bits.push(task.register === "du" ? "du" : "Sie");
  if (task.words) bits.push(`ca. ${task.words} Wörter`);
  return bits.join(" · ");
}
