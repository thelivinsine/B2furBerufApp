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
import { SearchField } from "@/features/shared/SearchField";

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
  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchField
          value={search}
          onChange={onSearch}
          placeholder={searchPlaceholder}
          className="flex-1"
        />

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
