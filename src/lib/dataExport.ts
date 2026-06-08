import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * Self-service data export (GDPR right to access / portability). Gathers the
 * user's data from local storage and, if signed in, their cloud rows (RLS lets
 * a user read only their own rows), then offers it as a JSON download. Fully
 * client-side, no server function needed. Cloud reads are best-effort so an
 * offline export still yields the local data.
 */

/** Drop zustand action functions so only serialisable state is exported. */
function plainState<T extends object>(state: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(state).filter(([, v]) => typeof v !== "function"),
  );
}

export async function buildExport(): Promise<Record<string, unknown>> {
  const { user, status } = useAuthStore.getState();

  const local = {
    progress: plainState(useProgressStore.getState()),
    settings: plainState(useSettingsStore.getState()),
  };

  let cloud: Record<string, unknown> | null = null;
  if (user && (status === "signedIn" || status === "anonymous")) {
    try {
      const [profile, progress, writing] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("progress").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("writing_evaluations")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
      cloud = {
        profile: profile.data ?? null,
        progress: progress.data ?? null,
        // Includes the full essay text so the export is genuinely portable.
        writingEvaluations: writing.data ?? [],
      };
    } catch {
      // Offline or transient failure: fall back to a local-only export.
      cloud = null;
    }
  }

  return {
    app: "Genauly",
    exportedAt: new Date().toISOString(),
    schemaVersion: 1,
    account: user ? { id: user.id, email: user.email ?? null } : null,
    local,
    cloud,
  };
}

/** Trigger a browser download of `data` as a pretty-printed JSON file. */
export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Build and download the user's full data export with a dated filename. */
export async function exportUserData() {
  const data = await buildExport();
  const date = new Date().toISOString().slice(0, 10);
  downloadJson(data, `genauly-export-${date}.json`);
}
