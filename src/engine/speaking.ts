import type {
  ConversationBrief,
  ContentCefr,
  ExamSet,
  Scenario,
  SpeakingPartner,
  SpeakingStage,
} from "@/types";

/**
 * The bridge from authored content to a spoken conversation (s191).
 *
 * Before this session the Sprechen surface replayed a hand-authored branching
 * tree: the learner tapped one of 2-4 written options and `scoreDialogue`
 * averaged an author-assigned quality number, so nothing in the app ever heard
 * the learner speak. The trees retire; what survives is their FRAMING, because
 * `title`, `task`, `context` and `targetRedemittel` are exactly the material an
 * AI partner needs as role instructions.
 *
 * So a brief is DERIVED, never authored twice:
 *   - a practice Scenario  -> `speakingBrief(scenario)`
 *   - an exam ExamSet      -> `examBrief(set, scenario)`, whose `aspects` are
 *     already the Leitpunkte the debrief grades as Aufgabenerfüllung.
 *
 * Scenario ids are permanent and stay untouched (the id-permanence law): a
 * brief carries the id of whatever it was built from, so a learner's progress
 * survives this change.
 */

/** Used when a scenario predates the partner field. Never leaves a task unservable. */
const NEUTRAL_PARTNER: SpeakingPartner = {
  name: "Gesprächspartner:in",
  role: "deine Gesprächspartnerin oder dein Gesprächspartner",
  register: "sie",
};

/** The examiner persona for a Modelltest task with no authored partner. */
const EXAM_PARTNER: SpeakingPartner = {
  name: "Prüfer:in",
  role: "deine Prüferin oder dein Prüfer",
  register: "sie",
};

/**
 * The scenario levels are 1-3 (Einsteiger / Mittelstufe / Fortgeschritten) and
 * predate the CEFR bands, so they map rather than being reinterpreted.
 */
const LEVEL_BY_DIFFICULTY: Record<1 | 2 | 3, ContentCefr> = {
  1: "B1.1",
  2: "B1.2",
  3: "B2.1",
};

/**
 * Practice always runs as the chat thread (founder s191: the learner finds the
 * transcript useful), so this never consults the scenario.
 */
export const PRACTICE_STAGE: SpeakingStage = "gespraech";

/**
 * Goals are what the debrief grades. A scenario that has not been given them
 * yet degrades to ONE goal derived from its own task line, which is honest:
 * the conversation still runs and still gets language feedback, it just cannot
 * report finer-grained Aufgabenerfüllung than "did you do the task".
 */
export function briefGoals(scenario: Scenario): string[] {
  if (scenario.goals?.length) return scenario.goals.slice(0, 5);
  return [scenario.task];
}

/** Build the brief for a practice conversation. */
export function speakingBrief(scenario: Scenario): ConversationBrief {
  return {
    id: scenario.id,
    title: scenario.title,
    partner: scenario.partner ?? NEUTRAL_PARTNER,
    situation: scenario.context,
    goals: briefGoals(scenario),
    targetRedemittel: scenario.targetRedemittel,
    level: LEVEL_BY_DIFFICULTY[scenario.level],
    minutes: scenario.minutes,
    stage: PRACTICE_STAGE,
    exam: false,
  };
}

/**
 * Build the brief for a Modelltest task.
 *
 * The stage is the founder's s191 rule, and it is a property of the TASK, not
 * of the learner: a task that works from a written Aufgabe keeps it on screen
 * ("buehne"), and a task that reading would defeat runs blind ("anruf"). An
 * exam set that says nothing gets "buehne", because every set authored so far
 * is a "discuss the aspects and agree" task whose aspects must stay readable.
 */
export function examBrief(set: ExamSet, scenario?: Scenario): ConversationBrief {
  return {
    id: set.id,
    title: set.title.replace(/^Prüfungssimulation:\s*/, ""),
    partner: set.partner ?? scenario?.partner ?? EXAM_PARTNER,
    situation: set.taskSheet,
    // `aspects` IS the Leitpunkte list; it has always been the thing the task
    // sheet tells the candidate to cover.
    goals: set.aspects.slice(0, 5),
    targetRedemittel: scenario?.targetRedemittel ?? [],
    level: "B2.1",
    minutes: set.totalMinutes,
    stage: set.stage ?? "buehne",
    exam: true,
  };
}

/**
 * Whether the learner may read anything while speaking. The Anruf stage is the
 * one that says no, and the "Untertitel" escape hatch is the only way text
 * appears there (resting off, founder s191).
 */
export function showsTextWhileSpeaking(stage: SpeakingStage): boolean {
  return stage !== "anruf";
}
