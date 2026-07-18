import type { ReactElement } from "react";
import { WesenBody } from "@/components/artikel/Wesen";
import type { Gender } from "@/components/artikel/gender";

/**
 * Fused-doodle bank, batch 1 (Artikel-Visuals Phase 2, plan §4): 20 scenes
 * where the word's Artikel-Wesen interacts with the word's meaning, the
 * strongest-evidence form in the research (image fusing meaning + gender).
 * Style follows the founder-picked Preview C in
 * `preview/artikel-visuals/gender-doodles-panel.html`: 120x96 viewBox,
 * referent objects in the neutral `--ink` stroke (2.4, round caps) with
 * `--surface` fills, the creature + its accents in the word's gender token.
 *
 * RULES (enforced by tests/doodles.test.ts):
 * - Every id exists in the vocab bank, is a noun, and the declared `gender`
 *   matches the bank's `article` (a wrong-gender doodle would actively teach
 *   an error).
 * - A scene uses ONLY its own gender token (+ `--ink`/`--surface`): the
 *   rendered markup must not contain either other gender's CSS var.
 * - No human figures, ever: the Wesen are the actors (gender is a property of
 *   the word, not the referent).
 *
 * This module is loaded ONLY via the dynamic import in `./index.ts`, so the
 * art rides in its own lazy chunk that loads on the first flip of a card that
 * has a doodle. Do not import it statically from app code.
 */

const INK = "hsl(var(--ink))";
const SURF = "hsl(var(--surface))";

/** Referent stroke style (the "pencil" objects). */
const ink = {
  stroke: INK,
  strokeWidth: 2.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
};
const inkFill = { ...ink, fill: SURF };
/** Faint detail lines (text rules etc.). */
const faint = { ...ink, strokeWidth: 2, opacity: 0.4 };

const tok = (g: Gender) => `hsl(var(--${g}))`;
const tint = (g: Gender) => `hsl(var(--${g}-bg))`;

/** Gender-colored accent stroke (arms, motion, marks). */
const acc = (g: Gender, w = 2.2) => ({
  stroke: tok(g),
  strokeWidth: w,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none" as const,
});

const MONO = "ui-monospace, Menlo, Consolas, monospace";

/**
 * The creature placed into a scene: the SAME WesenBody geometry as the card
 * mark (drawn in the 0..24 box), scaled/mirrored via transform. `flip` mirrors
 * horizontally about the body's own center so a Wesen can face either way.
 */
function Mini({
  g,
  x,
  y,
  s = 1.5,
  flip = false,
}: {
  g: Gender;
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
}) {
  const t = flip
    ? `translate(${x + 24 * s} ${y}) scale(${-s} ${s})`
    : `translate(${x} ${y}) scale(${s})`;
  return (
    <g transform={t}>
      <WesenBody gender={g} />
    </g>
  );
}

