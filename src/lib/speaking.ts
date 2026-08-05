import { supabase } from "@/lib/supabase";
import { TURNSTILE_ENABLED, useAuthStore } from "@/store/useAuthStore";
import { reportServerAllowance } from "@/lib/aiAllowance";
import { redemittelCategories } from "@/data/redemittel";
import type { ConversationBrief } from "@/types";

/** The model is sent the German label, not the raw enum id, so its verdict is
 *  about a thing a learner could actually do. */
const CATEGORY_LABEL_DE = new Map(redemittelCategories.map((c) => [c.id, c.labelDe]));

/**
 * Client for the `converse` Edge Function (s193), which holds every secret.
 * Same shape and same failure discipline as `lib/writing.ts`: speaking needs an
 * authenticated user, so a fully signed-out learner is given a guest session
 * first, and every response reports the daily allowance so the trainer can
 * print "Heute noch N von M" without a second round trip.
 */

export interface TurnResult {
  ok: boolean;
  reply?: string;
  turnsLeft?: number;
  conversationOver?: boolean;
  limitReached?: boolean;
  message?: string;
}

export interface DebriefResult {
  ok: boolean;
  /** One boolean per brief goal, in the brief's order. */
  goalsMet?: boolean[];
  /**
   * One boolean per target Redemittel category, in the brief's order. Reported
   * by the model rather than inferred: a learner who makes a suggestion does
   * not say the words "Vorschläge machen", so matching the category label
   * against the transcript would be theatre.
   */
  redemittelUsed?: boolean[];
  insight?: string;
  insightEn?: string | null;
  /** What the learner said, joined; the left side of the correction diff. */
  original?: string;
  /** The same sentences, minimally repaired; the right side of the diff. */
  corrected?: string;
  /** 0-100, exam runs only. */
  score?: number | null;
  limitReached?: boolean;
  message?: string;
}

/** The bounded subset of the brief the function needs to build its prompt. */
function wireBrief(brief: ConversationBrief) {
  return {
    id: brief.id,
    title: brief.title,
    partnerName: brief.partner.name,
    partnerRole: brief.partner.role,
    register: brief.partner.register,
    situation: brief.situation,
    goals: brief.goals,
    level: brief.level,
    stage: brief.stage,
    exam: brief.exam,
    redemittel: brief.targetRedemittel.map((r) => CATEGORY_LABEL_DE.get(r) ?? r),
  };
}

async function ensureSession(): Promise<string | null> {
  const auth = useAuthStore.getState();
  if (auth.status === "signedOut" || !auth.session) {
    if (TURNSTILE_ENABLED) {
      return "Bitte melde dich an, um mit der KI zu sprechen.";
    }
    await auth.signInAsGuest();
  }
  return null;
}

/**
 * Ask the partner for its next line. Pass an empty `utterance` to open the
 * conversation, which is how the partner gets to speak first.
 */
export async function speakTurn(input: {
  conversationId: string;
  brief: ConversationBrief;
  utterance: string;
}): Promise<TurnResult> {
  const blocked = await ensureSession();
  if (blocked) return { ok: false, message: blocked };

  try {
    const { data, error } = await supabase.functions.invoke<TurnResult & {
      dailyLimit?: number;
      dailyRemaining?: number;
    }>("converse", {
      body: {
        mode: "turn",
        conversationId: input.conversationId,
        brief: wireBrief(input.brief),
        utterance: input.utterance,
      },
    });
    if (error) {
      return {
        ok: false,
        message: "Deine Gesprächspartnerin ist gerade nicht erreichbar. Bitte versuche es erneut.",
      };
    }
    if (data) reportServerAllowance("sprechen", data.dailyLimit, data.dailyRemaining);
    return data ?? { ok: false, message: "Keine Antwort erhalten." };
  } catch {
    return {
      ok: false,
      message: "Verbindung fehlgeschlagen. Prüfe deine Internetverbindung und versuche es erneut.",
    };
  }
}

/** Close the conversation and grade it. One call, at the end. */
export async function requestDebrief(input: {
  conversationId: string;
  brief: ConversationBrief;
}): Promise<DebriefResult> {
  const blocked = await ensureSession();
  if (blocked) return { ok: false, message: blocked };

  try {
    const { data, error } = await supabase.functions.invoke<DebriefResult & {
      dailyLimit?: number;
      dailyRemaining?: number;
    }>("converse", {
      body: {
        mode: "debrief",
        conversationId: input.conversationId,
        brief: wireBrief(input.brief),
      },
    });
    if (error) {
      return {
        ok: false,
        message: "Die Rückmeldung ist momentan nicht verfügbar. Bitte versuche es später erneut.",
      };
    }
    if (data) reportServerAllowance("sprechen", data.dailyLimit, data.dailyRemaining);
    return data ?? { ok: false, message: "Keine Antwort erhalten." };
  } catch {
    return {
      ok: false,
      message: "Verbindung fehlgeschlagen. Prüfe deine Internetverbindung und versuche es erneut.",
    };
  }
}
