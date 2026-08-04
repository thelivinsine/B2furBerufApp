import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Check, ChevronRight, Clock, X } from "lucide-react";
import {
  PART_LABEL,
  PART_MINUTES,
  PASS_PCT,
  readingTextById,
  totalScore,
  type MockPartId,
} from "@/engine/exam";
import { examSets } from "@/data/examSets";
import { useExamStore, currentPart, type MockExamRun } from "@/store/useExamStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useLiveWork } from "@/lib/liveWork";
import { XP } from "@/engine/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatSeconds, todayKey } from "@/lib/utils";
import { PART_META } from "./partMeta";
import { LesenPart, HoerenPart } from "./McParts";
import { SchreibenPart } from "./SchreibenPart";
import { SprechenPart } from "./SprechenPart";

/**
 * The mock-exam flow shell (rework s186, founder picks: Option C in-exam
 * layout, quiet outline Zurück/Weiter, dark blue only on submission moments).
 * Every part opens with an instruction page; the timer arms when the learner
 * starts the part and turns amber under two minutes. The run lives in
 * `useExamStore` (persisted), so a reload resumes instead of losing work.
 */
export function MockExamRunner() {
  const run = useExamStore((s) => s.run);
  const tick = useExamStore((s) => s.tick);

  // A running exam is live work: never reload a deploy over it.
  useLiveWork(!!run && run.phase !== "done", "exam");

  const part = run ? currentPart(run) : null;
  useEffect(() => {
    if (!run || run.phase !== "part" || part === "sprechen") return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [run?.phase, part, tick, run]);

  if (!run) return null;
  if (run.phase === "done") return <Ergebnis run={run} />;
  if (run.phase === "intro") return <PartIntro run={run} />;

  switch (part) {
    case "lesen":
      return <LesenPart run={run} />;
    case "hoeren":
      return <HoerenPart run={run} />;
    case "schreiben":
      return <SchreibenPart run={run} />;
    case "sprechen":
      return <SprechenPart run={run} />;
    default:
      return null;
  }
}

/* ------------------------------ shared chrome ----------------------------- */

/** Sprechen carries its own clock (the dialogue runner's); the bar skips it. */
export function RunBar({ run, showTimer = true }: { run: MockExamRun; showTimer?: boolean }) {
  const abandon = useExamStore((s) => s.abandon);
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  const part = currentPart(run);
  const many = run.plan.parts.length > 1;
  const low = run.remainingSec > 0 && run.remainingSec < 120;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2 shadow-soft">
      <p className="min-w-0 truncate text-sm font-bold">
        {PART_LABEL[part]}
        {many && (
          <span className="font-semibold text-muted-foreground">
            {" "}
            · Teil {run.partIx + 1} von {run.plan.parts.length}
          </span>
        )}
      </p>
      <div className="flex shrink-0 items-center gap-2">
        {many && (
          <div className="hidden items-center gap-1.5 sm:flex">
            {run.plan.parts.map((p, i) => (
              <span
                key={p}
                className={cn(
                  "h-1.5 rounded-full",
                  i < run.partIx
                    ? "w-1.5 bg-success"
                    : i === run.partIx
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-muted",
                )}
              />
            ))}
          </div>
        )}
        {showTimer && (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-sm font-bold tabular-nums shadow-soft",
              low && "border-warning/40 text-warning",
            )}
          >
            <Clock className={cn("h-3.5 w-3.5 text-muted-foreground", low && "text-warning")} />
            {formatSeconds(run.remainingSec)}
          </span>
        )}
        <button
          type="button"
          onClick={() => (armed ? abandon() : setArmed(true))}
          aria-label="Prüfung abbrechen"
          className={cn(
            "flex h-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground",
            armed ? "px-2 text-xs font-semibold text-danger hover:text-danger" : "w-8",
          )}
        >
          {armed ? "Abbrechen?" : <X className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

/** Option C: the numbered answer-sheet strip. Tap a number to jump. */
export function AnswerStrip({
  total,
  answered,
  active,
  onJump,
}: {
  total: number;
  answered: (ix: number) => boolean;
  active: number;
  onJump: (ix: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: total }, (_, ix) => (
        <button
          key={ix}
          type="button"
          onClick={() => onJump(ix)}
          aria-label={`Aufgabe ${ix + 1}`}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border text-xs font-bold tabular-nums transition-colors",
            ix === active
              ? "border-primary bg-primary text-primary-foreground"
              : answered(ix)
                ? "border-accent/20 bg-accent/25 text-accent-ink dark:bg-accent/15"
                : "border-border bg-surface text-muted-foreground hover:bg-muted/60",
          )}
        >
          {ix + 1}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------- Anleitung -------------------------------- */

function PartIntro({ run }: { run: MockExamRun }) {
  const beginPart = useExamStore((s) => s.beginPart);
  const abandon = useExamStore((s) => s.abandon);
  const [armed, setArmed] = useState(false);

  const part = currentPart(run);
  const meta = PART_META[part];
  const Icon = meta.icon;
  const many = run.plan.parts.length > 1;

  const examSet =
    part === "sprechen" ? examSets.find((e) => e.id === run.plan.sprechen) : undefined;
  const minutes = examSet ? examSet.totalMinutes : PART_MINUTES[part];

  const mcCount = (ids: string[]) =>
    ids.reduce((sum, id) => sum + (readingTextById(id)?.checks.length ?? 0), 0);
  const facts: string[] = [`${minutes} Minuten`];
  if (part === "lesen")
    facts.push(`${run.plan.lesen.length} Texte`, `${mcCount(run.plan.lesen)} Aufgaben`);
  if (part === "hoeren")
    facts.push(`${run.plan.hoeren.length} Ansagen`, `${mcCount(run.plan.hoeren)} Aufgaben`);

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col justify-center gap-4">
      <div className="text-center">
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-xl",
            meta.tile,
          )}
        >
          <Icon className={cn("h-7 w-7", meta.ink)} />
        </div>
        <p className="text-eyebrow mt-3 text-primary">
          {many ? `Teil ${run.partIx + 1} von ${run.plan.parts.length}` : "Prüfungsteil"}
        </p>
        <h1 className="text-display text-2xl sm:text-3xl">{PART_LABEL[part]}</h1>
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm leading-relaxed">{meta.instructions}</p>
          {examSet && (
            <>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-primary">Aufgabe: {examSet.title.replace("Prüfungssimulation: ", "")}</p>
                <p className="mt-1.5 text-sm leading-relaxed">{examSet.taskSheet}</p>
              </div>
              <ul className="space-y-1">
                {examSet.aspects.map((a) => (
                  <li key={a} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {a}
                  </li>
                ))}
              </ul>
            </>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3">
            {facts.map((f) => (
              <span key={f} className="text-xs tabular-nums text-muted-foreground">
                {f}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="gradient" className="w-full" onClick={() => beginPart(minutes * 60)}>
        {many ? `Teil ${run.partIx + 1} starten` : "Starten"}
        <ChevronRight className="h-4 w-4" />
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Der Timer läuft, sobald du startest.
      </p>
      <button
        type="button"
        onClick={() => (armed ? abandon() : setArmed(true))}
        className={cn(
          "mx-auto text-sm text-muted-foreground transition-colors hover:text-foreground",
          armed && "font-semibold text-danger hover:text-danger",
        )}
      >
        {armed ? "Wirklich abbrechen?" : "Prüfung abbrechen"}
      </button>
    </div>
  );
}

/* -------------------------------- Ergebnis -------------------------------- */

function Ergebnis({ run }: { run: MockExamRun }) {
  const finish = useExamStore((s) => s.finish);
  const start = useExamStore((s) => s.start);
  const completeMockExam = useProgressStore((s) => s.completeMockExam);
  const addXp = useProgressStore((s) => s.addXp);
  const registerSession = useProgressStore((s) => s.registerSession);
  const mockExams = useProgressStore((s) => s.mockExams);
  const [review, setReview] = useState(false);

  const total = totalScore(run.plan.parts, run.results);

  // Record exactly once, keyed by the run's start timestamp, so a reload on
  // this screen cannot double-count.
  const recorded = useRef(false);
  useEffect(() => {
    if (recorded.current || mockExams.some((m) => m.id === run.startedAt)) return;
    recorded.current = true;
    completeMockExam({
      id: run.startedAt,
      level: run.plan.level,
      date: todayKey(),
      total: total.pct,
      parts: Object.fromEntries(
        run.plan.parts.map((p) => [p, run.results[p]?.pct ?? null]),
      ),
    });
    if (run.plan.parts.length > 1) addXp(XP.examComplete);
    registerSession();
  }, [run, total.pct, mockExams, completeMockExam, addXp, registerSession]);

  const scoredParts = run.plan.parts.filter((p) => run.results[p]?.pct != null);
  const weakest = scoredParts.length > 1
    ? scoredParts.reduce((a, b) =>
        (run.results[a]?.pct ?? 0) <= (run.results[b]?.pct ?? 0) ? a : b,
      )
    : null;
  const hasSchreiben = run.plan.parts.includes("schreiben");
  const schreibenUnscored = hasSchreiben && run.results.schreiben?.pct == null;

  return (
    <div className="mx-auto max-w-md space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 text-center"
      >
        <p className="text-eyebrow text-primary">Ergebnis</p>
        {total.pct != null ? (
          <>
            <p className="text-display mt-1 text-5xl tabular-nums">{total.pct} %</p>
            <div className="mt-2">
              {total.pct >= PASS_PCT ? (
                <Badge variant="success">Bestanden · Grenze {PASS_PCT} %</Badge>
              ) : (
                <Badge variant="muted">Nicht bestanden · Grenze {PASS_PCT} %</Badge>
              )}
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Kein Teil wurde bewertet.</p>
        )}
      </motion.div>

      <Card>
        <CardContent className="space-y-3.5 p-5">
          {run.plan.parts.map((p) => {
            const r = run.results[p];
            const pct = r?.pct;
            return (
              <div key={p}>
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{PART_LABEL[p]}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {pct != null ? `${pct} %` : "ohne Punktzahl"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      pct != null && pct < PASS_PCT ? "bg-warning" : "bg-primary",
                    )}
                    style={{ width: `${pct ?? 0}%` }}
                  />
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {weakest && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Schwächster Teil: {PART_LABEL[weakest]}</p>
              <p className="text-xs text-muted-foreground">Gezielt wiederholen, gleicher Timer</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => start(run.plan.level, [weakest])}
            >
              Üben
            </Button>
          </CardContent>
        </Card>
      )}

      {review && <ReviewList run={run} />}

      <div className="flex gap-3">
        {(run.plan.parts.includes("lesen") ||
          run.plan.parts.includes("hoeren") ||
          hasSchreiben) && (
          <Button variant="outline" className="flex-1" onClick={() => setReview((v) => !v)}>
            {review ? "Antworten ausblenden" : "Antworten ansehen"}
          </Button>
        )}
        <Button variant="gradient" className="flex-1" onClick={finish}>
          Fertig
        </Button>
      </div>

      {hasSchreiben && (
        <p className="text-center text-xs text-muted-foreground">
          {schreibenUnscored
            ? "Schreiben konnte diesmal nicht benotet werden und zählt nicht ins Ergebnis."
            : "Schreiben und Sprechen bewertet eine KI, ohne Gewähr."}
        </p>
      )}
    </div>
  );
}

/** The answer review: every MC question with the learner's and the right answer. */
function ReviewList({ run }: { run: MockExamRun }) {
  const groups = [
    ...run.plan.lesen.map((id) => ({ id, part: "lesen" as MockPartId })),
    ...run.plan.hoeren.map((id) => ({ id, part: "hoeren" as MockPartId })),
  ];
  const schreiben = run.results.schreiben;
  return (
    <div className="space-y-3">
      {groups.map(({ id }) => {
        const text = readingTextById(id);
        if (!text) return null;
        return (
          <Card key={id}>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-semibold">{text.title}</p>
              {text.checks.map((c) => {
                const given = run.answers[c.id];
                const right = given === c.answer;
                return (
                  <div key={c.id} className="text-sm">
                    <p className="flex items-start gap-1.5">
                      {right ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
                      )}
                      <span>{c.question}</span>
                    </p>
                    {!right && (
                      <p className="ml-6 mt-0.5 text-xs text-muted-foreground">
                        {given ? `Deine Antwort: ${given} · ` : "Nicht beantwortet · "}
                        <span className="font-medium text-success">Richtig: {c.answer}</span>
                      </p>
                    )}
                  </div>
                );
              })}
              {text.notes?.length ? (
                <div className="border-t border-border pt-2.5">
                  {text.notes.map((n) => (
                    <p key={n.label} className="text-xs text-muted-foreground">
                      <span className="font-medium text-foreground">{n.label}:</span>{" "}
                      {run.notes[`${text.id}|${n.label}`] || "–"}{" "}
                      <span className="text-success">({n.value})</span>
                    </p>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
      {schreiben?.insight && (
        <Card>
          <CardContent className="space-y-1.5 p-4">
            <p className="text-sm font-semibold">Schreiben: KI-Feedback</p>
            <p className="text-sm leading-relaxed">{schreiben.insight}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
