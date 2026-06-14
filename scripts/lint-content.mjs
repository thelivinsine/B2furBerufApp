/**
 * Content linter for the static data banks in `src/data`.
 *
 * Catches the mechanical mistakes that TypeScript cannot: duplicate ids
 * (which silently drop React-keyed cards), broken dialogue branches, missing
 * or empty required fields, dangling cross-references, and em dashes in
 * user-facing copy (the CLAUDE.md writing rule).
 *
 * It loads the real `.ts` data modules through Vite's `ssrLoadModule`, so it
 * uses the project's exact transform + `@/` alias with no extra dependency
 * (Vite is already a devDependency). Run with `pnpm lint:content`.
 *
 * Errors fail the process (CI gate). Warnings are advisory and never fail.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/* ---- valid value sets (mirror of src/types/index.ts string unions) ---- */
const THEME_IDS = [
  "meetings", "scheduling", "logistics", "customer", "conflict",
  "project", "technology", "sustainability", "safety", "travel",
];
const POS = ["noun", "verb", "adjective", "adverb", "phrase", "connector"];
const REDEMITTEL_CATEGORIES = [
  "suggestions", "agree", "disagree", "negotiation", "compromise",
  "clarification", "opinion", "prosCons", "reactions",
];
const REDEMITTEL_REGISTERS = ["neutral", "formal", "diplomatic"];
const COLLOCATION_REGISTERS = ["neutral", "formal"];
const GRAMMAR_GROUPS = [
  "connectors", "relativeClauses", "prepositionalPronouns", "collocations",
  "verbPosition", "konjunktiv2", "modals", "passive", "subordinate", "cases",
];
const WEAKNESS_CATEGORIES = [
  "verbPosition", "cases", "vocabularyRange", "cohesion", "relativeClauses",
  "daWords", "collocations", "register", "spelling",
];
const SPEAKERS = ["partner", "examiner", "narrator"];
const ARTICLES = ["der", "die", "das"];
const EM_DASH = "—";

/* ---- diagnostics collection ---- */
const errors = [];
const warnings = [];
const error = (dataset, where, msg) => errors.push({ dataset, where, msg });
const warn = (dataset, where, msg) => warnings.push({ dataset, where, msg });

/* ---- small helpers ---- */
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isNum = (v) => typeof v === "number" && Number.isFinite(v);
const truncate = (s) => (s.length > 70 ? `${s.slice(0, 70)}…` : s);

function checkExample(ex, dataset, where) {
  if (!ex || typeof ex !== "object") return error(dataset, where, "example missing");
  if (!isStr(ex.de)) error(dataset, where, "example.de empty");
  if (!isStr(ex.en)) error(dataset, where, "example.en empty");
}

function checkDuplicateIds(items, dataset, idKey = "id") {
  const seen = new Map();
  for (const [i, item] of items.entries()) {
    const id = item?.[idKey];
    if (!isStr(id)) {
      error(dataset, `[${i}]`, `missing ${idKey}`);
      continue;
    }
    if (seen.has(id)) error(dataset, id, `duplicate id (also at index ${seen.get(id)})`);
    else seen.set(id, i);
  }
}

/** Recursively flag any em dash in a string value. */
function scanEmDash(value, where, dataset) {
  if (typeof value === "string") {
    if (value.includes(EM_DASH)) error(dataset, where, `em dash in copy: "${truncate(value)}"`);
  } else if (Array.isArray(value)) {
    value.forEach((v, i) => scanEmDash(v, `${where}[${i}]`, dataset));
  } else if (value && typeof value === "object") {
    for (const k of Object.keys(value)) scanEmDash(value[k], `${where}.${k}`, dataset);
  }
}

/* ------------------------------------------------------------------ */
/* per-dataset validators                                              */
/* ------------------------------------------------------------------ */

function lintThemes(themes) {
  const ds = "themes";
  checkDuplicateIds(themes, ds);
  for (const t of themes) {
    const w = t.id ?? "?";
    if (!THEME_IDS.includes(t.id)) error(ds, w, `unknown theme id "${t.id}"`);
    for (const f of ["title", "titleDe", "blurb", "icon", "accent"]) {
      if (!isStr(t[f])) error(ds, w, `${f} empty`);
    }
    if (!Array.isArray(t.situations) || t.situations.length === 0)
      error(ds, w, "situations empty");
  }
  const present = new Set(themes.map((t) => t.id));
  for (const id of THEME_IDS) if (!present.has(id)) error(ds, id, "theme missing from registry");
}

