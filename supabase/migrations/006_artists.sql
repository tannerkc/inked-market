-- Artists (first-class), their portfolio images, and the artist<->studio
-- affiliation join (handles guest-spots / multi-studio without forcing single-shop).

create table if not exists public.artists (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete set null,
  name             text not null,
  slug             text unique not null,
  bio              text,
  profile_image    text,
  cover_image      text,
  studio_id        uuid references public.studios(id) on delete set null,
  specialties      text[] not null default '{}',
  styles           text[] not null default '{}',
  instagram        text,
  website          text,
  tiktok           text,
  facebook         text,
  rating           float4,
  review_count     int not null default 0,
  verified         boolean not null default false,
  years_experience int,
  certifications   text[] not null default '{}',
  city             text,
  state            text,
  source           text not null default 'organic' check (source in ('google','organic')),
  claimed_by       uuid references auth.users(id) on delete set null,
  is_visible       boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists idx_artists_slug       on public.artists(slug);
create index if not exists idx_artists_studio     on public.artists(studio_id);
create index if not exists idx_artists_user       on public.artists(user_id);
create index if not exists idx_artists_visible    on public.artists(is_visible);
create index if not exists idx_artists_styles     on public.artists using gin(styles);
create index if not exists idx_artists_city_state on public.artists(city, state);
create trigger trg_artists_updated before update on public.artists
  for each row execute function public.set_updated_at();

create table if not exists public.portfolio_images (
  id          uuid primary key default gen_random_uuid(),
  artist_id   uuid not null references public.artists(id) on delete cascade,
  url         text not null,
  title       text,
  description text,
  tags        text[] not null default '{}',
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists idx_portfolio_artist on public.portfolio_images(artist_id);
create index if not exists idx_portfolio_tags   on public.portfolio_images using gin(tags);

create table if not exists public.affiliations (
  id         uuid primary key default gen_random_uuid(),
  artist_id  uuid not null references public.artists(id) on delete cascade,
  studio_id  uuid not null references public.studios(id) on delete cascade,
  status     text not null check (status in ('pending-invite','pending-request','active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, studio_id)
);
create index if not exists idx_affiliations_artist on public.affiliations(artist_id);
create index if not exists idx_affiliations_studio on public.affiliations(studio_id);
create trigger trg_affiliations_updated before update on public.affiliations
  for each row execute function public.set_updated_at();

-- RLS ----------------------------------------------------------------------
alter table public.artists         enable row level security;
alter table public.portfolio_images enable row level security;
alter table public.affiliations    enable row level security;

-- Artists: anyone reads visible; owner reads/updates own; authenticated insert.
create policy "Public read visible artists" on public.artists
  for select using (is_visible = true);
create policy "Owners read own artist" on public.artists
  for select using (user_id = auth.uid() or claimed_by = auth.uid());
create policy "Owners update own artist" on public.artists
  for update using (user_id = auth.uid() or claimed_by = auth.uid())
  with check (user_id = auth.uid() or claimed_by = auth.uid());
create policy "Authenticated insert artists" on public.artists
  for insert to authenticated with check (true);

-- Portfolio: public read; only the owning artist manages.
create policy "Public read portfolio" on public.portfolio_images
  for select using (true);
create policy "Artist owner manages portfolio" on public.portfolio_images
  for all using (
    exists (select 1 from public.artists a
            where a.id = artist_id and (a.user_id = auth.uid() or a.claimed_by = auth.uid()))
  ) with check (
    exists (select 1 from public.artists a
            where a.id = artist_id and (a.user_id = auth.uid() or a.claimed_by = auth.uid()))
  );

-- Affiliations: readable if active or you're a party; managed by either party.
create policy "Read affiliations" on public.affiliations
  for select using (
    status = 'active'
    or exists (select 1 from public.artists a where a.id = artist_id and (a.user_id = auth.uid() or a.claimed_by = auth.uid()))
    or exists (select 1 from public.studios s where s.id = studio_id and s.claimed_by = auth.uid())
  );
create policy "Parties manage affiliations" on public.affiliations
  for all using (
    exists (select 1 from public.artists a where a.id = artist_id and (a.user_id = auth.uid() or a.claimed_by = auth.uid()))
    or exists (select 1 from public.studios s where s.id = studio_id and s.claimed_by = auth.uid())
  ) with check (
    exists (select 1 from public.artists a where a.id = artist_id and (a.user_id = auth.uid() or a.claimed_by = auth.uid()))
    or exists (select 1 from public.studios s where s.id = studio_id and s.claimed_by = auth.uid())
  );
