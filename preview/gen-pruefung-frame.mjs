/**
 * Generates `preview/pruefung-frame.html` (+ the artifact build).
 *
 * Founder prompt (s195): "for the prufung hub - the page layouts and design are
 * all either inconsistent with different back buttons styles at different
 * positions or with awkward empty spaces. There's no harmonious and coherent
 * design language amongst these pages. review this and propose some ideas."
 *
 * The page is in two halves: the AUDIT (what the seven screens of the zone do
 * today, measured from the code) and the OPTIONS (three ways to give the whole
 * zone one frame, plus two ways to answer the empty space). Everything is drawn
 * from the real tokens in `gen-pruefung-shared.mjs`.
 *
 * Run: node preview/gen-pruefung-frame.mjs
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { REVIEW_CSS, ICON, mark, svg } from "./gen-pruefung-shared.mjs";

const DIR = dirname(fileURLToPath(import.meta.url));
const OUT = join(DIR, "pruefung-frame.html");
const ART = join(DIR, "pruefung-frame-artifact.html");

/* --------------------------------- icons ---------------------------------- */

const I = {
  ...ICON,
  arrowL: (s) => svg(`<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>`, s),
  logout: (s) =>
    svg(`<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>`, s),
  flame: (s) => svg(`<path d="M12 2c1 4 5 5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 2 2 2 0 0-2-1-3 1-5z"/>`, s),
  user: (s) => svg(`<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`, s),
  max: (s) => svg(`<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>`, s),
  mic: (s) => svg(`<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="11" rx="3"/>`, s),
  target: (s) => svg(`<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>`, s),
};

/* ------------------------------- page pieces ------------------------------- */

const MODS = [
  { id: "lesen", label: "Lesen", min: 15 },
  { id: "hoeren", label: "Hören", min: 10 },
  { id: "schreiben", label: "Schreiben", min: 20 },
  { id: "sprechen", label: "Sprechen", min: 7 },
];

/** The app's own top bar, mocked. `right` picks what sits in its right slot. */
const appHdr = (right) => `
  <div class="apphdr">
    <span class="logomark"></span>
    <div class="hdrright">${
      right === "danger"
        ? `<span class="exit danger">${I.logout(16)}<b>Verlassen</b></span>`
        : right === "quiet"
          ? `<span class="exit quiet">${I.arrowL(16)}<b>Zurück</b></span>`
          : right === "normal"
            ? `<span class="streak">${I.flame(14)}<b>7</b><i>Tage</i></span><span class="avatar">${I.user(15)}</span>`
            : ""
    }</div>
  </div>`;

/** The mobile tab bar, mocked (present on the trainers, gone during an exam). */
const navBar = (lit = "pruefung") => `
  <div class="navbar">
    ${["praktisch", "bibliothek", "pruefung", "fortschritt", "mehr"]
      .map(
        (t) =>
          `<span class="navtab${t === lit ? " on" : ""}"><i></i>${
            t === lit ? `<em>Prüfung</em>` : ""
          }</span>`,
      )
      .join("")}
  </div>`;

const runBar = ({ timer = "12:40", title = "Lesen", step = "Teil 1 von 4", back = null }) => `
  <div class="runbar">
    ${back ? `<span class="inbar-back">${I.arrowL(15)}<b>Zurück</b></span><span class="vdiv"></span>` : ""}
    <p class="rb-title">${title}<span> · ${step}</span></p>
    <div class="rb-right">
      <span class="dots"><i class="done"></i><i class="now"></i><i></i><i></i></span>
      ${timer ? `<span class="timer">${I.clock(13)}<b class="tnum">${timer}</b></span>` : ""}
    </div>
  </div>`;

const textCard = () => `
  <div class="card textcard">
    <div class="tc-head">
      <div>
        <p class="tc-kind">Text 1 von 3 · Aushang</p>
        <p class="tc-title">Neue Regelung für die Mittagspause</p>
      </div>
      <span class="iconbtn">${I.max(15)}</span>
    </div>
    <p class="tc-body">Liebe Kolleginnen und Kollegen, ab dem 1. September gilt in unserem Haus eine
      neue Pausenregelung. Die Mittagspause kann zwischen 11:30 und 14:00 Uhr genommen werden und
      dauert mindestens 30 Minuten. Wer länger als sechs Stunden am Stück arbeitet, muss die Pause
      verpflichtend nehmen. Bitte tragen Sie Ihre Pausenzeiten weiterhin im Zeiterfassungssystem ein …</p>
  </div>`;

const question = () => `
  <div class="qblock">
    <p class="q">Wann darf die Mittagspause frühestens beginnen?</p>
    <div class="opts">
      <span class="opt"><i></i>Um 11:00 Uhr</span>
      <span class="opt on"><i class="on"></i>Um 11:30 Uhr</span>
      <span class="opt"><i></i>Um 12:00 Uhr</span>
    </div>
  </div>`;

const strip = (active = 2, answered = [0, 1]) => `
  <div class="strip">${Array.from({ length: 9 }, (_, i) =>
    `<span class="num${i === active ? " now" : answered.includes(i) ? " done" : ""}">${i + 1}</span>`,
  ).join("")}</div>`;

/* ------------------------------- audit mocks ------------------------------- */

/** Today: a running Lesen Teil. Two controls say "Zurück", 300 px apart. */
const todayLesen = () => `
  <div class="screen">
    ${appHdr("danger")}
    <div class="stage">
      ${runBar({})}
      <div class="examrow">${textCard()}${question()}</div>
      ${strip()}
      <div class="footrow">
        <span class="btn out flex">Zurück</span>
        <span class="btn out flex">Weiter</span>
      </div>
    </div>
    <span class="flag" style="top:15px;right:150px">1</span>
    <span class="flag" style="bottom:58px;left:22px">2</span>
  </div>`;

