import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The Prüfung zone's ONE Niveau control (founder s195: "one scope control").
 *
 * A compact scope button rather than a row of pills: the hub's switcher already
 * owns switcher rank on that page, and two grey tracks stacked before any
 * content read as a heavier header than the page they introduce. The
 * Sprechtrainer used to set the same fact with a row of level pills in a
 * different visual language, which is one of the three header languages the
 * zone had; it uses this now.
 *
 * Zero-yield options grey out with their honest count (founder law) and stay
 * pickable, because a dead-looking option a learner cannot inspect is worse
 * than an honest empty state.
 */

export interface LevelOption {
  /** "" is allowed, for a list that offers "Alle". */
  value: string;
  label: string;
  /** The honest count for this option, e.g. "3/4 Module" or "keine Inhalte". */
  note: string;
  /** Renders muted: nothing to serve at this level. */
  empty?: boolean;
}

export function LevelSelect({
  value,
  options,
  onSelect,
  label = "Niveau",
  className,
}: {
  value: string;
  options: LevelOption[];
  onSelect: (value: string) => void;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      // Focus goes back where it came from, or it is left on a node that just
      // stopped existing (s194 audit P27).
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /** Up/Down walk the options; Enter and Space are the buttons' own defaults. */
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    const items = Array.from(
      e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'),
    );
    const at = items.indexOf(document.activeElement as HTMLButtonElement);
    const next =
      e.key === "ArrowDown"
        ? (at + 1) % items.length
        : (at - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  const current = options.find((o) => o.value === value) ?? options[0];

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className="flex h-9 items-center gap-1.5 rounded-lg border border-border bg-surface pl-3 pr-2 text-sm shadow-soft transition-colors hover:border-primary/40"
      >
        <span className="text-muted-foreground">{label}</span>
        <span className="font-bold tabular-nums">{current?.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label={label}
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.12, ease: "easeOut" }}
            onKeyDown={onListKey}
            className="absolute right-0 top-full z-20 mt-1 w-44 rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
          >
            {options.map((o) => {
              const selected = o.value === value;
              return (
                <button
                  key={o.value || "__all"}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onSelect(o.value);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    selected
                      ? "bg-primary/10 font-medium text-primary"
                      : o.empty
                        ? "text-muted-foreground hover:bg-muted/60"
                        : "hover:bg-muted/60",
                  )}
                >
                  <span className="flex-1 tabular-nums">{o.label}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {o.note}
                  </span>
                  {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
