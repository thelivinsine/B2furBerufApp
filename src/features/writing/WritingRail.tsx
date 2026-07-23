import { Target, X } from "lucide-react";
import { themes } from "@/data/themes";
import { domains } from "@/data/domains";
import type { ThemeId } from "@/types";
import { cn } from "@/lib/utils";

/**
 * "Aufgabe wählen" rail for the guided Kurz/Lang writing tasks (Bibliothek-
 * extension redesign, s148). The exact FilterRail visual language: grey
 * bg-muted tile with a brand header row, uppercase eyebrow section labels and
 * white rounded facet pills (selected = solid primary). Themes are grouped by
 * the SAME Domain categorization the Bibliothek Thema dropdown uses
 * (Berufsleben / Alltag / Gesundheit / Bildung, from the domains registry).
 * Picking a theme draws a random Aufgabe from that theme's prompt pool.
 *
 * Desktop = a sticky right aside (`layout="rail"`, 16rem column). Mobile = the
 * same tile as a collapsible panel (`layout="panel"`) behind a toolbar button,
 * mirroring the Bibliothek mobile filter panel.
 */

interface WritingRailProps {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  layout?: "rail" | "panel";
  /** Close handler for the panel's X icon (mobile). */
  onClose?: () => void;
  className?: string;
}

// Domains that actually carry writing themes, in registry order (the same
// grouping `themeGroupsForMode` gives the Bibliothek Thema dropdown).
const GROUPS = domains
  .map((d) => ({ domain: d, list: themes.filter((t) => t.domain === d.id) }))
  .filter((g) => g.list.length > 0);

export function WritingRail({ value, onChange, layout = "rail", onClose, className }: WritingRailProps) {
  const panel = layout === "panel";

  const body = (
    <div className="space-y-5">
      {GROUPS.map((g) => (
        <section key={g.domain.id}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {g.domain.titleDe}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {g.list.map((t) => {
              const selected = t.id === value;
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange(t.id)}
                  className={cn(
                    // The FilterRail facet-pill recipe: roomier tap size on
                    // mobile (the panel), compact in the lg desktop rail.
                    "inline-flex items-center rounded-full border px-2.5 py-1 text-sm transition-colors lg:px-2 lg:py-0.5 lg:text-xs",
                    selected
                      ? "border-primary bg-primary font-semibold text-primary-foreground"
                      : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface/70",
                  )}
                >
                  {t.titleDe}
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );

  return (
    <aside
      role={panel ? "region" : undefined}
      aria-label="Aufgabe wählen"
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border border-border bg-muted shadow-soft",
        panel && "max-h-[45dvh]",
        className,
      )}
    >
      {/* Header row: brand label + (panel only) close icon. */}
      <div className="flex shrink-0 items-center gap-2 px-3 py-2.5">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary">
          <Target className="h-4 w-4" />
          Aufgabe wählen
        </span>
        {panel && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            title="Schließen"
            className="-mr-1 inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {/* Scroll region: only this scrolls, so the tile stays capped. */}
      <div className="slim-scrollbar min-h-0 flex-1 overflow-y-auto border-t border-border p-3">
        {body}
      </div>
    </aside>
  );
}
