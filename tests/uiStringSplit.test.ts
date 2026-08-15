import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * A translated string is never welded to a literal tail (s211).
 *
 * The founder's screenshot of the Verlauf read: **"There is no feedback for this
 * conversation. Your conversation is stillgespeichert."** The sentence had been
 * written as `{t("… Dein Gespräch ist trotzdem")}gespeichert.`, so the head went
 * through the interface-language fold and the tail stayed German AND lost its
 * space. An English reader gets a German word glued onto an English sentence,
 * and the German reader never notices, because for them both halves are German.
 *
 * `ConfirmEmail` had the identical construction ("Melde dich an, dann" +
 * "schicken wir dir einen neuen."), which is what makes this a class rather than
 * a typo: it is invisible in the language the app is authored in.
 *
 * The rule: ONE `t()` call per sentence. Interpolate values with `{}`, never
 * continue a sentence in JSX text after a `t()` expression.
 */

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? tsxFiles(p) : p.endsWith(".tsx") ? [p] : [];
  });
}

/**
 * `{t("…")}` used as JSX CHILDREN (not as an attribute value, which is why the
 * lookbehind rejects a preceding `=`) and followed by literal letters.
 */
const SPLIT = /(?<!=)\{t\(\s*"(?:[^"\\]|\\.)*"\s*\)\}[ \t]*\n?[ \t]*([A-Za-zÄÖÜäöüß])/g;

describe("interface strings", () => {
  it("never continues a translated sentence in literal JSX text", () => {
    const offenders: string[] = [];
    for (const file of tsxFiles("src")) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(SPLIT)) {
        const line = src.slice(0, m.index).split("\n").length;
        offenders.push(`${file}:${line}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
