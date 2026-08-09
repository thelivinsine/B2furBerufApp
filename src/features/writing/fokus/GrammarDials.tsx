import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useT } from "@/lib/uiLang";
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
  bottomLimit,
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
  /**
   * Viewport y of the top of the fixed bottom chrome (action cluster, KI line,
   * tab bar). Only the trainer knows where that chrome sits, and once a long
   * correction lets the page scroll the tile's own foot slides underneath it,
   * so the picker needs this as its real floor.
   */
  bottomLimit?: () => number;
  className?: string;
}) {
  const t = useT();
  const [open, setOpen] = useState<AxisId | null>(null);
  const rootRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  /**
   * Where the open picker fits. The tile is the LAST element of the mobile
   * column and the column is sized to end exactly at the fixed bottom chrome,
   * so the tile's own bottom edge is as far down as a picker may reach: below
   * it lies the action cluster, the KI line and the tab bar, which clipped the
   * downward-only picker (a dial near the tile foot lost its last options with
   * no scroll to reach them). Upward it may overlay the sentence card, which is
   * what "the pickers must escape the tile" always meant.
   */
  const [placement, setPlacement] = useState<{ up: boolean; maxH: number; shift: number } | null>(
    null,
  );

  // Dropdown housekeeping: a disabling state change (fresh sentence) closes a
  // stale picker; outside tap or Escape closes an open one.
  useEffect(() => {
    if (!enabled) setOpen(null);
  }, [enabled]);
  // Measure the picker where it would open (downward, natural height), then
  // place it: flip up when it would not clear the tile's foot and there is more
  // room above, cap it to the room it actually has, and nudge it back inside
  // the viewport when a dial near the edge would push it off screen. Runs
  // before paint, so the picker never appears in the wrong spot.
  useLayoutEffect(() => {
    if (!open) {
      setPlacement(null);
      return;
    }
    const pop = popRef.current;
    const trigger = triggerRef.current;
    const root = rootRef.current;
    if (!pop || !trigger || !root) return;
    const GAP = 4; // matches mt-1 / mb-1
    const EDGE = 8;
    const HEADER = 72; // the sticky app header, which the picker must not slide under
    const t = trigger.getBoundingClientRect();
    const floor = Math.min(
      root.getBoundingClientRect().bottom,
      bottomLimit?.() ?? Number.POSITIVE_INFINITY,
    );
    const below = floor - t.bottom - GAP;
    const above = t.top - HEADER - GAP;
    const up = pop.scrollHeight > below && above > below;
    const r = pop.getBoundingClientRect();
    const shift =
      r.left < EDGE
        ? EDGE - r.left
        : r.right > window.innerWidth - EDGE
          ? window.innerWidth - EDGE - r.right
          : 0;
    setPlacement({ up, maxH: Math.max(88, Math.floor(up ? above : below)), shift });
  }, [open, bottomLimit]);

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
          aria-label={t("Auf die erkannte Form zurücksetzen")}
          title={t("Zurücksetzen")}
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

      {/* Dials centered in the room left over, legend parked at the tile's
          bottom edge (founder s169 follow-up), the same two-region split the
          Fokus sentence card uses. */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 border-t border-accent-ink/10 p-4">
        <div className="flex flex-1 flex-wrap content-center items-start justify-center gap-x-2.5 gap-y-3">
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
                  ref={isOpen ? triggerRef : undefined}
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
                    ref={popRef}
                    role="listbox"
                    aria-label={axis.label}
                    className={cn(
                      "absolute left-1/2 z-30 w-44 overflow-y-auto overscroll-contain rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft",
                      placement?.up ? "bottom-full mb-1" : "top-full mt-1",
                    )}
                    style={{
                      transform: `translateX(calc(-50% + ${placement?.shift ?? 0}px))`,
                      maxHeight: placement?.maxH,
                    }}
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
