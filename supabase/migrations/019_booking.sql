-- Booking system foundation: settings, availability, requests, appointments,
-- projects, flash, audit events, notifications.
-- Spec: docs/superpowers/specs/2026-07-14-booking-system-design.md
-- pg_cron housekeeping jobs land in later migrations with their flows.

create extension if not exists btree_gist;

-- Front-desk grant, given by the artist. Added before the helper functions
-- below: plain-SQL functions are schema-validated at creation time.
alter table public.affiliations
  add column if not exists manage_bookings boolean not null default false;

-- ─── RLS helpers (invoker rights; RLS on artists/studios/affiliations
--     already lets owners read their own rows) ─────────────────────────────
create or replace function public.owns_artist(aid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.artists a
    where a.id = aid and (a.user_id = auth.uid() or a.claimed_by = auth.uid())
  );
$$;

create or replace function public.owns_studio(sid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.studios s
    where s.id = sid and s.claimed_by = auth.uid()
  );
$$;

-- Studio owner has an active affiliation with this artist (read-only roster).
create or replace function public.studio_reads_artist(aid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.affiliations af
    join public.studios s on s.id = af.studio_id
    where af.artist_id = aid and af.status = 'active' and s.claimed_by = auth.uid()
  );
$$;

-- Artist granted this studio booking-management rights (front desk).
create or replace function public.studio_manages_artist(aid uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.affiliations af
    join public.studios s on s.id = af.studio_id
    where af.artist_id = aid and af.status = 'active'
      and af.manage_bookings and s.claimed_by = auth.uid()
  );
$$;

-- ─── booking_settings: one row per bookable entity (artist XOR studio) ────
create table if not exists public.booking_settings (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid unique references public.artists(id) on delete cascade,
  studio_id uuid unique references public.studios(id) on delete cascade,
  accepting_bookings boolean not null default true,
  custom_requests_enabled boolean not null default true,
  consultations_enabled boolean not null default false,
  flash_enabled boolean not null default false,
  walk_ins_enabled boolean not null default false,
  consult_duration_min int not null default 30,
  consult_price_cents int not null default 0,
  consult_location text not null default 'in_person'
    check (consult_location in ('in_person','virtual')),
  default_deposit_cents int not null default 0,
  payment_provider text check (payment_provider in ('stripe','square')),
  slot_granularity_min int not null default 30 check (slot_granularity_min in (15,30,60)),
  buffer_min int not null default 0 check (buffer_min between 0 and 120),
  min_notice_hours int not null default 24 check (min_notice_hours between 0 and 336),
  max_horizon_days int not null default 60 check (max_horizon_days between 1 and 365),
  timezone text not null default 'America/New_York',
  cancellation_policy_text text,
  cancellation_window_hours int not null default 48,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) = 1)
);
create trigger trg_booking_settings_updated before update on public.booking_settings
  for each row execute function public.set_updated_at();

-- ─── availability: weekly template + date exceptions (artist XOR studio) ──
create table if not exists public.availability_rules (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) = 1),
  check (start_time < end_time)
);
create index if not exists idx_avail_rules_artist on public.availability_rules(artist_id);
create index if not exists idx_avail_rules_studio on public.availability_rules(studio_id);

create table if not exists public.availability_overrides (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  date date not null,
  closed boolean not null default true,
  start_time time,
  end_time time,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) = 1),
  check (closed or (start_time is not null and end_time is not null and start_time < end_time)),
  unique nulls not distinct (artist_id, studio_id, date)
);
create index if not exists idx_avail_over_artist on public.availability_overrides(artist_id, date);
create index if not exists idx_avail_over_studio on public.availability_overrides(studio_id, date);

