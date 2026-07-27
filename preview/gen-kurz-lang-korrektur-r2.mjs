/**
 * Round-2 sheet for "Korrektur direkt nach dem Auswerten" (founder pick A,
 * s172): does the Kurz/Lang correction card read as the same object as the Fokus
 * one? Run: pnpm build && node preview/gen-kurz-lang-korrektur-r2.mjs
 *
 * Unlike the other generators in here, this one does NOT re-draw the components
 * by hand. It server-renders the REAL ones (`src/features/writing/correction.tsx`,
 * plus the Card/Button primitives) through Vite and inlines the app's own built
 * stylesheet, so the sheet cannot drift from what ships: if the tiles differ
 * between the two cards here, they differ in the app.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const h = React.createElement;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** The app's own compiled CSS, so every token/utility is the shipped one. */
async function appCss() {
  const dir = path.join(root, "dist/assets");
  let files;
  try {
    files = await fs.readdir(dir);
  } catch {
    throw new Error("dist/assets not found. Run `pnpm build` first.");
  }
  const css = files.filter((f) => f.startsWith("index-") && f.endsWith(".css"));
  if (!css.length) throw new Error("No built index-*.css in dist/assets. Run `pnpm build`.");
  return fs.readFile(path.join(dir, css[0]), "utf8");
}

const server = await createServer({
  root,
  logLevel: "error",
  server: { middlewareMode: true },
  appType: "custom",
});

const { CorrectionToggle, FixTiles, MarkedParagraphs, MarkedTokens, MAX_FIX_TILES } =
  await server.ssrLoadModule("/src/features/writing/correction.tsx");
const { Card, CardContent } = await server.ssrLoadModule("/src/components/ui/card.tsx");
const { Button } = await server.ssrLoadModule("/src/components/ui/button.tsx");
const { diffWords } = await server.ssrLoadModule("/src/lib/wordDiff.ts");

/** Fokus: one sentence. */
const SENT_ORIG = "Der Bericht wurde von die Kollegin geschrieben.";
const SENT_CORR = "Der Bericht wurde von der Kollegin geschrieben.";
/** Kurz: a short letter, so the paragraph-wise diff is visible. */
const TEXT_ORIG =
  "Sehr geehrte Damen und Herren,\n\nseit drei Tagen funktioniert die Heizung in meine Wohnung nicht. Ich bitte Sie, der Schaden bis Freitag zu beheben.\n\nMit freundlichen Grüßen";
const TEXT_CORR =
  "Sehr geehrte Damen und Herren,\n\nseit drei Tagen funktioniert die Heizung in meiner Wohnung nicht. Ich bitte Sie, den Schaden bis Freitag zu beheben.\n\nMit freundlichen Grüßen";

const paragraphsOf = (a, b) => {
  const split = (s) => s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const pa = split(a);
  const pb = split(b);
  return pa.length > 1 && pa.length === pb.length
    ? pa.map((p, i) => diffWords(p, pb[i]))
    : [diffWords(a, b)];
};

const eyebrow = (text) =>
  h("p", { className: "text-xs font-bold uppercase tracking-wide text-primary" }, text);
const divider = () => h("div", { className: "h-px bg-border" });

/** The shipped Fokus desktop correction card (FokusTrainer.tsx). */
function fokusCard(view, withAction) {
  const diff = diffWords(SENT_ORIG, SENT_CORR);
  return h(
    Card,
    null,
    h(
      CardContent,
      { className: "space-y-3 p-5" },
      h(
        "div",
        { className: "flex items-center justify-between gap-3" },
        eyebrow("Dein Satz"),
        h(CorrectionToggle, { view, onChange: () => {} }),
      ),
      h(
        "p",
        { className: "text-base leading-relaxed" },
        h(MarkedTokens, {
          tokens: view === "orig" ? diff.originalTokens : diff.tokens,
          mark: view === "orig" ? "coral" : "green",
        }),
      ),
      divider(),
      h(FixTiles, {
        changes: diff.changes,
        action: withAction
          ? h(
              Button,
              { variant: "outline", className: "ml-auto h-9 self-end rounded-xl" },
              "Neuer Satz",
            )
          : null,
      }),
    ),
  );
}

/** The new Kurz/Lang correction card (GuidedWritingTrainer.tsx). */
function kurzCard(view, withAction) {
  const paragraphs = paragraphsOf(TEXT_ORIG, TEXT_CORR);
  const changes = paragraphs.flatMap((p) => p.changes);
  return h(
    Card,
    null,
    h(
      CardContent,
      { className: "space-y-3 p-5" },
      h(
        "div",
        { className: "flex items-center justify-between gap-3" },
        eyebrow("Dein Text"),
        h(CorrectionToggle, { view, onChange: () => {} }),
      ),
      h(MarkedParagraphs, { paragraphs, view }),
      divider(),
      h(FixTiles, {
        changes,
        max: MAX_FIX_TILES,
        action: withAction
          ? h(
              "div",
              { className: "ml-auto self-end" },
              h(Button, { variant: "outline", className: "h-9 rounded-xl" }, "Neu schreiben"),
            )
          : null,
      }),
    ),
  );
}

const panel = (title, note, body) =>
  `<section class="panel">
     <h2>${title}</h2>
     <p class="pnote">${note}</p>
     ${body}
   </section>`;

