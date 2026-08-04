import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HubHero } from "@/components/shared/HubHero";
import { RouteIcon } from "@/components/layout/route-icons";
import { cn } from "@/lib/utils";

// The transfer layer: where the learner puts the reference material to use.
// Renamed from "Anwenden" to **Prüfung** in s182 (founder), when Schreiben
// moved back in from its own tab: the zone is the three exam skills, so the
// name says what it prepares for. The third card is "Modelltest" (renamed with
// the page itself, founder s188), not "Prüfung", because a card cannot carry the
// same name as the page it sits on.
// Sprechen · Schreiben · Modelltest share one visual rank here, which
// is the whole point of the hub: they are the productive half of the app,
// distinct from the Bibliothek (reference).
// Each card wears its route's own branded mark from `route-icons.tsx` on a tile
// tinted in that mark's colour (founder pick 2, session 183), so the Schreiben
// card carries the same pencil the nav does and the three cards stay apart at a
// glance. The white-on-gradient tiles this replaced turned every mark into the
// same white silhouette.
const CARDS: {
  to: string;
  tint: string;
  title: string;
  desc: string;
  badge?: string;
}[] = [
  {
    to: "/simulation",
    tint: "bg-cyan-500/10 dark:bg-cyan-400/15",
    title: "Sprechen",
    desc: "Simuliere ein Gespräch mit verzweigten Dialogen, Hinweisen und Coaching-Feedback.",
  },
  {
    to: "/writing",
    tint: "bg-primary/10 dark:bg-primary/15",
    title: "Schreiben",
    desc: "Schreibe zu einer Aufgabe und erhalte gezieltes Feedback zu deiner größten Schwachstelle.",
  },
  {
    to: "/exam",
    tint: "bg-orange-500/10 dark:bg-orange-400/15",
    title: "Modelltest",
    desc: "Ein kompletter Prüfungsdurchlauf unter realistischen Bedingungen und mit Zeitdruck.",
  },
];

export function AnwendenHub() {
  return (
    <div className="space-y-5 sm:space-y-8">
      <HubHero
        icon={Target}
        gradient="from-orange-500 to-amber-500"
        eyebrow="Prüfung"
        title="Prüfung vorbereiten"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.to}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.06, 0.2) }}
          >
            <Link to={card.to} className="block h-full">
              <Card className="card-hover h-full cursor-pointer">
                <CardContent className="flex h-full flex-col gap-3 p-5">
                  <div
                    className={cn(
                      // rounded-xl, not 2xl: `--radius + 10` is 24px, exactly
                      // half of a 48px tile, so the old gradient tiles were
                      // full circles. Squircle is the house shape for icon
                      // tiles (Sprechen and Prüfungssimulation use it too).
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
                      card.tint,
                    )}
                  >
                    <RouteIcon path={card.to} size={27} />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold leading-snug">
                      {card.title}
                      {card.badge && (
                        <span className="ml-2 inline-block rounded-lg bg-amber-100 px-1.5 py-0.5 align-middle text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                          {card.badge}
                        </span>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{card.desc}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Starten <ChevronRight className="h-4 w-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
