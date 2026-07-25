import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Target, Loader2, Lightbulb, Clock, Info, Dices, ChevronDown } from "lucide-react";
import type { ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import {
  eligibleTasks,
  randomTask,
  taskAt,
  type WritingTaskRef,
} from "@/lib/writingScope";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { practiceAreaById, practiceRoute } from "@/data/practiceAreas";
import { evaluateWriting, type WritingEvalResult, type WritingLength } from "@/lib/writing";
import { WritingRail, WRITING_FORMATS, WRITING_LEVELS, writingFormatLabel } from "./WritingRail";
import { UmlautKeys } from "./UmlautKeys";
import { floatingNote, floatingSlot } from "./floatingCluster";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeedbackIconButton } from "@/components/layout/FeedbackButton";
import { cn } from "@/lib/utils";

/**
 * Guided writing task (Kurz / Lang), Bibliothek-extension redesign (s148). The
 * learner lands STRAIGHT on an Aufgabe + writing field; the topic is switched
 * in the "Aufgabe wählen" rail (desktop right column) or the toolbar button +
 * collapsible panel (mobile), both in the FilterRail language. Each theme
 * carries a POOL of prompts: picking a theme draws a random one, the dice on
 * the Aufgabe card re-rolls within the theme. Mode supplies `length` (Kurz =
 * short, Lang = long); auth is gated by the parent via `onRequireAuth`.
 */

const rangeByLength: Record<WritingLength, [number, number]> = {
  short: [40, 60],
  long: [120, 150],
};

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function isThemeId(v: string | null): v is ThemeId {
  return !!v && themes.some((t) => t.id === v);
}

