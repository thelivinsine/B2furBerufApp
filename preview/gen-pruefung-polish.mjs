/**
 * Generates `preview/pruefung-polish.html`.
 *
 * Founder prompt (s190): the two Prüfung tabs "still look cheap or like MVP",
 * and should read like "a billion dollar edu tech app". This page holds the
 * analysis of what is actually making them read that way, and three visibly
 * different answers to it.
 *
 * Everything the founder reads here is ENGLISH; the only German is the copy
 * that is literally app copy inside a mocked screen.
 *
 * Run: node preview/gen-pruefung-polish.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_CSS, ICON, svg, mark, MODULES } from "./gen-pruefung-shared.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "pruefung-polish.html");
const ART = join(DIR, "pruefung-polish-artifact.html");

const TOTAL_MIN = MODULES.reduce((n, m) => n + m.min, 0);

/** The untimed shape of a module, where it differs (the trainers' own modes). */
const FREE_DESC = {
  schreiben: "Fokus, Kurz und Lang",
  sprechen: "Dialoge mit Coaching",
};

/** Populated sample history for the option frames (newest first). */
const HISTORY = [
  { date: "31. Juli", total: 78, parts: { lesen: 82, hoeren: 71, schreiben: 80, sprechen: 78 } },
  { date: "24. Juli", total: 70, parts: { lesen: 74, hoeren: 62, schreiben: 72, sprechen: 71 } },
  { date: "17. Juli", total: 64, parts: { lesen: 70, hoeren: 55, schreiben: 66, sprechen: 64 } },
];
const TOTALS = [52, 55, 61, 58, 64, 70, 78];

const timerOff = (s) =>
  svg(`<path d="M10 2h4"/><path d="M4.6 11a8 8 0 0 0 1.7 8.7 8 8 0 0 0 8.7 1.7"/><path d="M7.4 7.4a8 8 0 0 1 10.3 1 8 8 0 0 1 .9 10.2"/><path d="m2 2 20 20"/><path d="M12 12v-2"/>`, s);

/* --------------------------------------------------------------------------
   Extra CSS on top of the shared review stylesheet. Same app tokens.
   -------------------------------------------------------------------------- */

