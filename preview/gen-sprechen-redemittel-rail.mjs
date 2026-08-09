/**
 * Generates `preview/sprechen-redemittel-rail.html` (+ the artifact build).
 *
 * Founder prompt (this session, verbatim):
 *
 *   "for the sprechen part, I'd want you to add a filter rail kind of rail with
 *    useful redemittle even in the practice sessions."
 *
 * Today the Redemittel of a spoken task are shown TWICE and never while the
 * learner is speaking: as four category names on the brief card before the
 * conversation starts, and as four ticked / unticked chips in the debrief after
 * it ends. The phrases themselves (8 per category, 239 in the bank) are only in
 * the Bibliothek, which is a different page in a different zone.
 *
 * This page: what is on screen today, then three places the phrases could live
 * DURING a practice conversation, each drawn from the real tokens.
 *
 * Run: node preview/gen-sprechen-redemittel-rail.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_CSS, ICON, svg } from "./gen-pruefung-shared.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "sprechen-redemittel-rail.html");
const ART = join(DIR, "sprechen-redemittel-rail-artifact.html");

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
  mic: (s) => svg(`<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="11" rx="3"/>`, s),
  bulb: (s) => svg(`<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a6 6 0 0 0-4 10.5c.7.8 1 1.5 1 2.5h6c0-1 .3-1.7 1-2.5A6 6 0 0 0 12 2z"/>`, s),
  check: (s) => svg(`<path d="m5 13 4 4L19 7"/>`, s),
  volume: (s) => svg(`<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/>`, s),
  quote: (s) => svg(`<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M8 9h8"/><path d="M8 13h5"/>`, s),
  x: (s) => svg(`<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`, s),
  reset: (s) => svg(`<path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/>`, s),
  pencil: (s) => svg(`<path d="M12 20h9"/><path d="M16.4 3.6a1 1 0 0 1 3 3L7.4 18.6a2 2 0 0 1-.9.5l-2.9.9a.5.5 0 0 1-.6-.6l.8-2.9a2 2 0 0 1 .5-.9z"/>`, s),
};

/* ------------------------------- sample data ------------------------------- */

/**
 * One real practice scenario, with real phrases from `src/data/redemittel.ts`.
 * `sie` marks a phrase that addresses the partner with Sie, `du` one that says
 * du; `-` means it works either way. Today the bank tags register as
 * neutral/formal, NOT du/Sie, which is one of the two decisions below.
 */
const CATEGORIES = [
  {
    id: "suggestions",
    label: "Vorschläge machen",
    phrases: [
      { de: "Ich würde vorschlagen, dass wir …", en: "I would suggest that we …", form: "-" },
      { de: "Mein Vorschlag wäre, …", en: "My suggestion would be …", form: "-" },
      { de: "Wie wäre es, wenn wir … würden?", en: "How about we … ?", form: "-" },
      { de: "Wir könnten doch …", en: "We could …", form: "-" },
      { de: "Sollten wir nicht lieber …?", en: "Shouldn't we rather … ?", form: "-" },
      { de: "Was hältst du davon, wenn …?", en: "What do you think about … ?", form: "du" },
      { de: "Eine Möglichkeit wäre, …", en: "One option would be to …", form: "-" },
      { de: "Ich schlage vor, dass wir zunächst …", en: "I suggest that we first …", form: "-" },
    ],
  },
  {
    id: "agree",
    label: "Zustimmen",
    phrases: [
      { de: "Das sehe ich genauso.", en: "I see it exactly the same way.", form: "-" },
      { de: "Dem stimme ich voll und ganz zu.", en: "I fully agree with that.", form: "-" },
      { de: "Das leuchtet mir ein.", en: "That makes sense to me.", form: "-" },
      { de: "Da bin ich ganz deiner Meinung.", en: "I completely agree with you.", form: "du" },
      { de: "Da hast du völlig recht.", en: "You're absolutely right there.", form: "du" },
      { de: "Ich kann mich dem nur anschließen.", en: "I can only second that.", form: "-" },
      { de: "Das ist ein überzeugender Vorschlag.", en: "That's a convincing suggestion.", form: "-" },
      { de: "Genau das wollte ich auch sagen.", en: "That's exactly what I wanted to say too.", form: "-" },
    ],
  },
  {
    id: "compromise",
    label: "Kompromisse finden",
    phrases: [
      { de: "Als Kompromiss schlage ich vor, …", en: "As a compromise I suggest …", form: "-" },
      { de: "Wir könnten uns in der Mitte treffen.", en: "We could meet in the middle.", form: "-" },
      { de: "Können wir uns darauf einigen, dass …?", en: "Can we agree that … ?", form: "-" },
      { de: "Wie wäre es mit einer Zwischenlösung?", en: "How about an interim solution?", form: "-" },
      { de: "Damit könnte ich leben.", en: "I could live with that.", form: "-" },
      { de: "Ich bin bereit, einen Schritt nachzugeben.", en: "I'm willing to give a little.", form: "-" },
      { de: "Das klingt nach einem fairen Kompromiss.", en: "That sounds like a fair compromise.", form: "-" },
      { de: "Einigen wir uns in der Mitte.", en: "Let's settle in the middle.", form: "-" },
    ],
  },
  {
    id: "negotiation",
    label: "Verhandeln",
    phrases: [
      { de: "Wenn Sie …, dann könnten wir …", en: "If you …, then we could …", form: "sie" },
      { de: "Wäre es möglich, dass …?", en: "Would it be possible that … ?", form: "-" },
      { de: "Lassen Sie uns einen Mittelweg finden.", en: "Let's find a middle ground.", form: "sie" },
      { de: "Ich komme Ihnen entgegen, wenn …", en: "I'll meet you halfway if …", form: "sie" },
      { de: "Was wäre, wenn wir …?", en: "What if we … ?", form: "-" },
      { de: "Unter einer Bedingung wäre das machbar: …", en: "On one condition that would be feasible: …", form: "-" },
      { de: "Damit wäre beiden Seiten geholfen.", en: "That would help both sides.", form: "-" },
      { de: "Lassen Sie uns aufeinander zugehen.", en: "Let's move towards each other.", form: "sie" },
    ],
  },
];

