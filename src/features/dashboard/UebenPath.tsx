import { useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { missions, chapters } from "@/data/missions";
import { useProgressStore } from "@/store/useProgressStore";
import { cn } from "@/lib/utils";

/**
 * Heute → "Üben": the Neuland journey as a pixel city map (Concept C, s86).
 * The Üben tab no longer repeats progress (streak lives in the header, the goal
 * ring moved to Fortschritt). Instead it orients the learner: where they are on
 * the Neuland path and what comes next, in sync with the game.
 *
 * Lazy by design (it imports the mission bank), so the Dashboard keeps NO
 * content bank on its eager path (bundle budget, CLAUDE.md). The pixel map is
 * drawn to a low-res canvas and scaled up crisp. Kapitel-1 stops are authored
 * here and bound to real mission ids; stop state comes from `missionsDone`, so
 * the map advances as the learner plays. Adding a chapter = extend `STOPS`.
 */

const FIELD_W = 176;
const FIELD_H = 132;

type StopState = "done" | "current" | "locked";

// Kapitel-1 city stops, in mission order, each bound to its Neuland missions.
// x/y are pin positions in the FIELD_W x FIELD_H pixel field.
const STOPS = [
  { key: "bahnhof", label: "Bahnhof", x: 55, y: 104, missions: ["m_kap1_willkommen", "m_kap1_automat"] },
  { key: "laden", label: "Laden", x: 66, y: 86, missions: ["m_kap1_sim", "m_kap1_einkauf"] },
  { key: "zuhause", label: "Zuhause", x: 88, y: 70, missions: ["m_kap1_dach"] },
  { key: "amt", label: "Amt", x: 108, y: 50, missions: ["m_kap1_anmeldung"] },
] as const;

const GATE = { x: 130, y: 32 };

// Route segments between consecutive pins (and on to the locked gate). A segment
// is drawn solid (travelled) when the stop it arrives at is done or current,
// dotted otherwise.
const SEGMENTS: { to: number; pts: [number, number][] }[] = [
  { to: 1, pts: [[55, 104], [66, 104], [66, 86]] },
  { to: 2, pts: [[66, 86], [66, 70], [88, 70]] },
  { to: 3, pts: [[88, 70], [108, 70], [108, 50]] },
  { to: -1, pts: [[108, 50], [108, 32], [130, 32]] }, // to the locked gate
];

function drawCity(canvas: HTMLCanvasElement, states: StopState[], currentIndex: number) {
  canvas.width = FIELD_W;
  canvas.height = FIELD_H;
  const g = canvas.getContext("2d");
  if (!g) return;
  g.imageSmoothingEnabled = false;
  const OUT = "#2b2433";
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
  const rnd = mk(11);

  // grass base
  for (let y = 0; y < FIELD_H; y += 4)
    for (let x = 0; x < FIELD_W; x += 4) R(x, y, 4, 4, (x / 4 + y / 4) & 1 ? "#79ac59" : "#6fa350");

  const tree = (x: number, y: number) => {
    R(x - 2, y - 4, 6, 5, "#2f6f34");
    R(x - 1, y - 6, 4, 3, "#3c8443");
    R(x - 3, y - 2, 1, 1, "#3c8443");
    R(x + 4, y - 2, 1, 1, "#3c8443");
    R(x, y - 1, 2, 3, "#5b3d22");
  };
  const pave = (x: number, y: number, w: number, h: number) => {
    R(x, y, w, h, "#cdd1d8");
    R(x, y, w, 1, "#dadde3");
    R(x, y + h - 1, w, 1, "#b7bac2");
  };
  const water = (x: number, y: number, w: number, h: number) => {
    R(x, y, w, h, "#4a90c2");
    R(x, y, w, 1, "#69a8d6");
    R(x + 2, y + 2, 3, 1, "#8ec4e6");
    R(x + w - 6, y + h - 4, 4, 1, "#8ec4e6");
  };
  const BG = [
    ["#9a6b5f", "#b5847a", "#7d5348"],
    ["#6f7787", "#8a92a2", "#59606f"],
    ["#8a7f6a", "#a49a84", "#6f6554"],
    ["#5f7f8a", "#78a0ac", "#4b6570"],
    ["#7a6f8a", "#948aa6", "#61566f"],
    ["#8f9a7a", "#a8b295", "#727c60"],
  ];
  const bd = (x: number, y: number, w: number, h: number, c: string[]) => {
    R(x - 1, y - 1, w + 2, h + 2, OUT);
    R(x, y, w, h, c[0]);
    R(x, y, w, 1, c[1]);
    R(x, y + h - 1, w, 1, c[2]);
    if (w > 9 && h > 9) R(x + 2, y + 2, 2, 2, c[2]);
  };
  const fillBlock = (bx: number, by: number, bw: number, bh: number) => {
    pave(bx, by, bw, bh);
    const cols = bw > 26 ? 2 : 1;
    const rows = bh > 21 ? 2 : 1;
    const cw = bw / cols;
    const ch = bh / rows;
    for (let ci = 0; ci < cols; ci++)
      for (let ri = 0; ri < rows; ri++) {
        if (rnd() < 0.16) continue;
        const x = Math.round(bx + ci * cw + 2);
        const yy = Math.round(by + ri * ch + 2);
        const w = Math.round(cw - 5);
        const h = Math.round(ch - 5);
        if (w < 7 || h < 7) continue;
        bd(x, yy, w, h, BG[Math.floor(rnd() * BG.length)]);
      }
  };

  const CO = [[2, 16], [30, 30], [74, 28], [116, 28], [158, 16]];
  const RO = [[2, 24], [38, 26], [76, 22], [110, 20]];
  const focus: Record<string, number> = { "1_3": 1, "1_2": 1, "2_2": 1, "2_1": 1, "3_1": 1 };
  for (let ci = 0; ci < CO.length; ci++)
    for (let ri = 0; ri < RO.length; ri++) {
      if (focus[ci + "_" + ri]) continue;
      const bx = CO[ci][0];
      const bw = CO[ci][1];
      const by = RO[ri][0];
      const bh = RO[ri][1];
      if ((ci === 0 && ri === 0) || (ci === 4 && ri === 0)) {
        for (let t = 0; t < 3; t++) tree(bx + 3 + Math.floor(rnd() * (bw - 5)), by + 4 + Math.floor(rnd() * (bh - 4)));
        continue;
      }
      if (ci === 4 && ri === 2) {
        water(bx, by, bw, bh);
        continue;
      }
      fillBlock(bx, by, bw, bh);
    }

  // roads (grid)
  const VS = [[20, 28], [62, 70], [104, 112], [146, 154]];
  const HS = [[28, 36], [66, 74], [100, 108]];
  VS.forEach((v) => {
    R(v[0], 0, v[1] - v[0], FIELD_H, "#8b8f99");
    R(v[0], 0, 1, FIELD_H, "#767a84");
    R(v[1] - 1, 0, 1, FIELD_H, "#767a84");
  });
  HS.forEach((h) => {
    R(0, h[0], FIELD_W, h[1] - h[0], "#8b8f99");
    R(0, h[0], FIELD_W, 1, "#767a84");
    R(0, h[1] - 1, FIELD_W, 1, "#767a84");
  });
  VS.forEach((v) => {
    const xc = Math.round((v[0] + v[1]) / 2);
    for (let y = 3; y < FIELD_H; y += 8) R(xc, y, 1, 4, "#e8d48a");
  });
  HS.forEach((h) => {
    const yc = Math.round((h[0] + h[1]) / 2);
    for (let x = 3; x < FIELD_W; x += 8) R(x, yc, 4, 1, "#e8d48a");
  });

  // focus buildings
  const froof = (x: number, y: number, w: number, h: number, base: string, hi: string, lo: string) => {
    R(x - 1, y - 1, w + 2, h + 2, OUT);
    R(x, y, w, h, base);
    R(x, y, w, 2, hi);
    R(x, y + h - 2, w, 2, lo);
  };
  // Bahnhof (red station) — block C1R3
  pave(30, 110, 30, 20);
  froof(31, 112, 28, 16, "#c0504a", "#d67d75", "#8f3b36");
  R(33, 114, 24, 3, "#a7d3e6");
  R(41, 119, 8, 3, "#f2d98a");
  R(35, 124, 4, 4, "#3a3340");
  R(51, 124, 4, 4, "#3a3340");
  // Laden (teal shop) — block C1R2
  pave(30, 76, 30, 22);
  froof(32, 78, 26, 18, "#3fa39a", "#66c6bd", "#2f7d76");
  for (let i = 0; i < 26; i += 4) {
    R(32 + i, 90, 2, 2, "#d95555");
    R(34 + i, 90, 2, 2, "#f2f2f2");
  }
  R(42, 84, 6, 3, "#f2d98a");
  // Zuhause (orange house) — block C2R2
  pave(74, 76, 28, 22);
  froof(76, 78, 24, 18, "#d98a3c", "#eaa860", "#b06f2c");
  R(86, 89, 5, 7, "#5b3d22");
  R(79, 84, 3, 3, "#a7d3e6");
  R(95, 84, 3, 3, "#a7d3e6");
  // Amt (indigo civic) — block C2R1
  pave(74, 38, 28, 26);
  froof(76, 40, 24, 22, "#6d6ae0", "#928fee", "#524fc0");
  R(79, 52, 3, 9, "#c3c0f0");
  R(85, 52, 3, 9, "#c3c0f0");
  R(91, 52, 3, 9, "#c3c0f0");
  R(80, 47, 16, 3, "#524fc0");
  R(87, 34, 1, 6, OUT);
  R(88, 34, 7, 4, "#26cfe6");
  // Kapitel-2 gate (grey, locked) — block C3R1
  pave(116, 38, 28, 26);
  froof(118, 40, 24, 22, "#7f8590", "#9aa0ab", "#5f646e");
  R(126, 48, 6, 14, "#3a3f49");
  R(122, 44, 3, 3, "#aeb4bf");
  R(135, 44, 3, 3, "#aeb4bf");

  // route
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
  const dashed = (pts: [number, number][], col: string) => {
    let acc = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const s = Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
      for (let j = 0; j <= s; j++) {
        acc++;
        if (acc % 6 < 3) {
          const x = Math.round(a[0] + ((b[0] - a[0]) * j) / s);
          const y = Math.round(a[1] + ((b[1] - a[1]) * j) / s);
          R(x - 1, y - 1, 2, 2, col);
        }
      }
    }
  };
  SEGMENTS.forEach((seg) => {
    const travelled = seg.to >= 0 && states[seg.to] !== "locked";
    if (travelled) {
      stamp(seg.pts, 5, "rgba(38,207,230,0.25)");
      stamp(seg.pts, 3, "#26cfe6");
    } else {
      dashed(seg.pts, "#c3c7cf");
    }
  });

  // pins
  const mark = (x: number, y: number, type: "done" | "lock") => {
    R(x - 4, y - 4, 8, 8, OUT);
    if (type === "done") {
      R(x - 3, y - 3, 6, 6, "#2bb673");
      R(x - 2, y, 1, 1, "#fff");
      R(x - 1, y + 1, 1, 1, "#fff");
      R(x, y, 1, 1, "#fff");
      R(x + 1, y - 1, 1, 1, "#fff");
      R(x + 2, y - 2, 1, 1, "#fff");
    } else {
      R(x - 3, y - 3, 6, 6, "#7d828d");
      R(x - 1, y - 3, 2, 2, "#3a3f49");
      R(x - 2, y - 1, 4, 3, "#d7dbe6");
      R(x - 1, y, 2, 1, "#7d828d");
    }
  };
  STOPS.forEach((s, i) => {
    if (states[i] === "done") mark(s.x, s.y, "done");
    else if (states[i] === "locked") mark(s.x, s.y, "lock");
  });
  mark(GATE.x, GATE.y, "lock");

  // current: tall teardrop pin at the current stop
  const cur = STOPS[currentIndex] ?? STOPS[STOPS.length - 1];
  const tx = cur.x;
  const ty = cur.y;
  R(tx - 1, ty - 8, 3, 8, OUT);
  R(tx - 1, ty - 6, 2, 6, "#1796ab");
  R(tx - 6, ty - 20, 13, 13, OUT);
  R(tx - 5, ty - 19, 11, 11, "#26cfe6");
  R(tx - 5, ty - 19, 11, 2, "#7fe6f4");
  R(tx - 1, ty - 16, 3, 3, "#0c3540");
  R(tx - 1, ty - 13, 3, 3, "#0c3540");
}

