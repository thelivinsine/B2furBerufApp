import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PenLine, Sparkles, Target, Loader2, Lightbulb, Clock, Info } from "lucide-react";
import type { ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import { practiceAreaById, practiceRoute } from "@/data/practiceAreas";
import { iconByName } from "@/lib/icons";
import { evaluateWriting, type WritingEvalResult, type WritingLength } from "@/lib/writing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Guided writing task (Kurz / Lang) for Schreibtraining: pick a theme, write to a
 * B2-Beruf-style prompt, get the single most important coaching tip + a practice
 * deep-link. This is the app's original writing flow, extracted from WritingHub
 * unchanged (plan: docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md); the mode switcher
 * now supplies `length` (Kurz = short, Lang = long), so the old in-page length
 * toggle is gone. Auth is gated by the parent via `onRequireAuth`.
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
}: {
  length: WritingLength;
  isSignedIn: boolean;
  onRequireAuth: (payload: { theme: ThemeId; length: WritingLength; text: string }) => void;
  initialText?: string;
}) {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const themeParam = params.get("theme");
  const theme = isThemeId(themeParam) ? themeParam : null;

  const [text, setText] = useState(initialText);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingEvalResult | null>(null);

  const words = useMemo(() => countWords(text), [text]);

  // Restore a resumed draft's text once (do not auto-evaluate).
  useEffect(() => {
    if (initialText && !text) setText(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  const setTheme = (id: ThemeId | null) => {
    const p = new URLSearchParams(params);
    if (id) p.set("theme", id);
    else p.delete("theme");
    setParams(p);
  };

  const submit = async () => {
    if (!theme) return;
    setSubmitting(true);
    setResult(null);
    const res = await evaluateWriting({ theme, length, text: text.trim() });
    setResult(res);
    setSubmitting(false);
  };

  const handleEvaluate = () => {
    if (!theme) return;
    if (!isSignedIn) {
      onRequireAuth({ theme, length, text });
      return;
    }
    void submit();
  };

  // Theme picker
  if (!theme) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themes.map((t, i) => {
          const Icon = iconByName(t.icon);
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setTheme(t.id)}
              className="text-left"
            >
              <Card className="card-hover group h-full overflow-hidden">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between">
                    <div className={`rounded-xl bg-gradient-to-br ${t.accent} p-2.5 text-white shadow-soft`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="muted" className="gap-1">
                      <PenLine className="h-3 w-3" /> {length === "long" ? "Lang" : "Kurz"}
                    </Badge>
                  </div>
                  <p className="font-semibold">{t.titleDe}</p>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </div>
    );
  }

  const t = themeById(theme)!;
  const Icon = iconByName(t.icon);
  const prompt = writingPrompts[theme][length];
  const [min, max] = rangeByLength[length];
  const enough = words >= Math.floor(min * 0.6);
  const minWords = 5;
  const remaining = Math.max(0, minWords - words);
  const tooShort = words < minWords;

  const startOver = () => {
    setResult(null);
    setText("");
  };

  const area = result?.practiceArea ? practiceAreaById(result.practiceArea) : undefined;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setTheme(null)}>
          <ArrowLeft className="h-4 w-4" /> Themen
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className={`rounded-xl bg-gradient-to-br ${t.accent} p-3 text-white shadow-soft`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-display text-2xl">{t.titleDe}</h2>
          <p className="text-sm text-muted-foreground">Schreibtraining mit KI-Feedback.</p>
        </div>
      </div>

      {/* Prompt */}
      <Card>
        <CardContent className="space-y-2 p-5">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            <Target className="h-3.5 w-3.5" /> Aufgabe
          </p>
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
                <Button variant="ghost" onClick={startOver} disabled={submitting}>
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
              <PenLine className="h-3.5 w-3.5 shrink-0" />
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
}
