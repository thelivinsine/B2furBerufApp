import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, RotateCcw, Target, X } from "lucide-react";
import { themes, themeById } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import { matchesLifeArea, themeGroupsByArea, type LifeAreaId } from "@/lib/lifeAreas";
import { LifeAreaPills } from "@/features/shared/LifeAreaPills";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { countTasks } from "@/lib/writingScope";
import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";
import { cn } from "@/lib/utils";

/**
 * "Aufgabe wählen" rail for the guided Kurz/Lang writing tasks (Bibliothek-
 * extension redesign, s148/s149). The FilterRail scope language on a light
 * HIMMELBLAU tile: uppercase eyebrow section labels over Bibliothek-style
 * scope DROPDOWNS in the Bibliothek hierarchy order **Branche → Lebensbereich →
 * Thema → Unterthema** (s149 harmonization round; the Lebensbereich pills are
 * the s184 addition, the one control shared with the Bibliothek rails). Prompts
 * carry optional `sub` +
 * `sectors` tags: the Unterthema dropdown appears only for themes with
 * sub-themes, options grey out at zero yield (live counts per current
 * length), and Branche follows the untagged-=-universal rule (choosing a
 * Branche prefers its tagged tasks and never empties the pool). **Gesundheit
 * folds into Alltag** in the Thema grouping (founder rule).
 */

/**
 * Niveau options: the three levels the Schreiben module targets (founder s167).
 * The VALUE is the coarse band, not one half of it: `ContentCefr` splits B1 and
 * B2 in two, and matching a scope of "B2.1" exactly meant an option labelled
 * "B2" quietly excluded every B2.2 task (none today, invisible breakage the day
 * content adds one). `writingScope.levelBand` does the matching, and the C1
 * label is "C1", not the old "C1.1", which named a band `lib/cefr.ts` does not
 * have.
 */
export const WRITING_LEVELS: { value: string; label: string }[] = [
  { value: "B1", label: "B1" },
  { value: "B2", label: "B2" },
  { value: "C1", label: "C1" },
];

/** Textsorte options, grouped by family so a 16-value list stays scannable. */
const ALL_FORMAT_GROUPS: { label: string; options: { value: string; label: string }[] }[] = [
  {
    label: "E-Mail & Nachricht",
    options: [
      { value: "email_informell", label: "E-Mail (privat)" },
      { value: "email_halbformell", label: "E-Mail (halbformell)" },
      { value: "email_formell", label: "E-Mail (formell)" },
      { value: "nachricht", label: "Kurznachricht" },
      { value: "notiz", label: "Notiz" },
      { value: "uebergabe", label: "Übergabe" },
    ],
  },
  {
    label: "Meinung & Öffentlichkeit",
    options: [
      { value: "forumsbeitrag", label: "Forumsbeitrag" },
      { value: "stellungnahme", label: "Stellungnahme" },
    ],
  },
  {
    label: "Bericht",
    options: [
      { value: "bericht", label: "Bericht" },
      { value: "protokoll", label: "Protokoll" },
    ],
  },
  {
    label: "Beschwerde & Antrag",
    options: [
      { value: "beschwerde", label: "Beschwerde" },
      { value: "reklamation", label: "Reklamation" },
      { value: "antrag", label: "Antrag" },
      { value: "widerspruch", label: "Widerspruch" },
      { value: "kuendigung", label: "Kündigung" },
      { value: "bewerbung", label: "Bewerbung" },
    ],
  },
];

/**
 * Only the Textsorten the bank can actually serve. A zero-yield option greys
 * out with an honest count where the zero depends on the scope ("Forumsbeitrag"
 * under Kurz says: exists, just not here), but a Textsorte with no task at ANY
 * length is dead chrome, and `bewerbung` had been sitting in the list at 0
 * since s167. Derived, so it reappears by itself the day a Bewerbung task ships.
 */
const FORMATS_IN_BANK = new Set(
  themes.flatMap((t) =>
    (["short", "long"] as const).flatMap((len) =>
      (writingPrompts[t.id]?.[len] ?? []).map((task) => task.format).filter(Boolean),
    ),
  ) as string[],
);

const FORMAT_GROUPS = ALL_FORMAT_GROUPS.map((g) => ({
  ...g,
  options: g.options.filter((o) => FORMATS_IN_BANK.has(o.value)),
})).filter((g) => g.options.length > 0);

const FORMAT_LABEL: Record<string, string> = Object.fromEntries(
  ALL_FORMAT_GROUPS.flatMap((g) => g.options).map((o) => [o.value, o.label]),
);

/** Valid Textsorte values, for URL-param validation in the trainer. */
export const WRITING_FORMATS: string[] = FORMAT_GROUPS.flatMap((g) => g.options).map(
  (o) => o.value,
);