-- ─── flash_items ──────────────────────────────────────────────────────────
create table if not exists public.flash_items (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.artists(id) on delete cascade,
  title text not null,
  image_url text not null,
  price_cents int not null check (price_cents >= 0),
  deposit_cents int not null default 0 check (deposit_cents >= 0),
  duration_min int not null default 60 check (duration_min between 15 and 720),
  active boolean not null default true,
  one_off boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_flash_artist_active on public.flash_items(artist_id) where active;
create trigger trg_flash_items_updated before update on public.flash_items
  for each row execute function public.set_updated_at();

-- ─── booking_requests: custom work asks awaiting artist judgment ──────────
create table if not exists public.booking_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  type text not null default 'custom' check (type in ('custom')),
  description text not null,
  placement text,
  size_category text,
  budget_range text,
  is_color boolean,
  reference_image_urls jsonb not null default '[]',
  preferred_timing text,
  flexible_dates boolean not null default true,
  is_multi_session boolean not null default false,
  estimated_sessions int,
  status text not null default 'pending'
    check (status in ('pending','accepted','declined','withdrawn','expired')),
  expires_at timestamptz not null default now() + interval '14 days',
  response_message text,
  quote_min_cents int,
  quote_max_cents int,
  deposit_cents int,
  scheduling_mode text check (scheduling_mode in ('propose','open_calendar')),
  proposed_times jsonb,
  conversation_id uuid references public.conversations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) >= 1)
);
create index if not exists idx_breq_artist_status on public.booking_requests(artist_id, status);
create index if not exists idx_breq_studio_status on public.booking_requests(studio_id, status);
create index if not exists idx_breq_customer on public.booking_requests(customer_id);
create trigger trg_booking_requests_updated before update on public.booking_requests
  for each row execute function public.set_updated_at();

-- ─── projects: multi-session container ────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.booking_requests(id) on delete set null,
  customer_id uuid references auth.users(id) on delete set null,
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  title text not null,
  status text not null default 'active'
    check (status in ('active','completed','cancelled','paused')),
  estimated_sessions int,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (num_nonnulls(artist_id, studio_id) >= 1)
);
create index if not exists idx_projects_artist on public.projects(artist_id);
create index if not exists idx_projects_customer on public.projects(customer_id);
create trigger trg_projects_updated before update on public.projects
  for each row execute function public.set_updated_at();

-- ─── appointments: everything with a concrete time ────────────────────────
-- customer_id nullable + customer_name: front-desk walk-ins may have no account.
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text,
  artist_id uuid references public.artists(id) on delete cascade,
  studio_id uuid references public.studios(id) on delete cascade,
  request_id uuid references public.booking_requests(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  flash_item_id uuid references public.flash_items(id) on delete set null,
  type text not null check (type in ('consultation','flash','session','walk_in')),
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null,
  status text not null default 'confirmed'
    check (status in ('pending_deposit','confirmed','completed','cancelled','no_show')),
  cancelled_by text check (cancelled_by in ('customer','artist','studio')),
  cancellation_reason text,
  price_cents int,
  deposit_cents int not null default 0,
  deposit_status text not null default 'not_required'
    check (deposit_status in ('not_required','pending','paid','waived','refund_due','refunded')),
  deposit_provider text check (deposit_provider in ('stripe','square','manual')),
  deposit_checkout_id text,
  deposit_paid_at timestamptz,
  hold_expires_at timestamptz,
  notes text,
  customer_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (start_at < end_at),
  check (num_nonnulls(artist_id, studio_id) >= 1),
  check (customer_id is not null or customer_name is not null),
  -- The no-double-booking guarantee: an artist's active appointments can
  -- never overlap, even under concurrent inserts. Studio-only rows (walk-ins)
  -- are exempt — studios run multiple chairs.
  constraint no_artist_overlap exclude using gist (
    artist_id with =,
    tstzrange(start_at, end_at) with &&
  ) where (artist_id is not null and status in ('pending_deposit','confirmed'))
);
create index if not exists idx_appt_artist_start on public.appointments(artist_id, start_at);
create index if not exists idx_appt_studio_start on public.appointments(studio_id, start_at);
create index if not exists idx_appt_customer_start on public.appointments(customer_id, start_at);
create index if not exists idx_appt_active on public.appointments(artist_id, start_at)
  where status in ('pending_deposit','confirmed');
