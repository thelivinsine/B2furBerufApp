import { writeFileSync, mkdirSync } from "node:fs";

/* Brand tokens (from src/index.css) */
const INDIGO = "#5b5be6";
const INDIGO_SOFT = "#ece9fd";
const CYAN = "#10b7cf";
const GREY = "#9aa3b2";
const TXT = "#1f2430";
const SURFACE = "#ffffff";
const SCREENBG = "#fbfbfe";
const CARD = "#f1f2f7";
const FONT = "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif";

const ICONS = {
  home: `<path d="M3.5 11 12 4l8.5 7"/><path d="M5.8 9.5V19a1 1 0 0 0 1 1H9.5v-5.2h5V20h2.7a1 1 0 0 0 1-1V9.5"/>`,
  book: `<path d="M5.6 5.2A1.7 1.7 0 0 1 7.3 3.5H18.4v14H7.3a1.7 1.7 0 0 0-1.7 1.7Z"/><path d="M5.6 18.2V5.2"/>`,
  quiz: `<path d="M9 6.5h9.4M9 12h9.4M9 17.5h9.4"/><path d="M4.3 6.1 5.5 7.3 7.6 5.1M4.3 11.6l1.2 1.2 2.1-2.2"/>`,
  chart: `<path d="M5 20.5V12M10 20.5V5M15 20.5V14.5M20 20.5V8.5"/>`,
  more: `<rect x="5.4" y="5.4" width="4.3" height="4.3" rx="1.3"/><rect x="14.3" y="5.4" width="4.3" height="4.3" rx="1.3"/><rect x="5.4" y="14.3" width="4.3" height="4.3" rx="1.3"/><rect x="14.3" y="14.3" width="4.3" height="4.3" rx="1.3"/>`,
  pen: `<path d="M5 19.1 6 15 16 5l3 3L9 18Z"/><path d="M13.5 7.5l3 3"/>`,
};

function icon(name, cx, cy, size, color, sw = 1.8) {
  const s = size / 24;
  const x = cx - size / 2;
  const y = cy - size / 2;
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>`;
}

const TABS = [
  { name: "home", label: "Dashboard" },
  { name: "book", label: "Wortschatz" },
  { name: "quiz", label: "Quiz" },
  { name: "chart", label: "Fortschritt" },
  { name: "more", label: "Mehr" },
];

function label(text, cx, y, color, size = 9.5, weight = 600) {
  return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}">${text}</text>`;
}

/* Phone shell + placeholder content shared by all concepts. */
function phone(px, py, pw, ph) {
  const cx = px + pw / 2;
  let s = "";
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="30" fill="${SURFACE}" stroke="#e7e9f0" stroke-width="1.5" filter="url(#soft)"/>`;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="30" fill="${SCREENBG}"/>`;
  // status bar
  s += `<text x="${px + 24}" y="${py + 31}" font-family="${FONT}" font-size="13" font-weight="700" fill="${TXT}">9:41</text>`;
  s += `<g fill="${TXT}"><rect x="${px + pw - 64}" y="${py + 22}" width="14" height="9" rx="2"/><rect x="${px + pw - 46}" y="${py + 22}" width="13" height="9" rx="2"/><rect x="${px + pw - 28}" y="${py + 21}" width="20" height="11" rx="3" opacity="0.35"/><rect x="${px + pw - 26}" y="${py + 23}" width="13" height="7" rx="1.5"/></g>`;
  // gradient banner
  s += `<rect x="${px + 16}" y="${py + 46}" width="${pw - 32}" height="72" rx="18" fill="url(#grad)"/>`;
  s += `<text x="${px + 34}" y="${py + 82}" font-family="${FONT}" font-size="18" font-weight="700" fill="#fff">Wortschatz</text>`;
  s += `<text x="${px + 34}" y="${py + 102}" font-family="${FONT}" font-size="11" font-weight="500" fill="#ffffffcc">490 Wörter · Karteikarten</text>`;
  // skeleton cards
  s += `<rect x="${px + 16}" y="${py + 132}" width="${pw - 32}" height="46" rx="12" fill="${CARD}"/>`;
  s += `<rect x="${px + 16}" y="${py + 186}" width="${pw - 32}" height="46" rx="12" fill="${CARD}"/>`;
  s += `<rect x="${px + 16}" y="${py + 240}" width="${pw - 80}" height="46" rx="12" fill="${CARD}" opacity="0.6"/>`;
  return { svg: s, cx };
}

function homeIndicator(px, pw, yb) {
  return `<rect x="${px + pw / 2 - 32}" y="${yb - 8}" width="64" height="4.5" rx="2.25" fill="#cfd3dc"/>`;
}

