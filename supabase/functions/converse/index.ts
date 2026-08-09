// Supabase Edge Function: converse
// ---------------------------------------------------------------------------
// The AI conversation partner behind Sprechen (s193).
//
// Two modes, because they cost very different amounts:
//   mode "turn"     — the partner's next spoken line. Short, frequent, cheap.
//   mode "debrief"  — one richer call at the end: correct what the learner
//                     said, judge each brief goal, and (in exam mode) score it.
//
//   1. Auth + per-user daily conversation limit + per-user monthly ceiling +
//      global monthly spend auto-shutoff (the same fuse evaluate-writing uses).
//   2. The row is written when a conversation STARTS, not when it finishes, so
//      the daily limit counts what actually costs money. A learner cannot
//      abandon conversations to get unlimited turns.
//   3. Turn count is read from the STORED row, never from the request body, so
//      a forged transcript cannot extend a conversation past its cost ceiling.
//   4. Cascade per call: free Gemini Flash → Claude → OpenAI.
//
// Secrets (set via `supabase secrets set …`, never shipped to the browser):
//   ANTHROPIC_API_KEY        (required)
//   GEMINI_API_KEY           (optional, free-tier first leg of the cascade)
//   OPENAI_API_KEY           (optional fallback)
//   DAILY_LIMIT_CONVERSATIONS      (optional, default 6)  Übungsgespräche/Tag
//   DAILY_LIMIT_EXAM_CONVERSATIONS (optional, default 3)  Prüfungsgespräche/Tag
//   MONTHLY_SPEND_CAP_USD    (optional, default 5)   shared with every AI feature
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  anthropicUsage, geminiUsage, openaiUsage, loadRates, priceCall, providerOf,
  recordAiCall, type TokenUsage,
} from "../_shared/aiUsage.ts";

/* --------------------------------- CORS ---------------------------------- */

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

/* -------------------------------- Guards --------------------------------- */

// TWO daily budgets since s204 (founder: "I don't want to have the current limit
// for sprechen exercises. it's very less. increase the limit to 6 for üben and 3
// for Prüfung"). They are counted SEPARATELY against `speaking_conversations.exam`,
// so a day spent practising can never eat the exam allowance, and neither can be
// spent by the other. Practice conversations are also the cheaper of the two: an
// exam debrief scores as well as corrects.
const DAILY_LIMIT_PRACTICE = Number(Deno.env.get("DAILY_LIMIT_CONVERSATIONS") ?? "6");
const DAILY_LIMIT_EXAM = Number(Deno.env.get("DAILY_LIMIT_EXAM_CONVERSATIONS") ?? "3");
const dailyLimitFor = (exam: boolean) => (exam ? DAILY_LIMIT_EXAM : DAILY_LIMIT_PRACTICE);
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
// Raised with the daily limits (s204): 40/month against 9 possible per day would
// have bound after four days and made the new daily numbers a fiction. 120 keeps
// roughly the old ratio (about a fortnight of heavy use). The global
// MONTHLY_SPEND_CAP_USD fuse still sits above it, and Gemini answers most calls
// for free, so this raises the ceiling on volume far more than on spend.
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_CONVERSATIONS") ?? "120");

/**
 * Hard ceiling on learner turns per conversation, enforced against the STORED
 * transcript. Mirrors MAX_LEARNER_TURNS in src/engine/conversation.ts; the
 * client cap is a courtesy, this one is the cost control.
 */
const MAX_LEARNER_TURNS = 14;
/** Bounds one spoken utterance, so a pasted essay cannot become a turn. */
const MAX_UTTERANCE = 800;

// Turns are short and conversational, so they run on the cheap model; the
// debrief is where the pedagogy is and gets the stronger one. Both overridable.
const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.5-flash";
const TURN_MODEL = Deno.env.get("SPEAKING_TURN_MODEL") ?? "claude-haiku-4-5";
const DEBRIEF_MODEL = Deno.env.get("SPEAKING_DEBRIEF_MODEL") ?? "claude-sonnet-5";
const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") ?? "gpt-5";

