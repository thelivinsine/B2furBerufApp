import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, ListChecks } from "lucide-react";
import type { Difficulty, ThemeId } from "@/types";
import { themes, themeById } from "@/data/themes";
import { vocabByTheme } from "@/data/vocabulary";
import { collocationsByTheme } from "@/data/collocations";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HubHero } from "@/components/shared/HubHero";
import { QuizRunner } from "./QuizRunner";

const levels: { value: Difficulty; labelDe: string; desc: string; accent: string }[] = [
  { value: 1, labelDe: "Leicht", desc: "Erkennen: Übersetzung, Artikel, Zuordnung", accent: "bg-success/15 text-success" },
  { value: 2, labelDe: "Mittel", desc: "Anwenden: Plural, Lücken, Nomen-Verb, Konnektoren", accent: "bg-warning/15 text-warning" },
  { value: 3, labelDe: "Schwer", desc: "Können: Satzbau, Relativpronomen, da-/wo-Wörter", accent: "bg-danger/15 text-danger" },
];

function isThemeId(v: string | null): v is ThemeId {
  return !!v && themes.some((t) => t.id === v);
}

export function QuizHub() {
  const [params, setParams] = useSearchParams();
  const themeParam = params.get("theme");
  const levelParam = Number(params.get("level"));
  const theme = isThemeId(themeParam) ? themeParam : null;
  const level: Difficulty | null =
    levelParam === 1 || levelParam === 2 || levelParam === 3 ? (levelParam as Difficulty) : null;

  // Hook must run unconditionally (before any early return).
  const themeCards = useMemo(
    () =>
      themes.map((t) => ({
        ...t,
        words: vocabByTheme(t.id).length,
        cols: collocationsByTheme(t.id).length,
      })),
    [],
  );

  const setTheme = (t: ThemeId) => setParams({ theme: t });
  const setLevel = (l: Difficulty) => {
    const p = new URLSearchParams(params);
    p.set("level", String(l));
    setParams(p);
  };
  const reset = () => setParams({});
  const backToLevels = () => {
    const p = new URLSearchParams(params);
    p.delete("level");
    setParams(p);
  };

  // Running a quiz
  if (theme && level) {
    const t = themeById(theme)!;
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={backToLevels}>
            <ArrowLeft className="h-4 w-4" /> Stufe wählen
          </Button>
        </div>
        <QuizRunner
          key={`${theme}-${level}`}
          themeId={theme}
          difficulty={level}
          themeTitle={t.titleDe}
          onExit={backToLevels}
        />
      </div>
    );
  }

  // Pick a level for a chosen theme
  if (theme) {
    const t = themeById(theme)!;
    const Icon = iconByName(t.icon);
    return (
      <div className="space-y-4 sm:space-y-6">
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
            <p className="text-sm text-muted-foreground">Wähle deine Schwierigkeitsstufe.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {levels.map((l, i) => (
            <motion.button
              key={l.value}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setLevel(l.value)}
              className="text-left"
            >
              <Card className="card-hover h-full">
                <CardContent className="space-y-2 p-5">
                  <Badge className={l.accent}>{l.labelDe}</Badge>
                  <p className="text-sm text-muted-foreground">{l.desc}</p>
                </CardContent>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Pick a theme
  return (
    <div className="space-y-4 sm:space-y-6">
      <HubHero
        icon={ListChecks}
        gradient="from-violet-500 to-indigo-500"
        eyebrow="Quiz"
        title="Themen-Quiz"
        description="Teste dein Wissen pro Thema in drei Stufen – Vokabeln, Nomen-Verb-Verbindungen und Grammatik gemischt, mit XP und Wiederholung (SRS)."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {themeCards.map((t, i) => {
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
                    <Badge variant="muted" className="gap-1"><Sparkles className="h-3 w-3" /> 3 Stufen</Badge>
                  </div>
                  <div>
                    <p className="font-semibold">{t.titleDe}</p>
                    <p className="text-xs text-muted-foreground">{t.words} Wörter · {t.cols} Wendungen</p>
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
