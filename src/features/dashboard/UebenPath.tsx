import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { missions, chapters } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { useIsDark } from "@/lib/useTheme";
import { cn } from "@/lib/utils";

/**
 * Heute → "Üben": the Neuland journey as a bird's-eye pixel city map (s86).
 * Progress lives in the header (streak) and Fortschritt (goal ring), so the
 * Üben tab orients instead of repeating it: a simple, legible city where a
 * glowing route runs to where you are ("Du bist hier") and a dotted leg shows
 * what's next. Stop state (done / current / locked) is read from `missionsDone`
 * and shown in the stepper below the map, NOT on the map itself (kept clean).
 *
 * Lazy by design (imports the mission bank) so the Dashboard keeps NO content
 * bank on its eager path (bundle budget, CLAUDE.md). Map drawn to a low-res
 * canvas, upscaled crisp. Adding a chapter = extend STOPS.
 */

const FIELD_W = 176;
const FIELD_H = 158; // full drawing field (map content is laid out in this space)
// The map is cropped to a 3:2 view so it matches the Spielen backdrop image
// (176 : 117 ≈ 3 : 2). CROP_TOP shifts the drawing up so the trimmed band is the
// top decorative row, keeping every landmark building + the whole route visible.
const VIEW_H = 117;
const CROP_TOP = 24;
const OUT = "#2b2433";

type StopState = "done" | "current" | "locked";

// Kapitel-1 stops, in mission order, bound to their missions. char* is where the
// player figure + "Du bist hier" banner sit when this stop is current. Laid out
// as a tour (BL -> BR -> TR -> TC) so no stop is stacked under another.
const STOPS = [
  { key: "bahnhof", label: "Bahnhof", missions: ["m_kap1_willkommen", "m_kap1_automat"], charX: 45, charY: 106 },
  { key: "laden", label: "Laden", missions: ["m_kap1_sim", "m_kap1_einkauf"], charX: 130, charY: 106 },
  { key: "zuhause", label: "Zuhause", missions: ["m_kap1_dach"], charX: 130, charY: 68 },
  { key: "amt", label: "Amt", missions: ["m_kap1_anmeldung"], charX: 88, charY: 68 },
] as const;

// Route legs between consecutive stops (and on to the locked next chapter). A leg
// is solid when the stop it arrives at is reached (done/current), dotted else.
const SEGMENTS: { to: number; pts: [number, number][] }[] = [
  { to: 1, pts: [[45, 104], [130, 104]] },
  { to: 2, pts: [[130, 104], [150, 104], [150, 32], [130, 32]] },
  { to: 3, pts: [[130, 32], [88, 32]] },
  { to: -1, pts: [[88, 32], [45, 32]] },
];

// Scenery palette. The map is an app surface (Heute), so it follows the theme:
// dark mode gets deep muted grass/roads/buildings while the glowing cyan route
// and the colour-coded landmark buildings stay vivid (like a dark map style).
type Palette = {
  grassA: string; grassB: string; speckA: string; speckB: string;
  pave: string; paveHi: string; paveLo: string;
  water: string; waterHi: string; waterSpark: string;
  road: string; roadEdge: string; lane: string;
  bg: string[][];
};
const LIGHT_PAL: Palette = {
  grassA: "#79ac59", grassB: "#6fa350", speckA: "#83b662", speckB: "#659845",
  pave: "#c7cbd3", paveHi: "#d6d9df", paveLo: "#b2b5be",
  water: "#4a90c2", waterHi: "#69a8d6", waterSpark: "#8ec4e6",
  road: "#8b8f99", roadEdge: "#767a84", lane: "#e8d48a",
  bg: [
    ["#9a6b5f", "#b5847a", "#7d5348"],
    ["#6f7787", "#8a92a2", "#59606f"],
    ["#8a7f6a", "#a49a84", "#6f6554"],
    ["#5f7f8a", "#78a0ac", "#4b6570"],
    ["#7a6f8a", "#948aa6", "#61566f"],
    ["#8f9a7a", "#a8b295", "#727c60"],
  ],
};
const DARK_PAL: Palette = {
  grassA: "#2f4a38", grassB: "#294231", speckA: "#39573f", speckB: "#22392b",
  pave: "#3f4450", paveHi: "#4b515e", paveLo: "#353a45",
  water: "#294f68", waterHi: "#356882", waterSpark: "#5090b0",
  road: "#373d47", roadEdge: "#282d36", lane: "#b6a561",
  bg: [
    ["#5e463f", "#71564e", "#4a352f"],
    ["#454b58", "#565d6b", "#363b46"],
    ["#57503f", "#68604e", "#413b2e"],
    ["#3b4e57", "#495f6b", "#2d3b43"],
    ["#4a4356", "#585067", "#383144"],
    ["#565c48", "#666d55", "#414636"],
  ],
};