const CSS = String.raw`
  /* ONE content frame for BOTH tabs. 896px is the module grid's own cap today;
     the Modelltest tab currently runs the full 1152px column, which is why the
     page changes width when you switch. */
  .frame.desk .stage { max-width: 896px; margin: 0 auto; }
  .stage { display: flex; flex-direction: column; gap: 18px; flex: 1; min-height: 0; width: 100%; }
  .frame.mob .stage { gap: 14px; }

  .hdrstack { display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none; }
  /* Height-stable scope row: Modelltest drops the clock switch, and without a
     fixed height everything below shifts on every tab change. */
  .scoperow { display: flex; align-items: center; justify-content: center; gap: 8px; height: 38px; }
  .hdrsw { display: inline-flex; width: auto; }
  .frame.desk .hdrsw { min-width: 0; }
  .frame.mob .hdrsw { display: flex; width: 100%; }
  .hdrsw > button { font-size: 14px; padding: 6px 20px; }

  /* Clock-mode switch on the review page swaps both card states at once. */
  [data-clock="timed"] .onfree { display: none; }
  [data-clock="free"] .ontimed { display: none; }

  /* Premium marks: a soft in-family gradient instead of one flat 12% wash. */
  .tile.grad.lesen { background: linear-gradient(150deg, rgba(16,185,129,.20), rgba(16,185,129,.06)); }
  .tile.grad.hoeren { background: linear-gradient(150deg, rgba(20,184,166,.20), rgba(20,184,166,.06)); }
  .tile.grad.schreiben { background: linear-gradient(150deg, hsl(var(--primary) / .20), hsl(var(--primary) / .05)); }
  .tile.grad.sprechen { background: linear-gradient(150deg, rgba(14,165,233,.20), rgba(14,165,233,.06)); }
  [data-appearance="dark"] .tile.grad.lesen { background: linear-gradient(150deg, rgba(52,211,153,.24), rgba(52,211,153,.08)); }
  [data-appearance="dark"] .tile.grad.hoeren { background: linear-gradient(150deg, rgba(45,212,191,.24), rgba(45,212,191,.08)); }
  [data-appearance="dark"] .tile.grad.schreiben { background: linear-gradient(150deg, hsl(var(--primary) / .26), hsl(var(--primary) / .08)); }
  [data-appearance="dark"] .tile.grad.sprechen { background: linear-gradient(150deg, rgba(56,189,248,.24), rgba(56,189,248,.08)); }
  .tile.xxl { width: 54px; height: 54px; border-radius: 12px; }
  .tile.neutral { background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }

  /* --- module grid + card ---------------------------------------------- */
  .grid2x2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .frame.mob .grid2x2 { gap: 12px; }
  .pcard {
    position: relative; overflow: hidden; display: flex; flex-direction: column;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 10px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
    text-align: left; cursor: pointer; padding: 16px;
    transition: transform .16s ease, box-shadow .16s ease;
  }
  .frame.desk .pcard { padding: 20px 22px; }
  .pcard:hover { transform: translateY(-2px); box-shadow: 0 2px 4px hsl(var(--shadow) / .08), 0 12px 24px -6px hsl(var(--shadow) / .16); }
  .ptitle { font-size: 17px; font-weight: 700; letter-spacing: -.015em; line-height: 1.15; }
  .frame.desk .ptitle { font-size: 20px; }
  .pdesc { margin-top: 4px; font-size: 12.5px; line-height: 1.35; color: hsl(var(--muted-foreground)); }
  .frame.desk .pdesc { font-size: 14px; }
  .pfoot { margin-top: auto; padding-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; min-height: 26px; }
  .pfoot.hair { margin-top: 14px; padding-top: 11px; border-top: 1px solid hsl(var(--border) / .75); }
  .goarrow {
    display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 7px;
    color: hsl(var(--muted-foreground)); background: hsl(var(--muted) / .8);
    transition: background .16s ease, color .16s ease;
  }
  .pcard:hover .goarrow { background: hsl(var(--primary) / .12); color: hsl(var(--primary)); }
  /* Option A: mark, title and the affordance on ONE line, description under
     it. No foot row at all, which is where the third of the card's height
     goes. On a phone there is no room for that line, so the title drops to its
     own row and the head keeps the mark and the arrow. */
  .a-head { display: flex; align-items: center; gap: 12px; }
  .a-head .goarrow { margin-left: auto; }
  .a-card .pdesc { margin-top: 10px; }
  .frame.mob .a-head { flex-wrap: wrap; gap: 0 12px; }
  .frame.mob .a-head .ptitle { order: 3; width: 100%; margin-top: 11px; }
  .frame.mob .a-card .pdesc { margin-top: 4px; }

  /* Option C: the meter and the arrow are a desktop luxury; a 165px phone card
     keeps the sentence, which is the part that carries the meaning. */
  .frame.mob .c-card .meter, .frame.mob .c-card .goarrow { display: none; }
  .frame.mob .c-card .cstate { font-size: 11.5px; }

  /* --- Option B: corner wash + ticket band -------------------------------- */
  /* The card's own hue, breathed into its bottom-right corner. An enlarged
     outline glyph was tried first and read as a rendering artefact; a wash at
     8% carries the same "this half is occupied on purpose" without adding a
     second readable mark. */
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
  .b-card { min-height: 150px; }
  .b-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
  .b-card .pfoot { padding-top: 12px; }
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

  /* --- Option B: development strip -------------------------------------- */
  .devwrap { padding: 13px 16px 14px; }
  .devhead { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .devbody { margin-top: 12px; display: flex; align-items: flex-end; gap: 14px; }
  /* Fixed-width bars, not stretched ones: seven bars across a 830px card read
     as a block of grey, seven 26px bars read as a trend. */
  .devbars { position: relative; display: flex; align-items: flex-end; gap: 8px; height: 64px; padding-top: 10px; }
  .devbar { width: 26px; border-radius: 4px 4px 2px 2px; background: hsl(var(--primary) / .30); }
  .devbar.last { background: linear-gradient(180deg, hsl(var(--primary)), hsl(var(--gradient-to))); }
  .passline { position: absolute; left: -4px; right: -4px; border-top: 1px dashed hsl(var(--success) / .7); }
  .passlab { position: absolute; left: 0; transform: translateY(-115%); font-size: 10.5px; font-weight: 650; color: hsl(var(--success)); }
  .frame.mob .devbody { flex-direction: column; align-items: flex-start; gap: 6px; }
  .devcap { font-size: 12.5px; color: hsl(var(--muted-foreground)); padding-bottom: 2px; }
  .devcap b { display: block; color: hsl(var(--foreground)); font-size: 20px; font-weight: 800; letter-spacing: -.02em; line-height: 1.1; }

  /* --- Option C: practice state ----------------------------------------- */
  .meter { display: flex; gap: 3px; align-items: center; }
  .meter i { width: 13px; height: 4px; border-radius: 999px; background: hsl(var(--muted)); display: block; }
  .meter i.on { background: hsl(var(--primary) / .8); }
  .cstate { display: flex; align-items: center; gap: 8px; font-size: 12px; color: hsl(var(--muted-foreground)); }
  .bandnote { margin-top: 12px; text-align: center; font-size: 12.5px; color: hsl(var(--muted-foreground)); }

  /* --- band ------------------------------------------------------------- */
  .pband { padding: 18px 20px 20px; display: flex; flex-direction: column; }
  .frame.mob .pband { flex: 1; }
  .pbandhead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
  .totalchip { font-size: 13.5px; color: hsl(var(--muted-foreground)); }
  .totalchip b { color: hsl(var(--foreground)); font-weight: 700; }
  .track.tight { max-width: 560px; margin-left: auto; margin-right: auto; width: 100%; }
  .ctacenter { margin-top: 18px; display: flex; justify-content: center; }
  .frame.mob .ctacenter .btn { width: 100%; }

  /* --- Verlauf ----------------------------------------------------------- */
  .vwrap { overflow: hidden; display: flex; flex-direction: column; }
  /* The shipped cap (max-h-[19rem]) with the list scrolling inside it, so the
     phone frames here fail visibly if a composition does not fit. */
  .frame.mob .vwrap { flex: none; max-height: 17.5rem; }
  .frame.mob .vwrap .rowlist { min-height: 0; flex: 1; overflow-y: auto; }
  .vtop { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; padding: 13px 16px 10px; flex: none; }
  .kpis { display: grid; grid-template-columns: repeat(3, 1fr); border-top: 1px solid hsl(var(--border)); border-bottom: 1px solid hsl(var(--border)); flex: none; }
  .kpi { padding: 10px 8px; text-align: center; position: relative; }
  .kpi + .kpi::before { content: ""; position: absolute; left: 0; top: 8px; bottom: 8px; width: 1px; background: hsl(var(--border)); }
  .kpi p:first-child { font-size: 12px; color: hsl(var(--muted-foreground)); }
  .kpi p:last-child { margin-top: 2px; font-size: 19px; font-weight: 800; letter-spacing: -.02em; }
  .vempty { padding: 15px 16px 17px; display: flex; align-items: flex-start; gap: 12px; border-top: 1px solid hsl(var(--border)); }
  .vempty .txt { font-size: 13px; line-height: 1.4; color: hsl(var(--muted-foreground)); }
  .vempty .txt b { display: block; color: hsl(var(--foreground)); font-size: 14.5px; font-weight: 650; margin-bottom: 2px; }
  .vmore { width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 9px; background: transparent; border: 0; border-top: 1px solid hsl(var(--border)); cursor: pointer; font-size: 12.5px; font-weight: 650; color: hsl(var(--primary)); flex: none; }

  /* --- comparison block --------------------------------------------------- */
  .compare { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 18px; margin-top: 16px; align-items: start; }
  .compare .frame .screen { padding: 20px 18px; }
  .cmplabel { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; color: var(--c-muted); margin: 0 0 7px; }
`;

