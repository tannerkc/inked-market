-- Reviews: polymorphic (studio | artist). Aggregates (rating, review_count) stay
-- denormalized on the target, maintained by trigger. Verified-booking-only:
-- no client write policy -- inserts happen via service role / server actions.

create table if not exists public.reviews (
  id           uuid primary key default gen_random_uuid(),
  target_type  text not null check (target_type in ('studio','artist')),
  target_id    uuid not null,
  author_id    uuid references auth.users(id) on delete set null,
  author_name  text,
  author_image text,
  rating       int not null check (rating between 1 and 5),
  title        text,
  content      text,
  images       text[] not null default '{}',
  verified     boolean not null default false,
  source       text not null default 'inked-market'
                 check (source in ('inked-market','google','yelp','trustpilot')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists idx_reviews_target on public.reviews(target_type, target_id);
create trigger trg_reviews_updated before update on public.reviews
  for each row execute function public.set_updated_at();

-- Recompute a target's aggregate rating + count.
create or replace function public.refresh_review_aggregate(p_type text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_avg float4; v_count int;
begin
  select round(avg(rating)::numeric, 2)::float4, count(*)
    into v_avg, v_count
  from public.reviews where target_type = p_type and target_id = p_id;
  if p_type = 'studio' then
    update public.studios set rating = v_avg, review_count = coalesce(v_count, 0) where id = p_id;
  elsif p_type = 'artist' then
    update public.artists set rating = v_avg, review_count = coalesce(v_count, 0) where id = p_id;
  end if;
end;
$$;

create or replace function public.on_review_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_review_aggregate(old.target_type, old.target_id);
    return old;
  end if;
  perform public.refresh_review_aggregate(new.target_type, new.target_id);
  if tg_op = 'UPDATE'
     and (old.target_type, old.target_id) is distinct from (new.target_type, new.target_id) then
    perform public.refresh_review_aggregate(old.target_type, old.target_id);
  end if;
  return new;
end;
$$;

create trigger trg_reviews_aggregate
  after insert or update or delete on public.reviews
  for each row execute function public.on_review_change();

alter table public.reviews enable row level security;
create policy "Public read reviews" on public.reviews
  for select using (true);
-- Intentionally no INSERT/UPDATE/DELETE policy: writes via service role only.
