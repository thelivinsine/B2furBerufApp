import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Layers, Sparkles, ChevronLeft } from "lucide-react";
import type { VocabItem } from "@/types";
import { themes, themeById } from "@/data/themes";
import { vocabulary, vocabByTheme, filterVocab } from "@/data/vocabulary";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FacetSheet,
  ActiveFilterChip,
  applyFacets,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";
import { SectionHeading } from "@/components/shared/misc";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { VocabList } from "./VocabList";
import { SubThemePicker } from "./SubThemePicker";
// Hidden for now: collocations live under the dedicated /collocations menu
// import { CollocationsList } from "./CollocationsList";

// Facet options derive from the values actually present in the bank, so an
// always-empty level/part-of-speech/sector never appears.
const CEFR_ORDER = ["A2", "B1.1", "B1.2", "B2.1", "B2.2", "C1"];
const POS_ORDER = ["noun", "verb", "adjective", "adverb", "phrase", "connector"];
const POS_LABEL: Record<string, string> = {
  noun: "Nomen",
  verb: "Verb",
  adjective: "Adjektiv",
  adverb: "Adverb",
  phrase: "Phrase",
  connector: "Konnektor",
};
const SECTOR_ORDER = ["care", "office", "trades", "it", "retail", "hospitality"];
const SECTOR_LABEL: Record<string, string> = {
  care: "Pflege",
  office: "Büro",
  trades: "Handwerk",
  it: "IT",
  retail: "Handel",
  hospitality: "Gastgewerbe",
};
const present = <T,>(order: T[], has: (v: T) => boolean) => order.filter(has);

const CEFR_FACET: FacetDef<VocabItem> = {
  id: "cefr",
  label: "Stufe (CEFR)",
  hint: "Mehrfachauswahl",
  options: present(CEFR_ORDER, (c) => vocabulary.some((v) => v.cefr === c)).map((c) => ({
    value: c,
    label: c,
  })),
  get: (v) => v.cefr,
};
const POS_FACET: FacetDef<VocabItem> = {
  id: "pos",
  label: "Wortart",
  options: present(POS_ORDER, (p) => vocabulary.some((v) => v.pos === p)).map((p) => ({
    value: p,
    label: POS_LABEL[p],
  })),
  get: (v) => v.pos,
};
const SITUATION_ORDER = [
  "meeting",
  "shift-handover",
  "customer-call",
  "instructions",
  "onboarding",
  "sick-leave",
  "review",
];
const SITUATION_LABEL: Record<string, string> = {
  meeting: "Besprechung",
  "shift-handover": "Übergabe",
  "customer-call": "Kundengespräch",
  instructions: "Unterweisung",
  onboarding: "Einarbeitung",
  "sick-leave": "Krankmeldung",
  review: "Feedback",
};
// Work-mode facets: only exposed when the Mode lens is "work" (Taxonomy Phase 3).
const SECTOR_FACET: FacetDef<VocabItem> = {
  id: "sector",
  label: "Branche",
  options: present(SECTOR_ORDER, (s) => vocabulary.some((v) => v.sector === s)).map((s) => ({
    value: s,
    label: SECTOR_LABEL[s],
  })),
  get: (v) => v.sector,
};
const SITUATION_FACET: FacetDef<VocabItem> = {
  id: "workSituation",
  label: "Situation",
  options: present(SITUATION_ORDER, (s) => vocabulary.some((v) => v.workSituation === s)).map((s) => ({
    value: s,
    label: SITUATION_LABEL[s],
  })),
  get: (v) => v.workSituation,
};
const WORK_FACETS = [SECTOR_FACET, SITUATION_FACET];
const ALL_FACETS = [CEFR_FACET, POS_FACET, SECTOR_FACET, SITUATION_FACET];

export function VocabularyTrainer() {
  const [params, setParams] = useSearchParams();
  const learningMode = useSettingsStore((s) => s.mode);
  const theme = params.get("theme") ?? "all";
  const sub = params.get("sub") ?? ""; // "" = none, "all" = whole theme, else a subThemeId
  const [mode, setMode] = useState("flashcards");

  // Sector + Situation are Work-mode facets: only surface them when lens === "work".
  const facets = useMemo(
    () => (learningMode === "work" ? [CEFR_FACET, POS_FACET, ...WORK_FACETS] : [CEFR_FACET, POS_FACET]),
    [learningMode],
  );

  const activeTheme = theme !== "all" ? themeById(theme) : undefined;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  // Show the drill-down picker when a sub-themed topic is chosen but no
  // sub-theme is selected yet. "Gesamtes Thema" sets sub=all to skip it.
  const showPicker = hasSubThemes && !sub;
  const subFilter = hasSubThemes && sub && sub !== "all" ? sub : undefined;
  const activeSub = subThemes.find((s) => s.id === sub);

  // Selection (CEFR / Wortart / Branche / Situation) lives in the URL alongside ?theme=/?sub=.
  const selection: FacetSelection = useMemo(() => {
    const s: FacetSelection = {};
    for (const f of ALL_FACETS) {
      const raw = params.get(f.id);
      if (raw) s[f.id] = raw.split(",");
    }
    return s;
  }, [params]);

  // Theme + sub scope; the facet sheet counts and the final list build on it.
  const scoped = useMemo(
    () => filterVocab({ theme, sub: subFilter }),
    [theme, subFilter],
  );
  const items = useMemo(() => applyFacets(scoped, facets, selection), [scoped, facets, selection]);
  // Remount key so the flashcard/quiz decks reshuffle when the facets change.
  const facetKey = ALL_FACETS.map((f) => params.get(f.id) ?? "").join("|");

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
    p.delete("sub"); // reset the drill-down whenever the theme changes
    setParams(p, { replace: true });
  };

  const setSelection = (next: FacetSelection) => {
    const p = new URLSearchParams(params);
    for (const f of ALL_FACETS) {
      const v = next[f.id];
      if (v && v.length) p.set(f.id, v.join(","));
      else p.delete(f.id);
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

  return (
    <div className="space-y-4 sm:space-y-6">
      <SectionHeading
        eyebrow="Wortschatz"
        title="Vokabeltrainer"
        description="Lerne mit Karteikarten, aktivem Abrufen und intelligenter Wiederholung (Spaced Repetition)."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Themen ({vocabulary.length})</SelectItem>
                {themes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.titleDe} ({vocabByTheme(t.id).length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FacetSheet
              items={scoped}
              facets={facets}
              selection={selection}
              onChange={setSelection}
              resultLabel={(n) => `${n} Wort${n !== 1 ? "e" : ""} anzeigen`}
              triggerClassName="h-10 sm:w-auto"
            />
          </div>
        }
      />

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map(({ facetId, value, label }) => (
            <ActiveFilterChip
              key={`${facetId}:${value}`}
              label={label}
              onRemove={() => removeFacetValue(facetId, value)}
            />
          ))}
        </div>
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
                <Flashcards items={items} key={`fc-${theme}-${sub}-${facetKey}`} />
              </motion.div>
            </TabsContent>
            <TabsContent value="quiz">
              <VocabQuiz items={items} key={`q-${theme}-${sub}-${facetKey}`} />
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
