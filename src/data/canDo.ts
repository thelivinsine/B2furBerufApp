import type { CanDoStatement } from "@/types";

/**
 * Can-Do milestones (UX overhaul Phase 4, plan E5.1). Two to three "Ich kann …"
 * statements per theme, pitched at ascending CEFR bands with ascending mastery
 * thresholds, so the Fortschritt page can show competence milestones instead of
 * raw counters.
 *
 * Authorship note (data governance): all statements are written in our own
 * German, aligned to the Council of Europe CEFR self-assessment descriptors
 * (cited in provenance, never reproduced). Goethe "Kann-Beschreibungen" remain
 * on the avoid list. AI-drafted then **founder-reviewed and approved
 * (2026-07-02)**: every provenance row is review_status "verified".
 */
export const canDoStatements: CanDoStatement[] = [
  /* ---------------- Besprechungen & Teamarbeit ---------------- */
  {
    id: "cd_meetings_1",
    themeId: "meetings",
    cefr: "B1.2",
    statement: "Ich kann in einer Besprechung meine Meinung äußern und auf Fragen reagieren.",
    en: "I can state my opinion in a meeting and respond to questions.",
    threshold: 0.25,
  },
  {
    id: "cd_meetings_2",
    themeId: "meetings",
    cefr: "B2.1",
    statement: "Ich kann eine Teambesprechung moderieren und die Ergebnisse zusammenfassen.",
    en: "I can moderate a team meeting and summarise the outcomes.",
    threshold: 0.5,
  },
  {
    id: "cd_meetings_3",
    themeId: "meetings",
    cefr: "B2.2",
    statement: "Ich kann in einer Diskussion Vor- und Nachteile abwägen und einen Beschluss herbeiführen.",
    en: "I can weigh pros and cons in a discussion and bring about a decision.",
    threshold: 0.75,
  },

  /* ---------------- Termine & Planung ---------------- */
  {
    id: "cd_scheduling_1",
    themeId: "scheduling",
    cefr: "B1.2",
    statement: "Ich kann einen Termin vereinbaren, verschieben oder absagen.",
    en: "I can arrange, postpone or cancel an appointment.",
    threshold: 0.3,
  },
  {
    id: "cd_scheduling_2",
    themeId: "scheduling",
    cefr: "B2.1",
    statement: "Ich kann einen Terminkonflikt diplomatisch lösen und Alternativen vorschlagen.",
    en: "I can resolve a scheduling conflict diplomatically and suggest alternatives.",
    threshold: 0.6,
  },

  /* ---------------- Logistik & Transport ---------------- */
  {
    id: "cd_logistics_1",
    themeId: "logistics",
    cefr: "B1.2",
    statement: "Ich kann eine Lieferung organisieren und den Lieferstatus erfragen.",
    en: "I can organise a delivery and ask about its status.",
    threshold: 0.3,
  },
  {
    id: "cd_logistics_2",
    themeId: "logistics",
    cefr: "B2.1",
    statement: "Ich kann bei Lieferproblemen reklamieren und eine Lösung aushandeln.",
    en: "I can complain about delivery problems and negotiate a solution.",
    threshold: 0.6,
  },

  /* ---------------- Kundenkommunikation ---------------- */
  {
    id: "cd_customer_1",
    themeId: "customer",
    cefr: "B1.2",
    statement: "Ich kann eine Kundenanfrage verstehen und höflich beantworten.",
    en: "I can understand a customer enquiry and answer it politely.",
    threshold: 0.25,
  },
  {
    id: "cd_customer_2",
    themeId: "customer",
    cefr: "B2.1",
    statement: "Ich kann eine Reklamation entgegennehmen und eine passende Lösung anbieten.",
    en: "I can take a complaint and offer a suitable solution.",
    threshold: 0.5,
  },
  {
    id: "cd_customer_3",
    themeId: "customer",
    cefr: "B2.2",
    statement: "Ich kann ein schwieriges Kundengespräch ruhig und professionell führen.",
    en: "I can handle a difficult customer conversation calmly and professionally.",
    threshold: 0.75,
  },

  /* ---------------- Konfliktlösung ---------------- */
  {
    id: "cd_conflict_1",
    themeId: "conflict",
    cefr: "B2.1",
    statement: "Ich kann ein Missverständnis ansprechen und klären, ohne den Ton zu verschärfen.",
    en: "I can raise and clear up a misunderstanding without escalating the tone.",
    threshold: 0.4,
  },
  {
    id: "cd_conflict_2",
    themeId: "conflict",
    cefr: "B2.2",
    statement: "Ich kann in einem Konflikt vermitteln und einen tragfähigen Kompromiss aushandeln.",
    en: "I can mediate in a conflict and negotiate a workable compromise.",
    threshold: 0.7,
  },

  /* ---------------- Projektkoordination ---------------- */
  {
    id: "cd_project_1",
    themeId: "project",
    cefr: "B1.2",
    statement: "Ich kann über den Stand eines Projekts berichten und die nächsten Schritte nennen.",
    en: "I can report on the state of a project and name the next steps.",
    threshold: 0.3,
  },
  {
    id: "cd_project_2",
    themeId: "project",
    cefr: "B2.1",
    statement: "Ich kann Zuständigkeiten klären und Prioritäten im Team abstimmen.",
    en: "I can clarify responsibilities and align priorities within the team.",
    threshold: 0.6,
  },

  /* ---------------- Technik & Digitalisierung ---------------- */
  {
    id: "cd_technology_1",
    themeId: "technology",
    cefr: "B1.2",
    statement: "Ich kann ein technisches Problem melden und beschreiben, was nicht funktioniert.",
    en: "I can report a technical problem and describe what is not working.",
    threshold: 0.3,
  },
  {
    id: "cd_technology_2",
    themeId: "technology",
    cefr: "B2.1",
    statement: "Ich kann die Einführung einer neuen Software erklären und Rückfragen beantworten.",
    en: "I can explain the rollout of new software and answer follow-up questions.",
    threshold: 0.6,
  },

  /* ---------------- Nachhaltigkeit ---------------- */
  {
    id: "cd_sustainability_1",
    themeId: "sustainability",
    cefr: "B1.2",
    statement: "Ich kann einfache Vorschläge machen, wie der Betrieb Energie und Müll sparen kann.",
    en: "I can make simple suggestions for how the company can save energy and reduce waste.",
    threshold: 0.3,
  },
  {
    id: "cd_sustainability_2",
    themeId: "sustainability",
    cefr: "B2.1",
    statement: "Ich kann Nachhaltigkeitsmaßnahmen vergleichen und ihre Vor- und Nachteile abwägen.",
    en: "I can compare sustainability measures and weigh their pros and cons.",
    threshold: 0.6,
  },

  /* ---------------- Arbeitssicherheit & Gesundheit ---------------- */
  {
    id: "cd_safety_1",
    themeId: "safety",
    cefr: "B1.2",
    statement: "Ich kann einen Unfall oder eine Gefahr am Arbeitsplatz melden.",
    en: "I can report an accident or a hazard at the workplace.",
    threshold: 0.3,
  },
  {
    id: "cd_safety_2",
    themeId: "safety",
    cefr: "B2.1",
    statement: "Ich kann Sicherheitsregeln erklären und Schutzmaßnahmen begründen.",
    en: "I can explain safety rules and justify protective measures.",
    threshold: 0.6,
  },

  /* ---------------- Geschäftsreisen ---------------- */
  {
    id: "cd_travel_1",
    themeId: "travel",
    cefr: "B1.2",
    statement: "Ich kann eine Dienstreise planen und ein Hotel buchen.",
    en: "I can plan a business trip and book a hotel.",
    threshold: 0.3,
  },
  {
    id: "cd_travel_2",
    themeId: "travel",
    cefr: "B2.1",
    statement: "Ich kann bei Reiseproblemen reagieren und eine Umbuchung aushandeln.",
    en: "I can respond to travel problems and negotiate a rebooking.",
    threshold: 0.6,
  },

  /* ---------------- Behörden & Ämter ---------------- */
  {
    id: "cd_behoerde_1",
    themeId: "behoerde",
    cefr: "B1.2",
    statement: "Ich kann mich beim Bürgeramt anmelden und die nötigen Unterlagen nennen.",
    en: "I can register at the Bürgeramt and name the required documents.",
    threshold: 0.25,
  },
  {
    id: "cd_behoerde_2",
    themeId: "behoerde",
    cefr: "B2.1",
    statement: "Ich kann einen Antrag stellen und fehlende Unterlagen nachreichen.",
    en: "I can submit an application and hand in missing documents later.",
    threshold: 0.5,
  },
  {
    id: "cd_behoerde_3",
    themeId: "behoerde",
    cefr: "B2.2",
    statement: "Ich kann auf einen Bescheid reagieren und bei Bedarf Widerspruch einlegen.",
    en: "I can respond to an official decision and file an objection if needed.",
    threshold: 0.75,
  },
  {
    id: "cd_arzt_1",
    themeId: "arzt",
    cefr: "B1.1",
    statement: "Ich kann in einer Praxis anrufen und einen Arzttermin vereinbaren.",
    en: "I can call a practice and arrange a doctor's appointment.",
    threshold: 0.25,
  },
  {
    id: "cd_arzt_2",
    themeId: "arzt",
    cefr: "B1.2",
    statement: "Ich kann dem Arzt meine Beschwerden und Symptome verständlich schildern.",
    en: "I can describe my complaints and symptoms to the doctor clearly.",
    threshold: 0.5,
  },
  {
    id: "cd_arzt_3",
    themeId: "arzt",
    cefr: "B2.1",
    statement: "Ich kann eine Diagnose und die Behandlung nachvollziehen und in der Apotheke sowie mit der Krankenkasse das Nötige klären.",
    en: "I can follow a diagnosis and the treatment and sort out what is needed at the pharmacy and with my health insurer.",
    threshold: 0.75,
  },
];

export const canDoByTheme = (themeId: string) =>
  canDoStatements.filter((c) => c.themeId === themeId);
