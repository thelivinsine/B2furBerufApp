import { themes } from "@/data/themes";
import { writingPrompts, type WritingTask } from "@/data/writingPrompts";
import type { ContentCefr, ThemeId, WorkSector } from "@/types";
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
 * Scope semantics, in the order the filters apply:
 * - `theme: ""` = all Themen (the generic option the founder asked for). A
 *   drawn task therefore carries its own theme, hence `WritingTaskRef`.
 * - `sub` only applies inside a concrete theme (sub-theme slugs are declared
 *   per theme), so it is ignored when the theme scope is "all". A deep link
 *   naming a sub-theme with no tasks at this length falls back to the theme's
 *   whole pool rather than reaching into a different theme.
 * - `level` and `format` are HARD filters: a task that is not tagged with the
 *   chosen Niveau/Textsorte is not a match, full stop. They used to prefer
 *   their tagged tasks and fall back to the untagged ones, which is how
 *   "Forumsbeitrag" served a Beschwerde an eine Fluggesellschaft (founder
 *   2026-07-31): 373 of 643 tasks carry no format at all, so on every theme
 *   without a tagged task the fallback swallowed the filter, and when even the
 *   untagged set was empty the filter was dropped entirely. Measured on the
 *   shipped bank, 66% to 100% of the draws under a Textsorte contradicted it
 *   while the rail printed the honest (much smaller) count next to the option:
 *   the exact rail-vs-engine disagreement s167 fixed for Branche, still alive
 *   on these two axes. A hard filter means one number for both, so `countTasks`
 *   is now the only counting function.
 * - `sector` follows the Bibliothek untagged-=-universal rule (`facets.ts`),
 *   applied PER THEME and LAST: a Branche prefers the tagged tasks among what
 *   is left and falls back to the universal ones otherwise. Last, because a
 *   soft axis must not be able to hide the only task matching a hard one.
 *   Being soft, it can never empty a pool the other axes left non-empty, so
 *   Branche still never disables on its own.
 *
 * Consequence of the hard axes: **a scope CAN now yield nothing** (Forumsbeitrag
 * exists only as a Lang task, so Kurz + Forumsbeitrag is genuinely empty). The
 * rail greys every zero-yield option, and the trainer answers the combinations
 * that greying cannot prevent (a length switch, a deep link) with an honest
 * empty state plus the one-tap escape `blockingAxis` names, never by drawing
 * something that contradicts the selection.
 *
 * **Only STRUCTURED tasks are ever served** (founder decision, 2026-07-31).
 * A task with Inhaltspunkte carries the whole exam brief: Adressat, du/Sie,
 * 2 to 5 Leitpunkte, Niveau, Textsorte, word target. A bare one is a single
 * sentence, and `evaluate-writing` is sent the Aufgabe so it can grade
 * Aufgabenerfüllung, so a bare task quietly downgrades the feedback to grammar
 * and vocabulary. They were also invisible to the Niveau and Textsorte filters
 * (they carry neither tag), so 58% of default draws served the one shape of
 * task the rest of the product cannot reason about. The founder chose the
 * smaller, better bank: 270 tasks instead of 643, which is about two months of
 * daily practice at the Kurz 4 / Lang 2 allowance before anything repeats.
 *
 * **Nothing is deleted.** The 373 bare tasks stay in `writingPrompts.ts` with
 * their permanent ids and their pool positions, so a resumed draft or a Verlauf
 * row still resolves to the Aufgabe it was written against (`taskAt` /
 * `writingTaskById` index the FULL pool on purpose). They are retired from the
 * DRAW only, and each one returns the moment it is authored up to the exam
 * shape. That upgrade is the standing content backlog; the greyed-out zeros in
 * the rail are its to-do list.
 */

/**
 * Coarse Niveau bands, the granularity the rail offers (`B1`, `B2`, `C1`).
 * `ContentCefr` splits B1 and B2 in two; a learner picking "B2" means both
 * halves, and a task tagged `B2.2` must not become unreachable the day content
 * adds one (with the old exact `===` match it would have been, silently).
 */
const LEVEL_BAND: Record<ContentCefr, string> = {
  A2: "A2",
  "B1.1": "B1",
  "B1.2": "B1",
  "B2.1": "B2",
  "B2.2": "B2",
  C1: "C1",
};

/** The band a task's Niveau tag answers to, or undefined when it carries none. */
export function levelBand(level: ContentCefr | undefined): string | undefined {
  return level ? LEVEL_BAND[level] : undefined;
}

/**
 * Accepts a band (`?level=B2`) and the fine-grained value older links carry
 * (`?level=B2.1`), so a bookmarked or shared scope keeps working. Anything else
 * is "alle Niveaus", never a crash.
 */
