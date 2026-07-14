import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronLeft, Search, SlidersHorizontal } from "lucide-react";
import { collocations, collocationsByTheme, collocationsBySubTheme } from "@/data/collocations";
import { themeById } from "@/data/themes";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { useSessionStore } from "@/store/useSessionStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { FlipCard } from "@/features/shared/FlipCard";
import {
  applyFacets,
  ActiveFilterChip,
  activeFacetCount,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import {
  collocationFacets,
  COLLOCATION_FACET_IDS,
  SECTOR_OPTIONS,
  matchesSector,
  sectorFirst,
} from "@/lib/facets";
import type { WorkSector } from "@/types";
import { FilterRail } from "@/features/shared/FilterRail";
import { FeedbackIconButton } from "@/components/layout/FeedbackButton";
import { useScrollDirection, browseHeaderClass, ScrollTopButton, UebenLabel } from "@/features/shared/browseScroll";
import { SearchField } from "@/features/shared/SearchField";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { CollocationTable, CollocationCompactList } from "./CollocationViews";
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
  // Flip tile (founder 2026-07-13): German front, English on the back. The
  // register badge was dropped from the tile (Register is a filter facet, so
  // it is redundant here).
  const front = (
    <Card className="card-hover h-full">
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="min-w-0 truncate text-base font-semibold sm:text-lg">{c.full}</p>
          <span onClick={(e) => e.stopPropagation()}>
            <SpeakButton text={c.full} className="shrink-0" />
          </span>
        </div>

        <div className="mt-2 border-t border-border pt-2">
          <div className="flex items-start gap-1.5">
            <p className="min-w-0 flex-1 text-sm italic text-muted-foreground">„{c.example.de}"</p>
            <span onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={c.example.de} className="shrink-0" />
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const back = (
    <Card className="h-full border-primary/30 bg-primary/[0.03]">
      <CardContent className="flex h-full flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          Englisch
        </p>
        <p className="mt-1 text-base font-semibold sm:text-lg">{c.en}</p>
        {c.example.en && (
          <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
            „{c.example.en}"
          </p>
        )}
      </CardContent>
    </Card>
  );
  return <FlipCard front={front} back={back} label={`Übersetzung von ${c.full}`} />;
});

