import type { GrammarSnippet } from "@/types";

/** Compact oral-fluency grammar patterns most useful in the partner module. */
export const grammar: GrammarSnippet[] = [
  {
    id: "g_konjunktiv2",
    title: "Konjunktiv II for polite suggestions",
    purpose: "Soften proposals and requests so they sound diplomatic.",
    pattern: "würde + Infinitiv · könnte / sollte / müsste",
    examples: [
      "Wir könnten den Termin verschieben.",
      "Ich würde vorschlagen, zuerst die Kosten zu klären.",
      "Sollten wir nicht lieber online tagen?",
    ],
  },
  {
    id: "g_konnektoren",
    title: "Connectors for structured arguments",
    purpose: "Link ideas to sound coherent when weighing options.",
    pattern: "einerseits … andererseits · zwar … aber · deshalb · trotzdem",
    examples: [
      "Einerseits ist es günstiger, andererseits dauert es länger.",
      "Das ist zwar teurer, aber dafür zuverlässiger.",
      "Wir haben wenig Zeit, deshalb sollten wir uns entscheiden.",
    ],
  },
  {
    id: "g_nebensatz",
    title: "dass / weil / damit clauses",
    purpose: "Justify opinions and explain reasons — verb goes to the end.",
    pattern: "Ich denke, dass … · …, weil … · …, damit …",
    examples: [
      "Ich glaube, dass wir die Frist einhalten können.",
      "Ich bin dafür, weil es Zeit spart.",
      "Wir schicken eine Erinnerung, damit niemand den Termin vergisst.",
    ],
  },
  {
    id: "g_modal",
    title: "Modal verbs for negotiation",
    purpose: "Express possibility, necessity and permission precisely.",
    pattern: "können · müssen · sollen · dürfen + Infinitiv (end)",
    examples: [
      "Wir müssen eine Lösung finden.",
      "Können wir uns auf Freitag einigen?",
      "Wir sollten den Kunden rechtzeitig informieren.",
    ],
  },
  {
    id: "g_passiv",
    title: "Passive for processes",
    purpose: "Describe workplace procedures neutrally.",
    pattern: "werden + Partizip II",
    examples: [
      "Die Lieferung wird morgen verschickt.",
      "Jeder Unfall muss gemeldet werden.",
      "Die Spesen werden monatlich abgerechnet.",
    ],
  },
];
