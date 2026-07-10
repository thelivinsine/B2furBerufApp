import { useLayoutEffect, useRef } from "react";
import { Check, Lock, Play, RotateCcw, Swords } from "lucide-react";
import type { Mission } from "@/types/game";
import { missionUnlocked } from "@/engine/mission";
import { missions, chapters } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { PixelStage } from "@/features/welt/stage";
import { cn } from "@/lib/utils";

// Compact (Heute) mission-list crop: exactly three uniform rows tall.
const ROW_H = 60;
const COMPACT_LIST_H = ROW_H * 3;

/**
 * The Neuland world hub: chapter hero + mission checklist straight from the
 * mission bank (missions are data; a new chapter appears the moment its first
 * mission is authored). Purely
 * presentational, it takes an `onPlay` so the same view drives both surfaces:
 * on the `/welt` route it opens the inline MissionPlayer (full-screen focus
 * mode), and in Heute → Spielen it deep-links into `/welt?mission=<id>`, which
 * auto-opens that mission on the proper route where focus mode is wired.
 *
 * Layout (design review, s88): the page header renders ONCE above the chapter
 * loop (centered "Neuland" + neutral Beta chip); each chapter is a hero with a
 * scrim overlay (chapter, mission count, play CTA for the next mission) over a
 * dense checklist where done rows pair the green check with a quiet replay
 * button. Only the next mission carries the loud gradient control. A locked
 * teaser card for the next unauthored chapter replaces the old footer note.
 *
 * `compact` (Heute → Spielen, s88 follow-up): crops the mission checklist to a
 * fixed THREE-row internally-scrollable tile so the page fits without scrolling
 * (only the tile does), and on open auto-scrolls the tile so the next mission
 * sits on the CENTER line. The `/welt` route leaves it off and scrolls the page
 * normally.
 */
