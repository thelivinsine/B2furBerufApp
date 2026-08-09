import { memo, useCallback, useState, type ComponentType } from "react";
import { useT, useTx } from "@/lib/uiLang";
import { ChevronDown, Bookmark } from "lucide-react";
import type { VocabItem } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useProgressStore } from "@/store/useProgressStore";
import { usePagedList } from "@/lib/usePagedList";
import { FlipCard } from "@/features/shared/FlipCard";
import { cn } from "@/lib/utils";
import { genderOf } from "@/components/artikel/gender";
import { Wesen } from "@/components/artikel/Wesen";
import { ArtikelEffect } from "@/components/artikel/ArtikelEffect";
import { hasDoodle, loadDoodle } from "./doodles";
import { RelatedPanel, relatedRows } from "./RelatedPanel";
import { useAppConfigStore } from "@/lib/appConfig";
import { verbFormsFor } from "@/data/verbForms";
import { perfekt } from "@/lib/verbDisplay";
import { pluralLabel } from "./pluralLabel";

/**
 * The cross-module "Verbunden" dropdown (RelatedPanel: links from a word to a
 * Kollokation / Schreibtraining / Dialog for the same theme) is PARKED for now
 * (founder, 2026-07-19): the feature needs a rethink on how it is useful and
 * what it should depend on. Flip this to `true` to bring the toggle + panel
 * back; RelatedPanel.tsx and relatedRows stay in the repo untouched. Do NOT
 * delete this flag or the panel while it is parked.
 *
 * Steuerung H4 (s146): the compile-time flag became a remote feature flag
 * (`features.relatedPanel`, default false = parked). VocabCard reads it from
 * the app-config store below.
 */

/**
 * One word card, memoized and subscribed to its OWN slice of the progress
 * store. Before this, the whole list (up to 528 cards) subscribed to `srs` +
 * `savedWords` at the top, so toggling one bookmark re-rendered every card.
 * Now a bookmark or review re-renders only the affected card(s).
 */
