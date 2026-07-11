import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Zap, Search, SlidersHorizontal } from "lucide-react";
import type { RedemittelPhrase } from "@/types";
import { redemittel, redemittelByCategory, redemittelCategories } from "@/data/redemittel";
import { iconByName } from "@/lib/icons";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActiveFilterChip, activeFacetCount, type FacetSelection } from "@/features/shared/FacetSheet";
import { FilterRail } from "@/features/shared/FilterRail";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { SearchField } from "@/features/shared/SearchField";
import { fuzzyMatch } from "@/lib/fuzzy";
import { redemittelFacets } from "@/lib/facets";
import { RedemittelTable, RedemittelCompactList } from "./RedemittelViews";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { defaultVisibleBands } from "@/lib/cefr";

const registerLabel: Record<string, { text: string; variant: "muted" | "default" }> = {
  neutral: { text: "neutral", variant: "muted" },
  formal: { text: "formell", variant: "default" },
};

// Bibliothek views (session 91): the card view keeps its category sections;
// Tabelle and Liste are flat lenses over the same filtered list.
const REDEMITTEL_VIEWS: LibraryView[] = ["tabelle", "karten", "liste"];
const REDEMITTEL_FACETS = redemittelFacets();

// The old in-page Wendungen/Üben tabs are gone (audit 2026-07-09): focused
// practice flows through the trailing "Üben" button into the composed
// session, matching Wörter and Kollokationen. RedemittelPractice stays in
// the repo (the session engine's redemittel pool covers the practice loop).
export function RedemittelTrainer() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const level = useSettingsStore((s) => s.level);
  const [showAllLevels, setShowAllLevels] = useState(false);
  const [view, setView] = useViewParam(REDEMITTEL_VIEWS);
  // Mobile filter panel open state: the toggle is an icon on the view line.
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Transient search, outside the filter panel (founder s92).
  const [searchOpen, setSearchOpen] = useState(() => search.trim().length > 0);
  const reduce = useReducedMotion();

  const category = params.get("cat") ?? "all";
  const registerSel = useMemo(() => {
    const raw = params.get("register");
    return raw ? raw.split(",") : [];
  }, [params]);

  const setCategory = (cat: string) => {
    const p = new URLSearchParams(params);
    if (cat === "all") p.delete("cat");
    else p.set("cat", cat);
    setParams(p, { replace: true });
  };

  const categoryScoped = useMemo(() => {
    if (category === "all") return redemittel;
    return redemittelByCategory(category as RedemittelPhrase["category"]);
  }, [category]);

  // Tier-0 personalized default (UX overhaul Phase 2): default to the
  // learner's CEFR band + one step up. Since the audit the active cut shows
  // as a removable chip instead of a quiet text link. Never activates if it
  // would leave nothing to show.
  const visibleBands = useMemo(() => defaultVisibleBands(level), [level]);
  const bandNonEmpty = useMemo(
    () => categoryScoped.some((p) => !p.cefr || visibleBands.includes(p.cefr)),
    [categoryScoped, visibleBands],
  );
  const bandActive = !showAllLevels && !search.trim() && bandNonEmpty;
  const bandLimited = useMemo(
    () =>
      bandActive
        ? categoryScoped.filter((p) => !p.cefr || visibleBands.includes(p.cefr))
        : categoryScoped,
    [categoryScoped, bandActive, visibleBands],
  );
  const bandHiddenCount = bandActive ? categoryScoped.length - bandLimited.length : 0;

  // ONE filter pipeline: category scope -> level band -> search -> register.
  // (The per-category re-filtering that used to live in the render path is
  // gone; sections below just partition this list.) `searched` (pre-register)
  // feeds the FilterRail so its Register counts reflect what a tap yields.
  const searched = useMemo(() => {
    if (!search.trim()) return bandLimited;
    return bandLimited.filter((p) => fuzzyMatch(search, [p.de, p.en]));
  }, [bandLimited, search]);

  const filtered = useMemo(
    () => (registerSel.length ? searched.filter((p) => registerSel.includes(p.register)) : searched),
    [searched, registerSel],
  );

  const railSelection = useMemo(() => {
    const s: FacetSelection = {};
    if (registerSel.length) s.register = registerSel;
    return s;
  }, [registerSel]);

  const setRailSelection = (next: FacetSelection) => {
    const values = next.register ?? [];
    const p = new URLSearchParams(params);
    if (values.length) p.set("register", values.join(","));
    else p.delete("register");
    setParams(p, { replace: true });
  };

  const primaryOptions = [
    { value: "all", label: "Alle Kategorien", count: redemittel.length },
    ...redemittelCategories.map((cat) => ({
      value: cat.id,
      label: cat.labelDe,
      count: redemittelByCategory(cat.id).length,
    })),
  ];

  const categoriesToRender =
    category === "all"
      ? redemittelCategories
      : redemittelCategories.filter((c) => c.id === category);

  // The filter tile is the single filter surface on BOTH breakpoints (founder
  // follow-up, s91): desktop rail + mobile tile share these props. Register is
  // a facet group in the tile, so the old mobile register chips are gone.
  const filterRailProps = {
    primary: {
      label: "Kategorie",
      value: category,
      onChange: setCategory,
      all: { value: "all", label: "Alle Kategorien", count: redemittel.length },
      options: primaryOptions.slice(1),
    },
    items: searched,
    facets: REDEMITTEL_FACETS,
    selection: railSelection,
    onChange: setRailSelection,
    pinScope: "redemittel",
    footer: (
      <Button variant="gradient" className="h-10 w-full" onClick={() => navigate("/session")}>
        <Zap className="h-3.5 w-3.5" /> Üben
      </Button>
    ),
    count: {
      value: filtered.length,
      label: filtered.length !== 1 ? "Wendungen" : "Wendung",
    },
  };

  const cardSections = categoriesToRender.map((cat) => {
        const Icon = iconByName(cat.icon);
        const phrases = filtered.filter((p) => p.category === cat.id);
        if (phrases.length === 0) return null;
        return (
          <section key={cat.id} className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-semibold leading-tight">{cat.labelDe}</h3>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
              <Badge variant="muted" className="ml-auto">{phrases.length}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {phrases.map((p) => {
                const reg = registerLabel[p.register];
                return (
                  <div key={p.id}>
                    <Card className="card-hover h-full">
                      <CardContent className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base font-semibold leading-snug sm:text-lg">{p.de}</p>
                          <SpeakButton text={p.de} />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {p.en}
                          {p.note && ` · 💡 ${p.note}`}
                        </p>
                        <div className="flex items-center justify-between gap-2 border-t border-border pt-2">
                          <p className="text-xs italic text-muted-foreground">„{p.example.de}"</p>
                          <div className="flex shrink-0 items-center gap-1">
                            {p.cefr && <Badge variant="muted">{p.cefr}</Badge>}
                            <Badge variant={reg.variant}>{reg.text}</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </section>
        );
      });

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
        <div className="space-y-4 lg:col-start-1 lg:row-start-1">
          <LibrarySwitcher />

          {/* Toolbar + search + Üben/count share ONE width on mobile (see
              Wörter): the wrapper hugs the toolbar and the Üben row stretches to
              match it. Desktop drops the sizing and keeps Üben/count in the rail. */}
          <div className="mx-auto flex w-fit flex-col gap-2 lg:mx-0 lg:w-full">
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
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
              <div className="flex items-center gap-2 lg:ml-auto">
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
                placeholder="Suche nach Wendung, Übersetzung …"
                autoFocus
              />
            )}

            {/* Mobile-only: Üben fills the row, count stacked at its right. */}
            <div className="flex items-center gap-2 lg:hidden">
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
                  Wendung{filtered.length !== 1 ? "en" : ""}
                </span>
              </div>
            </div>
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
                <FilterRail {...filterRailProps} layout="panel" />
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
              cardSections
            ))}

          {filtered.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              Keine Ergebnisse. Versuche einen anderen Filter oder Begriff.
            </div>
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
