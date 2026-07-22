-- Saved items: polymorphic bookmarks (studio | artist | design). Replaces the
-- savedStudioIds/savedArtistIds/savedDesignIds arrays on the Customer type.
create table if not exists public.saved_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entity_type text not null check (entity_type in ('studio','artist','design')),
  entity_id   uuid not null,
  created_at  timestamptz not null default now(),
  unique (user_id, entity_type, entity_id)
);
create index if not exists idx_saved_user on public.saved_items(user_id);

alter table public.saved_items enable row level security;
create policy "Owner manages saved items" on public.saved_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
