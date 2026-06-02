import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Section-hub header with a section-colored icon tile, giving each hub a
 * distinct identity (Quiz/Writing/Simulation/Exam otherwise looked identical).
 * `gradient` is a Tailwind gradient pair, e.g. "from-violet-500 to-indigo-500".
 */
export function HubHero({
  icon: Icon,
  gradient,
  eyebrow,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  gradient: string;
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br p-3 text-white shadow-soft",
            gradient,
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}
