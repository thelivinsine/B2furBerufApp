// Supabase Edge Function: converse
// ---------------------------------------------------------------------------
// The AI conversation partner behind Sprechen (s191).
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
//   DAILY_LIMIT_CONVERSATIONS (optional, default 2)  Gespräche pro Tag
//   MONTHLY_SPEND_CAP_USD    (optional, default 5)   shared with every AI feature
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected automatically.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

const DAILY_LIMIT = Number(Deno.env.get("DAILY_LIMIT_CONVERSATIONS") ?? "2");
const MONTHLY_CAP = Number(Deno.env.get("MONTHLY_SPEND_CAP_USD") ?? "5");
const USER_MONTHLY_LIMIT = Number(Deno.env.get("USER_MONTHLY_CONVERSATIONS") ?? "40");

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
  cost: number;
}

/** Rough per-model $ estimate; the exact figure only has to be good enough to
 *  drive the shared monthly fuse, which is deliberately conservative. */
function estimateCost(model: string, inTok: number, outTok: number): number {
  const rates: Record<string, [number, number]> = {
    "claude-haiku-4-5": [1, 5],
    "claude-sonnet-5": [3, 15],
    "claude-opus-5": [5, 25],
    "gpt-5": [1.25, 10],
  };
  const [i, o] = rates[model] ?? [3, 15];
  return (inTok / 1e6) * i + (outTok / 1e6) * o;
}

async function callGemini(
  system: string,
  turns: WireTurn[],
): Promise<ModelOut | null> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: turns.map((t) => ({
            role: t.role === "assistant" ? "model" : "user",
            parts: [{ text: t.text }],
          })),
          generationConfig: { maxOutputTokens: 1400 },
        }),
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) return null;
    // Free tier: no marginal cost, which is the whole point of leading with it.
    return { text, model: GEMINI_MODEL, cost: 0 };
  } catch {
    return null;
  }
}

async function callAnthropic(
  system: string,
  turns: WireTurn[],
  model: string,
): Promise<ModelOut | null> {
  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 1400,
        system,
        messages: turns.map((t) => ({ role: t.role, content: t.text })),
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // A safety decline returns HTTP 200 with stop_reason "refusal" and no
    // usable content, so `stop_reason` is checked before `content` is read.
    if (data?.stop_reason === "refusal") return null;
    const text = data?.content?.[0]?.text;
    if (typeof text !== "string" || !text.trim()) return null;
    return {
      text,
      model,
      cost: estimateCost(
        model,
        data?.usage?.input_tokens ?? 0,
        data?.usage?.output_tokens ?? 0,
      ),
    };
  } catch {
    return null;
  }
}

async function callOpenAI(
  system: string,
  turns: WireTurn[],
): Promise<ModelOut | null> {
  const key = Deno.env.get("OPENAI_API_KEY");
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: system },
          ...turns.map((t) => ({ role: t.role === "assistant" ? "assistant" : "user", content: t.text })),
        ],
        max_completion_tokens: 1400,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text !== "string" || !text.trim()) return null;
    return {
      text,
      model: OPENAI_MODEL,
      cost: estimateCost(
        OPENAI_MODEL,
        data?.usage?.prompt_tokens ?? 0,
        data?.usage?.completion_tokens ?? 0,
      ),
    };
  } catch {
    return null;
  }
}

/** Free tier first, then the paid legs. */
async function cascade(
  system: string,
  turns: WireTurn[],
  paidModel: string,
): Promise<ModelOut | null> {
  return (
    (await callGemini(system, turns)) ??
    (await callAnthropic(system, turns, paidModel)) ??
    (await callOpenAI(system, turns))
  );
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
    .select("id, turns, exam, created_at")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .maybeSingle();

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  if (!existing) {
    if (mode === "debrief")
      return json({ ok: false, message: "Gespräch nicht gefunden." }, 404);

    const { count: todayCount } = await admin
      .from("speaking_conversations")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfDay.toISOString());
    if ((todayCount ?? 0) >= DAILY_LIMIT) {
      return json({
        ok: false,
        limitReached: true,
        dailyLimit: DAILY_LIMIT,
        dailyRemaining: 0,
        message: `Du hast heute schon ${DAILY_LIMIT} Gespräche geführt. Komm morgen wieder!`,
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
  }

  // The transcript of record is the STORED one. A forged body cannot extend a
  // conversation past its ceiling, because the ceiling is measured here.
  const storedTurns: { role: string; text: string }[] = Array.isArray(existing?.turns)
    ? (existing!.turns as { role: string; text: string }[])
    : [];
  const learnerTurns = storedTurns.filter((t) => t.role === "learner").length;

  const remainingAfter = Math.max(
    0,
    DAILY_LIMIT -
      ((
        await admin
          .from("speaking_conversations")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("created_at", startOfDay.toISOString())
      ).count ?? 0),
  );

  /* ------------------------------- turn mode ------------------------------ */

  if (mode === "turn") {
    const utterance = clip(body.utterance, MAX_UTTERANCE);
    // An empty utterance is the learner opening the conversation: the partner
    // speaks first. Any later empty turn is a recognition miss and is refused
    // rather than spending a call to have the partner answer silence.
    if (!utterance && storedTurns.length > 0)
      return json({ ok: false, message: "Nichts verstanden." }, 400);

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

    const out = await cascade(turnSystemPrompt(brief), wire, TURN_MODEL);
    if (!out) {
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
    const { error: updErr } = await admin
      .from("speaking_conversations")
      .update({ turns: nextTurns, cost_estimate: out.cost, model: out.model })
      .eq("id", conversationId)
      .eq("user_id", user.id);
    if (updErr) console.error("speaking_conversations turn update failed", updErr.message);

    await admin.rpc("bump_ai_usage", { p_month: month, p_cost: out.cost }).then(
      () => {},
      async () => {
        await admin.from("ai_usage").upsert(
          { month, calls: 1, cost_estimate: out.cost, updated_at: new Date().toISOString() },
          { onConflict: "month", ignoreDuplicates: false },
        );
      },
    );

    return json({
      ok: true,
      reply,
      turnsLeft: Math.max(0, MAX_LEARNER_TURNS - (learnerTurns + (utterance ? 1 : 0))),
      dailyLimit: DAILY_LIMIT,
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

  const out = await cascade(
    debriefSystemPrompt(brief),
    [{ role: "user", text: `TRANSKRIPT:\n${transcript}` }],
    DEBRIEF_MODEL,
  );
  if (!out) {
    return json({
      ok: false,
      message: "Die Rückmeldung ist momentan nicht verfügbar. Bitte versuche es später erneut.",
    });
  }

  const parsed = parseJson(out.text);
  if (!parsed) {
    return json({
      ok: false,
      message: "Die Rückmeldung konnte nicht gelesen werden. Bitte versuche es später erneut.",
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
    })
    .eq("id", conversationId)
    .eq("user_id", user.id);
  if (updErr) console.error("speaking_conversations debrief update failed", updErr.message);

  await admin.rpc("bump_ai_usage", { p_month: month, p_cost: out.cost }).then(
    () => {},
    async () => {
      await admin.from("ai_usage").upsert(
        { month, calls: 1, cost_estimate: out.cost, updated_at: new Date().toISOString() },
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
    dailyLimit: DAILY_LIMIT,
    dailyRemaining: remainingAfter,
  });
});
