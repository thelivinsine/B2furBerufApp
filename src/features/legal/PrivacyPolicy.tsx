import { useState } from "react";
import { LegalChrome, Section, type Lang } from "./LegalChrome";

const LAST_UPDATED: Record<Lang, string> = {
  de: "8. Juni 2026",
  en: "8 June 2026",
};
const CONTACT_EMAIL = "thelivinsine@gmail.com";

/**
 * Standalone /privacy route (outside AppShell, like LandingPage). Plain-
 * language privacy policy reflecting exactly what Genauly collects and does,
 * derived from the actual schema (supabase/migrations/0001_init.sql), the
 * evaluate-writing Edge Function, and the third-party services wired into the
 * CSP (index.html). Available in German and English via the top toggle; keep
 * both languages in sync whenever data flows change.
 */
export function PrivacyPolicy() {
  const [lang, setLang] = useState<Lang>("de");

  return (
    <LegalChrome
      lang={lang}
      setLang={setLang}
      title={lang === "de" ? "Datenschutzerklärung" : "Privacy Policy"}
      lastUpdated={LAST_UPDATED[lang]}
    >
      {lang === "de" ? <PrivacyDe /> : <PrivacyEn />}
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

function PrivacyDe() {
  return (
    <>
      <Section title="Überblick">
        <p>
          Genauly (unabhängig betrieben, erreichbar unter <MailLink />) ist eine
          Prüfungsvorbereitungs-App für die mündliche Prüfung Goethe / telc Deutsch B2 Beruf.
          Diese Seite erklärt, welche Informationen Genauly erhebt, warum, mit wem sie (falls
          überhaupt) geteilt werden und welche Wahlmöglichkeiten du hast. Wir erheben nur das
          Minimum, das nötig ist, damit die App funktioniert, und wir verkaufen deine Daten
          niemals.
        </p>
      </Section>

      <Section title="Du kannst Genauly ohne Konto nutzen">
        <p>
          Genauly funktioniert vollständig offlinefähig und lokal auf deinem Gerät, ganz ohne
          Anmeldung. In diesem Modus wird dein Fortschritt (XP, Serien, Wiederholungsplan für
          Vokabeln, Quiz- und Prüfungsergebnisse, Einstellungen) nur im lokalen Speicher deines
          Browsers abgelegt und verlässt dein Gerät nie. Ein Konto zu erstellen ist optional und
          nur nötig, wenn dein Fortschritt dir geräteübergreifend folgen soll.
        </p>
      </Section>

      <Section title="Was wir erheben, wenn du ein Konto erstellst">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Kontoidentität.</strong> Entweder eine E-Mail-Adresse und ein Passwort (bei
            der E-Mail-Anmeldung), die grundlegenden Profildaten, die Google bei „Weiter mit
            Google“ teilt (Name, E-Mail, URL des Profilbilds), oder, wenn du als Gast fortfährst,
            ein zufälliges anonymes Konto ganz ohne persönliche Daten. Gastkonten können später
            ohne Verlust des Fortschritts zu einem vollwertigen Konto aufgewertet werden.
          </li>
          <li>
            <strong>Profil.</strong> Name, Deutschniveau, Lernziel, optionales Prüfungsdatum und
            tägliches XP-Ziel, die du im Onboarding oder in den Einstellungen angibst.
          </li>
          <li>
            <strong>Lernfortschritt.</strong> XP, Serien, welche Vokabelkarten und Redemittel du
            wann wiederholt hast (für die verteilte Wiederholung) und welche Quizze, Prüfungssätze
            und Dialogszenarien du abgeschlossen hast. Das ist die Cloud-Kopie derselben Daten,
            die ohne Konto nur in deinem Browser lägen.
          </li>
          <li>
            <strong>Schreibeinreichungen und KI-Feedback.</strong> Wenn du den KI-Schreibcoach
            nutzt, werden der eingereichte Übungstext, das Thema und die Aufgabenart sowie das
            daraus entstehende Feedback (deine größte Schwäche und ein Verbesserungstipp)
            gespeichert, damit du deinen Verlauf in der Analyse ansehen kannst. Siehe
            „KI-Schreibfeedback“ unten, wie dieser Text verarbeitet wird.
          </li>
          <li>
            <strong>Anti-Missbrauch-Signale.</strong> Wenn du dich anmeldest oder registrierst,
            führt Cloudflare Turnstile (eine CAPTCHA-Alternative) eine Prüfung durch, um zu
            bestätigen, dass du ein Mensch bist und kein Bot. Dabei verarbeitet Cloudflare einige
            technische Browser- und Gerätesignale nach seiner eigenen Datenschutzrichtlinie;
            Genauly erhält nur ein Ja/Nein-Prüfergebnis.
          </li>
        </ul>
      </Section>

      <Section title="KI-Schreibfeedback: wohin dein Text geht">
        <p>
          Wenn du einen Text zur Auswertung einreichst, wird er sicher von deinem Gerät an eine
          Genauly-Serverfunktion (eine Supabase Edge Function) gesendet, die:
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            ihn zuerst durch <strong>LanguageTool</strong> (eine Grammatik- und
            Rechtschreibprüfung) laufen lässt, um konkrete Fehlerkategorien zu finden, oft ohne
            weitere Verarbeitung;
          </li>
          <li>
            und nur, wenn eine tiefere Analyse sinnvoll ist, den Text an{" "}
            <strong>Anthropics Claude</strong> (unser primäres KI-Modell) sendet, um die
            Ergebnisse in einen klaren, priorisierten Tipp zu verwandeln. Nur bei seltenen
            technischen Ausfällen kann die Anfrage stattdessen auf <strong>Google Gemini</strong>{" "}
            oder <strong>OpenAI</strong> zurückgreifen.
          </li>
        </ul>
        <p className="mt-2">
          Diese KI-Anbieter verarbeiten den Text, um dein Feedback zu erstellen, und verwenden
          API-Einreichungen gemäß ihren eigenen Richtlinien nicht zum Training ihrer Modelle. Wir
          geben deine E-Mail oder Identität niemals an sie weiter, nur den Text selbst. Außerdem
          setzen wir eine maximale Textlänge und Nutzungslimits pro Person durch, um diese
          Funktion nachhaltig zu halten.
        </p>
      </Section>

      <Section title="Wie wir deine Informationen verwenden">
        <ul className="list-disc space-y-2 pl-5">
          <li>Um dein Konto zu erstellen und zu sichern und dir die geräteübergreifende Anmeldung zu ermöglichen.</li>
          <li>
            Um dir wichtige servicebezogene E-Mails zu senden: Anmeldung, Passwort-Zurücksetzen und
            Kontowiederherstellung. Falls wir künftig kostenpflichtige Pläne anbieten, auch
            Zahlungs- und Rechnungs-E-Mails. Marketing- oder Werbe-E-Mails senden wir nur mit deiner
            gesonderten Einwilligung (Opt-in); derzeit versenden wir keine.
          </li>
          <li>Um deinen Lernfortschritt in die Cloud zu synchronisieren und zu sichern.</li>
          <li>Um das KI-Schreibfeedback zu erzeugen, das du ausdrücklich anforderst.</li>
          <li>Um Spam und automatisierten Missbrauch zu verhindern (CAPTCHA, Ratenbegrenzung).</li>
          <li>Um Fehler zu diagnostizieren und die App zuverlässig zu halten.</li>
        </ul>
        <p className="mt-2">
          Wir setzen keine Werbe-Tracker und keine Analyse-Cookies von Drittanbietern ein und
          verkaufen oder vermieten deine Daten niemals an irgendjemanden.
        </p>
      </Section>

      <Section title="Wer diese Daten hostet und verarbeitet">
        <p>Genauly stützt sich auf eine kleine Gruppe vertrauenswürdiger Infrastrukturanbieter:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li><strong>Supabase</strong>: unsere Datenbank, Authentifizierung und Host für Serverfunktionen.</li>
          <li><strong>Anthropic, Google (Gemini) und OpenAI</strong>: verarbeiten ausschließlich Text für das Schreibfeedback, wie oben beschrieben.</li>
          <li><strong>LanguageTool</strong>: Grammatik- und Rechtschreibvorprüfung für den Schreibcoach.</li>
          <li><strong>Cloudflare</strong>: Turnstile-Botschutz bei Anmeldung und Registrierung.</li>
          <li><strong>GitHub Pages</strong>: stellt die statische App selbst bereit (HTML, JS, Bilder).</li>
        </ul>
        <p className="mt-2">
          Jede Datenbanktabelle mit deinen personenbezogenen Daten ist durch Row-Level-Security
          geschützt: nur du (als du selbst authentifiziert) kannst deine eigenen Zeilen lesen oder
          schreiben. Unsere Schlüssel für Anthropic, OpenAI, Gemini und die Supabase-Administration
          liegen ausschließlich in gesichertem serverseitigem Speicher und werden nie in der App
          oder im Browser offengelegt.
        </p>
        <p className="mt-2">
          Datenstandort: Unsere Supabase-Datenbank wird in der Region [Region eintragen, z. B. EU]
          gehostet. Die KI-Anbieter können Anfragen auch außerhalb der EU verarbeiten; dabei gelten
          deren eigene Schutzmaßnahmen und Vertragsklauseln.
        </p>
      </Section>

      <Section title="Wie lange wir deine Daten speichern">
        <p>
          Konto-, Profil- und Fortschrittsdaten werden so lange gespeichert, wie dein Konto
          besteht. Schreibeinreichungen und ihr KI-Feedback bleiben gespeichert, damit dein
          Analyseverlauf vollständig bleibt. Du kannst einzelne Auswertungen jederzeit selbst im
          Schreibverlauf löschen oder mit deinem Konto alle auf einmal entfernen. Diese Daten
          bleiben privat für dich (wieder Row-Level-Security) und werden nie für einen Zweck
          verwendet, der über das Anzeigen deines eigenen Verlaufs hinausgeht.
        </p>
      </Section>

      <Section title="Deine Rechte">
        <p>Du kannst jederzeit:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>Deinen Fortschritt einsehen und zurücksetzen</strong>, direkt in
            Einstellungen → Gefahrenzone („Fortschritt zurücksetzen“).
          </li>
          <li>
            <strong>Deine Daten exportieren</strong>, direkt in Einstellungen → „Daten
            exportieren“ (lädt eine JSON-Kopie deines Profils, deines Fortschritts und deiner
            Schreib-Auswertungen herunter). Auf Wunsch auch per E-Mail an uns.
          </li>
          <li>
            <strong>Einzelne Schreib-Auswertungen löschen</strong> im Schreibverlauf, oder{" "}
            <strong>dein Konto vollständig löschen</strong> in Einstellungen → „Konto löschen“.
            Dies entfernt dein Profil, deinen Fortschritt und deinen Schreibverlauf endgültig aus
            der Cloud. Alternativ per E-Mail an <MailLink />.
          </li>
          <li>
            <strong>Der Verarbeitung widersprechen oder sie einschränken</strong>, mit der du
            nicht einverstanden bist.
          </li>
        </ul>
        <p className="mt-2">
          Wenn du in der EU, im EWR oder im Vereinigten Königreich bist, sind dies deine Rechte
          nach der DSGVO bzw. UK GDPR, und du kannst auch eine Beschwerde bei deiner örtlichen
          Datenschutzbehörde einreichen.
        </p>
      </Section>

      <Section title="Lokaler Speicher und Cookies">
        <p>
          Genauly speichert deine Einstellungen und (wenn du nicht angemeldet bist) deinen
          Fortschritt im lokalen Speicher deines Browsers, ausschließlich damit die App
          funktioniert und sich deinen Stand merkt. Wir verwenden keine Tracking- oder
          Werbe-Cookies von Drittanbietern. Die App kann auch als Progressive Web App installiert
          werden; ihr Offline-Cache speichert nur den Code und die Assets der App selbst, niemals
          deine personenbezogenen Daten oder Einreichungen.
        </p>
      </Section>

      <Section title="Datenschutz von Kindern">
        <p>
          Genauly richtet sich an Erwachsene, die sich auf eine berufsbezogene Deutschprüfung
          vorbereiten, und ist nicht an Kinder gerichtet. Wir erheben wissentlich keine Daten von
          Kindern unter 16 Jahren. Wenn du glaubst, dass ein Kind ein Konto erstellt hat,
          kontaktiere uns und wir entfernen es.
        </p>
      </Section>

      <Section title="Änderungen dieser Richtlinie">
        <p>
          Wenn wir ändern, was wir erheben oder wie wir es verwenden, aktualisieren wir diese
          Seite und ändern das Datum „Zuletzt aktualisiert“ oben. Bei wesentlichen Änderungen
          informieren wir angemeldete Nutzer zusätzlich in der App.
        </p>
      </Section>

      <Section title="Maßgebliche Sprachfassung">
        <p>
          Diese Datenschutzerklärung wird in Deutsch und Englisch bereitgestellt. Bei Abweichungen
          zwischen den Fassungen ist die deutsche Fassung maßgeblich.
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          Fragen, Anliegen oder Bedenken zu deinen Daten? Schreib uns an <MailLink />. Wir bemühen
          uns, innerhalb weniger Werktage zu antworten.
        </p>
      </Section>
    </>
  );
}

function PrivacyEn() {
  return (
    <>
      <Section title="Overview">
        <p>
          Genauly (operated independently, reachable at <MailLink />) is an exam-prep app for the
          Goethe / telc Deutsch B2 Beruf speaking exam. This page explains what information Genauly
          collects, why, who (if anyone) it is shared with, and what choices you have. We collect
          the minimum needed to make the app work, and we never sell your data.
        </p>
      </Section>

      <Section title="You can use Genauly without an account">
        <p>
          Genauly works fully offline-capable and locally on your device with no sign-up at all.
          In that mode your progress (XP, streaks, vocabulary review schedule, quiz and exam
          results, settings) is stored only in your browser's local storage and never leaves your
          device. Creating an account is optional and only needed if you want your progress to
          follow you across devices.
        </p>
      </Section>

      <Section title="What we collect when you create an account">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Account identity.</strong> Either an email address and password (for email
            sign-up), the basic profile info Google shares when you use "Weiter mit Google" (name,
            email, profile picture URL), or, if you continue as a guest, a random anonymous account
            with no personal information at all. Guest accounts can later be upgraded to a full
            account without losing progress.
          </li>
          <li>
            <strong>Profile.</strong> The name, German level, learning goal, optional exam date,
            and daily XP target you enter during onboarding or in Settings.
          </li>
          <li>
            <strong>Learning progress.</strong> XP, streaks, which vocabulary cards and Redemittel
            you've reviewed and when (for spaced repetition), and which quizzes, exam sets, and
            dialogue scenarios you've completed. This is the cloud copy of the same data that,
            without an account, would live only in your browser.
          </li>
          <li>
            <strong>Writing submissions and AI feedback.</strong> If you use the AI Schreibcoach,
            the practice text you submit, the theme and task type, and the resulting feedback (your
            top weakness and one improvement tip) are stored so you can review your history in
            Analytics. See "AI writing feedback" below for how this text is processed.
          </li>
          <li>
            <strong>Anti-abuse signals.</strong> When you sign in or sign up, Cloudflare Turnstile
            (a CAPTCHA alternative) runs a check to confirm you're a human, not a bot. This
            involves Cloudflare processing some technical browser and device signals under its own
            privacy policy; Genauly only receives a yes/no verification result.
          </li>
        </ul>
      </Section>

      <Section title="AI writing feedback: where your text goes">
        <p>
          When you submit a text for evaluation, it is sent securely from your device to a Genauly
          server function (a Supabase Edge Function), which:
        </p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            first runs it through <strong>LanguageTool</strong> (a grammar and spelling checker)
            to find concrete error categories, often without needing any further processing;
          </li>
          <li>
            and, only when a deeper read is useful, sends the text to{" "}
            <strong>Anthropic's Claude</strong> (our primary AI model) to turn the findings into
            one clear, prioritised tip. On rare technical failures only, the request may fall back
            to <strong>Google Gemini</strong> or <strong>OpenAI</strong> instead.
          </li>
        </ul>
        <p className="mt-2">
          These AI providers process the text to generate your feedback and, per their own
          policies, do not use API submissions to train their models. We never share your email or
          identity with them, only the text itself. We also enforce a maximum text length and
          per-user usage limits to keep this feature sustainable.
        </p>
      </Section>

      <Section title="How we use your information">
        <ul className="list-disc space-y-2 pl-5">
          <li>To create and secure your account, and let you sign in across devices.</li>
          <li>
            To send you essential service emails: sign-in, password reset, and account recovery.
            If we add paid plans later, also payment and billing emails. We send marketing or
            promotional email only with your separate opt-in consent, and we currently send none.
          </li>
          <li>To sync and back up your learning progress to the cloud.</li>
          <li>To generate the AI writing feedback you explicitly request.</li>
          <li>To prevent spam and automated abuse (CAPTCHA, rate limits).</li>
          <li>To diagnose bugs and keep the app reliable.</li>
        </ul>
        <p className="mt-2">
          We do not run advertising trackers, third-party analytics cookies, or sell or rent your
          data to anyone, ever.
        </p>
      </Section>

      <Section title="Who hosts and processes this data">
        <p>Genauly relies on a small set of trusted infrastructure providers to operate:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li><strong>Supabase</strong>: our database, authentication, and server-function host.</li>
          <li><strong>Anthropic, Google (Gemini), and OpenAI</strong>: process writing-feedback text only, as described above.</li>
          <li><strong>LanguageTool</strong>: grammar and spelling pre-check for the writing coach.</li>
          <li><strong>Cloudflare</strong>: Turnstile bot-protection on sign-in and sign-up.</li>
          <li><strong>GitHub Pages</strong>: serves the static app itself (HTML, JS, images).</li>
        </ul>
        <p className="mt-2">
          Every database table that holds your personal data is protected by row-level security:
          only you (authenticated as yourself) can read or write your own rows. Our Anthropic,
          OpenAI, Gemini, and Supabase admin keys live only in secured server-side storage and are
          never exposed in the app or browser.
        </p>
        <p className="mt-2">
          Data location: our Supabase database is hosted in the [fill in region, e.g. EU] region.
          The AI providers may process requests outside the EU under their own safeguards and
          contractual terms.
        </p>
      </Section>

      <Section title="How long we keep your data">
        <p>
          Account, profile, and progress data are kept for as long as your account exists. Writing
          submissions and their AI feedback are retained so your Analytics history stays complete.
          You can delete individual evaluations yourself in your writing history at any time, or
          remove them all at once by deleting your account. This data stays private to you
          (row-level security again) and is never used for any purpose beyond showing you your own
          history.
        </p>
      </Section>

      <Section title="Your rights">
        <p>You can, at any time:</p>
        <ul className="mt-2 list-disc space-y-2 pl-5">
          <li>
            <strong>See and reset your progress</strong> directly in Settings → Gefahrenzone
            ("Fortschritt zurücksetzen").
          </li>
          <li>
            <strong>Export your data</strong> directly in Settings → "Daten exportieren"
            (downloads a JSON copy of your profile, progress, and writing evaluations). You can
            also request it by email.
          </li>
          <li>
            <strong>Delete individual writing evaluations</strong> in your writing history, or{" "}
            <strong>delete your account entirely</strong> in Settings → "Konto löschen". This
            permanently removes your profile, progress, and writing history from the cloud.
            Alternatively, email us at <MailLink />.
          </li>
          <li>
            <strong>Object to or restrict</strong> any processing you're not comfortable with.
          </li>
        </ul>
        <p className="mt-2">
          If you're in the EU/EEA or UK, these are your rights under the GDPR / UK GDPR, and you
          may also lodge a complaint with your local data protection authority.
        </p>
      </Section>

      <Section title="Local storage and cookies">
        <p>
          Genauly stores your settings and (if you're not signed in) your progress in your
          browser's local storage, purely so the app works and remembers your place. We do not use
          third-party tracking or advertising cookies. The app can also be installed as a
          Progressive Web App; its offline cache stores only the app's own code and assets, never
          your personal data or submissions.
        </p>
      </Section>

      <Section title="Children's privacy">
        <p>
          Genauly is intended for adults preparing for a professional German exam and is not
          directed at children. We do not knowingly collect data from children under 16. If you
          believe a child has created an account, contact us and we'll remove it.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          If we change what we collect or how we use it, we'll update this page and change the
          "Last updated" date above. For significant changes, we'll also let signed-in users know
          in the app.
        </p>
      </Section>

      <Section title="Governing language">
        <p>
          This privacy policy is provided in German and English. In case of any discrepancy between
          the versions, the German version prevails.
        </p>
      </Section>

      <Section title="Contact us">
        <p>
          Questions, requests, or concerns about your data? Email us at <MailLink />. We aim to
          respond within a few business days.
        </p>
      </Section>
    </>
  );
}
