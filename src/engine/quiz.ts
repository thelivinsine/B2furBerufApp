import type {
  Difficulty,
  QuizQuestion,
  MCQQuestion,
  WordOrderQuestion,
  MatchingQuestion,
  ThemeId,
  VocabItem,
  Collocation,
} from "@/types";
import { vocabByTheme, vocabulary } from "@/data/vocabulary";
import { collocationsByTheme, collocations } from "@/data/collocations";
import { sample, shuffle } from "@/lib/utils";
import { XP } from "@/engine/scoring";

/**
 * Generates mixed, leveled quiz sets from existing content (vocab,
 * collocations, connectors) so all themes × 3 difficulties are covered
 * automatically — no per-theme hand-authoring. Mirrors the distractor /
 * sampling approach used in VocabQuiz.buildQuiz.
 *
 * Level 1 (Leicht / recognition): translation, article, matching.
 * Level 2 (Mittel / production-lite): plural, cloze, collocationFill, connectorChoice.
 * Level 3 (Schwer / application): wordOrder, relativePronoun, daWord.
 */

/** XP for a correct answer at the given difficulty. */
export function quizXp(difficulty: Difficulty): number {
  return difficulty === 1 ? XP.quizEasy : difficulty === 2 ? XP.quizMedium : XP.quizHard;
}

let seq = 0;
const qid = (kind: string) => `q_${kind}_${Date.now().toString(36)}_${seq++}`;

/* ---------------- Connector & grammar mini-banks (theme-agnostic) ---------------- */

const connectorBank: { prompt: string; answer: string; distractors: string[]; gloss: string }[] = [
  {
    prompt: "Es war teuer, ___ hat es sich gelohnt.",
    answer: "trotzdem",
    distractors: ["deshalb", "weil", "damit"],
    gloss: "It was expensive, nevertheless it was worth it.",
  },
  {
    prompt: "Wir haben wenig Zeit, ___ müssen wir uns entscheiden.",
    answer: "deshalb",
    distractors: ["trotzdem", "obwohl", "sobald"],
    gloss: "We have little time, that's why we have to decide.",
  },
  {
    prompt: "Das Angebot ist gut, ___ fehlt uns das Budget.",
    answer: "jedoch",
    distractors: ["damit", "weil", "sobald"],
    gloss: "The offer is good, however we lack the budget.",
  },
  {
    prompt: "Der Plan spart Geld; ___ senkt er die Emissionen.",
    answer: "außerdem",
    distractors: ["trotzdem", "jedoch", "obwohl"],
    gloss: "The plan saves money; besides, it lowers emissions.",
  },
  {
    prompt: "Ich melde mich, ___ der Termin feststeht.",
    answer: "sobald",
    distractors: ["deshalb", "trotzdem", "außerdem"],
    gloss: "I'll get in touch as soon as the date is fixed.",
  },
  {
    prompt: "Wir digitalisieren die Abläufe; ___ sparen wir Zeit.",
    answer: "dadurch",
    distractors: ["obwohl", "jedoch", "sobald"],
    gloss: "We digitise the processes; as a result we save time.",
  },
];

const relativeBank: { prompt: string; answer: string; distractors: string[]; gloss: string }[] = [
  {
    prompt: "Das ist der Bericht, ___ ich gestern geschrieben habe.",
    answer: "den",
    distractors: ["der", "dem", "dessen"],
    gloss: "That's the report that I wrote yesterday.",
  },
  {
    prompt: "Die Kundin, ___ wir geholfen haben, kommt wieder.",
    answer: "der",
    distractors: ["die", "den", "deren"],
    gloss: "The customer whom we helped is coming back.",
  },
  {
    prompt: "Das Team, mit ___ ich arbeite, ist motiviert.",
    answer: "dem",
    distractors: ["den", "das", "der"],
    gloss: "The team I work with is motivated.",
  },
  {
    prompt: "Der Kollege, ___ das Projekt leitet, ist im Urlaub.",
    answer: "der",
    distractors: ["den", "dem", "dessen"],
    gloss: "The colleague who leads the project is on holiday.",
  },
  {
    prompt: "Die Lösung, ___ wir gefunden haben, ist günstig.",
    answer: "die",
    distractors: ["der", "den", "deren"],
    gloss: "The solution that we found is cheap.",
  },
];

