import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Play, Star, Clock, ChevronRight, RotateCw } from "lucide-react";
import { scenarios } from "@/data/dialogues";
import type { Scenario } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HubHero } from "@/components/shared/HubHero";
import { useProgressStore } from "@/store/useProgressStore";
import { SimulationRunner } from "./SimulationRunner";
import { cn } from "@/lib/utils";

const levelLabel = ["", "Einsteiger", "Mittelstufe", "Fortgeschritten"] as const;

export function SimulationHub() {
  const [active, setActive] = useState<Scenario | null>(null);
  const scenariosDone = useProgressStore((s) => s.scenariosDone);

  if (active) {
    return (
      <SimulationRunner
        scenario={active}
        onBack={() => setActive(null)}
      />
    );
  }

  // First not-yet-completed scenario (level order) — surfaced as "Empfohlen".
  const recommendedId = scenarios.find((s) => !scenariosDone.includes(s.id))?.id;
  const byLevel = [1, 2, 3]
    .map((level) => ({ level, items: scenarios.filter((s) => s.level === level) }))
    .filter((x) => x.items.length > 0);

  return (
    <div className="space-y-5 sm:space-y-8">
      <HubHero
        icon={Mic}
        gradient="from-cyan-500 to-sky-500"
        eyebrow="Sprechsimulation"
        title="Lösung finden"
        description={'Simuliere das Prüfungsmodul „Lösung finden mit einer/einem Partner:in“ – mit branching Dialogen, Hinweisen und Coaching-Feedback.'}
      />

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
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
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
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {sc.minutes} Min
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5" />
                          {sc.targetRedemittel.length} Redemittel
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 gap-1 px-2">
                          {done ? <RotateCw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                          {done ? "Wiederholen" : "Starten"}
                          <ChevronRight className="h-3.5 w-3.5" />
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

      <Card className="bg-mesh">
        <CardContent className="p-5">
          <p className="text-sm font-semibold">Tipps für die Simulation</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Lies den Kontext sorgfältig durch, bevor du startest.</li>
            <li>• Nutze die Hinweis-Funktion nur wenn nötig. Hinweise reduzieren die Punktzahl leicht.</li>
            <li>• Beim freien Sprechen: Tippe deine Antwort oder sprich laut und bestätige dann.</li>
            <li>• Schaue dir das Coaching-Feedback nach jeder Option an.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