/* --------------------------------------------------------------------------
   Shared screen furniture
   -------------------------------------------------------------------------- */

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

/** The locked header: switcher, then the scope row below it, both centred. */
const header = (tab, { stable = true } = {}) => `
  <div class="hdrstack">
    ${modeSwitch(tab)}
    <div class="scoperow"${stable ? "" : ' style="height:auto"'}>
      ${tab === "module" ? clockSwitch() : ""}${niveau()}
    </div>
  </div>`;

const timeChip = (min) => `<span class="timechip tnum">${ICON.clock(13)}${min} Min</span>`;
const goArrow = () => `<span class="goarrow">${ICON.arrowR(15)}</span>`;

/** Description that swaps with the clock switch (both states in the DOM). */
const desc = (m) =>
  FREE_DESC[m.id]
    ? `<span class="onfree">${FREE_DESC[m.id]}</span><span class="ontimed">${m.desc}</span>`
    : m.desc;

const track = (tight) => `
  <div class="track${tight ? " tight" : ""}">
    ${MODULES.map(
      (m) => `
      <div class="tnode">
        <span class="dot tile grad ${m.id}">${mark(m.id, 19)}</span>
        <span class="lab">${m.label}</span>
        <span class="min tnum">${m.min} Min</span>
      </div>`,
    ).join("")}
  </div>`;

/* ------------------------------ TODAY (as shipped) ------------------------- */

const todayGrid = () => `
  <div class="grid2x2" style="max-width:896px;margin:0 auto;width:100%;gap:22px">
    ${MODULES.map(
      (m) => `
      <button class="modcard" type="button" style="padding:24px;border-radius:10px">
        <span class="tile ${m.id}" style="width:64px;height:64px;border-radius:14px">${mark(m.id, 32)}</span>
        <span class="modname" style="margin-top:16px;font-size:20px;font-weight:600;line-height:1.15">${m.label}</span>
        <span class="moddesc" style="margin-top:6px;font-size:14px">${FREE_DESC[m.id] ?? m.desc}</span>
        <span class="modfoot" style="justify-content:flex-start;padding-top:20px">
          <span class="timechip">${timerOff(13)} Ohne Uhr</span>
        </span>
      </button>`,
    ).join("")}
  </div>`;

