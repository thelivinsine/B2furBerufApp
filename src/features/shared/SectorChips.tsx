import { Badge } from "@/components/ui/badge";
import { SECTOR_LABEL } from "@/lib/facets";

/**
 * Branche chips (overhaul s102): make an item's sector applicability
 * inspectable on the Tabelle/Karten views. Untagged items render nothing,
 * which by the untagged-= universal rule reads as "general vocabulary".
 */
export function SectorChips({ sectors }: { sectors?: readonly string[] }) {
  if (!sectors?.length) return null;
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {sectors.map((s) => (
        <Badge key={s} variant="muted" className="whitespace-nowrap">
          {SECTOR_LABEL[s] ?? s}
        </Badge>
      ))}
    </span>
  );
}