create trigger trg_appointments_updated before update on public.appointments
  for each row execute function public.set_updated_at();

-- ─── booking_events: append-only audit (service-role writes only) ─────────
create table if not exists public.booking_events (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete cascade,
  request_id uuid references public.booking_requests(id) on delete cascade,
  actor_id uuid,
  actor_role text,
  event_type text not null,
  data jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index if not exists idx_bevents_appt on public.booking_events(appointment_id);
create index if not exists idx_bevents_req on public.booking_events(request_id);

-- ─── notifications: in-app bell + future reminder outbox ──────────────────
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}',
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at desc);

-- ─── RLS ──────────────────────────────────────────────────────────────────
alter table public.booking_settings       enable row level security;
alter table public.availability_rules     enable row level security;
alter table public.availability_overrides enable row level security;
alter table public.flash_items            enable row level security;
alter table public.booking_requests       enable row level security;
alter table public.projects               enable row level security;
alter table public.appointments           enable row level security;
alter table public.booking_events         enable row level security;
alter table public.notifications          enable row level security;

-- Settings + availability: public read (booking pages need them), owner writes.
create policy "Public read booking settings" on public.booking_settings
  for select using (true);
create policy "Owner manages booking settings" on public.booking_settings
  for all using (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

create policy "Public read availability rules" on public.availability_rules
  for select using (true);
create policy "Owner manages availability rules" on public.availability_rules
  for all using (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

create policy "Public read availability overrides" on public.availability_overrides
  for select using (true);
create policy "Owner manages availability overrides" on public.availability_overrides
  for all using (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and public.owns_artist(artist_id))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

-- Flash: public read active items; owning artist manages.
create policy "Public read active flash" on public.flash_items
  for select using (active = true or public.owns_artist(artist_id));
create policy "Artist manages flash" on public.flash_items
  for all using (public.owns_artist(artist_id))
  with check (public.owns_artist(artist_id));

-- Requests: parties + roster studios read; customer creates; parties update.
create policy "Parties read requests" on public.booking_requests
  for select using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_reads_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Customer creates request" on public.booking_requests
  for insert to authenticated with check (customer_id = auth.uid());
create policy "Parties update request" on public.booking_requests
  for update using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

-- Projects: same party model as requests.
create policy "Parties read projects" on public.projects
  for select using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_reads_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Providers manage projects" on public.projects
  for all using (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );

-- Appointments: parties + roster read; customer books own; providers manage.
create policy "Parties read appointments" on public.appointments
  for select using (
    customer_id = auth.uid()
    or (artist_id is not null and (public.owns_artist(artist_id) or public.studio_reads_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Customer books appointment" on public.appointments
  for insert to authenticated with check (customer_id = auth.uid());
create policy "Providers manage appointments" on public.appointments
  for all using (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  ) with check (
    (artist_id is not null and (public.owns_artist(artist_id) or public.studio_manages_artist(artist_id)))
    or (studio_id is not null and public.owns_studio(studio_id))
  );
create policy "Customer updates own appointment" on public.appointments
  for update using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- Events: parties read; writes are service-role only (no insert/update policies).
create policy "Parties read booking events" on public.booking_events
  for select using (
    (appointment_id is not null and exists (
      select 1 from public.appointments ap where ap.id = appointment_id and (
        ap.customer_id = auth.uid()
        or (ap.artist_id is not null and public.owns_artist(ap.artist_id))
        or (ap.studio_id is not null and public.owns_studio(ap.studio_id))
      )
    ))
    or (request_id is not null and exists (
      select 1 from public.booking_requests br where br.id = request_id and (
        br.customer_id = auth.uid()
        or (br.artist_id is not null and public.owns_artist(br.artist_id))
        or (br.studio_id is not null and public.owns_studio(br.studio_id))
      )
    ))
  );

-- Notifications: user reads/updates own; inserts are service-role only.
create policy "User reads own notifications" on public.notifications
  for select using (user_id = auth.uid());
create policy "User marks notifications read" on public.notifications
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
