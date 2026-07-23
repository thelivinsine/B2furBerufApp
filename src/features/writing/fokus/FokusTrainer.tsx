import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Info,
  Clock,
  Check,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EnPeek } from "@/features/grammar/EnPeek";
import { GrammarRail } from "./GrammarRail";
import { UmlautKeys } from "../UmlautKeys";
import { useFokusMachine, MIN_WORDS } from "./useFokusMachine";
import { valueLabel, refusalCopy, type AxisId } from "./grammarDimensions";
import { diffWords } from "@/lib/wordDiff";
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
export function FokusTrainer({
  isSignedIn,
  onRequireAuth,
  initialText = "",
}: {
  isSignedIn: boolean;
  onRequireAuth: (sentence: string) => void;
  initialText?: string;
}) {
  const m = useFokusMachine(initialText);
  const reduce = useReducedMotion();
  const [peek, setPeek] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  // Correction result view: the learner's original (coral marks) or the
  // corrected sentence (green marks). Defaults to the corrected sentence.
  const [view, setView] = useState<"orig" | "corr">("corr");
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Restore a resumed draft's text once (after sign-in), without auto-submitting:
  // the learner presses Korrigieren themselves, matching the guided-mode choice.
  useEffect(() => {
    if (initialText && !m.input) m.setInput(initialText);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialText]);

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
    return parts.join(" · ") || "Umformung";
  }, [m.selection, m.detected]);

  const loadingValue =
    m.transform.status === "loading"
      ? m.selection.voice !== m.detected.voice
        ? m.selection.voice
        : m.selection.tense
      : null;

  const showBottom =
    m.status === "corrected" && m.transform.status !== "idle";
  const railEnabled = m.status === "corrected";
  const canReset =
    railEnabled &&
    (m.selection.voice !== m.detected.voice || m.selection.tense !== m.detected.tense);

  // A fresh sentence disables the grammar controls again; close a stale panel.
  useEffect(() => {
    if (!railEnabled) setPanelOpen(false);
  }, [railEnabled]);

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
            <div className="inline-flex rounded-full bg-muted p-0.5 text-xs font-bold">
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
                  onClick={() => setView(seg.id)}
                  className={cn(
                    "rounded-full px-3 py-1 transition-colors",
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
        </div>

        {m.status === "corrected" ? (
          showResult && resultTokens ? (
            <div className="space-y-3">
              {/* One sentence: original with coral marks, or corrected with
                  green marks. A calm underline, not a loud fill. */}
              <p className="text-base leading-relaxed">
                {resultTokens.map((tk, i) => (
                  <span key={i}>
                    {tk.changed ? (
                      <span
                        className={cn(
                          "font-semibold",
                          view === "orig" ? "fx-mark-coral" : "fx-mark-green",
                        )}
                      >
                        {tk.text}
                      </span>
                    ) : (
                      tk.text
                    )}
                    {i < resultTokens.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
              <div className="h-px bg-border" />
              {/* Himmelblau fix tiles (light kräftig, dark weich): each carries
                  the learning category + the before → after edit. Neuer Satz
                  shares the row, right- and bottom-aligned. */}
              <div className="flex flex-wrap items-stretch gap-2.5">
                {diff.changes.map((c, i) => (
                  <div
                    key={i}
                    className="min-w-[8rem] rounded-xl border border-accent/70 bg-accent/30 p-2.5 dark:border-accent/[0.45] dark:bg-accent/[0.18]"
                  >
                    <span className="mb-1 block text-[10px] font-extrabold uppercase tracking-wide text-accent-ink">
                      {c.category}
                    </span>
                    <span className="text-sm">
                      <span className="text-muted-foreground line-through">{c.from || "∅"}</span>{" "}
                      <span className="text-muted-foreground/80">→</span>{" "}
                      <span className="font-bold text-success">{c.to || "(entfernt)"}</span>
                    </span>
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={m.startOver}
                  className="ml-auto h-9 self-end rounded-xl"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Neuer Satz
                </Button>
              </div>
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
              className="w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
            />
            {/* Umlaut keys share the footer row with Korrigieren (desktop);
                mobile keeps Korrigieren in the sticky bottom bar (s150). */}
            <div className="flex flex-wrap items-center gap-2">
              <UmlautKeys textareaRef={taRef} value={m.input} onChange={m.setInput} className="flex-1" />
              <div className="hidden lg:block">{korrigierenButton}</div>
            </div>
          </>
        )}

        {m.words > 25 && m.status !== "corrected" && (
          <p className="text-right text-xs text-muted-foreground">
            Tipp: In Fokus funktioniert ein Satz am besten.
          </p>
        )}

        {tooShort && m.status === "idle" && m.words > 0 && (
          <p className="text-xs font-medium text-warning">
            Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du prüfen.
          </p>
        )}

      </CardContent>
    </Card>
  );

  // EU AI Act Art. 50 transparency: ONE combined, harmonized note (was two: the
  // send-to-AI line + the "KI-generierte Umformung" footer). Centered under the
  // Dein-Satz box and placed at the bottom of the column so it reads together with
  // the "Mit KI gebaut · Feedback" pill on the same bottom line (founder s151).
  const aiNote = (
    <p className="px-1 pt-1 text-center text-xs leading-relaxed text-muted-foreground">
      <Info className="mr-1 inline-block h-3.5 w-3.5 -translate-y-px align-middle" />
      Dein Satz wird von einer KI (Anthropic, Google oder OpenAI) geprüft und umgeformt. Die
      Rückmeldung ist KI-generiert und kann Fehler enthalten.{" "}
      <Link to="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
        Mehr im Datenschutz
      </Link>
      .
    </p>
  );

  const bottomBox = showBottom && (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
      // White card like every other content card (founder s149; was a grey wash).
      className="rounded-2xl border border-border bg-surface p-5 shadow-soft"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-primary">
          {transformLabel}
        </span>
        {m.transform.status === "done" && m.transform.applicable && m.transform.transformed && (
          <SpeakButton text={m.transform.transformed} />
        )}
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
                <EnPeek active={peek} onChange={setPeek} className="ml-1.5 align-middle" />
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

  return (
    <div>
      {/* Mobile: the Bibliothek pattern, a toolbar row (Grammatik panel toggle)
          above the content. Neuer Satz now lives on the correction card (s150). */}
      <div className="space-y-4 lg:hidden">
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            {/* Always tappable (founder s151): before a correction the panel opens
                to the GrammarRail's "Prüf zuerst deinen Satz …" hint (matching the
                always-visible desktop rail), instead of a dead disabled button that
                reads as broken. */}
            <Button
              variant={panelOpen ? "default" : "outline"}
              aria-expanded={panelOpen}
              aria-pressed={panelOpen}
              className="h-10 rounded-lg"
              onClick={() => setPanelOpen((o) => !o)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Grammatik
              <ChevronDown className={`h-4 w-4 transition-transform ${panelOpen ? "rotate-180" : ""}`} />
            </Button>
          </div>
          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                key="grammar-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                // 0.18s: the shared panel timing (micro-motion pass, s149 P2).
                transition={reduce ? { duration: 0 } : { duration: 0.18, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <GrammarRail
                  layout="panel"
                  detected={m.detected}
                  selection={m.selection}
                  enabled={railEnabled}
                  loadingValue={loadingValue}
                  onSelect={(axis, value) => {
                    onSelect(axis, value);
                    setPanelOpen(false);
                  }}
                  onReset={m.reset}
                  canReset={canReset}
                  onClose={() => setPanelOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {inputCard}
        {errorCard}
        {bottomBox}
        {aiNote}
      </div>

      {/* Desktop: content column + sticky grammar rail (Bibliothek 16rem grid). */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8">
        {/* AI note sits centered in normal flow under the content, NOT pinned to
            the bottom (founder s151 follow-up: the bottom-pinned version read as an
            awkward detached band). */}
        <div className="space-y-4">
          {inputCard}
          {errorCard}
          {bottomBox}
          {aiNote}
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

      {/* Mobile action bar: Korrigieren pinned above the nav, matching the
          Kurz/Lang Auswerten bar (s149 harmonization). Gone once corrected
          (the toolbar owns Grammatik; the card owns Neuer Satz). */}
      {m.status !== "corrected" && (
        <div className="sticky bottom-[calc(3.9375rem_+_env(safe-area-inset-bottom))] z-30 -mx-4 mt-4 flex items-center gap-2 border-t border-border bg-background/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6 lg:hidden [&>button]:h-11 [&>button]:flex-1 [&>button]:rounded-xl [&>button]:text-base">
          {korrigierenButton}
        </div>
      )}
    </div>
  );
}
