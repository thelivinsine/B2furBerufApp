import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { levelFromXp, tierForLevel } from "@/engine/scoring";

export function StreakBadge({ count, className }: { count: number; className?: string }) {
  const active = count > 0;
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold",
        active ? "bg-warning/15 text-warning" : "bg-muted text-muted-foreground",
        className,
      )}
    >
      <Flame className={cn("h-4 w-4", active && "fill-warning/30")} />
      {count} {count === 1 ? "Tag" : "Tage"}
    </div>
  );
}

export function XPBar({ xp, className }: { xp: number; className?: string }) {
  const info = levelFromXp(xp);
  const tier = tierForLevel(info.level);
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold">
          Level {info.level} · <span className="text-muted-foreground">{tier.name}</span>
        </span>
        <span className="tabular-nums text-muted-foreground">
          {info.intoLevel}/{info.forLevel} XP
        </span>
      </div>
      <Progress value={info.progress * 100} />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface/40 px-6 py-12 sm:py-16 text-center"
    >
      <div className="rounded-full bg-muted p-2.5 sm:p-3 text-muted-foreground">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="font-semibold">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </motion.div>
  );
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-4 sm:mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="text-eyebrow mb-1 text-primary">
            {eyebrow}
          </p>
        )}
        <h1 className="text-display text-2xl sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
