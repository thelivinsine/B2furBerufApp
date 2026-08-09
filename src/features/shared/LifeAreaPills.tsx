import { LIFE_AREAS, type LifeAreaId } from "@/lib/lifeAreas";
import { useUiLang } from "@/lib/uiLang";
import { cn } from "@/lib/utils";

/**
 * The **Lebensbereich** pills: Berufsleben · Alltag, one control shared by every
 * filter and Aufgabe rail in the app (founder, s184: "a clear Berufsleben and
 * Alltag pill in each and every filter or aufgabe rail, right below the
 * Branchen filter").
 *
 * Why here and not per rail: `lib/lifeAreas.ts` is the ONE app-wide fold, and
 * the surfaces that fold on their own always drift apart (that is what s181
 * fixed for the Thema dropdowns). One component means the Bibliothek tabs and
 * the Schreiben rail cannot diverge in wording, geometry or behavior.
 *
 * Behavior, deliberately NOT the multi-select facet semantics used elsewhere:
 * with exactly two options "both selected" and "none selected" mean the same
 * thing, so this is a single-select that toggles OFF. Tap Berufsleben → only
 * Berufsleben; tap it again → everything. The resting state (nothing selected)
 * is "beides", which is why there is no third "Alle" pill: an always-on pill row
 * with an explicit all-state would put three chips where the app's whole
 * categorization law says two.
 *
 * Visuals are the FilterRail facet-pill recipe verbatim, layout included: a
 * content-sized wrapping pill row (squircle `rounded-md`, white `bg-surface`
 * unselected so it pops off both the grey Bibliothek tile and the Himmelblau
 * Schreiben tile, brand-blue fill when active, honest count that stays on a
 * greyed-out zero). It is the same row Wortart and Häufigkeit render two
 * sections below, which is the point. An equal-width 2-column grid was tried
 * first and truncated "Berufsleben" against a four-digit count in the 16rem
 * desktop rail; content-sized pills fit and wrap on their own if they ever stop
 * fitting.
 */
export function LifeAreaPills({
  value,
  onChange,
  counts,
  disableZero = true,
  className,
}: {
  /** Active area, "" = beides (the resting state). */
  value: LifeAreaId | "";
  onChange: (next: LifeAreaId | "") => void;
  /** Items each area would yield in the current scope. Shown on every pill. */
  counts: Record<LifeAreaId, number>;
  /**
   * Grey out a zero-count pill (the default, and the founder's zero-yield rule).
   * Redemittel passes `false` for the same reason the Branche dropdown stays
   * selectable at zero: an untagged Wendung is universal and shows under BOTH
   * areas, so the count is a dedicated-content signal, not the yield.
   */
  disableZero?: boolean;
  className?: string;
}) {
  // s207: `LIFE_AREAS` already carries `titleEn` ("Working life" / "Daily
  // life"), so the pills read it directly instead of going through the string
  // dictionary. Same fold, one source.
  const lang = useUiLang();
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {LIFE_AREAS.map((area) => {
        const selected = value === area.id;
        const count = counts[area.id];
        // Zero-yield greys out with its honest count, exactly like a facet pill.
        // The active pill never disables: it is the way back out of an empty
        // scope.
        const disabled = disableZero && count === 0 && !selected;
        return (
          <button
            key={area.id}
            type="button"
            onClick={() => !disabled && onChange(selected ? "" : area.id)}
            disabled={disabled}
            aria-pressed={selected}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors lg:gap-1 lg:px-2 lg:py-0.5 lg:text-xs",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : disabled
                  ? "cursor-not-allowed border-border/50 bg-transparent text-muted-foreground/40"
                  : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface/70",
            )}
          >
            {lang === "de" ? area.titleDe : area.titleEn}
            <span
              className={cn(
                "text-xs tabular-nums lg:text-[11px]",
                selected
                  ? "text-primary-foreground/80"
                  : disabled
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Count both areas in one pass over a list, for the pills' `counts` prop. */
export function countLifeAreas<T>(
  items: readonly T[],
  areaOf: (item: T) => LifeAreaId | undefined,
): Record<LifeAreaId, number> {
  const counts: Record<LifeAreaId, number> = { professional: 0, personal: 0 };
  for (const item of items) {
    const area = areaOf(item);
    if (area) counts[area] += 1;
  }
  return counts;
}
