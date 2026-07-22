import { supabase } from "@/lib/supabase";

/**
 * Client access to the founder-only `provenance_reviews` table (migrations
 * 0004/0007, widened to review decisions in 0008). Every call is best-effort
 * and gated server-side by RLS: a non-founder session simply gets no rows back
 * and cannot write. Used by the admin workbench on the /sources page.
 *
 * Since chunk 2 of the admin center a review is a DECISION, not a checkbox:
 * approving stores the decision plus a fingerprint of the content AS THE
 * REVIEWER SAW IT (`content_hash`, computed from the live banks at click
 * time). `pnpm apply:reviews` recomputes the hash from the repo before
 * flipping the provenance row to "verified"; a mismatch means the content
 * changed after the human looked and forces a re-review. A null hash is
 * treated the same way, never as a pass.
 */

export type ReviewDecision = "approve" | "reject" | "needs_fix";

export interface ProvenanceReview {
  content_id: string;
  verified: boolean;
  comment: string | null;
  decision: ReviewDecision | null;
  content_hash: string | null;
  reviewer_email: string | null;
}

/** Load every saved review mark, keyed by content_id. Empty on error/offline or
 *  for a non-founder session (RLS returns no rows). */
export async function fetchProvenanceReviews(): Promise<Map<string, ProvenanceReview>> {
  const map = new Map<string, ProvenanceReview>();
  try {
    const { data, error } = await supabase
      .from("provenance_reviews")
      .select("content_id, verified, comment, decision, content_hash, reviewer_email");
    if (error || !data) return map;
    for (const r of data as ProvenanceReview[]) map.set(r.content_id, r);
  } catch {
    /* best-effort: keep the map empty */
  }
  return map;
}

/** Upsert one item's review decision + note. Returns whether the write landed. */
export async function saveProvenanceReview(
  review: ProvenanceReview,
  reviewedBy: string,
): Promise<boolean> {
  try {
    const { error } = await supabase.from("provenance_reviews").upsert({
      content_id: review.content_id,
      verified: review.verified,
      comment: review.comment,
      decision: review.decision,
      content_hash: review.content_hash,
      reviewer_email: review.reviewer_email,
      reviewed_by: reviewedBy,
      updated_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}

/**
 * Fingerprint the LIVE content item behind a content_id, exactly as the apply
 * script will recompute it. Loads the bank index lazily (its chunk holds every
 * content bank) so /sources stays light until the founder actually decides.
 * Null when the item cannot be found or hashed; the apply script treats a
 * null decision hash as "needs re-review".
 */
export async function computeDecisionHash(contentId: string): Promise<string | null> {
  try {
    const [{ contentItemById }, { contentHash }] = await Promise.all([
      import("@/lib/contentIndex"),
      import("@/lib/contentHash"),
    ]);
    const item = contentItemById(contentId);
    if (!item) return null;
    return await contentHash(item);
  } catch {
    return null;
  }
}
