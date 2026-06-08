import { useEffect, useRef, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useSettingsStore, type ThemeMode } from "@/store/useSettingsStore";
import { cn } from "@/lib/utils";

const options: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
  { value: "light", icon: Sun, label: "Hell" },
  { value: "system", icon: Monitor, label: "System" },
  { value: "dark", icon: Moon, label: "Dunkel" },
];

export function ThemeToggle() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === themeMode),
  );
  const active = options[activeIndex];
  const ActiveIcon = active.icon;

  // Shift the panel so the active option sits under the trigger icon.
  // Each option slot is 34px (w-8 button + gap-0.5).
  const panelOffsetX = (1 - activeIndex) * 34;

  const choose = (value: ThemeMode) => {
    setSettings({ themeMode: value });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
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

      {open && (
        <div
          style={{ transform: `translateX(calc(-50% + ${panelOffsetX}px))` }}
          className="absolute left-1/2 top-full z-50 pt-2"
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
      )}
    </div>
  );
}
