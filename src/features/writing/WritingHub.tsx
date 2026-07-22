import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PenLine, History } from "lucide-react";
import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";
import { WritingHistory } from "./WritingHistory";
import { WritingModeSwitcher } from "./WritingModeSwitcher";
import { GuidedWritingTrainer } from "./GuidedWritingTrainer";
import { FokusTrainer } from "./fokus/FokusTrainer";
import {
  loadWritingDraft,
  saveWritingDraft,
  clearWritingDraft,
  type WritingMode,
} from "./resumeDraft";
import { AuthDialog } from "@/features/auth/AuthDialog";
import { useAuthStore } from "@/store/useAuthStore";
import { cn } from "@/lib/utils";

type HubView = "write" | "history";

const MODES: WritingMode[] = ["fokus", "kurz", "lang"];
function isMode(v: string | null): v is WritingMode {
  return !!v && (MODES as string[]).includes(v);
}
const lengthOf = (mode: WritingMode): WritingLength => (mode === "lang" ? "long" : "short");

/**
 * Schreibtraining hub (redesign, plan: docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md).
 * A mode router over three surfaces:
 *   - Fokus: the single-sentence write -> correct -> transform grammar lab.
 *   - Kurz / Lang: the guided B2-Beruf writing tasks (the original flow).
 *   - Verlauf: the writing-evaluation history (guided modes only).
 * Owns the login wall (writing needs a real account) + the draft-resume flow that
 * survives the Google OAuth full-page redirect.
 */
export function WritingHub() {
  const [params, setParams] = useSearchParams();
  const rawMode = params.get("mode");
  const mode: WritingMode = isMode(rawMode) ? rawMode : "fokus";
  const [hubView, setHubView] = useState<HubView>("write");

  const status = useAuthStore((s) => s.status);
  const isSignedIn = status === "signedIn";
  const [authOpen, setAuthOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");

  const setMode = (m: WritingMode) => {
    const p = new URLSearchParams(params);
    if (m === "fokus") p.delete("mode");
    else p.set("mode", m);
    // Switching mode drops a stale theme selection from the other guided flow.
    if (m === "fokus") p.delete("theme");
    setParams(p);
    setHubView("write");
  };

  // Login wall: stash the draft (survives OAuth redirect) and nudge sign-in.
  const requireAuthFokus = (sentence: string) => {
    saveWritingDraft({ mode: "fokus", text: sentence, resume: true });
    setAuthOpen(true);
  };
  const requireAuthGuided = (payload: { theme: ThemeId; length: WritingLength; text: string }) => {
    saveWritingDraft({
      mode: payload.length === "long" ? "lang" : "kurz",
      theme: payload.theme,
      length: payload.length,
      text: payload.text,
      resume: true,
    });
    setAuthOpen(true);
  };

  // After sign-in, restore the in-progress draft where the learner left off (the
  // learner presses the action again themselves, so no surprise auto-evaluation).
  useEffect(() => {
    if (!isSignedIn) return;
    const draft = loadWritingDraft();
    if (!draft) return;
    const p = new URLSearchParams(params);
    if (draft.mode === "fokus") {
      p.delete("mode");
      p.delete("theme");
    } else {
      p.set("mode", draft.mode === "lang" ? "lang" : "kurz");
      if (draft.theme) p.set("theme", draft.theme);
    }
    setParams(p, { replace: true });
    setResumeText(draft.text);
    clearWritingDraft();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const handleAuthOpenChange = (open: boolean) => {
    setAuthOpen(open);
    // Dismissed without signing in: drop the pending resume.
    if (!open && useAuthStore.getState().status !== "signedIn") {
      clearWritingDraft();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <p className="text-eyebrow text-primary">
          {mode === "fokus" ? "Satzlabor" : "KI-Schreibcoach"}
        </p>
        <h1 className="text-display text-2xl sm:text-3xl">Schreiben</h1>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <WritingModeSwitcher value={mode} onChange={setMode} />
        {/* Verlauf toggle (writing history is guided-mode data). */}
        <div className="flex gap-1 rounded-xl border border-border bg-muted/30 p-1">
          <button
            onClick={() => setHubView("write")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              hubView === "write"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <PenLine className="h-3.5 w-3.5" /> Schreiben
          </button>
          <button
            onClick={() => setHubView("history")}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              hubView === "history"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <History className="h-3.5 w-3.5" /> Verlauf
          </button>
        </div>
      </div>

      {hubView === "history" ? (
        <WritingHistory />
      ) : mode === "fokus" ? (
        <FokusTrainer
          isSignedIn={isSignedIn}
          onRequireAuth={requireAuthFokus}
          initialText={resumeText}
        />
      ) : (
        <GuidedWritingTrainer
          length={lengthOf(mode)}
          isSignedIn={isSignedIn}
          onRequireAuth={requireAuthGuided}
          initialText={resumeText}
        />
      )}

      <AuthDialog open={authOpen} onOpenChange={handleAuthOpenChange} intent="signup" />
    </div>
  );
}
