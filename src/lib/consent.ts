import { useSettingsStore } from "@/store/useSettingsStore";
import { PRIVACY_LAST_UPDATED_ISO } from "@/lib/legalMeta";

/**
 * Version of the legal terms (AGB + Datenschutzerklärung) a user consents to.
 * IMPORTANT: keep this in lockstep with `PRIVACY_LAST_UPDATED_ISO` in
 * `src/lib/legalMeta.ts` (the date the legal pages render). When the legal copy
 * materially changes, bump both to the same value so we can detect
 * `consentVersion !== CONSENT_VERSION` and prompt existing users to re-consent.
 * `consentInSync()` (admin Launch §G2) and `tests/consent.test.ts` guard the
 * lockstep.
 */
export const CONSENT_VERSION = "2026-06-08";

/**
 * G2 consent-drift check: true when the consent version matches the legal
 * pages' last-updated date. False means one was bumped without the other, which
 * would leave users consented to a version that no longer matches the pages.
 */
export function consentInSync(): boolean {
  return CONSENT_VERSION === PRIVACY_LAST_UPDATED_ISO;
}

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
