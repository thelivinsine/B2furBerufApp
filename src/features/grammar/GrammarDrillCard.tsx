import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, X, Eye, ArrowRight } from "lucide-react";
import type { GrammarDrill } from "@/types";
import { Button } from "@/components/ui/button";
import { SpeakButton } from "@/components/shared/SpeakButton";
import { useProgressStore } from "@/store/useProgressStore";
import { XP } from "@/engine/scoring";
import { cn, normalize, shuffle } from "@/lib/utils";
import { EnPeek } from "./EnPeek";

/**
 * A single inline grammar drill: multiple-choice when `options` exist,
 * otherwise a free-text input checked with forgiving normalization.
 * Awards XP once on the first correct answer.
 *
 * When reused inside the composed SessionPlayer (UX overhaul Phase 1), the
 * parent passes `suppressXp` (so XP is tallied centrally, not double-counted)
 * and `onResult` (fired once when the drill is first answered) to drive the
 * session's progress + end-screen. Both are optional; the standalone Grammar
 * hub keeps its original self-scoring behaviour.
 */
export function GrammarDrillCard({
  drill,
  onResult,
  suppressXp = false,
  glossPeek = false,
}: {
  drill: GrammarDrill;
  onResult?: (correct: boolean) => void;
  suppressXp?: boolean;
  /** German-first mode (the Grammatik lesson, s93): hide the English gloss
   *  behind a hold-to-peek EN chip instead of showing it by default. The
   *  composed session keeps the always-visible gloss. */
  glossPeek?: boolean;
}) {
  const addXp = useProgressStore((s) => s.addXp);
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [reported, setReported] = useState(false);
  const [peekGloss, setPeekGloss] = useState(false);

  const options = useMemo(() => (drill.options ? shuffle(drill.options) : null), [drill.options]);
  const solved = drill.prompt.replace("___", drill.answer);

  const award = (correct: boolean) => {
    if (correct && !awarded && !suppressXp) {
      addXp(XP.grammarDrill);
      setAwarded(true);
    }
    // Report the first-answer result exactly once (session player advances on it).
    if (!reported) {
      setReported(true);
      onResult?.(correct);
    }
  };

  const isCorrect = options
    ? picked === drill.answer
    : normalize(text) === normalize(drill.answer);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    setChecked(true);
    award(opt === drill.answer);
  };

  const checkText = () => {
    setChecked(true);
    award(normalize(text) === normalize(drill.answer));
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 text-sm font-medium">{drill.prompt}</p>
        {glossPeek && drill.gloss && <EnPeek active={peekGloss} onChange={setPeekGloss} />}
      </div>
      {drill.gloss && (!glossPeek || peekGloss) && (
        <p className="mt-1 text-xs text-muted-foreground">{drill.gloss}</p>
      )}

      {options ? (
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {options.map((opt) => {
            const correct = opt === drill.answer;
            const isPicked = picked === opt;
            const state = !picked ? "idle" : correct ? "correct" : isPicked ? "wrong" : "dim";
            return (
              <button
                key={opt}
                disabled={!!picked}
                onClick={() => choose(opt)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                  // Idle options carry a subtle fill so they read as tappable
                  // answer chips, not disabled input fields (founder s104).
                  state === "idle" &&
                    "border-border bg-muted/50 hover:border-primary/50 hover:bg-muted",
                  state === "correct" && "border-success bg-success/10 text-success",
                  state === "wrong" && "border-danger bg-danger/10 text-danger",
                  state === "dim" && "border-border opacity-50",
                )}
              >
                {opt}
                {state === "correct" && <Check className="h-4 w-4" />}
                {state === "wrong" && <X className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={checked && isCorrect}
              onKeyDown={(e) => e.key === "Enter" && checkText()}
              placeholder="Deine Antwort …"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {!checked || !isCorrect ? (
              <Button variant="outline" onClick={checkText}>Prüfen</Button>
            ) : null}
          </div>
        </div>
      )}

      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "mt-3 flex items-start gap-2 rounded-lg p-3 text-sm",
            isCorrect ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
          )}
        >
          {isCorrect ? <Check className="mt-0.5 h-4 w-4 shrink-0" /> : <X className="mt-0.5 h-4 w-4 shrink-0" />}
          <div className="space-y-1">
            <p className="font-medium">
              {isCorrect ? "Richtig!" : `Lösung: ${drill.answer}`}
            </p>
            {drill.explain && <p className="text-muted-foreground">{drill.explain}</p>}
          </div>
          <SpeakButton text={solved} className="ml-auto" />
        </motion.div>
      )}

      {checked && !isCorrect && !options && (
        <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setChecked(false); setText(""); }}>
          <Eye className="h-3.5 w-3.5" /> Nochmal versuchen
        </Button>
      )}
    </div>
  );
}

/** Compact "next topic" link row used at the bottom of a topic page. */
export function NextTopicLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button variant="outline" className="w-full justify-between" onClick={onClick}>
      {label} <ArrowRight className="h-4 w-4" />
    </Button>
  );
}
