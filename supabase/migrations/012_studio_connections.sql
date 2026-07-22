-- OAuth tokens for third-party account links (Square, Calendly, Meta).
-- SECURITY: this table is service-role only. RLS is enabled with NO policies,
-- so anon/authenticated clients can never read tokens. All client-visible
-- connection state lives in the studios.integrations jsonb projection.
create table if not exists studio_connections (
  id uuid primary key default gen_random_uuid(),
  studio_id uuid not null references studios(id) on delete cascade,
  platform text not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  scope text,
  external_account_id text,
  external_account_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (studio_id, platform)
);

alter table studio_connections enable row level security;

create index if not exists studio_connections_studio_idx
  on studio_connections (studio_id);
