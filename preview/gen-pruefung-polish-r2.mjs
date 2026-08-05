/**
 * Generates `preview/pruefung-polish-r2.html` (round 2) and re-writes the
 * artifact build at `preview/pruefung-polish-artifact.html`, so the founder
 * keeps ONE artifact URL across rounds.
 *
 * Round 1 (`gen-pruefung-polish.mjs`) offered A "Verdichtet", B "Prüfungstag"
 * and C "Bereit". The founder picked **B**, with four changes:
 *
 *   1. In Module üben the "Mit Zeit" badge must NOT change the card's height.
 *      It belongs in the empty bottom-right corner of the card.
 *   2. The Verlauf block from B must also exist on the Module üben tab,
 *      adapted, and built out even if that needs more than today's data.
 *   3. The Modelltest Verlauf keeps its Letzter/Bester figures, but they need a
 *      better visualisation than three flat cells.
 *   4. Everything else about B stands.
 *
 * So this round locks the card and offers variants only where the founder asked
 * for them: three visualisations for the Modelltest Verlauf (V1/V2/V3) and
 * three shapes for the new Module üben Verlauf (M1/M2/M3). The control bar
 * composes them live, and the full-page frames at the end follow the choice.
 *
 * Run: node preview/gen-pruefung-polish-r2.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_CSS, ICON, mark, MODULES } from "./gen-pruefung-shared.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "pruefung-polish-r2.html");
const ART = join(DIR, "pruefung-polish-artifact.html");

const TOTAL_MIN = MODULES.reduce((n, m) => n + m.min, 0);
const PASS = 60;

const FREE_DESC = {
  schreiben: "Fokus, Kurz und Lang",
  sprechen: "Dialoge mit Coaching",
};

/* -------------------------------- sample data ------------------------------ */

/** Seven full runs, oldest first. Best (82) is deliberately NOT the last (78). */
const TOTALS = [52, 55, 61, 58, 82, 70, 78];
const BEST = Math.max(...TOTALS);
const LAST = TOTALS[TOTALS.length - 1];
const PREV = TOTALS[TOTALS.length - 2];
const PASSED = TOTALS.filter((t) => t >= PASS).length;

const RUN_ROWS = [
  { date: "31. Juli", total: 78, parts: { lesen: 82, hoeren: 71, schreiben: 80, sprechen: 78 } },
  { date: "24. Juli", total: 70, parts: { lesen: 74, hoeren: 62, schreiben: 72, sprechen: 71 } },
  { date: "17. Juli", total: 82, parts: { lesen: 86, hoeren: 76, schreiben: 84, sprechen: 82 } },
];

/** Single-module practice, per module, oldest first. */
const MOD_SCORES = {
  lesen: [62, 71, 78, 84],
  hoeren: [48, 55, 61],
  schreiben: [70, 74, 79, 81, 86],
  sprechen: [],
};
const MOD_WHEN = {
  lesen: "vor 2 Tagen",
  hoeren: "vor 9 Tagen",
  schreiben: "gestern",
  sprechen: null,
};
const MOD_TOTAL = Object.values(MOD_SCORES).reduce((n, a) => n + a.length, 0);

/** The same practice as one chronological list, newest first. */
const MOD_ROWS = [
  { date: "4. Aug.", id: "schreiben", pct: 86 },
  { date: "3. Aug.", id: "lesen", pct: 84 },
  { date: "31. Juli", id: "schreiben", pct: 81 },
  { date: "27. Juli", id: "hoeren", pct: 61 },
  { date: "24. Juli", id: "lesen", pct: 78 },
];

const last = (id) => (MOD_SCORES[id].length ? MOD_SCORES[id][MOD_SCORES[id].length - 1] : null);
const first = (id) => (MOD_SCORES[id].length ? MOD_SCORES[id][0] : null);

/* ----------------------------------- CSS ----------------------------------- */

