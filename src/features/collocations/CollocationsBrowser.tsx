import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, Zap, Search, SlidersHorizontal } from "lucide-react";
import { collocations, collocationsByTheme, collocationsBySubTheme } from "@/data/collocations";
import { themeById } from "@/data/themes";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import {
  applyFacets,
  ActiveFilterChip,
  activeFacetCount,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { collocationFacets, COLLOCATION_FACET_IDS } from "@/lib/facets";
import { FilterRail } from "@/features/shared/FilterRail";
import { SearchField } from "@/features/shared/SearchField";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { CollocationTable, CollocationCompactList } from "./CollocationViews";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { themeGroupsForMode } from "@/lib/themeGroups";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import { usePagedList } from "@/lib/usePagedList";
import { fuzzyMatch } from "@/lib/fuzzy";

// Facets come from the central registry (Phase 5): CEFR + Register. The old Verb
// facet (100+ options) was dropped there; typing a verb into the search box
// finds every collocation that uses it.
const COLLOCATION_FACETS = collocationFacets();
const ALL_FACET_IDS = COLLOCATION_FACET_IDS;

// Bibliothek views (session 91): the same filtered list as table, cards or
// compact list. The graph stays Wörter-only.
const KOLLOKATION_VIEWS: LibraryView[] = ["tabelle", "karten", "liste"];

type Collocation = (typeof collocations)[number];

// Memoized: cards come from the static bank, so a filter change re-renders
// only the cards whose identity actually changed, not all ~400.
const CollocationCard = memo(function CollocationCard({ c }: { c: Collocation }) {
  return (
    <Card className="card-hover h-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-1.5">
              <p className="min-w-0 truncate text-base font-semibold sm:text-lg">{c.full}</p>
              <SpeakButton text={c.full} className="shrink-0" />
            </div>
            <p className="text-xs text-muted-foreground">{c.en}</p>
          </div>
          {c.register === "formal" && (
            <Badge variant="accent" className="shrink-0">
              formell
            </Badge>
          )}
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <div className="flex items-start gap-1.5">
            <p className="min-w-0 flex-1 text-sm italic text-muted-foreground">„{c.example.de}"</p>
            <SpeakButton text={c.example.de} className="shrink-0" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export function CollocationsBrowser() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const level = useSettingsStore((s) => s.level);
  // Mode pre-selects which DOMAINS the grouped theme dropdown shows (founder
  // decision 2026-07-09, "Mode on top").
  const learningMode = useSettingsStore((s) => s.mode);
  const scope = useLibraryScope();
  const [showAllLevels, setShowAllLevels] = useState(false);
  // Mobile filter panel open state: the toggle is an icon on the view line.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useViewParam(KOLLOKATION_VIEWS);

  const themeParam = params.get("theme") ?? "all";
  const sub = params.get("sub") ?? "";
  const search = params.get("q") ?? "";
  // Transient search, outside the filter panel (founder s92).
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0);
  const reduce = useReducedMotion();

  // Tier-2 travelling scope: inherit the shared library scope when arriving
  // without an explicit theme; URL params still override for deep links.
  useEffect(() => {
    if (!params.get("theme") && scope.theme !== "all") {
      const p = new URLSearchParams(params);
      p.set("theme", scope.theme);
      setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the shared scope in sync with the effective theme so it travels.
  useEffect(() => {
    scope.setScope(themeParam, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themeParam]);

  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of ALL_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const setParam = (key: string, value: string | null) => {
    const p = new URLSearchParams(params);
    if (value) p.set(key, value);
    else p.delete(key);
    setParams(p, { replace: true });
  };

  const setSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    for (const id of ALL_FACET_IDS) {
      const v = next[id];
      if (v && v.length) p.set(id, v.join(","));
      else p.delete(id);
    }
    setParams(p, { replace: true });
  };

  const setTheme = (val: string) => {
    const p = new URLSearchParams(params);
    if (val === "all") p.delete("theme");
    else p.set("theme", val);
    p.delete("sub");
    setParams(p, { replace: true });
    scope.setScope(val, ""); // travelling scope: carry to the other segments
  };

  const setSub = (s: string) => {
    const p = new URLSearchParams(params);
    if (!s) p.delete("sub");
    else p.set("sub", s);
    setParams(p, { replace: true });
  };

  const setSearch = (q: string) => setParam("q", q || null);

  // Sub-theme drill-down (parity with Wörter, audit 2026-07-09): themes with
  // sub-themes show the picker first; "Gesamtes Thema" browses the whole pile.
  const activeTheme = themeParam !== "all" ? themeById(themeParam) : null;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  const subFilter = hasSubThemes && sub && sub !== "all" ? sub : undefined;
  const activeSub = subThemes.find((s) => s.id === sub);

  const scoped = useMemo(() => {
    let list =
      themeParam === "all" ? collocations : collocations.filter((c) => c.themeId === themeParam);
    if (subFilter) list = list.filter((c) => c.subThemeId === subFilter);
    if (search.trim()) {
      list = list.filter((c) => fuzzyMatch(search, [c.full, c.noun, c.verb, c.en]));
    }
    return list;
  }, [themeParam, subFilter, search]);

  // Tier-0 personalized default (UX overhaul Phase 2): default to the
  // learner's CEFR band + one step up, with a quiet escape. Never activates
  // if it would leave nothing to show (thin coverage at some levels/scopes).
  const cefrActive = (selection.cefr?.length ?? 0) > 0;
  const visibleBands = useMemo(() => defaultVisibleBands(level), [level]);
  const bandNonEmpty = useMemo(
    () => scoped.some((c) => !c.cefr || visibleBands.includes(c.cefr)),
    [scoped, visibleBands],
  );
  const bandActive = !showAllLevels && !cefrActive && !search.trim() && bandNonEmpty;
  const bandLimited = useMemo(
    () => (bandActive ? scoped.filter((c) => !c.cefr || visibleBands.includes(c.cefr)) : scoped),
    [scoped, bandActive, visibleBands],
  );
  const hiddenLabel = bandActive && bandLimited.length < scoped.length ? hiddenBandsLabel(level) : null;

  const filtered = useMemo(
    () => applyFacets(bandLimited, COLLOCATION_FACETS, selection),
    [bandLimited, selection],
  );

  // Incremental rendering: 60 cards now, the rest as you scroll.
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(filtered);

  const primaryGroups = useMemo(
    () => themeGroupsForMode(learningMode, themeParam, (id) => collocationsByTheme(id).length),
    [learningMode, themeParam],
  );

  // Carry the active scope into the session. Collocations have no session block
  // kind, so the sub/CEFR/Branche narrowing lands on the matching vocab slice
  // (via libraryFocus). pos/srs are browse lenses and are not forwarded.
  const startSession = () => {
    const p = new URLSearchParams();
    if (activeTheme) p.set("theme", activeTheme.id);
    if (subFilter) p.set("sub", subFilter);
    if (selection.cefr?.length) p.set("cefr", selection.cefr.join(","));
    if (selection.sector?.length) p.set("sector", selection.sector.join(","));
    const q = p.toString();
    navigate(`/session${q ? `?${q}` : ""}`);
  };

  // The filter tile is the single filter surface on BOTH breakpoints (founder
  // follow-up, s91): desktop rail + mobile tile share these props.
  const filterRailProps = {
    primary: {
      label: "Thema",
      value: themeParam,
      onChange: setTheme,
      all: { value: "all", label: "Alle Themen", count: collocations.length },
      groups: primaryGroups,
    },
    // Sub-theme drill-down as a second dropdown (founder s92): replaces the old
    // full-page picker.
    secondary: hasSubThemes
      ? {
          label: "Unterthema",
          value: sub && sub !== "" ? sub : "all",
          onChange: setSub,
          all: {
            value: "all",
            label: "Gesamtes Thema",
            count: collocationsByTheme(themeParam).length,
          },
          options: subThemes.map((s) => ({
            value: s.id,
            label: s.titleDe,
            count: collocationsBySubTheme(s.id).length,
          })),
        }
      : undefined,
    items: scoped,
    facets: COLLOCATION_FACETS,
    selection,
    onChange: setSelection,
    pinScope: "kollokationen",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
        <Zap className="h-3.5 w-3.5" /> Üben
      </Button>
    ),
    count: {
      value: filtered.length,
      label: filtered.length !== 1 ? "Kollokationen" : "Kollokation",
    },
  };

  const cardGrid = (
    <>
      {/* The remount key deliberately excludes the search term: re-keying
          per query change remounted the entire grid on every search flush. */}
      <motion.div
        key={`${themeParam}__${sub}__${params.get("cefr") ?? ""}__${params.get("register") ?? ""}__${showAllLevels}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {visible.map((c) => (
          <CollocationCard key={c.id} c={c} />
        ))}
      </motion.div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={showMore}>
            Mehr anzeigen ({remaining} weitere)
          </Button>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-5">
      {/* No page header: the Bibliothek tabs already name the section (s92). */}
      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1, not full width, founder
          follow-up s91), while the content and the filter tile share row 2 so
          the tile still starts level with the first card. Mobile renders the
          SAME filter tile inline (collapsed by default); only one FilterRail
          is visible per breakpoint. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8 lg:gap-y-4 lg:space-y-0">
        <div className="space-y-4 lg:col-start-1 lg:row-start-1">
          <LibrarySwitcher />

          {/* Toolbar + search + Üben/count, grouped and full-width on mobile (see
              Wörter). Desktop keeps Üben/count in the rail. */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-2">
              {/* Mobile filter toggle, left of the view icons (founder s92). */}
              <Button
                size="icon"
                variant={filtersOpen ? "default" : "outline"}
                aria-pressed={filtersOpen}
                aria-expanded={filtersOpen}
                aria-label="Filter"
                title="Filter"
                className="relative shrink-0 rounded-lg lg:hidden"
                onClick={() => setFiltersOpen((o) => !o)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {activeFacetCount(selection) > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                    {activeFacetCount(selection)}
                  </span>
                )}
              </Button>
              <ViewSwitcher views={KOLLOKATION_VIEWS} value={view} onChange={setView} />
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant={searchOpen || search.trim() ? "default" : "outline"}
                  aria-pressed={searchOpen}
                  aria-expanded={searchOpen}
                  aria-label="Suche"
                  title="Suche"
                  className="shrink-0 rounded-lg"
                  onClick={() =>
                    setSearchOpen((o) => {
                      if (o) setSearch("");
                      return !o;
                    })
                  }
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Search input lives outside the filter panel (founder s92). */}
            {searchOpen && (
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Suche nach Nomen, Verb, Übersetzung …"
                autoFocus
              />
            )}

          </div>

          <AnimatePresence initial={false}>
            {filtersOpen && (
              <motion.div
                key="filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
                className="overflow-hidden lg:hidden"
              >
                <FilterRail
                  {...filterRailProps}
                  layout="panel"
                  onClose={() => setFiltersOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {hiddenLabel && (
            <div className="flex flex-wrap items-center gap-2">
              <ActiveFilterChip
                label={`Stufe: bis ${visibleBands[visibleBands.length - 1]}`}
                onRemove={() => setShowAllLevels(true)}
              />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
          {/* Sub-theme drill-down now lives in the filter (the Unterthema
              dropdown), not a separate picker page. This breadcrumb shows the
              active sub-theme context and jumps back to the whole theme. */}
          {hasSubThemes && sub && sub !== "all" && (
            <button
              onClick={() => setSub("")}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {activeTheme?.titleDe}
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground">
                {activeSub ? activeSub.titleDe : "Gesamtes Thema"}
              </span>
            </button>
          )}

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
            </div>
          ) : view === "tabelle" ? (
            <CollocationTable items={filtered} />
          ) : view === "liste" ? (
            <CollocationCompactList items={filtered} />
          ) : (
            cardGrid
          )}
        </div>

        {/* Mobile action bar: Üben + count pinned at the bottom, list scrolls above. */}
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <Button variant="gradient" className="h-11 flex-1 rounded-xl text-base" onClick={startSession}>
            <Zap className="h-4 w-4" /> Üben
          </Button>
          <div className="flex shrink-0 flex-col items-center justify-center px-1 leading-none">
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {filtered.length}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Kollokation{filtered.length !== 1 ? "en" : ""}
            </span>
          </div>
        </div>

        <FilterRail
          {...filterRailProps}
          className="no-scrollbar hidden lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-22rem)] lg:overflow-hidden lg:overflow-y-auto"
        />
      </div>
    </div>
  );
}
