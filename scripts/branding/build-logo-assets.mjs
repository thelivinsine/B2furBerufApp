#!/usr/bin/env node
/**
 * Genauly logo + icon asset generator (brand plan PR B, s133; logo v2 rework
 * s138: Himmel Soft swipe, two-tone dark g, bbox-centered "Randnah" icons,
 * lowercase wordmark with the swipe under "genau").
 *
 * ONE source of truth for the mark: the locked highlighter swipe (Himmel Soft
 * #8CDBFB, founder-picked 2026-07-20 over the harsher Himmelblau) plus the
 * OUTLINED lowercase g (Inter 800, converted to a <path> so it renders
 * identically everywhere, per BRAND_SPEC §3). Regenerates every raster asset
 * in public/ and rewrites preview/branding/genauly-logo-final.svg.
 *
 * This is tooling, NOT part of the app build. It needs Playwright's Chromium
 * available locally (deterministic SVG->PNG rasterizer, no `sharp`). Run:
 *   NODE_PATH=<global node_modules> node scripts/branding/build-logo-assets.mjs
 * (in the dev sandbox: NODE_PATH=/opt/node22/lib/node_modules with
 * PW executablePath /opt/pw-browsers/chromium-<ver>/chrome-linux/chrome).
 * The wordmark + og-image embed Inter from the app's own dependency
 * (@fontsource-variable/inter), so `pnpm install` must have run.
 *
 * Asset rules (locked in CLAUDE.md → Brand logo):
 *  - The mark in every icon is centered by its TRUE bounding box ("Größer",
 *    12% margin, founder-picked 2026-07-20; the tighter 5% "Randnah" looked
 *    too big live). The raw path coords sit low in the 64-box (the g
 *    descender), which used to leave an empty band at the top of the app
 *    icon; never go back to raw-coordinate centering.
 *  - In-app + favicons: ROUNDED tile, TRANSPARENT corners (Papier fill).
 *  - OS-masked icons (apple-touch, pwa-192/512): FULL-BLEED OPAQUE (no
 *    transparent corners; iOS fills transparency with black).
 *  - Maskable: full-bleed, mark inside the inner 80% safe zone.
 *  - Dark-ground marks are TWO-TONE: the part of the g on the swipe is ink,
 *    the part off it (the descender) is white. Light-ground marks are all ink.
 *  - Wordmark: lowercase "genauly", swipe under "genau" (exact v2 band
 *    geometry: -0.16em/+0.10em overhangs, 0.12em/0.10em top/bottom insets of
 *    the em box, -2° tilt). Dark wordmark: word white, "genau" ink on the
 *    swipe, ONLY the g dual-tone (its descender is the sole off-swipe part).
 */
/* global document */ // page.evaluate callbacks run in the browser context
import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const pub = join(root, "public");

// --- Brand constants (BRAND_SPEC §1/§3) ---
const PAPIER = "#FAF6EC";
const HIMMEL_SOFT = "#8CDBFB"; // the swipe (founder-picked 2026-07-20; was Himmelblau #52C6F9)
const TINTE = "#1C1A24";
const WHITE = "#FFFFFF";
// Locked swipe, in the 64x64 tile, rotated -3deg about (32,32).
const SWIPE = "M 12 24 L 52 20 Q 57 23 55 30 L 54 45 L 13 49 Q 9 45 10 34 Z";
// The wordmark's wide highlighter stroke (organic edges), 120x46 design box.
const WIDE_SWIPE =
  "M4 12 Q1 24 4 36 Q3 40 10 39 L110 35 Q117 36 116 27 L117 13 Q118 7 110 8 L10 10 Q4 9 4 12 Z";
// Outlined lowercase g, Inter 800, baseline y=47, centered on x=32, size 42.
const G_PATH =
  "M31.50 56.06Q28.50 56.06 26.27 55.31Q24.03 54.55 22.65 53.19Q21.26 51.84 20.85 50.06L27.07 48.78Q27.27 49.40 27.83 49.92Q28.38 50.45 29.28 50.76Q30.19 51.08 31.46 51.08Q33.65 51.08 34.83 50.10Q36.01 49.11 36.01 47.06L36.01 43L35.46 43Q35.05 44.03 34.24 44.87Q33.43 45.71 32.18 46.20Q30.94 46.69 29.24 46.69Q26.72 46.69 24.64 45.51Q22.56 44.33 21.31 41.86Q20.05 39.39 20.05 35.54Q20.05 31.52 21.35 28.91Q22.64 26.31 24.72 25.05Q26.80 23.79 29.22 23.79Q31.05 23.79 32.35 24.40Q33.65 25.02 34.50 25.99Q35.35 26.96 35.78 28.01L35.99 28.01L35.99 24.07L43.06 24.07L43.06 46.49Q43.06 49.65 41.60 51.78Q40.13 53.91 37.53 54.99Q34.92 56.06 31.50 56.06M31.68 41.44Q33.06 41.44 34.02 40.75Q34.98 40.05 35.50 38.70Q36.01 37.36 36.01 35.52Q36.01 33.63 35.50 32.25Q34.98 30.88 34.03 30.13Q33.08 29.38 31.68 29.38Q30.31 29.38 29.35 30.15Q28.40 30.92 27.91 32.30Q27.42 33.67 27.42 35.52Q27.42 37.36 27.91 38.69Q28.40 40.03 29.35 40.73Q30.31 41.44 31.68 41.44";

