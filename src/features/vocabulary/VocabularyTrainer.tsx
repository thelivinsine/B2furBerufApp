import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Layers, Sparkles, ChevronLeft, BookOpenText, Zap } from "lucide-react";
import { themes, themeById } from "@/data/themes";
import { vocabulary, vocabByTheme, filterVocab } from "@/data/vocabulary";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useLibraryScope } from "@/store/useLibraryScope";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HubHero } from "@/components/shared/HubHero";
import { BrowseToolbar } from "@/features/shared/BrowseToolbar";
import { LibrarySwitcher, ScopeChip } from "@/features/library/LibrarySwitcher";
import { applyFacets, type FacetSelection } from "@/features/shared/FacetSheet";
import { vocabFacets, VOCAB_FACET_IDS } from "@/lib/facets";
import { defaultVisibleBands, hiddenBandsLabel } from "@/lib/cefr";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { VocabList } from "./VocabList";
import { SubThemePicker } from "./SubThemePicker";

function normalise(s: string) {
  return s.toLowerCase().replace(/[äöüß]/g, (c) => ({ ä: "ae", ö: "oe", ü: "ue", ß: "ss" }[c] ?? c));
}

export function VocabularyTrainer() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const learningMode = useSettingsStore((s) => s.mode);
  const level = useSettingsStore((s) => s.level);
  const scope = useLibraryScope();
  const theme = params.get("theme") ?? "all";
  const sub = params.get("sub") ?? "";
  const [mode, setMode] = useState("flashcards");
  const [search, setSearch] = useState("");
  const [showAllLevels, setShowAllLevels] = useState(false);

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

  const facets = useMemo(() => vocabFacets(learningMode), [learningMode]);

  const activeTheme = theme !== "all" ? themeById(theme) : undefined;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  const showPicker = hasSubThemes && !sub;
  const subFilter = hasSubThemes && sub && sub !== "all" ? sub : undefined;
  const activeSub = subThemes.find((s) => s.id === sub);

  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const id of VOCAB_FACET_IDS) {
      const raw = params.get(id);
      if (raw) s[id] = raw.split(",");
    }
    return s;
  }, [params]);

  const scoped = useMemo(
    () => filterVocab({ theme, sub: subFilter }),
    [theme, subFilter],
  );

  const searched = useMemo(() => {
    if (!search.trim()) return scoped;
    const q = normalise(search.trim());
    return scoped.filter(
      (v) =>
        normalise(v.de).includes(q) ||
        normalise(v.en).includes(q) ||
        v.related.some((r) => normalise(r).includes(q)),
    );
  }, [scoped, search]);

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
  const bandActive = !showAllLevels && !cefrActive && !search.trim() && bandNonEmpty;
  const bandLimited = useMemo(
    () => (bandActive ? searched.filter((v) => !v.cefr || visibleBands.includes(v.cefr)) : searched),
    [searched, bandActive, visibleBands],
  );
  const hiddenLabel = bandActive && bandLimited.length < searched.length ? hiddenBandsLabel(level) : null;

  const items = useMemo(() => applyFacets(bandLimited, facets, selection), [bandLimited, facets, selection]);
  const facetKey = VOCAB_FACET_IDS.map((id) => params.get(id) ?? "").join("|");

  const activeChips = facets.flatMap((f) =>
    (selection[f.id] ?? []).map((v) => ({
      facetId: f.id,
      value: v,
      label: f.options.find((o) => o.value === v)?.label ?? v,
    })),
  );

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
    for (const id of VOCAB_FACET_IDS) {
      const v = next[id];
      if (v && v.length) p.set(id, v.join(","));
      else p.delete(id);
    }
    setParams(p, { replace: true });
  };

  const removeFacetValue = (facetId: string, value: string) =>
    setSelection({ ...selection, [facetId]: (selection[facetId] ?? []).filter((v) => v !== value) });

  const setSub = (s: string) => {
    const p = new URLSearchParams(params);
    if (!s) p.delete("sub");
    else p.set("sub", s);
    setParams(p, { replace: true });
  };

  const primaryOptions = [
    { value: "all", label: "Alle Themen", count: vocabulary.length },
    ...themes.map((t) => ({
      value: t.id,
      label: t.titleDe,
      count: vocabByTheme(t.id).length,
    })),
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <HubHero
        icon={BookOpenText}
        gradient="from-indigo-500 to-violet-500"
        eyebrow="Wortschatz"
        title="Vokabeltrainer"
        description="Lerne mit Karteikarten, aktivem Abrufen und intelligenter Wiederholung (Spaced Repetition)."
      />

      <LibrarySwitcher />

      <BrowseToolbar
        search={search}
        onSearch={setSearch}
        searchPlaceholder="Suche nach Wort, Übersetzung …"
        primary={{ value: theme, onChange: setTheme, options: primaryOptions }}
        facetItems={searched}
        facets={facets}
        facetSelection={selection}
        onFacetChange={setSelection}
        resultLabel={(n) => `${n} Wort${n !== 1 ? "e" : ""} anzeigen`}
        activeChips={activeChips}
        onRemoveChip={removeFacetValue}
        trailing={
          <Button
            size="sm"
            variant="gradient"
            className="h-10 shrink-0"
            onClick={() => navigate(`/session${theme !== "all" ? `?theme=${theme}` : ""}`)}
          >
            <Zap className="h-3.5 w-3.5" /> Üben
          </Button>
        }
      />

      {theme !== "all" && (
        <ScopeChip label={activeTheme?.titleDe ?? theme} onClear={() => setTheme("all")} />
      )}

      {hiddenLabel && (
        <button
          onClick={() => setShowAllLevels(true)}
          className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          Auch {hiddenLabel} zeigen ({searched.length - bandLimited.length})
        </button>
      )}

      {showPicker && activeTheme ? (
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
        </>
      )}
    </div>
  );
}
