import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLangProvider } from "./adminI18n";
import { AdminShell } from "./AdminShell";
import { AdminOverview } from "./AdminOverview";
import { AdminPlaceholder } from "./AdminPlaceholder";
import { Pruefmodus } from "./Pruefmodus";
import { AdminFeedback } from "./AdminFeedback";
import { AdminSystem } from "./AdminSystem";
import { AdminLaunch } from "./AdminLaunch";

/**
 * The admin control center, mounted at `/admin/*` as a single lazy chunk (every
 * admin module imports from here, so nothing admin-related touches the eager
 * main bundle). Descendant routing lives here rather than in the top-level
 * data router so the whole feature stays in one dynamic import; later chunks
 * swap the placeholders below for their real screens.
 *
 * The founder gate is applied by <RequireFounder> in router.tsx (client
 * cosmetic gate); the real boundary is server-side RLS/RPC.
 */
export function AdminApp() {
  return (
    <AdminLangProvider>
      <Routes>
        <Route element={<AdminShell />}>
          <Route index element={<AdminOverview />} />
          <Route path="pruefen" element={<Pruefmodus />} />
          <Route path="feedback" element={<AdminFeedback />} />
          <Route path="inhalte" element={<AdminPlaceholder titleDe="Inhalte" titleEn="Content" />} />
          <Route path="nutzer" element={<AdminPlaceholder titleDe="Nutzer" titleEn="Audience" />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="steuerung" element={<AdminPlaceholder titleDe="Steuerung" titleEn="Controls" />} />
          <Route path="launch" element={<AdminLaunch />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </AdminLangProvider>
  );
}
