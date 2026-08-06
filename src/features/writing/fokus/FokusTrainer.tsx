import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Info,
  Clock,
  Check,
  RotateCcw,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { FeedbackLangChip } from "../FeedbackLang";
import { MobileAiNote } from "../bottomChrome";
import { GrammarRail } from "./GrammarRail";
import { GrammarDials } from "./GrammarDials";
import { UmlautKeys } from "../UmlautKeys";
import { AllowanceNote, LeftCount, variantTitle } from "../AllowanceNote";
import { floatingSlot } from "@/features/shared/floatingCluster";
import { CorrectionToggle, FixTiles, MarkedTokens } from "../correction";
import { useFokusMachine, MIN_WORDS, TRANSFORM_VARIANTS } from "./useFokusMachine";
import { useDailyAllowance } from "@/lib/aiAllowance";
import { loadAutosavedDraft, saveAutosavedDraft } from "../draftAutosave";
import { useLiveWork } from "@/lib/liveWork";
import { valueLabel, refusalCopy, type AxisId } from "./grammarDimensions";
import { diffWords, type DiffToken } from "@/lib/wordDiff";
import { cn } from "@/lib/utils";

/**
 * Fokus "Satzlabor": write a sentence, get it corrected in place, then transform
 * the corrected sentence along a grammar axis. Plan:
 * docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md.
 *
 * Auth: the primary action requires a real account, exactly like the guided
 * writing coach. A guest press stashes the sentence and opens the sign-in nudge
 * (handled by the parent via `onRequireAuth`); the parent restores the draft
 * after sign-in.
 */

/**
 * Share of the room between the tile column's top and the fixed bottom chrome
 * that the two mobile tiles actually take (founder s175). The remaining 10%
 * stays empty under the lower tile: filling the room to the last pixel read as
 * cramped.
 */
const FILL_RATIO = 0.9;

