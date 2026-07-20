#!/usr/bin/env node
/**
 * Genauly brand-kit generator (s133; logo v2 refresh s138). Produces the full,
 * self-contained kit under `brand-kit/` from ONE source of truth: the same
 * swipe + outlined-g mark and lowercase "genauly" wordmark as
 * `build-logo-assets.mjs` (whose `public/genauly-wordmark*.png` this copies),
 * and the live design tokens parsed straight out of `src/index.css`. Because
 * color + logo are read from the app's own source, the kit cannot drift.
 *
 * Outputs (all committed):
 *   brand-kit/logo/    mark (light SVG) + mark-dark (two-tone SVG), wordmark
 *                      (light/dark PNG), horizontal + stacked lockups (PNG),
 *                      mono marks, app-icon tile, clear-space guide
 *   brand-kit/color/   palette.svg swatch sheet, tokens.css, tokens.json
 *   brand-kit/type/    typography.svg specimen
 *   brand-kit/icons/   every favicon / PWA / apple-touch / maskable (copied)
 *   brand-kit/social/  og-image + a square avatar
 *   brand-kit/previews/ PNG contact sheets (rendered via Playwright if present)
 *
 * Pure-Node for the SVG marks / tokens / palette / copies (no browser needed).
 * The wordmark is raster (live Inter, like the app), so the PNG lockups +
 * preview sheets + avatar render via Playwright Chromium when available (same
 * dev-tooling contract as build-logo-assets.mjs); they are skipped with a
 * warning otherwise, so the core kit always builds. Not part of the app build.
 */
import { writeFileSync, copyFileSync, mkdirSync, existsSync, readFileSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(dirname(fileURLToPath(import.meta.url))));
const KIT = join(root, "brand-kit");
const pub = join(root, "public");
for (const d of ["logo", "color", "type", "icons", "social", "previews"]) {
  mkdirSync(join(KIT, d), { recursive: true });
}

// ---- Brand constants (BRAND_SPEC §1/§3) ----
const PAPIER = "#FAF6EC";
// Logo swipe: Himmel Soft (logo v2 rework 2026-07-20; softer than the app's
// Himmelblau --accent token #52C6F9, which is unchanged).
const HIMMELBLAU = "#8CDBFB";
const TINTE = "#1C1A24";
const SWIPE = "M 12 24 L 52 20 Q 57 23 55 30 L 54 45 L 13 49 Q 9 45 10 34 Z";
const G_PATH =
  "M31.50 56.06Q28.50 56.06 26.27 55.31Q24.03 54.55 22.65 53.19Q21.26 51.84 20.85 50.06L27.07 48.78Q27.27 49.40 27.83 49.92Q28.38 50.45 29.28 50.76Q30.19 51.08 31.46 51.08Q33.65 51.08 34.83 50.10Q36.01 49.11 36.01 47.06L36.01 43L35.46 43Q35.05 44.03 34.24 44.87Q33.43 45.71 32.18 46.20Q30.94 46.69 29.24 46.69Q26.72 46.69 24.64 45.51Q22.56 44.33 21.31 41.86Q20.05 39.39 20.05 35.54Q20.05 31.52 21.35 28.91Q22.64 26.31 24.72 25.05Q26.80 23.79 29.22 23.79Q31.05 23.79 32.35 24.40Q33.65 25.02 34.50 25.99Q35.35 26.96 35.78 28.01L35.99 28.01L35.99 24.07L43.06 24.07L43.06 46.49Q43.06 49.65 41.60 51.78Q40.13 53.91 37.53 54.99Q34.92 56.06 31.50 56.06M31.68 41.44Q33.06 41.44 34.02 40.75Q34.98 40.05 35.50 38.70Q36.01 37.36 36.01 35.52Q36.01 33.63 35.50 32.25Q34.98 30.88 34.03 30.13Q33.08 29.38 31.68 29.38Q30.31 29.38 29.35 30.15Q28.40 30.92 27.91 32.30Q27.42 33.67 27.42 35.52Q27.42 37.36 27.91 38.69Q28.40 40.03 29.35 40.73Q30.31 41.44 31.68 41.44";

