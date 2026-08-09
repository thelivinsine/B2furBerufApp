import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useT } from "@/lib/uiLang";
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
import { useSessionStore } from "@/store/useSessionStore";
import { useLiveWork } from "@/lib/liveWork";
import { XP } from "@/engine/scoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CorrectionToggle,
  FixTiles,
  MarkedParagraphs,
  MAX_FIX_TILES,
  useCorrectionDiff,
  type CorrectionViewMode,
} from "@/features/writing/correction";
import { cn, formatSeconds, todayKey } from "@/lib/utils";
import { PART_META, examSetTitle } from "./partMeta";
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
/**
 * Is there anything in this run the exit would throw away? (founder s195: the
 * confirm appears "only when the user has some unsaved progress".)
 *
 * A finished part counts, and so does having advanced past one: Teil Sprechen
 * leaves nothing in `answers`, `notes` or `essay`, because its transcript is
 * written server-side turn by turn, so those three alone would wave a candidate
 * out of Teil 3 of 4 without a word.
 */
export function hasProgress(run: MockExamRun): boolean {
  return (
    run.partIx > 0 ||
    Object.keys(run.results).length > 0 ||
    Object.keys(run.answers).length > 0 ||
    Object.keys(run.notes).length > 0 ||
    run.essay.trim() !== ""
  );
}

