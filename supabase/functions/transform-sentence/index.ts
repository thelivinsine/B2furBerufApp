// Supabase Edge Function: transform-sentence
// ---------------------------------------------------------------------------
// Transforms an already-checked German sentence along a target grammar tuple
// (voice/tense/mood) for the Fokus "Satzlabor". The cost story: a rapid pill-
// toggle UI multiplies calls, so this is cache-FIRST and the paid path is tiny.
//
//   1. Auth + kill-switch + global monthly $ fuse + per-user transform limits
//      (burst/min, per-day, per-month) counting ONLY paid ops.
//   2. Validate the target tuple against a closed enum.
//   3. GLOBAL cache lookup by hash(source | tuple | prompt_version | model) -> free.
//   4. Otherwise ONE LLM call (TRANSFORM_MODEL, default Haiku; fallback Gemini ->
//      gpt-4o-mini). The model ABSTAINS (applicable:false) rather than hallucinate.
//   5. Contract-validate, cache the result globally, bump ai_usage + ledger.
//
// Secrets: ANTHROPIC_API_KEY (required), GEMINI_API_KEY / OPENAI_API_KEY (optional),
// TRANSFORM_MODEL (default claude-haiku-4-5; set to claude-sonnet-5 for higher
// morphological accuracy once eval'd), TRANSFORM_DAILY_LIMIT (default 40),
// TRANSFORM_BURST_LIMIT (default 8), USER_MONTHLY_LIMIT (default 200),
// MONTHLY_SPEND_CAP_USD (default 5), MAX_SENTENCE_LEN (default 300),
// PROMPT_VERSION (default "1").
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
const REASONS = ["ok", "kein_akkusativobjekt", "intransitiv_unpersoenlich", "bereits_zielform", "nicht_idiomatisch", "mehrdeutig", "modalverb_grenze"];

const TRANSFORM_MODEL = Deno.env.get("TRANSFORM_MODEL") ?? "claude-sonnet-5";
const TRANSFORM_DAILY_LIMIT = Number(Deno.env.get("TRANSFORM_DAILY_LIMIT") ?? "40");
const TRANSFORM_BURST_LIMIT = Number(Deno.env.get("TRANSFORM_BURST_LIMIT") ?? "8");
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_LIMIT") ?? "200");
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
const MAX_SENTENCE_LEN = Number(Deno.env.get("MAX_SENTENCE_LEN") ?? "300");
// Bumped to "2" with the Sonnet 5 migration + prompt fixes (copula-aktiv rule,
// stricter bereits_zielform). The global transform cache is keyed on this, so the
// bump prevents serving stale wrong transforms produced by the old model/prompt.
const PROMPT_VERSION = Deno.env.get("PROMPT_VERSION") ?? "2";

interface Tuple { voice: string; tense: string; mood: string }

async function hash(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}
function normalize(s: string): string {
  return s.trim().replace(/\s+/g, " ");
}
function canonicalTuple(t: Tuple): string {
  return `${t.voice}|${t.tense}|${t.mood}`;
}

