import { create } from "zustand";
import type { ContentScope } from "@/engine/session";

/** Transient, non-persisted UI/session state (cleared on reload). */
interface SessionState {
  /** Toast-style ephemeral messages. */
  toast: { id: string; message: string; tone: "default" | "success" | "warning" } | null;
  showToast: (message: string, tone?: "default" | "success" | "warning") => void;
  clearToast: () => void;

  /**
   * Bibliothek Üben hand-off (2026-07-13): when a browse tab's "Üben" button is
   * pressed, it stashes the tab's content type + the exact filtered item ids
   * here and navigates to `/session?src=lib`, so the composed session practises
   * ONLY that tab's filtered content. Transient (not deep-linkable): a refresh
   * of `/session?src=lib` with an empty hand-off falls back to a normal session.
   */
  librarySession: { type: ContentScope; ids: string[] } | null;
  setLibrarySession: (v: { type: ContentScope; ids: string[] } | null) => void;

  /**
   * Feedback dialog open state (2026-07-13). One dialog is mounted app-wide
   * (AppShell) and every feedback affordance — the desktop pill, the mobile
   * icon beside Üben, the in-session button — just flips this flag, so the
   * "Mit KI gebaut / Feedback" entry can live in many places without
   * duplicating the dialog.
   */
  feedbackOpen: boolean;
  setFeedbackOpen: (open: boolean) => void;

  /**
   * Focus mode (redesign Phase 2.1): the composed session is a full-screen
   * stage, so the SessionPlayer sets this true while a block is on screen and
   * false on the end/empty screen. AppShell reads it to hide the header, bottom
   * tab bar and sidebar without touching the locked bar internals.
   */
  focusMode: boolean;
  setFocusMode: (on: boolean) => void;

  /**
   * The Prüfung zone's ONE way out (founder s195: "the zurück button for
   * untimed exercises and verlassen (red) button for timed exercises ... should
   * always be on the top right corner"). Every screen in the zone registers it
   * and AppShell renders it in that one corner, at every width: the exam parts,
   * the Anleitung and the Ergebnis, the Schreibtrainer and the Sprechtrainer.
   * Before s195 there were four different controls in three positions, and two
   * screens had none at all.
   *
   * A callback rather than a route for two reasons: the exam owns its confirm
   * dialog and its copy, and AppShell is eager code that must never import
   * `useExamStore`, which pulls the content banks in through the composer (the
   * keep-eager-code-light invariant). `tone` travels with it for the same
   * reason: only the runner knows whether a clock is running.
   */
  zoneExit: { run: () => void; tone: "quiet" | "danger" } | null;
  setZoneExit: (v: { run: () => void; tone: "quiet" | "danger" } | null) => void;

  /**
   * Exam chrome (s186, founder): while a Modelltest run is on screen the mobile
   * bottom bar is hidden and the header drops the streak pill and account menu,
   * so nothing competes with the task; the header keeps the logo and the one
   * exit above.
   *
   * Separate from `zoneExit` since s195, because the trainers now register an
   * exit too and they are ordinary pages that keep their nav.
   */
  examStage: boolean;
  setExamStage: (on: boolean) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  toast: null,
  showToast: (message, tone = "default") =>
    set({ toast: { id: Math.random().toString(36).slice(2), message, tone } }),
  clearToast: () => set({ toast: null }),

  librarySession: null,
  setLibrarySession: (v) => set({ librarySession: v }),

  feedbackOpen: false,
  setFeedbackOpen: (open) => set({ feedbackOpen: open }),

  focusMode: false,
  setFocusMode: (on) => set({ focusMode: on }),

  zoneExit: null,
  setZoneExit: (v) => set({ zoneExit: v }),

  examStage: false,
  setExamStage: (on) => set({ examStage: on }),
}));
