/**
 * Generates `preview/pruefung-hub-redesign.html`.
 *
 * Session 189: the Prüfung zone (`/anwenden`) and the Modelltest page (`/exam`)
 * become ONE page whose header is a two-segment sliding-pill switcher, in the
 * Bibliothek language: "Module üben" | "Modelltest". Module üben holds the four
 * exam modules with their time; Modelltest holds the complete run plus Verlauf
 * and drops "Einzeln üben" (it moved into the first tab).
 *
 * Every pixel inside a `.screen` comes from the real tokens (src/index.css,
 * s187 "N3 Slate" dark + the tighter 8px corner scale). Review chrome is
 * deliberately a different palette so the mocked screens read as objects.
 *
 * Run: node preview/gen-pruefung-hub-redesign.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "pruefung-hub-redesign.html");

/* --------------------------------- icons --------------------------------- */

const svg = (paths, size = 20, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${paths}</svg>`;

const ICON = {
  lesen: (s) =>
    svg(`<path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>`, s),
  hoeren: (s) =>
    svg(`<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>`, s),
  schreiben: (s) =>
    svg(`<path d="M12 20h9"/><path d="M16.4 3.6a1 1 0 0 1 3 3L7.4 18.6a2 2 0 0 1-.9.5l-2.9.9a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>`, s),
  sprechen: (s) =>
    svg(`<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="11" rx="3"/>`, s),
  play: (s) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.53.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z"/></svg>`,
  clock: (s) => svg(`<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>`, s),
  chevR: (s) => svg(`<path d="m9 18 6-6-6-6"/>`, s),
  chevD: (s) => svg(`<path d="m6 9 6 6 6-6"/>`, s),
  arrowR: (s) => svg(`<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`, s),
  // Glyph set 2 ("Modern"): flatter, more geometric marks that stay legible at
  // 20 px and do not repeat the rounded-object look of the classic four.
  lesen2: (s) =>
    svg(`<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/>`, s),
  hoeren2: (s) =>
    svg(`<path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/>`, s),
  schreiben2: (s) =>
    svg(`<path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.4 2.6a1 1 0 0 1 3 3l-9 9a2 2 0 0 1-.9.5l-2.9.9a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>`, s),
  sprechen2: (s) =>
    svg(`<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z"/><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1"/>`, s),
};

/**
 * A module mark, both glyph sets at once. CSS shows the active set, so the
 * whole review page swaps marks from the control bar without re-rendering.
 */
const mark = (id, size) =>
  `<span class="g g1">${ICON[id](size)}</span><span class="g g2">${ICON[id + "2"](size)}</span>`;

/* ---------------------------------- data ---------------------------------- */

const MODULES = [
  { id: "lesen", label: "Lesen", desc: "3 Texte mit Aufgaben", min: 15 },
  { id: "hoeren", label: "Hören", desc: "2 Ansagen · Notizen", min: 10 },
  { id: "schreiben", label: "Schreiben", desc: "1 Aufgabe · voller Brief", min: 20, trainer: "Schreibtrainer" },
  { id: "sprechen", label: "Sprechen", desc: "1 Gespräch mit Partner", min: 7, trainer: "Sprechtrainer" },
];

const RUNS = [
  { date: "12. Juli", total: 78, parts: { lesen: 82, hoeren: 71, schreiben: 80, sprechen: 78 } },
  { date: "3. Juli", total: 64, parts: { lesen: 70, hoeren: 55, schreiben: 66, sprechen: 64 } },
  { date: "28. Juni", total: 55, parts: { lesen: 61, hoeren: 44, schreiben: 58, sprechen: 56 } },
];

const LEVELS = ["A2", "B1", "B2", "C1"];

/* ------------------------------ shared pieces ------------------------------ */

/** The new page header: two-segment sliding-pill switcher (Bibliothek recipe). */
const modeSwitch = (active, { full = true } = {}) => `
  <div class="modeswitch${full ? " full" : ""}" role="tablist" aria-label="Prüfung">
    <span class="pill" style="left:${active === "module" ? "4px" : "50%"}"></span>
    <button role="tab" aria-selected="${active === "module"}" aria-pressed="${active === "module"}">Module üben</button>
    <button role="tab" aria-selected="${active === "modelltest"}" aria-pressed="${active === "modelltest"}">Modelltest</button>
  </div>`;

/** Niveau, treatment 1: compact scope button (Option A). */
const niveauDropdown = () => `
  <button class="scopebtn" type="button">
    <span>Niveau</span><b class="tnum">B2</b>${ICON.chevD(15)}
  </button>`;

/** Niveau, treatment 2: the shipped 4-segment pill switcher (Options B/C). */
const niveauSwitch = (full) => `
  <div class="lvl${full ? " full" : ""}" role="group" aria-label="Niveau">
    <span class="pill" style="left:${full ? "50%" : "calc(4px + 2 * 46px)"};width:${full ? "calc(25% - 2px)" : "46px"}"></span>
    ${LEVELS.map((l) => `<button aria-pressed="${l === "B2"}">${l}</button>`).join("")}
  </div>`;

const timeChip = (min) =>
  `<span class="timechip tnum">${ICON.clock(13)}${min} Min</span>`;

/* ------------------------------ Module üben ------------------------------- */

/** Option A: 2x2 (mobile) / 4-up (desktop) grid of identical module cards. */
const modulesGridA = () => `
  <div class="grid4">
    ${MODULES.map(
      (m) => `
      <button class="modcard" type="button">
        <span class="tile lg ${m.id}">${mark(m.id, 22)}</span>
        <span class="modname">${m.label}</span>
        <span class="moddesc">${m.desc}</span>
        <span class="modfoot">
          ${timeChip(m.min)}
          <span class="chev">${ICON.chevR(16)}</span>
        </span>
      </button>`,
    ).join("")}
  </div>
  ${freiesUeben()}`;

/**
 * The two open trainers. They are not timed exam modules, so they sit in their
 * own quiet block instead of pretending to be a fifth and sixth module. Without
 * it they would be unreachable: this hub is their only entry point.
 */
const freiesUeben = () => `
  <div>
    <p class="eyebrow mut" style="margin:0 0 8px 2px">Freies Üben</p>
    <div class="card rowlist">
      <button class="row" type="button">
        <span class="tile schreiben">${mark("schreiben", 19)}</span>
        <span class="rowtext">
          <span class="rname">Schreibtrainer</span>
          <span class="rsub">Fokus, Kurz und Lang, ohne Uhr</span>
        </span>
        <span class="chev">${ICON.chevR(16)}</span>
      </button>
      <button class="row" type="button">
        <span class="tile sprechen">${mark("sprechen", 19)}</span>
        <span class="rowtext">
          <span class="rname">Sprechtrainer</span>
          <span class="rsub">Dialoge mit Coaching-Feedback</span>
        </span>
        <span class="chev">${ICON.chevR(16)}</span>
      </button>
    </div>
  </div>`;

