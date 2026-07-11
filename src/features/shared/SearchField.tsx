import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Debounced search input, extracted from BrowseToolbar so the desktop
 * FilterRail can share the exact same behavior. Typing stays local and
 * instant; the (potentially expensive) list filter behind onSearch runs
 * debounced. Two pages also write the query to the URL, so this additionally
 * keeps history.replaceState off the per-keystroke path (Safari rate-limits
 * it and throws when exceeded).
 */
export function SearchField({
  value: external,
  onChange,
  placeholder = "Suchen …",
  className,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  const [value, setValue] = useState(external);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(external);

  const flush = (v: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    lastSentRef.current = v;
    onChange(v);
  };

  const handleChange = (v: string) => {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => flush(v), 180);
  };

  // Adopt external changes (deep link, scope chip clearing the query) without
  // clobbering in-flight typing: only sync when the prop moved on its own.
  useEffect(() => {
    if (external !== lastSentRef.current) {
      lastSentRef.current = external;
      setValue(external);
    }
  }, [external]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        // Opt-in only; the field mounts on an explicit search tap, so focusing
        // it immediately is the expected behavior.
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-lg border border-input bg-surface py-2 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
      {value && (
        <button
          onClick={() => {
            setValue("");
            flush("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