const VocabCard = memo(function VocabCard({
  v,
  open,
  onToggleOpen,
}: {
  v: VocabItem;
  open: boolean;
  onToggleOpen: (id: string) => void;
}) {
  const t = useT();
  const tx = useTx();
  const saved = useProgressStore((s) => s.savedWords.includes(v.id));
  const toggleSavedWord = useProgressStore((s) => s.toggleSavedWord);
  const relatedEnabled = useAppConfigStore((s) => s.config.features.relatedPanel);
  const hasRelated = relatedEnabled && relatedRows(v).length > 0;
  const gender = genderOf(v);
  // Verb morphology (s178 audit P2, founder pick C): a compact Perfekt pill in
  // the card foot where a noun's plural pill sits, and the full paradigm on the
  // flip side, which already repeats the plural for nouns. Undefined for
  // non-verbs, and for any verb the oracle does not cover, so the card simply
  // shows nothing rather than a guessed form.
  const forms = v.pos === "verb" ? verbFormsFor(v.id) : undefined;
  // The plural pill's text, or the reason there is no plural ("kein Plural" /
  // "nur Plural"), so a noun's foot slot is never silently empty (s185, P9).
  const plural = pluralLabel(v);
  // Replay trigger for the gender reveal effect: bumped on each front→back flip.
  const [effectPlay, setEffectPlay] = useState(0);
  // Fused doodle (Phase 2): the art chunk loads lazily on the FIRST flip of a
  // card that has one; cards without registered art render exactly as before.
  const withDoodle = hasDoodle(v.id);
  const [Doodle, setDoodle] = useState<ComponentType | null>(null);
  const onFlip =
    gender || withDoodle
      ? (flipped: boolean) => {
          if (!flipped) return;
          if (gender) setEffectPlay((n) => n + 1);
          if (withDoodle) {
            // Idempotent: repeat loads reuse the cached chunk/module.
            void loadDoodle(v.id).then((C) => C && setDoodle(() => C));
          }
        }
      : undefined;

  // Front face: the German word + example. English lives on the flip side.
  // NO filter-facet tags on the tile (founder 2026-07-13): Häufigkeit, Branche
  // AND the Lernstand/mastery badge were all dropped because each is a filter in
  // the rail, so repeating it on the card is redundant. Only the plural (not a
  // facet) and the bookmark action remain. The flip hint icon was removed too;
  // the whole tile still flips on click.
  const front = (
    <Card className="card-hover h-full">
      <CardContent className="flex h-full flex-col p-4">
        {/* Headline (Option B card rework): creature + word on the left,
            bookmark on the right. Speak + plural moved to the card foot so the
            headline stays quiet. */}
        {/* Wraps rather than truncates (three columns since s189 made the card
            narrower, and it was cutting "die Besprechung" to "die Bespre…").
            The creature, the article and the noun are three flex ITEMS, so a
            noun that does not fit beside its article drops to the next line at
            the card's left edge instead of hanging indented under the article
            (founder s189). */}
        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          {gender && <Wesen gender={gender} size={24} />}
          {v.article && (
            <span className="text-base font-semibold leading-snug sm:text-lg">{v.article}</span>
          )}
          <p className="text-base font-semibold leading-snug sm:text-lg">
            {v.article && v.de.startsWith(`${v.article} `) ? v.de.slice(v.article.length + 1) : v.de}
          </p>
        </div>

        {/* The example takes the slack between the headline and the foot and
            sits centered in it (2026-07-31). Every tile in the grid is the same
            height now, so on a short card the example would otherwise cling to
            the headline with a hollow half-card under it. */}
        <div className="mt-2.5 flex flex-1 items-center">
          <p className="line-clamp-2 text-sm italic text-muted-foreground">„{v.examples[0].de}"</p>
        </div>

        {/* Parked: the cross-module "Verbunden" panel (SHOW_RELATED=false, see
            top of file). Never renders while parked; kept in place so
            re-enabling it is a one-line flip. */}
        {hasRelated && (
          <div className="flex items-center justify-end pt-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleOpen(v.id);
              }}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
              aria-expanded={open}
            >
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
              {t(open ? "Weniger" : "Verbunden")}
            </button>
          </div>
        )}
        {open && (
          <div onClick={(e) => e.stopPropagation()}>
            <RelatedPanel item={v} />
          </div>
        )}

        {/* Card foot: plural pill on the left, then speak and the BOOKMARK on
            the right (founder s189 moved the bookmark down from the headline,
            which leaves the headword the whole first line to wrap into).
            mt-auto pins the row to the base so every card in a row shares one
            foot line. */}
        <div
          className={cn(
            "mt-auto flex items-center pt-3",
            plural || forms ? "justify-between" : "justify-end",
          )}
        >
          {plural ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              {v.plural ? `Pl.: ${plural}` : plural}
            </span>
          ) : forms ? (
            <span className="truncate rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              Perf.: {perfekt(forms)}
            </span>
          ) : null}
          <span className="flex items-center gap-0.5">
            <span onClick={(e) => e.stopPropagation()}>
              <SpeakButton text={v.de} />
            </span>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              aria-label={t(saved ? "Gespeichert" : "Wort speichern")}
              aria-pressed={saved}
              title={t(saved ? "Gespeichert" : "Wort speichern")}
              className={cn("shrink-0", saved && "text-primary")}
              onClick={(e) => {
                e.stopPropagation();
                toggleSavedWord(v.id);
              }}
            >
              <Bookmark className={cn("h-4 w-4", saved && "fill-current")} />
            </Button>
          </span>
        </div>
      </CardContent>
    </Card>
  );

  // Back face: the English translation + its example gloss. For nouns a short
  // gender reveal effect plays behind the content on each flip to the back.
  const back = (
    <Card className="relative h-full overflow-hidden border-primary/30 bg-primary/[0.03]">
      {gender && <ArtikelEffect gender={gender} play={effectPlay} align="right" />}
      {/* Centered like the front: the back has nothing pinned to the base, so in
          a uniform-height tile it would sit top-heavy over empty space. */}
      <CardContent className="relative z-10 flex h-full flex-col justify-center p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          Englisch
        </p>
        {Doodle && (
          <div className="flex justify-center py-1">
            <Doodle />
          </div>
        )}
        <p className="mt-1 text-base font-semibold sm:text-lg">{v.en}</p>
        {plural && (
          <p className="mt-1 text-xs text-muted-foreground">
            {v.plural ? `Plural: ${plural}` : plural}
          </p>
        )}
        {forms && (
          // Two label/value pairs per row (2026-07-31). As a single-pair column
          // the paradigm ran four rows tall, which made verb tiles the tallest
          // card in the grid and set the height for every other card once the
          // grid was equalized. Paired up it is two rows and the uniform tile
          // stays tight; no form was dropped.
          <dl className="mt-2.5 grid grid-cols-[auto_minmax(0,1fr)_auto_minmax(0,1fr)] gap-x-2.5 gap-y-0.5 border-t border-border pt-2 text-xs">
            {forms.praeteritum && (
              <>
                <dt className="text-muted-foreground">{t("Präteritum")}</dt>
                <dd className="font-medium">{forms.praeteritum}</dd>
              </>
            )}
            {/* "hat verschoben" is the PERFEKT; the Partizip II alone is
                "verschoben". The preview said Partizip II, which was imprecise for
                a language app, and a learner thinks in tenses anyway. */}
            <dt className="text-muted-foreground">Perfekt</dt>
            <dd className="font-medium">{perfekt(forms)}</dd>
            {forms.zuInfinitiv && (
              <>
                <dt className="text-muted-foreground">{t("mit zu")}</dt>
                <dd className="font-medium">{forms.zuInfinitiv}</dd>
              </>
            )}
            {forms.separable && (
              <>
                <dt className="text-muted-foreground">trennbar</dt>
                <dd className="font-medium">ja</dd>
              </>
            )}
          </dl>
        )}
        {v.examples[0].en && (
          <p className="mt-2 border-t border-border pt-2 text-sm italic text-muted-foreground">
            „{v.examples[0].en}"
          </p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <FlipCard
      front={front}
      back={back}
      label={tx(`Übersetzung von ${v.de}`, `Translation of ${v.de}`)}
      onFlip={onFlip}
    />
  );
});

export function VocabList({ items }: { items: VocabItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const onToggleOpen = useCallback((id: string) => {
    setOpenId((cur) => (cur === id ? null : id));
  }, []);

  // Incremental rendering: the first 60 cards mount instantly; the rest stream
  // in as the sentinel approaches the viewport. (The old version mounted all
  // 528 at once, each in its own staggered motion wrapper.)
  const { visible, hasMore, remaining, sentinelRef, showMore } = usePagedList(items);

  return (
    <>
      {/* `auto-rows-fr`: every tile in the grid gets the SAME height, not just
          the ones sharing a row (founder 2026-07-31). Rows sized `1fr` in an
          auto-height grid all resolve to the tallest row, so the cards stay
          content-driven (a filtered set of short cards stays compact) without
          any fixed height that could clip a long example. */}
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((v) => (
          <VocabCard key={v.id} v={v} open={openId === v.id} onToggleOpen={onToggleOpen} />
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center pt-4">
          <Button variant="outline" size="sm" onClick={showMore}>
            Mehr anzeigen ({remaining} weitere)
          </Button>
        </div>
      )}
    </>
  );
}
