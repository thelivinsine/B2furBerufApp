import { useMemo, useState } from "react";
import { MessagesSquare } from "lucide-react";
import type { ConversationBrief, RedemittelCategory, RedemittelPhrase } from "@/types";
import { redemittelByCategory, redemittelCategories } from "@/data/redemittel";
import { matchesAnrede } from "@/lib/anrede";
import { EnPeek } from "@/features/grammar/EnPeek";
import { ScopeRail, ScopeSelect, scopeSectionLabel } from "@/features/shared/ScopeRail";
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
 * The phrases offered for one speech intent, in the partner's Anrede.
 *
 * The Anrede filter is the one thing here that genuinely filters, which is why
 * it never empties the list: a category whose phrases all commit to the other
 * register falls back to the full set. An empty rail would be a filter that
 * deleted the feature rather than narrowed it.
 */
export function helpPhrases(
  category: RedemittelCategory,
  register: "du" | "sie",
): RedemittelPhrase[] {
  const all = redemittelByCategory(category);
  const fitting = all.filter((p) => matchesAnrede(p.de, register));
  return fitting.length > 0 ? fitting : all;
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

  const current = active ?? categories[0];
  const phrases = useMemo(
    () => (current ? helpPhrases(current, register) : []),
    [current, register],
  );
  const counts = useMemo(
    () => new Map(categories.map((c) => [c, helpPhrases(c, register).length])),
    [categories, register],
  );

  // A scenario with no target Redemittel has nothing to show, and an empty rail
  // is worse than no rail. Every authored scenario carries four.
  if (!current) return null;

  const body = (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <section className="flex-none">
        <div className="mb-2 flex items-center gap-2">
          <p className={cn("flex-1", scopeSectionLabel)}>Sprechabsicht</p>
          {/* ONE peek chip for the whole list, not one per row: the English is
              the same fact repeated eight times, and the rows stay readable. */}
          <EnPeek active={peek} onChange={setPeek} />
        </div>
        <ScopeSelect
          ariaLabel="Sprechabsicht"
          triggerLabel={LABEL_DE.get(current) ?? current}
          value={current}
          onChange={(id) => setActive(id as RedemittelCategory)}
          groups={[
            {
              label: "",
              options: categories.map((c) => ({
                value: c,
                label: LABEL_DE.get(c) ?? c,
                count: counts.get(c),
              })),
            },
          ]}
        />
      </section>

      {/* The ONE region that scrolls, in both shells, and the only elastic one:
          every other section is `flex-none`. The rail bounds it outright (a rail
          inside a stage must never push the page into a scroll); the drawer lets
          it take the room its own cap leaves, which is what keeps the intent
          pills on screen. They are the way to the other three intents, so they
          are worth more than the eighth phrase. */}
      <div
        className={cn(
          "slim-scrollbar mask-fade-y flex min-h-0 flex-col gap-1.5 overflow-y-auto",
          layout === "rail" ? "max-h-[20rem]" : "flex-1",
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

      {categories.length > 1 && (
        <section className="flex-none">
          <p className={cn("mb-2", scopeSectionLabel)}>Auch im Gespräch</p>
          {/* The FilterRail facet-pill recipe, same as LifeAreaPills: white so
              it pops off the Himmelblau tile, honest count, content-sized. */}
          <div className="flex flex-wrap gap-1.5">
            {categories
              .filter((c) => c !== current)
              .map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setActive(c)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1 text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-surface/70 lg:gap-1 lg:px-2 lg:py-0.5 lg:text-xs"
                >
                  {LABEL_DE.get(c) ?? c}
                  <span className="text-xs tabular-nums text-muted-foreground lg:text-[11px]">
                    {counts.get(c)}
                  </span>
                </button>
              ))}
          </div>
        </section>
      )}
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
