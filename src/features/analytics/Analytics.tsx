import { useMemo } from "react";
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
import { Flame, Zap, Trophy, BookOpen } from "lucide-react";
import { vocabulary } from "@/data/vocabulary";
import { scenarios } from "@/data/dialogues";
import { redemittel } from "@/data/redemittel";
import { useProgressStore } from "@/store/useProgressStore";
import { mastery, masteryLabel } from "@/engine/srs";
import { levelFromXp, tierForLevel } from "@/engine/scoring";
import { pct } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SectionHeading, StreakBadge, XPBar } from "@/components/shared/misc";
import { StatCard } from "@/components/shared/StatCard";

function last7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    );
  }
  return days;
}

export function Analytics() {
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const longestStreak = useProgressStore((s) => s.longestStreak);
  const dailyXp = useProgressStore((s) => s.dailyXp);
  const srs = useProgressStore((s) => s.srs);
  const redemittelSeen = useProgressStore((s) => s.redemittelSeen);
  const scenariosDone = useProgressStore((s) => s.scenariosDone);
  const examsDone = useProgressStore((s) => s.examsDone);
  const totalSessions = useProgressStore((s) => s.totalSessions);

  const info = levelFromXp(xp);
  const tier = tierForLevel(info.level);

  const days = useMemo(() => last7Days(), []);
  const xpChartData = days.map((d) => ({
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

  const redemittelPractised = Object.keys(redemittelSeen).length;

  return (
    <div className="space-y-8">
      <SectionHeading
        eyebrow="Fortschritt"
        title="Deine Statistiken"
        description="Überblick über XP, Serien, Wortschatz-Beherrschung und abgeschlossene Aktivitäten."
      />

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Zap} label="Gesamt-XP" value={xp.toLocaleString()} hint={`Level ${info.level} · ${tier.name}`} />
        <StatCard icon={Flame} label="Aktuelle Serie" value={`${streak} Tage`} hint={`Rekord: ${longestStreak} Tage`} accent="warning" />
        <StatCard icon={BookOpen} label="Vokabeln gemeistert" value={`${masteryGroups.mastered}/${vocabulary.length}`} hint={`${pct(masteryGroups.mastered, vocabulary.length)}%`} accent="success" />
        <StatCard icon={Trophy} label="Szenarien abgeschlossen" value={`${scenariosDone.length}/${scenarios.length}`} hint={`${examsDone.length} Prüfungen`} accent="accent" />
      </div>

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

      {/* XP last 7 days */}
      <Card>
        <CardContent className="p-5">
          <p className="mb-4 font-semibold">XP – letzte 7 Tage</p>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={xpChartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="xp" stroke="var(--color-primary)" strokeWidth={2} fill="url(#xpGrad)" />
            </AreaChart>
          </ResponsiveContainer>
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
