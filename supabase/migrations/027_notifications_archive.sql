-- Archive support for the notification bell. RLS: the existing
-- "User marks notifications read" update policy already covers this column.
alter table public.notifications add column if not exists archived_at timestamptz;
