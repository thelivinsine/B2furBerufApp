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
import { Maximize, Minus, Plus, Waypoints, X } from "lucide-react";
import type { VocabItem } from "@/types";
import { collocations } from "@/data/collocations";
import { themeById } from "@/data/themes";
import { domains } from "@/data/domains";
import { Badge } from "@/components/ui/badge";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EmptyState } from "@/components/shared/misc";
import { useIsDark } from "@/lib/useTheme";
import { cn } from "@/lib/utils";
import { frequencyBin } from "@/data/frequency";
import { DOMAIN_COLORS, FALLBACK_COLOR } from "@/lib/graphPalette";
import { buildWordGraph, type GraphNode } from "./wordGraph";
import { SaveButton } from "./VocabViews";

/**
 * The Wörter graph view (Bibliothek views, session 91): an Obsidian-style
 * force-directed map of the CURRENTLY FILTERED vocabulary. Node size = real
 * usage (wordfreq Zipf), node color = domain, links = authored `related`
 * terms + collocation pairs (see wordGraph.ts). Canvas-rendered so 642 nodes
 * stay smooth on a phone; pinch/wheel zooms, drag pans (or moves a node),
 * tap selects a word and dims everything not connected to it.
 *
 * This file lives in its own lazy chunk (React.lazy in VocabularyTrainer):
 * d3-force must never ride into the main bundle.
 */
interface SimNode extends SimulationNodeDatum, GraphNode {}
interface SimLink extends SimulationLinkDatum<SimNode> {
  kind: "related" | "collocation";
}

// One node's animated move from its current spot to a target (ring or home).
type PosMove = { node: SimNode; from: { x: number; y: number }; to: { x: number; y: number } };

// Domain colors are shared with the Kollokationen graph via graphPalette.ts.

const FREQ_LABEL: Record<string, string> = {
  core: "Kernwortschatz",
  common: "häufig",
  specialized: "Fachsprache",
};

const domainOf = (themeId: string) => themeById(themeId)?.domain;
const nodeColor = (n: GraphNode, dark: boolean) => {
  const d = domainOf(n.themeId);
  const c = (d && DOMAIN_COLORS[d]) || FALLBACK_COLOR;
  return dark ? c.dark : c.light;
};

const MIN_K = 0.15;
const MAX_K = 6;
const clampK = (k: number) => Math.min(MAX_K, Math.max(MIN_K, k));

// Safety cap on the cross-filter position cache (see posRef); real bank sizes
// stay far under this, it only guards against unbounded growth.
const MAX_CACHED_POSITIONS = 4000;

// Estimated height of the selected-word card (badges + example line) so the
// view can pan clear of it instead of letting it cover the tapped node.
const CARD_CLEARANCE = 190;

// Focus-layout timing + zoom guards (word-selection distribution): on select a
// word's connections fan out onto even rings around it and the view zooms to a
// comfortable level (never the too-far-out overview a prior fit-to-screen would
// otherwise keep); on deselect every displaced node animates back home.
const FOCUS_MS = 480;
const RETURN_MS = 420;
const MIN_FOCUS_K = 1.5;
// Comfortable zoom the pull-in layout sizes its arrangement against, so a
// selection fills most of the window and lands neither cramped nor tiny.
const TARGET_FOCUS_K = 2.3;

