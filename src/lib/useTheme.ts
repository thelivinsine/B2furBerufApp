import { useEffect } from "react";
import { useSettingsStore } from "@/store/useSettingsStore";

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
