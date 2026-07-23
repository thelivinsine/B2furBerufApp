import { Loader2, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { GRAMMAR_AXES, type AxisId } from "./grammarDimensions";
import type { FokusSelection } from "./useFokusMachine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The grammar-dimension rail for the Fokus Satzlabor, in the exact Bibliothek
 * FilterRail language (Bibliothek-extension redesign, s148): grey bg-muted
 * tile, brand header row, uppercase eyebrow section labels, white rounded
 * facet pills. It is still a distinct component: FilterRail narrows a list by
 * counted facets, this one shows DETECTED state and accepts a TARGET.
 *
 * Pill states (founder-simplified, s148):
 *   - erkannt  (detected): white pill with a GREEN dot. Fact, quiet.
 *   - Ziel     (selected): solid primary pill. Your action, loud.
 *   - idle     (tappable): plain white pill.
 * A pill can be both detected and selected (they coincide) -> it shows as the
 * detected green-dot pill (nothing to transform).
 *
 * Desktop = the sticky right aside (`layout="rail"`) with a "Neuer Satz"
 * footer. Mobile = the same tile as a collapsible panel (`layout="panel"`)
 * behind a toolbar button; Neuer Satz lives beside that button, so the panel
 * has no footer.
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
  /** Reset the transform target back to the detected form (header icon). */
  onReset?: () => void;
  /** Whether the selection differs from the detected base (enables reset). */
  canReset?: boolean;
  /** Start over with a fresh sentence (rail layout's footer button). */
  onNewSentence?: () => void;
  /** Close handler for the panel's X icon (mobile). */
  onClose?: () => void;
  /** "rail" = desktop right aside; "panel" = mobile collapsible tile. */
  layout?: "rail" | "panel";
  className?: string;
}

function pillState(
  value: string,
  detectedValue: string | null,
  selectedValue: string,
  enabled: boolean,
): "current" | "selected" | "idle" {
  // Before a correction exists nothing is detected or chosen: everything reads
  // idle instead of showing the default selection as a blue "target".
  if (!enabled) return "idle";
  if (value === detectedValue) return "current";
  if (value === selectedValue && selectedValue !== detectedValue) return "selected";
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
}: {
  axis: AxisId;
  value: string;
  label: string;
  state: "current" | "selected" | "idle";
  enabled: boolean;
  loading: boolean;
  onSelect: (axis: AxisId, value: string) => void;
}) {
  const isCurrent = state === "current";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={state !== "idle"}
      aria-label={isCurrent ? `${label}, erkannte Form` : `Satz in ${label} umformen`}
      disabled={!enabled}
      onClick={() => onSelect(axis, value)}
      className={cn(
        // The FilterRail facet-pill recipe: roomier tap size on mobile (the
        // panel), compact in the lg desktop rail.
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition-colors lg:gap-1 lg:px-2 lg:py-0.5 lg:text-xs",
        !enabled && "cursor-not-allowed opacity-40",
        state === "selected"
          ? "border-primary bg-primary font-semibold text-primary-foreground"
          : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface/70",
      )}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : isCurrent ? (
        <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden />
      ) : null}
      {label}
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
  canReset = false,
  onNewSentence,
  onClose,
  layout = "rail",
  className,
}: GrammarRailProps) {
  const panel = layout === "panel";

  const body = (
    <div className="space-y-5">
      {GRAMMAR_AXES.map((axis) => {
        const selectedValue = selection[axis.id];
        const detectedValue = detected[axis.id];
        return (
          <section key={axis.id} role="radiogroup" aria-label={axis.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {axis.label}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {axis.values.map((v) => (
                <Pill
                  key={v.id}
                  axis={axis.id}
                  value={v.id}
                  label={v.label}
                  state={pillState(v.id, detectedValue, selectedValue, enabled)}
                  enabled={enabled}
                  loading={loadingValue === v.id}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </section>
        );
      })}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {enabled ? (
          <>
            {/* Two lines (founder s149): the legend, then the instruction. */}
            <b className="block text-success">Grüner Punkt = erkannte Form.</b>
            Tippe eine andere Form, um den Satz umzuformen.
          </>
        ) : (
          <>Prüf zuerst deinen Satz, dann erkennt die KI Aktiv/Passiv und die Zeitform.</>
        )}
      </p>
    </div>
  );

  return (
    <aside
      role={panel ? "region" : undefined}
      aria-label="Grammatik"
      // Same Himmelblau tile as the Aufgabe-wählen rail (s149 harmonization;
      // was grey), with quieter dark-mode alphas.
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-accent/50 bg-accent/20 shadow-soft dark:border-accent/25 dark:bg-accent/10",
        panel && "max-h-[45dvh]",
        className,
      )}
    >
      {/* Header row: brand label + reset icon (+ panel close). */}
      <div className="flex shrink-0 items-center gap-1 px-3 py-2.5">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary">
          <SlidersHorizontal className="h-4 w-4" />
          Grammatik
        </span>
        {onReset && (
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

      <div className="slim-scrollbar min-h-0 flex-1 overflow-y-auto border-t border-accent/50 p-3 dark:border-accent/25">
        {body}
      </div>

      {/* Footer (desktop rail only): start over with a fresh sentence. */}
      {!panel && onNewSentence && (
        <div className="shrink-0 border-t border-accent/50 p-3 dark:border-accent/25">
          <Button
            variant="outline"
            className="h-10 w-full"
            onClick={onNewSentence}
            disabled={!enabled}
          >
            <RotateCcw className="h-3.5 w-3.5" /> Neuer Satz
          </Button>
        </div>
      )}
    </aside>
  );
}
