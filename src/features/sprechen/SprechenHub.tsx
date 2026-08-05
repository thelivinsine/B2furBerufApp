import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Mic, Play, RotateCw, Star } from "lucide-react";
import { scenarios } from "@/data/dialogues";
import { speakingBrief } from "@/engine/speaking";
import type { Scenario } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HubHero } from "@/components/shared/HubHero";
import { ConversationRunner } from "./ConversationRunner";
import { cn } from "@/lib/utils";

/**
 * The free Sprechtrainer (s191): pick a situation, then talk to an AI partner.
 *
 * Practice always runs as the chat thread (founder s191), so this hub hands the
 * runner a brief whose stage is "gespraech" and never asks the learner to pick
 * a layout: which layout a task uses is a property of the task, not a setting.
 */

const levelLabel = ["", "Einsteiger", "Mittelstufe", "Fortgeschritten"] as const;

export function SprechenHub() {
  const [active, setActive] = useState<Scenario | null>(null);
  const scenariosDone = useProgressStore((s) => s.scenariosDone);
  const completeScenario = useProgressStore((s) => s.completeScenario);
  const registerSession = useProgressStore((s) => s.registerSession);

  const byLevel = useMemo(
    () =>
      [1, 2, 3]
        .map((level) => ({ level, items: scenarios.filter((s) => s.level === level) }))
        .filter((x) => x.items.length > 0),
    [],
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
            completeScenario(active.id);
            registerSession();
          }}
        />
      </div>
    );
  }

  const recommendedId = scenarios.find((s) => !scenariosDone.includes(s.id))?.id;

  return (
    <div className="space-y-5 sm:space-y-8">
      <HubHero icon={Mic} gradient="from-cyan-500 to-sky-500" eyebrow="Anwenden" title="Sprechen" />

      {byLevel.map(({ level, items }) => (
        <section key={level} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {levelLabel[level]}
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
