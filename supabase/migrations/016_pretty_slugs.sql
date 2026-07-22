-- Regenerate studio slugs as pretty, human URLs: name-city-state
-- (drunken-regurts-raleigh-nc instead of drunken-regurts-c9200c22).
-- Numeric suffixes only on conflict (-2, -3, …). Pre-launch: breaking old
-- slug links is fine; internal links resolve by id first anyway.
with pretty as (
  select
    id,
    created_at,
    trim(both '-' from
      regexp_replace(lower(concat_ws(' ', name, city, state)), '[^a-z0-9]+', '-', 'g')
    ) as base
  from studios
),
dedup as (
  select
    id,
    base,
    row_number() over (partition by base order by created_at, id) as rn
  from pretty
  where base <> ''
)
update studios s
set slug = case when d.rn = 1 then d.base else d.base || '-' || d.rn end
from dedup d
where s.id = d.id;
