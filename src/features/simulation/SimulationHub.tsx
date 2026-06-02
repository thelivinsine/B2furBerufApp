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
const levelVariant = ["", "muted", "default", "accent"] as const;

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

  return (
    <div className="space-y-6">
      <HubHero
        icon={Mic}
        gradient="from-cyan-500 to-sky-500"
        eyebrow="Sprechsimulation"
        title="Lösung finden"
        description={'Simuliere das Prüfungsmodul „Lösung finden mit einer/einem Partner:in“ – mit branching Dialogen, Hinweisen und Coaching-Feedback.'}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((sc, i) => {
          const done = scenariosDone.includes(sc.id);
          return (
            <motion.div
              key={sc.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className={cn("card-hover h-full cursor-pointer", done && "ring-1 ring-success/40")} onClick={() => setActive(sc)}>
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <Mic className="h-5 w-5" />
                    </div>
                    <div className="flex gap-1.5">
                      {done && <Badge variant="success">Erledigt</Badge>}
                      <Badge variant={levelVariant[sc.level] as "muted" | "default" | "accent"}>{levelLabel[sc.level]}</Badge>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold leading-snug">{sc.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{sc.task}</p>
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

      <Card className="bg-mesh">
        <CardContent className="p-5">
          <p className="text-sm font-semibold">Tipps für die Simulation</p>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>• Lies den Kontext sorgfältig durch, bevor du startest.</li>
            <li>• Nutze die Hinweis-Funktion nur wenn nötig — Hinweise reduzieren die Punktzahl leicht.</li>
            <li>• Beim freien Sprechen: Tippe deine Antwort oder sprich laut und bestätige dann.</li>
            <li>• Schaue dir das Coaching-Feedback nach jeder Option an.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
