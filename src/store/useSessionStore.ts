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
}));
