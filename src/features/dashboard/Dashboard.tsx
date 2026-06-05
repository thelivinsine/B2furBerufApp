import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Trophy,
  BookOpen,
  Zap,
  ArrowRight,
  CalendarDays,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { themes } from "@/data/themes";
import { vocabByTheme, vocabulary } from "@/data/vocabulary";
import { scenariosByTheme } from "@/data/dialogues";
import { iconByName } from "@/lib/icons";
import { useProgressStore, useTodayXp, useEffectiveStreak } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { mastery, dueCount } from "@/engine/srs";
import { levelFromXp, tierForLevel } from "@/engine/scoring";
import { daysBetween, pct, todayKey, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { SectionHeading } from "@/components/shared/misc";
import { useMediaQuery } from "@/lib/hooks";
import { recommendedNext } from "./recommend";

type Accent = "primary" | "accent" | "success" | "warning";
const accentText: Record<Accent, string> = {
  primary: "text-primary",
  accent: "text-accent",
  success: "text-success",
  warning: "text-warning",
};

/** One inline segment of the status strip — deliberately NOT a card, so the
 *  strip reads as a single panel rather than four competing tiles. */
function StatItem({
  icon: Icon,
  accent,
  value,
  label,
}: {
  icon: LucideIcon;
  accent: Accent;
  value: React.ReactNode;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-3 sm:gap-3 sm:px-4 sm:py-3.5 sm:flex-1">
      <Icon className={cn("h-5 w-5 shrink-0", accentText[accent])} />
      <div className="min-w-0">
        <p className="text-lg font-semibold leading-tight tracking-tight tabular-nums">{value}</p>
        <p className="truncate text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function Dashboard() {
  const name = useSettingsStore((s) => s.name);
  const examDate = useSettingsStore((s) => s.examDate);
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const xp = useProgressStore((s) => s.xp);
  const streak = useEffectiveStreak();
  const srs = useProgressStore((s) => s.srs);
  const totalSessions = useProgressStore((s) => s.totalSessions);
  const todayXp = useTodayXp();
  const isSm = useMediaQuery("(min-width: 640px)");

  const info = levelFromXp(xp);
  const tier = tierForLevel(info.level);
  const goalProgress = Math.min(todayXp / goal, 1);
  const goalPercent = Math.round(goalProgress * 100);

  const masteredCount = vocabulary.filter((v) => mastery(srs[v.id]) >= 0.8).length;
  const daysToExam = examDate ? Math.max(0, daysBetween(todayKey(), examDate)) : null;
  const due = dueCount(srs);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  const rec = recommendedNext({ due, todayXp, goal, daysToExam });
  const secondary =
    rec.to === "/revision"
      ? { to: "/vocabulary", label: "Weiter lernen", icon: BookOpen }
      : { to: "/revision", label: "Schnellwiederholung", icon: Zap };

  // Theme stats; feature the least-mastered theme (most room to grow) to give
  // the browse grid a clear focal point and some size variety.
  const themeStats = themes.map((t) => {
    const words = vocabByTheme(t.id);
    const sims = scenariosByTheme(t.id);
    const mastered = words.filter((w) => mastery(srs[w.id]) >= 0.8).length;
    const ratio = words.length ? mastered / words.length : 1;
    return { theme: t, words, sims, mastered, ratio };
  });
  const featured = themeStats.reduce((a, b) =>
    b.ratio < a.ratio || (b.ratio === a.ratio && b.words.length > a.words.length) ? b : a,
  );
  const ordered = [featured, ...themeStats.filter((s) => s.theme.id !== featured.theme.id)];

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Focal block — the one primary action for today. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-primary/15 bg-surface shadow-glow"
      >
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative grid items-center gap-6 p-6 sm:p-8 md:grid-cols-[1.5fr_1fr] md:gap-8">
          {/* Content */}
          <div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <p className="text-sm font-medium text-primary">
                {greeting}, {name || "Lernende:r"} 👋
              </p>
              {rec.badge && <Badge variant="warning">{rec.badge}</Badge>}
            </div>
            <h1 className="mt-2.5 text-2xl font-bold tracking-tight sm:text-3xl">{rec.headline}</h1>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{rec.subline}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Button asChild variant="gradient" size="lg">
                <Link to={rec.to}>
                  <rec.icon className="h-4 w-4" /> {rec.label}
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to={secondary.to}>
                  <secondary.icon className="h-4 w-4" /> {secondary.label}
                </Link>
              </Button>
            </div>
          </div>

          {/* Today's progress — blended into the tile, centered in its column. */}
          <div className="flex flex-col items-center gap-2.5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Heute</p>
            <ProgressRing value={goalProgress} size={isSm ? 128 : 104} stroke={10}>
              <span className="text-2xl font-semibold tabular-nums">{todayXp}</span>
              <span className="text-xs text-muted-foreground">/ {goal} XP</span>
            </ProgressRing>
            <p className="text-xs text-muted-foreground">{goalPercent}% des Tagesziels</p>
          </div>
        </div>
      </motion.div>

      {/* Status strip — one panel of inline stats + embedded level progress. */}
      <Card className="overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-y divide-border sm:flex sm:divide-y-0">
          <StatItem icon={Flame} accent="warning" value={streak} label={streak === 1 ? "Tag Serie" : "Tage Serie"} />
          <StatItem icon={Trophy} accent="primary" value={`Lvl ${info.level}`} label={tier.name} />
          <StatItem icon={BookOpen} accent="success" value={`${masteredCount}/${vocabulary.length}`} label="Gemeistert" />
          {daysToExam !== null ? (
            <StatItem icon={CalendarDays} accent="accent" value={daysToExam} label="Tage bis Prüfung" />
          ) : (
            <StatItem icon={Activity} accent="accent" value={totalSessions} label="Sitzungen" />
          )}
        </div>
        <div className="border-t border-border px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="font-medium">
              Level {info.level} · <span className="text-muted-foreground">{tier.name}</span>
            </span>
            <span className="tabular-nums text-muted-foreground">
              {info.intoLevel} / {info.forLevel} XP
            </span>
          </div>
          <Progress value={info.progress * 100} className="h-1.5" />
        </div>
      </Card>

      {/* Themes — the main browse surface, with one featured (larger) card. */}
      <section>
        <SectionHeading
          eyebrow="Themen"
          title="Prüfungsthemen"
          description="Realistische Situationen aus dem Berufsalltag mit Wortschatz, Redemitteln und Simulationen."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/vocabulary">
                Wortschatz ansehen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ordered.map(({ theme, words, sims, mastered }, i) => {
            const Icon = iconByName(theme.icon);
            const masteredPct = pct(mastered, words.length);
            const isFeatured = theme.id === featured.theme.id;
            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(isFeatured && "sm:col-span-2")}
              >
                <Link to={`/vocabulary?theme=${theme.id}`}>
                  <Card className="card-hover group h-full overflow-hidden">
                    {isFeatured ? (
                      <CardContent className="p-5 sm:p-6">
                        <div className="flex items-start justify-between">
                          <div className={`rounded-xl bg-gradient-to-br ${theme.accent} p-3 text-white shadow-soft`}>
                            <Icon className="h-6 w-6" />
                          </div>
                          <Badge variant="accent">Empfohlen</Badge>
                        </div>
                        <p className="mt-3 text-lg font-semibold">{theme.titleDe}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{theme.blurb}</p>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="rounded-full bg-muted px-2.5 py-1">{words.length} Wörter</span>
                          {sims.length > 0 && (
                            <span className="rounded-full bg-muted px-2.5 py-1">{sims.length} Simulationen</span>
                          )}
                        </div>
                        <div className="mt-3 space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{mastered} / {words.length} gemeistert</span>
                            <span>{masteredPct}%</span>
                          </div>
                          <Progress value={masteredPct} className="h-1.5" />
                        </div>
                      </CardContent>
                    ) : (
                      <CardContent className="space-y-3 p-5">
                        <div className="flex items-start justify-between">
                          <div className={`rounded-xl bg-gradient-to-br ${theme.accent} p-2.5 text-white shadow-soft`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          {sims.length > 0 && <Badge variant="muted">{sims.length} Sim.</Badge>}
                        </div>
                        <div>
                          <p className="font-semibold">{theme.titleDe}</p>
                          <p className="line-clamp-2 text-sm text-muted-foreground">{theme.blurb}</p>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{mastered} / {words.length} Wörter</span>
                            <span>{masteredPct}%</span>
                          </div>
                          <Progress value={masteredPct} className="h-1.5" />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
