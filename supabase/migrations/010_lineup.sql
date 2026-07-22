-- Editorial "Lineup" zine: spotlights, articles, events, and weekly issues.
-- issue_entries composes an issue's ordered collections (news, radar, picks,
-- events) from the content tables. Public read; editor writes via service role.

create table if not exists public.spotlights (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  type        text not null check (type in ('artist','studio')),
  name        text not null,
  tagline     text,
  image       text,
  location    text,
  specialties text[] not null default '{}',
  badges      jsonb not null default '[]',
  excerpt     text,
  content     jsonb not null default '{}',  -- {sections:[{title,body}], pullQuote, portfolioImages:[], profileLink}
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create trigger trg_spotlights_updated before update on public.spotlights
  for each row execute function public.set_updated_at();

create table if not exists public.lineup_articles (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  category       text,
  headline       text not null,
  excerpt        text,
  body           text,
  read_time      text,
  published_date text,
  created_at     timestamptz not null default now()
);

create table if not exists public.lineup_events (
  id         uuid primary key default gen_random_uuid(),
  type       text not null check (type in ('flash','guest-spot','sale','opening')),
  title      text not null,
  details    text,
  event_date text,
  location   text,
  studio_id  uuid references public.studios(id) on delete set null,
  artist_id  uuid references public.artists(id) on delete set null,
  cta_label  text,
  created_at timestamptz not null default now()
);

create table if not exists public.lineup_issues (
  id                 uuid primary key default gen_random_uuid(),
  number             int not null,
  issue_date         text,
  cover_story_id     uuid references public.spotlights(id) on delete set null,
  studio_of_week_id  uuid references public.spotlights(id) on delete set null,
  culture_article_id uuid references public.lineup_articles(id) on delete set null,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create trigger trg_issues_updated before update on public.lineup_issues
  for each row execute function public.set_updated_at();

create table if not exists public.issue_entries (
  id         uuid primary key default gen_random_uuid(),
  issue_id   uuid not null references public.lineup_issues(id) on delete cascade,
  section    text not null check (section in ('news','radar','picks','events')),
  entry_type text not null check (entry_type in ('article','event','artist','studio','spotlight')),
  entry_id   uuid not null,
  position   int not null default 0
);
create index if not exists idx_issue_entries_issue on public.issue_entries(issue_id);

-- RLS: public read; writes via service role only (editor-managed).
alter table public.spotlights      enable row level security;
alter table public.lineup_articles enable row level security;
alter table public.lineup_events   enable row level security;
alter table public.lineup_issues   enable row level security;
alter table public.issue_entries   enable row level security;

create policy "Public read spotlights"     on public.spotlights      for select using (true);
create policy "Public read lineup articles" on public.lineup_articles for select using (true);
create policy "Public read lineup events"   on public.lineup_events   for select using (true);
create policy "Public read lineup issues"   on public.lineup_issues   for select using (true);
create policy "Public read issue entries"   on public.issue_entries   for select using (true);
