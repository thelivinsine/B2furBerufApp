import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Play } from "lucide-react";
import { readingTextById, scoreChecks } from "@/engine/exam";
import { MAX_PLAYS } from "@/engine/exam";
import { useExamStore, type MockExamRun } from "@/store/useExamStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { speak, stopSpeaking, ttsSupported } from "@/engine/speech";
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
 * answer-sheet strip jumps freely, Zurück/Weiter step through, and both stay
 * quiet outline controls (founder s186). Dark blue appears exactly once, on the
 * last question with everything answered, where it replaces Weiter with
 * "Teil abschließen".
 *
 * Layout law (founder s186 + the s187 polish round, preview variant "B"):
 *  - the question is ALWAYS fully visible, and it carries NO tile of its own:
 *    the question line and its answer rows sit straight on the page ground, so
 *    the screen holds ONE card (the text / the Notizen sheet) instead of a big
 *    one beside a small one.
 *  - each block is as tall as its own content and the pair sits centred in the
 *    stage, so a short text leaves air around the cards, never inside them.
 *  - the bottom cluster is number strip + Zurück/Weiter, pinned, with real
 *    space above and below it.
 *  - the learner can RESIZE: sideways between the two blocks and downwards on
 *    the text card (desktop), up and down between them (mobile). Every question
 *    change puts the sizes back to default (founder: "when pressed next
 *    question the tiles should go back to the default sizes").
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
    if (!run.untimed && run.phase === "part" && run.remainingSec === 0) {
      completePart(scoreChecks(ids, run.answers));
    }
  }, [run.untimed, run.phase, run.remainingSec, run.answers, ids, completePart]);
}

/**
 * True while the element has content below its own fold. Both scrolling regions
 * in a Teil use it to fade their last line, so a half-cut line reads as "there
 * is more", never as a broken card.
 */
function useOverflowFade<T extends HTMLElement>(deps: unknown) {
  const ref = useRef<T>(null);
  const [more, setMore] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const sync = () => setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 4);
    sync();
    el.addEventListener("scroll", sync);
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [deps]);
  return { ref, more };
}

const FADE = "[mask-image:linear-gradient(to_bottom,#000_calc(100%-26px),transparent)]";

/* ------------------------------- resizing --------------------------------- */

const DEFAULT_SPLIT = 56; // % of the row the reading side takes on desktop
const MIN_SPLIT = 32;
const MAX_SPLIT = 72;
const MIN_LEAD = 24; // % of the column the reading side keeps on mobile
const MAX_LEAD = 64;

/**
 * The two drag handles. Both are real separators: pointer drag plus arrow keys,
 * because a control that only answers to a mouse is not a control on a tablet
 * with a keyboard. `reset` is called from the question change, never from here.
 */
function useSplit() {
  const [split, setSplit] = useState<number | null>(null); // desktop, %
  const [lead, setLead] = useState<number | null>(null); // mobile, %
  const [tall, setTall] = useState<number | null>(null); // desktop text height, px
  const rowRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);

  const reset = useCallback(() => {
    setSplit(null);
    setLead(null);
    setTall(null);
  }, []);

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  const dragSide = (e: React.PointerEvent) => {
    const row = rowRef.current;
    if (!row) return;
    e.preventDefault();
    const box = row.getBoundingClientRect();
    const move = (ev: PointerEvent) =>
      setSplit(clamp(((ev.clientX - box.left) / box.width) * 100, MIN_SPLIT, MAX_SPLIT));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const dragStack = (e: React.PointerEvent) => {
    const row = rowRef.current;
    if (!row) return;
    e.preventDefault();
    const box = row.getBoundingClientRect();
    const move = (ev: PointerEvent) =>
      setLead(clamp(((ev.clientY - box.top) / box.height) * 100, MIN_LEAD, MAX_LEAD));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const dragTall = (e: React.PointerEvent) => {
    const row = rowRef.current;
    const lead = leadRef.current;
    if (!row || !lead) return;
    e.preventDefault();
    const startY = e.clientY;
    const startH = lead.getBoundingClientRect().height;
    const limit = row.getBoundingClientRect().height;
    // The pair is centred, so it grows at both ends: doubling the delta keeps
    // the bottom edge under the pointer.
    const move = (ev: PointerEvent) =>
      setTall(clamp(startH + (ev.clientY - startY) * 2, 132, limit));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const keyTall = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const row = rowRef.current;
    const el = leadRef.current;
    if (!row || !el) return;
    const next = el.getBoundingClientRect().height + (e.key === "ArrowUp" ? -24 : 24);
    setTall(clamp(next, 132, row.getBoundingClientRect().height));
  };

  const keySide = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setSplit((v) => clamp((v ?? DEFAULT_SPLIT) + (e.key === "ArrowLeft" ? -4 : 4), MIN_SPLIT, MAX_SPLIT));
  };
  const keyStack = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const row = rowRef.current;
    const lead = leadRef.current;
    if (!row || !lead) return;
    const pct = (lead.getBoundingClientRect().height / row.getBoundingClientRect().height) * 100;
    setLead(clamp(pct + (e.key === "ArrowUp" ? -5 : 5), MIN_LEAD, MAX_LEAD));
  };

  return {
    split, lead, tall,
    rowRef, leadRef, reset,
    dragSide, dragStack, dragTall,
    keySide, keyStack, keyTall,
  };
}

