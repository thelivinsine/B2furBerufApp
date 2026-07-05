#!/usr/bin/env node
/**
 * Bundle budget gate (audit D4). Fails CI when the eager main chunk creeps
 * past its budget, so the "every content bank rides in the main bundle"
 * regression (fixed in the 2026-07-05 audit: 606 kB -> 328 kB) cannot return
 * silently. Run AFTER `pnpm build`.
 *
 * The budget is on the minified (pre-gzip) size of dist/assets/index-*.js:
 * parse/eval cost on a phone tracks the minified size, not the wire size.
 * If a legitimate feature needs to raise it, change MAIN_BUDGET_KB here in
 * the same PR and say why in the PR body.
 */
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const MAIN_BUDGET_KB = 400;
const ASSETS = path.resolve("dist/assets");

let files;
try {
  files = readdirSync(ASSETS);
} catch {
  console.error("check-bundle-size: dist/assets not found. Run `pnpm build` first.");
  process.exit(1);
}

const main = files.filter((f) => /^index-.*\.js$/.test(f));
if (main.length === 0) {
  console.error("check-bundle-size: no index-*.js chunk found in dist/assets.");
  process.exit(1);
}

let failed = false;
for (const f of main) {
  const kb = statSync(path.join(ASSETS, f)).size / 1024;
  const line = `${f}: ${kb.toFixed(1)} kB (budget ${MAIN_BUDGET_KB} kB)`;
  if (kb > MAIN_BUDGET_KB) {
    console.error(`✗ OVER BUDGET  ${line}`);
    failed = true;
  } else {
    console.log(`✓ ${line}`);
  }
}

process.exit(failed ? 1 : 0);