/** Today: the Anleitung, 448 px wide inside a 1152 px stage. */
const todayIntro = () => `
  <div class="screen">
    ${appHdr("danger")}
    <div class="stage introstage">
      <div class="voidbox">
        <div class="introcard">
          <span class="tile lg lesen center">${mark("lesen", 24)}</span>
          <p class="eyebrow prim">Teil 1 von 4</p>
          <p class="display">Lesen</p>
          <div class="card pad">
            <p class="sm">Sie lesen drei Texte. Wählen Sie zu jeder Aufgabe die richtige Antwort.
              Über die Nummernleiste können Sie Aufgaben überspringen und später zurückkommen.</p>
            <div class="facts"><span>15 Minuten</span><span>3 Texte</span><span>9 Aufgaben</span></div>
          </div>
          <span class="btn grad wide">Teil 1 starten</span>
          <p class="cap">Der Timer läuft, sobald du startest.</p>
        </div>
      </div>
    </div>
    <span class="flag" style="top:96px;left:96px">3</span>
  </div>`;

/** Today: Module üben with no history. The page is locked to one viewport. */
const todayModule = () => `
  <div class="screen">
    ${appHdr("normal")}
    <div class="hubcol">
      <div class="hubhead">
        <div class="modeswitch"><span class="pill"></span>
          <button aria-pressed="true">Module üben</button><button>Modelltest</button></div>
        <div class="scoperow">
          <div class="modeswitch sm"><span class="pill"></span>
            <button aria-pressed="true">Ohne Zeit</button><button>Mit Zeit</button></div>
          <span class="scopebtn"><span>Niveau</span><b>B2</b>${I.chevD(15)}</span>
        </div>
      </div>
      <div class="grid2x2">${MODS.map(
        (m) => `<span class="modcard2">
          <span class="mc-top"><span class="tile lg ${m.id}">${mark(m.id, 21)}</span><span class="go">${I.arrowR(14)}</span></span>
          <span class="mc-name">${m.label}</span></span>`,
      ).join("")}</div>
      <div class="emptyhalf"><span>rest of the viewport, empty</span></div>
    </div>
    <span class="flag" style="bottom:130px;left:50%">4</span>
  </div>`;

/* ------------------------------ option mocks ------------------------------- */

/**
 * The running Lesen Teil under each option. `opt` changes only the frame: the
 * task itself is identical in all three, which is the point.
 */
const optLesen = (opt) => `
  <div class="screen">
    ${appHdr(opt === "b" ? "danger" : "")}
    <div class="stage">
      ${
        opt === "a"
          ? runBar({ back: true })
          : runBar({})
      }
      <div class="examrow">${textCard()}${question()}</div>
      <div class="striprow">
        ${opt === "c" ? `<span class="stepbtn">${I.chevL(16)}</span>` : ""}
        ${strip()}
        ${opt === "c" ? `<span class="stepbtn">${I.chevR(16)}</span>` : ""}
      </div>
      <div class="footrow">
        ${
          opt === "c"
            ? `<span class="backpill">${I.arrowL(15)}Zurück</span><span class="btn out grow">Weiter</span>`
            : `<span class="btn out flex ghosted">${I.chevL(15)}</span><span class="btn out flex">Weiter</span>`
        }
      </div>
    </div>
  </div>`;

/** The Schreibtrainer (Kurz) on a phone under each option. */
const optTrainer = (opt) => `
  <div class="screen">
    ${appHdr(opt === "b" ? "quiet" : "normal")}
    <div class="trainer">
      ${
        opt === "a"
          ? `<div class="runbar slim"><span class="inbar-back">${I.arrowL(15)}<b>Zurück</b></span><span class="vdiv"></span><p class="rb-title"><span class="tile xs schreiben">${mark("schreiben", 13)}</span>Schreiben</p></div>`
          : ""
      }
      <div class="modeswitch full four"><span class="pill p2"></span>
        <button>Fokus</button><button aria-pressed="true">Kurz</button><button>Lang</button><button>Verlauf</button></div>
      <div class="pickrow"><span class="btn accent">${I.target(14)} Aufgabe wählen ${I.chevD(14)}</span></div>
      <div class="card pad tight">
        <p class="taskeye">Aufgabe: Krankmeldung</p>
        <p class="sm">Schreiben Sie eine E-Mail an Ihre Teamleiterin. Melden Sie sich krank, nennen Sie
          die voraussichtliche Dauer und schlagen Sie eine Vertretung vor.</p>
      </div>
      <div class="card editor"><span class="ph">Schreibe hier deinen Text …</span></div>
      <div class="cluster">
        ${opt === "c" ? `<span class="backpill solid">${I.arrowL(15)}Zurück</span>` : ""}
        <span class="btn grad grow">Auswerten</span>
      </div>
      <p class="kinote">KI-geprüft, kann Fehler enthalten. <b>Mehr</b> · <b>Feedback geben</b></p>
    </div>
    ${navBar()}
  </div>`;

/* --------------------------- empty-space mocks ----------------------------- */

const emptyModule = (variant) => `
  <div class="screen">
    ${appHdr("normal")}
    <div class="hubcol${variant === "e1" ? " fit" : ""}">
      <div class="hubhead">
        <div class="modeswitch"><span class="pill"></span>
          <button aria-pressed="true">Module üben</button><button>Modelltest</button></div>
        <div class="scoperow">
          <div class="modeswitch sm"><span class="pill"></span>
            <button aria-pressed="true">Ohne Zeit</button><button>Mit Zeit</button></div>
          <span class="scopebtn"><span>Niveau</span><b>B2</b>${I.chevD(15)}</span>
        </div>
      </div>
      <div class="grid2x2">${MODS.map(
        (m) => `<span class="modcard2">
          <span class="mc-top"><span class="tile lg ${m.id}">${mark(m.id, 21)}</span><span class="go">${I.arrowR(14)}</span></span>
          <span class="mc-name">${m.label}</span></span>`,
      ).join("")}</div>
      ${
        variant === "e2"
          ? `<div class="card verlaufempty">
              <div class="ve-head"><p class="eyebrow mut">Verlauf</p><p class="vcount">noch keine Übung</p></div>
              <div class="ve-body">
                <div class="profile">${MODS.map(
                  (m) => `<div class="pcol"><span class="pval">–</span><span class="pbar"></span>
                    <span class="plab"><span class="tile xs ${m.id}">${mark(m.id, 12)}</span>${m.label}</span></div>`,
                ).join("")}</div>
                <div class="vsep"></div>
                <p class="ve-note"><b>Dein Stärkeprofil</b>Sobald du ein Modul geübt hast, steht hier,
                  wie du gestartet bist und was du seitdem dazugewonnen hast.</p>
              </div>
            </div>`
          : ""
      }
    </div>
  </div>`;