const daWordBank: { prompt: string; answer: string; distractors: string[]; gloss: string }[] = [
  {
    prompt: "Wir haben über die Kosten gesprochen. – Ja, wir haben ___ gesprochen.",
    answer: "darüber",
    distractors: ["davon", "damit", "dafür"],
    gloss: "We talked about the costs. – Yes, we talked about it.",
  },
  {
    prompt: "Ich freue mich ___, bald anzufangen.",
    answer: "darauf",
    distractors: ["davon", "darüber", "dafür"],
    gloss: "I'm looking forward to starting soon.",
  },
  {
    prompt: "___ wartest du? – Auf die Antwort des Kunden.",
    answer: "Worauf",
    distractors: ["Worüber", "Womit", "Wovon"],
    gloss: "What are you waiting for? – For the customer's reply.",
  },
  {
    prompt: "Das Tool ist neu. Wir müssen uns erst ___ gewöhnen.",
    answer: "daran",
    distractors: ["darauf", "davon", "darüber"],
    gloss: "The tool is new. We first have to get used to it.",
  },
];

/* ---------------- Question builders ---------------- */

function translationQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion {
  const distractors = sample(pool.filter((v) => v.id !== item.id), 3).map((v) => v.en);
  return {
    id: qid("translation"),
    kind: "translation",
    difficulty,
    themeId: item.themeId,
    prompt: item.de,
    answer: item.en,
    options: shuffle([item.en, ...distractors]),
    sourceId: item.id,
    hint: "Was bedeutet das Wort?",
  };
}

function articleQ(item: VocabItem, difficulty: Difficulty): MCQQuestion {
  const bare = item.de.replace(/^(der|die|das)\s+/i, "");
  return {
    id: qid("article"),
    kind: "article",
    difficulty,
    themeId: item.themeId,
    prompt: `___ ${bare}`,
    answer: item.article!,
    options: shuffle(["der", "die", "das"]),
    sourceId: item.id,
    hint: "Welcher Artikel passt?",
    explain: `${item.article} ${bare} – ${item.en}`,
  };
}

function pluralQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion {
  const distractors = sample(
    pool.filter((v) => v.id !== item.id && v.plural),
    3,
  ).map((v) => v.plural!);
  return {
    id: qid("plural"),
    kind: "plural",
    difficulty,
    themeId: item.themeId,
    prompt: `Plural von „${item.de}\"?`,
    answer: item.plural!,
    options: shuffle([item.plural!, ...distractors]),
    sourceId: item.id,
    hint: "Wie lautet die Pluralform?",
  };
}

function clozeQ(item: VocabItem, pool: VocabItem[], difficulty: Difficulty): MCQQuestion | null {
  // Blank the headword inside one of its example sentences.
  const head = item.de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0];
  const ex = item.examples.find((e) => new RegExp(`\\b${escapeReg(head)}`, "i").test(e.de));
  if (!ex || head.length < 3) return null;
  const blanked = ex.de.replace(new RegExp(`\\b${escapeReg(head)}\\w*`, "i"), "___");
  if (!blanked.includes("___")) return null;
  const distractors = sample(
    pool.filter((v) => v.id !== item.id),
    3,
  ).map((v) => v.de.replace(/^(der|die|das|sich)\s+/i, "").split(" ")[0]);
  return {
    id: qid("cloze"),
    kind: "cloze",
    difficulty,
    themeId: item.themeId,
    prompt: blanked,
    answer: head,
    options: shuffle([head, ...distractors]),
    sourceId: item.id,
    hint: ex.en,
  };
}

function collocationFillQ(
  c: Collocation,
  pool: Collocation[],
  difficulty: Difficulty,
): MCQQuestion {
  const distractors = sample(
    pool.filter((x) => x.id !== c.id && x.verb !== c.verb),
    3,
  ).map((x) => x.verb);
  return {
    id: qid("collocationFill"),
    kind: "collocationFill",
    difficulty,
    themeId: (c.themeId ?? "general") as ThemeId | "general",
    prompt: `${c.noun} ___`,
    answer: c.verb,
    options: shuffle([c.verb, ...distractors]),
    sourceId: c.id,
    hint: c.en,
    explain: `${c.full} – ${c.en}`,
  };
}

function connectorChoiceQ(difficulty: Difficulty): MCQQuestion {
  const b = sample(connectorBank, 1)[0];
  return {
    id: qid("connectorChoice"),
    kind: "connectorChoice",
    difficulty,
    themeId: "general",
    prompt: b.prompt,
    answer: b.answer,
    options: shuffle([b.answer, ...b.distractors]),
    hint: b.gloss,
  };
}

