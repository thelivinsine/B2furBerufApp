import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, ChevronRight, Play } from "lucide-react";
import {
  HUB_LEVELS,
  MOCK_PART_ORDER,
  PART_LABEL,
  PART_MINUTES,
  PASS_PCT,
  mockExamAvailability,
  type HubLevel,
  type MockExamLevel,
  type MockPartId,
} from "@/engine/exam";
import { useExamStore } from "@/store/useExamStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HubHero } from "@/components/shared/HubHero";
import { cn } from "@/lib/utils";
import { PART_META } from "./partMeta";
import { MockExamRunner } from "./MockExamRunner";

const TOTAL_MIN = MOCK_PART_ORDER.reduce((sum, p) => sum + PART_MINUTES[p], 0);

/**
 * Prüfungssimulation hub (full rework s186, founder pick: Option B start page
 * with a Niveau row on top). The Niveau selects which exam the four modules
 * and the full run serve; A2 stays visible but honestly empty until content
 * exists. Module cards start a single timed part; the slim card on top runs
 * the whole four-part exam.
 */
export function ExamHub() {
  const run = useExamStore((s) => s.run);
  const start = useExamStore((s) => s.start);
  const mockExams = useProgressStore((s) => s.mockExams);
  const settingsLevel = useSettingsStore((s) => s.level);
  const [level, setLevel] = useState<HubLevel>(() =>
    (HUB_LEVELS as readonly string[]).includes(settingsLevel) ? (settingsLevel as HubLevel) : "B2",
  );

  // A running (or just finished, un-dismissed) exam takes over the route, so
  // a reload lands back inside the simulation, never on the hub.
  if (run) return <MockExamRunner />;

  const avail = mockExamAvailability(level);
  const servable = level !== "A2";

  const lastFull = [...mockExams]
    .reverse()
    .find((m) => m.level === level && Object.keys(m.parts).length === MOCK_PART_ORDER.length);
  const lastPart = (part: MockPartId) =>
    [...mockExams].reverse().find((m) => m.level === level && m.parts[part] != null)?.parts[
      part
    ] ?? null;

  const partCount = (part: MockPartId) =>
    part === "lesen"
      ? avail.lesen
      : part === "hoeren"
        ? avail.hoeren
        : part === "schreiben"
          ? avail.schreiben
          : avail.sprechen;

  return (
    <div className="space-y-4 sm:space-y-6">
      <HubHero
        icon={GraduationCap}
        gradient="from-amber-500 to-orange-500"
        eyebrow="Prüfung"
        title="Prüfungssimulation"
      />

      {/* Niveau row (founder s186): which exam the whole page serves. */}
      <div>
        <p className="mb-2 ml-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Niveau
        </p>
        <div className="flex flex-wrap gap-2">
          {HUB_LEVELS.map((lv) => {
            const empty = lv === "A2";
            const active = level === lv;
            return (
              <button
                key={lv}
                type="button"
                onClick={() => setLevel(lv)}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border border-accent/20 bg-accent/20 text-accent-ink shadow-soft dark:bg-accent/10"
                    : "border border-border bg-surface text-foreground hover:bg-muted/60",
                  // Zero-yield greys out with its honest state, it never dead-ends:
                  // tapping A2 shows WHY it is empty instead of doing nothing.
                  empty && !active && "text-muted-foreground",
                )}
              >
                {lv}
              </button>
            );
          })}
        </div>
      </div>

      {/* The full exam, one slim card (Option B). */}
      <Card>
        <CardContent className="flex items-center gap-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Komplette Prüfung</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
              <span className="tabular-nums">4 Teile · {TOTAL_MIN} Min</span>
              {lastFull?.total != null && (
                <span className="tabular-nums">· zuletzt {lastFull.total} %</span>
              )}
            </p>
          </div>
          {lastFull?.total != null && lastFull.total >= PASS_PCT && (
            <Badge variant="success">Bestanden</Badge>
          )}
          {servable && avail.complete ? (
            <Button variant="gradient" size="sm" onClick={() => start(level as MockExamLevel)}>
              <Play className="h-4 w-4" /> Starten
            </Button>
          ) : (
            <span className="text-sm text-muted-foreground">Noch keine Inhalte</span>
          )}
        </CardContent>
      </Card>

      {/* The four modules (Option B), each startable on its own. */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {MOCK_PART_ORDER.map((part, i) => {
          const meta = PART_META[part];
          const Icon = meta.icon;
          const count = partCount(part);
          const canStart = servable && count > 0;
          const last = lastPart(part);
          return (
            <motion.div
              key={part}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.2) }}
            >
              <Card
                className={cn("h-full", canStart && "card-hover cursor-pointer")}
                onClick={canStart ? () => start(level as MockExamLevel, [part]) : undefined}
              >
                <CardContent className="flex h-full flex-col gap-2.5 p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                      meta.tile,
                      !canStart && "opacity-50",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", meta.ink)} />
                  </div>
                  <div className="flex-1">
                    <p className={cn("font-semibold", !canStart && "text-muted-foreground")}>
                      {PART_LABEL[part]}
                    </p>
                    {/* Content and length on ONE line: two stacked muted lines
                        cost a card row each and said one thing between them. */}
                    <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
                      {canStart
                        ? `${meta.desc} · ${PART_MINUTES[part]} Min`
                        : "Noch keine Inhalte"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    {last != null ? (
                      <Badge variant={last >= PASS_PCT ? "success" : "muted"} className="tabular-nums">
                        {last} %
                      </Badge>
                    ) : (
                      <span />
                    )}
                    {canStart && (
                      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-primary">
                        Starten <ChevronRight className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {!servable && (
        <p className="text-center text-sm text-muted-foreground">
          Für A2 gibt es noch keine Prüfungsinhalte. Wähle B1, B2 oder C1.
        </p>
      )}

    </div>
  );
}
