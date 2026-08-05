/**
 * Shared furniture for the Prüfung hub previews: the app-token CSS, the module
 * marks and the sample data. Round 1 (`gen-pruefung-hub-redesign.mjs`) keeps
 * its own copy; every later round imports this one.
 */

export const REVIEW_CSS = String.raw`
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
  /* One segment per gap, drawn from the edge of one tile to the edge of the
     next, so the line never runs behind a mark. */
  .tnode { position: relative; flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px; }
  .tnode::after {
    content: ""; position: absolute; top: 21px; height: 2px; background: hsl(var(--border));
    left: calc(50% + 30px); right: calc(-50% + 30px);
  }
  .tnode:last-child::after { content: none; }
  .frame.mob .tnode::after { top: 19px; left: calc(50% + 28px); right: calc(-50% + 28px); }
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
`;

export const svg = (paths, size = 20, extra = "") =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${paths}</svg>`;

export const ICON = {
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
  chevL: (s) => svg(`<path d="m15 18-6-6 6-6"/>`, s),
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
export const mark = (id, size) =>
  `<span class="g g1">${ICON[id](size)}</span><span class="g g2">${ICON[id + "2"](size)}</span>`;


export const MODULES = [
  { id: "lesen", label: "Lesen", desc: "3 Texte mit Aufgaben", min: 15 },
  { id: "hoeren", label: "Hören", desc: "2 Ansagen · Notizen", min: 10 },
  { id: "schreiben", label: "Schreiben", desc: "1 Aufgabe · voller Brief", min: 20, trainer: "Schreibtrainer" },
  { id: "sprechen", label: "Sprechen", desc: "1 Gespräch mit Partner", min: 7, trainer: "Sprechtrainer" },
];

export const RUNS = [
  { date: "12. Juli", total: 78, parts: { lesen: 82, hoeren: 71, schreiben: 80, sprechen: 78 } },
  { date: "3. Juli", total: 64, parts: { lesen: 70, hoeren: 55, schreiben: 66, sprechen: 64 } },
  { date: "28. Juni", total: 55, parts: { lesen: 61, hoeren: 44, schreiben: 58, sprechen: 56 } },
];

export const LEVELS = ["A2", "B1", "B2", "C1"];

