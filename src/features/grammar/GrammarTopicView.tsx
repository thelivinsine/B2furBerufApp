import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleCheck,
  GraduationCap,
  TriangleAlert,
  Zap,
} from "lucide-react";
import type { GrammarExample, GrammarTopic } from "@/types";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EmptyState } from "@/components/shared/misc";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { EnPeek } from "./EnPeek";
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
  const navigate = useNavigate();
  const meta = groupMeta[topic.group];
  const idx = orderedGrammar.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? orderedGrammar[idx - 1] : undefined;
  const next = idx >= 0 && idx < orderedGrammar.length - 1 ? orderedGrammar[idx + 1] : undefined;

  // First-answer results per drill, so the section header can show live
  // progress. Never persisted: the lesson is a reading/practice surface, the
  // durable loop is the composed session.
  const [results, setResults] = useState<Record<string, boolean>>({});
  // The explanation starts collapsed (founder s93 follow-up: the lesson had
  // too much text up front); the Muster formula leads instead.
  const [explainOpen, setExplainOpen] = useState(false);
  const answered = Object.keys(results).length;

  // Hold-to-peek English (founder s93: the lesson text is German-first, the
  // EN chip reveals the translation only while pressed). One peek state per
  // block; examples and drills manage their own.
  const [peekExplain, setPeekExplain] = useState(false);
  const [peekPitfalls, setPeekPitfalls] = useState(false);

  // Render-time structure (founder s93 follow-up: the Muster read as one mush
  // and the explanation as one chunk). The bank authors `pattern` as variants
  // separated by " · " and the explanation as compact prose; split both into
  // scannable lines. Sentence split is safe for the bank's authored style (no
  // dotted abbreviations); anything unsplittable falls back to one line.
  const patternVariants = topic.pattern.split(" · ");
  const explainText = peekExplain ? topic.explanation : (topic.explanationDe ?? topic.explanation);
  const explainPoints = explainText.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [explainText];
  const pitfallList = peekPitfalls ? topic.pitfalls : (topic.pitfallsDe ?? topic.pitfalls);
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
      {/* The Bibliothek tabs stay on top inside the lesson too (founder s93
          follow-up: the lesson had no navigation). Tapping Grammatik doubles
          as a way back to the topic grid (the link drops `?topic=`). */}
      <LibrarySwitcher />

      {/* Top row: back to the topic grid + position on the topic spine. */}
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
          <ArrowLeft className="h-4 w-4" /> Übersicht
        </Button>
        <span className="text-xs tabular-nums text-muted-foreground">
          Thema {idx + 1} von {orderedGrammar.length}
        </span>
      </div>

      {/* Hero: icon + German title, nothing else (founder s93 follow-ups: no
          duplicate German/English description, no meta badge row; the topic is
          described ONCE, in the card below, and the drill count already shows
          in the Übungen progress). */}
      <div className="flex items-center gap-3.5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 sm:h-12 sm:w-12">
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </span>
        <h1 className="min-w-0 text-2xl font-bold tracking-tight sm:text-3xl">{topic.titleDe}</h1>
      </div>

      {/* Muster first (the fastest-scan artifact), one variant per row, then
          the explanation as sentence bullets: the first point up front, the
          rest behind a quiet expander. */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3.5 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Muster
            </p>
            <div className="mt-1.5 space-y-1.5">
              {patternVariants.map((v, i) => (
                <p key={i} className="flex items-start gap-2 font-mono text-sm leading-relaxed">
                  {patternVariants.length > 1 && (
                    <span
                      aria-hidden
                      className="mt-2 h-1 w-1 shrink-0 rounded-full bg-emerald-500/70"
                    />
                  )}
                  <span className="min-w-0">{v}</span>
                </p>
              ))}
            </div>
          </div>
          {/* Paragraph block: German bullets, the EN chip in ITS top-right
              corner (founder: on the paragraph, not the tile). */}
          <div className="flex items-start gap-2">
            <ul className="min-w-0 flex-1 space-y-2">
              {(explainOpen ? explainPoints : explainPoints.slice(0, 1)).map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                  <span
                    aria-hidden
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/50"
                  />
                  <span className="min-w-0">{s}</span>
                </li>
              ))}
            </ul>
            {topic.explanationDe && <EnPeek active={peekExplain} onChange={setPeekExplain} />}
          </div>
          {/* Expander in the tile's bottom-right corner (founder follow-up). */}
          {explainPoints.length > 1 && (
            <div className="flex justify-end">
              <button
                onClick={() => setExplainOpen((o) => !o)}
                aria-expanded={explainOpen}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
              >
                {explainOpen ? (
                  <>
                    Weniger anzeigen <ChevronUp className="h-3.5 w-3.5" />
                  </>
                ) : (
                  <>
                    Mehr anzeigen <ChevronDown className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Examples */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-semibold">
          <BookMarked className="h-4 w-4 text-primary" /> Beispiele
        </h2>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {topic.examples.map((ex, i) => (
            <ExampleCard key={i} example={ex} />
          ))}
        </div>
      </section>

      {/* Pitfalls */}
      {pitfallList && pitfallList.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 font-semibold">
              <TriangleAlert className="h-4 w-4 text-warning" /> Typische Fehler
            </h2>
            {topic.pitfallsDe && <EnPeek active={peekPitfalls} onChange={setPeekPitfalls} />}
          </div>
          <ul className="space-y-2">
            {pitfallList.map((p, i) => (
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
                  glossPeek
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

      {/* Üben, same placement language as the hub (founder s93 follow-up: the
          lesson had no Üben button): inline on desktop, a sticky bottom action
          bar above the nav on mobile. Replaces the old /quiz CTA (the retired
          /quiz route stays reachable via practiceAreas). */}
      <Button
        variant="gradient"
        className="hidden w-full sm:w-auto lg:inline-flex"
        onClick={() => navigate("/session")}
      >
        <Zap className="h-3.5 w-3.5" /> Üben
      </Button>

      <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
        <Button
          variant="gradient"
          className="h-11 w-full rounded-xl text-base"
          onClick={() => navigate("/session")}
        >
          <Zap className="h-4 w-4" /> Üben
        </Button>
      </div>
    </motion.div>
  );
}

/** One example sentence: German by default, the English gloss only while the
 *  EN chip is held (founder s93: English is a peek across the lesson). */
function ExampleCard({ example }: { example: GrammarExample }) {
  const [peek, setPeek] = useState(false);
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-2 p-4">
        <div className="min-w-0">
          <p className="font-medium">{example.de}</p>
          {peek && <p className="mt-0.5 text-sm text-muted-foreground">{example.en}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <EnPeek active={peek} onChange={setPeek} />
          <SpeakButton text={example.de} />
        </div>
      </CardContent>
    </Card>
  );
}