const SWIPE_EL = `<path d="${SWIPE}" fill="${HIMMEL_SOFT}" transform="rotate(-3 32 32)"/>`;
/** Compact mark layers. Light grounds: all-ink g. Dark grounds: two-tone g
 * (white base, ink clipped to the swipe → ink bowl, white descender). */
function markLayers(mode, clipId) {
  if (mode === "dark") {
    return (
      `<defs><clipPath id="${clipId}"><path d="${SWIPE}" transform="rotate(-3 32 32)"/></clipPath></defs>` +
      SWIPE_EL +
      `<path d="${G_PATH}" fill="${WHITE}"/>` +
      `<path d="${G_PATH}" fill="${TINTE}" clip-path="url(#${clipId})"/>`
    );
  }
  return SWIPE_EL + `<path d="${G_PATH}" fill="${TINTE}"/>`;
}

// Icon tile margin. "Größer" = 0.12 (founder-picked over the tighter 0.05
// "Randnah", which read too big live). One knob for every tiled icon.
const TILE_MARGIN = 0.12;

/** translate+scale that centers the mark's true bbox in the 64-box at the
 * given margin. bbox measured in-browser once at startup. */
function centerTransform(bb, margin) {
  const s = (64 * (1 - 2 * margin)) / Math.max(bb.w, bb.h);
  const tx = 32 - s * (bb.x + bb.w / 2);
  const ty = 32 - s * (bb.y + bb.h / 2);
  const r = (n) => Math.round(n * 1000) / 1000;
  return `translate(${r(tx)} ${r(ty)}) scale(${r(s)})`;
}

/** Rounded tile with transparent corners (in-app + favicons). Größer. */
function roundedSvg(bb) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${PAPIER}"/><g transform="${centerTransform(bb, TILE_MARGIN)}">${markLayers("light", "cr")}</g></svg>`;
}
/** Full-bleed opaque square (OS-masked icons). */
function fullBleedSvg(bb, margin) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="${PAPIER}"/><g transform="${centerTransform(bb, margin)}">${markLayers("light", "cf")}</g></svg>`;
}
/** Tile-less in-app logo (transparent, NO tile), centered by bbox. The g is
 * ink on light grounds and TWO-TONE on dark grounds (ink bowl on the swipe,
 * white descender off it) so the mark reads on any surface. */
function tilelessSvg(mode) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><g class="cx">${markLayers(mode, "ct")}</g></svg>`;
}

/** Canonical committed SVG (256 default render box) = the favicon look. */
function canonicalSvg(bb) {
  return `<!-- Genauly brand mark (Kit 1, BRAND_SPEC.md; logo v2 rework 2026-07-20).
     The g is OUTLINED (Inter 800 -> <path>) so it renders identically across
     platforms and in the favicon / PWA icons. The mark is centered by its true
     bounding box ("Größer", 12% margin). Regenerate with
     scripts/branding/build-logo-assets.mjs.
     Swipe = Himmel Soft ${HIMMEL_SOFT}, ink = ${TINTE}, tile = Papier ${PAPIER}. -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="256" height="256" role="img" aria-label="Genauly">
  <rect width="64" height="64" rx="14" fill="${PAPIER}"/>
  <g transform="${centerTransform(bb, TILE_MARGIN)}">
    <path d="${SWIPE}" fill="${HIMMEL_SOFT}" transform="rotate(-3 32 32)"/>
    <path d="${G_PATH}" fill="${TINTE}"/>
  </g>
</svg>
`;
}

