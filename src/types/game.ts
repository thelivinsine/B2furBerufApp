/* ------------------------------------------------------------------ */
/* Game types: the Neuland mission bank (game phase G1)                */
/*                                                                     */
/* Missions are DATA, not code (implementation-plan decision 3): a     */
/* Mission is a graph of Scenes interpreted by `engine/mission.ts`,    */
/* exactly like dialogues (`data/dialogues.ts` + `engine/dialogue.ts`).*/
/* Every union below is a CLOSED enum mirrored as a JS array in        */
/* `scripts/lint-content.mjs` (the closed-enum rule), because the      */
/* linter catching a broken mission graph in CI is what makes scaling  */
/* to hundreds of missions safe. Scenes reference content-bank items   */
/* by id (vocab, Redemittel) so provenance, licensing and bilingual    */
/* D/E rendering come for free.                                        */
/* ------------------------------------------------------------------ */

import type { ContentCefr, ThemeId, TextCheck } from "./index";

/** A bilingual line: German first, English gloss for the E button. */
export interface BiText {
  de: string;
  en: string;
}

/**
 * Story chapters (GAME_DESIGN.md v3 section 9): six chapters, where kap6
 * "Mein Ziel" is the player-chosen ending (Im Büro lives inside its career
 * chain since the 2026-07-06 founder direction).
 */
export type ChapterId = "kap1" | "kap2" | "kap3" | "kap4" | "kap5" | "kap6";

export interface GameChapter {
  id: ChapterId;
  /** German chapter title ("Ankommen"). */
  title: string;
  titleEn: string;
  /** The city district the chapter unlocks ("Bahnhofsviertel"). */
  district: string;
}

/**
 * Recurring cast member (GAME_DESIGN.md section 2). The registry lives in
 * `data/missions.ts`; scenes reference NPCs by id so the cast stays
 * consistent across hundreds of missions. `sprite` keys into the welt
 * feature's sprite map (art is a skin; missing sprite renders a fallback).
 */
export interface GameNpc {
  id: string; // "npc_" prefix
  name: string;
  role: BiText;
  sprite?: string;
}

/**
 * Key item (Schlüssel-Dokument): real-bureaucracy documents later missions
 * genuinely require, mirroring real dependency chains (Meldebestätigung from
 * mission 1.6 is demanded by the chapter-3 bank mission).
 */
export interface KeyItem {
  id: string; // "ki_" prefix
  de: string;
  en: string;
  /** What it is and why it matters (item card copy). */
  desc: BiText;
}

/**
 * Backdrop/staging registry key for a scene. Closed enum: the welt feature
 * maps each setting to pixel art (or a neutral stage while art is pending),
 * so authoring a mission never requires new components, only data.
 */
export type SceneSetting =
  | "website" // simulated browser prop, no world backdrop
  | "wohnung" // the player's room
  | "strasse" // street / outdoors
  | "wartezimmer" // Amt waiting room
  | "amt"; // Bürgeramt service room (the scene-7 reference room)

/** Battle status-effect flavor (GAME_DESIGN.md section 5). Cosmetic in G1. */
export type BattleEffect = "beamtendeutsch" | "missverstaendnis" | "smalltalk";

/* ---------------- scenes ---------------- */

interface SceneBase {
  /** Unique within the mission. */
  id: string;
  setting: SceneSetting;
  /**
   * Scene played after this one completes. Omitted only on a scene that
   * ends the mission (`end: "win"`) or routes exclusively via choices.
   */
  next?: string;
  /** Terminal marker: completing this scene clears the mission. */
  end?: "win";
  /**
   * Key items added to the run bag when the scene is entered (the
   * fetch-quest payoff: the lose branch hands over the missing document).
   */
  grantsItems?: string[];
}

/** A tappable decision (website button, cutscene choice). */
export interface SceneChoice {
  id: string;
  de: string;
  en: string;
  next: string;
  /** Short consequence note shown after choosing (world reaction, not a toast). */
  feedback?: BiText;
}

export interface CutsceneLine {
  /** NPC id from the registry, "du" (the player) or "erzaehler" (narrator). */
  speaker: string;
  de: string;
  en: string;
}

/** Story beats: sequential bilingual lines, optionally ending in a choice. */
export interface CutsceneScene extends SceneBase {
  kind: "cutscene";
  lines: CutsceneLine[];
  /** When present, the choice buttons replace `next` as the exit. */
  choices?: SceneChoice[];
}

