// Supabase Edge Function: reconcile-ai-cost
// ---------------------------------------------------------------------------
// Step 2 of the AI-cost work (founder s205: "how do we make sure we see real
// usage and costs and not just estimates?").
//
// 0019 made USAGE measured: every call stores the token counts the provider
// reported. The COST is still derived, from a rate table we maintain, so it can
// drift from the bill three ways: a provider reprices, a model gets the fallback
// rate, or an assumption (Gemini's free tier) stops being true. This function
// fetches what ANTHROPIC says we spent, per day, and stores it beside our own
// figure so the difference is visible (`admin_ai_reconciliation`).
//
// FOUNDER-ONLY. There is no cron: scheduling it from the database would mean
// keeping a second copy of a credential inside the database to authenticate the
// call, which is a worse trade than a founder-triggered refresh. The admin
// screen calls this when it opens (at most once an hour) and on demand.
//
// Secrets:
//   ANTHROPIC_ADMIN_KEY  (required; `sk-ant-admin01-…` from Console → Settings →
//                         Admin keys. NOT the ordinary API key, and it carries
//                         FULL admin rights, so it lives only here.)
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY are injected.
//
// The founder's key is deliberately short-lived (30 days). An expired key must
// therefore fail LOUDLY: the error is stored in `provider_sync_state.last_error`
// and rendered on the admin screen, so the comparison can never quietly go
// stale while still showing numbers.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { foldCostReport, nextPage, reportWindow } from "../_shared/costReport.ts";

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
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (isAllowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

/** How many whole UTC days to (re)fetch. Days get restated, so overlap on purpose. */
const DEFAULT_DAYS = 14;
const MAX_PAGES = 10;

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

  // Founder gate: the caller's own JWT, checked against `admins` the same way
  // every admin RPC checks it. An ordinary learner cannot reach this.
  const authHeader = req.headers.get("Authorization") ?? "";
  const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await authed.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, message: "Nicht angemeldet." }, 401);

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: adminRow } = await admin
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!adminRow) return json({ ok: false, message: "Kein Zugriff." }, 403);

  let body: { days?: number } = {};
  try {
    body = await req.json();
  } catch {
    /* no body is fine */
  }
  const days = Number.isFinite(body.days) ? Number(body.days) : DEFAULT_DAYS;

  /** Record the attempt whatever happens, so "never ran" and "failed" differ. */
  const setState = async (patch: Record<string, unknown>) => {
    const { error } = await admin.from("provider_sync_state").upsert(
      { provider: "anthropic", last_try_at: new Date().toISOString(), ...patch },
      { onConflict: "provider" },
    );
    if (error) console.error(`[reconcile] sync-state write failed: ${error.message}`);
  };

  const adminKey = Deno.env.get("ANTHROPIC_ADMIN_KEY");
  if (!adminKey) {
    const message =
      "Kein ANTHROPIC_ADMIN_KEY hinterlegt. Ohne ihn kann nur unsere eigene Schätzung angezeigt werden.";
    await setState({ last_error: message });
    return json({ ok: false, configured: false, message });
  }

  const { startingAt, endingAt } = reportWindow(days);
  const collected = new Map<string, number>();
  let page: string | null = null;
  let pages = 0;

  try {
    do {
      const url = new URL("https://api.anthropic.com/v1/organizations/cost_report");
      url.searchParams.set("starting_at", startingAt);
      url.searchParams.set("ending_at", endingAt);
      url.searchParams.set("bucket_width", "1d");
      url.searchParams.set("limit", "31");
      if (page) url.searchParams.set("page", page);

      const res = await fetch(url, {
        headers: { "anthropic-version": "2023-06-01", "x-api-key": adminKey },
      });

      if (!res.ok) {
        const detail = (await res.text().catch(() => "")).slice(0, 300);
        // 401 is what an EXPIRED or revoked admin key looks like, and the
        // founder's key is deliberately short-lived, so it gets its own words.
        const message =
          res.status === 401
            ? "Der Anthropic-Admin-Schlüssel ist abgelaufen oder ungültig. Neu erstellen und als ANTHROPIC_ADMIN_KEY hinterlegen."
            : res.status === 403
              ? "Der Schlüssel darf den Kostenbericht nicht lesen (Admin-Rolle nötig)."
              : `Anthropic antwortete mit ${res.status}. ${detail}`;
        console.error(`[reconcile] cost_report http=${res.status} ${detail}`);
        await setState({ last_error: message });
        return json({ ok: false, message, status: res.status });
      }

      const payload = await res.json();
      for (const row of foldCostReport(payload)) {
        collected.set(row.day, (collected.get(row.day) ?? 0) + row.costUsd);
      }
      page = nextPage(payload);
      pages += 1;
    } while (page && pages < MAX_PAGES);
  } catch (e) {
    const message = `Der Kostenbericht war nicht erreichbar: ${e}`;
    console.error(`[reconcile] ${message}`);
    await setState({ last_error: message });
    return json({ ok: false, message });
  }

  const rows = [...collected.entries()].map(([day, costUsd]) => ({
    day,
    provider: "anthropic",
    cost_usd: costUsd,
    fetched_at: new Date().toISOString(),
  }));

  if (rows.length) {
    // A day can be restated after the fact, so this overwrites rather than
    // accumulating: the provider's latest word is the only word.
    const { error } = await admin
      .from("provider_costs")
      .upsert(rows, { onConflict: "day,provider" });
    if (error) {
      const message = `Die Zahlen kamen an, ließen sich aber nicht speichern: ${error.message}`;
      console.error(`[reconcile] upsert failed: ${error.message}`);
      await setState({ last_error: message });
      return json({ ok: false, message });
    }
  }

  await setState({
    last_ok_at: new Date().toISOString(),
    last_error: null,
    days_fetched: rows.length,
  });

  return json({
    ok: true,
    days: rows.length,
    from: startingAt.slice(0, 10),
    to: endingAt.slice(0, 10),
    totalUsd: rows.reduce((s, r) => s + r.cost_usd, 0),
  });
});