function lintVocabulary(vocab) {
  const ds = "vocabulary";
  checkDuplicateIds(vocab, ds);
  for (const v of vocab) {
    const w = v.id ?? "?";
    for (const f of ["de", "en", "pron", "context"]) if (!isStr(v[f])) error(ds, w, `${f} empty`);
    if (!POS.includes(v.pos)) error(ds, w, `invalid pos "${v.pos}"`);
    if (!THEME_IDS.includes(v.themeId)) error(ds, w, `invalid themeId "${v.themeId}"`);
    if (!Array.isArray(v.examples) || v.examples.length === 0) error(ds, w, "no examples");
    else v.examples.forEach((ex, i) => checkExample(ex, ds, `${w}.examples[${i}]`));
    if (!Array.isArray(v.related)) error(ds, w, "related must be an array");
    // Every German noun has a gender, so an article is required. Plural is
    // intentionally omitted for uncountable/plural-only nouns, so it is not
    // checked (that is a content-completeness concern, not an integrity one).
    if (v.pos === "noun" && !ARTICLES.includes(v.article))
      error(ds, w, `noun missing/invalid article "${v.article}"`);
  }
}

function lintCollocations(collocations) {
  const ds = "collocations";
  checkDuplicateIds(collocations, ds);
  for (const c of collocations) {
    const w = c.id ?? "?";
    for (const f of ["noun", "verb", "full", "en"]) if (!isStr(c[f])) error(ds, w, `${f} empty`);
    checkExample(c.example, ds, `${w}.example`);
    if (c.register !== undefined && !COLLOCATION_REGISTERS.includes(c.register))
      error(ds, w, `invalid register "${c.register}"`);
    if (c.themeId !== undefined && !THEME_IDS.includes(c.themeId))
      error(ds, w, `invalid themeId "${c.themeId}"`);
    if (isStr(c.id) && !c.id.startsWith("c_")) warn(ds, w, "id should use the c_ prefix");
  }
}

function lintGrammar(grammar) {
  const ds = "grammar";
  checkDuplicateIds(grammar, ds);
  const allDrills = [];
  for (const t of grammar) {
    const w = t.id ?? "?";
    for (const f of ["title", "titleDe", "purpose", "explanation", "pattern"])
      if (!isStr(t[f])) error(ds, w, `${f} empty`);
    if (!GRAMMAR_GROUPS.includes(t.group)) error(ds, w, `invalid group "${t.group}"`);
    if (!Array.isArray(t.examples) || t.examples.length === 0) error(ds, w, "no examples");
    else t.examples.forEach((ex, i) => checkExample(ex, ds, `${w}.examples[${i}]`));
    if (!Array.isArray(t.drills) || t.drills.length === 0) error(ds, w, "no drills");
    else
      for (const d of t.drills) {
        allDrills.push(d);
        const dw = `${w}/${d.id ?? "?"}`;
        if (!isStr(d.prompt)) error(ds, dw, "drill prompt empty");
        if (!isStr(d.answer)) error(ds, dw, "drill answer empty");
        if (d.options !== undefined) {
          if (!Array.isArray(d.options) || d.options.length < 2)
            error(ds, dw, "drill options must have at least 2 entries");
          else if (isStr(d.answer) && !d.options.includes(d.answer))
            error(ds, dw, "drill answer is not among its options");
        }
      }
  }
  // Drill ids must be globally unique so SRS / deep-links don't collide.
  checkDuplicateIds(allDrills, "grammar/drills");
}