/** A parody website/document rendered as an interactive prop. */
export interface WebsiteParodyScene extends SceneBase {
  kind: "websiteParody";
  /** Fake address shown in the browser chrome ("termine.neustadt.de"). */
  url: string;
  heading: string;
  headingEn: string;
  /** Page body rows, each glossable. */
  lines: BiText[];
  /** Highlighted callout ("Nächster freier Termin: in 8 Wochen"). */
  notice?: BiText;
  choices: SceneChoice[];
}

/**
 * One bag slot in the pre-mission loadout. Packing it is a retrieval
 * exercise over the referenced vocab item (label and gloss come from the
 * bank); the result feeds vocab FSRS through the normal review path.
 */
export interface LoadoutSlot {
  id: string;
  /** Vocabulary id (must exist in `data/vocabulary.ts`). */
  vocabId: string;
  /** Key item added to the mission bag when this slot is packed. */
  grantsItem?: string;
}

export interface LoadoutScene extends SceneBase {
  kind: "loadout";
  /** Optional flavor line; the bag-and-slots stage visual carries the task. */
  intro?: BiText;
  slots: LoadoutSlot[];
  /** Extra vocab ids mixed into the retrieval options as distractors. */
  distractorVocabIds?: string[];
  /** Continue-button label ("Zum Wartezimmer"); the renderer defaults to "Weiter". */
  cta?: BiText;
}

/** Ambient listening moment (TTS) with comprehension checks. */
export interface ListeningScene extends SceneBase {
  kind: "listening";
  intro?: BiText;
  /** Waiting-room number board flavor. */
  ticker?: { label: string; current: string; yours: string };
  /** Lines spoken via TTS, with a read-along reveal for support. */
  audio: BiText[];
  /** 1-3 comprehension checks (same shape as the text bank's). */
  checks: TextCheck[];
}

/**
 * One conversation move in a dialogue battle. Moves are the player's
 * Redemittel/vocab "cards"; deltas steer the two bars. Sign convention:
 * negative `geduld` drains the opponent's patience (fumbles cost a lot,
 * good moves a little, a crit can restore some), `mut` moves the player's
 * composure. The battle is lost when either bar reaches 0.
 */
export interface BattleMove {
  id: string;
  /** Move-class chip on the card ("Konjunktiv II", "Nachfragen", "Dokument zeigen"). */
  tag?: string;
  /** The utterance the player produces. */
  de: string;
  en: string;
  /** Redemittel id this move exercises (recorded as practice). */
  redemittelId?: string;
  /** Vocab id this move retrieves (graded into FSRS). */
  vocabId?: string;
  /** A well-placed register/grammar hit (Konjunktiv II): crit presentation. */
  crit?: boolean;
  /**
   * Typed challenge (the input ladder's higher rung): this word of `de` is
   * shown as a gap and must be typed to land the move at full strength. A
   * near-miss weakens it, a wrong answer makes it misfire. Must be a
   * substring of `de` (linted).
   */
  cloze?: string;
  /** Quality 0..1 (same scale as DialogueOption.quality). */
  quality: number;
  /** Delta to the opponent's Geduld bar. */
  geduld: number;
  /** Delta to the player's Mut bar. */
  mut: number;
  /** Key item this move needs ("Dokument zeigen"). */
  requiresItem?: string;
  /** Battle node played next (when `requiresItem` is present, if it is held). */
  next: string;
  /** Branch when `requiresItem` is missing: the failure-as-content hook. */
  nextIfMissing?: string;
  /** Coaching note shown after the move lands. */
  feedback?: BiText;
}

/**
 * An item demand (founder feedback s74): when an NPC asks for a document,
 * the player answers by opening the bag and TAPPING the item, not by picking
 * a sentence. Wrong items cost patience (and earn a reaction line); a player
 * who does not hold the item concedes, routing to `nextIfMissing` (the
 * failure-as-content hook).
 */
