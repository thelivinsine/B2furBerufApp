import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Play } from "lucide-react";
import { readingTextById, scoreChecks } from "@/engine/exam";
import { MAX_PLAYS } from "@/engine/exam";
import { useExamStore, type MockExamRun } from "@/store/useExamStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { speak, stopSpeaking } from "@/engine/speech";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { RunBar, AnswerStrip } from "./MockExamRunner";
import type { ReadingText, TextCheck } from "@/types";

/**
 * The two auto-scored parts. One question is on screen at a time; the
 * answer-sheet strip (Option C) jumps freely, Zurück/Weiter step through.
 * Both buttons stay quiet outline controls (founder s186): the only dark blue
 * on screen is "Teil abschließen".
 */

interface Question {
  text: ReadingText;
  check: TextCheck;
}

function useQuestions(ids: string[]): Question[] {
  return useMemo(
    () =>
      ids.flatMap((id) => {
        const text = readingTextById(id);
        return text ? text.checks.map((check) => ({ text, check })) : [];
      }),
    [ids],
  );
}

function useAutoFinish(run: MockExamRun, ids: string[]) {
  const completePart = useExamStore((s) => s.completePart);
  useEffect(() => {
    if (run.phase === "part" && run.remainingSec === 0) {
      completePart(scoreChecks(ids, run.answers));
    }
  }, [run.phase, run.remainingSec, run.answers, ids, completePart]);
}

function QuestionCard({
  run,
  q,
  ordinal,
  total,
}: {
  run: MockExamRun;
  q: Question;
  ordinal: number;
  total: number;
}) {
  const answer = useExamStore((s) => s.answer);
  const chosen = run.answers[q.check.id];
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          Aufgabe {ordinal} von {total}
        </p>
        <p className="mt-1.5 text-sm font-semibold">{q.check.question}</p>
        <div className="mt-2.5 space-y-2">
          {q.check.options.map((opt) => {
            const active = chosen === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => answer(q.check.id, opt)}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  active
                    ? "border-accent/20 bg-accent/20 shadow-soft dark:bg-accent/10"
                    : "border-border bg-surface hover:bg-muted/50",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 rounded-full border-2",
                    active ? "border-accent-ink bg-accent-ink/90" : "border-border",
                  )}
                />
                {opt}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PartFooter({
  run,
  ids,
  qIx,
  setQIx,
  total,
  answeredCount,
}: {
  run: MockExamRun;
  ids: string[];
  qIx: number;
  setQIx: (ix: number) => void;
  total: number;
  answeredCount: number;
}) {
  const completePart = useExamStore((s) => s.completePart);
  const open = total - answeredCount;
  return (
    <div className="space-y-2">
      <div className="flex gap-2.5">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setQIx((qIx - 1 + total) % total)}
        >
          Zurück
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => setQIx((qIx + 1) % total)}>
          Weiter
        </Button>
      </div>
      <Button
        variant="gradient"
        className="w-full"
        onClick={() => completePart(scoreChecks(ids, run.answers))}
      >
        Teil abschließen
      </Button>
      {open > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Noch {open} {open === 1 ? "Aufgabe" : "Aufgaben"} offen
        </p>
      )}
    </div>
  );
}

/* --------------------------------- Lesen ---------------------------------- */