/** Learner-facing Textsorte label, e.g. for the Aufgabe card. */
export const writingFormatLabel = (format: string): string => FORMAT_LABEL[format] ?? format;

interface WritingRailProps {
  /** Selected Thema ("" = all Themen). */
  value: ThemeId | "";
  onChange: (id: ThemeId | "") => void;
  /** Selected Niveau ("" = alle Niveaus). */
  level: string;
  onLevelChange: (level: string) => void;
  /** Selected Textsorte ("" = alle Textsorten). */
  format: string;
  onFormatChange: (format: string) => void;
  /** Selected sub-theme slug ("" = whole theme). */
  sub: string;
  onSubChange: (sub: string) => void;
  /** Selected Branche ("" = all). */
  sector: string;
  onSectorChange: (sector: string) => void;
  /** Selected Lebensbereich ("" = beides). Sits directly below Branche (s184). */
  lifeArea: LifeAreaId | "";
  onLifeAreaChange: (area: LifeAreaId | "") => void;
  /** Current mode's length, for live option counts. */
  length: WritingLength;
  /** Full reset (always active): clears every scope AND draws a fresh task. */
  onReset: () => void;
  layout?: "rail" | "panel";
  /** Close handler for the panel's X icon (mobile). */
  onClose?: () => void;
  className?: string;
}

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
  const reduce = useReducedMotion();

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
        {/* The count stays on a greyed option (founder rule: zero-yield options
            grey out with HONEST counts). Hiding it made "unavailable" and
            "nothing here for your other filters" look identical. */}
        {opt.count != null && (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              selected
                ? "text-primary/70"
                : opt.disabled
                  ? "text-muted-foreground/40"
                  : "text-muted-foreground",
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
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            aria-label={ariaLabel}
            // Micro-motion pass (s149 P2): one quick fade/slide for every
            // popover, matching the panel timing family.
            initial={reduce ? false : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: reduce ? 0 : 0.12, ease: "easeOut" }}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function WritingRail({
  value,
  onChange,
  level,
  onLevelChange,
  format,
  onFormatChange,
  sub,
  onSubChange,
  sector,
  onSectorChange,
  lifeArea,
  onLifeAreaChange,
  length,
  onReset,
  layout = "rail",
  onClose,
  className,
}: WritingRailProps) {
  const panel = layout === "panel";
  const theme = themeById(value);
  const subThemes = theme?.subThemes ?? [];

  // ONE counting rule for every dropdown (s167): the number next to an option
  // is how many tasks picking it would actually draw from, computed by the same
  // `eligibleTasks` selector the trainer draws with. Before this, Branche
  // counted only sector-TAGGED tasks and greyed out at zero, which contradicted
  // the untagged-=-universal rule and made most Branchen look unavailable while
  // the engine would have served the full pool behind them.
  //
  // Since the Textsorte fix (2026-07-31) that really is ONE rule: Niveau and
  // Textsorte filter hard, so their honest counts no longer need a second
  // counting function, and the four scope-dependent axes all grey out at zero
  // instead of only two of them. Only the generic "Alle ..." option is never
  // disabled: it is the way back out of a scope that yields nothing.
  const countWith = (
    over: Partial<{
      area: LifeAreaId | "";
      theme: ThemeId | "";
      sub: string;
      sector: string;
      level: string;
      format: string;
    }>,
  ) => countTasks({ area: lifeArea, theme: value, sub, sector, level, format, length, ...over });

  const sectionLabel = "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  const body = (
    <div className="space-y-4">
      {/* Niveau -> Branche -> Lebensbereich -> Thema -> Unterthema -> Textsorte
          (s167, Lebensbereich added s184): the Bibliothek hierarchy with the
          level axis in front (it is the coarsest scope) and Textsorte last (it
          narrows within everything else). */}
      <section>
        <p className={cn("mb-2", sectionLabel)}>Niveau</p>
        <ScopeSelect
          ariaLabel="Niveau"
          triggerLabel={
            level ? WRITING_LEVELS.find((l) => l.value === level)?.label ?? level : "Alle Niveaus"
          }
          value={level}
          onChange={onLevelChange}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Niveaus", count: countWith({ level: "" }) },
                ...WRITING_LEVELS.map((l) => {
                  const count = countWith({ level: l.value });
                  return { value: l.value, label: l.label, count, disabled: count === 0 };
                }),
              ],
            },
          ]}
        />
      </section>

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
            {
              label: "",
              options: [
                { value: "", label: "Alle Branchen", count: countWith({ sector: "" }) },
                // Branche is the soft axis, so its count is zero only when the
                // Niveau/Textsorte above already left nothing: it cannot empty
                // a pool by itself, and it still never disables on its own.
                ...SECTOR_OPTIONS.map((o) => {
                  const count = countWith({ sector: o.value });
                  return { value: o.value, label: o.label, count, disabled: count === 0 };
                }),
              ],
            },
          ]}
        />
      </section>

      {/* Lebensbereich, directly below Branche and above Thema (founder s184).
          The same `LifeAreaPills` the Bibliothek rails render, so the control
          the learner meets here is the one they already know from there. The
          counts ignore the Thema/Unterthema below (the pills supersede those),
          so switching areas is never blocked by a Thema from the other one. */}
      <section>
        <p className={cn("mb-2", sectionLabel)}>Lebensbereich</p>
        <LifeAreaPills
          value={lifeArea}
          onChange={onLifeAreaChange}
          counts={{
            professional: countWith({ area: "professional", theme: "", sub: "" }),
            personal: countWith({ area: "personal", theme: "", sub: "" }),
          }}
        />
      </section>

      <section>
        <p className={cn("mb-2", sectionLabel)}>Thema</p>
        <ScopeSelect
          ariaLabel="Thema"
          triggerLabel={value ? theme?.titleDe ?? value : "Alle Themen"}
          value={value}
          onChange={(id) => onChange(id as ThemeId | "")}
          groups={[
            // Generic option on every dropdown (founder s167).
            {
              label: "",
              options: [
                { value: "", label: "Alle Themen", count: countWith({ theme: "", sub: "" }) },
              ],
            },
            // TWO groups, never more: Berufsleben and Alltag, from the one
            // app-wide fold. This rail used to fold only `gesundheit`, so
            // "Bildung & Sprache" sat here as a third heading (founder,
            // 2026-07-31: "some topics in the themen dropdown which are
            // non-beruf but are not part of alltag").
            // With a Lebensbereich pill active the dropdown narrows to that
            // area's Themen: the one heading left is the pill the learner just
            // chose, never a second group whose every option reads 0.
            ...themeGroupsByArea((id) => countWith({ theme: id as ThemeId, sub: "" }), {
              include: (id) => matchesLifeArea(id, lifeArea) || id === value,
              disableZero: true,
            }),
          ]}
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
                  { value: "", label: "Gesamtes Thema", count: countWith({ sub: "" }) },
                  ...subThemes.map((s) => {
                    const count = countWith({ sub: s.id });
                    return { value: s.id, label: s.titleDe, count, disabled: count === 0 };
                  }),
                ],
              },
            ]}
          />
        </section>
      )}

      <section>
        <p className={cn("mb-2", sectionLabel)}>Textsorte</p>
        <ScopeSelect
          ariaLabel="Textsorte"
          triggerLabel={format ? FORMAT_LABEL[format] ?? format : "Alle Textsorten"}
          value={format}
          onChange={onFormatChange}
          groups={[
            {
              label: "",
              options: [
                { value: "", label: "Alle Textsorten", count: countWith({ format: "" }) },
              ],
            },
            ...FORMAT_GROUPS.map((g) => ({
              label: g.label,
              options: g.options.map((o) => {
                const count = countWith({ format: o.value });
                return { value: o.value, label: o.label, count, disabled: count === 0 };
              }),
            })),
          ]}
        />
      </section>
    </div>
  );

  return (
    <aside
      role={panel ? "region" : undefined}
      aria-label="Aufgabe wählen"
      // Himmelblau FILL (founder s149): a light accent wash instead of the grey
      // bg-muted; dark mode gets its own quieter alpha so the wash reads as a
      // cool sky tint, not murky teal. NO visible outline (founder s169): the
      // border carries the fill's own colour and the tile is separated from the
      // page by `shadow-soft` alone, the same lift the Bibliothek word cards
      // use. A grey edge around a blue wash read as dirty. No overflow clipping
      // on the tile: the dropdown popovers must escape it (their lists scroll
      // internally).
      className={cn(
        "rounded-xl border border-accent/20 bg-accent/20 shadow-soft dark:border-accent/10 dark:bg-accent/10",
        className,
      )}
    >
      <div className="flex items-center gap-1 px-3 py-2.5">
        <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-primary">
          <Target className="h-4 w-4" />
          Aufgabe wählen
        </span>
        {/* Always active (founder s149 P2): clears every scope AND draws a
            fresh random Aufgabe, so the button always visibly does something. */}
        <button
          type="button"
          onClick={onReset}
          aria-label="Zurücksetzen und neue Aufgabe ziehen"
          title="Zurücksetzen und neue Aufgabe"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
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
      {/* Divider tinted to the tile, not the neutral `border` grey: with the
          outline gone a grey rule would be the only hard edge left (s169). */}
      <div className="border-t border-accent-ink/10 p-3">{body}</div>
    </aside>
  );
}
