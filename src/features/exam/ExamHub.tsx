import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Clock, ChevronRight, ListChecks, RotateCw } from "lucide-react";
import { examSets } from "@/data/examSets";
import { scenarioById } from "@/data/dialogues";
import type { ExamSet } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/shared/misc";
import { useProgressStore } from "@/store/useProgressStore";
import { ExamRunner } from "./ExamRunner";

export function ExamHub() {
  const [active, setActive] = useState<ExamSet | null>(null);
  const examsDone = useProgressStore((s) => s.examsDone);

  if (active) {
    const scenario = scenarioById(active.scenarioId);
    if (!scenario) return null;
    return <ExamRunner examSet={active} scenario={scenario} onBack={() => setActive(null)} />;
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Prüfungsmodus"
        title="Prüfungssimulation"
        description="Vollständige Simulation des B2-Beruf-Prüfungsmoduls unter realistischen Bedingungen – mit Aufgabenblatt, Zeitlimit und Bewertungsraster."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {examSets.map((ex, i) => {
          const lastAttempt = [...examsDone].reverse().find((e) => e.id === ex.id);
          return (
            <motion.div
              key={ex.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card className="card-hover h-full cursor-pointer" onClick={() => setActive(ex)}>
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    {lastAttempt && (
                      <Badge variant="success">{lastAttempt.score}% erreicht</Badge>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold leading-snug">{ex.title}</p>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{ex.taskSheet}</p>
                  </div>
                  <div className="space-y-1.5 border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground">Aspekte</p>
                    {ex.aspects.map((a) => (
                      <div key={a} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ListChecks className="h-3.5 w-3.5 shrink-0" /> {a}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {ex.totalMinutes} Min
                    </div>
                    <Button size="sm" variant="ghost" className="h-7 gap-1 px-2">
                      {lastAttempt ? <RotateCw className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      {lastAttempt ? "Wiederholen" : "Starten"}
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
          <p className="text-sm font-semibold">Bewertungskriterien</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {examSets[0].rubric.map((r) => (
              <div key={r.id} className="text-sm">
                <span className="font-medium">{r.label}: </span>
                <span className="text-muted-foreground">{r.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