const emptyErgebnis = (variant) => `
  <div class="screen">
    ${appHdr("quiet")}
    <div class="stage fit">
      ${
        variant === "e2"
          ? `<div class="ergrow">
              <div class="ergleft">
                <p class="eyebrow prim">Ergebnis</p>
                <p class="bignum tnum">78 %</p>
                <span class="badge ok">Bestanden · Grenze 60 %</span>
                <div class="card pad barsbox">${MODS.map(
                  (m, i) => `<div class="barline"><span class="bl-top"><b>${m.label}</b><i class="tnum">${[82, 71, 80, 78][i]} %</i></span>
                    <span class="bl-track"><i class="bar-${m.id}" style="width:${[82, 71, 80, 78][i]}%"></i></span></div>`,
                ).join("")}</div>
              </div>
              <div class="ergright">
                <div class="card pad">
                  <p class="sm"><b>Schwächster Teil: Hören</b></p>
                  <p class="cap left">Gezielt wiederholen, gleicher Timer</p>
                  <span class="btn out sm">Üben</span>
                </div>
                <div class="card pad grow2">
                  <p class="sm"><b>Antworten ansehen</b></p>
                  <p class="cap left">9 Aufgaben Lesen · 6 Aufgaben Hören · dein Text mit Korrektur</p>
                </div>
                <span class="btn grad wide">Fertig</span>
              </div>
            </div>`
          : `<div class="voidbox">
              <div class="introcard">
                <p class="eyebrow prim">Ergebnis</p>
                <p class="bignum tnum">78 %</p>
                <span class="badge ok">Bestanden · Grenze 60 %</span>
                <div class="card pad barsbox">${MODS.map(
                  (m, i) => `<div class="barline"><span class="bl-top"><b>${m.label}</b><i class="tnum">${[82, 71, 80, 78][i]} %</i></span>
                    <span class="bl-track"><i class="bar-${m.id}" style="width:${[82, 71, 80, 78][i]}%"></i></span></div>`,
                ).join("")}</div>
                <div class="footrow"><span class="btn out flex">Antworten ansehen</span><span class="btn grad flex">Fertig</span></div>
              </div>
            </div>`
      }
    </div>
  </div>`;

/* ---------------------------------- CSS ------------------------------------ */