export default function WordGraph({ items }: { items: VocabItem[] }) {
  const isDark = useIsDark();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Domain legend doubles as a filter (founder 2026-07-13): tapping a domain
  // toggles it; an empty set means "all domains". Non-selected domains dim on
  // the canvas. A ref mirrors it so draw() reads it without a React re-render.
  const [domainFilter, setDomainFilter] = useState<Set<string>>(new Set());
  const toggleDomain = (id: string) =>
    setDomainFilter((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const graph = useMemo(() => buildWordGraph(items, collocations), [items]);
  const itemById = useMemo(() => new Map(items.map((v) => [v.id, v])), [items]);
  const nodeThemeById = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id, n.themeId])),
    [graph],
  );
  // The legend count only counts edges whose BOTH ends pass the active domain
  // filter, so it matches what's actually lit up on screen instead of the raw
  // (unfiltered) total.
  const visibleLinkCount = useMemo(() => {
    if (domainFilter.size === 0) return graph.links.length;
    let count = 0;
    for (const l of graph.links) {
      const sd = domainOf(nodeThemeById.get(l.source) ?? "");
      const td = domainOf(nodeThemeById.get(l.target) ?? "");
      if (sd && td && domainFilter.has(sd) && domainFilter.has(td)) count++;
    }
    return count;
  }, [graph, domainFilter, nodeThemeById]);
  const neighbors = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const l of graph.links) {
      if (!m.has(l.source)) m.set(l.source, new Set());
      if (!m.has(l.target)) m.set(l.target, new Set());
      m.get(l.source)!.add(l.target);
      m.get(l.target)!.add(l.source);
    }
    return m;
  }, [graph]);

  // Domains actually on screen, for the legend.
  const presentDomains = useMemo(() => {
    const present = new Set(graph.nodes.map((n) => domainOf(n.themeId)).filter(Boolean));
    return domains.filter((d) => present.has(d.id));
  }, [graph]);

  // Mutable rendering state, read by draw() via refs so pan/zoom/hover never
  // re-render React. Node positions survive filter changes (posRef).
  const simRef = useRef<{ sim: Simulation<SimNode, SimLink>; nodes: SimNode[]; links: SimLink[] } | null>(null);
  const posRef = useRef(new Map<string, { x: number; y: number }>());
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const fittedRef = useRef(false);
  const hoverRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const darkRef = useRef(isDark);
  const domainFilterRef = useRef(domainFilter);
  const neighborsRef = useRef(neighbors);
  const rafRef = useRef<number | null>(null);
  const drawRef = useRef<() => void>(() => {});
  // Original ("home") position of every node the focus layout has displaced, so
  // a deselect can animate them back. focusRafRef owns the focus/return tween.
  const homePosRef = useRef(new Map<string, { x: number; y: number }>());
  const focusRafRef = useRef<number | null>(null);

  selectedRef.current = selectedId;
  darkRef.current = isDark;
  neighborsRef.current = neighbors;

  const scheduleDraw = () => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawRef.current();
    });
  };

  const fitToNodes = (nodes: SimNode[], width: number, height: number) => {
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
    const pad = 32;
    const k = clampK(
      Math.min((width - pad) / Math.max(maxX - minX, 1), (height - pad) / Math.max(maxY - minY, 1)),
    );
    transformRef.current = {
      k,
      x: width / 2 - ((minX + maxX) / 2) * k,
      y: height / 2 - ((minY + maxY) / 2) * k,
    };
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
      // corner and the graph appeared to jump off-center.
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

    // Nodes reuse their last position (filter tweaks shift the map instead of
    // rebuilding it from scratch); genuinely new nodes get d3's phyllotaxis
    // default, which is deterministic.
    const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n, ...posRef.current.get(n.id) }));
    const links: SimLink[] = graph.links.map((l) => ({ ...l }));

    const sim = forceSimulation<SimNode>(nodes)
      .force(
        "link",
        forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance((l) => 26 + (l.source as SimNode).r + (l.target as SimNode).r)
          .strength(0.3),
      )
      .force("charge", forceManyBody<SimNode>().strength(-55).distanceMax(320))
      .force("collide", forceCollide<SimNode>((d) => d.r + 3))
      // Weak centering keeps unlinked words in the same cloud instead of
      // letting the charge blow them off-screen.
      .force("x", forceX<SimNode>(0).strength(0.045))
      .force("y", forceY<SimNode>(0).strength(0.045))
      .stop();
    simRef.current = { sim, nodes, links };

    const nodeIds = new Set(nodes.map((n) => n.id));

    const draw = () => {
      const { x: tx, y: ty, k } = transformRef.current;
      const dark = darkRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty);

      // Ignore a selection that is not in the current graph (a filter change
      // can remove the selected word): the dead id has no card but would still
      // drive the focus dimming, ghosting the whole canvas. The selection
      // simply goes dormant and revives if the word comes back into filter.
      const rawFocus = hoverRef.current ?? selectedRef.current;
      const focus = rawFocus !== null && nodeIds.has(rawFocus) ? rawFocus : null;
      const focusSet = focus
        ? new Set([focus, ...(neighborsRef.current.get(focus) ?? [])])
        : null;

      // Domain legend filter: when non-empty, nodes/links outside the selected
      // domains dim out (like the focus dimming).
      const domFilter = domainFilterRef.current;
      const domActive = (n: SimNode) => domFilter.size === 0 || domFilter.has(domainOf(n.themeId) ?? "");

      // Viewport in world coordinates, for culling.
      const worldLeft = -tx / k;
      const worldTop = -ty / k;
      const worldRight = worldLeft + width / k;
      const worldBottom = worldTop + height / k;

      // Links first, under the nodes.
      const baseLink = dark ? "rgba(148,163,184,0.16)" : "rgba(100,116,139,0.18)";
      const litLink = dark ? "rgba(138,138,242,0.85)" : "rgba(91,91,230,0.65)";
      const dimLink = dark ? "rgba(148,163,184,0.05)" : "rgba(100,116,139,0.06)";
      for (const l of links) {
        const s = l.source as SimNode;
        const t = l.target as SimNode;
        const lit =
          focusSet !== null && (s.id === focus || t.id === focus);
        const domOk = domActive(s) && domActive(t);
        ctx.strokeStyle = !domOk ? dimLink : focusSet === null ? baseLink : lit ? litLink : dimLink;
        ctx.lineWidth = (lit ? 1.6 : 1) / k;
        ctx.beginPath();
        ctx.moveTo(s.x ?? 0, s.y ?? 0);
        ctx.lineTo(t.x ?? 0, t.y ?? 0);
        ctx.stroke();
      }

      // Nodes.
      const ringColor = dark ? "#0f172a" : "#ffffff";
      for (const n of nodes) {
        const x = n.x ?? 0;
        const y = n.y ?? 0;
        if (x + n.r < worldLeft || x - n.r > worldRight || y + n.r < worldTop || y - n.r > worldBottom)
          continue;
        const dimmed = (focusSet !== null && !focusSet.has(n.id)) || !domActive(n);
        ctx.globalAlpha = dimmed ? 0.12 : 1;
        ctx.fillStyle = nodeColor(n, dark);
        ctx.beginPath();
        ctx.arc(x, y, n.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ringColor;
        ctx.lineWidth = 1 / k;
        ctx.stroke();
        if (n.id === selectedRef.current) {
          ctx.strokeStyle = nodeColor(n, dark);
          ctx.lineWidth = 2 / k;
          ctx.beginPath();
          ctx.arc(x, y, n.r + 3 / k, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Labels in screen space (crisp at any zoom). They fade in as you zoom;
      // the focused word and its neighbors always read. Collision-culled (same
      // approach as the Kollokationen graph) so labels never overlap at busy
      // zoom levels: candidates are ranked (focused first, then bigger/more
      // frequent words) and a label is skipped once its box would overlap one
      // already placed.
      const zoomAlpha = Math.min(Math.max((k - 0.85) / 0.5, 0), 1);
      if (zoomAlpha > 0 || focusSet) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `500 10px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelColor = dark ? "203,213,225" : "51,65,85";

        const cands: { n: SimNode; alpha: number }[] = [];
        for (const n of nodes) {
          const x = n.x ?? 0;
          const y = n.y ?? 0;
          if (x < worldLeft || x > worldRight || y < worldTop || y > worldBottom) continue;
          if (!domActive(n)) continue;
          const inFocus = focusSet?.has(n.id) ?? false;
          const alpha = focusSet ? (inFocus ? 1 : 0) : zoomAlpha;
          if (alpha <= 0) continue;
          cands.push({ n, alpha });
        }
        cands.sort((a, b) => {
          if (a.n.id === selectedRef.current) return -1;
          if (b.n.id === selectedRef.current) return 1;
          return b.n.r - a.n.r;
        });

        const placed: { l: number; t: number; r: number; b: number }[] = [];
        const hits = (r: { l: number; t: number; r: number; b: number }) =>
          placed.some((d) => !(r.r < d.l || r.l > d.r || r.b < d.t || r.t > d.b));
        for (const { n, alpha } of cands) {
          const w = ctx.measureText(n.label).width;
          const sx = (n.x ?? 0) * k + tx;
          const sy = ((n.y ?? 0) + n.r) * k + ty + 3;
          const box = { l: sx - w / 2 - 2, t: sy - 2, r: sx + w / 2 + 2, b: sy + 12 + 2 };
          if (hits(box)) continue;
          placed.push(box);
          ctx.fillStyle = `rgba(${labelColor},${alpha})`;
          ctx.fillText(n.label, sx, sy);
        }
      }
    };
    drawRef.current = draw;

    // ── Warmup: settle past the initial explosion, then animate gently ─────
    // This used to be one synchronous sim.tick(120), which froze the main
    // thread for ~1s on desktop (multi-second on phones) on every open AND
    // every filter change. The warmup now runs in requestAnimationFrame
    // slices with a per-frame time budget, so the page stays responsive.
    // A rebuild where most nodes kept their previous positions (a filter
    // tweak) is already settled and only needs a short warmup.
    const cachedShare =
      nodes.length > 0
        ? nodes.filter((n) => posRef.current.has(n.id)).length / nodes.length
        : 0;
    let warmTicksLeft = cachedShare > 0.5 ? 20 : 120;
    let warmRaf: number | null = null;
    const finishWarmup = () => {
      if (!fittedRef.current && nodes.length > 0) {
        fittedRef.current = true;
        // Open zoomed INTO a dense area at a readable zoom (founder 2026-07-13),
        // not the fit-all overview. k≈3.4 makes the big nodes and their labels
        // read comfortably on a phone (the whole-graph fit sits behind the
        // fit-to-screen button). Center on a node picked WEIGHTED BY AREA
        // (r² ∝ wordfreq), so the opening view reliably lands among common,
        // well-connected words instead of a lone rare word in an empty corner.
        // Not selected on open, so no card covers the map.
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
        const k = clampK(3.4);
        transformRef.current = {
          k,
          x: width / 2 - (pick.x ?? 0) * k,
          y: height / 2 - (pick.y ?? 0) * k,
        };
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
        // Release a half-started node drag properly. Without this the touched
        // node kept fx/fy forever (permanently pinned in a graph that does not
        // pin) and alphaTarget stayed at 0.25, so the sim never slept again
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
        // Pure hover (mouse, no button): highlight the word under the cursor.
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
      }
      // Cool down whenever the last pointer lifts, drag or not, so the sim
      // always goes back to sleep (belt and braces against a hot alphaTarget).
      if (pointers.size === 0) sim.alphaTarget(0);
      // A tap (barely moved): select the word, or clear on empty space.
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
      // The old node objects are discarded; drop the displacement bookkeeping so
      // the rebuilt graph starts fresh.
      homePosRef.current = new Map();
      if (focusRafRef.current != null) cancelAnimationFrame(focusRafRef.current);
      focusRafRef.current = null;
      // Safety cap: the cache is meant to survive filter changes (bounded by
      // the vocab bank size in practice), but evict the oldest entries if it
      // ever grows past a generous ceiling instead of growing unbounded.
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
  }, [graph]);

  // Theme flips and selection changes only need a repaint, not a new sim.
  useEffect(() => {
    scheduleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, selectedId, domainFilter]);

  // ── Focus layout: pull a word's connections in so they all fit on screen ──
  // Selecting a word keeps each connection in the SAME DIRECTION it already sat
  // (so the map still reads like one big nodal graph) and only contracts the
  // spokes that reach off-screen, pulling them inward until every neighbor is
  // visible. The view then zooms to a comfortable level; deselecting animates
  // every displaced node back to its stored home.
  const prefersReducedMotion = () =>
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  // Target positions that preserve each neighbor's direction from the selected
  // word and only shorten over-long spokes so the whole set fits the free area.
  // A light collision pass separates any neighbors that end up overlapping,
  // without disturbing the overall (organic) arrangement.
  const focusTargets = (
    center: { x: number; y: number },
    neigh: SimNode[],
    centerR: number,
    freeW: number,
    freeH: number,
  ): Map<string, { x: number; y: number }> => {
    const targets = new Map<string, { x: number; y: number }>();
    if (neigh.length === 0) return targets;
    // Each neighbor's spoke offset from the selected word.
    const spokes = neigh.map((n) => ({
      n,
      dx: (n.x ?? 0) - center.x,
      dy: (n.y ?? 0) - center.y,
    }));
    // Arrangement extent at scale 1 (spoke positions) + the biggest node radius.
    let halfW = centerR;
    let halfH = centerR;
    let maxNodeR = centerR;
    for (const s of spokes) {
      halfW = Math.max(halfW, Math.abs(s.dx));
      halfH = Math.max(halfH, Math.abs(s.dy));
      maxNodeR = Math.max(maxNodeR, s.n.r);
    }
    // Scale the arrangement to fill ~fillFrac of the free area at the target
    // zoom, so the selection uses most of the window instead of leaving big
    // empty margins. The scale is per-axis (so a wide-but-short free area still
    // fills across), but the two axes are kept within RATIO of each other so the
    // spokes only stretch mildly and still read like the original directions.
    // Because it keys off the free area it re-fits whenever that area changes
    // (a card-shape toggle), keeping every neighbor visible.
    const fillFrac = 0.82;
    const availW = (fillFrac * freeW) / (2 * TARGET_FOCUS_K) - maxNodeR;
    const availH = (fillFrac * freeH) / (2 * TARGET_FOCUS_K) - maxNodeR;
    let sx = halfW > 1 ? availW / halfW : 8;
    let sy = halfH > 1 ? availH / halfH : 8;
    const RATIO = 2.0;
    if (sx > sy * RATIO) sx = sy * RATIO;
    if (sy > sx * RATIO) sy = sx * RATIO;
    sx = Number.isFinite(sx) && sx > 0 ? Math.min(sx, 8) : 1;
    sy = Number.isFinite(sy) && sy > 0 ? Math.min(sy, 8) : 1;
    for (const s of spokes) {
      let px = center.x + s.dx * sx;
      let py = center.y + s.dy * sy;
      // Keep each neighbor clear of the selected node.
      const ex = px - center.x;
      const ey = py - center.y;
      const ed = Math.hypot(ex, ey) || 1;
      const minD = centerR + s.n.r + 8;
      if (ed < minD) {
        px = center.x + (ex / ed) * minD;
        py = center.y + (ey / ed) * minD;
      }
      targets.set(s.n.id, { x: px, y: py });
    }
    relaxCollisions(targets, neigh);
    return targets;
  };

  // Nudge overlapping neighbor targets apart (a few symmetric passes). Only
  // acts on pairs that actually collide, so spokes keep their direction.
  const relaxCollisions = (
    targets: Map<string, { x: number; y: number }>,
    neigh: SimNode[],
  ) => {
    const arr = neigh.map((n) => ({ r: n.r, p: targets.get(n.id)! })).filter((a) => a.p);
    for (let it = 0; it < 6; it++) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          const a = arr[i];
          const b = arr[j];
          const dx = b.p.x - a.p.x;
          const dy = b.p.y - a.p.y;
          const d = Math.hypot(dx, dy) || 0.01;
          const min = a.r + b.r + 7;
          if (d < min) {
            const push = (min - d) / 2;
            const ux = dx / d;
            const uy = dy / d;
            a.p.x -= ux * push;
            a.p.y -= uy * push;
            b.p.x += ux * push;
            b.p.y += uy * push;
          }
        }
      }
    }
  };

  // A transform that centers the selected node and its pulled-in connections in
  // the space the card leaves free. Uses the target zoom (so the selection fills
  // ~78% of the window, matching how focusTargets sized it), but zooms out to
  // fit if the arrangement is somehow larger, so every node stays visible.
  const frameFocus = (
    center: { x: number; y: number },
    centerR: number,
    targets: Map<string, { x: number; y: number }>,
    nodesById: Map<string, SimNode>,
    width: number,
    height: number,
  ) => {
    let minX = center.x - centerR;
    let maxX = center.x + centerR;
    let minY = center.y - centerR;
    let maxY = center.y + centerR;
    for (const [id, p] of targets) {
      const r = nodesById.get(id)?.r ?? 4;
      minX = Math.min(minX, p.x - r);
      maxX = Math.max(maxX, p.x + r);
      minY = Math.min(minY, p.y - r);
      maxY = Math.max(maxY, p.y + r);
    }
    const padX = 24;
    const padTop = 28;
    const freeW = Math.max(width - 2 * padX, 40);
    const freeH = Math.max(height - CARD_CLEARANCE - padTop, 40);
    const fitK = Math.min(freeW / Math.max(maxX - minX, 1), freeH / Math.max(maxY - minY, 1));
    const k = clampK(Math.max(MIN_FOCUS_K, Math.min(TARGET_FOCUS_K, fitK)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    return { k, x: width / 2 - cx * k, y: padTop + freeH / 2 - cy * k };
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
    // Freeze the simulation for the duration: it is asleep or barely warm, and
    // letting it tick would fight the pinned tween.
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

  // Drive the focus layout whenever the selection changes.
  useEffect(() => {
    const live = simRef.current;
    const container = containerRef.current;
    if (!live || !container) return;
    const rect = container.getBoundingClientRect();
    const nodesById = new Map(live.nodes.map((n) => [n.id, n]));
    const home = homePosRef.current;

    // Deselect (tap on empty space): send every displaced node home, release it.
    if (!selectedId) {
      if (home.size === 0) return;
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
      return;
    }

    const sel = nodesById.get(selectedId);
    if (!sel) return; // dormant selection (filtered out): nothing to arrange.
    const neigh = [...(neighborsRef.current.get(selectedId) ?? [])]
      .map((id) => nodesById.get(id))
      .filter((n): n is SimNode => !!n);

    const center = { x: sel.x ?? 0, y: sel.y ?? 0 };
    const targets = focusTargets(center, neigh, sel.r, rect.width, rect.height - CARD_CLEARANCE);

    // Record the selected node's true home once; if it is already displaced
    // (it was a neighbor of a prior selection) keep that earlier original.
    if (!home.has(sel.id)) home.set(sel.id, { x: center.x, y: center.y });

    const keep = new Set<string>([sel.id, ...neigh.map((n) => n.id)]);
    const moves: PosMove[] = [];

    // Neighbors fan out onto the rings; snapshot each one's home the first time
    // it moves so a later deselect can bring it back.
    for (const n of neigh) {
      if (!home.has(n.id)) home.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 });
      moves.push({ node: n, from: { x: n.x ?? 0, y: n.y ?? 0 }, to: targets.get(n.id)! });
    }
    // The selected word stays put, pinned so nothing nudges it off center.
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

    const toT = frameFocus(center, sel.r, targets, nodesById, rect.width, rect.height);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Keep the draw-time ref in sync with the filter state.
  domainFilterRef.current = domainFilter;

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
    const container = containerRef.current;
    const live = simRef.current;
    if (!container || !live || live.nodes.length === 0) return;
    const rect = container.getBoundingClientRect();
    fitToNodes(live.nodes, rect.width, rect.height);
    scheduleDraw();
  };

  // Zoom into a random, frequently-used word: pick a node weighted by its area
  // (radius ∝ wordfreq Zipf, so common words are far likelier than rare ones),
  // center it, zoom in, and select it so its card + connections light up. Picks
  // only among domains the legend filter currently allows, so this never lands
  // on a word the filter itself just dimmed out.
  const zoomToFrequentWord = () => {
    const container = containerRef.current;
    const live = simRef.current;
    if (!container || !live || live.nodes.length === 0) return;
    const rect = container.getBoundingClientRect();
    const pool =
      domainFilter.size === 0
        ? live.nodes
        : live.nodes.filter((n) => domainFilter.has(domainOf(n.themeId) ?? ""));
    const nodes = pool.length > 0 ? pool : live.nodes;
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
    const targetK = clampK(3.4);
    transformRef.current = {
      k: targetK,
      x: rect.width / 2 - (pick.x ?? 0) * targetK,
      y: rect.height / 2 - (pick.y ?? 0) * targetK,
    };
    setSelectedId(pick.id);
    scheduleDraw();
  };

  // The fit-to-screen button toggles (founder 2026-07-13): first press fits the
  // whole graph, the next press zooms into a random often-used word, and so on.
  const fitOrZoomRef = useRef<"fit" | "word">("fit");
  const onFitButton = () => {
    if (fitOrZoomRef.current === "fit") {
      fitView();
      fitOrZoomRef.current = "word";
    } else {
      zoomToFrequentWord();
      fitOrZoomRef.current = "fit";
    }
  };

  const selected = selectedId ? itemById.get(selectedId) : undefined;
  const selectedNode = selectedId ? graph.nodes.find((n) => n.id === selectedId) : undefined;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Waypoints}
        title="Keine Wörter im Graph"
        description="Lockere Filter oder Suche, dann erscheinen hier Wörter und ihre Verbindungen."
      />
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="relative h-[42dvh] min-h-[280px] w-full touch-none overflow-hidden rounded-xl border border-border bg-surface sm:h-[60dvh] sm:min-h-[420px]"
      >
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label={`Interaktiver Wortgraph: ${graph.nodes.length} Wörter, ${graph.links.length} Verbindungen. Tippen wählt ein Wort aus, Ziehen verschiebt die Ansicht.`}
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
            aria-label="Einpassen, erneut tippen für ein zufälliges häufiges Wort"
            title="Einpassen · nochmal für ein zufälliges häufiges Wort"
            className="rounded-lg border border-border bg-surface/90 p-1.5 text-muted-foreground shadow-soft backdrop-blur transition-colors hover:text-foreground"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>

        {/* Selected word card */}
        {selected && (
          <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-border bg-surface/95 p-3 shadow-elevated-soft backdrop-blur sm:right-auto sm:w-80">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-base font-semibold">{selected.de}</p>
                  <SpeakButton text={selected.de} />
                </div>
                <p className="text-xs text-muted-foreground">{selected.en}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <SaveButton id={selected.id} />
                <button
                  onClick={() => setSelectedId(null)}
                  aria-label="Auswahl schließen"
                  className="rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-border pt-2">
              {selected.cefr && <Badge variant="muted">{selected.cefr}</Badge>}
              {(() => {
                const bin = selected.frequency ?? frequencyBin(selected.id);
                return bin ? <Badge variant="muted">{FREQ_LABEL[bin]}</Badge> : null;
              })()}
              <Badge variant="muted">
                {selectedNode?.degree ?? 0} Verbindung{(selectedNode?.degree ?? 0) !== 1 ? "en" : ""}
              </Badge>
            </div>
            <p className="mt-2 text-sm italic text-muted-foreground">
              „{selected.examples[0].de}"
            </p>
          </div>
        )}
      </div>

      {/* Legend + connection count at the bottom of the canvas (the word
          count now sits beside Üben like every other view, founder
          follow-up). Centered on both mobile and desktop. */}
      {/* Legend doubles as a domain filter (founder 2026-07-13): tap a domain to
          show only it (tap again to clear); several can be active. Always shown
          in full (flex-wrap), so no scroll is needed to see every domain. */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
        {presentDomains.map((d) => {
          const color = (DOMAIN_COLORS[d.id] ?? FALLBACK_COLOR)[isDark ? "dark" : "light"];
          const selectedDom = domainFilter.has(d.id);
          const dimmed = domainFilter.size > 0 && !selectedDom;
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleDomain(d.id)}
              aria-pressed={selectedDom}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors",
                selectedDom
                  ? "border-primary/40 bg-primary/10 text-foreground"
                  : "border-transparent hover:bg-muted/60",
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
