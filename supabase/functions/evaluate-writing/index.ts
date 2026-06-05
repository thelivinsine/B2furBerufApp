// Supabase Edge Function: evaluate-writing
// ---------------------------------------------------------------------------
// Cost-guarded AI writing evaluator for Genauly.
//
//   1. Auth + per-user daily limit + global monthly spend auto-shutoff.
//   2. Cache lookup by input_hash of the normalized text (free on hit).
//   3. Hosted LanguageTool pass → cheap error categories.
//   4. If one error bucket clearly dominates → templated insight (NO LLM).
//   5. Otherwise ONE Claude Haiku call (fallback Gemini Flash → gpt-4o-mini
//      only on hard failure) returning the single biggest weakness.
//   6. Persist the row, bump ai_usage, return JSON.
//
// Secrets (set via `supabase secrets set …`, never shipped to the browser):
//   ANTHROPIC_API_KEY        (required)
//   GEMINI_API_KEY           (optional fallback)
//   OPENAI_API_KEY           (optional fallback)
//   LANGUAGETOOL_API_URL     (optional, defaults to public api)
//   LANGUAGETOOL_API_KEY     (optional, for hosted/premium)
//   LANGUAGETOOL_USERNAME    (optional, for hosted/premium)
//   DAILY_LIMIT              (optional, default 5)
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
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

type Weakness =
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
  "verbPosition", "cases", "vocabularyRange", "cohesion", "relativeClauses",
  "daWords", "collocations", "register", "spelling",
];

const DAILY_LIMIT = Number(Deno.env.get("DAILY_LIMIT") ?? "5");
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
// Per-user monthly call ceiling so a single account (or bot-farmed guest)
// can't drain the shared global $ budget and lock everyone else out.
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_LIMIT") ?? "50");
// Hard upper bound on submitted text length — bounds token cost per call.
const MAX_TEXT_LEN = Number(Deno.env.get("MAX_TEXT_LEN") ?? "3000");
const HAIKU_MODEL = "claude-haiku-4-5";

// `json` is defined inside the request handler (see Deno.serve) so every
// response carries the correct per-request CORS headers.

/** Stable hash of normalized text for the dedup cache. */
async function hashText(text: string): Promise<string> {
  const norm = text.trim().toLowerCase().replace(/\s+/g, " ");
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

const TEMPLATED: Record<string, { weakness: Weakness; insight: string }> = {
  spelling: {
    weakness: "spelling",
    insight:
      "Deine größte Baustelle ist im Moment die Rechtschreibung – vor allem die Großschreibung der Nomen. Lies deinen Text vor dem Absenden noch einmal langsam durch und prüfe jedes Nomen auf den großen Anfangsbuchstaben.",
  },
};

/* -------------------------------- LLM calls ------------------------------- */

const SYSTEM_PROMPT =
  `Du bist Prüfer:in für Goethe/telc "Deutsch B2 Beruf". Du bewertest einen kurzen ` +
  `deutschen Text aus dem Berufskontext. Nenne NUR die EINE wichtigste Schwachstelle ` +
  `(die mit dem größten Hebel für eine bessere Note) und gib einen kurzen, konkreten, ` +
  `ermutigenden Tipp auf Deutsch (2–3 Sätze, Du-Form). Antworte AUSSCHLIESSLICH als JSON ` +
  `mit den Feldern {"weakness","insight"}. "weakness" ist genau einer dieser Werte: ` +
  VALID_WEAKNESS.join(", ") + ".";

function buildUserPrompt(text: string, lt: LtBuckets | null): string {
  let s = `Text:\n"""${text}"""`;
  if (lt) {
    s += `\n\nLanguageTool-Hinweise: ${lt.total} Treffer ` +
      `(Rechtschreibung ${lt.spelling}, Grammatik ${lt.grammar}, Zeichensetzung ${lt.punctuation}) ` +
      `auf ${lt.words} Wörter.`;
  }
  return s;
}

function parseInsight(raw: string): { weakness: Weakness; insight: string } | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]);
    const weakness = VALID_WEAKNESS.includes(obj.weakness) ? obj.weakness : "vocabularyRange";
    if (typeof obj.insight !== "string" || !obj.insight.trim()) return null;
    return { weakness, insight: obj.insight.trim() };
  } catch {
    return null;
  }
}