const CSS = String.raw`
  .frame.desk .screen { padding: 0; position: relative; }
  .frame.mob .screen { padding: 0; display: block; height: 668px; position: relative; }
  .screen .stage, .screen .hubcol, .screen .trainer { padding: 16px 22px 20px; }
  .frame.mob .screen .stage, .frame.mob .screen .trainer { padding: 12px 14px 0; }

  /* App header --------------------------------------------------- */
  .apphdr {
    height: 52px; display: flex; align-items: center; justify-content: space-between;
    padding: 0 18px; border-bottom: 1px solid hsl(var(--border)); background: hsl(var(--surface) / .9);
  }
  .frame.mob .apphdr { height: 46px; padding: 0 13px; }
  .logomark { width: 26px; height: 26px; border-radius: 8px; background: linear-gradient(135deg, hsl(var(--gradient-from)), hsl(var(--gradient-to))); }
  .hdrright { display: flex; align-items: center; gap: 8px; }
  .exit {
    display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 11px;
    border-radius: 8px; font-size: 13.5px; font-weight: 650;
  }
  .exit.danger { color: #dc2626; border: 1px solid rgb(220 38 38 / .3); }
  [data-appearance="dark"] .exit.danger { color: #fca5a5; border-color: rgb(252 165 165 / .3); }
  .exit.quiet { color: hsl(var(--muted-foreground)); border: 1px solid hsl(var(--border)); }
  .frame.mob .exit b { display: none; }
  .frame.mob .exit { padding: 0; width: 34px; justify-content: center; }
  .streak {
    display: inline-flex; align-items: center; gap: 5px; height: 30px; padding: 0 10px; border-radius: 999px;
    background: rgb(244 114 96 / .12); color: #e2593f; font-size: 13px; font-weight: 700;
  }
  .streak i { font-style: normal; font-weight: 500; color: hsl(var(--muted-foreground)); font-size: 11.5px; }
  .avatar { width: 30px; height: 30px; border-radius: 999px; background: hsl(var(--muted)); display: grid; place-items: center; color: hsl(var(--muted-foreground)); }

  /* Bottom tab bar ------------------------------------------------ */
  .navbar {
    position: absolute; left: 0; right: 0; bottom: 0; height: 58px; display: flex; align-items: center;
    justify-content: space-around; border-top: 1px solid hsl(var(--border)); background: hsl(var(--surface) / .95);
  }
  .navtab { display: flex; flex-direction: column; align-items: center; gap: 3px; }
  .navtab i { display: block; width: 22px; height: 22px; border-radius: 7px; background: hsl(var(--border)); }
  .navtab.on i { background: hsl(var(--primary) / .85); }
  .navtab em { font-style: normal; font-size: 10px; font-weight: 650; color: hsl(var(--foreground)); }

  /* Exam stage ---------------------------------------------------- */
  .stage { display: flex; flex-direction: column; gap: 12px; height: 452px; }
  .frame.mob .stage { height: 610px; gap: 10px; }
  .runbar {
    display: flex; align-items: center; gap: 10px; flex: none;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 8px; padding: 8px 12px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .runbar.slim { margin-bottom: 12px; }
  .rb-title { font-size: 14px; font-weight: 700; display: flex; align-items: center; gap: 8px; min-width: 0; }
  .rb-title span:not(.tile) { font-weight: 600; color: hsl(var(--muted-foreground)); }
  .rb-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
  .dots { display: flex; align-items: center; gap: 5px; }
  .dots i { width: 6px; height: 6px; border-radius: 999px; background: hsl(var(--muted)); }
  .dots i.done { background: hsl(var(--success)); }
  .dots i.now { width: 16px; background: hsl(var(--primary)); }
  .timer {
    display: inline-flex; align-items: center; gap: 6px; font-size: 13.5px; font-weight: 700;
    border: 1px solid hsl(var(--border)); border-radius: 6px; padding: 3px 9px; background: hsl(var(--surface));
  }
  .timer svg { color: hsl(var(--muted-foreground)); }
  .inbar-back {
    display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 650;
    color: hsl(var(--muted-foreground));
  }
  .inbar-back svg { color: hsl(var(--primary)); }
  .vdiv { width: 1px; align-self: stretch; background: hsl(var(--border)); }

  .examrow { display: flex; gap: 16px; flex: 1; min-height: 0; align-items: center; }
  .frame.mob .examrow { flex-direction: column; align-items: stretch; gap: 10px; }
  .textcard { flex: 0 0 54%; padding: 14px 16px; display: flex; flex-direction: column; gap: 8px; max-height: 100%; overflow: hidden; }
  .frame.mob .textcard { flex: 0 0 46%; }
  .tc-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .tc-kind { font-size: 11.5px; color: hsl(var(--muted-foreground)); }
  .tc-title { font-size: 14px; font-weight: 650; margin-top: 2px; }
  .tc-body { font-size: 13.5px; line-height: 1.55; -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 26px), transparent); mask-image: linear-gradient(to bottom, #000 calc(100% - 26px), transparent); }
  .iconbtn { flex: none; width: 32px; height: 32px; display: grid; place-items: center; border-radius: 8px; color: hsl(var(--muted-foreground)); }
  .qblock { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 9px; }
  .q { font-size: 15.5px; font-weight: 650; line-height: 1.4; }
  .opts { display: flex; flex-direction: column; gap: 7px; }
  .opt {
    display: flex; align-items: flex-start; gap: 10px; font-size: 13.5px; padding: 9px 13px; border-radius: 8px;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border));
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .opt.on { background: hsl(var(--accent) / .2); border-color: hsl(var(--accent) / .2); }
  .opt i { flex: none; width: 15px; height: 15px; border-radius: 999px; border: 2px solid hsl(var(--border)); margin-top: 2px; }
  .opt i.on { border-color: hsl(var(--accent-ink)); background: hsl(var(--accent-ink) / .9); }

  .strip { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px; flex: none; }
  .striprow { display: flex; align-items: center; justify-content: center; gap: 10px; flex: none; }
  .striprow .strip { flex: 0 1 auto; }
  .num {
    width: 30px; height: 30px; border-radius: 7px; display: grid; place-items: center;
    font-size: 12px; font-weight: 700; font-variant-numeric: tabular-nums;
    border: 1px solid hsl(var(--border)); background: hsl(var(--surface)); color: hsl(var(--muted-foreground));
  }
  .num.done { background: hsl(var(--accent) / .25); border-color: hsl(var(--accent) / .2); color: hsl(var(--foreground)); }
  .num.now { background: hsl(var(--primary)); border-color: hsl(var(--primary)); color: hsl(var(--primary-foreground)); }
  .stepbtn { width: 34px; height: 34px; border-radius: 8px; display: grid; place-items: center; border: 1px solid hsl(var(--border)); background: hsl(var(--surface)); color: hsl(var(--muted-foreground)); flex: none; }

  .footrow { display: flex; gap: 10px; flex: none; }
  .btn.out { background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); color: hsl(var(--foreground)); font-weight: 600; }
  .btn.accent { background: hsl(var(--accent) / .2); border: 1px solid hsl(var(--accent) / .2); color: hsl(var(--accent-ink)); font-weight: 650; height: 38px; font-size: 14px; gap: 6px; }
  .btn.flex { flex: 1; }
  .btn.grow, .btn.grow2 { flex: 1; }
  .btn.sm { height: 32px; padding: 0 14px; font-size: 13px; }
  .btn.ghosted { flex: 0 0 84px; color: hsl(var(--muted-foreground)); }
  .backpill {
    display: inline-flex; align-items: center; gap: 7px; height: 42px; padding: 0 15px; flex: none;
    border-radius: 10px; border: 1px solid hsl(var(--border)); background: hsl(var(--surface));
    font-size: 13px; font-weight: 500; color: hsl(var(--muted-foreground));
  }
  .backpill svg { color: hsl(var(--primary)); }
  .backpill.solid { box-shadow: 0 1px 2px hsl(var(--shadow) / .06); }

  /* Anleitung / Ergebnis ------------------------------------------ */
  .introstage { justify-content: center; }
  .voidbox {
    flex: 1; display: grid; place-items: center; min-height: 0;
    background-image: repeating-linear-gradient(135deg, hsl(var(--muted-foreground) / .07) 0 6px, transparent 6px 13px);
    border-radius: 12px;
  }
  .introcard { width: 448px; max-width: 100%; display: flex; flex-direction: column; gap: 12px; align-items: stretch; text-align: center; }
  .frame.mob .introcard { width: 100%; }
  .tile.center { margin: 0 auto; }
  .tile.xs { width: 22px; height: 22px; border-radius: 6px; }
  .eyebrow.prim { color: hsl(var(--primary)); }
  .display { font-size: 30px; font-weight: 800; letter-spacing: -.02em; margin-top: -6px; }
  .bignum { font-size: 44px; font-weight: 800; letter-spacing: -.02em; line-height: 1.05; }
  .card.pad { padding: 15px 17px; text-align: left; }
  .card.tight { padding: 12px 14px; }
  .sm { font-size: 13.5px; line-height: 1.55; }
  .cap { font-size: 12px; color: hsl(var(--muted-foreground)); text-align: center; }
  .cap.left { text-align: left; margin-top: 2px; }
  .facts { display: flex; gap: 16px; margin-top: 11px; padding-top: 11px; border-top: 1px solid hsl(var(--border)); font-size: 12px; color: hsl(var(--muted-foreground)); }
  .btn.wide { width: 100%; }
  .barsbox { display: flex; flex-direction: column; gap: 11px; }
  .barline { display: flex; flex-direction: column; gap: 5px; }
  .bl-top { display: flex; justify-content: space-between; font-size: 13px; }
  .bl-top i { font-style: normal; color: hsl(var(--muted-foreground)); }
  .bl-track { height: 7px; border-radius: 999px; background: hsl(var(--muted)); overflow: hidden; display: block; }
  .bl-track i { display: block; height: 100%; border-radius: 999px; }
  .ergrow { flex: 1; display: flex; gap: 20px; min-height: 0; align-items: stretch; }
  .ergleft { flex: 1; display: flex; flex-direction: column; gap: 9px; align-items: flex-start; }
  .ergleft .barsbox { width: 100%; margin-top: 4px; }
  .stage.fit { height: auto; }
  .stage.fit .voidbox { min-height: 372px; }
  .ergright { flex: 0 0 330px; display: flex; flex-direction: column; gap: 12px; }
  .ergright .grow2 { flex: none; }
  .ergright .btn.wide { margin-top: auto; }

  /* Hub ----------------------------------------------------------- */
  .hubcol { display: flex; flex-direction: column; gap: 20px; height: 600px; }
  .hubcol.fit { height: auto; padding-bottom: 26px; }
  .hubhead { display: flex; flex-direction: column; align-items: center; gap: 11px; }
  .scoperow { display: flex; align-items: center; gap: 9px; }
  .modeswitch.sm > button { font-size: 12.5px; padding: 4px 11px; font-weight: 650; }
  .modeswitch.sm { padding: 3px; }
  .modeswitch.sm > .pill { top: 3px; bottom: 3px; width: calc(50% - 3px); }
  .modeswitch.four > button { font-size: 14px; padding: 7px 8px; }
  .modeswitch.four > .pill { width: calc(25% - 4px); }
  .modeswitch.four > .pill.p2 { left: calc(25% + 1px); }
  .grid2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
  .modcard2 {
    display: flex; flex-direction: column; align-items: flex-start; min-height: 118px; padding: 17px 18px 26px;
    background: hsl(var(--surface)); border: 1px solid hsl(var(--border)); border-radius: 12px;
    box-shadow: 0 1px 2px hsl(var(--shadow) / .06), 0 6px 16px -3px hsl(var(--shadow) / .12);
  }
  .mc-top { display: flex; width: 100%; align-items: flex-start; justify-content: space-between; }
  .go { width: 26px; height: 26px; border-radius: 999px; display: grid; place-items: center; background: hsl(var(--muted)); color: hsl(var(--muted-foreground)); }
  .mc-name { margin-top: 12px; font-size: 19px; font-weight: 800; letter-spacing: -.015em; }
  .emptyhalf {
    flex: 1; min-height: 0; display: grid; place-items: center; border-radius: 12px;
    background-image: repeating-linear-gradient(135deg, hsl(var(--muted-foreground) / .07) 0 6px, transparent 6px 13px);
    font-size: 12.5px; color: hsl(var(--muted-foreground));
  }
  .verlaufempty { flex: 1; min-height: 172px; display: flex; flex-direction: column; overflow: hidden; }
  .ve-head { display: flex; align-items: baseline; justify-content: space-between; padding: 12px 16px 8px; }
  .ve-body { flex: 1; min-height: 0; display: flex; gap: 18px; padding: 4px 16px 16px; align-items: stretch; }
  .profile { flex: 0 0 300px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
  .pcol { display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .pval { font-size: 13px; font-weight: 650; color: hsl(var(--muted-foreground)); }
  .pbar { flex: 1; width: 100%; border-radius: 6px; background: hsl(var(--muted) / .55); min-height: 46px; }
  .plab { display: flex; align-items: center; gap: 5px; font-size: 11.5px; font-weight: 650; }
  .ve-note { flex: 1; font-size: 13px; line-height: 1.55; color: hsl(var(--muted-foreground)); align-self: center; }
  .ve-note b { display: block; color: hsl(var(--foreground)); font-size: 14px; margin-bottom: 3px; }
  .vcount { font-size: 12.5px; color: hsl(var(--muted-foreground)); }

  /* Trainer ------------------------------------------------------- */
  .trainer { display: flex; flex-direction: column; gap: 11px; height: 546px; }
  .pickrow { display: flex; justify-content: center; }
  .taskeye { font-size: 12.5px; font-weight: 700; color: hsl(var(--primary)); margin-bottom: 4px; }
  .editor { flex: 1; min-height: 0; padding: 14px; }
  .editor .ph { font-size: 14px; color: hsl(var(--muted-foreground)); }
  .cluster { display: flex; gap: 8px; align-items: stretch; }
  .cluster .btn { height: 42px; border-radius: 10px; }
  .kinote { font-size: 11px; text-align: center; color: hsl(var(--muted-foreground)); }
  .kinote b { font-weight: 600; color: hsl(var(--primary)); }

  /* Flags + notes -------------------------------------------------- */
  .flag {
    position: absolute; width: 22px; height: 22px; border-radius: 999px; display: grid; place-items: center;
    background: #dc2626; color: #fff; font-size: 12px; font-weight: 800; box-shadow: 0 0 0 4px rgb(220 38 38 / .18);
  }
  .flaglist { margin-top: 10px; display: flex; flex-direction: column; gap: 6px; }
  .flagitem { display: flex; gap: 8px; align-items: flex-start; font-size: 13.5px; color: var(--c-muted); }
  .flagitem b { flex: none; width: 19px; height: 19px; border-radius: 999px; background: #dc2626; color: #fff; font-size: 11px; display: grid; place-items: center; }
  .flagitem span b { all: unset; color: var(--c-ink); font-weight: 650; }
  .spine { display: grid; gap: 12px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); margin-top: 14px; }
  .spineitem { display: flex; gap: 10px; align-items: flex-start; }
  .spineitem .num { all: unset; flex: none; width: 22px; height: 22px; border-radius: 7px; background: var(--c-chip); color: var(--c-accent); font-size: 12px; font-weight: 700; display: grid; place-items: center; }
  .spineitem b { display: block; font-size: 14px; }
  .spineitem p { font-size: 13.5px; color: var(--c-muted); }
  .pickbox { margin-top: 16px; border: 1px solid var(--c-line); border-radius: 10px; padding: 14px 16px; background: var(--c-chip); }
  .pickbox p + p { margin-top: 7px; }
`;

