-- Email existence check for signup account steps.
-- auth.users isn't exposed via PostgREST, so the /api/auth/email-exists route
-- (service role only) calls this to block in-use emails before the user
-- invests in the rest of the signup flow.
create or replace function public.email_exists(check_email text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users where lower(email) = lower(check_email)
  );
$$;

revoke execute on function public.email_exists(text) from public, anon, authenticated;
grant execute on function public.email_exists(text) to service_role;
