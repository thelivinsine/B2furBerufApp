/**
 * Generates `preview/pruefung-hub-r2.html` (round 2).
 *
 * Founder decisions from round 1:
 *   · Layout A "Kompakt" (switcher + level on one header line, 2x2 module grid)
 *   · Module marks "Modern", colours "Rezeptiv / Produktiv" (locked, no toggle)
 *   · Zone keeps the name "Prüfung"
 *   · Verlauf: the OPENED state is now the resting state. It leads with the
 *     three figures from option C, then the newest runs, and an expand button
 *     at the bottom only when more runs exist than fit.
 *   · The connector between the four parts runs BETWEEN the tiles, never behind
 *     them (fixed in the shared CSS).
 *
 * Round 2 also opens the brainstorm the founder asked for: how the free
 * Schreib- and Sprechtrainer merge INTO the Schreiben and Sprechen modules.
 *
 * Run: node preview/gen-pruefung-hub-r2.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_CSS, ICON, mark, MODULES, RUNS, LEVELS } from "./gen-pruefung-shared.mjs";

const OUT = join(dirname(fileURLToPath(import.meta.url)), "pruefung-hub-r2.html");

/* ------------------------------ shared pieces ------------------------------ */

const modeSwitch = (active, { full = true } = {}) => `
  <div class="modeswitch${full ? " full" : ""}" role="tablist" aria-label="Prüfung">
    <span class="pill" style="left:${active === "module" ? "4px" : "50%"}"></span>
    <button role="tab" aria-selected="${active === "module"}" aria-pressed="${active === "module"}">Module üben</button>
    <button role="tab" aria-selected="${active === "modelltest"}" aria-pressed="${active === "modelltest"}">Modelltest</button>
  </div>`;

const niveauDropdown = () => `
  <button class="scopebtn" type="button">
    <span>Niveau</span><b class="tnum">B2</b>${ICON.chevD(15)}
  </button>`;

const timeChip = (min) => `<span class="timechip tnum">${ICON.clock(13)}${min} Min</span>`;

const header = (tab, desk) =>
  `<div class="hdr row-between">${modeSwitch(tab, { full: !desk })}${niveauDropdown()}</div>`;

/* ------------------------------ Module üben ------------------------------- */

