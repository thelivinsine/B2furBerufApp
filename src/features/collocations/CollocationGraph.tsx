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
import { domains } from "@/data/domains";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EmptyState } from "@/components/shared/misc";
import { useIsDark } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { domainColor } from "@/lib/graphPalette";
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
  register?: "neutral" | "formal";
  collocationId: string;
}

const MIN_K = 0.1;
const MAX_K = 6;
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

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
    const R = 140 + N * 30;
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

  selectedRef.current = selectedId;
  cardLayoutRef.current = cardLayout;
  darkRef.current = isDark;
  neighborsRef.current = neighbors;
  domainFilterRef.current = domainFilter;
  kindFilterRef.current = kindFilter;

  // Domains actually on screen, for the legend.
  const presentDomains = useMemo(() => {
    const present = new Set(graph.nodes.map((n) => n.domain).filter(Boolean));
    return domains.filter((d) => present.has(d.id));
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
  const fitToRect = (nodes: SimNode[], rx: number, ry: number, rw: number, rh: number) => {
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
    transformRef.current = {
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
    fitToRect(live.nodes, rx, ry, rw, rh);
    scheduleDraw();
  };

  // ── Simulation + rendering ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
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
          .strength(0.18),
      )
      .force("charge", forceManyBody<SimNode>().strength(-42).distanceMax(260))
      .force("collide", forceCollide<SimNode>((d) => d.r + 3))
      // Theme-centroid pull: this is what forms the islands.
      .force("x", forceX<SimNode>((d) => centroidOf(d).x).strength(0.13))
      .force("y", forceY<SimNode>((d) => centroidOf(d).y).strength(0.13))
      .stop();
    simRef.current = { sim, nodes, links };

    // Settle past the initial motion off-screen, then animate gently.
    sim.tick(160);

    // Open on the WHOLE constellation, fully zoomed out (the headline goal),
    // not zoomed into a hub. Fit-to-all with padding.
    if (!fittedRef.current && nodes.length > 0) {
      fittedRef.current = true;
      // No card on open, so fit into the whole canvas.
      fitToRect(nodes, ...freeRect(width, height, false, cardLayoutRef.current));
    }

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

      const focus = hoverRef.current ?? selectedRef.current;
      const focusSet = focus
        ? new Set([focus, ...(neighborsRef.current.get(focus) ?? [])])
        : null;

      const domFilter = domainFilterRef.current;
      const kindF = kindFilterRef.current;
      const isActive = (n: SimNode) =>
        (domFilter.size === 0 || domFilter.has(n.domain ?? "")) &&
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
        else if (focusSet === null) alpha = dark ? 0.16 : 0.14;
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

        const color = lit ? domainColor(s.domain, dark) : dark ? "148,163,184" : "100,116,139";
        ctx.strokeStyle = lit
          ? hexToRgba(domainColor(s.domain, dark), alpha)
          : `rgba(${color},${alpha})`;
        ctx.lineWidth = (lit ? 1.8 : 1) / k;
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
        const color = domainColor(n.domain, dark);
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
        const color = domainColor(n.domain, dark);
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

      // ── Labels (screen space, crisp). Fade in with zoom; focus always shows.
      const zoomAlpha = Math.min(Math.max((k - 0.7) / 0.6, 0), 1);
      if (zoomAlpha > 0 || focusSet) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelColor = dark ? "226,232,240" : "51,65,85";
        for (const n of nodes) {
          const x = n.x ?? 0;
          const y = n.y ?? 0;
          if (x < worldLeft || x > worldRight || y < worldTop || y > worldBottom) continue;
          if (!isActive(n)) continue;
          const inFocus = focusSet?.has(n.id) ?? false;
          // Big hubs label a touch earlier so the map reads at zoom-out.
          const hubBoost = Math.min(n.degree / 40, 0.5);
          const alpha = focusSet ? (inFocus ? 1 : 0) : Math.min(zoomAlpha + hubBoost, 1);
          if (alpha <= 0.02) continue;
          ctx.font = `${n.kind === "verb" ? "italic " : ""}500 10px ${fontFamily}`;
          ctx.fillStyle = `rgba(${labelColor},${alpha})`;
          ctx.fillText(n.label, x * k + tx, (y + n.r) * k + ty + 3);
        }
      }
    };
    drawRef.current = draw;

    sim.on("tick", scheduleDraw);
    sim.alpha(0.08).restart();
    scheduleDraw();

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
        dragNode = null;
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
      if (dragNode) {
        dragNode.fx = null;
        dragNode.fy = null;
        sim.alphaTarget(0);
      }
      if (p && moved < 5) {
        const hit = hitTest(p.x, p.y);
        setSelectedId(hit ? hit.id : null);
        scheduleDraw();
      }
      dragNode = null;
    };
    const onWheel = (e: WheelEvent) => {
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
      for (const n of nodes) posRef.current.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      sim.stop();
      ro.disconnect();
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
    // whether or not a node is selected.
    refitForLayout(cardLayoutRef.current, !!selectedRef.current);
  };

  // Switch the card between the bottom-bar and side-panel shapes, then
  // re-center the constellation into the newly-free area (founder request).
  const toggleLayout = () => {
    setCardLayout((l) => {
      const next = l === "horizontal" ? "vertical" : "horizontal";
      cardLayoutRef.current = next;
      refitForLayout(next, true);
      return next;
    });
  };

  // Fit button toggles: whole-constellation overview ↔ zoom into the biggest hub.
  const fitOrZoomRef = useRef<"fit" | "hub">("fit");
  const zoomToHub = () => {
    const container = containerRef.current;
    const live = simRef.current;
    if (!container || !live || live.nodes.length === 0) return;
    const rect = container.getBoundingClientRect();
    let pick = live.nodes[0];
    for (const n of live.nodes) if (n.degree > pick.degree) pick = n;
    const k = clampK(2.8);
    transformRef.current = {
      k,
      x: rect.width / 2 - (pick.x ?? 0) * k,
      y: rect.height / 2 - (pick.y ?? 0) * k,
    };
    setSelectedId(pick.id);
    scheduleDraw();
  };
  const onFitButton = () => {
    if (fitOrZoomRef.current === "fit") {
      fitView();
      fitOrZoomRef.current = "hub";
    } else {
      zoomToHub();
      fitOrZoomRef.current = "fit";
    }
  };

  const selected = selectedId ? nodeById.get(selectedId) : undefined;
  const selectedPartners = selectedId ? (partners.get(selectedId) ?? []) : [];
  const exampleColl =
    selectedPartners.length > 0 ? collById.get(selectedPartners[0].collocationId) : undefined;

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
        <canvas ref={canvasRef} className="block h-full w-full" />

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
            aria-label="Einpassen, erneut tippen für den größten Knoten"
            title="Einpassen · nochmal für den größten Knoten"
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
              "absolute z-10 flex flex-col border-border bg-surface/95 shadow-elevated-soft backdrop-blur",
              cardLayout === "horizontal"
                ? "inset-x-0 bottom-0 h-[42%] max-h-[260px] rounded-t-xl border-t"
                : "inset-y-0 right-0 w-[42%] max-w-[360px] rounded-l-xl border-l",
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
              <div className="mt-1 flex flex-wrap gap-1.5">
                {selectedPartners.map((p) => {
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
                })}
              </div>

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
          const color = domainColor(d.id, isDark);
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
          {graph.links.length} Verbindung{graph.links.length !== 1 ? "en" : ""}
        </span>
      </div>
    </div>
  );
}
