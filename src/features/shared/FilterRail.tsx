import { useMemo, useState } from "react";
import { ChevronDown, Pin, RotateCcw, SlidersHorizontal, X } from "lucide-react";
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
  /** Stable id for pin persistence (e.g. "primary", "secondary", "sector").
   *  Keep existing ids stable so saved pins survive; new scopes pick fresh ids. */
  pinId: string;
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
  scopes,
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
  onClose,
  hideHeader = false,
  layout = "rail",
  className,
}: {
  /** Ordered scope dropdowns, rendered top to bottom (Branche overhaul s102):
   *  Wörter/Kollokationen pass [Branche, Thema, Unterthema?], Redemittel
   *  [Kategorie], Grammatik [Gruppe]. Each carries a stable `pinId`. */
  scopes?: RailPrimary[];
  /** Items in the current scope, for live option counts (same list the sheet gets). */
  items: T[];
  facets: FacetDef<T>[];
  selection: FacetSelection;
  onChange: (next: FacetSelection) => void;
  /** Always-visible slot at the bottom of the tile (the Üben button). */
  footer?: React.ReactNode;
  /** Result count shown stacked (number over noun) to the right of the footer
   *  button. Omit to hide it. */
  count?: { value: number; label: string };
  /** localStorage scope for the section pins, e.g. "woerter". */
  pinScope: string;
  /** Whether the panel starts expanded (uncontrolled). Desktop defaults open. */
  defaultOpen?: boolean;
  /** Controlled open state. When provided (with `onOpenChange`), the panel is
   *  driven from outside, e.g. a Filter icon in the toolbar (mobile). */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Collapse handler for the panel's close icon (mobile). */
  onClose?: () => void;
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

  // Corner controls (founder s92): an icon reset (replaces the old "Zurücksetzen"
  // word button) and, in the mobile panel, a close icon. Reset is disabled when
  // there is nothing to clear.
  const resetButton = (
    <button
      type="button"
      onClick={() => onChange({})}
      disabled={activeCount === 0}
      aria-label="Filter zurücksetzen"
      title="Filter zurücksetzen"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
        activeCount === 0
          ? "cursor-not-allowed text-muted-foreground/30"
          : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      <RotateCcw className="h-4 w-4" />
    </button>
  );
  const closeButton = onClose ? (
    <button
      type="button"
      onClick={onClose}
      aria-label="Filter schließen"
      title="Schließen"
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
    >
      <X className="h-4 w-4" />
    </button>
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

  // A scope dropdown (Branche / Thema / Unterthema / Kategorie). Rendered once
  // per entry of the ordered `scopes` array.
  const scopeSelect = (p: RailPrimary) => (
    <section key={p.pinId}>
      <SectionHeader
        label={p.label}
        eyebrow
        pinned={pins.includes(p.pinId)}
        onTogglePin={() => togglePin(p.pinId)}
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

  // Ordered scope sections (Branche → Thema → Unterthema on Wörter/
  // Kollokationen); the sub-theme entry only exists when the active theme has
  // sub-themes, so drilling in is part of the filter, not a separate page.
  const scopeSections = (scopes ?? []).map(scopeSelect);

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
                    ? "cursor-not-allowed border-border/50 bg-transparent text-muted-foreground/40"
                    : "border-border bg-muted text-foreground hover:border-primary/40 hover:bg-muted/70",
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
  const pinnedScopes = (scopes ?? []).filter((p) => pins.includes(p.pinId));
  const showPinnedBody = !open && (pinnedScopes.length > 0 || pinnedFacets.length > 0);

  // The filter controls proper (scopes + facet pills + reset), shared by the
  // desktop rail's open body and the mobile panel.
  const filterBody = (
    <>
      {scopeSections}
      {facets.length > 0 && <div className="space-y-5">{facets.map(facetSection)}</div>}
    </>
  );

  // Mobile panel: a body-only grey tile. The toolbar owns the toggle, Üben and
  // count; the caller mounts/unmounts this with a slide.
  if (panel) {
    return (
      <div
        role="region"
        aria-label="Filter"
        className={cn(
          "space-y-4 rounded-xl border border-border bg-surface p-3 shadow-soft",
          className,
        )}
      >
        {/* Panel header: label on the left, reset + close icons top-right. */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-primary">
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </span>
          <div className="-mr-1 flex items-center gap-0.5">
            {resetButton}
            {closeButton}
          </div>
        </div>
        {filterBody}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        // Standard content-card recipe (founder follow-up s103: the old flat
        // `bg-border` slab read as an ugly grey block against every other
        // card on the page). Visible border + a soft shadow, same as any
        // other content tile; the white/muted controls inside carry the
        // hierarchy, and the "Filter" label keeps the brand accent. On
        // DESKTOP the aside is its own capped scroll container (the instance
        // className adds `lg:overflow-y-auto` + `lg:max-h-…`): the header
        // sticks to its top, the Üben footer to its bottom, the middle
        // scrolls. On MOBILE the tile grows naturally (no cap, no internal
        // scroll, so no scrollbar); the Üben footer instead sticks to the
        // viewport bottom (above the nav) so it stays visible while the
        // filters are open.
        "rounded-xl border border-border bg-surface shadow-soft",
        className,
      )}
      aria-label="Filter"
    >
      {/* Tile header: the expand/collapse toggle (flex-1, so it still reads
          as one clickable row) plus the reset icon beside it, always visible
          (founder follow-up: reset no longer hides behind an expanded-only
          first row). Sticks to the top of the scroll on desktop. Mobile
          hides it (`hideHeader`) because the Filter toggle lives on the
          view-options line instead. */}
      {!hideHeader && (
        <div className="z-10 flex w-full items-center gap-1 rounded-t-xl bg-surface px-3 py-2.5 lg:sticky lg:top-0 lg:rounded-none">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:opacity-80"
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
          {resetButton}
        </div>
      )}

      {open && (
        <div
          className={cn(
            "space-y-5 p-3",
            hideHeader ? "rounded-t-xl" : "border-t border-border",
          )}
        >
          {filterBody}
        </div>
      )}

      {/* Collapsed: pinned sections stay visible. */}
      {showPinnedBody && (
        <div
          className={cn(
            "space-y-5 p-3",
            hideHeader ? "rounded-t-xl" : "border-t border-border",
          )}
        >
          {pinnedScopes.map(scopeSelect)}
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
            "sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-10 flex items-center gap-2 rounded-b-xl border-t border-border bg-surface p-3 lg:bottom-0 lg:rounded-none",
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
          {/* Count sits beside Üben at every state (founder follow-up:
              previously it jumped to the top of the panel when expanded). */}
          {countStack}
        </div>
      )}
    </aside>
  );
}