const CSS = String.raw`
  /* ONE content frame for both tabs (round 1, kept). */
  .frame.desk .stage { max-width: 896px; margin: 0 auto; }
  .stage { display: flex; flex-direction: column; gap: 18px; flex: 1; min-height: 0; width: 100%; }
  .frame.mob .stage { gap: 10px; }
  .frame.mob .col, .frame.mob .stage, .frame.mob .card, .frame.mob .vbody { min-width: 0; }
  /* Phone trims, measured: every combination has to rest inside the 668px a
     393x852 phone leaves between the app header and the tab bar. */
  .frame.mob .hdrstack { gap: 10px; }
  .frame.mob .vtop { padding-top: 10px; }
  .frame.mob .vbody { padding: 10px 14px 12px; }
  .frame.mob .vmore { padding: 7px; }
  .frame.mob .trendrow { padding: 3px 0; }
  .frame.mob .spark { height: 22px; }
  .frame.mob .ptrack { height: 48px; }
  .frame.mob .pcol { gap: 5px; }
  .frame.mob .pval { font-size: 13px; }
  .frame.mob .plegend { margin-top: 6px; }
  .frame.mob .v2body { gap: 10px; }
  .frame.mob .v2fig { font-size: 34px; }
  .frame.mob .v2stats { margin-top: 6px; }

  .hdrstack { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none; }
  .scoperow { display: flex; align-items: center; justify-content: center; gap: 8px; height: 38px; }
  .hdrsw { display: inline-flex; width: auto; }
  .frame.desk .hdrsw { min-width: 0; }
  .frame.mob .hdrsw { display: flex; width: 100%; }
  .hdrsw > button { font-size: 14px; padding: 6px 20px; }

  /* Review-chrome switches: every variant is in the DOM, one is shown. */
  [data-clock="timed"] .onfree { display: none; }
  [data-clock="free"] .ontimed { display: none; }
  .barcap { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 11px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .barcap b { color: hsl(var(--foreground)); font-weight: 650; }
  .dash { display: inline-block; width: 14px; border-top: 1px dashed hsl(var(--success)); vertical-align: middle; margin-right: 5px; }
  .lastlab { margin-top: 7px; text-align: right; font-size: 12px; font-weight: 700; color: hsl(var(--primary)); font-variant-numeric: tabular-nums; }

  /* Module marks: soft in-family gradient (round 1, kept). */
  .tile.grad.lesen { background: linear-gradient(150deg, rgba(16,185,129,.20), rgba(16,185,129,.06)); }
  .tile.grad.hoeren { background: linear-gradient(150deg, rgba(20,184,166,.20), rgba(20,184,166,.06)); }
  .tile.grad.schreiben { background: linear-gradient(150deg, hsl(var(--primary) / .20), hsl(var(--primary) / .05)); }
  .tile.grad.sprechen { background: linear-gradient(150deg, rgba(14,165,233,.20), rgba(14,165,233,.06)); }
  [data-appearance="dark"] .tile.grad.lesen { background: linear-gradient(150deg, rgba(52,211,153,.24), rgba(52,211,153,.08)); }
  [data-appearance="dark"] .tile.grad.hoeren { background: linear-gradient(150deg, rgba(45,212,191,.24), rgba(45,212,191,.08)); }
  [data-appearance="dark"] .tile.grad.schreiben { background: linear-gradient(150deg, hsl(var(--primary) / .26), hsl(var(--primary) / .08)); }
  [data-appearance="dark"] .tile.grad.sprechen { background: linear-gradient(150deg, rgba(56,189,248,.24), rgba(56,189,248,.08)); }
  .tile.xxl { width: 54px; height: 54px; border-radius: 12px; }
  .tile.sm { width: 28px; height: 28px; border-radius: 8px; }

  /* --------------------------- the module card ---------------------------- */
  .grid2x2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; flex: none; }
  .frame.mob .grid2x2 { gap: 10px; }
  .pcard {
    position: relative; overflow: hidden; display: flex; flex-direction: column;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 10px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
    text-align: left; cursor: pointer; padding: 16px;
    transition: transform .16s ease, box-shadow .16s ease;
  }
  .frame.desk .pcard { padding: 20px 22px; }
  .frame.desk .b-card { padding-bottom: 46px; }
  .pcard:hover { transform: translateY(-2px); box-shadow: 0 2px 4px hsl(var(--shadow) / .08), 0 12px 24px -6px hsl(var(--shadow) / .16); }
  .ptitle { font-size: 17px; font-weight: 700; letter-spacing: -.015em; line-height: 1.15; }
  .frame.desk .ptitle { font-size: 20px; }
  .pdesc { margin-top: 4px; font-size: 12.5px; line-height: 1.35; color: hsl(var(--muted-foreground)); }
  .frame.desk .pdesc { font-size: 14px; }
  .goarrow {
    display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 7px;
    color: hsl(var(--muted-foreground)); background: hsl(var(--muted) / .8);
    transition: background .16s ease, color .16s ease;
  }
  .pcard:hover .goarrow { background: hsl(var(--primary) / .12); color: hsl(var(--primary)); }

  /* The card's own hue in its bottom-right corner (founder pick B). */
  .b-card::before {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(120% 110% at 100% 100%, var(--wash-hue), transparent 62%);
  }
  .b-card.lesen { --wash-hue: rgba(16,185,129,.13); }
  .b-card.hoeren { --wash-hue: rgba(20,184,166,.13); }
  .b-card.schreiben { --wash-hue: hsl(var(--primary) / .13); }
  .b-card.sprechen { --wash-hue: rgba(14,165,233,.13); }
  [data-appearance="dark"] .b-card.lesen { --wash-hue: rgba(52,211,153,.12); }
  [data-appearance="dark"] .b-card.hoeren { --wash-hue: rgba(45,212,191,.12); }
  [data-appearance="dark"] .b-card.schreiben { --wash-hue: hsl(var(--primary) / .16); }
  [data-appearance="dark"] .b-card.sprechen { --wash-hue: rgba(56,189,248,.12); }
  .b-card > * { position: relative; }
  /* Fixed height in BOTH clock states (founder r2): the minutes badge is
     absolutely placed in the corner the wash already occupies, so switching
     Ohne Zeit / Mit Zeit cannot move a single card edge. */
  .b-card { min-height: 132px; }
  .frame.mob .b-card { padding: 14px 14px 30px; }
  .frame.mob .b-card .tile.xxl { width: 44px; height: 44px; border-radius: 11px; }
  .frame.mob .b-card .ptitle { font-size: 16px; margin-top: 9px !important; }
  .frame.desk .b-card { min-height: 152px; }
  .b-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .cornerchip {
    position: absolute; right: 16px; bottom: 14px; z-index: 1;
    display: inline-flex; align-items: center; gap: 4px;
    font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums;
    color: hsl(var(--muted-foreground)); background: hsl(var(--muted) / .85);
    border-radius: 6px; padding: 3px 8px;
  }
  .frame.desk .cornerchip { right: 20px; bottom: 18px; }

  /* ------------------------------ ticket band ----------------------------- */
  .b-ticket { display: grid; grid-template-columns: minmax(0,1fr) 1px 296px; }
  .b-left { padding: 22px 24px 24px; display: flex; flex-direction: column; align-items: flex-start; }
  .b-right { padding: 18px 20px; display: flex; flex-direction: column; justify-content: center; }
  .b-vsep { background: hsl(var(--border)); }
  .bigtime { font-size: 46px; font-weight: 800; letter-spacing: -.03em; line-height: 1; margin-top: 12px; }
  .bigtime small { font-size: 19px; font-weight: 700; letter-spacing: -.01em; margin-left: 5px; color: hsl(var(--muted-foreground)); }
  .bigsub { margin-top: 8px; font-size: 14px; color: hsl(var(--muted-foreground)); }
  .b-cta { margin-top: auto; padding-top: 20px; }
  .ladder { display: flex; flex-direction: column; }
  .lrow { position: relative; display: flex; align-items: center; gap: 11px; padding: 6px 0; }
  .lrow::after {
    content: ""; position: absolute; left: 17px; top: calc(50% + 19px); height: calc(100% - 38px);
    width: 2px; border-radius: 2px; background: hsl(var(--border));
  }
  .lrow:last-child::after { content: none; }
  .lname { font-size: 14.5px; font-weight: 600; }
  .lmin { margin-left: auto; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .pband { padding: 18px 20px 20px; display: flex; flex-direction: column; }
  .frame.mob .pband { flex: 1; }
  .pbandhead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
  .totalchip { font-size: 13.5px; color: hsl(var(--muted-foreground)); }
  .totalchip b { color: hsl(var(--foreground)); font-weight: 700; }
  .ctacenter { margin-top: 16px; display: flex; justify-content: center; }
  .frame.mob .ctacenter .btn { width: 100%; }

  /* -------------------------------- Verlauf ------------------------------- */
  .vwrap { overflow: hidden; display: flex; flex-direction: column; flex: none; }
  .vtop { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 12px 16px 0; flex: none; }
  .vbody { padding: 12px 16px 14px; flex: none; display: flex; }
  .vmore { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 8px; background: transparent; border: 0; border-top: 1px solid hsl(var(--border)); cursor: pointer; font-size: 12.5px; font-weight: 650; color: hsl(var(--primary)); flex: none; }
  .verlauflist { border-top: 1px solid hsl(var(--border)); min-height: 0; }
  .frame.mob .verlauflist { overflow-y: auto; flex: 1; }

  /* Bar chart, shared by V1/V2 and M2. */
  .bars { position: relative; display: flex; align-items: flex-end; gap: 9px; height: 68px; width: fit-content; }
  .bar { width: 32px; border-radius: 4px 4px 2px 2px; background: hsl(var(--primary) / .28); position: relative; }
  .bar.now { background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--gradient-to))); }
  .bar.top { box-shadow: inset 0 0 0 1.5px hsl(var(--primary) / .55); background: hsl(var(--primary) / .16); }
  .bar.lesen { background: var(--bar-lesen); } .bar.hoeren { background: var(--bar-hoeren); }
  .bar.schreiben { background: var(--bar-schreiben); } .bar.sprechen { background: var(--bar-sprechen); }
  .passline { position: absolute; left: -6px; right: -6px; border-top: 1px dashed hsl(var(--success) / .7); }
  .passlab { position: absolute; left: 0; transform: translateY(-118%); font-size: 10.5px; font-weight: 650; color: hsl(var(--success)); }
  .bartag {
    position: absolute; left: 50%; transform: translate(-50%, -100%); top: -5px; white-space: nowrap;
    font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums;
  }
  .bartag.now { color: hsl(var(--primary)); }
  .bartag.best { color: hsl(var(--muted-foreground)); font-weight: 650; }

  /* V1: the chart carries the figures. */
  .v1row { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 10px 22px; }
  .v1caps { display: flex; flex-direction: column; gap: 5px; padding-bottom: 4px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .v1caps b { color: hsl(var(--foreground)); font-weight: 650; }
  .v1chart { flex: 1 1 240px; max-width: 360px; min-width: 0; }
  .v1row { min-width: 0; }
  .v1body .bars { width: 100%; }
  .v1body .bar { flex: 1; width: auto; min-width: 0; }
  .v1caps { display: flex; flex-wrap: wrap; gap: 4px 16px; margin-top: 12px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .v1caps b { color: hsl(var(--foreground)); font-weight: 650; }

  /* V2: one lead figure, the rest as supporting stats. */
  .v2body { align-items: stretch; gap: 20px; }
  .v2lead { flex: none; display: flex; flex-direction: column; justify-content: center; min-width: 168px; }
  .v2label { font-size: 12px; color: hsl(var(--muted-foreground)); }
  .v2figrow { display: flex; align-items: baseline; gap: 9px; margin-top: 1px; }
  .v2fig { font-size: 40px; font-weight: 800; letter-spacing: -.03em; line-height: 1; font-variant-numeric: tabular-nums; }
  .delta { display: inline-flex; align-items: center; gap: 2px; font-size: 12.5px; font-weight: 700; border-radius: 6px; padding: 2px 7px; background: hsl(var(--success) / .14); color: hsl(var(--success)); }
  .v2stats { display: flex; gap: 18px; margin-top: 12px; }
  .v2stat { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .v2stat b { display: block; font-size: 16px; font-weight: 700; color: hsl(var(--foreground)); font-variant-numeric: tabular-nums; }
  .v2chart { flex: 1; min-width: 0; display: flex; align-items: flex-end; justify-content: flex-end; }
  .frame.mob .v2body { flex-direction: column; gap: 14px; }
  .frame.mob .v2chart { justify-content: flex-start; }

  /* V3: a ring for the last run, dots for the pass record. */
  .v3body { align-items: center; gap: 22px; }
  .ring { flex: none; position: relative; width: 104px; height: 104px; }
  .ring svg { transform: rotate(-90deg); }
  .ringmid { position: absolute; inset: 0; display: grid; place-content: center; text-align: center; }
  .ringmid b { font-size: 24px; font-weight: 800; letter-spacing: -.02em; font-variant-numeric: tabular-nums; line-height: 1.05; }
  .ringmid span { font-size: 11px; color: hsl(var(--muted-foreground)); }
  .v3facts { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
  .factrow { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .factlab { font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .factval { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .metertrack { margin-top: 6px; height: 6px; border-radius: 999px; background: hsl(var(--muted)); overflow: hidden; }
  .metertrack > i { display: block; height: 100%; border-radius: 999px; background: hsl(var(--primary) / .55); }
  .dots { display: flex; gap: 5px; margin-top: 7px; }
  .dots i { width: 100%; height: 6px; border-radius: 999px; background: hsl(var(--muted)); }
  .dots i.ok { background: hsl(var(--success) / .8); }

  /* M1: four module trends. */
  .m1 { flex-direction: column; width: 100%; gap: 0; }
  .trendrow { display: flex; align-items: center; gap: 11px; padding: 7px 0; }
  .trendrow + .trendrow { border-top: 1px solid hsl(var(--border) / .7); }
  .trendname { font-size: 13.5px; font-weight: 650; flex: 1; min-width: 0; }
  .spark { display: flex; align-items: flex-end; gap: 3px; height: 26px; flex: none; width: 96px; justify-content: flex-end; }
  .spark i { width: 9px; border-radius: 2px; }
  .spark i.ghost { background: hsl(var(--muted)); height: 4px !important; }
  .trendpct { font-size: 13.5px; font-weight: 700; font-variant-numeric: tabular-nums; flex: none; width: 46px; text-align: right; }
  .trendnone { font-size: 12.5px; color: hsl(var(--muted-foreground)); flex: none; }

  /* M2: one chronological chart + list. */
  .m2 { flex-direction: column; width: 100%; gap: 0; align-items: flex-start; }
  .m2cap { margin-top: 10px; font-size: 12.5px; color: hsl(var(--muted-foreground)); }
  .m2cap b { color: hsl(var(--foreground)); font-weight: 650; }

  /* M3: the strength profile. */
  .m3 { width: 100%; gap: 0; }
  .profile { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; width: 100%; max-width: 460px; margin: 0 auto; }
  .pcol { display: flex; flex-direction: column; align-items: center; gap: 7px; }
  .pval { font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .pval.none { color: hsl(var(--muted-foreground)); font-weight: 600; font-size: 12.5px; }
  .ptrack { position: relative; width: 100%; height: 104px; border-radius: 6px; background: hsl(var(--muted) / .8); overflow: hidden; }
  /* Two stacked segments instead of a marker line: the pale part is where the
     learner started, the solid part on top is what they have gained since. A
     dotted line over a saturated fill was the first attempt and was invisible. */
  .pstack { position: absolute; inset: 0; display: flex; flex-direction: column-reverse; }
  .pstack .seg { display: block; width: 100%; }
  .pstack .seg.solid { border-radius: 4px 4px 0 0; }
  .seg.pale.lesen { background: rgba(16,185,129,.32); } .seg.solid.lesen { background: var(--bar-lesen); }
  .seg.pale.hoeren { background: rgba(20,184,166,.32); } .seg.solid.hoeren { background: var(--bar-hoeren); }
  .seg.pale.schreiben { background: hsl(var(--primary) / .32); } .seg.solid.schreiben { background: var(--bar-schreiben); }
  .seg.pale.sprechen { background: rgba(14,165,233,.32); } .seg.solid.sprechen { background: var(--bar-sprechen); }
  .frame.mob .pname { flex-direction: column; gap: 4px; font-size: 11px; text-align: center; }
  .pname { display: flex; align-items: center; gap: 6px; font-size: 12.5px; font-weight: 600; }
  .plegend { margin-top: 12px; font-size: 12px; color: hsl(var(--muted-foreground)); text-align: center; width: 100%; }

  /* Verlauf rows (shared). */
  .vrow2 { display: flex; align-items: center; gap: 11px; padding: 9px 16px; width: 100%; background: transparent; border: 0; text-align: left; cursor: pointer; transition: background .14s ease; }
  .vrow2:hover { background: hsl(var(--muted) / .4); }
  .vrow2 + .vrow2 { border-top: 1px solid hsl(var(--border)); }
  .vdate2 { font-size: 13px; font-weight: 650; font-variant-numeric: tabular-nums; width: 64px; flex: none; }
  .vname2 { font-size: 13.5px; font-weight: 600; }
  .mini2 { display: flex; gap: 4px; flex: 1; min-width: 40px; max-width: 300px; }
  .mini2 > span { flex: 1; height: 5px; border-radius: 999px; background: hsl(var(--muted)); overflow: hidden; }
  .mini2 > span > i { display: block; height: 100%; border-radius: 999px; }
  .bar-lesen { background: var(--bar-lesen); } .bar-hoeren { background: var(--bar-hoeren); }
  .bar-schreiben { background: var(--bar-schreiben); } .bar-sprechen { background: var(--bar-sprechen); }
  .badge2 { display: inline-flex; align-items: center; border-radius: 999px; padding: 2px 9px; font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; flex: none; margin-left: auto; }
  .badge2.ok { background: hsl(var(--success) / .15); color: hsl(var(--success)); }
  .badge2.mutedb { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }

  /* Variant stage frames (the Verlauf card on its own, at both widths). */
  .stagerow { display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-start; margin-top: 16px; }
  .cardstage { flex: 1 1 520px; min-width: 320px; }
  .cardstage .frame .screen { padding: 20px; }
  .cardstage.narrow { flex: 0 0 372px; }
  .cardstage.narrow .frame .screen { padding: 16px 15px; display: block; height: auto; }
  .cardstage.narrow .frame .inner { display: block; }
  .cardstage .vwrap { flex: none; }

  /* The review-page variant switch, stated last so it beats .vbody. */
  .vbody.vv, .vbody.mv { display: none; }
  [data-vv="v1"] .vbody.vv.v1body,
  [data-vv="v2"] .vbody.vv.v2body,
  [data-vv="v3"] .vbody.vv.v3body,
  [data-mv="m1"] .vbody.mv.m1,
  [data-mv="m2"] .vbody.mv.m2,
  [data-mv="m3"] .vbody.mv.m3 { display: flex; }

  /* Card-height proof block. */
  .proof { display: flex; flex-wrap: wrap; gap: 20px; margin-top: 14px; }
  .proofbox { flex: 0 0 420px; }
  .proofbox .frame .screen { padding: 18px; }
`;

