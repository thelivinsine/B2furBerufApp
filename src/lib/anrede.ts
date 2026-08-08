/**
 * The ONE du/Sie rule (s202).
 *
 * A spoken task names a partner AND the register they address the learner with
 * (`SpeakingPartner.register`), so a phrase the learner is offered mid-conversation
 * has to fit that register: "Was hältst du davon, wenn …?" is simply the wrong
 * sentence to hand someone talking to their Teamleiterin who says Sie.
 *
 * The phrase bank cannot answer this on its own. `RedemittelPhrase.register` is
 * neutral/formal, which is about FORMALITY (how polished the wording is), not
 * about Anrede (which pronoun it commits to): "Dem stimme ich voll und ganz zu"
 * is formal and works with either, while "Da hast du völlig recht" is neutral and
 * only works with du. So the Anrede is derived from the text, here, once.
 *
 * Same law as the gap rule in `engine/blank.ts`: one implementation, one place.
 * Four copies of a text rule is how an ASCII `\b` silently disabled every
 * umlaut-initial word, and this rule is the same shape.
 */

export type Anrede = "du" | "sie";

/**
 * du markers. Case-insensitive: "du" is lowercase mid-sentence and capitalised
 * at the start, and the possessives inflect. Word boundaries matter more than
 * they look: without them "du" matches inside "durch" and "dir" inside "wird".
 */
const DU = /\b(du|dich|dir|dein|deine|deinem|deinen|deiner|deines)\b/i;

/**
 * Sie markers, deliberately CASE-SENSITIVE. Lowercase "sie" is she/they and
 * lowercase "ihr" is her/your-plural; only the capitalised forms are the formal
 * address. German capitalises nouns, never these pronouns, so a capital S here
 * cannot be anything else. Sentence-initial "Sie" is included on purpose ("Sie
 * müssen das Formular ausfüllen" is formal address, not a stray capital).
 */
const SIE = /\b(Sie|Ihnen|Ihr|Ihre|Ihrem|Ihren|Ihrer|Ihres)\b/;

/**
 * Which Anrede a phrase commits to, or `null` when it works with either.
 *
 * `null` is the common case and the right default: most Redemittel are built
 * around "wir" or an impersonal construction ("Als Kompromiss schlage ich vor,
 * …"), which is exactly why they are useful in both registers. A phrase carrying
 * BOTH markers also returns null: it is contradictory, and hiding it from both
 * registers would be a filter removing a phrase for being unclear.
 */
export function anredeOf(text: string): Anrede | null {
  const du = DU.test(text);
  const sie = SIE.test(text);
  if (du === sie) return null;
  return du ? "du" : "sie";
}

/** True when the phrase can be said to a partner using `register`. */
export function matchesAnrede(text: string, register: Anrede): boolean {
  const anrede = anredeOf(text);
  return anrede === null || anrede === register;
}
