import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Zap, KeyRound } from "lucide-react";
import type { Mission } from "@/types/game";
import {
  startMission,
  currentScene,
  currentBattleNode,
  handItem,
  admitMissing,
  useDictionary,
  type MissionRun,
  type MissionEffect,
} from "@/engine/mission";
import { useProgressStore } from "@/store/useProgressStore";
import { useSessionStore } from "@/store/useSessionStore";
import { keyItemById, npcById } from "@/data/missions";
import { cn } from "@/lib/utils";
import { Gloss } from "@/features/shared/Gloss";
import { CutsceneView, WebsiteView, LoadoutView, ListeningView, HotspotView, AutomatView, FormView } from "@/features/welt/scenes";
import { BattleView } from "@/features/welt/BattleView";
import {
  GameCard,
  Pill,
  BAG_SPRITE,
  DICT_SPRITE,
  DOC_ICONS,
  DOC_ICON_FALLBACK,
  GAME_BG,
  GAME_OUT,
} from "@/features/welt/stage";

/**
 * The mission player (game G1; full-screen pass s74): holds the pure
 * `MissionRun`, applies each transition's effects to the REAL stores (one
 * shared progression state, implementation-plan decision 4), and renders the
 * current scene through the kind-matched renderer. Renders as a FIXED
 * full-screen game layer (founder direction s74: everything happens inside
 * the game frame): dark surround, edge-to-edge pixel stage, pixel-styled
 * panels, and the persistent bag in the HUD. Focus mode additionally hides
 * the app chrome underneath, exactly like `/session`.
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
  const [bagOpen, setBagOpen] = useState(false);
  // Scene the Wörterbuch was spent on: English shows only while it is current.
  const [dictSceneId, setDictSceneId] = useState<string | null>(null);

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
  const node = currentBattleNode(run);
  // An open item demand: the bag is how it gets answered.
  const ask = scene.kind === "dialogueBattle" && node && !node.outcome ? node.ask : undefined;
  const translate = dictSceneId === run.sceneId;

  const spendDict = () => {
    if (run.dictUses <= 0 || translate) return;
    act(useDictionary);
    setDictSceneId(run.sceneId);
    setBagOpen(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: GAME_BG }}>
      {/* HUD: exit, mission title, XP, the persistent bag */}
      <div className="z-20 mx-auto flex w-full max-w-2xl items-center justify-between gap-2 px-3 pb-2 pt-safe-3">
        <button
          type="button"
          onClick={onExit}
          aria-label="Mission verlassen"
          className="flex h-9 w-9 items-center justify-center rounded-md border-2 bg-[#fdfcf8] text-slate-500"
          style={{ borderColor: GAME_OUT }}
        >
          <X className="h-4 w-4" />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-bold text-white/85">
          {mission.title}
        </p>
        <span
          className="inline-flex h-9 items-center gap-1 rounded-md border-2 bg-[#fdfcf8] px-2 text-xs font-bold text-[#3D74ED]"
          style={{ borderColor: GAME_OUT }}
        >
          <Zap className="h-3.5 w-3.5" /> {run.xp}
        </span>
        <button
          type="button"
          onClick={() => setBagOpen(true)}
          aria-label="Tasche öffnen"
          className="relative flex h-9 w-11 items-center justify-center rounded-md border-2 bg-[#fdfcf8]"
          style={{ borderColor: GAME_OUT }}
        >
          <motion.img
            src={BAG_SPRITE}
            alt=""
            draggable={false}
            className="w-7 select-none"
            style={{ imageRendering: "pixelated" }}
            animate={ask ? { y: [0, -2, 0] } : { y: 0 }}
            transition={ask ? { repeat: Infinity, duration: 0.9 } : undefined}
          />
          <span className="absolute -right-1.5 -top-1.5 rounded-full bg-[#3D74ED] px-1.5 text-[10px] font-bold text-white">
            {run.bag.length}
          </span>
          {ask && (
            <motion.span
              className="absolute inset-0 rounded-md ring-2 ring-[#f3a64a]"
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
            />
          )}
        </button>
      </div>

      {/* the game: stage + panels scroll as one surface */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl pb-safe-8">
          <motion.div
            key={run.sceneId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* the keyed motion.div above remounts each view per scene, so the
                views' local state (line index, picks) resets on every transition */}
            {scene.kind === "cutscene" && <CutsceneView scene={scene} act={act} translate={translate} />}
            {scene.kind === "websiteParody" && <WebsiteView scene={scene} act={act} translate={translate} />}
            {scene.kind === "loadout" && <LoadoutView scene={scene} run={run} act={act} translate={translate} />}
            {scene.kind === "listening" && <ListeningView scene={scene} act={act} translate={translate} />}
            {scene.kind === "hotspot" && <HotspotView scene={scene} run={run} act={act} translate={translate} />}
            {scene.kind === "automat" && <AutomatView scene={scene} run={run} act={act} translate={translate} />}
            {scene.kind === "dialogueBattle" && (
              <BattleView
                scene={scene}
                run={run}
                act={act}
                translate={translate}
                onOpenBag={() => setBagOpen(true)}
              />
            )}
            {scene.kind === "formCloze" && <FormView scene={scene} act={act} translate={translate} />}
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {bagOpen && (
          <BagSheet
            run={run}
            askItem={ask?.itemId}
            askNpcName={
              scene.kind === "dialogueBattle" ? npcById.get(scene.npc)?.name : undefined
            }
            dictActive={translate}
            onClose={() => setBagOpen(false)}
            onHand={(itemId) => {
              setBagOpen(false);
              act((r) => handItem(r, itemId));
            }}
            onAdmit={() => {
              setBagOpen(false);
              act(admitMissing);
            }}
            onUseDict={spendDict}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The Pokemon-style bag (founder feedback s74): always one tap away in the
 * HUD. In browse mode items show their card; while an NPC demands a document
 * ("ask" node) tapping an item HANDS IT OVER, so the bag is the answer
 * surface, not a menu. The Wörterbuch lives here too: spending a charge
 * reveals English for the current scene.
 */
function BagSheet({
  run,
  askItem,
  askNpcName,
  dictActive,
  onClose,
  onHand,
  onAdmit,
  onUseDict,
}: {
  run: MissionRun;
  /** Set while an item demand is open (the id the NPC wants, kept secret). */
  askItem?: string;
  askNpcName?: string;
  dictActive: boolean;
  onClose: () => void;
  onHand: (itemId: string) => void;
  onAdmit: () => void;
  onUseDict: () => void;
}) {
  const [inspect, setInspect] = useState<string | null>(null);
  const asking = askItem !== undefined;
  const items = run.bag.map((id) => keyItemById.get(id)).filter((k): k is NonNullable<typeof k> => !!k);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="mx-auto w-full max-w-2xl px-2 pb-safe-2"
        onClick={(e) => e.stopPropagation()}
      >
        {/* the popup IS the backpack (founder direction s74): carry handle,
            leather dome, amber zip band, then the cream interior */}
        <div
          aria-hidden
          className="mx-auto h-6 w-24 rounded-t-full border-2 border-b-0"
          style={{ borderColor: GAME_OUT, backgroundColor: "#8c4232" }}
        />
        <div
          className="relative -mt-px overflow-hidden rounded-t-[36px] rounded-b-lg border-2 shadow-[0_3px_0_rgba(70,60,68,0.30)]"
          style={{ borderColor: GAME_OUT, backgroundColor: "#a8543f" }}
        >
          <div className="flex items-center justify-between gap-2 px-5 pb-2.5 pt-3.5">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <img
                src={BAG_SPRITE}
                alt=""
                className="w-6 select-none"
                style={{ imageRendering: "pixelated" }}
              />
              Deine Tasche
            </p>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tasche schließen"
              className="flex h-7 w-7 items-center justify-center rounded-md border-2 bg-white/90 text-slate-600"
              style={{ borderColor: GAME_OUT }}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div
            className="h-2.5 w-full border-y-2"
            style={{ backgroundColor: "#dba64d", borderColor: GAME_OUT }}
          />
          <div className="space-y-3 bg-[#fdfcf8] p-4">
          {asking && (
            <p className="border-2 border-amber-500/60 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-800" style={{ borderRadius: 6 }}>
              {askNpcName ?? "Dein Gegenüber"} wartet. Gib das richtige Dokument.
            </p>
          )}

          {items.length === 0 ? (
            <p className="text-sm text-slate-500">Noch keine Dokumente eingepackt.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (asking ? onHand(item.id) : setInspect(inspect === item.id ? null : item.id))}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-md border-2 bg-white px-2 py-2.5 text-center transition-all active:translate-y-[2px]",
                    inspect === item.id && !asking && "ring-2 ring-[#3D74ED]",
                  )}
                  style={{ borderColor: GAME_OUT }}
                >
                  <img
                    src={DOC_ICONS[item.id] ?? DOC_ICON_FALLBACK}
                    alt=""
                    draggable={false}
                    className="w-8 select-none"
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span lang="de" className="hyphens-auto break-words text-[11px] font-semibold leading-tight text-slate-700">
                    {item.de.replace(/^(der|die|das)\s/, "")}
                  </span>
                </button>
              ))}
            </div>
          )}

          {inspect && !asking && (
            <p className="text-xs text-slate-500">
              {keyItemById.get(inspect)?.de}: {keyItemById.get(inspect)?.desc.de}
            </p>
          )}

          {/* Hilfsmittel: the Wörterbuch is the rationed English lifeline */}
          <div className="flex items-center justify-between gap-2 border-t-2 border-dashed pt-3" style={{ borderColor: `${GAME_OUT}44` }}>
            <button
              type="button"
              onClick={onUseDict}
              disabled={run.dictUses <= 0 || dictActive}
              className="flex items-center gap-2 rounded-md border-2 bg-white px-3 py-2 text-left transition-all active:translate-y-[2px] disabled:opacity-45"
              style={{ borderColor: GAME_OUT }}
            >
              <img
                src={DICT_SPRITE}
                alt=""
                draggable={false}
                className="w-6 select-none"
                style={{ imageRendering: "pixelated" }}
              />
              <span>
                <span className="block text-xs font-bold text-slate-700">Wörterbuch</span>
                <span className="block text-[11px] text-slate-500">
                  {dictActive
                    ? "Aktiv für diese Szene"
                    : run.dictUses > 0
                      ? `Englisch zeigen · noch ${run.dictUses}x`
                      : "Aufgebraucht"}
                </span>
              </span>
            </button>
            {asking && (
              <Pill onClick={onAdmit} className="shrink-0 text-xs">
                Hab ich nicht dabei
              </Pill>
            )}
          </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
    <div className="fixed inset-0 z-40 overflow-y-auto" style={{ backgroundColor: "#e9e5dd" }}>
      <div className="mx-auto flex min-h-full w-full max-w-lg flex-col items-center justify-center gap-4 px-4 py-10">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-bold uppercase tracking-widest text-slate-500"
        >
          Mission geschafft
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-center text-2xl font-bold text-slate-800"
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
            <GameCard className="space-y-2 border-reward/60 bg-reward-bg p-5 text-center">
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
          <span
            className="inline-flex items-center gap-1.5 rounded-md border-2 bg-white px-4 py-1.5 text-sm font-bold text-[#3D74ED]"
            style={{ borderColor: GAME_OUT }}
          >
            <Zap className="h-4 w-4" /> +{run.xp} XP
          </span>
          <Pill primary onClick={onExit} className="px-6 py-2.5">
            Zurück nach Neustadt
          </Pill>
        </motion.div>
      </div>
    </div>
  );
}