// og-image (1200x630): mark tile + wordmark + tagline on Papier.
function ogHtml(bb, interB64) {
  const font = interB64
    ? `@font-face{font-family:'InterOG';src:url(data:font/woff2;base64,${interB64}) format('woff2-variations');font-weight:100 900}`
    : "";
  return `<!doctype html><html><head><meta charset="utf8"><style>
    ${font}
    *{margin:0;box-sizing:border-box}
    body{width:1200px;height:630px;background:${PAPIER};display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:34px;
      font-family:${interB64 ? "'InterOG'," : ""}system-ui,-apple-system,'Segoe UI',sans-serif}
    .tile{width:150px;height:150px;border-radius:33px;box-shadow:0 18px 48px rgba(34,48,79,.14)}
    h1{font-size:104px;font-weight:800;letter-spacing:-.035em;color:${TINTE};line-height:1}
    p{font-size:34px;font-weight:600;color:#4B5563;letter-spacing:-.01em}
    .plate{background:#fff;border:1px solid #E7DEC9;border-radius:999px;padding:12px 26px;
      font-size:26px;font-weight:700;color:#3D74ED}
  </style></head><body>
    <svg class="tile" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><rect width="64" height="64" rx="14" fill="${PAPIER}"/><g transform="${centerTransform(bb, 0.1)}">${markLayers("light", "cg")}</g></svg>
    <h1>Genauly</h1>
    <p>German for real life. Break through the B1 to B2 plateau.</p>
    <div class="plate">genauly.de</div>
  </body></html>`;
}

async function rasterizeSvg(page, svg, size, transparent) {
  const html = `<!doctype html><html><head><style>*{margin:0}html,body{width:${size}px;height:${size}px}svg{display:block;width:${size}px;height:${size}px}</style></head><body>${svg}</body></html>`;
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(html, { waitUntil: "networkidle" });
  return page.screenshot({ omitBackground: transparent });
}

/**
 * Wordmark assets: lowercase "genauly" set in the app's own Inter (variable,
 * wght 800, -0.02em tracking) with the v2 swipe band under "genau". Rendered
 * from live text against the embedded font (identical letterforms to outlined
 * paths), measured in-page, screenshotted transparent. Committed as PNG only;
 * an SVG with <text> would silently fall back off-platform.
 */
async function renderWordmark(page, mode, interB64) {
  const FS = 128, PAD = Math.round(0.2 * FS), BASE = Math.round(0.8 * FS);
  const H = Math.round(1.08 * FS);
  const font = `@font-face{font-family:'InterWM';src:url(data:font/woff2;base64,${interB64}) format('woff2-variations');font-weight:100 900}`;
  const html = `<!doctype html><html><head><style>${font}
    *{margin:0}body{background:transparent}
    svg{display:block}
    text{font-family:'InterWM';font-weight:800;letter-spacing:-0.02em}
  </style></head><body>
    <svg id="wm" xmlns="http://www.w3.org/2000/svg" height="${H}">
      <text id="t" x="${PAD}" y="${BASE}" font-size="${FS}">genauly</text>
    </svg>
  </body></html>`;
  await page.setViewportSize({ width: 1400, height: 300 });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ FS, PAD, BASE, H, mode, WIDE, SWIPE_C, INK, WHITE }) =>
      document.fonts.ready.then(() => {
        const svg = document.getElementById("wm");
        const t = document.getElementById("t");
        const full = t.getComputedTextLength();
        const gEnd = PAD + t.getSubStringLength(0, 1);
        const genau = t.getSubStringLength(0, 5);
        // exact v2 band: -0.16em/+0.10em overhangs, 0.12em/0.10em insets of the
        // em box (Inter box top ≈ baseline-0.864em at line-height 1), -2° tilt.
        const sx = PAD - 0.16 * FS, sw = genau + 0.26 * FS;
        const sy = BASE - 0.744 * FS, sh = 0.78 * FS;
        const cx = sx + sw / 2, cy = sy + sh / 2;
        const TR = `rotate(-2 ${cx} ${cy}) translate(${sx} ${sy}) scale(${sw / 120} ${sh / 46})`;
        const W = Math.ceil(PAD * 2 + full);
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("width", String(W));
        const swipeEl = `<path d="${WIDE}" transform="${TR}" fill="${SWIPE_C}"/>`;
        const txt = (fill, clip) =>
          `<text x="${PAD}" y="${BASE}" font-size="${FS}" fill="${fill}"${clip ? ` clip-path="url(#wmclip)"` : ""}>genauly</text>`;
        if (mode === "dark") {
          // word white; ink clipped to swipe ∪ a rect over e..u (full letter
          // height) → "enau" solid ink, ONLY the g dual-tone (white descender).
          svg.innerHTML =
            `<defs><clipPath id="wmclip"><path d="${WIDE}" transform="${TR}"/>` +
            `<rect x="${gEnd - 1}" y="${BASE - 0.9 * FS}" width="${PAD + genau - gEnd + 2}" height="${0.96 * FS}"/></clipPath></defs>` +
            swipeEl + txt(WHITE) + txt(INK, true);
        } else {
          svg.innerHTML = swipeEl + txt(INK);
        }
      }),
    { FS, PAD, BASE, H, mode, WIDE: WIDE_SWIPE, SWIPE_C: HIMMEL_SOFT, INK: TINTE, WHITE }
  );
  const el = await page.$("#wm");
  return el.screenshot({ omitBackground: true });
}

