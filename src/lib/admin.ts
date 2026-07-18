import type { User } from "@supabase/supabase-js";

/**
 * The founder/admin accounts allowed to use admin-only tools (the data
 * workbench + provenance QC overlay on /sources). This is the CLIENT-side gate
 * that decides whether the admin controls render. The real enforcement is
 * server-side in the `provenance_reviews` RLS policy (migrations 0004 + 0007),
 * which checks the same emails on the JWT, so a non-founder cannot read or
 * write the data even if they forced the UI to show. Keep this list and the
 * RLS policy in lockstep: adding an email here needs a matching migration.
 */
export const FOUNDER_EMAILS = ["thelivinsine@gmail.com", "thesuhaspala@gmail.com"] as const;

export function isFounder(user: User | null | undefined): boolean {
  const email = user?.email?.toLowerCase();
  return !!email && (FOUNDER_EMAILS as readonly string[]).includes(email);
}