/* -------------------------------- furniture -------------------------------- */

const modeSwitch = (active) => `
  <div class="modeswitch hdrsw" role="tablist" aria-label="Prüfung">
    <span class="pill" style="left:${active === "module" ? "4px" : "50%"}"></span>
    <button role="tab" aria-pressed="${active === "module"}">Module üben</button>
    <button role="tab" aria-pressed="${active === "modelltest"}">Modelltest</button>
  </div>`;

const niveau = () =>
  `<button class="scopebtn" type="button"><span>Niveau</span><b class="tnum">B2</b>${ICON.chevD(15)}</button>`;

const clockSwitch = () => `
  <div class="modeswitch" role="group" aria-label="Zeit" style="padding:3px">
    <span class="pill onfree" style="left:3px;top:3px;bottom:3px;width:calc(50% - 3px)"></span>
    <span class="pill ontimed" style="left:50%;top:3px;bottom:3px;width:calc(50% - 3px)"></span>
    <button style="font-size:13px;padding:4px 14px">Ohne Zeit</button>
    <button style="font-size:13px;padding:4px 14px">Mit Zeit</button>
  </div>`;

const header = (tab) => `
  <div class="hdrstack">
    ${modeSwitch(tab)}
    <div class="scoperow">${tab === "module" ? clockSwitch() : ""}${niveau()}</div>
  </div>`;

