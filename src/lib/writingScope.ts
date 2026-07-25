import { themes } from "@/data/themes";
import { writingPrompts } from "@/data/writingPrompts";
import type { ThemeId, WorkSector } from "@/types";
import type { WritingLength } from "@/lib/writing";

/**
 * The ONE task-selection rule for Schreiben Kurz/Lang (s167).
 *
 * Before this module the rail counted Branche options as "tasks explicitly
 * TAGGED with this sector" and greyed out at zero, while the trainer drew with
 * a prefer-tagged-else-untagged fallback that is never empty. The two disagreed:
 * the rail marked a Branche unavailable while the engine happily served the
 * whole universal pool behind it, which is why the founder saw an almost empty
 * Aufgabe picker (only 70 of 373 tasks carry a `sectors` tag, and 11 of 20
 * Themen carry none at all).
 *
 * Both callers now go through `eligibleTasks`, so every dropdown count means
 * the same thing: **how many tasks the current scope will actually draw from.**
 *
 * Scope semantics:
 * - `theme: ""` = all Themen (the generic option the founder asked for). A
 *   drawn task therefore carries its own theme, hence `WritingTaskRef`.
 * - `sub` only applies inside a concrete theme (sub-theme slugs are declared
 *   per theme), so it is ignored when the theme scope is "all".
 * - `sector` follows the Bibliothek untagged-=-universal rule (`facets.ts`),
 *   applied PER THEME: a Branche prefers its tagged tasks where that theme has
 *   any and falls back to that theme's universal ones otherwise. Applying it
 *   per theme rather than globally keeps the pool broad under "Alle Themen"
 *   instead of collapsing it to the handful of tagged tasks.
 * - No scope combination is ever empty; a theme whose filters yield nothing
 *   falls back to its whole pool.
 */

/** A task identity that survives the "Alle Themen" scope. */
export interface WritingTaskRef {
  theme: ThemeId;
  /** Index into `writingPrompts[theme][length]`. */
  ix: number;
}

export interface WritingScope {
  /** "" = all Themen. */
  theme: ThemeId | "";
  /** "" = whole theme. Ignored when `theme` is "". */
  sub: string;
  /** "" = all Branchen. */
  sector: string;
  length: WritingLength;
}

const ALL_THEME_IDS: ThemeId[] = themes.map((t) => t.id);

/** Every task the scope allows, in theme order. Never empty. */
export function eligibleTasks({ theme, sub, sector, length }: WritingScope): WritingTaskRef[] {
  const out: WritingTaskRef[] = [];
  for (const id of theme ? [theme] : ALL_THEME_IDS) {
    const pool = writingPrompts[id]?.[length] ?? [];
    if (!pool.length) continue;
    let ix = pool.map((_, i) => i);
    if (theme && sub) ix = ix.filter((i) => pool[i].sub === sub);
    if (sector) {
      const tagged = ix.filter((i) => pool[i].sectors?.includes(sector as WorkSector));
      ix = tagged.length ? tagged : ix.filter((i) => !pool[i].sectors?.length);
    }
    // A theme in scope never contributes nothing.
    if (!ix.length) ix = pool.map((_, i) => i);
    out.push(...ix.map((i) => ({ theme: id, ix: i })));
  }
  return out;
}

/** How many tasks a scope yields; the number every rail dropdown shows. */
export function countTasks(scope: WritingScope): number {
  return eligibleTasks(scope).length;
}

/** The task text behind a ref, with a safe fallback for stale refs. */
export function taskText(ref: WritingTaskRef, length: WritingLength): string {
  const pool = writingPrompts[ref.theme]?.[length] ?? [];
  return (pool[ref.ix] ?? pool[0])?.text ?? "";
}

export function sameTask(a: WritingTaskRef | null, b: WritingTaskRef | null): boolean {
  return !!a && !!b && a.theme === b.theme && a.ix === b.ix;
}

/** Random pick from the eligible list, avoiding `exclude` when there is an
 *  alternative (the dice must visibly change the Aufgabe). */
export function randomTask(
  list: WritingTaskRef[],
  exclude?: WritingTaskRef | null,
): WritingTaskRef {
  if (!list.length) return { theme: ALL_THEME_IDS[0], ix: 0 };
  if (list.length === 1) return list[0];
  const i = Math.floor(Math.random() * list.length);
  const pick = list[i];
  return sameTask(pick, exclude ?? null) ? list[(i + 1) % list.length] : pick;
}
