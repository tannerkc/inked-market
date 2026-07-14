-- Phase 2 (custom requests): customer-name snapshot, session duration for
-- open-calendar scheduling, reference-image bucket, request-expiry cron.
-- Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md

-- Snapshot of the requester's display name; profiles RLS blocks cross-user
-- reads and PostgREST cannot embed through auth.users.
alter table public.booking_requests
  add column if not exists customer_name text;

-- Artist sets this on accept when opening the calendar; the slot picker and
-- server-side validation both derive slot length from it.
alter table public.booking_requests
  add column if not exists session_duration_min int
  check (session_duration_min is null or session_duration_min between 30 and 720);

-- ─── Reference images: public-read bucket, writers scoped to own folder ───
-- ponytail: public read like studio-images; uuid paths are unguessable.
-- Move to signed URLs if reference images ever need to be private.
insert into storage.buckets (id, name, public)
values ('booking-refs', 'booking-refs', true)
on conflict (id) do nothing;

create policy "booking refs public read" on storage.objects
  for select using (bucket_id = 'booking-refs');
create policy "booking refs auth upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'booking-refs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "booking refs owner delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'booking-refs' and (storage.foldername(name))[1] = auth.uid()::text);

-- ─── Nightly request expiry (lazy read-side expiry covers the gap) ────────
create extension if not exists pg_cron;

do $$
begin
  perform cron.unschedule('expire-booking-requests');
exception when others then
  null; -- job did not exist yet
end $$;

select cron.schedule(
  'expire-booking-requests',
  '17 3 * * *',
  $$update public.booking_requests set status = 'expired'
    where status = 'pending' and expires_at < now()$$
);