const goArrow = () => `<span class="goarrow">${ICON.arrowR(15)}</span>`;

/**
 * `clock` is "switch" inside the app frames (both states in the DOM, the review
 * control picks one) or a fixed "free"/"timed" for the two proof cards, which
 * sit side by side and must therefore each hold ONE state.
 */
const moduleCard = (m, clock = "switch") => {
  const free = FREE_DESC[m.id] ?? m.desc;
  const desc =
    clock === "switch"
      ? FREE_DESC[m.id]
        ? `<span class="onfree">${FREE_DESC[m.id]}</span><span class="ontimed">${m.desc}</span>`
        : m.desc
      : clock === "free"
        ? free
        : m.desc;
  const chip = `${ICON.clock(12)}${m.min} Min`;
  return `
  <button class="pcard b-card ${m.id}" type="button">
    <span class="b-top">
      <span class="tile grad xxl ${m.id}">${mark(m.id, 26)}</span>
      ${goArrow()}
    </span>
    <span class="ptitle" style="margin-top:13px">${m.label}</span>
    <span class="pdesc">${desc}</span>
    ${
      clock === "switch"
        ? `<span class="cornerchip ontimed">${chip}</span>`
        : clock === "timed"
          ? `<span class="cornerchip">${chip}</span>`
          : ""
    }
  </button>`;
};

const moduleGrid = () => `<div class="grid2x2">${MODULES.map((m) => moduleCard(m)).join("")}</div>`;

const track = () => `
  <div class="track" style="max-width:560px;margin:0 auto;width:100%">
    ${MODULES.map(
      (m) => `
      <div class="tnode">
        <span class="dot tile grad ${m.id}">${mark(m.id, 19)}</span>
        <span class="lab">${m.label}</span>
        <span class="min tnum">${m.min} Min</span>
      </div>`,
    ).join("")}
  </div>`;