const todayTrack = () => `
  <div class="track" style="margin-top:14px">
    ${MODULES.map(
      (m) => `
      <div class="tnode">
        <span class="dot tile ${m.id}">${mark(m.id, 19)}</span>
        <span class="lab">${m.label}</span>
        <span class="min tnum">${m.min} Min</span>
      </div>`,
    ).join("")}
  </div>`;

const todayVerlauf = () => `
  <div class="card vwrap">
    <div class="vtop"><p class="eyebrow mut">Verlauf</p><p class="vcount tnum">1 Durchlauf</p></div>
    <div class="kpis">
      <div class="kpi"><p>Letzter</p><p class="tnum">–</p></div>
      <div class="kpi"><p>Bester</p><p class="tnum">–</p></div>
      <div class="kpi"><p>Bestanden</p><p class="tnum">–</p></div>
    </div>
    <div class="rowlist">
      <button class="row vrow" type="button">
        <span class="vdate tnum">4. Aug.</span>
        <span class="mini">${MODULES.map(() => `<span></span>`).join("")}</span>
        <span class="chev" style="margin-left:auto">${ICON.chevD(16)}</span>
      </button>
    </div>
  </div>`;

const todayScreen = (tab) => `
  <div class="screen"><div class="inner"><div class="col">
    ${header(tab, { stable: false })}
    ${
      tab === "module"
        ? todayGrid()
        : `<div class="card pband">
             <p class="eyebrow mut">Komplette Prüfung</p>
             ${todayTrack()}
             <div class="ctacenter"><button class="btn grad" type="button">${ICON.play(15)} Prüfung starten</button></div>
           </div>
           ${todayVerlauf()}`
    }
  </div></div></div>`;

/* --------------------------------- Verlauf --------------------------------- */

const verlaufRow = (r) => `
  <button class="row vrow" type="button">
    <span class="vdate tnum">${r.date}</span>
    <span class="mini">${MODULES.map((m) => `<span><i class="bar-${m.id}" style="width:${r.parts[m.id]}%"></i></span>`).join("")}</span>
    <span class="badge ${r.total >= 60 ? "ok" : "mutedb"} tnum" style="margin-left:auto">${r.total} %</span>
    <span class="chev">${ICON.chevD(16)}</span>
  </button>`;

const verlaufKpi = () => `
  <div class="card vwrap">
    <div class="vtop"><p class="eyebrow mut">Verlauf</p><p class="vcount tnum">7 Durchläufe</p></div>
    <div class="kpis">
      <div class="kpi"><p>Letzter</p><p class="tnum">78 %</p></div>
      <div class="kpi"><p>Bester</p><p class="tnum">78 %</p></div>
      <div class="kpi"><p>Bestanden</p><p class="tnum">4 von 7</p></div>
    </div>
    <div class="rowlist">${HISTORY.map(verlaufRow).join("")}</div>
    <button class="vmore" type="button">Alle 7 anzeigen ${ICON.chevD(14)}</button>
  </div>`;

const devStrip = () => `
  <div class="devwrap">
    <div class="devhead">
      <p class="eyebrow mut">Verlauf</p>
      <p class="vcount tnum">7 Durchläufe</p>
    </div>
    <div class="devbody">
      <div class="devbars">
        <span class="passline" style="bottom:${(60 / 100) * 64}px"><span class="passlab">60 % bestanden</span></span>
        ${TOTALS.map(
          (t, i) => `<span class="devbar${i === TOTALS.length - 1 ? " last" : ""}" style="height:${(t / 100) * 64}px"></span>`,
        ).join("")}
      </div>
      <p class="devcap"><b class="tnum">+26</b>Prozentpunkte seit dem ersten Durchlauf</p>
    </div>
  </div>`;

const verlaufDev = () => `
  <div class="card vwrap">
    ${devStrip()}
    <div class="rowlist" style="border-top:1px solid hsl(var(--border))">${HISTORY.map(verlaufRow).join("")}</div>
    <button class="vmore" type="button">Alle 7 anzeigen ${ICON.chevD(14)}</button>
  </div>`;

const verlaufEmpty = () => `
  <div class="card vwrap">
    <div class="vtop"><p class="eyebrow mut">Verlauf</p><p class="vcount tnum">1 Durchlauf</p></div>
    <div class="vempty">
      <span class="tile neutral" style="width:34px;height:34px;border-radius:9px">${ICON.clock(17)}</span>
      <span class="txt"><b>Noch keine Bewertung</b>Der Durchlauf vom 4. August wurde abgebrochen. Sitze ihn zu Ende, dann steht hier dein Ergebnis.</span>
    </div>
  </div>`;

