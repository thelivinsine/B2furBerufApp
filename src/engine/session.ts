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
import { collocations } from "@/data/collocations";
import { grammar } from "@/data/grammar";
import { texts } from "@/data/texts";
import { isDue, mastery, reviewWeight, dueCount } from "@/engine/srs";
import { buildThemeQuiz } from "@/engine/quiz";
import { targetBlocks, weakestBand, buildPreview } from "@/engine/sessionPreview";
import { sample } from "@/lib/utils";

// The light preview half lives in engine/sessionPreview.ts (imported directly
// by the eager Dashboard so this module, and with it the quiz builder and the
// collocations bank, stays out of the main bundle). Re-exported here so lazy
// consumers keep one import site.
export { targetBlocks, weakestBand, buildPreview, sessionPreview } from "@/engine/sessionPreview";
export type { SessionPreview } from "@/engine/sessionPreview";

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

/**
 * Stability (FSRS days-to-90%-recall) at/above which a due vocab card
 * graduates from a recognition flashcard to typed forward recall (task 4.2).
 * New and young cards stay on recognition, where retrieval difficulty is
 * lower, and only cards the learner already holds are asked to be produced
 * from memory. Legacy cards fall back to `interval` (their stability is
 * seeded lazily on the next review, see engine/srs.ts).
 */
export const TYPING_STABILITY_FLOOR = 8;

/**
 * True when a due card is established enough for typed forward recall: at
 * least a couple of reviews deep AND past the stability floor, so a single
 * lucky first answer never jumps a brand-new word straight to typing.
 */
export function graduatedToTyping(card: SrsCard | undefined): boolean {
  if (!card || card.reps < 2) return false;
  return (card.stability ?? card.interval) >= TYPING_STABILITY_FLOOR;
}