const SYSTEM_PROMPT =
  `Du bist ein Grammatik-Werkzeug fuer Deutschlernende auf Niveau B1 bis B2. Du formst EINEN ` +
  `gegebenen deutschen Satz in eine Zielform um, ohne die Bedeutung zu veraendern. ` +
  `Du bekommst den Satz und eine Zielvorgabe aus voice (aktiv, passiv_vorgang, passiv_zustand), ` +
  `tense (praesens, perfekt, praeteritum, plusquamperfekt, futur1, futur2) und mood. ` +
  `Regeln fuer Passiv: passiv_vorgang = werden + Partizip II; passiv_zustand = sein + Partizip II; ` +
  `nur Saetze mit Akkusativobjekt lassen sich persoenlich passivieren. Das Perfekt-Passiv nutzt "worden", nicht "geworden". ` +
  `Eine Kopula (sein/werden/bleiben + Adjektiv oder Adverb, z. B. "Ich bin krank") ist aktiv, ` +
  `kein Passiv; das Adjektiv ist kein Partizip. ` +
  `Setze bereits_zielform NUR, wenn der Satz sowohl im Genus Verbi ALS AUCH in der Zeitform ` +
  `bereits exakt der Zielvorgabe entspricht. Unterscheidet sich die Zeitform, ist der Satz NICHT ` +
  `in der Zielform, auch wenn das Genus Verbi passt: "Ich bin krank" (Praesens) wird zu Perfekt ` +
  `"Ich bin krank gewesen" und zu Praeteritum "Ich war krank" umgeformt. Das sind echte ` +
  `Umformungen und niemals bereits_zielform. ` +
  `Setze applicable auf false mit passendem reason, wenn: kein Akkusativobjekt vorhanden ist ` +
  `(kein_akkusativobjekt), nur ein unpersoenliches Passiv moeglich waere (intransitiv_unpersoenlich), ` +
  `der Satz schon in der Zielform steht (bereits_zielform), die Umformung nicht idiomatisch waere ` +
  `(nicht_idiomatisch), der Satz mehrdeutig ist (mehrdeutig) oder ein Modalverb die Form verhindert ` +
  `(modalverb_grenze). Erfinde niemals eine Form. Bist du unsicher, setze applicable auf false. ` +
  `Eine falsche Form schadet dem Lernenden mehr als ein Hinweis. ` +
  `note: ein kurzer deutscher Hinweis (ein Satz), was sich geaendert hat, bei false warum nicht. ` +
  `note_en: dieselbe Erklaerung auf Englisch. achieved: die tatsaechlich gebildete Form. ` +
  `Antworte AUSSCHLIESSLICH als JSON: ` +
  `{"applicable": true, "reason": "ok", "transformed": "...", "note": "...", "note_en": "...", ` +
  `"achieved": {"voice": "...", "tense": "...", "mood": "..."}}.`;

interface TransformOut {
  applicable: boolean; reason: string; transformed: string; note: string; noteEn: string;
  achieved: Tuple; model: string; cost: number;
}

function parse(raw: string, target: Tuple): Omit<TransformOut, "model" | "cost"> | null {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = JSON.parse(match[0]);
    const applicable = obj.applicable !== false;
    const reason = REASONS.includes(obj.reason) ? obj.reason : (applicable ? "ok" : "nicht_idiomatisch");
    const transformed = typeof obj.transformed === "string" ? obj.transformed.trim() : "";
    const a = obj.achieved ?? {};
    const achieved: Tuple = {
      voice: VOICES.includes(a.voice) ? a.voice : target.voice,
      tense: TENSES.includes(a.tense) ? a.tense : target.tense,
      mood: MOODS.includes(a.mood) ? a.mood : target.mood,
    };
    return {
      applicable,
      reason,
      transformed: applicable ? transformed : "",
      note: typeof obj.note === "string" ? obj.note.trim() : "",
      noteEn: typeof obj.note_en === "string" ? obj.note_en.trim() : "",
      achieved,
    };
  } catch {
    return null;
  }
}

function userMsg(source: string, target: Tuple): string {
  return `Satz: """${source}"""\nZielform: ${JSON.stringify(target)}`;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callAnthropic(source: string, target: Tuple): Promise<TransformOut | null> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) { console.error("[transform] anthropic: no ANTHROPIC_API_KEY set"); return null; }
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
        body: JSON.stringify({
          model: TRANSFORM_MODEL,
          max_tokens: 400,
          // Thinking disabled: leaving adaptive thinking on (the Sonnet 5 default)
          // could consume the 400-token budget and truncate the JSON. No
          // `temperature` is sent (removed on the Sonnet 5 / Opus 4.8 family).
          thinking: { type: "disabled" },
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMsg(source, target) }],
        }),
      });
      if (res.status === 429 || res.status === 529) {
        console.error(`[transform] anthropic overloaded status=${res.status} attempt=${attempt}`);
        if (attempt === 0) { await sleep(700); continue; }
        return null;
      }
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.error(`[transform] anthropic http=${res.status} body=${body.slice(0, 400)}`);
        return null;
      }
      const data = await res.json();
      const raw = data.content?.[0]?.text ?? "";
      const parsed = parse(raw, target);
      if (!parsed) { console.error(`[transform] anthropic parse-fail raw=${String(raw).slice(0, 400)}`); return null; }
      const inTok = data.usage?.input_tokens ?? 0;
      const outTok = data.usage?.output_tokens ?? 0;
      const isSonnet = TRANSFORM_MODEL.includes("sonnet");
      const cost = (inTok / 1e6) * (isSonnet ? 3 : 1) + (outTok / 1e6) * (isSonnet ? 15 : 5);
      return { ...parsed, model: TRANSFORM_MODEL, cost };
    } catch (e) {
      console.error(`[transform] anthropic threw: ${e}`);
      return null;
    }
  }
  return null;
}

