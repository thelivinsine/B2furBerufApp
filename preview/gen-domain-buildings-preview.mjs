// Review-sheet generator for the six domain-building SVG marks (redesign
// task 3.1). Emits domain-buildings-preview.svg with light/dark panels and
// unlit/lit rows. Run: node preview/gen-domain-buildings-preview.mjs
//
// NOTE: the geometry here mirrors src/components/city/domain-buildings.tsx,
// which is the source of truth. If you edit a mark there, update the same
// shapes here and regenerate the sheet.

// Reward-gold tokens resolved to hex for the static preview
// (in-app the marks use hsl(var(--reward)) so they adapt to dark mode).
const REWARD_LIGHT = "#db8d06"; // hsl(38 95% 44%)
const REWARD_DARK = "#e8a33d"; // hsl(36 79% 57%)

// win(o) -> fill attrs for a glow element with unlit opacity o
const mk = (reward) => ({
  win: (lit, o) => (lit ? `fill="${reward}"` : `fill="#fff" opacity="${o}"`),
  reward,
});

const BUILDINGS = [
  {
    id: "buero",
    label: "Büro",
    color: "#5b5be6",
    box: [3.4, 2.6, 14, 14.6],
    weight: 1.0,
    render: (c, lit, { win }) => `
      <rect x="3.4" y="2.6" width="9.2" height="14.6" rx="0.9" fill="${c}" />
      <rect x="12.6" y="8.6" width="4.8" height="8.6" rx="0.9" fill="#22d3ee" />
      ${[4.6, 7.5, 10.4, 13.3]
        .map(
          (y) => `
      <rect x="5.2" y="${y}" width="2.1" height="1.7" rx="0.3" ${win(lit, 0.5)} />
      <rect x="8.6" y="${y}" width="2.1" height="1.7" rx="0.3" ${win(lit, 0.5)} />`
        )
        .join("")}
      <rect x="14" y="10.6" width="2.1" height="1.7" rx="0.3" ${win(lit, 0.8)} />
      <rect x="14" y="13.5" width="2.1" height="1.7" rx="0.3" ${win(lit, 0.8)} />`,
  },
  {
    id: "buergeramt",
    label: "Bürgeramt",
    color: "#64748b",
    box: [2.4, 2, 15.2, 15.2],
    weight: 0.98,
    render: (c, lit, { win }) => `
      <path d="M10 2 2.4 7.2H17.6L10 2Z" fill="#fbbf24" />
      <circle cx="10" cy="5.5" r="0.9" fill="#fff" opacity="0.75" />
      <rect x="3.2" y="7.2" width="13.6" height="1.4" rx="0.3" fill="${c}" />
      ${[5.8, 9.2, 12.6]
        .map(
          (x) => `
      <rect x="${x}" y="8.6" width="1.6" height="6.9" ${
        lit ? `fill="REWARD"` : `fill="${c}" opacity="0.28"`
      } />`
        )
        .join("")}
      ${[4.0, 7.4, 10.8, 14.2]
        .map((x) => `
      <rect x="${x}" y="8.6" width="1.8" height="6.9" fill="${c}" />`)
        .join("")}
      <rect x="2.4" y="15.5" width="15.2" height="1.7" rx="0.4" fill="${c}" />`,
  },
  {
    id: "bank",
    label: "Bank",
    color: "#0ea5e9",
    box: [2.4, 4.8, 15.2, 12.4],
    weight: 0.96,
    render: (c, lit, { win }) => `
      <rect x="2.4" y="4.8" width="15.2" height="1.7" rx="0.5" fill="#67e8f9" />
      <rect x="3.2" y="6.5" width="13.6" height="9.2" fill="${c}" />
      <rect x="2.6" y="15.7" width="14.8" height="1.5" rx="0.4" fill="${c}" opacity="0.85" />
      <circle cx="10" cy="9.7" r="1.7" fill="none" stroke-width="1.25" ${
        lit ? `stroke="REWARD"` : `stroke="#fff" opacity="0.85"`
      } />
      <rect x="8.9" y="13.6" width="2.2" height="2.1" ${win(lit, 0.5)} />
      <rect x="4.6" y="12.4" width="1.9" height="1.9" rx="0.3" ${win(lit, 0.5)} />
      <rect x="13.5" y="12.4" width="1.9" height="1.9" rx="0.3" ${win(lit, 0.5)} />`,
  },
  {
    id: "arztpraxis",
    label: "Arztpraxis",
    color: "#e11d48",
    box: [2.6, 5, 14.8, 12.2],
    weight: 0.96,
    render: (c, lit, { win }) => `
      <rect x="2.6" y="5" width="14.8" height="1.7" rx="0.5" fill="#fb7185" />
      <rect x="3.4" y="6.7" width="13.2" height="10.5" fill="${c}" />
      <rect x="8.8" y="7.7" width="2.4" height="5.8" rx="0.4" ${win(lit, 0.95)} />
      <rect x="7.1" y="9.4" width="5.8" height="2.4" rx="0.4" ${win(lit, 0.95)} />
      <rect x="9.1" y="14.2" width="1.8" height="3" ${win(lit, 0.55)} />
      <rect x="4.8" y="14.2" width="2" height="1.9" rx="0.3" ${win(lit, 0.5)} />
      <rect x="13.2" y="14.2" width="2" height="1.9" rx="0.3" ${win(lit, 0.5)} />`,
  },
  {
    id: "wohnhaus",
    label: "Wohnhaus",
    color: "#0d9488",
    box: [2.6, 2.2, 14.8, 15],
    weight: 1.0,
    render: (c, lit, { win }) => `
      <rect x="13.4" y="3.6" width="1.9" height="3.4" fill="${c}" />
      <path d="M10 2.2 2.6 8.4H17.4L10 2.2Z" fill="#5eead4" />
      <rect x="4" y="8.4" width="12" height="8.8" fill="${c}" />
      <rect x="5.6" y="10" width="2.3" height="2.3" rx="0.3" ${win(lit, 0.55)} />
      <rect x="12.1" y="10" width="2.3" height="2.3" rx="0.3" ${win(lit, 0.55)} />
      <rect x="8.8" y="12.9" width="2.4" height="4.3" ${win(lit, 0.55)} />`,
  },
  {
    id: "pruefungshalle",
    label: "Prüfungshalle",
    color: "#c026d3",
    box: [2.2, 2.4, 15.6, 14.8],
    weight: 0.98,
    render: (c, lit, { win }) => `
      <path d="M2.8 9.6a7.2 7.2 0 0 1 14.4 0Z" fill="${c}" />
      <rect x="2.2" y="9.6" width="15.6" height="1.5" rx="0.4" fill="#f0abfc" />
      <rect x="3" y="11.1" width="14" height="6.1" fill="${c}" opacity="0.85" />
      <circle cx="10" cy="6.4" r="1.8" ${win(lit, 0.85)} />
      <path d="M4.9 17.2v-2.2a1.1 1.1 0 0 1 2.2 0v2.2Z" ${win(lit, 0.5)} />
      <path d="M8.9 17.2v-2.2a1.1 1.1 0 0 1 2.2 0v2.2Z" ${win(lit, 0.5)} />
      <path d="M12.9 17.2v-2.2a1.1 1.1 0 0 1 2.2 0v2.2Z" ${win(lit, 0.5)} />`,
  },
];