export function LesenPart({ run }: { run: MockExamRun }) {
  const questions = useQuestions(run.plan.lesen);
  const [qIx, setQIx] = useState(() => {
    const first = questions.findIndex((q) => !run.answers[q.check.id]);
    return first === -1 ? 0 : first;
  });
  const [textOpen, setTextOpen] = useState(false);
  useAutoFinish(run, run.plan.lesen);

  const q = questions[Math.min(qIx, questions.length - 1)];
  if (!q) return null;
  const textIndex = run.plan.lesen.indexOf(q.text.id);
  const answeredCount = questions.filter((x) => run.answers[x.check.id]).length;

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <RunBar run={run} />
      <AnswerStrip
        total={questions.length}
        answered={(ix) => !!run.answers[questions[ix].check.id]}
        active={qIx}
        onJump={setQIx}
      />

      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">
                Text {textIndex + 1} von {run.plan.lesen.length} · {kindLabel(q.text.kind)}
              </p>
              <p className="mt-0.5 text-sm font-semibold leading-snug">{q.text.title}</p>
            </div>
            {/* Fullscreen (founder s186): the same expand affordance Schreiben
                has, for reading the whole text with room. */}
            <button
              type="button"
              onClick={() => setTextOpen(true)}
              aria-label="Text vergrößern"
              title="Text vergrößern"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
          <div className="slim-scrollbar mt-2 max-h-[32dvh] overflow-y-auto">
            <p className="whitespace-pre-line text-sm leading-relaxed">{q.text.de}</p>
          </div>
        </CardContent>
      </Card>

      <motion.div
        key={q.check.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <QuestionCard run={run} q={q} ordinal={qIx + 1} total={questions.length} />
      </motion.div>

      <PartFooter
        run={run}
        ids={run.plan.lesen}
        qIx={qIx}
        setQIx={setQIx}
        total={questions.length}
        answeredCount={answeredCount}
      />

      <Dialog open={textOpen} onOpenChange={setTextOpen}>
        <DialogContent className="gap-3">
          <DialogHeader>
            <DialogTitle className="pr-8 text-xs font-bold uppercase tracking-wide text-primary">
              {q.text.title}
            </DialogTitle>
            <DialogDescription className="text-xs">{kindLabel(q.text.kind)}</DialogDescription>
          </DialogHeader>
          <p className="slim-scrollbar max-h-[60dvh] overflow-y-auto whitespace-pre-line text-sm leading-relaxed">
            {q.text.de}
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* --------------------------------- Hören ---------------------------------- */

export function HoerenPart({ run }: { run: MockExamRun }) {
  const questions = useQuestions(run.plan.hoeren);
  const [qIx, setQIx] = useState(() => {
    const first = questions.findIndex((q) => !run.answers[q.check.id]);
    return first === -1 ? 0 : first;
  });
  const registerPlay = useExamStore((s) => s.registerPlay);
  const setNote = useExamStore((s) => s.setNote);
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const speechRate = useSettingsStore((s) => s.speechRate);
  useAutoFinish(run, run.plan.hoeren);
  useEffect(() => () => stopSpeaking(), []);

  const q = questions[Math.min(qIx, questions.length - 1)];
  if (!q) return null;
  const text = q.text;
  const textIndex = run.plan.hoeren.indexOf(text.id);
  const playsUsed = run.plays[text.id] ?? 0;
  const playsLeft = MAX_PLAYS - playsUsed;
  const answeredCount = questions.filter((x) => run.answers[x.check.id]).length;

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <RunBar run={run} />
      <AnswerStrip
        total={questions.length}
        answered={(ix) => !!run.answers[questions[ix].check.id]}
        active={qIx}
        onJump={setQIx}
      />

      <Card>
        <CardContent className="flex items-center gap-3 p-4">
          <button
            type="button"
            disabled={playsLeft <= 0}
            onClick={() => {
              registerPlay(text.id);
              speak(text.de, { voiceURI: voiceURI ?? undefined, rate: speechRate });
            }}
            aria-label="Ansage abspielen"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-white shadow-soft transition-opacity",
              playsLeft <= 0 && "opacity-40",
            )}
          >
            <Play className="ml-0.5 h-4 w-4 fill-current" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Ansage {textIndex + 1} von {run.plan.hoeren.length}
            </p>
            <p className="text-xs tabular-nums text-muted-foreground">
              {kindLabel(text.kind)} ·{" "}
              {playsLeft > 0
                ? `noch ${playsLeft}x abspielbar`
                : "keine Wiedergabe mehr, wie in der Prüfung"}
            </p>
          </div>
        </CardContent>
      </Card>

      {text.notes?.length ? (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary">Deine Notizen</p>
            <div className="mt-1">
              {text.notes.map((n) => {
                const key = `${text.id}|${n.label}`;
                return (
                  <div key={key} className="flex items-baseline gap-3 pt-2.5">
                    <label
                      htmlFor={key}
                      className="w-32 shrink-0 text-xs font-semibold text-muted-foreground"
                    >
                      {n.label}
                    </label>
                    <input
                      id={key}
                      value={run.notes[key] ?? ""}
                      onChange={(e) => setNote(key, e.target.value)}
                      className="w-full border-b border-border bg-transparent pb-1 text-sm outline-none focus:border-accent-ink"
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <motion.div
        key={q.check.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      >
        <QuestionCard run={run} q={q} ordinal={qIx + 1} total={questions.length} />
      </motion.div>

      <PartFooter
        run={run}
        ids={run.plan.hoeren}
        qIx={qIx}
        setQIx={setQIx}
        total={questions.length}
        answeredCount={answeredCount}
      />
    </div>
  );
}

function kindLabel(kind: ReadingText["kind"]): string {
  switch (kind) {
    case "letter":
      return "Brief";
    case "email":
      return "E-Mail";
    case "memo":
      return "Mitteilung";
    case "announcement":
      return "Durchsage";
    case "voicemail":
      return "Mailbox";
  }
}
