import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, RotateCcw, Target, X } from "lucide-react";
import { themes, themeById } from "@/data/themes";
import { domains } from "@/data/domains";
import { writingPrompts, type WritingTask } from "@/data/writingPrompts";
import { SECTOR_OPTIONS } from "@/lib/facets";
import type { ThemeId, WorkSector } from "@/types";
import type { WritingLength } from "@/lib/writing";
import { cn } from "@/lib/utils";

/**
 * "Aufgabe wählen" rail for the guided Kurz/Lang writing tasks (Bibliothek-
 * extension redesign, s148/s149). The FilterRail scope language on a light
 * HIMMELBLAU tile: uppercase eyebrow section labels over Bibliothek-style
 * scope DROPDOWNS in the Bibliothek hierarchy order **Branche → Thema →
 * Unterthema** (s149 harmonization round). Prompts carry optional `sub` +
 * `sectors` tags: the Unterthema dropdown appears only for themes with
 * sub-themes, options grey out at zero yield (live counts per current
 * length), and Branche follows the untagged-=-universal rule (choosing a
 * Branche prefers its tagged tasks and never empties the pool). **Gesundheit
 * folds into Alltag** in the Thema grouping (founder rule).
 */

interface WritingRailProps {
  value: ThemeId;
  onChange: (id: ThemeId) => void;
  /** Selected sub-theme slug ("" = whole theme). */
  sub: string;
  onSubChange: (sub: string) => void;
  /** Selected Branche ("" = all). */
  sector: string;
  onSectorChange: (sector: string) => void;
  /** Current mode's length, for live option counts. */
  length: WritingLength;
  layout?: "rail" | "panel";
  /** Close handler for the panel's X icon (mobile). */
  onClose?: () => void;
  className?: string;
}

export const DEFAULT_WRITING_THEME: ThemeId = themes[0].id;

// Domain-grouped themes, with the gesundheit domain folded into Alltag
// (founder rule): the writing dropdown shows Berufsleben / Alltag / Bildung.
const DOMAIN_FOLD: Record<string, string> = { gesundheit: "alltag" };
const GROUPS = domains
  .map((d) => ({
    domain: d,
    list: themes.filter((t) => (DOMAIN_FOLD[t.domain ?? ""] ?? t.domain) === d.id),
  }))
  .filter((g) => g.list.length > 0);

interface Option {
  value: string;
  label: string;
  count?: number;
  disabled?: boolean;
}

/** Single-select scope dropdown in the Bibliothek language (grouped listbox
 *  popover, outside-click/Escape close, zero-yield options greyed). */
