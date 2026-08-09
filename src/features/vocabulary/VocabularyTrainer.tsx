import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useT, useTitle } from "@/lib/uiLang";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Layers,
  Sparkles,
  ChevronLeft,
  Bookmark,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { themeById } from "@/data/themes";
import { vocabulary, browsableVocabulary, vocabByTheme, vocabBySubTheme } from "@/data/vocabulary";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { useSessionStore } from "@/store/useSessionStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FilterRail } from "@/features/shared/FilterRail";
import { FeedbackNote } from "@/components/layout/FeedbackButton";
import {
  useScrollDirection,
  useEdgeFade,
  browseHeaderClass,
  browseColumnClass,
  ScrollTopButton,
  UebenLabel,
  BROWSE_FILTER_BUTTON,
  BROWSE_TOOLBAR_BUTTON,
  BROWSE_TOOLBAR_BUTTON_ON,
} from "@/features/shared/browseScroll";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { SearchField } from "@/features/shared/SearchField";
import { fuzzyMatch, foldText } from "@/lib/fuzzy";
import {
  applyFacets,
  ActiveFilterChip,
  activeFacetCount,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import {
  vocabFacets,
  VOCAB_FACET_IDS,
  SECTOR_OPTIONS,
  matchesSector,
  sectorFirst,
} from "@/lib/facets";
import { themeGroupsForMode } from "@/lib/themeGroups";
import {
  lifeAreaOfTheme,
  matchesLifeArea,
  normalizeLifeArea,
  type LifeAreaId,
} from "@/lib/lifeAreas";
import { countLifeAreas } from "@/features/shared/LifeAreaPills";
import type { WorkSector } from "@/types";
import { mastery, masteryLabel } from "@/engine/srs";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import {
  CLUSTER_CLEARANCE,
  FloatingActionCluster,
  floatingSlot,
} from "@/features/shared/floatingCluster";
import { ScrollRootProvider } from "@/lib/scrollRoot";
import { cn } from "@/lib/utils";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { ArtikelLegend } from "@/components/artikel/ArtikelLegend";
import { VocabList } from "./VocabList";
import { VocabTable, VocabCompactList } from "./VocabViews";
import { useAppConfigStore } from "@/lib/appConfig";

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
// Steuerung H4 (s146): this became a remote feature flag
// (`features.practiceTabs`, default false); the component reads it below.

export function VocabularyTrainer() {
  const t = useT();
  const titleOf = useTitle();
  // The desktop scroll container, handed to `usePagedList` through context so
  // its sentinel observes THIS element rather than the viewport (s189).
  const [scrollRoot, setScrollRoot] = useState<HTMLElement | null>(null);

  const showPracticeTabs = useAppConfigStore((s) => s.config.features.practiceTabs);
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const level = useSettingsStore((s) => s.level);
  // Mode pre-selects which DOMAINS the grouped theme dropdown shows (founder
  // decision 2026-07-09, "Mode on top"); it no longer gates any facet.
  const learningMode = useSettingsStore((s) => s.mode);
  const savedWords = useProgressStore((s) => s.savedWords);
  const scope = useLibraryScope();
  const setLibrarySession = useSessionStore((s) => s.setLibrarySession);
  // Scope dropdowns are multi-select (s104, founder decision): each rides a
  // comma-list URL param, empty/absent = "everything". `theme`/`sector` were
  // briefly single-value scope params after the s102 Branche overhaul; s104
  // reverted that so multiple Themen/Branchen can be picked together.
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
  // Lebensbereich pills (s184): single-select, "" = beides. Sits between Branche
  // and Thema in the rail and in this pipeline.
  const lifeArea = useMemo(() => normalizeLifeArea(params.get("area")), [params]);
  const savedActive = params.get("saved") === "1";
  const [mode, setMode] = useState("flashcards");
  const [search, setSearch] = useState("");
  const showAllLevels = useSettingsStore((s) => s.showAllCefrLevels);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const setShowAllLevels = (v: boolean) => setSettings({ showAllCefrLevels: v });
  const [view, setView] = useViewParam(WOERTER_VIEWS);
  // Mobile filter panel open state: the toggle lives on the view-options line
  // (an icon), the desktop rail keeps its own header/state.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Search lives outside the filter panel (founder s92): a transient input the
  // search icon toggles open. Closing clears it, so it never lingers as a hidden
  // filter. It starts open if the page was deep-linked with a query.
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0);
  const reduce = useReducedMotion();
  const { hidden: headerHidden, scrolled } = useScrollDirection(scrollRoot);
  // Soft top/bottom edges for the internal scroll column (founder s190).
  const edge = useEdgeFade(scrollRoot);

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

  // Keep the shared scope in sync with the page's effective theme, but only
  // when it resolves to exactly ONE theme (`useLibraryScope` is a single
  // "where am I" choice; a multi-Thema selection has no one value to travel).
  useEffect(() => {
    if (themes.length === 1) scope.setScope(themes[0], subs[0] ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themes, subs]);

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
  // Facet order (founder follow-up s104): Wortart moves up to sit right after
  // Thema/Unterthema, Häufigkeit and Lernstand keep following it, and Stufe
  // (CEFR) moves to the true end of the tile instead of leading. `vocabFacets()`
  // still gates on the coverage floor; CEFR is pulled out of its registry
  // order and appended last (after the per-learner Lernstand facet, which the
  // registry doesn't know about).
  const facets = useMemo(() => {
    const registry = vocabFacets();
    const cefr = registry.find((f) => f.id === "cefr");
    const rest = registry.filter((f) => f.id !== "cefr");
    return cefr ? [...rest, srsFacet, cefr] : [...rest, srsFacet];
  }, [srsFacet]);

  // Sub-theme drill-down only makes sense with exactly ONE active Thema (a
  // multi-theme selection has no single sub-theme spine, s104).
  const activeTheme = themes.length === 1 ? themeById(themes[0]) : undefined;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  const subFilter = hasSubThemes && subs.length ? subs : undefined;
  const activeSub = subThemes.find((s) => subs.includes(s.id));

  const ALL_FACET_IDS = [...VOCAB_FACET_IDS, "srs"];

  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of ALL_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  // Lebensbereich cut, applied FIRST: it is the coarsest topic scope (a Thema
  // always sits in exactly one area), so everything below it counts within the
  // chosen area. A word carries its area through its Thema; there is no
  // untagged-=-universal escape here the way there is for Branche.
  const areaScoped = useMemo(
    () =>
      lifeArea
        ? browsableVocabulary.filter((v) => matchesLifeArea(v.themeId, lifeArea))
        : browsableVocabulary,
    [lifeArea],
  );

  // Theme-scoped list BEFORE the Branche cut, so the Branche dropdown can show
  // per-sector dedicated-content counts within the current Thema scope.
  const themeScoped = useMemo(() => {
    let list = themes.length ? areaScoped.filter((v) => themes.includes(v.themeId)) : areaScoped;
    if (subFilter) list = list.filter((v) => !!v.subThemeId && subFilter.includes(v.subThemeId));
    return list;
  }, [areaScoped, themes, subFilter]);

  // Pill counts: words per area within the current BRANCHE scope, ignoring the
  // Thema/Unterthema below (the pills supersede those) and the attribute facets.
  // Same shape as the Branche dropdown's own counts, which are likewise computed
  // before search and facets, so the two rows of numbers mean the same thing.
  const areaCounts = useMemo(
    () =>
      countLifeAreas(
        sectors.length
          ? browsableVocabulary.filter((v) => matchesSector(v, sectors))
          : browsableVocabulary,
        (v) => lifeAreaOfTheme(v.themeId),
      ),
    [sectors],
  );
  // The Branche scope cut (root-cause fix, s102; multi-select s104): untagged
  // words are general vocabulary and stay visible under EVERY selected
  // Branche; tagged words hide only under Branchen NOT in the selection.
  const scoped = useMemo(
    () => (sectors.length ? themeScoped.filter((v) => matchesSector(v, sectors)) : themeScoped),
    [themeScoped, sectors],
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

  // With one or more Branchen selected, the sector-tagged Fachwörter lead the
  // list and the general words follow (s102 overhaul, multi-select s104).
  const items = useMemo(
    () => sectorFirst(applyFacets(bandLimited, facets, selection), sectors),
    [bandLimited, facets, selection, sectors],
  );
  const facetKey = ALL_FACET_IDS.map((id) => params.get(id) ?? "").join("|");

  const setThemes = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("theme", next.join(","));
    else p.delete("theme");
    p.delete("sub");
    setParams(p, { replace: true });
    // scope stays in sync via the effect above (covers both dropdown + deep links)
  };

  const setSectors = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("sector", next.join(","));
    else p.delete("sector");
    setParams(p, { replace: true });
  };

  // Picking a Lebensbereich drops any Thema outside it (and the Unterthema that
  // hangs off it), so the pill, the Thema dropdown and the list can never
  // disagree. Clearing the pill leaves the rest of the scope alone.
  const setLifeArea = (next: LifeAreaId | "") => {
    const p = new URLSearchParams(params);
    if (next) p.set("area", next);
    else p.delete("area");
    if (next) {
      const kept = themes.filter((id) => matchesLifeArea(id, next));
      if (kept.length !== themes.length) {
        if (kept.length) p.set("theme", kept.join(","));
        else p.delete("theme");
        p.delete("sub");
      }
    }
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

  const setSubs = (next: string[]) => {
    const p = new URLSearchParams(params);
    if (next.length) p.set("sub", next.join(","));
    else p.delete("sub");
    setParams(p, { replace: true });
  };

  const toggleSaved = () => {
    const p = new URLSearchParams(params);
    if (savedActive) p.delete("saved");
    else p.set("saved", "1");
    setParams(p, { replace: true });
  };

  const primaryGroups = useMemo(
    () => themeGroupsForMode(learningMode, themes, (id) => vocabByTheme(id).length, lifeArea),
    [learningMode, themes, lifeArea],
  );

  // Carry the learner's active learning scope into the session, so Üben
  // practises what they are looking at (theme, sub-theme, CEFR, Branche).
  // pos/srs/frequency are browse lenses, not learning scopes, so they are
  // deliberately not forwarded.
  // Üben practises EXACTLY the currently filtered words (founder 2026-07-13):
  // hand the tab's filtered ids to the session store, so the composed session is
  // vocab-only and scoped to this view, then launch it with `?src=lib`.
  const startSession = () => {
    setLibrarySession({ type: "vocab", ids: items.map((v) => v.id) });
    navigate("/session?src=lib");
  };

  // Icon-only bookmark filter (founder s92): sits on the view-options line as a
  // bare icon, no label. The Filter toggle now lives inside the tile footer
  // (next to Üben), so it is no longer on this line.
  const savedButton = (
    <Button
      size="icon"
      variant="outline"
      aria-pressed={savedActive}
      aria-label={t(savedActive ? "Nur gespeicherte Wörter" : "Gespeicherte Wörter")}
      title="Gespeichert"
      className={cn(BROWSE_TOOLBAR_BUTTON, savedActive && BROWSE_TOOLBAR_BUTTON_ON)}
      onClick={toggleSaved}
    >
      <Bookmark className={cn("h-3.5 w-3.5", savedActive && "fill-current")} />
    </Button>
  );

  // Search toggle: same icon-only design as the bookmark, sitting to its right.
  const searchButton = (
    <Button
      size="icon"
      variant="outline"
      aria-pressed={searchOpen}
      aria-expanded={searchOpen}
      aria-label={t("Suche")}
      title={t("Suche")}
      className={cn(BROWSE_TOOLBAR_BUTTON, (searchOpen || search.trim()) && BROWSE_TOOLBAR_BUTTON_ON)}
      onClick={() =>
        setSearchOpen((o) => {
          if (o) setSearch("");
          return !o;
        })
      }
    >
      <Search className="h-3.5 w-3.5" />
    </Button>
  );

  // Mobile filter toggle: sits at the LEFT of the view switcher (founder s92).
  // Desktop uses the persistent rail instead, so this is mobile-only.
  // The badge counts BOTH the facet pills AND the scope dropdowns
  // (Branche/Thema/Unterthema), matching the FilterRail's own header badge, so
  // picking a dropdown value updates the button count too (founder bug report).
  const scopeActiveCount =
    sectors.length + (lifeArea ? 1 : 0) + themes.length + (hasSubThemes ? subs.length : 0);
  const facetCount = activeFacetCount(selection) + scopeActiveCount;
  const filterButton = (
    <Button
      size="icon"
      variant="accent"
      aria-pressed={filtersOpen}
      aria-expanded={filtersOpen}
      aria-label={t("Filter")}
      title={t("Filter")}
      className={cn("relative lg:hidden", BROWSE_TOOLBAR_BUTTON, BROWSE_FILTER_BUTTON)}
      onClick={() => setFiltersOpen((o) => !o)}
    >
      <SlidersHorizontal className="h-3.5 w-3.5" />
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
    // Ordered scope hierarchy (founder, s102; multi-select s104): Branche →
    // Thema → Unterthema.
    scopes: [
      {
        pinId: "sector",
        label: "Branche",
        // Its count is the DEDICATED-content signal, so a zero LOCKS rather
        // than merely reads 0 (founder s199): picking it could only serve the
        // universal pool behind it, which is what made Branche feel like a
        // working filter while it changed nothing.
        lockZero: true,
        values: sectors,
        onChange: setSectors,
        // The count is the DEDICATED-content signal (sector-tagged items in the
        // current Thema scope); zero-count Branchen stay selectable because
        // general words always show.
        all: { value: "all", label: "Alle Branchen", count: themeScoped.length },
        options: SECTOR_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
          count: themeScoped.filter((v) => v.sectors?.includes(o.value as WorkSector)).length,
        })),
      },
      {
        pinId: "primary",
        label: "Thema",
        values: themes,
        onChange: setThemes,
        all: { value: "all", label: "Alle Themen", count: browsableVocabulary.length },
        groups: primaryGroups,
      },
      // Sub-theme drill-down as a third dropdown (founder s92): replaces the old
      // full-page SubThemePicker so narrowing to a sub-theme is part of the
      // filter. Only rendered when exactly one Thema is active (`hasSubThemes`).
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
                count: vocabByTheme(themes[0]).length,
              },
              options: subThemes.map((s) => ({
                value: s.id,
                label: titleOf(s),
                count: vocabBySubTheme(s.id).length,
              })),
            },
          ]
        : []),
    ],
    // Lebensbereich pills, rendered by the rail directly under Branche (s184).
    area: { value: lifeArea, onChange: setLifeArea, counts: areaCounts },
    items: searched,
    facets,
    selection,
    onChange: setSelection,
    pinScope: "woerter",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
        <UebenLabel
          iconClass="h-3.5 w-3.5"
          count={items.length}
          noun={items.length === 1 ? "Wort" : "Wörtern"}
        />
      </Button>
    ),
  };

  const listContent = showPracticeTabs ? (
    <Tabs value={mode} onValueChange={setMode}>
      <TabsList className="flex-wrap">
        <TabsTrigger value="flashcards">
          <Layers className="h-4 w-4" /> Karteikarten
        </TabsTrigger>
        <TabsTrigger value="quiz">
          <Sparkles className="h-4 w-4" /> Quiz
        </TabsTrigger>
        <TabsTrigger value="list">
          <BookOpen className="h-4 w-4" /> {t("Übersicht")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="flashcards">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Flashcards items={items} key={`fc-${themes.join(",")}-${subs.join(",")}-${facetKey}-${search}-${showAllLevels}`} />
        </motion.div>
      </TabsContent>
      <TabsContent value="quiz">
        <VocabQuiz items={items} key={`q-${themes.join(",")}-${subs.join(",")}-${facetKey}-${search}-${showAllLevels}`} />
      </TabsContent>
      <TabsContent value="list">
        <VocabList items={items} />
      </TabsContent>
    </Tabs>
  ) : savedActive && items.length === 0 ? (
    <p className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center text-sm text-muted-foreground">
      {t("Noch keine gespeicherten Wörter. Tippe das Lesezeichen an einem Wort.")}
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
    <div className="space-y-4 sm:space-y-6 lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:space-y-[1.05rem]">
      {/* No page header: the Bibliothek tabs (LibrarySwitcher) already say which
          section this is (founder s92). */}
      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1, not full width, founder
          follow-up s91), while the content and the filter tile share row 2 so
          the tile still starts level with the first word card. Mobile renders
          the SAME filter tile inline (collapsed by default) instead of a
          toolbar + sheet; only one FilterRail is visible per breakpoint. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:min-h-0 lg:flex-1 lg:grid-rows-[auto_minmax(0,1fr)] lg:items-stretch lg:gap-x-8 lg:gap-y-[1.05rem] lg:space-y-0">
        <div className={`${browseHeaderClass(headerHidden)} space-y-4 lg:sticky lg:top-[4.75rem] lg:z-20 lg:col-start-1 lg:row-start-1 lg:self-start lg:pb-2`}>
          {/* Toolbar + search + Üben/count, grouped and full-width on mobile:
              Filter + view on the left, bookmark/search pushed right; Üben fills
              its row with the count at the far right. Desktop keeps Üben/count
              in the rail. */}
          <div className="flex w-full flex-col gap-2">
            {/* Toolbar row: Filter toggle (mobile, left of the view icons) + view
                switcher + bookmark/search on the right. On DESKTOP an open
                search grows inline in THIS row (founder s104: no third line),
                pushing the icons to the right edge; mobile keeps the second
                row below. */}
            {/* Toolbar items are centered while search is closed; opening
                search slides the icon groups apart to make room for the field
                (founder 2026-07-13). */}
            <motion.div
              layout={!reduce}
              className={cn(
                "flex w-full items-center gap-2",
                searchOpen ? "justify-between" : "justify-center",
              )}
            >
              <motion.div layout={!reduce ? "position" : false} className="flex items-center gap-2">
                {filterButton}
                <ViewSwitcher views={WOERTER_VIEWS} value={view} onChange={setView} />
              </motion.div>
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
                      placeholder={t("Suche nach Wort, Übersetzung …")}
                      autoFocus
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div layout={!reduce ? "position" : false} className="flex items-center gap-2">
                {savedButton}
                {searchButton}
              </motion.div>
            </motion.div>

            {/* Mobile-only second row: the same transient search input. Desktop
                shows it inline in the toolbar row above instead. */}
            {searchOpen && (
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder={t("Suche nach Wort, Übersetzung …")}
                autoFocus
                className="lg:hidden"
              />
            )}

          </div>

        </div>

        {/* Mobile filter panel: normal-flow content, deliberately OUTSIDE the
            sticky header so it scrolls away with the page instead of staying
            pinned on screen (the sticky toolbar above keeps the toggle). Body-
            only grey tile; desktop uses the persistent rail in col 2. */}
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

        <div
          ref={setScrollRoot}
          className={browseColumnClass(edge)}
        >
          <ScrollRootProvider value={scrollRoot}>
            {/* The theme ScopeChip was dropped (audit 2026-07-09): the primary
                dropdown already shows the active theme, so the chip was redundant.
                The silent level-band cut shows as an explicit removable chip.
                It rides with the CONTENT, not the sticky toolbar (2026-07-31):
                the toolbar row is transparent now, so a chip pinned there would
                float on top of the card titles scrolling underneath. */}
            {hiddenLabel && (
              <div className="flex flex-wrap items-center gap-2">
                <ActiveFilterChip
                  label={`${t("Stufe: bis")} ${visibleBands[visibleBands.length - 1]}`}
                  onRemove={() => setShowAllLevels(true)}
                />
              </div>
            )}
  
            {/* One-time Artikel-Wesen legend (dismiss state in the settings
                store). Teaches the three gender creatures before they appear
                beside the words below. */}
            <ArtikelLegend />
  
            {/* Sub-theme drill-down now lives in the filter (the Unterthema
                dropdown), not a separate picker page. When one or more sub-themes
                are active this breadcrumb shows the context and jumps back to the
                whole theme. */}
            {hasSubThemes && subs.length > 0 && (
              <button
                onClick={() => setSubs([])}
                className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeft className="h-4 w-4" />
                {activeTheme ? titleOf(activeTheme) : ""}
                <span className="text-muted-foreground/60">/</span>
                <span className="text-foreground">
                  {subs.length === 1
                    ? (activeSub ? titleOf(activeSub) : t("Gesamtes Thema"))
                    : `${subs.length} ${t("Unterthemen")}`}
                </span>
              </button>
            )}
  
            {listContent}
          </ScrollRootProvider>
        </div>

        {/* Mobile action bar: Üben (with the filtered-set count folded into the
            label) stays pinned at the bottom of the screen (above the nav) so
            the list scrolls above it. Desktop keeps Üben in the rail. */}
        <ScrollTopButton show={scrolled} root={scrollRoot} />
        <FloatingActionCluster note={<FeedbackNote />}>
          <div className={cn(floatingSlot, "w-full max-w-sm")}>
            <Button
              variant="gradient"
              className="h-11 w-full rounded-xl text-base"
              onClick={startSession}
            >
              <UebenLabel
                iconClass="h-4 w-4"
                count={items.length}
                noun={items.length === 1 ? "Wort" : "Wörtern"}
              />
            </Button>
          </div>
        </FloatingActionCluster>
        <div className={CLUSTER_CLEARANCE} aria-hidden />

        <FilterRail
          {...filterRailProps}
          className="hidden lg:col-start-2 lg:row-start-2 lg:flex lg:flex-col lg:self-start lg:max-h-[calc(100%-3.5rem)] lg:overflow-hidden"
        />
      </div>
    </div>
  );
}
