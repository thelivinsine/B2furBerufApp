/**
 * Test gate for `src/engine/pronounce.ts` (Learning Engine #27, the speaking
 * production block). The matcher grades spoken/typed answers, so a silent
 * regression here mis-grades learners; these cases pin the contract:
 * normalization (casing, punctuation, articles, ß), word-boundary containment
 * (STT returns longer utterances around the target), the length-scaled
 * Levenshtein tolerance, and the rejections that keep the matcher honest.
 *
 * Loads the real `.ts` module through Vite's `ssrLoadModule` (the
 * `lint-content.mjs` / `test-srs.mjs` pattern). Run with `pnpm test:pronounce`.
 * Any failed assertion fails the process (CI gate).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

let checks = 0;
let failures = 0;
function ok() {
  checks += 1;
}
function fail(name, msg) {
  failures += 1;
  console.error(`FAIL ${name}: ${msg}`);
}
function assertEqual(name, actual, expected) {
  if (actual === expected) ok();
  else fail(name, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  try {
    const { normalizeSpoken, matchesSpoken } = await server.ssrLoadModule(
      "/src/engine/pronounce.ts",
    );

    /* ---- normalization ---- */
    const norm = [
      ["die Besprechung", "besprechung"],
      ["Die  Besprechung!", "besprechung"],
      ["sich abstimmen", "abstimmen"],
      ["das E-Mail-Postfach", "e mail postfach"],
      ["der Straßenverkehr", "strassenverkehr"],
      ["eine Überweisung", "überweisung"],
      // A lone article is kept: stripping it would leave an empty answer.
      ["die", "die"],
      ["  ", ""],
    ];
    for (const [input, expected] of norm) {
      assertEqual(`normalize(${JSON.stringify(input)})`, normalizeSpoken(input), expected);
    }

    /* ---- matches ---- */
    const accept = [
      // Exact and casing/punctuation noise.
      ["die Besprechung", "die Besprechung"],
      ["besprechung", "die Besprechung"],
      ["Die Besprechung.", "die Besprechung"],
      // Article variants both ways.
      ["die Tagesordnung", "Tagesordnung"],
      // Reflexive verbs: bare form is a fair spoken answer.
      ["abstimmen", "sich abstimmen"],
      ["sich abstimmen", "sich abstimmen"],
      // Containment: STT wraps the target in a longer utterance.
      ["ähm die Besprechung glaube ich", "die Besprechung"],
      ["das ist die Tagesordnung", "die Tagesordnung"],
      // Small transcription slips within tolerance (len>=5 allows 1+).
      ["Besprechungen", "die Besprechung"],
      ["Tagesortnung", "die Tagesordnung"],
      // ß vs ss.
      ["Strassenverkehr", "der Straßenverkehr"],
      // Multi-word target inside an utterance.
      ["ich würde sagen einen Termin vereinbaren", "einen Termin vereinbaren"],
    ];
    for (const [said, target] of accept) {
      assertEqual(`accept(${JSON.stringify(said)} ~ ${JSON.stringify(target)})`, matchesSpoken(said, target), true);
    }

    const reject = [
      // A different word entirely.
      ["die Sitzung", "die Besprechung"],
      ["der Vertrag", "der Verkehr"],
      // Empty / silence.
      ["", "die Besprechung"],
      ["   ", "die Besprechung"],
      // Saying only the article is not producing the word.
      ["die", "die Besprechung"],
      // Short targets stay strict (tolerance 1 on a 4-letter word).
      ["Haut", "das Amt"],
    ];
    for (const [said, target] of reject) {
      assertEqual(`reject(${JSON.stringify(said)} ~ ${JSON.stringify(target)})`, matchesSpoken(said, target), false);
    }
  } finally {
    await server.close();
  }

  if (failures > 0) {
    console.error(`\ntest-pronounce: ${failures} failed, ${checks} passed`);
    process.exitCode = 1;
  } else {
    console.log(`test-pronounce: all ${checks} checks passed`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
