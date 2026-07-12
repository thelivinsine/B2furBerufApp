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
import { Button } from "@/components/ui/button";
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
  pinnable = true,
}: {
  label: string;
  /** Render the label in the quiet uppercase facet style. */
  eyebrow?: boolean;
  pinned: boolean;
  onTogglePin: () => void;
  /** Pins keep a section visible while the rail is collapsed; the mobile panel
   *  has no collapse, so it hides them. */
  pinnable?: boolean;
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
      {pinnable && (
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
      )}
    </div>
  );
}

export function FilterRail<T>({
  primary,
  secondary,
  items,
  facets,
  selection,
  onChange,
  footer,
  count,
  pinScope,
  defaultOpen = true,
  open: controlledOpen,
  onOpenChange,
  hideHeader = false,
  layout = "rail",
  className,
}: {
  primary?: RailPrimary;
  /** Optional second scope dropdown (the sub-theme), shown right under the
   *  primary. Provided only when the active theme has sub-themes. */
  secondary?: RailPrimary;
  /** Items in the current scope, for live option counts (same list the sheet gets). */
  items: T[];
  facets: FacetDef<T>[];
  selection: FacetSelection;
  onChange: (next: FacetSelection) => void;
  /** Always-visible slot at the bottom of the tile (the Üben button). */
  footer?: React.ReactNode;
  /** Result count shown stacked (number over noun) to the right of the footer
   *  button. Omit to hide it (e.g. the Wörter graph view). */
  count?: { value: number; label: string };
  /** localStorage scope for the section pins, e.g. "woerter". */
  pinScope: string;
  /** Whether the panel starts expanded (uncontrolled). Desktop defaults open. */
  defaultOpen?: boolean;
  /** Controlled open state. When provided (with `onOpenChange`), the panel is
   *  driven from outside, e.g. a Filter icon in the toolbar (mobile). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Hide the built-in "Filter" header/toggle row. Mobile passes this because
   *  the toggle lives inside the tile (top when open, footer when collapsed). */
  hideHeader?: boolean;
  /**
   * "rail" (default, desktop): the full persistent rail with header, footer
   * (Üben), count and collapse/pin behavior. "panel" (mobile): a body-only grey
   * tile with just the Thema dropdown + facets, meant to be mounted/unmounted
   * with a slide by the caller. The toolbar owns the toggle, Üben and count, so
   * none of footer/count/open/hideHeader/pins apply here.
   */
  layout?: "rail" | "panel";
  className?: string;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => (onOpenChange ? onOpenChange(next) : setInternalOpen(next));
  const [pins, setPins] = useState<string[]>(() => readPins(pinScope));
  const activeCount = activeFacetCount(selection);

  // The Filter toggle for the headerless (mobile) tile. It moves between two
  // spots by state: the top-left of the panel (beside the count) when expanded,
  // and footer-left next to the Üben button when collapsed. Same control either
  // way.
  const filterToggle = (
    <Button
      type="button"
      size="icon"
      variant={open ? "default" : "outline"}
      aria-expanded={open}
      aria-label="Filter"
      title="Filter"
      className="relative h-10 w-10 shrink-0"
      onClick={() => setOpen(!open)}
    >
      <SlidersHorizontal className="h-4 w-4" />
      {activeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {activeCount}
        </span>
      )}
    </Button>
  );

  // Result count, stacked (number over noun) so it fits the footer height to
  // the right of the Üben button without changing the collapsed tile's size.
  const countStack = count ? (
    <div className="flex shrink-0 flex-col items-center justify-center px-1 leading-tight">
      <span className="text-sm font-semibold tabular-nums text-foreground">{count.value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {count.label}
      </span>
    </div>
  ) : null;

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

  const panel = layout === "panel";

  // A scope dropdown (Thema / Unterthema / Kategorie). Rendered once for the
  // primary scope and, when present, once for the secondary (sub-theme) scope.
  const scopeSelect = (p: RailPrimary, pinId: string) => (
    <section>
      <SectionHeader
        label={p.label}
        pinned={pins.includes(pinId)}
        onTogglePin={() => togglePin(pinId)}
        pinnable={!panel}
      />
      {/* Dropdown (founder follow-up): the scope (Thema/Unterthema/Kategorie) is
          a Select, not an always-open row list, so the facet groups below
          stay close to the top. Same options as the mobile toolbar dropdown. */}
      <Select value={p.value} onValueChange={p.onChange}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={p.all.value}>{withCount(p.all)}</SelectItem>
          {p.options?.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {withCount(opt)}
            </SelectItem>
          ))}
          {p.groups?.map((group) => (
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
  );

  const primarySection = primary ? scopeSelect(primary, "primary") : null;
  // The sub-theme scope (Unterthema), shown right under Thema when the active
  // theme has sub-themes, so drilling in is part of the filter, not a separate
  // full-page picker.
  const secondarySection = secondary ? scopeSelect(secondary, "secondary") : null;

  const facetSection = (facet: FacetDef<T>) => (
    <section key={facet.id}>
      <SectionHeader
        label={facet.label}
        eyebrow
        pinned={pins.includes(facet.id)}
        onTogglePin={() => togglePin(facet.id)}
        pinnable={!panel}
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

  // The filter controls proper (Thema/Kategorie + facet pills + reset), shared
  // by the desktop rail's open body and the mobile panel.
  const filterBody = (
    <>
      {primarySection}
      {secondarySection}
      {facets.length > 0 && (
        <div className="space-y-5">
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
    </>
  );

  // Mobile panel: a body-only grey tile. The toolbar owns the toggle, Üben and
  // count; the caller mounts/unmounts this with a slide.
  if (panel) {
    return (
      <div
        role="region"
        aria-label="Filter"
        className={cn("space-y-5 rounded-xl border border-border bg-border p-3", className)}
      >
        {filterBody}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        // The WHOLE tile is one solid, higher-contrast grey (founder follow-up
        // s92: `bg-border` reads clearly against the near-white page where the
        // old `bg-muted` barely did), so every section shares the top row's
        // shade. The white controls inside carry the contrast; the "Filter"
        // label keeps the brand accent. On DESKTOP the aside is its own capped
        // scroll container (the instance className adds `lg:overflow-y-auto` +
        // `lg:max-h-…`): the header sticks to its top, the Üben footer to its
        // bottom, the middle scrolls. On MOBILE the tile grows naturally (no
        // cap, no internal scroll, so no scrollbar); the Üben footer instead
        // sticks to the viewport bottom (above the nav) so it stays visible
        // while the filters are open.
        "rounded-xl border border-border bg-border",
        className,
      )}
      aria-label="Filter"
    >
      {/* Tile header; clicking collapses/expands the panel (pinned sections +
          footer stay visible regardless). Sticks to the top of the scroll on
          desktop. Mobile hides it (`hideHeader`) because the Filter toggle
          lives on the view-options line instead. */}
      {!hideHeader && (
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="z-10 flex w-full items-center gap-2 rounded-t-xl bg-border px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-foreground/5 lg:sticky lg:top-0 lg:rounded-none"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {activeCount}
            </span>
          )}
          <ChevronDown
            className={cn("ml-auto h-4 w-4 transition-transform", open && "rotate-180")}
          />
        </button>
      )}

      {open && (
        <div
          className={cn(
            "space-y-5 p-3",
            hideHeader ? "rounded-t-xl" : "border-t border-muted-foreground/10",
          )}
        >
          {/* Expanded first row: the Filter toggle on the left (mobile) and the
              result count on the right. When expanded the count lives here, not
              in the footer (founder s92). Search is no longer in the panel. */}
          {(hideHeader || countStack) && (
            <div className="flex items-center gap-2">
              {hideHeader && filterToggle}
              {countStack && <div className="ml-auto">{countStack}</div>}
            </div>
          )}

          {filterBody}
        </div>
      )}

      {/* Collapsed: pinned sections stay visible. */}
      {showPinnedBody && (
        <div
          className={cn(
            "space-y-5 p-3",
            hideHeader ? "rounded-t-xl" : "border-t border-muted-foreground/10",
          )}
        >
          {primary && pins.includes("primary") && primarySection}
          {secondary && pins.includes("secondary") && secondarySection}
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
        <div
          className={cn(
            "sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-10 flex items-center gap-2 rounded-b-xl border-t border-muted-foreground/10 bg-border p-3 lg:bottom-0 lg:rounded-none",
            // Headerless + collapsed + no pinned sections: the footer is the
            // whole tile, so round its top too and drop the divider.
            hideHeader && !open && !showPinnedBody && "rounded-t-xl border-t-0",
          )}
        >
          {/* Collapsed headerless (mobile) tile: the Filter toggle sits to the
              left of the Üben button. When expanded it moves up into the first
              row of the panel instead (so it is not duplicated here). Desktop
              keeps its labelled header. */}
          {hideHeader && !open && filterToggle}
          <div className="min-w-0 flex-1">{footer}</div>
          {/* Count sits beside Üben only while collapsed; expanded, it is in
              the first row of the panel instead. */}
          {!open && countStack}
        </div>
      )}
    </aside>
  );
}
