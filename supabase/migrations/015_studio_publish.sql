-- Draft → live split for the studio site builder.
-- theme_config stays the owner's private working draft (Save Draft);
-- published_theme_config is the version the public /studios/[id] page renders.
-- NULL published_theme_config = never published — the public page falls back
-- to the basic profile-style listing instead of the custom builder site.
alter table studios
  add column published_theme_config jsonb,
  add column published_at timestamptz;
