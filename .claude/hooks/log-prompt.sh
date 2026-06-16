#!/usr/bin/env bash
# UserPromptSubmit hook — raw authorship capture.
#
# Appends one JSON line per founder prompt to docs/prompt-log-raw.jsonl:
#   { ts, branch, session_id, cwd, prompt }
# This is the tamper-evident raw record that backs the curated
# docs/SESSION_PROMPT_LOG.md (see that file's header for the policy).
#
# CRITICAL: writes ONLY to the log file. UserPromptSubmit injects a hook's
# stdout into the model context, so this must print nothing to stdout. It also
# never blocks the prompt (always exit 0).
set -u

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
out="$root/docs/prompt-log-raw.jsonl"
ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
branch="$(git -C "$root" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"

input="$(cat)"

printf '%s' "$input" \
  | jq -c --arg ts "$ts" --arg branch "$branch" \
      '{ts: $ts, branch: $branch, session_id: (.session_id // null), cwd: (.cwd // null), prompt: (.prompt // "")}' \
      >> "$out" 2>/dev/null \
  || printf '{"ts":"%s","branch":"%s","error":"capture_failed"}\n' "$ts" "$branch" >> "$out"

exit 0
