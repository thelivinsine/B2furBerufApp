import type { User } from "@supabase/supabase-js";

/**
 * The single account allowed to use admin-only tools (currently the provenance
 * QC review overlay on /sources). This is the CLIENT-side gate that decides
 * whether the admin controls render. The real enforcement is server-side in the
 * `provenance_reviews` RLS policy (migration 0004), which checks the same email
 * on the JWT, so a non-founder cannot read or write the data even if they forced
 * the UI to show.
 */
export const FOUNDER_EMAIL = "thelivinsine@gmail.com";

export function isFounder(user: User | null | undefined): boolean {
  return !!user?.email && user.email.toLowerCase() === FOUNDER_EMAIL;
}
