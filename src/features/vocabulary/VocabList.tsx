import { memo, useCallback, useState } from "react";
import { ChevronDown, Bookmark } from "lucide-react";
import type { VocabItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useProgressStore } from "@/store/useProgressStore";
import { mastery, masteryLabel } from "@/engine/srs";
import { usePagedList } from "@/lib/usePagedList";
import { cn } from "@/lib/utils";
import { RelatedPanel, relatedRows } from "./RelatedPanel";

const labelMap = {
  new: { text: "neu", variant: "muted" as const },
  learning: { text: "lernen", variant: "warning" as const },
  review: { text: "wiederholen", variant: "default" as const },
  mastered: { text: "gemeistert", variant: "success" as const },
};

/**
 * One word card, memoized and subscribed to its OWN slice of the progress
 * store. Before this, the whole list (up to 528 cards) subscribed to `srs` +
 * `savedWords` at the top, so toggling one bookmark re-rendered every card.
 * Now a bookmark or review re-renders only the affected card(s).
 */
const VocabCard = memo(function VocabCard({
  v,
  open,
  onToggleOpen,
}: {
  v: VocabItem;
  open: boolean;
  onToggleOpen: (id: string) => void;
}) {
  const label = useProgressStore((s) => masteryLabel(mastery(s.srs[v.id])));
  const saved = useProgressStore((s) => s.savedWords.includes(v.id));
  const toggleSavedWord = useProgressStore((s) => s.toggleSavedWord);
  const badge = labelMap[label];
  const hasRelated = relatedRows(v).length > 0;

  return (
    <Card className="card-hover h-full">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="truncate text-base font-semibold sm:text-lg">{v.de}</p>
              <SpeakButton text={v.de} />
            </div>
            <p className="text-xs text-muted-foreground">
              {v.en}
              {v.plural && ` · Pl.: ${v.plural}`}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Badge variant={badge.variant}>{badge.text}</Badge>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={saved ? "Gespeichert" : "Wort speichern"}
              aria-pressed={saved}
              title={saved ? "Gespeichert" : "Wort speichern"}
              className={cn(saved && "text-primary")}
              onClick={(e) => {
                e.stopPropagation();
                toggleSavedWord(v.id);
              }}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </div>
        </div>
        <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
          „{v.examples[0].de}"
        </p>

        {hasRelated && (
          <button
            onClick={() => onToggleOpen(v.id)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
            aria-expanded={open}
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
            {open ? "Weniger" : "Verbunden"}
          </button>
        )}
        {open && <RelatedPanel item={v} />}
      </CardContent>
    </Card>
  );
});

export function VocabList({ items }: { items: VocabItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const onToggleOpen = useCallback((id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
  }, []);

  // Incremental rendering: the first 60 cards mount instantly; the rest stream
  // in as the sentinel approaches the viewport. (The old version mounted all
  // 528 at once, each in its own staggered motion wrapper.)
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(items);

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visible.map((v) => (
          <VocabCard key={v.id} v={v} open={openId === v.id} onToggleOpen={onToggleOpen} />
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
  );
}
