import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RotateCcw, Target, X } from "lucide-react";
import { themes } from "@/data/themes";
import { domains } from "@/data/domains";
import type { ThemeId } from "@/types";
import { cn } from "@/lib/utils";

/**
 * "Aufgabe wählen" rail for the guided Kurz/Lang writing tasks (Bibliothek-
 * extension redesign, s148/s149). The FilterRail scope language: an uppercase
 * eyebrow section label ("Thema") over a DROPDOWN (the Bibliothek scope-
 * dropdown pattern, not pills; founder s149), options grouped by the same
 * Domain categorization as the Bibliothek Thema dropdown. **Gesundheit folds
 * into Alltag** (founder rule, s149): writing themes only carry the Thema
 * grain (no Branche/Unterthema on prompts), so the dropdown is the honest
 * subset of the Branche→Thema→Unterthema hierarchy.
 *
 * The tile itself is a light HIMMELBLAU wash (`bg-accent/20`, founder s149),
 * not the grey `bg-muted`, with a reset icon in the header (back to the
 * default theme). Desktop = a sticky right aside (`layout="rail"`, 16rem
 * column). Mobile = the same tile as a collapsible panel (`layout="panel"`)
 * behind a toolbar button. The dropdown list scrolls internally (max-h) so
 * the rail never grows past its tile.
 */

interface WritingRailProps {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  layout?: "rail" | "panel";
  /** Close handler for the panel's X icon (mobile). */
  onClose?: () => void;
  className?: string;
}

export const DEFAULT_WRITING_THEME: ThemeId = themes[0].id;

// Domain-grouped themes, with the gesundheit domain folded into Alltag
// (founder rule): the writing dropdown shows Berufsleben / Alltag /
// Bildung, matching how learners think about errands vs work.
const DOMAIN_FOLD: Record<string, string> = { gesundheit: "alltag" };
const GROUPS = domains
  .map((d) => ({
    domain: d,
    list: themes.filter((t) => (DOMAIN_FOLD[t.domain ?? ""] ?? t.domain) === d.id),
  }))
  .filter((g) => g.list.length > 0);

/** Single-select theme dropdown in the Bibliothek scope-dropdown language
 *  (grouped listbox popover, outside-click/Escape close). */
function ThemeSelect({ value, onChange }: { value: ThemeId; onChange: (id: ThemeId) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = themes.find((t) => t.id === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Thema"
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 lg:px-2.5 lg:py-1.5 lg:text-xs"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{current?.titleDe ?? value}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          role="listbox"
          aria-label="Thema"
          className="slim-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
        >
          {GROUPS.map((g) => (
            <div key={g.domain.id}>
              <p className="mt-1.5 px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {g.domain.titleDe}
              </p>
              {g.list.map((t) => {
                const selected = t.id === value;
                return (
                  <button
                    key={t.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(t.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      selected ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted/60",
                    )}
                  >
                    <span className="min-w-0 flex-1 truncate">{t.titleDe}</span>
                    {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function WritingRail({ value, onChange, layout = "rail", onClose, className }: WritingRailProps) {
  const panel = layout === "panel";
  const canReset = value !== DEFAULT_WRITING_THEME;

  return (
    <aside
      role={panel ? "region" : undefined}
      aria-label="Aufgabe wählen"
      // Himmelblau tile (founder s149): a light accent wash instead of the grey
      // bg-muted, with matching soft accent separators. No overflow clipping on
      // the tile itself: the dropdown popover must escape it, and the list
      // scrolls internally instead.
      className={cn("rounded-xl border border-accent/50 bg-accent/20 shadow-soft", className)}
    >
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary">
          <Target className="h-4 w-4" />
          Aufgabe wählen
        </span>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_WRITING_THEME)}
          disabled={!canReset}
          aria-label="Thema zurücksetzen"
          title="Thema zurücksetzen"
          className={cn(
            "inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            canReset
              ? "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
              : "cursor-not-allowed text-muted-foreground/30",
          )}
        >
          <RotateCcw className="h-4 w-4" />
        </button>
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
      <div className="border-t border-accent/50 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Thema
        </p>
        <ThemeSelect value={value} onChange={onChange} />
      </div>
    </aside>
  );
}
