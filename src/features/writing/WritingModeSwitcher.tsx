import { motion, useReducedMotion } from "framer-motion";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import type { WritingMode } from "./resumeDraft";
import { cn } from "@/lib/utils";

/**
 * The Schreiben page-header switcher (Bibliothek-extension redesign, s148).
 * Exactly the LibrarySwitcher language: a full-width recessed grey track with
 * a single sliding white pill, the active segment bold + brand. It doubles as
 * the page header (no separate H1, the s92 Bibliothek rule), so Verlauf is the
 * fourth segment instead of a separate toggle: Fokus · Kurz · Lang · Verlauf.
 */

export type WritingTab = WritingMode | "verlauf";

const TABS: { id: WritingTab; label: string }[] = [
  { id: "fokus", label: "Fokus" },
  { id: "kurz", label: "Kurz" },
  { id: "lang", label: "Lang" },
  { id: "verlauf", label: "Verlauf" },
];

export function WritingModeSwitcher({
  value,
  onChange,
  className,
}: {
  value: WritingTab;
  onChange: (tab: WritingTab) => void;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(value);
  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label="Schreiben"
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
          transition={
            reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }
          }
        />
      )}
      {TABS.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            ref={registerItem(tab.id)}
            onClick={() => onChange(tab.id)}
            role="tab"
            aria-selected={active}
            className={cn(
              "relative z-10 flex-1 whitespace-nowrap rounded-full px-1.5 py-2.5 text-center text-sm leading-none transition-colors sm:px-3",
              active
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
