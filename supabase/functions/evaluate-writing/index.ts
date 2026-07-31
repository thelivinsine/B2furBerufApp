// Supabase Edge Function: evaluate-writing
// ---------------------------------------------------------------------------
// Cost-guarded AI writing evaluator for Genauly.
//
//   1. Auth + per-user daily limit + global monthly spend auto-shutoff.
//   2. Cache lookup by input_hash of the normalized text (free on hit).
//   3. Hosted LanguageTool pass → cheap error categories.
//   4. If one error bucket clearly dominates → templated insight (NO LLM).
//   5. Otherwise ONE model call, cascade Gemini 2.5 Flash (free) → Sonnet 5 → GPT-5
//      returning the single biggest weakness.
//   6. Persist the row, bump ai_usage, return JSON.
//
// Secrets (set via `supabase secrets set …`, never shipped to the browser):
//   ANTHROPIC_API_KEY        (required)
//   GEMINI_API_KEY           (optional fallback)
//   OPENAI_API_KEY           (optional fallback)
//   LANGUAGETOOL_API_URL     (optional, defaults to public api)
//   LANGUAGETOOL_API_KEY     (optional, for hosted/premium)
//   LANGUAGETOOL_USERNAME    (optional, for hosted/premium)
//   DAILY_LIMIT_SHORT        (optional, default 4)  Kurz-Auswertungen pro Tag
//   DAILY_LIMIT_LONG         (optional, default 2)  Lang-Auswertungen pro Tag
//   MONTHLY_SPEND_CAP_USD    (optional, default 5)
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS is locked to an allowlist. Previously this was "*", which let ANY
// website invoke the function with a user's forwarded token. Origins can be
// overridden via the ALLOWED_ORIGINS secret (comma-separated); any *.github.io
// host is always allowed as the GitHub Pages fallback.
const DEFAULT_ALLOWED_ORIGINS = [
  "https://genauly.de",
  "https://www.genauly.de",
  "http://localhost:5173",
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  const env = Deno.env.get("ALLOWED_ORIGINS");
  const list = env
    ? env.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;
  if (list.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.protocol === "https:" && u.hostname.endsWith(".github.io")) return true;
  } catch {
    /* malformed origin → not allowed */
  }
  return false;
}

/** Build CORS headers, reflecting the request Origin only if it's allowlisted. */
function corsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

type Weakness =
  | "taskCompletion"
  | "verbPosition"
  | "cases"
  | "vocabularyRange"
  | "cohesion"
  | "relativeClauses"
  | "daWords"
  | "collocations"
  | "register"
  | "spelling";

const VALID_WEAKNESS: Weakness[] = [
  "taskCompletion",
  "verbPosition", "cases", "vocabularyRange", "cohesion", "relativeClauses",
  "daWords", "collocations", "register", "spelling",
];

// Per-MODE daily allowances (founder s167). Kurz and Lang cost very different
// amounts of model output, so they get separate budgets instead of one shared
// counter: a learner who spends the day on Kurz can no longer exhaust their
// Lang allowance, and vice versa. Counted per length against writing_evaluations.
const DAILY_LIMIT_SHORT = Number(Deno.env.get("DAILY_LIMIT_SHORT") ?? "4");
const DAILY_LIMIT_LONG = Number(Deno.env.get("DAILY_LIMIT_LONG") ?? "2");
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
// Per-user monthly call ceiling so a single account (or bot-farmed guest)
// can't drain the shared global $ budget and lock everyone else out.
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_LIMIT") ?? "50");
// Hard upper bound on submitted text length — bounds token cost per call.
const MAX_TEXT_LEN = Number(Deno.env.get("MAX_TEXT_LEN") ?? "3000");
// Provider cascade (per cache-miss): free Gemini Flash first, then paid Claude
// Sonnet, then GPT-5. Sonnet is the paid backup until month-to-date Claude spend
// (across ALL AI features) reaches CLAUDE_BUDGET_USD, after which GPT-5 leads.
// All three combined are bounded by the global MONTHLY_SPEND_CAP_USD fuse.
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const EVAL_MODEL = Deno.env.get("EVAL_MODEL") ?? "claude-sonnet-5";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-5";
const CLAUDE_BUDGET_USD = Number(Deno.env.get("CLAUDE_BUDGET_USD") ?? "2");