const bandDesk = () => `
  <div class="card" style="overflow:hidden;flex:none">
    <div class="b-ticket">
      <div class="b-left">
        <p class="eyebrow mut">Komplette Prüfung</p>
        <p class="bigtime tnum">${TOTAL_MIN}<small>Min</small></p>
        <p class="bigsub">Vier Teile am Stück, wie am Prüfungstag</p>
        <p class="cdown tnum" style="margin-top:10px">${ICON.clock(14)}Noch 24 Tage bis zum 29. August</p>
        <div class="b-cta"><button class="btn grad" type="button">${ICON.play(15)} Prüfung starten</button></div>
      </div>
      <div class="b-vsep"></div>
      <div class="b-right">
        <div class="ladder">
          ${MODULES.map(
            (m) => `
            <div class="lrow">
              <span class="tile grad ${m.id}" style="width:36px;height:36px;border-radius:9px">${mark(m.id, 17)}</span>
              <span class="lname">${m.label}</span>
              <span class="lmin tnum">${m.min} Min</span>
            </div>`,
          ).join("")}
        </div>
      </div>
    </div>
  </div>`;

const bandMob = () => `
  <div class="card pband">
    <div class="pbandhead">
      <p class="eyebrow mut">Komplette Prüfung</p>
      <span class="totalchip tnum"><b>${TOTAL_MIN} Min</b> gesamt</span>
    </div>
    <p class="cdown tnum" style="margin-top:6px">${ICON.clock(13)}Noch 24 Tage bis zum 29. August</p>
    <div class="trackwrap">${track()}</div>
    <div class="ctacenter"><button class="btn grad" type="button">${ICON.play(15)} Prüfung starten</button></div>
  </div>`;

/* ------------------------- Modelltest Verlauf: V1-V3 ----------------------- */

const H = 68;

/**
 * The seven runs as bars. The pass line is drawn but NOT labelled on the chart:
 * a label there sits on top of the early bars, and the caption underneath can
 * carry the same fact with a dashed swatch. `tags` adds the one label the chart
 * needs, "Bester 82 %" over the best run; the last run is the gradient bar and
 * is named under the chart, so the two labels can never collide.
 */
const bars = ({ tags = false } = {}) => `
  <div class="bars">
    <span class="passline" style="bottom:${(PASS / 100) * H}px"></span>
    ${TOTALS.map((t, i) => {
      const isNow = i === TOTALS.length - 1;
      const isTop = t === BEST && !isNow;
      const tag = tags && isTop ? `<span class="bartag best tnum">Bester ${t} %</span>` : "";
      return `<span class="bar${isNow ? " now" : isTop ? " top" : ""}" style="height:${(t / 100) * H}px">${tag}</span>`;
    }).join("")}
  </div>`;

const vHead = () => `
  <div class="vtop"><p class="eyebrow mut">Verlauf</p><p class="vcount tnum">${TOTALS.length} Durchläufe</p></div>`;

const runRows = (n = 3) => `
  <div class="verlauflist">
    ${RUN_ROWS.slice(0, n).map(
      (r) => `
      <button class="vrow2" type="button">
        <span class="vdate2">${r.date}</span>
        <span class="mini2">${MODULES.map((m) => `<span><i class="bar-${m.id}" style="width:${r.parts[m.id]}%"></i></span>`).join("")}</span>
        <span class="badge2 ${r.total >= PASS ? "ok" : "mutedb"}">${r.total} %</span>
        <span class="chev">${ICON.chevD(16)}</span>
      </button>`,
    ).join("")}
  </div>`;

const V1 = (c = "") => `
  <div class="vbody${c} v1body" style="flex-direction:column;align-items:stretch">
    <div class="v1row">
      <div class="v1chart">
        ${bars({ tags: true })}
        <p class="lastlab">Letzter ${LAST} %</p>
      </div>
      <div class="v1caps">
        <span><b class="tnum">${PASSED} von ${TOTALS.length}</b> bestanden</span>
        <span><i class="dash"></i>bestanden ab ${PASS} %</span>
      </div>
    </div>
  </div>`;

const V2 = (c = "") => `
  <div class="vbody${c} v2body">
    <div class="v2lead">
      <p class="v2label">Letzter Durchlauf</p>
      <p class="v2figrow"><span class="v2fig">${LAST} %</span><span class="delta tnum">▲ ${LAST - PREV}</span></p>
      <div class="v2stats">
        <p class="v2stat"><b>${BEST} %</b>Bester</p>
        <p class="v2stat"><b>${PASSED} von ${TOTALS.length}</b>Bestanden</p>
      </div>
    </div>
    <div class="v2chart">
      <div style="flex:none">
        ${bars()}
        <p class="barcap" style="justify-content:flex-end"><span><i class="dash"></i>bestanden ab ${PASS} %</span></p>
      </div>
    </div>
  </div>`;

const ring = () => {
  const r = 46;
  const c = 2 * Math.PI * r;
  const on = (LAST / 100) * c;
  const tick = (PASS / 100) * 360;
  return `
  <div class="ring">
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="hsl(var(--muted))" stroke-width="9"/>
      <circle cx="52" cy="52" r="${r}" fill="none" stroke="url(#ringgrad)" stroke-width="9"
        stroke-linecap="round" stroke-dasharray="${on.toFixed(1)} ${(c - on).toFixed(1)}"/>
      <line x1="52" y1="2" x2="52" y2="14" stroke="hsl(var(--success))" stroke-width="2.5"
        stroke-linecap="round" transform="rotate(${tick.toFixed(1)} 52 52)"/>
      <defs>
        <linearGradient id="ringgrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="hsl(var(--gradient-from))"/>
          <stop offset="100%" stop-color="hsl(var(--gradient-to))"/>
        </linearGradient>
      </defs>
    </svg>
    <span class="ringmid"><b class="tnum">${LAST} %</b><span>Letzter</span></span>
  </div>`;
};

const V3 = (c = "") => `
  <div class="vbody${c} v3body">
    ${ring()}
    <div class="v3facts">
      <div>
        <div class="factrow"><span class="factlab">Bester</span><span class="factval tnum">${BEST} %</span></div>
        <div class="metertrack"><i style="width:${BEST}%"></i></div>
      </div>
      <div>
        <div class="factrow"><span class="factlab">Bestanden</span><span class="factval tnum">${PASSED} von ${TOTALS.length}</span></div>
        <div class="dots">${TOTALS.map((t) => `<i class="${t >= PASS ? "ok" : ""}"></i>`).join("")}</div>
      </div>
    </div>
  </div>`;

/**
 * `pick` renders ONE variant (the comparison stages); "all" renders all three
 * with their switch classes, for the compose-the-page frames at the end.
 */
const runVerlauf = (pick = "all", rows = 3) => `
  <div class="card vwrap">
    ${vHead()}
    ${pick === "all" ? `${V1(" vv")}${V2(" vv")}${V3(" vv")}` : pick === "v1" ? V1() : pick === "v2" ? V2() : V3()}
    ${rows ? runRows(rows) : ""}
    <button class="vmore" type="button">Alle ${TOTALS.length} anzeigen ${ICON.chevD(14)}</button>
  </div>`;

