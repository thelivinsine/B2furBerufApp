/**
 * Generates `preview/pruefung-header-align.html`.
 *
 * Founder prompt (this session): the s196 change that replaced the "Guten
 * Morgen" greeting with a big page title left the Prüfung hub "looking
 * ridiculous". Their ORIGINAL request (s196, prompt 1, verbatim) was:
 *
 *   "Instead of guten morgen greeting, use that space to show a big header
 *    like Prufung or Bibliothek aligned to left vertically with the toggle
 *    buttons"
 *
 * What shipped put the title in the APP header at the far-left app gutter,
 * while the page's own controls and tiles stayed centred in three different
 * nested widths. So nothing shares a left edge, which is exactly the thing the
 * founder asked for.
 *
 * This page is: the diagnosis (today, measured from the code), then three
 * options for where the title lives and what it aligns to. Every screen is
 * drawn from the real tokens in `gen-pruefung-shared.mjs`.
 *
 * Run: node preview/gen-pruefung-header-align.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_CSS, ICON, svg } from "./gen-pruefung-shared.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "pruefung-header-align.html");
const ART = join(DIR, "pruefung-header-align-artifact.html");

/* --------------------------------- icons ---------------------------------- */

const I = {
  ...ICON,
  flame: (s) => svg(`<path d="M12 2c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 2 2 2 0 0-2-1-3 1-5z"/>`, s),
  user: (s) => svg(`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`, s),
  home: (s) => svg(`<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>`, s),
  books: (s) => svg(`<path d="M4 4h6v16H4z"/><path d="M14 4h6v16h-6z"/>`, s),
  target: (s) => svg(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>`, s),
  chart: (s) => svg(`<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>`, s),
  cog: (s) => svg(`<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>`, s),
};

/* ------------------------------- sample data ------------------------------- */

const MODS = [
  { id: "lesen", label: "Lesen", min: 15 },
  { id: "hoeren", label: "Hören", min: 10 },
  { id: "schreiben", label: "Schreiben", min: 20 },
  { id: "sprechen", label: "Sprechen", min: 7 },
];

// "With practice" sample: first attempt (pale) and where they are now (solid).
const PROFILE = {
  lesen: { first: 58, last: 74 },
  hoeren: { first: 44, last: 61 },
  schreiben: { first: 66, last: 72 },
  sprechen: { first: 52, last: 69 },
};

const ROWS = [
  { date: "4. Aug.", mod: "sprechen", label: "Sprechen", pct: 69 },
  { date: "2. Aug.", mod: "lesen", label: "Lesen", pct: 74 },
  { date: "31. Juli", mod: "hoeren", label: "Hören", pct: 61 },
];

/* ------------------------------- app furniture ----------------------------- */

const SIDE_ITEMS = [
  ["home", "Praktisch"],
  ["books", "Bibliothek"],
  ["target", "Prüfung"],
  ["chart", "Fortschritt"],
  ["cog", "Einstellungen"],
];

const sidebar = () => `
  <div class="side">
    <div class="sidebrand"><span class="logomark"></span><b>Genauly</b></div>
    <div class="sidenav">
      ${SIDE_ITEMS.map(
        ([icon, label]) =>
          `<span class="sideitem${label === "Prüfung" ? " on" : ""}">${I[icon](18)}<em>${label}</em></span>`,
      ).join("")}
    </div>
  </div>`;

/** The app top bar. `left` is whatever the option puts in the greeting slot. */
const appHdr = (left = "") => `
  <div class="apphdr">
    <div class="hdrleft">${left}</div>
    <div class="hdrright">
      <span class="streak">${I.flame(14)}<b>0</b><i>Tage</i></span>
      <span class="avatar">${I.user(15)}</span>
    </div>
  </div>`;

const phoneHdr = () => `
  <div class="apphdr">
    <div class="hdrleft"><span class="logomark"></span></div>
    <div class="hdrright">
      <span class="streak">${I.flame(13)}<b>0</b><i>Tage</i></span>
      <span class="avatar">${I.user(14)}</span>
    </div>
  </div>`;

const navBar = () => `
  <div class="navbar">
    ${["a", "b", "c", "d", "e"]
      .map((t) => `<span class="navtab${t === "c" ? " on" : ""}"><i></i>${t === "c" ? "<em>Prüfung</em>" : ""}</span>`)
      .join("")}
  </div>`;

/* -------------------------------- page pieces ------------------------------ */

const tabSwitcher = (size = "") => `
  <div class="modeswitch tabsw ${size}">
    <span class="pill"></span>
    <button aria-pressed="true">Module üben</button>
    <button aria-pressed="false">Modelltest</button>
  </div>`;

const scopeRow = (align) => `
  <div class="scoperow ${align}">
    <div class="modeswitch small">
      <span class="pill"></span>
      <button aria-pressed="true">Ohne Zeit</button>
      <button aria-pressed="false">Mit Zeit</button>
    </div>
    <span class="scopebtn"><span>Niveau</span><b>B2</b>${I.chevD(15)}</span>
  </div>`;

/**
 * One module card. The anatomy is LOCKED (founder s191/s196): no description
 * line, mark top-left, minutes badge beside it when timed, arrow bottom-right.
 * Nothing here changes it; only the width of the grid it sits in.
 */
const modCard = (m, timed) => `
  <span class="modcard2">
    <span class="cardtop">
      <span class="tile lg ${m.id}">${I[m.id + "2"](20)}</span>
      ${timed ? `<span class="timechip">${I.clock(12)} ${m.min} Min</span>` : ""}
    </span>
    <span class="modname2">${m.label}</span>
    <span class="go">${I.arrowR(15)}</span>
  </span>`;

const modGrid = (timed) => `
  <div class="grid2 cards">${MODS.map((m) => modCard(m, timed)).join("")}</div>`;

/**
 * The Stärkeprofil half of the Module-üben Verlauf.
 * `shipped` draws the empty state at TODAY's full height (for the diagnosis
 * frame); the options draw the compact one.
 */
const profile = (hasData, shipped = false) => `
  <div class="profwrap">
    <div class="profgrid">
      ${MODS.map((m) => {
        const d = PROFILE[m.id];
        return `
        <div class="profcol">
          <span class="profval${hasData ? "" : " none"}">${hasData ? `${d.last} %` : "–"}</span>
          <span class="profbar${hasData ? "" : shipped ? " empty tall" : " empty"}">
            ${
              hasData
                ? `<i class="pale ${m.id}" style="height:${d.first}%"></i><i class="solid ${m.id}" style="height:${d.last - d.first}%"></i>`
                : ""
            }
          </span>
          <span class="proflab"><span class="tile sm ${m.id}">${I[m.id + "2"](12)}</span>${m.label}</span>
        </div>`;
      }).join("")}
    </div>
    <p class="profcap">${
      hasData
        ? "Blass: dein erster Versuch · Kräftig: dein Fortschritt"
        : shipped
          ? `<b>Dein Stärkeprofil</b> Übe ein Modul, dann steht hier, wie du gestartet bist und was du seitdem dazugewonnen hast.`
          : `<b>Dein Stärkeprofil</b> Übe ein Modul, dann siehst du hier deinen Fortschritt.`
    }</p>
  </div>`;

const verlaufRows = (hasData, max = 3) =>
  hasData
    ? ROWS.slice(0, max)
        .map(
          (r) => `
      <div class="vrow2">
        <span class="vdate2">${r.date}</span>
        <span class="tile sm ${r.mod}">${I[r.mod + "2"](13)}</span>
        <span class="vname">${r.label}</span>
        <span class="badge ${r.pct >= 60 ? "ok" : "mutedb"} tnum">${r.pct} %</span>
      </div>`,
        )
        .join("")
    : `<div class="vempty">Noch keine Übung</div>`;

/**
 * `phone` mirrors the shipped behaviour: at rest a phone shows the profile and
 * the expander only, because a 2x2 grid plus a summary plus a list does not fit
 * one phone screen (`VerlaufCard`, `hidden ... sm:block`).
 */
const verlauf = (hasData, { shipped = false, rows = 3, phone = false } = {}) => `
  <div class="card verlauf2">
    <div class="vhead2">
      <p class="eyebrow mut">Verlauf</p>
      <span class="vcount">${hasData ? "12 Übungen" : "noch keine Übung"}</span>
    </div>
    <div class="vbody">
      ${profile(hasData, shipped)}
      ${phone ? "" : `<span class="vsep2"></span><div class="vlist">${verlaufRows(hasData, rows)}</div>`}
    </div>
    ${phone && hasData ? `<button class="vmore">Alle 12 anzeigen ${I.chevD(13)}</button>` : ""}
  </div>`;

/* --------------------------------- screens --------------------------------- */

/** Today, as shipped: three nested centred widths and a far-left title. */
const todayScreen = () => `
  <div class="frame desk">
    <div class="screen shell">
      ${sidebar()}
      <div class="main">
        ${appHdr(`<h1 class="hdrtitle">Prüfung</h1>${tabSwitcher()}`)}
        <div class="pagearea">
          <span class="guide g-hdr" data-lab="app header"></span>
          <span class="guide g-col" data-lab="Verlauf card"></span>
          <span class="guide g-cards" data-lab="module tiles"></span>
          <div class="col today">
            <div class="scoperow centre">
              <div class="modeswitch small">
                <span class="pill"></span>
                <button aria-pressed="true">Ohne Zeit</button>
                <button aria-pressed="false">Mit Zeit</button>
              </div>
              <span class="scopebtn"><span>Niveau</span><b>B2</b>${I.chevD(15)}</span>
            </div>
            <div class="todaycards">${modGrid(false)}</div>
            ${verlauf(false, { shipped: true })}
          </div>
        </div>
      </div>
    </div>
  </div>`;

/** A: the title comes back INTO the page, one column, one left edge. */
const optionADesk = () => `
  <div class="frame desk">
    <div class="screen shell">
      ${sidebar()}
      <div class="main">
        ${appHdr("")}
        <div class="pagearea">
          <span class="guide g-centre"></span>
          <div class="col centre">
            <div class="titlerow">
              <h1 class="pagetitle">Prüfung</h1>
              ${tabSwitcher()}
            </div>
            ${scopeRow("left")}
            ${modGrid(false)}
            ${verlauf(true)}
          </div>
        </div>
      </div>
    </div>
  </div>`;

/** B: the title stays in the app header, the PAGE moves to its left edge. */
const optionBDesk = () => `
  <div class="frame desk">
    <div class="screen shell">
      ${sidebar()}
      <div class="main">
        ${appHdr(`<h1 class="hdrtitle">Prüfung</h1>${tabSwitcher()}`)}
        <div class="pagearea">
          <span class="guide g-left"></span>
          <div class="col leftal">
            ${scopeRow("left")}
            ${modGrid(false)}
            ${verlauf(true)}
          </div>
        </div>
      </div>
    </div>
  </div>`;

/** C: no title at all. The switcher IS the page header, as in the Bibliothek. */
const optionCDesk = () => `
  <div class="frame desk">
    <div class="screen shell">
      ${sidebar()}
      <div class="main">
        ${appHdr("")}
        <div class="pagearea">
          <span class="guide g-centre"></span>
          <div class="col centre">
            <div class="switchrow">${tabSwitcher()}</div>
            ${scopeRow("centre")}
            ${modGrid(false)}
            ${verlauf(true)}
          </div>
        </div>
      </div>
    </div>
  </div>`;

const phone = (inner) => `
  <div class="frame mob">
    <div class="screen">
      ${phoneHdr()}
      <div class="phonebody">${inner}</div>
      ${navBar()}
    </div>
  </div>`;

const optionAPhone = () =>
  phone(`
    <div class="col mobcol">
      <div class="titlerow mob"><h1 class="pagetitle sm">Prüfung</h1></div>
      ${tabSwitcher("full")}
      ${scopeRow("centre")}
      ${modGrid(false)}
      ${verlauf(true, { phone: true })}
    </div>`);

const optionBPhone = () =>
  phone(`
    <div class="col mobcol">
      ${tabSwitcher("full")}
      ${scopeRow("centre")}
      ${modGrid(false)}
      ${verlauf(true, { phone: true })}
    </div>`);

const optionCPhone = optionBPhone;

/* ---------------------------------- CSS ------------------------------------ */

const CSS = String.raw`
  .wrap { max-width: 1300px; }
  .framebox.desk { overflow-x: auto; }
  .frame.desk { min-width: 1180px; }
  .frame.desk .screen { padding: 0; }
  .frame.mob { width: 372px; }
  /* 668 px is the content area a 393x852 phone leaves between the app header
     and the bottom tab bar; the frame adds both back so the mock is complete. */
  .frame.mob .screen { padding: 0; height: 778px; overflow: hidden; position: relative; display: block; }

  /* Column width, driven from the control bar so every option is compared at
     the same measurement. */
  .page { --col: 640px; }
  [data-col="compact"] .page { --col: 512px; }
  [data-col="wide"] .page { --col: 768px; }

  /* Shell: sidebar + main --------------------------------------- */
  .shell { display: flex; align-items: stretch; min-height: 620px; }
  .side {
    flex: none; width: 256px; border-right: 1px solid hsl(var(--border));
    background: hsl(var(--surface) / .6); padding: 14px 12px; display: flex; flex-direction: column; gap: 18px;
  }
  .sidebrand { display: flex; align-items: center; gap: 9px; padding: 4px 8px; font-size: 17px; font-weight: 800; letter-spacing: -.02em; }
  .logomark { width: 28px; height: 28px; border-radius: 9px; background: linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to))); flex: none; }
  .sidenav { display: flex; flex-direction: column; gap: 2px; }
  .sideitem {
    display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: 8px;
    color: hsl(var(--muted-foreground)); font-size: 14.5px;
  }
  .sideitem em { font-style: normal; font-weight: 600; }
  .sideitem.on { background: hsl(var(--primary) / .1); color: hsl(var(--primary)); }
  .main { flex: 1; min-width: 0; position: relative; display: flex; flex-direction: column; }

  .apphdr {
    height: 64px; flex: none; display: flex; align-items: center; justify-content: space-between; gap: 14px;
    padding: 0 24px; border-bottom: 1px solid hsl(var(--border)); background: hsl(var(--surface) / .75);
  }
  .frame.mob .apphdr { height: 52px; padding: 0 14px; }
  .hdrleft { display: flex; align-items: center; gap: 16px; min-width: 0; }
  .hdrright { display: flex; align-items: center; gap: 8px; }
  .hdrtitle { font-size: 20px; font-weight: 800; letter-spacing: -.02em; }
  .streak {
    display: inline-flex; align-items: center; gap: 5px; height: 32px; padding: 0 11px; border-radius: 999px;
    background: rgb(244 114 96 / .12); color: #e2593f; font-size: 13.5px; font-weight: 700;
  }
  .streak i { font-style: normal; font-weight: 500; color: hsl(var(--muted-foreground)); font-size: 12px; }
  .avatar { width: 32px; height: 32px; border-radius: 999px; background: hsl(var(--muted)); display: grid; place-items: center; color: hsl(var(--muted-foreground)); }

  .navbar {
    position: absolute; left: 0; right: 0; bottom: 0; height: 58px; display: flex; align-items: center;
    justify-content: space-around; border-top: 1px solid hsl(var(--border)); background: hsl(var(--surface) / .95);
  }
  .navtab { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .navtab i { display: block; width: 22px; height: 22px; border-radius: 7px; background: hsl(var(--border)); }
  .navtab.on i { background: hsl(var(--primary) / .85); }
  .navtab em { font-style: normal; font-size: 10px; font-weight: 650; color: hsl(var(--foreground)); }

  .pagearea { position: relative; flex: 1; padding: 26px 24px 34px; }
  .phonebody { padding: 14px 14px 0; height: 668px; overflow: hidden; }

  /* Alignment guides --------------------------------------------- */
  .guide { display: none; }
  [data-guides="on"] .guide {
    display: block; position: absolute; top: -64px; bottom: 0; width: 0;
    border-left: 1px dashed hsl(var(--primary) / .55); z-index: 4; pointer-events: none;
  }
  [data-guides="on"] .guide[data-lab]::after {
    content: attr(data-lab); position: absolute; top: 4px; left: 4px; white-space: nowrap;
    font-size: 10px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase;
    color: hsl(var(--primary)); background: hsl(var(--surface)); padding: 1px 5px; border-radius: 4px;
    border: 1px solid hsl(var(--primary) / .3);
  }
  .g-hdr { left: 24px; }
  .g-left { left: 24px; }
  .g-centre { left: 50%; transform: translateX(calc(var(--col) / -2)); }
  /* Today: the 4xl page column and the 30rem tile grid are two different
     centred widths inside it, so they get two different guides. */
  .g-col { left: 50%; transform: translateX(-448px); }
  .g-cards { left: 50%; transform: translateX(-240px); }
  /* Stagger the three labels in the diagnosis frame so they never overlap. */
  [data-guides="on"] .guide.g-hdr::after { top: 2px; }
  [data-guides="on"] .guide.g-col::after { top: 24px; }
  [data-guides="on"] .guide.g-cards::after { top: 46px; }

  /* The page column ---------------------------------------------- */
  .col { display: flex; flex-direction: column; gap: 18px; width: var(--col); }
  .col.centre { margin: 0 auto; }
  .col.leftal { margin: 0; }
  .col.today { width: 896px; margin: 0 auto; gap: 22px; }
  .col.mobcol { width: 100%; gap: 10px; }
  .todaycards { width: 480px; margin: 0 auto; }
  .todaycards .cards { width: 100%; }

  .titlerow { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .titlerow.mob { justify-content: flex-start; }
  .pagetitle { font-size: 30px; font-weight: 800; letter-spacing: -.025em; line-height: 1.1; }
  .pagetitle.sm { font-size: 24px; }
  .switchrow { display: flex; justify-content: center; }
  .scoperow { display: flex; align-items: center; gap: 10px; }
  .scoperow.centre { justify-content: center; }
  .scoperow.left { justify-content: flex-start; }
  .modeswitch.small > button { font-size: 14px; padding: 6px 16px; }
  .modeswitch.tabsw > button { font-size: 15px; padding: 7px 20px; }
  .frame.desk .modeswitch:not(.full) { min-width: 0; }

  /* Module tiles (anatomy locked; only the grid width moves) ------- */
  .grid2.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .frame.mob .grid2.cards { gap: 12px; }
  .modcard2 {
    position: relative; display: flex; flex-direction: column; align-items: flex-start;
    min-height: 124px; padding: 16px 16px 40px; border-radius: 12px;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border));
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .frame.mob .modcard2 { min-height: 96px; padding: 12px 12px 32px; }
  .frame.mob .go { right: 12px; bottom: 10px; width: 26px; height: 26px; }
  .frame.mob .tile.lg { width: 38px; height: 38px; }
  .frame.mob .vhead2 { padding: 11px 14px 8px; }
  .frame.mob .vbody { padding: 0 14px 12px; gap: 10px; }
  .frame.mob .profcap { margin-top: 7px; }
  .frame.mob .vrow2 { padding: 4px 2px; }
  .frame.mob .grid2.cards { grid-template-columns: 1fr 1fr; }
  .vmore {
    display: flex; align-items: center; justify-content: center; gap: 5px; width: 100%;
    border: 0; border-top: 1px solid hsl(var(--border)); background: transparent;
    padding: 7px 0; font-size: 12px; font-weight: 650; color: hsl(var(--primary));
  }
  .cardtop { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; width: 100%; }
  .modname2 { margin-top: 10px; font-size: 18px; font-weight: 800; letter-spacing: -.015em; }
  .frame.mob .modname2 { font-size: 16px; }
  .go {
    position: absolute; right: 15px; bottom: 13px; width: 30px; height: 30px; border-radius: 8px;
    background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); display: grid; place-items: center;
  }
  .tile.sm { width: 22px; height: 22px; border-radius: 6px; }
  .tile.lesen { background: rgba(16,185,129,.15); color: #047857; }
  .tile.hoeren { background: rgba(20,184,166,.15); color: #0f766e; }
  .tile.schreiben { background: hsl(var(--primary) / .15); color: hsl(var(--primary)); }
  .tile.sprechen { background: rgba(14,165,233,.15); color: #0369a1; }
  [data-appearance="dark"] .tile.lesen { background: rgba(52,211,153,.2); color: #6ee7b7; }
  [data-appearance="dark"] .tile.hoeren { background: rgba(45,212,191,.2); color: #5eead4; }
  [data-appearance="dark"] .tile.schreiben { background: hsl(var(--primary) / .2); color: hsl(var(--primary)); }
  [data-appearance="dark"] .tile.sprechen { background: rgba(56,189,248,.2); color: #7dd3fc; }

  /* Verlauf ------------------------------------------------------- */
  .verlauf2 { overflow: hidden; }
  .vhead2 { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; padding: 13px 16px 10px; }
  .vbody { display: flex; align-items: stretch; gap: 16px; padding: 0 16px 14px; }
  .frame.mob .vbody { flex-direction: column; gap: 12px; }
  .vsep2 { width: 1px; background: hsl(var(--border)); flex: none; }
  .frame.mob .vsep2 { width: 100%; height: 1px; }
  .profwrap { flex: 1 1 54%; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
  .profgrid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; }
  .profcol { display: flex; flex-direction: column; align-items: center; gap: 5px; min-width: 0; }
  .profval { font-size: 13.5px; font-weight: 700; font-variant-numeric: tabular-nums; height: 18px; }
  .profval.none { font-size: 12px; font-weight: 600; color: hsl(var(--muted-foreground)); }
  .profbar {
    position: relative; width: 100%; height: 48px; border-radius: 7px; overflow: hidden;
    background: hsl(var(--muted) / .8); display: flex; flex-direction: column-reverse;
  }
  /* The empty profile is HALF the height of the real one: with no data it is a
     promise, not a chart, and at full size it read as a broken render. */
  .profbar.empty { height: 24px; background: hsl(var(--muted) / .4); }
  /* Today's shipped empty state, drawn at its real height for the diagnosis. */
  .profbar.empty.tall { height: 48px; }
  .frame.mob .profbar { height: 36px; }
  .profbar i { display: block; width: 100%; }
  .profbar i.solid { border-radius: 4px 4px 0 0; }
  .pale.lesen { background: rgba(16,185,129,.3); } .solid.lesen { background: #10b981; }
  .pale.hoeren { background: rgba(20,184,166,.3); } .solid.hoeren { background: #14b8a6; }
  .pale.schreiben { background: hsl(var(--primary) / .3); } .solid.schreiben { background: hsl(var(--primary)); }
  .pale.sprechen { background: rgba(14,165,233,.3); } .solid.sprechen { background: #0ea5e9; }
  /* Icon over label, not beside it: in a split card each column is ~70 px, and
     the row form pushed "Schreiben" straight through the divider into the list. */
  .proflab { display: flex; flex-direction: column; align-items: center; gap: 3px; font-size: 11px; font-weight: 600; white-space: nowrap; }
  .profcap { margin-top: 9px; text-align: center; font-size: 11.5px; line-height: 1.45; color: hsl(var(--muted-foreground)); }
  .profcap b { display: block; font-size: 13.5px; font-weight: 700; color: hsl(var(--foreground)); }

  .vlist { flex: 1 1 46%; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
  .vrow2 { display: flex; align-items: center; gap: 10px; padding: 6px 2px; }
  .vdate2 { flex: none; width: 62px; font-size: 13.5px; font-weight: 650; font-variant-numeric: tabular-nums; }
  .vname { font-size: 13.5px; font-weight: 600; }
  .vrow2 .badge { margin-left: auto; }
  .vempty { font-size: 13px; color: hsl(var(--muted-foreground)); text-align: center; padding: 14px 0; }

  /* Review-chrome extras ----------------------------------------- */
  .flag { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; }
  .flag b { display: block; font-size: 14px; }
  .flag p { font-size: 13.5px; color: var(--c-muted); }
  .pill-note {
    display: inline-block; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: var(--c-accent); border: 1px solid var(--c-line); border-radius: 999px; padding: 3px 10px; margin-bottom: 8px;
  }
  blockquote {
    margin: 14px 0 0; padding: 12px 16px; border-left: 3px solid var(--c-accent);
    background: var(--c-chip); border-radius: 0 8px 8px 0; font-size: 14px;
  }
`;

/* ---------------------------------- page ----------------------------------- */

const ATTRS = `id="root" data-appearance="light" data-col="medium" data-guides="on"`;

const page = `<div class="page">
  <div class="wrap">
    <p class="kicker">Prüfung hub · layout review</p>
    <h1>Where the page title belongs</h1>
    <p class="lede">Your original request was for the greeting space to carry a big page title
      <b>aligned left with the toggle buttons</b>. What shipped put the title in the app header at
      the far-left app gutter, while the page kept three different centred widths, so nothing lines
      up with anything. Below: what today's page actually measures, then three ways to fix it.</p>

    <blockquote>“Instead of guten morgen greeting, use that space to show a big header like
      Prufung or Bibliothek aligned to left vertically with the toggle buttons”
      <br><span style="color:var(--c-muted)">(your prompt, session 196)</span></blockquote>

    <div class="controls">
      <div class="ctl"><span>Theme</span>
        <div class="seg" id="seg-appearance">
          <button data-v="light" aria-pressed="true">Light</button>
          <button data-v="dark" aria-pressed="false">Dark</button>
        </div>
      </div>
      <div class="ctl"><span>Column width</span>
        <div class="seg" id="seg-col">
          <button data-v="compact" aria-pressed="false">Compact 512</button>
          <button data-v="medium" aria-pressed="true">Medium 640</button>
          <button data-v="wide" aria-pressed="false">Wide 768</button>
        </div>
      </div>
      <div class="ctl"><span>Alignment guides</span>
        <div class="seg" id="seg-guides">
          <button data-v="on" aria-pressed="true">On</button>
          <button data-v="off" aria-pressed="false">Off</button>
        </div>
      </div>
    </div>

    <!-- ------------------------------ TODAY ------------------------------ -->
    <div class="panel">
      <h2>What is on the page today</h2>
      <p class="lede" style="margin-top:6px">Measured from the code, not from the screenshot. The
        page nests <b>three different widths, each centred separately</b>, and the title sits at a
        fourth position in the app header. Turn the guides on: no two of them share a line.</p>
      <div class="findings">
        <div class="finding"><span class="num">1</span><div><b>The title is nowhere near the toggles</b>
          <p>It sits in the app header at the app's left gutter. The module tiles start about 220 px
          to the right of it. That is the opposite of what you asked for.</p></div></div>
        <div class="finding"><span class="num">2</span><div><b>Tiles 480 px, Verlauf 896 px</b>
          <p>The tile grid was capped to make the tiles squarer, but the Verlauf card below it was
          not, so a narrow island floats over a wide card. Neither edge matches.</p></div></div>
        <div class="finding"><span class="num">3</span><div><b>The empty Verlauf reads as broken</b>
          <p>Four full-height grey bars at “–”, taking half of the widest card on the page, beside a
          nearly empty list. Full size with no data looks like a failed render.</p></div></div>
        <div class="finding"><span class="num">4</span><div><b>The control row floats</b>
          <p>Ohne Zeit / Mit Zeit and Niveau are centred with nothing above them, so they read as
          loose chrome rather than as this page's controls.</p></div></div>
      </div>
      <div style="margin-top:18px">${todayScreen()}</div>
      <p class="fitnote">Desktop frame ≈ a 1180 px window with the sidebar. Your screenshot has the
        sidebar cropped off, which is why the title looks flush to the window edge there.</p>
    </div>

    <hr class="rule">

    <!-- ------------------------------ SHARED ----------------------------- -->
    <div class="panel" style="margin-top:26px">
      <h2>Fixed in all three options</h2>
      <div class="findings">
        <div class="finding"><span class="num">A</span><div><b>One column, two edges</b>
          <p>The tiles and the Verlauf card get the SAME width, and the page column shrinks to it.
          The tiles stay square because the column came to them, not the other way round.</p></div></div>
        <div class="finding"><span class="num">B</span><div><b>A smaller empty state</b>
          <p>With no history the profile bars are half height and the caption is one line, so a first
          visit shows a promise instead of an empty chart.</p></div></div>
        <div class="finding"><span class="num">C</span><div><b>The tile anatomy is untouched</b>
          <p>Mark top-left, minutes badge beside it, name below, arrow bottom-right. That is locked
          from session 191/196 and no option changes it.</p></div></div>
      </div>
      <p class="cost" style="margin-top:16px"><b>One locked rule needs your call.</b> Session 196
        locked “tile grid narrower than the column”. All three options instead narrow the COLUMN to
        the tiles. The reason for the lock (wide tiles look empty) still holds; the side effect
        (mismatched edges) goes away. Use the Column width switch above to pick the measurement.</p>
    </div>

    <!-- ------------------------------ OPTION A --------------------------- -->
    <div class="option">
      <div class="opthead"><span class="optname">Option A</span><h2>Title in the page</h2></div>
      <p class="lede">The app header goes back to normal (streak + account, no greeting on this
        route). The page opens with <b>Prüfung</b> as a real page title on the left, the Module üben /
        Modelltest switcher on the right of the same line, and the controls left-aligned under it.
        Every element on the page shares one left edge and one right edge.</p>
      <div class="framerow">
        <div class="framebox desk">
          <p class="framelabel">Desktop</p>
          ${optionADesk()}
        </div>
        <div class="framebox phone">
          <p class="framelabel">Phone</p>
          ${optionAPhone()}
        </div>
        <div class="notecol">
          <p class="note"><b>What you asked for, literally.</b> The title and the toggles are on one
            vertical line, and so is everything below them.</p>
          <p class="note"><b>The title is the page's, not the chrome's.</b> It scrolls and moves with
            the content, which is how a page title normally behaves.</p>
          <p class="note"><b>The phone gets it too</b>, above the switcher, so both widths read the
            same way.</p>
          <p class="cost"><b>Cost:</b> about 50 px of height that the one-screen rule has to absorb,
            and the word “Prüfung” appears twice on screen (lit nav tab plus title).</p>
        </div>
      </div>
    </div>

    <!-- ------------------------------ OPTION B --------------------------- -->
    <div class="option">
      <div class="opthead"><span class="optname">Option B</span><h2>Title in the header, page moves left</h2></div>
      <p class="lede">Keeps what shipped (title and switcher in the app header) and fixes the
        alignment from the other side: the page stops centring and <b>starts at the same left edge as
        the title</b>. The header block and the page column then share one line down the screen.</p>
      <div class="framerow">
        <div class="framebox desk">
          <p class="framelabel">Desktop</p>
          ${optionBDesk()}
        </div>
        <div class="framebox phone">
          <p class="framelabel">Phone (unchanged from today)</p>
          ${optionBPhone()}
        </div>
        <div class="notecol">
          <p class="note"><b>Smallest change.</b> The header work from last session stays; only the
            page column moves.</p>
          <p class="note"><b>The title never scrolls away</b>, since it is chrome. It also means the
            switcher stays reachable from anywhere in the zone.</p>
          <p class="note"><b>Needs one extra fix:</b> on a wide monitor the header row must sit in the
            same centred container as the page, or the two drift apart again as the window grows.</p>
          <p class="cost"><b>Cost:</b> everything hugs the left, leaving a wide empty band on the
            right of a large monitor. The phone keeps no title at all, so the two widths differ.</p>
        </div>
      </div>
    </div>

    <!-- ------------------------------ OPTION C --------------------------- -->
    <div class="option">
      <div class="opthead"><span class="optname">Option C</span><h2>No title, switcher as the header</h2></div>
      <p class="lede">Drops the big title and lets the <b>Module üben / Modelltest switcher be the page
        header</b>, centred, with the controls under it. This is exactly how the Bibliothek and
        Schreiben pages already work. The greeting still disappears from this route, which was the
        part that bothered you.</p>
      <div class="framerow">
        <div class="framebox desk">
          <p class="framelabel">Desktop</p>
          ${optionCDesk()}
        </div>
        <div class="framebox phone">
          <p class="framelabel">Phone</p>
          ${optionCPhone()}
        </div>
        <div class="notecol">
          <p class="note"><b>Most consistent with the rest of the app.</b> No other hub carries a big
            title; the lit nav tab already says where you are.</p>
          <p class="note"><b>Nothing is repeated</b> and the page keeps the most room for content.</p>
          <p class="note"><b>Desktop and phone are identical</b>, so there is only one layout to
            maintain.</p>
          <p class="cost"><b>Cost:</b> it does not give you the big header you asked for. It answers
            the greeting complaint and the alignment complaint, but not the “big header” part.</p>
        </div>
      </div>
    </div>

    <hr class="rule">
    <div class="panel" style="margin-top:26px">
      <h2>How to reply</h2>
      <p class="lede" style="margin-top:6px">Name the option and the column width, for example
        “A, medium” or “B, wide”. If you want the title itself bigger or smaller, or the switcher on
        its own line under the title, say so and it goes into the same round.</p>
    </div>
  </div>
</div>`;

const SCRIPT = String.raw`
  for (const [id, attr] of [["seg-appearance", "appearance"], ["seg-col", "col"], ["seg-guides", "guides"]]) {
    const seg = document.getElementById(id);
    seg.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      for (const other of seg.querySelectorAll("button")) other.setAttribute("aria-pressed", String(other === b));
      document.getElementById("root").setAttribute("data-" + attr, b.dataset.v);
    });
  }
`;

writeFileSync(
  OUT,
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prüfung hub: where the page title belongs</title>
<style>${REVIEW_CSS}${CSS}</style>
</head>
<body>
<div ${ATTRS}>
${page}
</div>
<script>${SCRIPT}</script>
</body>
</html>`,
);

// The artifact build: no document shell (the host wraps it), same content.
writeFileSync(
  ART,
  `<title>Prüfung hub: where the page title belongs</title>
<style>${REVIEW_CSS}${CSS}</style>
<div ${ATTRS}>
${page}
</div>
<script>${SCRIPT}</script>`,
);

console.log("wrote", OUT, "and", ART);