/* ---- Concept A: liquid-glass floating pill ---- */
function conceptA(px, py, pw, ph) {
  const yb = py + ph;
  let s = "";
  const h = 60, inset = 14, capY = yb - 18 - h;
  s += `<rect x="${px + inset}" y="${capY}" width="${pw - inset * 2}" height="${h}" rx="${h / 2}" fill="#ffffff" stroke="#e9e9f2" stroke-width="1.2" filter="url(#float)"/>`;
  s += `<rect x="${px + inset + 2}" y="${capY + 1.5}" width="${pw - inset * 2 - 4}" height="${h / 2}" rx="${h / 2}" fill="#ffffff" opacity="0.5"/>`;
  const iw = (pw - inset * 2) / 5;
  TABS.forEach((t, i) => {
    const cx = px + inset + iw * (i + 0.5);
    const active = i === 1;
    if (active) s += `<rect x="${cx - 25}" y="${capY + 8}" width="50" height="44" rx="15" fill="${INDIGO_SOFT}"/>`;
    s += icon(t.name, cx, capY + 23, 21, active ? INDIGO : GREY, active ? 2 : 1.8);
    s += label(t.label, cx, capY + 48, active ? INDIGO : GREY, 8.5, active ? 700 : 600);
  });
  s += homeIndicator(px, pw, yb);
  return s;
}

/* ---- Concept B: Material 3 bar with active indicator ---- */
function conceptB(px, py, pw, ph) {
  const yb = py + ph;
  const h = 80, barY = yb - h;
  let s = "";
  s += `<rect x="${px}" y="${barY}" width="${pw}" height="${h}" fill="#ffffff" filter="url(#topshadow)"/>`;
  s += `<line x1="${px}" y1="${barY}" x2="${px + pw}" y2="${barY}" stroke="#edeef3" stroke-width="1"/>`;
  const iw = pw / 5;
  TABS.forEach((t, i) => {
    const cx = px + iw * (i + 0.5);
    const active = i === 1;
    if (active) s += `<rect x="${cx - 27}" y="${barY + 13}" width="54" height="30" rx="15" fill="${INDIGO_SOFT}"/>`;
    s += icon(t.name, cx, barY + 28, 21, active ? INDIGO : GREY, active ? 2 : 1.8);
    s += label(t.label, cx, barY + 58, active ? INDIGO : GREY, 10, active ? 700 : 500);
  });
  s += homeIndicator(px, pw, yb);
  return s;
}

/* ---- Concept C: center raised action button ---- */
function conceptC(px, py, pw, ph) {
  const yb = py + ph;
  const h = 70, barY = yb - h;
  let s = "";
  s += `<rect x="${px}" y="${barY}" width="${pw}" height="${h}" fill="#ffffff" filter="url(#topshadow)"/>`;
  s += `<line x1="${px}" y1="${barY}" x2="${px + pw}" y2="${barY}" stroke="#edeef3" stroke-width="1"/>`;
  const side = [
    { ...TABS[0], cx: px + pw * 0.14 },
    { ...TABS[1], cx: px + pw * 0.34 },
    { ...TABS[3], cx: px + pw * 0.66 },
    { ...TABS[4], cx: px + pw * 0.86 },
  ];
  side.forEach((t, idx) => {
    const active = idx === 1;
    s += icon(t.name, t.cx, barY + 27, 21, active ? INDIGO : GREY, active ? 2 : 1.8);
    s += label(t.label, t.cx, barY + 50, active ? INDIGO : GREY, 9, active ? 700 : 500);
  });
  // raised FAB
  const fx = px + pw / 2, fy = barY;
  s += `<circle cx="${fx}" cy="${fy}" r="30" fill="#ffffff"/>`;
  s += `<circle cx="${fx}" cy="${fy}" r="26" fill="url(#grad)" filter="url(#fab)"/>`;
  s += icon("pen", fx, fy, 23, "#ffffff", 2);
  s += label("Üben", fx, barY + 50, INDIGO, 9, 700);
  s += homeIndicator(px, pw, yb);
  return s;
}

