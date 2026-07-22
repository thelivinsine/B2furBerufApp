import { Loader2, RotateCcw } from "lucide-react";
import { GRAMMAR_AXES, type AxisId } from "./grammarDimensions";
import type { FokusSelection } from "./useFokusMachine";
import { cn } from "@/lib/utils";

/**
 * The grammar-dimension rail for the Fokus Satzlabor (plan:
 * docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md). Borrows the Bibliothek FilterRail
 * VISUAL language (grey bg-muted tile, uppercase eyebrow section labels, pill
 * sizing) but is a distinct component: FilterRail narrows a list by counted
 * facets, this one shows DETECTED state and accepts a TARGET.
 *
 * Tri-state pills, and detected != selected:
 *   - aktuell  (detected): soft fill + dot. Reads as a STATUS chip. Fill = fact.
 *   - target   (tappable): outlined. The "do something" affordance.
 *   - selected (ring): the transform currently shown below. Ring = your action.
 * A pill can be both current and selected (they coincide) -> shows the aktuell
 * fill (no ring). When they differ, both are visible at once (the "from" fill and
 * the "to" ring), which is the whole write->correct->transform story made legible.
 */

interface GrammarRailProps {
  /** Detected base grammar of the corrected sentence. */
  detected: { voice: string | null; tense: string | null };
  /** The learner's current target selection. */
  selection: FokusSelection;
  /** Whether the pills are interactive yet (a correction exists). */
  enabled: boolean;
  /** The pill mid-transform (for the inline spinner). */
  loadingValue?: string | null;
  onSelect: (axis: AxisId, value: string) => void;
  onReset: () => void;
  /** "rail" = desktop right aside; "chips" = mobile horizontal row. */
  layout?: "rail" | "chips";
  className?: string;
}

function pillState(
  value: string,
  detectedValue: string | null,
  selectedValue: string,
): "current" | "selected" | "idle" {
  const isCurrent = value === detectedValue;
  const isSelected = value === selectedValue && selectedValue !== detectedValue;
  if (isCurrent) return "current";
  if (isSelected) return "selected";
  return "idle";
}

function Pill({
  axis,
  value,
  label,
  state,
  enabled,
  loading,
  onSelect,
  compact,
}: {
  axis: AxisId;
  value: string;
  label: string;
  state: "current" | "selected" | "idle";
  enabled: boolean;
  loading: boolean;
  onSelect: (axis: AxisId, value: string) => void;
  compact?: boolean;
}) {
  const isCurrent = state === "current";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={state !== "idle"}
      aria-label={
        isCurrent ? `${label}, aktuelle Form` : `Satz in ${label} umformen`
      }
      disabled={!enabled}
      onClick={() => onSelect(axis, value)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg border font-semibold transition-colors",
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm",
        !enabled && "cursor-not-allowed opacity-40",
        state === "current" &&
          "border-primary/35 bg-primary/12 text-primary",
        state === "selected" &&
          "border-primary bg-surface text-primary ring-2 ring-primary",
        state === "idle" &&
          "border-border bg-surface text-foreground hover:bg-muted/60",
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isCurrent ? (
        <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      ) : null}
      {label}
      {isCurrent && !compact && (
        <span className="text-[9px] font-extrabold uppercase tracking-wide text-primary/80">
          aktuell
        </span>
      )}
    </button>
  );
}

export function GrammarRail({
  detected,
  selection,
  enabled,
  loadingValue,
  onSelect,
  onReset,
  layout = "rail",
  className,
}: GrammarRailProps) {
  const detectedCount = (detected.voice ? 1 : 0) + (detected.tense ? 1 : 0);
  const canReset = selection.voice !== detected.voice || selection.tense !== detected.tense;

  if (layout === "chips") {
    // Mobile: a single horizontal, scrollable chip row with tiny group labels.
    return (
      <div
        className={cn("no-scrollbar flex items-center gap-2 overflow-x-auto py-1", className)}
        role="group"
        aria-label="Grammatik"
      >
        {GRAMMAR_AXES.map((axis) => {
          const selectedValue = selection[axis.id];
          const detectedValue = detected[axis.id];
          return (
            <div key={axis.id} className="flex shrink-0 items-center gap-2" role="radiogroup" aria-label={axis.label}>
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {axis.short}
              </span>
              {axis.values.map((v) => (
                <Pill
                  key={v.id}
                  axis={axis.id}
                  value={v.id}
                  label={v.short ?? v.label}
                  state={pillState(v.id, detectedValue, selectedValue)}
                  enabled={enabled}
                  loading={loadingValue === v.id}
                  onSelect={onSelect}
                  compact
                />
              ))}
            </div>
          );
        })}
      </div>
    );
  }

  // Desktop: the grey rail aside.
  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-muted p-4 shadow-soft lg:sticky lg:top-20",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold">Grammatik</p>
          <p className="text-xs font-semibold text-muted-foreground">
            {enabled ? `${detectedCount} erkannt` : "Satz prüfen"}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          aria-label="Auf den korrigierten Satz zurücksetzen"
          title="Zurücksetzen"
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted-foreground transition-colors",
            canReset ? "hover:text-foreground" : "cursor-not-allowed opacity-40",
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-4">
        {GRAMMAR_AXES.map((axis) => {
          const selectedValue = selection[axis.id];
          const detectedValue = detected[axis.id];
          return (
            <div key={axis.id} role="radiogroup" aria-label={axis.label}>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                {axis.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {axis.values.map((v) => (
                  <Pill
                    key={v.id}
                    axis={axis.id}
                    value={v.id}
                    label={v.label}
                    state={pillState(v.id, detectedValue, selectedValue)}
                    enabled={enabled}
                    loading={loadingValue === v.id}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {enabled && (
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          <b className="text-primary">Blau = jetzt.</b> Tippe eine andere Form, um den Satz
          umzuformen.
        </p>
      )}
    </aside>
  );
}