/** Shared svg wrapper: the card back renders this at ~150px wide. */
function Scene({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 120 96" width={150} height={120} aria-hidden className="max-w-full">
      {children}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* The 10 Kapitel-1 mission nouns                                      */
/* ------------------------------------------------------------------ */

/** die Beratung: the die-Wesen advises across a desk, answer in the bubble. */
function Beratung(): ReactElement {
  return (
    <Scene>
      <Mini g="die" x={56} y={26} s={1.5} />
      {/* desk in front of the Wesen */}
      <rect x={42} y={58} width={64} height={6} rx={3} {...inkFill} />
      <path d="M50 64 V84 M98 64 V84" {...ink} />
      {/* paper on the desk */}
      <rect x={58} y={50} width={22} height={9} rx={1.5} {...inkFill} />
      {/* speech bubble with the answer, spoken by the Wesen */}
      <ellipse cx={26} cy={22} rx={17} ry={12} {...inkFill} />
      <path d="M39 30 L54 38" {...ink} />
      <path d="M19 22 l5 5 l10 -10" {...acc("die", 2.6)} />
    </Scene>
  );
}

/** der Bescheid: the official letter with its round stamp, read closely. */
function Bescheid(): ReactElement {
  return (
    <Scene>
      {/* the letter */}
      <rect x={40} y={14} width={44} height={58} rx={3} {...inkFill} />
      <path d="M47 26 H77 M47 33 H77 M47 40 H68" {...faint} />
      {/* official round stamp */}
      <circle cx={68} cy={58} r={8.5} {...ink} />
      <circle cx={68} cy={58} r={4} {...faint} />
      {/* the der-Wesen reads it, arm on the page */}
      <Mini g="der" x={4} y={44} s={1.55} />
      <path d="M28 62 L40 55" {...acc("der")} />
      {/* opened envelope it came in */}
      <rect x={90} y={70} width={24} height={15} rx={2} {...inkFill} />
      <path d="M90 72 L102 80 L114 72" {...ink} />
    </Scene>
  );
}

/** die Fahrkarte: the ticket held up in triumph. */
function Fahrkarte(): ReactElement {
  return (
    <Scene>
      {/* ticket, slightly tilted, with tear-off perforation */}
      <g transform="rotate(-6 60 38)">
        <rect x={22} y={24} width={76} height={28} rx={4} {...inkFill} />
        <rect x={26} y={28} width={18} height={20} rx={2} fill={tint("die")} stroke="none" />
        <path d="M78 26 V50" {...faint} strokeDasharray="3 3.5" />
        <path d="M50 33 H72 M50 40 H66" {...faint} />
        <circle cx={87} cy={38} r={4} {...ink} />
      </g>
      {/* the die-Wesen underneath, both arms up holding it */}
      <Mini g="die" x={44} y={54} s={1.45} />
      <path d="M48 58 L40 50 M74 57 L82 49" {...acc("die")} />
    </Scene>
  );
}

/** die Gebühr: paying up, coin by coin. */
function Gebuehr(): ReactElement {
  return (
    <Scene>
      {/* stack of paid coins */}
      <ellipse cx={36} cy={76} rx={13} ry={4.5} {...inkFill} />
      <ellipse cx={36} cy={69} rx={13} ry={4.5} {...inkFill} />
      <ellipse cx={36} cy={62} rx={13} ry={4.5} {...inkFill} />
      {/* the coin mid-drop */}
      <circle cx={52} cy={34} r={9.5} {...inkFill} />
      <text x={52} y={38} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={11} fill={INK}>
        €
      </text>
      <path d="M46 48 Q50 52 54 48" {...acc("die")} opacity={0.6} />
      {/* the die-Wesen letting it go */}
      <Mini g="die" x={70} y={40} s={1.55} />
      <path d="M74 52 L60 40" {...acc("die")} />
    </Scene>
  );
}

/** der Kunde: the der-Wesen IS the customer, bag in hand at the counter. */
function Kunde(): ReactElement {
  return (
    <Scene>
      {/* shop counter with service bell */}
      <rect x={66} y={50} width={48} height={7} rx={3} {...inkFill} />
      <path d="M72 57 V84 M108 57 V84" {...ink} />
      <path d="M84 50 A 7 7 0 0 1 98 50" {...ink} />
      <circle cx={91} cy={41} r={1.6} fill={INK} />
      {/* the customer with a shopping bag */}
      <Mini g="der" x={8} y={40} s={1.6} />
      <path d="M40 74 L48 62 L60 62 L66 74 Z" {...inkFill} transform="translate(0 8)" />
      <path d="M50 68 A 5 4 0 0 1 60 68" {...ink} transform="translate(0 -1)" />
      <path d="M32 62 L46 70" {...acc("der")} />
    </Scene>
  );
}

/** der Mietvertrag: signing the rental contract, the little house seals it. */
function Mietvertrag(): ReactElement {
  return (
    <Scene>
      {/* the contract with a house mark */}
      <rect x={38} y={12} width={42} height={60} rx={3} {...inkFill} />
      <path d="M52 28 L59 21 L66 28 M54 28 V34 H64 V28" {...ink} />
      <path d="M45 44 H73 M45 51 H67" {...faint} />
      <path d="M45 62 H70" {...ink} />
      {/* the signature underway, in the Wesen's own color */}
      <path d="M47 60 Q52 55 55 59 Q57 61 61 58" {...acc("der")} />
      {/* the der-Wesen with the pen */}
      <Mini g="der" x={78} y={44} s={1.45} flip />
      <path d="M84 58 L66 62" {...acc("der")} />
      <path d="M66 62 L61 59 L64 66 Z" fill={tok("der")} stroke="none" />
    </Scene>
  );
}

/** der Personalausweis: the ID card carries the Wesen's own portrait. */
function Personalausweis(): ReactElement {
  return (
    <Scene>
      <g transform="rotate(-4 60 44)">
        <rect x={26} y={24} width={66} height={42} rx={5} {...inkFill} />
        {/* photo: the der-Wesen's own face on the card */}
        <rect x={32} y={31} width={20} height={26} rx={2} {...ink} />
        <path d="M42 36 L49 52 H35 Z" stroke={tok("der")} strokeWidth={2} strokeLinejoin="round" fill={tint("der")} />
        <circle cx={40} cy={47} r={1.1} fill={tok("der")} />
        <circle cx={44.5} cy={47} r={1.1} fill={tok("der")} />
        {/* data lines + chip */}
        <path d="M58 36 H86 M58 43 H80 M58 50 H84" {...faint} />
        <rect x={58} y={55} width={9} height={7} rx={1.5} {...ink} />
      </g>
      {/* the proud owner, presenting it */}
      <Mini g="der" x={86} y={54} s={1.35} flip />
      <path d="M92 66 L84 60" {...acc("der")} />
    </Scene>
  );
}

/** die Rechnung: the long receipt, checked line by line. */
function Rechnung(): ReactElement {
  return (
    <Scene>
      {/* receipt with a torn zigzag end */}
      <path
        d="M46 14 H82 V66 L76 72 L70 66 L64 72 L58 66 L52 72 L46 66 Z"
        {...inkFill}
      />
      <path d="M52 24 H76 M52 31 H76 M52 38 H70" {...faint} />
      <path d="M52 50 H76" {...ink} />
      <text x={64} y={62} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={10} fill={tok("die")}>
        €
      </text>
      {/* the die-Wesen goes through it */}
      <Mini g="die" x={6} y={42} s={1.55} />
      <path d="M30 60 L46 52" {...acc("die")} />
    </Scene>
  );
}

/** die Vollmacht: the sealed authority, handed on to act for you. */
function Vollmacht(): ReactElement {
  return (
    <Scene>
      {/* the document with its seal and ribbons */}
      <rect x={40} y={16} width={36} height={48} rx={3} {...inkFill} />
      <path d="M47 26 H69 M47 33 H64" {...faint} />
      <circle cx={52} cy={52} r={5} fill={tok("die")} stroke="none" />
      <path d="M50 57 L48 64 M54 57 L56 64" {...acc("die", 2)} />
      {/* the die-Wesen hands it over */}
      <Mini g="die" x={2} y={40} s={1.5} />
      <path d="M26 58 L40 48" {...acc("die")} />
      {/* the receiving hand (sleeve + mitt), reaching in from outside */}
      <path d="M118 42 L102 45 M118 53 L102 53" {...ink} />
      <rect x={88} y={42} width={14} height={12} rx={5.5} {...inkFill} transform="rotate(-8 95 48)" />
    </Scene>
  );
}

/** die Wohnungsgeberbestätigung: the landlord confirms, house + big check. */
function Wohnungsgeberbestaetigung(): ReactElement {
  return (
    <Scene>
      {/* the Wohnung */}
      <rect x={14} y={42} width={26} height={22} {...inkFill} />
      <path d="M10 44 L27 26 L44 44" {...ink} />
      <rect x={23} y={52} width={8} height={12} {...ink} />
      {/* the Bestätigung */}
      <rect x={56} y={24} width={34} height={46} rx={3} {...inkFill} />
      <path d="M62 34 H84 M62 41 H78" {...faint} />
      <path d="M63 54 l6 7 l13 -15" {...acc("die", 3)} />
      {/* the die-Wesen confirms it */}
      <Mini g="die" x={90} y={48} s={1.35} flip />
      <path d="M96 62 L90 56" {...acc("die")} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */
/* The 10 high-frequency Kapitel-1-theme nouns                         */
/* ------------------------------------------------------------------ */

/** das Programm: the das-Wesen lives inside the running program window. */
function Programm(): ReactElement {
  return (
    <Scene>
      {/* app window */}
      <rect x={18} y={14} width={84} height={62} rx={5} {...inkFill} />
      <path d="M18 26 H102" {...ink} />
      <circle cx={26} cy={20} r={1.8} fill={INK} />
      <circle cx={33} cy={20} r={1.8} fill={INK} />
      <circle cx={40} cy={20} r={1.8} fill={INK} />
      {/* code lines, one running in the Wesen's color */}
      <path d="M26 36 H58 M26 52 H50" {...faint} />
      <path d="M26 44 H54" {...acc("das", 2)} />
      {/* the das-Wesen at home in the code */}
      <Mini g="das" x={64} y={34} s={1.35} />
      <path d="M68 46 L60 38" {...acc("das")} />
    </Scene>
  );
}

/** das Hotel: checked in, suitcase at the door. */
function Hotel(): ReactElement {
  return (
    <Scene>
      {/* the building */}
      <rect x={40} y={16} width={54} height={64} {...inkFill} />
      <rect x={59} y={58} width={16} height={22} {...ink} />
      <rect x={48} y={26} width={11} height={10} {...ink} />
      <rect x={73} y={26} width={11} height={10} {...ink} />
      <rect x={48} y={42} width={11} height={10} {...ink} />
      <rect x={73} y={42} width={11} height={10} {...ink} />
      {/* the hanging sign */}
      <path d="M94 24 H102" {...ink} />
      <rect x={98} y={24} width={16} height={13} rx={2} {...inkFill} />
      <text x={106} y={34} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={9} fill={tok("das")}>
        H
      </text>
      {/* arriving guest with suitcase */}
      <Mini g="das" x={0} y={48} s={1.45} />
      <rect x={22} y={66} width={15} height={13} rx={2} {...inkFill} />
      <path d="M26 66 A 4 4 0 0 1 34 66" {...ink} />
      <path d="M20 64 L27 66" {...acc("das")} />
    </Scene>
  );
}

/** das Verfahren: step by step through the process boxes. */
function Verfahren(): ReactElement {
  return (
    <Scene>
      <rect x={8} y={22} width={26} height={19} rx={3} {...inkFill} />
      <rect x={47} y={22} width={26} height={19} rx={3} {...inkFill} />
      <rect x={86} y={22} width={26} height={19} rx={3} {...inkFill} />
      <path d="M36 31 H43 M40 28 L44 31.5 L40 35" {...ink} />
      <path d="M75 31 H82 M79 28 L83 31.5 L79 35" {...ink} />
      {/* the first two steps are done */}
      <path d="M16 30 l4 5 l8 -9" {...acc("das", 2.4)} />
      <path d="M55 30 l4 5 l8 -9" {...acc("das", 2.4)} />
      {/* the das-Wesen works on step three */}
      <Mini g="das" x={82} y={48} s={1.4} />
      <path d="M88 52 L94 43" {...acc("das")} />
    </Scene>
  );
}

/** das Gerät: the device responds to a tap. */
function Geraet(): ReactElement {
  return (
    <Scene>
      {/* tablet */}
      <rect x={30} y={16} width={50} height={66} rx={7} {...inkFill} />
      <rect x={36} y={24} width={38} height={42} rx={2} {...faint} fill="none" />
      <circle cx={55} cy={74} r={3.5} {...ink} />
      {/* it works: sparks off the screen */}
      <path d="M84 20 L90 14 M88 30 L96 28 M84 40 L90 44" {...acc("das", 2)} />
      {/* the das-Wesen taps the button */}
      <Mini g="das" x={82} y={52} s={1.4} flip />
      <path d="M88 66 L60 74" {...acc("das")} />
    </Scene>
  );
}

/** die IT-Sicherheit: the die-Wesen guards from behind the shield. */
function ItSicherheit(): ReactElement {
  return (
    <Scene>
      {/* the guard peeks out first (drawn behind the shield) */}
      <Mini g="die" x={64} y={26} s={1.55} />
      {/* the shield with its lock */}
      <path
        d="M44 14 L74 24 V46 Q74 70 44 82 Q14 70 14 46 V24 Z"
        stroke={tok("die")}
        strokeWidth={2.8}
        strokeLinejoin="round"
        fill={tint("die")}
      />
      <circle cx={44} cy={42} r={5.5} {...ink} fill={SURF} />
      <path d="M44 47 V56" {...ink} />
    </Scene>
  );
}

/** die Daten: hauling one more block onto the data stack. */
function Daten(): ReactElement {
  return (
    <Scene>
      {/* database cylinders */}
      <path d="M20 30 V64 M56 30 V64" {...ink} />
      <ellipse cx={38} cy={30} rx={18} ry={6} {...inkFill} />
      <path d="M20 64 A 18 6 0 0 0 56 64" {...ink} />
      <path d="M20 47 A 18 6 0 0 0 56 47" {...faint} />
      {/* the die-Wesen carries the next one in */}
      <Mini g="die" x={68} y={42} s={1.5} />
      <ellipse cx={92} cy={26} rx={11} ry={4} {...inkFill} />
      <path d="M81 26 V34 A 11 4 0 0 0 103 34 V26" {...ink} />
      <path d="M74 52 L82 36 M100 52 L100 38" {...acc("die")} />
    </Scene>
  );
}

/** die Verbindung: rolling along the line from A to B. */
function Verbindung(): ReactElement {
  return (
    <Scene>
      {/* the two ends */}
      <circle cx={14} cy={74} r={6.5} {...inkFill} />
      <circle cx={106} cy={28} r={6.5} {...inkFill} />
      <text x={14} y={91} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={INK} opacity={0.6}>
        A
      </text>
      <text x={106} y={45} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={INK} opacity={0.6}>
        B
      </text>
      {/* the connection itself */}
      <path d="M20 71 C 45 64 76 42 100 31" {...acc("die", 2.6)} />
      {/* the round die-Wesen rolls it like a bead */}
      <Mini g="die" x={44} y={22} s={1.5} />
      <path d="M36 60 Q40 56 44 58 M30 66 Q34 62 38 64" {...acc("die", 2)} opacity={0.5} />
    </Scene>
  );
}

/** die Version: v2 replaces v1, proudly presented. */
function Version(): ReactElement {
  return (
    <Scene>
      {/* the old one, fading out */}
      <g opacity={0.35}>
        <rect x={26} y={26} width={32} height={44} rx={3} {...ink} />
        <text x={42} y={52} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={11} fill={INK}>
          v1
        </text>
      </g>
      {/* the new one */}
      <rect x={48} y={20} width={36} height={50} rx={3} {...inkFill} />
      <text x={66} y={48} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={13} fill={tok("die")}>
        v2
      </text>
      {/* the die-Wesen ships it */}
      <Mini g="die" x={86} y={46} s={1.4} flip />
      <path d="M92 60 L84 54" {...acc("die")} />
    </Scene>
  );
}

/** die Funktion: turn the gear and it works. */
function Funktion(): ReactElement {
  return (
    <Scene>
      {/* the gear */}
      <circle cx={44} cy={48} r={17} {...inkFill} />
      <circle cx={44} cy={48} r={5.5} {...ink} />
      <path d="M44 31 V24 M44 65 V72 M27 48 H20 M61 48 H68 M32 36 L27 31 M56 36 L61 31 M32 60 L27 65 M56 60 L61 65" {...ink} />
      {/* it turns */}
      <path d="M60 26 A 24 24 0 0 1 68 44 M65 40 L68 45 L71 39" {...acc("die", 2)} />
      {/* the die-Wesen powers it */}
      <Mini g="die" x={76} y={48} s={1.45} />
      <path d="M82 60 L60 54" {...acc("die")} />
    </Scene>
  );
}

/** der Anschluss: sprinting for the connection, it is just leaving. */
function Anschluss(): ReactElement {
  return (
    <Scene>
      {/* the train pulling away */}
      <rect x={62} y={32} width={54} height={28} rx={7} {...inkFill} />
      <rect x={70} y={39} width={12} height={10} rx={2} {...ink} />
      <rect x={90} y={39} width={12} height={10} rx={2} {...ink} />
      <circle cx={76} cy={64} r={5} {...inkFill} />
      <circle cx={100} cy={64} r={5} {...inkFill} />
      <path d="M50 38 H58 M46 46 H56 M50 54 H58" {...faint} />
      {/* the der-Wesen sprints after it, leaning in */}
      <g transform="rotate(12 26 66)">
        <Mini g="der" x={10} y={48} s={1.5} />
      </g>
      <path d="M2 60 H10 M0 68 H8" {...acc("der", 2)} opacity={0.6} />
      <path d="M34 68 L46 62" {...acc("der")} />
    </Scene>
  );
}

/* ------------------------------------------------------------------ */

export const DOODLES: Record<string, { gender: Gender; Component: () => ReactElement }> = {
  // Kapitel-1 mission nouns
  v_beratung: { gender: "die", Component: Beratung },
  v_bescheid: { gender: "der", Component: Bescheid },
  v_fahrkarte: { gender: "die", Component: Fahrkarte },
  v_gebuehr: { gender: "die", Component: Gebuehr },
  v_kunde: { gender: "der", Component: Kunde },
  v_mietvertrag: { gender: "der", Component: Mietvertrag },
  v_personalausweis: { gender: "der", Component: Personalausweis },
  v_rechnung: { gender: "die", Component: Rechnung },
  v_vollmacht: { gender: "die", Component: Vollmacht },
  v_wohnungsgeberbestaetigung: { gender: "die", Component: Wohnungsgeberbestaetigung },
  // High-frequency Kapitel-1-theme nouns (das-balance override, then top Zipf)
  v_programm: { gender: "das", Component: Programm },
  v_hotel: { gender: "das", Component: Hotel },
  v_verfahren: { gender: "das", Component: Verfahren },
  v_geraet: { gender: "das", Component: Geraet },
  v_it_sicherheit: { gender: "die", Component: ItSicherheit },
  v_daten: { gender: "die", Component: Daten },
  v_verbindung: { gender: "die", Component: Verbindung },
  v_version: { gender: "die", Component: Version },
  v_funktion: { gender: "die", Component: Funktion },
  v_anschluss: { gender: "der", Component: Anschluss },
};