/* ------------------------------- OPTION A ---------------------------------- */

const aGrid = () => `
  <div class="grid2x2">
    ${MODULES.map(
      (m) => `
      <button class="pcard a-card" type="button">
        <span class="a-head">
          <span class="tile grad lg ${m.id}">${mark(m.id, 21)}</span>
          <span class="ptitle">${m.label}</span>
          ${goArrow()}
        </span>
        <span class="pdesc">${desc(m)}<span class="ontimed tnum"> · ${m.min} Min</span></span>
      </button>`,
    ).join("")}
  </div>`;

const bandHead = () => `
  <div class="pbandhead">
    <p class="eyebrow mut">Komplette Prüfung</p>
    <span class="totalchip tnum"><b>${TOTAL_MIN} Min</b> gesamt</span>
  </div>`;

const aBand = () => `
  <div class="card pband">
    ${bandHead()}
    <div class="trackwrap">${track(true)}</div>
    <div class="ctacenter"><button class="btn grad" type="button">${ICON.play(15)} Prüfung starten</button></div>
  </div>`;

/* ------------------------------- OPTION B ---------------------------------- */

const bGrid = () => `
  <div class="grid2x2">
    ${MODULES.map(
      (m) => `
      <button class="pcard b-card ${m.id}" type="button">
        <span class="b-top">
          <span class="tile grad xxl ${m.id}">${mark(m.id, 26)}</span>
          ${goArrow()}
        </span>
        <span class="ptitle" style="margin-top:13px">${m.label}</span>
        <span class="pdesc">${desc(m)}</span>
        <span class="pfoot ontimed">${timeChip(m.min)}</span>
      </button>`,
    ).join("")}
  </div>`;

