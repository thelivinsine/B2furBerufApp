#!/usr/bin/env node
/**
 * WCAG contrast gate for the brand token system (`pnpm check:contrast`).
 *
 * Parses the `:root` and `.dark` HSL custom properties out of src/index.css
 * and asserts every DESIGNED token pairing against WCAG 2.1 thresholds:
 *   CORE (4.5:1) — body/label text pairings that must always read.
 *   UI   (3.0:1) — status fills, icons, bold chips, focus rings.
 * Added in the brand-kit modernization PR A (plan §5) so a "verified" palette
 * can never silently drift below its ratios. Zero dependencies.
 *
 * Deliberately NOT gated: warning-as-text on light surfaces. Amber text
 * cannot reach 3:1 without turning brown; call sites are icon/bold-chip uses
 * on tinted fills (same trade-off the previous palette made). Revisit in the
 * brand plan's PR D if warning-as-body-text ever appears.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const css = readFileSync(join(root, "src/index.css"), "utf8");

/** Extract `--token: H S% L%;` declarations from one selector block. */
function parseBlock(selector) {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`selector ${selector} not found`);
  const end = css.indexOf("}", start);
  const tokens = {};
  for (const m of css.slice(start, end).matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    tokens[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return tokens;
}

function hslToRgb([h, s, l]) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    return l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return [f(0), f(8), f(4)];
}
const luminance = (rgb) => {
  const [r, g, b] = rgb.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
function contrast(fg, bg) {
  const [hi, lo] = [luminance(hslToRgb(fg)), luminance(hslToRgb(bg))].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

const CORE = 4.5; // small-text AA
const UI = 3.0; // large-text / non-text UI AA

// [fg token, bg token, threshold] — asserted in BOTH themes.
const PAIRS = [
  ["foreground", "background", CORE],
  ["foreground", "surface", CORE],
  ["foreground", "elevated", CORE],
  ["foreground", "muted", CORE],
  ["muted-foreground", "background", CORE],
  ["muted-foreground", "surface", CORE],
  ["muted-foreground", "muted", CORE],
  ["primary-foreground", "primary", CORE],
  ["primary", "background", CORE], // text-primary eyebrows/labels
  ["primary", "surface", CORE],
  ["accent-foreground", "accent", CORE],
  ["accent-ink", "background", CORE],
  ["accent-ink", "surface", CORE],
  ["warning-foreground", "warning", CORE],
  ["success-foreground", "success", UI],
  ["danger-foreground", "danger", UI],
  ["success", "surface", UI], // text-success status labels
  ["danger", "surface", UI], // text-danger status labels
  ["reward", "surface", UI], // text-reward chips
  ["reward", "reward-bg", UI], // streak / combo pill
  ["ring", "background", UI], // focus ring visibility
  // Accent-gradient stops (s137): gradient CTAs carry primary-foreground text.
  // The deep start stop must clear small-text AA; the vivid end stop clears
  // the UI floor (bold button labels), the same bar the s133 gradient set.
  ["primary-foreground", "gradient-from", CORE],
  ["primary-foreground", "gradient-to", UI],
];

let failures = 0;
for (const [selector, name] of [[":root", "light"], [".dark", "dark"]]) {
  const t = parseBlock(selector);
  for (const [fg, bg, min] of PAIRS) {
    if (!t[fg] || !t[bg]) {
      console.error(`✗ [${name}] missing token --${fg} or --${bg}`);
      failures++;
      continue;
    }
    const ratio = contrast(t[fg], t[bg]);
    const ok = ratio >= min;
    if (!ok) failures++;
    const line = `[${name}] ${fg} on ${bg}: ${ratio.toFixed(2)}:1 (min ${min})`;
    console.log(`${ok ? "✓" : "✗ FAIL"} ${line}`);
  }
}

if (failures) {
  console.error(`\ncheck-contrast: ${failures} pairing(s) below threshold.`);
  process.exit(1);
}
console.log("\ncheck-contrast: all token pairings pass.");
