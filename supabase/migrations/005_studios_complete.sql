-- Close the studios persistence gap: columns the repository mapper was silently
-- dropping (social, services, auto_specialties, integrations) plus the builder
-- theme config and a short description. All additive.
alter table public.studios
  add column if not exists description      text,
  add column if not exists instagram        text,
  add column if not exists tiktok           text,
  add column if not exists facebook         text,
  add column if not exists services         text[] not null default '{}',
  add column if not exists auto_specialties boolean not null default false,
  add column if not exists integrations     jsonb  not null default '{}',
  add column if not exists theme_config     jsonb  not null default '{}';
