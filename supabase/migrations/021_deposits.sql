-- Phase 4 (deposits): artist-level payment connections, checkout URL storage,
-- hourly release of unpaid deposit holds.
-- Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md

-- Connections become entity-scoped (artist XOR studio). Existing rows are all
-- studio rows; RLS stays deny-all (service-role only).
alter table public.studio_connections
  add column if not exists artist_id uuid references public.artists(id) on delete cascade;
alter table public.studio_connections
  alter column studio_id drop not null;
alter table public.studio_connections
  add constraint studio_connections_entity_xor
  check (num_nonnulls(artist_id, studio_id) = 1);
alter table public.studio_connections
  drop constraint if exists studio_connections_studio_id_platform_key;
alter table public.studio_connections
  add constraint studio_connections_entity_platform_key
  unique nulls not distinct (artist_id, studio_id, platform);
create index if not exists studio_connections_artist_idx
  on public.studio_connections (artist_id);

-- Reusable checkout URL so an abandoned customer can resume payment.
alter table public.appointments
  add column if not exists deposit_checkout_url text;

-- Hourly: unpaid holds release their slot. deposit_status stays 'pending' so a
-- late webhook payment maps to refund_due instead of disappearing.
do $$
begin
  perform cron.unschedule('release-deposit-holds');
exception when others then
  null;
end $$;

select cron.schedule(
  'release-deposit-holds',
  '5 * * * *',
  $$update public.appointments
      set status = 'cancelled',
          cancelled_by = 'customer',
          cancellation_reason = 'Deposit hold expired'
    where status = 'pending_deposit' and hold_expires_at < now()$$
);