function lintScenarios(scenarios) {
  const ds = "dialogues";
  checkDuplicateIds(scenarios, ds);
  for (const s of scenarios) {
    const w = s.id ?? "?";
    for (const f of ["title", "task", "context"]) if (!isStr(s[f])) error(ds, w, `${f} empty`);
    if (!THEME_IDS.includes(s.themeId)) error(ds, w, `invalid themeId "${s.themeId}"`);
    if (![1, 2, 3].includes(s.level)) error(ds, w, `invalid level "${s.level}"`);
    if (!isNum(s.minutes) || s.minutes <= 0) error(ds, w, "minutes must be a positive number");
    if (!Array.isArray(s.targetRedemittel)) error(ds, w, "targetRedemittel must be an array");
    else
      for (const r of s.targetRedemittel)
        if (!REDEMITTEL_CATEGORIES.includes(r)) error(ds, w, `invalid targetRedemittel "${r}"`);

    const nodes = s.nodes;
    if (!nodes || typeof nodes !== "object") {
      error(ds, w, "nodes missing");
      continue;
    }
    const keys = Object.keys(nodes);
    if (keys.length === 0) error(ds, w, "no nodes");
    if (!keys.includes(s.start)) error(ds, w, `start "${s.start}" is not a node`);

    for (const key of keys) {
      const node = nodes[key];
      const nw = `${w}/${key}`;
      if (node.id !== key) error(ds, nw, `node.id "${node.id}" does not match its key`);
      if (!SPEAKERS.includes(node.speaker)) error(ds, nw, `invalid speaker "${node.speaker}"`);
      if (!isStr(node.line)) error(ds, nw, "line empty");

      const optionIds = new Set();
      if (node.options !== undefined) {
        if (!Array.isArray(node.options) || node.options.length === 0)
          error(ds, nw, "options present but empty");
        else
          for (const o of node.options) {
            if (!isStr(o.id)) error(ds, nw, "option missing id");
            else if (optionIds.has(o.id)) error(ds, nw, `duplicate option id "${o.id}"`);
            else optionIds.add(o.id);
            if (!isStr(o.text)) error(ds, `${nw}/${o.id ?? "?"}`, "option text empty");
            if (!keys.includes(o.next))
              error(ds, `${nw}/${o.id ?? "?"}`, `option.next "${o.next}" is not a node`);
            if (o.uses !== undefined && !REDEMITTEL_CATEGORIES.includes(o.uses))
              error(ds, `${nw}/${o.id ?? "?"}`, `option.uses "${o.uses}" invalid`);
            if (o.quality !== undefined && (!isNum(o.quality) || o.quality < 0 || o.quality > 1))
              error(ds, `${nw}/${o.id ?? "?"}`, `option.quality "${o.quality}" out of 0..1`);
          }
      }
      if (node.next !== undefined && !keys.includes(node.next))
        error(ds, nw, `next "${node.next}" is not a node`);
      // Every node must be able to continue or be explicitly terminal.
      const canContinue = (node.options && node.options.length) || node.next || node.end === true;
      if (!canContinue) error(ds, nw, "dead end: no options, no next, not marked end");
    }

    // Reachability: walk from start, flag nodes nothing points to.
    if (keys.includes(s.start)) {
      const reached = new Set();
      const stack = [s.start];
      while (stack.length) {
        const k = stack.pop();
        if (reached.has(k) || !nodes[k]) continue;
        reached.add(k);
        const node = nodes[k];
        if (node.next) stack.push(node.next);
        for (const o of node.options ?? []) if (o.next) stack.push(o.next);
      }
      for (const key of keys) if (!reached.has(key)) error(ds, `${w}/${key}`, "orphan node (unreachable)");
    }
  }
}

function lintExamSets(examSets, scenarioIds) {
  const ds = "examSets";
  checkDuplicateIds(examSets, ds);
  for (const e of examSets) {
    const w = e.id ?? "?";
    for (const f of ["title", "taskSheet"]) if (!isStr(e[f])) error(ds, w, `${f} empty`);
    if (!THEME_IDS.includes(e.themeId)) error(ds, w, `invalid themeId "${e.themeId}"`);
    if (!Array.isArray(e.aspects) || e.aspects.length === 0) error(ds, w, "aspects empty");
    if (!isNum(e.totalMinutes) || e.totalMinutes <= 0) error(ds, w, "totalMinutes must be positive");
    if (!scenarioIds.has(e.scenarioId)) error(ds, w, `scenarioId "${e.scenarioId}" not found`);
    if (!Array.isArray(e.rubric) || e.rubric.length === 0) error(ds, w, "rubric empty");
    else {
      const rubricIds = new Set();
      for (const c of e.rubric) {
        if (!isStr(c.id)) error(ds, w, "rubric criterion missing id");
        else if (rubricIds.has(c.id)) error(ds, w, `duplicate rubric id "${c.id}"`);
        else rubricIds.add(c.id);
        if (!isStr(c.label) || !isStr(c.description))
          error(ds, `${w}/${c.id ?? "?"}`, "rubric label/description empty");
      }
    }
  }
}

