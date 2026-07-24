import { useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { isFounder } from "@/lib/admin";
import {
  computeDecisionHash,
  fetchProvenanceReviews,
  saveProvenanceReview,
  type ProvenanceReview,
} from "@/lib/provenanceReviews";
import type { WorkbenchApi } from "./AdminWorkbench";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface WorkbenchState {
  admin: boolean;
  /** The review API for the table + cockpit, or undefined for a non-admin. */
  api: WorkbenchApi | undefined;
  reviews: Map<string, ProvenanceReview>;
  reviewsLoaded: boolean;
  saveState: SaveState;
  /** Count of live founder marks flagged verified (== an approve decision). */
  liveVerified: number;
}

/**
 * The single review store behind BOTH founder review surfaces: the full-register
 * table (`AdminWorkbench`) and the keyboard cockpit on the Control Center's
 * Prüfen page. It fetches the founder's saved marks once, holds them in one map,
 * and hands out an `onChange` that every control writes through, so a decision
 * made in the cockpit shows in the table and vice versa.
 *
 * `onChange` is decision-centric and SERIALISED per content_id: back-to-back
 * edits to the same row (typing a note, then approving) run strictly one after
 * another and each merges on top of the previous write's result, so no whole-row
 * upsert can clobber a field it never saw. (Previously two edits read the same
 * stale snapshot and the second overwrote the first — see docs/DECISIONS.md.)
 */
export function useWorkbench(): WorkbenchState {
  const user = useAuthStore((s) => s.user);
  const admin = isFounder(user);

  const [reviews, setReviews] = useState<Map<string, ProvenanceReview>>(new Map());
  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // Always-latest view of the map, read as the merge base instead of the memo
  // closure (which captured a stale snapshot).
  const reviewsRef = useRef(reviews);
  reviewsRef.current = reviews;
  // Per-id write chain: one row's edits run strictly in order.
  const writeChains = useRef(new Map<string, Promise<unknown>>());

  useEffect(() => {
    if (!admin) {
      setReviews(new Map());
      setReviewsLoaded(false);
      return;
    }
    let cancelled = false;
    fetchProvenanceReviews().then((m) => {
      if (!cancelled) {
        setReviews(m);
        setReviewsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [admin]);

  const api: WorkbenchApi | undefined = useMemo(() => {
    if (!admin) return undefined;
    return {
      reviews,
      onChange: (contentId, patch) => {
        const uid = user?.id;
        if (!uid) return Promise.resolve(false);
        const run = async () => {
          const cur = reviewsRef.current.get(contentId) ?? {
            content_id: contentId,
            verified: false,
            comment: null,
            decision: null,
            content_hash: null,
            reviewer_email: null,
          };
          // A decision is provided explicitly (`decision`) or via the legacy
          // checkbox mapping (`verified` true -> approve, false -> clear). When
          // NEITHER is present this is a note-only edit, which leaves the
          // decision and its fingerprint untouched.
          const decisionProvided =
            patch.decision !== undefined || patch.verified !== undefined;
          const nextDecision =
            patch.decision !== undefined
              ? patch.decision
              : patch.verified === true
                ? "approve"
                : patch.verified === false
                  ? null
                  : cur.decision;
          const merged: ProvenanceReview = {
            content_id: contentId,
            verified: nextDecision === "approve",
            // normalise an empty note to null so the column stays clean
            comment:
              patch.comment !== undefined ? (patch.comment ?? "").trim() || null : cur.comment,
            decision: nextDecision,
            // Approving fingerprints the content AS THE REVIEWER SEES IT (the
            // apply script compares this before flipping the repo row). Reject /
            // needs_fix / clear carry no hash; a note-only edit keeps the current
            // one so a saved approval is not silently invalidated.
            content_hash: !decisionProvided
              ? cur.content_hash
              : nextDecision === "approve"
                ? await computeDecisionHash(contentId)
                : null,
            reviewer_email: user?.email?.toLowerCase() ?? cur.reviewer_email,
          };
          setSaveState("saving");
          const ok = await saveProvenanceReview(merged, uid);
          if (ok) {
            const next = new Map(reviewsRef.current).set(contentId, merged);
            reviewsRef.current = next; // push the ref ahead of the async render
            setReviews(next);
          }
          setSaveState(ok ? "saved" : "error");
          return ok;
        };
        const prev = writeChains.current.get(contentId) ?? Promise.resolve();
        const result = prev.then(run, run);
        writeChains.current.set(
          contentId,
          result.catch(() => {}),
        );
        return result;
      },
    };
  }, [admin, reviews, user?.id, user?.email]);

  const liveVerified = useMemo(
    () => [...reviews.values()].filter((r) => r.verified).length,
    [reviews],
  );

  return { admin, api, reviews, reviewsLoaded, saveState, liveVerified };
}