/**
 * The lead side's geometry rides CSS variables rather than inline width/height,
 * so ONE piece of state drives both breakpoints: on a phone the drag sets a
 * height share, on desktop it sets a width share and an optional card height,
 * and the `lg:` utilities simply win where they apply.
 */
function leadStyle({
  lead,
  split,
  tall,
}: {
  lead: number | null;
  split: number | null;
  tall: number | null;
}): React.CSSProperties {
  return {
    "--lead-basis": lead != null ? `${lead}%` : undefined,
    "--split-basis": split != null ? `${split}%` : undefined,
    "--tall": tall != null ? `${tall}px` : undefined,
  } as React.CSSProperties;
}

function QuestionBlock({
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
    // No "Aufgabe N von M" eyebrow: the number strip already says which
    // question this is (founder s186).
    <div data-exam-question aria-label={`Aufgabe ${ordinal} von ${total}`} className="lg:px-1">
      <p className="text-base font-semibold leading-snug">{q.check.question}</p>
      <div className="mt-3 space-y-2">
        {q.check.options.map((opt) => {
          const active = chosen === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => answer(q.check.id, opt)}
              className={cn(
                // On the page ground now, so each row carries the card's own
                // fill and lift instead of borrowing a tile's.
                "flex w-full items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-left text-sm shadow-soft transition-colors",
                active
                  ? // One step stronger in dark than the old blue ground needed:
                    // a 15% tint disappeared on the s187 neutral greys.
                    "border-accent/20 bg-accent/20 dark:border-accent/25 dark:bg-accent/[0.22]"
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
    </div>
  );
}

function PartFooter({
  run,
  ids,
  qIx,
  go,
  total,
  answeredCount,
}: {
  run: MockExamRun;
  ids: string[];
  qIx: number;
  go: (ix: number) => void;
  total: number;
  answeredCount: number;
}) {
  const completePart = useExamStore((s) => s.completePart);
  const [confirmOpen, setConfirmOpen] = useState(false);
  // "Teil abschließen" only on the LAST question (founder s186): a permanent
  // submit row cost every screen ~52px.
  //
  // Until the s194 audit (P1) it also required every answer, and the only other
  // way a part could end was the clock reaching zero. Ohne Zeit has no clock, so
  // an untimed drill with one blank answer had NO completion path at all: the
  // learner's only exit was the header Zurück, which abandons the run and loses
  // the work. Ohne Zeit is where a learner lands, so that was the default path.
  // The button is now always there on the last question; leaving answers blank
  // costs a confirm that names the count, not the ability to hand in.
  const last = qIx === total - 1;
  const open = total - answeredCount;
  const submit = () => completePart(scoreChecks(ids, run.answers));

  return (
    <>
      <div className="flex gap-2.5 pt-3">
        <Button variant="outline" className="flex-1" onClick={() => go((qIx - 1 + total) % total)}>
          Zurück
        </Button>
        {last ? (
          <Button
            variant="gradient"
            className="flex-1"
            onClick={() => (open > 0 ? setConfirmOpen(true) : submit())}
          >
            Teil abschließen
          </Button>
        ) : (
          <Button variant="outline" className="flex-1" onClick={() => go((qIx + 1) % total)}>
            Weiter
          </Button>
        )}
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="gap-3">
          <DialogHeader>
            <DialogTitle className="pr-8 text-base">Teil abschließen?</DialogTitle>
            <DialogDescription>
              {open === 1
                ? "Eine Aufgabe ist noch nicht beantwortet und zählt als falsch."
                : `${open} Aufgaben sind noch nicht beantwortet und zählen als falsch.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2.5">
            <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
              Weiter bearbeiten
            </Button>
            <Button
              variant="gradient"
              className="flex-1"
              onClick={() => {
                setConfirmOpen(false);
                submit();
              }}
            >
              Abschließen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** The reading card: title row, the text scrolling inside, a grow handle. */
function TextCard({
  text,
  index,
  count,
  onExpand,
  grow,
  growKey,
}: {
  text: ReadingText;
  index: number;
  count: number;
  onExpand: () => void;
  grow: (e: React.PointerEvent) => void;
  growKey: (e: React.KeyboardEvent) => void;
}) {
  const { ref: body, more } = useOverflowFade<HTMLDivElement>(text.id);

  return (
    <Card className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <CardContent className="flex min-h-0 flex-1 flex-col p-4 sm:p-5">
        <div className="flex shrink-0 items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">
              Text {index + 1} von {count} · {kindLabel(text.kind)}
            </p>
            {/* One line on a phone: the whole title lives in the expand dialog,
                and two wrapped lines cost the reading region ~24px. */}
            <p className="mt-0.5 truncate text-sm font-semibold leading-snug sm:whitespace-normal">
              {text.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onExpand}
            aria-label="Text vergrößern"
            title="Text vergrößern"
            className="-mr-1.5 -mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
        <div
          ref={body}
          className={cn(
            "slim-scrollbar mt-2 min-h-0 flex-1 overflow-y-auto pb-5",
            more && FADE,
          )}
        >
          <p className="whitespace-pre-line text-sm leading-relaxed">{text.de}</p>
        </div>
      </CardContent>
      {/* Grow handle (desktop): the card takes room from the air around it. */}
      <div
        role="separator"
        aria-orientation="horizontal"
        aria-label="Textkarte höher oder niedriger ziehen"
        tabIndex={0}
        onPointerDown={grow}
        onKeyDown={growKey}
        className="group absolute inset-x-0 bottom-0 hidden h-4 cursor-ns-resize touch-none items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
      >
        <span className="h-1 w-8 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/60" />
      </div>
    </Card>
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

  return (
    <>
      <SplitShell
        run={run}
        ids={run.plan.lesen}
        questions={questions}
        qIx={qIx}
        setQIx={setQIx}
        lead={({ grow, growKey }) => (
          <TextCard
            text={q.text}
            index={textIndex}
            count={run.plan.lesen.length}
            onExpand={() => setTextOpen(true)}
            grow={grow}
            growKey={growKey}
          />
        )}
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
    </>
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
  // Keyed by text id rather than a bare boolean: moving to the next Ansage then
  // makes `playing` false by derivation instead of by resetting state from an
  // effect, so nothing cascades a render.
  const [playingId, setPlayingId] = useState<string | null>(null);
  useAutoFinish(run, run.plan.hoeren);
  useEffect(() => () => stopSpeaking(), []);

  const q = questions[Math.min(qIx, questions.length - 1)];
  const activeId = q?.text.id;
  // Moving to a question about the NEXT Ansage stops the previous one: two
  // recordings talking over each other is not a listening exercise (audit P12).
  useEffect(() => stopSpeaking(), [activeId]);

  if (!q) return null;
  const text = q.text;
  const textIndex = run.plan.hoeren.indexOf(text.id);
  const playsUsed = run.plays[text.id] ?? 0;
  const playsLeft = MAX_PLAYS - playsUsed;
  const playing = playingId === text.id;
  // No speech synthesis (or no voice at all) means this part cannot be heard.
  // It used to fail silently: both plays were consumed by clicks that produced
  // nothing, the questions were unanswerable and the part scored 0 with no
  // explanation. Now the card says so and the text is offered instead, which is
  // a worse exercise than listening but an honest one (audit P12).
  const audible = ttsSupported();

  return (
    <SplitShell
      run={run}
      ids={run.plan.hoeren}
      questions={questions}
      qIx={qIx}
      setQIx={setQIx}
      lead={() => (
        <div className="flex min-h-0 flex-1 flex-col gap-3">
          <Card className="shrink-0">
            <CardContent className="flex items-center gap-3 p-4">
              <button
                type="button"
                // Disabled WHILE PLAYING too: `speak` opens with
                // `synth.cancel()`, so a double tap used to burn both plays and
                // let the learner hear only the second one (audit P12).
                disabled={playsLeft <= 0 || playing || !audible}
                onClick={() => {
                  // Counted on a play that really starts, never on the click.
                  setPlayingId(text.id);
                  registerPlay(text.id);
                  speak(text.de, {
                    voiceURI: voiceURI ?? undefined,
                    rate: speechRate,
                    onEnd: () => setPlayingId(null),
                  });
                }}
                aria-label="Ansage abspielen"
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-white shadow-soft transition-opacity",
                  (playsLeft <= 0 || playing || !audible) && "opacity-40",
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
                  {!audible
                    ? "Dein Browser kann keine Ansagen vorlesen"
                    : playing
                      ? "läuft …"
                      : playsLeft > 0
                        ? `noch ${playsLeft}x abspielbar`
                        : "keine Wiedergabe mehr, wie in der Prüfung"}
                </p>
              </div>
            </CardContent>
          </Card>

          {!audible && (
            <Card className="shrink-0">
              <CardContent className="p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Text der Ansage
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed">{text.de}</p>
              </CardContent>
            </Card>
          )}

          {text.notes?.length ? (
            <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
              <CardContent className="slim-scrollbar min-h-0 flex-1 overflow-y-auto p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Deine Notizen
                </p>
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
        </div>
      )}
    />
  );
}

/* ------------------------------- split shell ------------------------------ */

/**
 * The shell both parts share: RunBar, the resizable pair (lead side + the
 * tile-less question), and the pinned number strip + navigation.
 */
function SplitShell({
  run,
  ids,
  questions,
  qIx,
  setQIx,
  lead,
}: {
  run: MockExamRun;
  ids: string[];
  questions: Question[];
  qIx: number;
  setQIx: (ix: number) => void;
  lead: (handles: {
    grow: (e: React.PointerEvent) => void;
    growKey: (e: React.KeyboardEvent) => void;
  }) => React.ReactNode;
}) {
  const {
    lead: leadShare,
    split,
    tall,
    rowRef,
    leadRef,
    reset,
    dragSide,
    dragStack,
    dragTall,
    keySide,
    keyStack,
    keyTall,
  } = useSplit();
  const q = questions[Math.min(qIx, questions.length - 1)];
  const answeredCount = questions.filter((x) => run.answers[x.check.id]).length;
  const { ref: qScroll, more: qMore } = useOverflowFade<HTMLDivElement>(q.check.id);

  const go = (ix: number) => {
    reset();
    setQIx(ix);
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col lg:max-w-none">
      <RunBar run={run} />

      <div ref={rowRef} className="mt-3 flex min-h-0 flex-1">
        {/* h-full, not auto: a percentage max-height only resolves against a
            parent with a DEFINITE height, so an auto-height wrapper here made
            every `max-h-full` below it a no-op and a tall question could push
            the stage past one viewport. The wrapper fills the room and
            `lg:items-center` does the centring instead. */}
        <div className="flex h-full min-h-0 w-full flex-col lg:flex-row lg:items-center">
          <div
            ref={leadRef}
            style={leadStyle({ lead: leadShare, split, tall })}
            className={cn(
              "flex max-h-full min-h-[6.5rem] min-w-0 flex-col sm:min-h-[8.25rem]",
              // Phone: elastic until dragged, then a fixed share of the column.
              leadShare != null ? "flex-none basis-[var(--lead-basis)]" : "flex-1 basis-0",
              // Desktop: a width share, and the height the grow handle set.
              "lg:h-[var(--tall,auto)] lg:flex-none lg:basis-[var(--split-basis,56%)]",
            )}
          >
            {lead({ grow: dragTall, growKey: keyTall })}
          </div>

          <div
            role="separator"
            aria-orientation="horizontal"
            aria-label="Bereiche verschieben"
            tabIndex={0}
            onPointerDown={dragStack}
            onKeyDown={keyStack}
            className="group flex h-3.5 shrink-0 cursor-row-resize touch-none items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <span className="h-1 w-8 rounded-full bg-border transition-colors group-hover:bg-muted-foreground/60" />
          </div>
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Bereiche verschieben"
            tabIndex={0}
            onPointerDown={dragSide}
            onKeyDown={keySide}
            className="group hidden w-4 shrink-0 cursor-col-resize touch-none items-center justify-center self-stretch rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring lg:flex"
          >
            <span className="h-9 w-1 rounded-full bg-transparent transition-colors group-hover:bg-border" />
          </div>

          <motion.div
            key={q.check.id}
            ref={qScroll}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "slim-scrollbar max-h-full min-h-0 shrink overflow-y-auto lg:min-w-0 lg:flex-1",
              qMore && FADE,
            )}
          >
            <QuestionBlock run={run} q={q} ordinal={qIx + 1} total={questions.length} />
          </motion.div>
        </div>
      </div>

      <div className="mx-auto w-full shrink-0 pt-4 lg:max-w-xl">
        <AnswerStrip
          total={questions.length}
          answered={(ix) => !!run.answers[questions[ix].check.id]}
          active={qIx}
          onJump={go}
        />
        <PartFooter
          run={run}
          ids={ids}
          qIx={qIx}
          go={go}
          total={questions.length}
          answeredCount={answeredCount}
        />
      </div>
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