function drawCity(canvas: HTMLCanvasElement, states: StopState[], currentIndex: number, isDark: boolean) {
  canvas.width = FIELD_W;
  canvas.height = VIEW_H;
  const g = canvas.getContext("2d");
  if (!g) return;
  const P = isDark ? DARK_PAL : LIGHT_PAL;
  g.imageSmoothingEnabled = false;
  // Crop to the 3:2 view: shift content up so the top decorative band falls off
  // the top and rows below the view are clipped by the canvas bounds.
  g.translate(0, -CROP_TOP);
  const R = (x: number, y: number, w: number, h: number, col: string) => {
    g.fillStyle = col;
    g.fillRect(x | 0, y | 0, w | 0, h | 0);
  };
  const mk = (seed: number) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rnd = mk(9);

  for (let y = 0; y < FIELD_H; y += 4)
    for (let x = 0; x < FIELD_W; x += 4) R(x, y, 4, 4, (x / 4 + y / 4) & 1 ? P.grassA : P.grassB);
  const sp = mk(5);
  for (let i = 0; i < 90; i++) R(Math.floor(sp() * FIELD_W), Math.floor(sp() * FIELD_H), 1, 1, sp() < 0.5 ? P.speckA : P.speckB);

  const tree = (x: number, y: number) => {
    R(x - 1, y - 1, 5, 4, OUT);
    R(x - 1, y - 6, 6, 6, "#2f6f34");
    R(x, y - 7, 4, 3, "#3c8443");
    R(x - 1, y - 5, 1, 1, "#4f9a4e");
    R(x + 1, y + 2, 2, 2, "#5b3d22");
  };
  const shadow = (x: number, y: number, w: number, h: number) => {
    g.fillStyle = "rgba(20,24,34,0.28)";
    g.fillRect(x + 2, y + h, w, 2);
    g.fillRect(x + w, y + 2, 2, h - 2);
  };
  const pave = (x: number, y: number, w: number, h: number) => {
    R(x, y, w, h, P.pave);
    R(x, y, w, 1, P.paveHi);
    R(x, y + h - 1, w, 1, P.paveLo);
  };
  const water = (x: number, y: number, w: number, h: number) => {
    R(x, y, w, h, P.water);
    R(x, y, w, 1, P.waterHi);
    R(x + 2, y + 2, 3, 1, P.waterSpark);
    R(x + w - 6, y + h - 4, 4, 1, P.waterSpark);
  };
  const BG = P.bg;
  const bd = (x: number, y: number, w: number, h: number, c: string[]) => {
    shadow(x, y, w, h);
    R(x - 1, y - 1, w + 2, h + 2, OUT);
    R(x, y, w, h, c[0]);
    R(x, y, w, 1, c[1]);
    R(x, y + h - 1, w, 1, c[2]);
    if (w > 9 && h > 9) {
      R(x + 2, y + 2, 2, 2, c[2]);
      R(x + w - 4, y + 2, 2, 2, c[2]);
    }
  };
  const fillBlock = (bx: number, by: number, bw: number, bh: number) => {
    pave(bx, by, bw, bh);
    const cols = bw > 26 ? 2 : 1;
    const rows = bh > 21 ? 2 : 1;
    const cw = bw / cols;
    const ch = bh / rows;
    for (let ci = 0; ci < cols; ci++)
      for (let ri = 0; ri < rows; ri++) {
        if (rnd() < 0.14) continue;
        const x = Math.round(bx + ci * cw + 2);
        const yy = Math.round(by + ri * ch + 2);
        const w = Math.round(cw - 5);
        const h = Math.round(ch - 5);
        if (w < 7 || h < 7) continue;
        bd(x, yy, w, h, BG[Math.floor(rnd() * BG.length)]);
      }
  };

  const CO = [[2, 16], [30, 30], [74, 28], [116, 28], [158, 16]];
  const RO = [[2, 24], [38, 26], [76, 22], [110, 20], [138, 18]];
  const focus: Record<string, number> = { "1_3": 1, "3_3": 1, "3_1": 1, "2_1": 1, "1_1": 1 };
  for (let ci = 0; ci < CO.length; ci++)
    for (let ri = 0; ri < RO.length; ri++) {
      if (focus[ci + "_" + ri]) continue;
      const bx = CO[ci][0];
      const bw = CO[ci][1];
      const by = RO[ri][0];
      const bh = RO[ri][1];
      // Skip rows cropped away by the 3:2 view (top decorative band + anything
      // below the bottom edge), so neither end leaves a sliver of buildings.
      if (by + bh <= CROP_TOP + 2 || by > CROP_TOP + VIEW_H - 6) continue;
      if ((ci === 0 && ri === 0) || (ci === 4 && ri === 0)) {
        for (let t = 0; t < 3; t++) tree(bx + 3 + Math.floor(rnd() * (bw - 5)), by + 5 + Math.floor(rnd() * (bh - 5)));
        continue;
      }
      if ((ci === 4 && ri === 2) || (ci === 0 && ri === 4)) {
        water(bx, by, bw, bh);
        continue;
      }
      if (ci === 2 && ri === 4) {
        for (let t = 0; t < 2; t++) tree(bx + 5 + t * 12, by + 10);
        continue;
      }
      fillBlock(bx, by, bw, bh);
    }

  // roads (grid + dashed lane lines)
  const VS = [[20, 28], [62, 70], [104, 112], [146, 154]];
  const HS = [[28, 36], [66, 74], [100, 108], [130, 138]];
  VS.forEach((v) => {
    R(v[0], 0, v[1] - v[0], FIELD_H, P.road);
    R(v[0], 0, 1, FIELD_H, P.roadEdge);
    R(v[1] - 1, 0, 1, FIELD_H, P.roadEdge);
  });
  HS.forEach((h) => {
    R(0, h[0], FIELD_W, h[1] - h[0], P.road);
    R(0, h[0], FIELD_W, 1, P.roadEdge);
    R(0, h[1] - 1, FIELD_W, 1, P.roadEdge);
  });
  VS.forEach((v) => {
    const xc = Math.round((v[0] + v[1]) / 2);
    for (let y = 3; y < FIELD_H; y += 8) R(xc, y, 1, 4, P.lane);
  });
  HS.forEach((h) => {
    const yc = Math.round((h[0] + h[1]) / 2);
    for (let x = 3; x < FIELD_W; x += 8) R(x, yc, 4, 1, P.lane);
  });

  // focus landmark buildings (colour-coded; state shown in the stepper, not here)
  const froof = (x: number, y: number, w: number, h: number, base: string, hi: string, lo: string) => {
    shadow(x, y, w, h);
    R(x - 1, y - 1, w + 2, h + 2, OUT);
    R(x, y, w, h, base);
    R(x, y, w, 2, hi);
    R(x, y + h - 2, w, 2, lo);
  };
  // Bahnhof (red)
  froof(31, 112, 28, 16, "#c0504a", "#d67d75", "#8f3b36");
  R(33, 114, 24, 3, "#a7d3e6");
  R(41, 118, 8, 3, "#f2d98a");
  R(35, 123, 4, 5, "#3a3340");
  R(51, 123, 4, 5, "#3a3340");
  // Laden (teal)
  froof(117, 112, 26, 16, "#3fa39a", "#66c6bd", "#2f7d76");
  for (let i = 0; i < 26; i += 4) {
    R(117 + i, 124, 2, 2, "#d95555");
    R(119 + i, 124, 2, 2, "#f2f2f2");
  }
  R(127, 116, 6, 3, "#f2d98a");
  // Zuhause (orange)
  froof(117, 40, 26, 22, "#d98a3c", "#eaa860", "#b06f2c");
  R(127, 53, 6, 9, "#5b3d22");
  R(120, 46, 3, 3, "#a7d3e6");
  R(137, 46, 3, 3, "#a7d3e6");
  // Amt (indigo)
  froof(76, 40, 24, 22, "#6d6ae0", "#928fee", "#524fc0");
  R(80, 47, 16, 3, "#524fc0");
  R(79, 52, 3, 10, "#c3c0f0");
  R(85, 52, 3, 10, "#c3c0f0");
  R(91, 52, 3, 10, "#c3c0f0");
  // Gate to Kapitel 2 (grey)
  froof(31, 40, 28, 22, "#7f8590", "#9aa0ab", "#5f646e");
  R(41, 50, 6, 12, "#3a3f49");

  // route (glowing to current, dotted after)
  const stamp = (pts: [number, number][], w: number, col: string) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const s = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      for (let j = 0; j <= s; j++) {
        const x = Math.round(a[0] + ((b[0] - a[0]) * j) / s);
        const y = Math.round(a[1] + ((b[1] - a[1]) * j) / s);
        R(x - (w >> 1), y - (w >> 1), w, w, col);
      }
    }
  };
  const dots = (pts: [number, number][], col: string) => {
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const s = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      for (let j = 0; j <= s; j++) {
        acc++;
        if (acc % 7 < 3) {
          const x = Math.round(a[0] + ((b[0] - a[0]) * j) / s);
          const y = Math.round(a[1] + ((b[1] - a[1]) * j) / s);
          R(x - 1, y - 1, 2, 2, col);
        }
      }
    }
  };
  SEGMENTS.forEach((seg) => {
    if (seg.to >= 0 && states[seg.to] !== "locked") {
      stamp(seg.pts, 7, "rgba(38,207,230,0.18)");
      stamp(seg.pts, 5, "#1aa7c4");
      stamp(seg.pts, 3, "#5fe0f4");
    } else {
      dots(seg.pts, "#8fb7c4");
    }
  });

  // current stop: the player figure standing at the door
  const cur = STOPS[currentIndex] ?? STOPS[STOPS.length - 1];
  const chx = cur.charX;
  const chy = cur.charY;
  g.fillStyle = "rgba(20,24,34,0.30)";
  g.fillRect(chx - 3, chy + 1, 7, 2);
  R(chx - 2, chy - 8, 5, 1, OUT);
  R(chx - 2, chy - 7, 5, 4, "#f0c79b");
  R(chx - 2, chy - 7, 5, 1, "#ffdcb0");
  R(chx - 1, chy - 6, 1, 1, "#3a2f2a");
  R(chx + 1, chy - 6, 1, 1, "#3a2f2a");
  R(chx - 3, chy - 3, 7, 5, OUT);
  R(chx - 2, chy - 3, 5, 4, "#26cfe6");
  R(chx - 2, chy - 3, 5, 1, "#7fe6f4");
  R(chx - 2, chy + 2, 2, 2, OUT);
  R(chx + 1, chy + 2, 2, 2, OUT);
}

