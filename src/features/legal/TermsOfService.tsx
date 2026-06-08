import { useState } from "react";
import { LegalChrome, Section, type Lang } from "./LegalChrome";

const LAST_UPDATED: Record<Lang, string> = {
  de: "8. Juni 2026",
  en: "8 June 2026",
};
const CONTACT_EMAIL = "thelivinsine@gmail.com";

/**
 * Standalone /terms route (outside AppShell, like /privacy). Plain-language
 * Terms of Service describing how Genauly may be used, written to match what
 * the app actually offers (a free learning tool with optional accounts and AI
 * writing feedback). Available in German (AGB) and English via the top toggle;
 * keep both in sync. Not formal legal advice; revisit before launching paid
 * plans or a marketing campaign.
 */
export function TermsOfService() {
  const [lang, setLang] = useState<Lang>("de");

  return (
    <LegalChrome
      lang={lang}
      setLang={setLang}
      title={lang === "de" ? "Allgemeine Geschäftsbedingungen" : "Terms of Service"}
      lastUpdated={LAST_UPDATED[lang]}
    >
      {lang === "de" ? <TermsDe /> : <TermsEn />}
    </LegalChrome>
  );
}

function MailLink() {
  return (
    <a className="text-primary underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
      {CONTACT_EMAIL}
    </a>
  );
}

