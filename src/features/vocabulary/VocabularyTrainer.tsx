import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Layers, Sparkles, ChevronLeft } from "lucide-react";
import { themes, themeById } from "@/data/themes";
import { vocabulary, vocabByTheme, filterVocab } from "@/data/vocabulary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/misc";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { VocabList } from "./VocabList";
import { SubThemePicker } from "./SubThemePicker";
// Hidden for now: collocations live under the dedicated /collocations menu
// import { CollocationsList } from "./CollocationsList";

const CEFR_OPTIONS: { id: string; label: string }[] = [
  { id: "all", label: "Alle Stufen" },
  { id: "B1.1", label: "B1.1" },
  { id: "B1.2", label: "B1.2" },
  { id: "B2.1", label: "B2.1" },
  { id: "B2.2", label: "B2.2" },
  { id: "C1", label: "C1" },
];

export function VocabularyTrainer() {
  const [params, setParams] = useSearchParams();
  const theme = params.get("theme") ?? "all";
  const sub = params.get("sub") ?? ""; // "" = none, "all" = whole theme, else a subThemeId
  const cefr = params.get("cefr") ?? "all";
  const [mode, setMode] = useState("flashcards");

  const activeTheme = theme !== "all" ? themeById(theme) : undefined;
  const subThemes = activeTheme?.subThemes ?? [];
  const hasSubThemes = subThemes.length > 0;
  // Show the drill-down picker when a sub-themed topic is chosen but no
  // sub-theme is selected yet. "Gesamtes Thema" sets sub=all to skip it.
  const showPicker = hasSubThemes && !sub;
  const subFilter = hasSubThemes && sub && sub !== "all" ? sub : undefined;
  const activeSub = subThemes.find((s) => s.id === sub);

  const items = useMemo(
    () => filterVocab({ theme, sub: subFilter, cefr }),
    [theme, subFilter, cefr],
  );

  const cefrCount = (c: string) => filterVocab({ theme, sub: subFilter, cefr: c }).length;

  const setTheme = (t: string) => {
    const p = new URLSearchParams(params);
    if (t === "all") p.delete("theme");
    else p.set("theme", t);
    p.delete("sub"); // reset the drill-down whenever the theme changes
    setParams(p, { replace: true });
  };

  const setCefr = (c: string) => {
    const p = new URLSearchParams(params);
    if (c === "all") p.delete("cefr");
    else p.set("cefr", c);
    setParams(p, { replace: true });
  };

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
            <Select value={cefr} onValueChange={setCefr}>
              <SelectTrigger className="w-full sm:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CEFR_OPTIONS.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.label} ({cefrCount(o.id)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

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
                <Flashcards items={items} key={`fc-${theme}-${sub}`} />
              </motion.div>
            </TabsContent>
            <TabsContent value="quiz">
              <VocabQuiz items={items} key={`q-${theme}-${sub}`} />
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