/* --------------------- Module üben Verlauf: M1-M3 -------------------------- */

const mHead = () => `
  <div class="vtop"><p class="eyebrow mut">Verlauf</p><p class="vcount tnum">${MOD_TOTAL} Übungen</p></div>`;

const M1 = (c = "") => `
  <div class="vbody${c} m1">
    ${MODULES.map((m) => {
      const s = MOD_SCORES[m.id];
      const cells = [...Array(Math.max(0, 6 - s.length)).fill(null), ...s];
      return `
      <div class="trendrow">
        <span class="tile grad sm ${m.id}">${mark(m.id, 15)}</span>
        <span class="trendname">${m.label}</span>
        ${
          s.length
            ? `<span class="spark">${cells
                .map((v) =>
                  v == null
                    ? `<i class="ghost"></i>`
                    : `<i class="bar-${m.id}" style="height:${Math.round((v / 100) * 26)}px"></i>`,
                )
                .join("")}</span>
               <span class="trendpct tnum">${last(m.id)} %</span>`
            : `<span class="trendnone">Noch nicht geübt</span><span class="trendpct tnum">–</span>`
        }
      </div>`;
    }).join("")}
  </div>`;

const M2 = (c = "") => `
  <div class="vbody${c} m2">
    <div style="flex:none">
      <div class="bars">
        <span class="passline" style="bottom:${(PASS / 100) * H}px"></span>
        ${MOD_ROWS.slice()
          .reverse()
          .map((r) => `<span class="bar ${r.id}" style="height:${(r.pct / 100) * H}px"></span>`)
          .join("")}
      </div>
      <p class="barcap">
        <span>Zuletzt <b>Schreiben, 86 %</b></span>
        <span><i class="dash"></i>bestanden ab ${PASS} %</span>
      </p>
    </div>
  </div>`;

const M3 = (c = "") => `
  <div class="vbody${c} m3" style="flex-direction:column;align-items:stretch">
    <div class="profile">
      ${MODULES.map((m) => {
        const l = last(m.id);
        const f = first(m.id);
        return `
        <div class="pcol">
          <span class="pval tnum${l == null ? " none" : ""}">${l == null ? "–" : `${l} %`}</span>
          <span class="ptrack">
            ${
              l == null
                ? ""
                : `<span class="pstack">
                     <i class="seg pale ${m.id}" style="height:${Math.min(f, l)}%"></i>
                     <i class="seg solid ${m.id}" style="height:${l - Math.min(f, l)}%"></i>
                   </span>`
            }
          </span>
          <span class="pname"><span class="tile grad sm ${m.id}" style="width:22px;height:22px;border-radius:6px">${mark(m.id, 12)}</span>${m.label}</span>
        </div>`;
      }).join("")}
    </div>
    <p class="plegend">Blass: dein erster Versuch · Kräftig: dein Fortschritt</p>
  </div>`;

const modRows = (n = 3) => `
  <div class="verlauflist">
    ${MOD_ROWS.slice(0, n)
      .map((r) => {
        const m = MODULES.find((x) => x.id === r.id);
        return `
      <button class="vrow2" type="button">
        <span class="vdate2">${r.date}</span>
        <span class="tile grad sm ${r.id}">${mark(r.id, 15)}</span>
        <span class="vname2">${m.label}</span>
        <span class="badge2 ${r.pct >= PASS ? "ok" : "mutedb"}">${r.pct} %</span>
        <span class="chev">${ICON.chevD(16)}</span>
      </button>`;
      })
      .join("")}
  </div>`;

const modVerlauf = (rows = 3, pick = "all") => `
  <div class="card vwrap">
    ${mHead()}
    ${pick === "all" ? `${M1(" mv")}${M2(" mv")}${M3(" mv")}` : pick === "m1" ? M1() : pick === "m2" ? M2() : M3()}
    ${rows ? modRows(rows) : ""}
    <button class="vmore" type="button">Alle ${MOD_TOTAL} anzeigen ${ICON.chevD(14)}</button>
  </div>`;

/* --------------------------------- screens --------------------------------- */

const screen = (tab, device) => `
  <div class="screen"><div class="inner"><div class="col">
    <div class="stage">
      ${header(tab)}
      ${
        tab === "module"
          ? `${moduleGrid()}${modVerlauf(device === "mob" ? 0 : 3)}`
          : `${device === "mob" ? bandMob() : bandDesk()}${runVerlauf("all", device === "mob" ? 0 : 3)}`
      }
    </div>
  </div></div></div>`;

const deskFrame = (label, inner) => `
  <div class="framebox desk"><p class="framelabel">${label}</p><div class="frame desk">${inner}</div></div>`;

const mobFrame = (label, inner) => `
  <div class="framebox phone"><p class="framelabel">${label}</p><div class="frame mob">${inner}</div></div>`;

/** A single card on a page ground, for the variant comparisons. */
const cardStage = (label, inner, narrow = false) => `
  <div class="cardstage${narrow ? " narrow" : ""}">
    <p class="framelabel">${label}</p>
    <div class="frame ${narrow ? "mob" : "desk"}" style="${narrow ? "" : "border-radius:12px"}">
      <div class="screen" style="${narrow ? "height:auto" : ""}"><div class="inner">${inner}</div></div>
    </div>
  </div>`;

/* ---------------------------------- copy ----------------------------------- */

const ANSWERS = [
  [
    "The badge no longer moves anything",
    "The minutes chip is absolutely placed in the card's bottom-right corner, the same corner the colour wash occupies. The card has one fixed height in both clock states, so switching Ohne Zeit / Mit Zeit cannot move a single edge. Section 2 shows both states side by side.",
  ],
  [
    "Module üben gets its own Verlauf",
    "Same card language as the Modelltest one, different content: this one is about the four modules rather than the whole run. Three shapes in section 4. All three need one addition to today's data, described under each.",
  ],
  [
    "Letzter and Bester stay, better drawn",
    "Three visualisations in section 3. All three still state Letzter, Bester and Bestanden, none of them uses the three flat cells. The sample data now has a best (82 %) that is NOT the last run (78 %), so the difference is visible.",
  ],
  [
    "Everything else about B is unchanged",
    "The ticket band, the ladder, the corner wash on the cards, the four hues and the seven shared fixes from round 1 all carry over untouched.",
  ],
];

