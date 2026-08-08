import { motion, useReducedMotion } from "framer-motion";
import { useSlidingPill } from "@/features/shared/useSlidingPill";
import { cn } from "@/lib/utils";

/**
 * The Üben / Verlauf switcher every module page wears (s201).
 *
 * The founder asked for a Verlauf on all four modules, which means all four
 * need the same header. This is Sprechen's switcher, lifted out of it
 * unchanged: the app's sliding-pill mechanism (`useSlidingPill`, ONE always
 * mounted pill measured to the active segment, never a per-segment `layoutId`
 * crossfade, s114), on the grey squircle track with white controls, capped and
 * centred so two short labels do not stretch across the column.
 *
 * Schreiben keeps its own four-segment switcher: it has four modes, and its
 * geometry (`lg:max-w-xl`) is a founder pick from s149.
 */
export interface ModuleTab<T extends string> {
  id: T;
  label: string;
}

export function ModuleTabs<T extends string>({
  tabs,
  value,
  onSelect,
  ariaLabel,
}: {
  tabs: ModuleTab<T>[];
  value: T;
  onSelect: (id: T) => void;
  /** The module's name, so the tablist says which page it steers. */
  ariaLabel: string;
}) {
  const reduce = useReducedMotion();
  const { trackRef, registerItem, rect } = useSlidingPill(value);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const ix = tabs.findIndex((t) => t.id === value);
    const next =
      e.key === "ArrowRight" || e.key === "ArrowDown"
        ? (ix + 1) % tabs.length
        : e.key === "ArrowLeft" || e.key === "ArrowUp"
          ? (ix - 1 + tabs.length) % tabs.length
          : -1;
    if (next === -1) return;
    e.preventDefault();
    onSelect(tabs[next].id);
  };

  return (
    <div
      ref={trackRef as React.RefObject<HTMLDivElement>}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className="relative mx-auto flex w-full max-w-sm items-stretch gap-1 rounded-lg border border-border bg-muted p-1 shadow-soft lg:max-w-xs"
    >
      {rect && (
        <motion.span
          aria-hidden
          className="absolute bottom-1 left-0 top-1 rounded-md bg-surface shadow-soft"
          initial={false}
          animate={{ x: rect.left, width: rect.width }}
          transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
        />
      )}
      {tabs.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            ref={registerItem(t.id) as React.Ref<HTMLButtonElement>}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onSelect(t.id)}
            className={cn(
              "relative z-10 flex-1 rounded-md px-5 py-1.5 text-sm transition-colors",
              active
                ? "font-bold text-foreground"
                : "font-semibold text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
