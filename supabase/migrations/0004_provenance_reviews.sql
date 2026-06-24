-- Genauly — provenance QC review (admin-only)
-- One row per content_id, holding the founder's human-verification mark and an
-- optional internal QC note. Backs the admin overlay on the /sources page.
--
-- Locked to the founder account server-side: only a session whose JWT email
-- matches the founder may read or write. No other user (and no anonymous
-- visitor) can see the verified marks or the notes. The service role bypasses
-- RLS as usual.

create table if not exists public.provenance_reviews (
  content_id  text primary key,
  verified    boolean not null default false,
  comment     text,
  reviewed_by uuid references auth.users (id) on delete set null,
  updated_at  timestamptz not null default now()
);

alter table public.provenance_reviews enable row level security;

-- Founder-only access (read + write). Email is the gate.
create policy "provenance_reviews_founder_all" on public.provenance_reviews
  for all
  using ((auth.jwt() ->> 'email') = 'thelivinsine@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'thelivinsine@gmail.com');

create trigger provenance_reviews_touch before update on public.provenance_reviews
  for each row execute function public.touch_updated_at();
