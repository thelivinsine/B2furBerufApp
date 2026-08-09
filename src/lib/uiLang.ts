import { useSettingsStore, type CefrLevel, type UiLangPref } from "@/store/useSettingsStore";
import { UI_EN } from "./uiStrings";

/**
 * The ONE interface-language rule (founder s207).
 *
 * "the app's language should adapt to various levels of user language
 * proficiency. if the user logs A2 or B1 level, the app should show everything
 * in English except the learning material which should obviously be in german."
 *
 * So: **A2/B1 read the interface in English, B2/C1 keep the German interface**,
 * and the learning material (the words, the example sentences, the Redemittel,
 * the grammar drills, an exam text, anything the learner is there to READ IN
 * GERMAN) is never touched by this. Chrome is translatable; content is not.
 *
 * ## How a string is translated
 *
 * The app was written German-first, so the GERMAN STRING IS THE KEY. A call
 * site becomes `t("Wörter")`, and `uiStrings.ts` holds the English for it. That
 * has two properties worth keeping:
 *
 * - **A missing translation is not a crash or a blank.** It falls back to the
 *   German string, which is exactly what that call site rendered before, so
 *   coverage can grow one surface at a time without any half-broken state.
 * - **Every English string lives in ONE file**, which the founder can read
 *   end-to-end as a document instead of hunting through 143 components.
 *
 * When the same German word needs two different English words, pass a context:
 * `t("Start", "session")` looks up `"Start#session"` first, then plain `"Start"`.
 */

export type UiLang = "de" | "en";

/** The levels that read the interface in English under "auto". */
const ENGLISH_UI_LEVELS: CefrLevel[] = ["A2", "B1"];

/** Resolve the stored preference + level into the language actually rendered. */
export function uiLangFor(pref: UiLangPref, level: CefrLevel): UiLang {
  if (pref === "de" || pref === "en") return pref;
  return ENGLISH_UI_LEVELS.includes(level) ? "en" : "de";
}

/** Translate one chrome string. German in, German or English out. */
export function translate(de: string, lang: UiLang, ctx?: string): string {
  if (lang === "de") return de;
  if (ctx) {
    const scoped = UI_EN[`${de}#${ctx}`];
    if (scoped) return scoped;
  }
  return UI_EN[de] ?? de;
}

/** The interface language, read outside a component. See `translateNow`. */
export function uiLangNow(): UiLang {
  const s = useSettingsStore.getState();
  return uiLangFor(s.uiLang, s.level);
}

/**
 * Translate outside a component: a `DataTable` cell renderer, a toast built in
 * an event handler, a label map consumed by a plain function. Reads the store
 * directly instead of subscribing, so it is only safe where SOMETHING above it
 * re-renders when the language changes (in practice the page does, because the
 * page itself calls `useT`). Prefer `useT()` wherever hooks are allowed.
 */
export function translateNow(de: string, ctx?: string): string {
  const s = useSettingsStore.getState();
  return translate(de, uiLangFor(s.uiLang, s.level), ctx);
}

/** The interface language in effect right now. */
export function useUiLang(): UiLang {
  return uiLangFor(
    useSettingsStore((s) => s.uiLang),
    useSettingsStore((s) => s.level),
  );
}

/**
 * The translator for a component: `const t = useT()`, then `t("Weiter")`.
 *
 * Deliberately NOT a hook per string, so a component calls it as many times as
 * it has strings without adding a subscription per call.
 */
export function useT(): (de: string, ctx?: string) => string {
  const lang = useUiLang();
  return (de, ctx) => translate(de, lang, ctx);
}

/**
 * The title of a taxonomy row that ALREADY carries both languages in the data:
 * a Thema and its sub-themes (`title` = English, `titleDe` = German), a life
 * area (`titleDe` / `titleEn`). These are NOT dictionary entries, because the
 * content bank is the source and duplicating 66 theme names into `uiStrings`
 * would be two places to keep in step.
 */
export function useTitle(): (row: {
  title?: string;
  titleDe?: string;
  titleEn?: string;
}) => string {
  const lang = useUiLang();
  return (row) =>
    lang === "de"
      ? (row.titleDe ?? row.title ?? "")
      : (row.titleEn ?? row.title ?? row.titleDe ?? "");
}

/**
 * Pick between two strings that are not in the dictionary (a sentence built at
 * runtime, a plural, anything with interpolation). Same rule, no lookup.
 */
export function useTx(): (de: string, en: string) => string {
  const lang = useUiLang();
  return (de, en) => (lang === "de" ? de : en);
}