function ScopeSelect({
  ariaLabel,
  triggerLabel,
  groups,
  value,
  onChange,
}: {
  ariaLabel: string;
  triggerLabel: string;
  /** Ordered option groups; a group with an empty label renders headerless. */
  groups: { label: string; options: Option[] }[];
  value: string;
  onChange: (value: string) => void;
}) {
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

  const row = (opt: Option) => {
    const selected = opt.value === value;
    return (
      <button
        key={opt.value || "__all"}
        type="button"
        role="option"
        aria-selected={selected}
        disabled={opt.disabled && !selected}
        onClick={() => {
          if (opt.disabled && !selected) return;
          onChange(opt.value);
          setOpen(false);
        }}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
          selected
            ? "bg-primary/10 font-medium text-primary"
            : opt.disabled
              ? "cursor-not-allowed text-muted-foreground/40"
              : "hover:bg-muted/60",
        )}
      >
        <span className="min-w-0 flex-1 truncate">{opt.label}</span>
        {opt.count != null && !opt.disabled && (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              selected ? "text-primary/70" : "text-muted-foreground",
            )}
          >
            {opt.count}
          </span>
        )}
        {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
      </button>
    );
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-left text-sm transition-colors hover:border-primary/40 lg:px-2.5 lg:py-1.5 lg:text-xs"
      >
        <span className="min-w-0 flex-1 truncate font-medium">{triggerLabel}</span>
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
          aria-label={ariaLabel}
          className="slim-scrollbar absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-lg border border-border bg-surface p-1.5 shadow-elevated-soft"
        >
          {groups.map((g, gi) => (
            <div key={g.label || gi}>
              {g.label && (
                <p className="mt-1.5 px-2.5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {g.label}
                </p>
              )}
              {g.options.map(row)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Tasks of one theme + length matching a sub-theme filter ("" = all). */
function tasksForSub(theme: ThemeId, length: WritingLength, sub: string): WritingTask[] {
  const pool = writingPrompts[theme][length];
  return sub ? pool.filter((t) => t.sub === sub) : pool;
}

export function WritingRail({
  value,
  onChange,
  sub,
  onSubChange,
  sector,
  onSectorChange,
  length,
  layout = "rail",
  onClose,
  className,
}: WritingRailProps) {
  const panel = layout === "panel";
  const theme = themeById(value);
  const subThemes = theme?.subThemes ?? [];
  const canReset = value !== DEFAULT_WRITING_THEME || !!sub || !!sector;

  // Branche counts respect the current Thema/Unterthema scope; zero-yield
  // Branchen grey out (their tag exists nowhere in this pool, so choosing
  // them would change nothing).
  const scopedTasks = tasksForSub(value, length, sub);
  const sectorCount = (s: string) =>
    scopedTasks.filter((t) => t.sectors?.includes(s as WorkSector)).length;

  const sectionLabel = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  const body = (
    <div className="space-y-4">
      {/* Bibliothek hierarchy order: Branche -> Thema -> Unterthema. */}
      <section>
        <p className={cn("mb-2", sectionLabel)}>Branche</p>
        <ScopeSelect
          ariaLabel="Branche"
          triggerLabel={
            sector ? SECTOR_OPTIONS.find((o) => o.value === sector)?.label ?? sector : "Alle Branchen"
          }
          value={sector}
          onChange={onSectorChange}
          groups={[
            { label: "", options: [{ value: "", label: "Alle Branchen" }] },
            {
              label: "",
              options: SECTOR_OPTIONS.map((o) => {
                const count = sectorCount(o.value);
                return { value: o.value, label: o.label, count, disabled: count === 0 };
              }),
            },
          ]}
        />
      </section>

      <section>
        <p className={cn("mb-2", sectionLabel)}>Thema</p>
        <ScopeSelect
          ariaLabel="Thema"
          triggerLabel={theme?.titleDe ?? value}
          value={value}
          onChange={(id) => onChange(id as ThemeId)}
          groups={GROUPS.map((g) => ({
            label: g.domain.titleDe,
            options: g.list.map((t) => ({ value: t.id, label: t.titleDe })),
          }))}
        />
      </section>

      {subThemes.length > 0 && (
        <section>
          <p className={cn("mb-2", sectionLabel)}>Unterthema</p>
          <ScopeSelect
            ariaLabel="Unterthema"
            triggerLabel={
              sub ? subThemes.find((s) => s.id === sub)?.titleDe ?? sub : "Gesamtes Thema"
            }
            value={sub}
            onChange={onSubChange}
            groups={[
              {
                label: "",
                options: [
                  {
                    value: "",
                    label: "Gesamtes Thema",
                    count: writingPrompts[value][length].length,
                  },
                  ...subThemes.map((s) => {
                    const count = tasksForSub(value, length, s.id).length;
                    return { value: s.id, label: s.titleDe, count, disabled: count === 0 };
                  }),
                ],
              },
            ]}
          />
        </section>
      )}
    </div>
  );

  return (
    <aside
      role={panel ? "region" : undefined}
      aria-label="Aufgabe wählen"
      // Himmelblau tile (founder s149): a light accent wash instead of the grey
      // bg-muted; dark mode gets its own quieter alphas so the wash reads as a
      // cool sky tint, not murky teal. No overflow clipping on the tile: the
      // dropdown popovers must escape it (their lists scroll internally).
      className={cn(
        "rounded-xl border border-accent/50 bg-accent/20 shadow-soft dark:border-accent/25 dark:bg-accent/10",
        className,
      )}
    >
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary">
          <Target className="h-4 w-4" />
          Aufgabe wählen
        </span>
        <button
          type="button"
          onClick={() => {
            onSectorChange("");
            onSubChange("");
            onChange(DEFAULT_WRITING_THEME);
          }}
          disabled={!canReset}
          aria-label="Auswahl zurücksetzen"
          title="Auswahl zurücksetzen"
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
      <div className="border-t border-accent/50 p-3 dark:border-accent/25">{body}</div>
    </aside>
  );
}