const V_OPTIONS = [
  {
    id: "v1",
    name: "V1",
    title: "Im Diagramm (in the chart)",
    body: () => runVerlauf(),
    notes: [
      ["The idea", "One object, all three facts. The last bar is the gradient one and labelled \"Letzter 78 %\", the best bar carries a quiet outline and \"Bester 82 %\", and the pass count sits in a caption line under the chart."],
      ["Strength", "Nothing is stated twice, and the two figures are attached to the runs they belong to instead of floating above them."],
      ["Watch", "When the best run IS the last run, the two labels land on the same bar. The rule there is one label reading \"Letzter · Bester 78 %\"."],
    ],
  },
  {
    id: "v2",
    name: "V2",
    title: "Zahl und Kurve (figure and curve)",
    body: () => runVerlauf(),
    notes: [
      ["The idea", "The last score becomes a display figure with a green delta against the run before it, Bester and Bestanden sit under it as two small stats, and the chart carries the shape of the whole history on the right."],
      ["Strength", "The most scannable of the three, and the delta answers \"better or worse than last time\" without the learner reading the chart at all."],
      ["Watch", "A drop shows a red-orange delta (Koralle is reserved, so the down state uses the neutral muted style rather than a warning colour)."],
    ],
  },
  {
    id: "v3",
    name: "V3",
    title: "Ring und Punkte (ring and dots)",
    body: () => runVerlauf(),
    notes: [
      ["The idea", "The last run as a gradient ring with a green tick marking the 60 % pass threshold, then Bester as a slim meter and Bestanden as one dot per run, green where it passed."],
      ["Strength", "The most exam-like of the three: the ring reads as a grade and the dot row reads as a record at a glance. No chart to interpret."],
      ["Watch", "It drops the run-by-run shape, so \"am I improving\" is only answerable from the rows below. Pair with V1's chart only if you want both, which would make the card tall."],
    ],
  },
];

const M_OPTIONS = [
  {
    id: "m1",
    name: "M1",
    title: "Vier Trends (four trends)",
    notes: [
      ["The idea", "One row per module: the mark, the name, the last six attempts as a small bar trend in that module's own colour, and the latest score. A module never practised says so and shows an empty track."],
      ["Strength", "It answers the question the tab exists for, which module needs work, in one glance. It is also the only shape that shows all four modules whether or not they have been practised."],
      ["Watch", "Four rows is the tallest of the three on a phone. It fits, with the practice list resting behind its button (measured: 668 of 668px on a 393x852 phone)."],
    ],
  },
  {
    id: "m2",
    name: "M2",
    title: "Chronik (chronicle)",
    notes: [
      ["The idea", "Exactly the Modelltest Verlauf's shape: one chart of the recent practice, each bar in the colour of the module it belongs to, then the same rows underneath with the module named."],
      ["Strength", "The two tabs then carry the same object, which is the cheapest to build and the easiest to recognise."],
      ["Watch", "Colour is the only thing telling the modules apart in the chart, so a learner who practised Lesen five times in a row sees five green bars and no comparison. It shows activity better than it shows standing."],
    ],
  },
  {
    id: "m3",
    name: "M3",
    title: "Stärkeprofil (strength profile)",
    notes: [
      ["The idea", "Four columns, one per module, filled to the latest score, with a dotted line marking the first attempt, so the distance between line and fill IS the improvement. The mark and name sit under each column."],
      ["Strength", "The most product-like of the three: it reads as a skills profile rather than a log, and the four modules are directly comparable because they share one scale."],
      ["Watch", "It says nothing about when anything happened. The rows below carry that, and a module with a single attempt shows a fill with no dotted line."],
    ],
  },
];

/* ---------------------------------- page ------------------------------------ */

const answersHtml = `
  <div class="panel">
    <div class="findings">
      ${ANSWERS.map(
        (a, i) => `<div class="finding"><span class="num">${i + 1}</span><div><b>${a[0]}</b><p>${a[1]}</p></div></div>`,
      ).join("")}
    </div>
  </div>`;

const variantSection = (o, kind) => `
  <section class="option" id="opt-${o.id}">
    <div class="opthead"><span class="optname">${o.name}</span><h2>${o.title}</h2></div>
    <div class="stagerow">
      ${cardStage("Desktop", kind === "vv" ? runVerlauf(o.id) : modVerlauf(3, o.id))}
      ${cardStage("Phone", kind === "vv" ? runVerlauf(o.id, 2) : modVerlauf(2, o.id), true)}
      <div class="notecol">
        ${o.notes.map((n) => `<p class="note"><b>${n[0]}.</b> ${n[1]}</p>`).join("")}
      </div>
    </div>
  </section>`;

