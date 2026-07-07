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

/* ---- provenance: allowed license identifiers (must match ProvenanceLicense) ---- */
const LICENSE_ALLOWLIST = new Set([
  "OWNED", "CC0-1.0", "CC-BY-4.0", "CC-BY-3.0", "CC-BY-2.0", "CC-BY-2.0-FR",
  "CC-BY-SA-4.0", "Public-Domain",
]);

/* ---- valid value sets (mirror of src/types/index.ts string unions) ---- */
const THEME_IDS = [
  "meetings", "scheduling", "logistics", "customer", "conflict",
  "project", "technology", "sustainability", "safety", "travel",
  "behoerde", "arzt",
];
const POS = ["noun", "verb", "adjective", "adverb", "phrase", "connector"];
const REDEMITTEL_CATEGORIES = [
  "suggestions", "agree", "disagree", "negotiation", "compromise",
  "clarification", "opinion", "prosCons", "reactions",
];
const REDEMITTEL_REGISTERS = ["neutral", "formal", "diplomatic"];
const COLLOCATION_REGISTERS = ["neutral", "formal", "diplomatic"];
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

/* ---- taxonomy facets (mirror of src/types/index.ts unions, Phase 0) ---- */
const DOMAIN_IDS = [
  "beruf", "arbeitswelt", "alltag", "gesundheit", "bildung", "pruefung",
];
const CONTEXT_TAGS = ["work", "personal", "both"];
const CEFR_LEVELS = ["A2", "B1.1", "B1.2", "B2.1", "B2.2", "C1"];
const FREQUENCIES = ["core", "common", "specialized"];
const WORK_SECTORS = ["care", "office", "trades", "it", "retail", "hospitality"];
const COUNTERPARTS = ["manager", "colleague", "customer", "team"];
const WORK_SITUATIONS = [
  "meeting", "shift-handover", "customer-call", "instructions",
  "onboarding", "sick-leave", "review",
];
const TASK_TYPES = ["email", "phone-call", "report", "instruction", "presentation"];
const TEXT_KINDS = ["letter", "email", "memo", "announcement", "voicemail"];

/* ---- game enums (mirror of src/types/game.ts unions, game G1) ---- */
const CHAPTER_IDS = ["kap1", "kap2", "kap3", "kap4", "kap5", "kap6"];
const SCENE_KINDS = [
  "cutscene", "websiteParody", "loadout", "listening", "dialogueBattle", "formCloze",
];
const SCENE_SETTINGS = ["website", "wohnung", "strasse", "wartezimmer", "amt"];
const BATTLE_EFFECTS = ["beamtendeutsch", "missverstaendnis", "smalltalk"];
// Sprite keys with real art in src/features/welt/stage.tsx NPC_SPRITES; an
// npc.sprite outside this list silently renders nothing, so keep in sync.
const GAME_SPRITES = ["schmidt"];

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
    for (const f of ["title", "titleDe", "blurb", "blurbDe", "icon", "accent"]) {
      if (!isStr(t[f])) error(ds, w, `${f} empty`);
    }
    if (!Array.isArray(t.situations) || t.situations.length === 0)
      error(ds, w, "situations empty");
    if (t.domain !== undefined && !DOMAIN_IDS.includes(t.domain))
      error(ds, w, `invalid domain "${t.domain}"`);
    if (t.context !== undefined && !CONTEXT_TAGS.includes(t.context))
      error(ds, w, `invalid context "${t.context}"`);
    if (t.subThemes !== undefined) {
      if (!Array.isArray(t.subThemes)) error(ds, w, "subThemes must be an array");
      else {
        const seen = new Set();
        for (const st of t.subThemes) {
          if (!isStr(st.id)) error(ds, w, "subTheme id empty");
          else if (seen.has(st.id)) error(ds, w, `duplicate subTheme id "${st.id}"`);
          else seen.add(st.id);
          for (const f of ["title", "titleDe"])
            if (!isStr(st[f])) error(ds, `${w}.${st.id ?? "?"}`, `subTheme ${f} empty`);
        }
      }
    }
  }
  const present = new Set(themes.map((t) => t.id));
  for (const id of THEME_IDS) if (!present.has(id)) error(ds, id, "theme missing from registry");
}

function lintDomains(domains) {
  const ds = "domains";
  checkDuplicateIds(domains, ds);
  for (const d of domains) {
    const w = d.id ?? "?";
    if (!DOMAIN_IDS.includes(d.id)) error(ds, w, `unknown domain id "${d.id}"`);
    for (const f of ["title", "titleDe"]) {
      if (!isStr(d[f])) error(ds, w, `${f} empty`);
    }
    if (!CONTEXT_TAGS.includes(d.context))
      error(ds, w, `invalid context "${d.context}"`);
  }
  const present = new Set(domains.map((d) => d.id));
  for (const id of DOMAIN_IDS) if (!present.has(id)) error(ds, id, "domain missing from registry");
}

