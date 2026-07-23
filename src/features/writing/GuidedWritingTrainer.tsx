import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Target, Loader2, Lightbulb, Clock, Info, Dices, ChevronDown } from "lucide-react";
import type { ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import { practiceAreaById, practiceRoute } from "@/data/practiceAreas";
import { evaluateWriting, type WritingEvalResult, type WritingLength } from "@/lib/writing";
import { WritingRail } from "./WritingRail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

const DEFAULT_THEME: ThemeId = themes[0].id;
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

/** Random pool index, avoiding `exclude` when the pool has an alternative. */
function randomIndex(poolSize: number, exclude?: number): number {
  if (poolSize <= 1) return 0;
  let ix = Math.floor(Math.random() * poolSize);
  if (ix === exclude) ix = (ix + 1) % poolSize;
  return ix;
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
  const theme: ThemeId = isThemeId(themeParam) ? themeParam : DEFAULT_THEME;

  const pool = writingPrompts[theme][length];
  const [promptIx, setPromptIx] = useState(() =>
    initialPromptIndex != null && initialPromptIndex >= 0 && initialPromptIndex < pool.length
      ? initialPromptIndex
      : randomIndex(pool.length),
  );
  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingEvalResult | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const words = useMemo(() => countWords(text), [text]);

  // Reset draft + result and draw a fresh random Aufgabe when the task (theme
  // or length) changes, but NOT on mount (so a resumed draft survives). keyRef
  // is seeded with the initial task.
  const keyRef = useRef(`${theme}|${length}`);
  useEffect(() => {
    const key = `${theme}|${length}`;
    if (keyRef.current !== key) {
      keyRef.current = key;
      setText("");
      setResult(null);
      setPromptIx(randomIndex(writingPrompts[theme][length].length));
    }
  }, [theme, length]);

  const setTheme = (id: ThemeId) => {
    const p = new URLSearchParams(params);
    p.set("theme", id);
    setParams(p);
  };

  // The dice: another random Aufgabe from the same theme's pool. Keeps any
  // typed text (a mis-tap must not destroy work) but clears a stale result.
  const reroll = () => {
    setPromptIx((ix) => randomIndex(pool.length, ix));
    setResult(null);
  };

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    const res = await evaluateWriting({ theme, length, text: text.trim() });
    setResult(res);
    setSubmitting(false);
  };

  const handleEvaluate = () => {
    if (!isSignedIn) {
      onRequireAuth({ theme, length, text, promptIndex: promptIx });
      return;
    }
    void submit();
  };

  const t = themeById(theme)!;
  const prompt = pool[promptIx] ?? pool[0];
  const [min, max] = rangeByLength[length];
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
                Ziel {min}–{max} Wörter
              </p>
            </div>
            <button
              type="button"
              onClick={reroll}
              aria-label="Neue Aufgabe"
              title="Neue Aufgabe"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Dices className="h-4 w-4" />
            </button>
          </div>
          <motion.p
            key={`${theme}|${length}|${promptIx}`}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="text-sm leading-relaxed"
          >
            {prompt}
          </motion.p>
        </CardContent>
      </Card>

      {/* Editor */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={submitting}
            rows={length === "long" ? 10 : 6}
            placeholder="Schreibe hier deinen Text auf Deutsch …"
            className="w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex items-center justify-between">
            {/* The Ziel range lives on the Aufgabe card only (founder s149). */}
            <span className={cn("text-xs tabular-nums", enough ? "text-success" : "text-muted-foreground")}>
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
          {tooShort && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
              Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du auswerten.
            </p>
          )}
        </CardContent>
      </Card>

      {/* EU AI Act Art. 50 transparency: a standalone line below the editor
          card, not inside it (founder s149). */}
      <p className="flex items-start gap-1.5 px-1 text-xs text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Dein Text wird zur Auswertung an eine KI (Anthropic Claude) gesendet. Die Rückmeldung
          ist KI-generiert und kann Fehler enthalten.{" "}
          <Link to="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
            Mehr im Datenschutz
          </Link>
          .
        </span>
      </p>

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
                    <Button className="ml-auto" onClick={() => navigate(practiceRoute(area, { theme }))}>
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
            variant={pickerOpen ? "default" : "outline"}
            aria-expanded={pickerOpen}
            aria-pressed={pickerOpen}
            className="h-10 rounded-lg"
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
                value={theme}
                onChange={(id) => {
                  setTheme(id);
                  setPickerOpen(false);
                }}
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
          value={theme}
          onChange={setTheme}
          className="hidden lg:block lg:sticky lg:top-24"
        />
      </div>

      {/* Mobile action bar: Auswerten pinned above the nav, the page scrolls
          underneath (the Bibliothek Üben-bar pattern). */}
      <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 mt-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden [&>button]:h-11 [&>button]:flex-1 [&>button]:rounded-xl [&>button]:text-base">
        {result && (
          <Button variant="outline" onClick={() => { setResult(null); setText(""); }} disabled={submitting}>
            Neu schreiben
          </Button>
        )}
        {evaluateButton}
      </div>
    </div>
  );
}
