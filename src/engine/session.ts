import type {
  Difficulty,
  LearningMode,
  SessionBlock,
  SessionPlan,
  SrsCard,
  ThemeId,
} from "@/types";
import { vocabulary, vocabByTheme } from "@/data/vocabulary";
import { themes, themeById } from "@/data/themes";
import { redemittel } from "@/data/redemittel";
import { grammar } from "@/data/grammar";
import { isDue, mastery, reviewWeight, dueCount } from "@/engine/srs";
import { buildThemeQuiz } from "@/engine/quiz";
import { sample, clamp } from "@/lib/utils";

/**
 * The session composer (UX overhaul Phase 1). A pure function that turns the
 * learner's SRS state + Mode lens + a target length into an ordered, interleaved
 * `SessionPlan`: due vocab retrieval, a couple of leveled quiz questions from
 * the weakest (or scoped) theme, a grammar micro-drill and a Redemittel recall,
 * mixed rather than blocked (the playbook's interleaving finding). Every piece
 * reuses an existing content bank + renderer; nothing here authors new content.
 *
 * `buildSession` samples (so each run varies); `sessionPreview` is deterministic
 * so the Heute hero can show a stable "here's what's in today's session" line.
 */

/** Map the learner's stored CEFR level to a quiz difficulty band. */
export function difficultyForLevel(level: string | undefined): Difficulty {
  if (level === "A2" || level === "B1") return 1;
  if (level === "C1") return 3;
  return 2; // B2 (and default)
}

/** Rough blocks-per-session for a target minute length (~1.6 blocks/min). */
function targetBlocks(minutes: number): number {
  return clamp(Math.round(minutes * 1.6), 6, 18);
}

/**
 * The CEFR band with the lowest mean mastery among *started* cards (the
 * learner's current weak spot), or null when nothing has been studied yet.
 */
export function weakestBand(srs: Record<string, SrsCard>): string | null {
  const sum: Record<string, number> = {};
  const count: Record<string, number> = {};
  for (const v of vocabulary) {
    if (!v.cefr || !srs[v.id]) continue; // only started cards inform the weak band
    sum[v.cefr] = (sum[v.cefr] ?? 0) + mastery(srs[v.id]);
    count[v.cefr] = (count[v.cefr] ?? 0) + 1;
  }
  let weak: string | null = null;
  let lowest = Infinity;
  for (const band in count) {
    const mean = sum[band] / count[band];
    if (mean < lowest) {
      lowest = mean;
      weak = band;
    }
  }
  return weak;
}

/**
 * The theme with the most room to grow: least-mastered overall, restricted to
 * the active Mode lens (never emptying — falls back to all themes). For a fresh
 * learner every ratio is 0, so this picks the first mode-relevant theme.
 */
export function weakestTheme(srs: Record<string, SrsCard>, mode: LearningMode): ThemeId {
  const relevant = themes.filter(
    (t) => mode === "both" || t.context === "both" || t.context === mode,
  );
  const pool = relevant.length ? relevant : themes;
  let weak = pool[0];
  let lowest = Infinity;
  for (const t of pool) {
    const words = vocabByTheme(t.id);
    if (!words.length) continue;
    const mastered = words.filter((w) => mastery(srs[w.id]) >= 0.8).length;
    const ratio = mastered / words.length;
    if (ratio < lowest) {
      lowest = ratio;
      weak = t;
    }
  }
  return weak.id;
}

/** Human label for the weak spot, used in previews + the forward hook. */
function weakLabel(srs: Record<string, SrsCard>, themeId: ThemeId): string {
  const band = weakestBand(srs);
  if (band) return band;
  return themeById(themeId)?.titleDe ?? "neue Wörter";
}

export interface BuildSessionOpts {
  srs: Record<string, SrsCard>;
  mode: LearningMode;
  minutes: number;
  /** Quiz difficulty; derive from the learner's level via difficultyForLevel. */
  difficulty?: Difficulty;
  /** Optional situation scope (a Situationen chip) that biases theme selection. */
  scope?: ThemeId;
  /** Vocab ids in the learner's custom deck (#29); each gets a review boost. */
  savedWords?: string[];
}

/** Interleave several ordered pools round-robin so kinds alternate, not block. */
function interleave(pools: SessionBlock[][], limit: number): SessionBlock[] {
  const out: SessionBlock[] = [];
  const seen = new Set<string>();
  let progressed = true;
  while (out.length < limit && progressed) {
    progressed = false;
    for (const pool of pools) {
      const next = pool.shift();
      if (!next) continue;
      progressed = true;
      if (seen.has(next.key)) continue;
      seen.add(next.key);
      out.push(next);
      if (out.length >= limit) break;
    }
  }
  return out;
}

