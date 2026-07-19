import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import type { RedemittelPhrase } from "@/types";
import { redemittel, redemittelCategories } from "@/data/redemittel";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useSessionStore } from "@/store/useSessionStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FlipCard } from "@/features/shared/FlipCard";
import {
  applyFacets,
  ActiveFilterChip,
  activeFacetCount,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { FilterRail } from "@/features/shared/FilterRail";
import { FeedbackIconButton } from "@/components/layout/FeedbackButton";
import { useScrollDirection, browseHeaderClass, ScrollTopButton, UebenLabel } from "@/features/shared/browseScroll";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { SearchField } from "@/features/shared/SearchField";
import { fuzzyMatch } from "@/lib/fuzzy";
import { redemittelFacets } from "@/lib/facets";
import { RedemittelTable, RedemittelCompactList } from "./RedemittelViews";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { defaultVisibleBands } from "@/lib/cefr";

// Bibliothek views (session 91): a flat card grid, table, or compact list over
// the SAME filtered list. The card view used to carry per-category section
// headers (icon + title + description), but those read as page headers, which
// the other Bibliothek tabs deliberately don't have (founder s104). The
// category is now a filter-pill facet instead, so the card view is a plain
// grid like Wörter/Kollokationen.
const REDEMITTEL_VIEWS: LibraryView[] = ["tabelle", "karten", "liste"];

// Kategorie is a multi-select PILL facet in the filter (founder s104): the
// group names live as pills, not a dropdown scope and not card section
// headers. Register follows it. `?cat=` / `?register=` both ride the facet
// selection.
const CATEGORY_FACET: FacetDef<RedemittelPhrase> = {
  id: "cat",
  label: "Kategorie",
  options: redemittelCategories.map((c) => ({ value: c.id, label: c.labelDe })),
  get: (p) => p.category,
};
const REDEMITTEL_FACETS: FacetDef<RedemittelPhrase>[] = [CATEGORY_FACET, ...redemittelFacets()];
const REDEMITTEL_FACET_IDS = REDEMITTEL_FACETS.map((f) => f.id);

// The old in-page Wendungen/Üben tabs are gone (audit 2026-07-09): focused
// practice flows through the trailing "Üben" button into the composed
// session, matching Wörter and Kollokationen. RedemittelPractice stays in
// the repo (the session engine's redemittel pool covers the practice loop).
export function RedemittelTrainer() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const setLibrarySession = useSessionStore((s) => s.setLibrarySession);
  const [search, setSearch] = useState("");
  const level = useSettingsStore((s) => s.level);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [view, setView] = useViewParam(REDEMITTEL_VIEWS);
  // Mobile filter panel open state: the toggle is an icon on the view line.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Transient search, outside the filter panel (founder s92).
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0);
  const reduce = useReducedMotion();
  const { hidden: headerHidden, scrolled } = useScrollDirection();

  // Facet selection (Kategorie + Register) rides the URL, exactly like the
  // sibling tabs. `?cat=` is now a facet param, not a scope.
  const railSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of REDEMITTEL_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const setRailSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    for (const id of REDEMITTEL_FACET_IDS) {
      const v = next[id];
      if (v && v.length) p.set(id, v.join(","));
      else p.delete(id);
    }
    setParams(p, { replace: true });
  };

  // Tier-0 personalized default (UX overhaul Phase 2): default to the
  // learner's CEFR band + one step up, over the full bank (facets apply
  // last, like Wörter/Kollokationen). Never activates if it would leave
  // nothing to show.
  const visibleBands = useMemo(() => defaultVisibleBands(level), [level]);
  const bandNonEmpty = useMemo(
    () => redemittel.some((p) => !p.cefr || visibleBands.includes(p.cefr)),
    [visibleBands],
  );
  const bandActive = !showAllLevels && !search.trim() && bandNonEmpty;
  const bandLimited = useMemo(
    () =>
      bandActive ? redemittel.filter((p) => !p.cefr || visibleBands.includes(p.cefr)) : redemittel,
    [bandActive, visibleBands],
  );
  const bandHiddenCount = bandActive ? redemittel.length - bandLimited.length : 0;

  // ONE filter pipeline: level band -> search -> facets (Kategorie + Register).
  // `searched` (pre-facet) feeds the FilterRail so its pill counts reflect
  // what a tap would yield.
  const searched = useMemo(() => {
    if (!search.trim()) return bandLimited;
    return bandLimited.filter((p) => fuzzyMatch(search, [p.de, p.en]));
  }, [bandLimited, search]);

  const filtered = useMemo(
    () => applyFacets(searched, REDEMITTEL_FACETS, railSelection),
    [searched, railSelection],
  );

  // Üben practises EXACTLY the filtered Redemittel (founder 2026-07-13): hand the
  // tab's filtered ids to the session store and launch a Redemittel-only session
  // with `?src=lib`, so "Üben" on this tab is never a generic vocab session.
  const startSession = () => {
    setLibrarySession({ type: "redemittel", ids: filtered.map((r) => r.id) });
    navigate("/session?src=lib");
  };

  // The filter tile is the single filter surface on BOTH breakpoints (founder
  // follow-up, s91): desktop rail + mobile tile share these props. Kategorie +
  // Register are both pill facets; there is no scope dropdown.
  const filterRailProps = {
    items: searched,
    facets: REDEMITTEL_FACETS,
    selection: railSelection,
    onChange: setRailSelection,
    pinScope: "redemittel",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
        <UebenLabel
          iconClass="h-3.5 w-3.5"
          count={filtered.length}
          noun={filtered.length === 1 ? "Wendung" : "Wendungen"}
        />
      </Button>
    ),
  };

  // Flat card grid (no section headers, founder s104): one card per phrase,
  // same language as the Kollokationen cards. Flip tile (founder 2026-07-13):
  // German front, English on the back. The CEFR + Register badges were dropped
  // from the tile (both are filter facets, so repeating them here is redundant).
  const cardGrid = (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {filtered.map((p) => {
        const front = (
          <Card className="card-hover h-full">
            <CardContent className="flex h-full flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-base font-semibold leading-snug sm:text-lg">{p.de}</p>
                <span onClick={(e) => e.stopPropagation()}>
                  <SpeakButton text={p.de} />
                </span>
              </div>
              <p className="border-t border-border pt-2 text-xs italic text-muted-foreground">
                „{p.example.de}"
              </p>
            </CardContent>
          </Card>
        );
        const back = (
          <Card className="h-full border-primary/30 bg-primary/[0.03]">
            <CardContent className="flex h-full flex-col gap-2 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
                Englisch
              </p>
              <p className="text-sm font-medium">{p.en}</p>
              {p.note && <p className="text-xs text-muted-foreground">💡 {p.note}</p>}
              {p.example.en && (
                <p className="border-t border-border pt-2 text-xs italic text-muted-foreground">
                  „{p.example.en}"
                </p>
              )}
            </CardContent>
          </Card>
        );
        return <FlipCard key={p.id} front={front} back={back} label={`Übersetzung von ${p.de}`} />;
      })}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* No page header: the Bibliothek tabs already name the section (s92). */}
      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1, not full width, founder
          follow-up s91), while the content and the filter tile share row 2 so
          the tile still starts level with the first card. Mobile renders the
          SAME filter tile inline (collapsed by default; Register is a facet
          group in it now); only one FilterRail is visible per breakpoint. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8 lg:gap-y-4 lg:space-y-0">
        <div className={`${browseHeaderClass(headerHidden && !filtersOpen, scrolled)} space-y-4 lg:sticky lg:top-16 lg:z-20 lg:col-start-1 lg:row-start-1 lg:self-start lg:pb-3`}>
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
                  {activeFacetCount(railSelection) > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                      {activeFacetCount(railSelection)}
                    </span>
                  )}
                </Button>
                <ViewSwitcher views={REDEMITTEL_VIEWS} value={view} onChange={setView} />
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
                      placeholder="Suche nach Wendung, Übersetzung …"
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
                placeholder="Suche nach Wendung, Übersetzung …"
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

          {bandActive && bandHiddenCount > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <ActiveFilterChip
                label={`Stufe: bis ${visibleBands[visibleBands.length - 1]}`}
                onRemove={() => setShowAllLevels(true)}
              />
            </div>
          )}
        </div>

        <div className="min-w-0 space-y-4 lg:col-start-1 lg:row-start-2">
          {filtered.length > 0 &&
            (view === "tabelle" ? (
              <RedemittelTable items={filtered} />
            ) : view === "liste" ? (
              <RedemittelCompactList items={filtered} />
            ) : (
              cardGrid
            ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
            </div>
          )}
        </div>

        {/* Mobile action bar: Üben (count folded into the label) pinned at the
            bottom, list scrolls above. */}
        <ScrollTopButton show={scrolled} />
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden">
          <FeedbackIconButton />
          <Button
            variant="gradient"
            className="h-11 flex-1 rounded-xl text-base"
            onClick={startSession}
          >
            <UebenLabel
              iconClass="h-4 w-4"
              count={filtered.length}
              noun={filtered.length === 1 ? "Wendung" : "Wendungen"}
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
