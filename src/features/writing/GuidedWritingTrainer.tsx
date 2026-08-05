import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Target,
  Loader2,
  Lightbulb,
  Clock,
  Info,
  Shuffle,
  Maximize2,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import type { ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import {
  blockingAxis,
  countTasks,
  eligibleTasks,
  levelBand,
  normalizeLevelScope,
  randomTask,
  taskAt,
  type ScopeAxis,
  type WritingTaskRef,
} from "@/lib/writingScope";
import { SECTOR_OPTIONS } from "@/lib/facets";
import {
  lifeAreaLabel,
  matchesLifeArea,
  normalizeLifeArea,
  type LifeAreaId,
} from "@/lib/lifeAreas";
import { practiceAreaById, practiceRoute } from "@/data/practiceAreas";
import { evaluateWriting, type WritingEvalResult, type WritingLength } from "@/lib/writing";
import { WritingRail, WRITING_FORMATS, WRITING_LEVELS, writingFormatLabel } from "./WritingRail";
import { loadAutosavedDraft, saveAutosavedDraft } from "./draftAutosave";
import type { WritingMode } from "./resumeDraft";
import { useLiveWork } from "@/lib/liveWork";
import { UmlautKeys } from "./UmlautKeys";
import { AllowanceNote } from "./AllowanceNote";
import { FeedbackLangChip } from "./FeedbackLang";
import { useDailyAllowance } from "@/lib/aiAllowance";
import { floatingNote, floatingSlot } from "./floatingCluster";
import { useFillEditor } from "./useFillEditor";
import {
  CorrectionToggle,
  FixTiles,
  MarkedParagraphs,
  MAX_FIX_TILES,
  useCorrectionDiff,
  type CorrectionViewMode,
} from "./correction";
import { EmptyState } from "@/components/shared/misc";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackIconButton } from "@/components/layout/FeedbackButton";
import { cn } from "@/lib/utils";

/**
 * Guided writing task (Kurz / Lang), Bibliothek-extension redesign (s148). The
 * learner lands STRAIGHT on an Aufgabe + writing field; the topic is switched
 * in the "Aufgabe wählen" rail (desktop right column) or the toolbar button +
 * collapsible panel (mobile), both in the FilterRail language. Each theme
 * carries a POOL of prompts: picking a theme draws a random one, the shuffle
 * button on the Aufgabe card re-rolls within the theme, and the expand button
 * beside it opens the whole task in the app's standard dialog (the card itself
 * is capped to fit the viewport). Mode supplies `length` (Kurz = short, Lang =
 * long); auth is gated by the parent via `onRequireAuth`.
 */

const rangeByLength: Record<WritingLength, [number, number]> = {
  short: [40, 60],
  long: [120, 150],
};

/**
 * The Ziel range a task's own word target implies. Rounded UP to a full ten,
 * because a target is an orientation, not a measurement: `150 x 1.25` printed
 * "Ziel 150–188 Wörter" on the card, which reads like a computed number the
 * learner is supposed to hit exactly.
 */
function targetRange(words: number): [number, number] {
  return [words, Math.ceil((words * 1.25) / 10) * 10];
}

/**
 * Desktop resting height of the writing field, `max(min, share x viewport)`
 * (founder s168 follow-up: filling a whole desktop window "looks odd"). Kurz is
 * deliberately shorter than Lang, in proportion to what each one asks for, and
 * neither ever reaches the bottom of the window. Mobile keeps the full fill.
 */
const desktopFieldCap: Record<WritingLength, { min: number; share: number }> = {
  short: { min: 176, share: 0.22 },
  long: { min: 252, share: 0.32 },
};

/**
 * The two Aufgabe-card icon buttons (founder s169 follow-up): 40px, no box.
 * A border around them competed with the card's own edge; the hover tint is
 * enough of an affordance, and it matches the rail header icons.
 */
const iconButton =
  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground";

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function isThemeId(v: string | null): v is ThemeId {
  return !!v && themes.some((t) => t.id === v);
}

/**
 * Why this scope has no Aufgabe, in the learner's words. The Kurz/Lang case is
 * worth naming exactly: a Textsorte that exists at the OTHER length is not
 * missing, it is somewhere else, and saying so is more useful than "nothing
 * here".
 */
