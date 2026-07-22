// Supabase Edge Function: check-sentence
// ---------------------------------------------------------------------------
// Corrects a single German sentence and detects its grammar (voice/tense/mood)
// for the Fokus "Satzlabor" (Schreibtraining redesign). Cost-guarded exactly like
// evaluate-writing, but scoped to ONE short sentence.
//
//   1. Auth + kill-switch + per-user daily check limit + global monthly $ fuse.
//   2. Cache lookup by input hash (GLOBAL: corrections are user-independent).
//   3. ONE Haiku call (fallback Gemini -> gpt-4o-mini) returning corrected text +
//      per-sentence {voice,tense,mood}.
//   4. Persist a per-user row, bump ai_usage + the paid-ops ledger, return JSON.
//
// Secrets (never shipped to the browser): ANTHROPIC_API_KEY (required),
// GEMINI_API_KEY / OPENAI_API_KEY (optional fallback), DAILY_CHECK_LIMIT
// (default 20), USER_MONTHLY_LIMIT (default 200), MONTHLY_SPEND_CAP_USD
// (default 5), MAX_SENTENCE_LEN (default 300). SUPABASE_URL +
// SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY are injected automatically.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const DEFAULT_ALLOWED_ORIGINS = [
  "https://genauly.de",
  "https://www.genauly.de",
  "http://localhost:5173",
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  const env = Deno.env.get("ALLOWED_ORIGINS");
  const list = env ? env.split(",").map((s) => s.trim()).filter(Boolean) : DEFAULT_ALLOWED_ORIGINS;
  if (list.includes(origin)) return true;
  try {
    const u = new URL(origin);
    if (u.protocol === "https:" && u.hostname.endsWith(".github.io")) return true;
  } catch { /* malformed */ }
  return false;
}

function corsHeaders(origin: string): Record<string, string> {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

const VOICES = ["aktiv", "passiv_vorgang", "passiv_zustand"];
const TENSES = ["praesens", "perfekt", "praeteritum", "plusquamperfekt", "futur1", "futur2"];
const MOODS = ["indikativ", "konjunktiv1", "konjunktiv2", "imperativ"];

const DAILY_CHECK_LIMIT = Number(Deno.env.get("DAILY_CHECK_LIMIT") ?? "20");
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_LIMIT") ?? "200");
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
const MAX_SENTENCE_LEN = Number(Deno.env.get("MAX_SENTENCE_LEN") ?? "300");
const HAIKU_MODEL = "claude-haiku-4-5";

// Case-PRESERVING hash (German capitalization is grammatically meaningful, unlike
// the weakness-classifier in evaluate-writing which lowercases).
async function hashText(text: string): Promise<string> {
  const norm = text.trim().replace(/\s+/g, " ");
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(norm));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

interface Detected { text: string; voice: string; tense: string; mood: string }
interface CheckOut { corrected: string; hasErrors: boolean; sentences: Detected[]; model: string; cost: number }

const SYSTEM_PROMPT =
  `Du bist ein praeziser Korrektor und Grammatik-Analyst fuer Deutsch auf Niveau B1 bis B2. ` +
  `Aufgabe in zwei Schritten: ` +
  `1. Korrigiere den Text. Behebe nur echte Fehler (Grammatik, Rechtschreibung, Gross- und ` +
  `Kleinschreibung, Wortstellung, Zeichensetzung). Aendere korrekten Stil und Inhalt NICHT. ` +
  `Ist der Text bereits fehlerfrei, gib ihn unveraendert zurueck und setze has_errors auf false. ` +
  `2. Zerlege den KORRIGIERTEN Text in Saetze und bestimme fuer jeden Satz voice ` +
  `(aktiv, passiv_vorgang, passiv_zustand), tense (praesens, perfekt, praeteritum, ` +
  `plusquamperfekt, futur1, futur2) und mood (indikativ, konjunktiv1, konjunktiv2, imperativ) ` +
  `nach dem finiten Verb des Hauptsatzes. ` +
  `Antworte AUSSCHLIESSLICH als JSON: ` +
  `{"corrected": "...", "has_errors": true, "sentences": [{"text": "...", "voice": "aktiv", "tense": "praesens", "mood": "indikativ"}]}.`;

function parseCheck(raw: string): { corrected: string; hasErrors: boolean; sentences: Detected[] } | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]);
    if (typeof obj.corrected !== "string" || !obj.corrected.trim()) return null;
    const sentences: Detected[] = Array.isArray(obj.sentences)
      ? obj.sentences
          .filter((s: unknown) => s && typeof (s as Detected).text === "string")
          .map((s: Detected) => ({
            text: String(s.text),
            voice: VOICES.includes(s.voice) ? s.voice : "aktiv",
            tense: TENSES.includes(s.tense) ? s.tense : "praesens",
            mood: MOODS.includes(s.mood) ? s.mood : "indikativ",
          }))
      : [];
    return { corrected: obj.corrected.trim(), hasErrors: !!obj.has_errors, sentences };
  } catch {
    return null;
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callAnthropic(text: string): Promise<CheckOut | null> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) { console.error("[check] anthropic: no ANTHROPIC_API_KEY set"); return null; }
  // Retry once on a transient overload (429/529) before falling through.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: HAIKU_MODEL,
          max_tokens: 500,
          temperature: 0,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Text:\n"""${text}"""` }],
        }),
      });
      if (res.status === 429 || res.status === 529) {
        console.error(`[check] anthropic overloaded status=${res.status} attempt=${attempt}`);
        if (attempt === 0) { await sleep(700); continue; }
        return null;
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[check] anthropic http=${res.status} body=${body.slice(0, 400)}`);
        return null;
      }
      const data = await res.json();
      const raw = data.content?.[0]?.text ?? "";
      const parsed = parseCheck(raw);
      if (!parsed) { console.error(`[check] anthropic parse-fail raw=${String(raw).slice(0, 400)}`); return null; }
      const inTok = data.usage?.input_tokens ?? 0;
      const outTok = data.usage?.output_tokens ?? 0;
      const cost = (inTok / 1e6) * 1 + (outTok / 1e6) * 5;
      return { ...parsed, model: HAIKU_MODEL, cost };
    } catch (e) {
      console.error(`[check] anthropic threw: ${e}`);
      return null;
    }
  }
  return null;
}