export function CollocationsBrowser() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const level = useSettingsStore((s) => s.level);
  // Mode pre-selects which DOMAINS the grouped theme dropdown shows (founder
  // decision 2026-07-09, "Mode on top").
  const learningMode = useSettingsStore((s) => s.mode);
  const scope = useLibraryScope();
  const setLibrarySession = useSessionStore((s) => s.setLibrarySession);
  const [showAllLevels, setShowAllLevels] = useState(false);
  // Mobile filter panel open state: the toggle is an icon on the view line.
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [view, setView] = useViewParam(KOLLOKATION_VIEWS);

  // Scope dropdowns are multi-select (s104, founder decision): each rides a
  // comma-list URL param, empty/absent = "everything".
  const themes = useMemo(() => {
    const raw = params.get("theme");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [params]);
  const subs = useMemo(() => {
    const raw = params.get("sub");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [params]);
  const sectors = useMemo(() => {
    const raw = params.get("sector");
    return raw ? raw.split(",").filter(Boolean) : [];
  }, [params]);
  const search = params.get("q") ?? "";
  // Transient search, outside the filter panel (founder s92).
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0);
  const reduce = useReducedMotion();
  const { hidden: headerHidden, scrolled } = useScrollDirection();

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

  // Keep the shared scope in sync with the effective theme, but only when it
  // resolves to exactly ONE theme (`useLibraryScope` is a single "where am I"
  // choice; a multi-Thema selection has no one value to travel, s104).
  useEffect(() => {
    if (themes.length === 1) scope.setScope(themes[0], "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themes]);

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

  const setThemes = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("theme", next.join(","));
    else p.delete("theme");
    p.delete("sub");
    setParams(p, { replace: true });
    // travelling scope: carry to the other segments when exactly one is picked
    if (next.length === 1) scope.setScope(next[0], "");
  };

  const setSubs = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("sub", next.join(","));
    else p.delete("sub");
    setParams(p, { replace: true });
  };

  const setSearch = (q: string) => setParam("q", q || null);
  const setSectors = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("sector", next.join(","));
    else p.delete("sector");
    setParams(p, { replace: true });
  };

  // Sub-theme drill-down (parity with Wörter, audit 2026-07-09): only rendered
  // with exactly ONE active Thema (a multi-theme selection has no single
  // sub-theme spine, s104).
  const activeTheme = themes.length === 1 ? themeById(themes[0]) : null;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  const subFilter = hasSubThemes && subs.length ? subs : undefined;
  const activeSub = subThemes.find((s) => subs.includes(s.id));

  // Theme-scoped list BEFORE the Branche cut, for the dropdown's per-sector
  // dedicated-content counts.
  const themeScoped = useMemo(() => {
    let list = themes.length
      ? collocations.filter((c) => !!c.themeId && themes.includes(c.themeId))
      : collocations;
    if (subFilter) list = list.filter((c) => !!c.subThemeId && subFilter.includes(c.subThemeId));
    return list;
  }, [themes, subFilter]);

  const scoped = useMemo(() => {
    // Branche scope cut (root-cause fix, s102; multi-select s104): untagged
    // pairs are general and show under every selected Branche; tagged pairs
    // hide only under Branchen NOT in the selection.
    let list = sectors.length ? themeScoped.filter((c) => matchesSector(c, sectors)) : themeScoped;
    if (search.trim()) {
      list = list.filter((c) => fuzzyMatch(search, [c.full, c.noun, c.verb, c.en]));
    }
    return list;
  }, [themeScoped, sectors, search]);

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

  // Sector-tagged pairs lead the list when one or more Branchen are selected
  // (s102, multi-select s104).
  const filtered = useMemo(
    () => sectorFirst(applyFacets(bandLimited, COLLOCATION_FACETS, selection), sectors),
    [bandLimited, selection, sectors],
  );

  // Incremental rendering: 60 cards now, the rest as you scroll.
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(filtered);

  const primaryGroups = useMemo(
    () => themeGroupsForMode(learningMode, themes, (id) => collocationsByTheme(id).length),
    [learningMode, themes],
  );

  // Carry the active scope into the session. Collocations have no session block
  // kind, so the sub/CEFR/Branche narrowing lands on the matching vocab slice
  // (via libraryFocus). pos/srs are browse lenses and are not forwarded. A
  // multi-Thema/Unterthema selection collapses to its first value (the
  // session engine biases ONE session, not several themes, s104); every
  // selected Branche is forwarded since `libraryFocus`'s sector is a list.
  // Üben practises EXACTLY the filtered collocations (founder 2026-07-13): hand
  // the tab's filtered ids to the session store, launch a collocation-only
  // session with `?src=lib`.
  const startSession = () => {
    setLibrarySession({ type: "collocation", ids: filtered.map((c) => c.id) });
    navigate("/session?src=lib");
  };

  // The filter tile is the single filter surface on BOTH breakpoints (founder
  // follow-up, s91): desktop rail + mobile tile share these props.
  const filterRailProps = {
    // Ordered scope hierarchy (founder, s102; multi-select s104): Branche →
    // Thema → Unterthema.
    scopes: [
      {
        pinId: "sector",
        label: "Branche",
        values: sectors,
        onChange: setSectors,
        // Count = sector-tagged pairs in the current Thema scope (dedicated
        // content); zero-count Branchen stay selectable (general pairs show).
        all: { value: "all", label: "Alle Branchen", count: themeScoped.length },
        options: SECTOR_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
          count: themeScoped.filter((c) => c.sectors?.includes(o.value as WorkSector)).length,
        })),
      },
      {
        pinId: "primary",
        label: "Thema",
        values: themes,
        onChange: setThemes,
        all: { value: "all", label: "Alle Themen", count: collocations.length },
        groups: primaryGroups,
      },
      // Sub-theme drill-down as a third dropdown (founder s92): replaces the
      // old full-page picker. Only rendered when exactly one Thema is active.
      ...(hasSubThemes
        ? [
            {
              pinId: "secondary",
              label: "Unterthema",
              values: subs,
              onChange: setSubs,
              all: {
                value: "all",
                label: "Gesamtes Thema",
                count: collocationsByTheme(themes[0]).length,
              },
              options: subThemes.map((s) => ({
                value: s.id,
                label: s.titleDe,
                count: collocationsBySubTheme(s.id).length,
              })),
            },
          ]
        : []),
    ],
    items: scoped,
    facets: COLLOCATION_FACETS,
    selection,
    onChange: setSelection,
    pinScope: "kollokationen",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
        <UebenLabel
          iconClass="h-3.5 w-3.5"
          count={filtered.length}
          noun={filtered.length === 1 ? "Kollokation" : "Kollokationen"}
        />
      </Button>
    ),
  };

  const cardGrid = (
    <>
      {/* The remount key deliberately excludes the search term: re-keying
          per query change remounted the entire grid on every search flush. */}
      <motion.div
        key={`${themes.join(",")}__${subs.join(",")}__${params.get("cefr") ?? ""}__${params.get("register") ?? ""}__${showAllLevels}`}
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
        <div className={`${browseHeaderClass(headerHidden, scrolled)} space-y-4 lg:sticky lg:top-16 lg:z-20 lg:col-start-1 lg:row-start-1 lg:self-start lg:pb-3`}>
          {/* Toolbar + search + Üben/count, grouped and full-width on mobile (see
              Wörter). Desktop keeps Üben/count in the rail. */}
          <div className="flex w-full flex-col gap-2">
            {/* Items are centered while search is closed; opening search slides
                the icon groups apart to make room for the field (founder
                2026-07-13). */}
            <motion.div
              layout={!reduce}
              className={`flex w-full items-center gap-2 ${searchOpen ? "justify-between" : "justify-center"}`}
            >
              <motion.div layout={!reduce ? "position" : false} className="flex items-center gap-2">
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
              </motion.div>
              {/* Desktop: an open search grows inline in this row (founder
                  s104: no third line). Mobile keeps the second row below. */}
              <AnimatePresence initial={false}>
                {searchOpen && (
                  <motion.div
                    key="search-inline"
                    layout={!reduce}
                    initial={{ opacity: 0, scaleX: 0.9 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    exit={{ opacity: 0, scaleX: 0.9 }}
                    transition={reduce ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
                    className="hidden min-w-0 flex-1 origin-left lg:block"
                  >
                    <SearchField
                      value={search}
                      onChange={setSearch}
                      placeholder="Suche nach Nomen, Verb, Übersetzung …"
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div layout={!reduce ? "position" : false} className="flex items-center gap-2">
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
              </motion.div>
            </motion.div>

            {/* Mobile-only second row (desktop shows it inline above). */}
            {searchOpen && (
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Suche nach Nomen, Verb, Übersetzung …"
                autoFocus
                className="lg:hidden"
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
          {hasSubThemes && subs.length > 0 && (
            <button
              onClick={() => setSubs([])}
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              {activeTheme?.titleDe}
              <span className="text-muted-foreground/60">/</span>
              <span className="text-foreground">
                {subs.length === 1
                  ? (activeSub?.titleDe ?? "Gesamtes Thema")
                  : `${subs.length} Unterthemen`}
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

        {/* Mobile action bar: Üben (count folded into the label) pinned at the
            bottom, list scrolls above. */}
        <ScrollTopButton show={scrolled} />
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <FeedbackIconButton />
          <Button variant="gradient" className="h-11 flex-1 rounded-xl text-base" onClick={startSession}>
            <UebenLabel
              iconClass="h-4 w-4"
              count={filtered.length}
              noun={filtered.length === 1 ? "Kollokation" : "Kollokationen"}
            />
          </Button>
        </div>

        <FilterRail
          {...filterRailProps}
          className="hidden lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:flex lg:flex-col lg:max-h-[calc(100vh-21rem)] lg:overflow-hidden"
        />
      </div>
    </div>
  );
}