export function buildSession(opts: BuildSessionOpts): SessionPlan {
  const { srs, mode, minutes, scope } = opts;
  const difficulty = opts.difficulty ?? 2;
  const limit = targetBlocks(minutes);
  const saved = new Set(opts.savedWords ?? []);

  const scopeTheme = scope ?? weakestTheme(srs, mode);
  const band = weakestBand(srs);

  /* --- Pool 1: due vocab retrieval (flashcards), weighted + scope-biased --- */
  const vocabBlocks: SessionBlock[] = vocabulary
    .filter((v) => isDue(srs[v.id]))
    .map((v) => {
      const ctx = themeById(v.themeId)?.context ?? "both";
      const modeMatch = mode !== "both" && (ctx === mode || ctx === "both");
      const levelMatch = !!band && v.cefr === band;
      const scopeBoost = v.themeId === scopeTheme ? 1 : 0;
      const w =
        reviewWeight(srs[v.id], {
          modeMatch,
          levelMatch,
          saved: saved.has(v.id),
          jitter: Math.random() * 0.5,
        }) + scopeBoost;
      return { v, w };
    })
    .sort((a, b) => b.w - a.w)
    .slice(0, Math.ceil(limit * 0.6))
    .map(
      ({ v }): SessionBlock => ({
        kind: "flashcard",
        key: `fc_${v.id}`,
        source: "vocab",
        sourceId: v.id,
        de: v.de,
        en: v.en,
        example: v.examples[0]?.de,
      }),
    );

  /* --- Pool 2: leveled quiz questions from the scoped/weak theme --- */
  const quizBlocks: SessionBlock[] = buildThemeQuiz(scopeTheme, difficulty, 5).map(
    (question): SessionBlock => ({ kind: "quiz", key: `qz_${question.id}`, question }),
  );

  /* --- Pool 3: one or two grammar micro-drills --- */
  const grammarTopic = sample(grammar, 1)[0];
  const grammarBlocks: SessionBlock[] = grammarTopic
    ? sample(grammarTopic.drills, Math.min(2, grammarTopic.drills.length)).map(
        (drill): SessionBlock => ({
          kind: "grammar",
          key: `gr_${drill.id}`,
          drill,
          groupLabel: grammarTopic.titleDe,
        }),
      )
    : [];

  /* --- Pool 4: Redemittel recall (flashcards), mode-relevant where possible --- */
  const redePool = redemittel.filter((r) => {
    if (mode === "both" || !r.themeId) return true;
    const ctx = themeById(r.themeId)?.context ?? "both";
    return ctx === mode || ctx === "both";
  });
  const redeBlocks: SessionBlock[] = sample(redePool.length ? redePool : redemittel, 2).map(
    (r): SessionBlock => ({
      kind: "flashcard",
      key: `fc_rede_${r.id}`,
      source: "redemittel",
      sourceId: r.id,
      de: r.de,
      en: r.en,
      example: r.example.de,
    }),
  );

  const blocks = interleave([vocabBlocks, quizBlocks, grammarBlocks, redeBlocks], limit);

  const due = dueCount(srs);
  const preview = buildPreview(due, band, redeBlocks.length);
  const focus = grammarTopic ? grammarTopic.titleDe : weakLabel(srs, scopeTheme);

  return { blocks, minutes, preview, focus };
}

/** Compose the one-line "what's in this session" preview from counts. */
function buildPreview(due: number, band: string | null, redeCount: number): string {
  const parts: string[] = [];
  parts.push(due > 0 ? `${due} fällige ${due === 1 ? "Wort" : "Wörter"}` : "Neue Wörter");
  if (band) parts.push(`Schwachstelle: ${band}`);
  if (redeCount > 0) parts.push(`${redeCount} Redemittel`);
  return parts.join(" · ");
}

export interface SessionPreview {
  minutes: number;
  blockCount: number;
  preview: string;
  /** True once the learner has any started cards (drives hero copy). */
  hasHistory: boolean;
}

/**
 * Deterministic preview for the Heute hero: no sampling, so the displayed line
 * is stable across renders and matches what a freshly built session contains.
 */
export function sessionPreview(opts: {
  srs: Record<string, SrsCard>;
  minutes: number;
}): SessionPreview {
  const { srs, minutes } = opts;
  const due = dueCount(srs);
  const band = weakestBand(srs);
  return {
    minutes,
    blockCount: targetBlocks(minutes),
    preview: buildPreview(due, band, 1),
    hasHistory: Object.keys(srs).length > 0,
  };
}
