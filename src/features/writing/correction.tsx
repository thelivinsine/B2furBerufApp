import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { diffWords, type DiffChange, type DiffToken } from "@/lib/wordDiff";
import { cn } from "@/lib/utils";

/**
 * ONE correction language for every surface that shows a correction (s172):
 * Fokus, the Kurz/Lang result and the Verlauf rows. Fokus is the reference, and
 * these are literally its pieces, so the three surfaces cannot drift apart
 * again: before this the markup was copied per surface and the Verlauf tiles had
 * already lost the "→" and printed an em dash for an empty side, so the same
 * edit read differently depending on where the learner met it.
 *
 * Fokus MOBILE keeps its own two-column layout (no chip backgrounds, founder r4
 * amendment): its card has a measured height, so tiles cannot grow there.
 */

/** How many fix tiles a long text shows before the rest fold behind "+N weitere". */
export const MAX_FIX_TILES = 6;

export type CorrectionViewMode = "orig" | "corr";

/** One paragraph's diff (corrected tokens, original tokens, changes). */
export type CorrectionParagraph = ReturnType<typeof diffWords>;

/**
 * Diff a text against its correction, paragraph by paragraph, so a letter keeps
 * its shape (salutation, body, sign-off): `diffWords` tokenizes on whitespace,
 * so one diff over the whole text would rejoin it as a single block. A changed
 * paragraph COUNT would pair the wrong paragraphs, so that case falls back to
 * one whole-text diff.
 */
export function useCorrectionDiff(
  original: string,
  corrected: string,
): { paragraphs: CorrectionParagraph[]; changes: DiffChange[] } {
  return useMemo(() => {
    const split = (s: string) =>
      s.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
    const a = split(original);
    const b = split(corrected);
    const paragraphs =
      a.length > 1 && a.length === b.length
        ? a.map((p, i) => diffWords(p, b[i]))
        : [diffWords(original, corrected)];
    return { paragraphs, changes: paragraphs.flatMap((p) => p.changes) };
  }, [original, corrected]);
}

/**
 * The Original/Korrigiert view toggle: squircle track + white sliding-free
 * segments, the shipped Fokus geometry (`rounded-lg` / `rounded-md`).
 */
export function CorrectionToggle({
  view,
  onChange,
  className,
}: {
  view: CorrectionViewMode;
  onChange: (view: CorrectionViewMode) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-lg bg-muted p-0.5 text-xs font-bold", className)}>
      {(
        [
          { id: "orig" as const, label: "Original" },
          { id: "corr" as const, label: "Korrigiert" },
        ]
      ).map((seg) => (
        <button
          key={seg.id}
          type="button"
          aria-pressed={view === seg.id}
          onClick={() => onChange(seg.id)}
          className={cn(
            "rounded-md px-3 py-1 transition-colors",
            view === seg.id
              ? "bg-surface text-foreground shadow-soft"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {seg.label}
        </button>
      ))}
    </div>
  );
}

/**
 * Tokens with the changed ones marked: coral on the original, green on the
 * corrected. A calm underline (`fx-mark-*`), never a loud fill.
 */
export function MarkedTokens({
  tokens,
  mark,
}: {
  tokens: DiffToken[];
  mark: "coral" | "green";
}) {
  return (
    <>
      {tokens.map((tk, i) => (
        <span key={i}>
          {tk.changed ? (
            <span
              className={cn("font-semibold", mark === "coral" ? "fx-mark-coral" : "fx-mark-green")}
            >
              {tk.text}
            </span>
          ) : (
            tk.text
          )}
          {i < tokens.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
}

/** A multi-paragraph text in one of the two views. */
export function MarkedParagraphs({
  paragraphs,
  view,
}: {
  paragraphs: CorrectionParagraph[];
  view: CorrectionViewMode;
}) {
  return (
    <div className="space-y-2">
      {paragraphs.map((para, pi) => (
        <p key={pi} className="text-sm leading-relaxed text-foreground/90">
          <MarkedTokens
            tokens={view === "orig" ? para.originalTokens : para.tokens}
            mark={view === "orig" ? "coral" : "green"}
          />
        </p>
      ))}
    </div>
  );
}

/**
 * The Himmelblau fix tiles: one per edit, each carrying the learning category as
 * an eyebrow plus the `old → new` pair. `action` rides the same row (Fokus puts
 * its "Neuer Satz" button there, `ml-auto self-end`), and `max` collapses the
 * tail of a long text into "+N weitere" so it cannot wall off the card.
 *
 * That fold is a TOGGLE, not a dead end (founder 2026-07-31: "there's no way to
 * expand upon it and see all the chips"). Every correction the learner made is
 * reachable; the cap only decides what the card opens with.
 */
export function FixTiles({
  changes,
  max,
  action,
}: {
  changes: DiffChange[];
  max?: number;
  action?: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const capped = !!max && changes.length > max;
  const shown = capped && !expanded ? changes.slice(0, max) : changes;
  const hidden = changes.length - shown.length;
  if (shown.length === 0) return null;
  return (
    <div className="flex flex-wrap items-stretch gap-2.5">
      {shown.map((c, i) => (
        <div
          key={i}
          className="min-w-[8rem] rounded-xl border border-accent/70 bg-accent/30 p-2.5 dark:border-accent/[0.45] dark:bg-accent/[0.18]"
        >
          <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-accent-ink">
            {c.category}
          </span>
          {c.moved ? (
            // A word that only moved: show it once (no struck "before"), the
            // eyebrow already says it was a word-order fix.
            <span className="text-sm font-bold text-success">{c.to}</span>
          ) : (
            <span className="text-sm">
              <span className="text-muted-foreground line-through">{c.from || "∅"}</span>{" "}
              <span className="text-muted-foreground/80">→</span>{" "}
              <span className="font-bold text-success">{c.to || "(entfernt)"}</span>
            </span>
          )}
        </div>
      ))}
      {capped && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-1 self-center rounded-lg px-1.5 py-1 text-xs font-medium tabular-nums text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")} />
          {expanded ? "Weniger" : `+${hidden} weitere`}
        </button>
      )}
      {action}
    </div>
  );
}
