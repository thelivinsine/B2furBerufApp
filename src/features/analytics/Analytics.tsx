import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import { Flame, Zap, Trophy, BookOpen, TrendingUp, Target } from "lucide-react";
import { vocabulary } from "@/data/vocabulary";
import { themes } from "@/data/themes";
import { vocabByTheme } from "@/data/vocabulary";
import { scenarios } from "@/data/dialogues";
import { redemittel } from "@/data/redemittel";
import { practiceAreaById } from "@/data/practiceAreas";
import { useProgressStore, useEffectiveStreak, useTodayXp } from "@/store/useProgressStore";
import { useSettingsStore, type LearningGoal } from "@/store/useSettingsStore";
import { mastery, masteryLabel, dueCount } from "@/engine/srs";
import { levelFromXp, tierForLevel } from "@/engine/scoring";
import { pct, cn, daysBetween, todayKey } from "@/lib/utils";
import { getWritingHistory, type WritingHistoryEntry } from "@/lib/writing";
import type { WeaknessCategory } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { SectionHeading, StreakBadge, XPBar } from "@/components/shared/misc";
import { StatCard } from "@/components/shared/StatCard";
import { recommendedNext } from "@/features/dashboard/recommend";

const goalLabelDe: Record<LearningGoal, string> = {
  exam: "Fokus auf die B2-Prüfung",
  work: "Sicherer im Berufsalltag",
  fluency: "Flüssiger und spontaner sprechen",
};

function lastNDays(n: number): string[] {
  const days: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return days;
}