/* --------------------------------- copy ------------------------------------ */

const FINDINGS = [
  [
    "Four different back buttons",
    "The zone has four visual treatments for “leave this screen”, in three different positions: a red <em>Verlassen</em> in the app header, a grey <em>Zurück</em> in the same slot, a white pill at the bottom-left of the writing trainers, and the same pill at the top-right of the speaking list.",
  ],
  [
    "Two of them say the same word on one screen",
    "In a running Lesen or Hören part, the header exit says <em>Zurück</em> (untimed) and the footer button that steps to the previous question also says <em>Zurück</em>. One leaves the module, one moves back one question.",
  ],
  [
    "Two screens have no way out at all",
    "The writing trainers hide their <em>Zurück</em> below <code>lg</code>, so on a desktop there is no back button in Schreiben. A running practice conversation has none at any width.",
  ],
  [
    "Four page widths in one zone",
    "896 px on the hub, 1152 px in the writing trainer, 1152 px on the speaking list, 672 px in a conversation, and 448 px on the exam’s Anleitung and Ergebnis, which sit inside a 1152 px stage.",
  ],
  [
    "Three header languages",
    "The hub is a sliding-pill switcher with a centred scope row. The speaking list is a left-aligned row of level pills with uppercase section headings. The exam Anleitung is the only centred <code>h1</code> in the zone.",
  ],
  [
    "The page is locked to one screen even when it has nothing to fill it",
    "Both hub tabs hold a full-viewport frame. A learner with no history sees four cards and then roughly half a screen of nothing, every time.",
  ],
];