export function GuidedWritingTrainer({
  length,
  isSignedIn,
  onRequireAuth,
  initialText = "",
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
  const levelParam = params.get("level") ?? "";
  const level = WRITING_LEVELS.some((l) => l.value === levelParam) ? levelParam : "";
  const formatParam = params.get("format") ?? "";
  const format = WRITING_FORMATS.includes(formatParam) ? formatParam : "";

  // ONE selection rule, shared with the rail's option counts (`lib/writingScope`).
  const eligible = useMemo(
    () => eligibleTasks({ theme: themeScope, sub, sector, level, format, length }),
    [themeScope, length, sub, sector, level, format],
  );

  const [drawn, setDrawn] = useState<WritingTaskRef>(() =>
    themeScope && initialPromptIndex != null && initialPromptIndex >= 0
      ? { theme: themeScope, ix: initialPromptIndex }
      : randomTask(eligible),
  );
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingEvalResult | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [diceSpin, setDiceSpin] = useState(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  const words = useMemo(() => countWords(text), [text]);

  // Reset draft + result and draw a fresh random Aufgabe when the task scope
  // (theme, length, Unterthema or Branche) changes, but NOT on mount (so a
  // resumed draft survives). keyRef is seeded with the initial scope.
  const keyRef = useRef(`${themeScope}|${length}|${sub}|${sector}|${level}|${format}`);
  useEffect(() => {
    const key = `${themeScope}|${length}|${sub}|${sector}|${level}|${format}`;
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
  }, [themeScope, length, sub, sector, level, format]);

  const setTheme = (id: ThemeId | "") => {
    const p = new URLSearchParams(params);
    if (id) p.set("theme", id);
    else p.delete("theme");
    // A sub-theme belongs to its theme; Branche is a cross-theme context axis
    // and travels (the Bibliothek rule).
    p.delete("sub");
    setParams(p);
  };
  const setSub = (s: string) => {
    const p = new URLSearchParams(params);
    if (s) p.set("sub", s);
    else p.delete("sub");
    setParams(p);
  };
  const setSector = (s: string) => {
    const p = new URLSearchParams(params);
    if (s) p.set("sector", s);
    else p.delete("sector");
    setParams(p);
  };
  const setLevel = (l: string) => {
    const p = new URLSearchParams(params);
    if (l) p.set("level", l);
    else p.delete("level");
    setParams(p);
  };
  const setFormat = (f: string) => {
    const p = new URLSearchParams(params);
    if (f) p.set("format", f);
    else p.delete("format");
    setParams(p);
  };

  // The dice: another random Aufgabe within the current scope. Keeps any
  // typed text (a mis-tap must not destroy work) but clears a stale result.
  const reroll = () => {
    setDrawn((cur) => randomTask(eligible, cur));
    setResult(null);
    setDiceSpin((d) => d + 180);
  };

  // Rail reset (always active, founder s149 P2): clears every scope AND draws
  // a fresh random task. When the scopes are already default the URL doesn't
  // change, so the scope-change effect won't fire; roll explicitly here.
  const resetScope = () => {
    const p = new URLSearchParams(params);
    p.delete("theme");
    p.delete("sub");
    p.delete("sector");
    p.delete("level");
    p.delete("format");
    setParams(p);
    const fullPool = eligibleTasks({ theme: "", sub: "", sector: "", level: "", format: "", length });
    setDrawn((cur) => randomTask(fullPool, cur));
    setResult(null);
    setDiceSpin((d) => d + 180);
  };

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    // Send the AUFGABE, not just the text (s167 P2): without it the evaluator
    // grades language in a vacuum and Aufgabenerfüllung is uncheckable.
    const res = await evaluateWriting({
      theme: drawn.theme,
      length,
      text: text.trim(),
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
    if (!isSignedIn) {
      onRequireAuth({ theme: drawn.theme, length, text, promptIndex: drawn.ix });
      return;
    }
    void submit();
  };

  // The eyebrow names the DRAWN task's theme, which under "Alle Themen" is the
  // only place the learner learns what they are writing about.
  const t = themeById(drawn.theme)!;
  const task = taskAt(drawn, length);
  const prompt = task?.text ?? "";
  // Word target: per task where the Aufgabe declares one (real exam targets run
  // 40 to 200 and do NOT share one number), else the mode default (s167).
  const [min, max] = task?.words
    ? [task.words, Math.round(task.words * 1.25)]
    : rangeByLength[length];
  const enough = words >= Math.floor(min * 0.6);
  const minWords = 5;
  const remaining = Math.max(0, minWords - words);
  const tooShort = words < minWords;

  const area = result?.practiceArea ? practiceAreaById(result.practiceArea) : undefined;

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
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 hidden lg:block lg:pl-64">
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

  const content = (
    <div className="space-y-4">
      {/* Aufgabe: eyebrow names the topic, dice draws another random task. */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              {/* Highlighted task eyebrow (founder s149): brand color + bold. */}
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Aufgabe: {t.titleDe}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {task?.format ? `${writingFormatLabel(task.format)} · ` : ""}Ziel {min}–{max} Wörter
              </p>
            </div>
            {/* Standard 40px icon-button size; the icon half-spins per roll. */}
            <button
              type="button"
              onClick={reroll}
              aria-label="Neue Aufgabe"
              title="Neue Aufgabe"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Dices
                className="h-4 w-4 transition-transform duration-300"
                style={reduce ? undefined : { transform: `rotate(${diceSpin}deg)` }}
              />
            </button>
          </div>
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
          {task?.points?.length ? (
            <motion.div
              key={`points|${drawn.theme}|${length}|${drawn.ix}`}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="space-y-1.5"
            >
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
            </motion.div>
          ) : null}
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <textarea
            ref={editorRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            rows={length === "long" ? 10 : 6}
            placeholder="Schreibe hier deinen Text auf Deutsch …"
            className="w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
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
                <Button variant="ghost" onClick={() => { setResult(null); setText(""); }} disabled={submitting}>
                  Neu schreiben
                </Button>
              )}
              {evaluateButton}
            </div>
          </div>
          {/* Desktop only: on mobile the floating action cluster pins exactly
              over the card's last line, so this hint rides in the cluster
              instead (see below) and never ends up under the buttons. */}
          {tooShort && (
            <p className="hidden items-center gap-1.5 text-xs font-medium text-warning lg:flex">
              Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du auswerten.
            </p>
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
                <p className="text-sm leading-relaxed">{result.insight}</p>
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
    <div>
      {/* Mobile: the Bibliothek pattern, a toolbar button toggling the
          collapsible "Aufgabe wählen" panel (no floating chip row). */}
      <div className="mb-4 space-y-3 lg:hidden">
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
                onChange={(id) => {
                  setTheme(id);
                  setPickerOpen(false);
                }}
                sub={sub}
                onSubChange={setSub}
                sector={sector}
                onSectorChange={setSector}
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
          length={length}
          onReset={resetScope}
          className="hidden lg:block lg:sticky lg:top-24"
        />
      </div>

      {/* Mobile: Feedback + Auswerten (and Neu schreiben after a result) float
          side by side above the nav, no bar chrome, with the condensed KI-Hinweis
          directly beneath (founder s160, matching Fokus). */}
      <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 mt-4 lg:hidden">
        {/* Every control sits on its own opaque backing (see `floatingCluster`);
            FeedbackIconButton is already solid. */}
        <div className="flex items-stretch gap-2">
          <FeedbackIconButton />
          {result && (
            <div className={floatingSlot}>
              <Button
                variant="outline"
                className="h-11 rounded-xl"
                onClick={() => { setResult(null); setText(""); }}
                disabled={submitting}
              >
                Neu schreiben
              </Button>
            </div>
          )}
          <div className={cn(floatingSlot, "flex-1 [&>button]:h-11 [&>button]:w-full [&>button]:rounded-xl [&>button]:text-base")}>
            {evaluateButton}
          </div>
        </div>
        {/* One line slot under the buttons: while the text is too short to
            evaluate it carries the "how many words to go" hint (the honest
            reason the button is inactive), otherwise the Art. 50 note. Only
            one of them is ever true, so this stays a single line of chrome. */}
        {tooShort ? (
          <p className="mt-2 text-center text-[11px] font-medium leading-snug text-warning">
            <span className={floatingNote}>
              Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du auswerten.
            </span>
          </p>
        ) : (
          <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
            <span className={floatingNote}>
              KI-geprüft, kann Fehler enthalten.{" "}
              <Link to="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
                Mehr
              </Link>
            </span>
          </p>
        )}
      </div>

      {aiNoteDesktop}
    </div>
  );
}
