#!/usr/bin/env node
/**
 * Genauly logo + icon asset generator (brand plan PR B, s133).
 *
 * ONE source of truth for the mark: the locked highlighter swipe (Himmelblau)
 * plus the OUTLINED lowercase g (Inter 800, converted to a <path> so it renders
 * identically everywhere, per BRAND_SPEC §3). Regenerates every raster asset in
 * public/ and rewrites preview/branding/genauly-logo-final.svg.
 *
 * This is tooling, NOT part of the app build. It needs Playwright's Chromium
 * available locally (deterministic SVG->PNG rasterizer, no `sharp`). Run:
 *   NODE_PATH=<global node_modules> node scripts/branding/build-logo-assets.mjs
 * (in the dev sandbox: NODE_PATH=/opt/node22/lib/node_modules with
 * PW executablePath /opt/pw-browsers/chromium). The og-image wordmark embeds
 * the Inter 800 static woff from @fontsource/inter (a scratch/dev install).
 *
 * Asset rules (locked in CLAUDE.md → Brand logo):
 *  - In-app + favicons: ROUNDED tile, TRANSPARENT corners (Papier fill).
 *  - OS-masked icons (apple-touch, pwa-192/512): FULL-BLEED OPAQUE (no
 *    transparent corners; iOS fills transparency with black).
 *  - Maskable: full-bleed, mark inside the inner 80% safe zone.
 */
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const pub = join(root, "public");

// --- Brand constants (BRAND_SPEC §1/§3) ---
const PAPIER = "#FAF6EC";
const HIMMELBLAU = "#52C6F9";
const TINTE = "#1C1A24";
// Locked swipe, in the 64x64 tile, rotated -3deg about (32,32).
const SWIPE = "M 12 24 L 52 20 Q 57 23 55 30 L 54 45 L 13 49 Q 9 45 10 34 Z";
// Outlined lowercase g, Inter 800, baseline y=47, centered on x=32, size 42.
const G_PATH =
  "M31.50 56.06Q28.50 56.06 26.27 55.31Q24.03 54.55 22.65 53.19Q21.26 51.84 20.85 50.06L27.07 48.78Q27.27 49.40 27.83 49.92Q28.38 50.45 29.28 50.76Q30.19 51.08 31.46 51.08Q33.65 51.08 34.83 50.10Q36.01 49.11 36.01 47.06L36.01 43L35.46 43Q35.05 44.03 34.24 44.87Q33.43 45.71 32.18 46.20Q30.94 46.69 29.24 46.69Q26.72 46.69 24.64 45.51Q22.56 44.33 21.31 41.86Q20.05 39.39 20.05 35.54Q20.05 31.52 21.35 28.91Q22.64 26.31 24.72 25.05Q26.80 23.79 29.22 23.79Q31.05 23.79 32.35 24.40Q33.65 25.02 34.50 25.99Q35.35 26.96 35.78 28.01L35.99 28.01L35.99 24.07L43.06 24.07L43.06 46.49Q43.06 49.65 41.60 51.78Q40.13 53.91 37.53 54.99Q34.92 56.06 31.50 56.06M31.68 41.44Q33.06 41.44 34.02 40.75Q34.98 40.05 35.50 38.70Q36.01 37.36 36.01 35.52Q36.01 33.63 35.50 32.25Q34.98 30.88 34.03 30.13Q33.08 29.38 31.68 29.38Q30.31 29.38 29.35 30.15Q28.40 30.92 27.91 32.30Q27.42 33.67 27.42 35.52Q27.42 37.36 27.91 38.69Q28.40 40.03 29.35 40.73Q30.31 41.44 31.68 41.44";

const MARK = `<path d="${SWIPE}" fill="${HIMMELBLAU}" transform="rotate(-3 32 32)"/><path d="${G_PATH}" fill="${TINTE}"/>`;

