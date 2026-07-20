import { useEffect, useMemo, useRef, useState } from "react";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import { Maximize, Minus, PanelBottom, PanelRight, Plus, Waypoints, X } from "lucide-react";
import type { Collocation } from "@/types";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EmptyState } from "@/components/shared/misc";
import { useIsDark } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { lifeAreaColor, lifeAreaOf, LIFE_AREAS, LIFE_AREA_COLORS } from "@/lib/graphPalette";
import { buildCollocationGraph, type CollocationNode } from "./collocationGraph";

/**
 * The Kollokationen graph view (Bibliothek views): an Obsidian-style, canvas
 * force-directed map of the CURRENTLY FILTERED collocation bank as a bipartite
 * noun ↔ verb graph (see collocationGraph.ts). Built to shine when fully zoomed
 * out: nodes are pulled toward per-theme centroids so the themes form glowing
 * "islands", shared verbs settle between them as bridges, every node carries a
 * soft bloom, and edges are thin luminous arcs. Tap a node to see its partners.
 *
 * Purpose-built (does not touch the founder-locked Wörter graph); reuses only
 * the domain palette and the pure builder. Lives in its own lazy chunk so
 * d3-force never rides the main bundle.
 */
interface SimNode extends SimulationNodeDatum, CollocationNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  collocationId: string;
}

// One node's animated move from its current spot to a target (ring or home).
type PosMove = { node: SimNode; from: { x: number; y: number }; to: { x: number; y: number } };

const MIN_K = 0.1;
const MAX_K = 6;
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

// Spread a set of angles so clustered ones fan out to use the whole circle,
// while preserving their circular ORDER (so the arrangement still matches the
// original layout). Each angle is blended toward an even slot, where the even
// slots are rotation-aligned to the originals to move them as little as needed.
// Used by the focus layout so a hub whose partners all pointed one way still
// fills the space left and right instead of stacking in a central column.
function spreadAngles(raw: number[], blend = 0.7): number[] {
  const N = raw.length;
  if (N <= 1) return raw.slice();
  const step = (2 * Math.PI) / N;
  const order = raw.map((a, i) => ({ a, i })).sort((x, y) => x.a - y.a);
  let sc = 0;
  let cc = 0;
  order.forEach((o, k) => {
    const diff = o.a - k * step;
    sc += Math.sin(diff);
    cc += Math.cos(diff);
  });
  const base = Math.atan2(sc, cc);
  const out = new Array<number>(N);
  order.forEach((o, k) => {
    const target = base + k * step;
    const delta = Math.atan2(Math.sin(target - o.a), Math.cos(target - o.a));
    out[o.i] = o.a + delta * blend;
  });
  return out;
}

// Focus-layout timing + zoom guards (word-selection distribution): on select a
// node's partners fan out onto even rings around it and the view zooms to a
// comfortable, readable level; on deselect every displaced node animates home.
const FOCUS_MS = 480;
const RETURN_MS = 420;
const MIN_FOCUS_K = 1.55;
// Comfortable zoom the pull-in layout sizes its arrangement against, so a
// selection fills most of the window and lands neither cramped nor tiny.
const TARGET_FOCUS_K = 2.3;

// Safety cap on the cross-filter position cache (see posRef); real bank sizes
// stay far under this, it only guards against unbounded growth.
const MAX_CACHED_POSITIONS = 4000;

// Leading article stripped when grouping a merged node's surface forms in the
// card, so "die Beschwerden" and "Beschwerden" read as one plural group.
const ARTICLE_RE = /^(?:der|die|das|den|dem|des|ein|eine|einen|einem|einer|eines)\s+/i;

// Convert a hex color to an rgba() string (glow sprites + focus tints).
function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