const PAGE_BODY = `<div class="page"><div class="wrap">

  <p class="kicker">Session 190 · round 2</p>
  <h1>Option B, with your four changes</h1>
  <p class="lede" style="margin-top:10px">
    B is locked: the ticket band, the ladder, the corner wash on the module cards and the seven
    shared fixes all carry over. This round only answers the four things you asked for, and it offers
    choices only where you asked for one. Use the control bar to compose a combination, then look at
    section 5, which is the whole page following whatever you picked.
  </p>

  <div class="controls">
    <div class="ctl">
      <span>Appearance</span>
      <div class="seg" id="seg-appearance">
        <button data-k="appearance" data-v="light" aria-pressed="true">Light</button>
        <button data-k="appearance" data-v="dark" aria-pressed="false">Dark</button>
      </div>
    </div>
    <div class="ctl">
      <span>Clock switch</span>
      <div class="seg" id="seg-clock">
        <button data-k="clock" data-v="free" aria-pressed="true">Ohne Zeit</button>
        <button data-k="clock" data-v="timed" aria-pressed="false">Mit Zeit</button>
      </div>
    </div>
    <div class="ctl">
      <span>Modelltest Verlauf</span>
      <div class="seg" id="seg-vv">
        <button data-k="vv" data-v="v1" aria-pressed="true">V1</button>
        <button data-k="vv" data-v="v2" aria-pressed="false">V2</button>
        <button data-k="vv" data-v="v3" aria-pressed="false">V3</button>
      </div>
    </div>
    <div class="ctl">
      <span>Module Verlauf</span>
      <div class="seg" id="seg-mv">
        <button data-k="mv" data-v="m1" aria-pressed="true">M1</button>
        <button data-k="mv" data-v="m2" aria-pressed="false">M2</button>
        <button data-k="mv" data-v="m3" aria-pressed="false">M3</button>
      </div>
    </div>
  </div>

  <section id="answers">
    <h2>1 · Your four points</h2>
    ${answersHtml}
  </section>

  <hr class="rule">

  <section id="cardfix">
    <h2>2 · The module card, one height in both states</h2>
    <p class="lede">
      Same card, photographed in both clock states. The badge sits in the corner the wash already
      occupies, so the grid does not resize when the switch is thrown.
    </p>
    <div class="proof">
      <div class="proofbox">
        <p class="framelabel">Ohne Zeit</p>
        <div class="frame desk" style="border-radius:12px">
          <div class="screen"><div class="inner">${moduleCard(MODULES[2], "free")}</div></div>
        </div>
      </div>
      <div class="proofbox">
        <p class="framelabel">Mit Zeit</p>
        <div class="frame desk" style="border-radius:12px">
          <div class="screen"><div class="inner">${moduleCard(MODULES[2], "timed")}</div></div>
        </div>
      </div>
      <div class="notecol">
        <p class="note"><b>Fixed height.</b> The card reserves the badge's corner in BOTH states, so it is empty in Ohne Zeit and occupied in Mit Zeit at exactly the same card size. Reserving it also stops a two-line description on a phone from running underneath the badge.</p>
        <p class="note"><b>Two right-hand elements.</b> The arrow stays top-right as the affordance, the badge takes bottom-right as the fact. They never share a line.</p>
        <p class="note"><b>Description still swaps.</b> Ohne Zeit shows the trainer's own shape ("Fokus, Kurz und Lang"), Mit Zeit shows the exam module's ("1 Aufgabe · voller Brief"). That is content, not chrome, and it does not change the height.</p>
      </div>
    </div>
  </section>

  <hr class="rule">

  <section id="modelltest">
    <h2>3 · Modelltest Verlauf: three visualisations</h2>
    <p class="lede">
      All three keep Letzter, Bester and Bestanden. The sample has seven runs where the best (82 %)
      is not the last (78 %), so you can see how each one handles that.
    </p>
    ${V_OPTIONS.map((o) => variantSection(o, "vv")).join("")}
  </section>

  <hr class="rule">

  <section id="moduletab">
    <h2>4 · Module üben Verlauf: three shapes</h2>
    <p class="lede">
      New block, same card language. The sample learner has practised Lesen four times, Hören three,
      Schreiben five and Sprechen never, which is the honest shape of a real learner and the one that
      breaks a badly chosen visualisation.
    </p>
    <div class="panel" style="margin-top:14px">
      <div class="findings">
        <div class="finding"><span class="num">!</span><div><b>What this needs beyond today's data</b><p>Timed module runs already write a record with a score, so Lesen, Hören, Schreiben and Sprechen all land here when they are sat against the clock. The untimed trainers are the gap: their results live in the cloud writing history, which this page must not fetch. The fix is one small local stamp per finished practice (module, date, score if there is one), written by all four surfaces, which is a few lines in each. This is the "additional stuff", and it is the same for all three shapes.</p></div></div>
      </div>
    </div>
    ${M_OPTIONS.map((o) => variantSection(o, "mv")).join("")}
  </section>

  <hr class="rule">

  <section id="whole">
    <h2>5 · The whole page, following your picks</h2>
    <p class="lede">
      These four frames follow the control bar above. Change V or M there and these change with them.
      The phone frames are the real content area of a 393 × 852 phone and do not scroll, so anything
      that did not fit would visibly overflow.
    </p>
    <div class="framerow">${deskFrame("Desktop · Module üben", screen("module", "desk"))}</div>
    <div class="framerow">${deskFrame("Desktop · Modelltest", screen("modelltest", "desk"))}</div>
    <div class="framerow" id="phones">
      ${mobFrame("Phone · Module üben", screen("module", "mob"))}
      ${mobFrame("Phone · Modelltest", screen("modelltest", "mob"))}
      <div class="notecol">
        <p class="note"><b>Both tabs now end in a Verlauf.</b> The page has the same rhythm whichever tab you are on: what you can do, then what you have done.</p>
        <p class="note"><b>Still no scrolling at rest.</b> On a phone each Verlauf rests as its summary, with the run list behind its button; opening it is what lets the page grow, under the expand rule. All nine V/M combinations were measured at exactly 668 of the 668px a 393x852 phone leaves.</p>
        <p class="note"><b>A result still appears once per tab.</b> Percentages live in the Verlauf card and nowhere else, on either tab.</p>
      </div>
    </div>
  </section>

  <hr class="rule">

  <section id="answer">
    <h2>6 · How to answer</h2>
    <div class="panel">
      <p class="note">Two letters is enough, for example "V2 and M1".</p>
      <p class="note">Mixing is fine too ("M1's rows but M3's columns"), and so is "the card fix is wrong, move the badge to X".</p>
      <p class="note">Everything is drawn with the app's own tokens, the shipped module marks and the s187 dark palette. Check both with the Light/Dark switch.</p>
    </div>
  </section>

</div></div>`;

const SCRIPT = `
  const root = document.querySelector("[data-marks]");
  const q = new URLSearchParams(location.search);
  ["appearance", "clock", "vv", "mv"].forEach((k) => {
    const v = q.get(k);
    if (v) {
      root.dataset[k] = v;
      const seg = document.getElementById("seg-" + k);
      if (seg) seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
    }
  });
  // Screenshot support: ?only=<id> isolates any section, however deeply nested,
  // by hiding every sibling on its way up to the page wrapper.
  const only = q.get("only");
  const target = only && document.getElementById(only);
  if (target) {
    let node = target;
    while (node && node.parentElement && !node.parentElement.classList.contains("page")) {
      Array.from(node.parentElement.children).forEach((el) => {
        if (el !== node) el.style.display = "none";
      });
      node = node.parentElement;
    }
  }
  // ?measure=1 stamps every phone frame with content-height vs screen-height,
  // so a headless --dump-dom run can prove the "rests at zero scroll" rule
  // instead of a screenshot being eyeballed.
  if (q.get("measure")) {
    document.querySelectorAll(".frame.mob .screen").forEach((sc, i) => {
      if (!sc.clientHeight) return;
      sc.setAttribute("data-fit", i + ":" + sc.scrollHeight + "/" + sc.clientHeight);
    });
  }
  document.querySelectorAll(".seg").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      root.dataset[btn.dataset.k] = btn.dataset.v;
    });
  });
`;

const ATTRS =
  'data-appearance="light" data-clock="free" data-vv="v1" data-mv="m1" data-colors="c2" data-marks="g2"';

writeFileSync(
  OUT,
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prüfung hub: polish review</title>
<style>${REVIEW_CSS}${CSS}</style>
</head>
<body ${ATTRS}>
${PAGE_BODY}
<script>${SCRIPT}</script>
</body>
</html>`,
);

/* Same page as the artifact build, so round 2 redeploys to the round 1 URL. */
writeFileSync(
  ART,
  `<title>Prüfung hub: polish review</title>
<style>${REVIEW_CSS}${CSS}</style>
<div ${ATTRS}>
${PAGE_BODY}
</div>
<script>${SCRIPT}</script>`,
);

console.log("wrote", OUT, "and", ART);
