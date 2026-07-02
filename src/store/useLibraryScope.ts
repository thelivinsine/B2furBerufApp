import { create } from "zustand";

/**
 * Shared library scope (UX overhaul Phase 3, Tier 2). The learner's one
 * deliberate "where am I" choice, kept as **app state** rather than page state:
 * pick a theme (optionally a sub-theme) once and the library segments follow it
 * until it's changed. Deliberately in-memory (not persisted): it's a browse
 * context for the current visit, and URL params still override it for shareable
 * deep links. `theme === "all"` means no active scope.
 */
interface LibraryScopeState {
  /** Active ThemeId, or "all" for no scope. */
  theme: string;
  /** Active sub-theme id, or "" for none. Only the Vokabeltrainer uses it. */
  sub: string;
  setScope: (theme: string, sub?: string) => void;
  clear: () => void;
}

export const useLibraryScope = create<LibraryScopeState>((set) => ({
  theme: "all",
  sub: "",
  setScope: (theme, sub = "") => set({ theme, sub }),
  clear: () => set({ theme: "all", sub: "" }),
}));
