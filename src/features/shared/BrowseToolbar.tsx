import { Search, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
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

export interface BrowseToolbarProps<T> {
  search: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  primary?: {
    value: string;
    onChange: (value: string) => void;
    options: PrimaryOption[];
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
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-input bg-surface py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          {search && (
            <button
              onClick={() => onSearch("")}
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