export function NeulandHub({
  onPlay,
  compact = false,
}: {
  onPlay: (mission: Mission) => void;
  compact?: boolean;
}) {
  const missionsDone = useProgressStore((s) => s.missionsDone);
  const ownedItems = useProgressStore((s) => s.keyItems);

  // Only chapters that already have authored missions render as sections.
  const authoredChapters = chapters.filter((c) => missions.some((m) => m.chapter === c.id));
  const nextLockedChapter = chapters.find((c) => !missions.some((m) => m.chapter === c.id));
  const nextLockedIndex = nextLockedChapter ? chapters.indexOf(nextLockedChapter) : -1;

  // In compact, center the next unplayed mission in the 3-row crop on open.
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextRowRef = useRef<HTMLDivElement>(null);
  const doneKey = missionsDone.join(",");
  useLayoutEffect(() => {
    if (!compact) return;
    const c = scrollRef.current;
    const r = nextRowRef.current;
    if (!c || !r) return;
    c.scrollTop = Math.max(0, r.offsetTop - (c.clientHeight - r.clientHeight) / 2);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, doneKey]);

  return (
    <div className={cn("mx-auto max-w-lg", compact ? "space-y-4" : "space-y-3")}>
      {/* "Neuland" is centered on the page exactly like Üben's "Lernpfad"
          (same text-2xl/font-bold). "Beta" is a suffix, NOT part of the
          heading, so it's absolutely positioned off the right edge and does
          not shift the word off-center (founder). */}
      <header className="text-center">
        <h1 className="relative inline-block text-2xl font-bold">
          Neuland
          <span className="absolute left-full top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
            Beta
          </span>
        </h1>
      </header>

      {authoredChapters.map((chapter, ci) => {
        const chapterMissions = missions
          .filter((m) => m.chapter === chapter.id)
          .sort((a, b) => a.index - b.index);
        const isDone = (m: Mission) => missionsDone.includes(m.id);
        const doneCount = chapterMissions.filter(isDone).length;
        const next = chapterMissions.find(
          (m) => !isDone(m) && missionUnlocked(m, missionsDone, ownedItems),
        );
        return (
          <section key={chapter.id} className={compact ? "space-y-4" : "space-y-3"}>
            {/* Chapter hero: the scrim overlay gives the image a job (chapter,
                count, play CTA) instead of a decorative dead zone. Framed by
                the same surface mat as the Üben map (same dimensions + screen
                position + neutral gray border; the section color lives on the
                Heute toggle, not the mat). */}
            <div className="rounded-2xl border border-border bg-surface p-2 shadow-soft">
              <PixelStage setting="strasse" label={null} className="rounded-xl" themed>
                <div className="absolute inset-0 bg-gradient-to-t from-[#16142c]/75 via-[#16142c]/25 to-transparent" />
                <div className="absolute inset-x-3.5 bottom-3 flex items-end justify-between gap-3">
                <div className="min-w-0 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-wide opacity-85">
                    Kapitel {ci + 1} · {chapter.title}
                  </p>
                  <p className="mt-0.5 truncate text-base font-extrabold leading-tight">
                    {chapter.district}
                  </p>
                  <p className="mt-1.5 inline-flex items-center rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-bold tabular-nums">
                    {doneCount} / {chapterMissions.length} Missionen
                  </p>
                </div>
                  {next && (
                    <button
                      type="button"
                      onClick={() => onPlay(next)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent-gradient px-3.5 py-2 text-[13px] font-bold text-white shadow-glow transition active:scale-[0.98]"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Mission spielen
                    </button>
                  )}
                </div>
              </PixelStage>
            </div>

            {/* Mission checklist: one dense card, states at a glance. In compact
                (Heute) it's cropped to exactly THREE uniform rows and scrolls
                internally (scrollbar hidden) so the page never scrolls; the next
                mission is auto-centered on open. */}
            <div
              ref={compact ? scrollRef : undefined}
              className={cn(
                "rounded-2xl border border-border bg-surface px-4 shadow-soft",
                compact && "no-scrollbar overflow-y-auto overscroll-contain",
              )}
              style={compact ? { height: COMPACT_LIST_H } : undefined}
            >
              {chapterMissions.map((m) => {
                const done = isDone(m);
                const unlocked = missionUnlocked(m, missionsDone, ownedItems);
                const isNext = next?.id === m.id;
                return (
                  <div
                    key={m.id}
                    ref={isNext ? nextRowRef : undefined}
                    className="flex items-center gap-2.5 border-b border-border last:border-b-0"
                    style={{ height: ROW_H }}
                  >
                    <span
                      className={cn(
                        "w-7 shrink-0 text-[13px] font-bold tabular-nums",
                        isNext ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {ci + 1}.{m.index}
                    </span>
                    <p
                      className={cn(
                        "min-w-0 flex-1 text-sm",
                        done || !unlocked
                          ? "font-semibold text-muted-foreground"
                          : "font-bold text-foreground",
                      )}
                    >
                      {m.title}
                      {m.boss && (
                        <span className="ml-1.5 inline-flex items-center rounded-md bg-indigo-100 px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                          <Swords className="mr-1 h-3 w-3" /> Boss
                        </span>
                      )}
                    </p>
                    {done ? (
                      <>
                        <Check className="h-4 w-4 shrink-0 text-success" />
                        <button
                          type="button"
                          aria-label={`${m.title} nochmal spielen`}
                          onClick={() => onPlay(m)}
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground transition active:scale-95"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : isNext ? (
                      <button
                        type="button"
                        aria-label={`${m.title} spielen`}
                        onClick={() => onPlay(m)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-gradient text-white shadow-glow transition active:scale-95"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                      </button>
                    ) : unlocked ? (
                      <button
                        type="button"
                        aria-label={`${m.title} spielen`}
                        onClick={() => onPlay(m)}
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-primary/40 text-primary transition active:scale-95"
                      >
                        <Play className="h-3 w-3 fill-current" />
                      </button>
                    ) : (
                      <Lock className="h-4 w-4 shrink-0 text-muted-foreground/50" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Next chapter teaser: a locked card says "more is coming" without a
          filler sentence (microcopy budget). */}
      {nextLockedChapter && (
        <div className="flex items-center gap-3 rounded-2xl border-[1.5px] border-dashed border-border bg-muted/40 px-4 py-3 text-muted-foreground">
          <Lock className="h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-[13.5px] font-bold">
              Kapitel {nextLockedIndex + 1} · {nextLockedChapter.title}
            </p>
            <p className="text-[11.5px] font-semibold">Öffnet nach Kapitel {nextLockedIndex}</p>
          </div>
        </div>
      )}
    </div>
  );
}
