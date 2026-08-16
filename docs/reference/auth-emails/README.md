# Auth emails: making them come from Genauly

Right now Supabase's sign-up mail arrives from **`noreply@mail.app.supabase.io`** with the words
"powered by Supabase" under it. There are two separate things to change, and they are independent:

| What you want | What controls it | Where |
|---|---|---|
| The sender name and address | **Custom SMTP** | Supabase → Project Settings → Authentication → SMTP Settings |
| What the email looks like | **Email templates** | Supabase → Authentication → Emails |

Do the SMTP one first. Until it is set, changing the template only restyles a mail that still says
it came from Supabase — and Supabase's built-in sender is rate-limited to a handful of messages an
hour, which is the real reason it cannot stay.

---

## Step 1: send through Resend (the sender)

You already have a Resend account: it sends the in-app feedback notifications
(`RESEND_API_KEY` in the Edge Function secrets). Auth mail needs one thing that feedback mail did
not: feedback goes to **you**, so Resend's shared `onboarding@resend.dev` sender was enough.
Sign-up mail goes to **strangers**, and shared senders are not allowed to do that. So `genauly.de`
has to be verified as a sending domain.

1. **Resend → Domains → Add Domain → `genauly.de`.** Resend shows three or four DNS records
   (DKIM, SPF, and usually a return-path CNAME).
2. **Add those records at your domain registrar** (wherever `genauly.de` is registered, the same
   place the GitHub Pages records live). Resend flips the domain to "Verified", usually within
   minutes, occasionally a few hours.
3. **Resend → API Keys → Create**, with sending permission. (You can reuse the existing key if you
   still have its value; keys are only shown once.)
4. **Supabase → Project Settings → Authentication → SMTP Settings → Enable Custom SMTP:**

   | Field | Value |
   |---|---|
   | Host | `smtp.resend.com` |
   | Port | `465` |
   | Username | `resend` |
   | Password | your Resend API key |
   | Sender email | `hallo@genauly.de` (any address at the verified domain) |
   | Sender name | `Genauly` |

5. **Supabase → Authentication → Rate Limits:** raise "Emails per hour" once SMTP is on. The
   built-in cap exists because of the shared sender; with your own it can be a real number.

Test by signing up with a fresh address. The mail should now say **Genauly `<hallo@genauly.de>`**
with no Supabase footer.

## Step 2: paste the templates (the look)

**Supabase → Authentication → Emails.** For each template below, replace the whole message body and
save. Subject lines are set in the same screen.

| Template | File here | Suggested subject |
|---|---|---|
| Confirm signup | `confirm-signup.html` | `Bestätige deine E-Mail` |
| Reset password | `reset-password.html` | `Neues Passwort für Genauly` |

**Both templates spell out `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=…` instead of using
`{{ .ConfirmationURL }}`.** Supabase's default `{{ .ConfirmationURL }}` is a PKCE `?code=` link,
which only works in the SAME BROWSER that started the flow (the code exchange needs a verifier that
browser wrote to its own localStorage) — a learner who opens the link on a different device, or in
an email app's in-app browser, got "confirmed" server-side but was never signed in (founder report,
s215). `token_hash` is exchanged with `verifyOtp()`, which needs nothing from the originating
browser. Leave the substitution as it is in both files; don't switch back to `{{ .ConfirmationURL }}`.

## What the app does with the link

The link lands on **`/auth/confirm`** (`src/features/auth/ConfirmEmail.tsx`), which completes the
sign-in and drops the learner into the app. The app pins that landing page itself, through
`emailRedirectTo` (signup) / `redirectTo` (reset) in `src/store/useAuthStore.ts`, so it does not
depend on the project's Site URL being right. It accepts every shape a Supabase confirmation link
can arrive in, so the flow works whether or not these templates have been pasted yet. A **reset**
link (`type=recovery`) does not drop the learner into the app: it shows a "set a new password" form
in place, then hands over to the app once the password is saved.

One thing that DOES still have to be right in the dashboard: **Authentication → URL Configuration →
Redirect URLs** must allow `https://genauly.de/**`, or Supabase refuses the redirect target. The
Google sign-in setup already required this, so it is almost certainly in place.

## Why the sign-up flow was broken before this (s174)

Recorded so nobody re-introduces it. Supabase's default template hands the session back in the URL
**hash** (`#access_token=…`). React Router rewrites the URL as the app mounts, so those tokens were
gone before any code could read them, and the app uses the PKCE flow, which does not expect them
there anyway. The result: clicking the link confirmed the account on the server but did not sign
anyone in, so the learner landed on a normal signed-out page and assumed it had failed.
`src/lib/authCallback.ts` now snapshots those parameters at module-eval time, before React Router
exists, and `/auth/confirm` acts on them.
