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
//   4. Otherwise ONE LLM call, cascade Gemini 2.5 Flash (free) -> Sonnet 5 ->
//      GPT-5. The model ABSTAINS (applicable:false) rather than hallucinate.
//   5. Contract-validate, cache the result globally, bump ai_usage + ledger.
//
// Secrets: GEMINI_API_KEY (free primary), ANTHROPIC_API_KEY + OPENAI_API_KEY
// (paid backups), GEMINI_MODEL / TRANSFORM_MODEL / OPENAI_MODEL + CLAUDE_BUDGET_USD
// overrides, TRANSFORM_DAILY_LIMIT (default 40),
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

// Provider cascade (per cache-miss): free Gemini Flash first, then paid Claude
// Sonnet, then GPT-5. Sonnet is the paid backup until month-to-date Claude spend
// reaches CLAUDE_BUDGET_USD, after which GPT-5 leads. All three combined are
// bounded by the global MONTHLY_SPEND_CAP_USD fuse (Gemini's free tier is $0).
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const TRANSFORM_MODEL = Deno.env.get("TRANSFORM_MODEL") ?? "claude-sonnet-5";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-5";
// Once month-to-date Claude (Sonnet) spend reaches this, GPT-5 leads the paid
// backup instead of Sonnet. A soft routing threshold, not a hard cap.
const CLAUDE_BUDGET_USD = Number(Deno.env.get("CLAUDE_BUDGET_USD") ?? "2");
// Umformungen do NOT consume the learner's Fokus allowance (founder s167):
// one correction plus its Umformung counts as ONE Fokus round, and the round
// is counted by check-sentence. This bound therefore only exists so the
// "Nochmal" variant cycle cannot run away: DAILY_CHECK_LIMIT (10) rounds x 3
// variants per sentence = 30. Raise it with DAILY_CHECK_LIMIT, never below it.
const TRANSFORM_DAILY_LIMIT = Number(Deno.env.get("TRANSFORM_DAILY_LIMIT") ?? "30");
const TRANSFORM_BURST_LIMIT = Number(Deno.env.get("TRANSFORM_BURST_LIMIT") ?? "8");
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_LIMIT") ?? "200");
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
const MAX_SENTENCE_LEN = Number(Deno.env.get("MAX_SENTENCE_LEN") ?? "300");
// Bumped to "5" with the simple-language rule for note/note_en (founder
// 2026-07-31). "4" added the Zustandspassiv clarifier on top of the "3"
// Modus/Konjunktiv-II rules. The global transform cache is keyed on this, so
// the bump prevents serving notes written under the old, far too advanced
// wording.
const PROMPT_VERSION = Deno.env.get("PROMPT_VERSION") ?? "5";

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
  `tense (praesens, perfekt, praeteritum, plusquamperfekt, futur1, futur2) und ` +
  `mood (indikativ, konjunktiv1, konjunktiv2, imperativ). ` +
  `Regeln fuer Modus: mood=indikativ ist die normale Wirklichkeitsform. ` +
  `mood=konjunktiv2 bildet den Konjunktiv II (hoefliche Bitte oder Irrealis). Nutze bei sein, ` +
  `haben, werden, den Modalverben und starken Verben die SYNTHETISCHE Form ` +
  `(waere, haette, wuerde, koennte, muesste, sollte, duerfte, kaeme, ginge), sonst die ` +
  `wuerde-Umschreibung (wuerde + Infinitiv). In einem wenn-Satz niemals "wuerde", sondern die ` +
  `synthetische Form ("Wenn ich Zeit haette, ..."). Der Konjunktiv II der Vergangenheit ist ` +
  `haette/waere + Partizip II ("haette gemacht", "waere gekommen"). Aus einem Imperativ oder einer ` +
  `direkten Aufforderung wird im Konjunktiv II eine hoefliche Bitte ("Schicken Sie mir ..." -> ` +
  `"Koennten Sie mir bitte ... schicken?"). ` +
  `Regeln fuer Passiv: passiv_vorgang = werden + Partizip II (beschreibt den VORGANG/Prozess, ` +
  `"Die Rechnung wird geprueft"); passiv_zustand = sein + Partizip II (beschreibt das ERGEBNIS/den ` +
  `Zustand nach dem Vorgang, "Die Rechnung ist geprueft", "Das Geschaeft ist geoeffnet"). ` +
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
  // The learner READS the note, so it is written for a beginner even though the
  // sentence itself may be B2 (founder 2026-07-31: "the vocabulary used is way
  // too advanced"). Grading level and explaining level are different things.
  `note: ein kurzer deutscher Hinweis (EIN Satz, hoechstens 15 Woerter) in EINFACHEM Deutsch auf ` +
  `A2-Niveau, der sagt, was sich geaendert hat, bei false warum nicht. Alltagswoerter, ` +
  `keine Fachbegriffe wie "Umformulierung", "Konstruktion", "Genus Verbi", "synthetische Form" ` +
  `oder "Nominalisierung". Nenne die konkreten Woerter aus dem Satz, ` +
  `z. B. "Aus 'ist' wird 'war'. Das ist Praeteritum." ` +
  `note_en: dieselbe Erklaerung auf ebenso einfachem Englisch (A2, ein Satz, gleiche Aussage). ` +
  `achieved: die tatsaechlich gebildete Form. ` +
  `Beispiele: Quelle "Ich bin krank." (Praesens), Ziel Perfekt -> transformed ` +
  `"Ich bin krank gewesen", applicable true. Quelle "Der Bericht wird geschrieben." Ziel ` +
  `aktiv Praesens -> "Man schreibt den Bericht", applicable true. Quelle "Schicken Sie mir die ` +
  `Unterlagen." Ziel mood konjunktiv2 -> "Koennten Sie mir bitte die Unterlagen schicken?", ` +
  `applicable true. Quelle "Man oeffnet das Geschaeft um acht." Ziel passiv_zustand Praesens -> ` +
  `"Das Geschaeft ist um acht geoeffnet", applicable true. ` +
  `Nutze fuer voice, tense und mood in achieved NUR die vorgegebenen Werte, exakt geschrieben. ` +
  `Gib AUSSCHLIESSLICH das JSON-Objekt aus, ohne Markdown, ohne Code-Zaeune und ohne ` +
  `weiteren Text, genau in dieser Form: ` +
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

