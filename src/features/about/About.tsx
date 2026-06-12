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
      "Genauly ist eine Lern-App für die Prüfungen Goethe-Zertifikat B2 Beruf und telc Deutsch B2+ Beruf. Sie hilft Erwachsenen, die auf Deutsch arbeiten oder arbeiten möchten, das Deutsch für den Berufsalltag aufzubauen: Wortschatz, Grammatik, Schreiben und Sprechen.",
    whatBody2:
      "Du übst realistische Gespräche aus dem Arbeitsalltag, lernst Prüfungswortschatz mit einem Wiederholungssystem, machst Quizze auf drei Niveaustufen mit sofortigem Feedback und bekommst KI-Feedback zu deinen Texten und deiner Aussprache.",
    whoTitle: "Für wen ist Genauly?",
    whoBody:
      "Für Fachkräfte, Auszubildende und Zugewanderte, die sich auf die B2-Beruf-Prüfung vorbereiten oder einfach im Job sicherer auf Deutsch kommunizieren wollen. Der Einstieg ist kostenlos und ein Konto ist nicht nötig, um die App auszuprobieren.",
    doTitle: "Was kannst du damit tun?",
    doItems: [
      "Verzweigte, lebensnahe Dialoge für das Prüfungsmodul „Gemeinsam eine Lösung finden“ üben.",
      "Über 350 Wörter aus dem Berufsleben plus Kollokationen und Redemittel mit verteilter Wiederholung lernen.",
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
      "Genauly is a learning app for the Goethe-Zertifikat B2 Beruf and telc Deutsch B2+ Beruf exams. It helps adults who work, or want to work, in German build the workplace German they actually need: vocabulary, grammar, writing and speaking.",
    whatBody2:
      "You practise realistic workplace dialogues, drill exam vocabulary with a spaced-repetition system, take leveled quizzes with instant feedback, and get AI feedback on your writing and pronunciation.",
    whoTitle: "Who is it for?",
    whoBody:
      "For skilled workers, trainees and newcomers preparing for the B2 Beruf exam, or anyone who wants to communicate more confidently in German at work. It is free to start, and no account is required to try it.",
    doTitle: "What can you do with it?",
    doItems: [
      "Practise branching, lifelike dialogues for the exam's „Gemeinsam eine Lösung finden“ speaking module.",
      "Learn 350+ workplace words plus collocations and Redemittel with spaced repetition.",
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