/**
 * Output budgets, per mode. These are the s196 bug fix, and the two numbers are
 * different for a reason.
 *
 * A TURN is one to three spoken sentences, so 500 tokens is generous.
 *
 * The DEBRIEF has to echo back EVERY sentence the learner said, corrected, plus
 * a German tip, its English twin and the verdict arrays, as one JSON object.
 * Both legs of the cascade ran on 1400 tokens, which a twelve-turn conversation
 * blows straight through: the JSON came back truncated, `parseJson` failed and
 * the learner got "Die Rückmeldung konnte nicht gelesen werden" over a
 * conversation that had gone perfectly (founder s196). Gemini 2.5 Flash made it
 * worse, because it spends output tokens on thinking before it writes a
 * character. 4096 matches what every other function here already uses.
 */
const TURN_MAX_TOKENS = 500;
const DEBRIEF_MAX_TOKENS = 4096;

/**
 * How long one leg of the cascade may take before it is abandoned and the next
 * model is asked (s206).
 *
 * There was no timeout at all, on any leg, in any function here. A provider that
 * answers slowly or not at all therefore held the whole request open, and the
 * learner sat on "… antwortet" with no reply and no error, because the client
 * only ever learns something when the request RETURNS (the founder's "it loads
 * and there's no response from ai"). A cascade whose first leg cannot time out
 * is not a cascade: it is a single point of failure with two spares behind it.
 *
 * The numbers are the shape of the call, not a guess: a spoken turn is one to
 * three sentences and is back in two or three seconds when it is healthy, so 20
 * seconds is already pathological; the debrief writes a whole JSON object over a
 * twelve-turn transcript and is allowed proportionally longer.
 */
const TURN_TIMEOUT_MS = 20_000;
const DEBRIEF_TIMEOUT_MS = 60_000;

function monthKey(d = new Date()): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/* ------------------------------- The prompts ------------------------------ */

interface Brief {
  title: string;
  partnerName: string;
  partnerRole: string;
  register: "du" | "sie";
  situation: string;
  goals: string[];
  level: string;
  exam: boolean;
  /** German labels of the target Redemittel categories, for the debrief only. */
  redemittel: string[];
}

interface WireTurn {
  role: "assistant" | "user";
  text: string;
}

/**
 * The partner's character. Three rules do the pedagogical work here, and each
 * of them is a thing a general-purpose assistant gets wrong by default:
 *
 *  - STAY IN CHARACTER. An assistant asked to role-play drifts into being
 *    helpful ("Great job! Here's how to say that better…"), which ends the
 *    simulation.
 *  - DO NOT CORRECT. Interrupting a learner to fix their grammar is the single
 *    most reliable way to stop them speaking. All correction waits for the
 *    debrief, which is the whole reason the debrief exists.
 *  - DO NOT DO THEIR WORK. The partner must not volunteer the information the
 *    learner is supposed to ask for, or the goals become unachievable-by-doing
 *    and the learner passes by staying silent.
 */
function turnSystemPrompt(brief: Brief): string {
  const anrede = brief.register === "du" ? "duzt" : "siezt";
  return (
    `Du spielst eine Rolle in einer Sprechübung für Deutschlernende auf Niveau ${brief.level}. ` +
    `Du bist ${brief.partnerName}, ${brief.partnerRole}. Du ${anrede} die lernende Person. ` +
    `Situation: ${brief.situation} ` +
    `\n\nREGELN:\n` +
    `1. Bleib immer in deiner Rolle. Du bist NICHT ein Assistent, ein Lehrer oder eine KI. ` +
    `Sprich nur als ${brief.partnerName}.\n` +
    `2. Korrigiere die Sprache der lernenden Person NIEMALS. Kommentiere ihre Fehler nicht, ` +
    `lobe ihr Deutsch nicht und gib keine Tipps. Wenn du etwas nicht verstehst, frag natürlich ` +
    `nach, so wie ein Mensch im echten Gespräch nachfragen würde.\n` +
    `3. Antworte kurz: ein bis drei Sätze, so wie man wirklich spricht. Keine Aufzählungen, ` +
    `keine Überschriften, keine Emojis, keine Sternchen. Nur gesprochene Sprache.\n` +
    `4. Nimm der lernenden Person die Aufgabe nicht ab. Biete von dir aus keine Lösung an und ` +
    `nenne keine Informationen, nach denen sie fragen soll. Warte, bis sie fragt.\n` +
    `5. Sprich einfaches, natürliches Deutsch auf ${brief.level}-Niveau. ` +
    `Keine seltenen Fachbegriffe.\n` +
    `6. Sei ein realistischer Gesprächspartner: freundlich, aber nicht übertrieben ` +
    `entgegenkommend. Wenn es zur Situation passt, hak nach oder widersprich.\n` +
    (brief.exam
      ? `7. Das ist eine Prüfungssimulation. Bleib sachlich und halte das Gespräch in Gang, ` +
        `bis alle Punkte der Aufgabe besprochen sind.\n`
      : "") +
    `\nAntworte AUSSCHLIESSLICH mit dem, was ${brief.partnerName} sagt. Kein Name davor, ` +
    `keine Anführungszeichen, keine Regieanweisungen.`
  );
}

