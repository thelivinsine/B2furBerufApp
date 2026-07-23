import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Info,
  Clock,
  Check,
  Lightbulb,
  SlidersHorizontal,
  ChevronDown,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { EnPeek } from "@/features/grammar/EnPeek";
import { GrammarRail } from "./GrammarRail";
import { useFokusMachine, MIN_WORDS } from "./useFokusMachine";
import { valueLabel, refusalCopy, type AxisId } from "./grammarDimensions";
import { diffWords } from "@/lib/wordDiff";

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

  // A fresh sentence disables the grammar controls again; close a stale panel.
  useEffect(() => {
    if (!railEnabled) setPanelOpen(false);
  }, [railEnabled]);

  const inputCard = (
    <Card>
      <CardContent className="space-y-3 p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
          Dein Satz
        </p>

        {m.status === "corrected" ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground line-through decoration-warning/50">
              {m.input}
            </p>
            {m.hasErrors && diff ? (
              <>
                <p className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Check className="h-3.5 w-3.5" /> Korrigiert · {diff.changes.length}{" "}
                  {diff.changes.length === 1 ? "Änderung" : "Änderungen"}
                </p>
                {/* Corrected sentence with the changed words highlighted in place. */}
                <p className="text-base leading-relaxed">
                  {diff.tokens.map((tk, i) => (
                    <span key={i}>
                      {tk.changed ? (
                        <mark className="rounded bg-warning/25 px-0.5 text-foreground">{tk.text}</mark>
                      ) : (
                        tk.text
                      )}
                      {i < diff.tokens.length - 1 ? " " : ""}
                    </span>
                  ))}
                </p>
                {/* The tip: what changed, before -> after. */}
                {diff.changes.length > 0 && (
                  <div className="space-y-1.5 rounded-lg border border-border bg-surface p-3">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
                      Was ich geändert habe
                    </p>
                    {diff.changes.map((c, i) => (
                      <p key={i} className="flex flex-wrap items-center gap-1.5 text-sm">
                        <span className="text-muted-foreground line-through">{c.from || "∅"}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold text-success">{c.to || "(entfernt)"}</span>
                      </p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
                <Check className="h-4 w-4" /> Alles korrekt. Wähle eine Umformung.
              </p>
            )}
          </div>
        ) : (
          <textarea
            value={m.input}
            onChange={(e) => m.setInput(e.target.value)}
            disabled={m.status === "submitting"}
            rows={3}
            placeholder="Schreib einen Satz auf Deutsch, zum Beispiel: Der Chef schreibt die E-Mail."
            className="w-full resize-y rounded-lg border border-input bg-surface p-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-ring"
          />
        )}

        {m.words > 25 && m.status !== "corrected" && (
          <p className="text-right text-xs text-muted-foreground">
            Tipp: In Fokus funktioniert ein Satz am besten.
          </p>
        )}

        {/* Neuer Satz moved out of the card: desktop = the rail footer,
            mobile = the toolbar row (Bibliothek-extension redesign, s148). */}
        {m.status !== "corrected" && (
          <div className="flex items-center justify-end gap-2">
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
          </div>
        )}

        {tooShort && m.status === "idle" && m.words > 0 && (
          <p className="text-xs font-medium text-warning">
            Noch {remaining} {remaining === 1 ? "Wort" : "Wörter"} schreiben, dann kannst du prüfen.
          </p>
        )}

        {/* EU AI Act Art. 50 transparency, at the point of use. */}
        <p className="flex items-start gap-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Dein Satz wird zur Prüfung an eine KI (Anthropic Claude) gesendet. Die Rückmeldung ist
            KI-generiert und kann Fehler enthalten.{" "}
            <Link to="/privacy" className="font-medium text-primary underline-offset-2 hover:underline">
              Mehr im Datenschutz
            </Link>
            .
          </span>
        </p>
      </CardContent>
    </Card>
  );

  const bottomBox = showBottom && (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.18, ease: "easeOut" }}
      className="rounded-xl border border-border bg-muted/40 p-5"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-wide text-accent-ink">
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
            <p className="mt-3 flex items-start gap-1.5 text-sm leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                {peek && m.transform.noteEn ? m.transform.noteEn : m.transform.note}
                {m.transform.noteEn && (
                  <EnPeek active={peek} onChange={setPeek} className="ml-1.5 align-middle" />
                )}
              </span>
            </p>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3 w-3 shrink-0" /> KI-generierte Umformung
          </p>
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
      {/* Mobile: the Bibliothek pattern, a toolbar row (Grammatik panel toggle
          + Neuer Satz) above the content, no floating chips. */}
      <div className="space-y-4 lg:hidden">
        <div className="space-y-3">
          <div className="flex justify-center gap-2">
            <Button
              variant={panelOpen ? "default" : "outline"}
              aria-expanded={panelOpen}
              aria-pressed={panelOpen}
              className="h-10 rounded-lg"
              disabled={!railEnabled}
              onClick={() => setPanelOpen((o) => !o)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Grammatik
              <ChevronDown className={`h-4 w-4 transition-transform ${panelOpen ? "rotate-180" : ""}`} />
            </Button>
            <Button
              variant="outline"
              className="h-10 rounded-lg"
              disabled={!railEnabled}
              onClick={m.startOver}
            >
              <RotateCcw className="h-3.5 w-3.5" /> Neuer Satz
            </Button>
          </div>
          <AnimatePresence initial={false}>
            {panelOpen && (
              <motion.div
                key="grammar-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={reduce ? { duration: 0 } : { duration: 0.22, ease: "easeOut" }}
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
                  onClose={() => setPanelOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {inputCard}
        {errorCard}
        {bottomBox}
      </div>

      {/* Desktop: content column + sticky grammar rail (Bibliothek 16rem grid). */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start lg:gap-x-8">
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
          onNewSentence={m.startOver}
          className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]"
        />
      </div>

      {/* Idle helper (both breakpoints) when nothing is written yet. */}
      {m.status === "idle" && !m.input && (
        <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lightbulb className="h-3.5 w-3.5" />
          Schreib einen Satz, prüf ihn, dann erkennt die KI Aktiv/Passiv und die Zeitform.
        </p>
      )}
    </div>
  );
}
