/**
 * Generates `preview/filterrail-height.html`.
 *
 * s189 follow-up. The founder's expand rule ("the borders of the tile always
 * visible ... internal and page scroll enabled") was stated for Verlauf and
 * meant for every tile that grows, filters included. This page tests it on the
 * REAL Bibliothek filter rail: the four frames are screenshots of the built app
 * driven over CDP at 393x852, not mockups, each with a different height cap and
 * the measured geometry printed beside it.
 *
 * Run: node preview/gen-filterrail-height.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SHOTS = process.env.SHOT_DIR ?? HERE;
const OUT = join(HERE, "filterrail-height.html");

const img = (name) =>
  "data:image/png;base64," + readFileSync(join(SHOTS, name)).toString("base64");

const OPTIONS = [
  {
    key: "A",
    shot: "rail-a.png",
    title: "45dvh, what ships today",
    geo: "panel 383 px · top 205 · bottom 588 · list 329 of 658 px visible",
    body: "The cap the founder set in an earlier round, trimmed down from 55dvh so an open panel left more of the word list showing. Half the filter body is behind an internal scroll: Branche, Lebensbereich, Thema and the first pill row fit, everything from Häufigkeit down does not.",
    verdict: "ok",
    verdictText: "Borders visible, list visible, but most of the filter is not.",
  },
  {
    key: "B",
    shot: "rail-b.png",
    title: "58dvh, as tall as a percentage can safely go",
    geo: "panel 494 px · top 205 · bottom 699 · list 440 of 658 px visible",
    body: "One more section reaches the screen and the tile still clears the sticky “Üben mit 1733 Wörtern” bar underneath it. A one-line change, nothing structural. The catch is that a percentage does not know where the tile starts: on a 360x640 phone the same 58% lands back underneath that bar.",
    verdict: "ok",
    verdictText: "Works on a tall phone, not guaranteed on a short one.",
  },
  {
    key: "C",
    shot: "rail-c.png",
    title: "The full one-screen cap, exactly as Verlauf uses it",
    geo: "panel 692 px · top 205 · bottom 897 in an 852 px viewport",
    body: "This is the literal rule applied: the same <code>max-h-panel-stage</code> ceiling that works on Verlauf. It breaks here, and the screenshot shows why: “LERNSTAND” is cut off mid-word and the tile's bottom border is 45 px below the bottom of the screen, behind the Üben bar and the tab bar.",
    verdict: "bad",
    verdictText: "The bottom border is off screen. This is the thing the rule exists to prevent.",
  },
  {
    key: "D",
    shot: "rail-d.png",
    title: "The full cap plus scrolling the tile into view",
    geo: "panel 692 px · top 160 · bottom 852 · page scrolled as far as it can",
    body: "Adding the second half of the rule, scrolling the tile into view, moves it up by 45 px and then the page runs out of scroll. The bottom border still sits underneath the Üben bar. Verlauf gets away with the constant because it can reach the top of the stage; this tile starts 205 px down and has a fixed action bar beneath it, so it cannot.",
    verdict: "bad",
    verdictText: "Still hidden. The constant is wrong for a tile that does not start at the top.",
  },
];

const html = `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Filter rail: how tall should it open?</title>
<style>
  :root {
    --c-ground: #eceef1; --c-panel: #ffffff; --c-ink: #191d24;
    --c-muted: #5c6672; --c-line: #d3d8de; --c-accent: #1f6f68; --c-chip: #e2e6ea;
    --c-bad: #b4231f; --c-ok: #1f6f68;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --c-ground: #0e1013; --c-panel: #16191d; --c-ink: #e6e9ec;
      --c-muted: #98a1ab; --c-line: #292e35; --c-accent: #58bdb2; --c-chip: #212630;
      --c-bad: #f28b82; --c-ok: #58bdb2;
    }
  }
  :root[data-theme="dark"] {
    --c-ground: #0e1013; --c-panel: #16191d; --c-ink: #e6e9ec;
    --c-muted: #98a1ab; --c-line: #292e35; --c-accent: #58bdb2; --c-chip: #212630;
    --c-bad: #f28b82; --c-ok: #58bdb2;
  }
  :root[data-theme="light"] {
    --c-ground: #eceef1; --c-panel: #ffffff; --c-ink: #191d24;
    --c-muted: #5c6672; --c-line: #d3d8de; --c-accent: #1f6f68; --c-chip: #e2e6ea;
    --c-bad: #b4231f; --c-ok: #1f6f68;
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
  h2 { font-size: 21px; font-weight: 700; }
  h3 { font-size: 16px; font-weight: 700; }
  p { margin: 0; }
  code { font-size: .92em; background: var(--c-chip); padding: 1px 5px; border-radius: 4px; }
  .lede { color: var(--c-muted); max-width: 74ch; }
  .kicker { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .14em; color: var(--c-accent); }
  .panel { background: var(--c-panel); border: 1px solid var(--c-line); border-radius: 12px; padding: 20px 22px; margin-top: 22px; }
  .note { font-size: 13.5px; color: var(--c-muted); }
  .note + .note { margin-top: 10px; }
  .note b { color: var(--c-ink); font-weight: 650; }
  .row { display: flex; flex-wrap: wrap; gap: 26px; margin-top: 24px; align-items: flex-start; }
  .card { flex: 1 1 270px; min-width: 250px; max-width: 320px; }
  .shot { border: 1px solid var(--c-line); border-radius: 14px; overflow: hidden; display: block; width: 100%; }
  .shot img { display: block; width: 100%; height: auto; }
  .tag {
    display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: .12em;
    text-transform: uppercase; color: var(--c-panel); background: var(--c-accent);
    padding: 3px 9px; border-radius: 6px; margin-bottom: 8px;
  }
  .geo { font-size: 12px; color: var(--c-muted); font-variant-numeric: tabular-nums; margin-top: 8px; }
  .verdict { margin-top: 10px; font-size: 13px; font-weight: 650; padding-left: 11px; border-left: 3px solid var(--c-line); }
  .verdict.bad { color: var(--c-bad); border-color: var(--c-bad); }
  .verdict.ok { color: var(--c-ok); border-color: var(--c-ok); }
  .cardbody { font-size: 13.5px; color: var(--c-muted); margin-top: 10px; }
  .tablewrap { overflow-x: auto; margin-top: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--c-line); vertical-align: top; }
  th { font-size: 11px; text-transform: uppercase; letter-spacing: .1em; color: var(--c-muted); font-weight: 700; }
  td:first-child { font-weight: 600; white-space: nowrap; }
  tr:last-child td { border-bottom: 0; }
</style>

<div class="page">
  <div class="wrap">
    <p class="kicker">Genauly · design review</p>
    <h1>Filter rail: how tall should it open?</h1>
    <p class="lede" style="margin-top:8px">
      You asked for the expand rule to apply everywhere, filters included. Every frame below is a
      screenshot of the <b>real built app</b> on a 393x852 phone, driven automatically: the
      Bibliothek filter panel opened with a different height cap each time, with its measured
      geometry printed underneath. Nothing here is a mockup.
    </p>

    <div class="panel">
      <h2>What the test found</h2>
      <p class="note" style="margin-top:8px">
        The one-screen ceiling that works on Verlauf <b>does not transfer to this rail</b>, and the
        reason is worth knowing: Verlauf can scroll up to the top of the screen, so a
        "one screen tall" cap fits. The filter panel starts <b>205 px down</b> (under the tab
        switcher and the view toolbar) and has a fixed "Üben mit 1733 Wörtern" bar underneath it, so
        the same cap pushes its bottom border 45 px below the screen. Options C and D show that
        happening.
      </p>
      <p class="note">
        Put plainly: the rule is right, but the ceiling has to be measured from where the tile
        actually sits, not assumed to be a whole screen.
      </p>
    </div>

    <div class="row">
      ${OPTIONS.map(
        (o) => `
        <div class="card">
          <span class="tag">Option ${o.key}</span>
          <h3>${o.title}</h3>
          <span class="shot"><img alt="Filter rail, option ${o.key}" src="${img(o.shot)}"></span>
          <p class="geo">${o.geo}</p>
          <p class="verdict ${o.verdict}">${o.verdictText}</p>
          <p class="cardbody">${o.body}</p>
        </div>`,
      ).join("")}
    </div>

    <div class="panel">
      <h2>Option E: measure it, no screenshot possible yet</h2>
      <p class="note" style="margin-top:8px">
        The version that actually satisfies what you asked for is not a fixed number at all. The tile
        measures where its own top edge sits and takes exactly the room left above the Üben bar, so
        it is as tall as it can be on every phone and its bottom border is always visible. On this
        393x852 phone that lands at about 494 px, the same as option B; on a 360x640 phone it would
        come out around 300 px, where option B would have run off the screen.
      </p>
      <p class="note">
        It needs a small measuring hook, the same idea the writing editor already uses to size itself
        to the room left. That is roughly half a day including the desktop rail, which shares this
        component, plus a check on every surface the rail appears on: Wörter, Kollokationen,
        Redemittel, Schreiben.
      </p>
    </div>

    <div class="panel">
      <h2>Side by side</h2>
      <div class="tablewrap">
        <table>
          <tr><th>&nbsp;</th><th>A · 45dvh</th><th>B · 58dvh</th><th>C / D · one screen</th><th>E · measured</th></tr>
          <tr><td>Filter visible</td><td>329 of 658 px</td><td>440 of 658 px</td><td>638 of 658 px</td><td>as much as fits</td></tr>
          <tr><td>Bottom border visible</td><td>Yes</td><td>Yes on a tall phone</td><td>No</td><td>Always</td></tr>
          <tr><td>Word list still visible</td><td>~2 cards</td><td>~1 card</td><td>None</td><td>~1 card</td></tr>
          <tr><td>Short phone (360x640)</td><td>Fine</td><td>Overlaps the Üben bar</td><td>Overlaps badly</td><td>Fine</td></tr>
          <tr><td>Work</td><td>None, ships today</td><td>One line</td><td>One line</td><td>A measuring hook, ~half a day</td></tr>
        </table>
      </div>
      <p class="note" style="margin-top:14px">
        <b>One thing to weigh that is not about geometry:</b> the taller the panel opens, the less of
        the word list stays on screen behind it, and the whole reason the cap was cut to 45% in an
        earlier round was to keep some of that list in view while filtering. Options B and E both
        trade a little of that back.
      </p>
    </div>
  </div>
</div>
`;

writeFileSync(OUT, html);
console.log(`wrote ${OUT}`);
