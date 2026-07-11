import { memo } from "react";
import type { RedemittelPhrase } from "@/types";
import { redemittelCategories } from "@/data/redemittel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { DataTable, type DataColumn } from "@/features/shared/DataTable";
import { usePagedList } from "@/lib/usePagedList";
import { CEFR_ORDER } from "@/lib/cefr";

/**
 * Tabelle + Liste presentations of the Redemittel tab (Bibliothek views,
 * session 91). The card view keeps its category sections; these two are flat
 * lenses over the same filtered list, with Kategorie as a column instead.
 */
const categoryLabel = (id: string) =>
  redemittelCategories.find((c) => c.id === id)?.labelDe ?? id;

const REDEMITTEL_COLUMNS: DataColumn<RedemittelPhrase>[] = [
  {
    id: "wendung",
    label: "Wendung",
    cell: (p) => (
      <div className="flex min-w-0 items-center gap-1">
        <span className="font-semibold">{p.de}</span>
        <SpeakButton text={p.de} />
      </div>
    ),
    sortValue: (p) => p.de,
    className: "min-w-[16rem]",
  },
  {
    id: "en",
    label: "Englisch",
    cell: (p) => <span className="text-muted-foreground">{p.en}</span>,
    sortValue: (p) => p.en,
    className: "min-w-[12rem]",
  },
  {
    id: "kategorie",
    label: "Kategorie",
    cell: (p) => <span className="text-muted-foreground">{categoryLabel(p.category)}</span>,
    sortValue: (p) => categoryLabel(p.category),
  },
  {
    id: "register",
    label: "Register",
    cell: (p) =>
      p.register === "formal" ? (
        <Badge variant="default">formell</Badge>
      ) : (
        <Badge variant="muted">neutral</Badge>
      ),
    sortValue: (p) => p.register,
  },
  {
    id: "cefr",
    label: "Stufe",
    cell: (p) => (p.cefr ? <Badge variant="muted">{p.cefr}</Badge> : null),
    sortValue: (p) => (p.cefr ? CEFR_ORDER.indexOf(p.cefr) : undefined),
  },
];

export function RedemittelTable({ items }: { items: RedemittelPhrase[] }) {
  return <DataTable items={items} columns={REDEMITTEL_COLUMNS} rowKey={(p) => p.id} />;
}

const CompactRow = memo(function CompactRow({ p }: { p: RedemittelPhrase }) {
  return (
    <li className="flex items-center gap-2 px-3 py-2">
      <div className="min-w-0 flex-1 sm:flex sm:items-baseline sm:gap-2">
        <span className="block truncate text-sm font-semibold sm:inline">{p.de}</span>
        <span className="block truncate text-xs text-muted-foreground sm:inline sm:text-sm">
          {p.en}
        </span>
      </div>
      {p.register === "formal" && (
        <Badge variant="default" className="hidden shrink-0 sm:inline-flex">
          formell
        </Badge>
      )}
      {p.cefr && (
        <Badge variant="muted" className="shrink-0">
          {p.cefr}
        </Badge>
      )}
      <SpeakButton text={p.de} className="shrink-0" />
    </li>
  );
});

export function RedemittelCompactList({ items }: { items: RedemittelPhrase[] }) {
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(items);
  return (
    <>
      <ul className="divide-y divide-border/60 rounded-xl border border-border bg-surface">
        {visible.map((p) => (
          <CompactRow key={p.id} p={p} />
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