/** Rounded tile with transparent corners (in-app + favicons). */
function roundedSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${PAPIER}"/>${MARK}</svg>`;
}
/** Full-bleed opaque square, mark scaled to `k` and centered (OS-masked). */
function fullBleedSvg(k = 0.82) {
  const t = 32 - 32 * k;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${PAPIER}"/><g transform="translate(${t} ${t}) scale(${k})">${MARK}</g></svg>`;
}
/** Canonical committed SVG (256 default render box). */
function canonicalSvg() {
  return `<!-- Genauly brand mark (Kit 1, BRAND_SPEC.md). The g is OUTLINED
     (Inter 800 -> <path>) so it renders identically across platforms and in
     the favicon / PWA icons. Regenerate with scripts/branding/build-logo-assets.mjs.
     Swipe = Himmelblau ${HIMMELBLAU}, ink = ${TINTE}, tile = Papier ${PAPIER}. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256" role="img" aria-label="Genauly">
  <rect width="64" height="64" rx="14" fill="${PAPIER}"/>
  <path d="${SWIPE}" fill="${HIMMELBLAU}" transform="rotate(-3 32 32)"/>
  <path d="${G_PATH}" fill="${TINTE}"/>
</svg>
`;
}

// og-image (1200x630): mark tile + wordmark + tagline on Papier.
function ogHtml(interWoffB64) {
  const font = interWoffB64
    ? `@font-face{font-family:'InterOG';src:url(data:font/woff;base64,${interWoffB64}) format('woff');font-weight:800}`
    : "";
  return `<!doctype html><html><head><meta charset="utf8"><style>
    ${font}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:${PAPIER};display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:34px;
      font-family:${interWoffB64 ? "'InterOG'," : ""}system-ui,-apple-system,'Segoe UI',sans-serif}
    .tile{width:150px;height:150px;border-radius:33px;box-shadow:0 18px 48px rgba(34,48,79,.14)}
    h1{font-size:104px;font-weight:800;letter-spacing:-.035em;color:${TINTE};line-height:1}
    p{font-size:34px;font-weight:600;color:#4B5563;letter-spacing:-.01em}
    .plate{background:#fff;border:1px solid #E7DEC9;border-radius:999px;padding:12px 26px;
      font-size:26px;font-weight:700;color:#3D74ED}
  </style></head><body>
    <svg class="tile" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="14" fill="${PAPIER}"/>${MARK}</svg>
    <h1>Genauly</h1>
    <p>German for real life. Break through the B1 to B2 plateau.</p>
    <div class="plate">genauly.de</div>
  </body></html>`;
}

const ROUNDED = roundedSvg();
const FULLBLEED = fullBleedSvg(0.82);
const MASKABLE = fullBleedSvg(0.62); // mark within inner ~80% safe zone

// [file, size, svg]
const ICONS = [
  ["genauly-default-logo-transparent-corners.png", 512, ROUNDED, true],
  ["favicon-16.png", 16, ROUNDED, true],
  ["favicon-32.png", 32, ROUNDED, true],
  ["favicon-48.png", 48, ROUNDED, true],
  ["apple-touch-icon.png", 180, FULLBLEED, false],
  ["pwa-192x192.png", 192, FULLBLEED, false],
  ["pwa-512x512.png", 512, FULLBLEED, false],
  ["pwa-maskable-512x512.png", 512, MASKABLE, false],
];

async function rasterizeSvg(page, svg, size, transparent) {
  const html = `<!doctype html><html><head><style>*{margin:0}html,body{width:${size}px;height:${size}px}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: "networkidle" });
  return page.screenshot({ omitBackground: transparent });
}

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
});
const page = await browser.newPage({ deviceScaleFactor: 1 });

for (const [file, size, svg, transparent] of ICONS) {
  const buf = await rasterizeSvg(page, svg, size, transparent);
  writeFileSync(join(pub, file), buf);
  console.log(`✓ ${file} (${size}px${transparent ? ", transparent" : ", opaque"})`);
}

// og-image with embedded Inter 800 if available (scratch/dev install).
let interB64 = "";
const interCandidates = [
  process.env.INTER_800_WOFF,
  join(root, "node_modules/@fontsource/inter/files/inter-latin-800-normal.woff"),
].filter(Boolean);
for (const c of interCandidates) {
  if (c && existsSync(c)) { interB64 = readFileSync(c).toString("base64"); break; }
}
if (!interB64) console.warn("! Inter 800 woff not found; og-image wordmark falls back to system-ui bold.");
await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(ogHtml(interB64), { waitUntil: "networkidle" });
await page.waitForTimeout(200);
writeFileSync(join(pub, "og-image.png"), await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } }));
console.log("✓ og-image.png (1200x630)");

writeFileSync(join(root, "preview/branding/genauly-logo-final.svg"), canonicalSvg());
console.log("✓ preview/branding/genauly-logo-final.svg");

await browser.close();