export default function UebenPath() {
  const navigate = useNavigate();
  const missionsDone = useProgressStore((s) => s.missionsDone);
  const isDark = useIsDark();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const kap1 = useMemo(
    () => missions.filter((m) => m.chapter === "kap1").sort((a, b) => a.index - b.index),
    [],
  );
  const chapterTitle = chapters.find((c) => c.id === "kap1")?.title ?? "";
  const doneKey = missionsDone.join(",");

  const { states, currentIndex, nextMission, doneCount } = useMemo(() => {
    const isDone = (id: string) => missionsDone.includes(id);
    let cur = STOPS.findIndex((s) => !s.missions.every(isDone));
    const complete = cur === -1;
    if (complete) cur = STOPS.length - 1;
    const st: StopState[] = STOPS.map((s, i) => {
      const allDone = s.missions.every(isDone);
      if (allDone) return complete && i === cur ? "current" : "done";
      return i === cur ? "current" : "locked";
    });
    const next = kap1.find((m) => !isDone(m.id)) ?? kap1[kap1.length - 1];
    const dc = kap1.filter((m) => isDone(m.id)).length;
    return { states: st, currentIndex: cur, nextMission: next, doneCount: dc };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneKey, kap1]);

  const stateKey = states.join("|");
  useEffect(() => {
    if (canvasRef.current) drawCity(canvasRef.current, states, currentIndex, isDark);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey, currentIndex, isDark]);

  const cur = STOPS[currentIndex] ?? STOPS[STOPS.length - 1];
  const allDone = doneCount >= kap1.length;

  // Stepper steps: the four stops + a locked "Kap. 2" gate.
  const steps: { label: string; state: StopState; icon: string }[] = [
    ...STOPS.map((s, i) => ({ label: s.label, state: states[i], icon: states[i] === "done" ? "✓" : String(i + 1) })),
    { label: "Kap. 2", state: "locked" as StopState, icon: "🔒" },
  ];

  return (
    <div className="space-y-5">
      {/* Stepper: the milestone icons sit ABOVE the map (founder s87) */}
      <div className="flex items-start justify-between px-1">
        {steps.map((s, i) => (
          <div key={i} className="relative flex flex-1 flex-col items-center gap-1.5">
            {i > 0 && (
              <span
                className="absolute left-[-50%] top-[11px] z-0 h-0.5 w-full"
                style={{ background: s.state !== "locked" ? "hsl(var(--success))" : "hsl(var(--border))" }}
              />
            )}
            <span
              className={cn(
                "relative z-10 grid h-[22px] w-[22px] place-items-center rounded-full border-2 text-[11px] font-extrabold",
                s.state === "done" && "border-success bg-success text-white",
                s.state === "current" && "border-accent bg-accent text-white",
                s.state === "locked" && "border-border bg-surface text-muted-foreground",
              )}
              style={s.state === "current" ? { boxShadow: "0 0 0 4px hsl(var(--accent) / 0.18)" } : undefined}
            >
              {s.icon}
            </span>
            <span
              className={cn(
                "text-[10.5px] font-semibold",
                s.state === "done" && "text-foreground",
                s.state === "current" && "font-extrabold text-accent",
                s.state === "locked" && "text-muted-foreground",
              )}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Pixel city map */}
      <div className="relative overflow-hidden rounded-[20px] border border-border shadow-soft">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ imageRendering: "pixelated", height: "auto" }}
          aria-label="Neuland-Karte mit deinem Lernweg"
        />
        <div className="pointer-events-none absolute inset-0">
          <span
            className="absolute rounded-full border-2 border-accent/70"
            style={{
              left: `${(cur.charX / FIELD_W) * 100}%`,
              top: `${((cur.charY - 3 - CROP_TOP) / VIEW_H) * 100}%`,
              width: "8%",
              aspectRatio: "1",
              transform: "translate(-50%,-50%)",
              animation: "uben-pulse 1.8s ease-out infinite",
            }}
          />
          <span
            className="absolute -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border-2 border-[#2b2433] bg-white px-2 py-1 text-[11px] font-extrabold tracking-wide text-[#0c1424] shadow-md"
            style={{
              left: `${(cur.charX / FIELD_W) * 100}%`,
              top: `${((cur.charY - 11 - CROP_TOP) / VIEW_H) * 100}%`,
            }}
          >
            Du bist hier
            <span className="absolute left-1/2 top-full -translate-x-1/2" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "5px solid #2b2433" }} />
            <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-[2px]" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "4px solid #fff" }} />
          </span>
        </div>
      </div>

      {/* Als Nächstes tile (taller so it doesn't read cramped, founder s87) */}
      <div className="rounded-[20px] border border-border bg-surface px-5 py-6" style={{ boxShadow: "0 10px 30px -22px rgba(0,0,0,0.9)" }}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Kapitel 1 · {chapterTitle}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Aktuelles Level
          </span>
        </div>
        <h2 className="mt-4 text-xl font-extrabold leading-tight tracking-tight">
          {allDone ? "Kapitel 1 geschafft" : nextMission.title}
        </h2>
        {/* Üben opens a composed practice session focused on THIS mission (its
            own vocab + Redemittel first, then theme-related fill), NOT the game
            itself. Playing a mission lives under Heute → Spielen (and /welt). */}
        <button
          type="button"
          onClick={() => navigate(`/session?mission=${nextMission.id}`)}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-4 text-[15px] font-extrabold text-white transition active:scale-[0.99]"
          style={{ boxShadow: "0 12px 24px -10px hsl(248 80% 55% / 0.7)" }}
        >
          Üben
          <ArrowRight className="h-[18px] w-[18px]" />
        </button>
      </div>

      <style>{`@keyframes uben-pulse{0%{transform:translate(-50%,-50%) scale(.5);opacity:.85}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}@media (prefers-reduced-motion:reduce){[style*="uben-pulse"]{animation:none!important}}`}</style>
    </div>
  );
}
