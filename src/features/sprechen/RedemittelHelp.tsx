import { useMemo, useState } from "react";
import { MessagesSquare } from "lucide-react";
import type { ConversationBrief, RedemittelCategory, RedemittelPhrase } from "@/types";
import { redemittelByCategory, redemittelCategories } from "@/data/redemittel";
import { matchesAnrede } from "@/lib/anrede";
import { CEFR_ORDER } from "@/lib/cefr";
import { EnPeek } from "@/features/grammar/EnPeek";
import { ScopeRail, scopeSectionLabel } from "@/features/shared/ScopeRail";
import { useEdgeFade } from "@/features/shared/browseScroll";
import { cn } from "@/lib/utils";

/**
 * The Redemittel rail a learner speaks with (founder s202: "add a filter rail
 * kind of rail with useful redemittel even in the practice sessions").
 *
 * The gap it closes: a spoken task has always NAMED its four Redemittel
 * categories on the brief card and ticked them in the debrief, while the eight
 * phrases behind each name lived only in the Bibliothek. So the learner had the
 * label ("Vorschläge machen") and never the language, at the one moment they
 * needed a sentence to start with.
 *
 * Founder pick (s202): **Option A's layout on desktop, Option C's on a phone,
 * with Option A's content in both.** So this component is the CONTENT, and the
 * two shells are the two layouts:
 *
 *   rail    the ScopeRail tile beside the conversation (lg+), the same
 *           Himmelblau tile as "Aufgabe wählen"
 *   drawer  the body of the two-tab brief drawer on a phone, where the
 *           conversation has no column to spare (`ConversationRunner`)
 *
 * Deliberately NOT here: a way to send a phrase into the conversation. Reading
 * a phrase is not saying it, and whether a Redemittel was used stays the
 * model's judgement of what the learner actually said.
 *
 * Practice only. The runner takes this as a prop rather than importing it, so
 * the Modelltest neither renders it (handing a candidate the phrases would
 * grade their reading) nor carries the phrase bank in its chunk.
 */

const LABEL_DE = new Map(redemittelCategories.map((c) => [c.id, c.labelDe]));

/**
 * How many phrases one intent offers while the learner is speaking (founder
 * s205: "display only 4-5 highly useful and frequently used redemittel phrases,
 * not too many of them").
 *
 * The rail is read mid-conversation, with a partner waiting, so it is a prompt,
 * not a reference: the Bibliothek is where the full set is browsed. Some
 * categories carry 24 phrases, which at speaking speed is a wall to scroll
 * rather than a sentence to borrow.
 */
const MAX_HELP_PHRASES = 5;

/**
 * The phrases offered for one speech intent, in the partner's Anrede.
 *
 * The Anrede filter is the one thing here that genuinely filters, which is why
 * it never empties the list: a category whose phrases all commit to the other
 * register falls back to the full set. An empty rail would be a filter that
 * deleted the feature rather than narrowed it.
 *
 * WHICH five (s205): the EASIEST that fit, by CEFR, keeping the bank's authored
 * order inside a band. A B1.1 phrase is the one a B1-B2 learner already half
 * owns and can say under pressure, and the plateau this app exists for is not
 * crossed by reaching for the rarest formulation. `CEFR_ORDER` is the app's one
 * CEFR source, so the ranking cannot drift from the rest of the product, and an
 * untagged phrase sorts last rather than jumping the queue on a missing field.
 *
 * The SELECTION is by level; the ORDER shown stays the bank's, so the list a
 * learner glances at twice in one conversation never rearranges itself.
 */
export function helpPhrases(
  category: RedemittelCategory,
  register: "du" | "sie",
): RedemittelPhrase[] {
  const all = redemittelByCategory(category);
  const fitting = all.filter((p) => matchesAnrede(p.de, register));
  const pool = fitting.length > 0 ? fitting : all;
  if (pool.length <= MAX_HELP_PHRASES) return pool;
  const rank = (p: RedemittelPhrase) => {
    const i = p.cefr ? CEFR_ORDER.indexOf(p.cefr) : -1;
    return i === -1 ? CEFR_ORDER.length : i;
  };
  const keep = new Set(
    pool
      .map((p, i) => ({ p, i }))
      .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
      .slice(0, MAX_HELP_PHRASES)
      .map((e) => e.p.id),
  );
  return pool.filter((p) => keep.has(p.id));
}

