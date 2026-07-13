import { supabase, SUPABASE_CONFIGURED } from "./supabase";

export interface FeedbackInput {
  message: string;
  /** Optional reply-to address the learner typed in. */
  email?: string;
  /** Route the feedback was sent from (for context in the founder's inbox). */
  page?: string;
}

export interface FeedbackResult {
  ok: boolean;
  message?: string;
}

/**
 * Send in-app feedback. Calls the `submit-feedback` Edge Function, which stores
 * the message and emails the founder. Works for anonymous users too (auth is
 * optional server-side), so we do NOT create a guest session first.
 *
 * The app is offline-first and this is best-effort: if Supabase is not
 * configured or the call fails, we surface a soft error and never throw.
 */
export async function submitFeedback(input: FeedbackInput): Promise<FeedbackResult> {
  if (!SUPABASE_CONFIGURED) {
    return { ok: false, message: "Feedback ist gerade nicht verfügbar." };
  }
  try {
    const { data, error } = await supabase.functions.invoke<FeedbackResult>(
      "submit-feedback",
      { body: input },
    );
    if (error) {
      return { ok: false, message: "Konnte nicht gesendet werden. Bitte später erneut versuchen." };
    }
    return data ?? { ok: true };
  } catch {
    return { ok: false, message: "Verbindung fehlgeschlagen. Bitte später erneut versuchen." };
  }
}
