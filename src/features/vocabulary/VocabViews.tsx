import { memo } from "react";
import { Bookmark } from "lucide-react";
import type { VocabItem } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { DataTable, type DataColumn } from "@/features/shared/DataTable";
import { useProgressStore } from "@/store/useProgressStore";
import { mastery, masteryLabel } from "@/engine/srs";
import { frequency as frequencyMap, frequencyBin } from "@/data/frequency";
import { usePagedList } from "@/lib/usePagedList";
import { CEFR_ORDER } from "@/lib/cefr";
import { SECTOR_LABEL } from "@/lib/facets";
import { SectorChips } from "@/features/shared/SectorChips";
import { cn } from "@/lib/utils";

/**
 * The Tabelle + Liste presentations of the Wörter tab (Bibliothek views,
 * session 91). Both render the SAME filtered list the card grid gets; they
 * are lenses, not separate data paths. Per-row store subscriptions follow the
 * VocabList pattern: each row subscribes to its OWN srs/bookmark slice, so
 * toggling one bookmark never re-renders the whole table.
 */
const masteryBadge = {
  new: { text: "neu", variant: "muted" as const },
  learning: { text: "lernen", variant: "warning" as const },
  review: { text: "wiederholen", variant: "default" as const },
  mastered: { text: "gemeistert", variant: "success" as const },
};

const POS_LABEL: Record<string, string> = {
  noun: "Nomen",
  verb: "Verb",
  adjective: "Adjektiv",
  adverb: "Adverb",
  phrase: "Phrase",
  connector: "Konnektor",
};

const FREQ_LABEL: Record<string, string> = {
  core: "Kernwortschatz",
  common: "häufig",
  specialized: "Fachsprache",
};

/** Sort key without the article, so "die Besprechung" files under B. */
const sortForm = (v: VocabItem) => v.de.replace(/^(der|die|das)\s+/i, "");

function MasteryBadge({ id }: { id: string }) {
  const label = useProgressStore((s) => masteryLabel(mastery(s.srs[id])));
  const badge = masteryBadge[label];
  return <Badge variant={badge.variant}>{badge.text}</Badge>;
}

export function SaveButton({ id }: { id: string }) {
  const saved = useProgressStore((s) => s.savedWords.includes(id));
  const toggleSavedWord = useProgressStore((s) => s.toggleSavedWord);
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-label={saved ? "Gespeichert" : "Wort speichern"}
      aria-pressed={saved}
      className={cn(saved && "text-primary")}
      onClick={() => toggleSavedWord(id)}
    >
      <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
    </Button>
  );
}

const VOCAB_COLUMNS: DataColumn<VocabItem>[] = [
  {
    id: "wort",
    label: "Wort",
    cell: (v) => (
      <div className="flex min-w-0 items-center gap-1">
        <span className="font-semibold">{v.de}</span>
        <SpeakButton text={v.de} />
      </div>
    ),
    sortValue: sortForm,
    className: "min-w-[12rem]",
  },
  {
    id: "plural",
    label: "Plural",
    cell: (v) => <span className="text-muted-foreground">{v.plural ?? ""}</span>,
    className: "min-w-[9rem]",
  },
  {
    id: "en",
    label: "Englisch",
    cell: (v) => <span className="text-muted-foreground">{v.en}</span>,
    sortValue: (v) => v.en,
    className: "min-w-[10rem]",
  },
  {
    id: "pos",
    label: "Wortart",
    cell: (v) => <span className="text-muted-foreground">{POS_LABEL[v.pos] ?? v.pos}</span>,
    sortValue: (v) => POS_LABEL[v.pos] ?? v.pos,
  },
  {
    id: "cefr",
    label: "Stufe",
    cell: (v) => (v.cefr ? <Badge variant="muted">{v.cefr}</Badge> : null),
    sortValue: (v) => (v.cefr ? CEFR_ORDER.indexOf(v.cefr) : undefined),
  },
  {
    id: "freq",
    label: "Häufigkeit",
    cell: (v) => {
      const bin = v.frequency ?? frequencyBin(v.id);
      return bin ? <span className="text-muted-foreground">{FREQ_LABEL[bin]}</span> : null;
    },
    // Raw Zipf, so "häufig" sorts by actual corpus commonness, not bin order.
    sortValue: (v) => frequencyMap[v.id]?.zipf,
  },
  {
    id: "branche",
    label: "Branche",
    cell: (v) => <SectorChips sectors={v.sectors} />,
    // Sort by the first Branche label; untagged (general) rows sink.
    sortValue: (v) => (v.sectors?.length ? SECTOR_LABEL[v.sectors[0]] : undefined),
    className: "min-w-[10rem]",
  },
  {
    id: "lernstand",
    label: "Lernstand",
    cell: (v) => <MasteryBadge id={v.id} />,
  },
  {
    id: "save",
    label: "",
    cell: (v) => <SaveButton id={v.id} />,
    className: "w-10",
  },
];

export function VocabTable({ items }: { items: VocabItem[] }) {
  return <DataTable items={items} columns={VOCAB_COLUMNS} rowKey={(v) => v.id} />;
}

/** One dense list row: word + gloss on the left, state on the right. */
const CompactRow = memo(function CompactRow({ v }: { v: VocabItem }) {
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-2">
        <span className="block truncate text-sm font-semibold sm:inline">{v.de}</span>
        <span className="block truncate text-xs text-muted-foreground sm:inline sm:text-sm">
          {v.en}
        </span>
      </div>
      {v.cefr && (
        <Badge variant="muted" className="hidden shrink-0 sm:inline-flex">
          {v.cefr}
        </Badge>
      )}
      <div className="shrink-0">
        <MasteryBadge id={v.id} />
      </div>
      <SpeakButton text={v.de} className="shrink-0" />
      <div className="shrink-0">
        <SaveButton id={v.id} />
      </div>
    </li>
  );
});

export function VocabCompactList({ items }: { items: VocabItem[] }) {
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(items);
  return (
    <>
      <ul className="divide-y divide-border/60 rounded-xl border border-border bg-surface">
        {visible.map((v) => (
          <CompactRow key={v.id} v={v} />
        ))}
      </ul>
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
