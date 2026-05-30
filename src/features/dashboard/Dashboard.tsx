import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Flame,
  Zap,
  Target,
  BookOpen,
  BookMarked,
  ListChecks,
  Mic,
  MessagesSquare,
  GraduationCap,
  ArrowRight,
  Trophy,
  CalendarDays,
} from "lucide-react";
import { themes } from "@/data/themes";
import { vocabByTheme } from "@/data/vocabulary";
import { scenariosByTheme } from "@/data/dialogues";
import { iconByName } from "@/lib/icons";
import { useProgressStore, useTodayXp } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { mastery } from "@/engine/srs";
import { levelFromXp, tierForLevel } from "@/engine/scoring";
import { vocabulary } from "@/data/vocabulary";
import { daysBetween, pct, todayKey } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/shared/StatCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { SectionHeading } from "@/components/shared/misc";

const dailyModules = [
  { to: "/vocabulary", label: "Wortschatz-Drill", desc: "Karteikarten mit Wiederholung", icon: BookOpen, mins: "5 Min" },
  { to: "/quiz", label: "Themen-Quiz", desc: "Drei Stufen pro Thema", icon: ListChecks, mins: "5 Min" },
  { to: "/grammar", label: "Grammatik-Werkstatt", desc: "Strukturen üben mit Feedback", icon: BookMarked, mins: "6 Min" },
  { to: "/redemittel", label: "Redemittel-Übung", desc: "Wendungen aktiv anwenden", icon: MessagesSquare, mins: "5 Min" },
  { to: "/simulation", label: "Sprechsimulation", desc: "Dialog mit Partner:in", icon: Mic, mins: "8 Min" },
  { to: "/exam", label: "Prüfungssimulation", desc: "Unter realen Bedingungen", icon: GraduationCap, mins: "10 Min" },
];

export function Dashboard() {
  const name = useSettingsStore((s) => s.name);
  const examDate = useSettingsStore((s) => s.examDate);
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const xp = useProgressStore((s) => s.xp);
  const streak = useProgressStore((s) => s.streak);
  const srs = useProgressStore((s) => s.srs);
  const todayXp = useTodayXp();

  const info = levelFromXp(xp);
  const tier = tierForLevel(info.level);
  const goalProgress = Math.min(todayXp / goal, 1);

  const masteredCount = vocabulary.filter((v) => mastery(srs[v.id]) >= 0.8).length;
  const daysToExam = examDate ? Math.max(0, daysBetween(todayKey(), examDate)) : null;

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="max-w-md">
            <p className="text-sm font-medium text-primary">
              {greeting}, {name || "Lernende:r"} 👋
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Bereit für dein tägliches Training?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {daysToExam !== null
                ? `Noch ${daysToExam} Tage bis zur Prüfung. Jeder Tag zählt.`
                : "Übe heute 10 Minuten und halte deine Serie am Leben."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="gradient">
                <Link to="/simulation">
                  <Mic className="h-4 w-4" /> Simulation starten
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/revision">
                  <Zap className="h-4 w-4" /> Schnellwiederholung
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <ProgressRing value={goalProgress} size={132} stroke={11}>
              <span className="text-2xl font-semibold tabular-nums">{todayXp}</span>
              <span className="text-xs text-muted-foreground">/ {goal} XP</span>
            </ProgressRing>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Flame} label="Serie" value={`${streak} ${streak === 1 ? "Tag" : "Tage"}`} accent="warning" hint="Tägliches Lernen" />
        <StatCard icon={Trophy} label="Level" value={info.level} accent="primary" hint={tier.name} />
        <StatCard icon={Target} label="Heute" value={`${todayXp} XP`} accent="accent" hint={`Ziel: ${goal} XP`} />
        <StatCard icon={BookOpen} label="Gemeistert" value={`${masteredCount}/${vocabulary.length}`} accent="success" hint="Vokabeln" />
      </div>

      {/* Level progress */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="min-w-[200px] flex-1">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold">
                Level {info.level} · <span className="text-muted-foreground">{tier.name}</span>
              </span>
              <span className="tabular-nums text-muted-foreground">{info.intoLevel} / {info.forLevel} XP</span>
            </div>
            <Progress value={info.progress * 100} />
          </div>
          {daysToExam !== null && (
            <Badge variant="accent" className="gap-1.5 py-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> {daysToExam} Tage bis zur Prüfung
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Daily modules */}
      <section>
        <SectionHeading eyebrow="Heute" title="Tägliche Übungen" description="Kurze Einheiten für aktives Erinnern und flüssiges Sprechen." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dailyModules.map((m, i) => (
            <motion.div
              key={m.to}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link to={m.to}>
                <Card className="card-hover group h-full">
                  <CardContent className="flex h-full flex-col gap-3 p-5">
                    <div className="flex items-center justify-between">
                      <div className="rounded-lg bg-primary/12 p-2.5 text-primary">
                        <m.icon className="h-5 w-5" />
                      </div>
                      <Badge variant="muted">{m.mins}</Badge>
                    </div>
                    <div className="mt-auto">
                      <p className="font-semibold">{m.label}</p>
                      <p className="text-sm text-muted-foreground">{m.desc}</p>
                    </div>
                    <span className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Starten <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Themes */}
      <section>
        <SectionHeading eyebrow="Themen" title="Prüfungsthemen" description="Realistische Situationen aus dem Berufsalltag mit Wortschatz, Redemitteln und Simulationen." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {themes.map((theme, i) => {
            const words = vocabByTheme(theme.id);
            const sims = scenariosByTheme(theme.id);
            const mastered = words.filter((w) => mastery(srs[w.id]) >= 0.8).length;
            const Icon = iconByName(theme.icon);
            return (
              <motion.div
                key={theme.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link to={`/vocabulary?theme=${theme.id}`}>
                  <Card className="card-hover group h-full overflow-hidden">
                    <div className={`h-1.5 w-full bg-gradient-to-r ${theme.accent}`} />
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
                          <span>{pct(mastered, words.length)}%</span>
                        </div>
                        <Progress value={pct(mastered, words.length)} className="h-1.5" />
                      </div>
                    </CardContent>
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
