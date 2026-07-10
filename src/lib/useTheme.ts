import { useEffect, useState } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * The resolved light/dark state as a reactive boolean, for surfaces that pick
 * colors in JS rather than via Tailwind `dark:` classes (e.g. the canvas-drawn
 * Neuland map). Mirrors `useApplyTheme`'s resolution and updates on both the
 * stored preference and system changes while on "system".
 */
export function useIsDark(): boolean {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const [isDark, setIsDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const compute = () => themeMode === "dark" || (themeMode === "system" && mql.matches);
    setIsDark(compute());
    if (themeMode === "system") {
      const on = () => setIsDark(compute());
      mql.addEventListener("change", on);
      return () => mql.removeEventListener("change", on);
    }
  }, [themeMode]);
  return isDark;
}

/** Applies the persisted theme preference to <html> and reacts to system changes. */
export function useApplyTheme() {
  const themeMode = useSettingsStore((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = themeMode === "dark" || (themeMode === "system" && mql.matches);
      root.classList.toggle("dark", dark);
    };

    apply();
    if (themeMode === "system") {
      mql.addEventListener("change", apply);
      return () => mql.removeEventListener("change", apply);
    }
  }, [themeMode]);
}
