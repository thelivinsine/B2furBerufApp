import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useSettingsStore } from "@/store/useSettingsStore";
import { CONSENT_VERSION } from "@/lib/consent";
import { Onboarding } from "@/features/onboarding/Onboarding";

/**
 * s215: someone who already ticked the AGB/Datenschutz consent checkbox in
 * AuthDialog at signup saw it again here, pre-checked, on the very next
 * screen. `Onboarding.tsx` now renders the checkbox only when consent has not
 * already been recorded for the current `CONSENT_VERSION`.
 */

beforeEach(() => {
  useSettingsStore.getState().resetSettings();
});

afterEach(() => {
  cleanup();
  useSettingsStore.getState().resetSettings();
});

function renderOnboarding() {
  return render(
    <MemoryRouter initialEntries={["/start"]}>
      <Onboarding />
    </MemoryRouter>,
  );
}

describe("onboarding consent checkbox", () => {
  it("shows the AGB/Datenschutz checkbox when consent has not been recorded yet", () => {
    renderOnboarding();
    expect(screen.getByRole("checkbox")).toBeDefined();
  });

  it("hides the checkbox when consent was already recorded at signup, and does not re-block submit", () => {
    useSettingsStore.getState().setSettings({
      consentedAt: "2026-08-06T00:00:00.000Z",
      consentVersion: CONSENT_VERSION,
    });

    renderOnboarding();

    expect(screen.queryByRole("checkbox")).toBeNull();
    // The submit button gates on the same `consent` state the checkbox would
    // toggle; with consent pre-seeded from `hasConsented()`, it must not be
    // stuck disabled just because there is no checkbox left to click.
    const submit = screen.getByRole("button", { name: /los geht|let's go/i }) as HTMLButtonElement;
    expect(submit.disabled).toBe(false);
  });
});
