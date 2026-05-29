import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Layers, Sparkles } from "lucide-react";
import { themes } from "@/data/themes";
import { vocabulary, vocabByTheme } from "@/data/vocabulary";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionHeading } from "@/components/shared/misc";
import { Flashcards } from "./Flashcards";
import { VocabQuiz } from "./VocabQuiz";
import { VocabList } from "./VocabList";

export function VocabularyTrainer() {
  const [params, setParams] = useSearchParams();
  const theme = params.get("theme") ?? "all";
  const [mode, setMode] = useState("flashcards");

  const items = useMemo(
    () => (theme === "all" ? vocabulary : vocabByTheme(theme)),
    [theme],
  );

  const setTheme = (t: string) => {
    const p = new URLSearchParams(params);
    if (t === "all") p.delete("theme");
    else p.set("theme", t);
    setParams(p, { replace: true });
  };

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Wortschatz"
        title="Vokabeltrainer"
        description="Lerne mit Karteikarten, aktivem Abrufen und intelligenter Wiederholung (Spaced Repetition)."
        action={
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
        }
      />

      <Tabs value={mode} onValueChange={setMode}>
        <TabsList>
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
            <Flashcards items={items} key={`fc-${theme}`} />
          </motion.div>
        </TabsContent>
        <TabsContent value="quiz">
          <VocabQuiz items={items} key={`q-${theme}`} />
        </TabsContent>
        <TabsContent value="list">
          <VocabList items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
