import { themes, themeById } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import { matchesLifeArea, themeGroupsByArea, type LifeAreaId } from "@/lib/lifeAreas";
import { LifeAreaPills } from "@/features/shared/LifeAreaPills";
import { ScopeRail, ScopeSection, ScopeSelect } from "@/features/shared/ScopeRail";
import { SECTOR_OPTIONS } from "@/lib/facets";
import { countTasks } from "@/lib/writingScope";
import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";

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

  const body = (
    <>
      {/* Niveau -> Branche -> Lebensbereich -> Thema -> Unterthema -> Textsorte
          (s167, Lebensbereich added s184): the Bibliothek hierarchy with the
          level axis in front (it is the coarsest scope) and Textsorte last (it
          narrows within everything else). */}
      <ScopeSection label="Niveau">
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
      </ScopeSection>

      <ScopeSection label="Branche">
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
      </ScopeSection>

      {/* Lebensbereich, directly below Branche and above Thema (founder s184).
          The same `LifeAreaPills` the Bibliothek rails render, so the control
          the learner meets here is the one they already know from there. The
          counts ignore the Thema/Unterthema below (the pills supersede those),
          so switching areas is never blocked by a Thema from the other one. */}
      <ScopeSection label="Lebensbereich">
        <LifeAreaPills
          value={lifeArea}
          onChange={onLifeAreaChange}
          counts={{
            professional: countWith({ area: "professional", theme: "", sub: "" }),
            personal: countWith({ area: "personal", theme: "", sub: "" }),
          }}
        />
      </ScopeSection>

      <ScopeSection label="Thema">
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
      </ScopeSection>

      {subThemes.length > 0 && (
        <ScopeSection label="Unterthema">
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
        </ScopeSection>
      )}

      <ScopeSection label="Textsorte">
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
      </ScopeSection>
    </>
  );

  return (
    <ScopeRail layout={layout} onReset={onReset} onClose={onClose} className={className}>
      {body}
    </ScopeRail>
  );
}