function TermsDe() {
  return (
    <>
      <Section title="Überblick">
        <p>
          Diese Allgemeinen Geschäftsbedingungen („AGB“) regeln deine Nutzung von Genauly, einer
          Prüfungsvorbereitungs-App für die mündliche Prüfung Goethe / telc Deutsch B2 Beruf,
          erreichbar unter <MailLink />. Mit der Nutzung von Genauly stimmst du diesen AGB zu. Wenn
          du nicht einverstanden bist, nutze die App bitte nicht. Genauly wird unabhängig von einer
          Privatperson betrieben.
        </p>
      </Section>

      <Section title="Nutzung von Genauly">
        <p>
          Genauly ist ein Lernwerkzeug. Es hilft dir, berufsbezogenes Deutsch (Wortschatz,
          Grammatik, Schreiben und Sprechen) für die Prüfung B2 Beruf zu üben. Es wird für deine
          persönliche, nicht-kommerzielle Nutzung bereitgestellt. Wir können Funktionen jederzeit
          hinzufügen, ändern oder entfernen, um die App zu verbessern.
        </p>
      </Section>

      <Section title="Konten">
        <p>
          Du kannst Genauly ohne Konto nutzen. Wenn du eines erstellst, halte deine Anmeldedaten
          sicher und gib zutreffende Informationen an. Du bist für Aktivitäten verantwortlich, die
          unter deinem Konto stattfinden. Konten sind für einzelne Personen bestimmt, nicht zum
          Teilen. Du kannst dein Konto jederzeit löschen (siehe Datenschutzerklärung).
        </p>
      </Section>

      <Section title="Keine Garantie für den Prüfungserfolg">
        <p>
          Genauly unterstützt deine Vorbereitung, aber wir können und werden kein bestimmtes
          Prüfungsergebnis, keine Note und keinen Erfolg garantieren. Die Inhalte dienen
          ausschließlich dem Lernen und Üben und sind weder offizielles Material des
          Goethe-Instituts oder von telc noch ein Ersatz für eine qualifizierte Lehrkraft oder
          offizielle Prüfungsmaterialien.
        </p>
      </Section>

      <Section title="KI-Schreibfeedback">
        <p>
          Der KI-Schreibcoach gibt automatisiertes Feedback, um dir beim Verbessern zu helfen. Es
          kann unvollständig oder falsch sein, betrachte es daher als Lernhilfe und nicht als
          professionelle, rechtliche oder zertifizierte Sprachbewertung. Bitte reiche in deinen
          Übungstexten keine sensiblen personenbezogenen Daten ein. Es gelten Nutzungslimits und
          eine maximale Textlänge, damit die Funktion nachhaltig bleibt.
        </p>
      </Section>

      <Section title="Zulässige Nutzung">
        <p>Bitte nutze Genauly fair. Du verpflichtest dich, nicht:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>den Dienst zu missbrauchen oder zu stören;</li>
          <li>zu versuchen, auf Daten anderer Nutzer zuzugreifen;</li>
          <li>die Inhalte der App zu kommerziellen Zwecken zu kopieren, auszulesen (Scraping) oder weiterzuverbreiten;</li>
          <li>Sicherheitsmaßnahmen oder Ratenbegrenzungen zurückzuentwickeln oder zu umgehen;</li>
          <li>oder Bots bzw. automatisierte Werkzeuge zu verwenden, um den Dienst zu überlasten.</li>
        </ul>
        <p className="mt-2">
          Anti-Missbrauch-Prüfungen wie das CAPTCHA helfen uns, die App für alle verfügbar zu
          halten.
        </p>
      </Section>

      <Section title="Inhalte und geistiges Eigentum">
        <p>
          Die App, ihr Design und ihre Lerninhalte (Wortschatz, Redemittel, Grammatikübungen,
          Dialoge, Prüfungssätze und Texte) gehören Genauly oder seinen Lizenzgebern und sind
          urheberrechtlich geschützt. Du erhältst ein persönliches, nicht ausschließliches, nicht
          übertragbares Recht, sie für dein eigenes Lernen zu nutzen. Jeder Text, den du beim
          Schreibcoach einreichst, bleibt dein Eigentum; du erteilst uns nur die begrenzte
          Erlaubnis, die nötig ist, um ihn zu verarbeiten und dir dein Feedback und deinen Verlauf
          anzuzeigen, wie in der Datenschutzerklärung beschrieben.
        </p>
      </Section>

      <Section title="Preis und kostenpflichtige Funktionen">
        <p>
          Genauly ist derzeit kostenlos nutzbar. Falls wir künftig kostenpflichtige Pläne oder
          Funktionen einführen, legen wir deren Preise und Bedingungen klar dar, bevor du etwas
          kaufst, und diese AGB werden entsprechend aktualisiert.
        </p>
      </Section>

      <Section title="Verfügbarkeit und Gewährleistung">
        <p>
          Genauly wird „wie besehen“ und „wie verfügbar“ bereitgestellt, ohne jegliche
          Gewährleistung. Wir versprechen nicht, dass die App stets verfügbar oder fehlerfrei ist
          oder dass Inhalte vollständig oder korrekt sind. Wir können den Dienst jederzeit ganz
          oder teilweise aussetzen oder einstellen.
        </p>
      </Section>

      <Section title="Haftungsbeschränkung">
        <p>
          Soweit gesetzlich zulässig, haftet Genauly nicht für indirekte, zufällige oder
          Folgeschäden, die aus deiner Nutzung (oder der Unmöglichkeit der Nutzung) der App
          entstehen, einschließlich des Vertrauens auf ihre Inhalte oder das KI-Feedback. Nichts in
          diesen AGB beschränkt eine Haftung, die nach geltendem Recht nicht ausgeschlossen werden
          kann, zum Beispiel bei Vorsatz oder grober Fahrlässigkeit oder bei Verletzung von Leben,
          Körper oder Gesundheit.
        </p>
      </Section>

      <Section title="Kündigung">
        <p>
          Du kannst die Nutzung von Genauly jederzeit beenden und dein Konto löschen. Wir können
          deinen Zugang aussetzen oder beenden, wenn du erheblich oder wiederholt gegen diese AGB
          verstößt oder wenn dies gesetzlich erforderlich ist.
        </p>
      </Section>

      <Section title="Änderungen dieser AGB">
        <p>
          Wir können diese AGB anpassen, während sich die App weiterentwickelt. Wir ändern das
          Datum „Zuletzt aktualisiert“ oben, und bei wesentlichen Änderungen informieren wir
          angemeldete Nutzer in der App. Wenn du Genauly nach Inkrafttreten der Änderungen weiter
          nutzt, akzeptierst du die aktualisierten AGB.
        </p>
      </Section>

      <Section title="Anwendbares Recht">
        <p>
          Diese AGB unterliegen dem Recht der Bundesrepublik Deutschland unter Ausschluss seiner
          Kollisionsnormen und unbeschadet etwaiger zwingender Verbraucherschutzrechte an deinem
          Wohnort.
        </p>
      </Section>

      <Section title="Maßgebliche Sprachfassung">
        <p>
          Diese AGB werden in Deutsch und Englisch bereitgestellt. Bei Abweichungen zwischen den
          Fassungen ist die deutsche Fassung maßgeblich.
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          Fragen zu diesen AGB? Schreib uns an <MailLink />.
        </p>
      </Section>
    </>
  );
}