/**
 * The debrief. Mirrors evaluate-writing's rubric prompt deliberately: content
 * first (did they achieve the goals), then ONE language weakness, then the
 * minimally-corrected text the Original/Korrigiert diff is built from.
 */
function debriefSystemPrompt(brief: Brief): string {
  const goalList = brief.goals.map((g, i) => `${i + 1}. ${g}`).join("\n");
  let s =
    `Du bist Prüfer:in für Deutsch als Fremdsprache und bewertest ein GESPROCHENES Gespräch ` +
    `auf Niveau ${brief.level}. Du bekommst das Transkript. ` +
    `\n\nWICHTIG ZUM TRANSKRIPT: Es kommt aus einer automatischen Spracherkennung. ` +
    `Zeichensetzung und Groß-/Kleinschreibung stammen von der Maschine, nicht von der lernenden ` +
    `Person. Bewerte sie deshalb NICHT. Bewerte auch keine Tippfehler oder Hörfehler, die ` +
    `offensichtlich von der Erkennung kommen. Bewerte nur, was jemand wirklich gesagt hat: ` +
    `Wortwahl, Wortstellung, Grammatik, Register und Aufgabenerfüllung.\n` +
    `\nDIE AUFGABE der lernenden Person war:\n${goalList}\n` +
    `\nPrüfe ZUERST die Aufgabenerfüllung: Ist jeder Punkt im Gespräch wirklich erledigt worden? ` +
    `Ein Punkt gilt nur als erfüllt, wenn die lernende Person ihn selbst angesprochen hat. ` +
    `Gib unter "goalsMet" ein Array mit genau ${brief.goals.length} Wahrheitswerten zurück, ` +
    `in derselben Reihenfolge wie oben.\n` +
    `\nGib unter "insight" EINEN kurzen, konkreten, ermutigenden Tipp auf Deutsch (2–3 Sätze, ` +
    `Du-Form): entweder der wichtigste fehlende Aufgabenpunkt oder, wenn die Aufgabe erfüllt ist, ` +
    `die wichtigste sprachliche Schwachstelle. ` +
    `SPRACHE DES TIPPS: einfaches Deutsch auf A2-Niveau. Kurze Hauptsätze (höchstens 12 Wörter), ` +
    `Alltagswortschatz, keine Fachbegriffe wie "Aufgabenerfüllung", "Register" oder "Konnektor". ` +
    `Nenne ein konkretes Beispiel aus dem Gespräch. ` +
    `Gib den GLEICHEN Tipp unter "insightEn" auf ebenso einfachem Englisch.\n` +
    `\nGib unter "corrected" ALLE Sätze der lernenden Person korrigiert zurück, in derselben ` +
    `Reihenfolge, durch Zeilenumbrüche getrennt, ohne die Beiträge des Gesprächspartners. ` +
    `Dieselben Sätze und derselbe Inhalt, nur mit den nötigen sprachlichen Korrekturen. ` +
    `Formuliere NICHT neu, kürze nicht und ergänze keine Inhalte. ` +
    `Wenn ein Satz korrekt ist, gib ihn unverändert zurück.\n`;
  if (brief.redemittel.length) {
    // Asked for, never guessed. The client cannot infer this: a learner who
    // makes a suggestion does not say the word "Vorschläge machen", so a
    // string match against the category label would be theatre.
    s +=
      `\nDie lernende Person sollte diese Redemittel-Bereiche benutzen: ` +
      `${brief.redemittel.join(", ")}. Gib unter "redemittelUsed" ein Array mit genau ` +
      `${brief.redemittel.length} Wahrheitswerten zurück, in derselben Reihenfolge: ` +
      `true, wenn die lernende Person diesen Bereich im Gespräch wirklich benutzt hat.\n`;
  }
  if (brief.exam) {
    s +=
      `\nGib zusätzlich unter "score" eine GANZE Zahl von 0 bis 100: deine Prüfungsbewertung ` +
      `des Gesprächs auf ${brief.level}-Niveau, gewichtet wie in der mündlichen Prüfung ` +
      `(Aufgabenerfüllung 40 %, Interaktion 30 %, sprachliche Korrektheit 30 %). ` +
      `Ein Gespräch, das die Aufgabe verfehlt, bleibt unter 40.\n`;
  }
  s +=
    `\nAntworte AUSSCHLIESSLICH als JSON mit den Feldern {"goalsMet","insight","insightEn",` +
    `"corrected"` +
    (brief.redemittel.length ? `,"redemittelUsed"` : "") +
    (brief.exam ? `,"score"` : "") +
    `}. Gib AUSSCHLIESSLICH das JSON-Objekt aus, ohne Markdown und ohne Code-Zäune.`;
  return s;
}

