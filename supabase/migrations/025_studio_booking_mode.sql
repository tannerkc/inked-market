-- Artist picker on the studio booking form.
-- 'studio' = "through studio page": the artist's effective default — clients
-- pick them on their studio's booking form and the front desk handles it.
alter table public.booking_settings
  drop constraint if exists booking_settings_booking_mode_check;
alter table public.booking_settings
  add constraint booking_settings_booking_mode_check
  check (booking_mode is null or booking_mode in ('inbuilt','external','studio','off'));

-- Studio-level requests can carry the customer's requested artist. The request
-- still routes to the studio (artist_id stays null); this is front-desk color.
alter table public.booking_requests
  add column if not exists preferred_artist_id uuid references public.artists(id) on delete set null;
