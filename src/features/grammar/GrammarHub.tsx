import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal, Zap } from "lucide-react";
import { grammar, grammarById } from "@/data/grammar";
import { Button } from "@/components/ui/button";
import {
  activeFacetCount,
  matchesFacets,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { FilterRail } from "@/features/shared/FilterRail";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { SearchField } from "@/features/shared/SearchField";
import { fuzzyMatch } from "@/lib/fuzzy";
import { grammarFacets, GRAMMAR_FACET_IDS } from "@/lib/facets";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { groupMeta, groupOrder, orderedGrammar } from "./grammarMeta";
import { GrammarTopicCards, GrammarCompactList } from "./GrammarViews";
import { GrammarTopicView } from "./GrammarTopicView";

// Bibliothek views (redesign s93): the Grammatik tab joins the shared browse
// skeleton of the other three tabs (toolbar -> content -> Üben). Karten is the
// default lens, Liste the fast scan; there is no Tabelle (a lesson is not a
// row of atomic facts).
const GRAMMAR_VIEWS: LibraryView[] = ["karten", "liste"];
const GRAMMAR_FACETS = grammarFacets();

export function GrammarHub() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [view, setView] = useViewParam(GRAMMAR_VIEWS);
  // Mobile filter panel open state: the toggle is an icon on the view line.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Transient search, outside the filter panel (founder s92).
  const [searchOpen, setSearchOpen] = useState(false);
  const reduce = useReducedMotion();

  const topicId = params.get("topic");
  const topic = topicId ? grammarById(topicId) : undefined;
  const group = params.get("group") ?? "all";

  // Facet selection rides in the URL (`?cefr=B1.2,B2.1`), like the sibling tabs.
  const railSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of GRAMMAR_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const setRailSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    for (const id of GRAMMAR_FACET_IDS) {
      const values = next[id] ?? [];
      if (values.length) p.set(id, values.join(","));
      else p.delete(id);
    }
    setParams(p, { replace: true });
  };

  // ONE filter pipeline: Gruppe scope -> search -> facets. `searched`
  // (pre-facet) feeds the FilterRail so its Stufe counts reflect what a tap
  // would yield. Order is the B2-marker priority spine, not the bank order.
  const scoped = useMemo(
    () => (group === "all" ? orderedGrammar : orderedGrammar.filter((t) => t.group === group)),
    [group],
  );

  const searched = useMemo(() => {
    if (!search.trim()) return scoped;
    return scoped.filter((t) =>
      fuzzyMatch(search, [t.titleDe, t.title, t.purposeDe, t.pattern, groupMeta[t.group].labelDe]),
    );
  }, [scoped, search]);

  const filtered = useMemo(
    () => searched.filter((t) => matchesFacets(t, GRAMMAR_FACETS, railSelection)),
    [searched, railSelection],
  );

  const setGroup = (g: string) => {
    const p = new URLSearchParams(params);
    if (g === "all") p.delete("group");
    else p.set("group", g);
    setParams(p, { replace: true });
  };

  // Keep `tab=grammatik` (and any other params) intact when opening/closing a
  // topic; replacing the whole param set bounced /library back to the default
  // Wörter tab.
  const openTopic = (id: string) => {
    const p = new URLSearchParams(params);
    p.set("topic", id);
    setParams(p);
  };

  const closeTopic = () => {
    const p = new URLSearchParams(params);
    p.delete("topic");
    setParams(p, { replace: true });
  };

  const groupOptions = useMemo(
    () =>
      groupOrder
        .map((g) => ({
          value: g,
          label: groupMeta[g].labelDe,
          count: grammar.filter((t) => t.group === g).length,
        }))
        .filter((o) => o.count > 0),
    [],
  );

  if (topicId && topic) {
    return <GrammarTopicView topic={topic} onBack={closeTopic} onOpenTopic={openTopic} />;
  }

  // The filter tile is the single filter surface on BOTH breakpoints: desktop
  // rail + mobile panel share these props (same pattern as the sibling tabs).
  const filterRailProps = {
    primary: {
      label: "Gruppe",
      value: group,
      onChange: setGroup,
      all: { value: "all", label: "Alle Gruppen", count: grammar.length },
      options: groupOptions,
    },
    items: searched,
    facets: GRAMMAR_FACETS,
    selection: railSelection,
    onChange: setRailSelection,
    pinScope: "grammatik",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={() => navigate("/session")}>
        <Zap className="h-3.5 w-3.5" /> Üben
      </Button>
    ),
    count: {
      value: filtered.length,
      label: filtered.length !== 1 ? "Themen" : "Thema",
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* No page header: the Bibliothek tabs already name the section (s92). */}
      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1), while the content and the
          filter tile share row 2 so the tile starts level with the first card.
          Mobile renders the SAME filter tile inline as a slide-open panel. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8 lg:gap-y-4 lg:space-y-0">
        <div className="space-y-4 lg:col-start-1 lg:row-start-1">
          <LibrarySwitcher />

          {/* Toolbar: mobile filter toggle · view switcher · search icon. */}
          <div className="flex w-full flex-col gap-2">
            <div className="flex w-full items-center justify-between gap-2">
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
                {activeFacetCount(railSelection) > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                    {activeFacetCount(railSelection)}
                  </span>
                )}
              </Button>
              <ViewSwitcher views={GRAMMAR_VIEWS} value={view} onChange={setView} />
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

            {/* Search input lives outside the filter panel (founder s92). */}
            {searchOpen && (
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Suche nach Thema, Muster …"
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
        </div>

        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
          {filtered.length > 0 &&
            (view === "liste" ? (
              <GrammarCompactList items={filtered} onOpen={openTopic} />
            ) : (
              <GrammarTopicCards items={filtered} onOpen={openTopic} />
            ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
            </div>
          )}
        </div>

        {/* Mobile action bar: Üben + count pinned at the bottom, list scrolls above. */}
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <Button
            variant="gradient"
            className="h-11 flex-1 rounded-xl text-base"
            onClick={() => navigate("/session")}
          >
            <Zap className="h-4 w-4" /> Üben
          </Button>
          <div className="flex shrink-0 flex-col items-center justify-center px-1 leading-none">
            <span className="text-sm font-semibold tabular-nums text-foreground">
              {filtered.length}
            </span>
            <span className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
              Them{filtered.length !== 1 ? "en" : "a"}
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
