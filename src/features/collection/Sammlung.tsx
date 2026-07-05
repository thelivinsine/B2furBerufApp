import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Bookmark, Zap } from "lucide-react";
import { vocabulary } from "@/data/vocabulary";
import { useProgressStore } from "@/store/useProgressStore";
import { cardLevel, MAX_LEVEL } from "@/engine/collection";
import { HubHero } from "@/components/shared/HubHero";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { usePagedList } from "@/lib/usePagedList";
import { cn } from "@/lib/utils";
import type { VocabItem } from "@/types";

/**
 * „Meine Sammlung" (redesign Phase 3.4): the bag view of the stored-value
 * investment loop. Every bookmarked word, plus every word reviewed at least
 * once (collection level >= 1 via engine/collection.ts), shows up here as a
 * collectible card. Not on the nav; reached from the Fortschritt quest board,
 * the same deep-link pattern already used for /quiz.
 */

const levelBadge: Record<number, "muted" | "default" | "warning" | "success"> = {
  1: "muted",
  2: "muted",
  3: "default",
  4: "warning",
  5: "success",
};

interface Entry {
  word: VocabItem;
  level: number;
  saved: boolean;
}

function SammlungCard({ entry }: { entry: Entry }) {
  const { word, level, saved } = entry;
  const toggleSavedWord = useProgressStore((s) => s.toggleSavedWord);

  return (
    <Card className="card-hover h-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-semibold sm:text-lg">{word.de}</p>
              <SpeakButton text={word.de} />
            </div>
            <p className="text-xs text-muted-foreground">{word.en}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            {level > 0 && <Badge variant={levelBadge[level]}>Lv {level}</Badge>}
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={saved ? "Gespeichert" : "Wort speichern"}
              aria-pressed={saved}
              className={cn(saved && "text-primary")}
              onClick={(e) => {
                e.stopPropagation();
                toggleSavedWord(word.id);
              }}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const LEVEL_FILTERS = [0, MAX_LEVEL, 4, 3, 2, 1] as const;

export function Sammlung() {
  const navigate = useNavigate();
  const srs = useProgressStore((s) => s.srs);
  const savedWords = useProgressStore((s) => s.savedWords);
  const [levelFilter, setLevelFilter] = useState<number>(0);

  const entries = useMemo<Entry[]>(() => {
    return vocabulary
      .map((word) => ({
        word,
        level: cardLevel(srs[word.id]),
        saved: savedWords.includes(word.id),
      }))
      .filter((e) => e.level >= 1 || e.saved)
      .sort((a, b) => b.level - a.level || a.word.de.localeCompare(b.word.de));
  }, [srs, savedWords]);

  const filtered = useMemo(
    () => (levelFilter === 0 ? entries : entries.filter((e) => e.level === levelFilter)),
    [entries, levelFilter],
  );

  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(filtered);

  return (
    <div className="space-y-4 sm:space-y-6">
      <HubHero
        icon={Boxes}
        gradient="from-fuchsia-500 to-pink-500"
        eyebrow="Sammlung"
        title="Meine Sammlung"
      />

      {entries.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {LEVEL_FILTERS.map((lv) => (
            <Button
              key={lv}
              size="sm"
              variant={levelFilter === lv ? "default" : "outline"}
              onClick={() => setLevelFilter(lv)}
            >
              {lv === 0 ? "Alle" : `Lv ${lv}`}
            </Button>
          ))}
          <Badge variant="muted" className="self-center">{entries.length} gesammelt</Badge>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-surface px-4 py-10 text-center">
          <p className="text-sm text-muted-foreground">
            Deine Sammlung ist noch leer. Übe eine Runde, um Wörter zu sammeln.
          </p>
          <Button onClick={() => navigate("/session")}>
            <Zap className="h-4 w-4" /> Session starten
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {visible.map((entry) => (
              <SammlungCard key={entry.word.id} entry={entry} />
            ))}
          </div>
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center pt-4">
              <Button variant="outline" size="sm" onClick={showMore}>
                Mehr anzeigen ({remaining} weitere)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
