import { useState } from "react";
import { LegalChrome, Section, type Lang } from "./LegalChrome";

const LAST_UPDATED: Record<Lang, string> = {
  de: "8. Juni 2026",
  en: "8 June 2026",
};
const CONTACT_EMAIL = "thelivinsine@gmail.com";

/**
 * Standalone /impressum route (outside AppShell, like /privacy and /terms).
 * Legal disclosure required for a commercial German site (§ 5 TMG / § 18 MStV).
 *
 * IMPORTANT: the bracketed placeholders below MUST be replaced with the real
 * operator name and a reachable postal address before public launch. An
 * Impressum with placeholder details is itself non-compliant.
 */
export function Impressum() {
  const [lang, setLang] = useState<Lang>("de");

  return (
    <LegalChrome
      lang={lang}
      setLang={setLang}
      title={lang === "de" ? "Impressum" : "Imprint"}
      lastUpdated={LAST_UPDATED[lang]}
    >
      {lang === "de" ? <ImpressumDe /> : <ImpressumEn />}
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

function ImpressumDe() {
  return (
    <>
      <Section title="Angaben gemäß § 5 TMG">
        <p>
          [Vollständiger Name des Betreibers]
          <br />
          [Straße und Hausnummer]
          <br />
          [PLZ und Ort]
          <br />
          [Land]
        </p>
      </Section>

      <Section title="Kontakt">
        <p>
          E-Mail: <MailLink />
          <br />
          Telefon: [optional, Telefonnummer]
        </p>
      </Section>

      <Section title="Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV">
        <p>
          [Vollständiger Name]
          <br />
          [Anschrift wie oben]
        </p>
      </Section>

      <Section title="Haftung für Inhalte">
        <p>
          Die Inhalte dieser Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit,
          Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als
          Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten nach den allgemeinen
          Gesetzen verantwortlich.
        </p>
      </Section>

      <Section title="Streitschlichtung">
        <p>
          Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{" "}
          <a
            className="text-primary underline underline-offset-2"
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . Wir sind nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor
          einer Verbraucherschlichtungsstelle teilzunehmen.
        </p>
      </Section>
    </>
  );
}

function ImpressumEn() {
  return (
    <>
      <Section title="Information pursuant to § 5 TMG">
        <p>
          [Full name of the operator]
          <br />
          [Street and number]
          <br />
          [Postal code and city]
          <br />
          [Country]
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Email: <MailLink />
          <br />
          Phone: [optional, phone number]
        </p>
      </Section>

      <Section title="Responsible for content under § 18 (2) MStV">
        <p>
          [Full name]
          <br />
          [Address as above]
        </p>
      </Section>

      <Section title="Liability for content">
        <p>
          The contents of these pages were created with the greatest care. However, we cannot
          guarantee that the content is accurate, complete, or up to date. As a service provider,
          we are responsible for our own content on these pages under the general laws.
        </p>
      </Section>

      <Section title="Dispute resolution">
        <p>
          The European Commission provides a platform for online dispute resolution (ODR):{" "}
          <a
            className="text-primary underline underline-offset-2"
            href="https://ec.europa.eu/consumers/odr"
            target="_blank"
            rel="noreferrer"
          >
            https://ec.europa.eu/consumers/odr
          </a>
          . We are neither obliged nor willing to participate in dispute resolution proceedings
          before a consumer arbitration board.
        </p>
      </Section>
    </>
  );
}
