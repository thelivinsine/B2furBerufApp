import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Flame, BookOpen, ArrowRight, CalendarDays, Sparkles, Zap } from "lucide-react";
import { themes } from "@/data/themes";
import { vocabByTheme } from "@/data/vocabulary";
import { scenariosByTheme } from "@/data/dialogues";
import { iconByName } from "@/lib/icons";
import { useProgressStore, useTodayXp, useEffectiveStreak } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { mastery, dueCount } from "@/engine/srs";
import { sessionPreview } from "@/engine/session";
import { daysBetween, pct, todayKey, cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/misc";
import { intentCardsForMode, type IntentCard } from "./intentCards";

/** Where a Situationen chip launches: a scoped session for theme cards, else
 *  the card's own target (writing / redemittel). */
function chipTarget(card: IntentCard): string {
  if (card.vocab?.theme) return `/session?theme=${card.vocab.theme}`;
  return card.to;
}

export function Dashboard() {
  const name = useSettingsStore((s) => s.name);
  const learningMode = useSettingsStore((s) => s.mode);
  const examDate = useSettingsStore((s) => s.examDate);
  const goal = useSettingsStore((s) => s.dailyGoalXp);
  const streak = useEffectiveStreak();
  const srs = useProgressStore((s) => s.srs);
  const todayXp = useTodayXp();

  const goalPercent = Math.round(Math.min(todayXp / goal, 1) * 100);
  const daysToExam = examDate ? Math.max(0, daysBetween(todayKey(), examDate)) : null;
  const due = dueCount(srs);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Guten Morgen" : hour < 18 ? "Hallo" : "Guten Abend";

  // Composed-session preview for the primary CTA hero (deterministic, so the
  // line is stable across renders and matches what /session builds).
  const sessionMinutes = Math.max(5, Math.round(goal / 8));
  const preview = sessionPreview({ srs, minutes: sessionMinutes });

  // Mode-aware situation shortcuts: 3 compact chips launching scoped sessions.
  const situations = intentCardsForMode(learningMode).slice(0, 3);

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
      {/* Primary CTA — the one composed session for today (UX overhaul Phase 1).
          One tap into an interleaved run; browsing stays below. */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {greeting}, {name || "Lernende:r"} 👋
        </p>
        <Link to="/session" className="mt-2 block">
          <div className="card-hover relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-5 text-white shadow-soft sm:p-6">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/80">
                <Sparkles className="h-3.5 w-3.5" /> Deine Session · ~{sessionMinutes} Min
              </div>
              <p className="mt-1.5 text-xl font-semibold leading-snug">
                {preview.hasHistory ? "Weiter, wo du warst" : "Leg direkt los"}
              </p>
              <p className="mt-1 text-sm text-white/85">{preview.preview}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-600 shadow-soft">
                  <Zap className="h-4 w-4" /> Session starten
                </span>
                {due > 0 && (
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium">
                    {due} fällig
                  </span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>

      {/* Situationen — compact shortcuts that launch a scoped session. */}
      <section>
        <SectionHeading
          eyebrow="Situationen"
          title="Aus einer echten Situation üben"
          description="Wähle einen Kontext. Wir stellen dir dazu eine kurze, gemischte Runde zusammen."
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {situations.map((card, i) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={chipTarget(card)}>
                <div className="card-hover flex h-full items-center gap-3 rounded-xl border border-border bg-surface p-3.5">
                  <div className={cn("h-9 w-1.5 shrink-0 rounded-full bg-gradient-to-b", card.accent)} />
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {card.eyebrowDe}
                    </p>
                    <p className="truncate text-sm font-semibold">{card.titleDe}</p>
                  </div>
                  <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Compact progress summary — just enough to orient + a primary action.
          The full breakdown (XP charts, mastery, streak record) lives on the
          Fortschritt page, linked here. */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5 sm:px-5">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 shrink-0 text-warning" />
            <span className="text-sm">
              <span className="font-semibold tabular-nums">{streak}</span>{" "}
              <span className="text-muted-foreground">{streak === 1 ? "Tag Serie" : "Tage Serie"}</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-success" />
            <span className="text-sm">
              <span className="font-semibold tabular-nums">{todayXp}</span>
              <span className="text-muted-foreground"> / {goal} XP heute · {goalPercent}%</span>
            </span>
          </div>
          {daysToExam !== null && (
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 shrink-0 text-accent" />
              <span className="text-sm">
                <span className="font-semibold tabular-nums">{daysToExam}</span>{" "}
                <span className="text-muted-foreground">Tage bis Prüfung</span>
              </span>
            </div>
          )}

          <div className="ml-auto flex items-center gap-2">
            <Button asChild size="sm" variant="outline">
              <Link to="/revision">
                <Zap className="h-4 w-4" /> Schnelle Runde
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link to="/analytics">
                Fortschritt <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      {/* Themes — the main browse surface, with one featured (larger) card. */}
      <section>
        <SectionHeading
          eyebrow="Themen"
          title="Deine Themen"
          description="Realistische Situationen aus Beruf und Alltag mit Wortschatz, Redemitteln und Simulationen."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/vocabulary">
                Wortschatz ansehen <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                        <p className="mt-1 text-sm text-muted-foreground">{theme.blurbDe}</p>
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
                          <p className="line-clamp-2 text-sm text-muted-foreground">{theme.blurbDe}</p>
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
