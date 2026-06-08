import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useSettingsStore, type ThemeMode } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

const options: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Hell" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dunkel" },
];

/**
 * Collapsed theme switcher: shows only the active theme's icon to save space in
 * the top bar. The full set of options is revealed on hover (pointer devices)
 * or on tap (touch) — and closes on selection, outside click, or Escape.
 */
export function ThemeToggle() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === themeMode),
  );
  const active = options[activeIndex];
  const ActiveIcon = active.icon;

  // The collapsed trigger shows the active option's icon, so the panel has to
  // line up that option (not the middle one) under the trigger. Each option is
  // 34px wide (w-8 button + gap-0.5), so shift the centered panel by the
  // active option's distance from the middle.
  const panelOffsetX = (1 - activeIndex) * 34;

  const choose = (value: ThemeMode) => {
    setSettings({ themeMode: value });
    setOpen(false);
  };

  return (
    <div ref={ref} className="group relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Design ändern"
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <ActiveIcon className="h-4 w-4" />
      </button>

      {/* pt-2 acts as an invisible hover bridge so the panel stays reachable */}
      <div
        style={{ transform: `translateX(calc(-50% + ${panelOffsetX}px))` }}
        className={cn(
          "absolute left-1/2 top-full z-50 pt-2 group-hover:block",
          open ? "block" : "hidden",
        )}
      >
        <div
          role="menu"
          className="flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5 shadow-lg"
        >
          {options.map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => choose(value)}
              aria-label={label}
              aria-pressed={themeMode === value}
              title={label}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                themeMode === value
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
