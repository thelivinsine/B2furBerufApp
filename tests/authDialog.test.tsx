import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import type { AuthOutcome } from "@/store/useAuthStore";

/**
 * Pins the three things the founder hit on the live sign-up (s174):
 *   1. the primary button sat disabled with no explanation,
 *   2. the password could not be revealed,
 *   3. signing up with an address that already had an account said "confirm
 *      your email" and closed the dialog, so a returning learner was told to
 *      wait for a mail Supabase never sends.
 */
const signUp = vi.fn<(...a: unknown[]) => Promise<AuthOutcome>>();
const signIn = vi.fn<(...a: unknown[]) => Promise<AuthOutcome>>();
const signInWithGoogle = vi.fn();
const resendConfirmation = vi.fn(async () => true);
const showToast = vi.fn();
let storeError: string | null = null;

vi.mock("@/store/useAuthStore", () => ({
  useAuthStore: () => ({
    busy: false,
    error: storeError,
    status: "signedOut",
    signUp,
    signIn,
    signInWithGoogle,
    resendConfirmation,
    clearError: () => {
      storeError = null;
    },
  }),
}));

vi.mock("@/store/useSessionStore", () => ({
  useSessionStore: (selector: (s: { showToast: typeof showToast }) => unknown) =>
    selector({ showToast }),
}));

const { AuthDialog } = await import("@/features/auth/AuthDialog");

const ok = (over: Partial<AuthOutcome> = {}): AuthOutcome => ({
  ok: true,
  needsConfirmation: false,
  alreadyRegistered: false,
  ...over,
});

/** Fill the form the way a learner would, leaving the consent box alone. */
function fillCredentials() {
  fireEvent.change(screen.getByPlaceholderText("du@beispiel.de"), {
    target: { value: "neu@example.com" },
  });
  fireEvent.change(screen.getByPlaceholderText("Mindestens 6 Zeichen"), {
    target: { value: "geheim123" },
  });
}

const submitButton = () => screen.getByRole("button", { name: "Konto erstellen", hidden: false });

beforeEach(() => {
  storeError = null;
  vi.clearAllMocks();
  signUp.mockResolvedValue(ok());
  signIn.mockResolvedValue(ok());
});
afterEach(cleanup);

describe("sign-up dialog", () => {
  it("keeps the primary button live and NAMES what is missing", async () => {
    render(<AuthDialog open onOpenChange={() => {}} />);
    // Nothing filled in: the button must still be pressable (a dead control
    // reads as a broken app), and pressing it must explain itself.
    const button = submitButton();
    expect(button.hasAttribute("disabled")).toBe(false);

    fireEvent.click(button);
    expect((await screen.findByRole("alert")).textContent).toContain("E-Mail-Adresse");
    expect(signUp).not.toHaveBeenCalled();

    fillCredentials();
    fireEvent.click(submitButton());
    // Credentials are fine now, so the consent box is the live blocker.
    expect((await screen.findByRole("alert")).textContent).toContain("AGB");
    expect(signUp).not.toHaveBeenCalled();
  });

  it("submits once consent is given", async () => {
    render(<AuthDialog open onOpenChange={() => {}} />);
    fillCredentials();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(submitButton());
    await waitFor(() => expect(signUp).toHaveBeenCalledWith("neu@example.com", "geheim123", undefined));
  });

  it("reveals the password on demand", () => {
    render(<AuthDialog open onOpenChange={() => {}} />);
    const field = screen.getByPlaceholderText("Mindestens 6 Zeichen");
    expect(field.getAttribute("type")).toBe("password");
    fireEvent.click(screen.getByLabelText("Passwort anzeigen"));
    expect(field.getAttribute("type")).toBe("text");
    fireEvent.click(screen.getByLabelText("Passwort verbergen"));
    expect(field.getAttribute("type")).toBe("password");
  });

  it("sends a known address to the log-in tab instead of a phantom confirmation", async () => {
    signUp.mockResolvedValue(ok({ alreadyRegistered: true }));
    const onOpenChange = vi.fn();
    render(<AuthDialog open onOpenChange={onOpenChange} />);
    fillCredentials();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(submitButton());

    expect((await screen.findByRole("alert")).textContent).toContain("schon ein Konto");
    // Switched to log-in, and the dialog stayed open so they can just continue.
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeDefined();
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it("holds the dialog open on a real confirmation, with a way to resend", async () => {
    signUp.mockResolvedValue(ok({ needsConfirmation: true }));
    const onOpenChange = vi.fn();
    render(<AuthDialog open onOpenChange={onOpenChange} />);
    fillCredentials();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(submitButton());

    // The address is shown, so the learner knows WHERE to look.
    expect(await screen.findByText("neu@example.com")).toBeDefined();
    expect(onOpenChange).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "E-Mail erneut senden" }));
    await waitFor(() => expect(resendConfirmation).toHaveBeenCalledWith("neu@example.com"));
  });

  it("offers the escape hatch on an unconfirmed log-in WITHOUT taking the form away", async () => {
    signIn.mockResolvedValue({ ok: false, needsConfirmation: true, alreadyRegistered: false });
    render(<AuthDialog open onOpenChange={() => {}} intent="login" />);
    fireEvent.change(screen.getByPlaceholderText("du@beispiel.de"), {
      target: { value: "neu@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Dein Passwort"), {
      target: { value: "geheim123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    expect(await screen.findByRole("button", { name: "E-Mail erneut senden" })).toBeDefined();
    // The regression this pins: swapping in the "check your inbox" panel here
    // removed the only way in AND claimed a mail had just been sent, so a stale
    // unconfirmed account read as "log-in is broken".
    expect(screen.getByPlaceholderText("Dein Passwort")).toBeDefined();
    expect(screen.getByRole("button", { name: "Anmelden" })).toBeDefined();
    expect(screen.queryByText(/Wir haben dir einen Link/)).toBeNull();
  });

  it("lets a successful log-in through even if no session came back on the payload", async () => {
    // `signIn` must derive needsConfirmation from the ERROR alone. A version
    // that also inferred it from a missing session answered a correct password
    // with "check your inbox" and never signed anyone in.
    signIn.mockResolvedValue({ ok: true, needsConfirmation: false, alreadyRegistered: false });
    const onOpenChange = vi.fn();
    render(<AuthDialog open onOpenChange={onOpenChange} intent="login" />);
    fireEvent.change(screen.getByPlaceholderText("du@beispiel.de"), {
      target: { value: "neu@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Dein Passwort"), {
      target: { value: "geheim123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Anmelden" }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(showToast).toHaveBeenCalledWith("Willkommen zurück!", "success");
  });
});
