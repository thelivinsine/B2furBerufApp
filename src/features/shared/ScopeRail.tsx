import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Lock, RotateCcw, Target, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The ONE "Aufgabe wählen" rail, shared by every module that lets a learner
 * scope what they practise (s196).
 *
 * It is `WritingRail`'s tile and dropdown, lifted out of it unchanged: the
 * Himmelblau FILL with no visible edge (founder s149/s169), the uppercase
 * eyebrow section labels, the Bibliothek-language scope dropdowns with honest
 * zero-yield counts, the always-active reset, and the panel variant's X.
 *
 * It was extracted because Sprechen, Lesen and Hören needed the same control
 * (founder s196: "it should somehow look like Schreiben with a filter rail like
 * Schreiben Aufgabe wählen tile. Same should apply for Lesen and Hören"), and
 * the app's law is to extend the existing design system rather than grow a
 * second one. Anything visual belongs HERE now, so a change reaches all four
 * modules at once.
 */

export interface ScopeOption {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
  /**
   * LOCKED, not merely zero-yield (founder s199). A locked option is one the app
   * has no DEDICATED content for: picking it could only serve the universal pool
   * behind it, which is what made Branche feel like a working filter while it
   * quietly changed nothing. It renders with a padlock so "we have nothing
   * specific here" stops looking like "your other filters emptied this".
   */
  locked?: boolean;
}

export interface ScopeGroup {
  /** A group with an empty label renders headerless. */
  label: string;
  options: ScopeOption[];
}

/**
 * Single-select scope dropdown in the Bibliothek language: grouped listbox
 * popover, outside-click/Escape close, zero-yield options greyed WITH their
 * honest count still printed.
 */
export function ScopeSelect({
  ariaLabel,
  triggerLabel,
  groups,
  value,
  onChange,
}: {
  ariaLabel: string;
  triggerLabel: string;
  groups: ScopeGroup[];
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const row = (opt: ScopeOption) => {
    const selected = opt.value === value;
    const off = (opt.disabled || opt.locked) && !selected;
    return (
      <button
        key={opt.value || "__all"}
        type="button"
        role="option"
        aria-selected={selected}
        aria-disabled={off || undefined}
        disabled={off}
        onClick={() => {
          if (off) return;
          onChange(opt.value);
          setOpen(false);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
          selected
            ? "bg-primary/10 font-medium text-primary"
            : off
              ? "cursor-not-allowed text-muted-foreground/40"
              : "hover:bg-muted/60",
        )}
      >
        {opt.locked && !selected && <Lock className="h-3 w-3 shrink-0" aria-hidden />}
        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
        {/* The count stays on a greyed option (founder rule: zero-yield options
            grey out with HONEST counts). Hiding it made "unavailable" and
            "nothing here for your other filters" look identical. */}
        {opt.count != null && (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              selected
                ? "text-primary/70"
                : off
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground",
            )}
          >
            {opt.count}
          </span>
        )}
        {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
      </button>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 lg:px-2.5 lg:py-1.5 lg:text-xs"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{triggerLabel}</span>
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
            aria-label={ariaLabel}
            // Micro-motion pass (s149 P2): one quick fade/slide for every
            // popover, matching the panel timing family.
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.12, ease: "easeOut" }}
            className="slim-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
          >
            {groups.map((g, gi) => (
              <div key={g.label || gi}>
                {g.label && (
                  <p className="mt-1.5 px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {g.label}
                  </p>
                )}
                {g.options.map(row)}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** The uppercase eyebrow above each scope section. One class, one place. */
export const scopeSectionLabel =
  "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

/** One labelled scope section inside a rail. */
export function ScopeSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className={cn("mb-2", scopeSectionLabel)}>{label}</p>
      {children}
    </section>
  );
}

/**
 * The whole-control locked state (founder s199): what a scope section renders
 * INSTEAD of its dropdown when the app has no dedicated content for any option.
 *
 * Fifteen padlocked rows say the same thing fifteen times, which is the
 * redundancy rule's exact target, and on Lesen/Hören it would be the normal
 * sight (only 4 of 52 texts carry a Branche tag). One line says it once. The
 * box is dashed and border-only on purpose: it is an absence, so it must not
 * look like a control that could be pressed, and it must not wear the accent
 * fill, which belongs to rails and the buttons that open them.
 */
export function ScopeLocked({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-2 rounded-lg border border-dashed border-border px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
      <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}

/**
 * The rail TILE: header row ("Aufgabe wählen" + reset, plus the panel variant's
 * close), a tinted divider, then whatever sections the module puts inside it.
 */
export function ScopeRail({
  children,
  onReset,
  onClose,
  layout = "rail",
  title = "Aufgabe wählen",
  icon: Icon = Target,
  resetLabel = "Zurücksetzen und neue Aufgabe ziehen",
  className,
}: {
  children: React.ReactNode;
  /**
   * Full reset (always active): clears every scope AND redraws.
   *
   * Optional since s202, for the ONE rail that filters nothing: the Sprechen
   * Redemittel rail browses phrases rather than narrowing a list, so a reset
   * there would sit at its default doing nothing, which is the founder's
   * dead-control rule. Absent = no reset icon, never a disabled one.
   */
  onReset?: () => void;
  /** Close handler for the panel's X icon (mobile). */
  onClose?: () => void;
  layout?: "rail" | "panel";
  title?: string;
  /** The mark beside the title. Defaults to the Aufgabe rail's target. */
  icon?: typeof Target;
  resetLabel?: string;
  className?: string;
}) {
  const panel = layout === "panel";
  return (
    <aside
      role={panel ? "region" : undefined}
      aria-label={title}
      // Himmelblau FILL (founder s149): a light accent wash instead of the grey
      // bg-muted; dark mode gets its own quieter alpha so the wash reads as a
      // cool sky tint, not murky teal. NO visible outline (founder s169): the
      // border carries the fill's own colour and the tile is separated from the
      // page by `shadow-soft` alone, the same lift the Bibliothek word cards
      // use. A grey edge around a blue wash read as dirty. No overflow clipping
      // on the tile: the dropdown popovers must escape it (their lists scroll
      // internally).
      className={cn(
        "rounded-xl border border-accent/20 bg-accent/20 shadow-soft dark:border-accent/10 dark:bg-accent/10",
        className,
      )}
    >
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary">
          <Icon className="h-4 w-4" />
          {title}
        </span>
        {/* Always active (founder s149 P2): clears every scope AND draws a
            fresh random Aufgabe, so the button always visibly does something. */}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            aria-label={resetLabel}
            title={resetLabel}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        )}
        {panel && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            title="Schließen"
            className="-mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* NO divider and no second fill (founder s199: "the header and footer of
          the filter rail seems to look like separate pieces attached to the main
          body"). The tile is ONE shade end to end: the header sits on the same
          wash as the body, and the rule that used to separate them is gone. The
          s169 note this replaces was right that a divider here must never be
          neutral grey; the answer turned out to be no divider at all. */}
      <div className="px-3 pb-3 pt-0.5">
        <div className="space-y-4">{children}</div>
      </div>
    </aside>
  );
}
