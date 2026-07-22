import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Target, Loader2, Lightbulb, Clock, Info } from "lucide-react";
import type { ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import { practiceAreaById, practiceRoute } from "@/data/practiceAreas";
import { iconByName } from "@/lib/icons";
import { evaluateWriting, type WritingEvalResult, type WritingLength } from "@/lib/writing";
import { WritingRail } from "./WritingRail";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Guided writing task (Kurz / Lang) for Schreibtraining (redesign, s147). The
 * learner lands STRAIGHT on an Aufgabe + writing field (no theme-picker page);
 * the topic is switched from the Thema rail on the right (desktop) or the chip
 * row (mobile), harmonized with the Bibliothek / Fokus design language. Mode
 * supplies `length` (Kurz = short, Lang = long); auth is gated by the parent via
 * `onRequireAuth`.
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

export function GuidedWritingTrainer({
  length,
  isSignedIn,
  onRequireAuth,
  initialText = "",
}: {
  length: WritingLength;
  isSignedIn: boolean;
  onRequireAuth: (payload: { theme: ThemeId; length: WritingLength; text: string }) => void;
  initialText?: string;
}) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const themeParam = params.get("theme");
  const theme: ThemeId = isThemeId(themeParam) ? themeParam : DEFAULT_THEME;

  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingEvalResult | null>(null);

  const words = useMemo(() => countWords(text), [text]);

  // Reset the draft + result when the task (theme or length) changes, but NOT on
  // mount (so a resumed draft survives). keyRef is seeded with the initial task.
  const keyRef = useRef(`${theme}|${length}`);
  useEffect(() => {
    const key = `${theme}|${length}`;
    if (keyRef.current !== key) {
      keyRef.current = key;
      setText("");
      setResult(null);
    }
  }, [theme, length]);

  const setTheme = (id: ThemeId) => {
    const p = new URLSearchParams(params);
    p.set("theme", id);
    setParams(p);
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
      onRequireAuth({ theme, length, text });
      return;
    }
    void submit();
  };

  const t = themeById(theme)!;
  const Icon = iconByName(t.icon);
  const prompt = writingPrompts[theme][length];
  const [min, max] = rangeByLength[length];
  const enough = words >= Math.floor(min * 0.6);
  const minWords = 5;
  const remaining = Math.max(0, minWords - words);
  const tooShort = words < minWords;

  const area = result?.practiceArea ? practiceAreaById(result.practiceArea) : undefined;

  const content = (
    <div className="space-y-4">
      {/* Aufgabe */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center gap-3">
            <div className={`rounded-xl bg-gradient-to-br ${t.accent} p-2.5 text-white shadow-soft`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                <Target className="h-3.5 w-3.5" /> Aufgabe · {t.titleDe}
              </p>
              <p className="text-xs text-muted-foreground">
                {length === "long" ? "Langer Text" : "Kurzer Text"} · Ziel {min}–{max} Wörter
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">{prompt}</p>
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
            <span className={cn("text-xs tabular-nums", enough ? "text-success" : "text-muted-foreground")}>
              {words} Wörter · Ziel {min}–{max}
            </span>
            <div className="flex gap-2">
              {result && (
                <Button variant="ghost" onClick={() => { setResult(null); setText(""); }} disabled={submitting}>
                  Neu schreiben
                </Button>
              )}
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
            </div>
          </div>
          {tooShort && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
              Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du auswerten.
            </p>
          )}
          <p className="flex items-start gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
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
        </CardContent>
      </Card>

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
      {/* Mobile: Thema chip row above the task. */}
      <div className="mb-4 lg:hidden">
        <WritingRail layout="chips" value={theme} onChange={setTheme} />
      </div>

      {/* Desktop: content + sticky Thema rail. Mobile: content only. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start lg:gap-6">
        {content}
        <WritingRail value={theme} onChange={setTheme} className="hidden lg:block" />
      </div>
    </div>
  );
}
