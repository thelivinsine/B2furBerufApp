import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FacetSheet,
  ActiveFilterChip,
  type FacetDef,
  type FacetSelection,
} from "@/features/shared/FacetSheet";

export interface PrimaryOption {
  value: string;
  label: string;
  count?: number;
}

export interface PrimaryGroup {
  label: string;
  options: PrimaryOption[];
}

export interface BrowseToolbarProps<T> {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  primary?: {
    value: string;
    onChange: (value: string) => void;
    /** Flat options, rendered first (e.g. "Alle Themen"). */
    options: PrimaryOption[];
    /** Optional grouped options rendered after `options` with group headings
     *  (the Domain-grouped theme dropdown, audit PR 4). */
    groups?: PrimaryGroup[];
  };
  facetItems: T[];
  facets: FacetDef<T>[];
  facetSelection: FacetSelection;
  onFacetChange: (next: FacetSelection) => void;
  resultLabel: (n: number) => string;
  activeChips: { facetId: string; value: string; label: string }[];
  onRemoveChip: (facetId: string, value: string) => void;
  trailing?: React.ReactNode;
}

export function BrowseToolbar<T>({
  search,
  onSearch,
  searchPlaceholder = "Suchen …",
  primary,
  facetItems,
  facets,
  facetSelection,
  onFacetChange,
  resultLabel,
  activeChips,
  onRemoveChip,
  trailing,
}: BrowseToolbarProps<T>) {
  // Typing stays local and instant; the (potentially expensive) list filter
  // behind onSearch runs debounced. Two pages also write the query to the URL,
  // so this additionally keeps history.replaceState off the per-keystroke path
  // (Safari rate-limits it and throws when exceeded).
  const [value, setValue] = useState(search);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(search);

  const flush = (v: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    lastSentRef.current = v;
    onSearch(v);
  };

  const handleChange = (v: string) => {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(v), 180);
  };

  // Adopt external changes (deep link, scope chip clearing the query) without
  // clobbering in-flight typing: only sync when the prop moved on its own.
  useEffect(() => {
    if (search !== lastSentRef.current) {
      lastSentRef.current = search;
      setValue(search);
    }
  }, [search]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-input bg-surface py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {value && (
            <button
              onClick={() => {
                setValue("");
                flush("");
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {primary && (
          <Select value={primary.value} onValueChange={primary.onChange}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {primary.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.count != null ? ` (${opt.count})` : ""}
                </SelectItem>
              ))}
              {primary.groups?.map((group) => (
                <SelectGroup key={group.label}>
                  <SelectLabel>{group.label}</SelectLabel>
                  {group.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                      {opt.count != null ? ` (${opt.count})` : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        )}

        <FacetSheet
          items={facetItems}
          facets={facets}
          selection={facetSelection}
          onChange={onFacetChange}
          resultLabel={resultLabel}
          triggerClassName="h-10"
        />

        {trailing}
      </div>

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map(({ facetId, value, label }) => (
            <ActiveFilterChip
              key={`${facetId}:${value}`}
              label={label}
              onRemove={() => onRemoveChip(facetId, value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