function lintRedemittel(redemittel) {
  const ds = "redemittel";
  checkDuplicateIds(redemittel, ds);
  for (const r of redemittel) {
    const w = r.id ?? "?";
    for (const f of ["de", "en"]) if (!isStr(r[f])) error(ds, w, `${f} empty`);
    if (!REDEMITTEL_CATEGORIES.includes(r.category)) error(ds, w, `invalid category "${r.category}"`);
    if (!REDEMITTEL_REGISTERS.includes(r.register)) error(ds, w, `invalid register "${r.register}"`);
    checkExample(r.example, ds, `${w}.example`);
  }
}

function lintPracticeAreas(practiceAreas) {
  const ds = "practiceAreas";
  checkDuplicateIds(practiceAreas, ds);
  for (const p of practiceAreas) {
    const w = p.id ?? "?";
    if (!WEAKNESS_CATEGORIES.includes(p.id)) error(ds, w, `unknown weakness id "${p.id}"`);
    for (const f of ["label", "labelDe", "route", "description"])
      if (!isStr(p[f])) error(ds, w, `${f} empty`);
  }
}

function lintWritingPrompts(writingPrompts) {
  const ds = "writingPrompts";
  for (const id of THEME_IDS)
    if (!writingPrompts[id]) error(ds, id, "no writing prompt for theme");
}

/* ------------------------------------------------------------------ */
/* run                                                                 */
/* ------------------------------------------------------------------ */

async function main() {
  const server = await createServer({
    root,
    configFile: path.join(root, "vite.config.ts"),
    logLevel: "error",
    // SSR module loading does not use the optimized dep bundle, and the
    // background dep scanner (which crawls index.html → App.tsx) otherwise
    // races with server.close(). Turn discovery off.
    optimizeDeps: { noDiscovery: true, entries: [] },
    server: { middlewareMode: true, hmr: false },
    appType: "custom",
  });

  let data;
  try {
    const load = (p) => server.ssrLoadModule(p);
    const [vocab, colloc, gram, dia, exams, rede, themes, areas, writing] = await Promise.all([
      load("/src/data/vocabulary.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/dialogues.ts"),
      load("/src/data/examSets.ts"),
      load("/src/data/redemittel.ts"),
      load("/src/data/themes.ts"),
      load("/src/data/practiceAreas.ts"),
      load("/src/data/writingPrompts.ts"),
    ]);
    data = {
      vocabulary: vocab.vocabulary,
      collocations: colloc.collocations,
      grammar: gram.grammar,
      scenarios: dia.scenarios,
      examSets: exams.examSets,
      redemittel: rede.redemittel,
      themes: themes.themes,
      practiceAreas: areas.practiceAreas,
      writingPrompts: writing.writingPrompts,
    };
  } finally {
    await server.close();
  }

  lintThemes(data.themes);
  lintVocabulary(data.vocabulary);
  lintCollocations(data.collocations);
  lintGrammar(data.grammar);
  lintScenarios(data.scenarios);
  lintExamSets(data.examSets, new Set(data.scenarios.map((s) => s.id)));
  lintRedemittel(data.redemittel);
  lintPracticeAreas(data.practiceAreas);
  lintWritingPrompts(data.writingPrompts);

  // Em-dash sweep across every user-facing string in every bank.
  for (const [name, items] of Object.entries(data)) scanEmDash(items, name, name);

  /* ---- report ---- */
  const counts = {
    themes: data.themes.length,
    vocabulary: data.vocabulary.length,
    collocations: data.collocations.length,
    grammar: data.grammar.length,
    "grammar drills": data.grammar.reduce((n, t) => n + (t.drills?.length ?? 0), 0),
    dialogues: data.scenarios.length,
    examSets: data.examSets.length,
    redemittel: data.redemittel.length,
    practiceAreas: data.practiceAreas.length,
  };
  console.log("Content lint — checked:");
  for (const [k, v] of Object.entries(counts)) console.log(`  ${String(v).padStart(4)} ${k}`);

  if (warnings.length) {
    console.log(`\n⚠ ${warnings.length} warning(s):`);
    for (const w of warnings) console.log(`  [${w.dataset}] ${w.where}: ${w.msg}`);
  }

  if (errors.length) {
    console.error(`\n✖ ${errors.length} error(s):`);
    for (const e of errors) console.error(`  [${e.dataset}] ${e.where}: ${e.msg}`);
    console.error("\nContent lint failed.");
    process.exitCode = 1;
  } else {
    console.log("\n✔ Content lint passed. No errors.");
  }
}

main().catch((err) => {
  console.error("Content lint crashed:", err);
  process.exitCode = 1;
});
