import { create } from "zustand";

/** Transient, non-persisted UI/session state (cleared on reload). */
interface SessionState {
  /** Toast-style ephemeral messages. */
  toast: { id: string; message: string; tone: "default" | "success" | "warning" } | null;
  showToast: (message: string, tone?: "default" | "success" | "warning") => void;
  clearToast: () => void;

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

  focusMode: false,
  setFocusMode: (on) => set({ focusMode: on }),
}));
