import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { ThemeId } from "@/types";
import type { WritingLength } from "@/lib/writing";
import { WritingHistory } from "./WritingHistory";
import { WritingModeSwitcher, type WritingTab } from "./WritingModeSwitcher";
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

const TABS: WritingTab[] = ["fokus", "kurz", "lang", "verlauf"];
function isTab(v: string | null): v is WritingTab {
  return !!v && (TABS as string[]).includes(v);
}
const lengthOf = (mode: WritingMode): WritingLength => (mode === "lang" ? "long" : "short");

/**
 * Schreiben hub (Bibliothek-extension redesign, s148; original plan:
 * docs/plans/SCHREIBTRAINING_REDESIGN_PLAN.md). The 4-segment switcher IS the
 * page header (the s92 Bibliothek rule, no eyebrow/H1), routing between:
 *   - Fokus: the single-sentence write -> correct -> transform grammar lab.
 *   - Kurz / Lang: the guided B2-Beruf writing tasks (random Aufgabe pools).
 *   - Verlauf: the writing-evaluation history (guided modes only).
 * Owns the login wall (writing needs a real account) + the draft-resume flow
 * that survives the Google OAuth full-page redirect.
 */
export function WritingHub() {
  const [params, setParams] = useSearchParams();
  const rawMode = params.get("mode");
  const tab: WritingTab = isTab(rawMode) ? rawMode : "fokus";

  const status = useAuthStore((s) => s.status);
  const isSignedIn = status === "signedIn";
  const [authOpen, setAuthOpen] = useState(false);
  const [resumeText, setResumeText] = useState("");

  const setTab = (t: WritingTab) => {
    const p = new URLSearchParams(params);
    if (t === "fokus") p.delete("mode");
    else p.set("mode", t);
    // Switching surface drops stale guided-flow scopes (theme/sub/Branche).
    if (t === "fokus" || t === "verlauf") {
      p.delete("theme");
      p.delete("sub");
      p.delete("sector");
    }
    setParams(p);
  };

  // Login wall: stash the draft (survives OAuth redirect) and nudge sign-in.
  const requireAuthFokus = (sentence: string) => {
    saveWritingDraft({ mode: "fokus", text: sentence, resume: true });
    setAuthOpen(true);
  };
  const requireAuthGuided = (payload: {
    theme: ThemeId;
    length: WritingLength;
    text: string;
    promptIndex?: number;
  }) => {
    saveWritingDraft({
      mode: payload.length === "long" ? "lang" : "kurz",
      theme: payload.theme,
      length: payload.length,
      text: payload.text,
      promptIndex: payload.promptIndex,
      resume: true,
    });
    setAuthOpen(true);
  };

  // After sign-in, restore the in-progress draft where the learner left off (the
  // learner presses the action again themselves, so no surprise auto-evaluation).
  const [resumePromptIndex, setResumePromptIndex] = useState<number | undefined>(undefined);
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
    setResumePromptIndex(draft.promptIndex);
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
      {/* No page header: the switcher names the section (Bibliothek rule, s92).
          Content-column width on desktop, level with the trainer grids below. */}
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-8">
        <div className="lg:col-start-1">
          {/* Capped + centered on desktop (founder s149: full column width with
              four short labels read oversized); mobile stays full width. */}
          <WritingModeSwitcher value={tab} onChange={setTab} className="lg:mx-auto lg:max-w-xl" />
        </div>
      </div>

      {tab === "verlauf" ? (
        // Verlauf keeps the same content column as the other tabs (the grid's
        // col 1), so the page width never jumps between tabs (s149 audit).
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_16rem] lg:gap-x-8">
          <div className="min-w-0 lg:col-start-1">
            <WritingHistory />
          </div>
        </div>
      ) : tab === "fokus" ? (
        <FokusTrainer
          isSignedIn={isSignedIn}
          onRequireAuth={requireAuthFokus}
          initialText={resumeText}
        />
      ) : (
        <GuidedWritingTrainer
          length={lengthOf(tab)}
          isSignedIn={isSignedIn}
          onRequireAuth={requireAuthGuided}
          initialText={resumeText}
          initialPromptIndex={resumePromptIndex}
        />
      )}

      <AuthDialog open={authOpen} onOpenChange={handleAuthOpenChange} intent="signup" />
    </div>
  );
}