export function RedemittelHelp({
  brief,
  layout,
  onClose,
  className,
}: {
  brief: ConversationBrief;
  layout: "rail" | "drawer";
  /** The rail's close control, on the phone panel only. */
  onClose?: () => void;
  className?: string;
}) {
  const categories = brief.targetRedemittel;
  const [active, setActive] = useState<RedemittelCategory | null>(categories[0] ?? null);
  const register = brief.partner.register;
  const [peek, setPeek] = useState(false);

  /** The scrolling list, measured so the edge fades can tell the truth. */
  const [list, setList] = useState<HTMLDivElement | null>(null);
  const edge = useEdgeFade(list);

  const current = active ?? categories[0];
  const phrases = useMemo(
    () => (current ? helpPhrases(current, register) : []),
    [current, register],
  );

  // A scenario with no target Redemittel has nothing to show, and an empty rail
  // is worse than no rail. Every authored scenario carries four.
  if (!current) return null;

  const body = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {/*
        The intent picker, at the TOP of the tile, with the CURRENT intent shown
        lit among the others (founder s202 follow-up). It replaces the dropdown
        that used to sit here: a lit pill states the selection, so keeping a
        dropdown above it would print the same fact twice, and four options is
        pill territory anyway (dropdowns are for the long scope lists).
      */}
      <section className="flex-none">
        <div className="mb-2 flex items-center gap-2">
          <p className={cn("flex-1", scopeSectionLabel)}>Sprechabsicht</p>
          {/* ONE peek chip for the whole list, not one per row: the English is
              the same fact repeated eight times, and the rows stay readable. */}
          <EnPeek active={peek} onChange={setPeek} />
        </div>
        {/* The FilterRail facet-pill recipe, same as LifeAreaPills: white so it
            pops off the Himmelblau tile, brand fill when active, content-sized
            and wrapping. NOT a toggle-off: a conversation always has one intent
            in view, so there is no "none" state to return to.

            NO COUNT since s205. It was there to be an honest number, and an
            honest number is only worth printing when it varies: with every
            intent capped at five phrases it printed the same digit four times,
            which is the founder's dead-chrome rule, not honesty. */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => {
            const selected = c === current;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                aria-pressed={selected}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-sm transition-colors lg:gap-1 lg:px-2 lg:py-0.5 lg:text-xs",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-surface text-foreground hover:border-primary/40 hover:bg-surface/70",
                )}
              >
                {LABEL_DE.get(c) ?? c}
              </button>
            );
          })}
        </div>
      </section>

      {/* The ONE region that scrolls, in both shells, and the only elastic one:
          the picker above it is `flex-none`. The rail bounds it outright (a rail
          inside a stage must never push the page into a scroll); the drawer lets
          it take the room its own cap leaves, so the picker is never the part
          that gets pushed off screen. */}
      <div
        ref={setList}
        className={cn(
          "slim-scrollbar flex min-h-0 flex-col gap-1.5 overflow-y-auto",
          layout === "rail" ? "max-h-[20rem]" : "flex-1",
          // The fade is a hint that content CONTINUES past an edge, so it is
          // applied per edge and only when it does (founder s205: "the first
          // redemittel is literally overshadowed"). It was unconditional, so a
          // list resting at its top, with nothing above it and often nothing
          // below it either, faded its own first phrase out under the pills and
          // read as a shadow cast by them. `useEdgeFade` is the same rule the
          // Bibliothek columns already run on.
          edge.top && edge.bottom && "mask-fade-y",
          edge.top && !edge.bottom && "mask-fade-top",
          !edge.top && edge.bottom && "mask-fade-bottom",
        )}
      >
        {phrases.map((p) => (
          <p
            key={p.id}
            className="flex-none rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[13px] font-medium leading-snug"
          >
            {p.de}
            {peek && (
              <span className="mt-0.5 block text-[11.5px] font-normal text-muted-foreground">
                {p.en}
              </span>
            )}
          </p>
        ))}
      </div>

    </div>
  );

  if (layout === "drawer")
    return <div className={cn("flex min-h-0 flex-1 flex-col", className)}>{body}</div>;

  return (
    <ScopeRail
      title="Redemittel"
      icon={MessagesSquare}
      layout="rail"
      onClose={onClose}
      // No reset: this rail browses, it does not narrow a list, so a reset would
      // sit at its default doing nothing (founder's dead-control rule).
      className={className}
    >
      {body}
    </ScopeRail>
  );
}