async function callGemini(source: string, target: Tuple): Promise<TransformOut | null> {
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
          contents: [{ parts: [{ text: userMsg(source, target) }] }],
        }),
      },
    );
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[transform] gemini http=${res.status} body=${body.slice(0, 400)}`);
      return null;
    }
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const parsed = parse(raw, target);
    if (!parsed) { console.error(`[transform] gemini parse-fail raw=${String(raw).slice(0, 400)}`); return null; }
    return { ...parsed, model: "gemini-1.5-flash", cost: 0.0005 };
  } catch (e) {
    console.error(`[transform] gemini threw: ${e}`);
    return null;
  }
}

async function callOpenAI(source: string, target: Tuple): Promise<TransformOut | null> {
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
          { role: "user", content: userMsg(source, target) },
        ],
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error(`[transform] openai http=${res.status} body=${body.slice(0, 400)}`);
      return null;
    }
    const data = await res.json();
    const parsed = parse(data.choices?.[0]?.message?.content ?? "", target);
    if (!parsed) return null;
    return { ...parsed, model: "gpt-4o-mini", cost: 0.0008 };
  } catch (e) {
    console.error(`[transform] openai threw: ${e}`);
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

  const { data: cfg } = await admin.from("app_config").select("value").eq("key", "sentence_studio").maybeSingle();
  if (cfg?.value?.enabled === false || cfg?.value?.transforms_disabled === true) {
    return json({ ok: false, message: "Umformungen sind gerade nicht verfügbar." });
  }

  let body: { source?: string; checkId?: string; target?: Partial<Tuple> };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Ungültige Anfrage." }, 400);
  }
  const source = normalize(body.source ?? "");
  if (source.length < 3) return json({ ok: false, message: "Satz zu kurz." }, 400);
  if (source.length > MAX_SENTENCE_LEN) return json({ ok: false, message: "Satz zu lang." }, 400);

  const t = body.target ?? {};
  if (!VOICES.includes(t.voice ?? "") || !TENSES.includes(t.tense ?? "") || !MOODS.includes(t.mood ?? "")) {
    return json({ ok: false, message: "Ungültige Zielform." }, 400);
  }
  const target: Tuple = { voice: t.voice!, tense: t.tense!, mood: t.mood! };

  const month = monthKey();

  // Global monthly $ fuse.
  const { data: usage } = await admin.from("ai_usage").select("cost_estimate").eq("month", month).maybeSingle();
  if (usage && Number(usage.cost_estimate) >= MONTHLY_CAP) {
    return json({ ok: false, limitReached: true, message: "Das KI-Kontingent für diesen Monat ist aufgebraucht." });
  }

  // Cache lookup FIRST (free, before any rate-limit spend is consumed).
  const cacheKey = await hash(`${normalize(source)}\x1f${canonicalTuple(target)}\x1f${PROMPT_VERSION}\x1f${TRANSFORM_MODEL}`);
  const { data: hit } = await admin
    .from("sentence_transforms").select("applicable, reason, result, note, note_en")
    .eq("transform_hash", cacheKey).maybeSingle();
  if (hit) {
    // Popularity counter for the admin cache-hit-rate metric (best-effort).
    await admin.rpc("bump_transform_hit", { p_hash: cacheKey }).then(() => {}, () => {});
    return json({
      ok: true, cached: true, applicable: hit.applicable,
      reason: hit.reason, transformed: hit.result ?? "", note: hit.note ?? "", noteEn: hit.note_en ?? "",
    });
  }

  // Rate limits (paid ops only). Burst (per minute), daily, monthly ceiling.
  const now = Date.now();
  const minuteAgo = new Date(now - 60_000).toISOString();
  const { count: burst } = await admin
    .from("sentence_ai_ops").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("kind", "transform").gte("created_at", minuteAgo);
  if ((burst ?? 0) >= TRANSFORM_BURST_LIMIT) {
    return json({ ok: false, message: "Kurz durchatmen. Probier gleich die nächste Form." });
  }
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const { count: daily } = await admin
    .from("sentence_ai_ops").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).eq("kind", "transform").gte("created_at", startOfDay.toISOString());
  if ((daily ?? 0) >= TRANSFORM_DAILY_LIMIT) {
    return json({ ok: false, limitReached: true, message: "Heute keine weiteren Umformungen. Der geprüfte Satz bleibt sichtbar." });
  }
  const startOfMonth = new Date();
  startOfMonth.setUTCDate(1);
  startOfMonth.setUTCHours(0, 0, 0, 0);
  const { count: monthOps } = await admin
    .from("sentence_ai_ops").select("id", { count: "exact", head: true })
    .eq("user_id", user.id).gte("created_at", startOfMonth.toISOString());
  if ((monthOps ?? 0) >= USER_MONTHLY_LIMIT) {
    return json({ ok: false, limitReached: true, message: "Du hast dein KI-Kontingent für diesen Monat erreicht." });
  }

  // Optional gate: the source must correspond to a check this user made.
  if (body.checkId) {
    const { data: chk } = await admin
      .from("sentence_checks").select("id").eq("id", body.checkId).eq("user_id", user.id).maybeSingle();
    if (!chk) return json({ ok: false, message: "Bitte prüfe den Satz zuerst." }, 400);
  }

  console.log(`[transform] providers configured: anthropic=${!!Deno.env.get("ANTHROPIC_API_KEY")} gemini=${!!Deno.env.get("GEMINI_API_KEY")} openai=${!!Deno.env.get("OPENAI_API_KEY")} model=${TRANSFORM_MODEL}`);
  const out = (await callAnthropic(source, target)) || (await callGemini(source, target)) || (await callOpenAI(source, target));
  if (!out) {
    console.error(`[transform] all providers failed target=${canonicalTuple(target)}`);
    return json({ ok: false, message: "Die Umformung ist momentan nicht verfügbar." });
  }

  // Contract validation: an "applicable" transform must be non-empty, differ from
  // the source, and hit the requested tuple; otherwise treat as not applicable.
  let applicable = out.applicable;
  let reason = out.reason;
  let transformed = out.transformed;
  if (applicable) {
    const achievedOk = out.achieved.voice === target.voice && out.achieved.tense === target.tense && out.achieved.mood === target.mood;
    if (!transformed || normalize(transformed) === normalize(source) || !achievedOk) {
      applicable = false;
      reason = transformed && normalize(transformed) === normalize(source) ? "bereits_zielform" : "nicht_idiomatisch";
      transformed = "";
    }
  }

  // Cache globally (free for the next learner) + record the paid op + bump usage.
  await admin.from("sentence_transforms").insert({
    transform_hash: cacheKey, source_hash: await hash(normalize(source)), target_tuple: target,
    applicable, reason, result: transformed, note: out.note, note_en: out.noteEn, tier: "llm", model: out.model, hits: 0,
  }).then(() => {}, () => {});
  await admin.from("sentence_ai_ops").insert({ user_id: user.id, kind: "transform", model: out.model, cost_estimate: out.cost });
  await admin.rpc("bump_ai_usage", { p_month: month, p_cost: out.cost }).then(() => {}, async () => {
    await admin.from("ai_usage").upsert(
      { month, calls: 1, cost_estimate: out.cost, updated_at: new Date().toISOString() },
      { onConflict: "month", ignoreDuplicates: false },
    );
  });

  return json({ ok: true, cached: false, applicable, reason, transformed, note: out.note, noteEn: out.noteEn });
});
