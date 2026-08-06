import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Play, RotateCw, Star } from "lucide-react";
import { scenarios } from "@/data/dialogues";
import { speakingBrief } from "@/engine/speaking";
import { XP } from "@/engine/scoring";
import type { Scenario } from "@/types";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LevelSelect } from "@/features/pruefung/LevelSelect";
import { ModuleHeader } from "@/features/pruefung/ModuleHeader";
import { PART_META } from "@/features/exam/partMeta";
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

/** The module mark, so this page's cards match the hub's Sprechen tile. */
const SprechenMark = PART_META.sprechen.icon;

export function SprechenHub() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const scenariosDone = useProgressStore((s) => s.scenariosDone);
  const completeScenario = useProgressStore((s) => s.completeScenario);
  const registerSession = useProgressStore((s) => s.registerSession);
  const addXp = useProgressStore((s) => s.addXp);
  const setZoneExit = useSessionStore((s) => s.setZoneExit);
  /** True once the learner is actually talking, so leaving would lose the run. */
  const [talking, setTalking] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Both the running scenario and the scope live in the URL, so a reload, a
  // share and the browser's back button all land where the learner was.
  const activeId = params.get("sz");
  const active = useMemo(
    () => scenarios.find((s) => s.id === activeId) ?? null,
    [activeId],
  );
  const band = params.get("level") ?? "";
  const wanted = LEVEL_BY_BAND[band] ?? null;

  const setActive = useCallback(
    (sc: Scenario | null) => {
      const p = new URLSearchParams(params);
      if (sc) p.set("sz", sc.id);
      else p.delete("sz");
      setParams(p, { replace: !sc });
    },
    [params, setParams],
  );

  /**
   * The zone's one exit, in the shell's top-right corner like every other
   * Prüfung screen (founder s195). It replaces the pill that used to sit above
   * the list, and it covers the running conversation, which had no way out at
   * all.
   *
   * From the list it leaves for the hub; from a conversation it steps back to
   * the list, because that is the screen the learner came from. A conversation
   * that has started asks first: unlike a writing draft it is not autosaved and
   * cannot be resumed, so leaving really does throw the run away (founder s195:
   * the confirm appears when there is unsaved progress, and only then).
   */
  useEffect(() => {
    setZoneExit({
      tone: "quiet",
      run: () => {
        if (!activeId) return navigate("/anwenden");
        if (talking) return setConfirmOpen(true);
        setActive(null);
      },
    });
    return () => setZoneExit(null);
  }, [activeId, talking, navigate, setActive, setZoneExit]);

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

  /** Honest counts per Niveau, the same contract the hub's list follows. */
  const levelOptions = useMemo(
    () => [
      { value: "", label: "Alle", note: `${scenarios.length} Situationen` },
      ...LEVELS.map((l) => {
        const n = scenarios.filter((s) => s.level === l.level).length;
        return {
          value: l.band,
          label: l.band,
          note: n === 0 ? "keine Inhalte" : `${n} Situationen`,
          empty: n === 0,
        };
      }),
    ],
    [],
  );

  /**
   * Asked before a started conversation is thrown away. The exam's own confirm
   * lives with the runner; this one belongs here because this screen owns the
   * decision to leave (the runner is also the exam's, where leaving means
   * something else).
   */
  const leaveDialog = (
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="gap-3">
        <DialogHeader>
          <DialogTitle className="pr-8 text-base">Gespräch verlassen?</DialogTitle>
          <DialogDescription>
            Dein Fortschritt wird nicht gespeichert. Möchtest du wirklich zurück?
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2.5">
          <Button variant="outline" className="flex-1" onClick={() => setConfirmOpen(false)}>
            Weiter sprechen
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            onClick={() => {
              setConfirmOpen(false);
              setActive(null);
            }}
          >
            Verlassen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (active) {
    return (
      <div className="mx-auto flex h-page-stage w-full max-w-2xl flex-col gap-3">
        {leaveDialog}
        <ConversationRunner
          brief={speakingBrief(active)}
          // Mobile carries the module row on every screen of the zone (founder
          // s195); in the exam this same slot is the RunBar.
          header={<ModuleHeader part="sprechen" />}
          onBusyChange={setTalking}
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
    // The zone's column at rest (founder s195, shared rule 1): the same 896px
    // the hub uses, so stepping from the hub into this list does not change the
    // page's width. It was the full 1152px shell column before.
    <div className="mx-auto w-full max-w-4xl space-y-5 sm:space-y-8">
      {leaveDialog}
      {/* Mobile: the module row every screen of the zone carries. */}
      <ModuleHeader part="sprechen" />

      {/* The scope row, in the Prüfung hub's shape: ONE Niveau control, the same
          compact dropdown the hub uses (founder s195). A second row of level
          pills here was the zone's third header language. */}
      <div className="flex items-center justify-center">
        <LevelSelect
          // A2 has no speaking pool of its own (it shares the Einsteiger set),
          // so the hub's A2 shows here as the band that actually serves it.
          value={band === "A2" ? "B1" : band}
          options={levelOptions}
          onSelect={setBand}
        />
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
                        {/* The module's own mark (founder s195, shared rule 5):
                            Sprechen was one colour on the hub and another here. */}
                        <div
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                            PART_META.sprechen.tile,
                          )}
                        >
                          <SprechenMark className={cn("h-5 w-5", PART_META.sprechen.ink)} />
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
