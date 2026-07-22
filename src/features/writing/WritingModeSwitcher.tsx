import { motion, useReducedMotion } from "framer-motion";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import type { WritingMode } from "./resumeDraft";
import { cn } from "@/lib/utils";

/**
 * Fokus / Kurz / Lang mode switcher for Schreibtraining (redesign, s148: aligned
 * to the Bibliothek design language). This is the PAGE HEADER now (no separate
 * eyebrow + H1 above it), the exact twin of the Bibliothek `LibrarySwitcher`: a
 * lifted, full-width `rounded-full` bar on a recessed grey track, the active
 * segment reading as the current section title (bold + brand) with a single
 * always-mounted white pill that glides on a pure transform (`useSlidingPill`).
 *
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
      role="tablist"
      aria-label="Schreibmodus"
      // Doubles as the page header (founder s148, matching Bibliothek): a lifted
      // full-width bar (shadow) anchors the top of the page, the active mode
      // reads as the section title (bold + brand) and the others stay quiet.
      // `relative` is the positioning context the pill measures against.
      className={cn(
        "relative flex w-full items-stretch gap-0.5 rounded-full border border-border bg-muted p-1 shadow-soft sm:gap-1",
        className,
      )}
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute top-1 bottom-1 left-0 rounded-full bg-surface shadow-soft"
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
            role="tab"
            aria-selected={active}
            className={cn(
              "relative z-10 flex-1 whitespace-nowrap rounded-full px-1.5 py-2.5 text-center text-sm leading-none transition-colors sm:px-3",
              active
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}
