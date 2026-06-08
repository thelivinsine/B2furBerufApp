import { useSettingsStore } from "@/store/useSettingsStore";

/**
 * Version of the legal terms (AGB + Datenschutzerklärung) a user consents to.
 * IMPORTANT: keep this in lockstep with the `LAST_UPDATED` date in
 * `src/features/legal/PrivacyPolicy.tsx` and `TermsOfService.tsx`. When the
 * legal copy materially changes, bump all three together so we can later detect
 * `consentVersion !== CONSENT_VERSION` and prompt existing users to re-consent.
 */
export const CONSENT_VERSION = "2026-06-08";

/**
 * Record that the user accepted the AGB + Datenschutzerklärung. Stored in the
 * settings store, which rides into `profiles.settings` (jsonb) via cloudSync's
 * `profileRow()` write-through once the user is authenticated. Idempotent: only
 * stamps a fresh timestamp the first time (or when the accepted version changes).
 */
export function recordConsent() {
  const { consentVersion, setSettings } = useSettingsStore.getState();
  if (consentVersion === CONSENT_VERSION) return;
  setSettings({
    consentedAt: new Date().toISOString(),
    consentVersion: CONSENT_VERSION,
  });
}

/** True once the user has accepted the current terms version. */
export function hasConsented(): boolean {
  return useSettingsStore.getState().consentVersion === CONSENT_VERSION;
}