export function MockExamRunner() {
  const t = useT();
  const run = useExamStore((s) => s.run);
  const tick = useExamStore((s) => s.tick);
  const abandon = useExamStore((s) => s.abandon);
  const finish = useExamStore((s) => s.finish);
  const setZoneExit = useSessionStore((s) => s.setZoneExit);
  const setExamStage = useSessionStore((s) => s.setExamStage);
  const [exitOpen, setExitOpen] = useState(false);

  // A running exam is live work: never reload a deploy over it.
  useLiveWork(!!run && run.phase !== "done", "exam");

  // Register the ONE exit with the shell, which renders it in the top-right
  // corner (founder s195) and drops the bottom bar for the duration (s186). On
  // the result screen the run is already recorded, so leaving is not a loss.
  const onResult = run?.phase === "done";
  // Depends on whether a run exists, NOT on the run object: that object changes
  // on every tick and every answer, which would re-register the handler (and
  // re-render the header) once a second. Anything the handler needs from the
  // live run is read inside it, from the store.
  const running = !!run;
  const untimed = !!run?.untimed;
  // Layout effect, not effect: registering also switches the shell to the
  // one-viewport exam stage, and doing that after paint would show one frame of
  // the normal (bottom-bar, page-scrolling) layout first.
  useLayoutEffect(() => {
    if (!running) return;
    setExamStage(true);
    setZoneExit({
      tone: untimed ? "quiet" : "danger",
      run: () => {
        if (onResult) return finish();
        // The confirm is about LOSING WORK, not about the clock (founder s195):
        // it appears when there is progress the exit would throw away and
        // nowhere else. A confirm over a drill nobody has answered yet is
        // friction that teaches the learner to click through confirms.
        const live = useExamStore.getState().run;
        if (live && !hasProgress(live)) return abandon();
        setExitOpen(true);
      },
    });
    return () => {
      setExamStage(false);
      setZoneExit(null);
    };
  }, [running, onResult, untimed, finish, abandon, setZoneExit, setExamStage]);

  const part = run ? currentPart(run) : null;
  const ticking = !!run && !run.untimed && run.phase === "part" && part !== "sprechen";
  useEffect(() => {
    if (!ticking) return;
    // Immediately, then every second. The store measures against a deadline
    // (s194 audit P3), so the first call is what corrects a run that resumed
    // after a reload or after the tab was backgrounded and the interval
    // throttled; waiting a second for it would flash the stale figure.
    tick();
    const id = setInterval(tick, 1000);
    // The same correction on the way back from a backgrounded tab, where the
    // interval may not have fired at all.
    const onVisible = () => document.visibilityState === "visible" && tick();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [ticking, tick]);

  if (!run) return null;

  const body =
    run.phase === "done" ? (
      <Ergebnis run={run} />
    ) : run.phase === "intro" ? (
      <PartIntro run={run} />
    ) : part === "lesen" ? (
      <LesenPart run={run} />
    ) : part === "hoeren" ? (
      <HoerenPart run={run} />
    ) : part === "schreiben" ? (
      <SchreibenPart run={run} />
    ) : part === "sprechen" ? (
      <SprechenPart run={run} />
    ) : null;

  return (
    <>
      {body}
      <Dialog open={exitOpen} onOpenChange={setExitOpen}>
        <DialogContent className="gap-3">
          {/* Without a clock this is practice, not an exam, so the confirm says
              so (s192, with the Anleitung skip): the run is the same, the frame
              around it is not. The body states the CONSEQUENCE in the founder's
              own words (s195), and it only ever appears over work there is to
              lose, so it can promise that plainly. */}
          <DialogHeader>
            <DialogTitle className="pr-8 text-base">
              {run.untimed ? "Übung verlassen?" : "Prüfung verlassen?"}
            </DialogTitle>
            <DialogDescription>
              {t("Dein Fortschritt wird nicht gespeichert. Möchtest du wirklich zurück?")}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2.5">
            <Button variant="outline" className="flex-1" onClick={() => setExitOpen(false)}>
              {t("Weiter üben")}
            </Button>
            {/* `danger`, not the brand gradient: this app confirms destructive
                actions in danger red (Settings' Konto löschen), and dark blue
                stays the colour of submitting, never of quitting. */}
            <Button
              variant="danger"
              className="flex-1"
              onClick={() => {
                setExitOpen(false);
                abandon();
              }}
            >
              Verlassen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* ------------------------------ shared chrome ----------------------------- */

/**
 * Sprechen carries its own clock (the dialogue runner's); the bar skips it.
 * No exit lives here: the one way out is the header X the shell renders while
 * an exam runs, so the learner is never offered two of them.
 */
export function RunBar({ run, showTimer = true }: { run: MockExamRun; showTimer?: boolean }) {
  const part = currentPart(run);
  const timed = showTimer && !run.untimed;
  const many = run.plan.parts.length > 1;
  const low = run.remainingSec > 0 && run.remainingSec < 120;
  const meta = PART_META[part];
  const Icon = meta.icon;

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-soft">
      {/* The same mark the trainers' `ModuleHeader` carries (s195), so the row
          at the top of a Teil and the row at the top of a trainer are visibly
          the same component rather than two lookalikes. */}
      <span
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
          meta.tile,
        )}
      >
        <Icon className={cn("h-4 w-4", meta.ink)} />
      </span>
      <p className="min-w-0 flex-1 truncate text-sm font-bold">
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
        {timed && (
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
    // Centred (founder s186). gap-1, not 1.5: nine numbers then fit ONE row at
    // 360px wide, and the row the strip would otherwise wrap onto costs the
    // text tile 44px.
    <div className="flex flex-wrap justify-center gap-1">
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
                ? // The DIGIT stays foreground-dark, not accent-ink (founder
                  // s187: "the numbers when answered doesn't look good if the
                  // text format is blue"). Blue-on-blue was the weakest pairing
                  // on the strip; the Himmelblau tint alone carries "answered",
                  // and the number now reads at 11:1 instead of 3.9:1.
                  "border-accent/20 bg-accent/25 text-foreground dark:bg-accent/15"
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

/**
 * The Anleitung. Since s192 this is the MIT-ZEIT screen: an Ohne-Zeit module
 * opens its drill directly (`useExamStore.start`). The untimed wording below
 * stays for the one case that can still reach it, a run that was persisted
 * mid-intro before that change and resumes after the deploy.
 */
function PartIntro({ run }: { run: MockExamRun }) {
  const t = useT();
  const beginPart = useExamStore((s) => s.beginPart);
  const part = currentPart(run);
  const meta = PART_META[part];
  const Icon = meta.icon;
  const many = run.plan.parts.length > 1;

  const examSet =
    part === "sprechen" ? examSets.find((e) => e.id === run.plan.sprechen) : undefined;
  // ONE source for a part's minutes (s194 audit P24). Sprechen used to read the
  // drawn set's own `totalMinutes`, which is 6 for 11 of the 15 sets, so the hub
  // advertised "52 Min gesamt" and the exam ran 51. Sprechen carries no clock
  // anyway (the dialogue keeps its own pace), so the figure is display only and
  // has to be the one the hub printed.
  const minutes = PART_MINUTES[part];

  const mcCount = (ids: string[]) =>
    ids.reduce((sum, id) => sum + (readingTextById(id)?.checks.length ?? 0), 0);
  const facts: string[] = run.untimed ? ["Ohne Uhr"] : [`${minutes} Minuten`];
  if (part === "lesen")
    facts.push(`${run.plan.lesen.length} Texte`, `${mcCount(run.plan.lesen)} Aufgaben`);
  if (part === "hoeren")
    facts.push(`${run.plan.hoeren.length} Ansagen`, `${mcCount(run.plan.hoeren)} Aufgaben`);

  // Only voicemails carry note fields, so a Hören drawn entirely from Durchsagen
  // has no Notizen sheet at all (always the case at C1). The instruction line is
  // therefore chosen from the DRAWN plan rather than promising a task the part
  // may not contain (s194 audit P16).
  const hasNotes =
    part === "hoeren" &&
    run.plan.hoeren.some((id) => (readingTextById(id)?.notes?.length ?? 0) > 0);
  const instructions =
    part === "hoeren" && !hasNotes ? PART_META.hoeren.instructionsPlain : meta.instructions;

  return (
    // Scrolls INSIDE the stage when a long Sprechen briefing outgrows it; the
    // inner wrapper keeps the short parts optically centred without clipping
    // the top of a tall one (the justify-center + overflow trap).
    //
    // From lg up it is the RunBand's ticket composition (founder s195, option
    // 2): the module and the commitment on the left, what to do on the right.
    // A 448px column centred in the 1152px exam stage, with the sidebar and the
    // tab bar both hidden, was the emptiest screen in the app.
    <div className="slim-scrollbar mx-auto min-h-0 w-full max-w-md flex-1 overflow-y-auto lg:max-w-4xl">
      <div className="flex min-h-full flex-col justify-center gap-4 py-1 lg:grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-center lg:gap-8">
      <div className="text-center lg:text-left">
        <div
          className={cn(
            "mx-auto flex h-12 w-12 items-center justify-center rounded-xl lg:mx-0",
            meta.tile,
          )}
        >
          <Icon className={cn("h-7 w-7", meta.ink)} />
        </div>
        <p className="text-eyebrow mt-3 text-primary">
          {many ? `Teil ${run.partIx + 1} von ${run.plan.parts.length}` : "Prüfungsteil"}
        </p>
        <h1 className="text-display text-2xl sm:text-3xl">{PART_LABEL[part]}</h1>
        {/* Desktop keeps the commitment beside the mark; below lg the same two
            controls are the last thing on the screen, where a thumb is. */}
        <div className="mt-4 hidden lg:block">
          <Button variant="gradient" className="w-full" onClick={() => beginPart(minutes * 60)}>
            {many ? `Teil ${run.partIx + 1} starten` : "Starten"}
            <ChevronRight className="h-4 w-4" />
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {run.untimed
              ? "Ohne Uhr: du bestimmst das Tempo."
              : "Der Timer läuft, sobald du startest."}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <p className="text-sm leading-relaxed">{instructions}</p>
          {examSet && (
            <>
              <div className="border-t border-border pt-3">
                <p className="text-xs font-bold text-primary">Aufgabe: {examSetTitle(examSet.title)}</p>
                <p className="mt-1.5 text-sm leading-relaxed">{examSet.taskSheet}</p>
              </div>
              <ul className="space-y-1">
                {examSet.aspects.map((a) => (
                  <li key={a} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" /> {a}
                  </li>
                ))}
              </ul>
              {/* The authored rubric, back on screen (s194 audit P18). It has
                  been required by the content linter and rendered nowhere since
                  s193 removed the self-assessment checkboxes, yet it is exactly
                  what the candidate should know before they start: the criteria
                  the AI debrief weighs. One line, not a second checklist. */}
              {examSet.rubric.length > 0 && (
                <p className="text-xs leading-snug text-muted-foreground">
                  <span className="font-semibold text-foreground">{t("Bewertet wird:")}</span>
                  {examSet.rubric.map((c) => c.label).join(" · ")}
                </p>
              )}
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

      <div className="lg:hidden">
        <Button variant="gradient" className="w-full" onClick={() => beginPart(minutes * 60)}>
          {many ? `Teil ${run.partIx + 1} starten` : "Starten"}
          <ChevronRight className="h-4 w-4" />
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {run.untimed
            ? "Ohne Uhr: du bestimmst das Tempo."
            : "Der Timer läuft, sobald du startest."}
        </p>
      </div>
      </div>
    </div>
  );
}

/* -------------------------------- Ergebnis -------------------------------- */

function Ergebnis({ run }: { run: MockExamRun }) {
  const t = useT();
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
    // Every sitting pays, not only the full four (s194 audit P19): a single
    // module IS the everyday act in this zone, and it used to award nothing at
    // all while still counting for the streak.
    addXp(run.plan.parts.length > 1 ? XP.examComplete : XP.moduleComplete);
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
    // The result can outgrow the stage (four bars plus an expanded answer
    // review), so it scrolls internally like every other part.
    //
    // Two columns from lg up (founder s195, option 2): the score and the four
    // bars on the left, what to do next on the right. It used to be a 448px
    // strip in the middle of the app's widest stage, with "Schwächster Teil"
    // and the actions below the fold.
    <div className="slim-scrollbar mx-auto min-h-0 w-full max-w-md flex-1 space-y-4 overflow-y-auto pb-1 lg:max-w-4xl">
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] lg:items-start lg:gap-6 lg:space-y-0">
      <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="pt-2 text-center"
      >
        <p className="text-eyebrow text-primary">{t("Ergebnis")}</p>
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
          <p className="mt-2 text-sm text-muted-foreground">{t("Kein Teil wurde bewertet.")}</p>
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

      </div>

      <div className="space-y-4">
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
              {t("Üben")}
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {(run.plan.parts.includes("lesen") ||
          run.plan.parts.includes("hoeren") ||
          hasSchreiben) && (
          <Button variant="outline" className="flex-1" onClick={() => setReview((v) => !v)}>
            {review ? "Antworten ausblenden" : "Antworten ansehen"}
          </Button>
        )}
        <Button variant="gradient" className="flex-1" onClick={finish}>
          {t("Fertig")}
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
      </div>

      {/* Full width below both columns: the review is the longest thing on this
          screen and it reads better in one column than squeezed into a third. */}
      {review && <ReviewList run={run} />}
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
      {run.plan.parts.includes("schreiben") && run.essay.trim() && (
        <SchreibenReview essay={run.essay} corrected={schreiben?.corrected ?? null} />
      )}
    </div>
  );
}

/**
 * The exam's written text, corrected (s194 audit P7).
 *
 * `SchreibenPart` has always put the evaluator's `corrected` on the part result
 * and nothing ever rendered it, so the Modelltest gave strictly LESS feedback
 * than the free trainer, whose correction card is the entire point. This is the
 * same `features/writing/correction.tsx` the trainer, Fokus, the Verlauf and the
 * spoken debrief use: its fifth caller, never a fifth copy.
 */
function SchreibenReview({ essay, corrected }: { essay: string; corrected: string | null }) {
  const t = useT();
  const [view, setView] = useState<CorrectionViewMode>("orig");
  const { paragraphs, changes } = useCorrectionDiff(essay, corrected ?? essay);

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold">{t("Schreiben: dein Text")}</p>
          {corrected && <CorrectionToggle view={view} onChange={setView} />}
        </div>
        <MarkedParagraphs paragraphs={paragraphs} view={view} />
        {!corrected ? (
          <p className="text-xs text-muted-foreground">
            {t("Für diesen Text gibt es keine Korrektur.")}
          </p>
        ) : changes.length > 0 ? (
          <FixTiles changes={changes} max={MAX_FIX_TILES} />
        ) : (
          <p className="text-sm font-medium text-success">Sprachlich fehlerfrei. Stark!</p>
        )}
      </CardContent>
    </Card>
  );
}