const moduleGrid = ({ trainerLine = false } = {}) => `
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
        ${
          trainerLine && m.trainer
            ? `<span class="modtrainer">Trainer öffnen ${ICON.arrowR(13)}</span>`
            : ""
        }
      </button>`,
    ).join("")}
  </div>`;

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

/* ------------------------------- Modelltest -------------------------------- */

const partTrack = () => `
  <div class="trackwrap">
    <div class="track">
      ${MODULES.map(
        (m) => `
        <div class="tnode">
          <span class="dot tile ${m.id}">${mark(m.id, 19)}</span>
          <span class="lab">${m.label}</span>
          <span class="min tnum">${m.min} Min</span>
        </div>`,
      ).join("")}
    </div>
  </div>`;

const runBand = () => `
  <div class="card band">
    <div class="bandhead">
      <p class="eyebrow mut">Komplette Prüfung</p>
      <span class="cdown tnum">${ICON.clock(14)}Noch 24 Tage bis zum 29. August</span>
    </div>
    ${partTrack()}
    <div class="bandfoot">
      <button class="btn grad wide" type="button">${ICON.play(15)} Prüfung starten</button>
    </div>
  </div>`;

const verlaufRow = (r, expanded) => `
  <div>
    <button class="row vrow" type="button">
      <span class="vdate tnum">${r.date}</span>
      <span class="mini">
        ${MODULES.map((m) => `<span><i class="bar-${m.id}" style="width:${r.parts[m.id]}%"></i></span>`).join("")}
      </span>
      <span class="badge ${r.total >= 60 ? "ok" : "mutedb"} tnum">${r.total} %</span>
      <span class="chev"${expanded ? ' style="transform:rotate(180deg)"' : ""}>${ICON.chevD(16)}</span>
    </button>
    ${
      expanded
        ? `<div class="vopen">
            ${MODULES.map(
              (m) => `<div><p class="vlab">${m.label}</p><p class="vval tnum">${r.parts[m.id]} %</p></div>`,
            ).join("")}
          </div>`
        : ""
    }
  </div>`;

/**
 * Verlauf, round 2. No closed state any more: it rests OPEN, leading with the
 * three figures, then the newest runs. The page still never scrolls at rest,
 * because only as many runs are listed as fit; the rest wait behind the button
 * at the foot, and pressing it is what allows the page to grow.
 */
const verlauf = ({ shown = 3, total = 7, rowOpen = -1 } = {}) => {
  const rows = [];
  for (let i = 0; i < shown; i++) rows.push(RUNS[i % RUNS.length]);
  const rest = total - shown;
  return `
  <div class="card verlauf">
    <div class="vsum">
      <div><p class="vlab">Letzter</p><p class="vsumval tnum">78 %</p></div>
      <span class="vsep"></span>
      <div><p class="vlab">Bester</p><p class="vsumval tnum">82 %</p></div>
      <span class="vsep"></span>
      <div><p class="vlab">Bestanden</p><p class="vsumval tnum">3 von ${total}</p></div>
    </div>
    <div class="rowlist">
      ${rows.map((r, i) => verlaufRow(r, i === rowOpen)).join("")}
    </div>
    ${
      rest > 0
        ? `<button class="vmore" type="button">Alle ${total} Durchläufe ${ICON.chevD(15)}</button>`
        : ""
    }
  </div>`;
};

/* --------------------------------- screens -------------------------------- */

const screen = (tab, device, opts = {}) => {
  const desk = device === "desk";
  const body =
    tab === "module"
      ? `${moduleGrid()}${freiesUeben()}`
      : `${runBand()}${verlauf(opts)}`;
  return `<div class="screen"><div class="inner"><div class="col">${header(tab, desk)}${body}</div></div></div>`;
};

const frame = (tab, device, label, opts = {}) => `
  <div class="framebox ${device}">
    <p class="framelabel">${label}</p>
    <div class="frame ${device === "phone" ? "mob" : "desk"}${opts.scroll ? " scrolls" : ""}">${screen(
      tab,
      device === "phone" ? "mob" : "desk",
      opts,
    )}</div>
  </div>`;

/* ----------------------- brainstorm: merging the trainers ----------------- */

/** Sketch 1: the module card carries a second, quiet line. */
const sketchLine = () => `
  <div class="screen sketch">
    <div class="grid2sk">
      ${["schreiben", "sprechen"].map((id) => {
        const m = MODULES.find((x) => x.id === id);
        return `
        <button class="modcard" type="button">
          <span class="tile lg ${m.id}">${mark(m.id, 22)}</span>
          <span class="modname">${m.label}</span>
          <span class="moddesc">${m.desc}</span>
          <span class="modfoot">${timeChip(m.min)}<span class="chev">${ICON.chevR(16)}</span></span>
          <span class="modtrainer">Trainer öffnen ${ICON.arrowR(13)}</span>
        </button>`;
      }).join("")}
    </div>
  </div>`;

/** Sketch 2: the module opens its own page, with its modes as a switcher. */
const sketchModulePage = () => `
  <div class="screen sketch tall">
    <div class="col">
      <div class="skhead">
        <button class="backbtn" type="button">${ICON.chevL(16)}</button>
        <span class="tile schreiben">${mark("schreiben", 19)}</span>
        <span class="skTitle">Schreiben</span>
      </div>
      <div class="modeswitch full four">
        <span class="pill" style="left:4px;width:calc(25% - 4px)"></span>
        <button aria-pressed="true">Prüfung</button>
        <button aria-pressed="false">Kurz</button>
        <button aria-pressed="false">Lang</button>
        <button aria-pressed="false">Fokus</button>
      </div>
      <div class="card skbody">
        <p class="eyebrow pri">Aufgabe: Dienstplan</p>
        <p class="sktask">Schreiben Sie an Ihre Teamleitung und schlagen Sie eine andere Schichtverteilung vor.</p>
        <div class="skmeta"><span class="timechip tnum">${ICON.clock(13)}20 Min</span><span class="rsub">B2 · 120 Wörter</span></div>
      </div>
      <button class="btn grad wide" type="button">${ICON.play(15)} Starten</button>
    </div>
  </div>`;

/** Sketch 3: one page-level clock switch, four pure module cards. */
const sketchClockToggle = () => `
  <div class="screen sketch">
    <div class="col">
      <div class="hdr row-between">
        <div class="modeswitch">
          <span class="pill" style="left:4px"></span>
          <button aria-pressed="true">Module üben</button>
          <button aria-pressed="false">Modelltest</button>
        </div>
        <div class="clockrow">
          <div class="modeswitch small">
            <span class="pill" style="left:4px"></span>
            <button aria-pressed="true">Mit Zeit</button>
            <button aria-pressed="false">Ohne Zeit</button>
          </div>
          ${niveauDropdown()}
        </div>
      </div>
      <div class="grid2sk">
        ${["schreiben", "sprechen"].map((id) => {
          const m = MODULES.find((x) => x.id === id);
          return `
          <button class="modcard" type="button">
            <span class="tile lg ${m.id}">${mark(m.id, 22)}</span>
            <span class="modname">${m.label}</span>
            <span class="moddesc">${m.desc}</span>
            <span class="modfoot">${timeChip(m.min)}<span class="chev">${ICON.chevR(16)}</span></span>
          </button>`;
        }).join("")}
      </div>
    </div>
  </div>`;

/** Sketch 4: tapping the module opens a sheet of everything that skill offers. */
const sketchSheet = () => `
  <div class="screen sketch">
    <div class="sheetwrap">
      <div class="sheet">
        <span class="grabber"></span>
        <div class="sheethead">
          <span class="tile schreiben">${mark("schreiben", 19)}</span>
          <span class="skTitle">Schreiben</span>
        </div>
        <div class="rowlist sheetlist">
          <button class="row" type="button">
            <span class="rowtext"><span class="rname">Prüfungsmodul</span><span class="rsub">1 Aufgabe, bewertet</span></span>
            ${timeChip(20)}
          </button>
          <button class="row" type="button">
            <span class="rowtext"><span class="rname">Kurz</span><span class="rsub">Kurzer Text, ohne Uhr</span></span>
            <span class="chev">${ICON.chevR(16)}</span>
          </button>
          <button class="row" type="button">
            <span class="rowtext"><span class="rname">Lang</span><span class="rsub">Voller Brief, ohne Uhr</span></span>
            <span class="chev">${ICON.chevR(16)}</span>
          </button>
          <button class="row" type="button">
            <span class="rowtext"><span class="rname">Fokus</span><span class="rsub">Ein Satz, eine Struktur</span></span>
            <span class="chev">${ICON.chevR(16)}</span>
          </button>
        </div>
      </div>
    </div>
  </div>`;

const IDEAS = [
  {
    n: 1,
    name: "Zweite Zeile",
    sketch: sketchLine(),
    what: "The Schreiben and Sprechen cards keep the timed module as the whole card, and gain one quiet line at the foot: <b>Trainer öffnen →</b>.",
    for: "Cheapest of the four, one tap to either place, nothing new to learn. The four modules stay one grid.",
    against: "Two of the four cards are structurally different from the other two, and the line is small on a phone. It also does not really merge the two things, it just parks them next to each other.",
  },
  {
    n: 2,
    name: "Modul-Seite",
    sketch: sketchModulePage(),
    what: "Tapping a module opens that skill's own page, whose header is a switcher over its modes: <b>Prüfung · Kurz · Lang · Fokus</b> for Schreiben, <b>Prüfung · Frei</b> for Sprechen. Today's Schreiben trainer becomes exactly that page.",
    for: "This is a real merge: one place per skill, and the timed exam module is simply its first mode. It uses the switcher language the app already speaks, and it has room to grow (Lesen and Hören can gain modes later without touching the hub).",
    against: "Two taps to start the timed module instead of one, and it is the most work: the Schreiben trainer and the Sprechen simulation both need their header replaced.",
  },
  {
    n: 3,
    name: "Mit Zeit / Ohne Zeit",
    sketch: sketchClockToggle(),
    what: "One switch at the top of the page, beside Niveau. In <b>Mit Zeit</b> every module is the timed exam drill. In <b>Ohne Zeit</b> the same four cards open the untimed version: for Schreiben and Sprechen that is today's trainer, for Lesen and Hören the same drill without a clock.",
    for: "All four cards stay identical and the clock, which is the only real difference, becomes one control the learner sets once. Conceptually the cleanest: the trainers stop being separate products and become a mode of the same four modules.",
    against: "The switch also promises an untimed Lesen and Hören, which needs a little engine work. And Fokus, Kurz and Lang are three different things hidden behind one 'ohne Zeit' door, so Schreiben would still need a second choice somewhere.",
  },
  {
    n: 4,
    name: "Auswahl-Blatt",
    sketch: sketchSheet(),
    what: "Tapping a module opens a small sheet listing everything that skill offers, timed module first.",
    for: "Every mode is visible in one glance, and the hub grid stays perfectly uniform.",
    against: "It puts a menu between the learner and the work, which is the interstitial that was rejected for the writing tasks in s147. Every practice run costs an extra tap, forever.",
  },
];

/* ---------------------------------- page ---------------------------------- */

const EXTRA_CSS = `
  /* Verlauf, round 2 */
  .vmore {
    display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%;
    padding: 11px 12px; border: 0; border-top: 1px solid hsl(var(--border)); background: transparent;
    cursor: pointer; font-size: 13px; font-weight: 500; color: hsl(var(--primary));
  }
  .vmore:hover { background: hsl(var(--muted) / .4); }
  .verlauf > .rowlist { border-top: 1px solid hsl(var(--border)); }

  /* Brainstorm sketches */
  .sketch { border-radius: 12px; padding: 18px 16px; }
  .sketch.tall { padding-bottom: 22px; }
  .sketch .col { gap: 12px; }
  .grid2sk { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .skhead { display: flex; align-items: center; gap: 10px; }
  .skTitle { font-size: 19px; font-weight: 700; letter-spacing: -.01em; }
  .backbtn {
    width: 34px; height: 34px; border-radius: 8px; display: grid; place-items: center;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); cursor: pointer;
    color: hsl(var(--muted-foreground));
  }
  .modeswitch.four > button { font-size: 13.5px; padding: 7px 6px; }
  .modeswitch.small > button { font-size: 12.5px; padding: 5px 10px; }
  .modeswitch.small { padding: 3px; }
  .modeswitch.small > .pill { top: 3px; bottom: 3px; }
  .clockrow { display: flex; align-items: center; gap: 8px; }
  .skbody { padding: 14px 16px; }
  .sktask { margin-top: 6px; font-size: 14.5px; }
  .skmeta { margin-top: 12px; display: flex; align-items: center; gap: 10px; }
  .sheetwrap { border-radius: 12px; overflow: hidden; }
  .sheet {
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border));
    border-radius: 14px 14px 0 0; padding: 8px 0 10px;
    box-shadow: 0 -2px 24px -6px hsl(var(--shadow) / .3);
  }
  .grabber { display: block; width: 38px; height: 4px; border-radius: 999px; background: hsl(var(--border)); margin: 0 auto 12px; }
  .sheethead { display: flex; align-items: center; gap: 10px; padding: 0 16px 12px; }
  .sheetlist > .row { padding-left: 16px; padding-right: 16px; }
  .sheetlist > .row:first-child { border-top: 1px solid hsl(var(--border)); }

  .idea { display: flex; flex-wrap: wrap; gap: 22px; align-items: flex-start; margin-top: 22px; }
  .ideasketch { flex: 0 0 360px; max-width: 100%; }
  .ideanotes { flex: 1 1 340px; min-width: 280px; }
  .ideahead { display: flex; align-items: baseline; gap: 10px; }
  .ideanum {
    flex: none; width: 24px; height: 24px; border-radius: 7px; background: var(--c-chip);
    color: var(--c-accent); font-size: 12px; font-weight: 700; display: grid; place-items: center;
  }
  .pro, .con { font-size: 13.5px; color: var(--c-muted); margin-top: 8px; padding-left: 11px; border-left: 3px solid var(--c-line); }
  .pro b, .con b { color: var(--c-ink); }
