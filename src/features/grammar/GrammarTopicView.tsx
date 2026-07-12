import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  GraduationCap,
  TriangleAlert,
} from "lucide-react";
import type { GrammarTopic } from "@/types";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EmptyState } from "@/components/shared/misc";
import { GrammarDrillCard } from "./GrammarDrillCard";
import { groupMeta, orderedGrammar } from "./grammarMeta";

/**
 * The Grammatik lesson page (Bibliothek redesign, session 93): one topic as a
 * focused read-then-practice flow. Hero (group tile, bilingual title,
 * purpose) → explanation with the Muster formula panel → Beispiele →
 * Typische Fehler → numbered Übungen with a live progress bar → prev/next
 * topic navigation along the B2-marker spine. Drill state is local to the
 * visit (remounted per topic via the `key`); XP stays inside GrammarDrillCard.
 */
export function GrammarTopicView({
  topic,
  onBack,
  onOpenTopic,
}: {
  topic: GrammarTopic;
  onBack: () => void;
  onOpenTopic: (id: string) => void;
}) {
  return <Lesson key={topic.id} topic={topic} onBack={onBack} onOpenTopic={onOpenTopic} />;
}

function Lesson({
  topic,
  onBack,
  onOpenTopic,
}: {
  topic: GrammarTopic;
  onBack: () => void;
  onOpenTopic: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const meta = groupMeta[topic.group];
  const idx = orderedGrammar.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? orderedGrammar[idx - 1] : undefined;
  const next = idx >= 0 && idx < orderedGrammar.length - 1 ? orderedGrammar[idx + 1] : undefined;

  // First-answer results per drill, so the section header can show live
  // progress. Never persisted: the lesson is a reading/practice surface, the
  // durable loop is the composed session.
  const [results, setResults] = useState<Record<string, boolean>>({});
  const answered = Object.keys(results).length;
  const correct = Object.values(results).filter(Boolean).length;
  const total = topic.drills.length;
  const done = total > 0 && answered === total;

  // Opening a topic (or jumping prev/next) keeps the list's scroll position
  // otherwise; a lesson should start at its title.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  const Icon = iconByName(meta.icon);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 sm:space-y-6"
    >
      {/* Top row: back to the topic grid + position on the topic spine. */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="h-4 w-4" /> Übersicht
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          Thema {idx + 1} von {orderedGrammar.length}
        </span>
      </div>

      {/* Hero */}
      <div className="flex items-start gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-12 sm:w-12">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            {topic.title}
          </p>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight sm:text-3xl">{topic.titleDe}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{topic.purposeDe}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {topic.cefr && <Badge variant="muted">{topic.cefr}</Badge>}
            {meta.labelDe !== topic.titleDe && <Badge variant="muted">{meta.labelDe}</Badge>}
            <Badge variant="muted">
              {total} Übung{total !== 1 ? "en" : ""}
            </Badge>
          </div>
        </div>
      </div>

      {/* Explanation + the Muster formula panel */}
      <Card>
        <CardContent className="space-y-4 p-5">
          <p className="text-sm leading-relaxed">{topic.explanation}</p>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Muster
            </p>
            <p className="mt-1 font-mono text-sm leading-relaxed">{topic.pattern}</p>
          </div>
        </CardContent>
      </Card>

      {/* Examples */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <BookMarked className="h-4 w-4 text-primary" /> Beispiele
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {topic.examples.map((ex, i) => (
            <Card key={i}>
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div>
                  <p className="font-medium">{ex.de}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{ex.en}</p>
                </div>
                <SpeakButton text={ex.de} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pitfalls */}
      {topic.pitfalls && topic.pitfalls.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 font-semibold">
            <TriangleAlert className="h-4 w-4 text-warning" /> Typische Fehler
          </h2>
          <ul className="space-y-2">
            {topic.pitfalls.map((p, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-2.5 text-sm"
              >
                <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Drills with a live answered-progress bar */}
      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="flex shrink-0 items-center gap-2 font-semibold">
            <GraduationCap className="h-4 w-4 text-primary" /> Übungen
          </h2>
          {total > 0 && (
            <>
              <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(answered / total) * 100}%` }}
                />
              </div>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {answered}/{total}
              </span>
            </>
          )}
        </div>
        {total > 0 ? (
          <div className="space-y-3">
            {topic.drills.map((d, i) => (
              <div key={d.id} className="space-y-1.5">
                <p className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Übung {i + 1}
                </p>
                <GrammarDrillCard
                  drill={d}
                  onResult={(correct) =>
                    setResults((r) => (d.id in r ? r : { ...r, [d.id]: correct }))
                  }
                />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={GraduationCap}
            title="Keine Übungen"
            description="Für dieses Thema gibt es noch keine Übungen."
          />
        )}

        {/* All drills answered: summarize and hand the learner the next topic
            on the priority spine, so the guided path continues in one tap. */}
        {done && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4"
          >
            <div>
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <CircleCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                Thema abgeschlossen
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {correct} von {total} richtig
              </p>
            </div>
            {next && (
              <Button size="sm" onClick={() => onOpenTopic(next.id)}>
                Weiter: {next.titleDe} <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </motion.div>
        )}
      </section>

      {/* Prev/next along the topic spine */}
      {(prev || next) && (
        <div className="grid grid-cols-2 gap-3">
          {prev ? (
            <button
              onClick={() => onOpenTopic(prev.id)}
              className="card-hover flex items-center gap-2 rounded-xl border border-border bg-surface p-3 text-left"
            >
              <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                  Zurück
                </span>
                <span className="block truncate text-sm font-semibold">{prev.titleDe}</span>
              </span>
            </button>
          ) : (
            <span />
          )}
          {next ? (
            <button
              onClick={() => onOpenTopic(next.id)}
              className="card-hover flex items-center justify-end gap-2 rounded-xl border border-border bg-surface p-3 text-right"
            >
              <span className="min-w-0">
                <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                  Weiter
                </span>
                <span className="block truncate text-sm font-semibold">{next.titleDe}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          ) : (
            <span />
          )}
        </div>
      )}

      <Button asChild variant="gradient" className="w-full sm:w-auto">
        <Link to="/quiz">Wissen im Quiz testen</Link>
      </Button>
    </motion.div>
  );
}