export default function CollocationGraph({ items }: { items: Collocation[] }) {
  const isDark = useIsDark();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // The selected-node card takes one of two shapes: a full-width bar across the
  // bottom ("horizontal") or a full-height panel down the right ("vertical").
  // Toggled from a button beside the card's close, re-centering the graph.
  const [cardLayout, setCardLayout] = useState<"horizontal" | "vertical">("horizontal");

  // Legend filters (parity with the Wörter graph): tap a domain to isolate it,
  // or toggle Nomen/Verben. Empty set = show all. Refs mirror them so draw()
  // reads them without a React re-render.
  const [domainFilter, setDomainFilter] = useState<Set<string>>(new Set());
  const [kindFilter, setKindFilter] = useState<Set<"noun" | "verb">>(new Set());
  const toggleDomain = (id: string) =>
    setDomainFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleKind = (k: "noun" | "verb") =>
    setKindFilter((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const graph = useMemo(() => buildCollocationGraph(items), [items]);
  const collById = useMemo(() => new Map(items.map((c) => [c.id, c])), [items]);
  const nodeById = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph]);

  // The legend count only counts edges whose BOTH ends pass the active domain
  // + Nomen/Verben filters, so it matches what's actually lit up on screen
  // instead of the raw (unfiltered) total.
  const visibleLinkCount = useMemo(() => {
    if (domainFilter.size === 0 && kindFilter.size === 0) return graph.links.length;
    const passes = (n: CollocationNode) =>
      (domainFilter.size === 0 || domainFilter.has(lifeAreaOf(n.domain))) &&
      (kindFilter.size === 0 || kindFilter.has(n.kind));
    let count = 0;
    for (const l of graph.links) {
      const s = nodeById.get(l.source as string);
      const t = nodeById.get(l.target as string);
      if (s && t && passes(s) && passes(t)) count++;
    }
    return count;
  }, [graph, domainFilter, kindFilter, nodeById]);

  // Partner index: node id -> [{ partnerId, collocationId }]. Drives the card.
  const partners = useMemo(() => {
    const m = new Map<string, { partnerId: string; collocationId: string }[]>();
    const push = (a: string, b: string, cid: string) => {
      if (!m.has(a)) m.set(a, []);
      m.get(a)!.push({ partnerId: b, collocationId: cid });
    };
    for (const l of graph.links) {
      push(l.source as string, l.target as string, l.collocationId);
      push(l.target as string, l.source as string, l.collocationId);
    }
    return m;
  }, [graph]);

  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of graph.links) {
      const s = l.source as string;
      const t = l.target as string;
      if (!m.has(s)) m.set(s, new Set());
      if (!m.has(t)) m.set(t, new Set());
      m.get(s)!.add(t);
      m.get(t)!.add(s);
    }
    return m;
  }, [graph]);

  // Theme centroids: the themes present on screen, placed on a ring in world
  // space so each theme becomes an island. Deterministic (themes array order),
  // so the layout is stable across filter changes. Nodes without a theme pull
  // to the center.
  const centroids = useMemo(() => {
    // Themes present on screen, in a deterministic (sorted) order so the ring
    // layout is stable across filter changes.
    const seen = new Set<string>();
    for (const n of graph.nodes) if (n.themeId) seen.add(n.themeId);
    const present = Array.from(seen).sort();

    const N = Math.max(present.length, 1);
    // Topic centroids on a ring. Tightened to the founder-picked "Am engsten"
    // recipe (2026-07-20, preview/collocation-graph-tightness.html): a slightly
    // smaller ring paired with the much firmer pull/link below packs each topic
    // into a very compact island while keeping the islands clearly separated.
    const R = 118 + N * 26;
    const map = new Map<string, { x: number; y: number }>();
    present.forEach((id, i) => {
      const a = (2 * Math.PI * i) / N - Math.PI / 2;
      map.set(id, { x: Math.cos(a) * R, y: Math.sin(a) * R });
    });
    return map;
  }, [graph]);

  // Mutable rendering state, read by draw() via refs (pan/zoom/hover never
  // re-render React). Node positions survive filter changes (posRef).
  const simRef = useRef<{ sim: Simulation<SimNode, SimLink>; nodes: SimNode[]; links: SimLink[] } | null>(null);
  const posRef = useRef(new Map<string, { x: number; y: number }>());
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const fittedRef = useRef(false);
  const hoverRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const cardLayoutRef = useRef(cardLayout);
  const darkRef = useRef(isDark);
  const domainFilterRef = useRef(domainFilter);
  const kindFilterRef = useRef(kindFilter);
  const neighborsRef = useRef(neighbors);
  const glowCache = useRef(new Map<string, HTMLCanvasElement>());
  const rafRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});
  // Original ("home") position of every node the focus layout has displaced, so
  // a deselect can animate them back. focusRafRef owns the focus/return tween.
  const homePosRef = useRef(new Map<string, { x: number; y: number }>());
  const focusRafRef = useRef<number | null>(null);
  // Offscreen ctx to measure label widths (same font as draw), so the focus
  // layout can space nodes by their LABEL box, not just the dot, keeping every
  // partner word legible instead of letting the draw pass cull overlaps.
  const labelCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const measureLabel = (text: string) => {
    let ctx = labelCtxRef.current;
    if (!ctx) {
      ctx = document.createElement("canvas").getContext("2d");
      if (ctx) {
        const fam = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
        ctx.font = `600 11px ${fam}`;
      }
      labelCtxRef.current = ctx;
    }
    return ctx ? ctx.measureText(text).width : text.length * 6.5;
  };

  selectedRef.current = selectedId;
  cardLayoutRef.current = cardLayout;
  darkRef.current = isDark;
  neighborsRef.current = neighbors;
  domainFilterRef.current = domainFilter;
  kindFilterRef.current = kindFilter;

  // Life areas actually on screen, for the legend (professional vs personal).
  const presentDomains = useMemo(() => {
    const present = new Set(graph.nodes.map((n) => lifeAreaOf(n.domain)));
    return LIFE_AREAS.filter((a) => present.has(a.id));
  }, [graph]);

  const scheduleDraw = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawRef.current();
    });
  };

  // A cached radial-gradient glow sprite per color (cheap luminous halo vs
  // per-frame shadowBlur). 64px; drawn scaled to each node under the transform.
  const glowSprite = (color: string): HTMLCanvasElement => {
    const cache = glowCache.current;
    const hit = cache.get(color);
    if (hit) return hit;
    const size = 64;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d")!;
    const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    grad.addColorStop(0, hexToRgba(color, 0.85));
    grad.addColorStop(0.35, hexToRgba(color, 0.4));
    grad.addColorStop(1, hexToRgba(color, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, size, size);
    cache.set(color, c);
    return c;
  };

  // Fit all nodes centered into a target rectangle (in screen/canvas space).
  // The transform that fits every node into a target rectangle (does not apply
  // it, so callers can animate the camera to it).
  const computeFitRect = (nodes: SimNode[], rx: number, ry: number, rw: number, rh: number) => {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const n of nodes) {
      minX = Math.min(minX, (n.x ?? 0) - n.r);
      maxX = Math.max(maxX, (n.x ?? 0) + n.r);
      minY = Math.min(minY, (n.y ?? 0) - n.r);
      maxY = Math.max(maxY, (n.y ?? 0) + n.r);
    }
    const k = clampK(Math.min(rw / Math.max(maxX - minX, 1), rh / Math.max(maxY - minY, 1)));
    return {
      k,
      x: rx + rw / 2 - ((minX + maxX) / 2) * k,
      y: ry + rh / 2 - ((minY + maxY) / 2) * k,
    };
  };

  // Card size constants: kept in lockstep with the card's CSS so the fit math
  // knows which slice of the canvas the pop-up tile occupies.
  const cardExtent = (w: number, h: number, layout: "horizontal" | "vertical") =>
    layout === "horizontal" ? Math.min(h * 0.42, 260) : Math.min(w * 0.42, 360);

  // The rectangle left free by the selected-node card, so the constellation can
  // re-center into the visible area when the card is shown/toggled.
  const freeRect = (
    w: number,
    h: number,
    hasCard: boolean,
    layout: "horizontal" | "vertical",
  ): [number, number, number, number] => {
    const pad = 44;
    let rw = w - 2 * pad;
    let rh = h - 2 * pad;
    if (hasCard) {
      if (layout === "horizontal") rh -= cardExtent(w, h, layout);
      else rw -= cardExtent(w, h, layout);
    }
    return [pad, pad, Math.max(rw, 40), Math.max(rh, 40)];
  };

  // Re-fit the constellation into the area not covered by the card (used on open
  // and whenever the card shape is toggled, so the graph "refocuses to center").
  const refitForLayout = (layout: "horizontal" | "vertical", hasCard: boolean) => {
    const container = containerRef.current;
    const live = simRef.current;
    if (!container || !live || live.nodes.length === 0) return;
    const rect = container.getBoundingClientRect();
    const [rx, ry, rw, rh] = freeRect(rect.width, rect.height, hasCard, layout);
    // Animate the camera to the fit (empty move-set = camera-only tween), so a
    // fit / card-toggle re-center always animates instead of jumping.
    const to = computeFitRect(live.nodes, rx, ry, rw, rh);
    runFocusTween([], transformRef.current, to, FOCUS_MS);
  };

  // ── Simulation + rendering ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // The graph was rebuilt: a hover id from the previous node set would dim
    // everything against a node that no longer exists.
    hoverRef.current = null;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const prevWidth = width;
      const prevHeight = height;
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      // Keep the visual center anchored across a resize (window resize, phone
      // rotation): without this the view stayed pinned to its old top-left
      // corner and the constellation appeared to jump off-center.
      if (fittedRef.current && (width !== prevWidth || height !== prevHeight)) {
        transformRef.current = {
          ...transformRef.current,
          x: transformRef.current.x + (width - prevWidth) / 2,
          y: transformRef.current.y + (height - prevHeight) / 2,
        };
      }
      scheduleDraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const fontFamily = getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";

    const centroidOf = (n: SimNode) => (n.themeId && centroids.get(n.themeId)) || { x: 0, y: 0 };

    // Seed each node near its theme centroid (deterministic index jitter), so
    // the islands start apart instead of exploding from the origin. Reuse the
    // last position when a node survives a filter change.
    const nodes: SimNode[] = graph.nodes.map((n, i) => {
      const prev = posRef.current.get(n.id);
      if (prev) return { ...n, ...prev };
      const c = (n.themeId && centroids.get(n.themeId)) || { x: 0, y: 0 };
      const a = (i * 2.399963) % (2 * Math.PI); // golden angle jitter
      const rad = 20 + (i % 7) * 6;
      return { ...n, x: c.x + Math.cos(a) * rad, y: c.y + Math.sin(a) * rad };
    });
    const links: SimLink[] = graph.links.map((l) => ({ ...l }));

    const sim = forceSimulation<SimNode>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((l) => 22 + (l.source as SimNode).r + (l.target as SimNode).r)
          // High link tension (founder "Am engsten", 2026-07-20: tighten the
          // clusters) so connected noun/verb pairs pull firmly together.
          .strength(0.38),
      )
      // Weaker, shorter-range repulsion so a cluster's members can sit close.
      .force("charge", forceManyBody<SimNode>().strength(-34).distanceMax(200))
      // Tight node packing (small collision padding) so a cluster's members sit
      // right next to each other.
      .force("collide", forceCollide<SimNode>((d) => d.r + 1.5))
      // Theme-centroid pull: this is what forms the islands. Strong (0.72) so
      // each topic contracts into a very compact island (founder "Am engsten",
      // 2026-07-20; preview/collocation-graph-tightness.html).
      .force("x", forceX<SimNode>((d) => centroidOf(d).x).strength(0.72))
      .force("y", forceY<SimNode>((d) => centroidOf(d).y).strength(0.72))
      .stop();
    simRef.current = { sim, nodes, links };

    const nodeIds = new Set(nodes.map((n) => n.id));

    const draw = () => {
      const { x: tx, y: ty, k } = transformRef.current;
      const dark = darkRef.current;

      // ── Background depth (screen space, before the world transform) ──
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      const vg = ctx.createRadialGradient(
        width / 2,
        height * 0.42,
        0,
        width / 2,
        height * 0.42,
        Math.max(width, height) * 0.75,
      );
      if (dark) {
        vg.addColorStop(0, "rgba(30,41,59,0.55)");
        vg.addColorStop(1, "rgba(2,6,23,0.85)");
      } else {
        vg.addColorStop(0, "rgba(255,255,255,0.9)");
        vg.addColorStop(1, "rgba(226,232,240,0.35)");
      }
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, width, height);

      // Ignore a selection that is not in the current graph (a filter change
      // can remove the selected node): the dead id has no card but would still
      // drive the focus dimming, ghosting the whole canvas. The selection
      // simply goes dormant and revives if the node comes back into filter.
      const rawFocus = hoverRef.current ?? selectedRef.current;
      const focus = rawFocus !== null && nodeIds.has(rawFocus) ? rawFocus : null;
      const focusSet = focus
        ? new Set([focus, ...(neighborsRef.current.get(focus) ?? [])])
        : null;

      const domFilter = domainFilterRef.current;
      const kindF = kindFilterRef.current;
      const isActive = (n: SimNode) =>
        (domFilter.size === 0 || domFilter.has(lifeAreaOf(n.domain))) &&
        (kindF.size === 0 || kindF.has(n.kind));

      // World transform for the graph itself.
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty);

      const worldLeft = -tx / k;
      const worldTop = -ty / k;
      const worldRight = worldLeft + width / k;
      const worldBottom = worldTop + height / k;

      // ── Edges: thin luminous curved arcs, under the nodes ──
      for (const l of links) {
        const s = l.source as SimNode;
        const t = l.target as SimNode;
        const sActive = isActive(s);
        const tActive = isActive(t);
        const lit = focusSet !== null && (s.id === focus || t.id === focus);
        const bothOn = sActive && tActive;
        let alpha: number;
        if (!bothOn) alpha = dark ? 0.04 : 0.05;
        else if (focusSet === null) alpha = dark ? 0.13 : 0.1;
        else if (lit) alpha = dark ? 0.9 : 0.7;
        else alpha = dark ? 0.03 : 0.04;

        const sx = s.x ?? 0;
        const sy = s.y ?? 0;
        const tx2 = t.x ?? 0;
        const ty2 = t.y ?? 0;
        // Gentle, consistent bow via a perpendicular control-point offset.
        const mx = (sx + tx2) / 2;
        const my = (sy + ty2) / 2;
        const dx = tx2 - sx;
        const dy = ty2 - sy;
        const len = Math.hypot(dx, dy) || 1;
        const bow = Math.min(len * 0.12, 26);
        const cx = mx + (-dy / len) * bow;
        const cy = my + (dx / len) * bow;

        const color = lit ? lifeAreaColor(s.domain, dark) : dark ? "148,163,184" : "100,116,139";
        ctx.strokeStyle = lit
          ? hexToRgba(lifeAreaColor(s.domain, dark), alpha)
          : `rgba(${color},${alpha})`;
        ctx.lineWidth = (lit ? 1.6 : 0.55) / k;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cx, cy, tx2, ty2);
        ctx.stroke();
      }

      // ── Node bloom pass (additive in dark for a luminous glow) ──
      ctx.globalCompositeOperation = dark ? "lighter" : "source-over";
      for (const n of nodes) {
        const x = n.x ?? 0;
        const y = n.y ?? 0;
        if (x + n.r * 4 < worldLeft || x - n.r * 4 > worldRight || y + n.r * 4 < worldTop || y - n.r * 4 > worldBottom)
          continue;
        const active = isActive(n);
        const inFocus = focusSet === null || focusSet.has(n.id);
        if (!active || !inFocus) continue;
        const color = lifeAreaColor(n.domain, dark);
        const glowR = n.r * (dark ? 3.4 : 2.6);
        const sprite = glowSprite(color);
        ctx.globalAlpha = dark ? 0.75 : 0.4;
        ctx.drawImage(sprite, x - glowR, y - glowR, glowR * 2, glowR * 2);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      // ── Nodes: nouns = solid discs, verbs = rings (annuli) ──
      const ringColor = dark ? "#0b1220" : "#ffffff";
      for (const n of nodes) {
        const x = n.x ?? 0;
        const y = n.y ?? 0;
        if (x + n.r < worldLeft || x - n.r > worldRight || y + n.r < worldTop || y - n.r > worldBottom)
          continue;
        const dimmed = (focusSet !== null && !focusSet.has(n.id)) || !isActive(n);
        const color = lifeAreaColor(n.domain, dark);
        ctx.globalAlpha = dimmed ? 0.12 : 1;

        if (n.kind === "verb") {
          // Annulus: filled disc, then punch a background-colored hole so verbs
          // read as rings at any zoom.
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, n.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = ringColor;
          ctx.beginPath();
          ctx.arc(x, y, Math.max(n.r - Math.max(1.4, n.r * 0.42), 0.6), 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, n.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = ringColor;
          ctx.lineWidth = 1 / k;
          ctx.stroke();
        }

        if (n.id === selectedRef.current) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 / k;
          ctx.beginPath();
          ctx.arc(x, y, n.r + 4 / k, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // ── Labels (screen space, crisp). Collision-avoided so they stay legible:
      // candidates are ranked (selected first, then by degree) and a label is
      // skipped if its box would overlap one already placed. Each sits on a
      // translucent pill so it reads over edges and glow.
      const zoomAlpha = Math.min(Math.max((k - 0.7) / 0.6, 0), 1);
      {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelColor = dark ? "226,232,240" : "51,65,85";
        const bgColor = dark ? "12,20,34" : "255,255,255";
        const sel = selectedRef.current;

        // Gather visible candidates with their opacity. Hubs keep a readable
        // label even fully zoomed out: on phones the fit-to-all zoom sits well
        // below the k=0.7 label threshold, so without the hub ramp the flagship
        // zoomed-out constellation showed no words at all. From degree 5 the
        // label alpha ramps 0.4 -> 0.9 (degree 16, the radius cap in the
        // builder); collision culling keeps the count on screen small.
        const cands: { n: SimNode; alpha: number }[] = [];
        for (const n of nodes) {
          const x = n.x ?? 0;
          const y = n.y ?? 0;
          if (x < worldLeft || x > worldRight || y < worldTop || y > worldBottom) continue;
          if (!isActive(n)) continue;
          const inFocus = focusSet?.has(n.id) ?? false;
          const hubAlpha =
            n.degree >= 5 ? Math.min(0.4 + ((n.degree - 5) / 11) * 0.5, 0.9) : 0;
          const alpha = focusSet ? (inFocus ? 1 : 0) : Math.max(zoomAlpha, hubAlpha);
          if (alpha <= 0.02) continue;
          cands.push({ n, alpha });
        }
        // Selected wins, then denser hubs, so the important words survive culling.
        cands.sort((a, b) => {
          if (a.n.id === sel) return -1;
          if (b.n.id === sel) return 1;
          return b.n.degree - a.n.degree;
        });

        const placed: { l: number; t: number; r: number; b: number }[] = [];
        const hits = (r: { l: number; t: number; r: number; b: number }) =>
          placed.some((d) => !(r.r < d.l || r.l > d.r || r.b < d.t || r.t > d.b));
        const padX = 5;
        const padY = 2;
        for (const { n, alpha } of cands) {
          ctx.font = `${n.kind === "verb" ? "italic " : ""}600 11px ${fontFamily}`;
          const w = ctx.measureText(n.label).width;
          const sx = (n.x ?? 0) * k + tx;
          const sy = ((n.y ?? 0) + n.r) * k + ty + 4;
          const bl = sx - w / 2 - padX;
          const bt = sy - padY;
          const bw = w + padX * 2;
          const bh = 11 + padY * 2;
          const box = { l: bl - 2, t: bt - 2, r: bl + bw + 2, b: bt + bh + 2 };
          // While a node is focused its partners were laid out so their labels
          // do not overlap, so draw every one (never cull a partner word).
          // Outside focus, cull overlaps as before to keep the map clean.
          if (!focusSet && hits(box)) continue;
          placed.push(box);
          ctx.fillStyle = `rgba(${bgColor},${0.72 * alpha})`;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(bl, bt, bw, bh, 4);
          else ctx.rect(bl, bt, bw, bh);
          ctx.fill();
          ctx.fillStyle = `rgba(${labelColor},${alpha})`;
          ctx.fillText(n.label, sx, sy);
        }
      }
    };
    drawRef.current = draw;

    // ── Warmup: settle past the initial motion, then animate gently ────────
    // This used to be one synchronous sim.tick(160), which froze the main
    // thread for ~1s on desktop (multi-second on phones) on every open AND
    // every filter change. The warmup now runs in requestAnimationFrame
    // slices with a per-frame time budget, so the page stays responsive.
    // A rebuild where most nodes kept their previous positions (a filter
    // tweak) is already settled and only needs a short warmup.
    const cachedShare =
      nodes.length > 0
        ? nodes.filter((n) => posRef.current.has(n.id)).length / nodes.length
        : 0;
    let warmTicksLeft = cachedShare > 0.5 ? 20 : 160;
    let warmRaf: number | null = null;
    const finishWarmup = () => {
      // Open on the WHOLE constellation, fully zoomed out (the headline goal),
      // not zoomed into a hub. Fit-to-all with padding; no card on open.
      if (!fittedRef.current && nodes.length > 0) {
        fittedRef.current = true;
        // Initial view is applied instantly (nothing to animate from yet).
        transformRef.current = computeFitRect(
          nodes,
          ...freeRect(width, height, false, cardLayoutRef.current),
        );
      }
      sim.on("tick", scheduleDraw);
      sim.alpha(0.08).restart();
      scheduleDraw();
    };
    const runWarmup = () => {
      warmRaf = null;
      const start = performance.now();
      while (warmTicksLeft > 0 && performance.now() - start < 10) {
        sim.tick();
        warmTicksLeft -= 1;
      }
      if (warmTicksLeft > 0) warmRaf = requestAnimationFrame(runWarmup);
      else finishWarmup();
    };
    // A warm rebuild can draw right away (positions are near their old spots);
    // a cold start stays blank until the layout has settled off-screen.
    if (cachedShare > 0.5) scheduleDraw();
    runWarmup();

    // ── Interaction: pan / pinch / drag / tap / hover ─────────────────────
    const pointers = new Map<number, { x: number; y: number }>();
    let dragNode: SimNode | null = null;
    let moved = 0;
    let pinchDist = 0;

    const toWorld = (sx: number, sy: number) => {
      const { x, y, k } = transformRef.current;
      return { x: (sx - x) / k, y: (sy - y) / k };
    };
    const local = (e: PointerEvent | WheelEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const hitTest = (sx: number, sy: number): SimNode | null => {
      const { k } = transformRef.current;
      const w = toWorld(sx, sy);
      const slack = 6 / k;
      let best: SimNode | null = null;
      let bestD = Infinity;
      for (const n of nodes) {
        const dx = (n.x ?? 0) - w.x;
        const dy = (n.y ?? 0) - w.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= Math.max(n.r, slack) + 2 / k && d < bestD) {
          best = n;
          bestD = d;
        }
      }
      return best;
    };

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = local(e);
      pointers.set(e.pointerId, p);
      moved = 0;
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinchDist = Math.hypot(a.x - b.x, a.y - b.y);
        // A pinch is not a deliberate drag-drop: unpin the barely-touched node
        // and let the sim cool down. Without this the touched node kept fx/fy
        // and alphaTarget stayed at 0.25, so the sim never slept again
        // (permanent jitter + battery drain).
        if (dragNode) {
          dragNode.fx = null;
          dragNode.fy = null;
          sim.alphaTarget(0);
          dragNode = null;
        }
        return;
      }
      dragNode = hitTest(p.x, p.y);
      if (dragNode) {
        dragNode.fx = dragNode.x;
        dragNode.fy = dragNode.y;
        sim.alphaTarget(0.25).restart();
      }
    };
    const onPointerMove = (e: PointerEvent) => {
      const p = local(e);
      if (!pointers.has(e.pointerId)) {
        const hit = hitTest(p.x, p.y);
        const id = hit?.id ?? null;
        if (id !== hoverRef.current) {
          hoverRef.current = id;
          canvas.style.cursor = id ? "pointer" : "grab";
          scheduleDraw();
        }
        return;
      }
      const prev = pointers.get(e.pointerId)!;
      pointers.set(e.pointerId, p);
      moved += Math.hypot(p.x - prev.x, p.y - prev.y);

      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinchDist > 0) {
          const t = transformRef.current;
          const nextK = clampK((t.k * dist) / pinchDist);
          const cx = (a.x + b.x) / 2;
          const cy = (a.y + b.y) / 2;
          const wx = (cx - t.x) / t.k;
          const wy = (cy - t.y) / t.k;
          transformRef.current = { k: nextK, x: cx - wx * nextK, y: cy - wy * nextK };
          scheduleDraw();
        }
        pinchDist = dist;
        return;
      }

      if (dragNode) {
        const w = toWorld(p.x, p.y);
        dragNode.fx = w.x;
        dragNode.fy = w.y;
        scheduleDraw();
      } else {
        const t = transformRef.current;
        transformRef.current = { ...t, x: t.x + (p.x - prev.x), y: t.y + (p.y - prev.y) };
        scheduleDraw();
      }
    };
    const onPointerUp = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      pointers.delete(e.pointerId);
      pinchDist = 0;
      // A dropped node stays pinned where it was dropped (fx/fy kept), so the
      // theme-centroid force does not yank it back. The cool-down runs whenever
      // the last pointer lifts, drag or not, so the sim always goes back to
      // sleep (belt and braces against a hot alphaTarget leaking).
      if (pointers.size === 0) sim.alphaTarget(0);
      if (p && moved < 5) {
        const hit = hitTest(p.x, p.y);
        setSelectedId(hit ? hit.id : null);
        scheduleDraw();
      }
      dragNode = null;
    };
    const onWheel = (e: WheelEvent) => {
      // Only hijack the wheel for an explicit zoom gesture (trackpad pinch
      // reports as wheel + ctrlKey, the same convention browsers use for
      // page-zoom). A plain wheel/two-finger scroll is left alone so the page
      // scrolls normally instead of getting stuck zooming the canvas.
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const t = transformRef.current;
      const nextK = clampK(t.k * Math.exp(-e.deltaY * 0.0018));
      const p = local(e);
      const wx = (p.x - t.x) / t.k;
      const wy = (p.y - t.y) / t.k;
      transformRef.current = { k: nextK, x: p.x - wx * nextK, y: p.y - wy * nextK };
      scheduleDraw();
    };
    const onPointerLeave = () => {
      if (hoverRef.current) {
        hoverRef.current = null;
        scheduleDraw();
      }
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointercancel", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.style.cursor = "grab";

    return () => {
      // Cache each node's HOME position (not its transient focus-ring spot) so a
      // filter change / remount restores the un-displaced layout rather than
      // baking a fanned-out selection into the next graph.
      const home = homePosRef.current;
      for (const n of nodes) {
        const h = home.get(n.id);
        posRef.current.set(n.id, h ? { x: h.x, y: h.y } : { x: n.x ?? 0, y: n.y ?? 0 });
      }
      homePosRef.current = new Map();
      if (focusRafRef.current != null) cancelAnimationFrame(focusRafRef.current);
      focusRafRef.current = null;
      // Safety cap: the cache is meant to survive filter changes (bounded by
      // the collocation bank size in practice), but evict the oldest entries
      // if it ever grows past a generous ceiling instead of growing unbounded.
      if (posRef.current.size > MAX_CACHED_POSITIONS) {
        const excess = posRef.current.size - MAX_CACHED_POSITIONS;
        const it = posRef.current.keys();
        for (let i = 0; i < excess; i++) posRef.current.delete(it.next().value as string);
      }
      sim.stop();
      ro.disconnect();
      if (warmRaf != null) cancelAnimationFrame(warmRaf);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointercancel", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      canvas.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, centroids]);

  // Theme flips / selection / filters only need a repaint, not a new sim.
  useEffect(() => {
    scheduleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, selectedId, domainFilter, kindFilter]);

  // ── Focus layout: fan a node's partners out over the open space ───────────
  // Selecting a node (tap, partner-chip hop, or the fit button's hub jump)
  // animates its partners onto evenly-spaced rings around it, so the connections
  // read clearly no matter where they sat in the raw force layout, and zooms the
  // view to a comfortable, readable level. Deselecting animates every displaced
  // node back to its stored home. This replaces the old pan-only framing that
  // left partners scattered (and often off-screen) on one side of the node.
  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Target positions that preserve each partner's direction from the selected
  // node and only shorten over-long spokes so the whole set fits the free area,
  // so the map still reads like one big nodal graph instead of a rebuilt ring.
  // A light collision pass separates any partners that end up overlapping.
  const focusTargets = (
    center: { x: number; y: number },
    neigh: SimNode[],
    centerR: number,
    centerLabel: string,
    freeW: number,
    freeH: number,
  ): Map<string, { x: number; y: number }> => {
    const targets = new Map<string, { x: number; y: number }>();
    if (neigh.length === 0) return targets;
    // Each partner's original angle + distance from the center.
    const items = neigh.map((n) => {
      const dx = (n.x ?? 0) - center.x;
      const dy = (n.y ?? 0) - center.y;
      return { n, angle: Math.atan2(dy, dx), d: Math.hypot(dx, dy) || 1 };
    });
    let maxNodeR = centerR;
    let dmin = Infinity;
    let dmax = 0;
    for (const it of items) {
      maxNodeR = Math.max(maxNodeR, it.n.r);
      dmin = Math.min(dmin, it.d);
      dmax = Math.max(dmax, it.d);
    }
    // Fan clustered angles out so the partners use the whole ellipse (left and
    // right included), not just the sector they happened to sit in.
    const angles = spreadAngles(items.map((it) => it.angle));
    // Ellipse semi-axes (world units) that fill ~fillFrac of the free area at the
    // target zoom. Per-axis, so a wide-but-short free area still fills across; it
    // re-fits when that area changes (a card-shape toggle).
    const fillFrac = 0.82;
    const floor = centerR + maxNodeR + 22;
    const rx = Math.max(floor, (fillFrac * freeW) / (2 * TARGET_FOCUS_K) - maxNodeR);
    const ry = Math.max(floor, (fillFrac * freeH) / (2 * TARGET_FOCUS_K) - maxNodeR);
    const denom = dmax - dmin;
    items.forEach((it, i) => {
      const a = angles[i];
      // Radial factor keeps relative order (farther stays farther) but never
      // below 0.72 of the ellipse, so nothing bunches near the core.
      const f = denom > 1 ? 0.72 + 0.28 * ((it.d - dmin) / denom) : 1;
      let px = center.x + Math.cos(a) * rx * f;
      let py = center.y + Math.sin(a) * ry * f;
      const ex = px - center.x;
      const ey = py - center.y;
      const ed = Math.hypot(ex, ey) || 1;
      const minD = centerR + it.n.r + 10;
      if (ed < minD) {
        px = center.x + (ex / ed) * minD;
        py = center.y + (ey / ed) * minD;
      }
      targets.set(it.n.id, { x: px, y: py });
    });
    relaxLabels(targets, neigh, center, centerR, centerLabel);
    return targets;
  };

  // Separate nodes so their LABEL boxes (not just the dots) never overlap, so the
  // draw pass never has to cull a partner word. Each node is an axis-aligned box
  // sized to its label (label sits under the dot); overlapping pairs are pushed
  // apart along the axis of least penetration (minimal nudge, so the arrangement
  // keeps its shape). The selected node is an immovable box so partners clear its
  // label too. Label widths are screen px, converted to world units at the target
  // zoom (the max zoom a focus ever uses).
  const relaxLabels = (
    targets: Map<string, { x: number; y: number }>,
    neigh: SimNode[],
    center: { x: number; y: number },
    centerR: number,
    centerLabel: string,
  ) => {
    const G = (5 + 13) / TARGET_FOCUS_K; // label gap + line height, world units
    const boxOf = (r: number, label: string, p: { x: number; y: number }, movable: boolean) => ({
      p,
      movable,
      halfW: Math.max(r, measureLabel(label) / (2 * TARGET_FOCUS_K) + 1),
      halfH: r + G / 2,
    });
    const arr = neigh
      .filter((n) => targets.get(n.id))
      .map((n) => boxOf(n.r, n.label, targets.get(n.id)!, true));
    arr.unshift(boxOf(centerR, centerLabel, { x: center.x, y: center.y }, false));

    for (let it = 0; it < 12; it++) {
      let moved = false;
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          if (!a.movable && !b.movable) continue;
          const dx = b.p.x - a.p.x;
          const dy = b.p.y - a.p.y;
          const ox = a.halfW + b.halfW - Math.abs(dx);
          const oy = a.halfH + b.halfH - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          moved = true;
          if (ox < oy) {
            const s = dx >= 0 ? 1 : -1;
            if (a.movable && b.movable) {
              a.p.x -= (s * ox) / 2;
              b.p.x += (s * ox) / 2;
            } else if (a.movable) a.p.x -= s * ox;
            else b.p.x += s * ox;
          } else {
            const s = dy >= 0 ? 1 : -1;
            if (a.movable && b.movable) {
              a.p.y -= (s * oy) / 2;
              b.p.y += (s * oy) / 2;
            } else if (a.movable) a.p.y -= s * oy;
            else b.p.y += s * oy;
          }
        }
      }
      if (!moved) break;
    }
  };

  // A transform that centers the selected node and its pulled-in partners in the
  // space the card leaves free (its shape depends on cardLayout). Uses the target
  // zoom (so the selection fills ~78% of that area, matching how focusTargets
  // sized it), but zooms out to fit if the arrangement is larger, so every
  // partner stays visible, including after a card-shape toggle.
  const frameFocus = (
    center: { x: number; y: number },
    centerR: number,
    centerLabel: string,
    targets: Map<string, { x: number; y: number }>,
    nodesById: Map<string, SimNode>,
    width: number,
    height: number,
  ) => {
    // Bounds include each node's LABEL (wider than the dot, and sitting below
    // it), so the fit never clips a word at the edge of the view.
    const G = (5 + 13) / TARGET_FOCUS_K;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    const extend = (px: number, py: number, r: number, label: string) => {
      const hx = Math.max(r, measureLabel(label) / (2 * TARGET_FOCUS_K) + 1);
      minX = Math.min(minX, px - hx);
      maxX = Math.max(maxX, px + hx);
      minY = Math.min(minY, py - r);
      maxY = Math.max(maxY, py + r + G);
    };
    extend(center.x, center.y, centerR, centerLabel);
    for (const [id, p] of targets) {
      const n = nodesById.get(id);
      extend(p.x, p.y, n?.r ?? 4, n?.label ?? "");
    }
    const [rx, ry, rw, rh] = freeRect(width, height, true, cardLayoutRef.current);
    const fitK = Math.min(rw / Math.max(maxX - minX, 1), rh / Math.max(maxY - minY, 1));
    const k = clampK(Math.max(MIN_FOCUS_K, Math.min(TARGET_FOCUS_K, fitK)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return { k, x: rx + rw / 2 - cx * k, y: ry + rh / 2 - cy * k };
  };

  // Tween node positions (and the camera) with an easeOut curve, pinning every
  // moved node (fx/fy) so the simulation cannot fight the animation. onDone
  // releases whichever nodes have finished returning home.
  const runFocusTween = (
    moves: PosMove[],
    fromT: { x: number; y: number; k: number },
    toT: { x: number; y: number; k: number },
    duration: number,
    onDone?: () => void,
  ) => {
    if (focusRafRef.current != null) cancelAnimationFrame(focusRafRef.current);
    // Freeze the simulation for the duration: its theme-centroid pull would
    // otherwise fight the pinned tween.
    simRef.current?.sim.stop();
    const apply = (e: number) => {
      for (const m of moves) {
        const x = m.from.x + (m.to.x - m.from.x) * e;
        const y = m.from.y + (m.to.y - m.from.y) * e;
        m.node.x = x;
        m.node.y = y;
        m.node.fx = x;
        m.node.fy = y;
      }
      transformRef.current = {
        k: fromT.k + (toT.k - fromT.k) * e,
        x: fromT.x + (toT.x - fromT.x) * e,
        y: fromT.y + (toT.y - fromT.y) * e,
      };
      drawRef.current();
    };
    if (prefersReducedMotion() || duration <= 0) {
      apply(1);
      onDone?.();
      return;
    }
    const start = performance.now();
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = () => {
      const p = Math.min((performance.now() - start) / duration, 1);
      apply(ease(p));
      if (p < 1) {
        focusRafRef.current = requestAnimationFrame(step);
      } else {
        focusRafRef.current = null;
        onDone?.();
      }
    };
    focusRafRef.current = requestAnimationFrame(step);
  };

  // Fan the current selection's partners out and frame them. Reads the live
  // selection via ref, so it can also re-run on a card-layout toggle.
  const layoutFocus = () => {
    const live = simRef.current;
    const container = containerRef.current;
    const selId = selectedRef.current;
    if (!live || !container || !selId) return;
    const nodesById = new Map(live.nodes.map((n) => [n.id, n]));
    const sel = nodesById.get(selId);
    if (!sel) return; // dormant selection (filtered out): nothing to arrange.
    const rect = container.getBoundingClientRect();
    const home = homePosRef.current;
    const neigh = [...(neighborsRef.current.get(selId) ?? [])]
      .map((id) => nodesById.get(id))
      .filter((n): n is SimNode => !!n);

    const center = { x: sel.x ?? 0, y: sel.y ?? 0 };
    const [, , frw, frh] = freeRect(rect.width, rect.height, true, cardLayoutRef.current);
    const targets = focusTargets(center, neigh, sel.r, sel.label, frw, frh);
    if (!home.has(sel.id)) home.set(sel.id, { x: center.x, y: center.y });

    const keep = new Set<string>([sel.id, ...neigh.map((n) => n.id)]);
    const moves: PosMove[] = [];
    for (const n of neigh) {
      if (!home.has(n.id)) home.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      moves.push({ node: n, from: { x: n.x ?? 0, y: n.y ?? 0 }, to: targets.get(n.id)! });
    }
    moves.push({ node: sel, from: center, to: center });

    // Nodes displaced by a previous selection that are not part of this one
    // animate home in the same pass and are released when the tween ends.
    const returning: string[] = [];
    for (const [id, h] of home) {
      if (keep.has(id)) continue;
      const n = nodesById.get(id);
      if (!n) continue;
      returning.push(id);
      moves.push({ node: n, from: { x: n.x ?? 0, y: n.y ?? 0 }, to: { x: h.x, y: h.y } });
    }

    const toT = frameFocus(center, sel.r, sel.label, targets, nodesById, rect.width, rect.height);
    runFocusTween(moves, transformRef.current, toT, FOCUS_MS, () => {
      for (const id of returning) {
        const n = nodesById.get(id);
        if (n) {
          n.fx = null;
          n.fy = null;
        }
        home.delete(id);
      }
    });
  };

  // Send every displaced node home, then release its pin (deselect).
  const restoreHome = () => {
    const live = simRef.current;
    if (!live) return;
    const home = homePosRef.current;
    if (home.size === 0) return;
    const nodesById = new Map(live.nodes.map((n) => [n.id, n]));
    const moves: PosMove[] = [];
    const ids: string[] = [];
    for (const [id, h] of home) {
      const n = nodesById.get(id);
      if (!n) continue;
      ids.push(id);
      moves.push({ node: n, from: { x: n.x ?? 0, y: n.y ?? 0 }, to: { x: h.x, y: h.y } });
    }
    const t = transformRef.current;
    runFocusTween(moves, t, t, RETURN_MS, () => {
      for (const id of ids) {
        const n = nodesById.get(id);
        if (n) {
          n.fx = null;
          n.fy = null;
        }
      }
      home.clear();
    });
  };

  // Drive the focus layout whenever the selection changes.
  useEffect(() => {
    const present = !!(selectedId && simRef.current?.nodes.some((n) => n.id === selectedId));
    if (present) layoutFocus();
    else restoreHome();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const zoomBy = (factor: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const t = transformRef.current;
    const nextK = clampK(t.k * factor);
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const wx = (cx - t.x) / t.k;
    const wy = (cy - t.y) / t.k;
    transformRef.current = { k: nextK, x: cx - wx * nextK, y: cy - wy * nextK };
    scheduleDraw();
  };

  const fitView = () => {
    // Fit into the area the card leaves free, so "Einpassen" frames nicely
    // whether or not a node is selected. A dormant selection (filtered out of
    // the graph, no card showing) does not count.
    const hasCard = !!(selectedRef.current && nodeById.has(selectedRef.current));
    refitForLayout(cardLayoutRef.current, hasCard);
  };

  // Switch the card between the bottom-bar and side-panel shapes, then
  // re-center the constellation into the newly-free area (founder request).
  // The side effects run outside the state updater (a functional setState
  // updater must stay pure; React may invoke it more than once per commit).
  const toggleLayout = () => {
    const next = cardLayout === "horizontal" ? "vertical" : "horizontal";
    cardLayoutRef.current = next;
    setCardLayout(next);
    // With a node selected, its partners are already fanned out; just re-frame
    // that ring into the area the new card shape leaves free. Otherwise fit the
    // whole constellation.
    if (selectedRef.current && nodeById.has(selectedRef.current)) layoutFocus();
    else refitForLayout(next, true);
  };

  // Fit button toggles (same behavior as the Wörter graph): whole-constellation
  // overview ↔ zoom into a random, well-connected node. The pick is weighted by
  // node area (bigger = more connections here) among the nodes the active legend
  // filter allows, and never the node already selected, so each press lands on a
  // new node and always animates the transition.
  const fitOrZoomRef = useRef<"fit" | "word">("fit");
  const zoomToWord = () => {
    const live = simRef.current;
    if (!live || live.nodes.length === 0) return;
    const pool = live.nodes.filter(
      (n) =>
        (domainFilter.size === 0 || domainFilter.has(lifeAreaOf(n.domain))) &&
        (kindFilter.size === 0 || kindFilter.has(n.kind)),
    );
    const base = pool.length > 0 ? pool : live.nodes;
    const fresh = base.filter((n) => n.id !== selectedRef.current);
    const nodes = fresh.length > 0 ? fresh : base;
    let total = 0;
    for (const n of nodes) total += n.r * n.r;
    let pick = nodes[0];
    let r = Math.random() * total;
    for (const n of nodes) {
      r -= n.r * n.r;
      if (r <= 0) {
        pick = n;
        break;
      }
    }
    // Selecting it runs the focus effect, which animates the pull-in + zoom.
    setSelectedId(pick.id);
  };
  const onFitButton = () => {
    if (fitOrZoomRef.current === "fit") {
      fitView();
      fitOrZoomRef.current = "word";
    } else {
      zoomToWord();
      fitOrZoomRef.current = "fit";
    }
  };

  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const selectedPartners = selectedId ? (partners.get(selectedId) ?? []) : [];
  const exampleColl =
    selectedPartners.length > 0 ? collById.get(selectedPartners[0].collocationId) : undefined;

  // Group the partner chips by the SELECTED node's own surface form in each
  // collocation. A merged singular/plural node ("die Beschwerde" + "Beschwerden")
  // is one node now, but the card still shows which verbs each form takes, so the
  // number distinction stays visible (founder: merge, but differentiate in the
  // pop-up). The leading article is stripped for grouping so "die Beschwerden"
  // and "Beschwerden" fall into ONE group (they differ only by article); only a
  // real singular vs plural difference splits into two. 2+ groups → rendered as
  // labelled sections; insertion order preserved.
  const partnerGroups = useMemo(() => {
    if (!selected) return [];
    const groups = new Map<string, { partnerId: string; collocationId: string }[]>();
    for (const p of selectedPartners) {
      const c = collById.get(p.collocationId);
      const raw = (selected.kind === "noun" ? c?.noun : c?.verb)?.trim() || selected.label;
      const surface = raw.replace(ARTICLE_RE, "").trim() || raw;
      if (!groups.has(surface)) groups.set(surface, []);
      groups.get(surface)!.push(p);
    }
    return Array.from(groups, ([surface, ps]) => ({ surface, partners: ps }));
  }, [selected, selectedPartners, collById]);

  const renderPartnerChip = (p: { partnerId: string; collocationId: string }) => {
    const pn = nodeById.get(p.partnerId);
    if (!pn) return null;
    return (
      <button
        key={p.partnerId}
        onClick={() => setSelectedId(p.partnerId)}
        className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10"
      >
        {pn.label}
      </button>
    );
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Waypoints}
        title="Keine Kollokationen im Graph"
        description="Lockere Filter oder Suche, dann erscheinen hier Nomen, Verben und ihre Verbindungen."
      />
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative h-[46dvh] min-h-[300px] w-full touch-none overflow-hidden rounded-xl border border-border bg-surface sm:h-[62dvh] sm:min-h-[440px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label={`Interaktiver Kollokationen-Graph: ${graph.nodes.length} Nomen und Verben, ${graph.links.length} Verbindungen. Tippen wählt einen Knoten aus, Ziehen verschiebt die Ansicht.`}
          title="Strg/Cmd + Scrollen zum Zoomen"
        />

        {/* Zoom controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-1">
          <button
            onClick={() => zoomBy(1.35)}
            aria-label="Vergrößern"
            className="rounded-lg border border-border bg-surface/90 p-1.5 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-foreground"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            onClick={() => zoomBy(1 / 1.35)}
            aria-label="Verkleinern"
            className="rounded-lg border border-border bg-surface/90 p-1.5 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-foreground"
          >
            <Minus className="h-4 w-4" />
          </button>
          <button
            onClick={onFitButton}
            aria-label="Einpassen, erneut tippen für einen zufälligen Knoten"
            title="Einpassen · nochmal für einen zufälligen Knoten"
            className="rounded-lg border border-border bg-surface/90 p-1.5 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-foreground"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        {/* Selected node card: its partners on the other side of the bipartite
            map. Two shapes, toggled from the button beside the close: a full-width
            bar along the bottom ("horizontal") or a full-height panel down the
            right ("vertical"). Keep these sizes in lockstep with cardExtent(). */}
        {selected && (
          <div
            className={cn(
              // Float clear of the canvas edges by the same gap the Wörter graph
              // card uses (bottom-3 / left-3 / right-3), fully rounded + bordered.
              "absolute z-10 flex flex-col rounded-xl border border-border bg-surface/95 shadow-elevated-soft backdrop-blur",
              cardLayout === "horizontal"
                ? "bottom-3 left-3 right-3 h-[42%] max-h-[260px]"
                : "bottom-3 right-3 top-3 w-[42%] max-w-[360px]",
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-2 p-3 pb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-base font-semibold">{selected.label}</p>
                  <SpeakButton text={selected.label} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {selected.kind === "noun" ? "Nomen" : "Verb"} ·{" "}
                  {selectedPartners.length} Verbindung{selectedPartners.length !== 1 ? "en" : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  onClick={toggleLayout}
                  aria-label={
                    cardLayout === "horizontal"
                      ? "Als Seitenleiste anzeigen"
                      : "Als Leiste unten anzeigen"
                  }
                  title="Ausrichtung wechseln"
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {cardLayout === "horizontal" ? (
                    <PanelRight className="h-4 w-4" />
                  ) : (
                    <PanelBottom className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Auswahl schließen"
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
              <div className="flex flex-wrap gap-1.5 border-t border-border pt-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {selected.kind === "noun" ? "Verben" : "Nomen"}
                </span>
              </div>
              {partnerGroups.length > 1 ? (
                // Merged node with more than one surface form (e.g. singular +
                // plural): show each form and the partners it takes.
                <div className="mt-1 space-y-2">
                  {partnerGroups.map((grp) => (
                    <div key={grp.surface}>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-semibold text-foreground">{grp.surface}</span>
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {grp.partners.length}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {grp.partners.map(renderPartnerChip)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedPartners.map(renderPartnerChip)}
                </div>
              )}

              {exampleColl && (
                <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
                  „{exampleColl.example.de}"
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend + connection count. The domain colors and the Nomen/Verben types
          both double as filters (tap to isolate; tap again to clear). Centered
          on both breakpoints, wrapping so every entry is visible without scroll. */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {(["noun", "verb"] as const).map((kind) => {
          const on = kindFilter.has(kind);
          const dimmed = kindFilter.size > 0 && !on;
          return (
            <button
              key={kind}
              type="button"
              onClick={() => toggleKind(kind)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors",
                on ? "border-primary/40 bg-primary/10 text-foreground" : "border-transparent hover:bg-muted/60",
                dimmed && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "h-2.5 w-2.5 shrink-0 rounded-full",
                  kind === "verb" ? "border-2 border-current bg-transparent" : "bg-current",
                )}
              />
              {kind === "noun" ? "Nomen" : "Verben"}
            </button>
          );
        })}
        <span className="text-border">·</span>
        {presentDomains.map((d) => {
          const color = LIFE_AREA_COLORS[d.id][isDark ? "dark" : "light"];
          const on = domainFilter.has(d.id);
          const dimmed = domainFilter.size > 0 && !on;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDomain(d.id)}
              aria-pressed={on}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors",
                on ? "border-primary/40 bg-primary/10 text-foreground" : "border-transparent hover:bg-muted/60",
                dimmed && "opacity-40",
              )}
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              {d.titleDe}
            </button>
          );
        })}
        <span className="tabular-nums">
          {visibleLinkCount} Verbindung{visibleLinkCount !== 1 ? "en" : ""}
        </span>
      </div>
    </div>
  );
}