const bBandDesk = () => `
  <div class="card" style="overflow:hidden">
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

/** Phone keeps today's stacked band: the ticket is a desktop composition. */
const bBandMob = () => `
  <div class="card pband">
    ${bandHead()}
    <p class="cdown tnum" style="margin-top:6px">${ICON.clock(13)}Noch 24 Tage bis zum 29. August</p>
    <div class="trackwrap">${track(false)}</div>
    <div class="ctacenter"><button class="btn grad" type="button">${ICON.play(15)} Prüfung starten</button></div>
  </div>`;

/* ------------------------------- OPTION C ---------------------------------- */

const C_STATE = {
  lesen: { done: 4, when: "vor 2 Tagen" },
  hoeren: { done: 2, when: "vor 9 Tagen" },
  schreiben: { done: 5, when: "gestern" },
  sprechen: { done: 0, when: "Noch nicht geübt" },
};

const cGrid = () => `
  <div class="grid2x2">
    ${MODULES.map((m) => {
      const st = C_STATE[m.id];
      return `
      <button class="pcard c-card" type="button" style="min-height:160px">
        <span class="tile grad xxl ${m.id}">${mark(m.id, 26)}</span>
        <span class="ptitle" style="margin-top:13px">${m.label}</span>
        <span class="pdesc">${desc(m)}</span>
        <span class="pfoot hair">
          <span class="cstate">
            <span class="meter">${[0, 1, 2, 3, 4].map((i) => `<i class="${i < st.done ? "on" : ""}"></i>`).join("")}</span>
            ${st.when}
          </span>
          <span class="ontimed">${timeChip(m.min)}</span><span class="onfree">${goArrow()}</span>
        </span>
      </button>`;
    }).join("")}
  </div>`;

const cBand = () => `
  <div class="card pband">
    ${bandHead()}
    <div class="trackwrap">${track(true)}</div>
    <div class="ctacenter"><button class="btn grad" type="button">${ICON.play(15)} Prüfung starten</button></div>
    <p class="bandnote tnum">7 Durchläufe · zuletzt vor 5 Tagen</p>
  </div>`;

/* --------------------------------- screens --------------------------------- */

const BODY = {
  a: { module: aGrid, desk: () => `${aBand()}${verlaufKpi()}`, mob: () => `${aBand()}${verlaufKpi()}` },
  b: { module: bGrid, desk: () => `${bBandDesk()}${verlaufDev()}`, mob: () => `${bBandMob()}${verlaufDev()}` },
  c: { module: cGrid, desk: () => `${cBand()}${verlaufKpi()}`, mob: () => `${cBand()}${verlaufKpi()}` },
};

const optionScreen = (opt, tab, device) => `
  <div class="screen"><div class="inner"><div class="col">
    <div class="stage">
      ${header(tab)}
      ${tab === "module" ? BODY[opt].module() : BODY[opt][device]()}
    </div>
  </div></div></div>`;

const deskFrame = (label, inner) => `
  <div class="framebox desk">
    <p class="framelabel">${label}</p>
    <div class="frame desk">${inner}</div>
  </div>`;

const mobFrame = (label, inner) => `
  <div class="framebox phone">
    <p class="framelabel">${label}</p>
    <div class="frame mob">${inner}</div>
  </div>`;

/* --------------------------------- findings -------------------------------- */

const FINDINGS = [
  {
    g: "Composition",
    items: [
      [
        "The two tabs are not the same page width",
        "Module üben caps its grid at 896px and centres it; Modelltest lets the band and Verlauf run the full 1152px column. The page frame visibly jumps every time you switch tabs.",
      ],
      [
        "The run band is a phone row stretched over a desktop",
        "Four 44px marks separated by about 430px of hairline, in a card that is otherwise empty. At phone width the timeline works. At desktop width it reads as four lonely icons, not as a sequence.",
      ],
      [
        "The scope row changes height between tabs",
        "Modelltest hides the clock switch, so the row drops from two controls to one and everything below shifts. A small movement, on every single tab change.",
      ],
      [
        "The module cards are low on density",
        "Each card is about 420 × 240px and holds a 64px mark, one title, one line of text and a chip. Empty space reads as premium only when something is deliberately placed in it. Here nothing is, so the four cards read as placeholders waiting for content.",
      ],
    ],
  },
  {
    g: "Content",
    items: [
      [
        "\"Ohne Uhr\" is printed four times, under a switch that already says \"Ohne Zeit\"",
        "In the resting state those four chips carry no information at all. They earn their place only in \"Mit Zeit\", where they become the per-module minutes.",
      ],
      [
        "The length of the exam is never stated",
        "Before a full sitting, \"how long will this take\" is the number that decides whether the learner starts now or later. Today they have to add 15 + 10 + 20 + 7 themselves.",
      ],
      [
        "The first visit is a table of dashes",
        "One unfinished run produces three KPIs reading \"–\", \"–\", \"–\", a row of four empty grey bars, and no score. Everything about it is honest and all of it looks broken. This is the strongest MVP signal on either tab.",
      ],
      [
        "The page holds no memory of the learner",
        "Four modules, named identically on every visit. Nothing says which one was practised last, which one has been left alone for a month, or that anything has ever happened here.",
      ],
    ],
  },
  {
    g: "Craft",
    items: [
      [
        "The cards do not look pressable",
        "No arrow, no chevron, no pressed state. Next to a Bibliothek word card, which carries a bookmark and a speak button, these read as panels that happen to react to hover.",
      ],
      [
        "The type sits in one narrow band",
        "Title, description and chip are within a few steps of each other in size and weight. Nothing on either tab carries the confident display voice the rest of the app uses.",
      ],
      [
        "The module marks are flat 10% washes",
        "Premium in this design system means a subtle gradient, never a flat tint. A soft in-family gradient inside each tile lifts all four at once, and changes no hue.",
      ],
      [
        "The tab switch does not move",
        "Bibliothek slides its panels directionally on every tab change. This page swaps its content with no transition at all, which is exactly where a surface starts to feel unfinished.",
      ],
    ],
  },
];

const SHARED_FIXES = [
  ["One frame for both tabs", "Both tabs sit in the same 896px centred column, so switching never changes the page's width."],
  ["A height-stable scope row", "The row keeps its height when the clock switch is hidden, so nothing below shifts on a tab change."],
  ["The redundant chip is gone", "At rest the card foot carries the affordance. In \"Mit Zeit\" the minutes chip returns, where it is a fact rather than an echo."],
  ["The total is stated once", `"${TOTAL_MIN} Min gesamt" beside the band's eyebrow. Per-part minutes stay on the timeline, so no number is printed twice.`],
  ["No dash tables", "With nothing scored yet, Verlauf says so in one line instead of three empty KPI cells."],
  ["Marks get a soft in-family gradient", "The same four hues and the same receptive/productive pairing, one step less flat."],
  ["The cards read as pressable", "An arrow that answers on hover, plus the directional tab slide Bibliothek already uses."],
];