export interface ItemRequest {
  /** Key item that satisfies the demand. */
  itemId: string;
  /** Vocab id retrieved by recognizing the right document (graded into FSRS). */
  vocabId?: string;
  /** Bar deltas when the right item is handed over. */
  geduld: number;
  mut: number;
  /** Node played after the correct handover. */
  next: string;
  /** Node routed to when the player concedes they do not hold the item. */
  nextIfMissing: string;
  /** Patience cost per wrong item offered (engine default when absent). */
  wrongGeduld?: number;
  /** Reaction when a wrong item is offered ("Das ist Ihr Bibliotheksausweis."). */
  wrongFeedback?: BiText;
  /** Coaching/flavor note after the correct handover. */
  feedback?: BiText;
}

export interface BattleNode {
  id: string;
  /** What the opponent says at this node. */
  npcLine: BiText;
  /** Status-effect flavor shown on the line. */
  effect?: BattleEffect;
  /** Player moves; absent on terminal nodes and on `ask` nodes. */
  moves?: BattleMove[];
  /** Item demand: the node is answered from the bag instead of via moves. */
  ask?: ItemRequest;
  /** Terminal marker. "win" exits to the scene's `next`; "lose" to `onLose`. */
  outcome?: "win" | "lose";
}

/** The conversation battle (GAME_DESIGN.md section 5). */
export interface DialogueBattleScene extends SceneBase {
  kind: "dialogueBattle";
  /** Opponent, from the NPC registry. */
  npc: string;
  /** Level chip on the opponent card. */
  npcCefr: ContentCefr;
  /** Starting patience (opponent bar, also its maximum). */
  geduld: number;
  /** Maximum composure (player bar). */
  mut: number;
  /**
   * Composure at battle start (defaults to `mut`). Starting below the max
   * gives good moves visible headroom: both bars must be kept high, and the
   * finish quality (remaining Geduld + Mut) scales the victory bonus.
   */
  mutStart?: number;
  start: string;
  nodes: Record<string, BattleNode>;
  /**
   * Node shown when a bar empties mid-conversation (must be a lose node):
   * the "Kommen Sie wieder, wenn Sie alle Unterlagen haben" beat.
   */
  onBarEmpty: string;
  /**
   * Scene played when the battle is lost (a bar hit 0 or a lose node).
   * Failure is content, never lockout: the lose scene scaffolds a retry
   * and routes back into the battle or a fetch quest.
   */
  onLose: string;
}

/** One field of a form-cloze finale. */
export interface FormField {
  id: string;
  /** Field label as printed on the form ("Tag des Einzugs"). */
  label: BiText;
  /** Expected entry. */
  answer: string;
  /** Select variant: option pills (must include `answer`). Typed when absent. */
  options?: string[];
  hint?: BiText;
}

/** An official form as a typed/select cloze (the Anmeldeformular finale). */
export interface FormClozeScene extends SceneBase {
  kind: "formCloze";
  /** Letterhead eyebrow above the title ("Stadt Neustadt · Bürgeramt"). */
  issuer?: BiText;
  /** Form header as printed ("Anmeldung bei der Meldebehörde"). */
  title: string;
  titleEn: string;
  intro?: BiText;
  fields: FormField[];
}

export type MissionScene =
  | CutsceneScene
  | WebsiteParodyScene
  | LoadoutScene
  | ListeningScene
  | DialogueBattleScene
  | FormClozeScene;

/** The closed list of scene kinds (mirrored in lint-content.mjs). */
export type SceneKind = MissionScene["kind"];

/* ---------------- mission ---------------- */

export interface Mission {
  id: string; // "m_" prefix
  chapter: ChapterId;
  /** 1-based order within the chapter. */
  index: number;
  title: string;
  titleEn: string;
  /** Content-bank theme the mission draws on (mastery, provenance, city). */
  themeId: ThemeId;
  /** Band the mission's German is pitched at. */
  cefr: ContentCefr;
  /** Boss missions close their chapter (structural rule, founder 2026-07-06). */
  boss?: boolean;
  /** Mission-card preview ("Behördendeutsch, 3 Dokumente"). */
  brief: BiText;
  /** Key items the mission needs at the door (fetch-quest hook when missing). */
  requiresItems?: string[];
  /** Missions that must be completed first. */
  requiresMissions?: string[];
  /** Wörterbuch charges for the run (engine default when absent). */
  dictUses?: number;
  /** XP granted on completion (scene play adds more on top). */
  rewardXp: number;
  /** Key items granted on completion. */
  rewardItems?: string[];
  start: string;
  scenes: Record<string, MissionScene>;
}