const column = (label, width, view, withAction) =>
  `<div class="col" style="max-width:${width}px">
     <div class="collabel">${label}</div>
     ${panel("Fokus (heute)", "Satzlabor, unverändert. Die Referenz.", renderToStaticMarkup(fokusCard(view, withAction)))}
     ${panel("Kurz / Lang (neu)", "Das Schreibfeld nach dem Auswerten, Variante A.", renderToStaticMarkup(kurzCard(view, withAction)))}
   </div>`;

const css = await appCss();
const html = `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Korrektur in Kurz/Lang · Runde 2 · Genauly</title>
<style>${css}</style>
<style>
  body { padding: 28px 20px 48px; }
  .wrap { max-width: 1180px; margin: 0 auto; }
  h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.01em; }
  .sub { margin-top: 6px; font-size: 14px; color: hsl(var(--muted-foreground)); max-width: 62ch; }
  .row { display: flex; flex-wrap: wrap; gap: 28px; margin-top: 26px; align-items: flex-start; }
  .col { flex: 1 1 360px; }
  .collabel { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em;
              color: hsl(var(--muted-foreground)); margin-bottom: 10px; }
  .panel + .panel { margin-top: 18px; }
  .panel h2 { font-size: 13px; font-weight: 800; color: hsl(var(--primary)); }
  .pnote { font-size: 12px; color: hsl(var(--muted-foreground)); margin: 2px 0 8px; }
</style>
</head>
<body class="bg-page text-foreground">
<div class="wrap">
  <div class="text-eyebrow">Preview · Runde 2</div>
  <h1>Die Korrektur in Kurz/Lang, neben Fokus</h1>
  <p class="sub">Variante A, umgesetzt. Beide Karten benutzen jetzt DIESELBEN Bausteine (Umschalter,
     Markierungen, Fix-Kacheln), server-gerendert aus dem echten Code: Kategorie-Eyebrow, durchgestrichenes
     Original, Pfeil, grüne Korrektur. Links in Handybreite (dort sitzt "Neu schreiben" in der festen
     unteren Leiste, deshalb fehlt es in der Karte), rechts der Desktop in der Original-Ansicht.
     Dieselbe Seite gibt es als Dunkel-Variante.</p>
  <div class="row">
    ${column("Handybreite · Korrigiert", 390, "corr", false)}
    ${column("Desktop · Original", 560, "orig", true)}
  </div>
</div>
</body>
</html>`;

const darkHtml = html
  .replace('<html lang="de">', '<html lang="de" class="dark">')
  .replace("Runde 2</div>", "Runde 2 · Dunkel</div>");

const out = path.join(root, "preview/kurz-lang-korrektur-r2.html");
await fs.writeFile(out, html, "utf8");
await fs.writeFile(path.join(root, "preview/kurz-lang-korrektur-r2-dark.html"), darkHtml, "utf8");

/**
 * Same sheet as ONE artifact-ready body (no doctype/head/body of its own, the
 * publisher supplies those), with the light and the dark ground stacked, so the
 * founder sees both without a theme toggle. The dark half is just the app's own
 * `.dark` class, which is how the app itself switches.
 */
const artifactBody = `<style>${css}</style>
<style>
  .sheet { padding: 26px 20px 40px; }
  .wrap { max-width: 1180px; margin: 0 auto; }
  .sheet h1 { font-size: 24px; font-weight: 800; letter-spacing: -0.01em; }
  .sub { margin-top: 6px; font-size: 14px; max-width: 66ch; }
  .row { display: flex; flex-wrap: wrap; gap: 28px; margin-top: 24px; align-items: flex-start; }
  .col { flex: 1 1 340px; }
  .collabel { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em;
              margin-bottom: 10px; }
  .panel + .panel { margin-top: 18px; }
  .panel h2 { font-size: 13px; font-weight: 800; color: hsl(var(--primary)); }
  .pnote { font-size: 12px; margin: 2px 0 8px; }
  .sub, .collabel, .pnote { color: hsl(var(--muted-foreground)); }
</style>
<div class="sheet bg-page text-foreground">
  <div class="wrap">
    <div class="text-eyebrow">Preview · Runde 2 · Hell</div>
    <h1>Die Korrektur in Kurz/Lang, neben Fokus</h1>
    <p class="sub">Variante A, umgesetzt. Beide Karten benutzen jetzt DIESELBEN Bausteine (Umschalter,
       Markierungen, Fix-Kacheln), server-gerendert aus dem echten Code. Links in Handybreite, dort
       sitzt "Neu schreiben" in der festen unteren Leiste und fehlt deshalb in der Karte; rechts der
       Desktop in der Original-Ansicht.</p>
    <div class="row">
      ${column("Handybreite · Korrigiert", 390, "corr", false)}
      ${column("Desktop · Original", 560, "orig", true)}
    </div>
  </div>
</div>
<div class="dark sheet bg-page text-foreground">
  <div class="wrap">
    <div class="text-eyebrow">Preview · Runde 2 · Dunkel</div>
    <h1>Dieselben Karten im Dunkelmodus</h1>
    <p class="sub">Die Kacheln werden im Dunkeln weicher (das ist die geltende Regel), in beiden
       Karten gleich.</p>
    <div class="row">
      ${column("Handybreite · Korrigiert", 390, "corr", false)}
      ${column("Desktop · Original", 560, "orig", true)}
    </div>
  </div>
</div>`;
await fs.writeFile(path.join(root, "preview/kurz-lang-korrektur-r2-artifact.html"), artifactBody, "utf8");

await server.close();
console.log(`[preview] wrote ${path.relative(root, out)} (+ -dark, + -artifact)`);
