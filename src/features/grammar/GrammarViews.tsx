import { memo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { GrammarTopic } from "@/types";
import { iconByName } from "@/lib/icons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { groupMeta, topicRank } from "./grammarMeta";

/**
 * Karten + Liste presentations of the Grammatik tab (Bibliothek redesign,
 * session 93). Both are lenses over the same filtered topic list; tapping a
 * topic opens the lesson view (`?topic=`). Emerald is the quiet Grammatik
 * accent (carried over from the pre-redesign hub icons); brand indigo stays
 * the loud action color.
 */

/** The emerald icon tile shared by cards, rows and the lesson hero. */
export function GroupIconTile({
  icon,
  className = "h-9 w-9 rounded-xl",
  iconClassName = "h-4 w-4",
}: {
  icon: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = iconByName(icon);
  return (
    <span
      className={`flex shrink-0 items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ${className}`}
    >
      <Icon className={iconClassName} />
    </span>
  );
}

const TopicCard = memo(function TopicCard({
  topic,
  index,
  onOpen,
}: {
  topic: GrammarTopic;
  index: number;
  onOpen: (id: string) => void;
}) {
  const reduce = useReducedMotion();
  const meta = groupMeta[topic.group];
  const showGroupTag = meta.labelDe !== topic.titleDe;
  // Show ONE clean pattern on the card face, not the full " · "-joined list
  // (which truncated mid-expression to unreadable fragments like "A · B…",
  // founder s104). The lesson's Muster panel shows every variant.
  const firstPattern = topic.pattern.split(" · ")[0].trim();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.2) }}
      className="h-full"
    >
      <button onClick={() => onOpen(topic.id)} className="group h-full w-full text-left">
        <Card className="card-hover flex h-full flex-col">
          <CardContent className="flex flex-1 flex-col p-4">
            <div className="flex items-start justify-between gap-2">
              <GroupIconTile icon={meta.icon} className="h-10 w-10 rounded-xl" iconClassName="h-5 w-5" />
              <span className="flex items-center gap-1.5">
                {/* Rank on the B2-marker priority spine: the recommended order
                    for a learner who does not want to decide where to start. */}
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">
                  {topicRank.get(topic.id)}
                </span>
                {topic.cefr && <Badge variant="muted">{topic.cefr}</Badge>}
              </span>
            </div>

            <p className="mt-3 font-semibold leading-snug">{topic.titleDe}</p>
            {showGroupTag && (
              <p className="mt-0.5 text-xs font-medium text-muted-foreground">{meta.labelDe}</p>
            )}
            <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{topic.purposeDe}</p>

            <div className="mt-auto space-y-2.5 pt-3">
              {/* One representative pattern in the emerald Muster language (echoes
                  the lesson panel), so the card reads as a grammar form at a
                  glance instead of a cut-off mono fragment. */}
              <p className="truncate rounded-lg bg-emerald-500/[0.07] px-2.5 py-1.5 font-mono text-xs text-emerald-700 dark:text-emerald-300">
                {firstPattern}
              </p>
              <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
                <span className="text-xs text-muted-foreground">
                  {topic.drills.length} Übung{topic.drills.length !== 1 ? "en" : ""}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Lernen <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </button>
    </motion.div>
  );
});

export function GrammarTopicCards({
  items,
  onOpen,
}: {
  items: GrammarTopic[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((t, i) => (
        <TopicCard key={t.id} topic={t} index={i} onOpen={onOpen} />
      ))}
    </div>
  );
}

const CompactRow = memo(function CompactRow({
  topic,
  onOpen,
}: {
  topic: GrammarTopic;
  onOpen: (id: string) => void;
}) {
  const meta = groupMeta[topic.group];
  return (
    <li>
      <button
        onClick={() => onOpen(topic.id)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/40"
      >
        <span className="w-4 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground/70">
          {topicRank.get(topic.id)}
        </span>
        <GroupIconTile icon={meta.icon} className="h-8 w-8 rounded-lg" />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{topic.titleDe}</span>
          <span className="block truncate text-xs text-muted-foreground">{topic.purposeDe}</span>
        </span>
        {topic.cefr && (
          <Badge variant="muted" className="shrink-0">
            {topic.cefr}
          </Badge>
        )}
        <Badge variant="muted" className="hidden shrink-0 sm:inline-flex">
          {topic.drills.length} Übg.
        </Badge>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    </li>
  );
});

export function GrammarCompactList({
  items,
  onOpen,
}: {
  items: GrammarTopic[];
  onOpen: (id: string) => void;
}) {
  return (
    <ul className="divide-y divide-border/60 rounded-xl border border-border bg-surface">
      {items.map((t) => (
        <CompactRow key={t.id} topic={t} onOpen={onOpen} />
      ))}
    </ul>
  );
}
