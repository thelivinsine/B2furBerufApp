import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Layers, Sparkles, ChevronLeft, BookOpenText, Zap, Bookmark } from "lucide-react";
import { themeById } from "@/data/themes";
import { vocabulary, vocabByTheme, filterVocab } from "@/data/vocabulary";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HubHero } from "@/components/shared/HubHero";
import { FilterRail } from "@/features/shared/FilterRail";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { applyFacets, ActiveFilterChip, type FacetDef, type FacetSelection } from "@/features/shared/FacetSheet";
import { vocabFacets, VOCAB_FACET_IDS } from "@/lib/facets";
import { themeGroupsForMode } from "@/lib/themeGroups";
import { mastery, masteryLabel } from "@/engine/srs";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import { cn } from "@/lib/utils";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { VocabList } from "./VocabList";
import { VocabTable, VocabCompactList } from "./VocabViews";
import { SubThemePicker } from "./SubThemePicker";

// The graph view carries d3-force and the canvas renderer; it loads only when
// someone actually opens it (Bibliothek views, session 91).
const WordGraph = lazy(() => import("./WordGraph"));

// Mockup order: Tabelle · Graph · Karten · Liste. Only Wörter has the graph.
const WOERTER_VIEWS: LibraryView[] = ["tabelle", "graph", "karten", "liste"];

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c));
}

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
  const showPicker = hasSubThemes && !sub;
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
    const q = normalise(search.trim());
    return scoped.filter(
      (v) =>
        normalise(v.de).includes(q) ||
        normalise(v.en).includes(q) ||
        v.related.some((r) => normalise(r).includes(q)),
    );
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

  const savedButton = (
    <Button
      size="sm"
      variant={savedActive ? "default" : "outline"}
      aria-pressed={savedActive}
      className="h-10 shrink-0"
      onClick={toggleSaved}
    >
      <Bookmark className={cn("h-3.5 w-3.5", savedActive && "fill-current")} />
      Gespeichert
      {savedWords.length > 0 && (
        <span className="text-xs opacity-70">({savedWords.length})</span>
      )}
    </Button>
  );

  // The filter tile is now the single filter surface on BOTH breakpoints
  // (founder follow-up, s91): the desktop rail and the mobile tile share
  // these props; only className + defaultOpen differ.
  const filterRailProps = {
    search,
    onSearch: setSearch,
    searchPlaceholder: "Suche nach Wort, Übersetzung …",
    primary: {
      label: "Thema",
      value: theme,
      onChange: setTheme,
      all: { value: "all", label: "Alle Themen", count: vocabulary.length },
      groups: primaryGroups,
    },
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
  };

  // The sub-theme picker replaces the card/table/list content, but never the
  // graph: the graph is at its best over the whole theme.
  const showPickerNow = showPicker && view !== "graph";

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
      <HubHero
        icon={BookOpenText}
        gradient="from-indigo-500 to-violet-500"
        eyebrow="Wortschatz"
        title="Vokabeltrainer"
      />

      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1, not full width, founder
          follow-up s91), while the content and the filter tile share row 2 so
          the tile still starts level with the first word card. Mobile renders
          the SAME filter tile inline (collapsed by default) instead of a
          toolbar + sheet; only one FilterRail is visible per breakpoint. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8 lg:gap-y-4 lg:space-y-0">
        <div className="space-y-4 lg:col-start-1 lg:row-start-1">
          <LibrarySwitcher />

          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <ViewSwitcher views={WOERTER_VIEWS} value={view} onChange={setView} />
            {/* In the graph view the word count sits with the connection
                count at the bottom of the canvas (founder follow-up), so it
                is not repeated here. */}
            {view !== "graph" && (
              <span className="text-sm tabular-nums text-muted-foreground">
                {items.length} {items.length === 1 ? "Wort" : "Wörter"}
              </span>
            )}
            <div className="flex items-center gap-2 lg:ml-auto">{savedButton}</div>
          </div>

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

        {/* Mobile shows the SAME filter tile with Üben in its footer (founder
            follow-up, s91): it is a grid child (so its sticky containing block
            spans the card list), pinned just below the app header and capped,
            so the tile — and the Üben button in it — stays visible while
            scrolling. Desktop renders its own sticky rail in col 2. */}
        <FilterRail
          {...filterRailProps}
          defaultOpen={false}
          className="lg:hidden"
        />

        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
          {showPickerNow && activeTheme ? (
            <SubThemePicker
              theme={activeTheme}
              onPick={(s) => setSub(s)}
              onPickAll={() => setSub("all")}
            />
          ) : (
            <>
              {hasSubThemes && sub && (
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
            </>
          )}
        </div>

        <FilterRail
          {...filterRailProps}
          className="no-scrollbar hidden lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-22rem)] lg:overflow-hidden lg:overflow-y-auto"
        />
      </div>
    </div>
  );
}