function WeaknessPanel({ entries }: { entries: WritingHistoryEntry[] }) {
  const navigate = useNavigate();

  const freq = entries.reduce(
    (acc, e) => {
      if (e.weakness) acc[e.weakness] = (acc[e.weakness] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<WeaknessCategory, number>>,
  );

  const sorted = (Object.entries(freq) as [WeaknessCategory, number][]).sort(
    ([, a], [, b]) => b - a,
  );

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Noch keine Auswertungen. Reiche einen Text ein, um Schwachstellen zu sehen.
      </p>
    );
  }

  const maxCount = sorted[0][1];
  const topArea = practiceAreaById(sorted[0][0]);

  return (
    <div className="space-y-4">
      <div className="space-y-2.5">
        {sorted.slice(0, 5).map(([weakness, count], i) => {
          const area = practiceAreaById(weakness);
          const widthPct = Math.round((count / maxCount) * 100);
          return (
            <div key={weakness} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className={cn("font-medium", i === 0 && "text-primary")}>
                  {area?.labelDe ?? weakness}
                </span>
                <span className="tabular-nums text-muted-foreground">{count}×</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/50">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    i === 0 ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {topArea && (
        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-sm text-muted-foreground">
            Top-Schwachstelle:{" "}
            <span className="font-medium text-foreground">{topArea.labelDe}</span>
          </p>
          <Button size="sm" onClick={() => navigate(topArea.route)}>
            <Target className="h-3.5 w-3.5" /> Jetzt üben
          </Button>
        </div>
      )}
    </div>
  );
}

export function Analytics() {
  const xp = useProgressStore((s) => s.xp);
  const streak = useEffectiveStreak();
  const longestStreak = useProgressStore((s) => s.longestStreak);
  const dailyXp = useProgressStore((s) => s.dailyXp);
  const srs = useProgressStore((s) => s.srs);
  const redemittelSeen = useProgressStore((s) => s.redemittelSeen);
  const scenariosDone = useProgressStore((s) => s.scenariosDone);
  const examsDone = useProgressStore((s) => s.examsDone);
  const totalSessions = useProgressStore((s) => s.totalSessions);
  const todayXp = useTodayXp();
  const navigate = useNavigate();
  const level = useSettingsStore((s) => s.level);
  const learningGoal = useSettingsStore((s) => s.goal);
  const examDate = useSettingsStore((s) => s.examDate);
  const dailyGoalXp = useSettingsStore((s) => s.dailyGoalXp);

  const coldStart = xp === 0 && totalSessions === 0;
  const daysToExam = examDate ? Math.max(0, daysBetween(todayKey(), examDate)) : null;
  const rec = recommendedNext({ due: dueCount(srs), todayXp, goal: dailyGoalXp, daysToExam });
  const minutesGoal = Math.max(5, Math.round(dailyGoalXp / 8));

  const [writingEntries, setWritingEntries] = useState<WritingHistoryEntry[]>([]);
  const [writingLoaded, setWritingLoaded] = useState(false);

  useEffect(() => {
    getWritingHistory(60).then((data) => {
      setWritingEntries(data);
      setWritingLoaded(true);
    });
  }, []);

  const info = levelFromXp(xp);
  const tier = tierForLevel(info.level);

  // 30-day XP chart
  const days30 = useMemo(() => lastNDays(30), []);
  const xpChartData = days30.map((d) => ({
    label: d.slice(5), // MM-DD
    xp: dailyXp[d] ?? 0,
  }));

  const masteryGroups = useMemo(() => {
    const groups = { new: 0, learning: 0, review: 0, mastered: 0 };
    vocabulary.forEach((v) => {
      groups[masteryLabel(mastery(srs[v.id]))]++;
    });
    return groups;
  }, [srs]);

  const masteryData = [
    { label: "Neu", value: masteryGroups.new, fill: "var(--color-muted-foreground)" },
    { label: "Lernen", value: masteryGroups.learning, fill: "var(--color-warning)" },
    { label: "Wiederholen", value: masteryGroups.review, fill: "var(--color-primary)" },
    { label: "Gemeistert", value: masteryGroups.mastered, fill: "var(--color-success)" },
  ];

  // Per-theme mastery — sorted least mastered first
  const themeStats = useMemo(() => {
    return themes
      .map((t) => {
        const words = vocabByTheme(t.id);
        const mastered = words.filter((w) => mastery(srs[w.id]) >= 0.8).length;
        const ratio = words.length ? mastered / words.length : 0;
        return { theme: t, total: words.length, mastered, ratio };
      })
      .sort((a, b) => a.ratio - b.ratio);
  }, [srs]);

  const redemittelPractised = Object.keys(redemittelSeen).length;

  return (
    <div className="space-y-5 sm:space-y-8">
      <SectionHeading
        eyebrow="Fortschritt"
        title="Deine Statistiken"
        description="Überblick über XP, Serien, Wortschatz-Beherrschung und abgeschlossene Aktivitäten."
      />

      {/* Top stats */}
      {coldStart ? (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-sm font-medium text-primary">Dein Ziel</p>
              <p className="mt-1 text-xl font-semibold">
                {level} · {goalLabelDe[learningGoal]}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {minutesGoal} Min/Tag
                {daysToExam !== null && ` · noch ${daysToExam} ${daysToExam === 1 ? "Tag" : "Tage"} bis zur Prüfung`}.
                Starte deine erste Runde, dann siehst du hier deinen Fortschritt.
              </p>
            </div>
            <Button onClick={() => navigate(rec.to)}>
              <rec.icon className="h-4 w-4" /> {rec.label}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard icon={Zap} label="Gesamt-XP" value={xp.toLocaleString()} hint={`Level ${info.level} · ${tier.name}`} />
          <StatCard icon={Flame} label="Aktuelle Serie" value={`${streak} Tage`} hint={`Rekord: ${longestStreak} Tage`} accent="warning" />
          <StatCard icon={BookOpen} label="Vokabeln gemeistert" value={`${masteryGroups.mastered}/${vocabulary.length}`} hint={`${pct(masteryGroups.mastered, vocabulary.length)}%`} accent="success" />
          <StatCard icon={Trophy} label="Szenarien abgeschlossen" value={`${scenariosDone.length}/${scenarios.length}`} hint={`${examsDone.length} Prüfungen`} accent="accent" />
        </div>
      )}

      {/* XP progress */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-3 font-semibold">Level-Fortschritt</p>
          <XPBar xp={xp} />
          <div className="mt-3 flex items-center gap-2">
            <StreakBadge count={streak} />
            <Badge variant="muted">{totalSessions} Sitzungen</Badge>
            <Badge variant="muted">{redemittelPractised}/{redemittel.length} Redemittel</Badge>
          </div>
        </CardContent>
      </Card>

      {/* XP last 30 days */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 font-semibold">XP – letzte 30 Tage</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={xpChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="xp" stroke="var(--color-primary)" strokeWidth={2} fill="url(#xpGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-theme mastery */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-1 font-semibold">Beherrschung nach Thema</p>
          <p className="mb-4 text-xs text-muted-foreground">Sortiert nach Lernbedarf (oben = meiste Lücken)</p>
          <div className="space-y-3">
            {themeStats.map(({ theme, total, mastered, ratio }) => (
              <div key={theme.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{theme.titleDe}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {mastered}/{total} · {Math.round(ratio * 100)}%
                  </span>
                </div>
                <Progress value={ratio * 100} className="h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vocab mastery distribution */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 font-semibold">Wortschatz-Beherrschung</p>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={masteryData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {masteryData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-3 flex flex-wrap gap-2">
            {masteryData.map((d) => (
              <Badge key={d.label} variant="muted">{d.label}: {d.value}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Writing weaknesses */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-1 flex items-center gap-2 font-semibold">
            <TrendingUp className="h-4 w-4 text-primary" /> Schwachstellen (Schreiben)
          </p>
          <p className="mb-4 text-xs text-muted-foreground">
            Aus deinen letzten KI-Auswertungen (letzte 60 Einträge)
          </p>
          {writingLoaded ? (
            <WeaknessPanel entries={writingEntries} />
          ) : (
            <div className="h-20 animate-pulse rounded-lg bg-muted/40" />
          )}
        </CardContent>
      </Card>

      {/* Exam history */}
      {examsDone.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <p className="mb-3 font-semibold">Prüfungsverlauf</p>
            <div className="space-y-2">
              {[...examsDone].reverse().slice(0, 10).map((e, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{e.date}</span>
                  <span className="font-medium">{e.id.replace("ex_", "")}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={e.score} className="w-20" />
                    <span className="w-10 text-right font-semibold tabular-nums">{e.score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity calendar */}
      <ActivityCalendar />
    </div>
  );
}

function ActivityCalendar() {
  const activeDays = useProgressStore((s) => s.activeDays);
  const activeSet = new Set(activeDays);

  const cells = useMemo(() => {
    const out: string[] = [];
    const today = new Date();
    for (let i = 55; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      );
    }
    return out;
  }, []);

  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-4 font-semibold">Aktivitätskalender</p>
        <div className="flex flex-wrap gap-1">
          {cells.map((d) => (
            <div
              key={d}
              title={d}
              className={`h-4 w-4 rounded-sm transition-colors ${
                activeSet.has(d)
                  ? "bg-primary/70 hover:bg-primary"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Letzte 56 Tage · {activeDays.length} aktive Tage</p>
      </CardContent>
    </Card>
  );
}
