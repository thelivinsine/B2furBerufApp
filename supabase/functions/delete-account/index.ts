// Supabase Edge Function: delete-account
// ---------------------------------------------------------------------------
// Self-service account deletion (GDPR right to erasure).
//
//   1. Identify the caller from their JWT (never trust a body-supplied id).
//   2. Delete that auth user with the service role. ON DELETE CASCADE removes
//      their profiles / progress / writing_evaluations rows automatically.
//
// SECURITY: the user id is derived solely from the verified token, so a caller
// can only ever delete their own account. ai_usage (global, non-personal) is
// intentionally left untouched.
//
// SUPABASE_URL + SUPABASE_ANON_KEY + SUPABASE_SERVICE_ROLE_KEY are injected
// automatically. No extra secrets required. The ALLOWED_ORIGINS secret (if set
// for evaluate-writing) is shared and applies here too.
// ---------------------------------------------------------------------------

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS locked to an allowlist (same policy as evaluate-writing). Any *.github.io
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

  // Identify the caller from their JWT. The id used for deletion comes ONLY
  // from here, never from the request body.
  const authHeader = req.headers.get("Authorization") ?? "";
  const authed = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData } = await authed.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ ok: false, message: "Nicht angemeldet." }, 401);

  // Service-role client to delete the auth user (cascades to all owned rows).
  const admin = createClient(supabaseUrl, serviceKey);
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return json({ ok: false, message: "Konto konnte nicht gelöscht werden." }, 500);
  }

  return json({ ok: true });
});
