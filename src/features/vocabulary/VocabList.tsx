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
import { useAppConfigStore } from "@/lib/appConfig";

/**
 * The cross-module "Verbunden" dropdown (RelatedPanel: links from a word to a
 * Kollokation / Schreibtraining / Dialog for the same theme) is PARKED for now
 * (founder, 2026-07-19): the feature needs a rethink on how it is useful and
 * what it should depend on. Flip this to `true` to bring the toggle + panel
 * back; RelatedPanel.tsx and relatedRows stay in the repo untouched. Do NOT
 * delete this flag or the panel while it is parked.
 *
 * Steuerung H4 (s146): the compile-time flag became a remote feature flag
 * (`features.relatedPanel`, default false = parked). VocabCard reads it from
 * the app-config store below.
 */

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
  const relatedEnabled = useAppConfigStore((s) => s.config.features.relatedPanel);
  const hasRelated = relatedEnabled && relatedRows(v).length > 0;
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
        {/* Headline (Option B card rework): creature + word on the left,
            bookmark on the right. Speak + plural moved to the card foot so the
            headline stays quiet. */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1.5">
            {gender && <Wesen gender={gender} size={24} />}
            <p className="truncate text-base font-semibold sm:text-lg">{v.de}</p>
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
        <p className="mt-2.5 text-sm italic text-muted-foreground">
          „{v.examples[0].de}"
        </p>

        {/* Parked: the cross-module "Verbunden" panel (SHOW_RELATED=false, see
            top of file). Never renders while parked; kept in place so
            re-enabling it is a one-line flip. */}
        {hasRelated && (
          <div className="flex items-center justify-end pt-2">
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

        {/* Card foot: plural pill on the left, speak on the right (fills where
            the Verbunden toggle sat). mt-auto pins it to the base so every card
            in a row shares one foot line. */}
        <div className={cn("mt-auto flex items-center pt-3", v.plural ? "justify-between" : "justify-end")}>
          {v.plural && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Pl.: {v.plural}
            </span>
          )}
          <span onClick={(e) => e.stopPropagation()}>
            <SpeakButton text={v.de} />
          </span>
        </div>
      </CardContent>
    </Card>
  );

  // Back face: the English translation + its example gloss. For nouns a short
  // gender reveal effect plays behind the content on each flip to the back.
  const back = (
    <Card className="relative h-full overflow-hidden border-primary/30 bg-primary/[0.03]">
      {gender && <ArtikelEffect gender={gender} play={effectPlay} align="right" />}
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
