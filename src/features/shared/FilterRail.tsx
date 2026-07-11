import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  matchesFacets,
  type FacetDef,
  type FacetSelection,
  activeFacetCount,
} from "@/features/shared/FacetSheet";
import { SearchField } from "@/features/shared/SearchField";
import type { PrimaryGroup, PrimaryOption } from "@/features/shared/BrowseToolbar";

/**
 * Desktop filter rail (Bibliothek desktop layout, session 91). On lg+ screens
 * the browse tabs show this persistent right-hand column instead of the
 * toolbar-plus-sheet pattern: Suche on top, the primary scope (Thema /
 * Kategorie) as a grouped row list, then every facet as an always-visible
 * pill group. Same state, same URL params, no draft/apply step: every tap
 * commits immediately, and option counts update live (count = what tapping
 * that pill would yield, given every OTHER active constraint). Zero-yield
 * options grey out exactly like the mobile FacetSheet, so the learner can
 * never tap into an empty list.
 *
 * Mobile keeps BrowseToolbar + FacetSheet untouched; the two surfaces are
 * alternate presentations of the same state and never render together.
 */
export interface RailPrimary {
  /** Section heading, e.g. "Thema" or "Kategorie" (microcopy budget: ≤2 words). */
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** The "everything" row rendered first, e.g. "Alle Themen". */
  all: PrimaryOption;
  /** Flat rows (Redemittel categories). */
  options?: PrimaryOption[];
  /** Grouped rows with group headings (the Domain-grouped themes). */
  groups?: PrimaryGroup[];
}

function PrimaryRow({
  option,
  selected,
  onSelect,
}: {
  option: PrimaryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors",
        selected
          ? "bg-primary font-medium text-primary-foreground"
          : "text-foreground hover:bg-muted/60",
      )}
    >
      <span className="min-w-0 truncate">{option.label}</span>
      {option.count != null && (
        <span
          className={cn(
            "shrink-0 text-xs tabular-nums",
            selected ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {option.count}
        </span>
      )}
    </button>
  );
}

export function FilterRail<T>({
  search,
  onSearch,
  searchPlaceholder,
  primary,
  items,
  facets,
  selection,
  onChange,
  className,
}: {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  primary?: RailPrimary;
  /** Items in the current scope, for live option counts (same list the sheet gets). */
  items: T[];
  facets: FacetDef<T>[];
  selection: FacetSelection;
  onChange: (next: FacetSelection) => void;
  className?: string;
}) {
  const activeCount = activeFacetCount(selection);

  const toggle = (facetId: string, value: string) => {
    const cur = selection[facetId] ?? [];
    const next = cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value];
    const cleaned: FacetSelection = { ...selection };
    if (next.length) cleaned[facetId] = next;
    else delete cleaned[facetId];
    onChange(cleaned);
  };

  // Count for one option = items matching every OTHER facet's selection plus
  // this value (so the number reflects what tapping it would yield).
  const optionCount = useMemo(() => {
    return (facet: FacetDef<T>, value: string) => {
      const others = facets.filter((f) => f.id !== facet.id);
      return items.filter((i) => facet.get(i) === value && matchesFacets(i, others, selection))
        .length;
    };
  }, [items, facets, selection]);

  return (
    <aside className={cn("space-y-5", className)} aria-label="Filter">
      <SearchField
        value={search}
        onChange={onSearch}
        placeholder={searchPlaceholder ?? "Suchen …"}
      />

      {primary && (
        <section>
          <p className="mb-2 text-sm font-semibold">{primary.label}</p>
          {/* Capped with internal scroll so the facet groups below stay
              discoverable next to a 15-theme list. */}
          <div className="max-h-72 space-y-0.5 overflow-y-auto overscroll-contain rounded-lg border border-border/60 bg-surface/60 p-1">
            <PrimaryRow
              option={primary.all}
              selected={primary.value === primary.all.value}
              onSelect={() => primary.onChange(primary.all.value)}
            />
            {primary.options?.map((opt) => (
              <PrimaryRow
                key={opt.value}
                option={opt}
                selected={primary.value === opt.value}
                onSelect={() => primary.onChange(opt.value)}
              />
            ))}
            {primary.groups?.map((group) => (
              <div key={group.label} className="pt-1.5">
                <p className="px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-0.5">
                  {group.options.map((opt) => (
                    <PrimaryRow
                      key={opt.value}
                      option={opt}
                      selected={primary.value === opt.value}
                      onSelect={() => primary.onChange(opt.value)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {facets.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold">Filter</p>
            {activeCount > 0 && (
              <button
                onClick={() => onChange({})}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Zurücksetzen
              </button>
            )}
          </div>

          {facets.map((facet) => (
            <section key={facet.id}>
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {facet.label}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {facet.options.map((opt) => {
                  const selected = (selection[facet.id] ?? []).includes(opt.value);
                  const count = optionCount(facet, opt.value);
                  const disabled = count === 0 && !selected;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => !disabled && toggle(facet.id, opt.value)}
                      disabled={disabled}
                      aria-pressed={selected}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-sm transition-colors",
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : disabled
                            ? "cursor-not-allowed border-border/50 bg-muted/40 text-muted-foreground/40"
                            : "border-border/60 bg-white text-foreground hover:border-primary/40 dark:bg-white/10 dark:border-white/15",
                      )}
                    >
                      {opt.label}
                      {!disabled && (
                        <span
                          className={cn(
                            "text-xs tabular-nums",
                            selected ? "text-primary-foreground/80" : "text-muted-foreground",
                          )}
                        >
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </aside>
  );
}