/** Map the learner's stored CEFR level to a quiz difficulty band. */
export function difficultyForLevel(level: string | undefined): Difficulty {
  if (level === "A2" || level === "B1") return 1;
  if (level === "C1") return 3;
  return 2; // B2 (and default)
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

/** How many of a narrowed slice a Bibliothek Üben session leads with. */
export const FOCUS_VOCAB_CAP = 8;
export const FOCUS_REDE_CAP = 4;

/**
 * Bibliothek Üben focus: translate a browse page's narrowed state (sub-theme,
 * CEFR, Branche, or a Redemittel category) into the existing mission-style
 * `focus` (lead with these exact items, drop the random grammar/Redemittel).
 * Returns undefined when nothing narrows past the theme, so a bare-theme Üben
 * keeps today's scope-only session. Capped + sampled so a large facet slice
 * still yields a normal mixed session rather than a wall of one facet.
 */
export function libraryFocus(opts: {
  theme?: string;
  sub?: string;
  cefr?: string[];
  sector?: string[];
  category?: string;
}): { vocabIds: string[]; redemittelIds: string[] } | undefined {
  if (opts.category) {
    const ids = redemittel.filter((r) => r.category === opts.category).map((r) => r.id);
    return ids.length ? { vocabIds: [], redemittelIds: sample(ids, FOCUS_REDE_CAP) } : undefined;
  }
  const narrowed = !!opts.sub || !!opts.cefr?.length || !!opts.sector?.length;
  if (!narrowed) return undefined;
  const pool = vocabulary.filter(
    (v) =>
      (!opts.theme || opts.theme === "all" || v.themeId === opts.theme) &&
      (!opts.sub || v.subThemeId === opts.sub) &&
      (!opts.cefr?.length || (!!v.cefr && opts.cefr.includes(v.cefr))) &&
      // Branche carries sectors[] since the s102 overhaul: the focus leads with
      // the tagged Fachwörter of the selected Branche (general words still fill
      // the session via the theme pools).
      (!opts.sector?.length || !!v.sectors?.some((s) => opts.sector!.includes(s))),
  );
  return pool.length
    ? { vocabIds: sample(pool, FOCUS_VOCAB_CAP).map((v) => v.id), redemittelIds: [] }
    : undefined;
}

/**
 * Which Bibliothek tab launched Üben. When set (via `?src=lib` + the session
 * store), the session is built from ONLY that content type + the tab's exact
 * filtered items, so "Üben" on the Redemittel tab practises Redemittel only,
 * "Üben" on a Grammatik group drills that group only, etc. (founder 2026-07-13).
 */
export type ContentScope = "vocab" | "collocation" | "redemittel" | "grammar";

const CONTENT_SCOPE_LABEL: Record<ContentScope, string> = {
  vocab: "Wörter",
  collocation: "Kollokationen",
  redemittel: "Redemittel",
  grammar: "Grammatik",
};

/**
 * Build a content-PURE session for a Bibliothek tab's Üben button: only blocks
 * of the given type, drawn from `ids` (the tab's exact filtered items; empty
 * falls back to the whole bank of that type). Sampled + capped to the target
 * length. No interleaving with other content types, so the learner practises
 * exactly what the page shows.
 */
export function buildScopedSession(
  type: ContentScope,
  ids: string[],
  opts: { srs: Record<string, SrsCard>; minutes: number },
): SessionPlan {
  const limit = targetBlocks(opts.minutes);
  const idSet = new Set(ids);
  const has = (id: string) => idSet.size === 0 || idSet.has(id);
  let blocks: SessionBlock[];
  let label = CONTENT_SCOPE_LABEL[type];

  if (type === "vocab") {
    const pool = vocabulary.filter((v) => has(v.id));
    blocks = sample(pool, Math.min(limit, pool.length)).map((v): SessionBlock =>
      graduatedToTyping(opts.srs[v.id])
        ? { kind: "typing", key: `ty_${v.id}`, sourceId: v.id, de: v.de, en: v.en, example: v.examples[0]?.de }
        : {
            kind: "flashcard",
            key: `fc_${v.id}`,
            source: "vocab",
            sourceId: v.id,
            de: v.de,
            en: v.en,
            example: v.examples[0]?.de,
          },
    );
  } else if (type === "collocation") {
    const pool = collocations.filter((c) => has(c.id));
    blocks = sample(pool, Math.min(limit, pool.length)).map((c): SessionBlock => ({
      kind: "flashcard",
      key: `fc_col_${c.id}`,
      source: "collocation",
      sourceId: c.id,
      de: c.full,
      en: c.en,
      example: c.example.de,
    }));
  } else if (type === "redemittel") {
    const pool = redemittel.filter((r) => has(r.id));
    blocks = sample(pool, Math.min(limit, pool.length)).map((r): SessionBlock => ({
      kind: "flashcard",
      key: `fc_rede_${r.id}`,
      source: "redemittel",
      sourceId: r.id,
      de: r.de,
      en: r.en,
      example: r.example.de,
    }));
  } else {
    const topics = grammar.filter((g) => has(g.id));
    const drillBlocks: SessionBlock[] = topics.flatMap((t) =>
      t.drills.map((d): SessionBlock => ({
        kind: "grammar",
        key: `gr_${d.id}`,
        drill: d,
        groupLabel: t.titleDe,
      })),
    );
    blocks = sample(drillBlocks, Math.min(limit, drillBlocks.length));
    if (topics.length === 1) label = topics[0].titleDe;
  }

  return {
    blocks,
    minutes: opts.minutes,
    preview: `${blocks.length} ${label} zum Üben`,
    focus: label,
  };
}

export interface BuildSessionOpts {
  srs: Record<string, SrsCard>;
  mode: LearningMode;
  minutes: number;
  /** Quiz difficulty; derive from the learner's level via difficultyForLevel. */
  difficulty?: Difficulty;
  /** Optional situation scope (a Situationen chip) that biases theme selection. */
  scope?: ThemeId;
  /**
   * Mission focus (Heute → Üben "Als Nächstes"): the exact vocab + Redemittel
   * the linked Neuland mission exercises. When set, these items are practised
   * first (guaranteed, regardless of SRS due state), the random grammar drill is
   * dropped, and the rest of the session fills from the mission's theme (quiz,
   * due vocab, reading), so Üben mission N stays aligned with Spielen mission N.
   */
  focus?: { vocabIds: string[]; redemittelIds: string[] };
  /**
   * Pin the grammar micro-drill pool to one topic (the Grammatik lesson's Üben,
   * `?grammar=`). The studied topic is guaranteed in the session, with more
   * drills than the random pick, and the session header labels itself with it.
   */
  grammarTopicId?: string;
  /** Vocab ids in the learner's custom deck (#29); each gets a review boost. */
  savedWords?: string[];
  /**
   * Include speaking production blocks (#27). The engine stays pure: the
   * caller computes this as `recognitionEnabled && recognitionSupported()`,
   * so learners without mic/STT/opt-in never see the block kind.
   */
  speaking?: boolean;
  /**
   * TTS is available (task 4.4). Lets a voicemail Lesen/Hören text play as a
   * listening variant; the engine stays pure, so the caller passes
   * `ttsSupported()`. Reading texts render regardless of this flag.
   */
  listening?: boolean;
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
  const weightedDue = vocabulary
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
    .sort((a, b) => b.w - a.w);

  // Graduated cards (established enough, per graduatedToTyping) become typed
  // forward-recall blocks; new/young cards stay on recognition flashcards.
  const vocabBlocks: SessionBlock[] = weightedDue.slice(0, Math.ceil(limit * 0.6)).map(
    ({ v }): SessionBlock =>
      graduatedToTyping(srs[v.id])
        ? {
            kind: "typing",
            key: `ty_${v.id}`,
            sourceId: v.id,
            de: v.de,
            en: v.en,
            example: v.examples[0]?.de,
          }
        : {
            kind: "flashcard",
            key: `fc_${v.id}`,
            source: "vocab",
            sourceId: v.id,
            de: v.de,
            en: v.en,
            example: v.examples[0]?.de,
          },
  );

  /* --- Pool 5: speaking production (#27), top due words, mic opt-in only.
     Reuses Pool 1's weighting; overlap with a flashcard block is fine (and
     useful: recognition first, production after). --- */
  const speakingBlocks: SessionBlock[] = opts.speaking
    ? weightedDue.slice(0, 2).map(
        ({ v }): SessionBlock => ({
          kind: "speaking",
          key: `sp_${v.id}`,
          sourceId: v.id,
          de: v.de,
          en: v.en,
          // English example only: the German sentence would reveal the answer.
          example: v.examples[0]?.en,
        }),
      )
    : [];

  /* --- Pool 2: leveled quiz questions from the scoped/weak theme --- */
  const quizBlocks: SessionBlock[] = buildThemeQuiz(scopeTheme, difficulty, 5).map(
    (question): SessionBlock => ({ kind: "quiz", key: `qz_${question.id}`, question }),
  );

  /* --- Pool 3: grammar micro-drills. Pinned to the studied topic when the
     Grammatik lesson launched the session (?grammar=), with more drills so the
     lesson's own topic leads; otherwise one random topic. --- */
  const pinnedTopic = opts.grammarTopicId
    ? grammar.find((g) => g.id === opts.grammarTopicId)
    : undefined;
  const grammarTopic = pinnedTopic ?? sample(grammar, 1)[0];
  const grammarDrillCount = pinnedTopic ? 4 : 2;
  const grammarBlocks: SessionBlock[] = grammarTopic
    ? sample(grammarTopic.drills, Math.min(grammarDrillCount, grammarTopic.drills.length)).map(
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

  /* --- Pool 6: one Lesen/Hören comprehension block (task 4.4). Authentic
     input feeds XP + theme progress, never vocab FSRS, so it stays out of the
     retrieval pools above. Prefer a text on the scoped/weak theme, else one in
     the Mode lens, else any. A voicemail plays as listening when TTS exists. --- */
  const readingLensPool = texts.filter((t) => {
    if (mode === "both") return true;
    const ctx = themeById(t.themeId)?.context ?? "both";
    return ctx === mode || ctx === "both";
  });
  const scopedTexts = readingLensPool.filter((t) => t.themeId === scopeTheme);
  const readingSource = scopedTexts.length
    ? scopedTexts
    : readingLensPool.length
      ? readingLensPool
      : texts;
  const readingText = sample(readingSource, 1)[0];
  const readingBlocks: SessionBlock[] = readingText
    ? [
        {
          kind: "reading",
          key: `rd_${readingText.id}`,
          textId: readingText.id,
          listening: readingText.kind === "voicemail" && !!opts.listening,
        },
      ]
    : [];

  /* --- Mission focus: the exact items the linked mission exercises, practised
     first and regardless of due state, so Üben mission N mirrors Spielen mission
     N (founder rule). Missing ids (should not happen; linted) are dropped. --- */
  const focusVocabBlocks: SessionBlock[] = (opts.focus?.vocabIds ?? [])
    .map((id) => vocabulary.find((v) => v.id === id))
    .filter((v): v is (typeof vocabulary)[number] => !!v)
    .map((v): SessionBlock =>
      graduatedToTyping(srs[v.id])
        ? { kind: "typing", key: `ty_${v.id}`, sourceId: v.id, de: v.de, en: v.en, example: v.examples[0]?.de }
        : {
            kind: "flashcard",
            key: `fc_${v.id}`,
            source: "vocab",
            sourceId: v.id,
            de: v.de,
            en: v.en,
            example: v.examples[0]?.de,
          },
    );
  const focusRedeBlocks: SessionBlock[] = (opts.focus?.redemittelIds ?? [])
    .map((id) => redemittel.find((r) => r.id === id))
    .filter((r): r is (typeof redemittel)[number] => !!r)
    .map((r): SessionBlock => ({
      kind: "flashcard",
      key: `fc_rede_${r.id}`,
      source: "redemittel",
      sourceId: r.id,
      de: r.de,
      en: r.en,
      example: r.example.de,
    }));

  // Focus mode leads with the mission's own items and fills from its theme
  // (quiz, due vocab, reading); the untethered grammar drill + random Redemittel
  // are dropped so nothing unrelated to the mission shows up.
  const blocks = opts.focus
    ? interleave(
        [focusVocabBlocks, focusRedeBlocks, quizBlocks, vocabBlocks, readingBlocks, speakingBlocks],
        limit,
      )
    : interleave(
        [vocabBlocks, quizBlocks, grammarBlocks, redeBlocks, speakingBlocks, readingBlocks],
        limit,
      );

  const due = dueCount(srs);
  const preview = buildPreview(due, band, (opts.focus ? focusRedeBlocks : redeBlocks).length);
  const focus = opts.focus
    ? (themeById(scopeTheme)?.titleDe ?? weakLabel(srs, scopeTheme))
    : grammarTopic
      ? grammarTopic.titleDe
      : weakLabel(srs, scopeTheme);

  return { blocks, minutes, preview, focus };
}
