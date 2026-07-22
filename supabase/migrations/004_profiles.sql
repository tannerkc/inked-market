-- Profiles: 1:1 with auth.users. Replaces the user_metadata blob so role/plan/
-- prefs are queryable and RLS-able. Auto-created on signup + backfilled.

-- Shared updated_at trigger (reused by later migrations)
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  role               text not null default 'customer' check (role in ('customer','artist','studio')),
  name               text,
  avatar_url         text,
  tier               text check (tier in ('liner','shader','magnum')),
  billing_cycle      text not null default 'monthly' check (billing_cycle in ('monthly','annual')),
  billing_status     text not null default 'draft'   check (billing_status in ('active','cancelled','draft')),
  next_billing_date  timestamptz,
  cancelled_at       timestamptz,
  notifications      jsonb not null default '{}',
  privacy            jsonb not null default '{}',
  connected_accounts jsonb not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create trigger trg_profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Users read own profile" on public.profiles
  for select using (id = auth.uid());
create policy "Users insert own profile" on public.profiles
  for insert with check (id = auth.uid());
create policy "Users update own profile" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Auto-create a profile when a new auth user signs up, seeded from metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    case when new.raw_user_meta_data->>'role' in ('customer','artist','studio')
         then new.raw_user_meta_data->>'role' else 'customer' end,
    coalesce(new.raw_user_meta_data->>'name',
             new.raw_user_meta_data->>'full_name',
             split_part(coalesce(new.email,''), '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for users that already exist.
insert into public.profiles (id, role, name)
select id,
  case when raw_user_meta_data->>'role' in ('customer','artist','studio')
       then raw_user_meta_data->>'role' else 'customer' end,
  coalesce(raw_user_meta_data->>'name',
           raw_user_meta_data->>'full_name',
           split_part(coalesce(email,''), '@', 1))
from auth.users
on conflict (id) do nothing;
