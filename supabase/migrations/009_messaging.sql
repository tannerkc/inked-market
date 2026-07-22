-- Direct messaging: conversations (participant array + per-user unread map) and
-- messages. RLS scopes everything to conversation participants.

create table if not exists public.conversations (
  id              uuid primary key default gen_random_uuid(),
  participant_ids uuid[] not null,
  last_message_at timestamptz not null default now(),
  last_message    text,
  unread_count    jsonb not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_conversations_participants on public.conversations using gin(participant_ids);
create trigger trg_conversations_updated before update on public.conversations
  for each row execute function public.set_updated_at();

create table if not exists public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id       uuid not null references auth.users(id) on delete cascade,
  content         text not null,
  read            boolean not null default false,
  attachments     text[] not null default '{}',
  created_at      timestamptz not null default now()
);
create index if not exists idx_messages_conversation on public.messages(conversation_id);

alter table public.conversations enable row level security;
alter table public.messages      enable row level security;

create policy "Participants read conversations" on public.conversations
  for select using (auth.uid() = any(participant_ids));
create policy "Participants create conversations" on public.conversations
  for insert to authenticated with check (auth.uid() = any(participant_ids));
create policy "Participants update conversations" on public.conversations
  for update using (auth.uid() = any(participant_ids))
  with check (auth.uid() = any(participant_ids));

create policy "Participants read messages" on public.messages
  for select using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id and auth.uid() = any(c.participant_ids))
  );
create policy "Sender sends messages" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid()
    and exists (select 1 from public.conversations c
                where c.id = conversation_id and auth.uid() = any(c.participant_ids))
  );
create policy "Participants update messages" on public.messages
  for update using (
    exists (select 1 from public.conversations c
            where c.id = conversation_id and auth.uid() = any(c.participant_ids))
  );
