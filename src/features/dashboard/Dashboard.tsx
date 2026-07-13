import { lazy, Suspense, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BookOpen, Play } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [tab, setTab] = useState<HeuteTab>("ueben");
  // Direction of the last tab change (+1 = moved right to Spielen, -1 = moved
  // left to Üben) so the content slides in the matching direction.
  const [dir, setDir] = useState(0);
  const reduce = useReducedMotion();
  const selectTab = (id: HeuteTab) => {
    if (id === tab) return;
    setDir(TAB_INDEX[id] > TAB_INDEX[tab] ? 1 : -1);
    setTab(id);
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

  return (
    // Single-column start page at full width (max-w-md) on every size. On
    // desktop (lg) the whole thing is vertically centered in the viewport so the
    // focused column reads as deliberate rather than stranded at the top, and
    // the toggle->content gap is tightened (lg:space-y-3) so the full-size stack
    // still fits without a scrollbar.
    <div className="space-y-4 sm:space-y-6 lg:flex lg:min-h-[calc(100vh-11rem)] lg:flex-col lg:justify-center lg:space-y-3">
      {/* Lernen / Spielen: the two ways into the day, centred. Lernen opens by
          default. The greeting + streak live in the top row; the daily-goal ring
          moved to Fortschritt (s86), so Heute no longer repeats progress. */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        role="tablist"
        aria-label="Modus"
        className="mx-auto flex w-fit gap-1 rounded-full border border-border bg-muted p-1"
      >
        {(
          [
            { id: "ueben", label: "Lernen", Icon: BookOpen, tint: "text-blue-600", fillActive: true },
            { id: "spielen", label: "Spielen", Icon: Play, tint: "text-orange-500", fillActive: true },
          ] as const
        ).map(({ id, label, Icon, tint, fillActive }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => selectTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
              // Active tab lifts on the white pill and picks up its section's
              // subtle tint (Lernen = blue + book icon, Spielen = orange + play
              // icon; renamed from "Üben" in s105 to avoid clashing with the
              // Theorie Üben button). The tile mats keep a neutral gray border
              // (founder: colored borders read poorly), so the color lives on
              // the toggle only.
              tab === id
                ? cn("bg-surface shadow-soft", tint)
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {/* Spielen's active Play triangle fills solid (`fillActive`) so it
                reads as filled on the lifted white pill; the Lernen book stays
                an outline (a filled book blob reads worse than the open book). */}
            <Icon className={cn("h-4 w-4", fillActive && tab === id && "fill-current")} />
            {label}
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