/* ---- Concept D: expanding selected pill (icon-only inactive) ---- */
function conceptD(px, py, pw, ph) {
  const yb = py + ph;
  const h = 70, barY = yb - h;
  let s = "";
  s += `<rect x="${px}" y="${barY}" width="${pw}" height="${h}" fill="#ffffff" filter="url(#topshadow)"/>`;
  s += `<line x1="${px}" y1="${barY}" x2="${px + pw}" y2="${barY}" stroke="#edeef3" stroke-width="1"/>`;
  const iconSlot = 34, gap = 9, activeW = 112;
  const total = iconSlot * 4 + activeW + gap * 4;
  let x = px + (pw - total) / 2;
  const cy = barY + 34;
  TABS.forEach((t, i) => {
    const active = i === 1;
    if (active) {
      s += `<rect x="${x}" y="${cy - 22}" width="${activeW}" height="44" rx="22" fill="${INDIGO}"/>`;
      s += icon(t.name, x + 26, cy, 21, "#ffffff", 2);
      s += `<text x="${x + 44}" y="${cy + 4.5}" font-family="${FONT}" font-size="13" font-weight="700" fill="#ffffff">${t.label}</text>`;
      x += activeW + gap;
    } else {
      s += icon(t.name, x + iconSlot / 2, cy, 21, GREY, 1.8);
      x += iconSlot + gap;
    }
  });
  s += homeIndicator(px, pw, yb);
  return s;
}

const CONCEPTS = [
  { fn: conceptA, name: "Concept A — Liquid Glass", desc: "Floating frosted pill, soft active highlight. iOS 18 feel." },
  { fn: conceptB, name: "Concept B — Material You", desc: "Full bar, pill indicator behind the active icon. Android M3." },
  { fn: conceptC, name: "Concept C — Center action", desc: "Raised gradient button for the main action (e.g. Üben)." },
  { fn: conceptD, name: "Concept D — Expanding pill", desc: "Icons only; the active tab expands to reveal its label." },
];

const CW = 600, CH = 520, COLS = 2;
const HEAD = 96;
const W = CW * COLS;
const H = HEAD + CH * 2;

let body = "";
CONCEPTS.forEach((c, i) => {
  const col = i % COLS, row = Math.floor(i / COLS);
  const x0 = col * CW, y0 = HEAD + row * CH;
  body += `<text x="${x0 + 40}" y="${y0 + 40}" font-family="${FONT}" font-size="20" font-weight="800" fill="${TXT}">${c.name}</text>`;
  body += `<text x="${x0 + 40}" y="${y0 + 62}" font-family="${FONT}" font-size="13" font-weight="500" fill="#737b8c">${c.desc}</text>`;
  const pw = 290, ph = 392;
  const px = x0 + (CW - pw) / 2, py = y0 + 84;
  const p = phone(px, py, pw, ph);
  body += p.svg;
  body += c.fn(px, py, pw, ph);
});

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${INDIGO}"/>
      <stop offset="1" stop-color="${CYAN}"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#1f2430" flood-opacity="0.10"/></filter>
    <filter id="float" x="-40%" y="-40%" width="180%" height="200%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#3b3b66" flood-opacity="0.20"/></filter>
    <filter id="topshadow" x="-20%" y="-60%" width="140%" height="200%"><feDropShadow dx="0" dy="-3" stdDeviation="5" flood-color="#1f2430" flood-opacity="0.06"/></filter>
    <filter id="fab" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="${INDIGO}" flood-opacity="0.45"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="#eef0f5"/>
  <text x="40" y="52" font-family="${FONT}" font-size="26" font-weight="800" fill="${TXT}">Bottom navigation — concept previews</text>
  <text x="40" y="76" font-family="${FONT}" font-size="14" font-weight="500" fill="#737b8c">Genauly brand colors · active tab shown on “Wortschatz”. Pick one (or mix) and I’ll build it.</text>
  ${body}
</svg>`;

mkdirSync(new URL("./", import.meta.url), { recursive: true });
writeFileSync(new URL("./bottom-nav-concepts.svg", import.meta.url), svg);

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Genauly · bottom-nav concepts</title>
<style>
  :root { color-scheme: light; }
  body { margin:0; background:#eef0f5; font-family:${FONT}; -webkit-text-size-adjust:100%; }
  .wrap { max-width:960px; margin:0 auto; padding:14px; }
  h1 { font-size:18px; color:${TXT}; margin:6px 2px 2px; }
  p.note { font-size:13px; color:#737b8c; margin:0 2px 14px; line-height:1.5; }
  .frame { background:#fff; border-radius:14px; box-shadow:0 8px 28px rgba(31,36,48,.12); overflow:hidden; }
  svg { width:100%; height:auto; display:block; }
</style>
</head>
<body>
  <div class="wrap">
    <h1>Bottom navigation — concept previews</h1>
    <p class="note">Pinch to zoom for detail. Active tab is shown on “Wortschatz”. Reply with the one you like (A, B, C, or D), or ask for a mix, and I’ll build it into the app.</p>
    <div class="frame">${svg}</div>
  </div>
</body>
</html>`;
writeFileSync(new URL("./bottom-nav-concepts.html", import.meta.url), html);
console.log("wrote preview/bottom-nav-concepts.svg + .html", svg.length, "bytes svg");
