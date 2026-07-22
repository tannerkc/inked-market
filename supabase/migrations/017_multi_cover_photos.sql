-- Dedicated cover photos for multi-photo heroes (heroCoverMode "multi").
-- Shared studio content like images[]/cover_image — not per-template config.
alter table public.studios
  add column if not exists cover_images text[] not null default '{}';