/** The scenario the mock runs: partner says Sie, so du phrases are the misfits. */
const TASK = {
  title: "Schichtplanung im Team",
  partner: "Sabine Berger",
  role: "Teamleiterin",
  goals: [
    "Schlage ein Verfahren für die neue Schichtplanung vor.",
    "Reagiere auf mindestens einen Einwand deiner Teamleiterin.",
    "Einigt euch am Ende auf einen konkreten nächsten Schritt.",
  ],
};

const TURNS = [
  {
    role: "partner",
    text: "Guten Morgen! Schön, dass Sie sich Zeit nehmen. Wir müssen den Schichtplan für den Herbst festlegen, und das Team ist unruhig. Wie würden Sie da vorgehen?",
  },
  {
    role: "learner",
    text: "Ich würde vorschlagen, dass wir zuerst die Wünsche im Team sammeln und dann den Plan daraus bauen.",
  },
  {
    role: "partner",
    text: "Das klingt vernünftig. Nur steht der Plan bis Freitag, und drei Kolleginnen sind diese Woche im Urlaub. Wie lösen wir das?",
  },
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

/**
 * The app header inside the Prüfung zone: the ONE exit, last control, top right,
 * and NOTHING else on that side (founder s195/s201). The mock keeps that law.
 */
const appHdr = () => `
  <div class="apphdr">
    <div class="hdrleft"></div>
    <div class="hdrright"><span class="exitbtn">Zurück</span></div>
  </div>`;

const phoneHdr = () => `
  <div class="apphdr">
    <div class="hdrleft"><span class="logomark sm"></span></div>
    <div class="hdrright"><span class="exitbtn sm">Zurück</span></div>
  </div>`;

const navBar = () => `
  <div class="navbar">
    ${["a", "b", "c", "d", "e"]
      .map((t) => `<span class="navtab${t === "c" ? " on" : ""}"><i></i>${t === "c" ? "<em>Prüfung</em>" : ""}</span>`)
      .join("")}
  </div>`;

/** The mobile module row: names the module, carries no control (founder s201). */
const moduleRow = () => `
  <div class="modrow"><span class="tile sm sprechen">${I.sprechen2(13)}</span><b>Sprechen</b></div>`;

/* ------------------------------ the conversation --------------------------- */

/** The collapsed brief that every layout already carries, at rest. */
const briefRow = (extra = "") => `
  <div class="briefrow">
    <span class="briefbtn">
      <b>${TASK.title}</b><i>· ${TASK.partner}</i>
      <span class="chev">${I.chevD(15)}</span>
    </span>
    ${extra}
  </div>`;

const thread = (n = TURNS.length) => `
  <div class="thread">
    ${TURNS.slice(0, n)
      .map((t) =>
        t.role === "partner"
          ? `<div class="bubblewrap"><div class="bubble partner">
              <p>${t.text}</p>
              <span class="replay">${I.volume(12)} Nochmal hören</span>
            </div></div>`
          : `<div class="bubblewrap mine"><div class="bubble learner">
              <p>${t.text}</p>
              <span class="replay right">${I.pencil(12)} Falsch gehört?</span>
            </div></div>`,
      )
      .join("")}
  </div>`;

const micCluster = (caption = "Noch 9 Beiträge") => `
  <div class="mics">
    <div class="microw">
      <span class="clbtn"><span class="clcircle">${I.bulb(19)}</span>Hilfe</span>
      <span class="micbtn">${I.mic(28)}</span>
      <span class="clbtn"><span class="clcircle">${I.check(19)}</span>Beenden</span>
    </div>
    <p class="miccap">${caption}</p>
  </div>`;

/* ------------------------------- the rail ---------------------------------- */

/** One phrase row. `off` = filtered out by the du/Sie switch. */
const phraseRow = (p, { compact = false } = {}) => `
  <span class="phrase${p.form === "du" ? " duform" : ""}${compact ? " compact" : ""}">
    <b>${p.de}</b>
    <i>${p.en}</i>
  </span>`;

/**
 * The Redemittel tile, in the ScopeRail language: Himmelblau fill, no visible
 * edge, header row with a reset, sections inside. `layout="panel"` adds the X.
 */
const redemittelTile = ({ panel = false, cls = "", depth = "curated" } = {}) => `
  <aside class="scoperail ${cls}">
    <div class="railhead">
      <span class="railtitle">${I.quote(15)} Redemittel</span>
      <span class="railicon">${I.reset(15)}</span>
      ${panel ? `<span class="railicon">${I.x(15)}</span>` : ""}
    </div>
    <div class="railbody">
      <section>
        <p class="scopelab">Sprechabsicht</p>
        <span class="scopesel"><b>Vorschläge machen</b><i>8</i>${I.chevD(14)}</span>
      </section>
      <section class="phraselist ${depth}">
        ${CATEGORIES[0].phrases.map((p) => phraseRow(p)).join("")}
      </section>
      <section class="othercats">
        <p class="scopelab">Auch im Gespräch</p>
        <div class="catpills">
          ${CATEGORIES.slice(1)
            .map((c) => `<span class="catpill">${c.label}<i>8</i></span>`)
            .join("")}
        </div>
      </section>
    </div>
  </aside>`;

/* ------------------------------- the frames -------------------------------- */

const desk = (inner, { wide = false } = {}) => `
  <div class="frame desk">
    <div class="screen shell">
      ${sidebar()}
      <div class="main">
        ${appHdr()}
        <div class="pagearea"><div class="stage ${wide ? "wide" : ""}">${inner}</div></div>
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

/* --------------------------------- today ----------------------------------- */

const todayDesk = () =>
  desk(`
    <div class="convcol">
      ${briefRow()}
      ${thread()}
      ${micCluster()}
    </div>`);

const todayBrief = () => `
  <div class="frame mob">
    <div class="screen">
      ${phoneHdr()}
      <div class="phonebody">
        ${moduleRow()}
        <div class="card briefcard">
          <p class="eyebrow mut">Aufgabe</p>
          <p class="brieftitle">${TASK.title}</p>
          <p class="briefsit">Ihre Teamleiterin möchte den Schichtplan für den Herbst mit Ihnen festlegen.</p>
          <p class="scopelab">Das sollst du schaffen</p>
          <ol class="goals">${TASK.goals.map((g) => `<li><i></i>${g}</li>`).join("")}</ol>
          <p class="scopelab">Redemittel</p>
          <div class="catpills flat">${CATEGORIES.map((c) => `<span class="catpill plain">${c.label}</span>`).join("")}</div>
          <span class="btn grad wide">Gespräch starten</span>
        </div>
      </div>
      ${navBar()}
    </div>
  </div>`;

/* -------------------------------- option A --------------------------------- */

const optionADesk = () =>
  desk(
    `<div class="convcol">
      ${briefRow()}
      ${thread()}
      ${micCluster()}
    </div>
    ${redemittelTile({ cls: "railcol" })}`,
    { wide: true },
  );

const optionAPhone = () =>
  phone(`
    ${moduleRow()}
    ${briefRow(`<span class="railtoggle on">${I.quote(14)} Redemittel</span>`)}
    <div class="mobstage">
      ${thread(2)}
      <div class="paneloverlay">${redemittelTile({ panel: true, cls: "railpanel" })}</div>
    </div>
    ${micCluster()}`);

/* -------------------------------- option B --------------------------------- */

const strip = () => `
  <div class="strip">
    <div class="stripcats">
      ${CATEGORIES.map((c, i) => `<span class="stripcat${i === 0 ? " on" : ""}">${c.label}</span>`).join("")}
    </div>
    <div class="stripchips">
      ${CATEGORIES[0].phrases
        .slice(0, 4)
        .map((p, i) => `<span class="chip${i === 0 ? " open" : ""}">${p.de}${i === 0 ? `<i>${p.en}</i>` : ""}</span>`)
        .join("")}
      <span class="chipmore">${I.chevR(14)}</span>
    </div>
  </div>`;

const optionBDesk = () =>
  desk(`
    <div class="convcol">
      ${briefRow()}
      ${thread()}
      ${strip()}
      ${micCluster()}
    </div>`);

const optionBPhone = () =>
  phone(`
    ${moduleRow()}
    ${briefRow()}
    <div class="mobstage">${thread(2)}</div>
    ${strip()}
    ${micCluster()}`);

/* -------------------------------- option C --------------------------------- */

const drawer = (open) => `
  <div class="drawer">
    <div class="drawertabs">
      <span class="dtab${open === "aufgabe" ? " on" : ""}">Aufgabe</span>
      <span class="dtab${open === "redemittel" ? " on" : ""}">Redemittel</span>
      <span class="dtitle">${TASK.title} <i>· ${TASK.partner}</i></span>
      <span class="chev up">${I.chevD(15)}</span>
    </div>
    <div class="drawerbody">
      ${
        open === "aufgabe"
          ? `<ol class="goals accent">${TASK.goals.map((g) => `<li><i></i>${g}</li>`).join("")}</ol>`
          : `<div class="drawerlist">
              <div class="drawercats">
                ${CATEGORIES.map((c, i) => `<span class="stripcat${i === 0 ? " on" : ""}">${c.label}</span>`).join("")}
              </div>
              <div class="drawerphrases">
                ${CATEGORIES[0].phrases.slice(0, 6).map((p) => phraseRow(p, { compact: true })).join("")}
              </div>
            </div>`
      }
    </div>
  </div>`;

const optionCDesk = () =>
  desk(`
    <div class="convcol">
      ${drawer("redemittel")}
      ${thread(2)}
      ${micCluster()}
    </div>`);

const optionCPhone = () =>
  phone(`
    ${moduleRow()}
    ${drawer("redemittel")}
    <div class="mobstage">${thread(1)}</div>
    ${micCluster()}`);

/* ---------------------------------- CSS ------------------------------------ */

const CSS = String.raw`
  .wrap { max-width: 1300px; }
  .framebox.desk { overflow-x: auto; }
  .frame.desk { min-width: 1120px; }
  .frame.desk .screen { padding: 0; }
  .frame.mob { width: 372px; }
  .frame.mob .screen { padding: 0; height: 778px; overflow: hidden; position: relative; display: block; }

  /* Shell ---------------------------------------------------------- */
  .shell { display: flex; align-items: stretch; min-height: 660px; }
  .side {
    flex: none; width: 232px; border-right: 1px solid hsl(var(--border));
    background: hsl(var(--surface) / .6); padding: 14px 12px; display: flex; flex-direction: column; gap: 18px;
  }
  .sidebrand { display: flex; align-items: center; gap: 9px; padding: 4px 8px; font-size: 17px; font-weight: 800; letter-spacing: -.02em; }
  .logomark { width: 28px; height: 28px; border-radius: 9px; background: linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to))); flex: none; }
  .logomark.sm { width: 24px; height: 24px; border-radius: 8px; }
  .sidenav { display: flex; flex-direction: column; gap: 2px; }
  .sideitem { display: flex; align-items: center; gap: 11px; padding: 9px 10px; border-radius: 8px; color: hsl(var(--muted-foreground)); font-size: 14.5px; }
  .sideitem em { font-style: normal; font-weight: 600; }
  .sideitem.on { background: hsl(var(--primary) / .1); color: hsl(var(--primary)); }
  .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }

  .apphdr {
    height: 60px; flex: none; display: flex; align-items: center; justify-content: space-between;
    padding: 0 22px; border-bottom: 1px solid hsl(var(--border)); background: hsl(var(--surface) / .75);
  }
  .frame.mob .apphdr { height: 50px; padding: 0 14px; }
  .hdrright { display: flex; align-items: center; gap: 8px; }
  .exitbtn {
    display: inline-flex; align-items: center; height: 32px; padding: 0 13px; border-radius: 8px;
    border: 1px solid hsl(var(--border)); background: hsl(var(--surface));
    font-size: 13px; font-weight: 650; color: hsl(var(--muted-foreground));
  }
  .exitbtn.sm { height: 28px; font-size: 12.5px; padding: 0 11px; }

  .navbar {
    position: absolute; left: 0; right: 0; bottom: 0; height: 56px; display: flex; align-items: center;
    justify-content: space-around; border-top: 1px solid hsl(var(--border)); background: hsl(var(--surface) / .95);
  }
  .navtab { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .navtab i { display: block; width: 22px; height: 22px; border-radius: 7px; background: hsl(var(--border)); }
  .navtab.on i { background: hsl(var(--primary) / .85); }
  .navtab em { font-style: normal; font-size: 10px; font-weight: 650; }

  .pagearea { flex: 1; padding: 20px 22px 26px; display: flex; justify-content: center; }
  .phonebody { padding: 10px 12px 0; height: 672px; display: flex; flex-direction: column; gap: 8px; overflow: hidden; }

  /* The conversation stage ---------------------------------------- */
  .stage { display: flex; gap: 26px; width: 100%; max-width: 672px; }
  .stage.wide { max-width: 968px; }
  .convcol { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; height: 560px; }
  .railcol { flex: none; width: 256px; align-self: flex-start; }

  .modrow { display: flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 700; }
  .briefrow { display: flex; align-items: center; gap: 8px; flex: none; }
  .briefbtn {
    flex: 1; min-width: 0; display: flex; align-items: center; gap: 8px;
    border: 1px solid hsl(var(--border)); background: hsl(var(--surface)); border-radius: 8px;
    padding: 8px 10px; font-size: 13px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .10);
  }
  .briefbtn b { font-weight: 700; }
  .briefbtn i { font-style: normal; font-weight: 500; color: hsl(var(--muted-foreground)); }
  .briefbtn .chev { margin-left: auto; color: hsl(var(--muted-foreground)); display: flex; }
  .railtoggle {
    flex: none; display: inline-flex; align-items: center; gap: 5px; height: 34px; padding: 0 10px;
    border-radius: 8px; font-size: 12.5px; font-weight: 700;
    background: hsl(var(--accent) / .35); color: hsl(var(--accent-ink));
  }
  [data-appearance="dark"] .railtoggle { background: hsl(var(--accent) / .18); color: hsl(var(--accent)); }
  .railtoggle.on { background: hsl(var(--primary)); color: #fff; }

  /* Thread --------------------------------------------------------- */
  .thread { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 10px; overflow: hidden; }
  .mobstage { flex: 1; min-height: 0; position: relative; display: flex; }
  .bubblewrap { display: flex; max-width: 88%; }
  .bubblewrap.mine { align-self: flex-end; }
  .bubble { min-width: 0; border-radius: 10px; padding: 10px 12px; }
  .bubble p { font-size: 14.5px; line-height: 1.35; }
  .bubble.partner { background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .1); }
  .bubble.learner { background: hsl(var(--accent) / .2); border: 1px solid hsl(var(--accent) / .2); }
  [data-appearance="dark"] .bubble.learner { background: hsl(var(--accent) / .1); border-color: hsl(var(--accent) / .1); }
  .replay { display: inline-flex; align-items: center; gap: 4px; margin-top: 5px; font-size: 11px; font-weight: 650; color: hsl(var(--muted-foreground)); }
  .replay.right { justify-content: flex-end; width: 100%; }

  /* Mic cluster ---------------------------------------------------- */
  .mics { flex: none; padding-top: 6px; }
  .microw { display: flex; align-items: center; justify-content: center; gap: 20px; }
  .clbtn { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 700; color: hsl(var(--muted-foreground)); }
  .clcircle { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 999px; border: 1px solid hsl(var(--border)); background: hsl(var(--surface)); box-shadow: 0 1px 2px hsl(var(--shadow) / .06); }
  .micbtn {
    display: grid; place-items: center; width: 68px; height: 68px; border-radius: 999px; color: #fff;
    background: linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to)));
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .14);
  }
  .miccap { margin-top: 9px; text-align: center; font-size: 12px; color: hsl(var(--muted-foreground)); }

  /* The Redemittel tile (ScopeRail language) ----------------------- */
  .scoperail {
    border-radius: 12px; background: hsl(var(--accent) / .2); border: 1px solid hsl(var(--accent) / .2);
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .1);
  }
  [data-appearance="dark"] .scoperail { background: hsl(var(--accent) / .1); border-color: hsl(var(--accent) / .1); }
  .railhead { display: flex; align-items: center; gap: 4px; padding: 8px 10px 6px; }
  .railtitle { flex: 1; display: inline-flex; align-items: center; gap: 7px; font-size: 13.5px; font-weight: 700; color: hsl(var(--primary)); }
  .railicon { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; color: hsl(var(--muted-foreground)); }
  .railbody { padding: 2px 10px 11px; display: flex; flex-direction: column; gap: 12px; }
  .scopelab { font-size: 11.5px; font-weight: 700; letter-spacing: .045em; text-transform: uppercase; color: hsl(var(--muted-foreground)); margin-bottom: 6px; }
  .scopesel {
    display: flex; align-items: center; gap: 7px; width: 100%; padding: 6px 9px; border-radius: 8px;
    border: 1px solid hsl(var(--border)); background: hsl(var(--surface)); font-size: 12.5px;
  }
  .scopesel b { flex: 1; min-width: 0; font-weight: 650; }
  .scopesel i { font-style: normal; font-size: 11.5px; color: hsl(var(--muted-foreground)); font-variant-numeric: tabular-nums; }
  .scopesel svg { color: hsl(var(--muted-foreground)); }

  .phraselist { display: flex; flex-direction: column; gap: 6px; }
  .phrase {
    display: block; border-radius: 8px; background: hsl(var(--surface)); border: 1px solid hsl(var(--border));
    padding: 7px 9px;
  }
  .phrase b { display: block; font-size: 13px; font-weight: 650; line-height: 1.3; }
  .phrase i { display: block; margin-top: 2px; font-style: normal; font-size: 11.5px; line-height: 1.3; color: hsl(var(--muted-foreground)); }
  .phrase.compact b { font-size: 12.5px; }
  /* "Show English inline" is a switch on this page; the app itself would use the
     hold-to-peek pattern, so the English line is hidden by default. */
  [data-en="peek"] .phrase i { display: none; }
  /* The du/Sie switch: this task's partner says Sie, so du phrases drop out. */
  [data-form="match"] .phrase.duform { display: none; }
  [data-form="match"] .chip.duform { display: none; }
  /* Depth: curated shows 3 per intent, full shows all 8. */
  [data-depth="curated"] .phraselist .phrase:nth-child(n + 4) { display: none; }

  .catpills { display: flex; flex-wrap: wrap; gap: 5px; }
  .catpill {
    display: inline-flex; align-items: center; gap: 5px; border-radius: 6px; padding: 4px 8px;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); font-size: 11.5px; font-weight: 650;
  }
  .catpill i { font-style: normal; color: hsl(var(--muted-foreground)); font-variant-numeric: tabular-nums; }
  .catpill.plain { background: hsl(var(--muted)); border-color: transparent; color: hsl(var(--muted-foreground)); }
  .catpills.flat { margin-bottom: 14px; }

  /* Option A, phone: the panel covers the thread inside the stage. It needs an
     OPAQUE backing of its own: the tile is a translucent wash, so without one
     the transcript reads straight through it (the s166 "nothing see-through"
     rule, one surface further). */
  .paneloverlay { position: absolute; inset: 0; display: flex; background: hsl(var(--background)); }
  .railpanel { width: 100%; align-self: stretch; overflow: hidden; }

  /* Option B: the strip above the microphone ----------------------- */
  .strip { flex: none; display: flex; flex-direction: column; gap: 6px; }
  .stripcats { display: flex; gap: 5px; overflow: hidden; }
  .stripcat {
    flex: none; border-radius: 6px; padding: 3px 8px; font-size: 11.5px; font-weight: 650;
    background: hsl(var(--muted)); color: hsl(var(--muted-foreground));
  }
  .stripcat.on { background: hsl(var(--accent) / .35); color: hsl(var(--accent-ink)); }
  [data-appearance="dark"] .stripcat.on { background: hsl(var(--accent) / .18); color: hsl(var(--accent)); }
  .stripchips { display: flex; align-items: center; gap: 6px; overflow: hidden; }
  .chip {
    flex: none; max-width: 210px; border-radius: 8px; padding: 6px 9px; font-size: 12.5px; font-weight: 600;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); white-space: nowrap;
    overflow: hidden; text-overflow: ellipsis;
  }
  .chip.open { white-space: normal; max-width: 260px; border-color: hsl(var(--accent) / .5); background: hsl(var(--accent) / .18); }
  [data-appearance="dark"] .chip.open { background: hsl(var(--accent) / .1); }
  .chip i { display: block; font-style: normal; font-size: 11px; font-weight: 500; color: hsl(var(--muted-foreground)); margin-top: 2px; }
  [data-en="peek"] .chip i { display: none; }
  .chipmore { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 7px; background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); flex: none; }

  /* Option C: the two-tab drawer ----------------------------------- */
  .drawer {
    flex: none; border-radius: 10px; background: hsl(var(--accent) / .2); border: 1px solid hsl(var(--accent) / .2);
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .1); overflow: hidden;
  }
  [data-appearance="dark"] .drawer { background: hsl(var(--accent) / .1); border-color: hsl(var(--accent) / .1); }
  .drawertabs { display: flex; align-items: center; gap: 6px; padding: 7px 9px; }
  .dtab { border-radius: 6px; padding: 4px 9px; font-size: 12px; font-weight: 700; color: hsl(var(--muted-foreground)); }
  .dtab.on { background: hsl(var(--surface)); color: hsl(var(--primary)); box-shadow: 0 1px 2px hsl(var(--shadow) / .08); }
  .dtitle { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12.5px; font-weight: 650; text-align: right; }
  .dtitle i { font-style: normal; font-weight: 500; color: hsl(var(--muted-foreground)); }
  .drawertabs .chev { display: flex; color: hsl(var(--muted-foreground)); }
  .drawertabs .chev.up { transform: rotate(180deg); }
  .drawerbody { padding: 0 9px 10px; }
  .drawercats { display: flex; gap: 5px; margin-bottom: 7px; flex-wrap: wrap; }
  .drawerphrases { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .frame.mob .drawerphrases { grid-template-columns: 1fr; }
  [data-depth="curated"] .drawerphrases .phrase:nth-child(n + 4) { display: none; }

  .goals { display: flex; flex-direction: column; gap: 6px; counter-reset: g; }
  .goals li { display: flex; gap: 8px; font-size: 12.5px; line-height: 1.35; counter-increment: g; }
  .goals li i::before { content: counter(g) "."; }
  .goals li i { font-style: normal; font-weight: 700; font-size: 11.5px; color: hsl(var(--accent-ink)); }
  [data-appearance="dark"] .goals li i { color: hsl(var(--accent)); }

  /* Brief card (today's frame) ------------------------------------- */
  .briefcard { padding: 14px; display: flex; flex-direction: column; }
  .brieftitle { font-size: 17px; font-weight: 800; letter-spacing: -.015em; margin: 2px 0 6px; }
  .briefsit { font-size: 13px; line-height: 1.4; color: hsl(var(--muted-foreground)); margin-bottom: 14px; }
  .briefcard .scopelab { margin-top: 4px; }
  .briefcard .goals { margin-bottom: 14px; }
  .btn.wide { width: 100%; justify-content: center; text-align: center; }

  /* Review chrome extras ------------------------------------------- */
  .flag { display: flex; gap: 10px; align-items: flex-start; margin-top: 12px; }
  blockquote {
    margin: 14px 0 0; padding: 12px 16px; border-left: 3px solid var(--c-accent);
    background: var(--c-chip); border-radius: 0 8px 8px 0; font-size: 14px;
  }
  .twocol { display: flex; gap: 18px; flex-wrap: wrap; align-items: flex-start; }
`;

/* ---------------------------------- page ----------------------------------- */

const ATTRS = `id="root" data-appearance="light" data-depth="curated" data-form="match" data-en="peek"`;

const page = `<div class="page">
  <div class="wrap">
    <p class="kicker">Sprechen · practice conversation</p>
    <h1>Phrases while you speak</h1>
    <p class="lede">You asked for a filter-rail-style rail with useful Redemittel in the practice
      conversations. Right now the app names the four Redemittel <b>categories</b> before the
      conversation and ticks them off after it, but never shows a single actual phrase while the
      learner is talking, which is the only moment they need one. Below: today's screens, then three
      places the phrases could live. Two switches at the top change what the rail holds in every
      option, so you can answer layout and content in one reply.</p>

    <blockquote>“for the sprechen part, I'd want you to add a filter rail kind of rail with useful
      redemittle even in the practice sessions.”
      <br><span style="color:var(--c-muted)">(your prompt, this session)</span></blockquote>

    <div class="controls">
      <div class="ctl"><span>Theme</span>
        <div class="seg" id="seg-appearance">
          <button data-v="light" aria-pressed="true">Light</button>
          <button data-v="dark" aria-pressed="false">Dark</button>
        </div>
      </div>
      <div class="ctl"><span>How many phrases</span>
        <div class="seg" id="seg-depth">
          <button data-v="curated" aria-pressed="true">3 per intent</button>
          <button data-v="full" aria-pressed="false">All 8 per intent</button>
        </div>
      </div>
      <div class="ctl"><span>du / Sie</span>
        <div class="seg" id="seg-form">
          <button data-v="match" aria-pressed="true">Match the partner</button>
          <button data-v="all" aria-pressed="false">Show everything</button>
        </div>
      </div>
      <div class="ctl"><span>English line</span>
        <div class="seg" id="seg-en">
          <button data-v="peek" aria-pressed="true">Hold to peek</button>
          <button data-v="inline" aria-pressed="false">Always visible</button>
        </div>
      </div>
    </div>

    <!-- ------------------------------ TODAY ------------------------------ -->
    <div class="panel">
      <h2>What a learner sees today</h2>
      <p class="lede" style="margin-top:6px">The brief card lists the four Redemittel categories as
        grey labels. Then the conversation starts, the brief collapses to one line, and the phrases
        are gone. The bank has eight phrases behind each of those four labels, in the Bibliothek,
        in another zone.</p>
      <div class="findings">
        <div class="finding"><span class="num">1</span><div><b>Category names are not language</b>
          <p>“Vorschläge machen” tells a B1 learner what to do, not how to say it. The eight phrases
          that would let them do it are one page away and two taps out of reach mid-conversation.</p></div></div>
        <div class="finding"><span class="num">2</span><div><b>The one moment they matter is the one moment they are missing</b>
          <p>The words are on screen before the conversation and after it, never during. The debrief
          then grades whether those Redemittel were used.</p></div></div>
        <div class="finding"><span class="num">3</span><div><b>Nothing on the running screen is a rail</b>
          <p>The conversation is a single 672 px column: collapsed brief, transcript, microphone.
          There is empty space beside it on a desktop and none at all on a phone.</p></div></div>
      </div>
      <div class="framerow" style="margin-top:18px">
        <div class="framebox desk">
          <p class="framelabel">Desktop, mid-conversation (today)</p>
          ${todayDesk()}
        </div>
        <div class="framebox phone">
          <p class="framelabel">Phone, the brief before starting (today)</p>
          ${todayBrief()}
        </div>
      </div>
    </div>

    <hr class="rule">

    <!-- ------------------------------ SHARED ----------------------------- -->
    <div class="panel" style="margin-top:26px">
      <h2>True in all three options</h2>
      <div class="findings">
        <div class="finding"><span class="num">A</span><div><b>Practice only, never the Modelltest</b>
          <p>The exam grades whether the candidate reached for these phrases. Handing them the list
          during Teil Sprechen would grade the reading, not the speaking. Say the word if you want it
          in the exam too.</p></div></div>
        <div class="finding"><span class="num">B</span><div><b>The phrases are the task's own</b>
          <p>Each scenario already names four Redemittel categories, and the debrief already grades
          against exactly those. No new content is authored: the rail reads the existing bank.</p></div></div>
        <div class="finding"><span class="num">C</span><div><b>Reading a phrase is never a tick</b>
          <p>Whether a Redemittel was used stays a question for the model, judged from what was
          actually said. Tapping one in the rail proves nothing and marks nothing.</p></div></div>
        <div class="finding"><span class="num">D</span><div><b>The tile is the rail you already approved</b>
          <p>Same Himmelblau fill, same uppercase section labels, same dropdown, same reset icon as
          “Aufgabe wählen”. Nothing new is invented.</p></div></div>
      </div>
    </div>

    <!-- ------------------------------ OPTION A --------------------------- -->
    <div class="option" id="optA">
      <div class="opthead"><span class="optname">Option A</span><h2>A rail beside the conversation</h2></div>
      <p class="lede">The literal answer to your prompt. On a desktop the conversation keeps its
        column and a 256 px <b>Redemittel</b> rail appears beside it, in the same Himmelblau tile as
        “Aufgabe wählen”: a dropdown that picks the speech intent, the phrases for it as white cards,
        and the task's other three intents as pills below. On a phone the same tile opens as a panel
        over the transcript, behind one toggle next to the collapsed brief.</p>
      <div class="framerow">
        <div class="framebox desk">
          <p class="framelabel">Desktop</p>
          ${optionADesk()}
        </div>
        <div class="framebox phone">
          <p class="framelabel">Phone, rail open</p>
          ${optionAPhone()}
        </div>
        <div class="notecol">
          <p class="note"><b>Most phrases visible at once.</b> Three to eight, with room for the
            English line, and it can be browsed while the partner is talking.</p>
          <p class="note"><b>It is the rail language, so it reads as part of the app</b> rather than
            as a feature bolted onto the speaking screen.</p>
          <p class="note"><b>Desktop gets it for free</b>: the space beside the conversation is
            currently empty.</p>
          <p class="cost"><b>Cost:</b> on a phone it covers the transcript while open, so the learner
            reads either their conversation or their phrases, not both. The stage cannot grow, and
            the rule that a running screen never scrolls the page holds.</p>
        </div>
      </div>
    </div>

    <!-- ------------------------------ OPTION B --------------------------- -->
    <div class="option" id="optB">
      <div class="opthead"><span class="optname">Option B</span><h2>A phrase strip above the microphone</h2></div>
      <p class="lede">One row of phrase chips directly above the mic, with the four intents as small
        pills over it. Tapping a chip opens it to the full phrase (and its English). Identical on
        desktop and phone, and it sits where the learner's eyes already are in the second before they
        speak.</p>
      <div class="framerow">
        <div class="framebox desk">
          <p class="framelabel">Desktop</p>
          ${optionBDesk()}
        </div>
        <div class="framebox phone">
          <p class="framelabel">Phone</p>
          ${optionBPhone()}
        </div>
        <div class="notecol">
          <p class="note"><b>Nothing is ever covered.</b> The transcript stays, the phrases sit under
            it, both are readable at the same time.</p>
          <p class="note"><b>One layout for both widths</b>, in the thumb zone on a phone.</p>
          <p class="note"><b>Cheapest in height</b>: about 60 px, so the transcript loses one bubble
            and nothing else moves.</p>
          <p class="cost"><b>Cost:</b> it is not a rail. Two or three phrases are readable at a time
            and the rest are a sideways scroll, so it prompts rather than teaches. It also adds a
            second horizontal scroller to a screen that already scrolls vertically.</p>
        </div>
      </div>
    </div>

    <!-- ------------------------------ OPTION C --------------------------- -->
    <div class="option" id="optC">
      <div class="opthead"><span class="optname">Option C</span><h2>Two tabs on the brief drawer</h2></div>
      <p class="lede">The collapsed brief that already sits above every conversation grows a second
        tab. <b>Aufgabe</b> is today's goal list; <b>Redemittel</b> is the phrase list, in the same
        accent panel. One place holds everything about the task, and no new chrome appears anywhere
        on the screen.</p>
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
          <p class="note"><b>No new element on the screen.</b> The disclosure the learner already
            uses simply holds one more thing.</p>
          <p class="note"><b>Desktop and phone are the same layout</b>, which keeps one thing to
            build and one thing to maintain.</p>
          <p class="note"><b>Two columns of phrases on a desktop</b>, one on a phone.</p>
          <p class="cost"><b>Cost:</b> open, it eats the top third of the transcript, and the goals
            and the phrases are mutually exclusive. It also does not look like a rail, which is what
            you asked for.</p>
        </div>
      </div>
    </div>

    <hr class="rule">

    <!-- ------------------------------ DECISIONS -------------------------- -->
    <div class="panel" style="margin-top:26px">
      <h2>The two content switches</h2>
      <div class="findings">
        <div class="finding"><span class="num">1</span><div><b>Three phrases per intent, or all eight</b>
          <p>Eight is everything the bank holds, and on a phone it is a list to read instead of a
          conversation to have. Three is the strongest three, with the rest one tap away in the
          dropdown. The switch at the top of this page shows both.</p></div></div>
        <div class="finding"><span class="num">2</span><div><b>du / Sie</b>
          <p>Sabine Berger says Sie, so “Was hältst du davon, wenn …?” is the wrong phrase in this
          conversation. Filtering it out is the one thing here that genuinely earns the word
          “filter”. The catch: the bank tags phrases neutral / formal, not du / Sie, so this needs a
          small derived rule reading the phrase text. It goes in one place, like the gap rule in the
          writing clozes, never copied per call site.</p></div></div>
        <div class="finding"><span class="num">3</span><div><b>The English line</b>
          <p>Hold-to-peek is the app's pattern everywhere else, and it keeps the rail short. Always
          visible doubles the height of every row but never needs a press mid-conversation.</p></div></div>
      </div>
    </div>

    <div class="panel" style="margin-top:22px">
      <h2>How to reply</h2>
      <p class="lede" style="margin-top:6px">Name the option and the two switches, for example
        “A, 3 per intent, match the partner, hold to peek”. If you want the rail in the Modelltest as
        well, or a different name than “Redemittel” on the tile, say it in the same reply and it goes
        into this round.</p>
    </div>
  </div>
</div>`;

const SCRIPT = String.raw`
  for (const [id, attr] of [["seg-appearance", "appearance"], ["seg-depth", "depth"], ["seg-form", "form"], ["seg-en", "en"]]) {
    const seg = document.getElementById(id);
    if (!seg) continue;
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
<title>Sprechen: phrases while you speak</title>
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

writeFileSync(
  ART,
  `<title>Sprechen: phrases while you speak</title>
<style>${REVIEW_CSS}${CSS}</style>
<div ${ATTRS}>
${page}
</div>
<script>${SCRIPT}</script>`,
);

console.log("wrote", OUT, "and", ART);