// `json` is defined inside the request handler (see Deno.serve) so every
// response carries the correct per-request CORS headers.

/**
 * Stable hash of the normalized text PLUS the task identity (s167). The task
 * now shapes the prompt, so keying on the text alone would hand back a verdict
 * produced for a different Aufgabe. `taskKey` folds in the task id and the
 * level, and PROMPT_REV invalidates every entry when the rubric changes.
 */
const PROMPT_REV = "s179.0";
async function hashText(text: string, taskKey = ""): Promise<string> {
  const norm =
    `${PROMPT_REV}|${taskKey}|` + text.trim().toLowerCase().replace(/\s+/g, " ");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(norm));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/* ----------------------------- LanguageTool ------------------------------ */

interface LtBuckets {
  spelling: number;
  grammar: number;
  punctuation: number;
  total: number;
  words: number;
}

async function runLanguageTool(text: string): Promise<LtBuckets | null> {
  const base = Deno.env.get("LANGUAGETOOL_API_URL") ?? "https://api.languagetool.org";
  const params = new URLSearchParams({ text, language: "de-DE" });
  const key = Deno.env.get("LANGUAGETOOL_API_KEY");
  const user = Deno.env.get("LANGUAGETOOL_USERNAME");
  if (key && user) {
    params.set("apiKey", key);
    params.set("username", user);
  }
  try {
    const res = await fetch(`${base}/v2/check`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const buckets: LtBuckets = {
      spelling: 0, grammar: 0, punctuation: 0, total: 0,
      words: text.trim().split(/\s+/).filter(Boolean).length,
    };
    for (const m of data.matches ?? []) {
      buckets.total++;
      const cat = (m.rule?.category?.id ?? "").toUpperCase();
      const issue = (m.rule?.issueType ?? "").toLowerCase();
      if (cat === "TYPOS" || cat === "CASING" || issue === "misspelling") buckets.spelling++;
      else if (cat === "PUNCTUATION" || cat === "TYPOGRAPHY") buckets.punctuation++;
      else buckets.grammar++;
    }
    return buckets;
  } catch {
    return null;
  }
}

// Written in the same simple German the LLM tip is asked for (founder
// 2026-07-31): short sentences, everyday words, an English version beside it.
const TEMPLATED: Record<
  string,
  { weakness: Weakness; insight: string; insightEn: string }
> = {
  spelling: {
    weakness: "spelling",
    insight:
      "Schau dir zuerst die Rechtschreibung an. Viele Nomen sind klein geschrieben. Nomen schreibt man im Deutschen immer groß, zum Beispiel \"der Termin\". Lies deinen Text am Ende noch einmal langsam und prüfe jedes Nomen.",
    insightEn:
      "Look at your spelling first. Many nouns start with a small letter. In German, nouns always start with a capital letter, for example \"der Termin\". Read your text again slowly at the end and check every noun.",
  },
};

/* -------------------------------- LLM calls ------------------------------- */

/** Coarse label per CEFR content band, so a B1 text is not marked to a B2 bar. */
function levelLabel(level: string | null): string {
  if (!level) return "B2";
  if (level.startsWith("B1")) return "B1";
  if (level.startsWith("C1") || level.startsWith("C2")) return "C1";
  if (level.startsWith("A")) return "A2";
  return "B2";
}

/**
 * The rubric prompt (s167 P2). Before this the system prompt was a fixed
 * "Prüfer:in für Deutsch B2 Beruf" string and the model never saw the Aufgabe,
 * so it could only ever comment on language. It now grades CONTENT FIRST,
 * mirroring how the real rubrics work: Goethe zeroes an Aufgabe whose
 * "Erfüllung" fails, and telc grades "Berücksichtigung der Leitpunkte" by
 * counting covered points.
 */
function buildSystemPrompt(level: string | null, hasTask: boolean): string {
  const lv = levelLabel(level);
  let s =
    `Du bist Prüfer:in für Deutsch als Fremdsprache und bewertest einen Text auf Niveau ${lv}. ` +
    `Bewerte streng auf ${lv}-Niveau: markiere nichts als Schwäche, was auf ${lv} noch normal ist, ` +
    `und beschönige nichts, was auf ${lv} erwartet wird. `;
  if (hasTask) {
    s +=
      `Du bekommst die AUFGABE mit ihren Inhaltspunkten und den Text der lernenden Person. ` +
      `Prüfe ZUERST die Aufgabenerfüllung: Ist jeder Inhaltspunkt inhaltlich bearbeitet? ` +
      `Stimmen Anrede und Anredeform (du/Sie) zum genannten Adressaten? Ist die Länge ungefähr erreicht? ` +
      `Wenn ein Inhaltspunkt fehlt, die Anredeform falsch ist oder der Text deutlich zu kurz ist, ` +
      `ist "taskCompletion" die wichtigste Schwachstelle und dein Tipp benennt konkret, WAS fehlt ` +
      `(z. B. welcher Inhaltspunkt). Erst wenn die Aufgabe erfüllt ist, nenne die wichtigste ` +
      `sprachliche Schwachstelle. `;
  }
  s +=
    `Nenne NUR die EINE wichtigste Schwachstelle (die mit dem größten Hebel) und gib einen kurzen, ` +
    `konkreten, ermutigenden Tipp auf Deutsch (2–3 Sätze, Du-Form). ` +
    // The learner READS this tip, so it is written for a beginner even when the
    // text itself is graded at C1 (founder 2026-07-31: "the vocabulary used is
    // way too advanced"). Grading level and explaining level are different
    // things; the whole point of the tip is that it lands.
    `SPRACHE DES TIPPS: einfaches Deutsch auf A2-Niveau, egal auf welchem Niveau der Text bewertet ` +
    `wird. Kurze Hauptsätze (höchstens 12 Wörter), Alltagswortschatz, keine Schachtelsätze, ` +
    `keine Passivkonstruktionen. Benutze KEINE Fachbegriffe wie "Aufgabenerfüllung", ` +
    `"Inhaltspunkt", "Adressat", "Anredeform", "Konnektor", "Kohärenz", "Register" oder ` +
    `"Nebensatz"; sage stattdessen einfach, was fehlt oder was zu ändern ist, und nenne ein ` +
    `konkretes Beispiel aus dem Text der lernenden Person. ` +
    `Gib den GLEICHEN Tipp zusätzlich unter "insightEn" auf ebenso einfachem Englisch (A2, ` +
    `kurze Sätze, gleiche Aussage, keine Fachbegriffe). ` +
    // The corrected text is what Verlauf renders as an Original/Korrigiert diff,
    // so it must be the learner's OWN text minimally repaired, never a rewrite:
    // a diff against a re-imagined text is unreadable and teaches nothing.
    `Gib zusätzlich unter "corrected" den KORRIGIERTEN Text zurück: dieselbe Struktur, ` +
    `dieselben Sätze und derselbe Inhalt wie im Original, nur mit den nötigen ` +
    `sprachlichen Korrekturen (Rechtschreibung, Grammatik, Wortstellung, Wortwahl). ` +
    `Formuliere NICHT neu, kürze nicht, ergänze keine Inhalte und kommentiere nicht. ` +
    `Wenn der Text keine Fehler hat, gib das Original unverändert zurück. ` +
    `Antworte AUSSCHLIESSLICH als JSON mit den Feldern {"weakness","insight","insightEn","corrected"}. ` +
    `"weakness" ist genau einer dieser Werte: ` + VALID_WEAKNESS.join(", ") +
    `. Gib AUSSCHLIESSLICH das JSON-Objekt aus, ohne Markdown, ohne Code-Zäune und ohne weiteren Text.`;
  return s;
}

/** Learner-facing Textsorte labels. Mirrors the rail's FORMAT_GROUPS; the raw
 *  enum value ("email_halbformell") means nothing to the model. */
const FORMAT_LABEL: Record<string, string> = {
  email_informell: "private E-Mail",
  email_halbformell: "halbformelle E-Mail",
  email_formell: "formelle E-Mail",
  nachricht: "Kurznachricht",
  notiz: "Notiz",
  uebergabe: "Übergabe",
  forumsbeitrag: "Forumsbeitrag",
  stellungnahme: "Stellungnahme",
  bericht: "Bericht",
  protokoll: "Protokoll",
  beschwerde: "Beschwerde",
  reklamation: "Reklamation",
  antrag: "Antrag",
  widerspruch: "Widerspruch",
  kuendigung: "Kündigung",
  bewerbung: "Bewerbung",
};

interface TaskBrief {
  task: string | null;
  points: string[];
  addressee?: string | null;
  register: string | null;
  format: string | null;
  words: number | null;
}

function buildUserPrompt(text: string, lt: LtBuckets | null, brief?: TaskBrief): string {
  let s = "";
  if (brief?.task) {
    s += `Aufgabe:\n"""${brief.task}"""\n`;
    if (brief.points.length) {
      s += `\nInhaltspunkte, die der Text abdecken muss:\n`;
      s += brief.points.map((p, i) => `${i + 1}. ${p}`).join("\n") + "\n";
    }
    if (brief.format && FORMAT_LABEL[brief.format])
      s += `\nTextsorte: ${FORMAT_LABEL[brief.format]}`;
    if (brief.addressee) s += `\nAdressat: ${brief.addressee}`;
    if (brief.register)
      s += `\nGeforderte Anredeform: ${brief.register === "sie" ? "Sie (formell)" : "du (informell)"}`;
    if (brief.words) s += `\nZielumfang: etwa ${brief.words} Wörter`;
    s += `\n\n`;
  }
  s += `Text:\n"""${text}"""`;
  if (lt) {
    s += `\n\nLanguageTool-Hinweise: ${lt.total} Treffer ` +
      `(Rechtschreibung ${lt.spelling}, Grammatik ${lt.grammar}, Zeichensetzung ${lt.punctuation}) ` +
      `auf ${lt.words} Wörter.`;
  }
  return s;
}

/** Pull one JSON string field out of a payload too broken to `JSON.parse`. */
function salvageField(raw: string, field: string): string | null {
  const m = raw.match(new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`));
  if (!m) return null;
  try {
    return JSON.parse(`"${m[1]}"`);
  } catch {
    return null;
  }
}

/**
 * The verdict, plus the corrected text when the model returned one.
 *
 * `corrected` is strictly OPTIONAL: adding it (s171) roughly doubles the output
 * tokens, so a long text can still bump the token ceiling and truncate the JSON.
 * A truncated payload must never cost the learner their verdict, so on a parse
 * failure the two fields that existed before are salvaged from the raw string
 * and the correction is simply dropped.
 */
function parseInsight(
  raw: string,
): {
  weakness: Weakness;
  insight: string;
  insightEn: string | null;
  corrected: string | null;
} | null {
  const pick = (w: unknown): Weakness =>
    VALID_WEAKNESS.includes(w as Weakness) ? (w as Weakness) : "vocabularyRange";
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("no object");
    const obj = JSON.parse(match[0]);
    if (typeof obj.insight !== "string" || !obj.insight.trim()) throw new Error("no insight");
    return {
      weakness: pick(obj.weakness),
      insight: obj.insight.trim(),
      insightEn:
        typeof obj.insightEn === "string" && obj.insightEn.trim() ? obj.insightEn.trim() : null,
      corrected: typeof obj.corrected === "string" && obj.corrected.trim()
        ? obj.corrected.trim()
        : null,
    };
  } catch {
    const insight = salvageField(raw, "insight");
    if (!insight?.trim()) return null;
    const weakness = salvageField(raw, "weakness");
    const insightEn = salvageField(raw, "insightEn");
    return {
      weakness: pick(weakness),
      insight: insight.trim(),
      insightEn: insightEn?.trim() || null,
      corrected: null,
    };
  }
}

/**
 * Accept the model's corrected text only when it is plausibly the SAME text
 * repaired. Rejects a rewrite, a truncated stump, an echo of the prompt, and an
 * unchanged copy (nothing to show, so the UI gets no empty toggle).
 */
function sanitizeCorrected(original: string, candidate: string | null): string | null {
  if (!candidate) return null;
  const c = candidate.trim();
  if (!c) return null;
  const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
  if (norm(c) === norm(original)) return null;
  const words = (s: string) => norm(s).split(" ").filter(Boolean).length;
  const wo = words(original);
  const wc = words(c);
  if (wo === 0 || wc === 0) return null;
  // A correction stays close in length: much shorter means truncated, much
  // longer means the model added commentary or restated the Aufgabe.
  if (wc < wo * 0.6 || wc > wo * 1.6 + 12) return null;
  if (c.length > MAX_TEXT_LEN * 2) return null;
  return c;
}

interface LlmOut {
  weakness: Weakness;
  insight: string;
  corrected: string | null;
  model: string;
  cost: number;
}

async function callAnthropic(text: string, lt: LtBuckets | null, sys: string, brief?: TaskBrief): Promise<LlmOut | null> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: EVAL_MODEL,
        // Raised 400 -> 2000 (s171): the response now carries the corrected text,
        // which for a MAX_TEXT_LEN submission is ~750 tokens on its own. This is
        // a CEILING, not a spend: billing follows the tokens actually produced,
        // and the monthly/Claude fuses are unchanged.
        max_tokens: 2000,
        // Thinking disabled: leaving adaptive thinking on (the Sonnet 5 default)
        // could consume the token budget and truncate the JSON. No
        // temperature is sent (removed on the Sonnet 5 / Opus 4.8 family).
        thinking: { type: "disabled" },
        system: sys,
        messages: [{ role: "user", content: buildUserPrompt(text, lt, brief) }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "";
    const parsed = parseInsight(raw);
    if (!parsed) return null;
    // Sonnet 5 standard rates ($3/$15 per 1M); Haiku fallback = $1/$5.
    const inTok = data.usage?.input_tokens ?? 0;
    const outTok = data.usage?.output_tokens ?? 0;
    const isSonnet = EVAL_MODEL.includes("sonnet");
    const cost = (inTok / 1e6) * (isSonnet ? 3 : 1) + (outTok / 1e6) * (isSonnet ? 15 : 5);
    return { ...parsed, model: EVAL_MODEL, cost };
  } catch {
    return null;
  }
}

async function callGemini(text: string, lt: LtBuckets | null, sys: string, brief?: TaskBrief): Promise<LlmOut | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: sys }] },
          contents: [{ parts: [{ text: buildUserPrompt(text, lt, brief) }] }],
          // 2.5 Flash is a thinking model: force pure-JSON output and give a
          // generous budget so reasoning tokens cannot truncate the answer.
          generationConfig: { responseMimeType: "application/json", maxOutputTokens: 4096 },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = parseInsight(raw);
    if (!parsed) return null;
    // Free tier: record $0 so free calls never consume the paid spend fuse.
    return { ...parsed, model: GEMINI_MODEL, cost: 0 };
  } catch {
    return null;
  }
}

async function callOpenAI(text: string, lt: LtBuckets | null, sys: string, brief?: TaskBrief): Promise<LlmOut | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        response_format: { type: "json_object" },
        // GPT-5 is a reasoning model: cap with max_completion_tokens (max_tokens is
        // rejected) and keep reasoning minimal so it stays fast and does not starve
        // the JSON output. No temperature (also rejected on reasoning models).
        max_completion_tokens: 2048,
        reasoning_effort: "minimal",
        messages: [
          { role: "system", content: sys },
          { role: "user", content: buildUserPrompt(text, lt, brief) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseInsight(raw);
    if (!parsed) return null;
    return { ...parsed, model: OPENAI_MODEL, cost: 0.004 };
  } catch {
    return null;
  }
}

/* --------------------------------- handler -------------------------------- */

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  const cors = corsHeaders(origin);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...cors, "Content-Type": "application/json" },
    });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  // Identify the caller from their JWT.
  const authHeader = req.headers.get("Authorization") ?? "";
  const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await authed.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, message: "Nicht angemeldet." }, 401);

  // Service-role client for limit/cache/usage bookkeeping (bypasses RLS).
  const admin = createClient(supabaseUrl, serviceKey);

  let body: {
    theme?: string;
    length?: string;
    text?: string;
    taskId?: string;
    task?: string;
    points?: string[];
    level?: string;
    format?: string;
    addressee?: string;
    register?: string;
    words?: number;
  };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Ungültige Anfrage." }, 400);
  }
  const text = (body.text ?? "").trim();
  if (text.length < 10) return json({ ok: false, message: "Text zu kurz." }, 400);
  if (text.length > MAX_TEXT_LEN)
    return json(
      { ok: false, message: `Text zu lang (max. ${MAX_TEXT_LEN} Zeichen).` },
      400,
    );
  const length = body.length === "long" ? "long" : "short";
  const theme = body.theme ?? null;

  // The Aufgabe (s167 P2). All optional: legacy tasks carry no structure, and
  // the evaluator degrades to language-only feedback when it gets nothing.
  // Every field is bounded before it reaches a prompt, because this is
  // learner-supplied input on the wire, not trusted content.
  const clip = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : null;
  const taskId = clip(body.taskId, 64);
  const task = clip(body.task, 600);
  const points = Array.isArray(body.points)
    ? body.points.map((p) => clip(p, 200)).filter((p): p is string => !!p).slice(0, 5)
    : [];
  const level = clip(body.level, 8);
  const format = clip(body.format, 32);
  const addressee = clip(body.addressee, 120);
  const register = body.register === "du" || body.register === "sie" ? body.register : null;
  const words =
    typeof body.words === "number" && body.words >= 30 && body.words <= 300
      ? Math.round(body.words)
      : null;

  const month = monthKey();

  // (1a) Monthly auto-shutoff.
  const { data: usage } = await admin
    .from("ai_usage").select("cost_estimate").eq("month", month).maybeSingle();
  if (usage && Number(usage.cost_estimate) >= MONTHLY_CAP) {
    return json({
      ok: false,
      limitReached: true,
      message: "Das KI-Kontingent für diesen Monat ist aufgebraucht. Komm im nächsten Monat wieder!",
    });
  }

  // (1b) Per-user daily limit, SEPARATE per mode (Kurz 4 / Lang 2, s167).
  const dailyLimit = length === "long" ? DAILY_LIMIT_LONG : DAILY_LIMIT_SHORT;
  const modeLabel = length === "long" ? "lange" : "kurze";
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count: todayCount } = await admin
    .from("writing_evaluations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("length", length)
    .gte("created_at", startOfDay.toISOString());
  if ((todayCount ?? 0) >= dailyLimit) {
    return json({
      ok: false,
      limitReached: true,
      dailyLimit,
      dailyRemaining: 0,
      message: `Du hast heute schon ${dailyLimit} ${modeLabel} Texte ausgewertet. Komm morgen wieder!`,
    });
  }
  // What the client prints as "Heute noch N von M" (s179). A cache hit returns
  // before the row is written and is therefore free, so the two success paths
  // below report DIFFERENT numbers: only a real evaluation spends a unit.
  const remainingIfSpent = Math.max(0, dailyLimit - (todayCount ?? 0) - 1);
  const remainingIfFree = Math.max(0, dailyLimit - (todayCount ?? 0));

  // (1c) Per-user monthly cap — one account can't drain the shared budget.
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const { count: userMonthCount } = await admin
    .from("writing_evaluations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth.toISOString());
  if ((userMonthCount ?? 0) >= USER_MONTHLY_LIMIT) {
    return json({
      ok: false,
      limitReached: true,
      message:
        "Du hast dein KI-Kontingent für diesen Monat erreicht. Komm nächsten Monat wieder!",
    });
  }

  // (2) Cache lookup by input hash (task-aware since s167).
  const inputHash = await hashText(text, `${taskId ?? ""}|${level ?? ""}`);
  // `corrected_text` needs migration 0012 and `insight_en` migration 0014. CI
  // deploys functions but SKIPS migrations (no SUPABASE_DB_PASSWORD), so this
  // function can be live before either column exists and selecting one would
  // fail the whole cache read. Step DOWN through the optional columns, falling
  // back to the ones that have always been there.
  const cacheQuery = (cols: string) =>
    admin
      .from("writing_evaluations")
      .select(cols)
      .eq("user_id", user.id)
      .eq("input_hash", inputHash)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
  const withEn = await cacheQuery(
    "weakness, insight, insight_en, practice_area, model, corrected_text",
  );
  const withCorrected = withEn.error
    ? await cacheQuery("weakness, insight, practice_area, model, corrected_text")
    : withEn;
  const cacheRes = withCorrected.error
    ? await cacheQuery("weakness, insight, practice_area, model")
    : withCorrected;
  const cachedRow = (cacheRes.data as Record<string, unknown> | null) ?? null;
  if (cachedRow) {
    return json({
      ok: true,
      cached: true,
      weakness: cachedRow.weakness,
      insight: cachedRow.insight,
      insightEn: cachedRow.insight_en ?? null,
      practiceArea: cachedRow.practice_area,
      model: cachedRow.model,
      corrected: cachedRow.corrected_text ?? null,
      dailyLimit,
      dailyRemaining: remainingIfFree,
    });
  }

  // (3) LanguageTool pass.
  const lt = await runLanguageTool(text);

  // (4) Dominant spelling bucket → templated insight, no LLM.
  let weakness: Weakness | null = null;
  let insight = "";
  let insightEn: string | null = null;
  let model: string | null = null;
  let cost = 0;
  // Stays null on the templated path: no LLM ran, so there is no correction.
  let correctedText: string | null = null;
  if (lt && lt.words > 0) {
    const spellRate = lt.spelling / lt.words;
    if (lt.spelling >= 3 && spellRate > 0.08 && lt.spelling >= lt.grammar * 2) {
      ({ weakness, insight, insightEn } = TEMPLATED.spelling);
    }
  }

  // (5) Otherwise one LLM call. Free Gemini first; on its failure (any error,
  // incl. free-tier/quota 429) fall to a paid model: Sonnet while month-to-date
  // Claude spend across ALL AI features is under budget, else GPT-5 leads.
  if (!weakness) {
    const monthIso = startOfMonth.toISOString();
    // The Aufgabe travels with every provider call (s167 P2), so the cascade
    // cannot silently downgrade to language-only grading on a fallback.
    const brief: TaskBrief = { task, points, addressee, register, format, words };
    const sys = buildSystemPrompt(level, !!task);
    let out = await callGemini(text, lt, sys, brief);
    if (!out) {
      const [opsRows, writRows] = await Promise.all([
        admin.from("sentence_ai_ops").select("cost_estimate").ilike("model", "claude%").gte("created_at", monthIso),
        admin.from("writing_evaluations").select("cost_estimate").ilike("model", "claude%").gte("created_at", monthIso),
      ]);
      const claudeSpend = [...(opsRows.data ?? []), ...(writRows.data ?? [])]
        .reduce((s, r) => s + Number(r.cost_estimate ?? 0), 0);
      out = claudeSpend < CLAUDE_BUDGET_USD
        ? (await callAnthropic(text, lt, sys, brief)) || (await callOpenAI(text, lt, sys, brief))
        : (await callOpenAI(text, lt, sys, brief)) || (await callAnthropic(text, lt, sys, brief));
    }
    if (!out) {
      return json({
        ok: false,
        message: "Die Auswertung ist momentan nicht verfügbar. Bitte versuche es später erneut.",
      });
    }
    weakness = out.weakness;
    insight = out.insight;
    insightEn = out.insightEn;
    model = out.model;
    cost = out.cost;
    correctedText = sanitizeCorrected(text, out.corrected);
  }

  // (6) Persist + bump global usage.
  //
  // `task_id` needs migration 0011 and `corrected_text` migration 0012. If this
  // function is deployed before a migration runs (CI deploys functions but skips
  // migrations), an unguarded insert would fail silently and the row would be
  // lost, which would ALSO stop the daily limit counting, since the limit counts
  // rows. So step DOWN through the optional columns rather than degrade a cost
  // guardrail: full row, then without the newest column, then the base row.
  const row = {
    user_id: user.id,
    theme,
    length,
    text,
    weakness,
    insight,
    practice_area: weakness,
    input_hash: inputHash,
    cached: false,
    model,
    cost_estimate: cost,
  };
  const insert = (extra: Record<string, unknown>) =>
    admin.from("writing_evaluations").insert({ ...row, ...extra });
  const full = await insert({
    task_id: taskId,
    corrected_text: correctedText,
    insight_en: insightEn,
  });
  if (full.error) {
    console.error("writing_evaluations insert failed", full.error.message);
    const withCorrected = await insert({ task_id: taskId, corrected_text: correctedText });
    if (withCorrected.error) {
      const withTask = await insert({ task_id: taskId });
      if (withTask.error) await insert({});
    }
  }

  await admin.rpc("bump_ai_usage", { p_month: month, p_cost: cost }).then(
    () => {},
    async () => {
      // Fallback if the RPC isn't present: best-effort upsert.
      await admin.from("ai_usage").upsert(
        { month, calls: 1, cost_estimate: cost, updated_at: new Date().toISOString() },
        { onConflict: "month", ignoreDuplicates: false },
      );
    },
  );

  return json({
    ok: true,
    cached: false,
    weakness,
    insight,
    insightEn,
    practiceArea: weakness,
    model,
    corrected: correctedText,
    dailyLimit,
    dailyRemaining: remainingIfSpent,
  });
});
