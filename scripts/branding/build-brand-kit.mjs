#!/usr/bin/env node
/**
 * Genauly brand-kit generator (s133). Produces the full, self-contained kit
 * under `brand-kit/` from ONE source of truth: the same swipe + outlined-g
 * mark as `build-logo-assets.mjs`, the outlined "Genauly" wordmark
 * (`wordmark-data.mjs`), and the live design tokens parsed straight out of
 * `src/index.css`. Because color + logo are read from the app's own source,
 * the kit cannot drift from what ships.
 *
 * Outputs (all committed):
 *   brand-kit/logo/    mark, wordmark (ink/white), horizontal + stacked
 *                      lockups (ink/white), mono marks, clear-space guide
 *   brand-kit/color/   palette.svg swatch sheet, tokens.css, tokens.json
 *   brand-kit/type/    typography.svg specimen
 *   brand-kit/icons/   every favicon / PWA / apple-touch / maskable (copied)
 *   brand-kit/social/  og-image + a square avatar
 *   brand-kit/previews/ PNG contact sheets (rendered via Playwright if present)
 *
 * Pure-Node for the SVGs / tokens / copies (no browser needed). The PNG
 * preview sheets + avatar render via Playwright Chromium when available
 * (same dev-tooling contract as build-logo-assets.mjs); they are skipped with
 * a warning otherwise, so the core kit always builds. Not part of the app build.
 */
