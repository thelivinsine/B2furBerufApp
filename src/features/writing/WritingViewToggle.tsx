import { motion, useReducedMotion } from "framer-motion";
import { PenLine, History } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { cn } from "@/lib/utils";

/**
 * Schreiben / Verlauf toggle for Schreibtraining (redesign, s148). Sits in the
 * toolbar row under the mode header, exactly like the Bibliothek `ViewSwitcher`
 * sits under the `LibrarySwitcher`: the same lifted-white sliding-pill language
 * (recessed grey track, active label on a white pill, brand text), but with an
 * icon + word per segment instead of an icon-only view control.
 */
export type WritingHubView = "write" | "history";

const SEGMENTS: { id: WritingHubView; label: string; icon: LucideIcon }[] = [
  { id: "write", label: "Schreiben", icon: PenLine },
  { id: "history", label: "Verlauf", icon: History },
];

export function WritingViewToggle({
  value,
  onChange,
  className,
}: {
  value: WritingHubView;
  onChange: (view: WritingHubView) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(value);
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="group"
      aria-label="Ansicht"
      className={cn(
        "relative inline-flex h-10 shrink-0 items-center gap-0.5 rounded-lg border border-border bg-muted p-0.5",
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
      {SEGMENTS.map((seg) => {
        const active = seg.id === value;
        const Icon = seg.icon;
        return (
          <button
            key={seg.id}
            ref={registerItem(seg.id)}
            onClick={() => onChange(seg.id)}
            aria-pressed={active}
            className={cn(
              "relative z-10 inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors",
              active ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
