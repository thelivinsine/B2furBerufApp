import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useSettingsStore } from "@/store/useSettingsStore";

export function App() {
  const themeMode = useSettingsStore((s) => s.themeMode);

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

  return <RouterProvider router={router} />;
}
