// Supabase Edge Function: submit-feedback
// ---------------------------------------------------------------------------
// Receives in-app feedback from the subtle "Mit KI gebaut · Feedback" button
// (rendered on every page) and:
//   1. Stores one row in public.feedback (so nothing is ever lost).
//   2. Emails the founder via Resend (best-effort; a failed/unconfigured email
//      never fails the request — the row is already saved).
//
// Feedback is allowed from anyone, signed in or not, so auth is optional: if a
// valid JWT is present we attach the user id, otherwise the row is anonymous.
//
// Secrets (set via `supabase secrets set …`, never shipped to the browser):
//   RESEND_API_KEY     (required for the email to actually send; without it the
//                       feedback is still stored, just not emailed)
//   FEEDBACK_TO_EMAIL  (optional, default thelivinsine@gmail.com — the founder)
//   FEEDBACK_FROM_EMAIL(optional, default onboarding@resend.dev — Resend's
//                       shared sender, which can deliver to the account owner's
//                       verified email with no domain setup)
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY are injected
// automatically. The ALLOWED_ORIGINS secret (shared with the other functions)
// applies here too.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS locked to an allowlist (same policy as the other functions). Any
// *.github.io host is always allowed as the GitHub Pages fallback.
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

const MAX_MESSAGE_LEN = 4000;
const MAX_EMAIL_LEN = 200;
const MAX_PAGE_LEN = 300;

// ── Abuse hardening (s112, demo shared-link prep) ──────────────────────────
// The demo audience gets the public URL, so the write path needs a speed limit
// so no one can flood the founder's inbox via Resend. Two independent guards,
// both migration-free (no schema change → the founder only redeploys the
// function):
//   1. Per-IP burst limit — in-memory, catches a single source hammering the
//      form. Best-effort: module state is per warm isolate and resets on cold
//      start, so guard 2 is the hard ceiling.
//   2. Global hourly email ceiling — a DB count over the existing feedback
//      table. Once reached we STOP sending email (across every source) but
//      still STORE the row, so nothing is lost and the inbox can never be
//      flooded regardless of where the traffic originates.
const IP_WINDOW_MS = 10 * 60_000; // 10 minutes
const IP_MAX_PER_WINDOW = 5; // ≤5 submissions per IP per window
const GLOBAL_HOURLY_EMAIL_CAP = 60; // stop emailing past this many rows/hour
const RATE_LIMIT_MSG = "Zu viele Anfragen. Bitte versuche es in ein paar Minuten erneut.";

/** Recent accepted submission timestamps per hashed IP (in-memory, transient). */
const RECENT = new Map<string, number[]>();

function sweep(now: number): void {
  for (const [k, v] of RECENT) {
    if (v.every((t) => now - t >= IP_WINDOW_MS)) RECENT.delete(k);
  }
}

/** Check-and-record: true if this IP is over the burst limit (reject), else records the hit. */
function ipBurstHit(hash: string): boolean {
  const now = Date.now();
  const arr = (RECENT.get(hash) ?? []).filter((t) => now - t < IP_WINDOW_MS);
  if (arr.length >= IP_MAX_PER_WINDOW) {
    RECENT.set(hash, arr);
    return true;
  }
  arr.push(now);
  RECENT.set(hash, arr);
  if (RECENT.size > 5000) sweep(now);
  return false;
}

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const first = xff.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

/** Hash the client IP so raw addresses are never held even in transient memory. */
async function hashIp(ip: string): Promise<string> {
  const salt = Deno.env.get("FEEDBACK_IP_SALT") ?? "genauly-feedback";
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${salt}|${ip}`),
  );
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Best-effort founder notification via Resend. Returns true if it sent. */
async function sendEmail(opts: {
  message: string;
  email: string | null;
  page: string | null;
  userId: string | null;
}): Promise<boolean> {
  const key = Deno.env.get("RESEND_API_KEY");
  if (!key) return false;
  const to = Deno.env.get("FEEDBACK_TO_EMAIL") ?? "thelivinsine@gmail.com";
  const from = Deno.env.get("FEEDBACK_FROM_EMAIL") ?? "Genauly Feedback <onboarding@resend.dev>";

  const rows = [
    ["Nachricht", opts.message],
    ["Antwort an", opts.email ?? "—"],
    ["Seite", opts.page ?? "—"],
    ["Nutzer", opts.userId ?? "anonym"],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px;color:#64748b;vertical-align:top;white-space:nowrap">${label}</td>` +
        `<td style="padding:6px 12px;color:#0f172a;white-space:pre-wrap">${escapeHtml(String(value))}</td></tr>`,
    )
    .join("");
  const html =
    `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:14px">` +
    `<h2 style="font-size:16px;margin:0 0 12px">Neues Feedback aus Genauly</h2>` +
    `<table style="border-collapse:collapse;border:1px solid #e2e8f0;border-radius:8px">${rows}</table>` +
    `</div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: opts.email ?? undefined,
        subject: "Neues Feedback aus Genauly",
        html,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

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

  let body: { message?: string; email?: string; page?: string };
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, message: "Ungültige Anfrage." }, 400);
  }

  const message = (body.message ?? "").trim().slice(0, MAX_MESSAGE_LEN);
  if (message.length < 2) return json({ ok: false, message: "Bitte gib eine Nachricht ein." }, 400);
  const email = (body.email ?? "").trim().slice(0, MAX_EMAIL_LEN) || null;
  const page = (body.page ?? "").trim().slice(0, MAX_PAGE_LEN) || null;
  const userAgent = (req.headers.get("User-Agent") ?? "").slice(0, 500) || null;

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  // Abuse guard 1: per-IP burst limit (in-memory, best-effort). A single source
  // that exceeds the window is turned away with the friendly error and nothing
  // is stored or emailed.
  const ipHash = await hashIp(clientIp(req));
  if (ipBurstHit(ipHash)) return json({ ok: false, message: RATE_LIMIT_MSG }, 429);

  // Auth is OPTIONAL: attach the user id if a valid token is present, else the
  // row is anonymous. A missing/invalid token is not an error here.
  let userId: string | null = null;
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader) {
    try {
      const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data } = await authed.auth.getUser();
      userId = data?.user?.id ?? null;
    } catch {
      userId = null;
    }
  }

  // Abuse guard 2: global hourly email ceiling (DB count over the existing
  // table, no schema change). Past the cap we stop emailing but still store the
  // row, so the inbox is hard-capped while no feedback is ever lost. On a count
  // error we allow the email (guard 1 still applies) rather than drop a legit one.
  let emailAllowed: boolean;
  try {
    const since = new Date(Date.now() - 3_600_000).toISOString();
    const { count } = await admin
      .from("feedback")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since);
    emailAllowed = (count ?? 0) < GLOBAL_HOURLY_EMAIL_CAP;
  } catch {
    emailAllowed = true;
  }

  // Send the notification (best-effort) so we can record whether it went out.
  const emailed = emailAllowed ? await sendEmail({ message, email, page, userId }) : false;

  // Persist the row (service role → bypasses RLS). This is the durable record;
  // the email is best-effort on top of it.
  const { error } = await admin.from("feedback").insert({
    user_id: userId,
    email,
    message,
    page,
    user_agent: userAgent,
    emailed,
  });
  if (error) {
    // If storage failed but the email went out, the founder still has it.
    return json({ ok: emailed, message: emailed ? "Danke!" : "Konnte nicht gespeichert werden." }, emailed ? 200 : 500);
  }

  return json({ ok: true });
});