// variant 0 = the canonical transform (default, unchanged). variant >= 1 asks
// for an ALTERNATIVE phrasing (the "Nochmal" button); the client caps it at 2.
function userMsg(source: string, target: Tuple, variant = 0): string {
  const base = `Satz: """${source}"""\nZielform: ${JSON.stringify(target)}`;
  if (variant <= 0) return base;
  return (
    base +
    `\nGib eine ALTERNATIVE Umformung (Variante ${variant + 1}): natuerlich, aber deutlich anders ` +
    `formuliert als die Standardversion, mit gleicher Bedeutung und exakt derselben Zielform ` +
    `(voice, tense, mood). Wenn keine sinnvolle Alternative existiert, gib die beste Umformung.`
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function callAnthropic(source: string, target: Tuple, variant = 0): Promise<TransformOut | null> {
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
          messages: [{ role: "user", content: userMsg(source, target, variant) }],
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

async function callGemini(source: string, target: Tuple, variant = 0): Promise<TransformOut | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ parts: [{ text: userMsg(source, target, variant) }] }],
          // 2.5 Pro is a thinking model: force pure-JSON output and give a
          // generous budget so reasoning tokens cannot truncate the answer.
          // Alternative variants (Nochmal) get a warmer temperature for variety;
          // variant 0 stays at the default so its cached output never drifts.
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 4096,
            ...(variant > 0 ? { temperature: 0.9 } : {}),
          },
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
    // Free tier: record $0 so free calls never consume the paid spend fuse.
    return { ...parsed, model: GEMINI_MODEL, cost: 0 };
  } catch (e) {
    console.error(`[transform] gemini threw: ${e}`);
    return null;
  }
}

async function callOpenAI(source: string, target: Tuple, variant = 0): Promise<TransformOut | null> {
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
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMsg(source, target, variant) },
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
    return { ...parsed, model: OPENAI_MODEL, cost: 0.004 };
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

  let body: { source?: string; checkId?: string; target?: Partial<Tuple>; variant?: number };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Ungültige Anfrage." }, 400);
  }
  // "Nochmal": 0 = canonical transform, 1..2 = alternative phrasings. Hard-capped
  // here so a client can never spend more than two extra generations per sentence.
  const variant = Math.min(2, Math.max(0, Math.floor(Number(body.variant ?? 0)) || 0));
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

  // Cache lookup FIRST (free, before any rate-limit spend is consumed). variant 0
  // keeps the original key (existing cache entries stay valid); each alternative
  // gets its own key so the two extra versions cache independently and globally.
  const baseKey = `${normalize(source)}\x1f${canonicalTuple(target)}\x1f${PROMPT_VERSION}\x1f${TRANSFORM_MODEL}`;
  const cacheKey = await hash(variant === 0 ? baseKey : `${baseKey}\x1fv${variant}`);
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
  // Free Gemini first. On its failure (any error, incl. free-tier/quota 429,
  // which returns null) fall to a paid model: Sonnet while Claude spend is under
  // budget, else GPT-5 leads. Each paid model backstops the other.
  let out = await callGemini(source, target, variant);
  if (!out) {
    // Month-to-date Claude spend across ALL AI features (Satzlabor + writing coach).
    const monthIso = startOfMonth.toISOString();
    const [opsRows, writRows] = await Promise.all([
      admin.from("sentence_ai_ops").select("cost_estimate").ilike("model", "claude%").gte("created_at", monthIso),
      admin.from("writing_evaluations").select("cost_estimate").ilike("model", "claude%").gte("created_at", monthIso),
    ]);
    const claudeSpend = [...(opsRows.data ?? []), ...(writRows.data ?? [])]
      .reduce((s, r) => s + Number(r.cost_estimate ?? 0), 0);
    out = claudeSpend < CLAUDE_BUDGET_USD
      ? (await callAnthropic(source, target, variant)) || (await callOpenAI(source, target, variant))
      : (await callOpenAI(source, target, variant)) || (await callAnthropic(source, target, variant));
  }
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