const OPTIONS = [
  {
    id: "a",
    name: "Option A",
    title: "Verdichtet (Tightened)",
    blurb:
      "Nothing moves. The card interior is rebalanced so the mark and the title share one line, the card loses roughly a third of its height, and the 2×2 block becomes wide and calm instead of tall and empty. The Modelltest band keeps today's timeline, now at a width where four marks read as one sequence instead of four islands.",
    notes: [
      ["What changes", "The card interior, the shared frame width, the capped timeline, and the seven fixes above. The skeleton of both tabs is untouched."],
      ["Why it can read as expensive", "Restraint reads as expensive when the spacing is exact and nothing is left over. This is the quiet, tool-grade answer."],
      ["Watch", "It is the least dramatic of the three. If the current page feels thin, tightening it makes it thinner still, only better made."],
    ],
    cost: "About one working session. No new data, no new store fields, no per-breakpoint divergence.",
  },
  {
    id: "b",
    name: "Option B",
    title: "Prüfungstag (Exam Day)",
    blurb:
      "The Modelltest tab stops being a strip and becomes an object. On desktop the band is a two-column ticket: the total as a display number, the countdown and the CTA on the left, the four Teile as a connected ladder on the right. Verlauf leads with development, the last seven totals against the pass line, instead of three KPI cells. The module cards keep the stacked shape and gain a soft wash of their own colour in the bottom corner, so the empty half of the card is occupied on purpose.",
    notes: [
      ["What changes", "A desktop composition for the band, a development strip at the head of Verlauf, and a colour wash on the module cards."],
      ["Why it can read as expensive", "A big honest number plus a real ladder is what an exam product looks like when it is confident. The development strip also answers \"am I getting better\", which nothing on this page answers today."],
      ["Watch", "The band has two shapes: the ticket on desktop, today's stacked band on a phone (the phone frame below shows it). The corner wash has to stay at 13% of an already pale hue: any louder and it becomes decoration, which the colour rules do not allow."],
    ],
    cost:
      "About one and a half sessions. The development strip reads the same mockExams records Verlauf already reads, so there is no new data and no new fetch.",
  },
  {
    id: "c",
    name: "Option C",
    title: "Bereit (Ready)",
    blurb:
      "The page starts remembering the learner. Every module card carries a five-step practice meter and when it was last practised (\"gestern\", \"vor 9 Tagen\", or an empty meter and \"Noch nicht geübt\"), so the four cards stop being an identical menu and start pointing somewhere. The run band closes with one quiet line: how many full runs, and how long ago the last one was.",
    notes: [
      ["What changes", "A practice-state line on every module card and a recency line under the band's CTA. Band and Verlauf otherwise match Option A."],
      ["Why it can read as expensive", "A menu that never changes reads as a prototype. A surface that knows what you did last week reads as a product. This is the biggest perceived jump of the three."],
      ["Watch, rule tension", "\"A result is shown in ONE place per page\" (founder, s188). These lines carry recency and practice count, never a score, so Verlauf stays the only place a percentage appears. If that still sits too close to the line, the meters come out and C collapses into A."],
    ],
    cost:
      "About one and a half sessions, plus one small store addition: a local last-practised stamp per module, written by all four surfaces. Lesen and Hören could be derived from the mockExams records that already exist, but Schreiben and Sprechen practice lives in the cloud writing history, which this page must not fetch (the hub stays light).",
  },
];

/* ---------------------------------- page ----------------------------------- */

const findingsHtml = FINDINGS.map(
  (grp, gi) => `
  <div class="panel">
    <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:.12em;color:var(--c-accent)">${grp.g}</h3>
    <div class="findings">
      ${grp.items
        .map(
          (f, i) => `
        <div class="finding">
          <span class="num">${gi * 4 + i + 1}</span>
          <div><b>${f[0]}</b><p>${f[1]}</p></div>
        </div>`,
        )
        .join("")}
    </div>
  </div>`,
).join("");

const optionHtml = (o) => `
  <section class="option" id="opt-${o.id}">
    <div class="opthead">
      <span class="optname">${o.name}</span>
      <h2>${o.title}</h2>
    </div>
    <p class="lede">${o.blurb}</p>

    <div class="framerow">
      ${deskFrame("Desktop · Module üben", optionScreen(o.id, "module", "desk"))}
    </div>
    <div class="framerow">
      ${deskFrame("Desktop · Modelltest", optionScreen(o.id, "modelltest", "desk"))}
    </div>
    <div class="framerow">
      ${mobFrame("Phone · Module üben", optionScreen(o.id, "module", "mob"))}
      ${mobFrame("Phone · Modelltest", optionScreen(o.id, "modelltest", "mob"))}
      <div class="notecol">
        ${o.notes.map((n) => `<p class="note"><b>${n[0]}.</b> ${n[1]}</p>`).join("")}
        <p class="cost"><b>Cost:</b> ${o.cost}</p>
      </div>
    </div>
  </section>`;

