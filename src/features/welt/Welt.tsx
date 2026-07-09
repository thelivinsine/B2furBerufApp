import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, KeyRound, Lock, Play, Swords } from "lucide-react";
import type { Mission } from "@/types/game";
import { missionUnlocked } from "@/engine/mission";
import { missions, chapters, keyItemById } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { Gloss } from "@/features/shared/Gloss";
import { MissionPlayer } from "@/features/welt/MissionPlayer";
import { GameCard, Chip, Pill, PixelStage } from "@/features/welt/stage";

/**
 * /welt: the Neuland world hub (game G1, Beta). Chapter sections + mission
 * lists render straight from the mission bank (missions are data; a new
 * chapter appears here the moment its first mission is authored), plus the
 * owned Schlüssel-Dokumente shelf and the mission player. Game scenes are
 * light-theme-only by design (docs/DECISIONS.md); the hub itself uses app
 * tokens so it sits naturally in the shell.
 */
export function Welt() {
  const [params, setParams] = useSearchParams();
  const missionsDone = useProgressStore((s) => s.missionsDone);
  const ownedItems = useProgressStore((s) => s.keyItems);

  // Deep link from the Heute → Spielen carousel: /welt?mission=<id> auto-opens
  // that mission when it exists and is unlocked. Read once on mount; absent or
  // invalid param leaves the hub untouched.
  const [active, setActive] = useState<Mission | null>(() => {
    const id = params.get("mission");
    if (!id) return null;
    const m = missions.find((mm) => mm.id === id);
    if (!m) return null;
    const { missionsDone: done, keyItems } = useProgressStore.getState();
    return missionUnlocked(m, done, keyItems) ? m : null;
  });

  const exitMission = () => {
    setActive(null);
    if (params.has("mission")) {
      params.delete("mission");
      setParams(params, { replace: true });
    }
  };

  if (active) {
    return <MissionPlayer key={active.id} mission={active} onExit={exitMission} />;
  }

  // Only chapters that already have authored missions render as sections.
  const authoredChapters = chapters.filter((c) => missions.some((m) => m.chapter === c.id));

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {authoredChapters.map((chapter, ci) => {
        const chapterMissions = missions
          .filter((m) => m.chapter === chapter.id)
          .sort((a, b) => a.index - b.index);
        return (
          <section key={chapter.id} className="space-y-5">
            <header className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Neuland
                </p>
                <h1 className="text-2xl font-bold">
                  Kapitel {ci + 1} · {chapter.title}
                </h1>
              </div>
              <Chip tone="amber">Beta</Chip>
            </header>

            <PixelStage setting="strasse" label={null} className="rounded-xl">
              <div className="absolute bottom-2 left-3 rounded-md border-2 border-[#463c44] bg-white/95 px-3 py-1 text-xs font-semibold text-slate-600">
                {chapter.district}
              </div>
            </PixelStage>

            <div className="space-y-3">
              {chapterMissions.map((m, i) => {
                const done = missionsDone.includes(m.id);
                const unlocked = missionUnlocked(m, missionsDone, ownedItems);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.05, 0.2) }}
                  >
                    <GameCard className="flex items-center gap-3 p-4">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {m.boss && (
                            <Chip tone="indigo">
                              <Swords className="mr-1 h-3 w-3" /> Boss
                            </Chip>
                          )}
                          <p className="font-semibold text-slate-800">
                            {ci + 1}.{m.index} · {m.title}
                          </p>
                          {done && <Check className="h-4 w-4 text-teal-600" />}
                        </div>
                        <p className="text-sm text-slate-500">
                          <Gloss de={m.brief.de} en={m.brief.en} />
                        </p>
                      </div>
                      {unlocked ? (
                        <Pill primary onClick={() => setActive(m)} className="shrink-0">
                          <Play className="mr-1 inline h-3.5 w-3.5" />
                          {done ? "Nochmal" : "Spielen"}
                        </Pill>
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-slate-300" />
                      )}
                    </GameCard>
                  </motion.div>
                );
              })}
            </div>
          </section>
        );
      })}
      <p className="text-center text-xs text-muted-foreground">
        Weitere Missionen folgen im nächsten Kapitel-Update.
      </p>

      {ownedItems.length > 0 && (
        <section className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Schlüssel-Dokumente
          </p>
          <div className="flex flex-wrap gap-2">
            {ownedItems.map((id) => {
              const item = keyItemById.get(id);
              if (!item) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium"
                >
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <Gloss de={item.de} en={item.en} />
                </span>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