/* ------------------------------- Model calls ------------------------------ */

/** Strip code fences a model may wrap JSON in, then parse. */
function parseJson(raw: string): Record<string, unknown> | null {
  const cleaned = raw.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

interface ModelOut {
  text: string;
  model: string;
  // What the provider REPORTED (s204). Priced at the call site from the one
  // shared rate table, so a reprice is a config edit rather than four diffs.
  usage: TokenUsage;
}

/** What a call needs beyond its prompt: how much it may write, and in what shape. */
interface CallOpts {
  maxTokens: number;
  /** Ask the model for raw JSON. The debrief does; a spoken turn does not. */
  json?: boolean;
  /** Milliseconds one leg may take before the next model is asked. */
  timeoutMs: number;
  /**
   * Whether the Gemini leg may think before it writes (s206).
   *
   * FALSE for a turn, and this is the bug the founder hit. `gemini-2.5-flash`
   * reasons by default, and Google bills those thoughts as OUTPUT, so they come
   * out of `maxOutputTokens`. A turn allows 500 tokens, which a thinking model
   * spends in full on thoughts about a one-sentence reply: the response comes
   * back with `finishReason: "MAX_TOKENS"` and NO text part, this function
   * discards it, and every single turn silently fell through to the paid leg
   * behind it. The free leg was not free, it was dead, and it cost a whole extra
   * round trip on every turn of every conversation.
   *
   * The other functions here never saw it because they give Gemini 4096 tokens,
   * where the thoughts fit. Sprechen is the one place a model is asked for two
   * sentences, which is exactly where a thinking budget does not fit.
   */
  think?: boolean;
}

/**
 * A leg's own deadline. `AbortSignal.timeout` is what makes the cascade able to
 * move on: without it a hanging provider is indistinguishable from a slow one,
 * forever.
 */
function legSignal(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

/**
 * Why a leg lost, in the function logs. It used to return `null` for every
 * cause, so a 401 from an expired key, a 429, a model id that no longer exists
 * and a genuine timeout were all the same silent nothing, and "the AI doesn't
 * work" could not be diagnosed without reproducing it. Nothing here is a secret:
 * a provider name, an HTTP status and the provider's own error code.
 */
async function legFailed(provider: string, res: Response): Promise<null> {
  let detail = "";
  try {
    detail = (await res.text()).slice(0, 300);
  } catch {
    /* body already consumed or unreadable; the status is the useful part */
  }
  console.error(`converse: ${provider} HTTP ${res.status} ${detail}`);
  return null;
}

async function callGemini(
  system: string,
  turns: WireTurn[],
  opts: CallOpts,
): Promise<ModelOut | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        signal: legSignal(opts.timeoutMs),
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({
            role: t.role === "assistant" ? "model" : "user",
            parts: [{ text: t.text }],
          })),
          generationConfig: {
            maxOutputTokens: opts.maxTokens,
            // The same JSON mode every other function here uses. Without it
            // Gemini wraps the object in prose or code fences and the parse is
            // a gamble; `parseJson` covered the fences, not the prose.
            ...(opts.json ? { responseMimeType: "application/json" } : {}),
            // Thoughts are billed as output, so on a 500-token turn they ate
            // the entire budget and the answer was never written (see
            // CallOpts.think). Zero is the documented way to turn 2.5 Flash's
            // reasoning off; a turn is one to three spoken sentences and has
            // nothing to reason about.
            ...(opts.think === false ? { thinkingConfig: { thinkingBudget: 0 } } : {}),
          },
        }),
      },
    );
    if (!res.ok) return await legFailed("gemini", res);
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) {
      // Almost always `finishReason: "MAX_TOKENS"` with the budget spent on
      // thoughts. Logged with the reason so it is a fact in the logs rather
      // than an invisible fall-through to the paid leg.
      console.error(
        `converse: gemini returned no text (finishReason ${data?.candidates?.[0]?.finishReason})`,
      );
      return null;
    }
    // Free tier prices at $0, which is the whole point of leading with it; the
    // tokens are recorded regardless, so free-quota headroom is measurable.
    return { text, model: GEMINI_MODEL, usage: geminiUsage(data) };
  } catch (e) {
    // Includes the leg's own timeout, which is the point: a hanging provider
    // now ENDS, and the next model gets its turn.
    console.error(`converse: gemini call failed: ${e}`);
    return null;
  }
}