const EXITS = [
  ["Prüfung hub", "none (this is the zone’s home)", "–", "–"],
  ["Modelltest running, Mit Zeit", "Verlassen + exit icon", "app header, top right", "red outline"],
  ["Module drill, Ohne Zeit", "Zurück + arrow", "app header, top right", "grey outline"],
  ["…inside Lesen / Hören", "Zurück (means: previous question)", "stage footer, bottom left", "outline button, half width"],
  ["Schreibtrainer (phone)", "Zurück + arrow", "floating cluster, bottom left", "white pill"],
  ["Schreibtrainer (desktop)", "none", "–", "–"],
  ["Sprechtrainer list", "Zurück + arrow", "scope row, top right", "white pill"],
  ["Sprechtrainer, in conversation", "none", "–", "–"],
];

const WIDTHS = [
  ["Prüfung hub (both tabs)", "896 px", "centred, locked"],
  ["Schreibtrainer", "1152 px", "content column + 256 px task rail"],
  ["Sprechtrainer list", "1152 px", "3-column card grid"],
  ["Sprechtrainer, in conversation", "672 px", "centred"],
  ["Exam: Lesen / Hören / Schreiben", "1152 px", "two tiles side by side"],
  ["Exam: Anleitung and Ergebnis", "448 px", "inside the same 1152 px stage"],
];

