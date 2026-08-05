import { useEffect, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * The learner-facing view of the daily AI allowances (founder 2026-07-25, the
 * numbers are law in `docs/areas/SCHREIBEN.md` §Daily allowances):
 *
 *   Fokus 10 Korrekturen · Kurz 4 Auswertungen · Lang 2 Auswertungen, per day.
 *
 * Until now those limits were invisible until a learner hit one and got a "come
 * back tomorrow" message. This module is what lets each trainer print "Heute
 * noch 7 von 10" beside its AI button (founder 2026-07-31).
 *
 * TWO sources, in this order of authority:
 *  1. What the Edge Function last said. Every response carries
 *     `dailyLimit`/`dailyRemaining`, reported here by the API clients through
 *     `reportServerAllowance`. This is the number the server actually enforces,
 *     including a limit the founder raised via a Supabase secret.
 *  2. A count of the learner's own rows, run on mount, against the SAME tables
 *     and the SAME UTC day boundary the functions count:
 *       - Fokus -> `sentence_checks` (one row per Korrektur, cached ones
 *         included, which is exactly what `DAILY_CHECK_LIMIT` counts; an
 *         Umformung writes no row and never consumes a unit).
 *       - Kurz / Lang -> `writing_evaluations` filtered by `length`, counted
 *         separately per mode so a day of Kurz cannot eat the Lang allowance. A
 *         cached resubmission returns before the row is written, so it is free
 *         here too.
 *     Both tables have a select-own RLS policy, so this is the learner's own
 *     count and nobody else's.
 *
 * When neither is available (signed out, offline, query failed) the trainer
 * shows NO number rather than one it cannot stand behind.
 */

export type AiMode = "fokus" | "kurz" | "lang" | "sprechen";

/** Defaults, mirroring the Edge Function defaults. A server value always wins. */
export const DAILY_ALLOWANCE: Record<AiMode, number> = {
  fokus: 10,
  kurz: 4,
  lang: 2,
  // Founder s191: a spoken conversation costs about what a Lang evaluation
  // costs, so it sits beside Lang rather than getting its own generous budget.
  sprechen: 2,
};

/* ------------------------- what the server last said ---------------------- */

const serverSnapshots = new Map<AiMode, { limit: number; remaining: number }>();
const listeners = new Set<() => void>();
let version = 0;

function emit() {
  version++;
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getVersion(): number {
  return version;
}

/**
 * Record the allowance an Edge Function reported. Called by the API clients on
 * every response (success AND limit-reached), so the counter lands exactly when
 * a unit is spent, with no extra round trip.
 */
export function reportServerAllowance(
  mode: AiMode,
  limit?: number,
  remaining?: number,
): void {
  if (typeof limit !== "number" && typeof remaining !== "number") return;
  const prev = serverSnapshots.get(mode);
  const nextLimit =
    typeof limit === "number" && limit > 0 ? limit : (prev?.limit ?? DAILY_ALLOWANCE[mode]);
  const nextRemaining =
    typeof remaining === "number" ? Math.max(0, Math.min(remaining, nextLimit)) : (prev?.remaining ?? 0);
  serverSnapshots.set(mode, { limit: nextLimit, remaining: nextRemaining });
  emit();
}

/** The last server-reported allowance for a mode, or undefined if none yet. */
export function readAllowance(
  mode: AiMode,
): { limit: number; remaining: number } | undefined {
  return serverSnapshots.get(mode);
}

/* ------------------------------ the row count ----------------------------- */

/** UTC midnight, the boundary every Edge Function counts from. */
function startOfUtcDay(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString();
}

/** Units the learner has spent today, or null when the count is not knowable. */
export async function fetchUsedToday(mode: AiMode): Promise<number | null> {
  try {
    const since = startOfUtcDay();
    const query =
      mode === "fokus"
        ? supabase
            .from("sentence_checks")
            .select("id", { count: "exact", head: true })
            .gte("created_at", since)
        : mode === "sprechen"
          ? // One row per conversation, written when it STARTS (migration 0017),
            // which is the same thing the `converse` function counts.
            supabase
              .from("speaking_conversations")
              .select("id", { count: "exact", head: true })
              .gte("created_at", since)
          : supabase
              .from("writing_evaluations")
              .select("id", { count: "exact", head: true })
              .eq("length", mode === "lang" ? "long" : "short")
              .gte("created_at", since);
    const { count, error } = await query;
    if (error) return null;
    return count ?? 0;
  } catch {
    return null;
  }
}

export interface DailyAllowance {
  limit: number;
  remaining: number;
  /** False while the number is unknown: render nothing rather than a guess. */
  known: boolean;
}

/**
 * Live allowance for one trainer mode. Counts once on mount (and whenever the
 * signed-in user changes), then follows whatever the Edge Functions report.
 */
export function useDailyAllowance(mode: AiMode): DailyAllowance {
  const userId = useAuthStore((s) => s.session?.user?.id ?? null);
  const [counted, setCounted] = useState<number | null>(null);
  // Re-render whenever a function response updates the snapshot.
  useSyncExternalStore(subscribe, getVersion, getVersion);

  useEffect(() => {
    let live = true;
    // A fresh mount re-counts from scratch: a snapshot kept from an earlier
    // session (or from before UTC midnight) must not outlive its day.
    serverSnapshots.delete(mode);
    setCounted(null);
    void fetchUsedToday(mode).then((n) => {
      if (live) setCounted(n);
    });
    return () => {
      live = false;
    };
  }, [mode, userId]);

  const server = serverSnapshots.get(mode);
  const limit = server?.limit ?? DAILY_ALLOWANCE[mode];
  return {
    limit,
    remaining: server
      ? server.remaining
      : counted === null
        ? limit
        : Math.max(0, limit - counted),
    known: !!server || counted !== null,
  };
}