interface LlmOut {
  weakness: Weakness;
  insight: string;
  model: string;
  cost: number;
}

async function callAnthropic(text: string, lt: LtBuckets | null): Promise<LlmOut | null> {
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
        model: HAIKU_MODEL,
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserPrompt(text, lt) }],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.content?.[0]?.text ?? "";
    const parsed = parseInsight(raw);
    if (!parsed) return null;
    // Haiku 4.5 ≈ $1 / MTok in, $5 / MTok out.
    const inTok = data.usage?.input_tokens ?? 0;
    const outTok = data.usage?.output_tokens ?? 0;
    const cost = (inTok / 1e6) * 1 + (outTok / 1e6) * 5;
    return { ...parsed, model: HAIKU_MODEL, cost };
  } catch {
    return null;
  }
}

async function callGemini(text: string, lt: LtBuckets | null): Promise<LlmOut | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: buildUserPrompt(text, lt) }] }],
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = parseInsight(raw);
    if (!parsed) return null;
    return { ...parsed, model: "gemini-1.5-flash", cost: 0.0005 };
  } catch {
    return null;
  }
}

async function callOpenAI(text: string, lt: LtBuckets | null): Promise<LlmOut | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(text, lt) },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const parsed = parseInsight(raw);
    if (!parsed) return null;
    return { ...parsed, model: "gpt-4o-mini", cost: 0.0008 };
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

  let body: { theme?: string; length?: string; text?: string };
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

  // (1b) Per-user daily limit.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count: todayCount } = await admin
    .from("writing_evaluations")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfDay.toISOString());
  if ((todayCount ?? 0) >= DAILY_LIMIT) {
    return json({
      ok: false,
      limitReached: true,
      message: `Du hast heute schon ${DAILY_LIMIT} Texte ausgewertet. Komm morgen wieder!`,
    });
  }

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

  // (2) Cache lookup by input hash.
  const inputHash = await hashText(text);
  const { data: cachedRow } = await admin
    .from("writing_evaluations")
    .select("weakness, insight, practice_area, model")
    .eq("user_id", user.id)
    .eq("input_hash", inputHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (cachedRow) {
    return json({
      ok: true,
      cached: true,
      weakness: cachedRow.weakness,
      insight: cachedRow.insight,
      practiceArea: cachedRow.practice_area,
      model: cachedRow.model,
    });
  }

  // (3) LanguageTool pass.
  const lt = await runLanguageTool(text);

  // (4) Dominant spelling bucket → templated insight, no LLM.
  let weakness: Weakness | null = null;
  let insight = "";
  let model: string | null = null;
  let cost = 0;
  if (lt && lt.words > 0) {
    const spellRate = lt.spelling / lt.words;
    if (lt.spelling >= 3 && spellRate > 0.08 && lt.spelling >= lt.grammar * 2) {
      ({ weakness, insight } = TEMPLATED.spelling);
    }
  }

  // (5) Otherwise one LLM call with graceful fallback chain.
  if (!weakness) {
    const out =
      (await callAnthropic(text, lt)) ||
      (await callGemini(text, lt)) ||
      (await callOpenAI(text, lt));
    if (!out) {
      return json({
        ok: false,
        message: "Die Auswertung ist momentan nicht verfügbar. Bitte versuche es später erneut.",
      });
    }
    weakness = out.weakness;
    insight = out.insight;
    model = out.model;
    cost = out.cost;
  }

  // (6) Persist + bump global usage.
  await admin.from("writing_evaluations").insert({
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
  });

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
    practiceArea: weakness,
    model,
  });
});
