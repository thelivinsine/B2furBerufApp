import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Sparkles,
  ChevronLeft,
  Zap,
  Bookmark,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { themeById } from "@/data/themes";
import { vocabulary, vocabByTheme, vocabBySubTheme, filterVocab } from "@/data/vocabulary";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FilterRail } from "@/features/shared/FilterRail";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { SearchField } from "@/features/shared/SearchField";
import { fuzzyMatch, foldText } from "@/lib/fuzzy";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import {
  applyFacets,
  ActiveFilterChip,
  activeFacetCount,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { vocabFacets, VOCAB_FACET_IDS } from "@/lib/facets";
import { themeGroupsForMode } from "@/lib/themeGroups";
import { mastery, masteryLabel } from "@/engine/srs";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import { cn } from "@/lib/utils";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { VocabList } from "./VocabList";
import { VocabTable, VocabCompactList } from "./VocabViews";

// The graph view carries d3-force and the canvas renderer; it loads only when
// someone actually opens it (Bibliothek views, session 91).
const WordGraph = lazy(() => import("./WordGraph"));

// Mockup order: Tabelle · Graph · Karten · Liste. Only Wörter has the graph.
const WOERTER_VIEWS: LibraryView[] = ["tabelle", "graph", "karten", "liste"];


// UX overhaul Phase 5: the in-page Karteikarten + Quiz tabs are retired here.
// Focused practice now flows through the toolbar's "Üben" button, which launches
// a composed session (SRS flashcards + quiz + drills) via the session engine, so
// the Vokabeltrainer is purely the browse/inspect surface (the word list).
// Flip this back to `true` to restore the old three-tab layout (the Flashcards /
// VocabQuiz components are unchanged and still live in the repo).
const SHOW_PRACTICE_TABS = false;

export function VocabularyTrainer() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const level = useSettingsStore((s) => s.level);
  // Mode pre-selects which DOMAINS the grouped theme dropdown shows (founder
  // decision 2026-07-09, "Mode on top"); it no longer gates any facet.
  const learningMode = useSettingsStore((s) => s.mode);
  const savedWords = useProgressStore((s) => s.savedWords);
  const scope = useLibraryScope();
  const theme = params.get("theme") ?? "all";
  const sub = params.get("sub") ?? "";
  const savedActive = params.get("saved") === "1";
  const [mode, setMode] = useState("flashcards");
  const [search, setSearch] = useState("");
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [view, setView] = useViewParam(WOERTER_VIEWS);
  // Mobile filter panel open state: the toggle lives on the view-options line
  // (an icon), the desktop rail keeps its own header/state.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Search lives outside the filter panel (founder s92): a transient input the
  // search icon toggles open. Closing clears it, so it never lingers as a hidden
  // filter. It starts open if the page was deep-linked with a query.
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0);
  const reduce = useReducedMotion();

  // Tier-2 travelling scope: when arriving without an explicit theme (e.g. via
  // the bottom bar), inherit the shared library scope so the learner's context
  // follows them. URL params always win, so shareable deep links are unaffected.
  useEffect(() => {
    if (!params.get("theme") && scope.theme !== "all") {
      const p = new URLSearchParams(params);
      p.set("theme", scope.theme);
      if (scope.sub) p.set("sub", scope.sub);
      setParams(p, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the shared scope in sync with the page's effective theme (whether set
  // via the dropdown or arrived at through a deep link) so it travels to the
  // other segments.
  useEffect(() => {
    scope.setScope(theme, sub);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, sub]);

  // Content-facet visibility follows the coverage floor in the registry, not
  // the Mode lens (categorization audit 2026-07-09). On top of those, the
  // per-learner Lernstand facet (audit PR 4) is built HERE because its
  // get() reads the learner's own SRS state, not a content field. Its values
  // mirror the card badges exactly (neu/lernen/wiederholen/gemeistert).
  const srs = useProgressStore((s) => s.srs);
  const srsFacet: FacetDef<(typeof vocabulary)[number]> = useMemo(
    () => ({
      id: "srs",
      label: "Lernstand",
      options: [
        { value: "new", label: "neu" },
        { value: "learning", label: "lernen" },
        { value: "review", label: "wiederholen" },
        { value: "mastered", label: "gemeistert" },
      ],
      get: (v) => masteryLabel(mastery(srs[v.id])),
    }),
    [srs],
  );
  const facets = useMemo(() => [...vocabFacets(), srsFacet], [srsFacet]);

  const activeTheme = theme !== "all" ? themeById(theme) : undefined;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  const subFilter = hasSubThemes && sub && sub !== "all" ? sub : undefined;
  const activeSub = subThemes.find((s) => s.id === sub);

  const ALL_FACET_IDS = [...VOCAB_FACET_IDS, "srs"];

  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of ALL_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const scoped = useMemo(
    () => filterVocab({ theme, sub: subFilter }),
    [theme, subFilter],
  );

  const searchedRaw = useMemo(() => {
    if (!search.trim()) return scoped;
    // Forgiving match (typo/umlaut/token-order tolerant) across the word, its
    // gloss and its related terms.
    const direct = scoped.filter((v) => fuzzyMatch(search, [v.de, v.en, ...v.related]));
    if (!direct.length) return direct;
    // Also surface each match's connections: the related terms that resolve to
    // other entries in scope, so a search reveals the little cluster around the
    // word (the same edges the graph draws), not just the word itself.
    const directIds = new Set(direct.map((d) => d.id));
    const relatedNames = new Set<string>();
    direct.forEach((d) => d.related.forEach((r) => relatedNames.add(foldText(r))));
    const connected = scoped.filter(
      (v) => !directIds.has(v.id) && relatedNames.has(foldText(v.de)),
    );
    return [...direct, ...connected];
  }, [scoped, search]);

  // "Gespeichert" filter (#29): a per-learner boolean, so it lives as a toolbar
  // toggle (`?saved=1`) rather than a content facet in the registry.
  const searched = useMemo(
    () => (savedActive ? searchedRaw.filter((v) => savedWords.includes(v.id)) : searchedRaw),
    [searchedRaw, savedActive, savedWords],
  );

  // Tier-0 personalized default (UX overhaul Phase 2): default to the
  // learner's CEFR band + one step up, with a quiet escape, instead of an
  // unfiltered 528-item pile. Skipped once the learner searches, picks an
  // explicit CEFR facet themselves, or the band would leave nothing to show
  // (some levels have thin coverage in a given scope) — the default may
  // never produce an empty list.
  const cefrActive = (selection.cefr?.length ?? 0) > 0;
  const visibleBands = useMemo(() => defaultVisibleBands(level), [level]);
  const bandNonEmpty = useMemo(
    () => searched.some((v) => !v.cefr || visibleBands.includes(v.cefr)),
    [searched, visibleBands],
  );
  const bandActive = !showAllLevels && !cefrActive && !search.trim() && !savedActive && bandNonEmpty;
  const bandLimited = useMemo(
    () => (bandActive ? searched.filter((v) => !v.cefr || visibleBands.includes(v.cefr)) : searched),
    [searched, bandActive, visibleBands],
  );
  const hiddenLabel = bandActive && bandLimited.length < searched.length ? hiddenBandsLabel(level) : null;

  const items = useMemo(() => applyFacets(bandLimited, facets, selection), [bandLimited, facets, selection]);
  const facetKey = ALL_FACET_IDS.map((id) => params.get(id) ?? "").join("|");

  const setTheme = (t: string) => {
    const p = new URLSearchParams(params);
    if (t === "all") p.delete("theme");
    else p.set("theme", t);
    p.delete("sub");
    setParams(p, { replace: true });
    // scope stays in sync via the effect above (covers both dropdown + deep links)
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

  const setSub = (s: string) => {
    const p = new URLSearchParams(params);
    if (!s) p.delete("sub");
    else p.set("sub", s);
    setParams(p, { replace: true });
  };

  const toggleSaved = () => {
    const p = new URLSearchParams(params);
    if (savedActive) p.delete("saved");
    else p.set("saved", "1");
    setParams(p, { replace: true });
  };

  const primaryGroups = useMemo(
    () => themeGroupsForMode(learningMode, theme, (id) => vocabByTheme(id).length),
    [learningMode, theme],
  );

  const startSession = () => navigate(`/session${theme !== "all" ? `?theme=${theme}` : ""}`);

  // Icon-only bookmark filter (founder s92): sits on the view-options line as a
  // bare icon, no label. The Filter toggle now lives inside the tile footer
  // (next to Üben), so it is no longer on this line.
  const savedButton = (
    <Button
      size="icon"
      variant={savedActive ? "default" : "outline"}
      aria-pressed={savedActive}
      aria-label={savedActive ? "Nur gespeicherte Wörter" : "Gespeicherte Wörter"}
      title="Gespeichert"
      className="shrink-0 rounded-lg"
      onClick={toggleSaved}
    >
      <Bookmark className={cn("h-4 w-4", savedActive && "fill-current")} />
    </Button>
  );

  // Search toggle: same icon-only design as the bookmark, sitting to its right.
  const searchButton = (
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
  );

  // Mobile filter toggle: sits at the LEFT of the view switcher (founder s92).
  // Desktop uses the persistent rail instead, so this is mobile-only.
  const facetCount = activeFacetCount(selection);
  const filterButton = (
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
      {facetCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
          {facetCount}
        </span>
      )}
    </Button>
  );

  // The filter tile is now the single filter surface on BOTH breakpoints
  // (founder follow-up, s91): the desktop rail and the mobile tile share
  // these props; only className + defaultOpen differ.
  const filterRailProps = {
    primary: {
      label: "Thema",
      value: theme,
      onChange: setTheme,
      all: { value: "all", label: "Alle Themen", count: vocabulary.length },
      groups: primaryGroups,
    },
    // Sub-theme drill-down as a second dropdown (founder s92): replaces the old
    // full-page SubThemePicker so narrowing to a sub-theme is part of the filter.
    secondary: hasSubThemes
      ? {
          label: "Unterthema",
          value: sub && sub !== "" ? sub : "all",
          onChange: setSub,
          all: {
            value: "all",
            label: "Gesamtes Thema",
            count: vocabByTheme(theme).length,
          },
          options: subThemes.map((s) => ({
            value: s.id,
            label: s.titleDe,
            count: vocabBySubTheme(s.id).length,
          })),
        }
      : undefined,
    items: searched,
    facets,
    selection,
    onChange: setSelection,
    pinScope: "woerter",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
        <Zap className="h-3.5 w-3.5" /> Üben
      </Button>
    ),
    // Count sits stacked to the right of Üben in the tile footer. Hidden in the
    // graph view, where the count lives on the canvas instead.
    count:
      view !== "graph"
        ? { value: items.length, label: items.length === 1 ? "Wort" : "Wörter" }
        : undefined,
  };

  const listContent = SHOW_PRACTICE_TABS ? (
    <Tabs value={mode} onValueChange={setMode}>
      <TabsList className="flex-wrap">
        <TabsTrigger value="flashcards">
          <Layers className="h-4 w-4" /> Karteikarten
        </TabsTrigger>
        <TabsTrigger value="quiz">
          <Sparkles className="h-4 w-4" /> Quiz
        </TabsTrigger>
        <TabsTrigger value="list">
          <BookOpen className="h-4 w-4" /> Übersicht
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flashcards">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Flashcards items={items} key={`fc-${theme}-${sub}-${facetKey}-${search}-${showAllLevels}`} />
        </motion.div>
      </TabsContent>
      <TabsContent value="quiz">
        <VocabQuiz items={items} key={`q-${theme}-${sub}-${facetKey}-${search}-${showAllLevels}`} />
      </TabsContent>
      <TabsContent value="list">
        <VocabList items={items} />
      </TabsContent>
    </Tabs>
  ) : savedActive && items.length === 0 ? (
    <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
      Noch keine gespeicherten Wörter. Tippe das Lesezeichen an einem Wort.
    </p>
  ) : view === "tabelle" ? (
    <VocabTable items={items} />
  ) : view === "liste" ? (
    <VocabCompactList items={items} />
  ) : view === "graph" ? (
    <Suspense
      fallback={
        <div className="h-[60dvh] min-h-[420px] animate-pulse rounded-xl border border-border bg-surface" />
      }
    >
      <WordGraph items={items} />
    </Suspense>
  ) : (
    <VocabList items={items} />
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* No page header: the Bibliothek tabs (LibrarySwitcher) already say which
          section this is (founder s92). */}
      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1, not full width, founder
          follow-up s91), while the content and the filter tile share row 2 so
          the tile still starts level with the first word card. Mobile renders
          the SAME filter tile inline (collapsed by default) instead of a
          toolbar + sheet; only one FilterRail is visible per breakpoint. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8 lg:gap-y-4 lg:space-y-0">
        <div className="space-y-4 lg:col-start-1 lg:row-start-1">
          <LibrarySwitcher />

          {/* Toolbar + search + Üben/count, grouped and full-width on mobile:
              Filter + view on the left, bookmark/search pushed right; Üben fills
              its row with the count at the far right. Desktop keeps Üben/count
              in the rail. */}
          <div className="flex w-full flex-col gap-2">
            {/* Toolbar row: Filter toggle (mobile, left of the view icons) + view
                switcher + bookmark/search on the right. */}
            <div className="flex w-full items-center justify-between gap-2">
              {filterButton}
              <ViewSwitcher views={WOERTER_VIEWS} value={view} onChange={setView} />
              <div className="flex items-center gap-2">
                {savedButton}
                {searchButton}
              </div>
            </div>

            {/* Search input lives OUTSIDE the filter panel (founder s92): a
                transient row the search icon toggles. It does not touch the
                filter state. */}
            {searchOpen && (
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Suche nach Wort, Übersetzung …"
                autoFocus
              />
            )}

            {/* Mobile-only: Üben fills the row, the count sits stacked at its
                right (no grey tile). Desktop keeps Üben/count in the rail. */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button
                variant="gradient"
                className="h-11 flex-1 rounded-xl text-base"
                onClick={startSession}
              >
                <Zap className="h-4 w-4" /> Üben
              </Button>
              {view !== "graph" && (
                <div className="flex shrink-0 flex-col items-center justify-center px-1 leading-none">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {items.length}
                  </span>
                  <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
                    {items.length === 1 ? "Wort" : "Wörter"}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile filter panel: slides open below the count, closed by default.
              Body-only grey tile (Thema + facets); the toggle/Üben/count live in
              the toolbar above. Desktop uses the persistent rail in col 2. */}
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

          {/* The theme ScopeChip was dropped (audit 2026-07-09): the primary
              dropdown already shows the active theme, so the chip was redundant.
              The silent level-band cut now shows as an explicit removable chip. */}
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
              dropdown), not a separate picker page. When a sub-theme is active
              this breadcrumb shows the context and jumps back to the whole theme. */}
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

          {listContent}
        </div>

        <FilterRail
          {...filterRailProps}
          className="no-scrollbar hidden lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-22rem)] lg:overflow-hidden lg:overflow-y-auto"
        />
      </div>
    </div>
  );
}
