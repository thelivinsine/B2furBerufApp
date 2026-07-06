import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import type { BattleMove, DialogueBattleScene } from "@/types/game";
import { currentBattleNode, playMove, resolveBattle, type MissionRun } from "@/engine/mission";
import { gradeTyped } from "@/engine/typing";
import { npcById, keyItemById } from "@/data/missions";
import { cn } from "@/lib/utils";
import { type SceneViewProps } from "@/features/welt/scenes";
import {
  PixelStage,
  StageSprite,
  GameCard,
  SheetCard,
  Chip,
  Meter,
  Pill,
  GameText,
  BAG_SPRITE,
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
 * The dialogue battle (game G1; pixel-UI pass s74): enemy card top-left and
 * player card bottom-right floating over the pixel stage, the conversation
 * in an RPG dialogue box, moves as outlined pixel option cards. On an `ask`
 * node the moves are replaced by the bag: the NPC's demand is answered by
 * opening the Tasche and tapping the right document (founder feedback s74).
 * Amber is the crit flash (a combo moment); reward-gold stays reserved for
 * the loot screen. Crit moves are NOT telegraphed before they land: every
 * tag chip renders alike, the flourish comes with the hit.
 */
export function BattleView({
  scene,
  run,
  act,
  translate,
  onOpenBag,
}: SceneViewProps & {
  scene: DialogueBattleScene;
  run: MissionRun;
  onOpenBag: () => void;
}) {
  // Typed challenge in progress (the input ladder's higher rung).
  const [typingMove, setTypingMove] = useState<BattleMove | null>(null);
  const [typedInput, setTypedInput] = useState("");
  const battle = run.battle;
  const node = currentBattleNode(run);
  if (!battle || !node) return null;

  const submitTyped = (m: BattleMove) => {
    if (!typedInput.trim() || !m.cloze) return;
    const verdict = gradeTyped(typedInput, m.cloze).verdict;
    setTypingMove(null);
    setTypedInput("");
    act((r) => playMove(r, m.id, verdict));
  };

  const npc = npcById.get(scene.npc);
  const sprite = npc?.sprite ? NPC_SPRITES[npc.sprite] : undefined;
  const last = battle.last;
  const missingItem = last?.missingItem ? keyItemById.get(last.missingItem) : undefined;
  const wrongItem = last?.wrongItem ? keyItemById.get(last.wrongItem) : undefined;
  const bigHit = (last?.geduld ?? 0) <= -10;

  return (
    <div className="space-y-4">
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
        {/* the player holds the bottom band at the same human scale as the
            opponent (founder rules s74: opponent top, player bottom; people
            stay the same size, no foreground zoom) */}
        <StageSprite src={PLAYER_SPRITE} x={18} y={68} w={7} />

        {/* enemy card: HER Geduld delta floats here */}
        <GameCard className="absolute left-3 top-3 w-[54%] max-w-56 space-y-1.5 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-sm font-bold">{npc?.name}</span>
            <span className="flex items-center gap-1.5">
              <DeltaFloat turns={battle.turns} value={last?.geduld ?? 0} />
              <Chip>{scene.npcCefr}</Chip>
            </span>
          </div>
          <Meter label="Geduld" value={battle.geduld} max={battle.geduldMax} color={GAME_AMBER} />
        </GameCard>

        {/* player card: YOUR Mut delta floats here */}
        <GameCard className="absolute bottom-3 right-3 w-[48%] max-w-52 space-y-1.5 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">Du</span>
            <DeltaFloat turns={battle.turns} value={last?.mut ?? 0} />
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
              className="pointer-events-none absolute left-1/2 top-1/3 -translate-x-1/2 border-2 border-[#463c44] px-4 py-1.5 text-lg font-black tracking-wide text-white"
              style={{ backgroundColor: GAME_AMBER, borderRadius: 6 }}
            >
              Kritisch!
            </motion.div>
          )}
        </AnimatePresence>
      </PixelStage>

      <div className="px-3">
        <SheetCard name={npc?.name} className="space-y-3 p-4">
          {node.effect && (
            <div className="flex justify-end">
              <Chip tone="slate">{EFFECT_LABEL[node.effect]}</Chip>
            </div>
          )}
          <motion.p
            key={battle.nodeId + battle.turns}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-base leading-relaxed"
          >
            <GameText de={node.npcLine.de} en={node.npcLine.en} translate={translate} />
          </motion.p>

          {missingItem && (
            <p className="rounded-md border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
              Dir fehlt: {missingItem.de}!
            </p>
          )}
          {wrongItem && (
            <p className="rounded-md border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
              Falsches Dokument! Du zeigst: {wrongItem.de}.
            </p>
          )}
          {last?.typed === "wrong" && !missingItem && (
            <p className="rounded-md border-2 border-rose-300 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">
              Vertippt! Der Satz verliert seine Wirkung.
            </p>
          )}
          {last?.feedback && !missingItem && (
            <p className="text-sm italic text-slate-500">
              <GameText de={last.feedback.de} en={last.feedback.en} translate={translate} />
            </p>
          )}

          {node.outcome ? (
            <div className="flex justify-end">
              <Pill primary onClick={() => act(resolveBattle)}>
                Weiter <ChevronRight className="ml-1 inline h-4 w-4" />
              </Pill>
            </div>
          ) : node.ask ? (
            /* item demand: the bag is the answer surface */
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400">Zeig das richtige Dokument.</p>
              <button
                type="button"
                onClick={onOpenBag}
                className="flex w-full items-center justify-center gap-3 rounded-md border-2 border-[#463c44] bg-[#5b5be6] px-3 py-3 text-sm font-bold text-white shadow-[0_3px_0_rgba(70,60,68,0.30)] transition-all active:translate-y-[2px] active:shadow-none"
              >
                <motion.img
                  src={BAG_SPRITE}
                  alt=""
                  draggable={false}
                  className="w-8 select-none"
                  style={{ imageRendering: "pixelated" }}
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                />
                Tasche öffnen
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400">Wähle deine Antwort</p>
              {node.moves?.map((m) =>
                typingMove?.id === m.id ? (
                  /* typed challenge: complete the gap to land the move */
                  <form
                    key={m.id}
                    className="space-y-2 rounded-md border-2 border-[#5b5be6] bg-white px-3 py-2.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      submitTyped(m);
                    }}
                  >
                    <span className="block text-sm leading-snug text-slate-700">
                      {m.de.replace(m.cloze!, "____")}
                    </span>
                    <div className="flex gap-2">
                      <input
                        value={typedInput}
                        onChange={(e) => setTypedInput(e.target.value)}
                        autoFocus
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        placeholder="Fehlendes Wort"
                        className="min-w-0 flex-1 rounded-md border-2 border-[#463c44]/60 bg-white px-3 py-1.5 text-sm text-slate-800 outline-none focus:border-[#5b5be6]"
                      />
                      <Pill primary disabled={!typedInput.trim()} onClick={() => submitTyped(m)}>
                        Sagen
                      </Pill>
                    </div>
                  </form>
                ) : (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      if (m.cloze) {
                        setTypingMove(m);
                        setTypedInput("");
                      } else {
                        act((r) => playMove(r, m.id));
                      }
                    }}
                    className="w-full rounded-md border-2 border-[#463c44]/50 bg-white px-3 py-2.5 text-left transition-all hover:border-[#5b5be6] active:translate-y-[1px]"
                  >
                    {m.tag && (
                      <span className="flex items-center gap-2">
                        <Chip>{m.tag}</Chip>
                        {m.cloze && <Chip tone="teal">Tippen</Chip>}
                      </span>
                    )}
                    <span className="mt-1 block text-sm leading-snug text-slate-700">
                      {m.cloze ? m.de.replace(m.cloze, "____") : m.de}
                    </span>
                    {translate && (
                      <span className="block text-xs leading-snug text-teal-700/90">{m.en}</span>
                    )}
                  </button>
                ),
              )}
            </div>
          )}
        </SheetCard>
      </div>
    </div>
  );
}

/** Floating +/- number next to the bar it belongs to. */
function DeltaFloat({ turns, value }: { turns: number; value: number }) {
  return (
    <AnimatePresence>
      {turns > 0 && value !== 0 && (
        <motion.span
          key={turns}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={cn("text-xs font-bold", value < 0 ? "text-rose-500" : "text-teal-600")}
        >
          {value > 0 ? `+${value}` : value}
        </motion.span>
      )}
    </AnimatePresence>
  );
}
