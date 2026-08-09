import { lazy, Suspense, useState } from "react";
import { useT } from "@/lib/uiLang";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Dumbbell, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppConfigStore } from "@/lib/appConfig";
import { useSlidingPill } from "@/features/shared/useSlidingPill";

// Both tabs import the mission bank, so they load lazily to keep the content
// bank off the Dashboard's eager path (bundle budget, CLAUDE.md). Üben is the
// Neuland journey map; Spielen is the Neuland world hub (the same mission list
// as /welt), which deep-links back to /welt to play a mission full-screen.
const UebenPath = lazy(() => import("./UebenPath"));
const SpielenHub = lazy(() => import("./SpielenHub"));

type HeuteTab = "ueben" | "spielen";

const TAB_INDEX: Record<HeuteTab, number> = { ueben: 0, spielen: 1 };

// Shaped like the loaded Üben stack (map card + mission tile) so first paint
// and loaded state share a silhouette instead of jumping.
const fallback = (
  <div className="animate-pulse space-y-5">
    <div className="aspect-[3/2] rounded-2xl border border-border bg-surface" />
    <div className="h-44 rounded-2xl border border-border bg-surface" />
  </div>
);

export function Dashboard() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  // Open on Spielen when returned here from the mission player (/?tab=spielen),
  // so exiting a game lands back on the tab with the Trainieren/Spielen toggle.
  // The URL param wins; otherwise the Steuerung H8 remote default decides which
  // tab opens first (default "ueben" = today's behavior).
  const startTabDefault = useAppConfigStore((s) => s.config.dashboardStartTab);
  const [tab, setTab] = useState<HeuteTab>(() => {
    const p = params.get("tab");
    if (p === "spielen" || p === "ueben") return p;
    return startTabDefault;
  });
  // Direction of the last tab change (+1 = moved right to Spielen, -1 = moved
  // left to Üben) so the content slides in the matching direction.
  const [dir, setDir] = useState(0);
  const reduce = useReducedMotion();
  const selectTab = (id: HeuteTab) => {
    if (id === tab) return;
    setDir(TAB_INDEX[id] > TAB_INDEX[tab] ? 1 : -1);
    setTab(id);
    // Keep the URL in sync so a manual switch away from Spielen doesn't leave a
    // stale ?tab=spielen behind (the param is only read on mount).
    if (params.has("tab")) {
      params.delete("tab");
      setParams(params, { replace: true });
    }
  };
  // Horizontal slide: entering panel comes from the side you moved toward, the
  // leaving panel exits the opposite side (right->left when going to Spielen,
  // left->right when going back to Üben). Distance 0 under reduced motion.
  const shift = reduce ? 0 : 36;
  const slide = {
    enter: (d: number) => ({ opacity: 0, x: d >= 0 ? shift : -shift }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: d >= 0 ? -shift : shift }),
  };
  const { trackRef, registerItem, rect } = useSlidingPill(tab);

  return (
    // Single-column start page at full width (max-w-md) on every size. On
    // desktop (lg) the whole thing is vertically centered in the viewport so the
    // focused column reads as deliberate rather than stranded at the top, and
    // the toggle->content gap is tightened (lg:space-y-3) so the full-size stack
    // still fits without a scrollbar.
    <div className="space-y-4 sm:space-y-6 lg:flex lg:min-h-[calc(100vh-11rem)] lg:flex-col lg:justify-center lg:space-y-3">
      {/* Trainieren / Spielen: the two ways into the day, centred. Trainieren
          opens by default. The greeting + streak live in the top row; the
          daily-goal ring moved to Fortschritt (s86), so Heute no longer repeats
          progress. Same squircle-track + sliding-pill language as LibrarySwitcher
          / WritingModeSwitcher (s170, founder request), content-sized (w-fit) since
          it's only two segments. */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        ref={trackRef as React.RefObject<HTMLDivElement>}
        role="tablist"
        aria-label={t("Modus")}
        className="relative mx-auto flex w-fit items-stretch gap-1 rounded-lg border border-border bg-muted p-1 shadow-soft"
      >
        {rect && (
          <motion.span
            aria-hidden
            className="absolute top-1 bottom-1 left-0 rounded-md bg-surface shadow-soft"
            initial={false}
            animate={{ x: rect.left, width: rect.width }}
            transition={
              reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }
            }
          />
        )}
        {(
          [
            { id: "ueben", label: "Trainieren", tint: "text-blue-600" },
            { id: "spielen", label: "Spielen", tint: "text-orange-500" },
          ] as const
        ).map(({ id, label, tint }) => (
          <button
            key={id}
            ref={registerItem(id)}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => selectTab(id)}
            className={cn(
              "relative z-10 inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold transition-colors",
              // Active tab rides the shared pill and picks up its section's
              // subtle tint (Trainieren = blue + dumbbell icon, Spielen =
              // orange + play icon; "Üben" → "Lernen" in s105, → "Trainieren"
              // with the dumbbell restored in s158, both founder requests).
              // The tile mats keep a neutral gray border (founder: colored
              // borders read poorly), so the color lives on the toggle only.
              tab === id ? tint : "text-muted-foreground hover:text-foreground",
            )}
          >
            {/* Both active icons fill on the lifted white pill. */}
            {id === "ueben" ? (
              <Dumbbell className={cn("h-4 w-4", tab === id && "fill-current")} />
            ) : (
              <Play className={cn("h-4 w-4", tab === id && "fill-current")} />
            )}
            {t(label)}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait" custom={dir} initial={false}>
        <motion.div
          key={tab}
          custom={dir}
          variants={slide}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.16, ease: "easeOut" }}
          // A single focused column. Mobile: max-w-md (viewport-clamped). Desktop
          // is only a touch smaller than that (26rem vs 28rem) so the components
          // stay substantial while the whole stack (3:2 tile + card + pager)
          // still fits a common ~800px viewport without a scrollbar.
          // `lg:min-h` reserves the taller panel's height (Spielen, ~607px)
          // regardless of which tab is active: without it the toggle above sits
          // in a `justify-center`d column whose total height changes with the
          // panel, so switching tabs visibly moved the toggle (and the panel's
          // own heading) up and down. Reserving the max keeps that column height
          // constant so both stay put; update this if either panel's height
          // changes materially.
          className="mx-auto w-full max-w-md lg:max-w-[26rem] lg:min-h-[38rem]"
        >
          <Suspense fallback={fallback}>
            {tab === "ueben" ? <UebenPath /> : <SpielenHub />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
