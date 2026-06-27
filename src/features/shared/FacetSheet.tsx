import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Shared faceted filter (Taxonomy Phase 3, step 1). A "Filter" chip opens a
 * slide-up sheet of facet groups; each option pill shows a **live count** and is
 * **greyed out when it would yield zero** results, so the learner can never tap
 * their way to an empty screen. Logic is AND-across-facets / OR-within-facet.
 *
 * Generic over the item type: each facet supplies a `get(item)` accessor, so the
 * same component drives any browser (vocab, collocations, …). State lives in the
 * parent (URL params) via `selection` + `onChange`.
 */
export interface FacetOption {
  value: string;
  label: string;
}

export interface FacetDef<T> {
  id: string;
  label: string;
  hint?: string;
  options: FacetOption[];
  /** The item's value for this facet (undefined = item carries no value here). */
  get: (item: T) => string | undefined;
}

export type FacetSelection = Record<string, string[]>;

/** True when an item satisfies every active facet (empty facet = no constraint). */
export function matchesFacets<T>(
  item: T,
  facets: FacetDef<T>[],
  selection: FacetSelection,
): boolean {
  return facets.every((f) => {
    const sel = selection[f.id];
    if (!sel || sel.length === 0) return true;
    const v = f.get(item);
    return v !== undefined && sel.includes(v);
  });
}

/** Apply the whole selection to a list. */
export function applyFacets<T>(
  items: T[],
  facets: FacetDef<T>[],
  selection: FacetSelection,
): T[] {
  return items.filter((i) => matchesFacets(i, facets, selection));
}

/** Total number of options currently selected across all facets. */
export function activeFacetCount(selection: FacetSelection): number {
  return Object.values(selection).reduce((n, vs) => n + (vs?.length ?? 0), 0);
}

export function FacetSheet<T>({
  items,
  facets,
  selection,
  onChange,
  resultLabel,
  triggerClassName,
}: {
  items: T[];
  facets: FacetDef<T>[];
  selection: FacetSelection;
  onChange: (next: FacetSelection) => void;
  /** Noun phrase for the apply button, e.g. (n) => `${n} Kollokationen`. */
  resultLabel: (n: number) => string;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  // Draft so the sheet previews counts live but only commits on "Apply".
  const [draft, setDraft] = useState<FacetSelection>(selection);

  const activeCount = activeFacetCount(selection);

  const openSheet = () => {
    setDraft(selection);
    setOpen(true);
  };

  const toggle = (facetId: string, value: string) => {
    setDraft((prev) => {
      const cur = prev[facetId] ?? [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...prev, [facetId]: next };
    });
  };

  // Count for one option = items matching every OTHER facet's draft selection
  // plus this value (so the number reflects what tapping it would yield).
  const optionCount = (facet: FacetDef<T>, value: string) => {
    const others = facets.filter((f) => f.id !== facet.id);
    return items.filter(
      (i) => facet.get(i) === value && matchesFacets(i, others, draft),
    ).length;
  };

  const draftResult = applyFacets(items, facets, draft).length;

  const apply = () => {
    // Drop empty arrays so the URL stays clean.
    const cleaned: FacetSelection = {};
    for (const [k, v] of Object.entries(draft)) if (v && v.length) cleaned[k] = v;
    onChange(cleaned);
    setOpen(false);
  };

  const reset = () => setDraft({});

  return (
    <>
      <button
        onClick={openSheet}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
          activeCount > 0
            ? "border-primary bg-primary/10 text-primary"
            : "border-border/60 bg-white text-foreground hover:border-primary/40 dark:bg-white/10 dark:border-white/15",
          triggerClassName,
        )}
      >
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filter
        {activeCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          className="bottom-0 left-0 right-0 top-auto grid-rows-[auto_auto_minmax(0,1fr)_auto] max-h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 gap-0 overflow-y-hidden rounded-b-none rounded-t-2xl border-x-0 border-b-0 p-0 sm:left-1/2 sm:right-auto sm:w-[calc(100%-2rem)] sm:max-w-lg sm:-translate-x-1/2"
        >
          {/* Grab handle */}
          <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-border" />

          <div className="flex items-center justify-between px-5 pb-3 pt-3 pr-14">
            <DialogTitle>Filter</DialogTitle>
            {activeFacetCount(draft) > 0 && (
              <button
                onClick={reset}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          <div className="min-h-0 space-y-5 overflow-y-auto px-5 pb-4">
            {facets.map((facet) => (
              <div key={facet.id}>
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-semibold">{facet.label}</span>
                  {facet.hint && (
                    <span className="text-xs text-muted-foreground">{facet.hint}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {facet.options.map((opt) => {
                    const selected = (draft[facet.id] ?? []).includes(opt.value);
                    const count = optionCount(facet, opt.value);
                    const disabled = count === 0 && !selected;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => !disabled && toggle(facet.id, opt.value)}
                        disabled={disabled}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : disabled
                              ? "cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground/40"
                              : "border-border/60 bg-white text-foreground hover:border-primary/40 dark:bg-white/10 dark:border-white/15",
                        )}
                      >
                        {opt.label}
                        <span
                          className={cn(
                            "text-xs",
                            selected ? "text-primary-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border p-4">
            <button
              onClick={apply}
              className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {resultLabel(draftResult)}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

/** A removable chip summarising one active facet value, for the filter bar. */
export function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
      {label}
      <button onClick={onRemove} aria-label={`${label} entfernen`} className="hover:text-primary/70">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}