const page = `
<div class="page"><div class="wrap">
  <p class="kicker">Prüfung zone · design review</p>
  <h1>One frame for the whole exam zone</h1>
  <p class="lede" style="margin-top:10px">You said the pages in the Prüfung zone don’t feel like one product: back
    buttons in different places and styles, and awkward empty space. Below is what the eight screens of the zone
    actually do today, then three ways to give them one frame, and two ways to answer the empty space. Pick one
    letter and one number and I’ll build exactly that.</p>

  <div class="controls">
    <div class="ctl"><span>Appearance</span>
      <div class="seg" id="seg-appearance">
        <button data-k="appearance" data-v="light" aria-pressed="true">Light</button>
        <button data-k="appearance" data-v="dark">Dark</button>
      </div>
    </div>
  </div>

  <!-- ================================ AUDIT ============================== -->
  <h2>1 · What the zone does today</h2>
  <div class="panel" style="margin-top:14px">
    <div class="findings">
      ${FINDINGS.map(
        ([t, d], i) =>
          `<div class="finding"><span class="num">${i + 1}</span><div><b>${t}</b><p>${d}</p></div></div>`,
      ).join("")}
    </div>
  </div>

  <div class="panel">
    <h3>Every “way out” in the zone</h3>
    <div class="tablewrap" style="margin-top:10px"><table>
      <tr><th>Screen</th><th>Control</th><th>Where</th><th>Look</th></tr>
      ${EXITS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
    </table></div>
  </div>

  <div class="panel">
    <h3>Every page width in the zone</h3>
    <div class="tablewrap" style="margin-top:10px"><table>
      <tr><th>Screen</th><th>Content width</th><th>Shape</th></tr>
      ${WIDTHS.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}
    </table></div>
    <p class="note" style="margin-top:12px">A learner going hub → Schreibtrainer → back → Modelltest → Anleitung →
      Lesen → Ergebnis passes through five different column widths in about ninety seconds.</p>
  </div>

  <div class="option" id="today">
    <div class="opthead"><span class="optname" style="background:#dc2626">Today</span><h2>The three screens that show it</h2></div>
    <div class="framerow">
      <div class="framebox desk">
        <p class="framelabel">A running Lesen part · desktop 1280</p>
        <div class="frame desk">${todayLesen()}</div>
        <div class="flaglist">
          <div class="flagitem"><b>1</b><span><b>Leaves the exam.</b> Red, top right, in the app’s own header, with a confirm dialog.</span></div>
          <div class="flagitem"><b>2</b><span><b>Goes back one question.</b> Same word, bottom left, quiet outline. In Ohne Zeit the header control above says “Zurück” too.</span></div>
        </div>
      </div>
      <div class="framebox desk">
        <p class="framelabel">The Anleitung before a part · desktop 1280</p>
        <div class="frame desk">${todayIntro()}</div>
        <div class="flaglist">
          <div class="flagitem"><b>3</b><span><b>448 px of content in a 1152 px frame.</b> The sidebar and the tab bar are hidden during an exam, so this is the widest, emptiest screen in the app. The Ergebnis screen has the same shape.</span></div>
        </div>
      </div>
      <div class="framebox desk">
        <p class="framelabel">Module üben, learner with no history · desktop 1280</p>
        <div class="frame desk">${todayModule()}</div>
        <div class="flaglist">
          <div class="flagitem"><b>4</b><span><b>The frame is locked to one screen</b> so the page never scrolls, but nothing fills the lower half until the learner has a Verlauf. Modelltest does the same below its run band.</span></div>
        </div>
      </div>
    </div>
  </div>

  <hr class="rule">

  <!-- =============================== SPINE =============================== -->
  <h2 style="margin-top:34px">2 · What all three options share</h2>
  <p class="lede" style="margin-top:8px">These five rules are the actual fix. The options after them only differ in
    <em>where the one back button lives</em>.</p>
  <div class="panel" style="margin-top:14px">
    <div class="spine">
      <div class="spineitem"><span class="num">1</span><div><b>One column width</b><p>896 px for everything at rest: hub, speaking list, Anleitung, Ergebnis. The wide 1152 px stage stays, but only for a running part with two tiles side by side, so a width change means “you are inside a task now”.</p></div></div>
      <div class="spineitem"><span class="num">2</span><div><b>One exit, one word, one place</b><p>“Zurück” everywhere, in the same slot on every screen of the zone, at every width. The only exception is a timed run in progress, which keeps the red “Prüfung verlassen”, because that one really does end something.</p></div></div>
      <div class="spineitem"><span class="num">3</span><div><b>The question stepper stops saying “Zurück”</b><p>It becomes a chevron beside “Weiter”, so exactly one control per screen carries that word.</p></div></div>
      <div class="spineitem"><span class="num">4</span><div><b>One scope control</b><p>The hub’s compact “Niveau B2 ▾” is the zone’s level control. The speaking list’s separate row of level pills goes; it sets the same fact with a different control.</p></div></div>
      <div class="spineitem"><span class="num">5</span><div><b>Every screen wears its module’s mark</b><p>The four coloured marks already run through the hub cards, the timeline and the Verlauf. The trainers and the speaking list use their own generic icons today; they adopt the module mark, so Sprechen is one colour everywhere.</p></div></div>
    </div>
  </div>

  <hr class="rule">

  <!-- ============================== OPTIONS ============================== -->
  <h2 style="margin-top:34px">3 · Where the one back button lives</h2>

  <div class="option" id="opt-a">
    <div class="opthead"><span class="optname">Option A</span><h2>Modulkopf · a header row inside the page</h2></div>
    <p class="lede">Every screen below the hub opens with one row: back, the module’s mark and name, and the
      clock. The exam already has this row (the RunBar); it grows a back button and the trainers and the speaking
      list get the same row. The app header goes back to normal (streak + account) everywhere.</p>
    <div class="framerow">
      <div class="framebox desk">
        <p class="framelabel">Lesen, running · desktop 1280</p>
        <div class="frame desk">${optLesen("a")}</div>
      </div>
      <div class="framebox phone">
        <p class="framelabel">Schreibtrainer · phone 393</p>
        <div class="frame mob">${optTrainer("a")}</div>
      </div>
      <div class="notecol">
        <p class="note"><b>The way out sits next to the thing it leaves</b>, and it is the same component on all
          eight screens, so it cannot drift again.</p>
        <p class="note"><b>The trainers finally get a back button on desktop</b>, which they have never had.</p>
        <p class="note"><b>The row also says where you are.</b> The trainers and the speaking list never name the
          module they belong to today; here they carry its mark and its name like the exam parts do.</p>
        <p class="cost"><b>Cost:</b> the trainers and the speaking list grow ~44 px of chrome they don’t have
          today; on a phone the trainer’s Zurück leaves the thumb row you put it in in s192 and moves to the top
          of the page; and the red “leave a timed exam” moves out of the app header into the page, where it has to
          stay quiet enough not to compete with the task.</p>
      </div>
    </div>
  </div>

  <div class="option" id="opt-b">
    <div class="opthead"><span class="optname">Option B</span><h2>Ecke oben rechts · the app header owns it</h2></div>
    <p class="lede">The exam’s existing top-right slot becomes the zone’s exit slot, and every screen in the zone
      registers it: the trainers, the speaking list and a running conversation too. Grey “Zurück” always; red
      “Verlassen” only while a timed run is live. The bottom-left pill on the trainers goes away, and “Auswerten”
      takes the full thumb row.</p>
    <div class="framerow">
      <div class="framebox desk">
        <p class="framelabel">Lesen, running · desktop 1280</p>
        <div class="frame desk">${optLesen("b")}</div>
      </div>
      <div class="framebox phone">
        <p class="framelabel">Schreibtrainer · phone 393</p>
        <div class="frame mob">${optTrainer("b")}</div>
      </div>
      <div class="notecol">
        <p class="note"><b>No new chrome anywhere.</b> Zero height added to any screen, and the mechanism already
          exists: the exam registers its exit with the shell, so the trainers just do the same.</p>
        <p class="note"><b>One slot, one look, at every width.</b> This is what a native app does with a back button.</p>
        <p class="note"><b>The primary action gets the whole thumb row</b> in the trainers.</p>
        <p class="cost"><b>Cost:</b> this undoes part of s192. You moved the trainer’s Zurück into the thumb row on
          purpose; here it goes back to the top-right corner of a phone, which is the hardest corner to reach.</p>
      </div>
    </div>
  </div>

  <div class="option" id="opt-c">
    <div class="opthead"><span class="optname">Option C</span><h2>Unten links · the thumb row, everywhere</h2></div>
    <p class="lede">The trainers’ answer becomes the zone’s law: “Zurück” at the bottom-left of the bottom chrome,
      on every screen, at every width, desktop included. To make room in the exam, the two question steppers move
      up to flank the number strip, which is where jumping between questions already happens. The footer is then a
      quiet back and one primary button instead of two equal outlines.</p>
    <div class="framerow">
      <div class="framebox desk">
        <p class="framelabel">Lesen, running · desktop 1280</p>
        <div class="frame desk">${optLesen("c")}</div>
      </div>
      <div class="framebox phone">
        <p class="framelabel">Schreibtrainer · phone 393</p>
        <div class="frame mob">${optTrainer("c")}</div>
      </div>
      <div class="notecol">
        <p class="note"><b>It extends what you already picked</b> in s192 rather than replacing it, and it puts the
          exit in thumb reach on every screen of the zone.</p>
        <p class="note"><b>The exam footer gets simpler</b>: back plus one primary, instead of two equal-weight
          outline buttons where one of them was the thing that ends the part.</p>
        <p class="note"><b>All navigation for the part sits in one band</b>: jump, step, leave.</p>
        <p class="cost"><b>Cost:</b> on a 1280 × 900 desktop the way out sits at the bottom of the screen, far from
          where the eye starts. And quitting a timed exam would live there too, in red, at the bottom-left.</p>
      </div>
    </div>
  </div>

  <hr class="rule">

  <!-- ============================ EMPTY SPACE ============================ -->
  <h2 style="margin-top:34px">4 · The empty space</h2>
  <p class="lede" style="margin-top:8px">Independent of A/B/C. Both options keep the rule that a freshly opened page
    never scrolls.</p>

  <div class="option" id="opt-e1">
    <div class="opthead"><span class="optname">Option 1</span><h2>Natürliche Höhe · the page stops where the content stops</h2></div>
    <p class="lede">The full-viewport lock is dropped on any screen that has nothing to fill it. The air below the
      cards becomes ordinary page background instead of a stretched frame, and the Anleitung and the Ergebnis widen
      from 448 px to the zone’s 896 px column so they stop looking like a strip in a void.</p>
    <div class="framerow">
      <div class="framebox desk">
        <p class="framelabel">Module üben, no history · desktop 1280</p>
        <div class="frame desk">${emptyModule("e1")}</div>
      </div>
      <div class="framebox desk">
        <p class="framelabel">Ergebnis · desktop 1280</p>
        <div class="frame desk">${emptyErgebnis("e1")}</div>
      </div>
      <div class="notecol">
        <p class="note"><b>Cheapest to build</b> and impossible to get wrong: nothing new is invented, a height cap
          is simply removed where it has nothing to hold.</p>
        <p class="cost"><b>Cost:</b> the emptiness is still there, it is just honest about it. On a tall desktop the
          content sits in the top half and the rest is page.</p>
      </div>
    </div>
  </div>

  <div class="option" id="opt-e2">
    <div class="opthead"><span class="optname">Option 2</span><h2>Der leere Zustand ist Inhalt · the space gets used</h2></div>
    <p class="lede">The Verlauf card appears from the first visit, in an empty state that shows the shape of what is
      coming (the four columns, greyed, with one line saying what will fill them). The Ergebnis becomes a real
      two-column screen on desktop: the score and the four bars on the left, the weakest part and the answer review
      on the right.</p>
    <div class="framerow">
      <div class="framebox desk">
        <p class="framelabel">Module üben, no history · desktop 1280</p>
        <div class="frame desk">${emptyModule("e2")}</div>
      </div>
      <div class="framebox desk">
        <p class="framelabel">Ergebnis · desktop 1280</p>
        <div class="frame desk">${emptyErgebnis("e2")}</div>
      </div>
      <div class="notecol">
        <p class="note"><b>The page is full on day one</b>, and the empty Verlauf doubles as a promise: it shows a
          new learner what practising will earn them.</p>
        <p class="note"><b>The Ergebnis stops wasting the widest stage in the app</b> and puts “what to do next”
          beside the score instead of below the fold.</p>
        <p class="cost"><b>Cost:</b> more to build, and an empty-state card is chrome a returning learner never
          sees again. It has to stay quiet enough not to read as a broken chart.</p>
      </div>
    </div>
  </div>

  <hr class="rule">

  <div class="panel" style="margin-top:26px">
    <h3>What I need from you</h3>
    <div class="pickbox">
      <p><b>One letter</b> for the back button: A (row in the page), B (app header corner), C (thumb row).</p>
      <p><b>One number</b> for the empty space: 1 (page stops where content stops) or 2 (the space gets used).</p>
      <p>The five shared rules in section 2 ship either way, unless you want to strike one of them.</p>
    </div>
  </div>
</div></div>`;

