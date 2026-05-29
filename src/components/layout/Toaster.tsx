import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { useSessionStore } from "@/store/useSessionStore";
import { cn } from "@/lib/utils";

const icons = {
  default: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
};

export function Toaster() {
  const toast = useSessionStore((s) => s.toast);
  const clearToast = useSessionStore((s) => s.clearToast);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(clearToast, 2600);
    return () => clearTimeout(t);
  }, [toast, clearToast]);

  const Icon = toast ? icons[toast.tone] : Info;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium shadow-elevated",
              toast.tone === "success" && "text-success",
              toast.tone === "warning" && "text-warning",
            )}
          >
            <Icon className="h-4 w-4" />
            <span className="text-foreground">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
