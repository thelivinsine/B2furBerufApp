import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalChrome, Section, type Lang } from "@/features/legal/LegalChrome";

/**
 * Public, login-free "About / purpose" page (/about). It states in plain
 * language what Genauly is, who it serves, what it does, and how Google sign-in
 * data is used. This doubles as the clear purpose page that Google's OAuth
 * branding review looks for. Bilingual (German binding-language convention is
 * legal-only; here both are just for clarity), reusing the legal LegalChrome.
 */
export function About() {
  const [lang, setLang] = useState<Lang>("de");
  const navigate = useNavigate();
  const t = copy[lang];

  return (
    <LegalChrome lang={lang} setLang={setLang} title={t.title} lastUpdated="2026-06-12">
      <Section title={t.whatTitle}>
        <p>{t.whatBody1}</p>
        <p>{t.whatBody2}</p>
      </Section>

      <Section title={t.whoTitle}>
        <p>{t.whoBody}</p>
      </Section>

      <Section title={t.doTitle}>
        <ul className="list-disc space-y-1 pl-5">
          {t.doItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Section>

      <Section title={t.dataTitle}>
        <p>{t.dataBody}</p>
      </Section>

      <div className="pt-2">
        <Button variant="gradient" onClick={() => navigate("/start")} className="gap-1.5">
          {t.cta} <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </LegalChrome>
  );
}

const copy: Record<Lang, {
  title: string;
  whatTitle: string;
  whatBody1: string;
  whatBody2: string;
  whoTitle: string;
  whoBody: string;
  doTitle: string;
  doItems: string[];
  dataTitle: string;
  dataBody: string;
  cta: string;
}> = {
  de: {
    title: "Über Genauly",
    whatTitle: "Was ist Genauly?",
    whatBody1:
      "Genauly ist eine Lern-App für Erwachsene, die schon Grundkenntnisse in Deutsch haben, aber auf der Stelle treten: nicht mehr Anfänger, aber noch nicht wirklich sicher. Die App hilft, dieses Zwischenniveau zu überwinden, indem du Deutsch in echten Alltagssituationen übst statt im Lehrbuch.",
    whatBody2:
      "Du lernst durch Situationen, die im echten Leben auftauchen: eine Präsentation bei der Arbeit, ein Gespräch bei der Behörde, ein Arztbesuch, ein Vorstellungsgespräch, schwierige Gespräche mit Kollegen. Die App unterstützt außerdem gezielt die Vorbereitung auf die Prüfungen telc Deutsch B2 Beruf und Goethe-Zertifikat B2.",
    whoTitle: "Für wen ist Genauly?",
    whoBody:
      "Für alle, die Deutsch bereits auf Grundniveau kennen (ungefähr B1) und endlich sicher und natürlich sprechen wollen, ob im Job, bei Behördengängen, beim Arzt oder im Alltag. Auch für Fachkräfte und Zugewanderte, die auf eine B2-Prüfung hinarbeiten. Der Einstieg ist kostenlos und ein Konto ist nicht nötig.",
    doTitle: "Was kannst du damit tun?",
    doItems: [
      "Verzweigte, lebensnahe Dialoge üben: Präsentation im Büro, Behördentermin, Arztgespräch, Vorstellungsgespräch und mehr.",
      "Wortschatz, Kollokationen und Redemittel mit verteilter Wiederholung lernen und behalten.",
      "Grammatik gezielt mit kurzen Übungen trainieren.",
      "Themen-Quizze auf drei Niveaustufen mit sofortigem Feedback lösen.",
      "Kurze Texte schreiben und einen klaren, priorisierten KI-Tipp erhalten.",
      "Mit Text-to-Speech und Spracherkennung die Aussprache üben.",
    ],
    dataTitle: "Anmeldung mit Google",
    dataBody:
      "Die Anmeldung mit Google ist optional. Wir nutzen sie nur, um dein Konto anzulegen und deinen Lernfortschritt geräteübergreifend zu speichern, damit du auf Handy, Tablet und Laptop nahtlos weitermachen kannst. Wir verkaufen keine Daten und nutzen sie nicht für Werbung. Details stehen in der Datenschutzerklärung.",
    cta: "Kostenlos starten",
  },
  en: {
    title: "About Genauly",
    whatTitle: "What is Genauly?",
    whatBody1:
      "Genauly is a German-learning app for adults who already know the basics but feel stuck at the intermediate level, somewhere around B1. Instead of more grammar tables, it builds confidence through the real situations you actually face in everyday life.",
    whatBody2:
      "You practise through situations that come up in real life: a presentation at work, a visit to the Behörde, talking to a doctor, a job interview, a difficult conversation with a colleague. The app also supports preparation for the telc Deutsch B2 Beruf and Goethe-Zertifikat B2 exams.",
    whoTitle: "Who is it for?",
    whoBody:
      "For anyone who has learned some German (around B1 level) and wants to finally feel confident and natural in the situations that matter: at work, at government offices, at the doctor, or in daily life. Also for skilled workers and newcomers working toward a B2 certificate. Free to start, no account required.",
    doTitle: "What can you do with it?",
    doItems: [
      "Practise branching, lifelike dialogues: an office presentation, a Behörde appointment, a doctor visit, a job interview, and more.",
      "Learn vocabulary, collocations, and Redemittel with spaced repetition so they stick.",
      "Drill grammar with short, targeted exercises.",
      "Take topic quizzes across three levels with instant feedback.",
      "Write short texts and receive one clear, prioritised AI tip.",
      "Practise pronunciation with text-to-speech and speech recognition.",
    ],
    dataTitle: "Signing in with Google",
    dataBody:
      "Signing in with Google is optional. We use it only to create your account and to save your learning progress across devices, so you can continue seamlessly on phone, tablet and laptop. We do not sell your data and do not use it for advertising. See the Privacy Policy for details.",
    cta: "Start free",
  },
};