const PAGE_BODY = `<div class="page"><div class="wrap">

  <p class="kicker">Session 190 · design review</p>
  <h1>The Prüfung hub, made to look expensive</h1>
  <p class="lede" style="margin-top:10px">
    Both tabs work, and the structure was settled two sessions ago. What makes them read as
    unfinished is twelve specific things: a page that changes width when you switch tabs, a desktop
    band that is a phone row stretched wide, a chip printed four times that repeats the switch above
    it, and a first visit that greets the learner with a table of dashes. The three options below
    keep the structure and answer those twelve in three different ways.
  </p>

  <div class="controls">
    <div class="ctl">
      <span>Appearance</span>
      <div class="seg" id="seg-appearance">
        <button data-v="light" aria-pressed="true">Light</button>
        <button data-v="dark" aria-pressed="false">Dark</button>
      </div>
    </div>
    <div class="ctl">
      <span>Clock switch</span>
      <div class="seg" id="seg-clock">
        <button data-v="free" aria-pressed="true">Ohne Zeit</button>
        <button data-v="timed" aria-pressed="false">Mit Zeit</button>
      </div>
    </div>
  </div>

  <h2>1 · What is making it look cheap</h2>
  ${findingsHtml}

  <hr class="rule">

  <section class="option" id="today">
    <div class="opthead"><span class="optname" style="background:var(--c-muted)">Today</span><h2>The page as it ships</h2></div>
    <p class="lede">Rebuilt from the shipped component at the same widths, so the comparison below is fair.</p>
    <div class="framerow">
      ${deskFrame("Desktop · Module üben", todayScreen("module"))}
    </div>
    <div class="framerow">
      ${deskFrame("Desktop · Modelltest, first visit", todayScreen("modelltest"))}
      <div class="notecol">
        <p class="note"><b>The width jump.</b> The grid above stops at 896px; the band and Verlauf below run the full 1152px column.</p>
        <p class="note"><b>The dashes.</b> One unfinished run: three empty KPIs, four empty bars, no score. Nothing here is wrong, and all of it looks broken.</p>
        <p class="note"><b>The stretch.</b> The four marks are 44px each, with roughly 430px of hairline between them.</p>
      </div>
    </div>
  </section>

  <hr class="rule">

  <h2>2 · What all three options fix</h2>
  <div class="panel">
    <div class="findings">
      ${SHARED_FIXES.map(
        (f, i) => `<div class="finding"><span class="num">${i + 1}</span><div><b>${f[0]}</b><p>${f[1]}</p></div></div>`,
      ).join("")}
    </div>
  </div>

  <hr class="rule">

  <h2>3 · Three ways to go</h2>
  ${OPTIONS.map(optionHtml).join("")}

  <hr class="rule">

  <section id="firstvisit">
  <h2>4 · The first visit, before and after</h2>
  <p class="lede">The same learner in both: one run started, never finished.</p>
  <div class="compare">
    <div>
      <p class="cmplabel">Today</p>
      <div class="frame desk"><div class="screen"><div class="inner">${todayVerlauf()}</div></div></div>
    </div>
    <div>
      <p class="cmplabel">Proposed, in all three options</p>
      <div class="frame desk"><div class="screen"><div class="inner">${verlaufEmpty()}</div></div></div>
    </div>
  </div>
  </section>

  <hr class="rule">

  <h2>5 · How to answer</h2>
  <div class="panel">
    <p class="note">Name one option (A, B or C), or mix them: "B's band, A's cards, C's meters" is a valid answer.</p>
    <p class="note">The seven shared fixes ship with whichever option is picked, unless one of them is wrong.</p>
    <p class="note">Everything here is drawn with the app's own tokens, the shipped module marks and the s187 dark palette. Use the Light/Dark switch above to check both, and the clock switch to see the module cards in their timed state.</p>
  </div>

</div></div>`;

const SCRIPT = `
  const root = document.querySelector("[data-marks]");
  // Screenshot support: file:///…?dark=1&timed=1&only=opt-b renders that state
  // directly, so a headless capture can check every combination.
  const q = new URLSearchParams(location.search);
  if (q.get("dark")) root.dataset.appearance = "dark";
  if (q.get("timed")) root.dataset.clock = "timed";
  const only = q.get("only");
  if (only) {
    document.querySelectorAll(".wrap > *").forEach((el) => {
      if (el.id !== only) el.style.display = "none";
    });
  }
  document.querySelectorAll(".seg").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      if (seg.id === "seg-appearance") root.dataset.appearance = btn.dataset.v;
      if (seg.id === "seg-clock") root.dataset.clock = btn.dataset.v;
    });
  });
`;

const ATTRS = 'data-appearance="light" data-clock="free" data-colors="c2" data-marks="g2"';

/* The standalone review page. */
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

/* The artifact build: same page, wrapped in a div instead of <body>, because
   the artifact host supplies the document skeleton itself. */
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