export function normalizeLevelScope(value: string): string {
  if (!value) return "";
  const band = LEVEL_BAND[value as ContentCefr];
  if (band) return band;
  return Object.values(LEVEL_BAND).includes(value) ? value : "";
}

/**
 * A task the trainer may serve: one that carries the full exam brief. The
 * Inhaltspunkte are the marker because they are what makes Aufgabenerfüllung
 * checkable; on today's bank they coincide exactly with the Niveau/Textsorte
 * tags (270 tasks carry all of it, 373 carry none of it), and the shape check
 * in `tests/writingScope.test.ts` keeps them coinciding.
 */
export function isServable(task: WritingTask): boolean {
  return !!task.points?.length;
}

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
  /** "" = all Branchen. Soft axis: prefers tagged tasks, never empties a pool. */
  sector: string;
  /** "" = alle Niveaus. A coarse band (`B1`/`B2`/`C1`); HARD filter. */
  level?: string;
  /** "" = alle Textsorten. HARD filter. */
  format?: string;
  length: WritingLength;
}

const ALL_THEME_IDS: ThemeId[] = themes.map((t) => t.id);

/**
 * Every task the scope allows, in theme order. Empty when the chosen Niveau or
 * Textsorte genuinely has no task here (see the module docstring); callers must
 * say so rather than draw something else.
 */
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
    // Bare tasks are retired from the draw, not from the bank (module docstring).
    let ix = pool.map((_, i) => i).filter((i) => isServable(pool[i]));
    if (!ix.length) continue;
    // HARD, like Niveau and Textsorte: an Unterthema that has no task at this
    // length reads as unavailable. It used to fall back to the whole theme,
    // which was the last silent substitution left in here, and retiring the
    // bare tasks empties 30 of the 96 Unterthema cells, so the fallback would
    // have started firing in earnest.
    if (theme && sub) ix = ix.filter((i) => pool[i].sub === sub);
    // HARD: Niveau and Textsorte mean what they say. See the module docstring
    // for the fallback that used to sit here and the bug it caused.
    if (level) ix = ix.filter((i) => levelBand(pool[i].level) === level);
    if (format) ix = ix.filter((i) => pool[i].format === format);
    // SOFT, and last: the Branche prefers its tagged tasks among whatever the
    // hard axes left and falls back to the universal ones, so choosing one
    // narrows the pool without ever emptying it.
    if (sector && ix.length) {
      const tagged = ix.filter((i) => pool[i].sectors?.includes(sector as WorkSector));
      if (tagged.length) ix = tagged;
      else {
        const universal = ix.filter((i) => !pool[i].sectors?.length);
        if (universal.length) ix = universal;
      }
    }
    out.push(...ix.map((i) => ({ theme: id, ix: i })));
  }
  return out;
}

/**
 * How many tasks a scope yields: the number EVERY dropdown option shows, and
 * exactly what the trainer will draw from. One counting rule for all five axes
 * (the separate `countExact` for Niveau/Textsorte is gone with the fallback it
 * compensated for). Zero is a real answer, and the option greys out.
 */
export function countTasks(scope: WritingScope): number {
  return eligibleTasks(scope).length;
}

/** The scope axes a learner can relax, hardest first. */
export type ScopeAxis = "format" | "level" | "sub";

/**
 * Which single axis to drop to get out of an empty scope, for the trainer's
 * empty state. Null when the scope yields tasks (nothing to fix) or when no
 * single axis unblocks it (then the answer is a full reset). `sector` is never
 * the culprit: it cannot empty a pool.
 */
export function blockingAxis(scope: WritingScope): ScopeAxis | null {
  if (eligibleTasks(scope).length) return null;
  for (const axis of ["format", "level", "sub"] as const) {
    if (scope[axis] && eligibleTasks({ ...scope, [axis]: "" }).length) return axis;
  }
  return null;
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

/**
 * Random pick from the eligible list, avoiding `exclude` when there is an
 * alternative (the shuffle must visibly change the Aufgabe). **Null for an
 * empty list**: it used to hand back the first task of the first theme, which
 * is precisely the "the Aufgabe has nothing to do with my selection" answer
 * this module now refuses to give.
 */
export function randomTask(
  list: WritingTaskRef[],
  exclude?: WritingTaskRef | null,
): WritingTaskRef | null {
  if (!list.length) return null;
  if (list.length === 1) return list[0];
  const i = Math.floor(Math.random() * list.length);
  const pick = list[i];
  return sameTask(pick, exclude ?? null) ? list[(i + 1) % list.length] : pick;
}
