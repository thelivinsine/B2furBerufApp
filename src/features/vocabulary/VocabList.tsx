import { memo, useCallback, useState, type ComponentType } from "react";
import { ChevronDown, Bookmark } from "lucide-react";
import type { VocabItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useProgressStore } from "@/store/useProgressStore";
import { usePagedList } from "@/lib/usePagedList";
import { FlipCard } from "@/features/shared/FlipCard";
import { cn } from "@/lib/utils";
import { genderOf } from "@/components/artikel/gender";
import { Wesen } from "@/components/artikel/Wesen";
import { ArtikelEffect } from "@/components/artikel/ArtikelEffect";
import { hasDoodle, loadDoodle } from "./doodles";
import { RelatedPanel, relatedRows } from "./RelatedPanel";

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
  const saved = useProgressStore((s) => s.savedWords.includes(v.id));
  const toggleSavedWord = useProgressStore((s) => s.toggleSavedWord);
  const hasRelated = relatedRows(v).length > 0;
  const gender = genderOf(v);
  // Replay trigger for the gender reveal effect: bumped on each front→back flip.
  const [effectPlay, setEffectPlay] = useState(0);
  // Fused doodle (Phase 2): the art chunk loads lazily on the FIRST flip of a
  // card that has one; cards without registered art render exactly as before.
  const withDoodle = hasDoodle(v.id);
  const [Doodle, setDoodle] = useState<ComponentType | null>(null);
  const onFlip =
    gender || withDoodle
      ? (flipped: boolean) => {
          if (!flipped) return;
          if (gender) setEffectPlay((n) => n + 1);
          if (withDoodle) {
            // Idempotent: repeat loads reuse the cached chunk/module.
            void loadDoodle(v.id).then((C) => C && setDoodle(() => C));
          }
        }
      : undefined;

  // Front face: the German word + example. English lives on the flip side.
  // NO filter-facet tags on the tile (founder 2026-07-13): Häufigkeit, Branche
  // AND the Lernstand/mastery badge were all dropped because each is a filter in
  // the rail, so repeating it on the card is redundant. Only the plural (not a
  // facet) and the bookmark action remain. The flip hint icon was removed too;
  // the whole tile still flips on click.
  const front = (
    <Card className="card-hover h-full">
      <CardContent className="flex h-full flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {gender && <Wesen gender={gender} size={24} />}
              <p className="truncate text-base font-semibold sm:text-lg">{v.de}</p>
              <span onClick={(e) => e.stopPropagation()}>
                <SpeakButton text={v.de} />
              </span>
            </div>
            {v.plural && (
              <p className="text-xs text-muted-foreground">Pl.: {v.plural}</p>
            )}
          </div>
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={saved ? "Gespeichert" : "Wort speichern"}
            aria-pressed={saved}
            title={saved ? "Gespeichert" : "Wort speichern"}
            className={cn("shrink-0", saved && "text-primary")}
            onClick={(e) => {
              e.stopPropagation();
              toggleSavedWord(v.id);
            }}
          >
            <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
          </Button>
        </div>
        <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
          „{v.examples[0].de}"
        </p>

        {/* Bottom-right corner: the "Verbunden" toggle. Stops propagation so it
            does not flip the tile. */}
        {hasRelated && (
          <div className="mt-auto flex items-center justify-end pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleOpen(v.id);
              }}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              aria-expanded={open}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
              {open ? "Weniger" : "Verbunden"}
            </button>
          </div>
        )}
        {open && (
          <div onClick={(e) => e.stopPropagation()}>
            <RelatedPanel item={v} />
          </div>
        )}
      </CardContent>
    </Card>
  );

  // Back face: the English translation + its example gloss. For nouns a short
  // gender reveal effect plays behind the content on each flip to the back.
  const back = (
    <Card className="relative h-full overflow-hidden border-primary/30 bg-primary/[0.03]">
      {gender && <ArtikelEffect gender={gender} play={effectPlay} />}
      <CardContent className="relative z-10 flex h-full flex-col p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          Englisch
        </p>
        {Doodle && (
          <div className="flex justify-center py-1">
            <Doodle />
          </div>
        )}
        <p className="mt-1 text-base font-semibold sm:text-lg">{v.en}</p>
        {v.plural && <p className="mt-1 text-xs text-muted-foreground">Plural: {v.plural}</p>}
        {v.examples[0].en && (
          <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
            „{v.examples[0].en}"
          </p>
        )}
      </CardContent>
    </Card>
  );

  return <FlipCard front={front} back={back} label={`Übersetzung von ${v.de}`} onFlip={onFlip} />;
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