const svg = (vb, w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" width="${w}" height="${h}">${body}</svg>\n`;

// The mark's true bbox (swipe ∪ g), measured in build-logo-assets.mjs; used to
// center the app-icon tile at the "Größer" margin, matching the shipped icons.
const MARK_BBOX = { x: 9.2, y: 18.78, w: 47.23, h: 37.28 };
const TILE_MARGIN = 0.12; // "Größer" (matches build-logo-assets.mjs)
function centerTransform(bb, margin) {
  const s = (64 * (1 - 2 * margin)) / Math.max(bb.w, bb.h);
  const tx = 32 - s * (bb.x + bb.w / 2);
  const ty = 32 - s * (bb.y + bb.h / 2);
  const r = (n) => Math.round(n * 1000) / 1000;
  return `translate(${r(tx)} ${r(ty)}) scale(${r(s)})`;
}

// Mark artwork (swipe + g) in the 64-unit space. The LOGO is tile-less
// (transparent). On light grounds the g is ink; on dark grounds the mark is
// TWO-TONE (ink where the g sits on the swipe, white where it falls off — only
// the descender), matching the shipped logo. `markTiled` (Papier tile, Größer-
// centered) is the app-icon reference only, not the logo.
const markG = (g) => `<path d="${SWIPE}" fill="${HIMMELBLAU}" transform="rotate(-3 32 32)"/><path d="${G_PATH}" fill="${g}"/>`;
const markTwoTone = (id = "swd") =>
  `<defs><clipPath id="${id}"><path d="${SWIPE}" transform="rotate(-3 32 32)"/></clipPath></defs>` +
  `<path d="${SWIPE}" fill="${HIMMELBLAU}" transform="rotate(-3 32 32)"/>` +
  `<path d="${G_PATH}" fill="#FFFFFF"/>` +
  `<path d="${G_PATH}" fill="${TINTE}" clip-path="url(#${id})"/>`;
const MARK = markG(TINTE); // tile-less light (ink g)
const MARK_DARK = markTwoTone(); // tile-less dark (two-tone: ink bowl, white descender)
const markTiled = () => `<rect width="64" height="64" rx="14" fill="${PAPIER}"/><g transform="${centerTransform(MARK_BBOX, TILE_MARGIN)}">${markG(TINTE)}</g>`;

// ---- LOGO ----
writeFileSync(join(KIT, "logo/mark.svg"), svg("0 0 64 64", 256, 256, MARK));
writeFileSync(join(KIT, "logo/mark-dark.svg"), svg("0 0 64 64", 256, 256, MARK_DARK));
writeFileSync(join(KIT, "logo/app-icon-tile.svg"), svg("0 0 64 64", 256, 256, markTiled()));
// mono marks (single color, no tile): the swipe is filled and the g is KNOCKED
// OUT as negative space (a mask), so both elements stay legible in one ink.
const monoMark = (ink, id) =>
  `<defs><mask id="${id}">` +
  `<path d="${SWIPE}" fill="#fff" transform="rotate(-3 32 32)"/>` +
  `<path d="${G_PATH}" fill="#000"/>` +
  `</mask></defs>` +
  `<path d="${SWIPE}" fill="${ink}" transform="rotate(-3 32 32)" mask="url(#${id})"/>`;
writeFileSync(join(KIT, "logo/mark-mono-ink.svg"), svg("0 0 64 64", 256, 256, monoMark(TINTE, "ko")));
writeFileSync(join(KIT, "logo/mark-mono-white.svg"), svg("0 0 64 64", 256, 256, monoMark("#FFFFFF", "ko")));

// Wordmark: the lowercase "genauly" with the swipe under "genau". It is set in
// live Inter (the swipe splits the g into two tones on dark), so, exactly like
// the app, it ships as PNG — an outlined path would need font-outlining tooling
// and an SVG <text> would fall back off-platform. Copy the shipped assets.
for (const [src, dst] of [
  ["genauly-wordmark.png", "logo/wordmark.png"],
  ["genauly-wordmark-dark.png", "logo/wordmark-dark.png"],
]) {
  if (existsSync(join(pub, src))) copyFileSync(join(pub, src), join(KIT, dst));
}
// The lockups (mark + wordmark) are raster composites too; they render in the
// Playwright block below. Remove the stale capital-G vector wordmark + lockups.
for (const stale of ["wordmark.svg", "wordmark-white.svg", "lockup-horizontal.svg", "lockup-horizontal-white.svg", "lockup-stacked.svg"]) {
  rmSync(join(KIT, "logo", stale), { force: true });
}

// Clear-space + min-size guide: mark with a padding frame = 0.25 tile all round.
const pad = 16; // 0.25 * 64
writeFileSync(join(KIT, "logo/clearspace.svg"),
  svg(`${-pad} ${-pad} ${64 + pad * 2} ${64 + pad * 2}`, 320, 320,
    `<rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="#F0E9D8"/>` +
    `<rect x="0" y="0" width="64" height="64" fill="none" stroke="#3D74ED" stroke-width="0.5" stroke-dasharray="2 2"/>` +
    `<rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="none" stroke="#B9B2A0" stroke-width="0.5" stroke-dasharray="3 3"/>` +
    MARK));

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
  ["Himmel Soft", "accent", "Akzent / Swipe"],
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
  "genauly-logo.png",
  "genauly-logo-dark.png",
  "favicon-16.png", "favicon-32.png", "favicon-48.png",
  "apple-touch-icon.png", "pwa-192x192.png", "pwa-512x512.png",
  "pwa-maskable-512x512.png",
];
for (const f of ICONS) {
  if (existsSync(join(pub, f))) copyFileSync(join(pub, f), join(KIT, "icons", f));
}
if (existsSync(join(pub, "og-image.png"))) copyFileSync(join(pub, "og-image.png"), join(KIT, "social/og-image.png"));