export function FokusTrainer({
  isSignedIn,
  onRequireAuth,
  initialText = "",
}: {
  isSignedIn: boolean;
  onRequireAuth: (sentence: string) => void;
  initialText?: string;
}) {
  // Autosave restore (s172): the sentence survives ANY reload, not just the
  // sign-in hand-off. Read once, before the machine is seeded, so a restore
  // never fights a later render.
  const [boot] = useState(() => initialText || loadAutosavedDraft("fokus")?.text || "");

  const m = useFokusMachine(boot);
  // Today's Korrektur allowance (Fokus 10/day). Follows what `check-sentence`
  // reports after every call, so the number moves the moment a unit is spent.
  const allowance = useDailyAllowance("fokus");
  // The Umformung's own budget (`TRANSFORM_DAILY_LIMIT`), separate from the
  // Korrektur allowance above: one round of Fokus can spend up to three of it.
  const transformAllowance = useDailyAllowance("transform");
  const reduce = useReducedMotion();
  // The Hinweis in English. One chip for ALL AI feedback in Schreiben (s179):
  // this used to be the hold-to-peek EnPeek, which stays the pattern for
  // LEARNING content (word cards, Grammatik lessons) but is the wrong fit for a
  // sentence explaining the learner's own text.
  const [peek, setPeek] = useState(false);
  // Result view: the learner's original (coral marks), the corrected sentence
  // (green marks), or, on mobile, the transformed sentence ("Umgeformt", the
  // r4 rework). Defaults to the corrected sentence.
  const [view, setView] = useState<"orig" | "corr" | "trans">("corr");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const taMobileRef = useRef<HTMLTextAreaElement>(null);
  // Mobile geometry: the two tiles fill the height down to the fixed bottom
  // chrome (cluster + KI line), so the resting screen has no dead zone.
  const mobileRootRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<HTMLDivElement>(null);
  const kiNoteRef = useRef<HTMLParagraphElement>(null);

  // Restore a resumed draft's text once (after sign-in), without auto-submitting:
  // the learner presses Korrigieren themselves, matching the guided-mode choice.
  useEffect(() => {
    if (initialText && !m.input) m.setInput(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

  // Keep the sentence on disk while it is being written, and block the
  // deploy-adoption reload until the learner is done with it (lib/liveWork).
  useLiveWork(m.input.trim().length > 0, "writing:fokus", () =>
    saveAutosavedDraft({ mode: "fokus", text: m.input }),
  );
  useEffect(() => {
    const t = window.setTimeout(() => saveAutosavedDraft({ mode: "fokus", text: m.input }), 500);
    return () => window.clearTimeout(t);
  }, [m.input]);

  const tooShort = m.words < MIN_WORDS;
  const remaining = Math.max(0, MIN_WORDS - m.words);

  // Word-level diff of original vs corrected, so the correction can highlight
  // exactly what changed and list each edit as a tip (client-side, no AI).
  const diff = useMemo(
    () => (m.status === "corrected" && m.hasErrors ? diffWords(m.input, m.corrected) : null),
    [m.status, m.hasErrors, m.input, m.corrected],
  );

  // Every fresh correction lands on the corrected view.
  useEffect(() => {
    setView("corr");
  }, [m.corrected]);

  // A transformed sentence exists: word-level diff against the CORRECTED
  // sentence, so the mobile Umgeformt view can green-mark what the transform
  // changed (the same mark language as the correction itself).
  const hasTrans =
    m.transform.status === "done" && m.transform.applicable && !!m.transform.transformed;
  const transTokens = useMemo<DiffToken[] | null>(
    () => (hasTrans ? diffWords(m.corrected, m.transform.transformed).tokens : null),
    [hasTrans, m.corrected, m.transform.transformed],
  );

  // A completed transform pulls the mobile view onto it; losing the transform
  // (reset, re-selection of the detected base) drops back to Korrigiert.
  useEffect(() => {
    if (hasTrans) setView("trans");
    else setView((v) => (v === "trans" ? "corr" : v));
  }, [hasTrans]);

  const onSubmit = () => {
    if (!isSignedIn) {
      onRequireAuth(m.input);
      return;
    }
    void m.submit();
  };

  const onSelect = (axis: AxisId, value: string) => m.selectPill(axis, value);

  // The transform box label = the axes that differ from the detected base.
  const transformLabel = useMemo(() => {
    const parts: string[] = [];
    if (m.selection.voice !== m.detected.voice)
      parts.push(valueLabel("voice", m.selection.voice));
    if (m.selection.tense !== m.detected.tense)
      parts.push(valueLabel("tense", m.selection.tense));
    if (m.selection.mood !== m.detected.mood)
      parts.push(valueLabel("mood", m.selection.mood));
    return parts.join(" · ") || "Umformung";
  }, [m.selection, m.detected]);

  // The just-changed pill carries the inline spinner: whichever axis differs
  // from the detected base (voice, then tense, then mood).
  const loadingValue =
    m.transform.status === "loading"
      ? m.selection.voice !== m.detected.voice
        ? m.selection.voice
        : m.selection.tense !== m.detected.tense
          ? m.selection.tense
          : m.selection.mood
      : null;

  const showBottom =
    m.status === "corrected" && m.transform.status !== "idle";
  const railEnabled = m.status === "corrected";
  const canReset =
    railEnabled &&
    (m.selection.voice !== m.detected.voice ||
      m.selection.tense !== m.detected.tense ||
      m.selection.mood !== m.detected.mood);

  // Mobile fill: the two tiles own the space between their top and the fixed
  // bottom chrome, mirroring the Kurz/Lang treatment (s168).
  //
  // Before a correction exists the column is given an exact `height` rather
  // than a minimum (founder s169: "no scrolling when opened newly"). A minimum
  // let the tiles' natural height win whenever the sum of card chrome, the
  // three dials and a wrapping legend came to more than the screen offered,
  // which is where the resting page scroll came from; with a fixed height the
  // writing field (`min-h-0` + a small floor) absorbs the shortfall instead.
  // Once a correction is on screen it goes back to a minimum, because a long
  // list of fixes MUST be able to grow the page.
  const measureMobile = useCallback(() => {
    const root = mobileRootRef.current;
    if (!root) return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      root.style.minHeight = "";
      root.style.height = "";
      return;
    }
    const topDoc = root.getBoundingClientRect().top + window.scrollY;
    let reserve = 12;
    for (const el of [clusterRef.current, kiNoteRef.current]) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.height > 0) reserve = Math.max(reserve, window.innerHeight - r.top + 12);
    }
    // The column gives back 10% of that room AT THE BOTTOM (founder s175): the
    // tiles start where they always did, they just stop short of the bottom
    // chrome, so the pair breathes instead of filling every last pixel.
    const room = Math.floor(window.innerHeight - topDoc - reserve);
    const fits = `${Math.max(240, Math.round(room * FILL_RATIO))}px`;
    const grows = m.status === "corrected";
    root.style.minHeight = fits;
    root.style.height = grows ? "" : fits;
  }, [m.status]);
  // The same fixed chrome `measureMobile` reserves room for, as a live viewport
  // y: the grammar pickers use it as their floor so they never open underneath
  // the action cluster, the KI line or the tab bar.
  const bottomLimit = useCallback(() => {
    let top = window.innerHeight;
    for (const el of [clusterRef.current, kiNoteRef.current]) {
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.height > 0) top = Math.min(top, r.top);
    }
    return top - 8;
  }, []);

  useLayoutEffect(() => {
    measureMobile();
  });
  useEffect(() => {
    window.addEventListener("resize", measureMobile);
    window.addEventListener("orientationchange", measureMobile);
    let live = true;
    void document.fonts?.ready.then(() => {
      if (live) measureMobile();
    });
    return () => {
      live = false;
      window.removeEventListener("resize", measureMobile);
      window.removeEventListener("orientationchange", measureMobile);
    };
  }, [measureMobile]);

  const korrigierenButton = (
    <Button onClick={onSubmit} disabled={m.status === "submitting" || tooShort} variant="gradient">
      {m.status === "submitting" ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Wird geprüft …
        </>
      ) : (
        <>
          <Sparkles className="h-4 w-4" /> Korrigieren
        </>
      )}
    </Button>
  );

  const showResult = m.status === "corrected" && m.hasErrors && diff;
  const resultTokens = view === "orig" ? diff?.originalTokens : diff?.tokens;

  const inputCard = (
    <Card>
      <CardContent className="space-y-3 p-5">
        {/* Card-title eyebrow = bold primary (unified eyebrow system, s149).
            After a correction it shares the row with the Original/Korrigiert
            view toggle (s150). */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide text-primary">
            Dein Satz
          </p>
          {showResult && (
            <CorrectionToggle
              view={view === "trans" ? "corr" : view}
              onChange={setView}
            />
          )}
        </div>

        {m.status === "corrected" ? (
          showResult && resultTokens ? (
            <div className="space-y-3">
              {/* One sentence: original with coral marks, or corrected with
                  green marks. A calm underline, not a loud fill. */}
              <p className="text-base leading-relaxed">
                <MarkedTokens
                  tokens={resultTokens}
                  mark={view === "orig" ? "coral" : "green"}
                />
              </p>
              <div className="h-px bg-border" />
              {/* Himmelblau fix tiles (light kräftig, dark weich): each carries
                  the learning category + the before → after edit. Neuer Satz
                  shares the row, right- and bottom-aligned. Shared with the
                  Kurz/Lang result and the Verlauf (s172), so one correction
                  language covers every surface. No cap here: a single sentence
                  cannot produce a wall of tiles. */}
              <FixTiles
                changes={diff.changes}
                action={
                  <Button
                    variant="outline"
                    onClick={m.startOver}
                    className="ml-auto h-9 self-end rounded-xl"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Neuer Satz
                  </Button>
                }
              />
            </div>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
              <Check className="h-4 w-4" /> Alles korrekt. Wähle eine Umformung.
            </p>
          )
        ) : (
          <>
            <textarea
              ref={taRef}
              value={m.input}
              onChange={(e) => m.setInput(e.target.value)}
              disabled={m.status === "submitting"}
              rows={3}
              placeholder="Schreib einen Satz auf Deutsch, zum Beispiel: Der Chef schreibt die E-Mail."
              className="w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none"
            />
            {/* Umlaut keys share the footer row with Korrigieren (desktop);
                mobile keeps Korrigieren in the sticky bottom bar (s150). */}
            <div className="flex flex-wrap items-center gap-2">
              <UmlautKeys textareaRef={taRef} value={m.input} onChange={m.setInput} className="flex-1" />
              <div className="hidden lg:block">{korrigierenButton}</div>
            </div>
            {/* What the day still holds, beside the button that spends it
                (founder 2026-07-31). One Korrektur = one unit; the Umformung
                that may follow is free, so this only moves on Korrigieren. */}
            {allowance.known && (
              <AllowanceNote
                remaining={allowance.remaining}
                limit={allowance.limit}
                what="Korrekturen"
                className="text-right"
              />
            )}
          </>
        )}

        {m.words > 25 && m.status !== "corrected" && (
          <p className="text-right text-xs text-muted-foreground">
            Tipp: In Fokus funktioniert ein Satz am besten.
          </p>
        )}

        {/* Desktop only: on mobile the floating action cluster pins exactly
            over the card's last line, so this hint rides in the cluster
            instead (see below) and never ends up under the buttons. */}
        {tooShort && m.status === "idle" && m.words > 0 && (
          <p className="hidden text-xs font-medium text-warning lg:block">
            Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du prüfen.
          </p>
        )}

      </CardContent>
    </Card>
  );

  // EU AI Act Art. 50 transparency note. Desktop: dropped to the very bottom of the
  // viewport so it reads level with the floating "Mit KI gebaut · Feedback" pill,
  // no bordered bar (founder s159). Mirrors the pill's sidebar offset (`lg:pl-64`)
  // and the AppShell content container (`max-w-6xl` + `sm:px-6`) so the text sits
  // in the content column, its right edge clear of the pill. Pointer-events pass
  // through except the link, so it never blocks the cards it floats over.
  const aiNoteDesktop = (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 hidden lg:block lg:pl-64">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <p className="max-w-[calc(100%-18rem)] text-center text-xs leading-relaxed text-muted-foreground">
          <Info className="mr-1 inline-block h-3.5 w-3.5 -translate-y-px align-middle" />
          Dein Satz wird von einer KI (Anthropic, Google oder OpenAI) geprüft und umgeformt. Die
          Rückmeldung ist KI-generiert und kann Fehler enthalten.{" "}
          <Link
            to="/privacy"
            className="pointer-events-auto font-medium text-primary underline-offset-2 hover:underline"
          >
            Mehr im Datenschutz
          </Link>
          .
        </p>
      </div>
    </div>
  );

  const bottomBox = showBottom && (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
      // White card like every other content card (founder s149; was a grey wash).
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">
          {transformLabel}
        </span>
        <div className="flex items-center gap-2">
          {/* The Umformung has its OWN daily budget (it never spends a
              Korrektur, s167), and until s197 it was the one AI feature whose
              wall arrived with no warning. */}
          {transformAllowance.known && (
            <AllowanceNote
              remaining={transformAllowance.remaining}
              limit={transformAllowance.limit}
              what="Umformungen"
            />
          )}
        {m.transform.status === "done" && m.transform.applicable && m.transform.transformed && (
          <div className="flex items-center gap-1.5">
            {/* "Nochmal": ask the AI for another phrasing of the same target form
                (capped + cached, so cycling is free after the first two). */}
            <button
              type="button"
              onClick={m.regenerate}
              title={variantTitle(m.variantsLeft, TRANSFORM_VARIANTS)}
              aria-label={variantTitle(m.variantsLeft, TRANSFORM_VARIANTS)}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Nochmal{" "}
              <LeftCount remaining={m.variantsLeft} total={TRANSFORM_VARIANTS} />
            </button>
            <SpeakButton text={m.transform.transformed} />
          </div>
        )}
        </div>
      </div>

      {m.transform.status === "loading" && (
        <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Wird umgeformt …
        </div>
      )}

      {m.transform.status === "error" && (
        <p className="text-sm text-muted-foreground">
          {m.transform.message ?? "Diese Umformung war gerade nicht möglich."}
        </p>
      )}

      {m.transform.status === "done" && !m.transform.applicable && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {refusalCopy(m.transform.reason)}
        </p>
      )}

      {m.transform.status === "done" && m.transform.applicable && (
        <>
          <p className="text-base leading-relaxed">{m.transform.transformed}</p>
          {m.transform.note && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {/* "Hinweis" label instead of an icon (founder s149). */}
              <b className="font-bold text-primary">Hinweis:</b>{" "}
              {peek && m.transform.noteEn ? m.transform.noteEn : m.transform.note}
              {m.transform.noteEn && (
                <FeedbackLangChip showEnglish={peek} onChange={setPeek} className="ml-1.5 align-middle" />
              )}
            </p>
          )}
          {/* The "KI-generierte Umformung" footer was merged into the single
              bottom-of-column AI note (founder s151). */}
        </>
      )}
    </motion.div>
  );

  // Error / limit state (submit failed).
  const errorCard = m.status === "error" && (
    <Card className="border-warning/30">
      <CardContent className="flex items-start gap-3 p-5">
        <Clock className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
        <div>
          <p className="font-semibold">
            {m.limitReached ? "Tageslimit erreicht" : "Gerade nicht verfügbar"}
          </p>
          <p className="text-sm text-muted-foreground">
            {m.errorMessage ??
              "Die Prüfung ist momentan nicht verfügbar. Bitte versuche es später erneut."}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  // Mobile view toggle segments (r4): Original / Korrigiert, plus Umgeformt
  // once a transform exists. An error-free correction has no Original to show,
  // so its toggle only appears once there is a transform to switch to.
  const mobileSegments: { id: "orig" | "corr" | "trans"; label: string }[] =
    m.status === "corrected"
      ? m.hasErrors
        ? [
            { id: "orig" as const, label: "Original" },
            { id: "corr" as const, label: "Korrigiert" },
            ...(hasTrans ? [{ id: "trans" as const, label: "Umgeformt" }] : []),
          ]
        : hasTrans
          ? [
              { id: "corr" as const, label: "Korrigiert" },
              { id: "trans" as const, label: "Umgeformt" },
            ]
          : []
      : [];

  // One line under the dials: the legend, or the honest reason a transform
  // did not happen (refusal / error), closest to the controls that caused it.
  const dialsLegend =
    m.status !== "corrected" ? (
      <>Prüf zuerst deinen Satz, dann erkennt die KI Aktiv/Passiv, Zeitform und Modus.</>
    ) : m.transform.status === "error" ? (
      <>{m.transform.message ?? "Diese Umformung war gerade nicht möglich."}</>
    ) : m.transform.status === "done" && !m.transform.applicable ? (
      <>{refusalCopy(m.transform.reason)}</>
    ) : canReset ? (
      <>
        <b className="font-bold text-success">Grüner Punkt = dein Satz.</b> Blau = dein Ziel.
      </>
    ) : (
      <>
        <b className="font-bold text-success">Grüner Punkt = dein Satz.</b> Tippe eine andere Form.
      </>
    );

  // "The KI is working" (founder s169): the sentence line is replaced by three
  // shimmering bars in its own shape, so the wait is visible in the tile the
  // answer will appear in, not only in the button label and the dial spinner.
  // Widths taper like a real sentence; the sweep is the one `.fx-skeleton-bar`
  // utility (reduced-motion safe) with a small per-bar delay so it cascades.
  const sentenceSkeleton = (
    <div
      role="status"
      aria-label="Die KI prüft deinen Satz"
      className="flex w-full flex-col items-center gap-2.5"
    >
      {["86%", "72%", "45%"].map((w, i) => (
        <span
          key={w}
          aria-hidden
          className="fx-skeleton-bar block h-3.5 rounded-full"
          style={{ width: w, animationDelay: reduce ? undefined : `${i * 0.14}s` }}
        />
      ))}
    </div>
  );

  const marked = (tokens: DiffToken[], mark: "coral" | "green") => (
    <p className="text-center text-base leading-relaxed">
      <MarkedTokens tokens={tokens} mark={mark} />
    </p>
  );

  // The mobile sentence card (r4 "Option 2"): centered view toggle with the
  // compact "Neu" control in the top-right corner (the Kurz/Lang dice spot;
  // icon-only beside a three-segment toggle), content vertically centered.
  const mobileSentenceCard = (
    <Card className="flex min-h-0 grow-[1.15] flex-col">
      {m.status === "corrected" ? (
        <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-5">
          <div className="relative flex min-h-9 items-center justify-center px-9">
            {mobileSegments.length > 0 && (
              <div
                className={cn(
                  "inline-flex rounded-lg bg-muted p-0.5 font-bold",
                  mobileSegments.length === 3 ? "text-[11px]" : "text-xs",
                )}
              >
                {mobileSegments.map((seg) => (
                  <button
                    key={seg.id}
                    type="button"
                    aria-pressed={view === seg.id}
                    onClick={() => setView(seg.id)}
                    className={cn(
                      "rounded-md py-1 transition-colors",
                      mobileSegments.length === 3 ? "px-2" : "px-3",
                      view === seg.id
                        ? "bg-surface text-foreground shadow-soft"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {seg.label}
                  </button>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={m.startOver}
              aria-label="Neuer Satz"
              title="Neuer Satz"
              className="absolute right-0 top-1/2 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              {mobileSegments.length < 3 && "Neu"}
            </button>
          </div>

          {/* Two stacked regions (founder s169): the sentence floats centered
              in whatever room is left, the detail block is anchored under it.
              The old single centered group pushed all the slack ABOVE the
              sentence, which read as "more space before the sentence than
              after". No horizontal rule between them either (founder s169):
              the gap alone separates them. */}
          <div className="flex min-h-0 flex-1 flex-col gap-5">
            <div className="flex flex-1 items-center justify-center">
              {m.transform.status === "loading"
                ? sentenceSkeleton
                : view === "trans" && hasTrans && transTokens
                  ? marked(transTokens, "green")
                  : showResult && diff
                    ? marked(
                        view === "orig" ? diff.originalTokens : diff.tokens,
                        view === "orig" ? "coral" : "green",
                      )
                    : <p className="text-center text-base leading-relaxed">{m.corrected}</p>}
            </div>

            {m.transform.status === "loading" ? null : view === "trans" && hasTrans ? (
              <div className="space-y-3">
                {m.transform.note && (
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    <b className="font-bold text-primary">Hinweis:</b>{" "}
                    {peek && m.transform.noteEn ? m.transform.noteEn : m.transform.note}
                    {m.transform.noteEn && (
                      <FeedbackLangChip showEnglish={peek} onChange={setPeek} className="ml-1.5 align-middle" />
                    )}
                  </p>
                )}
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={m.regenerate}
                    title={variantTitle(m.variantsLeft, TRANSFORM_VARIANTS)}
                    aria-label={variantTitle(m.variantsLeft, TRANSFORM_VARIANTS)}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-border bg-surface px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Nochmal{" "}
                    <LeftCount remaining={m.variantsLeft} total={TRANSFORM_VARIANTS} />
                  </button>
                  <SpeakButton text={m.transform.transformed} />
                </div>
                {/* Same fact as the desktop card's header, in the one place a
                    phone has room for it (s197). */}
                {transformAllowance.known && (
                  <AllowanceNote
                    remaining={transformAllowance.remaining}
                    limit={transformAllowance.limit}
                    what="Umformungen"
                    className="text-center"
                  />
                )}
              </div>
            ) : showResult && diff ? (
              // Corrections as two text columns (founder r4 amendment: no
              // Himmelblau chip backgrounds on mobile). The separator is ONE
              // full-height rule down the middle of the grid, not a per-cell
              // left border: with three fixes the per-cell version stopped
              // after the first row and looked broken (founder s169).
              <div className="relative grid grid-cols-2 gap-x-2 gap-y-5">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border"
                />
                {diff.changes.map((c, i) => (
                  <div key={i} className="px-2 text-center">
                    {/* The eyebrow hugs ITS correction (founder s169): the gap
                        above a category label is deliberately wider than the
                        gap below it, so each pair reads as one unit. */}
                    <span className="mb-0.5 block text-[10px] font-extrabold uppercase leading-tight tracking-wide text-accent-ink">
                      {c.category}
                    </span>
                    {c.moved ? (
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
              </div>
            ) : (
              <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-success">
                <Check className="h-4 w-4" /> Alles korrekt. Wähle eine Umformung.
              </p>
            )}
          </div>
        </CardContent>
      ) : (
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-5">
          {m.status === "submitting" ? (
            // The whole tile becomes the waiting state: the sentence the KI is
            // working on, then the shimmering bars where its answer will land
            // (founder s169).
            <div className="flex min-h-0 flex-1 flex-col justify-center gap-6 py-2">
              <p className="text-center text-base leading-relaxed text-muted-foreground">
                {m.input}
              </p>
              {sentenceSkeleton}
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">Dein Satz</p>
              <textarea
                ref={taMobileRef}
                value={m.input}
                onChange={(e) => m.setInput(e.target.value)}
                rows={3}
                placeholder="Schreib einen Satz auf Deutsch, zum Beispiel: Der Chef schreibt die E-Mail."
                className="min-h-[72px] w-full flex-1 resize-none rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none"
              />
              <UmlautKeys textareaRef={taMobileRef} value={m.input} onChange={m.setInput} />
              {/* The "why can't I press Korrigieren yet" line sits in the card
                  being typed in, under the umlaut keys (founder s169), which
                  frees the bottom KI line to stay the Art. 50 note in every
                  state. Same placement as Kurz/Lang. */}
              {/* One line, two facts: why Korrigieren is not ready yet (left,
                  transient) and what the day still holds (right, standing). */}
              {(tooShort && m.words > 0) || allowance.known ? (
                <div className="flex items-start justify-between gap-2">
                  {tooShort && m.words > 0 ? (
                    <p className="text-xs font-medium text-warning">
                      Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst
                      du prüfen.
                    </p>
                  ) : (
                    <span />
                  )}
                  {allowance.known && (
                    <AllowanceNote
                      remaining={allowance.remaining}
                      limit={allowance.limit}
                      what="Korrekturen"
                      className="shrink-0"
                    />
                  )}
                </div>
              ) : null}
              {m.words > 25 && (
                <p className="text-right text-xs text-muted-foreground">
                  Tipp: In Fokus funktioniert ein Satz am besten.
                </p>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );

  return (
    <div>
      {/* Mobile (r4 rework, founder-approved "Option 2"): two tiles fill the
          height down to the fixed bottom chrome. The sentence card carries the
          view toggle + corner Neu; the Grammatik dial tile below it makes the
          transform feature visible from the first second (the old toolbar
          toggle read as a filter and hid it). */}
      <div ref={mobileRootRef} className="flex flex-col gap-5 lg:hidden">
        {mobileSentenceCard}
        {errorCard && <div className="shrink-0">{errorCard}</div>}
        <GrammarDials
          detected={m.detected}
          selection={m.selection}
          enabled={railEnabled}
          loadingValue={loadingValue}
          onSelect={onSelect}
          onReset={m.reset}
          canReset={canReset}
          legend={dialsLegend}
          bottomLimit={bottomLimit}
          className="min-h-0 grow"
        />
      </div>

      {/* Desktop: content column + sticky grammar rail (Bibliothek 16rem grid). */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8">
        {/* AI note is the fixed bottom-line `aiNoteDesktop` below (founder s160),
            level with the floating Feedback pill, so it is NOT in this column. */}
        <div className="space-y-4">
          {inputCard}
          {errorCard}
          {bottomBox}
        </div>
        <GrammarRail
          detected={m.detected}
          selection={m.selection}
          enabled={railEnabled}
          loadingValue={loadingValue}
          onSelect={onSelect}
          onReset={m.reset}
          canReset={canReset}
          className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]"
        />
      </div>

      {/* (The old idle helper line was removed in s149: it duplicated the
          rail's "Prüf zuerst deinen Satz …" hint.) */}

      {/* Mobile fixed chrome, portalled to <body>: WritingHub slides tab panels
          with an `x` transform, and a transformed ancestor would re-anchor
          `fixed` descendants mid-slide (the Kurz/Lang lesson, s168).

          FIXED, not sticky: the KI line is locked just above the nav in every
          state (founder r4), with the Feedback + Korrigieren cluster floating
          above it until a correction exists. `measureMobile` gives the tile
          column the matching height. */}
      {createPortal(
        <>
          {m.status !== "corrected" && (
            <div
              ref={clusterRef}
              className="fixed inset-x-0 bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom)_+_2rem)] z-30 mx-auto w-full max-w-6xl px-4 sm:px-6 lg:hidden"
            >
              {/* Every control sits on its own opaque backing (see
                  `floatingCluster`). The Zurück pill that used to lead this row
                  moved to the shell's top-right corner in s195, where it is the
                  same control on every screen of the zone. */}
              <div className="flex items-stretch gap-2">
                <div className={cn(floatingSlot, "flex-1 [&>button]:h-11 [&>button]:w-full [&>button]:rounded-xl [&>button]:text-base")}>
                  {korrigierenButton}
                </div>
              </div>
            </div>
          )}
          {/* The one bottom line, and it never changes content (founder s169):
              the "how many words to go" hint moved into the card, under the
              umlaut keys, so this slot is the Art. 50 note plus the Feedback
              link in every state. */}
          <MobileAiNote ref={kiNoteRef} />
        </>,
        document.body,
      )}

      {aiNoteDesktop}
    </div>
  );
}