function emptyReason({
  blocking,
  format,
  level,
  lifeArea,
  themeScope,
  sub,
  sector,
  length,
}: {
  blocking: ScopeAxis | null;
  format: string;
  level: string;
  lifeArea: LifeAreaId | "";
  themeScope: ThemeId | "";
  sub: string;
  sector: string;
  length: WritingLength;
}): string {
  if (blocking === "format") {
    const elsewhere = countTasks({
      area: lifeArea,
      theme: themeScope,
      sub,
      sector,
      level,
      format,
      length: length === "short" ? "long" : "short",
    });
    if (elsewhere > 0)
      return `${writingFormatLabel(format)} gibt es nur bei ${length === "short" ? "Lang" : "Kurz"}.`;
    return `Zu ${writingFormatLabel(format)} gibt es hier keine Aufgabe.`;
  }
  if (blocking === "level") return `Auf Niveau ${level} gibt es hier keine Aufgabe.`;
  if (blocking === "sub") return "Zu diesem Unterthema gibt es hier keine Aufgabe.";
  // Only reachable from a deep link that pairs an area with a Thema from the
  // other one; the rail itself clears the Thema when the pill changes.
  if (blocking === "area")
    return `Dieses Thema gehört nicht zu ${lifeAreaLabel(lifeArea || "professional")}.`;
  return "Diese Filter passen zu keiner Aufgabe.";
}