console.log("✓ SVG marks + mono, wordmark PNGs, palette, type specimen, tokens.css/json, copied icons");

// ---- PNG preview sheets + square avatar (Playwright, optional) ----
let chromium;
try { ({ chromium } = await import("playwright")); }
catch { console.warn("! Playwright not found; skipping PNG lockups + preview sheets + avatar."); }

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
    <h1>Genauly · Logo</h1><p>Lowercase g on the Himmel Soft Textmarker swipe. Inter 800 wordmark.</p>
    <div class="grid">
      <div class="card"><span class="lbl">MARK</span><div class="row"><img src="logo/mark.svg" width="88"><img src="logo/mark.svg" width="52"><img src="logo/mark.svg" width="32"></div></div>
      <div class="card"><span class="lbl">WORDMARK</span><img src="logo/wordmark.png" width="240"></div>
      <div class="card"><span class="lbl">HORIZONTAL LOCKUP</span><img src="logo/lockup-horizontal.png" width="300"></div>
      <div class="card"><span class="lbl">STACKED LOCKUP</span><img src="logo/lockup-stacked.png" width="150"></div>
      <div class="card dark"><span class="lbl">ON DARK</span><div class="row"><img src="logo/mark-dark.svg" width="64"><img src="logo/wordmark-dark.png" width="220"></div></div>
      <div class="card"><span class="lbl">MONO</span><div class="row"><img src="logo/mark-mono-ink.svg" width="64"><img src="logo/clearspace.svg" width="120"></div></div>
    </div>
  </body></html>`;

  // Raster lockups: mark (SVG, data-URI) + wordmark (PNG, data-URI), composited.
  const asDataUri = (p, mime) => `data:${mime};base64,${readFileSync(join(KIT, p)).toString("base64")}`;
  const lockup = async (markFile, wmFile, out, dark, stacked) => {
    const mark = asDataUri(markFile, "image/svg+xml");
    const wm = asDataUri(wmFile, "image/png");
    const dir = stacked ? "column" : "row";
    const gap = stacked ? 18 : 26;
    const markPx = stacked ? 96 : 76;
    const wmPx = stacked ? 150 : 168; // wordmark width; height auto (~3.97:1)
    const pad = 28;
    const html = `<!doctype html><html><head><style>*{margin:0}
      body{display:inline-flex;flex-direction:${dir};align-items:center;gap:${gap}px;padding:${pad}px;background:transparent}
      .m{width:${markPx}px;height:${markPx}px}.w{width:${wmPx}px;height:auto;display:block}
    </style></head><body><img class="m" src="${mark}"><img class="w" src="${wm}"></body></html>`;
    const pg = await browser.newPage({ deviceScaleFactor: 3 });
    await pg.setContent(html, { waitUntil: "networkidle" });
    const el = await pg.$("body");
    writeFileSync(join(KIT, out), await el.screenshot({ omitBackground: true }));
    await pg.close();
  };
  await lockup("logo/mark.svg", "logo/wordmark.png", "logo/lockup-horizontal.png", false, false);
  await lockup("logo/mark-dark.svg", "logo/wordmark-dark.png", "logo/lockup-horizontal-dark.png", true, false);
  await lockup("logo/mark.svg", "logo/wordmark.png", "logo/lockup-stacked.png", false, true);

  const page = await browser.newPage({ deviceScaleFactor: 2 });
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto("file://" + KIT + "/");
  await page.setContent(overview, { waitUntil: "networkidle" });
  await page.waitForTimeout(200);
  writeFileSync(join(KIT, "previews/logo-overview.png"), await page.screenshot({ fullPage: true }));
  await page.close();
  await browser.close();
  console.log("✓ PNG lockups (horizontal/-dark/stacked) + previews (logo-overview, palette, typography) + social/avatar.png");
}

console.log("Brand kit written to brand-kit/");
