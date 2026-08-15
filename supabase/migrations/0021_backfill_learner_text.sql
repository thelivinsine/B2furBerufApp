-- 0021_backfill_learner_text.sql
-- Give the learner back the conversations a failed grade appeared to swallow
-- (founder s211: "then the progress is lost").
--
-- WHY. `speaking_conversations.learner_text` used to be written by a SUCCESSFUL
-- debrief and by nothing else, while the Verlauf reads `learner_text` and never
-- `turns`. So every conversation whose grading failed rendered as "Das
-- Transkript wurde inzwischen gelöscht." over a row that still held every word
-- the learner said, in `turns`. Nothing was ever actually lost: it was written
-- to a column nothing displayed.
--
-- s211 fixed the writing side (each turn now writes `learner_text` as the
-- learner speaks). This is the other half: the rows that already exist. The
-- founder's own Verlauf is eight conversations deep, all of them reading as
-- deleted, and the text for all of them is sitting in `turns`.
--
-- WHAT IT TOUCHES. Only rows where `learner_text IS NULL` and `turns` still has
-- content. It cannot overwrite a real transcript, and it cannot resurrect one
-- the retention job has purged, because that job empties `turns` in the same
-- statement it NULLs the text (migration 0015): a purged row has no source to
-- backfill from and is left exactly as it is.
--
-- Safe to re-run: after the first pass there is nothing left matching, so a
-- second run updates zero rows. The deploy runs --include-all.

update public.speaking_conversations
set learner_text = sub.said
from (
  select
    c.id,
    -- The same join the function and the debrief use: learner turns only, in
    -- order, one per line. `with ordinality` keeps the transcript's own order
    -- rather than whatever order the aggregate happens to see.
    (
      select string_agg(t.turn ->> 'text', E'\n' order by t.ord)
      from jsonb_array_elements(c.turns) with ordinality as t(turn, ord)
      where t.turn ->> 'role' = 'learner'
        and coalesce(t.turn ->> 'text', '') <> ''
    ) as said
  from public.speaking_conversations c
  where c.learner_text is null
    and jsonb_typeof(c.turns) = 'array'
    and c.turns <> '[]'::jsonb
) as sub
where public.speaking_conversations.id = sub.id
  and public.speaking_conversations.learner_text is null
  and sub.said is not null
  and btrim(sub.said) <> '';