const SCRIPT = String.raw`
  const host = document.querySelector("[data-appearance]") || document.body;
  /**
   * The in-page Light/Dark control is what the mocked APP screens answer to, so
   * it stays authoritative. It just starts on whatever theme the reader is
   * already viewing in (their OS, or the artifact viewer's own toggle, which
   * stamps data-theme on <html>), and follows that toggle until they pick.
   */
  let picked = false;
  const readerTheme = () => {
    const stamped = document.documentElement.dataset.theme;
    if (stamped === "dark" || stamped === "light") return stamped;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };
  const syncFromReader = () => {
    if (picked) return;
    const t = readerTheme();
    host.dataset.appearance = t;
    const seg = document.getElementById("seg-appearance");
    if (seg) seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === t)));
  };
  syncFromReader();
  if (window.matchMedia) {
    try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", syncFromReader); } catch (e) {}
  }
  new MutationObserver(syncFromReader).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  document.querySelectorAll(".seg").forEach((seg) => {
    seg.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      seg.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      host.dataset[btn.dataset.k] = btn.dataset.v;
      picked = true;
    });
  });
  const q = new URLSearchParams(location.search);
  const app = q.get("appearance");
  if (app) { host.dataset.appearance = app; picked = true; }
  const only = q.get("only");
  const target = only && document.getElementById(only);
  if (target) {
    let node = target;
    while (node && node.parentElement && !node.parentElement.classList.contains("wrap")) {
      Array.from(node.parentElement.children).forEach((el) => { if (el !== node) el.style.display = "none"; });
      node = node.parentElement;
    }
    Array.from(target.parentElement.children).forEach((el) => { if (el !== target) el.style.display = "none"; });
  }
`;

const ATTRS = 'data-appearance="light" data-colors="c2" data-marks="g2"';

writeFileSync(
  OUT,
  `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prüfung zone: one frame</title>
<style>${REVIEW_CSS}${CSS}</style>
</head>
<body ${ATTRS}>
${page}
<script>${SCRIPT}</script>
</body>
</html>`,
);

writeFileSync(
  ART,
  `<title>Prüfung zone: one frame</title>
<style>${REVIEW_CSS}${CSS}</style>
<div ${ATTRS}>
${page}
</div>
<script>${SCRIPT}</script>`,
);

console.log("wrote", OUT, "and", ART);
