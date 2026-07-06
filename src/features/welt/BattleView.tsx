import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { DialogueBattleScene } from "@/types/game";
import { currentBattleNode, playMove, resolveBattle, type MissionRun } from "@/engine/mission";
import { npcById, keyItemById } from "@/data/missions";
import { cn } from "@/lib/utils";
import { Gloss } from "@/features/shared/Gloss";
import { TranslateToggle, type SceneViewProps } from "@/features/welt/scenes";
import {
  PixelStage,
  StageSprite,
  GameCard,
  SheetCard,
  Chip,
  Meter,
  Pill,
  NPC_SPRITES,
  PLAYER_SPRITE,
  GAME_AMBER,
  GAME_INDIGO,
} from "@/features/welt/stage";

const EFFECT_LABEL: Record<string, string> = {
  beamtendeutsch: "Beamtendeutsch",
  missverstaendnis: "Missverständnis",
  smalltalk: "Small-Talk-Falle",
};

/**
 * The dialogue battle (game G1), composed like the blessed scene-7 mockup:
 * enemy card top-left and player card bottom-right floating over the pixel
 * stage, the conversation in a bottom sheet, moves as tappable cards with a
 * move-class chip. Amber is used for the crit flash (a combo moment);
 * reward-gold stays reserved for the loot screen.
 */
export function BattleView({
  scene,
  run,
  act,
}: SceneViewProps & { scene: DialogueBattleScene; run: MissionRun }) {
  const [showEn, setShowEn] = useState(false);
  const battle = run.battle;
  const node = currentBattleNode(run);
  if (!battle || !node) return null;

  const npc = npcById.get(scene.npc);
  const sprite = npc?.sprite ? NPC_SPRITES[npc.sprite] : undefined;
  const last = battle.last;
  const missingItem = last?.missingItem ? keyItemById.get(last.missingItem) : undefined;
  const bigHit = (last?.geduld ?? 0) <= -10;
  // The floating delta chip shows the Geduld delta when there is one, else
  // the Mut delta; sign/color must come from the SHOWN value.
  const delta =
    last && last.geduld !== 0
      ? { label: "Geduld", value: last.geduld }
      : last && last.mut !== 0
        ? { label: "Mut", value: last.mut }
        : undefined;

  return (
    <div className="space-y-3">
      <PixelStage setting={scene.setting}>
        {/* stage sprites, anchored to the backdrop's shadow spots */}
        {sprite && (
          <motion.div
            key={battle.turns}
            animate={bigHit ? { x: [0, -3, 3, -2, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute"
            style={{ left: "65.5%", top: "23%", width: "11%" }}
          >
            <img
              src={sprite}
              alt=""
              draggable={false}
              className="w-full select-none"
              style={{ imageRendering: "pixelated" }}
            />
          </motion.div>
        )}
        <StageSprite src={PLAYER_SPRITE} x={15} y={49} w={7} />

        {/* enemy card */}
        <GameCard className="absolute left-3 top-3 w-[54%] max-w-56 space-y-1.5 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold">{npc?.name}</span>
            <Chip>{scene.npcCefr}</Chip>
          </div>
          <Meter label="Geduld" value={battle.geduld} max={battle.geduldMax} color={GAME_AMBER} />
        </GameCard>

        {/* player card */}
        <GameCard className="absolute bottom-3 right-3 w-[48%] max-w-52 space-y-1.5 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">Du</span>
            <AnimatePresence>
              {delta && battle.turns > 0 && (
                <motion.span
                  key={battle.turns}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    "text-xs font-bold",
                    delta.value < 0 ? "text-rose-500" : "text-teal-600",
                  )}
                >
                  {`${delta.value > 0 ? "+" : ""}${delta.value} ${delta.label}`}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <Meter label="Mut" value={battle.mut} max={battle.mutMax} color={GAME_INDIGO} />
        </GameCard>

        {/* crit flash */}
        <AnimatePresence>
          {last?.crit && (
            <motion.div
              key={`crit-${battle.turns}`}
              initial={{ opacity: 0, scale: 0.7, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 rounded-2xl px-4 py-1.5 text-lg font-black tracking-wide text-white shadow-elevated-soft"
              style={{ backgroundColor: GAME_AMBER }}
            >
              Kritisch!
            </motion.div>
          )}
        </AnimatePresence>
      </PixelStage>

      <SheetCard className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wide text-[#5b5be6]">{npc?.name}</p>
          {node.effect && <Chip tone="slate">{EFFECT_LABEL[node.effect]}</Chip>}
        </div>
        <motion.p
          key={battle.nodeId + battle.turns}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-base leading-relaxed"
        >
          <Gloss de={node.npcLine.de} en={node.npcLine.en} />
        </motion.p>

        {missingItem && (
          <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
            Dir fehlt: {missingItem.de}!
          </p>
        )}
        {last?.feedback && !missingItem && (
          <p className="text-sm italic text-slate-500">
            <Gloss de={last.feedback.de} en={last.feedback.en} />
          </p>
        )}

        {node.outcome ? (
          <div className="flex justify-end">
            <Pill primary onClick={() => act(resolveBattle)}>
              Weiter <ChevronRight className="ml-1 inline h-4 w-4" />
            </Pill>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-slate-400">Wähle deine Antwort</p>
              <TranslateToggle on={showEn} onToggle={() => setShowEn((v) => !v)} />
            </div>
            {node.moves?.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => act((r) => playMove(r, m.id))}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition-all hover:border-[#5b5be6]/50 active:scale-[0.99]"
              >
                {m.tag && (
                  <span className="flex items-center gap-2">
                    <Chip tone={m.crit ? "amber" : "indigo"}>{m.tag}</Chip>
                  </span>
                )}
                <span className="mt-1 block text-sm leading-snug text-slate-700">{m.de}</span>
                {showEn && <span className="block text-xs leading-snug text-slate-400">{m.en}</span>}
              </button>
            ))}
          </div>
        )}
      </SheetCard>
    </div>
  );
}
