import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, type LucideIcon } from "lucide-react";
import type { MockPartId } from "@/engine/exam";
import { PART_META } from "@/features/exam/partMeta";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * ONE card for every Ohne-Zeit chooser (s201).
 *
 * Lesen, Hören and Sprechen listed the same kind of thing (an Aufgabe you can
 * start) in three different shapes: two of them put the Niveau in the foot row
 * and one put it in the head, one card was a real `<button>` and one was a
 * `<div onClick>` that a keyboard could not reach, the Sprechen card carried a
 * "Starten" button INSIDE its own click target (a nested control), and the two
 * lists animated in on different timings. The founder asked for one finished
 * product, so the anatomy is fixed here and the modules only pass content:
 *
 *   head  – module mark, title, one grey line of context, chevron
 *   body  – the task line, where the module has one (Sprechen)
 *   foot  – Niveau first, then the facts, then the state chip, on the bottom
 *           edge (`mt-auto`), so neighbouring cards line their foot rows up
 *           whatever their body length
 */
export interface ChooserFact {
  icon: LucideIcon;
  label: string;
}

export function ChooserCard({
  part,
  index,
  title,
  subtitle,
  description,
  level,
  facts = [],
  status,
  highlight,
  onClick,
}: {
  part: MockPartId;
  /** Position in the list; drives the stagger only. */
  index: number;
  title: string;
  /** One grey line under the title (Textsorte · Thema). */
  subtitle?: string;
  /** The task itself, clamped to two lines (Sprechen). */
  description?: string;
  /** CEFR band, first thing in the foot row. */
  level?: string;
  facts?: ChooserFact[];
  /** "Empfohlen" / "Erledigt", right end of the foot row. */
  status?: { label: string; tone: "accent" | "success" };
  /** The one recommended card. A quiet ring, never `shadow-glow` (landmine). */
  highlight?: boolean;
  onClick: () => void;
}) {
  const reduce = useReducedMotion();
  const meta = PART_META[part];
  const Mark = meta.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      // One timing family across every chooser: 0.16s, stagger capped so the
      // last card of a 30-item list is not a third of a second late.
      transition={{ delay: reduce ? 0 : Math.min(index * 0.03, 0.18), duration: reduce ? 0 : 0.16 }}
      className={cn(
        "card-hover flex h-full flex-col items-start gap-2.5 rounded-xl border border-border bg-surface p-4 text-left shadow-soft",
        highlight && "ring-1 ring-primary/30",
      )}
    >
      <span className="flex w-full items-start gap-2.5">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            meta.tile,
          )}
        >
          <Mark className={cn("h-[1.0625rem] w-[1.0625rem]", meta.ink)} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold leading-snug">{title}</span>
          {subtitle && (
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">{subtitle}</span>
          )}
        </span>
        <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
      </span>

      {description && (
        <span className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
          {description}
        </span>
      )}

      <span className="mt-auto flex w-full flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-2.5 text-xs text-muted-foreground">
        {level && (
          <Badge variant="outline" className="tabular-nums">
            {level}
          </Badge>
        )}
        {facts.map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1 tabular-nums">
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
        ))}
        {status && (
          <Badge variant={status.tone} className="ml-auto">
            {status.label}
          </Badge>
        )}
      </span>
    </motion.button>
  );
}

/** The one grid every chooser lists its cards in. */
export function ChooserGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">{children}</div>;
}