`;

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prüfung hub — round 2</title>
<style>${REVIEW_CSS}${EXTRA_CSS}</style>

<script>
  document.documentElement.dataset.marks = "g2";
  document.documentElement.dataset.colors = "c2";
  const q0 = new URLSearchParams(location.search);
  if (q0.has("dark")) document.documentElement.dataset.appearance = "dark";
</script>

<div class="page">
  <div class="wrap">
    <p class="kicker">Genauly · design review · round 2</p>
    <h1>Prüfung hub: the picked layout, and one open question</h1>
    <p class="lede" style="margin-top:8px">
      Everything you chose is now fixed: layout A, the modern marks, the receptive / productive
      colours, and the name stays <b>Prüfung</b>. Two things changed since round 1, and the second
      half of this page is the brainstorm you asked for.
    </p>

    <div class="controls">
      <div class="ctl"><span>Appearance</span>
        <div class="seg">
          <button type="button" data-app="light" aria-pressed="true">Light</button>
          <button type="button" data-app="dark" aria-pressed="false">Dark</button>
        </div>
      </div>
      <p style="font-size:13px;color:var(--c-muted);margin-left:auto">
        No option toggles this round. This is the design, ready to build.
      </p>
    </div>

    <div class="panel">
      <h2>What changed since round 1</h2>
      <div class="findings">
        <div class="finding"><span class="num">1</span><div>
          <b>Verlauf rests open</b>
          <p>No closed state any more. It leads with the three figures, then the newest runs. Only as many runs are listed as fit the screen.</p>
        </div></div>
        <div class="finding"><span class="num">2</span><div>
          <b>The rest wait behind a button</b>
          <p>"Alle 7 Durchläufe" at the foot of the block. Pressing it is what allows the page to grow past one screen. Nothing else scrolls.</p>
        </div></div>
        <div class="finding"><span class="num">3</span><div>
          <b>The connector no longer crosses the marks</b>
          <p>One segment per gap, drawn edge to edge between two tiles, instead of one line running the whole width behind them.</p>
        </div></div>
      </div>
    </div>

    <section class="option">
      <h2>The page</h2>
      <div class="framerow">
        ${frame("module", "phone", "Phone · Module üben")}
        ${frame("modelltest", "phone", "Phone · Modelltest, at rest")}
        ${frame("modelltest", "phone", "Phone · after “Alle 7 Durchläufe”", { shown: 7, rowOpen: 1, scroll: true })}
        <div class="notecol">
          <p class="note"><b>Header.</b> The switcher is the page header, in the Bibliothek's own recipe. The level sits beside it as a small <b>Niveau B2</b> button, because a second full pill row would compete with the switcher for rank.</p>
          <p class="note"><b>Module üben.</b> Four identical cards, 2×2 on a phone, four across on a desktop. Mark, name, what it contains, how long it takes. The whole card is the button.</p>
          <p class="note"><b>Modelltest.</b> The run band takes the room the page leaves, which puts <b>Prüfung starten</b> in the thumb's reach, then Verlauf sits under it already open.</p>
          <p class="note"><b>Verlauf.</b> Three figures, then the runs, newest first. A run opens in place to show the four part scores. The third frame is what the page looks like after the learner asked for all of them: that is the only state that scrolls.</p>
          <p class="note"><b>Freies Üben</b> is still a separate block here. That is exactly the thing the brainstorm below is meant to remove.</p>
        </div>
      </div>
      <div class="framerow">
        ${frame("module", "desk", "Desktop · Module üben")}
        ${frame("modelltest", "desk", "Desktop · Modelltest")}
      </div>
    </section>

    <hr class="rule">

    <section class="option">
      <h2>Merging the free trainers into the Schreiben and Sprechen modules</h2>
      <p class="lede" style="margin-top:8px">
        The problem in one sentence: <b>Schreiben exists twice</b>. Once as a 20 minute exam module
        that is graded, and once as a trainer with Fokus, Kurz and Lang that is not. The same is true
        of Sprechen: one timed exam dialogue, and one free dialogue with coaching. A learner should
        not have to know which of the two products they are in. Four ways to fix it, cheapest first.
      </p>
      ${IDEAS.map(
        (i) => `
        <div class="idea">
          <div class="ideasketch">
            <p class="framelabel">Idea ${i.n} · ${i.name}</p>
            ${i.sketch}
          </div>
          <div class="ideanotes">
            <div class="ideahead"><span class="ideanum">${i.n}</span><h3>${i.name}</h3></div>
            <p class="note" style="margin-top:8px">${i.what}</p>
            <p class="pro"><b>For:</b> ${i.for}</p>
            <p class="con"><b>Against:</b> ${i.against}</p>
          </div>
        </div>`,
      ).join("")}

      <div class="panel" style="margin-top:26px">
        <h3>The question underneath all four</h3>
        <p class="note" style="margin-top:8px">
          Is the timed exam module the <b>main event</b>, with free practice as a side door, or is free
          practice the everyday thing and the exam module the occasional test? Ideas 1 and 4 assume the
          first. Idea 3 treats them as equals. Idea 2 makes the skill the main thing and both of them
          modes of it.
        </p>
        <p class="note" style="margin-top:10px">
          Worth knowing before you decide: the Schreiben trainer already carries three modes and its own
          Verlauf, so it is a page in its own right, not a single screen. Sprechen has one mode. Whatever
          we pick has to survive that imbalance.
        </p>
      </div>
    </section>
  </div>
</div>

<script>
  const root = document.documentElement;
  document.querySelectorAll(".seg button[data-app]").forEach((b) => {
    b.addEventListener("click", () => {
      root.dataset.appearance = b.dataset.app;
      document.querySelectorAll(".seg button[data-app]").forEach((x) =>
        x.setAttribute("aria-pressed", String(x.dataset.app === b.dataset.app)),
      );
    });
  });
</script>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
