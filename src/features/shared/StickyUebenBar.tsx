import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Mobile-only floating Üben button (founder follow-up, s91): the filter tile
 * scrolls away on mobile, so the practice CTA floats just above the bottom
 * nav and stays reachable at every scroll position. Desktop keeps Üben in the
 * sticky filter-rail footer, so this is `lg:hidden`. The offset clears the
 * 63px bottom nav + its safe-area inset (see `.pb-nav` in index.css).
 */
export function StickyUebenBar({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none sticky bottom-[calc(4.4375rem_+_env(safe-area-inset-bottom))] z-40 flex justify-center lg:hidden">
      <Button
        variant="gradient"
        onClick={onClick}
        className="pointer-events-auto h-11 w-full max-w-md shadow-glow"
      >
        <Zap className="h-4 w-4" /> Üben
      </Button>
    </div>
  );
}
