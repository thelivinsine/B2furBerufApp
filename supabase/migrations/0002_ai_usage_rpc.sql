-- Atomic increment of the global monthly AI usage counter.
-- Called by the evaluate-writing Edge Function (service role) after each
-- billable LLM call. SECURITY DEFINER so it runs regardless of RLS.
create or replace function public.bump_ai_usage(p_month text, p_cost numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ai_usage (month, calls, cost_estimate, updated_at)
    values (p_month, 1, p_cost, now())
  on conflict (month) do update
    set calls = public.ai_usage.calls + 1,
        cost_estimate = public.ai_usage.cost_estimate + excluded.cost_estimate,
        updated_at = now();
end;
$$;

-- Only the service role should call this (clients have no grant by default,
-- but revoke explicitly to be safe).
revoke all on function public.bump_ai_usage(text, numeric) from public, anon, authenticated;
