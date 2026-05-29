import type { RedemittelCategory, RedemittelPhrase } from "@/types";

export const redemittelCategories: {
  id: RedemittelCategory;
  label: string;
  labelDe: string;
  icon: string;
  description: string;
}[] = [
  {
    id: "suggestions",
    label: "Making suggestions",
    labelDe: "Vorschläge machen",
    icon: "Lightbulb",
    description: "Propose ideas and ways forward in a discussion.",
  },
  {
    id: "agree",
    label: "Agreeing",
    labelDe: "Zustimmen",
    icon: "ThumbsUp",
    description: "Show support for an idea or proposal.",
  },
  {
    id: "disagree",
    label: "Disagreeing",
    labelDe: "Widersprechen",
    icon: "ThumbsDown",
    description: "Object politely and professionally.",
  },
  {
    id: "negotiation",
    label: "Negotiating",
    labelDe: "Verhandeln",
    icon: "Scale",
    description: "Bargain and move toward a shared decision.",
  },
  {
    id: "compromise",
    label: "Compromising",
    labelDe: "Kompromisse finden",
    icon: "Handshake",
    description: "Meet the other person halfway.",
  },
  {
    id: "clarification",
    label: "Clarifying",
    labelDe: "Nachfragen & klären",
    icon: "HelpCircle",
    description: "Ask for or give clarification.",
  },
  {
    id: "opinion",
    label: "Expressing opinions",
    labelDe: "Meinung äußern",
    icon: "MessageSquare",
    description: "State and justify your view.",
  },
  {
    id: "prosCons",
    label: "Pros & cons",
    labelDe: "Vor- & Nachteile",
    icon: "ListChecks",
    description: "Weigh advantages against disadvantages.",
  },
  {
    id: "reactions",
    label: "Professional reactions",
    labelDe: "Reagieren",
    icon: "Sparkles",
    description: "React appropriately to what your partner says.",
  },
];

