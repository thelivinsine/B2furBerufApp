import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PenLine, Sparkles, Target, Loader2, Lightbulb, Clock } from "lucide-react";
import type { ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import { practiceAreaById } from "@/data/practiceAreas";
import { iconByName } from "@/lib/icons";
import { evaluateWriting, type WritingEvalResult, type WritingLength } from "@/lib/writing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HubHero } from "@/components/shared/HubHero";
import { cn } from "@/lib/utils";

const lengthMeta: Record<WritingLength, { labelDe: string; words: string; range: [number, number] }> = {
  short: { labelDe: "Kurz", words: "ca. 40–60 Wörter", range: [40, 60] },
  long: { labelDe: "Lang", words: "ca. 120–150 Wörter", range: [120, 150] },
};

function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

function isThemeId(v: string | null): v is ThemeId {
  return !!v && themes.some((t) => t.id === v);
}

export function WritingHub() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const themeParam = params.get("theme");
  const theme = isThemeId(themeParam) ? themeParam : null;

  const [length, setLength] = useState<WritingLength>("short");
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<WritingEvalResult | null>(null);

  const words = useMemo(() => countWords(text), [text]);

  // Theme picker
  if (!theme) {
    return (
      <div className="space-y-6">
        <HubHero
          icon={PenLine}
          gradient="from-rose-500 to-pink-500"
          eyebrow="KI-Schreibcoach"
          title="Schreibtraining"
          description="Schreibe einen kurzen oder langen Text zu einem Berufsthema. Die KI nennt dir deine wichtigste Schwachstelle – und einen Knopf, der dich direkt zur passenden Übung bringt."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((t, i) => {
            const Icon = iconByName(t.icon);
            return (
              <motion.button
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setParams({ theme: t.id })}
                className="text-left"
              >
                <Card className="card-hover group h-full overflow-hidden">
                  <div className={`h-1.5 w-full bg-gradient-to-r ${t.accent}`} />
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-start justify-between">
                      <div className={`rounded-xl bg-gradient-to-br ${t.accent} p-2.5 text-white shadow-soft`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="muted" className="gap-1">
                        <PenLine className="h-3 w-3" /> Schreiben
                      </Badge>
                    </div>
                    <p className="font-semibold">{t.titleDe}</p>
                  </CardContent>
                </Card>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  const t = themeById(theme)!;
  const Icon = iconByName(t.icon);
  const prompt = writingPrompts[theme][length];
  const [min, max] = lengthMeta[length].range;
  const enough = words >= Math.floor(min * 0.6);

  const reset = () => setParams({});
  const startOver = () => {
    setResult(null);
    setText("");
  };

  const submit = async () => {
    setSubmitting(true);
    setResult(null);
    const res = await evaluateWriting({ theme, length, text: text.trim() });
    setResult(res);
    setSubmitting(false);
  };

  const area = result?.practiceArea ? practiceAreaById(result.practiceArea) : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={reset}>
          <ArrowLeft className="h-4 w-4" /> Themen
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className={`rounded-xl bg-gradient-to-br ${t.accent} p-3 text-white shadow-soft`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.titleDe}</h1>
          <p className="text-sm text-muted-foreground">Schreibtraining mit KI-Feedback.</p>
        </div>
      </div>

      {/* Length switch */}
      <div className="flex gap-2">
        {(Object.keys(lengthMeta) as WritingLength[]).map((l) => (
          <button
            key={l}
            onClick={() => {
              setLength(l);
              setResult(null);
            }}
            className={cn(
              "flex-1 rounded-lg border px-4 py-3 text-left transition-colors",
              length === l ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40",
            )}
          >
            <p className="text-sm font-semibold">{lengthMeta[l].labelDe}</p>
            <p className="text-xs text-muted-foreground">{lengthMeta[l].words}</p>
          </button>
        ))}
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
            <span
              className={cn(
                "text-xs tabular-nums",
                enough ? "text-success" : "text-muted-foreground",
              )}
            >
              {words} Wörter · Ziel {min}–{max}
            </span>
            <div className="flex gap-2">
              {result && (
                <Button variant="ghost" onClick={startOver} disabled={submitting}>
                  Neu schreiben
                </Button>
              )}
              <Button onClick={submit} disabled={submitting || words < 5} variant="gradient">
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
                {area && (
                  <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground">{area.description}</p>
                    <Button className="ml-auto" onClick={() => navigate(area.route)}>
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
