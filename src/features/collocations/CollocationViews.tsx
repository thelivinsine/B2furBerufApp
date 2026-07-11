import { memo } from "react";
import { collocations } from "@/data/collocations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { DataTable, type DataColumn } from "@/features/shared/DataTable";
import { frequency as frequencyMap, frequencyBin } from "@/data/frequency";
import { usePagedList } from "@/lib/usePagedList";
import { CEFR_ORDER } from "@/lib/cefr";

/**
 * Tabelle + Liste presentations of the Kollokationen tab (Bibliothek views,
 * session 91). Same filtered list as the card grid, different lens.
 */
type Collocation = (typeof collocations)[number];

const FREQ_LABEL: Record<string, string> = {
  core: "Kernwortschatz",
  common: "häufig",
  specialized: "Fachsprache",
};

const COLLOCATION_COLUMNS: DataColumn<Collocation>[] = [
  {
    id: "kollokation",
    label: "Kollokation",
    cell: (c) => (
      <div className="flex min-w-0 items-center gap-1">
        <span className="font-semibold">{c.full}</span>
        <SpeakButton text={c.full} />
      </div>
    ),
    sortValue: (c) => c.noun,
    className: "min-w-[14rem]",
  },
  {
    id: "verb",
    label: "Verb",
    cell: (c) => <span className="text-muted-foreground">{c.verb}</span>,
    sortValue: (c) => c.verb,
  },
  {
    id: "en",
    label: "Englisch",
    cell: (c) => <span className="text-muted-foreground">{c.en}</span>,
    sortValue: (c) => c.en,
    className: "min-w-[12rem]",
  },
  {
    id: "register",
    label: "Register",
    cell: (c) =>
      c.register === "formal" ? <Badge variant="accent">formell</Badge> : null,
    sortValue: (c) => c.register,
  },
  {
    id: "cefr",
    label: "Stufe",
    cell: (c) => (c.cefr ? <Badge variant="muted">{c.cefr}</Badge> : null),
    sortValue: (c) => (c.cefr ? CEFR_ORDER.indexOf(c.cefr) : undefined),
  },
  {
    id: "freq",
    label: "Häufigkeit",
    cell: (c) => {
      const bin = c.frequency ?? frequencyBin(c.id);
      return bin ? <span className="text-muted-foreground">{FREQ_LABEL[bin]}</span> : null;
    },
    sortValue: (c) => frequencyMap[c.id]?.zipf,
  },
];

export function CollocationTable({ items }: { items: Collocation[] }) {
  return <DataTable items={items} columns={COLLOCATION_COLUMNS} rowKey={(c) => c.id} />;
}

const CompactRow = memo(function CompactRow({ c }: { c: Collocation }) {
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-2">
        <span className="block truncate text-sm font-semibold sm:inline">{c.full}</span>
        <span className="block truncate text-xs text-muted-foreground sm:inline sm:text-sm">
          {c.en}
        </span>
      </div>
      {c.register === "formal" && (
        <Badge variant="accent" className="hidden shrink-0 sm:inline-flex">
          formell
        </Badge>
      )}
      {c.cefr && (
        <Badge variant="muted" className="shrink-0">
          {c.cefr}
        </Badge>
      )}
      <SpeakButton text={c.full} className="shrink-0" />
    </li>
  );
});

export function CollocationCompactList({ items }: { items: Collocation[] }) {
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(items);
  return (
    <>
      <ul className="divide-y divide-border/60 rounded-xl border border-border bg-surface">
        {visible.map((c) => (
          <CompactRow key={c.id} c={c} />
        ))}
      </ul>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center pt-2">
          <Button variant="outline" size="sm" onClick={showMore}>
            Mehr anzeigen ({remaining} weitere)
          </Button>
        </div>
      )}
    </>
  );
}
