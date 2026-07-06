import type { ContextTag, LearningMode } from "@/types";

/**
 * Intent / goal cards (Taxonomy Phase 3, step 4): "start from a real situation"
 * entry points on the dashboard. Each card sets a pre-built filter bundle and
 * deep-links into the matching browser view. Cards are filtered by the learner's
 * Mode lens, so this is the first place `mode` actually changes what is shown.
 *
 * A card surfaces when the active mode is `both`, OR the card's `context` is
 * `both`, OR the card's `context` matches the active mode. This mirrors the
 * theme/context rollup: nothing is ever hidden in `both`, and switching to a
 * lens narrows the starting points without ever emptying the screen (the Themen
 * grid below always remains).
 */
export interface IntentCard {
  id: string;
  /** Which Mode lens this belongs to. `both` shows in every mode. */
  context: ContextTag;
  /** Small domain label shown as the card eyebrow. */
  eyebrowDe: string;
  titleDe: string;
  /** Tailwind gradient classes for the card background. */
  accent: string;
  /** In-app deep-link with the pre-built filter bundle. */
  to: string;
  /** Approx. session length in minutes. */
  minutes?: number;
  /**
   * Vocab filter bundle used to compute the live word count + CEFR range shown
   * on the card. Omit for non-vocab targets (writing/exam) and set `meta`.
   */
  vocab?: { theme?: string; sub?: string };
  /** Static meta label for non-vocab cards (e.g. Schreibtraining). */
  meta?: string;
}

export const intentCards: IntentCard[] = [
  {
    id: "behoerde-anmelden",
    context: "personal",
    eyebrowDe: "Alltag",
    titleDe: "Beim Bürgeramt anmelden",
    accent: "from-amber-500 to-orange-500",
    to: "/vocabulary?theme=behoerde&sub=behoerde.meldewesen",
    minutes: 15,
    vocab: { theme: "behoerde", sub: "behoerde.meldewesen" },
  },
  {
    id: "behoerde-antrag",
    context: "personal",
    eyebrowDe: "Alltag",
    titleDe: "Anträge & Unterlagen",
    accent: "from-rose-500 to-pink-500",
    to: "/vocabulary?theme=behoerde&sub=behoerde.antrag",
    minutes: 15,
    vocab: { theme: "behoerde", sub: "behoerde.antrag" },
  },
  {
    id: "meetings-mitreden",
    context: "work",
    eyebrowDe: "Beruf",
    titleDe: "Im Meeting mitreden",
    accent: "from-indigo-500 to-violet-600",
    to: "/vocabulary?theme=meetings&sub=meetings.beitrag",
    minutes: 20,
    vocab: { theme: "meetings", sub: "meetings.beitrag" },
  },
  {
    id: "customer-beratung",
    context: "work",
    eyebrowDe: "Beruf",
    titleDe: "Kundengespräch & Beratung",
    accent: "from-sky-500 to-cyan-600",
    to: "/vocabulary?theme=customer&sub=customer.beratung",
    minutes: 20,
    vocab: { theme: "customer", sub: "customer.beratung" },
  },
  {
    id: "conflict-loesen",
    context: "work",
    eyebrowDe: "Beruf",
    titleDe: "Konflikt im Team lösen",
    accent: "from-teal-500 to-emerald-600",
    to: "/redemittel",
    meta: "Redemittel · B2",
    minutes: 12,
  },
  {
    id: "scheduling-termine",
    context: "both",
    eyebrowDe: "Beruf & Alltag",
    titleDe: "Termine vereinbaren",
    accent: "from-violet-500 to-purple-600",
    to: "/vocabulary?theme=scheduling",
    minutes: 15,
    vocab: { theme: "scheduling" },
  },
  {
    id: "pruefung-schreiben",
    context: "both",
    eyebrowDe: "Prüfung",
    titleDe: "Schreibtraining starten",
    accent: "from-emerald-500 to-green-600",
    to: "/writing",
    meta: "Schreibtraining · B2",
    minutes: 20,
  },
];

/** Cards relevant to the active Mode lens (see module doc for the rollup rule). */
export function intentCardsForMode(mode: LearningMode): IntentCard[] {
  return intentCards.filter(
    (c) => mode === "both" || c.context === "both" || c.context === mode,
  );
}
