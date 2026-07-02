import { SessionPlayer } from "@/features/session/SessionPlayer";

/**
 * Schnellwiederholung is now the short preset of the composed session engine
 * (UX overhaul Phase 1): the same interleaved player, sized to ~5 minutes for a
 * quick 5-minute-break run. Kept as its own route so existing deep links and
 * the recommend hero keep working.
 */
export function QuickRevision() {
  return <SessionPlayer minutes={5} eyebrow="Schnellwiederholung" title="Schnelle Runde" />;
}
