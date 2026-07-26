import { themes } from "@/data/themes";
import { writingPrompts, type WritingTask } from "@/data/writingPrompts";
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
 * - `level` and `format` PREFER their tagged tasks and do NOT treat untagged
 *   as universal: an untagged task is not "every level", and while the bank
 *   upgrades in waves the legacy tasks would otherwise swamp both filters. The
 *   rail counts these two with `countExact` (no fallback) and greys them out at
 *   zero, so an option never quietly serves something else.
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
  /** "" = alle Niveaus. Prefers tagged tasks (see the module docstring). */
  level?: string;
  /** "" = alle Textsorten. Prefers tagged tasks (see the module docstring). */
  format?: string;
  length: WritingLength;
}

const ALL_THEME_IDS: ThemeId[] = themes.map((t) => t.id);

/** Every task the scope allows, in theme order. Never empty. */
export function eligibleTasks({
  theme,
  sub,
  sector,
  level,
  format,
  length,
}: WritingScope): WritingTaskRef[] {
  const out: WritingTaskRef[] = [];
  for (const id of theme ? [theme] : ALL_THEME_IDS) {
    const pool = writingPrompts[id]?.[length] ?? [];
    if (!pool.length) continue;
    let ix = pool.map((_, i) => i);
    if (theme && sub) ix = ix.filter((i) => pool[i].sub === sub);
    // Every tag axis narrows the same way: take the tasks tagged with the
    // chosen value, else the untagged ones, else keep what we had. Narrowing to
    // nothing is never allowed, so no scope can empty the picker.
    const narrow = (has: (i: number) => boolean, untagged: (i: number) => boolean) => {
      const tagged = ix.filter(has);
      if (tagged.length) return void (ix = tagged);
      const universal = ix.filter(untagged);
      if (universal.length) ix = universal;
    };
    if (sector)
      narrow(
        (i) => !!pool[i].sectors?.includes(sector as WorkSector),
        (i) => !pool[i].sectors?.length,
      );
    // Niveau and Textsorte PREFER their tagged tasks rather than admitting every
    // untagged one alongside (s167 fix). Untagged-=-universal is right for
    // Branche, because general vocabulary really does apply to every industry,
    // but an untagged task is not "every level" and certainly not "every
    // Textsorte": while the bank upgrades in waves the untagged legacy tasks
    // outnumber the tagged ones roughly ten to one, so admitting them made
    // "C1.1 + Widerspruch" serve a B1 address-change mail.
    if (level)
      narrow(
        (i) => pool[i].level === level,
        (i) => !pool[i].level,
      );
    if (format)
      narrow(
        (i) => pool[i].format === format,
        (i) => !pool[i].format,
      );
    // `narrow` can never empty the list, but the Unterthema filter above can
    // (a deep link may name a sub-theme with no tasks at this length). A theme
    // in scope must never contribute nothing, or the caller draws a task from
    // an entirely different theme.
    if (!ix.length) ix = pool.map((_, i) => i);
    out.push(...ix.map((i) => ({ theme: id, ix: i })));
  }
  return out;
}

/** How many tasks a scope yields; the number the Branche/Thema/Unterthema
 *  dropdowns show. Never zero, because those axes always fall back. */
export function countTasks(scope: WritingScope): number {
  return eligibleTasks(scope).length;
}

/**
 * How many tasks genuinely CARRY the chosen Niveau/Textsorte, with no fallback.
 * Those two dropdowns count with this and grey out at zero: a Branche can
 * honestly serve untagged tasks (general vocabulary suits every industry), but
 * "Forumsbeitrag" that quietly serves a Notiz is a lie. Forumsbeitrag exists
 * only as a Lang task, so under Kurz it correctly reads as unavailable.
 */
export function countExact(scope: WritingScope): number {
  const { level, format, length } = scope;
  if (!level && !format) return eligibleTasks(scope).length;
  // Drop the two axes from the fallback pass, then filter hard.
  return eligibleTasks({ ...scope, level: "", format: "" }).filter((ref) => {
    const t = writingPrompts[ref.theme]?.[length]?.[ref.ix];
    if (!t) return false;
    return (!level || t.level === level) && (!format || t.format === format);
  }).length;
}

/** The task behind a ref, with a safe fallback for stale refs (a resumed draft
 *  can point past the end of a pool that has since been re-authored). */
export function taskAt(ref: WritingTaskRef, length: WritingLength): WritingTask | undefined {
  const pool = writingPrompts[ref.theme]?.[length] ?? [];
  return pool[ref.ix] ?? pool[0];
}

/** The task text behind a ref, with a safe fallback for stale refs. */
export function taskText(ref: WritingTaskRef, length: WritingLength): string {
  return taskAt(ref, length)?.text ?? "";
}

/** id -> task index, built once. Lets Verlauf resolve a recorded `task_id`
 *  back to its Aufgabe (s167); pooled prompts alone could not. */
let TASK_BY_ID: Map<string, WritingTask> | null = null;
export function writingTaskById(id: string | null | undefined): WritingTask | undefined {
  if (!id) return undefined;
  if (!TASK_BY_ID) {
    TASK_BY_ID = new Map();
    for (const theme of ALL_THEME_IDS) {
      for (const length of ["short", "long"] as const) {
        for (const t of writingPrompts[theme]?.[length] ?? []) TASK_BY_ID.set(t.id, t);
      }
    }
  }
  return TASK_BY_ID.get(id);
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
