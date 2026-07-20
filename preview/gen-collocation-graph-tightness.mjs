/**
 * Preview generator for the Kollokationen-graph cluster tightness options.
 *
 * Loads the REAL collocation bank + the pure graph builder + the palette through
 * Vite SSR, then runs the same d3-force layout used by CollocationGraph.tsx at a
 * few parameter sets, fits each to a viewBox, and writes ONE self-contained HTML
 * with the variants side by side so the founder can pick before we apply one.
 *
 * Run: node preview/gen-collocation-graph-tightness.mjs
 * Out: preview/collocation-graph-tightness.html
 */
import { createServer } from "vite";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
} from "d3-force";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// The tightness variants. "Aktuell" mirrors the shipped values (CollocationGraph
// force block); the others pull nodes toward their theme centroid harder, tie
// linked pairs tighter, and pack them closer (smaller collision pad + weaker
// repulsion), with a slightly smaller centroid ring so islands are compact
// without drifting into empty space.
const VARIANTS = [
  {
    name: "Aktuell",
    tag: "wie live",
    sub: "Sog .38 · Link .22 · Abstoßung −55 · Kollision r+3 · Ring 140+N·35",
    pull: 0.38, link: 0.22, charge: -55, chargeMax: 240, collide: 3, ringBase: 140, ringPer: 35,
  },
  {
    name: "Enger",
    tag: "Alternative",
    sub: "Sog .55 · Link .30 · Abstoßung −44 · Kollision r+2 · Ring 128+N·30",
    pull: 0.55, link: 0.3, charge: -44, chargeMax: 220, collide: 2, ringBase: 128, ringPer: 30,
  },
  {
    name: "Am engsten",
    tag: "angewendet",
    sub: "Sog .72 · Link .38 · Abstoßung −34 · Kollision r+1.5 · Ring 118+N·26",
    pull: 0.72, link: 0.38, charge: -34, chargeMax: 200, collide: 1.5, ringBase: 118, ringPer: 26,
  },
];

const TICKS = 420; // settle to a clean static layout

function layout(graph, v, lifeAreaColor) {
  // Deterministic theme ring (sorted), identical to the component.
  const seen = new Set();
  for (const n of graph.nodes) if (n.themeId) seen.add(n.themeId);
  const present = Array.from(seen).sort();
  const N = Math.max(present.length, 1);
  const R = v.ringBase + N * v.ringPer;
  const centroid = new Map();
  present.forEach((id, i) => {
    const a = (2 * Math.PI * i) / N - Math.PI / 2;
    centroid.set(id, { x: Math.cos(a) * R, y: Math.sin(a) * R });
  });
  const cOf = (n) => (n.themeId && centroid.get(n.themeId)) || { x: 0, y: 0 };

  // Seed near centroid with the same golden-angle jitter as the component.
  const nodes = graph.nodes.map((n, i) => {
    const c = cOf(n);
    const ang = (i * 2.399963) % (2 * Math.PI);
    const rad = 20 + (i % 7) * 6;
    return { ...n, x: c.x + Math.cos(ang) * rad, y: c.y + Math.sin(ang) * rad };
  });
  const links = graph.links.map((l) => ({ ...l }));

  const sim = forceSimulation(nodes)
    .force(
      "link",
      forceLink(links)
        .id((d) => d.id)
        .distance((l) => 22 + l.source.r + l.target.r)
        .strength(v.link),
    )
    .force("charge", forceManyBody().strength(v.charge).distanceMax(v.chargeMax))
    .force("collide", forceCollide((d) => d.r + v.collide))
    .force("x", forceX((d) => cOf(d).x).strength(v.pull))
    .force("y", forceY((d) => cOf(d).y).strength(v.pull))
    .stop();
  for (let i = 0; i < TICKS; i++) sim.tick();

  return { nodes, links, color: (n) => lifeAreaColor(n.domain, false) };
}

