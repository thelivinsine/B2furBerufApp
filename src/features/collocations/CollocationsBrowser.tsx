import { memo, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Combine, Zap } from "lucide-react";
import { collocations, collocationsByTheme } from "@/data/collocations";
import { themeById } from "@/data/themes";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { HubHero } from "@/components/shared/HubHero";
import { applyFacets, ActiveFilterChip, type FacetSelection } from "@/features/shared/FacetSheet";
import { collocationFacets, COLLOCATION_FACET_IDS } from "@/lib/facets";
import { BrowseToolbar } from "@/features/shared/BrowseToolbar";
import { FilterRail } from "@/features/shared/FilterRail";
import { ViewSwitcher, useViewParam, type LibraryView } from "@/features/shared/ViewSwitcher";
import { CollocationTable, CollocationCompactList } from "./CollocationViews";
import { LibrarySwitcher } from "@/features/library/LibrarySwitcher";
import { SubThemePicker } from "@/features/vocabulary/SubThemePicker";
import { themeGroupsForMode } from "@/lib/themeGroups";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import { usePagedList } from "@/lib/usePagedList";

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c));
}

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
  const [view, setView] = useViewParam(KOLLOKATION_VIEWS);

  const themeParam = params.get("theme") ?? "all";
  const sub = params.get("sub") ?? "";
  const search = params.get("q") ?? "";

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

  const removeFacetValue = (facetId: string, value: string) =>
    setSelection({ ...selection, [facetId]: (selection[facetId] ?? []).filter((v) => v !== value) });

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
  const showPicker = hasSubThemes && !sub;
  const subFilter = hasSubThemes && sub && sub !== "all" ? sub : undefined;
  const activeSub = subThemes.find((s) => s.id === sub);

  const scoped = useMemo(() => {
    let list =
      themeParam === "all" ? collocations : collocations.filter((c) => c.themeId === themeParam);
    if (subFilter) list = list.filter((c) => c.subThemeId === subFilter);
    if (search.trim()) {
      const q = normalise(search.trim());
      list = list.filter(
        (c) =>
          normalise(c.full).includes(q) ||
          normalise(c.noun).includes(q) ||
          normalise(c.verb).includes(q) ||
          normalise(c.en).includes(q),
      );
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

  const activeChips = COLLOCATION_FACETS.flatMap((f) =>
    (selection[f.id] ?? []).map((v) => ({
      facetId: f.id,
      value: v,
      label: f.options.find((o) => o.value === v)?.label ?? v,
    })),
  );

  // Incremental rendering: 60 cards now, the rest as you scroll.
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(filtered);

  const primaryOptions = [{ value: "all", label: "Alle Themen", count: collocations.length }];
  const primaryGroups = useMemo(
    () => themeGroupsForMode(learningMode, themeParam, (id) => collocationsByTheme(id).length),
    [learningMode, themeParam],
  );

  const startSession = () => navigate(`/session${activeTheme ? `?theme=${activeTheme.id}` : ""}`);

  // Mobile keeps Üben in the toolbar (no rail there); on desktop it lives at
  // the bottom of the filter tile (founder follow-up, s91).
  const mobileActions = (
    <Button size="sm" variant="gradient" className="h-10 shrink-0" onClick={startSession}>
      <Zap className="h-3.5 w-3.5" /> Üben
    </Button>
  );

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
      <HubHero
        icon={Combine}
        gradient="from-violet-500 to-purple-500"
        eyebrow="Nomen-Verb-Verbindungen"
        title="Kollokationen"
      />

      {/* Desktop (lg+) is an explicit two-row grid: the tabs + view switcher
          stay at the CONTENT column width (row 1, not full width, founder
          follow-up s91), while the content and the filter tile share row 2 so
          the tile still starts level with the first card. Mobile keeps the
          locked toolbar + sheet; the two never render together. */}
      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8 lg:gap-y-4 lg:space-y-0">
        <div className="space-y-4 lg:col-start-1 lg:row-start-1">
          <LibrarySwitcher />

          <div className="lg:hidden">
            <BrowseToolbar
              search={search}
              onSearch={setSearch}
              searchPlaceholder="Suche nach Nomen, Verb, Übersetzung …"
              primary={{ value: themeParam, onChange: setTheme, options: primaryOptions, groups: primaryGroups }}
              facetItems={scoped}
              facets={COLLOCATION_FACETS}
              facetSelection={selection}
              onFacetChange={setSelection}
              resultLabel={(n) => `${n} Kollokation${n !== 1 ? "en" : ""} anzeigen`}
              activeChips={activeChips}
              onRemoveChip={removeFacetValue}
              trailing={mobileActions}
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <ViewSwitcher views={KOLLOKATION_VIEWS} value={view} onChange={setView} />
            <span className="text-sm tabular-nums text-muted-foreground">
              {filtered.length} Kollokation{filtered.length !== 1 ? "en" : ""}
            </span>
          </div>

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
          {showPicker && activeTheme ? (
            <SubThemePicker
              theme={activeTheme}
              onPick={(s) => setSub(s)}
              onPickAll={() => setSub("all")}
              totalLine={`Alle ${collocationsByTheme(activeTheme.id).length} Kollokationen auf einmal`}
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
            </>
          )}
        </div>

        <FilterRail
          className="hidden lg:col-start-2 lg:row-start-2 lg:sticky lg:top-24 lg:block"
          search={search}
          onSearch={setSearch}
          searchPlaceholder="Suche nach Nomen, Verb, Übersetzung …"
          primary={{
            label: "Thema",
            value: themeParam,
            onChange: setTheme,
            all: { value: "all", label: "Alle Themen", count: collocations.length },
            groups: primaryGroups,
          }}
          items={scoped}
          facets={COLLOCATION_FACETS}
          selection={selection}
          onChange={setSelection}
          pinScope="kollokationen"
          footer={
            <Button variant="gradient" className="h-10 w-full" onClick={startSession}>
              <Zap className="h-3.5 w-3.5" /> Üben
            </Button>
          }
        />
      </div>
    </div>
  );
}