function relativePronounQ(difficulty: Difficulty): MCQQuestion {
  const b = sample(relativeBank, 1)[0];
  return {
    id: qid("relativePronoun"),
    kind: "relativePronoun",
    difficulty,
    themeId: "general",
    prompt: b.prompt,
    answer: b.answer,
    options: shuffle([b.answer, ...b.distractors]),
    hint: b.gloss,
  };
}

function daWordQ(difficulty: Difficulty): MCQQuestion {
  const b = sample(daWordBank, 1)[0];
  return {
    id: qid("daWord"),
    kind: "daWord",
    difficulty,
    themeId: "general",
    prompt: b.prompt,
    answer: b.answer,
    options: shuffle([b.answer, ...b.distractors]),
    hint: b.gloss,
  };
}

function matchingQ(items: VocabItem[], difficulty: Difficulty, themeId: ThemeId | "general"): MatchingQuestion | null {
  const picked = sample(items, 4);
  if (picked.length < 3) return null;
  return {
    id: qid("matching"),
    kind: "matching",
    difficulty,
    themeId,
    prompt: "Ordne die deutschen Wörter den Übersetzungen zu.",
    pairs: picked.map((v) => ({ left: v.de, right: v.en })),
  };
}

function wordOrderQ(c: Collocation, difficulty: Difficulty): WordOrderQuestion {
  const sentence = c.example.de;
  const tokens = sentence.replace(/[.?!]$/, "").split(" ");
  return {
    id: qid("wordOrder"),
    kind: "wordOrder",
    difficulty,
    themeId: (c.themeId ?? "general") as ThemeId | "general",
    prompt: "Bring die Wörter in die richtige Reihenfolge.",
    answer: sentence.replace(/[.?!]$/, ""),
    tokens: shuffle(tokens),
    sourceId: c.id,
    hint: c.example.en,
  };
}

/* ---------------- Public API ---------------- */

export function buildThemeQuiz(
  themeId: ThemeId,
  difficulty: Difficulty,
  count = 10,
): QuizQuestion[] {
  const vocab = vocabByTheme(themeId);
  const vocabAll = vocabulary;
  const cols = collocationsByTheme(themeId);
  const colsAll = collocations;
  const nouns = vocab.filter((v) => v.pos === "noun" && v.article);
  const withPlural = vocab.filter((v) => v.plural && !/nur Plural/i.test(v.plural));

  const out: QuizQuestion[] = [];
  const guardN = count * 6;
  let guard = 0;

  const pushUnique = (q: QuizQuestion | null) => {
    if (q) out.push(q);
  };

  while (out.length < count && guard++ < guardN) {
    if (difficulty === 1) {
      // recognition: translation, article, matching
      const roll = Math.random();
      if (roll < 0.5 && vocab.length >= 4) {
        pushUnique(translationQ(sample(vocab, 1)[0], vocabAll, difficulty));
      } else if (roll < 0.8 && nouns.length > 0) {
        pushUnique(articleQ(sample(nouns, 1)[0], difficulty));
      } else if (vocab.length >= 4) {
        pushUnique(matchingQ(vocab, difficulty, themeId));
      } else if (vocab.length >= 4) {
        pushUnique(translationQ(sample(vocab, 1)[0], vocabAll, difficulty));
      }
    } else if (difficulty === 2) {
      // production-lite: plural, cloze, collocationFill, connectorChoice
      const roll = Math.random();
      if (roll < 0.3 && withPlural.length >= 4) {
        pushUnique(pluralQ(sample(withPlural, 1)[0], vocabAll, difficulty));
      } else if (roll < 0.55 && vocab.length >= 4) {
        pushUnique(clozeQ(sample(vocab, 1)[0], vocabAll, difficulty));
      } else if (roll < 0.8 && cols.length >= 4) {
        pushUnique(collocationFillQ(sample(cols, 1)[0], colsAll, difficulty));
      } else {
        pushUnique(connectorChoiceQ(difficulty));
      }
    } else {
      // application: wordOrder, relativePronoun, daWord
      const roll = Math.random();
      if (roll < 0.4 && cols.length > 0) {
        pushUnique(wordOrderQ(sample(cols, 1)[0], difficulty));
      } else if (roll < 0.7) {
        pushUnique(relativePronounQ(difficulty));
      } else {
        pushUnique(daWordQ(difficulty));
      }
    }
  }

  // Fallback: if a sparse theme couldn't fill the set, top up with translations.
  while (out.length < Math.min(count, 4) && vocab.length >= 4) {
    out.push(translationQ(sample(vocab, 1)[0], vocabAll, difficulty));
  }

  return out.slice(0, count);
}

function escapeReg(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