function svg(laid, w, h) {
  const { nodes, links, color } = laid;
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x - n.r); maxX = Math.max(maxX, n.x + n.r);
    minY = Math.min(minY, n.y - n.r); maxY = Math.max(maxY, n.y + n.r);
  }
  const pad = 24;
  const bw = maxX - minX, bh = maxY - minY;
  const k = Math.min((w - 2 * pad) / bw, (h - 2 * pad) / bh);
  const ox = pad + (w - 2 * pad - bw * k) / 2 - minX * k;
  const oy = pad + (h - 2 * pad - bh * k) / 2 - minY * k;
  const X = (x) => (x * k + ox).toFixed(1);
  const Y = (y) => (y * k + oy).toFixed(1);

  const byId = new Map(nodes.map((n) => [n.id, n]));
  let s = "";
  // Edges: thin light arcs, gently bowed like the app.
  for (const l of links) {
    const a = byId.get(typeof l.source === "object" ? l.source.id : l.source);
    const b = byId.get(typeof l.target === "object" ? l.target.id : l.target);
    if (!a || !b) continue;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const bow = Math.min(len * 0.12, 26);
    const cx = mx + (-dy / len) * bow, cy = my + (dx / len) * bow;
    s += `<path d="M${X(a.x)} ${Y(a.y)} Q${X(cx)} ${Y(cy)} ${X(b.x)} ${Y(b.y)}" fill="none" stroke="#94a3b8" stroke-opacity="0.16" stroke-width="0.7"/>`;
  }
  // Nodes: nouns = filled disc, verbs = ring.
  for (const n of nodes) {
    const c = color(n);
    const r = Math.max(n.r * k, 1.4);
    if (n.kind === "verb") {
      s += `<circle cx="${X(n.x)}" cy="${Y(n.y)}" r="${r.toFixed(1)}" fill="${c}"/>`;
      s += `<circle cx="${X(n.x)}" cy="${Y(n.y)}" r="${Math.max(r - Math.max(1.4, r * 0.42), 0.6).toFixed(1)}" fill="#ffffff"/>`;
    } else {
      s += `<circle cx="${X(n.x)}" cy="${Y(n.y)}" r="${r.toFixed(1)}" fill="${c}" stroke="#ffffff" stroke-width="0.8"/>`;
    }
  }
  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <rect width="${w}" height="${h}" fill="#f8fafc"/>${s}</svg>`;
}

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });
  try {
    const [coll, builder, palette] = await Promise.all([
      server.ssrLoadModule("/src/data/collocations.ts"),
      server.ssrLoadModule("/src/features/collocations/collocationGraph.ts"),
      server.ssrLoadModule("/src/lib/graphPalette.ts"),
    ]);
    const items = coll.collocations;
    const graph = builder.buildCollocationGraph(items);
    const nounN = graph.nodes.filter((n) => n.kind === "noun").length;
    const verbN = graph.nodes.filter((n) => n.kind === "verb").length;
    console.log(`bank: ${items.length} collocations -> ${graph.nodes.length} nodes (${nounN} nouns, ${verbN} verbs), ${graph.links.length} edges`);

    const W = 520, H = 520;
    const panels = VARIANTS.map((v) => {
      const laid = layout(graph, v, palette.lifeAreaColor);
      return { v, svg: svg(laid, W, H) };
    });

    const cards = panels
      .map(
        ({ v, svg }) => `
      <figure class="card${v.tag === "angewendet" ? " pick" : ""}">
        <figcaption>
          <div class="hd"><b>${v.name}</b><span class="tag">${v.tag}</span></div>
          <div class="sub mono">${v.sub}</div>
        </figcaption>
        <div class="frame">${svg}</div>
      </figure>`,
      )
      .join("");

    const html = `<!doctype html><html lang="de"><head><meta charset="utf8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Kollokationen-Graph · Cluster-Enge</title>
<style>
  *{box-sizing:border-box;margin:0}
  body{font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;background:#eef2f7;color:#0f172a;line-height:1.5;padding:40px 20px 64px}
  .wrap{max-width:1180px;margin:0 auto}
  .eyebrow{font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#2866EB;margin-bottom:8px}
  h1{font-size:clamp(22px,3.4vw,30px);font-weight:800;letter-spacing:-.02em;margin-bottom:8px}
  .lede{color:#475569;max-width:70ch;font-size:15px}
  .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}
  @media(max-width:900px){.grid{grid-template-columns:1fr}}
  .card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(15,23,42,.05)}
  .card.pick{border-color:#2866EB;box-shadow:0 0 0 2px rgba(40,102,235,.18)}
  figcaption{padding:14px 16px 10px}
  .hd{display:flex;align-items:center;gap:8px}
  .hd b{font-size:16px}
  .tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#2866EB;background:#eaf1ff;border-radius:999px;padding:2px 8px}
  .card:not(.pick) .tag{color:#64748b;background:#f1f5f9}
  .sub{font-size:11.5px;color:#64748b;margin-top:4px}
  .mono{font-family:ui-monospace,"SF Mono",Menlo,monospace}
  .frame{border-top:1px solid #eef2f7}
  .frame svg{display:block;width:100%;height:auto}
  .note{margin-top:26px;font-size:14px;color:#475569;border-top:1px solid #dbe2ea;padding-top:16px}
  .note b{color:#0f172a}
  .legend{display:flex;gap:18px;flex-wrap:wrap;margin-top:14px;font-size:13px;color:#475569}
  .legend span{display:inline-flex;align-items:center;gap:7px}
  .dot{width:12px;height:12px;border-radius:50%;display:inline-block}
  .ring{width:12px;height:12px;border-radius:50%;display:inline-block;border:3px solid #334155}
</style></head><body>
<div class="wrap">
  <div class="eyebrow">Kollokationen-Graph</div>
  <h1>Cluster enger ziehen — 3 Optionen</h1>
  <p class="lede">Der ganze Bank (alle Themen als Inseln), voll herausgezoomt, mit der echten d3-Force-Anordnung. Von links nach rechts werden die Knoten enger an ihr Themen-Zentrum gezogen, damit die Inseln kompakter und klarer getrennt wirken.</p>
  <div class="legend">
    <span><i class="dot" style="background:#3D74ED"></i> Berufsleben</span>
    <span><i class="dot" style="background:#14b8a6"></i> Privatleben</span>
    <span><i class="dot" style="background:#334155"></i> voll = Nomen</span>
    <span><i class="ring"></i> Ring = Verb</span>
  </div>
  <div class="grid">${cards}</div>
  <p class="note">
    <b>Angewendet: „Am engsten".</b> Sehr kompakte, aufgeräumte Themen-Inseln (vom Gründer gewählt, 2026-07-20). Die Werte stehen jetzt im Kraft-Block von <span class="mono">CollocationGraph.tsx</span>. „Enger" bleibt als dokumentierte Alternative erhalten, falls die dichte Anordnung einzelne Verbindungen zu schwer lesbar macht.
  </p>
</div>
</body></html>`;

    const out = path.join(root, "preview", "collocation-graph-tightness.html");
    writeFileSync(out, html);
    console.log(`wrote ${path.relative(root, out)}`);
  } finally {
    await server.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
