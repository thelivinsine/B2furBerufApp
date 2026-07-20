import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Target, Mic, PenLine, GraduationCap, ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { HubHero } from "@/components/shared/HubHero";
import { cn } from "@/lib/utils";

// The transfer layer: where the learner puts the reference material to use.
// Sprechsimulation, Schreibtraining and Prüfungsmodus were three separate nav
// destinations before Phase 5; grouping them under one hub gives them equal
// visual rank as "Anwenden" (apply), distinct from the Bibliothek (reference).
const CARDS: {
  to: string;
  icon: LucideIcon;
  gradient: string;
  title: string;
  desc: string;
  badge?: string;
}[] = [
  {
    to: "/simulation",
    icon: Mic,
    gradient: "from-cyan-500 to-sky-500",
    title: "Sprechen",
    desc: "Simuliere ein Gespräch mit verzweigten Dialogen, Hinweisen und Coaching-Feedback.",
  },
  {
    to: "/writing",
    icon: PenLine,
    gradient: "from-rose-500 to-red-500",
    title: "Schreiben",
    desc: "Schreibe zu einer Aufgabe und erhalte gezieltes Feedback zu deiner größten Schwachstelle.",
  },
  {
    to: "/exam",
    icon: GraduationCap,
    gradient: "from-fuchsia-500 to-pink-500",
    title: "Prüfung",
    desc: "Ein kompletter Prüfungsdurchlauf unter realistischen Bedingungen und mit Zeitdruck.",
  },
];

export function AnwendenHub() {
  return (
    <div className="space-y-5 sm:space-y-8">
      <HubHero
        icon={Target}
        gradient="from-orange-500 to-amber-500"
        eyebrow="Anwenden"
        title="Wissen anwenden"
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
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-soft",
                      card.gradient,
                    )}
                  >
                    <card.icon className="h-6 w-6" />
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
