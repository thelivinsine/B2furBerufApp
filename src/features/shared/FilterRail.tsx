import { useEffect, useMemo, useRef, useState } from "react";
import { useT } from "@/lib/uiLang";
import { Check, ChevronDown, Lock, Pin, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  matchesFacets,
  type FacetDef,
  type FacetSelection,
  activeFacetCount,
} from "@/features/shared/FacetSheet";
import { Button } from "@/components/ui/button";
import { LifeAreaPills } from "@/features/shared/LifeAreaPills";
import type { LifeAreaId } from "@/lib/lifeAreas";
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
/**
 * The Himmelblau wash both filter rails wear, identical to the Schreiben
 * "Aufgabe wählen" rail (founder s189). The border carries the fill's own
 * colour, so the tile separates from the page by `shadow-soft` alone.
 */
const ACCENT = "border-accent/20 bg-accent/20 dark:border-accent/10 dark:bg-accent/10";

export interface RailPrimary {
  /** Stable id for pin persistence (e.g. "primary", "secondary", "sector").
   *  Keep existing ids stable so saved pins survive; new scopes pick fresh ids. */
  pinId: string;
  /** Section heading, e.g. "Thema" or "Kategorie" (microcopy budget: ≤2 words). */
  label: string;
  /** Selected option values. Empty = "everything" (the `all` row). Multi-select
   *  (s104, founder decision): OR-within, same semantics as a facet. */
  values: string[];
  onChange: (values: string[]) => void;
  /** The "everything" row rendered first, e.g. "Alle Themen". Selecting it
   *  clears `values` back to []. */
  all: PrimaryOption;
  /** Flat rows (Redemittel categories). */
  options?: PrimaryOption[];
  /** Grouped rows with group headings (the Domain-grouped themes). */
  groups?: PrimaryGroup[];
  /**
   * LOCK a zero-count option instead of leaving it selectable (founder s199).
   * Set on the Branche scope, whose count is the DEDICATED-content signal: a
   * zero there means the app has nothing written for that industry in the
   * current Thema, and picking it could only serve the universal pool behind
   * it. Not set on Thema, where a zero is an ordinary empty filter.
   */
  lockZero?: boolean;
}

/**
 * The Lebensbereich pill pair (s184). Its own prop rather than a `RailPrimary`
 * entry because it is a pill row, not a dropdown, and because its position is
 * fixed by law: directly BELOW Branche and above Thema, on every rail.
 */
export interface RailArea {
  /** Active area, "" = beides. */
  value: LifeAreaId | "";
  onChange: (next: LifeAreaId | "") => void;
  counts: Record<LifeAreaId, number>;
  /** See `LifeAreaPills`: false on tabs where untagged content is universal. */
  disableZero?: boolean;
}

/** Stable pin id for the Lebensbereich section (pins persist per tab). */
const AREA_PIN_ID = "area";

/** Find a selected value's label across the flat + grouped option lists (for
 *  the trigger button, which shows the single chosen label). */
function scopeOptionLabel(p: RailPrimary, value: string): string {
  const flat = p.options?.find((o) => o.value === value);
  if (flat) return flat.label;
  for (const g of p.groups ?? []) {
    const found = g.options.find((o) => o.value === value);
    if (found) return found.label;
  }
  return value;
}

/** Multi-select scope dropdown (Branche/Thema/Unterthema/Kategorie/Gruppe,
 *  s104): a trigger button opens a checkbox popover, closing on outside click
 *  or Escape (same pattern as `AccountMenu`). Radix `Select` only supports a
 *  single value, so this is a small hand-built listbox instead. */
