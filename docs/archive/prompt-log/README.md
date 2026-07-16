# Prompt-log weekly archive

Older entries from the append-only prompt log (`docs/SESSION_PROMPT_LOG.md`), split into **ISO-week**
files so any lookup loads only the relevant week instead of the whole history. Append-only: these are
left as written. The live log holds the current rolling window; when entries age out they are appended
to the week file matching each entry's date.

| Week | Dates | Sessions (approx) |
|---|---|---|
| `SESSION_PROMPT_LOG_2026-W25.md` | 2026-06-15 – 2026-06-21 | 26–29 |
| `SESSION_PROMPT_LOG_2026-W26.md` | 2026-06-22 – 2026-06-28 | 30–44 |
| `SESSION_PROMPT_LOG_2026-W27.md` | 2026-06-29 – 2026-07-05 | 45–49, 50–68 (entries 110–169) |
| `SESSION_PROMPT_LOG_2026-W28.md` | 2026-07-06 – 2026-07-12 | 69–103 (entries 170–364) |
| `SESSION_PROMPT_LOG_2026-W29.md` | 2026-07-13 – 2026-07-19 | 104–119 (entries 365–391) |

New week files follow the same name pattern: `SESSION_PROMPT_LOG_YYYY-Www.md`.

Note: from session 120 onward the live log uses `## Session N` headers (with numbered prompts per
session) rather than one `## Entry N` per prompt; both styles are append-only history.
