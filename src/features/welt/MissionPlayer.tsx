import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Zap, KeyRound } from "lucide-react";
import type { Mission } from "@/types/game";
import {
  startMission,
  currentScene,
  type MissionRun,
  type MissionEffect,
} from "@/engine/mission";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { keyItemById } from "@/data/missions";
import { Gloss } from "@/features/shared/Gloss";
import { CutsceneView, WebsiteView, LoadoutView, ListeningView, FormView } from "@/features/welt/scenes";
import { BattleView } from "@/features/welt/BattleView";
import { GameCard, Pill } from "@/features/welt/stage";

/**
 * The mission player (game G1): holds the pure `MissionRun`, applies each
 * transition's effects to the REAL stores (one shared progression state,
 * implementation-plan decision 4), and renders the current scene through the
 * kind-matched renderer. Plays as a full-screen stage: focus mode hides the
 * app chrome exactly like `/session` (AppShell gates on `/welt` too).
 */
export function MissionPlayer({ mission, onExit }: { mission: Mission; onExit: () => void }) {
  const addXp = useProgressStore((s) => s.addXp);
  const reviewVocab = useProgressStore((s) => s.reviewVocab);
  const practiceRedemittel = useProgressStore((s) => s.practiceRedemittel);
  const grantKeyItems = useProgressStore((s) => s.grantKeyItems);
  const completeMission = useProgressStore((s) => s.completeMission);
  const registerSession = useProgressStore((s) => s.registerSession);
  const setFocusMode = useSessionStore((s) => s.setFocusMode);

  // Build once on mount: the bag/replay snapshot is taken at mission start
  // (a plain getState read, no subscription: nothing here re-renders on
  // store changes the mission itself causes).
  const [run, setRun] = useState<MissionRun>(() => {
    const s = useProgressStore.getState();
    return startMission(mission, s.keyItems, s.missionsDone.includes(mission.id));
  });

  useEffect(() => {
    setFocusMode(true);
    return () => setFocusMode(false);
  }, [setFocusMode]);

  const applyEffects = (effects: MissionEffect[]) => {
    for (const e of effects) {
      switch (e.type) {
        case "xp":
          addXp(e.amount);
          break;
        case "vocabGrade":
          reviewVocab(e.vocabId, e.grade);
          break;
        case "redemittelPractice":
          practiceRedemittel(e.redemittelId);
          break;
        case "keyItems":
          grantKeyItems(e.itemIds);
          break;
        case "missionComplete":
          completeMission(e.missionId);
          registerSession();
          break;
      }
    }
  };

  /**
   * Apply a pure runner transition, then its effects. Runs entirely inside
   * the event handler: the effects must NOT live in the setState updater,
   * which React requires to be pure and double-invokes under StrictMode
   * (that would double-apply XP and FSRS grades).
   */
  const act = (fn: (r: MissionRun) => MissionRun) => {
    const next = fn(run);
    if (next !== run) applyEffects(next.effects);
    setRun(next);
  };

  if (run.done) {
    return <VictoryScreen run={run} onExit={onExit} />;
  }

  const scene = currentScene(run);
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onExit}
          aria-label="Mission verlassen"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-soft hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-foreground/80">
          {mission.title}
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-xs font-bold text-primary shadow-soft">
          <Zap className="h-3.5 w-3.5" /> {run.xp}
        </span>
      </div>

      <motion.div
        key={run.sceneId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* the keyed motion.div above remounts each view per scene, so the
            views' local state (line index, picks) resets on every transition */}
        {scene.kind === "cutscene" && <CutsceneView scene={scene} act={act} />}
        {scene.kind === "websiteParody" && <WebsiteView scene={scene} act={act} />}
        {scene.kind === "loadout" && <LoadoutView scene={scene} run={run} act={act} />}
        {scene.kind === "listening" && <ListeningView scene={scene} act={act} />}
        {scene.kind === "dialogueBattle" && <BattleView scene={scene} run={run} act={act} />}
        {scene.kind === "formCloze" && <FormView scene={scene} act={act} />}
      </motion.div>
    </div>
  );
}

/**
 * The victory loot screen. The one game surface allowed to use the reserved
 * reward-gold tokens: a completed mission IS a loot moment.
 */
function VictoryScreen({ run, onExit }: { run: MissionRun; onExit: () => void }) {
  const rewards = run.replay
    ? []
    : (run.mission.rewardItems ?? [])
        .map((id) => keyItemById.get(id))
        .filter((k): k is NonNullable<typeof k> => !!k);

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col items-center justify-center gap-4 py-8">
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-semibold uppercase tracking-widest text-muted-foreground"
      >
        Mission geschafft
      </motion.p>
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="text-center text-2xl font-bold text-foreground"
      >
        {run.mission.title}
      </motion.h2>

      {rewards.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.85, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 250, damping: 20 }}
          className="w-full max-w-xs"
        >
          <GameCard className="space-y-2 border-2 border-reward/60 bg-reward-bg p-5 text-center">
            <KeyRound className="mx-auto h-8 w-8 text-reward" />
            <p className="text-xs font-semibold uppercase tracking-widest text-reward">
              Schlüssel-Dokument
            </p>
            <p className="text-lg font-bold text-slate-800">
              <Gloss de={item.de} en={item.en} />
            </p>
            <p className="text-sm text-slate-600">
              <Gloss de={item.desc.de} en={item.desc.en} />
            </p>
          </GameCard>
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col items-center gap-3"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-4 py-1.5 text-sm font-bold text-primary shadow-soft">
          <Zap className="h-4 w-4" /> +{run.xp} XP
        </span>
        <Pill primary onClick={onExit} className="px-6 py-2.5">
          Zurück nach Neustadt
        </Pill>
      </motion.div>
    </div>
  );
}
