import { lazy, Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dumbbell, Play } from "lucide-react";
import { cn } from "@/lib/utils";

// Both tabs import the mission bank, so they load lazily to keep the content
// bank off the Dashboard's eager path (bundle budget, CLAUDE.md). Üben is the
// Neuland journey map; Spielen is the Neuland world hub (the same mission list
// as /welt), which deep-links back to /welt to play a mission full-screen.
const UebenPath = lazy(() => import("./UebenPath"));
const SpielenHub = lazy(() => import("./SpielenHub"));

type HeuteTab = "ueben" | "spielen";

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Üben / Spielen: the two ways into the day, centred. Üben opens by
          default. The greeting + streak live in the top row; the daily-goal ring
          moved to Fortschritt (s86), so Heute no longer repeats progress. */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        role="tablist"
        aria-label="Modus"
        className="mx-auto flex w-fit gap-1 rounded-full border border-border bg-muted p-1"
      >
        {(
          [
            { id: "ueben", label: "Üben", Icon: Dumbbell, tint: "text-accent", fillActive: false },
            { id: "spielen", label: "Spielen", Icon: Play, tint: "text-orange-500", fillActive: true },
          ] as const
        ).map(({ id, label, Icon, tint, fillActive }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition",
              // Active tab lifts on the white pill and picks up its section's
              // subtle tint (Üben = teal/accent + dumbbell icon, Spielen =
              // orange + play icon). The tile mats keep a neutral gray border
              // (founder: colored borders read poorly), so the color lives on
              // the toggle only.
              tab === id
                ? cn("bg-surface shadow-soft", tint)
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {/* Play fills solid when active (matches its game feel); the
                Dumbbell is a line icon that turns to a blob if filled, so it
                stays stroked and relies on the tint + lifted pill for the
                active state. */}
            <Icon className={cn("h-4 w-4", fillActive && tab === id && "fill-current")} />
            {label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-auto max-w-md"
        >
          <Suspense fallback={fallback}>
            {tab === "ueben" ? <UebenPath /> : <SpielenHub />}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