/** Build themeId -> Set(subThemeId) from the theme registry. */
function buildSubThemeIndex(themes) {
  const idx = new Map();
  for (const t of themes) idx.set(t.id, new Set((t.subThemes ?? []).map((s) => s.id)));
  return idx;
}

/** Validate an item's optional subThemeId against its theme's declared sub-themes. */
function checkSubTheme(item, themeId, subThemeIndex, ds, w) {
  if (item.subThemeId === undefined) return;
  const declared = subThemeIndex.get(themeId);
  if (!declared || !declared.has(item.subThemeId))
    error(ds, w, `subThemeId "${item.subThemeId}" not declared on theme "${themeId}"`);
}

function lintVocabulary(vocab, subThemeIndex) {
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
    if (v.cefr !== undefined && !CEFR_LEVELS.includes(v.cefr))
      error(ds, w, `invalid cefr "${v.cefr}"`);
    if (v.frequency !== undefined && !FREQUENCIES.includes(v.frequency))
      error(ds, w, `invalid frequency "${v.frequency}"`);
    if (v.sector !== undefined && !WORK_SECTORS.includes(v.sector))
      error(ds, w, `invalid sector "${v.sector}"`);
    if (v.workSituation !== undefined && !WORK_SITUATIONS.includes(v.workSituation))
      error(ds, w, `invalid workSituation "${v.workSituation}"`);
    checkSubTheme(v, v.themeId, subThemeIndex, ds, w);
  }
}

function lintCollocations(collocations, subThemeIndex) {
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
    if (c.cefr !== undefined && !CEFR_LEVELS.includes(c.cefr))
      error(ds, w, `invalid cefr "${c.cefr}"`);
    if (c.frequency !== undefined && !FREQUENCIES.includes(c.frequency))
      error(ds, w, `invalid frequency "${c.frequency}"`);
    if (c.sector !== undefined && !WORK_SECTORS.includes(c.sector))
      error(ds, w, `invalid sector "${c.sector}"`);
    if (c.workSituation !== undefined && !WORK_SITUATIONS.includes(c.workSituation))
      error(ds, w, `invalid workSituation "${c.workSituation}"`);
    if (c.themeId !== undefined) checkSubTheme(c, c.themeId, subThemeIndex, ds, w);
  }
}

