-- One-shot custom URLs (LinkedIn-style): owners may change their slug ONCE.
-- The trigger is the real enforcement — RLS lets owners update their own rows
-- directly, so app-side checks alone can't guarantee the once-only rule.
-- The auto-generated name-city-state slug set at INSERT does not count;
-- only an UPDATE that changes the slug consumes the customization.

alter table public.studios add column if not exists slug_customized_at timestamptz;
alter table public.artists add column if not exists slug_customized_at timestamptz;

create or replace function public.enforce_slug_change_once()
returns trigger
language plpgsql
as $$
begin
  if new.slug is distinct from old.slug then
    if old.slug_customized_at is not null then
      raise exception 'URL_ALREADY_CUSTOMIZED';
    end if;
    new.slug_customized_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists studios_slug_change_once on public.studios;
create trigger studios_slug_change_once
  before update on public.studios
  for each row execute function public.enforce_slug_change_once();

drop trigger if exists artists_slug_change_once on public.artists;
create trigger artists_slug_change_once
  before update on public.artists
  for each row execute function public.enforce_slug_change_once();
