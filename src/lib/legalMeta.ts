/**
 * Canonical "last updated" date for the legal pages, kept in ONE place so the
 * consent-drift check (admin Launch §G2 + `tests/consent.test.ts`) can compare
 * it against `CONSENT_VERSION`.
 *
 * When you materially change the Privacy Policy or Terms, bump BOTH the ISO date
 * here AND `CONSENT_VERSION` in `src/lib/consent.ts` to the same value, and edit
 * the prose below. `tests/consent.test.ts` FAILS if the two drift, and the admin
 * Launch screen shows a red warning, so a re-consent prompt can never silently
 * fall out of sync with the pages a user actually agreed to.
 */
export const PRIVACY_LAST_UPDATED_ISO = "2026-08-05";

/** Bilingual prose rendering of the date above, shown on the legal pages. */
export const PRIVACY_LAST_UPDATED: { de: string; en: string } = {
  de: "5. August 2026",
  en: "5 August 2026",
};