export const redemittel: RedemittelPhrase[] = [
  /* ---------------- Suggestions ---------------- */
  {
    id: "r_sug1",
    de: "Ich würde vorschlagen, dass wir …",
    en: "I would suggest that we …",
    category: "suggestions",
    register: "formal",
    example: { de: "Ich würde vorschlagen, dass wir zuerst die Termine klären.", en: "I'd suggest we clarify the dates first." },
  },
  {
    id: "r_sug2",
    de: "Wie wäre es, wenn wir … würden?",
    en: "How about we … ?",
    category: "suggestions",
    register: "neutral",
    note: "Followed by Konjunktiv II for a polite, hypothetical tone.",
    example: { de: "Wie wäre es, wenn wir die Aufgaben aufteilen würden?", en: "How about we split up the tasks?" },
  },
  {
    id: "r_sug3",
    de: "Wir könnten doch …",
    en: "We could …",
    category: "suggestions",
    register: "neutral",
    example: { de: "Wir könnten doch einen früheren Termin wählen.", en: "We could choose an earlier date." },
  },
  {
    id: "r_sug4",
    de: "Mein Vorschlag wäre, …",
    en: "My suggestion would be …",
    category: "suggestions",
    register: "formal",
    example: { de: "Mein Vorschlag wäre, die Lieferung zu splitten.", en: "My suggestion would be to split the delivery." },
  },
  {
    id: "r_sug5",
    de: "Was hältst du davon, wenn …?",
    en: "What do you think about … ?",
    category: "suggestions",
    register: "neutral",
    example: { de: "Was hältst du davon, wenn wir den Kunden anrufen?", en: "What do you think about calling the customer?" },
  },

  /* ---------------- Agreeing ---------------- */
  {
    id: "r_agr1",
    de: "Da bin ich ganz deiner Meinung.",
    en: "I completely agree with you.",
    category: "agree",
    register: "neutral",
    example: { de: "Da bin ich ganz deiner Meinung, das sollten wir so machen.", en: "I completely agree, we should do it that way." },
  },
  {
    id: "r_agr2",
    de: "Das sehe ich genauso.",
    en: "I see it exactly the same way.",
    category: "agree",
    register: "neutral",
    example: { de: "Das sehe ich genauso – ein guter Punkt.", en: "I see it exactly the same way – a good point." },
  },
  {
    id: "r_agr3",
    de: "Das ist ein guter / überzeugender Vorschlag.",
    en: "That's a good / convincing suggestion.",
    category: "agree",
    register: "formal",
    example: { de: "Das ist ein überzeugender Vorschlag, dem stimme ich zu.", en: "That's a convincing suggestion, I agree." },
  },
  {
    id: "r_agr4",
    de: "Da hast du völlig recht.",
    en: "You're absolutely right there.",
    category: "agree",
    register: "neutral",
    example: { de: "Da hast du völlig recht, das spart Zeit.", en: "You're absolutely right, that saves time." },
  },

  /* ---------------- Disagreeing ---------------- */
  {
    id: "r_dis1",
    de: "Da bin ich anderer Meinung.",
    en: "I take a different view.",
    category: "disagree",
    register: "neutral",
    example: { de: "Da bin ich anderer Meinung, das ist zu teuer.", en: "I take a different view, that's too expensive." },
  },
  {
    id: "r_dis2",
    de: "Das sehe ich etwas anders, weil …",
    en: "I see it somewhat differently, because …",
    category: "disagree",
    register: "diplomatic",
    note: "Softening with 'etwas' keeps the disagreement polite.",
    example: { de: "Das sehe ich etwas anders, weil wir wenig Zeit haben.", en: "I see it a bit differently, because we have little time." },
  },
  {
    id: "r_dis3",
    de: "Ich bin mir da nicht so sicher.",
    en: "I'm not so sure about that.",
    category: "disagree",
    register: "diplomatic",
    example: { de: "Ich bin mir da nicht so sicher, ob das funktioniert.", en: "I'm not so sure whether that will work." },
  },
  {
    id: "r_dis4",
    de: "Das mag sein, aber …",
    en: "That may be, but …",
    category: "disagree",
    register: "diplomatic",
    note: "Acknowledge first, then object — a key B2 strategy.",
    example: { de: "Das mag sein, aber wir müssen die Kosten bedenken.", en: "That may be, but we have to consider the costs." },
  },

  /* ---------------- Negotiation ---------------- */
  {
    id: "r_neg1",
    de: "Wenn Sie …, dann könnten wir …",
    en: "If you …, then we could …",
    category: "negotiation",
    register: "formal",
    example: { de: "Wenn Sie etwas warten, dann könnten wir liefern.", en: "If you wait a little, then we could deliver." },
  },
  {
    id: "r_neg2",
    de: "Lassen Sie uns einen Mittelweg finden.",
    en: "Let's find a middle ground.",
    category: "negotiation",
    register: "formal",
    example: { de: "Lassen Sie uns einen Mittelweg finden, der für beide passt.", en: "Let's find a middle ground that works for both." },
  },
  {
    id: "r_neg3",
    de: "Wäre es möglich, dass …?",
    en: "Would it be possible that … ?",
    category: "negotiation",
    register: "formal",
    example: { de: "Wäre es möglich, dass wir den Termin vorziehen?", en: "Would it be possible to bring the date forward?" },
  },
  {
    id: "r_neg4",
    de: "Ich komme Ihnen entgegen, wenn …",
    en: "I'll meet you halfway if …",
    category: "negotiation",
    register: "formal",
    example: { de: "Ich komme Ihnen beim Preis entgegen, wenn Sie mehr abnehmen.", en: "I'll meet you on the price if you order more." },
  },

  /* ---------------- Compromise ---------------- */
  {
    id: "r_com1",
    de: "Als Kompromiss schlage ich vor, …",
    en: "As a compromise I suggest …",
    category: "compromise",
    register: "formal",
    example: { de: "Als Kompromiss schlage ich vor, die Kosten zu teilen.", en: "As a compromise I suggest splitting the costs." },
  },
  {
    id: "r_com2",
    de: "Wir könnten uns in der Mitte treffen.",
    en: "We could meet in the middle.",
    category: "compromise",
    register: "neutral",
    example: { de: "Wir könnten uns in der Mitte treffen: zwei Tage Homeoffice.", en: "We could meet in the middle: two days remote." },
  },
  {
    id: "r_com3",
    de: "Damit könnte ich leben.",
    en: "I could live with that.",
    category: "compromise",
    register: "neutral",
    example: { de: "Ein gemeinsamer Termin am Freitag – damit könnte ich leben.", en: "A joint date on Friday – I could live with that." },
  },

  /* ---------------- Clarification ---------------- */
  {
    id: "r_cla1",
    de: "Könnten Sie das näher erklären?",
    en: "Could you explain that in more detail?",
    category: "clarification",
    register: "formal",
    example: { de: "Könnten Sie das näher erklären? Ich bin nicht ganz sicher.", en: "Could you explain that in more detail? I'm not quite sure." },
  },
  {
    id: "r_cla2",
    de: "Wenn ich Sie richtig verstehe, meinen Sie …",
    en: "If I understand you correctly, you mean …",
    category: "clarification",
    register: "formal",
    note: "Great for paraphrasing and showing active listening.",
    example: { de: "Wenn ich Sie richtig verstehe, meinen Sie einen späteren Termin?", en: "If I understand you correctly, you mean a later date?" },
  },
  {
    id: "r_cla3",
    de: "Wie meinst du das genau?",
    en: "What exactly do you mean by that?",
    category: "clarification",
    register: "neutral",
    example: { de: "Wie meinst du das genau mit 'flexibel'?", en: "What exactly do you mean by 'flexible'?" },
  },
  {
    id: "r_cla4",
    de: "Habe ich das richtig verstanden, dass …?",
    en: "Did I understand correctly that … ?",
    category: "clarification",
    register: "neutral",
    example: { de: "Habe ich das richtig verstanden, dass wir morgen starten?", en: "Did I understand correctly that we start tomorrow?" },
  },

  /* ---------------- Opinion ---------------- */
  {
    id: "r_opi1",
    de: "Meiner Meinung nach …",
    en: "In my opinion …",
    category: "opinion",
    register: "neutral",
    example: { de: "Meiner Meinung nach ist die zweite Variante besser.", en: "In my opinion the second option is better." },
  },
  {
    id: "r_opi2",
    de: "Ich bin der Ansicht, dass …",
    en: "I take the view that …",
    category: "opinion",
    register: "formal",
    example: { de: "Ich bin der Ansicht, dass wir handeln müssen.", en: "I take the view that we have to act." },
  },
  {
    id: "r_opi3",
    de: "Aus meiner Sicht spricht vieles dafür, …",
    en: "From my perspective, a lot speaks in favour of …",
    category: "opinion",
    register: "formal",
    example: { de: "Aus meiner Sicht spricht vieles dafür, früher zu starten.", en: "From my perspective, much speaks in favour of starting earlier." },
  },
  {
    id: "r_opi4",
    de: "Ich finde es wichtig, dass …",
    en: "I think it's important that …",
    category: "opinion",
    register: "neutral",
    example: { de: "Ich finde es wichtig, dass alle informiert sind.", en: "I think it's important that everyone is informed." },
  },

  /* ---------------- Pros & cons ---------------- */
  {
    id: "r_pro1",
    de: "Ein Vorteil davon ist, dass …",
    en: "One advantage of this is that …",
    category: "prosCons",
    register: "neutral",
    example: { de: "Ein Vorteil davon ist, dass wir Zeit sparen.", en: "One advantage of this is that we save time." },
  },
  {
    id: "r_pro2",
    de: "Der Nachteil dabei ist, dass …",
    en: "The disadvantage here is that …",
    category: "prosCons",
    register: "neutral",
    example: { de: "Der Nachteil dabei ist, dass es mehr kostet.", en: "The disadvantage here is that it costs more." },
  },
  {
    id: "r_pro3",
    de: "Einerseits …, andererseits …",
    en: "On one hand …, on the other hand …",
    category: "prosCons",
    register: "neutral",
    example: { de: "Einerseits spart es Geld, andererseits dauert es länger.", en: "On one hand it saves money, on the other it takes longer." },
  },
  {
    id: "r_pro4",
    de: "Das hat sowohl Vor- als auch Nachteile.",
    en: "That has both advantages and disadvantages.",
    category: "prosCons",
    register: "neutral",
    example: { de: "Homeoffice hat sowohl Vor- als auch Nachteile.", en: "Remote work has both advantages and disadvantages." },
  },

  /* ---------------- Professional reactions ---------------- */
  {
    id: "r_rea1",
    de: "Das ist ein guter Punkt.",
    en: "That's a good point.",
    category: "reactions",
    register: "neutral",
    example: { de: "Das ist ein guter Punkt, daran hatte ich nicht gedacht.", en: "That's a good point, I hadn't thought of that." },
  },
  {
    id: "r_rea2",
    de: "Das kann ich gut nachvollziehen.",
    en: "I can fully understand that.",
    category: "reactions",
    register: "neutral",
    example: { de: "Das kann ich gut nachvollziehen, das ist ärgerlich.", en: "I can fully understand that, it's annoying." },
  },
  {
    id: "r_rea3",
    de: "Lassen Sie uns das gemeinsam lösen.",
    en: "Let's solve this together.",
    category: "reactions",
    register: "formal",
    example: { de: "Kein Problem, lassen Sie uns das gemeinsam lösen.", en: "No problem, let's solve this together." },
  },
  {
    id: "r_rea4",
    de: "Vielen Dank für den Hinweis.",
    en: "Thanks for pointing that out.",
    category: "reactions",
    register: "formal",
    example: { de: "Vielen Dank für den Hinweis, das prüfe ich.", en: "Thanks for pointing that out, I'll check it." },
  },
];

export const redemittelByCategory = (cat: RedemittelCategory) =>
  redemittel.filter((r) => r.category === cat);
