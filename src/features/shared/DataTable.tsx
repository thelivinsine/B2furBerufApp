import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePagedList } from "@/lib/usePagedList";
import { cn } from "@/lib/utils";

/**
 * Generic sortable table for the Bibliothek "Tabelle" view (session 91).
 * Column defs supply the cell renderer and an optional sortValue; clicking a
 * sortable header cycles ascending → descending → bank order. Strings sort
 * with German collation (ä/ö/ü/ß in dictionary position). Rows render
 * incrementally through the same usePagedList contract as the card grids, so
 * a 642-row bank never mounts at once, and the table scrolls horizontally
 * inside its own container on narrow screens.
 */
export interface DataColumn<T> {
  id: string;
  label: string;
  cell: (item: T) => React.ReactNode;
  /** Present = the column header sorts by this value. */
  sortValue?: (item: T) => string | number | undefined;
  /** Applied to both the header and body cells (width, alignment, visibility). */
  className?: string;
}

type SortState = { id: string; dir: "asc" | "desc" } | null;

const collator = new Intl.Collator("de", { sensitivity: "base" });

export function DataTable<T>({
  items,
  columns,
  rowKey,
}: {
  items: T[];
  columns: DataColumn<T>[];
  rowKey: (item: T) => string;
}) {
  const [sort, setSort] = useState<SortState>(null);

  const cycleSort = (id: string) =>
    setSort((cur) => {
      if (cur?.id !== id) return { id, dir: "asc" };
      if (cur.dir === "asc") return { id, dir: "desc" };
      return null;
    });

  const sorted = useMemo(() => {
    if (!sort) return items;
    const col = columns.find((c) => c.id === sort.id);
    if (!col?.sortValue) return items;
    const get = col.sortValue;
    const sign = sort.dir === "asc" ? 1 : -1;
    return [...items].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      // Missing values always sink to the bottom, regardless of direction.
      if (va === undefined && vb === undefined) return 0;
      if (va === undefined) return 1;
      if (vb === undefined) return -1;
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * sign;
      return collator.compare(String(va), String(vb)) * sign;
    });
  }, [items, columns, sort]);

  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(sorted);

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={
                    sort?.id === col.id
                      ? sort.dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.className,
                  )}
                >
                  {col.sortValue ? (
                    // `uppercase` again: Tailwind's preflight resets
                    // text-transform on buttons, so the th class alone
                    // doesn't reach the sortable headers.
                    <button
                      onClick={() => cycleSort(col.id)}
                      className="inline-flex items-center gap-1 uppercase tracking-wide transition-colors hover:text-foreground"
                    >
                      {col.label}
                      {sort?.id === col.id ? (
                        sort.dir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((item) => (
              <tr
                key={rowKey(item)}
                className="border-b border-border/60 last:border-b-0 hover:bg-muted/40"
              >
                {columns.map((col) => (
                  <td key={col.id} className={cn("px-3 py-2 align-middle", col.className)}>
                    {col.cell(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
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