export default function UebenPath() {
  const navigate = useNavigate();
  const missionsDone = useProgressStore((s) => s.missionsDone);
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
    if (canvasRef.current) drawCity(canvasRef.current, states, currentIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateKey, currentIndex]);

  const cur = STOPS[currentIndex] ?? STOPS[STOPS.length - 1];
  const legend = [
    ...STOPS.map((s, i) => ({ label: s.label, state: states[i] })),
    { label: "Kap. 2", state: "locked" as StopState },
  ];
  const allDone = doneCount >= kap1.length;

  return (
    <div className="space-y-3">
      {/* Pixel city map */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-[#2b2433] shadow-soft">
        <canvas
          ref={canvasRef}
          className="block w-full"
          style={{ imageRendering: "pixelated", height: "auto" }}
          aria-label="Neuland-Karte mit deinem Lernweg"
        />
        {/* current-position overlays, positioned in % of the pixel field */}
        <div className="pointer-events-none absolute inset-0">
          <span
            className="absolute rounded-full"
            style={{
              left: `${(cur.x / FIELD_W) * 100}%`,
              top: `${(cur.y / FIELD_H) * 100}%`,
              width: 14,
              height: 14,
              transform: "translate(-50%,-50%)",
              border: "2px solid hsl(188 80% 60%)",
              animation: "uben-pulse 1.8s ease-out infinite",
            }}
          />
          <span
            className="absolute whitespace-nowrap rounded-md border border-[#2b2433] bg-white px-1.5 py-1 font-mono text-[8px] font-extrabold tracking-wider text-[#0c1424] shadow-md"
            style={{
              left: `${(cur.x / FIELD_W) * 100}%`,
              top: `${((cur.y - 24) / FIELD_H) * 100}%`,
              transform: "translate(-50%,-50%)",
            }}
          >
            DU BIST HIER
          </span>
        </div>
      </div>

      {/* Legend (centered): the stops in order with their state */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {legend.map((s, i) => (
          <span
            key={i}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold",
              s.state === "done" && "border-border bg-surface text-foreground",
              s.state === "current" && "border-accent/50 bg-surface text-accent",
              s.state === "locked" && "border-border bg-surface text-muted-foreground opacity-70",
            )}
          >
            <span
              className={cn(
                "grid h-3 w-3 place-items-center rounded-full text-[7px] text-white",
                s.state === "done" && "bg-success",
                s.state === "current" && "bg-accent",
                s.state === "locked" && "bg-muted-foreground/70",
              )}
            >
              {s.state === "done" ? "✓" : s.state === "locked" ? "🔒" : i + 1}
            </span>
            {s.label}
            {s.state === "current" ? " · hier" : ""}
          </span>
        ))}
      </div>

      {/* Als Nächstes tile */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/15 to-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11.5px] font-semibold text-muted-foreground">
            Kapitel 1 · {chapterTitle}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-[10.5px] font-bold text-success">
            ● Aktuelles Level
          </span>
        </div>
        <h2 className="mt-2.5 text-lg font-bold leading-tight">
          {allDone ? "Kapitel 1 geschafft" : nextMission.title}
        </h2>
        <button
          type="button"
          onClick={() => navigate(`/welt?mission=${nextMission.id}`)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 px-5 py-3 text-sm font-bold text-white shadow-md"
        >
          {allDone ? "Nochmal" : "Weiter"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>

      <style>{`@keyframes uben-pulse{0%{transform:translate(-50%,-50%) scale(.5);opacity:.9}100%{transform:translate(-50%,-50%) scale(2);opacity:0}}@media (prefers-reduced-motion:reduce){[style*="uben-pulse"]{animation:none!important}}`}</style>
    </div>
  );
}
