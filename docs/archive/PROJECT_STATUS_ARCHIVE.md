# Project Status — Archived Session Logs (index)

_Split out of `docs/PROJECT_STATUS.md` to keep the live status file navigable. In session 70 (2026-07-06)
this archive was itself chunked by **ISO week** into `docs/archive/status-log/` for token efficiency, so a
lookup loads only the relevant week. For current status, see `docs/PROJECT_STATUS.md`; for the backlog /
model guidance / research findings, `docs/PROJECT_REFERENCE.md`. The authoritative full authorship record
remains git history + `docs/SESSION_PROMPT_LOG.md`._

This file is now just the **index**. The session logs live in the weekly chunks below.

## Weekly chunks (`docs/archive/status-log/`)

| File | ISO week | Dates | Sessions |
|---|---|---|---|
| `PROJECT_STATUS_ARCHIVE_2026-W23.md` | 2026-W23 | Jun 1–7 | 1–19 (detailed logs) |
| `PROJECT_STATUS_ARCHIVE_2026-W24.md` | 2026-W24 | Jun 8–14 | 20–22 (detailed logs) |
| `PROJECT_STATUS_ARCHIVE_2026-W25.md` | 2026-W25 | Jun 15–21 | 23–30 (detailed logs) |
| `PROJECT_STATUS_ARCHIVE_2026-W26.md` | 2026-W26 | Jun 22–28 | 31–44 (detailed logs) |
| `PROJECT_STATUS_ARCHIVE_2026-W27.md` | 2026-W27 | Jun 29 – Jul 5 | 45–46 (detailed logs) + 49–68 (condensed handoffs) |
| `PROJECT_STATUS_ARCHIVE_2026-W28.md` | 2026-W28 | Jul 6–12 | 69–109 (detailed logs + condensed handoffs; the 07-13-dated s104–s109 handoffs live here too, keeping the demo-prep series together) |
| `PROJECT_STATUS_ARCHIVE_2026-W29.md` | 2026-W29 | Jul 13–19 | 113, 115–134 (condensed handoffs) |
| `PROJECT_STATUS_ARCHIVE_2026-W30.md` | 2026-W30 | Jul 20–26 | 135–154, 167–168, 171 (condensed handoffs) |
| `PROJECT_STATUS_ARCHIVE_2026-W31.md` | 2026-W31 | Jul 27 – Aug 2 | 173, 179 parts 1-3, 180, 181, 182 parts 1 and 4, 183 (mockup round + full handoff) |
| `PROJECT_STATUS_ARCHIVE_ops-notes.md` | — | undated | Evergreen deploy/ops notes, early auth/landing branch notes, and the cross-week condensed recaps (sessions 9–28) |

Notes on the split:
- Each session log is filed by the ISO week of its date. Sessions that never had a log here
  (e.g. 47–48, 50, 60) appear only where they existed before; the two most recent handoffs stay in the
  living status doc.
- W27 and W28 mix two record types: full detailed logs and the condensed "Resume here" handoffs that were
  moved out of `PROJECT_STATUS.md`. Both are kept verbatim, so a session can appear in both forms.
- Undated material (deploy/ops notes, the s9–28 condensed recaps) has no single week, so it lives in the
  `ops-notes` file.
- When a future session archives an aged-out handoff, append it to the current ISO-week file here
  (create the week file if it doesn't exist) and add a row above.


## Founder action items, resolved (archived 2026-08-04, s185a)

Moved out of the live list in `docs/PROJECT_STATUS.md` once done; kept here because each
records WHEN and by whom a piece of setup was completed.

- [x] ~~Paste `supabase/migrations/0013_admins_table.sql`.~~ **APPLIED 2026-07-27** by the founder in
      the SQL editor, without the lock-out guard firing (it raises rather than swapping the gate when
      the seed finds no account, so a clean run means `public.admins` is seeded). Audit F1 closed:
      the admin gate is now a user-id table, not an email claim. Live confirmation that `/admin`
      still opens is the founder's last check; the rollback to the 0008 email gate sits in a comment
      at the foot of the migration if it ever does not.
- [x] ~~Paste `supabase/migrations/0014_writing_insight_en.sql` into the SQL editor.~~ **APPLIED
      2026-07-31 by CI**, along with 0010, after the founder added `SUPABASE_DB_PASSWORD`. Migrations
      now ship themselves on merge; **there is no SQL to paste any more.**
- [x] ~~Enable "Confirm email".~~ **DONE 2026-07-27**, closing half of audit F1 (nobody can register
      an address they do not own). Required the `/auth/confirm` work in the s174 handoff.
- [x] ~~Enable Turnstile CAPTCHA on guest sign-in.~~ **DONE 2026-07-24** (live sign-in verified; both
      Supabase Auth CAPTCHA and the `VITE_TURNSTILE_SITE_KEY` GitHub secret set). Details in
      `PROJECT_FOUNDATION.md`.
- [x] ~~Decide where Anwenden lives on MOBILE (s182, audit P4).~~ **DECIDED 2026-08-01 by the
      founder:** "just move schreiben to anwenden and rename anwenden as prufung." Shipped in s182,
      so the bar stays at five slots and now reads Praktisch · Bibliothek · **Prüfung** ·
      Fortschritt · Einstellungen, with Sprechen, Schreiben and Prüfungssimulation inside the hub.
- [x] ~~Redeploy `transform-sentence` to activate the "Nochmal" regenerate button (s163).~~
      **DONE 2026-07-24** (founder redeployed via the Supabase dashboard; the capped variant path is
      live).