/** Option B: one card, four rows, plus the same free-trainer pair. */
const modulesRowsB = () => `
  <div class="card rowlist">
    ${MODULES.map(
      (m) => `
      <button class="row" type="button">
        <span class="tile ${m.id}">${mark(m.id, 19)}</span>
        <span class="rowtext">
          <span class="rname">${m.label}</span>
          <span class="rsub">${m.desc}</span>
        </span>
        ${timeChip(m.min)}
        <span class="chev">${ICON.chevR(16)}</span>
      </button>`,
    ).join("")}
  </div>
  ${freiesUeben()}`;

/** Option C: four wide row-cards, each its own card. */
const modulesCardsC = () => `
  <div class="grid2">
    ${MODULES.map(
      (m) => `
      <button class="widecard" type="button">
        <span class="tile lg ${m.id}">${mark(m.id, 22)}</span>
        <span class="rowtext">
          <span class="rname">${m.label}</span>
          <span class="rsub">${m.desc}</span>
          ${m.trainer ? `<span class="wcTrainer">Trainer öffnen ${ICON.arrowR(12)}</span>` : ""}
        </span>
        <span class="wcRight">
          <span class="bigmin tnum">${m.min}</span>
          <span class="bigminlab">Min</span>
        </span>
      </button>`,
    ).join("")}
  </div>`;

/* ------------------------------- Modelltest -------------------------------- */

const partTrack = (withMinutes) => `
  <div class="track">
    ${MODULES.map(
      (m) => `
      <div class="tnode">
        <span class="dot tile ${m.id}">${mark(m.id, 19)}</span>
        <span class="lab">${m.label}</span>
        ${withMinutes ? `<span class="min tnum">${m.min} Min</span>` : ""}
      </div>`,
    ).join("")}
  </div>`;

const countdown = () =>
  `<span class="cdown tnum">${ICON.clock(14)}Noch 24 Tage bis zum 29. August</span>`;

const runBand = (variant) => {
  if (variant === "total") {
    return `
    <div class="card band">
      <div class="bandhead">
        <span class="totalmin tnum">52 Min gesamt</span>
        ${countdown()}
      </div>
      <div class="trackwrap">${partTrack(false)}</div>
      <div class="bandfoot">
        <button class="btn grad wide" type="button">${ICON.play(15)} Prüfung starten</button>
      </div>
    </div>`;
  }
  return `
    <div class="card band">
      <div class="bandhead">
        <p class="eyebrow mut">Komplette Prüfung</p>
        ${countdown()}
      </div>
      <div class="trackwrap">${partTrack(true)}</div>
      <div class="bandfoot">
        <button class="btn grad wide" type="button">${ICON.play(15)} Prüfung starten</button>
      </div>
    </div>`;
};

const verlaufRows = (openRow) => `
  <div class="rowlist">
    ${RUNS.map(
      (r, i) => `
      <div>
        <button class="row vrow" type="button">
          <span class="vdate tnum">${r.date}</span>
          <span class="mini">
            ${MODULES.map((m) => `<span><i class="bar-${m.id}" style="width:${r.parts[m.id]}%"></i></span>`).join("")}
          </span>
          <span class="badge ${r.total >= 60 ? "ok" : "mutedb"} tnum">${r.total} %</span>
          <span class="chev"${openRow && i === 0 ? ' style="transform:rotate(180deg)"' : ""}>${ICON.chevD(16)}</span>
        </button>
        ${
          openRow && i === 0
            ? `<div class="vopen">
                ${MODULES.map(
                  (m) => `<div><p class="vlab">${m.label}</p><p class="vval tnum">${r.parts[m.id]} %</p></div>`,
                ).join("")}
              </div>`
            : ""
        }
      </div>`,
    ).join("")}
  </div>`;

/**
 * Verlauf as a DISCLOSURE (founder, s189): closed at rest so the page never
 * scrolls when it opens, no matter how many runs are on record. Opening it is
 * the learner's own decision, and only then may the page grow past the screen.
 * Closed it states how many runs exist and nothing else: the scores live inside,
 * which keeps a result in exactly one place.
 */
const verlaufBlock = ({ open = false, openRow = false, summary = false } = {}) => `
  <div class="card verlauf">
    <button class="vhead" type="button" aria-expanded="${open}">
      <span class="eyebrow mut">Verlauf</span>
      <span class="vcount tnum">3 Durchläufe</span>
      <span class="chev"${open ? ' style="transform:rotate(180deg)"' : ""}>${ICON.chevD(16)}</span>
    </button>
    ${open ? `${summary ? verlaufSummary() : ""}${verlaufRows(openRow)}` : ""}
  </div>`;

/** Option C only: the opened Verlauf leads with three figures, then the rows. */
const verlaufSummary = () => `
  <div class="vsum">
    <div><p class="vlab">Letzter</p><p class="vsumval tnum">78 %</p></div>
    <span class="vsep"></span>
    <div><p class="vlab">Bester</p><p class="vsumval tnum">78 %</p></div>
    <span class="vsep"></span>
    <div><p class="vlab">Bestanden</p><p class="vsumval tnum">1 von 3</p></div>
  </div>`;

/* --------------------------------- screens -------------------------------- */

function screen(opt, tab, device, { open = false, openRow = false } = {}) {
  const desk = device === "desk";
  const header =
    opt === "A"
      ? `<div class="hdr row-between">${modeSwitch(tab, { full: !desk })}${niveauDropdown()}</div>`
      : opt === "B"
        ? `<div class="hdr stack2">${modeSwitch(tab)}${niveauSwitch(true)}</div>`
        : `<div class="hdr stack2">${modeSwitch(tab)}<div class="row-end">${niveauSwitch(!desk)}</div></div>`;

  const body =
    tab === "module"
      ? opt === "A"
        ? modulesGridA()
        : opt === "B"
          ? modulesRowsB()
          : modulesCardsC()
      : opt === "B"
        ? `${runBand("total")}${verlaufBlock({ open, openRow })}`
        : `${runBand("eyebrow")}${verlaufBlock({ open, openRow, summary: opt === "C" })}`;

  return `<div class="screen"><div class="inner"><div class="col">${header}${body}</div></div></div>`;
}

const frame = (opt, tab, device, label, state = {}) => `
  <div class="framebox ${device}">
    <p class="framelabel">${label}</p>
    <div class="frame ${device === "phone" ? "mob" : "desk"}${state.scroll ? " scrolls" : ""}">${screen(
      opt,
      tab,
      device === "phone" ? "mob" : "desk",
      state,
    )}</div>
  </div>`;