export function GuidedWritingTrainer({
  length,
  isSignedIn,
  onRequireAuth,
  initialText = "",
  initialTheme,
  initialPromptIndex,
}: {
  length: WritingLength;
  isSignedIn: boolean;
  onRequireAuth: (payload: {
    theme: ThemeId;
    length: WritingLength;
    text: string;
    promptIndex?: number;
  }) => void;
  initialText?: string;
  /**
   * Theme of the Aufgabe a resumed draft was written against. A PROP, not the
   * `?theme=` param the hub used to write: pinning the URL scope to the drawn
   * task silently narrowed a learner who had been on "Alle Themen" to one Thema
   * they never picked, and the param change also fired the scope-change effect,
   * which clears the very draft that is being restored.
   */
  initialTheme?: ThemeId;
  /** Restores the exact Aufgabe a resumed draft was written against. */
  initialPromptIndex?: number;
}) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const themeParam = params.get("theme");
  // "" = Alle Themen (founder s167). A drawn task therefore carries its own
  // theme, which is what the eyebrow, the evaluation and the draft record use.
  const themeScope: ThemeId | "" = isThemeId(themeParam) ? themeParam : "";

  // Unterthema + Branche scopes (s149 harmonization: the Bibliothek hierarchy
  // in the Aufgabe rail). Invalid values are ignored, never crash a deep link.
  const subParam = params.get("sub") ?? "";
  const sub = themeById(themeScope)?.subThemes?.some((s) => s.id === subParam) ? subParam : "";
  const sectorParam = params.get("sector") ?? "";
  const sector = SECTOR_OPTIONS.some((o) => o.value === sectorParam) ? sectorParam : "";
  // A band, and older links carrying "B2.1" normalize into it (writingScope).
  const levelParam = normalizeLevelScope(params.get("level") ?? "");
  const level = WRITING_LEVELS.some((l) => l.value === levelParam) ? levelParam : "";
  const formatParam = params.get("format") ?? "";
  const format = WRITING_FORMATS.includes(formatParam) ? formatParam : "";
  // Lebensbereich pills (s184), same `?area=` param the Bibliothek rails use.
  const lifeArea = normalizeLifeArea(params.get("area"));

  // ONE selection rule, shared with the rail's option counts (`lib/writingScope`).
  const eligible = useMemo(
    () => eligibleTasks({ area: lifeArea, theme: themeScope, sub, sector, level, format, length }),
    [lifeArea, themeScope, length, sub, sector, level, format],
  );

  // Autosave restore (s172): a draft left behind by ANY reload (a deploy, a
  // crash self-heal, iOS discarding the tab, a manual refresh) comes back with
  // the Aufgabe it was written against. The sign-in hand-off wins when both
  // exist, since that one is an explicit, just-now action.
  const mode: WritingMode = length === "long" ? "lang" : "kurz";
  // Today's allowance for THIS mode (Kurz 4 / Lang 2), counted separately so a
  // day of Kurz cannot eat the Lang budget. Follows what `evaluate-writing`
  // reports; a cached resubmission is free and leaves the number alone.
  const allowance = useDailyAllowance(mode);
  // The Tipp in English (founder 2026-07-31). Sticky, not hold-to-peek: it is a
  // paragraph of instruction, not a one-line gloss. Resets to German with every
  // new evaluation, so German stays the default the learner meets first.
  const [tipEnglish, setTipEnglish] = useState(false);
  const [saved] = useState(() => (initialText ? null : loadAutosavedDraft(mode)));

  // Null = this scope has no Aufgabe at all (see `eligibleTasks`); the trainer
  // says so instead of drawing something the learner did not ask for. A resumed
  // draft always wins over the scope: the learner's own text outranks a filter.
  const [drawn, setDrawn] = useState<WritingTaskRef | null>(() => {
    const resumeTheme = initialTheme ?? (themeScope || undefined);
    if (resumeTheme && initialPromptIndex != null && initialPromptIndex >= 0)
      return { theme: resumeTheme, ix: initialPromptIndex };
    if (saved?.theme && saved.promptIndex != null && saved.promptIndex >= 0)
      return { theme: saved.theme, ix: saved.promptIndex };
    return randomTask(eligible);
  });
  const [text, setText] = useState(initialText || saved?.text || "");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingEvalResult | null>(null);
  /**
   * The exact text the result was computed against, so the correction diff can
   * never be drawn against something the learner changed afterwards.
   */
  const [submitted, setSubmitted] = useState("");
  /** Correction view, Fokus's default: Korrigiert first, Original one tap away. */
  const [view, setView] = useState<CorrectionViewMode>("corr");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [rollSpin, setRollSpin] = useState(0);
  // The Aufgabe pop-up: the card can be capped to fit the viewport, so the full
  // task (prompt, Adressat, every Leitpunkt) needs a place that never is.
  const [taskOpen, setTaskOpen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  // Geometry refs for `useFillEditor`: the field fills the gap between the
  // Aufgabe card and whichever bottom chrome is laid out at this breakpoint.
  const rootRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const taskCardRef = useRef<HTMLDivElement>(null);
  const taskBodyRef = useRef<HTMLDivElement>(null);
  const editorCardRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const noteRef = useRef<HTMLDivElement>(null);

  const words = useMemo(() => countWords(text), [text]);

  // Persist the draft while it is being written, and hold a live-work claim so
  // the deploy-adoption reload waits until the learner is done (lib/liveWork).
  const persist = () => {
    if (!drawn) return;
    saveAutosavedDraft({ mode, text, theme: drawn.theme, length, promptIndex: drawn.ix });
  };
  useLiveWork(text.trim().length > 0, `writing:${mode}`, persist);
  useEffect(() => {
    if (!drawn) return;
    // Debounced: writing is keystroke-heavy and localStorage writes are sync.
    const t = window.setTimeout(
      () => saveAutosavedDraft({ mode, text, theme: drawn.theme, length, promptIndex: drawn.ix }),
      500,
    );
    return () => window.clearTimeout(t);
  }, [mode, text, length, drawn]);

  // Reset draft + result and draw a fresh random Aufgabe when the task scope
  // (theme, length, Unterthema or Branche) changes, but NOT on mount (so a
  // resumed draft survives). keyRef is seeded with the initial scope.
  const keyRef = useRef(`${lifeArea}|${themeScope}|${length}|${sub}|${sector}|${level}|${format}`);
  useEffect(() => {
    const key = `${lifeArea}|${themeScope}|${length}|${sub}|${sector}|${level}|${format}`;
    if (keyRef.current !== key) {
      keyRef.current = key;
      setText("");
      setResult(null);
      // Exclude the CURRENT task from the re-roll (founder rule: controls
      // always visibly act). Most scope changes redraw from a pool the filter
      // did not actually narrow (only 71 of 600 theme x Länge x Branche slots
      // carry a dedicated task today), so without this a re-roll lands back on
      // the same Aufgabe roughly one time in twelve and the filter reads as
      // broken.
      setDrawn((cur) => randomTask(eligible, cur));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lifeArea, themeScope, length, sub, sector, level, format]);

  /**
   * Scope changes REPLACE the history entry (the ViewSwitcher rule). Pushing
   * one per dropdown turned the phone's back gesture into "undo my last five
   * filter taps" instead of "leave Schreiben".
   */
  const setScope = (mutate: (p: URLSearchParams) => void) => {
    const p = new URLSearchParams(params);
    mutate(p);
    setParams(p, { replace: true });
  };
  const setTheme = (id: ThemeId | "") =>
    setScope((p) => {
      if (id) p.set("theme", id);
      else p.delete("theme");
      // A sub-theme belongs to its theme; Branche is a cross-theme context axis
      // and travels (the Bibliothek rule).
      p.delete("sub");
    });
  const setSub = (s: string) =>
    setScope((p) => (s ? p.set("sub", s) : p.delete("sub")));
  const setSector = (s: string) =>
    setScope((p) => (s ? p.set("sector", s) : p.delete("sector")));
  const setLevel = (l: string) =>
    setScope((p) => (l ? p.set("level", l) : p.delete("level")));
  const setFormat = (f: string) =>
    setScope((p) => (f ? p.set("format", f) : p.delete("format")));
  // Picking a Lebensbereich drops a Thema from the other area (and its
  // Unterthema), the same rule the Bibliothek rails follow, so the pill and the
  // Aufgabe can never contradict each other.
  const setLifeArea = (next: LifeAreaId | "") =>
    setScope((p) => {
      if (next) p.set("area", next);
      else p.delete("area");
      if (next && themeScope && !matchesLifeArea(themeScope, next)) {
        p.delete("theme");
        p.delete("sub");
      }
    });

  // The dice: another random Aufgabe within the current scope. Clears the field
  // with it (founder 2026-07-31: "the text I initially wrote is still in the
  // field, ideally it should be gone"), which reverses the older "keep the text,
  // a mis-tap must not destroy work" rule: a new Aufgabe means a new text, and
  // leaving the old one there means writing the next answer around it. The
  // scope-change redraw above has always cleared, so the two paths now agree.
  const reroll = () => {
    setDrawn((cur) => randomTask(eligible, cur));
    setText("");
    setResult(null);
    setRollSpin((d) => d + 180);
  };

  // Rail reset (always active, founder s149 P2): clears every scope AND draws
  // a fresh random task. When the scopes are already default the URL doesn't
  // change, so the scope-change effect won't fire; roll explicitly here.
  const resetScope = () => {
    setScope((p) => {
      p.delete("theme");
      p.delete("sub");
      p.delete("sector");
      p.delete("level");
      p.delete("format");
      p.delete("area");
    });
    const fullPool = eligibleTasks({
      area: "",
      theme: "",
      sub: "",
      sector: "",
      level: "",
      format: "",
      length,
    });
    setDrawn((cur) => randomTask(fullPool, cur));
    setText("");
    setResult(null);
    setRollSpin((d) => d + 180);
  };

  /**
   * The one-tap way out of a scope with no Aufgabe (Kurz + Forumsbeitrag, a
   * stale deep link). `blockingAxis` names the single filter that is causing it,
   * so the escape drops THAT one and keeps everything else the learner chose.
   */
  const blocking = drawn
    ? null
    : blockingAxis({ area: lifeArea, theme: themeScope, sub, sector, level, format, length });
  const relax = () => {
    if (!blocking) {
      resetScope();
      return;
    }
    setScope((p) => p.delete(blocking));
  };

  const submit = async () => {
    if (!drawn) return;
    const body = text.trim();
    setSubmitting(true);
    setResult(null);
    setSubmitted(body);
    setTipEnglish(false);
    // Each new evaluation opens on Korrigiert, like Fokus.
    setView("corr");
    // Send the AUFGABE, not just the text (s167 P2): without it the evaluator
    // grades language in a vacuum and Aufgabenerfüllung is uncheckable.
    const res = await evaluateWriting({
      theme: drawn.theme,
      length,
      text: body,
      taskId: task?.id,
      task: task?.text,
      points: task?.points,
      level: task?.level,
      format: task?.format,
      addressee: task?.addressee,
      register: task?.register,
      words: task?.words,
    });
    setResult(res);
    setSubmitting(false);
  };

  const handleEvaluate = () => {
    if (!drawn) return;
    if (!isSignedIn) {
      onRequireAuth({ theme: drawn.theme, length, text, promptIndex: drawn.ix });
      return;
    }
    void submit();
  };

  // The eyebrow names the DRAWN task's theme, which under "Alle Themen" is the
  // only place the learner learns what they are writing about.
  const t = drawn ? themeById(drawn.theme) : undefined;
  const task = drawn ? taskAt(drawn, length) : undefined;
  const prompt = task?.text ?? "";
  // Word target: per task where the Aufgabe declares one (real exam targets run
  // 40 to 200 and do NOT share one number), else the mode default (s167).
  const [min, max] = task?.words ? targetRange(task.words) : rangeByLength[length];
  /**
   * The card's meta line: Niveau · Textsorte · Ziel. The Niveau is on it since
   * the Textsorte fix (2026-07-31), because under "Alle Niveaus" nothing else on
   * screen said whether the Aufgabe in front of the learner is a B1 or a C1 one.
   */
  const taskMeta = [
    task?.level ? WRITING_LEVELS.find((l) => l.value === levelBand(task.level))?.label : null,
    task?.format ? writingFormatLabel(task.format) : null,
    `Ziel ${min}–${max} Wörter`,
  ]
    .filter(Boolean)
    .join(" · ");
  const enough = words >= Math.floor(min * 0.6);
  const minWords = 5;
  const remaining = Math.max(0, minWords - words);
  const tooShort = words < minWords;

  const area = result?.practiceArea ? practiceAreaById(result.practiceArea) : undefined;

  /**
   * The correction, shown IN the editor card the moment the result lands
   * (founder pick A, s172), exactly the way Fokus shows a corrected sentence:
   * the field the learner just typed in becomes the corrected text with the
   * Original/Korrigiert toggle, and the fix tiles name every edit. Before this it
   * only existed in Verlauf, so the one moment the learner is actually reading
   * feedback was the one place the correction was missing.
   *
   * `corrected` is null for an error-free text, for the templated spelling
   * verdict (no model call) and for a failed evaluation; those keep the plain
   * editor exactly as before, so the learner can fix and resubmit.
   */
  const corrected = result?.ok ? result.corrected?.trim() : undefined;
  const correction = useCorrectionDiff(submitted, corrected ?? "");
  const showCorrection = !!corrected && !!result && correction.changes.length > 0;

  /** Back to a blank field for the same Aufgabe (mobile cluster + tile row). */
  const startOver = () => {
    setResult(null);
    setText("");
  };

  // The field owns the rest of the viewport (founder s168). Once a result is on
  // screen it drops back to its text's own height so the feedback is not pushed
  // a full screen down.
  useFillEditor({
    editorRef,
    cardRef: editorCardRef,
    rootRef,
    aboveRef: taskCardRef,
    taskBodyRef,
    headerRef: pickerRef,
    clusterRef,
    noteRef,
    desktopCap: desktopFieldCap[length],
    fill: !result,
    revision: `${text}|${length}|${drawn?.theme}|${drawn?.ix}|${tooShort}|${pickerOpen}|${submitting}|${taskOpen}|${showCorrection}|${view}`,
  });

  // The Aufgabe's Adressat + Leitpunkte, shared by the card (capped, animated)
  // and the pop-up (never capped). Only tasks on the s167 schema carry them.
  const taskPoints = task?.points?.length ? (
    <>
      {task.addressee && (
        <p className="text-xs text-muted-foreground">
          <span className="font-semibold text-accent-ink">An:</span> {task.addressee}
          {task.register === "sie" ? " (Sie)" : task.register === "du" ? " (du)" : ""}
        </p>
      )}
      <ul className="space-y-1">
        {task.points.map((point) => (
          <li key={point} className="flex gap-2 text-sm leading-relaxed">
            <span aria-hidden className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-accent-ink" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </>
  ) : null;

  // The pop-up behind the card's expand button: the app's standard centered
  // dialog (soft darkening, no blur, no bottom sheet), carrying the same
  // Aufgabe the card shows, at full length and scrolling on its own.
  const taskDialog = (
    <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
      <DialogContent className="gap-3">
        <DialogHeader>
          {/* Same eyebrow as the card, so the pop-up reads as the same object. */}
          <DialogTitle className="pr-8 text-xs font-bold uppercase tracking-wide text-primary">
            Aufgabe: {t?.titleDe}
          </DialogTitle>
          <DialogDescription className="text-xs">{taskMeta}</DialogDescription>
        </DialogHeader>
        <p className="text-sm leading-relaxed">{prompt}</p>
        {taskPoints && <div className="space-y-1.5">{taskPoints}</div>}
      </DialogContent>
    </Dialog>
  );

  const evaluateButton = (
    <Button onClick={handleEvaluate} disabled={submitting || tooShort} variant="gradient">
      {submitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Wird geprüft …
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" /> Auswerten
        </>
      )}
    </Button>
  );

  // EU AI Act Art. 50 transparency note. Desktop: a fixed line at the bottom of the
  // viewport, level with the floating "Feedback" pill (no bordered bar), mirroring
  // the pill's `lg:pl-64` + `max-w-6xl` + `sm:px-6` offsets and clearing it on the
  // right; pointer-events pass through except the link. Mirrors Fokus (founder s160).
  const aiNoteDesktop = (
    <div
      ref={noteRef}
      className="pointer-events-none fixed inset-x-0 bottom-4 z-20 hidden lg:block lg:pl-64"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <p className="max-w-[calc(100%-18rem)] text-center text-xs leading-relaxed text-muted-foreground">
          <Info className="mr-1 inline-block h-3.5 w-3.5 -translate-y-px align-middle" />
          Dein Text wird zur Auswertung an eine KI (Anthropic, Google oder OpenAI) gesendet. Die
          Rückmeldung ist KI-generiert und kann Fehler enthalten.{" "}
          <Link
            to="/privacy"
            className="pointer-events-auto font-medium text-primary underline-offset-2 hover:underline"
          >
            Mehr im Datenschutz
          </Link>
          .
        </p>
      </div>
    </div>
  );

  /**
   * No Aufgabe for this scope. Reachable only where greying cannot help: a
   * Kurz/Lang switch carrying a length-specific Textsorte, or a stale deep link.
   * An honest dead end with a one-tap escape, never a task that contradicts the
   * selection (which is what the old fallback served).
   */
  const emptyScope = (
    <EmptyState
      icon={Target}
      title="Keine Aufgabe für diese Auswahl"
      description={emptyReason({ blocking, format, level, lifeArea, themeScope, sub, sector, length })}
      action={
        <Button onClick={relax} variant="gradient">
          <RotateCcw className="h-4 w-4" />
          {blocking === "format"
            ? "Textsorte zurücksetzen"
            : blocking === "level"
              ? "Niveau zurücksetzen"
              : blocking === "sub"
                ? "Unterthema zurücksetzen"
                : blocking === "area"
                  ? "Lebensbereich zurücksetzen"
                  : "Auswahl zurücksetzen"}
        </Button>
      }
    />
  );

  const content = !drawn || !t ? (
    emptyScope
  ) : (
    <div className="space-y-4">
      {/* Aufgabe: eyebrow names the topic, dice draws another random task. */}
      <Card ref={taskCardRef}>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Highlighted task eyebrow (founder s149): brand color + bold. */}
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Aufgabe: {t.titleDe}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{taskMeta}</p>
            </div>
            {/* Two borderless 40px icon buttons (founder s169 follow-up: no box
                around these). Shuffle left, expand right (founder order): the
                one that CHANGES the Aufgabe sits away from the card's outer
                corner, the one that only opens it takes the corner. */}
            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={reroll}
                aria-label="Neue Aufgabe"
                title="Neue Aufgabe"
                className={iconButton}
              >
                {/* Shuffle instead of the dice (founder s169 follow-up). The
                    icon is point-symmetric, so the half-turn per roll reads as
                    motion and settles back into the same shape. */}
                <Shuffle
                  className="h-4 w-4 transition-transform duration-300"
                  style={reduce ? undefined : { transform: `rotate(${rollSpin}deg)` }}
                />
              </button>
              <button
                type="button"
                onClick={() => setTaskOpen(true)}
                aria-label="Aufgabe vergrößern"
                title="Aufgabe vergrößern"
                className={iconButton}
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          {/* The prompt + Inhaltspunkte region is the part `useFillEditor` caps
              (internal scroll) when a long Aufgabe would otherwise push the
              writing field below its floor; the eyebrow + dice row above never
              scrolls away. */}
          <div ref={taskBodyRef} className="slim-scrollbar space-y-3">
            <motion.p
              key={`${drawn.theme}|${length}|${drawn.ix}`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="text-sm leading-relaxed"
            >
              {prompt}
            </motion.p>
            {/* Inhaltspunkte: what an examiner actually grades (Goethe
                "Erfüllung", telc "Berücksichtigung der Leitpunkte"), so they are
                part of the Aufgabe, not decoration. Only tasks upgraded to the
                s167 schema carry them; the rest render as before. */}
            {taskPoints ? (
              <motion.div
                key={`points|${drawn.theme}|${length}|${drawn.ix}`}
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="space-y-1.5"
              >
                {taskPoints}
              </motion.div>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {/* Editor, and after an evaluation the CORRECTION in its place (founder
          pick A, s172): the same card, the same spot on screen, the Fokus
          language. The plain field returns for anything without a correction (an
          error-free text, the templated spelling verdict, a failed call), so
          fixing and resubmitting still works. */}
      <Card ref={editorCardRef}>
        <CardContent className="space-y-3 p-5">
          {showCorrection ? (
            <>
              {/* Card-title eyebrow = bold brand blue, sharing its row with the
                  view toggle: Fokus's "Dein Satz" header, one word apart. */}
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">Dein Text</p>
                <CorrectionToggle view={view} onChange={setView} />
              </div>
              <MarkedParagraphs paragraphs={correction.paragraphs} view={view} />
              <div className="h-px bg-border" />
              {/* Himmelblau fix tiles, capped so a long text cannot wall off the
                  card. "Neu schreiben" rides the tile row on desktop, the Fokus
                  "Neuer Satz" spot; on mobile it is in the floating cluster
                  already, whose geometry is locked. */}
              <FixTiles
                changes={correction.changes}
                max={MAX_FIX_TILES}
                action={
                  <div className="ml-auto hidden self-end lg:block">
                    <Button variant="outline" onClick={startOver} className="h-9 rounded-xl">
                      <RotateCcw className="h-3.5 w-3.5" /> Neu schreiben
                    </Button>
                  </div>
                }
              />
            </>
          ) : (
            <>
              {/* `useFillEditor` owns the height (fill the viewport, then grow, then
                  scroll internally), so the field is not hand-resizable any more and
                  `rows` is only the pre-measurement fallback. */}
              <textarea
                ref={editorRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={submitting}
                rows={length === "long" ? 10 : 6}
                placeholder="Schreibe hier deinen Text auf Deutsch …"
                className="block w-full resize-none rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none"
              />
              <div className="flex flex-wrap items-center gap-2">
                {/* German special-character keys for non-German keyboards (s150). */}
                <UmlautKeys textareaRef={editorRef} value={text} onChange={setText} />
                {/* The Ziel range lives on the Aufgabe card only (founder s149). */}
                <span className={cn("ml-auto text-xs tabular-nums", enough ? "text-success" : "text-muted-foreground")}>
                  {words} {words === 1 ? "Wort" : "Wörter"}
                </span>
                {/* Desktop actions; on mobile they live in the sticky bottom bar. */}
                <div className="hidden gap-2 lg:flex">
                  {result && (
                    <Button variant="ghost" onClick={startOver} disabled={submitting}>
                      Neu schreiben
                    </Button>
                  )}
                  {evaluateButton}
                </div>
              </div>
              {/* The "why can't I press Auswerten yet" line lives in the card the
                  learner is typing in, right under the umlaut keys (founder s169).
                  It used to ride the mobile action cluster's caption slot, which
                  cost that slot its permanent Art. 50 note; the cluster now sits
                  2.5rem higher (matching Fokus) so a card-tail line cannot land
                  under it any more. */}
              {/* One line, two facts: why Auswerten is not ready yet (left,
                  transient) and what the day still holds (right, standing,
                  founder 2026-07-31). */}
              {tooShort || allowance.known ? (
                <div className="flex items-start justify-between gap-2">
                  {tooShort ? (
                    <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
                      Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst
                      du auswerten.
                    </p>
                  ) : (
                    <span />
                  )}
                  {allowance.known && (
                    <AllowanceNote
                      remaining={allowance.remaining}
                      limit={allowance.limit}
                      what="Auswertungen"
                      className="shrink-0"
                    />
                  )}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* EU AI Act Art. 50 note lives at the page bottom now (desktop: fixed line
          level with the floating Feedback pill; mobile: condensed under the action
          buttons), matching Fokus (founder s160). */}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {result.ok ? (
            <Card className="overflow-hidden border-primary/30">
              <div className="h-1.5 w-full bg-accent-gradient" />
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2 font-semibold">
                    <Lightbulb className="h-5 w-5 text-primary" /> Dein wichtigster Tipp
                  </p>
                  <div className="flex gap-1.5">
                    {result.cached && <Badge variant="muted">aus dem Cache</Badge>}
                    {area && <Badge className="bg-primary/10 text-primary">{area.labelDe}</Badge>}
                  </div>
                </div>
                <p className="text-sm leading-relaxed">
                  {tipEnglish && result.insightEn ? result.insightEn : result.insight}
                  {result.insightEn && (
                    <FeedbackLangChip
                      showEnglish={tipEnglish}
                      onChange={setTipEnglish}
                      className="ml-1.5 align-middle"
                    />
                  )}
                </p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 shrink-0" /> KI-generierte Rückmeldung
                </p>
                {area && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">{area.description}</p>
                    <Button className="ml-auto" onClick={() => navigate(practiceRoute(area, { theme: drawn.theme }))}>
                      <Target className="h-4 w-4" /> {area.labelDe} üben
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-warning/30">
              <CardContent className="flex items-start gap-3 p-5">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
                <div>
                  <p className="font-semibold">
                    {result.limitReached ? "Tageslimit erreicht" : "Gerade nicht verfügbar"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {result.message ??
                      "Du hast deine kostenlosen Auswertungen für heute genutzt. Komm morgen wieder!"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );

  return (
    <div ref={rootRef}>
      {/* Mobile: the Bibliothek pattern, a toolbar button toggling the
          collapsible "Aufgabe wählen" panel (no floating chip row). */}
      <div ref={pickerRef} className="mb-4 space-y-3 lg:hidden">
        <div className="flex justify-center">
          <Button
            /* Closed = the Himmelblau tile of the rail it opens (founder s166,
               the `outline` fill was too faint against the page ground). */
            variant={pickerOpen ? "default" : "accent"}
            aria-expanded={pickerOpen}
            aria-pressed={pickerOpen}
            className="h-10 rounded-lg font-semibold"
            onClick={() => setPickerOpen((o) => !o)}
          >
            <Target className="h-4 w-4" />
            Aufgabe wählen
            <ChevronDown className={cn("h-4 w-4 transition-transform", pickerOpen && "rotate-180")} />
          </Button>
        </div>
        <AnimatePresence initial={false}>
          {pickerOpen && (
            <motion.div
              key="aufgabe-panel"
              // Fade/slide, NOT a height collapse: a height animation needs
              // overflow-hidden, which would clip the Thema dropdown's popover.
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
            >
              <WritingRail
                layout="panel"
                value={themeScope}
                level={level}
                onLevelChange={setLevel}
                format={format}
                onFormatChange={setFormat}
                // The panel stays open until the learner closes it (founder
                // s167): picking a Thema used to close it while every other
                // scope left it open, so the one control that auto-dismissed
                // was also the one that changed the most. Closing is now only
                // the X or the toolbar toggle.
                onChange={setTheme}
                sub={sub}
                onSubChange={setSub}
                sector={sector}
                onSectorChange={setSector}
                lifeArea={lifeArea}
                onLifeAreaChange={setLifeArea}
                length={length}
                onReset={resetScope}
                onClose={() => setPickerOpen(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Desktop: content + sticky "Aufgabe wählen" rail (Bibliothek 16rem grid). */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8">
        {content}
        <WritingRail
          value={themeScope}
          onChange={setTheme}
          level={level}
          onLevelChange={setLevel}
          format={format}
          onFormatChange={setFormat}
          sub={sub}
          onSubChange={setSub}
          sector={sector}
          onSectorChange={setSector}
          lifeArea={lifeArea}
          onLifeAreaChange={setLifeArea}
          length={length}
          onReset={resetScope}
          className="hidden lg:block lg:sticky lg:top-24"
        />
      </div>

      {taskDialog}

      {/* Both bits of bottom chrome are `position: fixed`, so they are portalled
          to <body>: WritingHub slides the tab panels with an `x` transform, and
          a transformed ancestor becomes the containing block for its fixed
          descendants, which would re-anchor them to the panel mid-slide and make
          `useFillEditor` measure the wrong reserve on mount. */}
      {createPortal(
        <>
          {/* Mobile: Feedback + Auswerten (and Neu schreiben after a result)
              float side by side above the nav, no bar chrome (founder s160).

              FIXED, not sticky (founder s168): sticky parks the cluster at the
              end of the content whenever the page fits the viewport, so it sat
              at a different height in Kurz than in Lang and jumped on every task
              change. Fixed pins it above the nav at one height for good; the
              trainer root carries the matching clearance (`useFillEditor`), and
              the container offsets mirror AppShell's `<main>` so the cluster
              stays in the content column.

              ONE geometry across the three trainers (founder s169): the same
              2.5rem lift and the same permanently locked KI line beneath as
              Fokus, so switching Fokus <-> Kurz <-> Lang no longer moves the
              buttons. Anything mode-specific in this row would show up as a
              jump on every tab switch. */}
          <div
            ref={clusterRef}
            className="fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom)_+_2rem)] z-30 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:hidden"
          >
            {/* Every control sits on its own opaque backing (see
                `floatingCluster`); FeedbackIconButton is already solid. */}
            <div className="flex items-stretch gap-2">
              <FeedbackIconButton />
              {/* Nothing to evaluate while the scope has no Aufgabe: the cluster
                  keeps its geometry, the button that would only be disabled is
                  not printed. */}
              {drawn && result && (
                <div className={floatingSlot}>
                  <Button
                    variant="outline"
                    className="h-11 rounded-xl"
                    onClick={startOver}
                    disabled={submitting}
                  >
                    Neu schreiben
                  </Button>
                </div>
              )}
              {drawn && (
                <div className={cn(floatingSlot, "flex-1 [&>button]:h-11 [&>button]:w-full [&>button]:rounded-xl [&>button]:text-base")}>
                  {evaluateButton}
                </div>
              )}
            </div>
          </div>
          {/* The KI line is locked just above the nav in EVERY state, exactly
              like Fokus: the "how many words to go" hint moved into the editor
              card (founder s169), so this slot carries the Art. 50 note alone
              and never swaps content under the learner. */}
          <p className="fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom)_+_0.5rem)] z-20 text-center text-[11px] leading-snug text-muted-foreground lg:hidden">
            <span className={floatingNote}>
              KI-geprüft, kann Fehler enthalten.{" "}
              <Link to="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                Mehr
              </Link>
            </span>
          </p>
          {aiNoteDesktop}
        </>,
        document.body,
      )}
    </div>
  );
}