const TARGET = 16;
const GROUND = 18;
function transform([x, , w, h], weight) {
  const s = (TARGET * weight) / Math.max(w, h);
  const cx = x + w / 2;
  return `translate(10 ${GROUND}) scale(${s.toFixed(4)}) translate(${(-cx).toFixed(4)} -17.2)`;
}

const CELL = 108;
const MARK = 88;

function panel(bg, fg, reward, title, rows, yOff) {
  const width = BUILDINGS.length * CELL + 40;
  let out = `<rect x="10" y="${yOff}" width="${width - 20}" height="${rows.length * (CELL + 26) + 46}" rx="14" fill="${bg}" />
  <text x="30" y="${yOff + 30}" font-family="system-ui" font-size="13" font-weight="600" fill="${fg}">${title}</text>`;
  rows.forEach(({ label, lit }, r) => {
    const y = yOff + 44 + r * (CELL + 26);
    BUILDINGS.forEach((b, i) => {
      const x = 30 + i * CELL;
      const helpers = mk(reward);
      const body = b
        .render(b.color, lit, helpers)
        .replaceAll('fill="REWARD"', `fill="${reward}"`)
        .replaceAll('stroke="REWARD"', `stroke="${reward}"`);
      out += `
  <svg x="${x}" y="${y}" width="${MARK}" height="${MARK}" viewBox="0 0 20 20" fill="none">
    <g transform="${transform(b.box, b.weight)}">${body}</g>
  </svg>
  <text x="${x + MARK / 2}" y="${y + MARK + 16}" text-anchor="middle" font-family="system-ui" font-size="11" fill="${fg}" opacity="0.75">${b.label}${lit ? " · lit" : ""}</text>`;
    });
  });
  return { out, height: rows.length * (CELL + 26) + 46 };
}

const width = BUILDINGS.length * CELL + 60;
const light = panel("#f8fafc", "#334155", REWARD_LIGHT, "Light · unlit / lit", [
  { lit: false },
  { lit: true },
], 10);
const dark = panel("#16161f", "#cbd5e1", REWARD_DARK, "Dark · unlit / lit", [
  { lit: false },
  { lit: true },
], 10 + light.height + 14);

const total = 10 + light.height + 14 + dark.height + 10;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${total}" viewBox="0 0 ${width} ${total}">
<rect width="${width}" height="${total}" fill="#fff" />
${light.out}
${dark.out}
</svg>`;

import { writeFileSync } from "node:fs";
writeFileSync(new URL("./domain-buildings-preview.svg", import.meta.url), svg);
console.log("wrote domain-buildings-preview.svg");