/* --------------------------------- options -------------------------------- */

const OPTIONS = [
  {
    key: "A",
    name: "Option A",
    title: "Kompakt",
    character:
      "The switcher and the level control share ONE header line. Niveau stops being a second pill row and becomes a small scope button, so only one control on the page has switcher rank.",
    notes: [
      "<b>Header.</b> Mode switcher left, <b>Niveau B2 ▾</b> right. Two different shapes for two different jobs: the switcher navigates, the small button narrows what is served. On a phone the switcher takes the full width and the level button sits under it, right aligned.",
      "<b>Module üben.</b> Four equal cards, 2×2 on a phone and 4 across on a desktop. Each card carries the module mark, its name, what it contains and its time. The whole card is the button.",
      "<b>All four cards are identical</b> in shape, and the two free trainers sit below them in their own small <b>Freies Üben</b> block, so nothing on the grid is a special case.",
      "<b>Modelltest.</b> The approved run band unchanged (four parts as a timeline, minutes on the nodes), then the closed Verlauf. \"Einzeln üben\" is gone: it is the other tab now.",
    ],
    cost: "Changes the level control the founder picked in s188 from a pill switcher to a small button.",
  },
  {
    key: "B",
    name: "Option B",
    title: "Bibliothek-treu",
    character:
      "Keeps every shipped control exactly as it is today: the Bibliothek switcher full width as the page header, the s188 Niveau pill switcher full width directly under it.",
    notes: [
      "<b>Header.</b> Two stacked full-width rows. Maximum consistency with what is already shipped, at the price of two grey tracks on top of each other before any content starts.",
      "<b>Module üben.</b> One card, four rows, the time on the right of each row. Below it a separate <b>Freies Üben</b> pair for the two open trainers, so the four modules stay purely the timed ones.",
      "<b>Modelltest.</b> The band states the time ONCE as <b>52 Min gesamt</b> and the timeline carries names only, which is the calmest version of the band.",
      "<b>Cheapest to build</b> and the least risk: nothing shipped is restyled, things only move.",
    ],
    cost: "Two full-width grey tracks stacked before the first content; the tallest header of the three.",
  },
  {
    key: "C",
    name: "Option C",
    title: "Prüfungstag",
    character:
      "The most spacious of the three. Full-width switcher as the header, Niveau right aligned under it, and each module is its own wide card with the time set as a number, not a chip.",
    notes: [
      "<b>Header.</b> Switcher full width, Niveau pinned to the right edge below it. One rank order, top to bottom: where am I, then what level.",
      "<b>Module üben.</b> Four wide cards (one column on a phone, two on a desktop). The minutes read as a large tabular number, which is what makes the page feel like exam day rather than a menu.",
      "<b>Modelltest.</b> Same band as A, but the opened Verlauf leads with three figures (last, best, how many passed) above the rows, still inside the one Verlauf block, so results stay in exactly one place on the page.",
      "<b>Schreiben and Sprechen</b> carry the trainer link inside their own card here, which is the alternative to the separate block A and B use.",
    ],
    cost: "Tallest content: four wide cards need more scrolling on a phone than a 2×2 grid.",
  },
];

