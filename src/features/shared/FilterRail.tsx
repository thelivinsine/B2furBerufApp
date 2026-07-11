import { useMemo, useState } from "react";
import { ChevronDown, Pin, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
 * toolbar-plus-sheet pattern. It is a proper collapsible tile (founder
 * follow-up): a brand-tinted header row expands/collapses the panel, a
 * `footer` slot (the Üben button) stays visible in EVERY state, and each
 * filter section carries a pin: pinned sections keep rendering while the
 * panel is collapsed. Pins persist per tab in localStorage (device-level UI
 * preference; deliberately not in the synced settings store).
 *
 * Inside: Suche on top, the primary scope (Thema / Kategorie) as a grouped
 * row list, then every facet as always-visible pill groups. Every tap
 * commits immediately, and option counts update live (count = what tapping
 * that pill would yield, given every OTHER active constraint). Zero-yield
 * options grey out exactly like the mobile FacetSheet.
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

// One localStorage object maps a per-tab scope ("woerter", …) to its pinned
// section ids ("primary" + facet ids). Storage failures (private mode) just
// mean pins don't persist.
const PINS_KEY = "b2beruf.railPins";

function readPins(scope: string): string[] {
  try {
    const all = JSON.parse(localStorage.getItem(PINS_KEY) ?? "{}");
    return Array.isArray(all[scope]) ? all[scope] : [];
  } catch {
    return [];
  }
}

function writePins(scope: string, pins: string[]) {
  try {
    const all = JSON.parse(localStorage.getItem(PINS_KEY) ?? "{}");
    all[scope] = pins;
    localStorage.setItem(PINS_KEY, JSON.stringify(all));
  } catch {
    // non-fatal: pins just won't survive a reload
  }
}

const withCount = (opt: PrimaryOption) =>
  `${opt.label}${opt.count != null ? ` (${opt.count})` : ""}`;

/** Section heading row with the pin toggle. */
function SectionHeader({
  label,
  eyebrow,
  pinned,
  onTogglePin,
}: {
  label: string;
  /** Render the label in the quiet uppercase facet style. */
  eyebrow?: boolean;
  pinned: boolean;
  onTogglePin: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span
        className={cn(
          eyebrow
            ? "text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            : "text-sm font-semibold",
        )}
      >
        {label}
      </span>
      <button
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={pinned ? `${label} lösen` : `${label} anheften`}
        title={pinned ? "Angeheftet: bleibt beim Einklappen sichtbar" : "Anheften"}
        className={cn(
          "rounded p-0.5 transition-colors",
          pinned ? "text-primary" : "text-muted-foreground/40 hover:text-muted-foreground",
        )}
      >
        <Pin className={cn("h-3.5 w-3.5", pinned && "fill-current")} />
      </button>
    </div>
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
  footer,
  pinScope,
  defaultOpen = true,
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
  /** Always-visible slot at the bottom of the tile (the Üben button). */
  footer?: React.ReactNode;
  /** localStorage scope for the section pins, e.g. "woerter". */
  pinScope: string;
  /** Whether the panel starts expanded. Desktop defaults open; mobile passes
   *  false so the tile starts as a compact "Filter" bar. */
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [pins, setPins] = useState<string[]>(() => readPins(pinScope));
  const activeCount = activeFacetCount(selection);

  const togglePin = (id: string) => {
    const next = pins.includes(id) ? pins.filter((p) => p !== id) : [...pins, id];
    setPins(next);
    writePins(pinScope, next);
  };

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

  const primarySection = primary ? (
    <section>
      <SectionHeader
        label={primary.label}
        pinned={pins.includes("primary")}
        onTogglePin={() => togglePin("primary")}
      />
      {/* Dropdown (founder follow-up): the primary scope (Thema/Kategorie) is
          a Select, not an always-open row list, so the facet groups below
          stay close to the top. Same options as the mobile toolbar dropdown. */}
      <Select value={primary.value} onValueChange={primary.onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={primary.all.value}>{withCount(primary.all)}</SelectItem>
          {primary.options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {withCount(opt)}
            </SelectItem>
          ))}
          {primary.groups?.map((group) => (
            <SelectGroup key={group.label}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {withCount(opt)}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </section>
  ) : null;

  const facetSection = (facet: FacetDef<T>) => (
    <section key={facet.id}>
      <SectionHeader
        label={facet.label}
        eyebrow
        pinned={pins.includes(facet.id)}
        onTogglePin={() => togglePin(facet.id)}
      />
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
  );

  const pinnedFacets = facets.filter((f) => pins.includes(f.id));
  const showPinnedBody = !open && ((primary && pins.includes("primary")) || pinnedFacets.length > 0);

  return (
    <aside
      className={cn(
        // The WHOLE tile carries a grey shade (founder follow-up); the white
        // controls inside provide the contrast, the "Filter" label keeps the
        // brand accent. On DESKTOP the aside is its own capped scroll container
        // (the instance className adds `lg:overflow-y-auto` + `lg:max-h-…`):
        // the header sticks to its top, the Üben footer to its bottom, the
        // middle scrolls. On MOBILE the tile grows naturally (no cap, no
        // internal scroll, so no scrollbar); the Üben footer instead sticks to
        // the viewport bottom (above the nav) so it stays visible while the
        // filters are open.
        "rounded-xl border border-border bg-muted",
        className,
      )}
      aria-label="Filter"
    >
      {/* Tile header; clicking collapses/expands the panel (pinned sections +
          footer stay visible regardless). Sticks to the top of the scroll on
          desktop; scrolls with the tile on mobile. */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="z-10 flex w-full items-center gap-2 rounded-t-xl bg-muted px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-foreground/5 lg:sticky lg:top-0 lg:rounded-none"
      >
        <SlidersHorizontal className="h-4 w-4" />
        Filter
        {activeCount > 0 && (
          <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn("ml-auto h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-border p-3">
          <SearchField
            value={search}
            onChange={onSearch}
            placeholder={searchPlaceholder ?? "Suchen …"}
          />

          {primarySection}

          {facets.length > 0 && (
            <div className="space-y-5">
              {/* The tile header already says "Filter"; only the reset action lives here. */}
              {activeCount > 0 && (
                <div className="flex justify-end">
                  <button
                    onClick={() => onChange({})}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Zurücksetzen
                  </button>
                </div>
              )}

              {facets.map(facetSection)}
            </div>
          )}
        </div>
      )}

      {/* Collapsed: pinned sections stay visible. */}
      {showPinnedBody && (
        <div className="space-y-5 border-t border-border p-3">
          {primary && pins.includes("primary") && primarySection}
          {pinnedFacets.map(facetSection)}
        </div>
      )}

      {/* Footer (the Üben button) stays on screen at every scroll position on
          BOTH breakpoints, but via different sticky contexts: on desktop it
          sticks to the bottom of the capped, scrolling aside (`lg:bottom-0`);
          on mobile the aside is not a scroll container, so it sticks to the
          viewport bottom just above the 63px bottom nav (+ safe area), keeping
          Üben visible while the filters are open without an internal
          scrollbar. */}
      {footer && (
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-10 rounded-b-xl border-t border-border bg-muted p-3 lg:bottom-0 lg:rounded-none">
          {footer}
        </div>
      )}
    </aside>
  );
}