function lintGrammar(grammar) {
  const ds = "grammar";
  checkDuplicateIds(grammar, ds);
  const allDrills = [];
  for (const t of grammar) {
    const w = t.id ?? "?";
    for (const f of ["title", "titleDe", "purpose", "purposeDe", "explanation", "pattern"])
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
    if (r.cefr !== undefined && !CEFR_LEVELS.includes(r.cefr))
      error(ds, w, `invalid cefr "${r.cefr}"`);
    if (r.themeId !== undefined && !THEME_IDS.includes(r.themeId))
      error(ds, w, `invalid themeId "${r.themeId}"`);
    if (r.counterpart !== undefined && !COUNTERPARTS.includes(r.counterpart))
      error(ds, w, `invalid counterpart "${r.counterpart}"`);
    if (r.taskType !== undefined && !TASK_TYPES.includes(r.taskType))
      error(ds, w, `invalid taskType "${r.taskType}"`);
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

function lintCanDo(canDoStatements) {
  const ds = "canDo";
  checkDuplicateIds(canDoStatements, ds);
  for (const c of canDoStatements) {
    const w = c.id ?? "?";
    if (!THEME_IDS.includes(c.themeId)) error(ds, w, `unknown themeId "${c.themeId}"`);
    if (!CEFR_LEVELS.includes(c.cefr)) error(ds, w, `invalid cefr "${c.cefr}"`);
    for (const f of ["statement", "en"])
      if (!isStr(c[f])) error(ds, w, `${f} empty`);
    if (isStr(c.statement) && !c.statement.startsWith("Ich kann"))
      error(ds, w, `statement must start with "Ich kann" (got "${truncate(c.statement)}")`);
    if (!isNum(c.threshold) || c.threshold <= 0 || c.threshold > 1)
      error(ds, w, `threshold must be a number in (0, 1], got ${c.threshold}`);
  }
  // Every theme should carry at least one milestone so Fortschritt never shows
  // an empty Can-Do section for a theme the learner is working on.
  const themesCovered = new Set(canDoStatements.map((c) => c.themeId));
  for (const id of THEME_IDS)
    if (!themesCovered.has(id)) error(ds, id, "theme has no Can-Do statement");
}

function lintTexts(texts, subThemeIndex) {
  const ds = "texts";
  checkDuplicateIds(texts, ds);
  const allChecks = [];
  for (const t of texts) {
    const w = t.id ?? "?";
    if (isStr(t.id) && !t.id.startsWith("tx_")) warn(ds, w, "id should use the tx_ prefix");
    if (!TEXT_KINDS.includes(t.kind)) error(ds, w, `invalid kind "${t.kind}"`);
    if (!THEME_IDS.includes(t.themeId)) error(ds, w, `invalid themeId "${t.themeId}"`);
    if (!CEFR_LEVELS.includes(t.cefr)) error(ds, w, `invalid cefr "${t.cefr}"`);
    for (const f of ["title", "titleEn", "de", "en"]) if (!isStr(t[f])) error(ds, w, `${f} empty`);
    checkSubTheme(t, t.themeId, subThemeIndex, ds, w);
    // The 4.4 renderer shows a comprehension MCQ after every text, so the
    // 2-3 checks per item are part of the content contract, not optional.
    if (!Array.isArray(t.checks) || t.checks.length < 2) {
      error(ds, w, "checks must have at least 2 entries");
      continue;
    }
    if (t.checks.length > 3) warn(ds, w, `${t.checks.length} checks (contract is 2-3)`);
    for (const c of t.checks) {
      allChecks.push(c);
      const cw = `${w}/${c.id ?? "?"}`;
      if (!isStr(c.question)) error(ds, cw, "check question empty");
      if (!Array.isArray(c.options) || c.options.length < 2)
        error(ds, cw, "check options must have at least 2 entries");
      else if (isStr(c.answer) && !c.options.includes(c.answer))
        error(ds, cw, "check answer is not among its options");
      if (!isStr(c.answer)) error(ds, cw, "check answer empty");
    }
  }
  // Check ids must be globally unique so results / deep-links don't collide.
  checkDuplicateIds(allChecks, "texts/checks");
}

/* ------------------------------------------------------------------ */
/* game bank (missions, NPCs, key items)                               */
/* ------------------------------------------------------------------ */

function lintGameRegistries({ chapters, gameNpcs, keyItems }) {
  const ds = "game";
  checkDuplicateIds(chapters, ds);
  for (const c of chapters) {
    const w = c.id ?? "?";
    if (!CHAPTER_IDS.includes(c.id)) error(ds, w, `unknown chapter id "${c.id}"`);
    for (const f of ["title", "titleEn", "district"]) if (!isStr(c[f])) error(ds, w, `chapter ${f} empty`);
  }
  const present = new Set(chapters.map((c) => c.id));
  for (const id of CHAPTER_IDS) if (!present.has(id)) error(ds, id, "chapter missing from registry");

  checkDuplicateIds(gameNpcs, ds);
  for (const n of gameNpcs) {
    const w = n.id ?? "?";
    if (isStr(n.id) && !n.id.startsWith("npc_")) warn(ds, w, "npc id should use the npc_ prefix");
    if (!isStr(n.name)) error(ds, w, "npc name empty");
    if (!n.role || !isStr(n.role.de) || !isStr(n.role.en)) error(ds, w, "npc role.de/en empty");
    if (n.sprite !== undefined && !GAME_SPRITES.includes(n.sprite))
      error(ds, w, `sprite "${n.sprite}" has no art in NPC_SPRITES (stage.tsx)`);
  }

  checkDuplicateIds(keyItems, ds);
  for (const k of keyItems) {
    const w = k.id ?? "?";
    if (isStr(k.id) && !k.id.startsWith("ki_")) warn(ds, w, "key-item id should use the ki_ prefix");
    for (const f of ["de", "en"]) if (!isStr(k[f])) error(ds, w, `key item ${f} empty`);
    if (!k.desc || !isStr(k.desc.de) || !isStr(k.desc.en)) error(ds, w, "key item desc.de/en empty");
  }
}

function checkBiText(v, ds, w, name) {
  if (!v || !isStr(v.de) || !isStr(v.en)) error(ds, w, `${name} must have non-empty de and en`);
}

/**
 * Mission graph integrity: this is what makes a bank of hundreds of missions
 * safe to grow. Scene routing must resolve and reach a win; battle node
 * graphs must resolve, be reachable and hold a win path; every referenced
 * content-bank id, NPC and key item must exist; and every key item a move
 * demands must be obtainable inside the mission (or held at the door), so a
 * mission can never soft-lock.
 */
function lintMissions(missions, refs) {
  const ds = "missions";
  const { vocabIds, redemittelIds, npcIds, keyItemIds } = refs;
  checkDuplicateIds(missions, ds);
  const missionIds = new Set(missions.map((m) => m.id));
  const allCheckRows = [];

  for (const m of missions) {
    const w = m.id ?? "?";
    if (isStr(m.id) && !m.id.startsWith("m_")) warn(ds, w, "mission id should use the m_ prefix");
    if (!CHAPTER_IDS.includes(m.chapter)) error(ds, w, `invalid chapter "${m.chapter}"`);
    if (!isNum(m.index) || m.index <= 0) error(ds, w, "index must be a positive number");
    if (!THEME_IDS.includes(m.themeId)) error(ds, w, `invalid themeId "${m.themeId}"`);
    if (!CEFR_LEVELS.includes(m.cefr)) error(ds, w, `invalid cefr "${m.cefr}"`);
    for (const f of ["title", "titleEn"]) if (!isStr(m[f])) error(ds, w, `${f} empty`);
    checkBiText(m.brief, ds, w, "brief");
    if (!isNum(m.rewardXp) || m.rewardXp < 0) error(ds, w, "rewardXp must be a non-negative number");
    if (m.dictUses !== undefined && (!isNum(m.dictUses) || m.dictUses < 0))
      error(ds, w, "dictUses must be a non-negative number");
    for (const id of m.rewardItems ?? [])
      if (!keyItemIds.has(id)) error(ds, w, `rewardItems "${id}" not in key-item registry`);
    for (const id of m.requiresItems ?? [])
      if (!keyItemIds.has(id)) error(ds, w, `requiresItems "${id}" not in key-item registry`);
    for (const id of m.requiresMissions ?? [])
      if (!missionIds.has(id)) error(ds, w, `requiresMissions "${id}" is not a mission`);

    const scenes = m.scenes;
    if (!scenes || typeof scenes !== "object" || Object.keys(scenes).length === 0) {
      error(ds, w, "scenes missing");
      continue;
    }
    const sceneKeys = Object.keys(scenes);
    if (!sceneKeys.includes(m.start)) error(ds, w, `start "${m.start}" is not a scene`);

    /** Key items obtainable inside this run (door + loadout + scene grants). */
    const obtainable = new Set(m.requiresItems ?? []);

    for (const key of sceneKeys) {
      const s = scenes[key];
      const sw = `${w}/${key}`;
      if (s.id !== key) error(ds, sw, `scene.id "${s.id}" does not match its key`);
      if (!SCENE_KINDS.includes(s.kind)) {
        error(ds, sw, `invalid scene kind "${s.kind}"`);
        continue;
      }
      if (!SCENE_SETTINGS.includes(s.setting)) error(ds, sw, `invalid setting "${s.setting}"`);
      if (s.next !== undefined && !sceneKeys.includes(s.next))
        error(ds, sw, `next "${s.next}" is not a scene`);
      if (s.end !== undefined && s.end !== "win") error(ds, sw, `invalid end "${s.end}"`);
      for (const id of s.grantsItems ?? []) {
        if (!keyItemIds.has(id)) error(ds, sw, `grantsItems "${id}" not in key-item registry`);
        obtainable.add(id);
      }

      const checkChoices = (choices, required) => {
        if (choices === undefined) {
          if (required) error(ds, sw, "choices missing");
          return false;
        }
        if (!Array.isArray(choices) || choices.length === 0) {
          error(ds, sw, "choices present but empty");
          return false;
        }
        const ids = new Set();
        for (const c of choices) {
          if (!isStr(c.id)) error(ds, sw, "choice missing id");
          else if (ids.has(c.id)) error(ds, sw, `duplicate choice id "${c.id}"`);
          else ids.add(c.id);
          for (const f of ["de", "en"]) if (!isStr(c[f])) error(ds, `${sw}/${c.id ?? "?"}`, `choice ${f} empty`);
          if (!sceneKeys.includes(c.next))
            error(ds, `${sw}/${c.id ?? "?"}`, `choice.next "${c.next}" is not a scene`);
        }
        return true;
      };

      let hasChoiceExit = false;
      if (s.kind === "cutscene") {
        if (!Array.isArray(s.lines) || s.lines.length === 0) error(ds, sw, "cutscene has no lines");
        else
          for (const [i, l] of s.lines.entries()) {
            if (!isStr(l.de) || !isStr(l.en)) error(ds, `${sw}.lines[${i}]`, "line de/en empty");
            if (l.speaker !== "du" && l.speaker !== "erzaehler" && !npcIds.has(l.speaker))
              error(ds, `${sw}.lines[${i}]`, `unknown speaker "${l.speaker}"`);
          }
        hasChoiceExit = checkChoices(s.choices, false);
      } else if (s.kind === "websiteParody") {
        for (const f of ["url", "heading", "headingEn"]) if (!isStr(s[f])) error(ds, sw, `${f} empty`);
        if (!Array.isArray(s.lines) || s.lines.length === 0) error(ds, sw, "website has no lines");
        else s.lines.forEach((l, i) => checkBiText(l, ds, `${sw}.lines[${i}]`, "line"));
        if (s.notice !== undefined) checkBiText(s.notice, ds, sw, "notice");
        hasChoiceExit = checkChoices(s.choices, true);
      } else if (s.kind === "loadout") {
        if (s.intro !== undefined) checkBiText(s.intro, ds, sw, "intro");
        if (s.cta !== undefined) checkBiText(s.cta, ds, sw, "cta");
        if (!Array.isArray(s.slots) || s.slots.length === 0) error(ds, sw, "loadout has no slots");
        else {
          const slotIds = new Set();
          for (const slot of s.slots) {
            if (!isStr(slot.id)) error(ds, sw, "slot missing id");
            else if (slotIds.has(slot.id)) error(ds, sw, `duplicate slot id "${slot.id}"`);
            else slotIds.add(slot.id);
            if (!vocabIds.has(slot.vocabId))
              error(ds, `${sw}/${slot.id ?? "?"}`, `slot vocabId "${slot.vocabId}" not in vocabulary`);
            if (slot.grantsItem !== undefined) {
              if (!keyItemIds.has(slot.grantsItem))
                error(ds, `${sw}/${slot.id ?? "?"}`, `grantsItem "${slot.grantsItem}" not in key-item registry`);
              obtainable.add(slot.grantsItem);
            }
          }
        }
        for (const id of s.distractorVocabIds ?? [])
          if (!vocabIds.has(id)) error(ds, sw, `distractor vocabId "${id}" not in vocabulary`);
      } else if (s.kind === "listening") {
        if (s.intro !== undefined) checkBiText(s.intro, ds, sw, "intro");
        if (!Array.isArray(s.audio) || s.audio.length === 0) error(ds, sw, "listening has no audio lines");
        else s.audio.forEach((l, i) => checkBiText(l, ds, `${sw}.audio[${i}]`, "audio line"));
        if (!Array.isArray(s.checks) || s.checks.length < 1 || s.checks.length > 3)
          error(ds, sw, "listening needs 1-3 checks");
        else
          for (const c of s.checks) {
            allCheckRows.push(c);
            const cw = `${sw}/${c.id ?? "?"}`;
            if (!isStr(c.question)) error(ds, cw, "check question empty");
            if (!Array.isArray(c.options) || c.options.length < 2)
              error(ds, cw, "check options must have at least 2 entries");
            else if (isStr(c.answer) && !c.options.includes(c.answer))
              error(ds, cw, "check answer is not among its options");
            if (!isStr(c.answer)) error(ds, cw, "check answer empty");
          }
      } else if (s.kind === "dialogueBattle") {
        if (!npcIds.has(s.npc)) error(ds, sw, `npc "${s.npc}" not in NPC registry`);
        if (!CEFR_LEVELS.includes(s.npcCefr)) error(ds, sw, `invalid npcCefr "${s.npcCefr}"`);
        if (!isNum(s.geduld) || s.geduld <= 0) error(ds, sw, "geduld must be positive");
        if (!isNum(s.mut) || s.mut <= 0) error(ds, sw, "mut must be positive");
        if (s.mutStart !== undefined && (!isNum(s.mutStart) || s.mutStart <= 0 || s.mutStart > s.mut))
          error(ds, sw, `mutStart must be in (0, mut], got ${s.mutStart}`);
        if (!sceneKeys.includes(s.onLose)) error(ds, sw, `onLose "${s.onLose}" is not a scene`);
        const nodes = s.nodes ?? {};
        const nodeKeys = Object.keys(nodes);
        if (!nodeKeys.includes(s.start)) error(ds, sw, `battle start "${s.start}" is not a node`);
        if (!nodeKeys.includes(s.onBarEmpty)) error(ds, sw, `onBarEmpty "${s.onBarEmpty}" is not a node`);
        else if (nodes[s.onBarEmpty].outcome !== "lose")
          error(ds, sw, "onBarEmpty must point to a lose node");
        for (const nk of nodeKeys) {
          const n = nodes[nk];
          const nw = `${sw}/${nk}`;
          if (n.id !== nk) error(ds, nw, `node.id "${n.id}" does not match its key`);
          checkBiText(n.npcLine, ds, nw, "npcLine");
          if (n.effect !== undefined && !BATTLE_EFFECTS.includes(n.effect))
            error(ds, nw, `invalid effect "${n.effect}"`);
          if (n.outcome !== undefined && n.outcome !== "win" && n.outcome !== "lose")
            error(ds, nw, `invalid outcome "${n.outcome}"`);
          if (n.outcome === undefined && !n.ask && (!Array.isArray(n.moves) || n.moves.length === 0))
            error(ds, nw, "non-terminal node has no moves and no ask");
          if (n.ask && n.moves?.length)
            error(ds, nw, "node has both ask and moves (ask nodes answer from the bag only)");
          if (n.outcome !== undefined && (n.moves?.length || n.ask))
            warn(ds, nw, "terminal node has moves/ask (they are unreachable)");
          if (n.ask) {
            const aw = `${nw}/ask`;
            const a = n.ask;
            if (!keyItemIds.has(a.itemId)) error(ds, aw, `ask.itemId "${a.itemId}" not in key-item registry`);
            if (!isNum(a.geduld) || !isNum(a.mut)) error(ds, aw, "ask geduld/mut must be numbers");
            if (!nodeKeys.includes(a.next)) error(ds, aw, `ask.next "${a.next}" is not a node`);
            if (!nodeKeys.includes(a.nextIfMissing))
              error(ds, aw, `ask.nextIfMissing "${a.nextIfMissing}" is not a node`);
            if (a.wrongGeduld !== undefined && (!isNum(a.wrongGeduld) || a.wrongGeduld <= 0))
              error(ds, aw, "ask.wrongGeduld must be a positive number (it is a cost)");
            if (a.vocabId !== undefined && !vocabIds.has(a.vocabId))
              error(ds, aw, `ask.vocabId "${a.vocabId}" not in vocabulary`);
            for (const f of ["wrongFeedback", "feedback", "prompt"])
              if (a[f] !== undefined) checkBiText(a[f], ds, aw, f);
          }
          const moveIds = new Set();
          for (const mv of n.moves ?? []) {
            const mw = `${nw}/${mv.id ?? "?"}`;
            if (!isStr(mv.id)) error(ds, nw, "move missing id");
            else if (moveIds.has(mv.id)) error(ds, nw, `duplicate move id "${mv.id}"`);
            else moveIds.add(mv.id);
            for (const f of ["de", "en"]) if (!isStr(mv[f])) error(ds, mw, `move ${f} empty`);
            if (!isNum(mv.quality) || mv.quality < 0 || mv.quality > 1)
              error(ds, mw, `move quality "${mv.quality}" out of 0..1`);
            if (!isNum(mv.geduld) || !isNum(mv.mut)) error(ds, mw, "move geduld/mut must be numbers");
            if (!nodeKeys.includes(mv.next)) error(ds, mw, `move.next "${mv.next}" is not a node`);
            if (mv.nextIfMissing !== undefined && !nodeKeys.includes(mv.nextIfMissing))
              error(ds, mw, `move.nextIfMissing "${mv.nextIfMissing}" is not a node`);
            if (mv.requiresItem !== undefined) {
              if (!keyItemIds.has(mv.requiresItem))
                error(ds, mw, `requiresItem "${mv.requiresItem}" not in key-item registry`);
              if (mv.nextIfMissing === undefined)
                warn(ds, mw, "requiresItem without nextIfMissing: a missing item replays the same node");
            }
            if (mv.cloze !== undefined && (!isStr(mv.cloze) || !String(mv.de ?? "").includes(mv.cloze)))
              error(ds, mw, `cloze "${mv.cloze}" is not a substring of the move's de`);
            if (mv.redemittelId !== undefined && !redemittelIds.has(mv.redemittelId))
              error(ds, mw, `redemittelId "${mv.redemittelId}" not in redemittel bank`);
            if (mv.vocabId !== undefined && !vocabIds.has(mv.vocabId))
              error(ds, mw, `vocabId "${mv.vocabId}" not in vocabulary`);
            if (mv.feedback !== undefined) checkBiText(mv.feedback, ds, mw, "feedback");
          }
        }
        // Node reachability + a reachable win terminal.
        if (nodeKeys.includes(s.start)) {
          const reached = new Set();
          const stack = [s.start, s.onBarEmpty].filter((k) => nodeKeys.includes(k));
          while (stack.length) {
            const k = stack.pop();
            if (reached.has(k) || !nodes[k]) continue;
            reached.add(k);
            for (const mv of nodes[k].moves ?? []) {
              stack.push(mv.next);
              if (mv.nextIfMissing) stack.push(mv.nextIfMissing);
            }
            if (nodes[k].ask) {
              stack.push(nodes[k].ask.next);
              stack.push(nodes[k].ask.nextIfMissing);
            }
          }
          for (const nk of nodeKeys)
            if (!reached.has(nk)) error(ds, `${sw}/${nk}`, "orphan battle node (unreachable)");
          if (!nodeKeys.some((nk) => reached.has(nk) && nodes[nk].outcome === "win"))
            error(ds, sw, "battle has no reachable win node");
        }
      } else if (s.kind === "formCloze") {
        for (const f of ["title", "titleEn"]) if (!isStr(s[f])) error(ds, sw, `${f} empty`);
        if (s.intro !== undefined) checkBiText(s.intro, ds, sw, "intro");
        if (s.issuer !== undefined) checkBiText(s.issuer, ds, sw, "issuer");
        if (!Array.isArray(s.fields) || s.fields.length === 0) error(ds, sw, "form has no fields");
        else {
          const fieldIds = new Set();
          for (const fl of s.fields) {
            const fw = `${sw}/${fl.id ?? "?"}`;
            if (!isStr(fl.id)) error(ds, sw, "field missing id");
            else if (fieldIds.has(fl.id)) error(ds, sw, `duplicate field id "${fl.id}"`);
            else fieldIds.add(fl.id);
            checkBiText(fl.label, ds, fw, "label");
            if (!isStr(fl.answer)) error(ds, fw, "field answer empty");
            if (fl.options !== undefined) {
              if (!Array.isArray(fl.options) || fl.options.length < 2)
                error(ds, fw, "field options must have at least 2 entries");
              else if (isStr(fl.answer) && !fl.options.includes(fl.answer))
                error(ds, fw, "field answer is not among its options");
            }
            if (fl.hint !== undefined) checkBiText(fl.hint, ds, fw, "hint");
          }
        }
      }

      // Every scene must exit somewhere or end the mission.
      const canExit = s.end === "win" || s.next !== undefined || hasChoiceExit;
      if (!canExit) error(ds, sw, "dead end: no next, no choices, not end:win");
    }

    // Scene reachability from start (next + choices + battle onLose).
    if (sceneKeys.includes(m.start)) {
      const reached = new Set();
      const stack = [m.start];
      while (stack.length) {
        const k = stack.pop();
        if (reached.has(k) || !scenes[k]) continue;
        reached.add(k);
        const s = scenes[k];
        if (s.next) stack.push(s.next);
        if (s.kind === "dialogueBattle" && s.onLose) stack.push(s.onLose);
        for (const c of s.choices ?? []) if (c.next) stack.push(c.next);
      }
      for (const key of sceneKeys)
        if (!reached.has(key)) error(ds, `${w}/${key}`, "orphan scene (unreachable)");
      if (!sceneKeys.some((key) => reached.has(key) && scenes[key].end === "win"))
        error(ds, w, "mission has no reachable end:win scene (not clearable)");
    }

    // Key-item economy: every item a battle move demands must be obtainable
    // in this run (door requirement, loadout slot or scene grant), or the
    // mission can dead-end on an honest player.
    for (const key of sceneKeys) {
      const s = scenes[key];
      if (s.kind !== "dialogueBattle") continue;
      for (const n of Object.values(s.nodes ?? {})) {
        for (const mv of n.moves ?? [])
          if (mv.requiresItem !== undefined && !obtainable.has(mv.requiresItem))
            error(ds, `${w}/${key}`, `move needs "${mv.requiresItem}" but nothing in the mission grants it`);
        if (n.ask && !obtainable.has(n.ask.itemId))
          error(ds, `${w}/${key}`, `ask needs "${n.ask.itemId}" but nothing in the mission grants it`);
      }
    }
  }

  // requiresMissions must be acyclic (chapter progression is a DAG).
  const byId = new Map(missions.map((m) => [m.id, m]));
  const state = new Map(); // id -> 1 visiting, 2 done
  const visit = (id, path) => {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      error(ds, id, `requiresMissions cycle: ${[...path, id].join(" -> ")}`);
      return;
    }
    state.set(id, 1);
    for (const dep of byId.get(id)?.requiresMissions ?? []) {
      if (byId.has(dep)) visit(dep, [...path, id]);
    }
    state.set(id, 2);
  };
  for (const m of missions) visit(m.id, []);

  // requiresItems should be granted by some other mission (dependency chain).
  const grantedSomewhere = new Set(missions.flatMap((m) => m.rewardItems ?? []));
  for (const m of missions)
    for (const id of m.requiresItems ?? [])
      if (!grantedSomewhere.has(id))
        warn(ds, m.id, `requiresItems "${id}" is not rewarded by any mission yet`);

  // Check ids must be globally unique across missions (results/deep-links).
  checkDuplicateIds(allCheckRows, "missions/checks");
}

function lintProvenance(provenance, allContentIds) {
  const ds = "provenance";

  // Build a map for duplicate detection.
  const seen = new Map();
  for (const [i, entry] of provenance.entries()) {
    const id = entry?.content_id;
    if (!isStr(id)) { error(ds, `[${i}]`, "content_id missing"); continue; }
    if (seen.has(id)) error(ds, id, `duplicate provenance row (also at index ${seen.get(id)})`);
    else seen.set(id, i);

    // License must be on the commercial-safe allowlist.
    if (!LICENSE_ALLOWLIST.has(entry.license))
      error(ds, id, `license "${entry.license}" is not on the allowlist (forbidden or unknown)`);

    // Every authored/adapted item should have a non-empty reference — the
    // traceability requirement. Warn (not error) because back-fill is ongoing.
    if ((entry.origin === "authored" || entry.origin === "adapted") && !isStr(entry.reference))
      warn(ds, id, `${entry.origin} item has no reference — back-fill with Wiktionary/DWDS/Tatoeba URL`);

    // Dangling row: register row points to a content_id that doesn't exist.
    if (!allContentIds.has(id))
      error(ds, id, "provenance row for unknown content_id (content deleted or id changed?)");
  }

  // Missing row: content_id exists in the data banks but has no register row.
  for (const id of allContentIds) {
    if (!seen.has(id)) error(ds, id, "no provenance row — add a row to src/data/provenance.ts");
  }
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
    const [vocab, colloc, gram, dia, exams, rede, themes, areas, writing, prov, dom, canDo, txts, miss] = await Promise.all([
      load("/src/data/vocabulary.ts"),
      load("/src/data/collocations.ts"),
      load("/src/data/grammar.ts"),
      load("/src/data/dialogues.ts"),
      load("/src/data/examSets.ts"),
      load("/src/data/redemittel.ts"),
      load("/src/data/themes.ts"),
      load("/src/data/practiceAreas.ts"),
      load("/src/data/writingPrompts.ts"),
      load("/src/data/provenance.ts"),
      load("/src/data/domains.ts"),
      load("/src/data/canDo.ts"),
      load("/src/data/texts.ts"),
      load("/src/data/missions.ts"),
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
      provenance: prov.provenance,
      domains: dom.domains,
      canDoStatements: canDo.canDoStatements,
      texts: txts.texts,
      missions: miss.missions,
      gameNpcs: miss.gameNpcs,
      keyItems: miss.keyItems,
      chapters: miss.chapters,
    };
  } finally {
    await server.close();
  }

  const subThemeIndex = buildSubThemeIndex(data.themes);
  lintDomains(data.domains);
  lintThemes(data.themes);
  lintVocabulary(data.vocabulary, subThemeIndex);
  lintCollocations(data.collocations, subThemeIndex);
  lintGrammar(data.grammar);
  lintScenarios(data.scenarios);
  lintExamSets(data.examSets, new Set(data.scenarios.map((s) => s.id)));
  lintRedemittel(data.redemittel);
  lintPracticeAreas(data.practiceAreas);
  lintWritingPrompts(data.writingPrompts);
  lintCanDo(data.canDoStatements);
  lintTexts(data.texts, subThemeIndex);
  lintGameRegistries(data);
  lintMissions(data.missions, {
    vocabIds: new Set(data.vocabulary.map((v) => v.id)),
    redemittelIds: new Set(data.redemittel.map((r) => r.id)),
    npcIds: new Set(data.gameNpcs.map((n) => n.id)),
    keyItemIds: new Set(data.keyItems.map((k) => k.id)),
  });

  // Build the full set of trackable content ids from all banks, then check
  // that the provenance register has exactly one row per id.
  const allContentIds = new Set([
    ...data.vocabulary.map((v) => v.id),
    ...data.collocations.map((c) => c.id),
    ...data.grammar.map((t) => t.id),
    ...data.grammar.flatMap((t) => t.drills?.map((d) => d.id) ?? []),
    ...data.scenarios.map((s) => s.id),
    ...data.examSets.map((e) => e.id),
    ...data.redemittel.map((r) => r.id),
    ...data.canDoStatements.map((c) => c.id),
    // One provenance row per text; embedded checks ride on the text's row.
    ...data.texts.map((t) => t.id),
    // One provenance row per mission; scenes/moves/checks ride on it.
    ...data.missions.map((m) => m.id),
    // Writing prompts are keyed by themeId, not individual ids.
    ...THEME_IDS.filter((id) => data.writingPrompts[id]).map((id) => `wp_${id}`),
  ]);
  lintProvenance(data.provenance, allContentIds);

  // Em-dash sweep across every user-facing string in every bank
  // (skip the provenance register — notes are internal, not user-facing copy).
  const userFacingData = { ...data };
  delete userFacingData.provenance;
  for (const [name, items] of Object.entries(userFacingData)) scanEmDash(items, name, name);

  /* ---- report ---- */
  const counts = {
    domains: data.domains.length,
    themes: data.themes.length,
    vocabulary: data.vocabulary.length,
    collocations: data.collocations.length,
    grammar: data.grammar.length,
    "grammar drills": data.grammar.reduce((n, t) => n + (t.drills?.length ?? 0), 0),
    dialogues: data.scenarios.length,
    examSets: data.examSets.length,
    redemittel: data.redemittel.length,
    practiceAreas: data.practiceAreas.length,
    "can-do milestones": data.canDoStatements.length,
    texts: data.texts.length,
    "text checks": data.texts.reduce((n, t) => n + (t.checks?.length ?? 0), 0),
    missions: data.missions.length,
    "mission scenes": data.missions.reduce(
      (n, m) => n + Object.keys(m.scenes ?? {}).length, 0),
    "game NPCs": data.gameNpcs.length,
    "key items": data.keyItems.length,
    "provenance rows": data.provenance.length,
    "provenance verified": data.provenance.filter((e) => e.review_status === "verified").length,
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
