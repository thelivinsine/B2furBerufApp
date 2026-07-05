import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { router } from "./router";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useAuthStore } from "@/store/useAuthStore";

export function App() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const initAuth = useAuthStore((s) => s.init);

  // Restore the Supabase session and start cloud sync (offline-first).
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else if (themeMode === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      if (mq.matches) root.classList.add("dark");
      else root.classList.remove("dark");
    }
  }, [themeMode]);

  // MotionConfig makes the Settings "Animationen reduzieren" toggle real (it
  // was previously written but never read) and honours the OS-level
  // prefers-reduced-motion preference by default.
  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
      <RouterProvider router={router} />
    </MotionConfig>
  );
}
