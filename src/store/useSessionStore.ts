import { create } from "zustand";

/** Transient, non-persisted UI/session state (cleared on reload). */
interface SessionState {
  /** Toast-style ephemeral messages. */
  toast: { id: string; message: string; tone: "default" | "success" | "warning" } | null;
  showToast: (message: string, tone?: "default" | "success" | "warning") => void;
  clearToast: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  toast: null,
  showToast: (message, tone = "default") =>
    set({ toast: { id: Math.random().toString(36).slice(2), message, tone } }),
  clearToast: () => set({ toast: null }),
}));
