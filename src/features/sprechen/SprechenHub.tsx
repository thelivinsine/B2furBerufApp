import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Mic, Play, RotateCw, Star } from "lucide-react";
import { scenarios } from "@/data/dialogues";
import { speakingBrief } from "@/engine/speaking";
import { XP } from "@/engine/scoring";
import type { Scenario } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BackToPruefung } from "@/features/writing/bottomChrome";
import { ConversationRunner } from "./ConversationRunner";
import { cn } from "@/lib/utils";

/**
 * The free Sprechtrainer (s193): pick a situation, then talk to an AI partner.
 *
 * Practice always runs as the chat thread (founder s193), so this hub hands the
 * runner a brief whose stage is "gespraech" and never asks the learner to pick
 * a layout: which layout a task uses is a property of the task, not a setting.
 *
 * It is the Sprechen module WITHOUT a clock, so three things follow (s194
 * audit): it carries the same Zurück back to the Prüfung hub the Schreibtrainer
 * got in s192 (P10); it reads the `?level=` the hub hands it, so the Niveau
 * chosen there is not silently dropped on the way in (P11); and no HubHero,
 * because this zone's header is the hub's switcher (P22).
 */

const LEVELS = [
  { level: 1, label: "Einsteiger", band: "B1" },
  { level: 2, label: "Mittelstufe", band: "B2" },
  { level: 3, label: "Fortgeschritten", band: "C1" },
] as const;

/** The hub's Niveau, mapped onto the scenarios' own 1-3 ladder. */
const LEVEL_BY_BAND: Record<string, number> = { A2: 1, B1: 1, B2: 2, C1: 3 };

export function SprechenHub() {
  const [params, setParams] = useSearchParams();
  const scenariosDone = useProgressStore((s) => s.scenariosDone);
  const completeScenario = useProgressStore((s) => s.completeScenario);
  const registerSession = useProgressStore((s) => s.registerSession);
  const addXp = useProgressStore((s) => s.addXp);

  // Both the running scenario and the scope live in the URL, so a reload, a
  // share and the browser's back button all land where the learner was.
  const activeId = params.get("sz");
  const active = useMemo(
    () => scenarios.find((s) => s.id === activeId) ?? null,
    [activeId],
  );
  const band = params.get("level") ?? "";
  const wanted = LEVEL_BY_BAND[band] ?? null;

  const setActive = (sc: Scenario | null) => {
    const p = new URLSearchParams(params);
    if (sc) p.set("sz", sc.id);
    else p.delete("sz");
    setParams(p, { replace: !sc });
  };

  const setBand = (next: string) => {
    const p = new URLSearchParams(params);
    if (next) p.set("level", next);
    else p.delete("level");
    setParams(p, { replace: true });
  };

  const byLevel = useMemo(
    () =>
      LEVELS.filter((l) => wanted == null || l.level === wanted)
        .map((l) => ({ ...l, items: scenarios.filter((s) => s.level === l.level) }))
        .filter((x) => x.items.length > 0),
    [wanted],
  );

  if (active) {
    return (
      <div className="mx-auto flex h-page-stage w-full max-w-2xl flex-col">
        <ConversationRunner
          brief={speakingBrief(active)}
          onExit={() => setActive(null)}
          onFinished={() => {
            // Marked done when the debrief lands, not when the learner leaves,
            // so closing the tab on the feedback screen still counts the work.
            // It pays too, since s194 (audit P19): a graded conversation used to
            // award nothing while a single flashcard awarded 6.
            completeScenario(active.id);
            addXp(XP.scenarioComplete);
            registerSession();
          }}
        />
      </div>
    );
  }

  const recommendedId = scenarios.find((s) => !scenariosDone.includes(s.id))?.id;

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* The scope row, in the Prüfung hub's shape: the Niveau it was opened
          with, and the one way back. */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-sm text-muted-foreground">Niveau</span>
          <button
            type="button"
            onClick={() => setBand("")}
            aria-pressed={!band}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
              !band ? "bg-accent/30 text-accent-ink" : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            Alle
          </button>
          {LEVELS.map((l) => (
            <button
              key={l.band}
              type="button"
              onClick={() => setBand(l.band)}
              aria-pressed={band === l.band}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold tabular-nums transition-colors",
                band === l.band
                  ? "bg-accent/30 text-accent-ink"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {l.band}
            </button>
          ))}
        </div>
        <BackToPruefung />
      </div>

      {byLevel.map(({ level, label, items }) => (
        <section key={level} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {label}
            </h2>
            <Badge variant="muted">{items.length}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((sc, i) => {
              const done = scenariosDone.includes(sc.id);
              const recommended = sc.id === recommendedId;
              return (
                <motion.div
                  key={sc.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.05, 0.2) }}
                >
                  <Card
                    className={cn(
                      "card-hover h-full cursor-pointer",
                      recommended && "ring-1 ring-primary/50 shadow-glow",
                      done && !recommended && "ring-1 ring-success/40",
                    )}
                    onClick={() => setActive(sc)}
                  >
                    <CardContent className="flex h-full flex-col gap-3 p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300">
                          <Mic className="h-5 w-5" />
                        </div>
                        <div className="flex gap-1.5">
                          {recommended && <Badge variant="accent">Empfohlen</Badge>}
                          {done && <Badge variant="success">Erledigt</Badge>}
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold leading-snug">{sc.title}</p>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{sc.task}</p>
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {sc.minutes} Min
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          {sc.targetRedemittel.length} Redemittel
                        </span>
                        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2">
                          {done ? <RotateCw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {done ? "Wiederholen" : "Starten"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