async function callAnthropic(
  system: string,
  turns: WireTurn[],
  model: string,
  opts: CallOpts,
): Promise<ModelOut | null> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      signal: legSignal(opts.timeoutMs),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens,
        system,
        messages: turns.map((t) => ({ role: t.role, content: t.text })),
      }),
    });
    if (!res.ok) return await legFailed("anthropic", res);
    const data = await res.json();
    // A safety decline returns HTTP 200 with stop_reason "refusal" and no
    // usable content, so `stop_reason` is checked before `content` is read.
    if (data?.stop_reason === "refusal") return null;
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) return null;
    return { text, model, usage: anthropicUsage(data) };
  } catch (e) {
    console.error(`converse: anthropic call failed: ${e}`);
    return null;
  }
}

async function callOpenAI(
  system: string,
  turns: WireTurn[],
  opts: CallOpts,
): Promise<ModelOut | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      signal: legSignal(opts.timeoutMs),
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: system },
          ...turns.map((t) => ({ role: t.role === "assistant" ? "assistant" : "user", content: t.text })),
        ],
        // GPT-5 is a reasoning model: cap with max_completion_tokens (max_tokens
        // is rejected), and leave room, because reasoning tokens are spent out
        // of this budget before a single character of the answer is written.
        max_completion_tokens: opts.maxTokens,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
    if (!res.ok) return await legFailed("openai", res);
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) return null;
    return { text, model: OPENAI_MODEL, usage: openaiUsage(data) };
  } catch (e) {
    console.error(`converse: openai call failed: ${e}`);
    return null;
  }
}

/**
 * Free tier first, then the paid legs.
 *
 * `accept` is what makes the cascade a real cascade for the debrief (s196). It
 * used to take the first leg that returned ANY text, so a Gemini answer that
 * was truncated mid-JSON was accepted, the parse failed downstream and Claude
 * was never asked. A leg whose output the caller cannot use is a leg that
 * FAILED, so the next one gets its turn.
 */
async function cascade(
  system: string,
  turns: WireTurn[],
  paidModel: string,
  opts: CallOpts,
  accept: (out: ModelOut) => boolean = () => true,
): Promise<ModelOut | null> {
  const legs = [
    () => callGemini(system, turns, opts),
    () => callAnthropic(system, turns, paidModel, opts),
    () => callOpenAI(system, turns, opts),
  ];
  for (const leg of legs) {
    const out = await leg();
    if (out && accept(out)) return out;
    if (out) console.error("converse: unusable output from", out.model);
  }
  return null;
}