function ScopeMultiSelect({ p }: { p: RailPrimary }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleValue = (value: string) => {
    p.onChange(
      p.values.includes(value) ? p.values.filter((v) => v !== value) : [...p.values, value],
    );
  };

  // The "Alle X" row's number shows how many DIFFERENT options there are
  // (Branchen / Themen / …), not the total item count behind them (founder
  // s104: "Alle Branchen (1113)" read as a word total, which is meaningless
  // as an aggregate). Grouped scopes (Thema) sum their group option counts.
  const optionTotal =
    (p.options?.length ?? 0) + (p.groups?.reduce((n, g) => n + g.options.length, 0) ?? 0);

  const triggerLabel =
    p.values.length === 1
      ? scopeOptionLabel(p, p.values[0])
      : p.values.length > 1
        ? `${p.values.length} ausgewählt`
        : p.all.label;

  const row = (opt: PrimaryOption) => {
    const checked = p.values.includes(opt.value);
    // Locked: no dedicated content behind this option. Never locks what is
    // already checked, which is the way back out.
    const locked = !!p.lockZero && opt.count === 0 && !checked;
    return (
      <button
        key={opt.value}
        type="button"
        role="option"
        aria-selected={checked}
        aria-disabled={locked || undefined}
        disabled={locked}
        onClick={() => !locked && toggleValue(opt.value)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
          checked
            ? "bg-primary/10 text-primary"
            : locked
              ? "cursor-not-allowed text-muted-foreground/40"
              : "hover:bg-muted/60",
        )}
      >
        {locked ? (
          <Lock className="h-3 w-3 shrink-0" aria-hidden />
        ) : (
          <span
            className={cn(
              "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
              checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
            )}
          >
            {checked && <Check className="h-3 w-3" />}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate">{t(opt.label)}</span>
        {opt.count != null && <CountBadge value={opt.count} muted={locked} />}
      </button>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t(p.label)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 lg:px-2.5 lg:py-1.5 lg:text-xs"
      >
        <span className="min-w-0 flex-1 truncate">{t(triggerLabel)}</span>
        {/* Nothing selected: show the number of options (Branchen/Themen), in
            the same muted pill format as the facet counts. */}
        {p.values.length === 0 && <CountBadge value={optionTotal} />}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-multiselectable
          aria-label={t(p.label)}
          className="slim-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
        >
          <button
            type="button"
            role="option"
            aria-selected={p.values.length === 0}
            onClick={() => {
              p.onChange([]);
              setOpen(false);
            }}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors",
              p.values.length === 0 ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
            )}
          >
            <span className="min-w-0 flex-1 truncate">{t(p.all.label)}</span>
            <CountBadge value={optionTotal} />
          </button>
          {(p.options?.length ?? 0) > 0 && <div className="my-1 h-px bg-border" />}
          {p.options?.map(row)}
          {p.groups?.map((group) => (
            <div key={group.label}>
              <p className="mt-1.5 px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {t(group.label)}
              </p>
              {group.options.map(row)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Facets longer than this collapse behind "Mehr anzeigen" in the rail.
const FACET_COLLAPSE_AT = 8;

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

/** A muted count chip in the same visual language as the facet pills below
 *  (a small tabular number after the label, no parentheses). */
function CountBadge({ value, muted }: { value: number; muted?: boolean }) {
  return (
    <span
      className={cn(
        "shrink-0 text-xs tabular-nums",
        muted ? "text-muted-foreground/40" : "text-muted-foreground",
      )}
    >
      {value}
    </span>
  );
}

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
  const t = useT();
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span
        className={cn(
          eyebrow
            ? "text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            : "text-sm font-semibold",
        )}
      >
        {t(label)}
      </span>
      {pinnable && (
      <button
        onClick={onTogglePin}
        aria-pressed={pinned}
        aria-label={pinned ? `${t(label)} ${t("lösen")}` : `${t(label)} ${t("anheften")}`}
        title={t(pinned ? "Angeheftet: bleibt beim Einklappen sichtbar" : "Anheften")}
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
  area,
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
  /** Lebensbereich pills. Rendered directly below the `sector` scope (or first,
   *  on a rail that has no Branche dropdown), never anywhere else. Omit on a
   *  tab whose content carries no Thema, e.g. Grammatik. */
  area?: RailArea;
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
  const t = useT();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  // Per-facet "Mehr/Weniger anzeigen" expansion (founder 2026-07-13): a facet
  // with many options (e.g. Redemittel Kategorie, Grammatik Gruppe) shows only
  // the first FACET_COLLAPSE_AT pills until expanded, so a long group list no
  // longer floods the tile. Selected options always stay visible.
  const [expandedFacets, setExpandedFacets] = useState<Set<string>>(new Set());
  const open = controlledOpen ?? internalOpen;
  const setOpen = (next: boolean) => (onOpenChange ? onOpenChange(next) : setInternalOpen(next));
  const [pins, setPins] = useState<string[]>(() => readPins(pinScope));
  // Active count now covers BOTH the facet pills AND the scope dropdowns
  // (s104 follow-up: the badge undercounted, and the reset button couldn't
  // clear a selected Branche/Thema/etc. because it only looked at `selection`).
  const scopeActiveCount = (scopes ?? []).reduce((sum, s) => sum + s.values.length, 0);
  // The Lebensbereich pills count as one active filter, like any scope value:
  // the badge and the reset must see them (s184).
  const activeCount = activeFacetCount(selection) + scopeActiveCount + (area?.value ? 1 : 0);

  // The Filter toggle for the headerless (mobile) tile. It moves between two
  // spots by state: the top-left of the panel (beside the count) when expanded,
  // and footer-left next to the Üben button when collapsed. Same control either
  // way.
  const filterToggle = (
    <Button
      type="button"
      size="icon"
      // The control that OPENS an accent rail wears that rail's fill, never
      // brand blue, which would compete with the Üben CTA beside it (s166, and
      // the same rule the Schreiben "Aufgabe wählen" toggle follows).
      variant="accent"
      aria-expanded={open}
      aria-label={t("Filter")}
      title={t("Filter")}
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
  // word button) and, in the mobile panel, a close icon. Reset clears BOTH the
  // facet pills AND every scope dropdown (s104 follow-up: it used to only call
  // `onChange({})`, so a selected Branche/Thema/Kategorie/Gruppe survived a
  // reset). Disabled when there is nothing to clear.
  const resetButton = (
    <button
      type="button"
      onClick={() => {
        onChange({});
        scopes?.forEach((s) => s.values.length && s.onChange([]));
        if (area?.value) area.onChange("");
      }}
      disabled={activeCount === 0}
      aria-label={t("Filter zurücksetzen")}
      title={t("Filter zurücksetzen")}
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
      aria-label={t("Filter schließen")}
      title={t("Schließen")}
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

  // Collapsed facets show the first N pills plus any selected value beyond N
  // (so an active filter is never hidden behind "Mehr anzeigen").
  const facetVisibleOptions = (facet: FacetDef<T>) => {
    if (facet.options.length <= FACET_COLLAPSE_AT || expandedFacets.has(facet.id)) {
      return facet.options;
    }
    const selected = new Set(selection[facet.id] ?? []);
    return facet.options.filter((o, i) => i < FACET_COLLAPSE_AT || selected.has(o.value));
  };

  // A scope dropdown (Branche / Thema / Unterthema / Kategorie / Gruppe).
  // Rendered once per entry of the ordered `scopes` array. Multi-select
  // (s104): a checkbox popover, not a single-value Select, so the facet
  // groups below stay close to the top and picking several values (e.g. two
  // Branchen) does not require repeated re-opening.
  const scopeSelect = (p: RailPrimary) => {
    // Every option locked means the whole control has nothing to offer: one
    // line says so instead of a list of padlocks (founder s199, same rule the
    // Aufgabe rails' `ScopeLocked` follows).
    const opts = [...(p.options ?? []), ...(p.groups ?? []).flatMap((g) => g.options)];
    const allLocked =
      !!p.lockZero && opts.length > 0 && opts.every((o) => o.count === 0 && !p.values.includes(o.value));
    return (
      <section key={p.pinId}>
        <SectionHeader
          label={p.label}
          eyebrow
          pinned={pins.includes(p.pinId)}
          onTogglePin={() => togglePin(p.pinId)}
          pinnable={!panel}
        />
        {allLocked ? (
          <p className="flex items-start gap-2 rounded-lg border border-dashed border-border px-2.5 py-2 text-xs leading-relaxed text-muted-foreground">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
            <span>{t("Für dieses Thema gibt es nichts nach Branche. Du übst hier alles.")}</span>
          </p>
        ) : (
          <ScopeMultiSelect p={p} />
        )}
      </section>
    );
  };

  // The Lebensbereich pills (s184). Since s199 they LEAD the rail.
  const areaSection = area ? (
    <section key="area">
      <SectionHeader
        label={t("Lebensbereich")}
        eyebrow
        pinned={pins.includes(AREA_PIN_ID)}
        onTogglePin={() => togglePin(AREA_PIN_ID)}
        pinnable={!panel}
      />
      <LifeAreaPills
        value={area.value}
        onChange={area.onChange}
        counts={area.counts}
        disableZero={area.disableZero}
      />
    </section>
  ) : null;

  // Ordered scope sections: **Lebensbereich → Thema → Unterthema → Branche**
  // (founder s199: "Berufsleben and Alltag as the first filter and then themen
  // and only then Branchen filter as the hierarchy of the filter rail all
  // across"). The sub-theme entry only exists when the active theme has
  // sub-themes, so drilling in is part of the filter, not a separate page.
  //
  // Branche used to LEAD this rail with the Lebensbereich pills pinned directly
  // under it (s184). It moves last because it is the finest cut of the three,
  // and because after the s199 tag cleanup it is the axis most often empty: a
  // filter that frequently has nothing to offer should not be the first thing
  // the learner meets.
  //
  // The order is applied HERE rather than by the callers so it cannot drift per
  // surface: every caller keeps passing its scopes in any order, and this rail
  // is the one place that decides where Lebensbereich and Branche sit.
  const scopeSections = (() => {
    const list = scopes ?? [];
    const sector = list.filter((s) => s.pinId === "sector");
    const rest = list.filter((s) => s.pinId !== "sector");
    return [
      ...(areaSection ? [areaSection] : []),
      ...rest.map(scopeSelect),
      ...sector.map(scopeSelect),
    ];
  })();

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
        {facetVisibleOptions(facet).map((opt) => {
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
                // Slightly smaller on desktop (founder 2026-07-13: the white
                // pills read a touch big in the rail). Only lg is the desktop
                // rail; the mobile panel keeps the roomier tap size.
                "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors lg:gap-1 lg:px-2 lg:py-0.5 lg:text-xs",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : disabled
                    ? "cursor-not-allowed border-border/50 bg-transparent text-muted-foreground/40"
                    : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface/70",
              )}
            >
              {t(opt.label)}
              {!disabled && (
                <span
                  className={cn(
                    "text-xs tabular-nums lg:text-[11px]",
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
      {facet.options.length > FACET_COLLAPSE_AT && (
        <button
          type="button"
          onClick={() =>
            setExpandedFacets((prev) => {
              const next = new Set(prev);
              if (next.has(facet.id)) next.delete(facet.id);
              else next.add(facet.id);
              return next;
            })
          }
          className="mt-2 text-xs font-medium text-primary transition-colors hover:opacity-80"
        >
          {expandedFacets.has(facet.id)
            ? t("Weniger anzeigen")
            : `${t("Mehr anzeigen")} (${facet.options.length - FACET_COLLAPSE_AT})`}
        </button>
      )}
    </section>
  );

  const pinnedFacets = facets.filter((f) => pins.includes(f.id));
  const pinnedScopes = (scopes ?? []).filter((p) => pins.includes(p.pinId));
  const areaPinned = !!areaSection && pins.includes(AREA_PIN_ID);
  // Same order rule as the open body (s199): Lebensbereich leads, Branche
  // trails, so collapsing the rail never reshuffles the tile.
  const pinnedSections = (() => {
    const sector = pinnedScopes.filter((s) => s.pinId === "sector");
    const rest = pinnedScopes.filter((s) => s.pinId !== "sector");
    return [
      ...(areaPinned && areaSection ? [areaSection] : []),
      ...rest.map(scopeSelect),
      ...sector.map(scopeSelect),
    ];
  })();
  const showPinnedBody =
    !open && (pinnedSections.length > 0 || pinnedFacets.length > 0);

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
        aria-label={t("Filter")}
        // Capped to ~45% of the viewport with the filters scrolling INSIDE
        // (founder, mobile): a flex column with a fixed header and one internal
        // scroll region, so an open panel never swallows the whole screen. The
        // cap stays at 45dvh (founder s189, after `preview/filterrail-height.html`
        // tested the one-screen ceiling here and its bottom border landed off the
        // viewport).
        className={cn(
          `flex max-h-[45dvh] flex-col rounded-xl border ${ACCENT} shadow-soft`,
          className,
        )}
      >
        {/* Panel header (fixed): label on the left, reset + close icons top-right. */}
        <div className="flex shrink-0 items-center justify-between gap-2 p-3 pb-2">
          <span className="text-sm font-semibold text-primary">
            Filter{activeCount > 0 ? ` (${activeCount})` : ""}
          </span>
          <div className="-mr-1 flex items-center gap-0.5">
            {resetButton}
            {closeButton}
          </div>
        </div>
        {/* Scroll region: only this scrolls, so the panel stays capped. */}
        <div className="slim-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-3 pb-3">
          {filterBody}
        </div>
      </div>
    );
  }

  return (
    <aside
      className={cn(
        // Himmelblau FILL (founder s189), the SAME wash the Schreiben
        // "Aufgabe wählen" rail wears: the two rails do the same job, so they
        // now speak one colour. This supersedes the grey `bg-muted` tile of
        // s104. The controls INSIDE stay white (the scope dropdowns and the
        // unselected facet pills are `bg-surface`), so they pop off the wash,
        // and the border carries the fill's own colour rather than a grey edge
        // (s169: a grey outline around a blue wash read as dirty).
        //
        // On DESKTOP (the instance className adds `lg:flex lg:flex-col` +
        // `lg:max-h-…` + `lg:overflow-hidden`) the tile is a strictly capped
        // flex column: a fixed header, a fixed Üben footer, and ONE scroll
        // region in between. The scrollbar therefore starts BELOW the header's
        // separator line and never overlaps the header or footer (founder
        // 2026-07-13), and it auto-hides until the region is hovered. On MOBILE
        // this rail layout is never shown (the mobile panel is a separate
        // `layout="panel"` tile); the Üben footer there lives in the toolbar.
        `rounded-xl border ${ACCENT} shadow-soft`,
        className,
      )}
      aria-label={t("Filter")}
    >
      {/* Tile header: the expand/collapse toggle (flex-1, so it still reads
          as one clickable row) plus the reset icon beside it, always visible
          (founder follow-up: reset no longer hides behind an expanded-only
          first row). Fixed at the top of the flex column so the scroll region
          below it owns the scrollbar. */}
      {!hideHeader && (
        <div className="flex w-full shrink-0 items-center gap-1 px-3 py-2.5">
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary transition-colors hover:opacity-80"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("Filter")}
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

      {/* Scroll region: the ONLY part that scrolls, so the auto-hiding scrollbar
          stays clear of the header and the footer. Only mounted when there is
          body content, so a collapsed tile is just header + footer.
          NO separator and no second fill (founder s199: header and footer "look
          like separate pieces attached to the main body"). They were painting
          `bg-accent/20` ON TOP of the tile's own `bg-accent/20`, so the two
          strips composited to a visibly darker shade than the body between them,
          and a tinted rule underlined the seam. One wash, no rules, one piece.
          They no longer need to be opaque: the flex column clips this region, so
          scrolling content can never reach them. */}
      {(open || showPinnedBody) && (
        <div className="scrollbar-hover lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          {open && <div className="space-y-5 px-3 pb-3 pt-0.5">{filterBody}</div>}
          {/* Collapsed: pinned sections stay visible. */}
          {!open && showPinnedBody && (
            <div className="space-y-5 px-3 pb-3 pt-0.5">
              {pinnedSections}
              {pinnedFacets.map(facetSection)}
            </div>
          )}
        </div>
      )}

      {/* Footer (the Üben button), fixed at the bottom of the flex column so it
          stays visible while the region above scrolls. */}
      {footer && (
        <div className="flex shrink-0 items-center gap-2 p-3">
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