function TermsEn() {
  return (
    <>
      <Section title="Overview">
        <p>
          These Terms of Service ("Terms") govern your use of Genauly, an exam-prep app for the
          Goethe / telc Deutsch B2 Beruf speaking exam, reachable at <MailLink />. By using
          Genauly, you agree to these Terms. If you do not agree, please do not use the app.
          Genauly is operated independently by a private individual.
        </p>
      </Section>

      <Section title="Using Genauly">
        <p>
          Genauly is a learning tool. It helps you practise workplace German (vocabulary, grammar,
          writing, and speaking) for the B2 Beruf exam. It is provided for your personal,
          non-commercial use. We may add, change, or remove features at any time to improve the
          app.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          You can use Genauly without an account. If you create one, keep your login details secure
          and provide accurate information. You are responsible for activity that happens under your
          account. Accounts are for individual people, not for sharing. You can delete your account
          at any time (see the Privacy Policy for how).
        </p>
      </Section>

      <Section title="No guarantee of exam success">
        <p>
          Genauly supports your preparation, but we cannot and do not guarantee any particular exam
          result, grade, or outcome. The content is for study and practice only and is not official
          Goethe-Institut or telc material, nor a substitute for a qualified teacher or official
          exam materials.
        </p>
      </Section>

      <Section title="AI writing feedback">
        <p>
          The AI Schreibcoach gives automated feedback to help you improve. It can be incomplete or
          wrong, so treat it as a study aid, not as professional, legal, or certified language
          assessment. Please do not submit sensitive personal data in your practice texts. Usage
          limits and a maximum text length apply so the feature stays sustainable.
        </p>
      </Section>

      <Section title="Acceptable use">
        <p>Please use Genauly fairly. You agree not to:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>misuse or disrupt the service;</li>
          <li>attempt to access other users' data;</li>
          <li>copy, scrape, or redistribute the app's content for commercial purposes;</li>
          <li>reverse-engineer or circumvent security or rate limits;</li>
          <li>or use bots or automated tools to overload the service.</li>
        </ul>
        <p className="mt-2">
          Anti-abuse checks like the CAPTCHA help us keep the app available for everyone.
        </p>
      </Section>

      <Section title="Content and intellectual property">
        <p>
          The app, its design, and its learning content (vocabulary, Redemittel, grammar drills,
          dialogues, exam sets, and text) belong to Genauly or its licensors and are protected by
          copyright. You get a personal, non-exclusive, non-transferable right to use them for your
          own learning. Any text you submit to the writing coach stays yours; you grant us only the
          limited permission needed to process it and show you your feedback and history, as
          described in the Privacy Policy.
        </p>
      </Section>

      <Section title="Price and paid features">
        <p>
          Genauly is currently free to use. If we introduce paid plans or features in the future,
          we will set out their prices and terms clearly before you buy anything, and these Terms
          will be updated accordingly.
        </p>
      </Section>

      <Section title="Availability and warranty">
        <p>
          Genauly is provided "as is" and "as available," without warranties of any kind. We do not
          promise that the app will always be available, error-free, or that any content is
          complete or accurate. We may suspend or discontinue the service, in whole or in part, at
          any time.
        </p>
      </Section>

      <Section title="Limitation of liability">
        <p>
          To the extent permitted by law, Genauly is not liable for indirect, incidental, or
          consequential damages arising from your use of (or inability to use) the app, including
          any reliance on its content or AI feedback. Nothing in these Terms limits liability that
          cannot be excluded under applicable law, for example for intent or gross negligence, or
          for injury to life, body, or health.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You can stop using Genauly and delete your account at any time. We may suspend or end your
          access if you seriously or repeatedly breach these Terms, or where required by law.
        </p>
      </Section>

      <Section title="Changes to these Terms">
        <p>
          We may update these Terms as the app evolves. We will change the "Last updated" date
          above, and for significant changes we will give signed-in users notice in the app.
          Continuing to use Genauly after changes take effect means you accept the updated Terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Germany, excluding its
          conflict-of-law rules and without affecting any mandatory consumer-protection rights you
          have where you live.
        </p>
      </Section>

      <Section title="Governing language">
        <p>
          These Terms are provided in German and English. In case of any discrepancy between the
          versions, the German version prevails.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about these Terms? Email us at <MailLink />.
        </p>
      </Section>
    </>
  );
}