const browser = await chromium.launch({
  executablePath: process.env.PW_CHROMIUM || undefined,
});
const page = await browser.newPage({ deviceScaleFactor: 1 });

// Measure the mark's true bbox once (swipe ∪ g, rotated swipe included).
await page.setContent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><g id="m">${SWIPE_EL}<path d="${G_PATH}" fill="${TINTE}"/></g></svg>`
);
const BB = await page.evaluate(() => {
  const b = document.getElementById("m").getBBox();
  return { x: b.x, y: b.y, w: b.width, h: b.height };
});
console.log(`mark bbox x=${BB.x.toFixed(2)} y=${BB.y.toFixed(2)} w=${BB.w.toFixed(2)} h=${BB.h.toFixed(2)}`);

// Tile-less in-app logos center via the same transform (2% margin: the <img>
// box is the frame, callers size it).
const centerCx = (svg) =>
  svg.replace('class="cx"', `transform="${centerTransform(BB, 0.02)}"`);

const ROUNDED = roundedSvg(BB);
const FULLBLEED = fullBleedSvg(BB, TILE_MARGIN); // Größer
const MASKABLE = fullBleedSvg(BB, 0.14); // mark within inner ~72% safe zone (OS crops)
const TILELESS_LIGHT = centerCx(tilelessSvg("light"));
const TILELESS_DARK = centerCx(tilelessSvg("dark"));

// [file, size, svg, transparent]
const ICONS = [
  // In-app logo: tile-less, transparent, g adapts to the theme (two-tone on dark).
  ["genauly-logo.png", 512, TILELESS_LIGHT, true],
  ["genauly-logo-dark.png", 512, TILELESS_DARK, true],
  // Browser tab + OS icons keep their Papier tile (transparency shows black on
  // OS masks; a bare mark vanishes on a themed browser tab).
  ["favicon-16.png", 16, ROUNDED, true],
  ["favicon-32.png", 32, ROUNDED, true],
  ["favicon-48.png", 48, ROUNDED, true],
  ["apple-touch-icon.png", 180, FULLBLEED, false],
  ["pwa-192x192.png", 192, FULLBLEED, false],
  ["pwa-512x512.png", 512, FULLBLEED, false],
  ["pwa-maskable-512x512.png", 512, MASKABLE, false],
];

for (const [file, size, svg, transparent] of ICONS) {
  const buf = await rasterizeSvg(page, svg, size, transparent);
  writeFileSync(join(pub, file), buf);
  console.log(`✓ ${file} (${size}px${transparent ? ", transparent" : ", opaque"})`);
}

// Inter variable woff2 from the app's own dependency (self-hosted font).
let interB64 = "";
const interCandidates = [
  process.env.INTER_WOFF2,
  join(root, "node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2"),
  join(root, "node_modules/@fontsource/inter/files/inter-latin-800-normal.woff"),
].filter(Boolean);
for (const c of interCandidates) {
  if (c && existsSync(c)) { interB64 = readFileSync(c).toString("base64"); break; }
}
if (!interB64) {
  console.warn("! Inter woff2 not found (run pnpm install); wordmark assets SKIPPED, og falls back to system-ui.");
} else {
  for (const mode of ["light", "dark"]) {
    const file = mode === "light" ? "genauly-wordmark.png" : "genauly-wordmark-dark.png";
    writeFileSync(join(pub, file), await renderWordmark(page, mode, interB64));
    console.log(`✓ ${file} (wordmark, transparent)`);
  }
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(ogHtml(BB, interB64), { waitUntil: "networkidle" });
await page.waitForTimeout(200);
writeFileSync(join(pub, "og-image.png"), await page.screenshot({ clip: { x: 0, y: 0, width: 1200, height: 630 } }));
console.log("✓ og-image.png (1200x630)");

writeFileSync(join(root, "preview/branding/genauly-logo-final.svg"), canonicalSvg(BB));
console.log("✓ preview/branding/genauly-logo-final.svg");

await browser.close();
