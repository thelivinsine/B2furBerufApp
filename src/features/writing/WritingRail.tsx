import { iconByName } from "@/lib/icons";
import { themes } from "@/data/themes";
import { domains } from "@/data/domains";
import type { ThemeId } from "@/types";
import { cn } from "@/lib/utils";

/**
 * Thema picker rail for the guided Kurz/Lang writing tasks (Schreibtraining
 * redesign, s147). Same visual language as the Bibliothek FilterRail and the
 * Fokus GrammarRail (grey bg-muted tile, uppercase eyebrow section labels,
 * pill selection): the learner lands straight on an Aufgabe and switches the
 * topic here instead of going through a separate theme-picker page.
 *
 * Desktop = a sticky right aside with themes grouped by domain. Mobile = a
 * horizontal scrollable chip row (selected first), matching the Fokus chip row.
 */

interface WritingRailProps {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  layout?: "rail" | "chips";
  className?: string;
}

// Domains that actually carry writing themes, in registry order.
const GROUPS = domains
  .map((d) => ({ domain: d, list: themes.filter((t) => t.domain === d.id) }))
  .filter((g) => g.list.length > 0);

function ThemePill({
  id,
  label,
  icon,
  selected,
  onChange,
  compact,
}: {
  id: ThemeId;
  label: string;
  icon: string;
  selected: boolean;
  onChange: (id: ThemeId) => void;
  compact?: boolean;
}) {
  const Icon = iconByName(icon);
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onChange(id)}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-lg border font-semibold transition-colors",
        compact ? "px-2.5 py-1 text-xs" : "w-full px-3 py-1.5 text-left text-sm",
        selected
          ? "border-primary/35 bg-primary/12 text-primary"
          : "border-border bg-surface text-foreground hover:bg-muted/60",
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      <span className={cn(!compact && "truncate")}>{label}</span>
    </button>
  );
}

export function WritingRail({ value, onChange, layout = "rail", className }: WritingRailProps) {
  if (layout === "chips") {
    // Selected theme first so it is visible without scrolling.
    const ordered = [...themes].sort((a, b) =>
      a.id === value ? -1 : b.id === value ? 1 : 0,
    );
    return (
      <div
        className={cn("no-scrollbar flex items-center gap-2 overflow-x-auto py-1", className)}
        role="group"
        aria-label="Thema"
      >
        {ordered.map((t) => (
          <ThemePill
            key={t.id}
            id={t.id}
            label={t.titleDe}
            icon={t.icon}
            selected={t.id === value}
            onChange={onChange}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <aside
      className={cn(
        "rounded-xl border border-border bg-muted p-4 shadow-soft lg:sticky lg:top-20 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto slim-scrollbar",
        className,
      )}
    >
      <p className="mb-4 text-sm font-bold">Thema</p>
      <div className="space-y-4">
        {GROUPS.map((g) => (
          <div key={g.domain.id}>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
              {g.domain.titleDe}
            </p>
            <div className="space-y-1.5">
              {g.list.map((t) => (
                <ThemePill
                  key={t.id}
                  id={t.id}
                  label={t.titleDe}
                  icon={t.icon}
                  selected={t.id === value}
                  onChange={onChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
