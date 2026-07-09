import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Check, Lock } from "lucide-react";
import { missions, chapters } from "@/data/missions";
import { missionUnlocked } from "@/engine/mission";
import { useProgressStore } from "@/store/useProgressStore";

/**
 * Heute → "Spielen": a compact carousel over the authored Neuland missions,
 * the entry point into the /welt game world. Lazy by design (it imports the
 * mission bank), mounted only when the Spielen tab is selected so the Dashboard
 * keeps NO content bank on its eager path (bundle budget, CLAUDE.md). A slide's
 * "Spielen" deep-links into /welt?mission=<id>, which auto-opens that mission.
 *
 * Chrome uses app tokens so it sits in the shell; the pixel game surface itself
 * lives inside /welt. Brand indigo is the single loud accent (game art rule).
 */
export default function NeulandCarousel() {
  const navigate = useNavigate();
  const missionsDone = useProgressStore((s) => s.missionsDone);
  const ownedItems = useProgressStore((s) => s.keyItems);

  // Flat, ordered list of every authored mission with its 1-based chapter
  // number, so a new chapter appears here the moment its first mission ships.
  const slides = useMemo(() => {
    const authored = chapters.filter((c) => missions.some((m) => m.chapter === c.id));
    return authored.flatMap((chapter, ci) =>
      missions
        .filter((m) => m.chapter === chapter.id)
        .sort((a, b) => a.index - b.index)
        .map((m) => ({ mission: m, chapter, chapterNo: ci + 1 })),
    );
  }, []);

  // Open on the first unlocked, not-yet-done mission (the natural "next" step),
  // else the very first slide.
  const [idx, setIdx] = useState(() => {
    const next = slides.findIndex(
      (s) => !missionsDone.includes(s.mission.id) && missionUnlocked(s.mission, missionsDone, ownedItems),
    );
    return next === -1 ? 0 : next;
  });

  if (slides.length === 0) return null;

  const cycle = (dir: number) => setIdx((i) => (i + dir + slides.length) % slides.length);

  const { mission, chapter, chapterNo } = slides[idx];
  const done = missionsDone.includes(mission.id);
  const unlocked = missionUnlocked(mission, missionsDone, ownedItems);

  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-3">
        <button
          type="button"
          onClick={() => cycle(-1)}
          aria-label="Vorherige Mission"
          className="flex w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <motion.div
          key={mission.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="relative flex min-h-[300px] flex-1 flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 p-6 text-white shadow-soft"
        >
          <div className="pointer-events-none absolute -right-12 -top-14 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Neuland</p>

          <div className="relative my-auto py-5">
            <p className="text-xs font-medium text-white/70">
              Kapitel {chapterNo} · {chapter.title}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-balance">
              {mission.title}
            </h2>
            <p className="mt-3 flex items-center gap-2 text-sm font-medium text-white/75">
              Mission {chapterNo}.{mission.index}
              {mission.boss ? " · Boss" : ""}
              {done && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-xs">
                  <Check className="h-3 w-3" /> Abgeschlossen
                </span>
              )}
            </p>
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex gap-1.5" role="tablist" aria-label="Mission auswählen">
              {slides.map((s, i) => (
                <button
                  key={s.mission.id}
                  type="button"
                  aria-label={`Mission ${i + 1}`}
                  aria-selected={i === idx}
                  onClick={() => setIdx(i)}
                  className={
                    "h-[7px] rounded-full transition-all " +
                    (i === idx ? "w-5 bg-white" : "w-[7px] bg-white/35 hover:bg-white/60")
                  }
                />
              ))}
            </div>

            {unlocked ? (
              <button
                type="button"
                onClick={() => navigate(`/welt?mission=${mission.id}`)}
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-md transition hover:bg-white/90"
              >
                {done ? "Nochmal" : "Spielen"}
                <Play className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white/15 px-5 py-3 text-sm font-semibold text-white/80">
                <Lock className="h-4 w-4" /> Gesperrt
              </span>
            )}
          </div>
        </motion.div>

        <button
          type="button"
          onClick={() => cycle(1)}
          aria-label="Nächste Mission"
          className="flex w-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
