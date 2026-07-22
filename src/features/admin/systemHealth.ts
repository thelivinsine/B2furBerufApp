import { supabase } from "@/lib/supabase";
import { SUPABASE_URL } from "@/lib/supabaseConfig";

/**
 * C2/C3 health probes for the admin System screen. Everything here is
 * best-effort and fail-soft: an unreachable API or a rate limit yields an
 * "unknown"/"down" status, never a thrown error, so the tiles always render.
 * All reads hit either the PUBLIC GitHub Actions API (unauthenticated, ample
 * for an occasional glance) or the app's own Supabase, never a secret.
 */

const REPO = "thelivinsine/b2furberufapp";

export type GateState = "success" | "failure" | "running" | "unknown";

export interface WorkflowRun {
  file: string;
  name: string;
  state: GateState;
  /** Raw GitHub conclusion/status for the tooltip. */
  detail: string;
  url: string | null;
  finishedAt: string | null;
}

interface GhRun {
  name?: string;
  status?: string; // queued | in_progress | completed
  conclusion?: string | null; // success | failure | cancelled | ...
  html_url?: string;
  updated_at?: string;
}

function classify(run: GhRun | undefined): GateState {
  if (!run) return "unknown";
  if (run.status !== "completed") return "running";
  return run.conclusion === "success" ? "success" : "failure";
}

/** Latest run of one workflow file. Never throws. */
async function fetchWorkflowRun(file: string, name: string, signal?: AbortSignal): Promise<WorkflowRun> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/actions/workflows/${file}/runs?per_page=1&branch=main`,
      { headers: { Accept: "application/vnd.github+json" }, signal },
    );
    if (res.ok) {
      const data = (await res.json()) as { workflow_runs?: GhRun[] };
      const run = data.workflow_runs?.[0];
      return {
        file,
        name,
        state: classify(run),
        detail: run ? `${run.status ?? "?"} / ${run.conclusion ?? "?"}` : "no runs",
        url: run?.html_url ?? null,
        finishedAt: run?.updated_at ?? null,
      };
    }
  } catch {
    /* offline / rate-limited */
  }
  return { file, name, state: "unknown", detail: "unreachable", url: null, finishedAt: null };
}

/** The two workflows that gate/deploy the app (validate + pages). */
export async function fetchGateRuns(signal?: AbortSignal): Promise<WorkflowRun[]> {
  return Promise.all([
    fetchWorkflowRun("validate.yml", "Validate (lint + tests)", signal),
    fetchWorkflowRun("pages.yml", "Pages deploy", signal),
  ]);
}

export type PingState = "ok" | "down" | "checking";

export interface ServicePing {
  supabase: PingState;
  edgeFunction: PingState;
}

/** Probe Supabase (world-readable app_config) + the submit-feedback Edge
 *  Function CORS preflight. Never throws. */
export async function pingServices(signal?: AbortSignal): Promise<ServicePing> {
  const [supabaseOk, edgeOk] = await Promise.all([pingSupabase(), pingEdge(signal)]);
  return { supabase: supabaseOk ? "ok" : "down", edgeFunction: edgeOk ? "ok" : "down" };
}

async function pingSupabase(): Promise<boolean> {
  try {
    const { error } = await supabase.from("app_config").select("key").limit(1);
    return !error;
  } catch {
    return false;
  }
}

async function pingEdge(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/submit-feedback`, {
      method: "OPTIONS",
      signal,
    });
    // A deployed function answers the CORS preflight (200/204). A 404 means the
    // function is not deployed; a network error means unreachable.
    return res.status < 400;
  } catch {
    return false;
  }
}

/** Deep-link tiles to the operational dashboards (logs, billing, deploys). */
export const DASHBOARD_LINKS = {
  supabase: "https://supabase.com/dashboard/project/stkfdavpjflpqoxjunnj",
  githubActions: `https://github.com/${REPO}/actions`,
  resend: "https://resend.com/emails",
} as const;
