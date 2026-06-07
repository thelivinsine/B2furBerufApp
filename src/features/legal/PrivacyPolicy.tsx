import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LAST_UPDATED = "7 June 2026";
const CONTACT_EMAIL = "thelivinsine@gmail.com";

/**
 * Standalone /privacy route (outside AppShell, like LandingPage). Plain-
 * language privacy policy reflecting exactly what Genauly collects and does,
 * derived from the actual schema (supabase/migrations/0001_init.sql), the
 * evaluate-writing Edge Function, and the third-party services wired into the
 * CSP (index.html). Keep this in sync whenever data flows change.
 */
export function PrivacyPolicy() {
  const navigate = useNavigate();
  const location = useLocation();

  // "Zurück" goes back one step in history, but when /privacy is opened
  // directly (typed URL, "Open in app" launching fresh) there's no prior
  // in-app entry, so navigate(-1) is a no-op. react-router marks that initial
  // entry with key "default" — in that case fall back to "/" (which routes to
  // the dashboard, or to /welcome for a not-yet-onboarded user).
  const handleBack = () => {
    if (location.key !== "default") navigate(-1);
    else navigate("/");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background bg-mesh">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <header className="relative z-10 mx-auto flex max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <button
          onClick={() => navigate("/welcome")}
          className="flex items-center gap-2.5 text-left"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-gradient text-white shadow-glow">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">Genauly</span>
        </button>
        <Button variant="ghost" onClick={handleBack} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          Zurück
        </Button>
      </header>

      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h1 className="mb-1 text-2xl font-bold tracking-tight sm:text-3xl">Datenschutzerklärung / Privacy Policy</h1>
        <p className="mb-8 text-sm text-muted-foreground">Last updated: {LAST_UPDATED}</p>

        <div className="space-y-5">
          <Section title="Overview">
            <p>
              Genauly (operated independently, reachable at{" "}
              <a className="text-primary underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              ) is an exam-prep app for the Goethe / telc Deutsch B2 Beruf speaking exam. This
              page explains what information Genauly collects, why, who (if anyone) it is shared
              with, and what choices you have. We collect the minimum needed to make the app work,
              and we never sell your data.
            </p>
          </Section>

          <Section title="You can use Genauly without an account">
            <p>
              Genauly works fully offline-capable and locally on your device with no sign-up at
              all. In that mode your progress (XP, streaks, vocabulary review schedule, quiz and
              exam results, settings) is stored only in your browser's local storage and never
              leaves your device. Creating an account is optional and only needed if you want your
              progress to follow you across devices.
            </p>
          </Section>

          <Section title="What we collect when you create an account">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Account identity.</strong> Either an email address and password (for
                email sign-up), the basic profile info Google shares when you use "Weiter mit
                Google" (name, email, profile picture URL), or, if you continue as a guest, a
                random anonymous account with no personal information at all. Guest accounts can
                later be upgraded to a full account without losing progress.
              </li>
              <li>
                <strong>Profile.</strong> The name, German level, learning goal, optional exam
                date, and daily XP target you enter during onboarding or in Settings.
              </li>
              <li>
                <strong>Learning progress.</strong> XP, streaks, which vocabulary cards and
                Redemittel you've reviewed and when (for spaced repetition), and which quizzes,
                exam sets, and dialogue scenarios you've completed. This is the cloud copy of the
                same data that, without an account, would live only in your browser.
              </li>
              <li>
                <strong>Writing submissions and AI feedback.</strong> If you use the AI
                Schreibcoach, the practice text you submit, the theme and task type, and the
                resulting feedback (your top weakness and one improvement tip) are stored so you
                can review your history in Analytics. See "AI writing feedback" below for how this
                text is processed.
              </li>
              <li>
                <strong>Anti-abuse signals.</strong> When you sign in or sign up, Cloudflare
                Turnstile (a CAPTCHA alternative) runs a check to confirm you're a human, not a
                bot. This involves Cloudflare processing some technical browser/device signals
                under its own privacy policy; Genauly only receives a yes/no verification result.
              </li>
            </ul>
          </Section>

          <Section title="AI writing feedback: where your text goes">
            <p>
              When you submit a text for evaluation, it is sent securely from your device to a
              Genauly server function (a Supabase Edge Function), which:
            </p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>
                first runs it through <strong>LanguageTool</strong> (a grammar/spelling checker)
                to find concrete error categories, often without needing any further processing;
              </li>
              <li>
                and, only when a deeper read is useful, sends the text to{" "}
                <strong>Anthropic's Claude</strong> (our primary AI model) to turn the findings
                into one clear, prioritised tip. On rare technical failures only, the request may
                fall back to <strong>Google Gemini</strong> or <strong>OpenAI</strong> instead.
              </li>
            </ul>
            <p className="mt-2">
              These AI providers process the text to generate your feedback and, per their own
              policies, do not use API submissions to train their models. We never share your
              email or identity with them, only the text itself. We also enforce a maximum text
              length and per-user usage limits to keep this feature sustainable.
            </p>
          </Section>

          <Section title="How we use your information">
            <ul className="list-disc space-y-2 pl-5">
              <li>To create and secure your account, and let you sign in across devices.</li>
              <li>To sync and back up your learning progress to the cloud.</li>
              <li>To generate the AI writing feedback you explicitly request.</li>
              <li>To prevent spam and automated abuse (CAPTCHA, rate limits).</li>
              <li>To diagnose bugs and keep the app reliable.</li>
            </ul>
            <p className="mt-2">
              We do not run advertising trackers, third-party analytics cookies, or sell or rent
              your data to anyone, ever.
            </p>
          </Section>

          <Section title="Who hosts and processes this data">
            <p>Genauly relies on a small set of trusted infrastructure providers to operate:</p>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li><strong>Supabase</strong> — our database, authentication, and server-function host.</li>
              <li><strong>Anthropic, Google (Gemini), and OpenAI</strong> — process writing-feedback text only, as described above.</li>
              <li><strong>LanguageTool</strong> — grammar/spelling pre-check for the writing coach.</li>
              <li><strong>Cloudflare</strong> — Turnstile bot-protection on sign-in and sign-up.</li>
              <li><strong>GitHub Pages</strong> — serves the static app itself (HTML, JS, images).</li>
            </ul>
            <p className="mt-2">
              Every database table that holds your personal data is protected by row-level
              security: only you (authenticated as yourself) can read or write your own rows. Our
              Anthropic, OpenAI, Gemini, and Supabase admin keys live only in secured server-side
              storage and are never exposed in the app or browser.
            </p>
          </Section>

          <Section title="How long we keep your data">
            <p>
              Account, profile, and progress data are kept for as long as your account exists.
              Writing submissions and their AI feedback are currently retained indefinitely so
              your Analytics history stays complete; this stays private to you (row-level security
              again) and is never used for any purpose beyond showing you your own history. If you
              would like your writing history cleared without deleting your whole account, contact
              us and we'll do it manually.
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
                <strong>Export or request a copy</strong> of your stored data by emailing us.
              </li>
              <li>
                <strong>Delete your account entirely</strong> (which permanently removes your
                profile, progress, and writing history from our database) by emailing us at{" "}
                <a className="text-primary underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
                  {CONTACT_EMAIL}
                </a>{" "}
                — we will action this within a reasonable time and confirm once it's done.
              </li>
              <li>
                <strong>Object to or restrict</strong> any processing you're not comfortable with.
              </li>
            </ul>
            <p className="mt-2">
              If you're in the EU/EEA or UK, these are your rights under the GDPR / UK GDPR, and
              you may also lodge a complaint with your local data protection authority.
            </p>
          </Section>

          <Section title="Local storage and cookies">
            <p>
              Genauly stores your settings and (if you're not signed in) your progress in your
              browser's local storage, purely so the app works and remembers your place. We do not
              use third-party tracking or advertising cookies. The app can also be installed as a
              Progressive Web App; its offline cache stores only the app's own code and assets,
              never your personal data or submissions.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              Genauly is intended for adults preparing for a professional German exam and is not
              directed at children. We do not knowingly collect data from children under 16. If
              you believe a child has created an account, contact us and we'll remove it.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If we change what we collect or how we use it, we'll update this page and change the
              "Last updated" date above. For significant changes, we'll also let signed-in users
              know in the app.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions, requests, or concerns about your data? Email us at{" "}
              <a className="text-primary underline underline-offset-2" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              . We aim to respond within a few business days.
            </p>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-2 p-5 text-sm leading-relaxed text-muted-foreground">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {children}
      </CardContent>
    </Card>
  );
}
