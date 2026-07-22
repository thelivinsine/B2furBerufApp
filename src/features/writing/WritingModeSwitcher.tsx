import { motion, useReducedMotion } from "framer-motion";
import { PenLine } from "lucide-react";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import type { WritingMode } from "./resumeDraft";
import { cn } from "@/lib/utils";

/**
 * Fokus / Kurz / Lang mode switcher for Schreibtraining (plan:
 * docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md). Same lifted-white sliding-pill
 * language as the Bibliothek ViewSwitcher, but text segments instead of icons.
 * Fokus = the single-sentence grammar lab; Kurz/Lang = the guided writing tasks
 * (they map to the old length short/long).
 */

const MODES: { id: WritingMode; label: string }[] = [
  { id: "fokus", label: "Fokus" },
  { id: "kurz", label: "Kurz" },
  { id: "lang", label: "Lang" },
];

export function WritingModeSwitcher({
  value,
  onChange,
  className,
}: {
  value: WritingMode;
  onChange: (mode: WritingMode) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(value);
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="group"
      aria-label="Schreibmodus"
      className={cn(
        "relative inline-flex h-10 items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5",
        className,
      )}
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute top-0.5 bottom-0.5 left-0 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {MODES.map((mode) => {
        const active = mode.id === value;
        return (
          <button
            key={mode.id}
            ref={registerItem(mode.id)}
            onClick={() => onChange(mode.id)}
            aria-pressed={active}
            className={cn(
              "relative z-10 inline-flex h-9 items-center gap-1.5 rounded-md px-4 text-sm font-semibold transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode.id === "fokus" && <PenLine className="h-3.5 w-3.5" />}
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