/* ------------------------------ The handler ------------------------------- */

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

  const authHeader = req.headers.get("Authorization") ?? "";
  const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await authed.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, message: "Nicht angemeldet." }, 401);

  const admin = createClient(supabaseUrl, serviceKey);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Ungültige Anfrage." }, 400);
  }

  const mode = body.mode === "debrief" ? "debrief" : "turn";
  const conversationId = typeof body.conversationId === "string" ? body.conversationId : "";
  if (!/^[0-9a-f-]{36}$/i.test(conversationId))
    return json({ ok: false, message: "Ungültige Gesprächs-ID." }, 400);

  // Every brief field is learner-supplied input on the wire, so it is bounded
  // before it can reach a prompt.
  const clip = (v: unknown, max: number) =>
    typeof v === "string" && v.trim() ? v.trim().slice(0, max) : "";
  const rawBrief = (body.brief ?? {}) as Record<string, unknown>;
  const goals = Array.isArray(rawBrief.goals)
    ? rawBrief.goals.map((g) => clip(g, 200)).filter(Boolean).slice(0, 5)
    : [];
  const brief: Brief = {
    title: clip(rawBrief.title, 120) || "Gespräch",
    partnerName: clip(rawBrief.partnerName, 60) || "Gesprächspartner:in",
    partnerRole: clip(rawBrief.partnerRole, 120) || "deine Gesprächspartnerin",
    register: rawBrief.register === "du" ? "du" : "sie",
    situation: clip(rawBrief.situation, 600),
    goals,
    level: clip(rawBrief.level, 8) || "B2",
    exam: rawBrief.exam === true,
    redemittel: Array.isArray(rawBrief.redemittel)
      ? rawBrief.redemittel.map((r) => clip(r, 60)).filter(Boolean).slice(0, 8)
      : [],
  };
  const briefId = clip(rawBrief.id, 64) || null;
  const stage = clip(rawBrief.stage, 16) || null;

  const month = monthKey();

  // (1) Global monthly auto-shutoff — the shared fuse across every AI feature.
  const { data: usage } = await admin
    .from("ai_usage").select("cost_estimate").eq("month", month).maybeSingle();
  if (usage && Number(usage.cost_estimate) >= MONTHLY_CAP) {
    return json({
      ok: false,
      limitReached: true,
      message:
        "Das KI-Kontingent für diesen Monat ist aufgebraucht. Komm im nächsten Monat wieder!",
    });
  }

  // (2) The conversation row. It is created when a conversation STARTS, so the
  // daily limit counts what actually costs money: a learner cannot abandon
  // conversations to farm free turns.
  const { data: existing } = await admin
    .from("speaking_conversations")
    .select("id, turns, exam, created_at, cost_estimate")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  /**
   * Which of the two budgets this conversation spends (s204). For an existing
   * row the ROW's own flag decides, never the request body: a forged `exam`
   * cannot move a running conversation onto the other allowance.
   */
  const isExam = existing ? existing.exam === true : brief.exam;
  const dailyLimit = dailyLimitFor(isExam);
  /** Rows used today ON THIS BUDGET, counted once. Cannot change mid-conversation. */
  let todayUsed: number;
  /** True for the request that CREATED the row, which is what may need undoing. */
  let created = false;

  if (!existing) {
    if (mode === "debrief")
      return json({ ok: false, message: "Gespräch nicht gefunden." }, 404);

    const { count: todayCount } = await admin
      .from("speaking_conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("exam", isExam)
      .gte("created_at", startOfDay.toISOString());
    todayUsed = todayCount ?? 0;
    if (todayUsed >= dailyLimit) {
      return json({
        ok: false,
        limitReached: true,
        dailyLimit,
        dailyRemaining: 0,
        message: isExam
          ? `Du hast heute schon ${dailyLimit} Prüfungsgespräche geführt. Übungsgespräche gehen weiter.`
          : `Du hast heute schon ${dailyLimit} Gespräche geübt. Komm morgen wieder!`,
      });
    }

    const startOfMonth = new Date();
    startOfMonth.setUTCDate(1);
    startOfMonth.setUTCHours(0, 0, 0, 0);
    const { count: monthCount } = await admin
      .from("speaking_conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());
    if ((monthCount ?? 0) >= USER_MONTHLY_LIMIT) {
      return json({
        ok: false,
        limitReached: true,
        message:
          "Du hast dein KI-Kontingent für diesen Monat erreicht. Komm nächsten Monat wieder!",
      });
    }

    const { error: insErr } = await admin.from("speaking_conversations").insert({
      id: conversationId,
      user_id: user.id,
      brief_id: briefId,
      exam: brief.exam,
      stage,
      turns: [],
    });
    // A failed insert is never silent (DB audit R3): without the row the daily
    // limit stops counting, so this fails the request rather than running free.
    if (insErr) {
      console.error("speaking_conversations insert failed", insErr.message);
      return json({
        ok: false,
        message: "Das Gespräch konnte nicht gestartet werden. Bitte versuche es später erneut.",
      });
    }
    created = true;
    todayUsed += 1;
  } else {
    // An existing conversation: the row was already counted on the turn that
    // created it, so today's usage is read once here rather than re-counted on
    // every single turn the way it used to be (s194 audit P31).
    const { count } = await admin
      .from("speaking_conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("exam", isExam)
      .gte("created_at", startOfDay.toISOString());
    todayUsed = count ?? 0;
  }

  // The transcript of record is the STORED one. A forged body cannot extend a
  // conversation past its ceiling, because the ceiling is measured here.
  const storedTurns: { role: string; text: string }[] = Array.isArray(existing?.turns)
    ? (existing!.turns as { role: string; text: string }[])
    : [];
  const learnerTurns = storedTurns.filter((t) => t.role === "learner").length;

  const remainingAfter = Math.max(0, dailyLimit - todayUsed);

  /**
   * Give the daily unit back when the conversation never got off the ground
   * (s194 audit P30). The row is inserted BEFORE the model is called so an
   * abandoned run cannot farm free turns, but that also meant one transient
   * upstream failure cost the learner half of a two-per-day allowance for a
   * conversation that produced nothing. Only the request that created the row
   * can undo it, and only while the transcript is still empty, so this can
   * never erase a conversation that actually happened.
   */
  const undoEmptyStart = async () => {
    if (!created) return;
    const { error } = await admin
      .from("speaking_conversations")
      .delete()
      .eq("id", conversationId)
      .eq("user_id", user.id)
      .eq("turns", "[]");
    if (error) console.error("speaking_conversations rollback failed", error.message);
  };

  /* ------------------------------- turn mode ------------------------------ */

  if (mode === "turn") {
    const raw = typeof body.utterance === "string" ? body.utterance.trim() : "";
    const utterance = clip(body.utterance, MAX_UTTERANCE);
    // An empty utterance is the learner opening the conversation: the partner
    // speaks first. Any later empty turn is a recognition miss and is refused
    // rather than spending a call to have the partner answer silence.
    if (!utterance && storedTurns.length > 0)
      return json({ ok: false, message: "Nichts verstanden." }, 400);
    // Too long is REFUSED, not silently shortened (s194 audit P34): the client
    // showed the whole thing in the transcript while the stored and graded one
    // stopped at 800 characters, so the two quietly disagreed.
    if (raw.length > MAX_UTTERANCE) {
      await undoEmptyStart();
      return json({
        ok: false,
        message: "Das war zu lang für einen Beitrag. Sag es bitte kürzer.",
      });
    }

    if (learnerTurns >= MAX_LEARNER_TURNS) {
      return json({
        ok: false,
        conversationOver: true,
        message: "Das Gespräch ist zu Ende. Schau dir jetzt deine Rückmeldung an.",
      });
    }

    const wire: WireTurn[] = storedTurns.map((t) => ({
      role: t.role === "partner" ? ("assistant" as const) : ("user" as const),
      text: t.text,
    }));
    if (utterance) wire.push({ role: "user", text: utterance });
    // Anthropic and Gemini both require the exchange to open on a user turn.
    if (wire.length === 0 || wire[0].role !== "user")
      wire.unshift({ role: "user", text: "(Das Gespräch beginnt.)" });

    const out = await cascade(turnSystemPrompt(brief), wire, TURN_MODEL, {
      maxTokens: TURN_MAX_TOKENS,
      timeoutMs: TURN_TIMEOUT_MS,
      think: false,
    });
    if (!out) {
      await undoEmptyStart();
      return json({
        ok: false,
        message: "Deine Gesprächspartnerin ist gerade nicht erreichbar. Bitte versuche es erneut.",
      });
    }
    // The partner sometimes prefixes its own name despite the instruction.
    const reply = out.text.trim().replace(/^[A-ZÄÖÜ][\wäöüß .-]{0,40}:\s*/, "");

    const nextTurns = [
      ...storedTurns,
      ...(utterance ? [{ role: "learner", text: utterance }] : []),
      { role: "partner", text: reply },
    ];
    const turnCost = priceCall(out.model, out.usage, await loadRates(admin));
    await recordAiCall(admin, {
      userId: user.id, feature: "converse_turn", provider: providerOf(out.model),
      model: out.model, usage: out.usage, costEstimate: turnCost,
    });
    // ACCUMULATED, not overwritten (s194 audit P29): the row used to report the
    // cost of its most recent turn, which made per-conversation cost reporting
    // wrong by roughly the number of turns. The global fuse was never affected,
    // because `bump_ai_usage` has always added.
    const spentSoFar = Number(existing?.cost_estimate ?? 0) || 0;
    const { error: updErr } = await admin
      .from("speaking_conversations")
      .update({
        turns: nextTurns,
        cost_estimate: spentSoFar + turnCost,
        model: out.model,
      })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    if (updErr) console.error("speaking_conversations turn update failed", updErr.message);

    await admin.rpc("bump_ai_usage", { p_month: month, p_cost: turnCost }).then(
      () => {},
      async () => {
        await admin.from("ai_usage").upsert(
          { month, calls: 1, cost_estimate: turnCost, updated_at: new Date().toISOString() },
          { onConflict: "month", ignoreDuplicates: false },
        );
      },
    );

    return json({
      ok: true,
      reply,
      turnsLeft: Math.max(0, MAX_LEARNER_TURNS - (learnerTurns + (utterance ? 1 : 0))),
      dailyLimit,
      dailyRemaining: remainingAfter,
    });
  }

  /* ------------------------------ debrief mode ---------------------------- */

  const learnerSaid = storedTurns
    .filter((t) => t.role === "learner")
    .map((t) => t.text)
    .join("\n");
  if (!learnerSaid.trim()) {
    return json({
      ok: false,
      message: "Du hast noch nichts gesagt. Führe zuerst ein Gespräch.",
    });
  }

  const transcript = storedTurns
    .map((t) => `${t.role === "partner" ? brief.partnerName : "Lernende Person"}: ${t.text}`)
    .join("\n");

  // The debrief is only usable if it PARSES, so parsing is the accept test and
  // an unparsable leg falls through to the next model instead of failing the
  // whole request (s196).
  const out = await cascade(
    debriefSystemPrompt(brief),
    [{ role: "user", text: `TRANSKRIPT:\n${transcript}` }],
    DEBRIEF_MODEL,
    { maxTokens: DEBRIEF_MAX_TOKENS, json: true, timeoutMs: DEBRIEF_TIMEOUT_MS },
    (o) => parseJson(o.text) !== null,
  );
  const parsed = out ? parseJson(out.text) : null;
  if (!out || !parsed) {
    return json({
      ok: false,
      // Says what to do next, because the retry really does work: the
      // transcript is already stored, so asking again costs no allowance.
      message:
        "Die Rückmeldung ist gerade nicht verfügbar. Versuche es gleich noch einmal.",
    });
  }

  // Every field is validated: a model that returns the wrong shape must not be
  // able to write nonsense into a learner's progress record.
  const goalsMet: boolean[] = Array.isArray(parsed.goalsMet)
    ? brief.goals.map((_, i) => parsed.goalsMet[i] === true)
    : brief.goals.map(() => false);
  const insight = typeof parsed.insight === "string" ? parsed.insight.slice(0, 800) : "";
  const insightEn = typeof parsed.insightEn === "string" ? parsed.insightEn.slice(0, 800) : null;
  const corrected =
    typeof parsed.corrected === "string" && parsed.corrected.trim()
      ? parsed.corrected.trim().slice(0, 4000)
      : learnerSaid;
  const redemittelUsed: boolean[] = Array.isArray(parsed.redemittelUsed)
    ? brief.redemittel.map((_, i) => parsed.redemittelUsed[i] === true)
    : brief.redemittel.map(() => false);
  const rawScore = Number(parsed.score);
  const score =
    brief.exam && Number.isFinite(rawScore)
      ? Math.max(0, Math.min(100, Math.round(rawScore)))
      : null;

  const debriefCost = priceCall(out.model, out.usage, await loadRates(admin));
  await recordAiCall(admin, {
    userId: user.id, feature: "converse_debrief", provider: providerOf(out.model),
    model: out.model, usage: out.usage, costEstimate: debriefCost,
  });

  const { error: updErr } = await admin
    .from("speaking_conversations")
    .update({
      learner_text: learnerSaid,
      corrected_text: corrected,
      goals_met: goalsMet,
      tip: insight,
      tip_en: insightEn,
      score,
      model: out.model,
      // The debrief is the most expensive call of the conversation and used to
      // be left out of the row's cost entirely (s194 audit P29).
      cost_estimate: (Number(existing?.cost_estimate ?? 0) || 0) + debriefCost,
    })
    .eq("id", conversationId)
    .eq("user_id", user.id);
  if (updErr) console.error("speaking_conversations debrief update failed", updErr.message);

  await admin.rpc("bump_ai_usage", { p_month: month, p_cost: debriefCost }).then(
    () => {},
    async () => {
      await admin.from("ai_usage").upsert(
        { month, calls: 1, cost_estimate: debriefCost, updated_at: new Date().toISOString() },
        { onConflict: "month", ignoreDuplicates: false },
      );
    },
  );

  return json({
    ok: true,
    goalsMet,
    redemittelUsed,
    insight,
    insightEn,
    original: learnerSaid,
    corrected,
    score,
    model: out.model,
    dailyLimit,
    dailyRemaining: remainingAfter,
  });
});