import { writeFileSync, copyFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { WORDMARK_PATH, WORDMARK_BBOX } from "./wordmark-data.mjs";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const KIT = join(root, "brand-kit");
const pub = join(root, "public");
for (const d of ["logo", "color", "type", "icons", "social", "previews"]) {
  mkdirSync(join(KIT, d), { recursive: true });
}

// ---- Brand constants (BRAND_SPEC §1/§3) ----
const PAPIER = "#FAF6EC";
const HIMMELBLAU = "#52C6F9";
const TINTE = "#1C1A24";
const NACHTBLAU = "#3D74ED";
const KORALLE = "#F0603F";
const SWIPE = "M 12 24 L 52 20 Q 57 23 55 30 L 54 45 L 13 49 Q 9 45 10 34 Z";
const G_PATH =
  "M31.50 56.06Q28.50 56.06 26.27 55.31Q24.03 54.55 22.65 53.19Q21.26 51.84 20.85 50.06L27.07 48.78Q27.27 49.40 27.83 49.92Q28.38 50.45 29.28 50.76Q30.19 51.08 31.46 51.08Q33.65 51.08 34.83 50.10Q36.01 49.11 36.01 47.06L36.01 43L35.46 43Q35.05 44.03 34.24 44.87Q33.43 45.71 32.18 46.20Q30.94 46.69 29.24 46.69Q26.72 46.69 24.64 45.51Q22.56 44.33 21.31 41.86Q20.05 39.39 20.05 35.54Q20.05 31.52 21.35 28.91Q22.64 26.31 24.72 25.05Q26.80 23.79 29.22 23.79Q31.05 23.79 32.35 24.40Q33.65 25.02 34.50 25.99Q35.35 26.96 35.78 28.01L35.99 28.01L35.99 24.07L43.06 24.07L43.06 46.49Q43.06 49.65 41.60 51.78Q40.13 53.91 37.53 54.99Q34.92 56.06 31.50 56.06M31.68 41.44Q33.06 41.44 34.02 40.75Q34.98 40.05 35.50 38.70Q36.01 37.36 36.01 35.52Q36.01 33.63 35.50 32.25Q34.98 30.88 34.03 30.13Q33.08 29.38 31.68 29.38Q30.31 29.38 29.35 30.15Q28.40 30.92 27.91 32.30Q27.42 33.67 27.42 35.52Q27.42 37.36 27.91 38.69Q28.40 40.03 29.35 40.73Q30.31 41.44 31.68 41.44";

const svg = (vb, w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${body}</svg>\n`;

// Mark artwork (swipe + g) in the 64-unit space.
const MARK = `<path d="${SWIPE}" fill="${HIMMELBLAU}" transform="rotate(-3 32 32)"/><path d="${G_PATH}" fill="${TINTE}"/>`;
const markTile = () => `<rect width="64" height="64" rx="14" fill="${PAPIER}"/>${MARK}`;

// Wordmark normalized so its cap-top sits at y=0, left edge at x=0.
// After translate(-x1,-y1): width = x2-x1, height = y2-y1, baseline at 100-y1.
const WM_W = +(WORDMARK_BBOX.x2 - WORDMARK_BBOX.x1).toFixed(2); // ~406.25
const WM_H = +(WORDMARK_BBOX.y2 - WORDMARK_BBOX.y1).toFixed(2); // ~94.53
const wordmark = (fill) =>
  `<g transform="translate(${-WORDMARK_BBOX.x1} ${-WORDMARK_BBOX.y1})"><path d="${WORDMARK_PATH}" fill="${fill}"/></g>`;

// ---- LOGO ----
// mark (icon tile)
writeFileSync(join(KIT, "logo/mark.svg"), svg("0 0 64 64", 256, 256, markTile()));
// mono marks (single color, no tile): the swipe is filled and the g is KNOCKED
// OUT as negative space (a mask), so both elements stay legible in one ink.
// Reproduces the two-tone figure/ground with a single fill on any background.
const monoMark = (ink, id) =>
  `<defs><mask id="${id}">` +
  `<path d="${SWIPE}" fill="#fff" transform="rotate(-3 32 32)"/>` +
  `<path d="${G_PATH}" fill="#000"/>` +
  `</mask></defs>` +
  `<path d="${SWIPE}" fill="${ink}" transform="rotate(-3 32 32)" mask="url(#${id})"/>`;
writeFileSync(join(KIT, "logo/mark-mono-ink.svg"), svg("0 0 64 64", 256, 256, monoMark(TINTE, "ko")));
writeFileSync(join(KIT, "logo/mark-mono-white.svg"), svg("0 0 64 64", 256, 256, monoMark("#FFFFFF", "ko")));
// wordmark (ink / white)
writeFileSync(join(KIT, "logo/wordmark.svg"), svg(`0 0 ${WM_W} ${WM_H}`, Math.round(WM_W), Math.round(WM_H), wordmark(TINTE)));
writeFileSync(join(KIT, "logo/wordmark-white.svg"), svg(`0 0 ${WM_W} ${WM_H}`, Math.round(WM_W), Math.round(WM_H), wordmark("#FFFFFF")));

// Horizontal lockup: tile (64) + gap + wordmark scaled so cap-height ~40 aligns
// to the tile's optical center.
const capH = 100 - WORDMARK_BBOX.y1; // baseline distance from cap-top ~73.73
const kH = 40 / capH; // scale so cap-height = 40
const wmWs = WM_W * kH, wmHs = WM_H * kH;
const GAP = 22;
const wmX = 64 + GAP;
const wmY = 32 - 20; // cap-top so the cap block centers on tile mid (y=32)
const lockupH = (wmFill, textFill) => {
  const totalW = Math.ceil(wmX + wmWs);
  return svg(`0 0 ${totalW} 64`, totalW, 64,
    `${wmFill}<g transform="translate(${wmX} ${wmY}) scale(${kH.toFixed(4)})">${wordmark(textFill)}</g>`);
};
writeFileSync(join(KIT, "logo/lockup-horizontal.svg"), lockupH(markTile(), TINTE));
writeFileSync(join(KIT, "logo/lockup-horizontal-white.svg"), lockupH(markTile(), "#FFFFFF"));

// Stacked lockup: tile centered on top, wordmark centered beneath.
const kS = 30 / capH; // smaller wordmark for the stack
const wmWss = WM_W * kS, wmHss = WM_H * kS;
const stackW = Math.ceil(Math.max(64, wmWss));
const stackGap = 18;
const tileX = (stackW - 64) / 2;
const wmXs = (stackW - wmWss) / 2;
const wmYs = 64 + stackGap;
const stackH = Math.ceil(wmYs + wmHss);
writeFileSync(join(KIT, "logo/lockup-stacked.svg"),
  svg(`0 0 ${stackW} ${stackH}`, stackW, stackH,
    `<g transform="translate(${tileX.toFixed(2)} 0)">${markTile()}</g><g transform="translate(${wmXs.toFixed(2)} ${wmYs}) scale(${kS.toFixed(4)})">${wordmark(TINTE)}</g>`));

// Clear-space + min-size guide: mark with a padding frame = 0.25 tile all round.
const pad = 16; // 0.25 * 64
writeFileSync(join(KIT, "logo/clearspace.svg"),
  svg(`${-pad} ${-pad} ${64 + pad * 2} ${64 + pad * 2}`, 320, 320,
    `<rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="#F0E9D8"/>` +
    `<rect x="0" y="0" width="64" height="64" fill="none" stroke="#3D74ED" stroke-width="0.5" stroke-dasharray="2 2"/>` +
    `<rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="none" stroke="#B9B2A0" stroke-width="0.5" stroke-dasharray="3 3"/>` +
    markTile()));

// ---- COLOR: parse tokens from src/index.css ----
const css = readFileSync(join(root, "src/index.css"), "utf8");
function parseBlock(sel) {
  const start = css.indexOf(`${sel} {`);
  const end = css.indexOf("}", start);
  const out = {};
  for (const m of css.slice(start, end).matchAll(/--([\w-]+):\s*([\d.]+)\s+([\d.]+)%\s+([\d.]+)%/g)) {
    out[m[1]] = [Number(m[2]), Number(m[3]), Number(m[4])];
  }
  return out;
}
function hslToHex([h, s, l]) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(c * 255).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}
const light = parseBlock(":root");
const dark = parseBlock(".dark");

// tokens.json (hex, both themes)
const toHexMap = (m) => Object.fromEntries(Object.entries(m).map(([k, v]) => [k, hslToHex(v)]));
writeFileSync(join(KIT, "color/tokens.json"),
  JSON.stringify({ light: toHexMap(light), dark: toHexMap(dark) }, null, 2) + "\n");

// tokens.css (clean brand stylesheet)
const cssLines = (m) => Object.entries(m).map(([k, v]) => `  --${k}: ${v[0]} ${v[1]}% ${v[2]}%; /* ${hslToHex(v)} */`).join("\n");
writeFileSync(join(KIT, "color/tokens.css"),
  `/* Genauly design tokens (Kit 1 · Nachtblau & Himmelblau + Koralle).\n` +
  `   Generated from src/index.css. HSL is space-separated, ready for\n` +
  `   hsl(var(--token)). Regenerate with scripts/branding/build-brand-kit.mjs. */\n` +
  `:root {\n${cssLines(light)}\n}\n\n.dark {\n${cssLines(dark)}\n}\n`);

// palette.svg — named swatch sheet of the brand-relevant colors.
const SWATCHES = [
  ["Papier", "background", "Ground"],
  ["Tinte", "foreground", "Text"],
  ["Nachtblau", "primary", "Primär / Aktion"],
  ["Himmelblau", "accent", "Akzent / Swipe"],
  ["Koralle", "reward", "Belohnung / Serie"],
  ["Blatt", "success", "Erfolg"],
  ["Butter", "warning", "Warnung"],
  ["Rot", "danger", "Fehler"],
  ["Muted", "muted", "Fläche"],
  ["Lines", "border", "Linien"],
];
const SW = 220, SH = 96, COLS = 2, MARGIN = 32, GAPX = 24, GAPY = 20;
const rows = Math.ceil(SWATCHES.length / COLS);
const palW = MARGIN * 2 + COLS * SW + (COLS - 1) * GAPX;
const palH = 150 + rows * (SH + GAPY);
let sw = `<rect width="${palW}" height="${palH}" fill="${PAPIER}"/>` +
  `<text x="${MARGIN}" y="58" font-family="Inter,system-ui,sans-serif" font-size="30" font-weight="800" fill="${TINTE}">Genauly · Farbpalette</text>` +
  `<text x="${MARGIN}" y="88" font-family="Inter,system-ui,sans-serif" font-size="15" font-weight="500" fill="#6A6455">Kit 1 · Nachtblau &amp; Himmelblau + Koralle</text>`;
SWATCHES.forEach(([name, token, role], i) => {
  const hex = hslToHex(light[token]);
  const cx = MARGIN + (i % COLS) * (SW + GAPX);
  const cy = 130 + Math.floor(i / COLS) * (SH + GAPY);
  const textOnDark = ["foreground", "primary", "danger", "reward"].includes(token);
  const chipText = textOnDark ? "#FFFFFF" : TINTE;
  sw += `<g transform="translate(${cx} ${cy})">` +
    `<rect width="${SW}" height="${SH}" rx="12" fill="${hex}" stroke="#00000010"/>` +
    `<text x="16" y="30" font-family="Inter,system-ui,sans-serif" font-size="17" font-weight="700" fill="${chipText}">${name}</text>` +
    `<text x="16" y="52" font-family="Inter,system-ui,sans-serif" font-size="12" font-weight="500" fill="${chipText}" opacity="0.85">${role}</text>` +
    `<text x="16" y="78" font-family="ui-monospace,monospace" font-size="12" font-weight="600" fill="${chipText}" opacity="0.9">${hex} · --${token}</text>` +
    `</g>`;
});
writeFileSync(join(KIT, "color/palette.svg"), svg(`0 0 ${palW} ${palH}`, palW, palH, sw));

// ---- TYPE specimen ----
const typeBody =
  `<rect width="820" height="440" fill="${PAPIER}"/>` +
  `<text x="48" y="70" font-family="Inter,system-ui,sans-serif" font-size="28" font-weight="800" fill="${TINTE}">Typografie · Inter</text>` +
  `<text x="48" y="104" font-family="Inter,system-ui,sans-serif" font-size="15" font-weight="500" fill="#6A6455">Die eine Schrift: UI, Wortmarke und Fließtext. Variable, selbst gehostet.</text>` +
  `<text x="48" y="196" font-family="Inter,system-ui,sans-serif" font-size="76" font-weight="800" fill="${TINTE}" letter-spacing="-2">Genauly</text>` +
  `<text x="48" y="250" font-family="Inter,system-ui,sans-serif" font-size="20" font-weight="800" fill="${TINTE}">800 Display &amp; Wortmarke</text>` +
  `<text x="48" y="286" font-family="Inter,system-ui,sans-serif" font-size="20" font-weight="700" fill="${TINTE}">700 Überschriften</text>` +
  `<text x="48" y="322" font-family="Inter,system-ui,sans-serif" font-size="20" font-weight="600" fill="${TINTE}">600 UI-Beschriftungen</text>` +
  `<text x="48" y="358" font-family="Inter,system-ui,sans-serif" font-size="20" font-weight="400" fill="${TINTE}">400 Fließtext · The quick brown fox. Zwölf Boxkämpfer.</text>` +
  `<text x="48" y="410" font-family="ui-monospace,monospace" font-size="15" font-weight="500" fill="#6A6455">tabular-nums für Zahlen: 0123456789 · 1.623 Wörter</text>`;
writeFileSync(join(KIT, "type/typography.svg"), svg("0 0 820 440", 820, 440, typeBody));

// ---- ICONS (copy the shipped raster set) ----
const ICONS = [
  "genauly-default-logo-transparent-corners.png",
  "favicon-16.png", "favicon-32.png", "favicon-48.png",
  "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png",
  "pwa-maskable-512x512.png",
];
for (const f of ICONS) {
  if (existsSync(join(pub, f))) copyFileSync(join(pub, f), join(KIT, "icons", f));
}
if (existsSync(join(pub, "og-image.png"))) copyFileSync(join(pub, "og-image.png"), join(KIT, "social/og-image.png"));

console.log("✓ SVG logos, lockups, palette, type specimen, tokens.css/json, copied icons");

// ---- PNG preview sheets + square avatar (Playwright, optional) ----
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { console.warn("! Playwright not found; skipping PNG preview sheets + avatar."); }

if (chromium) {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM || undefined });
  const renderSvgToPng = async (svgStr, w, h, out, transparent = false) => {
    const page = await browser.newPage({ deviceScaleFactor: 2 });
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(`<!doctype html><html><head><style>*{margin:0}html,body{width:${w}px;height:${h}px}svg{display:block;width:${w}px;height:${h}px}</style></head><body>${svgStr}</body></html>`, { waitUntil: "networkidle" });
    writeFileSync(join(KIT, out), await page.screenshot({ omitBackground: transparent }));
    await page.close();
  };
  // square social avatar: full-bleed Papier tile mark at 82%
  const k = 0.82, t = 32 - 32 * k;
  await renderSvgToPng(svg("0 0 64 64", 512, 512, `<rect width="64" height="64" fill="${PAPIER}"/><g transform="translate(${t} ${t}) scale(${k})">${MARK}</g>`), 512, 512, "social/avatar.png");
  // palette + type PNG previews
  await renderSvgToPng(readFileSync(join(KIT, "color/palette.svg"), "utf8"), palW, palH, "previews/palette.png");
  await renderSvgToPng(readFileSync(join(KIT, "type/typography.svg"), "utf8"), 820, 440, "previews/typography.png");
  // logo overview contact sheet
  const overview = `<!doctype html><html><head><style>
    body{margin:0;background:#F0E9D8;font-family:Inter,system-ui,sans-serif;padding:36px;width:1000px}
    h1{font-size:26px;font-weight:800;color:${TINTE};margin:0 0 4px}
    p{font-size:14px;color:#6A6455;margin:0 0 28px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
    .card{background:#fff;border:1px solid #E7DEC9;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:14px;box-shadow:0 4px 14px rgba(34,48,79,.06)}
    .card.dark{background:${TINTE}}
    .lbl{font-size:12px;font-weight:700;color:#3D74ED}.card.dark .lbl{color:#8AB0F9}
    img{display:block}.row{display:flex;align-items:center;gap:26px;flex-wrap:wrap}
  </style></head><body>
    <h1>Genauly · Logo</h1><p>g on the Himmelblau Textmarker swipe. Inter 800 wordmark.</p>
    <div class="grid">
      <div class="card"><span class="lbl">MARK</span><div class="row"><img src="logo/mark.svg" width="88"><img src="logo/mark.svg" width="52"><img src="logo/mark.svg" width="32"></div></div>
      <div class="card"><span class="lbl">WORDMARK</span><img src="logo/wordmark.svg" width="240"></div>
      <div class="card"><span class="lbl">HORIZONTAL LOCKUP</span><img src="logo/lockup-horizontal.svg" width="300"></div>
      <div class="card"><span class="lbl">STACKED LOCKUP</span><img src="logo/lockup-stacked.svg" width="150"></div>
      <div class="card dark"><span class="lbl">ON DARK</span><div class="row"><img src="logo/mark.svg" width="64"><img src="logo/wordmark-white.svg" width="220"></div></div>
      <div class="card"><span class="lbl">MONO</span><div class="row"><img src="logo/mark-mono-ink.svg" width="64"><img src="logo/clearspace.svg" width="120"></div></div>
    </div>
  </body></html>`;
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto("file://" + KIT + "/");
  await page.setContent(overview, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  writeFileSync(join(KIT, "previews/logo-overview.png"), await page.screenshot({ fullPage: true }));
  await page.close();
  await browser.close();
  console.log("✓ PNG previews (logo-overview, palette, typography) + social/avatar.png");
}

console.log("Brand kit written to brand-kit/");