async function callGemini(text: string): Promise<CheckOut | null> {
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
          contents: [{ parts: [{ text: `Text:\n"""${text}"""` }] }],
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[check] gemini http=${res.status} body=${body.slice(0, 400)}`);
      return null;
    }
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = parseCheck(raw);
    if (!parsed) { console.error(`[check] gemini parse-fail raw=${String(raw).slice(0, 400)}`); return null; }
    return { ...parsed, model: "gemini-1.5-flash", cost: 0.0005 };
  } catch (e) {
    console.error(`[check] gemini threw: ${e}`);
    return null;
  }
}

async function callOpenAI(text: string): Promise<CheckOut | null> {
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
          { role: "user", content: `Text:\n"""${text}"""` },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[check] openai http=${res.status} body=${body.slice(0, 400)}`);
      return null;
    }
    const data = await res.json();
    const parsed = parseCheck(data.choices?.[0]?.message?.content ?? "");
    if (!parsed) return null;
    return { ...parsed, model: "gpt-4o-mini", cost: 0.0008 };
  } catch (e) {
    console.error(`[check] openai threw: ${e}`);
    return null;
  }
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin") ?? "";
  const cors = corsHeaders(origin);
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ ok: false, message: "Method not allowed" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const authHeader = req.headers.get("Authorization") ?? "";
  const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await authed.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, message: "Nicht angemeldet." }, 401);

  const admin = createClient(supabaseUrl, serviceKey);

  // Kill-switch (app_config 'sentence_studio').
  const { data: cfg } = await admin.from("app_config").select("value").eq("key", "sentence_studio").maybeSingle();
  if (cfg?.value?.enabled === false) {
    return json({ ok: false, message: "Das Satzlabor ist gerade deaktiviert." });
  }

  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Ungültige Anfrage." }, 400);
  }
  const text = (body.text ?? "").trim();
  if (text.length < 3) return json({ ok: false, message: "Text zu kurz." }, 400);
  if (text.length > MAX_SENTENCE_LEN)
    return json({ ok: false, message: `Satz zu lang (max. ${MAX_SENTENCE_LEN} Zeichen).` }, 400);

  const month = monthKey();

  // Global monthly $ fuse.
  const { data: usage } = await admin.from("ai_usage").select("cost_estimate").eq("month", month).maybeSingle();
  if (usage && Number(usage.cost_estimate) >= MONTHLY_CAP) {
    return json({ ok: false, limitReached: true, message: "Das KI-Kontingent für diesen Monat ist aufgebraucht. Komm im nächsten Monat wieder!" });
  }

  // Per-user daily check limit.
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count: todayCount } = await admin
    .from("sentence_checks").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).gte("created_at", startOfDay.toISOString());
  if ((todayCount ?? 0) >= DAILY_CHECK_LIMIT) {
    return json({ ok: false, limitReached: true, message: `Du hast heute schon ${DAILY_CHECK_LIMIT} Sätze geprüft. Komm morgen wieder!` });
  }

  // Per-user monthly ceiling (paid ops).
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const { count: monthOps } = await admin
    .from("sentence_ai_ops").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).gte("created_at", startOfMonth.toISOString());
  if ((monthOps ?? 0) >= USER_MONTHLY_LIMIT) {
    return json({ ok: false, limitReached: true, message: "Du hast dein KI-Kontingent für diesen Monat erreicht. Komm nächsten Monat wieder!" });
  }

  const inputHash = await hashText(text);

  // Global cache: corrections are user-independent, so reuse any user's row.
  const { data: cachedRow } = await admin
    .from("sentence_checks").select("corrected, has_errors, grammar, model")
    .eq("source_hash", inputHash).not("corrected", "is", null)
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (cachedRow?.corrected) {
    // Record a per-user history row (free: no ai_usage bump, no paid-op ledger).
    await admin.from("sentence_checks").insert({
      user_id: user.id, source_text: text, source_hash: inputHash,
      corrected: cachedRow.corrected, has_errors: cachedRow.has_errors,
      grammar: cachedRow.grammar, model: cachedRow.model, cached: true, cost_estimate: 0,
    });
    const g = cachedRow.grammar ?? {};
    return json({
      ok: true, cached: true, corrected: cachedRow.corrected, hasErrors: cachedRow.has_errors,
      sentences: [{ text: cachedRow.corrected, voice: g.voice ?? "aktiv", tense: g.tense ?? "praesens", mood: g.mood ?? "indikativ" }],
    });
  }

  // LLM correction + detection.
  console.log(`[check] providers configured: anthropic=${!!Deno.env.get("ANTHROPIC_API_KEY")} gemini=${!!Deno.env.get("GEMINI_API_KEY")} openai=${!!Deno.env.get("OPENAI_API_KEY")} model=${HAIKU_MODEL}`);
  const out = (await callAnthropic(text)) || (await callGemini(text)) || (await callOpenAI(text));
  if (!out) {
    console.error("[check] all providers failed for input hash " + inputHash.slice(0, 12));
    return json({ ok: false, message: "Die Prüfung ist momentan nicht verfügbar. Bitte versuche es später erneut." });
  }

  const focal = out.sentences[0] ?? { text: out.corrected, voice: "aktiv", tense: "praesens", mood: "indikativ" };
  const { data: inserted } = await admin.from("sentence_checks").insert({
    user_id: user.id, source_text: text, source_hash: inputHash,
    corrected: out.corrected, has_errors: out.hasErrors,
    grammar: { voice: focal.voice, tense: focal.tense, mood: focal.mood },
    model: out.model, cached: false, cost_estimate: out.cost,
  }).select("id").maybeSingle();

  await admin.from("sentence_ai_ops").insert({ user_id: user.id, kind: "check", model: out.model, cost_estimate: out.cost });
  await admin.rpc("bump_ai_usage", { p_month: month, p_cost: out.cost }).then(() => {}, async () => {
    await admin.from("ai_usage").upsert(
      { month, calls: 1, cost_estimate: out.cost, updated_at: new Date().toISOString() },
      { onConflict: "month", ignoreDuplicates: false },
    );
  });

  return json({
    ok: true, cached: false, checkId: inserted?.id,
    corrected: out.corrected, hasErrors: out.hasErrors, sentences: out.sentences,
  });
});
