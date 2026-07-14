-- Booking mode: explicit choice between inbuilt, external link-out, or off.
-- NULL = not yet chosen (drives the dashboard prompt).
-- Spec: docs/superpowers/specs/2026-07-14-booking-mode-dynamic-cta-design.md
alter table public.booking_settings
  add column if not exists booking_mode text
  check (booking_mode is null or booking_mode in ('inbuilt','external','off'));
alter table public.booking_settings
  add column if not exists external_booking_url text;

-- Existing rows were configured deliberately during the pre-mode era.
update public.booking_settings set booking_mode = 'inbuilt' where booking_mode is null;
