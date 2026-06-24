import { supabase } from "@/lib/supabase";

/**
 * Client access to the founder-only `provenance_reviews` table (migration 0004).
 * Every call is best-effort and gated server-side by RLS: a non-founder session
 * simply gets no rows back and cannot write. Used by the admin overlay on the
 * /sources page to mark content items as human-verified and attach an internal
 * QC note.
 */

export interface ProvenanceReview {
  content_id: string;
  verified: boolean;
  comment: string | null;
}

/** Load every saved review mark, keyed by content_id. Empty on error/offline or
 *  for a non-founder session (RLS returns no rows). */
export async function fetchProvenanceReviews(): Promise<Map<string, ProvenanceReview>> {
  const map = new Map<string, ProvenanceReview>();
  try {
    const { data, error } = await supabase
      .from("provenance_reviews")
      .select("content_id, verified, comment");
    if (error || !data) return map;
    for (const r of data as ProvenanceReview[]) map.set(r.content_id, r);
  } catch {
    /* best-effort: keep the map empty */
  }
  return map;
}

/** Upsert one item's verified flag + note. Returns whether the write landed. */
export async function saveProvenanceReview(
  review: ProvenanceReview,
  reviewedBy: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("provenance_reviews").upsert({
      content_id: review.content_id,
      verified: review.verified,
      comment: review.comment,
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
