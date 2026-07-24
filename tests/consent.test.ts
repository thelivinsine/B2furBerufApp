import { describe, it, expect } from "vitest";
import { CONSENT_VERSION, consentInSync } from "@/lib/consent";
import { PRIVACY_LAST_UPDATED_ISO } from "@/lib/legalMeta";

/**
 * G2 consent-drift gate (admin control center chunk 12). This is the CI form of
 * the runtime lockstep assert: if someone bumps the legal pages' last-updated
 * date without bumping CONSENT_VERSION (or vice versa), this fails so a
 * re-consent prompt can never silently fall out of sync.
 */
describe("consent lockstep (§G2)", () => {
  it("CONSENT_VERSION matches the legal last-updated date", () => {
    expect(CONSENT_VERSION).toBe(PRIVACY_LAST_UPDATED_ISO);
  });

  it("consentInSync() reports true when they match", () => {
    expect(consentInSync()).toBe(true);
  });
});
