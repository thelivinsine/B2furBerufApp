import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import { grammar, grammarById } from "@/data/grammar";
import { Button } from "@/components/ui/button";
import {
  activeFacetCount,
  matchesFacets,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { FilterRail } from "@/features/shared/FilterRail";
import { FeedbackIconButton } from "@/components/layout/FeedbackButton";
import { useScrollDirection, browseHeaderClass, ScrollTopButton, UebenLabel } from "@/features/shared/browseScroll";
import { useSessionStore } from "@/store/useSessionStore";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { SearchField } from "@/features/shared/SearchField";
import { fuzzyMatch } from "@/lib/fuzzy";
import { grammarFacets } from "@/lib/facets";
import type { GrammarTopic } from "@/types";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { groupMeta, groupOrder, orderedGrammar } from "./grammarMeta";
import { GrammarTopicCards, GrammarCompactList } from "./GrammarViews";
import { GrammarTopicView } from "./GrammarTopicView";

// Bibliothek views (redesign s93): the Grammatik tab joins the shared browse
// skeleton of the other three tabs (toolbar -> content -> Üben). Karten is the
// default lens, Liste the fast scan; there is no Tabelle (a lesson is not a
// row of atomic facts).
const GRAMMAR_VIEWS: LibraryView[] = ["karten", "liste"];

// Gruppe is a multi-select PILL facet (founder 2026-07-13), unified with the
// Redemittel Kategorie facet: it renders as pills with "Mehr anzeigen", allows
// several groups at once, and still rides the `?group=` param. (It used to be a
// single scope dropdown.)
const GROUP_FACET: FacetDef<GrammarTopic> = {
  id: "group",
  label: "Gruppe",
  options: groupOrder
    .filter((g) => grammar.some((t) => t.group === g))
    .map((g) => ({ value: g, label: groupMeta[g].labelDe })),
  get: (t) => t.group,
};
const GRAMMAR_FACETS = [GROUP_FACET, ...grammarFacets()];
const FACET_IDS = GRAMMAR_FACETS.map((f) => f.id);

export function GrammarHub() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const setLibrarySession = useSessionStore((s) => s.setLibrarySession);
  const [search, setSearch] = useState("");
  const [view, setView] = useViewParam(GRAMMAR_VIEWS);
  // Mobile filter panel open state: the toggle is an icon on the view line.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Transient search, outside the filter panel (founder s92).
  const [searchOpen, setSearchOpen] = useState(false);
  const reduce = useReducedMotion();
  const { hidden: headerHidden, scrolled } = useScrollDirection();

  const topicId = params.get("topic");
  const topic = topicId ? grammarById(topicId) : undefined;

  // Facet selection rides in the URL (`?group=…&cefr=B1.2,B2.1`), like the
  // sibling tabs. `group` is now one of the facet ids (see GROUP_FACET).
  const railSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const setRailSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    for (const id of FACET_IDS) {
      const values = next[id] ?? [];
      if (values.length) p.set(id, values.join(","));
      else p.delete(id);
    }
    setParams(p, { replace: true });
  };

  // ONE filter pipeline: search -> facets (Gruppe + Stufe). `searched`
  // (pre-facet) feeds the FilterRail so its facet counts reflect what a tap
  // would yield. Order is the B2-marker priority spine, not the bank order.
  const searched = useMemo(() => {
    if (!search.trim()) return orderedGrammar;
    return orderedGrammar.filter((t) =>
      fuzzyMatch(search, [t.titleDe, t.title, t.purposeDe, t.pattern, groupMeta[t.group].labelDe]),
    );
  }, [search]);

  const filtered = useMemo(
    () => searched.filter((t) => matchesFacets(t, GRAMMAR_FACETS, railSelection)),
    [searched, railSelection],
  );

  // Üben drills EXACTLY the filtered grammar topics (founder 2026-07-13): hand the
  // filtered topic ids to the session store and launch a grammar-only session
  // with `?src=lib`, so "Üben" on a group practises that group's drills only.
  const startSession = () => {
    setLibrarySession({ type: "grammar", ids: filtered.map((t) => t.id) });
    navigate("/session?src=lib");
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

  if (topicId && topic) {
    return <GrammarTopicView topic={topic} onBack={closeTopic} onOpenTopic={openTopic} />;
  }

  // The filter tile is the single filter surface on BOTH breakpoints: desktop
  // rail + mobile panel share these props (same pattern as the sibling tabs).
  const filterRailProps = {
    items: searched,
    facets: GRAMMAR_FACETS,
    selection: railSelection,
    onChange: setRailSelection,
    pinScope: "grammatik",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
        <UebenLabel iconClass="h-3.5 w-3.5" />
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
        <div className={`${browseHeaderClass(headerHidden)} space-y-4 lg:sticky lg:top-16 lg:z-20 lg:col-start-1 lg:row-start-1 lg:self-start lg:bg-background/90 lg:pb-3 lg:backdrop-blur`}>
          <LibrarySwitcher />

          {/* Toolbar: mobile filter toggle · view switcher · search icon. */}
          <div className="flex w-full flex-col gap-2">
            {/* Items are centered while search is closed; opening search slides
                the icon groups apart to make room for the field (founder
                2026-07-13). */}
            <motion.div
              layout={!reduce}
              className={`flex w-full items-center gap-2 ${searchOpen ? "justify-between" : "justify-center"}`}
            >
              <motion.div layout={!reduce ? "position" : false} className="flex items-center gap-2">
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
                      placeholder="Suche nach Thema, Muster …"
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
                placeholder="Suche nach Thema, Muster …"
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
        <ScrollTopButton show={scrolled} />
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <FeedbackIconButton />
          <Button
            variant="gradient"
            className="h-11 flex-1 rounded-xl text-base"
            onClick={startSession}
          >
            <UebenLabel iconClass="h-4 w-4" />
          </Button>
          <div className="flex w-20 shrink-0 flex-col items-center justify-center px-1 leading-none">
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
          className="hidden lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:flex lg:flex-col lg:max-h-[calc(100vh-21rem)] lg:overflow-hidden"
        />
      </div>
    </div>
  );
}
