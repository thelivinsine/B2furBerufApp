/**
 * The ONE definition of what makes a Leitpunkt DEMAND argumentation (s200, from
 * the s199 writing-task audit §4, fix P2).
 *
 * `evaluate-writing` is told to grade "streng auf B2-/C1-Niveau" from the task's
 * `level`, and it grades Aufgabenerfüllung against the Leitpunkte. When an
 * argumentative Textsorte carries only descriptive Leitpunkte, a learner who
 * covers all of them exactly has described, empathised, proposed and delegated,
 * but never argued, and the grader marks them down for something the brief never
 * asked. That is the one failure mode a Leitpunkt-based brief exists to prevent.
 *
 * **A point is ARGUMENTATIVE when it cannot be answered without producing a
 * reason, a consequence, or a stance.** All three count as one demand, because
 * the Textsorten make it in different registers and each is a real argument:
 * "Begründen Sie, warum das Training nötig ist" (reason), "Erklären Sie, was das
 * für den Kassenabschluss bedeutet" (consequence, the whole job of a complaint),
 * "Geben Sie eine Empfehlung" (stance). A first cut demanded a STANCE marker
 * specifically from every Stellungnahme and failed `wt_safety_l04`, whose points
 * are "Begründen Sie …", "Legen Sie dar …", "Entkräften Sie den Einwand …". A
 * gate that fails the most argumentative task in the pool is measuring the
 * wrong thing.
 *
 * Naming a fact is NOT enough, which is why bare `grund` is absent ("Nennen Sie
 * den Grund." states a cause in one clause and a B1 writer does it without
 * arguing) while `begründ` is present.
 *
 * **Matching is PHRASE-LEVEL over the whole Leitpunkt, never keyed on the
 * opening verb** (audit §9). German carries the meaning in the separable prefix
 * at the end of the clause: "**Legen** Sie dar, warum die Forderung unbegründet
 * ist" opens on `legen` and is exactly the argumentative move. An opening-verb
 * classifier scored 9 of 11 `widerspruch` tasks as unargumentative; the
 * phrase-level one scores 1. Getting this wrong cost a re-run in s199, so a new
 * marker goes in as a whole-clause pattern.
 *
 * When a genuinely argumentative formulation is missing here, ADD IT rather than
 * rewording the task around the classifier: the lexicon grows with the bank,
 * exactly like `scripts/sector-markers.mjs`. What must NOT happen is a pattern
 * loose enough for description to pass, because then the gate reads green over
 * the very defect it exists to catch.
 *
 * @type {RegExp[]}
 */
export const JUSTIFICATION_PATTERNS = [
  // --- Give a reason -------------------------------------------------------
  // `begründ` covers begründen / Begründung / begründet and, as a substring,
  // the "unbegründet" a Widerspruch argues against.
  /begründ/,
  /\bwarum\b/,
  /\bweshalb\b/,
  /\bwieso\b/,
  /aus welchem grund/,
  /mit welcher begründung/,
  /rechtfertig/,
  // "Legen Sie dar, ..." — the separable-prefix case that broke the first
  // classifier. `darlegen` in any finite order, never bare "dar".
  /\bdarlegen\b/,
  /\bdarzulegen\b/,
  /legen sie[^.?!]{0,60}\bdar\b/,

  // --- Name what it costs --------------------------------------------------
  // The point that turns a complaint into a B2 complaint: it connects the
  // situation to its effect, which is what earns the demand at the end.
  // Deliberately verb-blind, because "Benennen Sie das Risiko für die
  // Bewohnerin" and "Erläutern Sie die Folgen für den Releasetermin" are the
  // same pedagogical act.
  /konsequenz/,
  // The noun, never the imperative: "Folgen Sie der Anleitung" is an
  // instruction to comply, the opposite of naming what something costs.
  /\bfolgen?\b(?!\s+sie\b)/,
  /auswirk/,
  /\brisiko\b/,
  /\brisiken\b/,
  /\bgefahr(en)?\b/,
  /bedeutet|bedeuten/,
  /für[^.?!]{0,40}\bheißt\b/,
  /\bgekostet\b/,
  /\bkostet\b/,
  /\bdadurch\b/,
  /\bführt dazu\b/,
  /zur folge/,

  // --- Take a stance -------------------------------------------------------
  /aus ihrer sicht/,
  /ihrer meinung nach/,
  /ihre (persönliche |eigene )?meinung/,
  /ihre position/,
  /ihren standpunkt/,
  /nehmen sie stellung/,
  /stellung zu nehmen/,
  /beziehen sie position/,
  /sprechen sie sich (für|gegen|dafür|dagegen)/,
  /plädier/,
  /argumentier/,
  /überzeug/,
  /empfehl/,
  /befürwort/,
  /\braten sie\b/,

  // --- Weigh the other side ------------------------------------------------
  /abwäg/,
  /abzuwägen/,
  /wägen sie/,
  /gegenargument/,
  /gegenposition/,
  /\beinwand\b/,
  /\beinwände/,
  /entkräft/,
  /widerleg/,
  /vor- und nachteile/,
  /\bvorteile\b/,
  /\bnachteile\b/,
  /pro und contra/,
  /was (dafür|dagegen|für|gegen)[^.?!]{0,40}spricht/,
  /spricht[^.?!]{0,40}(dafür|dagegen)/,
  /setzen sie sich[^.?!]{0,60}auseinander/,

  // --- Judge ---------------------------------------------------------------
  /bewerten sie/,
  /\bbewertung\b/,
  /beurteil/,
  /\bfazit\b/,
  /ziehen sie[^.?!]{0,40}bilanz/,
  /wie sinnvoll/,
  /für wie[^.?!]{0,30}(sinnvoll|realistisch|wichtig|geeignet)/,
  /halten sie[^.?!]{0,40}\bfür\b/,
];

/** Does this single Leitpunkt force a reason, a consequence or a stance? */
export function isJustifyingPoint(point) {
  const text = String(point ?? "").toLowerCase();
  return JUSTIFICATION_PATTERNS.some((re) => re.test(text));
}

/** The Leitpunkte of a task that force argumentation. */
export function justifyingPoints(task) {
  return (task?.points ?? []).filter(isJustifyingPoint);
}

/**
 * The Textsorten that are argumentative BY DEFINITION: a Stellungnahme states a
 * position, a Forumsbeitrag answers one, a Widerspruch contests a decision, a
 * Beschwerde has to earn its demand. A B1 task is exempt, because at B1 the job
 * is to state a wish clearly, not to argue for it, and the audit's ladder (86%
 * of B1 tasks carry no justification point) describes a bank that is right
 * about that.
 */
export const ARGUMENTATIVE_FORMATS = ["stellungnahme", "forumsbeitrag", "widerspruch", "beschwerde"];

/** B2 and above, on the coarse band the Niveau filter uses. */
function isB2OrAbove(level) {
  return typeof level === "string" && (level.startsWith("B2") || level.startsWith("C1"));
}

/**
 * Does the rule apply to this task? An argumentative Textsorte at B2 or above.
 * A task with no `points` is not servable at all and is left to the
 * servability check, which owns that error.
 */
export function needsJustification(task) {
  return (
    ARGUMENTATIVE_FORMATS.includes(task?.format) &&
    isB2OrAbove(task?.level) &&
    Array.isArray(task?.points) &&
    task.points.length > 0
  );
}

/** The gate: an argumentative B2+ task carries at least one argumentative point. */
export function meetsJustificationRule(task) {
  return !needsJustification(task) || justifyingPoints(task).length > 0;
}
