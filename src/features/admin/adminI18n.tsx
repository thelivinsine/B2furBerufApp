import { createContext, useContext, useMemo, useState } from "react";

/**
 * Minimal bilingual (DE/EN) helper for the admin center. No i18n framework:
 * every string is authored inline as a `t(de, en)` pair, matching the pattern
 * the legal pages already use. The chosen language persists in localStorage so
 * the founder's choice survives reloads; DE is the default (admin copy is
 * founder-facing and German-first, like the rest of the app).
 */

export type AdminLang = "de" | "en";

const STORAGE_KEY = "b2beruf.adminLang";

interface AdminLangValue {
  lang: AdminLang;
  setLang: (lang: AdminLang) => void;
  /** Pick the string for the active language. */
  t: (de: string, en: string) => string;
}

const AdminLangContext = createContext<AdminLangValue | null>(null);

function readStored(): AdminLang {
  try {
    return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "de";
  } catch {
    return "de";
  }
}

export function AdminLangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AdminLang>(readStored);

  const value = useMemo<AdminLangValue>(
    () => ({
      lang,
      setLang: (next) => {
        setLangState(next);
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* storage disabled: keep the in-memory choice */
        }
      },
      t: (de, en) => (lang === "de" ? de : en),
    }),
    [lang],
  );

  return <AdminLangContext.Provider value={value}>{children}</AdminLangContext.Provider>;
}

export function useAdminLang(): AdminLangValue {
  const ctx = useContext(AdminLangContext);
  if (!ctx) throw new Error("useAdminLang must be used inside <AdminLangProvider>");
  return ctx;
}