/* ---------------------------------- page ---------------------------------- */

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prüfung hub redesign — three options</title>
<style>
  /* ---------------------------------------------------------------
     REVIEW CHROME (deliberately not the app palette, so the mocked
     app screens below read as separate objects).
     --------------------------------------------------------------- */
  :root {
    --c-ground: #eceef1; --c-panel: #ffffff; --c-ink: #191d24;
    --c-muted: #5c6672; --c-line: #d3d8de; --c-accent: #1f6f68; --c-chip: #e2e6ea;
  }
  [data-appearance="dark"] {
    --c-ground: #0e1013; --c-panel: #16191d; --c-ink: #e6e9ec;
    --c-muted: #98a1ab; --c-line: #292e35; --c-accent: #58bdb2; --c-chip: #212630;
  }
  * { box-sizing: border-box; }
  body { margin: 0; }
  .page {
    background: var(--c-ground); color: var(--c-ink);
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    font-size: 15px; line-height: 1.55; padding: 32px 24px 96px; min-height: 100vh;
  }
  .wrap { max-width: 1240px; margin: 0 auto; }
  h1, h2, h3 { text-wrap: balance; margin: 0; }
  h1 { font-size: 30px; font-weight: 800; letter-spacing: -0.02em; }
  h2 { font-size: 21px; font-weight: 700; letter-spacing: -0.01em; }
  h3 { font-size: 15px; font-weight: 700; }
  p { margin: 0; }
  .lede { color: var(--c-muted); max-width: 72ch; }
  .kicker { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; color: var(--c-accent); }
  .rule { height: 1px; background: var(--c-line); border: 0; margin: 34px 0 0; }

  .controls {
    position: sticky; top: 0; z-index: 20; display: flex; flex-wrap: wrap; align-items: center; gap: 18px;
    background: var(--c-panel); border: 1px solid var(--c-line); border-radius: 12px;
    padding: 12px 14px; margin: 22px 0 30px; box-shadow: 0 6px 18px -12px rgba(0,0,0,.4);
  }
  .ctl { display: flex; align-items: center; gap: 8px; }
  .ctl > span { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--c-muted); }
  .seg { display: inline-flex; background: var(--c-chip); border-radius: 9px; padding: 3px; gap: 2px; }
  .seg button {
    font: inherit; font-size: 13px; font-weight: 600; border: 0; background: transparent;
    color: var(--c-muted); padding: 5px 12px; border-radius: 7px; cursor: pointer; transition: background .14s, color .14s;
  }
  .seg button[aria-pressed="true"] { background: var(--c-panel); color: var(--c-ink); box-shadow: 0 1px 3px rgba(0,0,0,.16); }
  .seg button:focus-visible { outline: 2px solid var(--c-accent); outline-offset: 2px; }

  .panel { background: var(--c-panel); border: 1px solid var(--c-line); border-radius: 12px; padding: 20px 22px; }
  .panel + .panel { margin-top: 16px; }
  .findings { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); margin-top: 14px; }
  .finding { display: flex; gap: 11px; align-items: flex-start; }
  .finding b { display: block; font-size: 14px; }
  .finding p { font-size: 13.5px; color: var(--c-muted); }
  .num {
    flex: none; width: 22px; height: 22px; border-radius: 7px; background: var(--c-chip);
    color: var(--c-accent); font-size: 12px; font-weight: 700; display: grid; place-items: center; font-variant-numeric: tabular-nums;
  }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--c-line); vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: var(--c-muted); font-weight: 700; }
  td:first-child { font-weight: 600; }
  tr:last-child td { border-bottom: 0; }
  .tablewrap { overflow-x: auto; }

  .option { margin-top: 46px; }
  .opthead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 12px; margin-bottom: 4px; }
  .optname {
    font-size: 12px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase;
    color: var(--c-panel); background: var(--c-accent); padding: 3px 9px; border-radius: 6px;
  }
  .framerow { display: flex; flex-wrap: wrap; gap: 22px; margin-top: 20px; align-items: flex-start; }
  .framebox.phone { flex: 0 0 auto; }
  .framebox.desk { flex: 1 1 100%; }
  .notecol { flex: 1 1 380px; min-width: 280px; }
  .framelabel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--c-muted); margin: 0 0 7px; }
  .frame { border: 1px solid var(--c-line); border-radius: 14px; overflow: hidden; }
  .frame.desk .screen { padding: 26px 24px 32px; }
  .frame.desk .inner { max-width: 1152px; margin: 0 auto; }
  /* The phone frame is the REAL content area a 393×852 phone leaves between the
     app header and the bottom tab bar (668 px), and it does NOT scroll: if a
     screen did not fit, it would visibly overflow here. */
  .frame.mob { width: 372px; }
  .frame.mob .screen { padding: 16px 15px 20px; height: 668px; overflow: hidden; }
  .frame.mob.scrolls .screen { overflow-y: auto; }
  .fitnote { font-size: 12px; color: var(--c-muted); margin-top: 7px; }
  .note { font-size: 13.5px; color: var(--c-muted); }
  .note + .note { margin-top: 10px; }
  .note b { color: var(--c-ink); font-weight: 650; }
  .cost { margin-top: 12px; font-size: 13px; color: var(--c-muted); border-left: 3px solid var(--c-line); padding-left: 10px; }
  .cost b { color: var(--c-ink); }

  /* ---------------------------------------------------------------
     APP TOKENS — verbatim from src/index.css (light + s187 "N3 Slate"
     dark) and tailwind.config.ts.
     --------------------------------------------------------------- */
  .screen {
    --background: 180 45% 98%;
    --page-from: 144 45% 98%; --page-mid: 150 50% 98%; --page-to: 198 83% 98%;
    --foreground: 252 16% 12%;
    --surface: 0 0% 100%; --elevated: 0 0% 100%;
    --muted: 220 13% 88%; --muted-foreground: 220 8% 36%;
    --border: 218 13% 84%;
    --primary: 221 83% 54%; --primary-foreground: 0 0% 100%;
    --accent: 197 93% 77%; --accent-ink: 198 90% 32%;
    --success: 153 55% 40%;
    --shadow: 221 40% 22%;
    --radius: 0.5rem;
    --wash-a: .10; --wash-b: .09;
    --gradient-from: 226 83% 47%; --gradient-to: 196 93% 38%;
    background:
      radial-gradient(at 0% 0%, hsl(var(--primary) / var(--wash-a)) 0px, transparent 50%),
      radial-gradient(at 0% 100%, hsl(var(--accent) / var(--wash-b)) 0px, transparent 50%),
      linear-gradient(120deg, hsl(var(--page-from)) 0%, hsl(var(--page-mid)) 38%, hsl(var(--page-to)) 100%);
    color: hsl(var(--foreground)); font-size: 16px; line-height: 1.5;
  }
  [data-appearance="dark"] .screen {
    --background: 220 15% 4%;
    --page-from: 220 15% 4%; --page-mid: 220 15% 4%; --page-to: 220 15% 4%;
    --foreground: 220 12% 94%;
    --surface: 220 10% 17%; --elevated: 220 9% 22%;
    --muted: 220 9% 25%; --muted-foreground: 220 8% 72%;
    --border: 220 10% 38%;
    --primary: 219 90% 74%; --primary-foreground: 228 30% 8%;
    --accent: 197 93% 77%; --accent-ink: 198 72% 72%;
    --success: 153 50% 52%;
    --shadow: 220 30% 2%;
    --wash-a: 0; --wash-b: 0;
    --gradient-from: 226 90% 66%; --gradient-to: 198 90% 58%;
  }


  /* ---------------------------------------------------------------
     MODULE MARKS — three colour sets, switched from the control bar.
     Every hue comes from a sanctioned brand family (blue/sky/cyan,
     emerald/teal/green, amber/orange/yellow, rose/pink).
     --------------------------------------------------------------- */

  /* C1 "Ruhig": no colour at all. The mark is a shape, the tile is the same
     recessed grey everywhere, and colour is left to the things that act
     (the CTA, the result bars). */
  [data-colors="c1"] .screen {
    --tile-lesen: hsl(var(--muted)); --ink-lesen: hsl(var(--foreground));
    --tile-hoeren: hsl(var(--muted)); --ink-hoeren: hsl(var(--foreground));
    --tile-schreiben: hsl(var(--muted)); --ink-schreiben: hsl(var(--foreground));
    --tile-sprechen: hsl(var(--muted)); --ink-sprechen: hsl(var(--foreground));
    --bar-lesen: hsl(var(--primary) / .45); --bar-hoeren: hsl(var(--primary) / .62);
    --bar-schreiben: hsl(var(--primary) / .8); --bar-sprechen: hsl(var(--primary));
  }

  /* C2 "Rezeptiv / Produktiv": the colour carries a fact. Lesen and Hören are
     the two receiving skills (green family), Schreiben and Sprechen the two
     producing ones (blue family), so the pairs read as pairs. */
  [data-colors="c2"] .screen {
    --tile-lesen: rgba(16,185,129,.12);  --ink-lesen: #047857;  --bar-lesen: #10b981;
    --tile-hoeren: rgba(20,184,166,.12); --ink-hoeren: #0f766e; --bar-hoeren: #14b8a6;
    --tile-schreiben: hsl(var(--primary) / .12); --ink-schreiben: hsl(var(--primary)); --bar-schreiben: hsl(var(--primary));
    --tile-sprechen: rgba(14,165,233,.12); --ink-sprechen: #0369a1; --bar-sprechen: #0ea5e9;
  }
  [data-appearance="dark"][data-colors="c2"] .screen {
    --tile-lesen: rgba(52,211,153,.16);  --ink-lesen: #6ee7b7;  --bar-lesen: #34d399;
    --tile-hoeren: rgba(45,212,191,.16); --ink-hoeren: #5eead4; --bar-hoeren: #2dd4bf;
    --tile-schreiben: hsl(var(--primary) / .18); --ink-schreiben: hsl(var(--primary)); --bar-schreiben: hsl(var(--primary));
    --tile-sprechen: rgba(56,189,248,.16); --ink-sprechen: #7dd3fc; --bar-sprechen: #38bdf8;
  }

  /* C3 "Vier Farben": four clearly separated hues, one per module, pushed
     further apart than today's teal/amber/blue/cyan (where the last two read
     as the same colour at 40 px). */
  [data-colors="c3"] .screen {
    --tile-lesen: rgba(16,185,129,.12);  --ink-lesen: #047857;  --bar-lesen: #10b981;
    --tile-hoeren: rgba(245,158,11,.13); --ink-hoeren: #b45309; --bar-hoeren: #f59e0b;
    --tile-schreiben: hsl(var(--primary) / .12); --ink-schreiben: hsl(var(--primary)); --bar-schreiben: hsl(var(--primary));
    --tile-sprechen: rgba(244,63,94,.11); --ink-sprechen: #be123c; --bar-sprechen: #f43f5e;
  }
  [data-appearance="dark"][data-colors="c3"] .screen {
    --tile-lesen: rgba(52,211,153,.16);  --ink-lesen: #6ee7b7;  --bar-lesen: #34d399;
    --tile-hoeren: rgba(251,191,36,.16); --ink-hoeren: #fbbf24; --bar-hoeren: #fbbf24;
    --tile-schreiben: hsl(var(--primary) / .18); --ink-schreiben: hsl(var(--primary)); --bar-schreiben: hsl(var(--primary));
    --tile-sprechen: rgba(251,113,133,.16); --ink-sprechen: #fda4af; --bar-sprechen: #fb7185;
  }

  /* Glyph set switch: both sets are in the DOM, one is shown. */
  .g { display: none; line-height: 0; }
  [data-marks="g1"] .g1, [data-marks="g2"] .g2 { display: inline-flex; }

  .markstage { border-radius: 12px; padding: 22px 18px; margin-top: 14px; }
  .markrow { display: flex; flex-wrap: wrap; gap: 26px; justify-content: center; }
  .markcell { display: flex; flex-direction: column; align-items: center; gap: 9px; }
  .marklab { font-size: 13.5px; font-weight: 600; color: hsl(var(--foreground)); }
  .tile.xl { width: 56px; height: 56px; border-radius: 14px; }

  .screen .col { display: flex; flex-direction: column; gap: 18px; }
  .frame.mob .screen { display: flex; }
  .frame.mob .screen .inner { flex: 1; min-height: 0; display: flex; }
  .frame.mob .screen .col { gap: 14px; flex: 1; min-height: 0; }
  .screen button { font: inherit; color: inherit; }

  .card {
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 10px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .eyebrow { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; }
  .eyebrow.mut { color: hsl(var(--muted-foreground)); }
  .tnum { font-variant-numeric: tabular-nums; }

  /* Header ------------------------------------------------------- */
  .hdr.row-between { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
  .hdr.stack2 { display: flex; flex-direction: column; gap: 10px; }
  .row-end { display: flex; justify-content: flex-end; }
  .frame.mob .hdr.row-between { flex-direction: column; align-items: stretch; gap: 10px; }
  .frame.mob .hdr.row-between .scopebtn { align-self: flex-end; }

  .modeswitch {
    position: relative; display: inline-flex; gap: 4px; padding: 4px;
    background: hsl(var(--muted)); border: 1px solid hsl(var(--border)); border-radius: 8px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .modeswitch.full { display: flex; width: 100%; }
  .modeswitch > button {
    position: relative; z-index: 1; flex: 1; border: 0; background: transparent; cursor: pointer;
    font-size: 15px; font-weight: 600; padding: 7px 22px; border-radius: 6px;
    color: hsl(var(--muted-foreground)); transition: color .14s ease; white-space: nowrap;
  }
  .modeswitch > button[aria-pressed="true"] { color: hsl(var(--foreground)); font-weight: 700; }
  .modeswitch > .pill {
    position: absolute; top: 4px; bottom: 4px; width: calc(50% - 4px); border-radius: 6px;
    background: hsl(var(--surface));
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .frame.desk .modeswitch:not(.full) { min-width: 320px; }

  .scopebtn {
    display: inline-flex; align-items: center; gap: 7px; height: 38px; padding: 0 10px 0 13px;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 8px; cursor: pointer;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
    font-size: 14px; white-space: nowrap;
  }
  .scopebtn > span { color: hsl(var(--muted-foreground)); }
  .scopebtn > b { font-weight: 700; }
  .scopebtn svg { color: hsl(var(--muted-foreground)); }

  .lvl {
    position: relative; display: inline-flex; gap: 2px; padding: 4px;
    background: hsl(var(--muted)); border: 1px solid hsl(var(--border)); border-radius: 8px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .lvl.full { display: flex; width: 100%; }
  .lvl.full > button { flex: 1; }
  .lvl > button {
    position: relative; z-index: 1; border: 0; background: transparent; cursor: pointer; width: 46px;
    font-size: 14px; font-weight: 600; padding: 6px 0; border-radius: 6px;
    color: hsl(var(--muted-foreground)); transition: color .14s ease;
  }
  .lvl > button[aria-pressed="true"] { color: hsl(var(--foreground)); }
  .lvl > .pill {
    position: absolute; top: 4px; bottom: 4px; border-radius: 6px; background: hsl(var(--surface));
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }

  /* Tiles + chips ------------------------------------------------ */
  .tile { flex: none; display: grid; place-items: center; width: 38px; height: 38px; border-radius: 10px; }
  .tile.lg { width: 44px; height: 44px; border-radius: 11px; }
  .tile.lesen { background: var(--tile-lesen); color: var(--ink-lesen); }
  .tile.hoeren { background: var(--tile-hoeren); color: var(--ink-hoeren); }
  .tile.schreiben { background: var(--tile-schreiben); color: var(--ink-schreiben); }
  .tile.sprechen { background: var(--tile-sprechen); color: var(--ink-sprechen); }

  .timechip {
    display: inline-flex; align-items: center; gap: 4px; flex: none;
    font-size: 12px; font-weight: 600; color: hsl(var(--muted-foreground));
    background: hsl(var(--muted)); border-radius: 6px; padding: 3px 8px;
  }
  .chev { color: hsl(var(--muted-foreground)); display: inline-flex; flex: none; }

  /* Option A module grid ----------------------------------------- */
  .grid4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
  .frame.mob .grid4 { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .modcard {
    display: flex; flex-direction: column; align-items: flex-start; gap: 0; text-align: left; cursor: pointer;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 14px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
    transition: transform .16s ease, box-shadow .16s ease;
  }
  .modcard:hover { transform: translateY(-2px); box-shadow: 0 2px 4px hsl(var(--shadow) / .08), 0 12px 24px -6px hsl(var(--shadow) / .16); }
  .modname { margin-top: 11px; font-size: 16px; font-weight: 650; }
  .moddesc { margin-top: 3px; font-size: 12.5px; color: hsl(var(--muted-foreground)); line-height: 1.35; }
  .modfoot { margin-top: auto; padding-top: 12px; width: 100%; display: flex; align-items: center; justify-content: space-between; }
  .modtrainer {
    margin-top: 10px; padding-top: 9px; width: 100%; border-top: 1px solid hsl(var(--border));
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 12.5px; font-weight: 500; color: hsl(var(--primary));
  }

  /* Option B rows ------------------------------------------------- */
  .rowlist { display: flex; flex-direction: column; overflow: hidden; }
  .rowlist > * + * { border-top: 1px solid hsl(var(--border)); }
  .row {
    display: flex; align-items: center; gap: 12px; padding: 12px 14px; width: 100%;
    background: transparent; border: 0; text-align: left; cursor: pointer; transition: background .14s ease;
  }
  .row:hover { background: hsl(var(--muted) / .4); }
  .rowtext { min-width: 0; flex: 1; display: block; }
  .rname { display: block; font-size: 15px; font-weight: 650; }
  .rsub { display: block; margin-top: 1px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }

  /* Option C wide cards ------------------------------------------ */
  .grid2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
  .frame.mob .grid2 { grid-template-columns: 1fr; gap: 12px; }
  .widecard {
    display: flex; align-items: center; gap: 14px; text-align: left; cursor: pointer; width: 100%;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 10px; padding: 14px 16px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
    transition: transform .16s ease, box-shadow .16s ease;
  }
  .widecard:hover { transform: translateY(-2px); box-shadow: 0 2px 4px hsl(var(--shadow) / .08), 0 12px 24px -6px hsl(var(--shadow) / .16); }
  .widecard .rname { font-size: 16px; }
  .wcTrainer { display: inline-flex; align-items: center; gap: 5px; margin-top: 6px; font-size: 12.5px; font-weight: 500; color: hsl(var(--primary)); }
  .wcRight { flex: none; display: flex; align-items: baseline; gap: 3px; }
  .bigmin { font-size: 24px; font-weight: 700; letter-spacing: -.02em; }
  .bigminlab { font-size: 12px; color: hsl(var(--muted-foreground)); }

  /* Run band ------------------------------------------------------ */
  .band { padding: 16px 18px 18px; display: flex; flex-direction: column; }
  .trackwrap { display: flex; flex-direction: column; justify-content: center; }
  .frame.mob:not(.scrolls) .band { flex: 1; }
  .frame.mob:not(.scrolls) .band .trackwrap { flex: 1; }
  .frame.mob .bandhead { flex-direction: column; align-items: flex-start; gap: 5px; }
  .bandhead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
  .totalmin { font-size: 15px; font-weight: 650; }
  .cdown { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: hsl(var(--muted-foreground)); }
  .cdown svg { flex: none; }
  .track { position: relative; display: flex; justify-content: space-between; margin-top: 16px; }
  .track::before { content: ""; position: absolute; left: 12.5%; right: 12.5%; top: 21px; height: 2px; background: hsl(var(--border)); }
  .tnode { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .tnode .dot { width: 44px; height: 44px; border-radius: 11px; border: 3px solid hsl(var(--surface)); }
  .tnode .lab { font-size: 13.5px; font-weight: 600; }
  .tnode .min { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
  .frame.mob .tnode .dot { width: 40px; height: 40px; }
  .frame.mob .tnode .lab { font-size: 12.5px; }
  .bandfoot { margin-top: 16px; padding-top: 16px; border-top: 1px solid hsl(var(--border)); display: flex; justify-content: flex-end; }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 8px; border: 0; border-radius: 6px;
    cursor: pointer; height: 42px; padding: 0 20px; font-size: 15px; font-weight: 500; white-space: nowrap;
  }
  .btn.grad {
    background: linear-gradient(135deg, hsl(var(--gradient-from)) 0%, hsl(var(--primary)) 45%, hsl(var(--gradient-to)) 100%);
    color: hsl(var(--primary-foreground));
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .frame.mob .btn.wide { width: 100%; }

  /* Verlauf -------------------------------------------------------- */
  .vrow { gap: 12px; }
  .vdate { flex: none; width: 66px; font-size: 13.5px; font-weight: 650; }
  .mini { display: flex; gap: 4px; flex: 1; min-width: 54px; max-width: 320px; }
  .mini > span { flex: 1; height: 5px; border-radius: 999px; background: hsl(var(--muted)); overflow: hidden; }
  .mini > span > i { display: block; height: 100%; border-radius: 999px; }
  .bar-lesen { background: var(--bar-lesen); } .bar-hoeren { background: var(--bar-hoeren); }
  .bar-schreiben { background: var(--bar-schreiben); } .bar-sprechen { background: var(--bar-sprechen); }
  .badge { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 10px; font-size: 12px; font-weight: 500; white-space: nowrap; flex: none; }
  .badge.ok { background: hsl(var(--success) / .15); color: hsl(var(--success)); }
  .badge.mutedb { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }
  .vopen { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 12px 14px; border-top: 1px solid hsl(var(--border)); }
  .vlab { font-size: 12px; color: hsl(var(--muted-foreground)); }
  .vval { margin-top: 2px; font-size: 14px; font-weight: 650; }
  .verlauf { overflow: hidden; }
  .vhead {
    display: flex; align-items: center; gap: 10px; width: 100%; padding: 13px 14px;
    background: transparent; border: 0; cursor: pointer; text-align: left; transition: background .14s ease;
  }
  .vhead:hover { background: hsl(var(--muted) / .4); }
  .vhead > .chev { margin-left: auto; transition: transform .16s ease; }
  .vcount { font-size: 13px; color: hsl(var(--muted-foreground)); }
  .verlauf > .rowlist { border-top: 1px solid hsl(var(--border)); }
  .vsum { display: flex; align-items: center; gap: 14px; padding: 13px 15px; border-top: 1px solid hsl(var(--border)); }
  .vsumval { margin-top: 1px; font-size: 19px; font-weight: 700; letter-spacing: -.02em; }
  .vsep { width: 1px; align-self: stretch; background: hsl(var(--border)); }

  @media (prefers-reduced-motion: reduce) { * { transition-duration: .001ms !important; } }
</style>

<script>
  // Defaults, overridable from the query string for screenshots:
  // ?marks=g1&colors=c3&dark=1
  const q = new URLSearchParams(location.search);
  document.documentElement.dataset.marks = q.get("marks") || "g2";
  document.documentElement.dataset.colors = q.get("colors") || "c2";
  if (q.has("dark")) document.documentElement.dataset.appearance = "dark";
</script>

<div class="page">
  <div class="wrap">
    <p class="kicker">Genauly · design review</p>
    <h1>Prüfung: one page, one toggle, two modes</h1>
    <p class="lede" style="margin-top:8px">
      Today the exam zone is two pages: a hub with three cards, and the Modelltest page behind one of
      them. These options fold both into ONE page whose header is a two-segment switcher, in the same
      language the Bibliothek uses. Every screen is drawn from the real app tokens (light and the s187
      "N3 Slate" dark), so what you see is what ships. German inside a frame is the app copy under
      review, everything outside a frame is review text.
    </p>

    <div class="controls">
      <div class="ctl"><span>Appearance</span>
        <div class="seg">
          <button type="button" data-app="light" aria-pressed="true">Light</button>
          <button type="button" data-app="dark" aria-pressed="false">Dark</button>
        </div>
      </div>
      <div class="ctl"><span>Module marks</span>
        <div class="seg">
          <button type="button" data-marks="g1" aria-pressed="false">Klassisch</button>
          <button type="button" data-marks="g2" aria-pressed="true">Modern</button>
        </div>
      </div>
      <div class="ctl"><span>Colour</span>
        <div class="seg">
          <button type="button" data-colors="c1" aria-pressed="false">Ruhig</button>
          <button type="button" data-colors="c2" aria-pressed="true">Rezeptiv / Produktiv</button>
          <button type="button" data-colors="c3" aria-pressed="false">Vier Farben</button>
        </div>
      </div>
    </div>

    <div class="panel">
      <h2>What the redesign does</h2>
      <div class="findings">
        <div class="finding"><span class="num">1</span><div>
          <b>The header becomes the toggle</b>
          <p>The orange "Prüfung vorbereiten" hero and the separate "Modelltest" title both go. The switcher IS the page header, exactly as in the Bibliothek.</p>
        </div></div>
        <div class="finding"><span class="num">2</span><div>
          <b>Module üben holds the four modules</b>
          <p>Lesen, Hören, Schreiben, Sprechen, each with what it contains and how long it takes. This is where "Einzeln üben" went.</p>
        </div></div>
        <div class="finding"><span class="num">3</span><div>
          <b>Modelltest holds the run and the record</b>
          <p>The complete exam band plus Verlauf, nothing else. No practice rows underneath it any more.</p>
        </div></div>
        <div class="finding"><span class="num">4</span><div>
          <b>One level control for the whole page</b>
          <p>Both modes are served per level, so Niveau is set once at the top instead of living only on the Modelltest page.</p>
        </div></div>
        <div class="finding"><span class="num">5</span><div>
          <b>Nothing is stated twice</b>
          <p>The tab name replaces the section heading under it, and a time or a score appears in exactly one place per screen.</p>
        </div></div>
        <div class="finding"><span class="num">6</span><div>
          <b>Neither tab scrolls at rest</b>
          <p>Every phone frame below is the real 668 px a phone leaves between header and tab bar, and it does not scroll. Verlauf is closed until you open it.</p>
        </div></div>
      </div>
    </div>

    <div class="panel">
      <h2>Module marks: shapes and colour</h2>
      <p class="note" style="margin-top:8px">
        The two controls in the bar above swap the marks everywhere on this page at once, so you can
        judge them in place rather than in isolation. The row below is the same four tiles at the size
        they appear on a module card.
      </p>
      <div class="markstage screen">
        <div class="markrow">
          ${MODULES.map(
            (m) => `
            <div class="markcell">
              <span class="tile xl ${m.id}">${mark(m.id, 26)}</span>
              <span class="marklab">${m.label}</span>
            </div>`,
          ).join("")}
        </div>
      </div>
      <div class="tablewrap" style="margin-top:16px">
        <table>
          <tr><th>Set</th><th>What it says</th><th>Cost</th></tr>
          <tr><td>Shapes · Klassisch</td><td>Today's four: open book, headphones, pen, microphone. Warm and instantly readable.</td><td>Three of the four are rounded objects, so they blur together at 40 px.</td></tr>
          <tr><td>Shapes · Modern</td><td>A page of text, a sound wave, a pen on a sheet, two speech bubbles. Flatter and more geometric, and each silhouette is a different shape.</td><td>The sound wave is an abstraction, not an object, so it takes one look to learn.</td></tr>
          <tr><td>Colour · Ruhig</td><td>No colour on the marks at all. Every tile is the same recessed grey, and colour is left to the things that act: the start button and the result bars.</td><td>The four modules stop being colour-coded, so the eye reads names, not hues.</td></tr>
          <tr><td>Colour · Rezeptiv / Produktiv</td><td>Green for the two receiving skills (Lesen, Hören), blue for the two producing ones (Schreiben, Sprechen). The colour carries a fact.</td><td>Two greens and two blues sit close together, which is the point but reads as less variety.</td></tr>
          <tr><td>Colour · Vier Farben</td><td>Four separated hues, one per module: green, amber, brand blue, rose. Furthest apart of the three.</td><td>Rose is new to the app, and four hues on one screen is the busiest of the three.</td></tr>
        </table>
      </div>
      <p class="note" style="margin-top:12px">
        <b>What is wrong with today's set.</b> Schreiben is brand blue and Sprechen is cyan, one hue apart,
        so at tile size the two productive modules look like the same colour. Every option below fixes
        that, either by removing the colour or by pushing the four hues apart.
      </p>
    </div>

    <div class="panel">
      <h2>No scroll until the learner asks for one</h2>
      <p class="note" style="margin-top:8px">
        The four module cards and the exam band are sized to the room a phone actually leaves, so both
        tabs rest at zero scroll. The one part that grows without limit is the record of past runs, so
        <b>Verlauf is a closed block</b>: at rest it is a single row saying how many runs exist. Opening
        it is a deliberate tap, and only then may the page grow past the screen.
      </p>
      <div class="framerow">
        ${frame("A", "modelltest", "phone", "Closed · rests at zero scroll")}
        ${frame("A", "modelltest", "phone", "Opened · A", { open: true, scroll: true })}
        ${frame("B", "modelltest", "phone", "Opened, one run expanded · B", { open: true, openRow: true, scroll: true })}
        ${frame("C", "modelltest", "phone", "Opened with figures · C", { open: true, scroll: true })}
      </div>
      <p class="fitnote">The last three frames scroll because the learner opened Verlauf. Nothing else on either tab does.</p>
    </div>

    <div class="panel">
      <h2>Naming the zone: four candidates</h2>
      <p class="note" style="margin-top:8px">
        The page itself gets no title any more (the toggle is the header), so the name only shows up in
        the bottom tab bar, the desktop sidebar and the address. The tab bar has five fixed slots, which
        is what puts a hard ceiling on length: today's five are Praktisch · Bibliothek · <b>Prüfung</b> ·
        Fortschritt · Einstellungen.
      </p>
      <div class="tablewrap" style="margin-top:14px">
        <table>
          <tr><th>Candidate</th><th>Reads as</th><th>Fits the tab bar</th><th>Watch out for</th></tr>
          <tr><td>Prüfung <i>(today)</i></td><td>The exam, as a place</td><td>Yes, 7 characters</td><td>Says nothing about practising, which is now half the zone</td></tr>
          <tr><td>Prüfung üben</td><td>An action: practise for the exam</td><td>No, it would wrap or shrink under the icon</td><td>Repeats "üben" against the "Module üben" tab right below it</td></tr>
          <tr><td>Prüfungstraining</td><td>The most precise German term for both halves</td><td>Sidebar yes, bottom tab no (16 characters)</td><td>Needs a short form for the tab, so the zone carries two names</td></tr>
          <tr><td>Training</td><td>A training ground, exam framing implied</td><td>Yes, 8 characters</td><td>Loses the word "Prüfung", which is what the learner is searching for</td></tr>
        </table>
      </div>
      <p class="note" style="margin-top:12px">
        <b>What each choice costs to build.</b> A label change is a one-line edit. Changing the address
        from <code>/anwenden</code> to <code>/pruefung</code> is bigger: learners who reordered their tab
        bar have the old address saved on their device and in the cloud, so it needs a redirect plus a
        rewrite of those saved settings. Worth doing once, but only if you want the address to match.
      </p>
    </div>

    <div class="panel">
      <h2>One thing to decide</h2>
      <p class="note" style="margin-top:8px">
        Today the exam hub is the ONLY way into the two free trainers: the Schreiben trainer (Fokus,
        Kurz, Lang, Verlauf) and the Sprechen dialogue trainer. They are not timed exam modules, so
        they need a home in the new layout. The options answer it two ways:
      </p>
      <p class="note"><b>Inside the card</b> (C): the Schreiben and Sprechen module cards carry a
        second quiet line, "Schreibtrainer öffnen →". Four modules, nothing else on the page.</p>
      <p class="note"><b>Its own small block</b> (A and B): the four timed modules stay pure, and a
        "Freies Üben" pair sits below them.</p>
    </div>

    ${OPTIONS.map(
      (o) => `
    <section class="option" id="opt-${o.key}">
      <div class="opthead"><span class="optname">${o.name}</span><h2>${o.title}</h2></div>
      <p class="lede">${o.character}</p>
      <div class="framerow">
        ${frame(o.key, "module", "phone", "Phone · Module üben")}
        ${frame(o.key, "modelltest", "phone", "Phone · Modelltest")}
        <div class="notecol">
          ${o.notes.map((n) => `<p class="note">${n}</p>`).join("")}
          <p class="cost"><b>Cost:</b> ${o.cost}</p>
        </div>
      </div>
      <div class="framerow">
        ${frame(o.key, "module", "desk", "Desktop · Module üben")}
        ${frame(o.key, "modelltest", "desk", "Desktop · Modelltest")}
      </div>
    </section>`,
    ).join("")}

    <hr class="rule">
    <section class="option">
      <h2>Side by side</h2>
      <div class="panel" style="margin-top:14px">
        <div class="tablewrap">
          <table>
            <tr><th>&nbsp;</th><th>A · Kompakt</th><th>B · Bibliothek-treu</th><th>C · Prüfungstag</th></tr>
            <tr><td>Header rows</td><td>One (switcher + level button)</td><td>Two full-width tracks</td><td>Two rows, level right aligned</td></tr>
            <tr><td>Niveau control</td><td>Small scope button</td><td>Shipped pill switcher, full width</td><td>Shipped pill switcher, content sized</td></tr>
            <tr><td>Module layout</td><td>2×2 grid of cards</td><td>One card, four rows</td><td>Four wide cards</td></tr>
            <tr><td>Free trainers</td><td>Own "Freies Üben" block</td><td>Own "Freies Üben" block</td><td>Line inside the card</td></tr>
            <tr><td>Run band</td><td>Minutes on each node</td><td>One total, no per-node minutes</td><td>Minutes on each node</td></tr>
            <tr><td>Verlauf, opened</td><td>Rows only</td><td>Rows only</td><td>Three figures, then rows</td></tr>
            <tr><td>Phone height, Module tab</td><td>Shortest</td><td>Middle</td><td>Tallest</td></tr>
            <tr><td>Risk</td><td>Replaces an s188 founder pick</td><td>Lowest, nothing restyled</td><td>Most scrolling on a phone</td></tr>
          </table>
        </div>
      </div>
    </section>

    <section class="option">
      <h2>The same in every option</h2>
      <div class="panel" style="margin-top:14px">
        <p class="note">The switcher is the shipped sliding-pill mechanism (one always-mounted pill, grey track, lifted white pill), not a new control.</p>
        <p class="note">A running exam still takes the whole route over, so a reload lands back inside the exam, never on this page.</p>
        <p class="note">Levels without content stay honest: an unservable level greys its start action out and says so, it never dead-ends.</p>
        <p class="note">The old links keep working: <code>/exam</code> opens this page on the Modelltest tab.</p>
        <p class="note">Both tabs rest inside one phone screen at zero scroll; only an opened Verlauf may push past it.</p>
        <p class="note">Switching tab keeps the level: pick B1 once and both modes stay on B1.</p>
        <p class="note">On the Modelltest tab the band takes the room the page leaves, which puts "Prüfung starten" low on the screen, inside the thumb's reach.</p>
        <p class="note">The two free trainers keep their own pages and their own history; only the way in changes.</p>
      </div>
    </section>
  </div>
</div>

<script>
  // Review helper: "#only-A" shows a single option section (used for screenshots).
  const only = location.hash.match(/^#only-([A-Za-z]+)$/) || location.search.match(/only=([A-Za-z]+)/);
  if (only) {
    document.querySelectorAll(".wrap > *").forEach((el) => {
      if (el.id !== "opt-" + only[1]) el.style.display = "none";
    });
  }
  const root = document.documentElement;
  const wire = (attr, prop) => {
    document.querySelectorAll("[" + attr + "]").forEach((b) => {
      if (!b.matches(".seg button")) return;
      b.addEventListener("click", () => {
        const val = b.getAttribute(attr);
        root.dataset[prop] = val;
        document.querySelectorAll(".seg button[" + attr + "]").forEach((x) =>
          x.setAttribute("aria-pressed", String(x.getAttribute(attr) === val)),
        );
      });
    });
  };
  document.querySelectorAll(".seg button[data-marks], .seg button[data-colors], .seg button[data-app]").forEach((b) => {
    const attr = b.hasAttribute("data-marks") ? "marks" : b.hasAttribute("data-colors") ? "colors" : "appearance";
    const val = b.getAttribute("data-" + (attr === "appearance" ? "app" : attr));
    b.setAttribute("aria-pressed", String((root.dataset[attr] || "light") === val));
  });
  wire("data-app", "appearance");
  wire("data-marks", "marks");
  wire("data-colors", "colors");
</script>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
