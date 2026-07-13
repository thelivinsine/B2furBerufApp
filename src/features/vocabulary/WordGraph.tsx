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

// One color per domain (6, the visible taxonomy spine): brand indigo for
// Berufsleben, distinct calm hues for the rest, brightened for dark mode.
const DOMAIN_COLORS: Record<string, { light: string; dark: string }> = {
  beruf: { light: "#5b5be6", dark: "#8a8af2" },
  arbeitswelt: { light: "#8b5cf6", dark: "#a78bfa" },
  alltag: { light: "#0d9488", dark: "#2dd4bf" },
  gesundheit: { light: "#e11d48", dark: "#fb7185" },
  bildung: { light: "#d97706", dark: "#fbbf24" },
  pruefung: { light: "#0284c7", dark: "#38bdf8" },
};
const FALLBACK_COLOR = { light: "#64748b", dark: "#94a3b8" };

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

    // Settle past the initial explosion off-screen, then animate gently.
    sim.tick(120);

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

    const draw = () => {
      const { x: tx, y: ty, k } = transformRef.current;
      const dark = darkRef.current;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr * k, 0, 0, dpr * k, dpr * tx, dpr * ty);

      const focus = hoverRef.current ?? selectedRef.current;
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
      // the focused word and its neighbors always read.
      const zoomAlpha = Math.min(Math.max((k - 0.85) / 0.5, 0), 1);
      if (zoomAlpha > 0 || focusSet) {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.font = `500 10px ${fontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        const labelColor = dark ? "203,213,225" : "51,65,85";
        for (const n of nodes) {
          const x = n.x ?? 0;
          const y = n.y ?? 0;
          if (x < worldLeft || x > worldRight || y < worldTop || y > worldBottom) continue;
          if (!domActive(n)) continue;
          const inFocus = focusSet?.has(n.id) ?? false;
          const alpha = focusSet ? (inFocus ? 1 : 0) : zoomAlpha;
          if (alpha <= 0) continue;
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
        sim.alphaTarget(0);
      }
      // A tap (barely moved): select the word, or clear on empty space.
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
  }, [graph]);

  // Theme flips and selection changes only need a repaint, not a new sim.
  useEffect(() => {
    scheduleDraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDark, selectedId, domainFilter]);

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
  // center it, zoom in, and select it so its card + connections light up.
  const zoomToFrequentWord = () => {
    const container = containerRef.current;
    const live = simRef.current;
    if (!container || !live || live.nodes.length === 0) return;
    const rect = container.getBoundingClientRect();
    const nodes = live.nodes;
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
          follow-up). Centered on mobile, left-aligned on desktop. */}
      {/* Legend doubles as a domain filter (founder 2026-07-13): tap a domain to
          show only it (tap again to clear); several can be active. Always shown
          in full (flex-wrap), so no scroll is needed to see every domain. */}
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground lg:justify-start">
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
        <span className="tabular-nums lg:ml-auto">
          {graph.links.length} Verbindung{graph.links.length !== 1 ? "en" : ""}
        </span>
      </div>
    </div>
  );
}
