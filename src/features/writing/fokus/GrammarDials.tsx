import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Loader2, RotateCcw, SlidersHorizontal } from "lucide-react";
import { GRAMMAR_AXES, valueLabel, type AxisId } from "./grammarDimensions";
import type { FokusSelection } from "./useFokusMachine";
import { cn } from "@/lib/utils";

/**
 * The mobile Grammatik tile of the Fokus Satzlabor (founder-approved r4
 * "Option 2", s168): a Himmelblau tile below the sentence card carrying one
 * DIAL per grammar axis. Each dial shows the sentence's current value for that
 * axis (green dot = the detected form, solid primary = a chosen target) and
 * opens a small picker; choosing a different value transforms the sentence in
 * place. This replaces the collapsed GrammarRail panel behind the old toolbar
 * "Grammatik" toggle, which read as a filter and hid the feature.
 *
 * Desktop keeps the sticky GrammarRail aside; this component is mobile-only.
 */

export function GrammarDials({
  detected,
  selection,
  enabled,
  loadingValue,
  onSelect,
  onReset,
  canReset,
  legend,
  className,
}: {
  detected: { voice: string | null; tense: string | null; mood: string | null };
  selection: FokusSelection;
  enabled: boolean;
  loadingValue?: string | null;
  onSelect: (axis: AxisId, value: string) => void;
  onReset: () => void;
  canReset: boolean;
  /** One line under the dials: legend, refusal reason, or error. */
  legend: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState<AxisId | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  // Dropdown housekeeping: a disabling state change (fresh sentence) closes a
  // stale picker; outside tap or Escape closes an open one.
  useEffect(() => {
    if (!enabled) setOpen(null);
  }, [enabled]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <section
      ref={rootRef}
      aria-label="Grammatik"
      // The rail tile recipe: Himmelblau FILL, border in the fill's own colour
      // and `shadow-soft` for the lift (founder s169: no grey outline on the
      // rails). No overflow clipping, the dial pickers must escape the tile.
      className={cn(
        "flex flex-col rounded-xl border border-accent/20 bg-accent/20 shadow-soft dark:border-accent/10 dark:bg-accent/10",
        className,
      )}
    >
      <div className="flex shrink-0 items-center gap-1 px-3 py-2.5">
        <span
          className={cn(
            "flex flex-1 items-center gap-2 text-sm font-semibold text-primary",
            !enabled && "opacity-50",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Grammatik
        </span>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          aria-label="Auf die erkannte Form zurücksetzen"
          title="Zurücksetzen"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            canReset
              ? "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              : "cursor-not-allowed text-muted-foreground/30",
          )}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center gap-4 border-t border-accent-ink/10 p-4">
        <div className="flex flex-wrap items-start justify-center gap-x-2.5 gap-y-3">
          {GRAMMAR_AXES.map((axis) => {
            const value = selection[axis.id];
            const isDetected = value === detected[axis.id];
            const changed = enabled && !isDetected;
            const isOpen = open === axis.id;
            return (
              <div key={axis.id} className="relative text-center">
                <p
                  className={cn(
                    "mb-1.5 text-[10px] font-bold uppercase tracking-wide text-accent-ink",
                    !enabled && "opacity-50",
                  )}
                >
                  {axis.label}
                </p>
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={isOpen}
                  aria-label={`${axis.label}: ${valueLabel(axis.id, value)}`}
                  disabled={!enabled}
                  onClick={() => setOpen((o) => (o === axis.id ? null : axis.id))}
                  className={cn(
                    "inline-flex h-10 items-center gap-1.5 rounded-lg border px-2.5 text-[13px] font-semibold shadow-soft transition-colors",
                    !enabled && "cursor-not-allowed opacity-40",
                    changed
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/40",
                  )}
                >
                  {loadingValue === value ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : enabled && isDetected ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
                  ) : null}
                  {valueLabel(axis.id, value)}
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
                  />
                </button>
                {isOpen && (
                  <div
                    role="listbox"
                    aria-label={axis.label}
                    className="absolute left-1/2 top-full z-30 mt-1 w-44 -translate-x-1/2 rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
                  >
                    {axis.values.map((v) => {
                      const optDetected = v.id === detected[axis.id];
                      const optSelected = v.id === value && !isDetected;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          role="option"
                          aria-selected={v.id === value}
                          onClick={() => {
                            setOpen(null);
                            onSelect(axis.id, v.id);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                            optSelected
                              ? "bg-primary font-semibold text-primary-foreground"
                              : "hover:bg-muted/60",
                          )}
                        >
                          {optDetected && (
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                          )}
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs leading-relaxed text-muted-foreground">{legend}</p>
      </div>
    </section>
  );
}
