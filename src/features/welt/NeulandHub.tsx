import { motion } from "framer-motion";
import { Check, KeyRound, Lock, Play, Swords } from "lucide-react";
import type { Mission } from "@/types/game";
import { missionUnlocked } from "@/engine/mission";
import { missions, chapters, keyItemById } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { Gloss } from "@/features/shared/Gloss";
import { PixelStage } from "@/features/welt/stage";

// The soft, deep tile shadow shared with the Üben "Als Nächstes" tile, so the
// Spielen mission list reads as the same app-tile language on both themes.
const TILE_SHADOW = { boxShadow: "0 10px 30px -22px rgba(0,0,0,0.9)" } as const;

/**
 * The Neuland world hub: chapter sections + mission lists straight from the
 * mission bank (missions are data; a new chapter appears the moment its first
 * mission is authored), plus the owned Schlüssel-Dokumente shelf. Purely
 * presentational, it takes an `onPlay` so the same view drives both surfaces:
 * on the `/welt` route it opens the inline MissionPlayer (full-screen focus
 * mode), and in Heute → Spielen it deep-links into `/welt?mission=<id>`, which
 * auto-opens that mission on the proper route where focus mode is wired.
 */
export function NeulandHub({ onPlay }: { onPlay: (mission: Mission) => void }) {
  const missionsDone = useProgressStore((s) => s.missionsDone);
  const ownedItems = useProgressStore((s) => s.keyItems);

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
              <span className="inline-block rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                Beta
              </span>
            </header>

            <PixelStage setting="strasse" label={null} className="rounded-[20px]" themed>
              <div className="absolute bottom-2 left-3 rounded-lg border border-border bg-surface/95 px-3 py-1 text-xs font-semibold text-muted-foreground">
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
                    <div
                      className="flex items-center gap-3 rounded-[20px] border border-border bg-surface p-4"
                      style={TILE_SHADOW}
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          {m.boss && (
                            <span className="inline-flex items-center rounded-lg bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                              <Swords className="mr-1 h-3 w-3" /> Boss
                            </span>
                          )}
                          <p className="font-semibold text-foreground">
                            {ci + 1}.{m.index} · {m.title}
                          </p>
                          {done && <Check className="h-4 w-4 text-success" />}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <Gloss de={m.brief.de} en={m.brief.en} />
                        </p>
                      </div>
                      {unlocked ? (
                        <button
                          type="button"
                          onClick={() => onPlay(m)}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2 text-sm font-bold text-white transition active:scale-[0.98]"
                          style={{ boxShadow: "0 8px 18px -8px hsl(248 80% 55% / 0.7)" }}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" />
                          {done ? "Nochmal" : "Spielen"}
                        </button>
                      ) : (
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                      )}
                    </div>
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
